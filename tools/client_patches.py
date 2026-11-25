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
    return text.replace(SOCKET_OLD,SOCKET_NEW,1)

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
