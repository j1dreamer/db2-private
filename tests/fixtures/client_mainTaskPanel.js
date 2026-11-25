mainTaskPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "0f4dcpZz8hFGoQ+xjGovtPW", "mainTaskPanel");
e("underscore"), e("soundApi");
var t = e("dataApi"), n = (e("resource"), e("i18n"), e("helper"), e("baseView")), i = (e("clientConfig"), 
e("serverConfig")), r = e("serverMain"), s = (e("arenaHandler"), e("eyeHandler"), 
e("guildHandler"), e("playerHandler")), o = e("itemItem"), l = (e("homeScene"), 
e("dailyTaskPanel")), c = (e("sceneManager"), cc.Class({
extends: cc.Component,
properties: {
itemItemsLayout: cc.Node,
itemItem: cc.Node,
nameLabel: cc.Label,
descLabel: cc.Label,
requireLabel: cc.Label,
goBt: cc.Node,
receiveBt: cc.Node,
completeColor: cc.Color,
unCompleteColor: cc.Color
},
onLoad: function() {
this.itemItem.active = !1;
c.isMark = !1;
},
update_: function() {
var e = c.genData();
this.data = e;
this.nameLabel.string = e.name;
this.descLabel.string = e.desc;
this.requireLabel.string = e.require;
this.requireLabel.node.color = e.isComplete ? this.completeColor : this.unCompleteColor;
this.itemItemMap = this.itemItemMap || {};
n.preHideNodeMap(this.itemItemMap);
for (var a in e.itemItems) {
var t = this.itemItemMap[a];
if (!t) {
(t = cc.instantiate(this.itemItem)).parent = this.itemItemsLayout;
t.idx = a;
this.itemItemMap[a] = t;
}
t.active = !0;
n.markHideNode(t);
t.getComponent("itemItem").update_(e.itemItems[a]);
t.getComponent("itemItem").setShowPanel_(!0);
}
n.hideNodeMap(this.itemItemMap);
this.goBt.active = !e.isComplete;
this.goBt.data = {
goType: e.goType
};
this.receiveBt.active = !this.goBt.active;
},
onGo_: l.prototype.onGo_,
onReceive_: function() {
var e = this;
n.addLoading();
s.receiveTaskAward(this.data.taskId, !1, function(a) {
var t = r.player.task.main[1].taskId;
2 != t && n.addRewardEffectPanel(a._temp.entityCountMap);
t ? e.update_() : n.removePanel(e.node);
});
},
onClose_: function() {
n.removePanel(this.node);
}
}));
c.genData = function() {
var e = r.player.task.main[1], a = e.taskId ? t.task.findById(e.taskId) : null, n = a ? i.DROP.FUNS.getDropListByDesc(a.dropListDesc) : [], s = [];
for (var l in n) {
var d = o.genData({
kindId: n[l].entityId,
count: n[l].count
}, !0);
s.push(d);
}
return e.taskId ? {
taskId: e.taskId,
goType: a.goType,
name: a.name,
desc: a.description,
require: e.show,
itemItems: s,
isComplete: e.isComplete,
isNeedMark: c.isMark
} : null;
};
c.isMark = !0;
cc._RF.pop();
}, {
arenaHandler: "arenaHandler",
baseView: "baseView",
clientConfig: "clientConfig",
dailyTaskPanel: "dailyTaskPanel",
dataApi: "dataApi",
eyeHandler: "eyeHandler",
guildHandler: "guildHandler",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
itemItem: "itemItem",
playerHandler: "playerHandler",
resource: "resource",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
