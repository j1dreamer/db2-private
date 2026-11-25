sixType3Scene: [ function(e, a) {
"use strict";
cc._RF.push(a, "3a5b4MP8G5GpY1ooDJl98L6", "sixType3Scene");
var t = e("underscore"), n = e("baseView"), i = e("dataApi"), r = e("i18n"), s = e("helper"), o = (e("soundApi"), 
e("resource"), e("buildExt")), l = e("serverMain"), c = (e("clientConfig"), e("serverConfig")), d = e("sixExpeditionHandler"), h = e("viewBattleTeamPanel"), u = e("rulePanel"), m = (e("sceneManager"), 
c.SIX_EXPEDITION.CONSTS), g = cc.Class({
extends: cc.Component,
properties: {
scrollView: cc.ScrollView,
contentLayout: cc.Node,
timesLabel: cc.Label
},
onLoad: function() {
this.curMapLayout = null;
this.update_();
},
update_: function() {
var e = g.genData();
this.data = e;
s.replaceLabel(this.timesLabel, [ e.remainingTimes ]);
this.timesLabel.string = r.t("今日剩余次数:$1", [ e.remainingTimes ]);
var a = m.CHALLENGER_COUNT;
this.mapLayouts = [];
for (var o = 1; o <= a; o++) {
var l = this.contentLayout.getChildByName("map_" + o + "_layout"), c = o;
l.data = {
rank: c
};
this.mapLayouts.push(l);
var d = c == e.passId + 1;
l.getComponent(cc.Button).interactable = d;
d && (this.curMapLayout = l);
var h = l.getChildByName("box_node");
h.active = !1;
var u = h.getChildByName("spine").getComponent(sp.Skeleton);
l.boxArmature = u;
if (c < e.passId + 1) {
h.active = !0;
u.setAnimation(0, "action_3_3", !0);
} else if (c == e.passId + 1 && e.status == m.STATUS.CAN_RECEIVE) {
h.active = !0;
u.setAnimation(0, "action_3_1", !0);
}
var p = l.getChildByName("map_node");
p.active = !h.active;
if (p.active) {
var _ = p.getChildByName("info_bg_sp");
_.active = d;
var k = e.playerInfos[c - 1];
_.getChildByName("name_label").getComponent(cc.Label).string = k.playerName;
_.getChildByName("server_label").getComponent(cc.Label).string = r.t("$1区", [ k.serverId ]);
_.getChildByName("level_label").getComponent(cc.Label).string = r.t("LV.$1", [ k.playerLevel ]);
var f = p.getChildByName("unknown_info_bg_sp");
f.active = !_.active;
f.getChildByName("server_label").getComponent(cc.Label).string = r.t("$1区", [ k.serverId ]);
var y = p.getChildByName("armature_node"), b = i.role.findOneBy("imgId", k.playerPhotoInfo.photoImgId), v = b ? b.classId : 1, S = y.characterNode;
if (S && S.getComponent("characterArmatureComponent").data.classId != v) {
S.destroy();
S = null;
}
if (!S && v) {
(S = n.getCharacterNode(v)).parent = y;
S.idx = o;
S.scaleX = -1;
S.getComponent("characterArmatureComponent").setTitle_(k.playerPhotoInfo.titleImgId);
y.characterNode = S;
}
}
c++;
}
this.curMapLayout = this.curMapLayout || t.last(this.mapLayouts);
var T = this.scrollView.getScrollOffset().x, M = Math.abs(.5 * this.scrollView.node.width - this.curMapLayout.x), $ = 0 == T ? 0 : .001 * Math.abs(M - T);
this.scrollView.scrollToOffset(cc.v2(Math.abs(this.curMapLayout.x - .5 * this.scrollView.node.width), 0), $);
0 == $ && this.onScroll_(this.scrollView, cc.ScrollView.EventType.SCROLLING);
},
onScroll_: function(e, a) {
switch (a) {
case cc.ScrollView.EventType.SCROLLING:
for (var t in this.mapLayouts) {
var n = this.mapLayouts[t], i = n.x + e.content.x - .5 * e.node.width;
n.y = -.15 * Math.abs(i);
Math.abs(i) <= 125 && (this.curMapLayout = n);
}
break;

case cc.ScrollView.EventType.TOUCH_UP:
this.scrollView.scrollToOffset(cc.v2(Math.abs(this.curMapLayout.x - .5 * e.node.width), 0), .2);
}
},
onMap_: function(e) {
var a = e.target, t = this;
if (this.data.status == m.STATUS.UN_COMPLETE) n.addViewBattleTeamPanel(t.data._expedition.sixChallengerInfo.team, {
expeditionRank: a.data.rank,
expeditionCount: m.CHALLENGER_COUNT,
battleType: h.BATTLE_TYPE.SIX_EXPEDITION
}); else {
n.addLoading();
d.receive(function(e) {
a.getComponent(cc.Button).interactable = !1;
a.boxArmature.setAnimation(0, "action_3_2", !1);
a.boxArmature.setCompleteListener(function() {
a.boxArmature.setCompleteListener(null);
t.scheduleOnce(function() {
t.update_();
}, 0);
n.addRewardEffectPanel(e._temp.entityCountMap);
});
});
}
},
onReset_: function() {
var e = this;
n.addLoading();
d.reset(function() {
n.addLoading();
d.info(function(a) {
l.player.expedition.sixPlayerInfos = a._temp.playerInfos;
e.update_();
});
});
},
onSkip_: function() {
if (!this.data.prePassId || l.player.vip.resetSixExpeditionTimes < 2) n.addHintPanel(r.t("当天第2次重置后才可扫荡")); else if (this.data.passId >= this.data.prePassId) n.addHintPanel(r.t("没有可扫荡的关卡")); else {
var e = this;
n.addMessageBox(r.t("是否扫荡$1-$2关?", [ this.data.passId + 1, this.data.prePassId ]), function() {
n.addLoading();
d.skip(function(a) {
e.update_();
n.addRewardEffectPanel(a._temp.entityCountMap);
});
});
}
},
onRule_: function() {
n.addRulePanel(u.TYPE.SIX_TYPE_3);
}
});
g.genData = function() {
var e = l.player.expedition, a = l.player.vipData.resetSixExpeditionTimes;
o.SIX_EXPEDITION_getTimess && (a = o.SIX_EXPEDITION_getTimess(l.player));
var t = a - l.player.vip.resetSixExpeditionTimes;
return {
playerInfos: e.sixPlayerInfos,
passId: e.sixPassId,
prePassId: e.preSixPassId,
status: e.sixStatus,
remainingTimes: t,
_expedition: e
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
sixExpeditionHandler: "sixExpeditionHandler",
soundApi: "soundApi",
underscore: "underscore",
viewBattleTeamPanel: "viewBattleTeamPanel"
} ],
