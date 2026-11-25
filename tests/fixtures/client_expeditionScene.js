expeditionScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "e881aOjBn9CCqw9+8EJPjmY", "expeditionScene");
var t = e("underscore"), n = e("baseView"), i = (e("socket"), e("i18n")), r = e("helper"), s = e("dataApi"), o = (e("soundApi"), 
e("resource"), e("guide"), e("serverMain")), l = (e("clientConfig"), e("serverConfig")), c = e("expeditionHandler"), d = e("viewBattleTeamPanel"), h = e("rulePanel"), u = e("sceneManager"), m = l.EXPEDITION.CONSTS, g = function(e) {
var a = 1;
e == m.CHALLENGER_COUNT ? a = 3 : t.include(t.keys(m.REWARD_EXPEDITION_MONEY_MAP), String(e)) && (a = 2);
return a;
}, p = cc.Class({
extends: cc.Component,
properties: {
scrollView: cc.ScrollView,
contentSp: cc.Node,
timesLabel: cc.Label
},
onLoad: function() {
this.update_();
},
update_: function() {
var e = p.genData();
this.data = e;
this.timesLabel.string = e.remainingTimes;
for (var a = m.CHALLENGER_COUNT, t = null, i = 1; i <= a; i++) {
var o = this.contentSp.getChildByName("map_" + i + "_layout");
o.data = {
rank: i
};
o.getComponent(cc.Button).interactable = i == e.passId + 1;
i == e.passId + 1 ? t = o : e.passId + 1 > a && i == e.passId && (t = o);
var l = cc.tween().repeatForever(cc.tween().by(1.25, {
position: cc.v2(0, 3.6)
}).by(1.25, {
position: cc.v2(0, -3.6)
})), c = o.getChildByName("box_node");
if (!c.moveTween) {
cc.tween(c).then(l).start();
c.moveTween = l;
}
c.active = !1;
var d = c.getChildByName("armature").getComponent(sp.Skeleton);
o.boxArmature = d;
var h = g(i);
if (i < e.passId + 1) {
c.active = !0;
d.setAnimation(0, "action_" + h + "_3", !0);
} else if (i == e.passId + 1 && e.status == m.STATUS.CAN_RECEIVE) {
c.active = !0;
d.setAnimation(0, "action_" + h + "_1", !0);
}
var u = o.getChildByName("armature_node");
u.active = !c.active && i <= e.passId + 1;
if (u.active) {
var _ = s.role.findOneBy("imgId", e.challengerPlayerInfo.photoInfo.photoImgId), k = _ ? _.classId : 1, f = u.characterNode;
if (f && f.getComponent("characterArmatureComponent").data.classId != k) {
f.destroy();
f = null;
}
if (!f && k) {
(f = n.getCharacterNode(k)).parent = u;
f.idx = i;
u.characterNode = f;
}
}
var y = o.getChildByName("info_layout");
y.active = u.active;
var b = y.getChildByName("level_label").getComponent(cc.Label);
r.replaceLabel(b, [ e.challengerPlayerInfo.playerLevel ]);
y.getChildByName("name_label").getComponent(cc.Label).string = e.challengerPlayerInfo.playerName;
}
this.scrollView.scrollToOffset(cc.v2(t.x - .5 * cc.winSize.width, 0));
p.scrollView = this.scrollView;
},
onMap_: function(e) {
var a = e.target, i = this;
if (this.data.status == m.STATUS.UN_COMPLETE) n.addViewBattleTeamPanel(i.data._expedition.challengerInfo.team, {
expeditionRank: a.data.rank,
expeditionCount: l.EXPEDITION.CONSTS.CHALLENGER_COUNT,
battleType: d.BATTLE_TYPE.EXPEDITION
}); else {
n.addLoading();
c.receive(function(e) {
a.getComponent(cc.Button).interactable = !1;
var r = g(i.data.passId + 1);
a.boxArmature.setAnimation(0, "action_" + r + "_2", !1);
a.boxArmature.setCompleteListener(function() {
a.boxArmature.setCompleteListener(null);
i.scheduleOnce(function() {
i.update_();
}, 0);
n.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var r = t.values(e.team.roles);
for (var s in r) n.addPointRoleEffectNode(r[s]);
}
});
});
}
},
onReset_: function() {
var e = this;
n.addLoading();
c.reset(function() {
e.update_();
});
},
onSkip_: function() {
if (o.player.vip.resetExpeditionTimes < 2) n.addHintPanel(i.t("当天第2次重置后才可扫荡")); else if (!this.data.prePassId || this.data.passId >= this.data.prePassId) n.addHintPanel(i.t("没有可扫荡的关卡")); else {
var e = this;
n.addMessageBox(i.t("是否扫荡$1-$2关?", [ this.data.passId + 1, this.data.prePassId ]), function() {
n.addLoading();
c.skip(function(a) {
e.update_();
n.addRewardEffectPanel(a._temp.entityCountMap);
if (a.team) {
var i = t.values(a.team.roles);
for (var r in i) n.addPointRoleEffectNode(i[r]);
}
});
});
}
},
onRule_: function() {
n.addRulePanel(h.TYPE.EXPEDITION);
},
onShop_: function() {
u.pushScene(u.NAME.SHOP_SCENE, {
type: l.SHOP.CONSTS.TYPE.EXPEDITION
});
}
});
p.genData = function() {
var e = o.player.expedition, a = o.player.vipData.resetExpeditionTimes - o.player.vip.resetExpeditionTimes, t = e.challengerInfo.team;
return {
challengerPlayerInfo: {
playerId: t.playerId,
playerName: t.playerName,
playerLevel: t.playerLevel,
photoInfo: t.playerPhotoInfo
},
passId: e.passId,
prePassId: e.prePassId,
status: e.status,
remainingTimes: a,
_expedition: e
};
};
cc._RF.pop();
}, {
baseView: "baseView",
clientConfig: "clientConfig",
dataApi: "dataApi",
expeditionHandler: "expeditionHandler",
guide: "guide",
helper: "helper",
i18n: "i18n",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
socket: "socket",
soundApi: "soundApi",
underscore: "underscore",
viewBattleTeamPanel: "viewBattleTeamPanel"
} ],
