serverConfig: [ function(e, t) {
"use strict";
cc._RF.push(t, "b803bl3SKFDW4aaFD8yVUpb", "serverConfig");
var a = e("dataApi"), i = e("underscore"), n = e("underscore.string"), s = e("i18n"), r = e("cryptoApi"), o = e, l = {
DEBUG: !1,
MSG_CRYPTO: !1,
CONSTS: {
A_DAY: 864e5,
UPDATE_TYPE: {
ADD: 1,
REDUCE: 2,
MODIFY: 3
},
ENTITY_TYPE: {
ROLE: "role",
GEM: "gem",
COIN: "coin",
FRAGMENT: "fragment",
MONEY: "money",
SOUL: "soul",
STONE: "stone",
ARTIFACT: "artifact",
ARTIFACT_FRAGMENT: "artifactFragment",
TREASURE: "treasure",
CONSUMABLES: "consumables",
SHIP: "ship",
SHIP_FRAGMENT: "shipFragment",
BOX: "box",
TITLE: "title",
CHAT_SKIN: "chatSkin",
CAPSULE: "capsule",
FRUIT: "fruit",
FRUIT_FRAGMENT: "fruitFragment",
FRAME: "frame",
STAR_SIGN: "starSign"
},
REPORT_EXPIRE_TIME: 6048e5,
ENTITY_LOG_EXPIRE_TIME: 2592e5,
ROBOT_COUNT: 1e4,
ENTITY_ID: {
VIP_EXP: 98,
AP: 99,
EXP: 100,
COIN: 101,
GEM: 102,
ARENA_COIN: 103,
EXPEDITION_COIN: 105,
ARENA_3V3_COIN: 106,
GUILD_COIN: 107,
VIP_COIN: 112,
PRESTIGE_COIN: 115,
SIX_COIN: 116,
RANDOM_BOX: 351,
TOP_ARENA_3V3_COIN: 97,
STAR_SIGN_COIN: 61002
},
SHARE_TABLE_ID: {
SYS_MAIL: 1,
PRESTIGE_BATTLE: 2,
WORSHIP_BATTLE: 3,
WORLD_BOSS_BATTLE: 4,
ALL_SERVER_BATTLE: 5,
NEW_GUILD_BATTLE: 6,
TEAM_BATTLE: 7,
GUILD_BOSS_BATTLE: 8,
DOUBLE_BATTLE_1: 9,
DOUBLE_BATTLE_2: 10,
DOUBLE_BATTLE_3: 11,
DOUBLE_BATTLE_4: 12,
DOUBLE_BATTLE_5: 13,
ISLAND: 14,
TOP_ARENA_3V3: 15,
ACTIVITY_GUILD_BATTLE: 16
},
TEST_SERVER_ID: 9999
},
FUNS: {
reqMsgFilter: function(e) {
if (l.MSG_CRYPTO) {
var t = i.values(e)[0], a = t.slice(0, 32), n = t.slice(32, e.length);
r.password = a;
n = JSON.parse(r.decrypt(n, !0));
i.extend(e, n);
}
},
resMsgFilter: function(e) {
if (l.MSG_CRYPTO) {
r.genPassword(String(Date.now()));
var t = r.encrypt(String(Date.now())), a = r.password;
a += r.encrypt(JSON.stringify(e));
for (var i in e) delete e[i];
e[t] = a;
}
},
getMonthLastTime: function() {
var e = new Date();
e.setMonth(e.getMonth() + 1, 0);
e.setHours(23, 59, 59, 0);
return e.getTime();
},
isNextDay: function(e) {
var t = new Date(Date._now ? Date._now() : Date.now()), a = new Date(e);
return t.getDate() != a.getDate() || t.getMonth() != a.getMonth() || t.getFullYear() != a.getFullYear();
},
isNextMonth: function(e) {
var t = new Date(), a = new Date(e);
return t.getMonth() != a.getMonth() || t.getFullYear() != a.getFullYear();
},
isNextWeek: function(e) {
var t = new Date();
return e < new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0) - 864e5 * (0 == t.getDay() ? 6 : t.getDay() - 1);
},
getNowDays: function() {
return Math.floor((new Date() - new Date("2019-01-01 00:00:00")) / 864e5);
},
getEntityName: function(e) {
return a.findEntityById(e).kindName;
},
randomByWeight: function(e) {
var t = 0;
for (var a in e) t += e[a].weight;
var i = Math.ceil(Math.random() * t);
for (var a in e) {
var n = e[a];
if ((i -= n.weight) <= 0) return n;
}
return null;
},
getValueByBetween: function(e, t, a) {
for (var i = 0, n = 0; n < e.length; n++) a >= e[n] && (i = n);
return t[i];
},
genUpdate: function(e, t, a) {
var n = e.team, s = e.bag, r = e.task, o = {}, l = {};
for (var c in n.roles) if (n.roles[c]._needSync) {
l[c] = n.roles[c].toJson();
n.roles[c]._needSync = !1;
}
var d = {};
if (s._needSyncIdxs) {
for (var c in s._needSyncIdxs) {
var p = s._needSyncIdxs[c];
d[p] = s.getExt(p) || null;
}
s._needSyncIdxs = null;
}
i.keys(l).length > 0 && (o.team = {
roles: l,
friendshipAttr: n.friendshipAttr
});
i.keys(d).length > 0 && (o.bag = {
items: d,
lastIdx: s.lastIdx
});
if (r._needInitTeamInfo) {
e.task.initTeamInfo();
r._needInitTeamInfo = !1;
}
if (r._needInitBagInfo) {
e.task.initBagInfo();
r._needInitBagInfo = !1;
}
var _ = e.getAttrStrMap(a);
for (var m in _) if (void 0 !== t[m]) {
if (i.include([ "vip", "shop", "task", "activity" ], m)) for (var u in _[m]) if (void 0 !== t[m][u]) {
if ("object" == typeof _[m][u]) {
for (var h in _[m][u]) if (t[m][u] && (void 0 === t[m][u][h] || t[m][u][h] != _[m][u][h])) {
o[m] = o[m] || {};
o[m][u] = o[m][u] || {};
try {
o[m][u][h] = JSON.parse(_[m][u][h]);
} catch (e) {
o[m][u][h] = _[m][u][h];
}
}
} else if (t[m][u] != _[m][u]) {
o[m] = o[m] || {};
try {
o[m][u] = JSON.parse(_[m][u]);
} catch (e) {
o[m][u] = _[m][u];
}
}
} else {
o[m] = o[m] || {};
o[m][u] = _[m][u];
} else if (t[m] != _[m]) try {
o[m] = JSON.parse(_[m]);
} catch (e) {
o[m] = _[m];
}
} else o[m] = _[m];
return o;
},
genUpdateEntityCountMap: function(e, t) {
var a = i.unique(i.keys(e).concat(i.keys(t))), n = {};
for (var s in a) {
var r = a[s], o = t[r] ? t[r] : 0, l = e[r] ? e[r] : 0;
n[r] = o - l;
0 == n[r] && delete n[r];
}
return n;
},
getNumberList: function(e) {
return i.map(e, function(e) {
return Number(e);
});
},
addExperience: function(e, t, i, n, s) {
var r = function(e, t) {
return "shipExp" == t ? a.findExperienceByLevel(100 * (e.star - 1) + e.level)[t] : a.findExperienceByLevel(e.level)[t];
};
e.experience += t;
if (e.experience >= e.nextLevelExp && e.level < i) {
(function(e, t, a) {
for (;e.experience >= e.nextLevelExp; ) {
if (e.level < t) {
e.level += 1;
e.experience -= e.nextLevelExp;
s && s();
}
e.nextLevelExp = r(e, a);
if (e.level == t) break;
}
})(e, i, n);
return !0;
}
return !1;
}
},
MAIL: {
CONSTS: {
SYSTEM_NAME: s.a("系统消息"),
SYSTEM_ID: 9999999999,
NEW_MAIL_EXPIRE_TIME: 6048e5,
STATUS: {
UNREAD: 1,
READ: 2,
DELETE: 3
}
}
},
CREATE_PLAYER: {
CONSTS: {
COIN: 0,
GEM: 50,
ACTION_POINT_MAX: 60,
SKILL_POINT_MAX: 10,
INIT_ROLE_ID: 100101
}
},
PLAYER: {
CONSTS: {
MAX_LEVEL: 100,
ACTION_POINT_RECOVER_TIME: 3e5,
SKILL_POINT_RECOVER_TIME: 3e5,
RESET_HOURS: 0,
RE_NAME_COST_GEM: 100,
BUY_ACTION_POINT: 120,
BUY_SKILL_COST_GEMS: [ 0, 10, 20, 20, 20, 40, 40, 40, 40, 40, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 200 ],
BUY_SKILL_POINT: 10,
SEND_ALL_SERVER_NEED_VIP: 6,
SEND_ALL_SERVER_NEED_LEVEL: 50,
JOB_TYPE: {
FIRE: 1,
WIND: 2,
THUNDER: 3,
SOIL: 4,
WATER: 5,
OTHER: 6
},
CHAT_TYPE: {
WORLD: 1,
GUILD: 2,
ALL_SERVER: 3
}
},
FUNS: {
isDailyResetTime: function(e) {
var t, a = new Date(e), i = new Date(e + 864e5), n = new Date();
t = new Date(a.getFullYear(), a.getMonth(), a.getDate(), l.PLAYER.CONSTS.RESET_HOURS, 0, 0);
return a < t && n > t || a < (t = new Date(i.getFullYear(), i.getMonth(), i.getDate(), l.PLAYER.CONSTS.RESET_HOURS, 0, 0)) && n > t;
},
getActionPointMax: function(e) {
return l.CREATE_PLAYER.CONSTS.ACTION_POINT_MAX + e;
},
isRobot: function(e) {
return e <= l.CONSTS.ROBOT_COUNT;
},
filter2Battle: function(e) {
var t = l.EQUIPMENTS.CONSTS.EVL_ITEM_TYPES;
if (e.roles) for (var a in e.roles) {
for (var i in t) delete e.roles[a].equipments[t[i]];
delete e.roles[a].initAttr;
delete e.roles[a].equipmentsAttr;
}
if (e.rolesMap) for (var n in e.rolesMap) for (var a in e.rolesMap[n]) {
for (var i in t) delete e.rolesMap[n][a].equipments[t[i]];
delete e.rolesMap[n][a].initAttr;
delete e.rolesMap[n][a].equipmentsAttr;
}
return e;
},
filter2Show: function(e) {
var t = [ "kindId", "star", "level", "awakeLevel", "equipments", "trainLevelMap", "evolveSkillIds", "soulLevelMap" ];
if (e.roles) for (var a in e.roles) for (var n in e.roles[a]) i.include(t, n) || delete e.roles[a][n];
if (e.rolesMap) for (var s in e.rolesMap) for (var a in e.rolesMap[s]) for (var n in e.rolesMap[s][a]) i.include(t, n) || delete e.rolesMap[s][a][n];
return e;
},
getBuyActionPointCost: function(e) {
var t = [ 0, 50, 50, 50, 100, 100, 100, 200, 200, 200, 400 ];
return t[e] || t[t.length - 1];
},
getBuyCoinCost: function(e) {
var t = [ 0, 10, 20, 20, 20, 40, 40, 40, 40, 40, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 200 ];
return t[e] || t[t.length - 1];
},
getBuyCoinUnit: function(e, t) {
return Math.floor((3e4 + 100 * e) * Math.pow(t, .35) / 2.23);
},
getBuyCoin: function(e, t) {
var a = 1, i = Math.random();
i <= .001 ? a = 10 : i <= .011 ? a = 5 : i <= .061 ? a = 3 : i <= .211 && (a = 2);
return {
coin: l.PLAYER.FUNS.getBuyCoinUnit(e, t) * a,
ratio: a
};
},
getBuySkillPointCost: function(e) {
var t = l.PLAYER.CONSTS.BUY_SKILL_COST_GEMS;
return t[e] || t[t.length - 1];
},
getUpgradeIncreaseActionPoint: function(e) {
var t = 0;
e <= 7 ? t = 20 : e <= 11 ? t = 30 : e <= 20 ? t = 40 : e <= 30 ? t = 60 : e <= 40 ? t = 80 : e <= 50 ? t = 100 : t <= 100 && (t = 120);
return t;
}
}
},
ROLE: {
CONSTS: {
COLOR_NAME: {
1: s.a("白"),
2: s.a("绿"),
3: s.a("绿+1"),
4: s.a("蓝"),
5: s.a("蓝+1"),
6: s.a("蓝+2"),
7: s.a("紫"),
8: s.a("紫+1"),
9: s.a("紫+2"),
10: s.a("紫+3"),
11: s.a("紫+4"),
12: s.a("橙"),
13: s.a("橙+1"),
14: s.a("橙+2"),
15: s.a("红"),
16: s.a("红+1"),
17: s.a("红+2"),
18: s.a("黑"),
19: s.a("黑+1"),
20: s.a("黑+2")
},
STAR_GROWTH: {
1: 1,
2: 1.25,
3: 1.5,
4: 1.75,
5: 2,
6: 2.25,
7: 2.5,
8: 2.75,
9: 3,
10: 3.25,
11: 3.5,
12: 3.75,
13: 4,
14: 4.25,
15: 4.5,
16: 4.75,
17: 5,
18: 5.25,
19: 5.5,
20: 5.75
},
AWAKE_GROWTH: {
0: 0,
1: .1,
2: .2,
3: .3,
4: .4,
5: .5,
6: .6,
7: .7,
8: .8,
9: .9,
10: 1,
11: 1.1,
12: 1.2,
13: 1.3,
14: 1.4,
15: 1.5,
16: 1.6,
17: 1.7,
18: 1.8,
19: 1.9,
20: 2
},
EQUIVALENT_SOULS: [ 0, 10, 30, 60, 100, 150 ],
MAX_STAR: 5,
MAX_AWAKE_LEVEL: 10,
FRIENDSHIP_TYPE: {
HP: 1,
ATK: 2,
DEF: 3,
MDEF: 4
},
AWAKE_NEED_STAR: 20,
AWAKE_NEED_GROUP: 4,
UPGRADE_AWAKE_LEVEL_RATE: .7,
UPGRADE_AWAKE_LEVEL_INCREASE_RATE: .1,
UPGRADE_AWAKE_LEVEL_INCREASE_RATE_COST_GEMS: [ 0, 300, 600, 900 ],
EVOLVE_COLOR_NEED_STAR_MAP: {
15: 10,
18: 15
},
MAX_SKILL_LEVEL: 100,
GROUP_2_MAX_STAR: 15,
RESET_COST_GEM: 200,
TRAIN_ATTR_ITEM_MAP: {
1: {
addDmgRate: .2
},
2: {
addCritDmgRate: .3
},
3: {
addMpRecoverRate: .1
},
4: {
ignoreAddDmgRate: .2
},
5: {
ignoreCritRate: .15
},
6: {
seconds5LostHp2HpRate: .1
},
7: {
addHitRate: .15
},
8: {
addHpRecoverRate: .1
},
9: {
addAtkSpeedRate: .2
}
},
TRAIN_ITEM_IDS_MAP: {
1: [ 1, 3, 2 ],
2: [ 5, 4, 6 ],
3: [ 2, 8, 7 ],
4: [ 1, 3, 6 ],
5: [ 9, 8, 2 ],
6: [ 4, 7, 5 ],
7: [ 2, 3, 9 ],
8: [ 8, 7, 5 ],
9: [ 4, 1, 6 ],
10: [ 7, 1, 9 ],
11: [ 1, 3, 2 ],
12: [ 5, 4, 6 ],
13: [ 2, 8, 7 ],
14: [ 1, 3, 6 ],
15: [ 9, 8, 2 ]
},
TRAIN_UNLOCK_COST: {
ID: 86,
COUNT: 100
},
TRAIN_COST: {
SOUL: 60,
GEM: 600,
COIN: 3e6,
STONE: {
ID: 87,
COUNT: 100
}
},
RESET_TRAIN_COST_GEM: 500,
EVOLVE_SKILL_NO_LEVEL_MAP: {
1: 100,
2: 100,
3: 100,
4: 100
},
EVOLVE_SKILL_RATE: .7,
EVOLVE_SKILL_INCREASE_RATE: .1,
EVOLVE_SKILL_INCREASE_RATE_COST_GEMS: [ 0, 300, 600, 900 ],
SOUL_TYPE_ATTR_ITEM_MAP: {
1: {
soulHitDmgRate: [ 0, .025, .05, .075, .1, .125, .15, .175, .2, .225, .25 ]
},
2: {
atkSpeedRate: [ 0, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5 ]
},
3: {
soulMaxHpRate: [ 0, .03, .06, .09, .12, .15, .18, .21, .24, .27, .3 ]
},
4: {
addMpRecoverRate: [ 0, .025, .05, .075, .1, .125, .15, .175, .2, .225, .25 ]
},
5: {
ignoreCritRate: [ 0, .03, .06, .09, .12, .15, .18, .21, .24, .27, .3 ]
},
6: {
soulAddDmgRate: [ 0, .04, .08, .12, .16, .2, .24, .28, .32, .36, .4 ]
},
7: {
unDeBuffRate: [ 0, .04, .08, .12, .16, .2, .24, .28, .32, .36, .4 ]
},
8: {
ignoreSoulAddDmgRate: [ 0, .04, .08, .12, .16, .2, .24, .28, .32, .36, .4 ]
},
9: {
dodgeRate: [ 0, .02, .04, .06, .08, .1, .12, .14, .16, .18, .2 ]
},
10: {
addCritDmgRate: [ 0, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5 ]
}
},
SOUL_TYPE_SP_ATTR_ITEM_MAP: {
1: {
soulHitDmgRate: [ 0, .03, .06, .09, .12, .15, .18, .21, .24, .27, .3 ]
},
2: {
atkSpeedRate: [ 0, .06, .12, .18, .24, .3, .36, .42, .48, .54, .6 ]
},
3: {
soulMaxHpRate: [ 0, .04, .08, .12, .16, .2, .24, .28, .32, .36, .4 ]
},
4: {
addMpRecoverRate: [ 0, .03, .06, .09, .12, .15, .18, .21, .24, .27, .3 ]
},
5: {
ignoreCritRate: [ 0, .04, .08, .12, .16, .2, .24, .28, .32, .36, .4 ]
},
6: {
soulAddDmgRate: [ 0, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5 ]
},
7: {
unDeBuffRate: [ 0, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5 ]
},
8: {
ignoreSoulAddDmgRate: [ 0, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5 ]
},
9: {
dodgeRate: [ 0, .025, .05, .075, .1, .125, .15, .175, .2, .225, .25 ]
},
10: {
addCritDmgRate: [ 0, .06, .12, .18, .24, .3, .36, .42, .48, .54, .6 ]
}
}
},
FUNS: {
getMaxLevel: function(e, t, a) {
a = a > 10 ? 10 : a;
return e <= 10 ? e + 5 : e < 20 ? 20 : e <= 80 ? e : l.FUNS.getValueByBetween([ 0, 16, 17, 18, 19, 20, 26, 27, 28, 29, 30 ], [ 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200 ], t + a);
},
getPower: function(e, t, a) {
var i = .1 * e.hp + e.atk + e.def + e.mdef;
i += 2 * (e.hit || 0);
i += 2 * (e.dodge || 0);
i += 2 * (e.crit || 0);
i += 30 * t;
i += 6e3 * (e.unDizzinessRate || 0);
i += 8e3 * (e.critRate || 0);
i += 6e3 * (e.dmg2HpRate || 0);
i += 7e3 * (e.dodgeRate || 0);
i += 3500 * (e.atkSpeedRate || 0);
i += 10 * (e.keepMp || 0);
i += .1 * (e.reboundDmgHp || 0);
i += 3e3 * (e.skillDmg2HpRate || 0);
i += 3e3 * (e.unConfusedRate || 0);
i += 2e4 * (e.hitReduceMpRate || 0);
i += 15e3 * (e.hitRepeledRate || 0);
i += 7500 * (e.hitReduceAtkSpeedRate || 0);
i += 7500 * (e.hitReduceRecoverHpRate || 0);
i += 15e3 * (e.hitRateSilence || 0);
i += 2100 * (e.missReboundTeamRate || 0);
i += 1500 * (e.missReboundRate || 0);
i += 3e3 * (e.atkIgnoreDodgeRate || 0);
i += 3e3 * (e.unDeBuffRate || 0);
i += 3e3 * (e.hitMaxHpRate ? 1 - e.hitMaxHpRate : 0);
i += 500 * (e.recoverMp1Sec || 0);
i += 1e4 * (e.redHitDmgRate || 0);
i += 12e3 * (e.incHpRate || 0);
i += 12e3 * (e.incAtkRate || 0);
i += 12e3 * (e.addDmgRate2 || 0);
i += 12e3 * (e.ignoreAddDmgRate2 || 0);
i += 12e3 * (e.beginMaxHpRateShield || 0);
i += 6e3 * (e.atkShieldExtDmgRate || 0);
i += 1e4 * (e.hitReduceRecoverHp || 0);
i += 1e4 * (e.reviveAddDmgRate || 0);
i += 1e4 * (e.beginHitDmgRate || 0);
i += 1e4 * (e.beginHitMdmgRate || 0);
i += 6e3 * (e.hitReduceAtkSpeed || 0);
i += 1e4 * (e.hitUnReviveRate || 0);
i += 30 * (e.hitReduceMp || 0);
i += 15e3 * (e.hitRepeledRate2 || 0);
i += 1e5 * (e.hitBleedingHpRate || 0);
i += 5e4 * (e.recoverHp10SecRate2 || 0);
i += 8e3 * (e.skill0AddDmgRate || 0);
i += 1e4 * (e.beginRecoverFullMpRate || 0);
i += 300 * (e.removeDeBuffSec ? 20 - e.removeDeBuffSec : 0);
i += 3e4 * (e.hitUnRecoverHpRate || 0);
i += 15e3 * (e.reboundDmgRate || 0);
i += 1e4 * (e.beginAddDmgRate || 0);
i += 3e4 * (e.addRecoverHpRedHitDmgRate || 0);
i += 3e4 * (e.hitUnRecoverMpRate || 0);
i += 7e3 * (e.ignoreUnDeBuffRate || 0);
i += 7e3 * (e.privateUnConfusedRate || 0);
i += 1e4 * (e.hitRate || 0);
i += 3e3 * (e.addCritDmgRate || 0);
i += 3e3 * (e.ignoreCritRate || 0);
i += 3e3 * (e.addHpRecoverRate || 0);
i += 3e3 * (e.unDmg2HpRate || 0);
i += 3e3 * (e.skipHitRate || 0);
i += 3500 * (e.cdSpeedRate || 0);
i += 2e4 * (e.hitClearMpRate || 0);
return (i += 3e3 * (e.reducePctDmgRate || 0)) + 5e3 * a;
},
getUpgradeCost: function(e) {
return {
coin: [ 0, 35e3, 12e4, 3e5, 8e5, 1e6, 1e6, 1e6, 1e6, 1e6, 3e6, 3e6, 3e6, 3e6, 3e6, 5e6, 5e6, 5e6, 5e6, 5e6 ][e],
soul: [ 0, 20, 30, 40, 50, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 150, 120, 150, 120, 150 ][e],
gem: [ 0, 0, 0, 0, 0, 500, 500, 500, 500, 500, 800, 800, 800, 800, 800, 1200, 1200, 1200, 1200, 1200 ][e],
isSelf: !![ 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 ][e]
};
},
getEquivalentSoulNumber: function(e) {
return l.ROLE.CONSTS.EQUIVALENT_SOULS[e] || 0;
},
getComposeRoleCost: function(e) {
return {
coin: [ 0, 1e3, 35e3, 12e4 ][e],
soul: [ 0, 10, 30, 60 ][e]
};
},
getStarKind: function(e) {
var t = e - 5, a = e - 10, i = e - 15;
return {
star: e > 5 ? 5 : e,
moon: t = (t = t < 0 ? 0 : t) > 5 ? 5 : t,
sun: a = (a = a < 0 ? 0 : a) > 5 ? 5 : a,
shen: i = i < 0 ? 0 : i
};
},
getAwakeKind: function(e) {
var t = e - 5, a = e - 10, i = e - 15;
return {
green: e > 5 ? 5 : e,
blue: t = (t = t < 0 ? 0 : t) > 5 ? 5 : t,
purple: a = (a = a < 0 ? 0 : a) > 5 ? 5 : a,
orange: i = i < 0 ? 0 : i
};
},
getMaxLevelNeedExp: function(e, t) {
for (var i = e.nextLevelExp - e.experience, n = l.ROLE.FUNS.getMaxLevel(t, e.star, e.awakeLevel), s = e.level + 1; s <= n; s++) i += a.findExperienceByLevel(s).roleExp;
return i;
},
getAwakeCost: function(e) {
var t = 5e6;
e > 10 && (t = 1e7);
return {
coin: t,
soul: [ 90, 90, 90, 90, 90, 120, 120, 120, 120, 120, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160 ][e]
};
},
getBreakAttr: function(e) {
var t = l.ROLE.FUNS.getStarKind(e), a = [ 0, .02, .04, .06, .08, .1 ], i = [ 0, .02, .04, .06, .08, .1 ], n = [ 0, .01, .02, .03, .04, .05 ];
return {
atkSpeedRate: a[t.moon],
unDeBuffRate: i[t.sun],
skipHitRate: n[t.shen],
unlockAtkSpeedRate: a[1],
unlockUnDeBuffRate: i[1],
unlockSkipHitRate: n[1]
};
},
getSoulMaxLevel: function(e, t, a) {
if (t < 50 || a < 3) return 0;
var i = l.ROLE.FUNS.getStarKind(a);
switch (e) {
case 1:
if (5 == i.moon) return 10;
if (5 == i.star) return 6;
break;

case 2:
if (5 == i.moon) return 10;
if (5 == i.star) return 6;
if (i.star < 4) return 0;
break;

case 3:
case 4:
if (5 == i.sun) return 10;
if (5 == i.moon) return 6;
if (i.star < 5) return 0;
break;

case 5:
case 6:
if (i.shen >= 1) return 10;
if (5 == i.sun) return 6;
if (i.moon < 5) return 0;
break;

case 7:
case 8:
case 9:
if (i.shen >= 2) return 10;
if (1 == i.shen) return 6;
if (i.sun < 5) return 0;
}
return 3;
},
getSoulAttr: function(e, t, a) {
var n = a ? l.ROLE.CONSTS.SOUL_TYPE_SP_ATTR_ITEM_MAP[e] : l.ROLE.CONSTS.SOUL_TYPE_ATTR_ITEM_MAP[e];
return {
attrKey: i.keys(n)[0],
attrValue: i.values(n)[0][t]
};
},
getSoulCost: function(e, t, a) {
var i = [ {
1: 31,
2: 32,
3: 33,
4: 34,
5: 35,
6: 36,
7: 37,
8: 38,
9: 41
}[e] ], n = [ {
1: 20,
2: 20,
3: 20,
4: 25,
5: 25,
6: 30,
7: 30,
8: 35,
9: 35,
10: 40
}[t] ];
if (a) {
i.push(39);
n.push({
1: 2,
2: 2,
3: 2,
4: 3,
5: 3,
6: 3,
7: 3,
8: 4,
9: 4,
10: 4
}[t]);
}
return {
costItemIds: i,
costItemCounts: n
};
},
getEvolveSkillCost: function() {
return {
soul: 120,
entityId: 85,
count: 1
};
}
},
MAX_LEVEL: 100
},
EQUIPMENTS: {
CONSTS: {
EVOLVE_COST_COINS: [ 0, 0, 100, 500, 1e3, 2e3, 5e3, 6e3, 8e3, 1e4, 12e3, 14e3, 15e4, 2e5, 3e5, 5e5, 6e5, 1e6, 15e5, 2e6, 3e6 ],
EVL_ITEM_TYPES: [ "evlItem_1", "evlItem_2", "evlItem_3", "evlItem_4", "evlItem_5", "evlItem_6" ],
STONE_ITEM_TYPES: [ "stoneItem_1", "stoneItem_2", "stoneItem_3", "stoneItem_4", "stoneItem_5", "stoneItem_6" ],
ARTIFACT_ITEM_TYPES: [ "artifactItem_1", "artifactItem_2", "artifactItem_3" ],
CAPSULE_ITEM_TYPES: [ "capsuleItem_1", "capsuleItem_2", "capsuleItem_3" ],
STAR_SIGN_ITEM_TYPES: [ "starSignItem_1", "starSignItem_2", "starSignItem_3", "starSignItem_4" ],
EQUIP_TYPE_NEED_AWAKE_LEVEL_MAP: {
capsuleItem_3: 10,
capsuleItem_4: 15,
capsuleItem_5: 20
}
},
FUNS: {
getUpgradeCost: function(e) {
return a.findCostByLevel(e).eqpUpgradeCoin;
},
getUpgradeMaxCost: function(e, t) {
for (var a = e - t, i = 0, n = 1; n <= a; n++) i += l.EQUIPMENTS.FUNS.getUpgradeCost(t + n);
return i;
},
getEvolveCost: function(e) {
return l.EQUIPMENTS.CONSTS.EVOLVE_COST_COINS[e] || 0;
}
}
},
SKILL: {
CONSTS: {
UN_LOCK_COLOR: {
1: 0,
2: 1,
4: 2,
7: 3
},
UN_LOCK_AWAKE_SKILL_ID: {
1: 101,
2: 102,
3: 103,
4: 104,
5: 105,
6: 101,
7: 102,
8: 103,
9: 104,
10: 105,
11: 101,
12: 102,
13: 103,
14: 104,
15: 105,
16: 101,
17: 102,
18: 103,
19: 104,
20: 105
},
UN_LOCK_AWAKE_SKILL_MAX_LEVEL: {
1: 50,
2: 50,
3: 50,
4: 50,
5: 50,
6: 100,
7: 100,
8: 100,
9: 100,
10: 100,
11: 150,
12: 150,
13: 150,
14: 150,
15: 150,
16: 200,
17: 200,
18: 200,
19: 200,
20: 200
},
UPGRADE_CONST_POINT: 1
},
FUNS: {
getUpgradeCost: function(e) {
return a.findCostByLevel(e).skillUpgradeCoin;
},
getAwakeUpgradeCost: function(e) {
return a.findCostByLevel(100 + e).skillUpgradeCoin;
},
getShipUpgradeCost: function(e) {
return 5 * a.findCostByLevel(e).skillUpgradeCoin;
}
}
},
MAP: {
CONSTS: {
TYPE: {
NORMAL: 1,
ELITE: 2,
ACTIVITY: 3,
EVOLUTION_ITEM: 4,
SIX: 5,
LEGEND: 6
},
MAP_OPEN_DAYS_MAP: {
301: [ 0, 2, 5 ],
302: [ 0, 1, 4 ],
303: [ 0, 3, 6 ],
304: [ 0, 1, 3, 5 ],
305: [ 0, 2, 4, 6 ],
306: [ 0, 1 ],
307: [ 0, 2 ],
308: [ 0, 3 ],
309: [ 0, 4 ],
310: [ 0, 5 ],
311: [ 0, 6 ],
501: [ 0, 2, 5 ],
502: [ 0, 1, 4 ],
503: [ 0, 3, 6 ],
402: [ 1 ],
403: [ 2 ],
404: [ 3 ],
405: [ 4 ],
406: [ 5 ],
407: [ 6 ],
408: [ 0 ]
},
BMAP_CD_TIME_MAP: {},
SKIP_COST_SKIP_COIN: 1,
SKIP_COST_GEM: 1,
RESET_SMAP_COST_GEMS: [ 0, 20, 50, 50, 100, 100, 100, 100, 200, 200, 200 ],
BUY_MAP_TYPE5_TIMES_COST_GEMS: [ 0, 100, 200, 300, 400, 500, 500, 500, 500, 500, 500 ],
TYPE_BOX_NEED_STARS: [ 7, 14, 21 ],
NORMAL_TYPE_BOX_NEED_STARS: [ 7, 14, 21 ],
PASS_GET_GEM: 50,
ENDLESS_DAY_ROLE_CLASS_IDS_MAP: {
1: [ 1, 2, 3, 4, 5, 6, 23, 25, 40, 50, 54, 64 ],
2: [ 7, 8, 9, 10, 1, 3, 23, 22, 41, 44, 65, 49, 88 ],
3: [ 19, 30, 31, 32, 33, 37, 42, 43, 46, 63, 73, 87 ],
4: [ 12, 13, 14, 15, 16, 17, 18, 29, 48, 53, 67, 70 ],
5: [ 11, 21, 27, 24, 34, 35, 36, 45, 47, 51, 52 ],
6: [ 18, 20, 26, 29, 32, 33, 28, 55, 59, 69, 74 ],
0: [ 27, 22, 24, 34, 38, 39, 66, 68, 75, 72, 71 ]
},
ENDLESS_DAY_TITLE_MAP: {
1: s.t("赛亚人之家"),
2: s.a("龟仙派"),
3: s.a("人造人"),
4: s.a("弗利萨军团"),
5: s.a("宇宙强战士"),
6: s.a("宇宙强敌"),
0: s.a("超级赛亚人")
},
ENDLESS_MORE_UNLOCK_NEED_LEVEL: 55,
DAILY_PURSUIT_TIMES: 5,
RESET_PURSUIT_TEAM_TIMES_COST_GEM: 500,
FRUIT_MAP_UNLOCK_NEED_LEVEL: 70,
DAILY_FRUIT_MAP_TIMES: 10,
DAILY_BUY_FRUIT_MAP_TIMES: 5,
DAILY_STAR_SIGN_MAP_TIMES: 10
},
FUNS: {
checkOpen: function(e) {
var t = Date._now ? Date._now() : Date.now(), a = l.MAP.CONSTS.MAP_OPEN_DAYS_MAP[e], n = new Date(t), s = n.getDay(), r = n.getHours();
if (!a) return !0;
if (r < l.PLAYER.CONSTS.RESET_HOURS) {
var o = 0 == s ? 6 : s - 1;
return i.include(a, o);
}
return i.include(a, s);
},
checkBmapCD: function(e, t) {
return !l.MAP.CONSTS.BMAP_CD_TIME_MAP[e] || l.MAP.CONSTS.BMAP_CD_TIME_MAP[e] + t - (Date._now ? Date._now() : Date.now()) <= 0;
},
checkHaveBmapCDTime: function(e) {
return !!l.MAP.CONSTS.BMAP_CD_TIME_MAP[e];
},
getPlayerExp: function(e) {
return 1 * e;
},
getSkipExpDropList: function(e, t) {
var i = 5 * e * t, n = [ 20004, 20003, 20002, 20001 ], s = {};
for (var r in n) s[n[r]] = a.findEntityById(n[r]).extra.roleExp;
for (var o = {}; i > 0; ) {
if (i < s[n[n.length - 1]]) {
o[n[r]] = o[n[r]] || 0;
o[n[r]]++;
i -= s[n[n.length - 1]];
break;
}
for (var r in n) if (i >= s[n[r]]) {
o[n[r]] = o[n[r]] || 0;
o[n[r]]++;
i -= s[n[r]];
break;
}
}
var l = [];
for (var c in o) l.push({
entityId: c,
count: o[c]
});
return l;
},
getResetSmapCost: function(e) {
var t = l.MAP.CONSTS.RESET_SMAP_COST_GEMS;
return t[e] || t[t.length - 1];
},
getBuyMapType5TimesCost: function(e) {
var t = l.MAP.CONSTS.BUY_MAP_TYPE5_TIMES_COST_GEMS;
return t[e] || t[t.length - 1];
},
getBuyFruitMapTimesCost: function(e) {
var t = [ 0, 50, 100, 100, 150, 150 ];
return t[e] || i.last(t);
}
}
},
POINT: {
CONSTS: {
NORMAL_COST_ENTITY_ID: 119,
NORMAL_COST_GEM: 300,
NORMAL_TEN_COST_GEM: 2700,
NORMAL_TIMES_1_CLASS_ID: 101,
NORMAL_CLASS_ID: 102,
NORMAL_MUST_STAR3_TIMES: 20,
ADVANCED_COST_ENTITY_ID: 120,
ADVANCED_TIMES_1_CLASS_ID: 201,
ADVANCED_CLASS_IDS: [ 202, 203, 204 ],
ADVANCED_MUST_STAR3_TIMES: 20,
SWITCH_ADVANCED_POOL_COST_GEM: 300
},
FUNS: {
getAdvancedSpecialInfo: function(e) {
if (!e) return null;
var t = o("./utils"), a = new Date(e.firstTime).setHours(0, 0, 0, 0), n = Date.now();
if (n < a) return null;
var s = e.classIdsList, r = e.durationDaysList, c = t.clone(e.maxLuckMap), d = t.clone(e.baseRateMap), p = e.maxRateIncRatio, _ = Math.ceil((n - a) / l.CONSTS.A_DAY), m = 0;
if (e.isRepeat) {
var u = i.reduce(r, function(e, t) {
return e + t;
}, 0);
if (_ > u) {
a += Math.floor(_ / u) * u * l.CONSTS.A_DAY;
_ = Math.ceil((n - a) / l.CONSTS.A_DAY);
}
}
for (var h in r) if (_ <= (m += r[h])) {
for (var f in c) if (!i.include(s[h], Number(f))) {
delete c[f];
delete d[f];
}
return {
maxLuckMap: c,
baseRateMap: d,
maxRateIncRatio: p,
classIds: s[h],
endTime: a + m * l.CONSTS.A_DAY
};
}
return null;
}
}
},
DROP: {
CONSTS: {
MAX_LUCK: 100
},
FUNS: {
getDropListByDesc: function(e) {
if (!i.isString(e)) return e;
var t = [], a = e.split(",");
for (var n in a) {
var s = a[n].split("x"), r = s[0].split("_"), o = Number(r[0]), l = Number(s[1]), c = {};
if (!isNaN(o) && !isNaN(l)) if (r.length > 2) {
c[r[1]] = Number(r[2]);
t.push({
entityId: o,
extra: c,
count: l
});
} else t.push({
entityId: o,
count: l
});
}
return t;
},
getRandomDropListByDesc: function(e) {
var t = [], a = e.split(",");
for (var i in a) {
var n = a[i].split("x"), s = n[1].split("_"), r = Number(n[0]), o = null;
if (isNaN(r)) {
var l = n[0].split("_");
r = Number(l[0]);
(o = {})[l[1]] = Number(l[2]);
}
var c, d = Number(s[0]), p = null, _ = null;
"W" == s[1][0] ? p = Number(s[1].split("W")[1]) : "R" == s[1][0] && (_ = Number(s[1].split("R")[1]));
p ? c = {
entityId: r,
extra: o,
count: d,
weight: p
} : _ && (c = {
entityId: r,
extra: o,
count: d,
rate: _
});
c.extra || delete c.extra;
t.push(c);
}
return t;
},
dropList2EntityCountMap: function(e, t) {
t = t || !1;
var a = {};
for (var i in e) {
var n = e[i].entityId, s = t ? "" : "_" + i;
a[n + s] = a[n + s] || 0;
a[n + s] += e[i].count;
}
return a;
}
}
},
ARENA: {
CONSTS: {
REQUIRED_LEVEL: 10,
SETTLEMENT_REWARD_HOURS: 21,
TOP_REWARDS_MSG_TITLE: s.a("历史最高排名奖励"),
RE_CHALLENGE_CD_TIME: 6e5,
FREE_TIMES: 5,
CANCEL_CD_COST_GEM: 50,
BUY_CHALLENGE_TIMES: [ 0, 50, 50, 100, 100, 100, 100, 200, 200, 200 ]
},
FUNS: {
getBuyChallengeTimesCost: function(e) {
var t = l.ARENA.CONSTS.BUY_CHALLENGE_TIMES;
return t[e] || t[t.length - 1];
}
}
},
ARENA_3V3: {
CONSTS: {
REQUIRED_LEVEL: 40,
SETTLEMENT_REWARD_HOURS: 21,
LEVEL_BETWEEN: [ 40, 60, 70, 80, 90, 95 ],
LEVEL_TYPE_BETWEEN: [ "level_40_59", "level_60_69", "level_70_79", "level_80_89", "level_90_94", "level_95_100" ],
RE_CHALLENGE_CD_TIME: 6e5,
FREE_TIMES: 5,
CANCEL_CD_COST_GEM: 50,
BUY_CHALLENGE_TIMES: [ 0, 50, 50, 100, 100, 100, 100, 200, 200, 200 ]
},
FUNS: {
getBuyChallengeTimesCost: function(e) {
var t = l.ARENA_3V3.CONSTS.BUY_CHALLENGE_TIMES;
return t[e] || t[t.length - 1];
},
getHourCoinCount: function(e) {
var t = a.arenaRewards.all(), i = 0;
for (var n in t) {
var s = t[n];
if (e >= s.rankBetween[0] && e <= s.rankBetween[1]) {
i = s.hourCoin;
break;
}
}
return i;
},
getWorshipRewardDropList: function(e) {
for (var t = [ 22, 40, 60, 70, 80, 90 ], a = [ [ {
entityId: 101,
count: 2e4
} ], [ {
entityId: 101,
count: 4e4
} ], [ {
entityId: 101,
count: 5e4
} ], [ {
entityId: 101,
count: 6e4
} ], [ {
entityId: 101,
count: 7e4
} ], [ {
entityId: 101,
count: 8e4
} ] ], i = a[0], n = 0; n < t.length; n++) e > t[n] && (i = a[n]);
return i;
}
}
},
TOP_ARENA_3V3: {
CONSTS: {
FIRST_OPEN_TIME: "2024-01-01",
MONEY_ID: 97,
REQUIRED_LEVEL: 40,
RESET_DAYS: 16,
DELAY_DAYS: 2,
INIT_SCORE: 0,
SETTLEMENT_REWARD_HOURS: 21,
SCORE_BETWEEN: [ 0, 11, 21, 31, 41, 61 ],
SCORE_TYPE_BETWEEN: [ 1, 2, 3, 4, 5, 6 ],
FREE_TIMES: 7,
BUY_MATCH_COST_MONEY_MAP: [ 0, 50, 60, 80, 100 ],
TOP_UN_ATTACK_HOURS: 1,
TOP_CHALLENGE_TIMES: 3,
TOP_HOURS_REWARD_MONEY_MAP: {
1: 40,
2: 35,
3: 30,
4: 26,
5: 22,
6: 18,
7: 15,
8: 12,
9: 10,
10: 8
},
TOP_SETTLEMENT_REWARD_MONEY_MAP: {
1: 1200,
2: 1050,
3: 900,
4: 780,
5: 660,
6: 540,
7: 450,
8: 360,
9: 300,
10: 240
},
SCORE_TYPE_CAN_CHALLENGE_TOP_NOS_MAP: {
1: [],
2: [ 9, 10 ],
3: [ 7, 8, 9, 10 ],
4: [ 5, 6, 7, 8, 9, 10 ],
5: [ 3, 4, 5, 6, 7, 8, 9, 10 ],
6: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
}
},
FUNS: {
getFirstReachRewardDesc: function(e) {
return {
1: "97x500,689x1",
2: "97x700,690x1",
3: "97x1000,691x1",
4: "97x1300,692x1",
5: "97x1600,693x1",
6: "97x2000,694x1"
}[e];
},
getBuyMatchTimesCost: function(e) {
var t = l.TOP_ARENA_3V3.CONSTS.BUY_MATCH_COST_MONEY_MAP, a = t[e] || i.last(t);
return {
moneyId: l.TOP_ARENA_3V3.CONSTS.MONEY_ID,
count: a
};
}
}
},
SHOP: {
CONSTS: {
TYPE: {
NORMAL: 1,
ARENA: 2,
EXPEDITION: 3,
VIP: 4,
ARENA_3V3: 5,
GUILD: 6,
PRACTICE: 7,
ARTIFACT: 8,
SIX_PATH: 9,
SHIP: 10,
FRUIT: 11,
ISLAND: 12,
TOP_ARENA_3V3: 13,
STAR_SIGN: 14
},
REFRESH_COST_MONEY_MAP: {
1: [ 0, 50, 100, 100, 200, 200, 200, 200 ],
2: [ 0, 50, 100, 100, 200, 200, 200, 200 ],
3: [ 0, 50, 100, 100, 200, 200, 200, 200 ],
4: [ 0, 50, 100, 100, 200, 200, 200, 200 ],
5: [ 0, 50, 100, 100, 200, 200, 200, 200 ],
6: [ 0, 50, 100, 100, 200, 200, 200, 200 ],
7: [ 0, 50, 100, 100, 200, 200, 200, 200 ],
8: [ 0, 50, 100, 100, 200, 200, 200, 200 ],
9: [ 0, 200 ],
10: [ 0, 200 ],
11: [ 0, 50, 50, 100 ],
12: [ 0, 100, 100, 150, 150, 200 ],
13: [ 0, 50, 100, 100, 200, 200, 200, 200 ]
},
REFRESH_MONEY_ID_MAP: {
1: 102,
2: 103,
3: 105,
4: 102,
5: 106,
6: 107,
7: 111,
8: 102,
9: 102,
10: 118,
11: 109,
12: 40,
13: 102
},
REFRESH_HOURS_MAP: {
1: [ 9, 12, 18, 21 ],
2: [ 21 ],
3: [ 21 ],
4: [ 21 ],
5: [ 21 ],
6: [ 21 ],
7: [ 21 ],
8: [ 21 ],
9: [ 21 ],
10: [ 21 ],
11: [ 21 ],
12: [ 21 ],
13: [ 21 ],
14: [ 21 ]
},
SHOP_TITLE_MAP: {
1: s.a("杂货商店"),
2: s.a("武道会商店"),
3: s.a("强者争霸商店"),
4: s.a("源界商店"),
5: s.a("武斗商店"),
6: s.a("家族商店"),
7: s.a("界王星商店"),
8: s.a("声望商店"),
9: s.a("巅峰商店"),
10: s.a("伙伴商店"),
11: s.a("龙珠商店"),
12: s.a("战魂商店"),
13: s.a("巅峰3v3商店"),
14: s.a("星座商店")
},
VIP_SHOP_COUPON_ENTITY_ID: 112
},
FUNS: {
getRefreshCost: function(e, t) {
var a = l.SHOP.CONSTS.REFRESH_COST_MONEY_MAP;
return a[e][t] || i.last(a[e]);
}
}
},
TASK: {
CONSTS: {
DAILY_VIP_GROUP_ID: 2301,
ACTIVE_REWARD_MAP: {
daily: {
30: "311x1,101x50000,20002x15,119x1",
80: "311x2,101x80000,22001x2,113x1",
120: "21001x8,49907x15,119x1,60007x50",
180: "21002x4,102x150,120x1,60001x1"
},
weekly: {
500: "101x200000,102x300,49912x20,120x2",
850: "21002x5,112x300,117x1,98x100",
1e3: "21003x2,23002x20,22001x5,98x100"
}
}
},
FUNS: {}
},
VIP: {
CONSTS: {
MAX_LEVEL: 16
},
FUNS: {
getUpgradeVipHintStr: function(e, t, i) {
var r = a.vip.findBy("level", t)[0], o = a.vip.findBigger(e, r[e])[0];
o && (i = n.include(e, "Times") ? {
content: [ i, s.a("(升级至VIP$1可额外获得$2次)") ],
replaceList: [ null, [ o.level, o[e] - r[e] ] ]
} : {
content: [ i, s.a("(升级至VIP$1可获得该权限)") ],
replaceList: [ null, [ o.level ] ]
});
return i;
}
}
},
EXPEDITION: {
CONSTS: {
REWARD_CLASS_ID_MAP: {
1: 301,
2: 301,
3: 302,
4: 301,
5: 301,
6: 302,
7: 301,
8: 301,
9: 302,
10: 301,
11: 301,
12: 302,
13: 303
},
REWARD_EXPEDITION_MONEY_MAP: {
3: 100,
6: 200,
9: 300,
12: 300,
13: 400
},
CHALLENGER_COUNT: 13,
STATUS: {
UN_COMPLETE: 1,
CAN_RECEIVE: 2
}
},
FUNS: {
getStandardPower: function(e, t) {
return t * (.7 + (e - 25) / 750 * 3) * (.1 * Math.random() + .95);
},
getRewardCoin: function(e, t) {
return Math.round((15e3 + 100 * t) * (.00195 * Math.pow(e, 3) - .02403 * Math.pow(e, 2) + .12922 * e + .89286) * t / 25 * 2);
}
}
},
ACTIVITY: {
CONSTS: {
STATUS: {
UN_COMPLETE: 1,
CAN_RECEIVE: 2,
COMPLETE: 3
},
NEED_KEY: {
LOGIN_DAYS: "loginDays",
LOGIN_DAYS_2: "loginDays2",
PLAYER_LEVEL: "playerLevel",
VIP_LEVEL: "vipLevel",
TOTAL_POWER: "totalPower",
INC_POWER: "incPower",
POINT_TIMES: "A_pointTimes",
TOP_UP_GEM: "topUpGem",
COST_GEM: "costGem",
TOP_UP_MONEY: "topUpMoney",
TOP_UP_TRUE_MONEY: "topUpTrueMoney",
BUY_GOODS_ID_$1_TIMES: "buyGoodsId_$1_times",
$1_SAVE_GEM: "$1SaveGem",
HAVE_GEM: "haveGem",
BUY_GOODS_ID: "buyGoodsId",
GUILD_DRUM_TIMES: "guildDrumTimes",
GUILD_WORSHIP_TIMES: "guildWorshipTimes",
PRACTICE_TIMES: "A_practiceTimes",
WORLD_BOSS_TIMES: "worldBossTimes",
GUILD_BOSS_TIMES: "guildBossTimes",
EYE_TIMES: "A_eyeTimes",
TAIL_TIMES: "A_tailTimes",
TASK_ACTIVE_POINT: "taskActivePoint",
ONLINE_SECONDS: "onlineSeconds"
},
TYPE: {
SOUL_DROP_COUNT_DOUBLE: "soulDropCountDouble",
NORMAL_ITEM_COUNT_DOUBLE: "normalItemCountDouble",
ELITE_ITEM_COUNT_DOUBLE: "eliteItemCountDouble",
CKL_ITEM_COUNT_DOUBLE: "CKLItemCountDouble",
EXPEDITION_MONEY_COUNT_DOUBLE: "expeditionMoneyCountDouble",
EXPEDITION_COIN_COUNT_DOUBLE: "expeditionCoinCountDouble",
REDUCE_SKILL_POINT_RECOVER_TIME: "reduceSkillPointRecoverTime",
REDUCE_ACTION_POINT_RECOVER_TIME: "reduceActionPointRecoverTime"
},
DIAL_COST_ID_MAP: {
luck: 113,
vip: 114,
svip: 117,
shen: 89,
pay: 88
},
CKL_ITEM_COUNT_DOUBLE_IDS: [ 49902, 49904, 49907, 49912 ],
BUY_TASK_ACTIVE_NEED_RESET_DAYS: 4,
TRIGGER_TOP_UP_EVENT: {
PLAYER_LEVELS: [ 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100 ],
MAP_TYPE_1_SMAP_IDS: [ 10614, 10714, 10814, 10914, 11014, 11114, 11214, 11314, 11414, 11514, 11614, 11714, 11814, 11914, 12014 ],
END_LESS_PASS_IDS: [ 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310, 330, 350 ],
TOTAL_POWERS: [ 1e5, 2e5, 4e5, 8e5, 16e5, 32e5, 64e5 ]
}
},
FUNS: {
checkOpen: function(e, t) {
var a = Date.now(), n = null == e.start_time ? -1 : e.start_time, s = null == e.end_time ? -1 : e.end_time, r = -1 == n || 0 != n && a >= new Date(n) && a < new Date(s);
r = r && (!t || (!e.exclude_server_ids || !i.include(e.exclude_server_ids, t)) && (!e.include_server_ids || i.include(e.include_server_ids, t)));
t && e.regionMap && !l.ACTIVITY.FUNS.getRankRegionName(e, t) && (r = !1);
return r;
},
convert: function(e) {
if ("string" == typeof e.start_time && "string" == typeof e.end_time) {
e.start_time = new Date(e.start_time + " 00:00:00").getTime();
e.end_time = new Date(e.end_time + " 23:59:59").getTime();
e.start_time = isNaN(e.start_time) ? 0 : e.start_time;
e.end_time = isNaN(e.end_time) ? 0 : e.end_time;
}
e.exclude_server_ids && 0 == e.exclude_server_ids.length && delete e.exclude_server_ids;
e.include_server_ids && 0 == e.include_server_ids.length && delete e.include_server_ids;
},
getBuyReachValCostGem: function(e, t) {
return e * t;
},
getRankRegionName: function(e, t) {
if (!e) return "z1";
for (var a in e.regionMap) {
var n = e.regionMap[a];
if (-1 != n.indexOf("-")) {
var s = n.split("-");
if (t >= Number(s[0]) && t <= Number(s[1])) return a;
} else {
s = JSON.parse(n);
if (i.include(s, t)) return a;
}
}
return null;
}
}
},
GUILD: {
CONSTS: {
CREATE_COST_GEM: 500,
VICE_CHAIRMAN_COUNT_LIMIT: 4,
A_WEEK_JOIN_TIMES: 5,
A_WEEK_MODIFY_NAME_TIMES: 1,
JOIN_REQUIRE_TYPE: {
NONE: 1,
APPROVAL: 2,
NOT_ALLOW: 3
},
APPLY_STATUS: {
WAIT: 1,
NOT_ALLOW: 2
},
WORSHIP_TYPE: {
FREE: 1,
COIN: 2,
GEM: 3
},
WORSHIP_GET_ACTION_POINT_MAP: {
1: 25,
2: 50,
3: 120
},
WORSHIP_GET_ACTIVE_POINT_MAP: {
1: 5,
2: 10,
3: 50
},
WORSHIP_COIN_COST: 5e4,
WORSHIP_GEM_COST: 120,
WORSHIP_AWARD_COIN: 3e3,
CHAIRMAN_EXPIRE_DAYS: 3,
MEMBER_CHAIRMAN_EXPIRE_DAYS: 6,
OPEN_BOX_TIMES: 3,
OPEN_BOX_FREE_CLASS_ID: 701,
OPEN_BOX_COST_GEMS: [ 0, 0, 90, 580 ],
OPEN_BOX_SOUL_IDS: [ 50230, 50180, 50320, 50270, 50240, 50220 ],
OPEN_BOX_GET_EXPS: [ 0, 10, 20, 50 ],
OPEN_BOX_GET_GUILD_ACTIVE_POINTS: [ 0, 5, 10, 50 ],
OPEN_BOX_SOUL_COUNTS: [ 0, 0, 1, 5 ],
DRUM_MAX_SHARE_TIMES: 10,
DRUM_TIMES: 1,
DRUM_TYPE_1_COST_COIN: 1e4,
DRUM_TYPE: {
TYPE_1: 1,
TYPE_2: 2,
TYPE_3: 3
},
DRUM_COST_GEM_MAP: {
1: 0,
2: 300,
3: 1e3
},
DRUM_GET_GUILD_ACTIVE_POINT_MAP: {
1: 5,
2: 50,
3: 500
},
DRUM_GET_GUILD_COIN_MAP: {
1: 10,
2: 300,
3: 1e3
},
DRUM_SEND_REWARD_MAP: {
3: [ {
entityId: 311,
count: 3
}, {
entityId: 21002,
count: 1
} ]
},
UNLOCK_MAX_SKILL_LEVEL_MAP: {
HP: {
1: 10,
2: 20,
3: 30,
4: 40,
5: 50,
6: 60,
7: 70,
8: 80,
9: 90,
10: 100
},
ATK: {
1: 10,
2: 20,
3: 30,
4: 40,
5: 50,
6: 60,
7: 70,
8: 80,
9: 90,
10: 100
},
DEF: {
1: 10,
2: 20,
3: 30,
4: 40,
5: 50,
6: 60,
7: 70,
8: 80,
9: 90,
10: 100
},
MDEF: {
1: 10,
2: 20,
3: 30,
4: 40,
5: 50,
6: 60,
7: 70,
8: 80,
9: 90,
10: 100
}
},
SKILL_HP_GROWTH: 100,
SKILL_ATK_GROWTH: 10,
SKILL_DEF_GROWTH: 10,
SKILL_MDEF_GROWTH: 10,
UPGRADE_COST_ID: 107,
UPGRADE_SKILL_COST: 150,
LEVEL_NEED_EXPS: [ 0, 0, 1e4, 3e4, 6e4, 1e5, 15e4, 21e4, 28e4, 37e4, 5e5 ],
MAX_MEMBER_COUNTS: [ 0, 25, 26, 28, 31, 35, 40, 46, 53, 62, 75 ]
},
FUNS: {
getOpenBoxCost: function(e) {
return l.GUILD.CONSTS.OPEN_BOX_COST_GEMS[e];
},
getOpenBoxExp: function(e) {
return l.GUILD.CONSTS.OPEN_BOX_GET_EXPS[e];
},
getOpenBoxActivePoint: function(e) {
return l.GUILD.CONSTS.OPEN_BOX_GET_GUILD_ACTIVE_POINTS[e];
},
getOpenBoxSoulCount: function(e) {
return l.GUILD.CONSTS.OPEN_BOX_SOUL_COUNTS[e];
}
}
},
GUILD_BATTLE: {
CONSTS: {
READY_HOURS: 20,
START_HOURS: 21,
START_MINUTE: 10,
DURATION_MINUTE: 20,
MOVE_CD: 10,
GET_REWARD_CD: 40,
HALVE_ABOVE_MEMBER_COUNT: 10,
GO_BACK_WIN_TIMES: 10,
OPEN_DAYS: [ 2, 4, 6 ],
RECOVER_COST_GEM: 100,
TOWER_TYPE_REWARD_DROP_LIST_MAP: {
1: [ {
entityId: 101,
count: 6e3
} ],
2: [ {
entityId: 101,
count: 8e3
} ],
3: [ {
entityId: 101,
count: 1e4
}, {
entityId: 102,
count: 6
} ]
},
TOWER_TYPE_RANDOM_REWARD_DROP_LIST_MAP: {
1: [ {
entityId: 107,
count: 10
} ],
2: [ {
entityId: 107,
count: 20
} ],
3: [ {
entityId: 111,
count: 16
}, {
entityId: 112,
count: 16
} ]
},
CAN_MOVE_TOWERS_MAP: {
1: [ 15, 4, 5 ],
2: [ 7, 8, 9 ],
3: [ 11, 12, 13 ],
4: [ 15, 16, 5 ],
5: [ 4, 16, 17, 6 ],
6: [ 5, 17, 7 ],
7: [ 6, 17, 18, 8 ],
8: [ 7, 18, 9 ],
9: [ 10, 19, 18, 8 ],
10: [ 11, 19, 9 ],
11: [ 12, 20, 19, 10 ],
12: [ 13, 20, 11 ],
13: [ 14, 21, 20, 12 ],
14: [ 15, 21, 13 ],
15: [ 14, 21, 16, 4 ],
16: [ 15, 4, 5, 21, 22, 17 ],
17: [ 16, 5, 6, 22, 18, 7 ],
18: [ 22, 17, 7, 19, 9, 8 ],
19: [ 20, 22, 18, 11, 10, 9 ],
20: [ 21, 22, 19, 11, 12, 13 ],
21: [ 14, 15, 16, 13, 20, 22 ],
22: [ 21, 16, 17, 20, 19, 18 ]
},
TYPE_TOWERS_MAP: {
1: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ],
2: [ 16, 17, 18, 19, 20, 21 ],
3: [ 22 ]
}
},
FUNS: {
getTowerType: function(e) {
var t;
for (var a in l.GUILD_BATTLE.CONSTS.TYPE_TOWERS_MAP) if (i.include(l.GUILD_BATTLE.CONSTS.TYPE_TOWERS_MAP[a], e)) {
t = a;
break;
}
return t;
}
}
},
NEW_GUILD_BATTLE: {
CONSTS: {
READY_HOURS: 16,
START_HOURS: 19,
START_MINUTE: 0,
DURATION_MINUTE: 180,
OPEN_DAYS: [ 1, 2, 3, 4, 5, 6, 0 ],
NEED_MEMBER_COUNT: 5,
ADD_SCORE: {
CHAIRMAN: 50,
VICE_CHAIRMAN: 20,
MEMBER: 10
},
REDUCE_STAR_SCORE: {
CHAIRMAN: 10,
VICE_CHAIRMAN: 4,
MEMBER: 2
},
ATTACK_TIMES: {
CHAIRMAN: 4,
VICE_CHAIRMAN: 4,
MEMBER: 2
},
WIN_REWARD_DROP_LIST: [ {
entityId: 102,
count: 60
}, {
entityId: 107,
count: 100
}, {
entityId: 115,
count: 500
}, {
entityId: 101,
count: 3e4
}, {
entityId: 21002,
count: 1
} ],
LOSE_REWARD_DROP_LIST: [ {
entityId: 102,
count: 30
}, {
entityId: 107,
count: 50
}, {
entityId: 115,
count: 200
}, {
entityId: 101,
count: 15e3
}, {
entityId: 21002,
count: 1
} ],
ATTACK_WIN_REWARD_DROP_LIST: [ {
entityId: 107,
count: 40
}, {
entityId: 101,
count: 2e4
}, {
entityId: 21002,
count: 2
} ],
ATTACK_LOSE_REWARD_DROP_LIST: [ {
entityId: 107,
count: 20
}, {
entityId: 101,
count: 2e4
}, {
entityId: 21002,
count: 2
} ]
},
FUNS: {}
},
PRACTICE: {
CONSTS: {
TYPE: {
MONEY: 1,
GEM: 2,
COIN: 3,
EXP: 4
},
MATCH_PLAYER_COUNT: 12,
SAME_TYPE_MAX_TEAM_COUNT: 3,
BE_ATTACK_TIMES: 3,
PRACTICE_TIME: 288e5,
MONEY_ENTITY_ID: 111,
MONEY_REWARD_COUNT_MAP: {
1: 30,
2: 100,
3: 500
},
GEM_REWARD_COUNT: 60,
EXP_ENTITY_ID: 20001,
REWARD_MAIL_TITLE: s.a("北界王特训奖励"),
BE_ATTACK_MAIL_TITLE: s.a("北界王特训被扰乱"),
TITLE_MAP: {
1: s.a("北界王特训"),
2: s.a("钻石收集"),
3: s.a("金币收集"),
4: s.a("圣水收集")
},
CHALLENGE_TIMES: 6,
DEFENSE_TIMES: 6,
LEVEL_COST_GEMS: [ 0, 0, 100, 500 ]
},
FUNS: {
getLevelCost: function(e) {
return l.PRACTICE.CONSTS.LEVEL_COST_GEMS[e];
},
getSettlementMsgBody: function(e, t) {
return {
content: s.a("恭喜您在<$1>特训完成,在这期间您被扰乱了$2次,在请查收您获得的奖励!"),
replaceList: [ l.PRACTICE.CONSTS.TITLE_MAP[e], t ]
};
},
getBeAttackMsgBody: function(e, t, i, n, r, o, c) {
var d = l.PRACTICE.FUNS.getChallengeRewardRate(r, o), p = l.PRACTICE.FUNS.getRewardDropList(e, o, t, d), _ = "";
for (var m in p) _ += "<" + a.findEntityById(p[m].entityId).kindName + "x" + p[m].count + ">";
return _ = c ? {
content: s.a("您的队伍在<$1>被$2区的$3扰乱了,损失了$4."),
replaceList: [ l.PRACTICE.CONSTS.TITLE_MAP[e], i, n, _ ]
} : {
content: s.a("您的队伍在<$1>成功抵挡了$2区的$3的扰乱."),
replaceList: [ l.PRACTICE.CONSTS.TITLE_MAP[e], i, n ]
};
},
getRewardCoinCount: function(e) {
return 3 * l.EXPEDITION.FUNS.getRewardCoin(2, e);
},
getRewardExpEntityCount: function(e) {
return Math.ceil(2 * l.PRACTICE.FUNS.getRewardCoinCount(e) / 400);
},
getChallengeRewardRate: function(e, t) {
var a = .1 - .1 * (e - t) / 5;
return (a = a > .2 ? .2 : a) < .05 ? .05 : a;
},
getRewardDropList: function(e, t, a, i, n) {
n = n || !1;
var s, r, o = l.PRACTICE.CONSTS.TYPE;
switch (e) {
case o.MONEY:
r = Math.ceil(l.PRACTICE.CONSTS.MONEY_REWARD_COUNT_MAP[a] * i);
s = [ {
entityId: l.PRACTICE.CONSTS.MONEY_ENTITY_ID,
count: r
} ];
break;

case o.GEM:
r = Math.ceil(l.PRACTICE.CONSTS.GEM_REWARD_COUNT * i);
r = n ? 3 * r : r;
s = [ {
entityId: l.CONSTS.ENTITY_ID.GEM,
count: r
} ];
break;

case o.COIN:
r = Math.ceil(l.PRACTICE.FUNS.getRewardCoinCount(t) * i);
s = [ {
entityId: l.CONSTS.ENTITY_ID.COIN,
count: r
} ];
break;

case o.EXP:
r = Math.ceil(l.PRACTICE.FUNS.getRewardExpEntityCount(t) * i);
var c = Math.floor(r / 25), d = r % 25, p = Math.floor(d / 5);
d = r % 5;
s = [];
c > 0 && s.push({
entityId: 20003,
count: c
});
p > 0 && s.push({
entityId: 20002,
count: p
});
d > 0 && s.push({
entityId: 20001,
count: d
});
}
return s;
}
}
},
FRIEND: {
CONSTS: {
STATUS: {
PENDING: 1,
SUCCESS: 2
},
GIFT_STATUS: {
NULL: 1,
CAN_RECEIVE: 2,
RECEIVED: 3
},
CAN_RECEIVE_TIMES: 20,
MAX_COUNT: 50,
POINT_TICKET_RATIO: 10,
TICKET_ENTITY_ID: 119
},
FUNS: {}
},
EYE: {
CONSTS: {
RANK_COUNT: 11,
RANK_30_MINUTE_REWARD_LIST_MAP: {
1: [ {
entityId: 112,
count: 17
}, {
entityId: 101,
count: 8e4
} ],
2: [ {
entityId: 112,
count: 16
}, {
entityId: 101,
count: 7e4
} ],
3: [ {
entityId: 112,
count: 15
}, {
entityId: 101,
count: 6e4
} ],
4: [ {
entityId: 112,
count: 14
}, {
entityId: 101,
count: 5e4
} ],
5: [ {
entityId: 112,
count: 13
}, {
entityId: 101,
count: 45e3
} ],
6: [ {
entityId: 112,
count: 12
}, {
entityId: 101,
count: 4e4
} ],
7: [ {
entityId: 112,
count: 11
}, {
entityId: 101,
count: 35e3
} ],
8: [ {
entityId: 112,
count: 10
}, {
entityId: 101,
count: 3e4
} ],
9: [ {
entityId: 112,
count: 9
}, {
entityId: 101,
count: 25e3
} ],
10: [ {
entityId: 112,
count: 8
}, {
entityId: 101,
count: 2e4
} ],
11: [ {
entityId: 112,
count: 7
}, {
entityId: 101,
count: 15e3
} ]
},
PRIVATE_30_MINUTE_REWARD_LIST: [ {
entityId: 112,
count: 4
}, {
entityId: 101,
count: 6e3
} ],
PUBLIC_STONE_CLASS_ID: 801,
FREE_TIMES: 2,
DAY_ROLE_CLASS_IDS_MAP: {
1: [ 1, 2, 3, 4, 5, 6, 23, 25 ],
2: [ 7, 8, 9, 10, 1, 3, 23, 22 ],
3: [ 19, 30, 31, 32, 33, 37 ],
4: [ 12, 13, 14, 15, 16, 17, 18, 29 ],
5: [ 11, 21, 27, 24, 34, 35, 36 ],
6: [ 18, 20, 26, 29, 32, 33, 28 ],
0: [ 27, 22, 24, 34, 38, 39 ]
},
DAY_TITLE_MAP: {
1: s.a("赛亚人之家"),
2: s.a("龟仙派"),
3: s.a("人造人"),
4: s.a("弗利萨军团"),
5: s.a("宇宙强战士"),
6: s.a("宇宙强敌"),
0: s.a("超级赛亚人")
},
ROLE_COUNT_MIN_LIMIT: 1,
OPEN_HOURS: 10,
CLOSE_HOURS: 22,
SETTLEMENT_REWARD_HOURS: 22,
SETTLEMENT_REWARD_MINUTE: 30
},
FUNS: {
getBuyChallengeTimesCost: function(e) {
var t = [ 0, 50, 50, 100, 100, 100, 100, 200, 200, 200 ];
return t[e] || t[t.length - 1];
},
getPublicRewardList: function(e, t) {
if (e > 11) return [];
var a = Math.floor(t / 18e5), i = Math.floor(a ? a / 2 : 0), n = o("./utils").clone(l.EYE.CONSTS.RANK_30_MINUTE_REWARD_LIST_MAP[e]);
if (a > 0) for (var s in n) n[s].count *= a; else n = [];
if (i > 0 && e <= 5) {
var r = o("./dropUtil"), c = [];
for (s = 0; s < i; s++) {
c.push(l.EYE.CONSTS.PUBLIC_STONE_CLASS_ID);
1 == e && c.push(l.EYE.CONSTS.PUBLIC_STONE_CLASS_ID);
}
n = n.concat(r.getDropListByClassIds(c));
}
var d = {};
for (var s in n) {
var p = n[s].entityId, _ = n[s].count;
d[p] = d[p] || 0;
d[p] += _;
}
var m = [];
for (var p in d) m.push({
entityId: Number(p),
count: d[p]
});
return m;
},
getPrivateRewardList: function(e) {
var t = Math.floor(e / 18e5), a = o("./utils").clone(l.EYE.CONSTS.PRIVATE_30_MINUTE_REWARD_LIST);
if (t > 0) for (var i in a) a[i].count *= t; else a = [];
return a;
}
}
},
ALL_SERVER_BATTLE: {
CONSTS: {
JOIN_COUNT: 30,
OPEN_DAYS: [ 3, 5, 0 ],
START_HOURS: 21,
START_MINUTE: 10,
APPLY_BEGIN_HOURS: 0,
APPLY_END_HOURS: 21,
DURATION_MINUTE: 20,
MOVE_CD: 10,
GET_REWARD_CD: 40,
HALVE_ABOVE_MEMBER_COUNT: 10,
GO_BACK_WIN_TIMES: 10,
RECOVER_COST_GEM: 50,
TITLE_ITEM_IDS: [ 416, 417, 418, 419, 420 ],
LEVEL_BETWEEN: [ 58, 70, 80, 90, 95 ],
LEVEL_TYPE_BETWEEN: [ "level_58_69", "level_70_79", "level_80_89", "level_90_94", "level_95_100" ],
TOWER_TYPE_REWARD_DROP_LIST_MAP: {
1: [ {
entityId: 101,
count: 12e3
} ],
2: [ {
entityId: 101,
count: 16e3
} ],
3: [ {
entityId: 101,
count: 2e4
}, {
entityId: 102,
count: 12
} ]
},
TOWER_TYPE_RANDOM_REWARD_DROP_LIST_MAP: {
1: [ {
entityId: 107,
count: 20
} ],
2: [ {
entityId: 107,
count: 40
} ],
3: [ {
entityId: 111,
count: 32
}, {
entityId: 112,
count: 32
} ]
},
WIN_TIMES_RANK_REWARD_DROP_LIST_MAP: {
1: [ {
entityId: 115,
count: 2400
}, {
entityId: 21003,
count: 3
}, {
entityId: 311,
count: 50
} ],
2: [ {
entityId: 115,
count: 2e3
}, {
entityId: 21003,
count: 3
}, {
entityId: 311,
count: 45
} ],
3: [ {
entityId: 115,
count: 1800
}, {
entityId: 21003,
count: 3
}, {
entityId: 311,
count: 40
} ],
4: [ {
entityId: 115,
count: 1600
}, {
entityId: 21003,
count: 2
}, {
entityId: 311,
count: 35
} ],
5: [ {
entityId: 115,
count: 1400
}, {
entityId: 21003,
count: 2
}, {
entityId: 311,
count: 30
} ],
6: [ {
entityId: 115,
count: 1200
}, {
entityId: 21003,
count: 2
}, {
entityId: 311,
count: 28
} ],
7: [ {
entityId: 115,
count: 1e3
}, {
entityId: 21003,
count: 2
}, {
entityId: 311,
count: 26
} ],
8: [ {
entityId: 115,
count: 600
}, {
entityId: 21003,
count: 2
}, {
entityId: 311,
count: 24
} ],
9: [ {
entityId: 115,
count: 550
}, {
entityId: 21003,
count: 2
}, {
entityId: 311,
count: 22
} ],
10: [ {
entityId: 115,
count: 500
}, {
entityId: 21003,
count: 2
}, {
entityId: 311,
count: 21
} ]
},
WIN_TIMES_RANK_BETWEEN: [ 11, 21, 51, 91 ],
WIN_TIMES_RANK_REWARD_BETWEEN: [ [ {
entityId: 115,
count: 400
}, {
entityId: 21003,
count: 1
}, {
entityId: 311,
count: 20
} ], [ {
entityId: 115,
count: 300
}, {
entityId: 21003,
count: 1
}, {
entityId: 311,
count: 10
} ], [ {
entityId: 115,
count: 200
}, {
entityId: 21003,
count: 1
}, {
entityId: 311,
count: 5
} ] ],
NO_ENTER_REWARD_DROP_LIST: [ {
entityId: 115,
count: 100
} ],
CAN_MOVE_TOWERS_MAP: {
1: [ 15, 4, 5 ],
2: [ 7, 8, 9 ],
3: [ 11, 12, 13 ],
4: [ 15, 16, 5 ],
5: [ 4, 16, 17, 6 ],
6: [ 5, 17, 7 ],
7: [ 6, 17, 18, 8 ],
8: [ 7, 18, 9 ],
9: [ 10, 19, 18, 8 ],
10: [ 11, 19, 9 ],
11: [ 12, 20, 19, 10 ],
12: [ 13, 20, 11 ],
13: [ 14, 21, 20, 12 ],
14: [ 15, 21, 13 ],
15: [ 14, 21, 16, 4 ],
16: [ 15, 4, 5, 21, 22, 17 ],
17: [ 16, 5, 6, 22, 18, 7 ],
18: [ 22, 17, 7, 19, 9, 8 ],
19: [ 20, 22, 18, 11, 10, 9 ],
20: [ 21, 22, 19, 11, 12, 13 ],
21: [ 14, 15, 16, 13, 20, 22 ],
22: [ 21, 16, 17, 20, 19, 18 ]
},
TYPE_TOWERS_MAP: {
1: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ],
2: [ 16, 17, 18, 19, 20, 21 ],
3: [ 22 ]
},
BATTLE_WIN_DROP_CLASS_ID: 901,
BATTLE_FAIL_DROP_CLASS_ID: 902
},
FUNS: {
getTowerType: function(e) {
var t;
for (var a in l.ALL_SERVER_BATTLE.CONSTS.TYPE_TOWERS_MAP) if (i.include(l.ALL_SERVER_BATTLE.CONSTS.TYPE_TOWERS_MAP[a], e)) {
t = a;
break;
}
return t;
},
getWorshipRewardDropList: function(e) {
for (var t = [ 22, 40, 60, 70, 80, 90 ], a = [ [ {
entityId: 101,
count: 2e4
} ], [ {
entityId: 101,
count: 4e4
} ], [ {
entityId: 101,
count: 5e4
} ], [ {
entityId: 101,
count: 6e4
} ], [ {
entityId: 101,
count: 7e4
} ], [ {
entityId: 101,
count: 8e4
} ] ], i = a[0], n = 0; n < t.length; n++) e > t[n] && (i = a[n]);
return i;
}
}
},
WORLD_BOSS: {
CONSTS: {
BOSS_MOB_ID: 1121,
LEVEL_BETWEEN: [ 65, 76, 81, 86, 91, 96 ],
LEVEL_TYPE_BETWEEN: [ "level_65_75", "level_76_80", "level_81_85", "level_86_90", "level_91_95", "level_96_100" ],
OPEN_DAYS: [ 1, 3, 5 ],
START_HOURS: 7,
END_HOURS: 23,
ALLOW_CLASS_IDS: [ 22, 24, 28, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90 ],
INSPIRE_COST_GEM: 50,
RANK_REWARD_DROP_LIST_MAP: {
1: [ {
entityId: 118,
count: 1e3
}, {
entityId: 21003,
count: 5
}, {
entityId: 60601,
count: 50
} ],
2: [ {
entityId: 118,
count: 900
}, {
entityId: 21003,
count: 4
}, {
entityId: 60601,
count: 40
} ],
3: [ {
entityId: 118,
count: 800
}, {
entityId: 21003,
count: 3
}, {
entityId: 60601,
count: 30
} ],
4: [ {
entityId: 118,
count: 700
}, {
entityId: 21003,
count: 3
}, {
entityId: 60601,
count: 25
} ],
5: [ {
entityId: 118,
count: 600
}, {
entityId: 21003,
count: 2
}, {
entityId: 60601,
count: 20
} ],
6: [ {
entityId: 118,
count: 500
}, {
entityId: 21003,
count: 2
}, {
entityId: 60601,
count: 15
} ],
7: [ {
entityId: 118,
count: 400
}, {
entityId: 21003,
count: 2
}, {
entityId: 60601,
count: 12
} ],
8: [ {
entityId: 118,
count: 300
}, {
entityId: 21003,
count: 2
}, {
entityId: 60601,
count: 10
} ],
9: [ {
entityId: 118,
count: 200
}, {
entityId: 21003,
count: 2
}, {
entityId: 60601,
count: 7
} ],
10: [ {
entityId: 118,
count: 200
}, {
entityId: 21003,
count: 2
}, {
entityId: 60601,
count: 5
} ]
},
RANK_BETWEEN: [ 11, 21, 51, 201 ],
RANK_REWARD_BETWEEN: [ [ {
entityId: 118,
count: 100
}, {
entityId: 21003,
count: 2
}, {
entityId: 60601,
count: 4
} ], [ {
entityId: 118,
count: 100
}, {
entityId: 21003,
count: 1
}, {
entityId: 60601,
count: 4
} ], [ {
entityId: 118,
count: 100
}, {
entityId: 60601,
count: 4
} ], [ {
entityId: 60601,
count: 4
} ] ]
},
FUNS: {}
},
GUILD_BOSS: {
CONSTS: {
BOSS_MOB_ID_BETWEEN: [ 121, 161, 151, 41, 291, 261, 331, 431, 481 ],
LEVEL_BETWEEN: [ 30, 41, 51, 61, 71, 81, 86, 91, 96 ],
LEVEL_TYPE_BETWEEN: [ "level_30_40", "level_41_50", "level_51_60", "level_61_70", "level_71_80", "level_81_85", "level_86_90", "level_91_95", "level_96_100" ],
ATTACK_TIMES_BETWEEN: [ 1, 2, 2, 3, 3, 3, 4, 4, 4 ],
OPEN_DAYS: [ 0, 1, 2, 3, 4, 5, 6 ],
START_HOURS: 7,
END_HOURS: 23,
RANK_REWARD_DROP_LIST_MAPS: [ {
1: "107x300,341x14,20001x100",
2: "107x250,341x13,20001x90",
3: "107x200,341x12,20001x80",
4: "107x180,341x11,20001x70",
5: "107x150,341x10,20001x60",
6: "107x150,341x9,20001x50",
7: "107x120,341x8,20001x40",
8: "107x100,341x7,20001x30",
9: "107x90,341x6,20001x30",
10: "107x80,341x5,20001x30"
}, {
1: "107x300,108x15000,341x14",
2: "107x250,108x14000,341x13",
3: "107x200,108x13000,341x12",
4: "107x180,108x12000,341x11",
5: "107x150,108x10000,341x10",
6: "107x150,108x9000,341x9",
7: "107x120,108x8000,341x8",
8: "107x100,108x7000,341x7",
9: "107x90,108x6000,341x6",
10: "107x80,108x5000,341x5"
}, {
1: "107x300,108x20000,23001x120,20001x100",
2: "107x250,108x18000,23001x110,20001x90",
3: "107x200,108x17000,23001x100,20001x80",
4: "107x180,108x16000,23001x90,20001x70",
5: "107x150,108x15000,23001x80,20001x60",
6: "107x150,108x14000,23001x70,20001x50",
7: "107x120,108x13000,23001x60,20001x40",
8: "107x100,108x12000,23001x50,20001x30",
9: "107x90,108x11000,23001x40,20001x30",
10: "107x80,108x10000,23001x30,20001x30"
}, {
1: "102x200,107x300,23001x120,21001x30",
2: "102x180,107x250,23001x110,21001x28",
3: "102x160,107x200,23001x100,21001x25",
4: "102x150,107x180,23001x90,21001x23",
5: "102x120,107x150,23001x80,21001x20",
6: "102x100,107x150,23001x70,21001x18",
7: "102x90,107x120,23001x60,21001x15",
8: "102x80,107x100,23001x50,21001x12",
9: "102x70,107x90,23001x40,21001x10",
10: "102x60,107x80,23001x30,21001x9"
}, {
1: "102x200,107x300,23001x180,21001x30",
2: "102x180,107x250,23001x170,21001x28",
3: "102x160,107x200,23001x160,21001x25",
4: "102x150,107x180,23001x150,21001x23",
5: "102x120,107x150,23001x140,21001x20",
6: "102x100,107x150,23001x130,21001x18",
7: "102x90,107x120,23001x120,21001x15",
8: "102x80,107x100,23001x110,21001x12",
9: "102x70,107x90,23001x100,21001x10",
10: "102x60,107x80,23001x90,21001x9"
}, {
1: "102x200,107x300,23001x180,113x2",
2: "102x180,107x250,23001x170,113x2",
3: "102x160,107x200,23001x160,113x1",
4: "102x150,107x180,23001x150,113x1",
5: "102x120,107x150,23001x140,113x1",
6: "102x100,107x150,23001x130,21001x20",
7: "102x90,107x120,23001x120,21001x18",
8: "102x80,107x100,23001x110,21001x15",
9: "102x70,107x90,23001x100,21001x12",
10: "102x60,107x80,23001x90,21001x10"
}, {
1: "102x200,107x300,23001x180,113x2",
2: "102x180,107x250,23001x170,113x2",
3: "102x160,107x200,23001x160,113x1",
4: "102x150,107x180,23001x150,113x1",
5: "102x120,107x150,23001x140,113x1",
6: "102x100,107x150,23001x130,21001x20",
7: "102x90,107x120,23001x120,21001x18",
8: "102x80,107x100,23001x110,21001x15",
9: "102x70,107x90,23001x100,21001x12",
10: "102x60,107x80,23001x90,21001x10"
}, {
1: "102x200,107x300,23001x180,114x1",
2: "102x180,107x250,23001x170,114x1",
3: "102x160,107x200,23001x160,114x1",
4: "102x150,107x180,23001x150,113x1",
5: "102x120,107x150,23001x140,113x1",
6: "102x100,107x150,23001x130,113x1",
7: "102x90,107x120,23001x120,113x1",
8: "102x80,107x100,23001x110,113x1",
9: "102x70,107x90,23001x100,21001x20",
10: "102x60,107x80,23001x90,21001x18"
}, {
1: "102x200,107x300,23001x180,117x1",
2: "102x180,107x250,23001x170,114x1",
3: "102x160,107x200,23001x160,114x1",
4: "102x150,107x180,23001x150,114x1",
5: "102x120,107x150,23001x140,114x1",
6: "102x100,107x150,23001x130,114x1",
7: "102x90,107x120,23001x120,113x1",
8: "102x80,107x100,23001x110,113x1",
9: "102x70,107x90,23001x100,113x1",
10: "102x60,107x80,23001x90,113x1"
} ],
RANK_BETWEEN: [ 11, 21, 51, 201 ],
RANK_REWARD_BETWEENS: [ [ "107x70,341x4,20001x20", "107x60,341x3,20001x20", "107x50,341x2", "107x30,341x2" ], [ "107x70,108x4000,341x4", "107x60,108x3000,341x3", "107x50,108x2000", "107x30,108x2000" ], [ "107x70,108x8000,23001x20,20001x20", "107x60,108x7000,23001x10,20001x20", "107x50,108x6000", "107x30,108x5000" ], [ "102x50,107x70,23001x20,21001x8", "102x50,107x60,23001x10,21001x8", "102x50,107x50", "102x30,107x30" ], [ "102x50,107x70,23001x80,21001x8", "102x50,107x60,23001x70,21001x8", "102x50,107x50", "102x30,107x30" ], [ "102x50,107x70,23001x80,21001x9", "102x50,107x60,23001x70,21001x8", "102x50,107x50", "102x30,107x30" ], [ "102x50,107x70,23001x80,21001x9", "102x50,107x60,23001x70,21001x8", "102x50,107x50", "102x30,107x30" ], [ "102x50,107x70,23001x80,21001x15", "102x50,107x60,23001x70,21001x12", "102x50,107x50", "102x30,107x30" ], [ "102x50,107x70,23001x80,113x1", "102x50,107x60,23001x70,21001x20", "102x50,107x50", "102x30,107x30" ] ],
CHALLENGE_REWARD_DESC: "102x30,23001x20"
},
FUNS: {}
},
PRESTIGE_BATTLE: {
CONSTS: {
REQUIRED_LEVEL: 38,
OPEN_DAYS: [ 1, 2, 3, 4, 5, 6, 0 ],
READY_HOURS: 8,
READY_END_HOURS: 21,
START_HOURS: 8,
END_HOURS: 23,
STATUS: {
READY: 1,
RUNING: 2
},
MATCH_PLAYER_COUNT: 9,
PRACTICE_TIMES: 5,
BE_ATTACK_TIMES: 3,
ATTACK_TIMES: 1,
MONEY_REWARD_COUNT_MAP: {
1: 100,
2: 150,
3: 200
},
MONEY_ENTITY_ID: 115,
PRACTICE_TEAM_MEMBER_COUNT: 3,
REWARD_MAIL_TITLE: s.a("讨伐弗利萨奖励"),
BE_ATTACK_MAIL_TITLE: s.a("讨伐弗利萨被扰乱"),
ATTACK_MAIL_TITLE: s.a("讨伐弗利萨扰乱"),
REWARD_GEM: 30
},
FUNS: {
getSettlementMsgBody: function(e, t, a) {
return {
content: s.a("恭喜您讨伐完成,在这期间您的队伍$1扰乱了别的队伍$2次,被扰乱了$3次,在请查收您获得的奖励!"),
replaceList: [ e, t, a ]
};
},
getChallengeMsgBody: function(e, t, n) {
var r = i.sortBy(e.battleTeamMap, function(t) {
return t.playerId == e.leaderId ? 1 : 0;
}), o = "[";
for (var c in r) {
o += r[c].playerName;
o += c == r.length - 1 ? "]" : "|";
}
r = i.sortBy(t.battleTeamMap, function(e) {
return e.playerId == t.leaderId ? 1 : 0;
});
var d = "[";
for (var c in r) {
d += r[c].playerName;
d += c == r.length - 1 ? "]" : ",";
}
var p, _, m = e.topLevel, u = t.topLevel, h = i.keys(t.battleTeamMap).length, f = l.PRESTIGE_BATTLE.FUNS.getChallengeRewardRate(m, u), g = l.PRESTIGE_BATTLE.FUNS.getRewardDropList(h, f), v = "";
for (var c in g) v += "<" + a.findEntityById(g[c].entityId).kindName + "x" + Math.floor(g[c].count / h) + ">";
if (n) {
p = {
content: s.a("您的队伍$1扰乱了$2区的$3的队伍,请查收战利品."),
replaceList: [ o, t.serverId, d ]
};
_ = {
content: s.a("您的队伍$1在讨伐中被$2区的$3的队伍扰乱了,损失了$4."),
replaceList: [ d, e.serverId, o, v ]
};
} else {
p = {
content: s.a("您的队伍$1扰乱$2区的$3的队伍,然而被反杀了."),
replaceList: [ o, t.serverId, d ]
};
_ = {
content: s.a("您的队伍$1在讨伐中遭遇$2区的$3的队伍扰乱,反杀了对方."),
replaceList: [ d, e.serverId, o ]
};
}
return {
attacker: p,
defender: _
};
},
getChallengeRewardRate: function(e, t) {
var a = .1 - .1 * (e - t) / 5;
return (a = a > .2 ? .2 : a) < .05 ? .05 : a;
},
getRewardDropList: function(e, t) {
var a = Math.ceil(l.PRESTIGE_BATTLE.CONSTS.MONEY_REWARD_COUNT_MAP[e] * e * t);
return [ {
entityId: l.PRESTIGE_BATTLE.CONSTS.MONEY_ENTITY_ID,
count: a
} ];
}
}
},
TEAM_BATTLE: {
CONSTS: {
REQUIRED_LEVEL: 59,
OPEN_DAYS: [ 1, 2, 3, 4, 5, 6, 0 ],
SETTLEMENT_DAYS: 0,
READY_HOURS: 0,
READY_END_HOURS: 18,
START_HOURS: 18,
END_HOURS: 23,
STATUS: {
READY: 1,
RUNING: 2
},
MATCH_PLAYER_COUNT: 10,
PRACTICE_TIMES: 1,
ATTACK_TIMES: 3,
TEAM_MEMBER_COUNT: 3,
RANK_REWARD_DROP_LIST_MAP: {
1: [ {
entityId: 116,
count: 1e3
}, {
entityId: 118,
count: 7500
}, {
entityId: 102,
count: 2e3
}, {
entityId: 21003,
count: 6
} ],
2: [ {
entityId: 116,
count: 900
}, {
entityId: 118,
count: 7e3
}, {
entityId: 102,
count: 1800
}, {
entityId: 21003,
count: 5
} ],
3: [ {
entityId: 116,
count: 800
}, {
entityId: 118,
count: 6500
}, {
entityId: 102,
count: 1600
}, {
entityId: 21003,
count: 4
} ]
},
RANK_BETWEEN: [ 4, 7, 11, 16, 21, 26, 31, 36, 41, 81, 121, 201, 501, 1001, 3001, 5001, 10001 ],
RANK_REWARD_BETWEEN: [ [ {
entityId: 116,
count: 700
}, {
entityId: 118,
count: 6500
}, {
entityId: 102,
count: 1400
}, {
entityId: 21003,
count: 3
} ], [ {
entityId: 116,
count: 600
}, {
entityId: 118,
count: 6e3
}, {
entityId: 102,
count: 1200
}, {
entityId: 21003,
count: 3
} ], [ {
entityId: 116,
count: 500
}, {
entityId: 118,
count: 6e3
}, {
entityId: 102,
count: 1e3
}, {
entityId: 21003,
count: 3
} ], [ {
entityId: 116,
count: 400
}, {
entityId: 118,
count: 5500
}, {
entityId: 102,
count: 900
}, {
entityId: 21003,
count: 2
} ], [ {
entityId: 116,
count: 300
}, {
entityId: 118,
count: 5e3
}, {
entityId: 102,
count: 800
}, {
entityId: 21003,
count: 2
} ], [ {
entityId: 116,
count: 300
}, {
entityId: 118,
count: 4500
}, {
entityId: 102,
count: 700
}, {
entityId: 21003,
count: 2
} ], [ {
entityId: 116,
count: 300
}, {
entityId: 118,
count: 4e3
}, {
entityId: 102,
count: 600
}, {
entityId: 21003,
count: 2
} ], [ {
entityId: 116,
count: 200
}, {
entityId: 118,
count: 3500
}, {
entityId: 102,
count: 500
}, {
entityId: 21003,
count: 2
} ], [ {
entityId: 116,
count: 200
}, {
entityId: 118,
count: 3e3
}, {
entityId: 102,
count: 400
}, {
entityId: 21003,
count: 2
} ], [ {
entityId: 116,
count: 100
}, {
entityId: 118,
count: 2500
}, {
entityId: 102,
count: 300
}, {
entityId: 21003,
count: 1
} ], [ {
entityId: 116,
count: 100
}, {
entityId: 118,
count: 2e3
}, {
entityId: 102,
count: 200
}, {
entityId: 21003,
count: 1
} ], [ {
entityId: 116,
count: 100
}, {
entityId: 118,
count: 1500
}, {
entityId: 102,
count: 100
}, {
entityId: 21003,
count: 1
} ], [ {
entityId: 116,
count: 80
}, {
entityId: 118,
count: 1200
}, {
entityId: 102,
count: 100
}, {
entityId: 21003,
count: 1
} ], [ {
entityId: 116,
count: 50
}, {
entityId: 118,
count: 1e3
}, {
entityId: 102,
count: 50
}, {
entityId: 21003,
count: 1
} ], [ {
entityId: 116,
count: 50
}, {
entityId: 118,
count: 800
}, {
entityId: 102,
count: 50
}, {
entityId: 21003,
count: 1
} ], [ {
entityId: 116,
count: 30
}, {
entityId: 118,
count: 500
}, {
entityId: 102,
count: 50
}, {
entityId: 21002,
count: 2
} ], [ {
entityId: 118,
count: 500
}, {
entityId: 102,
count: 50
}, {
entityId: 21002,
count: 1
} ] ]
},
FUNS: {
getWinPoint: function(e) {
return e > 2 ? 3 : 2;
},
getChallengeMsgBody: function(e, t, a, n) {
var r = i.sortBy(e.battleTeamMap, function(t) {
return t.playerId == e.leaderId ? 1 : 0;
}), o = "[";
for (var c in r) {
o += r[c].playerName;
o += c == r.length - 1 ? "]" : "|";
}
r = i.sortBy(t.battleTeamMap, function(e) {
return e.playerId == t.leaderId ? 1 : 0;
});
var d, p = "[";
for (var c in r) {
p += r[c].playerName;
p += c == r.length - 1 ? "]" : ",";
}
if (a) {
var _ = l.TEAM_BATTLE.FUNS.getWinPoint(n);
d = {
content: s.a("您的队伍$1攻击了$2区的$3的队伍取得$4次战斗胜利,获得$5积分."),
replaceList: [ o, t.serverId, p, n, _ ]
};
} else d = {
content: s.a("您的队伍$1攻击了$2区的$3的队伍失败了,获得$4积分."),
replaceList: [ o, t.serverId, p, 0 ]
};
return {
attacker: d
};
},
getRefreshCost: function(e) {
var t = [ 0, 100, 200, 300, 400 ];
return t[e] || t[t.length - 1];
}
}
},
ARTIFACT: {
CONSTS: {
MAX_STAR: 10,
COMPOSE_REQUIRED_FRAGMENT_COUNT: 20,
COMPOSE_COST_COIN: 1e5,
UPGRADE_REQUIRED_FRAGMENT_COUNT: 20,
UPGRADE_SUCCESS_RATES: [ 0, 0, .8, .7, .6, .5, .4, .3, .2, .1, .05 ],
INCREASE_SUCCESS_RATE: .1,
INCREASE_SUCCESS_RATE_COST_GEMS: [ 0, 500, 800, 1200, 2e3, 3e3 ],
INCREASE_SUCCESS_RATE_MAX_TIMES: 5
},
FUNS: {
getUpgradeStarRate: function(e, t) {
var a = (10 * l.ARTIFACT.CONSTS.UPGRADE_SUCCESS_RATES[e] + l.ARTIFACT.CONSTS.INCREASE_SUCCESS_RATE * t * 10) / 10;
return a > 1 ? 1 : a;
}
}
},
CAPSULE: {
CONSTS: {
ATTR_VALUES_MAP: {
redHitDmgRate: [ .05, .08, .11, .17 ],
atkSpeedRate: [ .12, .19, .26, .36 ],
incHpRate: [ .08, .13, .18, .24 ],
addMpRecoverRate: [ .03, .06, .1, .14 ],
ignoreCritRate: [ .1, .14, .19, .27 ],
unDeBuffRate: [ .07, .13, .2, .3 ],
addDmgRate2: [ .06, .1, .15, .22 ],
ignoreAddDmgRate2: [ .08, .12, .17, .24 ],
critRate: [ .08, .12, .16, .23 ],
addCritDmgRate: [ .18, .26, .34, .45 ],
dodgeRate: [ .06, .1, .14, .2 ],
atkIgnoreDodgeRate: [ .08, .12, .16, .23 ],
addHitRate: [ .1, .14, .18, .23 ],
skillDmg2HpRate: [ .05, .08, .11, .15 ],
beginMaxHpRateShield: [ .1, .15, .22, .33 ],
atkShieldExtDmgRate: [ .26, .35, .44, .55 ],
addHpRecoverRate: [ .11, .16, .21, .28 ],
hitReduceRecoverHp: [ .16, .22, .27, .35 ],
hitMaxHpRate: [ .58, .48, .38, .26 ],
reviveAddDmgRate: [ .08, .16, .24, .35 ],
beginHitDmgRate: [ .15, .21, .27, .35 ],
beginHitMdmgRate: [ .15, .21, .27, .35 ],
hitReduceAtkSpeed: [ .2, .27, .35, .46 ],
hitUnReviveRate: [ .15, .19, .24, .3 ],
keepMp: [ 40, 60, 90, 120 ],
hitReduceMp: [ 60, 90, 120, 160 ],
hitRateSilence2: [ .06, .09, .12, .15 ],
hitRepeledRate2: [ .04, .06, .08, .12 ],
hitBleedingHpRate: [ .01, .015, .02, .03 ],
recoverHp10SecRate2: [ .03, .04, .05, .06 ],
skill0AddDmgRate: [ .18, .24, .3, .38 ],
beginRecoverFullMpRate: [ .13, .18, .24, .32 ],
removeDeBuffSec: [ 15, 14, 12, 9 ],
hitUnRecoverHpRate: [ .05, .06, .07, .1 ],
reboundDmgRate: [ .06, .09, .14, .2 ],
privateUnConfusedRate: [ .15, .22, .3, .4 ],
beginAddDmgRate: [ .15, .2, .25, .33 ],
addRecoverHpRedHitDmgRate: [ .04, .05, .07, .1 ],
hitUnRecoverMpRate: [ .04, .05, .07, .1 ],
ignoreUnDeBuffRate: [ .13, .23, .33, .45 ]
},
ATTR_NAME_MAP: {
redHitDmgRate: s.a("免伤能力"),
atkSpeedRate: s.a("强化攻速"),
incHpRate: s.a("强化生命"),
addMpRecoverRate: s.a("能量回复"),
ignoreCritRate: s.a("暴击抵抗"),
unDeBuffRate: s.a("负面抵抗"),
addDmgRate2: s.a("强化攻击"),
ignoreAddDmgRate2: s.a("无视增伤"),
critRate: s.a("强化暴击"),
addCritDmgRate: s.a("强化暴伤"),
dodgeRate: s.a("强化闪避"),
atkIgnoreDodgeRate: s.a("无视闪避"),
addHitRate: s.a("精准打击"),
skillDmg2HpRate: s.a("技能回血"),
beginMaxHpRateShield: s.a("护盾环绕"),
atkShieldExtDmgRate: s.a("护盾破除"),
addHpRecoverRate: s.a("强化回血"),
hitReduceRecoverHp: s.a("回血削弱"),
hitMaxHpRate: s.a("受击上限"),
reviveAddDmgRate: s.a("浴火重生"),
beginHitDmgRate: s.a("物理免伤"),
beginHitMdmgRate: s.a("魔法免伤"),
hitReduceAtkSpeed: s.a("强化减速"),
hitUnReviveRate: s.a("禁止复活"),
keepMp: s.a("能量增加"),
hitReduceMp: s.a("能量破坏"),
hitRateSilence2: s.a("强化沉默"),
hitRepeledRate2: s.a("强化击退"),
hitBleedingHpRate: s.a("流血割裂"),
recoverHp10SecRate2: s.a("生命回复"),
skill0AddDmgRate: s.a("强化普攻"),
beginRecoverFullMpRate: s.a("初始暴怒"),
removeDeBuffSec: s.a("负面净化"),
hitUnRecoverHpRate: s.a("禁止回血"),
reboundDmgRate: s.a("伤害反弹"),
privateUnConfusedRate: s.a("抵抗魅惑"),
beginAddDmgRate: s.a("初始爆发"),
addRecoverHpRedHitDmgRate: s.a("坚定不移"),
hitUnRecoverMpRate: s.a("能量阻断"),
ignoreUnDeBuffRate: s.a("无视抵抗")
},
ATTR_NAME_SKILL_ID_MAP: {
redHitDmgRate: 1,
atkSpeedRate: 2,
incHpRate: 3,
addMpRecoverRate: 4,
ignoreCritRate: 5,
unDeBuffRate: 6,
addDmgRate2: 7,
ignoreAddDmgRate2: 8,
critRate: 9,
addCritDmgRate: 10,
dodgeRate: 11,
atkIgnoreDodgeRate: 12,
addHitRate: 13,
skillDmg2HpRate: 14,
beginMaxHpRateShield: 15,
atkShieldExtDmgRate: 16,
addHpRecoverRate: 17,
hitReduceRecoverHp: 18,
hitMaxHpRate: 19,
reviveAddDmgRate: 20,
beginHitDmgRate: 21,
beginHitMdmgRate: 22,
hitReduceAtkSpeed: 23,
hitUnReviveRate: 24,
keepMp: 25,
hitReduceMp: 26,
hitRateSilence2: 27,
hitRepeledRate2: 28,
hitBleedingHpRate: 29,
recoverHp10SecRate2: 30,
skill0AddDmgRate: 31,
beginRecoverFullMpRate: 32,
removeDeBuffSec: 33,
hitUnRecoverHpRate: 34,
reboundDmgRate: 35,
privateUnConfusedRate: 36,
beginAddDmgRate: 37,
addRecoverHpRedHitDmgRate: 38,
hitUnRecoverMpRate: 39,
ignoreUnDeBuffRate: 40
}
},
FUNS: {
getAttrDesc: function(e, t) {
var a = [ s.t("下级"), s.t("中级"), s.t("上级"), s.t("顶级") ];
return s.t(l.CAPSULE.CONSTS.ATTR_NAME_MAP[e]) + "(" + a[t - 1] + ")";
},
getResetCostMap: function(e) {
var t = {};
t[101] = {
60001: 1e5,
60002: 3e5,
60003: 6e5,
60004: 15e5,
60005: 3e6,
60006: 5e6
}[e];
t[60007] = {
60001: 20,
60002: 50,
60003: 120,
60004: 300,
60005: 750,
60006: 2e3
}[e];
return t;
},
getComposeCostMap: function(e) {
var t = {};
t[101] = {
60002: 5e5,
60003: 1e6,
60004: 15e5,
60005: 3e6,
60006: 5e6
}[e];
t[{
60002: 60001,
60003: 60002,
60004: 60003,
60005: 60004,
60006: 60005
}[e]] = {
60002: 5,
60003: 5,
60004: 5,
60005: 5,
60006: 3
}[e];
60006 == e && (t[60008] = 1);
return t;
},
buildSkillAttrs: function(e) {
var t = i.keys(l.CAPSULE.CONSTS.ATTR_VALUES_MAP), n = [ "incHpRate", "unDeBuffRate", "beginMaxHpRateShield", "beginHitDmgRate", "beginHitMdmgRate", "hitUnReviveRate", "hitRateSilence2", "hitRepeledRate2", "hitBleedingHpRate", "recoverHp10SecRate2", "beginRecoverFullMpRate", "removeDeBuffSec", "reboundDmgRate" ], s = a.findEntityById(e), r = [];
for (var o in s.extra.levelWeightMap) r.push({
level: Number(o),
weight: s.extra.levelWeightMap[o]
});
for (var c = {}, d = 0; d < s.extra.buildCount; d++) {
for (var p = l.FUNS.randomByWeight(r), _ = i.sample(t); c[_] || 60001 == e && i.include(n, _); ) _ = i.sample(t);
c[_] = {
level: p.level
};
}
return c;
},
getComposeItemLevel: function(e) {
var t = 0;
for (var a in e.skillInfo) t += e.skillInfo[a].level;
return t;
}
}
},
FRUIT: {
CONSTS: {
MAX_STAR: 10,
COMPOSE_REQUIRED_FRAGMENT_COUNT: 20,
COMPOSE_COST_COIN: 1e6,
UPGRADE_REQUIRED_FRAGMENT_COUNT: 20,
UPGRADE_SUCCESS_RATES: [ 0, 0, .8, .7, .6, .5, .4, .3, .2, .1, .05 ],
INCREASE_SUCCESS_RATE: .1,
INCREASE_SUCCESS_RATE_COST_GEMS: [ 0, 800, 1500, 2500, 4e3, 5500 ],
INCREASE_SUCCESS_RATE_MAX_TIMES: 5
},
FUNS: {
getUpgradeStarRate: function(e, t) {
var a = (10 * l.ARTIFACT.CONSTS.UPGRADE_SUCCESS_RATES[e] + l.ARTIFACT.CONSTS.INCREASE_SUCCESS_RATE * t * 10) / 10;
return a > 1 ? 1 : a;
},
getPveUpPower: function(e) {
return 1.5 * e / 100;
}
}
},
SHIP: {
CONSTS: {
MAX_LEVEL: 100,
MAX_STAR: 10,
STAR_MAX_LEVEL_SCALE: 10,
COMPOSE_REQUIRED_FRAGMENT_COUNT: 50,
COMPOSE_COST_COIN: 2e5,
UPGRADE_COST_GEM: 200,
ADD_EXP_COST_ENTITY_ID: 108,
DMG_TO_MONEY_RATE: .002,
MOB_ID_MAP: {
1: 1131,
2: 1141,
3: 1151
}
},
FUNS: {
getAttrVal: function(e) {
var t = a.findEntityById(e.kindId);
return (100 * (e.star - 1) + e.level) * t.growth;
},
getUpgradeSkillCostGem: function(e) {
return 3 * e;
},
getUpgradeStarCostFragment: function(e) {
var t = [ 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 50 ];
return t[e] || t[t.length - 1];
}
}
},
SIX_SMAP: {
CONSTS: {
DAY_ROLE_CLASS_IDS_MAP: {
1: [ 1, 2, 3, 4, 5, 6, 23, 25 ],
2: [ 7, 8, 9, 10, 1, 3, 23, 22 ],
3: [ 19, 30, 31, 32, 33, 37 ],
4: [ 12, 13, 14, 15, 16, 17, 18, 29 ],
5: [ 11, 21, 27, 24, 34, 35, 36 ],
6: [ 18, 20, 26, 29, 32, 33, 28 ],
0: [ 27, 22, 24, 34, 38, 39 ]
},
DAY_TITLE_MAP: {
1: s.a("赛亚人之家"),
2: s.a("龟仙派"),
3: s.a("人造人"),
4: s.a("弗利萨军团"),
5: s.a("宇宙强战士"),
6: s.a("宇宙强敌"),
0: s.a("超级赛亚人")
}
},
FUNS: {}
},
SIX_EXPEDITION: {
CONSTS: {
LEVEL_80_REWARD_CLASS_ID: 304,
LEVEL_85_REWARD_CLASS_ID: 305,
CHALLENGER_COUNT: 12,
STATUS: {
UN_COMPLETE: 1,
CAN_RECEIVE: 2
}
},
FUNS: {
getStandardPower: function(e, t) {
return t * (.1 * Math.random() + .95);
},
getRewardCoin: function(e, t) {
e /= 2;
return Math.round((15e3 + 100 * t) * (.00195 * Math.pow(e, 3) - .02403 * Math.pow(e, 2) + .12922 * e + .89286) * t / 25);
}
}
},
SIX_PRACTICE: {
CONSTS: {
MATCH_PLAYER_COUNT: 18,
TYPE_NEED_VIP_MAP: {
1: 0,
2: 10,
3: 13
},
CHALLENGE_TIMES_MAP: {
1: 2,
2: 3,
3: 4
},
BE_ATTACK_TIMES_MAP: {
1: 2,
2: 3,
3: 4
},
PRACTICE_TIME_MAP: {
1: 216e5,
2: 324e5,
3: 432e5
},
CKL_ENTITY_ID: 49918,
CKL_REWARD_COUNT_MAP: {
1: 14,
2: 21,
3: 28
},
REWARD_MAIL_TITLE: s.a("维斯训练奖励"),
BE_ATTACK_MAIL_TITLE: s.a("维斯训练被扰乱"),
DEFENSE_TIMES: 1
},
FUNS: {
getType: function(e) {
var t = 1;
for (var a in l.SIX_PRACTICE.CONSTS.TYPE_NEED_VIP_MAP) e >= l.SIX_PRACTICE.CONSTS.TYPE_NEED_VIP_MAP[a] && (t = a);
return t;
},
getSettlementMsgBody: function(e) {
return {
content: s.a("恭喜您<维斯训练>已训练完成,在这期间您被扰乱了$1次,在请查收您获得的奖励!"),
replaceList: [ e ]
};
},
getBeAttackMsgBody: function(e, t, i, n, r, o, c) {
var d = l.SIX_PRACTICE.FUNS.getChallengeRewardRate(r, o), p = l.SIX_PRACTICE.FUNS.getRewardDropList(e, d), _ = "";
for (var m in p) _ += "<" + a.findEntityById(p[m].entityId).kindName + "x" + p[m].count + ">";
return _ = c ? {
content: s.a("您的队伍在<维斯训练>被$1区的$2扰乱了,损失了$3."),
replaceList: [ i, n, _ ]
} : {
content: s.a("您的队伍在<维斯训练>成功抵挡了$1区的$2的扰乱."),
replaceList: [ i, n ]
};
},
getChallengeRewardRate: function(e, t) {
var a = .1 - .1 * (e - t) / 5;
return (a = a > .2 ? .2 : a) < .05 ? .05 : a;
},
getRewardDropList: function(e, t) {
var a = l.SIX_PRACTICE.FUNS.getType(e), i = Math.ceil(l.SIX_PRACTICE.CONSTS.CKL_REWARD_COUNT_MAP[a] * t);
return [ {
entityId: l.SIX_PRACTICE.CONSTS.CKL_ENTITY_ID,
count: i
} ];
},
getPracticeHours: function(e) {
var t = l.SIX_PRACTICE.FUNS.getType(e);
return l.SIX_PRACTICE.CONSTS.PRACTICE_TIME_MAP[t] / 36e5;
}
}
},
WORSHIP_BATTLE: {
CONSTS: {
APPLY_BEGIN_DAY_OF_WEEK: 0,
APPLY_END_DAY_OF_WEEK: 3,
BE_32_DAY_OF_WEEK: 3,
BE_32_HOUR: 20,
BE_16_DAY_OF_WEEK: 4,
BE_16_HOUR: 20,
BE_8_DAY_OF_WEEK: 5,
BE_8_HOUR: 20,
BE_4_DAY_OF_WEEK: 6,
BE_4_HOUR: 20,
TITLE_ITEM_IDS: [ 421, 422, 423, 424, 425 ],
LEVEL_BETWEEN: [ 61, 71, 81, 91, 96 ],
LEVEL_TYPE_BETWEEN: [ "level_61_70", "level_71_80", "level_81_90", "level_91_95", "level_96_100" ],
STATUS: {
WAIT_APPLY: 1,
APPLY: 2,
WAIT_BE_32: 3,
WAIT_BE_16: 4,
WAIT_BE_8: 5,
WAIT_BE_4: 6
},
APPLY_REWARD_DROP_LIST: [ {
entityId: 116,
count: 50
} ],
BE_32_REWARD_DROP_LIST: [ {
entityId: 116,
count: 120
}, {
entityId: 115,
count: 500
}, {
entityId: 101,
count: 3e6
} ],
BE_16_REWARD_DROP_LIST: [ {
entityId: 116,
count: 120
}, {
entityId: 115,
count: 1e3
}, {
entityId: 115,
count: 500
} ],
BE_8_REWARD_DROP_LIST: [ {
entityId: 116,
count: 150
}, {
entityId: 115,
count: 1500
}, {
entityId: 102,
count: 200
} ],
BE_4_REWARD_DROP_LIST: [ {
entityId: 116,
count: 180
}, {
entityId: 115,
count: 2e3
}, {
entityId: 102,
count: 200
} ],
CHAMPION_DROP_LIST: [ {
entityId: 116,
count: 180
}, {
entityId: 115,
count: 2500
}, {
entityId: 102,
count: 200
}, {
entityId: 101,
count: 3e6
} ],
BET_COST_GEM: 80,
BET_WIN_GET_X: 2
},
FUNS: {
getWorshipRewardDropList: function(e) {
for (var t = [ 22, 40, 60, 70, 80, 90 ], a = [ [ {
entityId: 101,
count: 2e4
} ], [ {
entityId: 101,
count: 4e4
} ], [ {
entityId: 116,
count: 3
} ], [ {
entityId: 116,
count: 4
} ], [ {
entityId: 116,
count: 5
} ], [ {
entityId: 116,
count: 6
} ] ], i = a[0], n = 0; n < t.length; n++) e > t[n] && (i = a[n]);
return i;
}
}
},
DOUBLE_BATTLE: {
CONSTS: {
FIRST_APPLY_BEGIN_TIME: "2023-01-01",
DELAY_DAYS: 15,
THEME_TITLE_ITEM_IDS: {
1: [ 482, 482, 482, 482, 482 ],
2: [ 485, 485, 485, 485, 485 ],
3: [ 486, 486, 486, 486, 486 ],
4: [ 487, 487, 487, 487, 487 ],
5: [ 488, 488, 488, 488, 488 ]
},
LEVEL_BETWEEN: [ 61, 71, 81, 91, 96 ],
LEVEL_TYPE_BETWEEN: [ "level_61_70", "level_71_80", "level_81_90", "level_91_95", "level_96_100" ],
STATUS: {
WAIT_APPLY: 1,
APPLY: 2,
WAIT_BE_32: 3,
WAIT_BE_16: 4,
WAIT_BE_8: 5,
WAIT_BE_4: 6
},
APPLY_REWARD_DROP_LIST: [ {
entityId: 109,
count: 50
} ],
BE_32_REWARD_DROP_LIST: [ {
entityId: 109,
count: 120
}, {
entityId: 101,
count: 3e6
} ],
BE_16_REWARD_DROP_LIST: [ {
entityId: 109,
count: 120
}, {
entityId: 115,
count: 500
} ],
BE_8_REWARD_DROP_LIST: [ {
entityId: 109,
count: 150
}, {
entityId: 102,
count: 200
} ],
BE_4_REWARD_DROP_LIST: [ {
entityId: 109,
count: 180
}, {
entityId: 115,
count: 500
}, {
entityId: 102,
count: 200
} ],
CHAMPION_DROP_LIST: [ {
entityId: 109,
count: 180
}, {
entityId: 115,
count: 1e3
}, {
entityId: 102,
count: 200
}, {
entityId: 101,
count: 3e6
} ],
BET_COST_GEM: 80,
BET_WIN_GET_X: 2,
THEME_TITLE_MAP: {
1: s.a("超级赛亚双龙争霸"),
2: s.a("人造人双龙争霸"),
3: s.a("魔人布欧双龙争霸"),
4: s.a("宇宙强者双龙争霸"),
5: s.a("传超赛亚双龙争霸")
},
THEME_ROLE_CLASS_IDS_MAP: {
1: [ 22, 39, 41, 44, 50, 54, 56, 66, 71, 76, 81, 86 ],
2: [ 24, 37, 42, 47, 57, 62, 65, 67, 73, 77, 82, 87 ],
3: [ 28, 38, 43, 46, 49, 58, 63, 64, 72, 78, 83 ],
4: [ 34, 36, 48, 51, 52, 53, 59, 61, 74, 79, 84, 88 ],
5: [ 35, 40, 45, 55, 60, 68, 69, 70, 75, 80, 85 ]
}
},
FUNS: {
getWorshipRewardDropList: function(e) {
for (var t = [ 22, 40, 60, 70, 80, 90 ], a = [ [ {
entityId: 101,
count: 1e4
} ], [ {
entityId: 101,
count: 2e4
} ], [ {
entityId: 102,
count: 8
} ], [ {
entityId: 102,
count: 10
} ], [ {
entityId: 109,
count: 1
} ], [ {
entityId: 109,
count: 2
} ] ], i = a[0], n = 0; n < t.length; n++) e > t[n] && (i = a[n]);
return i;
}
}
},
HONOUR: {
CONSTS: {
POINT_BETWEEN: [ 0, 20, 50, 80, 150, 200, 400, 800, 1200, 1500, 2e3, 2500, 3e3, 4e3, 6e3, 8e3, 12e3 ],
LEVEL_REWARD_MAP: {
1: "97x30",
2: "483x1",
3: "530x1",
4: "97x200",
5: "804x1",
6: "492x1",
7: "97x400",
8: "531x1",
9: "532x1",
10: "489x1",
11: "97x400",
12: "529x1",
13: "533x1",
14: "490x1",
15: "534x1",
16: "491x1"
},
LEVEL_TITLE_MAP: {
0: "",
1: s.a("【战五渣】"),
2: s.a("【武道会冠军】"),
3: s.a("【星球毁灭者】"),
4: s.a("【超级赛亚人】"),
5: s.a("【速趴赛亚人】"),
6: s.a("【超级赛亚人2】"),
7: s.a("【魔化赛亚人】"),
8: s.a("【超级赛亚人3】"),
9: s.a("【黄金猿异变】"),
10: s.a("【超级赛亚人4】"),
11: s.a("【超级赛亚人之神】"),
12: s.a("【超越极限】"),
13: s.a("【神之领域】"),
14: s.a("【永无止境】"),
15: s.a("【次元最强】"),
16: s.a("【天下无敌】")
}
},
FUNS: {
getLevel: function(e) {
return l.FUNS.getValueByBetween(l.HONOUR.CONSTS.POINT_BETWEEN, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ], e);
},
getNextLevelPoint: function(e) {
return l.HONOUR.CONSTS.POINT_BETWEEN[e + 1];
}
}
},
ISLAND: {
CONSTS: {
PRACTICE_TIME: 288e5,
CHALLENGE_TIMES: 6,
DEFENSE_TIMES: 3,
MONEY_ENTITY_ID: 40,
RES_LEVEL_IDS_MAP: {
1: [ 1, 2, 3 ],
2: [ 4, 5, 6, 7, 8, 9 ],
3: [ 10, 11, 12, 13, 14, 15, 16, 17, 18 ],
4: -1
},
CHALLENGE_ROLE_LOCK_TIME: 144e5,
RES_HALF_HOURS_REWARD_MONEY_COUN_MAP: {
1: 12,
2: 8,
3: 6,
4: 4
},
RES_NAME_MAP: {
1: s.a("顶级"),
2: s.a("高级"),
3: s.a("中级"),
4: s.a("低级")
},
AREA_NEED_ROLE_LEVEL_MAP: {
1: 61,
2: 71,
3: 81,
4: 91
},
RES_LEVEL_EXT_DROP_DESC: {
1: "353x1_W25,352x1_W15,19x1_W10",
2: "353x1_W20,352x1_W10,19x1_W5",
3: "353x1_W20,352x1_W10,19x1_W5"
},
RES_LEVEL_EXT_DROP_RATE: {
1: 50,
2: 35,
3: 35
}
},
FUNS: {
getAreaId: function(e) {
return l.FUNS.getValueByBetween([ 61, 71, 81, 91 ], [ 1, 2, 3, 4 ], e);
},
getBuyChallengeTimesCost: function(e) {
var t = [ 0, 30, 30, 40, 40, 50 ];
return {
costId: l.ISLAND.CONSTS.MONEY_ENTITY_ID,
costCount: t[e] || i.last(t)
};
},
getReviveRoleCost: function(e) {
var t = Math.ceil((e - Date.now()) / 36e5);
return {
costId: l.ISLAND.CONSTS.MONEY_ENTITY_ID,
costCount: 10 * t
};
},
getChallengeRewardRate: function(e, t) {
var a = .15 - .15 * (e - t) / 10;
return (a = a > .1995 ? .1995 : a) < .099 ? .099 : a;
},
getResLevel: function(e) {
var t = 4;
for (var a in l.ISLAND.CONSTS.RES_LEVEL_IDS_MAP) {
var n = l.ISLAND.CONSTS.RES_LEVEL_IDS_MAP[a];
i.include(n, e) && (t = Number(a));
}
return t;
},
getRewardDropList: function(e, t) {
var a = l.ISLAND.FUNS.getResLevel(e.resourceId), n = Date.now() > e.finishTime ? e.finishTime : Date.now(), s = Math.floor((n - e.ctime) / 18e5), r = l.ISLAND.FUNS.getAreaId(e.playerId), o = [], c = Math.ceil(l.ISLAND.CONSTS.RES_HALF_HOURS_REWARD_MONEY_COUN_MAP[a] * s * t);
c > 0 && o.push({
entityId: l.ISLAND.CONSTS.MONEY_ENTITY_ID,
count: c
});
i.include([ 1, 2 ], r) && s > 0 && o.push({
entityId: l.CONSTS.ENTITY_ID.EXP,
count: 10 * s
});
return o;
}
}
},
TIME_PEAK: {
CONSTS: {
ITEM_TYPE: {
ENEMY: 1,
BIG_BOX: 2,
BOX: 3,
SPA: 4,
ROLE_CAMP: 5,
REVIVE_ALTAR: 6
},
NOMAL_ITEM_STATUS: {
WAIT_USE: 1,
COMPLETE: 2
},
ITEM_STATUS_MAP: {
1: {
WAIT_BATTLE: 1,
WAIT_SELECT_BLESSING: 2,
COMPLETE: 3
}
},
ENEMY_BLESSING_COLORS_MAP: {
1: [ 3, 5 ],
2: [ 5, 7 ],
3: [ 7, 7 ]
},
PRE_MAP_NEED_COMPLETE_RATE: .6,
SPECIAL_BLESSING_IDS: [ 1801, 1811, 1821, 1831, 1841, 1851, 1861, 1871, 1881 ],
NPC_GET_BLESSING_ID_MAP: {
201: 1801,
202: 1811,
203: 1821,
206: 1831,
415: 1841,
418: 1841,
423: 1841,
902: 1851
},
INIT_BATTLE_LEVEL: 50,
GROUP2_OPEN_DAYS: 14
},
FUNS: {}
},
STAR_SIGN: {
CONSTS: {
MAX_LEVEL: 10,
COLOR_ATTR_VALUE_RANGE_MAP: {
critRate: [ [ 1, 3 ], [ 3, 5 ], [ 5, 7 ], [ 7, 9 ], [ 9, 12 ] ],
incAtkRate: [ [ 2, 4 ], [ 4, 6 ], [ 6, 8 ], [ 8, 10 ], [ 10, 13 ] ],
incHpRate: [ [ 4, 6 ], [ 6, 8 ], [ 8, 10 ], [ 10, 12 ], [ 12, 15 ] ],
atkSpeedRate: [ [ 6, 8 ], [ 8, 10 ], [ 10, 12 ], [ 12, 14 ], [ 14, 17 ] ],
cdSpeedRate: [ [ 2, 3 ], [ 3, 4 ], [ 4, 5 ], [ 5, 6 ], [ 6, 8 ] ],
unDeBuffRate: [ [ 2, 4 ], [ 4, 6 ], [ 6, 8 ], [ 8, 10 ], [ 10, 13 ] ],
ignoreCritRate: [ [ 4, 6 ], [ 6, 8 ], [ 8, 10 ], [ 10, 12 ], [ 12, 15 ] ],
addMpRecoverRate: [ [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ], [ 5, 7 ] ],
addHpRecoverRate: [ [ 3, 5 ], [ 5, 7 ], [ 7, 9 ], [ 9, 11 ], [ 11, 14 ] ],
skipHitRate: [ [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ], [ 5, 7 ] ],
hitReduceMpRate: [ [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 4, 5 ], [ 5, 7 ] ],
ignoreUnDeBuffRate: [ [ 5, 7 ], [ 7, 9 ], [ 9, 11 ], [ 11, 13 ], [ 13, 16 ] ]
},
ATTR_NAME_SUIT_SKILL_IDS_MAP: {
critRate: [ 3011, 3012 ],
incAtkRate: [ 3021, 3022 ],
incHpRate: [ 3031, 3032 ],
atkSpeedRate: [ 3041, 3042 ],
cdSpeedRate: [ 3051, 3052 ],
unDeBuffRate: [ 3061, 3062 ],
ignoreCritRate: [ 3071, 3072 ],
addMpRecoverRate: [ 3081, 3082 ],
addHpRecoverRate: [ 3091, 3092 ],
skipHitRate: [ 3101, 3102 ],
hitReduceMpRate: [ 3111, 3112 ],
ignoreUnDeBuffRate: [ 3121, 3122 ]
}
},
FUNS: {
getGrowth: function(e, t) {
var a = l.STAR_SIGN.CONSTS.COLOR_ATTR_VALUE_RANGE_MAP[e][t - 1];
return i.random(a[0], a[1]) / 1e3;
},
getUpgradeCost: function(e, t, a) {
return {
costSoulId: {
critRate: 61201,
incAtkRate: 61202,
incHpRate: 61203,
atkSpeedRate: 61204,
cdSpeedRate: 61205,
unDeBuffRate: 61206,
ignoreCritRate: 61207,
addMpRecoverRate: 61208,
addHpRecoverRate: 61209,
skipHitRate: 61210,
hitReduceMpRate: 61211,
ignoreUnDeBuffRate: 61212
}[e],
costSoulCount: {
1: [ 1, 1, 2, 2, 3, 4, 5, 5, 6 ],
2: [ 2, 2, 4, 4, 6, 8, 10, 10, 12 ],
3: [ 4, 4, 8, 8, 12, 16, 20, 20, 24 ],
4: [ 6, 6, 12, 12, 18, 24, 30, 30, 36 ],
5: [ 8, 8, 16, 16, 24, 32, 40, 40, 50 ]
}[t][a - 1],
costStoneId: 61001,
costStoneCount: {
1: [ 5, 5, 10, 10, 15, 20, 25, 25, 30 ],
2: [ 10, 10, 20, 20, 30, 40, 50, 50, 60 ],
3: [ 20, 20, 40, 40, 60, 80, 100, 100, 120 ],
4: [ 30, 30, 60, 60, 90, 120, 150, 150, 180 ],
5: [ 40, 40, 80, 80, 120, 160, 200, 200, 250 ]
}[t][a - 1]
};
},
getDecomposeReward: function(e, t, a) {
var i = [];
i.push({
entityId: 61002,
count: {
1: 2,
2: 4,
3: 8,
4: 16,
5: 30
}[t]
});
for (var n, s, r = 0, o = 0, c = 1; c < a; c++) {
var d = l.STAR_SIGN.FUNS.getUpgradeCost(e, t, c);
n = d.costSoulId;
r += d.costSoulCount;
s = d.costStoneId;
o += d.costStoneCount;
}
var p = Math.ceil(r / 2);
p > 0 && i.push({
entityId: n,
count: p
});
var _ = Math.ceil(o / 2);
_ > 0 && i.push({
entityId: s,
count: _
});
return i;
}
}
},
AD: {
CONSTS: {
TYPE: {
SMAP_TIMES: 1,
SIGN: 2,
DIAL: 3,
POINT: 4,
GUILD_WORSHIP: 5,
TASK_ACTIVE_POINT: 6,
BUY_ACTION_POINT: 7,
BUY_COIN: 8
},
TYPE_TIMES_MAP: {
1: 3,
2: 1,
3: 1,
4: 4,
5: 1,
6: 3,
7: 1,
8: 1
}
},
FUNS: {
getNextViewTime: function(e, t) {
var a = t[e] || [], n = i.last(a);
if (!n) return 0;
var s = new Date().setHours(0, 0, 0, 0) + l.CONSTS.A_DAY, r = l.AD.CONSTS.TYPE, o = l.AD.CONSTS.TYPE_TIMES_MAP;
return e == r.SMAP_TIMES && a.length >= o[r.SMAP_TIMES] ? s : i.include([ r.SIGN, r.DIAL, r.GUILD_WORSHIP, r.BUY_ACTION_POINT ], e) && a.length >= 1 ? s : e == r.POINT ? a.length >= o[r.POINT] ? s : n + 216e5 : 0;
}
}
}
};
t.exports = l;
cc._RF.pop();
}, {
cryptoApi: "cryptoApi",
dataApi: "dataApi",
i18n: "i18n",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
