import concurrent.futures,copy,os,shutil,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch,AsyncMock
from server import battle,battle_runtime,battle_prefetch
from server.storage import Store
from server.arena import npc,raw_team,combat_raw
class RuntimeTests(unittest.TestCase):
 def test_fresh_vm_matches_one_shot_across_jobs_and_restarts(self):
  with tempfile.TemporaryDirectory()as folder:
   s=Store(Path(folder)/'db');s.register('tester','password');p=s.create_player(1,'Tester')
   team=battle.build_team(p,['1']);a={'mode':'pvp','team':team,'defender':combat_raw(raw_team(npc(20))),'seed':123}
   b={**a,'seed':4321,'mode':'practice'}
   with patch.dict(os.environ,{'DB2_BATTLE_PERSISTENT':'0'}):expected=[battle.simulate(v)for v in (a,b)]
   worker=battle_runtime.Worker(shutil.which('node'))
   try:
    for i,v in enumerate((a,b,a,b)):self.assertEqual(worker.run(v),expected[i%2])
    worker.process.kill();worker.process.wait();self.assertEqual(worker.run(a),expected[0])
   finally:worker.stop();s.db.close()
 def test_pool_serializes_concurrent_requests_without_crossed_responses(self):
  worker=battle_runtime.Pool(shutil.which('node'))
  try:
   with concurrent.futures.ThreadPoolExecutor(max_workers=2)as executor:
    values=list(executor.map(worker.run,[{'mode':'rolePowerAudit','cases':[{'attr':{'hp':1000,'atk':100,'def':10,'mdef':10},'skillLevels':[],'evolveSkills':[]}]}]*2))
   self.assertEqual(values[0],values[1])
  finally:worker.close()
class PrefetchTests(unittest.IsolatedAsyncioTestCase):
 async def test_matching_trace_reuses_and_changed_inputs_or_skills_replay(self):
  class Owner:pass
  store=Owner();payload={'mode':'expedition','team':{'roles':[]},'defender':{},'seed':1,'auto':True};result={'records':{'1':[{'teamId':1,'skillId':99}]},'isWin':True}
  with patch('server.battle_prefetch.simulate_async',new=AsyncMock(return_value=result))as simulate:
   battle_prefetch.begin(store,1,payload);await __import__('asyncio').sleep(0)
   request={**payload,'auto':False,'manualRecordMap':result['records']}
   self.assertEqual(await battle_prefetch.outcome(store,1,request),result);self.assertEqual(simulate.await_count,1)
   battle_prefetch.begin(store,1,payload);await __import__('asyncio').sleep(0)
   await battle_prefetch.outcome(store,1,{**request,'manualRecordMap':{}});self.assertEqual(simulate.await_count,3)
   await battle_prefetch.outcome(store,1,{**request,'seed':2});self.assertEqual(simulate.await_count,4)
 async def test_real_expedition_settlement_uses_cached_replay_and_keeps_hp_validation(self):
  from server import expedition
  with tempfile.TemporaryDirectory()as folder:
   store=Store(Path(folder)/'db');store.register('tester','password');store.create_player(1,'Tester');p=store.player(1);p['level']=100;expedition.reset(p,False);store.save(p)
   started=time.monotonic();reply=expedition.begin(store,1,{'isSix':False,'teamIndexs':[1],'shipIdxs':[]});entry=next(iter(battle_prefetch._caches[store].values()));out=await entry[1];cold=(time.monotonic()-started)*1000
   ah,am=expedition.hpmp(out['attacker']);dh,dm=expedition.hpmp(out['defender']);request={'seed':reply['_temp']['seed'],'isWin':out['isWin'],'manualRecordMap':out['records'],'tickNumber':out['tickNumber'],'selfHpMap':ah,'selfMpMap':am,'challengerHpMap':dh,'challengerMpMap':dm}
   with patch('server.battle_prefetch.simulate_async',new=AsyncMock(side_effect=AssertionError('unexpected second replay'))):
    started=time.monotonic();await expedition.challenge(store,1,False,request);settle=(time.monotonic()-started)*1000
   with self.assertRaises(ValueError):await expedition.challenge(store,1,False,request)
   print('Expedition measured local: verification_ms='+str(round(cold,1))+' cached_settlement_ms='+str(round(settle,1)),flush=True);store.db.close()
