quickNode: [ function(e, a) {
"use strict";
cc._RF.push(a, "a8ce2Hb02hAMK7sUUrjFcxH", "quickNode");
var t = e("underscore"), n = e("player"), i = e("serverMain"), r = e("buildExt"), s = e("dailyTaskPanel"), o = e("achievementPanel"), l = e("shipScene"), c = e("baseView"), d = e("sceneManager"), h = cc.Class({
extends: cc.Component,
properties: {
upBt: cc.Button,
downBt: cc.Button,
rightLayout: cc.Layout,
teamBt: cc.Node,
achievementBt: cc.Node,
dailyTaskBt: cc.Node,
rankBt: cc.Node
},
onLoad: function() {
this.isPackUp = !0;
this.rightLayout.node.y = 800;
this.upBt.node.active = !this.isPackUp;
this.downBt.node.active = this.isPackUp;
this.rankBt.active = !r.isHideRankBt;
this.achievementBt.active = !r.isHideActivityBt;
this.dailyTaskBt.active = !r.isHideActivityBt;
this.onFun = this.update_.bind(this);
i.player.on(n.EVENT.ATTRS, this.onFun);
i.player.on(n.EVENT.TEAM, this.onFun);
i.player.on(n.EVENT.BAG, this.onFun);
this.update_();
},
onDestroy: function() {
i.player.off(n.EVENT.ATTRS, this.onFun);
i.player.off(n.EVENT.TEAM, this.onFun);
i.player.off(n.EVENT.BAG, this.onFun);
},
update_: function() {
var e = h.genData();
c.setMark(this.downBt.node, e.isNeedMark);
c.setMark(this.teamBt, e.isMarkTeam);
c.setMark(this.achievementBt, e.isMarkAchievement);
c.setMark(this.dailyTaskBt, e.isMarkDailyTask);
},
onQuick_: function() {
this.isPackUp = !this.isPackUp;
this.upBt.node.active = !this.isPackUp;
this.downBt.node.active = this.isPackUp;
cc.Tween.stopAllByTarget(this.rightLayout.node);
var e = this.isPackUp ? cc.tween().to(.2, {
position: cc.v2(0, 800)
}) : cc.tween().to(.5, {
position: {
value: cc.v2(0, 300),
easing: "quintOut"
}
});
cc.tween(this.rightLayout.node).then(e).start();
},
onTeam_: function() {
d.getCurSceneInfo().name != d.NAME.TEAM_SCENE ? d.pushScene(d.NAME.TEAM_SCENE) : this.onQuick_();
},
onBag_: function() {
d.getCurSceneInfo().name != d.NAME.BAG_SCENE ? d.pushScene(d.NAME.BAG_SCENE) : this.onQuick_();
},
onAchievement_: function() {
c.addAchievementPanel();
},
onDailyTask_: function() {
c.addDailyTaskPanel();
},
onRank_: function() {
c.addRankPanel();
}
});
h.genData = function() {
var e = s.genData().isCanReceiveTaskAward, a = o.genData().isCanReceiveTaskAward, n = t.values(d.teamData.teamItemMap), i = !!t.findWhere(n, {
isNeedMark: !0
}), r = l.genData().isNeedMark;
return {
isNeedMark: e || a || i || r,
isMarkTeam: i,
isMarkAchievement: a,
isMarkDailyTask: e
};
};
cc._RF.pop();
}, {
achievementPanel: "achievementPanel",
baseView: "baseView",
buildExt: "buildExt",
dailyTaskPanel: "dailyTaskPanel",
player: "player",
sceneManager: "sceneManager",
serverMain: "serverMain",
shipScene: "shipScene",
underscore: "underscore"
} ],
