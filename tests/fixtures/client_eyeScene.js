eyeScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "98b45tHKZRMcLgYyXhB+vaJ", "eyeScene");
var t = e("underscore"), n = e("baseView"), i = e("moment"), r = e("i18n"), s = (e("helper"), 
e("guide"), e("soundApi"), e("resource"), e("util")), o = e("buildExt"), l = e("serverMain"), c = e("dataApi"), d = e("serverConfig"), h = e("eyeHandler"), u = e("viewBattleTeamPanel"), m = e("selectBattleRolesScene"), g = e("rulePanel"), p = e("sceneManager"), _ = cc.Class({
extends: cc.Component,
properties: {
publicScrollView: cc.Node,
privateSp: cc.Node,
publicContentSp: cc.Node,
timeLabel: cc.Label,
getVipCoinLabel: cc.Label,
getCoinLabel: cc.Label,
getStoneLabel: cc.Label,
timesLabel: cc.Label,
publicBt: cc.Node,
privateBt: cc.Node
},
statics: {
instance: null
},
onLoad: function() {
_.instance || (_.instance = this);
p.curSceneStatusData = t.extend({
type: "public"
}, p.curSceneStatusData);
this.statusData = p.curSceneStatusData;
this.publicScrollView.parent.getChildByName("roles_bt").active = !o.isHideCanUseRoles;
this.update_();
},
onDestroy: function() {
_.instance = null;
},
update_: function() {
var e = _.genData(this.statusData.type);
this.data = e;
this.publicScrollView.active = "public" == e.type;
this.privateSp.active = "private" == e.type;
this.publicBt.active = "private" == e.type;
this.privateBt.active = "public" == e.type;
if (this.publicScrollView.active) for (var a = 0; a < d.EYE.CONSTS.RANK_COUNT; a++) {
var t = a + 1, s = (g = this.publicContentSp.getChildByName("wheel_node_" + t)).getChildByName("effect_spine").getComponent(sp.Skeleton), o = g.getChildByName("info_bg_node"), l = g.getChildByName("armature_node");
o.active = !!e.list[a].playerId;
s.data = {
tag: t % 2 + 1
};
1 == t && (s.data.tag = 1);
if (o.active) {
s.setAnimation(0, "action_" + s.data.tag + "_1", !0);
(p = o.getChildByName("info_layout")).getChildByName("level_label").getComponent(cc.Label).string = r.t("LV.$1", [ e.list[a].playerLevel ]);
p.getChildByName("name_label").getComponent(cc.Label).string = e.list[a].playerName;
var h = p.getChildByName("time_label").getComponent(cc.Label), u = i.duration(e.list[a].eyeDuration || 0);
h.string = r.t("累计：$1小时$2分", [ u.hours(), u.minutes() ]);
o.getChildByName("me_sp").active = t == e.myRank;
var m = c.role.findOneBy("imgId", e.list[a].playerPhotoInfo.photoImgId).classId;
if ((k = g.characterNode) && k.getComponent("characterArmatureComponent").data.classId != m) {
k.destroy();
k = null;
}
if (!k && m) {
(k = n.getCharacterNode(m)).parent = l;
k.idx = a;
k.getComponent("characterArmatureComponent").setTitle_(e.list[a].playerPhotoInfo.titleImgId);
g.characterNode = k;
}
} else {
if (g.characterNode) {
g.characterNode.destroy();
delete g.characterNode;
}
s.setAnimation(0, "action_" + s.data.tag + "_2", !0);
}
g.data = {
rank: t,
defenderId: e.list[a].playerId
};
}
if (this.privateSp.active) {
var g;
s = (g = this.privateSp.getChildByName("wheel_node")).getChildByName("effect_spine").getComponent(sp.Skeleton), 
o = g.getChildByName("info_bg_node"), l = g.getChildByName("armature_node");
o.active = "private" == e._eye.type;
if (o.active) {
s.setAnimation(0, "action_3_1", !0);
var p, k;
(p = o.getChildByName("info_layout")).getChildByName("level_label").getComponent(cc.Label).string = r.t("LV.$1", [ e.playerLevel ]);
p.getChildByName("name_label").getComponent(cc.Label).string = e.playerName;
h = p.getChildByName("time_label").getComponent(cc.Label), u = i.duration(e.eyeDuration || 0);
h.string = r.t("累计：$1小时$2分", [ u.hours(), u.minutes() ]);
m = c.role.findOneBy("imgId", e.playerPhotoInfo.photoImgId).classId;
if ((k = g.characterNode) && k.getComponent("characterArmatureComponent").data.classId != m) {
k.destroy();
k = null;
}
if (!k && m) {
(k = n.getCharacterNode(m)).parent = l;
k.idx = a;
k.getComponent("characterArmatureComponent").setTitle_(e.playerPhotoInfo.titleImgId);
g.characterNode = k;
}
k.getComponent("characterArmatureComponent").play_("walk");
} else {
if (g.characterNode) {
g.characterNode.destroy();
delete g.characterNode;
}
s.setAnimation(0, "action_3_2", !0);
}
}
u = i.duration(e.eyeDuration || 0);
this.timeLabel.string = r.t("累计：$1小时$2分", [ u.hours(), u.minutes() ]);
this.getVipCoinLabel.string = e.getVipCoin;
this.getCoinLabel.string = e.getCoin;
this.getStoneLabel.string = e.getStoneCount;
this.timesLabel.string = r.t("今日剩余抢位次数:$1", [ e.remainingTimes ]);
},
onSwitch_: function() {
this.statusData.type = "private" == this.data.type ? "public" : "private";
this.update_();
},
onPublicWheel_: function(e) {
var a = e.target.data;
if (a.defenderId) {
n.addLoading();
h.defenseTeam(a.defenderId, function(e) {
n.addViewBattleTeamPanel(e._temp.defenseTeam, {
eyeRank: a.rank,
battleType: u.BATTLE_TYPE.EYE,
defenderId: a.defenderId
});
});
} else p.pushScene(p.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.EYE_TEAM,
opts: {
eyeType: "public",
rank: a.rank
}
});
},
onPrivateWheel_: function() {
if ("private" == this.data._eye.type) {
n.addLoading();
h.defenseTeam(l.player.id, function(e) {
n.addViewBattleTeamPanel(e._temp.defenseTeam, {
battleType: u.BATTLE_TYPE.EYE,
defenderId: l.player.id
});
});
} else 0 == this.data._eye.startTime ? p.pushScene(p.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.EYE_TEAM,
opts: {
eyeType: "private"
}
}) : n.addMessageBox(r.t("是否转为单人训练?"), function() {
p.pushScene(p.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.EYE_TEAM,
opts: {
eyeType: "private"
}
});
});
},
onRoles_: function() {
n.addCanUseRolesPanel(this.data.canUseRoleClassIds, this.data.canUseRoleTitle);
},
onBuy_: function() {
var e = d.EYE.FUNS.getBuyChallengeTimesCost(l.player.vip.buyEyeChallengeTimesTimes + 1), a = l.player.vip.buyEyeChallengeTimesTimes, t = r.t("是否花费$1钻石购买$2次抢位次数?(今日已购买$3次)", [ e, 1, a ]), i = this;
n.addMessageBox(t, function() {
n.addLoading();
h.buyChallengeTimes(function() {
i.update_();
});
});
},
onRule_: function() {
n.addRulePanel(g.TYPE.EYE);
}
});
_.genData = function(e) {
var a = l.player, t = l.player.eye, n = 0;
for (var i in t.list) t.list[i].playerId == a.id && (n = t.list[i].rank);
var r, o = t.startTime ? Date.now() - t.startTime : 0, c = 0, h = 0, u = 0, m = Math.floor(o / 18e5), g = Math.floor(m ? m / 2 : 0);
if (n) {
r = s.clone(d.EYE.CONSTS.RANK_30_MINUTE_REWARD_LIST_MAP[n]);
g > 0 && n <= 5 && (u = 1 == n ? 2 * g : g);
} else r = s.clone(d.EYE.CONSTS.PRIVATE_30_MINUTE_REWARD_LIST);
if (m > 0) for (var i in r) {
r[i].count *= m;
r[i].entityId == d.CONSTS.ENTITY_ID.COIN && (c = r[i].count);
r[i].entityId == d.CONSTS.ENTITY_ID.VIP_COIN && (h = r[i].count);
}
var p = new Date(Date._now()).getDay(), _ = d.EYE.CONSTS.DAY_ROLE_CLASS_IDS_MAP[p], k = d.EYE.CONSTS.DAY_TITLE_MAP[p];
return {
playerPhotoInfo: a.photoInfo,
playerName: a.name,
playerLevel: a.level,
myRank: n,
list: t.list,
getVipCoin: h,
getCoin: c,
getStoneCount: u,
remainingTimes: t.remainingChallengeTimes,
canUseRoleClassIds: _,
canUseRoleTitle: k,
type: e,
eyeDuration: o,
_eye: t
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
dataApi: "dataApi",
eyeHandler: "eyeHandler",
guide: "guide",
helper: "helper",
i18n: "i18n",
moment: "moment",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore",
util: "util",
viewBattleTeamPanel: "viewBattleTeamPanel"
} ],
