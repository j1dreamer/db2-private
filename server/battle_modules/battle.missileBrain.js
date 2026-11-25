"battle.missileBrain": [ function(e, a) {
"use strict";
cc._RF.push(a, "11801O85CRG4qEt46/2GZZx", "battle.missileBrain");
var t = e("battle.consts"), n = e("battle.libBT"), i = e("battle.entity"), r = e("battle.missileNormal"), s = e("battle.missileTarget"), o = e("battle.missileLink"), l = e("battle.missileAoe"), c = e("battle.missileGoAndBack"), d = e("battle.missileTime"), h = e("battle.missileTimeTarget"), u = function e(a) {
var t = e.genAttackAction(a);
if (t) {
var i = new n.Select({
blackboard: a
});
i.addChild(t);
this.action = i;
}
};
a.exports = u;
u.prototype.update = function() {
return !!this.action && this.action.doAction();
};
u.genAttackAction = function(e) {
var a = e.curCharacter, n = a.attacker, u = n.area.getEntity(a.targetId);
if (!u) {
a.remove();
return null;
}
var m = u.getPosition(), g = a.data, p = a.missileType, _ = t.MISSILE.TYPE;
switch (p) {
case _.NORMAL:
case _.TARGET:
case _.LINK:
var k = t.MISSILE, f = g.initPos.x * (u.x - n.x > 0 ? 1 : -1);
i.prototype.setPosition.call(a, n.x + f, n.y + g.initPos.y);
var y = (f = k.DISTANCE * (u.x - a.x > 0 ? 1 : -1)) * (u.y + k.INIT_POS.y - a.y) / (u.x - a.x);
m.x += f;
m.y += y;
e.targetPos = m;
switch (p) {
case _.NORMAL:
return new r({
blackboard: e
});

case _.TARGET:
e.targetId = a.targetId;
return new s({
blackboard: e
});

case _.LINK:
e.attackedTargetIds = {};
e.targetTeamId = u.teamId;
e.missileTargetCount = a.data.missileTargetCount;
1 == e.missileTargetCount && (e.targetId = a.targetId);
return new o({
blackboard: e
});
}
break;

case _.AOE:
case _.GO_AND_BACK:
f = g.initPos.x * (u.x - n.x > 0 ? 1 : -1);
i.prototype.setPosition.call(a, n.x + f, n.y + g.initPos.y);
(m = a.getPosition()).x += g.range * (u.x - n.x > 0 ? 1 : -1);
e.beginPos = a.getPosition();
e.targetPos = m;
e.attackedTargetIds = {};
switch (p) {
case _.AOE:
return new l({
blackboard: e
});

case _.GO_AND_BACK:
return new c({
blackboard: e
});
}
break;

case _.TIME:
case _.TIME_TARGET:
var b = a.skillPosition;
i.prototype.setPosition.call(a, b.x, b.y);
e.flyTime = g.flyTime;
e.range = g.range;
e.targetId = a.targetId;
e.missileTargetCount = a.data.missileTargetCount;
e.targetTeamId = u.teamId;
switch (p) {
case _.TIME:
return new d({
blackboard: e
});

case _.TIME_TARGET:
return new h({
blackboard: e
});
}
}
};
u.clone = function(e) {
return new u(e.blackboard);
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
"battle.entity": "battle.entity",
"battle.libBT": "battle.libBT",
"battle.missileAoe": "battle.missileAoe",
"battle.missileGoAndBack": "battle.missileGoAndBack",
"battle.missileLink": "battle.missileLink",
"battle.missileNormal": "battle.missileNormal",
"battle.missileTarget": "battle.missileTarget",
"battle.missileTime": "battle.missileTime",
"battle.missileTimeTarget": "battle.missileTimeTarget"
} ],
