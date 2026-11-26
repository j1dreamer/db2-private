"battle.util": [ function(e, a) {
"use strict";
cc._RF.push(a, "78c3enVKcRAAYz32HUIVVUf", "battle.util");
var t = a.exports;
t.inherits = function(e, a) {
e.super_ = a;
e.prototype = Object.create(a.prototype, {
constructor: {
value: e,
enumerable: !1,
writable: !0,
configurable: !0
}
});
};
t.clone = function(e) {
return JSON.parse(JSON.stringify(e));
};
cc._RF.pop();
}, {} ],
