// In-app touch automation. No OS-wide input or server-side reward shortcuts.
(function () {
    var store=cc.sys.localStorage,key='db2.private.auto.v1',config={mode:'single',points:[],interval:600,cycles:1,record:[],repeat:false};
    try { var saved=JSON.parse(store.getItem(key)||'null');if(saved&&Array.isArray(saved.points)&&Array.isArray(saved.record)){config=saved;} } catch(ignored){}
    var timer=null,running=false,recording=false,picking=false,injecting=false,listener=null,touch=null,recordStart=0,lastMove=0,activeRecordId=null,pointNode=null,statusLabel=null;
    function save(){store.setItem(key,JSON.stringify(config));}
    function canvas(){return cc.Canvas.instance&&cc.Canvas.instance.node;}
    function finite(n){return typeof n==='number'&&isFinite(n);}
    function validPoint(p){return p&&finite(p.x)&&finite(p.y)&&Math.abs(p.x)<=0.5&&Math.abs(p.y)<=0.5;}
    config.mode=config.mode==='multi'?'multi':'single';config.points=config.points.filter(validPoint).slice(0,20);
    if(!finite(config.interval)||config.interval<100||config.interval>10000)config.interval=600;
    if(!finite(config.cycles)||config.cycles<0||config.cycles>10000)config.cycles=1;
    config.record=config.record.slice(0,2001);
    function update(){if(statusLabel&&statusLabel.node&&statusLabel.node.parent&&(!cc.isValid||cc.isValid(statusLabel.node))){
        var c=canvas(),n=statusLabel.node.parent,speed=c&&c.getChildByName('DB2PrivateSpeed');
        if(speed){var y=speed.y-64;if(y < -c.height/2+30)y=speed.y+64;n.setPosition(Math.max(-c.width/2+60,Math.min(c.width/2-60,speed.x)),y);statusLabel.node.x=speed.x<0?96:-96;}
        n.active=running||recording||picking;statusLabel.string=recording?'Đang ghi · chạm Dừng để lưu':running?'Đang chạy':'Chọn điểm';}}
    function normalize(p){var c=canvas(),q=window.DB2PrivateUI.point(c,p);return{x:q.x/c.width,y:q.y/c.height};}
    function world(p){var c=canvas(),q={x:p.x*c.width,y:p.y*c.height};return c.convertToWorldSpaceAR?c.convertToWorldSpaceAR(q):q;}
    function inject(kind,p){
        if(!canvas()||!validPoint(p))throw Error('Điểm chạm không hợp lệ');
        var q=world(p),ET=cc.Event.EventTouch;
        if(kind==='start')touch=new cc.Touch(q.x,q.y,99991);
        else if(touch){var previous=touch.getLocation();touch._setPrevPoint(previous);touch._setPoint(q);}
        if(!touch)return;
        var event=new ET([touch]);event._eventCode=kind==='start'?ET.BEGAN:kind==='move'?ET.MOVED:kind==='cancel'?ET.CANCELED:ET.ENDED;
        injecting=true;try{cc.eventManager.dispatchEvent(event);}finally{injecting=false;if(kind==='end'||kind==='cancel')touch=null;}
    }
    function schedule(fn,delay){var due=Date.now()+delay;function tick(){var left=due-Date.now();if(left>4){timer=setTimeout(tick,left);return;}timer=null;if(running)fn();}timer=setTimeout(tick,Math.max(delay,1));}
    function stop(){running=false;recording=false;picking=false;activeRecordId=null;clearTimeout(timer);timer=null;if(touch){try{inject('cancel',normalize(touch.getLocation()));}catch(ignored){touch=null;}}if(listener)listener.swallowTouches=false;update();}
    function hidePanels(){var c=canvas();if(c)window.DB2PrivateUI.destroy(c.getChildByName('DB2PrivateControls'));}
    function error(message){stop();try{window.__require('baseView').addHintPanel(String(message));}catch(ignored){}}
    function isControl(p){
        var c=canvas();if(!c)return true;
        var names=['DB2PrivateSpeed','DB2PrivateAutoStatus','DB2PrivateControls','DB2PrivateServerPanel'];
        for(var i=0;i<names.length;i++){var n=c.getChildByName(names[i]);if(!n||n.active===false)continue;
            if(names[i]==='DB2PrivateControls'||names[i]==='DB2PrivateServerPanel')return true;
            var q=n.convertToNodeSpaceAR?n.convertToNodeSpaceAR(p):{x:p.x-n.x,y:p.y-n.y};if(Math.abs(q.x)<=n.width/2&&Math.abs(q.y)<=n.height/2)return true;
        }return false;
    }
    function recordEvent(kind,t){
        if(!recording)return;
        if(Date.now()-recordStart>120000||config.record.length>=2000){api.finishRecord();error('Đã lưu tối đa 2 phút / 2000 thao tác.');return;}
        var p=normalize(t.getLocation());if(!validPoint(p))return;
        config.record.push({kind:kind,x:p.x,y:p.y,ms:Date.now()-recordStart});
    }
    function drawPoints(){
        var c=canvas();if(!c)return;var U=window.DB2PrivateUI;U.destroy(pointNode);pointNode=new cc.Node('DB2PrivateAutoPoints');pointNode.parent=c;pointNode.zIndex=30000;
        config.points.forEach(function(p,i){var n=new cc.Node();n.parent=pointNode;n.setPosition(p.x*c.width,p.y*c.height);n.setContentSize(30,30);var g=n.addComponent(cc.Graphics);g.fillColor=cc.color(245,174,68,210);g.circle(0,0,15);g.fill();U.text(n,String(i+1),16,0,0,26,26);});
        // Marker nodes have no input listeners, so injected touches reach the game.
    }
    function mount(){
        var c=canvas();if(!c)return;var U=window.DB2PrivateUI;
        var existing=c.getChildByName('DB2PrivateAutoStatus');if(!existing){
            var n=U.button(c,'Dừng',90,c.width/2-64,c.height/2-164,function(){api.finishRecord();api.stop();},true);n.name='DB2PrivateAutoStatus';n.zIndex=31500;
            statusLabel=U.text(n,'Đã dừng',13,-96,0,100,40);
        }
        if(!listener&&cc.EventListener&&cc.eventManager){
            listener=cc.EventListener.create({event:cc.EventListener.TOUCH_ONE_BY_ONE,swallowTouches:false,
                onTouchBegan:function(t){if(injecting||isControl(t.getLocation())||(!picking&&!recording))return false;if(recording){if(activeRecordId!==null)return false;activeRecordId=t.getID();recordEvent('start',t);}return true;},
                onTouchMoved:function(t){if(recording&&t.getID()===activeRecordId&&Date.now()-lastMove>=40){lastMove=Date.now();recordEvent('move',t);}},
                onTouchEnded:function(t){if(injecting)return;if(picking){var p=normalize(t.getLocation());if(validPoint(p)){config.points.push(p);drawPoints();if(config.mode==='single'||config.points.length>=20){picking=false;listener.swallowTouches=false;save();api.open('auto');}}}else if(recording&&t.getID()===activeRecordId){recordEvent('end',t);activeRecordId=null;}},
                onTouchCancelled:function(t){if(recording&&t.getID()===activeRecordId){recordEvent('cancel',t);activeRecordId=null;}}
            });cc.eventManager.addListener(listener,-99);
        }
        update();
    }
    var api=window.DB2PrivateAuto={
        stop:stop,
        getConfig:function(){return JSON.parse(JSON.stringify(config));},
        isRunning:function(){return running;},isRecording:function(){return recording;},
        start:function(mode,points,interval,cycles){
            stop();if(!Array.isArray(points)||!points.length||points.length>20||points.some(function(p){return !validPoint(p);}))throw Error('Chọn 1–20 điểm trước');
            if(mode!=='single'&&mode!=='multi')throw Error('Chế độ không hợp lệ');
            interval=Number(interval);cycles=Number(cycles);
            if(!isFinite(interval)||interval<100||interval>10000||!isFinite(cycles)||cycles<0||cycles>10000||Math.floor(cycles)!==cycles)throw Error('Khoảng chạm 100–10000 ms; lượt lặp 0–10000');
            config.mode=mode;config.points=mode==='single'?points.slice(0,1):points.slice();config.interval=interval;config.cycles=cycles;save();running=true;hidePanels();var index=0;
            function step(){try{var p=config.points[index%config.points.length];inject('start',p);inject('end',p);index++;if(cycles&&index>=cycles*config.points.length){stop();return;}schedule(step,interval);}catch(e){error(e.message);}}
            schedule(step,interval);update();
        },
        pick:function(mode){stop();config.mode=mode;config.points=[];hidePanels();drawPoints();picking=true;if(listener)listener.swallowTouches=true;update();},
        beginRecord:function(){stop();config.record=[];recording=true;recordStart=Date.now();lastMove=0;hidePanels();update();},
        finishRecord:function(){if(recording){if(activeRecordId!==null&&config.record.length){var p=config.record[config.record.length-1];config.record.push({kind:'cancel',x:p.x,y:p.y,ms:Date.now()-recordStart});}recording=false;activeRecordId=null;save();update();}},
        play:function(repeat){
            stop();var actions=config.record;if(!actions.length)throw Error('Chưa có bản ghi');if(actions.length>2001)throw Error('Bản ghi quá dài');
            var prev=0,down=false;actions.forEach(function(a){if(!validPoint(a)||!finite(a.ms)||a.ms<prev||a.ms>125000||['start','move','end','cancel'].indexOf(a.kind)<0)throw Error('Bản ghi không hợp lệ');if(a.kind==='start'){if(down)throw Error('Chỉ hỗ trợ một ngón tay');down=true;}else if(!down)throw Error('Bản ghi thiếu bắt đầu');else if(a.kind==='end'||a.kind==='cancel')down=false;prev=a.ms;});
            if(down)throw Error('Bản ghi chưa kết thúc');running=true;hidePanels();var index=0,previous=0;
            function step(){try{var a=actions[index];inject(a.kind,a);previous=a.ms;index++;if(index===actions.length){if(!repeat){stop();return;}index=0;previous=0;schedule(step,Math.max(500,actions[0].ms));}else schedule(step,Math.max(1,actions[index].ms-previous));}catch(e){error(e.message);}}
            schedule(step,Math.max(1,actions[0].ms));update();
        },
        open:function(tab){
            api.finishRecord();stop();
            var U=window.DB2PrivateUI,m=U.modal('DB2PrivateControls',tab==='record'?'Ghi / phát lại':'Auto click',470,350);if(!m)return;var b=m.box,w=b.width;
            U.button(b,'Tốc độ',110,-132,99,function(){window.DB2PrivateRuntime.openSpeed();},true);U.button(b,'Auto',110,0,99,function(){api.open('auto');},tab!=='auto');U.button(b,'Ghi',110,132,99,function(){api.open('record');},tab!=='record');
            function safe(fn){return function(){try{fn();}catch(e){error(e.message);}};}
            if(tab==='record'){
                U.text(b,config.record.length+' thao tác · tối đa 2 phút · một ngón',17,0,42,w-40,40);
                U.button(b,'Bắt đầu ghi',180,-100,-12,function(){api.beginRecord();});U.button(b,'Dừng / lưu',180,100,-12,function(){api.finishRecord();api.open('record');},true);
                U.button(b,'Phát một lần',180,-100,-68,safe(function(){api.play(false);}));U.button(b,'Phát lặp',180,100,-68,safe(function(){api.play(true);}),true);
                U.button(b,'Xóa bản ghi',180,0,-124,function(){stop();config.record=[];save();api.open('record');},true);
            }else{
                U.button(b,'Một điểm',180,-100,43,function(){api.pick('single');},config.mode!=='single');U.button(b,'Nhiều điểm',180,100,43,function(){api.pick('multi');},config.mode!=='multi');
                U.text(b,config.points.length+' điểm · chọn nhiều: bấm nút tròn để kết thúc',15,0,0,w-36,32);
                U.text(b,'Cách nhau (ms)',15,-104,-39,160,25);U.text(b,'Lượt · 0 = liên tục',15,104,-39,170,25);
                var interval=U.edit(b,config.interval,170,-104,-76),cycles=U.edit(b,config.cycles,170,104,-76);
                U.button(b,'Chạy',170,-104,-132,safe(function(){api.start(config.mode,config.points,interval.string,cycles.string);}));U.button(b,'Dừng',170,104,-132,function(){api.finishRecord();stop();api.open('auto');},true);
            }
        },
        finishPick:function(){if(picking){picking=false;if(listener)listener.swallowTouches=false;save();return true;}return false;},
        mount:mount
    };
    if(cc.Director.EVENT_BEFORE_SCENE_LAUNCH)cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,function(){api.finishRecord();stop();});
    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH,function(){api.finishRecord();stop();pointNode=null;mount();});
    if(cc.game&&cc.game.on&&cc.game.EVENT_HIDE)cc.game.on(cc.game.EVENT_HIDE,function(){api.finishRecord();stop();});
}());
