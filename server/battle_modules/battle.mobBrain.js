"battle.mobBrain": [ function(e, a) {
"use strict";
cc._RF.push(a, "a39e7l9K6BJKLLf+WOlFSd3", "battle.mobBrain");
var t = e("battleMain"), n = e("battle.libBT"), i = e("battle.baseBrain"), r = function(e) {
var a = i.genAttackAction(e), t = new n.Select({
blackboard: e
});
t.addChild(a);
this.action = t;
};
a.exports = r;
r.prototype.update = function() {
return !(!t.debug.isMobStop || 1 == this.action.blackboard.curCharacter.teamId) || this.action.doAction();
};
r.clone = function(e) {
return new r(e.blackboard);
};
cc._RF.pop();
}, {
"battle.baseBrain": "battle.baseBrain",
"battle.libBT": "battle.libBT",
battleMain: "battleMain"
} ],
