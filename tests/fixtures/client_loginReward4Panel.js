loginReward4Panel: [ function(e, a) {
"use strict";
cc._RF.push(a, "e6dd5nA/VxEWZXna9GBZx5L", "loginReward4Panel");
var t = e("underscore"), n = e("underscore.string"), i = (e("moment"), e("soundApi"), 
e("dataApi")), r = (e("resource"), e("i18n")), s = (e("guide"), e("helper")), o = e("baseView"), l = (e("clientConfig"), 
e("serverConfig")), c = e("serverMain"), d = (e("player"), e("skillItem"), e("roleItem")), h = e("itemItem"), u = e("topUpPanel"), m = (e("buildExt"), 
e("playerHandler"), l.ACTIVITY.CONSTS), g = cc.Class({
extends: cc.Component,
properties: {
rewardContent: cc.Node,
rewardItem: cc.Node,
rewardRoleNode: cc.Node,
rewardItemNode: cc.Node,
buyAllBt: cc.Node
},
onLoad: function() {
this.rewardItem.active = !1;
this.rewardRoleNode.active = !1;
this.rewardItemNode.active = !1;
},
update_: function() {
var e = g.genData();
this.data = e;
this.rewardItemMap = this.rewardItemMap || {};
o.preHideNodeMap(this.rewardItemMap);
for (var a in e.activityItem.rewards) {
var n = e.activityItem.rewards[a];
if (!n.isBuyAll) {
var u = this.rewardItemMap[a];
if (!u) {
(u = cc.instantiate(this.rewardItem)).parent = this.rewardContent;
u.idx = a;
this.rewardItemMap[a] = u;
}
u.active = !0;
o.markHideNode(u);
var p = u.getChildByName("reward_layout");
u.itemNodeMap = u.itemNodeMap || {};
o.preHideNodeMap(u.itemNodeMap);
u.roleItemNodeMap = u.roleItemNodeMap || {};
o.preHideNodeMap(u.roleItemNodeMap);
var _ = 0, k = 0, f = n.status == m.STATUS.COMPLETE;
for (var y in n.dropList) {
var b = n.dropList[y];
if (i.findEntityById(b.entityId).type == l.CONSTS.ENTITY_TYPE.ROLE) {
var v = u.roleItemNodeMap[_];
if (!v) {
(v = cc.instantiate(this.rewardRoleNode)).parent = p;
v.idx = _;
u.roleItemNodeMap[_] = v;
}
v.active = !0;
o.markHideNode(v);
var S = d.genData({
kindId: b.entityId,
star: b.extra.star
});
v.getChildByName("role_item").getComponent("roleItem").update_(S);
o.addItemEffect(null, v, !f);
v.getChildByName("received_sp").active = f;
_++;
} else {
var T = u.itemNodeMap[k];
if (!T) {
(T = cc.instantiate(this.rewardItemNode)).parent = p;
T.idx = k;
u.itemNodeMap[k] = T;
}
T.active = !0;
o.markHideNode(T);
T.getComponentInChildren("itemItem").setShowPanel_(!0);
var M = h.genData({
kindId: b.entityId,
count: b.count,
extra: b.extra
}, !0);
T.getComponentInChildren("itemItem").update_(M);
o.addItemEffect(null, T, !f);
T.getChildByName("received_sp").active = f;
k++;
}
}
o.hideNodeMap(u.itemNodeMap);
o.hideNodeMap(u.roleItemNodeMap);
var $ = t.keys(n.needMap)[0], I = c.player.extra.goodsList[$.split("_")[1]], C = u.getChildByName("buy_bt");
C.data = {
id: I.id,
price: I.price,
priceRate: I.priceRate || 1,
name: r.t(I.name, [ I.gem || I.price ]),
gem: I.gem,
isNoUsePoint: I.isNoUsePoint
};
C.active = !f;
(D = C.getChildByName("price_label").getComponent(cc.Label)).string = r.t(I.show, [ I.price ]);
o.getBtDiscountNode(D);
var P = u.getChildByName("buy_times_label").getComponent(cc.Label);
s.replaceLabel(P, [ n.buyTimes || 0, n.buyMaxTimes ]);
u.getChildByName("complete_sp").active = f;
}
}
o.hideNodeMap(this.rewardItemMap);
this.buyAllBt.active = !!e.buyAllReward;
if (this.buyAllBt.active) {
var D;
$ = t.keys(e.buyAllReward.needMap)[0], I = c.player.extra.goodsList[$.split("_")[1]];
this.buyAllBt.data = {
id: I.id,
price: I.price,
priceRate: I.priceRate || 1,
name: r.t(I.name, [ I.gem || I.price ]),
gem: I.gem,
isNoUsePoint: I.isNoUsePoint
};
(D = this.buyAllBt.getChildByName("price_label").getComponent(cc.Label)).string = r.t(I.show, [ I.price ]);
o.getBtDiscountNode(D);
}
},
show_: function() {
o.addPanel(this.node);
this.update_();
},
onClose_: function() {
o.removePanel(this.node);
},
onBuy_: function(e, a) {
l.ACTIVITY.FUNS.checkOpen(this.data.activityItem, c.player.serverId) ? u.prototype.onGoodsItem_(e, a) : o.addHintPanel(r.t("活动已结束"));
}
});
g.genData = function() {
var e = c.player, a = t.find(t.values(e.activity.map), function(e) {
return n.include(e.name, "daily_ticket");
});
if (!a || a.isSuccess) return null;
var i = !!t.findWhere(a.rewards, {
status: m.STATUS.UN_COMPLETE
}), r = t.findWhere(a.rewards, {
isBuyAll: !0
});
r.status == m.STATUS.COMPLETE && (i = !1);
t.findWhere(a.rewards, {
status: m.STATUS.COMPLETE
}) && (r = null);
return {
activityItem: a,
buyAllReward: r,
isCanBuy: i
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
guide: "guide",
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
