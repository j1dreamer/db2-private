starSignPointPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "89748kaIjREi7JHwPk9rGXg", "starSignPointPanel");
e("underscore");
var t = e("baseView"), n = (e("underscore.string"), e("buildExt"), e("moment")), i = e("serverConfig"), r = e("i18n"), s = e("helper"), o = e("dataApi"), l = e("serverMain"), c = e("soundApi"), d = e("resource"), h = e("roleItem"), u = e("itemItem"), m = e("sceneManager"), g = e("playerHandler"), p = (i.ACTIVITY.CONSTS, 
cc.Class({
extends: cc.Component,
properties: {
ticketSp: cc.Sprite,
ticketCountLabel: cc.Label,
middleSp: cc.Node,
timeTypeLabel: cc.Label,
timeLabel: cc.Label,
pointEffectNode: cc.Node,
bottomNode: cc.Node,
bottomScoreLabel: cc.Label,
bottomBoxProgressBar: cc.ProgressBar,
bottomBoxsContent: cc.Node,
bottomBoxItem: cc.Node,
dropViewNode: cc.Node,
dropViewItemsContent: cc.Node,
dropViewItem: cc.Node
},
onLoad: function() {
this.dropViewNode.active = !1;
this.bottomBoxItem.active = !1;
this.dropViewItem.active = !1;
this.bottomNode.scale = cc.winSize.width > 1200 ? 1 : .9;
this.ticketSp.node.on(cc.Node.EventType.TOUCH_START, this.onShowPanel_, this);
this.ticketSp.node.on(cc.Node.EventType.TOUCH_END, this.onShowPanel_, this);
this.ticketSp.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onShowPanel_, this);
},
update_: function() {
var e = p.genData();
this.data = e;
this.selectPointInfo = e.scorePointStarSign;
this.bottomScoreLabel.string = this.selectPointInfo.score;
var a = this.selectPointInfo.activityItem.costMoneyId;
t.setSpriteFrame(this.ticketSp, d["misc_money_" + a + "_png"]);
this.ticketCountLabel.string = l.player.bag.getItemCount(a);
var n = this.selectPointInfo.activityItem, r = JSON.parse(n.needScoresDesc), s = [];
for (var o in n.boxDropListDescs) s.push(i.DROP.FUNS.getDropListByDesc(n.boxDropListDescs[o]));
this.boxItemMap = this.boxItemMap || {};
t.preHideNodeMap(this.boxItemMap);
var c = 0;
for (var o in r) {
var h = this.boxItemMap[o];
if (!h) {
(h = cc.instantiate(this.bottomBoxItem)).parent = this.bottomBoxsContent;
h.idx = o;
this.boxItemMap[o] = h;
}
h.active = !0;
t.markHideNode(h);
h.x = this.bottomBoxsContent.width / r.length * (Number(o) + 1);
h.data = {
score: r[o],
dropList: s[o],
isCanReceive: this.selectPointInfo.score >= r[o] && !this.selectPointInfo.receivedScoreMap[r[o]]
};
this.selectPointInfo.score >= r[o] && (c = (Number(o) + 1) / r.length);
h.getChildByName("need_score").getComponentInChildren(cc.Label).string = r[o];
var u = !!this.selectPointInfo.receivedScoreMap[r[o]], m = h.getChildByName("box_sp"), g = h.getChildByName("received_sp");
m.active = !u;
t.setMark(m, h.data.isCanReceive);
g.active = u;
}
t.hideNodeMap(this.boxItemMap);
this.bottomBoxProgressBar.progress = c;
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
show_: function(e) {
t.addPanel(this.node, !1, !0, !0);
this.pointEffectNode.active = !1;
this.update_(e);
c.playMusic(d.sound_music_star_sign_mp3);
},
onPoint_: function(e, a) {
var n = this;
if (!this.inAnim) {
var i = function(e) {
n.pointEffectNode.active = !0;
var a = n.pointEffectNode.getComponent(sp.Skeleton);
a.setAnimation(0, "action", !1);
a.setCompleteListener(function() {
e && e();
n.inAnim = !1;
});
}, s = function(e) {
n.middleSp.rotation = 0;
var a = 720 - (n.middleSp.angle - 360 * Math.trunc(n.middleSp.angle / 360));
cc.Tween.stopAllByTarget(n.middleSp);
cc.tween(n.middleSp).by(.6, {
angle: -a
}, {
easing: "quadIn"
}).repeat(3, cc.tween().by(.2, {
angle: -360
})).call(function() {
i && i(function() {
e && e();
n.inAnim = !1;
});
}).by(.6, {
angle: -360
}, {
easing: "quadOut"
}).delay(.2).start();
}, o = this;
t.addLoading();
this.inAnim = !0;
g.scorePoint(this.selectPointInfo.activityName, Number(a), function(e) {
c.playEffect(d.sound_effect_star_sign_point_mp3);
s && s(function() {
t.addRewardPanel(r.t("点击可查看奖励详情"), e._temp.dropList, null, r.t("占星奖励"), !0);
o.update_();
});
});
}
},
onBoxItem_: function(e) {
var a = e.target.data;
if (a.isCanReceive) {
var n = this;
t.addLoading();
g.receiveScorePointBoxReward(this.selectPointInfo.activityName, a.score, function(e) {
t.addRewardEffectPanel(e._temp.entityCountMap);
c.playEffect(d.sound_effect_task_finish_mp3);
n.update_();
});
} else t.addRewardPanel(r.t("奖励内容"), a.dropList);
},
onClose_: function() {
this.unschedule(this.tick_);
t.removePanel(this.node);
this.selectPointInfo = null;
c.playMusic(d.sound_music_home_mp3);
},
onDropView_: function(e, a) {
a = p.genDropViewData();
this.dropViewNode.active = !0;
this.dropViewItemMap = this.dropViewItemMap || {};
t.preHideNodeMap(this.dropViewItemMap);
for (var n in a.dropViewItems) {
var i = this.dropViewItemMap[n];
if (!i) {
(i = cc.instantiate(this.dropViewItem)).parent = this.dropViewItemsContent;
i.idx = n;
this.dropViewItemMap[n] = i;
}
i.active = !0;
t.markHideNode(i);
var r = a.dropViewItems[n], o = i.getChildByName("item_node");
o.active = !!r.itemItem;
if (o.active) {
o.getComponentInChildren("itemItem").update_(r.itemItem);
o.getComponentInChildren("itemItem").setShowPanel_(!0);
}
var l = i.getChildByName("role_node");
l.active = !!r.roleItem;
l.active && l.getComponentInChildren("roleItem").update_(r.roleItem);
i.getChildByName("name_label").getComponent(cc.Label).string = r.entityName;
var c = i.getChildByName("rate_label").getComponent(cc.Label);
s.replaceLabel(c, [ r.rate ]);
}
t.hideNodeMap(this.dropViewItemMap);
},
onCloseDropView_: function() {
this.dropViewNode.active = !1;
},
onShop_: function() {
m.pushScene(m.NAME.SHOP_SCENE, {
type: i.SHOP.CONSTS.TYPE.STAR_SIGN
});
},
onBuyTicket_: function() {
var e = o.findEntityById(this.selectPointInfo.activityItem.costMoneyId), a = r.t("$1：$2 \n固定活动，每5天重置.\n点击“确定”前往星座副本获取！", [ e.kindName, e.desc ]);
t.addMessageBox(a, function() {
m.pushScene(m.NAME.STAR_SIGN_BMAP_SCENE);
});
},
onShowPanel_: function(e) {
var a = {
kindId: this.selectPointInfo.activityItem.costMoneyId,
count: this.selectPointInfo.score,
extra: null
};
switch (e.type) {
case cc.Node.EventType.TOUCH_START:
this.entityPanel = t.addEntityPanel(a);
console.log("点击了：", a);
var n = this.ticketSp.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
(n = this.entityPanel.parent.convertToNodeSpaceAR(n)).y -= .5 * this.entityPanel.height + .5 * this.ticketSp.node.height;
n.x -= this.entityPanel.width / 2;
var i = cc.winSize.width / 2 - this.entityPanel.width / 2, r = n.x > 0 ? 1 : -1, s = Math.abs(n.x) > i ? i * r : n.x, o = cc.winSize.height / 2 - this.entityPanel.height / 2, l = n.y > 0 ? 1 : -1, c = Math.abs(n.y) > o ? o * l : n.y;
this.entityPanel.position = cc.v2(s, c);
var d = n.y + .5 * this.entityPanel.height + .5 * cc.winSize.height - (cc.winSize.height - 5), h = n.y + .5 * cc.winSize.height - .5 * this.entityPanel.height;
d > 0 && (this.entityPanel.y -= d);
h < 0 && (this.entityPanel.y += Math.abs(h));
break;

case cc.Node.EventType.TOUCH_CANCEL:
case cc.Node.EventType.TOUCH_END:
this.entityPanel && (this.entityPanel.active = !1);
}
},
tick_: function() {
if (this.data) {
var e, a = this.timeTypeLabel, t = this.timeLabel, i = this.data.scorePointStarSign.activityItem, o = i.start_time, c = i.end_time + 0, d = r.t("结束时间:");
if (-1 == i.start_time) e = r.t("永久"); else if (l.tTime(o) < Date._now()) if (l.tTime(c) > Date._now()) {
var h = l.tTime(c) - Date._now();
h = h < 0 ? 0 : h;
var u = n.duration(h), m = Math.floor(u.asDays());
e = s.formatDuration(u.hours(), u.minutes(), u.seconds());
m > 0 && (e = r.t("$1天$2", [ m, e ]));
} else e = r.t("已结束"); else {
d = r.t("开启时间:");
e = n(l.tTime(c)).from(Date._now());
}
a && (a.string = d);
t && (t.string = e);
}
}
}));
p.genData = function() {
var e = l.player.activity.scorePointInfoMap.scorePointStarSign;
return e ? {
scorePointStarSign: e
} : null;
};
p.genDropViewData = function() {
var e = l.player.activity.scorePointInfoMap.scorePointStarSign, a = i.DROP.FUNS.getRandomDropListByDesc(e.activityItem.rdDropListDesc), t = [], n = 0;
for (var r in a) n += a[r].weight;
for (var r in a) {
var s = a[r], c = o.findEntityById(s.entityId), d = null, m = null;
c.type == i.CONSTS.ENTITY_TYPE.ROLE ? d = h.genData({
kindId: s.entityId,
star: s.extra.star
}) : m = u.genData({
kindId: s.entityId,
count: s.count,
extra: s.extra
}, !0);
t.push({
roleItem: d,
itemItem: m,
entityName: c.kindName,
rate: (s.weight / n * 100).toFixed(2)
});
}
return {
dropViewItems: t
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
