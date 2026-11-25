spActivityPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "e13827QJMJIi6hJiguVeW83", "spActivityPanel");
var t = e("underscore"), n = e("underscore.string"), i = e("moment"), r = e("soundApi"), s = e("dataApi"), o = e("resource"), l = e("i18n"), c = e("player"), d = e("helper"), h = e("baseView"), u = (e("clientConfig"), 
e("serverConfig")), m = e("serverMain"), g = e("roleItem"), p = e("itemItem"), _ = e("topUpPanel"), k = e("pointScene"), f = e("rulePanel"), y = e("rankPanel"), b = e("playerItem"), v = e("rankHandler"), S = e("buildExt"), T = e("playerHandler"), M = u.ACTIVITY.CONSTS, $ = u.ACTIVITY.FUNS, I = cc.Class({
extends: cc.Component,
properties: {
aboveBgSp: cc.Node,
left3BgSp: cc.Node,
leftLoginBgSp: cc.Node,
btScrollview: cc.Node,
btItemsLayout: cc.Node,
btItem: cc.Node,
right1BgSp: cc.Node,
right2BgSp: cc.Node,
right3BgSp: cc.Node,
rightLoginBgSp: cc.Node,
taskActiveNode: cc.Node,
wishNode: cc.Node,
reachNode: cc.Node,
loginTopUpPanel: cc.Node,
taskActiveTopUpPanel: cc.Node,
dropViewNode: cc.Node,
dropViewItemsContent: cc.Node,
dropViewItem: cc.Node,
advancedSpine: cc.Node,
pointEffectNode: cc.Node,
pointItem: cc.Node,
tenPointItem: cc.Node,
tenPointItemLayout: cc.Node,
pointEffectBottomNode: cc.Node,
pointAgainPriceLabel: cc.Label,
pointAgainMoneySp: cc.Sprite,
pointAgainTimesLabel: cc.Label,
pointAgainBt: cc.Button,
pointYesBt: cc.Button,
skipBt: cc.Node
},
onLoad: function() {
this.btItem.active = !1;
this.selectBt = null;
this.timeTypeLabel = null;
this.timeLabel = null;
this.loginTopUpPanel.active = !1;
this.taskActiveNode.active = !1;
this.taskActiveTopUpPanel.active = !1;
this.dropViewNode.active = !1;
this.dropViewItem.active = !1;
this.advancedSpine.active = !1;
this.pointEffectNode.active = !1;
this.tenPointItem.active = !1;
I.isMark = !1;
},
update_: function(e, a) {
this.right1BgSp.active = !1;
this.right2BgSp.active = !1;
this.right3BgSp.active = !1;
this.rightLoginBgSp.active = !1;
this.left3BgSp.active = !1;
this.leftLoginBgSp.active = !1;
this.taskActiveNode.active = !1;
this.wishNode.active = !1;
this.reachNode.active = !1;
var n = I.genData(e, a);
this.data = n;
this.btItemMap = this.btItemMap || {};
h.preHideNodeMap(this.btItemMap);
for (var i in n.activitys) {
var s = this.btItemMap[i];
if (!s) {
(s = cc.instantiate(this.btItem)).parent = this.btItemsLayout;
s.idx = Number(i);
this.btItemMap[i] = s;
}
s.active = !0;
h.markHideNode(s);
var c = n.activitys[i];
s.data = c;
h.setMark(s, n.isMarkMap[c.name], {
x: 74,
y: 80
});
var d = s.getChildByName("title_label").getComponent(cc.Label), u = s.getChildByName("select_label").getComponent(cc.Label);
d.string = l.t(c.desc);
u.string = l.t(c.desc);
n.selectActivityName != c.name && n.selectActivityName != c.name.split("_")[0] || (this.selectBt = s);
}
h.hideNodeMap(this.btItemMap);
var m = t.values(this.btItemMap)[0];
this.selectBt ? this.onSelectActivity_({
target: this.selectBt
}) : m && this.scheduleOnce(function() {
this.onSelectActivity_({
target: m
});
}, .2);
r.playMusic(o.sound_music_sp_activity_mp3);
this.unschedule(this.tick_);
this.schedule(this.tick_, .2);
this.tick_(0);
},
onClose_: function() {
this.unschedule(this.tick_);
this.selectBt = null;
t.each(this.btItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
});
var e = this.btScrollview.getComponent(cc.ScrollView);
e.stopAutoScroll();
e.scrollToTop(0);
h.removePanel(this.node);
m.player.emit(c.EVENT.ATTRS, []);
r.playMusic(o.sound_music_home_mp3);
},
onSelectActivity_: function(e) {
var a = e.target, i = a.data, r = a == this.selectBt;
this.selectBt = a;
var c = this;
t.each(this.btItemsLayout.children, function(e) {
e.getComponent(cc.Button).interactable = !0;
e.getChildByName("select_label").active = !1;
});
a.getComponent(cc.Button).interactable = !1;
a.getChildByName("select_label").active = !0;
var _ = t.indexOf(this.btItemsLayout.children, a) - 0, k = (_ = _ < 5 ? 0 : _) / (this.btItemsLayout.children.length - 1);
this.btScrollview.getComponent(cc.ScrollView).scrollToPercentHorizontal(k, .5);
this.left3BgSp.active = !1;
this.leftLoginBgSp.active = !1;
this.right1BgSp.active = !1;
this.right2BgSp.active = !1;
this.right3BgSp.active = !1;
this.rightLoginBgSp.active = !1;
this.taskActiveNode.active = !1;
this.wishNode.active = !1;
this.reachNode.active = !1;
this.aboveBgSp.active = !0;
var f = null, y = null;
switch (i.type) {
case "login":
this.leftLoginBgSp.active = !0;
this.rightLoginBgSp.active = !0;
this.leftLoginBgSp.getChildByName("advanced_sp");
var b = i.advanced.reachMap[t.keys(i.advanced.rewards[0].needMap)[1]];
if ((te = this.leftLoginBgSp.getChildByName("armature_node")).characterNode && te.characterNode.getComponent("characterArmatureComponent").data.classId != i.spClassId) {
te.characterNode.destroy();
te.characterNode = null;
}
if (!te.characterNode) {
(ne = h.getCharacterNode(i.spClassId)).parent = te;
te.characterNode = ne;
}
this.leftLoginBgSp.getChildByName("sp_name_label").getComponent(cc.Label).string = this.data.spRoleName;
var T = (Ze = this.rightLoginBgSp.getChildByName("activity_scrollview")).getChildByName("view").getChildByName("content_layout"), C = Ze.activityItem || T.getChildByName("activity_item");
Ze.activityItem = C;
C.active = !1;
this.rightLoginBgSp.activityItemMap = this.rightLoginBgSp.activityItemMap || {};
h.preHideNodeMap(this.rightLoginBgSp.activityItemMap);
var P = 0;
for (var D in i.rewards) {
if (!(ia = this.rightLoginBgSp.activityItemMap[D])) {
(ia = cc.instantiate(C)).parent = T;
ia.idx = D;
this.rightLoginBgSp.activityItemMap[D] = ia;
}
ia.zIndex = Number(D);
ia.active = !0;
h.markHideNode(ia);
var N = {
reward: i.rewards[D],
advancedReward: i.advanced.rewards[D]
};
ia.data = N;
if (ra = ia.getChildByName("receive_bt")) {
ra.data = {
activityName: i.name,
rewardIdx: D
};
ra.active = N.reward.status == M.STATUS.CAN_RECEIVE;
if (N.advancedReward.status == M.STATUS.CAN_RECEIVE) {
ra.data.activityNames = [ i.name, i.advanced.name ];
ra.data.rewardIdxs = [ D, D ];
}
}
var A = ia.getChildByName("continue_receive_bt");
if (A) {
A.data = {
activityName: i.advanced.name,
rewardIdx: D
};
b || (A.data.needBuy = !0);
A.active = N.reward.status == M.STATUS.COMPLETE && N.advancedReward.status != M.STATUS.COMPLETE;
}
0 == P && (ra.active || A.active) && (P = 55.5 + 113 * Number(D));
(sa = ia.getChildByName("un_complete_sp")).active = N.reward.status == M.STATUS.UN_COMPLETE;
var L = ia.getChildByName("reward_layout").children, E = N.reward.dropList.concat(N.advancedReward.dropList);
for (var B in E) {
var w = E[B];
(ce = L[B]).active = !0;
ce.getComponentInChildren("itemItem").setShowPanel_(!0);
var G = p.genData({
kindId: w.entityId,
count: w.count,
extra: w.extra
}, !0);
ce.getComponentInChildren("itemItem").update_(G);
h.addItemEffect(w, ce);
(J = ce.getChildByName("lock_sp")) && (J.active = N.advancedReward.status == M.STATUS.UN_COMPLETE);
(ee = ce.getChildByName("receive_sp")).active = 0 == B ? N.reward.status == M.STATUS.COMPLETE : N.advancedReward.status == M.STATUS.COMPLETE;
}
var R = ia.getChildByName("title_label").getComponent(cc.Label);
d.replaceLabel(R, [ N.reward.needMap.loginDays ]);
}
h.hideNodeMap(this.rightLoginBgSp.activityItemMap);
this.leftLoginBgSp.getChildByName("unlock_bt").active = !b;
var H = (De = this.leftLoginBgSp.getChildByName("time_layout")).getChildByName("name_label").getComponent(cc.Label), x = De.getChildByName("value_label").getComponent(cc.Label);
this.timeTypeLabel = H;
this.timeLabel = x;
this.scheduleOnce(function() {
if (P) {
var e = Ze.getComponent(cc.ScrollView), a = P - 45;
e.scrollToOffset(cc.v2(0, a), .3);
}
}, .2);
break;

case "taskActive":
this.taskActiveNode.active = !0;
b = i.advanced.reachMap[t.keys(i.advanced.rewards[0].needMap)[1]];
var K = t.isUndefined(i.reachMap.taskActivePoint) ? "taskActivePoint2" : "taskActivePoint", F = i.reachMap[K], V = t.last(i.rewards).needMap[K], O = Math.floor(F / 100), U = this.taskActiveNode.getChildByName("top"), W = U.getChildByName("exp_bar");
W.getComponent(cc.ProgressBar).progress = F >= V ? 1 : F % 100 / 100;
var Y = W.getChildByName("pct_label").getComponent(cc.Label);
d.replaceLabel(Y, [ F, 100 * (O + 1) ]);
F >= V && (Y.string = l.t("已达到最高级"));
(je = U.getChildByName("level_label").getComponent(cc.Label)).string = O;
T = (Ze = this.taskActiveNode.getChildByName("activity_scrollview")).getChildByName("view").getChildByName("content_layout"), 
C = Ze.activityItem || T.getChildByName("activity_item");
Ze.activityItem = C;
C.active = !1;
this.taskActiveNode.activityItemMap = this.taskActiveNode.activityItemMap || {};
h.preHideNodeMap(this.taskActiveNode.activityItemMap);
var j = 0, q = {
activityNames: [],
rewardIdxs: []
};
for (var D in i.rewards) {
if (!(ia = this.taskActiveNode.activityItemMap[D])) {
(ia = cc.instantiate(C)).parent = T;
ia.idx = D;
this.taskActiveNode.activityItemMap[D] = ia;
}
ia.zIndex = Number(D);
ia.active = !0;
h.markHideNode(ia);
N = {
reward: i.rewards[D],
advancedReward: i.advanced.rewards[D]
};
ia.data = N;
if (N.reward.status == M.STATUS.CAN_RECEIVE) {
q.activityNames.push(i.name);
q.rewardIdxs.push(D);
}
if (N.advancedReward.status == M.STATUS.CAN_RECEIVE) {
q.activityNames.push(i.advanced.name);
q.rewardIdxs.push(D);
}
var X = ia.getChildByName("need_level_label").getComponent(cc.Label), z = N.reward.needMap;
X.string = Math.floor((z.taskActivePoint || z.taskActivePoint2) / 100);
0 == j && N.advancedReward.status == M.STATUS.COMPLETE && (j = 60 * Number(D) - 30);
L = ia.getChildByName("reward_top").children.concat(ia.getChildByName("reward_bottom").children), 
E = N.reward.dropList.concat(N.advancedReward.dropList);
for (var B in E) {
w = E[B];
(ce = L[B]).active = !0;
var J, Z = ce.getChildByName("role_item"), Q = ce.getChildByName("item_item");
Z && (Z.active = !1);
Q.active = !1;
if ((le = s.findEntityById(w.entityId)).type == u.CONSTS.ENTITY_TYPE.ROLE) {
Z.active = !0;
Z.getComponent("roleItem").update_(g.genData({
kindId: w.entityId,
star: w.extra.star
}));
} else {
Q.active = !0;
Q.getComponent("itemItem").setShowPanel_(!0);
G = p.genData({
kindId: w.entityId,
count: w.count,
extra: w.extra
}, !0);
Q.getComponent("itemItem").update_(G);
}
(J = ce.getChildByName("lock_sp")) && (J.active = !b);
var ee = ce.getChildByName("receive_sp");
if (0 == B) {
ee.active = N.reward.status == M.STATUS.COMPLETE;
h.addItemEffect(null, ce, N.reward.status == M.STATUS.CAN_RECEIVE);
} else {
ee.active = N.advancedReward.status == M.STATUS.COMPLETE;
h.addItemEffect(null, ce, N.advancedReward.status == M.STATUS.CAN_RECEIVE);
}
}
}
h.hideNodeMap(this.taskActiveNode.activityItemMap);
this.taskActiveNode.getChildByName("unlock_bt").active = !b;
(ra = this.taskActiveNode.getChildByName("receive_bt")).data = q;
h.setMark(ra, q.activityNames.length > 0);
var ae = this.taskActiveNode.getChildByName("fill_active_bt");
ae.active = b && (i.end_time - Date.now()) / u.CONSTS.A_DAY <= 2 && F < V;
ae.data = {
activityName: i.name,
curActive: F,
maxActive: V
};
H = (De = this.taskActiveNode.getChildByName("time_layout")).getChildByName("name_label").getComponent(cc.Label), 
x = De.getChildByName("value_label").getComponent(cc.Label);
this.timeTypeLabel = H;
this.timeLabel = x;
this.scheduleOnce(function() {
if (j) {
var e = Ze.getComponent(cc.ScrollView), a = j - 45;
e.scrollToOffset(cc.v2(a, 0), .3);
}
}, .2);
break;

case "spWish":
this.aboveBgSp.active = !1;
this.wishNode.active = !0;
var te;
if ((te = this.wishNode.getChildByName("role_bg_sp").getChildByName("armature_node")).characterNode && te.characterNode.getComponent("characterArmatureComponent").data.classId != i.spClassId) {
te.characterNode.destroy();
te.characterNode = null;
}
if (!te.characterNode) {
var ne;
(ne = h.getCharacterNode(i.spClassId)).parent = te;
te.characterNode = ne;
}
var ie = u.DROP.FUNS.getRandomDropListByDesc(i.rdDropListDesc), re = 0;
for (var D in ie) re += ie[D].weight;
var se = this.wishNode.getChildByName("item_nodes"), oe = [];
for (var D in ie) {
w = ie[D];
var le = s.findEntityById(w.entityId), ce = se.getChildByName("item_" + (Number(D) + 1));
if (le.type == u.CONSTS.ENTITY_TYPE.ROLE) {
(_a = g.genData({
kindId: w.entityId,
star: w.extra.star
})).rate = (w.weight / re * 100).toFixed(2);
ce && ce.getComponentInChildren("roleItem").update_(_a);
oe.push(_a);
} else {
(G = p.genData({
kindId: ie[D].entityId,
count: ie[D].count,
extra: ie[D].extra
}, !0)).rate = (w.weight / re * 100).toFixed(2);
ce && ce.getComponentInChildren("itemItem").update_(G);
ce && ce.getComponentInChildren("itemItem").setShowPanel_(!0);
oe.push(G);
}
}
this.wishNode.getChildByName("drop_view_bt").data = {
itemItems: oe
};
this.wishNode.getChildByName("sp_name_label").getComponent(cc.Label).string = this.data.spRoleName;
H = (De = this.wishNode.getChildByName("time_layout")).getChildByName("name_label").getComponent(cc.Label), 
x = De.getChildByName("value_label").getComponent(cc.Label);
this.timeTypeLabel = H;
this.timeLabel = x;
var de = this.wishNode.getChildByName("bottom_node"), he = de.getChildByName("luck_bar");
he.getComponent(cc.ProgressBar).progress = i.reachMap.wishTimes / i.maxLuck;
var ue = he.getChildByName("luck_pct_label").getComponent(cc.Label);
d.replaceLabel(ue, [ i.reachMap.wishTimes, i.maxLuck ]);
var me = this.wishNode.getChildByName("one_point"), ge = me.getChildByName("price_label").getComponent(cc.Label), pe = me.getChildByName("money_sp"), _e = this.wishNode.getChildByName("layout").getChildByName("ten_point"), ke = _e.getChildByName("price_label").getComponent(cc.Label), fe = _e.getChildByName("money_sp"), ye = s.entity.findOneByExtra("wishSpClassId", i.spClassId), be = m.player.bag.getItemCount(ye.kindId), ve = m.player.gem, Se = function(e) {
var a = e.getChildByName("item_item");
a.active = !1;
a.getComponent("itemItem").update_(p.genData({
kindId: ye.kindId,
count: 1
}));
a.getComponent("itemItem").setShowPanel_(!0);
a.opacity = 0;
e.itemItem = a;
};
Se && Se(pe);
Se && Se(fe);
this.wishData = {
activityName: i.name,
costTicketId: ye.kindId,
costGem: i.costGem
};
if (be > 0) {
pe.itemItem.active = !0;
d.replaceLabel(ge, [ be, 1 ]);
h.setSpriteFrame(pe.getComponent(cc.Sprite), o["misc_money_" + ye.kindId + "_png"]);
} else {
d.replaceLabel(ge, [ ve, i.costGem ]);
h.setSpriteFrame(pe.getComponent(cc.Sprite), o["misc_money_" + u.CONSTS.ENTITY_ID.GEM + "_png"]);
}
if (be >= 10) {
fe.itemItem.active = !0;
d.replaceLabel(ke, [ be, 10 ]);
h.setSpriteFrame(fe.getComponent(cc.Sprite), o["misc_money_" + ye.kindId + "_png"]);
} else {
d.replaceLabel(ke, [ ve, 10 * i.costGem ]);
h.setSpriteFrame(fe.getComponent(cc.Sprite), o["misc_money_" + u.CONSTS.ENTITY_ID.GEM + "_png"]);
}
var Te = de.getChildByName("luck_hint_richText").getComponent(cc.RichText);
d.replaceLabel(Te, [ i.maxLuck - i.reachMap.wishTimes, this.data.spRoleName ]);
var Me = this.wishNode.getChildByName("gem_wish_times").getChildByName("times_label").getComponent(cc.Label);
d.replaceLabel(Me, [ i.reachMap.spWishGemTimes, i.costGemMaxTiems ]);
var $e = this.wishNode.getChildByName("layout").getChildByName("hundred_point");
$e.active = i.reachMap.spWishGemTimes >= i.costGemMaxTiems && be >= 100 && S.scorePointShowHundredBt;
var Ie = $e.getChildByName("money_sp"), Ce = $e.getChildByName("price_label").getComponent(cc.Label);
Se && Se(Ie);
if (be >= 100) {
Ie.itemItem.active = !0;
d.replaceLabel(Ce, [ be, 100 ]);
h.setSpriteFrame(Ie.getComponent(cc.Sprite), o["misc_money_" + ye.kindId + "_png"]);
} else {
d.replaceLabel(Ce, [ ve, 100 * i.costGem ]);
h.setSpriteFrame(Ie.getComponent(cc.Sprite), o["misc_money_" + u.CONSTS.ENTITY_ID.GEM + "_png"]);
}
var Pe = m.player.id;
this.skipMove = storage.getItem("sp_point_video_2" + Pe) || !1;
this.skipBt.getChildByName("lock_sp").active = this.skipMove;
if (S.isVideoCloseAll) {
this.skipBt.active = !1;
this.skipMove = !0;
}
break;

default:
var De, Ne, Ae;
if (n.include(i.name, "Rank")) {
f = this.left3BgSp;
var Le = (y = this.right2BgSp).getChildByName("activity_scrollview").getChildByName("view").getChildByName("content_layout").getChildByName("top_bg_sp");
De = Le.getChildByName("time_layout");
Ne = Le.getChildByName("desc_layout");
Ae = Le.getChildByName("reach_layout");
} else if (i.rewards[0].buyMaxTimes) De = (y = this.right3BgSp).getChildByName("time_layout"); else {
De = (y = this.right1BgSp).getChildByName("time_layout");
Ae = this.reachNode;
}
H = De.getChildByName("name_label").getComponent(cc.Label), x = De.getChildByName("value_label").getComponent(cc.Label);
this.timeTypeLabel = H;
this.timeLabel = x;
Ne && (Ne.getChildByName("value_label").getComponent(cc.Label).string = l.t(i.content));
if (Ae) {
var Ee = Ae;
Ee.active = !1;
if (i.reachMap) {
var Be = {};
Be[M.NEED_KEY.TOP_UP_MONEY] = l.t("当前已充值金额");
Be.activityPointTimes = l.t("当前招募次数");
K = null;
for (var we in i.reachMap) if (Be[we]) {
K = we;
break;
}
if (K = i.showNeedKey || K) {
Ee.active = !0;
var Ge = i.reachMap[K];
if (We = Ee.getChildByName("name_label")) {
d.replaceLabel(We.getComponent(cc.Label), [ Be[K] ]);
We._forceUpdateRenderData(!0);
var Re = Ee.getChildByName("value_label").getComponent(cc.Label);
Re.string = Ge;
Re._forceUpdateRenderData(!0);
} else {
var He = Ee.getComponentInChildren(cc.RichText);
d.replaceLabel(He, [ Be[K], Ge ]);
}
}
}
}
}
f && (f.active = !0);
if (f == this.left3BgSp) {
var xe = f.getChildByName("rank_scrollview"), Ke = xe.getChildByName("view").getChildByName("content_layout"), Fe = xe.rankItem || Ke.getChildByName("rank_item");
xe.rankItem = Fe;
Fe.active = !1;
var Ve = this.data.rankData;
if (Ve && r) {
f.rankItemMap = f.rankItemMap || {};
h.preHideNodeMap(f.rankItemMap);
for (var D in Ve.rankItems) {
var Oe = Ve.rankItems[D], Ue = f.rankItemMap[D];
if (!Ue) {
(Ue = cc.instantiate(Fe)).parent = Ke;
f.rankItemMap[D] = Ue;
}
Ue.active = !0;
h.markHideNode(Ue);
Ue.data = {
defenderId: Oe.playerId
};
var We, Ye = Ue.getChildByName("player_item_layout");
Ye.getChildByName("player_item").getComponent("playerItem").update_(Oe.playerItem);
(We = Ye.getChildByName("name_label").getComponent(cc.Label)).string = Oe.playerName;
var je = Ye.getChildByName("level_label");
d.replaceLabel(je.getComponent(cc.Label), [ Oe.playerLevel ]);
Ye.getChildByName("server_label").getComponent(cc.Label).string = l.t("$1区", [ Oe.serverId ]);
Ue.getChildByName("rank_num_label").getComponent(cc.Label).string = Oe.rank;
var qe = Ue.getChildByName("reach_layout");
qe.getChildByName("reach_name_label").getComponent(cc.Label).string = Ve.reachDesc;
var Xe = qe.getChildByName("reach_value_label").getComponent(cc.Label);
qe.getChildByName("reach_value_label").getComponent(cc.Label).string = Oe.value;
Xe.string = i.reachShow ? l.t(i.reachDesc, [ Oe.value ]) : Oe.value;
}
h.hideNodeMap(f.rankItemMap);
Ae.active = !0;
var ze = Ae.getChildByName("reach_name_label").getComponent(cc.Label), Je = (Xe = Ae.getChildByName("reach_value_label").getComponent(cc.Label), 
Ae.getChildByName("rank_value_label").getComponent(cc.Label));
ze.string = Ve.reachDesc;
Xe.string = Ve.myValue;
Je.string = Ve.myRank;
}
}
if (y) {
y.active = !0;
var Ze, Qe = (Ze = y.getChildByName("activity_scrollview")).getChildByName("view").getChildByName("content_layout");
if (Qe) {
var ea = (C = Ze.activityItem || Qe.getChildByName("activity_item")).getChildByName("reward_layout"), aa = ea.getChildByName("role_item_node"), ta = ea.getChildByName("item_item");
Ze.activityItem = C;
C.active = !1;
aa.active = !1;
ta.active = !1;
y.activityItemMap = y.activityItemMap || {};
h.preHideNodeMap(y.activityItemMap);
var na = 0;
for (var D in i.rewards) {
var ia, ra, sa;
if (!(ia = y.activityItemMap[D])) {
(ia = cc.instantiate(C)).parent = Qe;
ia.idx = D;
y.activityItemMap[D] = ia;
}
ia.zIndex = Number(D);
ia.active = !0;
h.markHideNode(ia);
N = i.rewards[D];
ia.data = N;
ia.opacity = N.status == M.STATUS.COMPLETE ? 76.5 : 255;
ia.zIndex = N.status == M.STATUS.COMPLETE ? 100 : ia.zIndex;
N.status == M.STATUS.CAN_RECEIVE && (ia.zIndex = Number(D) - 100);
(R = ia.getChildByName("title_label")) && (R.getComponent(cc.Label).string = l.t(N.desc));
if (y == this.right3BgSp) {
na = -150;
var oa = t.keys(N.needMap)[0].split("_")[1], la = oa ? m.player.extra.goodsList[oa] : null;
ia.getChildByName("price_label").getComponent(cc.Label).string = la ? l.t(la.show, [ la.price ]) : l.t("免费");
var ca = ia.getChildByName("buy_bt").getComponentInChildren(cc.Label);
la && h.getBtDiscountNode(ca);
var da = ia.getChildByName("buy_bt");
da.active = !1;
if (la) {
da.data = {
id: la.id,
price: la.price,
priceRate: la.priceRate || 1,
name: l.t(la.name, [ la.gem || la.price ]),
gem: la.gem
};
da.active = N.status == M.STATUS.UN_COMPLETE;
}
} else {
var ha = ia.getChildByName("need_label");
ha && d.replaceLabel(ha.getComponent(cc.Label), [ t.values(N.needMap)[0] ]);
}
if (ra = ia.getChildByName("receive_bt")) {
ra.data = {
activityName: i.selectActivityName || i.name,
rewardIdx: D
};
ra.active = N.status == M.STATUS.CAN_RECEIVE;
}
ia.getChildByName("complete_sp").active = N.status == M.STATUS.COMPLETE;
(sa = ia.getChildByName("un_complete_sp")) && (sa.active = N.status == M.STATUS.UN_COMPLETE);
var ua = ia.getChildByName("reward_layout");
ia.itemItemMap = ia.itemItemMap || {};
h.preHideNodeMap(ia.itemItemMap);
ia.roleItemNodeMap = ia.roleItemNodeMap || {};
h.preHideNodeMap(ia.roleItemNodeMap);
var ma = 0, ga = 0;
for (var B in i.rewards[D].dropList) {
w = i.rewards[D].dropList[B];
if ((le = s.findEntityById(w.entityId)).type == u.CONSTS.ENTITY_TYPE.ROLE) {
var pa = ia.roleItemNodeMap[ma];
if (!pa) {
(pa = cc.instantiate(aa)).parent = ua;
pa.idx = ma;
ia.roleItemNodeMap[ma] = pa;
}
pa.active = !0;
h.markHideNode(pa);
var _a = g.genData({
kindId: w.entityId,
star: w.extra.star
});
pa.getChildByName("role_item").getComponent("roleItem").update_(_a);
h.addItemEffect(w, pa);
ma++;
} else {
if (!(Q = ia.itemItemMap[ga])) {
(Q = cc.instantiate(ta)).parent = ua;
Q.idx = ga;
ia.itemItemMap[ga] = Q;
}
Q.active = !0;
h.markHideNode(Q);
Q.getComponent("itemItem").setShowPanel_(!0);
G = p.genData({
kindId: w.entityId,
count: w.count,
extra: w.extra
}, !0);
Q.getComponent("itemItem").update_(G);
h.addItemEffect(w, Q);
ga++;
}
}
h.hideNodeMap(ia.itemItemMap);
h.hideNodeMap(ia.roleItemNodeMap);
d.updateLayout(ua);
var ka = (ia.width + na) / (ua.width + 25);
ka = ka > .7 ? .7 : ka;
ua.scale = ka;
}
h.hideNodeMap(y.activityItemMap);
Qe.sortAllChildren();
}
}
if (Ze) {
if (!r) {
d.scrollviewFadeIn(Ze);
var fa = Ze.getComponent(cc.ScrollView);
fa.stopAutoScroll();
fa.scrollToTop(0);
}
Ze.getComponent("listViewComponent").delayUpdate_(.2);
}
if (!r || this.data.selectActivityName) {
c = this;
this.scheduleOnce(function() {
switch (i.name.split("_")[0]) {
case "spWishRankAllServer":
var e = $.getRankRegionName(i, m.player.serverId);
v.allServerTop(0, "sp_wish_times" + (e || ""), 0, 9, function(e) {
var a = I.genRankData(e._temp.myRank, e._temp.myValue, e._temp.list, l.t("当前许愿次数:"));
c.update_(null, a);
});
}
}, .2);
}
this.tick_(0);
},
onActivityBtItem_: function(e, a) {
var n = e ? e.target.data : a, i = t.findWhere(this.data.activitys, {
name: "packActivity"
});
this.selectPackActivityItemName = n.name;
var r = this.btItemMap[t.indexOf(this.data.activitys, i)];
this.onSelectActivity_({
target: r
});
},
onSwitch_: function(e, a) {
var t = this.selectBt.idx + Number(a);
this.onSwitchToActivity_({
target: this.btItemMap[t]
});
var n = this.btItemsLayout.children[0].height, i = this.btScrollview.getComponent(cc.ScrollView).content.getComponent(cc.Layout).spacingY, r = Number(a) > 0 ? 1 : 0, s = t <= 1 ? r : t, o = s * n + s * i;
this.btScrollview.getComponent(cc.ScrollView).scrollToOffset(cc.v2(this.btItemsLayout.x, o), 1);
},
onReceive_: function(e, a) {
var n = e ? e.target.data : a;
if (n.needBuy) this.onLoginUnlock_(); else {
var i = this;
h.addLoading();
var r = n.activityNames ? n.activityNames : [ n.activityName ], s = n.rewardIdxs ? n.rewardIdxs : [ n.rewardIdx ];
T.receiveActivityAward(r, s, function(e) {
h.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var n in a) h.addPointRoleEffectNode(a[n]);
}
i.update_();
});
}
},
onBuy_: _.prototype.onGoodsItem_,
onSwitchToActivity_: function(e) {
var a = e.target.data, n = this.btItemMap[t.indexOf(this.data.activitys, a.activity || a)];
this.onSelectActivity_({
target: n
});
},
onArmature_: function(e) {
e.target.characterNode.getComponent("characterArmatureComponent").playRandom_();
},
onLoginUnlock_: function() {
this.loginTopUpPanel.getComponent("taskActiveTopUpPanel").show_(this.selectBt.data.name, this.selectBt.data.advanced.name, !0);
},
onTaskActiveUnlock_: function() {
this.taskActiveTopUpPanel.getComponent("taskActiveTopUpPanel").show_(this.selectBt.data.name, this.selectBt.data.advanced.name, !0);
},
onTaskActiveBuyActive_: function(e) {
var a = e.target.data, t = S.spTaskActiveOneCostGem || 5, n = $.getBuyReachValCostGem(a.maxActive - a.curActive, t), i = l.t("是否花费$1钻石补足活跃度?", [ n ]), r = this;
h.addMessageBox(i, function() {
h.addLoading();
T.fillTaskActive(a.activityName, t, function() {
r.update_();
});
});
},
onTaskActiveReceive_: function(e) {
var a = e.target.data;
if (0 != a.activityNames.length) {
var n = this;
h.addLoading();
var i = a.activityNames, r = a.rewardIdxs;
T.receiveActivityAward(i, r, function(e) {
h.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var i in a) h.addPointRoleEffectNode(a[i]);
}
n.update_();
});
} else h.addHintPanel(l.t("没有可领取的奖励"));
},
onRankViewTeam_: y.prototype.onRankItem_,
tick_: function() {
if (this.selectBt) {
var e, a = this.timeTypeLabel, t = this.timeLabel, n = this.selectBt.data, r = n.start_time, s = n.end_time + 0, o = l.t("结束时间:");
if (-1 == n.start_time) e = l.t("永久"); else if (m.tTime(r) < Date._now()) if (m.tTime(s) > Date._now()) {
var c = m.tTime(s) - Date._now();
c = c < 0 ? 0 : c;
var h = i.duration(c), u = Math.floor(h.asDays());
e = d.formatDuration(h.hours(), h.minutes(), h.seconds());
u > 0 && (e = l.t("$1天$2", [ u, e ]));
} else e = l.t("已结束"); else {
o = l.t("开启时间:");
e = i(m.tTime(s)).from(Date._now());
}
a && (a.string = o);
t && (t.string = e);
}
},
onWishRule_: function() {
h.addRulePanel(f.TYPE.SP_ACTIVITY);
},
onWishDropView_: function(e) {
this.dropViewNode.active = !0;
var a = e.target.data.itemItems;
this.dropViewItemMap = this.dropViewItemMap || {};
h.preHideNodeMap(this.dropViewItemMap);
for (var t in a) {
var n = this.dropViewItemMap[t];
if (!n) {
(n = cc.instantiate(this.dropViewItem)).parent = this.dropViewItemsContent;
n.idx = t;
this.dropViewItemMap[t] = n;
}
n.active = !0;
h.markHideNode(n);
var i = n.getChildByName("role_node"), r = n.getChildByName("item_node");
i.active = !1;
r.active = !1;
if (a[t]._data.type == u.CONSTS.ENTITY_TYPE.ROLE) {
i.active = !0;
i.getComponentInChildren("roleItem").update_(a[t]);
} else {
r.active = !0;
r.getComponentInChildren("itemItem").update_(a[t]);
r.getComponentInChildren("itemItem").setShowPanel_(!0);
}
n.getChildByName("name_label").getComponent(cc.Label).string = a[t]._data.kindName;
var s = n.getChildByName("rate_label").getComponent(cc.Label);
d.replaceLabel(s, [ a[t].rate ]);
}
h.hideNodeMap(this.dropViewItemMap);
},
onCloseWishDropView_: function() {
this.dropViewNode.active = !1;
},
onWish_: function(e, a) {
this.selectWishType = a;
var t, n, i, s, l, c = Number(a);
switch (c) {
case C.ONE:
t = T.spWishOne;
n = 1;
i = 1;
s = this.advancedSpine;
l = "action_2_";
break;

case C.TEN:
t = T.spWishTen;
n = 10;
i = 10;
s = this.advancedSpine;
l = "action_2_";
break;

case C.HUNDRED:
t = T.spWishHundred;
s = this.advancedSpine;
l = "action_2_";
}
s.active = !1;
var g = this;
h.addLoading();
t.call(T, this.wishData.activityName, function(e) {
var a = g.skipMove ? 0 : 2.7;
if (!g.skipMove) {
s.active = !0;
r.playEffect(o.sound_effect_point_mp3);
s.getComponent(sp.Skeleton).setAnimation(0, l + "2", !1);
}
h.addLoading(null, !1, !0);
cc.tween(g.node).delay(a).call(function() {
s.getComponent(sp.Skeleton).setAnimation(0, l + "1", !0);
h.removeLoading();
console.log("用户进行抽奖：", e);
var a = e.team ? e.team.roles : [], t = e._temp.dropList, p = {};
for (var _ in a) p[a[_].kindId] = a[_];
var f = k.genPointEffectData(c, t, p), y = function() {
g.pointEffectNode.active = !0;
g.pointItem.active = !0;
var e = m.player.bag.getItemCount(g.wishData.costTicketId) >= n;
1 == n ? g.pointAgainPriceLabel.string = e ? n : g.wishData.costGem : 10 == n && (g.pointAgainPriceLabel.string = e ? n : 10 * g.wishData.costGem);
h.setSpriteFrame(g.pointAgainMoneySp, o["misc_money_" + (e ? g.wishData.costTicketId : u.CONSTS.ENTITY_ID.GEM) + "_png"]);
d.replaceLabel(g.pointAgainTimesLabel, [ i ]);
g.tenPointItemLayout.active = !0;
var a = [];
if (1 == f.entityItems.length) {
g.pointItem.data = f.entityItems[0];
a.push(g.pointItem);
g.tenPointItemLayout.active = !1;
} else {
g.pointItemMap = g.pointItemMap || {};
h.preHideNodeMap(g.pointItemMap);
for (var t in f.entityItems) {
var s = g.pointItemMap[t];
if (!s) {
(s = cc.instantiate(g.tenPointItem)).parent = g.tenPointItemLayout;
s.idx = t;
g.pointItemMap[t] = s;
}
s.active = !0;
h.markHideNode(s);
s.data = f.entityItems[t];
a.push(s);
}
h.hideNodeMap(g.pointItemMap);
g.pointItem.active = !1;
}
var l = g.skipMove ? .05 : .3;
for (t = 0; t < a.length; t++) {
var c = a[t].getChildByName("item_item"), p = a[t].getChildByName("role_item_node"), _ = !!f.roleMap[a[t].data.kindId];
c.active = !_;
p.active = _;
var k = cc.tween().hide().delay(0 + l * t).show().call(function() {
var e = this.data.kindId, a = f.roleMap[e];
if (a = this.data.role || a) {
d.pauseNode(g.pointEffectNode);
h.addPointRoleEffectNode(a, g.pointEffectNode, "spWish");
}
r.playEffect(o.sound_effect_lottery_one_mp3);
}.bind({
data: a[t].data
}));
if (_) {
p.getChildByName("role_item").getComponent("roleItem").update_(a[t].data);
cc.tween(p).then(k).start();
} else {
c.getComponent("itemItem").update_(a[t].data);
c.getComponent("itemItem").setShowPanel_(!0);
cc.tween(c).then(k).start();
}
var y = a[t].getChildByName("name_Label");
y.getComponent(cc.Label).string = a[t].data._data.kindName;
y.opacity = 0;
cc.tween(y).delay(0 + a.length * l).to(.3, {
opacity: 255
}).start();
var b = a[t].getChildByName("light_sp");
if (!g.skipMove) {
b.active = !0;
b.scale = 5;
b.opacity = 255;
cc.tween(b).hide().delay(0 + l * t).show().to(.1, {
scale: 1
}).to(.2, {
opacity: 0
}).start();
}
}
g.pointAgainBt.interactable = !1;
g.pointYesBt.interactable = !1;
g.pointEffectBottomNode.opacity = 0;
cc.tween(g.pointEffectBottomNode).delay(0 + a.length * l).to(.3, {
opacity: 255
}).call(function() {
g.pointAgainBt.interactable = !0;
g.pointYesBt.interactable = !0;
}).start();
}, b = function() {
var e = [];
for (var a in f.entityItems) e.push(f.entityItems[a]);
for (a = 0; a < e.length; a++) {
var t = cc.tween().hide().delay(0).show().call(function() {
var e = this.data.kindId, a = f.roleMap[e];
if (a = this.data.role || a) {
d.pauseNode(g.pointEffectNode);
h.addPointRoleEffectNode(a, g.pointEffectNode, "spWish");
}
r.playEffect(o.sound_effect_lottery_one_mp3);
g.advancedSpine.active = !1;
}.bind({
data: e[a]
}));
cc.tween(g.pointEffectNode).then(t).start();
}
var n = {};
e.forEach(function(e) {
var a = e.kindId, t = e.count;
n[a] = (n[a] || 0) + t;
});
h.addRewardEffectPanel(n);
};
c != C.HUNDRED ? y && y() : b && b();
}).start();
g.update_(g.data.selectActivityName);
});
},
onAgainPoint_: function() {
this.pointEffectNode.active = !1;
this.onWish_(null, this.selectWishType);
},
onClosePointEffect_: function() {
this.pointEffectNode.active = !1;
this.advancedSpine.active = !1;
},
onViewRole_: function() {
h.addViewRolePanel(this.data.spClassId);
},
onSkip_: function(e) {
this.skipMove = !this.skipMove;
e.target.getChildByName("lock_sp").active = this.skipMove;
var a = m.player.id, t = this.skipMove ? 1 : 0;
storage.setItem("sp_point_video_2" + a, t);
}
}), C = {
ONE: 1,
TEN: 2,
HUNDRED: 3
};
I.genData = function(a, n) {
a = a || null;
var i = m.player, r = (i.extra.goodsList, t.values(i.activity.map)), o = i.activity.spWishRankAllServer;
r = t.without(r, null);
o && r.push(o);
t.each(r, function(e) {
e.rewards && t.each(e.rewards, function(a) {
a.dropList = a.dropListDesc ? u.DROP.FUNS.getDropListByDesc(a.dropListDesc) : a.dropList;
a.rdDropList = a.rdDropListDesc ? u.DROP.FUNS.getRandomDropListByDesc(a.rdDropListDesc) : a.rdDropList;
var n = a.buyMaxTimes;
if (a.buyMaxTimesBetween) {
n = u.FUNS.getValueByBetween(a.needVipBetween, a.buyMaxTimesBetween, i.vip.level);
a.buyMaxTimes = n;
}
if (n) {
var r = n - (a.buyTimes || 0);
a.desc = l.t("限购$1次", [ r ]);
a.isHideBuyTimes && (a.desc = "");
0 == r && (a.status = M.STATUS.COMPLETE);
} else if (a.desc && !e.isTopUp) {
var s = [ (d = t.values(a.needMap)[0]) * (h = e.i18nValRatios ? e.i18nValRatios[0] : 1) ];
if (e.i18nValKeys) {
var o = e.i18nValAdd || 0;
s = [];
for (var c in e.i18nValKeys) {
var d = a.needMap[e.i18nValKeys[c]] + o, h = e.i18nValRatios ? e.i18nValRatios[c] : 1;
s.push(d * h);
}
}
a.desc = a.desci18n || l.t(a.desc, s);
a.desci18n = a.desc;
}
if (t.include([ "spWishRankAllServer" ], e.name.split("_")[0])) {
a.rankBegin == a.rankEnd ? a.desc = l.t("第$1名", [ a.rankBegin ]) : a.desc = l.t("第$1-$2名", [ a.rankBegin, a.rankEnd ]);
if (a.limit > 0) {
var m = l.t(e.limitDesc, [ a.limit ]);
a.desc += m;
}
}
});
});
if (0 == (r = t.filter(r, function(e) {
return u.ACTIVITY.FUNS.checkOpen(e, i.serverId) && (!e.isSuccess || e.isKeepShow) && e.spClassId || "spWishRankAllServer" == e.name.split("_")[0];
})).length) return null;
var c = t.findWhere(r, {
type: "login"
}), d = t.findWhere(r, {
type: "loginAdvanced"
});
if (c && d) {
c.advanced = d;
r = t.without(r, d);
}
var h = t.findWhere(r, {
type: "taskActive"
}), g = t.findWhere(r, {
type: "taskActiveAdvanced"
});
if (h && g) {
h.advanced = g;
r = t.without(r, g);
}
var p = {}, _ = e("homeScene").instance;
_ && _.activityPanel.isPanel || (I.priorityMap = {});
var k = !1;
for (var f in r) {
var y = r[f];
y._priority = y._priority || y.priority;
y.priority = y._priority;
if (y.rewards) for (var b in y.rewards) if (y.rewards[b].status == M.STATUS.CAN_RECEIVE) {
if (y.rewardIdxs && !t.include(y.rewardIdxs, Number(b))) continue;
p[y.name] = !0;
k = !0;
}
if (y.reward && y.reward.status == M.STATUS.CAN_RECEIVE) {
p[y.name] = !0;
y.priority = 1;
}
var v = I.priorityMap[y.name];
y.priority = v || y.priority;
I.priorityMap[y.name] = y.priority;
}
r = t.sortBy(r, "priority");
k = (I.isMark || k) && r.length > 0;
var S = r[0].spClassId, T = s.role.findOneBy("classId", S);
return {
selectActivityName: a,
activitys: r,
spClassId: S,
spRoleName: (T = s.findEntityById(T.kindId)).kindName,
isMarkMap: p,
isNeedMark: k,
rankData: n
};
};
I.genRankData = function(e, a, t, n) {
var i = [];
for (var r in t) {
t[r].value = t[r].value >= 1e5 ? Math.ceil(t[r].value / 1e3) + "K" : t[r].value;
var s = b.genData(t[r].playerPhotoInfo), o = {
serverId: t[r].serverId || 0,
playerId: t[r].playerId,
playerName: t[r].playerName,
playerLevel: t[r].playerLevel,
playerItem: s,
rank: t[r].rank,
value: t[r].value
};
i.push(o);
}
if (!a) {
e = 0;
a = 0;
}
return {
myRank: e,
myValue: a = a >= 1e5 ? Math.ceil(a / 1e3) + "K" : a,
rankItems: i,
reachDesc: n
};
};
I.priorityMap = {};
I.isMark = !0;
I.isNeedPop = !0;
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerHandler: "playerHandler",
playerItem: "playerItem",
pointScene: "pointScene",
rankHandler: "rankHandler",
rankPanel: "rankPanel",
resource: "resource",
roleItem: "roleItem",
rulePanel: "rulePanel",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
topUpPanel: "topUpPanel",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
