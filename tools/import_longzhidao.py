"""Import pinned Long Chi Dao client tables, retaining explicit legacy IDs."""
import argparse,hashlib,json,zipfile
from pathlib import Path
from tools.extract_tables import read_tables
from tools.decode_jsc import decrypt,gunzip
ROOT=Path(__file__).resolve().parents[1]
SOURCE={'game':'龙之岛-1W免费版','x7_id':17327,'url':'https://www.x7sy.com/game/app/17327','apk_sha256':'437321b3e6c1bb3fe9e7758bec418e08364f7defcddc5f3cc7322492e7babdf4','jsc_sha256':'d04718492bbdd0b43bcdb3826a27280d56f8dd06f1224b7adc13b273609b4a0a','native_sha256':'199f7aac71ee281850feedbade9b28f8c8d7d9ccb68bf4dd4e49173644862b40'}
def import_source(source):
 with zipfile.ZipFile(source)as z:
  jsc=z.read('assets/assets/main/index.jsc');native=z.read('lib/arm64-v8a/libcocos2djs.so')
  if hashlib.sha256(jsc).hexdigest()!=SOURCE['jsc_sha256']or hashlib.sha256(native).hexdigest()!=SOURCE['native_sha256']:raise ValueError('Unexpected Long Chi Dao build')
  decoded=gunzip(decrypt(jsc));(ROOT/'client/longzhidao.decoded.js').write_bytes(decoded)
 shipped={n:(o,entry)for n,o,entry,*_ in read_tables(source)}
 if len(shipped)!=34:raise ValueError('Expected all 34 source tables')
 old=json.loads((ROOT/'tables/entityExtData.json').read_text());legacy=[r for r in old[1:]if r[0]in(1,373,379)]
 records={};exceptions=[]
 for name,(rows,entry)in shipped.items():
  rows=json.loads(json.dumps(rows));original_hash=hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
  if name=='entityExt':
   ids={r[0]for r in rows[1:]}
   for row in legacy:
    if row[0]not in ids:
     rows.append(row);exceptions.append({'table':name,'kindId':row[0],'source':'eng-client'if row[0]==1 else'original-ios-compatibility','reason':'Preserve existing bag IDs / existing gmData references; absent from Long Chi Dao shipped table'})
  (ROOT/'tables'/(name+'Data.json')).write_text(json.dumps(rows,ensure_ascii=False)+'\n')
  records[name]={'source':'longzhidao-client','archive_entry':entry,'shipped_rows':len(shipped[name][0])-1,'canonical_rows':len(rows)-1,'shipped_content_sha256':original_hash,'compatibility_rows':[r['kindId']for r in exceptions if r['table']==name]}
 policy={'baseline':'longzhidao-17327','source':SOURCE,'tables':records,'compatibility_definitions':exceptions,'retained_implementation':'ENG client resource/language/native shell; verified gameplay module ports; existing private backend for server-only rules','private_rules_document':'tables/privateRules.json','native_platform_resources':'Keep original Android/iOS native executables, SDK resources and signing identity; IPA remains private and unsigned until owner signs','profile_migration_required':True,'migration':'Preserve accounts, currencies, inventory and existing VIP grants; refresh derived combat state once with snapshot backup.'}
 (ROOT/'tables/canonical-policy.json').write_text(json.dumps(policy,ensure_ascii=False,indent=2)+'\n')
 return policy
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('source');a=p.parse_args();r=import_source(a.source);print(json.dumps({'baseline':r['baseline'],'tables':len(r['tables']),'compatibility_definitions':r['compatibility_definitions']},ensure_ascii=False))
