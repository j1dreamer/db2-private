"battle.fightskill": [ function(e, a) {
"use strict";
cc._RF.push(a, "18853Zwy0BLVJb+xOPBJs1S", "battle.fightskill");
var t = e("underscore"), n = e("battle.util"), i = e("dataApi"), r = e("battle.consts"), s = e("battle.formula"), o = e("battle.entity"), l = (e("battle.buff"),
e("battleMain")), c = function(e) {
this.kindId = e.kindId;
this.level = e.level;
this.data = e.data;
this.name = this.data.name;
this.position = null;
this.coolDownTime = 0;
this.shakeTime = this.data.shakeTime;
this.shakeDownTime = this.shakeTime;
this.isShaking = !1;
this.killResetTimes = 0;
this.isRateReset = !1;
this.modifyBuffMap = {};
this.reSetCoolTime();
};
a.exports = c;
(_ = c.prototype).reSetCoolTime = function() {
this.coolDownTime = this.data.initCoolTime;
};
_.reSetShakeTime = function() {
var e = this.data.shakeTime;
this.shakeTime = e;
this.shakeDownTime = e;
this.isShaking = !1;
};
_.isDamageInterrupt = function() {
return this.data.isDamageInterrupt;
};
_.isUnInterrupt = function() {
return this.data.isUnInterrupt;
};
_.judge = function(e, a) {
if (this.data.type == r.FIGHT_SKILL.TYPE.PASSIVE && 0 == this.coolDownTime) return {
status: "success"
};
if (this.isMissile) return {
status: "success"
};
if (this.isShaking || this.isCallback) return {
status: "success"
};
if (e.buffs.singBuff) return {
status: "singBuff"
};
var n = e.area.getNearestEmpty(e);
if (n && n.y != e.y) return {
status: "not in empty Pos",
emptyPos: n
};
var i = 0 == e.publicCoolDownTime || e.buffs.singBuff ? this.data.distance : e.fightSkills[e.initSkillId].data.distance;
if (a && !s.inRangeX(e, a, i)) return {
status: "not in range",
distance: i
};
if (0 != e.publicCoolDownTime) return {
status: "not public cd"
};
if (this.coolDownTime > 0) {
this.isRateReset = !1;
return {
status: "not cd"
};
}
if (e.mp < this.data.mp) return {
status: "no enough mp"
};
if (t.include(l.manualShipSkillIds.concat(l.manualSkillIds), this.kindId) && (1 == e.teamId || l.isPVP()) && !e.isManual) {
l.isAuto && l.useSkillIdInfos.push({
teamId: e.teamId,
skillId: this.kindId
});
return {
status: "is manual skill"
};
}
return e.initSkillId == this.kindId && e.isUnInitAttack() ? {
status: "can't use init skill"
} : e.targetSilence && t.include(e.getBuffOne("targetSilence").data.extra.unAllowSkillIds, e.curSkillId) ? {
status: "not cd"
} : e.usedSkillIdMap[e.curSkillId] ? {
status: "not cd"
} : t.include(r.FIGHT_SKILL.REVIVE_IDS, this.kindId) && 0 == e.area.getEiedEntityBy({
teamId: e.teamId,
isSummon: !1
}).length ? {
status: "not cd"
} : {
status: "success"
};
};
_.getTargets = function(e, a) {
var n = this.data.targetType, i = this.data.targetCount, s = this.data.isSameTeam, o = this.data.range, l = this.data.isTargetOffset, c = e.area, d = (a = s && !this.isMissile ? e : a,
s ? e.teamId : e.getTargetTeamId()), h = [], u = r.FIGHT_SKILL.TARGET_TYPEE;
switch (n) {
case u.NORMAL:
1 == i && (h = [ a ]);
break;

case u.MIN_HP:
case u.MAX_HP:
case u.MIN_MP:
case u.MAX_MP:
var m = "max", g = "hpPct";
t.include([ u.MIN_HP, u.MIN_MP ], n) && (m = "min");
t.include([ u.MIN_MP, u.MAX_MP ], n) && (g = "mpPct");
h = [];
var p = {};
this.data.isNoSelf && (p[e.entityId] = !0);
for (var _ = 0; _ < i; _++) if ((k = c.getEntityEst(d, m, g, p, s)) && !t.include(h, k) && !k.isShip) {
h.push(k);
p[k.entityId] = !0;
}
break;

case u.RANDOM:
h = [];
for (_ = 0; _ < i; _++) {
var k = c.getEntityRandom(d);
t.include(h, k) || k.isShip ? c.getEntityBy({
teamId: d,
isShip: null
}).length - h.length > 0 && _-- : h.push(k);
}
break;

case u.FRONT:
case u.BACK:
m = n == u.BACK ? "max" : "min", p = {};
this.data.isNoSelf && (p[e.entityId] = !0);
for (_ = 0; _ < i; _++) if ((k = c.getEntityDistanceEst(d, e, p, m)) && !t.include(h, k) && !k.isShip) {
h.push(k);
p[k.entityId] = !0;
}
}
if (1 == h.length && !(a = h[0])) return [];
var f = this.data.offsetDistance * (e.x - a.x > 0 ? -1 : 1) * (l ? -1 : 1), y = l ? {
x: a.x + f,
y: a.y
} : {
x: e.x + f,
y: e.y
};
y = this.position || y;
this.position = y;
if (n == u.NORMAL && 1 != i) {
var b = {
isLine: this.data.isLine,
direction: a.x - e.x > 0 ? "right" : "left",
pos: y,
teamId: d,
range: o,
targetCount: i
};
h = c.getEntitiesByPos(b);
}
return t.filter(h, function(e) {
return !e.isShip;
});
};
var d = function(e) {
c.call(this, e);
};
n.inherits(d, c);
(_ = d.prototype).use = function(e, a) {
var t = this.judge(e, a);
if ("success" != t.status) return t;
var n = c.shake(e, this);
if ("shake" == n.status) {
var i = this.data.mp;
e.reduceMp(i);
this.position = null;
this.targets = this.getTargets(e, a);
n.targetIds = [];
for (var r in this.targets) n.targetIds.push(this.targets[r].entityId);
}
"success" == n.status && (n = c.attack(e, this.targets || this.getTargets(e, a), this));
return n;
};
var h = function(e) {
c.call(this, e);
};
n.inherits(h, c);
(_ = h.prototype).use = function(e, a) {
var t = this.judge(e, a);
if ("success" != t.status) return t;
var n = c.shake(e, this);
if ("shake" == n.status) {
var i = this.data.mp;
e.reduceMp(i);
this.position = null;
this.targets = this.getTargets(e, a);
n.targetIds = [];
for (var r in this.targets) n.targetIds.push(this.targets[r].entityId);
}
"success" == n.status && (n = c.remoteAttack(e, this.targets || this.getTargets(e, a), this));
return n;
};
var u = function(e) {
c.call(this, e);
this.buffs = e.buffs;
};
n.inherits(u, c);
(_ = u.prototype).use = function(e, a) {
var t = this.judge(e, a);
if ("success" != t.status) return t;
var n = c.shake(e, this);
if ("shake" == n.status) {
var i = this.data.mp;
e.reduceMp(i);
this.position = null;
this.targets = this.getTargets(e, a);
n.targetIds = [];
for (var r in this.targets) n.targetIds.push(this.targets[r].entityId);
}
"success" == n.status && (n = c.addBuff(e, a ? this.targets || this.getTargets(e, a) : [], this));
return n;
};
var m = function(e) {
c.call(this, e);
this.buffs = e.buffs;
};
n.inherits(m, c);
(_ = m.prototype).use = function(e, a) {
var t, n = d.prototype.use.call(this, e, a);
if ("attack" == n.status) {
var i = [];
for (var r in n.infos) "miss" == n.infos[r].result && i.push(n.infos[r].targetId);
t = c.addBuff(e, this.targets || this.getTargets(e, a), this, i);
n.buffInfos = t.buffInfos;
}
return n;
};
var g = function(e) {
c.call(this, e);
this.buffs = e.buffs;
};
n.inherits(g, c);
(_ = g.prototype).use = function(e, a) {
var t, n = h.prototype.use.call(this, e, a);
if ("missile" == n.status) {
var i = this.getTargets(e, a);
t = c.addBuff(e, i, this);
n.buffInfos = t.buffInfos;
n.status = "buff";
}
return n;
};
var p = function(e) {
u.call(this, e);
};
n.inherits(p, u);
var _, k = function(e) {
c.call(this, e);
this.buffs = e.buffs;
};
n.inherits(k, c);
(_ = k.prototype).use = function(e, a) {
var t = this.judge(e, a);
if ("success" != t.status) return t;
var n = c.shake(e, this);
if ("shake" == n.status) {
var i = this.data.mp;
e.reduceMp(i);
this.position = null;
this.targets = this.getTargets(e, a);
n.targetIds = [];
for (var r in this.targets) n.targetIds.push(this.targets[r].entityId);
}
"success" == n.status && (n = c.summon(e, this.targets || this.getTargets(e, a), this));
return n;
};
c.create = function(a, s) {
var o = e("battle.buff");
s = s || a.attacker;
var l = n.clone(a.data || i.fightSkill.findById(a.kindId));
if (!a.data && l.no && t.include(s.evolveSkillIds, a.parentSkillId || a.kindId)) {
var c = l.unlockExtra || {};
for (var _ in c) t.include([ "atkPerAdd", "buffIdsAdd" ], _) || (l[_] = c[_]);
c.atkPerAdd && (l.atkPer += c.atkPerAdd);
c.buffIdsAdd && (l.buffIds = l.buffIds.concat(c.buffIdsAdd));
}
if (l.unlockSkillIds && !a.isMissile) for (var f in l.unlockSkillIds) {
var y = Number(l.unlockSkillIds[f]), b = i.fightSkill.findById(y), v = t.find(s.fightSkills, function(e) {
return b.no > 0 && e.data.no == b.no;
}), S = a.level;
v && (S = v.level);
s.addFightSkills([ {
kindId: y,
level: S
} ]);
}
var T, M, $ = a.type || l.type;
a.data = l;
a.buffs = [];
for (f = 0; f < l.buffIds.length; f++) {
(M = n.clone(i.buff.findById(l.buffIds[f]))).skillData = a.data;
M.skillLevel = a.level;
if (!M.isAttacker || !a.isMissile) {
T = o.create(M);
a.buffs.push(T);
}
}
var I, C = r.FIGHT_SKILL.TYPE;
if (s && s.hitReduceAtkSpeedRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200007))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitReduceAtkSpeedRate;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitRepeledRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200011))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitRepeledRate;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitRateSilence > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200012))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitRateSilence;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitReduceMpRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200013))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitReduceMpRate;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitReduceRecoverHpRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200016))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitReduceRecoverHpRate;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitReduceRecoverHp > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200020))).skillData = a.data;
M.skillLevel = a.level;
M.extra.recoverHpRate = s.hitReduceRecoverHp;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitReduceAtkSpeed > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200023))).skillData = a.data;
M.skillLevel = a.level;
M.extra.atkSpeedRate = 1 - s.hitReduceAtkSpeed;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitUnReviveRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200024))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitUnReviveRate;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitReduceMp > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200025))).skillData = a.data;
M.skillLevel = a.level;
M.extra.mp = -s.hitReduceMp;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitRateSilence2 > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200026))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitRateSilence2;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitRepeledRate2 > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200027))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitRepeledRate2;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitUnRecoverHpRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200033))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitUnRecoverHpRate;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitUnRecoverMpRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200035))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitUnRecoverMpRate;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitBleedingHpRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200036))).skillData = a.data;
M.skillLevel = a.level;
M.extra.maxHpRate = s.hitBleedingHpRate;
T = o.create(M);
a.buffs.push(T);
}
if (s && s.hitClearMpRate > 0 && l.atkPer) {
(M = n.clone(i.buff.findById(200042))).skillData = a.data;
M.skillLevel = a.level;
M.hitRate = s.hitClearMpRate;
T = o.create(M);
a.buffs.push(T);
}
($ = ($ = ($ = $ == C.ATTACK ? C.ATTACK_BUFF : $) != C.ATTACK_BUFF || l.atkPer || l.initVal ? $ : C.BUFF) == C.REMOTE_ATTACK && 0 != a.buffs.length ? C.REMOTE_ATTACK_BUFF : $) == C.ATTACK_BUFF && ($ = l.attackType == r.FIGHT_SKILL.ATTACK_TYPE.BUFF ? C.BUFF : $);
switch ($) {
case C.ATTACK:
I = new d(a);
break;

case C.ATTACK_BUFF:
I = new m(a);
break;

case C.REMOTE_ATTACK:
I = new h(a);
break;

case C.REMOTE_ATTACK_BUFF:
I = new g(a);
break;

case C.BUFF:
I = new u(a);
break;

case C.PASSIVE:
I = new p(a);
break;

case C.SUMMON:
I = new k(a);
}
return I;
};
c.shake = function(a, t) {
if (t.shakeDownTime == t.shakeTime) {
var n = t.data.coolTime;
t.coolDownTime = n;
if (0 == t.data.shakeTime) return {
status: "success"
};
t.isShaking = !0;
a.shakeHitTimes = 0;
t.data.shakeBuffIds && e("battle.buff").activateBuffs(a, a, t.data.shakeBuffIds, t.data, t.level);
return {
status: "shake"
};
}
if (t.shakeDownTime > 0) return {
status: "shaking"
};
a.publicCoolDownTime = t.data.publicCoolDownTime;
t.reSetShakeTime();
if (!t.isMissile && !t.isRateReset && t.data.resetRate && l.random() < t.data.resetRate) {
t.coolDownTime = 0;
a.publicCoolDownTime = 1;
a.setCurSkill(t.kindId);
t.isRateReset = !0;
}
return {
status: "success"
};
};
c.attack = function(a, t, n) {
a = n.isMissile ? a.attacker : a;
for (var o = {
status: "attack",
infos: []
}, c = 0, d = 0; d < t.length; d++) {
var h = t[d];
if (!h.died) {
var u = {
result: "",
targetId: h.entityId,
damage: 0,
isCrit: !1
}, m = s.calDamage(a, h, n);
if (m.isRecover || h.entityId != a.entityId) {
if (!m.isRecover) {
var g = l.isPVP() ? h.level : a.level, p = i.math.findOneBy("level", g).expectDodge, _ = (h.dodge - .9 * p) / (h.dodge + .1 * p + 10) / 1;
_ = (_ = (_ = _ < 0 ? 0 : _) > .1 ? .1 : _) + h.dodgeRate + h.extraDodgeRate - a.atkIgnoreDodgeRate;
var k = 1 - ((a.hit + n.data.extraHit) / 100 + a.hitRate + a.addHitRate - _);
if (l.random() < k && !n.data.isMustHit) {
u.result = "miss";
o.infos.push(u);
continue;
}
}
m.isRecover && h.recoverHpBeDmg && (m.isRecover = !1);
if (m.isRecover) h.recoverHpSilence ? m.damage = 0 : m.damage = h.recoverHp(m.damage); else {
if (!n.data.isMustHit) {
var f = s.calReboundDamage(a, h, m.damage, m.oldDamage);
m.damage = f.damage;
c = f.reboundDmg;
h.reduceSpecialHp("reboundDmgHp", f.addReboundDmg);
}
var y = h.getStaticBuffVal("hitMaxHpRate", !1);
y && m.damage / h.maxHp > y && (m.damage = h.maxHp * y);
h.reduceHp(m.damage, !1, !1, n.data, a);
a.reduceHp(c, !1, !1, null, h);
if (m.linkDmg || m.deLinkDmg) {
var b = a.area.getEntityBy({
teamId: h.teamId
});
for (var v in b) if (!b[v].invincible) {
m.linkDmg && b[v] != h && b[v].reduceHp(m.linkDmg / b.length, !0, null, null, a);
m.deLinkDmg && b[v] != h && b[v].reduceHp(m.deLinkDmg, !0, null, null, a);
}
}
m.addHp > 0 && !a.recoverHpSilence ? m.addHp = a.recoverHp(m.addHp) : m.addHp = 0;
}
u.isRecover = m.isRecover;
u.damage = m.damage <= 0 ? 0 : m.damage;
u.reboundDmg = c;
u.addHp = m.addHp;
u.attackerHpPct = a.hpPct;
u.isCrit = m.isCrit;
u.hpPct = h.hpPct;
u.immuneType = m.immuneType;
u.result = h.died ? "killed" : "success";
if (h.died) {
var S = r.KILL_RECOVER_MP;
a.recoverMp(S, !0, !0);
n.data.killBuffIds && n.data.killBuffIds.length > 0 && e("battle.buff").activateBuffs(a, a, n.data.killBuffIds, n.data, n.level);
if (n.data.killResetTimes) {
var T = n.data.kindId;
if (a.fightSkills[T].killResetTimes < n.data.killResetTimes) {
a.fightSkills[T].coolDownTime = 0;
a.publicCoolDownTime = 0;
a.setCurSkill(T);
a.fightSkills[T].killResetTimes++;
} else a.fightSkills[T].killResetTimes = 0;
}
}
o.infos.push(u);
}
}
}
o.attackerKilled = !!a.died;
return o;
};
c.remoteAttack = function(a, t, n) {
for (var i = e("battle.missile"), s = 0; s < t.length; s++) {
var o = t[s];
if (!o.died) {
var l = new i({
attacker: a,
targetId: o.entityId,
curSkill: c.create({
kindId: n.kindId,
level: n.level,
data: n.data,
type: r.FIGHT_SKILL.TYPE.ATTACK,
isMissile: !0,
attacker: a
}),
skillPosition: t.length > 1 ? o.getPosition() : n.position,
brainName: "missile"
});
a.area.addEntity(l);
}
}
return {
status: "missile"
};
};
c.addBuff = function(e, a, n, i) {
i = i || [];
for (var s, o, c = (e = n.isMissile ? e.attacker : e).getBuffs("immuneBuff"), d = {
status: "buff",
buffInfos: {}
}, h = 1, u = 0; u < n.buffs.length; u++) {
var m = n.buffs[u], p = !0, _ = !1;
if (m.data.isAttacker) {
if (e.died) continue;
h = m.data.extra.isNoOneTimes ? a.length : h;
for (var k = 0; k < h; k++) {
(m = m.clone()).hitRate > 0 && (p = l.random() < m.hitRate);
for (var f in c) {
(S = c[f].data.extra).buffIds && t.include(S.buffIds, m.kindId) && (p = !1);
S.effects && t.include(S.effects, m.data.effect) && (p = !1);
}
if (p) {
m.use(e, e);
o = e.entityId;
d.buffInfos[o] = d.buffInfos[o] || [];
d.buffInfos[o].push({
buffId: m.buffId,
hited: p,
interrupt: _,
data: {
kindId: m.data.kindId,
effectId: m.data.effectId,
wordId: m.data.wordId
}
});
}
}
}
}
var y = {};
for (u = 0; u < a.length; u++) if (!((s = a[u]) == e && n.data.isNoSelf || s.died || (s.invincible || l.random() < s.skipHitRate) && s.teamId != e.teamId || t.include(i, s.entityId) || n.constructor == g || s.died || s.isSingleBoss())) {
c = s.getBuffs("immuneBuff");
var b = void 0;
for (k = 0; k < n.buffs.length; k++) if (!(m = n.buffs[k].clone()).data.isAttacker && (m.data.type != r.BUFF.TYPE.STATUS || "silence" != m.data.effect || m.data.extra.isMustHit || !(l.random() < s.unSilenceRate)) && (m.data.type != r.BUFF.TYPE.STATUS || "dizziness" != m.data.effect || m.data.extra.isMustHit || !(l.random() < s.unDizzinessRate)) && (m.data.type != r.BUFF.TYPE.STATUS || "confused" != m.data.effect || m.data.extra.isMustHit || !(l.random() < s.unConfusedRate + s.privateUnConfusedRate))) {
var v = s.unDeBuffRate - e.ignoreUnDeBuffRate;
v = v < 0 ? 0 : v;
if (2 != m.data.effectType || m.data.extra.isMustHit || !(l.random() < v)) {
for (var f in c) {
var S;
(S = c[f].data.extra).buffIds && t.include(S.buffIds, m.kindId) || !S.effects || t.include(S.effects, m.data.effect);
}
p = !0, _ = !1;
if (null == b) {
var T = r.BUFF.EFFECTS.HIT_JUDGE;
if (!m.data.extra.isSkiphitJudge && t.include(T, m.data.effect)) {
var M = 100 == m.skillLevel ? 200 : m.skillLevel;
if (s.level > M) {
var $ = M - s.level, I = .04 * s.level + .001;
I = 1 - (I > 1 ? 1 : I);
var C = -21e-6 * Math.pow($, 3) - .00234 * Math.pow($, 2) - .0813 * $ - I;
p = b = !(l.random() < C);
}
}
} else p = b;
m.hitRate > 0 && (p = l.random() < m.hitRate);
y[m.kindId] = y[m.kindId] || 0;
p && m.data.targetCount && y[m.kindId] == m.data.targetCount && (p = !1);
if (p) {
m.use(s, e);
var P = s.getCurSkill();
t.include(r.BUFF.EFFECTS.INTERRUPT, m.data.effect) && P && !P.isUnInterrupt() && (_ = s.interruptSkill());
y[m.kindId]++;
}
o = s.entityId;
d.buffInfos[o] = d.buffInfos[o] || [];
d.buffInfos[o].push({
buffId: m.buffId,
hited: p,
interrupt: _,
data: {
kindId: m.data.kindId,
effectId: m.data.effectId,
wordId: m.data.wordId
}
});
}
}
}
return d;
};
c.summon = function(a, n, i) {
var s = e("battle.mob"), l = i.data.atkPer;
"number" == typeof l && (l = [ i.data.atkPer ]);
for (var d in l) {
var h = a.area.getEntityBy({
isSummon: !0,
masterId: a.entityId,
kindId: l[d]
});
if (!t.include(r.FIGHT_SKILL.MULTI_SUMMON_MOB_IDS, l[d])) for (var u in h) {
h[u].isRepeatSummon = !0;
h[u].reduceHp(999999999999, !0);
}
}
var m = [], g = [ 0, -60, 60, -120, 120 ];
for (var d in l) {
var p = l[d], _ = (h = a.area.getEntityBy({
isSummon: !0,
masterId: a.entityId,
kindId: p
}), i.data.missileTargetCount ? i.data.missileTargetCount : 1), k = [ 0, -60, 60, -120, 120 ];
for (u = 0; u < _; u++) {
var f = new s({
kindId: p,
level: a.level,
skillLevel: a.level,
evolveSkillIds: a.evolveSkillIds
});
f.teamId = a.teamId;
f.playerId = a.playerId;
f.isSummon = !0;
f.master = a;
f.masterId = a.entityId;
f.idx = 5;
var y, b = [ "maxHp", "atk", "def", "mdef" ], v = i.data.initVal + i.level * i.data.valGrowth;
for (var S in b) f[y = b[S]] = a[y] * v;
f.hp = f.maxHp;
f.atkSpeedRate = a.atkSpeedRate;
var T = 1 == l.length ? h.length : 0;
o.prototype.setPosition.call(f, i.position.x, i.position.y + g[d] + (k[u + T] || 0));
m.push(f);
a.area.addEntity(f);
}
}
var M = {
status: "summon"
};
M.buffInfos = c.addBuff(a, m, i).buffInfos;
return M;
};
cc._RF.pop();
}, {
"battle.buff": "battle.buff",
"battle.consts": "battle.consts",
"battle.entity": "battle.entity",
"battle.formula": "battle.formula",
"battle.missile": "battle.missile",
"battle.mob": "battle.mob",
"battle.util": "battle.util",
battleMain: "battleMain",
dataApi: "dataApi",
underscore: "underscore"
} ],
