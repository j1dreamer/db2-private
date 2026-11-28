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

 def test_plan_migration_storage_roundtrip_and_interrupted_record_recovery(self):
  r=subprocess.run(['node','-e',r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert'),source=fs.readFileSync('tools/private_auto.js','utf8');const stored={};let now=10000;
const old={mode:'multi',points:[{x:.1,y:.2}],interval:600,cycles:2,record:[{kind:'start',x:0,y:0,ms:0},{kind:'end',x:0,y:0,ms:50}]};stored['db2.private.auto.v1']=JSON.stringify(old);
function boot(){const context={window:{DB2PrivateUI:{}},cc:{sys:{localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v,removeItem:k=>delete stored[k]}},Canvas:{instance:null},director:{on(){}},Director:{},game:{}},Date:{now:()=>now},setTimeout,clearTimeout,isFinite};context.window.DB2_PRIVATE_UI_LOCALES=JSON.parse(fs.readFileSync('tables/localization/private-ui.json'));vm.runInNewContext(fs.readFileSync('tools/private_i18n.js','utf8'),context);vm.runInNewContext(source,context);return context.window.DB2PrivateAuto;}
let a=boot();assert.equal(a.listPlans().length,2);assert.equal(stored['db2.private.auto.v1'],JSON.stringify(old));a.loadPlan(a.listPlans()[0].id);a.updatePoint(0,{hold:80});assert.equal(a.listPlans()[0].points[0].hold,40);const id=a.savePlan('Saved');a=boot();assert.equal(a.listPlans().filter(p=>p.id===id)[0].points[0].hold,80);assert.equal(a.getDraft().name,'Saved');a.createPlan('New','single');assert.notEqual(a.getDraft().id,id);a.savePlan('New');assert.equal(a.listPlans().length,3);
const pending=a.getDraft();pending.type='record';pending.actions=[{kind:'start',x:0,y:0,ms:0},{kind:'move',x:.1,y:.1,ms:80}];pending.points=[];stored['db2.private.auto.draft.v2']=JSON.stringify({plan:pending,dirty:true});a=boot();assert.equal(a.getDraft().actions[2].kind,'cancel');a.savePlan('Recovered');assert.equal(a.listPlans().length,3);
assert.throws(()=>a.savePlan(''));console.log('OK');
'''],cwd=ROOT,text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr)
