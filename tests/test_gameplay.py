import tempfile,unittest,time,json,sqlite3
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.gameplay import draw,claim_events,validate_pool_entry,rename_player

class EconomyTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.p=self.store.create_player(1,'Goku');self.p['gem']=10000;self.store.save(self.p)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def test_older_profile_upgrades_without_resetting_currency_or_roster(self):
  p=self.store.player(1);p.pop('profileSchemaVersion');p['gem']=777;p.pop('photoInfo');p.pop('friendshipUnlockMap');p['team']['roles']['1']['attr']['hp']=77
  self.store.save(p);restored=self.store.player(1)
  self.assertEqual(restored['gem'],777);self.assertEqual(restored['team']['roles']['1']['attr']['hp'],77);self.assertEqual(len(restored['team']['roles']),1)
  self.assertIn('photoInfo',restored);self.assertEqual(restored['profileSchemaVersion'],4)
 def test_first_rename_is_free_persistent_and_repeat_is_idempotent(self):
  p=self.store.player(1);p['name']=p['userName'];p['gem']=50;self.store.save(p)
  response=rename_player(self.store,1,'Son Goku')
  self.assertEqual(response['name'],'Son Goku');self.assertEqual(response['gem'],50)
  self.assertEqual(self.store.player(1)['privateRenameCount'],1)
  self.assertEqual(rename_player(self.store,1,'Son Goku')['gem'],50)
 def test_later_rename_costs_100_and_failure_rolls_back(self):
  p=self.store.player(1);p['gem']=100;self.store.save(p)
  self.assertEqual(rename_player(self.store,1,'Vegeta')['gem'],0)
  with self.assertRaises(ValueError):rename_player(self.store,1,'Gohan')
  self.assertEqual(self.store.player(1)['name'],'Vegeta')
  self.assertEqual(self.store.player(1)['gem'],0)
 def test_invalid_or_duplicate_rename_cannot_charge(self):
  self.store.register('another','password');self.store.create_player(2,'Vegeta')
  before=self.store.player(1)
  for name in (None,123,'','   ','a\nb','<b>Goku','12345678901','vegeta','tester'):
   with self.subTest(name=name):
    with self.assertRaises(ValueError):rename_player(self.store,1,name)
  self.assertEqual(self.store.player(1)['gem'],before['gem'])
  self.assertEqual(self.store.player(1)['name'],before['name'])
 def test_ten_draws_use_admin_pool_and_charge_once(self):
  pool,entry=validate_pool_entry({'pool':102,'entity':101,'weight':1,'count':5})
  self.store.db.execute('INSERT INTO pool_entries VALUES(?,?,?)',(pool,101,json.dumps(entry)))
  result=draw(self.store,1,'normal',10)
  self.assertEqual(result['gem'],7300);self.assertEqual(result['coin'],50);self.assertEqual(len(result['_temp']['dropList']),10)
  self.assertEqual(self.store.player(1)['point']['normalTimes'],10)
 def test_failed_draw_rolls_back_cost_and_counter(self):
  with patch('server.gameplay.drops',side_effect=ValueError('broken table')):
   with self.assertRaises(ValueError):draw(self.store,1,'normal',10)
  p=self.store.player(1);self.assertEqual(p['gem'],10000);self.assertEqual(p['point']['normalTimes'],0)
 def test_insufficient_advanced_tickets_cannot_spend_gem(self):
  with self.assertRaises(ValueError):draw(self.store,1,'advanced',1)
  self.assertEqual(self.store.player(1)['gem'],10000)
 def test_ticket_consumption_and_shipped_first_draw(self):
  p=self.store.player(1);p['bag']={'lastIdx':1,'items':{'1':{'idx':1,'kindId':119,'count':1}}};self.store.save(p)
  r=draw(self.store,1,'normal',1);self.assertEqual(r['gem'],10000);self.assertIsNone(r['bag']['items']['1']);self.assertEqual(r['_temp']['dropList'][0]['entityId'],100801)
 def test_duplicate_role_returns_souls_and_only_new_role_deltas(self):
  entry={'entityId':100101,'count':1,'weight':1,'extra':{'star':1}}
  self.store.db.execute('INSERT INTO pool_entries VALUES(?,?,?)',(102,100101,json.dumps(entry)))
  r=draw(self.store,1,'normal',1)
  self.assertEqual(r['team']['roles'],{})
  soul=next(x for x in __import__('server.gameplay',fromlist=['rows']).rows('soul') if x['classId']==1)
  self.assertEqual(r['_temp']['entityCountMap'],{str(soul['kindId']):10})
  self.assertEqual(next(iter(r['bag']['items'].values()))['count'],10)
 def test_event_batch_is_atomic_and_claim_is_unique(self):
  now=int(time.time());event={'id':'launch','name':'Launch','start':now-10,'end':now+60,'gem':50}
  self.store.db.execute('INSERT INTO events VALUES(?,?)',('launch',json.dumps(event)))
  with self.assertRaises(ValueError):claim_events(self.store,1,['launch','missing'],[0,0])
  self.assertEqual(self.store.db.execute('SELECT count(*) FROM event_claims').fetchone()[0],0)
  self.assertEqual(claim_events(self.store,1,['launch'],[0])['gem'],10050)
  with self.assertRaises(sqlite3.IntegrityError):claim_events(self.store,1,['launch'],[0])
  self.assertEqual(self.store.player(1)['gem'],10050)
 def test_expired_event_and_invalid_pool_rejected(self):
  event={'id':'old','start':0,'end':1,'gem':100};self.store.db.execute('INSERT INTO events VALUES(?,?)',('old',json.dumps(event)))
  with self.assertRaises(ValueError):claim_events(self.store,1,['old'],[0])
  with self.assertRaises(ValueError):validate_pool_entry({'pool':102,'entity':100101,'weight':1,'count':2})
if __name__=='__main__':unittest.main()
