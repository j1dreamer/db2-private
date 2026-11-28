// Apply declarative server settings only. Downloaded JavaScript stays disabled.
(function () {
    var latest=null,hooked=false;
    function apply(){
        var R=window.__require;if(!R)return;
        var C=R('serverConfig'),E=R('buildExt'),D=R('dataApi'),v=latest;
        if(v){
            if(v.maxAwake===20)C.ROLE.CONSTS.MAX_AWAKE_LEVEL=20;
            if(v.equipmentSlots===5){
                C.EQUIPMENTS.CONSTS.ARTIFACT_ITEM_TYPES=[1,2,3,4,5].map(function(i){return 'artifactItem_'+i;});
                C.EQUIPMENTS.CONSTS.CAPSULE_ITEM_TYPES=[1,2,3,4,5].map(function(i){return 'capsuleItem_'+i;});
            }
            E.isSimpleAwake=false;
            if(window.DB2PrivateExpeditionBonus)window.DB2PrivateExpeditionBonus.apply(v.expeditionBonuses);
            var boxes=v.chapterBoxes||{};
            Object.keys(boxes).forEach(function(id){
                if(!/^\d+$/.test(id)||!D.bmap||!D.bmap.data||!D.bmap.data[id])return;
                ['box2','box3'].forEach(function(k){var value=boxes[id][k];if(typeof value==='string'&&value.length<=4096)D.bmap.data[id][k]=value;});
            });
        }
        var socket=R('socket');
        if(!socket.__db2BoxContentGuard&&typeof socket.request==='function'){
            var request=socket.request;
            socket.request=function(route,args){
                if(/\.selectBoxReward2?$/.test(route)){
                    var main=R('serverMain'),item=main.player&&main.player.bag.getItemByIdx(args.bagIndex);
                    if(item&&item.kindId===724&&(!latest||latest.contentRevision!==16)){
                        var base=R('baseView');base.removeLoading();base.addHintPanel(window.DB2PrivateI18n.t("server_config.001"));return;
                    }
                    args.clientContentRevision=16;
                }
                return request.apply(this,arguments);
            };
            socket.__db2BoxContentGuard=true;
        }
        C.PLAYER.FUNS.isRobot=function(id){return Number(id)<=0;};
        if(window.DB2NativeCompat)window.DB2NativeCompat();
        if(!hooked){var old=E.hackDataApi;E.hackDataApi=function(){var out=old?old.apply(this,arguments):undefined;apply();return out;};hooked=true;}
        function hide(){var c=cc.Canvas.instance&&cc.Canvas.instance.node;['PrivateTimePeakButton','PrivateTimePeakPanel'].forEach(function(name){var n=c&&c.getChildByName(name);if(n)n.destroy();});}
        try{cc.sys.localStorage.removeItem('db2.private.timePeak.enabled');if(window.DB2PrivateTimePeak){window.DB2PrivateTimePeak.mount=hide;window.DB2PrivateTimePeak.show=hide;}hide();}catch(e){}
    }
    window.DB2PrivateServerConfig={apply:function(response){
        var v=response&&response.runtimeConfig;
        if(v&&v.version===15&&v.maxAwake===20&&v.equipmentSlots===5)latest=v;
        try{apply();}catch(error){console.error('DB2 configuration:',error);}
    }};
}());
