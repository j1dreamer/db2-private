import json,subprocess,tempfile,unittest
from pathlib import Path
from server.storage import Store
from server import economy

class RuntimeEconomyTests(unittest.TestCase):
 def test_latest_runtime_boxes_and_old_time_peak_removal_without_new_ipa(self):
  with tempfile.TemporaryDirectory()as folder:
   s=Store(Path(folder)/'db');one=economy.client_script(s)
   with s.transaction():economy.save(s,{'section':'rewards','stars14':[{'entityId':2,'count':5}],'stars21':[],'expedition':[],'sixExpedition':[],'voucherExpiryMinute':1439})
   two=economy.client_script(s);s.db.close()
  js='''const vm=require('vm'),assert=require('assert');const D={bmap:{data:{101:{box2:''}}}},E={},nodes={},callbacks=[];
  function add(name){nodes[name]={destroy(){delete nodes[name]}};}const root={getChildByName:n=>nodes[n]};add('PrivateTimePeakButton');add('PrivateTimePeakPanel');
  const c={window:{DB2PrivateTimePeak:{mount(){throw Error('old mount')},show(){throw Error('old show')}}},cc:{Canvas:{instance:{node:root}},director:{on:(name,fn)=>callbacks.push(fn)},Director:{EVENT_AFTER_SCENE_LAUNCH:'scene'}},require:n=>n==='dataApi'?D:E};
  vm.runInNewContext(S1,c);assert(!nodes.PrivateTimePeakButton&&!nodes.PrivateTimePeakPanel);assert(D.bmap.data[101].box2.endsWith('2x1'));
  vm.runInNewContext(S2,c);E.hackDataApi();assert(D.bmap.data[101].box2.endsWith('2x5'));assert.equal(callbacks.length,1);
  add('PrivateTimePeakButton');c.window.DB2PrivateTimePeak.mount();assert(!nodes.PrivateTimePeakButton);add('PrivateTimePeakPanel');callbacks[0]();assert(!nodes.PrivateTimePeakPanel);console.log('runtime boxes, repeat update and obsolete Time Peak hook passed');'''
  result=subprocess.run(['node','-e',js.replace('S1',json.dumps(one)).replace('S2',json.dumps(two))],capture_output=True,text=True)
  self.assertEqual(result.returncode,0,result.stderr)
