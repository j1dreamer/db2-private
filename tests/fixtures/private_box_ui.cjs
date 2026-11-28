const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Node{constructor(name=''){this.name=name;this.children=[];this.components=[];this.events={};this.active=true;this.width=100;this.height=100;}set parent(p){if(this._parent)this._parent.children=this._parent.children.filter(x=>x!==this);this._parent=p;if(p)p.children.push(this);}get parent(){return this._parent;}setPosition(x,y){this.x=x;this.y=y;}setContentSize(w,h){this.width=w;this.height=h;}addComponent(Type){const c=new Type();c.node=this;this.components.push(c);return c;}getChildByName(n){return this.children.find(c=>c.name===n);}getComponent(Type){return this.components.find(c=>typeof Type==='string'?c.type===Type:c instanceof Type);}on(name,fn){this.events[name]=fn;}destroy(){this.parent=null;}click(){this.events.touch({stopPropagation(){}});}}
class Label{}Label.Overflow={CLAMP:1};Label.CacheMode={NONE:0};class Graphics{roundRect(){}fill(){}}
Node.EventType={TOUCH_END:'touch'};
const canvas=new Node();canvas.width=960;canvas.height=640;const calls=[];
const context={window:{__require(name){assert.equal(name,'baseView');return{addSelectRewardPanel:id=>calls.push(['select',id]),addExchangeBoxPanel:id=>calls.push(['exchange',id])};}},cc:{Node,Label,Graphics,Canvas:{instance:{node:canvas}},color:()=>({})}};
vm.runInNewContext(fs.readFileSync(__dirname+'/../../tools/private_box.js','utf8'),context);const api=context.window.DB2PrivateBox;
const root=new Node();root.width=960;root.height=640;const role=new Node();role.parent=root;role.data={privateRewardCount:10};const item=new Node();item.parent=root;item.data={privateRewardCount:60};
const itemChild=new Node('item_item');itemChild.parent=item;let originalCountVisible=true;const nativeCount=new Label();nativeCount.node=new Node('count');itemChild.components.push({type:'itemItem2',countLabel:nativeCount,setCountLabelActive_(v){originalCountVisible=v;nativeCount.node.active=v;}});
let closed=0,opened=0;const view={node:root,data:{count:12,useCount:1,selectCount:1},canSelect:true,selectBagIdxs:[],roleItemNodeMap:{0:role},itemItemMap:{0:item},useCountNode:{},yesBt:{},useCountlabel:{},onClose_(){closed++;},onYes_(){opened=this.data.useCount;}};
function all(n=root){return[n,...n.children.flatMap(all)];}
function button(text){const node=all().find(n=>n.events.touch&&n.children.some(c=>c.components.some(x=>x instanceof Label&&x.string===text)));assert(node,'Missing button '+text);return node;}
api.attach(view);assert.equal(role.getChildByName('DB2BoxQuantity')._label.string,'×10');assert.equal(nativeCount.string,'×60');
assert.equal(originalCountVisible,true);
assert.equal(view.useCountNode.active,false);assert.equal(view.yesBt.active,true);
api.setCount(view,10);assert.equal(view.data.useCount,10);assert.equal(role.getChildByName('DB2BoxQuantity')._label.string,'×100');assert.equal(nativeCount.string,'×600');view.selectBagIdxs=[0];api.refresh(view);assert.equal(view._db2BoxInfo,null);
view.onYes_();assert.equal(opened,10);api.setCount(view,9999);assert.equal(view.data.useCount,12);view.onClose_();assert.equal(closed,1);
for(const n of all())for(const l of n.components.filter(c=>c instanceof Label)){assert(n.width>0&&n.height>0);assert.equal(l.fontFamily,'Arial');assert(l._forceUseCanvas);assert.equal(l.overflow,Label.Overflow.CLAMP);}
view.canSelect=false;view.data={privateBoxInfo:{bagIndex:7,count:4,selectCount:1},itemItems:[]};api.attach(view);button('Chọn phần thưởng & mở').click();assert.deepEqual(calls,[['select',7]]);
view.data={privateBoxInfo:{bagIndex:8,count:3,selectCount:1,isExchange:true}};api.attach(view);button('Chọn phần thưởng & mở').click();assert.deepEqual(calls.at(-1),['exchange',8]);
view.data={privateBoxInfo:{count:1,selectCount:1}};api.attach(view);assert(!all().some(n=>n.children.some(c=>c.components.some(l=>l instanceof Label&&l.string==='Chọn phần thưởng & mở'))));
let touched=0;api.attachEffect({node:root,roleItemNodeMap:{0:role},onTouch_(){touched++;}});button('×').click();assert.equal(touched,1);
assert(api.describe({selectCount:1,dropListDesc:'50570x60,50590x60'},'Mô tả gốc').includes('Mỗi lựa chọn có ×60'));
assert(api.describe({dropListDesc:'101x100,102x50'}).includes('nhận toàn bộ'));
assert(api.describe({rdDropListDesc:'101x100_W1,102x50_W2'}).includes('không đảm bảo nhận tất cả'));
assert(api.describe({dropListDesc:'101x100',rdDropListDesc:'102x50_R0.5'}).includes('cố định và phần thưởng ngẫu nhiên'));
assert(api.describe({}).includes('Chưa có cấu hình'));
console.log(JSON.stringify({descriptionsFromActualConfig:true,perBoxCount:true,tenBoxTotal:true,openTen:true,originalSelectionControls:true,nativeIconQuantityLabels:true,compactSelection:true,clampToOwned:true,explicitCancel:true,previewToSelection:true,exchangePreview:true,rewardClose:true}));
