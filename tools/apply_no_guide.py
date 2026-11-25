"""Apply the no-tutorial client update without downloading the whole APK again."""
import argparse,hashlib,json,os,zipfile
from pathlib import Path
OLD_SHA='d3dd3db256d550667eba386217e969327c82cc37985e2b503adea3673f883c3f'
NEW_SHA='93a51856da76adaa1e4229cfd2f12f0756af6bdfb92453eb3e517d8802e22209'

def sha(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()
def apply_fix(source,output,patch):
    source=Path(source).resolve();output=Path(output).resolve();patch=Path(patch)
    if source==output:raise ValueError('Source and output must be different files')
    if not source.is_file():raise ValueError('Original APK not found; place it beside Apply-No-Guide.bat')
    if sha(source)!=OLD_SHA:raise ValueError('Original APK checksum mismatch: wrong or incomplete input')
    if output.exists():
        if sha(output)==NEW_SHA:print('No-guide APK already verified:',output);return output
        raise ValueError('Output already exists with a different checksum; move it before retrying')
    if patch.is_dir():
        plan=json.loads((patch/'plan.json').read_text());literal=(patch/'literals.bin').read_bytes()
    else:
        with zipfile.ZipFile(patch) as z:
            if z.getinfo('plan.json').file_size>8*1024*1024 or z.getinfo('literals.bin').file_size>16*1024*1024:raise ValueError('Patch exceeds expected bounds')
            plan=json.loads(z.read('plan.json'));literal=z.read('literals.bin')
    if plan['old_sha256']!=OLD_SHA or plan['new_sha256']!=NEW_SHA or source.stat().st_size!=plan['old_size']:raise ValueError('Unexpected patch version')
    if len(plan['operations'])>50000:raise ValueError('Too many operations')
    total=0
    for op in plan['operations']:
        size=op['size'];offset=op.get('copy',op.get('literal'))
        bound=plan['old_size'] if 'copy' in op else len(literal)
        if type(size) is not int or type(offset) is not int or size<=0 or offset<0 or offset+size>bound:raise ValueError('Invalid patch range')
        total+=size
    if total!=plan['new_size']:raise ValueError('Patch size mismatch')
    output.parent.mkdir(parents=True,exist_ok=True);temporary=output.with_suffix('.apk.applying')
    dest=temporary.open('xb')
    try:
        with dest,source.open('rb') as original:
            h=hashlib.sha256()
            for op in plan['operations']:
                if 'literal' in op:
                    data=literal[op['literal']:op['literal']+op['size']];dest.write(data);h.update(data)
                else:
                    original.seek(op['copy']);remaining=op['size']
                    while remaining:
                        data=original.read(min(1024*1024,remaining))
                        if not data:raise ValueError('Truncated source APK')
                        dest.write(data);h.update(data);remaining-=len(data)
        if temporary.stat().st_size!=plan['new_size'] or h.hexdigest()!=NEW_SHA:raise ValueError('No-guide APK checksum mismatch')
        os.replace(temporary,output)
    except BaseException:
        temporary.unlink(missing_ok=True);raise
    print('No-guide APK created and SHA-256 verified:',output);return output
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--source',default='DB2-Private-Android-fixed.apk');p.add_argument('--output',default='DB2-Private-no-guide.apk');p.add_argument('--patch',default=str(Path(__file__).resolve().parent));args=p.parse_args()
    try:apply_fix(args.source,args.output,args.patch)
    except (ValueError,OSError,KeyError) as exc:raise SystemExit(str(exc))
