// Authored Cocos implementation of the plan/point/record workflow studied in X7.
// Android SDK binaries/artwork are not embedded. Exact visual parity is user-verification pending.
(function () {
    var store=cc.sys.localStorage,KEY='db2.private.auto.plans.v2',DRAFT='db2.private.auto.draft.v2';
    var plans=[],draft=null,dirty=false,editing=false,status='idle',timer=null,run=null,touch=null,injecting=false,listener=null;
    var markers=null,bar=null,statusLabel=null,recordStart=0,recordId=null,lastMove=0,recordLast=null,sceneResume=false,sceneBusy=false,page=0,idCounter=0;
    var ui=window.DB2PrivateUI,collapsed=false,quickPanel=null,picking=false,pickerTouch=null,lastTarget=null,hits=0,targetListener=null;
    function clone(x){return JSON.parse(JSON.stringify(x));}
    function finite(x){return typeof x==='number'&&isFinite(x);}
    function point(p){return p&&finite(p.x)&&finite(p.y)&&Math.abs(p.x)<=0.5&&Math.abs(p.y)<=0.5;}
    function integer(x,min,max){return finite(x)&&Math.floor(x)===x&&x>=min&&x<=max;}
    function canvas(){return cc.Canvas.instance&&cc.Canvas.instance.node;}
    function validPlan(p){
        return p&&typeof p.id==='string'&&p.id.length<=80&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=40&&['single','multi','record'].indexOf(p.type)>=0&&integer(p.cycles,0,10000)&&Array.isArray(p.points)&&p.points.length<=20&&(p.type!=='single'||p.points.length<=1)&&p.points.every(function(v){return point(v)&&integer(v.delay,100,600000)&&integer(v.hold,20,10000);})&&Array.isArray(p.actions)&&p.actions.length<=2001;
    }
    function validateRecord(actions){
        var previous=0,down=false;
        if(!actions.length)throw Error(window.DB2PrivateI18n.t("auto.001"));
        actions.forEach(function(a){
            if(!point(a)||!integer(a.ms,0,125000)||a.ms<previous||['start','move','end','cancel'].indexOf(a.kind)<0)throw Error(window.DB2PrivateI18n.t("auto.002"));
            if(a.kind==='start'){if(down)throw Error(window.DB2PrivateI18n.t("auto.003"));down=true;}
            else if(!down)throw Error(window.DB2PrivateI18n.t("auto.004"));
            else if(a.kind==='end'||a.kind==='cancel')down=false;
            previous=a.ms;
        });if(down)throw Error(window.DB2PrivateI18n.t("auto.005"));
    }
    function id(){var value;do{value='P'+Date.now().toString(36)+'_'+(++idCounter).toString(36);}while(plans.some(function(p){return p.id===value;}));return value;}
    function displayName(plan){var key=plan.nameKey,catalog=window.DB2_PRIVATE_UI_LOCALES||{};if(!key)['auto.defaultSingle','auto.defaultMulti','auto.defaultRecord'].some(function(k){if((catalog.vi||{})[k]===plan.name||(catalog.en||{})[k]===plan.name){key=k;return true;}return false;});return key?window.DB2PrivateI18n.t(key):plan.name;}
    function newPlan(name,type){return{id:id(),name:String(name||window.DB2PrivateI18n.t("auto.006")).trim().slice(0,40)||window.DB2PrivateI18n.t("auto.006"),type:type,points:[],actions:[],cycles:1,updated:Date.now()};}
    function persist(){store.setItem(KEY,JSON.stringify({version:2,plans:plans}));}
    function persistDraft(){if(draft)store.setItem(DRAFT,JSON.stringify({plan:draft,dirty:dirty}));}
    function changed(){dirty=true;persistDraft();}
    function hint(message){try{window.__require('baseView').addHintPanel(String(message));}catch(ignored){}}
    function safe(fn){return function(){try{fn();}catch(e){hint(e.message);}};}
    try {var saved=JSON.parse(store.getItem(KEY)||'null');if(saved&&saved.version===2&&Array.isArray(saved.plans))plans=saved.plans.filter(validPlan).slice(0,30);} catch(ignored){}
    if(!store.getItem(KEY)){
        try {var old=JSON.parse(store.getItem('db2.private.auto.v1')||'null');
            if(old&&Array.isArray(old.points)&&old.points.some(point)){
                var migrated=newPlan(window.DB2PrivateI18n.t("auto.007"),old.mode==='multi'?'multi':'single');migrated.points=old.points.filter(point).slice(0,migrated.type==='single'?1:20).map(function(p){return{x:p.x,y:p.y,delay:integer(old.interval,100,10000)?old.interval:600,hold:40};});migrated.cycles=integer(old.cycles,0,10000)?old.cycles:1;plans.push(migrated);
            }
            if(old&&Array.isArray(old.record)&&old.record.length){try{validateRecord(old.record);var recordingPlan=newPlan(window.DB2PrivateI18n.t("auto.008"),'record');recordingPlan.actions=clone(old.record);plans.push(recordingPlan);}catch(ignoredRecord){}}
        }catch(ignoredMigration){}persist();
    }
    try{var pending=JSON.parse(store.getItem(DRAFT)||'null');if(pending&&validPlan(pending.plan)){draft=pending.plan;dirty=!!pending.dirty;if(draft.type==='record'&&draft.actions.length){try{validateRecord(draft.actions);}catch(unfinished){var last=draft.actions[draft.actions.length-1];if(last&&point(last)&&integer(last.ms,0,125000)&&['start','move'].indexOf(last.kind)>=0)draft.actions.push({kind:'cancel',x:last.x,y:last.y,ms:Math.min(125000,last.ms+1)});try{validateRecord(draft.actions);}catch(corrupt){draft.actions=[];}dirty=true;}}}}catch(ignoredDraft){}
    function hideDialog(){var c=canvas();if(c){ui.destroy(c.getChildByName('DB2PrivateControls'));ui.destroy(c.getChildByName('DB2PrivateAutoQuick'));}quickPanel=null;}
    function normalize(p){var c=canvas(),q=ui.point(c,p);return{x:Math.max(-0.48,Math.min(0.48,q.x/c.width)),y:Math.max(-0.46,Math.min(0.46,q.y/c.height))};}
    function world(p){var c=canvas(),q={x:p.x*c.width,y:p.y*c.height};return ui.screen?ui.screen(c,q):c.convertToWorldSpaceAR?c.convertToWorldSpaceAR(q):q;}
    function inject(kind,p){
        if(!canvas()||!point(p))throw Error(window.DB2PrivateI18n.t("auto.009"));
        var q=world(p),ET=cc.Event.EventTouch;
        if(kind==='start')touch=new cc.Touch(q.x,q.y,99991);
        else if(touch){touch._setPrevPoint(touch.getLocation());touch._setPoint(q);}
        if(!touch)return;
        var event=new ET([touch]);event._eventCode=kind==='start'?ET.BEGAN:kind==='move'?ET.MOVED:kind==='cancel'?ET.CANCELED:ET.ENDED;
        var manager=cc.internal&&cc.internal.eventManager||cc.eventManager;
        injecting=true;
        try{
            if(manager._getListeners){
                if(kind==='start'){
                    targetListener=null;lastTarget=null;
                    var id=cc.EventListener.ListenerID?cc.EventListener.ListenerID.TOUCH_ONE_BY_ONE:'__cc_touch_one_by_one';
                    manager._sortEventListeners(id);var registry=manager._getListeners(id),list=registry?registry.getSceneGraphPriorityListeners():[];
                    for(var i=0;i<list.length;i++){
                        var candidate=list[i],node=candidate._node||candidate.owner;
                        if(!node||isToolNode(node)||node.activeInHierarchy===false||candidate._isPaused&&candidate._isPaused()||candidate.isEnabled&&!candidate.isEnabled()||candidate._isRegistered&&!candidate._isRegistered())continue;
                        if(!node._hitTest||!node._hitTest(q,candidate)||!candidate.onTouchBegan)continue;
                        event.touch=event.currentTouch=touch;event.currentTarget=node;
                        if(candidate.onTouchBegan(touch,event)){targetListener=candidate;lastTarget=node;break;}
                    }
                    if(!targetListener)throw Error(window.DB2PrivateI18n.t('auto.miss'));
                }else if(targetListener){
                    if(lastTarget.activeInHierarchy===false||cc.isValid&&!cc.isValid(lastTarget))throw Error(window.DB2PrivateI18n.t('auto.miss'));
                    event.touch=event.currentTouch=touch;event.currentTarget=lastTarget;
                    var callback=kind==='move'?'onTouchMoved':kind==='cancel'?'onTouchCancelled':'onTouchEnded';
                    if(targetListener[callback])targetListener[callback](touch,event);
                    if(kind==='end')hits++;
                }
            }else{
                // Compatibility for older Cocos runtimes without listener access.
                manager.dispatchEvent(event);
            }
        }finally{injecting=false;if(kind==='end'||kind==='cancel'){touch=null;targetListener=null;}}

    }
    function cancelTouch(){if(touch){try{var p=normalize(touch.getLocation());inject('cancel',p);}catch(ignored){touch=null;}}}
    function clearTimer(){clearTimeout(timer);timer=null;}
    function rewindGesture(){if(touch&&run){cancelTouch();run.index=run.gestureStart;run.remaining=run.steps[run.index].wait;}}
    function schedule(delay){
        if(!run||status!=='running'||sceneBusy)return;
        run.remaining=delay;run.due=Date.now()+delay;
        function tick(){if(!run||status!=='running'||sceneBusy)return;var left=run.due-Date.now();if(left>3){timer=setTimeout(tick,left);return;}timer=null;step();}
        timer=setTimeout(tick,Math.max(1,delay));
    }
    function step(){
        if(!run||status!=='running')return;
        try{
            var a=run.steps[run.index];if(a.kind==='start')run.gestureStart=run.index;
            inject(a.kind,a);if(!run||status!=='running')return;run.index++;
            if(run.index===run.steps.length){run.loops++;if(run.cycles&&run.loops>=run.cycles){api.stop();return;}run.index=0;}
            redraw(false);schedule(run.steps[run.index].wait);
        }catch(e){api.stop();hint(e.message);}
    }
    function beginRun(cycles){
        picking=false;
        if(!draft)throw Error(window.DB2PrivateI18n.t("auto.010"));
        if(!integer(cycles,0,10000))throw Error(window.DB2PrivateI18n.t("auto.011"));
        api.finishRecord();api.stop();var steps=[];
        if(draft.type==='record'){
            validateRecord(draft.actions);var previous=0;
            draft.actions.forEach(function(a){steps.push({kind:a.kind,x:a.x,y:a.y,wait:Math.max(1,a.ms-previous)});previous=a.ms;});
            steps[0].wait=Math.max(100,steps[0].wait);
        }else{
            if(!draft.points.length){api.pickPoint();return;}
            draft.points.forEach(function(p){steps.push({kind:'start',x:p.x,y:p.y,wait:p.delay},{kind:'end',x:p.x,y:p.y,wait:p.hold});});
        }
        draft.cycles=cycles;changed();run={steps:steps,index:0,loops:0,cycles:cycles,gestureStart:0,remaining:steps[0].wait};status='running';editing=true;hideDialog();redraw(true);schedule(run.remaining);
    }
    function colorButton(parent,title,width,x,y,fn,selected){
        var n=new cc.Node();n.parent=parent;n.setPosition(x,y);n.setContentSize(width,44);
        var g=n.addComponent(cc.Graphics);g.fillColor=selected?cc.color(16,191,166,255):cc.color(43,55,62,255);g.roundRect(-width/2,-22,width,44,7);g.fill();
        var label=ui.text(n,title,16,0,0,width-8,36);label.enableWrapText=false;label.overflow=cc.Label.Overflow.SHRINK;if(selected)label.node.color=cc.color(10,27,36,255);
        n.on(cc.Node.EventType.TOUCH_START,function(e){if(e&&e.stopPropagation)e.stopPropagation();});
        n.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();safe(fn)();});return n;
    }
    function isToolNode(node){for(var n=node;n;n=n.parent)if(/^DB2Private/.test(n.name||''))return true;return false;}
    function isControl(p){
        var c=canvas();if(!c)return true;
        for(var i=0,names=['DB2PrivateControls','DB2PrivateServerPanel','DB2PrivateAutoBar','DB2PrivateAutoQuick','DB2PrivateSpeed','DB2PrivateServerButton'];i<names.length;i++){
            var n=c.getChildByName(names[i]);if(!n||n.active===false)continue;
            if(names[i]==='DB2PrivateControls'||names[i]==='DB2PrivateServerPanel')return true;
            var q=n.convertToNodeSpaceAR?n.convertToNodeSpaceAR(p):{x:p.x-n.x,y:p.y-n.y};if(Math.abs(q.x)<=n.width/2&&Math.abs(q.y)<=n.height/2)return true;
        }return false;
    }
    function drawMarkers(){
        var c=canvas();if(!c)return;ui.destroy(markers);markers=null;
        if(!editing||!draft||draft.type==='record'||status==='running'||status==='recording')return;
        markers=new cc.Node('DB2PrivateAutoPoints');markers.parent=c;markers.zIndex=31200;
        draft.points.forEach(function(p,index){
            var n=new cc.Node('Point'+(index+1));n.parent=markers;n.setContentSize(42,42);n.setPosition(p.x*c.width,p.y*c.height);
            var g=n.addComponent(cc.Graphics);g.fillColor=cc.color(11,186,163,225);g.circle(0,0,20);g.fill();ui.text(n,String(index+1),19,0,0,36,34);var start=null,moved=false;
            n.on(cc.Node.EventType.TOUCH_START,function(e){e.stopPropagation();api.pause();start=e.getLocation();moved=false;});
            n.on(cc.Node.EventType.TOUCH_MOVE,function(e){e.stopPropagation();var q=e.getLocation();if(!start)return;if(Math.pow(q.x-start.x,2)+Math.pow(q.y-start.y,2)>36)moved=true;if(moved){var v=normalize(q);p.x=v.x;p.y=v.y;n.setPosition(p.x*c.width,p.y*c.height);}});
            n.on(cc.Node.EventType.TOUCH_END,function(e){e.stopPropagation();if(moved){api.stop();changed();drawMarkers();}else api.openPoint(index);start=null;});
            n.on(cc.Node.EventType.TOUCH_CANCEL,function(e){if(e&&e.stopPropagation)e.stopPropagation();if(moved){api.stop();changed();drawMarkers();}start=null;});
        });
    }
    function dragBar(node){var origin=null;
        var handle=colorButton(node,'⋮',32,-172,0,function(){},false);
        handle.on(cc.Node.EventType.TOUCH_START,function(e){e.stopPropagation();origin={p:ui.point(canvas(),e.getLocation()),x:node.x,y:node.y};});
        handle.on(cc.Node.EventType.TOUCH_MOVE,function(e){e.stopPropagation();if(!origin)return;var c=canvas(),p=ui.point(c,e.getLocation());node.setPosition(Math.max(-c.width/2+node.width/2+8,Math.min(c.width/2-node.width/2-8,origin.x+p.x-origin.p.x)),Math.max(-c.height/2+35,Math.min(c.height/2-35,origin.y+p.y-origin.p.y)));});
        handle.on(cc.Node.EventType.TOUCH_END,function(e){e.stopPropagation();origin=null;});
    }
    function redraw(rebuild){
        var c=canvas();if(!c)return;
        if(!editing){ui.destroy(bar);bar=null;ui.destroy(markers);markers=null;return;}
        if(collapsed){
            if(rebuild||!bar||bar.name!=='DB2PrivateAutoBar'||bar.width!==64){
                ui.destroy(bar);bar=new cc.Node('DB2PrivateAutoBar');bar.parent=c;bar.zIndex=31600;bar.setContentSize(64,52);bar.setPosition(-c.width/2+48,0);
                colorButton(bar,status==='running'?'Ⅱ':'Auto',56,0,0,function(){collapsed=false;redraw(true);},true);
            }return;
        }
        if(rebuild||!bar||!bar.parent||cc.isValid&&!cc.isValid(bar)){
            var previous=bar&&bar.parent?{x:bar.x,y:bar.y}:null;ui.destroy(bar);bar=new cc.Node('DB2PrivateAutoBar');bar.parent=c;bar.zIndex=31600;bar.setContentSize(386,50);bar.setPosition(previous?previous.x:0,previous?previous.y:-c.height/2+42);
            var g=bar.addComponent(cc.Graphics);g.fillColor=cc.color(18,29,34,245);g.roundRect(-193,-25,386,50,10);g.fill();dragBar(bar);
            var playTitle=status==='recording'?window.DB2PrivateI18n.t('auto.done'):status==='armed'?window.DB2PrivateI18n.t('auto.record'):status==='running'?'II':window.DB2PrivateI18n.t("auto.013");
            colorButton(bar,playTitle,44,-130,0,function(){if(status==='recording'){api.finishRecord();api.openSave();}else if(status==='armed')api.beginRecord();else if(status==='running')api.pause();else if(status==='paused')api.resume();else api.playCurrent();},true);
            colorButton(bar,window.DB2PrivateI18n.t("auto.014"),44,-82,0,function(){if(status==='recording'){api.finishRecord();api.openSave();}else api.stop();});
            colorButton(bar,'+',44,-34,0,function(){api.pickPoint();});colorButton(bar,'−',44,14,0,function(){if(!draft||draft.type==='record')return;api.deletePoint(draft.points.length-1);});
            colorButton(bar,window.DB2PrivateI18n.t("auto.015"),44,62,0,function(){api.openPlanSettings();});colorButton(bar,window.DB2PrivateI18n.t("auto.016"),52,114,0,function(){api.openSave();});colorButton(bar,window.DB2PrivateI18n.t("auto.017"),44,164,0,function(){collapsed=true;redraw(true);});
            statusLabel=ui.text(bar,'',13,0,42,370,26);
        }
        if(statusLabel&&statusLabel.node&&statusLabel.node.parent&&(!cc.isValid||cc.isValid(statusLabel.node)))statusLabel.string=(draft?displayName(draft):'')+' · '+(status==='running'?window.DB2PrivateI18n.t("auto.018")+(run.loops+1):status==='paused'?window.DB2PrivateI18n.t("auto.019"):status==='recording'?window.DB2PrivateI18n.t("auto.020")+draft.actions.length+window.DB2PrivateI18n.t("auto.021"):status==='armed'?window.DB2PrivateI18n.t("auto.022"):dirty?window.DB2PrivateI18n.t("auto.023"):window.DB2PrivateI18n.t("auto.024"));
        if(statusLabel&&picking)statusLabel.string=window.DB2PrivateI18n.t('auto.pick');
        if(statusLabel&&status==='running')statusLabel.string+=window.DB2PrivateI18n.t('auto.hits')+hits;
        if(rebuild)drawMarkers();
    }
    function capture(kind,t){
        if(status!=='recording')return;
        if(Date.now()-recordStart>120000||draft.actions.length>=2000){api.finishRecord();hint(window.DB2PrivateI18n.t("auto.025"));api.openSave();return;}
        var p=normalize(t.getLocation());recordLast=p;draft.actions.push({kind:kind,x:p.x,y:p.y,ms:Date.now()-recordStart});dirty=true;if(kind==='end'||kind==='cancel'||draft.actions.length%10===0)persistDraft();redraw(false);
    }
    function mount(){
        var c=canvas();bar=c?c.getChildByName('DB2PrivateAutoBar'):null;markers=c?c.getChildByName('DB2PrivateAutoPoints'):null;statusLabel=null;
        if(!pickerTouch&&cc.EventListener&&cc.eventManager){pickerTouch=cc.EventListener.create({event:cc.EventListener.TOUCH_ONE_BY_ONE,swallowTouches:true,onTouchBegan:function(t){if(!picking||injecting||isControl(t.getLocation()))return false;var p=normalize(t.getLocation());if(draft.type==='single')draft.points=[];draft.points.push({x:p.x,y:p.y,delay:600,hold:60});picking=false;changed();redraw(true);return true;},onTouchEnded:function(){}});cc.eventManager.addListener(pickerTouch,-100);}
        if(!listener&&cc.EventListener&&cc.eventManager){listener=cc.EventListener.create({event:cc.EventListener.TOUCH_ONE_BY_ONE,swallowTouches:false,
            onTouchBegan:function(t){if(injecting||status!=='recording'||recordId!==null||isControl(t.getLocation()))return false;recordId=t.getID();capture('start',t);return true;},
            onTouchMoved:function(t){if(status==='recording'&&t.getID()===recordId&&Date.now()-lastMove>=40){lastMove=Date.now();capture('move',t);}},
            onTouchEnded:function(t){if(!injecting&&status==='recording'&&t.getID()===recordId){capture('end',t);recordId=null;}},
            onTouchCancelled:function(t){if(status==='recording'&&t.getID()===recordId){capture('cancel',t);recordId=null;}}
        });cc.eventManager.addListener(listener,-99);}redraw(true);
    }
    var api=window.DB2PrivateAuto={
        listPlans:function(){return clone(plans);},getDraft:function(){return draft?clone(draft):null;},getState:function(){return{status:status,dirty:dirty,editing:editing,index:run?run.index:0,loops:run?run.loops:0,picking:picking,confirmedTouches:hits,lastTarget:lastTarget?lastTarget.name:null};},
        isRunning:function(){return status==='running';},isRecording:function(){return status==='recording';},
        createPlan:function(name,type){
            if(['single','multi','record'].indexOf(type)<0)throw Error(window.DB2PrivateI18n.t("auto.026"));api.finishRecord();api.stop();draft=newPlan(name,type);dirty=true;editing=true;
            if(type!=='record')draft.points.push({x:0,y:0,delay:600,hold:40});status=type==='record'?'armed':'idle';persistDraft();hideDialog();redraw(true);return clone(draft);
        },
        loadPlan:function(identifier){var p=plans.filter(function(p){return p.id===identifier;})[0];if(!p)throw Error(window.DB2PrivateI18n.t("auto.027"));api.finishRecord();api.stop();draft=clone(p);dirty=false;editing=true;status='idle';persistDraft();hideDialog();redraw(true);},
        savePlan:function(name){
            api.finishRecord();if(!draft)throw Error(window.DB2PrivateI18n.t("auto.028"));var title=String(name===undefined?draft.name:name).trim();if(!title||title.length>40)throw Error(window.DB2PrivateI18n.t("auto.029"));
            var candidate=clone(draft);candidate.name=title;if(name!==undefined&&title!==displayName(draft))delete candidate.nameKey;candidate.updated=Date.now();if(!validPlan(candidate))throw Error(window.DB2PrivateI18n.t("auto.030"));if(candidate.type==='record')validateRecord(candidate.actions);else if(!candidate.points.length)throw Error(window.DB2PrivateI18n.t("auto.031"));
            var index=plans.findIndex(function(p){return p.id===candidate.id;});if(index<0){if(plans.length>=30)throw Error(window.DB2PrivateI18n.t("auto.032"));plans.push(candidate);}else plans[index]=candidate;draft=clone(candidate);dirty=false;persist();persistDraft();redraw(true);return candidate.id;
        },
        deletePlan:function(identifier){api.stop();plans=plans.filter(function(p){return p.id!==identifier;});if(draft&&draft.id===identifier){draft=null;editing=false;dirty=false;store.removeItem&&store.removeItem(DRAFT);}persist();redraw(true);},
        pickPoint:function(){if(!draft||draft.type==='record')return;api.stop();if(draft.points.length>=(draft.type==='single'?1:20)){if(draft.type==='single')draft.points=[];else throw Error(window.DB2PrivateI18n.t('auto.035'));}picking=true;editing=true;hideDialog();redraw(true);},
        addPoint:function(){if(!draft||draft.type==='record')throw Error(window.DB2PrivateI18n.t("auto.033"));if(draft.points.length>=(draft.type==='single'?1:20))throw Error(draft.type==='single'?window.DB2PrivateI18n.t("auto.034"):window.DB2PrivateI18n.t("auto.035"));api.stop();var n=draft.points.length;draft.points.push({x:Math.min(.4,n*.035),y:0,delay:600,hold:40});changed();redraw(true);},
        updatePoint:function(index,values){if(!draft||!draft.points[index])throw Error(window.DB2PrivateI18n.t("auto.036"));var next=Object.assign({},draft.points[index],values);if(!point(next)||!integer(next.delay,100,600000)||!integer(next.hold,20,10000))throw Error(window.DB2PrivateI18n.t("auto.037"));api.stop();draft.points[index]=next;changed();redraw(true);},
        deletePoint:function(index){if(!draft||index<0||index>=draft.points.length)return;api.stop();draft.points.splice(index,1);changed();redraw(true);},
        movePoint:function(index,direction){if(!draft||!draft.points[index])return;var other=index+direction;if(other<0||other>=draft.points.length)return;api.stop();var temp=draft.points[index];draft.points[index]=draft.points[other];draft.points[other]=temp;changed();redraw(true);},
        playCurrent:function(){beginRun(draft?draft.cycles:1);},
        pause:function(){if(status!=='running'||!run)return;run.remaining=Math.max(1,run.due-Date.now());clearTimer();rewindGesture();status='paused';redraw(true);},
        resume:function(){if(status==='paused'&&run){status='running';hideDialog();redraw(true);schedule(run.remaining);}},
        stop:function(){picking=false;clearTimer();cancelTouch();run=null;sceneResume=false;if(status==='recording')api.finishRecord();status=draft&&draft.type==='record'&&!draft.actions.length?'armed':'idle';redraw(true);},
        beginRecord:function(){if(!draft||draft.type!=='record')api.createPlan(window.DB2PrivateI18n.t("auto.038"),'record');api.stop();draft.actions=[];dirty=true;recordId=null;recordLast=null;recordStart=Date.now();lastMove=0;status='recording';editing=true;hideDialog();persistDraft();redraw(true);},
        finishRecord:function(){if(status==='recording'){
            if(recordId!==null&&recordLast)draft.actions.push({kind:'cancel',x:recordLast.x,y:recordLast.y,ms:Math.min(125000,Date.now()-recordStart)});recordId=null;status='idle';dirty=true;persistDraft();redraw(true);
        }},
        beforeModal:function(){api.finishRecord();api.pause();},
        open:function(tab){api.openQuick();},finishPick:function(){return false;},
        minimize:function(){collapsed=true;hideDialog();redraw(true);},
        openQuick:function(){
            try{var scenes=window.__require('sceneManager');if(scenes.getCurSceneInfo().name===scenes.NAME.LOGIN_SCENE){hint(window.DB2PrivateI18n.t("auto.039"));return;}}catch(ignored){}
            api.beforeModal();hideDialog();var c=canvas();if(!c)return;
            var b=new cc.Node('DB2PrivateAutoQuick');b.parent=c;b.zIndex=32400;b.setContentSize(288,304);b.setPosition(-c.width/2+168,0);quickPanel=b;
            if(cc.BlockInputEvents)b.addComponent(cc.BlockInputEvents);
            var g=b.addComponent(cc.Graphics);g.fillColor=cc.color(16,25,40,250);g.roundRect(-144,-152,288,304,12);g.fill();
            ui.text(b,window.DB2PrivateI18n.t('auto.title'),20,-18,119,218,32);
            colorButton(b,'×',44,112,119,hideDialog);
            ui.text(b,window.DB2PrivateI18n.t("auto.041"),15,0,76,260,34);
            ['single','multi','record'].forEach(function(type,i){colorButton(b,[window.DB2PrivateI18n.t("auto.042"),window.DB2PrivateI18n.t("auto.043"),window.DB2PrivateI18n.t("auto.044")][i],80,-88+i*88,30,function(){
                api.guardDraft(function(){api.createPlan(type==='record'?window.DB2PrivateI18n.t("auto.045"):'Auto '+(type==='single'?window.DB2PrivateI18n.t("auto.046"):window.DB2PrivateI18n.t("auto.047")),type);draft.nameKey=type==='single'?'auto.defaultSingle':type==='multi'?'auto.defaultMulti':'auto.defaultRecord';draft.cycles=0;changed();collapsed=false;if(type==='record')api.beginRecord();else{draft.points=[];api.pickPoint();}});
            },true);});
            if(draft){
                ui.text(b,displayName(draft)+' · '+(status==='paused'?window.DB2PrivateI18n.t("auto.048"):window.DB2PrivateI18n.t("auto.024")),15,0,-18,260,34);
                colorButton(b,status==='paused'?window.DB2PrivateI18n.t("auto.049"):window.DB2PrivateI18n.t("auto.013"),120,-66,-65,function(){collapsed=false;hideDialog();if(status==='paused')api.resume();else api.playCurrent();},true);
                colorButton(b,window.DB2PrivateI18n.t("auto.014"),120,66,-65,function(){api.stop();api.openQuick();});
            }else ui.text(b,window.DB2PrivateI18n.t("auto.050"),15,0,-52,260,44);
            colorButton(b,window.DB2PrivateI18n.t("auto.051"),252,0,-121,function(){api.openLibrary();});
        },
        openLibrary:function(){
            api.beforeModal();hideDialog();var m=ui.modal('DB2PrivateControls',window.DB2PrivateI18n.t("auto.052"),540,366);if(!m)return;var b=m.box,rows=plans.slice(page*4,page*4+4);
            colorButton(b,window.DB2PrivateI18n.t("auto.053"),130,-174,117,function(){api.openCreate();},true);
            if(draft)colorButton(b,dirty?window.DB2PrivateI18n.t("auto.054"):window.DB2PrivateI18n.t("auto.055"),140,-26,117,function(){editing=true;hideDialog();redraw(true);});
            colorButton(b,window.DB2PrivateI18n.t("auto.056"),112,132,117,function(){window.DB2PrivateRuntime.openSpeed();});
            if(!rows.length)ui.text(b,window.DB2PrivateI18n.t("auto.057"),18,0,12,480,50);
            rows.forEach(function(p,i){var y=58-i*47;colorButton(b,displayName(p).slice(0,18)+' · '+(p.type==='record'?window.DB2PrivateI18n.t('auto.record'):p.type==='single'?window.DB2PrivateI18n.t("auto.058"):p.points.length+window.DB2PrivateI18n.t("auto.059")),278,-94,y,function(){api.selectWithGuard(p.id);});colorButton(b,window.DB2PrivateI18n.t("auto.013"),74,94,y,function(){api.selectWithGuard(p.id,true);},true);colorButton(b,window.DB2PrivateI18n.t("auto.060"),74,180,y,function(){api.openDelete(p.id);});});
            colorButton(b,'‹',54,-176,-146,function(){page=Math.max(0,page-1);api.openLibrary();});ui.text(b,window.DB2PrivateI18n.t('auto.page')+(page+1)+' · '+plans.length+'/30',15,0,-146,240,30);colorButton(b,'›',54,176,-146,function(){if((page+1)*4<plans.length)page++;api.openLibrary();});
        },
        openCreate:function(){var m=ui.modal('DB2PrivateControls',window.DB2PrivateI18n.t("auto.061"),490,290);if(!m)return;var b=m.box;ui.text(b,window.DB2PrivateI18n.t("auto.062"),16,0,64,420,28);var name=ui.edit(b,window.DB2PrivateI18n.t("auto.063")+(plans.length+1),420,0,25);name.maxLength=40;
            ui.text(b,window.DB2PrivateI18n.t("auto.064"),15,0,-24,420,30);
            ['single','multi','record'].forEach(function(type,i){colorButton(b,[window.DB2PrivateI18n.t("auto.042"),window.DB2PrivateI18n.t("auto.065"),window.DB2PrivateI18n.t("auto.045")][i],136,-148+i*148,-83,function(){api.guardDraft(function(){api.createPlan(name.string,type);if(type!=='record'){draft.points=[];api.pickPoint();}});},true);});
        },
        guardDraft:function(next){if(!dirty||!draft){next();return;}var m=ui.modal('DB2PrivateControls',window.DB2PrivateI18n.t("auto.066"),490,230);if(!m)return;ui.text(m.box,window.DB2PrivateI18n.t("auto.067"),18,0,20,420,44);colorButton(m.box,window.DB2PrivateI18n.t("auto.016"),124,-140,-56,function(){api.savePlan();next();},true);colorButton(m.box,window.DB2PrivateI18n.t("auto.068"),124,0,-56,function(){var original=plans.filter(function(p){return p.id===draft.id;})[0];draft=original?clone(original):null;dirty=false;if(draft)persistDraft();else store.removeItem&&store.removeItem(DRAFT);next();});colorButton(m.box,window.DB2PrivateI18n.t("auto.069"),124,140,-56,function(){hideDialog();redraw(true);});},
        selectWithGuard:function(identifier,play){api.guardDraft(function(){api.loadPlan(identifier);if(play)api.playCurrent();});},
        openSave:function(){api.finishRecord();api.pause();if(!draft)return;var m=ui.modal('DB2PrivateControls',window.DB2PrivateI18n.t("auto.070"),480,244);if(!m)return;var name=ui.edit(m.box,displayName(draft),410,0,24);name.maxLength=40;colorButton(m.box,window.DB2PrivateI18n.t("auto.016"),170,-94,-63,function(){api.savePlan(name.string);hideDialog();redraw(true);},true);colorButton(m.box,window.DB2PrivateI18n.t("auto.071"),170,94,-63,function(){hideDialog();redraw(true);});},
        openDelete:function(identifier){var m=ui.modal('DB2PrivateControls',window.DB2PrivateI18n.t("auto.072"),450,210);if(!m)return;colorButton(m.box,window.DB2PrivateI18n.t("auto.060"),150,-87,-47,function(){api.deletePlan(identifier);api.openLibrary();},true);colorButton(m.box,window.DB2PrivateI18n.t("auto.071"),150,87,-47,function(){api.openLibrary();});},
        requestClose:function(){api.finishRecord();api.pause();api.guardDraft(function(){api.stop();editing=false;dirty=false;hideDialog();redraw(true);api.openLibrary();});},
        openPoint:function(index){api.pause();var p=draft&&draft.points[index];if(!p)return;var m=ui.modal('DB2PrivateControls',window.DB2PrivateI18n.t("auto.073")+(index+1),450,318);if(!m)return;var b=m.box;ui.text(b,window.DB2PrivateI18n.t("auto.074"),15,-102,75,180,30);ui.text(b,window.DB2PrivateI18n.t("auto.075"),15,102,75,180,30);var delay=ui.edit(b,p.delay,180,-102,32),hold=ui.edit(b,p.hold,180,102,32);
            colorButton(b,window.DB2PrivateI18n.t("auto.076"),170,-102,-25,function(){api.movePoint(index,-1);api.openPoint(Math.max(0,index-1));});colorButton(b,window.DB2PrivateI18n.t("auto.077"),170,102,-25,function(){api.movePoint(index,1);api.openPoint(Math.min(draft.points.length-1,index+1));});
            colorButton(b,window.DB2PrivateI18n.t("auto.078"),170,-102,-81,function(){api.deletePoint(index);hideDialog();redraw(true);});colorButton(b,window.DB2PrivateI18n.t("auto.079"),170,102,-81,function(){api.updatePoint(index,{delay:Number(delay.string),hold:Number(hold.string)});hideDialog();redraw(true);},true);
        },
        openPlanSettings:function(){api.pause();if(!draft)return;var m=ui.modal('DB2PrivateControls',window.DB2PrivateI18n.t("auto.080"),480,280);if(!m)return;ui.text(m.box,window.DB2PrivateI18n.t("auto.081"),17,0,61,410,30);var loops=ui.edit(m.box,draft.cycles,200,0,16);ui.text(m.box,window.DB2PrivateI18n.t("auto.082"),15,0,-35,420,40);colorButton(m.box,window.DB2PrivateI18n.t("auto.079"),174,-100,-91,function(){var n=Number(loops.string);if(!integer(n,0,10000))throw Error(window.DB2PrivateI18n.t("auto.083"));api.stop();draft.cycles=n;changed();hideDialog();redraw(true);},true);colorButton(m.box,window.DB2PrivateI18n.t("auto.084"),174,100,-91,function(){api.openLibrary();});},
        mount:mount,
        // Compatibility for existing script callers; the UI uses saved-plan operations above.
        getConfig:function(){return{mode:draft?draft.type:'single',points:draft?clone(draft.points):[],interval:draft&&draft.points[0]?draft.points[0].delay:600,cycles:draft?draft.cycles:1,record:draft?clone(draft.actions):[]};},
        start:function(mode,points,interval,cycles){if(!Array.isArray(points)||!points.length||points.length>20||points.some(function(p){return !point(p);})||['single','multi'].indexOf(mode)<0||!integer(Number(interval),100,600000)||!integer(Number(cycles),0,10000))throw Error(window.DB2PrivateI18n.t("auto.085"));api.createPlan(window.DB2PrivateI18n.t("auto.086"),mode);draft.points=(mode==='single'?points.slice(0,1):points).map(function(p){return{x:p.x,y:p.y,delay:Number(interval),hold:40};});beginRun(Number(cycles));},
        play:function(repeat){beginRun(repeat?0:1);}
    };
    if(cc.Director.EVENT_BEFORE_SCENE_LAUNCH)cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH,function(){
        sceneBusy=true;sceneResume=status==='running';if(sceneResume){run.remaining=Math.max(1,run.due-Date.now());clearTimer();rewindGesture();status='paused';}
        if(status==='recording'&&recordId!==null&&recordLast){draft.actions.push({kind:'cancel',x:recordLast.x,y:recordLast.y,ms:Date.now()-recordStart});recordId=null;changed();}
    });
    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH,function(){
        sceneBusy=false;var shouldResume=sceneResume;sceneResume=false;mount();
        var login=false;try{var scenes=window.__require('sceneManager');login=scenes.getCurSceneInfo().name===scenes.NAME.LOGIN_SCENE;}catch(ignored){}
        if(login){api.finishRecord();api.stop();return;}if(shouldResume&&run){status='running';redraw(true);schedule(Math.max(350,run.remaining));}
    });
    if(cc.game&&cc.game.on&&cc.game.EVENT_HIDE)cc.game.on(cc.game.EVENT_HIDE,function(){api.finishRecord();api.pause();sceneResume=false;persistDraft();});
}());
