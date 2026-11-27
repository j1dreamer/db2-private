const fs=require('fs'),vm=require('vm'),assert=require('assert');const root=__dirname+'/../../';const supplied=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):null;
let now=10000,tasks=[],listeners=[],dispatches=[],visibleHints=[],sceneName='login',pops=0,disconnects=0,scale=1,recoveryCalls=0;const saved={};
function later(fn,ms){const t={fn,due:now+ms};tasks.push(t);return t;}function clear(t){tasks=tasks.filter(x=>x!==t);}function advance(ms){const until=now+ms;let count=0;while(true){tasks.sort((a,b)=>a.due-b.due);if(!tasks[0]||tasks[0].due>until)break;const t=tasks.shift();now=t.due;t.fn();if(++count>20000)throw Error('timer loop');}now=until;}
class Node{
 constructor(name){this.name=name||'';this.children=[];this.events={};this.components=[];this.x=0;this.y=0;this.scale=1;this.active=true;}
 set parent(p){this._parent=p;p.children.push(this);}get parent(){return this._parent;}
 setContentSize(w,h){this.width=w;this.height=h;}setPosition(x,y){if(typeof x==='object'){this.x=x.x;this.y=x.y;}else{this.x=x;this.y=y;}}
 getChildByName(name){return this.children.find(x=>x.name===name&&!x.dead);}addComponent(Type){const c=new Type();c.node=this;this.components.push(c);return c;}
 on(event,fn){this.events[event]=fn;}destroy(){this.dead=true;if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);}
 convertToNodeSpaceAR(p){if(this.parent)p=this.parent.convertToNodeSpaceAR(p);return{x:(p.x-this.x)/this.scale,y:(p.y-this.y)/this.scale};}
 convertToWorldSpaceAR(p){p={x:p.x*this.scale+this.x,y:p.y*this.scale+this.y};return this.parent?this.parent.convertToWorldSpaceAR(p):p;}
}
Node.EventType={TOUCH_START:'start',TOUCH_MOVE:'move',TOUCH_END:'end',TOUCH_CANCEL:'cancel'};
class Graphics{roundRect(){}circle(){}rect(){}fill(){}}
class Label{};Label.Overflow={CLAMP:1,SHRINK:2};class EditBox{};EditBox.InputMode={ANY:0};EditBox.InputFlag={PASSWORD:0};
class Touch{constructor(x,y,id){this.p={x,y};this.id=id;}getLocation(){return this.p;}getID(){return this.id;}_setPoint(p){this.p=p;}_setPrevPoint(){}}
class ET{constructor(touches){this.touches=touches;}};Object.assign(ET,{BEGAN:0,MOVED:1,ENDED:2,CANCELED:3});
const canvas=new Node('Canvas');canvas.width=1280;canvas.height=590;const handlers={};const scheduler={setTimeScale(v){scale=v;},getTimeScale(){return scale;}};
const cc={Node,Graphics,Label,EditBox,BlockInputEvents:class{},color(){return{};},Touch,Event:{EventTouch:ET},Canvas:{instance:{node:canvas}},sys:{localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v}},game:{EVENT_HIDE:'hide',on(n,fn){handlers[n]=fn;},restart(){handlers.restarted=true;}},Director:{EVENT_AFTER_SCENE_LAUNCH:'scene',EVENT_BEFORE_SCENE_LAUNCH:'before'},director:{getScheduler:()=>scheduler,on(n,fn){(handlers[n]||(handlers[n]=[])).push(fn);}},EventListener:{TOUCH_ONE_BY_ONE:1,create:x=>x},eventManager:{addListener(l){listeners.push(l);},dispatchEvent(event){dispatches.push({kind:event._eventCode,p:{...event.touches[0].getLocation()}});}}};
const server={uid:1,isReconnected:false},socket={queue:[1],requestTime:20,isConnected:true,disconnect(){disconnects++;}};
const modules={baseView:{removeLoading(){},addHintPanel(m){visibleHints.push(m);}},helper:{sendError(){}},battleScene:{instance:null},serverMain:server,socket,sceneManager:{NAME:{LOGIN_SCENE:'login'},getCurSceneInfo:()=>({name:sceneName}),popToLoginScene(){pops++;sceneName='login';}}};
const ctx=vm.createContext({window:{DB2_PRIVATE_DEFAULT_SERVER:'http://db2-server.invalid:20003',__require:n=>modules[n]},cc,Date:{now:()=>now},isFinite,setTimeout:later,clearTimeout:clear,console,XMLHttpRequest:class{}});
for(const file of ['private_ui','private_connection','private_settings','private_runtime','private_auto']){vm.runInContext(supplied?supplied[file]:fs.readFileSync(root+'tools/'+file+'.js','utf8'),ctx,{filename:file});}
const runtime=ctx.window.DB2PrivateRuntime,auto=ctx.window.DB2PrivateAuto;
function scene(){(handlers.scene||[]).forEach(fn=>fn());}scene();ctx.window.DB2PrivateSettings();
assert.equal(canvas.getChildByName('DB2PrivateSpeed').width,46);assert(!canvas.getChildByName('DB2PrivateAutoStatus').active);
function labels(n,out=[]){n.components.forEach(c=>{if(c instanceof Label)out.push(c);});n.children.forEach(x=>labels(x,out));return out;}
function button(title){const l=labels(canvas).find(x=>x.string===title);assert(l,'button '+title);return l.node.parent;}
const errorCard=canvas.getChildByName('DB2PrivateServerPanel').getChildByName('Card');assert.equal(errorCard.width,520);assert.equal(errorCard.height,276);button('Đóng').events.end();assert(!canvas.getChildByName('DB2PrivateServerPanel'));
const speed=canvas.getChildByName('DB2PrivateSpeed'),ev=(x,y)=>({getLocation:()=>({x,y}),stopPropagation(){}});
speed.events.start(ev(0,0));advance(1999);assert(!canvas.getChildByName('DB2PrivateControls'));advance(1);assert(canvas.getChildByName('DB2PrivateControls'));speed.events.end(ev(0,0));assert(labels(canvas).some(l=>l.string==='Tốc độ game'));
const track=canvas.getChildByName('DB2PrivateControls').getChildByName('Card').children.find(n=>n.width===366&&n.height===46);track.events.start(ev(183,-6));assert.equal(runtime.getSpeed(),10);assert.equal(scale,10);button('×').events.end();
speed.events.start(ev(0,0));speed.events.move(ev(-70,-30));advance(2000);speed.events.end(ev(-70,-30));assert(!canvas.getChildByName('DB2PrivateControls'));
auto.start('single',[{x:.1,y:.1}],100,3);assert(Math.abs(canvas.getChildByName('DB2PrivateAutoStatus').y-speed.y)>45);advance(299);assert.equal(dispatches.filter(x=>x.kind===2).length,2);advance(1);assert.equal(dispatches.filter(x=>x.kind===2).length,3);assert(!auto.isRunning());
dispatches=[];auto.start('multi',[{x:-.2,y:0},{x:.2,y:0}],200,2);advance(800);assert.equal(dispatches.length,8);assert.equal(dispatches[0].p.x,-256);assert.equal(dispatches[2].p.x,256);assert(!auto.isRunning());
auto.start('single',[{x:0,y:0}],100,0);advance(300);auto.stop();const previous=dispatches.length;advance(1000);assert.equal(dispatches.length,previous);
const listener=listeners[0];const human=(x,y,id=1)=>new Touch(x,y,id);
auto.pick('multi');assert(listener.swallowTouches);assert(listener.onTouchBegan(human(0,0)));listener.onTouchEnded(human(0,0));listener.onTouchBegan(human(100,0));listener.onTouchEnded(human(100,0));assert(auto.finishPick());assert(!listener.swallowTouches);assert.equal(auto.getConfig().points.length,2);
auto.beginRecord();assert(listener.onTouchBegan(human(0,0)));advance(100);listener.onTouchMoved(human(50,20));advance(100);listener.onTouchEnded(human(100,20));auto.finishRecord();assert.equal(auto.getConfig().record.length,3);assert(saved['db2.private.auto.v1']);dispatches=[];auto.play(false);advance(201);assert.deepEqual(dispatches.map(x=>x.kind),[0,1,2]);assert(!auto.isRunning());
auto.start('single',[{x:0,y:0}],100,0);scene();assert(!auto.isRunning());auto.start('single',[{x:0,y:0}],100,0);handlers.hide();assert(!auto.isRunning());
for(const n of ['100001','100002','100003']){const x=new Node(n);x.parent=canvas;}
ctx.window.DB2PrivateConnection.recover('Mạng mất kết nối, hãy nhấp thử lại');assert.equal(disconnects,1);assert.equal(socket.queue.length,0);assert.equal(socket.requestTime,null);assert(!canvas.getChildByName('100001'));assert(!canvas.getChildByName('100003').active);assert(canvas.getChildByName('DB2PrivateServerPanel'));ctx.window.DB2PrivateConnection.recover('Mạng mất kết nối');assert.equal(disconnects,1);button('Đóng').events.end();assert(!canvas.getChildByName('DB2PrivateServerPanel'));advance(1000);sceneName='home';ctx.window.DB2PrivateConnection.recover('Network unavailable');assert.equal(pops,1);
assert.throws(()=>auto.start('single',[{x:1,y:0}],100,1));assert.throws(()=>auto.start('single',[{x:0,y:0}],20,1));
console.log(JSON.stringify({compact_server_card:[520,276],circle_diameter:46,hold_ms:2000,slider_applies_immediately:true,drag_does_not_open_panel:true,single_clicks:3,multipoint_clicks:4,record_swipe_replay:true,stops_on_scene_background_and_network:true,network_popup_removed_without_retry:true,small_status_hidden_when_idle:true}));
