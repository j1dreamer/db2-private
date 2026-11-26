"battle.missileTarget": [ function(e, a) {
"use strict";
cc._RF.push(a, "77ae5OtKjpBp5oT4ZxUtbgk", "battle.missileTarget");
var t = e("battle.util"), n = e("battle.formula"), i = e("battle.libBT"), r = function(e) {
i.Node.call(this, e.blackboard);
};
t.inherits(r, i.Node);
a.exports = r;
r.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.targetPos, t = this.blackboard.targetId, r = this.blackboard.preMissilePos || e.attacker.getPosition();
r.x == e.attacker.x && (r.x += 10 * (e.x - r.x > 0 ? -1 : 1));
var s = {
isLine: !0,
pos: r,
teamId: e.targetTeamId,
range: Math.abs(e.x - r.x),
direction: e.x - r.x > 0 ? "right" : "left",
targetCount: 99
}, o = this.blackboard.area.getEntitiesByPos(s);
for (var l in o) if (o[l] && o[l].entityId == t) {
e.attack(o[l]);
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
this.blackboard.preMissilePos = e.getPosition();
};
cc._RF.pop();
}, {
"battle.formula": "battle.formula",
"battle.libBT": "battle.libBT",
"battle.util": "battle.util"
} ],
