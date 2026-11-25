carnival2Panel: [ function(e, a) {
"use strict";
cc._RF.push(a, "16bf84tcyhKy5nkwXwJCaYH", "carnival2Panel");
var t = e("underscore"), n = e("underscore.string"), i = (e("moment"), e("soundApi"), 
e("dataApi"), e("resource"), e("i18n")), r = (e("helper"), e("player"), e("baseView")), s = (e("clientConfig"), 
e("serverConfig")), o = e("serverMain"), l = (e("activityPanel"), e("roleItem"), 
e("itemItem"), e("topUpPanel"), e("carnivalPanel")), c = s.ACTIVITY.CONSTS, d = cc.Class({
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
onLoad: l.prototype.onLoad,
isDaysBtMark_: function(e) {
return t.keys(d.genData(e).isMarkMap).length > 0 && e <= this.data.openDays;
},
update_: l.prototype.update_,
onClose_: l.prototype.onClose_,
onDays_: function(e) {
var a = e.target.data;
if (a.isLock) r.addHintPanel(i.t("开服第$1天开启", [ a.days + 10 ])); else {
this.selectActivityBt = null;
this.update_(a.days);
}
},
tick_: l.prototype.tick_,
onSelectActivity_: l.prototype.onSelectActivity_,
onReceive_: l.prototype.onReceive_,
onBuy_: l.prototype.onBuy_,
onGo_: l.prototype.onGo_
});
d.genData = function(e) {
var a = o.player, r = t.values(a.activity.map);
r = t.filter(r, function(a) {
var i = n.include(a.name, "carnival2_") && (!e || a.carnivalDay == e) && !a.isSuccess;
if (!i) return i;
s.ACTIVITY.FUNS.checkOpen(a) || (i = a.rewards && !!t.findWhere(a.rewards, {
status: c.STATUS.CAN_RECEIVE
}));
return i;
});
var l = 0, h = 0;
t.each(r, function(e) {
if (e.rewards) {
t.each(e.rewards, function(a) {
a.dropList = a.dropListDesc ? s.DROP.FUNS.getDropListByDesc(a.dropListDesc) : a.dropList;
a.rdDropList = a.rdDropListDesc ? s.DROP.FUNS.getRandomDropListByDesc(a.rdDropListDesc) : a.rdDropList;
if (e.isTopUp) {
var n = o.player.extra.goodsList[t.keys(a.needMap)[0].split("_")[1]];
a.desc = a.desci18n || i.t(a.desc, [ i.t(n.show, [ n.price ]) ]);
a.desci18n = a.desc;
a.goods = n;
}
});
l = l || e.start_time;
l = e.start_time < l ? e.start_time : l;
h = h || e.end_time;
h = e.end_time > h ? e.end_time : h;
}
});
var u = o.player.extra.openDays - 10, m = {}, g = !1;
for (var p in r) {
var _ = r[p];
if (_.rewards) for (var k in _.rewards) if (_.rewards[k].status == c.STATUS.CAN_RECEIVE && u >= _.carnivalDay) {
m[_.name] = !0;
g = !0;
break;
}
_.reward && _.reward.status == c.STATUS.CAN_RECEIVE && (m[_.name] = !0);
}
r = t.sortBy(r, function(e) {
return n.include(e.name, "carnival_login") ? 1 : n.include(e.name, "carnival_top_up") ? 2 : 3;
});
var f = a.activity.map.carnival2_active;
f && t.findWhere(f.rewards, {
status: c.STATUS.CAN_RECEIVE
}) && (g = !0);
var y = f ? t.last(f.rewards).needMap.carnival2CompleteCount : 0;
f || (r = []);
g = (d.isMark || g) && r.length > 0;
return {
openDays: u,
days: e,
activitys: r,
start_time: l,
end_time: h,
activeActivity: f,
activeActivityNeedMax: y,
isMarkMap: m,
isNeedMark: g
};
};
d.isMark = !0;
cc._RF.pop();
}, {
activityPanel: "activityPanel",
baseView: "baseView",
carnivalPanel: "carnivalPanel",
clientConfig: "clientConfig",
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
