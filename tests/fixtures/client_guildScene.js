guildScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "55086s262VHAIVlGVMenvnA", "guildScene");
var t = e("underscore"), n = e("buildExt"), i = e("moment"), r = e("baseView"), s = e("helper"), o = (e("guide"), 
e("i18n")), l = e("soundApi"), c = e("resource"), d = e("guildBossHandler"), h = e("newGuildBattleHandler"), u = e("serverMain"), m = e("serverConfig"), g = e("sceneManager"), p = e("guildHandler"), _ = e("itemItem"), k = e("rankPanel"), f = e("rulePanel"), y = e("selectBattleRolesScene"), b = e("newGuildBattleScene"), v = m.GUILD.CONSTS, S = cc.Class({
extends: cc.Component,
properties: {
battle1Bt: cc.Node,
battle2Bt: cc.Node,
manageBt: cc.Node,
myGuildTopBgSp: cc.Node,
myGuildBadgeSp: cc.Sprite,
myGuildNameLabel: cc.Label,
myGuildLevelLabel: cc.Label,
myGuildExpBar: cc.ProgressBar,
myGuildExpLabel: cc.Label,
myGuildIdLabel: cc.Label,
myGuildMemberCountLabel: cc.Label,
myGuildNoticeBgSp: cc.Node,
myGuildNoticeLabel: cc.Label,
guildListPanel: cc.Node,
createGuildCostLabel: cc.Label,
createGuildItem: cc.Node,
guildItem: cc.Node,
guildScrollView: cc.Node,
guildItemsLayout: cc.Node,
rank1SpriteFrame: cc.SpriteFrame,
rank2SpriteFrame: cc.SpriteFrame,
rank3SpriteFrame: cc.SpriteFrame,
joinPanel: cc.Node,
guildIdEditbox: cc.EditBox,
createPanel: cc.Node,
createPanelBadgeSp: cc.Sprite,
modifyBadgePanel: cc.Node,
modifyBadgeBadgeSpsLayout: cc.Node,
modifyBadgeBadgeSp: cc.Node,
guildNameEditbox: cc.EditBox,
memberPanel: cc.Node,
memberManageBt: cc.Node,
memberCountLabel: cc.Label,
memberItem: cc.Node,
memberItemsLayout: cc.Node,
worshipPanel: cc.Node,
worshipRewardPanel: cc.Node,
beWorshipTimesLabel: cc.Label,
beWorshipGetCoinLabel: cc.Label,
logPanel: cc.Node,
logItemsLayout: cc.Node,
logDateLabel: cc.Node,
logItem: cc.Node,
activityPanel: cc.Node,
drumDescLabel: cc.Label,
openBoxDescLabel: cc.Label,
drumTimesLabel: cc.Label,
openBoxTimesLabel: cc.Label,
colaPanel: cc.Node,
boxPanel: cc.Node,
skillPanel: cc.Node,
skillMoneyLabel: cc.Label,
skillEffectSpine: cc.Node,
managePanel: cc.Node,
manageApplyBt: cc.Node,
manageInheritBt: cc.Node,
manageDissolveBt: cc.Node,
manageModifyNoticeBt: cc.Node,
applyListPanel: cc.Node,
applyListMemberItem: cc.Node,
applyListMemberItemsLayout: cc.Node,
applyListNullLabel: cc.Node,
memberManagePanel: cc.Node,
memberManageMemberCountLabel: cc.Label,
memberManageMemberItem: cc.Node,
memberManageMemberItemsLayout: cc.Node,
memberItemManagePanel: cc.Node,
operateViceChairmanBt: cc.Node,
operateChairmanBt: cc.Node,
exitGuildBt: cc.Node,
modifyNoticePanel: cc.Node,
noticeEditbox: cc.EditBox,
settingPanel: cc.Node,
settingBadgeSp: cc.Sprite,
settingGuildNameEditbox: cc.EditBox,
settingJoinRequireLabel: cc.Label,
settingLevelLimitLabel: cc.Label,
settingHintLabel: cc.Label,
newGuildBattleReadyPanel: cc.Node,
newGuildBattleTopBgSp: cc.Node,
newGuildBattleRankBt: cc.Node,
newGuildBattleEnterBt: cc.Node,
newGuildBattleShowLabel: cc.Label,
newGuildBattleModifiedBt: cc.Node,
newGuildBattleBottomBgSp: cc.Node,
newGuildBattlePowerLabel: cc.Label,
newGuildBattleHpLabel: cc.Label,
newGuildBattleShipItem: cc.Node,
newGuildBattleRoleItem: cc.Node,
newGuildBattleRankPanel: cc.Node,
newGuildBattleRankItem: cc.Node,
newGuildBattleRankItemsLayout: cc.Node,
newGuildBattleRank1SpriteFrame: cc.SpriteFrame,
newGuildBattleRank2SpriteFrame: cc.SpriteFrame,
newGuildBattleRank3SpriteFrame: cc.SpriteFrame,
bossPanel: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
S.instance || (S.instance = this);
g.curSceneStatusData = t.extend({
badgeId: 1,
joinRequireType: 0,
joinLevelLimit: 0
}, g.curSceneStatusData);
this.statusData = g.curSceneStatusData;
this.guildListPanel.active = !1;
this.guildItem.active = !1;
this.joinPanel.active = !1;
this.createPanel.active = !1;
this.modifyBadgePanel.active = !1;
this.modifyBadgeBadgeSp.active = !1;
this.memberPanel.active = !1;
this.memberItem.active = !1;
this.worshipPanel.active = !1;
this.worshipRewardPanel.active = !1;
this.logPanel.active = !1;
this.logDateLabel.active = !1;
this.logItem.active = !1;
this.activityPanel.active = !1;
this.colaPanel.active = !1;
this.boxPanel.active = !1;
this.skillPanel.active = !1;
this.skillEffectSpine.active = !1;
this.managePanel.active = !1;
this.applyListPanel.active = !1;
this.applyListMemberItem.active = !1;
this.memberManagePanel.active = !1;
this.memberManageMemberItem.active = !1;
this.modifyNoticePanel.active = !1;
this.settingPanel.active = !1;
this.memberItemManagePanel.active = !1;
this.newGuildBattleReadyPanel.active = !1;
this.newGuildBattleRankPanel.active = !1;
this.bossPanel.active = !1;
this.battle2Bt.active = !n.isHideGuildBattle2;
this.update_();
l.playMusic(c.sound_music_guild_mp3);
},
onDestroy: function() {
S.instance = null;
},
update_: function() {
var e = S.genData();
this.data = e;
this.manageBt.active = !!e.guildId && (t.include(e._guild.viceChairmanIds, u.player.id) || u.player.id == e._guild.chairmanId);
if (this.manageBt.active) {
this.manageInheritBt.active = t.include(e._guild.viceChairmanIds, u.player.id);
this.manageDissolveBt.active = u.player.id == e._guild.chairmanId;
this.manageModifyNoticeBt.active = !n.isNoModifyNotice;
}
var a, i = e.applyPlayerList && e.applyPlayerList.length > 0;
r.setMark(this.manageBt, i);
r.setMark(this.memberManageBt, i);
r.setMark(this.manageApplyBt, i);
this.myGuildTopBgSp.active = !!e.guildId;
if (this.myGuildTopBgSp.active) {
this.myGuildNameLabel.string = e.guildName;
this.myGuildLevelLabel.string = o.t("LV.$1", [ e.guildLevel ]);
this.myGuildExpBar.progress = e.activePoint / e.nextLevelExp;
s.replaceLabel(this.myGuildExpLabel, [ e.activePoint, e.nextLevelExp ]);
this.myGuildIdLabel.string = e.guildId;
s.replaceLabel(this.myGuildMemberCountLabel, [ e.members.length, e.maxMemberCount ]);
}
this.myGuildNoticeBgSp.active = !!e.guildId;
this.myGuildNoticeBgSp.active && (this.myGuildNoticeLabel.string = e.notice || o.t("无"));
this.statusData.badgeId = e.badgeId || this.statusData.badgeId;
r.setSpriteFrame(this.myGuildBadgeSp, c["guild_" + this.statusData.badgeId + "_png"]);
e.guildId || this.onOther_();
(a = this.battle1Bt.getChildByName("battle_armature")).active = e.isGuildBattleOpen || e.isGuildBattleTodayOpen;
e.isGuildBattleOpen ? a.getComponent(sp.Skeleton).setAnimation(0, "action_1", !0) : e.isGuildBattleTodayOpen && a.getComponent(sp.Skeleton).setAnimation(0, "action_2", !0);
(a = this.battle2Bt.getChildByName("battle_armature")).active = e.isNewGuildBattleOpen;
e.isNewGuildBattleOpen && a.getComponent(sp.Skeleton).setAnimation(0, "action_1", !0);
},
onShop_: function() {
g.pushScene(g.NAME.SHOP_SCENE, {
type: m.SHOP.CONSTS.TYPE.GUILD
});
},
onBattle1_: function() {
var e = m.GUILD_BOSS.CONSTS.LEVEL_BETWEEN[0];
if (u.player.level < e) r.addHintPanel(o.t("战队等级达到$1开启", [ e ])); else {
var a = this;
r.addLoading();
d.openInfo(function(e) {
u.player.extra.guildBoss.openInfo = e._temp.openInfo;
r.addPanel(a.bossPanel, !1, !1, !0);
a.bossPanel.getComponent("guildBossPanel").update_();
l.playMusic(c.sound_music_guild_battle_mp3);
});
}
},
onBattle2_: function() {
var e = this;
r.addLoading();
h.openInfo(function(a) {
e.newGuildBattleShipItem.active = !1;
e.newGuildBattleRoleItem.active = !1;
e.newGuildBattleRankBt.active = !n.isHideRankBt;
r.addPanel(e.newGuildBattleReadyPanel, !1, !1, !0);
u.player.extra.newGuildBattle.openInfo = a._temp.openInfo;
var t = b.genData(), s = [ e.newGuildBattleTopBgSp.getChildByName("win_node"), e.newGuildBattleTopBgSp.getChildByName("fail_node") ];
for (var l in s) {
s[l].active = t.preBattleResults.length > 0;
if (s[l].active) {
var d = t.preBattleResults[l], h = s[l].getChildByName("badge_sp").getComponent(cc.Sprite);
r.setSpriteFrame(h, c["guild_" + d.badgeId + "_png"]);
s[l].getChildByName("guild_level_label").getComponent(cc.Label).string = o.t("LV.$1", [ d.guildLevel ]);
s[l].getChildByName("guild_name_label").getComponent(cc.Label).string = o.t("$1区 $2", [ d.serverId, d.guildName ]);
s[l].getChildByName("win_times_layout").getChildByName("value_label").getComponent(cc.Label).string = d.winTimes;
s[l].getChildByName("member_count_layout").getChildByName("value_label").getComponent(cc.Label).string = d.memberCount;
s[l].getChildByName("score_layout").getChildByName("value_label").getComponent(cc.Label).string = d.score;
}
}
e.newGuildBattleShowLabel.string = t.isOpen ? "" : o.t("开启时间:$1", [ i(u.tTime(t.openTime)).from(Date._now()) ]);
e.newGuildBattleBottomBgSp.active = t.isOpen || t.isReady;
e.newGuildBattleEnterBt.active = t.isOpen;
e.newGuildBattleModifiedBt.active = t.isReady;
if ((t.isReady || t.isOpen) && !t.isHaveTarget) {
e.newGuildBattleShowLabel.string = o.t("没有匹配到敌对家族，胜方奖励将在家族争霸结束后发送到邮箱！");
e.newGuildBattleEnterBt.active = !1;
}
if (e.newGuildBattleBottomBgSp.active) {
e.newGuildBattleHpLabel.string = t.hp;
e.newGuildBattlePowerLabel.string = t.power;
e.newGuildBattleReadyPanel.roleItemMap = e.newGuildBattleReadyPanel.roleItemMap || {};
r.preHideNodeMap(e.newGuildBattleReadyPanel.roleItemMap);
e.newGuildBattleReadyPanel.shipItemMap = e.newGuildBattleReadyPanel.shipItemMap || {};
r.preHideNodeMap(e.newGuildBattleReadyPanel.shipItemMap);
for (l = 0; l < t.shipItems.length; l++) {
var m = t.shipItems[l], g = e.newGuildBattleReadyPanel.shipItemMap[l];
if (!g) {
(g = cc.instantiate(e.newGuildBattleShipItem)).parent = e.newGuildBattleBottomBgSp.getChildByName("ship_" + (l + 1) + "_bg_sp");
e.newGuildBattleReadyPanel.shipItemMap[l] = g;
}
g.active = !0;
r.markHideNode(g);
g.getComponent("shipItem").update_(m);
}
for (l = 0; l < t.roleItems.length; l++) {
var p = t.roleItems[l], _ = e.newGuildBattleReadyPanel.roleItemMap[l];
if (!_) {
(_ = cc.instantiate(e.newGuildBattleRoleItem)).parent = e.newGuildBattleBottomBgSp.getChildByName("role_" + (l + 1) + "_bg_sp");
e.newGuildBattleReadyPanel.roleItemMap[l] = _;
}
_.active = !0;
r.markHideNode(_);
_.getComponent("roleItem").update_(p);
}
r.hideNodeMap(e.newGuildBattleReadyPanel.roleItemMap);
r.hideNodeMap(e.newGuildBattleReadyPanel.shipItemMap);
}
});
},
onCloseBattle1_: function() {
r.removePanel(this.bossPanel);
l.playMusic(c.sound_music_guild_mp3);
},
onCloseBattle2_: function() {
r.removePanel(this.newGuildBattleReadyPanel);
l.playMusic(c.sound_music_guild_mp3);
},
onOther_: function() {
var e = this;
r.addLoading();
p.list(function(a) {
e.data.guildList = a._temp.list;
r.addPanel(e.guildListPanel);
s.replaceLabel(e.createGuildCostLabel, [ v.CREATE_COST_GEM ]);
e.createGuildItem.active = !e.data.guildId;
if (!e.createGuildItem.active) {
var t = e.guildScrollView.getComponent(cc.Widget);
t.top = t.bottom = 0;
t.updateAlignment();
}
e.guildListPanel.guildItemMap = e.guildListPanel.guildItemMap || {};
r.preHideNodeMap(e.guildListPanel.guildItemMap);
for (var n in e.data.guildList) {
var i = e.guildListPanel.guildItemMap[n];
if (!i) {
(i = cc.instantiate(e.guildItem)).parent = e.guildItemsLayout;
i.idx = n;
e.guildListPanel.guildItemMap[n] = i;
}
i.active = !0;
r.markHideNode(i);
var o = e.data.guildList[n];
i.data = o;
var l = i.getChildByName("rank_num_label");
l.active = !1;
var d = i.getChildByName("rank_num_sp");
d.active = !1;
if (e["newGuildBattleRank" + o.rank + "SpriteFrame"]) {
d.active = !0;
d.getComponent(cc.Sprite).spriteFrame = e["newGuildBattleRank" + o.rank + "SpriteFrame"];
} else {
l.getComponent(cc.Label).string = o.rank;
l.active = !0;
}
r.setSpriteFrame(i.getChildByName("badge_sp").getComponent(cc.Sprite), c["guild_" + o.badgeId + "_png"]);
i.getChildByName("name_label").getComponent(cc.Label).string = o.name;
var h = i.getChildByName("level_label").getComponent(cc.Label);
s.replaceLabel(h, [ o.level ]);
i.getChildByName("leader_name_layout").getChildByName("value_label").getComponent(cc.Label).string = o.chairmanName;
var m = i.getChildByName("member_count_label").getChildByName("value_label").getComponent(cc.Label);
s.replaceLabel(m, [ o.menberCount, o.maxMemberCount ]);
i.getChildByName("active_point_label").getChildByName("value_label").getComponent(cc.Label).string = o.activePoint;
var g = i.getChildByName("join_bt");
g.active = !e.data.guildId;
g.data = {
guildId: o.id
};
var p = i.getChildByName("join_no_allow_label"), _ = i.getChildByName("join_require_label");
p.active = !1;
_.active = !1;
if (o.joinRequireType == v.JOIN_REQUIRE_TYPE.NOT_ALLOW) {
p.active = !0;
g.active = !1;
} else if (o.joinLevelLimit > 0 && g.active) {
o.joinLevelLimit > u.player.level && (g.getComponent(cc.Button).interactable = !1);
_.active = !0;
s.replaceLabel(_.getComponent(cc.Label), [ o.joinLevelLimit ]);
}
}
r.hideNodeMap(e.guildListPanel.guildItemMap);
});
},
onOtherClose_: function() {
u.player.guildId ? r.removePanel(this.guildListPanel) : g.popScene();
},
onGuildItemJoin_: function(e) {
var a = e.target.data, t = this;
r.addLoading();
p.applyJoin(a.guildId, function(e) {
if (e.guildId) {
r.addLoading();
p.info(function() {
t.update_();
});
r.removePanel(t.guildListPanel);
} else r.addHintPanel(o.t("已申请"));
});
},
onEnterIdJoin_: function() {
this.guildIdEditbox.string = this.guildIdEditbox.string;
r.addPanel(this.joinPanel, !0);
},
onEnterIdJoinYes_: function() {
var e = Number(this.guildIdEditbox.string);
if ("" != e) if (isNaN(e)) r.addHintPanel(o.t("请输入数字")); else {
var a = this;
r.addLoading();
p.applyJoin(e, function(e) {
if (e.guildId) {
r.addLoading();
p.info(function() {
a.update_();
});
}
r.removePanel(a.joinPanel);
r.removePanel(a.guildListPanel);
});
} else r.addHintPanel(o.t("请输入ID"));
},
onCreateGuild_: function() {
r.addPanel(this.createPanel, !0);
this.guildNameEditbox.string = this.guildNameEditbox.string;
r.setSpriteFrame(this.createPanelBadgeSp, c["guild_" + this.statusData.badgeId + "_png"]);
},
onSelectBadge_: function() {
r.addPanel(this.modifyBadgePanel, !0);
this.modifyBadgePanel.badgeImgSpMap = this.modifyBadgePanel.badgeImgSpMap || {};
var e = this.modifyBadgePanel.badgeImgSpMap;
r.preHideNodeMap(e);
var a = n.badgeImgIds || t.range(1, 16);
for (var i in a) {
var s = e[i];
if (!s) {
(s = cc.instantiate(this.modifyBadgeBadgeSp)).parent = this.modifyBadgeBadgeSpsLayout;
s.idx = i;
e[i] = s;
}
s.active = !0;
r.markHideNode(s);
var o = a[i];
s.data = {
imgId: o
};
r.setSpriteFrame(s.getComponent(cc.Sprite), c["guild_" + o + "_png"]);
}
r.hideNodeMap(e);
},
onSelectBadgeClose_: function() {
r.removePanel(this.modifyBadgePanel);
},
onBadge_: function(e) {
var a = e.target.data;
this.statusData.badgeId = a.imgId;
this.createPanel.isPanel && r.setSpriteFrame(this.createPanelBadgeSp, c["guild_" + this.statusData.badgeId + "_png"]);
this.settingPanel.isPanel && r.setSpriteFrame(this.settingBadgeSp, c["guild_" + this.statusData.badgeId + "_png"]);
r.removePanel(this.modifyBadgePanel);
},
onCreateGuildYes_: function() {
var e = this.guildNameEditbox.string;
if ("" != e) {
e.length > this.guildNameEditbox.maxLength && (e = e.slice(0, this.guildNameEditbox.maxLength));
var a = this;
r.addLoading();
p.create(e, this.statusData.badgeId, function() {
r.addLoading();
p.info(function() {
a.update_();
});
r.removePanel(a.createPanel);
r.removePanel(a.guildListPanel);
});
} else r.addHintPanel(o.t("请输入名称"));
},
onMember_: function() {
r.addPanel(this.memberPanel);
this.memberManageBt.active = t.include(this.data._guild.viceChairmanIds, u.player.id) || u.player.id == this.data._guild.chairmanId;
s.replaceLabel(this.memberCountLabel, [ this.data.members.length, this.data.maxMemberCount ]);
this.memberPanel.memberItemMap = this.memberPanel.memberItemMap || {};
r.preHideNodeMap(this.memberPanel.memberItemMap);
for (var e in this.data.members) {
var a = this.memberPanel.memberItemMap[e];
if (!a) {
(a = cc.instantiate(this.memberItem)).parent = this.memberItemsLayout;
a.idx = e;
this.memberPanel.memberItemMap[e] = a;
}
a.active = !0;
r.markHideNode(a);
var n = this.data.members[e], i = a.getChildByName("player_item_layout"), l = i.getChildByName("player_item");
l.getComponent("playerItem").update_(n.playerPhotoInfo);
l.getComponent("playerItem").setClickEvent_(this.node, "guildScene", "onMemberViewTeam_");
l.data = {
defenderId: n.playerId
};
i.getChildByName("name_label").getComponent(cc.Label).string = n.playerName;
var c = i.getChildByName("level_label").getComponent(cc.Label);
s.replaceLabel(c, [ n.playerLevel ]);
a.getChildByName("give_active_point_label").getChildByName("value_label").getComponent(cc.Label).string = this.data._guild.giveActivePointMap[n.playerId] || 0;
var d = a.getChildByName("job_label").getComponent(cc.Label);
d.string = "";
this.data._guild.chairmanId == n.playerId ? d.string = o.t("族长") : t.include(this.data._guild.viceChairmanIds, n.playerId) && (d.string = o.t("副族长"));
var h = a.getChildByName("worship_bt");
h.data = {
playerId: n.playerId
};
h.active = !1;
n.playerId != u.player.id && (n.playerLevel > u.player.level || n.playerId == this.data._guild.chairmanId || t.include(this.data._guild.viceChairmanIds, n.playerId)) && (h.active = !0);
var m = a.getChildByName("exit_bt");
m.active = !1;
n.playerId == u.player.id && n.playerId != this.data._guild.chairmanId && (m.active = !0);
}
r.hideNodeMap(this.memberPanel.memberItemMap);
},
onMemberViewTeam_: k.prototype.onRankItem_,
onMemberClose_: function() {
r.removePanel(this.memberPanel);
},
onWorship_: function(e) {
var a = e.target.data;
r.addPanel(this.worshipPanel, !0);
for (var n = 0; n < 3; n++) {
var i = t.values(v.WORSHIP_TYPE)[n], s = this.worshipPanel.getChildByName("layout_" + (n + 1)), o = s.getChildByName("get_ap_layout").getChildByName("value_label").getComponent(cc.Label), l = s.getChildByName("get_active_point_layout").getChildByName("value_label").getComponent(cc.Label);
o.string = v.WORSHIP_GET_ACTION_POINT_MAP[i];
l.string = v.WORSHIP_GET_ACTIVE_POINT_MAP[i];
var c = s.getChildByName("worship_bt");
c.data = {
type: i,
targetId: a.playerId
};
var d = c.getChildByName("cost_label");
if (d) {
d = d.getComponent(cc.Label);
i == v.WORSHIP_TYPE.COIN ? d.string = v.WORSHIP_COIN_COST : i == v.WORSHIP_TYPE.GEM && (d.string = v.WORSHIP_GEM_COST);
}
}
},
onWorshipClose_: function() {
r.removePanel(this.worshipPanel);
},
onWorshipTarget_: function(e) {
var a = e.target.data, t = this;
r.addLoading();
p.worship(a.targetId, a.type, function() {
r.addHintPanel(o.t("成功膜拜"));
r.removePanel(t.worshipPanel);
t.update_();
});
},
onWorshipReward_: function() {
r.addPanel(this.worshipRewardPanel, !0);
s.replaceLabel(this.beWorshipTimesLabel, [ this.data.beWorshipTimes ]);
this.beWorshipGetCoinLabel.string = this.data.beWorshipAwardCoin;
},
onWorshipRewardClose_: function() {
r.removePanel(this.worshipRewardPanel);
},
onReceiveWorshipReward_: function() {
var e = this;
r.addLoading();
p.receiveWorshipAward(function() {
r.addHintPanel(o.t("领取成功"));
r.removePanel(e.worshipRewardPanel);
e.data.beWorshipAwardCoin = 0;
});
},
onLog_: function() {
r.addPanel(this.logPanel, !0);
this.logPanel.logItemMap = this.logPanel.logItemMap || {};
r.preHideNodeMap(this.logPanel.logItemMap);
t.each(this.logItemsLayout.children, function(e) {
"logDateLabel" == e.name && e.destroy();
});
for (var e = 1, a = 0; a < this.data.logList.length; a++) {
var n = this.data.logList[a], s = i(new Date(u.tTime(n.ctime))).format("M/D"), l = 0 == a ? null : i(new Date(u.tTime(this.data.logList[a - 1].ctime))).format("M/D");
if (!l || s != l) {
var c = cc.instantiate(this.logDateLabel);
c.parent = this.logItemsLayout;
c.active = !0;
r.markHideNode(c);
c.getComponent(cc.Label).string = s;
c.name = "logDateLabel";
c.zIndex = e;
e++;
}
var d = this.logPanel.logItemMap[a];
if (!d) {
(d = cc.instantiate(this.logItem)).parent = this.logItemsLayout;
d.idx = a;
this.logPanel.logItemMap[a] = d;
}
d.zIndex = e;
e++;
d.active = !0;
r.markHideNode(d);
d.getChildByName("time_label").getComponent(cc.Label).string = i(new Date(u.tTime(n.ctime))).format("HH:mm");
d.getChildByName("player_name_label").getComponent(cc.Label).string = n.playerName;
d.getChildByName("action_label").getComponent(cc.Label).string = o.t(n.msg);
}
r.hideNodeMap(this.logPanel.logItemMap);
},
onLogClose_: function() {
r.removePanel(this.logPanel);
},
onExitGuild_: function() {
var e = this;
r.addMessageBox(o.t("是否退出家族?(一周只能加入$1次家族)", [ m.GUILD.CONSTS.A_WEEK_JOIN_TIMES ]), function() {
r.addLoading();
p.exit(u.player.id, u.player.name, function() {
u.player.guild = {};
r.removePanel(e.memberPanel);
e.update_();
});
});
},
onActivity_: function() {
r.addPanel(this.activityPanel, !0);
s.replaceLabel(this.drumDescLabel, [ v.DRUM_TIMES ]);
s.replaceLabel(this.openBoxDescLabel, [ v.OPEN_BOX_TIMES ]);
s.replaceLabel(this.drumTimesLabel, [ this.data.remainingDrumTimes ]);
s.replaceLabel(this.openBoxTimesLabel, [ this.data.remainingOpenBoxTimes ]);
},
onActivityClose_: function() {
r.removePanel(this.activityPanel);
},
onCola_: function() {
r.addPanel(this.colaPanel, !1, !1, !0);
for (var e = 0; e < 3; e++) {
var a = t.values(v.DRUM_TYPE)[e], n = this.colaPanel.getChildByName("node_" + (e + 1));
n.data = {
type: a,
getActivePoint: v.DRUM_GET_GUILD_ACTIVE_POINT_MAP[a],
getGuildCoin: v.DRUM_GET_GUILD_COIN_MAP[a],
costCoin: 0,
costGem: 0
};
var i = n.getChildByName("reward_bg_sp"), s = i.getChildByName("active_point_layout").getChildByName("value_label").getComponent(cc.Label), o = i.getChildByName("money_layout").getChildByName("value_label").getComponent(cc.Label), l = i.getChildByName("cost_layout").getChildByName("value_label").getComponent(cc.Label);
s.string = v.DRUM_GET_GUILD_ACTIVE_POINT_MAP[a];
o.string = v.DRUM_GET_GUILD_COIN_MAP[a];
if (a == v.DRUM_TYPE.TYPE_1) {
n.data.costCoin = v.DRUM_TYPE_1_COST_COIN;
l.string = n.data.costCoin;
} else {
n.data.costGem = v.DRUM_COST_GEM_MAP[a];
l.string = n.data.costGem;
}
n.effectArmature = n.getChildByName("effect_armature");
}
},
onColaClose_: function() {
r.removePanel(this.colaPanel);
this.onActivity_();
},
onColaDrum_: function(e) {
var a = e.target, t = a.data;
if (u.player.coin < t.costCoin) r.addHintPanel(o.t("金币不足")); else if (u.player.gem < t.costGem) r.addHintPanel(o.t("钻石不足")); else if (0 != this.data.remainingDrumTimes) {
a.effectArmature.getComponent(sp.Skeleton).setAnimation(0, "action_2", !1);
var n = this;
r.addLoading();
this.scheduleOnce(function() {
p.drum(t.type, function() {
n.update_();
r.addHintPanel(o.t("获得:家族活跃度X$1 家族币X$2", [ t.getActivePoint, t.getGuildCoin ]));
});
}, 1);
l.playEffect(c.sound_effect_cola_mp3);
} else r.addHintPanel(o.t("今日次数已用完"));
},
onOpenBox_: function() {
r.addPanel(this.boxPanel, !1, !1, !0);
var e = this.boxPanel.getChildByName("say_bg_sp"), a = e.getChildByName("no_times_label"), t = e.getChildByName("free_label"), n = e.getChildByName("cost_label"), i = e.getChildByName("gift_label");
a.active = !1;
t.active = !1;
n.active = !1;
i.active = !1;
if (null == this.data.openBoxCostGem) a.active = !0; else if (0 == this.data.openBoxCostGem) {
t.active = !0;
s.replaceLabel(t.getComponent(cc.Label), [ this.data.openBoxTimes ]);
i.active = !0;
} else {
n.active = !0;
s.replaceLabel(n.getComponent(cc.Label), [ this.data.openBoxCostGem, this.data.openBoxTimes ]);
i.active = !0;
}
s.replaceLabel(i.getComponent(cc.Label), [ this.data.openBoxGetExp, this.data.openBoxGetActivePoint ]);
var o = this.boxPanel.getChildByName("get_soul_node");
o.active = this.data.openBoxItemItems.length > 0;
for (var l = 0; l < this.data.openBoxItemItems.length; l++) o.getChildByName("item_item_" + (l + 1)).getComponent("itemItem").update_(this.data.openBoxItemItems[l]);
},
onOpenBoxClose_: function() {
r.removePanel(this.boxPanel);
this.onActivity_();
},
onBox_: function(e) {
var a = e.target;
if (0 != this.data.remainingOpenBoxTimes) {
a.getComponent(cc.Button).interactable = !1;
var t = a.getChildByName("box_node").getChildByName("armature").getComponent(sp.Skeleton), n = this;
r.addLoading();
p.openBox(function(e) {
t.setAnimation(0, "action_2", !1);
t.setCompleteListener(function() {
t.setCompleteListener(null);
n.update_();
n.onOpenBox_();
r.addRewardEffectPanel(e._temp.entityCountMap);
});
});
} else r.addHintPanel(o.t("今日次数已用完"));
},
onSkill_: function() {
r.addPanel(this.skillPanel);
this.skillMoneyLabel.string = this.data.guildCoin;
var e = this.skillPanel.getChildByName("content_layout"), a = {
HP: e.getChildByName("skill_item_1"),
ATK: e.getChildByName("skill_item_2"),
DEF: e.getChildByName("skill_item_3"),
MDEF: e.getChildByName("skill_item_4")
};
for (var t in a) {
var n = a[t], i = n.getChildByName("level_label").getChildByName("value_label").getComponent(cc.Label), l = n.getChildByName("attr_sp"), c = l.getChildByName("attr_label").getComponent(cc.Label), d = [ this.data.guildSkill.levelMap[t] ];
if (d > (i.preLevel || d)) {
s.scaleEffect(l);
s.spineEffect(this.skillEffectSpine);
this.skillEffectSpine.y = n.y + 20;
}
i.preLevel = d;
s.replaceLabel(i, [ this.data.guildSkill.levelMap[t] ]);
s.replaceLabel(c, [ this.data.guildSkill.attr[t.toLocaleLowerCase()] ]);
var h = n.getChildByName("unlock_level_label").getComponent(cc.Label);
s.replaceLabel(h, [ this.data.guildLevel + 1 ]);
this.data.nextSkillLLevelLimitMap[t] || (h.string = o.t("已满级"));
h.node.active = this.data.guildSkill.levelMap[t] >= this.data.skillLevelLimitMap[t];
var u = n.getChildByName("upgrade_bt");
u.data = {
type: t
};
u.getChildByName("value_label").getComponent(cc.Label).string = this.data.upgradeSkillCostGuildCoin;
}
},
onSkillClose_: function() {
r.removePanel(this.skillPanel);
},
onUpgradeSkill_: function(e) {
var a = e.target.data, t = this;
r.addLoading();
p.upgradeSkill(a.type, function() {
t.update_();
t.onSkill_();
l.playEffect(c.sound_effect_eqpt_evolve_mp3);
});
},
onManage_: function() {
r.addPanel(this.managePanel, !0);
},
onApplyList_: function() {
r.addPanel(this.applyListPanel, !0);
this.applyListPanel.memberItemMap = this.applyListPanel.memberItemMap || {};
r.preHideNodeMap(this.applyListPanel.memberItemMap);
for (var e in this.data.applyPlayerList) {
var a = this.applyListPanel.memberItemMap[e];
if (!a) {
(a = cc.instantiate(this.applyListMemberItem)).parent = this.applyListMemberItemsLayout;
a.idx = e;
this.applyListPanel.memberItemMap[e] = a;
}
a.active = !0;
r.markHideNode(a);
var t = this.data.applyPlayerList[e], n = a.getChildByName("player_item_layout");
n.getChildByName("player_item").getComponent("playerItem").update_(t.playerPhotoInfo);
n.getChildByName("name_label").getComponent(cc.Label).string = t.playerName;
n.getChildByName("level_label").getComponent(cc.Label).string = o.t("LV.$1", [ t.playerLevel ]);
var i = a.getChildByName("refuse_bt"), s = a.getChildByName("agree_bt");
i.data = s.data = t;
i.memberItem = s.memberItem = a;
}
r.hideNodeMap(this.applyListPanel.memberItemMap);
this.applyListNullLabel.active = 0 == this.data.applyPlayerList.length;
},
onApplyListClose_: function() {
r.removePanel(this.applyListPanel);
},
onApplyRefuse_: function(e) {
var a = e.target, n = e.target.data, i = this;
r.addLoading();
p.handleApply(!1, n.playerId, n.playerName, function() {
u.player.guild.applyPlayerList = t.without(u.player.guild.applyPlayerList, n);
a.memberItem.active = !1;
i.update_();
});
},
onApplyAgree_: function(e) {
var a = e.target, n = e.target.data, i = this;
r.addLoading();
p.handleApply(!0, n.playerId, n.playerName, function() {
u.player.guild.applyPlayerList = t.without(u.player.guild.applyPlayerList, n);
u.player.guild.members.push(n);
a.memberItem.active = !1;
i.update_();
});
},
onMemberManage_: function() {
r.addPanel(this.memberManagePanel, !0);
s.replaceLabel(this.memberManageMemberCountLabel, [ this.data.members.length, this.data.maxMemberCount ]);
this.memberManagePanel.memberItemMap = this.memberManagePanel.memberItemMap || {};
r.preHideNodeMap(this.memberManagePanel.memberItemMap);
for (var e in this.data.members) {
var a = this.memberManagePanel.memberItemMap[e];
if (!a) {
(a = cc.instantiate(this.memberManageMemberItem)).parent = this.memberManageMemberItemsLayout;
a.idx = e;
this.memberManagePanel.memberItemMap[e] = a;
}
a.active = !0;
r.markHideNode(a);
var n = this.data.members[e];
a.data = n;
var l = a.getChildByName("player_item_layout");
l.getChildByName("player_item").getComponent("playerItem").update_(n.playerPhotoInfo);
l.getChildByName("name_label").getComponent(cc.Label).string = n.playerName;
l.getChildByName("level_label").getComponent(cc.Label).string = o.t("LV.$1", [ n.playerLevel ]);
var c = a.getChildByName("job_label").getComponent(cc.Label);
c.string = "";
this.data._guild.chairmanId == n.playerId ? c.string = o.t("族长") : t.include(this.data._guild.viceChairmanIds, n.playerId) && (c.string = o.t("副族长"));
a.getChildByName("last_atime_label").getChildByName("value_label").getComponent(cc.Label).string = i(u.tTime(n.atime)).from(Date._now());
}
r.hideNodeMap(this.memberManagePanel.memberItemMap);
},
onMemberManageClose_: function() {
r.removePanel(this.memberManagePanel);
},
onMemberItemManage_: function(e) {
var a = e.target.data;
if (a.playerId != u.player.id) if (a.playerId != this.data._guild.chairmanId) {
r.addPanel(this.memberItemManagePanel, !0, !1, !0);
var n = this.memberItemManagePanel.getChildByName("player_item_layout");
n.getChildByName("player_item").getComponent("playerItem").update_(a.playerPhotoInfo);
n.getChildByName("name_label").getComponent(cc.Label).string = a.playerName;
n.getChildByName("level_label").getComponent(cc.Label).string = o.t("LV.$1", [ a.playerLevel ]);
var i = this.memberItemManagePanel.getChildByName("job_label").getComponent(cc.Label);
i.string = "";
if (t.include(this.data._guild.viceChairmanIds, a.playerId)) {
i.string = o.t("副族长");
this.operateViceChairmanBt.getChildByName("Label").getComponent(cc.Label).string = o.t("撤销副族长");
} else this.operateViceChairmanBt.getChildByName("Label").getComponent(cc.Label).string = o.t("升为副族长");
this.operateViceChairmanBt.active = this.operateChairmanBt.active = u.player.id == this.data._guild.chairmanId;
this.operateViceChairmanBt.data = this.operateChairmanBt.data = this.exitGuildBt.data = a;
} else r.addHintPanel(o.t("不能操作族长")); else r.addHintPanel(o.t("不能操作自己"));
},
onOperateViceChairman_: function(e) {
var a = e.target.data, n = this;
r.addLoading();
t.include(this.data._guild.viceChairmanIds, a.playerId) ? p.removeViceChairman(a.playerId, a.playerName, function() {
r.addHintPanel(o.t("操作成功"));
r.removePanel(n.memberItemManagePanel);
n.update_();
n.onMemberManage_();
}) : p.addViceChairman(a.playerId, a.playerName, function() {
r.addHintPanel(o.t("操作成功"));
r.removePanel(n.memberItemManagePanel);
n.update_();
n.onMemberManage_();
});
},
onOperateChairman_: function(e) {
var a = e.target.data, t = this;
r.addMessageBox(o.t("是否将族长位置让给这个会员，自己将变成普通会员?"), function() {
r.addLoading();
p.changeChairman(a.playerId, a.playerName, function() {
r.addHintPanel(o.t("操作成功"));
r.removePanel(t.memberItemManagePanel);
r.removePanel(t.memberManagePanel);
r.removePanel(t.managePanel);
t.update_();
});
});
},
onKickGuild_: function(e) {
var a = e.target.data, n = this;
r.addMessageBox(o.t("是否将这个会员踢出家族?"), function() {
r.addLoading();
p.exit(a.playerId, a.playerName, function() {
r.addHintPanel(o.t("操作成功"));
u.player.guild.members = t.without(u.player.guild.members, a);
r.removePanel(n.memberItemManagePanel);
n.update_();
n.onMemberManage_();
});
});
},
onModifyNotice_: function() {
r.addPanel(this.modifyNoticePanel, !0);
this.noticeEditbox.string = this.data.guildNotice;
},
onModifyNoticeYes_: function() {
var e = this;
r.addLoading();
var a = this.noticeEditbox.string;
a.length > this.noticeEditbox.maxLength && (a = a.slice(0, this.noticeEditbox.maxLength));
p.modifyNotice(a, function() {
e.update_();
r.removePanel(e.modifyNoticePanel);
});
},
onSetting_: function() {
r.addPanel(this.settingPanel);
r.setSpriteFrame(this.settingBadgeSp, c["guild_" + this.data.badgeId + "_png"]);
this.settingGuildNameEditbox.string = this.data.guildName;
this.settingGuildNameEditbox.node.parent.active = u.player.id == this.data._guild.chairmanId;
this.statusData.badgeId = this.data.badgeId;
this.statusData.joinRequireType = this.data.joinRequireType;
this.statusData.joinLevelLimit = this.data.joinLevelLimit;
this.settingJoinRequireLabel.string = this.data.joinRequireStrMap[this.statusData.joinRequireType];
this.settingLevelLimitLabel.string = this.statusData.joinLevelLimit;
s.replaceLabel(this.settingHintLabel, [ v.A_WEEK_MODIFY_NAME_TIMES ]);
},
onSettingClose_: function() {
r.removePanel(this.settingPanel);
},
onSettingRequireTypeInc_: function(e, a) {
var t = Number(a);
this.statusData.joinRequireType += t;
this.statusData.joinRequireType < 1 && (this.statusData.joinRequireType = 3);
this.statusData.joinRequireType > 3 && (this.statusData.joinRequireType = 1);
this.settingJoinRequireLabel.string = this.data.joinRequireStrMap[this.statusData.joinRequireType];
},
onSettingJoinLevelInc_: function(e, a) {
var t = Number(a);
this.statusData.joinLevelLimit += t;
this.statusData.joinLevelLimit < 1 && (this.statusData.joinLevelLimit = 1);
this.statusData.joinLevelLimit > 100 && (this.statusData.joinLevelLimit = 100);
this.settingLevelLimitLabel.string = this.statusData.joinLevelLimit;
},
onSettingYes_: function() {
var e = this;
r.addLoading();
var a = this.settingGuildNameEditbox.string;
if ("" != a) {
a.length > this.settingGuildNameEditbox.maxLength && (a = a.slice(0, this.settingGuildNameEditbox.maxLength));
p.modifySetting(this.statusData.badgeId, a, this.statusData.joinRequireType, this.statusData.joinLevelLimit, function() {
r.removePanel(e.settingPanel);
e.update_();
r.addHintPanel(o.t("修改成功"));
});
} else r.addHintPanel(o.t("请输入名称"));
},
onInherit_: function() {
var e = this;
r.addLoading();
p.inherit(function() {
r.addHintPanel(o.t("继承成功"));
r.removePanel(e.managePanel);
e.update_();
});
},
onDissolve_: function() {
var e = this;
r.addMessageBox(o.t("是否将家族解散?"), function() {
r.addLoading();
p.dismiss(function() {
r.addHintPanel(o.t("解散成功"));
r.removePanel(e.managePanel);
u.player.guild = {};
e.update_();
});
});
},
onNewGuildBattleEnter_: function() {
r.addLoading();
h.enter(function(e) {
u.player.extra.newGuildBattle.battleInfo = e._temp.battleInfo;
g.pushScene(g.NAME.NEW_GUILD_BATTLE_SCENE);
});
},
onNewGuildBattleRule_: function() {
r.addRulePanel(f.TYPE.NEW_GUILD_BATTLE);
},
onNewGuildBattleRank_: function() {
var e = this;
r.addLoading();
h.winTimesRank(function(a) {
r.addPanel(e.newGuildBattleRankPanel);
e.newGuildBattleRankItem.active = !1;
var t = a._temp.list;
e.newGuildBattleRankPanel.rankItemMap = e.newGuildBattleRankPanel.rankItemMap || {};
r.preHideNodeMap(e.newGuildBattleRankPanel.rankItemMap);
for (var n in t) {
var i = t[n], o = e.newGuildBattleRankPanel.rankItemMap[n];
if (!o) {
(o = cc.instantiate(e.newGuildBattleRankItem)).parent = e.newGuildBattleRankItemsLayout;
e.newGuildBattleRankPanel.rankItemMap[n] = o;
}
o.active = !0;
r.markHideNode(o);
var l = o.getChildByName("rank_num_label");
l.active = !1;
var d = o.getChildByName("rank_num_sp");
d.active = !1;
if (e["rank" + i.rank + "SpriteFrame"]) {
d.active = !0;
d.getComponent(cc.Sprite).spriteFrame = e["rank" + i.rank + "SpriteFrame"];
} else {
l.getComponent(cc.Label).string = i.rank;
l.active = !0;
}
var h = o.getChildByName("badge_sp").getComponent(cc.Sprite);
r.setSpriteFrame(h.getComponent(cc.Sprite), c["guild_" + i.badgeId + "_png"]);
var u = o.getChildByName("info_layout"), m = u.getChildByName("guild_name_label").getComponent(cc.Label), g = u.getChildByName("guild_level_label").getComponent(cc.Label);
s.replaceLabel(m, [ i.serverId, i.guildName ]);
s.replaceLabel(g, [ i.guildLevel ]);
o.getChildByName("member_count_layout").getChildByName("value_label").getComponent(cc.Label).string = i.memberCount;
o.getChildByName("win_times_layout").getChildByName("value_label").getComponent(cc.Label).string = i.winTimes;
o.getChildByName("fail_times_layout").getChildByName("value_label").getComponent(cc.Label).string = i.loseTimes;
}
r.hideNodeMap(e.newGuildBattleRankPanel.rankItemMap);
});
},
onCloseNewGuildBattleRank_: function() {
r.removePanel(this.newGuildBattleRankPanel);
},
onNewGuildBattleModified_: function() {
g.pushScene(g.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: y.TYPE.NEW_GUILD_BATTLE_DEFENSE_TEAM
});
}
});
S.genData = function() {
var e = u.player, a = e.guild, n = e.extra.guildBattle.openInfo, i = e.extra.newGuildBattle.openInfo, r = a.members ? t.sortBy(a.members, function(n) {
return n.playerId == e.id ? 1 : n.playerId == a.chairmanId ? 2 : t.include(a.viceChairmanIds, n.playerId) ? 3 : void 0;
}) : [], s = v.LEVEL_NEED_EXPS[a.level + 1] || 0, l = t.sortBy(a.logList, function(e) {
return -e.ctime;
}), c = v.OPEN_BOX_TIMES - a.openBoxTimes, d = v.DRUM_TIMES - a.drumTimes, h = a.openBoxTimes + 1, g = [], p = m.GUILD.FUNS.getOpenBoxSoulCount(h);
if (p > 0) for (var k in a.openBoxSoulIds) {
var f = _.genData({
kindId: a.openBoxSoulIds[k],
count: p
}, !0);
g.push(f);
}
var y = m.GUILD.FUNS.getOpenBoxCost(h), b = m.GUILD.FUNS.getOpenBoxExp(h), S = m.GUILD.FUNS.getOpenBoxActivePoint(h), T = e.bag.getItemCount(m.CONSTS.ENTITY_ID.GUILD_COIN), M = {}, $ = {}, I = m.GUILD.CONSTS.UNLOCK_MAX_SKILL_LEVEL_MAP;
for (var C in I) {
M[C] = I[C][a.level];
$[C] = I[C][a.level + 1];
}
var P = m.GUILD.CONSTS.UPGRADE_SKILL_COST, D = {
1: o.t("所有人都可以加入"),
2: o.t("需要批准才能加入"),
3: o.t("不允许任何人加入")
}, N = n && n.isOpen, A = n && !n.isOpen && new Date(u.tTime(n.openTime)).getDay() == new Date(Date._now()).getDay(), L = i && i.isOpen;
return {
guildId: a.id,
guildName: a.name,
badgeId: a.badgeId,
chairmanName: a.chairmanName,
notice: a.notice,
applyInfoMap: a.applyInfoMap,
guildLevel: a.level,
activePoint: a.activePoint,
nextLevelExp: s,
members: r,
logList: l,
maxMemberCount: a.maxMemberCount,
beWorshipTimes: a.beWorshipTimes,
beWorshipAwardCoin: a.beWorshipAwardCoin,
remainingOpenBoxTimes: c,
remainingDrumTimes: d,
openBoxTimes: h,
openBoxItemItems: g,
openBoxCostGem: y,
openBoxGetExp: b,
openBoxGetActivePoint: S,
guildCoin: T,
guildSkill: e.guildSkill,
skillLevelLimitMap: M,
nextSkillLLevelLimitMap: $,
upgradeSkillCostGuildCoin: P,
guildNotice: a.notice,
joinRequireType: a.joinRequireType,
joinLevelLimit: a.joinLevelLimit,
joinRequireStrMap: D,
applyPlayerList: a.applyPlayerList,
isGuildBattleOpen: N,
isGuildBattleTodayOpen: A,
isNewGuildBattleOpen: L,
_guild: a
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
guide: "guide",
guildBossHandler: "guildBossHandler",
guildHandler: "guildHandler",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
newGuildBattleHandler: "newGuildBattleHandler",
newGuildBattleScene: "newGuildBattleScene",
rankPanel: "rankPanel",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
