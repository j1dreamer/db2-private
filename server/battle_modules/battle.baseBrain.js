"battle.baseBrain": [ function(e, a) {
"use strict";
cc._RF.push(a, "cb0d7xOR3FLVo5qcYJ83Vk8", "battle.baseBrain");
var t = e("battle.libBT"), n = e("battle.moveToTarget"), i = e("battle.moveToEmptyPosition"), r = e("battle.tryAttack"), s = e("battle.tryAndAdjust"), o = {
genAttackAction: function(e) {
var a = new s({
blackboard: e,
adjustActions: [ new n({
blackboard: e
}), new i({
blackboard: e
}) ],
tryAction: new r({
blackboard: e
})
}), o = new t.Loop({
blackboard: e,
child: a,
loopCond: function(e) {
e.curCharacter.setTargetNearest();
if (e.curTargetId !== e.curCharacter.targetId) {
e.curTargetId = null;
return !1;
}
return !0;
}
});
return new t.If({
blackboard: e,
cond: function(e) {
var a = e.curCharacter, t = a.targetId;
if (!e.area.getEntity(t)) {
a.setTargetNearest();
e.curTargetId = null;
return !1;
}
e.curTargetId = t;
return !0;
},
action: o
});
}
};
a.exports = o;
cc._RF.pop();
}, {
"battle.libBT": "battle.libBT",
"battle.moveToEmptyPosition": "battle.moveToEmptyPosition",
"battle.moveToTarget": "battle.moveToTarget",
"battle.tryAndAdjust": "battle.tryAndAdjust",
"battle.tryAttack": "battle.tryAttack"
} ],
