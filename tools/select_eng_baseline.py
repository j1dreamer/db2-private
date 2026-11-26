"""Select original ENG gameplay tables/rules without inventing a rarity conversion."""
import hashlib,json,subprocess,zipfile
from pathlib import Path
from tools.extract_tables import read_tables
from tools.decode_jsc import decrypt,gunzip
ROOT=Path(__file__).resolve().parents[1]
def select(source):
 source=Path(source)
 with zipfile.ZipFile(source)as z:
  prefix='DB2-GD/'if'DB2-GD/AndroidManifest.xml'in z.namelist()else''
  jsc=z.read(prefix+'assets/assets/main/index.jsc');decoded=gunzip(decrypt(jsc))
 if decoded!=(ROOT/'client/main.decoded.js').read_bytes():raise ValueError('ENG bundle differs from the authorized original archive')
 old=json.loads((ROOT/'tables/entityExtData.json').read_text());compat=[r for r in old[1:]if r[0]in(373,379)];records={};exceptions=[]
 for name,rows,entry,*_ in read_tables(source):
  rows=json.loads(json.dumps(rows));digest=hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode()).hexdigest();count=len(rows)-1
  if name=='entityExt':
   for row in compat:
    if row[0]not in {r[0]for r in rows[1:]}:rows.append(row);exceptions.append({'table':name,'kindId':row[0],'source':'original-ios-compatibility','reason':'Retained iOS box definitions for existing bag IDs'})
  p=ROOT/'tables'/(name+'Data.json')
  if json.loads(p.read_text())!=rows:p.write_text(json.dumps(rows,ensure_ascii=False)+'\n')
  records[name]={'source':'eng-client','archive_entry':entry,'shipped_rows':count,'canonical_rows':len(rows)-1,'shipped_content_sha256':digest,'compatibility_rows':[r['kindId']for r in exceptions if r['table']==name]}
 if len(records)!=34:raise ValueError('Expected 34 ENG tables')
 subprocess.run(['node',str(ROOT/'tools/extract_longzhidao_rules.cjs'),str(ROOT/'client/main.decoded.js'),str(ROOT/'tables/clientRules.json')],check=True)
 policy={'baseline':'eng-sp-sss','source':{'game':'DB2 Saiyans United ENG client','bundle_sha256':hashlib.sha256(decoded).hexdigest(),'jsc_sha256':hashlib.sha256(jsc).hexdigest(),'rarity_policy':'Original role groups 2=S, 3=SS, 4=SSS, 5=SP; role/evolution tables unchanged. No LR/XR reassignment.'},'tables':records,'compatibility_definitions':exceptions,'retained_implementation':'ENG gameplay modules and resource shell; original iOS resource/language modules; explicitly authored private backend/GM patches','private_rules_document':'tables/privateRules.json','profile_migration_required':True,'migration':'Snapshot SQLite; preserve balances, inventory and VIP grants; recalculate derived combat data. Do not mix Long Chi Dao startup rules.'}
 (ROOT/'tables/canonical-policy.json').write_text(json.dumps(policy,ensure_ascii=False,indent=2)+'\n')
 return policy
if __name__=='__main__':
 import argparse
 p=argparse.ArgumentParser();p.add_argument('source');args=p.parse_args();result=select(args.source);print(result['baseline'],len(result['tables']))
