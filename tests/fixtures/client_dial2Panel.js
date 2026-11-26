dial2Panel: [ function(e, a) {
"use strict";
cc._RF.push(a, "ca804ov0ApBqIrJseLCiT5K", "dial2Panel");
var t = e("underscore"), n = e("resource"), i = e("baseView"), r = (e("buildExt"), 
e("sceneManager"), e("soundApi")), s = (e("moment"), e("serverConfig")), o = e("serverMain"), l = e("i18n"), c = e("helper"), d = e("topUpPanel"), h = e("playerHandler"), u = e("itemItem"), m = cc.Class({
extends: cc.Component,
properties: {
itemItemsLayout: cc.Node,
lightSp: cc.Node,
pointerSp: cc.Node,
topUpBt: cc.Node,
topUpBtLabel: cc.Label,
canRunTimesLabel: cc.Label,
receivedLayout: cc.Node,
dropViewNode: cc.Node,
dropViewItemsContent: cc.Node,
dropViewItem: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
m.instance || (m.instance = this);
this.lightSp.active = !1;
this.dropViewNode.active = !1;
this.dropViewItem.active = !1;
var e = this.canRunTimesLabel.node.parent;
cc.Tween.stopAllByTarget(e);
cc.tween(e).repeatForever(cc.tween().by(.5, {
position: cc.v2(0, -1.5)
}).by(1, {
position: cc.v2(0, 3)
}).by(.5, {
position: cc.v2(0, -1.5)
})).start();
},
onDestroy: function() {
m.instance = null;
},
update_: function() {
var e = m.genData();
this.data = e;
c.replaceLabel(this.topUpBtLabel, [ this.data.neeedGoods.price ]);
c.replaceLabel(this.canRunTimesLabel, [ this.data.canRunTimes ]);
var a = this.data.neeedGoods;
this.topUpBt.data = {
id: a.id,
price: a.price,
priceRate: a.priceRate || 1,
name: l.t(a.name, [ a.gem || a.price ]),
gem: a.gem,
isNoUsePoint: a.isNoUsePoint
};
for (var n = 0; n < 8; n++) {
var i = this.itemItemsLayout.getChildByName("item_item_" + (n + 1));
i.getComponent("itemItem").update_(e.itemItems[n]);
i.getComponent("itemItem").setShowPanel_(!0);
}
this.receivedLayout.active = !0;
for (n = 0; n < 8; n++) this.receivedLayout.getChildByName("bg_" + (n + 1)).active = t.include(e._dial.payData.receiveIdxs, n);
},
onClose_: function() {
i.removePanel(this.node);
},
onTopUp_: function(e, a) {
this.inAnim || (this.data.canRunTimes <= 0 ? i.addHintPanel(l.t("充值次数已达上限")) : d.prototype.onGoodsItem_(e, a));
},
onStart_: function() {
this.inAnim = !0;
this.lightSp.active = !1;
var e = this;
i.addLoading();
h.rollDial("pay", 1, !1, function(a) {
i.addLoading(null, !1, !0);
r.playEffect(n.sound_effect_dial_mp3);
var s = a._temp.dropList[0], o = t.find(e.data.itemItems, function(e) {
return s.extra && s.extra.id ? e._data.extraId == s.extra.id && e.count == s.count : e.kindId == s.entityId && e.count == s.count;
}), l = t.indexOf(e.data.itemItems, o);
cc.tween(e.pointerSp).to(1, {
angle: -(1080 + 45 * Number(l))
}).call(function() {
e.pointerSp.angle += 1080;
e.lightSp.angle = e.pointerSp.angle;
e.lightSp.active = !0;
}).delay(.5).call(function() {
i.removeLoading();
i.addRewardEffectPanel(a._temp.dropList);
e.inAnim = !1;
e.update_();
}).start();
});
},
onDropView_: function() {
this.dropViewNode.active = !0;
this.dropViewItemMap = this.dropViewItemMap || {};
i.preHideNodeMap(this.dropViewItemMap);
for (var e in this.data.itemItems) {
var a = this.dropViewItemMap[e];
if (!a) {
(a = cc.instantiate(this.dropViewItem)).parent = this.dropViewItemsContent;
a.idx = e;
this.dropViewItemMap[e] = a;
}
a.active = !0;
i.markHideNode(a);
var t = a.getChildByName("item_node");
t.getComponentInChildren("itemItem").update_(this.data.itemItems[e]);
t.getComponentInChildren("itemItem").setShowPanel_(!0);
a.getChildByName("name_label").getComponent(cc.Label).string = this.data.itemItems[e]._data.kindName;
var n = a.getChildByName("rate_label").getComponent(cc.Label);
c.replaceLabel(n, [ this.data.itemItems[e].rate ]);
}
i.hideNodeMap(this.dropViewItemMap);
},
onCloseDropView_: function() {
this.dropViewNode.active = !1;
}
});
m.genData = function() {
var e = o.player.activity.dial, a = e.payDesc;
if (!a) return null;
var t = s.DROP.FUNS.getRandomDropListByDesc(a), n = e.payShowDesc || a, i = s.DROP.FUNS.getRandomDropListByDesc(n), r = 0;
for (var l in t) r += t[l].weight;
var c = [];
for (var l in t) {
var d = u.genData({
kindId: t[l].entityId,
count: t[l].count,
extra: t[l].extra
}, !0);
d.rate = (i[l].weight / r * 100).toFixed(2);
c.push(d);
}
var h = 8 - e.payData.receiveIdxs.length, m = 0 == e.payData.receiveIdxs.length ? e.payFirstRunNeedGoodsId : e.payRunNeedGoodsId, g = m ? o.player.extra.goodsList[m] : null;
e.payData.todayGetFull && (h = 0);
return {
itemItems: c,
canRunTimes: h,
neeedGoods: g,
_dial: e
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
playerHandler: "playerHandler",
resource: "resource",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore"
} ],
