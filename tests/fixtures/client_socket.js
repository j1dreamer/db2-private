socket: [ function(e, a) {
"use strict";
cc._RF.push(a, "c163ccDzTJO9rqUDAu6MjoM", "socket");
var t = e("pomeloClient"), n = e("util"), i = e("zipUtils"), r = e("serverConfig"), s = e("underscore"), o = e("buildExt"), l = a.exports;
l.isConnected = !1;
l.receiveCb = null;
l.code = {
OK: 200,
FAIL: 500
};
l.queue = [];
l.requestTime = null;
l.timeOut = 10;
setInterval(function() {
if (l.requestTime && Date.now() - l.requestTime > 1e3 * l.timeOut) {
l.disconnect();
l.requestTime = null;
t.emit("close");
}
}, 1e3);
l.log = function() {
var e, a = 1, t = arguments, n = t.length;
if (2 == n) {
var i = "object" == typeof t[0] ? JSON.stringify(t[0], null, 2) : t[0], r = "object" == typeof t[1] ? JSON.stringify(t[1], null, 2) : t[1];
e = "route: " + i + ", msg: " + r;
} else {
e = "object" == typeof t[0] ? JSON.stringify(t[0], null, 2) : t[0];
for (var s = t[a]; a < n; s = t[++a]) e += null === s || "object" != typeof s ? " " + s : " " + JSON.stringify(s, null, 2);
}
console.log(e);
};
l.decodeData = function(e, a) {
var t = {
"connector.playerHandler.entry": [ "player" ],
"connector.playerHandler.createPlayer": [ "player" ]
};
for (var r in t) if (e == r) {
o = t[r];
for (var s = 0; s < o.length; s++) a[o[s]] && (a[o[s]] = JSON.parse(n.utf8to16(i.unzipBase64(a[o[s]]))));
}
if (a._temp && a._temp._decodeKeys) {
var o = a._temp._decodeKeys;
for (s = 0; s < o.length; s++) a._temp[o[s]] && (a._temp[o[s]] = JSON.parse(n.utf8to16(i.unzipBase64(a._temp[o[s]]))));
}
return a;
};
l._init = function(e, a, n, i) {
l.isConnectingGate = !0;
t.init({
host: e,
port: a,
log: !0
}, function() {
var e = "gate.gateHandler.queryEntry";
t.request(e, {
uid: n
}, function(a) {
l.log(e, a);
t.disconnect();
i(a);
});
});
};
l.setReceiveCb = function(e) {
this.receiveCb = e;
};
l.connect = function(e, a, n, i, s, c, d) {
var h = d || null;
l._init(e, a, n, function(e) {
var a = o.iosUrlInfo ? o.iosUrlInfo.connectorHost : e.host, n = o.iosUrlInfo ? o.iosUrlInfo.connectorPort : e.port;
a = o.urlData ? o.urlData.connectorHost : a;
n = o.urlData ? o.urlData.connectorPort : n;
t.init({
host: a,
port: n,
log: !0
}, function() {
var e = "connector.entryHandler.entry", a = {
token: i,
serverId: s,
oldServerId: c
};
r.FUNS.resMsgFilter(a);
t.request(e, a, function(a) {
l.log(e, a);
r.FUNS.reqMsgFilter(a);
l.isConnected = !0;
h && h();
});
});
});
};
l._request = function(e, a, n) {
t.request(e, a, function(a) {
l.requestTime = null;
l.log("receive res:");
r.FUNS.reqMsgFilter(a);
a = l.decodeData(e, a);
l.log(e, a);
l.receiveCb && l.receiveCb(a);
try {
a.code != l.code.FAIL && n(a);
} catch (e) {
if (!cc.sys.isNative) throw e;
}
l.queue.shift();
if (l.queue.length > 0) {
var t = l.queue[0];
l._request(t.route, t.msg, t.cb);
}
});
l.requestTime = Date.now();
};
l.request = function(e, a, t) {
l.log("send req:");
r.FUNS.resMsgFilter(a);
l.log(e, a);
l.queue.push({
route: e,
msg: a,
cb: t
});
1 == l.queue.length && l._request(e, a, t);
o.lastRequestTime = Date.now();
};
l.on = function(e, a) {
var o = function(t) {
s.include([ "onSync", "onRewardPop", "onNewMail" ], e) && r.FUNS.reqMsgFilter(t);
s.include([ "onSyncZip", "onUpdatePrestigeBattleCreateTeamInfo", "onUpdateTeamBattleCreateTeamInfo" ], e) && (t = JSON.parse(n.utf8to16(i.unzipBase64(t))));
l.log(e + ": " + JSON.stringify(t, null, 2));
a(t);
};
t.on(e, o);
return o;
};
l.off = t.off.bind(t);
l.disconnect = function() {
t.disconnect();
};
t.on("io-error", function(e) {
l.log("connect error", JSON.stringify(e));
});
t.on("heartbeat timeout", function() {
l.log("heartbeat timeout");
});
t.on("onKick", function(e) {
l.log("onKick", JSON.stringify(e));
});
t.on("close", function(e) {
l.log("close", JSON.stringify(e));
});
cc._RF.pop();
}, {
buildExt: "buildExt",
pomeloClient: "pomeloClient",
serverConfig: "serverConfig",
underscore: "underscore",
util: "util",
zipUtils: "zipUtils"
} ],
