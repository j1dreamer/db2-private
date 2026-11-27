import json,subprocess,unittest
from pathlib import Path
from tools.client_patches import patch_private_recovery
ROOT=Path(__file__).parents[1]
class ClientControlsTests(unittest.TestCase):
 def test_touch_modes_record_replay_long_hold_slider_and_network_recovery(self):
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/client_controls.cjs')],text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr);self.assertTrue(json.loads(r.stdout)['record_swipe_replay'])
 def test_actual_message_box_boundary_routes_only_network_errors_to_recovery(self):
  text=patch_private_recovery((ROOT/'client/main.decoded.js').read_text());start=text.index('g.addMessageBox = function(');end=text.index('g.addPointBuyConfirmPanel',start)
  r=subprocess.run(['node','-e',r'''
const vm=require('vm'),fs=require('fs'),assert=require('assert'),s=fs.readFileSync(0,'utf8');let recover=0,original=0;
const g={},context={g,window:{DB2PrivateConnection:{isNetworkMessage:s=>/mạng|network/i.test(s),recover(){recover++;}}},cc:{director:{getScene(){original++;throw Error('original message box reached');}}}};
vm.runInNewContext(s,context);g.addMessageBox('Mạng mất kết nối, hãy nhấp thử lại',()=>{throw Error('retry must not run');});g.addMessageBox('Network unavailable');assert.equal(recover,2);assert.equal(original,0);assert.throws(()=>g.addMessageBox('Nhận quà?'));assert.equal(original,1);
'''],input=text[start:end],text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr)
