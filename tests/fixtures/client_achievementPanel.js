achievementPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "451b2wcW1ZMo6yT2v5DWId2", "achievementPanel");
var t = e("underscore"), n = (e("soundApi"), e("dataApi"), e("resource")), i = e("i18n"), r = e("helper"), s = e("baseView"), o = (e("clientConfig"),
e("serverConfig"), e("serverMain")), l = (e("arenaHandler"), e("eyeHandler"), e("guildHandler"),
e("itemItem"), e("homeScene"), e("sceneManager"), e("bmapScene"), e("dailyTaskPanel")), c = e("playerHandler"), d = cc.Class({
extends: cc.Component,
properties: {
taskScrollview: cc.Node,
taskItemsLayout: cc.Node,
taskItem: cc.Node
},
onLoad: function() {
this.taskScrollview.active = !1;
this.taskItem.active = !1;
this.scheduleOnce(function() {
r.scrollviewFadeIn(this.taskScrollview);
}, .2);
},
update_: function(e) {
this.data = e;
this.taskItemMap = this.taskItemMap || {};
s.preHideNodeMap(this.taskItemMap);
for (var a in e.taskItems) {
var t = this.taskItemMap[a];
if (!t) {
(t = cc.instantiate(this.taskItem)).parent = this.taskItemsLayout;
t.idx = a;
this.taskItemMap[a] = t;
}
t.active = !0;
s.markHideNode(t);
var o = e.taskItems[a];
t.data = o;
t.getComponent(cc.Button).interactable = o.isComplete;
var l = t.getChildByName("icon_sp").getComponent(cc.Sprite);
s.setSpriteFrame(l, n["task_" + o.resId + "_png"]);
t.getChildByName("title_label").getComponent(cc.Label).string = o.title;
t.getChildByName("intro_label").getComponent(cc.Label).string = o.intro;
t.getChildByName("receive_sp").active = o.isComplete;
var c = t.getChildByName("show_label");
c.active = !o.isComplete;
c.getComponent(cc.Label).string = o.show;
for (var d = t.getChildByName("reward_layout"), h = 0; h < 2; h++) {
var u = d.getChildByName("item_node_" + (h + 1)).getChildByName("item_item"), m = o.itemItems[h];
u.active = !!m;
u.active && u.getComponent("itemItem").update_(m);
var g = d.getChildByName("count_label_" + (h + 1));
g.active = !!m;
g.active && r.replaceLabel(g.getComponent(cc.Label), [ m.count ]);
}
t.getChildByName("complete_sp").getChildByName("count_label").getComponent(cc.Label).string = i.t("达成：$1次成就", [ o._data.rankId - 1 ]);
t.getChildByName("point_label").getComponent(cc.Label).string = i.t("成就点+$1", [ o.achievementPoint ]);
}
s.hideNodeMap(this.taskItemMap);
},
onClose_: function() {
s.removePanel(this.node);
},
onTaskItem_: function(e) {
var a = e.target.data, t = this;
s.addLoading();
c.receiveTaskAward(a.taskId, !1, function(e) {
s.addRewardEffectPanel(e._temp.entityCountMap);
var a = d.genData();
t.update_(a);
});
}
});
d.genData = function() {
var e = o.player, a = e.task.achievement, n = [];
for (var i in a) if (a[i].taskId) {
var r = d.genTaskItemData(a[i]);
r._data.requireLevel > e.level || n.push(r);
}
return {
taskItems: n = t.sortBy(n, function(e) {
return e.isComplete ? -10 : e.taskId;
}),
isCanReceiveTaskAward: !!t.findWhere(n, {
isComplete: !0
})
};
};
d.genTaskItemData = l.genTaskItemData;
cc._RF.pop();
}, {
arenaHandler: "arenaHandler",
baseView: "baseView",
bmapScene: "bmapScene",
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
