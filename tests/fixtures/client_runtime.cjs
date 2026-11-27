const fs=require('fs'),vm=require('vm'),assert=require('assert');
const input=JSON.parse(fs.readFileSync(0,'utf8'));let scale=1,removed=0,reports=[],hints=[];const saved={};
let ready=!input.delayedScheduler, activeScheduler;const events={};
if(input.delayedScheduler)saved['db2.private.gameSpeed']='7';
const scheduler={setTimeScale(v){scale=v;},getTimeScale(){return scale;}};
activeScheduler=scheduler;
const modules={baseView:{removeLoading(){removed++;},addHintPanel(s){hints.push(s);}},helper:{sendError(s){reports.push(s);}},battleScene:{instance:null}};
const context={window:{__require:n=>modules[n]},cc:{sys:{localStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v}},director:{getScheduler:()=>ready?activeScheduler:null,on(name,cb){events[name]=cb;}},Director:{EVENT_AFTER_SCENE_LAUNCH:'scene'},Canvas:{instance:null}},console:{error(){}},Date,isFinite,setTimeout,clearTimeout};
vm.runInNewContext(fs.readFileSync(__dirname+'/../../tools/private_runtime.js','utf8'),context);
const runtime=context.window.DB2PrivateRuntime;
if(input.delayedScheduler){
 assert.equal(scale,1);assert.equal(runtime.getSpeed(),7);
 runtime.setSpeed(4);events.scene();assert.equal(scale,1);
 ready=true;events.scene();assert.equal(scale,4);
 events.scene();assert.equal(scale,4); // no duplicate multiplication/wrapping
 activeScheduler.setTimeScale(3);assert.equal(scale,10);
 let replacementScale=0;
 activeScheduler={setTimeScale(v){replacementScale=v;},getTimeScale(){return replacementScale;}};
 events.scene();assert.equal(replacementScale,0); // preserve paused replacement
 activeScheduler.setTimeScale(1);assert.equal(replacementScale,4);
 activeScheduler=scheduler;events.scene();runtime.setSpeed(1);
 scheduler.setTimeScale(1);assert.equal(scale,1);
}
for(let n=1;n<=10;n++){runtime.setSpeed(n);assert.equal(scale,n);}
class Node {
 constructor(name){this.name=name||'';this.children=[];this.events={};}
 set parent(p){this._parent=p;p.children.push(this);}
 setContentSize(w,h){this.width=w;this.height=h;}
 setPosition(x,y){this.x=x;this.y=y;}
 getChildByName(name){return this.children.find(c=>c.name===name);}
 addComponent(Type){return new Type();}
 on(event,callback){this.events[event]=callback;}
}
Node.EventType={TOUCH_END:'touch',TOUCH_START:'start',TOUCH_MOVE:'move',TOUCH_CANCEL:'cancel'};
context.cc.Node=Node;context.cc.Graphics=class {roundRect(){}circle(){}fill(){}};context.cc.Label=class {};
context.cc.color=()=>({});const canvas=new Node('canvas');canvas.width=1280;canvas.height=720;
context.cc.Canvas.instance={node:canvas};runtime.mount();runtime.mount();assert.equal(canvas.children.length,1);
const button=canvas.getChildByName('DB2PrivateSpeed');assert.equal(button.width,46);assert.equal(button.height,46);
button.events.touch();assert.equal(runtime.getSpeed(),10);runtime.setSpeed(10);
scheduler.setTimeScale(3);assert.equal(scale,10);runtime.setSpeed(2);assert.equal(scale,6);
scheduler.setTimeScale(0);assert.equal(scale,0);scheduler.setTimeScale(1);assert.equal(scale,2);
const event=(x,y)=>({getLocation:()=>({x,y}),stopPropagation(){}});
const beforeRate=runtime.getSpeed(),beforeX=button.x,beforeY=button.y;
button.events.start(event(0,0));button.events.move(event(-100,-40));button.events.touch(event(-100,-40));
assert.equal(button.x,beforeX-100);assert.equal(button.y,beforeY-40);assert.equal(runtime.getSpeed(),beforeRate);assert(saved['db2.private.speedPosition.v1']);
button.events.start(event(0,0));button.events.move(event(100000,100000));button.events.cancel(event(100000,100000));assert.equal(runtime.getSpeed(),beforeRate);
assert(button.x+button.width/2<=canvas.width/2-8);assert(button.y+button.height/2<=canvas.height/2-8);
const nextCanvas=new Node('canvas');nextCanvas.width=800;nextCanvas.height=400;context.cc.Canvas.instance={node:nextCanvas};events.scene();const moved=nextCanvas.getChildByName('DB2PrivateSpeed');assert(moved);assert(moved.x+moved.width/2<=nextCanvas.width/2-8);assert(moved.y+moved.height/2<=nextCanvas.height/2-8);
assert.throws(()=>runtime.setSpeed(11));assert.throws(()=>runtime.setSpeed(0));assert.throws(()=>runtime.setSpeed(1.5));
if(input.socket){
 const pending=[];const pomelo={request:(route,msg,cb)=>pending.push({route,cb}),on(){},off(){},disconnect(){}};
 const socketContext={...context,setInterval:()=>1,Uint8Array};socketContext.cc._RF={push(){},pop(){}};
 const dependencies={pomeloClient:pomelo,util:{},zipUtils:{},serverConfig:{FUNS:{reqMsgFilter(){},resMsgFilter(){}}},underscore:{include:()=>false},buildExt:{}};
 const source=input.socket;const begin=source.indexOf('function('),end=source.lastIndexOf('}, {');const mod={exports:{}};
 vm.runInNewContext('('+source.slice(begin,end)+'})',socketContext)(name=>dependencies[name],mod,mod.exports);
 const socket=mod.exports;socket.log=()=>{};
 socket.setReceiveCb(()=>{throw Error('data generator failure');});
 let success=0;socket.request('one',{},()=>success++);socket.request('two',{},()=>success++);
 pending.shift().cb({code:200});assert.equal(socket.queue.length,1);assert.equal(pending[0].route,'two');
 socket.setReceiveCb(()=>{});pending.shift().cb({code:500,msg:'No tickets'});assert.equal(success,0);assert.equal(socket.queue.length,0);
 socket.request('three',{},()=>{throw Error('animation failure');});pending.shift().cb({code:200});assert.equal(socket.queue.length,0);
 socket.request('four',{},()=>success++);pending.shift().cb({code:200});assert.equal(success,1);
 assert.equal(removed,2);assert.equal(reports.length,2);assert.equal(hints.length,2);
 socket.request('logic.arena3v3Handler.challenge',{},()=>{});assert.equal(socket.timeOut,60);
 socket.request('logic.friendHandler.myFriendList',{},()=>{});pending.shift().cb({code:200});assert.equal(socket.timeOut,10);pending.shift().cb({code:200});assert.equal(socket.queue.length,0);
}
process.stdout.write(JSON.stringify({scale,removed,reports:reports.length,speed:runtime.getSpeed()}));
