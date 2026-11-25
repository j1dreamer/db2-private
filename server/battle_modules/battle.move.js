"battle.move": [ function(e, a) {
"use strict";
cc._RF.push(a, "286e7S28ZNPXLqI3G67zkJn", "battle.move");
var t = e("battle.util"), n = e("battle.formula"), i = e("battle.action"), r = function(e) {
i.call(this, {
id: e.entity.entityId,
type: "move",
singleton: !0,
isUnStop: e.isUnStop
});
this.entity = e.entity;
this.path = e.path;
this.speed = Number(e.speed);
this.pos = this.path[0];
this.index = 1;
};
t.inherits(r, i);
a.exports = r;
r.prototype.update = function(e) {
for (var a = this.speed, t = this.path, i = this.index, r = a * e, s = {
x: this.pos.x,
y: this.pos.y
}, o = t[i], l = n.distance(this.pos, o); r > 0; ) if (l <= r) {
r -= l;
s = t[i];
if (++i >= t.length) {
this.entity.stop(!0);
this.finished = !0;
break;
}
o = t[i];
l = n.distance(s, o);
} else {
l -= r;
s = n.getPos(s, o, l);
r = 0;
}
this.pos = s;
this.index = i;
this.entity.x = s.x;
this.entity.y = s.y;
};
cc._RF.pop();
}, {
"battle.action": "battle.action",
"battle.formula": "battle.formula",
"battle.util": "battle.util"
} ],
