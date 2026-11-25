strongGoalPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "6c4afuieiRKM7VlJEX90plh", "strongGoalPanel");
var t = e("underscore"), n = (e("underscore.string"), e("moment"), e("soundApi")), i = (e("dataApi"), 
e("resource")), r = e("i18n"), s = e("helper"), o = e("baseView"), l = e("playerHandler"), c = e("serverConfig"), d = e("serverMain"), h = e("clientConfig"), u = (e("roleItem"), 
e("itemItem")), m = e("strongGoalMorePanel"), g = c.ACTIVITY.CONSTS, p = (c.ACTIVITY.FUNS, 
cc.Class({
extends: cc.Component,
properties: {
goalItemsNode: cc.Node,
scoreRichText: cc.RichText,
scoreBar: cc.Node,
rewardItem: cc.Node
},
onLoad: function() {
this.rewardItem.active = !1;
},
update_: function() {
var e = p.genData();
this.data = e;
for (var a = 0; a < 8; a++) {
var t = a + 1, n = this.goalItemsNode.getChildByName("item_" + t), i = p.getUnlockLevel(t);
n.data = {
no: t,
unlockLevel: i
};
n.getChildByName("lock_sp").active = d.player.level < i;
o.setMark(n, e.noNeedMarkMap[t]);
}
s.replaceLabel(this.scoreRichText, [ e.curPoint ]);
this.rewardItemMap = this.rewardItemMap || {};
o.preHideNodeMap(this.rewardItemMap);
for (var a in e.rewards) {
var r = e.rewards[a], l = this.rewardItemMap[a];
if (!l) {
(l = cc.instantiate(this.rewardItem)).parent = this.scoreBar;
l.idx = a;
this.rewardItemMap[a] = l;
}
l.active = !0;
o.markHideNode(l);
l.data = {
activityName: e.activityName,
rewardIdx: a
};
l.getComponent(cc.Button).interactable = r.status == g.STATUS.CAN_RECEIVE;
l.getChildByName("received_sp").active = r.status == g.STATUS.COMPLETE;
var c = l.getChildByName("item_node").getComponentInChildren("itemItem"), h = r.dropList[0];
c.setShowPanel_(r.status != g.STATUS.CAN_RECEIVE);
var m = u.genData({
kindId: h.entityId,
count: h.count,
extra: h.extra
}, !0);
c.update_(m);
o.addItemEffect(null, c.node, r.status == g.STATUS.CAN_RECEIVE);
var _ = l.getChildByName("need_score").getComponentInChildren(cc.Label), k = r.needMap.carnival3CompleteCount;
_.string = k;
l.x = k / e.maxPoint * this.scoreBar.width;
}
o.hideNodeMap(this.rewardItemMap);
this.scoreBar.getComponent(cc.ProgressBar).progress = e.curPoint / e.maxPoint;
},
show_: function() {
o.addPanel(this.node, !1, !1, !0);
this.update_();
this.node.getComponent(cc.Animation).play("strong_goal_show");
n.playMusic(i.sound_music_strong_goal_mp3);
},
onClose_: function() {
o.removePanel(this.node);
n.playMusic(i.sound_music_home_mp3);
},
onGoalItem_: function(a) {
var t = a.target.data;
d.player.level < t.unlockLevel ? o.addHintPanel(r.t("战队等级达到$1开启", [ t.unlockLevel ])) : e("homeScene").instance.strongGoalMorePanel.getComponent("strongGoalMorePanel").show_(t.no);
},
onReceive_: function(e) {
var a = e.target.data, t = this;
o.addLoading();
l.receiveActivityAward([ a.activityName ], [ a.rewardIdx ], function(e) {
o.addRewardEffectPanel(e._temp.entityCountMap);
t.update_();
});
}
}));
p.genData = function() {
var e = d.player.activity.map.carnival3_active;
if (!e) return null;
for (var a = e.reachMap.carnival3CompleteCount, n = t.last(e.rewards).needMap.carnival3CompleteCount, i = !!t.findWhere(e.rewards, {
status: g.STATUS.CAN_RECEIVE
}), r = {}, s = 1; s <= 8; s++) {
r[s] = m.genData(s).isNeedMark;
r[s] && (i = !0);
}
return {
activityName: e.name,
curPoint: a,
maxPoint: n,
rewards: e.rewards,
noNeedMarkMap: r,
isNeedMark: i
};
};
p.getUnlockLevel = function(e) {
var a, t = h.CONSTS.UNLOCK_LEVEL;
switch (e) {
case 1:
a = t.WORSHIP_BATTLE;
break;

case 2:
case 3:
a = t.All_SERVER_BATTLE;
break;

case 4:
a = t.TEAM_BATTLE;
break;

case 5:
a = t.ARENA_3V3;
break;

case 6:
a = t.BOSS;
break;

case 7:
a = t.GUILD;
break;

case 8:
a = t.PRESTIGE_BATTLE;
}
return a;
};
cc._RF.pop();
}, {
baseView: "baseView",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
strongGoalMorePanel: "strongGoalMorePanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
