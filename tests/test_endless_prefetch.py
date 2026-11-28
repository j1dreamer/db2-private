import asyncio,json,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch,AsyncMock
from server.storage import Store
from server import endless,combat_prefetch

class EndlessPrefetchTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(Path(self.tmp.name)/'db');self.s.register('tester','password');p=self.s.create_player(1,'Tester');p['level']=100;p['team']['roles']['1']['attr'].update(hp=10**9,atk=10**8);self.s.save(p)
 async def asyncTearDown(self):
  tasks=[r[2]for r in combat_prefetch._cache(self.s).values()]
  if tasks:await asyncio.gather(*tasks,return_exceptions=True)
  self.s.db.close();self.tmp.cleanup()
 async def test_snake_way_background_replay_exact_result_and_one_settlement(self):
  row=next(r for r in endless.maps().values()if r['bmapId']==401 and r['no']==1);args={'bmapId':401,'smapId':row['kindId'],'teamIndexs':[1],'shipIdxs':[]}
  started=time.monotonic();begin=endless.begin(self.s,1,args);seed=begin['_temp']['seed'];task=combat_prefetch._cache(self.s)[(1,seed)][2];out=await task;cold=(time.monotonic()-started)*1000
  self.assertTrue(out['isWin']);first,second=out['records'].get('1',{}),out['records'].get('2',{})
  if row['mobZoneCount']==1:first,second={},first
  request={**args,'seed':seed,'manualRecordMap1':first,'manualRecordMap2':second,'tickNumber':out['tickNumber']}
  with patch('server.combat_prefetch.simulate_async',new=AsyncMock(side_effect=AssertionError('unexpected replay'))):
   with self.assertRaises(ValueError):await endless.finish(self.s,1,{**request,'tickNumber':out['tickNumber']+1})
   self.assertEqual(self.s.player(1)['endless']['topPassId'],0)
   started=time.monotonic();result=await endless.finish(self.s,1,request);settle=(time.monotonic()-started)*1000
  self.assertEqual(result['_temp']['entityCountMap']['102'],50)
  log=json.loads(self.s.db.execute("SELECT detail FROM audit WHERE action='endless_pass'").fetchone()[0]);self.assertTrue(log['prefetched'])
  with self.assertRaises(ValueError):await endless.finish(self.s,1,request)
  print('Snake Way local benchmark: cold_ms='+str(round(cold,1))+' cached_settlement_ms='+str(round(settle,1)),flush=True)
 async def test_disabling_background_still_replays_and_preserves_validation(self):
  row=next(r for r in endless.maps().values()if r['bmapId']==401 and r['no']==1)
  with patch.dict('os.environ',{'DB2_COMBAT_PREFETCH':'0'}):endless.begin(self.s,1,{'bmapId':401,'smapId':row['kindId'],'teamIndexs':[1],'shipIdxs':[]})
  self.assertFalse(combat_prefetch._cache(self.s))
