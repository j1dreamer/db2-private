import json,subprocess,unittest
from pathlib import Path
ROOT=Path(__file__).parents[1]
class ClientLabelTests(unittest.TestCase):
 def test_original_cocos_label_activation_sees_finished_fixed_size_text(self):
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/client_label_creation.cjs')],text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr);self.assertTrue(json.loads(r.stdout)['canvas_text_path'])
