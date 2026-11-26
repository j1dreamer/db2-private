"""Publish complete ENG GM clients with GitHub Actions' own upload identity."""
import importlib.util,json,subprocess,sys
from pathlib import Path
from tools.package_full_release import package,sha
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.release';OUT=WORK/'publish';OUT.mkdir(parents=True,exist_ok=True)
release=json.loads((ROOT/'release.json').read_text());tag=release['tag'];repo=release['repository']
spec=importlib.util.spec_from_file_location('full_clients',ROOT/'Download-Clients.py');clients=importlib.util.module_from_spec(spec);spec.loader.exec_module(clients)
apk=clients.android(OUT,WORK/'cache',4);ipa=clients.ios(OUT,WORK/'cache',4);result=package(apk,ipa,OUT)
def run(args):subprocess.run(args,cwd=ROOT,check=True)
probe=subprocess.run(['gh','release','view',tag,'--repo',repo],capture_output=True)
if probe.returncode:run(['gh','release','create',tag,'--repo',repo,'--target',result['source_commit'],'--draft','--prerelease','--title','DB2 ENG SSS/SP + GM v2','--notes-file',str(ROOT/'INSTALL.txt')])
files=[OUT/name for name in (apk.name,ipa.name,release['server']['file'],'README-FIRST.txt','release-manifest.json','SHA256SUMS.txt')]
for p in files:run(['gh','release','upload',tag,str(p),'--repo',repo,'--clobber'])
run(['gh','release','edit',tag,'--repo',repo,'--target',result['source_commit'],'--draft=false','--prerelease'])
