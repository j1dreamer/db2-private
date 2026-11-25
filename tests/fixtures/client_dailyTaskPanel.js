dailyTaskPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "9d7260cR9pFuaQBtTA6y1Fk", "dailyTaskPanel");
var t = e("underscore"), n = (e("soundApi"), e("dataApi")), i = e("resource"), r = e("i18n"), s = e("helper"), o = e("baseView"), l = e("clientConfig"), c = e("serverConfig"), d = e("buildExt"), h = e("serverMain"), u = e("arenaHandler"), m = e("eyeHandler"), g = e("guildHandler"), p = e("itemItem"), _ = e("sceneManager"), k = e("bmapScene"), f = e("dailyBmapScene"), y = e("playerHandler"), b = cc.Class({
extends: cc.Component,
properties: {
taskScrollview: cc.Node,
activeBar: cc.Node,
btsLayout: cc.Node,
dailyBt: cc.Node,
weeklyBt: cc.Node,
activePointLabel: cc.Label,
taskItemsLayout: cc.Node,
taskItem: cc.Node
},
onLoad: function() {
this.taskScrollview.active = !1;
this.taskItem.active = !1;
this.dailyBt.data = {
type: "daily"
};
this.weeklyBt.data = {
type: "weekly"
};
this.scheduleOnce(function() {
s.scrollviewFadeIn(this.taskScrollview);
}, .2);
},
update_: function(e) {
this.data = e;
var a = c.TASK.CONSTS.ACTIVE_REWARD_MAP, n = t.keys(a[e.activeType]), l = Number(n[n.length - 1]), h = "daily" == e.activeType ? e.dailyActivePoint : e.weeklyActivePoint;
this.activeBar.getComponent(cc.ProgressBar).progress = h / l;
this.dailyBt.getComponent(cc.Button).interactable = "daily" != e.activeType;
this.weeklyBt.getComponent(cc.Button).interactable = "weekly" != e.activeType;
"daily" == e.activeType ? o.setMark(this.weeklyBt, e.isWeeklyActiveCanReceive) : o.setMark(this.dailyBt, e.isDailyActiveCanReceive);
this.activePointLabel.string = h;
for (var u = 0; u < 4; u++) {
var m = this.activeBar.getChildByName("box_" + (u + 1) + "_layout");
m.active = !!n[u];
if (m.active) {
m.x = n[u] / l * this.activeBar.width;
var g = !1, p = m.getChildByName("box_bt").getComponent(cc.Button), _ = p.node.getChildByName("armature").getComponent(sp.Skeleton);
if (e.receivedPointMap[e.activeType][n[u]]) _.setAnimation(0, "action_1_3", !0); else if (h >= Number(n[u])) {
_.setAnimation(0, "action_1_1", !0);
g = !0;
} else _.setAnimation(0, "action_1_0", !0);
p.node.boxArmature = _;
var k = c.DROP.FUNS.getDropListByDesc(a[e.activeType][n[u]]);
"daily" == e.activeType && e.dailyActiveRewardExtDropMap[n[u]] && k.push(e.dailyActiveRewardExtDropMap[n[u]]);
p.node.data = {
type: e.activeType,
point: n[u],
dropList: k,
isCanReceive: g
};
m.getChildByName("need_label").getComponent(cc.Label).string = n[u];
}
}
this.taskItemMap = this.taskItemMap || {};
o.preHideNodeMap(this.taskItemMap);
for (var u in e.taskItems) {
var f = this.taskItemMap[u];
if (!f) {
(f = cc.instantiate(this.taskItem)).parent = this.taskItemsLayout;
f.idx = u;
this.taskItemMap[u] = f;
}
f.active = !0;
o.markHideNode(f);
var y = e.taskItems[u];
f.data = y;
f.getComponent(cc.Button).interactable = y.isComplete;
var b = f.getChildByName("icon_sp").getComponent(cc.Sprite);
o.setSpriteFrame(b, i["task_" + y.resId + "_png"]);
f.getChildByName("title_label").getComponent(cc.Label).string = y.title;
f.getChildByName("intro_label").getComponent(cc.Label).string = y.intro;
var v = f.getChildByName("active_label");
v.active = y.activePoint > 0;
v.getComponent(cc.Label).string = r.t("活跃度+$1", [ y.activePoint ]);
f.getChildByName("receive_sp").active = y.isComplete;
var S = f.getChildByName("go_bt");
S.active = !y.isComplete && !!y.goType && !d.isHideDailyTaskGo;
S.data = {
goType: y.goType
};
var T = f.getChildByName("show_label");
T.active = !y.isComplete;
T.getComponent(cc.Label).string = y.show;
for (var M = f.getChildByName("reward_layout"), $ = 0; $ < 2; $++) {
var I = M.getChildByName("item_node_" + ($ + 1)).getChildByName("item_item"), C = y.itemItems[$];
I.active = !!C;
I.active && I.getComponent("itemItem").update_(C);
var P = M.getChildByName("count_label_" + ($ + 1));
P.active = !!C;
P.active && s.replaceLabel(P.getComponent(cc.Label), [ C.count ]);
}
}
o.hideNodeMap(this.taskItemMap);
},
onClose_: function() {
o.removePanel(this.node);
},
onTaskItem_: function(e) {
var a = e.target.data, t = this;
o.addLoading();
y.receiveTaskAward(a.taskId, !1, function(e) {
o.addRewardEffectPanel(e._temp.entityCountMap);
var a = b.genData(t.data.activeType);
t.update_(a);
});
},
onActiveType_: function(e, a) {
var n = e.target.data;
t.each(this.btsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
a = b.genData(n.type);
this.update_(a);
},
onGo_: function(a) {
var t = a.target.data, n = _.NAME, i = l.CONSTS.UNLOCK_LEVEL;
switch (t.goType) {
case 1:
var s = c.MAP.CONSTS.TYPE.ELITE, d = k.genData(s).lastSmap.bmap.rankId, p = k.genData(c.MAP.CONSTS.TYPE.NORMAL).lastSmap;
p && d >= p.bmap.rankId ? _.pushScene(n.BMAP_SCENE, {
type: s
}) : _.pushScene(n.MMAP_SCENE, {
type: s,
bmapRankId: d
});
break;

case 2:
var y = i.MAP_TYPE_3;
if (h.player.level < y) {
o.addHintPanel(r.t("战队等级达到$1开启", [ y ]));
return;
}
_.pushScene(n.DAILY_MMAP_2_SCENE);
break;

case 3:
y = i.MAP_TYPE_4;
if (h.player.level < y) {
o.addHintPanel(r.t("战队等级达到$1开启", [ y ]));
return;
}
_.pushScene(n.DAILY_MMAP_1_SCENE);
break;

case 4:
o.addLoading();
u.info(function(e) {
h.player.arena.rank = e._temp.rank;
_.pushScene(_.NAME.ARENA_SCENE);
});
break;

case 5:
y = i.EXPEDITION;
if (h.player.level < y) {
o.addHintPanel(r.t("战队等级达到$1开启", [ y ]));
return;
}
f.prototype.onMap3_();
break;

case 6:
_.pushScene(n.TEAM_SCENE);
break;

case 7:
e("coinTopNode").prototype.onBuyCoin_();
break;

case 8:
e("coinTopNode").prototype.onBuyAp_();
break;

case 9:
_.pushScene(n.POINT_SCENE);
break;

case 10:
_.pushScene(n.SHIP_SCENE);
break;

case 11:
_.pushScene(n.DAILY_MMAP_3_SCENE);
break;

case 12:
_.pushScene(n.PRACTICE_SCENE);
break;

case 13:
(b = e("homeScene")).instance ? b.instance.onFriend_() : _.pushScene(n.HOME_SCENE, {
callFun: "onFriend_"
});
break;

case 14:
o.addLoading();
g.info(function() {
_.pushScene(_.NAME.GUILD_SCENE);
});
break;

case 15:
y = i.ENDLESS;
if (h.player.level < y) {
o.addHintPanel(r.t("战队等级达到$1开启", [ y ]));
return;
}
_.pushScene(_.NAME.ENDLESS_SCENE, {
bmapId: 401
});
break;

case 16:
o.addLoading();
m.info(function(e) {
h.player.eye.list = e._temp.list;
_.pushScene(_.NAME.EYE_SCENE);
});
break;

case 17:
e("coinTopNode").prototype.onBuyGem_();
break;

case 18:
s = c.MAP.CONSTS.TYPE.NORMAL, d = k.genData(s).lastSmap.bmap.rankId;
_.pushScene(n.MMAP_SCENE, {
type: s,
bmapRankId: d
});
break;

case 19:
_.pushScene(n.BAG_SCENE);
break;

case 20:
_.pushScene(n.SHOP_SCENE);
break;

case 21:
y = i.BOSS;
if (h.player.level < y) {
o.addHintPanel(r.t("战队等级达到$1开启", [ y ]));
return;
}
e("crossServerScene").prototype.onMap3_();
break;

case 22:
var b;
(b = e("homeScene")).instance ? b.instance.chatPanel.getComponent("chatPanel").onChat_() : _.pushScene(n.HOME_SCENE, null, function() {
b.instance.chatPanel.getComponent("chatPanel").onChat_();
});
}
this.node && o.removePanel(this.node);
},
onBox_: function(e) {
var a = e.target, t = a.data;
if (t.isCanReceive) {
var n = this;
o.addLoading();
y.receiveTaskActiveAward(t.type, t.point, function(e) {
a.boxArmature.setAnimation(0, "action_1_2", !1);
n.scheduleOnce(function() {
o.addRewardEffectPanel(e._temp.entityCountMap);
}, 1);
});
t.isCanReceive = !1;
} else o.addRewardPanel(r.t("奖励内容"), t.dropList);
}
});
b.genData = function(e) {
var a = h.player, n = a.task, i = n.daily, r = [];
for (var s in i) if (i[s].taskId) {
var o = b.genTaskItemData(i[s]), l = o._data;
if (!(2014 == l.kindId && d.isHidePractice || l.requireLevel > a.level)) {
if (l.require.maxHours) {
var u = new Date(Date._now()).getHours();
if (l.require.maxHours < u) continue;
o.isComplete = u >= l.require.minHours && u < l.require.maxHours;
}
t.include([ 2101, 2102, 2103, 2104 ], o.taskId) && d.closeTopUpMsg || r.push(o);
}
}
r = t.sortBy(r, function(e) {
return e.isComplete ? -10 : 2101 == e.taskId ? -1 : 2102 == e.taskId ? -4 : 2103 == e.taskId ? -3 : 2104 == e.taskId ? -2 : e.taskId;
});
var m = a.activity.exchange, g = {};
if (m) {
Date.now() > m.end_time - c.CONSTS.A_DAY && delete m.dailyActiveRewardMoney;
var p = m.dailyActiveRewardMoney || {};
for (var _ in p) g[_] = {
entityId: a.activity.exchange.moneyId,
count: p[_]
};
}
var k = !!t.findWhere(r, {
isComplete: !0
}), f = t.keys(c.TASK.CONSTS.ACTIVE_REWARD_MAP.daily), y = !1;
for (var v in f) if (!n.receivedPointMap.daily[f[v]] && n.dailyActivePoint >= Number(f[v])) {
y = !0;
break;
}
f = t.keys(c.TASK.CONSTS.ACTIVE_REWARD_MAP.weekly);
var S = !1;
for (var v in f) if (!n.receivedPointMap.weekly[f[v]] && n.weeklyActivePoint >= Number(f[v])) {
S = !0;
break;
}
k = k || y || S;
return {
activeType: e || "daily",
dailyActivePoint: n.dailyActivePoint,
weeklyActivePoint: n.weeklyActivePoint,
receivedPointMap: n.receivedPointMap,
taskItems: r,
dailyActiveRewardExtDropMap: g,
isCanReceiveTaskAward: k,
isDailyActiveCanReceive: y,
isWeeklyActiveCanReceive: S
};
};
b.genTaskItemData = function(e) {
var a = h.player, t = Math.floor((new Date(a.weekCardExpire) - new Date(Date.now())) / c.CONSTS.A_DAY), i = Math.floor((new Date(a.monthCardExpire) - new Date(Date.now())) / c.CONSTS.A_DAY), r = Math.floor((new Date(a.yearCardExpire) - new Date(Date.now())) / c.CONSTS.A_DAY), s = n.task.findById(e.taskId), o = c.DROP.FUNS.getDropListByDesc(s.dropListDesc), l = [];
for (var d in o) {
var u = p.genData({
kindId: o[d].entityId,
count: o[d].count,
extra: o[d].extra
});
l.push(u);
}
return {
taskId: e.taskId,
goType: s.goType,
resId: s.resId,
title: s.name,
intro: s.description,
activePoint: s.activePoint,
achievementPoint: s.achievementPoint,
itemItems: l,
isComplete: e.isComplete,
show: e.show,
weekCardDayCount: t,
monthCardDayCount: i,
yearCardDayCount: r,
_data: s
};
};
cc._RF.pop();
}, {
arenaHandler: "arenaHandler",
baseView: "baseView",
bmapScene: "bmapScene",
buildExt: "buildExt",
clientConfig: "clientConfig",
coinTopNode: "coinTopNode",
crossServerScene: "crossServerScene",
dailyBmapScene: "dailyBmapScene",
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
