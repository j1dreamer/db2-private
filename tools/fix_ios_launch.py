"""Remove two startup plugin dependencies identified by the owner's device log.

Only the pinned DB2 executable is accepted. Instruction/data bytes and remaining
library ordinals stay unchanged. The output still requires legitimate re-signing.
"""
import argparse,hashlib,json,plistlib,struct,zipfile
from pathlib import Path
from .inspect_ipa import macho
from .apply_apk_fix import sha
KNOWN_NATIVE='c925457ac1964ade6ddfde7e316091468f678cf7421bcdc3dec7fafacc0ec314'
PLUGINS=('@executable_path/CombinedPlugin.dylib','@executable_path/Frameworks/AppRuntime/ATHelper.dylib')
LOADS=(0xc,0x80000018,0x8000001f,0x80000023)

def varint(data,pos):
 start=pos
 while pos<len(data)and pos-start<10:
  byte=data[pos];pos+=1
  if byte<128:
   value=sum((data[i]&127)<<(7*(i-start))for i in range(start,pos));return value,pos
 raise ValueError('Invalid dyld variable integer')

def bind_ordinals(data):
 out=set();pos=0
 while pos<len(data):
  byte=data[pos];pos+=1;op=byte&0xf0;imm=byte&15
  if op==0x10:out.add(imm)
  elif op==0x20:value,pos=varint(data,pos);out.add(value)
  elif op==0x40:
   end=data.find(b'\0',pos)
   if end<0:raise ValueError('Unterminated bind symbol')
   pos=end+1
  elif op in(0x60,0x70,0x80,0xa0):_,pos=varint(data,pos)
  elif op==0xc0:_,pos=varint(data,pos);_,pos=varint(data,pos)
  elif op==0xd0:
   if imm==0:_,pos=varint(data,pos)
   elif imm!=1:raise ValueError('Unknown threaded bind opcode')
  elif op not in(0,0x30,0x50,0x90,0xb0):raise ValueError('Unknown dyld bind opcode')
 return out

def remove_plugin_commands(binary):
 if binary[:4]!=b'\xcf\xfa\xed\xfe'or len(binary)<32:raise ValueError('Expected little-endian 64-bit Mach-O')
 count,total=struct.unpack_from('<II',binary,16);end=32+total
 if end>len(binary):raise ValueError('Truncated load commands')
 commands=[];dylibs=[];pos=32;used=set()
 for _ in range(count):
  if pos+8>end:raise ValueError('Truncated load command')
  cmd,size=struct.unpack_from('<II',binary,pos)
  if size<8 or size%4 or pos+size>end:raise ValueError('Invalid load command size')
  data=binary[pos:pos+size];name=None
  if cmd in LOADS:
   off=struct.unpack_from('<I',data,8)[0]
   if not 24<=off<size:raise ValueError('Invalid dylib name offset')
   name=data[off:].split(b'\0')[0].decode();dylibs.append(name)
  if cmd==0x80000034:raise ValueError('Chained fixups need separate validation')
  if cmd in(0x22,0x80000022):
   fields=struct.unpack_from('<10I',data,8)
   for off,length in zip(fields[2:8:2],fields[3:8:2]):
    if off+length>len(binary):raise ValueError('Truncated bind stream')
    used.update(bind_ordinals(binary[off:off+length]))
  if cmd==2:
   off,n,_,_=struct.unpack_from('<4I',data,8)
   if off+n*16>len(binary):raise ValueError('Truncated symbols')
   for i in range(n):
    _,typ,_,desc,_=struct.unpack_from('<IBBHQ',binary,off+i*16)
    if not typ&0xe0 and typ&0x0e==0 and typ&1:used.add(desc>>8)
  commands.append((name,data));pos+=size
 if pos!=end:raise ValueError('Load command size mismatch')
 if tuple(dylibs[-2:])!=PLUGINS or any(dylibs.count(x)!=1 for x in PLUGINS):raise ValueError('Expected final two unused startup dependencies')
 ordinals={len(dylibs)-1,len(dylibs)}
 if used&ordinals:raise ValueError('Plugin has imported symbols; refusing unsafe removal')
 kept=[data for name,data in commands if name not in PLUGINS];blob=b''.join(kept);out=bytearray(binary)
 struct.pack_into('<II',out,16,len(kept),len(blob));out[32:end]=blob+b'\0'*(total-len(blob))
 assert bytes(out[end:])==binary[end:]
 info=macho(bytes(out));assert all(x not in info['dylibs']for x in PLUGINS)
 return bytes(out),{'removed_dependencies':list(PLUGINS),'removed_ordinals':sorted(ordinals),'imported_plugin_symbols':False,'bytes_after_original_load_commands_unchanged':True,'native_instructions_patched':False,'requires_resigning':True}

def repair(source,output):
 source,output=Path(source),Path(output)
 if source.resolve()==output.resolve()or output.exists():raise ValueError('Use a new output path')
 with zipfile.ZipFile(source)as zin:
  roots=[n[:-10]for n in zin.namelist()if n.startswith('Payload/')and n.count('/')==2 and n.endswith('.app/Info.plist')]
  if len(roots)!=1:raise ValueError('Expected one app')
  root=roots[0];info=plistlib.loads(zin.read(root+'Info.plist'));executable=root+info['CFBundleExecutable'];original=zin.read(executable)
  if hashlib.sha256(original).hexdigest()!=KNOWN_NATIVE:raise ValueError('Unrecognized executable; refusing native edit')
  patched,report=remove_plugin_commands(original);removed=[root+p.removeprefix('@executable_path/')for p in PLUGINS]
  if not all(p in zin.namelist()for p in removed):raise ValueError('Expected both packaged plugins')
  output.parent.mkdir(parents=True,exist_ok=True)
  with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as zout:
   for entry in zin.infolist():
    if entry.filename in removed or entry.filename.endswith('embedded.mobileprovision')or'/_CodeSignature/'in entry.filename:continue
    zout.writestr(entry,patched if entry.filename==executable else zin.read(entry))
 with zipfile.ZipFile(source)as old,zipfile.ZipFile(output)as new:
  if new.testzip():raise ValueError('Output ZIP integrity failure')
  unchanged=0
  for entry in new.infolist():
   if entry.filename==executable:assert new.read(entry)==patched
   else:
    if old.read(entry.filename)!=new.read(entry):raise ValueError('Unexpected modified resource '+entry.filename)
    unchanged+=1
 report.update(source_sha256=sha(source),ipa_sha256=sha(output),ipa_bytes=output.stat().st_size,native_executable_sha256=hashlib.sha256(patched).hexdigest(),removed_files=removed,unchanged_entries=unchanged,jsc_and_settings_unchanged=True,native_device_tested=False)
 output.with_suffix('.json').write_text(json.dumps(report,indent=2)+'\n');return report

if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('source',type=Path);p.add_argument('output',type=Path);a=p.parse_args();print(json.dumps(repair(a.source,a.output),indent=2))
