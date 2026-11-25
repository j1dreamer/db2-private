"battle.characterEvent": [ function(e, a) {
"use strict";
cc._RF.push(a, "9f93bPcr1pEnaDkfA4mQuEF", "battle.characterEvent");
var t = e("underscore"), n = e("serverConfig"), i = e("battle.consts"), r = e("battle.move"), s = e("battleMain"), o = e("battle.msgHandler"), l = {
fn: {},
addEventForCharacter: function(e) {
e.on("setPosition", l.fn.setPosition);
e.on("move", l.fn.move);
e.on("attack", l.fn.attack);
e.on("add", l.fn.add);
e.on("remove", l.fn.remove);
e.on("stop", l.fn.stop);
e.on("removeBuff", l.fn.removeBuff);
e.on("hpPct", l.fn.hpPct);
e.on("setMp", l.fn.setMp);
e.on("activatePassive", l.fn.activatePassive);
e.on("revive", l.fn.revive);
e.on("damageInterrupted", l.fn.damageInterrupted);
e.on("reSetCurLevelAttrs", l.fn.reSetCurLevelAttrs);
e.on("bossHpPct", l.fn.bossHpPct);
}
};
l.fn.setPosition = function(e) {
var a = e.character, t = e.position, n = {
route: "onSetPosition",
entityId: a.entityId,
position: t
};
o.emit(n.route, n);
};
l.fn.move = function(e) {
var a = e.character, t = e.isRepel, n = e.path, s = a.targetId, l = t ? i.FIGHT_SKILL.REPEL_WALKSPEED : a.walkSpeed, c = a.area, d = new r({
entity: a,
path: n,
speed: l,
isUnStop: t
});
if (c.timer.addAction(d)) {
var h = {
route: "onMove",
entityId: a.entityId,
path: n,
speed: l,
isRepel: t,
targetId: s
};
o.emit(h.route, h);
}
};
l.fn.attack = function(e) {
var a = e.result, n = e.attacker, i = e.target, r = i.area, l = e.skill;
if (i && n && t.include([ "shake", "buff", "attack" ], a.status)) {
var c = void 0;
if ("shake" == a.status && t.include(s.manualSkillIds.concat(s.manualShipSkillIds), l.kindId) && (1 == n.teamId || s.isPVP())) {
c = l.shakeDownTime;
r.timer.pause(c);
l.shakeDownTime = 0;
}
var d = {
route: "onAttack",
teamId: n.teamId,
attackerId: n.entityId,
targetId: i.entityId,
name: l.name,
result: a,
skillId: l.kindId,
atkSpeedRate: n.initSkillId == l.kindId ? n.atkSpeedRate : 1,
stopTime: c
};
if (t.include([ "shake", "buff", "summon" ], a.status)) o.emit(d.route, d); else if ("attack" == a.status) {
o.emit(d.route, d);
for (var h = 0; h < a.infos.length; h++) {
i = r.getEntity(a.infos[h].targetId);
"killed" == a.infos[h].result && i && r.removeEntity(i.entityId);
!a.infos[h].isRecover && s.damageMap[n.teamId] && (n.isSummon ? s.damageMap[n.teamId][n.masterId] && (s.damageMap[n.teamId][n.masterId].damage += a.infos[h].damage) : s.damageMap[n.teamId][n.entityId] && (s.damageMap[n.teamId][n.entityId].damage += a.infos[h].damage));
}
a.attackerKilled && r.removeEntity(n.entityId);
}
}
};
l.fn.add = function(e) {
var a = e.character, t = {
route: "onAddEntity",
entityId: a.entityId,
type: a.type,
level: a.level,
star: a.star,
mpPct: a.getMpPct(),
hpPct: a.hpPct,
isSummon: a.isSummon,
curLevelHp: a.curLevelHp,
curLevelMaxHp: a.curLevelMaxHp,
data: {
kindId: a.data.kindId,
name: a.data.name,
classId: a.data.classId,
missileType: a.data.missileType,
flyTime: a.data.flyTime,
color: a.data.color,
scale: a.data.scale || 1,
initPos: a.data.initPos
},
position: a.getPosition(),
attackerPostion: a.attackerPostion,
teamId: a.teamId,
idx: a.idx,
attackerId: a.attacker ? a.attacker.entityId : 0,
masterId: a.masterId
};
o.emit(t.route, t);
};
l.fn.remove = function(e) {
var a = e.character, t = a.area, n = {
route: "onRemoveEntity",
entityId: a.entityId
};
o.emit(n.route, n);
t.removeEntity(a.entityId);
};
l.fn.stop = function(e) {
var a = e.character, t = e.isForce;
if (a.area.timer.abortAction("move", a.entityId, t)) {
var n = {
route: "onStop",
entityId: a.entityId
};
o.emit(n.route, n);
}
};
l.fn.removeBuff = function(e) {
var a = {
route: "onRemoveBuff",
entityId: e.character.entityId,
buffId: e.buffId
};
o.emit(a.route, a);
};
l.fn.hpPct = function(e) {
var a = e.character, t = a.area, n = {
route: "onHpPct",
entityId: a.entityId,
hpPct: a.hpPct,
value: e.value || 0,
isRecover: e.isRecover || !1,
isShow: e.isShow || !1,
skillId: e.skillId || null,
died: a.died
};
o.emit(n.route, n);
a.died && t.removeEntity(a.entityId);
};
l.fn.setMp = function(e) {
var a = e.character, t = e.value, n = e.addValue, i = {
route: "onSetMp",
entityId: a.entityId,
value: t,
addValue: n,
usedSkillIdMap: a.usedSkillIdMap,
isShow: e.isShow,
isWord: e.isWord,
mpPct: a.getMpPct()
};
o.emit(i.route, i);
};
l.fn.activatePassive = function(e) {
var a = {
route: "onActivatePassive",
buffInfos: e.buffInfos,
skillId: e.skillId
};
o.emit(a.route, a);
};
l.fn.revive = function(e) {
var a = {
route: "onRevive",
entityId: e.character.entityId,
skillId: e.skillId
};
o.emit(a.route, a);
};
l.fn.damageInterrupted = function(e) {
var a = e.character, t = {
route: "onDamageInterrupted",
id: a.id,
entityId: a.entityId
};
o.emit(t.route, t);
};
l.fn.reSetCurLevelAttrs = function(e) {
var a = e.character, t = {
route: "onReSetCurLevelAttrs",
curLevel: a.level,
curLevelHp: a.curLevelHp,
curLevelMaxHp: a.curLevelMaxHp
};
o.emit(t.route, t);
};
l.fn.bossHpPct = function(e) {
var a, r = e.character;
s.battleType == i.BATTLE_TYPE.TAIL ? a = Math.floor((r.maxHp - r.hp) * n.SHIP.CONSTS.DMG_TO_MONEY_RATE) : t.include([ i.BATTLE_TYPE.BOSS, i.BATTLE_TYPE.GUILD_BOSS ], s.battleType) && (a = r._maxHp - r.hp);
var l = {
route: "onBossHpPct",
getMoneyCount: a,
curLevelHp: r.curLevelHp,
curHpCount: r.curHpCount
};
o.emit(l.route, l);
};
a.exports = l;
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.move": "battle.move",
"battle.msgHandler": "battle.msgHandler",
battleMain: "battleMain",
serverConfig: "serverConfig",
underscore: "underscore"
} ],
