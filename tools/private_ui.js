// Shared small Cocos controls, created only after a scene exists.
(function () {
    var U = window.DB2PrivateUI = {};
    U.canvas = function () { return cc.Canvas.instance && cc.Canvas.instance.node; };
    U.destroy = function (node) { if (node && (!cc.isValid || cc.isValid(node))) { node.active = false; node.destroy(); } };
    U.text = function (parent, value, size, x, y, width, height) {
        // Configure while inactive: native Label.onEnable renders immediately and
        // Overflow.NONE can collapse an empty node before SHRINK gets its bounds.
        var n = new cc.Node(); n.active=false; n.setPosition(x || 0,y || 0);
        var l = n.addComponent(cc.Label); l.enabled=false;
        // This is the same fallback path used by this engine's RichText segments.

        l.overflow=cc.Label.Overflow.CLAMP; l.enableWrapText=true;

        l.cacheMode=cc.Label.CacheMode?cc.Label.CacheMode.NONE:0;
        l.horizontalAlign=1; l.verticalAlign=1;
        l.fontSize=size; l.lineHeight=size+5; l.string=String(value===null||value===undefined?'':value);
        n.color=cc.color(238,245,255,255);n.opacity=255;
        n.setContentSize(width || 420,height || size + 10);
        n.parent=parent;l.enabled=true;n.active=true;if(window.DB2PrivateFonts)window.DB2PrivateFonts.custom(l);
        return l;
    };
    U.button = function (parent, title, width, x, y, action, dark) {
        var n=new cc.Node(); n.parent=parent; n.setContentSize(width,44); n.setPosition(x,y);
        var g=n.addComponent(cc.Graphics); g.fillColor=dark?cc.color(45,57,76,255):cc.color(245,174,68,255);
        g.roundRect(-width/2,-22,width,44,8);g.fill();
        var l=U.text(n,title,17,0,0,width-12,36);l.enableWrapText=false;l.overflow=cc.Label.Overflow.SHRINK;l.node.color=dark?cc.color(235,241,250):cc.color(20,25,35);
        n.on(cc.Node.EventType.TOUCH_START,function(e){if(e&&e.stopPropagation)e.stopPropagation();n.opacity=190;});
        n.on(cc.Node.EventType.TOUCH_CANCEL,function(){n.opacity=255;});
        n.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();n.opacity=255;action();});return n;
    };
    U.edit = function(parent,value,width,x,y,password) {
        var n=new cc.Node();n.active=false;n.setPosition(x,y);n.setContentSize(width,44);
        var g=n.addComponent(cc.Graphics);g.fillColor=cc.color(35,46,65,255);g.roundRect(-width/2,-22,width,44,7);g.fill();
        var label=U.text(n,'',18,0,0,width-18,36),placeholder=U.text(n,'',18,0,0,width-18,36);
        var e=n.addComponent(cc.EditBox);e.inputMode=cc.EditBox.InputMode.SINGLE_LINE===undefined?cc.EditBox.InputMode.ANY:cc.EditBox.InputMode.SINGLE_LINE;e.maxLength=160;
        e.textLabel=label;e.placeholderLabel=placeholder;e.string=String(value===null||value===undefined?'':value);e.lineHeight=24;
        if(cc.EditBox.LineType)e.lineType=cc.EditBox.LineType.SINGLE_LINE;
        if(cc.EditBox.InputFlag&&cc.EditBox.InputFlag.DEFAULT!==undefined)e.inputFlag=cc.EditBox.InputFlag.DEFAULT;
        if(password)e.inputFlag=cc.EditBox.InputFlag.PASSWORD;
        // Native EditBox uses these values too; assigning only textLabel is insufficient on iOS.
        e.fontSize=18;e.fontColor=cc.color(240,245,255);e.placeholderFontSize=16;e.placeholderFontColor=cc.color(155,171,192);
        label.node.setContentSize(width-18,36);placeholder.node.setContentSize(width-18,36);
        n.parent=parent;n.active=true;
        // Cocos EditBox changes label anchors to (0,1), including on native onLoad.
        // Keep that anchor, and position the text from the field's left/top inset.
        [label,placeholder].forEach(function(l){
            if(l.node.setAnchorPoint)l.node.setAnchorPoint(0,1);
            l.horizontalAlign=0;l.verticalAlign=1;l.enableWrapText=false;
            l.node.setPosition(-width/2+12,18);l.node.setContentSize(width-24,36);
        });
        return e;
    };
    U.modal = function(name,title,width,height) {
        var canvas=U.canvas();if(!canvas)return null;
        if(window.DB2PrivateAuto){if(window.DB2PrivateAuto.beforeModal)window.DB2PrivateAuto.beforeModal();else{window.DB2PrivateAuto.finishRecord();window.DB2PrivateAuto.stop();}}
        U.destroy(canvas.getChildByName(name));
        var shade=new cc.Node(name);shade.parent=canvas;shade.zIndex=32500;shade.setContentSize(canvas.width,canvas.height);shade.addComponent(cc.BlockInputEvents);
        var bg=shade.addComponent(cc.Graphics);bg.fillColor=cc.color(5,10,18,170);bg.rect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height);bg.fill();
        var box=new cc.Node('Card');box.parent=shade;box.setContentSize(width,height);box.scale=Math.min(1,(canvas.width-24)/width,(canvas.height-24)/height);
        var g=box.addComponent(cc.Graphics);g.fillColor=cc.color(16,25,40,252);g.roundRect(-box.width/2,-box.height/2,box.width,box.height,12);g.fill();
        U.text(box,title,22,-18,box.height/2-29,box.width-100,36);
        U.button(box,'×',44,box.width/2-30,box.height/2-29,function(){U.destroy(shade);},true);
        return {shade:shade,box:box};
    };
    U.point = function(canvas,p) {
        var camera=cc.Camera&&cc.Camera.findCamera&&cc.Camera.findCamera(canvas);
        if(camera&&camera.getScreenToWorldPoint)p=camera.getScreenToWorldPoint(p);
        return canvas.convertToNodeSpaceAR ? canvas.convertToNodeSpaceAR(p) : p;
    };
    U.screen = function(canvas,p) {
        var world=canvas.convertToWorldSpaceAR?canvas.convertToWorldSpaceAR(p):p;
        var camera=cc.Camera&&cc.Camera.findCamera&&cc.Camera.findCamera(canvas);
        return camera&&camera.getWorldToScreenPoint?camera.getWorldToScreenPoint(world):world;
    };
}());
