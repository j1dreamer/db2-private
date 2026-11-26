viewBattleTeamPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "2f28clb7PZJpqakvgl81LIr", "viewBattleTeamPanel");
var t = e("underscore"), n = e("i18n"), i = e("helper"), r = e("moment"), s = e("battle.consts"), o = e("serverMain"), l = e("serverConfig"), c = e("eyeHandler"), d = e("baseView"), h = e("playerItem"), u = e("shipItem"), m = e("roleItem"), g = e("itemItem"), p = e("selectBattleRolesScene"), _ = e("sceneManager"), k = cc.Class({
extends: cc.Component,
properties: {
bgSp: cc.Node,
playerItem: cc.Node,
playerNameLabel: cc.Label,
playerLevelLabel: cc.Label,
serverLabel: cc.Label,
expeditionRankLabel: cc.Label,
guildBgSp: cc.Node,
beAttackTimesBgSp: cc.Node,
attackRewardBgSp: cc.Node,
rankBgSp: cc.Node,
winTimesBgSp: cc.Node,
powerBgSp: cc.Node,
bottomLayout: cc.Node,
teamLayout: cc.Node,
shipTeamItem: cc.Node,
teamItem: cc.Node,
battleBt: cc.Node,
hintLabel: cc.Label
},
onLoad: function() {
this.teamLayout.active = !1;
this.teamItem.active = !1;
this.shipTeamItem.active = !1;
},
update_: function(e) {
this.data = e;
this.playerItem.getComponent("playerItem").update_(e.playerItem);
this.playerNameLabel.string = e.playerName;
i.replaceLabel(this.playerLevelLabel, [ e.playerLevel ]);
i.replaceLabel(this.serverLabel, [ e.serverId ]);
this.serverLabel.node.active = !!e.serverId;
i.replaceLabel(this.expeditionRankLabel, [ e.extra.expeditionRank, e.extra.expeditionCount ]);
this.expeditionRankLabel.node.active = !!e.extra.expeditionRank;
this.guildBgSp.active = !!e.guildName;
this.guildBgSp.active && (this.guildBgSp.getChildByName("layout").getChildByName("value_label").getComponent(cc.Label).string = e.guildName || "");
var a = e.extra.practice;
this.beAttackTimesBgSp.active = !!a;
if (this.beAttackTimesBgSp.active) {
var t = this.beAttackTimesBgSp.getChildByName("layout").getChildByName("value_label");
i.replaceLabel(t.getComponent(cc.Label), [ a.beAttackTimes, a.maxBeAttackTimes ]);
}
this.attackRewardBgSp.active = !!a && a.playerId != o.player.id;
if (this.attackRewardBgSp.active) {
var l = this.attackRewardBgSp.getChildByName("layout");
l.getChildByName("item_node").getChildByName("item_item").getComponent("itemItem").update_(a.rewardItem);
var c = l.getChildByName("count_label").getComponent(cc.Label);
i.replaceLabel(c, [ a.rewardItem.count ]);
}
this.rankBgSp.active = !!e.rank;
this.rankBgSp.active && (this.rankBgSp.getChildByName("layout").getChildByName("value_label").getComponent(cc.Label).string = e.rank);
this.winTimesBgSp.active = !!e.winTimes;
this.winTimesBgSp.active && (this.winTimesBgSp.getChildByName("layout").getChildByName("value_label").getComponent(cc.Label).string = e.winTimes);
this.powerBgSp.active = !!e.totalPower;
this.powerBgSp.active && (this.powerBgSp.getChildByName("layout").getChildByName("value_label").getComponent(cc.Label).string = e.totalPower);
this.battleBt.active = !!e.battleType && e.extra.defenderId != o.player.id;
this.hintLabel.node.active = !1;
if (a && a.playerId == o.player.id) {
this.battleBt.active = !1;
this.hintLabel.node.active = !0;
var h = n.t("完成时间:$1", [ r(a.finishTime).from(Date._now()) ]);
this.hintLabel.string = h;
}
this.battleBt.parent.active = this.battleBt.active || this.hintLabel.node.active;
this.teamLayoutMap = this.teamLayoutMap || {};
d.preHideNodeMap(this.teamLayoutMap);
for (var u in e.roleItemsMap) {
var m = this.teamLayoutMap[u];
if (!m) {
(m = cc.instantiate(this.teamLayout)).parent = this.bottomLayout.getChildByName("center_layout");
m.idx = u;
this.teamLayoutMap[u] = m;
}
m.active = !0;
d.markHideNode(m);
var g = m.getChildByName("team_label");
i.replaceLabel(g.getComponent(cc.Label), [ u ]);
m.shipTeamItemMap = m.shipTeamItemMap || {};
d.preHideNodeMap(m.shipTeamItemMap);
e.shipItemsMap[u] = e.shipItemsMap[u] || [];
for (var p = 0; p < 3; p++) {
var _ = m.shipTeamItemMap[p];
if (!_) {
(_ = cc.instantiate(this.shipTeamItem)).parent = m.getChildByName("ship_team_layout").getChildByName("ship_" + (p + 1) + "_bg_sp");
_.idx = p;
m.shipTeamItemMap[p] = _;
}
_.active = !0;
d.markHideNode(_);
var k = e.shipItemsMap[u][p], f = _.getChildByName("ship_item");
f.active = !!k;
var y = _.getChildByName("label_bg_sp"), b = y.getChildByName("star_label"), v = y.getChildByName("level_label");
y.active = f.active;
if (f.active) {
f.getComponent("shipItem").update_(k);
i.replaceLabel(b.getComponent(cc.Label), [ k._item.star ]);
i.replaceLabel(v.getComponent(cc.Label), [ k._item.level ]);
}
}
d.hideNodeMap(m.shipTeamItemMap);
m.teamItemMap = m.teamItemMap || {};
d.preHideNodeMap(m.teamItemMap);
for (p = 0; p < e.roleItemsMap[u].length; p++) {
var S = m.teamItemMap[p];
if (!S) {
(S = cc.instantiate(this.teamItem)).parent = m.getChildByName("role_team_layout").getChildByName("role_" + (p + 1) + "_bg_sp");
S.idx = p;
m.teamItemMap[p] = S;
}
S.active = !0;
d.markHideNode(S);
var T = e.roleItemsMap[u][p];
S.data = {
equipments: T._role.equipments || {}
};
S.getChildByName("role_item").getComponent("roleItem").update_(T);
var M = S.getChildByName("hp_bar");
M.active = !!e.extra.expeditionRank;
M.active && (M.getComponent(cc.ProgressBar).progress = T._role.attr.hp / T._role.attr.maxHp);
var $ = S.getChildByName("mp_bar");
$.active = !!e.extra.expeditionRank;
$.active && ($.getComponent(cc.ProgressBar).progress = T._role.attr.mp / s.MAX_MP);
}
d.hideNodeMap(m.teamItemMap);
}
d.hideNodeMap(this.teamLayoutMap);
i.updateLayout(this.bgSp);
this.node.width = this.bgSp.width;
this.node.height = this.bgSp.height;
this.node.height > 600 && (this.node.preScale = 600 / this.node.height);
},
onClose_: function() {
d.removePanel(this.node);
},
onTeamItem_: function(e) {
var a = e.target.data;
d.addViewEquipmentsPanel(a.equipments, this.data.isHideEqpt);
},
onBattle_: function() {
var a = k.BATTLE_TYPE;
switch (this.data.battleType) {
case a.EXPEDITION:
_.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: p.TYPE.EXPEDITION_ATTACK_TEAM
});
break;

case a.SIX_EXPEDITION:
_.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: p.TYPE.SIX_EXPEDITION_ATTACK_TEAM
});
break;

case a.PRACTICE:
var i = this.data.extra.practice;
if (t.include(i.attackerIds, o.player.id)) {
d.addHintPanel(n.t("只能抢劫一次"));
return;
}
if (i.beAttackTimes == i.maxBeAttackTimes) {
d.addHintPanel(n.t("被抢劫次数达到上限"));
return;
}
_.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: p.TYPE.PRACTICE_ATTACK_TEAM,
opts: {
defenderId: i.playerId,
ctime: i.ctime
}
});
break;

case a.SIX_PRACTICE:
i = this.data.extra.practice;
if (t.include(i.attackerIds, o.player.id)) {
d.addHintPanel(n.t("只能抢劫一次"));
return;
}
if (i.beAttackTimes == i.maxBeAttackTimes) {
d.addHintPanel(n.t("被抢劫次数达到上限"));
return;
}
_.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: p.TYPE.SIX_PRACTICE_ATTACK_TEAM,
opts: {
defenderId: i.playerId,
ctime: i.ctime
}
});
break;

case a.FRIEND:
_.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: p.TYPE.FRIEND_BATTLE_TEAM,
opts: {
defenderId: this.data.extra.defenderId,
isFriend: !0
}
});
break;

case a.EYE:
if (0 == o.player.eye.remainingChallengeTimes) {
var r = l.EYE.FUNS.getBuyChallengeTimesCost(o.player.vip.buyEyeChallengeTimesTimes + 1), s = o.player.vip.buyEyeChallengeTimesTimes, h = n.t("次数不足,是否花费$1钻石购买$2次抢位次数?(今日已购买$3次)", [ r, 1, s ]);
d.addMessageBox(h, function() {
d.addLoading();
c.buyChallengeTimes(function() {
e("eyeScene").instance.update_();
});
});
} else _.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: p.TYPE.EYE_TEAM,
opts: {
eyeType: "public",
rank: this.data.extra.eyeRank
}
});
}
}
});
k.genData = function(e, a) {
a = a || {};
var n = o.player, i = {}, r = e.ships ? {
1: e.ships
} : e.shipsMap;
for (var s in r) {
for (var c in r[s]) {
var d = u.genData(r[s][c]);
i[s] = i[s] || [];
i[s].push(d);
}
i[s] = t.sortBy(i[s], function(e) {
return e._data.classId;
});
}
var p = {}, _ = e.roles ? {
1: e.roles
} : e.rolesMap;
for (var s in _) for (var c in _[s]) {
var f = m.genData(_[s][c]);
p[s] = p[s] || [];
p[s].push(f);
}
var y = t.keys(_).length, b = null;
if (a.battleType == k.BATTLE_TYPE.PRACTICE) {
var v = l.PRACTICE.FUNS.getChallengeRewardRate(n.level, e.playerLevel), S = l.PRACTICE.FUNS.getRewardDropList(e.defenseInfo.type, e.playerLevel, e.defenseInfo.level, v, !0), T = g.genData({
kindId: S[0].entityId,
count: S[0].count
}), M = Number(o.tTime(e.defenseInfo.finishTime)), $ = e.defenseInfo.maxBeAttackTimes;
b = {
playerId: e.playerId,
rewardItem: T,
beAttackTimes: e.defenseInfo.beAttackTimes,
ctime: e.defenseInfo.ctime,
finishTime: M,
attackerIds: e.defenseInfo.attackerIds,
maxBeAttackTimes: $
};
} else if (a.battleType == k.BATTLE_TYPE.SIX_PRACTICE) {
v = l.SIX_PRACTICE.FUNS.getChallengeRewardRate(n.level, e.playerLevel), S = l.SIX_PRACTICE.FUNS.getRewardDropList(e.defenseInfo.vipLevel, v), 
T = g.genData({
kindId: S[0].entityId,
count: S[0].count
}, !0), M = Number(o.tTime(e.defenseInfo.finishTime)), $ = e.defenseInfo.maxBeAttackTimes;
b = {
playerId: e.playerId,
rewardItem: T,
beAttackTimes: e.defenseInfo.beAttackTimes,
ctime: e.defenseInfo.ctime,
finishTime: M,
attackerIds: e.defenseInfo.attackerIds,
maxBeAttackTimes: $
};
}
var I = h.genData(e.playerPhotoInfo), C = e.totalPower || "?";
e.totalPowerMap && (C = t.reduce(e.totalPowerMap, function(e, a) {
return e + a;
}, 0));
return {
playerId: e.playerId,
playerName: e.playerName,
playerLevel: e.playerLevel,
totalPower: C,
serverId: e.serverId || 0,
guildName: e.guildName || null,
winTimes: e.winTimes || 0,
rank: e.rank || 0,
isHideEqpt: e.playerPhotoInfo.isHideEqpt,
playerItem: I,
shipItemsMap: i,
roleItemsMap: p,
teamCount: y,
battleType: a.battleType || null,
extra: {
expeditionRank: a.expeditionRank || 0,
expeditionCount: a.expeditionCount || 0,
eyeRank: a.eyeRank || null,
practice: b,
defenderId: a.defenderId
}
};
};
k.BATTLE_TYPE = {
EXPEDITION: 1,
PRACTICE: 2,
FRIEND: 3,
EYE: 4,
SIX_PRACTICE: 5,
SIX_EXPEDITION: 6
};
cc._RF.pop();
}, {
baseView: "baseView",
"battle.consts": "battle.consts",
eyeHandler: "eyeHandler",
eyeScene: "eyeScene",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
playerItem: "playerItem",
roleItem: "roleItem",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipItem: "shipItem",
underscore: "underscore"
} ],
