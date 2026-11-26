"battle.roleBrain": [ function(e, a) {
"use strict";
cc._RF.push(a, "4e0aeBoibBB3ZEqPvIql2dI", "battle.roleBrain");
var t = e("battle.libBT"), n = e("battle.baseBrain"), i = function(e) {
var a = n.genAttackAction(e), i = new t.Select({
blackboard: e
});
i.addChild(a);
this.action = i;
};
a.exports = i;
i.prototype.update = function() {
return this.action.doAction();
};
i.clone = function(e) {
return new i(e.blackboard);
};
cc._RF.pop();
}, {
"battle.baseBrain": "battle.baseBrain",
"battle.libBT": "battle.libBT"
} ],
