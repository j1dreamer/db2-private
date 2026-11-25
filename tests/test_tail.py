import asyncio,json,shutil,subprocess,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server import tail
from server.battle import simulate
from server.state import refresh_time,vip_data
from tools.client_patches import patch_tail_transport

class TailTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Tester');p['level']=40;self.store.save(p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup()
 async def call(self,action,args):return await tail.handle(self.store,1,'logic.tailHandler.'+action,args)
 async def test_original_engine_hp_checked_and_reward_persisted_once(self):
  for typ in (1,2,3):
   p=self.store.player(1);p['vip']['tailChallengeTimesTimes']=0;self.store.save(p)
   args={'tailType':typ,'attackTeamIndexs':[1],'attackShipIndexs':[]};r=await self.call('choose',args);again=await self.call('choose',args);self.assertEqual(again['_temp']['seed'],r['_temp']['seed']);self.assertEqual(self.store.player(1)['vip']['tailChallengeTimesTimes'],1)
   run=json.loads(self.store.db.execute("SELECT data FROM pvp_runs WHERE mode='tail'").fetchone()[0]);out=await asyncio.to_thread(simulate,{'mode':'boss','bossType':'TAIL','team':run['team'],'defender':run['defender'],'seed':run['seed'],'config':run['config'],'auto':True})
   result={**args,'seed':run['seed'],'bossHp':out['bossHp']}
   with self.assertRaises(ValueError):await self.call('challenge',{**result,'bossHp':out['bossHp']-1})
   expected=int((tail.INITIAL_HP-out['bossHp'])*.002);r=await self.call('challenge',result);self.assertEqual(r['_temp']['entityCountMap'],{str({1:101,2:108,3:23001}[typ]):expected}if expected else {})
   with self.assertRaises(ValueError):await self.call('challenge',result)
 async def test_locks_limits_expiration_and_daily_reset(self):
  args={'tailType':1,'attackTeamIndexs':[1],'attackShipIndexs':[]}
  for bad in ({'tailType':4},{'attackTeamIndexs':[1,1]},{'attackShipIndexs':[999]}):
   with self.assertRaises(ValueError):await self.call('choose',{**args,**bad})
  p=self.store.player(1);p['level']=1;self.store.save(p)
  with self.assertRaises(ValueError):await self.call('choose',args)
  p['level']=40;p['vip']['tailChallengeTimesTimes']=vip_data(p)['tailChallengeTimesTimes'];self.store.save(p)
  with self.assertRaises(ValueError):await self.call('choose',args)
  p['privateDay']='2000-01-01';self.store.save(p);r=await self.call('choose',args);self.assertEqual(self.store.player(1)['vip']['tailChallengeTimesTimes'],1)
  self.store.db.execute("UPDATE pvp_runs SET expires=0 WHERE mode='tail'")
  with self.assertRaises(ValueError):await self.call('challenge',{**args,'seed':r['_temp']['seed'],'bossHp':0})
 async def test_roster_snapshot_and_changed_seed_are_not_accepted(self):
  args={'tailType':1,'attackTeamIndexs':[1],'attackShipIndexs':[]};r=await self.call('choose',args)
  with self.assertRaises(ValueError):await self.call('challenge',{**args,'seed':r['_temp']['seed']+1,'bossHp':0})
  self.assertEqual(self.store.player(1)['coin'],0)
 def test_tail_client_transport_has_unique_anchors_and_valid_syntax(self):
  text=patch_tail_transport((Path(__file__).resolve().parent.parent/'client/main.decoded.js').read_text())
  self.assertIn('window.DB2_PRIVATE_TAIL_SEED = e._temp.seed;',text)
  if shutil.which('node'):subprocess.run(['node','--check'],input=text,text=True,capture_output=True,check=True)
