loginReward2Panel: [ function(e, a) {
"use strict";
cc._RF.push(a, "5144cGNObFED6pw37KLNNPH", "loginReward2Panel");
var t = e("underscore"), n = (e("underscore.string"), e("moment"), e("soundApi"), 
e("dataApi"), e("resource"), e("i18n"), e("guide"), e("helper"), e("baseView")), i = (e("clientConfig"), 
e("serverConfig")), r = e("serverMain"), s = e("player"), o = (e("roleItem"), e("itemItem")), l = (e("buildExt"), 
e("playerHandler")), c = i.ACTIVITY.CONSTS, d = cc.Class({
extends: cc.Component,
properties: {
itemNodesLayout: cc.Node,
itemNode: cc.Node,
receiveBt: cc.Node
},
onLoad: function() {
this.itemNode.active = !1;
},
update_: function() {
var e = d.genData();
this.data = e;
this.itemNodeMap = this.itemNodeMap || {};
n.preHideNodeMap(this.itemNodeMap);
for (var a in e.itemItems) {
var t = this.itemNodeMap[a];
if (!t) {
(t = cc.instantiate(this.itemNode)).parent = this.itemNodesLayout;
t.idx = a;
this.itemNodeMap[a] = t;
}
t.active = !0;
n.markHideNode(t);
t.getComponentInChildren("itemItem").update_(e.itemItems[a]);
t.getComponentInChildren("itemItem").setShowPanel_(!0);
}
n.hideNodeMap(this.itemNodeMap);
this.receiveBt.active = e.status == c.STATUS.CAN_RECEIVE;
},
show_: function() {
n.addPanel(this.node);
this.update_();
},
onClose_: function() {
n.removePanel(this.node);
r.player.emit(s.EVENT.ATTRS, []);
},
onReceive_: function() {
var e = this;
n.addLoading();
l.receiveActivityAward([ this.data.activityName ], [ this.data.rewardIdx ], function(a) {
n.addRewardEffectPanel(a._temp.entityCountMap);
if (a.team) {
var i = t.values(a.team.roles);
for (var r in i) n.addPointRoleEffectNode(i[r]);
}
e.update_();
e.onClose_();
});
}
});
d.genData = function() {
var e = r.player.activity.map.loginReward;
if (!e || e.isSuccess) return null;
var a = e.rewards[0], n = [];
for (var i in a.dropList) {
var s = a.dropList[i], l = o.genData({
kindId: s.entityId,
count: s.count,
extra: s.extra
}, !0);
n.push(l);
}
var d = t.findWhere(e.rewards, {
status: c.STATUS.CAN_RECEIVE
});
return {
activityName: e.name,
rewardIdx: 0,
itemItems: n,
status: a.status,
isCanReceive: d
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
