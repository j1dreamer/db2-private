carnivalPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "97a33ZLv5lCLrhgPbF2q1NJ", "carnivalPanel");
var t = e("underscore"), n = e("underscore.string"), i = e("moment"), r = (e("soundApi"), 
e("dataApi")), s = (e("resource"), e("i18n")), o = e("helper"), l = e("player"), c = e("baseView"), d = (e("clientConfig"), 
e("serverConfig")), h = e("serverMain"), u = e("activityPanel"), m = e("roleItem"), g = e("itemItem"), p = e("topUpPanel"), _ = e("dailyTaskPanel"), k = d.ACTIVITY.CONSTS, f = cc.Class({
extends: cc.Component,
properties: {
completeLabel: cc.Node,
activityTimeTypeLabel: cc.Label,
activityTimeLabel: cc.Label,
activityBtScrollview: cc.Node,
activityBtItemsLayout: cc.Node,
activityBtItem: cc.Node,
activityScrollview: cc.Node,
activityItemsLayout: cc.Node,
activityItem: cc.Node,
activityRewardItemItem: cc.Node,
activityRewardRoleItemNode: cc.Node,
daysBtLayout: cc.Node,
daysBt: cc.Node,
daysBtTitleSpriteFrames: [ cc.SpriteFrame ],
daysBtSpriteFrames: [ cc.SpriteFrame ],
activeRewardItem: cc.Node,
activeBar: cc.Node,
activeReachLabel: cc.Label
},
onLoad: function() {
this.activityBtItem.active = !1;
this.activityItem.active = !1;
this.activityRewardItemItem.active = !1;
this.activityRewardRoleItemNode.active = !1;
this.daysBt.active = !1;
this.activeRewardItem.active = !1;
this.selectActivityBt = null;
this.constructor.isMark = !1;
},
isDaysBtMark_: function(e) {
return t.keys(f.genData(e).isMarkMap).length > 0 && e <= this.data.openDays;
},
update_: function(e) {
e = (e = e || this.data.days) > 7 ? 7 : e;
this.activityScrollview.active = !1;
var a = this.constructor.genData(e);
this.data = a;
this.activityTimeLabel.node.parent.active = a.start_time && a.end_time;
this.daysBtMap = this.daysBtMap || {};
c.preHideNodeMap(this.daysBtMap);
for (var t = 0; t < 7; t++) {
var n = this.daysBtMap[t];
if (!n) {
(n = cc.instantiate(this.daysBt)).parent = this.daysBtLayout;
n.idx = t;
this.daysBtMap[t] = n;
}
n.active = !0;
c.markHideNode(n);
n.data = {
isLock: t + 1 > a.openDays,
days: t + 1
};
var i = n.getChildByName("title_bg_sp").getChildByName("label").getComponent(cc.Label);
o.replaceLabel(i, [ n.data.days ]);
n.y = n.data.days == e ? 10 : 0;
n.getChildByName("days_sp").getComponent(cc.Sprite).spriteFrame = this.daysBtSpriteFrames[t];
n.getChildByName("select_sp").active = n.data.days == e;
n.getChildByName("title_bg_sp").getComponent(cc.Sprite).spriteFrame = this.daysBtTitleSpriteFrames[n.data.days == e ? 1 : 0];
n.getChildByName("lock_sp").active = n.data.isLock;
n.getComponent(cc.Button).interactable = n.data.days != e;
var l = this.isDaysBtMark_(n.data.days);
c.setMark(n, l);
}
c.hideNodeMap(this.daysBtMap);
this.btItemMap = this.btItemMap || {};
c.preHideNodeMap(this.btItemMap);
for (var t in a.activitys) {
var h = this.btItemMap[t];
if (!h) {
(h = cc.instantiate(this.activityBtItem)).parent = this.activityBtItemsLayout;
h.idx = t;
this.btItemMap[t] = h;
}
h.active = !0;
c.markHideNode(h);
var u = a.activitys[t];
h.data = u;
c.setMark(h, a.isMarkMap[u.name]);
h.getChildByName("title_label").getComponent(cc.Label).string = s.t(u.desc);
}
c.hideNodeMap(this.btItemMap);
this.selectActivityBt ? this.onSelectActivity_({
target: this.selectActivityBt
}) : a.activitys.length > 0 && this.scheduleOnce(function() {
this.onSelectActivity_({
target: this.btItemMap[0]
});
}, .2);
this.completeLabel.active = 0 == a.activitys.length;
this.activeRewardItemMap = this.activeRewardItemMap || {};
c.preHideNodeMap(this.activeRewardItemMap);
for (var t in a.activeActivity.rewards) {
var p = a.activeActivity.rewards[t], _ = this.activeRewardItemMap[t];
if (!_) {
(_ = cc.instantiate(this.activeRewardItem)).parent = this.activeBar;
_.idx = t;
this.activeRewardItemMap[t] = _;
}
_.active = !0;
c.markHideNode(_);
_.data = {
activityName: a.activeActivity.name,
rewardIdx: t
};
_.getComponent(cc.Button).interactable = p.status == k.STATUS.CAN_RECEIVE;
_.getChildByName("complete_sp").active = p.status == k.STATUS.COMPLETE;
var f = _.getChildByName("item_item"), y = _.getChildByName("role_item_node");
f.active = !1;
y.active = !1;
var b = p.dropList[0];
if (r.findEntityById(b.entityId).type == d.CONSTS.ENTITY_TYPE.ROLE) {
y.active = !0;
var v = m.genData({
kindId: b.entityId,
star: b.extra.star
});
y.getChildByName("role_item").getComponent("roleItem").update_(v);
} else {
f.active = !0;
f.getComponent("itemItem").setShowPanel_(p.status != k.STATUS.CAN_RECEIVE);
var S = g.genData({
kindId: b.entityId,
count: b.count,
extra: b.extra
}, !0);
f.getComponent("itemItem").update_(S);
}
c.addItemEffect(null, f.active ? f : y, p.status == k.STATUS.CAN_RECEIVE);
var T = _.getChildByName("need_label").getComponent(cc.Label), M = p.needMap.carnivalCompleteCount || p.needMap.carnival2CompleteCount;
T.string = M;
_.x = M / a.activeActivityNeedMax * this.activeBar.width;
}
c.hideNodeMap(this.activeRewardItemMap);
var $ = a.activeActivity.reachMap.carnivalCompleteCount;
null == $ && ($ = a.activeActivity.reachMap.carnival2CompleteCount);
this.activeReachLabel.string = $;
this.activeBar.getComponent(cc.ProgressBar).progress = $ / a.activeActivityNeedMax;
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
onClose_: function() {
this.selectActivityBt = null;
t.each(this.activityBtItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
var e = this.activityBtScrollview.getComponent(cc.ScrollView);
e.stopAutoScroll();
e.scrollToTop(0);
c.removePanel(this.node);
h.player.emit(l.EVENT.ATTRS, []);
},
onDays_: function(e) {
var a = e.target.data;
if (a.isLock) c.addHintPanel(s.t("开服第$1天开启", [ a.days ])); else {
this.selectActivityBt = null;
this.update_(a.days);
}
},
onSelectActivity_: function(e) {
var a = e.target, n = a.data, i = a == this.selectActivityBt;
this.selectActivityBt = a;
t.each(this.activityBtItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
a.getComponent(cc.Button).interactable = !1;
this.activityScrollview.active = !1;
i ? this.activityScrollview.active = !0 : o.scrollviewFadeIn(this.activityScrollview);
this.activityItemMap = this.activityItemMap || {};
c.preHideNodeMap(this.activityItemMap);
for (var l in n.rewards) {
var h = this.activityItemMap[l];
if (!h) {
(h = cc.instantiate(this.activityItem)).parent = this.activityItemsLayout;
h.idx = l;
this.activityItemMap[l] = h;
}
h.zIndex = Number(l);
h.active = !0;
c.markHideNode(h);
var u = n.rewards[l];
h.data = u;
h.opacity = u.status == k.STATUS.COMPLETE ? 76.5 : 255;
h.zIndex = u.status == k.STATUS.COMPLETE ? 100 : h.zIndex;
u.status == k.STATUS.CAN_RECEIVE && (h.zIndex = Number(l) - 100);
h.getChildByName("title_label").getComponent(cc.Label).string = s.t(u.desc);
var p = h.getChildByName("receive_bt");
p.data = {
activityName: n.name,
rewardIdx: l
};
p.active = u.status == k.STATUS.CAN_RECEIVE;
var _ = h.getChildByName("complete_sp");
_.active = u.status == k.STATUS.COMPLETE;
var f = h.getChildByName("buy_bt"), y = u.goods;
f.active = !!y && u.status == k.STATUS.UN_COMPLETE;
f.active && (f.data = {
id: y.id,
price: y.price,
priceRate: y.priceRate || 1,
name: s.t(y.name, [ y.price ]),
gem: y.gem
});
var b = h.getChildByName("go_to_bt");
b.active = !!n.goType && !p.active && !_.active;
b.data = {
goType: n.goType
};
h.getChildByName("un_complete_sp").active = u.status == k.STATUS.UN_COMPLETE && !b.active && !f.active;
var v = h.getChildByName("show_label").getComponent(cc.Label), S = t.keys(n.rewards[l].needMap)[0], T = n.reachMap[S], M = n.rewards[l].needMap[S];
t.include([ "loginDays", "mapType1SmapId", "mapType2SmapId" ], S) ? o.replaceLabel(v, [ T >= M ? 1 : 0, 1 ]) : o.replaceLabel(v, [ T, M ]);
var $ = h.getChildByName("reward_layout");
h.itemItemMap = h.itemItemMap || {};
c.preHideNodeMap(h.itemItemMap);
h.roleItemNodeMap = h.roleItemNodeMap || {};
c.preHideNodeMap(h.roleItemNodeMap);
var I = 0, C = 0;
for (var P in n.rewards[l].dropList) {
var D = n.rewards[l].dropList[P];
if (r.findEntityById(D.entityId).type == d.CONSTS.ENTITY_TYPE.ROLE) {
var N = h.roleItemNodeMap[I];
if (!N) {
(N = cc.instantiate(this.activityRewardRoleItemNode)).parent = $;
N.idx = I;
h.roleItemNodeMap[I] = N;
}
N.active = !0;
c.markHideNode(N);
var A = m.genData({
kindId: D.entityId,
star: D.extra.star
});
N.getChildByName("role_item").getComponent("roleItem").update_(A);
c.addItemEffect(D, N);
I++;
} else {
var L = h.itemItemMap[C];
if (!L) {
(L = cc.instantiate(this.activityRewardItemItem)).parent = $;
L.idx = C;
h.itemItemMap[C] = L;
}
L.active = !0;
c.markHideNode(L);
L.getComponent("itemItem").setShowPanel_(!0);
var E = g.genData({
kindId: D.entityId,
count: D.count,
extra: D.extra
}, !0);
L.getComponent("itemItem").update_(E);
c.addItemEffect(D, L);
C++;
}
}
c.hideNodeMap(h.itemItemMap);
c.hideNodeMap(h.roleItemNodeMap);
}
c.hideNodeMap(this.activityItemMap);
if (!i) {
var B = this.activityScrollview.getComponent(cc.ScrollView);
B.stopAutoScroll();
B.scrollToTop(0);
B.getComponent("listViewComponent").delayUpdate_(.2);
}
},
tick_: function() {
var e, a = this.activityTimeTypeLabel, t = this.activityTimeLabel, n = s.t("结束时间:"), r = this.data.start_time, l = this.data.end_time;
if (-1 == r) e = s.t("永久"); else if (h.tTime(r) < Date._now()) if (h.tTime(l) > Date._now()) {
var c = h.tTime(l) - Date._now();
c = c < 0 ? 0 : c;
var d = i.duration(c), u = Math.floor(d.asDays());
e = o.formatDuration(d.hours(), d.minutes(), d.seconds());
u > 0 && (e = s.t("$1天$2", [ u, e ]));
} else e = s.t("已结束"); else {
n = s.t("开启时间:");
e = i(h.tTime(l)).from(Date._now());
}
a && (a.string = n);
t && (t.string = e);
},
onReceive_: u.prototype.onReceive_,
onBuy_: p.prototype.onGoodsItem_,
onGo_: _.prototype.onGo_
});
f.genData = function(e) {
var a = h.player, i = t.values(a.activity.map);
i = t.filter(i, function(a) {
var i = n.include(a.name, "carnival_") && (!e || a.carnivalDay == e) && !a.isSuccess;
if (!i) return i;
d.ACTIVITY.FUNS.checkOpen(a) || (i = a.rewards && !!t.findWhere(a.rewards, {
status: k.STATUS.CAN_RECEIVE
}));
return i;
});
var r = 0, o = 0;
t.each(i, function(e) {
if (e.rewards) {
t.each(e.rewards, function(a) {
a.dropList = a.dropListDesc ? d.DROP.FUNS.getDropListByDesc(a.dropListDesc) : a.dropList;
a.rdDropList = a.rdDropListDesc ? d.DROP.FUNS.getRandomDropListByDesc(a.rdDropListDesc) : a.rdDropList;
if (e.isTopUp) {
var n = h.player.extra.goodsList[t.keys(a.needMap)[0].split("_")[1]];
a.desc = a.desci18n || s.t(a.desc, [ s.t(n.show, [ n.price ]) ]);
a.desci18n = a.desc;
a.goods = n;
}
});
r = r || e.start_time;
r = e.start_time < r ? e.start_time : r;
o = o || e.end_time;
o = e.end_time > o ? e.end_time : o;
}
});
var l = h.player.extra.openDays, c = {}, u = !1;
for (var m in i) {
var g = i[m];
if (g.rewards) for (var p in g.rewards) if (g.rewards[p].status == k.STATUS.CAN_RECEIVE && l >= g.carnivalDay) {
c[g.name] = !0;
u = !0;
break;
}
g.reward && g.reward.status == k.STATUS.CAN_RECEIVE && (c[g.name] = !0);
}
i = t.sortBy(i, function(e) {
return n.include(e.name, "carnival_login") ? 1 : n.include(e.name, "carnival_top_up") ? 2 : 3;
});
var _ = a.activity.map.carnival_active;
_ && t.findWhere(_.rewards, {
status: k.STATUS.CAN_RECEIVE
}) && (u = !0);
var y = _ ? t.last(_.rewards).needMap.carnivalCompleteCount : 0;
_ || (i = []);
u = (f.isMark || u) && i.length > 0;
return {
openDays: l,
days: e,
activitys: i,
start_time: r,
end_time: o,
activeActivity: _,
activeActivityNeedMax: y,
isMarkMap: c,
isNeedMark: u
};
};
f.isMark = !0;
cc._RF.pop();
}, {
activityPanel: "activityPanel",
baseView: "baseView",
clientConfig: "clientConfig",
dailyTaskPanel: "dailyTaskPanel",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
