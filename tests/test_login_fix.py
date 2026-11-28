import json,re,subprocess,unittest
from pathlib import Path
from tools.client_patches import patch_private_startup
ROOT=Path(__file__).parents[1]
class LoginFixTests(unittest.TestCase):
 def test_vietnamese_font_fallback_and_source_button_removed(self):
  settings=(ROOT/'tools/private_settings.js').read_text();self.assertNotIn('Nguồn và luật',settings);self.assertNotIn('DB2PrivateSourceButton',settings)
  result=subprocess.run(['node','-e',r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert');let draws=0,selected='vi',loads=[];
class Label{constructor(){this.string='Tài khoản';this.fontSize=24;this.font={source:true};this.useSystemFont=false;} _forceUpdateRenderData(){draws++;}}
Label.CacheMode={NONE:0};const cc={Label,sys:{localStorage:{getItem:()=>selected}},assetManager:{loadRemote(url,cb){loads.push(url);cb(null,{url});}}};const window={};vm.runInNewContext(fs.readFileSync('tools/private_font.js','utf8'),{window,cc,console});window.DB2PrivateFonts.prepare();const label=new Label();label._forceUpdateRenderData();assert(label.font.url.includes('NotoSans'));assert.equal(label.fontSize,24);assert.equal(label.useSystemFont,false);assert.notEqual(label.fontFamily,'Arial');selected='en';const source=new Label();source.string='Choose item';const original=source.font;source._forceUpdateRenderData();assert.equal(source.font,original);window.DB2PrivateFonts.custom(source);assert(source.font.url.endsWith('/font.ttf'));assert.equal(loads.length,2);assert(draws<10);

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
