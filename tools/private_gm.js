// Authored private-server GM UI. Every RPC independently checks server-granted rights.
(function () {
    var panel = null, notice = null, body = null, tab = 'items', selected = null;
    var query = '', filter = '', page = 1, types = [], generation = 0;
    function player() { try { return window.__require('serverMain').player; } catch (e) { return null; } }
    function label(parent, value, size, x, y, width) {
        var n = new cc.Node();n.parent = parent;n.setPosition(x || 0,y || 0);
        var l = n.addComponent(cc.Label);l.string = String(value);l.fontSize = size || 18;l.lineHeight = (size || 18)+5;
        if (width) { n.width = width;l.overflow = cc.Label.Overflow.CLAMP; }
        if(window.DB2PrivateFonts)window.DB2PrivateFonts.custom(l);return l;
    }
    function button(parent, value, x, y, width, action, chosen) {
        var n = new cc.Node();n.parent=parent;n.setPosition(x,y);n.setContentSize(width,36);
        var g=n.addComponent(cc.Graphics);g.fillColor=chosen?cc.color(210,143,32):cc.color(45,65,89);g.roundRect(-width/2,-18,width,36,5);g.fill();
        label(n,value,16,0,0,width-8);n.on(cc.Node.EventType.TOUCH_END,action);return n;
    }
    function input(parent,value,x,y,width,numeric) {
        var n=new cc.Node();n.parent=parent;n.setPosition(x,y);n.setContentSize(width,36);
        var g=n.addComponent(cc.Graphics);g.fillColor=cc.color(20,31,46);g.roundRect(-width/2,-18,width,36,4);g.fill();
        var e=n.addComponent(cc.EditBox);e.maxLength=numeric?10:80;e.inputMode=numeric?cc.EditBox.InputMode.NUMERIC:cc.EditBox.InputMode.ANY;
        e.textLabel=label(n,'',18,0,0,width-12);e.placeholderLabel=label(n,'',16,0,0,width-12);e.string=String(value);return e;
    }
    function integer(value) { if (!/^\d+$/.test(String(value))) throw Error(window.DB2PrivateI18n.t("gm.001"));return Number(value); }
    function say(message) { if(notice)notice.string=String(message); }
    function call(action,args,done) {
        if (!player() || !player().privateGM) { close();return; }
        var id=generation;say(window.DB2PrivateI18n.t("gm.002"));
        window.__require('socket').request('logic.gmHandler.'+action,args,function(result){
            if(id!==generation || !panel)return;
            if(!result || result.code!==200){say(result&&result.msg||window.DB2PrivateI18n.t("gm.003"));return;}
            say(window.DB2PrivateI18n.t("gm.004"));if(done)done(result);
        });
    }
    function resetBody() { generation++;if(body)body.destroy();body=new cc.Node();body.parent=panel;return body; }
    function thumbnail(parent,item,x,y) {
        if (!item.image || !cc.loader || !cc.loader.load)return;
        var n=new cc.Node();n.parent=parent;n.setPosition(x,y);n.setContentSize(30,30);var sprite=n.addComponent(cc.Sprite);sprite.sizeMode=cc.Sprite.SizeMode.CUSTOM;
        var url=window.__require('serverMain').url+item.image;
        cc.loader.load({url:url,type:'png'},function(error,texture){if(!error&&texture&&(!cc.isValid||cc.isValid(n)))sprite.spriteFrame=new cc.SpriteFrame(texture);});
    }
    function itemTab() {
        var root=resetBody(),left=-panel.width/2+28,top=panel.height/2-105;
        var search=input(root,query,left+150,top,300,false);
        button(root,window.DB2PrivateI18n.t("gm.005"),left+390,top,145,function(){query=search.string;page=1;itemTab();});
        button(root,window.DB2PrivateI18n.t("gm.006")+(filter||window.DB2PrivateI18n.t("gm.007")),left+590,top,210,function(){var choices=[''].concat(types);filter=choices[(choices.indexOf(filter)+1)%choices.length];page=1;itemTab();});
        call('catalog',{q:query,type:tab==='roles'?'role':filter,page:page},function(result){
            var data=result._temp.gmCatalog;types=data.types;page=data.page;
            data.items.forEach(function(item,index){
                var y=top-48-index*38;
                var caption=(selected&&selected.id===item.id?'✓ ':'')+item.name+'  #'+item.id+(item.grade?' · '+item.grade:'');
                var row=button(root,caption,0,y,panel.width-56,function(){selected=item;itemTab();},selected&&selected.id===item.id);
                thumbnail(row,item,-panel.width/2+55,0);
            });
            var bottom=-panel.height/2+84;
            button(root,window.DB2PrivateI18n.t("gm.008"),left+65,bottom,130,function(){page=Math.max(1,page-1);itemTab();});
            label(root,page+' / '+data.pages+' · '+data.total+window.DB2PrivateI18n.t("gm.009"),17,left+270,bottom,220);
            button(root,'Trang sau',left+470,bottom,130,function(){page=Math.min(data.pages,page+1);itemTab();});
            var count=input(root,1,panel.width/2-235,bottom,80,true);
            button(root,window.DB2PrivateI18n.t("gm.010"),panel.width/2-90,bottom,190,function(){
                if(!selected){say(window.DB2PrivateI18n.t("gm.011"));return;}
                try {var amount=selected.type==='role'?1:integer(count.string);call('addItem',{kindId:selected.id,itemCount:amount,extra:{}},function(){say(window.DB2PrivateI18n.t("gm.012")+selected.name+' × '+amount);});}catch(e){say(e.message);}
            });
            say(selected?window.DB2PrivateI18n.t("gm.014")+selected.name+' · #'+selected.id:window.DB2PrivateI18n.t("gm.015"));
        });
    }
    function playerTab() {
        var root=resetBody(),p=player(),fields={},names=[['level',window.DB2PrivateI18n.t("gm.016"),p.level],['vipLevel',window.DB2PrivateI18n.t("gm.017"),p.vip.level],['gem','Gem',p.gem],['coin','Coin',p.coin],['actionPoint',window.DB2PrivateI18n.t("gm.018"),p.actionPoint],['skillPoint',window.DB2PrivateI18n.t("gm.019"),p.skillPoint]];
        names.forEach(function(row,index){var x=index%2?220:-220,y=panel.height/2-140-Math.floor(index/2)*88;label(root,row[1],19,x,y+25,260);fields[row[0]]=input(root,row[2],x,y-12,250,true);});
        label(root,window.DB2PrivateI18n.t("gm.020"),17,0,-panel.height/2+150,panel.width-60);
        button(root,window.DB2PrivateI18n.t("gm.021"),0,-panel.height/2+100,320,function(){
            try{var values={};Object.keys(fields).forEach(function(key){values[key]=integer(fields[key].string);});call('setPlayer',{values:values},function(){playerTab();say(window.DB2PrivateI18n.t("gm.022"));});}catch(e){say(e.message);}
        });
    }
    function roleTab() {
        var root=resetBody(),p=player(),roles=Object.keys(p.team.roles).map(function(k){return p.team.roles[k];});
        var start=(page-1)*8;roles.slice(start,start+8).forEach(function(role,index){
            var row=window.__require('dataApi').findEntityById(role.kindId),y=panel.height/2-120-index*43;
            label(root,row.kindName+' · #'+role.kindId+' · Lv.'+role.level,18,-155,y,panel.width-340);
            var level=input(root,role.level,panel.width/2-195,y,90,true);
            button(root,window.DB2PrivateI18n.t("gm.023"),panel.width/2-85,y,170,function(){try{call('setRole',{teamIndex:Number(role.idx),values:{level:integer(level.string)}},function(){roleTab();});}catch(e){say(e.message);}});
        });
        var last=Math.max(1,Math.ceil(roles.length/8));button(root,window.DB2PrivateI18n.t("gm.024"),-170,-panel.height/2+90,110,function(){page=Math.max(1,page-1);roleTab();});label(root,page+' / '+last,18,0,-panel.height/2+90,100);button(root,'Sau',170,-panel.height/2+90,110,function(){page=Math.min(last,page+1);roleTab();});
        say(window.DB2PrivateI18n.t("gm.025"));
    }
    function render() {if(tab==='player')playerTab();else if(tab==='roster')roleTab();else itemTab();}
    function close() {generation++;if(panel)panel.destroy();panel=null;body=null;notice=null;}
    function open() {
        var p=player(),canvas=cc.Canvas.instance&&cc.Canvas.instance.node;if(!p||!p.privateGM||!canvas)return;
        close();panel=new cc.Node('DB2PrivateGMPanel');panel.parent=canvas;panel.zIndex=32500;panel.setContentSize(1020,640);panel.scale=Math.min((canvas.width-30)/1020,(canvas.height-24)/640);panel.addComponent(cc.BlockInputEvents);
        var g=panel.addComponent(cc.Graphics);g.fillColor=cc.color(9,19,34,252);g.roundRect(-panel.width/2,-panel.height/2,panel.width,panel.height,10);g.fill();
        label(panel,'GM · '+p.name,22,0,panel.height/2-25,panel.width-180);
        button(panel,window.DB2PrivateI18n.t("gm.026"),panel.width/2-55,panel.height/2-25,90,close);
        [['items',window.DB2PrivateI18n.t("gm.027")],['roles',window.DB2PrivateI18n.t("gm.028")],['player',window.DB2PrivateI18n.t("gm.029")],['roster',window.DB2PrivateI18n.t("gm.030")]].forEach(function(entry,index){button(panel,entry[1],-300+index*200,panel.height/2-65,180,function(){generation++;tab=entry[0];page=1;selected=null;render();},tab===entry[0]);});
        notice=label(panel,'',17,0,-panel.height/2+30,panel.width-40);page=1;render();
    }
    var api=window.DB2PrivateGM={open:open,close:close,refresh:function(){
        var canvas=cc.Canvas.instance&&cc.Canvas.instance.node;if(!canvas)return;
        var buttonNode=canvas.getChildByName('DB2PrivateGMButton'),allowed=player()&&player().privateGM;
        if(!allowed){if(buttonNode)buttonNode.destroy();close();return;}
        if(!buttonNode){buttonNode=button(canvas,'GM',canvas.width/2-85,canvas.height/2-150,130,open);buttonNode.name='DB2PrivateGMButton';buttonNode.zIndex=31000;}
    }};
    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH,function(){close();api.refresh();});
}());
