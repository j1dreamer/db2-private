// Server selector displayed on the original Cocos login scene.
window.DB2PrivateSettings = function () {
    var canvas = cc.Canvas.instance && cc.Canvas.instance.node;
    if (!canvas || canvas.getChildByName('DB2PrivateServerButton')) return;
    function text(parent, value, size, y) {
        var node = new cc.Node(); node.parent = parent; node.y = y || 0;
        var label = node.addComponent(cc.Label); label.string = value;
        label.fontSize = size; label.lineHeight = size + 5; return label;
    }
    function button(parent, value, width, x, y, cb) {
        var node = new cc.Node(); node.parent = parent; node.setContentSize(width, 50);
        node.setPosition(x,y);var g=node.addComponent(cc.Graphics);
        g.fillColor=cc.color(245,174,68);g.roundRect(-width/2,-25,width,50,8);g.fill();
        text(node,value,20).node.color=cc.color(20,25,35);
        node.on(cc.Node.EventType.TOUCH_END,cb);return node;
    }
    var trigger=button(canvas,'Server riêng',160,-canvas.width/2+100,-canvas.height/2+40,function(){
        if(canvas.getChildByName('DB2PrivateServerPanel'))return;
        var panel=new cc.Node('DB2PrivateServerPanel');panel.parent=canvas;panel.zIndex=32000;
        panel.setContentSize(canvas.width,canvas.height);panel.addComponent(cc.BlockInputEvents);
        var g=panel.addComponent(cc.Graphics);g.fillColor=cc.color(10,16,28,245);
        g.rect(-panel.width/2,-panel.height/2,panel.width,panel.height);g.fill();
        text(panel,'Kết nối server riêng',29,130);
        text(panel,'Nhập http://IP-TAILSCALE:20003',20,85);
        var field=new cc.Node();field.parent=panel;field.setContentSize(580,60);
        var bg=field.addComponent(cc.Graphics);bg.fillColor=cc.color(35,46,65);bg.roundRect(-290,-30,580,60,8);bg.fill();
        var edit=field.addComponent(cc.EditBox);edit.inputMode=cc.EditBox.InputMode.ANY;
        edit.maxLength=160;edit.textLabel=text(field,'',23);edit.placeholderLabel=text(field,'http://127.0.0.1:20003',23);
        edit.string=cc.sys.localStorage.getItem('db2.private.server')||window.DB2_PRIVATE_DEFAULT_SERVER;
        var hint=text(panel,'Lưu sẽ khởi động lại game.',18,-60);
        button(panel,'Lưu và khởi động lại',270,-100,-125,function(){
            var value=edit.string.trim().replace(/\/$/,'');
            if(!/^http:\/\/[^\s/:?#]+(?::\d{1,5})?$/.test(value)) {hint.string='Địa chỉ cần có dạng http://HOST:PORT';return;}
            cc.sys.localStorage.setItem('db2.private.server',value);cc.game.restart();
        });
        button(panel,'Đóng',130,150,-125,function(){panel.destroy();});
    });
    trigger.name='DB2PrivateServerButton';trigger.zIndex=31000;
};
