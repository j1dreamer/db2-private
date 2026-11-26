practiceScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "6afdcLFnLpGvZH9YFgMmlxe", "practiceScene");
var t = e("underscore"), n = (e("util"), e("baseView")), i = e("helper"), r = e("i18n"), s = (e("guide"), 
e("dataApi")), o = e("serverMain"), l = e("serverConfig"), c = e("practiceHandler"), d = e("sceneManager"), h = e("viewBattleTeamPanel"), u = e("rulePanel"), m = e("selectBattleRolesScene"), g = l.PRACTICE.CONSTS.TYPE, p = cc.Class({
extends: cc.Component,
properties: {
pageview: cc.PageView,
leftBt: cc.Node,
rightBt: cc.Node,
defenseTimesLabel: cc.Label,
challengeTimesLabel: cc.Label,
mapPageContent: cc.Node,
practicePlayerItem: cc.Node,
startPracticePanel: cc.Node
},
onLoad: function() {
d.curSceneStatusData = t.extend({
selectPageIdx: 0,
selectPracticeLevel: null
}, d.curSceneStatusData);
this.statusData = d.curSceneStatusData;
this.practicePlayerItem.active = !1;
this.startPracticePanel.active = !1;
t.each(this.pageview.content.children, function(e) {
e.width = e.width < cc.winSize.width ? cc.winSize.width : e.width;
});
this.update_();
},
update_: function() {
var e = p.genData();
this.data = e;
this.defenseTimesLabel.string = r.t("可特训次数：$1", [ e.remainingDefenseTimes ]);
this.challengeTimesLabel.string = r.t("可扰乱次数：$1", [ e.remainingChallengeTimes ]);
this.data.defenseInfosMap || this.scheduleOnce(function() {
this.onRefresh_();
}, 0);
this.scheduleOnce(function() {
this.pageview.scrollToPage(this.statusData.selectPageIdx, 0);
this.pageview.scrollToPage(this.statusData.selectPageIdx, .01);
this.onPageViewEvent_(this.pageview);
this.statusData.selectPracticeLevel && this.onPractice_();
}, 0);
},
onShop_: function() {
d.pushScene(d.NAME.SHOP_SCENE, {
type: l.SHOP.CONSTS.TYPE.PRACTICE
});
},
onRefresh_: function() {
n.addLoading();
var e = this;
c.match(function(a) {
var r = a._temp.defenseInfosMap;
e.data.defenseInfosMap = r;
for (var l in r) {
var c = e.mapPageContent.getChildByName("page_" + l).getChildByName("items_layout");
c.practicePlayerItemMap = c.practicePlayerItemMap || {};
n.preHideNodeMap(c.practicePlayerItemMap);
for (var d in r[l]) {
var h = c.practicePlayerItemMap[d];
if (!h) {
(h = cc.instantiate(e.practicePlayerItem)).parent = c;
h.idx = d;
c.practicePlayerItemMap[d] = h;
}
h.active = !0;
n.markHideNode(h);
var u = r[l][d];
h.data = u;
var m = s.role.findOneBy("imgId", u.playerPhotoInfo.photoImgId).classId;
u.classId = m;
var p = h.characterNode;
if (p && p.getComponent("characterArmatureComponent").data.classId != u.classId) {
p.destroy();
p = null;
}
if (!p && u.classId) {
(p = n.getCharacterNode(u.classId)).parent = h.getChildByName("armature_node");
p.idx = d;
p.getComponent("characterArmatureComponent").setTitle_(u.playerPhotoInfo.titleImgId);
h.characterNode = p;
}
var _ = h.getChildByName("info_bg_sp");
_.getChildByName("name_label").getComponent(cc.Label).string = u.playerName;
i.replaceLabel(_.getChildByName("server_label").getComponent(cc.Label), [ u.serverId ]);
i.replaceLabel(_.getChildByName("level_label").getComponent(cc.Label), [ u.playerLevel ]);
h.getChildByName("me_sp").active = u.playerId == o.player.id;
var k = h.getChildByName("bottom_sp");
k.active = l == g.MONEY;
if (k.active) {
t.each(k.children, function(e) {
e.active = !1;
});
k.getChildByName("spine_" + u.level).active = !0;
}
}
n.hideNodeMap(c.practicePlayerItemMap);
}
});
},
onPractice_: function(a) {
if (this.data.selectType == g.MONEY) {
n.addPanel(this.startPracticePanel, !1, !1, !a);
this.statusData.selectPracticeLevel = this.statusData.selectPracticeLevel || 1;
var t = e("startPracticePanel").genData(this.statusData.selectPracticeLevel);
this.startPracticePanel.getComponent("startPracticePanel").update_(t);
} else {
var i = l.PRACTICE.FUNS.getRewardDropList(this.data.selectType, o.player.level, 1, 1), c = "";
for (var h in i) c += "<" + s.findEntityById(i[h].entityId).kindName + "x" + i[h].count + ">";
var u = this;
n.addMessageBox(r.t("本次特训将获得$1", [ c ]), function() {
d.pushScene(d.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.PRACTICE_DEFENSE_TEAM,
opts: {
type: u.data.selectType,
level: 1
}
});
});
}
},
onSwitch_: function(e, a) {
var t = this.pageview.getCurrentPageIndex() + Number(a);
t < 0 || t > this.pageview.getPages().length - 1 || this.pageview.scrollToPage(t);
},
onPageViewEvent_: function(e) {
var a = e.getCurrentPageIndex();
this.data.selectType = t.values(g)[a];
this.leftBt.active = a > 0;
this.rightBt.active = a < e.getPages().length - 1;
this.statusData.selectPageIdx = a;
},
onRule_: function() {
n.addRulePanel(u.TYPE.PRACTICE);
},
onPracticePlayerItem_: function(e) {
var a = e.target.data;
n.addLoading();
c.defenseTeam(a.playerId, a.ctime, function(e) {
n.addViewBattleTeamPanel(e._temp.defenseTeam, {
battleType: h.BATTLE_TYPE.PRACTICE
});
});
}
});
p.genData = function() {
var e = o.player.practice;
return {
remainingChallengeTimes: e.remainingChallengeTimes,
remainingDefenseTimes: e.remainingDefenseTimes
};
};
cc._RF.pop();
}, {
baseView: "baseView",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
i18n: "i18n",
practiceHandler: "practiceHandler",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
startPracticePanel: "startPracticePanel",
underscore: "underscore",
util: "util",
viewBattleTeamPanel: "viewBattleTeamPanel"
} ],
