"battle.aiManager": [ function(e, a) {
"use strict";
cc._RF.push(a, "39def6kR8xMx7neUUybpFGT", "battle.aiManager");
var t = e("underscore"), n = e("battle.blackboard"), i = function(e) {
this.brainService = e.brainService;
this.area = e.area;
this.roles = {};
this.mobs = {};
this.missiles = {};
};
a.exports = i;
var r = i.prototype;
r.addCharacters = function(e) {
for (var a, t = 0, i = e.length; t < i; t++) {
var r = (a = e[t]).brainName, s = this[a.type + "s"];
if (!s[a.entityId]) {
var o = this.brainService.getBrain(r, n.create({
manager: this,
area: this.area,
curCharacter: a
}));
o.action && (s[a.entityId] = o);
}
}
};
r.removeCharacter = function(e) {
delete this.roles[e];
delete this.mobs[e];
delete this.missiles[e];
};
r.update = function() {
var e = t.values(this.roles);
e = t.sortBy(e, function(e) {
return -e.action.blackboard.curCharacter.atkSpeedRate;
});
for (var a in e) "function" == typeof e[a].update && e[a].update();
for (var n in this.mobs) "function" == typeof this.mobs[n].update && this.mobs[n].update();
for (var n in this.missiles) "function" == typeof this.missiles[n].update && this.missiles[n].update();
};
cc._RF.pop();
}, {
"battle.blackboard": "battle.blackboard",
underscore: "underscore"
} ],
