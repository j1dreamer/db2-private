import asyncio,json,shutil,tempfile,time,unittest
from pathlib import Path
from server.storage import Store
from server.profile import character
from server.battle import build_team,simulate,validate_records
from server import adventure
from server.state import refresh_time
from tools.client_patches import patch_adventure_transport

class AdventureTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password')
  self.p=self.store.create_player(1,'Goku');self.p['team']['roles']['2']=character(100801,2);self.p['team']['roles']['3']=character(101101,3);self.store.save(self.p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup()
 def start(self,smap=10101):return adventure.begin(self.store,1,{'smapId':smap,'teamIndexs':[1,2,3]})
 def test_begin_is_idempotent_and_checks_team_unlock_and_stamina(self):
  result=self.start();self.assertEqual(result['actionPoint'],54)
  self.assertEqual(self.start()['_temp']['seed'],result['_temp']['seed']);self.assertEqual(self.store.player(1)['actionPoint'],54)
  for args in ({'smapId':10101,'teamIndexs':[999]},{'smapId':10102,'teamIndexs':[1]},{'smapId':10101,'teamIndexs':[1,1]}):
   with self.assertRaises(ValueError):adventure.begin(self.store,1,args)
  p=self.store.player(1);p['actionPoint']=0;self.store.save(p)
  self.store.db.execute('DELETE FROM adventure_runs')
  with self.assertRaises(ValueError):self.start()
 async def test_forfeit_closes_the_run_without_awards(self):
  result=self.start();before=self.store.player(1)
  args={'star':0,'teamIndexs':[1,2,3],'shipIdxs':[],'seed':result['_temp']['seed'],'manualRecordMap1':{},'manualRecordMap2':{},'tickNumber':0}
  response=await adventure.end(self.store,1,args)
  self.assertEqual(response['_temp']['entityCountMap'],{})
  self.assertEqual(self.store.player(1)['coin'],before['coin'])
  with self.assertRaises(ValueError):await adventure.end(self.store,1,args)
 @unittest.skipUnless(shutil.which('node'),'Node required for original battle replay')
 async def test_original_combat_replay_awards_once_and_updates_progress(self):
  result=self.start();p=self.store.player(1);seed=result['_temp']['seed']
  outcome=await asyncio.to_thread(simulate,{'team':build_team(p,[1,2,3]),'smapId':10101,'seed':seed,'auto':True})
  self.assertTrue(outcome['isWin'])
  args={'star':outcome['star'],'teamIndexs':[1,2,3],'shipIdxs':[],'seed':seed,'manualRecordMap1':outcome['records'].get('1',{}),'manualRecordMap2':outcome['records'].get('2',{}),'tickNumber':outcome['tickNumber']}
  wrong={**args,'seed':seed+1}
  with self.assertRaises(ValueError):await adventure.end(self.store,1,wrong)
  response=await adventure.end(self.store,1,args)
  self.assertEqual(response['coin'],1200);self.assertEqual(response['smapStarMap']['1']['101']['10101'],outcome['star'])
  with self.assertRaises(ValueError):await adventure.end(self.store,1,args)
  self.assertEqual(self.store.player(1)['coin'],1200)
  self.assertEqual(adventure.begin(self.store,1,{'smapId':10102,'teamIndexs':[1]})['code'],200)
 def test_skip_requires_three_stars_and_is_atomic(self):
  with self.assertRaises(ValueError):adventure.skip(self.store,1,{'smapId':10102,'times':1})
  p=self.store.player(1);p['smapStarMap']['1']['101']={'10101':3,'10102':3};p['gem']=10;self.store.save(p)
  r=adventure.skip(self.store,1,{'smapId':10102,'times':2})
  self.assertEqual(r['gem'],8);self.assertEqual(r['actionPoint'],48);self.assertEqual(len(r['_temp']['entityCountMapList']),2)
  with self.assertRaises(ValueError):adventure.skip(self.store,1,{'smapId':10102,'times':100})
  self.assertEqual(self.store.player(1)['gem'],8)
 def test_box_reward_is_once_and_threshold_checked(self):
  with self.assertRaises(ValueError):adventure.receive_box(self.store,1,{'bmapId':101,'star':7})
  p=self.store.player(1);p['smapStarMap']['1']['101']={str(10100+i):3 for i in range(2,9)};self.store.save(p)
  r=adventure.receive_box(self.store,1,{'bmapId':101,'star':7})
  self.assertEqual(r['_temp']['entityCountMap'],{'20002':30})
  with self.assertRaises(ValueError):adventure.receive_box(self.store,1,{'bmapId':101,'star':7})
 def test_reset_and_type_five_purchase_use_vip_limits_and_costs(self):
  p=self.store.player(1);p['gem']=1000;p['level']=80;p['vip']['level']=1
  p['smapStarMap']['1']['101']={'10101':3,'10102':3};p['smapTimesMap']={'1':{'101':{'10102':10}}};self.store.save(p)
  r=adventure.reset(self.store,1,{'smapId':10102,'isAd':False})
  self.assertEqual(r['gem'],980);self.assertEqual(r['smapTimesMap']['1']['101']['10102'],0)
  self.assertEqual(adventure.buy_type5(self.store,1,{})['gem'],880)
 def test_records_reject_nonexistent_faction(self):
  with self.assertRaises(ValueError):validate_records({'1':[{'teamId':3,'skillId':100101}]})
  with self.assertRaises(ValueError):validate_records({'-1':[]})
 def test_recovery_and_day_reset_do_not_repeat(self):
  p=self.store.player(1);now=int(time.time()*1000);p['actionPoint']=1;p['nextRecoverTimeMap']['actionPoint']=now-300000
  refresh_time(p,now);self.assertEqual(p['actionPoint'],3)
  self.assertFalse(refresh_time(p,now));p['privateDay']='2000-01-01';p['vip']['buyActionPointTimes']=1
  refresh_time(p,now);self.assertEqual(p['vip']['buyActionPointTimes'],0)
 def test_client_transport_has_all_seed_and_replay_anchors(self):
  patched=patch_adventure_transport((Path(__file__).parent.parent/'client/main.decoded.js').read_text())
  self.assertIn('window.DB2_PRIVATE_BATTLE_SEED = e._temp.seed',patched)
  self.assertIn('$.preManualRecordMap || {}',patched)
