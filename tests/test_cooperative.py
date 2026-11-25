import copy,datetime,json,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server import cooperative,arena
from server.profile import character
from server.storage import Store
from server.battle import simulate_async
from tools.client_patches import patch_cooperative_transport
class CooperativeTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.clock=patch('time.time',return_value=datetime.datetime(2026,11,25,12,tzinfo=cooperative.ZONE).timestamp());self.now=self.clock.start();self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set()
  for pid in range(1,8):
   self.store.register('coop'+str(pid),'password');p=self.store.create_player(pid,'Player'+str(pid));p.update(level=80,gem=10000);base=next(iter(p['team']['roles'].values()));p['team']['roles']={}
   for i in range(1,16):
    r=character(base['kindId'],i);r.update(level=80,power=100000 if pid<=3 else 100);r['attr'].update(hp=100000 if pid<=3 else 1000,atk=10000 if pid<=3 else 20,mdef=100 if pid<=3 else 1);r['attr']['def']=100 if pid<=3 else 1;r['initAttr']=dict(r['attr']);p['team']['roles'][str(i)]=r
   self.store.save(p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup();self.clock.stop()
 async def call(self,mode,action,args=None,pid=1):
  route='logic.'+mode+'Handler.'+action;out=await cooperative.handle(self.store,pid,route,args or {});self.seen.add(route);return out
 async def create(self,mode,pid,idx=1):return (await self.call(mode,'createTeam',{'teamIndexs':[idx],'shipIndexs':[]},pid))['_temp']['teamInfo']['teamId']
 async def teams(self,mode):
  a=await self.create(mode,1);b=await self.create(mode,4)
  if mode=='teamBattle':
   for pid,tid in ((2,a),(3,a),(5,b),(6,b)):await self.call(mode,'joinTeam',{'teamId':tid,'teamIndexs':[1],'shipIndexs':[]},pid)
  await self.call(mode,'practice',{'teamId':a});await self.call(mode,'practice',{'teamId':b},4);self.now.return_value=datetime.datetime(2026,11,25,19,tzinfo=cooperative.ZONE).timestamp();return a,b
 async def battle(self,mode,a,b):
  v=(await self.call(mode,'choose',{'attackTeamId':a,'defenderTeamId':b}))['_temp'];run={'attack':v['attackTeamInfo'],'defense':v['defenseTeamInfo'],'seed':v['seed']};out=await cooperative.replay(mode,run);client=await simulate_async({'mode':'cooperativeClient','cooperativeMode':mode,**run});self.assertTrue(cooperative.equivalent(client['winPlayerIdMap'],out['winPlayerIdMap']));self.assertTrue(cooperative.equivalent(client['damageMapMap'],out['damageMapMap']));self.assertEqual(client['isWin'],out['isWin']);return {'attackTeamId':a,'defenderTeamId':b,'seed':v['seed'],'isWin':out['isWin'],'winPlayerIdMap':out['winPlayerIdMap'],'damageMapMap':out['damageMapMap']}
 async def test_all_twenty_five_routes_complete_business_and_actual_engine(self):
  for mode in cooperative.MODES:
   info=await self.call(mode,'getInfo');self.assertTrue(info['_temp']['openInfo']['isOpen']);tid=await self.create(mode,1,10);await self.call(mode,'setAutoPractice',{'teamId':tid,'isAuto':True});await self.call(mode,'joinTeam',{'teamId':tid,'teamIndexs':[10]},2);await self.call(mode,'getReadyTeamInfos');await self.call(mode,'removeTeamMember',{'teamId':tid,'playerId':2});await self.call(mode,'dissolveTeam',{'teamId':tid});a,b=await self.teams(mode);await self.call(mode,'match')
   if mode=='teamBattle':await self.call(mode,'refresh')
   args=await self.battle(mode,a,b);self.assertTrue(args['isWin']);result=await self.call(mode,'challenge',args);rank=await self.call(mode,'rank');self.assertGreater(rank['_temp']['myValue'],0);report=await arena.handle(self.store,1,'logic.arenaHandler.report',{'id':result['_temp']['reportId']});self.assertEqual(report['_temp']['report']['type'],mode)
   with self.assertRaises(ValueError):await self.call(mode,'challenge',args)
   self.now.return_value=datetime.datetime(2026,11,25,12,tzinfo=cooperative.ZONE).timestamp()
  self.assertEqual(self.seen,cooperative.ROUTES)
 async def test_three_real_members_required_permissions_and_disjoint_rosters(self):
  m='teamBattle';a=await self.create(m,1)
  for action,args,pid in (('practice',{'teamId':a},1),('dissolveTeam',{'teamId':a},2),('joinTeam',{'teamId':a,'teamIndexs':[1]},1)):
   with self.assertRaises(ValueError):await self.call(m,action,args,pid)
  await self.call(m,'joinTeam',{'teamId':a,'teamIndexs':[1]},2)
  with self.assertRaises(ValueError):await self.create(m,2,2)
  await self.call(m,'removeTeamMember',{'teamId':a,'playerId':2},2);self.assertEqual(self.store.player(2)['extra'][m]['practiceTimes'],0)
  m='prestigeBattle';await self.create(m,1)
  with self.assertRaises(ValueError):await self.call(m,'joinTeam',{'teamId':await self.create(m,2),'teamIndexs':[1]},1)
 async def test_seed_outcome_damage_forgery_expiry_and_stale_pair(self):
  mode='prestigeBattle';a,b=await self.teams(mode);args=await self.battle(mode,a,b);again=(await self.call(mode,'choose',{'attackTeamId':a,'defenderTeamId':b}))['_temp'];self.assertEqual(again['seed'],args['seed']);self.assertEqual(cooperative.get(self.store,mode,a)['attackTimes'],1)
  for bad in ({**args,'seed':args['seed']+1},{**args,'isWin':False},{**args,'damageMapMap':{}},{**args,'winPlayerIdMap':{}}):
   with self.assertRaises(ValueError):await self.call(mode,'challenge',bad)
  self.now.return_value+=901
  with self.assertRaises(ValueError):await self.call(mode,'challenge',args)
 async def test_prestige_daily_reward_loss_split_and_restart_once(self):
  mode='prestigeBattle';a,b=await self.teams(mode);args=await self.battle(mode,a,b);await self.call(mode,'challenge',args);self.assertEqual(cooperative.get(self.store,mode,b)['loss'],10);self.now.return_value=datetime.datetime(2026,11,25,23,tzinfo=cooperative.ZONE).timestamp();await self.call(mode,'getInfo');mails=self.store.player(4)['extra']['mails'];self.assertEqual(mails[-1]['dropList'][0]['count'],90);n=len(mails);self.store.db.close();self.store=Store(Path(self.tmp.name)/'db');await self.call(mode,'getInfo');self.assertEqual(len(self.store.player(4)['extra']['mails']),n)
 async def test_weekly_team_rank_original_prize_and_member_report_access(self):
  mode='teamBattle';a,b=await self.teams(mode);args=await self.battle(mode,a,b);result=await self.call(mode,'challenge',args);rid=result['_temp']['reportId'];await arena.handle(self.store,2,'logic.arenaHandler.report',{'id':rid})
  with self.assertRaises(ValueError):await arena.handle(self.store,7,'logic.arenaHandler.report',{'id':rid})
  self.now.return_value=datetime.datetime(2026,11,29,23,tzinfo=cooperative.ZONE).timestamp();await self.call(mode,'getInfo');reward=self.store.player(1)['extra']['mails'][-1]['dropList'];self.assertEqual(reward[0]['count'],1000);n=len(self.store.player(1)['extra']['mails']);await self.call(mode,'getInfo');self.assertEqual(len(self.store.player(1)['extra']['mails']),n)
 async def test_prestige_survivor_series_matches_per_round_original_engine(self):
  mode='prestigeBattle';a,b=await self.teams(mode);ta=cooperative.get(self.store,mode,a);tb=cooperative.get(self.store,mode,b)
  # Three real raw teams on each side: the winner retains engine HP exactly as
  # the recovered scene mutates its raw roles before building the next round.
  for pid in (2,3):raw=arena.raw_team(self.store.player(pid));raw['idx']=pid;ta['battleTeamMap'][str(pid)]=raw
  for pid in (5,6):raw=arena.raw_team(self.store.player(pid));raw['idx']=pid-3;tb['battleTeamMap'][str(pid)]=raw
  out=await cooperative.replay(mode,{'attack':ta,'defense':tb,'seed':123});client=await simulate_async({'mode':'cooperativeClient','cooperativeMode':mode,'attack':ta,'defense':tb,'seed':123});self.assertTrue(cooperative.equivalent(client['winPlayerIdMap'],out['winPlayerIdMap']));self.assertTrue(out['isWin']);self.assertEqual(len(out['winPlayerIdMap']),3);first=out['winPlayerIdMap']['1']['hpMap'];self.assertTrue(first);self.assertGreater(next(iter(out['winPlayerIdMap']['2']['hpMap'].values())),next(iter(first.values())))
 async def test_real_scene_generators_and_mutation_callback_authoritative_state(self):
  mode='prestigeBattle';await self.call(mode,'getInfo');a=await self.create(mode,1);root=Path(__file__).parent;patched=patch_cooperative_transport(Path('client/main.decoded.js').read_text());res=subprocess.run(['node',str(root/'fixtures/client_cooperative.cjs')],input=json.dumps({'source':patched,'profile':self.store.player(1),'state':self.store.player(1)['extra'][mode]}),text=True,capture_output=True);self.assertEqual(res.returncode,0,res.stderr);self.assertTrue(json.loads(res.stdout)['canonical'])
  res=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkHome':True,'checkCooperative':True}),text=True,capture_output=True);self.assertEqual(res.returncode,0,res.stderr);views=json.loads(res.stdout)['cooperativeViews'];self.assertTrue(views['prestige']['isOpen']);self.assertEqual(views['prestige']['remainingPracticeTimes'],4)
