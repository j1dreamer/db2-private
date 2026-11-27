import json,re,subprocess,unittest
from pathlib import Path
from tools.client_patches import patch_private_startup
ROOT=Path(__file__).parents[1]
class LoginFixTests(unittest.TestCase):
 def test_vietnamese_font_fallback_and_source_button_removed(self):
  settings=(ROOT/'tools/private_settings.js').read_text();self.assertNotIn('Nguồn và luật',settings);self.assertNotIn('DB2PrivateSourceButton',settings)
  result=subprocess.run(['node','-e',r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert');let draws=0;
class Label{constructor(){this.string='Tài khoản';this.fontSize=24;this.system=false;}set useSystemFont(v){this.system=v;this._forceUpdateRenderData();} _forceUpdateRenderData(){draws++;}}
const cc={Label,sys:{localStorage:{getItem:()=> 'vi'}}};vm.runInNewContext(fs.readFileSync('tools/private_font.js','utf8'),{window:{},cc});const label=new Label();label._forceUpdateRenderData();assert.equal(label.system,true);assert.equal(label.fontFamily,'Arial');assert.equal(label.fontSize,24);assert(draws<10);console.log('OK');
'''],cwd=ROOT,text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr)
 def test_bounded_startup_probe_and_actual_account_controls(self):
  text=(ROOT/'client/main.decoded.js').read_text();text=patch_private_startup(text)
  from tools.client_patches import patch_private_sdk
  text=patch_private_sdk(text)
  # Use exactly the private local-account initialization used by the builders.
  old='init: function() {\nif (cc.sys.isNative) {\nif (cc.sys.os == cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "initPackageInfo", "()V");'
  text=text.replace(old,'init: function() {\nthis.sdkName="mmx"; this.channel="private"; this.packageInfo="DB2-private-dev"; return;\nif (cc.sys.isNative) {\nif (cc.sys.os == cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "initPackageInfo", "()V");')
  self.run_client(text)
 def run_client(self,text):
  positions=list(re.finditer(r'(?m)^([\w$.]+): \[ function\(',text));modules={m.group(1):text[m.start():positions[i+1].start()if i+1<len(positions)else len(text)]for i,m in enumerate(positions)if m.group(1)in('logoScene','loginScene','sdkApi','loginPanel')}
  result=subprocess.run(['node',str(ROOT/'tests/fixtures/client_login_fix.cjs')],input=json.dumps({'modules':modules,'connection':(ROOT/'tools/private_connection.js').read_text()}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);return json.loads(result.stdout)
