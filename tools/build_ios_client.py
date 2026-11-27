"""Build an unsigned private iOS IPA from the authorized original IPA.

Native instructions/SDK/framework bytes stay original. Two startup plugin load
commands and their files are removed after validating no imports use them.
The output MUST be legitimately re-signed.
"""
import argparse,gzip,hashlib,json,plistlib,subprocess,tempfile,zipfile
from pathlib import Path
from tools.build_client import encrypt,file_hash,patch,patch_client
from tools.decode_jsc import decrypt,gunzip
from tools.fix_ios_launch import KNOWN_NATIVE,PLUGINS,remove_plugin_commands

ROOT=Path(__file__).resolve().parents[1]

def build(source,out,server='http://db2-server.invalid:20003',bundle_id='com.j1dreamer.db2.private'):
    out=Path(out);out.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(source)as zin,tempfile.TemporaryDirectory()as td:
        roots=[n[:-len('Info.plist')]for n in zin.namelist()if n.startswith('Payload/')and n.count('/')==2 and n.endswith('.app/Info.plist')]
        if len(roots)!=1:raise ValueError('Expected one top-level iOS app')
        app=roots[0];info=plistlib.loads(zin.read(app+'Info.plist'))
        executable=app+info['CFBundleExecutable'];native=zin.read(executable)
        if hashlib.sha256(native).hexdigest()!=KNOWN_NATIVE:raise ValueError('Unrecognized original executable')
        native,native_report=remove_plugin_commands(native)
        removed_plugins=[app+p.removeprefix('@executable_path/')for p in PLUGINS]
        original=gunzip(decrypt(zin.read(app+'assets/main/index.jsc'))).decode()
        temp=Path(td);(temp/'ios.js').write_text(original)
        subprocess.run(['node',str(ROOT/'tools/ios_shared_bundle.cjs'),str(ROOT/'client/main.decoded.js'),str(temp/'ios.js'),str(temp/'shared.js'),str(temp/'shared.json')],check=True,capture_output=True)
        shared=json.loads((temp/'shared.json').read_text())
        text,data_report=patch_client((temp/'shared.js').read_text(),source,server)
        text=patch(text,'c.clientConfigUrl = o.url + "/user/clientConfig?platform=android";','c.clientConfigUrl = o.url + "/user/clientConfig?platform=ios";')
        # First launch must reach the editable server panel without contacting a
        # dummy URL. After saving a real endpoint/restarting, normal login runs.
        text=patch(text,'http.request(actUrl, null, function(data) {','if (/\\.invalid(?::|\\/|$)/.test(serverMain.url)) { baseView.removeLoading(); self.next2_(); return; }\nhttp.request(actUrl, null, function(data) {')
        text=patch(text,'initAssetsManager_: function() {','initAssetsManager_: function() {\nif (/\\.invalid(?::|\\/|$)/.test(l.url)) return;')
        changed_jsc=encrypt(gzip.compress(text.encode(),mtime=0))
        info['CFBundleIdentifier']=bundle_id
        info['CFBundleDisplayName']='DB2 Private Dev'
        info['NSLocalNetworkUsageDescription']='Connect to your authorized private DB2 game server over LAN or Tailscale.'
        # Keep original ATS policy, platform declarations, native dependencies.
        original_ats=info.get('NSAppTransportSecurity')
        removed=[];changed=[];unchanged=0
        with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as zout:
            for entry in zin.infolist():
                if entry.filename in removed_plugins or entry.filename.endswith('embedded.mobileprovision')or'/_CodeSignature/'in entry.filename:
                    removed.append(entry.filename);continue
                raw=zin.read(entry)
                if entry.filename==executable:raw=native;changed.append(entry.filename)
                elif entry.filename==app+'assets/main/index.jsc':raw=changed_jsc;changed.append(entry.filename)
                elif entry.filename==app+'Info.plist':raw=plistlib.dumps(info,fmt=plistlib.FMT_BINARY);changed.append(entry.filename)
                else:unchanged+=1
                zout.writestr(entry,raw)
    # Independently read back all preserved entries; compare native bytes too.
    with zipfile.ZipFile(source)as a,zipfile.ZipFile(out)as b:
        for entry in a.infolist():
            if entry.filename not in changed and entry.filename not in removed:
                if a.read(entry)!=b.read(entry.filename):raise ValueError('Unexpected changed resource: '+entry.filename)
        if b.read(executable)!=native:raise ValueError('Native executable changed')
        if gunzip(decrypt(b.read(app+'assets/main/index.jsc'))).decode()!=text:raise ValueError('JSC read-back failed')
    report={'stage':'unsigned-private-ios-development-not-device-tested','source_sha256':file_hash(source),'ipa_sha256':file_hash(out),'ipa_bytes':out.stat().st_size,'bundle_id':bundle_id,'native_executable_sha256':hashlib.sha256(native).hexdigest(),'all_preserved_entries_verified':unchanged,'modified_entries':changed,'removed_signature_provision_entries':removed,'native_libraries_modified':False,'native_executable_load_commands_modified':True,'native_instructions_modified':False,'removed_startup_plugins':removed_plugins,'native_launch_fix':native_report,'original_ats':original_ats,'canonical_data':data_report,'shared_bundle':shared,'default_server':server,'editable_server':True,'unconfigured_first_launch_skips_network':True,'tutorial':False,'speed_range':[1,10],'sdk_login':'local-account','private_transport_patches':True,'requires_resigning':True,'signed_ipa_built':False,'native_ios_execution_tested':False,'decoded_bundle_sha256':hashlib.sha256(text.encode()).hexdigest()}
    out.with_suffix('.json').write_text(json.dumps(report,indent=2)+'\n');out.with_suffix('.patched.js').write_text(text)
    print(json.dumps(report,indent=2));return report

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('source');parser.add_argument('output');parser.add_argument('--server',default='http://db2-server.invalid:20003');parser.add_argument('--bundle-id',default='com.j1dreamer.db2.private');args=parser.parse_args();build(args.source,args.output,args.server,args.bundle_id)
