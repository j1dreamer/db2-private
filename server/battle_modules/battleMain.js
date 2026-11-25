battleMain: [ function(e, a) {
"use strict";
cc._RF.push(a, "eca6faTz4hAa4UKSNxFgDK1", "battleMain");
var t = e("underscore"), n = (e("battle.util"), e("dataApi")), i = e("battle.mt_rand"), r = e("battle.consts"), s = {
_init: function() {
this.zoneCount = 0;
this.rolesCount = 0;
this.diedNum = 0;
this.battleType = null;
this.isAuto = !1;
this.isInstant = !1;
this.isShow = !1;
this.isPlayback = !1;
this.seed = 0;
this.random = null;
this.manualShipSkillIds = [];
this.manualSkillIds = [];
this.usedMap = {};
this.damageMap = {};
this.preManualRecordMap = {};
this.manualRecordMap = {};
this.useSkillIdInfos = [];
this.isWin = !1;
this.debug = {
skillNum: -1,
isMobStop: !1,
isNoBeginMove: !1,
isDelayStart: !1,
keepRoleHpMap: {}
};
}
};
s._init();
a.exports = s;
var o = e("battle.fightHandler");
s.isPVP = function() {
var e = r.BATTLE_TYPE;
return t.include([ e.ARENA_PK, e.PRACTICE, e.BEGIN_BATTLE, e.ISLAND ], s.battleType);
};
s.genManualSkillInfo = function(e, a) {
var i = [], r = e.ships.concat(a ? a.ships : []);
t.each(r, function(e) {
i.push(e.skill.kindId);
});
var s = [], o = e.roles.concat(a ? a.roles : []);
t.each(o, function(e) {
var a = n.role.findById(e.kindId);
a && t.findWhere(e.skills, {
kindId: a.skillIds[0]
}) && s.push(a.skillIds[0]);
});
return {
shipSkillIds: i,
roleSkillIds: s
};
};
s.pause = function() {
var a = e("battleScene");
if (a.instance) {
o.area.timer.close(!0);
var t = a.instance.areaNode.entitys;
for (var n in t) {
var i = t[n];
i.node.pauseAllActions();
i.armatureComponent.pause_();
}
}
};
s.resume = function() {
var a = e("battleScene");
if (a.instance && !a.instance.pausePanel.isPanel) {
o.area.timer.run();
var t = a.instance.areaNode.entitys;
for (var n in t) {
var i = t[n];
i.node.resumeAllActions();
i.armatureComponent.resume_();
}
}
};
s.exit = function() {
o.area.timer.close();
var e = s.seed;
s._init();
s.seed = e;
};
s.setSeed = function(e) {
this.seed = e;
i.srand(e);
s.random = function() {
return i.rand() / i.getrandmax();
};
s.randomRange = function(e, a) {
return e + Math.floor(s.random() * (a - e + 1));
};
};
s.smapBattle = function(e, a, t) {
var n = s.genManualSkillInfo(e);
s.rolesCount = e.roles.length;
s.begin = Date.now();
s.isAuto = s.isInstant = !1;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.SMAP;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.manualRecordMap = {};
s.damageMap = {};
s.usedMap = {};
s.setSeed(Date.now());
o.smapBattle(e, a, t);
};
s.smapBattleNext = function() {
s.preManualRecordMap = s.manualRecordMap;
s.manualRecordMap = {};
s.useSkillIdInfos = [];
o.smapBattleNext();
};
s.smapBattleInstant = function(e, a, t) {
var n = s.genManualSkillInfo(e);
s.isAuto = t;
s.isInstant = !0;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.SMAP;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
var i = s.preManualRecordMap, l = s.manualRecordMap;
s.manualRecordMap = s.preManualRecordMap;
s.damageMap = {};
s.usedMap = {};
s.setSeed(s.seed);
s.isWin = !1;
o.smapBattle(e, a, {});
if (s.isWin) {
s.manualRecordMap = l;
s.useSkillIdInfos = [];
o.smapBattleNext();
}
return {
isWin: s.isWin,
seed: s.seed,
manualRecordMap1: i,
manualRecordMap2: l,
tickNumber: o.area.timer.tickNumber
};
};
s.expeditionBattle = function(e, a) {
var t = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = s.isInstant = !1;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.EXPEDITION;
s.manualShipSkillIds = t.shipSkillIds;
s.manualSkillIds = t.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
s.setSeed(Date.now());
o.pkBattle(e, a);
};
s.pkBattleInstant = function(e, a, t) {
var n = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = s.isInstant = !0;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.ARENA_PK;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
t = t || Date.now();
s.setSeed(t);
o.pkBattle(e, a);
return {
isWin: s.isWin,
seed: t
};
};
s.pkBattle = function(e, a, t, n) {
var i = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = !0;
s.isInstant = !1;
s.isShow = !s.isInstant;
s.isPlayback = n || !1;
s.battleType = r.BATTLE_TYPE.ARENA_PK;
s.manualShipSkillIds = i.shipSkillIds;
s.manualSkillIds = i.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
s.setSeed(t);
o.pkBattle(e, a);
};
s.tailBattle = function(e, a, t) {
var n = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = s.isInstant = !1;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.TAIL;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.manualRecordMap = {};
s.damageMap = {};
s.usedMap = {};
s.BOSS_CONFIG = t;
s.setSeed(Date.now());
o.pkBattle(e, a);
};
s.tailBattleInstant = function(e, a, t) {
var n = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = t || !1;
s.isInstant = !0;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.TAIL;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
s.setSeed(s.seed);
s.isWin = !1;
o.pkBattle(e, a);
return {
isWin: s.isWin,
seed: s.seed
};
};
s.practiceBattleInstant = function(e, a, t) {
var n = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = s.isInstant = !0;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.PRACTICE;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
t = t || Date.now();
s.setSeed(t);
s.isWin = !1;
o.pkBattle(e, a);
return {
isWin: s.isWin,
seed: t
};
};
s.practiceBattle = function(e, a, t) {
var n = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = !0;
s.isInstant = !1;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.PRACTICE;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
s.setSeed(t);
o.pkBattle(e, a);
};
s.bossBattle = function(e, a) {
var t = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = s.isInstant = !1;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.BOSS;
s.manualShipSkillIds = t.shipSkillIds;
s.manualSkillIds = t.roleSkillIds;
s.manualRecordMap = {};
s.damageMap = {};
s.usedMap = {};
s.setSeed(Date.now());
o.pkBattle(e, a);
};
s.bossBattleInstant = function(e, a, t) {
var n = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = t || !1;
s.isInstant = !0;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.BOSS;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
s.setSeed(s.seed);
s.isWin = !1;
o.pkBattle(e, a);
return {
isWin: s.isWin,
seed: s.seed
};
};
s.guildeBossBattle = function(e, a) {
var t = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = s.isInstant = !1;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.GUILD_BOSS;
s.manualShipSkillIds = t.shipSkillIds;
s.manualSkillIds = t.roleSkillIds;
s.manualRecordMap = {};
s.damageMap = {};
s.usedMap = {};
s.setSeed(Date.now());
o.pkBattle(e, a);
};
s.guildeBossBattleInstant = function(e, a, t) {
var n = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = t || !1;
s.isInstant = !0;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.GUILD_BOSS;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
s.setSeed(s.seed);
s.isWin = !1;
o.pkBattle(e, a);
return {
isWin: s.isWin,
seed: s.seed
};
};
s.beginBattle = function(e, a, t, n) {
var i = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = s.isInstant = !1;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.BEGIN_BATTLE;
s.manualShipSkillIds = i.shipSkillIds;
s.manualSkillIds = n || i.roleSkillIds;
s.manualRecordMap = {};
s.damageMap = {};
s.usedMap = {};
s.setSeed(t);
o.pkBattle(e, a);
};
s.islandBattleInstant = function(e, a, t) {
var n = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = s.isInstant = !0;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.ISLAND;
s.manualShipSkillIds = n.shipSkillIds;
s.manualSkillIds = n.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
t = t || Date.now();
s.setSeed(t);
o.pkBattle(e, a);
return {
isWin: s.isWin,
seed: t
};
};
s.islandBattle = function(e, a, t, n) {
var i = s.genManualSkillInfo(e, a);
s.begin = Date.now();
s.isAuto = !0;
s.isInstant = !1;
s.isShow = !s.isInstant;
s.isPlayback = n || !1;
s.battleType = r.BATTLE_TYPE.ISLAND;
s.manualShipSkillIds = i.shipSkillIds;
s.manualSkillIds = i.roleSkillIds;
s.damageMap = {};
s.usedMap = {};
s.setSeed(t);
o.pkBattle(e, a);
};
s.timePeakBattle = function(e, a) {
var t = s.genManualSkillInfo(e, a);
s.isAuto = s.isInstant = !1;
s.isShow = !s.isInstant;
s.battleType = r.BATTLE_TYPE.TIME_PEAK;
s.manualShipSkillIds = t.shipSkillIds;
s.manualSkillIds = t.roleSkillIds;
s.manualRecordMap = {};
s.damageMap = {};
s.usedMap = {};
s.setSeed(Date.now());
o.pkBattle(e, a);
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.fightHandler": "battle.fightHandler",
"battle.mt_rand": "battle.mt_rand",
"battle.util": "battle.util",
battleScene: "battleScene",
dataApi: "dataApi",
underscore: "underscore"
} ],
