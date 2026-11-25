import tempfile,unittest,json,sqlite3,time
from pathlib import Path
from aiohttp.test_utils import TestServer,TestClient
from server.app import create_app
from server.storage import Store
from server.protocol import packages,package,response

class StorageTests(unittest.TestCase):
 def test_giftcode_duplicate_rolls_back_and_persists(self):
  with tempfile.TemporaryDirectory() as td:
   path=Path(td)/'db';s=Store(path);s.register('tester','password');uid,_=s.login('tester','password')
   s.db.execute('INSERT INTO players VALUES(1,?,?)',(uid,json.dumps({'id':1,'gem':50})))
   s.db.execute('INSERT INTO giftcodes VALUES(?,?,?,?)',('HELLO',100,int(time.time())+60,10))
   self.assertEqual(s.redeem(1,'HELLO')['gem'],150)
   with self.assertRaises(sqlite3.IntegrityError):s.redeem(1,'HELLO')
   self.assertEqual(s.player(uid)['gem'],150);s.db.close();s=Store(path)
   self.assertEqual(s.player(uid)['gem'],150);s.db.close()
 def test_last_giftcode_use_cannot_overgrant(self):
  with tempfile.TemporaryDirectory() as td:
   s=Store(Path(td)/'db');s.register('userone','password');s.register('usertwo','password')
   for i in [1,2]:s.db.execute('INSERT INTO players VALUES(?,?,?)',(i,i,json.dumps({'id':i,'gem':50})))
   s.db.execute('INSERT INTO giftcodes VALUES(?,?,?,?)',('LAST',100,int(time.time())+60,1));s.redeem(1,'LAST')
   with self.assertRaises(ValueError):s.redeem(2,'LAST')
   self.assertEqual(s.player(2)['gem'],50);s.db.close()

class ServerTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.temp=tempfile.TemporaryDirectory();self.client=TestClient(TestServer(create_app(self.temp.name,admin_token='test-secret')));await self.client.start_server()
 async def asyncTearDown(self):await self.client.close();self.temp.cleanup()
 async def test_auth_admin_and_audit(self):
  self.assertEqual((await self.client.get('/admin/api')).status,401)
  for path in ['register','login']:
   r=await self.client.post('/user/'+path,data={'name':'tester','password':'password'});d=await r.json();self.assertEqual(d['code'],200)
  r=await self.client.post('/admin/api',headers={'Authorization':'Bearer test-secret'},json={'action':'giftcode','code':'TEST','gem':50});self.assertEqual(r.status,200)
  d=await (await self.client.get('/admin/api',headers={'Authorization':'Bearer test-secret'})).json();self.assertEqual(d['giftcodes'][0]['code'],'TEST');self.assertEqual(d['audit'][0]['action'],'giftcode')
 async def test_pomelo_gate_and_unauthorized_connector(self):
  ws=await self.client.ws_connect('/');await ws.send_bytes(package(1,b'{"sys":{"type":"js-websocket","version":"0.0.1"}}'))
  d=list(packages((await ws.receive()).data));self.assertEqual(json.loads(d[0][1])['code'],200)
  await ws.send_bytes(package(2));self.assertEqual((await ws.receive()).data,package(3))
  next_id=0
  async def call(route,body):
   nonlocal next_id
   next_id+=1
   r=route.encode();await ws.send_bytes(package(4,bytes([0,next_id])+bytes([len(r)])+r+json.dumps(body).encode()));data=list(packages((await ws.receive()).data))[0][1];return json.loads(data[2:])
  self.assertEqual((await call('gate.gateHandler.queryEntry',{'uid':'1'}))['host'],'127.0.0.1')
  self.assertEqual((await call('connector.entryHandler.entry',{'token':'wrong'}))['code'],500)
  self.assertEqual((await call('connector.playerHandler.getPlayers',{}))['code'],500)
  await ws.close()
 async def test_create_reconnect_gift_and_profile_ownership(self):
  import gzip,base64
  await self.client.post('/user/register',data={'name':'tester','password':'password'})
  login=await (await self.client.post('/user/login',data={'name':'tester','password':'password'})).json()
  async def connect():
   ws=await self.client.ws_connect('/');await ws.send_bytes(package(1,b'{"sys":{}}'));await ws.receive();await ws.send_bytes(package(2));await ws.receive();return ws
  next_id=0
  async def call(ws,route,body):
   nonlocal next_id
   next_id+=1
   r=route.encode();await ws.send_bytes(package(4,bytes([0,next_id])+bytes([len(r)])+r+json.dumps(body).encode()));return json.loads(list(packages((await ws.receive()).data))[0][1][2:])
  ws=await connect();self.assertEqual((await call(ws,'connector.entryHandler.entry',{'token':login['token'],'serverId':1}))['code'],200)
  self.assertEqual((await call(ws,'connector.playerHandler.getPlayers',{}))['players'],[])
  result=await call(ws,'connector.playerHandler.createPlayer',{'name':'Son Goku'});p=json.loads(gzip.decompress(base64.b64decode(result['player'])));self.assertEqual(p['gem'],50)
  # A second create cannot replace or duplicate a profile.
  again=await call(ws,'connector.playerHandler.createPlayer',{'name':'Duplicate'});self.assertEqual(json.loads(gzip.decompress(base64.b64decode(again['player'])))['id'],p['id'])
  await self.client.post('/admin/api',headers={'Authorization':'Bearer test-secret'},json={'action':'giftcode','code':'WELCOME','gem':100})
  self.assertEqual((await call(ws,'logic.playerHandler.useGiftCode',{'giftCode':'WELCOME'}))['gem'],150)
  self.assertEqual((await call(ws,'logic.playerHandler.useGiftCode',{'giftCode':'WELCOME'}))['code'],500)
  await ws.close();ws=await connect();await call(ws,'connector.entryHandler.entry',{'token':login['token'],'serverId':1})
  self.assertEqual((await call(ws,'connector.playerHandler.entry',{'playerId':p['id']+1}))['code'],500)
  result=await call(ws,'connector.playerHandler.entry',{'playerId':p['id']});p=json.loads(gzip.decompress(base64.b64decode(result['player'])));self.assertEqual(p['gem'],150)
  await ws.close()
 def test_truncated_package_rejected(self):
  with self.assertRaises(ValueError):list(packages(b'\4\0\0\2x'))
if __name__=='__main__':unittest.main()
