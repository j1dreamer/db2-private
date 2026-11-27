"""Repackage the authorized extracted Android client; no Android source compilation.
Input: ZIP containing DB2-GD/ from the user's Drive archive.
"""
import argparse,zipfile,json,struct,gzip,hashlib,re
from pathlib import Path
KEY=b'e962577e-f57c-49'
MASK=0xffffffff
def file_hash(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()
def encrypt(data):
    words=list(struct.unpack('<'+'I'*((len(data)+3)//4),data+b'\0'*((-len(data))%4)));words.append(len(data))
    key=struct.unpack('<4I',KEY);n=len(words);z=words[-1];total=0
    for _ in range(6+52//n):
        total=(total+0x9e3779b9)&MASK;e=(total>>2)&3
        for p in range(n):
            y=words[(p+1)%n];mx=(((z>>5 ^ (y<<2))+(y>>3 ^ (z<<4))) ^ ((total^y)+(key[(p&3)^e]^z)))&MASK
            words[p]=(words[p]+mx)&MASK;z=words[p]
    return struct.pack('<'+'I'*n,*words)

def patch(text,old,new):
    if text.count(old)!=1:raise ValueError('Unexpected client build: '+old[:75])
    return text.replace(old,new,1)

def patch_client(text,source,server):
    from urllib.parse import urlsplit
    url=urlsplit(server)
    if url.scheme not in ('http','https') or not url.hostname or url.path not in ('','/') or url.username or url.password or url.query or url.fragment:raise ValueError('Use http(s)://HOST:PORT with no path, userinfo or query')
    server=server.rstrip('/');port=url.port or (443 if url.scheme=='https'else 80)
    gameplay_report={'baseline':'eng-sp-sss','ported_modules':[],'retained_gameplay':'original ENG modules','private_patches':'VIP/sync/GM/transport/VI/speed; explicitly authored'}
    from tools.client_data import overlay,patch_bundle
    data_script,data_report=overlay(source)
    data_report['gameplay_modules']=gameplay_report
    text=patch_bundle(text,data_script)
    # Resolve endpoints from a saved setting on every launch, with the build argument as default.
    start='c.init = function() {\nif (!o.isDev) {'
    text=patch(text,start,'c.init = function() {\nvar privateUrl = cc.sys.localStorage.getItem("db2.private.server") || '+json.dumps(server)+';\nvar privateMatch = /^(https?):\\/\\/([^/:]+)(?::(\\d+))?$/.exec(privateUrl);\nif (!privateMatch) throw new Error("Invalid private server URL");\nc.isHttps = privateMatch[1] === "https";\nc.isSkipUpdate = true; c.isHideNoticePanel = true; c.isSkipGuide = true;\nif (!o.isDev) {')
    for old,new in [('o.url = "http://lz-fun.miaomuxian.cn:20003";','o.url = privateUrl;'),('o.staticUrl = "http://lz-fun.miaomuxian.cn:20001";','o.staticUrl = privateUrl;'),('o.gateHost = "lz-fun.miaomuxian.cn";','o.gateHost = privateMatch[2];'),('o.gatePort = "20100";','o.gatePort = privateMatch[3] || (c.isHttps ? "443" : "80");')]:text=patch(text,old,new)
    text=patch(text,'init: function() {\nif (cc.sys.isNative) {\nif (cc.sys.os == cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "initPackageInfo", "()V");','init: function() {\nthis.sdkName="mmx"; this.channel="private"; this.packageInfo="DB2-private-dev"; return;\nif (cc.sys.isNative) {\nif (cc.sys.os == cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "initPackageInfo", "()V");')
    text=patch(text,'var script = data.runScriptInfo.script;','var script = ""; // Private client: disable downloaded script execution.')
    text=patch(text,'eval(data.msg.body);','console.warn("Remote code execution disabled in private client");')
    text=patch(text,'b.instance || (b.instance = this);\np.spThemeClassId', 'b.instance || (b.instance = this);\nwindow.DB2PrivateSettings && window.DB2PrivateSettings();\np.spThemeClassId')
    text=patch(text,'c.initLanguage = "en";','c.initLanguage = "vi";')
    text=patch(text,'c.setLanguage(n);','c.setLanguage(n);\nwindow.DB2PrivateLocale && window.DB2PrivateLocale.apply();')
    text=patch(text,'t.include([ "zh", "zh-tw", "es", "id", "th" ], e)','t.include([ "zh", "zh-tw", "es", "id", "th", "vi" ], e)')
    begin=text.index('languagePanel: [ function(');end=text.index('cc._RF.pop();',begin)
    part=text[begin:end];start=part.index('onYes_: function() {');stop=part.index('\nonClose_: function()',start)
    part=part[:start]+'onYes_: function() {\nwindow.DB2PrivateLocale.choose(this.data.selectLanguage);\n},'+part[stop:]
    text=text[:begin]+part+text[end:]
    try:from tools.client_patches import patch_response_boundary,patch_adventure_transport,patch_roster_removal,patch_arena_transport,patch_arena3v3_transport,patch_guild_membership,patch_private_sdk
    except ModuleNotFoundError:from client_patches import patch_response_boundary,patch_adventure_transport,patch_roster_removal,patch_arena_transport,patch_arena3v3_transport,patch_guild_membership,patch_private_sdk
    try:from tools.client_patches import patch_tail_transport,patch_boss_transport,patch_practice_transport,patch_eye_transport
    except ModuleNotFoundError:from client_patches import patch_tail_transport,patch_boss_transport,patch_practice_transport,patch_eye_transport
    try:from tools.client_patches import patch_endless_transport,patch_expedition_transport
    except ModuleNotFoundError:from client_patches import patch_endless_transport,patch_expedition_transport
    try:from tools.client_patches import patch_private_vouchers
    except ModuleNotFoundError:from client_patches import patch_private_vouchers
    try:from tools.client_patches import patch_activity_callbacks,patch_dream_state,patch_resource_transport,patch_tournament_controls,patch_guild_war_transport,patch_island_transport,patch_cooperative_transport,patch_time_peak_transport
    except ModuleNotFoundError:from client_patches import patch_activity_callbacks,patch_dream_state,patch_resource_transport,patch_tournament_controls,patch_guild_war_transport,patch_island_transport,patch_cooperative_transport,patch_time_peak_transport
    text=patch_activity_callbacks(text)
    text=patch_dream_state(text)
    text=patch_resource_transport(text)
    text=patch_tournament_controls(text)
    text=patch_guild_war_transport(text)
    text=patch_island_transport(text)
    text=patch_cooperative_transport(text)
    text=patch_time_peak_transport(text)
    text=patch_private_vouchers(text)
    text=patch_endless_transport(text)
    text=patch_expedition_transport(text)
    text=patch_tail_transport(text)
    text=patch_boss_transport(text)
    text=patch_practice_transport(text)
    text=patch_eye_transport(text)
    text=patch_response_boundary(text)
    text=patch_adventure_transport(text)
    text=patch_roster_removal(text)
    text=patch_arena_transport(text)
    text=patch_arena3v3_transport(text)
    text=patch_guild_membership(text)
    text=patch_private_sdk(text)
    text=patch(text,'this.skipMove = !1;','this.skipMove = cc.sys.localStorage.getItem("db2.private.fastSummon") !== "0";')
    text=patch(text,'onSkip_: function() {\nthis.skipMove = !this.skipMove;','onSkip_: function() {\nthis.skipMove = !this.skipMove;\ncc.sys.localStorage.setItem("db2.private.fastSummon", this.skipMove ? "1" : "0");')
    from tools.client_patches import patch_eng_ui_repairs,patch_box_quantities,patch_private_startup,patch_private_recovery
    text=patch_private_recovery(patch_private_startup(patch_box_quantities(patch_eng_ui_repairs(text))))
    settings=(Path(__file__).parent/'private_ui.js').read_text()+'\n'+(Path(__file__).parent/'private_connection.js').read_text()+'\n'+(Path(__file__).parent/'private_font.js').read_text()+'\n'+(Path(__file__).parent/'private_settings.js').read_text()
    settings+='\n'+(Path(__file__).parent/'private_runtime.js').read_text()
    settings+='\n'+(Path(__file__).parent/'private_auto.js').read_text()
    settings+='\n'+(Path(__file__).parent/'private_gm.js').read_text()
    settings+='\n'+(Path(__file__).parent/'private_box.js').read_text()
    settings+='\n'+(Path(__file__).parent/'private_time_peak.js').read_text()
    settings+='\nwindow.DB2_PRIVATE_VI='+json.dumps(json.loads((Path(__file__).resolve().parents[1]/'tables/localization/vi.merged.json').read_text()),ensure_ascii=False,separators=(',',':'))+';\n'
    settings+=(Path(__file__).parent/'private_locale.js').read_text()
    text='window.DB2_PRIVATE_DEFAULT_SERVER='+json.dumps(server)+';\n'+settings+'\n'+text
    text=patch(text,'msg: a,\nplayerId: t.player ? t.player.id : 0','msg: a,\ntoken: t.token || \"\",\nplayerId: t.player ? t.player.id : 0')
    return text,data_report

def build(source,bundle,out,server,keep_package=False):
    text,data_report=patch_client(Path(bundle).read_text(),source,server)
    # Equal-length AXML string replacement keeps binary string offsets intact.
    # Java/Native class names and resource IDs are preserved.
    app_package='com.dp2.web.apk' if keep_package else 'com.dp2.web.dev' 
    changed=encrypt(gzip.compress(text.encode(),mtime=0));out=Path(out);out.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(source) as zin,zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as zout:
        names=zin.namelist();prefix='DB2-GD/' if 'DB2-GD/AndroidManifest.xml' in names else ''
        if prefix+'AndroidManifest.xml' not in names:raise ValueError('Missing AndroidManifest.xml')
        for entry in zin.infolist():
            if entry.is_dir() or not entry.filename.startswith(prefix):continue
            name=entry.filename[len(prefix):]
            if name.upper().startswith('META-INF/'):continue
            data=changed if name=='assets/assets/main/index.jsc' else zin.read(entry)
            if name=='AndroidManifest.xml' and not keep_package:
                old='com.dp2.web.apk'.encode('utf-16le');new=app_package.encode('utf-16le')
                if old not in data:raise ValueError('Unexpected Android manifest string encoding')
                data=data.replace(old,new)
            # Android 11+ rejects compressed resources.arsc for target SDK >= 30.
            compression=zipfile.ZIP_STORED if name=='resources.arsc' else zipfile.ZIP_DEFLATED
            zout.writestr(name,data,compress_type=compression)
    report={'stage':'development-client-not-device-tested','server':server,'source_sha256':file_hash(source),'patched_bundle_sha256':hashlib.sha256(text.encode()).hexdigest(),'apk_sha256':file_hash(out),'package':app_package,'sdk_login':'local-account','tutorial':False,'speed_range':[1,10],'response_error_recovery':True,'hot_update':False,'server_script_execution':False}
    report['canonical_data']=data_report
    out.with_suffix('.json').write_text(json.dumps(report,indent=2));out.with_suffix('.patched.js').write_text(text)
    print(json.dumps(report,indent=2))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--bundle',required=True);p.add_argument('--output',required=True);p.add_argument('--server',default='http://127.0.0.1:20003');p.add_argument('--keep-package',action='store_true');a=p.parse_args();build(a.source,a.bundle,a.output,a.server,a.keep_package)
