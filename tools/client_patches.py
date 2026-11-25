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
