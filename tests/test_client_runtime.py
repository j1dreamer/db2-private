import json,shutil,subprocess,unittest
from pathlib import Path
from tools.client_patches import patch_response_boundary,patch_private_sdk

@unittest.skipUnless(shutil.which('node'),'Node needed for recovered client checks')
class RuntimeTests(unittest.TestCase):
 def test_engine_rate_one_to_ten_pause_and_invalid_values(self):
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_runtime.cjs')],input='{}',text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout)['scale'],2)
 def test_data_and_animation_errors_release_loading_and_keep_request_queue_live(self):
  source=(Path(__file__).parent/'fixtures/client_socket.js').read_text()
  source=patch_response_boundary(source)
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_runtime.cjs')],input=json.dumps({'socket':source}),text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout)['reports'],2)
 def test_private_sdk_uses_internal_gem_offer_and_never_native_payment_or_telemetry(self):
  source=patch_private_sdk((Path(__file__).parent/'fixtures/client_sdkApi.js').read_text())
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_private_sdk.cjs')],input=json.dumps({'source':source}),text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout),{'native':0,'offers':1})
