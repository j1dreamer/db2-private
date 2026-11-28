const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Node{constructor(name){this.name=name;this.children=[];this.events={};}set parent(p){this._parent=p;p.children.push(this);}setPosition(){}setContentSize(){}addComponent(T){const c=new T();c.node=this;return c;}on(k,fn){this.events[k]=fn;}}
Node.EventType={TOUCH_END:'touch'};class Label{}
function Normal(){}function Six(){}let updates=0,preview;
for(const T of [Normal,Six])T.prototype.update_=function(){updates++;return 7;};
const cc={Node,Label,Canvas:{instance:{node:{width:960,height:640}}}},window={__require:n=>({expeditionScene:Normal,sixType3Scene:Six,dataApi:{findEntityById:()=>({kindName:'Phiếu nạp thường'})},baseView:{addRewardPanel:(title,rewards)=>preview={title,rewards}}})[n]};
vm.runInNewContext(fs.readFileSync('tools/private_expedition.js','utf8'),{window,cc,console});
const config={normal:{floor:13,rewards:[{entityId:2,count:1}]},six:{floor:12,rewards:[{entityId:2,count:2}]}};
window.DB2PrivateExpeditionBonus.apply(config);const wrapped=Normal.prototype.update_;window.DB2PrivateExpeditionBonus.apply(config);assert.equal(wrapped,Normal.prototype.update_);
const a=new Normal();a.node=new Node('normal');assert.equal(a.update_(),7);assert(a._db2BonusLabel.string.includes('13'));assert(a._db2BonusLabel.string.includes('×1'));a._db2BonusLabel.node.events.touch();assert.equal(preview.rewards[0].entityId,2);
config.normal.rewards[0].count=3;window.DB2PrivateExpeditionBonus.apply(config);a.update_();assert(a._db2BonusLabel.string.includes('×3'));assert.equal(a.node.children.length,1);
const b=new Six();b.node=new Node('six');b.update_();assert(b._db2BonusLabel.string.includes('12'));assert(b._db2BonusLabel.string.includes('×2'));
console.log('Normal/six final-chest preview, current-config tap and repeat-safe updates passed');
