discountActivityPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "5ca00RrKl9GdpfOXvzBj8dH", "discountActivityPanel");
var t = e("underscore"), n = (e("underscore.string"), e("moment")), i = (e("soundApi"), 
e("dataApi"), e("resource"), e("i18n")), r = e("helper"), s = e("baseView"), o = (e("clientConfig"), 
e("serverConfig")), l = e("serverMain"), c = (e("skillItem"), e("roleItem"), e("itemItem")), d = e("playerHandler"), h = o.ACTIVITY.CONSTS, u = cc.Class({
extends: cc.Component,
properties: {
timeLabel: cc.Label,
reachLabel: cc.Label,
oldNeedLabel: cc.Label,
needLabel: cc.Label,
itemNodesLayout: cc.Node,
itemNode: cc.Node,
receiveBt: cc.Node
},
onLoad: function() {
this.itemNode.active = !1;
},
update_: function() {
var e = u.genData();
this.data = e;
if (l.tTime(e.endTime) > Date._now()) {
var a = n(l.tTime(e.endTime)).from(Date._now());
r.replaceLabel(this.timeLabel, [ a ]);
} else this.timeLabel.string = i.t("已结束");
r.replaceLabel(this.reachLabel, [ e.reachTopUpMoney ]);
r.replaceLabel(this.oldNeedLabel, [ e.preNeedTopUpMoney ]);
r.replaceLabel(this.needLabel, [ e.needTopUpMoney ]);
this.itemNodeMap = this.itemNodeMap || {};
s.preHideNodeMap(this.itemNodeMap);
for (var t in e.itemItems) {
var o = this.itemNodeMap[t];
if (!o) {
(o = cc.instantiate(this.itemNode)).parent = this.itemNodesLayout;
o.idx = t;
this.itemNodeMap[t] = o;
}
o.active = !0;
s.markHideNode(o);
o.getComponentInChildren("itemItem").update_(e.itemItems[t]);
o.getComponentInChildren("itemItem").setShowPanel_(!0);
o.getChildByName("received_sp").active = e.status == h.STATUS.COMPLETE;
}
s.hideNodeMap(this.itemNodeMap);
this.receiveBt.active = e.status == h.STATUS.CAN_RECEIVE;
},
show_: function() {
s.addPanel(this.node, !0);
this.update_();
},
onClose_: function() {
s.removePanel(this.node);
},
onReceive_: function() {
var e = this;
s.addLoading();
d.receiveActivityAward([ this.data.activityName ], [ this.data.rewardIdx ], function(a) {
s.addRewardEffectPanel(a._temp.entityCountMap);
e.update_();
});
}
});
u.genData = function() {
var e = l.player, a = t.find(t.values(e.activity.map), function(e) {
return e.isDiscount;
});
if (!a || a.isSuccess) return null;
var n = a.reachMap, i = a.rewards[0], r = [];
for (var s in i.dropList) {
var o = i.dropList[s], d = c.genData({
kindId: o.entityId,
count: o.count,
extra: o.extra
}, !0);
r.push(d);
}
var u = t.findWhere(a.rewards, {
status: h.STATUS.CAN_RECEIVE
});
return {
activityName: a.name,
rewardIdx: 0,
desc: i.desc,
itemItems: r,
status: i.status,
preNeedTopUpMoney: i.preNeedTopUpMoney,
needTopUpMoney: i.needMap.topUpMoney,
reachTopUpMoney: n.topUpMoney,
endTime: a.end_time,
isNeedMark: u
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
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
skillItem: "skillItem",
soundApi: "soundApi",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
