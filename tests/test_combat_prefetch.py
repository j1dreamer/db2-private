import asyncio,copy,json,tempfile,time,unittest
from pathlib import Path
from unittest.mock import AsyncMock,patch
from server import combat_prefetch,adventure
from server.storage import Store
from server.profile import character
from server.battle import build_team,simulate

class PrefetchTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(Path(self.tmp.name)/'db');self.s.register('tester','password');p=self.s.create_player(1,'Tester');p['team']['roles']['2']=character(100801,2);p['team']['roles']['3']=character(101101,3);self.s.save(p)
 async def asyncTearDown(self):
  tasks=[entry[2]for entry in combat_prefetch._cache(self.s).values()]
  if tasks:await asyncio.gather(*tasks,return_exceptions=True)
  self.s.db.close();self.tmp.cleanup()
 async def test_recovered_engine_prefetch_matches_records_and_commits_once(self):
  response=adventure.begin(self.s,1,{'smapId':10101,'teamIndexs':[1,2,3]});p=self.s.player(1);run=json.loads(self.s.db.execute('SELECT data FROM adventure_runs').fetchone()[0]);entry=combat_prefetch._cache(self.s)[(p['id'],run['seed'])]
  started=time.monotonic();out=await entry[2];cold_ms=(time.monotonic()-started)*1000
  args={'star':out['star'],'teamIndexs':[1,2,3],'shipIdxs':[],'seed':run['seed'],'manualRecordMap1':out['records'].get('1',{}),'manualRecordMap2':out['records'].get('2',{}),'tickNumber':out['tickNumber']}
  started=time.monotonic();result=await adventure.end(self.s,1,args);warm_ms=(time.monotonic()-started)*1000
  audit=json.loads(self.s.db.execute("SELECT detail FROM audit WHERE action='end_smap' ORDER BY id DESC LIMIT 1").fetchone()[0]);self.assertTrue(audit['prefetched']);self.assertEqual(result['coin'],1200)
  print('Prefetch benchmark (local only): cold_ms='+str(round(cold_ms,1))+' settle_ms='+str(round(warm_ms,1)),flush=True)
  with self.assertRaises(ValueError):await adventure.end(self.s,1,args)
 async def test_record_or_ship_changes_fall_back_to_real_replay(self):
  p=self.s.player(1);run={'team':build_team(p,[1]),'smapId':10101,'seed':123};pre={'team':copy.deepcopy(run['team']),'smapId':10101,'seed':123,'manualRecordMap1':{},'manualRecordMap2':{}}
  result={'records':{'1':{},'2':{}},'isWin':True};future=asyncio.get_running_loop().create_future();future.set_result(result);combat_prefetch._cache(self.s)[(p['id'],123)]=(time.monotonic()+30,pre,future)
  for change in ({'manualRecordMap1':{'5':[{'teamId':1,'skillId':100101}]}},{'team':{**pre['team'],'shipChanged':True}}):
   payload={**pre,**change}
   with patch('server.combat_prefetch.simulate_async',new=AsyncMock(return_value={'replayed':True}))as replay:
    value,hit=await combat_prefetch.outcome(self.s,p['id'],run,payload);self.assertFalse(hit);self.assertTrue(value['replayed']);replay.assert_awaited_once_with(payload)
