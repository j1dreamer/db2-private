"""Reassemble locally held private IPA parts; never downloads or uploads data."""
import argparse,hashlib,json,os
from pathlib import Path

SHA256='8653b63259b17b1645d290a4de304a4d4e45f5df66a2cc26f121b4290cf809e1'
SIZE=510997150

def sha(path):
    h=hashlib.sha256()
    with Path(path).open('rb')as stream:
        for data in iter(lambda:stream.read(1024*1024),b''):h.update(data)
    return h.hexdigest()

def assemble(parts,manifest,output):
    parts=Path(parts);output=Path(output)
    data=json.loads(Path(manifest).read_text())
    records=data.get('parts',[])
    if data.get('sha256')!=SHA256 or data.get('size')!=SIZE or len(records)!=21:
        raise ValueError('Unexpected private IPA manifest')
    if sum(p['size']for p in records)!=SIZE:raise ValueError('Wrong total size')
    for i,part in enumerate(records):
        if part['file']!=f'part-{i:03d}.bin' or not 0<part['size']<=24*1024*1024:raise ValueError('Unexpected part')
        p=parts/part['file']
        if p.stat().st_size!=part['size']or sha(p)!=part['sha256']:raise ValueError('Incomplete/corrupt part: '+p.name)
    if output.exists():
        if sha(output)==SHA256:print('IPA already verified:',output);return
        raise ValueError('Existing output is different; move it before retrying')
    temporary=output.with_suffix('.ipa.assembling');output.parent.mkdir(parents=True,exist_ok=True)
    created=False
    try:
        with temporary.open('xb')as target:
            created=True
            for part in records:
                with (parts/part['file']).open('rb')as source:
                    for chunk in iter(lambda:source.read(1024*1024),b''):target.write(chunk)
        if temporary.stat().st_size!=SIZE or sha(temporary)!=SHA256:raise ValueError('Final IPA checksum mismatch')
        os.replace(temporary,output)
    except BaseException:
        if created:temporary.unlink(missing_ok=True)
        raise
    print('Private unsigned IPA verified:',output)
    print('Re-sign on your own Mac before installing.')

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--parts',type=Path,default=Path('.'));p.add_argument('--manifest',type=Path);p.add_argument('--output',type=Path,default=Path('DB2-Private-unsigned.ipa'));args=p.parse_args()
    manifest=args.manifest or args.parts/'manifest.json'
    assemble(args.parts,manifest,args.output)
