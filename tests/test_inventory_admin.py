import copy,secrets,tempfile,unittest
from pathlib import Path
from aiohttp.test_utils import TestClient,TestServer
from server.app import create_app
from server.storage import Store
from server.inventory import insert
from server.state import stack_count
from server import inventory_admin as inv

class InventoryRecallTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();app=create_app(self.tmp.name,admin_token='recall-test');self.store=next(v for v in app.values()if isinstance(v,Store))
  for i in (1,2):
   self.store.register('recall'+str(i),'password');p=self.store.create_player(i,'User '+str(i));insert(p,119,10);self.store.save(p)
  self.client=TestClient(TestServer(app));await self.client.start_server();self.h={'X-DB2-Admin-Token':'recall-test'}
 async def asyncTearDown(self):await self.client.close();self.tmp.cleanup()
 def request(self,**kw):return {'scope':'server','kindId':119,'count':3,**kw}
 def apply(self,body):
  d=inv.preview(self.store,body);body={**body,'fingerprint':d['fingerprint'],'requestId':secrets.token_hex(16)}
  with self.store.transaction():ident=inv.recall(self.store,body)
  return ident,body
 async def test_server_recall_is_previewed_atomic_restorable_once(self):
  before=[stack_count(self.store.player(i),119)for i in (1,2)]
  d=inv.preview(self.store,self.request());self.assertEqual((d['players'],d['count']),(2,6))
  ident,body=self.apply(self.request());self.assertEqual([stack_count(self.store.player(i),119)for i in (1,2)],[n-3 for n in before])
  with self.store.transaction():inv.restore(self.store,{'recallId':ident})
  self.assertEqual([stack_count(self.store.player(i),119)for i in (1,2)],before)
  with self.assertRaises(ValueError),self.store.transaction():inv.restore(self.store,{'recallId':ident})
  with self.assertRaises(ValueError),self.store.transaction():inv.recall(self.store,body)
 async def test_stale_preview_and_restore_refuse_to_overwrite_changed_stack(self):
  body=self.request();d=inv.preview(self.store,body);p=self.store.player(1);insert(p,119,1);self.store.save(p)
  with self.assertRaises(ValueError),self.store.transaction():inv.recall(self.store,{**body,'fingerprint':d['fingerprint'],'requestId':secrets.token_hex(16)})
  ident,_=self.apply(body);p=self.store.player(1);insert(p,119,1);self.store.save(p)
  before=copy.deepcopy(p['bag'])
  with self.assertRaises(ValueError),self.store.transaction():inv.restore(self.store,{'recallId':ident})
  self.assertEqual(self.store.player(1)['bag'],before)
 async def test_api_auth_single_slot_and_no_wipe_without_kind(self):
  r=await self.client.get('/admin/inventory?player=1');self.assertEqual(r.status,401)
  r=await self.client.get('/admin/inventory?player=1&kindId=119',headers=self.h);d=await r.json();slot=d['items'][0]['slot']
  body=self.request(scope='player',player=1,slot=slot,count=0);d=inv.preview(self.store,body)
  r=await self.client.post('/admin/api',headers=self.h,json={'action':'inventory_recall',**body,'fingerprint':d['fingerprint'],'requestId':secrets.token_hex(16)});self.assertEqual(r.status,200,await r.text())
  self.assertNotIn(slot,self.store.player(1)['bag']['items']);self.assertGreater(stack_count(self.store.player(2),119),0)
  with self.assertRaises(ValueError),self.store.transaction():inv.recall(self.store,{'scope':'player','player':2,'fingerprint':'x'})

 async def test_missing_definition_item_can_be_found_and_recalled(self):
  p=self.store.player(1);p['bag']['lastIdx']+=1;slot=str(p['bag']['lastIdx']);p['bag']['items'][slot]={'kindId':999999999,'count':4};self.store.save(p)
  r=await self.client.get('/admin/inventory?player=1&kindId=999999999',headers=self.h);d=await r.json();self.assertEqual(r.status,200,d);self.assertEqual(d['items'][0]['item']['type'],'unknown')
  self.apply({'scope':'player','player':1,'kindId':999999999,'slot':slot,'count':0})
  self.assertNotIn(slot,self.store.player(1)['bag']['items'])
