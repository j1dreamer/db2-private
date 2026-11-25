import asyncio,datetime,json,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server import eye
from server.profile import character,table
from server.rules import constants
from server.battle import simulate
from tools.client_patches import patch_eye_transport

class EyeTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.stamp=datetime.datetime(2026,11,25,10,tzinfo=eye.TZ).timestamp();self.clock=patch('time.time',return_value=self.stamp);self.clock.start();self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set();kind=next(r['kindId']for r in table('role')if r['classId']==19)
  for account,name in enumerate(('attacker','defender'),1):
   self.store.register(name,'password');p=self.store.create_player(account,name);p.update(level=40,gem=10000);p['vip']['level']=2;p['team']['roles']={'1':character(kind,1)};p['team']['roles']['1']['attr'].update(hp=100000 if account==1 else 100,atk=100000 if account==1 else 1);self.store.save(p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup();self.clock.stop()
 def advance(self,seconds):self.clock.stop();self.clock=patch('time.time',return_value=self.stamp+seconds);self.clock.start()
 async def call(self,action,args=None,account=1):
  route='logic.eyeHandler.'+action;r=await eye.handle(self.store,account,route,args or {});self.seen.add(route);return r
 async def take(self,rank=1,account=2):return await self.call('choose',{'rank':rank,'teamIndexs':[1],'shipIndexs':[]},account)
 async def test_all_seven_routes_and_recovered_pvp_occupation_change(self):
  self.assertEqual(len((await self.call('info'))['_temp']['list']),11);await self.call('startPrivate',{'teamIndexs':[1]},2);await self.take()
  defense=await self.call('defenseTeam',{'playerId':2});self.assertEqual(defense['_temp']['defenseTeam']['playerId'],2)
  r=await self.take(account=1);again=await self.take(account=1);self.assertEqual(r['_temp']['seed'],again['_temp']['seed']);run=json.loads(self.store.db.execute("SELECT data FROM pvp_runs WHERE mode='eye'").fetchone()[0]);out=await asyncio.to_thread(simulate,{'mode':'pvp','team':eye.combat_raw(run['attack']),'defender':eye.combat_raw(run['defense']),'seed':run['seed']});self.assertTrue(out['isWin'])
  args={'rank':1,'defenderId':2,'teamIndexs':[1],'shipIndexs':[],'isWin':True,'seed':run['seed'],'bgImgId':constants('battle.ARENA_BACKGROUND_IMG_IDS')[0],'damageMap':{'forged':1}}
  with self.assertRaises(ValueError):await self.call('challenge',{**args,'isWin':False})
  r=await self.call('challenge',args);self.assertEqual(self.store.player(1)['eye']['list'][0]['playerId'],1);self.assertEqual(self.store.player(2)['eye']['type'],'')
  with self.assertRaises(ValueError):await self.call('challenge',args)
  report=(await self.call('report',{'id':r['_temp']['reportId']}))['_temp']['report'];self.assertEqual(report['seed'],run['seed']);self.assertNotIn('forged',report['damageMap'])
  r=await self.call('buyChallengeTimes');self.assertEqual(r['gem'],9950);self.assertEqual(self.seen,eye.ROUTES)
 async def test_time_rewards_on_leaving_are_once_and_private_has_source_rate(self):
  await self.take(account=1);self.advance(1800);await self.call('startPrivate',{'teamIndexs':[1]});p=self.store.player(1);self.assertEqual(len(p['extra']['mails']),1);self.assertEqual(p['extra']['mails'][0]['dropList'],[{'entityId':112,'count':17,'extra':{}},{'entityId':101,'count':80000,'extra':{}}]);self.assertEqual(len(self.store.player(1)['extra']['mails']),1)
  self.advance(3600);await self.take(2,1);p=self.store.player(1);self.assertEqual(p['extra']['mails'][1]['dropList'],[{'entityId':112,'count':4,'extra':{}},{'entityId':101,'count':6000,'extra':{}}])
 async def test_scheduled_close_waits_for_2230_and_next_day_resets_quota(self):
  await self.take(account=1);self.advance(12*3600);p=self.store.player(1);self.assertEqual(p['eye']['type'],'');self.assertEqual(len(p['extra']['mails']),0)
  with self.assertRaises(ValueError):await self.take(account=2)
  self.advance(12*3600+1800);p=self.store.player(1);self.assertEqual(len(p['extra']['mails']),1);reward=p['extra']['mails'][0]['dropList'];self.assertEqual(sum(r['count']for r in reward if r['entityId']==112),408);self.assertEqual(sum(r['count']for r in reward if r['entityId']not in (101,112)),24)
  self.assertEqual(len(self.store.player(1)['extra']['mails']),1);self.advance(86400);self.assertEqual(self.store.player(1)['eye']['remainingChallengeTimes'],2)
 async def test_permissions_role_day_foreign_report_and_vip_limits(self):
  p=self.store.player(1);p['team']['roles']['1']=character(100101,1);self.store.save(p)
  with self.assertRaises(ValueError):await self.take(account=1)
  with self.assertRaises(ValueError):await self.call('report',{'id':'foreign'})
  with self.assertRaises(ValueError):await self.call('defenseTeam',{'playerId':999})
  await self.call('buyChallengeTimes')
  with self.assertRaises(ValueError):await self.call('buyChallengeTimes')
 async def test_recovered_eye_generator_accepts_empty_and_occupied_lists(self):
  root=Path(__file__).parent
  for take in (False,True):
   if take:await self.take(account=1)
   result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkEye':True,'checkTeam':True}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);view=json.loads(result.stdout)['eyeView'];self.assertEqual(len(view['list']),11);self.assertEqual(view['myRank'],1 if take else 0)
  source=patch_eye_transport((root.parent/'client/main.decoded.js').read_text());subprocess.run(['node','--check'],input=source,text=True,capture_output=True,check=True)
