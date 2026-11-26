"battle.timer": [ function(e, a) {
"use strict";
cc._RF.push(a, "fe8a94aSCZP97NFVtkUndEC", "battle.timer");
var t = e("underscore"), n = e("battle.consts"), i = e("battleMain"), r = e("battle.fightHandler"), s = e("battle.scheduler"), o = function(e) {
this.area = e.area;
this.delay = e.delay || .1;
this.interval = null;
this.tickNumber = 0;
this.totalDt = 0;
};
a.exports = o;
var l = o.prototype;
l.run = function() {
if (!this.interval && !this.area.isOver) {
if (this.pauseInterval) {
_clearInterval(this.pauseInterval);
this.pauseInterval = null;
}
if (i.isShow) this.interval = _setInterval(this.tick.bind(this), 1e3 * this.delay); else {
this.interval = !0;
for (;this.interval; ) this.tick(1e3 * this.delay);
}
}
};
l.close = function(e) {
e || s.clearAllTimeout();
if (this.interval) {
i.isShow && _clearInterval(this.interval);
this.interval = null;
}
};
l.pause = function(e) {
if (i.isShow) {
this.close(!0);
this.pauseInterval = _setTimeout(function() {
this.pauseInterval = null;
this.run();
}.bind(this), 1e3 * e);
}
};
l.tick = function(e) {
this.totalDt += e / 1e3;
for (var a = Math.floor(this.totalDt / this.delay), o = i.debug.isDelayStart ? 0 : 2.5, l = 0; l < a; l++) {
if (!this.interval) return;
this.tickNumber++;
var c = this.delay * this.tickNumber > o, d = this.area;
d.actionManager.update(this.delay);
c && d.updateSkill(this.delay);
s.scheduler.update(this.delay);
c && d.aiManager.update();
d.timeTick(this.delay);
if (t.include([ n.BATTLE_TYPE.SMAP, n.BATTLE_TYPE.TAIL, n.BATTLE_TYPE.BOSS, n.BATTLE_TYPE.GUILD_BOSS ], i.battleType) && i.isInstant) {
var h = i.manualRecordMap[this.tickNumber];
if (h) for (var u in h) r.useSkill(h[u].teamId, h[u].skillId);
}
if (i.useSkillIdInfos.length > 0 && t.include([ n.BATTLE_TYPE.SMAP, n.BATTLE_TYPE.TAIL, n.BATTLE_TYPE.BOSS, n.BATTLE_TYPE.GUILD_BOSS ], i.battleType) && !i.isInstant) {
i.manualRecordMap[this.tickNumber] = i.manualRecordMap[this.tickNumber] || [];
i.manualRecordMap[this.tickNumber] = i.manualRecordMap[this.tickNumber].concat(i.useSkillIdInfos);
}
for (var u in i.useSkillIdInfos) r.useSkill(i.useSkillIdInfos[u].teamId, i.useSkillIdInfos[u].skillId);
i.useSkillIdInfos = [];
}
this.totalDt -= a * this.delay;
};
l.addAction = function(e) {
return this.area.actionManager.addAction(e);
};
l.abortAction = function(e, a, t) {
return this.area.actionManager.abortAction(e, a, t);
};
l.abortAllAction = function(e) {
this.area.actionManager.abortAllAction(e);
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.fightHandler": "battle.fightHandler",
"battle.scheduler": "battle.scheduler",
battleMain: "battleMain",
underscore: "underscore"
} ],
