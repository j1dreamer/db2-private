"""Run inside GitHub Actions, using its scoped release-upload identity."""
import hashlib,json,os,shutil,subprocess,sys,urllib.request,zipfile
from pathlib import Path
from tools.package_full_release import package,sha
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'.release';WORK.mkdir(exist_ok=True);OUT=WORK/'publish';OUT.mkdir(exist_ok=True)
REPO='j1dreamer/db2-private';TAG='longzhidao-v1.0.0-dev';SOURCE_COMMIT='81bfd992483a005a3e76cc977e3ba4b9bcff0337'
def run(args):subprocess.run(args,cwd=ROOT,check=True)
def download(url,path):
 with urllib.request.urlopen(url,timeout=120)as source,Path(path).open('wb')as dest:shutil.copyfileobj(source,dest,1024*1024)
# The transfer branch is an internal delivery source. Users only download complete release assets.
transport=WORK/'transport';run(['git','clone','--depth','1','--branch','release-assets-longzhidao','https://github.com/'+REPO+'.git',str(transport)])
manifest=json.loads((transport/'manifest.json').read_text());ipa=OUT/'LongChiDao-VI-iOS-unsigned.ipa'
with ipa.open('wb')as output:
 for part in manifest['parts']:
  name=part['file']
  if Path(name).parts[0]!='parts'or len(Path(name).parts)!=2 or Path(name).suffix!='.bin':raise ValueError('Invalid transfer path')
  p=transport/name
  if p.stat().st_size!=part['bytes']or sha(p)!=part['sha256']:raise ValueError('IPA transfer checksum mismatch')
  with p.open('rb')as source:shutil.copyfileobj(source,output,1024*1024)
if ipa.stat().st_size!=manifest['bytes']or sha(ipa)!=manifest['sha256']:raise ValueError('Incomplete IPA')
# Reconstruct the already-verified signed APK; do not re-sign or change its bytes.
base=WORK/'DB2-Private-Android-dev.apk';run([sys.executable,'tools/download_apk.py','--output',str(base)])
patch=WORK/'patch';patch.mkdir(exist_ok=True);archive=WORK/'client-patch.zip'
download('https://raw.githubusercontent.com/'+REPO+'/'+SOURCE_COMMIT+'/Client-LongChiDao-VI-Patch.zip',archive)
if sha(archive)!='2f0b4b640391fc2bcd9bed25391cee966385162d4f25527625f4cd6df71d16f2':raise ValueError('Unexpected client patch')
with zipfile.ZipFile(archive)as z:
 for name in ('apply-dev.py','plan.json','literals.bin'):(patch/name).write_bytes(z.read(name))
apk=OUT/'LongChiDao-VI-Android.apk';run([sys.executable,str(patch/'apply-dev.py'),'--source',str(WORK/'DB2-Private-Android-fixed.apk'),'--output',str(apk),'--patch',str(patch)])
result=package(apk,ipa,OUT)
result['distribution_notes']='Complete source/APK/IPA files. Transfer parts are internal and not needed by end users.'
p=OUT/'release-manifest.json';p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
assets=[OUT/name for name in ('LongChiDao-VI-Android.apk','LongChiDao-VI-iOS-unsigned.ipa','LongChiDao-Server.zip','README-FIRST.txt','release-manifest.json')]
(OUT/'SHA256SUMS.txt').write_text(''.join(sha(p)+'  '+p.name+'\n'for p in assets));assets.append(OUT/'SHA256SUMS.txt')
# Keep the complete release as draft until every asset is uploaded and checksummed.
for p in assets:run(['gh','release','upload',TAG,str(p),'--repo',REPO,'--clobber'])
release=json.loads(subprocess.check_output(['gh','release','view',TAG,'--repo',REPO,'--json','assets'],text=True))
actual={p['name']:p for p in release['assets']}
for p in assets:
 if p.name not in actual or actual[p.name]['size']!=p.stat().st_size:raise ValueError('Missing/incomplete uploaded asset: '+p.name)
run(['gh','release','edit',TAG,'--repo',REPO,'--target',result['source_commit'],'--draft=false','--prerelease'])
print('Published https://github.com/'+REPO+'/releases/tag/'+TAG)
