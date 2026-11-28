import json,subprocess,tempfile,unittest
from aiohttp.test_utils import TestClient,TestServer
from server.app import create_app
class NativeUpdateDeliveryTests(unittest.IsolatedAsyncioTestCase):
 async def test_declarative_http_configuration_executes_only_bundled_bridge(self):
  with tempfile.TemporaryDirectory()as folder:
   async with TestClient(TestServer(create_app(folder,admin_token='test')))as client:
    response=await client.get('/user/clientConfig?platform=ios');self.assertEqual(response.status,200);data=await response.json();self.assertEqual(data['runtimeConfig']['version'],15)
    result=subprocess.run(['node','tests/fixtures/native_update_delivery.cjs'],input=json.dumps(data),capture_output=True,text=True);self.assertEqual(result.returncode,0,result.stderr)
