"battle.tryAttack": [ function(e, a) {
"use strict";
cc._RF.push(a, "9ebe5SnX4pOFqaFebzz3Fll", "battle.tryAttack");
var t = e("underscore"), n = e("battle.util"), i = e("battle.consts"), r = e("battle.libBT"), s = e("battleMain"), o = function(e) {
r.Node.call(this, e.blackboard);
};
n.inherits(o, r.Node);
a.exports = o;
o.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.curTargetId, n = this.blackboard.area.getEntity(a);
if (!n || e.isUnAttack() || !e.targetId) return r.RES_FAIL;
e.tail1Silence && !t.include(e.getBuffOne("tail1Silence").data.extra.allowSkillIds, e.curSkillId) && e.setCurSkill(e.initSkillId);
e.silence && e.setCurSkill(e.initSkillId);
e.stop();
var o = e.attack(n), l = [ "attack", "missile", "summon", "convert", "buff", "singBuff" ];
if (!t.include(l, o.status) && a != e.targetId) {
e.interruptSkill();
return r.RES_FAIL;
}
if ("shake" == o.status) {
this.blackboard.selectSkillIdx = 0;
return r.RES_WAIT;
}
if ("shaking" == o.status) return r.RES_WAIT;
if ("not public cd" == o.status) return r.RES_WAIT;
if ("singBuff" == o.status) return r.RES_WAIT;
if ("not cd" == o.status || "no enough mp" == o.status || "is manual skill" == o.status || "no skill" == o.status || "can't use init skill" == o.status) {
for (var c = e.fightSkillList[this.blackboard.selectSkillIdx]; (!c || c.data.type == i.FIGHT_SKILL.TYPE.PASSIVE || c.kindId == e.initSkillId) && this.blackboard.selectSkillIdx < 20; ) {
this.blackboard.selectSkillIdx++;
c = e.fightSkillList[this.blackboard.selectSkillIdx];
}
if (c) {
e.setCurSkill(c.kindId);
this.blackboard.selectSkillIdx++;
} else {
e.setCurSkill(e.initSkillId);
this.blackboard.selectSkillIdx = 0;
}
-1 != s.debug.skillNum && "role" == e.type && e.setCurSkill(e.fightSkillList[s.debug.skillNum].kindId);
return r.RES_WAIT;
}
if (t.include(l, o.status)) {
e.setCurSkill(0);
return r.RES_SUCCESS;
}
if ("not in range" == o.status) {
this.blackboard.toTargetMoved = !1;
this.blackboard.distanceLimit = o.distance;
return r.RES_FAIL;
}
if ("not in empty Pos" == o.status) {
this.blackboard.toEmptyPosMoved = !1;
this.blackboard.tempPosY = e.y;
this.blackboard.emptyPos = o.emptyPos;
return r.RES_FAIL;
}
return r.RES_SUCCESS;
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.libBT": "battle.libBT",
"battle.util": "battle.util",
battleMain: "battleMain",
underscore: "underscore"
} ],
