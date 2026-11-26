"battle.fightHandler": [ function(e, a) {
"use strict";
cc._RF.push(a, "728c96EpolC/azyxE7rlUiv", "battle.fightHandler");
var t = e("underscore"), n = e("battle.util"), i = e("battle.scheduler"), r = e("battle.consts"), s = e("battleMain"), o = {
area: null,
zoneId: null,
smapId: null,
team: null,
showEntityIdsMap: null,
_zoneBattle: function(a) {
e("battle.entity").id = 1;
e("battle.buff").id = 1;
s.damageMap = {};
i.clearAllTimeout();
this.zoneId = a;
for (var t = e("battle.role"), n = [], r = 0; r < this.team.roles.length; r++) {
var o = new t(this.team.roles[r]);
n.push(o);
}
var l = [];
for (r = 0; r < this.team.ships.length; r++) l.push(this.team.ships[r].skill);
l = l.concat(this.team.skills);
var c = new (e("battle.area"))({
smapId: this.smapId,
showEntityIdsMap: this.showEntityIdsMap
});
this.area = c;
c.addTeam(this.team.playerId, n, l);
c.addMobZones(a);
s.isInstant ? c.start() : _setTimeout(function() {
c.start();
}, 0);
},
useSkill: function(e, a) {
var t = this.area.getEntityBySkillId(e, a);
if (t) {
if (t.usedSkillIdMap[a]) return;
t.damageInterrupted = !1;
t.curSkillId != a && t.interruptSkill();
t.publicCoolDownTime = 0;
t.setCurSkill(a, !0);
t.fightSkills[a].data.autoClearControl && t.autoClearControl();
t.isReAttack = !0;
this.area.timer.run();
}
},
smapBattle: function(e, a, t) {
this.team = n.clone(e);
this.smapId = a;
this.showEntityIdsMap = t;
this._zoneBattle(1);
},
smapBattleNext: function() {
this._zoneBattle(this.zoneId + 1);
},
pkBattle: function(a, t) {
e("battle.entity").id = 1;
e("battle.buff").id = 1;
i.clearAllTimeout();
this.team1 = n.clone(a);
this.team2 = n.clone(t);
for (var r = e("battle.role"), o = [], l = [], c = 0; c < this.team1.roles.length; c++) {
var d = new r(this.team1.roles[c]);
o.push(d);
}
var h = [];
for (c = 0; c < this.team1.ships.length; c++) h.push(this.team1.ships[c].skill);
h = h.concat(this.team1.skills || []);
for (c = 0; c < this.team2.roles.length; c++) {
d = new r(this.team2.roles[c]);
l.push(d);
}
var u = [];
for (c = 0; c < this.team2.ships.length; c++) u.push(this.team2.ships[c].skill);
u = u.concat(this.team2.skills || []);
var m = new (e("battle.area"))({
kindId: this.smapId,
showEntityIdsMap: this.showEntityIdsMap
});
this.area = m;
m.addTeam(this.team1.playerId + "_1", o, h);
m.addTeam(this.team2.playerId + "_2", l, u);
s.isInstant ? m.start() : _setTimeout(function() {
m.start();
}, 0);
},
over: function(a) {
var n, i = e("battle.msgHandler");
switch (s.battleType) {
case r.BATTLE_TYPE.SMAP:
n = {
route: "onOver",
zoneId: a.zoneId,
isWin: !a.isTimeOut && a.loserId != this.team.playerId,
star: 0,
repeatable: this.area.smapData.repeatable,
isTimeOut: a.isTimeOut
};
if (a.zoneId == s.zoneCount) {
switch (s.rolesCount - a.role1Num) {
case 0:
n.star = 3;
break;

case 1:
n.star = 2;
break;

case 2:
case 3:
case 4:
n.star = 1;
}
n.star = n.isWin ? n.star : 0;
} else {
for (var o = [], l = 0; l < 5; l++) if (d = a.roles1[l]) {
for (var c in d) this.team.roles[l][c] = d[c];
o.push(this.team.roles[l]);
}
this.team.roles = o;
}
s.isWin = n.isWin;
break;

case r.BATTLE_TYPE.ARENA_PK:
case r.BATTLE_TYPE.EXPEDITION:
case r.BATTLE_TYPE.TAIL:
case r.BATTLE_TYPE.PRACTICE:
case r.BATTLE_TYPE.BOSS:
case r.BATTLE_TYPE.GUILD_BOSS:
case r.BATTLE_TYPE.PRESTIGE:
case r.BATTLE_TYPE.BEGIN_BATTLE:
case r.BATTLE_TYPE.ISLAND:
case r.BATTLE_TYPE.TIME_PEAK:
n = {
route: "onOver",
isWin: !a.isTimeOut && a.loserId != this.team1.playerId + "_1",
isTimeOut: a.isTimeOut
};
s.isWin = n.isWin;
n.star = n.isWin ? 3 : 0;
var d, h = [], u = [];
s.diedNum = 5;
for (l = 0; l < 5; l++) {
if (d = a.roles1[l]) {
for (var c in d) this.team1.roles[l][c] = d[c];
h.push(this.team1.roles[l]);
s.diedNum--;
} else if (this.team1.roles[l]) {
this.team1.roles[l].hp = 0;
this.team1.roles[l].mp = 0;
h.push(this.team1.roles[l]);
}
if (d = a.roles2[l]) {
for (var c in d) this.team2.roles[l][c] = d[c];
u.push(this.team2.roles[l]);
} else if (this.team2.roles[l]) {
this.team2.roles[l].hp = 0;
this.team2.roles[l].mp = 0;
u.push(this.team2.roles[l]);
}
}
if (t.include([ r.BATTLE_TYPE.ARENA_PK, r.BATTLE_TYPE.ISLAND ], s.battleType) && a.isTimeOut) {
var m = 0, g = t.filter(h, function(e) {
if (!e) return !1;
m += e.hp > 0 ? e.hp / e.maxHp : 0;
return e.hp > 0;
}), p = 0, _ = t.filter(u, function(e) {
if (!e) return !1;
p += e.hp > 0 ? e.hp / e.maxHp : 0;
return e.hp > 0;
});
g.length > _.length ? s.isWin = !0 : g.length < _.length ? s.isWin = !1 : s.isWin = m > p;
}
n.isWin = s.isWin;
this.team1.roles = h;
this.team2.roles = u;
}
this.area.close();
i.emit(n.route, n);
}
};
a.exports = o;
cc._RF.pop();
}, {
"battle.area": "battle.area",
"battle.buff": "battle.buff",
"battle.consts": "battle.consts",
"battle.entity": "battle.entity",
"battle.msgHandler": "battle.msgHandler",
"battle.role": "battle.role",
"battle.scheduler": "battle.scheduler",
"battle.util": "battle.util",
battleMain: "battleMain",
underscore: "underscore"
} ],
