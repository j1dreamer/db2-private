dreamExtActivityPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "f78d37HR01JC4u2l6zNRCOb", "dreamExtActivityPanel");
var t = e("underscore"), n = (e("underscore.string"), e("moment")), i = (e("soundApi"), 
e("dataApi")), r = e("resource"), s = e("i18n"), o = e("helper"), l = e("baseView"), c = (e("buildExt"), 
e("player")), d = (e("clientConfig"), e("serverConfig")), h = e("serverMain"), u = e("roleItem"), m = e("itemItem"), g = e("topUpPanel"), p = e("rulePanel"), _ = e("roleScene"), k = e("playerHandler"), f = d.ACTIVITY.CONSTS, y = cc.Class({
extends: cc.Component,
properties: {
bgSp: cc.Sprite,
btScrollview: cc.Node,
btItemsLayout: cc.Node,
btItem: cc.Node,
topUpNode: cc.Node,
roleSpine: cc.Node,
roleSp: cc.Node,
mainNode: cc.Node,
mainTimeNode: cc.Node,
activityScrollview: cc.Node,
activityItemsLayout: cc.Node,
buyGoodsItem: cc.Node,
normalItem: cc.Node,
unlockItem: cc.Node,
activityReachNode: cc.Node,
activityRewardItemItem: cc.Node,
activityRewardRoleItem: cc.Node,
buyDescLabel: cc.Node,
buyBt: cc.Node,
fillActiveBt: cc.Node,
activeBoxsNode: cc.Node,
exchangeNode: cc.Node,
exchangeItemsContent: cc.Node,
exchangeItem: cc.Node,
exchangeMoneyLabel: cc.Label,
buyConfirmPanel: cc.Node
},
onLoad: function() {
this.btItem.active = !1;
this.buyGoodsItem.active = !1;
this.normalItem.active = !1;
this.unlockItem.active = !1;
this.activityRewardItemItem.active = !1;
this.activityRewardRoleItem.active = !1;
this.activityReachNode.active = !1;
this.buyBt.active = !1;
this.exchangeItem.active = !1;
this.buyConfirmPanel.active = !1;
this.mainNode.getComponent(cc.Widget).right = cc.winSize.width > 1200 ? 100 : 0;
this.selectBt = null;
y.isMark = !1;
},
update_: function(e) {
var a = y.genData(e);
this.data = a;
this.btItemMap = this.btItemMap || {};
l.preHideNodeMap(this.btItemMap);
for (var n in a.activitys) {
var i = this.btItemMap[n];
if (!i) {
(i = cc.instantiate(this.btItem)).parent = this.btItemsLayout;
i.idx = n;
this.btItemMap[n] = i;
}
i.active = !0;
l.markHideNode(i);
var r = a.activitys[n];
i.data = r;
l.setMark(i, a.isMarkMap[r.name]);
var o = i.getChildByName("title_label").getComponent(cc.Label);
i.getChildByName("select_label").getComponent(cc.Label).string = s.t(r.desc);
o.string = s.t(r.desc);
a.selectActivityName == r.name && (this.selectBt = i);
}
l.hideNodeMap(this.btItemMap);
var c = t.values(this.btItemMap)[0];
this.selectBt ? this.onSelectActivity_({
target: this.selectBt
}) : c && this.onSelectActivity_({
target: c
});
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
tick_: function() {
if (this.timeNode) {
var e = this.selectBt.data.end_time, a = this.timeNode.getComponentInChildren(cc.RichText);
if (-1 != e) if (e < Date.now()) o.replaceLabel(a, [ "", s.t("活动已结束") ]); else {
var t = n.duration(e - Date.now()), i = Math.floor(t.asDays()), r = o.formatDuration(t.hours(), t.minutes(), t.seconds());
i > 0 && (r = s.t("$1天$2小时", [ i, t.hours() ]));
o.replaceLabel(a, [ s.t("结束时间:"), r ]);
} else o.replaceLabel(a, [ s.t("结束时间:"), s.t("永久") ]);
}
},
onClose_: function() {
this.unschedule(this.tick_);
this.selectBt = null;
t.each(this.btItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
var a = this.btScrollview.getComponent(cc.ScrollView);
a.stopAutoScroll();
a.scrollToTop(0);
y.priorityMap = {};
l.removePanel(this.node);
h.player.emit(c.EVENT.ATTRS, []);
e("dreamActivityPanel").instance.update_();
},
onSelectActivity_: function(e) {
var a = e.target, n = a.data, c = a == this.selectBt;
this.selectBt = a;
t.each(this.btItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
e.getChildByName("select_label").active = !1;
e.getChildByName("title_label").active = !0;
});
a.getComponent(cc.Button).interactable = !1;
a.getChildByName("select_label").active = !0;
a.getChildByName("title_label").active = !1;
var g = t.indexOf(this.btItemsLayout.children, a) - 0, p = 1 - (g = g < 5 ? 0 : g) / (this.btItemsLayout.children.length - 1);
this.btScrollview.getComponent(cc.ScrollView).scrollToPercentVertical(p, .5);
this.roleSpine.active = !1;
this.roleSp.active = !1;
this.activeBoxsNode.active = n.isActive;
this.exchangeNode.active = n.isDreamExchange;
this.timeNode = this.mainTimeNode;
var _ = r["activity_spines_role_" + n.spineResId + "_skel"];
this.roleSpine.active = !!n.spineResId && _;
if (this.roleSpine.active) {
l.setSpineAsset(this.roleSpine, _, "show");
this.roleSpine.scale = y.RoleSpineScaleMap[n.spineResId] || 1.5;
}
this.roleSp.active = !!n.spineResId && !_;
this.roleSp.active && l.setSpriteFrame(this.roleSp.getComponent(cc.Sprite), r["photo_role_card_" + n.spineResId + "_png"]);
c ? this.activityScrollview.active = !0 : o.scrollviewFadeIn(this.activityScrollview);
this.activityScrollview.getChildByName("view").height = 560 - (this.topUpNode.active ? this.topUpNode.height : 0) - (this.activeBoxsNode.active ? this.activeBoxsNode.height : 0);
if (n.isDreamExchange) {
this.activityScrollview.active = !1;
this.exchangeItemMap = this.exchangeItemMap || {};
l.preHideNodeMap(this.exchangeItemMap);
for (var k in n.list) {
var b = this.exchangeItemMap[k];
if (!b) {
(b = cc.instantiate(this.exchangeItem)).parent = this.exchangeItemsContent;
b.idx = k;
this.exchangeItemMap[k] = b;
}
b.active = !0;
l.markHideNode(b);
var v = (J = n.list[k]).maxBuyTimes - J.buyTimes, S = 0 == v;
(X = b.getChildByName("buy_times_label")).preColor = X.preColor || X.color;
X.color = S ? cc.Color.RED : X.preColor;
o.replaceLabel(X.getComponent(cc.Label), [ v ]);
var T = b.getChildByName("item_item").getComponent("itemItem"), M = m.genData({
kindId: J.entityId,
count: J.count,
extra: J.extra
}, !0);
T.update_(M);
b.getChildByName("name_label").getComponent(cc.Label).string = M.name;
(ce = b.getChildByName("price_label").getComponent(cc.Label)).string = J.price;
b.data = {
itemItem: M,
itemName: M._data.kindName,
itemDesc: M._data.desc,
activityItem: n,
goods: J,
moneyName: i.findEntityById(n.moneyId).kindName,
isSellOut: S
};
}
l.hideNodeMap(this.exchangeItemMap);
var $ = h.player.bag.getItemCount(n.moneyId);
this.exchangeMoneyLabel.string = $;
}
if (n.isActive) {
var I = this.activeBoxsNode.getChildByName("active_bar"), C = n.boxActivity.reachMap.dreamActivePoint, P = -1;
for (k = 0; k < 3; k++) {
var D = n.boxActivity.rewards[k], N = I.getChildByName("box_" + (k + 1) + "_layout"), A = N.getChildByName("box_bt");
A.data = {
dropList: d.DROP.FUNS.getDropListByDesc(D.dropListDesc),
isCanReceive: D.status == f.STATUS.CAN_RECEIVE,
activityName: n.boxActivity.name,
rewardIdx: k
};
var L = A.getChildByName("armature").getComponent(sp.Skeleton);
A.interactable = !0;
L.setAnimation(0, "action_4", !0);
if (D.status == f.STATUS.COMPLETE) {
L.setAnimation(0, "action_3", !0);
A.interactable = !1;
} else A.data.isCanReceive && L.setAnimation(0, "action_1", !0);
A.boxArmature = L;
D.status != f.STATUS.UN_COMPLETE && (P = k);
N.getChildByName("need_label").getComponent(cc.Label).string = D.needMap.dreamActivePoint;
}
I.getComponent(cc.ProgressBar).progress = (P + 1) / 3 + .01;
this.activeBoxsNode.getChildByName("active_point_label").getComponent(cc.Label).string = C;
}
switch (n.name) {
default:
this.activityReachNode.active = !1;
if (n.reachMap) {
var E = f.NEED_KEY, B = {};
B[E.TOP_UP_GEM] = s.t("当前已充值钻石:");
B[E.COST_GEM] = s.t("当前已消耗钻石:");
B[E.PLAYER_LEVEL] = s.t("当前等级:");
B[E.TOTAL_POWER] = s.t("当前总战力:");
B[E.INC_POWER] = s.t("当前提升战力:");
B[E.GEM_TEN_TIMES] = s.t("当前10抽次数:");
B[E.TOP_UP_MONEY] = s.t("当前已充值金额:");
B.topUpDays = s.t("累计充值天数:");
B.taskActivePoint = s.t("累计活跃度:");
B.dreamRollTimes = s.t("累计投掷:");
var w = null;
for (var G in n.reachMap) if (B[G]) {
w = G;
break;
}
if ((w = n.showNeedKey || w) && !n.isActive) {
this.activityReachNode.active = !0;
var R = n.reachMap[w];
"topUpDays" == w && 0 == n.reachMap.topUpGem && R--;
var H = this.activityReachNode.getComponentInChildren(cc.RichText);
o.replaceLabel(H, [ B[w], o.floatStrip(R) ]);
break;
}
}
}
this.buyGoodsItemMap = this.buyGoodsItemMap || {};
l.preHideNodeMap(this.buyGoodsItemMap);
this.normalItemMap = this.normalItemMap || {};
l.preHideNodeMap(this.normalItemMap);
this.unlockItemMap = this.unlockItemMap || {};
l.preHideNodeMap(this.unlockItemMap);
var x = n.newRewards || n.rewards;
for (var k in x) {
var K = x[k];
if (!(K.showNeedVip && h.player.vip.level < K.showNeedVip)) {
var F;
if (K.buyMaxTimes || K.buyMaxTimesBetween) {
if (!(F = this.buyGoodsItemMap[k])) {
(F = cc.instantiate(this.buyGoodsItem)).parent = this.activityItemsLayout;
F.idx = k;
this.buyGoodsItemMap[k] = F;
}
} else if (n.isUnlockMore) {
if (!(F = this.unlockItemMap[k])) {
(F = cc.instantiate(this.unlockItem)).parent = this.activityItemsLayout;
F.idx = k;
this.unlockItemMap[k] = F;
}
} else if (!(F = this.normalItemMap[k])) {
(F = cc.instantiate(this.normalItem)).parent = this.activityItemsLayout;
F.idx = k;
this.normalItemMap[k] = F;
}
F.zIndex = Number(k);
F.active = !0;
l.markHideNode(F);
l.setSpriteFrame(F.getComponent(cc.Sprite), r["activity_item_bg_" + n.itemResId + "_png"], !0);
switch (n.itemResId) {
case 4:
cc.color("#BC4D1F");
}
F.data = K;
if (!n.isUnlockMore) {
F.opacity = K.status == f.STATUS.COMPLETE ? 76.5 : 255;
F.zIndex = K.status == f.STATUS.COMPLETE ? 100 : F.zIndex;
K.status == f.STATUS.CAN_RECEIVE && (F.zIndex = Number(k) - 100);
}
var V = F.getChildByName("title_label");
V && (V.getComponent(cc.Label).string = s.t(K.desc));
var O = F.getChildByName("active_label");
if (O) {
O.active = "dreamActivePoint" == K.completeIncKey;
O.active && o.replaceLabel(O.getComponent(cc.Label), [ K.completeIncVal ]);
}
var U = F.getChildByName("receive_bt");
if (U) {
U.data = {
activityName: n.name,
rewardIdx: k
};
U.active = K.status == f.STATUS.CAN_RECEIVE;
if (n.advancedRewards && n.advancedRewards[k].status == f.STATUS.CAN_RECEIVE) {
U.data.activityNames = [ n.name, n.name ];
U.data.rewardIdxs = [ K.idx, n.advancedRewards[k].idx ];
}
}
var W = F.getChildByName("continue_receive_bt");
if (W) {
W.data = {
activityName: n.name,
rewardIdx: n.advancedRewards[k].idx,
lockTips: n.isTopUp ? null : s.t("购买后解锁")
};
n.isTopUp || (W.data.needBuy = !0);
W.active = K.status == f.STATUS.COMPLETE && n.advancedRewards[k].status != f.STATUS.COMPLETE;
}
var Y = F.getChildByName("reach_label");
if (Y) {
var j = t.keys(K.needMap)[0], q = (R = n.showNeedKey ? n.reachMap[n.showNeedKey] : n.reachMap[j], 
n.showNeedKey ? K.needMap[n.showNeedKey] : t.values(K.needMap)[0]);
"topUpDays" == n.showNeedKey && 0 == n.reachMap.topUpGem && R--;
o.replaceLabel(Y.getComponent(cc.Label), [ o.floatStrip(R), q ]);
}
var X, z = t.keys(K.needMap)[0].split("_")[1], J = z ? h.player.extra.goodsList[z] : null, Z = F.getChildByName("buy_bt");
if (Z) {
Z.active = !1;
if (J) {
Z.data = {
id: J.id,
price: J.price,
priceRate: J.priceRate || 1,
name: s.t(J.name, [ J.gem || J.price ]),
gem: J.gem
};
Z.active = K.status == f.STATUS.UN_COMPLETE;
(ce = Z.getChildByName("price_label").getComponent(cc.Label)).string = s.t(J.show, [ J.price ]);
l.getBtDiscountNode(ce);
}
}
if (X = F.getChildByName("buy_times_label")) {
X.active = !!K.buyMaxTimes && !K.isHideBuyTimes;
X.active && o.replaceLabel(X.getComponent(cc.Label), [ K.buyTimes || 0, K.buyMaxTimes ]);
}
if (n.isUnlockMore) {
for (var Q = [], ee = 0; ee < 5; ee++) {
(te = F.getChildByName("item_node_" + (ee + 1))).active = !1;
Q.push(te);
}
var ae = K.dropList.concat(n.advancedRewards[k].dropList);
for (var ee in ae) {
var te, ne = ae[ee];
(te = Q[ee]).active = !0;
T = te.getComponentInChildren("itemItem"), M = m.genData({
kindId: ne.entityId,
count: ne.count,
extra: ne.extra
}, !0);
T.setShowPanel_(!0);
T.update_(M);
l.addItemEffect(ne, T.node);
}
Q[0].getChildByName("received_sp").active = K.status == f.STATUS.COMPLETE;
for (ee = 1; ee < Q.length; ee++) {
Q[ee].getChildByName("received_sp").active = n.advancedRewards[k].status == f.STATUS.COMPLETE;
Q[ee].getChildByName("lock_sp").active = !n.isTopUp;
}
} else {
var ie = F.getChildByName("reward_layout");
F.itemItemMap = F.itemItemMap || {};
l.preHideNodeMap(F.itemItemMap);
F.roleItemMap = F.roleItemMap || {};
l.preHideNodeMap(F.roleItemMap);
var re = 0, se = 0;
for (var ee in K.dropList) {
ne = K.dropList[ee];
if (i.findEntityById(ne.entityId).type == d.CONSTS.ENTITY_TYPE.ROLE) {
var oe = F.roleItemMap[re];
if (!oe) {
(oe = cc.instantiate(this.activityRewardRoleItem)).parent = ie;
oe.idx = re;
F.roleItemMap[re] = oe;
}
oe.zIndex = Number(ee);
oe.active = !0;
l.markHideNode(oe);
var le = u.genData({
kindId: ne.entityId,
star: ne.extra.star
});
oe.getComponent("roleItem").update_(le);
l.addItemEffect(ne, oe);
re++;
} else {
if (!(T = F.itemItemMap[se])) {
(T = cc.instantiate(this.activityRewardItemItem)).parent = ie;
T.idx = se;
F.itemItemMap[se] = T;
}
T.zIndex = Number(ee);
T.active = !0;
l.markHideNode(T);
T.getComponent("itemItem").setShowPanel_(!0);
M = m.genData({
kindId: ne.entityId,
count: ne.count,
extra: ne.extra
}, !0);
T.getComponent("itemItem").update_(M);
l.addItemEffect(ne, T);
se++;
}
}
l.hideNodeMap(F.itemItemMap);
l.hideNodeMap(F.roleItemMap);
}
}
}
l.hideNodeMap(this.buyGoodsItemMap);
l.hideNodeMap(this.normalItemMap);
l.hideNodeMap(this.unlockItemMap);
this.buyDescLabel.active = !!n.isUnlockMore;
this.buyDescLabel.active && n.buyDesc && (this.buyDescLabel.getComponent(cc.Label).string = n.buyDesc);
this.buyBt.active = !!n.isUnlockMore;
this.fillActiveBt.active = !1;
if (this.buyBt.active) {
var ce;
J = n.needGoods;
this.buyBt.data = {
id: J.id,
price: J.price,
priceRate: J.priceRate || 1,
name: s.t(J.name, [ J.gem || J.price ]),
gem: J.gem
};
this.buyBt.active = n.advancedRewards[0].status == f.STATUS.UN_COMPLETE;
(ce = this.buyBt.getChildByName("price_label").getComponent(cc.Label)).string = s.t(J.show, [ J.price ]);
l.getBtDiscountNode(ce);
}
if (n.isUnlockMore) {
var de = t.keys(t.last(n.rewards).needMap)[1], he = (n.reachMap[de], n.reachMap.loginDays2), ue = t.last(n.rewards).needMap.loginDays2, me = d.ACTIVITY.FUNS.getBuySpActiveCostGem(ue - he);
this.fillActiveBt.data = {
curPoint: he,
maxPoint: ue
};
var ge = Math.ceil((n.end_time - Date.now()) / d.CONSTS.A_DAY);
this.fillActiveBt.active = ge <= 2 && me > 0;
}
if (!c) {
var pe = this.activityScrollview.getComponent(cc.ScrollView);
pe.stopAutoScroll();
pe.scrollToTop(0);
}
},
onReceive_: function(a, t) {
var n = a ? a.target.data : t;
if (n.lockTips) l.addHintPanel(n.lockTips); else {
var i = this;
l.addLoading();
var r = n.activityNames ? n.activityNames : [ n.activityName ], s = n.rewardIdxs ? n.rewardIdxs : [ n.rewardIdx ];
k.receiveActivityAward(r, s, function(a) {
l.addRewardEffectPanel(a._temp.entityCountMap);
i.update_();
e("dreamActivityPanel").instance.update_();
});
}
},
onBuy_: g.prototype.onGoodsItem_,
onSwitchToActivity_: function(e) {
var a = e.target.data, n = this.btItemMap[t.indexOf(this.data.activitys, a.activity)];
this.onSelectActivity_({
target: n
});
},
onGoto_: function(e) {
var a = e.target.data;
cc.sys.openURL(a.url);
var t = this;
l.addLoading();
k.updateDiyActivity(a.key, 1, function() {
t.update_();
});
},
onRule_: function() {
l.addRulePanel(p.TYPE.SIHINTOPUP);
},
onBuyActive_: function(e) {
var a = e.target.data, t = d.ACTIVITY.FUNS.getBuySpActiveCostGem(a.maxPoint - a.curPoint), n = s.t("是否花费$1钻石补足天数?", [ t ]), i = this;
l.addMessageBox(n, function() {
l.addLoading();
k.fillLoginTopUp(function() {
i.update_();
});
});
},
onBox_: function(e) {
var a = e.target, t = a.data;
if (t.isCanReceive) {
var n = this;
l.addLoading();
k.receiveActivityAward([ t.activityName ], [ t.rewardIdx ], function(e) {
a.boxArmature.setAnimation(0, "action_2", !1);
n.scheduleOnce(function() {
l.addRewardEffectPanel(e._temp.entityCountMap);
}, 1);
});
t.isCanReceive = !1;
} else l.addRewardPanel(s.t("奖励内容"), t.dropList);
},
onExchange_: function(e) {
var a = e.target.data;
if (a) if (a.isSellOut) l.addHintPanel(s.t("购买次数已用完")); else {
this.buyConfirmPanel.active = !0;
var t = this.buyConfirmPanel.getChildByName("top_bg_node");
t.getChildByName("item_item").getComponent("itemItem").update_(a.itemItem);
t.getChildByName("item_name_label").getComponent(cc.Label).string = a.itemName;
t.getChildByName("item_count_label").getComponent(cc.Label).string = h.player.bag.getItemCount(a.itemItem.kindId);
var n = this.buyConfirmPanel.getChildByName("center_bg_sp").getComponentInChildren(cc.Label);
n.string = a.itemDesc;
if (a.itemItem.type == d.CONSTS.ENTITY_TYPE.ARTIFACT) {
var r = a.itemItem._data.starVals[a.itemItem._item.star], o = _.getAttrDesc(a.itemItem._data.effect, r);
n.string = s.t(n.string, [ o.value ]);
} else if (a.itemItem.type == d.CONSTS.ENTITY_TYPE.ARTIFACT_FRAGMENT) {
var c = i.artifact.findOneBy("fragmentId", a.itemItem.kindId);
o = _.getAttrDesc(c.effect);
n.string = s.t(n.string, [ o.value ]);
} else if (a.itemItem.type == d.CONSTS.ENTITY_TYPE.FRUIT_FRAGMENT) {
var u = i.fruit.findBy("fragmentId", a.itemItem.kindId)[0];
o = _.getAttrDesc(u.effect);
n.string = s.t(n.string, [ o.value ]);
}
this.buyConfirmPanel.getChildByName("bottom_bg_sp").getChildByName("cost_coin_label").getComponent(cc.Label).string = a.goods.price;
this.buyConfirmPanel.getChildByName("buy_bt").data = a;
}
},
buyConfirmBuy_: function(e) {
var a = e.target.data, t = this;
l.addLoading();
k.exchange(a.activityItem.exchangeId, a.goods.id, function(e) {
l.addRewardEffectPanel(e._temp.entityCountMap);
t.buyConfirmClose_();
t.update_();
});
},
buyConfirmClose_: function() {
this.buyConfirmPanel.active = !1;
}
});
y.genData = function(e) {
e = e || null;
var a = h.player, n = (a.extra.goodsList, t.values(a.activity.map));
t.each(n, function(e) {
e.rewards && t.each(e.rewards, function(e) {
e.dropList = e.dropListDesc ? d.DROP.FUNS.getDropListByDesc(e.dropListDesc) : e.dropList;
e.rdDropList = e.rdDropListDesc ? d.DROP.FUNS.getRandomDropListByDesc(e.rdDropListDesc) : e.rdDropList;
});
});
if (0 == (n = t.filter(n, function(e) {
return !!e.isDream;
})).length) return null;
var i = {}, r = !1;
for (var s in n) {
var o = n[s];
o._priority = o._priority || o.priority;
o.priority = o._priority;
if (o.rewards) for (var l in o.rewards) if ((!o.rewardIdxs || t.include(o.rewardIdxs, Number(l))) && o.rewards[l].status == f.STATUS.CAN_RECEIVE) {
i[o.name] = !0;
r = !0;
o.priority = 1;
break;
}
var c = y.priorityMap[o.name];
o.priority = c || o.priority;
y.priorityMap[o.name] = o.priority;
if (o.isUnlockMore) {
var u = o.reachMap, m = t.keys(t.last(o.rewards).needMap)[1];
o.isTopUp = u[m] > 0;
var g = [], p = [];
for (var l in o.rewards) {
var _ = o.rewards[l];
_.idx = l;
_.needMap[m] ? p.push(_) : g.push(_);
}
o.newRewards = g;
o.advancedRewards = p;
var k = m.split("_")[1];
o.needGoods = k ? h.player.extra.goodsList[k] : null;
}
if (o.isActive) {
var b = t.findWhere(n, {
isActiveBox: !0
});
o.boxActivity = b;
}
}
n = t.filter(n, function(e) {
return !e.isActiveBox;
});
var v = t.findWhere(t.values(a.activity.exchangeMap), {
isDreamExchange: !0
});
v && n.push(v);
return {
selectActivityName: e,
activitys: n = t.sortBy(n, "priority"),
isMarkMap: i,
isNeedMark: r = (y.isMark || r) && n.length > 0
};
};
y.priorityMap = {};
y.isMark = !0;
y.RoleSpineScaleMap = {
49: 1.3,
"49_2": 1.3
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
dreamActivityPanel: "dreamActivityPanel",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
roleScene: "roleScene",
rulePanel: "rulePanel",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
