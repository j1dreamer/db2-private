"battle.ai": [ function(e, a) {
"use strict";
cc._RF.push(a, "a62b2Z0wJdABI3dXaVWKjff", "battle.ai");
var t = e("battle.brainService"), n = e("battle.aiManager"), i = {};
i.brainMap = {
role: e("battle.roleBrain"),
mob: e("battle.mobBrain"),
missile: e("battle.missileBrain")
};
i.createManager = function(e) {
var a = new t();
for (var r in i.brainMap) a.registerBrain(r, i.brainMap[r]);
(e = e || {}).brainService = a;
return new n(e);
};
a.exports = i;
cc._RF.pop();
}, {
"battle.aiManager": "battle.aiManager",
"battle.brainService": "battle.brainService",
"battle.missileBrain": "battle.missileBrain",
"battle.mobBrain": "battle.mobBrain",
"battle.roleBrain": "battle.roleBrain"
} ],
