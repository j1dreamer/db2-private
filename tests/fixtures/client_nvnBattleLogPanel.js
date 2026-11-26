nvnBattleLogPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "8de53kSRiRHLbpZTTMP/Wga", "nvnBattleLogPanel");
var t = e("underscore"), n = (e("util"), e("dataApi"), e("i18n")), i = e("sceneManager"), r = e("helper"), s = e("battle.consts"), o = e("playerItem"), l = e("roleItem"), c = e("baseView"), d = (e("battleScene"), 
e("selectBattleRolesScene"));
e("battleWinPanel");
cc.Class({
extends: cc.Component,
properties: {
logItem: cc.Node,
logItemsLayout: cc.Node,
winSpriteFrame: cc.SpriteFrame,
failSpriteFrame: cc.SpriteFrame
},
onLoad: function() {
this.logItem.active = !1;
},
update_: function(e) {
this.data = e;
this.logItemMap = this.logItemMap || {};
c.preHideNodeMap(this.logItemMap);
for (var a in e.logItems) {
var t = this.logItemMap[a];
if (!t) {
(t = cc.instantiate(this.logItem)).parent = this.logItemsLayout;
this.logItemMap[a] = t;
}
t.idx = a;
t.active = !0;
c.markHideNode(t);
t.data = e.logItems[a];
t.getChildByName("play_bt").data = {
times: t.data.times
};
r.replaceLabel(t.getChildByName("times_label").getComponent(cc.Label), [ t.data.times ]);
t.leftRoleItemNodeMap = t.leftRoleItemNodeMap || {};
c.preHideNodeMap(t.leftRoleItemNodeMap);
t.rightRoleItemNodeMap = t.rightRoleItemNodeMap || {};
c.preHideNodeMap(t.rightRoleItemNodeMap);
var i = [ t.leftRoleItemNodeMap, t.rightRoleItemNodeMap ], s = t.getChildByName("bg_sp"), o = [ s.getChildByName("left_bg_sp"), s.getChildByName("right_bg_sp") ], l = t.data.teamInfos;
for (var d in l) {
o[d].getChildByName("result_sp").getComponent(cc.Sprite).spriteFrame = 0 == d ? t.data.isWin ? this.winSpriteFrame : this.failSpriteFrame : t.data.isWin ? this.failSpriteFrame : this.winSpriteFrame;
o[d].getChildByName("player_item_node").getChildByName("player_item").getComponent("playerItem").update_(l[d].playerItem);
o[d].getChildByName("player_level_label").getComponent(cc.Label).string = n.t("LV.$1", [ l[d].playerLevel ]);
o[d].getChildByName("player_name_label").getComponent(cc.Label).string = l[d].playerName;
var h = o[d].getChildByName("role_item_node_layout"), u = h.getChildByName("role_item_node");
u.active = !1;
var m = i[d];
for (var g in l[d].roleItems) {
var p = m[g];
if (!p) {
(p = cc.instantiate(u)).parent = h;
p.idx = a;
m[g] = p;
}
p.active = !0;
c.markHideNode(p);
p.getChildByName("role_item").getComponent("roleItem").update_(l[d].roleItems[g]);
}
}
c.hideNodeMap(t.leftRoleItemNodeMap);
c.hideNodeMap(t.rightRoleItemNodeMap);
}
c.hideNodeMap(this.logItemMap);
},
onPlay_: function(e) {
var a = e.target.data, n = this.data._report, r = n.attackTeam, o = n.defenseTeam, l = d.buildBattleTeam(r.playerId, r.shipsMap[a.times], r.rolesMap[a.times]), h = d.buildBattleTeam(o.playerId, o.shipsMap[a.times], o.rolesMap[a.times]), u = n.damageMapMap[a.times];
l.playerPhotoInfo = r.playerPhotoInfo;
l.playerLevel = r.playerLevel;
l.playerName = r.playerName;
h.playerPhotoInfo = o.playerPhotoInfo;
h.playerLevel = o.playerLevel;
h.playerName = o.playerName;
var m = n.bgImgId, g = t.map(l.roles.concat(h.roles), function(e) {
return e.kindId;
}), p = d.getPreLoadInfos(g, m), _ = {
team1: l,
team2: h,
battleType: s.BATTLE_TYPE.ARENA_PK,
opts: {
seed: n.seed,
isPlayBack: !0,
damageMap: u,
bgImgId: m,
isWin: n.winPlayerIdMap[a.times] == r.playerId
}
};
c.preload(p, function() {
i.pushScene(i.NAME.BATTLE_SCENE, _);
});
},
onClose_: function() {
c.removePanel(this.node);
}
}).genData = function(e) {
var a = [];
for (var t in e.winPlayerIdMap) {
var n = [ e.attackTeam, e.defenseTeam ], i = [];
for (var r in n) {
var s = [];
for (var c in n[r].rolesMap[t]) {
var d = l.genData(n[r].rolesMap[t][c]);
s.push(d);
}
var h = o.genData(n[r].playerPhotoInfo), u = {
playerLevel: n[r].playerLevel,
playerName: n[r].playerName,
playerItem: h,
roleItems: s
};
i.push(u);
}
a.push({
times: t,
isWin: e.winPlayerIdMap[t] == e.attackerId,
teamInfos: i
});
}
return {
logItems: a,
_report: e
};
};
cc._RF.pop();
}, {
baseView: "baseView",
"battle.consts": "battle.consts",
battleScene: "battleScene",
battleWinPanel: "battleWinPanel",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
playerItem: "playerItem",
roleItem: "roleItem",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
underscore: "underscore",
util: "util"
} ],
