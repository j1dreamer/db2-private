sdkApi: [ function(e, a) {
"use strict";
cc._RF.push(a, "28fb2w/bhFCtY90fIVkktKK", "sdkApi");
var t = e("underscore"), n = e("querystring"), i = e("md5"), r = e("buildExt"), s = e("http"), o = e("i18n"), l = e("cryptoApi"), c = e("serverMain"), d = e("baseView"), h = {
packageInfo: null,
tokenInfo: null,
sdkName: null,
channel: null,
iapPrefix: null,
preTopUpMoney: null,
preTopUpGoodsId: null,
dev: !1,
isCheckObb: !1,
next: null,
isLowRam: !1,
init: function() {
if (cc.sys.isNative) {
if (cc.sys.os == cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "initPackageInfo", "()V"); else if (cc.sys.os == cc.sys.OS_IOS) jsb.reflection.callStaticMethod("SDKAdapter", "initPackageInfo"); else if (cc.sys.os == cc.sys.OS_OSX) {
h.sdkName = "mmx";
h.channel = "mac";
}
} else {
h.sdkName = r.sdkName || "mmx";
h.channel = "web";
}
h.isLowRam = h.memory && h.memory < 1024;
h.isHighRam = h.memory && h.memory >= 5e3 && cc.sys.isNative;
cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function(e) {
e.keyCode == cc.macro.KEY.back && cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID && jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "backPressed", "()V");
}, this);
h.iosPayVerify();
},
verifyToken: function(a) {
var t = e("loginScene");
if ("mmx" != h.sdkName) {
a.sdkName = h.sdkName;
var r = n.stringify(a), u = function(e) {
d.removeLoading();
if (e.userName) {
var a = i(e.userName + "|J$V46-DL52}abP`1Fy{T#O{s:,RzQup");
c.loginInfo = {
userName: e.userName,
from: h.sdkName,
channel: h.channel,
password: a,
accountId: e.accountId,
age: e.age
};
t.instance && t.instance.showServerInfo_();
} else d.addMessageBox(o.t("登陆校验失败，请重新登陆"), function() {
h.logout();
}, null, h, !0, !0);
};
d.addLoading();
var m = e("buildExt").iosUrlInfo;
if (m) {
l.genPassword(m.key);
var g = m.verifyToken + "/" + l.base64ToUrl(l.encrypt(r));
s.request(g, null, function(e) {
e = JSON.parse(l.decrypt(e, !0));
u(e);
}, null, null, "GET");
} else {
g = c.url + "/sdk/verifyToken";
s.request(g, r, u);
}
h.tokenInfo = a;
} else t.instance.showServerInfo_();
},
_getProductId: function(e) {
if (!e) return "0";
var a = c.player.extra.goodsList;
e = a[e].pid ? a[e].pid : e;
var t = h.packageInfo ? h.packageInfo.split("-")[0] : "", n = (h.iapPrefix || t + ".goods_") + e;
return r.productIdMap ? r.productIdMap[e] : n;
},
pay: function(e, a, n, s) {
var o = c.player, l = String(Date.now() + "-" + e + "-" + o.serverId + "-" + o.id), d = t.findWhere(c.serverInfo.serverList, {
oldServerId: o.oldServerId
}), u = d ? d.name : o.oldServerId;
this.payInfo = {
goodsId: String(e),
price: String(a),
goodsName: String(n),
goodsGem: String(s),
userId: String(o.userId),
serverId: String(o.serverId),
serverName: String(u),
playerId: String(o.id),
playerName: String(o.name),
playerLevel: String(o.level),
playerGem: String(o.gem),
playerCtime: String(o.ctime),
playerUpgradeTime: String(o.upgradeTime),
vipLevel: String(o.vip.level),
guildName: String(o.guildName || ""),
ctime: Date.now(),
ext: l
};
c.loginInfo && (this.payInfo.accountId = String(c.loginInfo.accountId));
this.payInfo.productId = h._getProductId(e);
switch (h.sdkName) {
case "x7sy":
this.payInfo.price += ".00";
var m, g = {
game_area: this.payInfo.serverId,
game_guid: c.loginInfo.accountId,
game_orderid: this.payInfo.ext,
game_price: this.payInfo.price,
subject: this.payInfo.goodsName
}, p = t.keys(g).sort(), _ = "";
for (var k in p) _ += p[k] + "=" + g[p[k]] + "&";
_ = _.slice(0, _.length - 1);
"Android" == h.channel ? m = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDHxSt5dtnsTfzJQwkUb/Et2ijNmIIPx7WCDLdyKNw6RobGy3TZ36uYCHpeGHY6Jf6k2NbE1o+JaLx8Zdt30j2cLt9rYUVG+Kfhm66DL8sgWRBdpK8Th/JU5ypj87p0uzcVxhplQcVqb0Eb5oPmvuZ4M5FNVLIe1cA7GPexoyFUQIDAQAB" : "iOS" == h.channel && (m = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBLLS/shxxTVO+xT8scM9YLnHYWJvcxFIRgvtZbFFw70F7iZbwof0meqTXsAmaQjaUqebY+/U4mQGmQmPMMK+7qcbxWBZ1fJKRP93z6kiCh6GsDud5/pO1t7Cseg8aoRxmgzGtMUcFg7FCOnHccyWHfmiMqXxXx8tLmyzHIsYORQIDAQAB");
_ += m;
this.payInfo.sdkSign = i(_);
}
pomelo.ignoreTimeout = !0;
cc.sys.isNative ? cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "pay", "(Ljava/lang/String;)V", JSON.stringify(this.payInfo)) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("SDKAdapter", "pay:", JSON.stringify(this.payInfo)) : r.pay && r.pay(this.payInfo);
},
iosPayVerify: function(e) {
var a = storage.getItem("iosPayVerifyDataMap");
a = storage.getItem("iosPayVerifyDataMap") ? JSON.parse(a) : {};
if (e) {
var t = n.stringify({
receipt: e,
playerId: c.player.id,
serverId: c.player.serverId
});
a[Date.now()] = t;
storage.setItem("iosPayVerifyDataMap", JSON.stringify(a));
}
var i = c.url + "/sdk/payNotice/apple";
for (var r in a) s.request(i, t, function() {
delete a[this.time];
storage.setItem("iosPayVerifyDataMap", JSON.stringify(a));
}.bind({
time: r
}));
},
login: function() {
"mmx" != h.sdkName ? cc.sys.isNative ? cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "login", "()V") : cc.sys.os == cc.sys.OS_IOS ? jsb.reflection.callStaticMethod("SDKAdapter", "login") : cc.sys.os == cc.sys.OS_OSX && e("loginScene").instance.showLoginPanel_() : r.login && r.login() : e("loginScene").instance.showLoginPanel_();
},
logout: function() {
"mmx" != h.sdkName ? cc.sys.isNative ? cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "logout", "()V") : cc.sys.os == cc.sys.OS_IOS ? jsb.reflection.callStaticMethod("SDKAdapter", "logout") : cc.sys.os == cc.sys.OS_OSX && h.logoutCallBack() : r.logout && r.logout() : h.logoutCallBack();
},
delAccount: function() {
cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("SDKAdapter", "delAccount");
},
center: function() {
cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "center", "()V") : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("SDKAdapter", "center");
},
requestPermissions: function() {
cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "requestPermissions", "()V") : (cc.sys.os, 
cc.sys.OS_IOS);
},
requestPermissionsNext: function() {
e("loginScene").instance.initAssetsManager_();
},
support: function() {
cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "support", "()V") : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("SDKAdapter", "support");
},
EMIT_TYPE: {
HOT_UPDATE_BEGIN: 1,
HOT_UPDATE_END: 2,
CREATE_PLAYER: 3,
LOGIN: 4,
GUIDE_BEGIN: 5,
GUIDE_END: 6,
UPGRADE_PLAYER: 7,
TOP_UP: 8,
EXIT: 9,
REGISTER_ACCOUNT: 10,
LOGIC_ACTION: 11,
PASS_SMAP: 12,
UPGRADE_VIP: 13,
COST_GEM: 14,
SELECT_SERVER: 15,
DIY: 16,
BEGIN_TOP_UP: 17
},
emitData: function(e, a, n) {
if (!r.isNoEmit || e == h.EMIT_TYPE.LOGIN) {
a = a ? String(a) : null;
n = n ? String(n) : null;
var i = c.player, s = i ? {
serverId: String(i.serverId),
playerId: String(i.id),
playerName: String(i.name),
playerLevel: String(i.level),
playerGem: String(i.gem),
playerCoin: String(i.coin),
playerCtime: String(i.ctime),
playerUpgradeTime: String(i.upgradeTime),
playerExperience: String(i.experience),
vipLevel: String(i.vip.level),
power: String(i.power),
guildId: String(i.guildId),
guildName: String(i.guildName || ""),
topUpMoney: String(i.vip.topUpMoney),
preVipLevel: String(h.preVipLevel || 0),
preTopUpMoney: String(h.preTopUpMoney || 0),
preTopUpGoodsId: String(h.preTopUpGoodsId || 0),
preTopUpProductId: h._getProductId(h.preTopUpGoodsId || 0),
route: String(h.route || ""),
costGem: String(h.costGem || 0),
type: e,
ext: a,
ext2: n
} : {
type: e,
ext: a
};
c.loginInfo && (s.accountId = String(c.loginInfo.accountId));
if (!i && c.serverInfo) {
var o = (l = t.findWhere(c.serverInfo.serverList, {
oldServerId: Number(a)
})) ? l.name : a;
s.serverId = a;
s.serverName = o;
}
if (i && c.serverInfo) {
var l;
o = (l = t.findWhere(c.serverInfo.serverList, {
oldServerId: i.oldServerId
})) ? l.name : i.oldServerId;
s.serverName = o;
}
if (i && h.preTopUpGoodsId) {
var d = i.extra.goodsList[h.preTopUpGoodsId];
s.preTopUpPrice = String(d.price);
s.preTopUpGem = String(d.gem);
s.preTopUpPid = d.pid;
s.preTopUpGoodsName = d.name;
s.preGetPoint = h.preGetPoint;
t.isString(s.preTopUpProductId) && (s.preTopUpProductId = d.pid);
}
cc.sys.isNative ? cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "emitData", "(Ljava/lang/String;)V", JSON.stringify(s)) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("SDKAdapter", "emitData:", JSON.stringify(s)) : r.emitData && r.emitData(s);
}
},
logoutCallBack: function() {
var a = e("socket"), t = e("guide"), n = e("sceneManager");
t.close();
c.uid = null;
a.disconnect();
c.loginInfo = null;
c.player && c.player.destroy();
n.popToLoginScene();
},
delAccountCallBack: function(a) {
d.addLoading();
var t = n.stringify({
userName: c.loginInfo.userName,
jsonStr: a
}), i = e("buildExt").iosUrlInfo;
if (i) {
l.genPassword(i.key);
var r = i.delAccount + "/" + l.base64ToUrl(l.encrypt(t));
s.request(r, null, function() {
h.logout();
}, null, null, "GET");
} else {
r = c.url + "/sdk/delAccount";
s.request(r, t, function() {
h.logout();
});
}
},
andoirdBackPressed: function() {
d.addMessageBox(o.t("是否退出游戏?"), function() {
cc.game.end();
}, null, null, !0, !1);
},
checkPlayLimitJob: function() {
this.checkPlayLimitInterval && clearInterval(this.checkPlayLimitInterval);
this.checkPlayLimitInterval = setInterval(function() {
c.checkPlayLimit(c.uid, function(e) {
d.removeLoading();
500 == e.code && d.addMessageBox(e.msg, function() {
cc.game.end();
}, null, null, !0, !0);
});
}, 6e4);
},
requestIdfa: function(a) {
var t = a ? "check" : "request";
if (cc.sys.os == cc.sys.OS_IOS) {
jsb.reflection.callStaticMethod("SDKAdapter", "permissionIDFA:", t);
"request" == t && setTimeout(function() {
var a = e("homeScene").instance;
a && a.idfaBt.active && h.completeIdfa();
}, 2e3);
}
},
closeIdfa: function() {
r.idfaGift = null;
var a = e("homeScene").instance;
if (a) {
var t = a.idfaPanel;
t.active && d.removePanel(t);
a.idfaBt.active = !1;
}
},
completeIdfa: function() {
if (!t.include(c.player.useTaskCodes, r.idfaGift.code)) {
var a = e("playerHandler");
d.addLoading();
a.useGiftCode(r.idfaGift.code, function(e) {
d.addRewardEffectPanel(e._temp.entityCountMap);
h.closeIdfa();
});
}
},
showActivity: function(e) {
cc.sys.isNative && (cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "showActivity", "(Ljava/lang/String;)V", JSON.stringify(e)) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("SDKAdapter", "showActivity:", JSON.stringify(e)));
}
};
window.sdkApi = h;
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
cryptoApi: "cryptoApi",
guide: "guide",
homeScene: "homeScene",
http: "http",
i18n: "i18n",
loginScene: "loginScene",
md5: "md5",
playerHandler: "playerHandler",
querystring: "querystring",
sceneManager: "sceneManager",
serverMain: "serverMain",
socket: "socket",
underscore: "underscore"
} ],
