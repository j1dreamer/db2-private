"battle.team": [ function(e, a) {
"use strict";
cc._RF.push(a, "d6fa3L3TGBJNbPkztt1jdgG", "battle.team");
e("underscore");
var t = e("battle.entity"), n = e("battle.consts"), i = e("battleMain"), r = function(e) {
this.playerId = e.playerId;
this.area = e.area;
this.characters = {};
this.teamId = e.teamId;
this.offset = e.offset;
this.positions = e.positions;
this.count = 0;
for (var a = 0; a < e.characters.length; a++) this.add(e.characters[a]);
};
a.exports = r;
var s = r.prototype;
s.generateCharacters = function(a) {
var r, s = 0;
for (var o in this.characters) {
(r = this.characters[o]).teamId = this.teamId;
r.playerId = this.playerId;
r.idx = s;
t.prototype.setPosition.call(r, this.positions[s].x + this.offset, this.positions[s].y);
var l = !1;
r.isSingleBoss() ? r.x = this.positions[1].x : i.debug.isNoBeginMove ? r.x = this.positions[s].x : l = !0;
this.area.addEntity(r);
l && r.move(this.positions[s].x, this.positions[s].y);
s++;
}
if (a) {
var c = new (e("battle.mob"))({
kindId: n.SHIP_MOB_ID
});
c.teamId = this.teamId;
c.playerId = this.playerId;
c.isShip = !0;
c.isSummon = !0;
c.idx = 5;
c.addFightSkills(a);
t.prototype.setPosition.call(c, 0, 0);
this.area.addEntity(c);
}
};
s.add = function(e) {
this.characters[e.entityId] = e;
this.count++;
i.damageMap[this.teamId] = i.damageMap[this.teamId] || {};
i.damageMap[this.teamId][e.entityId] = i.damageMap[this.teamId][e.entityId] || {
type: e.type,
entityId: e.entityId,
star: e.star || e.data.star,
trainLevelMap: e.trainLevelMap || null,
awakeLevel: e.awakeLevel || e.data.awakeLevel,
kindId: e.kindId,
damage: 0
};
};
s.remove = function(e) {
if (this.characters[e]) {
delete this.characters[e];
this.count--;
}
return !0;
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.entity": "battle.entity",
"battle.mob": "battle.mob",
battleMain: "battleMain",
underscore: "underscore"
} ],
