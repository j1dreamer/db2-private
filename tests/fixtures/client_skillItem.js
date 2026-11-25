skillItem: [ function(e, a) {
"use strict";
cc._RF.push(a, "b1555T32nFER5bH9PaqMoM9", "skillItem");
var t = e("underscore"), n = e("dataApi"), i = e("i18n"), r = e("helper"), s = e("serverMain"), o = e("serverConfig"), l = e("baseView"), c = e("skillInfoPanel"), d = e("resource"), h = e("soundApi"), u = e("teamHandler"), m = e("playerHandler");
cc.Class({
extends: cc.Component,
properties: {
coinSp: cc.Node,
skillSp: cc.Sprite,
levelLabel: cc.Label,
nameLabel: cc.Label,
costLabel: cc.Label,
upgradeBt: cc.Node,
upgradeMaxBt: cc.Node,
effectArmature: cc.Node
},
onLoad: function() {
var a = new cc.Component.EventHandler();
a.target = this.node;
a.component = "skillItem";
a.handler = "onSkillItem_";
this.node.getComponent(cc.Button).clickEvents.push(a);
this.node.addComponent(e("soundComponent"));
this.effectArmature.active = !1;
},
update_: function(e, a) {
this.data = e;
this.skillInfoPanel = a;
l.setSpriteFrame(this.skillSp, d["skill_" + e.resId + "_png"]);
this.coinSp.active = !!e.level;
this.levelLabel.string = i.t("LV.$1", [ e.level ]);
this.levelLabel.node.active = !!e.level;
l.setGray(this.skillSp.node, !!e.level);
this.nameLabel.string = e.name;
this.costLabel.node.active = !!e.level;
this.costLabel.string = e.costCoin;
this.upgradeBt.active = !!e.costCoin;
this.upgradeMaxBt.active = !!e.costCoin && !!this.data._role.idx;
},
onSkillItem_: function() {
this.skillInfoPanel.active = !0;
var e = this.skillInfoPanel.getComponent("skillInfoPanel");
e.update_(this.data.skillInfoPanelData);
var a = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
(a = this.skillInfoPanel.parent.convertToNodeSpaceAR(a)).x += (a.x < 0 ? 1 : -1) * e.bgSp.width * this.node.parent.scale;
this.skillInfoPanel.x = a.x;
this.skillInfoPanel.y = a.y;
var t = a.y + .5 * e.bgSp.height + .5 * cc.winSize.height - (cc.winSize.height - 60), n = a.y + .5 * cc.winSize.height - .5 * e.bgSp.height;
t > 0 && (this.skillInfoPanel.y -= t);
n < 0 && (this.skillInfoPanel.y += Math.abs(n));
},
onUpgrade_: function(e) {
var a = e.target, c = s.player;
if (0 == c.skillPoint) {
var g = o.PLAYER.FUNS.getBuySkillPointCost(c.vip.buySkillPointTimes + 1), p = o.PLAYER.CONSTS.BUY_SKILL_POINT, _ = c.vip.buySkillPointTimes, k = i.t("是否花费$1钻石购买$2点技能点(今日已购买$3次)", [ g, p, _ ]);
l.addMessageBox(k, function() {
l.addLoading();
m.buySkillPoint();
});
} else {
l.addLoading();
var f = a == this.upgradeMaxBt, y = this;
this.data._role.skills[this.data.skillId] ? u.upgradeRoleSkill(this.data._role.idx, this.data.skillId, f, function(e) {
var a = n.fightSkill.findById(y.data.skillId), i = t.clone(a.label), s = y.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
s.y += 30;
for (var o in i) {
i[o] = i[o].replace("$", Math.abs(Number(a.growth[o] * e._temp.addPoint)));
i[o] = i[o].replace("%", r.floatStrip(Math.abs(a.growth[o] * e._temp.addPoint * 100)) + "%");
y.scheduleOnce(function() {
l.showText(this.str, this.pos);
}.bind({
str: i[o],
pos: s
}), .5 * o);
}
r.spineEffect(y.effectArmature);
h.playEffect(d.sound_effect_skill_upgraded_mp3);
}) : u.upgradeRoleAwakeSkill(this.data._role.idx, this.data.skillId, f, function(e) {
var a = n.fightSkill.findById(y.data.skillId), i = t.clone(a.label), s = y.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
s.y += 30;
for (var o in i) {
i[o] = i[o].replace("$", Math.abs(Number(a.growth[o] * e._temp.addPoint)));
i[o] = i[o].replace("%", r.floatStrip(a.growth[o] * e._temp.addPoint * 100) + "%");
y.scheduleOnce(function() {
l.showText(this.str, this.pos);
}.bind({
str: i[o],
pos: s
}), .5 * o);
}
r.spineEffect(y.effectArmature);
h.playEffect(d.sound_effect_skill_upgraded_mp3);
});
}
}
}).genData = function(e, a, t) {
var i = n.fightSkill.findById(e);
a = a || 0;
var r = 0;
if (t && a) if (t.skills[e]) {
r = o.SKILL.FUNS.getUpgradeCost(a);
a == o.ROLE.CONSTS.MAX_SKILL_LEVEL && (r = 0);
} else if (t.awakeSkills[e]) {
r = o.SKILL.FUNS.getAwakeUpgradeCost(a);
a == t.awakeSkills[e].maxLevel && (r = 0);
}
var s = c.genData(e, a, t);
return {
skillId: e,
name: i.name,
resId: i.resId,
level: a,
costCoin: r,
skillInfoPanelData: s,
_data: i,
_role: t || {
level: 1
}
};
};
cc._RF.pop();
}, {
baseView: "baseView",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
playerHandler: "playerHandler",
resource: "resource",
serverConfig: "serverConfig",
serverMain: "serverMain",
skillInfoPanel: "skillInfoPanel",
soundApi: "soundApi",
soundComponent: "soundComponent",
teamHandler: "teamHandler",
underscore: "underscore"
} ],
