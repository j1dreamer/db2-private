roleScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "d1195qhFs1DuoYL5nmbumqZ", "roleScene");
var t = e("underscore"), n = e("moment"), i = (e("http"), e("helper")), r = e("baseView"), s = e("i18n"), o = e("dataApi"), l = e("guide"), c = e("clientConfig"), d = e("serverConfig"), h = e("battle.consts"), u = e("player"), m = e("serverMain"), g = e("soundApi"), p = e("buildExt"), _ = e("teamHandler"), k = e("resource"), f = e("itemItem"), y = e("skillItem"), b = e("starSignPointPanel"), v = e("forgePanel"), S = e("artifactUpgradePanel"), T = (e("skillInfoPanel"),
e("teamScene")), M = e("upgradeShowPanel"), $ = e("rulePanel"), I = e("bagHandler"), C = e("sceneManager"), P = d.ROLE.CONSTS, D = d.ROLE.FUNS, N = cc.Class({
extends: cc.Component,
properties: {
starLayout: cc.Node,
groupSp: cc.Sprite,
nameLabel: cc.Label,
titleLabel: cc.Label,
resetBt: cc.Node,
baseLayout: cc.Node,
stoneLayout: cc.Node,
artifactLayout: cc.Node,
awakeLayout: cc.Node,
breakLayout: cc.Node,
trainLayout: cc.Node,
capsuleLayout: cc.Node,
btsLayout: cc.Node,
skillBt: cc.Node,
stoneBt: cc.Node,
artifactBt: cc.Node,
awakeBt: cc.Node,
trainBt: cc.Node,
capsuleBt: cc.Node,
starSignBt: cc.Node,
leftBt: cc.Node,
rightBt: cc.Node,
armatureNode: cc.Node,
positionLabel: cc.Label,
spIntroLabel: cc.Label,
introLabel: cc.Label,
attrsLayout: cc.Node,
skillLayout: cc.Node,
skillPointLabel: cc.Label,
itemsLayout: cc.Node,
baseRightBottomSp: cc.Node,
evolveBt: cc.Node,
evolveAllBt: cc.Node,
baseAwakeLayout: cc.Node,
soulBar: cc.ProgressBar,
soulCountLabel: cc.Label,
levelLabel: cc.Label,
powerLabel: cc.Label,
expBar: cc.ProgressBar,
expLabel: cc.Label,
upgradeBtLabel: cc.Label,
upgradeLightSp: cc.Node,
evolveLightSp: cc.Node,
useExpBt: cc.Node,
useExpMaxBt: cc.Node,
expItemsPanel: cc.Node,
expItemNode: cc.Node,
eqptEvolveEffectArmature: cc.Node,
evolveEffectArmature: cc.Node,
powerEffectArmature: cc.Node,
stoneLeftItemsLayout: cc.Node,
stoneLeftBottomNode: cc.Node,
stoneLeftItem: cc.Node,
stoneLeftAttrsLayout: cc.Node,
stoneSelectItem: cc.Node,
stoneSelectItemNameLabel: cc.Label,
stoneSelectAttrNameLabel: cc.Label,
stoneSelectAttrValueLabel: cc.Label,
stoneRightItemsLayout: cc.Node,
stoneRightAttrsLayout: cc.Node,
artifactLeftItemsLayout: cc.Node,
artifactLeftBottomNode: cc.Node,
artifactLeftItem: cc.Node,
artifactLeftUpgradeBt: cc.Node,
artifactLeftUnequipBt: cc.Node,
artifactSelectItem: cc.Node,
artifactSelectItemNameLabel: cc.Label,
artifactSelectAttrNameLabel: cc.Label,
artifactSelectAttrValueLabel: cc.Label,
artifactRightItemsLayout: cc.Node,
awakeSkillLayout: cc.Node,
awakeSkillPointLabel: cc.Label,
awakeBottomNode: cc.Node,
awakeIncreaseRateEffectArmature: cc.Node,
awakeIconLayout: cc.Node,
awakeIncreaseRateLabel: cc.Label,
awakeCostGemLabel: cc.Label,
awakeCurRateLabel: cc.Label,
awakeCostCoinLabel: cc.Label,
awakeCostSixCoinNode: cc.Node,
awakeSoulBar: cc.ProgressBar,
awakeSoulCountLabel: cc.Label,
awakeFailEffectArmature: cc.Node,
awakePowerLabel: cc.Label,
breakCloseBt: cc.Node,
breakLeftItem: cc.Node,
breakLeftItemsLayout: cc.Node,
breakLeftSelectSp: cc.Node,
breakSoulBar: cc.ProgressBar,
breakSoulCountLabel: cc.Label,
breakPowerLabel: cc.Label,
breakCostGemLabel: cc.Label,
breakCostCoinLabel: cc.Label,
breakBreakBt: cc.Node,
breakBreakLightSp: cc.Node,
trainUpBt: cc.Node,
trainResetBt: cc.Node,
trainAttrItems: [ cc.Node ],
trainCostGemLabel: cc.Label,
trainCostCoinLabel: cc.Label,
trainStoneIconSp: cc.Node,
trainStoneCoinLabel: cc.Label,
trainSoulBar: cc.ProgressBar,
trainSoulCountLabel: cc.Label,
trainCoinNode: cc.Node,
trainStoneCountLabel: cc.Label,
trainBookCountLabel: cc.Label,
trainItemsLayout: cc.Node,
trainItem: cc.Node,
trainEffectColors: [ cc.Color ],
capsuleLeftItemsLayout: cc.Node,
capsuleLeftBottomNode: cc.Node,
capsuleLeftItem: cc.Node,
capsuleLeftEquipBt: cc.Node,
capsuleLeftUnequipBt: cc.Node,
capsuleSelectItem: cc.Node,
capsuleSelectItemNameLabel: cc.Label,
capsuleSelectAttrDescScrollView: cc.ScrollView,
capsuleAttrLabelColors: [ cc.Color ],
capsuleRightItemsLayout: cc.Node,
capsuleViewMoreNode: cc.Node,
capsuleBookPanel: cc.Node,
capsuleComposePanel: cc.Node,
capsuleResetPanel: cc.Node,
evolveSkillConfirmPanel: cc.Node,
evolveSkillItem: cc.Node,
evolveSkillText: cc.Label,
evolveSkillIncreaseRateLabel: cc.Label,
evolveSkillCostGemLabel: cc.Label,
evolveSkillCurRateLabel: cc.Label,
evolveSkillSoulCountLabel: cc.Label,
evolveSkillCostLabel: cc.Label,
evolveSkillFailEffectArmature: cc.Node,
evolveSkillIncreaseRateEffectArmature: cc.Node,
forgePanel: cc.Node,
artifactUpgradePanel: cc.Node,
skillInfoPanel: cc.Node,
starSpriteFrame: cc.SpriteFrame,
noStarSpriteFrame: cc.SpriteFrame,
moonSpriteFrame: cc.SpriteFrame,
sunSpriteFrame: cc.SpriteFrame,
shenSpriteFrame: cc.SpriteFrame,
noAwakeSpriteFrame: cc.SpriteFrame,
awakeSpriteFrames: [ cc.SpriteFrame ],
trainSpriteFrames: [ cc.SpriteFrame ],
delayShowNodes: [ cc.Node ],
starSignPointBt: cc.Node,
starSignLayout: cc.Node,
starSignLeftLayout: cc.Node,
starSignSelectItem: cc.Node,
starSignSelectItemNameLabel: cc.Label,
starSignSelectAttrNameLabel: cc.Label,
starSignSelectAttrValueLabel: cc.Label,
starSignSkillDescLabel: cc.Label,
starSignRightItem: cc.Node,
starSignRightContent: cc.Node,
starSignLeftBottomNode: cc.Node,
starSignLeftUpgradeBt: cc.Node,
starSignLeftDecomposeBt: cc.Node,
starSignLeftUnequipBt: cc.Node,
starSignDecomposeAllPanel: cc.Node,
starSignBookPanel: cc.Node,
starSignUpgradePanel: cc.Node,
warSoulBt: cc.Node,
warSoulNode: cc.Node
},
statics: {
instance: null,
roleIdxs: null
},
onLoad: function() {
N.instance || (N.instance = this);
C.curSceneStatusData = t.extend({
selectBtName: "attrs_bt",
roleIdx: 1,
positionType: null,
role: null,
isShowExpItemsPanel: !1,
selectStoneIdx: 0,
selectArtifactIdx: 0,
selectTrainType: 1,
selectCapsuleIdx: 0,
selectStarSignIdx: 0
}, C.curSceneStatusData);
this.statusData = C.curSceneStatusData;
this.onFun = this.update_.bind(this);
m.player.on(u.EVENT.TEAM, this.onFun);
this.baseLayout.active = !1;
this.stoneLayout.active = !1;
this.artifactLayout.active = !1;
this.awakeLayout.active = !1;
this.awakeIncreaseRateEffectArmature.active = !1;
this.expItemNode.active = !1;
this.expItemNode.x = -20;
this.stoneLeftItem.active = !1;
this.artifactLeftItem.active = !1;
this.forgePanel.active = !1;
this.artifactUpgradePanel.active = !1;
this.breakCloseBt.active = !1;
this.breakLayout.active = !1;
this.breakLeftItem.active = !1;
this.breakLeftSelectSp.x = this.breakLeftSelectSp.y = 0;
this.breakLeftSelectSp.active = !1;
this.trainLayout.active = !1;
this.trainItem.active = !1;
this.eqptEvolveEffectArmature.active = !1;
this.powerEffectArmature.active = !1;
this.powerEffectArmature.zIndex = 1;
this.evolveEffectArmature.active = !1;
this.evolveEffectArmature.zIndex = 1;
this.capsuleLayout.active = !1;
this.capsuleLeftItem.active = !1;
this.capsuleViewMoreNode.active = !1;
this.capsuleBookPanel.active = !1;
this.capsuleComposePanel.active = !1;
this.capsuleResetPanel.active = !1;
this.starSignLayout.active = !1;
this.starSignRightItem.active = !1;
this.starSignDecomposeAllPanel.active = !1;
this.starSignBookPanel.active = !1;
this.starSignUpgradePanel.active = !1;
this.evolveSkillConfirmPanel.active = !1;
this.evolveSkillFailEffectArmature.active = !1;
this.evolveSkillIncreaseRateEffectArmature.active = !1;
this.skillInfoPanel.active = !1;
this.awakeFailEffectArmature.active = !1;
this.awakeFailEffectArmature.zIndex = 1;
this.stoneBt.active = !this.statusData.role;
r.setGray(this.stoneBt, m.player.level >= c.CONSTS.UNLOCK_LEVEL.STONE);
this.artifactBt.active = !this.statusData.role;
r.setGray(this.artifactBt, m.player.level >= c.CONSTS.UNLOCK_LEVEL.ARTIFACT);
this.capsuleBt.active = !this.statusData.role && !p.isHideCapsule;
r.setGray(this.capsuleBt, m.player.level >= c.CONSTS.UNLOCK_LEVEL.CAPSULE);
this.warSoulNode.active = !1;
this.starSignBt.active = !this.statusData.role && !p.isHideStarSign;
r.setGray(this.starSignBt, m.player.level >= c.CONSTS.UNLOCK_LEVEL.STAR_SIGN);
this.expItemsPanel.active = !0;
this.expItemsPanel.expItemNodeMap = this.expItemsPanel.expItemNodeMap || {};
var e = o.entity.findBy("type", "consumables");
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
t.each(this.delayShowNodes, function(e) {
e.active = !1;
});
this.scheduleOnce(function() {
t.each(this.delayShowNodes, function(e) {
e.active = !0;
e.opacity = 0;
cc.tween(e).to(.2, {
opacity: 255
}).start();
});
}, 0);
if (!N.roleIdxs) {
var i = m.player.team.roles, s = this;
p.hideRoleClassIds && (i = t.filter(i, function(e) {
var a = o.findEntityById(e.kindId);
return !t.include(p.hideRoleClassIds, a.classId);
}));
N.roleIdxs = t.chain(i).filter(function(e) {
return s.statusData.positionType == c.CONSTS.POSITION_TYPE.NONE || o.findEntityById(e.kindId).positionType == s.statusData.positionType;
}).sortBy(function(e) {
return -e.power;
}).pluck("idx").value();
}
for (a = 0; a < 4; a++) {
var d = this.skillLayout.getChildByName("skill_" + (a + 1));
d.getChildByName("evolve_bt").parent = d.getChildByName("skill_item_" + (a + 1)).getChildByName("layout");
}
var h = this.statusData.role || m.player.team.getRoleByIdx(this.statusData.roleIdx);
this.update_([ h ]);
var g = this.btsLayout.getChildByName(this.statusData.selectBtName);
this.onType_({
target: g
});
l.callNext("roleHandler", "guideNext2");
},
onDestroy: function() {
N.instance = null;
m.player.off(u.EVENT.TEAM, this.onFun);
N.roleIdxs = null;
},
tick_: function() {
var e = s.t("点数已满"), a = m.player.nextRecoverTimeMap.skillPoint;
if (a) {
var t = m.tTime(a) - Date._now();
t = t < 0 ? 0 : t;
var r = n.duration(t);
e = i.formatDuration(r.asMinutes(), r.seconds());
}
i.replaceLabel(this.skillPointLabel, [ m.player.skillPoint, e ]);
this.awakeSkillPointLabel.string = this.skillPointLabel.string;
},
update_: function(e) {
var a = this, n = e[0];
if (!n.idx || n.idx == this.statusData.roleIdx) {
var l = n.idx ? C.teamData.roleSceneMap[n.idx] : N.genData(n), c = N.genBagData(n);
l.stoneItems = c.stoneItems;
l.artifactItems = c.artifactItems;
l.capsuleItems = c.capsuleItems;
l.starSignItems = c.starSignItems;
this.data = l;
this.leftBt.active = l._role.idx != N.roleIdxs[0] && !this.statusData.role;
this.rightBt.active = l._role.idx != t.last(N.roleIdxs) && !this.statusData.role;
this.leftBt.preActive = this.leftBt.active;
this.rightBt.preActive = this.rightBt.active;
this.awakeBt.active = l.group >= P.AWAKE_NEED_GROUP && l._role.star == P.AWAKE_NEED_STAR && !this.statusData.role && !p.isHideAwake;
this.trainBt.active = l._role.awakeLevel >= 10 && !this.statusData.role && !p.isHideTrain;
p.isTrainNeedStar && (this.trainBt.active = l.group >= P.AWAKE_NEED_GROUP && l._role.star == P.AWAKE_NEED_STAR && !this.statusData.role && !p.isHideTrain);
for (var h = {}, u = 1; u <= 5; u++) {
var g = this.starLayout.getChildByName("star_" + u + "_sp").getComponent(cc.Sprite);
u <= l.star ? g.spriteFrame = this.starSpriteFrame : g.spriteFrame = this.noStarSpriteFrame;
h[u - 1] = g;
}
for (u = 0; u < l.moon; u++) h[u].spriteFrame = this.moonSpriteFrame;
for (u = 0; u < l.sun; u++) h[u].spriteFrame = this.sunSpriteFrame;
for (u = 0; u < l.shen; u++) h[u].spriteFrame = this.shenSpriteFrame;
for (u = 0; u < l.trainPurpleStar; u++) h[u].spriteFrame = this.trainSpriteFrames[0];
for (u = 0; u < l.trainRedStar; u++) h[u].spriteFrame = this.trainSpriteFrames[1];
for (u = 0; u < l.trainBlueStar; u++) h[u].spriteFrame = this.trainSpriteFrames[2];
r.setSpriteFrame(this.groupSp, k["misc_role_big_group_" + l.group + "_png"], !0, !0);
this.nameLabel.string = l.name;
this.titleLabel.string = l.title;
this.resetBt.active = !p.isHideRoleReset && !!l._role.idx;
this.warSoulBt.active = l.group >= 4 && l.level >= 50 && l.star >= 3 && !p.isHideWarSoul;
this.positionLabel.string = l.positionDesc;
this.spIntroLabel.string = l.spInrto;
this.introLabel.string = l.inrto;
var _ = [ "hpGrowth", "atkGrowth", "defGrowth", "mdefGrowth", "hp", "atk", "def", "mdef", "crit", "dodge" ];
for (var u in _) {
(Y = this.attrsLayout.getChildByName(_[u] + "_layout").getChildByName("attr_layout")).getChildByName("attr_label").getComponent(cc.Label).string = l[_[u]];
var f = Y.getChildByName("attr_ext_label").getComponent(cc.Label);
i.replaceLabel(f, [ Math.floor(l[_[u] + "Extra"]) || "" ]);
f.node.active = !!l[_[u] + "Extra"];
}
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
for (u = 0; u < 4; u++) {
var y = this.skillLayout.getChildByName("skill_" + (u + 1));
y.getComponentInChildren("skillItem").update_(l.skillItems[u], this.skillInfoPanel);
var v = y.getChildByName("skill_item_" + (u + 1)).getChildByName("layout").getChildByName("evolve_bt"), S = d.ROLE.CONSTS.EVOLVE_SKILL_NO_LEVEL_MAP[l.skillItems[u]._data.no];
v.active = l.evolveSkillItems[u] && !!l.evolveSkillItems[u].desc && !l.evolveSkillItems[u].isEvolve && l.skillItems[u].level >= S;
}
for (u = 0; u < 6; u++) {
var T = this.itemsLayout.getChildByName("item_item_" + (u + 1));
T.data = l.itemItems[u];
T.getComponent("itemItem").setClickEvent_(this, "roleScene", "onEvlItem_");
T.getComponent("itemItem").update_(l.itemItems[u]);
}
this.baseRightBottomSp.active = !!l._role.idx;
this.evolveBt.active = !!l._role.idx && l.isShowEvolve;
this.evolveAllBt.active = !!l._role.idx && !l.isShowEvolve;
if (this.baseRightBottomSp.active) {
var M = n.level == D.getMaxLevel(m.player.level, n.star, n.awakeLevel);
r.setGray(this.useExpBt, !M);
r.setGray(this.useExpMaxBt, !M);
this.useExpBt.getComponent(cc.Button).interactable = !M;
this.useExpMaxBt.getComponent(cc.Button).interactable = !M;
var $ = {};
for (u = 1; u <= 5; u++) {
x = this.baseAwakeLayout.getChildByName("awake_" + u + "_sp").getComponent(cc.Sprite);
u <= l.green ? x.spriteFrame = this.awakeSpriteFrames[0] : x.spriteFrame = this.noAwakeSpriteFrame;
$[u - 1] = x;
x.node.active = 5 == l.star;
}
for (u = 0; u < l.blue; u++) $[u].spriteFrame = this.awakeSpriteFrames[1];
for (u = 0; u < l.purple; u++) $[u].spriteFrame = this.awakeSpriteFrames[2];
for (u = 0; u < l.orange; u++) $[u].spriteFrame = this.awakeSpriteFrames[3];
this.baseAwakeLayout.active = !p.isHideAwake;
this.soulBar.progress = l.soulCount / l.nextStarSoulCount;
i.replaceLabel(this.soulCountLabel, [ l.soulCount, l.nextStarSoulCount ]);
if (l.nextStarSoulCount && l.star < 5) this.upgradeBtLabel.string = s.t("升星"); else {
this.soulBar.progress = 1;
this.soulCountLabel.string = s.t("已满星,余($1)", [ l.soulCount ]);
this.upgradeBtLabel.string = s.t("突破");
}
i.replaceLabel(this.levelLabel, [ l.level ]);
var I = this.powerLabel.prePower || l.power;
if (l.power > I) {
i.scaleEffect(this.powerLabel.node);
i.spineEffect(this.powerEffectArmature);
}
this.powerLabel.prePower = l.power;
this.powerLabel.string = l.power;
this.expBar.progress = l.exp / l.nextLevelExp;
i.replaceLabel(this.expLabel, [ l.exp, l.nextLevelExp ]);
if (M) {
this.expBar.progress = 1;
this.expLabel.string = s.t("已满级");
}
this.upgradeLightSp.active = l.isShowUpgradeStar;
this.evolveLightSp.active = l.isShowEvolve;
}
if (this.armatureNode.characterNode && this.armatureNode.characterNode.getComponent("characterArmatureComponent").data.classId != l.classId) {
this.armatureNode.characterNode.destroy();
this.armatureNode.characterNode = null;
}
if (!this.armatureNode.characterNode) {
var A = r.getCharacterNode(l.classId);
A.parent = this.armatureNode;
A.scale = 1.35;
this.armatureNode.characterNode = A;
}
this.stoneItemMap = this.stoneItemMap || {};
r.preHideNodeMap(this.stoneItemMap);
for (var u in l.stoneItems) {
if (!(w = this.stoneItemMap[u])) {
(w = cc.instantiate(this.stoneLeftItem)).parent = this.stoneLeftItemsLayout;
w.getComponent("itemItem").setClickEvent_(this, "roleScene", "onStoneItem_");
w.idx = u;
this.stoneItemMap[u] = w;
}
w.active = !0;
r.markHideNode(w);
w.data = l.stoneItems[u];
w.getComponent("itemItem").update_(l.stoneItems[u]);
}
r.hideNodeMap(this.stoneItemMap);
this.stoneLeftBottomNode.active = l.stoneItems.length > 0;
var L = this.stoneItemMap[this.statusData.selectStoneIdx];
l.stoneItems.length > 0 && L && this.onStoneItem_({
target: L
});
for (u = 1; u <= 6; u++) {
var E = l.equipmentStoneItemMap["stoneItem_" + u], B = this.stoneRightItemsLayout.getChildByName("item_bg_sp_" + u), w = B.getChildByName("item_item"), G = B.getChildByName("name_label");
w.active = !!E;
G.active = !!E;
var R = (Y = this.stoneRightAttrsLayout.getChildByName("attr_" + u + "_layout")).getChildByName("value_label").getComponent(cc.Label);
i.replaceLabel(R, [ 0 ]);
if (E) {
w.data = E;
w.getComponent("itemItem").setClickEvent_(this, "roleScene", "onUnEquipStone_");
w.getComponent("itemItem").update_(E);
G.getComponent(cc.Label).string = E.name;
var H = N.getAttrDesc(E._data.effect);
i.replaceLabel(R, [ H.value ]);
}
}
this.artifactItemMap = this.artifactItemMap || {};
r.preHideNodeMap(this.artifactItemMap);
for (var u in l.artifactItems) {
if (!(W = this.artifactItemMap[u])) {
(W = cc.instantiate(this.artifactLeftItem)).parent = this.artifactLeftItemsLayout;
W.getComponent("itemItem").setClickEvent_(this, "roleScene", "onArtifactItem_");
W.idx = u;
this.artifactItemMap[u] = W;
}
W.active = !0;
r.markHideNode(W);
W.data = l.artifactItems[u];
W.getComponent("itemItem").update_(l.artifactItems[u]);
}
r.hideNodeMap(this.artifactItemMap);
this.artifactLeftBottomNode.active = l.artifactItems.length > 0;
l.artifactItems.length > 0 && this.onArtifactItem_({
target: this.artifactItemMap[this.statusData.selectArtifactIdx]
});
var x, K = d.EQUIPMENTS.CONSTS.EQUIP_TYPE_NEED_AWAKE_LEVEL_MAP, F = d.EQUIPMENTS.CONSTS.ARTIFACT_ITEM_TYPES.length;
for (u = 1; u <= 5; u++) {
var V = l.equipmentArtifactItemMap["artifactItem_" + u], O = this.artifactRightItemsLayout.getChildByName("item_bg_sp_" + u);
O.active = u <= F;
if (O.active) {
var U = K["artifactItem_" + u];
if (ue = O.getChildByName("lock_sp")) {
ue.active = U && n.awakeLevel < U;
ue.data = {
needAwakeLevel: U
};
}
var W = O.getChildByName("item_item"), Y = (G = O.getChildByName("name_label"),
O.getChildByName("attr_layout"));
W.active = !!V;
G.active = !!V;
Y.active = !!V;
if (V) {
W.data = V;
W.data.equipmentType = "artifactItem_" + u;
W.getComponent("itemItem").setClickEvent_(this, "roleScene", "onUnEquipArtifact_");
W.getComponent("itemItem").update_(V);
G.getComponent(cc.Label).string = V.name;
var j = V._data.starVals[V._item.star];
H = N.getAttrDesc(V._data.effect, j);
Y.getChildByName("name_label").getComponent(cc.Label).string = H.name;
R = Y.getChildByName("value_label").getComponent(cc.Label);
i.replaceLabel(R, [ H.value ]);
}
}
}
for ($ = {}, u = 1; u <= 5; u++) {
x = this.awakeIconLayout.getChildByName("awake_" + u + "_sp").getComponent(cc.Sprite);
u <= l.green ? x.spriteFrame = this.awakeSpriteFrames[0] : x.spriteFrame = this.noAwakeSpriteFrame;
$[u - 1] = x;
}
for (u = 0; u < l.blue; u++) $[u].spriteFrame = this.awakeSpriteFrames[1];
for (u = 0; u < l.purple; u++) $[u].spriteFrame = this.awakeSpriteFrames[2];
for (u = 0; u < l.orange; u++) $[u].spriteFrame = this.awakeSpriteFrames[3];
for (u = 0; u < 5; u++) this.awakeSkillLayout.getChildByName("skill_item_" + (u + 1)).getComponent("skillItem").update_(l.awakeSkillItems[u], this.skillInfoPanel);
this.awakeBottomNode.active = p.isSimpleAwake ? l.green < 5 : n.awakeLevel < P.MAX_AWAKE_LEVEL;
this.awakeSoulBar.progress = l.soulCount / l.upgradeAwakeLevelCostSoul;
i.replaceLabel(this.awakeSoulCountLabel, [ l.soulCount, l.upgradeAwakeLevelCostSoul ]);
if (!l.upgradeAwakeLevelCostSoul) {
this.awakeSoulCountLabel.string = s.t("已满级");
this.awakeSoulBar.progress = 1;
}
this.awakeCostGemLabel.string = s.t("花费$1", [ l.upgradeAwakeLevelIncreaseRateCostGem ]);
i.replaceLabel(this.awakeIncreaseRateLabel, [ i.floatStrip(100 * l.upgradeAwakeLevelIncreaseRate) ]);
i.replaceLabel(this.awakeCurRateLabel, [ i.floatStrip(100 * l.upgradeAwakeLevelCurRate) ]);
this.awakeCostCoinLabel.string = l.upgradeAwakeLevelCostCoin;
this.awakeCostSixCoinNode.active = l.upgradeAwakeLevelCostSixCoin > 0;
this.awakeCostSixCoinNode.active && (this.awakeCostSixCoinNode.getComponentInChildren(cc.Label).string = l.upgradeAwakeLevelCostSixCoin);
I = this.awakePowerLabel.prePower || l.power;
l.power > I && i.scaleEffect(this.awakePowerLabel.node);
this.awakePowerLabel.prePower = l.power;
this.awakePowerLabel.string = l.power;
l.breakSoulCount = l.breakSoulCount || 0;
l.breakSelectBagIdxs = l.breakSelectBagIdxs || [];
l.soulItems = c.soulItems;
this.soulItemMap = this.soulItemMap || {};
r.preHideNodeMap(this.soulItemMap);
for (var u in l.soulItems) {
var q = this.soulItemMap[u];
if (!q) {
(q = cc.instantiate(this.breakLeftItem)).parent = this.breakLeftItemsLayout;
q.getComponent("itemItem").setClickEvent_(this, "roleScene", "onSoulItem_");
q.idx = u;
this.soulItemMap[u] = q;
var X = cc.instantiate(this.breakLeftSelectSp);
X.parent = q;
q.selectSp = X;
}
q.active = !0;
r.markHideNode(q);
q.data = l.soulItems[u];
q.getComponent("itemItem").update_(l.soulItems[u]);
q.selectSp.active = t.include(l.breakSelectBagIdxs, q.data._item.idx);
}
r.hideNodeMap(this.soulItemMap);
I = this.breakPowerLabel.prePower || l.power;
l.power > I && i.scaleEffect(this.breakPowerLabel.node);
this.breakPowerLabel.prePower = l.power;
this.breakPowerLabel.string = l.power;
if (l.breakCostSoul) {
this.breakSoulBar.progress = l.breakSoulCount / l.breakCostSoul;
i.replaceLabel(this.breakSoulCountLabel, [ l.breakSoulCount, l.breakCostSoul ]);
} else {
this.breakSoulBar.progress = 1;
i.replaceLabel(this.breakSoulCountLabel, [ 0, 0 ]);
this.breakSoulCountLabel.string = s.t("已突破满");
}
this.breakBreakBt.active = !!l.breakCostSoul;
this.breakCostGemLabel.string = this.data.breakCostGem || 0;
this.breakCostCoinLabel.string = this.data.breakCostCoin || 0;
this.trainResetBt.active = !p.isHideResetTrain;
var z = function(e, t) {
void 0 === t && (t = !1);
r.setGray(a.trainUpBt, !t);
a.trainUpBt.getComponentInChildren(cc.Label).string = e;
};
z(s.t("特训"));
var J = l.trainItems[this.statusData.selectTrainType - 1];
this.selectTrainAttrItem = null;
for (var u in this.trainAttrItems) {
var Z = this.trainAttrItems[u], Q = Z.getChildByName("icon_sp").getComponent(cc.Sprite), ee = J.attrItems[u];
r.setSpriteFrame(Q, ee.isActive ? k["train_skill_" + ee.id + "_png"] : k["train_lock_skill_" + ee.id + "_png"]);
var ae = Z.getChildByName("effect_label").getComponent(cc.Label);
ae.node.color = this.trainEffectColors[ee.isActive ? 1 : 0];
ae.string = ee.desc;
var te = Z.getChildByName("can_up_spine");
Z.canUpSpine = te;
te.active = ee.no == J.nextUnlockNo;
te.getComponent(sp.Skeleton).setAnimation(0, "action_1", !0);
te.active && (this.selectTrainAttrItem = Z);
}
if (J.isMax) {
this.trainSoulBar.progress = 1;
i.replaceLabel(this.trainSoulCountLabel, [ 0, 0 ]);
this.trainSoulCountLabel.string = s.t("特训已满级");
z(s.t("已满级"), !0);
} else {
this.trainSoulBar.progress = l.soulCount / l.trainCostSoul;
i.replaceLabel(this.trainSoulCountLabel, [ l.soulCount, l.trainCostSoul ]);
p.isTrainNoMore || l._role.trainUnlockMap[J.type] || z(s.t("解锁"));
}
this.trainCostGemLabel.string = this.data.trainCostGem || 0;
this.trainCostCoinLabel.string = this.data.trainCostCoin || 0;
this.trainStoneCoinLabel.string = this.data.trainCostStone || 0;
this.trainStoneIconSp.active = !p.isTrainNoMore;
this.trainStoneCoinLabel.node.active = !p.isTrainNoMore;
this.trainCoinNode.active = !p.isTrainNoMore;
var ne = m.player.bag.getItemCount(P.TRAIN_COST.STONE.ID), ie = m.player.bag.getItemCount(P.TRAIN_UNLOCK_COST.ID);
this.trainStoneCountLabel.string = ne;
this.trainBookCountLabel.string = ie;
this.trainItemMap = this.trainItemMap || {};
r.preHideNodeMap(this.trainItemMap);
for (var u in l.trainItems) {
var re = l.trainItems[u];
if (!t.include(p.hideTrainTypeIds, re.type)) {
var se = this.trainItemMap[u];
if (!se) {
(se = cc.instantiate(this.trainItem)).parent = this.trainItemsLayout;
se.idx = u;
this.trainItemMap[u] = se;
}
se.active = !0;
r.markHideNode(se);
se.data = re;
var oe = se.getChildByName("train_sp").getComponent(cc.Sprite);
r.setSpriteFrame(oe, k["train_" + re.type + "_png"]);
se.getChildByName("name_label").getComponent(cc.Label).string = re.name;
se.getChildByName("select_sp").active = re == J;
se.getChildByName("lock_sp").active = !p.isTrainNoMore && !l._role.trainUnlockMap[re.type];
for (var le = 0; le < 3; le++) {
var ce = re.attrItems[le];
se.getChildByName("attr_" + (le + 1) + "_label").getComponent(cc.Label).string = s.t("$1 $2", [ ce.no, ce.desc ]);
se.getChildByName("active_" + (le + 1) + "_bg").getChildByName("active_sp").active = ce.isActive;
}
}
}
r.hideNodeMap(this.trainItemMap);
this.capsuleItemMap = this.capsuleItemMap || {};
r.preHideNodeMap(this.capsuleItemMap);
this.capsuleItems = [];
for (var u in l.capsuleItems) {
if (!(me = this.capsuleItemMap[u])) {
(me = cc.instantiate(this.capsuleLeftItem)).parent = this.capsuleLeftItemsLayout;
me.getComponent("itemItem").setClickEvent_(this, "roleScene", "onCapsuleItem_");
me.idx = u;
this.capsuleItemMap[u] = me;
}
me.active = !0;
r.markHideNode(me);
me.data = l.capsuleItems[u];
me.getComponent("itemItem").update_(l.capsuleItems[u]);
this.capsuleItems.push(me);
}
r.hideNodeMap(this.capsuleItemMap);
this.capsuleLeftBottomNode.active = l.capsuleItems.length > 0;
l.capsuleItems.length > 0 && this.onCapsuleItem_({
target: this.capsuleItemMap[this.statusData.selectCapsuleIdx]
});
for (K = d.EQUIPMENTS.CONSTS.EQUIP_TYPE_NEED_AWAKE_LEVEL_MAP, F = d.EQUIPMENTS.CONSTS.CAPSULE_ITEM_TYPES.length,
u = 1; u <= 5; u++) {
var de = l.equipmentCapsuleItemMap["capsuleItem_" + u], he = this.capsuleRightItemsLayout.getChildByName("item_bg_sp_" + u);
he.active = u <= F;
if (he.active) {
var ue;
U = K["capsuleItem_" + u];
if (ue = he.getChildByName("lock_sp")) {
ue.active = U && n.awakeLevel < U;
ue.data = {
needAwakeLevel: U
};
}
var me = he.getChildByName("item_item");
G = he.getChildByName("name_label");
me.active = !!de;
G.active = !!de;
if (de) {
me.data = de;
me.data.equipmentType = "capsuleItem_" + u;
me.getComponent("itemItem").setClickEvent_(this, "roleScene", "onUnEquipCapsule_");
me.getComponent("itemItem").update_(de);
G.getComponent(cc.Label).string = de.name;
}
}
}
this.starSignPointBt.active = !!b.genData();
this.starSignItemMap = this.starSignItemMap || {};
r.preHideNodeMap(this.starSignItemMap);
this.starSignItems = [];
for (var u in l.starSignItems) {
if (!(_e = this.starSignItemMap[u])) {
(_e = cc.instantiate(this.starSignRightItem)).parent = this.starSignRightContent;
_e.idx = u;
this.starSignItemMap[u] = _e;
}
_e.active = !0;
r.markHideNode(_e);
_e.data = l.starSignItems[u];
_e.getComponentInChildren("itemItem").update_(l.starSignItems[u]);
this.starSignItems.push(_e);
}
r.hideNodeMap(this.starSignItemMap);
this.starSignLeftBottomNode.active = l.starSignItems.length > 0;
this.starSignLayout.getChildByName("null_node").active = !(l.starSignItems.length > 0);
l.starSignItems.length > 0 && this.onStarSignItem_({
target: this.starSignItemMap[this.statusData.selectStarSignIdx]
});
for (u = 1; u <= 4; u++) {
var ge = l.equipmentStarSignItemMap["starSignItem_" + u], pe = this.starSignLeftLayout.getChildByName("item_bg_sp_" + u), _e = pe.getChildByName("item_item");
G = pe.getChildByName("name_label"), Y = pe.getChildByName("attr_layout");
_e.active = !!ge;
G.active = !!ge;
Y.active = !!ge;
if (ge) {
_e.data = ge;
_e.data.equipmentType = "starSignItem_" + u;
_e.getComponent("itemItem").setClickEvent_(this, "roleScene", "onUnEquipStarSign_");
_e.getComponent("itemItem").update_(ge);
G.getComponent(cc.Label).string = ge.name;
var ke = {};
ke[ge._data.extra.attr] = ge._item.attrValue;
H = N.getAttrDesc(ke);
Y.getChildByName("name_label").getComponent(cc.Label).string = H.name;
R = Y.getChildByName("value_label").getComponent(cc.Label);
i.replaceLabel(R, [ H.value ]);
}
}
this.starSignSkillDescLabel.node.active = !!l.starSignSkillId;
if (l.starSignSkillId) {
var fe = o.fightSkill.findById(l.starSignSkillId);
i.replaceLabel(this.starSignSkillDescLabel, [ fe.name, fe.desc ]);
}
this.evolveSkillConfirmPanel.isPanel && this.onEvolveSkillConfirm_();
}
},
onSwitch_: function(e, a) {
this.powerLabel.prePower = null;
var n = C.teamData.teamItemMap[this.statusData.roleIdx].classId, i = t.indexOf(N.roleIdxs, String(this.statusData.roleIdx));
this.statusData.roleIdx = N.roleIdxs[i + Number(a)];
var s = m.player.team.getRoleByIdx(this.statusData.roleIdx);
this.update_([ s ]);
r.releaseRes(k["armatures_character_" + n + "$_skel"]);
setTimeout(function() {
cc.sys.garbageCollect();
}, 1e3);
},
onType_: function(e, a) {
var n = e.target;
console.log("点击了onType_   selectBt", n, "----------data", a);
var i = c.CONSTS.UNLOCK_LEVEL.STONE;
if ("stone_bt" == n.name && m.player.level < i) r.addHintPanel(s.t("战队等级达到$1开启", [ i ])); else {
i = c.CONSTS.UNLOCK_LEVEL.ARTIFACT;
if ("artifact_bt" == n.name && m.player.level < i) r.addHintPanel(s.t("战队等级达到$1开启", [ i ])); else {
i = c.CONSTS.UNLOCK_LEVEL.CAPSULE;
if ("capsule_bt" == n.name && m.player.level < i) r.addHintPanel(s.t("战队等级达到$1开启", [ i ])); else {
i = c.CONSTS.UNLOCK_LEVEL.STAR_SIGN;
if ("star_sign_bt" == n.name && m.player.level < i) r.addHintPanel(s.t("战队等级达到$1开启", [ i ])); else {
this.statusData.selectBtName = n.name;
t.each(this.btsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
n.getComponent(cc.Button).interactable = !1;
this.baseLayout.active = !1;
this.stoneLayout.active = !1;
this.artifactLayout.active = !1;
this.awakeLayout.active = !1;
this.trainLayout.active = !1;
this.capsuleLayout.active = !1;
this.starLayout.active = !0;
this.starSignLayout.active = !1;
this.leftBt.active = this.leftBt.preActive;
this.rightBt.active = this.rightBt.preActive;
switch (n.name) {
case "skill_bt":
this.baseLayout.active = !0;
this.baseLayout.getChildByName("attr_bg_sp").active = !1;
this.baseLayout.getChildByName("skill_bg_sp").active = !0;
break;

case "attrs_bt":
this.baseLayout.active = !0;
this.baseLayout.getChildByName("attr_bg_sp").active = !0;
this.baseLayout.getChildByName("skill_bg_sp").active = !1;
break;

case "stone_bt":
this.stoneLayout.active = !0;
break;

case "artifact_bt":
this.artifactLayout.active = !0;
break;

case "awake_bt":
this.awakeLayout.active = !0;
this.starLayout.active = !1;
this.leftBt.active = !1;
this.rightBt.active = !1;
break;

case "train_bt":
this.trainLayout.active = !0;
this.leftBt.active = !1;
this.rightBt.active = !1;
break;

case "capsule_bt":
this.capsuleLayout.active = !0;
break;

case "star_sign_bt":
this.starSignLayout.active = !0;
}
}
}
}
}
},
onUpgrade_: function() {
var e = this.data._role.idx, a = D.getUpgradeCost(this.data.star).coin;
if (this.data.star >= 5) {
if ((2 == this.data.group || p.isHideShenBreak) && this.data._role.star == P.GROUP_2_MAX_STAR || this.data._role.star == P.AWAKE_NEED_STAR) {
r.addHintPanel(s.t("已突破满"));
return;
}
this.breakLayout.active = !0;
this.breakCloseBt.active = !0;
this.baseLayout.active = !1;
this.btsLayout.active = !1;
r.getBackNode().node.active = !1;
this.leftBt.active = !1;
this.rightBt.active = !1;
} else {
var t = s.t("是否花费$1金币升级到$2星?", [ a, this.data.star + 1 ]), n = this;
r.addMessageBox(t, function() {
r.addLoading();
_.upgradeRoleStar(e, function(a) {
n.armatureNode.characterNode.getComponent("characterArmatureComponent").play_("win");
g.playWord(n.data.classId);
n.scheduleOnce(function() {
var t = m.player.team.getRoleByIdx(e);
r.addUpgradeShowPanel(M.TYPE.UPGRADE_ROLE_STAR, a._temp.preRole, t);
}, .5);
});
});
}
},
onCloseBreak_: function() {
this.breakLayout.active = !1;
this.breakCloseBt.active = !1;
this.baseLayout.active = !0;
this.btsLayout.active = !0;
r.getBackNode().node.active = !0;
this.leftBt.active = this.leftBt.preActive;
this.rightBt.active = this.rightBt.preActive;
this.data.breakSoulCount = 0;
this.data.breakSelectBagIdxs = [];
},
onBreak_: function() {
var e = this.data._role.idx, a = this.data.breakSelectBagIdxs;
if (0 != a.length) {
var t = this, n = s.t("是否花费$1钻石和$2金币突破?", [ this.data.breakCostGem, this.data.breakCostCoin ]);
r.addMessageBox(n, function() {
r.addLoading();
_.roleBreak(e, a, function(a) {
t.armatureNode.characterNode.getComponent("characterArmatureComponent").play_("win");
t.scheduleOnce(function() {
var n = m.player.team.getRoleByIdx(e);
r.addUpgradeShowPanel(M.TYPE.UPGRADE_ROLE_STAR, a._temp.preRole, n);
g.playWord(t.data.classId);
}, .5);
t.data.breakSoulCount = 0;
t.data.breakSelectBagIdxs = [];
});
});
} else r.addHintPanel(s.t("请选择灵魂石"));
},
onSoulItem_: function(e) {
var a = e.target, n = a.data;
if (this.data.breakCostSoul) {
a.selectSp.active = !a.selectSp.active;
if (a.selectSp.active) {
if (this.data.breakSoulCount == this.data.breakCostSoul) {
a.selectSp.active = !1;
return;
}
this.data.breakSelectBagIdxs.push(n._item.idx);
} else this.data.breakSelectBagIdxs = t.without(this.data.breakSelectBagIdxs, n._item.idx);
var r = 0;
for (var s in this.data.breakSelectBagIdxs) r += m.player.bag.getItemByIdx(this.data.breakSelectBagIdxs[s]).count;
r = r < this.data.breakCostSoul ? r : this.data.breakCostSoul;
this.data.breakSoulCount = r;
this.breakSoulBar.progress = this.data.breakSoulCount / this.data.breakCostSoul;
i.replaceLabel(this.breakSoulCountLabel, [ this.data.breakSoulCount, this.data.breakCostSoul ]);
this.breakBreakLightSp.active = r == this.data.breakCostSoul;
}
},
onBreakRule_: function() {
r.addRulePanel($.TYPE.BREAK);
},
onUseExpItem_: function() {
r.addPanel(this.expItemsPanel, !0, !0);
for (var e in this.expItemsPanel.expItemNodeMap) {
var a = this.expItemsPanel.expItemNodeMap[e], t = m.player.bag.getItemByKindId(e) || {
kindId: e,
count: 0
}, n = f.genData(t, !0);
a.data = {
bagIdx: t.idx || 0,
count: t.count
};
a.itemItem.getComponent("itemItem").update_(n);
a.getChildByName("name_label").getComponent(cc.Label).string = n.name;
var s = a.getChildByName("exp_label").getComponent(cc.Label);
i.replaceLabel(s, [ n._data.extra.roleExp ]);
a.useCountLabel.active = !1;
}
},
onUseExpItemMax_: function() {
var e = this.data._role.idx, a = s.t("是否消耗相应道具，升级到最高级?");
r.addMessageBox(a, function() {
r.addLoading();
_.useExpItemMax(e, function() {
g.playEffect(k.sound_effect_add_exp_mp3);
});
});
},
onExpItem_: function(e) {
var a = e.target, t = a.data;
if (0 == t.count) return !0;
this.useExpItem_ = function() {
if (0 == this.useExpData.itemCount) {
r.addHintPanel(s.t("道具已经用完"));
return !1;
}
var e = m.player.bag.getItemByIdx(this.useExpData.bagIdx).kindId, t = o.findEntityById(e).extra.roleExp, n = this.useExpData.nextLevelExp, l = D.getMaxLevel(m.player.level, this.data._role.star, this.data._role.awakeLevel);
if (this.useExpData.level == l && this.useExpData.exp >= n) {
r.addHintPanel(s.t("已满级"));
return !1;
}
this.useExpData.exp += t;
this.useExpData.level == l && (this.useExpData.exp = this.useExpData.exp < n ? this.useExpData.exp : n);
if (this.useExpData.exp >= n && this.useExpData.level < l) for (;this.useExpData.exp >= n; ) {
if (this.useExpData.level < l) {
this.useExpData.level += 1;
this.useExpData.exp -= n;
i.scaleEffect(this.levelLabel.node);
i.replaceLabel(this.levelLabel, [ this.useExpData.level ]);
}
n = o.findExperienceByLevel(this.useExpData.level).roleExp;
this.useExpData.nextLevelExp = n;
if (this.useExpData.level == l) break;
}
i.replaceLabel(this.expLabel, [ this.useExpData.exp, this.useExpData.nextLevelExp ]);
this.expBar.progress = this.useExpData.exp / this.useExpData.nextLevelExp;
this.useExpData.useItemCount++;
this.useExpData.itemCount--;
a.itemItem.getComponent("itemItem").update_(f.genData({
kindId: e,
count: this.useExpData.itemCount
}, !0));
a.useCountLabel.active = !0;
i.replaceLabel(a.useCountLabel.getComponent(cc.Label), [ this.useExpData.useItemCount ]);
g.playEffect(k.sound_effect_add_exp_mp3);
return !0;
};
this.endUseExpItem_ = function() {
if (0 != this.useExpData.useItemCount) {
var e = this;
r.addLoading();
_.useExpItem(this.data._role.idx, this.useExpData.bagIdx, this.useExpData.useItemCount, function() {
e.onUseExpItem_();
l.callNext("roleHandler", "guideNext6");
});
a.useCountLabel.active = !1;
this.useExpData.useItemCount = 0;
}
};
this.useExpItemTick_ = this.useExpItemTick_ || function() {
if (!this.useExpItem_()) {
this.unschedule(this.useExpItemTick_);
this.endUseExpItem_();
}
};
switch (e.type) {
case cc.Node.EventType.TOUCH_START:
this.useExpData = {
level: this.data.level,
exp: this.data.exp,
nextLevelExp: this.data.nextLevelExp,
bagIdx: t.bagIdx,
itemCount: t.count,
useItemCount: 0
};
this.delayUseExpItem_ = this.delayUseExpItem_ || function() {
this.schedule(this.useExpItemTick_, .1);
};
this.scheduleOnce(this.delayUseExpItem_, .5);
break;

case cc.Node.EventType.TOUCH_CANCEL:
case cc.Node.EventType.TOUCH_END:
this.unschedule(this.delayUseExpItem_);
this.unschedule(this.useExpItemTick_);
0 == this.useExpData.useItemCount && this.useExpItem_();
this.endUseExpItem_();
}
},
onEvlItem_: function(a) {
var t = e("eqptScene"), n = a.target, o = n.data, c = this.data._role;
if (c.idx) if (o.isShowEvolve) {
var h = o.equipmentType, u = o._data.effect, p = s.t("是否花费$1金币和消耗相应道具进化该招式?", [ d.EQUIPMENTS.FUNS.getEvolveCost(o._data.color + 1) ]), f = this;
r.addMessageBox(p, function() {
r.addLoading();
_.evolveEquipment(c.idx, h, function() {
f.eqptEvolveEffectArmature.setPosition(n.getPosition());
i.spineEffect(f.eqptEvolveEffectArmature);
var e = m.player.team.getRoleByIdx(c.idx).equipments[h], a = t.getEvolveAttrDescStrs(u, o._item.attrs, e.attrs), s = n.convertToWorldSpaceAR(cc.Vec2.ZERO);
s.y += 30;
for (var d in a) f.scheduleOnce(function() {
r.showText(this.str, this.pos);
}.bind({
str: a[d],
pos: s
}), .5 * Number(d));
g.playEffect(k.sound_effect_eqpt_evolve_mp3);
l.callNext("roleHandler", "guideNext3");
});
}, function() {
C.pushScene(C.NAME.EQPT_SCENE, {
selectItemName: n.name,
roleIdx: c.idx,
roleIdxs: N.roleIdxs
});
}, null, null, !!l.roleHandler.run);
} else C.pushScene(C.NAME.EQPT_SCENE, {
selectItemName: n.name,
roleIdx: c.idx,
roleIdxs: N.roleIdxs
});
},
onEvlAllItem_: function() {
var a = e("eqptScene"), n = this.data._role;
if (n.idx) {
for (var i = 0, o = [], l = 0; l < 6; l++) {
var c = this.itemsLayout.getChildByName("item_item_" + (l + 1)).data;
c.isShowEvolve && (i += d.EQUIPMENTS.FUNS.getEvolveCost(c._data.color + 1));
o.push(c);
}
if (0 != i) {
var h = s.t("是否花费$1金币和消耗相应道具进化所有招式?", [ i ]), u = this;
r.addMessageBox(h, function() {
r.addLoading();
_.evolveAllEquipment(n.idx, function(e) {
for (var i = 0; i < 6; i++) {
var s = u.itemsLayout.getChildByName("item_item_" + (i + 1)), l = o[i];
if (t.include(e._temp.equipmentTypes, l.equipmentType)) {
var c = l._data.effect, d = m.player.team.getRoleByIdx(n.idx).equipments[l.equipmentType], h = a.getEvolveAttrDescStrs(c, l._item.attrs, d.attrs), p = s.convertToWorldSpaceAR(cc.Vec2.ZERO);
p.y += 30;
for (var _ in h) u.scheduleOnce(function() {
r.showText(this.str, this.pos);
}.bind({
str: h[_],
pos: p
}), .5 * Number(_));
}
}
g.playEffect(k.sound_effect_eqpt_evolve_mp3);
});
});
} else r.addHintPanel(s.t("没有可进化的招式"));
}
},
onStoneItem_: function(e) {
var a = e.target, t = a.data;
this.statusData.selectStoneIdx = a.idx;
for (var n in this.stoneItemMap) this.stoneItemMap[n].getComponent("itemItem").unSelect_();
a.getComponent("itemItem").select_();
this.stoneSelectItem.getComponent("itemItem").update_(t);
this.stoneSelectItem.getComponent("itemItem").setCountLabelActive_(!1);
this.stoneSelectItemNameLabel.string = t.name;
var i = N.getAttrDesc(t._data.effect);
this.stoneSelectAttrNameLabel.string = i.name;
this.stoneSelectAttrValueLabel.string = i.value;
},
onForgeStone_: function() {
var e = this.stoneItemMap[this.statusData.selectStoneIdx].data;
if (e._data.forgeItemId) {
r.addPanel(this.forgePanel, !0);
this.forgePanel.getComponent("forgePanel").update_(v.genData(e._item));
} else r.addHintPanel(s.t("已经是最顶级的了,不能合成"));
},
onEquipStone_: function() {
var e = this.data._role, a = this.stoneItemMap[this.statusData.selectStoneIdx].data._item.idx;
r.addLoading();
_.equipStone(e.idx, a, function() {
g.playEffect(k.sound_effect_equip_stone_mp3);
});
},
onUnEquipStone_: function(e) {
var a = this.data._role, t = e.target.data._data.equipmentType;
r.addLoading();
_.unEquipStone(a.idx, t, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
});
},
onUnEquipAllStone_: function() {
var e = this.data._role;
r.addLoading();
_.unEquipAllStone(e.idx, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
});
},
onEquipAllStone_: function() {
var e = this.data._role;
r.addLoading();
_.equipAllStone(e.idx, function() {
g.playEffect(k.sound_effect_equip_stone_mp3);
});
},
onArtifactItem_: function(e) {
var a = e.target, t = a.data;
this.statusData.selectArtifactIdx = a.idx;
for (var n in this.artifactItemMap) this.artifactItemMap[n].getComponent("itemItem").unSelect_();
a.getComponent("itemItem").select_();
this.artifactSelectItem.getComponent("itemItem").update_(t);
this.artifactSelectItem.getComponent("itemItem").setCountLabelActive_(!1);
this.artifactSelectItem.getComponent("itemItem").setOwerLabelActive_(!1);
this.artifactSelectItemNameLabel.string = t.name;
var i = t._data.starVals[t._item.star], r = N.getAttrDesc(t._data.effect, i);
this.artifactSelectAttrNameLabel.string = r.name;
this.artifactSelectAttrValueLabel.string = r.value;
this.artifactLeftUnequipBt.active = !!t._item.owerName;
this.artifactLeftUnequipBt.data = t._item;
this.artifactLeftUpgradeBt.active = !this.artifactLeftUnequipBt.active;
},
onArtifactUpgrade_: function() {
var e = this.artifactItemMap[this.statusData.selectArtifactIdx].data;
if (e._item.star != d.ARTIFACT.CONSTS.MAX_STAR) {
r.addPanel(this.artifactUpgradePanel, !0, !0);
this.artifactUpgradePanel.getComponent("artifactUpgradePanel").update_(S.genData(e._item));
} else r.addHintPanel(s.t("已满星"));
},
onEquipArtifact_: function() {
if (this.artifactItemMap[this.statusData.selectArtifactIdx].data._item.owerName) r.addHintPanel(s.t("请先卸下装备")); else {
var e = this.data._role, a = this.artifactItemMap[this.statusData.selectArtifactIdx].data._item.idx;
r.addLoading();
_.equipArtifact(e.idx, a, function() {
g.playEffect(k.sound_effect_equip_stone_mp3);
});
}
},
onUnEquipArtifact_: function(e) {
var a = this.data._role, t = e.target.data.equipmentType;
r.addLoading();
_.unEquipArtifact(a.idx, t, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
});
},
onUnEquipAllArtifact_: function() {
var e = this.data._role;
r.addLoading();
_.unEquipAllArtifact(e.idx, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
});
},
onEquipAllArtifact_: function() {
var e = this.data._role;
r.addLoading();
_.equipAllArtifact(e.idx, function() {
g.playEffect(k.sound_effect_equip_stone_mp3);
});
},
onUnequip_: function(e) {
var a = e.target.data;
if (a.type == d.CONSTS.ENTITY_TYPE.CAPSULE) {
var t = this;
r.addLoading();
_.unEquipCapsule(a.teamIdx, a.equipmentType, function(e) {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
storage.setItem("capsule_new_" + m.player.id + "_" + e.bag.lastIdx, 1);
var a = t.statusData.role || m.player.team.getRoleByIdx(t.statusData.roleIdx);
t.update_([ a ]);
});
} else if (a.type == d.CONSTS.ENTITY_TYPE.STAR_SIGN) {
t = this;
r.addLoading();
_.unEquipStarSign(a.teamIdx, a.equipmentType, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
var e = t.statusData.role || m.player.team.getRoleByIdx(t.statusData.roleIdx);
t.update_([ e ]);
});
} else {
r.addLoading();
_.unEquipArtifact(a.teamIdx, a.equipmentType, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
});
}
},
onArtifactRule_: function() {
r.addRulePanel($.TYPE.ARTIFACT);
},
onEvolve_: function() {
if (this.data._data.evolutionRoleId) {
var e = this.data._role.idx, a = this;
r.addLoading();
_.evolveRole(e, function(t) {
a.armatureNode.characterNode.getComponent("characterArmatureComponent").play_("win");
g.playWord(a.data.classId);
i.spineEffect(a.evolveEffectArmature);
r.addLoading();
a.scheduleOnce(function() {
r.removeLoading();
l.callNext("roleHandler", "guideNext4");
var a = m.player.team.getRoleByIdx(e);
r.addUpgradeShowPanel(M.TYPE.UPGRADE_ROLE_COLOR, t._temp.preRole, a);
}, 1);
});
} else r.addHintPanel(s.t("已进阶到最高阶，无法进阶"));
},
onAwakeIncreaseRate_: function() {
var e = this.data._role;
r.addLoading();
var a = this;
_.increaseAwakeLevelUpgradeSuccessRate(e.idx, function() {
i.spineEffect(a.awakeIncreaseRateEffectArmature);
});
},
onAwake_: function() {
var e = this.data._role.idx, a = this;
r.addLoading();
_.upgradeRoleAwakeLevel(e, function(t) {
if (t._temp.isSuccess) a.scheduleOnce(function() {
var n = m.player.team.getRoleByIdx(e);
r.addUpgradeShowPanel(M.TYPE.UPGRADE_ROLE_AWAKE, t._temp.preRole, n);
g.playWord(a.data.classId);
}, .5); else {
i.spineEffect(a.awakeFailEffectArmature);
g.playEffect(k.sound_effect_artifact_upgrade_fail_mp3);
}
a.leftBt.active = !1;
a.rightBt.active = !1;
});
},
onAwakeRule_: function() {
r.addRulePanel($.TYPE.AWAKE);
},
onEvolveSkillConfirm_: function(e, a) {
this.selectSkillIdx = t.isUndefined(a) ? this.selectSkillIdx : Number(a);
r.addPanel(this.evolveSkillConfirmPanel);
var n = this.data.skillItems[this.selectSkillIdx];
this.evolveSkillItem.getComponent("skillItem").update_(n);
this.evolveSkillText.string = n._data.unlockDesc;
this.evolveSkillCostGemLabel.string = s.t("花费$1", [ this.data.evolveSkillIncreaseRateCostGem ]);
i.replaceLabel(this.evolveSkillIncreaseRateLabel, [ i.floatStrip(100 * this.data.evolveSkillIncreaseRate) ]);
i.replaceLabel(this.evolveSkillCurRateLabel, [ i.floatStrip(100 * this.data.evolveSkillCurRate) ]);
var o = this.data.evolveSkillItems[this.selectSkillIdx];
i.replaceLabel(this.evolveSkillSoulCountLabel, [ this.data.soulCount, o.evolveSkillCostSoul ]);
this.evolveSkillSoulCountLabel.node.parent.getChildByName("money_sp").getComponent("moneySpComponent").kindId = this.data.soulKindId;
var l = m.player.bag.getItemCount(o.evolveSkillNeedItemId);
i.replaceLabel(this.evolveSkillCostLabel, [ l, o.evolveSkillCostItemCount ]);
this.evolveSkillCostLabel.node.color = l < o.evolveSkillCostItemCount ? cc.Color.RED : cc.Color.WHITE;
},
onEvolveSkill_: function() {
var e = this.data._role.idx, a = this, t = this.data.evolveSkillItems[this.selectSkillIdx];
r.addLoading();
_.evolveRoleSkill(e, t.id, function(e) {
if (e._temp.isSuccess) {
var t = a.evolveSkillItem.getComponent("skillItem").effectArmature;
t.active = !0;
t.getComponent(sp.Skeleton).setAnimation(0, "action", !1);
g.playEffect(k.sound_effect_skill_upgraded_mp3);
g.playWord(a.data.classId);
a.onCloseEvolveSkillConfirm_();
r.addHintPanel(s.t("觉醒成功"));
} else {
var n = a.evolveSkillFailEffectArmature;
n.active = !0;
n.getComponent(sp.Skeleton).setAnimation(0, "action", !1);
g.playEffect(k.sound_effect_artifact_upgrade_fail_mp3);
}
});
},
onEvolveSkillIncreaseRate_: function() {
var e = this.data._role, a = this;
r.addLoading();
_.increaseEvolveSkillSuccessRate(e.idx, function() {
i.spineEffect(a.evolveSkillIncreaseRateEffectArmature);
});
},
onCloseEvolveSkillConfirm_: function() {
r.removePanel(this.evolveSkillConfirmPanel);
},
onArmature_: function() {
this.armatureNode.characterNode.getComponent("characterArmatureComponent").playRandom_();
},
onItemFrom_: function() {
var e = this.data.star < 5 ? this.data.nextStarSoulCount : 0;
if (!this.data._role.idx) {
var a = o.findEntityById(this.data.soulKindId);
e = D.getComposeRoleCost(a.star).soul;
}
r.addItemFromPanel(this.data.soulKindId, e);
},
onReset_: function() {
var e = this.data._role.idx, a = this.statusData.selectTrainType;
if ("train_bt" == this.statusData.selectBtName) {
var t = s.t("重置战士的$1将返还全部培养资源包括灵魂石、金币、钻石，是否花费$2钻石重置？", [ N.TRAIN_TYPE_NAME_MAP[a], P.RESET_TRAIN_COST_GEM ]);
r.addMessageBox(t, function() {
r.addLoading();
_.resetRoleTrain(e, a, function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap, s.t("重置成功"), null, 2);
});
});
} else {
t = s.t("重置战士将返还初始战士和全部培养资源包括进化招式材料、圣水、技能点、金币，是否花费$1钻石重置？", [ P.RESET_COST_GEM ]);
r.addMessageBox(t, function() {
r.addLoading();
_.resetRole(e, function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap, s.t("获得技能点:$1", [ e._temp.getSkillPoint ]), null, 2);
});
});
}
},
onTrainItem_: function(e) {
var a = e.target.data;
this.statusData.selectTrainType = Number(a.type);
var t = this.statusData.role || m.player.team.getRoleByIdx(this.statusData.roleIdx);
this.update_([ t ]);
var n = this.btsLayout.getChildByName(this.statusData.selectBtName);
this.onType_({
target: n
});
},
onTrain_: function() {
var e = this.data._role.idx, a = this, t = this.data.trainItems[this.statusData.selectTrainType - 1];
if (p.isTrainNoMore || this.data._role.trainUnlockMap[t.type]) {
var n = this.selectTrainAttrItem;
r.addLoading();
_.trainRole(e, this.statusData.selectTrainType, function() {
a.leftBt.active = !1;
a.rightBt.active = !1;
i.spineEffect(n.canUpSpine, "action_2", function(e) {
e.getComponent(sp.Skeleton).setAnimation(0, "action_1", !0);
e.active = !1;
});
});
} else this.unlockTrain_(t.type);
},
unlockTrain_: function(e) {
var a = this.data._role.idx, t = this.data.trainItems[e - 1];
if (e > 1 && !this.data._role.trainUnlockMap[e - 1]) {
var n = this.data.trainItems[e - 2];
r.addHintPanel(s.t("请先解锁[$1]", [ n.name ]));
} else {
var i = s.t("[$1]项目还未解锁！\n解锁项目需要消耗$2个修行证书，是否进行解锁？", [ t.name, P.TRAIN_UNLOCK_COST.COUNT ]);
r.addMessageBox(i, function() {
r.addLoading();
_.unlockRoleTrain(a, e);
});
}
},
onCapsuleItem_: function(e) {
var a = e.target, n = a.data;
this.statusData.selectCapsuleIdx = a.idx;
for (var i in this.capsuleItemMap) this.capsuleItemMap[i].getComponent("itemItem").unSelect_();
a.getComponent("itemItem").select_();
a.getComponent("itemItem").unNew_();
this.capsuleSelectItem.getComponent("itemItem").update_(n);
this.capsuleSelectItem.getComponent("itemItem").unNew_();
this.capsuleSelectItem.getComponent("itemItem").setCountLabelActive_(!1);
this.capsuleSelectItem.getComponent("itemItem").setOwerLabelActive_(!1);
this.capsuleSelectItem.data = n;
this.capsuleSelectItem.getComponent("itemItem").setClickEvent_(this, "roleScene", "onViewCapsuleMore_");
this.capsuleSelectItemNameLabel.string = n.name;
this.capsuleSelectAttrDescScrollView.stopAutoScroll();
this.capsuleSelectAttrDescScrollView.scrollToTop(0);
var r = this.capsuleSelectAttrDescScrollView.content;
t.each(r.children, function(e) {
e.active = !1;
});
i = 0;
for (var s in n._item.skillInfo) {
var o = r.children[i];
o.active = !0;
o.color = this.capsuleAttrLabelColors[n._item.skillInfo[s].level - 1];
var l = d.CAPSULE.FUNS.getAttrDesc(s, n._item.skillInfo[s].level);
o.getComponent(cc.Label).string = l;
i++;
}
this.capsuleLeftUnequipBt.active = !!n._item.owerName;
this.capsuleLeftUnequipBt.data = n._item;
this.capsuleLeftEquipBt.active = !this.capsuleLeftUnequipBt.active;
},
onCapsuleReset_: function() {
var e = this.capsuleItemMap[this.statusData.selectCapsuleIdx].data;
e.owerName ? r.addHintPanel(s.t("请先卸下胶囊")) : this.capsuleResetPanel.getComponent("capsuleResetPanel").show_(e._item.idx);
},
onEquipCapsule_: function() {
if (this.capsuleItemMap[this.statusData.selectCapsuleIdx].data._item.owerName) r.addHintPanel(s.t("请先卸下装备")); else {
var e = this.data._role, a = this.capsuleItemMap[this.statusData.selectCapsuleIdx].data._item.idx;
r.addLoading();
_.equipCapsule(e.idx, a, function() {
g.playEffect(k.sound_effect_equip_stone_mp3);
});
}
},
onUnEquipCapsule_: function(e) {
var a = this.data._role, n = e.target.data.equipmentType, i = t.find(this.capsuleItems, function(e) {
return e.data.equipmentType == n && e.data.teamIdx == a.idx;
});
this.onCapsuleItem_({
target: i
});
this.onViewCapsuleMore_({
target: this.capsuleSelectItem.getComponent("itemItem")
});
},
onUnEquipAllCapsule_: function() {
var e = this.data._role;
r.addLoading();
_.unEquipAllCapsule(e.idx, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
});
},
onEquipAllCapsule_: function() {
var e = this.data._role;
r.addLoading();
_.equipAllCapsule(e.idx, function() {
g.playEffect(k.sound_effect_equip_stone_mp3);
});
},
onCapsuleRule_: function() {
r.addRulePanel($.TYPE.CAPSULE);
},
onLockArtifactCapsule_: function(e) {
r.addHintPanel(s.t("觉醒$1级解锁", [ e.target.data.needAwakeLevel ]));
},
onViewCapsuleMore_: function(e) {
var a = e.target.getComponent("itemItem").data;
this.capsuleViewMoreNode.active = !0;
this.capsuleViewMoreNode.getChildByName("name_label").getComponent(cc.Label).string = a.name;
this.capsuleViewMoreNode.getChildByName("attr_layout").getChildByName("value_label").getComponent(cc.Label).string = a._data.extra.atk;
var t = this.capsuleViewMoreNode.getChildByName("scrollView").getComponent(cc.ScrollView);
t.scrollToTop(0);
for (var n = [], s = 0; s < 3; s++) {
var o = t.content.getChildByName("skill_item_" + (s + 1));
o.active = !1;
n.push(o);
}
var l = d.CAPSULE.CONSTS.ATTR_VALUES_MAP;
s = 0;
for (var c in a._item.skillInfo) {
n[s].active = !0;
var h = a._item.skillInfo, u = n[s].getChildByName("skill_sp").getComponent(cc.Sprite);
r.setSpriteFrame(u, k["skill_capsule_" + d.CAPSULE.CONSTS.ATTR_NAME_SKILL_ID_MAP[c] + "_png"]);
var m = n[s].getChildByName("name_label");
m.color = this.capsuleAttrLabelColors[h[c].level - 1];
var g = d.CAPSULE.FUNS.getAttrDesc(c, h[c].level);
m.getComponent(cc.Label).string = g;
var p = {};
p[c] = l[c][h[c].level - 1];
var _ = N.getAttrDesc(p), f = n[s].getChildByName("desc_RichText").getComponent(cc.RichText);
i.replaceLabel(f, [ _.name, _.value ]);
s++;
}
this.capsuleViewMoreNode.getChildByName("desc_label").getComponent(cc.Label).string = a._data.desc;
},
onCloseViewCapsuleMore_: function() {
this.capsuleViewMoreNode.active = !1;
},
onCapsuleBook_: function() {
this.capsuleBookPanel.getComponent("capsuleBookPanel").show_();
},
onCapsuleCompose_: function() {
this.capsuleComposePanel.getComponent("capsuleComposePanel").show_();
},
onWarSoul_: function() {
this.warSoulNode.getComponent("warSoulPanel").show_(this.data._role.idx);
},
onStarSignUpgrade_: function() {
var e = this.starSignItemMap[this.statusData.selectStarSignIdx].data;
e._item.level != d.STAR_SIGN.CONSTS.MAX_LEVEL ? this.starSignUpgradePanel.getComponent("starSignUpgradePanel").show_(e._item) : r.addHintPanel(s.t("已满级"));
},
onStarSignItem_: function(e) {
var a = e.target, t = a.data;
this.statusData.selectStarSignIdx = a.idx;
for (var n in this.starSignItemMap) this.starSignItemMap[n].getComponentInChildren("itemItem").unSelect_();
a.getComponentInChildren("itemItem").select_();
this.starSignSelectItem.getComponent("itemItem").update_(t);
this.starSignSelectItem.getComponent("itemItem").setCountLabelActive_(!1);
this.starSignSelectItem.getComponent("itemItem").setOwerLabelActive_(!1);
this.starSignSelectItem.data = t;
i.replaceLabel(this.starSignSelectItemNameLabel, [ t._item.level, t.name ]);
var r = {};
r[t._data.extra.attr] = t._item.attrValue;
var s = N.getAttrDesc(r);
this.starSignSelectAttrNameLabel.string = s.name;
this.starSignSelectAttrValueLabel.string = s.value;
this.starSignLeftUnequipBt.active = !!t._item.owerName;
this.starSignLeftUnequipBt.data = t._item;
this.starSignLeftUpgradeBt.active = !this.starSignLeftUnequipBt.active;
this.starSignLeftDecomposeBt.active = !t._item.owerName;
},
onEquipStarSign_: function() {
if (this.starSignItemMap[this.statusData.selectStarSignIdx].data._item.owerName) r.addHintPanel(s.t("请先卸下装备")); else {
var e = this.data._role.idx, a = this.starSignItemMap[this.statusData.selectStarSignIdx].data._item.idx;
r.addLoading();
_.equipStarSign(e, a, function() {
g.playEffect(k.sound_effect_equip_stone_mp3);
});
}
},
onUnEquipStarSign_: function(e) {
var a = this.data._role, t = e.target.data.equipmentType;
r.addLoading();
_.unEquipStarSign(a.idx, t, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
});
},
onUnEquipAllStarSign_: function() {
var e = this.data._role;
r.addLoading();
_.unEquipAllStarSign(e.idx, function() {
g.playEffect(k.sound_effect_un_equip_stone_mp3);
});
},
onEquipAllStarSign_: function() {
var e = this.data._role;
r.addLoading();
_.equipAllStarSign(e.idx, function() {
g.playEffect(k.sound_effect_equip_stone_mp3);
});
},
onStarSignBook_: function() {
this.starSignBookPanel.getComponent("starSignBookPanel").show_();
},
onStarSignDecompose_: function() {
var e = this.starSignItemMap[this.statusData.selectStarSignIdx].data, a = d.STAR_SIGN.FUNS.getDecomposeReward(e._data.extra.attr, e._data.extra.color, e._item.level), n = t.findWhere(a, {
entityId: 61002
}).count, i = this;
r.addMessageBox(s.t("将要分解：+$1$2\n确认需要分解？（返还50%强化资源和陨星碎片x$3 ）", [ e._item.level, e.name, n ]), function() {
r.addLoading();
I.decomposeStarSign([ e._item.idx ], function(e) {
r.addRewardPanel(s.t("分解成功"), e._temp.entityCountMap, null, s.t("分解返还资源"));
var a = i.statusData.role || m.player.team.getRoleByIdx(i.statusData.roleIdx);
i.update_([ a ]);
});
});
},
onStarSignDecomposeAll_: function() {
this.starSignDecomposeAllPanel.getComponent("starSignDecomposeAllPanel").show_();
},
onStarSignRule_: function() {
r.addRulePanel($.TYPE.STAR_SIGN);
},
onStarSignPoint_: function() {
C.popToHomeScene(function() {
e("homeScene").instance.onStarSignPoint_();
});
}
});
N.genData = function(e) {
var a = m.player, n = (a.team, a.bag), i = o.findEntityById(e.kindId), r = o.findSoulByClassId(i.classId);
if (!e.idx) {
e.star = r.star;
e.skills = [];
e.awakeSkills = [];
e.trainLevelMap = {};
e.trainUnlockMap = {};
e.level = 1;
e.attr = {};
e.initAttr = {};
var l = P.STAR_GROWTH, c = Math.floor(i.hpGrowth * l[e.star]), u = Math.floor(i.atkGrowth * l[e.star]), g = Math.floor(i.defGrowth * l[e.star]), _ = Math.floor(i.mdefGrowth * l[e.star]);
e.attr.hpGrowth = c;
e.attr.atkGrowth = u;
e.attr.defGrowth = g;
e.attr.mdefGrowth = _;
e.initAttr.hp = Math.floor(i.initHp + c * e.level);
e.initAttr.atk = Math.floor(i.initAtk + u * e.level);
e.initAttr.def = Math.floor(i.initDef + g * e.level);
e.initAttr.mdef = Math.floor(i.initMdef + _ * e.level);
e.initAttr.hit = Math.floor(i.hit);
e.initAttr.dodge = Math.floor(i.dodge);
e.initAttr.crit = Math.floor(i.crit);
var k = i.initEvlItemIds, b = {
evlItem_1: {
kindId: k[0],
level: 1
},
evlItem_2: {
kindId: k[1],
level: 1
},
evlItem_3: {
kindId: k[2],
level: 1
},
evlItem_4: {
kindId: k[3],
level: 1
},
evlItem_5: {
kindId: k[4],
level: 1
},
evlItem_6: {
kindId: k[5],
level: 1
}
};
e.equipments = b;
}
var v = C.teamData.teamItemMap[e.idx || 0] || T.genTeamItemData(e), S = v.roleItem, M = {
1: s.t("前排战士"),
2: s.t("中排战士"),
3: s.t("后排战士")
}[i.positionType], $ = n.getItemCount(r.kindId), I = D.getUpgradeCost(e.star), A = [];
for (var L in e.skills) {
var E = y.genData(e.skills[L].kindId, e.skills[L].level, e);
A.push(E);
}
var B = i.skillIds;
for (L = A.length; L < B.length; L++) {
E = y.genData(B[L], 0);
A.push(E);
}
var w, G, R = 0, H = 0, x = 0, K = 0, F = 0, V = 0, O = t.values(e.skills).concat(t.values(e.awakeSkills));
for (var L in O) if ((w = o.fightSkill.findById(O[L].kindId)).type == h.FIGHT_SKILL.TYPE.PASSIVE) for (var U, W = 0; W < w.buffIds.length; W++) if ((G = o.buff.findById(w.buffIds[W])).isAttacker) {
U = G.extra.growth * O[L].level;
null != G.extra.hp && (R += G.extra.hp + U);
null != G.extra.atk && (H += G.extra.atk + U);
null != G.extra.def && (x += G.extra.def + U);
null != G.extra.mdef && (K += G.extra.mdef + U);
null != G.extra.crit && (F += G.extra.crit + U);
null != G.extra.dodge && (V += G.extra.dodge + U);
}
var Y = {};
for (var j in e.equipments) t.include([ "stoneItem_1", "stoneItem_2", "stoneItem_3", "stoneItem_4", "stoneItem_5", "stoneItem_6" ], j) && (Y[j] = e.equipments[j] ? f.genData(e.equipments[j]) : null);
var q = {};
for (var j in e.equipments) t.include(d.EQUIPMENTS.CONSTS.ARTIFACT_ITEM_TYPES, j) && (q[j] = e.equipments[j] ? f.genData(e.equipments[j]) : null);
var X = {};
for (var j in e.equipments) t.include(d.EQUIPMENTS.CONSTS.CAPSULE_ITEM_TYPES, j) && (X[j] = e.equipments[j] ? f.genData(e.equipments[j]) : null);
var z = {};
for (var j in e.equipments) t.include([ "starSignItem_1", "starSignItem_2", "starSignItem_3", "starSignItem_4" ], j) && (z[j] = e.equipments[j] ? f.genData(e.equipments[j]) : null);
var J = [];
for (var L in e.awakeSkills) {
E = y.genData(e.awakeSkills[L].kindId, e.awakeSkills[L].level, e);
J.push(E);
}
for (B = t.values(d.SKILL.CONSTS.UN_LOCK_AWAKE_SKILL_ID), L = J.length; L < B.length; L++) {
E = y.genData(B[L], 0);
J.push(E);
}
var Z = D.getAwakeCost(e.awakeLevel), Q = Z.soul, ee = Z.coin, ae = P.AWAKE_NEED_COST_SIX_COIN || 0, te = P.UPGRADE_AWAKE_LEVEL_INCREASE_RATE_COST_GEMS[e.awakeRateIncreaseTimes + 1] || 0, ne = P.UPGRADE_AWAKE_LEVEL_INCREASE_RATE, ie = (10 * P.UPGRADE_AWAKE_LEVEL_RATE + P.UPGRADE_AWAKE_LEVEL_INCREASE_RATE * e.awakeRateIncreaseTimes * 10) / 10, re = D.getUpgradeCost(e.star);
if (p.isHideShenBreak && e.star >= 15) {
re.soul = 0;
re.gem = 0;
re.coin = 0;
}
var se = P.TRAIN_COST, oe = [];
for (j in P.TRAIN_ITEM_IDS_MAP) {
var le = e.trainLevelMap && e.trainLevelMap[j] || 0, ce = P.TRAIN_ITEM_IDS_MAP[j], de = [];
for (var L in ce) de.push({
no: Number(L) + 1,
id: ce[L],
isActive: le > L,
desc: N.getTrainDesc(ce[L])
});
var he = t.where(de, {
isActive: !0
}).length;
oe.push({
type: j,
name: s.t(N.TRAIN_TYPE_NAME_MAP[j]),
nextUnlockNo: le + 1,
isMax: he == ce.length,
attrItems: de
});
}
var ue = [];
for (var L in e.skills) {
var me = e.skills[L].kindId, ge = (E = o.fightSkill.findById(me), D.getEvolveSkillCost(i.group, me)), pe = ge.soul, _e = ge.count;
ue.push({
id: me,
name: E.name,
desc: E.unlockDesc,
resId: E.resId,
level: e.skills[L].level,
isEvolve: t.include(e.evolveSkillIds, me),
evolveSkillCostSoul: pe,
evolveSkillCostItemCount: _e,
evolveSkillNeedItemId: ge.entityId
});
}
var ke = P.EVOLVE_SKILL_INCREASE_RATE_COST_GEMS[e.evolveSkillRateIncreaseTimes + 1] || 0, fe = P.EVOLVE_SKILL_INCREASE_RATE, ye = (10 * P.EVOLVE_SKILL_RATE + P.EVOLVE_SKILL_INCREASE_RATE * e.evolveSkillRateIncreaseTimes * 10) / 10;
return {
hpGrowth: e.attr.hpGrowth,
atkGrowth: e.attr.atkGrowth,
defGrowth: e.attr.defGrowth,
mdefGrowth: e.attr.mdefGrowth,
hp: e.initAttr.hp,
atk: e.initAttr.atk,
def: e.initAttr.def,
mdef: e.initAttr.mdef,
crit: e.initAttr.crit,
hit: e.initAttr.hit,
dodge: e.initAttr.dodge,
hpExtra: e.idx ? e.attr.hp - e.initAttr.hp + R : 0,
atkExtra: e.idx ? e.attr.atk - e.initAttr.atk + H : 0,
defExtra: e.idx ? e.attr.def - e.initAttr.def + x : 0,
mdefExtra: e.idx ? e.attr.mdef - e.initAttr.mdef + K : 0,
critExtra: e.idx ? e.attr.crit - e.initAttr.crit + F : 0,
hitExtra: e.idx ? e.attr.hit - e.initAttr.hit : 0,
dodgeExtra: e.idx ? e.attr.dodge - e.initAttr.dodge + V : 0,
color: i.color,
group: i.group,
name: i.kindName,
title: i.title,
positionDesc: M,
inrto: i.desc,
spInrto: i.spDesc,
level: e.level,
power: e.power,
exp: e.experience,
nextLevelExp: e.nextLevelExp,
soulKindId: r.kindId,
soulCount: $,
nextStarSoulCount: I.soul,
classId: i.classId,
skillItems: A,
itemItems: v.itemItems,
isShowEvolve: v.isShowEvolve,
isShowUpgradeStar: v.isShowUpgradeStar,
star: S.star,
moon: S.moon,
sun: S.sun,
shen: S.shen,
green: S.green,
blue: S.blue,
purple: S.purple,
orange: S.orange,
trainPurpleStar: S.trainPurpleStar,
trainRedStar: S.trainRedStar,
trainBlueStar: S.trainBlueStar,
evolveSkillCount: S.evolveSkillCount,
equipmentStoneItemMap: Y,
equipmentArtifactItemMap: q,
equipmentCapsuleItemMap: X,
equipmentStarSignItemMap: z,
starSignSkillId: e.equipments.starSignSkillId,
awakeSkillItems: J,
upgradeAwakeLevelCostSoul: Q,
upgradeAwakeLevelIncreaseRateCostGem: te,
upgradeAwakeLevelIncreaseRate: ne,
upgradeAwakeLevelCurRate: ie,
upgradeAwakeLevelCostCoin: ee,
upgradeAwakeLevelCostSixCoin: ae,
breakCostSoul: re.soul,
breakCostGem: re.gem,
breakCostCoin: re.coin,
breakCostIsSelf: re.isSelf,
trainCostSoul: se.SOUL,
trainCostGem: se.GEM,
trainCostCoin: se.COIN,
trainCostStone: se.STONE.COUNT,
trainItems: oe,
evolveSkillItems: ue,
evolveSkillIncreaseRateCostGem: ke,
evolveSkillIncreaseRate: fe,
evolveSkillCurRate: ye,
_role: e,
_data: i
};
};
N.genBagData = function(e) {
var a = m.player, n = a.team, r = a.bag, s = a.team.roles, l = d.CONSTS.ENTITY_TYPE, c = r.getItemByType(l.STONE), h = [];
for (var u in c) {
var g = f.genData(c[u], !0);
h.push(g);
}
var p = r.getItemByType(l.ARTIFACT), _ = [];
for (var u in p) {
var k = f.genData(p[u], !0);
_.push(k);
}
for (var u in s) for (var y in s[u].equipments) if (t.include(d.EQUIPMENTS.CONSTS.ARTIFACT_ITEM_TYPES, y) && s[u].equipments[y]) {
var b = i.clone(s[u].equipments[y]), v = o.findEntityById(s[u].kindId), S = o.findEntityById(b.kindId);
b.count = 1;
b.owerName = v.kindName;
b.teamIdx = u;
b.equipmentType = y;
b.type = S.type;
k = f.genData(b, !0, !1, !1, !1, !0);
_.push(k);
}
_ = t.sortBy(_, function(e) {
return e.type == l.ARTIFACT ? -(e.star + 99999) : -r.getItemCount(e.kindId);
});
var T = r.getItemByType(l.CAPSULE), M = [];
for (var u in T) {
var $ = f.genData(T[u], !0);
M.push($);
}
for (var u in s) for (var y in s[u].equipments) if (t.include(d.EQUIPMENTS.CONSTS.CAPSULE_ITEM_TYPES, y) && s[u].equipments[y]) {
b = i.clone(s[u].equipments[y]), v = o.findEntityById(s[u].kindId), S = o.findEntityById(b.kindId);
b.count = 1;
b.owerName = v.kindName;
b.teamIdx = u;
b.equipmentType = y;
b.type = S.type;
($ = f.genData(b, !0, !1, !1, !1, !0)).equipmentType = y;
$.teamIdx = u;
M.push($);
}
M = t.sortBy(M, function(e) {
return e.isNew ? -1e8 : -(100 * e.kindId + (e._item.idx ? 1 : 0));
});
var I = r.getItemByType(l.STAR_SIGN), C = [];
for (var u in I) {
var P = f.genData(I[u], !0);
C.push(P);
}
for (var u in s) for (var y in s[u].equipments) if (t.include([ "starSignItem_1", "starSignItem_2", "starSignItem_3", "starSignItem_4" ], y) && s[u].equipments[y]) {
b = i.clone(s[u].equipments[y]), v = o.findEntityById(s[u].kindId), S = o.findEntityById(b.kindId);
b.count = 1;
b.owerName = v.kindName;
b.teamIdx = u;
b.equipmentType = y;
b.type = S.type;
(P = f.genData(b, !0, !1, !1, !1, !0)).equipmentType = y;
P.teamIdx = u;
C.push(P);
}
C = t.sortBy(C, function(e) {
return -(1e4 * e.color + 100 * e.level + (e.kindId - 61e3) + (e._item.idx ? 1 : 0));
});
var N = D.getUpgradeCost(e.star), A = r.getItemByType(l.SOUL), L = [];
for (var u in A) {
var E = f.genData(A[u], !0), B = n.getRoleByClassId(E._data.classId);
N.isSelf ? B && B.kindId == e.kindId && L.push(E) : B && B.star >= 5 && L.push(E);
}
return {
stoneItems: h,
artifactItems: _,
capsuleItems: M,
starSignItems: C,
soulItems: L
};
};
N.getAttrDesc = function(e, a) {
var t;
if (e.hp) {
t = s.t("生命值");
a = a || e.hp;
} else if (e.atk) {
t = s.t("攻击力");
a = a || e.atk;
} else if (e.def && e.mdef) {
t = s.t("防御力");
a = a || e.def;
} else if (e.critRate) {
t = s.t("暴击率");
a = a || e.critRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.dodgeRate) {
t = s.t("闪避率");
a = a || e.dodgeRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.atkSpeedRate) {
t = s.t("攻击速度");
a = a || e.atkSpeedRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.cdSpeedRate) {
t = s.t("减技能CD");
a = a || e.cdSpeedRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.keepMp) {
t = s.t("保持能量");
a = a || e.keepMp;
a = i.floatStrip(a / 10) + "%";
} else if (e.reboundDmgHp) {
t = s.t("反弹伤害");
a = a || e.reboundDmgHp;
} else if (e.dmg2HpRate) {
t = s.t("普攻吸血");
a = a || e.dmg2HpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.skillDmg2HpRate) {
t = s.t("技能吸血率");
a = a || e.skillDmg2HpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.unConfusedRate) {
t = s.t("全体抗魅惑概率");
a = a || e.unConfusedRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitReduceMpRate) {
t = s.t("破坏能量概率");
a = a || e.hitReduceMpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitRepeledRate) {
t = s.t("击退概率");
a = a || e.hitRepeledRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitReduceAtkSpeedRate) {
t = s.t("减速概率");
a = a || e.hitReduceAtkSpeedRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitRateSilence) {
t = s.t("沉默概率");
a = a || e.hitRateSilence;
a = i.floatStrip(100 * a) + "%";
} else if (e.missReboundTeamRate) {
t = s.t("全体抵抗反伤概率");
a = a || e.missReboundTeamRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.missReboundRate) {
t = s.t("抵抗反伤概率");
a = a || e.missReboundRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.unDizzinessRate) {
t = s.t("抗眩晕概率");
a = a || e.unDizzinessRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.recoverMp1Sec) {
t = s.t("每秒恢复能量");
a = a || e.recoverMp1Sec;
} else if (e.recoverHp10SecRate) {
t = s.t("每10秒回复生命");
a = a || e.recoverHp10SecRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitReduceRecoverHpRate) {
t = s.t("减回血效果概率");
a = a || e.hitReduceRecoverHpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.atkIgnoreDodgeRate) {
t = s.t("无视闪避率");
a = a || e.atkIgnoreDodgeRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.unDeBuffRate) {
t = s.t("抵抗负面效果概率");
a = a || e.unDeBuffRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitRate) {
t = s.t("命中率");
a = a || e.hitRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitMaxHpRate) {
t = s.t("自身受到最大伤害百分比");
a = a || e.hitMaxHpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.incHpRate) {
t = s.t("提高百分比生命值");
a = a || e.incHpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.incAtkRate) {
t = s.t("提高百分比攻击力");
a = a || e.incAtkRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.ignoreCritRate) {
t = s.t("抵抗暴击率");
a = a || e.ignoreCritRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.addMpRecoverRate) {
t = s.t("增加能量回复效果");
a = a || e.addMpRecoverRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.redHitDmgRate) {
t = s.t("减伤率");
a = a || e.redHitDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.addDmgRate2) {
t = s.t("增加攻击伤害");
a = a || e.addDmgRate2;
a = i.floatStrip(100 * a) + "%";
} else if (e.ignoreAddDmgRate2) {
t = s.t("无视胶囊增加的伤害");
a = a || e.ignoreAddDmgRate2;
a = i.floatStrip(100 * a) + "%";
} else if (e.beginMaxHpRateShield) {
t = s.t("开局生成生命值护盾");
a = a || e.beginMaxHpRateShield;
a = i.floatStrip(100 * a) + "%";
} else if (e.atkShieldExtDmgRate) {
t = s.t("对护盾造成额外伤害");
a = a || e.atkShieldExtDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitReduceRecoverHp) {
t = s.t("攻击时减少敌方回血效果");
a = a || e.hitReduceRecoverHp;
a = i.floatStrip(100 * a) + "%";
} else if (e.reviveAddDmgRate) {
t = s.t("复活后提高攻击伤害");
a = a || e.reviveAddDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.beginHitDmgRate) {
t = s.t("开局12秒内物理免伤率");
a = a || e.beginHitDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.beginHitMdmgRate) {
t = s.t("开局12秒内魔法免伤率");
a = a || e.beginHitMdmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitReduceAtkSpeed) {
t = s.t("攻击时减少敌方攻速");
a = a || e.hitReduceAtkSpeed;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitUnReviveRate) {
t = s.t("攻击时禁止敌方复活概率");
a = a || e.hitUnReviveRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitReduceMp) {
t = s.t("攻击时10%概率破坏敌方能量");
a = a || e.hitReduceMp;
} else if (e.hitRateSilence2) {
t = s.t("攻击时沉默敌方4秒概率");
a = a || e.hitRateSilence2;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitRepeledRate2) {
t = s.t("攻击时击退敌方概率");
a = a || e.hitRepeledRate2;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitBleedingHpRate) {
t = s.t("攻击敌方30%概率造成4秒持续流血，每秒流血百分比");
a = a || e.hitBleedingHpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.recoverHp10SecRate2) {
t = s.t("每10秒回复生命值");
a = a || e.recoverHp10SecRate2;
a = i.floatStrip(100 * a) + "%";
} else if (e.skill0AddDmgRate) {
t = s.t("普通攻击伤害提高");
a = a || e.skill0AddDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.beginRecoverFullMpRate) {
t = s.t("开局满能量概率");
a = a || e.beginRecoverFullMpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.removeDeBuffSec) {
t = s.t("持续清除自身负面状态间隔秒数");
a = a || e.removeDeBuffSec;
} else if (e.hitUnRecoverHpRate) {
t = s.t("攻击时禁止敌方回血持续4秒概率");
a = a || e.hitUnRecoverHpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.reboundDmgRate) {
t = s.t("被攻击时反弹受到的伤害");
a = a || e.reboundDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.beginAddDmgRate) {
t = s.t("开局12秒内提升攻击伤害");
a = a || e.beginAddDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.addRecoverHpRedHitDmgRate) {
t = s.t("提升回血效果和伤害减免");
a = a || e.addRecoverHpRedHitDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitUnRecoverMpRate) {
t = s.t("攻击时禁止回复能量持续4秒概率");
a = a || e.hitUnRecoverMpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.ignoreUnDeBuffRate) {
t = s.t("无视敌方抵抗负面效果");
a = a || e.ignoreUnDeBuffRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.addCritDmgRate) {
t = s.t("增加暴击伤害");
a = a || e.addCritDmgRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.addHitRate) {
t = s.t("增加命中率");
a = a || e.addHitRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.addHpRecoverRate) {
t = s.t("增加回血效果");
a = a || e.addHpRecoverRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.privateUnConfusedRate) {
t = s.t("抗魅惑概率");
a = a || e.privateUnConfusedRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.skipHitRate) {
t = s.t("免疫伤害概率");
a = a || e.skipHitRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.unDmg2HpRate) {
t = s.t("被吸血减免");
a = a || e.unDmg2HpRate;
a = i.floatStrip(100 * a) + "%";
} else if (e.hitClearMpRate) {
t = s.t("清空能量概率");
a = a || e.hitClearMpRate;
a = i.floatStrip(100 * a) + "%";
}
return {
name: t,
value: a
};
};
N.TRAIN_TYPE_NAME_MAP = {
1: s.t("龟仙人特训"),
2: s.t("鹤仙人特训"),
3: s.t("卡林仙人特训"),
4: s.t("天神特训"),
5: s.t("精神屋特训"),
6: s.t("那美克长老特训"),
7: s.t("北界王特训"),
8: s.t("大界王特训"),
9: s.t("比鲁斯特训"),
10: s.t("维斯特训"),
11: s.t("贝吉特特训"),
12: s.t("孙悟空特训"),
13: s.t("希特特训"),
14: s.t("布罗利特训"),
15: s.t("吉连特训")
};
N.getTrainDesc = function(e) {
var a = P.TRAIN_ATTR_ITEM_MAP[e], t = null;
a.addDmgRate ? t = s.t("增加$1%攻击伤害", [ i.floatStrip(100 * a.addDmgRate) ]) : a.addCritDmgRate ? t = s.t("增加$1%暴击伤害", [ i.floatStrip(100 * a.addCritDmgRate) ]) : a.addMpRecoverRate ? t = s.t("增加$1%能量回复效果", [ i.floatStrip(100 * a.addMpRecoverRate) ]) : a.ignoreAddDmgRate ? t = s.t("无视对手$1%特训增加的伤害", [ i.floatStrip(100 * a.ignoreAddDmgRate) ]) : a.ignoreCritRate ? t = s.t("抵抗$1%暴击率", [ i.floatStrip(100 * a.ignoreCritRate) ]) : a.seconds5LostHp2HpRate ? t = s.t("每5秒恢复已损失血量$1%", [ i.floatStrip(100 * a.seconds5LostHp2HpRate) ]) : a.addHitRate ? t = s.t("增加$1%命中率", [ i.floatStrip(100 * a.addHitRate) ]) : a.addHpRecoverRate ? t = s.t("增加$1%回血效果", [ i.floatStrip(100 * a.addHpRecoverRate) ]) : a.addAtkSpeedRate && (t = s.t("增加$1%攻击速度", [ i.floatStrip(100 * a.addAtkSpeedRate) ]));
return t;
};
cc._RF.pop();
}, {
artifactUpgradePanel: "artifactUpgradePanel",
bagHandler: "bagHandler",
baseView: "baseView",
"battle.consts": "battle.consts",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
eqptScene: "eqptScene",
forgePanel: "forgePanel",
guide: "guide",
helper: "helper",
homeScene: "homeScene",
http: "http",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
skillInfoPanel: "skillInfoPanel",
skillItem: "skillItem",
soundApi: "soundApi",
starSignPointPanel: "starSignPointPanel",
teamHandler: "teamHandler",
teamScene: "teamScene",
underscore: "underscore",
upgradeShowPanel: "upgradeShowPanel"
} ],
