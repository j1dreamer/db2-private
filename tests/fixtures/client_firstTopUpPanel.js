firstTopUpPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "c5318/0OJtHPpzq0V5F60Wf", "firstTopUpPanel");
var t = e("underscore"), n = e("baseView"), i = e("underscore.string"), r = (e("clientConfig"), 
e("serverConfig")), s = e("i18n"), o = e("helper"), l = e("dataApi"), c = e("serverMain"), d = e("buildExt"), h = e("coinTopNode"), u = (e("resource"), 
e("roleItem")), m = e("itemItem"), g = e("topUpPanel"), p = e("playerHandler"), _ = r.ACTIVITY.CONSTS, k = cc.Class({
extends: cc.Component,
properties: {
titleSp: cc.Sprite,
titleSpriteFrame: [ cc.SpriteFrame ],
leftSp: cc.Sprite,
leftSpriteFrame: [ cc.SpriteFrame ],
daysRewardLayout: cc.Node,
daysRewardItem: cc.Node,
descLabel: cc.Label,
typeBts: [ cc.Node ],
topUpBt: cc.Node,
receiveBt: cc.Node,
tomorrowBt: cc.Node
},
update_: function(e) {
var a = k.genData(e);
this.data = a;
this.daysRewardItem.active = !1;
this.descLabel.node.active = !1;
this.topUpBt.active = a.isUnComplete;
this.receiveBt.active = a.isCanReceive;
this.receiveBt.data = null;
this.tomorrowBt.active = !this.topUpBt.active && !this.receiveBt.active && !a.isAllComplete;
var h = t.values(k.TYPE), g = k.genAllData();
t.each(this.typeBts, function(t, i) {
var r = e == h[i];
t.getComponent(cc.Button).interactable = !r;
t.active = !!g.map[h[i]];
t.active && n.setMark(t, g.map[h[i]].isCanReceive && !r);
a.typeNeedTopUpMoneys[i] > 1 && (t.getComponentInChildren(cc.Label).string = s.t("累计充值$1元", [ a.typeNeedTopUpMoneys[i] ]));
});
1 == t.where(this.typeBts, {
active: !0
}).length && t.each(this.typeBts, function(e) {
e.active = !1;
});
var p = g.map[k.TYPE.FIRST];
p && p.isUnComplete && !d.isShowAllFristTopUp && t.each(this.typeBts, function(e) {
e.active = !1;
});
this.typeBts[0].parent.getComponent("buttonsColorComponent").colorEffect();
this.titleSp.spriteFrame = this.titleSpriteFrame[t.indexOf(k.TYPES, e)];
this.leftSp.spriteFrame = this.leftSpriteFrame[t.indexOf(k.TYPES, e)];
this.daysRewardItemMap = this.daysRewardItemMap || {};
n.preHideNodeMap(this.daysRewardItemMap);
for (var f in a.topUpActivity.rewards) {
var y = this.daysRewardItemMap[f];
if (!y) {
(y = cc.instantiate(this.daysRewardItem)).parent = this.daysRewardLayout;
y.idx = f;
this.daysRewardItemMap[f] = y;
}
y.active = !0;
n.markHideNode(y);
var b = y.getChildByName("reward_layout"), v = b.roleItem || b.getChildByName("role_item_node"), S = b.itemItem || b.getChildByName("item_item");
v.active = !1;
S.active = !1;
b.roleItemNode = v;
b.itemItem = S;
y.itemItemMap = y.itemItemMap || {};
n.preHideNodeMap(y.itemItemMap);
y.roleItemNodeMap = y.roleItemNodeMap || {};
n.preHideNodeMap(y.roleItemNodeMap);
var T = a.topUpActivity.rewards[f], M = 0, $ = 0, I = T.status == _.STATUS.COMPLETE;
for (var C in T.dropList) {
var P = T.dropList[C];
if (l.findEntityById(P.entityId).type == r.CONSTS.ENTITY_TYPE.ROLE) {
var D = y.roleItemNodeMap[M];
if (!D) {
(D = cc.instantiate(v)).parent = b;
D.idx = M;
y.roleItemNodeMap[M] = D;
}
D.active = !0;
n.markHideNode(D);
var N = u.genData({
kindId: P.entityId,
star: P.extra.star
});
D.getChildByName("role_item").getComponent("roleItem").update_(N);
n.addItemEffect(null, D, !I);
D.opacity = I ? 127.5 : 255;
M++;
} else {
var A = y.itemItemMap[$];
if (!A) {
(A = cc.instantiate(S)).parent = b;
A.idx = $;
y.itemItemMap[$] = A;
}
A.active = !0;
n.markHideNode(A);
A.getComponent("itemItem").setShowPanel_(!0);
var L = m.genData({
kindId: P.entityId,
count: P.count,
extra: P.extra
}, !0);
A.getComponent("itemItem").update_(L);
n.addItemEffect(null, A, !I);
A.opacity = I ? 127.5 : 255;
$++;
}
}
n.hideNodeMap(y.itemItemMap);
n.hideNodeMap(y.roleItemNodeMap);
o.updateLayout(b);
var E = 200 / b.width;
E = E > 1 ? 1 : E;
b.scale = E;
y.getChildByName("received_sp").active = I;
T.status != _.STATUS.CAN_RECEIVE || this.receiveBt.data || (this.receiveBt.data = {
activityName: a.topUpActivity.name,
rewardIdx: f
});
if (this.topUpBt.active) for (var B in T.needMap) if (i.include(B, "buyGoodsId")) {
var w = c.player.extra.goodsList[B.split("_")[1]];
this.topUpBt.data = {
id: w.id,
price: w.price,
priceRate: w.priceRate || 1,
name: s.t(w.name, [ w.gem || w.price ]),
gem: w.gem
};
this.descLabel.node.active = !0;
o.replaceLabel(this.descLabel, [ w.vipExp ]);
var G = this.topUpBt.getChildByName("price_label").getComponent(cc.Label);
G.string = s.t(w.show, [ w.price ]);
n.getBtDiscountNode(G);
}
}
n.hideNodeMap(this.daysRewardItemMap);
var R = a.topUpActivity.loginDaysNeed.topUpMoney;
if (!this.descLabel.node.active && R > 1) {
this.descLabel.node.active = !0;
this.descLabel.string = s.t("累计充值$1元即可领取英雄礼包，当前已充值$2元", [ R, a.topUpActivity.reachMap.topUpMoney ]);
}
},
onType_: function(e, a) {
this.update_(a);
},
onReceive_: function(e) {
var a = e.target.data, i = this;
n.addLoading();
p.receiveActivityAward([ a.activityName ], [ a.rewardIdx ], function(e) {
n.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var r in a) n.addPointRoleEffectNode(a[r]);
}
i.update_(i.data.type);
});
},
onClose_: function() {
n.removePanel(this.node);
},
onBuyGem_: function(e, a) {
if (e.target.data) g.prototype.onGoodsItem_(e, a); else {
n.removePanel(this.node);
h.prototype.onBuyGem_();
}
}
});
k.TYPE = {
FIRST: "firstTopUp",
AGAIN: "againTopUp",
AGAIN2: "againTopUp2"
};
k.TYPES = [ k.TYPE.FIRST, k.TYPE.AGAIN, k.TYPE.AGAIN2 ];
k.genData = function(e) {
var a = c.player, n = a.activity.map[e];
if (!n || n.isSuccess) return null;
var i = l.findEntityById(n.rewards[0].dropList[0].entityId), r = !!t.findWhere(n.rewards, {
status: _.STATUS.CAN_RECEIVE
}), s = t.where(n.rewards, {
status: _.STATUS.UN_COMPLETE
}).length == n.rewards.length, o = t.where(n.rewards, {
status: _.STATUS.COMPLETE
}).length == n.rewards.length, d = [];
for (var h in k.TYPE) {
var u = a.activity.map[k.TYPE[h]];
u && d.push(u.loginDaysNeed.topUpMoney);
}
return {
type: e,
topUpActivity: n,
classId: i.classId || 0,
typeNeedTopUpMoneys: d,
isCanReceive: r,
isUnComplete: s,
isAllComplete: o
};
};
k.genAllData = function() {
var e = {}, a = !1;
for (var t in k.TYPE) {
var n = k.TYPE[t], i = k.genData(n);
if (i) {
e[n] = i;
i.isCanReceive && (a = !0);
}
}
return {
map: e,
isNeedMark: a
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
coinTopNode: "coinTopNode",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
