// Compact server editor; login fields remain available when this card is closed.
window.DB2PrivateSettings = function () {
    var U=window.DB2PrivateUI,canvas=U.canvas();if(!canvas)return;
    window.DB2PrivateOpenServer=function(message) {
        var m=U.modal('DB2PrivateServerPanel',window.DB2PrivateI18n.t("settings.001"),520,276);if(!m)return;
        var box=m.box,w=box.width-40;
        U.text(box,window.DB2PrivateI18n.t("settings.002"),16,0,64,w,30);
        var saved=cc.sys.localStorage.getItem('db2.private.server')||window.DB2_PRIVATE_DEFAULT_SERVER;
        var edit=U.edit(box,/\.invalid(?::|\/|$)/.test(saved)?'':saved,w,0,23);edit.placeholderLabel.string='https://db2.teck.io.vn';edit.placeholder='https://db2.teck.io.vn';
        var hint=U.text(box,message||window.DB2_PRIVATE_CONNECTION_ERROR||window.DB2PrivateI18n.t("settings.003"),16,0,-32,w,50);
        var busy=false;
        U.button(box,window.DB2PrivateI18n.t("settings.004"),160,-86,-99,function(){
            if(busy)return;
            var value=edit.string.trim().replace(/\/$/,'');
            var match=/^https?:\/\/[^\s/:?#]+(?::(\d{1,5}))?$/.exec(value);
            if(!match||match[1]&&(+match[1]<1||+match[1]>65535)){hint.string=window.DB2PrivateI18n.t("settings.005");return;}
            busy=true;if(edit.blur)edit.blur();hint.string=window.DB2PrivateI18n.t("settings.006");
            window.DB2PrivateConnection.probe(value,function(error){
                busy=false;if(cc.isValid&&!cc.isValid(m.shade))return;
                if(error){hint.string=error;return;}
                cc.sys.localStorage.setItem('db2.private.server',value);cc.game.restart();
            });
        });
        U.button(box,window.DB2PrivateI18n.t("settings.007"),136,88,-99,function(){window.DB2_PRIVATE_CONNECTION_ERROR=null;U.destroy(m.shade);},true);
    };
    if(!canvas.getChildByName('DB2PrivateServerButton')){
        var trigger=U.button(canvas,'Server',112,-canvas.width/2+74,-canvas.height/2+35,function(){window.DB2PrivateOpenServer();});
        trigger.name='DB2PrivateServerButton';trigger.zIndex=31000;
    }
    var endpoint=cc.sys.localStorage.getItem('db2.private.server')||window.DB2_PRIVATE_DEFAULT_SERVER;
    if(window.DB2_PRIVATE_CONNECTION_ERROR||/\.invalid(?::|\/|$)/.test(endpoint))window.DB2PrivateOpenServer();
};
