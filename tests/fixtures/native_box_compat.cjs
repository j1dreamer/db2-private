const fs=require('fs'),vm=require('vm'),assert=require('assert');
function Label(){this.string='AAAAAA';this.font={};this.spacingX=3;}Label.prototype._forceUpdateRenderData=function(){};
const label=new Label(),rootLabel=new Label(),nameNode={getComponent:()=>label,children:[]},roleNode={active:true,data:{kindId:107804,_data:{kindName:'Gogeta SSJ4'}},getChildByName:()=>nameNode},root={getComponent:()=>rootLabel,children:[nameNode]};
function Panel(){}let calls=0;Panel.prototype.update_=function(){calls++;return 42;};
const ctx={window:{__require:n=>n==='rewardPanel'?Panel:{findEntityById:()=>({kindName:'Fallback'})}},cc:{Label}};
const source=fs.readFileSync('server/native_compat.js','utf8');vm.runInNewContext(source,ctx);const wrapped=Panel.prototype.update_;vm.runInNewContext(source,ctx);assert.equal(Panel.prototype.update_,wrapped);
const view=new Panel();view.node=root;view.roleItemNodeMap={0:roleNode};assert.equal(view.update_({}),42);assert.equal(calls,1);assert.equal(label.string,'Gogeta SSJ4');assert.equal(label.fontFamily,'Arial');assert.equal(label.font,null);assert(rootLabel.useSystemFont);console.log('whole-role names, popup font and repeat hook passed');
