helper: [ function(e, a) {
"use strict";
cc._RF.push(a, "b1c58Iejv5Jc6fSOEbsnfMh", "helper");
var t = e("underscore"), n = (e("async"), e("i18n")), i = e("resource"), r = {};
a.exports = r;
cc.macro.ENABLE_NATIVE_TTF_RENDERER = !1;
r.initWindowTimeFun = function() {
window._windowTimeIntervalId = 1;
window._windowTimeFunHash = {};
window._protectedIntervalHash = {};
window.WindowTimeFun = function(e, a) {
this._code = null;
this._intervalId = 0;
this._intervalId = _windowTimeIntervalId++;
this._code = e;
this._isTimeOut = a;
};
window.WindowTimeFun.prototype.fun = function(e) {
if (this._code) {
var a = this._code;
"string" == typeof a ? Function(a)() : "function" == typeof a && a.apply(null, this._args ? this._args.push(1e3 * e) : [ 1e3 * e ]);
this._isTimeOut && delete window._windowTimeFunHash[this._intervalId];
}
};
window._setTimeout = function(e, a) {
var t = new WindowTimeFun(e, !0);
arguments.length > 2 && (t._args = Array.prototype.slice.call(arguments, 2));
var n = t.fun;
t.fun = function() {
n.apply(this, arguments);
_clearTimeout(t._intervalId);
};
cc.director.getScheduler().enableForTarget(t);
cc.director.getScheduler().schedule(t.fun, t, a / 1e3, 0, 0, !1);
_windowTimeFunHash[t._intervalId] = t;
return t._intervalId;
};
window._setInterval = function(e, a) {
var t = new WindowTimeFun(e);
arguments.length > 2 && (t._args = Array.prototype.slice.call(arguments, 2));
cc.director.getScheduler().enableForTarget(t);
cc.director.getScheduler().schedule(t.fun, t, a / 1e3, !1);
_windowTimeFunHash[t._intervalId] = t;
return t._intervalId;
};
window._clearInterval = function(e) {
var a = _windowTimeFunHash[e];
if (a) {
cc.director.getScheduler().unschedule(a.fun, a);
delete _windowTimeFunHash[e];
}
};
window._clearTimeout = window._clearInterval;
window._clearAllTimeout = function() {
for (var e in _windowTimeFunHash) window._protectedIntervalHash[e] || window._clearInterval(e);
};
window._addProtectedIntervalId = function(e) {
window._protectedIntervalHash[e] = !0;
};
};
r.formatDuration = function() {
return t.map(arguments, function(e) {
return (e |= 0) < 10 ? "0" + e : e;
}).join(":");
};
r.floatStrip = function(e) {
return parseFloat(e.toPrecision(12));
};
r.clone = function(e) {
return JSON.parse(JSON.stringify(e));
};
r.replaceLabel = function(e, a) {
e.tmpString_ = e.tmpString_ || e.string;
a = a || [];
for (var t = n.t(e.tmpString_), i = 0; i < a.length; i++) t = t.replace("$" + (i + 1), a[i]);
e.string = t;
};
r.pauseNode = function(e) {
var a = e.children;
for (var t in a) a[t] && r.pauseNode(a[t]);
e.pauseAllActions();
};
r.resumeNode = function(e) {
var a = e.children;
for (var t in a) a[t] && r.resumeNode(a[t]);
e.resumeAllActions();
};
r.updateArmatureSpeed = function(e) {
var a, t = e.children;
for (var n in t) t[n] && r.updateArmatureSpeed(t[n]);
(a = e.getComponent("characterArmatureComponent")) && a.updateSpeedScale_();
(a = e.getComponent("effectArmatureComponent")) && a.updateSpeedScale_();
(a = e.getComponent("buffArmatureComponent")) && a.updateSpeedScale_();
};
r.updateLayout = function(e) {
var a = e.children;
for (var t in a) a[t] && r.updateLayout(a[t]);
var n = e.getComponents(cc.Layout);
for (var t in n) n[t].updateLayout();
};
r.autoScroll = function(e, a, n) {
a = a || 20;
var i = (n = n || !1) ? -1 : 1, r = t.sortBy(e.children, function(e) {
return e.x * i;
}), s = r[0].width;
cc.tween(e).repeatForever(cc.tween().by(s / a, {
position: cc.v2(-s * i, 0)
}).call(function() {
var e = r.shift();
e.x = t.last(r).x + s * i;
r.push(e);
})).start();
};
r.sendErrorTime = 0;
r.sendError = function(a) {
if (Date.now() - r.sendErrorTime < 3e4) console.log(Date.now()); else {
var t = e("serverMain"), n = e("querystring"), i = e("http");
try {
var s = n.stringify({
msg: a,
playerId: t.player ? t.player.id : 0
});
a && "" != a && i.request(t.url + "/user/reportClientError", s);
} catch (e) {}
r.sendErrorTime = Date.now();
}
};
r.scrollviewFadeIn = function(e) {
e.active = !0;
e.opacity = 0;
cc.Tween.stopAllByTarget(e);
cc.tween(e).to(.2, {
opacity: 255
}).start();
e._y = e._y || e.y;
e.y = e._y;
e.y -= 20;
cc.tween(e).by(.2, {
position: cc.v2(0, 20)
}).start();
var a = e.getComponent("listViewComponent");
a && a.scheduleOnce(function() {
a.onScroll_();
});
};
r.delayShow = function(e) {
e.opacity = 0;
cc.tween(e).to(0, {
opacity: 255
}).start();
};
r.scaleEffect = function(e) {
cc.Tween.stopAllByTarget(e);
e.preScale = e.preScale || e.scale;
cc.tween(e).to(.1, {
scale: 1.3 * e.preScale
}).to(.2, {
scale: e.preScale
}).start();
};
r.spineEffect = function(e, a, n) {
e.active = !0;
e.getComponent(sp.Skeleton).setAnimation(0, a || "action", !1);
e.getComponent(sp.Skeleton).setCompleteListener(function() {
e.getComponent(sp.Skeleton).setCompleteListener(null);
n || (e.active = !1);
n && t.isFunction(n) && n(e);
});
};
r.setReview = function() {
if (cc.sys.isNative) {
var e = jsb.fileUtils.getSearchPaths();
e.splice(0, 0, "ext/");
e.splice(0, 0, jsb.fileUtils.getWritablePath() + "obb/ext/");
e = t.uniq(e);
jsb.fileUtils.setSearchPaths(e);
}
};
r.setMini = function() {
if (cc.sys.isNative) {
var e = jsb.fileUtils.getSearchPaths();
e.splice(0, 0, "mini/");
e = t.uniq(e);
jsb.fileUtils.setSearchPaths(e);
storage.setItem("setMini", 1);
}
};
r.setLanguagePath = function() {
var a = e("buildExt");
if (cc.sys.isNative && a.initLanguage && a.defaultLanguage != a.initLanguage) {
var n = jsb.fileUtils.getSearchPaths(), i = jsb.fileUtils.getWritablePath() + "language/" + a.defaultLanguage + "/";
n.splice(0, 0, i);
n = t.uniq(n);
jsb.fileUtils.setSearchPaths(n);
}
};
r.loadSomeRes = function() {
cc.resources.load(i.misc_role_big_group_2_png);
cc.resources.load(i.misc_role_big_group_3_png);
cc.resources.load(i.misc_role_big_group_4_png);
};
r.updateProjectManifest = function(a, t, i) {
if (cc.sys.isNative) {
var r = JSON.parse(jsb.fileUtils.getStringFromFile("version.manifest"));
if (r.host != a || r.path != t) {
e("language").en = {
"正在检查版本...": "Verifying version...",
"正在更新资料包: $1%": "Updating resource pack: $1%",
"更新失败：加载更新列表失败": "Update failed: Failed to load update list",
"已经是最新版": "Latest version installed",
"更新失败：下载失败": "Update failed: Download failed"
};
n.init("en");
r.host = a;
r.path = t;
r.version = i;
r.packageUrl = "http://" + a + t + "/" + r.version;
r.remoteManifestUrl = "http://" + a + t + "/project.manifest";
r.remoteVersionUrl = "http://" + a + t + "/version.manifest";
var s = jsb.fileUtils.getWritablePath() + "download/project.manifest";
jsb.fileUtils.writeStringToFile(JSON.stringify(r, null, 4), s);
}
}
};
r.downloadFiles = function(e, a) {
var t = new jsb.Downloader(), n = e.length, i = 0, r = 0;
t.setOnFileTaskSuccess(function(e) {
++i == n && r > 0 ? a(!0) : a(null, e.requestURL);
});
t.setOnTaskProgress(function() {
console.log("downloading...");
});
t.setOnTaskError(function() {
console.log("download error!");
r++;
++i == n && a(!0);
});
var s = jsb.fileUtils.getWritablePath();
for (var o in e) {
var l = cc.path.basename(e[o]), c = e[o].replace(/http?:\/\/([^/]+)/, ""), d = c.replace(l, "");
jsb.fileUtils.createDirectory(s + d);
t.createDownloadFileTask(e[o], s + c);
}
};
r.removeHideData = function(a, t) {
var n = e("dataApi"), r = [];
for (var s in a) {
var o = n.role.findBy("classId", a[s]);
r = r.concat(o);
delete i["armatures_character_" + a[s] + "$_skel"];
delete i["team_role_" + a[s] + "_png"];
delete i["friendship_" + a[s] + "_png"];
var l = n.soul.findBy("classId", a[s]);
r = r.concat(l);
}
for (var s in t) {
var c = n.ship.findOneBy("classId", t[s]);
r.push(c);
delete i["armatures_ship_" + t[s] + "$_skel"];
delete i["ship_" + t[s] + "_png"];
var d = n.findEntityById(c.fragmentId);
r.push(d);
}
var h = [ "kindName", "desc", "spDesc", "imgId", "skillIds" ];
for (var s in r) for (var u in h) null != r[s][h[u]] && (r[s][h[u]] = 0);
};
window.require = window.require || e;
cc._RF.pop();
}, {
async: "async",
buildExt: "buildExt",
dataApi: "dataApi",
http: "http",
i18n: "i18n",
language: "language",
querystring: "querystring",
resource: "resource",
serverMain: "serverMain",
underscore: "underscore"
} ],
