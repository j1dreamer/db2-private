"battle.moveToTarget": [ function(e, a) {
"use strict";
cc._RF.push(a, "3ff09OV66hHhpcosBZUY0K2", "battle.moveToTarget");
var t = e("battle.util"), n = e("battle.consts"), i = e("battle.formula"), r = e("battle.libBT"), s = function(e) {
r.Node.call(this, e.blackboard);
};
t.inherits(s, r.Node);
a.exports = s;
s.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.curTargetId, t = this.blackboard.distanceLimit, s = this.blackboard.area.getEntity(a);
if (e.isReAttack) {
e.isReAttack = !1;
e.stop();
return r.RES_FAIL;
}
if (e.drag || e.repeled || e.terror) return r.RES_FAIL;
e.setTargetNearest();
if (!s || e.isUnMove()) {
e.stop();
return r.RES_FAIL;
}
if (this.blackboard.emptyPos) return r.RES_SUCCESS;
if (i.inRangeX(e, s, t)) {
e.stop();
return r.RES_SUCCESS;
}
if (a != e.targetId) {
e.stop();
return r.RES_FAIL;
}
var o = this.blackboard.targetPos;
if (this.blackboard.toTargetMoved) {
if (o && (o.x !== s.x || o.y !== s.y)) {
var l = i.distanceX(e, o);
if (i.distanceX(e, s) > l) {
o.x = s.x;
o.y = s.y;
e.move(s.x, s.y);
}
}
} else {
var c = {
x: s.x,
y: Math.abs(s.y - e.y) < n.MAX_MOVE_Y ? e.y : s.y
};
e.move(c.x, c.y);
this.blackboard.targetPos = c;
this.blackboard.toTargetMoved = !0;
}
return r.RES_WAIT;
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.formula": "battle.formula",
"battle.libBT": "battle.libBT",
"battle.util": "battle.util"
} ],
