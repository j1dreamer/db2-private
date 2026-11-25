dataApi: [ function(e, a) {
"use strict";
cc._RF.push(a, "be6d6JRmaVCEbpE5Wl5FcU3", "dataApi");
var t = e("data"), n = e("i18n"), i = e("underscore"), r = {};
a.exports = r;
var s = function(e) {
var a = {};
e[0].forEach(function(e, t) {
a[e] = t;
});
e.splice(0, 1);
var t, n = {};
e.forEach(function(e) {
t = o(a, e);
n[t.kindId] = t;
});
this.data = n;
}, o = function(e, a) {
var t = {};
for (var n in e) t[n] = a[e[n]];
return t;
};
s.prototype.findBy = function(e, a) {
var t, n, i = [];
for (t in this.data) (n = this.data[t])[e] == a && i.push(n);
return i;
};
s.prototype.findOneBy = function(e, a) {
var t, n;
for (t in this.data) if ((n = this.data[t])[e] == a) return n;
return null;
};
s.prototype.findOneByExtra = function(e, a) {
var t, n;
for (t in this.data) if ((n = this.data[t]).extra && n.extra[e] == a) return n;
return null;
};
s.prototype.findByOpts = function(e) {
var a, t, n = function e(a, t) {
for (var n in a) if ("object" == typeof a[n] && null != t[n]) {
if (!e(a[n], t[n])) return !1;
} else if (t[n] != a[n]) return !1;
return !0;
}, i = [];
for (a in this.data) n(e, t = this.data[a]) && i.push(t);
return i;
};
s.prototype.findBigger = function(e, a) {
var t, n, i = [];
a = Number(a);
for (t in this.data) {
n = this.data[t];
Number(n[e]) > a && i.push(n);
}
return i;
};
s.prototype.findSmaller = function(e, a) {
var t, n, i = [];
a = Number(a);
for (t in this.data) {
n = this.data[t];
Number(n[e]) <= a && i.push(n);
}
return i;
};
s.prototype.findRange = function(e, a, t) {
var n, i, r = [];
a = Number(a), t = Number(t);
for (n in this.data) {
i = this.data[n];
Number(i[e]) >= a && Number(i[e]) <= t && r.push(i);
}
return r;
};
s.prototype.findById = function(e) {
if (null == e) return null;
this.data[e] || console.log("no find:" + e);
return this.data[e];
};
s.prototype.all = function() {
return this.data;
};
r.findEntityById = function(e) {
var a = r.entity.findById(e);
if (a && r[a.type]) {
var t = r[a.type].findById(a.kindId);
return t || r.entity.findById(a.kindId);
}
return a;
};
r.findDropByClassId = function(e) {
return t.dropExt[e];
};
r.findExperienceByLevel = function(e) {
return r.experience.findBy("level", e)[0];
};
r.findCostByLevel = function(e) {
return r.cost.findBy("level", e)[0];
};
r.findSoulByClassId = function(e) {
return r.soul.findBy("classId", e)[0];
};
r.getTaskExt = function() {
return t.taskExt;
};
r.getRobotExt = function() {
return t.robotExt;
};
r.init = function() {
for (var e in t) r[e] = new s(t[e]);
var a = r.entityExt.all(), n = r.entity.all();
for (var o in a) {
var l = a[o];
n[l.kindId] = l;
}
r.i18nConvert();
if (r.mobExt) {
var c = r.mobExt.all(), d = r.mob.all();
for (var o in c) {
var h = c[o];
d[h.kindId] = h;
}
}
var u = r.smap.all();
for (var m in u) {
u[m].bmap = r.bmap.findById(u[m].bmapId);
u[m].showEntityIds = i.without(u[m].showEntityIds, 0);
if (u[m].position) {
var g = u[m].position.split(",");
u[m].position = {
x: Number(g[0]),
y: Number(g[1])
};
}
}
var p = r.bmap.all();
for (var m in p) {
p[m].smaps = r.smap.findBy("bmapId", p[m].kindId);
p[m].smaps = i.sortBy(p[m].smaps, "rankId");
}
var _ = r.timePeakSmap.all();
for (var m in _) _[m].bmap = r.timePeakBmap.findById(_[m].bmapId);
var k = r.timePeakBmap.all();
for (var m in k) {
k[m].smaps = r.timePeakSmap.findBy("bmapId", k[m].kindId);
k[m].smaps = i.sortBy(k[m].smaps, "no");
}
var f, y, b = r.drop.all(), v = {};
for (var m in b) {
f = (f = v[b[m].classId]) || {};
v[b[m].classId] = f;
y = f[b[m].groupId] || [];
f[b[m].groupId] = y;
y.push(b[m]);
}
t.dropExt = v;
var S = r.robot.all();
v = {};
for (var m in S) {
var T = S[m], M = T.rankRange[0];
v[M] = v[M] || {};
v[M][T.positionType] = T;
}
t.robotExt = v;
var $ = r.task.all();
v = {
main: {},
daily: {},
achievement: {}
};
for (var m in $) {
var I = $[m];
switch (I.type) {
case 1:
v.main[I.groupId] = v.main[I.groupId] || {};
v.main[I.groupId][I.rankId] = I;
break;

case 2:
v.daily[I.groupId] = v.daily[I.groupId] || {};
v.daily[I.groupId][I.rankId] = I;
break;

case 3:
v.achievement[I.groupId] = v.achievement[I.groupId] || {};
v.achievement[I.groupId][I.rankId] = I;
}
}
t.taskExt = v;
};
r.i18nConvert = function() {
for (var e in r.convertTableAttrsMap) if (r[e]) {
var a = r.convertTableAttrsMap[e], t = r[e].all();
for (var s in t) for (var o in t[s]) if (i.include(a, o) && t[s][o]) {
var l = "_" + o;
t[s][l] = t[s][l] || t[s][o];
"object" == typeof t[s][l] && null != t[s][l] ? t[s][o] = JSON.parse(n.t(JSON.stringify(t[s][l]))) : t[s][o] = n.t(t[s][l]);
}
}
var c = r.entity.all();
for (var d in c) {
var h = c[d];
h.extra = h.extra || {};
if (r[h.type]) {
var u = r[h.type].findById(h.kindId);
if (!u) continue;
for (var m in h) u[m] = h[m];
}
}
r.battleDataMd5 = r.genBattleMd5();
};
r.genBattleMd5 = function() {
var a = e("md5"), t = e("battle.consts");
return a(JSON.stringify(r.buff.all()) + JSON.stringify(r.fightSkill.all()) + JSON.stringify(r.math.all()) + JSON.stringify(t));
};
r.checkBattleData = function() {
var a = e("baseView");
if (r.genBattleMd5() != r.battleDataMd5 && !e("buildExt").isSkipCheckBattleData) {
e("helper").sendError("dataApi作弊报错:" + Date.now());
a.addMessageBox(n.t("请勿作弊,不然封号!"), function() {
cc.game.end();
}, null, null, !0, !0);
return !1;
}
return !0;
};
r.convertTableAttrsMap = {
bmap: [ "name" ],
entity: [ "kindName", "desc" ],
fightSkill: [ "name", "desc", "effect", "label", "unlockDesc" ],
friendship: [ "name" ],
role: [ "title", "spDesc" ],
smap: [ "name" ],
task: [ "name", "description" ],
plot: [ "text" ],
timePeakBmap: [ "title", "desc" ],
blessing: [ "name", "desc" ]
};
cc._RF.pop();
}, {
baseView: "baseView",
"battle.consts": "battle.consts",
buildExt: "buildExt",
data: "data",
helper: "helper",
i18n: "i18n",
md5: "md5",
underscore: "underscore"
} ],
