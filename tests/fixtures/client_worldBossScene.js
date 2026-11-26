worldBossScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "695679uIMZAAoj04/AdaK0e", "worldBossScene");
var t = e("underscore"), n = e("baseView"), i = (e("socket"), e("i18n")), r = e("helper"), s = e("dataApi"), o = e("soundApi"), l = e("resource"), c = e("serverMain"), d = e("buildExt"), h = e("serverConfig"), u = e("worldBossHandler"), m = e("selectBattleRolesScene"), g = e("rulePanel"), p = e("rankPanel"), _ = e("sceneManager"), k = h.WORLD_BOSS.CONSTS, f = cc.Class({
extends: cc.Component,
properties: {
rankBt: cc.Node,
openTimesLabel: cc.Label,
inspireCostGemLabel: cc.Label,
powerUpLabel: cc.Label,
bossSpine: sp.Skeleton,
inspireSuccessSpine: cc.Node,
rankPanel: cc.Node,
rankItem: cc.Node,
rankItemsLayout: cc.Node,
myRankColor: cc.Color,
rankPanelBottomBgSp: cc.Node
},
onLoad: function() {
this.inspireSuccessSpine.active = !1;
this.rankPanel.active = !1;
this.rankItem.active = !1;
this.rankBt.active = !d.isHideRankBt;
this.update_();
this.rankBt.parent.getChildByName("roles_bt").active = !d.isHideCanUseRoles;
o.playMusic(l.sound_music_boss_battle_mp3);
this.bossSpine.setAnimation(0, this.data.isOpen ? "action" : "action_1", !0);
},
update_: function() {
var e = f.genData();
this.data = e;
this.openTimesLabel.string = i.t("每周一、三、五$1点-$2点开启", [ e.startHour, e.endHour ]);
this.inspireCostGemLabel.string = e.inspireCostGem;
this.powerUpLabel.string = i.t("战力已提高$1%", [ 100 * e.upPower - 100 ]);
for (var a = t.keys(e.playerInfoMap), r = 0; r < a.length; r++) {
var o = e.playerInfoMap[a[r]], l = this.node.getChildByName("type_" + (r + 1) + "_node");
l.data = {
type: a[r]
};
var c = l.getChildByName("info_bg_node");
c.active = !!o;
if (c.active) {
c.getChildByName("name_label").getComponent(cc.Label).string = o.playerName;
c.getChildByName("server_label").getComponent(cc.Label).string = i.t("$1区", [ o.serverId ]);
c.getChildByName("level_label").getComponent(cc.Label).string = i.t("LV.$1", [ o.playerLevel ]);
}
var d = l.getChildByName("armature_node");
d.active = !!o;
if (d.active) {
var h = s.role.findOneBy("imgId", o.playerPhotoInfo.photoImgId), u = h ? h.classId : 1, m = d.characterNode;
if (m && m.getComponent("characterArmatureComponent").data.classId != u) {
m.destroy();
m = null;
}
if (!m && u) {
(m = n.getCharacterNode(u)).parent = d;
m.idx = r;
m.getComponent("characterArmatureComponent").setTitle_(o.playerPhotoInfo.titleImgId);
d.characterNode = m;
}
}
var g = a[r].split("level_")[1].split("_");
l.getChildByName("type_bg_sp").getChildByName("type_label").getComponent(cc.Label).string = i.t("$1-$2级", [ g[0], g[1] ]);
}
},
updateRankPanel_: function(e, a, t) {
this.rankItemMap = this.rankItemMap || {};
n.preHideNodeMap(this.rankItemMap);
for (var r in e) {
var s = e[r], o = this.rankItemMap[r];
if (!o) {
(o = cc.instantiate(this.rankItem)).parent = this.rankItemsLayout;
this.rankItemMap[r] = o;
}
o.active = !0;
n.markHideNode(o);
o.data = {
defenderId: s.playerId
};
(l = o.getChildByName("rank_label")).getComponent(cc.Label).string = s.rank;
(d = o.getChildByName("server_label")).getComponent(cc.Label).string = s.serverId;
(h = o.getChildByName("level_label")).getComponent(cc.Label).string = i.t("LV.$1", [ s.playerLevel ]);
(u = o.getChildByName("name_label")).getComponent(cc.Label).string = s.playerName;
(m = o.getChildByName("value_label")).getComponent(cc.Label).string = s.value;
l._color = l._color || l.color;
d._color = d._color || d.color;
h._color = h._color || h.color;
u._color = u._color || u.color;
m._color = m._color || m.color;
if (e[r].playerId == c.player.id) l.color = d.color = h.color = u.color = m.color = this.myRankColor; else {
l.color = l._color;
d.color = d._color;
h.color = h._color;
u.color = u._color;
m.color = m._color;
}
}
n.hideNodeMap(this.rankItemMap);
var l, d, h, u, m;
(l = this.rankPanelBottomBgSp.getChildByName("rank_label")).getComponent(cc.Label).string = a || i.t("未上榜");
(d = this.rankPanelBottomBgSp.getChildByName("server_label")).getComponent(cc.Label).string = c.player.serverId;
(h = this.rankPanelBottomBgSp.getChildByName("level_label")).getComponent(cc.Label).string = i.t("LV.$1", [ c.player.level ]);
(u = this.rankPanelBottomBgSp.getChildByName("name_label")).getComponent(cc.Label).string = c.player.name;
(m = this.rankPanelBottomBgSp.getChildByName("value_label")).getComponent(cc.Label).string = t || "";
},
onTypeNode_: function(e) {
if (!d.isHideRankBt) {
var a = e.target.data, t = this;
n.addLoading();
u.dmgRank(a.type, function(e) {
n.addPanel(t.rankPanel, !0);
t.updateRankPanel_(e._temp.list, e._temp.myRank, e._temp.myValue);
});
}
},
onInspire_: function() {
if (this.data.isOpen) if (2 != this.data.upPower) {
r.scaleEffect(this.inspireCostGemLabel.node.parent);
var e = this;
n.addLoading();
u.inspire(function(a) {
if (a._temp.isUp) {
c.player.extra.worldBoss.openInfo.upPower = a._temp.upPower;
o.playEffect(l.sound_effect_artifact_upgrade_success_mp3);
n.addHintPanel(i.t("鼓舞成功"));
r.spineEffect(e.inspireSuccessSpine);
e.update_();
} else {
o.playEffect(l.sound_effect_artifact_upgrade_fail_mp3);
n.addHintPanel(i.t("鼓舞失败"));
}
});
} else n.addHintPanel(i.t("战力已提升到上限")); else n.addHintPanel(i.t("未开启"));
},
onRule_: function() {
n.addRulePanel(g.TYPE.WORLD_BOSS);
},
onRank_: function() {
var e = this;
n.addLoading();
u.dmgRank(null, function(a) {
n.addPanel(e.rankPanel, !0);
e.updateRankPanel_(a._temp.list, a._temp.myRank, a._temp.myValue);
});
},
onRankViewTeam_: p.prototype.onRankItem_,
onRoles_: function() {
n.addCanUseRolesPanel(this.data.canUseRoleClassIds, this.data.canUseRoleTitle);
},
onBoss_: function() {
this.data.isOpen ? _.pushScene(_.NAME.SELECT_BATTLE_ROLES_SCENE, {
type: m.TYPE.WORLD_BOSS_BATTLE_TEAM
}) : n.addHintPanel(i.t("未开启"));
}
});
f.genData = function() {
var e = c.player.extra.worldBoss, a = k.START_HOURS, t = k.END_HOURS, n = k.ALLOW_CLASS_IDS, r = i.t("高级战士"), s = k.INSPIRE_COST_GEM;
return {
startHour: a,
endHour: t,
isOpen: e.openInfo.isOpen,
playerInfoMap: e.playerInfoMap,
upPower: e.openInfo.upPower,
canUseRoleClassIds: n,
canUseRoleTitle: r,
inspireCostGem: s
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
rankPanel: "rankPanel",
resource: "resource",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
socket: "socket",
soundApi: "soundApi",
underscore: "underscore",
worldBossHandler: "worldBossHandler"
} ],
