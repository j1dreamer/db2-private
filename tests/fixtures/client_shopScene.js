shopScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "d338eUJZohDvof8TN5InIyY", "shopScene");
var t = e("underscore"), n = (e("http"), e("baseView")), i = e("dataApi"), r = (e("guide"), 
e("clientConfig")), s = e("serverConfig"), o = e("serverMain"), l = e("player"), c = e("shopHandler"), d = e("bagHandler"), h = e("i18n"), u = e("helper"), m = e("soundApi"), g = e("resource"), p = e("buildExt"), _ = e("itemItem"), k = e("roleScene"), f = e("sceneManager"), y = s.SHOP.CONSTS, b = cc.Class({
extends: cc.Component,
properties: {
shopBtScrollview: cc.ScrollView,
shopBtItem: cc.Node,
shopBtItemsLayout: cc.Node,
shopItemsScrollview: cc.ScrollView,
shopItem: cc.Node,
shopItemsLayout: cc.Node,
moneyNameLabel: cc.Label,
moneyLabel: cc.Label,
moneySp: cc.Sprite,
refreshBt: cc.Node,
refreshTimeLabel: cc.Label,
buyConfirmPanel: cc.Node,
buyConfirmItemItem: cc.Node,
buyConfirmItemNameLabel: cc.Label,
buyConfirmItemCountLabel: cc.Label,
buyConfirmDescLabel: cc.Label,
buyConfirmBuyCountLabel: cc.Label,
buyConfirmCostCoinLabel: cc.Label,
buyConfirmMoneySp: cc.Sprite,
leftBt: cc.Node,
rightBt: cc.Node,
moreSp: cc.Node,
autoSellPanel: cc.Node,
autoSellItemItems: [ cc.Node ],
autoSellGetCoinLabel: cc.Label
},
statics: {
instance: null
},
onLoad: function() {
b.instance || (b.instance = this);
f.curSceneStatusData = t.extend({
type: y.TYPE.NORMAL
}, f.curSceneStatusData);
this.statusData = f.curSceneStatusData;
this.onFun = this.update_.bind(this);
o.player.on(l.EVENT.ATTRS, this.onFun);
this.shopBtItem.active = !1;
this.shopItem.active = !1;
this.buyConfirmPanel.active = !1;
this.autoSellPanel.active = !1;
this.selectShopItem = null;
cc.tween(this.moreSp).repeatForever(cc.tween().to(1, {
opacity: 0
}).to(1, {
opacity: 150
})).start();
this.update_([ "shop" ]);
},
onDestroy: function() {
o.player.off(l.EVENT.ATTRS, this.onFun);
b.instance = null;
},
update_: function(a) {
if (t.include(a, "shop")) {
var i = b.genData(this.statusData.type);
this.data = i;
var r, l = i.shopTypes;
this.shopBtItemMap = this.shopBtItemMap || {};
n.preHideNodeMap(this.shopBtItemMap);
for (var c in l) {
var d = this.shopBtItemMap[c];
if (!d) {
(d = cc.instantiate(this.shopBtItem)).parent = this.shopBtItemsLayout;
this.shopBtItemMap[c] = d;
}
d.active = !0;
n.markHideNode(d);
d.data = {
type: l[c]
};
d.getComponent(cc.Button).interactable = d.data.type != i.type;
d.data.type == i.type && (r = d);
d.getChildByName("label").getComponent(cc.Label).string = h.t(y.SHOP_TITLE_MAP[l[c]]);
}
n.hideNodeMap(this.shopBtItemMap);
var m = t.indexOf(this.shopBtItemsLayout.children, r) - 0, p = 1 - (m = m < 5 ? 0 : m) / (this.shopBtItemsLayout.children.length - 1);
this.shopBtScrollview.getComponent(cc.ScrollView).scrollToPercentVertical(p, .5);
this.shopItemMap = this.shopItemMap || {};
n.preHideNodeMap(this.shopItemMap);
for (var c in i.shopItems) {
var _ = this.shopItemMap[c];
if (!_) {
(_ = cc.instantiate(this.shopItem)).parent = this.shopItemsLayout;
_.idx = c;
this.shopItemMap[c] = _;
}
_.active = !0;
n.markHideNode(_);
var k = i.shopItems[c];
_.data = k;
_.getChildByName("item_item").getComponent("itemItem").update_(i.shopItems[c].itemItem);
_.getChildByName("name_label").getComponent(cc.Label).string = k.itemName;
_.getChildByName("price_label").getComponent(cc.Label).string = k.price;
var f = _.getChildByName("buy_times_label");
f.active = i.shopItems[c].itemItem.kindId == s.CONSTS.ENTITY_ID.VIP_COIN;
f.active && u.replaceLabel(f.getComponent(cc.Label), [ o.player.vipData.buyMoney112Times - o.player.vip.buyMoney112Times, o.player.vipData.buyMoney112Times ]);
_.getChildByName("sold_out_sp").active = k.isSaleOut;
n.setSpriteFrame(_.getChildByName("money_sp").getComponent(cc.Sprite), g["misc_money_" + k.moneyImgId + "_png"]);
_.getComponent(cc.Button).interactable = !k.isSaleOut;
}
n.hideNodeMap(this.shopItemMap);
this.moneyNameLabel.string = i.moneyName;
this.moneyLabel.string = i.moneyCount;
n.setSpriteFrame(this.moneySp, g["misc_money_" + i.moneyImgId + "_png"]);
this.refreshBt.active = !!y.REFRESH_COST_MONEY_MAP[i.type];
var v = y.REFRESH_HOURS_MAP[i.type], S = new Date(Date._now()).getHours(), T = t.sortedIndex(v, S), M = (T += v[T] == S ? 1 : 0) >= v.length;
T = M ? 0 : T;
this.refreshTimeLabel.string = h.t(M ? h.t("明日$1点") : h.t("今日$1点"), [ v[T] ]);
this.leftBt.active = i.type != t.min(i.shopTypes);
this.rightBt.active = i.type != t.max(i.shopTypes);
this.scheduleOnce(function() {
if (this.data.sellItemInfos.length > 0 && !e("guide").shopIntroduce.run) {
n.addPanel(this.autoSellPanel, !0);
for (var a in this.autoSellItemItems) {
var t = this.data.sellItemInfos[a];
this.autoSellItemItems[a].active = !!t;
if (this.autoSellItemItems[a].active) {
this.autoSellItemItems[a].getChildByName("item_item").getComponent("itemItem").update_(t.itemItem);
var i = this.autoSellItemItems[a].getChildByName("name_label").getComponent(cc.Label);
u.replaceLabel(i, [ t.name, t.count ]);
}
}
this.autoSellGetCoinLabel.string = this.data.sellGetCoin;
}
}, 0);
this.shopItemsScrollview.stopAutoScroll();
this.shopItemsScrollview.scrollToTop(0);
this.shopItemsScrollview.getComponent("listViewComponent").delayUpdate_(.2);
this.onScroll_(this.shopItemsScrollview);
}
},
onShopItem_: function(e) {
this.selectShopItem = e.target;
n.addPanel(this.buyConfirmPanel);
var a = e.target.data;
this.buyConfirmItemItem.getComponent("itemItem").update_(a.itemItem);
this.buyConfirmItemItem.getComponent("itemItem").setCountLabelActive_(!1);
this.buyConfirmItemNameLabel.string = a.itemName;
this.buyConfirmItemCountLabel.string = o.player.bag.getItemCount(a.itemItem.kindId);
this.buyConfirmDescLabel.string = a.itemItem._data.desc;
if (a.itemItem.type == s.CONSTS.ENTITY_TYPE.ARTIFACT) {
var t = a.itemItem._data.starVals[a.itemItem._item.star], r = k.getAttrDesc(a.itemItem._data.effect, t);
this.buyConfirmDescLabel.string = h.t(this.buyConfirmDescLabel.string, [ r.value ]);
} else if (a.itemItem.type == s.CONSTS.ENTITY_TYPE.ARTIFACT_FRAGMENT) {
var l = i.artifact.findOneBy("fragmentId", a.itemItem.kindId);
r = k.getAttrDesc(l.effect);
this.buyConfirmDescLabel.string = h.t(this.buyConfirmDescLabel.string, [ r.value ]);
} else if (a.itemItem.type == s.CONSTS.ENTITY_TYPE.FRUIT_FRAGMENT) {
var c = i.fruit.findBy("fragmentId", a.itemItem.kindId)[0];
r = k.getAttrDesc(c.effect);
this.buyConfirmDescLabel.string = h.t(this.buyConfirmDescLabel.string, [ r.value ]);
}
this.buyConfirmBuyCountLabel.string = a.itemItem.count;
this.buyConfirmCostCoinLabel.string = a.price;
n.setSpriteFrame(this.buyConfirmMoneySp, g["misc_money_" + a.moneyImgId + "_png"]);
},
onRefresh_: function() {
var e = this.data.type, a = s.SHOP.FUNS.getRefreshCost(e, this.data.refreshTimes + 1), t = i.findEntityById(y.REFRESH_MONEY_ID_MAP[e]), r = h.t("是否花费$1个$2刷新商店?", [ a, t.kindName ]);
n.addMessageBox(r, function() {
n.addLoading();
c.refresh(e);
});
},
onSwitch_: function(e, a) {
this.statusData.type += Number(a);
t.include(this.data.shopTypes, this.statusData.type) ? this.update_([ "shop" ]) : this.onSwitch_(e, a);
},
onShop_: function(e) {
var a = e.target.data;
this.statusData.type = a.type;
this.update_([ "shop" ]);
},
onCloseBuyConfirm_: function() {
n.removePanel(this.buyConfirmPanel);
},
onBuy_: function() {
var e = this.selectShopItem.data, a = this;
n.addLoading();
c.buy(e.shopId, function() {
n.removePanel(a.buyConfirmPanel);
m.playEffect(g.sound_effect_item_bought_mp3);
});
},
onSell_: function() {
var e = t.pluck(this.data.sellItemInfos, "idx"), a = t.pluck(this.data.sellItemInfos, "count"), i = this;
n.addLoading();
d.sell(e, a, function() {
n.removePanel(i.autoSellPanel);
m.playEffect(g.sound_effect_item_sold_mp3);
});
},
onScroll_: function(e) {
this.moreSp.active = e.getScrollOffset().y != e.getMaxScrollOffset().y;
}
});
b.Exchange2ItemIds = [ 122, 123, 124 ];
b.genData = function(e) {
e = p.isSimpleShop ? 1 : e;
var a = o.player.shop, n = o.player.bag, l = a.refreshTimesMap[e], c = a.goodsMap[e], d = [];
for (var h in c) {
var u = c[h], m = _.genData({
kindId: u.entityId,
count: u.count
}, !0), g = i.findEntityById(u.moneyId);
if ((!p.isSimpleShop || m.type != s.CONSTS.ENTITY_TYPE.SOUL) && (o.player.activity.exchange2 || !t.include(b.Exchange2ItemIds, u.entityId))) {
var k = {
shopId: h,
itemItem: m,
itemName: m.name,
price: u.price,
moneyImgId: g.imgId,
discount: u.discount || 1,
isSaleOut: u.isSaleOut,
requireVip: u.requireVip,
shopType: u.shopType,
priority: u.priority
};
d.push(k);
}
}
d = t.sortBy(d, function(e) {
return e.priority;
});
var f = n.getItemByType(s.CONSTS.ENTITY_TYPE.TREASURE), v = [], S = 0;
for (var T in f) {
var M = i.findEntityById(f[T].kindId);
v.push({
idx: T,
itemItem: _.genData({
kindId: f[T].kindId
}),
name: M.kindName,
price: M.price,
count: f[T].count
});
S += M.price * f[T].count;
}
var $ = y.REFRESH_MONEY_ID_MAP[e];
switch (e) {
case y.TYPE.VIP:
$ = s.CONSTS.ENTITY_ID.VIP_COIN;
break;

case y.TYPE.ARTIFACT:
$ = s.CONSTS.ENTITY_ID.PRESTIGE_COIN;
break;

case y.TYPE.SIX_PATH:
$ = s.CONSTS.ENTITY_ID.SIX_COIN;
break;

case y.TYPE.STAR_SIGN:
$ = s.CONSTS.ENTITY_ID.STAR_SIGN_COIN;
}
var I = (g = i.findEntityById($)).imgId, C = g.kindName, P = n.getItemCount($), D = t.values(y.TYPE), N = r.CONSTS.UNLOCK_LEVEL;
o.player.level < r.CONSTS.WORSHIP_BATTLE && (D = t.without(D, y.TYPE.SIX_PATH));
p.isHideFruit && (D = t.without(D, y.TYPE.FRUIT));
(o.player.level < N.ISLAND || p.isHideIsLand) && (D = t.without(D, y.TYPE.ISLAND));
D = t.without(D, y.TYPE.TOP_ARENA_3V3);
(o.player.level < N.STAR_SIGN || p.isHideStarSign) && (D = t.without(D, y.TYPE.STAR_SIGN));
return {
type: e,
refreshTimes: l || 0,
shopItems: d,
sellItemInfos: v,
sellGetCoin: S,
moneyName: C,
moneyImgId: I,
moneyCount: P,
shopTypes: D = p.isSimpleShop ? [ 1 ] : D
};
};
cc._RF.pop();
}, {
bagHandler: "bagHandler",
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
http: "http",
i18n: "i18n",
itemItem: "itemItem",
player: "player",
resource: "resource",
roleScene: "roleScene",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
shopHandler: "shopHandler",
soundApi: "soundApi",
underscore: "underscore"
} ],
