"""Read-only IPA inspection. Does not sign, decrypt FairPlay or execute native code."""
import argparse,hashlib,json,plistlib,struct,zipfile,re,math,zlib
from pathlib import Path
from collections import Counter
MACH={b'\xce\xfa\xed\xfe':('<',False),b'\xcf\xfa\xed\xfe':('<',True),b'\xfe\xed\xfa\xce':('>',False),b'\xfe\xed\xfa\xcf':('>',True)}
FAT={b'\xca\xfe\xba\xbe':('>',False),b'\xca\xfe\xba\xbf':('>',True),b'\xbe\xba\xfe\xca':('<',False),b'\xbf\xba\xfe\xca':('<',True)}
CPUS={0x100000c:'arm64',0x1000007:'x86_64',12:'arm',7:'x86'}
def digest(data):return hashlib.sha256(data).hexdigest()
def version(v):return '.'.join(map(str,(v>>16,(v>>8)&255,v&255)))
def macho(b):
 if b[:4]in FAT:
  endian,wide=FAT[b[:4]];n=struct.unpack_from(endian+'I',b,4)[0]
  if n>32:raise ValueError('Invalid fat slice count')
  slices=[];size=32 if wide else 20
  for i in range(n):
   entry=8+i*size
   if entry+size>len(b):raise ValueError('Truncated fat header')
   off,length=struct.unpack_from(endian+('QQ'if wide else 'II'),b,entry+8)
   if off+length>len(b):raise ValueError('Slice outside binary')
   slices.append({'offset':off,'size':length,**macho(b[off:off+length])})
  return {'format':'fat-Mach-O','slices':slices}
 if b[:4]not in MACH:return {'format':'not-Mach-O','first_bytes':b[:16].hex()}
 endian,wide=MACH[b[:4]];header=32 if wide else 28
 if len(b)<header:raise ValueError('Truncated Mach-O header')
 cpu,subtype,typ,n,size,flags=struct.unpack_from(endian+'6I',b,4)
 if n>10000 or header+size>len(b):raise ValueError('Invalid load command area')
 result={'format':'Mach-O','architecture':CPUS.get(cpu,hex(cpu)),'bits':64 if wide else 32,'file_type':typ,'load_commands':n,'encryption':[],'build':[],'dylibs':[]}
 pos=header
 for _ in range(n):
  if pos+8>header+size:raise ValueError('Truncated load command')
  cmd,length=struct.unpack_from(endian+'II',b,pos)
  if length<8 or pos+length>header+size:raise ValueError('Invalid load command length')
  if cmd in (0x21,0x2c)and length>=20:
   off,count,cryptid=struct.unpack_from(endian+'III',b,pos+8);result['encryption'].append({'cryptoff':off,'cryptsize':count,'cryptid':cryptid,'encrypted':cryptid!=0})
  if cmd==0x32 and length>=24:
   platform,minimum,sdk=struct.unpack_from(endian+'III',b,pos+8);result['build'].append({'platform_id':platform,'platform':{1:'macOS',2:'iOS-device',6:'Mac-Catalyst',7:'iOS-simulator'}.get(platform,'other'),'minimum_os':version(minimum),'sdk':version(sdk)})
  if cmd==0x25 and length>=16:
   minimum,sdk=struct.unpack_from(endian+'II',b,pos+8);result['build'].append({'legacy_ios_minimum':version(minimum),'sdk':version(sdk)})
  if cmd in (0xc,0x80000018,0x8000001f)and length>=24:
   off=struct.unpack_from(endian+'I',b,pos+8)[0]
   if off<length:result['dylibs'].append(b[pos+off:pos+length].split(b'\0')[0].decode('utf8',errors='replace'))
  if cmd==0x1d and length>=16:
   off,count=struct.unpack_from(endian+'II',b,pos+8);result['code_signature_blob']={'offset':off,'size':count,'within_file':off+count<=len(b)}
  pos+=length
 return result

def inspect(path,out):
 out.mkdir(parents=True,exist_ok=True);h=hashlib.sha256()
 with path.open('rb')as f:
  for c in iter(lambda:f.read(2**20),b''):h.update(c)
 result={'ipa_sha256':h.hexdigest(),'ipa_bytes':path.stat().st_size,'native_execution_tested':False,'signature_trust_verified':False}
 with zipfile.ZipFile(path)as z:
  infos=z.infolist();result['zip_files']=len(infos);result['uncompressed_bytes']=sum(i.file_size for i in infos)
  plists=[i for i in infos if re.fullmatch(r'Payload/[^/]+\.app/Info\.plist',i.filename)]
  if len(plists)!=1:raise ValueError('Expected one root app Info.plist')
  info=plistlib.loads(z.read(plists[0]));root=plists[0].filename[:-len('Info.plist')];exe=info.get('CFBundleExecutable')
  if not isinstance(exe,str)or '/'in exe:raise ValueError('Invalid executable name')
  result['app_info']={k:info[k]for k in ('CFBundleIdentifier','CFBundleExecutable','CFBundleVersion','CFBundleShortVersionString','MinimumOSVersion','UIDeviceFamily','DTPlatformName','DTSDKName','NSAppTransportSecurity')if k in info}
  entry=z.getinfo(root+exe)
  if entry.file_size>256*2**20:raise ValueError('Executable too large for bounded inspection')
  binary=z.read(entry);result['executable_sha256']=digest(binary);result['executable']=macho(binary)
  result['embedded_provision_profile']=root+'embedded.mobileprovision'in z.namelist()
  result['scripts']=[];result['native_libraries']=[]
  for i in infos:
   if not i.filename.startswith(root):continue
   if i.filename.endswith(('.js','.jsc')):
    r={'path':i.filename[len(root):],'bytes':i.file_size}
    if i.file_size<=32*2**20:
     b=z.read(i);r.update(sha256=digest(b),first_bytes=b[:16].hex());counts=Counter(b);r['entropy_bits_per_byte']=round(-sum(c/len(b)*math.log2(c/len(b))for c in counts.values()),3)if b else 0
     try:
      text=b.decode('utf8');r['utf8']=True;r['looks_like_javascript']=any(x in text for x in ('function','cc.','require('))
     except UnicodeDecodeError:r['utf8']=False
     if b.startswith(b'\x1f\x8b'):r['gzip_header']=True
    result['scripts'].append(r)
   if i.filename.endswith('.dylib')or '.framework/'in i.filename:
    with z.open(i)as f:prefix=f.read(4)
    if prefix in MACH or prefix in FAT:result['native_libraries'].append({'path':i.filename[len(root):],'bytes':i.file_size,'magic':prefix.hex()})
 (out/'report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');return result
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('ipa',type=Path);p.add_argument('--out',type=Path,default=Path('ios-report'));a=p.parse_args();r=inspect(a.ipa,a.out);print(json.dumps({'report':str(a.out/'report.json'),'app':r['app_info'],'executable':r['executable'],'scripts':len(r['scripts'])},ensure_ascii=False))
