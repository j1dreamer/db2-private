homeScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "0b314TMDzFMLoWTUu8ewzua", "homeScene");
var t, n = e("underscore"), i = e("moment"), r = e("resource"), s = e("baseView"), o = (e("socket"), 
e("helper")), l = e("dataApi"), c = e("serverMain"), d = e("clientConfig"), h = e("serverConfig"), u = e("player"), m = e("i18n"), g = e("soundApi"), p = e("guide"), _ = e("guideNode"), k = e("buildExt"), f = e("newGuildBattleHandler"), y = e("worshipBattleHandler"), b = e("allServerBattleHandler"), v = e("doubleBattleHandler"), S = e("arenaHandler"), T = (e("arena3v3Handler"), 
e("guildHandler")), M = e("friendHandler"), $ = (e("rankHandler"), e("teamBattleHandler")), I = e("sceneManager"), C = (e("playerItem"), 
e("coinTopNode")), P = e("crossServerScene"), D = e("firstTopUpPanel"), N = e("triggerTopUpPanel"), A = e("idfaPanel"), L = e("loginRewardPanel"), E = e("loginReward2Panel"), B = e("loginReward3Panel"), w = e("loginReward4Panel"), G = e("btActivityPanel"), R = e("spActivityPanel"), H = e("mainTaskPanel"), x = e("unlockPanel"), K = e("exchangePanel"), F = e("exchange2Panel"), V = e("endlessRewardPanel"), O = e("returnGift2Panel"), U = e("acePackPanel"), W = e("guildScene"), Y = (e("skillItem"), 
e("roleItem"), e("playerHandler")), j = e("strongGoalPanel"), q = e("diyGiftPackPanel"), X = e("diyGiftPack2Panel"), z = e("diyGiftPack3Panel"), J = e("discountActivityPanel"), Z = e("dreamActivityPanel"), Q = e("scorePointPanel"), ee = (e("dial2Panel"), 
e("starSignPointPanel")), ae = e("dreamExtActivityPanel"), te = h.ACTIVITY.CONSTS.STATUS, ne = cc.Class(((t = {
extends: cc.Component,
properties: {
scrollView: cc.ScrollView,
serverTimeLabel: cc.Label,
playerItem: cc.Node,
nameLabel: cc.Label,
powerLabel: cc.Label,
powerIncLabel: cc.Node,
powerRedLabel: cc.Node,
levelLabel: cc.Label,
vipLabel: cc.Label,
vipPanelSp: cc.Sprite,
topUpPointNode: cc.Node,
mainTaskNameLabel: cc.Node,
taskCompleteColor: cc.Color,
taskUnCompleteColor: cc.Color,
unlockNode: cc.Node,
unlockIconSp: cc.Sprite,
unlockNameLabel: cc.Label,
unlockLevelLabel: cc.Label,
myArmatureNode: cc.Node,
firstTopUpBt: cc.Node,
topUpBt: cc.Node,
activityBt: cc.Node,
activityNewRoleBt: cc.Node,
activityBuyGoods1Bt: cc.Node,
activityBuyGoods2Bt: cc.Node,
topUpActivityBt: cc.Node,
idfaBt: cc.Node,
fbRewardBt: cc.Node,
dialBt: cc.Node,
dial2Bt: cc.Node,
carnivalBt: cc.Node,
carnival2Bt: cc.Node,
topUpRankBt: cc.Node,
costGemRankBt: cc.Node,
powerRankBt: cc.Node,
pointRankBt: cc.Node,
dialSvipRankBt: cc.Node,
triggerTopUpBt: cc.Node,
triggerTopUpLabel: cc.Label,
loginRewardBt: cc.Node,
loginReward3Bt: cc.Node,
loginReward4Bt: cc.Node,
btActivityBt: cc.Node,
packActivityBt: cc.Node,
taskActiveBt: cc.Node,
battleBt: cc.Node,
friendBt: cc.Node,
guildBt: cc.Node,
mapBt: cc.Node,
barBt: cc.Node,
shopBt: cc.Node,
mailBt: cc.Node,
crossBt: cc.Node,
arenaBt: cc.Node,
arena3v3Bt: cc.Node,
prestigeBattleBt: cc.Node,
teamBattleBt: cc.Node,
bossBattleBt: cc.Node,
worshipBattleBt: cc.Node,
exchangeBt: cc.Node,
exchangeLabel: cc.Label,
exchange2Bt: cc.Node,
exchange2Label: cc.Label,
spActivityBt: cc.Node,
settingPanel: cc.Node,
renamePanel: cc.Node,
modifyPhotoPanel: cc.Node,
receiveGiftPanel: cc.Node,
mailPanel: cc.Node,
mailViewPanel: cc.Node,
sendMailPanel: cc.Node,
friendPanel: cc.Node,
addFriendPanel: cc.Node,
viewFriendPanel: cc.Node,
chatPanel: cc.Node,
mainTaskPanel: cc.Node,
unlockPanel: cc.Node,
activityPanel: cc.Node,
spActivityTipsNode: cc.Node,
spActivityPanel: cc.Node,
activityNewRolePanel: cc.Node,
firstTopUpPanel: cc.Node,
carnivalPanel: cc.Node,
carnival2Panel: cc.Node,
dialPanel: cc.Node,
dial2Panel: cc.Node,
triggerTopUpPanel: cc.Node,
taskActiveTopUpPanel: cc.Node,
loginRewardPanel: cc.Node,
loginReward2Panel: cc.Node,
loginReward3Panel: cc.Node,
loginReward4Panel: cc.Node,
btActivityPanel: cc.Node,
scorePointBt: cc.Node,
scorePointPanel: cc.Node,
languagePanel: cc.Node,
idfaPanel: cc.Node,
fbRewardPanel: cc.Node,
activityExchangePanel: cc.Node,
activityExchange2Panel: cc.Node,
strongGoalBt: cc.Node,
strongGoalPanel: cc.Node,
strongGoalMorePanel: cc.Node,
vipKfPanel: cc.Node,
gmShopPanel: cc.Node,
endlessRewardPanel: cc.Node,
x18sp: cc.Node,
fbBt: cc.Node,
fb2Bt: cc.Node,
vipKfBt: cc.Node,
gmShopBt: cc.Node,
endlessRewardBt: cc.Node,
guildBossBt: cc.Node,
onlineRewardBt: cc.Node,
pointLuckBt: cc.Node,
returnGift2Bt: cc.Node,
returnGift2Panel: cc.Node,
acePackBt: cc.Node,
acePackPanel: cc.Node,
discountActivityBt: cc.Node,
discountActivityPanel: cc.Node,
honourPanel: cc.Node,
exchange4Panel: cc.Node,
diyGiftPackBt: cc.Node,
diyGiftPackLabel: cc.Label,
diyGiftPackPanel: cc.Node,
diyGiftPack2Bt: cc.Node,
diyGiftPack2Label: cc.Label,
diyGiftPack2Panel: cc.Node,
diyGiftPack3Bt: cc.Node,
diyGiftPack3Label: cc.Label,
diyGiftPack3Panel: cc.Node,
dreamBt: cc.Node,
dreamActivityTipsNode: cc.Node,
isLandBt: cc.Node,
ticketShopBt: cc.Node,
starSignPointBt: cc.Node,
starSignPointPanel: cc.Node,
diyCardBt: cc.Node,
diyCardPanel: cc.Node
},
statics: {
instance: null,
prePower: 0
},
onLoad: function() {
ne.instance || (ne.instance = this);
this.node.statusData = I.curSceneStatusData || {
callFun: null
};
this.onFun = this.update_.bind(this);
c.player.on(u.EVENT.ATTRS, this.onFun);
this.settingPanel.active = !1;
this.renamePanel.active = !1;
this.receiveGiftPanel.active = !1;
this.modifyPhotoPanel.active = !1;
this.mailPanel.active = !1;
this.mailViewPanel.active = !1;
this.sendMailPanel.active = !1;
this.friendPanel.active = !1;
this.addFriendPanel.active = !1;
this.viewFriendPanel.active = !1;
this.powerIncLabel.active = !1;
this.powerRedLabel.active = !1;
this.mainTaskPanel.active = !1;
this.activityPanel.active = !1;
this.activityNewRolePanel.active = !1;
this.firstTopUpPanel.active = !1;
this.carnivalPanel.active = !1;
this.carnival2Panel.active = !1;
this.dialPanel.active = !1;
this.dial2Panel.active = !1;
this.starSignPointPanel.active = !1;
this.diyCardPanel.active = !1;
this.triggerTopUpPanel.active = !1;
this.taskActiveTopUpPanel.active = !1;
this.loginRewardPanel.active = !1;
this.loginReward2Panel.active = !1;
this.loginReward3Panel.active = !1;
this.loginReward4Panel.active = !1;
this.btActivityPanel.active = !1;
this.languagePanel.active = !1;
this.idfaPanel.active = !1;
this.scorePointPanel && (this.scorePointPanel.active = !1);
this.activityExchange2Panel.active = !1;
this.vipKfPanel && (this.vipKfPanel.active = !1);
this.gmShopPanel.active = !1;
this.endlessRewardPanel.active = !1;
this.chatPanel.active = !k.isHideChat;
this.x18sp.active = !!k.isShowX18;
this.fbBt && (this.fbBt.active = !!k.fbUrl);
this.fb2Bt && (this.fb2Bt.active = !!k.fb2Url);
this.activityExchangePanel && (this.activityExchangePanel.active = !1);
this.spActivityTipsNode.active = !1;
this.spActivityPanel && (this.spActivityPanel.active = !1);
this.returnGift2Panel && (this.returnGift2Panel.active = !1);
this.acePackPanel && (this.acePackPanel.active = !1);
this.discountActivityPanel && (this.discountActivityPanel.active = !1);
this.strongGoalPanel && (this.strongGoalPanel.active = !1);
this.strongGoalMorePanel && (this.strongGoalPanel.active = !1);
this.honourPanel && (this.honourPanel.active = !1);
this.exchange4Panel && (this.exchange4Panel.active = !1);
this.diyGiftPackPanel && (this.diyGiftPackPanel.active = !1);
this.diyGiftPack2Panel && (this.diyGiftPack2Panel.active = !1);
this.diyGiftPack3Panel && (this.diyGiftPack3Panel.active = !1);
this.dreamActivityTipsNode && (this.dreamActivityTipsNode.active = !1);
this.vipKfBt && (this.vipKfBt.active = k.isShowVipKf && (!k.vipKfNeedVipLevel || c.player.vip.level >= k.vipKfNeedVipLevel));
this.gmShopBt.active = !!k.isShowGmShop;
if (k.isUpdateHomeQuick) {
(e = this.serverTimeLabel.node.parent.getChildByName("quick_node").getComponent("quickNode")).rightLayout.node.y = 244;
e.upBt.node.active = !1;
e.downBt.node.active = !1;
}
if (k.isOpenQuick) {
var e;
(e = this.serverTimeLabel.node.parent.getChildByName("quick_node").getComponent("quickNode")).onQuick_();
}
this.update_();
if (this.node.statusData.callFun) {
this[this.node.statusData.callFun]();
this.node.statusData.callFun = null;
}
var a = this.guildBt.getChildByName("battle_armature");
a.active = !1;
if (c.player.guildId) {
var t = c.player.extra.newGuildBattle.openInfo;
if (t) {
if (t.isOpen) {
a.active = !0;
a.getComponent(sp.Skeleton).setAnimation(0, "action_1", !0);
}
} else {
var n = new Date(Date._now()), i = h.NEW_GUILD_BATTLE.CONSTS;
if (n.getHours() >= i.START_HOURS && n.getHours() < i.START_HOURS + i.DURATION_MINUTE / 60) {
s.addLoading();
f.openInfo(function(e) {
c.player.extra.newGuildBattle.openInfo = e._temp.openInfo;
e._temp.openInfo.isOpen && (a.active = !0);
});
}
}
}
var o = c.player.extra.worshipBattle;
if (c.player.level >= d.CONSTS.UNLOCK_LEVEL.WORSHIP_BATTLE && (!o.openInfo || Date.now() - o.getOpenInfoTime > 3e5)) {
var l = this;
y.openInfo(function(e) {
o.getOpenInfoTime = Date.now();
o.openInfo = e._temp.openInfo;
o.playerInfoMap = e._temp.playerInfoMap;
l.update_();
});
}
var m = c.player.extra.allServerBattle;
if (c.player.level >= d.CONSTS.UNLOCK_LEVEL.All_SERVER_BATTLE && (!m.openInfo || Date.now() - m.getOpenInfoTime > 3e5)) {
l = this;
b.openInfo(function(e) {
m.getOpenInfoTime = Date.now();
m.openInfo = e._temp.openInfo;
m.playerInfoMap = e._temp.playerInfoMap;
l.update_();
});
}
var p = c.player.extra.doubleBattle;
!k.isHideDoubleBattle && c.player.level >= d.CONSTS.UNLOCK_LEVEL.DOUBLE_BATTLE && (!p.openInfo || Date.now() - p.getOpenInfoTime > 3e5) && v.openInfo(function(e) {
p.getOpenInfoTime = Date.now();
p.infos = e._temp.infos;
});
if (c.player.activity.map.endless_reward) {
l = this;
Y.updateRepeatReceiveActivityTime(function() {
l.update_();
});
}
this.serverTimeLabel.node.active = k.isShowTimeLabel;
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
g.playMusic(r.sound_music_home_mp3);
},
onDestroy: function() {
c.player.off(u.EVENT.ATTRS, this.onFun);
ne.instance = null;
},
update_: function(a) {
var t = ne.genData();
this.data = t;
this.firstTopUpBt.active = t.isShowFirstTopUp && !k.isHideFirstTopUpBt;
this.topUpBt.active = !this.firstTopUpBt.active && !1;
this.endlessRewardBt.active = t.isShowEndlessReward;
s.setMark(this.endlessRewardBt, t.isMarkEndlessRewardPanel);
var i = h.GUILD_BOSS.CONSTS.LEVEL_BETWEEN[0];
this.guildBossBt.active = c.player.level >= i;
this.onlineRewardBt.active = !!ne.getOnlineFirstRewardItem();
this.pointLuckBt.active = !!t.pointLuckSpRoleName;
if (this.pointLuckBt.active) {
this.pointLuckBt.getComponentInChildren(cc.Label).string = t.pointLuckSpRoleName;
var u = this.pointLuckBt.getChildByName("role_sp").getComponent(cc.Sprite);
s.setSpriteFrame(u, r["misc_luck_role_" + t.pointLuckSpRoleClassId + "_png"]);
}
var g = d.CONSTS.UNLOCK_LEVEL, f = [ this.shopBt, this.guildBt, this.arenaBt, this.arena3v3Bt, this.prestigeBattleBt, this.bossBattleBt, this.worshipBattleBt ], y = [ g.SHOP, g.GUILD, g.ARENA, g.ARENA_3V3, g.PRESTIGE_BATTLE, g.BOSS, g.WORSHIP_BATTLE ];
for (var b in f) if (!(c.player.level >= y[b])) {
var v = f[b].getChildByName("title_sp");
v.active = y[b] - t.playerLevel < 5;
v.active && s.setGray(v);
f[b].data = {
unlockLevel: y[b]
};
k.isHideLevelLock && (f[b].getComponent(cc.Button).interactable = v.active);
}
if (k.isHidePrestigeBattle) {
this.prestigeBattleBt.getChildByName("title_sp").active = !1;
this.prestigeBattleBt.getComponent(cc.Button).interactable = !1;
}
this.teamBattleBt && (this.teamBattleBt.active = c.player.level >= g.TEAM_BATTLE && !k.isHideTeamBattle);
if (k.isHideWorshipBattle) {
this.worshipBattleBt.getChildByName("title_sp").active = !1;
this.worshipBattleBt.getComponent(cc.Button).interactable = !1;
}
if (k.isHideWorldBoss) {
this.bossBattleBt.getChildByName("title_sp").active = !1;
this.bossBattleBt.getComponent(cc.Button).interactable = !1;
}
this.battleBt.getChildByName("guide_armature").active = !1;
this.mapBt.active = c.player.level >= g.MAP_TYPE_3;
this.crossBt.active = c.player.level >= g.PRACTICE;
this.isLandBt.active = c.player.level >= g.ISLAND && !k.isHideIsLand;
this.ticketShopBt.active = !!k.isShowTicketShop;
this.starSignPointBt.active = t.starSignPointPanel && !k.isHideStarSign;
s.setMark(this.barBt, t.isMarkPoint);
s.setMark(this.mailBt, t.isMarkMail);
s.setMark(this.arenaBt, t.isMarkArena);
s.setMark(this.shopBt, t.isMarkShop);
s.setMark(this.arena3v3Bt, t.isMarkArena3v3);
s.setMark(this.activityBt, t.isMarkActivity);
s.setMark(this.activityNewRoleBt, t.isMarkActivityNewRole);
s.setMark(this.activityBuyGoods1Bt, t.isMarkBuyGoods1Activity);
s.setMark(this.activityBuyGoods2Bt, t.isMarkBuyGoods2Activity);
s.setMark(this.topUpActivityBt, t.isMarkTopUpActivity);
s.setMark(this.carnivalBt, t.isMarkCarnival);
s.setMark(this.carnival2Bt, t.isMarkCarnival2);
s.setMark(this.friendBt, t.isMarkFriend);
s.setMark(this.crossBt, t.isMarkCrossServer);
s.setMark(this.firstTopUpBt, t.isMarkFirstTopUp);
s.setMark(this.exchangeBt, t.isMarkExchange);
s.setMark(this.exchange2Bt, t.isMarkExchange2);
this.activityBt.active = !k.isHideActivityBt;
this.spActivityBt.active = !!t.spActivityPanel;
if (this.spActivityBt.active) {
this.spActivityBt.getComponentInChildren(cc.Label).string = t.spActivityPanel.spRoleName;
u = this.spActivityBt.getChildByName("role_sp").getComponent(cc.Sprite);
s.setSpriteFrame(u, r["misc_luck_role_" + t.spActivityPanel.spClassId + "_png"]);
}
s.setMark(this.spActivityBt, t.isMarkSpActivity);
this.strongGoalBt.active = !!t.strongGoalPanel;
s.setMark(this.strongGoalBt, t.isMarkStrongGoal);
ne.prePower || (ne.prePower = t.power);
ne.prePower != t.power && this.updatePower_();
this.activityNewRoleBt.active = t.isHaveActivityNewRole && !k.isHideActivityBt;
this.activityBuyGoods1Bt.active = !!t.buyGoods1ActivityDesc && !k.isHideActivityBt;
this.activityBuyGoods1Bt.active && (this.activityBuyGoods1Bt.getChildByName("label").getComponent(cc.Label).string = m.t(t.buyGoods1ActivityDesc));
this.activityBuyGoods2Bt.active = !!t.buyGoods2ActivityDesc && !k.isHideActivityBt;
this.activityBuyGoods2Bt.active && (this.activityBuyGoods2Bt.getChildByName("label").getComponent(cc.Label).string = m.t(t.buyGoods2ActivityDesc));
this.topUpActivityBt.active = t.isHaveTopUpActivity && !k.isHideActivityBt;
this.idfaBt.active = !!A.genData();
this.fbRewardBt.active = !!k.fbRewardData && !storage.getItem("goto_fb_" + c.player.id);
var S = c.player.activity;
this.dialBt.active = !!S.dial && !k.isHideDailBt;
this.dialBt.active && (this.dialBt.getChildByName("tips_label").active = !!S.dial.shenDesc);
this.dial2Bt.active = k.isPayDialNew && !!S.dial && S.dial.payDesc;
var T = S.payRank ? S.payRank.desc : null;
T = S.payRankAllServer ? S.payRankAllServer.desc : T;
this.topUpRankBt.active = !!T && !k.isHideRankBt;
this.topUpRankBt.active && (this.topUpRankBt.getChildByName("label").getComponent(cc.Label).string = m.t(T));
this.costGemRankBt && (this.costGemRankBt.active = !!S.costGemRankAllServer);
this.pointRankBt.active = !!S.pointRankAllServer;
this.dialSvipRankBt.active = !!S.dialSvipRankAllServer;
this.powerRankBt.active = !!S.powerRank && !k.isHideRankBt;
this.triggerTopUpBt.active = !!t.triggerTopUpPanel && !t.triggerTopUpPanel.isExpire && !k.isHideActivityBt;
this.loginRewardBt.active = !!t.loginRewardPanel && !k.isHideActivityBt;
this.loginReward3Bt.active = !!t.loginReward3Panel && !k.isHideActivityBt;
this.loginReward3Bt.active && s.setMark(this.loginReward3Bt, t.loginReward3Panel.isNeedMark);
this.loginReward4Bt.active = !!t.loginReward4Panel;
this.loginReward4Bt.active && s.setMark(this.loginReward4Bt, t.loginReward4Panel.isCanBuy);
this.btActivityBt.active = !!t.btActivityPanel && t.btActivityPanel.activityItems.length > 0 && !k.isHideActivityBt;
this.btActivityBt.active && s.setMark(this.btActivityBt, t.btActivityPanel.isNeedMark);
this.taskActiveBt && (this.taskActiveBt.active = !(!S.map.task_active && !S.map.task_active2 || k.isHideActivityBt));
this.diyGiftPackBt.active = !!t.diyGiftPackPanel;
this.diyGiftPack2Bt.active = !!t.diyGiftPack2Panel;
this.diyGiftPack3Bt.active = !!t.diyGiftPack3Panel;
if (this.dreamBt) {
this.dreamBt.active = t.isShowDreamActivity;
s.setMark(this.dreamBt, t.isMarkDreamActivity);
}
if (this.scorePointBt) {
this.scorePointBt.active = !!t.scorePointPanel;
this.scorePointBt.active && s.setMark(this.scorePointBt, t.scorePointPanel.isHaveTicket);
}
this.packActivityBt.active = t.isHavePackActivity;
s.setMark(this.packActivityBt, t.isMarkPackActivity);
this.carnivalBt.active = t.isHaveCarnival && !k.isHideCarnivalBt;
this.carnival2Bt.active = t.isHaveCarnival2 && !k.isHideCarnivalBt;
this.exchangeBt.active = !!t.exchangePanel;
this.exchange2Bt.active = !!t.exchange2Panel;
if (this.returnGift2Bt) {
this.returnGift2Bt.active = !!t.returnGift2Panel;
s.setMark(this.returnGift2Bt, t.isMarkReturnGift2);
}
this.acePackBt.active = t.isShowAcePack;
if (this.acePackBt.active) {
var M = U.genData();
if (M && M.activityItem) {
var $ = "acePack1" == M.activityItem.name ? 0 : 1, C = this.acePackPanel.getComponent("acePackPanel").btSpriteFrameArr;
this.acePackBt.getChildByName("icon_sp").getComponent(cc.Sprite).spriteFrame = C[$];
this.acePackBt.getChildByName("label").getComponent(cc.Label).string = m.t("维斯特训");
}
}
if (this.discountActivityBt) {
this.discountActivityBt.active = !!t.discountActivityPanel;
s.setMark(this.discountActivityBt, t.isMarkDiscountActivity);
}
this.diyCardBt.active = !!k.isShowTicketCards;
this.playerItem.getComponent("playerItem").update_(t.playerItem);
this.playerItem.getComponent("playerItem").setClickEvent_(this.node, "homeScene", "onSetting_");
this.nameLabel.string = t.playerName;
this.nameLabel.node.active = this.data.userName != this.data.playerName;
this.powerLabel.string = t.power;
this.levelLabel.string = t.playerLevel;
if (this.vipPanelSp) {
var P = t.svip ? k.svipType : 1;
s.setSpriteFrame(this.vipPanelSp, r["misc_vip_panel_type_" + P + "_png"]);
this.vipLabel.string = t.svip || t.vip;
}
if (this.topUpPointNode) {
this.topUpPointNode.active = !!t.topUpPoint;
this.topUpPointNode.active && o.replaceLabel(this.topUpPointNode.getComponentInChildren(cc.Label), [ t.topUpPoint ]);
}
this.mainTaskNameLabel.parent.active = !!t.mainTaskPanel;
if (t.mainTaskPanel) {
var D = this.mainTaskNameLabel.getComponent(cc.Label);
o.replaceLabel(D, [ t.mainTaskPanel.name, t.mainTaskPanel.require ]);
this.mainTaskNameLabel.color = t.mainTaskPanel.isComplete ? this.taskCompleteColor : this.taskUnCompleteColor;
s.setMark(this.mainTaskNameLabel.parent, t.mainTaskPanel.isNeedMark);
}
this.unlockNode.active = !!t.unlockPanel && !k.isHideLevelLock;
if (t.unlockPanel) {
var N = t.unlockPanel.nextLockInfo;
s.setSpriteFrame(this.unlockIconSp, r["misc_unlock_" + N.imgId + "_png"]);
this.unlockNameLabel.string = N.name;
o.replaceLabel(this.unlockLevelLabel, [ N.level ]);
}
var L = c.player.extra.worshipBattle, E = L.playerInfoMap || {};
L.openInfo && L.openInfo.status == h.WORSHIP_BATTLE.CONSTS.STATUS.WAIT_BE_4 && (E = {});
var B = n.last(h.WORSHIP_BATTLE.CONSTS.LEVEL_TYPE_BETWEEN, 3), w = [];
for (var b in B) w.push(this.worshipBattleBt.getChildByName("player_node_" + (Number(b) + 1)));
var G = [ this.arenaBt, this.arena3v3Bt, this.prestigeBattleBt, w[0], w[1], w[2] ], R = [ t.arenaRankTop1, t.arena3v3RankTop1, t.prestigeBattleRankTop1, E[B[0]], E[B[1]], E[B[2]] ], H = [ .9, .9, .9, .55, .55, .5 ];
this.showRoleClassIds = [];
for (var b in G) {
var x = G[b].getChildByName("armature_node");
if (x) {
x.active = R[b] && !h.PLAYER.FUNS.isRobot(R[b].playerId) && !k.isHidePlayerInfoLayout;
if (!x.active) continue;
var K = R[b].playerPhotoInfo, F = l.role.findOneBy("imgId", K.photoImgId), V = F ? F.classId : 1;
if ((q = x.characterNode) && q.getComponent("characterArmatureComponent").data.classId != V) {
q.destroy();
q = null;
}
if (!q && V) {
(q = s.getCharacterNode(V)).parent = x;
q.idx = b;
q.scale = H[b];
q.getComponent("characterArmatureComponent").setTitle_(K.titleImgId);
x.characterNode = q;
}
this.showRoleClassIds.push(V);
}
var O = G[b].getChildByName("info_bg_sp") || x.getChildByName("info_bg_sp");
O.active = !!R[b];
if (O.active) {
O.zIndex = 1;
var W = O.getChildByName("name_label").getComponent(cc.Label);
W.string = R[b].playerName;
W._forceUpdateRenderData(!0);
var Y = O.getChildByName("level_label");
if (Y) {
o.replaceLabel(Y.getComponent(cc.Label), [ R[b].playerLevel ]);
Y.getComponent(cc.Label)._forceUpdateRenderData(!0);
}
var j = O.getChildByName("server_label");
if (j) {
o.replaceLabel(j.getComponent(cc.Label), [ R[b].serverId ]);
j.getComponent(cc.Label)._forceUpdateRenderData(!0);
}
O.getComponent(cc.Layout).updateLayout();
O.getComponent("i18nComponent").start();
}
}
this.showRoleClassIds = n.uniq(this.showRoleClassIds);
if (this.myArmatureNode) {
var q;
if ((q = this.myArmatureNode.characterNode) && q.getComponent("characterArmatureComponent").data.classId != t.roleClassId) {
q.destroy();
q = null;
}
if (!q && t.roleClassId) {
(q = s.getCharacterNode(t.roleClassId)).parent = this.myArmatureNode;
q.idx = b;
q.getComponent("characterArmatureComponent").setTitle_(t.titleImgId);
this.myArmatureNode.characterNode = q;
}
}
var X = this;
s.addLoading();
this.scheduleOnce(function() {
s.removeLoading();
if (this.data.userName == this.data.playerName) {
s.addPanel(this.renamePanel);
this.renamePanel.getComponent("renamePanel").update_(e("renamePanel").genData(!0), this.renamePanel);
k.isSkipGuide || s.addPointRoleEffectNode({
kindId: h.CREATE_PLAYER.CONSTS.INIT_ROLE_ID,
star: 1
});
k.isCanSkipGuide ? s.addMessageBox(m.t("是否跳过引导"), function() {
p.skip();
}, function() {
p.run([ p.firstReName ]);
}, null, !1, !1, m.t("我是新手"), m.t("我是老玩家")) : p.run([ p.firstReName ]);
} else {
var t = s.getNodeByTag(s.TAG.REWARD_EFFECT_PANEL);
if (t && t.isPanel) return;
"home2_scene" == I.NAME.HOME_SCENE ? p.run([ p.point2Role, p.firstBattle, p.smapBattleTo, p.roleHandler, p.settingIntroduce, p.mainTask, p.firstArenaBattle, p.shopIntroduce, p.mapType3Introduce, p.mapType4Introduce, p.guildIntroduce, p.expeditionIntroduce, p.endlessIntroduce, p.capsuleIntroduce, p.eyeIntroduce, p.tailIntroduce, p.practiceIntroduce, p.arena3v3Introduce2, p.prestigeBattleIntroduce2, p.teamBattleIntroduce, p.allServerBattleIntroduce, p.worshipBattleIntroduce2, p.legendMapIntroduce, p.bossIntroduce2, p.sixIntroduce ]) : p.run([ p.point2Role, p.firstBattle, p.smapBattleTo, p.roleHandler, p.settingIntroduce, p.mainTask, p.firstArenaBattle, p.shopIntroduce, p.mapType3Introduce, p.mapType4Introduce, p.guildIntroduce, p.expeditionIntroduce, p.endlessIntroduce, p.capsuleIntroduce, p.eyeIntroduce, p.tailIntroduce, p.practiceIntroduce, p.arena3v3Introduce, p.prestigeBattleIntroduce, p.teamBattleIntroduce, p.allServerBattleIntroduce, p.worshipBattleIntroduce, p.legendMapIntroduce, p.bossIntroduce, p.sixIntroduce ]);
var n = _.instance && _.instance.node.active;
this.battleBt.getChildByName("guide_armature").active = c.player.level <= 20 && !n;
s.nextTick(function() {
X.checkPop_(n || !!a);
});
}
}, 0);
},
checkPop_: function(e) {
var a = e || !1;
if (!a && this.data.loginReward2Panel && this.data.loginReward2Panel.isCanReceive) {
this.onLoginReward2_();
a = !0;
}
if (!a && !w.isPop && this.data.loginReward4Panel && this.data.loginReward4Panel.isCanBuy) {
w.isPop = !0;
this.onLoginReward4_();
a = !0;
}
if (!a && N.isNeedPop && this.data.triggerTopUpPanel) {
N.isNeedPop = !1;
var t = this;
s.nextTick(function() {
t.onTriggerTopUp_();
});
a = !0;
}
if (!a && q.isNeedPop && this.data.diyGiftPackPanel) {
q.isNeedPop = !1;
t = this;
s.nextTick(function() {
t.onDiyGiftPack_();
});
a = !0;
}
if (!a && X.isNeedPop && this.data.diyGiftPack2Panel) {
X.isNeedPop = !1;
t = this;
s.nextTick(function() {
t.onDiyGiftPack2_();
});
a = !0;
}
if (!a && z.isNeedPop && this.data.diyGiftPack3Panel) {
z.isNeedPop = !1;
t = this;
s.nextTick(function() {
t.onDiyGiftPack3_();
});
a = !0;
}
if (!a && L.isNeedPop && this.data.loginRewardPanel && this.data.loginRewardPanel.isCanReceive) {
L.isNeedPop = !1;
t = this;
s.nextTick(function() {
t.onLoginReward_();
});
a = !0;
}
if (!a && R.isNeedPop && this.data.spActivityPanel) {
R.isNeedPop = !1;
t = this;
s.nextTick(function() {
t.spActivityTipsNode.getComponent("spActivityTipsNode").show_();
});
a = !0;
}
if (!a && Z.isNeedPop && this.data.isShowDreamActivity) {
Z.isNeedPop = !1;
t = this;
s.nextTick(function() {
t.dreamActivityTipsNode.getComponent("dreamActivityTipsNode").show_();
});
a = !0;
}
},
tick_: function() {
this.serverTimeLabel.string = i(Date._now()).format("MMM D, h:mm A") + (k.isShowTimeUTC || "");
if (this.data.triggerTopUpPanel) {
var e = this.data.triggerTopUpPanel.topUpActivity.end_time;
if (c.tTime(e) > Date._now()) {
l = (l = c.tTime(e) - Date._now()) < 0 ? 0 : l;
var a = i.duration(l), t = o.formatDuration(a.hours(), a.minutes(), a.seconds());
this.triggerTopUpLabel.string = t;
} else this.triggerTopUpLabel.string = m.t("已结束");
}
if (this.data.diyGiftPackPanel) {
e = this.data.diyGiftPackPanel.topUpActivity.end_time;
if (c.tTime(e) > Date._now()) {
l = (l = c.tTime(e) - Date._now()) < 0 ? 0 : l;
a = i.duration(l), t = o.formatDuration(a.hours(), a.minutes(), a.seconds());
this.diyGiftPackLabel.string = t;
} else this.diyGiftPackLabel.string = m.t("已结束");
}
if (this.data.diyGiftPack2Panel) {
e = this.data.diyGiftPack2Panel.topUpActivity.end_time;
if (c.tTime(e) > Date._now()) {
l = (l = c.tTime(e) - Date._now()) < 0 ? 0 : l;
a = i.duration(l), t = o.formatDuration(a.hours(), a.minutes(), a.seconds());
this.diyGiftPack2Label.string = t;
} else this.diyGiftPack2Label.string = m.t("已结束");
}
if (this.data.diyGiftPack3Panel) {
e = this.data.diyGiftPack3Panel.topUpActivity.end_time;
if (c.tTime(e) > Date._now()) {
l = (l = c.tTime(e) - Date._now()) < 0 ? 0 : l;
a = i.duration(l), t = o.formatDuration(a.hours(), a.minutes(), a.seconds());
this.diyGiftPack3Label.string = t;
} else this.diyGiftPack3Label.string = m.t("已结束");
}
if (this.data.exchangePanel) if ((e = this.data.exchangePanel.end_time) > Date.now()) {
l = (l = e - Date.now()) < 0 ? 0 : l;
a = i.duration(l);
var n = Math.ceil(a.asDays());
t = o.formatDuration(a.hours(), a.minutes(), a.seconds());
this.exchangeLabel.string = t;
this.exchangeLabel.node.active = n < 2;
} else this.exchangeLabel.string = m.t("已结束");
if (this.data.exchange2Panel) {
e = this.data.exchange2Panel.end_time;
if (c.tTime(e) > Date._now()) {
l = (l = c.tTime(e) - Date._now()) < 0 ? 0 : l;
a = i.duration(l), n = Math.ceil(a.asDays()), t = o.formatDuration(a.hours(), a.minutes(), a.seconds());
this.exchange2Label.string = t;
this.exchange2Label.node.active = n < 2;
} else this.exchange2Label.string = m.t("已结束");
}
var r = ne.getOnlineFirstRewardItem();
this.onlineRewardBt.active = !!r;
if (this.onlineRewardBt.active) {
var s = this.onlineRewardBt.getChildByName("time_label").getComponent(cc.Label);
if (r.status == te.CAN_RECEIVE) s.string = m.t("可领取"); else {
var l;
if ((l = r.canReceiveTime - Date.now()) <= 0) s.string = m.t("可领取"); else {
a = i.duration(l), t = o.formatDuration(Math.floor(a.asHours()), a.minutes(), a.seconds());
s.string = t;
}
}
}
},
updatePower_: function() {
var e = this.data.power - ne.prePower, a = e > 0 ? cc.instantiate(this.powerIncLabel) : cc.instantiate(this.powerRedLabel);
a.active = !0;
a.parent = this.powerIncLabel.parent;
o.replaceLabel(a.getComponent(cc.Label), [ Math.abs(e) ]);
a.opacity = 0;
cc.tween(a).to(.2, {
opacity: 255
}).delay(1).by(.3, {
position: cc.v2(0, 30)
}).to(.1, {
opacity: 0
}).removeSelf().start();
ne.prePower = this.data.power;
},
onSetting_: function() {
this.settingPanel.isPanel || s.addPanel(this.settingPanel);
var a = e("settingPanel").genData();
this.settingPanel.getComponent("settingPanel").update_(a, this.settingPanel);
},
onActivity_: function(e) {
s.addPanel(this.activityPanel, !1, !0, !0);
this.activityPanel.getComponent("activityPanel").update_(e);
},
onSpActivity_: function(e) {
s.addPanel(this.spActivityPanel, !1, !0, !0);
this.spActivityPanel.getComponent("spActivityPanel").update_(e);
},
onFriend_: function() {
var e = this;
s.addLoading();
M.myFriendList(function(a) {
c.player.friend.list = a._temp.list;
s.addPanel(e.friendPanel);
var t = e.friendPanel.getComponent("friendPanel").addFriendIdEditbox;
t.string = t.string;
e.friendPanel.getComponent("friendPanel").update_([ "friend" ]);
});
},
onGuild_: function(e) {
if (!e || !ne.checkLock(e.target)) {
s.addLoading();
T.info(function(e) {
0 == e.guildId && (c.player.guild = {});
I.pushScene(I.NAME.GUILD_SCENE);
});
}
},
onArena_: function(e) {
if (!e || !ne.checkLock(e.target)) {
s.addLoading();
S.info(function(e) {
c.player.arena.rank = e._temp.rank;
I.pushScene(I.NAME.ARENA_SCENE);
});
}
},
onArena3v3_: P.prototype.onMap7_,
onBossBattle_: P.prototype.onMap3_,
onWorshipBattle_: P.prototype.onMap6_,
onPrestigeBattle_: P.prototype.onMap2_,
onTeamBattle_: function() {
s.addLoading();
$.getInfo(function(e) {
c.player.extra.teamBattle = {
openInfo: e._temp.openInfo,
refreshTimes: e._temp.refreshTimes,
practiceTimes: e._temp.practiceTimes,
defenseTeamIndexs: e._temp.defenseTeamIndexs,
createTeamInfo: e._temp.battleInfo.createTeamInfo,
ruingTeamInfos: e._temp.battleInfo.ruingTeamInfos,
myTeamInfos: e._temp.battleInfo.ruingTeamInfos || null,
teamInfos: e._temp.battleInfo.ruingTeamInfos || null
};
I.pushScene(I.NAME.TEAM_BATTLE_SCENE);
});
},
onDailyBmap_: function() {
I.pushScene(I.NAME.DAILY_BMAP_SCENE);
},
onBar_: function() {
I.pushScene(I.NAME.POINT_SCENE);
},
onShop_: function(e) {
e && ne.checkLock(e.target) || I.pushScene(I.NAME.SHOP_SCENE);
},
onCross_: function() {
k.crossTips ? s.addHintPanel(k.crossTips) : I.pushScene(I.NAME.CROSS_SERVER_SCENE);
},
onMail_: function() {
s.addPanel(this.mailPanel);
var e = this.mailPanel.getComponent("mailPanel").sendMailContentEditbox;
e.string = e.string;
this.mailPanel.getComponent("mailPanel").update_([ "mail" ]);
},
onMap_: function() {
k.isSimpleMap ? I.pushScene(I.NAME.MMAP_SCENE, {
type: 1,
bmapRankId: 1
}) : I.pushScene(I.NAME.BMAP_SCENE);
},
onShip_: function() {
k.isHideShip ? I.pushScene(I.NAME.BMAP_SCENE) : I.pushScene(I.NAME.SHIP_SCENE);
},
onMainTask_: function() {
s.setMark(this.mainTaskNameLabel.parent, !1);
s.addPanel(this.mainTaskPanel);
this.mainTaskPanel.getComponent("mainTaskPanel").update_();
},
onUnlock_: function() {
s.addPanel(this.unlockPanel, !0);
this.unlockPanel.getComponent("unlockPanel").update_();
},
onActivityNewRole_: function() {
s.addPanel(this.activityNewRolePanel);
this.activityNewRolePanel.getComponent("activityNewRolePanel").update_();
},
onCarnival_: function() {
s.addPanel(this.carnivalPanel);
this.carnivalPanel.getComponent("carnivalPanel").update_(c.player.extra.openDays);
},
onCarnival2_: function() {
s.addPanel(this.carnival2Panel);
this.carnival2Panel.getComponent("carnival2Panel").update_(c.player.extra.openDays - 10);
},
onFirstTopUp_: function() {
s.addPanel(this.firstTopUpPanel);
this.firstTopUpPanel.getComponent("firstTopUpPanel").update_(this.data.showFirstTopUpType);
},
onDial_: function() {
this.dialPanel.active = !0;
s.addPanel(this.dialPanel, !1, !0, !0);
var a = e("dialPanel"), t = c.player.activity.dial, n = "luck";
if (!t[n + "Desc"]) for (var i in a.types) if (t[a.types[i] + "Desc"]) {
n = a.types[i];
break;
}
this.dialPanel.getComponent("dialPanel").update_(n);
},
onDial2_: function() {
s.addPanel(this.dial2Panel, !1, !0, !0);
this.dial2Panel.getComponent("dial2Panel").update_("pay");
},
onTopUpRank_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
var e = c.player.activity, a = e.payRank ? e.payRank.name : null;
a = e.payRankAllServer ? e.payRankAllServer.name : a;
this.activityPanel.getComponent("activityPanel").update_(a);
},
onCostGemRank_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
this.activityPanel.getComponent("activityPanel").update_("costGemRankAllServer");
},
onPowerRank_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
this.activityPanel.getComponent("activityPanel").update_("powerRank");
},
onPointRank_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
this.activityPanel.getComponent("activityPanel").update_("pointRankAllServer");
},
onDialSvipRank_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
this.activityPanel.getComponent("activityPanel").update_("dialSvipRankAllServer");
},
onTriggerTopUp_: function() {
s.addPanel(this.triggerTopUpPanel);
this.triggerTopUpPanel.getComponent("triggerTopUpPanel").update_();
},
onDiyGiftPack_: function() {
this.diyGiftPackPanel.getComponent("diyGiftPackPanel").show_();
},
onDiyGiftPack2_: function() {
this.diyGiftPack2Panel.getComponent("diyGiftPack2Panel").show_();
},
onDiyGiftPack3_: function() {
this.diyGiftPack3Panel.getComponent("diyGiftPack3Panel").show_();
},
onDreamActivity_: function() {
I.pushScene(I.NAME.DREAM_ACTIVITY_SCENE);
},
onIdfa_: function() {
s.addPanel(this.idfaPanel);
this.idfaPanel.getComponent("idfaPanel").update_();
},
onFbReward_: function() {
s.addPanel(this.fbRewardPanel);
this.fbRewardPanel.getComponent("fbRewardPanel").update_();
},
onLoginReward_: function() {
s.addPanel(this.loginRewardPanel);
this.loginRewardPanel.getComponent("loginRewardPanel").update_();
},
onLoginReward2_: function() {
this.loginReward2Panel.getComponent("loginReward2Panel").show_();
},
onLoginReward3_: function() {
this.loginReward3Panel.getComponent("loginReward3Panel").show_();
},
onLoginReward4_: function() {
this.loginReward4Panel.getComponent("loginReward4Panel").show_();
},
onBtActivity_: function() {
this.btActivityPanel.getComponent("btActivityPanel").show_();
},
onBuyGem_: C.prototype.onBuyGem_,
onFb_: function() {
cc.sys.openURL(k.fbUrl);
},
onFb2_: function() {
cc.sys.openURL(k.fb2Url);
},
onTopUpActivity_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
this.activityPanel.getComponent("activityPanel").update_("topUpMoney");
},
onTaskActive_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
var e = c.player.activity.map.task_active || c.player.activity.map.task_active2;
this.activityPanel.getComponent("activityPanel").update_(e.name);
},
onStrongGoal_: function() {
this.strongGoalPanel.getComponent("strongGoalPanel").show_();
},
onBuyGoods1_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
var e = n.findWhere(n.values(c.player.activity.map), {
btId: 1
}).name;
this.activityPanel.getComponent("activityPanel").update_(e);
},
onBuyGoods2_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
var e = n.findWhere(n.values(c.player.activity.map), {
btId: 2
}).name;
this.activityPanel.getComponent("activityPanel").update_(e);
},
onExchange_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
this.activityPanel.getComponent("activityPanel").update_("exchange");
},
onExchange2_: function() {
s.addPanel(this.activityExchange2Panel);
this.activityExchange2Panel.getComponent("exchange2Panel").update_();
},
onVipKf_: function() {
s.addPanel(this.vipKfPanel, !0);
},
onGmShop_: function() {
s.addPanel(this.gmShopPanel);
this.gmShopPanel.getComponent("gmShopPanel").update_();
},
onEndlessReward_: function() {
s.addLoading();
var e = this;
Y.updateRepeatReceiveActivityTime(function() {
s.addPanel(e.endlessRewardPanel);
e.endlessRewardPanel.getComponent("endlessRewardPanel").update_();
});
},
onGuildBoss_: function() {
if (!c.player.guildId) {
s.addHintPanel(m.t("请先加入家族"));
return !0;
}
s.addLoading();
T.info(function(e) {
0 == e.guildId && (c.player.guild = {});
I.pushScene(I.NAME.GUILD_SCENE, null, function() {
W.instance.onBattle1_();
});
});
},
onReceiveOnlineReward_: function() {
var e = ne.getOnlineFirstRewardItem();
if (e.status != te.UN_COMPLETE) {
if (e.status == te.CAN_RECEIVE) {
s.addLoading();
Y.receiveActivityAward([ e.activityName ], [ e.idx ], function(e) {
s.addRewardEffectPanel(e._temp.entityCountMap);
});
}
} else s.addRewardPanel(m.t("奖励内容"), e.dropList);
},
onPackActivity_: function() {
s.addPanel(this.activityPanel, !1, !0, !0);
this.activityPanel.getComponent("activityPanel").update_("packActivity");
},
onPointLuck_: function() {
I.pushScene(I.NAME.POINT_SCENE, null, function() {
e("pointScene").instance.onSwitchPointNode_(null, "advanced");
});
},
onCloseSpActivityTips_: function() {
s.removePanel(this.spActivityTipsNode);
},
onReturnGift2_: function() {
this.returnGift2Panel.getComponent("returnGift2Panel").show_();
}
}).onDreamActivity_ = function() {
I.pushScene(I.NAME.DREAM_ACTIVITY_SCENE);
}, t.onAcePack_ = function() {
s.addPanel(this.acePackPanel);
this.acePackPanel.getComponent("acePackPanel").update_();
}, t.onDiscountActivity_ = function() {
this.discountActivityPanel.getComponent("discountActivityPanel").show_();
}, t.onIsland_ = function() {
I.pushScene(I.NAME.ISLAND_SCENE);
}, t.onScorePoint_ = function() {
this.scorePointPanel.active = !0;
this.scorePointPanel.getComponent("scorePointPanel").show_();
}, t.onTicketShop_ = function() {
s.addTicketShopPanel();
}, t.onStarSignPoint_ = function() {
this.starSignPointPanel.getComponent("starSignPointPanel").show_();
}, t.onDiyCard_ = function() {
this.diyCardPanel.getComponent("diyCardPanel").show_();
}, t));
ne.checkLock = function(e) {
var a = e.data ? e.data.unlockLevel : null;
if (a && c.player.level < a) {
s.addHintPanel(m.t("战队等级达到$1开启", [ a ]));
return !0;
}
return !1;
};
ne.genData = function() {
var a = c.player, t = a.arena, i = a.arena3v3, r = e("playerItem").genData(a.photoInfo), s = l.entity.findBy("imgId", a.photoInfo.photoImgId)[0], o = s ? l.findEntityById(s.kindId).classId : 1, u = l.ship.findOneBy("imgId", a.photoInfo.shipImgId), m = u ? u.classId : 0, g = e("pointScene").genData(), p = g.freeCoinTimes != h.POINT.CONSTS.COIN_DAILY_FREE_TIMES, _ = !1;
(0 == g.nextCoinFreeTime || Date.now() >= g.nextCoinFreeTime) && p && (_ = !0);
(0 == g.nextCoinFreeTime || Date.now() >= g.nextGemFreeTime) && (_ = !0);
var f = e("mailPanel").genData().unreadCount > 0, y = 0 == t.challengeCD && t.remainingChallengeTimes > 0 && a.level >= d.CONSTS.UNLOCK_LEVEL.ARENA, b = 0 == i.challengeCD && i.remainingChallengeTimes > 0 && a.level >= d.CONSTS.UNLOCK_LEVEL.ARENA_3V3, v = e("shopScene").genData(h.SHOP.CONSTS.TYPE.NORMAL).shopItems, S = (!v[0].isSaleOut || !v[1].isSaleOut) && a.level >= d.CONSTS.UNLOCK_LEVEL.SHOP, T = H.genData(), M = x.genData(), $ = e("activityPanel").genData(), I = $.isNeedMark, C = $.isHaveTopUpActivity, P = $.isMarkTopUpActivity, A = e("activityNewRolePanel").genData(), R = !!A, W = A && A.isNeedMark, Y = $.buyGoods1ActivityDesc, Z = $.isMarkBuyGoods1Activity, te = $.buyGoods2ActivityDesc, ne = $.isMarkBuyGoods2Activity, ie = e("friendPanel").genData().isNeedMark, re = e("carnivalPanel").genData(), se = re.activitys.length > 0, oe = re.isNeedMark, le = e("carnival2Panel").genData(), ce = le.activitys.length > 0, de = le.isNeedMark, he = e("crossServerScene").genData().isNeedMark, ue = D.genAllData(), me = ue.isNeedMark, ge = n.values(ue.map).length > 0, pe = ue.map[D.TYPE.FIRST], _e = pe && (pe.isCanReceive || pe.isUnComplete) ? D.TYPE.FIRST : n.keys(ue.map)[0], ke = N.genData(), fe = L.genData(), ye = E.genData(), be = B.genData(), ve = w.genData(), Se = G.genData(), Te = K.genData(), Me = Te && Te.isNeedMark, $e = j.genData(), Ie = $e && $e.isNeedMark, Ce = F.genData(), Pe = Ce && Ce.isNeedMark, De = O.genData(), Ne = De && De.isNeedMark, Ae = !!U.genData(), Le = J.genData(), Ee = Le && Le.isNeedMark, Be = 0;
k.svipBegin && a.vip.level >= k.svipBegin && (Be = a.vip.level - k.svipBegin + 1);
var we = V.genData(), Ge = we && we.isNeedMark, Re = !!n.findWhere($.activitys, {
name: "packActivity"
});
k.speedUPLevel3NeedVip && a.vip.level >= k.speedUPLevel3NeedVip ? k.maxSpeedUPLevel = 3 : k.maxSpeedUPLevel = 2;
var He = e("spActivityPanel").genData(), xe = He && He.isNeedMark, Ke = ee.genData(), Fe = q.genData(), Ve = X.genData(), Oe = z.genData(), Ue = k.isUseTopUpPoint ? a.topUpPoint : null, We = !!a.activity.dream, Ye = !1;
We && (Ye = a.bag.getItemCount(94) > 0 || a.bag.getItemCount(95) > 0 || ae.genData().isNeedMark);
var je = Q.genData();
return {
userName: a.userName,
playerName: a.name,
power: a.power,
playerLevel: a.level,
vip: a.vip.level,
svip: Be,
playerItem: r,
roleClassId: o,
shipClassId: m,
mainTaskPanel: T,
unlockPanel: M,
triggerTopUpPanel: ke,
diyGiftPackPanel: Fe,
diyGiftPack2Panel: Ve,
diyGiftPack3Panel: Oe,
loginRewardPanel: fe,
loginReward2Panel: ye,
loginReward3Panel: be,
loginReward4Panel: ve,
starSignPointPanel: Ke,
btActivityPanel: Se,
exchangePanel: Te,
strongGoalPanel: $e,
exchange2Panel: Ce,
returnGift2Panel: De,
arenaRankTop1: a.extra.arenaRankTop1,
arena3v3RankTop1: a.extra.arena3v3RankTop1,
prestigeBattleRankTop1: a.extra.prestigeBattleRankTop1,
isShowFirstTopUp: ge,
showFirstTopUpType: _e,
isShowEndlessReward: !!we,
isHavePackActivity: Re,
isMarkPackActivity: !!$.isMarkMap.packActivity,
isMarkPoint: _,
isMarkMail: f,
isMarkArena: y,
isMarkShop: S,
isHaveActivityNewRole: R,
isMarkArena3v3: b,
isMarkActivity: I,
spActivityPanel: He,
isMarkSpActivity: xe,
isMarkActivityNewRole: W,
isHaveCarnival: se,
isMarkCarnival: oe,
isHaveCarnival2: ce,
isMarkCarnival2: de,
isMarkFriend: ie,
isMarkCrossServer: he,
isMarkFirstTopUp: me,
isHaveTopUpActivity: C,
isMarkTopUpActivity: P,
buyGoods1ActivityDesc: Y,
isMarkBuyGoods1Activity: Z,
buyGoods2ActivityDesc: te,
isMarkBuyGoods2Activity: ne,
isMarkExchange: Me,
isMarkExchange2: Pe,
isMarkEndlessRewardPanel: Ge,
isMarkReturnGift2: Ne,
discountActivityPanel: Le,
isMarkDiscountActivity: Ee,
isMarkStrongGoal: Ie,
pointLuckSpRoleName: g.luckSpRoleName,
pointLuckSpRoleClassId: g.luckSpRoleClassId,
isShowAcePack: Ae,
topUpPoint: Ue,
isShowDreamActivity: We,
isMarkDreamActivity: Ye,
scorePointPanel: je
};
};
ne.preIncOnlineTime = null;
ne.incOnlineTime = function() {
ne.preIncOnlineTime = ne.preIncOnlineTime || Date.now();
if (Date.now() - ne.preIncOnlineTime > 1e4 && c.uid) {
var e = c.player.activity.map.online_reward;
if (!e) return;
Y.incOnlineTime(10);
e.reachMap.onlineSeconds += 10;
for (var a in e.rewards) {
var t = e.rewards[a], n = t.needMap.onlineSeconds;
t.status == te.UN_COMPLETE && e.reachMap.onlineSeconds >= n && (t.status = te.CAN_RECEIVE);
delete t.canReceiveTime;
}
ne.preIncOnlineTime = Date.now();
}
};
ne.getOnlineFirstRewardItem = function() {
var e = c.player.activity.map.online_reward;
if (!e || e.isSuccess) return null;
for (var a in e.rewards) {
e.rewards[a].idx = a;
e.rewards[a].dropList = h.DROP.FUNS.getDropListByDesc(e.rewards[a].dropListDesc);
e.rewards[a].activityName = e.name;
}
var t = n.find(e.rewards, function(e) {
return n.include([ te.UN_COMPLETE, te.CAN_RECEIVE ], e.status);
});
t && (t.canReceiveTime = t.canReceiveTime || Date.now() + 1e3 * (t.needMap.onlineSeconds - e.reachMap.onlineSeconds));
return t;
};
cc._RF.pop();
}, {
acePackPanel: "acePackPanel",
activityNewRolePanel: "activityNewRolePanel",
activityPanel: "activityPanel",
allServerBattleHandler: "allServerBattleHandler",
arena3v3Handler: "arena3v3Handler",
arenaHandler: "arenaHandler",
baseView: "baseView",
btActivityPanel: "btActivityPanel",
buildExt: "buildExt",
carnival2Panel: "carnival2Panel",
carnivalPanel: "carnivalPanel",
clientConfig: "clientConfig",
coinTopNode: "coinTopNode",
crossServerScene: "crossServerScene",
dataApi: "dataApi",
dial2Panel: "dial2Panel",
dialPanel: "dialPanel",
discountActivityPanel: "discountActivityPanel",
diyGiftPack2Panel: "diyGiftPack2Panel",
diyGiftPack3Panel: "diyGiftPack3Panel",
diyGiftPackPanel: "diyGiftPackPanel",
doubleBattleHandler: "doubleBattleHandler",
dreamActivityPanel: "dreamActivityPanel",
dreamExtActivityPanel: "dreamExtActivityPanel",
endlessRewardPanel: "endlessRewardPanel",
exchange2Panel: "exchange2Panel",
exchangePanel: "exchangePanel",
firstTopUpPanel: "firstTopUpPanel",
friendHandler: "friendHandler",
friendPanel: "friendPanel",
guide: "guide",
guideNode: "guideNode",
guildHandler: "guildHandler",
guildScene: "guildScene",
helper: "helper",
i18n: "i18n",
idfaPanel: "idfaPanel",
loginReward2Panel: "loginReward2Panel",
loginReward3Panel: "loginReward3Panel",
loginReward4Panel: "loginReward4Panel",
loginRewardPanel: "loginRewardPanel",
mailPanel: "mailPanel",
mainTaskPanel: "mainTaskPanel",
moment: "moment",
newGuildBattleHandler: "newGuildBattleHandler",
player: "player",
playerHandler: "playerHandler",
playerItem: "playerItem",
pointScene: "pointScene",
rankHandler: "rankHandler",
renamePanel: "renamePanel",
resource: "resource",
returnGift2Panel: "returnGift2Panel",
roleItem: "roleItem",
sceneManager: "sceneManager",
scorePointPanel: "scorePointPanel",
serverConfig: "serverConfig",
serverMain: "serverMain",
settingPanel: "settingPanel",
shopScene: "shopScene",
skillItem: "skillItem",
socket: "socket",
soundApi: "soundApi",
spActivityPanel: "spActivityPanel",
starSignPointPanel: "starSignPointPanel",
strongGoalPanel: "strongGoalPanel",
teamBattleHandler: "teamBattleHandler",
triggerTopUpPanel: "triggerTopUpPanel",
underscore: "underscore",
unlockPanel: "unlockPanel",
worshipBattleHandler: "worshipBattleHandler"
} ],
