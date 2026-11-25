shipItem: [ function(e, a) {
"use strict";
cc._RF.push(a, "a6eaayeJNZL25QgziAZNidG", "shipItem");
e("i18n"), e("helper");
var t = e("dataApi"), n = (e("serverConfig"), e("baseView")), i = e("resource");
cc.Class({
extends: cc.Component,
properties: {
shellSp: cc.Sprite,
shipSp: cc.Sprite,
typeSp: cc.Sprite
},
update_: function(e) {
this.data = e;
n.setSpriteFrame(this.shellSp, i["img_" + e.imgId + "_png"]);
n.setSpriteFrame(this.typeSp, i["misc_ship_type_" + e.attrType + "_png"]);
},
setClickEvent_: function(e, a, t) {
var n = this.node.getComponent(cc.Button);
n.interactable = !0;
n.clickEvents[0].target = e;
n.clickEvents[0].component = a;
n.clickEvents[0].handler = t;
}
}).genData = function(e) {
var a = t.findEntityById(e.kindId);
return {
kindId: e.kindId,
imgId: a.imgId,
attrType: a.attrType,
_item: e,
_data: a
};
};
cc._RF.pop();
}, {
baseView: "baseView",
dataApi: "dataApi",
helper: "helper",
i18n: "i18n",
resource: "resource",
serverConfig: "serverConfig"
} ],
