import argparse,struct,zlib,zipfile,json,hashlib
from pathlib import Path
KEY=b'e962577e-f57c-49';MASK=0xffffffff

def decrypt(data,key=KEY):
 if len(data)%4 or len(data)<8:raise ValueError('Not word aligned XXTEA data')
 v=list(struct.unpack('<'+'I'*(len(data)//4),data));k=struct.unpack('<4I',key);n=len(v);total=((6+52//n)*0x9e3779b9)&MASK;y=v[0]
 while total:
  e=(total>>2)&3
  for p in range(n-1,-1,-1):
   z=v[p-1]if p else v[-1];mx=(((z>>5 ^ y<<2)+(y>>3 ^ z<<4))^((total^y)+(k[(p&3)^e]^z)))&MASK;v[p]=(v[p]-mx)&MASK;y=v[p]
  total=(total-0x9e3779b9)&MASK
 length=v[-1];capacity=(n-1)*4
 if not capacity-3<=length<=capacity:raise ValueError('Decoded length invalid: key or format mismatch')
 return struct.pack('<'+'I'*(n-1),*v[:-1])[:length]
def gunzip(data):
 if not data.startswith(b'\x1f\x8b'):raise ValueError('No validated gzip header')
 d=zlib.decompressobj(31);out=d.decompress(data,64*2**20+1)
 if len(out)>64*2**20 or not d.eof:raise ValueError('Inflated script exceeds bound or truncated')
 return out
def decode_archive(archive,out):
 out=Path(out);out.mkdir(parents=True,exist_ok=True);records=[]
 with zipfile.ZipFile(archive)as z:
  for i in z.infolist():
   if not i.filename.endswith('.jsc'):continue
   data=z.read(i);r={'archive_path':i.filename,'encrypted_bytes':len(data),'encrypted_sha256':hashlib.sha256(data).hexdigest()}
   try:
    raw=gunzip(decrypt(data));text=raw.decode('utf8');rel=Path(i.filename)
    if rel.is_absolute()or '..'in rel.parts:raise ValueError('Unsafe archive script path')
    rel=rel.with_suffix('.js');p=out/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw);r.update(format='XXTEA followed by gzip-compressed UTF-8 JavaScript',decoded_bytes=len(raw),decoded_sha256=hashlib.sha256(raw).hexdigest(),decoded_path=str(rel))
   except Exception as e:r['decode_error']=str(e)
   records.append(r)
 (out/'jsc-decoding.json').write_text(json.dumps(records,indent=2)+'\n');return records
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('--out',type=Path,required=True);args=p.parse_args();print(json.dumps(decode_archive(args.archive,args.out),indent=2))
