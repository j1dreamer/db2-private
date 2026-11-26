endlessScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "3f05a9PNf5PzruPXRTlhhno", "endlessScene");
var t = e("underscore"), n = (e("util"), e("baseView")), i = e("helper"), r = e("i18n"), s = (e("soundApi"), 
e("guide"), e("resource"), e("dataApi")), o = e("buildExt"), l = e("serverMain"), c = e("serverConfig"), d = e("battle.consts"), h = e("sceneManager"), u = e("rulePanel"), m = e("rankHandler"), g = e("endlessHandler"), p = e("endlessTypeScene"), _ = e("selectBattleRolesScene"), k = e("itemItem"), f = cc.Class({
extends: cc.Component,
properties: {
titleLabel: cc.Label,
stoneBt: cc.Node,
skipBt: cc.Node,
rankBt: cc.Node,
rolesBt: cc.Node,
scrollView: cc.ScrollView,
armatureNode: cc.Node,
mapLayout: cc.Node,
smapItem: cc.Node,
effectArmature: cc.Node,
topPassLabel: cc.Label,
timesLabel: cc.Label,
smapPosList: [ cc.Vec2 ]
},
onLoad: function() {
h.curSceneStatusData = t.extend({}, h.curSceneStatusData);
this.statusData = h.curSceneStatusData;
this.smapItem.active = !1;
this.rankBt.active = !o.isHideRankBt;
this.effectArmature.getComponent(sp.Skeleton).setAnimation(0, "action", !0);
this.update_(this.statusData.bmapId);
},
update_: function(e) {
var a = f.genData(e);
this.data = a;
this.titleLabel.node.active = !!a.title;
this.titleLabel.node.active && (this.titleLabel.string = a.title);
this.stoneBt.active = a.isMain;
this.skipBt.active = a.isMain;
this.rolesBt.active = !a.isMain;
var t = a.playerPhotoInfo, r = s.role.findOneBy("imgId", t.photoImgId), o = r ? r.classId : 1;
if ((h = this.armatureNode.characterNode) && h.getComponent("characterArmatureComponent").data.classId != o) {
h.destroy();
h = null;
}
if (!h && o) {
(h = n.getCharacterNode(o)).parent = this.armatureNode;
h.getComponent("characterArmatureComponent").setTitle_(t.titleImgId);
this.armatureNode.characterNode = h;
}
this.smapItemMap = this.smapItemMap || {};
n.preHideNodeMap(this.smapItemMap);
var l = 0;
for (var c in a.smapItems) {
var d = this.smapItemMap[c];
if (!d) {
(d = cc.instantiate(this.smapItem)).setPosition(this.smapPosList[c]);
d.parent = this.mapLayout;
d.idx = c;
this.smapItemMap[c] = d;
d.targetOff(this);
d.on(cc.Node.EventType.TOUCH_START, this.onSmap_, this);
d.on(cc.Node.EventType.TOUCH_END, this.onSmap_, this);
d.on(cc.Node.EventType.TOUCH_CANCEL, this.onSmap_, this);
}
var h, u = a.smapItems[c];
d.data = u;
d.active = !0;
n.markHideNode(d);
if ((h = d.characterNode) && h.getComponent("characterArmatureComponent").data.classId != u.classId) {
h.destroy();
h = null;
delete this.characterNodeMap[c];
}
if (!h && u.classId) {
(h = n.getCharacterNode(u.classId)).parent = d;
h.idx = c;
d.characterNode = h;
h.scaleX = -1;
}
var m = d.getChildByName("reward_bg_sp");
m.zIndex = 1;
d.rewardBgSp = m;
var g = d.rewardBgSp.getChildByName("items_layout"), p = g.getChildByName("item_item_1");
p.active = !!u.itemItem1;
p.active && p.getComponent("itemItem").update_(u.itemItem1);
var _ = g.getChildByName("item_item_2");
_.active = !!u.itemItem2;
_.active && _.getComponent("itemItem").update_(u.itemItem2);
var k = g.getChildByName("item_item_3");
k.active = !!u.itemItem3;
k.active && k.getComponent("itemItem").update_(u.itemItem3);
d.rewardBgSp.active = u.no == a.nextNo;
if (d.rewardBgSp.active && f.isAutoNextSmap) {
d.rewardBgSp.opacity = 0;
cc.tween(d.rewardBgSp).to(.5, {
opacity: 255
}).start();
}
i.replaceLabel(d.rewardBgSp.getChildByName("no_label").getComponent(cc.Label), [ u.no ]);
u.no == a.nextNo && (l = c);
var y = d.getChildByName("no_bg_sp");
y.zIndex = 1;
d.noBgSp = y;
d.noBgSp.active = !d.rewardBgSp.active;
i.replaceLabel(d.noBgSp.getChildByName("no_label").getComponent(cc.Label), [ u.no ]);
}
n.hideNodeMap(this.smapItemMap);
i.replaceLabel(this.topPassLabel, [ a.topPassId ]);
this.timesLabel.node.parent.active = a.isMain;
this.timesLabel.string = a.remainingTimes;
var b = this.scrollView.getMaxScrollOffset().y - (this.smapItemMap[l].y - .5 * cc.winSize.height);
this.scrollView.scrollToOffset(cc.v2(0, b));
this.scrollView.getComponent("listViewComponent").delayUpdate_(0);
if (f.isAutoNextSmap) {
f.isAutoNextSmap = !1;
this.scheduleOnce(function() {
this.onSmap_({
target: this.smapItemMap[l],
type: cc.Node.EventType.TOUCH_END
});
}, 1);
}
},
onSmap_: function(e) {
var a = e.target, t = a.data;
switch (e.type) {
case cc.Node.EventType.TOUCH_START:
t.no != this.data.nextNo && (a.rewardBgSp.active = !0);
break;

case cc.Node.EventType.TOUCH_CANCEL:
t.no != this.data.nextNo && (a.rewardBgSp.active = !1);
break;

case cc.Node.EventType.TOUCH_END:
t.no == this.data.nextNo ? h.pushScene(h.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: _.TYPE.SMAP_BATTLE_ATTACK_TEAM,
opts: {
type: d.BATTLE_TYPE.SMAP,
bmapId: this.data.bmapId,
isMain: this.data.isMain,
smapId: t.kindId,
isEndless: !0
}
}) : a.rewardBgSp.active = !1;
}
a.noBgSp.active = !a.rewardBgSp.active;
},
onRank_: function() {
n.addLoading();
if (this.data.isMain) m.top50("endless_pass_id", function(e) {
n.addRankPanel(7, e._temp.myRank, e._temp.myValue, e._temp.list);
}); else {
var e = this;
m.allServerTop(l.player.extra.crossSid, "endless_pass_id" + this.data.bmapId, 0, 49, function(a) {
n.addRankPanel("7_" + e.data.bmapId, a._temp.myRank, a._temp.myValue, a._temp.list);
});
}
},
onStone_: function() {
h.pushScene(h.NAME.BAG_SCENE, {
selectBtName: "stone_bt"
});
},
onSkip_: function() {
var e = this;
n.addMessageBox(r.t("是否扫荡$1-$2关?", [ 1, this.data.topPassId ]), function() {
n.addLoading();
g.skip(function(a) {
n.addRewardEffectPanel(a._temp.entityCountMap);
e.update_(e.statusData.bmapId);
});
});
},
onRule_: function() {
n.addRulePanel(this.data.isMain ? u.TYPE.END_LESS : u.TYPE.END_LESS2);
},
onRoles_: function() {
n.addCanUseRolesPanel(this.data.canUseRoleClassIds, this.data.canUseRoleTitle);
}
});
f.genData = function(e) {
var a = l.player, n = a.endless, i = a.vip, d = a.vipData.endlessSkipTimes - i.endlessSkipTimes, h = 401 == e, u = e;
t.include(t.range(402, 409), e) && (u = 402);
for (var m = h ? o.endlessMaxNo : o.otherEndlessMaxNo, g = h ? n.topPassId : n.otherTopPassIdMap[e] || 0, _ = g + 1, f = _, y = (m || t.last(s.smap.findByOpts({
bmapId: u
})).no) - 10, b = [], v = f = (f = f > _ ? _ - 3 : f) > y ? y : f; v < f + 11; v++) {
var S = s.smap.findByOpts({
no: v,
bmapId: u
})[0], T = [];
S.coin && T.push({
entityId: c.CONSTS.ENTITY_ID.COIN,
count: S.coin
});
h && !o.endlessNoGem && T.push({
entityId: c.CONSTS.ENTITY_ID.GEM,
count: c.MAP.CONSTS.PASS_GET_GEM
});
for (var M in S.specifyDropEntityIds) T.push({
entityId: S.specifyDropEntityIds[M],
count: S.specifyDropValues[M]
});
var $ = k.genData({
kindId: T[0].entityId,
count: T[0].count
}, !0), I = T[1] ? k.genData({
kindId: T[1].entityId,
count: T[1].count
}, !0) : null, C = T[2] ? k.genData({
kindId: T[2].entityId,
count: T[2].count
}, !0) : null, P = s.mob.findById(S.showBossId), D = {
no: S.no,
kindId: S.kindId,
classId: P.classId,
itemItem1: $,
itemItem2: I,
itemItem3: C
};
b.push(D);
}
var N = p.TitleMap[e];
N = N ? r.t(N) : null;
var A = new Date(Date._now()).getDay(), L = c.MAP.CONSTS.ENDLESS_DAY_ROLE_CLASS_IDS_MAP[A], E = c.MAP.CONSTS.ENDLESS_DAY_TITLE_MAP[A];
return {
isMain: h,
title: N,
bmapId: e,
playerPhotoInfo: a.photoInfo,
topPassId: g,
nextNo: _,
smapItems: b,
remainingTimes: d,
canUseRoleClassIds: L,
canUseRoleTitle: E
};
};
f.isAutoNextSmap = !1;
cc._RF.pop();
}, {
baseView: "baseView",
"battle.consts": "battle.consts",
buildExt: "buildExt",
dataApi: "dataApi",
endlessHandler: "endlessHandler",
endlessTypeScene: "endlessTypeScene",
guide: "guide",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
rankHandler: "rankHandler",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore",
util: "util"
} ],
