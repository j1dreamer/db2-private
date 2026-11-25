islandScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "d93de0vpYxC/o9G9B0IoIQ6", "islandScene");
var t = e("underscore"), n = e("baseView"), i = e("i18n"), r = e("soundApi"), s = e("moment"), o = e("serverMain"), l = (e("playerHandler"), 
e("serverConfig")), c = e("rulePanel"), d = e("helper"), h = e("playerItem"), u = e("sceneManager"), m = e("islandHandler"), g = e("arenaScene"), p = e("resource"), _ = l.ISLAND.CONSTS, k = l.ISLAND.FUNS, f = cc.Class({
extends: cc.Component,
properties: {
content: cc.Node,
battlefieldLabel: cc.Label,
challengeTimesLabel: cc.Label,
coinLabel: cc.Label,
defenseTimesLabel: cc.Label,
leftBt: cc.Node,
rightBt: cc.Node,
islandItemArr: [ cc.Node ],
tipNode: cc.Node,
myIslandNode: cc.Node,
teamNode: cc.Node,
enemyNode: cc.Node,
infoNode: cc.Node,
rankNode: cc.Node,
logPanel: cc.Node,
logItem: cc.Node,
logItemsLayout: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
f.instance || (f.instance = this);
u.curSceneStatusData = t.extend({
selectPageIdx: 0
}, u.curSceneStatusData);
this.statusData = u.curSceneStatusData;
this.tipNode.active = !1;
this.teamNode.active = !1;
this.enemyNode.active = !1;
this.infoNode.active = !1;
this.myIslandNode.active = !1;
this.rankNode.active = !1;
this.logPanel.active = !1;
this.logItem.active = !1;
this.enemyComponent = this.enemyNode.getComponent("islandScene.enemy");
this.teamComponent = this.teamNode.getComponent("islandScene.team");
this.infoComponent = this.infoNode.getComponent("islandScene.info");
this.rankComponent = this.rankNode.getComponent("islandScene.rank");
this.myIslandComponent = this.myIslandNode.getComponent("islandScene.myIsland");
for (var e = 1; e <= 16; e++) {
var a = this.content.getChildByName("item_bt_" + e);
a.getChildByName("help_sp").active = !1;
a.getChildByName("main_node").active = !1;
}
this.update_();
r.playMusic(p.sound_music_island_mp3);
},
onDestroy: function() {
f.instance = null;
},
update_: function() {
var e = f.genData();
this.data = e;
d.replaceLabel(this.battlefieldLabel, [ e.battlefieldLevel ]);
d.replaceLabel(this.defenseTimesLabel, [ _.DEFENSE_TIMES - e.remainingDefenseTimes, _.DEFENSE_TIMES ]);
d.replaceLabel(this.challengeTimesLabel, [ e.remainingChallengeTimes ]);
this.coinLabel.string = e.haveCoin;
this.leftBt.active = this.statusData.selectPageIdx > 0;
this.rightBt.active = this.statusData.selectPageIdx < 2;
this.matchInfo ? this.updateItems_() : this.scheduleOnce(function() {
this.onRefresh_(null, !0);
}, 0);
},
updateItems_: function() {
var e = function(e, a) {
var n = e.getChildByName("main_node");
n.active = !!a.playerInfo;
if (n.active) {
n.getChildByName("player_item_scale").getComponentInChildren("playerItem").update_(h.genData(a.playerInfo.playerPhotoInfo));
var i = n.getChildByName("label_layout"), r = i.getChildByName("name_label");
r.getComponent(cc.Label).string = a.playerInfo.playerName;
var s = t.include(o.player.island.attackerIds, a.playerInfo.playerId);
r.preColor = r.preColor || r.color;
r.color = s ? cc.Color.RED : r.preColor;
var l = i.getChildByName("server_label").getComponent(cc.Label);
d.replaceLabel(l, [ a.playerInfo.serverId ]);
var c = i.getChildByName("level_label").getComponent(cc.Label);
d.replaceLabel(c.getComponent(cc.Label), [ a.playerInfo.playerLevel ]);
var u = a.playerInfo.playerId == o.player.id;
n.getChildByName("me_sp").active = u;
var m = n.getChildByName("time_label");
e.timeLabel = m;
}
e.getChildByName("help_sp").active = a.isNeedHelp && a.defenserId == a.playerId;
e.data = a;
};
this.itemBts = [];
var a = this.matchInfo, n = _.RES_LEVEL_IDS_MAP[1][this.statusData.selectPageIdx], i = a.baseResInfoMap[n];
e(u = this.content.getChildByName("item_bt_1"), i);
this.itemBts.push(u);
for (var r = 2 * this.statusData.selectPageIdx, s = _.RES_LEVEL_IDS_MAP[2].slice(r, r + 2), l = 0; l < s.length; l++) {
i = a.baseResInfoMap[s[l]];
e(u = this.content.getChildByName("item_bt_" + (l + 2)), i);
this.itemBts.push(u);
}
r = 3 * this.statusData.selectPageIdx;
var c = _.RES_LEVEL_IDS_MAP[3].slice(r, r + 3);
for (l = 0; l < c.length; l++) {
i = a.baseResInfoMap[c[l]];
e(u = this.content.getChildByName("item_bt_" + (l + 4)), i);
this.itemBts.push(u);
}
for (r = 10 * this.statusData.selectPageIdx, l = 0; l < 10; l++) {
var u;
i = a.lowestResInfos[r + l] || {
resourceId: -1
};
e(u = this.content.getChildByName("item_bt_" + (l + 7)), i);
this.itemBts.push(u);
}
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
tick_: function() {
for (var e in this.itemBts) {
var a = this.itemBts[e].timeLabel;
if (a) {
var t = this.itemBts[e].data;
t.playerInfo && (t.playerInfo.playerId, o.player.id);
a.active = !!t.ctime;
if (a.active) {
var n = s.duration(Date.now() - t.ctime), r = Math.floor(n.asDays()), l = d.formatDuration(n.hours(), n.minutes(), n.seconds());
r > 0 && (l = i.t("$1天$2小时", [ r, n.hours() ]));
a.getComponent(cc.Label).string = l;
if (Date.now() > t.finishTime) {
this.onRefresh_(null, !0);
this.unschedule(this.tick_);
}
}
}
}
},
onSwitch_: function(e, a) {
this.statusData.selectPageIdx += Number(a);
this.update_();
},
onMyIsland: function() {
var e = this;
n.addLoading();
m.myIslandList(function(a) {
e.myIslandComponent.show_(a._temp.resourceInfoIdTeamMap);
});
},
onTeam_: function() {
this.teamComponent.show_();
},
onShop_: function() {
u.pushScene(u.NAME.SHOP_SCENE, {
type: l.SHOP.CONSTS.TYPE.ISLAND
});
},
onRefresh_: function(e, a) {
var t = this;
if (this.matchInfo && !a) this._showTipNode("text", i.t("刷新星球"), i.t("确认刷新当前星球信息吗？"), function() {
t.matchInfo = null;
t.statusData.selectPageIdx = 0;
t.onRefresh_();
}); else {
n.addLoading();
m.match(function(e) {
t.matchInfo = e._temp.info;
o.player.island = e._temp.island;
t.update_();
if (t.matchInfo.isNeedSettlement) {
n.addLoading();
m.settlement(function(e) {
if (e._temp.entityCountMap) {
n.addRewardPanel(i.t("结算奖励"), e._temp.entityCountMap);
r.playEffect(p.sound_effect_task_finish_mp3);
}
});
}
});
}
},
onClickEnemy_: function() {
var e = this;
n.addLoading();
m.enemyList(function(a) {
e.enemyComponent.show_(a._temp.list);
});
},
onRule_: function() {
n.addRulePanel(c.TYPE.ISLAND);
},
onIsland_: function(e) {
var a = e.target.data;
if (a.playerInfo) {
var t = this;
n.addLoading();
m.defenseTeam(a.playerId, a.id, function(e) {
a.defenseTeam = e._temp.defenseTeam;
t.infoComponent.show_(a);
});
} else this.infoComponent.show_(a);
},
onRank_: function() {
this.rankComponent.show_();
},
onAdd_: function(e, a) {
var t = this;
switch (a) {
case "plunder":
var r = k.getBuyChallengeTimesCost(o.player.island.buyChallengeTimesTimes + 1).costCount;
this._showTipNode("buy", i.t("掠夺次数购买"), r, function() {
n.addLoading();
m.buyChallengeTimes(function() {
t.update_();
});
});
}
},
_showTipNode: function(e, a, t, r) {
i.t("提示");
n.addPanel(this.tipNode, !0);
this.tipNode.getChildByName("revive_richText").active = "revive" == e;
this.tipNode.getChildByName("buy_richText").active = "buy" == e;
this.tipNode.getChildByName("text_richText").active = "text" == e;
this.tipNode.getChildByName("title_label").getComponent(cc.Label).string = a;
var s = this.tipNode.getChildByName(e + "_richText") || null;
this.tipFun = function() {
r && r();
};
s && d.replaceLabel(s.getComponent(cc.RichText), [ t ]);
},
onTipYes_: function() {
n.removePanel(this.tipNode);
this.tipFun && this.tipFun();
},
onTipCancel_: function() {
n.removePanel(this.tipNode);
},
onLog_: function() {
var e = this;
n.addLoading();
m.reportList(function(a) {
var t = f.genLogData(a._temp.reportList);
n.addPanel(e.logPanel);
e.logItemMap = e.logItemMap || {};
n.preHideNodeMap(e.logItemMap);
for (var r in t.recordItems) {
var s = e.logItemMap[r];
if (!s) {
(s = cc.instantiate(e.logItem)).parent = e.logItemsLayout;
s.idx = r;
e.logItemMap[r] = s;
}
s.active = !0;
n.markHideNode(s);
var o = t.recordItems[r];
s.data = o;
s.getChildByName("player_item").getComponent("playerItem").update_(t.playerItem);
s.getChildByName("attack_sp").scaleX = o.isAttacker ? 1 : -1;
var l = s.getChildByName("target_player_item_layout");
l.getChildByName("player_item").getComponent("playerItem").update_(o.playerItem);
l.getChildByName("player_item").removeComponent(cc.Button);
l.getChildByName("name_label").getComponent(cc.Label).string = o.playerName;
l.getChildByName("level_label").getComponent(cc.Label).string = i.t("LV.$1", [ o.playerLevel ]);
s.getChildByName("time_label").getComponent(cc.Label).string = o.timeDes;
s.getChildByName("play_bt").data = o;
s.getChildByName("win_sp").active = o.isWin;
s.getChildByName("fail_sp").active = !o.isWin;
}
n.hideNodeMap(e.logItemMap);
});
},
onCloseLogPanel_: function() {
n.removePanel(this.logPanel);
},
onPlay_: g.prototype.onPlay_
});
f.genData = function() {
var e = o.player, a = e.island, t = k.getAreaId(e.level), n = _.AREA_NEED_ROLE_LEVEL_MAP[t], i = e.bag.getItemCount(_.MONEY_ENTITY_ID);
return {
remainingChallengeTimes: a.remainingChallengeTimes,
remainingDefenseTimes: a.remainingDefenseTimes,
battlefieldLevel: n,
haveCoin: i
};
};
f.genLogData = function(e) {
var a = o.player, t = [];
for (var n in e) {
var i = e[n], r = s(o.tTime(i.ctime)).from(Date._now()), l = i.playerInfo, c = h.genData(l.playerPhotoInfo), d = {
reportId: i.id,
isAttacker: i.isAttacker,
up: i.up,
isWin: i.isWin,
playerName: l.playerName,
playerLevel: l.playerLevel,
playerItem: c,
timeDes: r
};
t.push(d);
}
return {
playerItem: h.genData(a.photoInfo),
recordItems: t
};
};
cc._RF.pop();
}, {
arenaScene: "arenaScene",
baseView: "baseView",
helper: "helper",
i18n: "i18n",
islandHandler: "islandHandler",
moment: "moment",
playerHandler: "playerHandler",
playerItem: "playerItem",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
