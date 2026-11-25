"underscore.string": [ function(e, a, t) {
(function(e) {
"use strict";
cc._RF.push(a, "659f2TUSZ9LgbK6s/uNsTPe", "underscore.string");
(function(n) {
"object" == typeof t && "undefined" != typeof a ? a.exports = n() : "function" == typeof define && define.amd ? define([], n) : ("undefined" != typeof window ? window : "undefined" != typeof e ? e : "undefined" != typeof self ? self : this).s = n();
})(function() {
return function e(a, t, n) {
function i(s, o) {
if (!t[s]) {
if (!a[s]) {
var l = "function" == typeof require_ && require_;
if (!o && l) return l(s, !0);
if (r) return r(s, !0);
var c = new Error("Cannot find module '" + s + "'");
throw c.code = "MODULE_NOT_FOUND", c;
}
var d = t[s] = {
exports: {}
};
a[s][0].call(d.exports, function(e) {
return i(a[s][1][e] || e);
}, d, d.exports, e, a, t, n);
}
return t[s].exports;
}
for (var r = "function" == typeof require_ && require_, s = 0; s < n.length; s++) i(n[s]);
return i;
}({
1: [ function(e, a) {
var t = e("./trim"), n = e("./decapitalize");
a.exports = function(e, a) {
e = t(e).replace(/[-_\s]+(.)?/g, function(e, a) {
return a ? a.toUpperCase() : "";
});
return !0 === a ? n(e) : e;
};
}, {
"./decapitalize": 10,
"./trim": 65
} ],
2: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
e = t(e);
var n = a ? e.slice(1).toLowerCase() : e.slice(1);
return e.charAt(0).toUpperCase() + n;
};
}, {
"./helper/makeString": 20
} ],
3: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e) {
return t(e).split("");
};
}, {
"./helper/makeString": 20
} ],
4: [ function(e, a) {
a.exports = function(e, a) {
if (null == e) return [];
e = String(e);
return (a = ~~a) > 0 ? e.match(new RegExp(".{1," + a + "}", "g")) : [ e ];
};
}, {} ],
5: [ function(e, a) {
var t = e("./capitalize"), n = e("./camelize"), i = e("./helper/makeString");
a.exports = function(e) {
e = i(e);
return t(n(e.replace(/[\W_]/g, " ")).replace(/\s/g, ""));
};
}, {
"./camelize": 1,
"./capitalize": 2,
"./helper/makeString": 20
} ],
6: [ function(e, a) {
var t = e("./trim");
a.exports = function(e) {
return t(e).replace(/\s\s+/g, " ");
};
}, {
"./trim": 65
} ],
7: [ function(e, a) {
var t = e("./helper/makeString"), n = "ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșşšŝťțţŭùúüűûñÿýçżźž", i = "aaaaaaaaaccceeeeeghiiiijllnnoooooooossssstttuuuuuunyyczzz";
n += n.toUpperCase();
i = (i += i.toUpperCase()).split("");
n += "ß";
i.push("ss");
a.exports = function(e) {
return t(e).replace(/.{1}/g, function(e) {
var a = n.indexOf(e);
return -1 === a ? e : i[a];
});
};
}, {
"./helper/makeString": 20
} ],
8: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
e = t(e);
a = t(a);
return 0 === e.length || 0 === a.length ? 0 : e.split(a).length - 1;
};
}, {
"./helper/makeString": 20
} ],
9: [ function(e, a) {
var t = e("./trim");
a.exports = function(e) {
return t(e).replace(/([A-Z])/g, "-$1").replace(/[-_\s]+/g, "-").toLowerCase();
};
}, {
"./trim": 65
} ],
10: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e) {
return (e = t(e)).charAt(0).toLowerCase() + e.slice(1);
};
}, {
"./helper/makeString": 20
} ],
11: [ function(e, a) {
var t = e("./helper/makeString");
function n(e) {
for (var a = e.match(/^[\s\\t]*/gm), t = a[0].length, n = 1; n < a.length; n++) t = Math.min(a[n].length, t);
return t;
}
a.exports = function(e, a) {
var i, r = n(e = t(e));
if (0 === r) return e;
i = "string" == typeof a ? new RegExp("^" + a, "gm") : new RegExp("^[ \\t]{" + r + "}", "gm");
return e.replace(i, "");
};
}, {
"./helper/makeString": 20
} ],
12: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/toPositive");
a.exports = function(e, a, i) {
e = t(e);
a = "" + a;
return (i = "undefined" == typeof i ? e.length - a.length : Math.min(n(i), e.length) - a.length) >= 0 && e.indexOf(a, i) === i;
};
}, {
"./helper/makeString": 20,
"./helper/toPositive": 22
} ],
13: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/escapeChars"), i = "[";
for (var r in n) i += r;
i += "]";
var s = new RegExp(i, "g");
a.exports = function(e) {
return t(e).replace(s, function(e) {
return "&" + n[e] + ";";
});
};
}, {
"./helper/escapeChars": 17,
"./helper/makeString": 20
} ],
14: [ function(e, a) {
a.exports = function() {
var e = {};
for (var a in this) this.hasOwnProperty(a) && !a.match(/^(?:include|contains|reverse|join|map|wrap)$/) && (e[a] = this[a]);
return e;
};
}, {} ],
15: [ function(e, a) {
var t = e("./makeString");
a.exports = function(e, a) {
return 0 === (e = t(e)).length ? "" : e.slice(0, -1) + String.fromCharCode(e.charCodeAt(e.length - 1) + a);
};
}, {
"./makeString": 20
} ],
16: [ function(e, a) {
var t = e("./escapeRegExp");
a.exports = function(e) {
return null == e ? "\\s" : e.source ? e.source : "[" + t(e) + "]";
};
}, {
"./escapeRegExp": 18
} ],
17: [ function(e, a) {
a.exports = {
"¢": "cent",
"£": "pound",
"¥": "yen",
"€": "euro",
"©": "copy",
"®": "reg",
"<": "lt",
">": "gt",
'"': "quot",
"&": "amp",
"'": "#39"
};
}, {} ],
18: [ function(e, a) {
var t = e("./makeString");
a.exports = function(e) {
return t(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
};
}, {
"./makeString": 20
} ],
19: [ function(e, a) {
a.exports = {
nbsp: " ",
cent: "¢",
pound: "£",
yen: "¥",
euro: "€",
copy: "©",
reg: "®",
lt: "<",
gt: ">",
quot: '"',
amp: "&",
apos: "'"
};
}, {} ],
20: [ function(e, a) {
a.exports = function(e) {
return null == e ? "" : "" + e;
};
}, {} ],
21: [ function(e, a) {
a.exports = function(e, a) {
if (a < 1) return "";
for (var t = ""; a > 0; ) {
1 & a && (t += e);
a >>= 1, e += e;
}
return t;
};
}, {} ],
22: [ function(e, a) {
a.exports = function(e) {
return e < 0 ? 0 : +e || 0;
};
}, {} ],
23: [ function(e, a) {
var t = e("./capitalize"), n = e("./underscored"), i = e("./trim");
a.exports = function(e) {
return t(i(n(e).replace(/_id$/, "").replace(/_/g, " ")));
};
}, {
"./capitalize": 2,
"./trim": 65,
"./underscored": 67
} ],
24: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
return "" === a || -1 !== t(e).indexOf(a);
};
}, {
"./helper/makeString": 20
} ],
25: [ function(e, a) {
function t(e) {
if (!(this instanceof t)) return new t(e);
this._wrapped = e;
}
t.VERSION = "3.3.4";
t.isBlank = e("./isBlank");
t.stripTags = e("./stripTags");
t.capitalize = e("./capitalize");
t.decapitalize = e("./decapitalize");
t.chop = e("./chop");
t.trim = e("./trim");
t.clean = e("./clean");
t.cleanDiacritics = e("./cleanDiacritics");
t.count = e("./count");
t.chars = e("./chars");
t.swapCase = e("./swapCase");
t.escapeHTML = e("./escapeHTML");
t.unescapeHTML = e("./unescapeHTML");
t.splice = e("./splice");
t.insert = e("./insert");
t.replaceAll = e("./replaceAll");
t.include = e("./include");
t.join = e("./join");
t.lines = e("./lines");
t.dedent = e("./dedent");
t.reverse = e("./reverse");
t.startsWith = e("./startsWith");
t.endsWith = e("./endsWith");
t.pred = e("./pred");
t.succ = e("./succ");
t.titleize = e("./titleize");
t.camelize = e("./camelize");
t.underscored = e("./underscored");
t.dasherize = e("./dasherize");
t.classify = e("./classify");
t.humanize = e("./humanize");
t.ltrim = e("./ltrim");
t.rtrim = e("./rtrim");
t.truncate = e("./truncate");
t.prune = e("./prune");
t.words = e("./words");
t.pad = e("./pad");
t.lpad = e("./lpad");
t.rpad = e("./rpad");
t.lrpad = e("./lrpad");
t.sprintf = e("./sprintf");
t.vsprintf = e("./vsprintf");
t.toNumber = e("./toNumber");
t.numberFormat = e("./numberFormat");
t.strRight = e("./strRight");
t.strRightBack = e("./strRightBack");
t.strLeft = e("./strLeft");
t.strLeftBack = e("./strLeftBack");
t.toSentence = e("./toSentence");
t.toSentenceSerial = e("./toSentenceSerial");
t.slugify = e("./slugify");
t.surround = e("./surround");
t.quote = e("./quote");
t.unquote = e("./unquote");
t.repeat = e("./repeat");
t.naturalCmp = e("./naturalCmp");
t.levenshtein = e("./levenshtein");
t.toBoolean = e("./toBoolean");
t.exports = e("./exports");
t.escapeRegExp = e("./helper/escapeRegExp");
t.wrap = e("./wrap");
t.map = e("./map");
t.strip = t.trim;
t.lstrip = t.ltrim;
t.rstrip = t.rtrim;
t.center = t.lrpad;
t.rjust = t.lpad;
t.ljust = t.rpad;
t.contains = t.include;
t.q = t.quote;
t.toBool = t.toBoolean;
t.camelcase = t.camelize;
t.mapChars = t.map;
t.prototype = {
value: function() {
return this._wrapped;
}
};
function n(e, a) {
"function" == typeof a && (t.prototype[e] = function() {
var e = [ this._wrapped ].concat(Array.prototype.slice.call(arguments)), n = a.apply(null, e);
return "string" == typeof n ? new t(n) : n;
});
}
for (var i in t) n(i, t[i]);
n("tap", function(e, a) {
return a(e);
});
function r(e) {
n(e, function(a) {
var t = Array.prototype.slice.call(arguments, 1);
return String.prototype[e].apply(a, t);
});
}
var s = [ "toUpperCase", "toLowerCase", "split", "replace", "slice", "substring", "substr", "concat" ];
for (var o in s) r(s[o]);
a.exports = t;
}, {
"./camelize": 1,
"./capitalize": 2,
"./chars": 3,
"./chop": 4,
"./classify": 5,
"./clean": 6,
"./cleanDiacritics": 7,
"./count": 8,
"./dasherize": 9,
"./decapitalize": 10,
"./dedent": 11,
"./endsWith": 12,
"./escapeHTML": 13,
"./exports": 14,
"./helper/escapeRegExp": 18,
"./humanize": 23,
"./include": 24,
"./insert": 26,
"./isBlank": 27,
"./join": 28,
"./levenshtein": 29,
"./lines": 30,
"./lpad": 31,
"./lrpad": 32,
"./ltrim": 33,
"./map": 34,
"./naturalCmp": 35,
"./numberFormat": 38,
"./pad": 39,
"./pred": 40,
"./prune": 41,
"./quote": 42,
"./repeat": 43,
"./replaceAll": 44,
"./reverse": 45,
"./rpad": 46,
"./rtrim": 47,
"./slugify": 48,
"./splice": 49,
"./sprintf": 50,
"./startsWith": 51,
"./strLeft": 52,
"./strLeftBack": 53,
"./strRight": 54,
"./strRightBack": 55,
"./stripTags": 56,
"./succ": 57,
"./surround": 58,
"./swapCase": 59,
"./titleize": 60,
"./toBoolean": 61,
"./toNumber": 62,
"./toSentence": 63,
"./toSentenceSerial": 64,
"./trim": 65,
"./truncate": 66,
"./underscored": 67,
"./unescapeHTML": 68,
"./unquote": 69,
"./vsprintf": 70,
"./words": 71,
"./wrap": 72
} ],
26: [ function(e, a) {
var t = e("./splice");
a.exports = function(e, a, n) {
return t(e, a, 0, n);
};
}, {
"./splice": 49
} ],
27: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e) {
return /^\s*$/.test(t(e));
};
}, {
"./helper/makeString": 20
} ],
28: [ function(e, a) {
var t = e("./helper/makeString"), n = [].slice;
a.exports = function() {
var e = n.call(arguments), a = e.shift();
return e.join(t(a));
};
}, {
"./helper/makeString": 20
} ],
29: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
if ((e = t(e)) === (a = t(a))) return 0;
if (!e || !a) return Math.max(e.length, a.length);
for (var n = new Array(a.length + 1), i = 0; i < n.length; ++i) n[i] = i;
for (i = 0; i < e.length; ++i) {
for (var r = i + 1, s = 0; s < a.length; ++s) {
var o = r, l = o + 1;
(r = n[s] + (e.charAt(i) === a.charAt(s) ? 0 : 1)) > l && (r = l);
r > (l = n[s + 1] + 1) && (r = l);
n[s] = o;
}
n[s] = r;
}
return r;
};
}, {
"./helper/makeString": 20
} ],
30: [ function(e, a) {
a.exports = function(e) {
return null == e ? [] : String(e).split(/\r\n?|\n/);
};
}, {} ],
31: [ function(e, a) {
var t = e("./pad");
a.exports = function(e, a, n) {
return t(e, a, n);
};
}, {
"./pad": 39
} ],
32: [ function(e, a) {
var t = e("./pad");
a.exports = function(e, a, n) {
return t(e, a, n, "both");
};
}, {
"./pad": 39
} ],
33: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/defaultToWhiteSpace"), i = String.prototype.trimLeft;
a.exports = function(e, a) {
e = t(e);
if (!a && i) return i.call(e);
a = n(a);
return e.replace(new RegExp("^" + a + "+"), "");
};
}, {
"./helper/defaultToWhiteSpace": 16,
"./helper/makeString": 20
} ],
34: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
return 0 === (e = t(e)).length || "function" != typeof a ? e : e.replace(/./g, a);
};
}, {
"./helper/makeString": 20
} ],
35: [ function(e, a) {
a.exports = function(e, a) {
if (e == a) return 0;
if (!e) return -1;
if (!a) return 1;
for (var t = /(\.\d+|\d+|\D+)/g, n = String(e).match(t), i = String(a).match(t), r = Math.min(n.length, i.length), s = 0; s < r; s++) {
var o = n[s], l = i[s];
if (o !== l) {
var c = +o, d = +l;
return c == c && d == d ? c > d ? 1 : -1 : o < l ? -1 : 1;
}
}
return n.length != i.length ? n.length - i.length : e < a ? -1 : 1;
};
}, {} ],
36: [ function(e, a, t) {
(function(e) {
var a = {
not_string: /[^s]/,
number: /[diefg]/,
json: /[j]/,
not_json: /[^j]/,
text: /^[^\x25]+/,
modulo: /^\x25{2}/,
placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,
key: /^([a-z_][a-z_\d]*)/i,
key_access: /^\.([a-z_][a-z_\d]*)/i,
index_access: /^\[(\d+)\]/,
sign: /^[\+\-]/
};
function n() {
var e = arguments[0], a = n.cache;
a[e] && a.hasOwnProperty(e) || (a[e] = n.parse(e));
return n.format.call(null, a[e], arguments);
}
n.format = function(e, t) {
var i, s, o, l, c, d, h, u, m = 1, g = e.length, p = "", _ = [], k = !0, f = "";
for (s = 0; s < g; s++) if ("string" === (p = r(e[s]))) _[_.length] = e[s]; else if ("array" === p) {
if ((l = e[s])[2]) {
i = t[m];
for (o = 0; o < l[2].length; o++) {
if (!i.hasOwnProperty(l[2][o])) throw new Error(n("[sprintf] property '%s' does not exist", l[2][o]));
i = i[l[2][o]];
}
} else i = l[1] ? t[l[1]] : t[m++];
"function" == r(i) && (i = i());
if (a.not_string.test(l[8]) && a.not_json.test(l[8]) && "number" != r(i) && isNaN(i)) throw new TypeError(n("[sprintf] expecting number but found %s", r(i)));
a.number.test(l[8]) && (k = i >= 0);
switch (l[8]) {
case "b":
i = i.toString(2);
break;

case "c":
i = String.fromCharCode(i);
break;

case "d":
case "i":
i = parseInt(i, 10);
break;

case "j":
i = JSON.stringify(i, null, l[6] ? parseInt(l[6]) : 0);
break;

case "e":
i = l[7] ? i.toExponential(l[7]) : i.toExponential();
break;

case "f":
i = l[7] ? parseFloat(i).toFixed(l[7]) : parseFloat(i);
break;

case "g":
i = l[7] ? parseFloat(i).toPrecision(l[7]) : parseFloat(i);
break;

case "o":
i = i.toString(8);
break;

case "s":
i = (i = String(i)) && l[7] ? i.substring(0, l[7]) : i;
break;

case "u":
i >>>= 0;
break;

case "x":
i = i.toString(16);
break;

case "X":
i = i.toString(16).toUpperCase();
}
if (a.json.test(l[8])) _[_.length] = i; else {
if (!a.number.test(l[8]) || k && !l[3]) f = ""; else {
f = k ? "+" : "-";
i = i.toString().replace(a.sign, "");
}
d = l[4] ? "0" === l[4] ? "0" : l[4].charAt(1) : " ";
h = l[6] - (f + i).length;
c = l[6] && h > 0 ? (u = d, Array(h + 1).join(u)) : "";
_[_.length] = l[5] ? f + i + c : "0" === d ? f + c + i : c + f + i;
}
}
return _.join("");
};
n.cache = {};
n.parse = function(e) {
for (var t = e, n = [], i = [], r = 0; t; ) {
if (null !== (n = a.text.exec(t))) i[i.length] = n[0]; else if (null !== (n = a.modulo.exec(t))) i[i.length] = "%"; else {
if (null === (n = a.placeholder.exec(t))) throw new SyntaxError("[sprintf] unexpected placeholder");
if (n[2]) {
r |= 1;
var s = [], o = n[2], l = [];
if (null === (l = a.key.exec(o))) throw new SyntaxError("[sprintf] failed to parse named argument key");
s[s.length] = l[1];
for (;"" !== (o = o.substring(l[0].length)); ) if (null !== (l = a.key_access.exec(o))) s[s.length] = l[1]; else {
if (null === (l = a.index_access.exec(o))) throw new SyntaxError("[sprintf] failed to parse named argument key");
s[s.length] = l[1];
}
n[2] = s;
} else r |= 2;
if (3 === r) throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
i[i.length] = n;
}
t = t.substring(n[0].length);
}
return i;
};
var i = function(e, a, t) {
(t = (a || []).slice(0)).splice(0, 0, e);
return n.apply(null, t);
};
function r(e) {
return Object.prototype.toString.call(e).slice(8, -1).toLowerCase();
}
if ("undefined" != typeof t) {
t.sprintf = n;
t.vsprintf = i;
} else {
e.sprintf = n;
e.vsprintf = i;
}
})("undefined" == typeof window ? this : window);
}, {} ],
37: [ function(a, t) {
(function(e) {
t.exports = function(e, t) {
if (a("noDeprecation")) return e;
var n = !1;
return function() {
if (!n) {
if (a("throwDeprecation")) throw new Error(t);
a("traceDeprecation") ? console.trace(t) : console.warn(t);
n = !0;
}
return e.apply(this, arguments);
};
};
function a(a) {
try {
if (!e.localStorage) return !1;
} catch (e) {
return !1;
}
var t = e.localStorage[a];
return null != t && "true" === String(t).toLowerCase();
}
}).call(this, "undefined" != typeof e ? e : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
}, {} ],
38: [ function(e, a) {
a.exports = function(e, a, t, n) {
if (isNaN(e) || null == e) return "";
n = "string" == typeof n ? n : ",";
var i = (e = e.toFixed(~~a)).split("."), r = i[0], s = i[1] ? (t || ".") + i[1] : "";
return r.replace(/(\d)(?=(?:\d{3})+$)/g, "$1" + n) + s;
};
}, {} ],
39: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/strRepeat");
a.exports = function(e, a, i, r) {
e = t(e);
a = ~~a;
var s = 0;
i ? i.length > 1 && (i = i.charAt(0)) : i = " ";
switch (r) {
case "right":
s = a - e.length;
return e + n(i, s);

case "both":
s = a - e.length;
return n(i, Math.ceil(s / 2)) + e + n(i, Math.floor(s / 2));

default:
s = a - e.length;
return n(i, s) + e;
}
};
}, {
"./helper/makeString": 20,
"./helper/strRepeat": 21
} ],
40: [ function(e, a) {
var t = e("./helper/adjacent");
a.exports = function(e) {
return t(e, -1);
};
}, {
"./helper/adjacent": 15
} ],
41: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./rtrim");
a.exports = function(e, a, i) {
e = t(e);
a = ~~a;
i = null != i ? String(i) : "...";
if (e.length <= a) return e;
var r = e.slice(0, a + 1).replace(/.(?=\W*\w*$)/g, function(e) {
return e.toUpperCase() !== e.toLowerCase() ? "A" : " ";
});
return ((r = r.slice(r.length - 2).match(/\w\w/) ? r.replace(/\s*\S+$/, "") : n(r.slice(0, r.length - 1))) + i).length > e.length ? e : e.slice(0, r.length) + i;
};
}, {
"./helper/makeString": 20,
"./rtrim": 47
} ],
42: [ function(e, a) {
var t = e("./surround");
a.exports = function(e, a) {
return t(e, a || '"');
};
}, {
"./surround": 58
} ],
43: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/strRepeat");
a.exports = function(e, a, i) {
e = t(e);
a = ~~a;
if (null == i) return n(e, a);
for (var r = []; a > 0; r[--a] = e) ;
return r.join(i);
};
}, {
"./helper/makeString": 20,
"./helper/strRepeat": 21
} ],
44: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a, n, i) {
var r = new RegExp(a, !0 === i ? "gi" : "g");
return t(e).replace(r, n);
};
}, {
"./helper/makeString": 20
} ],
45: [ function(e, a) {
var t = e("./chars");
a.exports = function(e) {
return t(e).reverse().join("");
};
}, {
"./chars": 3
} ],
46: [ function(e, a) {
var t = e("./pad");
a.exports = function(e, a, n) {
return t(e, a, n, "right");
};
}, {
"./pad": 39
} ],
47: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/defaultToWhiteSpace"), i = String.prototype.trimRight;
a.exports = function(e, a) {
e = t(e);
if (!a && i) return i.call(e);
a = n(a);
return e.replace(new RegExp(a + "+$"), "");
};
}, {
"./helper/defaultToWhiteSpace": 16,
"./helper/makeString": 20
} ],
48: [ function(e, a) {
var t = e("./trim"), n = e("./dasherize"), i = e("./cleanDiacritics");
a.exports = function(e) {
return t(n(i(e).replace(/[^\w\s-]/g, "-").toLowerCase()), "-");
};
}, {
"./cleanDiacritics": 7,
"./dasherize": 9,
"./trim": 65
} ],
49: [ function(e, a) {
var t = e("./chars");
a.exports = function(e, a, n, i) {
var r = t(e);
r.splice(~~a, ~~n, i);
return r.join("");
};
}, {
"./chars": 3
} ],
50: [ function(e, a) {
var t = e("util-deprecate");
a.exports = t(e("sprintf-js").sprintf, "sprintf() will be removed in the next major release, use the sprintf-js package instead.");
}, {
"sprintf-js": 36,
"util-deprecate": 37
} ],
51: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/toPositive");
a.exports = function(e, a, i) {
e = t(e);
a = "" + a;
i = null == i ? 0 : Math.min(n(i), e.length);
return e.lastIndexOf(a, i) === i;
};
}, {
"./helper/makeString": 20,
"./helper/toPositive": 22
} ],
52: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
e = t(e);
var n = (a = t(a)) ? e.indexOf(a) : -1;
return ~n ? e.slice(0, n) : e;
};
}, {
"./helper/makeString": 20
} ],
53: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
e = t(e);
a = t(a);
var n = e.lastIndexOf(a);
return ~n ? e.slice(0, n) : e;
};
}, {
"./helper/makeString": 20
} ],
54: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
e = t(e);
var n = (a = t(a)) ? e.indexOf(a) : -1;
return ~n ? e.slice(n + a.length, e.length) : e;
};
}, {
"./helper/makeString": 20
} ],
55: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
e = t(e);
var n = (a = t(a)) ? e.lastIndexOf(a) : -1;
return ~n ? e.slice(n + a.length, e.length) : e;
};
}, {
"./helper/makeString": 20
} ],
56: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e) {
return t(e).replace(/<\/?[^>]+>/g, "");
};
}, {
"./helper/makeString": 20
} ],
57: [ function(e, a) {
var t = e("./helper/adjacent");
a.exports = function(e) {
return t(e, 1);
};
}, {
"./helper/adjacent": 15
} ],
58: [ function(e, a) {
a.exports = function(e, a) {
return [ a, e, a ].join("");
};
}, {} ],
59: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e) {
return t(e).replace(/\S/g, function(e) {
return e === e.toUpperCase() ? e.toLowerCase() : e.toUpperCase();
});
};
}, {
"./helper/makeString": 20
} ],
60: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e) {
return t(e).toLowerCase().replace(/(?:^|\s|-)\S/g, function(e) {
return e.toUpperCase();
});
};
}, {
"./helper/makeString": 20
} ],
61: [ function(e, a) {
var t = e("./trim");
function n(e, a) {
var t, n, i = e.toLowerCase();
a = [].concat(a);
for (t = 0; t < a.length; t += 1) if (n = a[t]) {
if (n.test && n.test(e)) return !0;
if (n.toLowerCase() === i) return !0;
}
}
a.exports = function(e, a, i) {
"number" == typeof e && (e = "" + e);
return "string" != typeof e ? !!e : !!n(e = t(e), a || [ "true", "1" ]) || !n(e, i || [ "false", "0" ]) && void 0;
};
}, {
"./trim": 65
} ],
62: [ function(e, a) {
a.exports = function(e, a) {
if (null == e) return 0;
var t = Math.pow(10, isFinite(a) ? a : 0);
return Math.round(e * t) / t;
};
}, {} ],
63: [ function(e, a) {
var t = e("./rtrim");
a.exports = function(e, a, n, i) {
a = a || ", ";
n = n || " and ";
var r = e.slice(), s = r.pop();
e.length > 2 && i && (n = t(a) + n);
return r.length ? r.join(a) + n + s : s;
};
}, {
"./rtrim": 47
} ],
64: [ function(e, a) {
var t = e("./toSentence");
a.exports = function(e, a, n) {
return t(e, a, n, !0);
};
}, {
"./toSentence": 63
} ],
65: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/defaultToWhiteSpace"), i = String.prototype.trim;
a.exports = function(e, a) {
e = t(e);
if (!a && i) return i.call(e);
a = n(a);
return e.replace(new RegExp("^" + a + "+|" + a + "+$", "g"), "");
};
}, {
"./helper/defaultToWhiteSpace": 16,
"./helper/makeString": 20
} ],
66: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a, n) {
n = n || "...";
a = ~~a;
return (e = t(e)).length > a ? e.slice(0, a) + n : e;
};
}, {
"./helper/makeString": 20
} ],
67: [ function(e, a) {
var t = e("./trim");
a.exports = function(e) {
return t(e).replace(/([a-z\d])([A-Z]+)/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase();
};
}, {
"./trim": 65
} ],
68: [ function(e, a) {
var t = e("./helper/makeString"), n = e("./helper/htmlEntities");
a.exports = function(e) {
return t(e).replace(/\&([^;]+);/g, function(e, a) {
var t;
return a in n ? n[a] : (t = a.match(/^#x([\da-fA-F]+)$/)) ? String.fromCharCode(parseInt(t[1], 16)) : (t = a.match(/^#(\d+)$/)) ? String.fromCharCode(~~t[1]) : e;
});
};
}, {
"./helper/htmlEntities": 19,
"./helper/makeString": 20
} ],
69: [ function(e, a) {
a.exports = function(e, a) {
a = a || '"';
return e[0] === a && e[e.length - 1] === a ? e.slice(1, e.length - 1) : e;
};
}, {} ],
70: [ function(e, a) {
var t = e("util-deprecate");
a.exports = t(e("sprintf-js").vsprintf, "vsprintf() will be removed in the next major release, use the sprintf-js package instead.");
}, {
"sprintf-js": 36,
"util-deprecate": 37
} ],
71: [ function(e, a) {
var t = e("./isBlank"), n = e("./trim");
a.exports = function(e, a) {
return t(e) ? [] : n(e, a).split(a || /\s+/);
};
}, {
"./isBlank": 27,
"./trim": 65
} ],
72: [ function(e, a) {
var t = e("./helper/makeString");
a.exports = function(e, a) {
e = t(e);
var n, i = (a = a || {}).width || 75, r = a.seperator || "\n", s = a.cut || !1, o = a.preserveSpaces || !1, l = a.trailingSpaces || !1;
if (i <= 0) return e;
if (s) {
var c = 0;
n = "";
for (;c < e.length; ) {
c % i == 0 && c > 0 && (n += r);
n += e.charAt(c);
c++;
}
if (l) for (;c % i > 0; ) {
n += " ";
c++;
}
return n;
}
var d = e.split(" "), h = 0;
n = "";
for (;d.length > 0; ) {
if (1 + d[0].length + h > i && h > 0) {
if (o) {
n += " ";
h++;
} else if (l) for (;h < i; ) {
n += " ";
h++;
}
n += r;
h = 0;
}
if (h > 0) {
n += " ";
h++;
}
n += d[0];
h += d[0].length;
d.shift();
}
if (l) for (;h < i; ) {
n += " ";
h++;
}
return n;
};
}, {
"./helper/makeString": 20
} ]
}, {}, [ 25 ])(25);
});
cc._RF.pop();
}).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
}, {} ],
