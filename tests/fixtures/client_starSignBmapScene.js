starSignBmapScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "d8009R6D1FLq6Ai8bOtvqCQ", "starSignBmapScene");
e("underscore");
var t = e("baseView"), n = e("serverConfig"), i = e("serverMain"), r = e("helper"), s = e("i18n"), o = e("soundApi"), l = (e("buildExt"), 
e("resource")), c = e("rulePanel"), d = (e("rankHandler"), e("endlessHandler"), 
e("sceneManager")), h = n.MAP.CONSTS, u = (n.MAP.FUNS, cc.Class({
extends: cc.Component,
properties: {
mapLayout: cc.Node,
timesLabel: cc.Label
},
statics: {
instance: null
},
onLoad: function() {
u.instance || (u.instance = this);
this.selectRankBmapId = 412;
this.CLASS_IDS = [ 57, 80 ];
o.playMusic(l.sound_music_double_battle_mp3);
this.update_();
},
onDestroy: function() {
u.instance = null;
},
update_: function() {
var e = u.genData();
this.data = e;
for (var a in u.BmapIds) {
var n = this.mapLayout.getChildByName("map_" + (Number(a) + 1) + "_bt"), i = e.mapItems[a];
n.data = i;
var s = n.getChildByName("progress_label").getComponent(cc.Label);
r.replaceLabel(s, [ i.passId ]);
var o = n.getChildByName("armature_node"), l = this.CLASS_IDS[a];
if (o.characterNode && o.characterNode.getComponent("characterArmatureComponent").data.classId != l) {
o.characterNode.destroy();
o.characterNode = null;
}
if (!o.characterNode) {
var c = t.getCharacterNode(l);
c.parent = o;
o.characterNode = c;
}
}
this.timesLabel.string = e.remainingTimes;
},
onMap_: function(e) {
var a = e.target.data;
d.pushScene(d.NAME.STAR_SIGN_SMAP_SCENE, {
bmapId: a.bmapId
});
},
onRoles_: function() {
t.addCanUseRolesPanel(this.data.canUseRoleClassIds, s.t("今日可用英雄"));
},
onRule_: function() {
t.addRulePanel(c.TYPE.STAR_SIGN_MAP);
},
onShop_: function() {
d.pushScene(d.NAME.SHOP_SCENE, {
type: n.SHOP.CONSTS.TYPE.STAR_SIGN
});
}
}));
u.genData = function() {
var e = i.player.endless, a = [];
for (var t in u.BmapIds) {
var r = u.BmapIds[t];
a.push({
bmapId: r,
passId: e.otherTopPassIdMap[r] || 0
});
}
var s = h.DAILY_STAR_SIGN_MAP_TIMES - e.starSignMapChallengeTimes, o = e.starSignMapUseRolesNo % 5;
o = 0 == o ? 5 : o;
return {
mapItems: a,
remainingTimes: s,
canUseRoleClassIds: n.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP[o]
};
};
u.BmapIds = [ 415, 416 ];
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
endlessHandler: "endlessHandler",
helper: "helper",
i18n: "i18n",
rankHandler: "rankHandler",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
