// Exercise the real Dream panel startup against stale local state, without a renderer.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const input=JSON.parse(fs.readFileSync(0,'utf8'));
let C;const writes={};const player={id:1,activity:{dream:input.dream},bag:{getItemCount:kind=>({93:2,94:0,95:1})[kind]||0}};
const base={addLoading(){},setMark(){},addRewardEffectPanel(){},addHintPanel(){}};
let reply;const handler={dreamRoll:(point,cb)=>cb(reply)};
const req=name=>({playerHandler:handler,serverMain:{player},baseView:base,dreamExtActivityPanel:{genData:()=>({isNeedMark:false})},i18n:{t:s=>s}}[name]||{});
const cc={_RF:{push(){},pop(){}},Component:{},Node:{EventType:{TOUCH_START:1,TOUCH_END:2,TOUCH_CANCEL:3}},Sprite:{},Label:{},ScrollView:{},Tween:{stopAllByTarget(){}},tween:()=>({set(){return this},to(){return this},start(){}}),Class:def=>{C=function(){};Object.assign(C.prototype,def);return C;}};
const context={cc,console:{log(){}},storage:{getItem:()=>7,setItem:(key,val)=>{writes[key]=val}},sp:{Skeleton:{}}};
const source=input.source;vm.runInNewContext('('+source.slice(source.indexOf('function('),source.lastIndexOf('}, {'))+'})',context)(req,{exports:{}},{});
const v=new C();let restored;const manor={setItemByMuBiao:()=>[],getPlayerPosData:()=>({}),playerMoveToPlaceById(){},getMaxId:()=>58,initThePlayerByTiledID:(pos,local)=>{restored={pos,local}}};
for(const name of ['operateNode','logNode','map_node','item_map','cancelAutoBt','middleBtNode','middleSpine','goldDiceNode','logNode'])v[name]={getComponent:()=>name==='map_node'?manor:{},getChildByName:()=>({}),getComponentInChildren:()=>({})};
for(const name of ['coinSp','ticketSp','ticketGoldSp'])v[name]={node:{on(){}}};v.fillCoinLabel={};v.schedule=()=>{};v.unschedule=()=>{};v.tick_=()=>{};v.onLoad();
assert.equal(restored.pos,input.dream.curPos);assert.equal(restored.local,null);assert.equal(v._multiple,input.dream.multiple||1);assert.equal(v._bye,!!input.dream.skip);assert.equal(v.data.ticket,0);assert.equal(v.data.ticketGold,1);
// Auto continuation can clear the previous reward list while movement resolves.
v._inAuto=true;v._bye=false;v._hasItPassed=false;v.entityCountMap=null;v.onClick=()=>{};v.onMoveEnd({isEvent:false});
// The server can start a fresh week while this panel remains open.
delete v.onClick;v._inAuto=false;v._state=false;v.data.ticket=1;v.index=54;v._multiple=7;
v.middleSpine.getComponentInChildren=()=>({node:{}});v.middleSpine.getComponent=()=>({setAnimation:()=>false});
reply={_temp:{fromPos:10,point:1,stepMultiplier:2,skipReward:true,event:0,dropList:[]}};v.onClick();assert.equal(v.index,12);assert.equal(v._bye,true);
v.runNum=2;reply={_temp:{fromPos:5,point:2,skipReward:false,event:0,dropList:[]}};v.onConfirmGoldDice();assert.equal(v.index,7);assert.equal(v._bye,false);
process.stdout.write(JSON.stringify({multiple:v._multiple,skip:writes['_bye_1'],position:restored.pos,autoSurvived:true}));
