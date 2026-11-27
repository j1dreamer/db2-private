"""Rebuild controls from the pinned signed BoxInfo APK; signing is a separate step."""
import gzip,zipfile
from pathlib import Path
from .apply_apk_fix import sha
from .decode_jsc import decrypt,gunzip
from .build_client import encrypt
from .client_refresh import refresh
BASE='20b1bb238e2c5687c163b6ab75b0afca3679e8d1a800670d835b2430a833bc47'
def rebuild(source,output):
 if sha(source)!=BASE:raise ValueError('Expected signed BoxInfo APK')
 if Path(output).exists():raise ValueError('Use a new output file')
 with zipfile.ZipFile(source)as zin:
  script='assets/assets/main/index.jsc';text=refresh(gunzip(decrypt(zin.read(script))).decode());data=encrypt(gzip.compress(text.encode(),mtime=0))
  with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as zout:
   for entry in zin.infolist():
    name=entry.filename.upper()
    if name.startswith('META-INF/')and(name.endswith(('.RSA','.SF','.DSA','.EC'))or name=='META-INF/MANIFEST.MF'):continue
    zout.writestr(entry,data if entry.filename==script else zin.read(entry))
 return text
