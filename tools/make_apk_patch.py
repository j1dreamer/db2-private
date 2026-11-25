"""Build a checked copy/literal plan by reusing unchanged compressed APK entries."""
import argparse,json,struct,zipfile
from pathlib import Path
from .apply_apk_fix import sha

def payload_offset(stream,entry):
    stream.seek(entry.header_offset);header=stream.read(30)
    if len(header)!=30 or header[:4]!=b'PK\x03\x04':raise ValueError('Invalid ZIP local header')
    name,extra=struct.unpack_from('<HH',header,26)
    return entry.header_offset+30+name+extra

def make_patch(source,target,out):
    source,target,out=Path(source),Path(target),Path(out);out.mkdir(parents=True,exist_ok=True)
    operations=[];literal=bytearray();cursor=0
    with source.open('rb') as old,target.open('rb') as new,zipfile.ZipFile(source) as za,zipfile.ZipFile(target) as zb:
        old_entries={e.filename:e for e in za.infolist()}
        for entry in sorted(zb.infolist(),key=lambda e:e.header_offset):
            match=old_entries.get(entry.filename)
            if not match or not entry.compress_size or match.compress_type!=entry.compress_type or match.compress_size!=entry.compress_size or match.CRC!=entry.CRC:continue
            old_pos=payload_offset(old,match);new_pos=payload_offset(new,entry)
            old.seek(old_pos);new.seek(new_pos);payload=new.read(entry.compress_size)
            if old.read(match.compress_size)!=payload:continue
            if new_pos>cursor:
                new.seek(cursor);data=new.read(new_pos-cursor)
                operations.append({'literal':len(literal),'size':len(data)});literal.extend(data)
            operations.append({'copy':old_pos,'size':entry.compress_size});cursor=new_pos+entry.compress_size
        new.seek(cursor);tail=new.read()
        if tail:operations.append({'literal':len(literal),'size':len(tail)});literal.extend(tail)
    plan={'old_sha256':sha(source),'new_sha256':sha(target),'old_size':source.stat().st_size,'new_size':target.stat().st_size,'operations':operations}
    if len(operations)>50000 or len(literal)>16*1024*1024:raise ValueError('Patch exceeds application bounds')
    (out/'plan.json').write_text(json.dumps(plan,separators=(',',':')))
    (out/'literals.bin').write_bytes(literal)
    print(json.dumps({**{k:v for k,v in plan.items() if k!='operations'},'operations':len(operations),'literal_bytes':len(literal)}))
    return plan
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('target');p.add_argument('output');a=p.parse_args();make_patch(a.source,a.target,a.output)
