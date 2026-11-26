fruitSmapScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "54803bd3JBFgo1YdZbzjX5a", "fruitSmapScene");
var t = e("underscore"), n = e("baseView"), i = (e("socket"), e("i18n")), r = e("helper"), s = e("dataApi"), o = e("soundApi"), l = e("resource"), c = (e("guide"), 
e("serverMain")), d = (e("clientConfig"), e("serverConfig")), h = e("battle.consts"), u = e("endlessHandler"), m = e("rankHandler"), g = (e("expeditionHandler"), 
e("viewBattleTeamPanel"), e("rulePanel")), p = e("sceneManager"), _ = e("fruitBmapScene"), k = e("selectBattleRolesScene"), f = e("itemItem"), y = d.MAP.CONSTS, b = d.MAP.FUNS, v = cc.Class({
extends: cc.Component,
properties: {
bgSp: cc.Sprite,
titleLabel: cc.Label,
contentSp: cc.Node,
timesLabel: cc.Label,
powerUpLabel: cc.Label
},
onLoad: function() {
p.curSceneStatusData = t.extend({}, p.curSceneStatusData);
this.statusData = p.curSceneStatusData;
o.playMusic(l.sound_music_double_battle_mp3);
this.update_(this.statusData.bmapId);
},
update_: function(e) {
var a = v.genData(e);
this.data = a;
n.setSpriteFrame(this.bgSp, l["misc_fruit_bmap_" + a.bmapId + "_bg_jpg"]);
r.replaceLabel(this.titleLabel, [ i.t(v.BmapTitleExt[a.bmapId]) ]);
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
r.replaceLabel(this.powerUpLabel, [ a.fruitMapPowerUp ]);
if (v.isAutoNextSmap) {
v.isAutoNextSmap = !1;
this.scheduleOnce(function() {
this.onMap_();
}, 1);
}
},
onMap_: function() {
if (0 != this.data.remainingTimes) {
var e = new Date(Date._now());
0 == e.getDay() && 23 == e.getHours() && e.getMinutes() >= 50 ? n.addHintPanel(i.t("结算奖励中")) : p.pushScene(p.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: k.TYPE.SMAP_BATTLE_ATTACK_TEAM,
opts: {
type: h.BATTLE_TYPE.SMAP,
bmapId: this.data.bmapId,
smapId: this.data.smapItems[0].kindId,
isFruitMap: !0
}
});
} else n.addHintPanel(i.t("挑战次数已用完"));
},
onBuy_: function() {
var e = b.getBuyFruitMapTimesCost(this.data.buyTimes + 1), a = i.t("是否花费$1钻石购买1次挑战次数?(今日已购买$2次)", [ e, this.data.buyTimes ]), t = this;
n.addMessageBox(a, function() {
n.addLoading();
u.buyFruitMapTimes(function() {
t.update_(t.data.bmapId);
});
});
},
onRoles_: function() {
n.addCanUseRolesPanel(this.data.canUseRoleClassIds, i.t("龙珠阵营：$1", [ this.data.rolesTitle ]));
},
onRule_: function() {
n.addRulePanel(g.TYPE.EXPEDITION);
},
onShop_: function() {
p.pushScene(p.NAME.SHOP_SCENE, {
type: d.SHOP.CONSTS.TYPE.EXPEDITION
});
},
onRank_: function() {
var e = this;
m.allServerTop(c.player.extra.crossSid, "endless_pass_id" + this.data.bmapId, 0, 49, function(a) {
n.addRankPanel("9_" + e.data.bmapId, a._temp.myRank, a._temp.myValue, a._temp.list);
});
}
});
v.genData = function(e) {
for (var a = c.player.endless, n = (a.otherTopPassIdMap[e] || 0) + 1, o = (t.last(s.smap.findByOpts({
bmapId: e
})).no, []), l = n; l < n + 7; l++) {
var h = s.smap.findByOpts({
no: l,
bmapId: e
})[0];
if (h) {
var u = [];
for (var m in h.specifyDropEntityIds) u.push({
entityId: h.specifyDropEntityIds[m],
count: h.specifyDropValues[m]
});
var g = [];
for (var m in u) g.push(f.genData({
kindId: u[m].entityId,
count: u[m].count,
extra: u[m].extra
}, !0));
var p = s.mob.findById(h.showBossId), k = {
no: h.no,
kindId: h.kindId,
classId: p.classId,
itemItems: g
};
o.push(k);
}
}
var b = y.DAILY_FRUIT_MAP_TIMES + a.fruitMapBuyTimes - a.fruitMapChallengeTimes, v = a.fruitMapUseRolesNo % 5;
v = 0 == v ? 5 : v;
var S = d.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP[v], T = r.floatStrip(100 * a.fruitMapPowerUp);
return {
bmapId: e,
smapItems: o,
rolesTitle: i.t(_.RoleNoTitles[v - 1]),
canUseRoleClassIds: S,
buyTimes: a.fruitMapBuyTimes,
remainingTimes: b,
fruitMapPowerUp: T
};
};
v.isAutoNextSmap = !1;
v.BmapTitleExt = {
409: i.t("普通"),
410: i.t("困难"),
411: i.t("究极难")
};
cc._RF.pop();
}, {
baseView: "baseView",
"battle.consts": "battle.consts",
clientConfig: "clientConfig",
dataApi: "dataApi",
endlessHandler: "endlessHandler",
expeditionHandler: "expeditionHandler",
fruitBmapScene: "fruitBmapScene",
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
