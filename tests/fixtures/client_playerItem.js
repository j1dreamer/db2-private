playerItem: [ function(e, a) {
"use strict";
cc._RF.push(a, "7d061Se1MBAMZx/NIvsU6ZG", "playerItem");
var t = e("underscore"), n = e("baseView"), i = e("resource"), r = e("buildExt"), s = e("soundComponent");
cc.Class({
extends: cc.Component,
properties: {
photoSp: cc.Sprite,
shipSp: cc.Sprite
},
update_: function(e) {
n.setSpriteFrame(this.photoSp, i["photo_role_" + e.photoImgId + "_png"]);
n.setSpriteFrame(this.shipSp, i["photo_ship_" + e.shipImgId + "_png"]);
},
setClickEvent_: function(e, a, t) {
if (n = this.node.getComponent(cc.Button)) {
n.clickEvents[0].target = e;
n.clickEvents[0].component = a;
n.clickEvents[0].handler = t;
} else {
var n = this.node.addComponent(cc.Button), i = new cc.Component.EventHandler();
i.target = e;
i.component = a;
i.handler = t;
n.clickEvents.push(i);
n.transition = cc.Button.Transition.SCALE;
n.duration = .1;
n.zoomScale = 1.05;
this.node.addComponent(s);
}
}
}).genData = function(e) {
e = e || {
photoImgId: 1001,
shipImgId: 901
};
if (r.hideRoleClassIds) {
var a = Number(String(e.photoImgId).slice(2, 4));
if (t.include(r.hideRoleClassIds, a)) {
a = 0 == (a %= 30) ? 30 : a;
e.photoImgId = "10" + (a < 10 ? "0" : "") + a;
}
}
if (r.hideShipClassIds) {
a = Number(String(e.shipImgId).slice(1, 3));
if (t.include(r.hideShipClassIds, a)) {
a = 1;
e.shipImgId = "9" + (a < 10 ? "0" : "") + a;
}
}
var n = e.frameId || e.shipImgId;
return {
photoImgId: e.photoImgId,
shipImgId: n
};
};
cc._RF.pop();
}, {
baseView: "baseView",
buildExt: "buildExt",
resource: "resource",
soundComponent: "soundComponent",
underscore: "underscore"
} ],
