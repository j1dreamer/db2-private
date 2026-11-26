import asyncio,datetime,json,subprocess,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server import bosses,guild
from server.profile import character,table
from server.battle import simulate
from server.progression import learn_skills
from tools.client_patches import patch_boss_transport

class BossTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.stamp=datetime.datetime(2026,11,25,10,tzinfo=bosses.TZ).timestamp();self.clock=patch('time.time',return_value=self.stamp);self.clock.start()
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Tester');p.update(level=65,gem=10000)
  kinds=[next(r['kindId']for r in table('role')if r['classId']==cls)for cls in (22,24,28,34,35)]
  p['team']['roles']={}
  for idx,kind in enumerate(kinds,1):
   r=character(kind,idx);r.update(level=65,star=5);learn_skills(r);r['attr'].update(hp=100000,atk=10000);p['team']['roles'][str(idx)]=r
  self.store.save(p);guild.handle(self.store,1,'logic.guildHandler.create',{'name':'Saiyans','badgeId':1});self.seen=set()
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup();self.clock.stop()
 async def call(self,mode,action,args=None):
  route='logic.'+mode+'Handler.'+action;r=await bosses.handle(self.store,1,route,args or {});self.seen.add(route);return r
 async def battle(self,mode):
  args={'attackTeamIndexs':[1,2,3,4,5],'attackShipIndexs':[]};chosen=await self.call(mode,'choose',args);run=json.loads(self.store.db.execute('SELECT data FROM pvp_runs WHERE mode=?',('boss:'+mode,)).fetchone()[0]);again=await self.call(mode,'choose',args);self.assertEqual(chosen['_temp']['seed'],again['_temp']['seed'])
  out=await asyncio.to_thread(simulate,{'mode':'boss','bossType':'BOSS'if mode=='worldBoss'else 'GUILD_BOSS','team':run['team'],'defender':run['defender'],'seed':run['seed'],'auto':True});result={**args,'bossHp':out['bossHp'],'seed':run['seed'],'manualRecordMap':{},'isAuto':True,'tickNumber':out['tickNumber']}
  with self.assertRaises(ValueError):await self.call(mode,'challenge',{**result,'bossHp':out['bossHp']-1})
  r=await self.call(mode,'challenge',result)
  with self.assertRaises(ValueError):await self.call(mode,'challenge',result)
  return r
 async def test_all_nine_routes_positive_engine_results_and_rank_persistence(self):
  for mode in ('worldBoss','guildBoss'):
   r=await self.call(mode,'openInfo');self.assertTrue(r['extra'][mode]['openInfo']['isOpen'])
   if mode=='worldBoss':
    r=await self.call(mode,'inspire');self.assertEqual(r['_temp']['upPower'],1.25)
   r=await self.battle(mode)
   if mode=='guildBoss':self.assertEqual(r['_temp']['entityCountMap'],{'102':30,'23001':20})
   rank=await self.call(mode,'dmgRank');self.assertEqual(rank['_temp']['myRank'],1);self.assertGreater(rank['_temp']['myValue'],0)
   self.assertEqual(self.store.player(1)['extra'][mode]['openInfo']['attackTimes'],1)
   with self.assertRaises(ValueError):await self.call(mode,'choose',{'attackTeamIndexs':[1,2,3,4,5],'attackShipIndexs':[]})
  self.assertEqual(self.seen,bosses.ROUTES)
  reopened=Store(Path(self.tmp.name)/'db');self.assertEqual(reopened.db.execute('SELECT count(*)FROM boss_damage').fetchone()[0],2);reopened.db.close()
 async def test_settlement_source_reward_mail_is_once_after_close(self):
  await self.battle('guildBoss');self.clock.stop();self.clock=patch('time.time',return_value=self.stamp+13*3600);self.clock.start()
  p=self.store.player(1);mails=p['extra']['mails'];self.assertEqual(len(mails),1);self.assertEqual(mails[0]['dropList'],bosses.rank_reward('guildBoss','level_61_70',1))
  self.assertEqual(len(self.store.player(1)['extra']['mails']),1);self.assertEqual(self.store.db.execute('SELECT count(*)FROM boss_settlements').fetchone()[0],1)
  with self.assertRaises(ValueError):await self.call('guildBoss','choose',{'attackTeamIndexs':[1],'attackShipIndexs':[]})
 async def test_closed_schedule_role_filter_and_inspire_cap_rollback(self):
  with self.assertRaises(ValueError):await self.call('worldBoss','choose',{'attackTeamIndexs':[1],'attackShipIndexs':[]})
  for _ in range(4):await self.call('worldBoss','inspire')
  before=self.store.player(1)['gem']
  with self.assertRaises(ValueError):await self.call('worldBoss','inspire')
  self.assertEqual(self.store.player(1)['gem'],before)
  self.clock.stop();self.clock=patch('time.time',return_value=self.stamp+86400);self.clock.start()
  self.assertFalse((await self.call('worldBoss','openInfo'))['extra']['worldBoss']['openInfo']['isOpen'])
  with self.assertRaises(ValueError):await self.call('worldBoss','choose',{'attackTeamIndexs':[1,2,3,4,5],'attackShipIndexs':[]})
 async def test_foreign_guild_cannot_submit_pending_run_and_rank_type_is_validated(self):
  chosen=await self.call('guildBoss','choose',{'attackTeamIndexs':[1],'attackShipIndexs':[]});guild.handle(self.store,1,'logic.guildHandler.dismiss',{})
  with self.assertRaises(ValueError):await self.call('guildBoss','challenge',{'attackTeamIndexs':[1],'attackShipIndexs':[],'seed':chosen['_temp']['seed'],'bossHp':0})
  with self.assertRaises(ValueError):await self.call('worldBoss','dmgRank',{'type':'bad'})
 async def test_recovered_generators_accept_full_boss_data(self):
  root=Path(__file__).parent;payload={'profile':self.store.player(1),'checkBosses':True,'checkTeam':True};result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True)
  self.assertEqual(result.returncode,0,result.stderr);views=json.loads(result.stdout)['bossViews'];self.assertTrue(views['world']['isOpen']);self.assertEqual(views['guild']['remainingTimes'],3);self.assertTrue(views['guild']['challengeItemItems'])
  text=patch_boss_transport((root.parent/'client/main.decoded.js').read_text());subprocess.run(['node','--check'],input=text,text=True,capture_output=True,check=True)
