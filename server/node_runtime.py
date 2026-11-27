"""Locate a supported combat runtime independently of the login shell's PATH."""
import os,shutil,subprocess
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def candidates():
 values=[os.environ.get('DB2_NODE'),shutil.which('node'),shutil.which('nodejs'),str(ROOT/'runtime/node/node.exe'),str(ROOT/'runtime/node/bin/node'),'/opt/db2/node/bin/node','/usr/local/bin/node','/usr/bin/node']
 for var in ('ProgramFiles','ProgramFiles(x86)','LOCALAPPDATA'):
  if os.environ.get(var):values.extend([str(Path(os.environ[var])/'nodejs/node.exe'),str(Path(os.environ[var])/'Programs/nodejs/node.exe')])
 return tuple(dict.fromkeys(v for v in values if v))

@lru_cache(maxsize=16)
def probe(path,mtime):
 try:
  p=subprocess.run([path,'--version'],capture_output=True,text=True,timeout=5,check=True)
  version=p.stdout.strip()
  if not version.startswith('v')or int(version.split('.')[0][1:])<22:return None
  return version
 except (OSError,ValueError,subprocess.SubprocessError):return None

def runtime_status():
 for path in candidates():
  try:mtime=Path(path).stat().st_mtime_ns
  except OSError:continue
  version=probe(path,mtime)
  if version:return {'available':True,'version':version,'executable':str(Path(path).resolve())}
 return {'available':False,'version':None,'executable':None,'error':'Server cần Node.js 22+ để chạy combat. Cập nhật bằng Setup-Ubuntu.sh rồi kiểm /health → combat.available.'}

def resolve_node():
 status=runtime_status()
 if not status['available']:raise ValueError(status['error'])
 return status['executable']
