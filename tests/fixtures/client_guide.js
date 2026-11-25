guide: [ function(e, a) {
"use strict";
cc._RF.push(a, "3ccc57hKQRNcp7pKvbQObWB", "guide");
var t = e("underscore"), n = e("async"), i = e("i18n"), r = e("buildExt"), s = e("battle.consts"), o = e("serverMain"), l = e("clientConfig"), c = e("serverConfig"), d = e("baseView"), h = e("guideNode"), u = e("sceneManager"), m = {
firstReName: {
test: function() {
return o.player.userName == o.player.name;
},
guide: function() {
d.addGuideNode();
n.waterfall([ function(e) {
sdkApi.emitData(sdkApi.EMIT_TYPE.GUIDE_BEGIN);
h.instance.setSide_(h.SIDE.LEFT, -100);
h.instance.say_(i.t("悟空你终于醒过来啦！"));
var a = d.getNodeByTag(d.TAG.POINT_ROLE_EFFECT_NODE).getComponent("pointRoleEffectNode"), t = a.yesBt;
h.instance.setTouchableTarget_(t, function() {
a.onYes_();
e();
});
}, function(e) {
d.addGuideNode();
h.instance.hideTouch_();
h.instance.setSide_(h.SIDE.LEFT, -100, -150);
h.instance.say_(i.t("欢迎来到游戏，请先为你的战队取个名字吧！"));
m.firstReName.guideNext1 = e;
} ], function() {
m.firstReName.run = !1;
m.run([ m.point2Role ]);
});
}
},
point2Role: {
test: function() {
return o.player.team.getAllClassIds().length < 3;
},
guide: function() {
var a = e("homeScene"), t = e("pointScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("快去跟同伴会合吧！"));
var t = a.instance.barBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onBar_();
m.waitNext = e;
});
}, function(e) {
if (o.player.team.getRoleByClassId(8)) e(null, !0); else {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("第一个见到的会是谁呢，真是让人期待！"));
var a = t.instance.leftNode;
h.instance.setTouchableTarget_(a, function() {
t.instance.onSwitchPointNode_(null, "normal");
h.instance.say_(i.t("点击召唤一次"));
var a = t.instance.normalPointBt;
h.instance.setTouchableTarget_(a, function() {
t.instance.onPoint_(null, 1);
h.instance.setTouchableTarget_();
h.instance.say_();
m.point2Role.guideNext1 = e;
});
});
}
}, function(e, a) {
if (e && a) a(null, !0); else {
a = e;
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT, -100);
h.instance.say_(i.t("果然是库林呢，他每天都会来看望你。"));
var t = d.getNodeByTag(d.TAG.POINT_ROLE_EFFECT_NODE).getComponent("pointRoleEffectNode"), n = t.yesBt;
h.instance.setTouchableTarget_(n, function() {
t.onYes_();
a();
});
}
}, function(e, a) {
if (e && a) a(); else {
a = e;
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_();
var n = t.instance.pointEffectYesBt;
h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
t.instance.onClosePointEffect_();
a();
});
}
}, function(e) {
if (t.instance.normalNode.active) {
d.addGuideNode();
var a = t.instance.pointBackBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onClosePointNode_();
e();
});
} else e();
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("继续和同伴会合吧！"));
var a = t.instance.rightNode;
h.instance.setTouchableTarget_(a, function() {
t.instance.onSwitchPointNode_(null, "advanced");
h.instance.setSide_(h.SIDE.RIGHT);
var a = t.instance.advancedPointBt;
h.instance.say_(i.t("点击召唤一次"));
h.instance.setTouchableTarget_(a, function() {
t.instance.onPoint_(null, 3);
h.instance.setTouchableTarget_();
h.instance.say_();
m.point2Role.guideNext1 = e;
});
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT, -100);
h.instance.say_(i.t("是比克呀，好久不见！"));
var a = d.getNodeByTag(d.TAG.POINT_ROLE_EFFECT_NODE).getComponent("pointRoleEffectNode"), t = a.yesBt;
h.instance.setTouchableTarget_(t, function() {
a.onYes_();
e();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_();
var a = t.instance.pointEffectYesBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onClosePointEffect_();
e();
});
}, function(e) {
d.addGuideNode();
h.instance.say_(null);
var a = d.getBackNode();
h.instance.setTouchableTarget_(a.backBt.node, function() {
h.instance.close_();
a.onBack_();
e();
});
} ], function() {
m.point2Role.run = !1;
});
}
},
firstBattle: {
test: function() {
var e = !(o.player.smapStarMap[1] && o.player.smapStarMap[1][101][10101]);
e && storage.setItem("battle_auto_" + s.BATTLE_TYPE.SMAP + "_" + o.player.id, 0);
return e;
},
guide: function() {
var a = e("homeScene"), r = e("bmapScene"), s = e("mmapScene"), o = e("selectBattleRolesScene"), l = e("battleScene"), c = e("battle.fightHandler"), u = e("battleMain");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("我们开始冒险吧！"));
var t = a.instance.battleBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onMap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT, 150, 0);
h.instance.say_(i.t("前面有爆炸声，我们快去看看吧！"));
var a = r.instance.mapLayout;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
r.instance.onMap_({
target: a
});
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("地球战士又在欺负村民了，跟伙伴们一起去打败他们吧！"));
var a = s.instance.latestMapBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
s.instance.onMap_({
target: a
});
e();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT, 0, -50);
h.instance.say_(i.t("是时候让龙珠战士们上场了"));
var a = d.getNodeByTag(d.TAG.SMAP_INFO_PANEL).getComponent("smapInfoPanel"), t = a.nextBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.onNext_();
o.genData(o.TYPE.SMAP_BATTLE_ATTACK_TEAM).selectIdxs.length > 0 ? e(null, !0) : m.waitNext = e;
});
}, function(e, a) {
if (e && a) a(null, !0); else {
a = e;
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击选择战士上阵"));
var n = t.sortBy(t.values(o.instance.roleItemNodeMap), function(e) {
return e.zIndex;
})[0];
h.instance.setTouchableTarget_(n, function() {
o.instance.onSelect_({
target: n
});
a();
});
}
}, function(e, a) {
if (e && a) a(null, !0); else {
a = e;
d.addGuideNode();
var n = t.sortBy(t.values(o.instance.roleItemNodeMap), function(e) {
return e.zIndex;
})[1];
h.instance.setTouchableTarget_(n, function() {
o.instance.onSelect_({
target: n
});
a();
});
}
}, function(e, a) {
if (e && a) m.waitNext = a; else {
a = e;
d.addGuideNode();
var n = t.sortBy(t.values(o.instance.roleItemNodeMap), function(e) {
return e.zIndex;
})[2];
h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
o.instance.onSelect_({
target: n
});
a();
});
}
}, function(e) {
d.addGuideNode();
_setTimeout(function() {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("出击！"));
var a = o.instance.battleBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
o.instance.onBattle_();
});
m.waitNext = e;
}, 0);
}, function(e) {
d.addGuideNode();
h.instance.say_();
h.instance.setTouchableTarget_();
l.instance.pauseBt.active = !1;
l.instance.speedUpBt.active = !1;
l.instance.autoBt.active = !1;
_setTimeout(function() {
var e = c.area.getEntityBy({
teamId: 1,
idx: 0
})[0];
e.recoverMp(e.maxMp);
}, 6e3);
m.firstBattle.guideNext1 = e;
}, function(e, a) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击释放悟空必杀技！"));
u.pause();
h.instance.setTouchableTarget_(e, function() {
h.instance.say_();
h.instance.setTouchableTarget_();
u.resume();
l.instance.onTeamItem_({
target: e
});
m.firstBattle.guideNext2 = a;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("悟空又变强了呀！继续前进吧。"));
l.instance.pauseBt.active = !0;
l.instance.speedUpBt.active = !0;
l.instance.autoBt.active = !0;
var a = l.instance.nextBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.say_();
h.instance.setTouchableTarget_();
l.instance.onNext_({
target: a
});
m.firstBattle.guideNext3 = e;
});
}, function(e) {
d.addGuideNode();
_setTimeout(function() {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里可以开启战斗加速哦。"));
u.pause();
var a = l.instance.speedUpBt;
h.instance.setTouchableTarget_(a, function() {
l.instance.onSpeedUp_();
e();
});
}, 2e3);
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里可以开启智能战斗哦。"));
var a = l.instance.autoBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.say_();
h.instance.setTouchableTarget_();
u.resume();
l.instance.onAuto_();
m.firstBattle.guideNext4 = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("太棒了，成功帮助了村民们呢！"));
var a = l.instance.winPanel.getComponent("battleWinPanel"), t = a.nextBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.onContinue_();
e();
});
} ], function() {
m.firstBattle.run = !1;
m.waitNext = function() {
m.run([ m.smapBattleTo ]);
};
});
}
},
smapBattleTo: {
test: function() {
return !o.player.smapStarMap[1][101][10106];
},
guide: function() {
var a = e("homeScene"), t = e("bmapScene"), r = e("mmapScene"), s = e("selectBattleRolesScene"), l = e("battleScene");
n.waterfall([ function(e) {
if (a.instance) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("我们开始冒险吧！"));
var t = a.instance.battleBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onMap_();
m.waitNext = e;
});
} else e();
}, function(e) {
d.addGuideNode();
if (t.instance) {
h.instance.setSide_(h.SIDE.RIGHT, 0, -100);
h.instance.say_(i.t("点击开始备战！"));
var a = t.instance.mapLayout;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap_({
target: a
});
m.waitNext = e;
});
} else e();
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
var a = r.instance.latestMapBt, t = {
10102: i.t("神秘的宇宙人又出现了，快去打败他吧！"),
10103: i.t("继续去击败强敌吧！"),
10104: i.t("越来越得心应手了呢！"),
10105: i.t("加油呀，离爆炸地点越来越近了！"),
10106: i.t("击败那巴，守护地球的时候到了！")
};
h.instance.say_(t[a.data.smapId]);
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
r.instance.onMap_({
target: a
});
e();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT, 0, -50);
h.instance.say_(i.t("点击开始备战!"));
var a = d.getNodeByTag(d.TAG.SMAP_INFO_PANEL).getComponent("smapInfoPanel"), t = a.nextBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
var t = s.TYPE.SMAP_BATTLE_ATTACK_TEAM;
if (0 == s.genData(t).selectIdxs.length) {
var n = t + "_selectIdxs_" + o.player.id;
storage.setItem(n, [ "1", "2", "3" ]);
}
a.onNext_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("出击！"));
var a = s.instance.battleBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
s.instance.onBattle_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.say_();
h.instance.setTouchableTarget_();
h.instance.hideTouch_();
l.instance.pauseBt.active = !1;
m.firstBattle.guideNext4 = e;
}, function(e) {
d.addGuideNode();
var a = l.instance.winPanel.getComponent("battleWinPanel"), t = a.nextBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
o.player.smapStarMap[1][101][10106] ? u.popToHomeScene() : a.onContinue_();
e();
});
} ], function() {
m.smapBattleTo.run = !1;
m.waitNext = function() {
m.run([ m.smapBattleTo ]);
};
});
}
},
roleHandler: {
test: function() {
var e = o.player.team.getRoleByIdx(1), a = t.keys(o.player.team.roles).length, n = 1 == u.teamData.teamItemMap[e.idx].roleItem.color;
m.needEvolve = n;
m.needUpgradeSkill = !!e.skills[100101] && 1 == e.skills[100101].level;
m.needUpgradeEqpt = e.level > 1 && 1 == e.equipments.evlItem_1.level;
m.needUseExpItem = e.level < 5;
return (m.needEvolve || m.needUpgradeSkill || m.needUpgradeEqpt || m.needUseExpItem) && 3 == a;
},
guide: function() {
var a = e("teamScene"), t = e("roleScene"), r = e("eqptScene");
n.waterfall([ function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("经过战斗，有招式可以进阶了，快去一起看看吧！"));
var a = d.getQuickNode();
a.isPackUp && a.onQuick_();
var t = a.teamBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.onTeam_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
m.needEvolve ? h.instance.say_(i.t("进阶招式可以让自己变得更强大。")) : h.instance.say_(i.t("点击这里进入队伍界面。"));
var t = a.instance.teamItemMap[1];
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onTeamItem_({
target: t
});
m.roleHandler.guideNext2 = e;
});
}, function(e) {
d.addGuideNode();
var a = t.instance.itemsLayout.getChildByName("item_item_1");
if (m.needEvolve && a.getComponent("itemItem").data.isShowEvolve) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进阶招式。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEvlItem_({
target: a
});
m.roleHandler.guideNext3 = e;
});
} else e();
}, function(e) {
d.addGuideNode();
var a = t.instance.itemsLayout.getChildByName("item_item_2");
if (m.needEvolve && a.getComponent("itemItem").data.isShowEvolve) {
h.instance.say_(i.t("把所有招式都进阶一次吧。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEvlItem_({
target: a
});
m.roleHandler.guideNext3 = e;
});
} else e();
}, function(e) {
d.addGuideNode();
var a = t.instance.itemsLayout.getChildByName("item_item_3");
if (m.needEvolve && a.getComponent("itemItem").data.isShowEvolve) {
h.instance.say_(i.t("把所有招式都进阶一次吧。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEvlItem_({
target: a
});
m.roleHandler.guideNext3 = e;
});
} else e();
}, function(e) {
d.addGuideNode();
var a = t.instance.itemsLayout.getChildByName("item_item_4");
if (m.needEvolve && a.getComponent("itemItem").data.isShowEvolve) {
h.instance.setSide_(h.SIDE.RIGHT, 0, -100);
h.instance.say_(i.t("把所有招式都进阶一次吧。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEvlItem_({
target: a
});
m.roleHandler.guideNext3 = e;
});
} else e();
}, function(e) {
d.addGuideNode();
var a = t.instance.itemsLayout.getChildByName("item_item_5");
if (m.needEvolve && a.getComponent("itemItem").data.isShowEvolve) {
h.instance.say_(i.t("把所有招式都进阶一次吧。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEvlItem_({
target: a
});
m.roleHandler.guideNext3 = e;
});
} else e();
}, function(e) {
d.addGuideNode();
var a = t.instance.itemsLayout.getChildByName("item_item_6");
if (m.needEvolve && a.getComponent("itemItem").data.isShowEvolve) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("把所有招式都进阶一次吧。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEvlItem_({
target: a
});
m.roleHandler.guideNext3 = e;
});
} else e();
}, function(e) {
d.addGuideNode();
if (m.needEvolve) {
h.instance.say_(i.t("当所有招式都进阶到绿色品质后，战士就可以进化至绿色品阶。"));
var a = t.instance.evolveBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEvolve_({
target: a
});
m.roleHandler.guideNext4 = e;
});
} else e();
}, function(e) {
d.addGuideNode();
if (m.needEvolve) {
h.instance.setSide_(h.SIDE.LEFT, -100);
h.instance.say_(i.t("战士进化后可以解锁新的技能并且招式可继续进化到下一品阶。"));
h.instance.hideTouch_();
m.roleHandler.guideNext5 = e;
} else e();
}, function(e) {
d.addGuideNode();
if (m.needUseExpItem) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("战士等级越高，战斗力就越强，点击这里为悟空升级。"));
var a = t.instance.useExpBt;
h.instance.setTouchableTarget_(a, function() {
t.instance.onUseExpItem_();
e();
});
} else e();
}, function(e) {
d.addGuideNode();
if (m.needUseExpItem) {
h.instance.say_(i.t("选择使用圣水提升战士等级，长按可以快速使用哦。"));
var a = t.instance.expItemsPanel.expItemNodeMap[20002];
h.instance.setTouchableTarget_(a, function() {
t.instance.onExpItem_({
target: a,
type: cc.Node.EventType.TOUCH_START
});
t.instance.onExpItem_({
target: a,
type: cc.Node.EventType.TOUCH_END
});
m.roleHandler.guideNext6 = e;
});
} else e();
}, function(e) {
d.addGuideNode();
d.removePanel(t.instance.expItemsPanel);
if (m.needUpgradeSkill) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里可以查看战士的技能。"));
var a = t.instance.skillBt;
h.instance.setTouchableTarget_(a, function() {
t.instance.onType_({
target: a
});
e();
});
} else e();
}, function(e) {
d.addGuideNode();
if (m.needUpgradeSkill) {
h.instance.say_(i.t("点击这里升级技能。"));
var a = t.instance.skillLayout.getChildByName("skill_1").getComponentInChildren("skillItem"), n = a.upgradeBt;
h.instance.setTouchableTarget_(n, function() {
a.onUpgrade_({
target: n
});
e();
});
} else e();
}, function(e) {
d.addGuideNode();
if (m.needUpgradeEqpt) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击进入查看招式详情。"));
var a = t.instance.itemsLayout.getChildByName("item_item_1");
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
a.data.isShowEvolve = !1;
t.instance.onEvlItem_({
target: a
});
m.waitNext = e;
});
} else e();
}, function(e) {
d.addGuideNode();
if (m.needUpgradeEqpt) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("一键升级能够将这个招式升级，全部升级能够一次性升级所有招式。"));
if (m.isEasy) {
var a = r.instance.upgradeMaxBt;
h.instance.setTouchableTarget_(a, function() {
r.instance.onUpgradeMax();
});
} else {
a = r.instance.upgradeAllBt;
h.instance.setTouchableTarget_(a, function() {
r.instance.onUpgradeAll();
});
}
m.roleHandler.guideNext7 = e;
} else e();
}, function(e) {
d.addGuideNode();
if (m.needUpgradeEqpt) {
h.instance.say_(null);
var a = d.getBackNode();
h.instance.setTouchableTarget_(a.backBt.node, function() {
h.instance.close_();
e();
u.popToHomeScene();
});
} else e();
} ], function() {
m.roleHandler.run = !1;
storage.setItem("emit_guide_end_" + o.player.id, 1);
});
}
},
settingIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("settingIntroduce_" + o.player.id) || !1;
return e < 3 && !a;
},
guide: function() {
var a = e("homeScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里了解设置功能!"));
var t = a.instance.playerItem;
h.instance.setTouchableTarget_(t, function() {
a.instance.onSetting_();
e();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("这里可以查看战队的信息并且可以进行更换昵称、更换形象、更换头像框等操作。"));
var t = a.instance.settingPanel.getComponent("settingPanel"), n = t.closeBt;
h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
t.onClose_();
e();
});
} ], function() {
m.settingIntroduce.run = !1;
storage.setItem("settingIntroduce_" + o.player.id, 1);
m.run([ m.mainTask ]);
});
}
},
mainTask: {
test: function() {
var e = o.player.task.main[1];
m.needMainTaskReceive = 1 == e.taskId && e.isComplete;
var a = !!o.player.team.getRoleByClassId(3), t = o.player.bag.getItemCount(50030) >= 10;
m.needComposeRole = !a && t;
return m.needMainTaskReceive || m.needComposeRole;
},
guide: function() {
var a = e("homeScene"), t = e("teamScene");
d.addGuideNode();
n.waterfall([ function(e) {
if (m.needMainTaskReceive) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击主线任务，去寻找悟饭吧！"));
var t = a.instance.mainTaskNameLabel.parent;
h.instance.setTouchableTarget_(t, function() {
a.instance.onMainTask_();
e();
});
} else e();
}, function(e) {
if (m.needMainTaskReceive) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("完成主线可快速提升等级"));
var t = a.instance.mainTaskPanel.getComponent("mainTaskPanel"), n = t.receiveBt;
h.instance.setTouchableTarget_(n, function() {
t.onReceive_();
e();
});
} else e();
}, function(e) {
if (m.needMainTaskReceive) {
d.addGuideNode();
h.instance.say_(i.t("进入战士界面可以召唤出悟饭哦。"));
var t = a.instance.mainTaskPanel.getComponent("mainTaskPanel"), n = t.goBt;
h.instance.setTouchableTarget_(n, function() {
t.onGo_({
target: n
});
h.instance.close_();
m.waitNext = e;
});
} else {
m.waitNext = e;
u.pushScene(u.NAME.TEAM_SCENE);
}
}, function(e) {
d.addGuideNode();
m.mainTask.guideNext1 = e;
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里可以合成灵魂石召唤新的战士。"));
var a = t.instance.teamItemMap[3];
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onTeamItem_({
target: a
});
m.mainTask.guideNext2 = e;
});
} ], function() {
m.mainTask.run = !1;
sdkApi.emitData(sdkApi.EMIT_TYPE.GUIDE_END);
});
}
},
mapBoxReceive: {
test: function() {
return !(o.player.bmapBoxReceivedMap[101] || {})[7];
},
guide: function() {
var a = e("homeScene"), t = e("bmapScene"), r = e("mmapScene");
n.waterfall([ function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("别忘记领取关卡奖励哦。"));
var t = a.instance.battleBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onMap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.say_(null);
var a = t.instance.mapLayout;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap_({
target: a
});
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里领取。"));
var a = r.instance.boxBts[0];
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
r.instance.onBox_({
target: a
});
e();
});
} ], function() {
m.mapBoxReceive.run = !1;
});
}
},
eliteMapIntroduce: {
test: function() {
var e = storage.getItem("eliteMapIntroduce_" + o.player.id) || !1;
return !!o.player.smapStarMap[1][101][10114] && !o.player.smapStarMap[2] && !e;
},
guide: function() {
var a = e("bmapScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("已开启<精英关卡>点击这里进入。"));
var t = a.instance.typeBts[1].node;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onType_({
target: t
});
e();
});
}, function(e) {
d.addGuideNode();
h.instance.say_(null);
var t = a.instance.mapLayout;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onMap_({
target: t
});
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("普通关卡通关后开启对应的<精英关卡>，主要掉落招式合成材料、战士灵魂石和伙伴碎片。"));
h.instance.setTouchableTarget_(null, function() {
e();
});
} ], function() {
h.instance.close_();
m.eliteMapIntroduce.run = !1;
storage.setItem("eliteMapIntroduce_" + o.player.id, 1);
});
}
},
friendshipIntroduce: {
test: function() {
return !storage.getItem("friendshipIntroduce_" + o.player.id);
},
guide: function() {
var a = e("teamScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("让我们看看怎么激活羁绊吧。"));
var t = a.instance.friendshipBt;
h.instance.setTouchableTarget_(t, function() {
a.instance.onType_({
target: t
});
e();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("只要获得战士即可激活羁绊，战士星级越高，属性加成越多。"));
h.instance.setTouchableTarget_(null, function() {
h.instance.close_();
e();
});
} ], function() {
m.friendshipIntroduce.run = !1;
storage.setItem("friendshipIntroduce_" + o.player.id, 1);
});
}
},
firstArenaBattle: {
test: function() {
var e = o.player.level, a = o.player.arena;
return e == l.CONSTS.UNLOCK_LEVEL.ARENA && 0 == a.winTimes;
},
guide: function() {
var a = e("homeScene"), r = e("arenaScene"), s = e("selectBattleRolesScene"), o = e("battleScene");
d.addGuideNode();
n.waterfall([ function(e) {
var t = a.instance.arenaBt;
a.instance.scrollView.scrollToRight(0);
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("让我们在天下第一武道会上挑战下其他玩家吧!"));
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onArena_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("选择对手!"));
var a = r.instance.centerLayout.getChildByName("player_info_3_layout").getChildByName("challenge_bt");
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
r.instance.onChallenge_({
target: a
});
s.genData(s.TYPE.ARENA_ATTACK_TEAM).selectIdxs.length > 0 ? e(null, !0) : m.waitNext = e;
});
}, function(e, a) {
if (e && a) a(null, !0); else {
a = e;
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("把战士们都派上场。"));
var n = t.sortBy(t.values(s.instance.roleItemNodeMap), function(e) {
return e.zIndex;
})[0];
h.instance.setTouchableTarget_(n, function() {
s.instance.onSelect_({
target: n
});
a();
});
}
}, function(e, a) {
if (e && a) a(null, !0); else {
a = e;
d.addGuideNode();
var n = t.sortBy(t.values(s.instance.roleItemNodeMap), function(e) {
return e.zIndex;
})[1];
h.instance.setTouchableTarget_(n, function() {
s.instance.onSelect_({
target: n
});
a();
});
}
}, function(e, a) {
if (e && a) a(null, !0); else {
a = e;
d.addGuideNode();
var n = t.sortBy(t.values(s.instance.roleItemNodeMap), function(e) {
return e.zIndex;
})[2];
h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
s.instance.onSelect_({
target: n
});
a();
});
}
}, function(e, a) {
if (e && a) a(null, !0); else {
a = e;
d.addGuideNode();
var n = t.sortBy(t.values(s.instance.roleItemNodeMap), function(e) {
return e.zIndex;
})[3];
n ? h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
s.instance.onSelect_({
target: n
});
a();
}) : a();
}
}, function(e, a) {
if (e && a) m.waitNext = a; else {
a = e;
d.addGuideNode();
var n = t.sortBy(t.values(s.instance.roleItemNodeMap), function(e) {
return e.zIndex;
})[4];
n ? h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
s.instance.onSelect_({
target: n
});
a();
}) : a();
}
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("出击！"));
var a = s.instance.battleBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
s.instance.onBattle_();
});
m.firstArenaBattle.guideNext1 = e;
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
var a, t = o.instance.winPanel.getComponent("battleWinPanel"), n = o.instance.failPanel.getComponent("battleFailPanel");
if (t.node.active) {
h.instance.say_(i.t("太棒了，击败了一个对手，提高排名可获得钻石奖励。"));
a = t.nextBt;
} else {
h.instance.say_(i.t("很可惜，被击败了,请成长后再来吧。"));
a = n.nextBt;
}
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.onContinue_();
e();
});
} ], function() {
h.instance.close_();
m.firstArenaBattle.run = !1;
});
}
},
shopIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("shopIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.SHOP && !a;
},
guide: function() {
var a = e("homeScene"), t = e("shopScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里打开商店。"));
var t = a.instance.shopBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onShop_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里可以切换其他商店。"));
d.removePanel(t.instance.autoSellPanel);
var a = t.instance.rightBt;
a.active ? h.instance.setTouchableTarget_(a, function() {
t.instance.onSwitch_(null, 1);
e();
}) : e();
}, function(e) {
d.addGuideNode();
h.instance.say_();
var a = t.instance.rightBt;
a.active ? h.instance.setTouchableTarget_(a, function() {
t.instance.onSwitch_(null, 1);
e();
}) : e();
}, function(e) {
d.addGuideNode();
h.instance.say_();
var a = t.instance.rightBt;
a.active ? h.instance.setTouchableTarget_(a, function() {
t.instance.onSwitch_(null, 1);
e();
}) : e();
}, function(e) {
d.addGuideNode();
h.instance.say_();
var a = t.instance.rightBt;
a.active ? h.instance.setTouchableTarget_(a, function() {
t.instance.onSwitch_(null, 1);
e();
}) : e();
}, function(e) {
d.addGuideNode();
h.instance.say_();
var a = t.instance.rightBt;
a.active ? h.instance.setTouchableTarget_(a, function() {
t.instance.onSwitch_(null, 1);
e();
}) : e();
}, function(e) {
d.addGuideNode();
h.instance.say_();
var a = t.instance.rightBt;
a.active ? h.instance.setTouchableTarget_(a, function() {
t.instance.onSwitch_(null, 1);
e();
}) : e();
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("商店可购买到各种材料，战士碎片。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.shopIntroduce.run = !1;
storage.setItem("shopIntroduce_" + o.player.id, 1);
});
}
},
mapType3Introduce: {
test: function() {
var e = o.player.level, a = storage.getItem("mapType3Introduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.MAP_TYPE_3 && !a;
},
guide: function() {
var a = e("homeScene"), t = e("dailyBmapScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入日常试炼。"));
var t = a.instance.mapBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onDailyBmap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入<战士历练>。"));
var a = t.instance.map2Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap2_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("<蔬菜人训练>副本可获得各种圣水提升战士等级。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<挑战撒旦>副本可获得各种材料，出售到商店获得大量金币。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.mapType3Introduce.run = !1;
storage.setItem("mapType3Introduce_" + o.player.id, 1);
});
}
},
mapType4Introduce: {
test: function() {
var e = o.player.level, a = storage.getItem("mapType4Introduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.MAP_TYPE_4 && !a;
},
guide: function() {
var a = e("homeScene"), t = e("dailyBmapScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入日常试炼。"));
var t = a.instance.mapBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onDailyBmap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT, 100);
h.instance.say_(i.t("点击这里进入<战士进阶>。"));
var a = t.instance.map1Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap1_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("3个副本都可获得大量提升战士品质所需的材料-复原药剂。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.say_(i.t("<贝吉塔军团>副本里的敌人免疫物理伤害，建议选择有魔法伤害技能的战士上阵。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.say_(i.t("<基纽特战队>副本里的敌人免疫魔法伤害，建议选择有物理伤害技能的战士上阵。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<人造人军团>副本只允许上阵女性战士，建议平时多搜集和培养一些女性战士。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.mapType4Introduce.run = !1;
storage.setItem("mapType4Introduce_" + o.player.id, 1);
});
}
},
guildIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("guildIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.GUILD && !a;
},
guide: function() {
var a = e("homeScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入<家族>。"));
var t = a.instance.guildBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onGuild_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("可以加入或创建家族,和其他玩家一起体验游戏吧。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.say_(i.t("家族里有很多精彩活动哦,赶紧加入吧。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.guildIntroduce.run = !1;
storage.setItem("guildIntroduce_" + o.player.id, 1);
});
}
},
expeditionIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("expeditionIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.EXPEDITION && !a;
},
guide: function() {
var a = e("homeScene"), t = e("dailyBmapScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入日常试炼。"));
var t = a.instance.mapBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onDailyBmap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<强者争霸>。"));
var a = t.instance.map3Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap3_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("在这里挑战对手可以获得大量金币和奖励哦。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.expeditionIntroduce.run = !1;
storage.setItem("expeditionIntroduce_" + o.player.id, 1);
});
}
},
endlessIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("endlessIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.ENDLESS && !a;
},
guide: function() {
var a = e("teamScene"), t = e("roleScene"), r = e("homeScene"), s = e("dailyBmapScene");
d.addGuideNode();
n.waterfall([ function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<宝石>功能已开启，点击这里进入。"));
var a = d.getQuickNode();
a.isPackUp && a.onQuick_();
var t = a.teamBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.onTeam_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var t = a.instance.teamItemMap[1];
t.zIndex = -1;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onTeamItem_({
target: t
});
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var a = t.instance.stoneBt;
h.instance.setTouchableTarget_(a, function() {
t.instance.onType_({
target: a
});
e();
});
}, function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("宝石有丰富的属性加成，共有生命、攻击、防御、暴击、抗晕、吸血6种类型的宝石，可以通过合成来升级，宝石主要在<无尽蛇道>闯关获得。"));
h.instance.setTouchableTarget_(null, function() {
e();
});
}, function(e) {
h.instance.say_(null);
var a = d.getBackNode();
h.instance.setTouchableTarget_(a.backBt.node, function() {
m.waitNext = e;
h.instance.close_();
a.onBack_();
});
}, function(e) {
d.addGuideNode();
var a = d.getBackNode();
h.instance.setTouchableTarget_(a.backBt.node, function() {
m.waitNext = e;
h.instance.close_();
a.onBack_();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入日常试炼。"));
var a = r.instance.mapBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
r.instance.onDailyBmap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var a = s.instance.map5Bt, t = s.instance.scrollView;
t.scrollToPercentHorizontal(a.x / t.content.width - .1);
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<无尽蛇道>。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
s.instance.onMap5_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("挑战无尽蛇道可以获得大量宝石，每天可重置并扫荡一次。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.say_(i.t("扫荡会根据最高通关来计算奖励，建议先尽力通关后再扫荡。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.endlessIntroduce.run = !1;
storage.setItem("endlessIntroduce_" + o.player.id, 1);
});
}
},
capsuleIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("capsuleIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.CAPSULE && !a;
},
guide: function() {
var a = e("teamScene"), r = e("roleScene");
d.addGuideNode();
n.waterfall([ function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<胶囊>功能已开启，点击这里进入。"));
var a = d.getQuickNode();
a.isPackUp && a.onQuick_();
var t = a.teamBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.onTeam_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var n = t.values(a.instance.teamItemMap)[0];
h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
a.instance.onTeamItem_({
target: n
});
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var a = r.instance.capsuleBt;
h.instance.setTouchableTarget_(a, function() {
r.instance.onType_({
target: a
});
e();
});
}, function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("万能胶囊拥有直接的技能加成效果，技能可进行随机重构，胶囊可以合成更高级的并有更大几率出高级技能，道具可在每日活跃宝箱、商店、运营活动中产出。"));
h.instance.setTouchableTarget_(null, function() {
e();
});
} ], function() {
h.instance.close_();
m.capsuleIntroduce.run = !1;
storage.setItem("capsuleIntroduce_" + o.player.id, 1);
});
}
},
eyeIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("eyeIntroduce_" + o.player.id) || !1, t = new Date(Date._now()).getHours(), n = t >= c.EYE.CONSTS.OPEN_HOURS && t < c.EYE.CONSTS.CLOSE_HOURS;
return e >= l.CONSTS.UNLOCK_LEVEL.EYE && n && !a;
},
guide: function() {
var a = e("homeScene"), t = e("dailyBmapScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入日常试炼。"));
var t = a.instance.mapBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onDailyBmap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var a = t.instance.map6Bt, n = t.instance.scrollView;
n.scrollToPercentHorizontal(a.x / n.content.width - .1);
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<体能训练>。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap6_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("在这里可以和其他玩家一起抢夺训练位置，根据位置名次和训练时间结算奖励。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.say_(i.t("当然也可以在单人房自己训练，可避免被其他玩家抢位。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.tailIntroduce.run = !1;
storage.setItem("eyeIntroduce_" + o.player.id, 1);
});
}
},
tailIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("tailIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.TAIL && !a;
},
guide: function() {
var a = e("homeScene"), t = e("dailyBmapScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入日常试炼。"));
var t = a.instance.mapBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onDailyBmap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var a = t.instance.map4Bt, n = t.instance.scrollView;
n.scrollToPercentHorizontal(a.x / n.content.width);
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<拯救地球>。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap4_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("拯救地球可以获得大量烤鱼，用于伙伴强化。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.say_(i.t("请查看规则后派出相应的战士上阵可打出更高的伤害。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.tailIntroduce.run = !1;
storage.setItem("tailIntroduce_" + o.player.id, 1);
});
}
},
practiceIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("practiceIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.PRACTICE && !a && !r.isHidePractice;
},
guide: function() {
var a = e("homeScene"), t = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<北界王特训>已开启，让我们去看看吧。"));
var t = a.instance.crossBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onCross_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入<北界王特训>。"));
var a = t.instance.map1Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap1_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("在这里可以选择不同的地图进行特训，可获得大量界王币、钻石、金币、圣水。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.practiceIntroduce.run = !1;
storage.setItem("practiceIntroduce_" + o.player.id, 1);
});
}
},
arena3v3Introduce: {
test: function() {
var e = o.player.level, a = storage.getItem("arena3v3Introduce_" + o.player.id) || !1;
return e >= l.CONSTS.UNLOCK_LEVEL.ARENA_3V3 && t.keys(o.player.team.roles).length >= 15 && !a;
},
guide: function() {
var a = e("homeScene"), t = e("arena3v3Scene");
d.addGuideNode();
n.waterfall([ function(e) {
var t = a.instance.arena3v3Bt, n = a.instance.scrollView;
n.scrollToPercentHorizontal(t.x / n.content.width - .1);
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入<沙鲁游戏>。"));
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onArena3v3_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("根据等级划分多个战场，点击这里进入你所在的战场。"));
var a = t.instance.myEnterBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEnterMyTeam_();
e();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("这里可以进行沙鲁游戏,上阵3队战士参与竞技吧。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.arena3v3Introduce.run = !1;
storage.setItem("arena3v3Introduce_" + o.player.id, 1);
});
}
},
arena3v3Introduce2: {
test: function() {
var e = o.player.level, a = storage.getItem("arena3v3Introduce2_" + o.player.id) || !1;
return e >= l.CONSTS.UNLOCK_LEVEL.ARENA_3V3 && t.keys(o.player.team.roles).length >= 15 && !a;
},
guide: function() {
var a = e("homeScene"), t = e("arena3v3Scene"), r = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<沙鲁游戏>已开启，让我们去看看吧。"));
var t = a.instance.crossBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onCross_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<沙鲁游戏>。"));
r.instance.scrollView.scrollToPercentHorizontal(.5, 0);
var a = r.instance.map7Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
r.instance.onMap7_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("根据等级划分多个战场，点击这里进入你所在的战场。"));
var a = t.instance.myEnterBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onEnterMyTeam_();
e();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("这里可以进行沙鲁游戏,上阵3队战士参与竞技吧。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.arena3v3Introduce2.run = !1;
storage.setItem("arena3v3Introduce2_" + o.player.id, 1);
});
}
},
prestigeBattleIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("prestigeBattleIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.PRESTIGE_BATTLE && !a && !r.isHidePrestigeBattle;
},
guide: function() {
var a = e("teamScene"), t = e("roleScene"), r = e("homeScene"), s = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<宝物>功能已开启，点击这里进入。"));
var a = d.getQuickNode();
a.isPackUp && a.onQuick_();
var t = a.teamBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.onTeam_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var t = a.instance.teamItemMap[1];
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onTeamItem_({
target: t
});
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var a = t.instance.artifactBt;
h.instance.setTouchableTarget_(a, function() {
t.instance.onType_({
target: a
});
e();
});
}, function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("宝物有高额的属性加成，20个宝物碎片可以合成一件宝物，可以消耗该宝物碎片进行升阶，碎片主要通过声望商店获得。"));
h.instance.setTouchableTarget_(null, function() {
e();
});
}, function(e) {
h.instance.say_(null);
var a = d.getBackNode();
h.instance.setTouchableTarget_(a.backBt.node, function() {
m.waitNext = e;
h.instance.close_();
a.onBack_();
});
}, function(e) {
d.addGuideNode();
var a = d.getBackNode();
h.instance.setTouchableTarget_(a.backBt.node, function() {
m.waitNext = e;
h.instance.close_();
a.onBack_();
});
}, function(e) {
d.addGuideNode();
var a = r.instance.prestigeBattleBt, t = r.instance.scrollView;
t.scrollToPercentHorizontal(a.x / t.content.width - .1);
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<讨伐弗利萨>。"));
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
s.prototype.onMap2_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("在这里可以和同个家族成员组队进行讨伐弗利萨，还能跨服扰乱其他家族的队伍，可获得大量声望币。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.prestigeBattleIntroduce.run = !1;
storage.setItem("prestigeBattleIntroduce_" + o.player.id, 1);
});
}
},
prestigeBattleIntroduce2: {
test: function() {
var e = o.player.level, a = storage.getItem("prestigeBattleIntroduce2_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.PRESTIGE_BATTLE && !a && !r.isHidePrestigeBattle;
},
guide: function() {
var a = e("teamScene"), r = e("roleScene"), s = e("homeScene"), l = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<宝物>功能已开启，点击这里进入。"));
var a = d.getQuickNode();
a.isPackUp && a.onQuick_();
var t = a.teamBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.onTeam_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var n = t.values(a.instance.teamItemMap)[0];
h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
a.instance.onTeamItem_({
target: n
});
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var a = r.instance.artifactBt;
h.instance.setTouchableTarget_(a, function() {
r.instance.onType_({
target: a
});
e();
});
}, function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("宝物有高额的属性加成，20个宝物碎片可以合成一件宝物，可以消耗该宝物碎片进行升阶，碎片主要通过声望商店获得。"));
h.instance.setTouchableTarget_(null, function() {
e();
});
}, function(e) {
h.instance.say_(null);
var a = d.getBackNode();
h.instance.setTouchableTarget_(a.backBt.node, function() {
m.waitNext = e;
h.instance.close_();
a.onBack_();
});
}, function(e) {
d.addGuideNode();
var a = d.getBackNode();
h.instance.setTouchableTarget_(a.backBt.node, function() {
m.waitNext = e;
h.instance.close_();
a.onBack_();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<讨伐弗利萨>已开启，让我们去看看吧。"));
var a = s.instance.crossBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
s.instance.onCross_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<讨伐弗利萨>。"));
l.instance.scrollView.scrollToLeft(0);
var a = l.instance.map2Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
l.instance.onMap2_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("在这里可以和同个家族成员组队进行讨伐弗利萨，还能跨服扰乱其他家族的队伍，可获得大量声望币。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.prestigeBattleIntroduce2.run = !1;
storage.setItem("prestigeBattleIntroduce2_" + o.player.id, 1);
});
}
},
teamBattleIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("teamBattleIntroduce_" + o.player.id);
return e == l.CONSTS.UNLOCK_LEVEL.TEAM_BATTLE && !a && !r.isHideTeamBattle;
},
guide: function() {
var a = e("homeScene");
d.addGuideNode();
n.waterfall([ function(e) {
var t = a.instance.teamBattleBt;
a.instance.scrollView.scrollToRight();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<跨服宇宙大战>。"));
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onTeamBattle_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("在这里可以和同个区的玩家组队，通过战斗获得积分进入排行榜，可获得大量巅峰币和伙伴币。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.teamBattleIntroduce.run = !1;
storage.setItem("teamBattleIntroduce_" + o.player.id, 1);
});
}
},
allServerBattleIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("allServerBattleIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.All_SERVER_BATTLE && !a;
},
guide: function() {
var a = e("homeScene"), t = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<全览大会>已开启，让我们去看看吧。"));
var t = a.instance.crossBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onCross_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<全览大会>。"));
var a = t.instance.map4Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap4_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<全览大会>是以队伍形式占领掠夺的跨服玩法，占领地盘后每隔一段时间可挖取奖励，如果想占领敌方地盘需要打败该地盘所有敌人，越靠近中心的地盘资源越好。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.allServerBattleIntroduce.run = !1;
storage.setItem("allServerBattleIntroduce_" + o.player.id, 1);
});
}
},
worshipBattleIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("worshipBattleIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.WORSHIP_BATTLE && !a;
},
guide: function() {
var a = e("homeScene"), t = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
var n = a.instance.worshipBattleBt;
a.instance.scrollView.scrollToLeft(0);
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入<力之大会>。"));
h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
t.prototype.onMap6_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("<力之大会>是以单人形式对战的跨服争霸赛，需要派遣5个队伍上阵，分别从列强进至32、16、8、4、2直至决出冠军。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.worshipBattleIntroduce.run = !1;
storage.setItem("worshipBattleIntroduce_" + o.player.id, 1);
});
}
},
worshipBattleIntroduce2: {
test: function() {
var e = o.player.level, a = storage.getItem("worshipBattleIntroduce2_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.WORSHIP_BATTLE && !a;
},
guide: function() {
var a = e("homeScene"), t = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<力之大会>已开启，让我们去看看吧。"));
var t = a.instance.crossBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onCross_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里进入<力之大会>。"));
t.instance.scrollView.scrollToRight(0);
var a = t.instance.map6Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap6_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("<力之大会>是以单人形式对战的跨服争霸赛，需要派遣5个队伍上阵，分别从列强进至32、16、8、4、2直至决出冠军。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.worshipBattleIntroduce2.run = !1;
storage.setItem("worshipBattleIntroduce2_" + o.player.id, 1);
});
}
},
legendMapIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("legendMapIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.MAP_TYPE_6 && !a;
},
guide: function() {
var a = e("homeScene"), t = e("bmapScene"), r = e("mmapScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("已开启<传奇关卡>，点击这里进入。"));
var t = a.instance.battleBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onMap_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
var a = t.instance.typeBts[2].node;
h.instance.setTouchableTarget_(a, function() {
t.instance.onType_({
target: a
});
e();
});
}, function(e) {
var a = t.instance.mapLayout;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap_({
target: a
});
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("<传奇关卡>主要掉落伙伴碎片、紫色灵魂石、紫色灵魂石等。"));
h.instance.setTouchableTarget_(null, function() {
e();
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("点击这里挑战关卡。"));
var a = r.instance.latestMapBt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
r.instance.onMap_({
target: a
});
e();
});
} ], function() {
h.instance.close_();
m.legendMapIntroduce.run = !1;
storage.setItem("legendMapIntroduce_" + o.player.id, 1);
});
}
},
bossIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("bossIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.BOSS && !a;
},
guide: function() {
var a = e("homeScene"), t = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
var n = a.instance.bossBattleBt, r = a.instance.scrollView;
r.scrollToPercentHorizontal(n.x / r.content.width - .1);
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<全王试炼>。"));
h.instance.setTouchableTarget_(n, function() {
h.instance.close_();
t.prototype.onMap3_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("<全王试炼>是一种挑战世界BOSS的玩法，限定部分战士上阵，活动结束后根据伤害来进行排名结算。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.bossIntroduce.run = !1;
storage.setItem("bossIntroduce_" + o.player.id, 1);
});
}
},
bossIntroduce2: {
test: function() {
var e = o.player.level, a = storage.getItem("bossIntroduce2_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.BOSS && !a;
},
guide: function() {
var a = e("homeScene"), t = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<全王试炼>已开启，让我们去看看吧。"));
var t = a.instance.crossBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onCross_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<全王试炼>。"));
t.instance.scrollView.scrollToRight(0);
var a = t.instance.map3Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap3_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("<全王试炼>是一种挑战世界BOSS的玩法，限定部分战士上阵，活动结束后根据伤害来进行排名结算。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.bossIntroduce2.run = !1;
storage.setItem("bossIntroduce2_" + o.player.id, 1);
});
}
},
sixIntroduce: {
test: function() {
var e = o.player.level, a = storage.getItem("sixIntroduce_" + o.player.id) || !1;
return e == l.CONSTS.UNLOCK_LEVEL.SIX && !a && !r.isHideSix;
},
guide: function() {
var a = e("homeScene"), t = e("crossServerScene");
d.addGuideNode();
n.waterfall([ function(e) {
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<超神进阶>已开启，让我们去看看吧。"));
var t = a.instance.crossBt;
h.instance.setTouchableTarget_(t, function() {
h.instance.close_();
a.instance.onCross_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("点击这里进入<超神进阶>。"));
t.instance.scrollView.scrollToRight(0);
var a = t.instance.map5Bt;
h.instance.setTouchableTarget_(a, function() {
h.instance.close_();
t.instance.onMap5_();
m.waitNext = e;
});
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.RIGHT);
h.instance.say_(i.t("<维斯训练>可通过挂机训练获得源始复原药剂，同时可以扰乱其他玩家获得奖励。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<战神历练>每天可以使用指定战士挑战不同关卡，可获得大量红色、黑色品质的招式进阶材料。"));
h.instance.setTouchableTarget_(null, e);
}, function(e) {
d.addGuideNode();
h.instance.setSide_(h.SIDE.LEFT);
h.instance.say_(i.t("<宇宙冒险>是一种征战模式，闯关过程中生命值不会被重置，阵亡也无法复活，每战胜一个敌人就可以开启宝箱获得大量奖励。"));
h.instance.setTouchableTarget_(null, e);
} ], function() {
h.instance.close_();
m.sixIntroduce.run = !1;
storage.setItem("sixIntroduce_" + o.player.id, 1);
});
}
},
isEasy: !0,
run: function(a) {
if (!e("buildExt").isSkipGuide) {
null == m.isSkipGuide && (m.isSkipGuide = storage.getItem("skipGuide_" + o.player.id) || !1);
if (!m.isSkipGuide) {
for (var t in m) if (m[t].test && m[t].run) return;
for (var n in a) if (a[n].test() && !a[n].run) {
a[n].guide();
a[n].run = !0;
_setTimeout(function() {
d.closeByTag(d.TAG.UPGRADE_SHOW_PANEL);
d.closeByTag(d.TAG.DAILY_TASK_PANEL);
var a = e("homeScene");
a.instance && d.removePanel(a.instance.mainTaskPanel);
}, 0);
break;
}
}
}
},
close: function() {
for (var e in m) {
for (var a = 1; a < 20; a++) m[e]["guideNext" + a] && (m[e]["guideNext" + a] = null);
m[e].run && (m[e].run = !1);
}
h.instance && h.instance.close_();
delete m.isSkipGuide;
},
skip: function() {
this.close();
m.isSkipGuide = !0;
storage.setItem("skipGuide_" + o.player.id, 1);
},
callNext: function(e, a) {
if (m[e]) {
m[e][a] && m[e][a].apply(null, Array.prototype.slice.call(arguments, 2));
m[e][a] = null;
}
}
};
a.exports = m;
cc._RF.pop();
}, {
arena3v3Scene: "arena3v3Scene",
arenaScene: "arenaScene",
async: "async",
baseView: "baseView",
"battle.consts": "battle.consts",
"battle.fightHandler": "battle.fightHandler",
battleMain: "battleMain",
battleScene: "battleScene",
bmapScene: "bmapScene",
buildExt: "buildExt",
clientConfig: "clientConfig",
crossServerScene: "crossServerScene",
dailyBmapScene: "dailyBmapScene",
eqptScene: "eqptScene",
guideNode: "guideNode",
homeScene: "homeScene",
i18n: "i18n",
mmapScene: "mmapScene",
pointScene: "pointScene",
roleScene: "roleScene",
sceneManager: "sceneManager",
selectBattleRolesScene: "selectBattleRolesScene",
serverConfig: "serverConfig",
serverMain: "serverMain",
shopScene: "shopScene",
teamScene: "teamScene",
underscore: "underscore"
} ],
