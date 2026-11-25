loginRewardPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "17ed23Q+YlAyIaeKlYCGbQp", "loginRewardPanel");
var t = e("underscore"), n = e("baseView"), i = (e("underscore.string"), e("guide")), r = (e("clientConfig"), 
e("serverConfig")), s = (e("i18n"), e("helper")), o = e("dataApi"), l = e("serverMain"), c = (e("buildExt"), 
e("coinTopNode"), e("resource"), e("roleItem")), d = e("itemItem"), h = (e("topUpPanel"), 
e("playerHandler")), u = r.ACTIVITY.CONSTS, m = cc.Class({
extends: cc.Component,
properties: {
daysRewardLayout: cc.Node,
daysRewardItem: cc.Node
},
update_: function(e) {
var a = m.genData(e);
this.data = a;
this.daysRewardItem.active = !1;
this.daysRewardItemMap = this.daysRewardItemMap || {};
n.preHideNodeMap(this.daysRewardItemMap);
for (var t in a.login8day.rewards) {
var i = this.daysRewardItemMap[t];
if (!i) {
(i = cc.instantiate(this.daysRewardItem)).parent = this.daysRewardLayout;
i.idx = t;
this.daysRewardItemMap[t] = i;
}
i.active = !0;
n.markHideNode(i);
var l = i.getChildByName("reward_layout"), h = l.roleItemNode || l.getChildByName("role_item_node"), g = l.itemItem || l.getChildByName("item_item");
h.active = !1;
g.active = !1;
l.roleItemNode = h;
l.itemItem = g;
i.itemItemMap = i.itemItemMap || {};
n.preHideNodeMap(i.itemItemMap);
i.roleItemNodeMap = i.roleItemNodeMap || {};
n.preHideNodeMap(i.roleItemNodeMap);
var p = a.login8day.rewards[t], _ = 0, k = 0, f = p.status == u.STATUS.COMPLETE;
for (var y in p.dropList) {
var b = p.dropList[y];
if (o.findEntityById(b.entityId).type == r.CONSTS.ENTITY_TYPE.ROLE) {
var v = i.roleItemNodeMap[_];
if (!v) {
(v = cc.instantiate(h)).parent = l;
v.idx = _;
i.roleItemNodeMap[_] = v;
}
v.active = !0;
n.markHideNode(v);
var S = c.genData({
kindId: b.entityId,
star: b.extra.star
});
v.getChildByName("role_item").getComponent("roleItem").update_(S);
n.addItemEffect(null, v, !f);
v.opacity = f ? 127.5 : 255;
_++;
} else {
var T = i.itemItemMap[k];
if (!T) {
(T = cc.instantiate(g)).parent = l;
T.idx = k;
i.itemItemMap[k] = T;
}
T.active = !0;
n.markHideNode(T);
T.getComponent("itemItem").setShowPanel_(!0);
var M = d.genData({
kindId: b.entityId,
count: b.count,
extra: b.extra
}, !0);
T.getComponent("itemItem").update_(M);
n.addItemEffect(b, T, !f);
T.opacity = f ? 127.5 : 255;
k++;
}
}
n.hideNodeMap(i.itemItemMap);
n.hideNodeMap(i.roleItemNodeMap);
l.getComponent(cc.Layout).updateLayout();
l.getComponent("i18nComponent").start();
i.getChildByName("received_sp").active = f;
var $ = i.getChildByName("bottom_sp"), I = $.getChildByName("days_label").getComponent(cc.Label);
s.replaceLabel(I, [ p.needMap.loginDays ]);
$.getChildByName("desc_label").getComponent(cc.Label).string = p.desc;
var C = $.getChildByName("receive_bt");
C.active = p.status == u.STATUS.CAN_RECEIVE;
C.active && !C.data && (C.data = {
activityName: a.login8day.name,
rewardIdx: t
});
}
n.hideNodeMap(this.daysRewardItemMap);
},
onReceive_: function(e) {
var a = e.target.data, i = this;
n.addLoading();
h.receiveActivityAward([ a.activityName ], [ a.rewardIdx ], function(e) {
n.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var r in a) n.addPointRoleEffectNode(a[r]);
}
i.update_(i.data.type);
});
},
onClose_: function() {
n.removePanel(this.node);
i.run([ i.mapBoxReceive ]);
}
});
m.genData = function() {
var e = l.player.activity.map.login8day;
return !e || e.isSuccess ? null : {
login8day: e,
isCanReceive: t.findWhere(e.rewards, {
status: u.STATUS.CAN_RECEIVE
})
};
};
m.isNeedPop = !0;
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
coinTopNode: "coinTopNode",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
