"battle.character": [ function(e, a) {
"use strict";
cc._RF.push(a, "ca4eb73wC1NZpnF98hLsyCl", "battle.character");
var t = e("underscore"), n = e("battle.util"), i = e("battle.consts"), r = e("battle.scheduler"), s = e("dataApi"), o = e("battle.entity"), l = e("battle.buff"), c = e("battleMain"), d = (e("battle.fightHandler"),
function(e) {
o.call(this, e);
this.targetId = null;
this.isSummon = !1;
this.buffs = {};
this.fightSkills = {};
this.fightSkillList = [];
this.died = !1;
this.level = e.level || 1;
this.hpPct = 100;
this.mpPct = 0;
this.maxMp = i.MAX_MP;
this.atkParam = 1;
this.defParam = 1;
this.mdefParam = 1;
this.attrRate = 1;
this.dmg2HpRate = 0;
this.skillDmg2HpRate = 0;
this.atkDmgRate = 1;
this.hitDmgRate = 1;
this.hitMdmgRate = 1;
this.critDmgRate = 1.5;
this.atkSpeedRate = 1;
this.linkDmgRate = 0;
this.deLinkDmgRate = 0;
this.extraHitDmg = 0;
this.extraAtkDmg = 0;
this.extraInitAtkDmg = 0;
this.extraCritRate = 0;
this.extraDodgeRate = 0;
this.dmgBe1Rate = 0;
this.shieldHitDmgRate = 1;
this.recoverHpRate = 1;
this.reboundDmgRate = 0;
this.defShieldHp = 0;
this.mDefShieldHp = 0;
this.shieldHp = 0;
this.unDeBuffRate = 0;
this.unDizzinessRate = 0;
this.unSilenceRate = 0;
this.critRate = 0;
this.dodgeRate = 0;
this.hitRate = 0;
this.hitMaxHpRate = 0;
this.mp = 0;
this.keepMp = 0;
this.reboundDmgHp = 0;
this.unConfusedRate = 0;
this.hitReduceMpRate = 0;
this.hitRepeledRate = 0;
this.hitReduceAtkSpeedRate = 0;
this.hitReduceRecoverHpRate = 0;
this.hitRateSilence = 0;
this.missReboundTeamRate = 0;
this.missReboundRate = 0;
this.atkIgnoreDodgeRate = 0;
this.skipHitRate = 0;
this.cdSpeedRate = 0;
this.hitClearMpRate = 0;
this.addDmgRate = 0;
this.ignoreAddDmgRate = 0;
this.addCritDmgRate = 0;
this.addMpRecoverRate = 0;
this.ignoreCritRate = 0;
this.seconds5LostHp2HpRate = 0;
this.addHitRate = 0;
this.addHpRecoverRate = 0;
this.addAtkSpeedRate = 0;
this.soulHitDmgRate = 0;
this.soulMaxHpRate = 0;
this.soulAddDmgRate = 0;
this.ignoreSoulAddDmgRate = 0;
this.redHitDmgRate = 0;
this.addDmgRate2 = 0;
this.ignoreAddDmgRate2 = 0;
this.beginMaxHpRateShield = 0;
this.hitReduceRecoverHp = 0;
this.beginHitDmgRate = 0;
this.beginHitMdmgRate = 0;
this.hitReduceAtkSpeed = 0;
this.hitUnReviveRate = 0;
this.hitReduceMp = 0;
this.hitRateSilence2 = 0;
this.hitRepeledRate2 = 0;
this.hitBleedingHpRate = 0;
this.recoverHp10SecRate2 = 0;
this.skill0AddDmgRate = 0;
this.beginRecoverFullMpRate = 0;
this.removeDeBuffSec = 0;
this.hitUnRecoverHpRate = 0;
this.reboundDmgRate = 0;
this.beginAddDmgRate = 0;
this.addRecoverHpRedHitDmgRate = 0;
this.hitUnRecoverMpRate = 0;
this.reviveAddDmgRate = 0;
this.ignoreUnDeBuffRate = 0;
this.atkShieldExtDmgRate = 0;
this.privateUnConfusedRate = 0;
this.unDmg2HpRate = 0;
this.redHitPctDmgRate = 0;
this.defShieldHpBuffMap = {};
this.mDefShieldHpBuffMap = {};
this.shieldHpBuffMap = {};
this.reboundDmgHpBuffMap = {};
this.reviveMaxHpRateBuff = null;
this.reduceHpTriggerMap = {};
this.allDeadTriggerMap = {};
this.dizziness = !1;
this.confused = !1;
this.silence = !1;
this.invincible = !1;
this.unAction = !1;
this.terror = !1;
this.tail1Silence = !1;
this.targetSilence = !1;
this.recoverHpSilence = !1;
this.recoverHpBeDmg = !1;
this.immuneInitDmg = !1;
this.unRecoverHp = !1;
this.unRecoverMp = !1;
this.unRevive = !1;
this.unReduceMp = !1;
this.recoverHp2Dmg = !1;
this.publicCoolDownTime = 0;
this.passiveBuffIds = [];
this.shakeHitTimes = 0;
this.usedSkillIdMap = {};
r.setInterval(this.emitSetPosition.bind(this), 0);
});
n.inherits(d, o);
a.exports = d;
var h = d.prototype;
h.addFightSkills = function(a) {
for (var n = 0; n < a.length; n++) {
var i = e("battle.fightskill").create(a[n], this);
this.fightSkills[i.kindId] = i;
}
this.fightSkillList = t.values(this.fightSkills);
};
h.setCurSkill = function(e, a) {
a = a || !1;
this.curSkillId = e;
this.isManual = a;
};
h.activatePassive = function() {
var e, a = this.area.getEntity(this.targetId);
for (var t in this.fightSkills) {
var n = this.fightSkills[t];
if (n.data.type == i.FIGHT_SKILL.TYPE.PASSIVE) {
var r = this.hpPct;
e = n.use(this, a).buffInfos;
for (var s in e) for (var o in e[s]) this.passiveBuffIds.push(e[s][o].buffId);
this.hp = this.maxHp * r / 100;
this.setHpPct();
this.emit("activatePassive", {
buffInfos: e,
skillId: n.kindId
});
}
}
};
h.setTarget = function(e) {
this.targetId = e;
};
h.reduceHp = function(e, a, o, d, h) {
if (!this.died && e) {
var u = d ? d.kindId : null;
this.shakeHitTimes++;
var m = i.FIGHT_SKILL.SHAKE_HIT_TIMES_MAP[this.curSkillId];
m && this.shakeHitTimes == m && this.interruptSkill();
this.hp -= e;
if (this.curLevelHp) {
this.curLevelHp -= e;
for (;this.curLevelHp < 0; ) {
var g = this.curLevelHp;
if (c.battleType == i.BATTLE_TYPE.TAIL) this.upgradeLevel(); else if (t.include([ i.BATTLE_TYPE.BOSS, i.BATTLE_TYPE.GUILD_BOSS ], c.battleType) && this.curHpCount < 100) {
this.curLevelHp = this.maxHp / 100;
this.curHpCount++;
}
this.curLevelHp += g;
}
this.emit("bossHpPct", {
character: this
});
}
this.setHpPct();
for (var p in this.reduceHpTriggerMap) this.reduceHpTriggerMap[p](-e, this.hpPct);
var _ = this.getBuffOne("unHitTrigger");
if (_) {
var k = _.data.extra.needMp || 0, f = this.maxHp * (_.data.extra.needHpRate || 0), y = _.data.extra.isNeedTarget || !1, b = _.data.extra.isHit || !1, v = this.mp >= k && e >= f;
y && h.entityId != this.targetId && (v = !1);
if (v) {
_.data.extra.isNoClear || _.clear();
if (!b) {
this.hp += e;
this.setHpPct();
}
this.reduceMp(k, !0);
var S = (P = _.data.extra).isCounter || !1, T = S ? h : this, M = S ? this : h;
P.buffIds && T && l.activateBuffs(T, M || this, P.buffIds, _.skillData, _.skillLevel);
if (P.skillId && T) {
M.setTarget(T.entityId);
M.setCurSkill(P.skillId);
}
if (!b) return;
}
}
var $ = this.unRevive;
if (d && this.hp <= 0) for (var I in d.killBuffIds) "unRevive" == s.buff.findById(d.killBuffIds[I]).effect && ($ = !0);
if (this.hp <= 0) {
var C = this.getBuffOne("unDiedTrigger");
if (C) {
var P;
if ((P = C.data.extra).isNoAddHp) {
this.hp = 1;
this.setHpPct();
this.emit("hpPct", {
character: this,
value: e,
isRecover: !1,
isShow: o,
skillId: u
});
} else this.hp += e;
this.setHpPct();
P.buffIds && l.activateBuffs(this, this, P.buffIds, C.skillData, C.skillLevel);
P.skillId && this.setCurSkill(P.skillId);
P.isNoClear || C.clear();
return;
}
var D = this.reviveMaxHpRateBuff ? this.reviveMaxHpRateBuff.skillData.kindId : 0, N = D ? this.teamId + "_" + this.data.kindId + "_" + D : "";
if (this.reviveMaxHpRateBuff && !c.usedMap[N] && !$) {
this.hp = 1;
this.setHpPct();
this.emit("revive", {
character: this,
skillId: D
});
this.invincible = !0;
this.unAction = !0;
var A = this;
r.setTimeout(function() {
var e = A.getBuffBy("effectType", 2);
t.each(e, function(e) {
e.clear();
});
A.recoverHp((A.reviveMaxHpRateBuff.data.extra.reviveMaxHpRate + A.reviveMaxHpRateBuff.growthVal) * A.maxHp, !0, !0);
A.invincible = !1;
A.unAction = !1;
var a = A.fightSkills[D], i = A.reviveMaxHpRateBuff.data.extra.buffIds;
i = i ? n.clone(i) : null;
for (var r in i) a.modifyBuffMap && a.modifyBuffMap[i[r]] && (i[r] = a.modifyBuffMap[i[r]]);
i && l.activateBuffs(A, A, i, A.reviveMaxHpRateBuff.skillData, A.reviveMaxHpRateBuff.skillLevel);
A.reviveMaxHpRateBuff.clear();
A.reviveMaxHpRateBuff = null;
A.atkDmgRate += A.reviveAddDmgRate;
}, 1e3 * this.reviveMaxHpRateBuff.data.extra.waitTime);
c.usedMap[N] = !0;
this.emit("hpPct", {
character: this,
value: e,
isRecover: !1,
isShow: !0,
skillId: u
});
return;
}
var L = c.debug.keepRoleHpMap[this.data.classId];
if (L && !this.isSummon) {
this.hp = L;
this.setHpPct();
this.interruptSkill();
this.removeAllEffectBuff("dizziness");
this.dizziness = !0;
this.invincible = !0;
this.emit("hpPct", {
character: this,
value: e,
isRecover: !1,
isShow: !0
});
return;
}
this.hp = 0;
this.died = !0;
}
a && this.emit("hpPct", {
character: this,
value: e,
isRecover: !1,
isShow: o,
skillId: u
});
var E = d && !!d.isNoIncHitMp, B = Math.ceil(e / this.maxHp * i.MAX_MP);
E || this.recoverMp(B);
if (a && o || !a) {
var w = !1;
if (e > this.maxHp * i.FIGHT_SKILL.INTERRUPT_HP_RATE) if (this.buffs.singBuff) w = !1; else {
var G = this.getCurSkill();
G && G.isShaking && G.isDamageInterrupt() && !G.isUnInterrupt() && (w = this.interruptSkill());
(G && !G.isShaking || !G) && (w = !0);
}
if (w) {
l.create({
type: i.BUFF.TYPE.STATUS,
timeout: 1,
effect: "damageInterrupted",
extra: {
status: "damageInterrupted"
}
}).use(this, this);
this.emit("damageInterrupted", {
character: this
});
}
}
}
};
h.recoverHp = function(e, a, t) {
if (this.unRecoverHp) return 0;
if (this.recoverHp2Dmg) {
this.reduceHp(e, !0, !0);
return 0;
}
e *= this.recoverHpRate + this.addHpRecoverRate + this.addRecoverHpRedHitDmgRate;
if (this.hp < this.maxHp) {
var n = this.hp + e;
n > this.maxHp ? this.hp = this.maxHp : this.hp = n;
}
this.setHpPct();
for (var i in this.reduceHpTriggerMap) this.reduceHpTriggerMap[i](e, this.hpPct);
a && this.emit("hpPct", {
character: this,
value: e,
isRecover: !0,
isShow: t
});
return e;
};
h.recoverMp = function(e, a, t) {
if (0 != e && "missile" != this.type && !this.unRecoverMp) {
e *= 1 + this.addMpRecoverRate;
if (this.mp < this.maxMp) {
var n = this.mp + e;
if (n >= this.maxMp) {
this.mp = this.maxMp;
this.mpSkillId && this.setCurSkill(this.mpSkillId);
} else this.mp = n;
}
if (c.isAuto && this.mp == this.maxMp && !this.isSummon && this.mpSkillId) {
this.fightSkills[this.mpSkillId].data.autoClearControl && this.autoClearControl();
c.useSkillIdInfos.push({
teamId: this.teamId,
skillId: this.mpSkillId
});
}
this.mpPct = this.getMpPct();
this.isSummon || this.emit("setMp", {
character: this,
value: this.mp,
addValue: e,
isShow: a,
isWord: t
});
}
};
h.reduceMp = function(e, a) {
if (0 != e && "missile" != this.type) {
this.mp -= e;
this.mp <= 0 && (this.mp = 0);
this.mp <= this.keepMp && (this.mp = this.keepMp);
this.mpPct = this.getMpPct();
this.isSummon || this.emit("setMp", {
character: this,
value: this.mp,
addValue: -e,
isShow: a
});
}
};
h.reduceSpecialHp = function(e, a) {
if (t.include([ "shieldHp", "defShieldHp", "mDefShieldHp", "reboundDmgHp" ], e) && !(this[e] <= 0)) {
this[e] -= a;
this[e] = this[e] < 0 ? 0 : this[e];
var n = a, i = e + "BuffMap";
for (var r in this[i]) {
var s = this[i][r].statusData.val;
n = (s -= n) > 0 ? 0 : -s;
this[i][r].statusData.val = s > 0 ? s : 0;
s <= 0 && this[i][r].clear();
if (0 == n) break;
}
}
};
h.addBuff = function(e) {
this.buffs[e.data.effect] = this.buffs[e.data.effect] || {};
this.buffs[e.data.effect][e.buffId] = e;
};
h.removeBuff = function(e) {
if (0 != t.keys(this.buffs).length) {
this.emit("removeBuff", {
character: this,
buffId: e.buffId
});
this.buffs[e.data.effect] = this.buffs[e.data.effect] || {};
delete this.buffs[e.data.effect][e.buffId];
0 == t.values(this.buffs[e.data.effect]).length && delete this.buffs[e.data.effect];
}
};
h.clearBuff = function(e) {
for (var a in this.buffs) this.buffs[a][e] && this.buffs[a][e].clear();
};
h.removeAllEffectBuff = function(e) {
for (var a in this.buffs[e]) this.buffs[e][a].clear();
delete this.buffs[e];
};
h.clearAllBuff = function() {
for (var e in this.buffs) for (var a in this.buffs[e]) this.buffs[e][a].data.isUnClear || this.buffs[e][a].clear();
this.buffs = {};
};
h.autoClearControl = function() {
var e = t.without(i.BUFF.EFFECTS.UN_ATTACK, "sing");
for (var a in e) this.removeAllEffectBuff(e[a]);
};
h.setTargetNearest = function(e, a) {
(e = e || {})[this.entityId] = !0;
var t = this.area.getEntityDistanceEst(a || this.getTargetTeamId(), this, e, "min") || {
entityId: null
};
this.setTarget(t.entityId);
};
h.move = function(e, a, t) {
t = t || !1;
"missile" != this.type && (e = (e = e > 1060 ? 1060 : e) < 0 ? 0 : e);
var n = [ {
x: this.x,
y: this.y
}, {
x: e,
y: a
} ];
this.emit("move", {
character: this,
path: n,
isRepel: t
});
};
h.attack = function(e) {
var a = this.getCurSkill();
if (!a) return {
status: "no skill"
};
var n = a.use(this, e);
if (t.include([ "attack", "missile", "summon", "convert", "buff" ], n.status)) {
if (!t.include([ i.CHARACTER_TYPE.MISSILE ], this.type)) {
var r = i.SKILL_RECOVER_MP;
this.recoverMp(r);
}
t.include(i.FIGHT_SKILL.USE_ONE_TIMES_IDS, a.kindId) && (this.usedSkillIdMap[a.kindId] = !0);
}
this.emit("attack", {
attacker: a.isMissile ? this.attacker : this,
target: e,
skill: a,
result: n
});
return n;
};
h.useSkill = function(e, a) {
if (a) {
var t = e.use(this, a);
this.emit("attack", {
attacker: this,
target: a,
skill: e,
result: t
});
return t;
}
};
h.interruptSkill = function() {
if (this.invincible || this.unAction) return !1;
this.buffs.singBuff && this.removeAllEffectBuff("singBuff");
var e = this.getCurSkill();
if (!e || !e.isShaking) return !1;
e.data.isInterruptUnReset && (e.coolDownTime = i.PUBLIC_COOL_DOWN_TIME);
e.reSetShakeTime();
return !0;
};
h.theyDeadTrigger = function(e) {
for (var a in this.allDeadTriggerMap) {
var t = this.allDeadTriggerMap[a];
t.watchTeamId && t.watchTeamId != e || t();
}
};
h.setPosition = function(e, a) {
o.prototype.setPosition.call(this, e, a);
this.emit("setPosition", {
character: this,
position: {
x: e,
y: a
}
});
};
h.emitSetPosition = function() {
if (!this.emitPos || this.emitPos.x != this.x || this.emitPos.y != this.y) {
this.emit("setPosition", {
character: this,
position: {
x: this.x,
y: this.y
}
});
this.emitPos = {
x: this.x,
y: this.y
};
}
};
h.add = function() {
this.emit("add", {
character: this
});
this.isSummon && this.activatePassive();
};
h.remove = function() {
this.emit("remove", {
character: this
});
};
h.stop = function(e) {
e = e || !1;
this.emitSetPosition();
this.emit("stop", {
character: this,
isForce: e
});
};
h.getCurSkill = function() {
return this.fightSkills[this.curSkillId];
};
h.isUnMove = function() {
for (var e = i.BUFF.EFFECTS.UN_MOVE, a = 0; a < e.length; a++) if (this[e[a]]) return !0;
return !1;
};
h.isUnAttack = function() {
for (var e = i.BUFF.EFFECTS.UN_ATTACK, a = 0; a < e.length; a++) if (this[e[a]]) return !0;
return !1;
};
h.isUnInitAttack = function() {
for (var e = i.BUFF.EFFECTS.UN_INIT_ATTACK, a = 0; a < e.length; a++) if (this[e[a]]) return !0;
return !1;
};
h.getTargetTeamId = function(e) {
e = e || !1;
var a = 1 == this.teamId ? 2 : 1;
this.confused && !e && (1 == a ? a = 2 : 2 == a && (a = 1));
return a;
};
h.setHpPct = function() {
var e = this.hp / this.maxHp * 100;
e = e < 0 ? 0 : e;
this.hpPct = e;
};
h.getMpPct = function() {
var e = Math.floor(this.mp / this.maxMp * 100);
return e < 0 ? 0 : e;
};
h.getAttackValue = function() {
return this.atk * this.atkParam;
};
h.getDefenceValue = function() {
return this.def * this.defParam;
};
h.getMagicDefenceValue = function() {
return this.mdef * this.mdefParam;
};
h.getBuffs = function(e) {
this.buffs[e] = this.buffs[e] || {};
return t.values(this.buffs[e]);
};
h.getBuffOne = function(e) {
return this.getBuffs(e)[0];
};
h.getBuffBy = function(e, a) {
var t = [];
for (var n in this.buffs) for (var i in this.buffs[n]) this.buffs[n][i].data[e] == a && t.push(this.buffs[n][i]);
return t;
};
h.getStaticBuffVal = function(e, a) {
var n = this.getBuffs(e);
if (0 == n.length) return null;
var i = [];
t.each(n, function(e) {
var a = e.data.extra.val + e.growthVal;
i.push(a);
});
return a ? t.max(i) : t.min(i);
};
h.isSingleBoss = function() {
return this.type == i.CHARACTER_TYPE.MOB && t.include(i.BOSS_MOB_CLASS_IDS, this.data.kindId);
};
cc._RF.pop();
}, {
"battle.buff": "battle.buff",
"battle.consts": "battle.consts",
"battle.entity": "battle.entity",
"battle.fightHandler": "battle.fightHandler",
"battle.fightskill": "battle.fightskill",
"battle.scheduler": "battle.scheduler",
"battle.util": "battle.util",
battleMain: "battleMain",
dataApi: "dataApi",
underscore: "underscore"
} ],
