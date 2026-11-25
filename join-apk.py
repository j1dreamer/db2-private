from pathlib import Path
import hashlib,json,os
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
output=root/manifest['filename']
def sha(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for data in iter(lambda:f.read(1024*1024),b''):h.update(data)
 return h.hexdigest()
if output.exists():
 if sha(output)!=manifest['sha256']:raise SystemExit('Existing APK checksum mismatch; move it away before retrying.')
 print('APK already complete and verified:',output)
else:
 temporary=output.with_suffix('.apk.assembling')
 try:
  with temporary.open('xb') as dest:
   for part in manifest['parts']:
    path=root/part['file']
    if path.stat().st_size!=part['size'] or sha(path)!=part['sha256']:raise ValueError('Invalid or missing part: '+part['file'])
    with path.open('rb') as source:
     for data in iter(lambda:source.read(1024*1024),b''):dest.write(data)
  if sha(temporary)!=manifest['sha256']:raise ValueError('Final checksum mismatch')
  os.replace(temporary,output)
 except BaseException:
  temporary.unlink(missing_ok=True);raise
 print('APK complete and verified:',output)
