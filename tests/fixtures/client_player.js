player: [ function(e, a) {
"use strict";
cc._RF.push(a, "49bc12e0JdK05MjtHbjKL5C", "player");
var t = e("underscore"), n = e("underscore.string"), i = e("emitter"), r = (e("socket"), 
e("util")), s = e("i18n"), o = e("buildExt"), l = e("helper"), c = e("serverMain"), d = e("bagHandler"), h = e("dataApi"), u = function a(t) {
i.call(this);
var n = e("bag"), r = e("team");
this.bag = new n(t.bag);
this.team = new r(t.team);
this.vipData = h.vip.findOneBy("level", t.vip.level);
for (var s in t) this[s] || (this[s] = t[s]);
a.updateMails(t);
this.fixActivity();
this.guild = {};
this.extra.guildBattle = this.extra.guildBattle || {};
this.extra.newGuildBattle = this.extra.newGuildBattle || {};
this.extra.allServerBattle = this.extra.allServerBattle || {};
this.extra.worldBoss = this.extra.worldBoss || {};
this.extra.guildBoss = this.extra.guildBoss || {};
this.extra.prestigeBattle = this.extra.prestigeBattle || {};
this.extra.worshipBattle = this.extra.worshipBattle || {};
this.extra.doubleBattle = this.extra.doubleBattle || {};
this.extra.serverTimeStr = this.extra.serverTimeStr.replace(/-/g, "/");
var o = new Date(this.extra.serverTimeStr).getTime() - this.extra.serverTime;
c.aliasNow(o);
this._tempMap = {};
this.rewardPopList = [];
var l = this;
this.incOnlineTimeInterval = setInterval(function() {
var a = e("homeScene");
l.activity.map.online_reward && a.incOnlineTime();
}, .2);
};
r.inherits(u, i);
a.exports = u;
u.prototype.destroy = function() {
clearInterval(this.incOnlineTimeInterval);
};
u.updateMails = function(e) {
if (e.extra && e.extra.mails) for (var a in e.extra.mails) {
var t = e.extra.mails[a];
"string" != typeof t.title ? t.title = s.t(t.title.content, t.title.replaceList) : t.title = s.t(t.title);
if ("string" != typeof t.body) {
for (var i in t.body.replaceList) {
var r = t.body.replaceList[i];
if (n.include(r, "<") && n.include(r, ">")) {
var o = r.split("<");
for (var l in o) if ("" != o[l]) {
var c = o[l].split(">")[0].split("x")[0];
r = r.replace(c, s.t(c));
}
t.body.replaceList[i] = r;
}
}
t.body = s.t(t.body.content, t.body.replaceList);
} else t.body = s.t(t.body);
}
};
u.prototype.fixActivity = function() {
if (o.isShowBtDiscount && this.extra) {
var e = this.extra.goodsList;
for (var a in e) {
e[a].prePrice = e[a].prePrice || e[a].price;
e[a].price = l.floatStrip(e[a].prePrice / 100);
}
}
};
u.prototype.update = function(e) {
if (e._temp) {
var a = r.clone(e._temp);
delete a.route;
this._tempMap[e._temp.route] = a;
}
u.updateMails(e);
var n = !1, i = [];
for (var s in e) if (void 0 !== this[s]) switch (s) {
case "team":
this.team.update(e.team.roles, e.team.friendshipAttr, e.team.titleAttr);
break;

case "bag":
for (var o in e.bag.items) e.bag.items[o] ? i.push(Number(e.bag.items[o].kindId)) : this.bag.items[o] && i.push(Number(this.bag.items[o].kindId));
i = t.uniq(i);
this.bag.update(e.bag.items);
break;

case "vip":
case "shop":
case "task":
case "activity":
this[s] = this[s] || {};
for (var l in e[s]) if (void 0 !== this[s][l]) if ("object" != typeof e[s][l] || t.isArray(e[s][l]) || null == e[s][l]) this[s][l] != e[s][l] && (this[s][l] = e[s][l]); else {
this[s][l] = this[s][l] || {};
for (var c in e[s][l]) if (void 0 !== this[s][l][c]) {
if (this[s][l][c] != e[s][l][c]) {
this[s][l][c] = e[s][l][c];
this[s][l][c] || delete this[s][l][c];
}
} else this[s][l][c] = e[s][l][c];
} else this[s][l] = e[s][l];
n = !0;
break;

case "_temp":
break;

default:
if ("object" == typeof e[s]) {
for (var l in e[s]) this[s][l] = e[s][l];
n = !0;
} else if (this[s] != e[s]) {
this[s] = e[s];
n = !0;
}
} else this[s] = e[s];
e.bag && this.emit(u.EVENT.BAG, t.values(e.bag.items), i);
e.team && this.emit(u.EVENT.TEAM, t.values(e.team.roles), e.team.friendshipAttr);
if (e.vip) {
this.vipData = h.vip.findOneBy("level", this.vip.level);
if (e._temp && e._temp.topUpMoney) {
var d = new Date().toLocaleDateString(), m = storage.getItem("todayTopUpMoney" + d) || 0;
m += e._temp.topUpMoney;
storage.setItem("todayTopUpMoney" + d, m);
}
}
this.fixActivity();
var g = t.keys(e);
n && this.emit(u.EVENT.ATTRS, g);
};
u.prototype.autoSellExchangeItem = function() {
var e = [], a = [];
for (var t in this.bag.items) {
var n = this.bag.items[t];
if (h.findEntityById(n.kindId).extra.isExchangeItem && !this.activity.exchange) {
e.push(n.idx);
a.push(n.count);
}
}
e.length > 0 && d.sell(e, a);
};
u.EVENT = {
ATTRS: "attrs",
TEAM: "team",
BAG: "bag"
};
cc._RF.pop();
}, {
bag: "bag",
bagHandler: "bagHandler",
buildExt: "buildExt",
dataApi: "dataApi",
emitter: "emitter",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
serverMain: "serverMain",
socket: "socket",
team: "team",
underscore: "underscore",
"underscore.string": "underscore.string",
util: "util"
} ],
