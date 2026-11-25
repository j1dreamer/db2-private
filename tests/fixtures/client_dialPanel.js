dialPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "534a8JQINFNoYtfoDu0+1AA", "dialPanel");
var t = e("underscore"), n = (e("resource"), e("baseView")), i = e("buildExt"), r = e("sceneManager"), s = (e("soundApi"), 
e("moment")), o = e("serverConfig"), l = e("serverMain"), c = e("i18n"), d = e("helper"), h = e("playerHandler"), u = e("rulePanel"), m = e("itemItem"), g = o.ACTIVITY.CONSTS, p = cc.Class({
extends: cc.Component,
properties: {
aboveSp: cc.Sprite,
aboveSpriteFrames: [ cc.SpriteFrame ],
itemItemsLayout: cc.Node,
lightSp: cc.Node,
pointerSp: cc.Node,
pointerSpriteFrames: [ cc.SpriteFrame ],
typeBts: [ cc.Node ],
moneySp: cc.Sprite,
moneyLabel: cc.Label,
moneySpriteFrames: [ cc.SpriteFrame ],
buyTicketBt: cc.Node,
timeNode: cc.Node,
ruleBt: cc.Node,
accessNode: cc.Node,
receivedLayout: cc.Node,
payTipsNode: cc.Node,
dropViewNode: cc.Node,
dropViewItemsContent: cc.Node,
dropViewItem: cc.Node,
countLabel: cc.Label,
chooseBt: cc.Node
},
onLoad: function() {
this.lightSp.active = !1;
for (var e in this.typeBts) {
this.typeBts[e].data = {
type: p.types[e]
};
var a = p.genData(p.types[e]);
this.typeBts[e].active = !!a;
this.typeBts[e].active && n.setMark(this.typeBts[e], a.isNeedMark);
}
this.accessNode.active = !1;
this.dropViewNode.active = !1;
this.dropViewItem.active = !1;
this.isDialTen = !1;
this.moneySp.node.on(cc.Node.EventType.TOUCH_START, this.onShowPanel_, this);
this.moneySp.node.on(cc.Node.EventType.TOUCH_END, this.onShowPanel_, this);
this.moneySp.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onShowPanel_, this);
},
update_: function(e) {
this.selectType = e;
var a = p.genData(e);
this.data = a;
var i = "pay" == e;
for (var r in this.typeBts) {
var s = p.genData(p.types[r]);
this.typeBts[r].active && n.setMark(this.typeBts[r], s.isNeedMark);
}
this.receivedLayout.active = i;
this.payTipsNode.active = i;
if (i) {
for (r = 0; r < 8; r++) this.receivedLayout.getChildByName("bg_" + (r + 1)).active = t.include(a._dial.payData.receiveIdxs, r);
var o = this.payTipsNode.getChildByName("desc_label").getComponent(cc.Label), l = a._dial.payData.todayTopUpMoney, c = a._dial.payGetTicketNeedMoney;
d.replaceLabel(o, [ l, c ]);
}
for (r = 0; r < 8; r++) {
var h = this.itemItemsLayout.getChildByName("item_item_" + (r + 1));
h.getComponent("itemItem").update_(a.itemItems[r]);
h.getComponent("itemItem").setShowPanel_(!0);
}
t.each(this.typeBts, function(a) {
a.getComponent(cc.Button).interactable = a.data.type != e;
a.getChildByName("select_sp").active = a.data.type == e;
});
var u = t.indexOf(p.types, e);
this.aboveSp.spriteFrame = this.aboveSpriteFrames[u];
this.pointerSp.getComponent(cc.Sprite).spriteFrame = this.pointerSpriteFrames[u];
this.moneySp.spriteFrame = this.moneySpriteFrames[u];
this.buyTicketBt.active = !i;
this.timeNode.active = !!this.data.shenEndTime;
d.replaceLabel(this.moneyLabel, [ a.haveTicketCount ]);
this.chooseBt.active = !i;
this.ruleBt.active = i;
if (i) this.isDialTen = !1; else {
this.isDialTen = !this.isDialTen;
this.onChooseTen_();
}
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
tick_: function() {
if (this.timeNode.active) {
var e = this.data.shenEndTime, a = this.timeNode.getComponentInChildren(cc.RichText);
if (-1 != e) if (e < Date.now()) d.replaceLabel(a, [ "", c.t("活动已结束") ]); else {
var t = s.duration(e - Date.now()), n = Math.floor(t.asDays()), i = d.formatDuration(t.hours(), t.minutes(), t.seconds());
n > 0 && (i = c.t("$1天$2小时", [ n, t.hours() ]));
d.replaceLabel(a, [ c.t("结束时间:"), i ]);
} else d.replaceLabel(a, [ c.t("结束时间:"), c.t("永久") ]);
}
},
onClose_: function() {
n.removePanel(this.node);
},
onAccess_: function() {
this.accessNode.active = !this.accessNode.active;
},
onStart_: function() {
if (this.isDialTen) {
var e = this;
n.addLoading();
h.rollDial(this.selectType, 10, !1, function(a) {
n.addRewardEffectPanel(a._temp.dropList);
e.update_(e.selectType);
});
} else {
this.lightSp.active = !1;
e = this;
n.addLoading();
h.rollDial(this.selectType, 1, !1, function(a) {
n.addLoading(null, !1, !0);
var i = a._temp.dropList[0], r = t.find(e.data.itemItems, function(e) {
return i.extra && i.extra.id ? e._data.extraId == i.extra.id && e.count == i.count : e.kindId == i.entityId && e.count == i.count;
}), s = t.indexOf(e.data.itemItems, r);
cc.tween(e.pointerSp).to(1, {
angle: -(1080 + 45 * Number(s))
}).call(function() {
e.pointerSp.angle += 1080;
e.lightSp.angle = e.pointerSp.angle;
e.lightSp.active = !0;
}).delay(.5).call(function() {
n.removeLoading();
n.addRewardEffectPanel(a._temp.dropList);
e.update_(e.selectType);
}).start();
});
}
},
onSwitch_: function(e, a) {
this.update_(a);
},
onChooseTen_: function() {
this.isDialTen = !this.isDialTen;
this.chooseBt.getChildByName("select_sp").active = this.isDialTen;
this.countLabel.getComponent(cc.Label).string = c.t(this.isDialTen ? 10 : 1);
},
onDropView_: function() {
this.dropViewNode.active = !0;
this.dropViewItemMap = this.dropViewItemMap || {};
n.preHideNodeMap(this.dropViewItemMap);
for (var e in this.data.itemItems) {
var a = this.dropViewItemMap[e];
if (!a) {
(a = cc.instantiate(this.dropViewItem)).parent = this.dropViewItemsContent;
a.idx = e;
this.dropViewItemMap[e] = a;
}
a.active = !0;
n.markHideNode(a);
var t = a.getChildByName("item_node");
t.getComponentInChildren("itemItem").update_(this.data.itemItems[e]);
t.getComponentInChildren("itemItem").setShowPanel_(!0);
a.getChildByName("name_label").getComponent(cc.Label).string = this.data.itemItems[e]._data.kindName;
var i = a.getChildByName("rate_label").getComponent(cc.Label);
d.replaceLabel(i, [ this.data.itemItems[e].rate ]);
}
n.hideNodeMap(this.dropViewItemMap);
},
onCloseDropView_: function() {
this.dropViewNode.active = !1;
},
onGoTo_: function(a, t) {
var s = e("homeScene");
switch (Number(t)) {
case 0:
i.isSimpleMap ? r.pushScene(r.NAME.MMAP_SCENE, {
type: 1,
bmapRankId: 1
}) : r.pushScene(r.NAME.BMAP_SCENE);
break;

case 1:
n.addDailyTaskPanel();
break;

case 2:
s.instance.onActivity_("dailyTopUp_1");
break;

case 3:
s.instance.onActivity_("weeklyTopUp_1");
break;

case 4:
s.instance.onActivity_("monthlyTopUp_1");
break;

case 5:
var o = l.player.activity.map.task_active || l.player.activity.map.task_active2;
if (!o) {
n.addHintPanel(c.t("活动还未开启"));
return;
}
s.instance.onActivity_(o.name);
break;

case 6:
s.instance.onActivity_("packActivity");
}
this.accessNode.active = !1;
n.removePanel(this.node);
},
onShowPanel_: function(e) {
var a = {
kindId: 0,
count: this.moneyLabel.string,
extra: null
};
switch (this.selectType) {
case "luck":
a.kindId = 113;
break;

case "vip":
a.kindId = 114;
break;

case "svip":
a.kindId = 117;
break;

case "shen":
a.kindId = 89;
break;

case "pay":
a.kindId = 88;
}
console.log("点击了货币", a);
switch (e.type) {
case cc.Node.EventType.TOUCH_START:
this.entityPanel = n.addEntityPanel(a);
console.log("点击了：", a);
var t = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
(t = this.entityPanel.parent.convertToNodeSpaceAR(t)).y += .5 * this.entityPanel.height + .5 * this.node.height;
var i = cc.winSize.width / 2 - this.entityPanel.width / 2, r = t.x > 0 ? 1 : -1, s = Math.abs(t.x) > i ? i * r : t.x, o = cc.winSize.height / 2 - this.entityPanel.height / 2, l = t.y > 0 ? 1 : -1, c = Math.abs(t.y) > o ? o * l : t.y;
this.entityPanel.position = cc.v2(s, c);
var d = t.y + .5 * this.entityPanel.height + .5 * cc.winSize.height - (cc.winSize.height - 5), h = t.y + .5 * cc.winSize.height - .5 * this.entityPanel.height;
d > 0 && (this.entityPanel.y -= d);
h < 0 && (this.entityPanel.y += Math.abs(h));
break;

case cc.Node.EventType.TOUCH_CANCEL:
case cc.Node.EventType.TOUCH_END:
this.entityPanel && (this.entityPanel.active = !1);
}
},
onRule_: function() {
n.addRulePanel(u.TYPE.DIAL_PAY);
}
});
p.types = t.keys(g.DIAL_COST_ID_MAP);
p.genData = function(e) {
var a = l.player.activity.dial;
if (i.isPayDialNew && "pay" == e) return null;
var t = a[e + "Desc"];
if (!t) return null;
var n = o.DROP.FUNS.getRandomDropListByDesc(t), r = a[e + "ShowDesc"] || t, s = o.DROP.FUNS.getRandomDropListByDesc(r), c = 0;
for (var d in n) c += n[d].weight;
var h = [];
for (var d in n) {
var u = m.genData({
kindId: n[d].entityId,
count: n[d].count,
extra: n[d].extra
}, !0);
u.rate = (s[d].weight / c * 100).toFixed(2);
h.push(u);
}
var p = "shen" == e && a.shenEndTime;
if (p && Date.now() > p) return null;
var _ = l.player.bag.getItemCount(g.DIAL_COST_ID_MAP[e]);
return {
itemItems: h,
shenEndTime: p,
haveTicketCount: _,
isNeedMark: _ > 0,
_dial: a
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
playerHandler: "playerHandler",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
