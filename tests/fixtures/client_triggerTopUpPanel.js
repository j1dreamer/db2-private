triggerTopUpPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "4d32bI+mIVKNqk0bzl+0104", "triggerTopUpPanel");
var t = e("underscore"), n = e("baseView"), i = (e("underscore.string"), e("clientConfig"), 
e("serverConfig")), r = e("i18n"), s = e("helper"), o = e("dataApi"), l = e("serverMain"), c = (e("buildExt"), 
e("coinTopNode"), e("resource"), e("moment")), d = e("roleItem"), h = e("itemItem"), u = e("topUpPanel"), m = (e("playerHandler"), 
i.ACTIVITY.CONSTS), g = cc.Class({
extends: cc.Component,
properties: {
rewardLayout: cc.Node,
roleItemNode: cc.Node,
itemItem: cc.Node,
timeLabel: cc.Label,
topUpBt: cc.Node,
topUpLabel: cc.Label
},
update_: function() {
var e = g.genData();
if (e) {
this.data = e;
this.topUpBt.active = !0;
s.replaceLabel(this.timeLabel);
this.roleItemNode.active = !1;
this.itemItem.active = !1;
this.itemItemMap = this.itemItemMap || {};
this.roleItemNodeMap = this.roleItemNodeMap || {};
n.preHideNodeMap(this.itemItemMap);
n.preHideNodeMap(this.roleItemNodeMap);
var a = e.topUpActivity.rewards[0], t = 0, l = 0;
for (var c in a.dropList) {
var u = a.dropList[c];
if (o.findEntityById(u.entityId).type == i.CONSTS.ENTITY_TYPE.ROLE) {
var m = this.roleItemNodeMap[t];
if (!m) {
(m = cc.instantiate(this.roleItemNode)).parent = this.rewardLayout;
m.idx = t;
this.roleItemNodeMap[t] = m;
}
m.active = !0;
n.markHideNode(m);
var p = d.genData({
kindId: u.entityId,
star: u.extra.star
});
m.getChildByName("role_item").getComponent("roleItem").update_(p);
n.addItemEffect(null, m, !0);
t++;
} else {
var _ = this.itemItemMap[l];
if (!_) {
(_ = cc.instantiate(this.itemItem)).parent = this.rewardLayout;
_.idx = l;
this.itemItemMap[l] = _;
}
_.active = !0;
n.markHideNode(_);
_.getComponent("itemItem").setShowPanel_(!0);
var k = h.genData({
kindId: u.entityId,
count: u.count,
extra: u.extra
}, !0);
_.getComponent("itemItem").update_(k);
n.addItemEffect(null, _, !0);
l++;
}
}
n.hideNodeMap(this.itemItemMap);
n.hideNodeMap(this.roleItemNodeMap);
var f = e.goods;
this.topUpBt.data = {
id: f.id,
price: f.price,
priceRate: f.priceRate || 1,
name: r.t(f.name, [ f.gem || f.price ]),
gem: f.gem
};
s.replaceLabel(this.topUpLabel, [ r.t(f.show, [ f.price ]) ]);
n.getBtDiscountNode(this.topUpLabel);
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
} else this.onClose_();
},
onClose_: function() {
n.removePanel(this.node);
},
onTopUp_: function(e, a) {
i.ACTIVITY.FUNS.checkOpen(this.data.topUpActivity, l.player.serverId) ? u.prototype.onGoodsItem_(e, a) : n.addHintPanel(r.t("活动已结束"));
},
tick_: function() {
var e = this.data.topUpActivity.end_time;
if (l.tTime(e) > Date._now()) {
var a = l.tTime(e) - Date._now();
a = a < 0 ? 0 : a;
var t = c.duration(a), n = s.formatDuration(t.hours(), t.minutes(), t.seconds());
s.replaceLabel(this.timeLabel, [ n ]);
} else {
this.timeLabel.string = r.t("已结束");
this.topUpBt.active = !1;
}
}
});
g.genData = function() {
var e = l.player, a = e.activity.map.triggerTopUp;
return !a || a.isSuccess || a.rewards[0].status == m.STATUS.COMPLETE ? null : {
goods: e.extra.goodsList[t.keys(a.rewards[0].needMap)[0].split("_")[1]],
topUpActivity: a,
isExpire: Date._now() > l.tTime(a.end_time)
};
};
g.isNeedPop = !0;
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
