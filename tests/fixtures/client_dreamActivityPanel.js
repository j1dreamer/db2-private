dreamActivityPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "16227T9YYpERKCXteqK//kv", "dreamActivityPanel");
var t = e("baseView"), n = e("i18n"), i = (e("soundApi"), e("serverMain")), r = e("playerHandler"), s = e("moment"), o = e("helper"), l = e("rulePanel"), c = (e("resource"), 
e("dreamExtActivityPanel")), d = cc.Class({
extends: cc.Component,
properties: {
map_node: cc.Node,
middleBtNode: cc.Node,
middleSpine: cc.Node,
item_map: cc.Node,
autoBt: cc.Node,
cancelAutoBt: cc.Node,
goBt: cc.Node,
goldBt: cc.Node,
showRewardBt: cc.Node,
coinSp: cc.Sprite,
ticketSp: cc.Sprite,
ticketGoldSp: cc.Sprite,
coinLabel: cc.Label,
ticketLabel: cc.Label,
ticketGoldLabel: cc.Label,
fillCoinLabel: cc.Label,
outside: cc.Node,
goldDiceNode: cc.Node,
goldDiceLayout: cc.Node,
logNode: cc.Node,
logScrollView: cc.ScrollView,
timeTypeLabel: cc.Label,
timeLabel: cc.Label,
operateNode: cc.Node,
_state: !1,
_inAuto: !1,
_autoCount: 0,
_multiple: 1,
_bye: !1,
_hasItPassed: !1,
_reversal: !1,
_onNextLap: 0,
_prevServerEvent: 0,
_mapItemNode: null,
_hasShowReward: !0,
helperBt: cc.Node,
dreamExtActivityPanel: cc.Node
},
onLoad: function() {
d.instance || (d.instance = this);
var e = i.player.activity.dream;
this._inAuto = !1;
this.operateComponent = this.operateNode.getComponent("dreamActivityPanel.operate");
this.logComponent = this.logNode.getComponent("dreamActivityPanel.log");
this.manorComponent = this.map_node.getComponent("puzzleManor");
this.map_node.active = !0;
this.item_map.active = !1;
this.cancelAutoBt.active = this._inAuto;
var a = [ 0 ];
for (var t in e.activityItem.rewardMap) a[t] = e.activityItem.rewardMap[t];
this._mapItemNode = this.manorComponent.setItemByMuBiao(this.item_map, a);
var n = this.readServerData("_hasShowReward");
this._hasShowReward = !1 === n || n;
this.timeData = {
end_time: e.activityItem.end_time,
start_time: e.activityItem.start_time
};
console.log("----------------初始化梦想国度：", e, "-------------结束时间是：", this.timeData.end_time);
0 === this._hasShowReward && this.onClickShowReward({
target: this.showRewardBt
}, !0);
this.maxIndex = this.manorComponent.getMaxId();
this.allEntityCountMap = [];
this.data = {
dreamCoin: 0,
ticket: 10,
ticketGold: 5
};
this.update_();
this.index = e.curPos;
var r = this.readServerData("playerPosData");
e.curPos <= 0 ? console.log("玩家在初始地0") : this.manorComponent.initThePlayerByTiledID(e.curPos, r);
console.log("初始化梦境：", i.player.activity.dream, "-------本地playerPosData是：", r, "----mapArr:", a);
var s = e.activityItem.fillReward.split("x");
this.fillCoin = s[1];
this.fillCoinLabel.string = "x" + this.fillCoin;
this.onOpenTouchEvent(this.coinSp);
this.onOpenTouchEvent(this.ticketSp);
this.onOpenTouchEvent(this.ticketGoldSp);
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
start: function() {},
update: function() {
if (this.data) {
this.data.dreamCoin = i.player.bag.getItemCount(93);
this.data.ticket = i.player.bag.getItemCount(94);
this.data.ticketGold = i.player.bag.getItemCount(95);
this.coinLabel.string = this.data.dreamCoin;
this.ticketLabel.string = this.data.ticket;
this.ticketGoldLabel.string = this.data.ticketGold;
}
},
tick_: function() {
if (this.timeData) {
var e, a = this.timeTypeLabel, t = this.timeLabel, r = this.timeData.start_time, l = this.timeData.end_time + 0, c = n.t("结束时间:");
if (-1 == this.timeData.start_time) e = n.t("永久"); else if (i.tTime(r) < Date._now()) if (i.tTime(l) > Date._now()) {
var d = i.tTime(l) - Date._now();
d = d < 0 ? 0 : d;
var h = s.duration(d), u = Math.floor(h.asDays());
e = o.formatDuration(h.hours(), h.minutes(), h.seconds());
u > 0 && (e = n.t("$1天$2", [ u, e ]));
} else e = n.t("已结束"); else {
c = n.t("开启时间:");
e = s(i.tTime(l)).from(Date._now());
}
a && (a.string = c);
t && (t.string = e);
}
},
onDestroy: function() {
this.unschedule(this.tick_);
d.instance = null;
},
update_: function() {
var e = this.readServerData("_multiple");
this._multiple = e > 0 ? e : 1;
this._hasItPassed = this.readServerData("_hasItPassed");
this._onNextLap = this.readServerData("_onNextLap");
this._reversal = this.readServerData("_reversal");
var a = c.genData();
t.setMark(this.helperBt, a && a.isNeedMark);
},
onOpenTouchEvent: function(e) {
e.node.on(cc.Node.EventType.TOUCH_START, this.onShowPanel_, this);
e.node.on(cc.Node.EventType.TOUCH_END, this.onShowPanel_, this);
e.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onShowPanel_, this);
},
onCloseTouchEvent: function(e) {
console.log("关闭货币点击事件:", e);
e.node.off(cc.Node.EventType.TOUCH_START, this.onShowPanel_, this);
e.node.off(cc.Node.EventType.TOUCH_END, this.onShowPanel_, this);
e.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onShowPanel_, this);
},
saveServerDate: function(e, a) {
this[e] = a;
var t = i.player.id;
storage.setItem(e + "_" + t, a);
},
readServerData: function(e) {
var a = i.player.id, t = storage.getItem(e + "_" + a), n = null != t && t;
console.log("从服务器上读取关键数据key", e, "----local：", t, "=========data", n);
return n;
},
rand: function(e, a) {
var t = Math.ceil(Math.random() * (a - e + 1) + e - 1);
console.log("执行了一次本地取随机数：", t);
return t;
},
onClick: function(e) {
var a = this;
if (this.data && this.data.ticket <= 0) {
t.addHintPanel(n.t("骰子不足，无法开始"));
this.cancelAutoBt.active = !1;
} else if (!(this._inAuto && e || this._state)) {
var i = function(e) {
a.data.ticket -= 1;
a._state = !0;
var t = e * a._multiple;
a.saveServerDate("_multiple", 1);
var i = t + a.index, r = i > a.maxIndex;
a.saveServerDate("_hasItPassed", r);
var s = i > a.maxIndex ? i - a.maxIndex : i;
a.saveServerDate("index", s);
console.log("++++++++++++++++++++++++++++++++生成的数是：", e, "目标id:", a.index, "当前地图最大的数是：", a.maxIndex);
a.middleBtNode.active = !1;
a.middleSpine.active = !0;
var o = a.middleSpine.getComponentInChildren(cc.Label);
o.node.active = !1;
var l = a.middleSpine.getComponent(sp.Skeleton), c = "action_" + e;
l.setAnimation(0, c || "action", !1) && l.setCompleteListener(function(e) {
if ((e.animation ? e.animation.name : "") === c) {
o.node.active = !0;
o.string = n.t("前进$1步", [ t ]);
a.judge();
a.manorComponent.playerMoveToPlaceById(s);
a.index = s;
}
});
};
t.addLoading();
r.dreamRoll(null, function(e) {
console.log("服务器：使用普通筛子=========", e);
var t = (e && e._temp ? e._temp.point : 0) || a.rand(6, 1), n = e && e._temp ? e._temp.dropList : [];
a.entityCountMap = n;
var r = e && e._temp ? e._temp.event : 0;
a._serverEvent = r;
i && i(t);
});
}
},
judge: function() {
if (this._hasItPassed && this._reversal) {
var e = this._onNextLap + 1;
this.saveServerDate("_onNextLap", e);
this._onNextLap > 1 && this.saveServerDate("_reversal", !1);
}
},
onClickGold: function() {
if (this.data && this.data.ticketGold <= 0) t.addHintPanel(n.t("金骰子不足")); else if (!this._inAuto) {
this.goldDiceNode.active = !0;
this.onSelectGoldDice({
target: this.goldDiceLayout.children[0]
}, 1);
}
},
onClickAuto_: function(e) {
if (!this._inAuto && this.data && this.data.ticket <= 0) t.addHintPanel(n.t("骰子不足，无法开始")); else {
this._inAuto = !this._inAuto;
this.cancelAutoBt.active = this._inAuto;
this.cancelAutoBt.getComponentInChildren(cc.Label).string = this._inAuto ? n.t("自动投掷中...") : n.t("自动投掷");
this.cancelAutoBt.getChildByName("select_sp").active = this._inAuto;
console.log("点击了自动event:", e, "现在的状态是this._inAuto：", this._inAuto);
this._autoCount = this._inAuto ? this._autoCount + 1 : 0;
this._inAuto && this.onClick();
}
},
onSelectGoldDice: function(e, a) {
for (var t = this.goldDiceLayout.children, n = 0; n < t.length; n++) t[n].getChildByName("select_sp").active = !1;
this.runNum = Number(a);
e.target.getChildByName("select_sp").active = !0;
},
onConfirmGoldDice: function() {
var e = this, a = function() {
e.saveServerDate("_multiple", 1);
var a = e.runNum + e.index;
console.log("确认使用金骰子this.runNum：", e.runNum, "---------------this.index:", e.index);
var t = a > e.maxIndex;
e.saveServerDate("_hasItPassed", t);
var n = a > e.maxIndex ? a - e.maxIndex : a;
e.saveServerDate("index", n);
e.goldDiceNode.active = !1;
e.judge();
e.manorComponent.playerMoveToPlaceById(n);
e.index = n;
e.data.ticketGold -= 1;
};
t.addLoading();
r.dreamRoll(this.runNum, function(t) {
console.log("----------------------使用金骰子传入自定义点数", t);
var n = t && t._temp ? t._temp.dropList : [];
e.entityCountMap = n;
var i = t && t._temp ? t._temp.event : 0;
e._serverEvent = i;
a && a();
});
},
onCancelGoldDice: function() {
this.goldDiceNode.active = !1;
},
onClickAdd: function(e, a) {
var i = this, r = a ? Number(a) : 0, s = {
desc: n.t("是否前往梦想助力购买“普通骰子”?"),
effect: "",
cancelBtText: n.t("取消"),
btText: n.t("确定"),
useCb: function() {
t.addPanel(i.dreamExtActivityPanel, !1, !1, !0);
i.dreamExtActivityPanel.getComponent("dreamExtActivityPanel").update_();
}
};
switch (r) {
case 93:
s.desc = n.t("环绕地图一圈即可获得“梦想币”");
s.useCb = null;
s.cancelBtText = null;
break;

case 94:
s.effect = n.t("普通骰子可以在事件或者每日赠送中产出.");
break;

case 95:
s.desc = n.t("是否前往梦想助力购买“金骰子?");
s.effect = n.t("金骰子也可以在事件中产出.");
}
this.onOperate_(s);
},
onBack: function(e) {
var a = this.index - e, t = a <= 0 ? 1 : a, n = a <= 0;
this.saveServerDate("_reversal", n);
var i = n ? 0 : 2;
this.saveServerDate("_onNextLap", i);
console.log("倒退求出的数是num：", a, "============", this.index, "this._reversal：", this._reversal);
this.saveServerDate("index", t);
this.goldDiceNode.active = !1;
this.manorComponent.playerMoveToPlaceById(t);
this.index = t;
},
onClickLog: function() {
this.logNode.active = !0;
this.logComponent.update_();
},
onCloseLog: function() {
this.logComponent.clear();
this.logNode.active = !1;
},
onMoveEnd: function(e) {
var a = this;
this._state = !1;
this.middleBtNode.active = !0;
this.middleSpine.active = !1;
cc.Tween.stopAllByTarget(this.middleBtNode);
cc.tween(this.middleBtNode).set({
opacity: 0
}).to(.24, {
opacity: 255
}, {
easing: "sineOut"
}).start();
this.cancelAutoBt.active = this._inAuto;
var i = this.manorComponent.getPlayerPosData();
this.saveServerDate("playerPosData", i);
console.log("移动结束：", e);
var r = function() {
console.log("调用奖励接口：", a.entityCountMap, "--------------this.allEntityCountMap:", a.allEntityCountMap, "-----------this._inAuto:", a._inAuto, "----this.index:", a.index);
if (a.allEntityCountMap && a.allEntityCountMap.length > 0 && !a._inAuto) {
console.log("中途停止自动投掷显示奖励this.allEntityCountMap:", a.allEntityCountMap);
if (a.entityCountMap && a.entityCountMap.length > 0) {
for (var e = 0; e < a.entityCountMap.length; e++) a.allEntityCountMap.push(a.entityCountMap[e]);
a.entityCountMap = null;
}
t.addRewardEffectPanel(a.allEntityCountMap);
a.allEntityCountMap = [];
} else {
if (a.entityCountMap && a.entityCountMap.length > 0 && !a._inAuto) {
console.log("单抽显示奖励");
t.addRewardEffectPanel(a.entityCountMap);
a.entityCountMap = null;
}
if (a._inAuto) {
console.log("自动投掷中..不显示奖励，等停止了一起显示。当前已经投掷", a._autoCount, "次");
a._autoCount += 1;
a.onClick();
if (a.entityCountMap.length > 0) {
console.log("保存奖励数据：", a.entityCountMap[0]);
for (var n = 0; n < a.entityCountMap.length; n++) a.allEntityCountMap.push(a.entityCountMap[n]);
a.entityCountMap = null;
}
if (a.data && a.data.ticket <= 0) {
t.addRewardEffectPanel(a.allEntityCountMap);
a.allEntityCountMap = [];
}
}
}
}, s = {
desc: "",
effect: "",
btText: n.t("确定"),
useCb: function() {
r && r();
}
}, o = function() {
if (a._bye) {
console.log("轮空一次！！！！！！，本次不获得奖励", "this._reversal：", a._reversal, "---this._prevServerEvent", a._prevServerEvent);
switch (a._prevServerEvent) {
case 5:
t.addHintPanel(n.t("倒退没有奖励"));
break;

case 6:
t.addHintPanel(n.t("衰神下凡，奖励不见了"));
}
a.saveServerDate("_bye", !1);
r && r();
} else {
if (e && e.isEvent) {
a.saveServerDate("_prevServerEvent", a._serverEvent);
t.addHintPanel(n.t("遇到特殊事件"));
a._inAuto && a.onClickAuto_({
target: a.autoBt
});
var i = a._serverEvent ? a._serverEvent : a.rand(6, 1);
console.log("踩中事件了！！！！！事件id是：", i);
s.useCb = function() {
r && r();
};
switch (i) {
case 1:
s.desc = n.t("踩中事件:遇到财神爷");
s.effect = n.t("下个骰子获得奖励翻3倍");
break;

case 2:
s.desc = n.t("踩中事件:金色传说");
s.effect = n.t("获得一个金骰子");
break;

case 3:
s.desc = n.t("踩中事件:再来一次");
s.effect = n.t("获得一个普通骰子");
break;

case 4:
s.desc = n.t("踩中事件:获得加速buff，下次行走步数是骰子数字X2（仅限下次骰子使用）,下次使用金骰子则视为弃权。");
s.effect = n.t("buff无法在金骰子上使用");
a.saveServerDate("_multiple", 2);
break;

case 5:
s.desc = n.t("踩中香蕉皮了");
s.effect = n.t("倒退5格");
a.saveServerDate("_bye", !0);
s.useCb = function() {
a.onBack(5);
r && r();
};
break;

case 6:
s.desc = n.t("踩中事件:衰神下凡");
s.effect = n.t("下次骰子无法获得奖励");
a.saveServerDate("_bye", !0);
}
a.onOperate_(s);
} else r && r();
a.update_();
}
};
if (this._hasItPassed && this._reversal) o && o(); else if (this._hasItPassed && !1 === this._reversal) {
console.log("玩家跑完一圈了！！！！！！！！！！！！！！！！！！！！！！！！！！");
s.effect = n.t("完成一圈了，获得梦想币奖励");
s.reward = this.fillCoin;
s.useCb = function() {
s.reward = null;
o && o();
o = null;
};
this.onOperate_(s);
} else o && o();
},
onOperate_: function(e) {
this.operateComponent.show_(e);
},
onClose: function() {
this.map_node.active = !1;
this.node.active = !1;
},
onRule_: function() {
t.addRulePanel(l.TYPE.ACTIVITY_DREAM);
},
onHelper: function() {
t.addPanel(this.dreamExtActivityPanel, !1, !1, !0);
this.dreamExtActivityPanel.getComponent("dreamExtActivityPanel").update_();
},
onShowPanel_: function(e, a) {
var n = {
kindId: Number(e.target.name),
count: 0,
extra: null
};
switch (n.kindId) {
case 93:
n.count = this.data.dreamCoin;
break;

case 94:
n.count = this.data.ticket;
break;

case 95:
n.count = this.data.ticketGold;
}
console.log("点击了货币event", e, "------------datas:", a);
switch (e.type) {
case cc.Node.EventType.TOUCH_START:
this.entityPanel = t.addEntityPanel(n);
console.log("点击了：", n);
var i = e.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
(i = this.entityPanel.parent.convertToNodeSpaceAR(i)).y -= .5 * this.entityPanel.height + .5 * e.target.height;
i.x -= this.entityPanel.width / 2;
var r = cc.winSize.width / 2 - this.entityPanel.width / 2, s = i.x > 0 ? 1 : -1, o = Math.abs(i.x) > r ? r * s : i.x, l = cc.winSize.height / 2 - this.entityPanel.height / 2, c = i.y > 0 ? 1 : -1, d = Math.abs(i.y) > l ? l * c : i.y;
this.entityPanel.position = cc.v2(o, d);
var h = i.y + .5 * this.entityPanel.height + .5 * cc.winSize.height - (cc.winSize.height - 5), u = i.y + .5 * cc.winSize.height - .5 * this.entityPanel.height;
h > 0 && (this.entityPanel.y -= h);
u < 0 && (this.entityPanel.y += Math.abs(u));
break;

case cc.Node.EventType.TOUCH_CANCEL:
case cc.Node.EventType.TOUCH_END:
this.entityPanel && (this.entityPanel.active = !1);
}
},
onClickEventIcon: function() {
var e = {
desc: n.t("特殊事件,踩中会触发特殊事件."),
effect: n.t("特殊事件中将会随机抽中奖励或惩罚."),
btText: n.t("确定")
};
this.onOperate_(e);
},
onClickShowReward: function(e, a) {
var t = a ? this._hasShowReward : !this._hasShowReward;
console.log("点击了展示奖励按钮,接下来的状态是：", t, "-------------初始状态是", this._hasShowReward);
for (var n = this._mapItemNode.children, i = 0; i < n.length; i++) {
var r = n[i].getChildByName("icon"), s = n[i].getChildByName("scale_node");
r.active || (s.active = t);
}
if (!a) {
var o = t ? 1 : 0;
console.log("保存是否展示奖励到本地", o);
this.saveServerDate("_hasShowReward", o);
}
e.target.getChildByName("lock_sp").active = this._hasShowReward;
}
});
d.isNeedPop = !0;
cc._RF.pop();
}, {
baseView: "baseView",
dreamExtActivityPanel: "dreamExtActivityPanel",
helper: "helper",
i18n: "i18n",
moment: "moment",
playerHandler: "playerHandler",
resource: "resource",
rulePanel: "rulePanel",
serverMain: "serverMain",
soundApi: "soundApi"
} ],
