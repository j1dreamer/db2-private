import tempfile,unittest,asyncio,shutil,json,subprocess,time
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server import arena
from server.battle import simulate
from server.profile import character
from server.progression import learn_skills,friendships
from server.rules import constants
from tools.client_patches import patch_arena_transport

class ArenaTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.p=self.store.create_player(1,'Goku');self.p.update(level=100,gem=10000);self.p['vip']['level']=2
  role=self.p['team']['roles']['1'];role.update(level=100,star=5);learn_skills(role);friendships(self.p);self.store.save(self.p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup()
 async def call(self,action,args=None):return await arena.handle(self.store,1,'logic.arenaHandler.'+action,args or {})
 async def begin(self):
  await self.call('info');matched=await self.call('match');target=matched['_temp']['smaller']['playerId'];args={'defenderId':target,'attackTeamIndexs':[1],'attackShipIndexs':[]};return args,await self.call('choose',args)
 async def test_info_match_defense_and_buy_limits_are_persisted(self):
  info=await self.call('info');self.assertEqual(info['arena']['rank'],21)
  r=await self.call('match');self.assertEqual(len({r['_temp'][key]['playerId']for key in ('smaller','middle','larger')}),3)
  await self.call('setDefenseTeamIndexs',{'defenseTeamIndexs':[1],'defenseShipIndexs':[]})
  target=r['_temp']['smaller']['playerId'];self.assertTrue((await self.call('defenseTeam',{'playerId':target,'isShow':True}))['_temp']['defenseTeam']['roles'])
  with self.assertRaises(ValueError):await self.call('buyChallengeTimes')
  p=self.store.player(1);p['arena']['remainingChallengeTimes']=0;self.store.save(p);r=await self.call('buyChallengeTimes');self.assertEqual(r['gem'],9950);self.assertEqual(r['arena']['remainingChallengeTimes'],1)
 async def test_choose_same_attempt_reuses_seed_and_does_not_charge_again(self):
  args,r=await self.begin();again=await self.call('choose',args);self.assertEqual(r['_temp']['seed'],again['_temp']['seed']);self.assertEqual(self.store.player(1)['arena']['remainingChallengeTimes'],4)
  for change in ({'attackTeamIndexs':[999]},{'attackTeamIndexs':[1,1]},{'defenderId':1}):
   with self.assertRaises(ValueError):await self.call('choose',{**args,**change})
  self.assertEqual(self.store.player(1)['arena']['remainingChallengeTimes'],4)
 async def test_expired_or_foreign_reports_and_locked_level_are_rejected(self):
  args,r=await self.begin();self.store.db.execute('UPDATE pvp_runs SET expires=0')
  with self.assertRaises(ValueError):await self.call('challenge',{**args,'seed':r['_temp']['seed'],'isWin':True,'bgImgId':103})
  with self.assertRaises(ValueError):await self.call('report',{'id':'foreign'})
  p=self.store.player(1);p['level']=1;self.store.save(p)
  with self.assertRaises(ValueError):await self.call('info')
 @unittest.skipUnless(shutil.which('node'),'Node required for original PvP replay')
 async def test_original_engine_validates_rank_reward_and_report_once(self):
  args,r=await self.begin();temp=r['_temp'];outcome=await asyncio.to_thread(simulate,{'mode':'pvp','team':arena.combat_raw(temp['attackTeam']),'defender':arena.combat_raw(temp['defenseTeam']),'seed':temp['seed']});self.assertTrue(outcome['isWin'])
  result_args={**args,'seed':temp['seed'],'isWin':outcome['isWin'],'damageMap':{'forged':999999},'bgImgId':constants('battle.ARENA_BACKGROUND_IMG_IDS')[0]}
  with self.assertRaises(ValueError):await self.call('challenge',{**result_args,'seed':temp['seed']+1})
  result=await self.call('challenge',result_args);self.assertLess(result['_temp']['rank'],21);self.assertTrue(result['_temp']['entityCountMap'])
  with self.assertRaises(ValueError):await self.call('challenge',result_args)
  reports=(await self.call('reportList'))['_temp']['reportList'];self.assertEqual(len(reports),1)
  report=(await self.call('report',{'id':reports[0]['id']}))['_temp']['report'];self.assertEqual(report['seed'],temp['seed']);self.assertNotIn('forged',report['damageMap'])
  with self.assertRaises(ValueError):await self.call('report',{'id':'not-my-report'})
 async def test_daily_settlement_uses_source_rewards_and_is_once(self):
  await self.call('info');p=self.store.player(1);p['privateArenaSettlementDay']='2000-01-01';self.store.save(p)
  self.assertEqual(len(self.store.player(1)['extra']['mails']),1);self.assertEqual(len(self.store.player(1)['extra']['mails']),1)
  mail=self.store.player(1)['extra']['mails'][0];self.assertTrue(mail['dropList']);self.assertTrue(mail['isSys']);self.assertEqual(self.store.player(1)['arena']['dailyRank'],21)
 def test_client_uses_server_seed_and_private_npc_id_domain(self):
  source=(Path(__file__).resolve().parent.parent/'client/main.decoded.js').read_text();patched=patch_arena_transport(source)
  self.assertIn('pkBattleInstant(l.clone(i), l.clone(o), e._temp.seed)',patched);self.assertIn('return e < 0;',patched)
  if shutil.which('node'):subprocess.run(['node','--check'],input=patched,text=True,capture_output=True,check=True)
