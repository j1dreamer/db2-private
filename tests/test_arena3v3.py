import tempfile,unittest,shutil,json,subprocess,time,asyncio
from pathlib import Path
from server.storage import Store
from server.profile import character,table
from server.progression import learn_skills,friendships
from server import arena3v3,arena
from server.battle import simulate
from tools.client_patches import patch_arena3v3_transport

class ArenaThreeTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Goku');p.update(level=100,gem=10000);p['vip']['level']=5
  p['team']['roles']['2']=character(100801,2);p['team']['roles']['3']=character(101101,3)
  extras=[i for i in range(1,16)if i not in (1,8,11)]
  for idx,class_id in enumerate(extras,4):p['team']['roles'][str(idx)]=character(min(r['kindId']for r in table('role')if r['classId']==class_id),idx)
  for role in p['team']['roles'].values():role.update(level=100,star=5);learn_skills(role)
  friendships(p);self.store.save(p);self.roles={str(i):[str(i)]for i in range(1,4)};self.ships={str(i):[]for i in range(1,4)};self.seen=set()
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup()
 async def call(self,action,args=None):
  route='logic.arena3v3Handler.'+action;r=await arena3v3.handle(self.store,1,route,args or {});self.assertEqual(r['code'],200);self.seen.add(route);return r
 def promote(self):
  p=self.store.player(1);level=arena3v3.bracket(p['level']);row=self.store.db.execute('SELECT player FROM multi_ladder WHERE mode=?AND bracket=?AND rank=1',('arena3v3',level)).fetchone();old=p['arena3v3']['rank']
  with self.store.transaction():
   self.store.db.execute('UPDATE multi_ladder SET rank=0 WHERE mode=?AND bracket=?AND player=1',('arena3v3',level));self.store.db.execute('UPDATE multi_ladder SET rank=?WHERE mode=?AND bracket=?AND player=?',(old,'arena3v3',level,row['player']));self.store.db.execute('UPDATE multi_ladder SET rank=1 WHERE mode=?AND bracket=?AND player=1',('arena3v3',level))
 @unittest.skipUnless(shutil.which('node'),'Node required for real best-of-three replay')
 async def test_all_twelve_routes_have_successful_durable_paths(self):
  r=await self.call('info');self.assertEqual(r['arena3v3']['rank'],21);self.assertEqual(len(r['arena3v3']['playerInfoMap']),6)
  await self.call('setDefenseTeamIndexsMap',{'defenseTeamIndexsMap':self.roles,'defenseShipIndexsMap':self.ships})
  match=await self.call('match');target=match['_temp']['smaller']['playerId'];self.assertLess(target,0)
  defense=await self.call('defenseTeam',{'playerId':target});self.assertEqual(set(defense['_temp']['defenseTeam']['rolesMap']),{'1','2','3'})
  p=self.store.player(1);p['arena3v3']['remainingChallengeTimes']=0;self.store.save(p);self.assertEqual((await self.call('buyChallengeTimes'))['gem'],9950)
  args={'defenderId':target,'attackTeamIndexsMap':self.roles,'attackShipIndexsMap':self.ships};chosen=await self.call('choose',args);again=await self.call('choose',args);self.assertEqual(chosen['_temp']['seed'],again['_temp']['seed'])
  row=self.store.db.execute('SELECT data FROM pvp_runs WHERE player=1 AND mode=?',('arena3v3',)).fetchone();run=json.loads(row['data']);win,win_map,damage=await arena3v3.replay(run);self.assertTrue(win)
  challenge={**args,'seed':run['seed'],'isWin':win,'winPlayerIdMap':win_map,'damageMapMap':{'forged':{}},'bgImgId':103}
  result=await self.call('challenge',challenge);self.assertLess(result['_temp']['rank'],21)
  with self.assertRaises(ValueError):await self.call('challenge',challenge)
  logs=(await self.call('reportList'))['_temp']['reportList'];self.assertTrue(logs[0]['is3v3'])
  report=(await arena.handle(self.store,1,'logic.arenaHandler.report',{'id':logs[0]['id']}))['_temp']['report'];self.assertEqual(report['winPlayerIdMap'],win_map);self.assertNotIn('forged',report['damageMapMap'])
  p=self.store.player(1);rate=p['arena3v3']['hourCoin'];p['private3v3CoinClock']=int(time.time()*1000)-7200000;self.store.save(p)
  self.assertEqual((await self.call('receive'))['_temp']['entityCountMap'],{'106':2*rate})
  with self.assertRaises(ValueError):await self.call('receive')
  self.promote();level=arena3v3.bracket(100);self.assertGreater((await self.call('worshipStatue',{'levelType':level}))['_temp']['entityCountMap']['101'],0)
  with self.assertRaises(ValueError):await self.call('worshipStatue',{'levelType':level})
  self.assertEqual((await self.call('top50',{'levelType':level}))['_temp']['list'][0]['playerId'],1)
  self.assertEqual((await self.call('worshipRank'))['_temp']['list'][0]['value'],1)
  self.assertEqual(self.seen,arena3v3.ROUTES)
 async def test_duplicate_roles_cross_bracket_and_bad_teams_are_rejected(self):
  await self.call('info')
  for roles in ({'1':[1],'2':[1],'3':[2]},{'1':[1],'2':[2]},[],{}):
   with self.assertRaises(ValueError):await self.call('setDefenseTeamIndexsMap',{'defenseTeamIndexsMap':roles,'defenseShipIndexsMap':{}})
  other_level='level_40_59';target=self.store.db.execute('SELECT player FROM multi_ladder WHERE mode=?AND bracket=?LIMIT 1',('arena3v3',other_level)).fetchone()[0]
  with self.assertRaises(ValueError):await self.call('choose',{'defenderId':target,'attackTeamIndexsMap':self.roles,'attackShipIndexsMap':self.ships})
  self.assertEqual(self.store.player(1)['arena3v3']['remainingChallengeTimes'],5)
  p=self.store.player(1);p['team']['roles'].pop('15');self.store.save(p)
  with self.assertRaises(ValueError):await self.call('info')
 async def test_coin_cap_and_receive_are_persistent_without_double_accrual(self):
  await self.call('info');p=self.store.player(1);p['private3v3CoinClock']=int(time.time()*1000)-100*3600000;rate=p['arena3v3']['hourCoin'];self.store.save(p)
  r=await self.call('receive');self.assertEqual(r['_temp']['entityCountMap'],{'106':24*rate})
  self.assertEqual(self.store.player(1)['arena3v3']['receiveCoin'],0)
 @unittest.skipUnless(shutil.which('node'),'Node required for original engine comparison')
 async def test_batched_replay_matches_individual_original_engine_rounds(self):
  await self.call('info');target=(await self.call('match'))['_temp']['smaller']['playerId'];await self.call('choose',{'defenderId':target,'attackTeamIndexsMap':self.roles,'attackShipIndexsMap':self.ships})
  run=json.loads(self.store.db.execute('SELECT data FROM pvp_runs WHERE player=1 AND mode=?',('arena3v3',)).fetchone()[0]);overall,win_map,damage=await arena3v3.replay(run)
  for key in win_map:
   outcome=await asyncio.to_thread(simulate,{'mode':'pvp','team':arena3v3.round_team(run['attack'],key),'defender':arena3v3.round_team(run['defense'],key),'seed':run['seed']})
   self.assertEqual(win_map[key],run['attack']['playerId']if outcome['isWin']else run['defense']['playerId']);self.assertEqual(damage[key],outcome['damageMap'])
 @unittest.skipUnless(shutil.which('node'),'Node required for recovered UI generator')
 async def test_original_ui_generator_and_transport_accept_server_data(self):
  await self.call('info');p=self.store.player(1);payload={'profile':p,'checkTeam':True,'checkArena3v3':True}
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);state=json.loads(result.stdout)
  self.assertEqual(set(state['arenaThree']['roleItemsMap']),{'1','2','3'});self.assertEqual(state['arenaThree']['buyTimesCostGem'],50)
  source=(Path(__file__).resolve().parent.parent/'client/main.decoded.js').read_text();patched=patch_arena3v3_transport(source);self.assertIn('var n = e._temp.seed, o, h = e._temp.attackTeam',patched);subprocess.run(['node','--check'],input=patched,text=True,capture_output=True,check=True)
