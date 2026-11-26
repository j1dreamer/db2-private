import datetime,json,subprocess,tempfile,unittest,copy
from pathlib import Path
from unittest.mock import patch
from server import top_arena,arena3v3,arena
from server.battle import simulate_async
from server.profile import character
from server.storage import Store
from server.state import stack_count
from server.rules import constants

class TopArenaTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.clock=patch('time.time',return_value=datetime.datetime(2026,11,11,12,tzinfo=top_arena.ZONE).timestamp());self.clockmock=self.clock.start();self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set()
  for pid in (1,2):
   self.store.register('tester'+str(pid),'password');p=self.store.create_player(pid,'Player'+str(pid));p.update(level=80,gem=10000);p['team']['roles']={}
   for i,kind in enumerate((100106,100806,101106),1):
    r=character(kind,i);r.update(level=80,power=100000 if pid==1 else 100);r['attr'].update(hp=100000 if pid==1 else 1000,atk=10000 if pid==1 else 20);r['attr']['def']=100 if pid==1 else 1;r['attr']['mdef']=100 if pid==1 else 1;r['initAttr']=dict(r['attr']);p['team']['roles'][str(i)]=r
   self.store.save(p)
  self.roles={str(i):[str(i)]for i in range(1,4)};self.ships={}
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup();self.clock.stop()
 async def call(self,action,args=None,account=1):
  route='logic.topArena3v3Handler.'+action;result=await top_arena.handle(self.store,account,route,args or {});self.seen.add(route);return result
 async def ready(self,target,account=1):
  args={'defenderId':target,'attackTeamIndexsMap':self.roles,'attackShipIndexsMap':self.ships};data=(await self.call('choose',args,account))['_temp'];pairs=[{'key':key,'team':arena3v3.round_team(data['attackTeam'],key),'defender':arena3v3.round_team(data['defenseTeam'],key)}for key in ('1','2','3')];result=await simulate_async({'mode':'bestOfThree','pairs':pairs,'seed':data['seed']});return {**args,'seed':data['seed'],'isWin':result['isWin'],'winPlayerIdMap':{r['key']:account if r['isWin']else target for r in result['rounds']},'bgImgId':constants('battle.ARENA_BACKGROUND_IMG_IDS')[0]}
 async def score(self,value,account=1):
  p=self.store.player(account);p['topArena3v3']['score']=value;self.store.save(p)
 async def test_all_eleven_routes_points_seats_real_replay_and_self_hourly_mail(self):
  for account in (1,2):await self.call('info',account=account)
  await self.call('setDefenseTeamIndexsMap',{'defenseTeamIndexsMap':self.roles,'defenseShipIndexsMap':self.ships});self.assertEqual((await self.call('defenseTeam',{'playerId':2}))['_temp']['team']['playerId'],2)
  for _ in range(4):
   result=await self.call('match');self.assertIn(2,[x['playerId']for x in result['_temp']['list']]);args=await self.ready(2);self.assertTrue(args['isWin']);await self.call('challenge',args)
  p=self.store.player(1);self.assertEqual(p['topArena3v3']['score'],12);self.assertEqual(p['topArena3v3']['scoreType'],2)
  reward=await self.call('receiveFirstReachReward');self.assertEqual(reward['_temp']['entityCountMap']['97'],1200);self.assertEqual(reward['_temp']['privateMissingOriginalRewardIds'],[689,690]);self.assertEqual(reward['_temp']['entityCountMap']['119'],3)
  with self.assertRaises(ValueError):await self.call('receiveFirstReachReward')
  p=self.store.player(1);p['topArena3v3']['remainingMatchTimes']=0;self.store.save(p);money=stack_count(p,97);await self.call('buyMatchTimes');self.assertEqual(stack_count(self.store.player(1),97),money-50)
  await self.call('challengeTopNull',{'no':10});await self.score(11,2);await self.call('challengeTopNull',{'no':9},2)
  args=await self.ready(2)
  with self.assertRaises(ValueError):await self.call('challengeTop',{**args,'no':9})
  self.clockmock.return_value+=3601;args=await self.ready(2);result=await self.call('challengeTop',{**args,'no':9});p=self.store.player(1);self.assertEqual(p['topArena3v3']['topInfoMap']['9']['playerId'],1);self.assertEqual(p['topArena3v3']['topInfoMap']['10']['playerId'],0);self.assertEqual(p['topArena3v3']['remainingTopChallengeTimes'],1)
  own_hour=[m for m in p['extra']['mails']if m['title']=='Top league hourly rewards'];self.assertEqual(len(own_hour),1);self.assertEqual(own_hour[0]['dropList'][0]['count'],8)
  logs=(await self.call('reportList'))['_temp']['reportList'];self.assertEqual(len(logs),5);report=(await arena.handle(self.store,1,'logic.arenaHandler.report',{'id':result['_temp']['reportId']}))['_temp']['report'];self.assertEqual(report['up'],0)
  with self.assertRaises(ValueError):await self.call('challengeTop',{**args,'no':9})
  self.assertEqual(self.seen,top_arena.ROUTES)
  fixture=Path(__file__).parent/'fixtures/client_profile.cjs';out=subprocess.run(['node',str(fixture)],input=json.dumps({'profile':p,'checkTeam':True,'checkHome':True,'tournamentReport':report}),text=True,capture_output=True);self.assertEqual(out.returncode,0,out.stderr);self.assertEqual(len(json.loads(out.stdout)['tournamentReplay']['logItems']),2)
 async def test_forgery_timeout_and_once_awards(self):
  await self.call('info');await self.call('match');args=await self.ready(-700001);before=self.store.player(1)
  for bad in ({**args,'seed':args['seed']+1},{**args,'winPlayerIdMap':{}},{**args,'attackTeamIndexsMap':{'1':['1'],'2':['1'],'3':['3']}}):
   with self.assertRaises(ValueError):await self.call('challenge',bad)
   p=self.store.player(1);self.assertEqual(p['topArena3v3']['remainingMatchTimes'],before['topArena3v3']['remainingMatchTimes']);self.assertEqual(p['bag'],before['bag'])
  await self.call('challenge',args);count=self.store.db.execute("SELECT count(*)FROM battle_reports WHERE mode='topArena3v3'").fetchone()[0]
  with self.assertRaises(ValueError):await self.call('challenge',args)
  self.assertEqual(self.store.db.execute("SELECT count(*)FROM battle_reports WHERE mode='topArena3v3'").fetchone()[0],count)
  await self.call('match');expired=await self.ready(-700002);self.clockmock.return_value+=901
  with self.assertRaises(ValueError):await self.call('challenge',expired)
 async def test_source_prices_daily_caps_and_tier_permissions(self):
  await self.call('info')
  for no in (1,9,10):
   with self.assertRaises(ValueError):await self.call('challengeTopNull',{'no':no})
  p=self.store.player(1)
  from server.inventory import insert
  insert(p,97,1000);self.store.save(p)
  for cost in (50,60,80,100,100):
   p=self.store.player(1);p['topArena3v3']['remainingMatchTimes']=0;self.store.save(p);money=stack_count(p,97);await self.call('buyMatchTimes');self.assertEqual(stack_count(self.store.player(1),97),money-cost)
  p=self.store.player(1);p['topArena3v3']['remainingMatchTimes']=0;self.store.save(p)
  with self.assertRaises(ValueError):await self.call('buyMatchTimes')
  self.clockmock.return_value+=86400;self.assertEqual(self.store.player(1)['topArena3v3']['remainingMatchTimes'],7);self.assertEqual(self.store.player(1)['topArena3v3']['buyMatchTimesTimes'],0)
 async def test_hourly_season_settlement_restart_reset_and_lifetime_first_reward(self):
  await self.call('info');await self.score(11);await self.call('receiveFirstReachReward');await self.call('challengeTopNull',{'no':9});_,_,end,nxt=top_arena.season();self.clockmock.return_value+=7201;await self.call('info');mails=self.store.player(1)['extra']['mails'];self.assertEqual(mails[-1]['dropList'][0]['count'],20)
  self.store.db.close();self.store=Store(Path(self.tmp.name)/'db');await self.call('info');self.assertEqual(len(self.store.player(1)['extra']['mails']),len(mails))
  self.clockmock.return_value=end+1;await self.call('info');p=self.store.player(1);awards=[m for m in p['extra']['mails']if m['title']=='Top league season reward'];self.assertEqual(len(awards),1);self.assertEqual(awards[0]['dropList'][0]['count'],300)
  await self.call('info');self.assertEqual(len([m for m in self.store.player(1)['extra']['mails']if m['title']=='Top league season reward']),1)
  with self.assertRaises(ValueError):await self.call('match')
  self.clockmock.return_value=nxt+1;p=self.store.player(1);self.assertEqual(p['topArena3v3']['score'],0);self.assertEqual(p['privateTopArena']['receivedTiers'],[1,2]);await self.call('info');self.assertTrue(all(x['playerId']==0 for x in self.store.player(1)['topArena3v3']['topInfoMap'].values()))
 async def test_match_fallback_is_private_sparring_and_unknown_owned_defenders_rejected(self):
  await self.call('info');matches=(await self.call('match'))['_temp']['list'];self.assertEqual({m['playerId']for m in matches},{-700001,-700002,-700003})
  with self.assertRaises(ValueError):await self.call('defenseTeam',{'playerId':999})
  with self.assertRaises(ValueError):await self.call('choose',{'defenderId':1,'attackTeamIndexsMap':self.roles,'attackShipIndexsMap':self.ships})
  p=self.store.player(1);p['level']=1;self.store.save(p)
  with self.assertRaises(ValueError):await self.call('info')
