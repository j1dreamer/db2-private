"battle.actionManager": [ function(e, a) {
"use strict";
cc._RF.push(a, "57b4eojlXpIyLdjdpVoqGey", "battle.actionManager");
var t = e("battle.queue"), n = function(e) {
e = e || {};
this.limit = e.limit || 1e3;
this.actionMap = {};
this.actionQueue = new t(this.limit);
};
a.exports = n;
var i = n.prototype;
i.addAction = function(e) {
if (e.singleton) {
this.abortAction(e.type, e.id);
var a = this.actionMap[e.type] ? this.actionMap[e.type][e.id] : null;
if (a && !a.aborted && a.isUnStop) return !1;
}
this.actionMap[e.type] = this.actionMap[e.type] || {};
this.actionMap[e.type][e.id] = e;
return this.actionQueue.push(e);
};
i.abortAction = function(e, a, t) {
if (!this.actionMap[e] || !this.actionMap[e][a]) return !1;
if (this.actionMap[e][a].isUnStop && !t) return !1;
this.actionMap[e][a].aborted = !0;
delete this.actionMap[e][a];
return !0;
};
i.abortAllAction = function(e) {
for (var a in this.actionMap) this.actionMap[a][e] && (this.actionMap[a][e].aborted = !0);
};
i.update = function(e) {
for (var a = this.actionQueue.length, t = 0; t < a; t++) {
var n = this.actionQueue.pop();
if (!n.aborted) {
n.update(e);
n.finished ? delete this.actionMap[n.type][n.id] : this.actionQueue.push(n);
}
}
};
cc._RF.pop();
}, {
"battle.queue": "battle.queue"
} ],
