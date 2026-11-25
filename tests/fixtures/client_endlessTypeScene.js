endlessTypeScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "74157MJWzlDLprvbo0iNWkR", "endlessTypeScene");
e("underscore");
var t = e("baseView"), n = e("serverConfig"), i = e("serverMain"), r = e("helper"), s = e("i18n"), o = (e("eyeHandler"), 
e("sceneManager")), l = n.MAP.CONSTS, c = n.MAP.FUNS, d = cc.Class({
extends: cc.Component,
properties: {
mapLayout: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
d.instance || (d.instance = this);
this.update_();
},
onDestroy: function() {
d.instance = null;
},
update_: function() {
var e = d.genData();
this.data = e;
for (var a in d.BmapIds) {
var n = this.mapLayout.getChildByName("map_" + (Number(a) + 1) + "_bt"), i = e.mapItems[a];
n.data = i;
var o = n.getChildByName("progress_label").getComponent(cc.Label);
r.replaceLabel(o, [ i.passId ]);
var l = n.getChildByName("lock");
if (l) {
l.active = i.isLockLevel;
l.active && (o.string = s.t("战队$1级开启", [ i.unlockLevel ]));
}
t.setGray(n, !i.lockStr);
l && t.setGray(l, !0);
}
},
onMap_: function(e) {
var a = e.target.data;
a.lockStr ? t.addHintPanel(a.lockStr) : o.pushScene(o.NAME.ENDLESS_SCENE, {
bmapId: a.bmapId
});
}
});
d.TitleMap = {
402: s.t("赛亚人之家"),
403: s.t("龟仙派"),
404: s.t("人造人"),
405: s.t("弗利萨军团"),
406: s.t("宇宙强战士"),
407: s.t("宇宙强敌"),
408: s.t("超级赛亚人")
};
d.genData = function() {
var e = i.player, a = e.endless, t = {
402: s.t("每周一 00:00 开启"),
403: s.t("每周二 00:00 开启"),
404: s.t("每周三 00:00 开启"),
405: s.t("每周四 00:00 开启"),
406: s.t("每周五 00:00 开启"),
407: s.t("每周六 00:00 开启"),
408: s.t("每周日 00:00 开启")
}, n = l.ENDLESS_MORE_UNLOCK_NEED_LEVEL, r = e.level < n, o = [];
for (var h in d.BmapIds) {
var u = d.BmapIds[h];
if (401 == u) o.push({
bmapId: u,
passId: a.topPassId,
isLock: !1
}); else {
var m = c.checkOpen(u) ? null : t[u];
r && (m = s.t("战队等级达到$1开启", [ n ]));
o.push({
bmapId: u,
passId: a.otherTopPassIdMap[u] || 0,
isLock: !c.checkOpen(u),
unlockLevel: n,
isLockLevel: r,
lockStr: m
});
}
}
return {
mapItems: o
};
};
d.BmapIds = [ 401, 402, 403, 404, 405, 406, 407, 408 ];
cc._RF.pop();
}, {
baseView: "baseView",
eyeHandler: "eyeHandler",
helper: "helper",
i18n: "i18n",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
underscore: "underscore"
} ],
