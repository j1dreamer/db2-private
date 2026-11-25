"battle.missileAoe": [ function(e, a) {
"use strict";
cc._RF.push(a, "d4aec67S1JNJ7mdaih3dN3B", "battle.missileAoe");
var t = e("battle.util"), n = e("battle.formula"), i = e("battle.libBT"), r = function(e) {
i.Node.call(this, e.blackboard);
};
t.inherits(r, i.Node);
a.exports = r;
r.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.targetPos, t = this.blackboard.attackedTargetIds, r = this.blackboard.preMissilePos || e.attacker.getPosition();
r.x += 100 * (e.x - r.x > 0 ? -1 : 1);
var s = {
isLine: !0,
pos: r,
teamId: e.targetTeamId,
range: Math.abs(e.x - r.x),
direction: e.x - r.x > 0 ? "right" : "left",
targetCount: 99
}, o = this.blackboard.area.getEntitiesByPos(s);
for (var l in o) if (o[l] && !o[l].invincible && !t[o[l].entityId]) {
e.attack(o[l]);
t[o[l].entityId] = !0;
}
if (n.inRange(e, a, 10)) {
e.remove();
return i.RES_SUCCESS;
}
if (!this.blackboard.missileAoeMoved) {
e.move(a.x, a.y);
this.blackboard.missileAoeMoved = !0;
}
this.blackboard.preMissilePos = e.getPosition();
return i.RES_WAIT;
};
cc._RF.pop();
}, {
"battle.formula": "battle.formula",
"battle.libBT": "battle.libBT",
"battle.util": "battle.util"
} ],
