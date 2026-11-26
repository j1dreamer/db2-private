mobPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "492a7ql8pVA7LXbJPw+lhNF", "mobPanel");
e("underscore");
var t = e("dataApi"), n = e("i18n"), i = e("helper"), r = e("roleItem");
cc.Class({
extends: cc.Component,
properties: {
nameLabel: cc.Label,
levelLabel: cc.Label,
roleItem: cc.Node,
descLabel: cc.Label,
bottomNode: cc.Layout
},
update_: function(e) {
this.data = e;
this.nameLabel.string = e.mobName;
i.replaceLabel(this.levelLabel, [ e.mobLevel ]);
this.roleItem.getComponent("roleItem").update_(e.roleItem);
this.descLabel.string = e.mobDesc;
this.bottomNode.updateLayout();
}
}).genData = function(e) {
var a = t.mob.findById(e), i = r.genData({
kindId: e,
star: a.star,
color: a.color,
imgId: a.imgId
}), s = "", o = t.role.findOneBy("classId", a.classId);
o && (s = t.findEntityById(o.kindId).desc);
return {
roleItem: i,
mobName: n.t(a.name),
mobDesc: s,
mobLevel: a.level
};
};
cc._RF.pop();
}, {
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
roleItem: "roleItem",
underscore: "underscore"
} ],
