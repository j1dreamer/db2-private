emitter: [ function(e, a) {
"use strict";
cc._RF.push(a, "04f13lNtLNHnaNwcftS4SCv", "emitter");
a.exports = t;
function t(e) {
if (e) return n(e);
}
function n(e) {
for (var a in t.prototype) e[a] = t.prototype[a];
return e;
}
t.prototype.on = t.prototype.addEventListener = function(e, a) {
this._callbacks = this._callbacks || {};
(this._callbacks[e] = this._callbacks[e] || []).push(a);
return this;
};
t.prototype.once = function(e, a) {
var t = this;
this._callbacks = this._callbacks || {};
function n() {
t.off(e, n);
a.apply(this, arguments);
}
n.fn = a;
this.on(e, n);
return this;
};
t.prototype.off = t.prototype.removeListener = t.prototype.removeAllListeners = t.prototype.removeEventListener = function(e, a) {
this._callbacks = this._callbacks || {};
if (0 == arguments.length) {
this._callbacks = {};
return this;
}
var t, n = this._callbacks[e];
if (!n) return this;
if (1 == arguments.length) {
delete this._callbacks[e];
return this;
}
for (var i = 0; i < n.length; i++) if ((t = n[i]) === a || t.fn === a) {
n.splice(i, 1);
break;
}
return this;
};
t.prototype.emit = function(e) {
this._callbacks = this._callbacks || {};
var a = [].slice.call(arguments, 1), t = this._callbacks[e];
if (t) for (var n = 0, i = (t = t.slice(0)).length; n < i; ++n) t[n].apply(this, a);
return this;
};
t.prototype.listeners = function(e) {
this._callbacks = this._callbacks || {};
return this._callbacks[e] || [];
};
t.prototype.hasListeners = function(e) {
return !!this.listeners(e).length;
};
cc._RF.pop();
}, {} ],
