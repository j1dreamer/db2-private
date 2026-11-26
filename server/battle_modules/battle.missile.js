"battle.missile": [ function(e, a) {
"use strict";
cc._RF.push(a, "128bePRG2tA67LLBnjembmD", "battle.missile");
var t = e("battle.util"), n = (e("dataApi"), e("battle.consts")), i = e("battle.character"), r = function(e) {
i.call(this, e);
this.attacker = e.attacker;
this.targetId = e.targetId;
this.curSkill = e.curSkill;
this.initSkillId = e.curSkill.kindId;
this.skillPosition = e.skillPosition;
this.brainName = e.brainName;
this.targetTeamId = this.attacker.getTargetTeamId();
this.attackerPostion = this.attacker.getPosition();
this.curSkill.shakeDownTime = 0;
this.curSkill.coolDownTime = 0;
this.curSkillId = this.curSkill.kindId;
this.curSkill.data = t.clone(this.curSkill.data);
this.curSkill.data.targetCount = 1;
this.curSkill.data.targetType = n.FIGHT_SKILL.TARGET_TYPEE.NORMAL;
this.curSkill.isMissile = !0;
this.data = this.curSkill.data;
this.data.color = this.attacker.data.color;
this.type = n.CHARACTER_TYPE.MISSILE;
this.publicCoolDownTime = 0;
this.missileType = this.data.missileType;
var a = n.MISSILE.TYPE;
switch (this.missileType) {
case a.NORMAL:
case a.TARGET:
case a.LINK:
this.walkSpeed = n.MISSILE.DISTANCE / this.data.flyTime;
break;

case a.AOE:
case a.GO_AND_BACK:
this.walkSpeed = this.data.range / this.data.flyTime;
}
};
t.inherits(r, i);
a.exports = r;
var s = r.prototype;
s.attack = function(e) {
i.prototype.attack.call(this, e);
this.curSkill.shakeDownTime = 0;
this.publicCoolDownTime = 0;
};
s.getCurSkill = function() {
return this.curSkill;
};
s.getTargetTeamId = function() {
return this.targetTeamId;
};
cc._RF.pop();
}, {
"battle.character": "battle.character",
"battle.consts": "battle.consts",
"battle.util": "battle.util",
dataApi: "dataApi"
} ],
