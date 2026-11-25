skillInfoPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "f0f0bt1sBNO4LEvCjU6wBbz", "skillInfoPanel");
var t = e("underscore"), n = e("dataApi"), i = e("i18n"), r = e("serverConfig"), s = (e("battle.consts"),
e("helper")), o = cc.Class({
extends: cc.Component,
properties: {
bgSp: cc.Node,
titleLabel: cc.Label,
descRichText: cc.RichText,
dmgTypeDescLabel: cc.Node,
effectLabel: cc.Node,
unlockDescLabel: cc.Node
},
onLoad: function() {
this.node.targetOff(this);
this.node.on(cc.Node.EventType.TOUCH_START, this.onTouch_, this);
this.node.on(cc.Node.EventType.TOUCH_END, this.onTouch_, this);
this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouch_, this);
this.node._touchListener.setSwallowTouches(!1);
},
update_: function(e) {
this.data = e;
this.titleLabel.string = e.name;
this.descRichText.string = e.desc;
this.dmgTypeDescLabel.active = !!e.dmgTypeDesc;
if (this.dmgTypeDescLabel.active) {
this.dmgTypeDescLabel.getComponent(cc.Label).string = e.dmgTypeDesc;
this.dmgTypeDescLabel.getComponent(cc.Label)._forceUpdateRenderData(!0);
}
this.effectLabel.active = !!e.effect;
if (this.effectLabel.active) {
this.effectLabel.getComponent(cc.Label).string = e.effect;
this.effectLabel.getComponent(cc.Label)._forceUpdateRenderData(!0);
}
this.unlockDescLabel.active = !!e.unlockDesc;
this.unlockDescLabel.active && (this.unlockDescLabel.getComponent(cc.RichText).string = e.unlockDesc);
this.bgSp.getComponent(cc.Layout).updateLayout();
},
onTouch_: function(e) {
switch (e.type) {
case cc.Node.EventType.TOUCH_START:
break;

case cc.Node.EventType.TOUCH_CANCEL:
case cc.Node.EventType.TOUCH_END:
this.node.active = !1;
}
}
});
o.genData = function(e, a, l) {
var c, d, h, u = n.fightSkill.findById(e), m = o.genDescText(u.desc, u.atkPer, u.descReplaceList), g = a ? (d = a,
h = 0, (c = u).effect.replace(/[$%]/g, function(e) {
var a = c.base[h] + c.growth[h] * (d || 0);
a = a.toFixed(3);
c.growth[h] > 1 && (a = Math.floor(a));
0 == c.base[h] && 1 == c.growth[h] && d == r.ROLE.CONSTS.MAX_SKILL_LEVEL && (a = 200);
h++;
a = Math.abs(a);
switch (e) {
case "$":
return a;

case "%":
return s.floatStrip(100 * a) + "%";
}
})) : null, p = {
1: i.t("物理攻击"),
2: i.t("魔法攻击"),
3: i.t("无视防御")
}[u.dmgType] || null, _ = r.ROLE.CONSTS.EVOLVE_SKILL_NO_LEVEL_MAP[u.no], k = null;
if (u.unlockDesc) {
k = "";
k += (l && t.include(l.evolveSkillIds, e) ? "<color=#86C8F2 >$</c>" : "<color=#858585 >$</c>").replace("$", u.unlockDesc);
a >= _ || (k += "<color=#FF2E10 >$</c>".replace("$", i.t("(技能等级$1级解锁)", [ _ ])));
}
return {
name: u.name,
desc: m,
dmgTypeDesc: p,
effect: g,
unlockDesc: k
};
};
o.genDescText = function(e, a, n) {
var i = [], r = [], o = e.split("%%");
if (1 == o.length) {
r = e.split("$");
i = n;
} else {
if ((l = o[0].split("$")).length > 1) {
r = l;
i = t.first(n, l.length - 1);
n = t.last(n, n.length - i.length);
} else r.push(o[0]);
i.push(s.floatStrip(100 * a).toFixed(0) + "%");
var l = o[1].split("$");
r = r.concat(l);
i = i.concat(n);
}
for (var c = "", d = 0; d < r.length; d++) {
c += "<color=#FFFFFF >$</c>".replace("$", r[d]);
i[d] && (c += "<color=#A5ED69 >$</c>".replace("$", i[d]));
}
return c;
};
cc._RF.pop();
}, {
"battle.consts": "battle.consts",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
serverConfig: "serverConfig",
underscore: "underscore"
} ],
