import asyncio,json,subprocess,tempfile,unittest
from pathlib import Path
from server.storage import Store
from server import expedition
from server.battle import simulate
from tools.client_patches import patch_expedition_transport

class ExpeditionTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Tester');p.update(level=100,gem=10000);p['vip']['level']=13;p['team']['roles']['1']['attr'].update(hp=100000,atk=100000);self.store.save(p);self.seen=set()
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup()
 async def call(self,six,action,args=None):
  route='logic.'+expedition.mode(six)+'Handler.'+action;r=await expedition.handle(self.store,1,route,args or {});self.seen.add(route);return r
 async def begin(self,six):return await expedition.handle(self.store,1,expedition.BEGIN_ROUTE,{'isSix':six,'teamIndexs':[1],'shipIdxs':[]})
 async def battle(self,six):
  r=await self.begin(six);t=r['_temp'];self.assertEqual((await self.begin(six))['_temp']['seed'],t['seed']);out=await asyncio.to_thread(simulate,{'mode':'expedition','team':t['team1'],'defender':t['team2'],'seed':t['seed']});a_hp,a_mp=expedition.hpmp(out['attacker']);d_hp,d_mp=expedition.hpmp(out['defender']);args={'seed':t['seed'],'manualRecordMap':{},'tickNumber':out['tickNumber'],'isWin':out['isWin'],'selfHpMap':a_hp,'selfMpMap':a_mp,'challengerHpMap':d_hp,'challengerMpMap':d_mp}
  with self.assertRaises(ValueError):await self.call(six,'challenge',{**args,'selfHpMap':{'1':10**9}})
  await self.call(six,'challenge',args)
  with self.assertRaises(ValueError):await self.call(six,'challenge',args)
  return out
 async def test_all_nine_routes_battle_chests_reset_and_skip(self):
  for six in (False,True):
   await self.call(six,'reset')
   if six:self.assertEqual(len((await self.call(six,'info'))['_temp']['playerInfos']),12)
   out=await self.battle(six);self.assertTrue(out['isWin']);p=self.store.player(1);self.assertEqual(p['expedition'][expedition.key(six,'status')],2)
   with self.assertRaises(ValueError):await self.call(six,'reset')
   r=await self.call(six,'receive');self.assertTrue(r['_temp']['entityCountMap']);self.assertEqual(self.store.player(1)['expedition'][expedition.key(six,'passId')],1)
   with self.assertRaises(ValueError):await self.call(six,'receive')
   await self.call(six,'reset');r=await self.call(six,'skip');self.assertTrue(r['_temp']['entityCountMap']);self.assertEqual(self.store.player(1)['expedition'][expedition.key(six,'passId')],1)
   with self.assertRaises(ValueError):await self.call(six,'skip')
   with self.assertRaises(ValueError):await self.call(six,'reset')
  self.assertEqual(self.seen,expedition.ROUTES)
 async def test_hp_mp_carry_into_following_battle_and_dead_roles_rejected(self):
  await self.call(False,'reset');await self.battle(False);await self.call(False,'receive');p=self.store.player(1);p['expedition']['selfInfo']={'hpMap':{'1':1234},'mpMap':{'1':32}};self.store.save(p);r=await self.begin(False);self.assertEqual(r['_temp']['team1']['roles'][0]['hp'],1234);self.assertEqual(r['_temp']['team1']['roles'][0]['mp'],32)
  self.store.db.execute("DELETE FROM pvp_runs WHERE mode='expedition:expedition'");p=self.store.player(1);p['expedition']['selfInfo']['hpMap']['1']=0;self.store.save(p)
  with self.assertRaises(ValueError):await self.begin(False)
 async def test_snapshot_survives_roster_upgrade_and_reset_invalidates_run(self):
  await self.call(False,'reset');r=await self.begin(False);p=self.store.player(1);p['team']['roles']['1']['attr']['atk']=1;self.store.save(p);self.assertEqual((await self.begin(False))['_temp']['team1'],r['_temp']['team1'])
  await self.call(False,'reset')
  with self.assertRaises(ValueError):await self.call(False,'challenge',{'seed':r['_temp']['seed'],'isWin':True})
 async def test_level_ownership_and_reset_quota_guards(self):
  with self.assertRaises(ValueError):await self.begin(False)
  p=self.store.player(1);p['level']=1;self.store.save(p)
  with self.assertRaises(ValueError):await self.call(False,'reset')
  p['level']=100;self.store.save(p);await self.call(False,'reset')
  with self.assertRaises(ValueError):await expedition.handle(self.store,1,expedition.BEGIN_ROUTE,{'isSix':False,'teamIndexs':[999],'shipIdxs':[]})
 async def test_recovered_expedition_generators_and_transport_accept_data(self):
  await self.call(False,'reset');await self.call(True,'reset');root=Path(__file__).parent;result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkTeam':True,'checkExpedition':True}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);views=json.loads(result.stdout)['expeditionViews'];self.assertEqual(views['normal']['passId'],0);self.assertEqual(len(views['six']['playerInfos']),12)
  source=patch_expedition_transport((root.parent/'client/main.decoded.js').read_text());subprocess.run(['node','--check'],input=source,text=True,capture_output=True,check=True)
