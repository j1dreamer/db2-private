"battle.brainService": [ function(e, a) {
"use strict";
cc._RF.push(a, "b497akYgqZDn66nJd7IUiuW", "battle.brainService");
var t = function() {
this.brains = {};
};
a.exports = t;
var n = t.prototype;
n.getBrain = function(e, a) {
var t = this.brains[e];
return t ? t.clone({
blackboard: a
}) : null;
};
n.registerBrain = function(e, a) {
this.brains[e] = a;
};
cc._RF.pop();
}, {} ],
