import json,tempfile,unittest
from aiohttp.test_utils import TestServer,TestClient
from server.app import advertised_endpoint,create_app
from server.protocol import package,packages

class EndpointTests(unittest.TestCase):
 def test_explicit_host_stays_fixed_and_auto_keeps_relay_host_and_port(self):
  self.assertEqual(advertised_endpoint('phone.example:443','fixed.example',20003),('fixed.example',20003))
  self.assertEqual(advertised_endpoint('100.101.102.103:20003','auto',20003),('100.101.102.103',20003))
  self.assertEqual(advertised_endpoint('db2.example:443','auto',20003),('db2.example',443))
  self.assertEqual(advertised_endpoint('db2.example','auto',20003,'https'),('db2.example',443))
  for authority in ('','user:pass@example','example/path','example?query','example:99999'):
   with self.subTest(authority=authority),self.assertRaises(ValueError):advertised_endpoint(authority,'auto',20003)

class RelayGateTests(unittest.IsolatedAsyncioTestCase):
 async def test_gate_returns_phone_facing_authority_through_private_relay(self):
  with tempfile.TemporaryDirectory()as td:
   client=TestClient(TestServer(create_app(td,public_host='auto',admin_token='test')));await client.start_server()
   try:
    ws=await client.ws_connect('/',headers={'Host':'100.101.102.103:21003'})
    await ws.send_bytes(package(1,b'{"sys":{}}'));await ws.receive();await ws.send_bytes(package(2));await ws.receive()
    route=b'gate.gateHandler.queryEntry'
    await ws.send_bytes(package(4,b'\0\1'+bytes([len(route)])+route+b'{}'))
    result=json.loads(list(packages((await ws.receive()).data))[0][1][2:])
    self.assertEqual(result,{'code':200,'host':'100.101.102.103','port':21003});await ws.close()
   finally:await client.close()
