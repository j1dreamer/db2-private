"""Bounded begin-time verification for modes with trusted server snapshots.

Cache hits require identical inputs (and identical skill traces for manual modes).
Settlement validation and database idempotency remain with each handler.
"""
import asyncio,copy,hashlib,json,os,time,weakref
from collections import OrderedDict
from .battle import simulate_async
_caches=weakref.WeakKeyDictionary()
_active=weakref.WeakKeyDictionary()
def identity(payload):
 value={k:v for k,v in payload.items()if k not in ('auto','manualRecordMap')}
 return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def begin(store,player,payload):
 if os.environ.get('DB2_COMBAT_PREFETCH','1')!='1':return
 try:loop=asyncio.get_running_loop()
 except RuntimeError:return
 cache=_caches.setdefault(store,OrderedDict());now=time.monotonic()
 for key,(deadline,task)in list(cache.items()):
  if deadline<now and task.done():cache.pop(key)
 key=(player,identity(payload))
 if key in cache:return
 if len(cache)>=16:
  old=next((k for k,(_,task)in cache.items()if task.done()),None)
  if old is None:return
  cache.pop(old)
 active=_active.setdefault(loop,set());active.difference_update(t for t in list(active)if t.done())
 if active:return
 task=loop.create_task(simulate_async(copy.deepcopy(payload)));active.add(task)
 def done(task):
  active.discard(task)
  if not task.cancelled():task.exception()
 task.add_done_callback(done);cache[key]=(now+900,task)
async def outcome(store,player,payload):
 cache=_caches.setdefault(store,OrderedDict());entry=cache.pop((player,identity(payload)),None)
 if entry and entry[0]>=time.monotonic():
  try:result=await asyncio.shield(entry[1])
  except (ValueError,OSError):result=None
  if result is not None:
   if payload.get('mode')not in ('expedition','timePeak')or payload.get('manualRecordMap',{})==result.get('records',{}):return result
 return await simulate_async(payload)
