teamBattleScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "7ce71K8IzBJk6TELBvxSd9I", "teamBattleScene");
var t = e("underscore"), n = e("util"), i = e("async"), r = e("baseView"), s = e("helper"), o = e("i18n"), l = e("guide"), c = e("buildExt"), d = e("serverMain"), h = e("serverConfig"), u = e("teamBattleHandler"), m = e("soundApi"), g = e("resource"), p = e("sceneManager"), _ = e("rulePanel"), k = e("shipItem"), f = e("roleItem"), y = e("rankPanel"), b = e("selectBattleRolesScene"), v = h.TEAM_BATTLE.CONSTS, S = h.TEAM_BATTLE.FUNS, T = cc.Class({
extends: cc.Component,
properties: {
defenseTimesLabel: cc.Label,
attackTimesLabel: cc.Label,
practiceTeamItemsLayout: cc.Node,
practiceTeamItem: cc.Node,
playerInfoItem: cc.Node,
shopBt: cc.Node,
rankBt: cc.Node,
createPanel: cc.Node,
createMemberItemsLayout: cc.Node,
createMemberItem: cc.Node,
createShipItem: cc.Node,
createRoleItem: cc.Node,
joinPanel: cc.Node,
joinTeamItemsLayout: cc.Node,
joinTeamItem: cc.Node,
joinShipItem: cc.Node,
joinRoleItem: cc.Node,
viewTeamPanel: cc.Node,
viewTeamTitleLabel: cc.Label,
viewTeamMemberLayout: cc.Node,
viewTeamShipItem: cc.Node,
viewTeamRoleItem: cc.Node,
viewTeamHintLabel: cc.Label,
viewTeamChallengeBt: cc.Node,
rankPanel: cc.Node,
rankItem: cc.Node,
rankItemsLayout: cc.Node,
myRankColor: cc.Color,
rankPanelBottomBgSp: cc.Node,
openTimesLabel: cc.Node,
createBt: cc.Node,
joinBt: cc.Node,
refreshBt: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
T.instance || (T.instance = this);
p.curSceneStatusData = t.extend({}, p.curSceneStatusData);
this.statusData = p.curSceneStatusData;
this.practiceTeamItem.active = !1;
this.playerInfoItem.active = !1;
this.createPanel.active = !1;
this.createMemberItem.active = !1;
this.createShipItem.active = !1;
this.createRoleItem.active = !1;
this.joinPanel.active = !1;
this.joinTeamItem.active = !1;
this.joinShipItem.active = !1;
this.joinRoleItem.active = !1;
this.viewTeamPanel.active = !1;
this.viewTeamShipItem.active = !1;
this.viewTeamRoleItem.active = !1;
this.rankPanel.active = !1;
this.rankItem.active = !1;
this.rankBt.active = !c.isHideRankBt;
this.attackTimesLabel.node.parent.active = !1;
this.update_();
d.player.extra.teamBattle.createTeamInfo && this.scheduleOnce(function() {
this.onCreate_();
}, 0);
l.callNext("teamBattleIntroduce", "guideNext1");
m.playMusic(g.sound_music_team_battle_mp3);
},
onDestroy: function() {
T.instance = null;
d.player.extra.teamBattle.readyTeamInfos = null;
},
update_: function() {
var e = T.genData();
this.data = e;
this.defenseTimesLabel.string = e.remainingPracticeTimes;
var a = d.player.extra.teamBattle.myTeamInfos, n = a && a.length > 0;
this.attackTimesLabel.node.parent.active = n;
n && (this.attackTimesLabel.string = v.ATTACK_TIMES - a[0].attackTimes);
this.openTimesLabel.active = !e.isOpen;
e.isReady ? this.openTimesLabel.getComponent(cc.Label).string = o.t("18点开战，请在开战前组好队伍") : this.openTimesLabel.getComponent(cc.Label).string = o.t("每天$1点-$2点开启", [ e.startHour, e.endHour ]);
this.createBt.active = this.joinBt.active = e.isReady;
this.refreshBt.active = e.isOpen && n && d.player.id == a[0].leaderId;
e.isOpen && !e.teamInfos && this.scheduleOnce(function() {
this.onMatch_();
}, 0);
this.practiceTeamItemMap = this.practiceTeamItemMap || {};
r.preHideNodeMap(this.practiceTeamItemMap);
for (var i in e.teamInfos) {
var l = this.practiceTeamItemMap[i];
if (!l) {
(l = cc.instantiate(this.practiceTeamItem)).parent = this.practiceTeamItemsLayout;
l.idx = i;
this.practiceTeamItemMap[i] = l;
}
l.active = !0;
r.markHideNode(l);
var c = e.teamInfos[i];
l.data = {
teamInfo: c
};
l.getChildByName("me_sp").active = !!t.findWhere(c.battleTeamMap, {
playerId: d.player.id
});
var h = l.getChildByName("team_info_node"), u = h.getChildByName("top_node"), m = u.getChildByName("server_label").getComponent(cc.Label);
s.replaceLabel(m, [ c.serverId ]);
u.getComponent(cc.Layout).updateLayout();
var g = h.getChildByName("info_bg_sp");
l.playerInfoItemMap = l.playerInfoItemMap || {};
r.preHideNodeMap(l.playerInfoItemMap);
var p = t.values(c.battleTeamMap);
p = t.sortBy(p, "idx");
for (var _ in p) {
var k = l.playerInfoItemMap[_];
if (!k) {
(k = cc.instantiate(this.playerInfoItem)).parent = g;
k.idx = _;
l.playerInfoItemMap[_] = k;
}
k.active = !0;
r.markHideNode(k);
var f = p[_];
k.getChildByName("name_label").getComponent(cc.Label).string = f.playerName;
k.getChildByName("level_label").getComponent(cc.Label).string = o.t("LV.$1", [ f.playerLevel ]);
k.getComponent(cc.Layout).updateLayout();
}
r.hideNodeMap(l.playerInfoItemMap);
g.getComponent(cc.Layout).updateLayout();
}
r.hideNodeMap(this.practiceTeamItemMap);
},
onRule_: function() {
r.addRulePanel(_.TYPE.TEAM_BATTLE);
},
onShop_: function() {
p.pushScene(p.NAME.SHOP_SCENE, {
type: h.SHOP.CONSTS.TYPE.SHIP
});
},
onRank_: function() {
var e = this;
r.addLoading();
u.rank(function(a) {
r.addPanel(e.rankPanel, !0);
var t = a._temp.myValue ? a._temp.myValue.split(".")[0] : 0;
e.updateRankPanel_(a._temp.list, a._temp.myRank, t);
});
},
onRankViewTeam_: y.prototype.onRankItem_,
updateRankPanel_: function(e, a, t) {
this.rankItemMap = this.rankItemMap || {};
r.preHideNodeMap(this.rankItemMap);
for (var n in e) {
var i = e[n], s = this.rankItemMap[n];
if (!s) {
(s = cc.instantiate(this.rankItem)).parent = this.rankItemsLayout;
this.rankItemMap[n] = s;
}
s.active = !0;
r.markHideNode(s);
s.data = {
defenderId: i.playerId
};
(l = s.getChildByName("rank_label")).getComponent(cc.Label).string = i.rank;
(c = s.getChildByName("server_label")).getComponent(cc.Label).string = i.serverId;
(h = s.getChildByName("level_label")).getComponent(cc.Label).string = o.t("LV.$1", [ i.playerLevel ]);
(u = s.getChildByName("name_label")).getComponent(cc.Label).string = i.playerName;
(m = s.getChildByName("value_label")).getComponent(cc.Label).string = i.value.split(".")[0];
s.getChildByName("power_label").getComponent(cc.Label).string = i.power;
l._color = l._color || l.color;
c._color = c._color || c.color;
h._color = h._color || h.color;
u._color = u._color || u.color;
m._color = m._color || m.color;
if (e[n].playerId == d.player.id) l.color = c.color = h.color = u.color = m.color = this.myRankColor; else {
l.color = l._color;
c.color = c._color;
h.color = h._color;
u.color = u._color;
m.color = m._color;
}
}
r.hideNodeMap(this.rankItemMap);
var l, c, h, u, m;
(l = this.rankPanelBottomBgSp.getChildByName("rank_label")).getComponent(cc.Label).string = a || o.t("未上榜");
(c = this.rankPanelBottomBgSp.getChildByName("server_label")).getComponent(cc.Label).string = d.player.serverId;
(h = this.rankPanelBottomBgSp.getChildByName("level_label")).getComponent(cc.Label).string = o.t("LV.$1", [ d.player.level ]);
(u = this.rankPanelBottomBgSp.getChildByName("name_label")).getComponent(cc.Label).string = d.player.name;
(m = this.rankPanelBottomBgSp.getChildByName("value_label")).getComponent(cc.Label).string = t || 0;
},
onMatch_: function() {
r.addLoading();
var e = this;
u.match(function(a) {
var t = a._temp.teamInfos, n = [];
for (var i in t) t[i].leaderId == d.player.id && n.push(t[i]);
d.player.extra.teamBattle.myTeamInfos = n;
d.player.extra.teamBattle.teamInfos = t;
e.update_();
});
},
onRefresh_: function() {
var e = d.player.extra.teamBattle.refreshTimes, a = S.getRefreshCost(e + 1), t = o.t("是否花费$1钻石进行刷新?(今日已刷新$2次)", [ a, e ]), n = this;
r.addMessageBox(t, function() {
r.addLoading();
u.refresh(function(e) {
var a = e._temp.teamInfos, t = [];
for (var i in a) a[i].leaderId == d.player.id && t.push(a[i]);
d.player.extra.teamBattle.myTeamInfos = t;
d.player.extra.teamBattle.teamInfos = a;
d.player.extra.teamBattle.refreshTimes++;
n.update_();
});
});
},
onPracticeTeamItem_: function(e) {
var a = e.target.data.teamInfo;
r.addPanel(this.viewTeamPanel, !0);
for (var n = T.genViewTeamData(a), i = t.sortBy(a.battleTeamMap, function(e) {
return e.playerId == a.leaderId ? -1 : 0;
}), l = 0; l < 3; l++) {
var c = i[l], h = this.viewTeamMemberLayout.getChildByName("member_item_" + (l + 1));
h.active = !!c;
if (h.active) {
h.getChildByName("player_name_label").getComponent(cc.Label).string = c.playerName;
h.getChildByName("player_level_label").getComponent(cc.Label).string = o.t("LV.$1", [ c.playerLevel ]);
var u = h.getChildByName("server_label").getComponent(cc.Label);
s.replaceLabel(u, [ c.serverId ]);
h.roleItemMap = h.roleItemMap || {};
r.preHideNodeMap(h.roleItemMap);
h.shipItemMap = h.shipItemMap || {};
r.preHideNodeMap(h.shipItemMap);
for (var m = 0; m < c.ships.length; m++) {
var g = k.genData(c.ships[m]), p = h.shipItemMap[m];
if (!p) {
(p = cc.instantiate(this.viewTeamShipItem)).parent = h.getChildByName("ship_" + (m + 1) + "_bg_sp");
h.shipItemMap[m] = p;
}
p.active = !0;
r.markHideNode(p);
p.getComponent("shipItem").update_(g);
}
for (m = 0; m < c.roles.length; m++) {
var _ = f.genData(c.roles[m]), y = h.roleItemMap[m];
if (!y) {
(y = cc.instantiate(this.viewTeamRoleItem)).parent = h.getChildByName("role_" + (m + 1) + "_bg_sp");
h.roleItemMap[m] = y;
}
y.active = !0;
r.markHideNode(y);
y.getComponent("roleItem").update_(_);
}
r.hideNodeMap(h.roleItemMap);
r.hideNodeMap(h.shipItemMap);
}
}
this.viewTeamChallengeBt.active = n.isHaveTeam && a.leaderId != d.player.id && this.data.isOpen;
this.viewTeamChallengeBt.data = {
defenderTeamId: a.teamId
};
this.viewTeamTitleLabel.string = n.isMyTeam ? o.t("我的队伍") : o.t("挑战");
this.viewTeamHintLabel.node.active = !this.viewTeamChallengeBt.active || this.data.isReady;
},
onViewTeamChallenge_: function(a) {
var s = e("battle.consts"), l = e("battleMain"), c = (e("battle.fightHandler"), 
e("battleScene")), h = a.target.data, m = d.player.extra.teamBattle.myTeamInfos[0];
if (m.attackTimes != v.ATTACK_TIMES) {
var g = m.teamId;
r.addLoading();
u.choose(g, h.defenderTeamId, function(e) {
for (var a, o, d = e._temp.attackTeamInfo, h = e._temp.defenseTeamInfo, g = t.sortBy(d.battleTeamMap, "idx"), _ = t.sortBy(h.battleTeamMap, "idx"), k = {}, f = 0, y = {}, v = {}, S = 1, T = g.length, M = {}; S <= T; ) {
var $ = S - 1, I = b.buildBattleTeam(g[$].playerId, g[$].ships, g[$].roles), C = b.buildBattleTeam(_[$].playerId, _[$].ships, _[$].roles), P = l.pkBattleInstant(n.clone(I), n.clone(C), a || null), D = s.TEAM_BATTLE_BACKGROUND_IMG_ID;
a = a || P.seed;
if (P.isWin) {
k[S] = d.teamId;
f++;
} else k[S] = h.teamId;
S == T && (o = f >= 2);
var N = t.map(I.roles.concat(C.roles), function(e) {
return e.kindId;
});
M[S] = b.getPreLoadInfos(N, D);
v[S] = n.clone(l.damageMap);
y[S] = {
team1: I,
team2: C,
battleType: s.BATTLE_TYPE.TEAM_BATTLE,
opts: {
seed: a,
bgImgId: D,
times: S,
isWin: P.isWin,
damageMap: v[S],
isLastWin: null == o ? void 0 : o
}
};
S++;
}
r.addLoading();
u.challenge(d.teamId, h.teamId, o, k, v, a, function() {
m.attackTimes++;
var e = [];
for (var a in y) e.push(function(e) {
c.next = e;
var a = this.battleSceneData;
r.preload(this.preLoadInfos, function() {
p.pushScene(p.NAME.BATTLE_SCENE, a);
});
}.bind({
battleSceneData: y[a],
preLoadInfos: M[a]
}));
i.waterfall(e, function() {
console.log("isWin:" + o);
c.next = null;
});
});
});
r.removePanel(this.viewTeamPanel);
} else r.addHintPanel(o.t("次数已用完"));
},
onViewTeamClose_: function() {
r.removePanel(this.viewTeamPanel);
},
onCreate_: function() {
var e = d.player.extra.teamBattle;
e.createTeamInfo ? this.showCreatePanel_(e.createTeamInfo) : v.PRACTICE_TIMES == e.practiceTimes ? r.addHintPanel(o.t("参战次数已用完")) : p.pushScene(p.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: b.TYPE.TEAM_BATTLE_DEFENSE_TEAM,
opts: {
type: "create"
}
});
},
showCreatePanel_: function(e, a) {
this.createPanel.isFromJoin = a || !1;
r.addPanel(this.createPanel);
this.createPanel.memberItemMap = this.createPanel.memberItemMap || {};
r.preHideNodeMap(this.createPanel.memberItemMap);
var n = e.leaderId == d.player.id, i = t.sortBy(e.battleTeamMap, function(a) {
return a.playerId == e.leaderId ? -1 : 0;
});
for (var l in i) {
var c = this.createPanel.memberItemMap[l];
if (!c) {
(c = cc.instantiate(this.createMemberItem)).parent = this.createMemberItemsLayout;
c.idx = l;
this.createPanel.memberItemMap[l] = c;
}
c.active = !0;
r.markHideNode(c);
var h = i[l];
c.getChildByName("player_name_label").getComponent(cc.Label).string = h.playerName;
c.getChildByName("player_level_label").getComponent(cc.Label).string = o.t("LV.$1", [ h.playerLevel ]);
var u = c.getChildByName("server_label").getComponent(cc.Label);
s.replaceLabel(u, [ h.serverId ]);
var m = e.leaderId == h.playerId;
c.getChildByName("captain_sp").active = m;
c.getChildByName("member_sp").active = !m;
var g = c.getChildByName("count_label");
g.active = m;
s.replaceLabel(g.getComponent(cc.Label), [ i.length, v.TEAM_MEMBER_COUNT ]);
var p = c.getChildByName("start_bt");
p.active = n && m;
p.data = {
teamId: e.teamId
};
var _ = c.getChildByName("auto_start_bt");
_.active = n && m && i.length < v.TEAM_MEMBER_COUNT;
_.data = {
teamInfo: e
};
var y = _.getChildByName("Label").getComponent(cc.Label);
_.label = y;
y.string = e.isAutoPractice ? o.t("取消自动") : o.t("自动参战");
var b = c.getChildByName("dissolve_bt");
b.active = n && m;
b.data = {
teamId: e.teamId
};
var S = c.getChildByName("remove_bt");
S.data = {
teamInfo: e,
playerId: h.playerId
};
S.getChildByName("Label").getComponent(cc.Label).string = d.player.id == h.playerId ? o.t("退出") : o.t("移除");
S.active = n && !m || !n && d.player.id == h.playerId;
c.roleItemMap = c.roleItemMap || {};
r.preHideNodeMap(c.roleItemMap);
c.shipItemMap = c.shipItemMap || {};
r.preHideNodeMap(c.shipItemMap);
for (var T = 0; T < h.ships.length; T++) {
var M = k.genData(h.ships[T]), $ = c.shipItemMap[T];
if (!$) {
($ = cc.instantiate(this.createShipItem)).parent = c.getChildByName("ship_" + (T + 1) + "_bg_sp");
c.shipItemMap[T] = $;
}
$.active = !0;
r.markHideNode($);
$.getComponent("shipItem").update_(M);
}
for (T = 0; T < h.roles.length; T++) {
var I = f.genData(h.roles[T]), C = c.roleItemMap[T];
if (!C) {
(C = cc.instantiate(this.createRoleItem)).parent = c.getChildByName("role_" + (T + 1) + "_bg_sp");
c.roleItemMap[T] = C;
}
C.active = !0;
r.markHideNode(C);
C.getComponent("roleItem").update_(I);
}
r.hideNodeMap(c.roleItemMap);
r.hideNodeMap(c.shipItemMap);
}
r.hideNodeMap(this.createPanel.memberItemMap);
},
onCreateClose_: function() {
this.createPanel.isFromJoin && this.onJoin_();
r.removePanel(this.createPanel);
},
onCreateStart_: function(e) {
var a = e.target.data;
if (t.keys(d.player.extra.teamBattle.createTeamInfo.battleTeamMap).length < v.TEAM_MEMBER_COUNT) r.addHintPanel(o.t("必须满员才能参战")); else {
r.addLoading();
var n = this;
u.practice(a.teamId, function() {
r.removePanel(n.createPanel);
d.player.extra.teamBattle.createTeamInfo = null;
n.update_();
});
}
},
onCreateAutoStart_: function(e) {
var a = e.target, t = a.data.teamInfo;
r.addLoading();
u.setAutoPractice(t.teamId, !t.isAutoPractice, function() {
t.isAutoPractice = !t.isAutoPractice;
a.label.string = t.isAutoPractice ? o.t("取消自动") : o.t("自动参战");
});
},
onCreateRemove_: function(e) {
var a = e.target.data, n = a.teamInfo;
r.addLoading();
var i = this;
u.removeTeamMember(n.teamId, a.playerId, function() {
if (a.playerId == d.player.id) {
var e = d.player.extra.teamBattle;
e.defenseTeamIndexs = t.difference(e.defenseTeamIndexs, n.battleTeamMap[d.player.id].teamIndexs);
e.defenseShipIndexs = t.difference(e.defenseShipIndexs, n.battleTeamMap[d.player.id].shipIndexs);
e.practiceTimes--;
i.data.remainingPracticeTimes = v.PRACTICE_TIMES - e.practiceTimes;
s.replaceLabel(i.defenseTimesLabel, [ i.data.remainingPracticeTimes ]);
r.removePanel(i.createPanel);
} else {
var o = d.player.extra.teamBattle.createTeamInfo;
delete o.battleTeamMap[a.playerId];
i.showCreatePanel_(o);
}
i.joinPanel.isPanel && i.onJoin_();
});
},
onCreateDissolve_: function(e) {
var a = e.target.data;
r.addLoading();
var n = this;
u.dissolveTeam(a.teamId, function() {
r.removePanel(n.createPanel);
r.removePanel(n.joinPanel);
var e = d.player.extra.teamBattle;
e.defenseTeamIndexs = t.difference(e.defenseTeamIndexs, e.createTeamInfo.battleTeamMap[d.player.id].teamIndexs);
e.defenseShipIndexs = t.difference(e.defenseShipIndexs, e.createTeamInfo.battleTeamMap[d.player.id].shipIndexs);
e.practiceTimes--;
n.data.remainingPracticeTimes = v.PRACTICE_TIMES - e.practiceTimes;
n.defenseTimesLabel.string = n.data.remainingPracticeTimes;
e.createTeamInfo = null;
});
},
onJoin_: function() {
r.addLoading();
var e = this;
u.getReadyTeamInfos(function(a) {
d.player.extra.teamBattle.defenseTeamIndexs = a._temp.defenseTeamIndexs;
d.player.extra.teamBattle.defenseShipIndexs = a._temp.defenseShipIndexs;
d.player.extra.teamBattle.readyTeamInfos = a._temp.teamInfos;
e.showJoinPanel_(a._temp.teamInfos);
});
},
showJoinPanel_: function(e) {
r.addPanel(this.joinPanel);
this.joinPanel.teamItemMap = this.joinPanel.teamItemMap || {};
r.preHideNodeMap(this.joinPanel.teamItemMap);
for (var a in e) {
var n = this.joinPanel.teamItemMap[a];
if (!n) {
(n = cc.instantiate(this.joinTeamItem)).parent = this.joinTeamItemsLayout;
n.idx = a;
this.joinPanel.teamItemMap[a] = n;
}
var i = t.findWhere(e[a].battleTeamMap, {
playerId: e[a].leaderId
});
n.active = !0;
r.markHideNode(n);
n.getChildByName("player_name_label").getComponent(cc.Label).string = i.playerName;
n.getChildByName("player_level_label").getComponent(cc.Label).string = o.t("LV.$1", [ i.playerLevel ]);
var l = n.getChildByName("server_label").getComponent(cc.Label);
s.replaceLabel(l, [ i.serverId ]);
var c = n.getChildByName("count_label"), h = t.keys(e[a].battleTeamMap).length;
s.replaceLabel(c.getComponent(cc.Label), [ h, v.TEAM_MEMBER_COUNT ]);
var u = n.getChildByName("join_bt");
u.active = !e[a].battleTeamMap[d.player.id] && h < v.TEAM_MEMBER_COUNT;
u.data = {
teamId: e[a].teamId
};
var m = n.getChildByName("view_bt");
m.active = !u.active;
m.data = {
teamInfo: e[a]
};
n.roleItemMap = n.roleItemMap || {};
r.preHideNodeMap(n.roleItemMap);
n.shipItemMap = n.shipItemMap || {};
r.preHideNodeMap(n.shipItemMap);
for (var g = 0; g < i.ships.length; g++) {
var p = k.genData(i.ships[g]), _ = n.shipItemMap[g];
if (!_) {
(_ = cc.instantiate(this.createShipItem)).parent = n.getChildByName("ship_" + (g + 1) + "_bg_sp");
n.shipItemMap[g] = _;
}
_.active = !0;
r.markHideNode(_);
_.getComponent("shipItem").update_(p);
}
for (g = 0; g < i.roles.length; g++) {
var y = f.genData(i.roles[g]), b = n.roleItemMap[g];
if (!b) {
(b = cc.instantiate(this.createRoleItem)).parent = n.getChildByName("role_" + (g + 1) + "_bg_sp");
n.roleItemMap[g] = b;
}
b.active = !0;
r.markHideNode(b);
b.getComponent("roleItem").update_(y);
}
r.hideNodeMap(n.roleItemMap);
r.hideNodeMap(n.shipItemMap);
}
r.hideNodeMap(this.joinPanel.teamItemMap);
},
onJoinClose_: function() {
r.removePanel(this.joinPanel);
},
onJoinView_: function(e) {
var a = e.target.data;
this.showCreatePanel_(a.teamInfo, !0);
},
onJoinJoin_: function(e) {
var a = e.target.data;
v.PRACTICE_TIMES != d.player.extra.teamBattle.practiceTimes ? p.pushScene(p.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: b.TYPE.TEAM_BATTLE_DEFENSE_TEAM,
opts: {
teamId: a.teamId,
type: "join"
}
}) : r.addHintPanel(o.t("参战次数已用完，不能加入队伍"));
}
});
T.genData = function() {
var e = d.player.extra.teamBattle, a = e.teamInfos, n = v.PRACTICE_TIMES - e.practiceTimes, i = t.range(1, 11);
for (var r in a) {
a[r].location = t.sample(i);
i = t.without(i, a[r].location);
}
a && (a = t.sortBy(a, "location"));
return {
startHour: v.READY_HOURS,
endHour: v.END_HOURS,
remainingPracticeTimes: n,
teamInfos: a,
isOpen: e.openInfo.isOpen,
isReady: e.openInfo.isReady
};
};
T.genViewTeamData = function(e) {
var a = d.player.extra.teamBattle.myTeamInfos;
return {
teamInfo: e,
isHaveTeam: a.length > 0,
isMyTeam: t.include(a, e)
};
};
cc._RF.pop();
}, {
async: "async",
baseView: "baseView",
"battle.consts": "battle.consts",
"battle.fightHandler": "battle.fightHandler",
battleMain: "battleMain",
battleScene: "battleScene",
buildExt: "buildExt",
guide: "guide",
helper: "helper",
i18n: "i18n",
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
teamBattleHandler: "teamBattleHandler",
underscore: "underscore",
util: "util"
} ],
