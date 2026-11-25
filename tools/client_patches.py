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

def patch_tail_transport(text):
    changes={
        'k.choose(U, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {':'k.choose(U, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {\nwindow.DB2_PRIVATE_TAIL_SEED = e._temp.seed;',
        's.BOSS_CONFIG = t;\ns.setSeed(Date.now());':'s.BOSS_CONFIG = t;\nvar privateTailSeed = window.DB2_PRIVATE_TAIL_SEED;\ndelete window.DB2_PRIVATE_TAIL_SEED;\ns.setSeed(privateTailSeed || Date.now());'
    }
    for old,new in changes.items():
        if text.count(old)!=1:raise ValueError('Unexpected tail transport implementation')
        text=text.replace(old,new,1)
    return text

def patch_boss_transport(text):
    for prefix,key,method in (('$','WORLD_BOSS','bossBattle'),('I','GUILD_BOSS','guildeBossBattle')):
        old=prefix+'.choose(this.data.selectIdxs, this.data.selectShipIdxs, function(e) {'
        if text.count(old)!=1:raise ValueError('Unexpected boss choose implementation')
        text=text.replace(old,old+'\nwindow.DB2_PRIVATE_'+key+'_SEED = e._temp.seed;',1)
        start=text.index('s.'+method+' = function(');end=text.index('s.'+method+'Instant = function(',start)
        section=text[start:end]
        if section.count('s.setSeed(Date.now());')!=1:raise ValueError('Unexpected boss seed implementation')
        section=section.replace('s.setSeed(Date.now());','var privateBossSeed = window.DB2_PRIVATE_'+key+'_SEED;\ndelete window.DB2_PRIVATE_'+key+'_SEED;\ns.setSeed(privateBossSeed || Date.now());')
        text=text[:start]+section+text[end:]
    for mode in ('worldBoss','guildBoss'):
        old='n.request("logic.'+mode+'Handler.challenge", {\nbossHp: e,'
        new='n.request("logic.'+mode+'Handler.challenge", {\nmanualRecordMap: window.__require("battleMain").manualRecordMap || {},\nisAuto: window.__require("battleMain").isAuto,\ntickNumber: window.__require("battle.fightHandler").area.timer.tickNumber,\nbossHp: e,'
        if text.count(old)!=1:raise ValueError('Unexpected boss settlement transport')
        text=text.replace(old,new,1)
    for name,roles,ships in (('e','t','n'),('a','n','i')):
        for field,values in (('attackTeamIndexs',roles),('attackShipIndexs',ships)):
            old=name+'.openInfo.'+field+' = '+name+'.openInfo.'+field+'.concat('+values+');'
            new=name+'.openInfo.'+field+' = '+name+'.openInfo.'+field+'.concat('+values+').filter(function(value, index, all) { return all.indexOf(value) === index; });'
            if text.count(old)!=1:raise ValueError('Unexpected boss roster callback')
            text=text.replace(old,new,1)
    return text

def patch_practice_transport(text):
    for prefix in ('_','y'):
        start=text.index(prefix+'.choose(this.statusData.opts.defenderId, this.data.selectIdxs, this.data.selectShipIdxs, this.statusData.opts.ctime, function(e) {')
        end=text.index('\nbreak;',start);section=text[start:end]
        old='d.practiceBattleInstant(l.clone(i), l.clone(o))'
        if section.count(old)!=1:raise ValueError('Unexpected practice combat transport')
        section=section.replace(old,'d.practiceBattleInstant(l.clone(i), l.clone(o), e._temp.seed)')
        text=text[:start]+section+text[end:]
    return text

def patch_eye_transport(text):
    start=text.index('P.choose(this.statusData.opts.rank, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {')
    end=text.index('\nbreak;',start);section=text[start:end];old='d.pkBattleInstant(l.clone(i), l.clone(o))'
    if section.count(old)!=1:raise ValueError('Unexpected eye combat transport')
    section=section.replace(old,'d.pkBattleInstant(l.clone(i), l.clone(o), e._temp.seed)')
    return text[:start]+section+text[end:]
