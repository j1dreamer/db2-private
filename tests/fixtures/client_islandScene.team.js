"islandScene.team": [ function(e, a) {
"use strict";
cc._RF.push(a, "32e3d2DC3pOjbUya73qVo3/", "islandScene.team");
var t = e("baseView"), n = e("serverMain"), i = e("moment"), r = e("serverConfig"), s = (e("clientConfig"), 
e("islandHandler")), o = e("islandScene"), l = e("helper"), c = e("roleItem"), d = (e("shipItem"), 
e("i18n")), h = e("underscore"), u = r.ISLAND.CONSTS, m = r.ISLAND.FUNS, g = cc.Class({
extends: cc.Component,
properties: {
centerLayout: cc.Node,
shipScrollview: cc.ScrollView,
roleScrollview: cc.ScrollView,
roleNode: cc.Node,
shipItemNode: cc.Node
},
onLoad: function() {
this.roleNode.active = !1;
this.shipItemNode.active = !1;
},
update_: function(e) {
var a = g.genData(e || -1);
this.data = a;
this.roleScrollview.node.active = "ship" != e;
this.roleNodeMap = this.roleNodeMap || {};
t.preHideNodeMap(this.roleNodeMap);
for (var n = 0; n < a.roleItems.length; n++) {
var r = this.roleNodeMap[n];
if (!r) {
(r = cc.instantiate(this.roleNode)).parent = this.roleScrollview.content;
r.idx = n;
this.roleNodeMap[n] = r;
}
r.active = !0;
var s = a.roleItems[n];
r.data = s;
t.markHideNode(r);
r.getComponentInChildren("roleItem").update_(a.roleItems[n]);
r.getChildByName("practice").active = s.isDefenseUsed;
r.getChildByName("death").active = s.isDead;
r.getChildByName("help").active = s.isHelpUsed;
r.getComponent(cc.Button).interactable = s.isDead;
var o = r.getChildByName("time_label");
o.active = !!s.unlockTime;
if (o.active) {
var c = i.duration(s.unlockTime - Date.now()), h = d.t("复活：$1小时$2分", [ c.hours(), c.minutes() ]);
o.getComponent(cc.Label).string = h;
}
}
t.hideNodeMap(this.roleNodeMap);
this.shipScrollview.node.active = "ship" == e;
this.shipItemNodeMap = this.shipItemNodeMap || {};
t.preHideNodeMap(this.shipItemNodeMap);
for (var n in a.shipItems) {
var u = a.shipItems[n], m = this.shipItemNodeMap[n];
if (!m) {
(m = cc.instantiate(this.shipItemNode)).parent = this.shipScrollview.content;
m.idx = n;
this.shipItemNodeMap[n] = m;
}
m.active = !0;
t.markHideNode(m);
m.getChildByName("ship_item").removeComponent(cc.Button);
m.getChildByName("ship_item").getComponent("shipItem").update_(u);
m.getChildByName("practice_label").active = u.isDefenseUsed;
m.getChildByName("help_label").active = u.isHelpUsed;
var p = m.getChildByName("star_label"), _ = m.getChildByName("level_label");
l.replaceLabel(p.getComponent(cc.Label), [ u._item.star ]);
l.replaceLabel(_.getComponent(cc.Label), [ u._item.level ]);
}
t.hideNodeMap(this.shipItemNodeMap);
},
show_: function() {
t.addPanel(this.node, !0);
this.onType_({
target: this.centerLayout.getChildByName("all_bt")
});
},
onClose_: function() {
t.removePanel(this.node);
},
onType_: function(e, a) {
h.each(this.centerLayout.children, function(a) {
var t = a.getChildByName("label").getComponent(cc.Label).string === e.target.getChildByName("label").getComponent(cc.Label).string;
a.getComponent(cc.Button).interactable = !0;
a.getChildByName("label").opacity = t ? 0 : 255;
a.getChildByName("select_label").opacity = t ? 255 : 0;
});
e.target.getComponent(cc.Button).interactable = !1;
this.update_(a);
},
onRevive_: function(e) {
var a = e.target.data, i = this, r = m.getReviveRoleCost(n.player.island.teamIdxUnLockTimeMap[a._role.idx]).costCount;
o.instance._showTipNode("revive", d.t("英雄阵亡"), r, function() {
t.addLoading();
s.reviveRole(a._role.idx, function() {
i.update_(i.data.positionType);
o.instance.update_();
});
});
}
});
g.genData = function(a) {
var t = n.player, i = t.team, s = t.bag, o = t.island, l = m.getAreaId(t.level), d = u.AREA_NEED_ROLE_LEVEL_MAP[l], g = [];
for (var p in i.roles) {
var _ = i.roles[p];
if (!(_.level < d)) {
var k = c.genData(_);
if (-1 == a || k._data.positionType == a) {
var f = o.teamIdxUnLockTimeMap[_.idx] || 0;
if (Date.now() < f) {
k.isDead = !0;
k.unlockTime = f;
}
h.include(o.defenseTeamIndexs, _.idx) && (k.isDefenseUsed = !0);
h.include(o.helpTeamIndexs, _.idx) && (k.isHelpUsed = !0);
g.push(k);
}
}
}
g = h.sortBy(g, function(e) {
return e.isDead ? -99999999999 : e.isDefenseUsed ? -99999999998 : e.isHelpUsed ? -99999999997 : -e._role.power;
});
var y = s.getItemByType(r.CONSTS.ENTITY_TYPE.SHIP), b = [];
for (var p in y) {
var v = e("shipItem").genData(y[p]);
h.include(o.defenseShipIndexs, y[p].idx) && (v.isDefenseUsed = !0);
h.include(o.helpShipIndexs, y[p].idx) && (v.isHelpUsed = !0);
b.push(v);
}
return {
positionType: a,
roleItems: g,
shipItems: b = h.sortBy(b, function(e) {
return e.isDefenseUsed ? -99999999999 : e.isHelpUsed ? -99999999998 : e._item.power;
})
};
};
cc._RF.pop();
}, {
baseView: "baseView",
clientConfig: "clientConfig",
helper: "helper",
i18n: "i18n",
islandHandler: "islandHandler",
islandScene: "islandScene",
moment: "moment",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipItem: "shipItem",
underscore: "underscore"
} ],
