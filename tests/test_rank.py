import tempfile,unittest
from pathlib import Path
from server.storage import Store
from server.rank import handle
class RankTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db')
  for i in range(3):
   self.store.register('user'+str(i),'password');p=self.store.create_player(i+1,'Player'+str(i));p['level']=i+1;p['arena']['rank']=3-i;self.store.save(p)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def test_level_rank_pagination_and_my_rank_are_durable(self):
  r=handle(self.store,1,'logic.rankHandler.top50',{'type':'level','begin':0,'end':1})['_temp']
  self.assertEqual([x['playerId']for x in r['list']],[3,2]);self.assertEqual(r['myRank'],3);self.assertEqual(r['myValue'],1)
 def test_arena_and_daily_rank_use_actual_positions(self):
  r=handle(self.store,1,'logic.rankHandler.arenaTop50',{'isDaily':False})['_temp']
  self.assertEqual([x['value']for x in r['list']],[1,2,3]);self.assertEqual(r['myRank'],3)
  self.assertEqual(handle(self.store,1,'logic.rankHandler.arenaTop50',{'isDaily':True})['_temp']['list'],[])
 def test_rank_filters_server_and_rejects_unknown_types(self):
  self.assertEqual(handle(self.store,1,'logic.rankHandler.top50',{'type':'level','serverId':2})['_temp']['list'],[])
  with self.assertRaises(ValueError):handle(self.store,1,'logic.rankHandler.top50',{'type':'anything'})
  with self.assertRaises(ValueError):handle(self.store,1,'logic.rankHandler.top50',{'type':'level','begin':-1})
