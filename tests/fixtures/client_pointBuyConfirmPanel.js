pointBuyConfirmPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "9a1b0rekrlCqroo09RAVgda", "pointBuyConfirmPanel");
var t = e("baseView"), n = e("serverMain"), i = e("i18n"), r = e("helper"), s = e("buildExt"), o = e("playerHandler"), l = cc.Class({
extends: cc.Component,
properties: {
textLabel: cc.Label,
pointLabel: cc.Label
},
update_: function(e, a) {
var t = l.genData(e, a);
this.data = t;
r.replaceLabel(this.textLabel, [ t.needPoint ]);
r.replaceLabel(this.pointLabel, [ t.topUpPoint ]);
},
show_: function() {
t.addPanel(this.node, !0);
this.update_.apply(this, arguments);
},
onClose_: function() {
t.removePanel(this.node);
},
onBuy_: function(e, a) {
var t = this.data.needGoods;
a = {
id: t.id,
price: t.price,
priceRate: t.priceRate || 1,
name: i.t(t.name, [ t.gem || t.price ]),
gem: t.gem || 0
};
s.isShowBtDiscount && (a.priceRate = 100);
sdkApi.pay(a.id, a.price * a.priceRate, a.name, a.gem);
this.onClose_();
},
onPointBuy_: function() {
if (this.data.needPoint > this.data.topUpPoint) t.addHintPanel(i.t("点券不足")); else {
var e = this;
t.addLoading();
this.data.isUseMoneyTicket2 ? o.costTopUpPoint2(this.data.goodsId, function() {
e.onClose_();
}) : o.costTopUpPoint(this.data.goodsId, function() {
e.onClose_();
});
}
}
});
l.genData = function(e, a) {
var t = n.player, r = t.extra.goodsList[e], o = r.needPoint, l = i.t(r.show, [ r.price ]), c = t.topUpPoint;
if (s.moneyTicketId) {
c = t.bag.getItemCount(s.moneyTicketId);
s.moneyTicket2Id && (c += t.bag.getItemCount(s.moneyTicket2Id));
a && (c = t.bag.getItemCount(s.moneyTicket2Id));
}
return {
goodsId: e,
topUpPoint: c,
needPoint: o,
needGoods: r,
priceDesc: l,
isUseMoneyTicket2: a
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
helper: "helper",
i18n: "i18n",
playerHandler: "playerHandler",
serverMain: "serverMain"
} ],
