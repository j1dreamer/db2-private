"""Extract catalog PNGs directly from the authorized Android archive."""
import argparse,hashlib,json,struct,zipfile,zlib
from pathlib import Path
from tools.extract_tables import expand
from server.inventory import entities
ROOT=Path(__file__).resolve().parents[1]
def native_keys(lib):
 # Verified ARM64 Image::initWithImageData loads a literal AES key/IV and
 # decrypts 80 bytes, copies 64, then appends the rest (16-byte padding).
 expected='6350c8631c3c323ed43721351c71261cd31a1c2edc56daaf735248dbd39c175e'
 if hashlib.sha256(lib).hexdigest()!=expected:raise ValueError('Unrecognized native image decoder; inspect this version first')
 phoff=struct.unpack_from('<Q',lib,32)[0];size,count=struct.unpack_from('<HH',lib,54)
 def read(va,n):
  for i in range(count):
   h=struct.unpack_from('<IIQQQQQQ',lib,phoff+i*size)
   if h[0]==1 and h[3]<=va<va+n<=h[3]+h[5]:return lib[h[2]+va-h[3]:h[2]+va-h[3]+n]
  raise ValueError('Native literal outside load segment')
 return read(0x16fef72,16),read(0x16fee90,16)

def valid_png(raw):
 if not raw.startswith(b'\x89PNG\r\n\x1a\n'):return False
 p=8
 while p+12<=len(raw):
  n=struct.unpack_from('>I',raw,p)[0];end=p+12+n
  if end>len(raw)or zlib.crc32(raw[p+4:p+8+n])&0xffffffff!=struct.unpack_from('>I',raw,p+8+n)[0]:return False
  if raw[p+4:p+8]==b'IEND':return end==len(raw)
  p=end
 return False

def decode_png(raw,key,iv):
 if valid_png(raw):return raw
 from cryptography.hazmat.primitives.ciphers import Cipher,algorithms,modes
 prefix=min(64,len(raw)-16)
 if prefix<0 or (prefix+16)%16:raise ValueError('Unexpected encrypted PNG prefix')
 dec=Cipher(algorithms.AES(key),modes.CBC(iv)).decryptor();decoded=dec.update(raw[:prefix+16])+dec.finalize();result=decoded[:prefix]+raw[prefix+16:]
 if not valid_png(result):raise ValueError('Decrypted PNG fails chunk CRC checks')
 return result

def extract(source):
 out=ROOT/'web/assets/items';out.mkdir(parents=True,exist_ok=True);result={};missing=[]
 with zipfile.ZipFile(source)as z:
  key,iv=native_keys(z.read('DB2-GD/lib/arm64-v8a/libcocos2djs.so'))
  root='DB2-GD/assets/assets/resources/';cfg=json.loads(z.read(root+'config.json'));paths={v[0]:expand(cfg['uuids'][int(k)])for k,v in cfg['paths'].items()if cfg['types'][v[1]]=='cc.Texture2D'}
  native={Path(n).stem:n for n in z.namelist()if n.startswith(root+'native/')and n.endswith('.png')}
  for kind,row in entities().items():
   image=str(row.get('imgId',''));candidates=[('photo/role/'if row['type']=='role'else'img/')+image,'img/'+image]
   uuid=next((paths[p]for p in candidates if p in paths and paths[p]in native),None)
   if not uuid:missing.append(kind);continue
   raw=decode_png(z.read(native[uuid]),key,iv)
   if not raw.startswith(b'\x89PNG\r\n\x1a\n')or len(raw)>1024*1024:missing.append(kind);continue
   w,h=struct.unpack('>II',raw[16:24])
   if max(w,h)>2048:missing.append(kind);continue
   name=hashlib.sha256(raw).hexdigest()[:20]+'.png';(out/name).write_bytes(raw);result[str(kind)]='/assets/items/'+name
 (ROOT/'web/assets/item-icons.json').write_text(json.dumps(result,separators=(',',':')))
 report={'source':'user-authorized Android archive, Cocos texture UUID mapping','image_codec':'AES-128-CBC prefix from verified native ARM64 decoder; every PNG chunk CRC checked','native_sha256':'6350c8631c3c323ed43721351c71261cd31a1c2edc56daaf735248dbd39c175e','mapped_items':len(result),'unique_pngs':len(set(result.values())),'unmapped_item_ids':missing}
 (ROOT/'analysis/admin-icons.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items()if k!='unmapped_item_ids'}))
if __name__=='__main__':p=argparse.ArgumentParser();p.add_argument('source');extract(p.parse_args().source)
