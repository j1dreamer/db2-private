"""Fetch and reassemble the signed development APK from the public APK branch."""
import argparse,hashlib,json,re,urllib.request,os
from pathlib import Path
BASE='https://raw.githubusercontent.com/j1dreamer/db2-private/apk-download/'
FILENAME='DB2-Private-Android-dev.apk'
SHA256='a198837ccae5a3ad662d2489c4e1748016aebe77359e84f4bc4734c5f389f430'
SIZE=524284609

def sha(path):
    digest=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):digest.update(chunk)
    return digest.hexdigest()
def download(output):
    output=Path(output).resolve();output.parent.mkdir(parents=True,exist_ok=True)
    if output.exists():
        if sha(output)==SHA256:print('APK already verified:',output);return
        raise ValueError('Existing output has a different checksum. Move it before retrying.')
    with urllib.request.urlopen(BASE+'manifest.json',timeout=60) as r:manifest=json.load(r)
    if manifest.get('sha256')!=SHA256 or manifest.get('size')!=SIZE or len(manifest.get('parts',[]))!=25:raise ValueError('Unexpected APK manifest')
    parts=manifest['parts']
    if sum(p['size'] for p in parts)!=SIZE:raise ValueError('Unexpected total size')
    cache=output.parent/'.db2-apk-parts';cache.mkdir(exist_ok=True)
    for index,part in enumerate(parts):
        if part['file']!=f'parts/part-{index:03d}.bin' or not 0<part['size']<=20*1024*1024 or not re.fullmatch('[0-9a-f]{64}',part['sha256']):raise ValueError('Invalid part metadata')
        local=cache/Path(part['file']).name
        if local.exists() and local.stat().st_size==part['size'] and sha(local)==part['sha256']:
            print(f'Part {index+1}/25 verified (cached)',flush=True);continue
        temporary=local.with_suffix('.downloading')
        with urllib.request.urlopen(BASE+part['file'],timeout=90) as r,temporary.open('wb') as dest:
            received=0
            while True:
                chunk=r.read(1024*1024)
                if not chunk:break
                received+=len(chunk)
                if received>part['size']:raise ValueError('Part exceeds expected size')
                dest.write(chunk)
        if temporary.stat().st_size!=part['size'] or sha(temporary)!=part['sha256']:raise ValueError('Part checksum mismatch')
        os.replace(temporary,local);print(f'Part {index+1}/25 downloaded and verified',flush=True)
    temporary=output.with_suffix('.apk.assembling')
    with temporary.open('wb') as dest:
        for part in parts:
            with (cache/Path(part['file']).name).open('rb') as source:
                for chunk in iter(lambda:source.read(1024*1024),b''):dest.write(chunk)
    if sha(temporary)!=SHA256:raise ValueError('Final APK checksum mismatch')
    os.replace(temporary,output);print('APK complete and SHA-256 verified:',output)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',default=FILENAME);args=parser.parse_args();download(args.output)
