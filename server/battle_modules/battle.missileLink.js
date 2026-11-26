"battle.missileLink": [ function(e, a) {
"use strict";
cc._RF.push(a, "d6ad9lyTkxLt7I3AFAJY1xn", "battle.missileLink");
var t = e("battle.util"), n = e("battle.consts"), i = e("battle.formula"), r = e("battle.libBT"), s = e("battle.entity"), o = function(e) {
r.Node.call(this, e.blackboard);
};
t.inherits(o, r.Node);
a.exports = o;
o.prototype.doAction = function() {
var e = this.blackboard.curCharacter, a = this.blackboard.area, t = this.blackboard.targetPos, o = this.blackboard.attackedTargetIds, l = this.blackboard.targetTeamId;
if (i.inRange(e, t, 10)) {
e.remove();
return r.RES_SUCCESS;
}
if (this.blackboard.missileLinkMoved) {
var c, d = {
pos: e,
teamId: l,
range: 50
}, h = a.getEntitiesByPos(d), u = !1;
for (var m in h) if (h[m] && e.entityId != h[m].entityId && !o[h[m].entityId]) {
e.attack(h[m]);
o[h[m].entityId] = !0;
u = !0;
c = h[m].getPosition();
this.blackboard.missileTargetCount--;
break;
}
if (0 == this.blackboard.missileTargetCount) return r.RES_SUCCESS;
if (u) {
s.prototype.setPosition.call(e, c.x, c.y + e.data.initPos.y);
t = e.getPosition();
e.setTargetNearest(o, l);
var g = a.getEntity(e.targetId);
if (!g) return r.RES_WAIT;
var p = n.MISSILE.DISTANCE * (g.x - e.x > 0 ? 1 : -1), _ = p * (g.y - e.y) / (g.x - e.x);
t.x += p;
t.y += _;
this.blackboard.targetPos = t;
e.move(t.x, t.y);
}
} else {
e.move(t.x, t.y);
this.blackboard.missileLinkMoved = !0;
}
return r.RES_WAIT;
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.entity": "battle.entity",
"battle.formula": "battle.formula",
"battle.libBT": "battle.libBT",
"battle.util": "battle.util"
} ],
