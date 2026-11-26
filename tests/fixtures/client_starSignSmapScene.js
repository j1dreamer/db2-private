starSignSmapScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "ed1d2XVSkRGAZdmpOzU1/VT", "starSignSmapScene");
var t = e("underscore"), n = e("baseView"), i = (e("socket"), e("i18n")), r = e("helper"), s = e("dataApi"), o = e("soundApi"), l = e("resource"), c = (e("guide"), 
e("serverMain")), d = (e("clientConfig"), e("serverConfig")), h = e("battle.consts"), u = (e("endlessHandler"), 
e("rankHandler")), m = (e("expeditionHandler"), e("viewBattleTeamPanel"), e("rulePanel"), 
e("sceneManager")), g = e("selectBattleRolesScene"), p = e("itemItem"), _ = d.MAP.CONSTS, k = (d.MAP.FUNS, 
cc.Class({
extends: cc.Component,
properties: {
bgSp: cc.Sprite,
titleLabel: cc.Label,
contentSp: cc.Node,
timesLabel: cc.Label
},
onLoad: function() {
m.curSceneStatusData = t.extend({}, m.curSceneStatusData);
this.statusData = m.curSceneStatusData;
o.playMusic(l.sound_music_double_battle_mp3);
this.update_(this.statusData.bmapId);
},
update_: function(e) {
var a = k.genData(e);
this.data = a;
n.setSpriteFrame(this.bgSp, l["misc_star_sign_bmap_" + a.bmapId + "_bg_jpg"]);
r.replaceLabel(this.titleLabel, [ i.t(k.BmapTitleExt[a.bmapId]) ]);
this.timesLabel.string = a.remainingTimes;
for (var t = 0; t < 7; t++) {
var s = a.smapItems[t], o = this.contentSp.getChildByName("map_" + (t + 1) + "_layout");
o.active = !!s;
if (o.active) {
o.getComponent(cc.Button).interactable = 0 == t;
var c = o.getChildByName("armature_node");
if (c.active) {
var d = s.classId, h = c.characterNode;
if (h && h.getComponent("characterArmatureComponent").data.classId != d) {
h.destroy();
h = null;
}
if (!h && d) {
(h = n.getCharacterNode(d)).parent = c;
h.idx = t;
c.characterNode = h;
}
}
var u = o.getChildByName("reward_bg_sp"), m = u.getChildByName("no_label").getComponent(cc.Label);
r.replaceLabel(m, [ s.no ]);
for (var g = u.getChildByName("items_layout"), p = 0; p < 3; p++) {
var _ = g.getChildByName("item_item_" + (p + 1));
_.active = !!s.itemItems[p];
if (_.active) {
_.getComponent("itemItem").update_(s.itemItems[p]);
_.getComponent("itemItem").setShowPanel_(!0);
}
}
}
}
if (k.isAutoNextSmap) {
k.isAutoNextSmap = !1;
this.scheduleOnce(function() {
this.onMap_();
}, 1);
}
},
onMap_: function() {
0 != this.data.remainingTimes ? m.pushScene(m.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: g.TYPE.SMAP_BATTLE_ATTACK_TEAM,
opts: {
type: h.BATTLE_TYPE.SMAP,
bmapId: this.data.bmapId,
smapId: this.data.smapItems[0].kindId,
isStarSignMap: !0
}
}) : n.addHintPanel(i.t("挑战次数已用完"));
},
onRoles_: function() {
n.addCanUseRolesPanel(this.data.canUseRoleClassIds, i.t("今日可用英雄"));
},
onShop_: function() {
m.pushScene(m.NAME.SHOP_SCENE, {
type: d.SHOP.CONSTS.TYPE.STAR_SIGN
});
},
onRank_: function() {
var e = this;
u.allServerTop(c.player.extra.crossSid, "endless_pass_id" + this.data.bmapId, 0, 49, function(a) {
n.addRankPanel("9_" + e.data.bmapId, a._temp.myRank, a._temp.myValue, a._temp.list);
});
}
}));
k.genData = function(e) {
for (var a = c.player.endless, n = (a.otherTopPassIdMap[e] || 0) + 1, i = (t.last(s.smap.findByOpts({
bmapId: e
})).no, []), r = n; r < n + 7; r++) {
var o = s.smap.findByOpts({
no: r,
bmapId: e
})[0];
if (o) {
var l = [];
for (var h in o.specifyDropEntityIds) l.push({
entityId: o.specifyDropEntityIds[h],
count: o.specifyDropValues[h]
});
var u = [];
for (var h in l) u.push(p.genData({
kindId: l[h].entityId,
count: l[h].count,
extra: l[h].extra
}, !0));
var m = s.mob.findById(t.last(o.mobZone2)), g = {
no: o.no,
kindId: o.kindId,
classId: m.classId,
itemItems: u
};
i.push(g);
}
}
var k = _.DAILY_STAR_SIGN_MAP_TIMES - a.starSignMapChallengeTimes, f = a.starSignMapUseRolesNo % 5;
f = 0 == f ? 5 : f;
return {
bmapId: e,
smapItems: i,
canUseRoleClassIds: d.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP[f],
remainingTimes: k
};
};
k.isAutoNextSmap = !1;
k.BmapTitleExt = {
415: i.t("普通"),
416: i.t("困难")
};
cc._RF.pop();
}, {
baseView: "baseView",
"battle.consts": "battle.consts",
clientConfig: "clientConfig",
dataApi: "dataApi",
endlessHandler: "endlessHandler",
expeditionHandler: "expeditionHandler",
guide: "guide",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
rankHandler: "rankHandler",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
socket: "socket",
soundApi: "soundApi",
underscore: "underscore",
viewBattleTeamPanel: "viewBattleTeamPanel"
} ],
