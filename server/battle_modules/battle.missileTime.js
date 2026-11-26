"battle.missileTime": [ function(e, a) {
"use strict";
cc._RF.push(a, "6d62fmeoUhJTaWMhoyxFY8Y", "battle.missileTime");
var t = e("battle.util"), n = e("battle.libBT"), i = e("battle.scheduler"), r = function(e) {
n.Node.call(this, e.blackboard);
};
t.inherits(r, n.Node);
a.exports = r;
r.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.flyTime, t = this.blackboard.range;
if (!this.blackboard.missileTimeStart) {
this.blackboard.missileTimeStart = !0;
var r = 1 == this.blackboard.missileTargetCount ? this.blackboard.targetId : 0, s = this;
i.setTimeout(function() {
var a = s.blackboard.area.getEntitiesByXRange(e, e.targetTeamId, t);
for (var n in a) if (a[n] && (!r || r == a[n].entityId)) {
e.attack(a[n]);
if (s.blackboard.missileTargetCount) {
s.blackboard.missileTargetCount--;
if (0 == s.blackboard.missileTargetCount) break;
}
}
s.blackboard.isTimeout = !0;
e.remove();
}, 1e3 * a);
}
return this.blackboard.isTimeout ? n.RES_SUCCESS : n.RES_WAIT;
};
cc._RF.pop();
}, {
"battle.libBT": "battle.libBT",
"battle.scheduler": "battle.scheduler",
"battle.util": "battle.util"
} ],
