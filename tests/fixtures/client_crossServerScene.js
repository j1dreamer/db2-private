crossServerScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "a3aafB00ohMYbDPc7b517Xt", "crossServerScene");
var t = e("underscore"), n = e("dataApi"), i = e("baseView"), r = e("helper"), s = e("i18n"), o = e("buildExt"), l = e("clientConfig"), c = e("serverConfig"), d = e("serverMain"), h = (e("playerItem"), 
e("worldBossHandler")), u = e("prestigeBattleHandler"), m = e("allServerBattleHandler"), g = e("worshipBattleHandler"), p = e("arena3v3Handler"), _ = e("doubleBattleHandler"), k = e("sceneManager"), f = cc.Class({
extends: cc.Component,
properties: {
scrollView: cc.ScrollView,
map1Bt: cc.Node,
map2Bt: cc.Node,
map3Bt: cc.Node,
map4Bt: cc.Node,
map5Bt: cc.Node,
map6Bt: cc.Node,
map7Bt: cc.Node,
map8Bt: cc.Node,
map8BtSpriteFrames: [ cc.SpriteFrame ]
},
statics: {
instance: null
},
onLoad: function() {
f.instance || (f.instance = this);
var e = f.genData(), a = l.CONSTS.UNLOCK_LEVEL, t = [ a.PRACTICE, a.PRESTIGE_BATTLE, a.ARENA_3V3, a.BOSS, a.All_SERVER_BATTLE, a.WORSHIP_BATTLE, a.SIX, a.DOUBLE_BATTLE ], s = [ this.map1Bt, this.map2Bt, this.map7Bt, this.map3Bt, this.map4Bt, this.map6Bt, this.map5Bt, this.map8Bt ];
for (var c in t) {
var h = d.player.level < t[c], u = s[c].getChildByName("lock_sp");
u.active = h;
s[c].data = {
unlockLevel: t[c]
};
i.setGray(s[c], !h);
i.setGray(u, !0);
}
this.map1Bt.active = !o.isHidePractice;
this.map2Bt.active = !o.isHidePrestigeBattle;
this.map3Bt.active = !o.isHideWorldBoss;
this.map4Bt.active = !o.isHideAllServerBattle;
this.map5Bt.active = !o.isHideSix;
this.map6Bt.active = !o.isHideWorshipBattle;
this.map7Bt.active = "home2_scene" == k.NAME.HOME_SCENE;
this.map8Bt.active = !o.isHideDoubleBattle;
this.map8Bt.getChildByName("bg_sp").getComponent(cc.Sprite).spriteFrame = this.map8BtSpriteFrames[e.map8BtBgIdx];
this.map3Bt.getChildByName("battle_armature").active = e.isWorldBossOpen;
this.map4Bt.getChildByName("battle_armature").active = e.isAllServerBattleOpen;
i.setMark(this.map4Bt, e.isAllServerBattleCanApply);
this.map6Bt.getChildByName("battle_armature").active = e.isWorshipBattleOpen;
i.setMark(this.map6Bt, e.isWorshipBattleCanApply);
this.map8Bt.getChildByName("battle_armature").active = e.isDoubleBattleOpen;
i.setMark(this.map8Bt, e.isDoubleBattleCanApply);
var m = [ this.map4Bt, this.map6Bt, this.map7Bt, this.map8Bt ], g = [ e.allServerRankTop1, e.worshipBattleRankTop1, e.arena3v3RankTop1, e.doubleBattleRankTop1 ];
for (var c in m) {
var p = g[c], _ = m[c].getChildByName("armature_node");
_.active = !!p;
if (_.active) {
var y = n.role.findOneBy("imgId", p.playerPhotoInfo.photoImgId), b = y ? y.classId : 1, v = _.characterNode;
if (v && v.getComponent("characterArmatureComponent").data.classId != b) {
v.destroy();
v = null;
}
if (!v && b) {
(v = i.getCharacterNode(b)).parent = _;
v.getComponent("characterArmatureComponent").setTitle_(p.playerPhotoInfo.titleImgId);
_.characterNode = v;
}
}
var S = m[c].getChildByName("info_bg_sp");
S.active = !!p;
if (S.active) {
S.getChildByName("name_label").getComponent(cc.Label).string = p.playerName;
var T = S.getChildByName("level_label").getComponent(cc.Label);
r.replaceLabel(T, [ p.playerLevel ]);
var M = S.getChildByName("server_label").getComponent(cc.Label);
r.replaceLabel(M, [ p.serverId ]);
}
}
f.scrollOffset && this.scrollView.scrollToOffset(f.scrollOffset);
},
onDestroy: function() {
f.instance = null;
},
onScroll_: function(e, a) {
switch (a) {
case cc.ScrollView.EventType.SCROLL_ENDED:
f.scrollOffset = e.getScrollOffset();
f.scrollOffset.x *= -1;
}
},
onMap1_: function(a) {
a && e("homeScene").checkLock(a.target) || k.pushScene(k.NAME.PRACTICE_SCENE);
},
onMap2_: function(a) {
if (!a || !e("homeScene").checkLock(a.target)) {
i.addLoading();
u.getInfo(function(e) {
d.player.extra.prestigeBattle = {
openInfo: e._temp.openInfo,
practiceTimes: e._temp.practiceTimes,
defenseTeamIndexs: e._temp.defenseTeamIndexs,
defenseShipIndexs: e._temp.defenseShipIndexs,
createTeamInfo: e._temp.createTeamInfo,
teamInfos: null
};
k.pushScene(k.NAME.PRESTIGE_BATTLE_SCENE);
});
}
},
onMap3_: function(a) {
if (!a || !e("homeScene").checkLock(a.target)) {
i.addLoading();
h.openInfo(function(e) {
d.player.extra.worldBoss.openInfo = e._temp.openInfo;
d.player.extra.worldBoss.playerInfoMap = e._temp.playerInfoMap;
k.pushScene(k.NAME.WORLD_BOSS_SCENE);
});
}
},
onMap4_: function(a) {
if (!a || !e("homeScene").checkLock(a.target)) {
i.addLoading();
m.openInfo(function(e) {
d.player.extra.allServerBattle.getOpenInfoTime = Date.now();
d.player.extra.allServerBattle.openInfo = e._temp.openInfo;
d.player.extra.allServerBattle.playerInfoMap = e._temp.playerInfoMap;
k.pushScene(k.NAME.ALL_SERVER_BATTLE_SCENE);
});
}
},
onMap5_: function(a) {
a && e("homeScene").checkLock(a.target) || k.pushScene(k.NAME.SIX_SELECT_TYPE_SCENE);
},
onMap6_: function(a) {
if (!a || !e("homeScene").checkLock(a.target)) {
i.addLoading();
g.openInfo(function(e) {
var a = d.player.extra.worshipBattle;
a.getOpenInfoTime = Date.now();
a.openInfo = e._temp.openInfo;
a.playerInfoMap = e._temp.playerInfoMap;
k.pushScene(k.NAME.WORSHIP_BATTLE_SCENE);
});
}
},
onMap7_: function(a) {
if (!a || !e("homeScene").checkLock(a.target)) if (t.keys(d.player.team.roles).length < 15) i.addHintPanel(s.t("战士数量达到15个才能参加")); else {
i.addLoading();
p.info(function(e) {
d.player.arena3v3.rank = e._temp.rank;
d.player.arena3v3.hourCoin = e._temp.hourCoin;
d.player.arena3v3.receiveCoin = e._temp.receiveCoin;
d.player.arena3v3.playerInfoMap = e._temp.playerInfoMap;
k.pushScene(k.NAME.ARENA3V3_SCENE);
});
}
},
onMap8_: function(a) {
if (!a || !e("homeScene").checkLock(a.target)) {
i.addLoading();
_.openInfo(function(e) {
var a = d.player.extra.doubleBattle;
a.getOpenInfoTime = Date.now();
a.infos = e._temp.infos;
k.pushScene(k.NAME.DOUBLE_BATTLE_SCENE);
});
}
}
});
f.scrollOffset = null;
f.genData = function() {
var e = d.player, a = e.extra.worldBoss.openInfo, n = e.extra.worshipBattle.openInfo, i = e.extra.allServerBattle.openInfo, r = new Date(Date._now()), s = c.WORLD_BOSS.CONSTS, o = t.include(s.OPEN_DAYS, r.getDay()) && r.getHours() >= s.START_HOURS && r.getHours() < s.END_HOURS, l = !!i && !i.isApply && Date._now() > d.tTime(i.applyBeginTime) && Date._now() < d.tTime(i.applyEndTime), h = !!i && i.isOpen, u = !!n && !n.isApply && n.status == c.WORSHIP_BATTLE.CONSTS.STATUS.APPLY, m = !!n && n.isOpen, g = o && a && 0 == a.attackTeamIndexs.length || l || h || u || m, p = c.ALL_SERVER_BATTLE.CONSTS, _ = c.FUNS.getValueByBetween(p.LEVEL_BETWEEN, p.LEVEL_TYPE_BETWEEN, e.level), k = i ? e.extra.allServerBattle.playerInfoMap[_] : null, f = c.WORSHIP_BATTLE.CONSTS, y = (_ = c.FUNS.getValueByBetween(f.LEVEL_BETWEEN, f.LEVEL_TYPE_BETWEEN, e.level), 
n ? e.extra.worshipBattle.playerInfoMap[_] : null), b = e.extra.arena3v3RankTop1, v = c.DOUBLE_BATTLE.CONSTS, S = t.find(e.extra.doubleBattle.infos, function(e) {
return e.openInfo.status != v.STATUS.WAIT_APPLY;
}), T = S ? t.indexOf(e.extra.doubleBattle.infos, S) : 0;
_ = c.FUNS.getValueByBetween(v.LEVEL_BETWEEN, v.LEVEL_TYPE_BETWEEN, e.level);
return {
allServerRankTop1: k,
worshipBattleRankTop1: y,
arena3v3RankTop1: b,
doubleBattleRankTop1: S ? S.playerInfoMap[_] : null,
isWorldBossOpen: o,
isAllServerBattleCanApply: l,
isAllServerBattleOpen: h,
isWorshipBattleCanApply: u,
isWorshipBattleOpen: m,
isDoubleBattleOpen: !!S,
isDoubleBattleCanApply: !!S && !S.openInfo.isApply && S.openInfo.status == v.APPLY,
map8BtBgIdx: T,
isNeedMark: g
};
};
cc._RF.pop();
}, {
allServerBattleHandler: "allServerBattleHandler",
arena3v3Handler: "arena3v3Handler",
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
doubleBattleHandler: "doubleBattleHandler",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
playerItem: "playerItem",
prestigeBattleHandler: "prestigeBattleHandler",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
underscore: "underscore",
worldBossHandler: "worldBossHandler",
worshipBattleHandler: "worshipBattleHandler"
} ],
