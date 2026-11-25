mailPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "35388FtH/VJEK8AJjnDaNxf", "mailPanel");
var t = e("underscore"), n = e("moment"), i = e("dataApi"), r = e("i18n"), s = (e("resource"), 
e("helper")), o = e("stringUtil"), l = e("baseView"), c = (e("soundApi"), e("buildExt")), d = (e("clientConfig"), 
e("serverConfig")), h = e("serverMain"), u = e("player"), m = e("itemItem"), g = e("roleItem"), p = e("arenaScene"), _ = (e("arenaHandler"), 
e("mailHandler")), k = d.MAIL.CONSTS.STATUS, f = cc.Class({
extends: cc.Component,
properties: {
mailScrollview: cc.Node,
mailItemsLayout: cc.Node,
mailItem: cc.Node,
noMailSp: cc.Node,
mailUnreadLabel: cc.Label,
mailUnreadSpriteFrame: cc.SpriteFrame,
mailReadSpriteFrame: cc.SpriteFrame,
mailViewPanel: cc.Node,
mailViewTitleLabel: cc.Label,
mailViewBodyLabel: cc.Label,
mailViewItemItem: cc.Node,
mailViewRoleItemNode: cc.Node,
mailViewItemsLayout: cc.Node,
mailViewReceiveBt: cc.Node,
mailViewReceiveBtLabel: cc.Label,
mailViewReplyBt: cc.Node,
mailViewPlayBt: cc.Node,
sendMailPanel: cc.Node,
sendMailPlayerNameLabel: cc.Label,
sendMailWordCountLabel: cc.Label,
sendMailContentEditbox: cc.EditBox
},
onLoad: function() {
this.mailScrollview.active = !1;
this.mailItem.active = !1;
this.mailViewItemItem.active = !1;
this.mailViewRoleItemNode.active = !1;
this.selectMailItemData = null;
this.sendMailPlayerId = null;
this.onFun = this.update_.bind(this);
h.player.on(u.EVENT.ATTRS, this.onFun);
this.scheduleOnce(function() {
s.scrollviewFadeIn(this.mailScrollview);
}, .3);
},
onDestroy: function() {
h.player.off(u.EVENT.ATTRS, this.onFun);
},
update_: function(e) {
if (t.include(e, "mail")) {
var a = f.genData();
this.data = a;
this.noMailSp.active = 0 == a.mailItems.length;
this.mailItemMap = this.mailItemMap || {};
l.preHideNodeMap(this.mailItemMap);
for (var n in a.mailItems) {
var i = this.mailItemMap[n];
if (!i) {
(i = cc.instantiate(this.mailItem)).parent = this.mailItemsLayout;
i.idx = n;
this.mailItemMap[n] = i;
}
i.active = !0;
l.markHideNode(i);
var o = a.mailItems[n];
i.data = o;
i.getChildByName("title_label").getComponent(cc.Label).string = o.title;
i.getChildByName("date_label").getComponent(cc.Label).string = o.sendDate;
i.getChildByName("sender_layout").getChildByName("name_label").getComponent(cc.Label).string = r.t(o.senderName);
i.getChildByName("icon_sp").getComponent(cc.Sprite).spriteFrame = o.isRead ? this.mailReadSpriteFrame : this.mailUnreadSpriteFrame;
}
l.hideNodeMap(this.mailItemMap);
s.replaceLabel(this.mailUnreadLabel, [ a.unreadCount ]);
this.mailScrollview.getComponent("listViewComponent").delayUpdate_(0);
}
},
onMailItem_: function(e) {
var a = e.target.data;
this.selectMailItemData = a;
if (!a.isRead && 0 == a.itemItems.length) {
l.addLoading();
_.read(a.id);
a.isRead = !0;
t.each(h.player.extra.mails, function(e) {
e._id == a.id && (e.status = k.READ);
});
h.player.emit(u.EVENT.ATTRS, [ "mail" ]);
}
l.addPanel(this.mailViewPanel, !0);
this.mailViewTitleLabel.string = a.title;
this.mailViewBodyLabel.string = a.body;
this.mailViewRoleItemNodeMap = this.mailViewRoleItemNodeMap || {};
l.preHideNodeMap(this.mailViewRoleItemNodeMap);
this.mailViewItemItemMap = this.mailViewItemItemMap || {};
l.preHideNodeMap(this.mailViewItemItemMap);
var n = 0, i = 0;
for (var s in a.itemItems) if (a.itemItems[s]._data.type == d.CONSTS.ENTITY_TYPE.ROLE) {
var o = this.mailViewRoleItemNodeMap[n];
if (!o) {
(o = cc.instantiate(this.mailViewRoleItemNode)).parent = this.mailViewItemsLayout;
o.idx = n;
this.mailViewRoleItemNodeMap[n] = o;
}
o.active = !0;
l.markHideNode(o);
o.getChildByName("role_item").getComponent("roleItem").update_(a.itemItems[s]);
n++;
} else {
var c = this.mailViewItemItemMap[i];
if (!c) {
(c = cc.instantiate(this.mailViewItemItem)).parent = this.mailViewItemsLayout;
c.idx = i;
this.mailViewItemItemMap[i] = c;
}
c.active = !0;
l.markHideNode(c);
c.getComponent("itemItem").setShowPanel_(!0);
c.getComponent("itemItem").update_(a.itemItems[s]);
i++;
}
l.hideNodeMap(this.mailViewRoleItemNodeMap);
l.hideNodeMap(this.mailViewItemItemMap);
this.mailViewReceiveBtLabel.string = a.isCanReceive ? r.t("领取") : r.t("确定");
this.mailViewPlayBt.active = !!a._mail.reportId;
this.mailViewPlayBt.data = {
reportId: a._mail.reportId
};
this.mailViewReplyBt.active = a._mail.senderId != d.MAIL.CONSTS.SYSTEM_ID;
this.mailViewReplyBt.data = {
playerName: a.senderName,
playerId: a._mail.senderId
};
this.mailViewPlayBt.active || this.mailViewReplyBt.active ? this.mailViewReceiveBt.x = -120 : this.mailViewReceiveBt.x = 0;
},
onReceiveAllMail_: function() {
var e = !1, a = !1;
t.each(h.player.extra.mails, function(t) {
if (t.status == k.UNREAD && t.dropList.length > 0) {
e = !0;
t.isSys && (a = !0);
}
});
if (e) {
l.addLoading();
_.receiveAll(a, function(e) {
t.each(h.player.extra.mails, function(e) {
e.status == k.UNREAD && e.dropList.length > 0 && (e.status = k.READ);
});
h.player.emit(u.EVENT.ATTRS, [ "mail" ]);
l.addRewardEffectPanel(e._temp.entityCountMap);
if (e.team) {
var a = t.values(e.team.roles);
for (var n in a) l.addPointRoleEffectNode(a[n]);
}
});
} else l.addHintPanel(r.t("没有可领取的邮件"));
},
onRemoveMail_: function() {
if (0 != t.where(h.player.extra.mails, {
status: k.READ
}).length) {
l.addLoading();
_.removeAllRead(function() {
var e = t.where(h.player.extra.mails, {
status: k.READ
}).length, a = r.t("删除了$1封邮件", [ e ]);
l.addHintPanel(a);
h.player.extra.mails = t.where(h.player.extra.mails, {
status: k.UNREAD
});
h.player.emit(u.EVENT.ATTRS, [ "mail" ]);
});
} else l.addHintPanel(r.t("删除了$1封邮件", [ 0 ]));
},
onReceiveMail_: function() {
var e = this, a = this.selectMailItemData;
if (a.isCanReceive) {
l.addLoading();
_.receive(a.id, a._mail.isSys, function(n) {
t.each(h.player.extra.mails, function(e) {
e._id == a.id && (e.status = k.READ);
});
h.player.emit(u.EVENT.ATTRS, [ "mail" ]);
l.removePanel(e.mailViewPanel);
l.addRewardEffectPanel(n._temp.entityCountMap);
if (n.team) {
var i = t.values(n.team.roles);
for (var r in i) l.addPointRoleEffectNode(i[r]);
}
});
} else l.removePanel(e.mailViewPanel);
},
onPlay_: p.prototype.onPlay_,
onSendMail_: function(e) {
var a = e.target.data;
l.addPanel(this.sendMailPanel, !0);
this.sendMailPlayerNameLabel.string = a.playerName;
this.sendMailPlayerId = a.playerId;
this.onSendMailContentEditboxChanged_();
},
onSendMailYes_: function() {
var e = this.sendMailContentEditbox.string;
if ("" != e) {
e = o.filter(e);
var a = this;
l.addLoading();
_.send(this.sendMailPlayerId, e, function() {
l.removePanel(a.sendMailPanel);
a.sendMailContentEditbox.string = "";
l.addHintPanel(r.t("已发送"));
});
} else l.addHintPanel(r.t("内容不能为空"));
},
onSendMailContentEditboxChanged_: function() {
var e = this.sendMailContentEditbox.maxLength - this.sendMailContentEditbox.string.length;
s.replaceLabel(this.sendMailWordCountLabel, [ e ]);
},
onClose_: function() {
l.removePanel(this.node);
}
});
f.genData = function() {
var e = h.player.extra.mails, a = [], r = 0;
for (var s in e) if (!c.isHideSysMail || !e[s].isSys) {
e[s].status == k.UNREAD && r++;
var o = [];
for (var l in e[s].dropList) {
var u = e[s].dropList[l];
i.findEntityById(u.entityId).type == d.CONSTS.ENTITY_TYPE.ROLE ? o.push(g.genData({
kindId: u.entityId,
star: u.extra ? u.extra.star : 1
})) : o.push(m.genData({
kindId: u.entityId,
count: u.count,
extra: u.extra
}, !0));
}
var p = e[s].status == k.READ, _ = {
id: e[s]._id,
isRead: p,
isCanReceive: e[s].dropList.length > 0 && !p,
title: e[s].title,
body: e[s].body,
itemItems: o,
senderName: e[s].senderName,
sendDate: n(new Date(h.tTime(e[s].ctime))).format("YYYY/M/D HH:mm"),
_mail: e[s]
};
a.push(_);
}
return {
unreadCount: r,
mailItems: a = t.sortBy(a, function(e) {
return e._mail.status == k.UNREAD ? -e._mail.ctime : e._mail.ctime;
})
};
};
cc._RF.pop();
}, {
arenaHandler: "arenaHandler",
arenaScene: "arenaScene",
baseView: "baseView",
buildExt: "buildExt",
clientConfig: "clientConfig",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
itemItem: "itemItem",
mailHandler: "mailHandler",
moment: "moment",
player: "player",
resource: "resource",
roleItem: "roleItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
soundApi: "soundApi",
stringUtil: "stringUtil",
underscore: "underscore"
} ],
