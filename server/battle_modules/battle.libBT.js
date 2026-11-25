"battle.libBT": [ function(e, a) {
"use strict";
cc._RF.push(a, "8ad48wn5j9Os62dR/K5NNTD", "battle.libBT");
var t = e("battle.util"), n = {
RES_SUCCESS: 0,
RES_FAIL: 1,
RES_WAIT: 2,
Node: function(e) {
this.blackboard = e;
},
Composite: function(e) {
n.Node.call(this, e);
this.blackboard = e;
this.children = [];
}
};
t.inherits(n.Composite, n.Node);
n.Composite.prototype.addChild = function(e) {
this.children.push(e);
};
n.Condition = function(e) {
n.Node.call(this, e.blackboard);
this.cond = e.cond;
};
t.inherits(n.Condition, n.Node);
n.Condition.prototype.doAction = function() {
return this.cond && this.cond.call(null, this.blackboard) ? n.RES_SUCCESS : n.RES_FAIL;
};
n.Decorator = function(e, a) {
n.Node.call(this, e);
this.child = a;
};
t.inherits(n.Decorator, n.Node);
n.Decorator.prototype.setChild = function(e) {
this.child = e;
};
n.Sequence = function(e) {
n.Composite.call(this, e.blackboard);
this.index = 0;
};
t.inherits(n.Sequence, n.Composite);
n.Sequence.prototype.doAction = function() {
if (!this.children.length) return n.RES_SUCCESS;
this.index >= this.children.length && this.reset();
for (var e, a = this.children.length; this.index < a; this.index++) if ((e = this.children[this.index].doAction()) !== n.RES_SUCCESS) {
if (e === n.RES_WAIT) return e;
this.reset();
return e;
}
this.reset();
return n.RES_SUCCESS;
};
n.Sequence.prototype.reset = function() {
this.index = 0;
};
n.If = function(e) {
n.Node.call(this, e.blackboard);
this.action = new n.Sequence({
blackboard: e.blackboard
});
var a = new n.Condition({
blackboard: e.blackboard,
cond: e.cond
});
this.action.addChild(a);
this.action.addChild(e.action);
};
t.inherits(n.If, n.Node);
n.If.prototype.doAction = function() {
return this.action.doAction();
};
n.Loop = function(e) {
n.Decorator.call(this, e.blackboard, e.child);
this.loopCond = e.loopCond;
};
t.inherits(n.Loop, n.Decorator);
n.Loop.prototype.doAction = function() {
var e = this.child.doAction();
return e !== n.RES_SUCCESS ? e : this.loopCond && this.loopCond.call(null, this.blackboard) ? n.RES_WAIT : n.RES_SUCCESS;
};
n.Parallel = function(e) {
n.Composite.call(this, e.blackboard);
this.policy = e.policy || n.Parallel.POLICY_FAIL_ON_ONE;
this.waits = [];
this.succ = 0;
this.fail = 0;
};
t.inherits(n.Parallel, n.Composite);
n.Parallel.POLICY_FAIL_ON_ONE = 0;
n.Parallel.POLICY_FAIL_ON_ALL = 1;
n.Parallel.prototype.doAction = function() {
if (!this.children.length) return n.RES_SUCCESS;
for (var e, a = [], t = this.waits.length ? this.waits : this.children, i = 0, r = t.length; i < r; i++) switch (e = t[i].doAction()) {
case n.RES_SUCCESS:
this.succ++;
break;

case n.RES_WAIT:
a.push(t[i]);
break;

default:
this.fail++;
}
if (a.length) {
this.waits = a;
return n.RES_WAIT;
}
e = this.checkPolicy();
this.reset();
return e;
};
n.Parallel.prototype.reset = function() {
this.waits.length = 0;
this.succ = 0;
this.fail = 0;
};
n.Parallel.prototype.checkPolicy = function() {
return this.policy === n.Parallel.POLICY_FAIL_ON_ONE ? this.fail ? n.RES_FAIL : n.RES_SUCCESS : this.policy === n.Parallel.POLICY_FAIL_ON_ALL ? this.succ ? n.RES_SUCCESS : n.RES_FAIL : void 0;
};
n.Select = function(e) {
n.Composite.call(this, e.blackboard);
this.index = 0;
};
t.inherits(n.Select, n.Composite);
n.Select.prototype.doAction = function() {
if (!this.children.length) return n.RES_SUCCESS;
this.index >= this.children.length && this.reset();
for (var e, a = this.children.length; this.index < a; this.index++) {
if ((e = this.children[this.index].doAction()) === n.RES_SUCCESS) {
this.reset();
return e;
}
if (e === n.RES_WAIT) return e;
}
this.reset();
return n.RES_FAIL;
};
n.Select.prototype.reset = function() {
this.index = 0;
};
a.exports = n;
cc._RF.pop();
}, {
"battle.util": "battle.util"
} ],
