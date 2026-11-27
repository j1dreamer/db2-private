"""Rebuild the pinned unsigned BoxInfo IPA with bounded login and startup repair."""
import argparse,gzip,hashlib,json,tempfile,zipfile
from pathlib import Path
from .decode_jsc import decrypt,gunzip
from .build_client import encrypt,patch
from .client_patches import patch_private_startup,patch_private_recovery
from .fix_ios_launch import repair
from .apply_apk_fix import sha
from .client_data import overlay
ROOT=Path(__file__).parents[1]
BASE_SHA='c6c324ce858b2e5d7106246882f80479458af713e4bdbf16e13b04e882dac10b'

def rebuild(source,output):
 source,output=Path(source),Path(output)
 if sha(source)!=BASE_SHA:raise ValueError('Expected original unsigned BoxInfo IPA')
 if output.exists():raise ValueError('Use a new output path')
 with tempfile.TemporaryDirectory(dir=output.parent)as td:
  clean=Path(td)/'launch.ipa';native=repair(source,clean)
  with zipfile.ZipFile(clean)as zin:
   name='Payload/dragonball.app/assets/main/index.jsc';old=gunzip(decrypt(zin.read(name))).decode()
   expected_overlay,data_report=overlay(source)
   if expected_overlay.strip()not in old:raise ValueError('IPA data overlay differs from the current ENG server tables')
   begin=old.index('// Server selector displayed');end=old.index('// Private client: persistent engine speed;',begin)
   settings=(ROOT/'tools/private_ui.js').read_text()+'\n'+(ROOT/'tools/private_connection.js').read_text()+'\n'+(ROOT/'tools/private_font.js').read_text()+'\n'+(ROOT/'tools/private_settings.js').read_text()+'\n'
   text=old[:begin]+settings+old[end:];text=patch_private_recovery(patch_private_startup(text))
   runtime_begin=text.index('// Private client: persistent engine speed;');runtime_end=text.index('// Authored private-server GM UI.',runtime_begin)if '// Authored private-server GM UI.'in text[runtime_begin:]else -1
   if runtime_end<0:raise ValueError('Unexpected private runtime boundary')
   text=text[:runtime_begin]+(ROOT/'tools/private_runtime.js').read_text()+'\n'+(ROOT/'tools/private_auto.js').read_text()+'\n'+text[runtime_end:]
   box_begin=text.index('// Authored quantity/close controls around the original ENG reward panel and RPCs.')
   box_end=text.index('// Private control panel: the shipped archive has no Time Peak scene module.',box_begin)
   text=text[:box_begin]+(ROOT/'tools/private_box.js').read_text()+'\n'+text[box_end:]
   text=patch(text,'initAssetsManager_: function() {\nif (/\\.invalid(?::|\\/|$)/.test(l.url)) return;','initAssetsManager_: function() {')
   script=encrypt(gzip.compress(text.encode(),mtime=0))
   with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as zout:
    for entry in zin.infolist():zout.writestr(entry,script if entry.filename==name else zin.read(entry))
  with zipfile.ZipFile(clean)as a,zipfile.ZipFile(output)as b:
   if b.testzip():raise ValueError('ZIP CRC failure')
   for entry in b.infolist():
    if entry.filename!=name and a.read(entry.filename)!=b.read(entry):raise ValueError('Unexpected changed resource')
   assert gunzip(decrypt(b.read(name))).decode()==text
  report={'ipa_sha256':sha(output),'ipa_bytes':output.stat().st_size,'native_launch_fix':native,'only_additional_modified_entry':name,'source_button_removed':True,'connection_timeout_ms':8000,'font_fallback':'Arial/system for Vietnamese labels','requires_resigning':True,'native_device_tested':False,'canonical_data_verified':data_report}
  return text,report

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);a=p.parse_args();_,r=rebuild(a.source,a.output);print(json.dumps(r,indent=2))
