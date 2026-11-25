scorePointPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "37f09ogl4ZKD4PEyD1u47kl", "scorePointPanel");
var t, n = e("underscore"), i = e("baseView"), r = (e("underscore.string"), e("buildExt")), s = e("serverConfig"), o = e("i18n"), l = e("helper"), c = e("dataApi"), d = e("serverMain"), h = e("soundApi"), u = e("moment"), m = e("resource"), g = e("rankHandler"), p = e("roleItem"), _ = e("itemItem"), k = e("topUpPanel"), f = e("pointScene"), y = e("playerHandler"), b = (s.ACTIVITY.CONSTS, 
cc.Class(((t = {
extends: cc.Component,
properties: {
leftBtsContent: cc.Node,
scoreRichText: cc.RichText,
pointNodes: [ cc.Node ],
ticketSp: cc.Sprite,
ticketCountLabel: cc.Label,
rankRewardItemsContent: cc.Node,
rankRewardItem: cc.Node,
bottomNode: cc.Node,
bottomScoreLabel: cc.Label,
bottomBoxProgressBar: cc.ProgressBar,
bottomBoxsContent: cc.Node,
bottomBoxItem: cc.Node,
dropViewNode: cc.Node,
dropViewItemsContent: cc.Node,
dropViewItem: cc.Node,
pointEffectNode: cc.Node,
pointEffectCardNode: cc.Node,
pointEffectItemSpriteFrame: [ cc.SpriteFrame ],
defaultVideoPlayer: cc.VideoPlayer,
point3OneVideoPlayer: cc.VideoPlayer,
point3TenVideoPlayer: cc.VideoPlayer,
advancedSpineNode: cc.Node,
pointItem: cc.Node,
tenPointItem: cc.Node,
tenPointItemLayout: cc.Node,
pointEffectBottomNode: cc.Node,
pointAgainPriceLabel: cc.Label,
pointAgainMoneySp: cc.Sprite,
pointAgainTimesLabel: cc.Label,
pointAgainBt: cc.Button,
pointYesBt: cc.Button,
rankNode: cc.Node,
rankItemsContent: cc.Node,
rankItem: cc.Node,
myRankLabel: cc.Label,
skipBt: cc.Node,
resetBt: cc.Node
},
onLoad: function() {
this.dropViewNode.active = !1;
this.bottomBoxItem.active = !1;
this.dropViewItem.active = !1;
this.rankRewardItem.active = !1;
this.pointEffectNode.active = !1;
this.defaultVideoPlayer.node.active = !1;
this.point3OneVideoPlayer.node.active = !1;
this.point3TenVideoPlayer.node.active = !1;
this.tenPointItem.active = !1;
this.rankItem.active = !1;
this._defaultVideoClip = this.defaultVideoPlayer.clip;
this._point3OneVideoClip = this.point3OneVideoPlayer.clip;
this._point3TenVideoClip = this.point3TenVideoPlayer.clip;
this.bottomNode.scale = cc.winSize.width > 1200 ? 1 : .9;
var e = d.player.id;
this.skipMove = storage.getItem("scorePoint1_" + e + "_skip") || !1;
this.skipBt.getChildByName("lock_sp").active = this.skipMove;
if (r.isVideoCloseAll) {
this.skipBt.active = !1;
this.skipMove = !0;
}
this.ticketSp.node.on(cc.Node.EventType.TOUCH_START, this.onShowPanel_, this);
this.ticketSp.node.on(cc.Node.EventType.TOUCH_END, this.onShowPanel_, this);
this.ticketSp.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onShowPanel_, this);
},
update_: function() {
var e = b.genData();
this.data = e;
this.selectPointInfo ? this.selectPointInfo = e.scorePointInfoMap[this.selectPointInfo.activityName] : this.selectPointInfo = n.without(n.values(e.scorePointInfoMap), null)[0];
this.timeInfos = [];
for (var a = 0; a < 3; a++) {
var t = a + 1, c = this.leftBtsContent.getChildByName("point_" + t + "_bt"), h = "scorePoint" + t, u = e.scorePointInfoMap[h];
c.active = !!u;
var g = this.selectPointInfo == u;
this.pointNodes[a].active = g;
var p = 0;
if (u && u.activityItem) {
var k = u.activityItem.costMoneyId;
p = d.player.bag.getItemCount(k);
}
this.pointNodes[a].getChildByName("hundred_times_bt").active = r.scorePointShowHundredBt && p >= 100;
if (c.active) {
c.data = {
activityName: h
};
c.getComponent(cc.Button).interactable = !g;
var f = c.getChildByName("default_node"), y = c.getChildByName("select_node");
f.active = !g;
y.active = g;
var v = (g ? y : f).getChildByName("time_label").getComponent(cc.Label);
this.timeInfos.push({
timeLabel: v,
endTime: u.activityItem.end_time
});
}
}
l.replaceLabel(this.scoreRichText, [ this.selectPointInfo.score ]);
this.rankRewardItemMap = this.rankRewardItemMap || {};
i.preHideNodeMap(this.rankRewardItemMap);
for (var a in this.selectPointInfo.activityItem.rewards) {
var S = this.rankRewardItemMap[a];
if (!S) {
(S = cc.instantiate(this.rankRewardItem)).parent = this.rankRewardItemsContent;
S.idx = a;
this.rankRewardItemMap[a] = S;
}
S.active = !0;
i.markHideNode(S);
var T = this.selectPointInfo.activityItem.rewards[a];
S.getChildByName("rank_1_sp").active = 1 == T.rankBegin;
S.getChildByName("rank_2_sp").active = 2 == T.rankBegin;
S.getChildByName("rank_3_sp").active = 3 == T.rankBegin;
var M = S.getChildByName("rank_label");
M.active = T.rankBegin > 3;
M.active && l.replaceLabel(M.getComponent(cc.Label), [ T.rankBegin, T.rankEnd ]);
var $ = S.getChildByName("need_label");
$.active = T.limit > 0;
$.active && l.replaceLabel($.getComponent(cc.Label), [ T.limit ]);
for (var I = S.getChildByName("items_layout"), C = s.DROP.FUNS.getDropListByDesc(T.dropListDesc), P = 0; P < 3; P++) {
var D = I.getChildByName("item_item_" + (P + 1)), N = C[P];
D.active = !!N;
if (D.active) {
D.getComponent("itemItem").update_(_.genData({
kindId: N.entityId,
count: N.count,
extra: N.extra
}, !0));
D.getComponent("itemItem").setShowPanel_(!0);
i.addItemEffect(N, D);
}
}
}
i.hideNodeMap(this.rankRewardItemMap);
this.bottomScoreLabel.string = this.selectPointInfo.score;
k = this.selectPointInfo.activityItem.costMoneyId;
i.setSpriteFrame(this.ticketSp, m["misc_money_" + k + "_png"]);
console.log("设置货币图片：", k);
this.ticketCountLabel.string = d.player.bag.getItemCount(k);
var A = this.selectPointInfo.activityItem, L = JSON.parse(A.needScoresDesc), E = [];
for (var a in A.boxDropListDescs) E.push(s.DROP.FUNS.getDropListByDesc(A.boxDropListDescs[a]));
var B = d.player.extra.goodsList, w = n.findWhere(n.values(B), {
scorePointBoxResetName: this.selectPointInfo.activityName
});
this.resetBt.active = w && !this.selectPointInfo.isReset && this.selectPointInfo.receivedScoreMap[L[4]];
if (this.resetBt.active) {
this.resetBt.data = {
id: w.id,
price: w.price,
priceRate: w.priceRate || 1,
name: o.t(w.name, [ w.gem || w.price ]),
gem: w.gem
};
this.resetBt.getChildByName("price_label").getComponent(cc.Label).string = o.t(w.show, [ w.price ]);
}
this.boxItemMap = this.boxItemMap || {};
i.preHideNodeMap(this.boxItemMap);
var G = 0;
for (var a in L) {
var R = this.boxItemMap[a];
if (!R) {
(R = cc.instantiate(this.bottomBoxItem)).parent = this.bottomBoxsContent;
R.idx = a;
this.boxItemMap[a] = R;
}
R.active = !0;
i.markHideNode(R);
R.x = this.bottomBoxsContent.width / L.length * (Number(a) + 1);
R.data = {
score: L[a],
dropList: E[a],
isCanReceive: this.selectPointInfo.score >= L[a] && !this.selectPointInfo.receivedScoreMap[L[a]]
};
this.selectPointInfo.score >= L[a] && (G = (Number(a) + 1) / L.length);
R.getChildByName("need_score").getComponentInChildren(cc.Label).string = L[a];
var H = !!this.selectPointInfo.receivedScoreMap[L[a]], x = R.getChildByName("box_sp"), K = R.getChildByName("received_sp");
x.active = !H;
i.setMark(x, R.data.isCanReceive);
K.active = H;
}
i.hideNodeMap(this.boxItemMap);
this.bottomBoxProgressBar.progress = G;
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
tick_: function() {
for (var e in this.timeInfos) {
var a = this.timeInfos[e].endTime, t = u.duration(a - Date.now()), n = Math.floor(t.asDays()), i = l.formatDuration(t.hours(), t.minutes(), t.seconds());
n > 0 && (i = o.t("$1天$2小时", [ n, t.hours() ]));
this.timeInfos[e].timeLabel.string = o.t("结束时间:$1", [ i ]);
}
},
show_: function() {
this.update_();
this.rankNode.active = !1;
this.updateRank_();
},
updateRank_: function() {
var e = this.selectPointInfo.activityItem, a = this.selectPointInfo.activityName, t = this, n = s.ACTIVITY.FUNS.getRankRegionName(e, d.player.serverId);
i.addLoading();
g.allServerTop(0, a + "_score" + (n || ""), 0, 50, function(e) {
t.rankNode.active = !0;
l.replaceLabel(t.myRankLabel, [ e._temp.myRank ]);
t.rankItemMap = t.rankItemMap || {};
i.preHideNodeMap(t.rankItemMap);
for (var a in e._temp.list) {
var n = t.rankItemMap[a];
if (!n) {
(n = cc.instantiate(t.rankItem)).parent = t.rankItemsContent;
n.idx = a;
t.rankItemMap[a] = n;
}
n.active = !0;
i.markHideNode(n);
var r = e._temp.list[a];
n.getChildByName("rank_label").getComponent(cc.Label).string = r.rank;
n.getChildByName("name_label").getComponent(cc.Label).string = r.playerName;
n.getChildByName("server_label").getComponent(cc.Label).string = o.t("$1区", [ r.serverId ]);
n.getChildByName("score_label").getComponent(cc.Label).string = r.value;
}
i.hideNodeMap(t.rankItemMap);
});
},
selectPoint_: function(e) {
var a = e.target.data;
this.selectPointInfo = this.data.scorePointInfoMap[a.activityName];
this.update_();
this.updateRank_();
var t = a.activityName;
this.cardTypeName = t;
var n = d.player.id;
this.skipMove = storage.getItem(t + "_" + n + "_skip") || !1;
this.skipBt.getChildByName("lock_sp").active = this.skipMove;
},
onPoint_: function(e, a) {
this._previousTimes = Number(a);
var t = this;
i.addLoading();
var n = this.selectPointInfo.activityName;
y.scorePoint(n, Number(a), function(e) {
t.showPointEffect_(n, a, e);
t.update_();
});
},
on100Point_: function(e, a) {
this._previousTimes = Number(a);
var t = this;
i.addLoading();
var n = this.selectPointInfo.activityName;
y.scorePoint(n, Number(a), function(e) {
t.showPointEffect2_(e);
});
},
onSkip_: function(e) {
this.skipMove = !this.skipMove;
e.target.getChildByName("lock_sp").active = this.skipMove;
var a = null != this.cardTypeName ? this.cardTypeName : "scorePoint1", t = d.player.id, n = this.skipMove ? 1 : 0;
storage.setItem(a + "_" + t + "_skip", n);
},
onAgainPoint_: function() {
this.onPoint_(null, this.selectPointType);
},
onClosePointEffect_: function() {
if (this.isCanClosePointEffect) {
this.pointEffectNode.active = !1;
this.advancedSpineNode.active = !1;
}
},
showPointEffect_: function(e, a, t) {
var n = this;
t._temp.dropList;
this.isCanClosePointEffect = !1;
var r = this, s = function() {
n.advancedSpineNode.active = !0;
(function() {
n.advancedSpineNode.getComponentInChildren(sp.Skeleton).setAnimation(0, "action_2_2", !1);
i.addLoading(null, !1, !0);
n.scheduleOnce(function() {
n.advancedSpineNode.getComponentInChildren(sp.Skeleton).setAnimation(0, "action_2_1", !0);
i.removeLoading();
var e = t.team ? t.team.roles : [], s = t._temp.dropList, o = {};
for (var c in e) o[e[c].kindId] = e[c];
var d = a <= 1 ? 1 : 2, u = f.genPointEffectData(d, s, o);
r.pointEffectNode.active = !0;
r.pointItem.active = !0;
var g = a <= 1 ? 1 : 10;
r.pointAgainPriceLabel.string = g;
n.pointAgainMoneySp.spriteFrame = n.ticketSp.spriteFrame;
l.replaceLabel(r.pointAgainTimesLabel, [ g ]);
r.tenPointItemLayout.active = !0;
var p = [];
if (1 == u.entityItems.length) {
r.pointItem.data = u.entityItems[0];
p.push(r.pointItem);
r.tenPointItemLayout.active = !1;
} else {
r.pointItemMap = r.pointItemMap || {};
i.preHideNodeMap(r.pointItemMap);
for (var c in u.entityItems) {
var _ = r.pointItemMap[c];
if (!_) {
(_ = cc.instantiate(r.tenPointItem)).parent = r.tenPointItemLayout;
_.idx = c;
r.pointItemMap[c] = _;
}
_.active = !0;
i.markHideNode(_);
_.data = u.entityItems[c];
p.push(_);
}
i.hideNodeMap(r.pointItemMap);
n.pointItem.active = !1;
}
var k = r.skipMove ? .05 : .3;
for (c = 0; c < p.length; c++) {
var y = p[c].getChildByName("item_item"), b = p[c].getChildByName("role_item_node"), v = !!u.roleMap[p[c].data.kindId];
y.active = !v;
b.active = v;
var S = cc.tween().hide().delay(0 + k * c).show().call(function() {
var e = this.data.kindId, a = u.roleMap[e];
if (a = this.data.role || a) {
l.pauseNode(r.pointEffectNode);
i.addPointRoleEffectNode(a, r.pointEffectNode, "spWish");
}
h.playEffect(m.sound_effect_lottery_one_mp3);
}.bind({
data: p[c].data
}));
if (v) {
b.getComponent("roleItem").update_(p[c].data);
cc.tween(b).then(S).start();
} else {
y.getComponent("itemItem").update_(p[c].data);
y.getComponent("itemItem").setShowPanel_(!0);
cc.tween(y).then(S).start();
}
var T = p[c].getChildByName("name_Label");
T.getComponent(cc.Label).string = p[c].data._data.kindName;
T.opacity = 0;
cc.tween(T).delay(0 + p.length * k).to(.3, {
opacity: 255
}).start();
var M = p[c].getChildByName("light_sp");
if (!r.skipMove) {
M.active = !0;
M.scale = 5;
M.opacity = 255;
cc.tween(M).hide().delay(0 + k * c).show().to(.1, {
scale: 1
}).to(.2, {
opacity: 0
}).start();
}
}
r.pointAgainBt.interactable = !1;
r.pointYesBt.interactable = !1;
r.pointEffectBottomNode.opacity = 0;
cc.tween(r.pointEffectBottomNode).delay(0 + p.length * k).to(.3, {
opacity: 255
}).call(function() {
n.isCanClosePointEffect = !0;
r.pointAgainBt.interactable = !0;
n._previousTimes;
r.pointYesBt.interactable = !0;
}).start();
}, n.skipMove ? 0 : 2.7);
})();
};
s && s();
},
showPointEffect2_: function(e) {
var a = this;
this.advancedSpineNode.active = !this.skipMove;
this.advancedSpineNode.getComponentInChildren(sp.Skeleton).setAnimation(0, "action_2_2", !1);
i.addLoading(null, !1, !0);
this.scheduleOnce(function() {
a.advancedSpineNode.getComponentInChildren(sp.Skeleton).setAnimation(0, "action_2_1", !0);
i.removeLoading();
var t = e.team ? e.team.roles : [], n = e._temp.dropList, r = {};
for (var s in t) r[t[s].kindId] = t[s];
var o = f.genPointEffectData(2, n, r), c = [];
for (var s in o.entityItems) c.push(o.entityItems[s]);
for (s = 0; s < c.length; s++) {
var d = cc.tween().hide().delay(0).show().call(function() {
var e = this.data.kindId, a = o.roleMap[e];
if (a = this.data.role || a) {
l.pauseNode(this.pointEffectNode);
i.addPointRoleEffectNode(a, this.pointEffectNode, "spWish");
}
h.playEffect(m.sound_effect_lottery_one_mp3);
}.bind({
data: c[s]
}));
cc.tween(a.pointEffectNode).then(d).start();
}
var u = {};
c.forEach(function(e) {
var a = e.kindId, t = e.count;
u[a] = (u[a] || 0) + t;
});
i.addRewardEffectPanel(u);
a.update_();
a.advancedSpineNode.active = !1;
}, this.skipMove ? 0 : 2.7);
},
videoCallback_: function(e, a) {
if (a == cc.VideoPlayer.EventType.COMPLETED) {
this.pointEffectCardNode.opacity = 255;
if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
this.defaultVideoPlayer.clip = null;
this.point3TenVideoPlayer.clip = null;
this.point3OneVideoPlayer.clip = null;
}
this.defaultVideoPlayer.node.active = !1;
this.point3TenVideoPlayer.node.active = !1;
this.point3OneVideoPlayer.node.active = !1;
}
},
onBoxItem_: function(e) {
var a = e.target.data;
if (a.isCanReceive) {
var t = this, n = this.selectPointInfo.activityName;
i.addLoading();
y.receiveScorePointBoxReward(n, a.score, function(e) {
i.addRewardEffectPanel(e._temp.entityCountMap);
h.playEffect(m.sound_effect_task_finish_mp3);
t.update_();
});
} else i.addRewardPanel(o.t("奖励内容"), a.dropList);
},
onClose_: function() {
this.node.active = !1;
}
}).onAgainPoint_ = function() {
this.onClosePointEffect_();
this.onPoint_(null, this._previousTimes);
}, t.onDropView_ = function(e, a) {
var t = this.selectPointInfo.activityName;
a = b.genDropViewData(t);
this.dropViewNode.active = !0;
this.dropViewItemMap = this.dropViewItemMap || {};
i.preHideNodeMap(this.dropViewItemMap);
for (var n in a.dropViewItems) {
var r = this.dropViewItemMap[n];
if (!r) {
(r = cc.instantiate(this.dropViewItem)).parent = this.dropViewItemsContent;
r.idx = n;
this.dropViewItemMap[n] = r;
}
r.active = !0;
i.markHideNode(r);
var s = a.dropViewItems[n], o = r.getChildByName("item_node");
o.active = !!s.itemItem;
if (o.active) {
o.getComponentInChildren("itemItem").update_(s.itemItem);
o.getComponentInChildren("itemItem").setShowPanel_(!0);
}
var c = r.getChildByName("role_node");
c.active = !!s.roleItem;
c.active && c.getComponentInChildren("roleItem").update_(s.roleItem);
r.getChildByName("name_label").getComponent(cc.Label).string = s.entityName;
var d = r.getChildByName("rate_label").getComponent(cc.Label);
l.replaceLabel(d, [ s.rate ]);
}
i.hideNodeMap(this.dropViewItemMap);
}, t.onCloseDropView_ = function() {
this.dropViewNode.active = !1;
}, t.onBuyTicket_ = function() {
this.selectPointInfo.activityItem.costMoneyId;
var a = c.findEntityById(this.selectPointInfo.activityItem.costMoneyId), t = o.t("$1：$2 点击“确定”前往获取！", [ a.kindName, a.desc ]);
i.addMessageBox(t, function() {
e("homeScene").instance.onActivity_("saveGemUpgradeLevel");
});
}, t.onShowPanel_ = function(e) {
var a = {
kindId: this.selectPointInfo.activityItem.costMoneyId,
count: this.selectPointInfo.score,
extra: null
};
console.log("点击了货币", this.data, "----------  this.selectPointInfo :", this.selectPointInfo, "id:", this.selectPointInfo.activityItem.costMoneyId);
switch (e.type) {
case cc.Node.EventType.TOUCH_START:
this.entityPanel = i.addEntityPanel(a);
console.log("点击了：", a);
var t = this.ticketSp.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
(t = this.entityPanel.parent.convertToNodeSpaceAR(t)).y -= .5 * this.entityPanel.height + .5 * this.ticketSp.node.height;
t.x -= this.entityPanel.width / 2;
var n = cc.winSize.width / 2 - this.entityPanel.width / 2, r = t.x > 0 ? 1 : -1, s = Math.abs(t.x) > n ? n * r : t.x, o = cc.winSize.height / 2 - this.entityPanel.height / 2, l = t.y > 0 ? 1 : -1, c = Math.abs(t.y) > o ? o * l : t.y;
this.entityPanel.position = cc.v2(s, c);
var d = t.y + .5 * this.entityPanel.height + .5 * cc.winSize.height - (cc.winSize.height - 5), h = t.y + .5 * cc.winSize.height - .5 * this.entityPanel.height;
d > 0 && (this.entityPanel.y -= d);
h < 0 && (this.entityPanel.y += Math.abs(h));
break;

case cc.Node.EventType.TOUCH_CANCEL:
case cc.Node.EventType.TOUCH_END:
this.entityPanel && (this.entityPanel.active = !1);
}
}, t.onReset_ = k.prototype.onGoodsItem_, t)));
b.genData = function() {
var e = d.player, a = e.activity.scorePointInfoMap;
if (0 == n.without(n.values(a), null).length) return null;
var t = !1;
for (var i in a) a[i] && (t = t || e.bag.getItemCount(a[i].activityItem.costMoneyId) > 0);
return {
scorePointInfoMap: a,
isHaveTicket: t
};
};
b.genDropViewData = function(e) {
var a = d.player.activity.scorePointInfoMap, t = s.DROP.FUNS.getRandomDropListByDesc(a[e].activityItem.rdDropListDesc), n = [], i = 0;
for (var r in t) i += t[r].weight;
for (var r in t) {
var o = t[r], l = c.findEntityById(o.entityId), h = null, u = null;
l.type == s.CONSTS.ENTITY_TYPE.ROLE ? h = p.genData({
kindId: o.entityId,
star: o.extra.star
}) : u = _.genData({
kindId: o.entityId,
count: o.count,
extra: o.extra
}, !0);
n.push({
roleItem: h,
itemItem: u,
entityName: l.kindName,
rate: (o.weight / i * 100).toFixed(2)
});
}
return {
dropViewItems: n
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
dataApi: "dataApi",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
playerHandler: "playerHandler",
pointScene: "pointScene",
rankHandler: "rankHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
