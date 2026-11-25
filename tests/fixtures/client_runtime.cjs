const fs=require('fs'),vm=require('vm'),assert=require('assert');
const input=JSON.parse(fs.readFileSync(0,'utf8'));let scale=1,removed=0,reports=[],hints=[];const saved={};
const scheduler={setTimeScale(v){scale=v;},getTimeScale(){return scale;}};
const modules={baseView:{removeLoading(){removed++;},addHintPanel(s){hints.push(s);}},helper:{sendError(s){reports.push(s);}},battleScene:{instance:null}};
const context={window:{__require:n=>modules[n]},cc:{sys:{localStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v}},director:{getScheduler:()=>scheduler,on(){}},Director:{EVENT_AFTER_SCENE_LAUNCH:'scene'},Canvas:{instance:null}},console:{error(){}},Date,isFinite};
vm.runInNewContext(fs.readFileSync(__dirname+'/../../tools/private_runtime.js','utf8'),context);
const runtime=context.window.DB2PrivateRuntime;
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
Node.EventType={TOUCH_END:'touch'};
context.cc.Node=Node;context.cc.Graphics=class {roundRect(){}fill(){}};context.cc.Label=class {};
context.cc.color=()=>({});const canvas=new Node('canvas');canvas.width=1280;canvas.height=720;
context.cc.Canvas.instance={node:canvas};runtime.mount();runtime.mount();assert.equal(canvas.children.length,1);
const button=canvas.getChildByName('DB2PrivateSpeed');assert.equal(button.width,130);assert.equal(button.height,42);
button.events.touch();assert.equal(runtime.getSpeed(),1);runtime.setSpeed(10);
scheduler.setTimeScale(3);assert.equal(scale,10);runtime.setSpeed(2);assert.equal(scale,6);
scheduler.setTimeScale(0);assert.equal(scale,0);scheduler.setTimeScale(1);assert.equal(scale,2);
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
