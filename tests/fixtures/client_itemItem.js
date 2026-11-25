itemItem: [ function(e, a) {
"use strict";
cc._RF.push(a, "b4599wypjhIRKQnU4uREdp9", "itemItem");
var t = e("underscore"), n = e("i18n"), i = e("serverMain"), r = e("helper"), s = e("dataApi"), o = (e("buildExt"), 
e("serverConfig")), l = e("baseView"), c = e("resource"), d = e("soundComponent");
cc.Class({
extends: cc.Component,
properties: {
bgSp: cc.Node,
itemSp: cc.Sprite,
colorSp: cc.Sprite,
countLabel: cc.Label,
levelLabel: cc.Label,
starSignLevelLabel: cc.Label,
evolveSp: cc.Node,
starLayout: cc.Node,
owerLabel: cc.Label,
selectSp: cc.Node,
groupSp: cc.Node,
newSp: cc.Node
},
onLoad: function() {
this.isShowPanel = this.isShowPanel || !1;
},
onDisable: function() {
this.entityPanel && (this.entityPanel.active = !1);
},
update_: function(e) {
this.data = e;
this.countLabel.node.active = e.isShowCount && e.count > 1;
if (e.isShowCount) {
var a = this.node.parent ? this.node.parent.scale : 1;
this.countLabel.node.preScale = this.countLabel.node.preScale || this.countLabel.node.scale;
var t = this.countLabel.node.preScale;
this.countLabel.node.scale = t / this.node.scale / a;
e.count >= 1e6 && e.count % 1e6 == 0 ? r.replaceLabel(this.countLabel, [ e.count / 1e6 + "M" ]) : e.count >= 1e4 && e.count % 1e3 == 0 ? r.replaceLabel(this.countLabel, [ e.count / 1e3 + "K" ]) : r.replaceLabel(this.countLabel, [ e.count ]);
this.countLabel._forceUpdateRenderData(!0);
this.countLabel.node.width * this.countLabel.node.scale > this.node.width && (this.countLabel.node.scale = this.node.width / this.countLabel.node.width * .9);
}
this.levelLabel.node.active = e.isShowLevel;
e.isShowLevel && (this.levelLabel.string = n.t("LV.$1", [ e.level ]));
cc.Tween.stopAllByTarget(this.levelLabel.node);
this.levelLabel.node.y = 32;
e.isShowUpgrade && cc.tween(this.levelLabel.node).repeatForever(cc.tween().by(.5, {
position: cc.v2(0, 10)
}).by(.5, {
position: cc.v2(0, -10)
})).start();
this.owerLabel.node.active = e.isShowOwer;
e.isShowOwer && (this.owerLabel.string = e.owerName);
if (this.starSignLevelLabel) {
this.starSignLevelLabel.node.active = !!e.starSignLevel;
this.starSignLevelLabel.node.active && r.replaceLabel(this.starSignLevelLabel, [ e.starSignLevel ]);
}
this.evolveSp.active = e.isShowEvolve;
this.starLayout.active = e.star > 0;
if (this.starLayout.active) for (var i = 1; i <= 10; i++) this.starLayout.getChildByName("star_" + i + "_sp").active = i <= e.star;
var s = c["img_" + e.imgId + "_png"];
s = s || c["img_" + e.imgId + "_jpg"];
l.setSpriteFrame(this.itemSp, s);
switch (e.type) {
case o.CONSTS.ENTITY_TYPE.SOUL:
case o.CONSTS.ENTITY_TYPE.ARTIFACT_FRAGMENT:
case o.CONSTS.ENTITY_TYPE.SHIP_FRAGMENT:
l.setSpriteFrame(this.colorSp, c.misc_soul_color_png);
this.bgSp.active = !1;
break;

case o.CONSTS.ENTITY_TYPE.ROLE:
l.setSpriteFrame(this.colorSp, c["misc_role_color_" + e.color + "_png"]);
this.node.scale = .82;
this.countLabel.node.active = !1;
break;

case o.CONSTS.ENTITY_TYPE.FRUIT:
case o.CONSTS.ENTITY_TYPE.FRUIT_FRAGMENT:
this.colorSp.node.active = !1;
this.bgSp.active = !1;
break;

default:
l.setSpriteFrame(this.colorSp, c["misc_item_color_" + e.color + "_png"]);
}
this.groupSp.active = !!e.group;
this.groupSp.active && l.setSpriteFrame(this.groupSp.getComponent(cc.Sprite), c["misc_role_big_group_" + e.group + "_png"], !0, !0);
this.newSp && (this.newSp.active = e.isNew);
},
setCountLabelActive_: function(e) {
this.countLabel.node.active = e;
},
setLevelLabelActive_: function(e) {
this.levelLabel.node.active = e;
},
setOwerLabelActive_: function(e) {
this.owerLabel.node.active = e;
},
select_: function() {
this.selectSp.active = !0;
},
unSelect_: function() {
this.selectSp.active = !1;
},
unNew_: function() {
this.data.isNew && storage.setItem("capsule_new_" + i.player.id + "_" + this.data._item.idx, 1);
},
setClickEvent_: function(e, a, t) {
if (n = this.node.getComponent(cc.Button)) {
n.clickEvents[0].target = e;
n.clickEvents[0].component = a;
n.clickEvents[0].handler = t;
} else {
var n = this.node.addComponent(cc.Button), i = new cc.Component.EventHandler();
i.target = e;
i.component = a;
i.handler = t;
n.clickEvents.push(i);
n.transition = cc.Button.Transition.SCALE;
n.duration = .1;
n.zoomScale = 1.05;
this.node.addComponent(d);
}
},
onShowPanel_: function(a) {
if (this.isShowPanel && this.data._item && this.data.type != o.CONSTS.ENTITY_TYPE.ROLE) switch (a.type) {
case cc.Node.EventType.TOUCH_START:
if (this.data.isSelectBox) e("bagScene").prototype.onView_(null, this.data); else {
this.entityPanel = l.addEntityPanel(this.data._item);
var t = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
(t = this.entityPanel.parent.convertToNodeSpaceAR(t)).y += .5 * this.entityPanel.height + .5 * this.node.height;
this.entityPanel.x = t.x;
this.entityPanel.y = t.y;
var n = t.y + .5 * this.entityPanel.height + .5 * cc.winSize.height - (cc.winSize.height - 5), i = t.y + .5 * cc.winSize.height - .5 * this.entityPanel.height;
n > 0 && (this.entityPanel.y -= n);
i < 0 && (this.entityPanel.y += Math.abs(i));
}
break;

case cc.Node.EventType.TOUCH_CANCEL:
case cc.Node.EventType.TOUCH_END:
this.entityPanel && (this.entityPanel.active = !1);
this.entityPanel = null;
}
},
setShowPanel_: function(e) {
if (this.isShowPanel != e) {
this.isShowPanel = e;
this.node.targetOff(this);
if (e) {
this.node.on(cc.Node.EventType.TOUCH_START, this.onShowPanel_, this);
this.node.on(cc.Node.EventType.TOUCH_END, this.onShowPanel_, this);
this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onShowPanel_, this);
}
}
}
}).genData = function(e, a, n, l, c, d) {
if ("number" == typeof e) return {
imgId: e
};
var h = i.player, u = s.findEntityById(e.kindId);
if (e.kindId == o.CONSTS.ENTITY_ID.RANDOM_BOX) {
u = r.clone(u);
if (e.extra && e.extra.id) {
e = r.clone(e);
var m = i.player.shop.randomBoxList[e.extra.id];
t.extend(e, m);
u.extraId = e.extra.id;
delete e.extra.id;
} else e.extra && t.extend(e, e.extra);
u.kindName = e.kindName;
u.desc = e.desc;
u.imgId = e.imgId;
u.color = e.color;
u.extra = {};
e.rdDropListDesc && (u.extra.rdDropListDesc = e.rdDropListDesc);
e.dropListDesc && (u.extra.dropListDesc = e.dropListDesc);
e.selectCount && (u.extra.selectCount = e.selectCount);
}
var g = u.extra && u.extra.selectCount, p = null;
u.type == o.CONSTS.ENTITY_TYPE.SOUL && (p = s.findEntityById(u.roleId).group);
var _ = !!e.idx && u.type == o.CONSTS.ENTITY_TYPE.CAPSULE && !storage.getItem("capsule_new_" + h.id + "_" + e.idx), k = null;
u.type == o.CONSTS.ENTITY_TYPE.STAR_SIGN && (k = e.level);
return {
kindId: e.kindId,
level: e.level || 0,
starSignLevel: k,
count: e.count || 0,
star: e.star || 0,
owerName: e.owerName || "",
color: u ? u.color : 0,
imgId: u ? u.imgId : 0,
name: u ? u.kindName : 0,
type: u ? u.type : 0,
group: p,
isShowCount: a || !1,
isShowLevel: n || !1,
isShowUpgrade: l || !1,
isShowEvolve: c || !1,
isShowOwer: d || !1,
isSelectBox: g,
isNew: _,
_item: e,
_data: u
};
};
cc._RF.pop();
}, {
bagScene: "bagScene",
baseView: "baseView",
buildExt: "buildExt",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
resource: "resource",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundComponent: "soundComponent",
underscore: "underscore"
} ],
