"battle.mob": [ function(e, a) {
"use strict";
cc._RF.push(a, "aa384El1XFPgYL2EWguCKfh", "battle.mob");
var t = e("battle.util"), n = e("dataApi"), i = e("battle.consts"), r = e("battle.character"), s = function(e) {
r.call(this, e);
this.data = n.mobS.findById(e.kindId);
this.data || (this.data = n.mob.findById(e.kindId));
this.walkSpeed = i.WALK_SPEED;
this.type = this.brainName = i.CHARACTER_TYPE.MOB;
this.hp = null == e.hp ? this.data.hp : e.hp;
this.maxHp = e.maxHp || this.data.hp;
this.atk = e.atk || this.data.atk;
this.def = e.def || this.data.def;
this.mdef = e.mdef || this.data.mdef;
this.hit = e.hit || this.data.hit;
this.dodge = e.dodge || this.data.dodge;
this.crit = e.crit || this.data.crit;
this.skillLevel = e.skillLevel || null;
this.evolveSkillIds = e.evolveSkillIds || null;
this.initSkillId = this.data.initSkillId;
this.curSkillId = 0;
this.level = e.level || this.data.level;
for (var a = [], t = 0; t < this.data.skillIds.length; t++) {
var s = this.skillLevel || this.data.skillLevels[t];
s = s > 100 ? 100 : s;
a.push({
kindId: this.data.skillIds[t],
level: s
});
}
a = [ {
kindId: this.initSkillId,
level: 0
} ].concat(a);
this.addFightSkills(a);
var o = n.fightSkill.findById(this.data.skillIds[0]);
o && (this.mpSkillId = o.kindId);
};
t.inherits(s, r);
a.exports = s;
cc._RF.pop();
}, {
"battle.character": "battle.character",
"battle.consts": "battle.consts",
"battle.util": "battle.util",
dataApi: "dataApi"
} ],
