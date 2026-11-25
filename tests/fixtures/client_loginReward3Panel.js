loginReward3Panel: [ function(e, a) {
"use strict";
cc._RF.push(a, "93569rFU9VER4L1MFDIbupE", "loginReward3Panel");
var t = e("underscore"), n = (e("underscore.string"), e("moment"), e("soundApi"), 
e("dataApi"), e("resource"), e("i18n")), i = (e("guide"), e("helper")), r = e("baseView"), s = (e("clientConfig"), 
e("serverConfig")), o = e("serverMain"), l = e("player"), c = (e("skillItem"), e("roleItem"), 
e("itemItem"), e("buildExt"), e("playerHandler")), d = s.ACTIVITY.CONSTS, h = cc.Class({
extends: cc.Component,
properties: {
receiveBt: cc.Node,
countLabel: cc.Label
},
update_: function() {
var e = h.genData();
this.data = e;
i.replaceLabel(this.countLabel, [ e.rewardCount ]);
},
show_: function() {
r.addPanel(this.node);
this.update_();
},
onClose_: function() {
r.removePanel(this.node);
o.player.emit(l.EVENT.ATTRS, []);
},
onReceive_: function() {
if (this.data.isNeedOpen) r.addHintPanel(n.t("开服第$1天可领取", [ this.data.receiveNeedOpenDays ])); else if (this.data.isCanReceive) {
var e = this;
r.addLoading();
c.receiveActivityAward([ this.data.activityName ], [ this.data.rewardIdx ], function(a) {
r.addRewardEffectPanel(a._temp.entityCountMap);
e.update_();
e.onClose_();
});
} else r.addHintPanel(n.t("今日已领取，请明天再来"));
}
});
h.genData = function() {
var e = o.player, a = e.activity.map.login_2;
if (!a || a.isSuccess) return null;
var n = a.rewards[0].dropList[0].count, i = e.extra.openDays < a.receiveNeedOpenDays, r = !!t.findWhere(a.rewards, {
status: d.STATUS.CAN_RECEIVE
});
return {
activityName: a.name,
rewardIdx: 0,
rewardCount: n,
isNeedOpen: i,
receiveNeedOpenDays: a.receiveNeedOpenDays,
isCanReceive: r,
isNeedMark: r && !i
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
guide: "guide",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerHandler: "playerHandler",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
skillItem: "skillItem",
soundApi: "soundApi",
underscore: "underscore",
"underscore.string": "underscore.string"
} ],
