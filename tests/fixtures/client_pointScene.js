pointScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "f0dc2RnORdHrIPR6deRMG+J", "pointScene");
var t = e("underscore"), n = (e("http"), e("buildExt")), i = e("moment"), r = e("baseView"), s = e("dataApi"), o = e("guide"), l = (e("clientConfig"), 
e("serverConfig")), c = e("serverMain"), d = e("player"), h = e("pointHandler"), u = e("i18n"), m = e("helper"), g = e("soundApi"), p = e("resource"), _ = e("itemItem"), k = e("roleItem"), f = e("skillItem"), y = (e("skillInfoPanel"), 
e("sceneManager"), 1), b = l.POINT.CONSTS, v = (l.POINT.FUNS, cc.Class({
extends: cc.Component,
properties: {
bgSpine: cc.Node,
normalSpine: cc.Node,
advancedSpine: cc.Node,
leftNode: cc.Node,
rightNode: cc.Node,
leftTicketCountLabel: cc.Label,
rightTicketCountLabel: cc.Label,
switchTimeLabel: cc.Label,
normalNode: cc.Node,
normalTicketCountLabel: cc.Label,
normalGemSp: cc.Node,
normalTicketSp: cc.Node,
normalTenGemSp: cc.Node,
normalTenTicketSp: cc.Node,
normalPointBt: cc.Node,
normalPriceLabel: cc.Label,
normal10PriceLabel: cc.Label,
normalGemTimesLabel: cc.Label,
advancedNode: cc.Node,
advancedTicketCountLabel: cc.Label,
advancedPointBt: cc.Node,
advancedPriceLabel: cc.Label,
advanced10PriceLabel: cc.Label,
advancedBottomNode: cc.Node,
luckBar: cc.ProgressBar,
luckPctLabel: cc.Label,
luckEndTimeLabel: cc.Label,
luckDescRichText: cc.RichText,
pointBackBt: cc.Node,
pointEffectNode: cc.Node,
pointEffectYesBt: cc.Node,
pointItem: cc.Node,
tenPointItem: cc.Node,
tenPointItemLayout: cc.Node,
pointEffectBottomNode: cc.Node,
pointAgainPriceLabel: cc.Label,
pointAgainMoneySp: cc.Sprite,
pointAgainTimesLabel: cc.Label,
pointAgainBt: cc.Button,
pointYesBt: cc.Button,
normalTicketSpriteFrame: cc.SpriteFrame,
gemSpriteFrame: cc.SpriteFrame,
advancedTicketSpriteFrame: cc.SpriteFrame,
normalViewPanel: cc.Node,
advancedViewPanel: cc.Node,
advancedViewRoleSp: cc.Node,
advancedViewRoleSpsLayout: cc.Node,
wishPanel: cc.Node,
wishArmatureNode: cc.Node,
wishGroupSp: cc.Sprite,
wishNameLabel: cc.Label,
wishTitleLabel: cc.Label,
wishPositionLabel: cc.Label,
wishSpIntroLabel: cc.Label,
wishIntroLabel: cc.Label,
wishRoleItemNode: cc.Node,
wishRoleItemNodesLayout: cc.Node,
wishSkillLayout: cc.Node,
skillInfoPanel: cc.Node,
switchAdvancedPoolPanel: cc.Node,
switchTeamItem: cc.Node,
switchTeamItemsNode: cc.Node,
switchTeamItemsNodesLayout: cc.Node,
switchAdvancedTimeLabel: cc.Label,
skipBt: cc.Node,
hundredBtArr: [ cc.Node ]
},
statics: {
instance: null
},
onLoad: function() {
v.instance || (v.instance = this);
this.onFun = this.update_.bind(this);
c.player.on(d.EVENT.ATTRS, this.onFun);
this.leftNode.active = !0;
this.rightNode.active = !0;
this.normalNode.active = !1;
this.advancedNode.active = !1;
this.pointBackBt.active = !1;
this.pointEffectNode.active = !1;
this.tenPointItem.active = !1;
this.normalViewPanel.active = !1;
this.advancedViewPanel.active = !1;
this.wishPanel.active = !1;
this.switchAdvancedPoolPanel.active = !1;
this.skipBt.active = !1;
this.skipMove = !1;
this.selectPointType = null;
this.bgSpine.active = !0;
this.normalSpine.active = !1;
this.advancedSpine.active = !1;
this.update_([ "point" ]);
},
onDestroy: function() {
c.player.off(d.EVENT.ATTRS, this.onFun);
v.instance = null;
},
update_: function(e) {
if (t.include(e, "point")) {
var a = v.genData();
this.data = a;
this.leftTicketCountLabel.string = a.normalTicketCount;
this.rightTicketCountLabel.string = a.advancedTicketCount;
this.normalTicketCountLabel.string = a.normalTicketCount;
this.advancedTicketCountLabel.string = a.advancedTicketCount;
this.normalPriceLabel.string = a.normalTicketCount > 0 ? 1 : b.NORMAL_COST_GEM;
this.normalTicketSp.active = a.normalTicketCount > 0;
this.normalGemSp.active = !this.normalTicketSp.active;
this.normal10PriceLabel.string = a.normalTicketCount >= 10 ? 10 : b.NORMAL_TEN_COST_GEM;
this.normalTenTicketSp.active = a.normalTicketCount >= 10;
this.normalTenGemSp.active = !this.normalTenTicketSp.active;
this.advancedPriceLabel.string = 1;
this.advanced10PriceLabel.string = 10;
this.advancedBottomNode.active = !!a.advancedSpecialInfo;
if (this.advancedBottomNode.active) {
this.luckBar.progress = a.curLuck / a.maxLuck;
m.replaceLabel(this.luckPctLabel, [ a.curLuck, a.maxLuck ]);
this.luckDescRichText.string = a.luckHintStr;
}
this.normalGemTimesLabel.node.active = !!n.dailyNormalGemPointTimes;
this.normalGemTimesLabel.node.active && m.replaceLabel(this.normalGemTimesLabel, [ n.dailyNormalGemPointTimes - this.data._point.dailyNormalUseGemTimes ]);
var i = c.player.gem, r = this.normalNode.getChildByName("hundred_bg_sp"), s = this.advancedNode.getChildByName("hundred_bg_sp");
r.active = n.scorePointShowHundredBt && (a.normalTicketCount >= 100 || i >= 10 * b.NORMAL_TEN_COST_GEM);
s.active = n.scorePointShowHundredBt && a.advancedTicketCount >= 100;
if (r.active) {
var o = r.getChildByName("price_label").getComponent(cc.Label), l = r.getChildByName("ticket_sp"), d = r.getChildByName("gem_sp");
o.string = a.normalTicketCount >= 100 ? 100 : 10 * b.NORMAL_TEN_COST_GEM;
l.active = a.normalTicketCount >= 100;
d.active = !l.active;
}
s && (s.getChildByName("price_label").getComponent(cc.Label).string = 100);
this.skipMove = !this.skipMove;
this.onSkip_();
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
}
},
tick_: function() {
var e = new Date(Date._now() + l.CONSTS.A_DAY).setHours(l.PLAYER.CONSTS.RESET_HOURS, 0, 0, 0), a = i.duration(e - Date._now()), t = m.formatDuration(a.asHours(), a.minutes(), a.seconds());
this.switchTimeLabel.string = t;
this.switchAdvancedTimeLabel.string = t;
if (Date.now() > this.data.luckEndTime) this.advancedBottomNode.active = !1; else {
a = i.duration(this.data.luckEndTime - Date.now()), t = m.formatDuration(a.asHours(), a.minutes(), a.seconds());
this.luckEndTimeLabel.string = t;
}
},
onSwitchPointNode_: function(e, a) {
var t, n;
cc.tween(this.leftNode).by(.3, {
position: cc.v2(-900, 0)
}).start();
cc.tween(this.rightNode).by(.3, {
position: cc.v2(900, 0)
}).start();
switch (a) {
case "normal":
t = this.normalSpine;
n = this.normalNode;
break;

case "advanced":
t = this.advancedSpine;
n = this.advancedNode;
}
this.bgSpine.active = !1;
this.normalSpine.active = !1;
this.advancedSpine.active = !1;
t.active = !0;
this.normalNode.active = !1;
this.advancedNode.active = !1;
this.skipBt.active = !0;
n.active = !0;
n.opacity = 0;
cc.tween(n).to(.3, {
opacity: 255
}).start();
r.getBackNode().node.active = !1;
this.pointBackBt.active = !0;
},
onClosePointNode_: function() {
this.normalNode.active = !1;
this.advancedNode.active = !1;
this.bgSpine.active = !0;
this.normalSpine.active = !1;
this.advancedSpine.active = !1;
cc.tween(this.leftNode).by(.5, {
position: {
value: cc.v2(900, 0),
easing: "quintOut"
}
}).start();
cc.tween(this.rightNode).by(.5, {
position: {
value: cc.v2(-900, 0),
easing: "quintOut"
}
}).start();
r.getBackNode().node.active = !0;
this.pointBackBt.active = !1;
this.skipBt.active = !1;
},
onPoint_: function(e, a) {
this.selectPointType = a;
var i, s, l, c, d, _, k = Number(a);
if (n.dailyNormalGemPointTimes && t.include([ y, 2 ], k)) {
var f = this.data.normalTicketCount, S = n.dailyNormalGemPointTimes - this.data._point.dailyNormalUseGemTimes, T = k == y ? 1 : 10;
if (f < T && S < T) {
r.addHintPanel(u.t("今日使用钻石抽奖已达到上限，请明日再来"));
return;
}
}
switch (k) {
case y:
i = h.normal;
s = 1;
l = this.normalTicketSpriteFrame;
c = 1;
d = this.normalSpine;
_ = "action_1_";
break;

case 2:
i = h.normalTen;
s = 10;
l = this.normalTicketSpriteFrame;
c = 10;
d = this.normalSpine;
_ = "action_1_";
break;

case 3:
i = h.advanced;
s = 1;
l = this.advancedTicketSpriteFrame;
c = 1;
d = this.advancedSpine;
_ = "action_2_";
break;

case 4:
i = h.advancedTen;
s = 10;
l = this.advancedTicketSpriteFrame;
c = 10;
d = this.advancedSpine;
_ = "action_2_";
break;

case 5:
i = h.normalHundred;
d = this.normalSpine;
_ = "action_1_";
break;

case 6:
i = h.advancedHundred;
d = this.advancedSpine;
_ = "action_1_";
}
var M = this;
r.addLoading();
k >= 5 ? i.call(h, function(e) {
console.log("一百抽抽卡数据是：", e);
M.normalSpine.active = !1;
M.advancedSpine.active = !1;
d.active = !0;
g.playEffect(p.sound_effect_point_mp3);
d.getComponent(sp.Skeleton).setAnimation(0, _ + "2", !1);
r.addLoading(null, !1, !0);
cc.tween(M.node).delay(M.skipMove ? 0 : 2.7).call(function() {
d.getComponent(sp.Skeleton).setAnimation(0, _ + "1", !0);
r.removeLoading();
r.addRewardEffectPanel(e._temp.entityCountMap);
}).start();
}) : i.call(h, function(e) {
console.log("---------------抽卡数据：", e);
M.normalSpine.active = !1;
M.advancedSpine.active = !1;
d.active = !0;
g.playEffect(p.sound_effect_point_mp3);
d.getComponent(sp.Skeleton).setAnimation(0, _ + "2", !1);
r.addLoading(null, !1, !0);
cc.tween(M.node).delay(M.skipMove ? 0 : 2.7).call(function() {
d.getComponent(sp.Skeleton).setAnimation(0, _ + "1", !0);
r.removeLoading();
var a = e.team ? e.team.roles : [], t = e._temp.dropList, n = {};
for (var i in a) n[a[i].kindId] = a[i];
var h = v.genPointEffectData(k, t, n);
r.addPanel(M.pointEffectNode, !1, !1, !0);
M.pointItem.active = !0;
if (l == M.normalTicketSpriteFrame) {
var u = v.genData();
if (1 == s) {
M.pointAgainPriceLabel.string = u.normalTicketCount >= s ? s : b.NORMAL_COST_GEM;
M.pointAgainMoneySp.spriteFrame = u.normalTicketCount >= s ? l : M.gemSpriteFrame;
} else if (10 == s) {
M.pointAgainPriceLabel.string = u.normalTicketCount >= s ? s : b.NORMAL_TEN_COST_GEM;
M.pointAgainMoneySp.spriteFrame = u.normalTicketCount >= s ? l : M.gemSpriteFrame;
}
} else {
M.pointAgainPriceLabel.string = s;
M.pointAgainMoneySp.spriteFrame = l;
}
m.replaceLabel(M.pointAgainTimesLabel, [ c ]);
M.tenPointItemLayout.active = !0;
var f = [];
if (1 == h.entityItems.length) {
M.pointItem.data = h.entityItems[0];
f.push(M.pointItem);
M.tenPointItemLayout.active = !1;
} else {
M.pointItemMap = M.pointItemMap || {};
r.preHideNodeMap(M.pointItemMap);
for (var i in h.entityItems) {
var y = M.pointItemMap[i];
if (!y) {
(y = cc.instantiate(M.tenPointItem)).parent = M.tenPointItemLayout;
y.idx = i;
M.pointItemMap[i] = y;
}
y.active = !0;
r.markHideNode(y);
y.data = h.entityItems[i];
f.push(y);
}
r.hideNodeMap(M.pointItemMap);
M.pointItem.active = !1;
}
var S = M.skipMove ? .05 : .3;
for (i = 0; i < f.length; i++) {
var T = f[i].getChildByName("item_item"), $ = f[i].getChildByName("role_item_node"), I = !!h.roleMap[f[i].data.kindId];
T.active = !I;
$.active = I;
var C = cc.tween().hide().delay(0 + S * i).show().call(function() {
var e = this.data.kindId, a = h.roleMap[e];
if (a = (M.skipMove ? null : this.data.role) || a) {
m.pauseNode(M.pointEffectNode);
r.addPointRoleEffectNode(a, M.pointEffectNode, "point");
o.callNext("point2Role", "guideNext1");
}
g.playEffect(p.sound_effect_lottery_one_mp3);
}.bind({
data: f[i].data
}));
if (I) {
$.getChildByName("role_item").getComponent("roleItem").update_(f[i].data);
cc.tween($).then(C).start();
} else {
T.getComponent("itemItem").update_(f[i].data);
T.getComponent("itemItem").setShowPanel_(!0);
cc.tween(T).then(C).start();
}
var P = f[i].getChildByName("name_Label");
P.getComponent(cc.Label).string = f[i].data._data.kindName;
P.opacity = 0;
cc.tween(P).delay(0 + f.length * S).to(.3, {
opacity: 255
}).start();
var D = f[i].getChildByName("light_sp");
if (!M.skipMove) {
D.active = !0;
D.scale = 5;
D.opacity = 255;
cc.tween(D).hide().delay(0 + S * i).show().to(.1, {
scale: 1
}).to(.2, {
opacity: 0
}).start();
}
}
M.pointAgainBt.interactable = !1;
M.pointYesBt.interactable = !1;
M.pointEffectBottomNode.opacity = 0;
cc.tween(M.pointEffectBottomNode).delay(0 + f.length * S).to(.3, {
opacity: 255
}).call(function() {
M.pointAgainBt.interactable = !0;
M.pointYesBt.interactable = !0;
}).start();
}).start();
});
},
onAgainPoint_: function() {
r.removePanel(this.pointEffectNode);
this.onPoint_(null, this.selectPointType);
},
onClosePointEffect_: function() {
r.removePanel(this.pointEffectNode);
},
onNormalView_: function() {
r.addPanel(this.normalViewPanel);
},
onCloseNormalView_: function() {
r.removePanel(this.normalViewPanel);
},
onAdvancedView_: function() {
r.addPanel(this.advancedViewPanel);
this.advancedViewRoleSp.active = !1;
var a = b.ADVANCED_CLASS_IDS[this.data._point.selectAdvancedIdx], n = s.findDropByClassId(a)[1][2].refClassId, i = s.findDropByClassId(n)[1], o = [];
for (var l in i) o.push(s.findEntityById(i[l].entityId).classId);
o = t.sortBy(o, function(e) {
return -s.role.findOneBy("classId", e).group;
});
var c = this.data._point.advancedSpecialInfo;
o = (c ? c.classIds : []).concat(o);
var d = e("canUseRolesPanel").genData(o);
this.advancedViewPanel.roleSpMap = this.advancedViewPanel.roleSpMap || {};
r.preHideNodeMap(this.advancedViewPanel.roleSpMap);
for (var l in d.roleInfos) {
var h = this.advancedViewPanel.roleSpMap[l];
if (!h) {
(h = cc.instantiate(this.advancedViewRoleSp)).parent = this.advancedViewRoleSpsLayout;
this.advancedViewPanel.roleSpMap[l] = h;
}
h.active = !0;
r.markHideNode(h);
h.idx = l;
var u = d.roleInfos[l];
h.data = u;
h.getChildByName("name_label").getComponent(cc.Label).string = u.name;
r.setSpriteFrame(h.getChildByName("above_sp").getComponent(cc.Sprite), p["friendship_" + u.classId + "_png"]);
r.setSpriteFrame(h.getChildByName("group_sp").getComponent(cc.Sprite), p["misc_role_big_group_" + u.group + "_png"], !0, !0);
}
r.hideNodeMap(this.advancedViewPanel.roleSpMap);
},
onCloseAdvancedView_: function() {
r.removePanel(this.advancedViewPanel);
},
onWish_: function() {
r.addPanel(this.wishPanel);
this.wishRoleItemNode.active = !1;
var e = v.genWishPanelData();
if (this.wishArmatureNode.characterNode && this.wishArmatureNode.characterNode.getComponent("characterArmatureComponent").data.classId != e.classId) {
this.wishArmatureNode.characterNode.destroy();
this.wishArmatureNode.characterNode = null;
}
if (!this.wishArmatureNode.characterNode) {
var a = r.getCharacterNode(e.classId);
a.parent = this.wishArmatureNode;
this.wishArmatureNode.characterNode = a;
}
r.setSpriteFrame(this.wishGroupSp, p["misc_role_big_group_" + e.group + "_png"], !0, !0);
this.wishNameLabel.string = e.name;
this.wishTitleLabel.string = e.title;
this.wishPositionLabel.string = e.positionDesc;
this.wishSpIntroLabel.string = e.spInrto;
this.wishIntroLabel.string = e.inrto;
this.wishPanel.roleItemNodeMap = this.wishPanel.roleItemNodeMap || {};
r.preHideNodeMap(this.wishPanel.roleItemNodeMap);
for (var t in e.roleItems) {
var n = this.wishPanel.roleItemNodeMap[t];
if (!n) {
(n = cc.instantiate(this.wishRoleItemNode)).parent = this.wishRoleItemNodesLayout;
n.idx = t;
this.wishPanel.roleItemNodeMap[t] = n;
}
n.active = !0;
r.markHideNode(n);
var i = e.roleItems[t];
n.data = i;
n.getChildByName("role_item").getComponent("roleItem").update_(i);
n.getChildByName("select_sp").active = i._data.classId == e.classId;
}
r.hideNodeMap(this.wishPanel.roleItemMap);
for (t = 0; t < 4; t++) {
var s = this.wishSkillLayout.getChildByName("skill_item_" + (t + 1)).getComponent("skillItem");
s.update_(e.skillItems[t], this.skillInfoPanel);
r.setGray(s.skillSp.node, !0);
}
},
onCloseWish_: function() {
r.removePanel(this.wishPanel);
},
onWishSelect_: function(e) {
var a = e.target.data, t = this;
r.addLoading();
h.selectWishClassId(a._data.classId, function() {
t.onWish_();
});
},
onSwitchAdvancedPool_: function() {
r.addPanel(this.switchAdvancedPoolPanel);
this.switchTeamItem.active = !1;
this.switchTeamItemsNode.active = !1;
var e = v.genSwitchAdvancedPoolPanelData();
this.switchAdvancedPoolPanel.teamItemsNodeMap = this.switchAdvancedPoolPanel.teamItemsNodeMap || {};
r.preHideNodeMap(this.switchAdvancedPoolPanel.teamItemsNodeMap);
for (var a in e.roleItemsMap) {
var t = this.switchAdvancedPoolPanel.teamItemsNodeMap[a];
if (!t) {
(t = cc.instantiate(this.switchTeamItemsNode)).parent = this.switchTeamItemsNodesLayout;
t.idx = a;
this.switchAdvancedPoolPanel.teamItemsNodeMap[a] = t;
}
t.active = !0;
r.markHideNode(t);
t.data = {
idx: Number(a)
};
var n = t.getChildByName("select_node");
n.zIndex = 2;
n.getChildByName("sp").active = e.selectAdvancedIdx == a;
t.teamItemMap = t.teamItemMap || {};
r.preHideNodeMap(t.teamItemMap);
for (var i = 0; i < e.roleItemsMap[a].length; i++) {
var s = t.teamItemMap[i];
if (!s) {
(s = cc.instantiate(this.switchTeamItem)).parent = t;
s.idx = i;
t.teamItemMap[i] = s;
}
s.active = !0;
r.markHideNode(s);
var o = e.roleItemsMap[a][i];
s.getChildByName("role_item").getComponent("roleItem").update_(o);
s.getChildByName("name_label").getComponent(cc.Label).string = o._data.kindName;
}
t.getComponent(cc.Layout).updateLayout();
t.getComponent("i18nComponent").start();
r.hideNodeMap(t.teamItemMap);
}
r.hideNodeMap(this.switchAdvancedPoolPanel.teamItemsNodeMap);
},
onCloseSwitchAdvancedPool_: function() {
r.removePanel(this.switchAdvancedPoolPanel);
},
onSwitchAdvancedPoolSelect_: function(e) {
var a = e.target.data, t = b.SWITCH_ADVANCED_POOL_COST_GEM, n = this;
r.addMessageBox(u.t("是否花费$1钻石切换战士卡池?", [ t ]), function() {
r.addLoading();
h.switchAdvancedPool(a.idx, function() {
n.onSwitchAdvancedPool_();
});
});
},
onSkip_: function() {
this.skipMove = !this.skipMove;
this.skipBt.getChildByName("select_sp").active = this.skipMove;
}
})), S = function(e) {
var a = e.advancedSpecialInfo.maxLuckMap[e.advancedLuckClassId], t = e.advancedLuck / a;
return t > 1 ? 1 : t;
};
v.genData = function() {
var e = c.player, a = e.point, i = e.extra.openDays, r = e.bag.getItemCount(b.NORMAL_COST_ENTITY_ID), o = e.bag.getItemCount(b.ADVANCED_COST_ENTITY_ID), l = null, d = null, h = null, m = "", g = a.advancedSpecialInfo, p = null, _ = null;
if (g) {
i <= 7 && n.newServerHideAdvancedLuckClassIds && (a.advancedSpecialInfo.classIds = t.difference(a.advancedSpecialInfo.classIds, n.newServerHideAdvancedLuckClassIds));
for (var k in a.advancedSpecialInfo.classIds) if (5 == (y = s.role.findOneBy("classId", a.advancedSpecialInfo.classIds[k])).group) {
p = y.kindName;
_ = y.classId;
}
l = a.advancedLuck;
d = g.maxLuckMap[a.advancedLuckClassId];
h = g.endTime;
var f = s.findSoulByClassId(a.advancedLuckClassId).roleId, y = s.findEntityById(f), v = a.advancedSpecialInfo.baseRateMap[a.advancedLuckClassId] * (1 + S(a) * a.advancedSpecialInfo.maxRateIncRatio), T = (m = u.t("许愿值越大，获得$1的概率越高，当前概率:$2%", [ "$1", (200 * v).toFixed(2) ])).split("$1"), M = "<outline color=black width=2>";
for (k = 0; k < T.length; k++) {
M += "<color=#FFFFFF >$</c>".replace("$", T[k]);
0 == k && (M += "<color=#FFDE02 >$</c>".replace("$", y.kindName));
}
m = M;
}
return {
normalTicketCount: r,
advancedTicketCount: o,
curLuck: l,
maxLuck: d,
luckEndTime: h,
luckHintStr: m,
advancedSpecialInfo: g,
luckSpRoleName: p,
luckSpRoleClassId: _,
_point: a
};
};
v.genPointEffectData = function(e, a, n) {
var i = [], r = {};
for (var o in a) {
var c, d = s.role.findById(a[o].entityId);
if (n[a[o].entityId] && !r[a[o].entityId]) {
var h = n[a[o].entityId].star;
c = k.genData({
kindId: a[o].entityId,
star: h
});
r[a[o].entityId] = !0;
} else if (d) {
var u = s.findSoulByClassId(d.classId), m = l.ROLE.FUNS.getEquivalentSoulNumber(a[o].extra.star) * a[o].count;
(c = _.genData({
kindId: u.kindId,
count: m
}, !0)).role = {
kindId: d.kindId,
star: a[o].extra.star,
soulCount: m
};
} else c = _.genData({
kindId: a[o].entityId,
count: a[o].count,
extra: a[o].extra
}, !0);
i.push(c);
}
return {
type: e,
entityItems: i = t.shuffle(i),
roleMap: n
};
};
v.genWishPanelData = function() {
var e = c.player.point, a = s.findSoulByClassId(e.advancedLuckClassId).roleId, t = s.findEntityById(a), n = {
1: u.t("前排战士"),
2: u.t("中排战士"),
3: u.t("后排战士")
}[t.positionType], i = [];
for (var r in t.skillIds) {
var o = f.genData(t.skillIds[r]);
i.push(o);
}
var l = [];
for (var r in e.advancedSpecialInfo.classIds) {
a = s.findSoulByClassId(e.advancedSpecialInfo.classIds[r]).roleId;
var d = k.genData({
kindId: a,
star: 3
});
l.push(d);
}
return {
classId: e.advancedLuckClassId,
group: t.group,
name: t.kindName,
title: t.title,
positionDesc: n,
inrto: t.desc,
spInrto: t.spDesc,
skillItems: i,
roleItems: l
};
};
v.genSwitchAdvancedPoolPanelData = function() {
var e = c.player.point, a = [];
if (e.advancedSpecialInfo) for (var t in e.advancedSpecialInfo.classIds) {
var n = s.findSoulByClassId(e.advancedSpecialInfo.classIds[t]).roleId, i = k.genData({
kindId: n,
star: 3
});
a.push(i);
}
var r = {};
for (var t in b.ADVANCED_CLASS_IDS) {
var o = s.findDropByClassId(b.ADVANCED_CLASS_IDS[t])[1][2].refClassId, l = s.findDropByClassId(o)[1];
for (var d in l) {
i = k.genData({
kindId: l[d].entityId,
star: 3
});
r[t] = r[t] || m.clone(a);
r[t].push(i);
}
}
return {
selectAdvancedIdx: e.selectAdvancedIdx,
roleItemsMap: r
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
canUseRolesPanel: "canUseRolesPanel",
clientConfig: "clientConfig",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
http: "http",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
pointHandler: "pointHandler",
resource: "resource",
roleItem: "roleItem",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
skillInfoPanel: "skillInfoPanel",
skillItem: "skillItem",
soundApi: "soundApi",
underscore: "underscore"
} ],
