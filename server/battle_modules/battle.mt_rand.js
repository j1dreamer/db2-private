"battle.mt_rand": [ function(e, a) {
"use strict";
cc._RF.push(a, "bbf5b3g2wRKyqHHJav/Nyp4", "battle.mt_rand");
var t, n, i, r, s, o, l, c, d, h, u, m, g, p, _, k, f, y = (t = 624, n = 397, i = function(e) {
return e >>> 0;
}, r = function(e) {
return 2147483648 & i(e);
}, s = function(e) {
return 1 & i(e);
}, o = function(e) {
return 2147483647 & i(e);
}, l = function(e, a) {
e = i(e);
a = i(a);
return r(e) | o(a);
}, c = function(e, a, t) {
e = i(e);
a = i(a);
t = i(t);
return i(e ^ l(a, t) >>> 1 ^ 2567483615 & i(-(n = s(a), n >> 0)));
var n;
}, d = function() {
return Math.random() * Number.MAX_VALUE;
}, h = [], u = 0, m = 0, g = 0, p = function(e, a) {
e = i(e);
var n = 0, r = 0, s = 1;
a[n++] = 4294967295 & e;
for (;s < t; ++s) {
var o = a[r] ^ a[r] >>> 30, l = 65535 & o, c = 4294901760 & o;
a[n++] = i(i(1812433253 * l) + i(1812433253 * c) + s);
r++;
}
}, _ = function() {
var e, a = 0;
for (e = 227; e--; ++a) h[a] = c(h[a + n], h[a], h[a + 1]);
for (e = n; --e; ++a) h[a] = c(h[a + n - t], h[a], h[a + 1]);
h[a] = c(h[a + n - t], h[a], h[0]);
u = t;
m = 0;
}, k = function(e) {
p(e, h);
_();
g = 1;
}, f = function() {
0 === u && _();
--u;
var e;
e = h[m++];
e ^= e >>> 11;
e ^= e << 7 & 2636928640;
return (e ^= e << 15 & 4022730752) ^ e >>> 18;
}, {
srand: function(e) {
e = e || d();
k(e);
},
rand: function() {
g || k(d());
return f() >>> 1;
},
getrandmax: function() {
return 2147483647;
}
});
a.exports = y;
cc._RF.pop();
}, {} ],
