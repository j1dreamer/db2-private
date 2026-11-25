returnGift2Panel: [ function(e, a) {
"use strict";
cc._RF.push(a, "3b016iFz69IM6glgBNTITgT", "returnGift2Panel");
var t = e("underscore"), n = (e("underscore.string"), e("moment"), e("soundApi"), 
e("dataApi"), e("resource"), e("i18n")), i = e("helper"), r = e("baseView"), s = (e("clientConfig"), 
e("serverConfig")), o = e("serverMain"), l = (e("skillItem"), e("roleItem"), e("itemItem")), c = e("playerHandler"), d = s.ACTIVITY.CONSTS, h = cc.Class({
extends: cc.Component,
properties: {
reachRichText: cc.RichText,
needLabel: cc.Label,
rightScrollview: cc.ScrollView,
btItem: cc.Node,
itemNodesLayout: cc.Node,
itemNode: cc.Node,
receiveBt: cc.Node
},
onLoad: function() {
this.btItem.active = !1;
this.itemNode.active = !1;
},
update_: function() {
var e = h.genData();
this.data = e;
this.btItemMap = this.btItemMap || {};
r.preHideNodeMap(this.btItemMap);
this.btItems = [];
for (var a in e.rewardItems) {
var t = this.btItemMap[a];
if (!t) {
(t = cc.instantiate(this.btItem)).parent = this.rightScrollview.content;
this.btItemMap[a] = t;
}
t.active = !0;
r.markHideNode(t);
var n = e.rewardItems[a];
t.data = n;
t.getChildByName("label").getComponent(cc.Label).string = n.desc;
t.getChildByName("select_label").getComponent(cc.Label).string = n.desc;
r.setMark(t, n.status == d.STATUS.CAN_RECEIVE);
this.btItems.push(t);
}
r.hideNodeMap(this.btItemMap);
},
show_: function() {
r.addPanel(this.node, !1, !1, !0);
this.update_();
this.onBtItem_({
target: this.btItems[0]
});
},
onClose_: function() {
r.removePanel(this.node);
},
onBtItem_: function(e) {
var a = e.target, s = a.data;
t.each(this.btItems, function(e) {
e.getChildByName("label").active = !0;
e.getChildByName("select_label").active = !1;
e.getComponent(cc.Button).interactable = !0;
});
a.getChildByName("label").active = !1;
a.getChildByName("select_label").active = !0;
a.getComponent(cc.Button).interactable = !1;
switch (s.needKey) {
case "loginDays":
i.replaceLabel(this.reachRichText, [ n.t("累计登录"), n.t("$1天", [ s.reachValue ]) ]);
i.replaceLabel(this.needLabel, [ n.t("累计登录$1天", [ s.needVal ]) ]);
break;

case "topUpGem":
i.replaceLabel(this.reachRichText, [ n.t("累计充值"), n.t("$1钻石", [ s.reachValue ]) ]);
i.replaceLabel(this.needLabel, [ n.t("累计充值$1钻石", [ s.needVal ]) ]);
break;

case "roleGroup4Count":
case "roleGroup5Count":
case "haveArtifactStar10Count":
i.replaceLabel(this.reachRichText, [ n.t("拥有"), n.t("$1个", [ s.reachValue ]) ]);
i.replaceLabel(this.needLabel, [ s.desc ]);
}
this.itemNodeMap = this.itemNodeMap || {};
r.preHideNodeMap(this.itemNodeMap);
for (var o in s.itemItems) {
var l = this.itemNodeMap[o];
if (!l) {
(l = cc.instantiate(this.itemNode)).parent = this.itemNodesLayout;
l.idx = o;
this.itemNodeMap[o] = l;
}
l.active = !0;
r.markHideNode(l);
l.getComponentInChildren("itemItem").update_(s.itemItems[o]);
l.getComponentInChildren("itemItem").setShowPanel_(!0);
l.getChildByName("received_sp").active = s.status == d.STATUS.COMPLETE;
}
r.hideNodeMap(this.itemNodeMap);
this.receiveBt.active = s.status == d.STATUS.CAN_RECEIVE;
this.selectBtItem = a;
},
onReceive_: function() {
var e = this;
r.addLoading();
c.receiveActivityAward([ this.data.activityName ], [ this.selectBtItem.data.rewardIdx ], function(a) {
r.addRewardEffectPanel(a._temp.entityCountMap);
e.update_();
e.onBtItem_({
target: e.selectBtItem
});
});
}
});
h.genData = function() {
var e = o.player, a = t.findWhere(t.values(e.activity.map), {
name: "returnGift2"
});
if (!a || a.isSuccess) return null;
var i = a.reachMap, r = [];
for (var s in a.rewards) {
var c = a.rewards[s], h = t.keys(c.needMap)[0], u = t.values(c.needMap)[0], m = {
rewardIdx: s,
desc: n.t(c.desc, [ u ]),
itemItems: [],
status: c.status,
needKey: h,
needVal: u,
reachValue: i[h]
};
for (var s in c.dropList) {
var g = c.dropList[s], p = l.genData({
kindId: g.entityId,
count: g.count,
extra: g.extra
}, !0);
m.itemItems.push(p);
}
r.push(m);
}
var _ = t.findWhere(a.rewards, {
status: d.STATUS.CAN_RECEIVE
});
return {
activityName: a.name,
rewardItems: r,
isNeedMark: _
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
