acePackPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "31d303gkuhJnYCNC4pGtWqn", "acePackPanel");
var t = e("underscore"), n = e("baseView"), i = e("underscore.string"), r = (e("clientConfig"), 
e("serverConfig")), s = e("i18n"), o = e("helper"), l = e("dataApi"), c = e("serverMain"), d = (e("soundApi"), 
e("coinTopNode"), e("resource"), e("roleItem")), h = e("itemItem"), u = e("topUpPanel"), m = e("playerHandler"), g = e("moment"), p = r.ACTIVITY.CONSTS, _ = cc.Class({
extends: cc.Component,
properties: {
rewardContent: cc.Node,
rewardItem: cc.Node,
rewardRoleNode: cc.Node,
rewardItemNode: cc.Node,
timeRichText: cc.RichText,
buyAllBt: cc.Node,
bgSp: cc.Sprite,
titleSp: cc.Sprite,
labelSp: cc.Sprite,
btSpriteFrameArr: [ cc.SpriteFrame ],
titleSpriteFrameArr: [ cc.SpriteFrame ],
bgSpriteFrameArr: [ cc.SpriteFrame ],
LabelSpriteFrameArr: [ cc.SpriteFrame ]
},
onLoad: function() {
this.rewardItem.active = !1;
this.rewardRoleNode.active = !1;
this.rewardItemNode.active = !1;
},
tick_: function() {
var e = this.data.activityItem.end_time;
if (-1 != e) if (e < Date.now()) {
o.replaceLabel(this.timeRichText, [ "", s.t("活动已结束") ]);
this.unschedule(this.tick_);
} else {
var a = g.duration(e - Date.now()), t = Math.floor(a.asDays()), n = o.formatDuration(a.hours(), a.minutes(), a.seconds());
t > 0 && (n = s.t("$1天$2小时", [ t, a.hours() ]));
o.replaceLabel(this.timeRichText, [ s.t("结束时间:"), n ]);
} else o.replaceLabel(this.timeRichText, [ s.t("结束时间:"), s.t("永久") ]);
},
update_: function() {
var e = _.genData();
this.data = e;
var a = "acePack1" == e.activityItem.name ? 0 : 1;
this.bgSp.spriteFrame = this.bgSpriteFrameArr[a];
this.titleSp.spriteFrame = this.titleSpriteFrameArr[a];
this.labelSp.spriteFrame = this.LabelSpriteFrameArr[a];
this.rewardItemMap = this.rewardItemMap || {};
n.preHideNodeMap(this.rewardItemMap);
for (var i in e.activityItem.rewards) {
var u = e.activityItem.rewards[i];
if (!u.isBuyAll) {
var m = this.rewardItemMap[i];
if (!m) {
(m = cc.instantiate(this.rewardItem)).parent = this.rewardContent;
m.idx = i;
this.rewardItemMap[i] = m;
}
m.active = !0;
n.markHideNode(m);
m.getChildByName("desc").getComponentInChildren(cc.Label).string = u.desc;
var g = m.getChildByName("reward_layout");
m.itemNodeMap = m.itemNodeMap || {};
n.preHideNodeMap(m.itemNodeMap);
m.roleItemNodeMap = m.roleItemNodeMap || {};
n.preHideNodeMap(m.roleItemNodeMap);
var k = 0, f = 0, y = u.status == p.STATUS.COMPLETE;
for (var b in u.dropList) {
var v = u.dropList[b];
if (l.findEntityById(v.entityId).type == r.CONSTS.ENTITY_TYPE.ROLE) {
var S = m.roleItemNodeMap[k];
if (!S) {
(S = cc.instantiate(this.rewardRoleNode)).parent = g;
S.idx = k;
m.roleItemNodeMap[k] = S;
}
S.active = !0;
n.markHideNode(S);
var T = d.genData({
kindId: v.entityId,
star: v.extra.star
});
S.getChildByName("role_item").getComponent("roleItem").update_(T);
n.addItemEffect(null, S, !y);
S.getChildByName("received_sp").active = y;
k++;
} else {
var M = m.itemNodeMap[f];
if (!M) {
(M = cc.instantiate(this.rewardItemNode)).parent = g;
M.idx = f;
m.itemNodeMap[f] = M;
}
M.active = !0;
n.markHideNode(M);
M.getComponentInChildren("itemItem").setShowPanel_(!0);
var $ = h.genData({
kindId: v.entityId,
count: v.count,
extra: v.extra
}, !0);
M.getComponentInChildren("itemItem").update_($);
n.addItemEffect(null, M, !y);
M.getChildByName("received_sp").active = y;
f++;
}
}
n.hideNodeMap(m.itemNodeMap);
n.hideNodeMap(m.roleItemNodeMap);
var I = t.keys(u.needMap)[0], C = c.player.extra.goodsList[I.split("_")[1]], P = m.getChildByName("buy_bt");
P.data = {
id: C.id,
price: C.price,
priceRate: C.priceRate || 1,
name: s.t(C.name, [ C.gem || C.price ]),
gem: C.gem
};
P.active = !y;
var D = P.getChildByName("price_label").getComponent(cc.Label);
n.getBtDiscountNode(D);
D.string = s.t(C.show, [ C.price ]);
}
}
n.hideNodeMap(this.rewardItemMap);
this.buyAllBt.active = e.isCanBuyAll;
if (this.buyAllBt.active) {
I = t.keys(u.needMap)[0], C = c.player.extra.goodsList[I.split("_")[1]];
this.buyAllBt.data = {
id: C.id,
price: C.price,
priceRate: C.priceRate || 1,
name: s.t(C.name, [ C.gem || C.price ]),
gem: C.gem
};
D = this.buyAllBt.getChildByName("price_label").getComponent(cc.Label);
n.getBtDiscountNode(D);
o.replaceLabel(D, [ s.t(C.show, [ C.price ]) ]);
}
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
onType_: function(e, a) {
this.update_(a);
},
onReceive_: function(e) {
var a = e.target.data, i = this;
n.addLoading();
m.receiveActivityAward([ a.activityName ], [ a.rewardIdx ], function(e) {
n.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var r in a) n.addPointRoleEffectNode(a[r]);
}
i.update_();
});
},
onClose_: function() {
n.removePanel(this.node);
e("homeScene").instance.checkPop_();
},
onBuy_: function(e, a) {
r.ACTIVITY.FUNS.checkOpen(this.data.activityItem, c.player.serverId) ? u.prototype.onGoodsItem_(e, a) : n.addHintPanel(s.t("活动已结束"));
}
});
_.genData = function() {
var e = c.player, a = t.find(t.values(e.activity.map), function(e) {
return i.include(e.name, "acePack1");
});
if (a && a.rewards) {
var n;
(n = t.findWhere(a.rewards, {
isBuyAll: !0
})) && n.status == p.STATUS.COMPLETE && (a = null);
}
a && !a.isSuccess || (a = t.find(t.values(e.activity.map), function(e) {
return i.include(e.name, "acePack2");
}));
return !a || a.isSuccess ? null : (n = t.findWhere(a.rewards, {
isBuyAll: !0
})) && n.status == p.STATUS.COMPLETE ? null : {
activityItem: a,
isCanBuyAll: n && !t.findWhere(a.rewards, {
status: p.STATUS.COMPLETE
})
};
};
cc._RF.pop();
}, {
baseView: "baseView",
clientConfig: "clientConfig",
coinTopNode: "coinTopNode",
dataApi: "dataApi",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
