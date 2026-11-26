"battle.role": [ function(e, a) {
"use strict";
cc._RF.push(a, "40a976aMd9BopH8VWf18BiB", "battle.role");
var t = e("underscore"), n = e("battle.util"), i = e("dataApi"), r = e("battle.consts"), s = e("battle.fightskill"), o = e("battleMain"), l = e("battle.character"), c = function(e) {
l.call(this, e);
this.data = i.role.findById(this.kindId);
if (this.data && "role" == this.data.type) this.type = this.brainName = r.CHARACTER_TYPE.ROLE; else {
this.type = this.brainName = r.CHARACTER_TYPE.MOB;
this.data = i.mobS.findById(e.kindId);
this.data || (this.data = i.mob.findById(e.kindId));
}
this.walkSpeed = r.WALK_SPEED;
if (t.include([ r.BATTLE_TYPE.ARENA_PK, r.BATTLE_TYPE.PRACTICE ], o.battleType)) {
e.hp = 1.45 * e.hp;
e.maxHp && (e.maxHp = 1.45 * e.maxHp);
}
this.hp = e.hp;
this.maxHp = e.maxHp ? e.maxHp : e.hp;
this.setHpPct();
this.initMaxHp = this.maxHp;
this.mp = e.mp || 0;
this.atk = e.atk;
this.def = e.def;
this.mdef = e.mdef;
this.hit = e.hit;
this.dodge = e.dodge;
this.crit = e.crit;
this.unDizzinessRate = e.unDizzinessRate || 0;
this.critRate = e.critRate || 0;
this.dmg2HpRate = e.dmg2HpRate || 0;
this.dodgeRate = e.dodgeRate || 0;
this.atkSpeedRate += e.atkSpeedRate || 0;
this.keepMp = e.keepMp || 0;
this.reboundDmgHp = e.reboundDmgHp || 0;
this.skillDmg2HpRate = e.skillDmg2HpRate || 0;
this.unConfusedRate = e.unConfusedRate || 0;
this.hitReduceMpRate = e.hitReduceMpRate || 0;
this.hitRepeledRate = e.hitRepeledRate || 0;
this.hitReduceAtkSpeedRate = e.hitReduceAtkSpeedRate || 0;
this.hitReduceRecoverHpRate = e.hitReduceRecoverHpRate || 0;
this.hitRateSilence = e.hitRateSilence || 0;
this.missReboundTeamRate = e.missReboundTeamRate || 0;
this.missReboundRate = e.missReboundRate || 0;
this.recoverMp1Sec = e.recoverMp1Sec || 0;
this.recoverHp10SecRate = e.recoverHp10SecRate || 0;
this.atkIgnoreDodgeRate = e.atkIgnoreDodgeRate || 0;
this.unDeBuffRate = e.unDeBuffRate || 0;
this.hitRate = e.hitRate || 0;
this.hitMaxHpRate = e.hitMaxHpRate || 0;
this.skipHitRate = e.skipHitRate || 0;
this.cdSpeedRate = e.cdSpeedRate || 0;
this.hitClearMpRate = e.hitClearMpRate || 0;
this.addDmgRate = e.addDmgRate || 0;
this.ignoreAddDmgRate = e.ignoreAddDmgRate || 0;
this.addCritDmgRate = e.addCritDmgRate || 0;
this.addMpRecoverRate = e.addMpRecoverRate || 0;
this.ignoreCritRate = e.ignoreCritRate || 0;
this.seconds5LostHp2HpRate = e.seconds5LostHp2HpRate || 0;
this.addHitRate = e.addHitRate || 0;
this.addHpRecoverRate = e.addHpRecoverRate || 0;
this.atkSpeedRate += e.addAtkSpeedRate || 0;
this.soulHitDmgRate = e.soulHitDmgRate || 0;
this.soulMaxHpRate = e.soulMaxHpRate || 0;
this.soulAddDmgRate = e.soulAddDmgRate || 0;
this.ignoreSoulAddDmgRate = e.ignoreSoulAddDmgRate || 0;
this.redHitDmgRate = e.redHitDmgRate || 0;
this.addDmgRate2 = e.addDmgRate2 || 0;
this.ignoreAddDmgRate2 = e.ignoreAddDmgRate2 || 0;
this.beginMaxHpRateShield = e.beginMaxHpRateShield || 0;
this.hitReduceRecoverHp = e.hitReduceRecoverHp || 0;
this.beginHitDmgRate = e.beginHitDmgRate || 0;
this.beginHitMdmgRate = e.beginHitMdmgRate || 0;
this.hitReduceAtkSpeed = e.hitReduceAtkSpeed || 0;
this.hitUnReviveRate = e.hitUnReviveRate || 0;
this.hitReduceMp = e.hitReduceMp || 0;
this.hitRateSilence2 = e.hitRateSilence2 || 0;
this.hitRepeledRate2 = e.hitRepeledRate2 || 0;
this.hitBleedingHpRate = e.hitBleedingHpRate || 0;
this.recoverHp10SecRate2 = e.recoverHp10SecRate2 || 0;
this.skill0AddDmgRate = e.skill0AddDmgRate || 0;
this.removeDeBuffSec = e.removeDeBuffSec || 0;
this.beginRecoverFullMpRate = e.beginRecoverFullMpRate || 0;
this.hitUnRecoverHpRate = e.hitUnRecoverHpRate || 0;
this.reboundDmgRate = e.reboundDmgRate || 0;
this.beginAddDmgRate = e.beginAddDmgRate || 0;
this.addRecoverHpRedHitDmgRate = e.addRecoverHpRedHitDmgRate || 0;
this.hitUnRecoverMpRate = e.hitUnRecoverMpRate || 0;
this.reviveAddDmgRate = e.reviveAddDmgRate || 0;
this.ignoreUnDeBuffRate = e.ignoreUnDeBuffRate || 0;
this.atkShieldExtDmgRate = e.atkShieldExtDmgRate || 0;
this.privateUnConfusedRate = e.privateUnConfusedRate || 0;
this.unDmg2HpRate = e.unDmg2HpRate || 0;
this.redHitPctDmgRate = e.redHitPctDmgRate || 0;
this.mp += this.keepMp;
this.level = e.level;
this.star = e.star;
this.awakeLevel = e.awakeLevel;
this.trainLevelMap = e.trainLevelMap;
this.evolveSkillIds = e.evolveSkillIds;
this.initSkillId = this.data.initSkillId;
this.curSkillId = 0;
var a = [ {
kindId: this.initSkillId,
level: 0
} ].concat(e.skills.concat(e.awakeSkills || []));
this.addFightSkills(a);
if (this.type == r.CHARACTER_TYPE.ROLE) {
var n = i.fightSkill.findById(this.data.skillIds[0]);
this.mpSkillId = n.kindId;
}
if (this.type == r.CHARACTER_TYPE.MOB) if (o.battleType == r.BATTLE_TYPE.TAIL && this.isSingleBoss()) this.reSetCurLevelAttrs(); else if (t.include([ r.BATTLE_TYPE.BOSS, r.BATTLE_TYPE.GUILD_BOSS ], o.battleType) && this.isSingleBoss()) {
this._maxHp = this.hp;
this.curLevelMaxHp = this.maxHp / 100;
this.curLevelHp = this.hp % this.curLevelMaxHp;
this.curLevelHp = this.curLevelHp || this.curLevelMaxHp;
this.curHpCount = 1;
this.emit("reSetCurLevelAttrs", {
character: this
});
}
if (this.unConfusedRate > 0) {
(d = (c = s.create({
kindId: 100005,
level: 0
}, this)).buffs[0]).data.extra.unConfusedRate = this.unConfusedRate;
d.data.effect = d.data.effect + "_" + d.buffId;
this.fightSkills[c.kindId] = c;
this.unConfusedRate = 0;
}
if (this.missReboundTeamRate > 0) {
(d = (c = s.create({
kindId: 100006,
level: 0
}, this)).buffs[0]).data.extra.missReboundRate = this.missReboundTeamRate;
d.data.effect = d.data.effect + "_" + d.buffId;
this.fightSkills[c.kindId] = c;
this.missReboundTeamRate = 0;
}
if (this.recoverMp1Sec > 0) {
(d = (c = s.create({
kindId: 100007,
level: 0
}, this)).buffs[0]).data.extra.mp = this.recoverMp1Sec;
d.data.effect = d.data.effect + "_" + d.buffId;
this.fightSkills[c.kindId] = c;
this.recoverMp1Sec = 0;
}
if (this.recoverHp10SecRate > 0) {
(d = (c = s.create({
kindId: 100008,
level: 0
}, this)).buffs[0]).data.extra.maxHpRate = -this.recoverHp10SecRate;
d.data.effect = d.data.effect + "_" + d.buffId;
this.fightSkills[c.kindId] = c;
this.recoverHp10SecRate = 0;
}
if (this.seconds5LostHp2HpRate > 0) {
(d = (c = s.create({
kindId: 100009,
level: 0
}, this)).buffs[0]).data.extra.lostHp2HpRate = -this.seconds5LostHp2HpRate;
d.data.effect = d.data.effect + "_" + d.buffId;
this.fightSkills[c.kindId] = c;
this.seconds5LostHp2HpRate = 0;
}
if (this.hitMaxHpRate > 0) {
(d = (c = s.create({
kindId: 100010,
level: 0
}, this)).buffs[0]).data.extra.val = this.hitMaxHpRate;
d.data.effect = d.data.effect;
this.fightSkills[c.kindId] = c;
this.hitMaxHpRate = 0;
}
if (this.beginMaxHpRateShield > 0) {
(d = (c = s.create({
kindId: 100011,
level: 0
}, this)).buffs[0]).data.extra.maxHpRateShield = this.beginMaxHpRateShield;
d.data.effect = d.data.effect;
this.fightSkills[c.kindId] = c;
this.beginMaxHpRateShield = 0;
}
if (this.beginHitDmgRate > 0) {
(d = (c = s.create({
kindId: 100012,
level: 0
}, this)).buffs[0]).data.extra.hitDmgRate = this.beginHitDmgRate;
d.data.effect = d.data.effect;
this.fightSkills[c.kindId] = c;
this.beginHitDmgRate = 0;
}
if (this.beginHitMdmgRate > 0) {
(d = (c = s.create({
kindId: 100013,
level: 0
}, this)).buffs[0]).data.extra.hitMdmgRate = this.beginHitMdmgRate;
d.data.effect = d.data.effect;
this.fightSkills[c.kindId] = c;
this.beginHitMdmgRate = 0;
}
if (this.recoverHp10SecRate2 > 0) {
(d = (c = s.create({
kindId: 100014,
level: 0
}, this)).buffs[0]).data.extra.maxHpRate = -this.recoverHp10SecRate2;
d.data.effect = d.data.effect + "_" + d.buffId;
this.fightSkills[c.kindId] = c;
this.recoverHp10SecRate2 = 0;
}
if (this.beginRecoverFullMpRate > 0) {
(d = (c = s.create({
kindId: 100015,
level: 0
}, this)).buffs[0]).data.hitRate = this.beginRecoverFullMpRate;
this.fightSkills[c.kindId] = c;
this.beginRecoverFullMpRate = 0;
}
if (this.removeDeBuffSec > 0) {
(d = (c = s.create({
kindId: 100016,
level: 0
}, this)).buffs[0]).data.timeout = 100 * this.removeDeBuffSec;
this.fightSkills[c.kindId] = c;
this.removeDeBuffSec = 0;
}
if (this.beginAddDmgRate > 0) {
var c, d;
(d = (c = s.create({
kindId: 100017,
level: 0
}, this)).buffs[0]).data.extra.atkDmgRate = this.beginAddDmgRate;
this.fightSkills[c.kindId] = c;
this.beginAddDmgRate = 0;
}
};
n.inherits(c, l);
a.exports = c;
var d = c.prototype;
d.upgradeLevel = function() {
this.level++;
for (var e in this.fightSkills) this.fightSkills[e].level = this.level;
this.reSetCurLevelAttrs();
};
d.reSetCurLevelAttrs = function() {
var e = o.BOSS_CONFIG;
this.curLevelMaxHp = this.level * e.HP_GROWTH;
this.curLevelHp = this.curLevelMaxHp;
this.atk = e.ATK_GROWTH * this.level * (this.level / 100);
this.def = e.DEF_GROWTH * this.level;
this.mdef = e.MDEF_GROWTH * this.level;
if (this.level > 150) {
this.atk *= this.level / 100;
this.def *= this.level / 100;
this.mdef *= this.level / 100;
if (this.level > 280) {
this.atk *= this.level / 10;
this.def *= this.level / 10;
this.mdef *= this.level / 10;
}
}
this.emit("reSetCurLevelAttrs", {
character: this
});
};
cc._RF.pop();
}, {
"battle.character": "battle.character",
"battle.consts": "battle.consts",
"battle.fightskill": "battle.fightskill",
"battle.util": "battle.util",
battleMain: "battleMain",
dataApi: "dataApi",
underscore: "underscore"
} ],
