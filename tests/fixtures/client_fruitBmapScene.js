fruitBmapScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "13f04wQ0v5OJagVVHBA0nY4", "fruitBmapScene");
e("underscore");
var t = e("baseView"), n = e("serverConfig"), i = e("serverMain"), r = e("helper"), s = e("i18n"), o = e("soundApi"), l = e("resource"), c = e("rulePanel"), d = e("rankPanel"), h = e("rankHandler"), u = e("endlessHandler"), m = e("sceneManager"), g = n.MAP.CONSTS, p = n.MAP.FUNS, _ = cc.Class({
extends: cc.Component,
properties: {
mapLayout: cc.Node,
timesLabel: cc.Label,
rankPanel: cc.Node,
rankLevelBtsContent: cc.Node,
rankItemsLayout: cc.Node,
rankItem: cc.Node,
rankPanelBottomBgSp: cc.Node,
myRankColor: cc.Color
},
statics: {
instance: null
},
onLoad: function() {
_.instance || (_.instance = this);
this.selectRankBmapId = 409;
this.rankPanel.active = !1;
this.rankItem.active = !1;
o.playMusic(l.sound_music_double_battle_mp3);
this.update_();
},
onDestroy: function() {
_.instance = null;
},
update_: function() {
var e = _.genData();
this.data = e;
for (var a in _.BmapIds) {
var t = this.mapLayout.getChildByName("map_" + (Number(a) + 1) + "_bt"), n = e.mapItems[a];
t.data = n;
var i = t.getChildByName("progress_label").getComponent(cc.Label);
r.replaceLabel(i, [ n.passId ]);
}
this.timesLabel.string = e.remainingTimes;
},
updateRankPanel_: function(e, a, n, r) {
for (var o in _.BmapIds) this.rankLevelBtsContent.getChildByName("level_" + (Number(o) + 1) + "_bt_item").getComponent(cc.Button).interactable = _.BmapIds[o] != this.selectRankBmapId;
this.rankItemMap = this.rankItemMap || {};
t.preHideNodeMap(this.rankItemMap);
for (var o in e) {
var l = e[o], c = this.rankItemMap[o];
if (!c) {
(c = cc.instantiate(this.rankItem)).parent = this.rankItemsLayout;
this.rankItemMap[o] = c;
}
c.active = !0;
t.markHideNode(c);
c.data = {
defenderId: l.playerId
};
(d = c.getChildByName("rank_label")).getComponent(cc.Label).string = l.rank;
(h = c.getChildByName("server_label")).getComponent(cc.Label).string = l.serverId;
(u = c.getChildByName("level_label")).getComponent(cc.Label).string = s.t("LV.$1", [ l.playerLevel ]);
(m = c.getChildByName("name_label")).getComponent(cc.Label).string = l.playerName;
c.getChildByName("power_label").getComponent(cc.Label).string = l.extValue;
(g = c.getChildByName("value_label")).getComponent(cc.Label).string = l.value;
d._color = d._color || d.color;
h._color = h._color || h.color;
u._color = u._color || u.color;
m._color = m._color || m.color;
g._color = g._color || g.color;
if (e[o].playerId == i.player.id) d.color = h.color = u.color = m.color = g.color = this.myRankColor; else {
d.color = d._color;
h.color = h._color;
u.color = u._color;
m.color = m._color;
g.color = g._color;
}
}
t.hideNodeMap(this.rankItemMap);
var d, h, u, m, g;
(d = this.rankPanelBottomBgSp.getChildByName("rank_label")).getComponent(cc.Label).string = a || s.t("未上榜");
(h = this.rankPanelBottomBgSp.getChildByName("server_label")).getComponent(cc.Label).string = i.player.serverId;
(u = this.rankPanelBottomBgSp.getChildByName("level_label")).getComponent(cc.Label).string = s.t("LV.$1", [ i.player.level ]);
(m = this.rankPanelBottomBgSp.getChildByName("name_label")).getComponent(cc.Label).string = i.player.name;
this.rankPanelBottomBgSp.getChildByName("power_label").getComponent(cc.Label).string = r || "";
(g = this.rankPanelBottomBgSp.getChildByName("value_label")).getComponent(cc.Label).string = n || "";
},
onMap_: function(e) {
var a = e.target.data;
m.pushScene(m.NAME.FRUIT_SMAP_SCENE, {
bmapId: a.bmapId
});
},
onBuy_: function() {
var e = p.getBuyFruitMapTimesCost(this.data.buyTimes + 1), a = s.t("是否花费$1钻石购买1次挑战次数?(今日已购买$2次)", [ e, this.data.buyTimes ]), n = this;
t.addMessageBox(a, function() {
t.addLoading();
u.buyFruitMapTimes(function() {
n.update_();
});
});
},
onRoles_: function() {
t.addCanUseRolesPanel(this.data.canUseRoleClassIds, s.t("龙珠阵营：$1", [ this.data.rolesTitle ]));
},
onRule_: function() {
t.addRulePanel(c.TYPE.FRUIT_MAP);
},
onShop_: function() {
m.pushScene(m.NAME.SHOP_SCENE, {
type: n.SHOP.CONSTS.TYPE.FRUIT
});
},
onRank_: function() {
var e = this;
t.addLoading();
h.allServerTop(i.player.extra.crossSid, "endless_pass_times" + this.selectRankBmapId, 0, 49, function(a) {
t.addPanel(e.rankPanel, !0);
e.updateRankPanel_(a._temp.list, a._temp.myRank, a._temp.myValue, a._temp.extMyValue);
});
},
onRankType_: function(e, a) {
e.target;
this.selectRankBmapId = a;
this.onRank_();
},
onRankViewTeam_: d.prototype.onRankItem_
});
_.genData = function() {
var e = i.player.endless, a = [];
for (var t in _.BmapIds) {
var r = _.BmapIds[t];
a.push({
bmapId: r,
passId: e.otherTopPassIdMap[r] || 0
});
}
var o = g.DAILY_FRUIT_MAP_TIMES + e.fruitMapBuyTimes - e.fruitMapChallengeTimes, l = e.fruitMapUseRolesNo % 5;
l = 0 == l ? 5 : l;
var c = n.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP[l];
return {
mapItems: a,
buyTimes: e.fruitMapBuyTimes,
remainingTimes: o,
rolesTitle: s.t(_.RoleNoTitles[l - 1]),
canUseRoleClassIds: c
};
};
_.BmapIds = [ 409, 410, 411 ];
_.RoleNoTitles = [ s.t("绿"), s.t("蓝"), s.t("紫"), s.t("橙"), s.t("红") ];
cc._RF.pop();
}, {
baseView: "baseView",
endlessHandler: "endlessHandler",
helper: "helper",
i18n: "i18n",
rankHandler: "rankHandler",
rankPanel: "rankPanel",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
