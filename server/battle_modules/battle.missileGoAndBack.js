"battle.missileGoAndBack": [ function(e, a) {
"use strict";
cc._RF.push(a, "a55d5gzfTVFEq4toQJ/cTun", "battle.missileGoAndBack");
var t = e("battle.util"), n = e("battle.formula"), i = e("battle.libBT"), r = function(e) {
i.Node.call(this, e.blackboard);
};
t.inherits(r, i.Node);
a.exports = r;
r.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.beginPos, t = this.blackboard.targetPos, r = this.blackboard.attackedTargetIds;
if (n.inRange(e, t, 10)) {
if (a == t) {
e.remove();
return i.RES_SUCCESS;
}
this.blackboard.targetPos = a;
this.blackboard.attackedTargetIds = [];
e.move(a.x, a.y);
return i.RES_WAIT;
}
if (this.blackboard.missileGoAndBackMoved) {
var s = this.blackboard.area.getEntitiesByXRange(e, e.targetTeamId, 120);
for (var o in s) if (s[o] && !r[s[o].entityId]) {
e.attack(s[o]);
r[s[o].entityId] = !0;
}
} else {
e.move(t.x, t.y);
this.blackboard.missileGoAndBackMoved = !0;
}
return i.RES_WAIT;
};
cc._RF.pop();
}, {
"battle.formula": "battle.formula",
"battle.libBT": "battle.libBT",
"battle.util": "battle.util"
} ],
