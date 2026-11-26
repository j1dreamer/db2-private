"battle.tryAndAdjust": [ function(e, a) {
"use strict";
cc._RF.push(a, "dc18fjZmihJ4rdGAshWGB91", "battle.tryAndAdjust");
var t = e("battle.util"), n = e("battle.libBT"), i = function(e) {
n.Node.call(this, e.blackboard);
var a = new n.Sequence(e);
for (var t in e.adjustActions) a.addChild(e.adjustActions[t]);
a.addChild(e.tryAction);
var i = new n.Select(e);
i.addChild(e.tryAction);
i.addChild(a);
this.action = i;
};
t.inherits(i, n.Node);
a.exports = i;
i.prototype.doAction = function() {
return this.action.doAction();
};
cc._RF.pop();
}, {
"battle.libBT": "battle.libBT",
"battle.util": "battle.util"
} ],
