import json,tempfile,unittest
from pathlib import Path
from aiohttp.test_utils import TestClient,TestServer
from server.app import create_app
from server.access_control import admin_networks,private_admin_peer,AttemptLimiter
from tools.public_proxy import caddyfile,hostname
class PeerTests(unittest.TestCase):
 def test_only_real_peer_grants_private_administration(self):
  nets=admin_networks('127.0.0.0/8,::1/128,100.64.0.0/10')
  for p in ('127.0.0.1','::1','::ffff:127.0.0.1','100.93.172.55'):self.assertTrue(private_admin_peer(p,nets),p)
  for p in ('103.232.122.74','1.1.1.1','not-ip','',None):self.assertFalse(private_admin_peer(p,nets),p)
 def test_throttling_windows_and_bounded_memory(self):
  l=AttemptLimiter(2,10,capacity=2);self.assertTrue(l.allow('a',0));self.assertTrue(l.allow('a',0));self.assertFalse(l.allow('a',1));self.assertTrue(l.allow('b',1));self.assertFalse(l.allow('c',2));self.assertTrue(l.allow('a',11))
 def test_proxy_names_and_passwords_reject_injection(self):
  for bad in ('103.232.122.74','a.com { respond x }','https://a.com','a.com/admin','*.a.com'):
   with self.assertRaises(ValueError):hostname(bad)
  with self.assertRaises(ValueError):caddyfile('game.example.com','admin.example.com','admin','plaintext')
  text=caddyfile('game.example.com','admin.example.com','admin','$2b$10$'+'a'*53)
  self.assertIn('basic_auth',text);self.assertIn('header_up -Authorization',text);self.assertNotIn('/admin/api',text.split('admin.example.com')[0])
class PublicAccessTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):self.t=tempfile.TemporaryDirectory();self.clients=[]
 async def asyncTearDown(self):
  for c in self.clients:await c.close()
  self.t.cleanup()
 async def client(self,nets):
  path=Path(self.t.name)/str(len(self.clients));c=TestClient(TestServer(create_app(path,admin_token='test-admin-token',admin_networks=nets)));await c.start_server();self.clients.append(c);return c
 async def test_public_peer_cannot_reach_admin_even_with_token_or_spoofed_forward_headers(self):
  c=await self.client('100.64.0.0/10')
  for path in ['/admin','/admin/api','/admin/catalog','/admin.css','/admin.js','/assets/item-icons.json']:
   r=await c.get(path,headers={'Authorization':'Bearer test-admin-token','X-DB2-Admin-Token':'test-admin-token','X-Forwarded-For':'100.93.172.55','X-DB2-Client-IP':'127.0.0.1'});self.assertEqual(r.status,403,path)
  self.assertEqual((await(await c.get('/')).json())['administration'],'private')
  self.assertEqual((await c.get('/user/clientConfig')).status,200)
  ws=await c.ws_connect('/');await ws.close()
 async def test_private_network_still_requires_token_and_supports_proxy_basic_auth(self):
  c=await self.client('127.0.0.0/8')
  self.assertEqual((await c.get('/admin/overview',headers={'Authorization':'Basic YTpi'})).status,401)
  r=await c.get('/admin/overview',headers={'Authorization':'Basic YTpi','X-DB2-Admin-Token':'test-admin-token'});self.assertEqual(r.status,200)
  r=await c.get('/admin');self.assertIn("frame-ancestors 'none'",r.headers['Content-Security-Policy'])
  self.assertEqual(r.headers['X-Content-Type-Options'],'nosniff')
 async def test_registration_throttles_before_expensive_password_hash(self):
  c=await self.client('127.0.0.0/8')
  for i in range(5):self.assertEqual((await c.post('/user/register',data={'name':'u'+str(i),'password':'bad'})).status,200)
  r=await c.post('/user/register',data={'name':'userlast','password':'password'});self.assertEqual(r.status,429);self.assertEqual(r.headers['Retry-After'],'60')
