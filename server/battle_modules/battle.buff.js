"battle.buff": [ function(e, a) {
"use strict";
cc._RF.push(a, "2c1edLNtK1FI7W75JMfwcrF", "battle.buff");
var t = e("underscore"), n = e("dataApi"), i = e("battle.util"), r = e("battle.scheduler"), s = e("battle.consts"), o = e("battle.entity"), l = e("battle.fightskill"), c = e("battle.formula"), d = e("battleMain"), h = function e(a) {
this.buffId = e.id++;
this.skillData = a.data.skillData;
this.skillLevel = a.data.skillLevel;
this.kindId = a.data.kindId;
this.data = a.data;
this.useCallback = a.useCallback;
this.unuseCallback = a.unuseCallback;
this.hitRate = a.data.hitRate || a.data.extra.hitRate || 0;
this.dynamicCallback = a.dynamicCallback;
this.growthVal = (this.data.extra.growth || 0) * this.skillLevel;
this.statusData = {};
this.character = null;
this.attacker = null;
};
h.id = 1;
a.exports = h;
var u = function(e, a, t, n, i) {
for (var r in e) h.activateBuffs(e[r], a, t, n, i);
}, m = function(e, a, r, s, o) {
if (e) {
var l = {};
for (var c in r) {
var u = t.isNumber(r[c]) ? i.clone(n.buff.findById(r[c])) : r[c];
u.skillData = s;
u.skillLevel = o;
var m = h.create(u);
if (!(m.hitRate > 0) || d.random() < m.hitRate) {
e = m.data.isAttacker ? a : e;
m.use(e, a);
l[e.entityId] = l[e.entityId] || [];
l[e.entityId].push({
buffId: m.buffId,
hited: !0,
interrupt: !1,
data: {
kindId: m.data.kindId,
effectId: m.data.effectId,
wordId: m.data.wordId
}
});
}
}
e.emit("activatePassive", {
buffInfos: l
});
}
};
h.activateBuffs = m;
var g = h.prototype;
g.use = function(e, a) {
var t = e.getBuffs(this.data.effect);
t.length > this.data.overlapTimes && t[0].clear();
e.addBuff(this);
this.useCallback(e, a);
this.character = e;
this.attacker = a;
if (this.data.timeout > 0 && this.unuseCallback) {
this.timeoutCallback = function(e, a) {
if (this.interval) {
this.interval = null;
this.unuseCallback(e, a);
e.removeBuff(this);
}
}.bind(this, e, a);
var n = this.data.type == s.BUFF.TYPE.DYNAMIC ? .5 : 0;
this.interval = r.setTimeout(this.timeoutCallback, 1e3 * (this.data.timeout + n));
}
var i = this.data.extra.useActivateIds;
i && u([ e ], a, i, this.skillData, this.skillLevel);
return !0;
};
g.clear = function(e) {
if (this.interval) {
r.clearTimeout(this.interval);
this.timeoutCallback();
}
var a = this.data.extra.clearActivateIds;
e && a && m(this.character, this.attacker, a, this.skillData, this.skillLevel);
};
g.clone = function() {
return h.create(this.data);
};
h.StatusBuff = function(e) {
return new h({
data: e,
useCallback: function(e) {
e[this.data.extra.status] = !0;
switch (this.data.extra.status) {
case "confused":
e.setTargetNearest();
break;

case "silence":
var a = e.getCurSkill();
a && a.kindId != e.initSkillId && !a.isUnInterrupt() && e.interruptSkill();
break;

case "repeled":
case "repeled_1":
var t = (this.data.extra.walkSpeed ? this.data.extra.walkSpeed : s.FIGHT_SKILL.REPEL_WALKSPEED) * this.data.timeout;
t = 1 == e.teamId ? -1 * t : t;
e.move(e.x + t, e.y, !0);
break;

case "terror":
t = e.walkSpeed * this.data.timeout;
t = 1 == e.teamId ? -1 * t : t;
e.move(e.x + t, e.y);
}
},
unuseCallback: function(e) {
if (!(e.getBuffs(this.data.effect).length - 1 > 0)) {
e[this.data.extra.status] = !1;
switch (this.data.extra.status) {
case "confused":
e.setTargetNearest();
break;

case "silence":
e.setCurSkill(0);
break;

case "repeled":
case "repeled_1":
e.stop(!0);
}
}
}
});
};
h.StaticBuff = function(e) {
return new h({
data: e,
useCallback: function(a, n) {
if (this.data.extra.maxHpRateShield) {
this.data.extra.shieldHp = this.data.extra.maxHpRateShield * a.maxHp;
delete this.data.extra.maxHpRateShield;
}
if (this.data.extra.attackerMaxHpRateShield) {
this.data.extra.shieldHp = this.data.extra.attackerMaxHpRateShield * n.maxHp;
delete this.data.extra.attackerMaxHpRateShield;
}
for (var i in this.data.extra) {
switch (i) {
case "symbol":
case "growth":
case "isUnRemove":
case "isNoOneTimes":
continue;

case "defShieldHp":
case "mDefShieldHp":
case "shieldHp":
case "reboundDmgHp":
a[i + "BuffMap"][e.effect] = this;
break;

case "reviveMaxHpRate":
a[i + "Buff"] = this;
}
switch (this.data.extra.symbol) {
case "+":
var r = this.data.extra[i] + this.growthVal;
this.statusData.val = r;
if (this.data.extra.isNoSet) return;
if (this.data.extra.mp) r > 0 ? a.recoverMp(r, !0) : a.unReduceMp || a.reduceMp(-r, !0); else if (this.data.extra.maxMpRate) r > 0 ? a.recoverMp(a.maxMp * r, !0) : a.unReduceMp || a.reduceMp(-a.maxMp * r, !0); else {
a[i] = a[i] || 0;
a[i] += r;
}
break;

case "*":
r = this.data.extra[i] + this.growthVal;
this.statusData.val = r;
if (this.data.extra.isNoSet) return;
if (this.data.extra.mp) r > 1 ? a.recoverMp(a.mp * (r - 1), !0) : a.unReduceMp || a.reduceMp(a.mp * (1 - r), !0); else if (t.include([ "atk", "def", "mdef", "maxHp", "hp" ], i)) {
a[i] = a[i] || 1;
a["_" + i] = a["_" + i] || a[i];
a[i] += a["_" + i] * (r - 1);
} else {
a[i] = a[i] || 1;
a[i] *= r;
}
}
if ("hp" == i) {
a.setHpPct();
a.emit("hpPct", {
character: a
});
}
}
},
unuseCallback: function(e) {
if (!this.data.extra.isUnRemove) for (var a in this.data.extra) {
t.include([ "defShieldHp", "mDefShieldHp", "shieldHp" ], a) && delete e[a + "BuffMap"][this.data.effect];
if ("symbol" != a && "growth" != a && "isNoOneTimes" != a) {
switch (this.data.extra.symbol) {
case "+":
var n = this.statusData.val;
e[a] -= n;
t.include([ "shieldHp", "defShieldHp", "mDefShieldHp", "reboundDmgHp" ], a) && (e[a] = e[a] < 0 ? 0 : e[a]);
t.include([ "maxHp", "hp" ], a) && (e[a] = e[a] <= 0 ? 1 : e[a]);
break;

case "*":
n = this.statusData.val;
if (t.include([ "atk", "def", "mdef", "maxHp", "hp" ], a)) {
e["_" + a] = e["_" + a] || e[a];
e[a] -= e["_" + a] * (n - 1);
} else e[a] /= n;
e[a] = e[a] <= 0 ? 1 : e[a];
}
if ("hp" == a) {
e.setHpPct();
e.emit("hpPct", {
character: this
});
}
}
}
}
});
};
h.DynamicBuff = function(e, a) {
return new h({
data: e,
dynamicCallback: a,
useCallback: function(e, a) {
this.attackerId = a.entityId;
if (!this.dynamicInterval) {
var t = 1e3 * (this.data.extra.delay || 0);
this.dynamicIntervalTime = (1e3 * this.data.timeout - t) / this.data.extra.times;
this.dynamicIntervalTime = this.dynamicIntervalTime < 0 ? 0 : this.dynamicIntervalTime;
this.times = 0;
this.dynamicInterval = r.setTimeout(function() {
this.dynamicInterval = r.setInterval(function(e, a) {
if (this.times != this.data.extra.times) {
this.dynamicCallback(e, a);
this.times++;
}
}.bind(this, e, a), this.dynamicIntervalTime);
}.bind(this), t);
}
},
unuseCallback: function(e, a) {
r.clearInterval(this.dynamicInterval);
this.dynamicInterval = null;
if (this.data.dynamicType == s.BUFF.DYNAMIC_TYPE.SKILL) {
var t = a.fightSkills[this.data.skillData.kindId];
t && delete t.usedTargetIds;
}
}
});
};
h.SpecialBuff = function(a) {
return new h({
data: a,
useCallback: function(c, g) {
switch (a.effect) {
case "drag":
c.drag = !0;
var p = c.walkSpeed;
c.walkSpeed = a.extra.walkSpeed;
c.move(g.x + a.extra.offsetX * (g.x - c.x > 0 ? 1 : -1), g.y);
c.walkSpeed = p;
break;

case "blink":
var _, k = a.extra.isTargetOffset ? c : g, f = a.extra.isTargetBlink ? c : g;
(_ = {
x: k.x + a.extra.offsetX * (f.x - k.x > 0 ? 1 : -1),
y: k.y
}).x = _.x > 1024 ? 1024 : _.x;
_.x = _.x < 0 ? 0 : _.x;
f.setPosition(_.x, _.y);
break;

case "swap":
var y = g.getPosition(), b = c.getPosition();
g.setPosition(b.x, b.y);
g.swaped = !0;
c.setPosition(y.x, y.y);
a.extra.backTime && r.setTimeout(function() {
g.setPosition(y.x, y.y);
g.swaped = !1;
}, 1e3 * a.extra.backTime);
g.setTargetNearest();
break;

case "kill":
var v = a.extra.rate + (a.extra.growth || 0) * a.skillLevel;
if (d.random() < v) {
c.reduceHp(999999, !0, !1, this.skillData, g);
this.skillData.killBuffIds && m(c, g, this.skillData.killBuffIds, this.skillData, this.skillLevel);
}
break;

case "unlockSkills":
var S = a.skillData.kindId;
for (var T in a.extra.skillIds) {
var M = a.extra.skillIds[T], $ = a.skillLevel;
c.addFightSkills([ {
parentSkillId: S,
kindId: M,
level: $
} ]);
c.publicCoolDownTime = 0;
}
c.setCurSkill(a.extra.skillIds[0]);
break;

case "useSkill":
c.setCurSkill(a.extra.skillId);
break;

case "unDizziness":
c.unDizzinessRate += 1;
c.removeAllEffectBuff("dizziness");
break;

case "unSilence":
c.unSilenceRate += 1;
c.removeAllEffectBuff("silence");
break;

case "unConfused":
c.unConfusedRate += 1;
c.removeAllEffectBuff("confused");
break;

case "revive":
for (var I = a.extra.count, C = 0; C < I; C++) {
var P = g.area.getEiedEntityBy({
teamId: g.teamId,
isSummon: !1
});
if (0 == P.length) return;
var D = P[d.randomRange(0, P.length - 1)];
if ("mob" == D.type) return;
var N = new (e("battle.role"))(D._opts);
N.entityId = D.entityId;
N.teamId = D.teamId;
N.playerId = D.playerId;
N.idx = D.idx;
var A = a.extra.maxHpRate + (a.extra.growth || 0) * a.skillLevel;
N.hp = N.maxHp * A;
N.setHpPct();
o.prototype.setPosition.call(N, g.x + a.extra.offsetX, g.y + (a.extra.offsetY || 0));
g.area.addEntity(N);
var L = {};
L[N.entityId] = [];
for (var T in a.extra.buffIds) {
(ee = i.clone(n.buff.findById(a.extra.buffIds[T]))).skillData = a.skillData;
ee.skillLevel = a.skillLevel;
(R = h.create(ee)).use(N, g);
L[N.entityId].push({
buffId: R.buffId,
hited: !0,
interrupt: !1,
data: {
kindId: R.data.kindId,
effectId: R.data.effectId,
wordId: R.data.wordId
}
});
}
N.emit("activatePassive", {
buffInfos: L
});
delete g.area.diedEntities[D.entityId];
t.include(s.FIGHT_SKILL.REVIVE_IDS, a.skillData.kindId) && (g.usedSkillIdMap[a.skillData.kindId] = !0);
}
break;

case "keepHpRateDmg":
var E = a.extra.hpRate + (a.extra.growth || 0) * a.skillLevel;
if (c.hp / c.maxHp > E) {
var B = c.hp - c.maxHp * E;
c.reduceHp(B, !0, !0, this.skillData, g);
}
break;

case "removeShield":
for (var w in c.buffs) for (var G in c.buffs[w]) {
var R = c.buffs[w][G], H = [ "hitDmgRate", "hitMdmgRate", "shieldHp", "defShieldHp", "mDefShieldHp", "reboundDmgRate" ];
if (!(0 == t.intersection(t.keys(R.data.extra), H).length || R.extra && R.extra.isNoRemove)) for (var x in H) {
var K = H[x];
t.include([ "hitDmgRate", "hitMdmgRate" ], K) ? R.data.extra[K] < 0 && R.clear() : R.data.extra[K] > 0 && R.clear();
}
}
break;

case "hpPctTrigger":
var F = this, V = function(e, a) {
var t = F.data.extra.lowHpPct, n = F.data.extra.upHpPct;
if (null != t && a <= t || null != n && a >= n) {
F.clear();
(!F.data.extra.rate || d.random() < F.data.extra.rate) && m(c, g, F.data.extra.buffIds, F.skillData, F.skillLevel);
}
};
this.data.extra.isInstant || (c.reduceHpTriggerMap[this.buffId] = V);
V(0, c.hpPct);
break;

case "reduceHpTrigger":
var O = c.maxHp * a.extra.hpPct;
this.triggerCostHp = O;
this.costHp = 0;
F = this, V = function(e) {
if (!(e > 0)) {
F.costHp += Math.abs(e);
if (F.costHp > F.triggerCostHp) {
F.costHp = 0;
m(c, g, F.data.extra.buffIds, F.skillData, F.skillLevel);
}
}
};
c.reduceHpTriggerMap[this.buffId] = V;
break;

case "allDeadTrigger":
F = this, V = function() {
m(c, g, F.data.extra.buffIds, F.skillData, F.skillLevel);
};
c.allDeadTriggerMap[this.buffId] = V;
null == this.data.extra.isSameTeam ? V.watchTeamId = 0 : V.watchTeamId = this.data.extra.isSameTeam ? c.teamId : c.getTargetTeamId(!0);
break;

case "hpExchange":
var U = c.hp - g.hp;
if ((U = U > 0 ? U : 1) > 0) {
g.recoverHp(U, !0, !0);
c.reduceHp(U, !0, !0, this.skillData, g);
}
break;

case "hpToShield":
A = a.extra.maxHpRate + (a.extra.growth || 0) * a.skillLevel;
B = c.maxHp * A;
c.reduceHp(B, !0, !0, a.skillData, g);
var W = B * a.extra.shieldRate;
(X = i.clone(n.buff.findById(a.extra.linkBuffId))).extra.shieldHp = W;
F = this;
var Y = {
data: this.skillData
}, j = l.prototype.getTargets.call(Y, g, c);
t.each(j, function(e) {
m(e, g, [ X ], F.skillData, F.skillLevel);
});
break;

case "modifyBuff":
if (!(Y = c.fightSkills[a.extra.linkSkillId])) break;
var q = a.extra.linkBuffId, X = Y.modifyBuffMap[q] || n.buff.findById(q);
X = i.clone(X);
a.extra.addVal && (X.extra[a.extra.attr] += a.extra.addVal);
Y.modifyBuffMap[q] = X;
for (var T in Y.buffs) if (Y.buffs[T].kindId == q) {
(ee = X).skillData = Y.data;
ee.skillLevel = Y.level;
R = h.create(ee);
Y.buffs[T] = R;
}
break;

case "modifySkill":
if (a.extra.isSkipSummon && c.isSummon) return;
var z = a.extra.skillIds || [];
a.extra.nos && t.each(c.fightSkills, function(e) {
var i = n.fightSkill.findById(e.kindId);
t.include(a.extra.nos, i.no) && z.push(i.kindId);
});
for (var T in z) {
if (!(Y = c.fightSkills[z[T]])) return;
var J = a.extra;
for (var Z in J) t.include([ "addDmgRate", "addDmgRateMax", "addAtkPer", "addAtkPerMax", "buffIds", "buffIdsAdd", "buffIdMap", "coolDownTime", "addCoolDownTime", "resetCoolDownTime", "copyIds", "killBuffIds", "hitRate", "publicCoolDownTime" ], Z) || (Y.data[Z] = J[Z]);
var Q = (a.extra.buffIdsAdd || []).concat(a.extra.buffIds || []);
if (a.extra.buffIds || a.extra.buffIdMap) {
if (a.extra.buffIdMap) for (var x in Y.data.buffIds) {
q = Y.data.buffIds[x];
q = a.extra.buffIdMap[q] || q;
Q.push(q);
}
Y.buffs = [];
Y.data.buffIds = [];
}
for (var x in Q) {
var ee;
(ee = i.clone(n.buff.findById(Q[x]))).skillData = Y.data;
ee.skillLevel = Y.level;
R = h.create(ee);
Y.buffs = Y.buffs || [];
Y.buffs.push(R);
}
Y.data.buffIds = Y.data.buffIds.concat(Q);
if (a.extra.isResetBuffIds) {
var ae = n.fightSkill.findById(Y.kindId);
Y.data.buffIds = ae.buffIds;
Y.buffs = t.filter(Y.buffs, function(e) {
return t.include(ae.buffIds, e.kindId);
});
}
var te = a.extra.killBuffIds;
if (te) {
Y.data.killBuffIds = Y.data.killBuffIds || [];
Y.data.killBuffIds = Y.data.killBuffIds.concat(te);
}
var ne = a.extra.addDmgRate;
if (ne) {
Y.data.hpPctDmgRate = Y.data.hpPctDmgRate || {};
Y.data.hpPctDmgRate[1] = Y.data.hpPctDmgRate[1] || 0;
(!a.extra.addDmgRateMax || Y.data.hpPctDmgRate[1] < a.extra.addDmgRateMax) && (Y.data.hpPctDmgRate[1] += ne);
}
var ie = a.extra.addAtkPer;
if (ie) {
var re = n.fightSkill.findById(Y.kindId);
(!a.extra.addAtkPerMax || Y.data.atkPer - re.atkPer < a.extra.addAtkPerMax) && (Y.data.atkPer += ie);
}
var se = a.extra.coolDownTime;
if (null != se) {
Y.coolDownTime = se;
0 == se && c.setCurSkill(Y.kindId);
}
var oe = a.extra.addCoolDownTime;
if (null != oe) {
Y.coolDownTime += oe;
Y.coolDownTime = Y.coolDownTime < 0 ? 0 : Y.coolDownTime;
}
var le = a.extra.resetCoolDownTime;
null != le && (Y.data.coolTime = le);
var ce = a.extra.publicCoolDownTime;
null != ce && (c.publicCoolDownTime = ce);
if (a.extra.copyIds) {
var de = l.create({
kindId: a.extra.copyIds[T],
level: Y.level || a.skillLevel
}, c);
de.coolDownTime = Y.coolDownTime;
c.fightSkills[Y.kindId] = de;
}
if (Y.data.type == s.FIGHT_SKILL.TYPE.PASSIVE) {
Y.coolDownTime = 0;
c.activatePassive();
}
a.extra.setInitSkill && (c.initSkillId = Y.kindId);
}
break;

case "removeBuff":
Q = this.data.extra.buffIds, this.data.extra.isClearActive;
if (Q) for (var T in Q) {
var he = c.getBuffBy("kindId", Q[T]);
t.each(he, function(e) {
e.clear();
});
}
var ue = this.data.extra.effectType;
if (ue) {
var me = c.getBuffBy("effectType", ue);
t.each(me, function(e) {
e.clear();
});
}
break;

case "helperMaster":
if (c.master && c.master.died) break;
A = this.data.extra.maxHpRate;
var ge = this.data.extra.mp;
if (A) {
var pe = c.master.maxHp * A;
c.master.recoverHp(Math.abs(pe), !0, !0);
}
ge && c.master.recoverMp(ge, !0);
break;

case "helperTeam":
Q = this.data.extra.buffIds;
var _e = a.extra.isSameTeam, ke = a.extra.getTargetsSkillId;
j = c.area.getEntityBy({
teamId: _e ? c.teamId : c.getTargetTeamId()
});
ke && (j = (Y = l.create({
kindId: ke,
level: 1
}, c)).getTargets(c, j[0]));
u(j, g, Q, this.skillData, this.skillLevel);
}
},
unuseCallback: function(e, t) {
switch (a.effect) {
case "drag":
e.drag = !1;
t.setTargetNearest();
break;

case "unDizziness":
e.unDizzinessRate -= 1;
break;

case "unSilence":
e.unSilenceRate -= 1;
break;

case "unConfused":
e.unConfusedRate -= 1;
break;

case "hpPctTrigger":
case "reduceHpTrigger":
delete e.reduceHpTriggerMap[this.buffId];
}
}
});
};
h.create = function(e) {
var a = s.BUFF.TYPE;
switch (e.type) {
case a.STATUS:
return new h.StatusBuff(e);

case a.STATIC:
return new h.StaticBuff(e);

case a.DYNAMIC:
var n, i = s.BUFF.DYNAMIC_TYPE;
switch (e.dynamicType) {
case i.SING:
n = function(a, t) {
var n = e.skillData.kindId, i = l.create({
parentSkillId: n,
kindId: e.extra.skillId,
level: e.skillLevel
}, t), r = t.fightSkills[e.skillData.kindId], o = a != t ? a : t.area.getEntity(t.targetId);
if (o) {
if (e.skillData.isSameTeam != i.data.isSameTeam) {
delete r.position;
delete r.targets;
}
e.skillData.targetType == s.FIGHT_SKILL.TARGET_TYPEE.NORMAL && delete r.targets;
i.position = r ? r.position : null;
i.targets = r ? r.targets : null;
i.isCallback = !0;
t.useSkill(i, o);
}
};
break;

case i.SKILL:
n = function(a, n) {
var i = e.skillData.kindId, r = l.create({
parentSkillId: i,
kindId: e.extra.skillId,
level: e.skillLevel
}, n), o = n.fightSkills[e.skillData.kindId], c = a != n ? a : n.area.getEntity(n.targetId);
if (c) {
r.isCallback = !0;
if (e.extra.targetOnce) {
o.usedTargetIds = o.usedTargetIds || [];
o.usedTargetIds.push(c.entityId);
o.usedTargetIds = t.union(o.usedTargetIds);
r.usedTargetIds = o.usedTargetIds;
}
var d = n.useSkill(r, c);
if (r.data.type == s.FIGHT_SKILL.TYPE.PASSIVE && d && d.buffInfos) for (var h in d.buffInfos) for (var u in d.buffInfos[h]) n.passiveBuffIds.push(d.buffInfos[h][u].buffId);
}
};
break;

case i.DMG:
n = function(a, t) {
var n = 0, i = a.getStaticBuffVal("hitMaxHpRate", !1);
if (null != e.extra.hpRate) {
var r = e.extra.hpRate + (e.extra.growth || 0) * e.skillLevel;
i && r > i && (r = i);
n = a.hp * r;
} else if (null != e.extra.maxHpRate) {
var o = e.extra.maxHpRate + (e.extra.growth || 0) * e.skillLevel;
i && o > i && (o = i);
n = a.maxHp * o;
} else null != e.extra.atk2HpRate ? n = t.getAttackValue() * e.extra.atk2HpRate : null != e.extra.dmg ? n = e.extra.dmg + (e.extra.growth || 0) * e.skillLevel : e.extra.lostHp2HpRate && (n = (a.maxHp - a.hp) * e.extra.lostHp2HpRate);
if (e.extra.maxDmg) {
var l = e.extra.maxDmg;
n = n > l ? l : n;
}
var h = e.extra.isShow || !1, u = a.invincible && !e.extra.ignoreInvincible && !e.skillData.isMustHit && !e.extra.isMustHit;
if (n > 0 && !u) {
if (a.isSingleBoss()) return;
var g = n, p = a.hitDmgRate, _ = a.getBuffOne("hitDmgRate");
if (_) {
var k = _.data.extra.ifVal, f = _.data.extra.val + _.growthVal;
k < 0 ? n / a.maxHp < Math.abs(k) && (p -= f) : n / a.maxHp > Math.abs(k) && (p -= f);
}
e.extra.isSkipRedHitDmg || (p -= a.redHitDmgRate + a.redHitPctDmgRate);
n *= p = p < 0 ? 0 : p;
if (!e.extra.isMustHit) {
var y = c.calReboundDamage(t, a, n, g, e.extra.ignoreInvincible);
n = y.damage;
a.reduceSpecialHp("reboundDmgHp", y.addReboundDmg);
t.reduceHp(y.reboundDmg, !0, !0, null, a);
}
e.extra.save && a.hp - n < a.maxHp * e.extra.save && (n = a.hp - Math.floor(a.maxHp * e.extra.save));
n = n < 0 ? 0 : n;
e.extra.dmg && e.extra.isKeep && (n = e.extra.dmg);
if (!(u = d.random() < a.skipHitRate)) {
t = t.attacker ? t.attacker : t;
a.reduceHp(n, !0, h, h ? e.skillData : null, t);
d.damageMap[t.teamId] && !a.isSummon && (t.isSummon ? d.damageMap[t.teamId][t.masterId] && n < 999999999999 && (d.damageMap[t.teamId][t.masterId].damage += n) : d.damageMap[t.teamId][t.entityId] && (d.damageMap[t.teamId][t.entityId].damage += n));
}
if (a.died) {
t = a.area.getEntity(this.attackerId);
var b = s.KILL_RECOVER_MP;
t && t.recoverMp(b, !0);
if (e.extra.killResetTimes && t) {
var v = e.skillData.kindId;
if (t.fightSkills[v].killResetTimes < e.extra.killResetTimes) {
t.fightSkills[v].coolDownTime = 0;
t.publicCoolDownTime = 0;
t.setCurSkill(v);
t.fightSkills[v].killResetTimes++;
} else t.fightSkills[v].killResetTimes = 0;
}
e.skillData.killBuffIds && m(t, t, e.skillData.killBuffIds, this.skillData, this.skillLevel);
}
}
if (n < 0) {
a.recoverHpSilence || a.recoverHpBeDmg || a.recoverHp(Math.abs(n), !0, h);
a.recoverHpBeDmg && a.reduceHp(n, !0, h, h ? e.skillData : null, t);
}
};
break;

case i.MP_RECOVER:
n = function(a) {
var t = e.extra.mp + (e.extra.growth || 0) * e.skillLevel;
t > 0 ? a.recoverMp(t, !0) : a.unReduceMp || a.reduceMp(-t, !0);
};
break;

case i.MP_ABSORB_TO_ALL:
n = function(a) {
var t = e.extra.mp + (e.extra.growth || 0) * e.skillLevel, n = a.area.getEntityBy({
teamId: a.teamId,
died: !1
});
for (var i in n) n[i].recoverMp(t, !0);
};
break;

case i.BUFF:
n = function(a, t) {
m(a, t, e.extra.buffIds, e.skillData, e.skillLevel);
};
break;

default:
n = function() {
console.log("default dynamicCallback id:" + e.kindId);
};
}
return new h.DynamicBuff(e, n);

case a.SPECIAL:
return new h.SpecialBuff(e);
}
return null;
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.entity": "battle.entity",
"battle.fightskill": "battle.fightskill",
"battle.formula": "battle.formula",
"battle.role": "battle.role",
"battle.scheduler": "battle.scheduler",
"battle.util": "battle.util",
battleMain: "battleMain",
dataApi: "dataApi",
underscore: "underscore"
} ],
