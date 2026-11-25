import copy,json,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server import time_peak
from server.storage import Store
from server.profile import character
from server.adventure import map_info
from server.battle import simulate_async
from tools.client_patches import patch_time_peak_transport
class TimePeakTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.clock=patch('time.time',return_value=1795570000);self.now=self.clock.start();self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set();self.store.register('peak','password');p=self.store.create_player(1,'Tester');p.update(level=80,gem=10000);r=next(iter(p['team']['roles'].values()));r.update(level=80,power=100000);r['attr'].update(hp=1000000,atk=100000,mdef=1000);r['attr']['def']=1000;r['initAttr']=dict(r['attr']);p['ctime']-=30*86400000
  for b in time_peak.configs()[0].values():
   parent,sm=map_info(b['unlockSmapId']);p['smapStarMap'].setdefault(str(parent['type']),{}).setdefault(str(parent['kindId']),{})[str(sm['kindId'])]=3
  self.store.save(p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup();self.clock.stop()
 async def call(self,action,args=None):
  route='logic.timePeakHandler.'+action;out=await time_peak.handle(self.store,1,route,args or {});self.seen.add(route);return out
 def position(self,mid,sid):
  p=self.store.player(1);s=p['timePeak'];s.update(bmapId=mid,smapStatusMap={str(t['kindId']):3 if t['type']==1 else 2 for t in time_peak.tile_list(mid)if t['kindId']!=sid});self.store.save(p)
 async def battle(self,sid=101):
  result=await time_peak.handle(self.store,1,time_peak.BEGIN_ROUTE,{'smapId':sid,'teamIndexs':[1],'shipIdxs':[]});temp=result['_temp'];out=await simulate_async({'mode':'timePeak','team':temp['team1'],'defender':temp['team2'],'seed':temp['seed'],'auto':True});return {'smapId':sid,'seed':temp['seed'],'isWin':out['isWin'],'selfHpMap':{str(r['idx']):r['hp']if out['isWin']else 0 for r in out['attacker']['roles']},'selfMpMap':{str(r['idx']):r['mp']for r in out['attacker']['roles']},'challengerHpMap':{str(r['idx']):r['hp']for r in out['defender']['roles']},'challengerMpMap':{str(r['idx']):r['mp']for r in out['defender']['roles']},'manualRecordMap':out['records'],'tickNumber':out['tickNumber']}
 async def test_all_thirteen_routes_private_mode_real_battle_rewards_and_borrow(self):
  await self.call('openMap',{'bmapId':1});await self.call('recordLog',{'text':'Private run opened'});await self.call('setExtInfo',{'key':'note','value':'test'});s=self.store.player(1)['timePeak'];await self.call('updateBattleInfo',{'selfHpMap':s['selfInfo']['hpMap'],'selfMpMap':s['selfInfo']['mpMap'],'challengerInfoMap':s['challengerInfoMap'],'winSmapIds':s['winSmapIds']});args=await self.battle();self.assertTrue(args['isWin']);await self.call('challenge',args);offers=(await self.call('getBlessing',{'smapId':101}))['_temp']['blessingIds'];await self.call('selectBlessing',{'smapId':101,'blessingId':offers[0]});result=await self.call('openBox',{'smapId':102});self.assertEqual(result['_temp']['entityCountMap']['102'],50)
  args=await self.battle(103);await self.call('challenge',args);await self.call('selectBlessing',{'smapId':103,'blessingId':900002});await self.call('spa',{'smapId':104});await self.call('borrowRole',{'smapId':105,'roleIdx':1000001});self.assertIn('1000001',self.store.player(1)['timePeak']['borrowedRoleMap']);self.position(1,119);p=self.store.player(1);p['timePeak']['selfInfo']['hpMap']['1']=0;self.store.save(p);await self.call('altar',{'smapId':119});self.assertGreater(self.store.player(1)['timePeak']['selfInfo']['hpMap']['1'],0)
  waypoint=next(t for t in time_peak.configs()[1].values()if t['type']==7);self.position(waypoint['bmapId'],waypoint['kindId']);await self.call('setStatus',{'smapId':waypoint['kindId'],'status':2});await self.call('closeMap');self.assertEqual(self.seen,time_peak.ROUTES)
 async def test_server_rejects_skip_heal_win_forgery_seed_replay_and_expiry(self):
  await self.call('openMap',{'bmapId':1})
  for action,args in (('openBox',{'smapId':102}),('selectBlessing',{'smapId':101,'blessingId':900001}),('setStatus',{'smapId':101,'status':3}),('setExtInfo',{'key':'gem','value':100000}),('updateBattleInfo',{'selfHpMap':{'1':999}})):
   with self.assertRaises(ValueError):await self.call(action,args)
  args=await self.battle()
  for bad in ({**args,'seed':args['seed']+1},{**args,'isWin':False},{**args,'selfHpMap':{'1':1}}):
   with self.assertRaises(ValueError):await self.call('challenge',bad)
  await self.call('challenge',args)
  with self.assertRaises(ValueError):await self.call('challenge',args)
 async def test_boxes_stay_claimed_across_close_reopen_database_restart(self):
  await self.call('openMap',{'bmapId':1});self.position(1,102);first=await self.call('openBox',{'smapId':102});self.assertTrue(first['_temp']['entityCountMap']);await self.call('closeMap');await self.call('openMap',{'bmapId':1});self.position(1,102);self.store.db.close();self.store=Store(Path(self.tmp.name)/'db');self.assertEqual((await self.call('openBox',{'smapId':102}))['_temp']['entityCountMap'],{})
 async def test_unlock_60percent_group_age_and_close_invalidate_run(self):
  p=self.store.player(1);p['smapStarMap']={};self.store.save(p)
  with self.assertRaises(ValueError):await self.call('openMap',{'bmapId':1})
  parent,sm=map_info(time_peak.configs()[0][2]['unlockSmapId']);p=self.store.player(1);p['smapStarMap'].setdefault(str(parent['type']),{}).setdefault(str(parent['kindId']),{})[str(sm['kindId'])]=3;self.store.save(p)
  with self.assertRaises(ValueError):await self.call('openMap',{'bmapId':2})
 async def test_borrowed_roles_only_exist_in_peak_and_original_selector_handles_peak_ids(self):
  await self.call('openMap',{'bmapId':1});self.position(1,105);await self.call('borrowRole',{'smapId':105,'roleIdx':1000002});p=self.store.player(1);self.assertNotIn('1000002',p['team']['roles']);root=Path(__file__).parent;source=patch_time_peak_transport(Path('client/main.decoded.js').read_text());begin=source.index('selectBattleRolesScene: [ function(');end=source.index('timePeakHandler: [ function(',begin)if 'timePeakHandler: [ function('in source[begin:]else len(source);module=source[begin:source.index('\n} ],',source.index('cc._RF.pop();',begin))+5];res=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':p,'checkHome':True,'checkTimePeakSelector':True,'peakSelected':['1000002'],'moduleOverrides':{'selectBattleRolesScene':module}}),text=True,capture_output=True);self.assertEqual(res.returncode,0,res.stderr);self.assertIn('1000002',json.loads(res.stdout)['peakSelector']['selectIdxs'])
 async def test_run_expiry_close_and_cache_sync_cannot_heal_or_create_win(self):
  await self.call('openMap',{'bmapId':1});args=await self.battle();self.now.return_value+=901
  with self.assertRaises(ValueError):await self.call('challenge',args)
  args=await self.battle();await self.call('closeMap')
  with self.assertRaises(ValueError):await self.call('challenge',args)
  await self.call('openMap',{'bmapId':1});s=self.store.player(1)['timePeak'];payload={'selfHpMap':s['selfInfo']['hpMap'],'selfMpMap':s['selfInfo']['mpMap'],'challengerInfoMap':s['challengerInfoMap'],'winSmapIds':s['winSmapIds']}
  for key,value in (('selfHpMap',{'1':1000000}),('winSmapIds',[101]),('challengerInfoMap',{})):
   with self.assertRaises(ValueError):await self.call('updateBattleInfo',{**payload,key:value})
 async def test_private_time_peak_panel_and_transport_actual_javascript(self):
  source=patch_time_peak_transport(Path('client/main.decoded.js').read_text());res=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_time_peak.cjs')],input=json.dumps({'source':source}),text=True,capture_output=True);self.assertEqual(res.returncode,0,res.stderr);self.assertTrue(json.loads(res.stdout)['transport'])
