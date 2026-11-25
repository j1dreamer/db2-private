selectBattleRolesScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "1389eeWrwxPOLhrBRJbPnFX", "selectBattleRolesScene");
var t = e("underscore"), n = e("http"), i = e("async"), r = e("md5"), s = e("baseView"), o = e("dataApi"), l = e("util"), c = (e("guide"), 
e("battle.consts")), d = e("battleMain"), h = e("clientConfig"), u = e("serverConfig"), m = e("serverMain"), g = e("arenaHandler"), p = e("arena3v3Handler"), _ = e("practiceHandler"), k = e("tailHandler"), f = e("islandHandler"), y = e("sixPracticeHandler"), b = e("newGuildBattleHandler"), v = e("activityGuildBattleHandler"), S = e("allServerBattleHandler"), T = e("prestigeBattleHandler"), M = e("worshipBattleHandler"), $ = e("worldBossHandler"), I = e("guildBossHandler"), C = e("smapHandler"), P = e("eyeHandler"), D = e("teamBattleHandler"), N = e("doubleBattleHandler"), A = e("endlessHandler"), L = e("topArena3v3Handler"), E = e("i18n"), B = e("helper"), w = e("soundApi"), G = e("resource"), R = e("buildExt"), H = e("roleItem"), x = e("shipItem"), K = e("sceneManager"), F = cc.Class({
extends: cc.Component,
properties: {
rightLayout: cc.Node,
powerLabel: cc.Label,
shipBt: cc.Node,
nextBt: cc.Node,
battleBt: cc.Node,
yesBt: cc.Node,
hintNode: cc.Node,
roleItemNode: cc.Node,
roleItemNodesLayout: cc.Node,
roleListview: cc.Node,
shipItemNode: cc.Node,
shipItemNodesLayout: cc.Node,
shipListview: cc.Node,
topLayout: cc.Node,
centerLayout: cc.Node,
bottomRoleItemNode: cc.Node,
bottomShipItemNode: cc.Node,
bottomLayout: cc.Node,
bottomTeamIdLabel: cc.Label
},
statics: {
instance: null
},
onLoad: function() {
F.instance || (F.instance = this);
K.curSceneStatusData = t.extend({
selectBtName: "all_bt",
type: null,
opts: {}
}, K.curSceneStatusData);
this.statusData = K.curSceneStatusData;
this.positionType = null;
this.shipBt.active = !R.isHideShip;
this.roleListview.active = !1;
this.hintNode.active = !1;
this.roleItemNode.active = !1;
this.shipItemNode.active = !1;
this.bottomRoleItemNode.active = !1;
this.bottomShipItemNode.active = !1;
this.roleItemNodeMap = this.roleItemNodeMap || {};
for (var e in F.cacheRoleItemNodeMap) {
this.roleItemNodeMap[e] = F.cacheRoleItemNodeMap[e];
this.roleItemNodeMap[e].parent = this.roleItemNodesLayout;
}
var a = this.centerLayout.getChildByName(this.statusData.selectBtName);
this.onType_({
target: a
});
this.isFadeIn = !1;
this.scheduleOnce(function() {
B.scrollviewFadeIn(this.roleListview);
this.isFadeIn = !0;
}, 0);
},
onDestroy: function() {
F.instance = null;
},
onExit_: function() {
t.each(this.roleItemNodeMap, function(e) {
e.removeComponent(cc.Button);
e.removeComponent("soundComponent");
if (e.parent) {
e.removeFromParent(!1);
e.parent = null;
}
F.cacheRoleItemNodeMap[e.data.classId] = e;
});
},
update_: function() {
var a = F.genData(this.statusData.type, this.statusData.opts);
this.data = a;
this.rightLayout.parent.active = !!a.selectIdxsMap;
if (a.selectIdxsMap) for (var n = 0; n < 5; n++) {
var i = n + 1, r = this.rightLayout.getChildByName("team_" + i + "_bt");
r.active = i <= a.teamCount;
if (r.active) {
r.getComponent(cc.Button).interactable = i != this.statusData.opts.selectTeamId;
r.data = {
teamId: i
};
}
}
var o = F.TYPE;
this.battleBt.active = !t.include([ o.ARENA_DEFENSE_TEAM, o.ARENA_3V3_ATTACK_TEAM, o.ARENA_3V3_DEFENSE_TEAM, o.PRACTICE_DEFENSE_TEAM, o.GUILD_BATTLE_TEAM, o.NEW_GUILD_BATTLE_DEFENSE_TEAM, o.ALL_SERVER_BATTLE_TEAM, o.PRESTIGE_BATTLE_DEFENSE_TEAM, o.TEAM_BATTLE_DEFENSE_TEAM, o.SIX_PRACTICE_DEFENSE_TEAM, o.WORSHIP_BATTLE_TEAM, o.DIY_BATTLE_TEAM, o.DOUBLE_BATTLE_TEAM, o.PURSUIT_ATTACK_TEAM, o.ISLAND_BATTLE_DEFENSE_TEAM, o.TOP_ARENA_3V3_ATTACK_TEAM, o.TOP_ARENA_3V3_DEFENSE_TEAM, o.ACTIVITY_GUILD_BATTLE_DEFENSE_TEAM ], a.type);
t.include([ o.ARENA_3V3_ATTACK_TEAM ], a.type) && this.statusData.opts.selectTeamId == a.teamCount && (this.battleBt.active = t.include([ o.ARENA_3V3_ATTACK_TEAM ], a.type) && this.statusData.opts.selectTeamId == a.teamCount);
this.nextBt.active = !!this.statusData.opts.selectTeamId && a.teamCount != this.statusData.opts.selectTeamId;
this.yesBt.active = !this.battleBt.active && !this.nextBt.active;
this.powerLabel.string = a.totalPower;
this.hintNode.active = !!a.hintStr;
a.hintStr && (this.hintNode.getChildByName("hint_label").getComponent(cc.Label).string = a.hintStr);
this.isNoFirstUpdate = this.isNoFirstUpdate || !1;
this.characterNodeMap = this.characterNodeMap || {};
var l, c = [];
for (var n in this.characterNodeMap) c.push(this.characterNodeMap[n].getComponent("characterArmatureComponent").data.classId);
for (n = 0; n < 5; n++) {
var d = this.topLayout.getChildByName("role_" + (n + 1) + "_node");
d.effectSpine = d.getChildByName("effect_spine");
d.effectSpine.zIndex = 1;
d.effectSpine.active = !1;
var u = a.selectRoleItems[n], m = this.characterNodeMap[n], g = u ? u._data.classId : null, p = !!m;
if (m && m.getComponent("characterArmatureComponent").data.classId != g) {
m.destroy();
m = null;
delete this.characterNodeMap[n];
}
d.data = u ? {
idx: u._role.idx,
teamId: this.statusData.opts.selectTeamId,
classId: u._data.classId
} : null;
d.getComponent(cc.Button).interactable = !!u;
if (!m && g) {
(m = s.getCharacterNode(g)).parent = d;
m.idx = n;
this.characterNodeMap[n] = m;
}
g && !t.include(c, g) && this.isNoFirstUpdate && B.spineEffect(d.effectSpine, "action_1");
p && !g && B.spineEffect(d.effectSpine, "action_2");
}
t.each(this.roleItemNodeMap, function(e) {
e.active = !1;
});
for (var n in a.roleItems) {
var _ = a.roleItems[n];
g = _._data.classId;
if (_._data.positionType == this.positionType || this.positionType == h.CONSTS.POSITION_TYPE.NONE) {
if (!(G = this.roleItemNodeMap[g])) {
(G = cc.instantiate(this.roleItemNode)).parent = this.roleItemNodesLayout;
G.idx = n;
this.roleItemNodeMap[g] = G;
}
G.zIndex = _.index;
G.active = !0;
G.data = {
idx: _._role.idx,
teamId: 0,
classId: g
};
if (!G.getComponent(cc.Button)) {
var k = G.addComponent(cc.Button), f = new cc.Component.EventHandler();
f.target = this.node;
f.component = "selectBattleRolesScene";
f.handler = "onSelect_";
k.clickEvents.push(f);
G.addComponent(e("soundComponent"));
G.getComponent("soundComponent").buttonAudio = this.roleItemNode.getComponent("soundComponent").buttonAudio;
}
G.getChildByName("role_item").getComponent("roleItem").update_(_);
G.getComponent(cc.Button).interactable = 0 != _.hpPct && !_.isDefenseUsed && !_.isAttackUsed && !_.isDead;
G.getChildByName("attack_used_sp").active = !!_.isAttackUsed;
G.getChildByName("defense_used_sp").active = !!_.isDefenseUsed;
G.getChildByName("death_sp").active = 0 == _.hpPct || _.isDead;
var y = G.getChildByName("bar_node");
y.active = null != _.hpPct && null != _.mpPct;
var b = y.getChildByName("hp_bar"), v = y.getChildByName("mp_bar");
b.active = _.hpPct > 0;
v.active = _.hpPct > 0;
b.active && (b.getComponent(cc.ProgressBar).progress = _.hpPct);
v.active && (v.getComponent(cc.ProgressBar).progress = _.mpPct);
if (null != _.hpPct && null != _.mpPct) {
var S = this.roleItemNodesLayout.getComponent(cc.Layout);
if (-20 != S.paddingTop) {
S.paddingTop = -20;
S.updateLayout();
}
}
(N = (D = G.getChildByName("select_sp")).getChildByName("above_sp")).active = t.include(a.selectIdxs, _._role.idx);
var T = D.getChildByName("team_id_bg"), M = a.selectIdxsMap ? t.flatten(t.values(a.selectIdxsMap)) : [];
T.active = t.include(M, _._role.idx);
if (T.active) {
var $ = T.getChildByName("team_id_label").getComponent(cc.Label);
for (var i in a.selectIdxsMap) if (t.include(a.selectIdxsMap[i], _._role.idx)) {
$.string = E.t("$1队", [ i ]);
G.data.teamId = i;
break;
}
}
D.active = N.active || T.active;
}
}
this.shipNodeMap = this.shipNodeMap || {};
c = [];
for (var n in this.shipNodeMap) c.push(this.shipNodeMap[n].getComponent("shipArmatureComponent").data.classId);
for (n = 0; n < 3; n++) {
(K = this.topLayout.getChildByName("ship_" + (n + 1) + "_bg_sp")).effectSpine = K.getChildByName("effect_spine");
K.effectSpine.zIndex = 1;
K.effectSpine.active = !1;
var I = a.selectShipItems[n], C = this.shipNodeMap[n];
g = I ? I._data.classId : null, p = !!C;
if (C && C.getComponent("shipArmatureComponent").data.classId != g) {
C.destroy();
C = null;
delete this.shipNodeMap[n];
}
if (!C && g) {
(C = s.getShipNode(g)).scale = .8;
C.parent = K;
C.idx = n;
this.shipNodeMap[n] = C;
}
g && !t.include(c, g) && this.isNoFirstUpdate && B.spineEffect(K.effectSpine, "action_1");
p && !g && B.spineEffect(K.effectSpine, "action_2");
}
this.shipItemNodeMap = this.shipItemNodeMap || {};
s.preHideNodeMap(this.shipItemNodeMap);
for (var n in a.shipItems) {
var P = a.shipItems[n];
if (!(x = this.shipItemNodeMap[n])) {
(x = cc.instantiate(this.shipItemNode)).parent = this.shipItemNodesLayout;
x.idx = n;
this.shipItemNodeMap[n] = x;
}
x.active = !0;
s.markHideNode(x);
x.data = {
idx: P._item.idx,
teamId: 0
};
x.getChildByName("ship_item").removeComponent(cc.Button);
x.getChildByName("ship_item").getComponent("shipItem").update_(P);
x.getComponent(cc.Button).interactable = !P.isDefenseUsed && !P.isAttackUsed;
x.getChildByName("attack_used_sp").active = !!P.isAttackUsed;
x.getChildByName("defense_used_sp").active = !!P.isDefenseUsed;
var D, N, A = x.getChildByName("label_bg_sp").getChildByName("star_label"), L = x.getChildByName("label_bg_sp").getChildByName("level_label");
B.replaceLabel(A.getComponent(cc.Label), [ P._item.star ]);
B.replaceLabel(L.getComponent(cc.Label), [ P._item.level ]);
(N = (D = x.getChildByName("select_sp")).getChildByName("above_sp")).active = t.include(a.selectShipIdxs, P._item.idx);
T = D.getChildByName("team_id_bg"), M = a.selectShipIdxsMap ? t.flatten(t.values(a.selectShipIdxsMap)) : [];
T.active = t.include(M, P._item.idx);
if (T.active) {
$ = T.getChildByName("team_id_label").getComponent(cc.Label);
for (var i in a.selectShipIdxsMap) if (t.include(a.selectShipIdxsMap[i], P._item.idx)) {
$.string = E.t("$1队", [ i ]);
x.data.teamId = i;
break;
}
}
D.active = N.active || T.active;
}
s.hideNodeMap(this.shipItemNodeMap);
this.isNoFirstUpdate = !0;
(l = this.roleItemNodesLayout.getChildByName("fill_node")).zIndex = 1e3;
l.active = !!a.defenseRoleItemsMap;
(l = this.shipItemNodesLayout.getChildByName("fill_node")).zIndex = 1e3;
l.active = !!a.defenseRoleItemsMap;
B.replaceLabel(this.bottomTeamIdLabel, [ this.statusData.opts.selectTeamId ]);
this.bottomLayout.active = !!a.defenseRoleItemsMap;
this.roleListview.height = this.bottomLayout.active ? 150 : 250;
this.shipListview.height = this.bottomLayout.active ? 150 : 250;
if (this.bottomLayout.active) {
this.bottomRoleItemNodeMap = this.bottomRoleItemNodeMap || {};
s.preHideNodeMap(this.bottomRoleItemNodeMap);
var w = a.defenseRoleItemsMap[this.statusData.opts.selectTeamId];
for (n = 0; n < w.length; n++) {
var G;
if (!(G = this.bottomRoleItemNodeMap[n])) {
(G = cc.instantiate(this.bottomRoleItemNode)).parent = this.bottomLayout;
G.idx = n;
var R = this.bottomLayout.getChildByName("role_" + (n + 1) + "_bg_sp");
G.setPosition(R.getPosition());
this.bottomRoleItemNodeMap[n] = G;
}
G.active = !0;
s.markHideNode(G);
G.getChildByName("role_item").getComponent("roleItem").update_(w[n]);
}
s.hideNodeMap(this.bottomRoleItemNodeMap);
}
if (this.bottomLayout.active) {
this.bottomShipItemNodeMap = this.bottomShipItemNodeMap || {};
s.preHideNodeMap(this.bottomShipItemNodeMap);
var H = a.defenseShipItemsMap[this.statusData.opts.selectTeamId] || {};
for (n = 0; n < H.length; n++) {
var x;
if (!(x = this.bottomShipItemNodeMap[n])) {
(x = cc.instantiate(this.bottomShipItemNode)).parent = this.bottomLayout;
x.idx = n;
var K = this.bottomLayout.getChildByName("ship_" + (n + 1) + "_bg_sp");
x.setPosition(K.getPosition());
this.bottomShipItemNodeMap[n] = x;
}
x.active = !0;
s.markHideNode(x);
x.getChildByName("ship_item").getComponent("shipItem").update_(H[n]);
A = x.getChildByName("label_bg_sp").getChildByName("star_label"), L = x.getChildByName("label_bg_sp").getChildByName("level_label");
B.replaceLabel(A.getComponent(cc.Label), [ H[n]._item.star ]);
B.replaceLabel(L.getComponent(cc.Label), [ H[n]._item.level ]);
}
s.hideNodeMap(this.bottomShipItemNodeMap);
}
},
onType_: function(e) {
var a = e.target;
this.statusData.selectBtName = a.name;
var n = [ "all_bt", "fornt_bt", "center_bt", "back_bt", "ship_bt" ];
t.each(this.centerLayout.children, function(e) {
t.include(n, e.name) && (e.getComponent(cc.Button).interactable = !0);
});
a.getComponent(cc.Button).interactable = !1;
var i = h.CONSTS.POSITION_TYPE, r = [ i.NONE, i.FORNT, i.CENTER, i.BACK ][t.indexOf(n, a.name)];
switch (this.statusData.selectBtName) {
case "ship_bt":
this.shipListview.active = !0;
break;

default:
this.shipListview.active = !1;
}
this.roleListview.active = !this.shipListview.active && this.isFadeIn;
this.positionType = r;
this.update_();
},
onSelect_: function(e) {
var a = e.target.data;
if (a) if (a.teamId && a.teamId != this.statusData.opts.selectTeamId) s.addHintPanel(E.t("这个战士已经在其他队")); else {
if (t.include(this.data.selectIdxs, a.idx)) this.data.selectIdxs = t.without(this.data.selectIdxs, a.idx); else {
if (this.data.type == F.TYPE.DOUBLE_BATTLE_TEAM && 2 == this.data.selectIdxs.length) {
s.addHintPanel(E.t("只能选择2个战士"));
return;
}
if (5 == this.data.selectIdxs.length) {
s.addHintPanel(E.t("只能选择5个战士"));
return;
}
this.data.selectIdxs.push(a.idx);
w.playWord(a.classId);
}
if (this.data.selectIdxsMap) {
this.data.selectIdxsMap[this.statusData.opts.selectTeamId] = this.data.selectIdxs;
this.statusData.opts.selectIdxsMap = this.data.selectIdxsMap;
} else this.statusData.opts.selectIdxs = this.data.selectIdxs;
this.update_();
}
},
onSelectShip_: function(e) {
var a = e.target.data;
if (a.teamId && a.teamId != this.statusData.opts.selectTeamId) s.addHintPanel(E.t("这个伙伴已经在其他队")); else {
if (t.include(this.data.selectShipIdxs, a.idx)) this.data.selectShipIdxs = t.without(this.data.selectShipIdxs, a.idx); else {
if (3 == this.data.selectShipIdxs.length) {
s.addHintPanel(E.t("只能选择3只伙伴"));
return;
}
this.data.selectShipIdxs.push(a.idx);
}
if (this.data.selectShipIdxsMap) {
this.data.selectShipIdxsMap[this.statusData.opts.selectTeamId] = this.data.selectShipIdxs;
this.statusData.opts.selectShipIdxsMap = this.data.selectShipIdxsMap;
} else this.statusData.opts.selectShipIdxs = this.data.selectShipIdxs;
this.update_();
}
},
onYes_: function() {
if (0 != this.data.selectIdxs.length) {
this.data.SELECT_IDXS_KEY && storage.setItem(this.data.SELECT_IDXS_KEY, this.data.selectIdxsMap || this.data.selectIdxs);
this.data.SELECT_SHIP_IDXS_KEY && storage.setItem(this.data.SELECT_SHIP_IDXS_KEY, this.data.selectShipIdxsMap || this.data.selectShipIdxs);
var a = F.TYPE, t = this;
switch (this.data.type) {
case a.ARENA_DEFENSE_TEAM:
s.addLoading();
g.setDefenseTeamIndexs(this.data.selectIdxs, this.data.selectShipIdxs, function() {
K.popScene();
});
break;

case a.ARENA_3V3_DEFENSE_TEAM:
s.addLoading();
p.setDefenseTeamIndexsMap(this.data.selectIdxsMap, this.data.selectShipIdxsMap, function() {
K.popScene();
});
break;

case a.PRACTICE_DEFENSE_TEAM:
s.addLoading();
_.setDefenseInfo(this.statusData.opts.type, this.data.selectIdxs, this.data.selectShipIdxs, this.statusData.opts.level, function() {
K.popScene();
});
break;

case a.SIX_PRACTICE_DEFENSE_TEAM:
s.addLoading();
y.setDefenseInfo(this.data.selectIdxs, this.data.selectShipIdxs, function() {
K.popScene();
});
break;

case a.NEW_GUILD_BATTLE_DEFENSE_TEAM:
s.addLoading();
b.setDefenseTeamInfo(this.data.selectIdxs, this.data.selectShipIdxs, function() {
m.player.extra.newGuildBattle.openInfo.defenseTeamInfo.teamIndexs = t.data.selectIdxs;
m.player.extra.newGuildBattle.openInfo.defenseTeamInfo.shipIndexs = t.data.selectShipIdxs;
K.popScene();
});
break;

case a.ACTIVITY_GUILD_BATTLE_DEFENSE_TEAM:
s.addLoading();
v.setDefenseTeamInfo(this.data.selectIdxs, this.data.selectShipIdxs, function() {
m.player.extra.activityGuildBattle.openInfo.defenseTeamInfo.teamIndexs = t.data.selectIdxs;
m.player.extra.activityGuildBattle.openInfo.defenseTeamInfo.shipIndexs = t.data.selectShipIdxs;
K.popScene();
});
break;

case a.ALL_SERVER_BATTLE_TEAM:
t = this;
s.addLoading();
S.enter(this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
if (e._temp.result) {
K.getSceneInfoByName(K.NAME.ALL_SERVER_BATTLE_SCENE).statusData.isEnter = !0;
K.popScene();
} else s.addHintPanel(E.t("不能参加"));
});
break;

case a.PRESTIGE_BATTLE_DEFENSE_TEAM:
"create" == t.statusData.opts.type ? T.createTeam(this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = m.player.extra.prestigeBattle;
a.defenseTeamIndexs = a.defenseTeamIndexs.concat(e._temp.teamInfo.battleTeamMap[m.player.id].teamIndexs);
a.defenseShipIndexs = a.defenseShipIndexs.concat(e._temp.teamInfo.battleTeamMap[m.player.id].shipIndexs);
a.createTeamInfo = e._temp.teamInfo;
a.practiceTimes++;
K.popScene();
}) : "join" == this.statusData.opts.type && T.joinTeam(this.statusData.opts.teamId, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = m.player.extra.prestigeBattle;
a.defenseTeamIndexs = a.defenseTeamIndexs.concat(e._temp.teamInfo.battleTeamMap[m.player.id].teamIndexs);
a.defenseShipIndexs = a.defenseShipIndexs.concat(e._temp.teamInfo.battleTeamMap[m.player.id].shipIndexs);
a.practiceTimes++;
K.popScene();
});
break;

case a.GUILD_BATTLE_TEAM:
K.popScene();
break;

case a.WORSHIP_BATTLE_TEAM:
s.addLoading();
M.apply(this.data.selectIdxsMap, this.data.selectShipIdxsMap, function() {
m.player.extra.worshipBattle.openInfo.isApply = !0;
K.popScene();
});
break;

case a.DIY_BATTLE_TEAM:
var i = {
playerId: m.player.id,
playerName: m.player.name,
serverId: m.player.serverId,
battleTeamMap: {}
};
for (var r in this.data.selectIdxsMap) {
var o = this.data.selectShipIdxsMap[r], l = this.data.selectIdxsMap[r], c = [];
for (var d in o) {
var h = m.player.bag.getItemByIdx(o[d]);
c.push(h);
}
var u = [];
for (var d in l) {
var k = m.player.team.getRoleByIdx(l[d], !0);
u.push(k);
}
var $ = F.buildBattleTeam(m.player.id, c, u);
i.battleTeamMap[r] = $;
}
var I = e("base64").Base64.encode(JSON.stringify(i)), C = e("querystring").stringify({
battleTeam: I
});
n.request(R.emitBattleTeamUrl, C);
K.popScene();
break;

case a.TEAM_BATTLE_DEFENSE_TEAM:
"create" == t.statusData.opts.type ? D.createTeam(this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = m.player.extra.teamBattle;
a.defenseTeamIndexs = a.defenseTeamIndexs.concat(e._temp.teamInfo.battleTeamMap[m.player.id].teamIndexs);
a.createTeamInfo = e._temp.teamInfo;
a.practiceTimes++;
K.popScene();
}) : "join" == this.statusData.opts.type && D.joinTeam(this.statusData.opts.teamId, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = m.player.extra.teamBattle;
a.defenseTeamIndexs = a.defenseTeamIndexs.concat(e._temp.teamInfo.battleTeamMap[m.player.id].teamIndexs);
a.practiceTimes++;
K.popScene();
});
break;

case a.DOUBLE_BATTLE_TEAM:
var P = this.statusData.opts.themeNo;
s.addLoading();
N.apply(P, this.data.selectIdxsMap, this.data.selectShipIdxsMap, function() {
m.player.extra.doubleBattle.infos[P - 1].openInfo.isApply = !0;
K.popScene();
});
break;

case a.PURSUIT_ATTACK_TEAM:
t = this;
s.addLoading();
A.setPursuitTeamIndexs(this.statusData.opts.bmapId, t.data.selectIdxs, t.data.selectShipIdxs, function() {
K.popScene();
});
break;

case a.ISLAND_BATTLE_DEFENSE_TEAM:
if ((t = this).statusData.opts.targetId) {
var B = Math.floor(1.3 * t.statusData.opts.totalPower);
if (t.data.totalPower < B) {
s.addHintPanel(E.t("战力需达到$1才能护卫", [ B ]));
return;
}
s.addLoading();
f.help(t.statusData.opts.targetId, t.statusData.opts.resourceInfoId, this.data.selectIdxs, this.data.selectShipIdxs, function() {
K.popScene();
});
} else {
s.addLoading();
f.practice(t.statusData.opts.resourceId, t.statusData.opts.isNeedHelp, this.data.selectIdxs, this.data.selectShipIdxs, function() {
K.popScene();
});
}
break;

case a.TOP_ARENA_3V3_ATTACK_TEAM:
K.popScene();
break;

case a.TOP_ARENA_3V3_DEFENSE_TEAM:
s.addLoading();
L.setDefenseTeamIndexsMap(this.data.selectIdxsMap, this.data.selectShipIdxsMap, function() {
K.popScene();
});
}
} else s.addHintPanel(E.t("请选择上阵战士"));
},
onTeam_: function(e) {
if (0 != this.data.selectIdxs.length) {
this.isNoFirstUpdate = !1;
var a = e.target.data;
this.statusData.opts.selectTeamId = a.teamId;
this.update_();
} else s.addHintPanel(E.t("请选择上阵战士"));
},
onNext_: function() {
if (0 != this.data.selectIdxs.length) {
this.isNoFirstUpdate = !1;
this.statusData.opts.selectTeamId++;
this.update_();
} else s.addHintPanel(E.t("请选择上阵战士"));
},
onBattle_: function() {
var a = e("battleScene");
if (0 != this.data.selectIdxs.length) {
if (o.checkBattleData()) {
w.stopAllWordEffect();
this.data.SELECT_IDXS_KEY && storage.setItem(this.data.SELECT_IDXS_KEY, this.data.selectIdxsMap || this.data.selectIdxs);
this.data.SELECT_SHIP_IDXS_KEY && storage.setItem(this.data.SELECT_SHIP_IDXS_KEY, this.data.selectShipIdxsMap || this.data.selectShipIdxs);
var n = F.TYPE, r = this;
switch (this.data.type) {
case n.SMAP_BATTLE_ATTACK_TEAM:
var h = function(e, a, n, i) {
var l = [];
for (var d in r.data.selectShipIdxs) {
var h = m.player.bag.getItemByIdx(r.data.selectShipIdxs[d]);
l.push(h);
}
var u = [];
for (var d in r.data.selectIdxs) {
var g = m.player.team.getRoleByIdx(r.data.selectIdxs[d], !0);
u.push(g);
}
var p = m.player.endless.fruitMapPowerUp, _ = F.buildBattleTeam(m.player.id, l, u, null, null, n ? p : 0);
F.cacheTeamsMd5(_, {});
var k = o.smap.findById(r.statusData.opts.smapId), f = k.mobZone1.concat(k.mobZone2), y = t.map(_.roles, function(e) {
return e.kindId;
}), b = k.resId;
if (a || n || i) {
var v = c.ENDLESS_BACKGROUND_IMG_IDS;
b = v[Math.floor(Math.random() * v.length)];
}
F.cacheMobsDataMd5(f);
var S = F.getPreLoadInfos(f.concat(y), b), T = {
team1: _,
battleType: c.BATTLE_TYPE.SMAP,
opts: {
smapId: r.statusData.opts.smapId,
showEntityIdsMap: e,
selectIdxs: r.data.selectIdxs,
selectShipIdxs: r.data.selectShipIdxs,
bmapId: r.statusData.opts.bmapId,
isEndless: a,
isFruitMap: n,
isStarSignMap: i,
bgImgId: b,
mobIds: f
}
};
s.preload(S, function() {
K.pushScene(K.NAME.BATTLE_SCENE, T);
});
};
s.addLoading();
this.statusData.opts.isEndless || this.statusData.opts.isFruitMap || this.statusData.opts.isStarSignMap ? A.begin(this.statusData.opts.smapId, this.statusData.opts.bmapId, function() {
h([], r.statusData.opts.isEndless, r.statusData.opts.isFruitMap, r.statusData.opts.isStarSignMap);
}) : C.beginSmap(this.statusData.opts.smapId, this.data.selectIdxs, function(e) {
h(e._temp.showEntityIdsMap, !1);
});
break;

case n.ARENA_ATTACK_TEAM:
s.addLoading();
g.choose(this.statusData.opts.defenderId, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = F.buildBattleTeam(a.playerId, a.ships, a.roles), o = F.buildBattleTeam(n.playerId, n.ships, n.roles), h = d.pkBattleInstant(l.clone(i), l.clone(o)), u = c.ARENA_BACKGROUND_IMG_IDS, p = u[Math.floor(Math.random() * u.length)], _ = t.map(i.roles.concat(o.roles), function(e) {
return e.kindId;
}), k = F.getPreLoadInfos(_, p), f = {
team1: i,
team2: o,
battleType: c.BATTLE_TYPE.ARENA_PK,
opts: {
seed: h.seed,
selectIdxs: r.data.selectIdxs,
bgImgId: p,
isWin: h.isWin,
damageMap: l.clone(d.damageMap)
}
};
s.addLoading();
g.challenge(r.statusData.opts.defenderId, r.data.selectIdxs, r.data.selectShipIdxs, h.isWin, h.seed, d.damageMap, p, function(e) {
f.opts.reportId = e._temp.reportId;
m.player.arena.rank = e._temp.rank;
s.preload(k, function() {
K.pushScene(K.NAME.BATTLE_SCENE, f);
});
});
});
break;

case n.EXPEDITION_ATTACK_TEAM:
var u = [];
for (var S in r.data.selectShipIdxs) {
var T = m.player.bag.getItemByIdx(r.data.selectShipIdxs[S]);
u.push(T);
}
var M = [];
for (var S in r.data.selectIdxs) {
var D = m.player.team.getRoleByIdx(r.data.selectIdxs[S], !0);
M.push(D);
}
var N = m.player.expedition.selfInfo, L = F.buildBattleTeam(m.player.id, u, M, null, N.hpMap, N.mpMap), B = m.player.expedition.challengerInfo.team, G = F.buildBattleTeam(B.playerId, B.ships, B.roles), R = (O = c.EXPEDITION_IMG_IDS)[Math.floor(Math.random() * O.length)], H = t.map(L.roles.concat(G.roles), function(e) {
return e.kindId;
}), x = F.getPreLoadInfos(H, R), V = {
team1: L,
team2: G,
battleType: c.BATTLE_TYPE.EXPEDITION,
opts: {
selectIdxs: r.data.selectIdxs,
selectShipIdxs: r.data.selectShipIdxs,
bgImgId: R
}
};
s.preload(x, function() {
K.pushScene(K.NAME.BATTLE_SCENE, V);
});
break;

case n.SIX_EXPEDITION_ATTACK_TEAM:
u = [];
for (var S in r.data.selectShipIdxs) {
T = m.player.bag.getItemByIdx(r.data.selectShipIdxs[S]);
u.push(T);
}
M = [];
for (var S in r.data.selectIdxs) {
D = m.player.team.getRoleByIdx(r.data.selectIdxs[S], !0);
M.push(D);
}
var O;
N = m.player.expedition.sixSelfInfo, L = F.buildBattleTeam(m.player.id, u, M, null, N.hpMap, N.mpMap), 
B = m.player.expedition.sixChallengerInfo.team, G = F.buildBattleTeam(B.playerId, B.ships, B.roles), 
R = (O = c.EXPEDITION_IMG_IDS)[Math.floor(Math.random() * O.length)], H = t.map(L.roles.concat(G.roles), function(e) {
return e.kindId;
}), x = F.getPreLoadInfos(H, R), V = {
team1: L,
team2: G,
battleType: c.BATTLE_TYPE.EXPEDITION,
opts: {
selectIdxs: r.data.selectIdxs,
selectShipIdxs: r.data.selectShipIdxs,
bgImgId: R,
isSix: !0
}
};
s.preload(x, function() {
K.pushScene(K.NAME.BATTLE_SCENE, V);
});
break;

case n.ARENA_3V3_ATTACK_TEAM:
s.addLoading();
p.choose(this.statusData.opts.defenderId, this.data.selectIdxsMap, this.data.selectShipIdxsMap, function(e) {
var n, o, h = e._temp.attackTeam, u = e._temp.defenseTeam, g = c.ARENA_BACKGROUND_IMG_IDS, _ = g[Math.floor(Math.random() * g.length)], k = {}, f = {}, y = {}, b = {}, v = {};
k[h.playerId] = 0;
k[u.playerId] = 0;
for (var S in h.rolesMap) {
var T = F.buildBattleTeam(h.playerId, h.shipsMap[S], h.rolesMap[S]), M = F.buildBattleTeam(u.playerId, u.shipsMap[S], u.rolesMap[S]), $ = d.pkBattleInstant(l.clone(T), l.clone(M), n || null);
n = n || $.seed;
var I = $.isWin;
if (I) {
k[h.playerId]++;
b[S] = h.playerId;
2 == k[h.playerId] && (o = !0);
} else {
k[u.playerId]++;
b[S] = u.playerId;
2 == k[u.playerId] && (o = !1);
}
v[S] = l.clone(d.damageMap);
y[S] = {
team1: T,
team2: M,
battleType: c.BATTLE_TYPE.ARENA_PK,
opts: {
is3v3: !0,
teamId: S,
winCount: k[h.playerId],
selectIdxs: r.data.selectIdxsMap[S],
seed: n,
bgImgId: _,
isWin: I,
isLastWin: null == o ? void 0 : o,
damageMap: v[S]
}
};
var C = t.map(T.roles.concat(M.roles), function(e) {
return e.kindId;
});
f[S] = F.getPreLoadInfos(C, _);
if (null != o) break;
}
s.addLoading();
p.challenge(r.statusData.opts.defenderId, r.data.selectIdxsMap, r.data.selectShipIdxsMap, o, b, n, v, _, function(e) {
m.player.arena3v3.rank = e._temp.rank;
var t = [];
for (var n in y) t.push(function(e) {
a.next = e;
var t = this.battleSceneData;
s.preload(this.preLoadInfos, function() {
K.pushScene(K.NAME.BATTLE_SCENE, t);
});
}.bind({
battleSceneData: y[n],
preLoadInfos: f[n],
teamId: n
}));
i.waterfall(t, function() {
console.log("isWin:" + o);
a.next = null;
});
});
});
break;

case n.PRACTICE_ATTACK_TEAM:
s.addLoading();
_.choose(this.statusData.opts.defenderId, this.data.selectIdxs, this.data.selectShipIdxs, this.statusData.opts.ctime, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = F.buildBattleTeam(a.playerId, a.ships, a.roles), o = F.buildBattleTeam(n.playerId, n.ships, n.roles), h = d.practiceBattleInstant(l.clone(i), l.clone(o)), u = c.ARENA_BACKGROUND_IMG_IDS, m = u[Math.floor(Math.random() * u.length)], g = t.map(i.roles.concat(o.roles), function(e) {
return e.kindId;
}), p = F.getPreLoadInfos(g, m), k = {
team1: i,
team2: o,
battleType: c.BATTLE_TYPE.PRACTICE,
opts: {
selectIdxs: r.data.selectIdxs,
seed: h.seed,
isWin: h.isWin,
bgImgId: m,
damageMap: l.clone(d.damageMap)
}
};
s.addLoading();
_.challenge(r.statusData.opts.defenderId, r.statusData.opts.ctime, r.data.selectIdxs, r.data.selectShipIdxs, h.isWin, h.seed, function(e) {
k.opts.entityCountMap = e._temp ? e._temp.entityCountMap : null;
s.preload(p, function() {
K.pushScene(K.NAME.BATTLE_SCENE, k);
});
});
});
break;

case n.SIX_PRACTICE_ATTACK_TEAM:
s.addLoading();
y.choose(this.statusData.opts.defenderId, this.data.selectIdxs, this.data.selectShipIdxs, this.statusData.opts.ctime, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = F.buildBattleTeam(a.playerId, a.ships, a.roles), o = F.buildBattleTeam(n.playerId, n.ships, n.roles), h = d.practiceBattleInstant(l.clone(i), l.clone(o)), u = c.ARENA_BACKGROUND_IMG_IDS, m = u[Math.floor(Math.random() * u.length)], g = t.map(i.roles.concat(o.roles), function(e) {
return e.kindId;
}), p = F.getPreLoadInfos(g, m), _ = {
team1: i,
team2: o,
battleType: c.BATTLE_TYPE.PRACTICE,
opts: {
selectIdxs: r.data.selectIdxs,
seed: h.seed,
isWin: h.isWin,
bgImgId: m,
damageMap: l.clone(d.damageMap)
}
};
s.addLoading();
y.challenge(r.statusData.opts.defenderId, r.statusData.opts.ctime, r.data.selectIdxs, r.data.selectShipIdxs, h.isWin, h.seed, function(e) {
_.opts.entityCountMap = e._temp ? e._temp.entityCountMap : null;
s.preload(p, function() {
K.pushScene(K.NAME.BATTLE_SCENE, _);
});
});
});
break;

case n.TAIL_ATTACK_TEAM:
s.addLoading();
var U = this.statusData.opts.tailType;
k.choose(U, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = o.mob.findById(n.roles[0].kindId).classId, l = F.buildBattleTeam(a.playerId, a.ships, a.roles), d = n, h = c.TAIL_BACKGROUND_IMG_ID_MAP[U];
F.cacheTeamsMd5(l, d);
var u = t.map(l.roles.concat(d.roles), function(e) {
return e.kindId;
}), m = F.getPreLoadInfos(u, h), g = {
team1: l,
team2: d,
battleType: c.BATTLE_TYPE.TAIL,
opts: {
BOSS_CONFIG: e._temp.BOSS_CONFIG,
tailType: U,
selectIdxs: r.data.selectIdxs,
selectShipIdxs: r.data.selectShipIdxs,
bossClassId: i,
bgImgId: h
}
};
s.preload(m, function() {
K.pushScene(K.NAME.BATTLE_SCENE, g);
});
});
break;

case n.FRIEND_BATTLE_TEAM:
s.addLoading();
g.choose(this.statusData.opts.defenderId, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = F.buildBattleTeam(a.playerId, a.ships, a.roles), o = F.buildBattleTeam(n.playerId, n.ships, n.roles), h = d.pkBattleInstant(l.clone(i), l.clone(o)), u = c.ARENA_BACKGROUND_IMG_IDS, m = u[Math.floor(Math.random() * u.length)], g = t.map(i.roles.concat(o.roles), function(e) {
return e.kindId;
}), p = F.getPreLoadInfos(g, m), _ = {
team1: i,
team2: o,
battleType: c.BATTLE_TYPE.ARENA_PK,
opts: {
seed: h.seed,
bgImgId: m,
selectIdxs: r.data.selectIdxs,
isFriend: !0,
isWin: h.isWin,
damageMap: l.clone(d.damageMap)
}
};
s.preload(p, function() {
K.pushScene(K.NAME.BATTLE_SCENE, _);
});
});
break;

case n.EYE_TEAM:
if ("public" == this.statusData.opts.eyeType) {
s.addLoading();
P.choose(this.statusData.opts.rank, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam;
if (a && a.playerId != n.playerId) {
var i = F.buildBattleTeam(a.playerId, a.ships, a.roles), o = F.buildBattleTeam(n.playerId, n.ships, n.roles), h = d.pkBattleInstant(l.clone(i), l.clone(o)), u = c.ARENA_BACKGROUND_IMG_IDS, g = u[Math.floor(Math.random() * u.length)], p = t.map(i.roles.concat(o.roles), function(e) {
return e.kindId;
}), _ = F.getPreLoadInfos(p, g), k = {
team1: i,
team2: o,
battleType: c.BATTLE_TYPE.ARENA_PK,
opts: {
selectIdxs: r.data.selectIdxs,
seed: h.seed,
bgImgId: g,
isWin: h.isWin,
damageMap: l.clone(d.damageMap)
}
};
s.addLoading();
P.challenge(r.statusData.opts.rank, r.data.selectIdxs, r.data.selectShipIdxs, n.playerId, h.isWin, h.seed, d.damageMap, g, function(e) {
k.opts.entityCountMap = e._temp ? e._temp.entityCountMap : null;
s.preload(_, function() {
k.opts.reportId = e._temp.reportId;
k.opts.isEye = !0;
K.pushScene(K.NAME.BATTLE_SCENE, k);
});
});
} else {
s.addLoading();
P.info(function(e) {
m.player.eye.list = e._temp.list;
K.popScene();
});
}
});
} else if ("private" == this.statusData.opts.eyeType) {
s.addLoading();
P.startPrivate(this.data.selectIdxs, function() {
s.addLoading();
P.info(function(e) {
m.player.eye.list = e._temp.list;
K.popScene();
});
});
}
break;

case n.WORLD_BOSS_BATTLE_TEAM:
if (this.data.selectIdxs.length < 5) {
s.addHintPanel(E.t("必须上阵5个战士"));
return;
}
s.addLoading();
$.choose(this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = o.mob.findById(n.roles[0].kindId).classId, l = F.buildBattleTeam(a.playerId, a.ships, a.roles), d = n, h = c.WORLD_BOSS_BACKGROUND_IMG_ID;
F.cacheTeamsMd5(l, d);
var u = t.map(l.roles.concat(d.roles), function(e) {
return e.kindId;
}), m = F.getPreLoadInfos(u, h), g = {
team1: l,
team2: d,
battleType: c.BATTLE_TYPE.BOSS,
opts: {
bgImgId: h,
selectIdxs: r.data.selectIdxs,
selectShipIdxs: r.data.selectShipIdxs,
bossClassId: i
}
};
s.preload(m, function() {
K.pushScene(K.NAME.BATTLE_SCENE, g);
});
});
break;

case n.GUILD_BOSS_BATTLE_TEAM:
s.addLoading();
I.choose(this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = o.mob.findById(n.roles[0].kindId).classId, l = F.buildBattleTeam(a.playerId, a.ships, a.roles), d = n, h = c.GUILD_BOSS_BACKGROUND_IMG_ID;
F.cacheTeamsMd5(l, d);
var u = t.map(l.roles.concat(d.roles), function(e) {
return e.kindId;
}), m = F.getPreLoadInfos(u, h), g = {
team1: l,
team2: d,
battleType: c.BATTLE_TYPE.GUILD_BOSS,
opts: {
bgImgId: h,
selectIdxs: r.data.selectIdxs,
selectShipIdxs: r.data.selectShipIdxs,
bossClassId: i
}
};
s.preload(m, function() {
K.pushScene(K.NAME.BATTLE_SCENE, g);
});
});
break;

case n.NEW_GUILD_BATTLE_ATTACK_TEAM:
s.addLoading();
b.choose(this.statusData.opts.defenderId, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = F.buildBattleTeam(a.playerId, a.ships, a.roles), o = F.buildBattleTeam(n.playerId, n.ships, n.roles), h = d.pkBattleInstant(l.clone(i), l.clone(o)), u = c.GUILD_BATTLE_IMG_IDS, g = u[Math.floor(Math.random() * u.length)], p = t.map(i.roles.concat(o.roles), function(e) {
return e.kindId;
}), _ = F.getPreLoadInfos(p, g), k = {
team1: i,
team2: o,
battleType: c.BATTLE_TYPE.ARENA_PK,
opts: {
selectIdxs: r.data.selectIdxs,
seed: h.seed,
bgImgId: g,
isWin: h.isWin,
damageMap: l.clone(d.damageMap)
}
};
s.addLoading();
b.challenge(r.statusData.opts.defenderId, d.diedNum, function() {
m.player.extra.newGuildBattle.battleInfo.attackTimes--;
s.preload(_, function() {
K.pushScene(K.NAME.BATTLE_SCENE, k);
});
});
});
break;

case n.ACTIVITY_GUILD_BATTLE_ATTACK_TEAM:
s.addLoading();
v.choose(this.statusData.opts.defenderId, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = F.buildBattleTeam(a.playerId, a.ships, a.roles), o = F.buildBattleTeam(n.playerId, n.ships, n.roles), h = d.pkBattleInstant(l.clone(i), l.clone(o)), u = c.GUILD_BATTLE_IMG_IDS, g = u[Math.floor(Math.random() * u.length)], p = t.map(i.roles.concat(o.roles), function(e) {
return e.kindId;
}), _ = F.getPreLoadInfos(p, g), k = {
team1: i,
team2: o,
battleType: c.BATTLE_TYPE.ARENA_PK,
opts: {
selectIdxs: r.data.selectIdxs,
seed: h.seed,
bgImgId: g,
isWin: h.isWin,
damageMap: l.clone(d.damageMap)
}
};
s.addLoading();
v.challenge(r.statusData.opts.defenderId, d.diedNum, function() {
m.player.extra.activityGuildBattle.battleInfo.attackTimes--;
s.preload(_, function() {
K.pushScene(K.NAME.BATTLE_SCENE, k);
});
});
});
break;

case n.ISLAND_BATTLE_ATTACK_TEAM:
s.addLoading();
f.choose(this.statusData.opts.defenderId, this.statusData.opts.id, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {
var a = e._temp.attackTeam, n = e._temp.defenseTeam, i = F.buildBattleTeam(a.playerId, a.ships, a.roles), o = F.buildBattleTeam(n.playerId, n.ships, n.roles), h = d.islandBattleInstant(l.clone(i), l.clone(o)), u = c.ARENA_BACKGROUND_IMG_IDS, m = u[Math.floor(Math.random() * u.length)], g = t.map(i.roles.concat(o.roles), function(e) {
return e.kindId;
}), p = F.getPreLoadInfos(g, m), _ = {
team1: i,
team2: o,
battleType: c.BATTLE_TYPE.ISLAND,
opts: {
selectIdxs: r.data.selectIdxs,
seed: h.seed,
isWin: h.isWin,
bgImgId: m,
damageMap: l.clone(d.damageMap)
}
};
s.addLoading();
f.challenge(r.statusData.opts.targetId, r.statusData.opts.defenderId, r.statusData.opts.id, r.data.selectIdxs, r.data.selectShipIdxs, h.isWin, h.seed, m, function(e) {
_.opts.entityCountMap = e._temp ? e._temp.entityCountMap : null;
s.preload(p, function() {
K.pushScene(K.NAME.BATTLE_SCENE, _);
});
});
});
break;

case n.TIME_PEAK_ATTACK_TEAM:
s.addLoading();
var W = m.player.timePeak;
u = [];
for (var S in r.data.selectShipIdxs) {
T = m.player.bag.getItemByIdx(r.data.selectShipIdxs[S]);
u.push(T);
}
M = [];
for (var S in r.data.selectIdxs) {
D = m.player.team.getRoleByIdx(r.data.selectIdxs[S], !0);
M.push(D);
}
var Y = F.buildBlessingSkills(W.blessingIds, W.blessingIdGetTimeMap, W.challengeWinTimeList, r.data.selectIdxs), j = this.statusData.opts.defenseTeam;
N = W.selfInfo, L = F.buildBattleTeam(m.player.id, u, M, Y, N.hpMap, N.mpMap, 0), 
G = F.buildBattleTeam(j.playerId, j.ships, j.roles), H = t.map(L.roles.concat(G.roles), function(e) {
return e.kindId;
}), x = F.getPreLoadInfos(H, this.statusData.opts.bgImgId), V = {
team1: L,
team2: G,
battleType: c.BATTLE_TYPE.TIME_PEAK,
opts: {
selectIdxs: r.data.selectIdxs,
selectShipIdxs: r.data.selectShipIdxs,
smapId: r.statusData.opts.smapId,
bgImgId: r.statusData.opts.bgImgId
}
};
s.preload(x, function() {
K.pushScene(K.NAME.BATTLE_SCENE, V);
});
}
}
} else s.addHintPanel(E.t("请选择上阵战士"));
}
});
F.TYPE = {
SMAP_BATTLE_ATTACK_TEAM: 1,
ARENA_ATTACK_TEAM: 2,
ARENA_DEFENSE_TEAM: 3,
EXPEDITION_ATTACK_TEAM: 4,
ARENA_3V3_ATTACK_TEAM: 6,
ARENA_3V3_DEFENSE_TEAM: 7,
TAIL_ATTACK_TEAM: 8,
PRACTICE_DEFENSE_TEAM: 9,
PRACTICE_ATTACK_TEAM: 10,
GUILD_BATTLE_TEAM: 11,
FRIEND_BATTLE_TEAM: 12,
EYE_TEAM: 13,
ALL_SERVER_BATTLE_TEAM: 14,
WORLD_BOSS_BATTLE_TEAM: 15,
PRESTIGE_BATTLE_DEFENSE_TEAM: 16,
NEW_GUILD_BATTLE_DEFENSE_TEAM: 17,
NEW_GUILD_BATTLE_ATTACK_TEAM: 18,
SIX_EXPEDITION_ATTACK_TEAM: 19,
SIX_PRACTICE_DEFENSE_TEAM: 20,
SIX_PRACTICE_ATTACK_TEAM: 21,
WORSHIP_BATTLE_TEAM: 22,
DIY_BATTLE_TEAM: 23,
TEAM_BATTLE_DEFENSE_TEAM: 24,
GUILD_BOSS_BATTLE_TEAM: 25,
DOUBLE_BATTLE_TEAM: 26,
PURSUIT_ATTACK_TEAM: 27,
ISLAND_BATTLE_DEFENSE_TEAM: 28,
ISLAND_BATTLE_ATTACK_TEAM: 29,
TIME_PEAK_ATTACK_TEAM: 30,
TOP_ARENA_3V3_ATTACK_TEAM: 31,
TOP_ARENA_3V3_DEFENSE_TEAM: 32,
ACTIVITY_GUILD_BATTLE_DEFENSE_TEAM: 33,
ACTIVITY_GUILD_BATTLE_ATTACK_TEAM: 34
};
F.getPreLoadInfos = function(e, a) {
var n = a ? t.isArray(a) ? a : [ a ] : [], i = t.chain(e).map(function(e) {
var a = o.role.findById(e);
a = a || o.mob.findById(e);
var n = t.uniq(a.skillIds.concat([ a.initSkillId ])), i = [], r = [];
for (var s in n) {
var l = "sound_effect_skill_" + n[s] + "_atk_mp3";
i.push(G[l] || null);
}
i.push(G["sound_effect_skill_" + a.classId + "_dead_mp3"] || null);
r.push(G["video_" + a.classId + "_mp4"] || null);
return {
sounds: i,
videos: r,
spAssets: [ G["armatures_character_" + a.classId + "$_skel"] || G["armatures_character_" + a.classId + "$_json"] || null, G["armatures_effect_" + a.classId + "$_skel"] || G["armatures_effect_" + a.classId + "$_json"] || null ]
};
}).value(), r = [], s = [], l = [];
for (var c in i) {
r = t.uniq(t.without(r.concat(i[c].sounds), null));
s = t.uniq(t.without(s.concat(i[c].videos), null));
l = t.uniq(t.without(l.concat(i[c].spAssets), null));
}
var d = [];
for (var c in r) d.push({
res: r[c],
type: cc.AudioClip
});
for (var c in s) d.push({
res: s[c],
type: cc.VideoClip
});
for (var c in l) d.push({
res: l[c],
type: sp.SkeletonData
});
for (var c in n) d.push({
res: G["battle_background_" + n[c] + "_jpg"],
type: cc.SpriteFrame
});
return d;
};
F.buildBattleTeam = function(e, a, n, i, r, s, c) {
r = r || {};
s = s || {};
c = c || 0;
var d = {
playerId: e,
roles: [],
ships: [],
skills: i || []
}, h = 0, m = 0, g = 0, p = 0;
a = a || [];
for (var _ in a) {
var k = a[_], f = o.findEntityById(k.kindId), y = {
kindId: k.kindId,
star: k.star,
level: k.level,
skill: {
kindId: f.skillId,
level: k.skillLevel
}
};
d.ships.push(y);
h += k.attr.hp;
m += k.attr.atk;
g += k.attr.def;
p += k.attr.mdef;
}
var b = u.STAR_SIGN.CONSTS.ATTR_NAME_SUIT_SKILL_IDS_MAP, v = [];
for (var S in b) t.include([ "skipHitRate", "hitReduceMpRate", "ignoreUnDeBuffRate" ], S) || v.push({
curId: 0,
ids: b[S]
});
for (var _ in n) {
var T = n[_];
T.awakeSkills = T.awakeSkills || {};
var M = l.clone(T.attr);
M.hp += h;
M.atk += m;
M.def += g;
M.mdef += p;
var $ = l.clone(M);
if (0 != $.hp) {
$.hp *= 1 + c;
$.atk *= 1 + c;
r[T.idx] && ($.maxHp = $.hp);
$.hp = null == r[T.idx] ? $.hp : r[T.idx];
$.mp = null == s[T.idx] ? T.mp : s[T.idx];
$.attr = M;
$.skills = t.values(l.clone(T.skills));
var I = T.equipments && T.equipments.starSignSkillId;
if (I) {
var C = t.find(v, function(e) {
return t.include(e.ids, I);
});
if (!C || !C.curId || C.curId < I) {
$.skills.push({
kindId: I,
level: 0
});
C && (C.curId = I);
}
}
$.awakeSkills = t.values(l.clone(T.awakeSkills));
$.kindId = T.kindId;
$.level = T.level;
$.star = T.star;
$.trainLevelMap = T.trainLevelMap;
$.awakeLevel = T.awakeLevel;
$.evolveSkillCount = T.evolveSkillIds ? T.evolveSkillIds.length : 0;
$.evolveSkillIds = T.evolveSkillIds || [];
$.idx = T.idx;
d.roles.push($);
}
}
d.roles = t.sortBy(d.roles, function(e) {
var a = o.findEntityById(e.kindId);
return a ? a.positionPriority : e.kindId;
});
return d;
};
F.buildBlessingSkills = function(e, a, n, i, r) {
r = r || {};
e = t.clone(e);
var s = [], o = [ 1131, 1132, 1133 ], l = 0;
t.each(e, function(e) {
tools.dataApi.blessing.findById(e).color >= 5 && l++;
});
var c = {
1: [ 1151, 1152, 1153 ],
2: [ 1161, 1162, 1163 ],
3: [ 1191, 1192, 1193 ],
4: [ 1201, 1202 ],
5: [ 1291, 1292 ]
}, d = {};
t.each(e, function(e) {
for (var a in c) {
d[a] = d[a] || 0;
t.include(c[a], e) && e > d[a] && (d[a] = e);
}
});
e = t.difference(e, t.flatten(t.values(c)));
for (var h in d) d[h] && e.push(d[h]);
for (var u in e) if ((y = tools.dataApi.blessing.findById(e[u])).skillId && !(t.include(o, y.kindId) && r.floor < 3) && 1391 != y.kindId && (1511 != y.kindId || 0 != r.recoverTimes)) if (1681 == y.kindId && t.include(e, 1691)) s.push({
kindId: 1682,
level: 1
}); else if (1691 == y.kindId && t.include(e, 1681)) s.push({
kindId: 1692,
level: 1
}); else if (t.include([ 1041, 1042, 1043, 1251, 1252, 1253 ], y.kindId) && a && n) {
var m = a[y.kindId], g = 0;
for (var u in n) n[u] > m && g++;
if (0 == g) continue;
g = g > 8 ? 8 : g;
var p = tools.dataApi.fightSkill.findById(y.skillId), _ = [];
for (h = 0; h < g; h++) _ = _.concat(p.buffIds);
s.push({
kindId: y.skillId,
level: 1,
buffIds: _
});
} else if (t.include([ 1321, 1322, 1323 ], y.kindId)) {
for (p = tools.dataApi.fightSkill.findById(y.skillId), _ = [], h = 0; h < l; h++) _ = _.concat(p.buffIds);
s.push({
kindId: y.skillId,
level: 1,
buffIds: _
});
} else t.include([ 1451, 1452, 1453 ], y.kindId) && null == i[0] && null == i[1] || s.push({
kindId: y.skillId,
level: 1
});
var k = t.filter(e, function(e) {
return 1391 == e;
}).length;
if ((k = k > 4 ? 4 : k) > 1) {
var f = {
2: [ 13911 ],
3: [ 13911, 13912 ],
4: [ 13911, 13912, 13913 ]
};
t.include(e, 1791) && (f = {
2: [ 13921 ],
3: [ 13921, 13922 ],
4: [ 13921, 13922, 13923 ]
});
var y = tools.dataApi.blessing.findById(1391);
s.push({
kindId: y.skillId,
buffIds: f[k]
});
}
return s;
};
F.cacheTeamsMd5 = function(e, a) {
F.teamsDataMd5 = r(JSON.stringify(e) + JSON.stringify(a));
};
F.checkTeamsMd5 = function(a, t) {
if (r(JSON.stringify(a) + JSON.stringify(t)) != F.teamsDataMd5 && !e("buildExt").isSkipCheckBattleData) {
B.sendError("战斗Teams作弊报错:" + Date.now());
s.addMessageBox(E.t("请勿作弊,不然封号!"), function() {
cc.game.end();
}, null, null, !0, !0);
return !1;
}
return !0;
};
F.cacheMobsDataMd5 = function(e) {
var a = "";
for (var t in e) {
var n = o.mobS.findById(e[t]);
n || (n = o.mob.findById(e[t]));
a += JSON.stringify(n);
}
F.mobsDataMd5 = r(a);
};
F.checkMobsDataMd5 = function(a) {
var t = "";
for (var n in a) {
var i = o.mobS.findById(a[n]);
i || (i = o.mob.findById(a[n]));
t += JSON.stringify(i);
}
if (r(t) != F.mobsDataMd5 && !e("buildExt").isSkipCheckBattleData) {
B.sendError("mob作弊报错:" + Date.now());
s.addMessageBox(E.t("请勿作弊,不然封号!"), function() {
cc.game.end();
}, null, null, !0, !0);
return !1;
}
return !0;
};
F.genData = function(a, n) {
n = n || {};
var i = m.player, r = i.id, s = B.clone(i.team.roles), l = i.bag.getItemByType(u.CONSTS.ENTITY_TYPE.SHIP);
if (R.hideRoleClassIds) for (var d in s) {
var g = o.findEntityById(s[d].kindId);
t.include(R.hideRoleClassIds, g.classId) && delete s[d];
}
if (R.hideShipClassIds) for (var d in l) {
g = o.findEntityById(l[d].kindId);
t.include(R.hideShipClassIds, g.classId) && delete l[d];
}
var p, _ = F.TYPE;
a == _.EXPEDITION_ATTACK_TEAM ? p = i.expedition.selfInfo : a == _.SIX_EXPEDITION_ATTACK_TEAM ? p = i.expedition.sixSelfInfo : a == _.TIME_PEAK_ATTACK_TEAM && (p = i.timePeak.selfInfo);
var k = null, f = null, y = null, b = [], v = null, S = [];
if (t.include([ _.ARENA_3V3_ATTACK_TEAM, _.ARENA_3V3_DEFENSE_TEAM, _.WORSHIP_BATTLE_TEAM, _.DIY_BATTLE_TEAM, _.DOUBLE_BATTLE_TEAM, _.TOP_ARENA_3V3_ATTACK_TEAM, _.TOP_ARENA_3V3_DEFENSE_TEAM ], a)) {
k = a + "_selectIdxsMap_" + r;
b = (y = n.selectIdxsMap || storage.getItem(k) || {})[n.selectTeamId] || b;
f = a + "_selectShipIdxsMap_" + r;
S = (v = n.selectShipIdxsMap || storage.getItem(f) || {})[n.selectTeamId] || S;
} else if (t.include([ _.PRACTICE_DEFENSE_TEAM, _.PRACTICE_ATTACK_TEAM, _.PRESTIGE_BATTLE_DEFENSE_TEAM, _.TEAM_BATTLE_DEFENSE_TEAM, _.PURSUIT_ATTACK_TEAM, _.ISLAND_BATTLE_DEFENSE_TEAM, _.ISLAND_BATTLE_ATTACK_TEAM ], a)) {
b = n.selectIdxs || b;
S = n.selectShipIdxs || S;
} else {
k = a + "_selectIdxs_" + r;
n.bmapId && (k += n.bmapId);
b = n.selectIdxs || storage.getItem(k) || b;
f = a + "_selectShipIdxs_" + r;
n.bmapId && (f += n.bmapId);
S = n.selectShipIdxs || storage.getItem(f) || S;
}
var T = [];
for (var d in b) s[$ = String(b[d])] || T.push($);
b = t.difference(b, T);
for (var M in y) {
T = [];
for (var d in y[M]) {
s[$ = String(y[M][d])] || T.push($);
d == y[M].lenth - 1 && (y[M] = t.difference(y[M], T));
}
}
T = [];
for (var d in S) l[$ = String(S[d])] || T.push($);
S = t.difference(S, T);
for (var M in v) {
T = [];
for (var d in v[M]) {
var $;
l[$ = String(v[M][d])] || T.push($);
d == v[M].lenth - 1 && (v[M] = t.difference(v[M], T));
}
}
var I = null;
n && n.smapId && !n.isEndless && !n.isPursuit && (I = o.smap.findById(n.smapId).bmapId);
var C = 1;
t.include([ _.ARENA_3V3_ATTACK_TEAM, _.ARENA_3V3_DEFENSE_TEAM, _.DOUBLE_BATTLE_TEAM, _.TOP_ARENA_3V3_ATTACK_TEAM, _.TOP_ARENA_3V3_DEFENSE_TEAM ], a) ? C = 3 : t.include([ _.WORSHIP_BATTLE_TEAM ], a) && (C = 5);
C = n.teamCount || C;
var P = [], D = [];
for (var N in i.endless.pursuitTeamMap) {
var A = i.endless.pursuitTeamMap[N];
if (N != n.bmapId) {
P = P.concat(A.teamIndexs);
D = D.concat(A.shipIndexs);
}
}
var L = [];
for (var d in s) {
var w = s[d], G = H.genData(w);
if (!I || 303 != I || t.include(h.CONSTS.FEMALE_CLASS_IDS, G._data.classId)) {
if (t.include([ _.EXPEDITION_ATTACK_TEAM, _.SIX_EXPEDITION_ATTACK_TEAM ], a)) {
G.hpPct = null == p.hpMap[d] ? s[d].attr.hp : p.hpMap[d] / s[d].attr.hp;
G.mpPct = null == p.mpMap[d] ? s[d].attr.mp : p.mpMap[d] / c.MAX_MP;
0 == G.hpPct && (b = t.without(b, d));
}
if (t.include([ _.TIME_PEAK_ATTACK_TEAM ], a)) {
G.hpPct = (null == p.hpMap[w.idx] ? w.attr.hp : p.hpMap[w.idx]) / w.attr.hp;
G.mpPct = null == p.mpMap[w.idx] ? 0 : p.mpMap[w.idx] / c.MAX_MP;
0 == G.hpPct && (b = t.without(b, d));
}
a == _.PRACTICE_DEFENSE_TEAM && t.include(i.practice.allDefenseTeamIndexs, s[d].idx) && (G.isDefenseUsed = !0);
a == _.PRACTICE_ATTACK_TEAM && t.include(i.practice.usedTeamIndexs, s[d].idx) && (G.isAttackUsed = !0);
a == _.PRESTIGE_BATTLE_DEFENSE_TEAM && t.include(i.extra.prestigeBattle.defenseTeamIndexs, s[d].idx) && (G.isDefenseUsed = !0);
a == _.TEAM_BATTLE_DEFENSE_TEAM && t.include(i.extra.teamBattle.defenseTeamIndexs, s[d].idx) && (G.isDefenseUsed = !0);
a == _.PURSUIT_ATTACK_TEAM && t.include(P, s[d].idx) && (G.isDefenseUsed = !0);
if (t.include([ _.ISLAND_BATTLE_DEFENSE_TEAM, _.ISLAND_BATTLE_ATTACK_TEAM ], a)) {
t.include(i.island.defenseTeamIndexs.concat(i.island.helpTeamIndexs), s[d].idx) && (G.isDefenseUsed = !0);
var K = i.island.teamIdxUnLockTimeMap[s[d].idx] || 0;
Date.now() < K && (G.isDead = !0);
var V = u.ISLAND.FUNS.getAreaId(i.level), O = u.ISLAND.CONSTS.AREA_NEED_ROLE_LEVEL_MAP[V];
if (s[d].level < O) {
b = t.without(b, d);
continue;
}
}
var U = new Date(Date._now()).getDay();
if (a != _.EYE_TEAM || t.include(u.EYE.CONSTS.DAY_ROLE_CLASS_IDS_MAP[U], G._data.classId)) if (!n.isEndless || n.isMain || t.include(u.MAP.CONSTS.ENDLESS_DAY_ROLE_CLASS_IDS_MAP[U], G._data.classId)) {
Y = 0 == (Y = i.endless.fruitMapUseRolesNo % 5) ? 5 : Y;
var W = u.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP[Y];
if (!n.isFruitMap || t.include(W, G._data.classId)) {
var Y;
Y = 0 == (Y = i.endless.starSignMapUseRolesNo % 5) ? 5 : Y;
W = u.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP[Y];
if (!n.isStarSignMap || t.include(W, G._data.classId)) if (a != _.SMAP_BATTLE_ATTACK_TEAM || n.mapType != u.MAP.CONSTS.TYPE.SIX || t.include(u.SIX_SMAP.CONSTS.DAY_ROLE_CLASS_IDS_MAP[U], G._data.classId)) if (!t.include([ _.SIX_PRACTICE_ATTACK_TEAM, _.SIX_PRACTICE_DEFENSE_TEAM ], a) || t.include(u.SIX_SMAP.CONSTS.DAY_ROLE_CLASS_IDS_MAP[U], G._data.classId)) {
if (a == _.WORLD_BOSS_BATTLE_TEAM) {
if (!t.include(u.WORLD_BOSS.CONSTS.ALLOW_CLASS_IDS, G._data.classId)) continue;
if (t.include(i.extra.worldBoss.openInfo.attackTeamIndexs, s[d].idx)) {
G.hpPct = 0;
b = t.without(b, d);
}
}
if (a == _.GUILD_BOSS_BATTLE_TEAM && t.include(i.extra.guildBoss.openInfo.attackTeamIndexs, s[d].idx)) {
G.hpPct = 0;
b = t.without(b, d);
}
a != _.DOUBLE_BATTLE_TEAM || t.include(u.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP[n.themeNo], G._data.classId) ? L.push(G) : b = t.without(b, d);
} else b = t.without(b, d); else b = t.without(b, d); else b = t.without(b, d);
} else b = t.without(b, d);
} else b = t.without(b, d); else b = t.without(b, d);
} else b = t.without(b, d);
}
L = t.sortBy(L, function(e) {
return -e._role.power;
});
t.each(L, function(e, a) {
L[a].index = a;
});
var j = [];
for (var d in b) {
G = H.genData(s[b[d]]);
j.push(G);
}
var q = 0;
j = t.sortBy(j, function(e) {
q += e._role.power;
return -e._data.positionPriority;
});
var X = null;
if (n.defenseTeam && n.defenseTeam.rolesMap) {
X = {};
for (var M in n.defenseTeam.rolesMap) {
for (var d in n.defenseTeam.rolesMap[M]) {
w = n.defenseTeam.rolesMap[M][d];
X[M] = X[M] || [];
X[M].push(H.genData(w));
}
X[M] = t.sortBy(X[M], function(e) {
return e._data.positionPriority;
});
}
}
var z = [];
for (var d in l) {
var J = e("shipItem").genData(l[d]);
a == _.PRACTICE_DEFENSE_TEAM && t.include(i.practice.allDefenseShipIndexs, l[d].idx) && (J.isDefenseUsed = !0);
a == _.PRACTICE_ATTACK_TEAM && t.include(i.practice.usedShipIndexs, l[d].idx) && (J.isAttackUsed = !0);
a == _.PRESTIGE_BATTLE_DEFENSE_TEAM && t.include(i.extra.prestigeBattle.defenseShipIndexs, l[d].idx) && (J.isDefenseUsed = !0);
t.include([ _.ISLAND_BATTLE_DEFENSE_TEAM, _.ISLAND_BATTLE_ATTACK_TEAM ], a) && t.include(i.island.defenseShipIndexs.concat(i.island.helpShipIndexs), l[d].idx) && (J.isDefenseUsed = !0);
if (a == _.WORLD_BOSS_BATTLE_TEAM && t.include(i.extra.worldBoss.openInfo.attackShipIndexs, l[d].idx)) {
J.isDefenseUsed = !0;
S = t.without(S, d);
}
if (a == _.GUILD_BOSS_BATTLE_TEAM && t.include(i.extra.guildBoss.openInfo.attackShipIndexs, l[d].idx)) {
J.isDefenseUsed = !0;
S = t.without(S, d);
}
a == _.PURSUIT_ATTACK_TEAM && t.include(D, l[d].idx) && (J.isDefenseUsed = !0);
z.push(J);
}
var Z = [];
for (var d in S) {
J = e("shipItem").genData(l[S[d]]);
Z.push(J);
}
Z = t.sortBy(Z, function(e) {
q += e._item.power;
return e._data.classId;
});
var Q = null;
if (n.defenseTeam && n.defenseTeam.shipsMap) {
Q = {};
for (var M in n.defenseTeam.shipsMap) {
for (var d in n.defenseTeam.shipsMap[M]) {
var ee = n.defenseTeam.shipsMap[M][d];
Q[M] = Q[M] || [];
Q[M].push(x.genData(ee));
}
Q[M] = t.sortBy(Q[M], function(e) {
return e._data.classId;
});
}
}
var ae = null;
if (N) {
switch (N) {
case 301:
case 502:
ae = E.t("建议选择魔法伤害的战士");
break;

case 503:
case 302:
ae = E.t("建议选择物理伤害的战士");
break;

case 303:
ae = E.t("必须选择SS战士");
}
var te = o.bmap.findById(N);
t.include([ 4, 5 ], te.type) && 0 == L.length && (ae = E.t("暂无符合条件的战士"));
}
switch (a) {
case _.EYE_TEAM:
case _.WORLD_BOSS_BATTLE_TEAM:
case _.SIX_PRACTICE_DEFENSE_TEAM:
case _.DOUBLE_BATTLE_TEAM:
ae = E.t("必须上阵指定的战士");
0 == L.length && (ae = E.t("暂无符合条件的战士"));
}
var ne = [];
switch (a) {
case _.TIME_PEAK_ATTACK_TEAM:
ne = i.timePeak.blessingIds;
}
return {
type: a,
SELECT_IDXS_KEY: k,
SELECT_SHIP_IDXS_KEY: f,
selectIdxs: b,
selectIdxsMap: y,
selectShipIdxs: S,
selectShipIdxsMap: v,
hintStr: ae,
teamCount: C,
selectRoleItems: j,
roleItems: L,
totalPower: q,
defenseRoleItemsMap: X,
selectShipItems: Z,
shipItems: z,
defenseShipItemsMap: Q,
blessingIds: ne
};
};
F.cacheRoleItemNodeMap = {};
cc._RF.pop();
}, {
activityGuildBattleHandler: "activityGuildBattleHandler",
allServerBattleHandler: "allServerBattleHandler",
arena3v3Handler: "arena3v3Handler",
arenaHandler: "arenaHandler",
async: "async",
base64: "base64",
baseView: "baseView",
"battle.consts": "battle.consts",
battleMain: "battleMain",
battleScene: "battleScene",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
doubleBattleHandler: "doubleBattleHandler",
endlessHandler: "endlessHandler",
eyeHandler: "eyeHandler",
guide: "guide",
guildBossHandler: "guildBossHandler",
helper: "helper",
http: "http",
i18n: "i18n",
islandHandler: "islandHandler",
md5: "md5",
newGuildBattleHandler: "newGuildBattleHandler",
practiceHandler: "practiceHandler",
prestigeBattleHandler: "prestigeBattleHandler",
querystring: "querystring",
resource: "resource",
roleItem: "roleItem",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipItem: "shipItem",
sixPracticeHandler: "sixPracticeHandler",
smapHandler: "smapHandler",
soundApi: "soundApi",
soundComponent: "soundComponent",
tailHandler: "tailHandler",
teamBattleHandler: "teamBattleHandler",
topArena3v3Handler: "topArena3v3Handler",
underscore: "underscore",
util: "util",
worldBossHandler: "worldBossHandler",
worshipBattleHandler: "worshipBattleHandler"
} ],
