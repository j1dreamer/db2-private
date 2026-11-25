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

def build(source,bundle,out,server,keep_package=False):
    from urllib.parse import urlsplit
    url=urlsplit(server)
    if url.scheme!='http' or not url.hostname or url.path not in ('','/') or url.username or url.password or url.query or url.fragment:raise ValueError('Use http://HOST:PORT with no path, userinfo or query')
    server=server.rstrip('/');port=url.port or 80
    text=Path(bundle).read_text()
    # Resolve endpoints from a saved setting on every launch, with the build argument as default.
    start='c.init = function() {\nif (!o.isDev) {'
    text=patch(text,start,'c.init = function() {\nvar privateUrl = cc.sys.localStorage.getItem("db2.private.server") || '+json.dumps(server)+';\nvar privateMatch = /^(http):\\/\\/([^/:]+)(?::(\\d+))?$/.exec(privateUrl);\nif (!privateMatch) throw new Error("Invalid private server URL");\nc.isSkipUpdate = true; c.isHideNoticePanel = true;\nif (!o.isDev) {')
    for old,new in [('o.url = "http://lz-fun.miaomuxian.cn:20003";','o.url = privateUrl;'),('o.staticUrl = "http://lz-fun.miaomuxian.cn:20001";','o.staticUrl = privateUrl;'),('o.gateHost = "lz-fun.miaomuxian.cn";','o.gateHost = privateMatch[2];'),('o.gatePort = "20100";','o.gatePort = privateMatch[3] || "80";')]:text=patch(text,old,new)
    text=patch(text,'init: function() {\nif (cc.sys.isNative) {\nif (cc.sys.os == cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "initPackageInfo", "()V");','init: function() {\nthis.sdkName="mmx"; this.channel="private"; this.packageInfo="DB2-private-dev"; return;\nif (cc.sys.isNative) {\nif (cc.sys.os == cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SDKAdapter", "initPackageInfo", "()V");')
    text=patch(text,'var script = data.runScriptInfo.script;','var script = ""; // Private client: disable downloaded script execution.')
    text=patch(text,'eval(data.msg.body);','console.warn("Remote code execution disabled in private client");')
    text=patch(text,'b.instance || (b.instance = this);\np.spThemeClassId', 'b.instance || (b.instance = this);\nwindow.DB2PrivateSettings && window.DB2PrivateSettings();\np.spThemeClassId')
    settings=(Path(__file__).parent/'private_settings.js').read_text()
    text='window.DB2_PRIVATE_DEFAULT_SERVER='+json.dumps(server)+';\n'+settings+'\n'+text
    text=patch(text,'msg: a,\nplayerId: t.player ? t.player.id : 0','msg: a,\ntoken: t.token || \"\",\nplayerId: t.player ? t.player.id : 0')
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
            zout.writestr(name,data)
    report={'stage':'development-client-not-device-tested','server':server,'source_sha256':file_hash(source),'patched_bundle_sha256':hashlib.sha256(text.encode()).hexdigest(),'apk_sha256':file_hash(out),'package':app_package,'sdk_login':'local-account','hot_update':False,'server_script_execution':False}
    out.with_suffix('.json').write_text(json.dumps(report,indent=2));out.with_suffix('.patched.js').write_text(text)
    print(json.dumps(report,indent=2))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--bundle',required=True);p.add_argument('--output',required=True);p.add_argument('--server',default='http://127.0.0.1:20003');p.add_argument('--keep-package',action='store_true');a=p.parse_args();build(a.source,a.bundle,a.output,a.server,a.keep_package)
