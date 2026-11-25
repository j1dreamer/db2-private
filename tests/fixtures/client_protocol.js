protocol: [ function(e, a) {
"use strict";
cc._RF.push(a, "97ae9FwRv1IzKVNVlnvVV2y", "protocol");
(function(e, t) {
var n = e, i = n.Package = {}, r = n.Message = {};
i.TYPE_HANDSHAKE = 1;
i.TYPE_HANDSHAKE_ACK = 2;
i.TYPE_HEARTBEAT = 3;
i.TYPE_DATA = 4;
i.TYPE_KICK = 5;
r.TYPE_REQUEST = 0;
r.TYPE_NOTIFY = 1;
r.TYPE_RESPONSE = 2;
r.TYPE_PUSH = 3;
n.strencode = function(e) {
for (var a = new t(3 * e.length), n = 0, i = 0; i < e.length; i++) {
var r, o = e.charCodeAt(i);
r = o <= 127 ? [ o ] : o <= 2047 ? [ 192 | o >> 6, 128 | 63 & o ] : [ 224 | o >> 12, 128 | (4032 & o) >> 6, 128 | 63 & o ];
for (var l = 0; l < r.length; l++) {
a[n] = r[l];
++n;
}
}
var c = new t(n);
s(c, 0, a, 0, n);
return c;
};
n.strdecode = function(e) {
for (var a = new t(e), n = [], i = 0, r = 0, s = a.length; i < s; ) {
if (a[i] < 128) {
r = a[i];
i += 1;
} else if (a[i] < 224) {
r = ((63 & a[i]) << 6) + (63 & a[i + 1]);
i += 2;
} else if (a[i] < 240) {
r = ((15 & a[i]) << 12) + ((63 & a[i + 1]) << 6) + (63 & a[i + 2]);
i += 3;
} else if (a[i] < 256) {
r = ((7 & a[i]) << 18) + ((63 & a[i + 1]) << 12) + ((63 & a[i + 2]) << 6) + (63 & a[i + 3]);
i += 4;
}
n.push(r);
}
var o, l = String.fromCodePoint || String.fromCharCode, c = "";
for (o = 0; o < n.length / 8192; o++) c += l.apply(null, n.slice(8192 * o, 8192 * (o + 1)));
return c + l.apply(null, n.slice(8192 * o));
};
i.encode = function(e, a) {
var n = a ? a.length : 0, i = new t(4 + n), r = 0;
i[r++] = 255 & e;
i[r++] = n >> 16 & 255;
i[r++] = n >> 8 & 255;
i[r++] = 255 & n;
a && s(i, 4, a, 0, n);
return i;
};
i.decode = function(e) {
for (var a = 0, n = new t(e), i = 0, r = []; a < n.length; ) {
var o = n[a++], l = (i = (n[a++] << 16 | n[a++] << 8 | n[a++]) >>> 0) ? new t(i) : null;
s(l, 0, n, a, i);
a += i;
r.push({
type: o,
body: l
});
}
return 1 === r.length ? r[0] : r;
};
r.encode = function(e, a, i, r, s) {
var g = 1 + (o(a) ? c(e) : 0);
if (l(a)) if (i) {
if ("number" != typeof r) throw new Error("error flag for number route!");
g += 2;
} else {
g += 1;
if (r) {
if ((r = n.strencode(r)).length > 255) throw new Error("route maxlength is overflow");
g += r.length;
}
}
s && (g += s.length);
var p = new t(g), _ = 0;
_ = d(a, i, p, _);
o(a) && (_ = h(e, p, _));
l(a) && (_ = u(i, r, p, _));
s && (_ = m(s, p, _));
return p;
};
r.decode = function(e) {
var a = new t(e), i = a.length || a.byteLength, r = 0, c = 0, d = null, h = a[r++], u = 1 & h, m = h >> 1 & 7;
if (o(m)) {
var g = parseInt(a[r]), p = 0;
do {
c += (127 & (g = parseInt(a[r]))) * Math.pow(2, 7 * p);
r++;
p++;
} while (g >= 128);
}
if (l(m)) if (u) d = a[r++] << 8 | a[r++]; else {
var _ = a[r++];
if (_) {
d = new t(_);
s(d, 0, a, r, _);
d = n.strdecode(d);
} else d = "";
r += _;
}
var k = i - r, f = new t(k);
s(f, 0, a, r, k);
return {
id: c,
type: m,
compressRoute: u,
route: d,
body: f
};
};
var s = function(e, a, t, n, i) {
if ("function" == typeof t.copy) t.copy(e, a, n, n + i); else for (var r = 0; r < i; r++) e[a++] = t[n++];
}, o = function(e) {
return e === r.TYPE_REQUEST || e === r.TYPE_RESPONSE;
}, l = function(e) {
return e === r.TYPE_REQUEST || e === r.TYPE_NOTIFY || e === r.TYPE_PUSH;
}, c = function(e) {
var a = 0;
do {
a += 1;
e >>= 7;
} while (e > 0);
return a;
}, d = function(e, a, t, n) {
if (e !== r.TYPE_REQUEST && e !== r.TYPE_NOTIFY && e !== r.TYPE_RESPONSE && e !== r.TYPE_PUSH) throw new Error("unkonw message type: " + e);
t[n] = e << 1 | (a ? 1 : 0);
return n + 1;
}, h = function(e, a, t) {
do {
var n = e % 128, i = Math.floor(e / 128);
0 !== i && (n += 128);
a[t++] = n;
e = i;
} while (0 !== e);
return t;
}, u = function(e, a, t, n) {
if (e) {
if (a > 65535) throw new Error("route number is overflow");
t[n++] = a >> 8 & 255;
t[n++] = 255 & a;
} else if (a) {
t[n++] = 255 & a.length;
s(t, n, a, 0, a.length);
n += a.length;
} else t[n++] = 0;
return n;
}, m = function(e, a, t) {
s(a, t, e, 0, e.length);
return t + e.length;
};
a.exports = n;
})(a.exports, Uint8Array);
cc._RF.pop();
}, {} ],
