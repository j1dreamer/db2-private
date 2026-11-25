exchange2Panel: [ function(e, a) {
"use strict";
cc._RF.push(a, "fa996UR0thMbqIzUaNQ0teN", "exchange2Panel");
var t = e("underscore"), n = e("baseView"), i = (e("underscore.string"), e("moment")), r = (e("clientConfig"), 
e("serverConfig")), s = e("i18n"), o = e("helper"), l = e("dataApi"), c = e("serverMain"), d = (e("buildExt"), 
e("coinTopNode"), e("resource"), e("roleItem")), h = e("itemItem"), u = (e("topUpPanel"), 
e("playerHandler")), m = cc.Class({
extends: cc.Component,
properties: {
exchangeItemsLayout: cc.Node,
exchangeItem: cc.Node,
timeLabel: cc.Label
},
update_: function() {
var e = m.genData();
this.data = e;
this.exchangeItem.active = !1;
this.exchangeItemMap = this.exchangeItemMap || {};
n.preHideNodeMap(this.exchangeItemMap);
for (var a in e.exchangeItems) {
var t = this.exchangeItemMap[a];
if (!t) {
(t = cc.instantiate(this.exchangeItem)).parent = this.exchangeItemsLayout;
t.idx = a;
this.exchangeItemMap[a] = t;
}
t.active = !0;
n.markHideNode(t);
for (var i = e.exchangeItems[a], s = t.getChildByName("need_items"), c = 0; c < 3; c++) {
var u = s.getChildByName("item_" + (c + 1)), g = i.needItemIds[c];
u.active = !!g;
if (u.active) {
var p = u.getChildByName("role_node"), _ = u.getChildByName("item_node");
p.active = !1;
_.active = !1;
if ((T = l.findEntityById(g)).type == r.CONSTS.ENTITY_TYPE.ROLE) {
p.active = !0;
var k = d.genData({
kindId: g
});
p.getChildByName("role_item").getComponent("roleItem").update_(k);
} else {
_.active = !0;
var f = h.genData({
kindId: g
});
_.getChildByName("item_item").getComponent("itemItem").update_(f);
_.getChildByName("item_item").getComponent("itemItem").setShowPanel_(!0);
}
var y = u.getChildByName("count_label"), b = i.needItemCounts[c], v = i.haveItemCounts[c];
y.preColor = y.preColor || y.color;
y.color = b > v ? cc.Color.RED : y.preColor;
o.replaceLabel(y.getComponent(cc.Label), [ v, b ]);
}
}
var S = t.getChildByName("get_item");
p = S.getChildByName("role_node"), _ = S.getChildByName("item_node");
p.active = !1;
_.active = !1;
var T, M = i.getItem;
if ((T = l.findEntityById(M.entityId)).type == r.CONSTS.ENTITY_TYPE.ROLE) {
p.active = !0;
k = d.genData({
kindId: M.entityId,
count: M.count,
star: M.extra.star
});
p.getChildByName("role_item").getComponent("roleItem").update_(k);
} else {
_.active = !0;
f = h.genData({
kindId: M.entityId,
count: M.count,
extra: M.extra
}, !0);
_.getChildByName("item_item").getComponent("itemItem").update_(f);
_.getChildByName("item_item").getComponent("itemItem").setShowPanel_(!0);
}
var $ = S.getChildByName("name_label");
$.preColor = $.preColor || $.color;
$.color = i.buyTimes == i.maxBuyTimes ? cc.Color.RED : $.preColor;
$.getComponent(cc.Label).string = T.kindName;
t.getChildByName("buy_bt").data = i;
var I = t.getChildByName("buy_times_bg_sp").getChildByName("label").getComponent(cc.Label);
o.replaceLabel(I, [ i.buyTimes, i.maxBuyTimes ]);
}
n.hideNodeMap(this.exchangeItemMap);
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
onExchangeBuy_: function(e) {
var a = e.target.data, t = this;
n.addLoading();
u.exchange2Buy(a.id, function(e) {
n.addRewardEffectPanel(e._temp.entityCountMap);
t.update_();
});
},
onClose_: function() {
n.removePanel(this.node);
},
tick_: function() {
var e, a = this.data.end_time;
if (a > Date.now()) {
var t = a - Date.now();
t = t < 0 ? 0 : t;
var n = i.duration(t), r = Math.floor(n.asDays());
e = o.formatDuration(n.hours(), n.minutes(), n.seconds());
r > 0 && (e = s.t("$1天$2", [ r, e ]));
o.replaceLabel(this.timeLabel, [ e ]);
} else {
e = s.t("已结束");
this.timeLabel.string = e;
}
}
});
m.genData = function() {
var e = c.player, a = e.activity.exchange2;
if (!a || !r.ACTIVITY.FUNS.checkOpen(a)) return null;
var n = [];
for (var i in a.list) {
var s = a.list[i], o = r.DROP.FUNS.getDropListByDesc(s.getDesc)[0], l = {
id: s.id,
getItem: o,
needItemIds: [],
needItemCounts: [],
haveItemCounts: [],
isCanExchange: !0,
buyTimes: s.buyTimes,
maxBuyTimes: s.maxBuyTimes
}, d = r.DROP.FUNS.getDropListByDesc(s.needDesc);
for (var h in d) {
var u = d[h];
l.needItemIds.push(u.entityId);
l.needItemCounts.push(u.count);
var m = e.bag.getItemCount(u.entityId);
l.haveItemCounts.push(m);
m < u.count && (l.isCanExchange = !1);
}
n.push(l);
}
var g = !!t.findWhere(n, {
isCanExchange: !0
});
return {
exchangeItems: n,
end_time: a.end_time,
isNeedMark: g
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
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
