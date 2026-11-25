sixType1Scene: [ function(e, a) {
"use strict";
cc._RF.push(a, "a5ae1YyYi1AQa2SC/x7BbTq", "sixType1Scene");
e("underscore"), e("util");
var t = e("baseView"), n = e("helper"), i = e("i18n"), r = e("buildExt"), s = e("dataApi"), o = e("serverMain"), l = e("serverConfig"), c = e("sixPracticeHandler"), d = e("sceneManager"), h = e("viewBattleTeamPanel"), u = e("rulePanel"), m = e("selectBattleRolesScene"), g = (l.PRACTICE.CONSTS.TYPE, 
cc.Class({
extends: cc.Component,
properties: {
scrollview: cc.ScrollView,
itemsLayout: cc.Node,
defenseTimesLabel: cc.Label,
challengeTimesLabel: cc.Label,
practicePlayerItem: cc.Node
},
onLoad: function() {
this.practicePlayerItem.active = !1;
this.update_();
},
update_: function() {
var e = g.genData();
this.data = e;
this.defenseTimesLabel.string = i.t("可训练次数：$1", [ e.remainingDefenseTimes ]);
this.challengeTimesLabel.string = i.t("可扰乱次数：$1", [ e.remainingChallengeTimes ]);
this.data.defenseInfos || this.scheduleOnce(function() {
this.onRefresh_();
}, 0);
},
onRefresh_: function() {
t.addLoading();
var e = this;
c.match(function(a) {
var i = a._temp.defenseInfos;
i.length > l.SIX_PRACTICE.CONSTS.MATCH_PLAYER_COUNT && (i = i.slice(0, l.SIX_PRACTICE.CONSTS.MATCH_PLAYER_COUNT));
e.data.defenseInfos = i;
var r = e.itemsLayout;
r.practicePlayerItemMap = r.practicePlayerItemMap || {};
t.preHideNodeMap(r.practicePlayerItemMap);
for (var c in i) {
var d = r.practicePlayerItemMap[c];
if (!d) {
(d = cc.instantiate(e.practicePlayerItem)).parent = r;
d.idx = c;
r.practicePlayerItemMap[c] = d;
}
d.active = !0;
t.markHideNode(d);
var h = i[c];
d.data = h;
var u = s.role.findOneBy("imgId", h.playerPhotoInfo.photoImgId).classId;
h.classId = u;
var m = d.characterNode;
if (m && m.getComponent("characterArmatureComponent").data.classId != h.classId) {
m.destroy();
m = null;
}
if (!m && h.classId) {
(m = t.getCharacterNode(h.classId)).parent = d.getChildByName("armature_node");
m.idx = c;
m.getComponent("characterArmatureComponent").setTitle_(h.playerPhotoInfo.titleImgId);
d.characterNode = m;
}
var g = d.getChildByName("info_bg_sp");
g.getChildByName("name_label").getComponent(cc.Label).string = h.playerName;
n.replaceLabel(g.getChildByName("server_label").getComponent(cc.Label), [ h.serverId ]);
n.replaceLabel(g.getChildByName("level_label").getComponent(cc.Label), [ h.playerLevel ]);
d.getChildByName("me_sp").active = h.playerId == o.player.id;
}
t.hideNodeMap(r.practicePlayerItemMap);
i.length <= 3 && e.scrollview.scrollToLeft(0);
});
},
onPractice_: function() {
if (0 != this.data.remainingDefenseTimes) {
var e = o.player.vip.level;
r.SIX_PRACTICE_getVipLevel && (e = r.SIX_PRACTICE_getVipLevel(o.player));
var a = l.SIX_PRACTICE.FUNS.getRewardDropList(e, 1), n = "";
for (var c in a) n += "<" + s.findEntityById(a[c].entityId).kindName + "x" + a[c].count + ">";
var h = l.SIX_PRACTICE.FUNS.getPracticeHours(e);
t.addMessageBox(i.t("本次训练将获得$1,花费$2小时", [ n, h ]), function() {
d.pushScene(d.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.SIX_PRACTICE_DEFENSE_TEAM
});
});
} else t.addHintPanel(i.t("今日次数已用完"));
},
onRule_: function() {
t.addRulePanel(u.TYPE.SIX_TYPE_1);
},
onPracticePlayerItem_: function(e) {
var a = e.target.data;
t.addLoading();
c.defenseTeam(a.playerId, a.ctime, function(e) {
t.addViewBattleTeamPanel(e._temp.defenseTeam, {
battleType: h.BATTLE_TYPE.SIX_PRACTICE
});
});
},
onRoles_: function() {
var e = new Date(Date._now()).getDay(), a = l.SIX_SMAP.CONSTS.DAY_ROLE_CLASS_IDS_MAP[e], n = l.SIX_SMAP.CONSTS.DAY_TITLE_MAP[e];
t.addCanUseRolesPanel(a, n);
}
}));
g.genData = function() {
var e = o.player.practice;
return {
remainingChallengeTimes: e.sixRemainingChallengeTimes,
remainingDefenseTimes: e.sixRemainingDefenseTimes
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
sixPracticeHandler: "sixPracticeHandler",
underscore: "underscore",
util: "util",
viewBattleTeamPanel: "viewBattleTeamPanel"
} ],
