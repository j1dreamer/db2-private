activityPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "620d7S9jCBJTK+ZpZlN31F9", "activityPanel");
var t = e("underscore"), n = e("underscore.string"), i = e("moment"), r = e("soundApi"), s = e("dataApi"), o = e("resource"), l = e("i18n"), c = e("player"), d = e("helper"), h = e("baseView"), u = (e("clientConfig"), 
e("serverConfig")), m = e("serverMain"), g = e("roleItem"), p = e("itemItem"), _ = e("topUpPanel"), k = e("rulePanel"), f = e("rankPanel"), y = e("playerItem"), b = e("rankHandler"), v = e("buildExt"), S = e("playerHandler"), T = u.ACTIVITY.CONSTS, M = u.ACTIVITY.FUNS, $ = cc.Class({
extends: cc.Component,
properties: {
left1BgSp: cc.Node,
left2BgSp: cc.Node,
left3BgSp: cc.Node,
left4BgSp: cc.Node,
left5BgSp: cc.Node,
left6BgSp: cc.Node,
btScrollview: cc.Node,
btItemsLayout: cc.Node,
btItem: cc.Node,
btItemBottomSpriteFrames: [ cc.SpriteFrame ],
leftBt: cc.Node,
rightBt: cc.Node,
right1BgSp: cc.Node,
right2BgSp: cc.Node,
right3BgSp: cc.Node,
right4BgSp: cc.Node,
cardBgSp: cc.Node,
cardItem: cc.Node,
cardTopBgSpriteFrames: [ cc.SpriteFrame ],
cardBottomBgSpriteFrames: [ cc.SpriteFrame ],
signInBgSp: cc.Node,
signInScrollview: cc.Node,
signInDaysLabel: cc.Label,
signInItemsLayout: cc.Node,
signInItem: cc.Node,
signInBt: cc.Node,
signedLabel: cc.Node,
signInItemBgSpriteFrames: [ cc.SpriteFrame ],
signInBottomDaysLabel: cc.Label,
signInBottomItem: cc.Node,
buffBgSp: cc.Node,
buffTitleSp: cc.Sprite,
buffDescLabel: cc.Label,
buffTimeTypeLabel: cc.Label,
buffTimeLabel: cc.Label,
buffBgSpriteFrames: [ cc.SpriteFrame ],
buffTitleSpriteFrames: [ cc.SpriteFrame ],
vipBgSp: cc.Node,
exchangeBgSp: cc.Node,
exchangeTimeLabel: cc.Label,
exchangeMoneyLabel: cc.Label,
exchangeRuleLayout: cc.Node,
exchangeRuleTextLabel: cc.Node,
exchangeItemItemsLayout: cc.Node,
exchangeItemItem: cc.Node
},
onLoad: function() {
this.btItem.active = !1;
this.signInItem.active = !1;
this.selectBt = null;
this.timeTypeLabel = null;
this.timeLabel = null;
$.isMark = !1;
},
update_: function(e, a) {
this.leftBt.active = !1;
this.rightBt.active = !1;
this.right1BgSp.active = !1;
this.right2BgSp.active = !1;
this.right3BgSp.active = !1;
this.right4BgSp.active = !1;
this.signInBgSp.active = !1;
this.left1BgSp.active = !1;
this.left2BgSp.active = !1;
this.left3BgSp.active = !1;
this.left4BgSp.active = !1;
this.left5BgSp.active = !1;
this.left6BgSp.active = !1;
this.cardBgSp.active = !1;
this.cardItem.active = !1;
this.buffBgSp.active = !1;
this.vipBgSp.active = !1;
this.exchangeBgSp.active = !1;
var n = $.genData(e, a);
this.data = n;
this.btItemMap = this.btItemMap || {};
h.preHideNodeMap(this.btItemMap);
for (var i in n.activitys) {
var r = this.btItemMap[i];
if (!r) {
(r = cc.instantiate(this.btItem)).parent = this.btItemsLayout;
r.idx = Number(i);
this.btItemMap[i] = r;
}
r.active = !0;
h.markHideNode(r);
var s = n.activitys[i];
r.data = s;
h.setMark(r, n.isMarkMap[s.name], {
x: 74,
y: 47
});
r.getChildByName("icon_sp").getComponent(cc.Sprite);
r.getChildByName("light_sp").active = !1;
var c = r.getChildByName("icon_sp").getComponent(cc.Sprite);
h.setSpriteFrame(c, o["activity_" + s.resId + "_png"]);
r.getChildByName("title_label").getComponent(cc.Label).string = l.t(s.desc);
n.selectActivityName != s.name && n.selectActivityName != s.name.split("_")[0] || (this.selectBt = r);
}
h.hideNodeMap(this.btItemMap);
var d = t.values(this.btItemMap)[0];
this.selectBt ? this.onSelectActivity_({
target: this.selectBt
}) : d && this.scheduleOnce(function() {
this.onSelectActivity_({
target: d
});
}, .2);
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
onClose_: function() {
this.unschedule(this.tick_);
this.selectBt = null;
t.each(this.btItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
var e = this.btScrollview.getComponent(cc.ScrollView);
e.stopAutoScroll();
e.scrollToTop(0);
h.removePanel(this.node);
m.player.emit(c.EVENT.ATTRS, []);
},
onSelectActivity_: function(e) {
var a = e.target, r = a.data, c = a == this.selectBt;
this.selectBt = a;
this.leftBt.active = 0 != a.idx;
this.rightBt.active = a.idx != t.keys(this.btItemMap).length - 1;
var _ = this;
t.each(this.btItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
e.getChildByName("light_sp").active = !1;
e.getChildByName("bottom_sp").getComponent(cc.Sprite).spriteFrame = _.btItemBottomSpriteFrames[0];
});
a.getComponent(cc.Button).interactable = !1;
a.getChildByName("bottom_sp").getComponent(cc.Sprite).spriteFrame = this.btItemBottomSpriteFrames[1];
a.getChildByName("light_sp").active = !0;
var k = t.indexOf(this.btItemsLayout.children, a) - 0, f = (k = k < 5 ? 0 : k) / (this.btItemsLayout.children.length - 1);
this.btScrollview.getComponent(cc.ScrollView).scrollToPercentHorizontal(f, .5);
this.left1BgSp.active = !1;
this.left2BgSp.active = !1;
this.left3BgSp.active = !1;
this.left4BgSp.active = !1;
this.left5BgSp.active = !1;
this.left6BgSp.active = !1;
this.cardBgSp.active = !1;
this.right1BgSp.active = !1;
this.right2BgSp.active = !1;
this.right3BgSp.active = !1;
this.right4BgSp.active = !1;
this.signInBgSp.active = !1;
this.buffBgSp.active = !1;
this.vipBgSp.active = !1;
this.exchangeBgSp.active = !1;
var y = this.left2BgSp.getChildByName("gem_level_bg_sp"), v = this.left2BgSp.getChildByName("gem_level_free_bg_sp");
y.active = !1;
v.active = !1;
var I = r.name.split("_")[0];
if (n.include(I, "buyCard")) {
this.cardBgSp.active = !0;
this.cardItemMap = this.cardItemMap || {};
h.preHideNodeMap(this.cardItemMap);
for (var C = 0; C < 2; C++) {
var P = this.cardItemMap[C];
if (!P) {
(P = cc.instantiate(this.cardItem)).parent = this.cardBgSp;
P.idx = C;
this.cardItemMap[C] = P;
}
P.active = !0;
h.markHideNode(P);
var D = r.goodsList[C];
(ta = P.getChildByName("top_bg_sp")).getComponent(cc.Sprite).spriteFrame = this.cardTopBgSpriteFrames[r.bgResIdxs[C]];
var N = ta.getChildByName("buy_get_label").getComponent(cc.Label);
d.replaceLabel(N, [ D.gem, D.gem ]);
var A = ta.getChildByName("total_gem_layout").getChildByName("value_label").getComponent(cc.Label), L = D.dailyGem * r.cardTotalDayCounts[C] + D.gem;
d.replaceLabel(A, [ L ]);
var E = ta.getChildByName("daily_get_label").getComponent(cc.Label);
d.replaceLabel(E, [ r.cardTotalDayCounts[C], D.dailyGem ]);
var B = ta.getChildByName("price_label").getComponent(cc.Label), w = l.t(D.show, [ D.price ]);
B.string = w;
var G = P.getChildByName("bottom_bg_sp"), R = G.getChildByName("buy_bt").getComponentInChildren(cc.Label);
G.getComponent(cc.Sprite).spriteFrame = this.cardBottomBgSpriteFrames[r.bgResIdxs[C]];
h.getBtDiscountNode(R);
var H = G.getChildByName("first_get_node"), x = r.rewards[r.rewardIdxs[C]];
H.active = !!x && x.status != T.STATUS.COMPLETE;
var K = G.getChildByName("receive_bt");
K.active = !!x && x.status == T.STATUS.CAN_RECEIVE;
K.active && (K.data = {
activityName: r.activityName,
rewardIdx: r.rewardIdxs[C]
});
var F = G.getChildByName("buy_bt");
F.active = !K.active;
F.data = {
id: D.id,
price: D.price,
priceRate: D.priceRate || 1,
name: l.t(D.name, [ D.gem || D.price ]),
gem: D.gem
};
if (H.active) {
var V = H.getChildByName("items_layout"), O = H.itemItem || V.getChildByName("item_item");
H.itemItem = O;
O.active = !1;
H.itemItemMap = H.itemItemMap || {};
h.preHideNodeMap(H.itemItemMap);
for (var U in x.dropList) {
if (!(ie = H.itemItemMap[U])) {
(ie = cc.instantiate(O)).parent = V;
ie.idx = U;
H.itemItemMap[U] = ie;
}
ie.scale = 1;
ie.active = !0;
h.markHideNode(ie);
var W = x.dropList[U], Y = p.genData({
kindId: W.entityId,
count: W.count,
extra: W.extra
}, !0);
ie.getComponent("itemItem").update_(Y);
ie.getComponent("itemItem").setShowPanel_(!0);
h.addItemEffect(W, ie);
}
h.hideNodeMap(H.itemItemMap);
var j = H.getChildByName("time_label").getComponent(cc.Label);
d.replaceLabel(j, [ i(m.tTime(r.end_time)).from(Date._now()) ]);
}
var q = G.getChildByName("days_label"), X = u.CONSTS.A_DAY, z = r.cardExpires[C] ? Math.floor((new Date(r.cardExpires[C]) - new Date(Date._now())) / X) : 0;
q.active = z > 0 && !H.active;
q.active && d.replaceLabel(q.getComponent(cc.Label), [ z ]);
var J = G.getChildByName("daily_get_layout"), Z = J.getChildByName("value_label");
J.active = q.active;
d.replaceLabel(Z.getComponent(cc.Label), [ D.dailyGem ]);
}
h.hideNodeMap(this.cardItemMap);
} else if ("signIn" == I) {
this.signInBgSp.active = !0;
c ? this.signInScrollview.active = !0 : d.scrollviewFadeIn(this.signInScrollview);
this.signInBgSp.signItemMap = this.signInBgSp.signItemMap || {};
h.preHideNodeMap(this.signItemMap);
var Q;
for (var C in r.signItems) {
var ee = this.signInBgSp.signItemMap[C];
if (!ee) {
(ee = cc.instantiate(this.signInItem)).parent = this.signInItemsLayout;
ee.idx = C;
this.signInBgSp.signItemMap[C] = ee;
}
ee.active = !0;
h.markHideNode(ee);
ee.zIndex = 0;
var ae = r.signItems[C], te = ae.signInDays == r.signInToDays;
ee.getComponent(cc.Sprite).spriteFrame = this.signInItemBgSpriteFrames[te ? 1 : 0];
ee.opacity = ae.signInDays < r.signInDays + (r.isSignIn ? 0 : 1) ? 127.5 : 255;
ee.scale = te ? 1.05 : 1;
ee.y = te ? -120 : -140;
ee.getChildByName("today_sp").active = te;
te && (Q = ee);
var ne = ee.getChildByName("role_item_node"), ie = ee.getChildByName("item_item");
ne.active = !1;
ie.active = !1;
var re = this.signInBottomItem.getChildByName("role_item_node"), se = this.signInBottomItem.getChildByName("item_item");
W = ae.drop;
if ((Ra = s.findEntityById(W.entityId)).type == u.CONSTS.ENTITY_TYPE.ROLE) {
ne.active = !0;
var oe = g.genData({
kindId: W.entityId,
star: W.extra.star
});
ne.getChildByName("role_item").getComponent("roleItem").update_(oe);
h.addItemEffect(ae.isSignIn || te ? null : W, ne);
if (te) {
se.active = !1;
re.active = !0;
re.getChildByName("role_item").getComponent("roleItem").update_(oe);
}
} else {
ie.active = !0;
ie.getComponent("itemItem").setShowPanel_(!0);
Y = p.genData({
kindId: W.entityId,
count: W.count,
extra: W.extra
}, !0);
ie.getComponent("itemItem").update_(Y);
h.addItemEffect(ae.isSignIn || te ? null : W, ie);
if (te) {
se.active = !0;
re.active = !1;
se.getComponent("itemItem").update_(Y);
}
}
var le = ee.getChildByName("vip_sp");
le.active = -1 != ae.doubleVip;
if (le.active) {
var ce = le.getChildByName("value_label").getComponent(cc.Label);
d.replaceLabel(ce, [ ae.doubleVip ]);
}
var de = this.signInBottomItem.getChildByName("vip_sp");
de.active = le.active && te;
if (de.active) {
ce = this.signInBottomItem.getChildByName("vip_sp").getChildByName("value_label").getComponent(cc.Label);
d.replaceLabel(ce, [ ae.doubleVip ]);
}
var he = ee.getChildByName("days_label").getComponent(cc.Label);
d.replaceLabel(he, [ ae.signInDays ]);
(ca = ee.getChildByName("name_label").getComponent(cc.Label)).string = Ra.kindName;
}
h.hideNodeMap(this.signItemMap);
this.signInItemsLayout.getComponent(cc.Layout).updateLayout();
this.signInItemsLayout.getComponent(cc.Layout).type = cc.Layout.Type.NONE;
Q.zIndex = 1;
this.signInScrollview.getComponent(cc.ScrollView).scrollToOffset(cc.v2(Q.x - 1.5 * Q.width, 0));
this.signInScrollview.getComponent("listViewComponent").delayUpdate_(.2);
d.replaceLabel(this.signInDaysLabel, [ r.signInDays ]);
d.replaceLabel(this.signInBottomDaysLabel, [ r.signInToDays ]);
this.signInBt.active = !r.isSignIn;
this.signedLabel.active = r.isSignIn;
} else if ("exchange" == I) {
this.exchangeBgSp.active = !0;
this.exchangeRuleTextLabel.active = !1;
this.exchangeItemItem.active = !1;
var ue = m.player.bag.getItemCount(r.moneyId);
this.exchangeMoneyLabel.string = ue;
this.exchangeBgSp.ruleTextLabelMap = this.ruleTextLabelMap || {};
h.preHideNodeMap(this.exchangeBgSp.ruleTextLabelMap);
var me = $.EXCHANGE_RULE_LIST;
for (var C in me) {
var ge = this.exchangeBgSp.ruleTextLabelMap[C];
if (!ge) {
(ge = cc.instantiate(this.exchangeRuleTextLabel)).parent = this.exchangeRuleLayout;
this.exchangeBgSp.ruleTextLabelMap[C] = ge;
}
ge.active = !0;
h.markHideNode(ge);
ge.getComponent(cc.Label).string = l.t(me[C].text);
}
h.hideNodeMap(this.exchangeBgSp.ruleTextLabelMap);
var pe = r.list.slice(0, 6);
this.exchangeBgSp.itemItemMap = this.exchangeBgSp.itemItemMap || {};
h.preHideNodeMap(this.exchangeBgSp.itemItemMap);
for (var C in pe) {
if (!(ie = this.exchangeBgSp.itemItemMap[C])) {
(ie = cc.instantiate(this.exchangeItemItem)).parent = this.exchangeItemItemsLayout;
ie.idx = C;
this.exchangeBgSp.itemItemMap[C] = ie;
}
ie.active = !0;
h.markHideNode(ie);
D = pe[C], Y = p.genData({
kindId: D.entityId,
count: D.count,
extra: D.extra
}, !0);
ie.getComponent("itemItem").update_(Y);
ie.getComponent("itemItem").setShowPanel_(!0);
}
h.hideNodeMap(this.exchangeBgSp.itemItemMap);
} else if (t.include($.BUFF_ACTIVITY_NAMES, r.type)) {
var _e = t.indexOf($.BUFF_ACTIVITY_NAMES, r.type);
this.buffBgSp.active = !0;
this.buffTitleSp.spriteFrame = this.buffTitleSpriteFrames[_e];
this.buffBgSp.getComponent(cc.Sprite).spriteFrame = this.buffBgSpriteFrames[_e];
this.buffDescLabel.string = l.t(r.content);
} else {
var ke = null, fe = null;
switch (r.name) {
case "saveGemUpgradeLevel":
ke = this.left2BgSp;
fe = this.right1BgSp;
y.active = !0;
y.getChildByName("desc_1_layout").getChildByName("value_2_label").getComponent(cc.Label).string = r.desc1;
(Te = y.getChildByName("desc_2_layout")).getChildByName("value_1_label").getComponent(cc.Label).string = r.desc2;
Te.getChildByName("value_2_label").getComponent(cc.Label).string = r.desc3;
var ye = y.getChildByName("vip_label");
d.replaceLabel(ye.getComponent(cc.Label), [ m.player.vip.level ]);
var be = y.getChildByName("need_vip_label");
if (r.needVip) d.replaceLabel(be.getComponent(cc.Label), [ r.needVip ]); else if (r.needTopUpMoney) {
be.getComponent(cc.Label).string = l.t("累计充值$1元可购买", [ r.needTopUpMoney ]);
ye.getComponent(cc.Label).string = l.t("当前累计充值:$1元", [ m.player.vip.topUpMoney ]);
}
(Ya = y.getChildByName("buy_bt")).data = {
activityName: r.name
};
ye.active = be.active = Ya.active = !r.isSaveGem;
y.getChildByName("have_buy_label").active = r.isSaveGem;
break;

case "saveGemUpgradeLevelFree":
ke = this.left2BgSp;
fe = this.right1BgSp;
v.active = !0;
ye = v.getChildByName("vip_label");
d.replaceLabel(ye.getComponent(cc.Label), [ m.player.vip.level ]);
v.getChildByName("buy_cout_label").getComponent(cc.Label).string = r.reachMap[r.match + "Count"];
var ve = t.findWhere(this.data.activitys, {
name: r.match
}), Se = v.getChildByName("go_buy_bt");
Se.active = !!ve && !ve.isSaveGem;
Se.data = {
activity: ve
};
ye.active = Se.active;
ve && ve.needTopUpMoney && (ye.getComponent(cc.Label).string = l.t("当前累计充值:$1元", [ m.player.vip.topUpMoney ]));
if (!c) {
_ = this;
S.updateFreeActivity(r.name, function() {
_.update_();
});
}
break;

case "task_active":
case "task_active2":
ke = this.left5BgSp;
fe = this.right4BgSp;
ke.getChildByName("desc_1_layout").getChildByName("value_2_label").getComponent(cc.Label).string = r.reachMap.taskActivePoint;
var Te, Me = (Te = ke.getChildByName("desc_2_layout")).getChildByName("value_2_label").getComponent(cc.Label), $e = Math.floor((r.end_time - Date.now()) / u.CONSTS.A_DAY);
d.replaceLabel(Me, [ $e ]);
var Ie = ke.getChildByName("advanced_sp"), Ce = r.advanced.reachMap.buyGoodsId_604_times > 0;
h.setGray(Ie, Ce);
fe.active = !0;
var Pe, De = (Pe = fe.getChildByName("activity_scrollview")).getChildByName("view").getChildByName("sp_content_layout"), Ne = De.getChildByName("items_layout"), Ae = Pe.activityItem || Ne.getChildByName("activity_item");
Pe.activityItem = Ae;
Ae.active = !1;
var Le = r.reachMap.taskActivePoint, Ee = t.last(r.rewards).needMap.taskActivePoint, Be = De.getChildByName("star_bar");
Be.getComponent(cc.ProgressBar).progress = Le / Ee;
var we = Be.pointSp || Be.getChildByName("point_sp");
Be.pointSp = we;
we.active = !1;
fe.activityItemMap = fe.activityItemMap || {};
fe.pointSpMap = fe.pointSpMap || {};
h.preHideNodeMap(fe.activityItemMap);
h.preHideNodeMap(fe.pointSpMap);
var Ge = 0;
for (var C in r.rewards) {
if (!(Ca = fe.activityItemMap[C])) {
(Ca = cc.instantiate(Ae)).parent = Ne;
Ca.idx = C;
fe.activityItemMap[C] = Ca;
}
Ca.zIndex = Number(C);
Ca.active = !0;
h.markHideNode(Ca);
var Re = {
reward: r.rewards[C],
advancedReward: r.advanced.rewards[C]
};
Ca.data = Re;
if (Da = Ca.getChildByName("receive_bt")) {
Da.data = {
activityName: r.name,
rewardIdx: C
};
Da.active = Re.reward.status == T.STATUS.CAN_RECEIVE;
if (Re.advancedReward.status == T.STATUS.CAN_RECEIVE) {
Da.data.activityNames = [ r.name, r.advanced.name ];
Da.data.rewardIdxs = [ C, C ];
}
}
var He = Ca.getChildByName("continue_receive_bt");
if (He) {
He.data = {
activityName: r.advanced.name,
rewardIdx: C
};
Ce || (He.data.needBuy = !0);
He.active = Re.reward.status == T.STATUS.COMPLETE && Re.advancedReward.status != T.STATUS.COMPLETE;
}
0 == Ge && (Da.active || He.active) && (Ge = 55.5 + 113 * Number(C));
(La = Ca.getChildByName("un_complete_sp")).active = Re.reward.status == T.STATUS.UN_COMPLETE;
var xe = [];
xe.push(Ca.getChildByName("left_reward_layout").getChildByName("item_item"));
xe = xe.concat(Ca.getChildByName("right_reward_layout").children);
var Ke = Re.reward.dropList.concat(Re.advancedReward.dropList);
for (var U in Ke) {
W = Ke[U];
(ie = xe[U]).active = !0;
ie.getComponent("itemItem").setShowPanel_(!0);
Y = p.genData({
kindId: W.entityId,
count: W.count,
extra: W.extra
}, !0);
ie.getComponent("itemItem").update_(Y);
h.addItemEffect(W, ie);
}
var Fe = fe.pointSpMap[C];
if (!Fe) {
(Fe = cc.instantiate(we)).parent = Be;
Fe.idx = C;
fe.pointSpMap[C] = Fe;
Fe.y = we.y - 113 * Number(C);
}
Fe.active = !0;
h.markHideNode(Fe);
Fe.getChildByName("bg_sp").getChildByName("value_label").getComponent(cc.Label).string = Re.reward.needMap.taskActivePoint;
var Ve = Ca.getChildByName("left_received_sp"), Oe = Ca.getChildByName("right_received_sp");
Ve.active = Re.reward.status == T.STATUS.COMPLETE;
Oe.active = Re.advancedReward.status == T.STATUS.COMPLETE;
xe[0].opacity = Ve.active ? 127.5 : 255;
xe[1].opacity = xe[2].opacity = Oe.active ? 76.5 : 255;
Ca.getChildByName("right_items_lock_sp").active = Re.advancedReward.status == T.STATUS.UN_COMPLETE;
}
h.hideNodeMap(fe.activityItemMap);
h.hideNodeMap(fe.pointSpMap);
ke.getChildByName("unlock_bt").active = !Ce;
var Ue = ke.getChildByName("fill_active_bt");
Ue.active = Ce && $e <= T.BUY_TASK_ACTIVE_NEED_RESET_DAYS && Le < Ee;
Ue.data = {
activityName: r.name,
curActive: Le,
maxActive: Ee
};
this.scheduleOnce(function() {
if (Ge) {
var e = Pe.getComponent(cc.ScrollView), a = Ge - 45;
e.scrollToOffset(cc.v2(0, a), .3);
}
}, .2);
break;

case "packActivity":
ke = this.left6BgSp;
fe = this.right3BgSp;
var We = (Qe = ke.getChildByName("time").getChildByName("layout")).getChildByName("name_label").getComponent(cc.Label), Ye = Qe.getChildByName("value_label").getComponent(cc.Label);
this.timeTypeLabel = We;
this.timeLabel = Ye;
var je = ke.getChildByName("activity_bt_scrollview"), qe = je.getChildByName("view").getChildByName("content_layout"), Xe = je.btItem || qe.getChildByName("bt_item");
je.btItem = Xe;
Xe.active = !1;
r.selectActivityName = this.selectPackActivityItemName || r.selectActivityName;
ke.btItemMap = ke.btItemMap || {};
h.preHideNodeMap(ke.btItemMap);
for (var C in r.activityItems) {
var ze = ke.btItemMap[C];
if (!ze) {
(ze = cc.instantiate(Xe)).parent = qe;
ke.btItemMap[C] = ze;
}
ze.active = !0;
h.markHideNode(ze);
ze.data = r.activityItems[C];
ze.getComponentInChildren(cc.Label).string = l.t(ze.data.desc);
var Je = ze.data.name == r.selectActivityName;
ze.getComponent(cc.Button).interactable = !Je;
if (Je) {
r.itemResId = ze.data.itemResId;
r.rewards = ze.data.rewards;
}
var Ze = !!t.findWhere(ze.data.rewards, {
status: T.STATUS.CAN_RECEIVE
});
h.setMark(ze, Ze);
}
h.hideNodeMap(ke.btItemMap);
break;

default:
var Qe = null, ea = null, aa = null;
if (n.include(I, "Rank")) {
ke = this.left3BgSp;
var ta;
Qe = (ta = (fe = this.right2BgSp).getChildByName("activity_scrollview").getChildByName("view").getChildByName("content_layout").getChildByName("top_bg_sp")).getChildByName("time_layout");
ea = ta.getChildByName("desc_layout");
aa = ta.getChildByName("reach_layout");
} else if ("upgradeVip" == I) Qe = (fe = this.vipBgSp).getChildByName("time_layout"); else if (r.rewards[0].buyMaxTimes) {
if (t.include([ 1, 2, 3, 9, 10, 12, 13, 14, 15, 16 ], r.leftResId)) {
Qe = (ke = this.left1BgSp).getChildByName("time_layout");
ea = ke.getChildByName("desc_layout");
aa = ke.getChildByName("reach_layout");
} else ke = this.left4BgSp;
fe = this.right3BgSp;
Qe = ke.getChildByName("time_layout");
} else {
ke = this.left1BgSp;
fe = this.right1BgSp;
Qe = ke.getChildByName("time_layout");
ea = ke.getChildByName("desc_layout");
aa = ke.getChildByName("reach_layout");
}
ke == this.left1BgSp && (ke.getChildByName("top_up_node").active = !1);
We = Qe.getChildByName("name_label").getComponent(cc.Label), Ye = Qe.getChildByName("value_label").getComponent(cc.Label);
this.timeTypeLabel = We;
this.timeLabel = Ye;
ea && (ea.getChildByName("value_label").getComponent(cc.Label).string = l.t(r.content));
if (ke && aa) {
ke.active = !0;
var na = aa;
na.active = !1;
if (r.reachMap) {
var ia = T.NEED_KEY, ra = {};
ra[ia.TOP_UP_GEM] = l.t("当前已充值钻石");
ra[ia.TOP_UP_MONEY] = l.t("当前已充值金额");
ra[ia.COST_GEM] = l.t("当前已消耗钻石");
ra[ia.PLAYER_LEVEL] = l.t("当前等级");
ra[ia.TOTAL_POWER] = l.t("当前总战力");
ra[ia.INC_POWER] = l.t("当前提升战力");
ra[ia.POINT_TIMES] = l.t("当前招募次数");
ra[ia.TASK_ACTIVE_POINT] = l.t("当前活跃度");
ra.topUpDays = l.t("当前充值天数");
ra.pointTimes = l.t("当前招募次数");
ra.advancedPointTimes = l.t("当前招募次数");
ra.dialSvipTimes = l.t("当前抽奖次数");
var sa = null;
for (var oa in r.reachMap) if (ra[oa]) {
sa = oa;
break;
}
if (sa = r.showNeedKey || sa) {
na.active = !0;
var la = r.reachMap[sa];
"topUpDays" == sa && 0 == r.reachMap.topUpMoney && la--;
var ca = na.getChildByName("name_label").getComponent(cc.Label);
d.replaceLabel(ca, [ ra[sa] ]);
ca._forceUpdateRenderData(!0);
var da = na.getChildByName("value_label").getComponent(cc.Label);
da.string = la;
da._forceUpdateRenderData(!0);
}
}
ke.active = !1;
}
}
ke && (ke.active = !0);
fe.active = !0;
r.leftResId && h.setSpriteFrame(ke.getComponent(cc.Sprite), o["activity_left_bg_" + r.leftResId + "_png"]);
if (ke == this.left3BgSp) {
var ha = ke.getChildByName("rank_scrollview"), ua = ha.getChildByName("view").getChildByName("content_layout"), ma = ha.rankItem || ua.getChildByName("rank_item");
ha.rankItem = ma;
ma.active = !1;
var ga = this.data.rankData;
if (ga && c) {
ke.rankItemMap = ke.rankItemMap || {};
h.preHideNodeMap(ke.rankItemMap);
for (var C in ga.rankItems) {
var pa = ga.rankItems[C], _a = ke.rankItemMap[C];
if (!_a) {
(_a = cc.instantiate(ma)).parent = ua;
ke.rankItemMap[C] = _a;
}
_a.active = !0;
h.markHideNode(_a);
_a.data = {
defenderId: pa.playerId
};
var ka = _a.getChildByName("player_item_layout");
ka.getChildByName("player_item").getComponent("playerItem").update_(pa.playerItem);
(ca = ka.getChildByName("name_label").getComponent(cc.Label)).string = pa.playerName;
var fa = ka.getChildByName("level_label");
d.replaceLabel(fa.getComponent(cc.Label), [ pa.playerLevel ]);
ka.getChildByName("server_label").getComponent(cc.Label).string = l.t("$1区", [ pa.serverId ]);
_a.getChildByName("rank_num_label").getComponent(cc.Label).string = pa.rank;
var ya = _a.getChildByName("reach_layout");
ya.getChildByName("reach_name_label").getComponent(cc.Label).string = ga.reachDesc;
var ba = ya.getChildByName("reach_value_label").getComponent(cc.Label);
ya.getChildByName("reach_value_label").getComponent(cc.Label).string = pa.value;
ba.string = r.reachShow ? l.t(r.reachDesc, [ pa.value ]) : pa.value;
}
h.hideNodeMap(ke.rankItemMap);
aa.active = !0;
var va = aa.getChildByName("reach_name_label").getComponent(cc.Label), Sa = (ba = aa.getChildByName("reach_value_label").getComponent(cc.Label), 
aa.getChildByName("rank_value_label").getComponent(cc.Label));
va.string = ga.reachDesc;
ba.string = ga.myValue;
Sa.string = ga.myRank;
}
}
if (Ne = (Pe = fe.getChildByName("activity_scrollview")).getChildByName("view").getChildByName("content_layout")) {
var Ta = (Ae = Pe.activityItem || Ne.getChildByName("activity_item")).getChildByName("reward_layout"), Ma = Ta.getChildByName("role_item_node"), $a = Ta.getChildByName("item_item");
Pe.activityItem = Ae;
Ae.active = !1;
Ma.active = !1;
$a.active = !1;
fe.activityItemMap = fe.activityItemMap || {};
h.preHideNodeMap(fe.activityItemMap);
var Ia = 0;
for (var C in r.rewards) {
var Ca;
if (!(Ca = fe.activityItemMap[C])) {
(Ca = cc.instantiate(Ae)).parent = Ne;
Ca.idx = C;
fe.activityItemMap[C] = Ca;
}
Ca.zIndex = Number(C);
Ca.active = !0;
h.markHideNode(Ca);
r.itemResId && h.setSpriteFrame(Ca.getComponent(cc.Sprite), o["activity_item_bg_" + r.itemResId + "_png"], !1, !0);
Re = r.rewards[C];
Ca.data = Re;
Ca.opacity = Re.status == T.STATUS.COMPLETE ? 76.5 : 255;
Ca.zIndex = Re.status == T.STATUS.COMPLETE ? 100 : Ca.zIndex;
Re.status == T.STATUS.CAN_RECEIVE && (Ca.zIndex = Number(C) - 100);
var Pa = Ca.getChildByName("title_label").getComponent(cc.Label);
Pa.string = l.t(Re.desc);
Pa.node.active = !Re.buyMaxTimes || !!Re.buyMaxTimes && !Re.isHideBuyTimes;
var Da, Na = Ca.getChildByName("ext_label");
Na && (Na.getComponent(cc.Label).string = Re.extDesc || "");
if (fe == this.right3BgSp) {
Ia = -150;
var Aa = t.keys(Re.needMap)[0].split("_")[1];
D = Aa ? m.player.extra.goodsList[Aa] : null;
(ja = Ca.getChildByName("price_label").getComponent(cc.Label)).string = D ? l.t(D.show, [ D.price ]) : l.t("免费");
R = Ca.getChildByName("buy_bt").getComponentInChildren(cc.Label);
(Ya = Ca.getChildByName("buy_bt")).active = !1;
if (D) {
Ya.data = {
id: D.id,
price: D.price,
priceRate: D.priceRate || 1,
name: l.t(D.name, [ D.gem || D.price ]),
gem: D.gem,
activityName: r.selectActivityName || r.name,
isNoUsePoint: D.isNoUsePoint || !1
};
Ya.active = Re.status == T.STATUS.UN_COMPLETE;
D && h.getBtDiscountNode(R);
}
}
if (Da = Ca.getChildByName("receive_bt")) {
Da.data = {
activityName: r.selectActivityName || r.name,
rewardIdx: C
};
Da.active = Re.status == T.STATUS.CAN_RECEIVE;
}
var La, Ea = Ca.getChildByName("complete_sp");
Ea.active = Re.status == T.STATUS.COMPLETE;
(La = Ca.getChildByName("un_complete_sp")) && (La.active = Re.status == T.STATUS.UN_COMPLETE);
var Ba = Ca.getChildByName("reward_layout");
Ba.active = !r.isUnlockMore;
if (Ba.active) {
Ca.itemItemMap = Ca.itemItemMap || {};
h.preHideNodeMap(Ca.itemItemMap);
Ca.roleItemNodeMap = Ca.roleItemNodeMap || {};
h.preHideNodeMap(Ca.roleItemNodeMap);
var wa = 0, Ga = 0;
for (var U in r.rewards[C].dropList) {
var Ra;
W = r.rewards[C].dropList[U];
if ((Ra = s.findEntityById(W.entityId)).type == u.CONSTS.ENTITY_TYPE.ROLE) {
if (!(ne = Ca.roleItemNodeMap[wa])) {
(ne = cc.instantiate(Ma)).parent = Ba;
ne.idx = wa;
Ca.roleItemNodeMap[wa] = ne;
}
ne.active = !0;
h.markHideNode(ne);
oe = g.genData({
kindId: W.entityId,
star: W.extra.star
});
ne.getChildByName("role_item").getComponent("roleItem").update_(oe);
h.addItemEffect(W, ne);
wa++;
} else {
if (!(ie = Ca.itemItemMap[Ga])) {
(ie = cc.instantiate($a)).parent = Ba;
ie.idx = Ga;
Ca.itemItemMap[Ga] = ie;
}
ie.active = !0;
h.markHideNode(ie);
ie.getComponent("itemItem").setShowPanel_(!0);
Y = p.genData({
kindId: W.entityId,
count: W.count,
extra: W.extra
}, !0);
ie.getComponent("itemItem").update_(Y);
h.addItemEffect(W, ie);
Ga++;
}
}
h.hideNodeMap(Ca.itemItemMap);
h.hideNodeMap(Ca.roleItemNodeMap);
d.updateLayout(Ba);
var Ha = (Ca.width + Ia) / (Ba.width + 25);
Ha = Ha > .7 ? .7 : Ha;
Ba.scale = Ha;
}
var xa = Ca.getChildByName("reward_layout_2");
xa && (xa.active = r.isUnlockMore);
if (xa && xa.active) {
var Ka = [], Fa = t.keys(r.advancedRewards[0].needMap)[1], Va = (D = m.player.extra.goodsList[Fa.split("_")[1]], 
Ce = r.reachMap[Fa] > 0, W = r.rewards[C].dropList[0], xa.getChildByName("free_item"));
(ie = Va.getChildByName("item_item")).getComponent("itemItem").setShowPanel_(!0);
Y = p.genData({
kindId: W.entityId,
count: W.count,
extra: W.extra
}, !0);
ie.getComponent("itemItem").update_(Y);
h.addItemEffect(W, ie);
Va.getChildByName("receive_sp").active = r.rewards[C].status == T.STATUS.COMPLETE;
r.rewards[C].status == T.STATUS.CAN_RECEIVE && Ka.push(r.rewards[C].idx);
r.advancedRewards[C].status == T.STATUS.CAN_RECEIVE && Ka.push(r.advancedRewards[C].idx);
for (U = 0; U < 5; U++) {
var Oa = xa.getChildByName("more_item_" + (U + 1));
W = r.advancedRewards[C].dropList[U];
Oa.active = !!W;
if (Oa.active) {
(ie = Oa.getChildByName("item_item")).getComponent("itemItem").setShowPanel_(!0);
Y = p.genData({
kindId: W.entityId,
count: W.count,
extra: W.extra
}, !0);
ie.getComponent("itemItem").update_(Y);
h.addItemEffect(W, ie);
Oa.getChildByName("receive_sp").active = r.advancedRewards[C].status == T.STATUS.COMPLETE;
Oa.getChildByName("lock_sp").active = !Ce;
}
}
var Ua = [];
t.each(Ka, function() {
Ua.push(r.name);
});
Da.data = {
activityNames: Ua,
rewardIdxs: Ka
};
Da.active = Ka.length > 0;
Ca.opacity = 255;
Ca.zIndex = Number(C);
La.active = !1;
Ea.active = !1;
var Wa = ke.getChildByName("top_up_node");
Wa.active = !Ce;
if (Wa.active) {
var Ya, ja;
(ja = (Ya = Wa.getChildByName("buy_bt")).getChildByName("price_label").getComponent(cc.Label)).string = l.t(D.show, [ D.price ]);
h.getBtDiscountNode(ja);
Ya.data = {
id: D.id,
price: D.price,
priceRate: D.priceRate || 1,
name: l.t(D.name, [ D.gem || D.price ]),
gem: D.gem,
activityName: r.selectActivityName || r.name,
isNoUsePoint: D.isNoUsePoint || !1
};
}
}
}
h.hideNodeMap(fe.activityItemMap);
Ne.sortAllChildren();
}
if (!c) {
d.scrollviewFadeIn(Pe);
var qa = Pe.getComponent(cc.ScrollView);
qa.stopAutoScroll();
qa.scrollToTop(0);
}
Pe.getComponent("listViewComponent").delayUpdate_(.2);
if (!c || this.data.selectActivityName) {
_ = this;
this.scheduleOnce(function() {
switch (I) {
case "payRank":
b.serverTop("pay", 0, 9, function(e) {
var a = $.genRankData(e._temp.myRank, e._temp.myValue, e._temp.list, l.t("累计充值:"));
_.update_(null, a);
});
break;

case "payRankAllServer":
var e = M.getRankRegionName(r, m.player.serverId);
b.allServerTop(0, "pay" + (e || ""), 0, 9, function(e) {
var a = $.genRankData(e._temp.myRank, e._temp.myValue, e._temp.list, l.t("累计充值:"));
_.update_(null, a);
});
break;

case "costGemRankAllServer":
e = M.getRankRegionName(r, m.player.serverId);
b.allServerTop(0, "cost_gem" + (e || ""), 0, 9, function(e) {
var a = $.genRankData(e._temp.myRank, e._temp.myValue, e._temp.list, l.t("当前消费钻石:"));
_.update_(null, a);
});
break;

case "powerRank":
b.top50("totalPower", function(e) {
var a = $.genRankData(e._temp.myRank, e._temp.myValue, e._temp.list, l.t("当前总战力:"));
_.update_(null, a);
});
break;

case "pointRankAllServer":
e = M.getRankRegionName(r, m.player.serverId);
b.allServerTop(0, "advancedPoint" + (e || ""), 0, 9, function(e) {
var a = $.genRankData(e._temp.myRank, e._temp.myValue, e._temp.list, l.t("当前召唤次数:"));
_.update_(null, a);
});
break;

case "dialSvipRankAllServer":
e = M.getRankRegionName(r, m.player.serverId);
b.allServerTop(0, "dial_svip_times" + (e || ""), 0, 9, function(e) {
var a = $.genRankData(e._temp.myRank, e._temp.myValue, e._temp.list, l.t("当前抽奖次数:"));
_.update_(null, a);
});
}
}, .2);
}
}
this.tick_(0);
},
onActivityBtItem_: function(e, a) {
var n = e ? e.target.data : a, i = t.findWhere(this.data.activitys, {
name: "packActivity"
});
this.selectPackActivityItemName = n.name;
var r = this.btItemMap[t.indexOf(this.data.activitys, i)];
this.onSelectActivity_({
target: r
});
},
onSwitch_: function(e, a) {
var t = this.selectBt.idx + Number(a);
this.onSwitchToActivity_({
target: this.btItemMap[t]
});
},
onReceive_: function(e, a) {
var n = e ? e.target.data : a;
if (n.needBuy) this.onTaskActiveUnlock_(); else {
var i = this;
h.addLoading();
var r = n.activityNames ? n.activityNames : [ n.activityName ], s = n.rewardIdxs ? n.rewardIdxs : [ n.rewardIdx ];
S.receiveActivityAward(r, s, function(e) {
h.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var n in a) h.addPointRoleEffectNode(a[n]);
}
i.update_();
});
}
},
onSignIn_: function() {
var e = this;
h.addLoading();
S.signIn(!1, function(a) {
h.addRewardEffectPanel(a._temp.entityCountMap);
if (a.team) {
var n = t.values(a.team.roles);
for (var i in n) h.addPointRoleEffectNode(n[i]);
}
e.update_();
});
},
onBuy_: function(e, a) {
var t = e.target.data;
!t.activityName || u.ACTIVITY.FUNS.checkOpen(m.player.activity.map[t.activityName], m.player.serverId) ? _.prototype.onGoodsItem_(e, a) : h.addHintPanel(l.t("活动已结束"));
},
onSaveGem_: function(e) {
var a = e.target.data, t = this;
h.addLoading();
S.activitySaveGem(a.activityName, function() {
t.update_();
r.playEffect(o.sound_effect_recover_mp3);
});
},
onSwitchToActivity_: function(e) {
var a = e.target.data, n = this.btItemMap[t.indexOf(this.data.activitys, a.activity || a)];
this.onSelectActivity_({
target: n
});
},
onTaskActiveRule_: function() {
h.addRulePanel(k.TYPE.TASK_ACTIVE);
},
onTaskActiveUnlock_: function() {
e("homeScene").instance.taskActiveTopUpPanel.getComponent("taskActiveTopUpPanel").show_(this.selectBt.data.name, this.selectBt.data.advanced.name);
},
onTaskActiveBuyActive_: function(e) {
var a = e.target.data, t = M.getBuyReachValCostGem(a.maxActive - a.curActive, 2), n = l.t("是否花费$1钻石补足活跃度?", [ t ]), i = this;
h.addMessageBox(n, function() {
h.addLoading();
S.fillTaskActive(a.activityName, function() {
i.update_();
});
});
},
onExchange_: function() {
e("homeScene").instance.activityExchangePanel.getComponent("exchangePanel").show_();
},
onRankViewTeam_: f.prototype.onRankItem_,
tick_: function() {
if (this.selectBt) {
var e = null, a = null, t = 0;
if (this.buffBgSp.active) {
e = this.buffTimeTypeLabel;
a = this.buffTimeLabel;
} else if (this.exchangeBgSp.active) {
a = this.exchangeTimeLabel;
t = -u.CONSTS.A_DAY;
} else {
e = this.timeTypeLabel;
a = this.timeLabel;
}
var n, r = this.selectBt.data, s = r.start_time, o = r.end_time + t, c = l.t("结束时间:");
if (-1 == r.start_time) n = l.t("永久"); else if (m.tTime(s) < Date._now()) if (m.tTime(o) > Date._now()) {
var h = m.tTime(o) - Date._now();
h = h < 0 ? 0 : h;
var g = i.duration(h), p = Math.floor(g.asDays());
n = d.formatDuration(g.hours(), g.minutes(), g.seconds());
p > 0 && (n = l.t("$1天$2", [ p, n ]));
} else n = l.t("已结束"); else {
c = l.t("开启时间:");
n = i(m.tTime(o)).from(Date._now());
}
e && (e.string = c);
a && (a.string = n);
}
}
});
$.genData = function(a, i) {
a = a || null;
var r = m.player, o = r.signInDays, c = r.extra.goodsList, d = t.values(r.activity.map), h = r.activity.payRank, g = r.activity.payRankAllServer, p = r.activity.costGemRankAllServer, _ = r.activity.powerRank, k = r.activity.pointRankAllServer, f = r.activity.dialSvipRankAllServer, y = r.activity.exchange;
d = t.without(d, null);
h && d.push(h);
g && d.push(g);
p && d.push(p);
_ && d.push(_);
k && d.push(k);
f && d.push(f);
y && d.push(y);
t.each(d, function(e) {
if (e.rewards) {
t.each(e.rewards, function(a) {
a.dropList = a.dropListDesc ? u.DROP.FUNS.getDropListByDesc(a.dropListDesc) : a.dropList;
a.rdDropList = a.rdDropListDesc ? u.DROP.FUNS.getRandomDropListByDesc(a.rdDropListDesc) : a.rdDropList;
var n = a.buyMaxTimes;
if (a.buyMaxTimesBetween) {
n = u.FUNS.getValueByBetween(a.needVipBetween, a.buyMaxTimesBetween, r.vip.level);
a.buyMaxTimes = n;
}
if (n && !a.desc) {
var i = n - (a.buyTimes || 0);
a.desc = l.t("限购$1次", [ i ]);
0 == i && (a.status = T.STATUS.COMPLETE);
} else if (a.desc && !e.isTopUp) {
var s = [ (d = t.values(a.needMap)[0]) * (h = e.i18nValRatios ? e.i18nValRatios[0] : 1) ];
if (e.i18nValKeys) {
var o = e.i18nValAdd || 0;
s = [];
for (var c in e.i18nValKeys) {
var d = a.needMap[e.i18nValKeys[c]] + o, h = e.i18nValRatios ? e.i18nValRatios[c] : 1;
s.push(d * h);
}
}
a.desc = a.desci18n || l.t(a.desc, s);
a.desci18n = a.desc;
}
if (t.include([ "payRank", "payRankAllServer", "costGemRankAllServer", "powerRank", "pointRankAllServer", "dialSvipRankAllServer" ], e.name.split("_")[0])) {
a.rankBegin == a.rankEnd ? a.desc = l.t("第$1名", [ a.rankBegin ]) : a.desc = l.t("第$1-$2名", [ a.rankBegin, a.rankEnd ]);
if (a.limit > 0) {
var m = l.t(e.limitDesc, [ a.limit ]);
a.desc += m;
}
}
});
if (e.isUnlockMore) {
var a = [];
e._rewards = e._rewards || e.rewards;
e.rewards = t.clone(e._rewards);
for (var n in e.rewards) {
e.rewards[n].idx = n;
if (e.rewards[n].isAdvanced) {
a.push(e.rewards[n]);
e.rewards[n] = null;
}
}
e.advancedRewards = a;
e.rewards = t.without(e.rewards, null);
}
}
});
d = t.filter(d, function(e) {
return (!e.isSuccess || e.isKeepShow) && !n.include(e.name, "topUpMoneyNewRole") && !t.include([ "buyCard7day", "login8day", "triggerTopUp", "task_active", "task_active2", "task_active_advanced", "task_active_advanced2", "firstTopUp", "againTopUp", "againTopUp2", "endless_reward", "online_reward", "buyGoods_heiwukong", "returnGift2", "loginReward", "login_2", "acePack1", "acePack2", "daily_ticket" ], e.name) && !n.include(e.name, "carnival") && !n.include(e.name, "diyGiftPack") && !n.include(e.name, "dreamActivity") && !n.include(e.name, "scorePointStarSign") && 135 != e.resId && !e.spClassId && !e.isDiscount && !e.isBt;
});
var b = t.findWhere(d, {
name: "saveGemUpgradeLevel"
});
if (b) {
var S = 0;
t.each(b.rewards, function(e) {
var a = t.findWhere(e.dropList, {
entityId: u.CONSTS.ENTITY_ID.GEM
});
S += a ? a.count : 0;
});
b.desc1 = b.needSaveGem;
b.desc2 = l.t("$1倍返利", [ S / b.needSaveGem ]);
b.desc3 = S;
b.isSaveGem = b.reachMap.saveGemUpgradeLevelSaveGem == b.needSaveGem;
b.isSuccess && (d = t.without(d, b));
}
var M = $.BUY_CARD_NAMES_LIST;
if (!v.closeTopUpMsg) {
var I = r.activity.map.buyCard7day, C = [ l.t("超值礼包卡"), l.t("豪华礼包卡") ], P = [ 121, 122 ], D = [ 151, 152 ], N = [ [ 3, 0 ], [ 1, 2 ] ], A = (I ? I.rewards : null) || [], L = [ [ t.findWhere(c, {
isWeekCard: 1
}), t.findWhere(c, {
isMonthCard: 1
}) ], [ t.findWhere(c, {
isBigMonthCard: 1
}), t.findWhere(c, {
isYearCard: 1
}) ] ], E = [ [ 7, 30 ], [ 30, 365 ] ], B = [ [ r.weekCardExpire, r.monthCardExpire ], [ r.bigMonthCardExpire, r.yearCardExpire ] ], w = [ [ 0, 1 ], [ 2, 3 ] ], G = I ? I.start_time : -1, R = I ? I.end_time : -1;
for (var H in M) d.push({
name: "buyCard_" + H,
activityName: I ? I.name : null,
desc: C[H],
resId: P[H],
priority: I ? D[H] : 500,
buyCardNames: M[H],
rewardIdxs: N[H],
rewards: A,
goodsList: L[H],
cardTotalDayCounts: E[H],
cardExpires: B[H],
bgResIdxs: w[H],
start_time: G,
end_time: R
});
}
var x = !u.FUNS.isNextDay(m.tTime(r.signInTime)), K = {
name: "signIn",
desc: l.t("累计签到"),
resId: 125,
priority: x ? 401 : 1,
signItems: [],
isSignIn: x,
signInDays: o,
signInToDays: x ? o : o + 1,
start_time: -1
}, F = t.sortBy(t.values(s.signIn.all()), "signInDays"), V = o - 7;
for (H = V = V < 0 ? 0 : V; H < F.length; H++) {
var O = F[H], U = u.DROP.FUNS.getDropListByDesc(O.dropListDesc);
K.signItems.push({
drop: U[0],
isSignIn: o >= O.signInDays,
signInDays: O.signInDays,
doubleVip: O.doubleVip
});
if (20 == K.signItems.length) break;
}
d.push(K);
var W = r.activity.map.task_active || r.activity.map.task_active2, Y = r.activity.map.task_active_advanced || r.activity.map.task_active_advanced2;
if (W && Y) {
W.advanced = Y;
d.push(W);
}
var j = {}, q = t.where(t.values(r.activity.map), {
resId: 135
});
if (q.length > 0) {
var X = {
name: "packActivity",
desc: l.t("特惠商城"),
resId: 135,
priority: 100,
activityItems: q,
selectActivityName: q[0].name,
start_time: q[0].start_time,
end_time: q[0].end_time
};
X.activityItems = t.sortBy(X.activityItems, "priority");
d.push(X);
for (var H in X.activityItems) if (t.findWhere(X.activityItems[H].rewards, {
status: T.STATUS.CAN_RECEIVE
})) {
j[X.name] = !0;
break;
}
}
var z = e("homeScene").instance;
z && z.activityPanel.isPanel || ($.priorityMap = {});
var J = !1, Z = !1, Q = !1, ee = null, ae = null, te = !1, ne = !1;
for (var H in d) {
var ie = d[H];
ie._priority = ie._priority || ie.priority;
ie.priority = ie._priority;
if (ie.rewards) for (var re in ie.rewards) if (ie.rewards[re].status == T.STATUS.CAN_RECEIVE) {
if (ie.rewardIdxs && !t.include(ie.rewardIdxs, Number(re))) continue;
j[ie.name] = !0;
J = !0;
ie.priority = 1;
"topUpMoney" != ie.name.split("_")[0] || ie.btId || (Z = !0);
1 == ie.btId && (te = !0);
2 == ie.btId && (ne = !0);
}
if (ie.reward && ie.reward.status == T.STATUS.CAN_RECEIVE) {
j[ie.name] = !0;
ie.priority = 1;
}
"signIn" != ie.name || ie.isSignIn || (j[ie.name] = !0);
"topUpMoney" != ie.name.split("_")[0] || ie.btId || (Q = !0);
1 == ie.btId && (ee = ie.desc);
2 == ie.btId && (ae = ie.desc);
var se = $.priorityMap[ie.name];
ie.priority = se || ie.priority;
$.priorityMap[ie.name] = ie.priority;
}
return {
selectActivityName: a,
activitys: d = t.sortBy(d, "priority"),
isMarkMap: j,
isNeedMark: J = ($.isMark || J) && d.length > 0,
isHaveTopUpActivity: Q,
isMarkTopUpActivity: Z,
buyGoods1ActivityDesc: ee,
buyGoods2ActivityDesc: ae,
isMarkBuyGoods1Activity: te,
isMarkBuyGoods2Activity: ne,
rankData: i
};
};
$.genRankData = function(e, a, t, n) {
var i = [];
for (var r in t) {
t[r].value = t[r].value >= 1e5 ? Math.ceil(t[r].value / 1e3) + "K" : t[r].value;
var s = y.genData(t[r].playerPhotoInfo), o = {
serverId: t[r].serverId || 0,
playerId: t[r].playerId,
playerName: t[r].playerName,
playerLevel: t[r].playerLevel,
playerItem: s,
rank: t[r].rank,
value: t[r].value
};
i.push(o);
}
if (!a) {
e = 0;
a = 0;
}
return {
myRank: e,
myValue: a = a >= 1e5 ? Math.ceil(a / 1e3) + "K" : a,
rankItems: i,
reachDesc: n
};
};
$.priorityMap = {};
$.isMark = !0;
$.BUY_CARD_NAMES_LIST = [ [ "buyWeekCard", "buyMonthCard" ], [ "buyBigMonthCard", "buyYearCard" ] ];
$.BUFF_ACTIVITY_NAMES = [ "reduceActionPointRecoverTime", "normalItemCountDouble", "reduceSkillPointRecoverTime", "eliteItemCountDouble", "soulDropCountDouble", "expeditionCoinCountDouble", "expeditionMoneyCountDouble" ];
$.EXCHANGE_RULE_LIST = [ {
text: l.t("1.活动期间可以在每日活动宝箱获得活动道具.")
}, {
text: l.t("2.活动道具可在兑换页面中兑换超值奖励.")
}, {
text: l.t("3.活动结束后兑换功能延迟1天关闭，并无法获得活动道具.")
}, {
text: l.t("4.活动完全关闭后活动道具将消失，请及时使用.")
} ];
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerHandler: "playerHandler",
playerItem: "playerItem",
rankHandler: "rankHandler",
rankPanel: "rankPanel",
resource: "resource",
roleItem: "roleItem",
rulePanel: "rulePanel",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
