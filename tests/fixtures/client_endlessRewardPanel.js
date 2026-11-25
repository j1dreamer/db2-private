endlessRewardPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "43b1fcl1vxA/7A3K+6Bxz5s", "endlessRewardPanel");
var t = e("underscore"), n = e("baseView"), i = e("i18n"), r = e("moment"), s = e("serverMain"), o = e("serverConfig"), l = e("topUpPanel"), c = e("helper"), d = e("playerHandler"), h = cc.Class({
extends: cc.Component,
properties: {
coinPriceLabel: cc.Label,
buyCoinBt: cc.Node,
nextCoinTimeLabel: cc.Label,
receiveCoinBt: cc.Node,
gemPriceLabel: cc.Label,
buyGemBt: cc.Node,
nextGemTimeLabel: cc.Label,
receiveGemBt: cc.Node
},
update_: function() {
var e = h.genData();
this.data = e;
c.replaceLabel(this.coinPriceLabel, [ e.coinGoods.price ]);
this.buyCoinBt.active = !e.isBuyCoin;
this.nextCoinTimeLabel.node.active = e.isBuyCoin && !e.isCanReceiveCoin;
this.receiveCoinBt.active = e.isCanReceiveCoin;
n.setMark(this.receiveCoinBt, e.isCanReceiveCoin);
c.replaceLabel(this.gemPriceLabel, [ e.gemGoods.price ]);
this.buyGemBt.active = !e.isBuyGem;
this.nextGemTimeLabel.node.active = e.isBuyGem && !e.isCanReceiveGem;
this.receiveGemBt.active = e.isCanReceiveGem;
n.setMark(this.receiveGemBt, e.isCanReceiveGem);
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
tick_: function() {
if (this.data.isBuyCoin) if (0 == (t = (t = s.tTime(this.data.nextCoinTime) - Date._now()) < 0 ? 0 : t)) {
this.data.coinReward.status = o.ACTIVITY.CONSTS.CAN_RECEIVE;
this.nextCoinTimeLabel.node.active = !1;
this.receiveCoinBt.active = !0;
} else {
var e = r.duration(t), a = c.formatDuration(e.hours(), e.minutes(), e.seconds());
c.replaceLabel(this.nextCoinTimeLabel, [ a ]);
}
if (this.data.isBuyGem) {
var t;
if (0 == (t = (t = s.tTime(this.data.nextGemTime) - Date._now()) < 0 ? 0 : t)) {
this.data.gemReward.status = o.ACTIVITY.CONSTS.CAN_RECEIVE;
this.nextGemTimeLabel.node.active = !1;
this.receiveGemBt.active = !0;
} else {
e = r.duration(t), a = c.formatDuration(e.hours(), e.minutes(), e.seconds());
c.replaceLabel(this.nextGemTimeLabel, [ a ]);
}
}
},
onClose_: function() {
n.removePanel(this.node);
this.unschedule(this.tick_);
},
onCoinBuy_: function() {
var e = this.data.coinGoods, a = {
id: e.id,
price: e.price,
priceRate: e.priceRate || 1,
name: i.t(e.name, [ e.gem || e.price ]),
gem: e.gem
};
l.prototype.onGoodsItem_(null, a);
},
onCoinReceive_: function() {
var e = this;
n.addLoading();
d.receiveActivityAward([ this.data.activityName ], [ 0 ], function(a) {
n.addRewardEffectPanel(a._temp.entityCountMap);
e.update_();
});
},
onGemBuy_: function() {
var e = this.data.gemGoods, a = {
id: e.id,
price: e.price,
priceRate: e.priceRate || 1,
name: i.t(e.name, [ e.gem || e.price ]),
gem: e.gem
};
l.prototype.onGoodsItem_(null, a);
},
onGemReceive_: function() {
var e = this;
n.addLoading();
d.receiveActivityAward([ this.data.activityName ], [ 1 ], function(a) {
n.addRewardEffectPanel(a._temp.entityCountMap);
e.update_();
});
}
});
h.genData = function() {
var e = s.player.activity.map.endless_reward;
if (!e) return !1;
var a = e.rewards[0], n = t.keys(a.needMap)[0], i = s.player.extra.goodsList[n.split("_")[1]], r = !!e.reachMap[n], l = a.status == o.ACTIVITY.CONSTS.STATUS.CAN_RECEIVE, c = e.rewards[1], d = t.keys(c.needMap)[0], h = s.player.extra.goodsList[d.split("_")[1]], u = !!e.reachMap[d], m = c.status == o.ACTIVITY.CONSTS.STATUS.CAN_RECEIVE;
return {
activityName: e.name,
coinGoods: i,
isBuyCoin: r,
nextCoinTime: a.needMap.nextReceiveWaitTime,
isCanReceiveCoin: l,
coinReward: a,
gemGoods: h,
isBuyGem: u,
nextGemTime: c.needMap.nextReceiveWaitTime,
isCanReceiveGem: m,
gemReward: c,
isNeedMark: l || m
};
};
cc._RF.pop();
}, {
baseView: "baseView",
helper: "helper",
i18n: "i18n",
moment: "moment",
playerHandler: "playerHandler",
serverConfig: "serverConfig",
serverMain: "serverMain",
topUpPanel: "topUpPanel",
underscore: "underscore"
} ],
