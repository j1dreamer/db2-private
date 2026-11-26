"battle.missileNormal": [ function(e, a) {
"use strict";
cc._RF.push(a, "9556brlIPlEsYUe85E7sYxo", "battle.missileNormal");
var t = e("battle.util"), n = e("battle.formula"), i = e("battle.libBT"), r = function(e) {
i.Node.call(this, e.blackboard);
};
t.inherits(r, i.Node);
a.exports = r;
r.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.targetPos, t = this.blackboard.preMissilePos || e.attacker.getPosition();
t.x == e.attacker.x && (t.x += 10 * (e.x - t.x > 0 ? -1 : 1));
var r = {
isLine: !0,
pos: t,
teamId: e.targetTeamId,
range: Math.abs(e.x - t.x),
direction: e.x - t.x > 0 ? "right" : "left",
targetCount: 1,
skipAttr: "unAction"
}, s = this.blackboard.area.getEntitiesByPos(r)[0];
if (s) {
e.attack(s);
e.remove();
return i.RES_SUCCESS;
}
if (n.inRange(e, a, 10)) {
e.remove();
return i.RES_SUCCESS;
}
if (!this.blackboard.missileNormalMoved) {
e.move(a.x, a.y);
this.blackboard.missileNormalMoved = !0;
}
};
cc._RF.pop();
}, {
"battle.formula": "battle.formula",
"battle.libBT": "battle.libBT",
"battle.util": "battle.util"
} ],
