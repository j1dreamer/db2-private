"""Focused patches with exact anchors for the recovered client build."""
SOCKET_OLD='''r.FUNS.reqMsgFilter(a);
a = l.decodeData(e, a);
l.log(e, a);
l.receiveCb && l.receiveCb(a);
try {
a.code != l.code.FAIL && n(a);
} catch (e) {
if (!cc.sys.isNative) throw e;
}'''
SOCKET_NEW='''try {
r.FUNS.reqMsgFilter(a);
a = l.decodeData(e, a);
l.log(e, a);
l.receiveCb && l.receiveCb(a);
a.code != l.code.FAIL && n && n(a);
} catch (privateResponseError) {
try {
window.DB2PrivateRuntime.reportResponseError(e, privateResponseError);
} catch (privateReportingError) { console.error(privateReportingError); }
}'''
def patch_response_boundary(text):
    if text.count(SOCKET_OLD)!=1:raise ValueError('Unexpected socket response implementation')
    text=text.replace(SOCKET_OLD,SOCKET_NEW,1)
    old='l._request = function(e, a, n) {\nt.request(e, a, function(a) {'
    new='l._request = function(e, a, n) {\nl.timeOut = /(?:\\.challenge(?:Top)?|\\.endSmap|\\.end|\\.battle|\\.fight|\\.finish)$/i.test(e) ? 60 : 10;\nt.request(e, a, function(a) {'
    if text.count(old)!=1:raise ValueError('Unexpected request timeout implementation')
    return text.replace(old,new,1)

def patch_adventure_transport(text):
    changes={
        'h(e._temp.showEntityIdsMap, !1);':'window.DB2_PRIVATE_BATTLE_SEED = e._temp.seed;\nh(e._temp.showEntityIdsMap, !1);',
        's.manualRecordMap = {};\ns.damageMap = {};\ns.usedMap = {};\ns.setSeed(Date.now());\no.smapBattle(e, a, t);':'s.manualRecordMap = {};\ns.damageMap = {};\ns.usedMap = {};\nvar privateBattleSeed = window.DB2_PRIVATE_BATTLE_SEED;\ndelete window.DB2_PRIVATE_BATTLE_SEED;\ns.setSeed(privateBattleSeed || Date.now());\no.smapBattle(e, a, t);',
        'p.endSmap(n, this.statusData.opts.selectIdxs, this.statusData.opts.selectShipIdxs, 0, {}, {}, 0, function(e) {':'p.endSmap(n, this.statusData.opts.selectIdxs, this.statusData.opts.selectShipIdxs, $.seed, $.preManualRecordMap || {}, $.manualRecordMap || {}, c.area.timer.tickNumber, function(e) {'
    }
    for old,new in changes.items():
        if text.count(old)!=1:raise ValueError('Unexpected adventure transport implementation')
        text=text.replace(old,new,1)
    return text

def patch_roster_removal(text):
    changes={
        'for (var i in e) {\nthis.roles[i] = e[i];\nthis.roles[i].idx = i;':'for (var i in e) {\nif (!e[i]) { delete this.roles[i]; delete this.md5Map[i]; continue; }\nthis.roles[i] = e[i];\nthis.roles[i].idx = i;',
        'e.team && this.emit(u.EVENT.TEAM, t.values(e.team.roles), e.team.friendshipAttr);':'''if (e.team) {
var privateRemovedRoleIds = [];
for (var privateRoleId in e.team.roles) if (!e.team.roles[privateRoleId]) privateRemovedRoleIds.push(privateRoleId);
if (privateRemovedRoleIds.length) {
var privateRosterScene = require("sceneManager");
var privateRosterCache = privateRosterScene.teamData || {};
for (var privateRemovedIndex = 0; privateRemovedIndex < privateRemovedRoleIds.length; privateRemovedIndex++) {
var privateRemovedRoleId = privateRemovedRoleIds[privateRemovedIndex];
if (privateRosterCache.teamItemMap) delete privateRosterCache.teamItemMap[privateRemovedRoleId];
if (privateRosterCache.roleSceneMap) delete privateRosterCache.roleSceneMap[privateRemovedRoleId];
}
this.emit(u.EVENT.TEAM, t.values(this.team.roles), e.team.friendshipAttr);
privateRosterScene.popToHomeScene && privateRosterScene.popToHomeScene();
} else this.emit(u.EVENT.TEAM, t.values(e.team.roles), e.team.friendshipAttr);
}'''
    }
    for old,new in changes.items():
        if text.count(old)!=1:raise ValueError('Unexpected roster removal implementation')
        text=text.replace(old,new,1)
    return text

def patch_arena_transport(text):
    changes={
        'h = d.pkBattleInstant(l.clone(i), l.clone(o)), u = c.ARENA_BACKGROUND_IMG_IDS, p = u[':'h = d.pkBattleInstant(l.clone(i), l.clone(o), e._temp.seed), u = c.ARENA_BACKGROUND_IMG_IDS, p = u[',
        'return e <= l.CONSTS.ROBOT_COUNT;':'return e < 0; // Private NPC IDs are negative; real player IDs start at 1.'
    }
    for old,new in changes.items():
        if text.count(old)!=1:raise ValueError('Unexpected arena transport implementation')
        text=text.replace(old,new,1)
    return text

def patch_arena3v3_transport(text):
    old='''p.choose(this.statusData.opts.defenderId, this.data.selectIdxsMap, this.data.selectShipIdxsMap, function(e) {
var n, o, h = e._temp.attackTeam'''
    new='''p.choose(this.statusData.opts.defenderId, this.data.selectIdxsMap, this.data.selectShipIdxsMap, function(e) {
var n = e._temp.seed, o, h = e._temp.attackTeam'''
    if text.count(old)!=1:raise ValueError('Unexpected arena3v3 transport implementation')
    return text.replace(old,new,1)

def patch_guild_membership(text):
    old='u.player.guild.members.push(n);'
    new='if (!t.findWhere(u.player.guild.members, { playerId: n.playerId })) u.player.guild.members.push(n);'
    if text.count(old)!=1:raise ValueError('Unexpected guild member callback implementation')
    return text.replace(old,new,1)

def patch_private_sdk(text):
    changes={
        'emitData: function(e, a, n) {\nif (!r.isNoEmit || e == h.EMIT_TYPE.LOGIN) {':'emitData: function(e, a, n) {\nreturn; // Private build: no native SDK telemetry.\nif (!r.isNoEmit || e == h.EMIT_TYPE.LOGIN) {',
        'pay: function(e, a, n, s) {\nvar o = c.player,':'pay: function(e, a, n, s) {\nvar privatePaymentView = window.__require("baseView");\nvar privateGoods = c.player && c.player.extra.goodsList[e];\nif (!privateGoods || !privateGoods.privateCostGem) { privatePaymentView.removeLoading(); privatePaymentView.addHintPanel("This private server uses in-game gem offers only."); return; }\nprivatePaymentView.addLoading();\nwindow.__require("playerHandler").buyGemGoods(Number(e), privateGoods.privateCostGem, function(privateResult) {\nif (privateResult._temp && privateResult._temp.entityCountMap) privatePaymentView.addRewardEffectPanel(privateResult._temp.entityCountMap);\n});\nreturn;\nvar o = c.player,'
    }
    for old,new in changes.items():
        if text.count(old)!=1:raise ValueError('Unexpected private SDK implementation')
        text=text.replace(old,new,1)
    return text
