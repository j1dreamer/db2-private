shipScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "7c107ZWpjxCEpD1QI9A3M7z", "shipScene");
var t = e("underscore"), n = e("i18n"), i = e("helper"), r = e("baseView"), s = (e("socket"),
e("soundApi")), o = e("buildExt"), l = e("dataApi"), c = e("serverMain"), d = (e("clientConfig"),
e("serverConfig")), h = e("player"), u = e("resource"), m = (e("teamHandler"), e("bagHandler")), g = e("upgradeShowPanel"), p = e("rulePanel"), _ = (e("skillInfoPanel"),
e("sceneManager")), k = d.SHIP.CONSTS, f = d.SHIP.FUNS, y = cc.Class({
extends: cc.Component,
properties: {
shipScrollview: cc.Node,
shipTeamItem: cc.Node,
shipTeamItemsLayout: cc.Node,
topBgSp: cc.Node,
fromBt: cc.Node,
armatureNode: cc.Node,
upgradeSpine: cc.Node,
nameLabel: cc.Label,
monenyCountLabel: cc.Label,
fragmentBar: cc.ProgressBar,
fragmentCountLabel: cc.Label,
fragmentMaxLabel: cc.Node,
skillItem: cc.Node,
skillInfoPanel: cc.Node,
upgradeSkillCostGemLabel: cc.Label,
upgradeStarBt: cc.Node,
composeBt: cc.Node,
starLabel: cc.Label,
levelLabel: cc.Label,
attrSp1: cc.Sprite,
attrSp2: cc.Sprite,
attrType1SpriteFrame: cc.SpriteFrame,
attrType2SpriteFrame: cc.SpriteFrame,
attrType3SpriteFrame: cc.SpriteFrame,
attrValueLabel: cc.Label,
attrIncLabel: cc.Label,
expBar: cc.ProgressBar,
expLabel: cc.Label,
timesABt: cc.Node,
timesALabel: cc.Label,
timesACostLabel: cc.Label,
timesBBt: cc.Node,
timesBLabel: cc.Label,
timesBCostLabel: cc.Label,
gemUpgradeTimesLabel: cc.Label,
gemUpgradeCostLabel: cc.Label
},
onLoad: function() {
_.curSceneStatusData = t.extend({
selectIdx: 0
}, _.curSceneStatusData);
this.statusData = _.curSceneStatusData;
this.onFun = this.update_.bind(this);
c.player.on(h.EVENT.BAG, this.onFun);
this.shipScrollview.active = !1;
this.shipTeamItem.active = !1;
this.topBgSp.active = !1;
this.upgradeSpine.active = !1;
this.scheduleOnce(function() {
i.scrollviewFadeIn(this.shipScrollview);
}, 0);
this.update_();
},
onDestroy: function() {
c.player.off(h.EVENT.BAG, this.onFun);
y.sortValMap = {};
},
update_: function() {
var e = y.genData();
this.data = e;
e.shipTeamItems = t.sortBy(e.shipTeamItems, function(e) {
if (y.sortValMap[e.classId]) return y.sortValMap[e.classId];
var a;
if (e.isHave) {
a = -(100 * e.star + e.level);
y.sortValMap[e.classId] = a;
} else if (e.isCanCompose) {
a = -1e4;
y.sortValMap[e.classId] = a;
} else a = 0;
return a;
});
this.shipTeamItemsLayout.getChildByName("no_item_1").zIndex = 1;
this.shipTeamItemsLayout.getChildByName("no_item_2").zIndex = 3;
this.shipTeamItemMap = this.shipTeamItemMap || {};
r.preHideNodeMap(this.shipTeamItemMap);
this.teamItemMap = {};
for (var a in e.shipTeamItems) {
var s = this.shipTeamItemMap[a];
if (!s) {
(s = cc.instantiate(this.shipTeamItem)).parent = this.shipTeamItemsLayout;
this.shipTeamItemMap[a] = s;
}
s.zIndex = 2;
s.idx = a;
this.teamItemMap[a] = s;
s.active = !0;
r.markHideNode(s);
var o = e.shipTeamItems[a];
s.data = o;
r.setMark(s, o.isNeedMark);
var l = o.isHave ? e.shipTeamItems[a].classId : 0;
r.setSpriteFrame(s.getChildByName("ship_sp").getComponent(cc.Sprite), u["ship_" + l + "_png"]);
s.effectSpine = s.getChildByName("effect_spine");
s.effectSpine.active = !1;
s.getChildByName("status_sp").active = !o.isHave;
r.setGray(s, !!o.isHave);
r.setGray(s.getChildByName("select_sp"), !0);
r.setGray(s.getChildByName("fragment_bar"), !0);
s.getChildByName("name_label").getComponent(cc.Label).string = o.name;
var c = s.getChildByName("star_label"), d = s.getChildByName("level_label"), h = s.getChildByName("attr_layout");
c.getComponent(cc.Label).string = n.t("$1阶", [ o.star ]);
d.getComponent(cc.Label).string = n.t("$1级", [ o.level ]);
h.active = o.isHave;
var m = {
1: n.t("生命"),
2: n.t("攻击"),
3: n.t("防御")
};
h.getChildByName("attr_label").getComponent(cc.Label).string = m[o.attrType];
i.replaceLabel(h.getChildByName("value_label").getComponent(cc.Label), [ o.attrVal ]);
var g = s.getChildByName("fragment_bar"), p = g.getChildByName("count_label");
if (o.isHave) {
var _ = o.star == k.MAX_STAR;
g.getComponent(cc.ProgressBar).progress = _ ? 1 : o.fragmentCount / o.upgradeStarRequireCount;
p.active = !_;
_ || i.replaceLabel(p.getComponent(cc.Label), [ o.fragmentCount, o.upgradeStarRequireCount ]);
g.getChildByName("max_label").active = _;
} else {
g.getComponent(cc.ProgressBar).progress = o.fragmentCount / o.composeRequireCount;
i.replaceLabel(p.getComponent(cc.Label), [ o.fragmentCount, o.composeRequireCount ]);
}
}
r.hideNodeMap(this.shipTeamItemMap);
this.teamItems = t.values(this.teamItemMap);
this.onTeamItem_({
target: this.teamItemMap[this.statusData.selectIdx]
});
},
onScroll_: function(e, a) {
switch (a) {
case cc.ScrollView.EventType.SCROLLING:
for (var t in this.teamItems) {
var n = this.teamItems[t], i = this.teamItems[t].x + e.content.x - .5 * e.node.width;
n.scale = 1 - 5e-4 * Math.abs(i);
n.y = -.2 * Math.abs(i);
n.angle = -.04 * i;
}
}
},
onTeamItem_: function(e) {
var a = e.target, s = a.data;
this.statusData.selectIdx = a.idx;
t.each(this.teamItemMap, function(e) {
e.getChildByName("select_sp").active = !1;
});
a.getChildByName("select_sp").active = !0;
this.shipScrollview.getComponent(cc.ScrollView).stopAutoScroll();
this.shipScrollview.getComponent(cc.ScrollView).scrollToOffset(cc.v2(Math.abs(a.x - .5 * this.shipScrollview.width), 0), .5);
this.topBgSp.active = !0;
this.topBgSp.getChildByName("right_layout").active = s.isHave;
if (this.armatureNode.shipNode && this.armatureNode.shipNode.getComponent("shipArmatureComponent").data.classId != s.classId) {
this.armatureNode.shipNode.destroy();
this.armatureNode.shipNode = null;
}
if (!this.armatureNode.shipNode && s.isHave) {
var o = r.getShipNode(s.classId);
o.parent = this.armatureNode;
o.scale = 1.6;
this.armatureNode.shipNode = o;
}
this.armatureNode.getChildByName("no_have_sp").active = !s.isHave;
this.nameLabel.string = s.name;
this.monenyCountLabel.string = this.data.monenyCount;
var l = s.star == k.MAX_STAR;
if (s.isHave) {
this.fragmentBar.progress = l ? 1 : s.fragmentCount / s.upgradeStarRequireCount;
l || i.replaceLabel(this.fragmentCountLabel, [ s.fragmentCount, s.upgradeStarRequireCount ]);
} else {
this.fragmentBar.progress = s.fragmentCount / s.composeRequireCount;
i.replaceLabel(this.fragmentCountLabel, [ s.fragmentCount, s.composeRequireCount ]);
}
this.fragmentCountLabel.node.active = !l;
this.fragmentMaxLabel.active = l;
this.skillItem.getComponent("skillItem").update_(s.skillItem, this.skillInfoPanel);
this.upgradeSkillCostGemLabel.string = s.upgradeSkillCostGem || 0;
this.upgradeSkillCostGemLabel.node.parent.active = !!s.upgradeSkillCostGem;
this.upgradeStarBt.active = s.isHave;
this.upgradeStarBt.getChildByName("light_sp").active = s.isCanUpgradeStar;
this.composeBt.active = !s.isHave;
this.composeBt.getChildByName("light_sp").active = s.isCanCompose;
this.fromBt.data = {
fragmentId: s.fragmentId,
requireCount: s.isHave ? s.upgradeStarRequireCount : s.composeRequireCount
};
if (s.isHave) {
this.starLabel.string = n.t("$1阶", [ s.star ]);
this.levelLabel.string = n.t("$1级", [ s.level ]);
i.replaceLabel(this.attrValueLabel, [ s.attrVal ]);
i.replaceLabel(this.attrIncLabel, [ s.attrGrowth ]);
this.expBar.progress = s.experience / s.nextLevelExp;
i.replaceLabel(this.expLabel, [ s.experience, s.nextLevelExp ]);
this.timesABt.data = {
experience: 100
};
if (this.data.monenyCount < 100 && this.data.monenyCount > 10) {
var c = Math.floor(this.data.monenyCount / 10);
this.timesABt.data.experience = 10 * c;
}
this.data.monenyCount > 1e3 && (this.timesABt.data.experience = 1e3);
i.replaceLabel(this.timesALabel, [ this.timesABt.data.experience / 10 ]);
this.timesACostLabel.string = this.timesABt.data.experience;
this.timesBBt.data = {
experience: this.data.monenyCount > 1e5 ? 1e5 : 1e4
};
i.replaceLabel(this.timesBLabel, [ this.timesBBt.data.experience / 10 ]);
this.timesBCostLabel.string = this.timesBBt.data.experience;
i.replaceLabel(this.gemUpgradeTimesLabel, [ this.data.remainingTimes, this.data.maxTimes ]);
this.gemUpgradeCostLabel.string = s.upgradeCostGem;
this.attrSp1.spriteFrame = this["attrType" + s.attrType + "SpriteFrame"];
this.attrSp2.node.active = 3 == s.attrType;
}
},
onCompose_: function() {
var e = this.teamItemMap[this.statusData.selectIdx], a = n.t("是否花费$1金币合成伙伴?", [ k.COMPOSE_COST_COIN ]);
r.addMessageBox(a, function() {
r.addLoading();
m.composeShip(e.data.fragmentId, function() {
i.spineEffect(e.effectSpine);
s.playEffect(u.sound_effect_ship_compose_mp3);
});
});
},
onUpgradeStar_: function() {
var e = this.teamItemMap[this.statusData.selectIdx], a = this;
r.addLoading();
m.upgradeShipStar(e.data.bagIndex, function() {
i.spineEffect(e.effectSpine);
a.scheduleOnce(function() {
r.addUpgradeShowPanel(g.TYPE.UPGRADE_SHIP_STAR, null, null, e.data._ship);
}, .5);
});
},
onAddExperience_: function(e) {
var a = e.target.data, t = this.teamItemMap[this.statusData.selectIdx];
r.addLoading();
var n = t.data.level, o = this.expBar.progress, l = this;
m.addShipExperience(t.data.bagIndex, a.experience, function() {
if (t.data.level > n) {
i.spineEffect(l.upgradeSpine);
s.playEffect(u.sound_effect_upgrade_tail_level_mp3);
}
var e = l.expBar.progress;
e > o ? l.expBar.progress = o : e != o && (l.expBar.progress = 0);
cc.Tween.stopAllByTarget(l.expBar);
cc.tween(l.expBar).to(1, {
progress: e
}).start();
s.playEffect(u.sound_effect_tail_add_exp_mp3);
});
},
onGemUpgrade_: function() {
var e = this.teamItemMap[this.statusData.selectIdx];
r.addLoading();
var a = this;
m.upgradeShip(e.data.bagIndex, function() {
i.spineEffect(a.upgradeSpine);
s.playEffect(u.sound_effect_upgrade_tail_level_mp3);
});
},
onUpgradeSkill_: function() {
var e = this.teamItemMap[this.statusData.selectIdx];
r.addLoading();
var a = this;
m.upgradeShipSkill(e.data.bagIndex, function() {
var n = l.fightSkill.findById(e.data.skillItem.skillId), o = t.clone(n.label), c = a.skillItem.convertToWorldSpaceAR(cc.Vec2.ZERO);
c.y += 30;
for (var d in o) {
o[d] = o[d].replace("$", Math.abs(Number(n.growth[d])));
o[d] = o[d].replace("%", i.floatStrip(Math.abs(100 * n.growth[d])) + "%");
a.scheduleOnce(function() {
r.showText(this.str, this.pos);
}.bind({
str: o[d],
pos: c
}), .5 * d);
}
var h = a.skillItem.getComponent("skillItem").effectArmature;
i.spineEffect(h);
s.playEffect(u.sound_effect_skill_upgraded_mp3);
});
},
onRule_: function() {
r.addRulePanel(p.TYPE.TAIL_UPGRADE);
},
onItemFrom_: function(e) {
var a = e.target.data;
r.addItemFromPanel(a.fragmentId, a.requireCount);
}
});
y.sortValMap = {};
y.genData = function() {
var a = c.player.bag, n = c.player.vip, i = c.player.vipData, r = !1, s = a.getItemByType(d.CONSTS.ENTITY_TYPE.SHIP), h = [];
for (var u in s) {
var m = s[u], g = l.findEntityById(m.kindId), p = a.getItemCount(g.fragmentId), _ = f.getUpgradeStarCostFragment(m.star + 1), y = p >= _ && m.star < k.MAX_STAR && m.level == k.MAX_LEVEL;
y && (r = !0);
var b = d.SHIP.FUNS.getAttrVal(m), v = e("shipItem").genData(m), S = e("skillItem").genData(g.skillId, m.skillLevel), T = d.SKILL.FUNS.getShipUpgradeCost(m.skillLevel), M = d.SHIP.FUNS.getUpgradeSkillCostGem(m.skillLevel);
S.costCoin = T;
var $ = m.nextLevelExp - m.experience;
$ = $ < 0 ? 0 : $;
var I = Math.ceil(k.UPGRADE_COST_GEM * $ / m.nextLevelExp), C = {
classId: g.classId,
name: g.kindName,
star: m.star,
level: m.level,
attrType: g.attrType,
attrVal: b,
attrGrowth: g.growth,
shipItem: v,
fragmentId: g.fragmentId,
fragmentCount: p,
upgradeStarRequireCount: _,
isCanUpgradeStar: y,
skillItem: S,
upgradeSkillCostGem: M,
experience: m.experience,
nextLevelExp: m.nextLevelExp,
upgradeCostGem: I,
bagIndex: m.idx,
isHave: !0,
isNeedMark: y,
_ship: m
};
h.push(C);
}
var P = l.ship.all();
for (var u in P) {
g = l.findEntityById(P[u].kindId);
if (!a.getItemByKindId(g.kindId)) {
v = e("shipItem").genData({
kindId: g.kindId
}), p = a.getItemCount(g.fragmentId);
var D = k.COMPOSE_REQUIRED_FRAGMENT_COUNT, N = p >= D;
S = e("skillItem").genData(g.skillId, 0), C = {
classId: g.classId,
name: g.kindName,
star: 0,
level: 0,
attrType: g.attrType,
attrVal: 0,
shipItem: v,
skillItem: S,
fragmentId: g.fragmentId,
fragmentCount: p,
composeRequireCount: D,
isCanCompose: N,
isHave: !1
};
h.push(C);
N && (r = !0);
}
}
var A = o.hideShipClassIds || c.player.shop.hideShipClassIds;
A && (h = t.filter(h, function(e) {
return !t.include(A, e.classId);
}));
var L = a.getItemCount(k.ADD_EXP_COST_ENTITY_ID), E = i.shipUpgradeLevelTimes;
return {
isNeedMark: r,
shipTeamItems: h,
monenyCount: L,
maxTimes: E,
remainingTimes: E - n.shipUpgradeLevelTimes
};
};
cc._RF.pop();
}, {
bagHandler: "bagHandler",
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
player: "player",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipItem: "shipItem",
skillInfoPanel: "skillInfoPanel",
skillItem: "skillItem",
socket: "socket",
soundApi: "soundApi",
teamHandler: "teamHandler",
underscore: "underscore",
upgradeShowPanel: "upgradeShowPanel"
} ],
