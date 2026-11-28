// Runtime compatibility for the existing ENG reward panel; no new native IDs.
(function () {
    if(typeof cc==='undefined')return;
    var R=window.__require||(typeof require==='function'?require:null);
    if(!R)return;
    var Panel=R('rewardPanel'),D=R('dataApi');
    if(!Panel||!Panel.prototype||Panel.prototype.__db2BoxNames)return;
    var previous=Panel.prototype.update_;
    Panel.prototype.update_=function(){
        var result=previous.apply(this,arguments),view=this;
        // Original ENG never fills name_label for whole-role reward rows.
        Object.keys(view.roleItemNodeMap||{}).forEach(function(key){
            var node=view.roleItemNodeMap[key],data=node.data;
            if(!node.active||!data)return;
            var nameNode=node.getChildByName('name_label'),label=nameNode&&nameNode.getComponent(cc.Label);
            var row=data._data||D.findEntityById(data.kindId);
            if(label&&row)label.string=row.kindName;
        });

        return result;
    };
    Panel.prototype.__db2BoxNames=true;
}());
