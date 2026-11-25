unlockPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "1b22fjmHEFO6q/cD4nWsLDK", "unlockPanel");
var t = e("underscore"), n = (e("soundApi"), e("dataApi"), e("resource")), i = e("i18n"), r = e("helper"), s = e("baseView"), o = e("buildExt"), l = e("clientConfig"), c = e("serverMain"), d = (e("serverConfig"), 
cc.Class({
extends: cc.Component,
properties: {
iconSp: cc.Sprite,
nameLabel: cc.Label,
unlockLevelLabel: cc.Label,
descLabel: cc.Label
},
update_: function() {
var e = d.genData();
this.data = e;
s.setSpriteFrame(this.iconSp, n["misc_unlock_b_" + e.nextLockInfo.imgId + "_png"]);
this.nameLabel.string = e.nextLockInfo.name;
r.replaceLabel(this.unlockLevelLabel, [ e.nextLockInfo.level ]);
this.descLabel.string = e.nextLockInfo.desc;
}
}));
d.genData = function() {
var e = c.player, a = l.CONSTS.UNLOCK_LEVEL, n = [ {
level: a.MAP_TYPE_3,
name: i.t("战士历练"),
desc: i.t("可获得大量的金币和圣水"),
imgId: 1
}, {
level: a.MAP_TYPE_4,
name: i.t("战士进阶"),
desc: i.t("可获得招式进阶材料碎片"),
imgId: 2
}, {
level: a.EXPEDITION,
name: i.t("强者争霸"),
desc: i.t("可获得大量的金币和各类材料"),
imgId: 3
}, {
level: a.ENDLESS,
name: i.t("无尽蛇道"),
desc: i.t("可获得大量的宝石和金币"),
imgId: 4
}, {
level: a.EYE,
name: i.t("体能训练"),
desc: i.t("可获得大量的神币、宝石和金币"),
imgId: 5
}, {
level: a.TAIL,
name: i.t("拯救地球"),
desc: i.t("可获得大量的伙伴升级道具"),
imgId: 6
}, {
level: a.PRACTICE,
name: i.t("北界王特训"),
desc: i.t("可获得大量的金币、钻石和界王币"),
imgId: 8
}, {
level: a.PRESTIGE_BATTLE,
name: i.t("讨伐弗利萨"),
desc: i.t("可获得大量的声望币"),
imgId: 9
}, {
level: a.BOSS,
name: i.t("全王试炼"),
desc: i.t("可获得大量的神币、宝石"),
imgId: 11
}, {
level: a.ARENA_3V3,
name: i.t("沙鲁游戏"),
desc: i.t("可获得大量的武斗币"),
imgId: 13
} ];
o.isHideAllServerBattle || n.push({
level: a.All_SERVER_BATTLE,
name: i.t("全览大会"),
desc: i.t("可获得大量的声望币和宝石等"),
imgId: 10
});
o.isHideTeamBattle || n.push({
level: a.TEAM_BATTLE,
name: i.t("跨服宇宙战"),
desc: i.t("可获得大量的巅峰币、伙伴币、钻石"),
imgId: 14
});
o.isHideWorshipBattle || n.push({
level: a.WORSHIP_BATTLE,
name: i.t("力之大会"),
desc: i.t("可获得大量的巅峰币"),
imgId: 7
});
o.isHideSix || n.push({
level: a.SIX,
name: i.t("超神进阶"),
desc: i.t("可获得大量的暗黑招式进阶材料"),
imgId: 12
});
o.isHideDoubleBattle || n.push({
level: a.DOUBLE_BATTLE,
name: i.t("双龙争霸"),
desc: i.t("可获得大量龙珠币"),
imgId: 15
});
n = t.sortBy(n, "level");
var r = null;
for (var s in n) if (n[s].level > e.level) {
r = n[s];
break;
}
return r ? {
nextLockInfo: r
} : null;
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
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
underscore: "underscore"
} ],
