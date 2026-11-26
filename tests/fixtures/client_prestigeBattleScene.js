prestigeBattleScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "74b3fz4XvlG3ayrAoSs46Kl", "prestigeBattleScene");
var t = e("underscore"), n = e("util"), i = e("async"), r = e("baseView"), s = e("helper"), o = e("i18n"), l = (e("guide"), 
e("buildExt")), c = e("serverMain"), d = e("serverConfig"), h = e("prestigeBattleHandler"), u = e("soundApi"), m = e("resource"), g = e("sceneManager"), p = e("rulePanel"), _ = e("shipItem"), k = e("roleItem"), f = e("rankPanel"), y = e("selectBattleRolesScene"), b = d.PRESTIGE_BATTLE.CONSTS, v = cc.Class({
extends: cc.Component,
properties: {
scrollNode: cc.Node,
defenseTimesLabel: cc.Label,
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
viewTeamMemberLayout: cc.Node,
viewTeamShipItem: cc.Node,
viewTeamRoleItem: cc.Node,
viewTeamGuildLabel: cc.Label,
viewTeamBeAttackTimesLabel: cc.Label,
viewTeamRewardLabel: cc.Label,
viewTeamHintLabel: cc.Label,
viewTeamChallengeBt: cc.Node,
selectAttackTeamPanel: cc.Node,
selectAttackTeamItemsLayout: cc.Node,
selectAttackTeamItem: cc.Node,
selectAttackTeamPlayerInfoItem: cc.Node,
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
v.instance || (v.instance = this);
g.curSceneStatusData = t.extend({}, g.curSceneStatusData);
this.statusData = g.curSceneStatusData;
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
this.selectAttackTeamItem.active = !1;
this.selectAttackTeamPlayerInfoItem.active = !1;
this.selectAttackTeamPanel.active = !1;
this.rankPanel.active = !1;
this.rankItem.active = !1;
this.rankBt.active = !l.isHideRankBt;
this.shopBt.active = !!d.SHOP.CONSTS.TYPE.ARTIFACT;
this.update_();
c.player.extra.prestigeBattle.createTeamInfo && this.scheduleOnce(function() {
this.onCreate_();
}, 0);
this.scheduleOnce(function() {
s.autoScroll(this.scrollNode, 40);
}, 0);
this.scheduleOnce(function() {
u.playEffect(m.sound_effect_bgm_prestige_battle_mp3);
}, .1);
},
onDestroy: function() {
v.instance = null;
},
update_: function() {
var e = v.genData();
this.data = e;
this.defenseTimesLabel.string = e.remainingPracticeTimes;
this.openTimesLabel.active = !e.isOpen;
this.openTimesLabel.getComponent(cc.Label).string = o.t("每天$1点-$2点开启", [ e.startHour, e.endHour ]);
this.createBt.active = this.joinBt.active = e.isReady;
this.refreshBt.active = e.isOpen;
e.isOpen && !e.teamInfos && this.scheduleOnce(function() {
this.onRefresh_();
}, 0);
this.practiceTeamItemMap = this.practiceTeamItemMap || {};
r.preHideNodeMap(this.practiceTeamItemMap);
for (var a in e.teamInfos) {
var n = this.practiceTeamItemMap[a];
if (!n) {
(n = cc.instantiate(this.practiceTeamItem)).parent = this.practiceTeamItemsLayout;
n.idx = a;
this.practiceTeamItemMap[a] = n;
}
n.active = !0;
r.markHideNode(n);
var i = e.teamInfos[a];
n.data = {
teamInfo: i
};
n.getChildByName("me_sp").active = !!t.findWhere(i.battleTeamMap, {
playerId: c.player.id
});
var l = n.getChildByName("team_info_node"), d = l.getChildByName("top_node"), h = d.getChildByName("server_label").getComponent(cc.Label);
s.replaceLabel(h, [ i.serverId ]);
d.getChildByName("guild_label").getComponent(cc.Label).string = i.guildName;
d.getComponent(cc.Layout).updateLayout();
var u = l.getChildByName("info_bg_sp");
n.playerInfoItemMap = n.playerInfoItemMap || {};
r.preHideNodeMap(n.playerInfoItemMap);
var m = 0;
for (var g in i.battleTeamMap) {
var p = n.playerInfoItemMap[m];
if (!p) {
(p = cc.instantiate(this.playerInfoItem)).parent = u;
p.idx = m;
n.playerInfoItemMap[m] = p;
}
p.active = !0;
r.markHideNode(p);
var _ = i.battleTeamMap[g];
p.getChildByName("name_label").getComponent(cc.Label).string = _.playerName;
p.getChildByName("level_label").getComponent(cc.Label).string = o.t("LV.$1", [ _.playerLevel ]);
p.getComponent(cc.Layout).updateLayout();
m++;
}
r.hideNodeMap(n.playerInfoItemMap);
u.getComponent(cc.Layout).updateLayout();
}
r.hideNodeMap(this.practiceTeamItemMap);
},
onRule_: function() {
r.addRulePanel(p.TYPE.PRESTIGE_BATTLE);
},
onShop_: function() {
g.pushScene(g.NAME.SHOP_SCENE, {
type: d.SHOP.CONSTS.TYPE.ARTIFACT
});
},
onRank_: function() {
var e = this;
r.addLoading();
h.rank(function(a) {
r.addPanel(e.rankPanel, !0);
e.updateRankPanel_(a._temp.list, a._temp.myRank, a._temp.myValue);
});
},
onRankViewTeam_: f.prototype.onRankItem_,
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
(d = s.getChildByName("server_label")).getComponent(cc.Label).string = i.serverId;
(h = s.getChildByName("level_label")).getComponent(cc.Label).string = o.t("LV.$1", [ i.playerLevel ]);
(u = s.getChildByName("name_label")).getComponent(cc.Label).string = i.playerName;
(m = s.getChildByName("value_label")).getComponent(cc.Label).string = i.value;
l._color = l._color || l.color;
d._color = d._color || d.color;
h._color = h._color || h.color;
u._color = u._color || u.color;
m._color = m._color || m.color;
if (e[n].playerId == c.player.id) l.color = d.color = h.color = u.color = m.color = this.myRankColor; else {
l.color = l._color;
d.color = d._color;
h.color = h._color;
u.color = u._color;
m.color = m._color;
}
}
r.hideNodeMap(this.rankItemMap);
var l, d, h, u, m;
(l = this.rankPanelBottomBgSp.getChildByName("rank_label")).getComponent(cc.Label).string = a || o.t("未上榜");
(d = this.rankPanelBottomBgSp.getChildByName("server_label")).getComponent(cc.Label).string = c.player.serverId;
(h = this.rankPanelBottomBgSp.getChildByName("level_label")).getComponent(cc.Label).string = o.t("LV.$1", [ c.player.level ]);
(u = this.rankPanelBottomBgSp.getChildByName("name_label")).getComponent(cc.Label).string = c.player.name;
(m = this.rankPanelBottomBgSp.getChildByName("value_label")).getComponent(cc.Label).string = t;
},
onRefresh_: function() {
r.addLoading();
var e = this;
h.match(function(a) {
var t = a._temp.teamInfos, n = [];
for (var i in t) t[i].leaderId == c.player.id && n.push(t[i]);
c.player.extra.prestigeBattle.myTeamInfos = n;
c.player.extra.prestigeBattle.teamInfos = t;
e.update_();
});
},
onPracticeTeamItem_: function(e) {
var a = e.target.data.teamInfo;
r.addPanel(this.viewTeamPanel, !0);
for (var n = v.genViewTeamData(a), i = t.sortBy(a.battleTeamMap, function(e) {
return e.playerId == a.leaderId ? -1 : 0;
}), l = 0; l < 3; l++) {
var c = i[l], d = this.viewTeamMemberLayout.getChildByName("member_item_" + (l + 1));
d.active = !!c;
if (d.active) {
d.getChildByName("player_name_label").getComponent(cc.Label).string = c.playerName;
d.getChildByName("player_level_label").getComponent(cc.Label).string = o.t("LV.$1", [ c.playerLevel ]);
d.roleItemMap = d.roleItemMap || {};
r.preHideNodeMap(d.roleItemMap);
d.shipItemMap = d.shipItemMap || {};
r.preHideNodeMap(d.shipItemMap);
for (var h = 0; h < c.ships.length; h++) {
var u = _.genData(c.ships[h]), m = d.shipItemMap[h];
if (!m) {
(m = cc.instantiate(this.viewTeamShipItem)).parent = d.getChildByName("ship_" + (h + 1) + "_bg_sp");
d.shipItemMap[h] = m;
}
m.active = !0;
r.markHideNode(m);
m.getComponent("shipItem").update_(u);
}
for (h = 0; h < c.roles.length; h++) {
var g = k.genData(c.roles[h]), p = d.roleItemMap[h];
if (!p) {
(p = cc.instantiate(this.viewTeamRoleItem)).parent = d.getChildByName("role_" + (h + 1) + "_bg_sp");
d.roleItemMap[h] = p;
}
p.active = !0;
r.markHideNode(p);
p.getComponent("roleItem").update_(g);
}
r.hideNodeMap(d.roleItemMap);
r.hideNodeMap(d.shipItemMap);
}
}
this.viewTeamGuildLabel.string = a.guildName;
s.replaceLabel(this.viewTeamBeAttackTimesLabel, [ a.beAttackTimes, b.BE_ATTACK_TIMES ]);
s.replaceLabel(this.viewTeamRewardLabel, [ n.minRewardCount, n.maxRewardCount ]);
(n.minRewardCount = n.maxRewardCount) && (this.viewTeamRewardLabel.string = n.minRewardCount);
this.viewTeamRewardLabel.node.parent.active = n.isHaveTeam && !n.isSameGuild;
this.viewTeamHintLabel.node.active = !this.viewTeamRewardLabel.node.parent.active;
n.isHaveTeam ? n.isSameGuild && (this.viewTeamHintLabel.string = o.t("不能扰乱同家族")) : this.viewTeamHintLabel.string = o.t("只有队长才能操作扰乱");
this.viewTeamChallengeBt.active = n.isHaveTeam && !n.isSameGuild;
this.viewTeamChallengeBt.data = {
teamInfo: a
};
},
onViewTeamChallenge_: function(e) {
var a = e.target.data.teamInfo;
if (a.beAttackTimes != b.BE_ATTACK_TIMES) {
r.removePanel(this.viewTeamPanel);
this.showSelectAttackTeamPanel_(a);
} else r.addHintPanel(o.t("被挑战的次数达到了上限"));
},
onViewTeamClose_: function() {
r.removePanel(this.viewTeamPanel);
},
showSelectAttackTeamPanel_: function(e) {
r.addPanel(this.selectAttackTeamPanel, !0);
var a = v.genSelectAttackTeamData(e), t = a.myTeamInfos;
this.selectAttackTeamPanel.teamItemMap = this.selectAttackTeamPanel.teamItemMap || {};
r.preHideNodeMap(this.selectAttackTeamPanel.teamItemMap);
for (var n in t) {
var i = this.selectAttackTeamPanel.teamItemMap[n];
if (!i) {
(i = cc.instantiate(this.selectAttackTeamItem)).parent = this.selectAttackTeamItemsLayout;
i.idx = n;
this.selectAttackTeamPanel.teamItemMap[n] = i;
}
i.active = !0;
r.markHideNode(i);
e = t[n];
i.data = {
teamInfo: e,
defenderTeamId: a.defenderTeamId
};
var l = i.getChildByName("team_info_node"), c = l.getChildByName("top_node"), d = c.getChildByName("server_label").getComponent(cc.Label);
s.replaceLabel(d, [ e.serverId ]);
c.getChildByName("guild_label").getComponent(cc.Label).string = e.guildName;
c.getComponent(cc.Layout).updateLayout();
var h = l.getChildByName("info_bg_sp");
i.playerInfoItemMap = i.playerInfoItemMap || {};
r.preHideNodeMap(i.playerInfoItemMap);
var u = 0;
for (var m in e.battleTeamMap) {
var g = i.playerInfoItemMap[u];
if (!g) {
(g = cc.instantiate(this.selectAttackTeamPlayerInfoItem)).parent = h;
g.idx = u;
i.playerInfoItemMap[u] = g;
}
g.active = !0;
r.markHideNode(g);
var p = e.battleTeamMap[m];
g.getChildByName("name_label").getComponent(cc.Label).string = p.playerName;
g.getChildByName("level_label").getComponent(cc.Label).string = o.t("LV.$1", [ p.playerLevel ]);
g.getComponent(cc.Layout).updateLayout();
u++;
}
r.hideNodeMap(i.playerInfoItemMap);
h.getComponent(cc.Layout).updateLayout();
i.getChildByName("reward_label").getChildByName("value_label").getComponent(cc.Label).string = a.rewardCounts[n];
}
r.hideNodeMap(this.selectAttackTeamPanel.teamItemMap);
},
onSelectAttackTeamClose_: function() {
r.removePanel(this.selectAttackTeamPanel);
},
onSelectAttackTeamChallenge_: function(a) {
var s = e("battle.consts"), l = e("battleMain"), c = e("battle.fightHandler"), d = e("battleScene"), u = a.target.data, m = u.teamInfo;
if (m.attackTimes != b.ATTACK_TIMES) {
r.addLoading();
h.choose(m.teamId, u.defenderTeamId, function(e) {
var a = e._temp.attackTeamInfo, o = e._temp.defenseTeamInfo, u = t.sortBy(a.battleTeamMap, function(e) {
return -e.playerLevel;
}), p = t.sortBy(o.battleTeamMap, function(e) {
return -e.playerLevel;
}), _ = {};
_[a.teamId] = u.length;
_[o.teamId] = p.length;
for (var k, f, b = {}, v = {}, S = {}, T = 1, M = {}; 0 != _[a.teamId] && 0 != _[o.teamId]; ) {
var $ = u.length - _[a.teamId], I = p.length - _[o.teamId], C = y.buildBattleTeam(u[$].playerId, u[$].ships, u[$].roles), P = y.buildBattleTeam(p[I].playerId, p[I].ships, p[I].roles), D = l.pkBattleInstant(n.clone(C), n.clone(P), k || null), N = s.PRESTIGE_BATTLE_BACKGROUND_IMG_ID, A = N[Math.floor(Math.random() * N.length)];
k = k || D.seed;
var L = D.isWin ? c.team1.roles : c.team2.roles, E = D.isWin ? u[$] : p[I], B = {};
for (var w in L) {
B[L[w].kindId] = L[w].hp;
for (var G in E.roles) E.roles[G].kindId == L[w].kindId && (E.roles[G].attr.hp = L[w].hp);
}
if (D.isWin) {
_[o.teamId]--;
b[T] = {
teamId: a.teamId,
hpMap: B
};
} else {
_[a.teamId]--;
b[T] = {
teamId: o.teamId,
hpMap: B
};
}
0 == _[o.teamId] ? f = !0 : 0 == _[a.teamId] && (f = !1);
var R = t.map(C.roles.concat(P.roles), function(e) {
return e.kindId;
});
M[T] = y.getPreLoadInfos(R, A);
S[T] = n.clone(l.damageMap);
v[T] = {
team1: C,
team2: P,
battleType: s.BATTLE_TYPE.PRESTIGE,
opts: {
seed: k,
bgImgId: A,
times: T,
isWin: D.isWin,
damageMap: S[T],
isLastWin: null == f ? void 0 : f
}
};
T++;
}
r.addLoading();
h.challenge(a.teamId, o.teamId, f, b, S, k, function() {
m.attackTimes++;
var e = [];
for (var a in v) e.push(function(e) {
d.next = e;
var a = this.battleSceneData;
r.preload(this.preLoadInfos, function() {
g.pushScene(g.NAME.BATTLE_SCENE, a);
});
}.bind({
battleSceneData: v[a],
preLoadInfos: M[a]
}));
i.waterfall(e, function() {
console.log("isWin:" + f);
d.next = null;
});
});
});
} else r.addHintPanel(o.t("次数已用完"));
},
onCreate_: function() {
var e = c.player.extra.prestigeBattle;
e.createTeamInfo ? this.showCreatePanel_(e.createTeamInfo) : b.PRACTICE_TIMES == e.practiceTimes ? r.addHintPanel(o.t("讨伐次数已用完")) : g.pushScene(g.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: y.TYPE.PRESTIGE_BATTLE_DEFENSE_TEAM,
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
var n = e.leaderId == c.player.id, i = t.sortBy(e.battleTeamMap, function(a) {
return a.playerId == e.leaderId ? -1 : 0;
});
for (var l in i) {
var d = this.createPanel.memberItemMap[l];
if (!d) {
(d = cc.instantiate(this.createMemberItem)).parent = this.createMemberItemsLayout;
d.idx = l;
this.createPanel.memberItemMap[l] = d;
}
d.active = !0;
r.markHideNode(d);
var h = i[l];
d.getChildByName("player_name_label").getComponent(cc.Label).string = h.playerName;
d.getChildByName("player_level_label").getComponent(cc.Label).string = o.t("LV.$1", [ h.playerLevel ]);
var u = e.leaderId == h.playerId;
d.getChildByName("captain_sp").active = u;
d.getChildByName("member_sp").active = !u;
var m = d.getChildByName("count_label");
m.active = u;
s.replaceLabel(m.getComponent(cc.Label), [ i.length, b.PRACTICE_TEAM_MEMBER_COUNT ]);
var g = d.getChildByName("start_bt");
g.active = n && u;
g.data = {
teamId: e.teamId
};
var p = d.getChildByName("auto_start_bt");
p.active = n && u && i.length < b.PRACTICE_TEAM_MEMBER_COUNT;
p.data = {
teamInfo: e
};
var f = p.getChildByName("Label").getComponent(cc.Label);
p.label = f;
f.string = e.isAutoPractice ? o.t("取消自动") : o.t("自动讨伐");
var y = d.getChildByName("dissolve_bt");
y.active = n && u;
y.data = {
teamId: e.teamId
};
var v = d.getChildByName("remove_bt");
v.data = {
teamInfo: e,
playerId: h.playerId
};
v.getChildByName("Label").getComponent(cc.Label).string = c.player.id == h.playerId ? o.t("退出") : o.t("移除");
v.active = n && !u || !n && c.player.id == h.playerId;
d.roleItemMap = d.roleItemMap || {};
r.preHideNodeMap(d.roleItemMap);
d.shipItemMap = d.shipItemMap || {};
r.preHideNodeMap(d.shipItemMap);
for (var S = 0; S < h.ships.length; S++) {
var T = _.genData(h.ships[S]), M = d.shipItemMap[S];
if (!M) {
(M = cc.instantiate(this.createShipItem)).parent = d.getChildByName("ship_" + (S + 1) + "_bg_sp");
d.shipItemMap[S] = M;
}
M.active = !0;
r.markHideNode(M);
M.getComponent("shipItem").update_(T);
}
for (S = 0; S < h.roles.length; S++) {
var $ = k.genData(h.roles[S]), I = d.roleItemMap[S];
if (!I) {
(I = cc.instantiate(this.createRoleItem)).parent = d.getChildByName("role_" + (S + 1) + "_bg_sp");
d.roleItemMap[S] = I;
}
I.active = !0;
r.markHideNode(I);
I.getComponent("roleItem").update_($);
}
r.hideNodeMap(d.roleItemMap);
r.hideNodeMap(d.shipItemMap);
}
r.hideNodeMap(this.createPanel.memberItemMap);
},
onCreateClose_: function() {
this.createPanel.isFromJoin && this.onJoin_();
r.removePanel(this.createPanel);
},
onCreateStart_: function(e) {
var a = e.target.data;
r.addLoading();
var t = this;
h.practice(a.teamId, function() {
r.removePanel(t.createPanel);
c.player.extra.prestigeBattle.createTeamInfo = null;
t.onRefresh_();
});
},
onCreateAutoStart_: function(e) {
var a = e.target, t = a.data.teamInfo;
r.addLoading();
h.setAutoPractice(t.teamId, !t.isAutoPractice, function() {
t.isAutoPractice = !t.isAutoPractice;
a.label.string = t.isAutoPractice ? o.t("取消自动") : o.t("自动讨伐");
});
},
onCreateRemove_: function(e) {
var a = e.target.data, n = a.teamInfo;
r.addLoading();
var i = this;
h.removeTeamMember(n.teamId, a.playerId, function(e) {
if (a.playerId == c.player.id) {
var s = c.player.extra.prestigeBattle;
s.defenseTeamIndexs = t.difference(s.defenseTeamIndexs, n.battleTeamMap[c.player.id].teamIndexs);
s.defenseShipIndexs = t.difference(s.defenseShipIndexs, n.battleTeamMap[c.player.id].shipIndexs);
s.practiceTimes--;
i.data.remainingPracticeTimes = b.PRACTICE_TIMES - s.practiceTimes;
i.defenseTimesLabel.string = e.remainingPracticeTimes;
r.removePanel(i.createPanel);
} else {
var o = c.player.extra.prestigeBattle.createTeamInfo;
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
h.dissolveTeam(a.teamId, function() {
r.removePanel(n.createPanel);
var e = c.player.extra.prestigeBattle;
e.defenseTeamIndexs = t.difference(e.defenseTeamIndexs, e.createTeamInfo.battleTeamMap[c.player.id].teamIndexs);
e.defenseShipIndexs = t.difference(e.defenseShipIndexs, e.createTeamInfo.battleTeamMap[c.player.id].shipIndexs);
e.practiceTimes--;
n.data.remainingPracticeTimes = b.PRACTICE_TIMES - e.practiceTimes;
n.defenseTimesLabel.string = n.data.remainingPracticeTimes;
e.createTeamInfo = null;
});
},
onJoin_: function() {
r.addLoading();
var e = this;
h.getReadyTeamInfos(function(a) {
c.player.extra.prestigeBattle.defenseTeamIndexs = a._temp.defenseTeamIndexs;
c.player.extra.prestigeBattle.defenseShipIndexs = a._temp.defenseShipIndexs;
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
var l = n.getChildByName("count_label"), d = t.keys(e[a].battleTeamMap).length;
s.replaceLabel(l.getComponent(cc.Label), [ d, b.PRACTICE_TEAM_MEMBER_COUNT ]);
var h = n.getChildByName("join_bt");
h.active = !e[a].battleTeamMap[c.player.id] && d < b.PRACTICE_TEAM_MEMBER_COUNT;
h.data = {
teamId: e[a].teamId
};
var u = n.getChildByName("view_bt");
u.active = !h.active;
u.data = {
teamInfo: e[a]
};
n.roleItemMap = n.roleItemMap || {};
r.preHideNodeMap(n.roleItemMap);
n.shipItemMap = n.shipItemMap || {};
r.preHideNodeMap(n.shipItemMap);
for (var m = 0; m < i.ships.length; m++) {
var g = _.genData(i.ships[m]), p = n.shipItemMap[m];
if (!p) {
(p = cc.instantiate(this.createShipItem)).parent = n.getChildByName("ship_" + (m + 1) + "_bg_sp");
n.shipItemMap[m] = p;
}
p.active = !0;
r.markHideNode(p);
p.getComponent("shipItem").update_(g);
}
for (m = 0; m < i.roles.length; m++) {
var f = k.genData(i.roles[m]), y = n.roleItemMap[m];
if (!y) {
(y = cc.instantiate(this.createRoleItem)).parent = n.getChildByName("role_" + (m + 1) + "_bg_sp");
n.roleItemMap[m] = y;
}
y.active = !0;
r.markHideNode(y);
y.getComponent("roleItem").update_(f);
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
b.PRACTICE_TIMES != c.player.extra.prestigeBattle.practiceTimes ? g.pushScene(g.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: y.TYPE.PRESTIGE_BATTLE_DEFENSE_TEAM,
opts: {
teamId: a.teamId,
type: "join"
}
}) : r.addHintPanel(o.t("讨伐次数已用完，不能加入队伍"));
}
});
v.genData = function() {
var e = c.player.extra.prestigeBattle, a = e.teamInfos, n = b.PRACTICE_TIMES - e.practiceTimes, i = t.range(1, 11);
for (var r in a) {
a[r].location = t.sample(i);
i = t.without(i, a[r].location);
}
a && (a = t.sortBy(a, "location"));
return {
startHour: b.START_HOURS,
endHour: b.END_HOURS,
remainingPracticeTimes: n,
teamInfos: a,
isOpen: e.openInfo.isOpen,
isReady: e.openInfo.isReady
};
};
v.genViewTeamData = function(e) {
var a = c.player.extra.prestigeBattle.myTeamInfos, n = a.length > 0, i = e.guildId == c.player.guildId, r = [];
for (var s in a) {
var o = d.PRESTIGE_BATTLE.FUNS.getChallengeRewardRate(a[s].topLevel, e.topLevel), l = d.PRESTIGE_BATTLE.FUNS.getRewardDropList(t.keys(e.battleTeamMap).length, o);
r.push(l[0].count);
}
return {
teamInfo: e,
minRewardCount: r.length > 0 ? t.min(r) : 0,
maxRewardCount: r.length > 0 ? t.max(r) : 0,
isHaveTeam: n,
isSameGuild: i
};
};
v.genSelectAttackTeamData = function(e) {
var a = c.player.extra.prestigeBattle.myTeamInfos, n = [], i = [];
for (var r in a) if (!t.include(a[r].attackedTeamIds, e.teamId) && 0 != b.ATTACK_TIMES - a[r].attackTimes) {
i.push(a[r]);
var s = d.PRESTIGE_BATTLE.FUNS.getChallengeRewardRate(a[r].topLevel, e.topLevel), o = d.PRESTIGE_BATTLE.FUNS.getRewardDropList(t.keys(e.battleTeamMap).length, s);
n.push(o[0].count);
}
return {
defenderTeamId: e.teamId,
myTeamInfos: i,
rewardCounts: n,
_defenderTeamInfo: e
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
prestigeBattleHandler: "prestigeBattleHandler",
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
underscore: "underscore",
util: "util"
} ],
