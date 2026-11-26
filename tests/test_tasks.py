import tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.profile import table
from server.tasks import handle
from server.player_actions import handle as player_action
from server.bag_actions import handle as bag_action
from server.gameplay import add_reward
from server.state import refresh_time

class TaskTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Goku');p.update(gem=10000,coin=1000000);self.store.save(p)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def claim(self,tid):return handle(self.store,1,'logic.playerHandler.receiveTaskAward',{'taskId':tid,'isAd':False})
 def test_main_chain_advances_and_uses_persisted_gameplay_counters(self):
  self.assertEqual(self.store.player(1)['task']['main']['1']['taskId'],1)
  with self.assertRaises(ValueError):self.claim(1)
  p=self.store.player(1);p['team']['roles']['1']['kindId']=100102;self.store.save(p)
  r=self.claim(1);self.assertEqual(r['_temp']['entityCountMap'],{'50030':10});self.assertEqual(self.store.player(1)['task']['main']['1']['taskId'],2)
  with self.assertRaises(ValueError):self.claim(1)
  p=self.store.player(1);add_reward(p,{'entityId':50020,'count':10,'extra':{}});self.store.save(p)
  bag_action(self.store,1,'logic.bagHandler.composeRole',{'classId':2})
  self.assertTrue(self.store.player(1)['task']['main']['1']['isComplete']);self.claim(2)
  self.assertEqual(self.store.player(1)['task']['main']['1']['taskId'],3)
  with self.assertRaises(ValueError):self.claim(4)
 def test_daily_claim_is_once_and_new_day_resets_progress(self):
  p=self.store.player(1);p['level']=100;self.store.save(p)
  row=next(r for r in table('task')if (r.get('require')or {}).get('dailyBuyCoinTimes'))
  with self.assertRaises(ValueError):self.claim(row['kindId'])
  player_action(self.store,1,'logic.playerHandler.buyCoin',{'isAd':False});self.assertTrue(self.store.player(1)['task']['daily'][str(row['groupId'])]['isComplete'])
  self.claim(row['kindId']);p=self.store.player(1);self.assertEqual(p['task']['dailyActivePoint'],row['activePoint'])
  with self.assertRaises(ValueError):self.claim(row['kindId'])
  future=time.time()+86400
  with patch('time.time',return_value=future):
   fresh=self.store.player(1);self.assertEqual(fresh['task']['dailyActivePoint'],0);self.assertEqual(fresh['task']['daily'][str(row['groupId'])]['taskId'],row['kindId']);self.assertFalse(fresh['task']['daily'][str(row['groupId'])]['isComplete'])
 def test_activity_point_rewards_require_server_points_and_cannot_replay(self):
  route='logic.playerHandler.receiveTaskActiveAward'
  with self.assertRaises(ValueError):handle(self.store,1,route,{'type':'daily','point':30})
  p=self.store.player(1);p['task']['dailyActivePoint']=30;self.store.save(p)
  r=handle(self.store,1,route,{'type':'daily','point':30});self.assertEqual(r['_temp']['entityCountMap']['311'],1)
  with self.assertRaises(ValueError):handle(self.store,1,route,{'type':'daily','point':30})
  self.assertEqual(self.store.player(1)['task']['receivedPointMap']['daily'],{'30':True})
 def test_forged_task_fields_and_cross_account_claims_are_ignored(self):
  for tid in (True,-1,999999):
   with self.assertRaises(ValueError):self.claim(tid)
  p=self.store.player(1);p['team']['roles']['1']['kindId']=100102;self.store.save(p)
  with self.assertRaises(ValueError):handle(self.store,1,'logic.playerHandler.receiveTaskAward',{'taskId':1,'isAd':True})
  self.assertEqual(self.store.db.execute('SELECT count(*)FROM task_claims').fetchone()[0],0)
 def test_week_reset_is_independent_of_day_and_keeps_achievement_progress(self):
  p=self.store.player(1);p['privateTaskWeek']='2000-1';p['task']['weeklyActivePoint']=850;p['task']['receivedPointMap']['weekly']={'500':True};p['task']['achievementPoint']=123
  refresh_time(p);self.assertEqual(p['task']['weeklyActivePoint'],0);self.assertEqual(p['task']['receivedPointMap']['weekly'],{});self.assertEqual(p['task']['achievementPoint'],123)
