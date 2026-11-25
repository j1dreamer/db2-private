diyGiftPackPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "38c01hC5u5Od4V7JP5CK3Ow", "diyGiftPackPanel");
var t = e("underscore"), n = e("underscore.string"), i = e("moment"), r = (e("soundApi"), 
e("dataApi")), s = (e("resource"), e("i18n")), o = e("helper"), l = e("baseView"), c = (e("clientConfig"), 
e("serverConfig")), d = e("serverMain"), h = (e("skillItem"), e("roleItem")), u = e("itemItem"), m = e("topUpPanel"), g = (e("playerHandler"), 
c.ACTIVITY.CONSTS), p = cc.Class({
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
var e = p.genData();
if (e) {
this.data = e;
this.topUpBt.active = !0;
o.replaceLabel(this.timeLabel);
this.roleItemNode.active = !1;
this.itemItem.active = !1;
this.itemItemMap = this.itemItemMap || {};
this.roleItemNodeMap = this.roleItemNodeMap || {};
l.preHideNodeMap(this.itemItemMap);
l.preHideNodeMap(this.roleItemNodeMap);
var a = e.topUpActivity.rewards[0], t = 0, n = 0;
for (var i in a.dropList) {
var d = a.dropList[i];
if (r.findEntityById(d.entityId).type == c.CONSTS.ENTITY_TYPE.ROLE) {
var m = this.roleItemNodeMap[t];
if (!m) {
(m = cc.instantiate(this.roleItemNode)).parent = this.rewardLayout;
m.idx = t;
this.roleItemNodeMap[t] = m;
}
m.active = !0;
l.markHideNode(m);
var g = h.genData({
kindId: d.entityId,
star: d.extra.star
});
m.getChildByName("role_item").getComponent("roleItem").update_(g);
l.addItemEffect(null, m, !0);
t++;
} else {
var _ = this.itemItemMap[n];
if (!_) {
(_ = cc.instantiate(this.itemItem)).parent = this.rewardLayout;
_.idx = n;
this.itemItemMap[n] = _;
}
_.active = !0;
l.markHideNode(_);
_.getComponent("itemItem").setShowPanel_(!0);
var k = u.genData({
kindId: d.entityId,
count: d.count,
extra: d.extra
}, !0);
_.getComponent("itemItem").update_(k);
l.addItemEffect(null, _, !0);
n++;
}
}
l.hideNodeMap(this.itemItemMap);
l.hideNodeMap(this.roleItemNodeMap);
var f = e.goods;
this.topUpBt.data = {
id: f.id,
price: f.price,
priceRate: f.priceRate || 1,
name: s.t(f.name, [ f.gem || f.price ]),
gem: f.gem
};
o.replaceLabel(this.topUpLabel, [ s.t(f.show, [ f.price ]) ]);
l.getBtDiscountNode(this.topUpLabel);
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
} else this.onClose_();
},
tick_: function() {
var e = this.data.topUpActivity.end_time;
if (d.tTime(e) > Date._now()) {
var a = d.tTime(e) - Date._now();
a = a < 0 ? 0 : a;
var t = i.duration(a), n = o.formatDuration(t.hours(), t.minutes(), t.seconds());
o.replaceLabel(this.timeLabel, [ n ]);
} else {
this.timeLabel.string = s.t("已结束");
this.topUpBt.active = !1;
}
},
show_: function() {
l.addPanel(this.node);
this.update_();
},
onTopUp_: function(e, a) {
c.ACTIVITY.FUNS.checkOpen(this.data.topUpActivity, d.player.serverId) ? m.prototype.onGoodsItem_(e, a) : l.addHintPanel(s.t("活动已结束"));
},
onClose_: function() {
l.removePanel(this.node);
}
});
p.genData = function() {
var e = d.player, a = t.find(t.values(e.activity.map), function(e) {
return !!e.diyDurationHours && n.include(e.name, "diyGiftPack_") && e.rewards[0].status != g.STATUS.COMPLETE && c.ACTIVITY.FUNS.checkOpen(e);
});
return !a || a.isSuccess ? null : {
goods: e.extra.goodsList[t.keys(a.rewards[0].needMap)[0].split("_")[1]],
topUpActivity: a
};
};
p.isNeedPop = !0;
cc._RF.pop();
}, {
baseView: "baseView",
clientConfig: "clientConfig",
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
skillItem: "skillItem",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
