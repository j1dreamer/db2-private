friendPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "e6dd0yWOKRIZrwRZ31mP3AR", "friendPanel");
var t = e("underscore"), n = e("buildExt"), i = e("moment"), r = (e("dataApi"), 
e("i18n")), s = e("helper"), o = e("baseView"), l = (e("clientConfig"), e("serverConfig")), c = e("serverMain"), d = e("player"), h = (e("itemItem"), 
e("playerItem")), u = e("homeScene"), m = e("viewBattleTeamPanel"), g = e("arenaHandler"), p = e("friendHandler"), _ = l.FRIEND.CONSTS, k = cc.Class({
extends: cc.Component,
properties: {
friendScrollview: cc.Node,
friendItemsLayout: cc.Node,
friendItem: cc.Node,
receiveTimesLabel: cc.Label,
friendCountLabel: cc.Label,
friendPointLabel: cc.Label,
exchangeCountLabel: cc.Label,
addFriendBt: cc.Node,
addFriendPanel: cc.Node,
addFriendRecommendBt: cc.Button,
addFriendPendingBt: cc.Button,
addFriendIdEditbox: cc.EditBox,
addFriendScrollview: cc.Node,
addFriendItemsLayout: cc.Node,
addFriendItem: cc.Node,
addFriendPendingScrollview: cc.Node,
addFriendPendingItemsLayout: cc.Node,
addFriendPendingItem: cc.Node,
addFriendRefreshBt: cc.Node,
viewFriendPanel: cc.Node
},
onLoad: function() {
this.friendScrollview.active = !1;
this.friendItem.active = !1;
this.onFun = this.update_.bind(this);
c.player.on(d.EVENT.ATTRS, this.onFun);
this.scheduleOnce(function() {
s.scrollviewFadeIn(this.friendScrollview);
}, .2);
},
onDestroy: function() {
c.player.off(d.EVENT.ATTRS, this.onFun);
},
update_: function(e) {
if (t.include(e, "friend")) {
var a = k.genData();
this.data = a;
this.friendItemMap = this.friendItemMap || {};
o.preHideNodeMap(this.friendItemMap);
for (var n in a.friendItems) {
var l = this.friendItemMap[n];
if (!l) {
(l = cc.instantiate(this.friendItem)).parent = this.friendItemsLayout;
l.idx = n;
this.friendItemMap[n] = l;
}
l.active = !0;
o.markHideNode(l);
var d = a.friendItems[n];
l.data = d;
var u = l.getChildByName("time_label");
u.active = !d.isOnline;
u.getComponent(cc.Label).string = r.t("$1在线", [ i(c.tTime(d.atime)).from(Date._now()) ]);
l.getChildByName("online_label").active = d.isOnline;
var m = l.getChildByName("player_item_layout");
m.getChildByName("player_item").getComponent("playerItem").update_(h.genData(d.playerPhotoInfo));
m.getChildByName("name_label").getComponent(cc.Label).string = d.playerName;
m.getChildByName("level_label").getComponent(cc.Label).string = r.t("LV.$1", [ d.playerLevel ]);
m.getChildByName("server_label").getComponent(cc.Label).string = r.t("$1区", [ d.serverId ]);
var g = l.getChildByName("receive_bt"), p = l.getChildByName("give_bt"), f = l.getChildByName("receive_sp"), y = l.getChildByName("give_sp");
g.active = d.friendInfo.giftStatus == _.GIFT_STATUS.CAN_RECEIVE;
p.active = !d.friendInfo.isGived;
g.data = p.data = {
playerId: d.playerId
};
f.active = d.friendInfo.giftStatus == _.GIFT_STATUS.RECEIVED;
y.active = !p.active;
}
o.hideNodeMap(this.friendItemMap);
s.replaceLabel(this.receiveTimesLabel, [ a.canReceiveCount, a.maxReceiveCount ]);
s.replaceLabel(this.friendCountLabel, [ a.friendCount, _.MAX_COUNT ]);
this.friendPointLabel.string = a.friendPoint;
this.exchangeCountLabel.string = a.ticketCount;
o.setMark(this.addFriendBt, a.isNeedMark);
o.setMark(this.addFriendPendingBt.node, a.isNeedMark);
}
},
onClose_: function() {
o.removePanel(this.node);
},
onFriendItem_: function(e) {
var a = e.target.data;
this.selectFriendItemData = a;
o.addPanel(this.viewFriendPanel, !0);
var t = this.viewFriendPanel.getChildByName("player_item_layout");
t.getChildByName("player_item").getComponent("playerItem").update_(h.genData(a.playerPhotoInfo));
t.getChildByName("name_label").getComponent(cc.Label).string = a.playerName;
var i = t.getChildByName("level_label").getComponent(cc.Label);
s.replaceLabel(i, [ a.playerLevel ]);
var r = t.getChildByName("server_label").getComponent(cc.Label);
s.replaceLabel(r, [ a.serverId ]);
var l = this.viewFriendPanel.getChildByName("bts_layout"), c = l.getChildByName("send_mail_bt"), d = l.getChildByName("pk_bt");
c.active = !n.isHideFriendMail;
c.data = d.data = {
playerName: a.playerName,
playerId: a.playerId
};
},
onReceive_: function(e) {
var a = e.target.data;
o.addLoading();
p.receiveGift(a.playerId);
},
onGive_: function(e) {
var a = e.target.data || this.selectFriendItemData;
o.addLoading();
p.giveGift(a.playerId);
},
onGiveAndReceiveGiftAll_: function() {
o.addLoading();
p.giveAndReceiveGiftAll();
},
onExchangeTicket_: function() {
o.addLoading();
p.exchangeTicket(function(e) {
o.addRewardEffectPanel(e._temp.entityCountMap);
});
},
onPk_: function(e) {
var a = e.target.data;
o.addLoading();
g.defenseTeam(a.playerId, !0, function(e) {
o.addViewBattleTeamPanel(e._temp.defenseTeam, {
battleType: m.BATTLE_TYPE.FRIEND,
defenderId: a.playerId
});
});
},
onRemoveFriend_: function() {
var e = this;
o.addLoading();
p.removeFriend(this.selectFriendItemData.playerId, function() {
o.removePanel(e.viewFriendPanel);
e.selectFriendItemData = null;
u.instance.onFriend_();
});
},
onAddFriend_: function() {
o.addPanel(this.addFriendPanel);
this.addFriendScrollview.active = !1;
this.addFriendItem.active = !1;
this.addFriendPendingScrollview.active = !1;
this.addFriendPendingItem.active = !1;
this.addFriendRefreshBt.active = !1;
this.addFriendRecommendBt.interactable = !0;
this.addFriendPendingBt.interactable = !0;
this.onRecommend_();
},
onCloseAddFriend_: function() {
o.removePanel(this.addFriendPanel);
u.instance.onFriend_();
},
onRecommend_: function(e, a) {
this.addFriendPendingScrollview.active = !1;
this.addFriendRefreshBt.active = !0;
this.addFriendRecommendBt.interactable = !1;
this.addFriendPendingBt.interactable = !0;
var t = this, n = function(e) {
t.addFriendScrollview.active || t.scheduleOnce(function() {
s.scrollviewFadeIn(this.addFriendScrollview);
}, 0);
t.addFriendItemMap = t.addFriendItemMap || {};
o.preHideNodeMap(t.addFriendItemMap);
for (var a in e) {
var n = t.addFriendItemMap[a];
if (!n) {
(n = cc.instantiate(t.addFriendItem)).parent = t.addFriendItemsLayout;
n.idx = a;
t.addFriendItemMap[a] = n;
}
n.active = !0;
o.markHideNode(n);
var r = e[a];
n.data = r;
var l = n.getChildByName("time_label");
l.active = !r.isOnline;
s.replaceLabel(l.getComponent(cc.Label), [ i(c.tTime(r.atime)).from(Date._now()) ]);
n.getChildByName("online_label").active = r.isOnline;
var d = n.getChildByName("player_item_layout");
d.getChildByName("player_item").getComponent("playerItem").update_(h.genData(r.playerPhotoInfo));
d.getChildByName("name_label").getComponent(cc.Label).string = r.playerName;
var u = d.getChildByName("level_label").getComponent(cc.Label);
s.replaceLabel(u, [ r.playerLevel ]);
var m = d.getChildByName("server_label").getComponent(cc.Label);
s.replaceLabel(m, [ r.serverId ]);
n.getChildByName("add_friend_bt").data = {
playerId: r.playerId
};
}
o.hideNodeMap(t.addFriendItemMap);
};
if (a) n(a); else {
o.addLoading();
p.recommendList(function(e) {
n(e._temp.list);
});
}
},
onAddFriendAdd_: function(e) {
var a = e.target.data;
o.addLoading();
p.requestAddFriend(a.playerId, function() {
o.addHintPanel(r.t("已发送请求"));
});
},
onAddFriendSearch_: function() {
var e = this.addFriendIdEditbox.string;
if ("" != e) {
e.length > this.addFriendIdEditbox.maxLength && (e = e.slice(0, this.addFriendIdEditbox.maxLength));
var a = this;
o.addLoading();
p.findTarget(e, function(e) {
a.onRecommend_(null, e._temp.list);
a.addFriendIdEditbox.string = "";
});
} else o.addHintPanel(r.t("内容不能为空"));
},
onPending_: function() {
this.addFriendScrollview.active = !1;
this.addFriendRefreshBt.active = !1;
this.addFriendRecommendBt.interactable = !0;
this.addFriendPendingBt.interactable = !1;
var e = this;
o.addLoading();
p.requestAddFriendList(function(a) {
e.addFriendPendingScrollview.active || e.scheduleOnce(function() {
s.scrollviewFadeIn(this.addFriendPendingScrollview);
}, 0);
e.addFriendPendingItemMap = e.addFriendPendingItemMap || {};
o.preHideNodeMap(e.addFriendPendingItemMap);
for (var t in a._temp.list) {
var n = e.addFriendPendingItemMap[t];
if (!n) {
(n = cc.instantiate(e.addFriendPendingItem)).parent = e.addFriendPendingItemsLayout;
n.idx = t;
e.addFriendPendingItemMap[t] = n;
}
n.active = !0;
o.markHideNode(n);
var l = a._temp.list[t];
n.data = l;
var d = n.getChildByName("time_label");
d.active = !l.isOnline;
s.replaceLabel(d.getComponent(cc.Label), [ i(c.tTime(l.atime)).from(Date._now()) ]);
n.getChildByName("online_label").active = l.isOnline;
var u = n.getChildByName("player_item_layout");
u.getChildByName("player_item").getComponent("playerItem").update_(h.genData(l.playerPhotoInfo));
u.getChildByName("name_label").getComponent(cc.Label).string = l.playerName;
u.getChildByName("level_label").getComponent(cc.Label).string = r.t("LV.$1", [ l.playerLevel ]);
u.getChildByName("server_label").getComponent(cc.Label).string = r.t("$1区", [ l.serverId ]);
var m = n.getChildByName("refuse_bt"), g = n.getChildByName("accept_bt");
m.data = g.data = {
playerId: l.playerId
};
}
o.hideNodeMap(e.addFriendPendingItemMap);
});
},
onAddFriendRefuse_: function(e) {
var a = e.target, t = a.data;
o.addLoading();
p.refuseAddFriend(t.playerId, function() {
a.parent.active = !1;
});
},
onAddFriendAccept_: function(e) {
var a = e.target, t = a.data;
o.addLoading();
p.acceptAddFriend(t.playerId, function() {
a.parent.active = !1;
});
}
});
k.genData = function() {
var e = c.player.friend.list || [], a = c.player.friend, n = _.CAN_RECEIVE_TIMES, i = n - a.pointReceiveTimes, r = !!t.findWhere(t.values(a.infoMap), {
status: _.STATUS.PENDING
});
for (var s in e) a.infoMap[e[s].playerId] && (e[s].friendInfo = a.infoMap[e[s].playerId]);
e = t.sortBy(e, function(e) {
return e.isOnline ? -999999999999 : -e.atime / 1e11;
});
var o = Math.floor(a.point / _.POINT_TICKET_RATIO);
return {
canReceiveCount: i,
maxReceiveCount: n,
friendCount: a.count,
friendPoint: a.point,
ticketCount: o,
friendItems: e,
isNeedMark: r
};
};
cc._RF.pop();
}, {
arenaHandler: "arenaHandler",
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
friendHandler: "friendHandler",
helper: "helper",
homeScene: "homeScene",
i18n: "i18n",
itemItem: "itemItem",
moment: "moment",
player: "player",
playerItem: "playerItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
underscore: "underscore",
viewBattleTeamPanel: "viewBattleTeamPanel"
} ],
