arena3v3Scene: [ function(e, a) {
"use strict";
cc._RF.push(a, "d202crrfg5AJZBG5Avb/Pvx", "arena3v3Scene");
var t = e("underscore"), n = (e("http"), e("util")), i = e("moment"), r = e("baseView"), s = e("dataApi"), o = (e("guide"), 
e("buildExt")), l = e("serverConfig"), c = e("serverMain"), d = e("player"), h = e("arena3v3Handler"), u = e("arenaHandler"), m = (e("rankHandler"), 
e("i18n")), g = e("helper"), p = e("battle.consts"), _ = e("selectBattleRolesScene"), k = (e("soundApi"), 
e("resource"), e("rulePanel")), f = e("shipItem"), y = e("roleItem"), b = e("playerItem"), v = e("sceneManager"), S = l.ARENA_3V3.CONSTS, T = cc.Class({
extends: cc.Component,
properties: {
rankBt: cc.Node,
hourCoinLabel: cc.Label,
receiveCoinLabel: cc.Label,
receiveBt: cc.Node,
levelLabel: cc.Label,
worshipNode: cc.Node,
levelNodeItem: cc.Node,
myTeamNode: cc.Node,
shipItem: cc.Node,
roleItemNode: cc.Node,
switchBt: cc.Node,
cancelSwitchBt: cc.Node,
timesLabel: cc.Label,
buyTimesBt: cc.Node,
challengeBt: cc.Node,
costGemLabel: cc.Label,
logPanel: cc.Node,
logItem: cc.Node,
logItemsLayout: cc.Node,
challengePanel: cc.Node,
challengeBottomLayout: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
T.instance || (T.instance = this);
v.curSceneStatusData = t.extend({
isShowLogPanel: !1,
isShowMyTeamNode: !1
}, v.curSceneStatusData);
this.statusData = v.curSceneStatusData;
this.onFun = this.update_.bind(this);
c.player.on(d.EVENT.ATTRS, this.onFun);
this.levelNodeItem.active = !1;
this.logItem.active = !1;
this.logPanel.active = !1;
this.shipItem.active = !1;
this.roleItemNode.active = !1;
this.cancelSwitchBt.active = !1;
this.challengePanel.active = !1;
this.rankBt.active = !o.isHideRankBt;
this.myEnterBt = null;
this.switchTeamId = null;
this.update_([ "arena3v3" ]);
},
onDestroy: function() {
c.player.off(d.EVENT.ATTRS, this.onFun);
T.instance = null;
},
update_: function(e) {
if (t.include(e, "arena3v3")) {
var a = T.genData();
this.data = a;
this.myTeamNode.active = this.statusData.isShowMyTeamNode;
this.worshipNode.active = !this.myTeamNode.active;
r.getBackNode().node.active = !this.myTeamNode.active;
g.replaceLabel(this.hourCoinLabel, [ a.hourCoin ]);
this.receiveCoinLabel.string = a.receiveCoin;
g.replaceLabel(this.levelLabel, [ a.battlefieldLevel, a.rank ]);
r.setMark(this.receiveBt, a.receiveCoin > 0);
if (this.worshipNode.active) {
this.levelNodeItemMap = this.levelNodeItemMap || {};
r.preHideNodeMap(this.levelNodeItemMap);
var n = [ 0, 0, 0, 0, 0, 0 ];
for (var i in S.LEVEL_TYPE_BETWEEN) {
var o = this.levelNodeItemMap[i];
if (!o) {
(o = cc.instantiate(this.levelNodeItem)).parent = this.worshipNode;
o.idx = i;
this.levelNodeItemMap[i] = o;
o.y += n[i];
}
o.active = !0;
r.markHideNode(o);
var c = S.LEVEL_BETWEEN[i], d = S.LEVEL_TYPE_BETWEEN[i], h = o.getChildByName("title_bg_sp"), u = h.getChildByName("name_label").getComponent(cc.Label);
g.replaceLabel(u, [ c ]);
var m = h.getChildByName("level_label").getComponent(cc.Label);
g.replaceLabel(m, d.split("_").slice(1));
var p = a.playerInfoMap[d];
l.PLAYER.FUNS.isRobot(p.playerId) && (p = null);
var _ = o.getChildByName("info_bg_sp");
_.active = !!p;
if (_.active) {
_.getChildByName("name_label").getComponent(cc.Label).string = p.playerName;
g.replaceLabel(_.getChildByName("server_label").getComponent(cc.Label), [ p.serverId ]);
g.replaceLabel(_.getChildByName("level_label").getComponent(cc.Label), [ p.playerLevel ]);
}
var k = o.getChildByName("armature_node");
k.active = !!p;
if (k.active) {
var f = s.role.findOneBy("imgId", p.playerPhotoInfo.photoImgId), y = f ? f.classId : 1, b = k.characterNode;
if (b && b.getComponent("characterArmatureComponent").data.classId != y) {
b.destroy();
b = null;
}
if (!b && y) {
(b = r.getCharacterNode(y)).parent = k;
b.idx = i;
b.getComponent("characterArmatureComponent").setTitle_(p.playerPhotoInfo.titleImgId);
k.characterNode = b;
}
k.data = {
defenderId: p.playerId
};
}
var v = o.getChildByName("enter_bt");
v.active = a.battlefieldLevel == c;
v.active && (this.myEnterBt = v);
var M = o.getChildByName("worship_bt");
M.data = {
levelType: d
};
M.getComponent(cc.Button).interactable = !a.worshipStatueMap[d];
}
r.hideNodeMap(this.levelNodeItemMap);
} else {
this.roleItemNodeMap = this.roleItemNodeMap || {};
r.preHideNodeMap(this.roleItemNodeMap);
this.shipItemMap = this.shipItemMap || {};
r.preHideNodeMap(this.shipItemMap);
for (var $ = 1; $ <= 3; $++) {
var I = this.myTeamNode.getChildByName("team_" + $ + "_bg_sp").getChildByName("layout");
I.getChildByName("switch_bt").active = !1;
I.getChildByName("select_bt").active = !1;
if (a.shipItemsMap[$]) for (i = 0; i < a.shipItemsMap[$].length; i++) {
var C = a.shipItemsMap[$][i], P = this.shipItemMap[$ + "_" + i];
if (!P) {
(P = cc.instantiate(this.shipItem)).parent = I.getChildByName("ship_" + (i + 1) + "_bg_sp");
this.shipItemMap[$ + "_" + i] = P;
}
P.active = !0;
r.markHideNode(P);
P.getComponent("shipItem").update_(C);
}
for (i = 0; i < a.roleItemsMap[$].length; i++) {
var D = a.roleItemsMap[$][i], N = this.roleItemNodeMap[$ + "_" + i];
if (!N) {
(N = cc.instantiate(this.roleItemNode)).parent = I.getChildByName("role_" + (i + 1) + "_bg_sp");
this.roleItemNodeMap[$ + "_" + i] = N;
}
N.active = !0;
r.markHideNode(N);
N.getChildByName("role_item").getComponent("roleItem").update_(D);
}
}
r.hideNodeMap(this.roleItemNodeMap);
r.hideNodeMap(this.shipItemMap);
g.replaceLabel(this.timesLabel, [ a.remainingChallengeTimes, a.maxChallengeTimes ]);
this.buyTimesBt.active = 0 == a.remainingChallengeTimes;
this.costGemLabel.node.parent.active = this.buyTimesBt.active;
this.buyTimesBt.active && (this.costGemLabel.string = this.data.buyTimesCostGem);
this.challengeBt.active = !this.buyTimesBt.active;
}
}
},
onEnterMyTeam_: function() {
this.statusData.isShowMyTeamNode = !0;
this.update_([ "arena3v3" ]);
},
onCloseMyTeam_: function() {
this.statusData.isShowMyTeamNode = !1;
this.update_([ "arena3v3" ]);
},
onWorship_: function(e) {
var a = e.target, t = a.data;
r.addLoading();
h.worshipStatue(t.levelType, function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap);
a.getComponent(cc.Button).interactable = !1;
});
},
onChallenge_: function() {
var e = this;
r.addLoading();
h.match(function(a) {
r.addPanel(e.challengePanel);
var n = [];
n.push(a._temp.smaller);
n.push(a._temp.middle);
n.push(a._temp.larger);
for (var i = 0; i < n.length; i++) {
var s = e.challengeBottomLayout.getChildByName("player_info_" + (i + 1) + "_layout"), o = s.getChildByName("player_item"), l = b.genData(n[i].playerPhotoInfo);
o.getComponent("playerItem").update_(l);
o.data = {
defenderId: n[i].playerId
};
o.getComponent("playerItem").setClickEvent_(e.node, "arena3v3Scene", "onViewBattleTeam_");
s.getChildByName("rank_label").getComponent(cc.Label).string = n[i].rank;
var c = t.reduce(t.values(n[i].totalPowerMap), function(e, a) {
return e + a;
}, 0);
s.getChildByName("power_label").getComponent(cc.Label).string = c;
var d = s.getChildByName("info_bg_sp");
d.getChildByName("name_label").getComponent(cc.Label).string = n[i].playerName;
d.getChildByName("level_label").getComponent(cc.Label).string = m.t("LV.$1", [ n[i].playerLevel ]);
var h = d.getChildByName("server_label").getComponent(cc.Label);
g.replaceLabel(h, [ n[i].serverId ]);
s.getChildByName("challenge_bt").data = {
defenderId: n[i].playerId
};
}
});
},
onCloseChallengePanel_: function() {
r.removePanel(this.challengePanel);
},
onChallenge2_: function(e) {
var a = e.target.data;
r.removePanel(this.challengePanel);
r.addLoading();
h.defenseTeam(a.defenderId, function(e) {
v.pushScene(v.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: _.TYPE.ARENA_3V3_ATTACK_TEAM,
opts: {
type: p.BATTLE_TYPE.ARENA_PK,
defenderId: a.defenderId,
selectTeamId: 1,
defenseTeam: e._temp.defenseTeam
}
});
});
},
onViewBattleTeam_: function(e) {
var a = e.target.data;
r.addLoading();
h.defenseTeam(a.defenderId, function(e) {
r.addViewBattleTeamPanel(e._temp.defenseTeam);
});
},
onBuyTimes_: function() {
r.addLoading();
h.buyChallengeTimes();
},
onLog_: function() {
var e = this;
r.addLoading();
h.reportList(function(a) {
var t = T.genLogData(a._temp.reportList);
r.addPanel(e.logPanel);
e.logItemMap = e.logItemMap || {};
r.preHideNodeMap(e.logItemMap);
for (var n in t.arenaRecordItems) {
var i = e.logItemMap[n];
if (!i) {
(i = cc.instantiate(e.logItem)).parent = e.logItemsLayout;
i.idx = n;
e.logItemMap[n] = i;
}
i.active = !0;
r.markHideNode(i);
var s = t.arenaRecordItems[n];
i.data = s;
i.getChildByName("player_item").getComponent("playerItem").update_(t.playerItem);
i.getChildByName("attack_sp").scaleX = s.isAttacker ? 1 : -1;
var o = i.getChildByName("target_player_item_layout");
o.getChildByName("player_item").getComponent("playerItem").update_(s.playerItem);
o.getChildByName("player_item").removeComponent(cc.Button);
o.getChildByName("name_label").getComponent(cc.Label).string = s.playerName;
o.getChildByName("level_label").getComponent(cc.Label).string = m.t("LV.$1", [ s.playerLevel ]);
i.getChildByName("time_label").getComponent(cc.Label).string = s.timeDes;
i.getChildByName("play_bt").data = s;
var l = i.getChildByName("win_change_label");
l.active = s.isWin;
l.getComponent(cc.Label).string = Math.abs(s.up);
var c = i.getChildByName("fail_change_label");
c.active = !s.isWin;
c.getComponent(cc.Label).string = Math.abs(s.up);
}
r.hideNodeMap(e.logItemMap);
});
},
onShop_: function() {
v.pushScene(v.NAME.SHOP_SCENE, {
type: l.SHOP.CONSTS.TYPE.ARENA_3V3
});
},
onPlay_: function(e) {
var a = e.target.data;
r.addLoading();
u.report(a.reportId, function(e) {
r.addNvnBattleLogPanel(e._temp.report);
});
},
onCloseLogPanel_: function() {
r.removePanel(this.logPanel);
},
onModified_: function() {
v.pushScene(v.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: _.TYPE.ARENA_3V3_DEFENSE_TEAM,
opts: {
selectTeamId: 1
}
});
},
onReceive_: function() {
if (0 != this.data.receiveCoin) {
r.addLoading();
var e = this;
h.receive(function(a) {
r.addRewardEffectPanel(a._temp.entityCountMap);
c.player.arena3v3.receiveCoin = 0;
e.update_([ "arena3v3" ]);
});
} else r.addHintPanel(m.t("当前没有可领取的奖励"));
},
onSwitch_: function(e) {
var a = e.target;
this.switchBt.active = !0;
this.cancelSwitchBt.active = !0;
a.active = !1;
for (var t = 1; t <= 3; t++) {
var n = this.myTeamNode.getChildByName("team_" + t + "_bg_sp").getChildByName("layout");
cc.Tween.stopAllByTarget(n);
n.getChildByName("select_bt").active = !1;
var i = n.getChildByName("switch_bt"), r = n.getChildByName("team_sp");
if (a == this.switchBt) {
r.active = !1;
i.active = !0;
cc.tween(n).to(.2, {
position: cc.v2(-60, n.y)
}).start();
} else {
r.active = !0;
i.active = !1;
cc.tween(n).to(.2, {
position: cc.v2(0, n.y)
}).start();
}
}
},
onSwitchTeam_: function(e) {
for (var a = e.target, t = 1; t <= 3; t++) {
var n = this.myTeamNode.getChildByName("team_" + t + "_bg_sp").getChildByName("layout"), i = n.getChildByName("switch_bt"), r = n.getChildByName("select_bt");
i.active = !1;
r.active = a != i;
r.data = {
teamId: t
};
r.active || (this.switchTeamId = t);
}
},
onSelectTeam_: function(e) {
var a = e.target.data.teamId, t = this.switchTeamId, i = n.clone(this.data.defenseTeamIndexsMap), s = i[a], o = n.clone(this.data.defenseShipIndexsMap), l = o[a];
i[a] = i[t];
i[t] = s;
o[a] = o[t];
o[t] = l;
var c = this;
r.addLoading();
h.setDefenseTeamIndexsMap(i, o, function() {
c.onSwitch_({
target: c.cancelSwitchBt
});
});
},
onRule_: function() {
r.addRulePanel(k.TYPE.ARENA_3V3, {
rank: this.data.rank
});
},
onRank_: function() {
var a = e("battlefieldRankPanel");
r.addBattlefieldRankPanel(a.RANK_TYPE.ARENA_3V3);
},
onWorshipRank_: function() {
var a = e("worshipRankPanel");
r.addWorshipRankPanel(a.RANK_TYPE.ARENA_3V3);
}
});
T.genData = function() {
var e = c.player, a = e.arena3v3, n = e.team, i = e.bag, r = {};
for (var s in a.defenseShipIndexsMap) {
r[s] = r[s] || [];
for (var o in a.defenseShipIndexsMap[s]) {
var d = i.getItemByIdx(a.defenseShipIndexsMap[s][o]);
r[s].push(f.genData(d));
}
r[s] = t.sortBy(r[s], function(e) {
return e._data.classId;
});
}
var h = {};
for (var s in a.defenseTeamIndexsMap) {
h[s] = h[s] || [];
for (var o in a.defenseTeamIndexsMap[s]) {
var u = n.getRoleByIdx(a.defenseTeamIndexsMap[s][o]);
h[s].push(y.genData(u));
}
h[s] = t.sortBy(h[s], function(e) {
return -e._data.positionPriority;
});
}
var m = _.TYPE.ARENA_3V3_DEFENSE_TEAM + "_selectIdxsMap_" + e.id;
storage.setItem(m, a.defenseTeamIndexsMap);
var g = l.ARENA_3V3.FUNS.getBuyChallengeTimesCost(e.vip.buy3v3ChallengeTimesTimes + 1);
return {
battlefieldLevel: l.FUNS.getValueByBetween(S.LEVEL_BETWEEN, S.LEVEL_BETWEEN, e.level),
rank: a.rank,
playerInfoMap: a.playerInfoMap,
remainingChallengeTimes: a.remainingChallengeTimes,
maxChallengeTimes: a.maxChallengeTimes,
buyTimesCostGem: g,
shipItemsMap: r,
roleItemsMap: h,
defenseTeamIndexsMap: a.defenseTeamIndexsMap,
defenseShipIndexsMap: a.defenseShipIndexsMap,
hourCoin: a.hourCoin,
receiveCoin: a.receiveCoin,
worshipStatueMap: e.worshipStatue3v3Map,
_arena3v3: a
};
};
T.genLogData = function(e) {
var a = c.player, t = [];
for (var n in e) {
var r = e[n], s = i(c.tTime(r.ctime)).from(Date._now()), o = r.playerInfo, l = b.genData(o.playerPhotoInfo), d = {
reportId: r.id,
isAttacker: r.isAttacker,
up: r.up,
isWin: r.isWin,
is3v3: r.is3v3,
playerName: o.playerName,
playerLevel: o.playerLevel,
playerItem: l,
timeDes: s
};
t.push(d);
}
return {
playerItem: b.genData(a.photoInfo),
arenaRecordItems: t
};
};
cc._RF.pop();
}, {
arena3v3Handler: "arena3v3Handler",
arenaHandler: "arenaHandler",
baseView: "baseView",
"battle.consts": "battle.consts",
battlefieldRankPanel: "battlefieldRankPanel",
buildExt: "buildExt",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
http: "http",
i18n: "i18n",
moment: "moment",
player: "player",
playerItem: "playerItem",
rankHandler: "rankHandler",
resource: "resource",
roleItem: "roleItem",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipItem: "shipItem",
soundApi: "soundApi",
underscore: "underscore",
util: "util",
worshipRankPanel: "worshipRankPanel"
} ],
