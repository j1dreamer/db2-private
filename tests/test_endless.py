import asyncio,json,subprocess,tempfile,unittest
from pathlib import Path
from server.storage import Store
from server import endless
from server.battle import simulate
from server.profile import character,table
from server.rules import constants
from tools.client_patches import patch_endless_transport,patch_adventure_transport

class EndlessTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Tester');p.update(level=100,gem=10000);p['team']['roles']['1']['attr'].update(hp=10**9,atk=10**8);self.store.save(p);self.seen=set()
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup()
 async def call(self,action,args=None):
  route='logic.endlessHandler.'+action;r=await endless.handle(self.store,1,route,args or {});self.seen.add(route);return r
 async def pass_floor(self,bmap=401,indices=None):
  target=next(r for r in endless.maps().values()if r['bmapId']==bmap and r['no']==1);args={'bmapId':bmap,'smapId':target['kindId'],'teamIndexs':indices or [1],'shipIdxs':[]};r=await self.call('begin',args);run=json.loads(self.store.db.execute("SELECT data FROM pvp_runs WHERE mode='endless'").fetchone()[0]);self.assertEqual((await self.call('begin',args))['_temp']['seed'],run['seed'])
  out=await asyncio.to_thread(simulate,{'team':run['team'],'smapId':run['smapId'],'seed':run['seed'],'auto':True});self.assertTrue(out['isWin']);first=out['records'].get('1',{});second=out['records'].get('2',{})
  if target['mobZoneCount']==1:first,second={},first
  result={**args,'seed':run['seed'],'manualRecordMap1':first,'manualRecordMap2':second,'tickNumber':out['tickNumber']}
  with self.assertRaises(ValueError):await self.call('pass',{**result,'seed':run['seed']+1})
  r=await self.call('pass',result)
  with self.assertRaises(ValueError):await self.call('pass',result)
  return r
 async def test_all_six_routes_have_durable_positive_paths(self):
  r=await self.pass_floor();self.assertEqual(self.store.player(1)['endless']['topPassId'],1);self.assertEqual(r['_temp']['entityCountMap']['102'],50)
  await self.call('skip');self.assertEqual(self.store.player(1)['gem'],10100)
  with self.assertRaises(ValueError):await self.call('skip')
  await self.call('setPursuitTeamIndexs',{'bmapId':401,'teamIndexs':[1],'shipIndexs':[]});await self.call('resetSetPursuitTeamTimes',{'bmapId':401});r=await self.call('buyFruitMapTimes');self.assertEqual(r['endless']['fruitMapBuyTimes'],1);self.assertEqual(self.seen,endless.ROUTES)
 async def test_fruit_success_uses_theme_rotates_roster_and_daily_limit(self):
  allowed=constants('server.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP')['1'];p=self.store.player(1);p['team']['roles']={}
  for idx,cls in enumerate(allowed[:5],1):
   kind=next(r['kindId']for r in table('role')if r['classId']==cls);role=character(kind,idx);role['level']=100;role['attr'].update(hp=10**14,atk=10**14,hit=10**8,dodge=10**6);p['team']['roles'][str(idx)]=role
  self.store.save(p)
  await self.pass_floor(409,[1,2,3,4,5]);p=self.store.player(1);self.assertEqual(p['endless']['fruitMapChallengeTimes'],1);self.assertEqual(p['endless']['fruitMapUseRolesNo'],2);self.assertEqual(p['endless']['otherTopPassIdMap']['409'],1)
  await self.pass_floor(415,[1,2,3,4,5]);p=self.store.player(1);self.assertEqual(p['endless']['starSignMapChallengeTimes'],1);self.assertEqual(p['endless']['starSignMapUseRolesNo'],2)
  for _ in range(5):await self.call('buyFruitMapTimes')
  with self.assertRaises(ValueError):await self.call('buyFruitMapTimes')
 async def test_invalid_floor_snapshot_and_pursuit_overlap_cannot_charge(self):
  for args in ({'bmapId':401,'smapId':40002,'teamIndexs':[1]},{'bmapId':412,'smapId':40001,'teamIndexs':[1]},{'bmapId':401,'smapId':40001,'teamIndexs':[999]}):
   with self.assertRaises(ValueError):await self.call('begin',args)
  self.assertEqual(self.store.player(1)['gem'],10000)
  with self.assertRaises(ValueError):await self.call('resetSetPursuitTeamTimes',{'bmapId':401})
  p=self.store.player(1);p['endless']['topPassId']=1;p['endless']['otherTopPassIdMap']['402']=1;self.store.save(p);await self.call('setPursuitTeamIndexs',{'bmapId':401,'teamIndexs':[1],'shipIndexs':[]})
  with self.assertRaises(ValueError):await self.call('setPursuitTeamIndexs',{'bmapId':402,'teamIndexs':[1],'shipIndexs':[]})
 async def test_recovered_map_generators_and_transport_accept_profile(self):
  root=Path(__file__).parent;result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkTeam':True,'checkEndless':True}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);view=json.loads(result.stdout)['endlessViews'];self.assertEqual(view['main']['nextNo'],1);self.assertEqual(view['fruit']['remainingTimes'],10);self.assertEqual(view['star']['remainingTimes'],10)
  source=patch_adventure_transport(patch_endless_transport((root.parent/'client/main.decoded.js').read_text()));subprocess.run(['node','--check'],input=source,text=True,capture_output=True,check=True)
