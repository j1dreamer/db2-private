exchangePanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "2d99cyBbSVBxbombHVUj3Pj", "exchangePanel");
var t = e("underscore"), n = (e("underscore.string"), e("moment")), i = (e("soundApi"), 
e("dataApi")), r = e("resource"), s = e("i18n"), o = (e("player"), e("helper")), l = e("baseView"), c = (e("clientConfig"), 
e("serverConfig")), d = e("serverMain"), h = (e("skillItem"), e("roleItem"), e("itemItem")), u = (e("topUpPanel"), 
e("playerHandler")), m = (c.ACTIVITY.CONSTS, cc.Class({
extends: cc.Component,
properties: {
scrollview: cc.Node,
shopItemsLayout: cc.Node,
shopItem: cc.Node,
timeLabel: cc.Node,
moneyLabel: cc.Label
},
onLoad: function() {
this.shopItem.active = !1;
this.scrollview.active = !1;
this.isFadeIn = !1;
this.scheduleOnce(function() {
o.scrollviewFadeIn(this.scrollview);
this.isFadeIn = !0;
}, .2);
},
update_: function() {
var e = m.genData();
this.data = e;
var a = e.exchangeActivity;
this.shopItemMap = this.shopItemMap || {};
l.preHideNodeMap(this.shopItemMap);
this.idShopItemMap = {};
for (var t in a.list) {
var c = this.shopItemMap[t];
if (!c) {
(c = cc.instantiate(this.shopItem)).parent = this.shopItemsLayout;
c.idx = t;
this.shopItemMap[t] = c;
}
c.active = !0;
l.markHideNode(c);
var d = a.list[t];
d.moneyId = a.moneyId;
this.idShopItemMap[d.id] = c;
var u = h.genData({
kindId: d.entityId,
count: d.count,
extra: d.extra
}, !0);
c.data = d;
c.getChildByName("item_node").getChildByName("item_item").getComponent("itemItem").update_(u);
c.getChildByName("name_label").getComponent(cc.Label).string = u.name;
c.getChildByName("price_label").getComponent(cc.Label).string = d.price;
var g = c.getChildByName("buy_times_bg_sp").getChildByName("label").getComponent(cc.Label);
o.replaceLabel(g, [ d.buyTimes, d.maxBuyTimes ]);
c.buyTimesLabel = g;
var p = i.findEntityById(a.moneyId);
l.setSpriteFrame(c.getChildByName("money_sp").getComponent(cc.Sprite), r["misc_money_" + p.imgId + "_png"]);
this.timeLabel.active = !1;
var _ = a.end_time - Date.now();
_ = _ < 0 ? 0 : _;
var k = n.duration(_);
if (0 == Math.floor(k.asDays())) {
this.timeLabel.active = !0;
this.timeLabel.getComponent(cc.Label).string = s.t("$1小时后关闭，请尽快兑换", [ k.hours() ]);
}
this.moneyLabel.string = e.moneyCount;
c.getChildByName("buy_bt").data = d;
}
l.hideNodeMap(this.shopItemMap);
},
show_: function() {
l.addPanel(this.node);
this.update_();
},
onClose_: function() {
l.removePanel(this.node);
},
onExchangeBuy_: function(e) {
var a = e.target.data, t = this;
l.addLoading();
u.exchangeBuy(a.id, function(e) {
l.addRewardEffectPanel(e._temp.entityCountMap);
a.buyTimes++;
var n = t.idShopItemMap[a.id];
o.replaceLabel(n.buyTimesLabel, [ a.buyTimes, a.maxBuyTimes ]);
var i = d.player.bag.getItemCount(a.moneyId);
t.moneyLabel.string = i;
});
}
}));
m.genData = function() {
var e = d.player.activity.exchange;
if (!e || !c.ACTIVITY.FUNS.checkOpen(e)) return null;
var a = d.player.bag.getItemCount(e.moneyId), n = !!t.find(e.list, function(e) {
return a >= e.price;
});
return {
exchangeActivity: e,
moneyCount: a,
end_time: e.end_time,
isNeedMark: n
};
};
cc._RF.pop();
}, {
baseView: "baseView",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
skillItem: "skillItem",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
