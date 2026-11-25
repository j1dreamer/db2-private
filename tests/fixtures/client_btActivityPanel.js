btActivityPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "5772bX6rcRLp4/tN1bT2c64", "btActivityPanel");
var t = e("underscore"), n = (e("moment"), e("helper")), i = e("i18n"), r = e("baseView"), s = e("roleItem"), o = e("itemItem"), l = e("dataApi"), c = e("player"), d = e("serverMain"), h = e("serverConfig"), u = e("playerHandler"), m = e("topUpPanel"), g = h.ACTIVITY.CONSTS, p = (h.ACTIVITY.FUNS, 
cc.Class({
extends: cc.Component,
properties: {
btItemsLayout: cc.Node,
btItem: cc.Node,
rewardItem: cc.Node,
rewardItemsContent: cc.Node,
activeSp: cc.Node,
buyBt: cc.Node
},
onLoad: function() {
this.btItem.active = !1;
this.rewardItem.active = !1;
this.selectBt = null;
this.update_();
},
update_: function() {
var e = p.genData();
this.data = e;
this.btItemMap = this.btItemMap || {};
r.preHideNodeMap(this.btItemMap);
for (var a in e.activityItems) {
var n = this.btItemMap[a];
if (!n) {
(n = cc.instantiate(this.btItem)).parent = this.btItemsLayout;
n.idx = Number(a);
this.btItemMap[a] = n;
}
n.active = !0;
r.markHideNode(n);
var s = e.activityItems[a];
n.data = s;
r.setMark(n, e.isMarkMap[s.name], {
x: 74,
y: 47
});
n.getChildByName("title_label").getComponent(cc.Label).string = i.t(s.desc);
n.getChildByName("select_label").getComponent(cc.Label).string = i.t(s.desc);
e.selectActivityName == s.name && (this.selectBt = n);
}
r.hideNodeMap(this.btItemMap);
var o = t.values(this.btItemMap)[0];
this.selectBt ? this.onSelectActivity_({
target: this.selectBt
}) : o && this.onSelectActivity_({
target: o
});
},
show_: function() {
r.addPanel(this.node, !1, !0, !0);
this.update_();
},
onClose_: function() {
r.removePanel(this.node);
d.player.emit(c.EVENT.ATTRS, []);
},
onSelectActivity_: function(e) {
var a = e.target, c = a.data;
this.selectBt;
this.selectBt = a;
t.each(this.btItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
e.getChildByName("select_label").active = !1;
});
a.getComponent(cc.Button).interactable = !1;
a.getChildByName("select_label").active = !0;
var u = a.data, m = t.keys(u.rewards[0].needMap)[0], p = d.player.extra.goodsList[m.split("_")[1]];
this.buyBt.getChildByName("price_label").getComponent(cc.Label).string = i.t(p.show, [ p.price ]);
var _ = this.buyBt.getChildByName("pre_price_label").getComponent(cc.Label);
n.replaceLabel(_, [ c.prePrice ]);
this.buyBt.data = {
id: p.id,
price: p.price,
priceRate: p.priceRate || 1,
name: i.t(p.name, [ p.gem || p.price ]),
gem: p.gem,
activityName: c.selectActivityName || c.name,
isUseMoneyTicket2: !0
};
this.buyBt.active = 0 == u.reachMap[m];
this.activeSp.active = !this.buyBt.active;
this.rewardItemMap = this.rewardItemMap || {};
r.preHideNodeMap(this.rewardItemMap);
var k = Math.ceil((Date.now() - u.start_time) / h.CONSTS.A_DAY);
for (var f in u.rewards) {
var y = c.rewards[f], b = y.dropList[0], v = l.findEntityById(b.entityId), S = this.rewardItemMap[f];
if (!S) {
(S = cc.instantiate(this.rewardItem)).parent = this.rewardItemsContent;
S.idx = f;
this.rewardItemMap[f] = S;
}
S.active = !0;
r.markHideNode(S);
var T = S.getChildByName("item_node"), M = S.getChildByName("role_node");
T.active = !1;
M.active = !1;
if (v.type == h.CONSTS.ENTITY_TYPE.ROLE) {
M.active = !0;
r.markHideNode(M);
var $ = s.genData({
kindId: b.entityId,
star: b.extra.star
});
M.getComponentInChildren("roleItem").update_($);
r.addItemEffect(b, M);
} else {
T.active = !0;
r.markHideNode(T);
var I = o.genData({
kindId: b.entityId,
count: b.count,
extra: b.extra
}, !0);
T.getComponentInChildren("itemItem").update_(I);
r.addItemEffect(b, T);
}
var C = y.status == g.STATUS.COMPLETE;
S.getChildByName("received_sp").active = C;
var P = S.getChildByName("days_label");
P.getComponent(cc.Label).string = Number(f) + 1;
var D = k >= y.needMap.loginDays;
P.color = D ? cc.Color.GREEN : cc.Color.WHITE;
var N = y.status == g.STATUS.CAN_RECEIVE;
r.setMark(S, N);
S.data = {
activityName: u.name,
rewardIdx: f,
isReachLoginDays: D,
isCanReceive: N,
isComplete: C
};
}
r.hideNodeMap(this.rewardItemMap);
},
onReceive_: function(e) {
var a = e.target.data;
if (a.isComplete) r.addHintPanel(i.t("已经领取过了")); else if (!a.isReachLoginDays || a.isCanReceive) {
var t = this;
r.addLoading();
u.receiveActivityAward([ a.activityName ], [ a.rewardIdx ], function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap);
t.update_();
});
} else r.addHintPanel(i.t("请先购买解锁奖励"));
},
onBuy_: function(e, a) {
var t = e.target.data;
!t.activityName || h.ACTIVITY.FUNS.checkOpen(d.player.activity.map[t.activityName], d.player.serverId) ? m.prototype.onGoodsItem_(e, a) : r.addHintPanel(i.t("活动已结束"));
}
}));
p.genData = function(e) {
var a = d.player, n = (a.extra.goodsList, t.values(a.activity.map));
n = t.filter(n, function(e) {
return e.rewards && e.isBt;
});
var i = {}, r = !1;
t.each(n, function(e) {
var a = !!t.findWhere(e.rewards, {
status: g.STATUS.CAN_RECEIVE
});
i[e.name] = a;
a && (r = !0);
});
return {
selectActivityName: e,
activityItems: n,
isMarkMap: i,
isNeedMark: r
};
};
cc._RF.pop();
}, {
baseView: "baseView",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerHandler: "playerHandler",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
topUpPanel: "topUpPanel",
underscore: "underscore"
} ],
