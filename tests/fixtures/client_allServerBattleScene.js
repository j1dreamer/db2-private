allServerBattleScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "522bbV3xo9JkZAgvzikJt0p", "allServerBattleScene");
var t = e("underscore"), n = (e("http"), e("dataApi")), i = e("moment"), r = e("baseView"), s = e("soundApi"), o = e("resource"), l = e("allServerBattleHandler"), c = e("buildExt"), d = e("serverConfig"), h = e("serverMain"), u = (e("player"), 
e("i18n")), m = e("helper"), g = e("selectBattleRolesScene"), p = (o = e("resource"), 
e("itemItem")), _ = e("roleItem"), k = e("shipItem"), f = e("playerItem"), y = e("rulePanel"), b = e("rankPanel"), v = e("sceneManager"), S = d.ALL_SERVER_BATTLE.CONSTS, T = d.ALL_SERVER_BATTLE.FUNS, M = cc.Class({
extends: cc.Component,
properties: {
worshipNode: cc.Node,
showLabel: cc.Label,
enterBt: cc.Node,
winTimesRankBt: cc.Node,
worshipRankBt: cc.Node,
levelNodeLayout: cc.Node,
applyListPanel: cc.Node,
applyListMyLevelLabel: cc.Label,
applyListPlayerNameLabel: cc.Label,
applyListPlayerLevelLabel: cc.Label,
applyListServerLabel: cc.Label,
applyListRankLabel: cc.Label,
applyListPowerLabel: cc.Label,
applyListTeamIconSp: cc.Sprite,
applyListRankLayouts: [ cc.Node ],
applyListRankItem: cc.Node,
applyListTeamSps: [ cc.Node ],
battleNode: cc.Node,
battleMineNode: cc.Node,
battleFlagSpriteFrames: [ cc.SpriteFrame ],
battleGuideArmature: cc.Node,
battleMeSp: cc.Node,
battleEndTimeLabel: cc.Label,
battleGetRewardCdLabel: cc.Label,
battleMoveCdLabel: cc.Label,
viewTeamPanel: cc.Node,
viewTeamPowerLabel: cc.Label,
viewTeamHpLabel: cc.Label,
viewTeamRecoverCostGemLabel: cc.Label,
viewTeamShipItem: cc.Node,
viewTeamRoleItemNode: cc.Node,
viewResourcePanel: cc.Node,
viewResourceTeamNameLabel: cc.Label,
viewResourceServerLabel: cc.Label,
viewResourceRewardItemsLayout: cc.Node,
viewResourceRewardItem: cc.Node,
viewResourceRandomRewardItemsLayout: cc.Node,
viewResourceRandomRewardItem: cc.Node,
viewResourceMemberCountLabel: cc.Label,
viewResourceFlagSp: cc.Sprite,
viewResourceResourceHintLabel: cc.Node,
viewResourcePlayerInfosLayout: cc.Node,
viewResourcePlayerInfoNode: cc.Node,
viewResourceBattleBt: cc.Node,
viewResourceBattleHintLabel: cc.Node,
reportPanel: cc.Node,
reportTouchNode: cc.Node,
reportScrollview: cc.Node,
reportItemsLayout: cc.Node,
reportItem: cc.Node,
reportWinSpriteFrame: cc.SpriteFrame,
reportFailSpriteFrame: cc.SpriteFrame
},
statics: {
instance: null
},
onLoad: function() {
M.instance || (M.instance = this);
v.curSceneStatusData = t.extend({
isEnter: !1
}, v.curSceneStatusData);
this.statusData = v.curSceneStatusData;
this.applyListPanel.active = !1;
this.applyListRankItem.active = !1;
this.battleNode.active = !1;
this.viewTeamPanel.active = !1;
this.viewTeamShipItem.active = !1;
this.viewTeamRoleItemNode.active = !1;
this.viewResourcePanel.active = !1;
this.viewResourceRewardItem.active = !1;
this.viewResourceRandomRewardItem.active = !1;
this.viewResourcePlayerInfoNode.active = !1;
this.reportPanel.active = !1;
this.reportTouchNode.active = !1;
this.reportScrollview.active = !1;
this.reportItem.active = !1;
this.selectTowerNo = null;
this.update_();
this.updateBattle_();
this.autoUpdateCD_();
s.playMusic(o.sound_music_all_server_battle_mp3);
this.scheduleOnce(function() {
m.scrollviewFadeIn(this.reportScrollview);
}, 0);
},
onDestroy: function() {
M.instance = null;
},
update_: function() {
var e = M.genData();
this.data = e;
Date._now() < h.tTime(e.applyBeginTime) ? this.showLabel.string = u.t("距离报名开始:$1", [ i(h.tTime(e.applyBeginTime)).from(Date._now()) ]) : Date._now() < h.tTime(e.applyEndTime) ? this.showLabel.string = u.t("距离报名截止:$1", [ i(h.tTime(e.applyEndTime)).from(Date._now()) ]) : Date._now() < h.tTime(e.openTime) ? this.showLabel.string = u.t("开启时间:$1", [ i(h.tTime(e.openTime)).from(Date._now()) ]) : e.isOpen || (this.showLabel.string = u.t("正在进行中，您未参加"));
this.showLabel.node.parent.active = !e.isOpen;
this.winTimesRankBt.active = !e.isOpen && !c.isHideRankBt;
this.enterBt.active = e.isOpen;
this.worshipRankBt.active = !c.isHideRankBt;
for (var a in S.LEVEL_TYPE_BETWEEN) {
var t = this.levelNodeLayout.getChildByName("level_node_item_" + (Number(a) + 1)), s = S.LEVEL_BETWEEN[a], o = S.LEVEL_TYPE_BETWEEN[a], l = t.getChildByName("title_bg_sp"), d = l.getChildByName("name_label").getComponent(cc.Label);
m.replaceLabel(d, [ s ]);
var g = l.getChildByName("level_label").getComponent(cc.Label);
m.replaceLabel(g, o.split("_").slice(1));
var p = e.playerInfoMap[o], _ = t.getChildByName("info_bg_sp");
_.active = !!p;
if (_.active) {
_.getChildByName("name_label").getComponent(cc.Label).string = p.playerName;
_.getChildByName("server_label").getComponent(cc.Label).string = u.t("$1区", [ p.serverId ]);
_.getChildByName("level_label").getComponent(cc.Label).string = u.t("LV.$1", [ p.playerLevel ]);
}
var k = t.getChildByName("armature_node");
k.active = !!p;
if (k.active) {
var f = n.role.findOneBy("imgId", p.playerPhotoInfo.photoImgId), y = f ? f.classId : 1, b = k.characterNode;
if (b && b.getComponent("characterArmatureComponent").data.classId != y) {
b.destroy();
b = null;
}
if (!b && y) {
(b = r.getCharacterNode(y)).parent = k;
b.idx = a;
b.getComponent("characterArmatureComponent").setTitle_(p.playerPhotoInfo.titleImgId);
k.characterNode = b;
}
k.data = {
defenderId: p.playerId
};
}
var v = t.getChildByName("apply_bt");
v.active = e.battlefieldLevel == s;
var T = t.getChildByName("list_bt");
T.active = e.battlefieldLevel == s;
var $ = t.getChildByName("status_sp");
$.active = e.battlefieldLevel == s;
if (v.active) {
v.active = !e.isApply && Date._now() > h.tTime(e.applyBeginTime) && Date._now() < h.tTime(e.applyEndTime);
T.active = e.isApply;
$.active = e.isApply;
}
var I = t.getChildByName("worship_bt");
I.data = {
levelType: o
};
I.getComponent(cc.Button).interactable = !e.worshipStatueMap[o];
I.getChildByName("spine").getComponent(sp.Skeleton).setAnimation(0, e.worshipStatueMap[o] ? "action_2" : "action_1", !0);
}
},
onRule_: function() {
r.addRulePanel(y.TYPE.ALL_SERVER_BATTLE, {
battlefieldType: this.data.battlefieldType
});
},
onViewBattleTeam_: b.prototype.onRankItem_,
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
r.addWorshipRankPanel(a.RANK_TYPE.ALL_SERVER_BATTLE);
},
onWinTimesRank_: function() {
var a = e("battlefieldRankPanel");
r.addBattlefieldRankPanel(a.RANK_TYPE.ALL_SERVER_BATTLE);
},
onApply_: function() {
var e = this;
r.addMessageBox(u.t("是否报名参加?"), function() {
r.addLoading();
l.apply(function() {
h.player.extra.allServerBattle.openInfo.isApply = !0;
e.update_();
});
});
},
onApplyList_: function() {
var e = this;
r.addLoading();
l.applyRank(function(a) {
r.addPanel(e.applyListPanel);
var t = M.genApplyListPanelData(a._temp.myLevel, a._temp.teamInfoMap, a._temp.myRank, a._temp.myValue, a._temp.myTeamId, a._temp.listMap);
m.replaceLabel(e.applyListMyLevelLabel, [ t.myLevel ]);
e.applyListPlayerNameLabel.string = t.playerName;
m.replaceLabel(e.applyListPlayerLevelLabel, [ t.playerLevel ]);
m.replaceLabel(e.applyListServerLabel, [ t.serverId ]);
e.applyListRankLabel.string = t.myRank;
e.applyListPowerLabel.string = t.myValue;
e.applyListTeamIconSp.spriteFrame = e.battleFlagSpriteFrames[t.myTeamId - 1];
for (var n in t.rankItemsMap) {
e.applyListTeamSps[Number(n) - 1].getChildByName("sp").getComponent(cc.Sprite).spriteFrame = e.battleFlagSpriteFrames[Number(n) - 1];
var i = e.applyListRankLayouts[Number(n) - 1], s = t.rankItemsMap[n];
i.rankItemMap = i.rankItemMap || {};
r.preHideNodeMap(i.rankItemMap);
for (var o in s) {
var l = i.rankItemMap[o];
if (!l) {
(l = cc.instantiate(e.applyListRankItem)).parent = i;
i.rankItemMap[o] = l;
}
var c = s[o];
l.active = !0;
r.markHideNode(l);
l.getChildByName("player_name_label").getComponent(cc.Label).string = c.playerName;
var d = l.getChildByName("player_level_label").getComponent(cc.Label);
m.replaceLabel(d, [ c.playerLevel ]);
var h = l.getChildByName("server_label").getComponent(cc.Label);
m.replaceLabel(h, [ c.serverId ]);
l.getChildByName("rank_num_label").getComponent(cc.Label).string = c.rank;
l.getChildByName("power_layout").getChildByName("value_label").getComponent(cc.Label).string = c.value;
}
r.hideNodeMap(i.rankItemMap);
}
});
},
onCloseApplyList_: function() {
r.removePanel(this.applyListPanel);
},
onEnterBattle_: function() {
v.pushScene(v.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: g.TYPE.ALL_SERVER_BATTLE_TEAM
});
},
onExitBattle_: function() {
if (this.battleNode.active) {
var e = this;
r.addLoading();
l.exit(function() {
e.statusData.isEnter = !1;
e.update_();
e.updateBattle_();
});
}
},
updateBattle_: function() {
this.battleNode.active = this.statusData.isEnter;
this.worshipNode.active = !this.battleNode.active;
this.reportPanel.active = this.battleNode.active;
r.getBackNode().node.active = !this.battleNode.active;
if (this.statusData.isEnter) {
var a = M.genBattleData();
this.battleData = a;
this.mineMap = this.mineMap || {};
for (var n = 1; n <= 22; n++) {
this.mineMap[n] = this.battleMineNode.getChildByName("mine_" + n);
if (!this.mineMap[n].getComponent(cc.Button) && n > 3) {
var s = this.mineMap[n].addComponent(cc.Button), o = new cc.Component.EventHandler();
o.target = this.node;
o.component = "allServerBattleScene";
o.handler = "onResource_";
s.clickEvents.push(o);
this.mineMap[n].addComponent(e("soundComponent"));
}
this.mineMap[n].data = {
towerNo: n
};
var l = this.mineMap[n].getChildByName("flag_sp");
if (a.towerInfoMap && a.towerInfoMap[n]) {
var c = a.towerInfoMap[n].teamId ? a.teamInfoMap[a.towerInfoMap[n].teamId].flagId : 0;
l.active = !!c;
l.active && (l.getComponent(cc.Sprite).spriteFrame = this.battleFlagSpriteFrames[c - 1]);
} else l.active = !1;
}
if (a.towerNo) {
this.battleMeSp.x = this.mineMap[a.towerNo].x - 40;
this.battleMeSp.y = this.mineMap[a.towerNo].y + 60;
}
this.battleMeSp.active = !!a.towerNo;
this.battleGetRewardCdLabel.string = u.t("$1秒", [ a.getRewardCD ]);
this.battleGuideArmature.active = !1;
if (0 == a.getRewardCD) if (a.towerNo > 3) {
this.battleGetRewardCdLabel.string = u.t("可领取");
this.battleGuideArmature.active = !0;
this.battleGuideArmature.getComponent(sp.Skeleton).setAnimation(0, "action", !0);
this.battleGuideArmature.x = this.mineMap[a.towerNo].x;
this.battleGuideArmature.y = this.mineMap[a.towerNo].y;
} else this.battleGetRewardCdLabel.string = u.t("无资源");
this.battleMoveCdLabel.string = u.t("$1秒", [ a.moveCD ]);
0 == a.moveCD && (this.battleMoveCdLabel.string = u.t("可移动"));
this._updateEndTimeSchedule = this._updateEndTimeSchedule || function() {
var e = h.tTime(a.openTime) + 6e4 * S.DURATION_MINUTE - Date._now(), t = i.duration(e);
this.battleEndTimeLabel.string = m.formatDuration(t.asMinutes(), t.seconds());
};
this.unschedule(this._updateEndTimeSchedule);
this.schedule(this._updateEndTimeSchedule, .2);
this.reportItemMap = this.reportItemMap || [];
t.each(this.reportItemMap, function(e) {
e.active = !1;
});
for (n = 0; n < a.reports.length; n++) {
var d = this.reportItemMap[n];
if (!d) {
(d = cc.instantiate(this.reportItem)).parent = this.reportItemsLayout;
this.reportItemMap[n] = d;
}
d.active = !0;
var g = a.reports[n];
d.getChildByName("time_label").getComponent(cc.Label).string = i(new Date(h.tTime(g.ctime))).format("HH:mm");
var p = d.getChildByName("player_item_layout"), _ = p.getChildByName("player_item_node").getChildByName("player_item");
_.getComponent("playerItem").update_(f.genData(g.targetPhotoInfo));
_.removeComponent(cc.Button);
p.getChildByName("name_label").getComponent(cc.Label).string = g.targetName;
m.replaceLabel(p.getChildByName("server_label").getComponent(cc.Label), [ g.targetServerId ]);
p.getChildByName("level_label").getComponent(cc.Label).string = g.targetLevel;
d.getChildByName("play_bt").data = g;
d.getChildByName("result_sp").getComponent(cc.Sprite).spriteFrame = g.isWin ? this.reportWinSpriteFrame : this.reportFailSpriteFrame;
d.getChildByName("desc_label").getComponent(cc.Label).string = g.isAttack ? u.t("你在主动攻击中") : u.t("你在被攻击中");
}
}
},
autoUpdateCD_: function() {
if (this.statusData.isEnter) {
var e = h.player.extra.allServerBattle;
this._updateCDSchedule = this._updateCDSchedule || function() {
if (0 != e.moveCD || 0 != e.getRewardCD) {
e.moveCD -= 1;
e.moveCD = e.moveCD < 0 ? 0 : e.moveCD;
e.getRewardCD -= 1;
e.getRewardCD = e.getRewardCD < 0 ? 0 : e.getRewardCD;
this.updateBattle_();
} else this.unschedule(this._updateCDSchedule);
};
this.unschedule(this._updateCDSchedule);
this.schedule(this._updateCDSchedule, 1);
if (0 == e.getRewardCD && e.towerNo > 3) {
this._getRewardSchedule = this._getRewardSchedule || function() {
r.addLoading();
l.receiveAward(function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap);
});
};
this.unschedule(this._getRewardSchedule);
this.scheduleOnce(this._getRewardSchedule, 2);
} else 0 != e.getRewardCD && this.unschedule(this._getRewardSchedule);
}
},
onViewTeam_: function() {
var e = this;
r.addLoading();
l.getTeam(function(a) {
var t = e.viewTeamPanel;
r.addPanel(t, !0);
var n = M.genViewTeamData(a._temp.battleTeam);
e.viewTeamHpLabel.string = n.hp;
e.viewTeamPowerLabel.string = n.power;
e.viewTeamRecoverCostGemLabel.string = n.recoverCostGem;
t.roleItemNodeMap = t.roleItemNodeMap || {};
r.preHideNodeMap(t.roleItemNodeMap);
t.shipItemMap = t.shipItemMap || {};
r.preHideNodeMap(t.shipItemMap);
for (var i = 0; i < n.shipItems.length; i++) {
var s = n.shipItems[i], o = t.shipItemMap[i];
if (!o) {
(o = cc.instantiate(e.viewTeamShipItem)).parent = t.getChildByName("ship_" + (i + 1) + "_bg_sp");
t.shipItemMap[i] = o;
}
o.active = !0;
r.markHideNode(o);
o.getComponent("shipItem").update_(s);
}
for (i = 0; i < n.roleItems.length; i++) {
var l = n.roleItems[i], c = t.roleItemNodeMap[i];
if (!c) {
(c = cc.instantiate(e.viewTeamRoleItemNode)).parent = t.getChildByName("role_" + (i + 1) + "_bg_sp");
t.roleItemNodeMap[i] = c;
}
c.active = !0;
r.markHideNode(c);
c.getChildByName("role_item_node").getChildByName("role_item").getComponent("roleItem").update_(l);
c.getChildByName("bar_node").getChildByName("hp_bar").getComponent(cc.ProgressBar).progress = l.hpPct;
}
r.hideNodeMap(t.roleItemNodeMap);
r.hideNodeMap(t.shipItemMap);
});
},
onViewTeamRecover_: function() {
var e = this;
r.addLoading();
l.recover(function() {
r.removePanel(e.viewTeamPanel);
r.addHintPanel(u.t("上阵战士血量已回满"));
s.playEffect(o.sound_effect_recover_mp3);
});
},
onResource_: function(e) {
var a = e ? e.target.data : null, n = a ? a.towerNo : this.selectTowerNo, i = this.battleData.towerNo, s = this.battleData.towerInfoMap[n];
this.selectTowerNo = n;
if (!t.include(S.CAN_MOVE_TOWERS_MAP[i], n) || s && s.teamId != this.battleData.teamId && 0 != s.teamId) if (i == n && 0 == this.battleData.getRewardCD) {
r.addLoading();
l.receiveAward(function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap);
});
} else {
var o = M.genViewResourceData(n);
this.viewResourceData = o;
r.addPanel(this.viewResourcePanel);
this.viewResourceTeamNameLabel.string = o.teamName;
this.viewResourceServerLabel.node.parent.active = !!o.serverId;
o.serverId && m.replaceLabel(this.viewResourceServerLabel, [ o.serverId ]);
this.viewResourceMemberCountLabel.string = o.playerIds.length;
this.viewResourceFlagSp.spriteFrame = this.battleFlagSpriteFrames[o.flagId - 1];
this.viewResourceResourceHintLabel.active = o.playerIds.length >= S.HALVE_ABOVE_MEMBER_COUNT;
this.viewResourceResourceHintLabel.active && m.replaceLabel(this.viewResourceResourceHintLabel.getComponent(cc.Label), [ S.HALVE_ABOVE_MEMBER_COUNT ]);
this.viewResourceBattleBt.active = this.viewResourceBattleHintLabel.active = o.isCanBattle;
this.viewResourcePanel.itemItemMap = this.viewResourcePanel.itemItemMap || {};
r.preHideNodeMap(this.viewResourcePanel.itemItemMap);
for (var c in o.itemItems) {
if (!(d = this.viewResourcePanel.itemItemMap[c])) {
(d = cc.instantiate(this.viewResourceRewardItem)).parent = this.viewResourceRewardItemsLayout;
this.viewResourcePanel.itemItemMap[c] = d;
}
d.active = !0;
r.markHideNode(d);
d.getComponent("itemItem").setShowPanel_(!0);
d.getComponent("itemItem").update_(o.itemItems[c]);
}
r.hideNodeMap(this.viewResourcePanel.itemItemMap);
this.viewResourcePanel.randomItemItemMap = this.viewResourcePanel.randomItemItemMap || {};
r.preHideNodeMap(this.viewResourcePanel.randomItemItemMap);
for (var c in o.randomItemItems) {
var d;
if (!(d = this.viewResourcePanel.randomItemItemMap[c])) {
(d = cc.instantiate(this.viewResourceRandomRewardItem)).parent = this.viewResourceRandomRewardItemsLayout;
this.viewResourcePanel.randomItemItemMap[c] = d;
}
d.active = !0;
r.markHideNode(d);
d.getComponent("itemItem").setShowPanel_(!0);
d.getComponent("itemItem").update_(o.randomItemItems[c]);
}
r.hideNodeMap(this.viewResourcePanel.randomItemItemMap);
this.viewResourcePanel.playerInfoNodeMap = this.viewResourcePanel.playerInfoNodeMap || {};
r.preHideNodeMap(this.viewResourcePanel.playerInfoNodeMap);
for (var c in o.playerIds) {
var h = this.viewResourcePanel.playerInfoNodeMap[c];
if (!h) {
(h = cc.instantiate(this.viewResourcePlayerInfoNode)).parent = this.viewResourcePlayerInfosLayout;
this.viewResourcePanel.playerInfoNodeMap[c] = h;
}
h.active = !0;
r.markHideNode(h);
var g = o.playerInfoMap[o.playerIds[c]], p = h.getChildByName("server_label").getComponent(cc.Label);
m.replaceLabel(p, [ g.serverId ]);
h.getChildByName("player_name_label").getComponent(cc.Label).string = g.playerName;
var _ = h.getChildByName("player_level_label").getComponent(cc.Label);
m.replaceLabel(_, [ g.playerLevel ]);
}
r.hideNodeMap(this.viewResourcePanel.playerInfoNodeMap);
} else if (0 == this.battleData.moveCD) {
r.addLoading();
l.move(n);
} else {
r.addHintPanel(u.t("时间未到不能移动"));
this.selectTowerNo = null;
}
},
onCloseViewResource_: function() {
this.selectTowerNo = null;
r.removePanel(this.viewResourcePanel);
},
onResourceBattle_: function() {
var a = e("util"), t = e("battleMain"), n = e("battle.consts"), i = e("battle.fightHandler");
if (0 == h.player.extra.allServerBattle.moveCD) {
var c = this;
r.addLoading();
l.beginBattle(this.viewResourceData.towerNo, function(e) {
var d = e._temp.battleInfo.team, h = e._temp.battleInfo.targetTeam, m = g.buildBattleTeam(d.playerId, d.ships, d.roles), p = g.buildBattleTeam(h.playerId, h.ships, h.roles), _ = t.pkBattleInstant(a.clone(m), a.clone(p)), k = n.GUILD_BATTLE_IMG_IDS, f = k[Math.floor(Math.random() * k.length)], y = {}, b = {}, v = i.team1.roles, S = i.team2.roles;
for (var T in v) y[v[T].idx] = v[T].hp / 1.45;
for (var T in S) b[S[T].idx] = S[T].hp / 1.45;
r.addLoading();
l.endBattle(y, b, _.isWin, _.seed, f, function(e) {
r.addRewardEffectPanel(e._temp.entityCountMap);
r.addHintPanel(_.isWin ? u.t("你战胜了!") : u.t("你战败了!"));
s.playEffect(_.isWin ? o.sound_effect_battle_guild_battle_win_mp3 : o.sound_effect_battle_guild_battle_lose_mp3);
});
c.onCloseViewResource_();
});
} else r.addHintPanel(u.t("移动时间未到不能攻击"));
},
onReport_: function() {
this.reportPanel.beginX = Math.floor(this.reportPanel.beginX) || this.reportPanel.x;
cc.Tween.stopAllByTarget(this.reportPanel);
var e = this.reportPanel.x > this.reportPanel.beginX ? this.reportPanel.beginX : this.reportPanel.beginX + 750;
cc.tween(this.reportPanel).to(.3, {
position: cc.v2(e, this.reportPanel.y)
}).start();
this.reportTouchNode.active = e != this.reportPanel.beginX;
},
onReportPlay_: function(a) {
var n = a.target.data, i = e("battle.consts"), s = e("selectBattleRolesScene");
r.addLoading();
l.getReport(n.id, function(e) {
var a = e._temp.report;
if (a) {
var n = a.attackTeam, o = a.defenseTeam, l = s.buildBattleTeam(n.playerId, n.ships, n.roles), c = s.buildBattleTeam(o.playerId, o.ships, o.roles);
l.playerPhotoInfo = n.playerPhotoInfo;
l.playerLevel = n.playerLevel;
l.playerName = n.playerName;
c.playerPhotoInfo = o.playerPhotoInfo;
c.playerLevel = o.playerLevel;
c.playerName = o.playerName;
var d = a.bgImgId, m = t.map(l.roles.concat(c.roles), function(e) {
return e.kindId;
}), g = s.getPreLoadInfos(m, d), p = h.player.id, _ = {
team1: l,
team2: c,
battleType: i.BATTLE_TYPE.ARENA_PK,
opts: {
seed: a.seed,
isPlayBack: !0,
bgImgId: d,
showInfo: {
serverId: l.playerId == p ? a.defenderTeamServerId : a.attackerTeamServerId,
playerName: l.playerId == p ? c.playerName : l.playerName,
playerLevel: l.playerId == p ? c.playerLevel : l.playerLevel
}
}
};
r.preload(g, function() {
v.pushScene(v.NAME.BATTLE_SCENE, _);
});
} else r.addHintPanel(u.t("战报不存在"));
});
}
});
M.genData = function() {
var e = h.player, a = e.extra.allServerBattle, t = a.openInfo, n = a.playerInfoMap, i = e.worshipStatueMap;
return {
battlefieldLevel: d.FUNS.getValueByBetween(S.LEVEL_BETWEEN, S.LEVEL_BETWEEN, e.level),
battlefieldType: d.FUNS.getValueByBetween(S.LEVEL_BETWEEN, S.LEVEL_TYPE_BETWEEN, e.level),
openTime: t.openTime,
applyBeginTime: t.applyBeginTime,
applyEndTime: t.applyEndTime,
isOpen: t.isOpen,
isApply: t.isApply,
playerInfoMap: n,
worshipStatueMap: i
};
};
M.genApplyListPanelData = function(e, a, t, n, i, r) {
var s = h.player;
return {
playerName: s.name,
playerLevel: s.level,
serverId: s.serverId,
myLevel: e,
teamInfoMap: a,
myRank: t,
myValue: n,
myTeamId: i,
rankItemsMap: r
};
};
M.genBattleData = function() {
var e = h.player, a = e.extra.allServerBattle, n = a.openInfo.openTime, i = a.reports;
i = t.sortBy(i, function(e) {
return -e.ctime;
});
var r = a.playerInfoMap[e.id];
a.teamId = r ? r.teamId : 0;
return {
teamId: a.teamId,
moveCD: a.moveCD || 0,
getRewardCD: a.getRewardCD || 0,
towerNo: a.towerNo || 0,
towerInfoMap: a.towerInfoMap || null,
teamInfoMap: a.teamInfoMap || null,
openTime: n,
reports: i
};
};
M.genViewTeamData = function(e) {
var a = [];
for (var n in e.ships) a.push(k.genData(e.ships[n]));
a = t.sortBy(a, function(e) {
return e._data.classId;
});
var i = [], r = 0, s = 0;
for (var n in e.roles) {
r += e.roles[n].power;
s += e.roles[n].attr.hp;
var o = _.genData(e.roles[n]);
o.hpPct = e.roles[n].attr.hp / e.roles[n].attr.maxHp;
i.push(o);
}
s = Math.floor(s);
i = t.sortBy(i, function(e) {
return -e._data.positionPriority;
});
return {
hp: s,
power: r,
recoverCostGem: S.RECOVER_COST_GEM,
shipItems: a,
roleItems: i
};
};
M.genViewResourceData = function(e) {
var a = h.player.extra.allServerBattle, n = a.towerInfoMap[e], i = a.playerInfoMap, r = u.t("未占领"), s = 0, o = 0, l = [];
if (n && 0 != n.teamId) {
r = u.t(a.teamInfoMap[n.teamId].name);
s = a.teamInfoMap[n.teamId].serverId;
o = a.teamInfoMap[n.teamId].flagId;
l = n.playerIds;
}
var c = T.getTowerType(e), d = S.TOWER_TYPE_REWARD_DROP_LIST_MAP[c], m = S.TOWER_TYPE_RANDOM_REWARD_DROP_LIST_MAP[c], g = [], _ = [];
for (var k in d) g.push(p.genData({
kindId: d[k].entityId,
count: d[k].count
}, !0));
for (var k in m) _.push(p.genData({
kindId: m[k].entityId,
count: m[k].count
}, !0));
return {
teamName: r,
serverId: s,
flagId: o,
itemItems: g,
randomItemItems: _,
playerIds: l,
isCanBattle: t.include(S.CAN_MOVE_TOWERS_MAP[a.towerNo], e) && a.teamId != n.teamId && 0 != n.teamId,
towerNo: e,
playerInfoMap: i
};
};
cc._RF.pop();
}, {
allServerBattleHandler: "allServerBattleHandler",
baseView: "baseView",
"battle.consts": "battle.consts",
"battle.fightHandler": "battle.fightHandler",
battleMain: "battleMain",
battlefieldRankPanel: "battlefieldRankPanel",
buildExt: "buildExt",
dataApi: "dataApi",
helper: "helper",
http: "http",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerItem: "playerItem",
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
soundComponent: "soundComponent",
underscore: "underscore",
util: "util",
worshipRankPanel: "worshipRankPanel"
} ],
