"islandScene.myIsland": [ function(e, a) {
"use strict";
cc._RF.push(a, "0d102dFyUNFB7HI9aQBcXOs", "islandScene.myIsland");
var t = e("baseView"), n = e("underscore"), i = e("helper"), r = e("serverMain"), s = e("serverConfig"), o = e("islandScene"), l = e("i18n"), c = e("soundApi"), d = e("islandHandler"), h = e("shipItem"), u = e("roleItem"), m = e("resource"), g = s.ISLAND.CONSTS, p = s.ISLAND.FUNS, _ = cc.Class({
extends: cc.Component,
properties: {
islandCountLabel: cc.Label,
tipsLabel: cc.Label,
nullNode: cc.Node,
myIslandItem: cc.Node,
myIslandContent: cc.Node,
roleItem: cc.Node,
shipItem: cc.Node
},
onLoad: function() {
this.myIslandItem.active = !1;
this.roleItem.active = !1;
this.shipItem.active = !1;
},
update_: function(e) {
var a = _.genData(e);
this.data = a;
i.replaceLabel(this.islandCountLabel, [ a.islandCount, a.maxIslandCount ]);
i.replaceLabel(this.tipsLabel, [ a.maxIslandCount ]);
this.myIslandItemMap = this.myIslandItemMap || {};
t.preHideNodeMap(this.myIslandItemMap);
for (var n in a.myIslandItems) {
var r = a.myIslandItems[n], s = this.myIslandItemMap[n];
if (!s) {
(s = cc.instantiate(this.myIslandItem)).parent = this.myIslandContent;
this.myIslandItemMap[n] = s;
}
s.active = !0;
t.markHideNode(s);
var c = p.getResLevel(r.resourceId);
s.getChildByName("island_sp").getComponent(cc.Sprite).spriteFrame = o.instance.infoComponent.islandSpriteFrame[c - 1];
var d = l.t(g.RES_NAME_MAP[c]), m = s.getChildByName("island_name_label").getComponent(cc.Label);
i.replaceLabel(m, [ d ]);
var k = s.getChildByName("reward_layout").getChildByName("reward_label"), f = p.getRewardDropList(r, 1), y = f[0] ? f[0].count : 0;
i.replaceLabel(k.getComponent(cc.Label), [ y ]);
s.getChildByName("guard_label").getComponent(cc.Label).string = r.defenseTeam.playerName;
s.getChildByName("abandon_bt").data = r;
var b = s.getChildByName("member_item");
b.roleItemMap = b.roleItemMap || {};
t.preHideNodeMap(b.roleItemMap);
b.shipItemMap = b.shipItemMap || {};
t.preHideNodeMap(b.shipItemMap);
for (var v = r.defenseTeam, S = 0; S < v.ships.length; S++) {
var T = h.genData(v.ships[S]), M = b.shipItemMap[S];
if (!M) {
(M = cc.instantiate(this.shipItem)).parent = b.getChildByName("ship_" + (S + 1) + "_bg_sp");
b.shipItemMap[S] = M;
}
M.active = !0;
t.markHideNode(M);
M.getComponent("shipItem").update_(T);
}
for (S = 0; S < v.roles.length; S++) {
var $ = u.genData(v.roles[S]), I = b.roleItemMap[S];
if (!I) {
(I = cc.instantiate(this.roleItem)).parent = b.getChildByName("role_" + (S + 1) + "_bg_sp");
b.roleItemMap[S] = I;
}
I.active = !0;
t.markHideNode(I);
I.getComponent("roleItem").update_($);
}
t.hideNodeMap(b.roleItemMap);
t.hideNodeMap(b.shipItemMap);
}
t.hideNodeMap(this.myIslandItemMap);
this.nullNode.active = 0 == a.myIslandItems.length;
},
show_: function(e) {
t.addPanel(this.node, !0);
this.update_(e);
},
onClose_: function() {
t.removePanel(this.node);
},
onAbandon_: function(e) {
var a = this, n = e.target.data;
o.instance._showTipNode("text", l.t("放弃星球"), l.t("确认放弃当前占领的星球吗？"), function() {
t.addLoading();
d.earlySettlement(n.id, function(e) {
if (e._temp.entityCountMap) {
t.addRewardPanel(l.t("结算奖励"), e._temp.entityCountMap);
c.playEffect(m.sound_effect_task_finish_mp3);
}
delete r.player.island.defenseInfoMap[n.id];
a.update_(a.data.resourceInfoIdTeamMap);
});
});
}
});
_.genData = function(e) {
var a = r.player, t = [];
for (var i in a.island.defenseInfoMap) {
var s = a.island.defenseInfoMap[i];
s.defenseTeam = e[i];
s.defenseTeam && t.push(s);
}
return {
myIslandItems: t,
islandCount: n.values(a.island.defenseInfoMap).length,
maxIslandCount: g.DEFENSE_TIMES,
resourceInfoIdTeamMap: e
};
};
cc._RF.pop();
}, {
baseView: "baseView",
helper: "helper",
i18n: "i18n",
islandHandler: "islandHandler",
islandScene: "islandScene",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipItem: "shipItem",
soundApi: "soundApi",
underscore: "underscore"
} ],
