guildBossPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "f9564XUaMxM7ZKw6vs/QH+y", "guildBossPanel");
e("underscore");
var t = e("i18n"), n = e("helper"), i = (e("moment"), e("battle.consts"), e("serverMain")), r = e("serverConfig"), s = (e("eyeHandler"), 
e("dataApi")), o = e("baseView"), l = (e("playerItem"), e("shipItem"), e("soundApi"), 
e("guildBossHandler")), c = e("rulePanel"), d = e("itemItem"), h = e("mobPanel"), u = e("rankPanel"), m = e("selectBattleRolesScene"), g = e("sceneManager"), p = r.GUILD_BOSS.CONSTS, _ = cc.Class({
extends: cc.Component,
properties: {
bossArmatureNode: cc.Node,
bossNameLabel: cc.Label,
typeLabel: cc.Label,
itemsLayout: cc.Node,
timesLabel: cc.Label,
openTimesLabel: cc.Label,
challengeItemsLayout: cc.Node,
rankPanel: cc.Node,
rankItem: cc.Node,
rankItemsLayout: cc.Node,
myRankColor: cc.Color,
rankPanelBottomBgSp: cc.Node
},
onLoad: function() {
this.rankPanel.active = !1;
this.rankItem.active = !1;
},
update_: function() {
var e = _.genData();
this.data = e;
this.bossNameLabel.string = e.bossName;
this.typeLabel.string = e.typeName;
n.replaceLabel(this.timesLabel, [ e.remainingTimes ]);
this.openTimesLabel.node.active = !e.isOpen;
this.openTimesLabel.string = t.t("每天$1点-$2点开启", [ e.startHour, e.endHour ]);
var a = this.bossArmatureNode.characterNode;
if (!a) {
(a = o.getCharacterNode(e.bossClassId)).parent = this.bossArmatureNode;
this.bossArmatureNode.characterNode = a;
a.getComponent("characterArmatureComponent").play_("standby");
}
for (var i = 0; i < 4; i++) {
(r = this.itemsLayout.getChildByName("item_item_" + (i + 1))).active = !!e.itemItems[i];
if (r.active) {
r.getComponent("itemItem").update_(e.itemItems[i]);
r.getComponent("itemItem").setShowPanel_(!0);
}
}
for (i = 0; i < 2; i++) {
var r;
(r = this.challengeItemsLayout.getChildByName("item_item_" + (i + 1))).active = !!e.itemItems[i];
if (r.active) {
r.getComponent("itemItem").update_(e.challengeItemItems[i]);
r.getComponent("itemItem").setShowPanel_(!0);
}
}
},
updateRankPanel_: function(e, a, n) {
this.rankItemMap = this.rankItemMap || {};
o.preHideNodeMap(this.rankItemMap);
for (var r in e) {
var s = e[r], l = this.rankItemMap[r];
if (!l) {
(l = cc.instantiate(this.rankItem)).parent = this.rankItemsLayout;
this.rankItemMap[r] = l;
}
l.active = !0;
o.markHideNode(l);
l.data = {
defenderId: s.playerId
};
(c = l.getChildByName("rank_label")).getComponent(cc.Label).string = s.rank;
(d = l.getChildByName("server_label")).getComponent(cc.Label).string = s.serverId;
(h = l.getChildByName("level_label")).getComponent(cc.Label).string = t.t("LV.$1", [ s.playerLevel ]);
(u = l.getChildByName("name_label")).getComponent(cc.Label).string = s.playerName;
(m = l.getChildByName("value_label")).getComponent(cc.Label).string = s.value;
c._color = c._color || c.color;
d._color = d._color || d.color;
h._color = h._color || h.color;
u._color = u._color || u.color;
m._color = m._color || m.color;
if (e[r].playerId == i.player.id) c.color = d.color = h.color = u.color = m.color = this.myRankColor; else {
c.color = c._color;
d.color = d._color;
h.color = h._color;
u.color = u._color;
m.color = m._color;
}
}
o.hideNodeMap(this.rankItemMap);
var c, d, h, u, m;
(c = this.rankPanelBottomBgSp.getChildByName("rank_label")).getComponent(cc.Label).string = a || t.t("未上榜");
(d = this.rankPanelBottomBgSp.getChildByName("server_label")).getComponent(cc.Label).string = i.player.serverId;
(h = this.rankPanelBottomBgSp.getChildByName("level_label")).getComponent(cc.Label).string = t.t("LV.$1", [ i.player.level ]);
(u = this.rankPanelBottomBgSp.getChildByName("name_label")).getComponent(cc.Label).string = i.player.name;
(m = this.rankPanelBottomBgSp.getChildByName("value_label")).getComponent(cc.Label).string = n || "";
},
onBattle_: function() {
this.data.isOpen ? this.data.remainingTimes <= 0 ? o.addHintPanel(t.t("挑战次数已经用完")) : g.pushScene(g.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.GUILD_BOSS_BATTLE_TEAM
}) : o.addHintPanel(t.t("每天$1点-$2点开启", [ this.data.startHour, this.data.endHour ]));
},
onRule_: function() {
o.addRulePanel(c.TYPE.GUILD_BOSS);
},
onRank_: function() {
var e = this;
o.addLoading();
l.dmgRank(null, function(a) {
o.addPanel(e.rankPanel, !0);
e.updateRankPanel_(a._temp.list, a._temp.myRank, a._temp.myValue);
});
},
onRankViewTeam_: u.prototype.onRankItem_
});
_.genData = function() {
var e = i.player, a = e.extra.guildBoss.openInfo, n = r.FUNS.getValueByBetween(p.LEVEL_BETWEEN, p.ATTACK_TIMES_BETWEEN, e.level) - a.attackTimes, o = r.FUNS.getValueByBetween(p.LEVEL_BETWEEN, p.BOSS_MOB_ID_BETWEEN, e.level), l = s.mob.findById(o).classId, c = h.genData(o).mobName, u = r.FUNS.getValueByBetween(p.LEVEL_BETWEEN, p.LEVEL_TYPE_BETWEEN, e.level).split("_").slice(1, 3), m = t.t("$1-$2级战场", u), g = p.START_HOURS, _ = p.END_HOURS, k = r.FUNS.getValueByBetween(p.LEVEL_BETWEEN, p.RANK_REWARD_DROP_LIST_MAPS, e.level), f = r.DROP.FUNS.getDropListByDesc(k[1]), y = [];
for (var b in f) y.push(d.genData({
kindId: f[b].entityId,
count: f[b].count
}));
f = r.DROP.FUNS.getDropListByDesc(p.CHALLENGE_REWARD_DESC);
var v = [];
for (var b in f) v.push(d.genData({
kindId: f[b].entityId,
count: f[b].count
}, !0));
return {
isOpen: a.isOpen,
bossName: c,
typeName: m,
bossClassId: l,
remainingTimes: n,
startHour: g,
endHour: _,
itemItems: y,
challengeItemItems: v
};
};
cc._RF.pop();
}, {
baseView: "baseView",
"battle.consts": "battle.consts",
dataApi: "dataApi",
eyeHandler: "eyeHandler",
guildBossHandler: "guildBossHandler",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
mobPanel: "mobPanel",
moment: "moment",
playerItem: "playerItem",
rankPanel: "rankPanel",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipItem: "shipItem",
soundApi: "soundApi",
underscore: "underscore"
} ],
