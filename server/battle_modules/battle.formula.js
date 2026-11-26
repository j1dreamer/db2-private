"battle.formula": [ function(e, a) {
"use strict";
cc._RF.push(a, "691d0HrjmFG+4JEHzWol9N4", "battle.formula");
var t = e("underscore"), n = e("dataApi"), i = e("battle.consts"), r = e("battleMain"), s = a.exports;
s.calDamage = function(e, a, s) {
var o, l, c, d = s.data, h = i.FIGHT_SKILL.ATTACK_TYPE, u = s.data.attackType == h.RECOVER, m = e.getAttackValue() * d.atkPer + (d.initVal + s.level * d.valGrowth);
if (u) {
t.include([ i.BATTLE_TYPE.SMAP, i.BATTLE_TYPE.EXPEDITION ], r.battleType) && 1 == e.teamId && (m *= 1.5);
t.include([ i.BATTLE_TYPE.ARENA_PK, i.BATTLE_TYPE.PRACTICE ], r.battleType) && (m *= 1.45);
return {
damage: m,
isRecover: u
};
}
if (d.attackType == h.ATK) {
o = a.getDefenceValue();
c = a.hitDmgRate;
} else if (d.attackType == h.MATK) {
o = a.getMagicDefenceValue();
c = a.hitMdmgRate;
} else {
o = a.getDefenceValue();
c = a.hitDmgRate;
}
s.data.ignoreDefRate && (o -= o * s.data.ignoreDefRate);
s.data.isMustHit && c < 1 && (c = 1);
var g = r.isPVP() ? a.level : e.level, p = o - (l = n.math.findOneBy("level", g).expectDef), _ = m * (1 - p / (Math.abs(p) + l));
_ = _ > 0 ? _ : 1;
var k = a.getBuffOne("hitDmgRate");
if (k) {
var f = k.data.extra.ifVal, y = k.data.extra.val + k.growthVal;
f < 0 ? _ / a.maxHp < Math.abs(f) && (c -= y) : _ / a.maxHp > Math.abs(f) && (c -= y);
c = c < 0 ? 0 : c;
}
_ += e.initSkillId == s.kindId ? e.extraInitAtkDmg : 0;
_ += d.initVal + s.level * d.valGrowth;
var b = e.getBuffs("addSkillDmgRate"), v = 0;
for (var S in b) t.include(b[S].data.extra.skillIds, d.kindId) && (v += b[S].data.extra.val / 100);
var T = a.getBuffs("addHitSkillDmgRate"), M = 0;
for (var S in T) t.include(T[S].data.extra.skillIds, d.kindId) && (M += T[S].data.extra.val / 100);
var $ = _ *= 1 + v + M;
_ += e.extraAtkDmg;
_ += a.extraHitDmg;
_ *= c;
_ *= 1 - a.soulHitDmgRate;
var I = e.addDmgRate - a.ignoreAddDmgRate;
I = I < 0 ? 0 : I;
I = (I += e.addDmgRate2 - a.ignoreAddDmgRate2) < 0 ? 0 : I;
I = (I += e.atkDmgRate - a.redHitDmgRate - a.addRecoverHpRedHitDmgRate) < 0 ? 0 : I;
e.initSkillId == s.kindId && (I += e.skill0AddDmgRate);
var C = e.soulAddDmgRate - a.ignoreSoulAddDmgRate;
_ *= I += C = C < 0 ? 0 : C;
var P = s.data.hpPctDmgRate;
if (P) {
var D = 0;
for (var N in P) {
var A = Number(N), L = Number(P[N]);
(A > 0 && a.hpPct > A || A < 0 && a.hpPct < Math.abs(A)) && (D += L);
}
_ += _ * D;
}
g = r.isPVP() ? a.level : e.level;
var E = n.math.findOneBy("level", g).expectCrit, B = .1 * e.crit / (2.1 * E + 200);
B = B < 0 ? 0 : B;
B += s.data.extraCrit / 100;
B += e.extraCritRate;
B += e.critRate;
B -= a.ignoreCritRate;
if (d.hpPctCrit) {
d.hpPctCrit > 0 && a.hpPct > d.hpPctCrit && (B = 1);
d.hpPctCrit < 0 && a.hpPct < Math.abs(d.hpPctCrit) && (B = 1);
}
var w, G, R = !1;
if (r.random() < B) {
_ *= e.critDmgRate + (d.extraCritDmgRate || 0) + e.addCritDmgRate;
R = !0;
}
a.shieldHp > 0 && (_ *= a.shieldHitDmgRate);
if (d.attackType == h.ATK) {
w = a.defShieldHp;
a.reduceSpecialHp("defShieldHp", _);
G = "atk";
} else if (d.attackType == h.MATK) {
w = a.mDefShieldHp;
a.reduceSpecialHp("mDefShieldHp", _);
G = "matk";
}
w > 0 && (_ += _ * e.atkShieldExtDmgRate);
_ = (w -= _) > 0 ? 0 : -w;
w < 0 && (G = null);
var H = a.shieldHp;
a.reduceSpecialHp("shieldHp", _);
_ = (H -= _) > 0 ? 0 : -H;
G || 0 != _ || (G = "all");
var x = _ > 0 ? _ * a.linkDmgRate : 0, K = _ > 0 ? _ * a.deLinkDmgRate : 0;
(_ -= x) <= 0 && !G && (_ = 1);
var F = e.initSkillId == s.kindId ? Math.ceil(_ * e.dmg2HpRate) : 0;
F += e.initSkillId != s.kindId ? Math.ceil(_ * e.skillDmg2HpRate) : 0;
d.dmg2HpRate && (F += Math.ceil(_ * d.dmg2HpRate));
F = (F *= 1 - a.unDmg2HpRate) < 0 ? 0 : F;
e.initSkillId == s.kindId && a.immuneInitDmg && (_ = 0);
_ > 1 && r.random() < a.dmgBe1Rate && (_ = 1);
return {
oldDamage: Math.ceil($),
damage: Math.ceil(_),
linkDmg: x,
deLinkDmg: K,
addHp: F,
isCrit: R,
immuneType: G
};
};
s.calReboundDamage = function(e, a, n, s, o) {
var l = 0;
l += (s = s || n) * a.reboundDmgRate;
n > 1 && (n = (n *= 1 - a.reboundDmgRate) < 0 ? 0 : n);
var c = a.reboundDmgHp;
n = (c -= n) > 0 ? 0 : -c;
c = c < 0 ? 0 : c;
var d = a.reboundDmgHp - c;
l += d;
t.include([ i.BATTLE_TYPE.TAIL, i.BATTLE_TYPE.BOSS, i.BATTLE_TYPE.GUILD_BOSS, i.BATTLE_TYPE.SMAP ], r.battleType) && (l = 0);
a.invincible && !o && (n = 0);
e.invincible && (l = 0);
r.random() < e.missReboundRate && (l = 0);
return {
damage: n,
reboundDmg: l,
addReboundDmg: d
};
};
s.inRange = function(e, a, t) {
var n = e.x - a.x, i = e.y - a.y;
return n * n + i * i <= t * t;
};
s.inRangeX = function(e, a, t) {
var n = e.x - a.x;
return Math.abs(n) <= t;
};
s.inRangeY = function(e, a, t) {
var n = e.y - a.y;
return Math.abs(n) <= t;
};
s.inRangeXHalf = function(e, a, t, n) {
var i = a.x - e.x;
return "left" == n ? i < 0 && i >= -t : "right" == n ? i > 0 && i <= t : void 0;
};
s.distance = function(e, a) {
var t = a.x - e.x, n = a.y - e.y;
return Math.sqrt(t * t + n * n);
};
s.distanceX = function(e, a) {
var t = e.x - a.x;
return Math.abs(t);
};
s.getPos = function(e, a, t) {
var n = s.distance(e, a), i = {};
i.x = a.x - (a.x - e.x) * (t / n);
i.y = a.y - (a.y - e.y) * (t / n);
return i;
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
battleMain: "battleMain",
dataApi: "dataApi",
underscore: "underscore"
} ],
