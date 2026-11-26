socket.on("onAllServerBattle", function(e) {
var a = require("allServerBattleScene");
if (e.isEnd) a.instance && a.instance.onExitBattle_(); else {
for (var t in e) serverMain.player.extra.allServerBattle[t] = e[t];
if (a.instance) {
a.instance.updateBattle_();
a.instance.viewResourcePanel.isPanel && a.instance.onResource_();
}
null == e.moveCD && null == e.getRewardCD || a.instance && a.instance.autoUpdateCD_();
}
});
