// Voucher preview uses the same per-mode final-chest rules returned by the server.
(function(){
 var config={};
 function install(name,key){
  var R=window.__require,Type=R(name);if(!Type||!Type.prototype||Type.prototype.__db2ExpeditionBonus)return;
  var old=Type.prototype.update_;
  Type.prototype.update_=function(){
   var result=old.apply(this,arguments),v=config[key];if(!v)return result;
   var text=v.rewards.map(function(r){var row=R('dataApi').findEntityById(r.entityId);return row.kindName+' ×'+r.count;}).join(', ');
   if(!this._db2BonusLabel){var node=new cc.Node('DB2ExpeditionBonus');node.parent=this.node;node.zIndex=100;
    var c=cc.Canvas.instance.node;node.setPosition(0,-c.height/2+25);node.setContentSize(Math.min(700,c.width-140),36);
    var label=node.addComponent(cc.Label);label.fontSize=17;label.lineHeight=21;label.horizontalAlign=1;
    if(cc.LabelOutline){var o=node.addComponent(cc.LabelOutline);o.color=cc.color(0,0,0,255);o.width=2;}
    node.on(cc.Node.EventType.TOUCH_END,function(){var current=config[key];R('baseView').addRewardPanel(window.DB2PrivateI18n.t("expedition.002")+current.floor,current.rewards);});if(window.DB2PrivateFonts)window.DB2PrivateFonts.custom(label);this._db2BonusLabel=label;
   }
   this._db2BonusLabel.string=text?window.DB2PrivateI18n.t("expedition.003")+v.floor+window.DB2PrivateI18n.t("expedition.004")+text:window.DB2PrivateI18n.t("expedition.005");
   return result;
  };Type.prototype.__db2ExpeditionBonus=true;
 }
 window.DB2PrivateExpeditionBonus={apply:function(data){
  if(data)config=data;
  if(typeof cc==='undefined'||!window.__require)return;
  try{install('expeditionScene','normal');install('sixType3Scene','six');}catch(e){console.error(e);}
 }};
}());
