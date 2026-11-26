topUpPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "e939fcZGXhHs4iEr9Vh+lAr", "topUpPanel");
var t = e("underscore"), n = e("i18n"), i = e("resource"), r = e("serverMain"), s = e("dataApi"), o = (e("soundApi"), 
e("buildExt")), l = e("baseView"), c = e("helper"), d = e("playerHandler"), h = e("serverConfig"), u = e("roleItem"), m = e("itemItem"), g = cc.Class({
extends: cc.Component,
properties: {
vipBt: cc.Node,
topUpBt: cc.Node,
vipSp: cc.Sprite,
vipLabel: cc.Label,
expBar: cc.ProgressBar,
expCountLabel: cc.Label,
nextVipNode: cc.Node,
nextVipDescLabel: cc.Label,
nextVipSp: cc.Sprite,
nextVipLabel: cc.Label,
leftBt: cc.Node,
rightBt: cc.Node,
goodsScrollview: cc.Node,
goodsItemsLayout: cc.Node,
goodsItem: cc.Node,
vipScrollview: cc.Node,
vipMoreSp: cc.Node,
titleVipSp: cc.Sprite,
titleVipLabel: cc.Label,
textsLayout: cc.Node,
newTextNode: cc.Node,
textNode: cc.Node,
vipGiftBgSp: cc.Node,
giftReceiveBt: cc.Node,
giftVipLabel: cc.Label,
giftItemItemsLayout: cc.Node,
giftItemItem: cc.Node,
giftRoleItemNode: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
g.instance || (g.instance = this);
this.goodsItem.active = !1;
this.newTextNode.active = !1;
this.textNode.active = !1;
this.giftItemItem.active = !1;
this.giftRoleItemNode.active = !1;
cc.tween(this.vipMoreSp).repeatForever(cc.tween().to(1, {
opacity: 0
}).to(1, {
opacity: 150
})).start();
this.isShowVip = !1;
this.isFadeIn = !1;
this.scheduleOnce(function() {
c.scrollviewFadeIn(this.goodsScrollview);
this.isFadeIn = !0;
}, .3);
},
onDestroy: function() {
g.instance = null;
},
update_: function() {
var e = g.genData();
this.data = e;
this.selectVipLevel = null == this.selectVipLevel ? e.vip : this.selectVipLevel;
var a = 0;
o.svipBegin && this.selectVipLevel >= o.svipBegin && (a = this.selectVipLevel - o.svipBegin + 1);
this.vipBt.active = !this.isShowVip && !o.isHideTopUpVipBt;
this.topUpBt.active = this.isShowVip && !o.isHideTopUpVipBt;
var t = e.svip ? o.svipType : 1;
l.setSpriteFrame(this.vipSp, i["misc_vip_type_" + t + "_png"]);
this.vipLabel.string = e.svip || e.vip;
this.expBar.progress = e.topUpGem / e.vipData.nextLevelTopUpGem;
c.replaceLabel(this.expCountLabel, [ e.topUpGem, e.vipData.nextLevelTopUpGem ]);
if (e.vip == e.maxVipLevel) {
this.expBar.progress = 1;
this.expCountLabel.string = n.t("VIP等级达到上限");
}
this.nextVipNode.active = !!e.nextVipLevel;
if (this.nextVipNode.active) {
c.replaceLabel(this.nextVipDescLabel, [ e.needGem ]);
t = e.nextSvipLevel ? o.svipType : 1;
l.setSpriteFrame(this.nextVipSp, i["misc_vip_type_" + t + "_png"]);
this.nextVipLabel.string = e.nextSvipLevel || e.nextVipLevel;
}
this.goodsScrollview.active = !this.isShowVip && this.isFadeIn;
this.vipScrollview.active = this.isShowVip;
this.vipGiftBgSp.active = this.isShowVip;
if (this.isShowVip) {
t = a ? o.svipType : 1;
l.setSpriteFrame(this.titleVipSp, i["misc_vip2_type_" + t + "_png"]);
this.titleVipLabel.string = a || this.selectVipLevel;
this.newTextNodeMap = this.newTextNodeMap || {};
l.preHideNodeMap(this.newTextNodeMap);
this.textNodeMap = this.textNodeMap || {};
l.preHideNodeMap(this.textNodeMap);
var r = g.genVipItemData(this.selectVipLevel), s = this.selectVipLevel > 0 ? g.genVipItemData(this.selectVipLevel - 1) : null;
if (this.selectVipLevel == e.maxVipLevel) {
r.descStrs = r.descStrs.slice(1);
r.valueStrs = r.valueStrs.slice(1);
}
for (var d in r.descStrs) {
var u = r.descStrs[d], m = r.valueStrs[d], p = !s || u + m != s.descStrs[d] + s.valueStrs[d], _ = p ? this.newTextNodeMap : this.textNodeMap, k = _[d];
if (!k) {
(k = cc.instantiate(p ? this.newTextNode : this.textNode)).parent = this.textsLayout;
_[d] = k;
}
k.active = "0" != String(m);
k.active && l.markHideNode(k);
k.zIndex = p ? 0 : 1;
c.replaceLabel(k.getChildByName("richText").getComponent(cc.RichText), [ u, m ]);
}
l.hideNodeMap(this.newTextNodeMap);
l.hideNodeMap(this.textNodeMap);
this.textsLayout.sortAllChildren();
this.vipScrollview.getComponent("listViewComponent").delayUpdate_(0);
this.vipGiftBgSp.active = !!r.giftRoleItem || r.giftItemItems.length > 0 && !o.isHideActivityBt;
l.setSpriteFrame(this.vipGiftBgSp.getChildByName("vip_sp").getComponent(cc.Sprite), i["misc_vip2_type_" + t + "_png"]);
this.vipGiftBgSp.getChildByName("vip_sp").getChildByName("value_label").getComponent(cc.Label).string = this.titleVipLabel.string;
var f = h.ACTIVITY.CONSTS.STATUS, y = r.giftStatus == f.CAN_RECEIVE;
this.giftReceiveBt.getComponent(cc.Button).interactable = y;
l.setGray(this.giftReceiveBt, y);
this.giftReceiveBt.getChildByName("Label").getComponent(cc.Label).string = r.giftStatus == f.COMPLETE ? n.t("已领取") : n.t("领取");
this.giftReceiveBt.data = {
activityName: r.giftActivityName,
rewardIdx: r.giftRewardIdx
};
this.giftRoleItemNode.active = !!r.giftRoleItem;
if (this.giftRoleItemNode.active) {
this.giftRoleItemNode.getChildByName("role_item").getComponent("roleItem").update_(r.giftRoleItem);
l.addItemEffect(r.giftRoleDrop, this.giftRoleItemNode);
}
this.giftItemItemMap = this.giftItemItemMap || {};
l.preHideNodeMap(this.giftItemItemMap);
for (var d in r.giftItemItems) {
var b = this.giftItemItemMap[d];
if (!b) {
(b = cc.instantiate(this.giftItemItem)).parent = this.giftItemItemsLayout;
b.idx = d;
this.giftItemItemMap[d] = b;
}
b.active = !0;
l.markHideNode(b);
b.getComponent("itemItem").update_(r.giftItemItems[d]);
b.getComponent("itemItem").setShowPanel_(!0);
}
l.hideNodeMap(this.giftItemItemMap);
} else {
this.goodsItemMap = this.goodsItemMap || {};
l.preHideNodeMap(this.goodsItemMap);
for (var d in e.topUpItems) {
var v = this.goodsItemMap[d];
if (!v) {
(v = cc.instantiate(this.goodsItem)).parent = this.goodsItemsLayout;
this.goodsItemMap[d] = v;
}
var S = e.topUpItems[d];
v.active = !0;
l.markHideNode(v);
v.data = S;
var T = v.getChildByName("icon_sp").getComponent(cc.Sprite);
l.setSpriteFrame(T, i["misc_top_up_icon_" + S.imgId + "_png"]);
v.getChildByName("recommend_sp").active = S.isRecommend;
v.getChildByName("name_label").getComponent(cc.Label).string = S.name;
v.getChildByName("price_bg_sp").getChildByName("price_label").getComponent(cc.Label).string = S.show;
var M = "";
S.isMonthCard ? M = n.t("30天每天领取$1钻石", [ S.dailyGem ]) : S.isBigMonthCard ? M = n.t("30天每天领取$1钻石", [ S.dailyGem ]) : S.isYearCard ? M = n.t("365天每天领取$1钻石", [ S.dailyGem ]) : S.isWeekCard ? M = n.t("7天每天领取$1钻石", [ S.dailyGem ]) : S.gift && (M = n.t("+$1钻石", [ S.gift ]));
M = S.desc || M;
var $ = S.isFirstDouble ? n.t("(限一次)") : "", I = v.getChildByName("desc_bg_sp"), C = I.getChildByName("desc_label").getComponent(cc.Label);
c.replaceLabel(C, [ M, $ ]);
I.active = "" != C.string;
v.getChildByName("double_sp").active = 1 == S.firstGiftRate;
}
l.hideNodeMap(this.goodsItemMap);
}
this.leftBt.active = this.isShowVip && this.selectVipLevel > 0;
this.rightBt.active = this.isShowVip && this.selectVipLevel < e.maxVipLevel;
},
onVip_: function() {
this.isShowVip = !0;
this.update_();
},
onTopUp_: function() {
this.isShowVip = !1;
this.update_();
},
onSwitch_: function(e, a) {
this.selectVipLevel += Number(a);
this.update_();
},
onGoodsItem_: function(e, a) {
if (o.closeTopUpMsg) l.addHintPanel(o.closeTopUpMsg); else {
var t = e ? e.target.data : a;
if (o.payByWeb) o.payByWeb(t.id, t.name); else if (!o.isUseTopUpPoint && !o.moneyTicketId || t.isNoUsePoint) {
o.isShowBtDiscount && (t.priceRate = 100);
sdkApi.pay(t.id, t.price * (t.priceRate || 1), t.name, t.gem || 0);
sdkApi.emitData(sdkApi.EMIT_TYPE.BEGIN_TOP_UP);
} else l.addPointBuyConfirmPanel(t.id, t.isUseMoneyTicket2);
}
},
onGiftReceive_: function(e, a) {
var n = e ? e.target.data : a, i = this;
l.addLoading();
d.receiveActivityAward([ n.activityName ], [ n.rewardIdx ], function(e) {
l.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var n in a) l.addPointRoleEffectNode(a[n]);
}
i.update_();
});
},
onClose_: function() {
this.isShowVip = !1;
this.selectVipLevel = null;
l.removePanel(this.node);
},
onScroll_: function(e) {
this.vipMoreSp.active = e.getScrollOffset().y != e.getMaxScrollOffset().y;
}
});
g.genData = function() {
var e = r.player, a = e.vip, n = e.vipData, i = e.extra.goodsList;
i = t.sortBy(i, function(e) {
return e.isMonthCard ? -9999999 : e.isBigMonthCard ? -9999998 : e.isYearCard ? -9999997 : e.isWeekCard ? -9999996 : -e.price;
});
var l = a.level + 1;
0 == s.vip.findBy("level", l).length && (l = null);
var c = n.nextLevelTopUpGem - a.topUpGem, d = [];
for (var h in i) if (!i[h].point && (!(i[h].id > 100) || o.isShowAllGoods) && (!o.skipGoodsIds || !t.include(o.skipGoodsIds, i[h].id))) {
var u = g.genTopUpItemData(i[h]);
d.push(u);
}
var m = s.vip.all(), p = t.last(t.values(m)).level, _ = 0;
o.svipBegin && e.vip.level >= o.svipBegin && (_ = e.vip.level - o.svipBegin + 1);
var k = 0;
o.svipBegin && l >= o.svipBegin && (k = l - o.svipBegin + 1);
return {
vip: a.level,
svip: _,
nextVipLevel: l,
nextSvipLevel: k,
maxVipLevel: p,
topUpGem: a.topUpGem,
needGem: c,
vipData: n,
topUpItems: d
};
};
g.genTopUpItemData = function(e) {
var a = r.player.buyGoodsTimesMap, t = e.firstGiftRate || (e.isFirstDouble ? 1 : 0), i = (t = a[e.id] ? 0 : t) ? e.gem * t : e.gift, s = n.t(e.show, [ e.price ]), o = n.t(e.name, [ e.gem || e.price ]);
return {
id: e.id,
name: o,
desc: e.desc,
imgId: e.imgId,
isRecommend: e.isRecommend && 0 == t,
price: e.price,
priceRate: e.priceRate || 1,
gem: e.gem,
gift: i,
show: s,
isMonthCard: e.isMonthCard,
isBigMonthCard: e.isBigMonthCard,
isYearCard: e.isYearCard,
isWeekCard: e.isWeekCard,
dailyGem: e.dailyGem,
firstGiftRate: t
};
};
g.genVipItemData = function(e) {
var a = r.player.activity.map.upgradeVip, i = s.vip.findOneBy("level", e), o = [], l = [];
for (var c in i) if (!t.include([ "kindId", "level" ], c)) switch (c) {
case "nextLevelTopUpGem":
var d = n.t("累计充值$1钻石即可成为VIP$2", [ i[c] ]);
o.push(d.split("$2")[0]);
l.push(e + 1);
break;

case "buyActionPointTimes":
o.push(n.t("每日可购买行动力次数:"));
l.push(i[c]);
break;

case "resetSmapTimesTimes":
o.push(n.t("每日可重置精英副本次数:"));
l.push(i[c]);
break;

case "buyCoinTimes":
o.push(n.t("每日可购买金币次数:"));
l.push(i[c]);
break;

case "buyChallengeTimesTimes":
o.push(n.t("每日可重置武道会挑战次数:"));
l.push(i[c]);
break;

case "buy3v3ChallengeTimesTimes":
o.push(n.t("每日可重置沙鲁游戏挑战次数:"));
l.push(i[c]);
break;

case "worshipStatue3v3Times":
o.push(n.t("每日沙鲁游戏膜拜次数:"));
l.push(i[c]);
break;

case "buyMoney112Times":
o.push(n.t("每日可购买神币次数:"));
l.push(i[c]);
break;

case "increaseSkillPointMax":
o.push(n.t("增加技能点数恢复上限为:"));
l.push(i[c]);
break;

case "resetExpeditionTimes":
o.push(n.t("每日可重置强者争霸次数:"));
l.push(i[c]);
break;

case "isSkipBattle":
if (!i[c]) break;
o.push(n.t("可使用竞技场跳过战斗"));
l.push("");
break;

case "increaseMapType3Times":
o.push(n.t("增加每日可挑战战士进阶次数:"));
l.push(i[c]);
break;

case "increaseMapType4Times":
o.push(n.t("增加每日可挑战战士历练次数:"));
l.push(i[c]);
break;

case "increaseMapType6Times":
o.push(n.t("增加每日可挑战传奇关卡次数:"));
l.push(i[c]);
break;

case "increaseMapType5Times":
o.push(n.t("增加每日可挑战战神历练次数:"));
l.push(i[c]);
break;

case "buyMapType5TimesTimes":
o.push(n.t("每日可购买战神历练次数:"));
l.push(i[c]);
break;

case "isUpgradeAllEquipmentMax":
if (!i[c]) break;
o.push(n.t("可使用全部强化功能"));
l.push("");
break;

case "tailChallengeTimesTimes":
o.push(n.t("每日拯救地球挑战次数:"));
l.push(i[c]);
break;

case "shipUpgradeLevelTimes":
o.push(n.t("每日可钻石升级伙伴次数:"));
l.push(i[c]);
break;

case "endlessSkipTimes":
o.push(n.t("每日可扫荡无尽蛇道次数:"));
l.push(i[c]);
break;

case "buyEyeChallengeTimesTimes":
o.push(n.t("每日可购买体能训练抢位次数:"));
l.push(i[c]);
break;

case "worshipStatueTimes":
o.push(n.t("每日全览大会膜拜次数:"));
l.push(i[c]);
break;

case "resetSixExpeditionTimes":
o.push(n.t("每日可重置宇宙冒险次数:"));
l.push(i[c]);
break;

case "worshipStatueExtTimes":
o.push(n.t("每日力之大会膜拜次数:"));
l.push(i[c]);
}
for (var g = t.find(a.rewards, function(a) {
return a.needMap.vipLevel == e;
}), p = g ? h.DROP.FUNS.getDropListByDesc(g.dropListDesc) : [], _ = null, k = null, f = [], y = 0; y < p.length; y++) if (s.findEntityById(p[y].entityId).type == h.CONSTS.ENTITY_TYPE.ROLE) {
k = p[y];
_ = u.genData({
kindId: p[y].entityId,
star: p[y].extra.star
});
} else {
var b = m.genData({
kindId: p[y].entityId,
count: p[y].count,
extra: p[y].extra
}, !0);
f.push(b);
}
var v = t.indexOf(a.rewards, g), S = g ? g.status : null;
return {
descStrs: o,
valueStrs: l,
giftRewardIdx: v,
giftActivityName: a.name,
giftStatus: S,
giftRoleDrop: k,
giftRoleItem: _,
giftItemItems: f
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
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
