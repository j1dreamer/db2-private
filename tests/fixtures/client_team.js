team: [ function(e, a) {
"use strict";
cc._RF.push(a, "22119u8vWxLa4Nn/Ot8h6Nm", "team");
var t = e("md5"), n = e("dataApi"), i = e("baseView"), r = e("i18n"), s = function(e) {
this.md5Map = {};
this.friendshipAttr = {};
this.titleAttr = {};
this.roles = {};
this.update(e.roles, e.friendshipAttr, e.titleAttr);
};
a.exports = s;
s.prototype.update = function(e, a, n) {
this.friendshipAttr = a || this.friendshipAttr;
this.titleAttr = n || this.titleAttr;
for (var i in e) {
this.roles[i] = e[i];
this.roles[i].idx = i;
this.md5Map[i] = t(JSON.stringify(this.roles[i].attr));
}
};
s.prototype.getRoleByIdx = function(e, a) {
if ((a = a || !1) && this.roles[e] && this.md5Map[e] != t(JSON.stringify(this.roles[e].attr))) {
i.addMessageBox(r.t("请勿作弊,不然封号!"), function() {
cc.game.end();
}, null, null, !0, !0);
throw new Error("作弊.");
}
return this.roles[e];
};
s.prototype.getRoleByKindId = function(e) {
for (var a in this.roles) if (this.roles[a].kindId == e) return this.roles[a];
return null;
};
s.prototype.getAllClassIds = function() {
var e, a = [];
for (var t in this.roles) {
e = n.role.findById(this.roles[t].kindId);
a.push(e.classId);
}
return a;
};
s.prototype.getRoleByClassId = function(e) {
for (var a in this.roles) if (n.role.findById(this.roles[a].kindId).classId == e) return this.roles[a];
return null;
};
cc._RF.pop();
}, {
baseView: "baseView",
dataApi: "dataApi",
i18n: "i18n",
md5: "md5"
} ],
