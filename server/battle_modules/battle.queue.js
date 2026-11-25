"battle.queue": [ function(e, a) {
"use strict";
cc._RF.push(a, "ea8affuOv5JZJjozgHyS/c2", "battle.queue");
var t = function(e) {
this.limit = e || 1e3;
this.length = 0;
this.head = 0;
this.tail = 0;
this.__array = new Array(this.limit);
};
a.exports = t;
var n = t.prototype;
n.push = function(e) {
if (this.length >= this.limit) return !1;
this.__array[this.tail] = e;
this.tail++;
this.length++;
this.tail == this.__array.length && (this.tail = 0);
return !0;
};
n.pop = function() {
if (0 === this.length) return null;
var e = this.__array[this.head];
this.head++;
this.length--;
this.head == this.__array.length && (this.head = 0);
return e;
};
n.size = function() {
return this.length;
};
cc._RF.pop();
}, {} ],
