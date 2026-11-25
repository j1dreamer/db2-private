"battle.entity": [ function(e, a) {
"use strict";
cc._RF.push(a, "57896OSSCFB2ILHPAqivQ66", "battle.entity");
var t = e("battle.util"), n = e("emitter"), i = function e(a) {
this._opts = a;
n.call(this);
this.entityId = e.id++;
this.kindId = Number(a.kindId);
this.x = 0;
this.y = 0;
};
i.id = 1;
t.inherits(i, n);
a.exports = i;
var r = i.prototype;
r.getPosition = function() {
return {
x: this.x,
y: this.y
};
};
r.setPosition = function(e, a) {
this.x = e;
this.y = a;
};
cc._RF.pop();
}, {
"battle.util": "battle.util",
emitter: "emitter"
} ],
