import tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.local_boosts import handle
from server.player_actions import handle as player_action
from server.tasks import handle as task_action
from server.adventure import reset
from server.profile import table

class LocalBoostTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.store.create_player(1,'Goku')
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def issue(self,kind):return handle(self.store,1,'logic.playerHandler.viewAd',{'type':kind})
 def use(self,action):return player_action(self.store,1,'logic.playerHandler.'+action,{'isAd':True})
 def test_free_resource_boosts_require_once_only_server_tokens(self):
  with self.assertRaises(ValueError):self.use('buyActionPoint')
  self.assertTrue(self.issue(7)['_temp']['privateLocalReward']);self.assertEqual(self.use('buyActionPoint')['actionPoint'],180)
  p=self.store.player(1);self.assertEqual(p['gem'],50);self.assertEqual(p['vip']['buyActionPointTimes'],0)
  with self.assertRaises(ValueError):self.use('buyActionPoint')
  with self.assertRaises(ValueError):self.issue(7)
  self.issue(8);r=self.use('buyCoin');self.assertGreater(r['_temp']['getCoin'],0);self.assertEqual(r['_temp']['costGem'],0)
 def test_point_boost_uses_source_six_hour_interval_and_cannot_replay(self):
  self.issue(4);route='logic.pointHandler.adReward';self.assertEqual(handle(self.store,1,route,{})['_temp']['entityCountMap'],{'119':1})
  with self.assertRaises(ValueError):handle(self.store,1,route,{})
  with self.assertRaises(ValueError):self.issue(4)
  later=time.time()+21601
  with patch('time.time',return_value=later):self.issue(4)
 def test_sign_in_local_boost_doubles_source_drop_without_payment_claim(self):
  self.issue(2);r=self.use('signIn');self.assertEqual(r['_temp']['entityCountMap'],{'49904':60})
  self.assertEqual(self.store.player(1)['vip']['topUpMoney'],0)
  with self.assertRaises(ValueError):self.use('signIn')
 def test_daily_task_boost_claims_completed_task_and_doubles_active_points(self):
  p=self.store.player(1);p['level']=100;self.store.save(p)
  player_action(self.store,1,'logic.playerHandler.buyCoin',{'isAd':False});self.issue(6)
  row=next(r for r in table('task')if (r.get('require')or {}).get('dailyBuyCoinTimes'))
  task_action(self.store,1,'logic.playerHandler.receiveTaskAward',{'taskId':row['kindId'],'isAd':True})
  self.assertEqual(self.store.player(1)['task']['dailyActivePoint'],row['activePoint']*2)
 def test_smap_local_reset_does_not_consume_paid_vip_reset_quota(self):
  p=self.store.player(1);p['smapStarMap']['1']['101']={'10101':3,'10102':3};p['smapTimesMap']={'1':{'101':{'10102':10}}};self.store.save(p)
  self.issue(1);r=reset(self.store,1,{'smapId':10102,'isAd':True});self.assertEqual(r['smapTimesMap']['1']['101']['10102'],0);self.assertEqual(self.store.player(1)['gem'],50)
 def test_bad_type_and_unspent_or_expired_token_are_guarded(self):
  for kind in (True,0,9,'4'):
   with self.assertRaises(ValueError):self.issue(kind)
  self.issue(1)
  with self.assertRaises(ValueError):self.issue(1)
  self.issue(7);later=time.time()+3601
  with patch('time.time',return_value=later):
   with self.assertRaises(ValueError):self.use('buyActionPoint')
