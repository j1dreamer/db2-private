"battle.missileTimeTarget": [ function(e, a) {
"use strict";
cc._RF.push(a, "f6297SS/9lEpZuC1613UKLU", "battle.missileTimeTarget");
var t = e("battle.util"), n = e("battle.libBT"), i = e("battle.scheduler"), r = function(e) {
n.Node.call(this, e.blackboard);
};
t.inherits(r, n.Node);
a.exports = r;
r.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.flyTime, t = this.blackboard.range, r = this.blackboard.targetId, s = this.blackboard.targetTeamId;
if (!this.blackboard.missileTimeTargetStart) {
this.blackboard.missileTimeTargetStart = !0;
i.setTimeout(function() {
var a = this.blackboard.area.getEntitiesByXRange(e, s, t);
for (var n in a) if (a[n] && a[n].entityId == r) {
e.attack(a[n]);
break;
}
this.blackboard.isTimeout = !0;
e.remove();
}.bind(this), 1e3 * a);
}
return this.blackboard.isTimeout ? n.RES_SUCCESS : n.RES_WAIT;
};
cc._RF.pop();
}, {
"battle.libBT": "battle.libBT",
"battle.scheduler": "battle.scheduler",
"battle.util": "battle.util"
} ],
