import json,subprocess,unittest
from pathlib import Path
from tools.client_patches import patch_eng_ui_repairs
ROOT=Path(__file__).resolve().parents[1]
class EngUITests(unittest.TestCase):
 def test_vip_deferred_lifecycle_and_empty_cosmetic_reward(self):
  source=patch_eng_ui_repairs((ROOT/'client/main.decoded.js').read_text())
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/eng_ui_lifecycle.cjs')],input=json.dumps({'source':source}),text=True,capture_output=True)
  self.assertEqual(r.returncode,0,r.stderr);self.assertTrue(all(json.loads(r.stdout).values()))
 def test_private_gm_interactions_entitlement_errors_and_revocation(self):
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/private_gm_ui.cjs')],capture_output=True,text=True)
  self.assertEqual(r.returncode,0,r.stderr);self.assertTrue(all(json.loads(r.stdout).values()))
