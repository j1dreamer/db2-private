doubleBattleScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "c8276dtmXdJDroTiaR35jhH", "doubleBattleScene");
var t = e("underscore"), n = (e("http"), e("dataApi")), i = e("buildExt"), r = e("baseView"), s = e("soundApi"), o = e("resource"), l = e("doubleBattleHandler"), c = (e("clientConfig"), 
e("serverConfig")), d = e("serverMain"), h = e("i18n"), u = e("helper"), m = e("selectBattleRolesScene"), g = (e("itemItem"), 
e("roleItem"), e("shipItem"), e("playerItem"), e("rulePanel")), p = e("arena3v3Scene"), _ = e("sceneManager"), k = c.DOUBLE_BATTLE.CONSTS, f = (c.DOUBLE_BATTLE.FUNS, 
cc.Class({
extends: cc.Component,
properties: {
themeNode: cc.Node,
themeNodeLayout: cc.Node,
worshipNode: cc.Node,
worshipTitleLabel: cc.Label,
worshipBgSp: cc.Sprite,
worshipBtSpArr: [ cc.SpriteFrame ],
worshipRankBt: cc.Node,
levelNodeItem: cc.Node,
levelNodeLayout: cc.Node,
viewTeamBt: cc.Node,
battleNode: cc.Node,
battleBgSp: cc.Sprite,
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
betLayout: cc.Node,
backNode: cc.Node
},
onLoad: function() {
_.curSceneStatusData = t.extend({
enterView: "theme",
selectThemeNo: 1,
selectRankId: null,
selectLevelType: null,
selectBattleType: null,
selectBetRankId: null
}, _.curSceneStatusData);
this.statusData = _.curSceneStatusData;
this.worshipNode.active = !1;
this.levelNodeItem.active = !1;
this.battleNode.active = !1;
this.betPanel.active = !1;
this.betItem.active = !1;
this.worshipRankBt.active = !i.isHideRankBt;
this.update_();
this.updateWorship_();
this.updateBattle_();
s.playMusic(o.sound_music_double_battle_mp3);
},
update_: function() {
var e = f.genData();
this.data = e;
this.themeNode.active = "theme" == this.statusData.enterView;
this.backNode.active = this.themeNode.active;
if (this.themeNode.active) {
var a = this.themeNodeLayout;
for (var t in e.themeItems) {
var i = a.getChildByName("item_" + (Number(t) + 1)), s = e.themeItems[t], o = s.playerInfo;
i.data = s;
var l = i.getChildByName("info_bg_node");
l.active = !!o;
if (l.active) {
l.getChildByName("name_label").getComponent(cc.Label).string = o.playerName;
l.getChildByName("server_label").getComponent(cc.Label).string = h.t("$1区", [ o.serverId ]);
u.replaceLabel(l.getChildByName("level_label").getComponent(cc.Label), [ o.playerLevel ]);
}
i.getChildByName("battle_armature").active = s.isRunning;
var c = i.getChildByName("armature_node");
c.active = !!o;
if (c.active) {
var d = n.entity.findBy("imgId", o.playerPhotoInfo.photoImgId)[0], m = d ? n.findEntityById(d.kindId).classId : 1, g = c.characterNode;
if (g && g.getComponent("characterArmatureComponent").data.classId != m) {
g.destroy();
g = null;
}
if (!g && m) {
(g = r.getCharacterNode(m)).parent = c;
g.idx = t;
g.getComponent("characterArmatureComponent").setTitle_(o.playerPhotoInfo.titleImgId);
c.characterNode = g;
}
}
}
}
},
onThemeItem_: function(e) {
var a = e.target.data;
this.statusData.enterView = "worship";
this.update_();
this.statusData.selectThemeNo = a.no;
this.updateWorship_();
},
updateWorship_: function() {
var e = f.genWorshipData(this.statusData.selectThemeNo);
this.worshipData = e;
this.worshipNode.active = "worship" == this.statusData.enterView;
if (this.worshipNode.active) {
this.worshipTitleLabel.string = e.title;
r.setSpriteFrame(this.worshipBgSp, o["double_worship_bg_" + this.statusData.selectThemeNo + "_jpg"]);
this.viewTeamBt.active = !!e.isApply;
this.worshipRankBt.active = this.worshipRankBt.active && e.status != k.STATUS.WAIT_BE_4;
this.levelNodeItemMap = this.levelNodeItemMap || {};
t.each(this.levelNodeItemMap, function(e) {
e.active = !1;
});
for (var a in k.LEVEL_TYPE_BETWEEN) {
var i = this.levelNodeItemMap[a];
if (!i) {
(i = cc.instantiate(this.levelNodeItem)).parent = this.levelNodeLayout;
i.idx = a;
this.levelNodeItemMap[a] = i;
}
i.active = !0;
r.setSpriteFrame(i.getComponent(cc.Sprite), o["double_worship_item_" + this.statusData.selectThemeNo + "_png"]);
var s = k.LEVEL_BETWEEN[a], l = k.LEVEL_TYPE_BETWEEN[a];
i.getChildByName("name_label").getComponent(cc.Label).string = e.levelNames[a];
var c = i.getChildByName("level_label").getComponent(cc.Label);
u.replaceLabel(c, l.split("_").slice(1));
var d = e.playerInfoMap[l], h = i.getChildByName("info_bg_node");
h.active = !!d;
if (h.active) {
h.getChildByName("name_label").getComponent(cc.Label).string = d.playerName;
u.replaceLabel(h.getChildByName("server_label").getComponent(cc.Label), [ d.serverId ]);
u.replaceLabel(h.getChildByName("level_label").getComponent(cc.Label), [ d.playerLevel ]);
}
var m = i.getChildByName("armature_node");
m.active = !!d;
if (m.active) {
var g = n.entity.findBy("imgId", d.playerPhotoInfo.photoImgId)[0], p = g ? n.findEntityById(g.kindId).classId : 1, _ = m.characterNode;
if (_ && _.getComponent("characterArmatureComponent").data.classId != p) {
_.destroy();
_ = null;
}
if (!_ && p) {
(_ = r.getCharacterNode(p)).parent = m;
_.idx = a;
_.getComponent("characterArmatureComponent").setTitle_(d.playerPhotoInfo.titleImgId);
m.characterNode = _;
}
m.data = {
levelType: l
};
}
var y = i.getChildByName("apply_bt");
y.active = e.battlefieldLevel == s;
var b = i.getChildByName("status_sp");
b.active = e.battlefieldLevel == s;
if (y.active) {
y.active = !e.isApply && e.status == k.STATUS.APPLY;
b.active = e.isApply;
}
var v = i.getChildByName("worship_bt");
v.getComponent(cc.Sprite).spriteFrame = this.worshipBtSpArr[this.statusData.selectThemeNo - 1];
v.active = e.status != k.STATUS.WAIT_APPLY;
v.data = {
levelType: l
};
v.getComponent(cc.Button).interactable = !e.worshipStatueMap[l];
}
}
},
onExitWorship_: function() {
if (this.worshipNode.active) {
this.statusData.enterView = "theme";
this.update_();
this.updateWorship_();
}
},
onWorshipSwitch_: function(e, a) {
this.statusData.selectThemeNo += Number(a);
this.statusData.selectThemeNo > 5 && (this.statusData.selectThemeNo = 1);
this.statusData.selectThemeNo < 1 && (this.statusData.selectThemeNo = 5);
this.updateWorship_();
},
onViewMyTeam_: function() {
r.addLoading();
l.getMyTeam(this.statusData.selectThemeNo, function(e) {
r.addViewBattleTeamPanel(e._temp.team);
});
},
onViewChampionTeam_: function(e) {
var a = e.target.data;
r.addLoading();
l.getChampionTeam(this.statusData.selectThemeNo, a.levelType, function(e) {
r.addViewBattleTeamPanel(e._temp.team);
});
},
onRule_: function() {
r.addRulePanel(g.TYPE.DOUBLE_BATTLE, {
themeNo: this.statusData.selectThemeNo
});
},
onApply_: function() {
d.player.level < k.LEVEL_BETWEEN[0] ? r.addHintPanel(h.t("开启等级:$1", k.LEVEL_BETWEEN[0])) : _.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.DOUBLE_BATTLE_TEAM,
opts: {
themeNo: this.statusData.selectThemeNo,
selectTeamId: 1
}
});
},
onWorship_: function(e) {
var a = e.target, t = a.data;
r.addLoading();
l.worshipStatue(this.statusData.selectThemeNo, t.levelType, function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap);
a.getComponent(cc.Button).interactable = !1;
});
},
onWorshipRank_: function() {
var a = e("worshipRankPanel");
r.addWorshipRankPanel(a.RANK_TYPE.DOUBLE_BATTLE, {
themeNo: this.statusData.selectThemeNo
});
},
onRoles_: function() {
r.addCanUseRolesPanel(this.worshipData.canUseRoleClassIds, this.worshipData.title);
},
onEnterBattle_: function() {
var e = this;
r.addLoading();
l.battleInfo(this.statusData.selectThemeNo, function(a) {
d.player.extra.doubleBattle.battleInfo = a._temp.battleInfo;
e.statusData.enterView = "battle";
e.updateWorship_();
e.updateBattle_();
});
},
onExitBattle_: function() {
if (this.battleNode.active) {
this.statusData.enterView = "worship";
this.updateWorship_();
this.updateBattle_();
}
},
updateBattle_: function() {
this.battleNode.active = "battle" == this.statusData.enterView;
if (this.battleNode.active) {
var e = f.genBattleData(this.statusData.selectRankId, this.statusData.selectLevelType, this.statusData.selectBattleType);
this.battleData = e;
this.statusData.selectLevelType = e.selectLevelType;
this.statusData.selectBattleType = e.selectBattleType;
this.battleTitleLabel.string = e.statusTitleMap[e.battleInfo.status];
r.setSpriteFrame(this.battleBgSp, o["double_worship_bg_" + this.statusData.selectThemeNo + "_jpg"]);
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
(m = this.battle1v1Node.getChildByName("player_item_sp")).playerItem = m.getChildByName("player_item");
m.infoBgNode = m.getChildByName("info_bg_node");
m.titleBgSp = m.getChildByName("title_bg_sp");
m.outSp = m.getChildByName("out_sp");
m.meSp = m.getChildByName("me_sp");
m.playerItem.active = !1;
m.infoBgNode.active = !1;
m.titleBgSp.active = !1;
m.outSp.active = !1;
m.meSp.active = !1;
this.playerItemSp = m;
var i = [], s = a.concat(n);
for (var l in s) {
var c;
(c = s[l].getChildByName("player_item_sp")) && i.push(c);
(c = s[l].getChildByName("player_item_1_sp")) && i.push(c);
(c = s[l].getChildByName("player_item_2_sp")) && i.push(c);
var d = s[l].getChildByName("line_sp");
d && (d.active = !1);
var h = s[l].getChildByName("play_bt");
h && (h.active = !1);
}
for (var l in i) {
var m, g = (m = i[l]).getChildByName("player_item");
if (!g) {
(g = cc.instantiate(this.playerItemSp.playerItem)).parent = m;
m.playerItem = g;
}
g.active = !1;
var p = m.getChildByName("info_bg_node");
if (!p) {
(p = cc.instantiate(this.playerItemSp.infoBgNode)).parent = m;
m.infoBgNode = p;
}
p.active = !1;
var _ = m.getChildByName("title_bg_sp");
if (!_) {
(_ = cc.instantiate(this.playerItemSp.titleBgSp)).parent = m;
m.titleBgSp = _;
}
_.active = !1;
var y = m.getChildByName("out_sp");
if (!y) {
(y = cc.instantiate(this.playerItemSp.outSp)).parent = m;
m.outSp = y;
}
y.active = !1;
var b = m.getChildByName("me_sp");
if (!b) {
(b = cc.instantiate(this.playerItemSp.meSp)).parent = m;
m.meSp = b;
}
b.active = !1;
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
for (var l in this.battleLevelTypeBts) {
(T = this.battleLevelTypeBts[l]).data = {
type: k.LEVEL_TYPE_BETWEEN[l]
};
T.getComponent(cc.Button).interactable = e.selectLevelType != T.data.type;
T.getChildByName("name_label").getComponent(cc.Label).string = this.worshipData.levelNames[l];
var v = T.getChildByName("level_label").getComponent(cc.Label);
u.replaceLabel(v, T.data.type.split("_").slice(1));
}
var S = [ "show32", "show16", "show8", "show4" ];
for (var l in this.battleTypeBts) {
var T;
(T = this.battleTypeBts[l]).data = {
type: S[l]
};
T.getComponent(cc.Button).interactable = e.selectBattleType != T.data.type;
}
this.battleLeftBt.active = e.selectRankId > 1;
this.battleRightBt.active = e.selectRankId < e.pageCount;
for (l = 0; l < e.pageCount; l++) {
var M = l + 1;
this.battleDotBgNode.getChildByName("dot_" + M + "_sp").getChildByName("select_sp").active = M == e.selectRankId;
}
this.battleDotBgNode.active = e.pageCount > 1;
}
},
show32_8_: function(e, a) {
var n = this.battleData, i = n.battleInfo.be32GroupInfoMap[n.selectLevelType], r = n.battleInfo.pre8PlayerIdsMap[n.selectLevelType] || [], s = {};
if (i) for (var o = 0, l = 4 * (n.selectRankId - 1) + 1, c = l; c < l + 4; c++) {
var m = i[c], g = [ e[o].getChildByName("player_item_1_sp"), e[o].getChildByName("player_item_2_sp") ];
for (var p in g) {
var _ = m.players[p], f = g[p];
s[Math.ceil(c / 2) + "_" + _.id] = f;
(v = f.getChildByName("player_item")).active = !0;
v.getComponent("playerItem").update_(_.attr.playerPhotoInfo);
v.data = {
playerId: _.id
};
v.getComponent("playerItem").setClickEvent_(this.node, "doubleBattleScene", "onBattleViewTeam_");
(S = f.getChildByName("info_bg_node")).active = !0;
S.getChildByName("name_label").getComponent(cc.Label).string = _.attr.playerName;
u.replaceLabel(S.getChildByName("server_label").getComponent(cc.Label), [ _.attr.serverId ]);
u.replaceLabel(S.getChildByName("level_label").getComponent(cc.Label), [ _.attr.playerLevel ]);
(T = f.getChildByName("title_bg_sp")).active = !0;
T.getChildByName("label").getComponent(cc.Label).string = t.include(r, Number(_.id)) ? h.t("上届8强") : h.t("新人");
if ("show32" != n.selectBattleType && t.include([ k.STATUS.WAIT_BE_8, k.STATUS.WAIT_BE_4, k.STATUS.WAIT_APPLY ], n.battleInfo.status)) {
f.getChildByName("out_sp").active = _.id != m.winPlayerId;
e[o].getChildByName("line_sp").active = !!m.reportId;
(M = e[o].getChildByName("play_bt")).active = !!m.reportId;
M.data = {
reportId: m.reportId
};
}
f.getChildByName("me_sp").active = _.id == d.player.id;
}
o++;
}
var y = n.battleInfo.be16GroupInfoMap[n.selectLevelType], b = n.battleInfo.be8GroupInfoMap[n.selectLevelType];
if (b && "show8" == n.selectBattleType && t.include([ k.STATUS.WAIT_BE_4, k.STATUS.WAIT_APPLY ], n.battleInfo.status)) {
t.each(a, function(e) {
e.active = !0;
});
m = b[n.selectRankId], g = [ a[0].getChildByName("player_item_sp"), a[1].getChildByName("player_item_sp") ];
for (var o in g) {
var v, S, T, M;
_ = m.players[o];
(v = (f = g[o]).getChildByName("player_item")).active = !0;
v.getComponent("playerItem").update_(_.attr.playerPhotoInfo);
v.data = {
playerId: _.id
};
v.getComponent("playerItem").setClickEvent_(this.node, "doubleBattleScene", "onBattleViewTeam_");
(S = f.getChildByName("info_bg_node")).active = !0;
S.getChildByName("name_label").getComponent(cc.Label).string = _.attr.playerName;
u.replaceLabel(S.getChildByName("server_label").getComponent(cc.Label), [ _.attr.serverId ]);
u.replaceLabel(S.getChildByName("level_label").getComponent(cc.Label), [ _.attr.playerLevel ]);
(T = f.getChildByName("title_bg_sp")).active = !0;
T.getChildByName("label").getComponent(cc.Label).string = t.include(r, Number(_.id)) ? h.t("上届8强") : h.t("新人");
a[o].getChildByName("line_sp").active = !0;
(M = a[o].getChildByName("play_bt")).active = !0;
M.data = {
reportId: y[2 * n.selectRankId - 1 + Number(o)].reportId
};
f.getChildByName("me_sp").active = !1;
}
var $ = [];
for (var c in y) $.push(c + "_" + y[c].winPlayerId);
for (var I in s) s[I].getChildByName("out_sp").active = !t.include($, I);
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
T.getComponent("playerItem").setClickEvent_(this.node, "doubleBattleScene", "onBattleViewTeam_");
(M = _.getChildByName("info_bg_node")).active = !0;
M.getChildByName("name_label").getComponent(cc.Label).string = p.attr.playerName;
u.replaceLabel(M.getChildByName("server_label").getComponent(cc.Label), [ p.attr.serverId ]);
u.replaceLabel(M.getChildByName("level_label").getComponent(cc.Label), [ p.attr.playerLevel ]);
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
T.getComponent("playerItem").setClickEvent_(this.node, "doubleBattleScene", "onBattleViewTeam_");
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
T.getComponent("playerItem").setClickEvent_(this.node, "doubleBattleScene", "onBattleViewTeam_");
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
l.getTeam(this.statusData.selectThemeNo, a.playerId, function(e) {
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
this.betTitleLabel.string = this.worshipData.levelNames[this.statusData.selectBetRankId - 1] || "";
this.betLeftBt.active = e.selectBetRankId > 1;
this.betRightBt.active = e.selectBetRankId < e.pageCount;
this.betItemMap = this.betItemMap || {};
r.preHideNodeMap(this.betItemMap);
for (var a in e.playerInfos) {
var n = this.betItemMap[a];
if (!n) {
(n = cc.instantiate(this.betItem)).parent = this.betLayout;
n.idx = a;
this.betItemMap[a] = n;
}
n.active = !0;
r.markHideNode(n);
var i = e.playerInfos[a], s = n.getChildByName("info_bg_node");
s.getChildByName("name_label").getComponent(cc.Label).string = i.playerName;
u.replaceLabel(s.getChildByName("server_label").getComponent(cc.Label), [ i.serverId ]);
s.getChildByName("level_label").getComponent(cc.Label).string = i.playerLevel;
s.getChildByName("player_item").getComponent("playerItem").update_(i.playerPhotoInfo);
n.getChildByName("title_bg_sp").getChildByName("label").getComponent(cc.Label).string = t.include(e.pre8PlayerIds, Number(i.playerId)) ? h.t("上届8强") : h.t("新人");
n.getChildByName("bet_count_layout").getChildByName("value_label").getComponent(cc.Label).string = e.betTargetCountMap[i.playerId] || 0;
var o = n.getChildByName("bet_bt");
o.active = !e.betTargetId;
o.data = {
playerId: i.playerId
};
o.getChildByName("cost_label").getComponent(cc.Label).string = k.BET_COST_GEM;
n.getChildByName("beted_bt").active = e.betTargetId && e.betTargetId == i.playerId;
n.getChildByName("view_bt").data = {
playerId: i.playerId
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
l.bet(this.statusData.selectThemeNo, t.betPanelData.type, a.playerId, function() {
d.player.extra.doubleBattle.battleInfo.betTargetIdMap[t.betPanelData.type] = a.playerId;
t.onBet_();
});
}
}));
f.genData = function() {
var e = d.player, a = e.extra.doubleBattle, t = c.FUNS.getValueByBetween(k.LEVEL_BETWEEN, k.LEVEL_TYPE_BETWEEN, e.level), n = [];
for (var i in a.infos) {
var r = a.infos[i], s = null, o = null;
for (var l in k.LEVEL_TYPE_BETWEEN) {
var h = r.playerInfoMap[k.LEVEL_TYPE_BETWEEN[l]];
k.LEVEL_TYPE_BETWEEN[l] == t && (o = h);
s = h || s;
}
s = o || s;
r.openInfo.status == k.STATUS.WAIT_BE_4 && (s = null);
n.push({
no: Number(i) + 1,
isRunning: r.openInfo.status != k.STATUS.WAIT_APPLY,
playerInfo: s
});
}
return {
themeItems: n
};
};
f.genWorshipData = function(e) {
var a = d.player, t = a.extra.doubleBattle, n = t.infos[e - 1].openInfo, i = t.infos[e - 1].playerInfoMap, r = a.worshipStatueDoubleMap[e], s = c.FUNS.getValueByBetween(k.LEVEL_BETWEEN, k.LEVEL_BETWEEN, a.level), o = [ h.t("70级争霸"), h.t("80级争霸"), h.t("90级争霸"), h.t("95级争霸"), h.t("100级争霸") ];
if (n.status == k.STATUS.WAIT_BE_4) for (var l in i) i[l] = null;
var u = h.t(k.THEME_TITLE_MAP[e]), m = k.THEME_ROLE_CLASS_IDS_MAP[e];
return {
title: u,
battlefieldLevel: s,
isApply: n.isApply,
status: n.status,
playerInfoMap: i,
worshipStatueMap: r,
levelNames: o,
canUseRoleClassIds: m
};
};
f.genBattleData = function(e, a, n) {
var i, r, s = d.player, o = s.extra.doubleBattle.battleInfo, l = a || c.FUNS.getValueByBetween(k.LEVEL_BETWEEN, k.LEVEL_TYPE_BETWEEN, s.level);
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
1: h.t("争霸赛等待报名开启"),
2: h.t("争霸赛现在可以报名，截止至晚上12点"),
3: h.t("争霸赛32强入围时间为12:00"),
4: h.t("争霸赛16强入围时间为20:00"),
5: h.t("争霸赛8强入围时间为12:00"),
6: h.t("争霸赛8强决赛时间为20:00")
}
};
};
f.genBetPanelData = function(e, a) {
var n = d.player.extra.doubleBattle.battleInfo, i = k.LEVEL_TYPE_BETWEEN;
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
doubleBattleHandler: "doubleBattleHandler",
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
worshipRankPanel: "worshipRankPanel"
} ],
