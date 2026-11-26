newGuildBattleScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "e81ba5wqdtCoYJlNUC4oVx/", "newGuildBattleScene");
var t = e("underscore"), n = (e("http"), e("async"), e("moment")), i = e("baseView"), r = e("soundApi"), s = e("resource"), o = e("newGuildBattleHandler"), l = (e("buildExt"), 
e("serverConfig")), c = e("serverMain"), d = (e("player"), e("arenaHandler"), e("i18n")), h = e("helper"), u = e("selectBattleRolesScene"), m = (s = e("resource"), 
e("rulePanel"), e("roleItem")), g = e("shipItem"), p = e("playerItem"), _ = e("sceneManager"), k = l.NEW_GUILD_BATTLE.CONSTS, f = cc.Class({
extends: cc.Component,
properties: {
battleNode: cc.Node,
battleLeftNode: cc.Node,
battleRightNode: cc.Node,
battlePlayerItemNode: cc.Node,
battleHp0SpriteFrame: cc.SpriteFrame,
battleHp1SpriteFrame: cc.SpriteFrame,
battleEndTimeLabel: cc.Label,
battleAttackTimes: cc.Label,
battleEffect1Spine: cc.Node,
battleEffect2Spine: cc.Node,
resultPanel: cc.Node,
resultGuildNodes: [ cc.Node ],
resultAttackTimesLabel: cc.Label
},
statics: {
instance: null
},
onLoad: function() {
f.instance || (f.instance = this);
_.curSceneStatusData = t.extend({}, _.curSceneStatusData);
this.statusData = _.curSceneStatusData;
this.battlePlayerItemNode.active = !1;
this.resultPanel.active = !1;
this.update_();
this.updateBattle_();
r.playMusic(s.sound_music_guild_battle_mp3);
},
onDestroy: function() {
f.instance = null;
},
update_: function() {
var e = f.genData();
this.data = e;
},
onEnterBattle_: function() {
var e = this;
i.addLoading();
o.enter(function(a) {
c.player.extra.newGuildBattle.battleInfo = a._temp.battleInfo;
e.updateBattle_();
});
},
onExitBattle_: function() {
i.addLoading();
o.exit(function() {
_.popScene();
});
},
updateBattle_: function() {
var e = f.genBattleData();
this.battleData = e;
var a = [ e.leftInfo, e.rightInfo ], t = [ this.battleLeftNode, this.battleRightNode ], r = [ e.positionMap.left, e.positionMap.right ];
this.battleNode.playerItemNodeMap = this.battleNode.playerItemNodeMap || {};
i.preHideNodeMap(this.battleNode.playerItemNodeMap);
for (var s in a) for (var o in a[s].positionInfoMap) {
var l = a[s].positionInfoMap[o], u = this.battleNode.playerItemNodeMap[s + "_" + o];
if (!u) {
(u = cc.instantiate(this.battlePlayerItemNode)).parent = t[s];
this.battleNode.playerItemNodeMap[s + "_" + o] = u;
}
u.active = !0;
i.markHideNode(u);
u.x = r[s][o].x;
u.y = r[s][o].y;
e.maxL > 41 && o > 1 && (u.scale = .75);
u.data = {
playerId: l.playerId,
isLeft: 0 == s
};
var m = p.genData(l.playerInfo.playerPhotoInfo);
u.getChildByName("player_item").getComponent("playerItem").update_(m);
u.getChildByName("level_label").getComponent(cc.Label).string = d.t("LV.$1", [ l.playerInfo.playerLevel ]);
u.getChildByName("name_label").getComponent(cc.Label).string = l.playerInfo.playerName;
u.getChildByName("me_sp").active = l.playerInfo.playerId == c.player.id;
for (var g = u.getChildByName("hp_layout"), _ = 1; _ <= 5; _++) g.getChildByName("hp_sp_" + _).getComponent(cc.Sprite).spriteFrame = _ <= l.star ? this.battleHp0SpriteFrame : this.battleHp1SpriteFrame;
}
i.hideNodeMap(this.battleNode.playerItemNodeMap);
this._updateEndTimeSchedule = this._updateEndTimeSchedule || function() {
var a = c.tTime(e.openTime) + 6e4 * k.DURATION_MINUTE - Date._now(), t = n.duration(a);
this.battleEndTimeLabel.string = h.formatDuration(t.asMinutes(), t.seconds());
};
h.replaceLabel(this.battleAttackTimes, [ e.attackTimes ]);
this.unschedule(this._updateEndTimeSchedule);
this.schedule(this._updateEndTimeSchedule, .2);
},
onScroll_: function(e, a) {
switch (a) {
case cc.ScrollView.EventType.SCROLLING:
this.battleEffect1Spine.active = !1;
this.battleEffect2Spine.active = !1;
}
},
onBattle_: function(e) {
var a = e.target.data;
0 != c.player.extra.newGuildBattle.battleInfo.attackTimes ? a.isLeft ? i.addHintPanel(d.t("不能打自己人")) : _.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: u.TYPE.NEW_GUILD_BATTLE_ATTACK_TEAM,
opts: {
defenderId: a.playerId
}
}) : i.addHintPanel(d.t("攻击次数不足"));
},
onResult_: function() {
var e = this;
i.addLoading();
o.result(function(a) {
var t = f.genResultData(a._temp.result);
i.addPanel(e.resultPanel, !0, !0);
for (var n in t.guildInfos) {
var r = t.guildInfos[n], o = e.resultGuildNodes[n].getChildByName("badge_sp").getComponent(cc.Sprite);
i.setSpriteFrame(o, s["guild_" + r.badgeId + "_png"]);
e.resultGuildNodes[n].getChildByName("guild_level_label").getComponent(cc.Label).string = d.t("LV.$1", [ r.guildLevel ]);
var l = e.resultGuildNodes[n].getChildByName("guild_name_label").getComponent(cc.Label);
h.replaceLabel(l, [ r.serverId, r.guildName ]);
e.resultGuildNodes[n].getChildByName("member_count_layout").getChildByName("value_label").getComponent(cc.Label).string = r.memberCount;
e.resultGuildNodes[n].getChildByName("win_times_layout").getChildByName("value_label").getComponent(cc.Label).string = r.winTimes;
e.resultGuildNodes[n].getChildByName("fail_times_layout").getChildByName("value_label").getComponent(cc.Label).string = r.loseTimes;
e.resultGuildNodes[n].getChildByName("score_layout").getChildByName("value_label").getComponent(cc.Label).string = r.score;
}
h.replaceLabel(e.resultAttackTimesLabel, [ t.attackTimes, t.maxAttackTimes ]);
});
}
});
f.genData = function() {
var e = c.player, a = e.team, n = e.bag, i = e.extra.newGuildBattle.openInfo, r = i.defenseTeamInfo.teamIndexs, s = i.defenseTeamInfo.shipIndexs, o = [];
for (var l in s) {
var d = n.getItemByIdx(s[l]);
o.push(g.genData(d));
}
o = t.sortBy(o, function(e) {
return e._data.classId;
});
var h = 0, u = 0, p = [];
for (var l in r) {
var _ = a.getRoleByIdx(r[l]);
h += _.power;
u += _.attr.hp;
var k = m.genData(_);
p.push(k);
}
p = t.sortBy(p, function(e) {
return -e._data.positionPriority;
});
var f = i.preBattleResult, y = f ? [ f.win, f.lose ] : [];
return {
hp: u,
power: h,
selectIdxs: r,
selectShipIdxs: s,
shipItems: o,
roleItems: p,
openTime: i.openTime,
isOpen: i.isOpen,
isReady: i.isReady,
isHaveTarget: i.isHaveTarget,
preBattleResults: y
};
};
f.genBattleData = function() {
var e = c.player.extra.newGuildBattle, a = e.openInfo, n = e.battleInfo, i = null, r = null;
for (var s in n.map) s == n.guildId ? i = n.map[s] : r = n.map[s];
for (var o = Number(t.last(t.keys(i.positionInfoMap))), l = Number(t.last(t.keys(r.positionInfoMap))), d = t.max([ o, l ]), h = {
left: {
1: {
x: 100,
y: 270
},
2: {
x: 240,
y: 460
},
3: {
x: 240,
y: 333
},
4: {
x: 240,
y: 207
},
5: {
x: 240,
y: 80
}
},
right: {
1: {
x: -100,
y: 270
},
2: {
x: -240,
y: 460
},
3: {
x: -240,
y: 333
},
4: {
x: -240,
y: 207
},
5: {
x: -240,
y: 80
}
}
}, u = 2; u <= 5; u++) for (var m = 0; m < 20; m++) {
var g = h.left[u], p = h.right[u];
h.left[u + 4 * m] = {
x: g.x,
y: g.y
};
h.right[u + 4 * m] = {
x: p.x,
y: p.y
};
var _ = d > 41 ? 73 : 140;
h.left[u + 4 * m].x += m * _;
h.right[u + 4 * m].x -= m * _;
}
return {
maxL: d,
positionMap: h,
leftInfo: i,
rightInfo: r,
attackTimes: n.attackTimes,
maxAttackTimes: n.maxAttackTimes,
openTime: a.openTime
};
};
f.genResultData = function(e) {
var a = t.values(e.infoMap);
a = t.sortBy(a, function(e) {
return e.guildId == c.player.guildId ? 0 : 1;
});
return {
attackTimes: e.attackTimes,
maxAttackTimes: e.maxAttackTimes,
guildInfos: a
};
};
cc._RF.pop();
}, {
arenaHandler: "arenaHandler",
async: "async",
baseView: "baseView",
buildExt: "buildExt",
helper: "helper",
http: "http",
i18n: "i18n",
moment: "moment",
newGuildBattleHandler: "newGuildBattleHandler",
player: "player",
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
underscore: "underscore"
} ],
