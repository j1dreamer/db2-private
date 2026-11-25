"""Check Android 11+ packaging invariants independently of APK signatures."""
import argparse,json,struct,zipfile
from pathlib import Path

def resource_layout(path):
    path=Path(path)
    with zipfile.ZipFile(path) as z:
        entry=z.getinfo('resources.arsc')
        if entry.compress_type!=zipfile.ZIP_STORED:raise ValueError('resources.arsc is compressed: rejected by Android 11+ for target SDK 30+')
        with path.open('rb') as f:
            f.seek(entry.header_offset)
            header=f.read(30)
            if header[:4]!=b'PK\x03\x04':raise ValueError('Invalid ZIP local header')
            name_length,extra_length=struct.unpack_from('<HH',header,26)
        offset=entry.header_offset+30+name_length+extra_length
        if offset%4:raise ValueError('resources.arsc data is not aligned to 4 bytes')
        return {'resources_compression':'stored','resources_offset':offset,'aligned_4_bytes':True,'size':entry.file_size}
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('apk');a=p.parse_args();print(json.dumps(resource_layout(a.apk),indent=2))
