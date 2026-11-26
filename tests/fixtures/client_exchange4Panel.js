exchange4Panel: [ function(e, a) {
"use strict";
cc._RF.push(a, "34801GjU+5Er59JsGI9xzE0", "exchange4Panel");
e("underscore");
var t = e("baseView"), n = (e("underscore.string"), e("moment"), e("clientConfig"), 
e("serverConfig")), i = (e("i18n"), e("helper")), r = (e("dataApi"), e("serverMain")), s = (e("buildExt"), 
e("coinTopNode"), e("resource")), o = (e("roleItem"), e("itemItem")), l = (e("soundApi"), 
e("playerHandler")), c = cc.Class({
extends: cc.Component,
properties: {
exchangeItemsLayout: cc.Node,
exchangeItem: cc.Node,
haveMoneyLabel: cc.Label
},
update_: function() {
var e = c.genData();
this.data = e;
this.exchangeItem.active = !1;
this.exchangeItemMap = this.exchangeItemMap || {};
t.preHideNodeMap(this.exchangeItemMap);
for (var a in e.exchangeItems) {
var n = this.exchangeItemMap[a];
if (!n) {
(n = cc.instantiate(this.exchangeItem)).parent = this.exchangeItemsLayout;
n.idx = a;
this.exchangeItemMap[a] = n;
}
n.active = !0;
t.markHideNode(n);
var r = e.exchangeItems[a], o = r.buyTimes == r.maxBuyTimes, l = n.getChildByName("buy_times_label");
l.preColor = l.preColor || l.color;
l.color = o ? cc.Color.RED : l.preColor;
i.replaceLabel(l.getComponent(cc.Label), [ r.buyTimes, r.maxBuyTimes ]);
var d = n.getChildByName("item_item").getComponent("itemItem");
d.update_(r.itemItem);
d.setShowPanel_(!0);
n.getChildByName("name_label").getComponent(cc.Label).string = r.itemItem.name;
var h = n.getChildByName("money_sp").getComponent(cc.Sprite);
t.setSpriteFrame(h, s["misc_money_" + e.moneyImgId + "_png"]);
n.getChildByName("price_label").getComponent(cc.Label).string = r.price;
var u = n.getChildByName("buy_bt");
u.data = r;
t.setGray(u, !o);
u.getComponent(cc.Button).interactable = !o;
}
t.hideNodeMap(this.exchangeItemMap);
this.haveMoneyLabel.string = e.haveMoney;
},
show_: function() {
t.addPanel(this.node, !1, !1, !0);
this.update_();
},
onClose_: function() {
t.removePanel(this.node);
},
onExchangeBuy_: function(e) {
var a = e.target.data, n = this;
t.addLoading();
l.exchange4Buy(a.id, function(e) {
t.addRewardEffectPanel(e._temp.entityCountMap);
n.update_();
});
}
});
c.genData = function() {
var e = r.player, a = e.activity.exchange4;
if (!a || !n.ACTIVITY.FUNS.checkOpen(a)) return null;
var t = [];
for (var i in a.list) {
var s = a.list[i], l = o.genData({
kindId: s.entityId,
count: s.count,
extra: s.extra
}, !0), c = {
id: s.id,
itemItem: l,
price: s.price,
buyTimes: s.buyTimes,
maxBuyTimes: s.maxBuyTimes
};
t.push(c);
}
var d = e.bag.getItemCount(a.moneyId);
return {
exchangeItems: t,
moneyImgId: a.moneyId,
haveMoney: d
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
moment: "moment",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
