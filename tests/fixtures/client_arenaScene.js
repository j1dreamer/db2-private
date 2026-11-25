arenaScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "6f191Ze8O1CYLXVjIj8+XMz", "arenaScene");
var t = e("underscore"), n = (e("http"), e("async")), i = e("moment"), r = e("baseView"), s = e("dataApi"), o = (e("guide"), 
e("buildExt")), l = e("serverConfig"), c = e("serverMain"), d = e("player"), h = e("arenaHandler"), u = e("rankHandler"), m = e("i18n"), g = e("helper"), p = e("battle.consts"), _ = e("selectBattleRolesScene"), k = e("battleScene"), f = (e("soundApi"), 
e("resource"), e("itemItem"), e("roleItem")), y = e("shipItem"), b = e("playerItem"), v = e("rulePanel"), S = e("rankPanel"), T = e("sceneManager"), M = cc.Class({
extends: cc.Component,
properties: {
myArmaturenode: cc.Node,
teamLayout: cc.Node,
roleItemNode: cc.Node,
shipItem: cc.Node,
rankBt: cc.Node,
rankLabel: cc.Label,
powerLabel: cc.Label,
centerLayout: cc.Node,
timesLabel: cc.Label,
refreshBt: cc.Node,
buyTimesBt: cc.Node,
costGemLabel: cc.Label,
logPanel: cc.Node,
logItem: cc.Node,
logItemsLayout: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
M.instance || (M.instance = this);
T.curSceneStatusData = t.extend({
isShowLogPanel: !1
}, T.curSceneStatusData);
this.statusData = T.curSceneStatusData;
this.onFun = this.update_.bind(this);
c.player.on(d.EVENT.ATTRS, this.onFun);
this.centerLayout.active = !1;
this.logItem.active = !1;
this.logPanel.active = !1;
this.roleItemNode.active = !1;
this.shipItem.active = !1;
this.rankBt.active = !o.isHideRankBt;
this.rankLabel.node.parent.zIndex = 1;
this.update_([ "arena" ]);
},
onDestroy: function() {
c.player.off(d.EVENT.ATTRS, this.onFun);
M.instance = null;
},
update_: function(e) {
if (t.include(e, "arena")) {
var a = M.genData();
this.data = a;
var n = s.role.findOneBy("imgId", a.playerPhotoInfo.photoImgId), i = n ? n.classId : 1, o = this.myArmaturenode.characterNode;
if (o && o.getComponent("characterArmatureComponent").data.classId != i) {
o.destroy();
o = null;
}
if (!o) {
(o = r.getCharacterNode(i)).parent = this.myArmaturenode;
o.getComponent("characterArmatureComponent").setTitle_(a.playerPhotoInfo.titleImgId);
this.myArmaturenode.characterNode = o;
}
this.roleItemNodeMap = this.roleItemNodeMap || {};
r.preHideNodeMap(this.roleItemNodeMap);
for (var l = 0; l < a.roleItems.length; l++) {
var c = a.roleItems[l], d = this.roleItemNodeMap[l];
if (!d) {
(d = cc.instantiate(this.roleItemNode)).parent = this.teamLayout.getChildByName("role_" + (l + 1) + "_bg_sp");
this.roleItemNodeMap[l] = d;
}
d.active = !0;
r.markHideNode(d);
d.getChildByName("role_item").getComponent("roleItem").update_(c);
}
r.hideNodeMap(this.roleItemNodeMap);
this.shipItemMap = this.shipItemMap || {};
r.preHideNodeMap(this.shipItemMap);
for (l = 0; l < a.shipItems.length; l++) {
var h = a.shipItems[l], u = this.shipItemMap[l];
if (!u) {
(u = cc.instantiate(this.shipItem)).parent = this.teamLayout.getChildByName("ship_" + (l + 1) + "_bg_sp");
this.shipItemMap[l] = u;
}
u.active = !0;
r.markHideNode(u);
u.getComponent("shipItem").update_(h);
}
r.hideNodeMap(this.shipItemMap);
this.rankLabel.string = a.rank;
this.powerLabel.string = a.totalPower;
g.replaceLabel(this.timesLabel, [ a.remainingChallengeTimes, a.maxChallengeTimes ]);
this.buyTimesBt.active = 0 == a.remainingChallengeTimes;
this.costGemLabel.node.parent.active = this.buyTimesBt.active;
this.buyTimesBt.active && (this.costGemLabel.string = a.buyTimesCostGem);
this.refreshBt.active = a.remainingChallengeTimes > 0;
a.matchPlayerInfos || this.scheduleOnce(function() {
this.onRefresh_();
}, 0);
}
},
onRefresh_: function() {
var e = this;
r.addLoading();
h.match(function(a) {
var n = [];
n.push(a._temp.smaller);
n.push(a._temp.middle);
n.push(a._temp.larger);
e.centerLayout.active = !0;
e.data.matchPlayerInfos = n;
for (var i = [ s.role.findOneBy("imgId", e.data.playerPhotoInfo.photoImgId).kindId ], o = 0; o < n.length; o++) {
var l = e.centerLayout.getChildByName("player_info_" + (o + 1) + "_layout"), c = l.getChildByName("armature_node"), d = n[o].playerPhotoInfo, h = s.role.findOneBy("imgId", d.photoImgId), u = h ? h.classId : 1;
i.push(h.kindId);
var m = c.characterNode;
if (m && m.getComponent("characterArmatureComponent").data.classId != u) {
m.destroy();
m = null;
}
if (!m) {
(m = r.getCharacterNode(u)).parent = c;
m.idx = o;
m.scaleX = -1;
m.getComponent("characterArmatureComponent").setTitle_(d.titleImgId);
c.characterNode = m;
}
c.data = {
defenderId: n[o].playerId
};
var p = l.getChildByName("rank_bg_sp");
p.getChildByName("rank_label").getComponent(cc.Label).string = n[o].rank;
p.getChildByName("power_label").getComponent(cc.Label).string = n[o].totalPower;
var k = l.getChildByName("info_bg_sp");
k.getChildByName("name_label").getComponent(cc.Label).string = n[o].playerName;
var f = k.getChildByName("level_label").getComponent(cc.Label);
g.replaceLabel(f, [ n[o].playerLevel ]);
l.getChildByName("challenge_bt").data = {
defenderId: n[o].playerId
};
}
var y = _.getPreLoadInfos(i), b = t.pluck(y, "res");
r.releaseAllCharacterRes(b);
setTimeout(function() {
cc.sys.garbageCollect();
}, 1e3);
});
},
onChallenge_: function(e) {
var a = e.target.data;
0 != this.data.remainingChallengeTimes ? T.pushScene(T.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: _.TYPE.ARENA_ATTACK_TEAM,
opts: {
type: p.BATTLE_TYPE.ARENA_PK,
defenderId: a.defenderId
}
}) : r.addHintPanel(m.t("今日挑战次数已用完"));
},
onViewBattleTeam_: S.prototype.onRankItem_,
onBuyTimes_: function() {
r.addLoading();
h.buyChallengeTimes();
},
onModified_: function() {
T.pushScene(T.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: _.TYPE.ARENA_DEFENSE_TEAM
});
},
onRule_: function() {
r.addRulePanel(v.TYPE.ARENA, {
rank: this.data.rank,
topRank: this.data.topRank
});
},
onRank_: function() {
r.addLoading();
u.arenaTop50(!1, function(e) {
r.addRankPanel(5, e._temp.myRank, e._temp.myValue, e._temp.list);
});
},
onLog_: function() {
var e = this;
r.addLoading();
h.reportList(function(a) {
var t = M.genLogData(a._temp.reportList);
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
T.pushScene(T.NAME.SHOP_SCENE, {
type: l.SHOP.CONSTS.TYPE.ARENA
});
},
onCloseLogPanel_: function() {
r.removePanel(this.logPanel);
},
onPlay_: function(e) {
var a = e.target.data;
r.addLoading();
h.report(a.reportId, function(e) {
var a = e._temp.report;
if ("prestigeBattle" == a.type) {
var i = t.sortBy(a.attackTeam.battleTeamMap, function(e) {
return -e.playerLevel;
}), s = t.sortBy(a.defenseTeam.battleTeamMap, function(e) {
return -e.playerLevel;
}), o = {};
o[a.attackTeam.teamId] = i.length;
o[a.defenseTeam.teamId] = s.length;
for (var l = a.seed, d = {}, h = 1, u = {}, m = p.PRESTIGE_BATTLE_BACKGROUND_IMG_ID, g = m[Math.floor(Math.random() * m.length)]; 0 != o[a.attackTeam.teamId] && 0 != o[a.defenseTeam.teamId]; ) {
var f = i.length - o[a.attackTeam.teamId], y = s.length - o[a.defenseTeam.teamId], b = _.buildBattleTeam(i[f].playerId, i[f].ships, i[f].roles), v = _.buildBattleTeam(s[y].playerId, s[y].ships, s[y].roles);
(L = a.winPlayerIdMap[h].teamId == a.attackTeam.teamId) ? o[a.defenseTeam.teamId]-- : o[a.attackTeam.teamId]--;
0 == o[a.defenseTeam.teamId] ? D = !0 : 0 == o[a.attackTeam.teamId] && (D = !1);
null != D && a.defenseTeam.battleTeamMap[c.player.id] && (D = !D);
d[h] = {
team1: b,
team2: v,
battleType: p.BATTLE_TYPE.PRESTIGE,
opts: {
seed: l,
times: h,
isWin: L,
isLastWin: null == D ? void 0 : D,
isPlayBack: !0,
bgImgId: g,
damageMap: a.damageMapMap[h]
}
};
var S = t.map(b.roles.concat(v.roles), function(e) {
return e.kindId;
});
u[h] = _.getPreLoadInfos(S, g);
var M = a.winPlayerIdMap[h].hpMap, $ = L ? i[f] : s[y];
for (var I in M) for (var C in $.roles) $.roles[C].kindId == I && ($.roles[C].attr.hp = M[I]);
h++;
}
var P = [];
for (var h in d) P.push(function(e) {
k.next = e;
var a = this.battleSceneData;
r.preload(this.preLoadInfos, function() {
T.pushScene(T.NAME.BATTLE_SCENE, a);
});
}.bind({
battleSceneData: d[h],
preLoadInfos: u[h],
times: h
}));
n.waterfall(P, function() {
console.log("isWin:" + D);
k.next = null;
});
} else if ("teamBattle" == a.type) {
i = t.sortBy(a.attackTeam.battleTeamMap, "idx"), s = t.sortBy(a.defenseTeam.battleTeamMap, "idx"), 
l = a.seed;
for (var D = a.isWin, N = (d = {}, h = 1, u = {}, g = p.TEAM_BATTLE_BACKGROUND_IMG_ID, 
t.keys(a.attackTeam.battleTeamMap).length); h <= N; ) {
var A = h - 1, L = (b = _.buildBattleTeam(i[A].playerId, i[A].ships, i[A].roles), 
v = _.buildBattleTeam(s[A].playerId, s[A].ships, s[A].roles), a.winPlayerIdMap[h] == a.attackTeam.teamId);
t.include(t.keys(a.attackTeam.battleTeamMap), String(c.player.id)) || (D = !D);
d[h] = {
team1: b,
team2: v,
battleType: p.BATTLE_TYPE.TEAM_BATTLE,
opts: {
seed: l,
times: h,
isWin: L,
isLastWin: h == N ? D : void 0,
isPlayBack: !0,
bgImgId: g
}
};
S = t.map(b.roles.concat(v.roles), function(e) {
return e.kindId;
});
u[h] = _.getPreLoadInfos(S, g);
h++;
}
P = [];
for (var h in d) P.push(function(e) {
k.next = e;
var a = this.battleSceneData;
r.preload(this.preLoadInfos, function() {
T.pushScene(T.NAME.BATTLE_SCENE, a);
});
}.bind({
battleSceneData: d[h],
preLoadInfos: u[h],
times: h
}));
n.waterfall(P, function() {
console.log("isWin:" + D);
k.next = null;
});
} else {
var E = a.attackTeam, B = a.defenseTeam;
b = _.buildBattleTeam(E.playerId, E.ships, E.roles), v = _.buildBattleTeam(B.playerId, B.ships, B.roles);
b.playerPhotoInfo = E.playerPhotoInfo;
b.playerLevel = E.playerLevel;
b.playerName = E.playerName;
v.playerPhotoInfo = B.playerPhotoInfo;
v.playerLevel = B.playerLevel;
v.playerName = B.playerName;
g = a.bgImgId, S = t.map(b.roles.concat(v.roles), function(e) {
return e.kindId;
});
var w = _.getPreLoadInfos(S, g), G = p.BATTLE_TYPE.ARENA_PK;
switch (a.type) {
case "islandBattle":
G = p.BATTLE_TYPE.ISLAND;
}
var R = {
team1: b,
team2: v,
battleType: G,
opts: {
seed: a.seed,
isPlayBack: !0,
bgImgId: g,
damageMap: a.damageMap,
isWin: a.isWin
}
};
r.preload(w, function() {
T.pushScene(T.NAME.BATTLE_SCENE, R);
});
}
});
}
});
M.genData = function() {
var e = c.player, a = e.arena, n = e.team, i = e.bag, r = [], s = 0;
for (var o in a.defenseTeamIndexs) {
var d = n.getRoleByIdx(a.defenseTeamIndexs[o]);
r.push(f.genData(d));
s += d.power;
}
r = t.sortBy(r, function(e) {
return -e._data.positionPriority;
});
for (var o in a.defenseShipIndexs) {
console.log(a.defenseShipIndexs[o]);
s += i.getItemByIdx(a.defenseShipIndexs[o]).power;
}
var h = _.TYPE.ARENA_DEFENSE_TEAM + "_selectIdxs_" + e.id;
storage.setItem(h, a.defenseTeamIndexs);
var u = [];
for (var o in a.defenseShipIndexs) {
var m = i.getItemByIdx(a.defenseShipIndexs[o]);
u.push(y.genData(m));
}
u = t.sortBy(u, function(e) {
return e._data.classId;
});
h = _.TYPE.ARENA_DEFENSE_TEAM + "_selectShipIdxs_" + e.id;
storage.setItem(h, a.defenseShipIndexs);
var g = l.ARENA.FUNS.getBuyChallengeTimesCost(e.vip.buyChallengeTimesTimes + 1);
return {
playerPhotoInfo: e.photoInfo,
rank: a.rank,
topRank: a.topRank,
remainingChallengeTimes: a.remainingChallengeTimes,
maxChallengeTimes: a.maxChallengeTimes,
buyTimesCostGem: g,
roleItems: r,
shipItems: u,
totalPower: s,
_arena: a
};
};
M.genLogData = function(e) {
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
arenaHandler: "arenaHandler",
async: "async",
baseView: "baseView",
"battle.consts": "battle.consts",
battleScene: "battleScene",
buildExt: "buildExt",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
http: "http",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerItem: "playerItem",
rankHandler: "rankHandler",
rankPanel: "rankPanel",
resource: "resource",
roleItem: "roleItem",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipItem: "shipItem",
soundApi: "soundApi",
underscore: "underscore"
} ],
