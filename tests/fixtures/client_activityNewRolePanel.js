activityNewRolePanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "eb31aNPo2VBlpuuH5UzLbTu", "activityNewRolePanel");
var t = e("underscore"), n = e("underscore.string"), i = e("moment"), r = (e("soundApi"), 
e("dataApi")), s = e("resource"), o = e("i18n"), l = e("player"), c = e("helper"), d = e("baseView"), h = (e("clientConfig"), 
e("serverConfig")), u = e("serverMain"), m = e("skillItem"), g = e("roleItem"), p = e("itemItem"), _ = e("topUpPanel"), k = e("playerHandler"), f = h.ACTIVITY.CONSTS, y = cc.Class({
extends: cc.Component,
properties: {
groupSp: cc.Sprite,
armatureNode: cc.Node,
leftNodeTitleLabel: cc.Label,
leftSkillLayout: cc.Node,
skillInfoPanel: cc.Node,
activityScrollview: cc.Node,
activityItemsLayout: cc.Node,
activityItem: cc.Node,
activityTimeTypeLabel: cc.Label,
activityTimeLabel: cc.Label,
activityReachLayout: cc.Node,
activityRewardItemItem: cc.Node,
activityRewardRoleItemNode: cc.Node
},
onLoad: function() {
this.activityItem.active = !1;
this.activityRewardItemItem.active = !1;
this.activityRewardRoleItemNode.active = !1;
this.activityScrollview.active = !1;
this.isFadeIn = !1;
this.scheduleOnce(function() {
c.scrollviewFadeIn(this.activityScrollview);
this.isFadeIn = !0;
}, .2);
y.isMark = !1;
},
update_: function() {
var e = y.genData();
this.data = e;
this.isFadeIn || (this.activityScrollview.active = !0);
d.setSpriteFrame(this.groupSp, s["misc_role_big_group_" + e.group + "_png"]);
if (this.armatureNode.characterNode && this.armatureNode.characterNode.getComponent("characterArmatureComponent").data.classId != e.classId) {
this.armatureNode.characterNode.destroy();
this.armatureNode.characterNode = null;
}
if (!this.armatureNode.characterNode) {
var a = d.getCharacterNode(e.classId);
a.parent = this.armatureNode;
this.armatureNode.characterNode = a;
}
this.leftNodeTitleLabel.string = e.roleName;
for (var n = 0; n < 4; n++) {
var i = this.leftSkillLayout.getChildByName("skill_item_" + (n + 1)).getComponent("skillItem");
i.update_(e.skillItems[n], this.skillInfoPanel);
d.setGray(i.skillSp.node, !0);
}
var l = e.activity, m = this.activityReachLayout.getChildByName("name_label").getComponent(cc.Label);
c.replaceLabel(m, [ e.isTopUpGem ? o.t("当前已充值钻石") : o.t("当前已充值金额") ]);
var _ = this.activityReachLayout.getChildByName("value_label").getComponent(cc.Label);
_.string = c.floatStrip(l.reachMap[f.NEED_KEY.TOP_UP_MONEY] || 0);
e.isTopUpGem && (_.string = c.floatStrip(l.reachMap[f.NEED_KEY.TOP_UP_GEM] || 0));
this.activityItemMap = this.activityItemMap || {};
d.preHideNodeMap(this.activityItemMap);
for (var n in l.rewards) {
var k = this.activityItemMap[n];
if (!k) {
(k = cc.instantiate(this.activityItem)).parent = this.activityItemsLayout;
k.idx = n;
this.activityItemMap[n] = k;
}
k.zIndex = Number(n);
k.active = !0;
d.markHideNode(k);
var b = l.rewards[n];
k.data = b;
k.opacity = b.status == f.STATUS.COMPLETE ? 76.5 : 255;
k.zIndex = b.status == f.STATUS.COMPLETE ? 100 : k.zIndex;
b.status == f.STATUS.CAN_RECEIVE && (k.zIndex = Number(n) - 100);
var v = k.getChildByName("receive_bt");
v.data = {
activityName: e.activity.name,
rewardIdx: n
};
v.active = b.status == f.STATUS.CAN_RECEIVE;
var S = u.player.extra.goodsList[t.keys(b.needMap)[0].split("_")[1]], T = k.getChildByName("price_label");
T.active = !!S;
T.active && (T.getComponent(cc.Label).string = o.t(S.show, [ S.price ]));
k.getChildByName("title_label").getComponent(cc.Label).string = o.t(b.desc, [ "限购$1次", b.buyMaxTimes - (b.buyTimes || 0) ]);
k.getChildByName("complete_sp").active = b.status == f.STATUS.COMPLETE;
var M = k.getChildByName("buy_bt");
M.active = !!S && b.status == f.STATUS.UN_COMPLETE;
M.active && (M.data = {
id: S.id,
price: S.price,
priceRate: S.priceRate || 1,
name: o.t(S.name, [ S.gem || S.price ]),
gem: S.gem
});
var $ = k.getChildByName("reward_layout");
k.itemItemMap = k.itemItemMap || {};
d.preHideNodeMap(k.itemItemMap);
k.roleItemNodeMap = k.roleItemNodeMap || {};
d.preHideNodeMap(k.roleItemNodeMap);
var I = 0, C = 0;
for (var P in l.rewards[n].dropList) {
var D = l.rewards[n].dropList[P];
if (r.findEntityById(D.entityId).type == h.CONSTS.ENTITY_TYPE.ROLE) {
var N = k.roleItemNodeMap[I];
if (!N) {
(N = cc.instantiate(this.activityRewardRoleItemNode)).parent = $;
N.idx = I;
k.roleItemNodeMap[I] = N;
}
N.active = !0;
d.markHideNode(N);
var A = g.genData({
kindId: D.entityId,
star: D.extra.star
});
d.addItemEffect(D, N);
N.getChildByName("role_item").getComponent("roleItem").update_(A);
I++;
} else {
var L = k.itemItemMap[C];
if (!L) {
(L = cc.instantiate(this.activityRewardItemItem)).parent = $;
L.idx = C;
k.itemItemMap[C] = L;
}
L.active = !0;
d.markHideNode(L);
L.getComponent("itemItem").setShowPanel_(!0);
var E = p.genData({
kindId: D.entityId,
count: D.count,
extra: D.extra
}, !0);
L.getComponent("itemItem").update_(E);
d.addItemEffect(D, L);
C++;
}
}
d.hideNodeMap(k.itemItemMap);
d.hideNodeMap(k.roleItemNodeMap);
c.updateLayout($);
var B = k.width / ($.width + 25);
B = B > .6 ? .6 : B;
$.scale = B;
}
d.hideNodeMap(this.activityItemMap);
this.activityItemsLayout.sortAllChildren();
this.activityScrollview.getComponent("listViewComponent").delayUpdate_(.2);
this.isFadeIn || (this.activityScrollview.active = !1);
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
onClose_: function() {
d.removePanel(this.node);
u.player.emit(l.EVENT.ATTRS, []);
},
onReceive_: function(e) {
var a = e.target.data, n = this;
d.addLoading();
k.receiveActivityAward([ a.activityName ], [ a.rewardIdx ], function(e) {
d.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var i in a) d.addPointRoleEffectNode(a[i]);
}
n.update_();
});
},
onArmature_: function() {
this.armatureNode.characterNode.getComponent("characterArmatureComponent").playRandom_();
},
onBuy_: function(e, a) {
h.ACTIVITY.FUNS.checkOpen(this.data.activity, u.player.serverId) ? _.prototype.onGoodsItem_(e, a) : d.addHintPanel(o.t("活动已结束"));
},
tick_: function() {
var e, a = this.activityTimeTypeLabel, t = this.activityTimeLabel, n = o.t("结束时间:"), r = this.data.activity.start_time, s = this.data.activity.end_time;
if (-1 == r) e = o.t("永久"); else if (u.tTime(r) < Date._now()) if (u.tTime(s) > Date._now()) {
var l = u.tTime(s) - Date._now();
l = l < 0 ? 0 : l;
var d = i.duration(l), h = Math.floor(d.asDays());
e = c.formatDuration(d.hours(), d.minutes(), d.seconds());
h > 0 && (e = o.t("$1天$2", [ h, e ]));
} else e = o.t("已结束"); else {
n = o.t("开启时间:");
e = i(u.tTime(s)).from(Date._now());
}
a && (a.string = n);
t && (t.string = e);
}
});
y.genData = function() {
var e = u.player, a = t.values(e.activity.map);
a = t.without(a, null);
var i = t.chain(a).filter(function(e) {
return n.include(e.name, "topUpMoneyNewRole") && !e.isSuccess;
}).sortBy(function(a) {
return a.rewards && t.findWhere(a.rewards, {
status: f.STATUS.CAN_RECEIVE
}) ? 1 : h.ACTIVITY.FUNS.checkOpen(a, e.serverId) ? 2 : 10;
}).value()[0];
if (!i) return null;
i && t.each(i.rewards, function(e) {
e.dropList = e.dropListDesc ? h.DROP.FUNS.getDropListByDesc(e.dropListDesc) : e.dropList;
});
var s = i && i.rewards && t.findWhere(i.rewards, {
status: f.STATUS.CAN_RECEIVE
}) || y.isMark, o = i ? r.role.findOneBy("classId", i.classId) : null;
o = o ? r.findEntityById(o.kindId) : null;
var l = [];
for (var c in o.skillIds) {
var d = m.genData(o.skillIds[c]);
l.push(d);
}
return {
activity: i,
group: o.group,
roleName: o.kindName,
classId: o.classId,
skillItems: l,
isNeedMark: s
};
};
y.isMark = !0;
cc._RF.pop();
}, {
baseView: "baseView",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
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
