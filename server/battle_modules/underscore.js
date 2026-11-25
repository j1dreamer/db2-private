underscore: [ function(e, a, t) {
"use strict";
cc._RF.push(a, "472ceAhaBtHUqT2tUmdspME", "underscore");
(function() {
var e = this, n = e._, i = Array.prototype, r = Object.prototype, s = Function.prototype, o = i.push, l = i.slice, c = r.toString, d = r.hasOwnProperty, h = Array.isArray, u = Object.keys, m = s.bind, g = Object.create, p = function() {}, _ = function e(a) {
if (a instanceof e) return a;
if (!(this instanceof e)) return new e(a);
this._wrapped = a;
};
if ("undefined" != typeof t) {
"undefined" != typeof a && a.exports && (t = a.exports = _);
t._ = _;
} else e._ = _;
_.VERSION = "1.8.3";
var k = function(e, a, t) {
if (void 0 === a) return e;
switch (null == t ? 3 : t) {
case 1:
return function(t) {
return e.call(a, t);
};

case 2:
return function(t, n) {
return e.call(a, t, n);
};

case 3:
return function(t, n, i) {
return e.call(a, t, n, i);
};

case 4:
return function(t, n, i, r) {
return e.call(a, t, n, i, r);
};
}
return function() {
return e.apply(a, arguments);
};
}, f = function(e, a, t) {
return null == e ? _.identity : _.isFunction(e) ? k(e, a, t) : _.isObject(e) ? _.matcher(e) : _.property(e);
};
_.iteratee = function(e, a) {
return f(e, a, Infinity);
};
var y = function(e, a) {
return function(t) {
var n = arguments.length;
if (n < 2 || null == t) return t;
for (var i = 1; i < n; i++) for (var r = arguments[i], s = e(r), o = s.length, l = 0; l < o; l++) {
var c = s[l];
a && void 0 !== t[c] || (t[c] = r[c]);
}
return t;
};
}, b = function(e) {
if (!_.isObject(e)) return {};
if (g) return g(e);
p.prototype = e;
var a = new p();
p.prototype = null;
return a;
}, v = function(e) {
return function(a) {
return null == a ? void 0 : a[e];
};
}, S = Math.pow(2, 53) - 1, T = v("length"), M = function(e) {
var a = T(e);
return "number" == typeof a && a >= 0 && a <= S;
};
_.each = _.forEach = function(e, a, t) {
a = k(a, t);
var n, i;
if (M(e)) for (n = 0, i = e.length; n < i; n++) a(e[n], n, e); else {
var r = _.keys(e);
for (n = 0, i = r.length; n < i; n++) a(e[r[n]], r[n], e);
}
return e;
};
_.map = _.collect = function(e, a, t) {
a = f(a, t);
for (var n = !M(e) && _.keys(e), i = (n || e).length, r = Array(i), s = 0; s < i; s++) {
var o = n ? n[s] : s;
r[s] = a(e[o], o, e);
}
return r;
};
function $(e) {
function a(a, t, n, i, r, s) {
for (;r >= 0 && r < s; r += e) {
var o = i ? i[r] : r;
n = t(n, a[o], o, a);
}
return n;
}
return function(t, n, i, r) {
n = k(n, r, 4);
var s = !M(t) && _.keys(t), o = (s || t).length, l = e > 0 ? 0 : o - 1;
if (arguments.length < 3) {
i = t[s ? s[l] : l];
l += e;
}
return a(t, n, i, s, l, o);
};
}
_.reduce = _.foldl = _.inject = $(1);
_.reduceRight = _.foldr = $(-1);
_.find = _.detect = function(e, a, t) {
var n;
if (void 0 !== (n = M(e) ? _.findIndex(e, a, t) : _.findKey(e, a, t)) && -1 !== n) return e[n];
};
_.filter = _.select = function(e, a, t) {
var n = [];
a = f(a, t);
_.each(e, function(e, t, i) {
a(e, t, i) && n.push(e);
});
return n;
};
_.reject = function(e, a, t) {
return _.filter(e, _.negate(f(a)), t);
};
_.every = _.all = function(e, a, t) {
a = f(a, t);
for (var n = !M(e) && _.keys(e), i = (n || e).length, r = 0; r < i; r++) {
var s = n ? n[r] : r;
if (!a(e[s], s, e)) return !1;
}
return !0;
};
_.some = _.any = function(e, a, t) {
a = f(a, t);
for (var n = !M(e) && _.keys(e), i = (n || e).length, r = 0; r < i; r++) {
var s = n ? n[r] : r;
if (a(e[s], s, e)) return !0;
}
return !1;
};
_.contains = _.includes = _.include = function(e, a, t, n) {
M(e) || (e = _.values(e));
("number" != typeof t || n) && (t = 0);
return _.indexOf(e, a, t) >= 0;
};
_.invoke = function(e, a) {
var t = l.call(arguments, 2), n = _.isFunction(a);
return _.map(e, function(e) {
var i = n ? a : e[a];
return null == i ? i : i.apply(e, t);
});
};
_.pluck = function(e, a) {
return _.map(e, _.property(a));
};
_.where = function(e, a) {
return _.filter(e, _.matcher(a));
};
_.findWhere = function(e, a) {
return _.find(e, _.matcher(a));
};
_.max = function(e, a, t) {
var n, i, r = -Infinity, s = -Infinity;
if (null == a && null != e) for (var o = 0, l = (e = M(e) ? e : _.values(e)).length; o < l; o++) (n = e[o]) > r && (r = n); else {
a = f(a, t);
_.each(e, function(e, t, n) {
if ((i = a(e, t, n)) > s || -Infinity === i && -Infinity === r) {
r = e;
s = i;
}
});
}
return r;
};
_.min = function(e, a, t) {
var n, i, r = Infinity, s = Infinity;
if (null == a && null != e) for (var o = 0, l = (e = M(e) ? e : _.values(e)).length; o < l; o++) (n = e[o]) < r && (r = n); else {
a = f(a, t);
_.each(e, function(e, t, n) {
if ((i = a(e, t, n)) < s || Infinity === i && Infinity === r) {
r = e;
s = i;
}
});
}
return r;
};
_.shuffle = function(e) {
for (var a, t = M(e) ? e : _.values(e), n = t.length, i = Array(n), r = 0; r < n; r++) {
(a = _.random(0, r)) !== r && (i[r] = i[a]);
i[a] = t[r];
}
return i;
};
_.sample = function(e, a, t) {
if (null == a || t) {
M(e) || (e = _.values(e));
return e[_.random(e.length - 1)];
}
return _.shuffle(e).slice(0, Math.max(0, a));
};
_.sortBy = function(e, a, t) {
a = f(a, t);
return _.pluck(_.map(e, function(e, t, n) {
return {
value: e,
index: t,
criteria: a(e, t, n)
};
}).sort(function(e, a) {
var t = e.criteria, n = a.criteria;
if (t !== n) {
if (t > n || void 0 === t) return 1;
if (t < n || void 0 === n) return -1;
}
return e.index - a.index;
}), "value");
};
var I = function(e) {
return function(a, t, n) {
var i = {};
t = f(t, n);
_.each(a, function(n, r) {
var s = t(n, r, a);
e(i, n, s);
});
return i;
};
};
_.groupBy = I(function(e, a, t) {
_.has(e, t) ? e[t].push(a) : e[t] = [ a ];
});
_.indexBy = I(function(e, a, t) {
e[t] = a;
});
_.countBy = I(function(e, a, t) {
_.has(e, t) ? e[t]++ : e[t] = 1;
});
_.toArray = function(e) {
return e ? _.isArray(e) ? l.call(e) : M(e) ? _.map(e, _.identity) : _.values(e) : [];
};
_.size = function(e) {
return null == e ? 0 : M(e) ? e.length : _.keys(e).length;
};
_.partition = function(e, a, t) {
a = f(a, t);
var n = [], i = [];
_.each(e, function(e, t, r) {
(a(e, t, r) ? n : i).push(e);
});
return [ n, i ];
};
_.first = _.head = _.take = function(e, a, t) {
if (null != e) return null == a || t ? e[0] : _.initial(e, e.length - a);
};
_.initial = function(e, a, t) {
return l.call(e, 0, Math.max(0, e.length - (null == a || t ? 1 : a)));
};
_.last = function(e, a, t) {
if (null != e) return null == a || t ? e[e.length - 1] : _.rest(e, Math.max(0, e.length - a));
};
_.rest = _.tail = _.drop = function(e, a, t) {
return l.call(e, null == a || t ? 1 : a);
};
_.compact = function(e) {
return _.filter(e, _.identity);
};
var C = function e(a, t, n, i) {
for (var r = [], s = 0, o = i || 0, l = T(a); o < l; o++) {
var c = a[o];
if (M(c) && (_.isArray(c) || _.isArguments(c))) {
t || (c = e(c, t, n));
var d = 0, h = c.length;
r.length += h;
for (;d < h; ) r[s++] = c[d++];
} else n || (r[s++] = c);
}
return r;
};
_.flatten = function(e, a) {
return C(e, a, !1);
};
_.without = function(e) {
return _.difference(e, l.call(arguments, 1));
};
_.uniq = _.unique = function(e, a, t, n) {
if (!_.isBoolean(a)) {
n = t;
t = a;
a = !1;
}
null != t && (t = f(t, n));
for (var i = [], r = [], s = 0, o = T(e); s < o; s++) {
var l = e[s], c = t ? t(l, s, e) : l;
if (a) {
s && r === c || i.push(l);
r = c;
} else if (t) {
if (!_.contains(r, c)) {
r.push(c);
i.push(l);
}
} else _.contains(i, l) || i.push(l);
}
return i;
};
_.union = function() {
return _.uniq(C(arguments, !0, !0));
};
_.intersection = function(e) {
for (var a = [], t = arguments.length, n = 0, i = T(e); n < i; n++) {
var r = e[n];
if (!_.contains(a, r)) {
for (var s = 1; s < t && _.contains(arguments[s], r); s++) ;
s === t && a.push(r);
}
}
return a;
};
_.difference = function(e) {
var a = C(arguments, !0, !0, 1);
return _.filter(e, function(e) {
return !_.contains(a, e);
});
};
_.zip = function() {
return _.unzip(arguments);
};
_.unzip = function(e) {
for (var a = e && _.max(e, T).length || 0, t = Array(a), n = 0; n < a; n++) t[n] = _.pluck(e, n);
return t;
};
_.object = function(e, a) {
for (var t = {}, n = 0, i = T(e); n < i; n++) a ? t[e[n]] = a[n] : t[e[n][0]] = e[n][1];
return t;
};
function P(e) {
return function(a, t, n) {
t = f(t, n);
for (var i = T(a), r = e > 0 ? 0 : i - 1; r >= 0 && r < i; r += e) if (t(a[r], r, a)) return r;
return -1;
};
}
_.findIndex = P(1);
_.findLastIndex = P(-1);
_.sortedIndex = function(e, a, t, n) {
for (var i = (t = f(t, n, 1))(a), r = 0, s = T(e); r < s; ) {
var o = Math.floor((r + s) / 2);
t(e[o]) < i ? r = o + 1 : s = o;
}
return r;
};
function D(e, a, t) {
return function(n, i, r) {
var s = 0, o = T(n);
if ("number" == typeof r) e > 0 ? s = r >= 0 ? r : Math.max(r + o, s) : o = r >= 0 ? Math.min(r + 1, o) : r + o + 1; else if (t && r && o) return n[r = t(n, i)] === i ? r : -1;
if (i != i) return (r = a(l.call(n, s, o), _.isNaN)) >= 0 ? r + s : -1;
for (r = e > 0 ? s : o - 1; r >= 0 && r < o; r += e) if (n[r] === i) return r;
return -1;
};
}
_.indexOf = D(1, _.findIndex, _.sortedIndex);
_.lastIndexOf = D(-1, _.findLastIndex);
_.range = function(e, a, t) {
if (null == a) {
a = e || 0;
e = 0;
}
t = t || 1;
for (var n = Math.max(Math.ceil((a - e) / t), 0), i = Array(n), r = 0; r < n; r++,
e += t) i[r] = e;
return i;
};
var N = function(e, a, t, n, i) {
if (!(n instanceof a)) return e.apply(t, i);
var r = b(e.prototype), s = e.apply(r, i);
return _.isObject(s) ? s : r;
};
_.bind = function(e, a) {
if (m && e.bind === m) return m.apply(e, l.call(arguments, 1));
if (!_.isFunction(e)) throw new TypeError("Bind must be called on a function");
var t = l.call(arguments, 2), n = function n() {
return N(e, n, a, this, t.concat(l.call(arguments)));
};
return n;
};
_.partial = function(e) {
var a = l.call(arguments, 1), t = function t() {
for (var n = 0, i = a.length, r = Array(i), s = 0; s < i; s++) r[s] = a[s] === _ ? arguments[n++] : a[s];
for (;n < arguments.length; ) r.push(arguments[n++]);
return N(e, t, this, this, r);
};
return t;
};
_.bindAll = function(e) {
var a, t, n = arguments.length;
if (n <= 1) throw new Error("bindAll must be passed function names");
for (a = 1; a < n; a++) e[t = arguments[a]] = _.bind(e[t], e);
return e;
};
_.memoize = function(e, a) {
var t = function t(n) {
var i = t.cache, r = "" + (a ? a.apply(this, arguments) : n);
_.has(i, r) || (i[r] = e.apply(this, arguments));
return i[r];
};
t.cache = {};
return t;
};
_.delay = function(e, a) {
var t = l.call(arguments, 2);
return setTimeout(function() {
return e.apply(null, t);
}, a);
};
_.defer = _.partial(_.delay, _, 1);
_.throttle = function(e, a, t) {
var n, i, r, s = null, o = 0;
t || (t = {});
var l = function() {
o = !1 === t.leading ? 0 : _.now();
s = null;
r = e.apply(n, i);
s || (n = i = null);
};
return function() {
var c = _.now();
o || !1 !== t.leading || (o = c);
var d = a - (c - o);
n = this;
i = arguments;
if (d <= 0 || d > a) {
if (s) {
clearTimeout(s);
s = null;
}
o = c;
r = e.apply(n, i);
s || (n = i = null);
} else s || !1 === t.trailing || (s = setTimeout(l, d));
return r;
};
};
_.debounce = function(e, a, t) {
var n, i, r, s, o, l = function l() {
var c = _.now() - s;
if (c < a && c >= 0) n = setTimeout(l, a - c); else {
n = null;
if (!t) {
o = e.apply(r, i);
n || (r = i = null);
}
}
};
return function() {
r = this;
i = arguments;
s = _.now();
var c = t && !n;
n || (n = setTimeout(l, a));
if (c) {
o = e.apply(r, i);
r = i = null;
}
return o;
};
};
_.wrap = function(e, a) {
return _.partial(a, e);
};
_.negate = function(e) {
return function() {
return !e.apply(this, arguments);
};
};
_.compose = function() {
var e = arguments, a = e.length - 1;
return function() {
for (var t = a, n = e[a].apply(this, arguments); t--; ) n = e[t].call(this, n);
return n;
};
};
_.after = function(e, a) {
return function() {
if (--e < 1) return a.apply(this, arguments);
};
};
_.before = function(e, a) {
var t;
return function() {
--e > 0 && (t = a.apply(this, arguments));
e <= 1 && (a = null);
return t;
};
};
_.once = _.partial(_.before, 2);
var A = !{
toString: null
}.propertyIsEnumerable("toString"), L = [ "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString" ];
function E(e, a) {
var t = L.length, n = e.constructor, i = _.isFunction(n) && n.prototype || r, s = "constructor";
_.has(e, s) && !_.contains(a, s) && a.push(s);
for (;t--; ) (s = L[t]) in e && e[s] !== i[s] && !_.contains(a, s) && a.push(s);
}
_.keys = function(e) {
if (!_.isObject(e)) return [];
if (u) return u(e);
var a = [];
for (var t in e) _.has(e, t) && a.push(t);
A && E(e, a);
return a;
};
_.allKeys = function(e) {
if (!_.isObject(e)) return [];
var a = [];
for (var t in e) a.push(t);
A && E(e, a);
return a;
};
_.values = function(e) {
for (var a = _.keys(e), t = a.length, n = Array(t), i = 0; i < t; i++) n[i] = e[a[i]];
return n;
};
_.mapObject = function(e, a, t) {
a = f(a, t);
for (var n, i = _.keys(e), r = i.length, s = {}, o = 0; o < r; o++) s[n = i[o]] = a(e[n], n, e);
return s;
};
_.pairs = function(e) {
for (var a = _.keys(e), t = a.length, n = Array(t), i = 0; i < t; i++) n[i] = [ a[i], e[a[i]] ];
return n;
};
_.invert = function(e) {
for (var a = {}, t = _.keys(e), n = 0, i = t.length; n < i; n++) a[e[t[n]]] = t[n];
return a;
};
_.functions = _.methods = function(e) {
var a = [];
for (var t in e) _.isFunction(e[t]) && a.push(t);
return a.sort();
};
_.extend = y(_.allKeys);
_.extendOwn = _.assign = y(_.keys);
_.findKey = function(e, a, t) {
a = f(a, t);
for (var n, i = _.keys(e), r = 0, s = i.length; r < s; r++) if (a(e[n = i[r]], n, e)) return n;
};
_.pick = function(e, a, t) {
var n, i, r = {}, s = e;
if (null == s) return r;
if (_.isFunction(a)) {
i = _.allKeys(s);
n = k(a, t);
} else {
i = C(arguments, !1, !1, 1);
n = function(e, a, t) {
return a in t;
};
s = Object(s);
}
for (var o = 0, l = i.length; o < l; o++) {
var c = i[o], d = s[c];
n(d, c, s) && (r[c] = d);
}
return r;
};
_.omit = function(e, a, t) {
if (_.isFunction(a)) a = _.negate(a); else {
var n = _.map(C(arguments, !1, !1, 1), String);
a = function(e, a) {
return !_.contains(n, a);
};
}
return _.pick(e, a, t);
};
_.defaults = y(_.allKeys, !0);
_.create = function(e, a) {
var t = b(e);
a && _.extendOwn(t, a);
return t;
};
_.clone = function(e) {
return _.isObject(e) ? _.isArray(e) ? e.slice() : _.extend({}, e) : e;
};
_.tap = function(e, a) {
a(e);
return e;
};
_.isMatch = function(e, a) {
var t = _.keys(a), n = t.length;
if (null == e) return !n;
for (var i = Object(e), r = 0; r < n; r++) {
var s = t[r];
if (a[s] !== i[s] || !(s in i)) return !1;
}
return !0;
};
var B = function e(a, t, n, i) {
if (a === t) return 0 !== a || 1 / a == 1 / t;
if (null == a || null == t) return a === t;
a instanceof _ && (a = a._wrapped);
t instanceof _ && (t = t._wrapped);
var r = c.call(a);
if (r !== c.call(t)) return !1;
switch (r) {
case "[object RegExp]":
case "[object String]":
return "" + a == "" + t;

case "[object Number]":
return +a != +a ? +t != +t : 0 == +a ? 1 / +a == 1 / t : +a == +t;

case "[object Date]":
case "[object Boolean]":
return +a == +t;
}
var s = "[object Array]" === r;
if (!s) {
if ("object" != typeof a || "object" != typeof t) return !1;
var o = a.constructor, l = t.constructor;
if (o !== l && !(_.isFunction(o) && o instanceof o && _.isFunction(l) && l instanceof l) && "constructor" in a && "constructor" in t) return !1;
}
i = i || [];
for (var d = (n = n || []).length; d--; ) if (n[d] === a) return i[d] === t;
n.push(a);
i.push(t);
if (s) {
if ((d = a.length) !== t.length) return !1;
for (;d--; ) if (!e(a[d], t[d], n, i)) return !1;
} else {
var h, u = _.keys(a);
d = u.length;
if (_.keys(t).length !== d) return !1;
for (;d--; ) {
h = u[d];
if (!_.has(t, h) || !e(a[h], t[h], n, i)) return !1;
}
}
n.pop();
i.pop();
return !0;
};
_.isEqual = function(e, a) {
return B(e, a);
};
_.isEmpty = function(e) {
return null == e || (M(e) && (_.isArray(e) || _.isString(e) || _.isArguments(e)) ? 0 === e.length : 0 === _.keys(e).length);
};
_.isElement = function(e) {
return !(!e || 1 !== e.nodeType);
};
_.isArray = h || function(e) {
return "[object Array]" === c.call(e);
};
_.isObject = function(e) {
var a = typeof e;
return "function" === a || "object" === a && !!e;
};
_.each([ "Arguments", "Function", "String", "Number", "Date", "RegExp", "Error" ], function(e) {
_["is" + e] = function(a) {
return c.call(a) === "[object " + e + "]";
};
});
_.isArguments(arguments) || (_.isArguments = function(e) {
return _.has(e, "callee");
});
"function" != typeof /./ && "object" != typeof Int8Array && (_.isFunction = function(e) {
return "function" == typeof e || !1;
});
_.isFinite = function(e) {
return isFinite(e) && !isNaN(parseFloat(e));
};
_.isNaN = function(e) {
return _.isNumber(e) && e !== +e;
};
_.isBoolean = function(e) {
return !0 === e || !1 === e || "[object Boolean]" === c.call(e);
};
_.isNull = function(e) {
return null === e;
};
_.isUndefined = function(e) {
return void 0 === e;
};
_.has = function(e, a) {
return null != e && d.call(e, a);
};
_.noConflict = function() {
e._ = n;
return this;
};
_.identity = function(e) {
return e;
};
_.constant = function(e) {
return function() {
return e;
};
};
_.noop = function() {};
_.property = v;
_.propertyOf = function(e) {
return null == e ? function() {} : function(a) {
return e[a];
};
};
_.matcher = _.matches = function(e) {
e = _.extendOwn({}, e);
return function(a) {
return _.isMatch(a, e);
};
};
_.times = function(e, a, t) {
var n = Array(Math.max(0, e));
a = k(a, t, 1);
for (var i = 0; i < e; i++) n[i] = a(i);
return n;
};
_.random = function(e, a) {
if (null == a) {
a = e;
e = 0;
}
return e + Math.floor(Math.random() * (a - e + 1));
};
_.now = Date.now || function() {
return new Date().getTime();
};
var w = {
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
'"': "&quot;",
"'": "&#x27;",
"`": "&#x60;"
}, G = _.invert(w), R = function(e) {
var a = function(a) {
return e[a];
}, t = "(?:" + _.keys(e).join("|") + ")", n = RegExp(t), i = RegExp(t, "g");
return function(e) {
e = null == e ? "" : "" + e;
return n.test(e) ? e.replace(i, a) : e;
};
};
_.escape = R(w);
_.unescape = R(G);
_.result = function(e, a, t) {
var n = null == e ? void 0 : e[a];
void 0 === n && (n = t);
return _.isFunction(n) ? n.call(e) : n;
};
var H = 0;
_.uniqueId = function(e) {
var a = ++H + "";
return e ? e + a : a;
};
_.templateSettings = {
evaluate: /<%([\s\S]+?)%>/g,
interpolate: /<%=([\s\S]+?)%>/g,
escape: /<%-([\s\S]+?)%>/g
};
var x = /(.)^/, K = {
"'": "'",
"\\": "\\",
"\r": "r",
"\n": "n",
"\u2028": "u2028",
"\u2029": "u2029"
}, F = /\\|'|\r|\n|\u2028|\u2029/g, V = function(e) {
return "\\" + K[e];
};
_.template = function(e, a, t) {
!a && t && (a = t);
a = _.defaults({}, a, _.templateSettings);
var n = RegExp([ (a.escape || x).source, (a.interpolate || x).source, (a.evaluate || x).source ].join("|") + "|$", "g"), i = 0, r = "__p+='";
e.replace(n, function(a, t, n, s, o) {
r += e.slice(i, o).replace(F, V);
i = o + a.length;
t ? r += "'+\n((__t=(" + t + "))==null?'':_.escape(__t))+\n'" : n ? r += "'+\n((__t=(" + n + "))==null?'':__t)+\n'" : s && (r += "';\n" + s + "\n__p+='");
return a;
});
r += "';\n";
a.variable || (r = "with(obj||{}){\n" + r + "}\n");
r = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + r + "return __p;\n";
try {
var s = new Function(a.variable || "obj", "_", r);
} catch (e) {
e.source = r;
throw e;
}
var o = function(e) {
return s.call(this, e, _);
}, l = a.variable || "obj";
o.source = "function(" + l + "){\n" + r + "}";
return o;
};
_.chain = function(e) {
var a = _(e);
a._chain = !0;
return a;
};
var O = function(e, a) {
return e._chain ? _(a).chain() : a;
};
_.mixin = function(e) {
_.each(_.functions(e), function(a) {
var t = _[a] = e[a];
_.prototype[a] = function() {
var e = [ this._wrapped ];
o.apply(e, arguments);
return O(this, t.apply(_, e));
};
});
};
_.mixin(_);
_.each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(e) {
var a = i[e];
_.prototype[e] = function() {
var t = this._wrapped;
a.apply(t, arguments);
"shift" !== e && "splice" !== e || 0 !== t.length || delete t[0];
return O(this, t);
};
});
_.each([ "concat", "join", "slice" ], function(e) {
var a = i[e];
_.prototype[e] = function() {
return O(this, a.apply(this._wrapped, arguments));
};
});
_.prototype.value = function() {
return this._wrapped;
};
_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
_.prototype.toString = function() {
return "" + this._wrapped;
};
"function" == typeof define && define.amd && define("underscore", [], function() {
return _;
});
}).call(t);
cc._RF.pop();
}, {} ],
