bag: [ function(e, a) {
"use strict";
cc._RF.push(a, "7313cY/OQ5H/5mQEa0wy0UZ", "bag");
var t = e("underscore"), n = e("serverMain"), i = e("serverConfig"), r = e("dataApi"), s = function(e) {
this.items = {};
this.lastIdx = e.lastIdx;
this.update(e.items);
};
a.exports = s;
s.prototype.update = function(e) {
for (var a in e) if (e[a]) {
this.items[a] = e[a];
this.items[a].idx = a;
} else delete this.items[a];
};
s.prototype.getItemCount = function(e) {
switch (e = Number(e)) {
case i.CONSTS.ENTITY_ID.COIN:
return n.player.coin;

case i.CONSTS.ENTITY_ID.GEM:
return n.player.gem;
}
var a = 0;
for (var t in this.items) if (this.items[t].kindId == e) {
if (this.items[t].expireTime && Date.now() > this.items[t].expireTime) continue;
a += this.items[t].count;
}
return a;
};
s.prototype.getItemByIdx = function(e) {
return this.items[e];
};
s.prototype.getItemByType = function(e) {
var a = {};
for (var t in this.items) r.findEntityById(this.items[t].kindId).type == e && (a[t] = this.items[t]);
return a;
};
s.prototype.getItemByKindId = function(e) {
return t.findWhere(this.items, {
kindId: Number(e)
});
};
cc._RF.pop();
}, {
dataApi: "dataApi",
serverConfig: "serverConfig",
serverMain: "serverMain",
underscore: "underscore"
} ],
