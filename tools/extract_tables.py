"""Recover shipped JSON data tables via Cocos bundle UUID mappings."""
import argparse,zipfile,json,base64,gzip,hashlib,re
from pathlib import Path

def expand(value):
 if len(value)==36:return value
 raw=value[:2]+base64.b64decode(value[2:]).hex()
 return '-'.join([raw[:8],raw[8:12],raw[12:16],raw[16:20],raw[20:]])
def extract(source,out):
 out=Path(out);out.mkdir(parents=True,exist_ok=True);report=[]
 with zipfile.ZipFile(source) as z:
  names=z.namelist();prefix='DB2-GD/' if 'DB2-GD/AndroidManifest.xml' in names else ''
  root=prefix+'assets/assets/resources/'
  if root+'config.json'not in names:
   configs=[name for name in names if re.fullmatch(r'Payload/[^/]+\.app/assets/resources/config\.json',name)]
   if len(configs)!=1:raise ValueError('Expected one Android or iOS resources config')
   root=configs[0][:-len('config.json')]
  cfg=json.loads(z.read(root+'config.json'))
  for idx,info in cfg['paths'].items():
   if not info[0].startswith('data/'):continue
   uuid=expand(cfg['uuids'][int(idx)]);matches=[n for n in names if n.startswith(root+'native/') and n.endswith('/'+uuid+'.bin')]
   if len(matches)!=1:raise ValueError((info[0],uuid,matches))
   b=z.read(matches[0]);raw=gzip.decompress(b) if b.startswith(b'\x1f\x8b') else b
   body=raw[:-64];obj=json.loads(body);dest=out/(info[0].split('/')[-1]+'.json');dest.write_text(json.dumps(obj,ensure_ascii=False))
   report.append({'name':info[0],'input':matches[0],'records':len(obj),'json_md5':hashlib.md5(body).hexdigest(),'sha256':hashlib.sha256(raw).hexdigest()})
 (out/'inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('Recovered tables:',len(report))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('out');a=p.parse_args();extract(a.source,a.out)
