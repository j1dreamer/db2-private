import tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.online import handle

class OnlineTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Goku');self.now=1800000000.;p['privateOnlineClock']=int((self.now-10)*1000);p['activity']['map']['online_reward']={'reachMap':{'onlineSeconds':0},'rewards':[{'status':1,'needMap':{'onlineSeconds':10}}]};self.store.save(p)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,seconds=10):return handle(self.store,1,'logic.playerHandler.incOnlineTime',{'seconds':seconds})
 def test_clock_limits_progress_and_marks_threshold_once(self):
  with patch('time.time',return_value=self.now):
   self.assertEqual(self.call()['activity']['map']['online_reward']['rewards'][0]['status'],2)
   with self.assertRaises(ValueError):self.call()
  p=self.store.player(1);self.assertEqual(p['privateOnlineSeconds'],10)
 def test_invalid_seconds_do_not_update_counter(self):
  for seconds in (True,-1,0,1000,'10'):
   with self.assertRaises(ValueError):self.call(seconds)
  self.assertNotIn('privateOnlineSeconds',self.store.player(1))
