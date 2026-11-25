coinTopNode: [ function(e, a) {
"use strict";
cc._RF.push(a, "18cbfMSPPpD06vDPiHb+eXh", "coinTopNode");
var t = e("underscore"), n = e("moment"), i = e("helper"), r = (e("http"), e("soundApi"),
e("player")), s = e("serverMain"), o = e("i18n"), l = e("buildExt"), c = e("serverConfig"), d = (e("clientConfig"),
e("baseView")), h = e("playerHandler");
cc.Class({
extends: cc.Component,
properties: {
coinLabel: cc.Label,
gemLabel: cc.Label,
apLabel: cc.Label,
maxApLabel: cc.Label,
buCoinBt: cc.Button,
buGemBt: cc.Button,
buApBt: cc.Button,
apRecoverBt: cc.Node,
apRecoverPanel: cc.Node,
apRecoverDescLabel: cc.Label,
apRecoverNextApLabel: cc.Label,
apRecoverFullApLabel: cc.Label,
apRecoverBuyApTimesLabel: cc.Label
},
onLoad: function() {
this.onFun = this.update_.bind(this);
s.player.on(r.EVENT.ATTRS, this.onFun);
this.apRecoverBt.targetOff(this);
this.apRecoverBt.on(cc.Node.EventType.TOUCH_START, this.onViewApRecover_, this);
this.apRecoverBt.on(cc.Node.EventType.TOUCH_END, this.onViewApRecover_, this);
this.apRecoverBt.on(cc.Node.EventType.TOUCH_CANCEL, this.onViewApRecover_, this);
this.apRecoverPanel.active = !1;
this.update_();
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
onDestroy: function() {
s.player.off(r.EVENT.ATTRS, this.onFun);
},
update_: function() {
var e = s.player, a = this.coinLabel.preVal || e.coin;
e.coin > a && i.scaleEffect(this.coinLabel.node);
this.coinLabel.preVal = e.coin;
this.coinLabel.string = e.coin;
a = this.gemLabel.preVal || e.gem;
e.gem > a && i.scaleEffect(this.gemLabel.node);
this.gemLabel.preVal = e.gem;
this.gemLabel.string = e.gem;
a = this.apLabel.preVal || e.actionPoint;
e.actionPoint > a && i.scaleEffect(this.apLabel.node);
this.apLabel.preVal = e.actionPoint;
this.apLabel.string = e.actionPoint;
i.replaceLabel(this.maxApLabel, [ e.timesMaxMap.actionPoint ]);
},
onBuyCoin_: function() {
d.addBuyCoinPanel();
},
onBuyGem_: function() {
if (l.closeTopUpMsg) d.addHintPanel(l.closeTopUpMsg); else {
d.addLoading();
h.topUpGoodsList(function(e) {
s.player.extra.goodsList = e._temp.goodsList;
d.addTopUpPanel();
});
l.openBuyGem && l.openBuyGem();
}
},
onBuyAp_: function() {
d.addBuyApPanel();
},
onViewApRecover_: function(e) {
switch (e.type) {
case cc.Node.EventType.TOUCH_START:
this.apRecoverPanel.active = !0;
var a = s.player, r = t.findWhere(a.activity.map, {
type: c.ACTIVITY.CONSTS.TYPE.REDUCE_ACTION_POINT_RECOVER_TIME
}), l = r ? r.recover_time : c.PLAYER.CONSTS.ACTION_POINT_RECOVER_TIME;
i.replaceLabel(this.apRecoverDescLabel, [ Math.floor(l / 6e4) ]);
i.replaceLabel(this.apRecoverBuyApTimesLabel, [ a.vip.buyActionPointTimes, a.vipData.buyActionPointTimes ]);
var d = a.timesMaxMap.actionPoint - a.actionPoint;
if (d <= 0) this.apRecoverFullApLabel.string = o.t("行动力已满"); else {
var h = s.player.nextRecoverTimeMap.actionPoint - Date.now();
h = h < 0 ? 0 : h;
this.apRecoverFullApLabel.string = n(s.tTime(Date.now() + (d - 1) * l + h)).format("H:mm");
}
break;

case cc.Node.EventType.TOUCH_CANCEL:
case cc.Node.EventType.TOUCH_END:
this.apRecoverPanel.active = !1;
}
},
tick_: function() {
var e = o.t("行动力已满"), a = s.player.nextRecoverTimeMap.actionPoint;
if (a) {
var t = a - Date.now();
t = t < 0 ? 0 : t;
var r = n.duration(t);
e = i.formatDuration(r.asMinutes(), r.seconds());
}
this.apRecoverNextApLabel.string = e;
}
});
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
helper: "helper",
http: "http",
i18n: "i18n",
moment: "moment",
player: "player",
playerHandler: "playerHandler",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
