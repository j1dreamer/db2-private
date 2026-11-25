teamScene: [ function(e, a) {
"use strict";
cc._RF.push(a, "c4a9ff1qRpOAqkdEY8ESQ20", "teamScene");
var t = e("underscore"), n = e("i18n"), i = e("helper"), r = e("baseView"), s = e("guide"), o = e("dataApi"), l = e("serverMain"), c = e("clientConfig"), d = e("serverConfig"), h = (e("player"), 
e("resource")), u = e("buildExt"), m = e("soundApi"), g = e("roleItem"), p = e("rulePanel"), _ = e("shipScene"), k = e("teamHandler"), f = e("bagHandler"), y = e("sceneManager"), b = cc.Class({
extends: cc.Component,
properties: {
topLabel: cc.Label,
teamScrollview: cc.Node,
teamItemSp: cc.Node,
noHaveNode: cc.Node,
teamContentLayout: cc.Node,
rightLayout: cc.Node,
shipBt: cc.Node,
friendshipBt: cc.Node,
fruitBt: cc.Node,
leftLayout: cc.Node,
friendshipCloseBt: cc.Node,
friendshipBgSp: cc.Node,
friendshipScrollview: cc.Node,
friendshipContentLayout: cc.Node,
friendshipRowItem: cc.Node,
friendshipRoleSp: cc.Node,
lockColor: cc.Color,
unLockColor: cc.Color,
friendshipType1SpriteFrame: cc.SpriteFrame,
friendshipType2SpriteFrame: cc.SpriteFrame,
friendshipType3SpriteFrame: cc.SpriteFrame,
friendshipType4SpriteFrame: cc.SpriteFrame,
starSpriteFrame: cc.SpriteFrame,
blackStarSpriteFrame: cc.SpriteFrame,
moonSpriteFrame: cc.SpriteFrame,
sunSpriteFrame: cc.SpriteFrame,
shenSpriteFrame: cc.SpriteFrame,
awakeSpriteFrames: [ cc.SpriteFrame ],
trainSpriteFrames: [ cc.SpriteFrame ],
friendshipUnlockAudio: {
type: cc.AudioClip,
default: null
}
},
statics: {
instance: null
},
onLoad: function() {
b.instance || (b.instance = this);
y.curSceneStatusData = t.extend({
selectBtName: "all_bt",
selectFriendshipBtName: "hp_bt"
}, y.curSceneStatusData);
this.statusData = y.curSceneStatusData;
this.teamItemMap = {};
this.positionType = null;
this.friendshipRowItemMap = {};
this.noNoHaveTeamItemDatas = null;
this.needCreateTeamItemDatas = [];
this.isExit = !1;
this.teamItemSp.active = !1;
this.noHaveNode.zIndex = 1e3;
this.friendshipCloseBt.active = !1;
this.friendshipBgSp.active = !1;
this.friendshipRowItem.active = !1;
this.friendshipRoleSp.active = !1;
this.friendshipBt.active = !u.isHideFriendship;
this.shipBt.active = !u.isHideShip;
this.fruitBt.active = !u.isHideFruit && l.player.level >= c.CONSTS.UNLOCK_LEVEL.DOUBLE_BATTLE;
this.scheduleOnce(function() {
i.scrollviewFadeIn(this.teamScrollview);
}, 0);
var e = this.rightLayout.getChildByName(this.statusData.selectBtName);
this.onType_({
target: e
});
this.teamScrollview.active = !1;
r.setMark(this.shipBt, _.genData().isNeedMark);
s.run([ s.friendshipIntroduce ]);
m.playMusic(h.sound_music_team_mp3);
},
onDestroy: function() {
b.instance = null;
},
update: function() {
if (0 != this.needCreateTeamItemDatas.length && !this.isExit) {
var e = this.needCreateTeamItemDatas.shift(), a = this.teamItemMap[e.classId];
if (!a || !a.active) {
var t = b.cacheTeamItemMap[e.classId];
if (t) {
t.parent = this.teamContentLayout;
this.teamItemMap[e.classId] = t;
}
this.updateTeamItem_(e);
}
}
},
onExit_: function() {
this.isExit = !0;
t.each(this.teamItemMap, function(e) {
e.scale = 1;
e.removeComponent(cc.Button);
e.removeComponent("soundComponent");
if (e.parent) {
e.removeFromParent(!1);
e.parent = null;
}
b.cacheTeamItemMap[e.data.classId] = e;
});
},
update_: function(e) {
u.hideRoleClassIds && (e = t.filter(e, function(e) {
var a = o.findEntityById(e.kindId);
return !t.include(u.hideRoleClassIds, a.classId);
}));
t.each(this.teamItemMap, function(e) {
e.active = !1;
});
e = t.sortBy(e, function(e) {
return -e.power;
});
this.needCreateTeamItemDatas = [];
for (var a in e) this.needCreateTeamItemDatas.push(y.teamData.teamItemMap[e[a].idx]);
var n = t.sortBy(l.player.team.roles, function(e) {
return -e.power;
});
t.each(n, function(e, a) {
y.teamData.teamItemMap[e.idx].index = a;
});
var i = b.genNoHaveTeamItemDatas();
this.noNoHaveTeamItemDatas = this.positionType == c.CONSTS.POSITION_TYPE.NONE ? i : t.where(i, {
positionType: this.positionType
});
this.needCreateTeamItemDatas = this.needCreateTeamItemDatas.concat(this.noNoHaveTeamItemDatas);
for (var a in this.needCreateTeamItemDatas) {
var s = this.needCreateTeamItemDatas[a];
this.teamItemMap[s.classId] && this.updateTeamItem_(s);
}
r.setMark(this.friendshipBt, y.teamData.friendshipData.isNeedMark);
},
updateTeamItem_: function(a) {
var t = a.isHave, n = this.teamItemMap[a.classId];
if (!n) {
(n = cc.instantiate(this.teamItemSp)).parent = this.teamContentLayout;
this.teamItemMap[a.classId] = n;
}
n.active = !0;
r.setSpriteFrame(n.getChildByName("bg_sp").getComponent(cc.Sprite), h["misc_role_big_color_" + a.roleItem.color + "_png"], !0, !0);
n.zIndex = a.index || 0;
if (!n.getComponent(cc.Button)) {
var o = n.addComponent(cc.Button), l = new cc.Component.EventHandler();
l.target = this.node;
l.component = "teamScene";
l.handler = "onTeamItem_";
o.transition = cc.Button.Transition.SCALE;
o.zoomScale = 1.05;
o.clickEvents.push(l);
n.addComponent(e("soundComponent"));
}
n.data = a;
r.setMark(n, a.isNeedMark);
var c = a.roleItem, d = n.getChildByName("role_sp").getComponent(cc.Sprite);
r.setSpriteFrame(d, h["team_role_" + c._data.classId + "_png"]);
var u = n.getChildByName("group_sp");
u.active = !!c.group;
u.active && r.setSpriteFrame(u.getComponent(cc.Sprite), h["misc_role_big_group_" + c.group + "_png"], !0, !0);
var m = n.getChildByName("bottom_sp");
m.active = c.star > 0;
var g = m.getChildByName("star_layout");
if (g.active) {
for (var p, _ = {}, k = 1; k <= 5; k++) {
(p = g.getChildByName("star_" + k + "_sp").getComponent(cc.Sprite)).spriteFrame = this.starSpriteFrame;
p.node.active = k <= c.star;
_[k - 1] = p;
}
for (k = 0; k < c.moon; k++) _[k].spriteFrame = this.moonSpriteFrame;
for (k = 0; k < c.sun; k++) _[k].spriteFrame = this.sunSpriteFrame;
for (k = 0; k < c.shen; k++) _[k].spriteFrame = this.shenSpriteFrame;
for (k = 0; k < c.trainPurpleStar; k++) _[k].spriteFrame = this.trainSpriteFrames[0];
for (k = 0; k < c.trainRedStar; k++) _[k].spriteFrame = this.trainSpriteFrames[1];
for (k = 0; k < c.trainBlueStar; k++) _[k].spriteFrame = this.trainSpriteFrames[2];
}
var f = n.getChildByName("awake_layout");
f.active = c.green > 0;
if (f.active) {
var y, b = {};
for (k = 1; k <= 5; k++) {
(y = f.getChildByName("awake_" + k + "_sp").getComponent(cc.Sprite)).spriteFrame = this.awakeSpriteFrames[0];
y.node.active = k <= c.green;
b[k - 1] = y;
}
for (k = 0; k < c.blue; k++) b[k].spriteFrame = this.awakeSpriteFrames[1];
for (k = 0; k < c.purple; k++) b[k].spriteFrame = this.awakeSpriteFrames[2];
for (k = 0; k < c.orange; k++) b[k].spriteFrame = this.awakeSpriteFrames[3];
}
var v = m.getChildByName("level_bg_sp").getChildByName("label").getComponent(cc.Label);
i.replaceLabel(v, [ c.level || 1 ]);
var S = m.getChildByName("power_label").getComponent(cc.Label);
i.replaceLabel(S, [ c.power ]);
r.setGray(n, t);
var T = n.getChildByName("soul_bar");
T.active = !t;
if (T.active) {
n.zIndex = a.isCanCompose ? -1 : 1001;
T.getComponent(cc.ProgressBar).progress = a.soulCount / a.costSoul;
var M = T.getChildByName("count_label").getComponent(cc.Label);
i.replaceLabel(M, [ a.soulCount, a.costSoul ]);
}
3 == a.classId && s.callNext("mainTask", "guideNext1");
},
onType_: function(e) {
var a = e.target;
t.each(this.rightLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
a.getComponent(cc.Button).interactable = !1;
var s = this.statusData.selectBtName;
this.statusData.selectBtName = a.name;
switch (a.name) {
case "friendship_bt":
this.scheduleOnce(function() {
i.scrollviewFadeIn(this.friendshipBgSp);
var e = this.leftLayout.getChildByName(this.statusData.selectFriendshipBtName);
this.onFriendshipType_({
target: e
});
this.topLabel.string = n.t("羁绊");
}, 0);
this.friendshipCloseBt.active = !0;
r.getBackNode().node.active = !1;
this.teamScrollview.opacity = 0;
this.rightLayout.active = !1;
return;

case "ship_bt":
y.pushScene(y.NAME.SHIP_SCENE);
this.statusData.selectBtName = s;
return;

case "fruit_bt":
y.pushScene(y.NAME.FRUIT_SCENE);
this.statusData.selectBtName = s;
return;

case "artifact_bt":
y.pushScene(y.NAME.ARTIFACT_BOOK_SCENE);
this.statusData.selectBtName = s;
return;

default:
this.rightLayout.active = !0;
this.friendshipBgSp.active = !1;
this.friendshipCloseBt.active = !1;
r.getBackNode().node.active = !0;
this.topLabel.string = n.t("战士");
}
this.teamScrollview.opacity = 255;
var d = c.CONSTS.POSITION_TYPE, h = [ d.NONE, d.FORNT, d.CENTER, d.BACK ][t.indexOf([ "all_bt", "fornt_bt", "center_bt", "back_bt" ], a.name)];
this.positionType = h;
var u = h ? t.values(l.player.team.roles) : [];
u && (u = t.filter(u, function(e) {
return h == d.NONE || o.findEntityById(e.kindId).positionType == h;
}));
u && this.update_(u);
var m = this.teamScrollview.getComponent(cc.ScrollView);
m.stopAutoScroll();
m.scrollToTop(0);
m.getComponent("listViewComponent").delayUpdate_(0);
},
onTeamItem_: function(e) {
var a = e.target.data;
if (a.isHave) y.pushScene(y.NAME.ROLE_SCENE, {
roleIdx: Number(a._role.idx),
positionType: this.positionType
}); else if (a.isCanCompose) {
var i = this;
r.addMessageBox(n.t("是否花费$1金币召唤该战士?", [ a.costCoin ]), function() {
r.addLoading();
f.composeRole(a.classId, function(e) {
var a = i.rightLayout.getChildByName(i.statusData.selectBtName);
i.onType_({
target: a
});
var n = t.values(e.team.roles)[0];
r.addPointRoleEffectNode(n);
});
s.callNext("mainTask", "guideNext2");
}, null, null, null, !!s.mainTask.run);
} else y.pushScene(y.NAME.ROLE_SCENE, {
role: a._role
});
},
onFriendshipType_: function(e) {
var a = this.friendshipScrollview.getComponent(cc.ScrollView);
a.stopAutoScroll();
a.scrollToTop(0);
a.getComponent("listViewComponent").delayUpdate_(0);
var n = e.target;
this.statusData.selectFriendshipBtName = n.name;
t.each(this.leftLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
n.getComponent(cc.Button).interactable = !1;
this.updateFriendship_();
},
updateFriendship_: function() {
var e = y.teamData.friendshipData, a = d.ROLE.CONSTS.FRIENDSHIP_TYPE, s = [ a.HP, a.ATK, a.DEF, a.MDEF ], o = [ "hp_bt", "atk_bt", "def_bt", "mdef_bt" ], c = [ e.hp, e.atk, e.def, e.mdef ];
for (var u in o) {
var m = this.leftLayout.getChildByName(o[u]), g = m.getChildByName("attr_label").getComponent(cc.Label), p = m.getChildByName("effect_armature");
p.active = !1;
c[u] > Number(g.string) && i.spineEffect(p);
i.replaceLabel(g, [ c[u] ]);
r.setMark(m, e.isNeedUnLockTypeMap[s[u]]);
}
var _ = s[t.indexOf(o, this.statusData.selectFriendshipBtName)];
for (var u in e.friendshipItems) {
var k = e.friendshipItems[u], f = this.friendshipRowItemMap[k.id];
if (!f) {
(f = cc.instantiate(this.friendshipRowItem)).parent = this.friendshipContentLayout;
f.active = !0;
this.friendshipRowItemMap[k.id] = f;
var b = f.getChildByName("bottom_bg_sp").getChildByName("role_layout");
f.roleSpMap = {};
for (var v in k.roleDatas) {
(N = cc.instantiate(this.friendshipRoleSp)).active = !0;
N.parent = b;
f.roleSpMap[k.roleDatas[v].classId] = N;
}
b.getComponent(cc.Layout).updateLayout();
}
f.active = k.type == _;
if (f.active) {
var S = f.getChildByName("top_bg_sp"), T = S.getChildByName("title_layout"), M = T.getChildByName("status_label").getComponent(cc.Label);
M.string = k.isCompleted ? n.t("(激活)") : n.t("(未激活)");
M._forceUpdateRenderData(!0);
M.node.color = k.isCompleted ? this.unLockColor : this.lockColor;
(w = T.getChildByName("name_label").getComponent(cc.Label)).string = k.name;
w._forceUpdateRenderData(!0);
T.getComponent(cc.Layout).updateLayout();
T.getComponent("i18nComponent").start();
var $ = S.getChildByName("base_label");
$.getChildByName("attr_sp").getComponent(cc.Sprite).spriteFrame = this["friendshipType" + k.type + "SpriteFrame"];
var I = $.getChildByName("attr_label").getComponent(cc.Label);
i.replaceLabel(I, [ k.base ]);
var C = S.getChildByName("star_label");
C.getChildByName("attr_sp").getComponent(cc.Sprite).spriteFrame = this["friendshipType" + k.type + "SpriteFrame"];
var P = C.getChildByName("attr_label").getComponent(cc.Label);
i.replaceLabel(P, [ k.starVal ]);
var D = l.player.friendshipUnlockMap;
for (var v in k.roleDatas) {
D[k.id] = D[k.id] || {};
var N, A = k.roleDatas[v], L = A.star > 0 && !!D[k.id][A.classId], E = A.star > 0 && !D[k.id][A.classId], B = (N = f.roleSpMap[A.classId]).getChildByName("above_sp");
r.setSpriteFrame(B.getComponent(cc.Sprite), h["friendship_" + A.classId + "_png"]);
var w, G = N.getChildByName("star_bg_sp"), R = G.getChildByName("star_layout");
G.active = L;
(w = N.getChildByName("name_bg_sp").getChildByName("name_label").getComponent(cc.Label)).string = A.name;
var H = N.getChildByName("unlock_bt");
H.active = E;
H.starLayout = R;
H.unlockSpine = N.getChildByName("unlock_spine");
H.unlockSpine.active = !1;
H.aboveSp = B;
H.data = {
friendShipId: k.id,
classId: A.classId
};
for (var x, K = {}, F = 1; F <= 5; F++) {
x = R.getChildByName("star_" + F + "_sp").getComponent(cc.Sprite);
F <= A.star ? x.spriteFrame = this.starSpriteFrame : x.spriteFrame = this.blackStarSpriteFrame;
K[F - 1] = x;
}
for (F = 0; F < A.moon; F++) K[F].spriteFrame = this.moonSpriteFrame;
for (F = 0; F < A.sun; F++) K[F].spriteFrame = this.sunSpriteFrame;
for (F = 0; F < A.shen; F++) K[F].spriteFrame = this.shenSpriteFrame;
r.setGray(B, L);
}
}
}
},
onCloseFriendship_: function() {
var e = this.rightLayout.getChildByName("all_bt");
this.onType_({
target: e
});
},
onFriendshipRule_: function() {
r.addRulePanel(p.TYPE.FRIENDSHIP);
},
onUnlockFriendship_: function(e) {
var a = e.target;
r.addLoading();
var t = this;
k.unlockFriendship(a.data.friendShipId, a.data.classId, function() {
t.updateFriendship_();
i.spineEffect(a.unlockSpine, "action_1");
m.playEffect(t.friendshipUnlockAudio);
});
}
});
b.genTeamItemData = function(a) {
var t = e("eqptScene"), n = l.player.bag, i = o.findEntityById(a.kindId), r = o.findSoulByClassId(i.classId), s = n.getItemCount(r.kindId) >= d.ROLE.FUNS.getUpgradeCost(a.star).soul && a.star < 5, c = t.genData(a), h = !0, u = !1;
for (var m in c.itemItems) {
c.itemItems[m].isShowEvolve && (u = !0);
c.itemItems[m].color != i.color + 1 && (h = !1);
}
var p = u || h || s;
return {
roleItem: g.genData(a),
roleName: i.kindName,
classId: i.classId,
itemItems: c.itemItems,
isShowEvolve: h,
isShowUpgradeStar: s,
isNeedMark: p,
isHave: !0,
_eqptScene: c,
_role: a
};
};
b.genNoHaveTeamItemDatas = function() {
var e = o.soul.all(), a = u.hideRoleClassIds || l.player.shop.hideRoleClassIds, n = [];
for (var i in e) if (!t.include(a, e[i].classId)) {
var r = o.findEntityById(e[i].roleId);
r && (t.find(l.player.team.roles, function(e) {
var a = o.findEntityById(e.kindId).classId;
return r.classId == a;
}) || n.push({
roleName: r.kindName,
classId: e[i].classId,
positionType: r.positionType,
_role: {
kindId: e[i].roleId
}
}));
}
for (var i in n) {
var s = n[i].classId, c = o.findSoulByClassId(s), h = l.player.bag.getItemCount(c.kindId), m = d.ROLE.FUNS.getComposeRoleCost(c.star);
n[i].soulCount = h;
n[i].costSoul = m.soul;
n[i].costCoin = m.coin;
n[i].isCanCompose = h >= m.soul;
n[i].roleItem = g.genData(n[i]._role);
}
return t.sortBy(n, function(e) {
return e.roleItem.group;
});
};
b.genFriendshipData = function() {
var e = l.player.team, a = e.friendshipAttr, n = u.hideRoleClassIds || l.player.shop.hideRoleClassIds, i = l.player.friendshipUnlockMap, r = o.friendship.all(), s = [], c = {};
for (var h in r) {
i[h] = i[h] || {};
var m = r[h];
if (!(t.intersection(n, m.requiredClassIds).length > 0)) {
var g = !0, p = !0, _ = !1, k = 0, f = [], y = [];
for (var b in m.requiredClassIds) {
var v = m.requiredClassIds[b], S = {
classId: v,
name: o.findEntityById(o.role.findOneBy("classId", v).kindId).kindName,
star: 0
}, T = e.getRoleByClassId(v);
S.star = T ? T.star : 0;
if (T && i[h][v]) {
var M = d.ROLE.FUNS.getStarKind(S.star);
S.moon = M.moon;
S.sun = M.sun;
S.shen = M.shen;
k += S.star - 1;
f.push(v);
} else p = !1;
y.push(S);
T && !i[h][v] && (_ = !0);
T || (g = !1);
}
g && _ && (c[m.type] = !0);
if (p) var $ = k * m.starGrowth;
var I = {
id: h,
name: m.name,
type: m.type,
isCompleted: p,
base: p ? m.base : 0,
starVal: p ? $ : 0,
includeClassIds: f,
roleDatas: y
};
s.push(I);
}
}
var C = t.include(t.values(c), !0);
return {
hp: a.hp,
atk: a.atk,
def: a.def,
mdef: a.mdef,
friendshipItems: s,
isNeedUnLockTypeMap: c,
isNeedMark: C
};
};
b.cacheTeamItemMap = {};
cc._RF.pop();
}, {
bagHandler: "bagHandler",
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
eqptScene: "eqptScene",
guide: "guide",
helper: "helper",
i18n: "i18n",
player: "player",
resource: "resource",
roleItem: "roleItem",
rulePanel: "rulePanel",
sceneManager: "sceneManager",
serverConfig: "serverConfig",
serverMain: "serverMain",
shipScene: "shipScene",
soundApi: "soundApi",
soundComponent: "soundComponent",
teamHandler: "teamHandler",
underscore: "underscore"
} ],
