worshipBattleScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "d4291VV7EZI7opJcZG5o/uY", "worshipBattleScene");
var t = e("underscore"), n = (e("http"), e("dataApi")), i = e("buildExt"), r = e("baseView"), s = e("soundApi"), o = e("resource"), l = e("worshipBattleHandler"), c = (e("clientConfig"), 
e("serverConfig")), d = e("serverMain"), h = e("i18n"), u = e("helper"), m = e("selectBattleRolesScene"), g = (o = e("resource"), 
e("itemItem"), e("roleItem"), e("shipItem"), e("playerItem"), e("rulePanel")), p = e("arena3v3Scene"), _ = e("sceneManager"), k = c.WORSHIP_BATTLE.CONSTS, f = (c.WORSHIP_BATTLE.FUNS, 
cc.Class({
extends: cc.Component,
properties: {
worshipRankBt: cc.Node,
worshipNode: cc.Node,
levelNodeLayout: cc.Node,
viewTeamBt: cc.Node,
shopBt: cc.Node,
battleNode: cc.Node,
battleTitleLabel: cc.Label,
battleLeftBt: cc.Node,
battleRightBt: cc.Node,
battleLeftNode: cc.Node,
battleRightNode: cc.Node,
battle1v1Node: cc.Node,
battleLevelTypeBts: [ cc.Node ],
battleTypeBts: [ cc.Node ],
battleBetBt: cc.Node,
battleDotBgNode: cc.Node,
betPanel: cc.Node,
betLeftBt: cc.Node,
betRightBt: cc.Node,
betTitleLabel: cc.Label,
betItem: cc.Node,
betLayout: cc.Node
},
onLoad: function() {
_.curSceneStatusData = t.extend({
isEnter: !1,
selectRankId: null,
selectLevelType: null,
selectBattleType: null,
selectBetRankId: null
}, _.curSceneStatusData);
this.statusData = _.curSceneStatusData;
this.battleNode.active = !1;
this.shopBt.active = !!c.SHOP.CONSTS.TYPE.SIX_PATH;
this.betPanel.active = !1;
this.betItem.active = !1;
this.worshipRankBt.active = !i.isHideRankBt;
this.update_();
this.updateBattle_();
s.playMusic(o.sound_music_worship_battle_mp3);
},
update_: function() {
var e = f.genData();
this.data = e;
if (!this.statusData.isEnter) {
this.viewTeamBt.active = !!e.isApply;
this.worshipRankBt.active = this.worshipRankBt.active && e.status != k.STATUS.WAIT_BE_4;
for (var a in k.LEVEL_TYPE_BETWEEN) {
var t = this.levelNodeLayout.getChildByName("level_node_item_" + (Number(a) + 1)), i = k.LEVEL_BETWEEN[a], s = k.LEVEL_TYPE_BETWEEN[a];
t.getChildByName("name_label").getComponent(cc.Label).string = e.levelNames[a];
var o = t.getChildByName("level_label").getComponent(cc.Label);
u.replaceLabel(o, s.split("_").slice(1));
var l = e.playerInfoMap[s], c = t.getChildByName("info_bg_sp");
c.active = !!l;
if (c.active) {
c.getChildByName("name_label").getComponent(cc.Label).string = l.playerName;
c.getChildByName("server_label").getComponent(cc.Label).string = h.t("$1区", [ l.serverId ]);
c.getChildByName("level_label").getComponent(cc.Label).string = h.t("LV.$1", [ l.playerLevel ]);
}
var d = t.getChildByName("armature_node");
d.active = !!l;
if (d.active) {
var m = n.role.findOneBy("imgId", l.playerPhotoInfo.photoImgId), g = m ? m.classId : 1, p = d.characterNode;
if (p && p.getComponent("characterArmatureComponent").data.classId != g) {
p.destroy();
p = null;
}
if (!p && g) {
(p = r.getCharacterNode(g)).parent = d;
p.idx = a;
p.getComponent("characterArmatureComponent").setTitle_(l.playerPhotoInfo.titleImgId);
d.characterNode = p;
}
d.data = {
levelType: s
};
}
var _ = t.getChildByName("apply_bt");
_.active = e.battlefieldLevel == i;
var y = t.getChildByName("status_sp");
y.active = e.battlefieldLevel == i;
if (_.active) {
_.active = !e.isApply && e.status == k.STATUS.APPLY;
y.active = e.isApply;
}
var b = t.getChildByName("worship_bt");
b.data = {
levelType: s
};
b.getComponent(cc.Button).interactable = !e.worshipStatueMap[s];
b.getChildByName("spine").getComponent(sp.Skeleton).setAnimation(0, e.worshipStatueMap[s] ? "action_2" : "action_1", !0);
}
}
},
onViewMyTeam_: function() {
r.addLoading();
l.getMyTeam(function(e) {
r.addViewBattleTeamPanel(e._temp.team);
});
},
onViewChampionTeam_: function(e) {
var a = e.target.data;
r.addLoading();
l.getChampionTeam(a.levelType, function(e) {
r.addViewBattleTeamPanel(e._temp.team);
});
},
onShop_: function() {
_.pushScene(_.NAME.SHOP_SCENE, {
type: c.SHOP.CONSTS.TYPE.SIX_PATH
});
},
onRule_: function() {
r.addRulePanel(g.TYPE.WORSHIP_BATTLE, {
battlefieldType: this.data.battlefieldType
});
},
onApply_: function() {
d.player.level < k.LEVEL_BETWEEN[0] ? r.addHintPanel(h.t("开启等级:$1", k.LEVEL_BETWEEN[0])) : _.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.WORSHIP_BATTLE_TEAM,
opts: {
selectTeamId: 1
}
});
},
onWorship_: function(e) {
var a = e.target, t = a.data;
r.addLoading();
l.worshipStatue(t.levelType, function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap);
a.getComponent(cc.Button).interactable = !1;
a.getChildByName("spine").getComponent(sp.Skeleton).setAnimation(0, "action_2", !0);
});
},
onWorshipRank_: function() {
var a = e("worshipRankPanel");
r.addWorshipRankPanel(a.RANK_TYPE.WORSHIP_BATTLE);
},
onEnterBattle_: function() {
var e = this;
r.addLoading();
l.battleInfo(function(a) {
d.player.extra.worshipBattle.battleInfo = a._temp.battleInfo;
e.statusData.isEnter = !0;
e.update_();
e.updateBattle_();
});
},
onExitBattle_: function() {
if (this.battleNode.active) {
this.statusData.isEnter = !1;
this.update_();
this.updateBattle_();
}
},
updateBattle_: function() {
this.battleNode.active = this.statusData.isEnter;
this.worshipNode.active = !this.battleNode.active;
r.getBackNode().node.active = !this.battleNode.active;
if (this.statusData.isEnter) {
var e = f.genBattleData(this.statusData.selectRankId, this.statusData.selectLevelType, this.statusData.selectBattleType);
this.battleData = e;
this.statusData.selectLevelType = e.selectLevelType;
this.statusData.selectBattleType = e.selectBattleType;
this.battleTitleLabel.string = e.statusTitleMap[e.battleInfo.status];
this.battleBetBt.active = e.battleInfo.status == k.STATUS.WAIT_BE_4;
this.battleBetBt.data = {
type: this.statusData.selectLevelType
};
var a = [], n = [];
a.push(this.battleLeftNode.getChildByName("group_1_node"));
a.push(this.battleLeftNode.getChildByName("group_2_node"));
a.push(this.battleRightNode.getChildByName("group_1_node"));
a.push(this.battleRightNode.getChildByName("group_2_node"));
n.push(this.battleLeftNode.getChildByName("win_node"));
n.push(this.battleRightNode.getChildByName("win_node"));
this.battle1v1Node.active = !1;
(h = this.battle1v1Node.getChildByName("player_item_sp")).playerItem = h.getChildByName("player_item");
h.infoBgNode = h.getChildByName("info_bg_node");
h.titleBgSp = h.getChildByName("title_bg_sp");
h.outSp = h.getChildByName("out_sp");
h.meSp = h.getChildByName("me_sp");
h.playerItem.active = !1;
h.infoBgNode.active = !1;
h.titleBgSp.active = !1;
h.outSp.active = !1;
h.meSp.active = !1;
this.playerItemSp = h;
var i = [], s = a.concat(n);
for (var o in s) {
var l;
(l = s[o].getChildByName("player_item_sp")) && i.push(l);
(l = s[o].getChildByName("player_item_1_sp")) && i.push(l);
(l = s[o].getChildByName("player_item_2_sp")) && i.push(l);
var c = s[o].getChildByName("line_sp");
c && (c.active = !1);
var d = s[o].getChildByName("play_bt");
d && (d.active = !1);
}
for (var o in i) {
var h, m = (h = i[o]).getChildByName("player_item");
if (!m) {
(m = cc.instantiate(this.playerItemSp.playerItem)).parent = h;
h.playerItem = m;
}
m.active = !1;
var g = h.getChildByName("info_bg_node");
if (!g) {
(g = cc.instantiate(this.playerItemSp.infoBgNode)).parent = h;
h.infoBgNode = g;
}
g.active = !1;
var p = h.getChildByName("title_bg_sp");
if (!p) {
(p = cc.instantiate(this.playerItemSp.titleBgSp)).parent = h;
h.titleBgSp = p;
}
p.active = !1;
var _ = h.getChildByName("out_sp");
if (!_) {
(_ = cc.instantiate(this.playerItemSp.outSp)).parent = h;
h.outSp = _;
}
_.active = !1;
var y = h.getChildByName("me_sp");
if (!y) {
(y = cc.instantiate(this.playerItemSp.meSp)).parent = h;
h.meSp = y;
}
y.active = !1;
}
t.each(n, function(e) {
e.active = !1;
});
switch (e.selectBattleType) {
case "show32":
t.include([ k.STATUS.WAIT_APPLY, k.STATUS.WAIT_BE_16, k.STATUS.WAIT_BE_8, k.STATUS.WAIT_BE_4 ], e.battleInfo.status) ? this.show32_8_(a, n) : e.pageCount = 1;
break;

case "show16":
t.include([ k.STATUS.WAIT_APPLY, k.STATUS.WAIT_BE_8, k.STATUS.WAIT_BE_4 ], e.battleInfo.status) ? this.show32_8_(a, n) : e.pageCount = 1;
break;

case "show8":
t.include([ k.STATUS.WAIT_APPLY, k.STATUS.WAIT_BE_4 ], e.battleInfo.status) ? this.show32_8_(a, n) : e.pageCount = 1;
break;

case "show4":
t.include([ k.STATUS.WAIT_APPLY ], e.battleInfo.status) && this.show8_1_(a, n);
}
for (var o in this.battleLevelTypeBts) {
(T = this.battleLevelTypeBts[o]).data = {
type: k.LEVEL_TYPE_BETWEEN[o]
};
var b = e.selectLevelType == T.data.type;
T.getComponent(cc.Button).interactable = !b;
T.getChildByName("name_label").getComponent(cc.Label).string = this.data.levelNames[o];
var v = T.getChildByName("level_label").getComponent(cc.Label);
u.replaceLabel(v, T.data.type.split("_").slice(1));
}
var S = [ "show32", "show16", "show8", "show4" ];
for (var o in this.battleTypeBts) {
var T;
(T = this.battleTypeBts[o]).data = {
type: S[o]
};
b = e.selectBattleType == T.data.type;
T.getComponent(cc.Button).interactable = !b;
}
this.battleLeftBt.active = e.selectRankId > 1;
this.battleRightBt.active = e.selectRankId < e.pageCount;
for (o = 0; o < e.pageCount; o++) {
var M = o + 1;
this.battleDotBgNode.getChildByName("dot_" + M + "_sp").getChildByName("select_sp").active = M == e.selectRankId;
}
this.battleDotBgNode.active = e.pageCount > 1;
}
},
show32_8_: function(e, a) {
var n = this.battleData, i = n.battleInfo.be32GroupInfoMap[n.selectLevelType], r = n.battleInfo.pre8PlayerIdsMap[n.selectLevelType] || [], s = {};
if (i) for (var o = 0, l = 4 * (n.selectRankId - 1) + 1, c = l; c < l + 4; c++) {
var u = i[c], m = [ e[o].getChildByName("player_item_1_sp"), e[o].getChildByName("player_item_2_sp") ];
for (var g in m) {
var p = u.players[g], _ = m[g];
s[Math.ceil(c / 2) + "_" + p.id] = _;
(b = _.getChildByName("player_item")).active = !0;
b.getComponent("playerItem").update_(p.attr.playerPhotoInfo);
b.data = {
playerId: p.id
};
b.getComponent("playerItem").setClickEvent_(this.node, "worshipBattleScene", "onBattleViewTeam_");
(v = _.getChildByName("info_bg_node")).active = !0;
v.getChildByName("name_label").getComponent(cc.Label).string = p.attr.playerName;
v.getChildByName("server_label").getComponent(cc.Label).string = h.t("$1区", [ p.attr.serverId ]);
v.getChildByName("level_label").getComponent(cc.Label).string = h.t("LV.$1", [ p.attr.playerLevel ]);
(S = _.getChildByName("title_bg_sp")).active = !0;
S.getChildByName("label").getComponent(cc.Label).string = t.include(r, Number(p.id)) ? h.t("上届8强") : h.t("新人");
if ("show32" != n.selectBattleType && t.include([ k.STATUS.WAIT_BE_8, k.STATUS.WAIT_BE_4, k.STATUS.WAIT_APPLY ], n.battleInfo.status)) {
_.getChildByName("out_sp").active = p.id != u.winPlayerId;
e[o].getChildByName("line_sp").active = !!u.reportId;
(T = e[o].getChildByName("play_bt")).active = !!u.reportId;
T.data = {
reportId: u.reportId
};
}
_.getChildByName("me_sp").active = p.id == d.player.id;
}
o++;
}
var f = n.battleInfo.be16GroupInfoMap[n.selectLevelType], y = n.battleInfo.be8GroupInfoMap[n.selectLevelType];
if (y && "show8" == n.selectBattleType && t.include([ k.STATUS.WAIT_BE_4, k.STATUS.WAIT_APPLY ], n.battleInfo.status)) {
t.each(a, function(e) {
e.active = !0;
});
u = y[n.selectRankId], m = [ a[0].getChildByName("player_item_sp"), a[1].getChildByName("player_item_sp") ];
for (var o in m) {
var b, v, S, T;
p = u.players[o];
(b = (_ = m[o]).getChildByName("player_item")).active = !0;
b.getComponent("playerItem").update_(p.attr.playerPhotoInfo);
b.data = {
playerId: p.id
};
b.getComponent("playerItem").setClickEvent_(this.node, "worshipBattleScene", "onBattleViewTeam_");
(v = _.getChildByName("info_bg_node")).active = !0;
v.getChildByName("name_label").getComponent(cc.Label).string = p.attr.playerName;
v.getChildByName("server_label").getComponent(cc.Label).string = h.t("$1区", [ p.attr.serverId ]);
v.getChildByName("level_label").getComponent(cc.Label).string = h.t("LV.$1", [ p.attr.playerLevel ]);
(S = _.getChildByName("title_bg_sp")).active = !0;
S.getChildByName("label").getComponent(cc.Label).string = t.include(r, Number(p.id)) ? h.t("上届8强") : h.t("新人");
a[o].getChildByName("line_sp").active = !0;
(T = a[o].getChildByName("play_bt")).active = !0;
T.data = {
reportId: f[2 * n.selectRankId - 1 + Number(o)].reportId
};
_.getChildByName("me_sp").active = !1;
}
var M = [];
for (var c in f) M.push(c + "_" + f[c].winPlayerId);
for (var $ in s) s[$].getChildByName("out_sp").active = !t.include(M, $);
}
},
show8_1_: function(e, a) {
var n = this.battleData, i = n.battleInfo.be8GroupInfoMap[n.selectLevelType], r = n.battleInfo.pre8PlayerIdsMap[n.selectLevelType] || [], s = {};
if (i && n.battleInfo.status == k.STATUS.WAIT_APPLY) for (var o = 0, l = 1; l < 5; l++) {
var c = i[l], m = [ e[o].getChildByName("player_item_1_sp"), e[o].getChildByName("player_item_2_sp") ];
for (var g in m) {
var p = c.players[g], _ = m[g];
s[p.id] = _;
(T = _.getChildByName("player_item")).active = !0;
T.getComponent("playerItem").update_(p.attr.playerPhotoInfo);
T.data = {
playerId: p.id
};
T.getComponent("playerItem").setClickEvent_(this.node, "worshipBattleScene", "onBattleViewTeam_");
(M = _.getChildByName("info_bg_node")).active = !0;
M.getChildByName("name_label").getComponent(cc.Label).string = p.attr.playerName;
M.getChildByName("server_label").getComponent(cc.Label).string = h.t("$1区", [ p.attr.serverId ]);
M.getChildByName("level_label").getComponent(cc.Label).string = h.t("LV.$1", [ p.attr.playerLevel ]);
($ = _.getChildByName("title_bg_sp")).active = !0;
$.getChildByName("label").getComponent(cc.Label).string = t.include(r, Number(p.id)) ? h.t("上届8强") : h.t("新人");
if (n.battleInfo.status == k.STATUS.WAIT_APPLY) {
_.getChildByName("out_sp").active = p.id != c.winPlayerId;
e[o].getChildByName("line_sp").active = !!c.reportId;
(I = e[o].getChildByName("play_bt")).active = !!c.reportId;
I.data = {
reportId: c.reportId
};
}
_.getChildByName("me_sp").active = p.id == d.player.id;
}
o++;
}
var f, y = n.battleInfo.be4GroupInfoMap[n.selectLevelType], b = n.battleInfo.be2GroupInfoMap[n.selectLevelType];
if (y && t.include([ k.STATUS.WAIT_APPLY ], n.battleInfo.status)) {
t.each(a, function(e) {
e.active = !0;
});
c = b[1], m = [ a[0].getChildByName("player_item_sp"), a[1].getChildByName("player_item_sp") ];
for (var o in m) {
p = c.players[o];
(T = (_ = m[o]).getChildByName("player_item")).active = !0;
T.getComponent("playerItem").update_(p.attr.playerPhotoInfo);
T.data = {
playerId: p.id
};
T.getComponent("playerItem").setClickEvent_(this.node, "worshipBattleScene", "onBattleViewTeam_");
(M = _.getChildByName("info_bg_node")).active = !0;
M.getChildByName("name_label").getComponent(cc.Label).string = p.attr.playerName;
u.replaceLabel(M.getChildByName("server_label").getComponent(cc.Label), [ p.attr.serverId ]);
u.replaceLabel(M.getChildByName("level_label").getComponent(cc.Label), [ p.attr.playerLevel ]);
($ = _.getChildByName("title_bg_sp")).active = !0;
$.getChildByName("label").getComponent(cc.Label).string = t.include(r, Number(p.id)) ? h.t("上届8强") : h.t("新人");
a[o].getChildByName("line_sp").active = !0;
(I = a[o].getChildByName("play_bt")).active = !0;
I.data = {
reportId: y[Number(o) + 1].reportId
};
_.getChildByName("me_sp").active = !1;
p.id != c.winPlayerId && (f = _);
}
var v = [];
for (var l in y) v.push(y[l].winPlayerId);
for (var S in s) s[S].getChildByName("out_sp").active = !t.include(v, Number(S));
}
if (b) {
var T, M, $, I;
c = b[1], p = t.find(c.players, function(e) {
return e.id == c.winPlayerId;
});
this.battle1v1Node.active = !0;
(T = (_ = this.battle1v1Node.getChildByName("player_item_sp")).getChildByName("player_item")).active = !0;
T.getComponent("playerItem").update_(p.attr.playerPhotoInfo);
T.data = {
playerId: p.id
};
T.getComponent("playerItem").setClickEvent_(this.node, "worshipBattleScene", "onBattleViewTeam_");
(M = _.getChildByName("info_bg_node")).active = !0;
M.getChildByName("name_label").getComponent(cc.Label).string = p.attr.playerName;
u.replaceLabel(M.getChildByName("server_label").getComponent(cc.Label), [ p.attr.serverId ]);
u.replaceLabel(M.getChildByName("level_label").getComponent(cc.Label), [ p.attr.playerLevel ]);
($ = _.getChildByName("title_bg_sp")).active = !0;
$.getChildByName("label").getComponent(cc.Label).string = t.include(r, Number(p.id)) ? h.t("上届8强") : h.t("新人");
_.getChildByName("me_sp").active = p.id == d.player.id;
f && (f.getChildByName("out_sp").active = !0);
(I = this.battle1v1Node.getChildByName("play_bt")).active = !0;
I.data = {
reportId: b[1].reportId
};
}
},
onBattleViewTeam_: function(e) {
var a = e.target.data;
r.addLoading();
l.getTeam(a.playerId, function(e) {
r.addViewBattleTeamPanel(e._temp.team);
});
},
onBattlePlay_: p.prototype.onPlay_,
onSwitch_: function(e, a) {
this.statusData.selectRankId = this.statusData.selectRankId + Number(a);
this.updateBattle_();
},
onLevelType_: function(e) {
var a = e.target.data;
if (this.statusData.selectLevelType != a.type) {
this.statusData.selectLevelType = a.type;
this.statusData.selectRankId = 1;
this.updateBattle_();
}
},
onBattleType_: function(e) {
var a = e.target.data;
if (this.statusData.selectBattleType != a.type) {
this.statusData.selectBattleType = a.type;
this.statusData.selectRankId = 1;
this.updateBattle_();
}
},
onBet_: function() {
r.addPanel(this.betPanel);
var e = f.genBetPanelData(this.statusData.selectBetRankId, this.statusData.selectBetRankId ? null : this.statusData.selectLevelType);
this.statusData.selectBetRankId = e.selectBetRankId;
this.betPanelData = e;
var a = this.data.levelNames[this.statusData.selectBetRankId - 1] || "";
u.replaceLabel(this.betTitleLabel, [ a ]);
this.betLeftBt.active = e.selectBetRankId > 1;
this.betRightBt.active = e.selectBetRankId < e.pageCount;
this.betItemMap = this.betItemMap || {};
r.preHideNodeMap(this.betItemMap);
for (var n in e.playerInfos) {
var i = this.betItemMap[n];
if (!i) {
(i = cc.instantiate(this.betItem)).parent = this.betLayout;
i.idx = n;
this.betItemMap[n] = i;
}
i.active = !0;
r.markHideNode(i);
var s = e.playerInfos[n], o = i.getChildByName("info_bg_node");
o.getChildByName("name_label").getComponent(cc.Label).string = s.playerName;
o.getChildByName("server_label").getComponent(cc.Label).string = h.t("$1区", [ s.serverId ]);
o.getChildByName("level_label").getComponent(cc.Label).string = h.t("LV.$1", [ s.playerLevel ]);
o.getChildByName("player_item").getComponent("playerItem").update_(s.playerPhotoInfo);
i.getChildByName("title_bg_sp").getChildByName("label").getComponent(cc.Label).string = t.include(e.pre8PlayerIds, Number(s.playerId)) ? h.t("上届8强") : h.t("新人");
i.getChildByName("bet_count_layout").getChildByName("value_label").getComponent(cc.Label).string = e.betTargetCountMap[s.playerId] || 0;
var l = i.getChildByName("bet_bt");
l.active = !e.betTargetId;
l.data = {
playerId: s.playerId
};
l.getChildByName("cost_label").getComponent(cc.Label).string = k.BET_COST_GEM;
i.getChildByName("beted_bt").active = e.betTargetId && e.betTargetId == s.playerId;
i.getChildByName("view_bt").data = {
playerId: s.playerId
};
}
r.hideNodeMap(this.betItemMap);
},
onCloseBet_: function() {
r.removePanel(this.betPanel);
},
onBetSwitch_: function(e, a) {
this.statusData.selectBetRankId = this.statusData.selectBetRankId + Number(a);
this.onBet_();
},
onBetTarget_: function(e) {
var a = e.target.data, t = this;
r.addLoading();
l.bet(t.betPanelData.type, a.playerId, function() {
d.player.extra.worshipBattle.battleInfo.betTargetIdMap[t.betPanelData.type] = a.playerId;
t.onBet_();
});
}
}));
f.genData = function() {
var e = d.player, a = e.extra.worshipBattle, t = a.openInfo, n = a.playerInfoMap, i = e.worshipStatueExtMap, r = c.FUNS.getValueByBetween(k.LEVEL_BETWEEN, k.LEVEL_BETWEEN, e.level), s = c.FUNS.getValueByBetween(k.LEVEL_BETWEEN, k.LEVEL_TYPE_BETWEEN, e.level), o = [ h.t("地球王争霸"), h.t("魔界王争霸"), h.t("仙界王争霸"), h.t("星际王争霸"), h.t("宇宙王争霸") ];
if (t.status == k.STATUS.WAIT_BE_4) for (var l in n) n[l] = null;
return {
battlefieldLevel: r,
battlefieldType: s,
isApply: t.isApply,
status: t.status,
playerInfoMap: n,
worshipStatueMap: i,
levelNames: o
};
};
f.genBattleData = function(e, a, n) {
var i, r, s = d.player, o = s.extra.worshipBattle.battleInfo, l = a || c.FUNS.getValueByBetween(k.LEVEL_BETWEEN, k.LEVEL_TYPE_BETWEEN, s.level);
switch (o.status) {
case k.STATUS.WAIT_APPLY:
i = "show4";
break;

case k.STATUS.APPLY:
case k.STATUS.WAIT_BE_32:
case k.STATUS.WAIT_BE_16:
i = "show32";
break;

case k.STATUS.WAIT_BE_8:
i = "show16";
break;

case k.STATUS.WAIT_BE_4:
i = "show8";
}
0 == t.keys(o.pre8PlayerIdsMap).length && o.status == k.STATUS.WAIT_APPLY && 0 == t.keys(o.championIdMap).length && (i = "show32");
switch (i = n || i) {
case "show4":
r = 1;
break;

case "show32":
case "show16":
case "show8":
r = 4;
}
return {
selectRankId: e || 1,
pageCount: r,
selectLevelType: l,
selectBattleType: i,
battleInfo: o,
statusTitleMap: {
1: h.t("争霸赛报名时间为周日、周一、周二"),
2: h.t("争霸赛现在可以报名，截止至周二晚上12点"),
3: h.t("争霸赛32强入围时间为周三晚上8:00"),
4: h.t("争霸赛16强入围时间为周四晚上8:00"),
5: h.t("争霸赛8强入围时间为周五晚上8:00"),
6: h.t("争霸赛8强决赛时间周六晚上8:00")
}
};
};
f.genBetPanelData = function(e, a) {
var n = d.player.extra.worshipBattle.battleInfo, i = k.LEVEL_TYPE_BETWEEN;
a = e ? i[e - 1] : a;
e = t.indexOf(i, a) + 1;
var r = n.be8GroupInfoMap[a], s = [], o = [];
for (var l in r) for (var c in r[l].players) {
var h = r[l].players[c].id;
if (!t.include(o, h)) {
o.push(h);
s.push(r[l].players[c].attr);
}
}
return {
selectBetRankId: e,
type: a,
playerInfos: s,
betTargetId: n.betTargetIdMap[a],
pre8PlayerIds: n.pre8PlayerIdsMap[a] || [],
pageCount: i.length,
betTargetCountMap: n.betTargetCountMap || {}
};
};
cc._RF.pop();
}, {
arena3v3Scene: "arena3v3Scene",
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
http: "http",
i18n: "i18n",
itemItem: "itemItem",
playerItem: "playerItem",
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
worshipBattleHandler: "worshipBattleHandler",
worshipRankPanel: "worshipRankPanel"
} ],
