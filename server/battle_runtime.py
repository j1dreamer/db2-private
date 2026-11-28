"""Bounded reusable Node processes with a fresh engine VM per request."""
import atexit,json,os,queue,subprocess,threading
from pathlib import Path
DAEMON=Path(__file__).with_name('battle_daemon.cjs')
_lock=threading.Lock();_pools={}
class Worker:
 def __init__(self,node):self.node=node;self.process=None;self.serial=0
 def stop(self):
  p=self.process;self.process=None
  if p:
   if p.poll()is None:p.terminate()
   try:p.wait(timeout=2)
   except subprocess.TimeoutExpired:p.kill();p.wait()
   for stream in (p.stdin,p.stdout):
    if stream:stream.close()
 def run(self,payload):
  if self.process is None or self.process.poll()is not None:
   self.stop();self.process=subprocess.Popen([self.node,'--max-old-space-size=384',str(DAEMON)],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,bufsize=1)
  self.serial+=1;number=self.serial;results=queue.Queue(maxsize=1);process=self.process
  def read():
   try:results.put(process.stdout.readline())
   except (ValueError,OSError):results.put('')
  try:
   self.process.stdin.write(json.dumps({'id':number,'payload':payload},separators=(',',':'))+'\n');self.process.stdin.flush()
   threading.Thread(target=read,daemon=True).start()
   raw=results.get(timeout=35 if payload.get('mode')in ('bestOfThree','series')else 20)
   reply=json.loads(raw)
   if reply.get('id')!=number or 'result'not in reply:raise ValueError('Combat worker rejected request')
   return reply['result']
  except (OSError,ValueError,queue.Empty):self.stop();raise ValueError('Không thể kiểm tra trận đấu; kết quả chưa được nhận thưởng')from None
class Pool:
 def __init__(self,node):
  count=max(1,min(2,int(os.environ.get('DB2_BATTLE_WORKERS','1'))));self.workers=[Worker(node)for _ in range(count)];self.available=queue.Queue()
  for w in self.workers:self.available.put(w)
 def run(self,payload):
  try:w=self.available.get(timeout=10)
  except queue.Empty:raise ValueError('Server đang kiểm tra nhiều trận; thử lại, chưa trừ thưởng')from None
  try:return w.run(payload)
  finally:self.available.put(w)
 def close(self):
  for worker in self.workers:worker.stop()
def simulate(node,payload):
 key=(os.getpid(),node)
 with _lock:
  if key not in _pools:_pools[key]=Pool(node)
 return _pools[key].run(payload)
def close():
 with _lock:
  for pool in _pools.values():pool.close()
  _pools.clear()
atexit.register(close)
