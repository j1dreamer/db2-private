"""Reproduce canonical data/combat comparisons against the user's original IPA.

Requires Node.js and tools/js-parser's Acorn dependency. Executes recovered JS
headlessly; does not run a native iOS app or produce an installable private IPA.
"""
import argparse,sys,json,subprocess,hashlib,shutil,zipfile
from pathlib import Path
from tools.client_data import overlay,patch_bundle,canonical
from tools.build_client import encrypt
from tools.decode_jsc import gunzip,decrypt
from tools.extract_tables import extract
from server.profile import new_profile,character,table
from server.battle import build_team
from server.arena import npc,raw_team,combat_raw
REPO=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--ios-archive',type=Path,required=True)
parser.add_argument('--android-archive',type=Path,required=True)
parser.add_argument('--patched-ios-archive',type=Path,help='Verify modules from the actual built private IPA, including Long Chi Dao gameplay ports')
parser.add_argument('--work-dir',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args();ROOT=args.work_dir.resolve();ROOT.mkdir(parents=True,exist_ok=True)
args.output.parent.mkdir(parents=True,exist_ok=True)
modules=ROOT/'modules';decoded=ROOT/'decoded/assets/main';decoded.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(args.ios_archive)as z:
 names=[n for n in z.namelist()if n.startswith('Payload/')and n.endswith('.app/assets/main/index.jsc')]
 if len(names)!=1:raise ValueError('Expected exactly one iOS main JSC')
 (decoded/'index.js').write_bytes(gunzip(decrypt(z.read(names[0]))))
subprocess.run(['node',str(REPO/'tools/split_bundle.cjs'),str(decoded/'index.js'),str(modules)],check=True,capture_output=True)
engine_modules=modules
embedded_script=None
if args.patched_ios_archive:
 with zipfile.ZipFile(args.patched_ios_archive)as z:
  names=[n for n in z.namelist()if n.startswith('Payload/')and n.endswith('.app/assets/main/index.jsc')]
  if len(names)!=1:raise ValueError('Expected one patched iOS main JSC')
  patched=gunzip(decrypt(z.read(names[0])));(ROOT/'patched-ios.js').write_bytes(patched)
 subprocess.run(['node',str(REPO/'tools/extract_client_overlay.cjs'),str(ROOT/'patched-ios.js'),str(ROOT/'embedded-overlay.js')],check=True,capture_output=True)
 embedded_script=(ROOT/'embedded-overlay.js').read_text()
 engine_modules=ROOT/'patched-modules'
 subprocess.run(['node',str(REPO/'tools/split_bundle.cjs'),str(ROOT/'patched-ios.js'),str(engine_modules)],check=True,capture_output=True)
engine=ROOT/'engine';server=engine/'server';target=server/'battle_modules';target.mkdir(parents=True,exist_ok=True)
extract(args.ios_archive,engine/'tables')
shutil.copyfile(REPO/'tables/clientRules.json',engine/'tables/clientRules.json')
for p in (REPO/'server/battle_modules').glob('*.js'):shutil.copyfile(engine_modules/p.name,target/p.name)
shutil.copyfile(REPO/'server/battle_worker.cjs',server/'battle_worker.cjs')

def run_node(script,payload):
 p=subprocess.run(['node',str(script)],input=json.dumps(payload),text=True,capture_output=True,timeout=45)
 if p.returncode:raise RuntimeError(p.stderr[-2000:])
 return json.loads(p.stdout)

def compare(a,b,prefix=''):
 if type(a)is not type(b)or not isinstance(a,(dict,list)):return []if a==b else[prefix]
 if isinstance(a,list):
  if len(a)!=len(b):return[prefix+'.length']
  return [k for i,(x,y)in enumerate(zip(a,b))for k in compare(x,y,prefix+'.'+str(i))]
 return [prefix+'.'+k for k in a.keys()^b.keys()]+[v for k in a.keys()&b.keys()for v in compare(a[k],b[k],prefix+'.'+k)]
script,iosreport=overlay(args.ios_archive);androidscript,androidreport=overlay(args.android_archive)
canonical_tables,maps,digest=canonical()
result={'canonical_sha256':digest,'android':androidreport,'ios':iosreport,'native_execution_tested':False,'cases':[]}
result['actual_private_ipa_modules_verified']=bool(args.patched_ios_archive)
# Actual iOS modules load actual iOS tables, then the same generated overlay that
# is injected at logoScene's verified initialization boundary.
base=(ROOT/'engine/server/battle_worker.cjs').read_text()
base=base.replace("load('dataApi').init();",'context.window={};vm.runInNewContext('+json.dumps(embedded_script or script)+',context);context.window.DB2PrivateData.applyRaw(cache.data);\nload(\'dataApi\').init();context.window.DB2PrivateData.applyConfig(load(\'serverConfig\'));context.window.DB2PrivateData.applyBuildExt(cache.buildExt);')
if embedded_script:
 base=base.replace("const longRules=JSON.parse(fs.readFileSync(path.join(__dirname,'../tables/clientRules.json'),'utf8'));","const longRules={flags:{},config:{}}; // Verify only rules shipped inside the IPA")
worker=ROOT/'engine/server/canonical_worker.cjs';worker.write_text(base)
originalconst=run_node(REPO/'server/battle_worker.cjs',{'mode':'constants'});iosconst=run_node(worker,{'mode':'constants'});result['constant_differences']=compare(originalconst,iosconst)
for mode in ('pvp','practice','island'):
 for seed in (1,777):
  payload={'mode':mode,'seed':seed,'team':combat_raw(raw_team(npc(20))),'defender':combat_raw(raw_team(npc(18)))}
  a=run_node(REPO/'server/battle_worker.cjs',payload);b=run_node(worker,payload);diff=compare(a,b)
  result['cases'].append({'mode':mode,'seed':seed,'identical_full_result':not diff,'difference_paths':diff[:20]})
kind=next(r['kindId']for r in table('role')if 105501 in r['skillIds']);a=new_profile(1,1,'A','a');b=new_profile(2,2,'B','b')
for p,k in ((a,kind),(b,100101)):
 r=character(k,1);r.update(level=80,star=3);r['attr'].update(hp=100000,atk=1000,mdef=50,hit=100,crit=0,dodge=0);r['attr']['def']=50;r['initAttr']=dict(r['attr']);p['team']['roles']={'1':r}
for seed in (1,777):
 payload={'mode':'pvp','seed':seed,'team':build_team(a,['1'],[]),'defender':build_team(b,['1'],[])}
 x=run_node(REPO/'server/battle_worker.cjs',payload);y=run_node(worker,payload);diff=compare(x,y)
 result['cases'].append({'mode':'pvp','seed':seed,'changed_skill':105501,'identical_full_result':not diff,'difference_paths':diff[:20],'android_damage':x['damageMap'],'ios_canonical_damage':y['damageMap']})
# Validate the exact logoScene source anchor; the worker above executes its generated overlay calls.
logo=patch_bundle((ROOT/'modules/logoScene.js').read_text(),script)
(ROOT/'ios-canonical-logo.js').write_text(logo)
# Build data-only iOS JSC as a reviewable static artifact; not an installable IPA.
text=patch_bundle((ROOT/'decoded/assets/main/index.js').read_text(),script);jsc=encrypt(__import__('gzip').compress(text.encode(),mtime=0))
(ROOT/'ios-canonical-data-only.jsc').write_bytes(jsc)
result['ios_data_only_jsc']={'sha256':hashlib.sha256(jsc).hexdigest(),'decoded_sha256':hashlib.sha256(text.encode()).hexdigest(),'bytes':len(jsc),'private_server_endpoint_patched':False,'signed_ipa_built':False}
# Full 34-table values after production overlay must equal canonical, not just
# a label/hash claiming they do. Uses actual iOS packaged raw tables.
check='const fs=require("fs"),vm=require("vm"),i=JSON.parse(fs.readFileSync(0,"utf8")),c={window:{}};vm.runInNewContext(i.script,c);c.window.DB2PrivateData.applyRaw(i.tables);process.stdout.write(JSON.stringify(i.tables));'
from tools.extract_tables import read_tables
shipped={n:o for n,o,*_ in read_tables(args.ios_archive)}
p=subprocess.run(['node','-e',check],input=json.dumps({'script':embedded_script or script,'tables':shipped}),capture_output=True,text=True,check=True)
result['normalized_table_differences']=compare(canonical_tables,json.loads(p.stdout));result['all_34_normalized_tables_equal']=not result['normalized_table_differences']
result['passed']=not result['constant_differences']and result['all_34_normalized_tables_equal']and all(c['identical_full_result']for c in result['cases'])
args.output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));assert result['passed']
