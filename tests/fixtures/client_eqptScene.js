eqptScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "8d38axl9StES4OxNKGPV2vt", "eqptScene");
var t = e("underscore"), n = (e("http"), e("baseView")), i = e("i18n"), r = e("helper"), s = e("dataApi"), o = e("guide"), l = (e("clientConfig"), 
e("serverConfig")), c = e("serverMain"), d = e("soundApi"), h = e("resource"), u = e("teamHandler"), m = e("player"), g = e("itemItem"), p = e("roleItem"), _ = e("roleScene"), k = e("sceneManager"), f = cc.Class({
extends: cc.Component,
properties: {
starLayout: cc.Node,
groupSp: cc.Sprite,
nameLabel: cc.Label,
titleLabel: cc.Label,
levelLabel: cc.Label,
powerLabel: cc.Label,
expBar: cc.ProgressBar,
expLabel: cc.Label,
evolveLightSp: cc.Node,
baseLayout: cc.Node,
useExpBt: cc.Node,
useExpMaxBt: cc.Node,
btsLayout: cc.Node,
leftBt: cc.Node,
rightBt: cc.Node,
armatureNode: cc.Node,
expItemsPanel: cc.Node,
expItemNode: cc.Node,
itemsLayout: cc.Node,
eqptEvolveEffectArmature: cc.Node,
upgradeItemItem: cc.Node,
upgradeEffectArmature: cc.Node,
itemLevelLabel: cc.Label,
itemNextLevelLabel: cc.Label,
upgradeItemNameLabel: cc.Label,
upgradeAttrsLayout: cc.Node,
upgradeAllTitleLabel: cc.Label,
upgradeAllCostCoinLabel: cc.Label,
upgradeMaxTitleLabel: cc.Label,
upgradeMaxCostCoinLabel: cc.Label,
upgradeAllBt: cc.Node,
upgradeMaxBt: cc.Node,
evolveItemsLayout: cc.Node,
evolveItemNameLabel: cc.Label,
evolveAttrsLayout: cc.Node,
evolveCostCoinLabel: cc.Label,
evolveEffectArmature: cc.Node,
evolveMaxLabel: cc.Node,
powerEffectArmature: cc.Node,
evolveBt: cc.Node,
meetRequiredColor: cc.Color,
noMeetRequiredColor: cc.Color,
starSpriteFrame: cc.SpriteFrame,
noStarSpriteFrame: cc.SpriteFrame,
moonSpriteFrame: cc.SpriteFrame,
sunSpriteFrame: cc.SpriteFrame,
shenSpriteFrame: cc.SpriteFrame
},
statics: {
instance: null
},
onLoad: function() {
f.instance || (f.instance = this);
k.curSceneStatusData = t.extend({
selectBtName: "upgrade_bt",
selectItemName: "item_item_1",
selectFragmentItemName: null,
roleIdx: 1,
roleIdxs: []
}, k.curSceneStatusData);
this.statusData = k.curSceneStatusData;
this.onFun = this.update_.bind(this);
c.player.on(m.EVENT.TEAM, this.onFun);
this.eqptEvolveEffectArmature.active = !1;
this.upgradeEffectArmature.active = !1;
this.evolveEffectArmature.active = !1;
this.powerEffectArmature.active = !1;
this.powerEffectArmature.zIndex = 1;
this.expItemNode.active = !1;
this.expItemNode.x = -20;
this.expItemsPanel.active = !0;
this.expItemsPanel.expItemNodeMap = this.expItemsPanel.expItemNodeMap || {};
var e = s.entity.findBy("type", "consumables");
e = t.filter(e, function(e) {
return e.extra && !!e.extra.roleExp;
});
for (var a in e) {
var n = this.expItemsPanel.expItemNodeMap[e[a].kindId];
if (!n) {
(n = cc.instantiate(this.expItemNode)).active = !0;
n.parent = this.expItemsPanel;
n.data = e[a];
n.itemItem = n.getChildByName("item_item");
n.useCountLabel = n.getChildByName("use_count_label");
this.expItemsPanel.expItemNodeMap[e[a].kindId] = n;
n.targetOff(this);
n.on(cc.Node.EventType.TOUCH_START, this.onExpItem_, this);
n.on(cc.Node.EventType.TOUCH_END, this.onExpItem_, this);
n.on(cc.Node.EventType.TOUCH_CANCEL, this.onExpItem_, this);
}
}
this.expItemsPanel.active = !1;
this.data = null;
var i = c.player.team.getRoleByIdx(this.statusData.roleIdx);
this.update_([ i ]);
var r = this.btsLayout.getChildByName(this.statusData.selectBtName);
this.onType_({
target: r
});
},
onDestroy: function() {
f.instance = null;
c.player.off(m.EVENT.TEAM, this.onFun);
},
update_: function(e) {
var a = e[0];
if (a.idx == this.statusData.roleIdx) {
var s = k.teamData.teamItemMap[this.statusData.roleIdx]._eqptScene;
this.data = s;
this.leftBt.active = s._role.idx != this.statusData.roleIdxs[0];
this.rightBt.active = s._role.idx != t.last(this.statusData.roleIdxs);
for (var o = {}, d = 1; d <= 5; d++) {
var u = this.starLayout.getChildByName("star_" + d + "_sp").getComponent(cc.Sprite);
d <= s.star ? u.spriteFrame = this.starSpriteFrame : u.spriteFrame = this.noStarSpriteFrame;
o[d - 1] = u;
}
for (d = 0; d < s.moon; d++) o[d].spriteFrame = this.moonSpriteFrame;
for (d = 0; d < s.sun; d++) o[d].spriteFrame = this.sunSpriteFrame;
for (d = 0; d < s.shen; d++) o[d].spriteFrame = this.shenSpriteFrame;
n.setSpriteFrame(this.groupSp, h["misc_role_big_group_" + s.group + "_png"], !0, !0);
this.nameLabel.string = s.name;
this.titleLabel.string = s.title;
r.replaceLabel(this.levelLabel, [ s.level ]);
var m = this.powerLabel.prePower || s.power;
if (s.power > m) {
r.scaleEffect(this.powerLabel.node);
r.spineEffect(this.powerEffectArmature);
}
this.powerLabel.prePower = s.power;
this.powerLabel.string = s.power;
this.expBar.progress = s.exp / s.nextLevelExp;
r.replaceLabel(this.expLabel, [ s.exp, s.nextLevelExp ]);
var g = a.level == l.ROLE.FUNS.getMaxLevel(c.player.level, a.star, a.awakeLevel);
if (g) {
this.expBar.progress = 1;
this.expLabel.string = i.t("已满级");
}
this.itemItemMap = {};
for (d = 0; d < 6; d++) {
var p = this.itemsLayout.getChildByName("item_item_" + (d + 1));
p.data = s.itemItems[d];
p.getComponent("itemItem").setClickEvent_(this, "eqptScene", "onItemItem_");
p.getComponent("itemItem").update_(s.itemItems[d]);
this.itemItemMap[p.name] = p;
}
if (this.armatureNode.characterNode && this.armatureNode.characterNode.getComponent("characterArmatureComponent").data.classId != s.classId) {
this.armatureNode.characterNode.destroy();
this.armatureNode.characterNode = null;
}
if (!this.armatureNode.characterNode) {
var _ = n.getCharacterNode(s.classId);
_.parent = this.armatureNode;
_.scale = 1.35;
this.armatureNode.characterNode = _;
}
this.evolveLightSp.active = s.isShowEvolve;
n.setGray(this.useExpBt, !g);
n.setGray(this.useExpMaxBt, !g);
this.useExpBt.getComponent(cc.Button).interactable = !g;
this.useExpMaxBt.getComponent(cc.Button).interactable = !g;
this.onItemItem_({
target: this.itemItemMap[this.statusData.selectItemName]
});
}
},
onUseExpItem_: _.prototype.onUseExpItem_,
onUseExpItemMax_: _.prototype.onUseExpItemMax_,
onExpItem_: _.prototype.onExpItem_,
onEvolveRole_: _.prototype.onEvolve_,
onType_: function(e) {
var a = e.target;
this.statusData.selectBtName = a.name;
t.each(this.btsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
a.getComponent(cc.Button).interactable = !1;
switch (a.name) {
case "upgrade_bt":
this.baseLayout.getChildByName("evolve_bg_sp").active = !1;
this.baseLayout.getChildByName("upgrade_bg_sp").active = !0;
break;

case "evolve_bt":
this.baseLayout.getChildByName("evolve_bg_sp").active = !0;
this.baseLayout.getChildByName("upgrade_bg_sp").active = !1;
}
},
onSwitch_: function(e, a) {
this.powerLabel.prePower = null;
var i = k.teamData.teamItemMap[this.statusData.roleIdx].classId, r = t.indexOf(this.statusData.roleIdxs, String(this.statusData.roleIdx));
this.statusData.roleIdx = this.statusData.roleIdxs[r + Number(a)];
var s = c.player.team.getRoleByIdx(this.statusData.roleIdx);
this.update_([ s ]);
n.releaseRes(h["armatures_character_" + i + "$_skel"]);
setTimeout(function() {
cc.sys.garbageCollect();
}, 1e3);
k.getSceneInfoByName(k.NAME.ROLE_SCENE).statusData.roleIdx = this.statusData.roleIdx;
},
onItemItem_: function(e) {
var a = e.target, t = a.data;
this.statusData.selectItemName = a.name;
for (var n in this.itemItemMap) this.itemItemMap[n].getComponent("itemItem").unSelect_();
a.getComponent("itemItem").select_();
var o = this.itemItemMap[a.name].data;
this.upgradeItemItem.getComponent("itemItem").update_(g.genData({
kindId: o.kindId
}));
r.replaceLabel(this.itemLevelLabel, [ o.level ]);
r.replaceLabel(this.itemNextLevelLabel, [ o.level + 1 ]);
this.upgradeItemNameLabel.string = o.name;
var d = t._item.attrs, h = t._data.effect, u = [];
d.hp && u.push({
name: i.t("生命"),
value: d.hp,
extraValue: h.hpGrowth
});
d.atk && u.push({
name: i.t("攻击"),
value: d.atk,
extraValue: h.atkGrowth
});
d.def && u.push({
name: i.t("物理防御"),
value: d.def,
extraValue: h.defGrowth
});
d.mdef && u.push({
name: i.t("魔法防御"),
value: d.mdef,
extraValue: h.mdefGrowth
});
d.crit && u.push({
name: i.t("暴击"),
value: d.crit,
extraValue: h.critGrowth
});
d.dodge && u.push({
name: i.t("闪避"),
value: d.dodge,
extraValue: h.dodgeGrowth
});
for (var m = 0; m < 2; m++) {
var p = this.upgradeAttrsLayout.getChildByName("attr_" + (m + 1) + "_layout");
if (u[m]) {
var _ = p.getChildByName("name_bg_sp").getChildByName("label").getComponent(cc.Label);
r.replaceLabel(_, [ u[m].name ]);
(v = p.getChildByName("value_layout")).getChildByName("value_label").getComponent(cc.Label).string = u[m].value;
var k = v.getChildByName("ext_label").getComponent(cc.Label);
r.replaceLabel(k, [ u[m].extraValue ]);
} else p.active = !1;
}
r.replaceLabel(this.upgradeAllTitleLabel, [ this.data.level ]);
var f = 0;
for (var m in this.data.itemItems) f += l.EQUIPMENTS.FUNS.getUpgradeMaxCost(this.data.level, this.data.itemItems[m].level);
this.upgradeAllCostCoinLabel.string = f;
r.replaceLabel(this.upgradeMaxTitleLabel, [ this.data.level ]);
f = l.EQUIPMENTS.FUNS.getUpgradeMaxCost(this.data.level, t.level);
this.upgradeMaxCostCoinLabel.string = f;
this.evolveItemNameLabel.string = t.name;
var y = t._data.evolutionItemId, b = s.findEntityById(y || t._data.kindId);
u = [];
(h = b.effect).initHp && u.push({
name: i.t("生命"),
value: h.initHp + t.level * h.hpGrowth
});
h.initAtk && u.push({
name: i.t("攻击"),
value: h.initAtk + t.level * h.atkGrowth
});
h.initDef && u.push({
name: i.t("物理防御"),
value: h.initDef + t.level * h.defGrowth
});
h.initMdef && u.push({
name: i.t("魔法防御"),
value: h.initMdef + t.level * h.mdefGrowth
});
h.initCrit && u.push({
name: i.t("暴击"),
value: h.initCrit + t.level * h.critGrowth
});
h.initDodge && u.push({
name: i.t("闪避"),
value: h.initDodge + t.level * h.dodgeGrowth
});
for (m = 0; m < 2; m++) {
p = this.evolveAttrsLayout.getChildByName("attr_" + (m + 1) + "_layout");
if (u[m]) {
var v;
_ = p.getChildByName("name_label").getComponent(cc.Label);
r.replaceLabel(_, [ u[m].name ]);
(v = p.getChildByName("value_layout")).getChildByName("value_label").getComponent(cc.Label).string = u[m].value;
} else p.active = !1;
}
(S = this.evolveItemsLayout.getChildByName("item_item")).getComponent("itemItem").update_(g.genData({
kindId: b.kindId
}));
this.evolveItemsLayout.active = !!y;
for (m = 0; m < 3; m++) {
var S = this.evolveItemsLayout.getChildByName("item_item_" + (m + 1)), T = this.evolveItemsLayout.getChildByName("require_layout_" + (m + 1)), M = b.requiredIds[m], $ = b.requiredCounts[m];
if (y && M) {
S.active = !0;
S.data = {
kindId: M,
requireCount: $
};
S.getComponent("itemItem").setClickEvent_(this, "eqptScene", "onItemFrom_");
S.getComponent("itemItem").update_(g.genData({
kindId: M
}));
var I = c.player.bag.getItemCount(M), C = T.getChildByName("count_label");
C.getComponent(cc.Label).string = I;
C.color = I < $ ? this.noMeetRequiredColor : this.meetRequiredColor;
var P = T.getChildByName("require_count_label").getComponent(cc.Label);
r.replaceLabel(P, [ $ ]);
} else S.active = !1;
}
this.evolveBt.active = !!y;
this.evolveBt.getChildByName("light_sp").active = o.isShowEvolve;
this.evolveCostCoinLabel.string = l.EQUIPMENTS.FUNS.getEvolveCost(b.color);
this.evolveCostCoinLabel.node.active = !!y;
this.evolveMaxLabel.active = !y;
},
onUpgradeAll: function() {
var e = this.data._role.idx, a = (this.itemItemMap[this.statusData.selectItemName].data.equipmentType, 
this);
n.addLoading();
u.upgradeAllEquipmentMax(e, function() {
r.spineEffect(a.upgradeEffectArmature);
d.playEffect(h.sound_effect_eqpt_upgrade_mp3);
o.callNext("roleHandler", "guideNext7");
});
},
onUpgradeMax: function() {
var e = this.data._role.idx, a = this.itemItemMap[this.statusData.selectItemName].data.equipmentType, t = this;
n.addLoading();
u.upgradeEquipmentMax(e, a, function() {
r.spineEffect(t.upgradeEffectArmature);
d.playEffect(h.sound_effect_eqpt_upgrade_mp3);
o.callNext("roleHandler", "guideNext7");
});
},
onEvolve_: function() {
var e = this.data._role, a = this.itemItemMap[this.statusData.selectItemName], t = a.data, i = this;
n.addLoading();
u.evolveEquipment(e.idx, t.equipmentType, function() {
r.spineEffect(i.eqptEvolveEffectArmature);
var s = c.player.team.getRoleByIdx(e.idx).equipments[t.equipmentType], o = f.getEvolveAttrDescStrs(t._data.effect, t._item.attrs, s.attrs), l = a.convertToWorldSpaceAR(cc.Vec2.ZERO);
l.y += 30;
for (var u in o) i.scheduleOnce(function() {
n.showText(this.str, this.pos);
}.bind({
str: o[u],
pos: l
}), .5 * Number(u));
d.playEffect(h.sound_effect_eqpt_evolve_mp3);
});
},
onItemFrom_: function(e) {
var a = e.target.data;
n.addItemFromPanel(a.kindId, a.requireCount);
},
onArmature_: function() {
this.armatureNode.characterNode.getComponent("characterArmatureComponent").playRandom_();
}
});
f.genData = function(e) {
var a = c.player.bag, n = s.findEntityById(e.kindId), i = [], r = !0;
for (var o in e.equipments) if (t.include([ "evlItem_1", "evlItem_2", "evlItem_3", "evlItem_4", "evlItem_5", "evlItem_6" ], o)) {
var l = e.equipments[o], d = s.findEntityById(l.kindId), h = s.findEntityById(d.evolutionItemId), u = l.level < e.level, m = !0;
if (h) for (var _ in h.requiredIds) a.getItemCount(h.requiredIds[_]) < h.requiredCounts[_] && (m = !1); else m = !1;
m = m && n.color >= d.color;
var k = g.genData(l, !1, !0, u, !!e.idx && m);
k.equipmentType = o;
i.push(k);
k.color != n.color + 1 && (r = !1);
}
var f = p.genData(e);
return {
roleItem: f,
name: n.kindName,
title: n.title,
classId: n.classId,
group: n.group,
level: e.level,
power: e.power,
exp: e.experience,
nextLevelExp: e.nextLevelExp,
star: f.star,
moon: f.moon,
sun: f.sun,
shen: f.shen,
isShowEvolve: r,
itemItems: i,
_data: n,
_role: e
};
};
f.getEvolveAttrDescStrs = function(e, a, t) {
var n, r = [];
e.initHp && (n = t.hp - a.hp) && r.push(i.t("生命+$1", [ n ]));
e.initAtk && (n = t.atk - a.atk) && r.push(i.t("攻击+$1", [ n ]));
e.initDef && (n = t.def - a.def) && r.push(i.t("物理防御+$1", [ n ]));
e.initMdef && (n = t.mdef - a.mdef) && r.push(i.t("魔法防御+$1", [ n ]));
e.initCrit && (n = t.crit - a.crit) && r.push(i.t("暴击+$1", [ n ]));
e.initDodge && (n = t.dodge - a.dodge) && r.push(i.t("闪避+$1", [ n ]));
return r;
};
cc._RF.pop();
}, {
baseView: "baseView",
clientConfig: "clientConfig",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
http: "http",
i18n: "i18n",
itemItem: "itemItem",
player: "player",
resource: "resource",
roleItem: "roleItem",
roleScene: "roleScene",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
teamHandler: "teamHandler",
underscore: "underscore"
} ],
