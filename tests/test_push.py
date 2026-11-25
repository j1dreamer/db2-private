import json,tempfile,unittest,asyncio
from aiohttp.test_utils import TestServer,TestClient
from server.app import create_app
from server.protocol import package,packages

class PushTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.client=TestClient(TestServer(create_app(self.tmp.name,admin_token='test')));await self.client.start_server();self.sockets=[];self.ids={}
 async def asyncTearDown(self):
  for ws in self.sockets:await ws.close()
  await self.client.close();self.tmp.cleanup()
 async def call(self,ws,route,args):
  ident=self.ids.get(id(ws),0)+1;self.ids[id(ws)]=ident;name=route.encode()
  await ws.send_bytes(package(4,bytes([0,ident,len(name)])+name+json.dumps(args).encode()))
  while True:
   raw=list(packages((await asyncio.wait_for(ws.receive(),3)).data))[0][1]
   if raw[0]==4 and raw[1]==ident:return json.loads(raw[2:])
 async def player(self,name):
  await self.client.post('/user/register',data={'name':name,'password':'password'})
  login=await(await self.client.post('/user/login',data={'name':name,'password':'password'})).json()
  ws=await self.client.ws_connect('/');self.sockets.append(ws)
  await ws.send_bytes(package(1,b'{"sys":{}}'));await ws.receive();await ws.send_bytes(package(2));await ws.receive()
  await self.call(ws,'connector.entryHandler.entry',{'token':login['token'],'serverId':1})
  await self.call(ws,'connector.playerHandler.createPlayer',{'name':name.title()})
  return ws
 async def event(self,ws):
  raw=list(packages((await asyncio.wait_for(ws.receive(),3)).data))[0][1]
  self.assertEqual(raw[0],6);size=raw[1]
  return raw[2:2+size].decode(),json.loads(raw[2+size:])
 async def test_mail_and_friend_request_arrive_on_other_live_connection(self):
  alice=await self.player('alice');bobby=await self.player('bobby')
  self.assertEqual((await self.call(alice,'logic.mailHandler.send',{'targetId':2,'content':'Hello'}))['code'],200)
  name,body=await self.event(bobby);self.assertEqual(name,'onNewMail');self.assertEqual(body['mail']['body'],'Hello')
  await self.call(alice,'logic.friendHandler.requestAddFriend',{'targetId':2})
  name,body=await self.event(bobby);self.assertEqual(name,'onSync');self.assertEqual(body['friend']['infoMap']['1']['status'],1)
  await self.call(bobby,'logic.friendHandler.acceptAddFriend',{'targetId':1})
  name,body=await self.event(alice);self.assertEqual(name,'onSync');self.assertEqual(body['friend']['count'],1)
  self.assertTrue(body['friend']['list'][0]['isOnline'])
 async def test_chat_uses_original_push_shape_on_both_connections(self):
  alice=await self.player('alice');bobby=await self.player('bobby')
  result=await self.call(alice,'logic.playerHandler.sendChat',{'type':1,'words':'Hi'})
  self.assertEqual(result['code'],200);self.assertNotIn('extra',result)
  for peer in (alice,bobby):
   name,body=await self.event(peer);self.assertEqual(name,'onChat');self.assertEqual(body['words'],'Hi');self.assertIn('photoImgId',body['playerPhotoInfo'])
 async def test_guild_application_acceptance_and_dismissal_push_durable_membership(self):
  from server.storage import Store
  from pathlib import Path
  alice=await self.player('alice');bobby=await self.player('bobby');s=Store(Path(self.tmp.name)/'game.sqlite3')
  for account in (1,2):
   p=s.player(account);p.update(level=20,gem=1000);s.save(p)
  s.db.close()
  r=await self.call(alice,'logic.guildHandler.create',{'name':'Saiyans','badgeId':1});gid=r['guildId'];self.assertGreater(gid,0)
  await self.call(bobby,'logic.guildHandler.applyJoin',{'guildId':gid});name,body=await self.event(alice);self.assertEqual(name,'onSync');self.assertEqual(body['guild']['applyPlayerList'][0]['playerId'],2)
  await self.call(alice,'logic.guildHandler.handleApply',{'targetId':2,'isAgree':True});name,body=await self.event(bobby);self.assertEqual(name,'onSync');self.assertEqual(body['guildId'],gid);self.assertEqual(len(body['guild']['members']),2)
  await self.call(alice,'logic.guildHandler.dismiss',{});name,body=await self.event(bobby);self.assertEqual(name,'onSync');self.assertEqual(body['guildId'],0);self.assertEqual(body['guild']['members'],[])
