import json,subprocess,tempfile,unittest
from pathlib import Path
from aiohttp.test_utils import TestClient,TestServer
from server.app import create_app
from server.protocol import package,packages

class NativeUpdateDeliveryTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.client=TestClient(TestServer(create_app(self.tmp.name,admin_token='test')));await self.client.start_server()
 async def asyncTearDown(self):await self.client.close();self.tmp.cleanup()
 async def test_existing_boxinfo_receives_executable_rules_before_player_model(self):
  await self.client.post('/user/register',data={'name':'tester','password':'password'})
  login=await(await self.client.post('/user/login',data={'name':'tester','password':'password'})).json()
  ws=await self.client.ws_connect('/');await ws.send_bytes(package(1,b'{"sys":{}}'));await ws.receive();await ws.send_bytes(package(2));await ws.receive()
  async def send(number,route,args):
   r=route.encode();await ws.send_bytes(package(4,bytes([0,number,len(r)])+r+json.dumps(args).encode()))
  await send(1,'connector.entryHandler.entry',{'token':login['token'],'serverId':1});await ws.receive()
  await send(2,'connector.playerHandler.entry',{'playerId':999});bad=list(packages((await ws.receive()).data))[0][1];self.assertEqual(bad[0],4);self.assertEqual(json.loads(bad[2:])['code'],500)
  await send(3,'connector.playerHandler.createPlayer',{'name':'Tester'})
  packet=list(packages((await ws.receive()).data))[0][1];self.assertEqual(packet[0],6);length=packet[1];self.assertEqual(packet[2:2+length].decode(),'onNewMsg');message=json.loads(packet[2+length:]);self.assertEqual(message['msg']['type'],'执行代码')
  result=subprocess.run(['node','tests/fixtures/native_update_delivery.cjs'],input=json.dumps(message),capture_output=True,text=True);self.assertEqual(result.returncode,0,result.stderr)
  response=list(packages((await ws.receive()).data))[0][1];self.assertEqual(response[0],4);self.assertEqual(json.loads(response[2:])['code'],200)
  await ws.close()
