"battle.moveToEmptyPosition": [ function(e, a) {
"use strict";
cc._RF.push(a, "e1133sb20VO8789Xjj8Dn9q", "battle.moveToEmptyPosition");
var t = e("battle.util"), n = e("battle.libBT"), i = function(e) {
n.Node.call(this, e.blackboard);
};
t.inherits(i, n.Node);
a.exports = i;
i.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.emptyPos, t = this.blackboard.tempPosY;
(e.repeled || e.drag || e.swaped || e.terror) && (this.blackboard.emptyPos = null);
if (!this.blackboard.emptyPos) return n.RES_SUCCESS;
if ((t - a.y) * (e.y - a.y) <= 0) {
this.blackboard.emptyPos = null;
e.stop();
return n.RES_SUCCESS;
}
if (!this.blackboard.toEmptyPosMoved) {
e.move(a.x, a.y);
this.blackboard.toEmptyPosMoved = !0;
}
return n.RES_WAIT;
};
cc._RF.pop();
}, {
"battle.libBT": "battle.libBT",
"battle.util": "battle.util"
} ],
