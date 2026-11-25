roleItem: [ function(e, a) {
"use strict";
cc._RF.push(a, "cdcc3U9tKpJZ7Ii7fa9XIX5", "roleItem");
var t = e("underscore"), n = e("dataApi"), i = e("serverConfig"), r = e("baseView"), s = e("resource");
cc.Class({
extends: cc.Component,
properties: {
roleSp: cc.Sprite,
colorSp: cc.Sprite,
groupSp: cc.Sprite,
starLayout: cc.Node,
awakeLayout: cc.Node,
spLightSpine: cc.Node,
frameSpine: cc.Node,
levelBgSp: cc.Node,
levelBgColorSpriteFrames: [ cc.SpriteFrame ],
levelLabel: cc.Label,
starSpriteFrame: cc.SpriteFrame,
moonSpriteFrame: cc.SpriteFrame,
sunSpriteFrame: cc.SpriteFrame,
shenSpriteFrame: cc.SpriteFrame,
awakeSpriteFrames: [ cc.SpriteFrame ],
trainSpriteFrames: [ cc.SpriteFrame ]
},
update_: function(e) {
var a = this, t = String(e.imgId).slice(0, 4);
r.setSpriteFrame(this.roleSp, s["img_" + t + "_png"]);
r.setSpriteFrame(this.colorSp, s["misc_role_color_" + e.color + "_png"]);
this.groupSp.node.active = !!e.group;
this.groupSp.node.active && r.setSpriteFrame(this.groupSp, s["misc_role_big_group_" + e.group + "_png"], !0, !0);
var n = i.FUNS.getValueByBetween([ 1, 2, 4, 7, 12, 15 ], this.levelBgColorSpriteFrames, e.color);
this.levelBgSp.getComponent(cc.Sprite).spriteFrame = n;
this.levelBgSp.active = !!e.level;
this.levelLabel.string = e.level;
this.starLayout.active = e.star > 0;
if (this.starLayout.active) {
for (var o, l = {}, c = 1; c <= 5; c++) {
(o = this.starLayout.getChildByName("star_" + c + "_sp").getComponent(cc.Sprite)).spriteFrame = this.starSpriteFrame;
o.node.active = c <= e.star;
l[c - 1] = o;
}
for (c = 0; c < e.moon; c++) l[c].spriteFrame = this.moonSpriteFrame;
for (c = 0; c < e.sun; c++) l[c].spriteFrame = this.sunSpriteFrame;
for (c = 0; c < e.shen; c++) l[c].spriteFrame = this.shenSpriteFrame;
for (c = 0; c < e.trainPurpleStar; c++) l[c].spriteFrame = this.trainSpriteFrames[0];
for (c = 0; c < e.trainRedStar; c++) l[c].spriteFrame = this.trainSpriteFrames[1];
for (c = 0; c < e.trainBlueStar; c++) l[c].spriteFrame = this.trainSpriteFrames[2];
}
this.awakeLayout.active = e.green > 0;
if (this.awakeLayout.active) {
var d, h = {};
for (c = 1; c <= 5; c++) {
(d = this.awakeLayout.getChildByName("awake_" + c + "_sp").getComponent(cc.Sprite)).spriteFrame = this.awakeSpriteFrames[0];
d.node.active = c <= e.green;
h[c - 1] = d;
}
for (c = 0; c < e.blue; c++) h[c].spriteFrame = this.awakeSpriteFrames[1];
for (c = 0; c < e.purple; c++) h[c].spriteFrame = this.awakeSpriteFrames[2];
for (c = 0; c < e.orange; c++) h[c].spriteFrame = this.awakeSpriteFrames[3];
}
this.spLightSpine && (this.spLightSpine.active = 5 == e.group);
if (this.frameSpine) {
this.frameSpine.active = !!e.frameId;
this.frameSpine.active && this.scheduleOnce(function() {
r.setSpineAsset(a.frameSpine, s["photo_frame_spine_" + e.frameId + "_skel"]);
}, 0);
}
}
}).genData = function(e) {
var a = e.kindId ? n.findEntityById(e.kindId) : null;
a = a || e;
var r = e.star ? i.ROLE.FUNS.getStarKind(e.star) : {}, s = null != e.awakeLevel ? i.ROLE.FUNS.getAwakeKind(e.awakeLevel) : {}, o = 0;
for (var l in e.trainLevelMap) e.trainLevelMap[l] == i.ROLE.CONSTS.TRAIN_ITEM_IDS_MAP[l].length && o++;
var c = 0;
if (o > 5) {
c = o - 5;
o = 5;
}
var d = 0;
if (c > 5) {
d = c - 5;
c = 5;
}
var h = e.evolveSkillIds ? e.evolveSkillIds.length : 0;
h = e.evolveSkillCount || h;
var u = 0, m = t.values(e.soulLevelMap);
8 == t.filter(m, function(e) {
return 10 == e;
}).length && !u && a.group >= 5 && (u = 5);
8 == t.filter(m, function(e) {
return e >= 8;
}).length && !u && a.group >= 5 && (u = 4);
8 == t.filter(m, function(e) {
return e >= 5;
}).length && !u && a.group >= 5 && (u = 3);
8 == t.filter(m, function(e) {
return e >= 3;
}).length && !u && a.group >= 5 && (u = 2);
8 != t.filter(m, function(e) {
return e >= 1;
}).length || u || (u = 1);
return {
kindId: e.kindId || e.mobId,
star: r.star,
moon: r.moon,
sun: r.sun,
shen: r.shen,
green: s.green,
blue: s.blue,
purple: s.purple,
orange: s.orange,
trainPurpleStar: o,
trainRedStar: c,
trainBlueStar: d,
level: e.level || 0,
power: e.power || 0,
hpPct: e.hpPct || void 0,
mpPct: e.mpPct || void 0,
color: a.color,
imgId: a.imgId,
group: a.group || null,
evolveSkillCount: h,
frameId: u,
_role: e,
_data: a
};
};
cc._RF.pop();
}, {
baseView: "baseView",
dataApi: "dataApi",
resource: "resource",
serverConfig: "serverConfig",
underscore: "underscore"
} ],
