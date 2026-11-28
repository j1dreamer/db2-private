"""Bounded speculative auto replay; always compare authoritative inputs/records."""
import asyncio,copy,os,time,weakref
from collections import OrderedDict
from .battle import simulate_async

_caches=weakref.WeakKeyDictionary()
_active=weakref.WeakKeyDictionary()
MAX_CACHE=16


def _cache(store):return _caches.setdefault(store,OrderedDict())

def begin(store,player,run):
 if os.environ.get('DB2_COMBAT_PREFETCH','1')!='1':return
 try:loop=asyncio.get_running_loop()
 except RuntimeError:return
 cache=_cache(store);key=(player,run['seed']);now=time.monotonic()
 for old,(deadline,_,task)in list(cache.items()):
  if deadline<now or len(cache)>=MAX_CACHE:
   if task.done():cache.pop(old,None)
 if key in cache or len(cache)>=MAX_CACHE:return
 active=_active.setdefault(loop,set())
 if active:return  # One background replay per event loop; no unbounded begin queue.
 payload={'team':copy.deepcopy(run['team']),'smapId':run['smapId'],'seed':run['seed'],'manualRecordMap1':{},'manualRecordMap2':{},'auto':True}
 task=loop.create_task(simulate_async(payload));active.add(task)
 def done(task):
  active.discard(task)
  if not task.cancelled():task.exception()  # Observe background failures even if the client leaves.
 task.add_done_callback(done);cache[key]=(now+900,payload,task)


async def outcome(store,player,run,payload):
 entry=_cache(store).get((player,run['seed']))
 if entry:
  deadline,pre,task=entry
  if deadline>=time.monotonic()and pre['team']==payload['team']and pre['smapId']==payload['smapId']:
   try:result=await asyncio.shield(task)
   except (ValueError,OSError):result=None
   if result is not None:
    records=result.get('records',{})
    first,second=records.get('1',{}),records.get('2',{})
    # Match the exact submitted records. Manual/ship changes fall back to replay.
    if payload['manualRecordMap1']==first and payload['manualRecordMap2']==second:return result,True
 return await simulate_async(payload),False


def finish(store,player,seed):_cache(store).pop((player,seed),None)
