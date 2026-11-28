import tempfile
import time
import unittest
from pathlib import Path
from aiohttp.test_utils import TestClient,TestServer
from server import sp_events,liveops
from server.app import create_app
from server.storage import Store


class SPScheduleTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();app=create_app(self.tmp.name,admin_token='schedule-test')
  self.store=next(v for v in app.values()if isinstance(v,Store))
  self.client=TestClient(TestServer(app));await self.client.start_server()
  self.h={'X-DB2-Admin-Token':'schedule-test'}
  self.roles=[r['roleId']for r in sp_events.role_catalog()]
  self.body={'action':'sp_schedule_create','source':'eng-client','roleIds':list(reversed(self.roles[:3])),'start':int(time.time())-60,'days':5,'version':0}
 async def asyncTearDown(self):await self.client.close();self.tmp.cleanup()
 async def test_bulk_preserves_selected_order_ticket_and_restart(self):
  result=await self.client.post('/admin/api',headers=self.h,json=self.body);self.assertEqual(result.status,200,await result.text())
  rows=sp_events.config(self.store)['banners'];self.assertEqual([b['roleId']for b in rows],self.body['roleIds'])
  for i,b in enumerate(rows):
   self.assertEqual(b['start'],self.body['start']+i*5*86400)
   self.assertEqual(b['end']-b['start'],5*86400)
   self.assertEqual(b['ticketId'],sp_events.defaults(b['roleId'])['ticketId'])
   self.assertEqual(b['pool'][0]['entityId'],b['roleId'])
  await self.client.close();reopened=Store(Path(self.tmp.name)/'game.sqlite3')
  self.assertEqual(sp_events.config(reopened)['banners'],rows);reopened.db.close()
 async def test_overlap_stale_and_unverified_source_are_atomic(self):
  with self.store.transaction():sp_events.create_schedule(self.store,self.body)
  before=sp_events.config(self.store)
  for changes in ({'version':1},{'start':self.body['start']+30*86400,'version':0},{'source':'x7','version':1},{'roleIds':[self.roles[0]]*2,'version':1}):
   result=await self.client.post('/admin/api',headers=self.h,json={**self.body,**changes})
   self.assertIn(result.status,(400,409),await result.text());self.assertEqual(sp_events.config(self.store),before)
 async def test_catalog_provenance_and_auth(self):
  r=await self.client.get('/admin/events',headers=self.h);d=await r.json()
  self.assertEqual(len(d['spRoles']),20);self.assertFalse(d['spScheduleSources']['eng']['calendarVerified']);self.assertFalse(d['spScheduleSources']['x7']['calendarVerified'])
  r=await self.client.post('/admin/api',json=self.body);self.assertEqual(r.status,401)
  self.assertEqual(sp_events.config(self.store)['banners'],[])
