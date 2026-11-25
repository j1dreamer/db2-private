"battle.action": [ function(e, a) {
"use strict";
cc._RF.push(a, "9e782LE3VREu4rxJhSSVqCd", "battle.action");
var t = function e(a) {
this.id = a.id || e.id++;
this.type = a.type || "defaultAction";
this.singleton = a.singleton || !1;
this.isUnStop = a.isUnStop || !1;
this.finished = !1;
this.aborted = !1;
};
a.exports = t;
t.id = 1;
t.prototype.update = function() {};
cc._RF.pop();
}, {} ],
