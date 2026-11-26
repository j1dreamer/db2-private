worshipRankPanel: [ function(e, a) {
"use strict";
cc._RF.push(a, "d6edaBQt3dJSorqOsY+uwwA", "worshipRankPanel");
e("underscore");
var t = e("i18n"), n = e("helper"), i = (e("serverMain"), e("serverConfig"), e("arena3v3Handler")), r = e("allServerBattleHandler"), s = e("worshipBattleHandler"), o = e("doubleBattleHandler"), l = e("baseView"), c = e("playerItem"), d = cc.Class({
extends: cc.Component,
properties: {
rankItem: cc.Node,
rankScrollView: cc.Node,
rankItemsLayout: cc.Node,
rank1SpriteFrame: cc.SpriteFrame,
rank2SpriteFrame: cc.SpriteFrame,
rank3SpriteFrame: cc.SpriteFrame
},
onLoad: function() {
this.rankScrollView.active = !1;
this.rankItem.active = !1;
},
update_: function(e) {
this.data = e;
var a = d.RANK_TYPE, t = this;
switch (e.type) {
case a.ARENA_3V3:
l.addLoading();
i.worshipRank(function(e) {
t.updateRankItems(e._temp.list);
});
break;

case a.ALL_SERVER_BATTLE:
l.addLoading();
r.worshipRank(function(e) {
t.updateRankItems(e._temp.list);
});
break;

case a.WORSHIP_BATTLE:
l.addLoading();
s.worshipRank(function(e) {
t.updateRankItems(e._temp.list);
});
break;

case a.DOUBLE_BATTLE:
l.addLoading();
o.worshipRank(e.opts.themeNo, function(e) {
t.updateRankItems(e._temp.list);
});
}
},
updateRankItems: function(e) {
this.rankItemMap = this.rankItemMap || {};
l.preHideNodeMap(this.rankItemMap);
for (var a in e) {
var i = e[a], r = this.rankItemMap[a];
if (!r) {
(r = cc.instantiate(this.rankItem)).parent = this.rankItemsLayout;
this.rankItemMap[a] = r;
}
r.active = !0;
l.markHideNode(r);
r.data = {
defenderId: i.playerId
};
var s = r.getChildByName("player_item_layout"), o = c.genData(i.playerPhotoInfo);
s.getChildByName("player_item").getComponent("playerItem").update_(o);
s.getChildByName("name_label").getComponent(cc.Label).string = i.playerName;
s.getChildByName("level_label").getComponent(cc.Label).string = t.t("LV.$1", [ i.playerLevel ]);
s.getChildByName("server_label").getComponent(cc.Label).string = t.t("$1区", [ i.serverId ]);
var d = r.getChildByName("rank_num_label");
d.active = !1;
var h = r.getChildByName("rank_num_sp");
h.active = !1;
if (this["rank" + i.rank + "SpriteFrame"]) {
h.active = !0;
h.getComponent(cc.Sprite).spriteFrame = this["rank" + i.rank + "SpriteFrame"];
} else {
d.getComponent(cc.Label).string = i.rank;
d.active = !0;
}
r.getChildByName("worship_times_label").getChildByName("value_label").getComponent(cc.Label).string = i.value;
}
l.hideNodeMap(this.rankItemMap);
this.rankScrollView.active || this.scheduleOnce(function() {
n.scrollviewFadeIn(this.rankScrollView);
}, .2);
this.rankScrollView.getComponent(cc.ScrollView).stopAutoScroll();
this.rankScrollView.getComponent(cc.ScrollView).scrollToTop(0);
this.rankScrollView.getComponent("listViewComponent").delayUpdate_(.2);
},
onClose_: function() {
l.removePanel(this.node);
}
});
d.RANK_TYPE = {
ARENA_3V3: 1,
ALL_SERVER_BATTLE: 2,
WORSHIP_BATTLE: 3
};
d.genData = function(e, a) {
return {
type: e,
opts: a = a || {}
};
};
cc._RF.pop();
}, {
allServerBattleHandler: "allServerBattleHandler",
arena3v3Handler: "arena3v3Handler",
baseView: "baseView",
doubleBattleHandler: "doubleBattleHandler",
helper: "helper",
i18n: "i18n",
playerItem: "playerItem",
serverConfig: "serverConfig",
serverMain: "serverMain",
underscore: "underscore",
worshipBattleHandler: "worshipBattleHandler"
} ],
