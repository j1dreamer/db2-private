"battle.area": [ function(e, a) {
"use strict";
cc._RF.push(a, "8d8a4yuWi1ObKyvtNxsPVGp", "battle.area");
var t = e("underscore"), n = e("dataApi"), i = e("battle.consts"), r = e("battle.formula"), s = e("battle.ai"), o = e("battle.actionManager"), l = e("battle.timer"), c = e("battle.team"), d = e("battle.eventManager"), h = e("battleMain"), u = e("battle.fightHandler"), m = e("battle.msgHandler"), g = function(e) {
h.zoneCount = 0;
if (e.smapId) {
this.smapId = Number(e.smapId);
this.showEntityIdsMap = e.showEntityIdsMap;
this.smapData = n.smap.findById(this.smapId);
h.zoneCount = this.smapData.mobZoneCount;
}
this.teams = {};
this.entities = {};
this.diedEntities = {};
this.zoneId = 0;
this.aiManager = s.createManager({
area: this
});
this.actionManager = new o();
this.timer = new l({
area: this,
delay: .05
});
h.battleType == i.BATTLE_TYPE.TAIL ? this.endTime = i.TAIL_END_TIME : t.include([ i.BATTLE_TYPE.BOSS ], h.battleType) ? this.endTime = i.BOSS_END_TIME : t.include([ i.BATTLE_TYPE.GUILD_BOSS ], h.battleType) ? this.endTime = i.GUILD_BOSS_END_TIME : t.include([ i.BATTLE_TYPE.ARENA_PK, i.BATTLE_TYPE.EXPEDITION, i.BATTLE_TYPE.PRACTICE, i.BATTLE_TYPE.PRESTIGE, i.BATTLE_TYPE.BEGIN_BATTLE, i.BATTLE_TYPE.ISLAND ], h.battleType) ? this.endTime = i.PK_END_TIME : this.endTime = i.END_TIME;
this.timeTick(0);
this.isOver = !1;
};
a.exports = g;
var p = g.prototype;
p._clearPassiveBuff = function(e) {
for (var a in this.entities) for (var t in e) this.entities[a].clearBuff(e[t]);
};
p._removeAllSummon = function() {
var e = this.getEntityBy({
isSummon: !0
});
for (var a in e) {
e[a].clearAllBuff();
e[a].reduceHp(999999999999, !0);
}
};
p._checkSummonSurvive = function() {
var e = this.getEntityBy({
isSummon: !0
}), a = {};
for (var n in e) if (0 != e[n].kindId && !t.include([ i.OVER_SKIP_SUMMON_MOB_IDS ], e[n].kindId)) {
var r = e[n].teamId;
a[r] = a[r] || 0;
a[r]++;
}
return t.keys(a).length > 0;
};
p._deadTrigger = function(e) {
for (var a in this.entities) this.entities[a].theyDeadTrigger && this.entities[a].theyDeadTrigger(e);
};
p.start = function() {
for (var e in this.entities) {
this.entities[e].setTargetNearest();
this.entities[e].activatePassive();
}
h.debug.isDelayStart || this.timer.run();
};
p.close = function() {
this.timer.close();
};
p.timeTick = function(e) {
var a = Math.ceil(this.endTime);
if (0 != a) {
if (!this.isOver) {
var n = Math.ceil(this.endTime -= e);
if (n < a || 0 == e) {
var r = {
route: "onTimeTick",
endTime: n
};
m.emit(r.route, r);
}
}
} else {
for (var s, o, l = {
zoneId: this.zoneId,
roles1: [],
roles2: [],
role1Num: 0,
isTimeOut: !0
}, c = 0; c < 5; c++) {
(s = this.getEntityBy({
teamId: 1,
idx: c
})[0]) && s.clearAllBuff();
if (t.include([ i.BATTLE_TYPE.ARENA_PK, i.BATTLE_TYPE.ISLAND ], h.battleType)) {
o = s ? {
hp: s.hp,
maxHp: s.initMaxHp,
mp: s.mp
} : null;
l.roles1.push(o);
} else l.roles1.push(null);
if (h.battleType != i.BATTLE_TYPE.SMAP) {
(s = this.getEntityBy({
teamId: 2,
idx: c
})[0]) && s.clearAllBuff();
o = s ? {
hp: s.hp,
maxHp: s.initMaxHp,
mp: s.mp
} : null;
l.roles2.push(o);
}
}
this.isOver = !0;
u.over(l);
}
};
p.updateSkill = function(e) {
for (var a in this.entities) {
var n = this.entities[a], r = 1 - (1 - n.atkSpeedRate) * (n.atkSpeedRate > 1 ? 1 : .35), s = 1 + n.cdSpeedRate;
if (n.fightSkills) {
n.dizziness && (r *= 1);
if (0 != n.publicCoolDownTime) {
n.publicCoolDownTime -= e * r;
n.publicCoolDownTime = n.publicCoolDownTime < 0 ? 0 : n.publicCoolDownTime;
}
for (var o in n.fightSkills) {
var l = n.fightSkills[o];
if (l.isShaking && 0 != l.shakeDownTime) {
l.shakeDownTime -= n.initSkillId == l.kindId ? e * r : e;
l.shakeDownTime = l.shakeDownTime < 0 ? 0 : l.shakeDownTime;
}
if (0 != l.coolDownTime) {
n.initSkillId == l.kindId ? l.coolDownTime -= e * (r > 2 ? 2 : r) : l.coolDownTime -= e * (s > 2 ? 2 : s);
l.coolDownTime = l.coolDownTime < 0 ? 0 : l.coolDownTime;
0 == l.coolDownTime && l.data.autoClearControl && n.autoClearControl();
if (1 == n.teamId && t.include(i.SHIP_SKILL_IDS, l.kindId) && l.coolDownTime < l.data.initCoolTime) {
var c = {
route: "onUpdateShipSkillCD",
skillId: l.kindId,
coolDownTimePct: 1 - l.coolDownTime / l.data.initCoolTime
};
m.emit(c.route, c);
}
}
}
}
}
};
p.addMobZones = function(a) {
this.zoneId = a;
for (var t = this.smapData["mobZone" + a], n = [], r = 0; r < t.length; r++) {
var s = new (e("battle.mob"))({
kindId: t[r]
});
n.push(s);
if (this.smapData.bmap) {
var o = i.MAP_SKILL_IDS_MAP[this.smapData.bmapId] || [], l = [];
for (var d in o) l.push({
kindId: o[d],
level: s.level
});
var h = i.MAP_SKILL_NEEED_BMAP_NO_MAP[this.smapData.bmapId] || 0;
if (this.smapData.no < h) continue;
s.addFightSkills(l);
}
}
var u = {
playerId: 0,
characters: n,
offset: i.AREA_POSITIONS.WALK_DISTANCE,
positions: i.AREA_POSITIONS.RIGHT,
area: this,
teamId: 2
}, m = new c(u);
m.generateCharacters();
this.teams[u.playerId] = m;
};
p.addTeam = function(e, a, n) {
var r = t.keys(this.teams).length, s = {
playerId: e,
characters: a,
offset: (0 == r ? -1 : 1) * i.AREA_POSITIONS.WALK_DISTANCE,
positions: 0 == r ? i.AREA_POSITIONS.LEFT : i.AREA_POSITIONS.RIGHT,
area: this,
teamId: 0 == r ? 1 : 2
}, o = new c(s);
o.generateCharacters(n);
this.teams[s.playerId] = o;
};
p.addEntity = function(e) {
e.area = this;
this.entities[e.entityId] = e;
d.addEvent(e);
this.aiManager.addCharacters([ e ]);
e.add();
};
p.removeEntity = function(e) {
if (c = this.entities[e]) {
null != c.playerId && this.teams[c.playerId].remove(e);
this.diedEntities[e] = this.entities[e];
delete this.entities[e];
this.timer.abortAllAction(e);
this.aiManager.removeCharacter(e);
if (c.type != i.CHARACTER_TYPE.MISSILE) {
c.clearAllBuff();
this._clearPassiveBuff(c.passiveBuffIds);
c.isSummon || this._deadTrigger(c.teamId);
}
if ("mob" == c.type && this.showEntityIdsMap) {
var a = {
route: "onDrop",
pos: c.getPosition(),
entityIds: this.showEntityIdsMap[c.kindId] || []
};
m.emit(a.route, a);
}
if (!this.isOver && null != c.playerId) for (var t in this.teams) if (0 == this.teams[t].count) {
this.isOver = !0;
this._removeAllSummon();
if (h.battleType == i.BATTLE_TYPE.SMAP) for (var n in this.entities) if (this.entities[n].type == i.CHARACTER_TYPE.ROLE) {
this.entities[n].recoverMp(i.ZONE_WIN_REWARD_MP, !0, !0);
this.entities[n].recoverHp(this.entities[n].maxHp * i.ZONE_WIN_REWARD_HP_PCT / 100, !0, !0);
}
for (var r = {
zoneId: this.zoneId,
roles1: [],
roles2: [],
role1Num: 0,
loserId: 0
}, s = 0; s < 5; s++) {
var o = 0;
if (c = this.getEntityBy({
teamId: 1,
idx: s
})[0]) {
o = c.hpPct / 100;
c.clearAllBuff();
}
var l = c ? {
hp: c.initMaxHp * o,
maxHp: c.initMaxHp,
mp: c.mp
} : null;
r.role1Num += c ? 1 : 0;
r.roles1.push(l);
if (h.battleType != i.BATTLE_TYPE.SMAP) {
var c;
o = 0;
if (c = this.getEntityBy({
teamId: 2,
idx: s
})[0]) {
o = c.hpPct / 100;
c.clearAllBuff();
}
l = c ? {
hp: c.initMaxHp * o,
maxHp: c.initMaxHp,
mp: c.mp
} : null;
r.roles2.push(l);
}
}
r.loserId = t;
u.over(r);
}
}
};
p.getEntity = function(e) {
return this.entities[e] || null;
};
p.getEntityBy = function(e) {
var a = function(e, a) {
for (var t in e) if (a[t] != e[t]) return !1;
return !0;
}, t = [];
for (var n in this.entities) a(e, this.entities[n]) && t.push(this.entities[n]);
return t;
};
p.getEiedEntityBy = function(e) {
var a = function(e, a) {
for (var t in e) if (a[t] != e[t]) return !1;
return !0;
}, t = [];
for (var n in this.diedEntities) a(e, this.diedEntities[n]) && t.push(this.diedEntities[n]);
return t;
};
p.getEntitiesByPos = function(e) {
var a, t = [];
for (var n in this.entities) if (!((a = this.entities[n]).teamId != e.teamId || e.skipAttr && a[e.skipAttr])) {
e.isLine && r.inRangeXHalf(e.pos, a, e.range, e.direction) && t.push(this.entities[n]);
!e.isLine && r.inRange(e.pos, a, e.range) && t.push(this.entities[n]);
if (t.length == e.targetCount) break;
}
return t;
};
p.getEntitiesByXRange = function(e, a, t) {
var n, i = [];
for (var s in this.entities) (n = this.entities[s]).teamId == a && r.inRangeX(e, n, t) && i.push(this.entities[s]);
return i;
};
p.getEntityEst = function(e, a, t, n, i) {
var r, s, o, l = null;
n = n || {};
for (var c in this.entities) if ((r = this.entities[c]).teamId == e && !n[r.entityId] && (i || !r.invincible) && !r.isShip && !r.isSummon) {
o = r[t];
l = null == l ? o : l;
s = s || r;
if ("min" == a && o < l) {
l = o;
s = r;
} else if ("max" == a && o > l) {
l = o;
s = r;
}
}
return s;
};
p.getEntityRandom = function(e) {
var a, t = [];
for (var n in this.entities) (a = this.entities[n]).teamId == e && t.push(a);
return t[h.randomRange(0, t.length - 1)];
};
p.getEntityDistanceEst = function(e, a, t, n) {
var i, s, o, l;
t = t || {};
for (var c in this.entities) if ((i = this.entities[c]).teamId == e && !t[i.entityId] && !i.invincible && !i.isShip) {
l = r.distance(a, i);
o = o || l;
s = s || i;
if ("min" == n && l < o) {
o = l;
s = i;
} else if ("max" == n && l > o) {
o = l;
s = i;
}
}
return s;
};
p.getNearestEmpty = function(e) {
var a = {
pos: e,
teamId: e.teamId,
range: 90,
skipAttr: "isSummon"
}, t = this.getEntitiesByPos(a), n = e.getPosition();
if (t.length > 1) for (var s = 0; s < t.length; s++) if (t[s] != e && 5 != t[s].idx && r.inRangeY(t[s], e, 90) && r.inRangeX(t[s], e, 60)) if (e.y > t[s].y) {
n.y += 10;
n.y = n.y > i.AREA_POSITIONS.Y_TOP ? i.AREA_POSITIONS.Y_TOP : n.y;
} else {
n.y -= 10;
n.y = n.y < i.AREA_POSITIONS.Y_BOTTOM ? i.AREA_POSITIONS.Y_BOTTOM : n.y;
}
return n;
};
p.getEntityBySkillId = function(e, a) {
var t;
for (var n in this.entities) if ((t = this.entities[n]).teamId == e && t.fightSkills[a]) return t;
return null;
};
cc._RF.pop();
}, {
"battle.actionManager": "battle.actionManager",
"battle.ai": "battle.ai",
"battle.consts": "battle.consts",
"battle.eventManager": "battle.eventManager",
"battle.fightHandler": "battle.fightHandler",
"battle.formula": "battle.formula",
"battle.mob": "battle.mob",
"battle.msgHandler": "battle.msgHandler",
"battle.team": "battle.team",
"battle.timer": "battle.timer",
battleMain: "battleMain",
dataApi: "dataApi",
underscore: "underscore"
} ],
