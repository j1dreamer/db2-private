import copy,datetime,json,tempfile,subprocess,unittest
from pathlib import Path
from unittest.mock import patch
from server import tournaments,arena
from server.storage import Store
from server.profile import character,table

class TournamentTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set()
  for ident in (1,2,3):
   self.store.register('tester'+str(ident),'password');p=self.store.create_player(ident,'Player'+str(ident));p.update(level=80,gem=10000);p['team']['roles']={}
   # Three theme-1 classes plus two extra distinct classes for five-team Worship.
   for idx,class_id in enumerate((22,39,41,1,8),1):
    row=min((r for r in table('role')if r['classId']==class_id),key=lambda r:r['kindId']);r=character(row['kindId'],idx);r.update(level=80,power=100000 if ident==1 else 100);r['attr'].update(hp=100000 if ident==1 else 1000,atk=10000 if ident==1 else 20,def_=0);r['attr']['def']=100 if ident==1 else 1;r['attr']['mdef']=100 if ident==1 else 1;r['initAttr']=dict(r['attr']);p['team']['roles'][str(idx)]=r
   self.store.save(p)
 async def asyncTearDown(self):await tournaments.close(self.store);self.store.db.close();self.tmp.cleanup()
 def when(self,day,hour=12):return datetime.datetime(2026,12,day,hour,tzinfo=tournaments.ZONE).timestamp()
 def rosters(self,mode):
  return ({str(i):[str(i)]for i in range(1,4 if mode=='doubleBattle'else 6)},{})
 async def call(self,mode,action,args=None,account=1):
  args=dict(args or {})
  if mode=='doubleBattle'and action!='openInfo':args.setdefault('themeNo',1)
  route='logic.'+mode+'Handler.'+action;result=await tournaments.handle(self.store,account,route,args);self.seen.add(route);return result
 async def test_all_eighteen_routes_weekly_rounds_real_engine_reports_and_once_mail(self):
  for mode in ('worshipBattle','doubleBattle'):
   with patch('time.time',return_value=self.when(6)):
    for account in (1,2):
     roles,ships=self.rosters(mode);r=await self.call(mode,'apply',{'teamIndexsMap':roles,'shipIndexsMap':ships},account)
     self.assertEqual(r['_temp']['entityCountMap'],{str(109 if mode=='doubleBattle'else 116):50})
    await self.call(mode,'openInfo');await self.call(mode,'battleInfo');self.assertEqual((await self.call(mode,'getMyTeam'))['_temp']['team']['playerId'],1);self.assertEqual((await self.call(mode,'getTeam',{'targetId':2}))['_temp']['team']['playerId'],2)
   level=tournaments.level_type(mode,80)
   with patch('time.time',return_value=self.when(10,21)):
    info=(await self.call(mode,'battleInfo'))['_temp']['battleInfo'];self.assertEqual(len(info['be8GroupInfoMap'][level]),4)
    await self.call(mode,'bet',{'type':level,'targetId':1});await self.call(mode,'bet',{'type':level,'targetId':1},2)
   with patch('time.time',return_value=self.when(12,21)):
    await self.call(mode,'openInfo');room=tournaments.load(self.store,mode,1 if mode=='doubleBattle'else 0);self.assertEqual(room['champions'][level],1)
    team=(await self.call(mode,'getChampionTeam',{'levelType':level}))['_temp']['team'];self.assertEqual(team['playerId'],1)
    await self.call(mode,'worshipStatue',{'levelType':level});await self.call(mode,'worshipStatue',{'levelType':level},2)
    rank=(await self.call(mode,'worshipRank'))['_temp'];self.assertEqual(rank['list'][0]['playerId'],1);self.assertEqual(rank['myValue'],2)
    reports=self.store.db.execute('SELECT id,data FROM battle_reports WHERE mode=?',(mode,)).fetchall();self.assertEqual(len(reports),1);report=json.loads(reports[0]['data']);self.assertEqual(set(report['winPlayerIdMap'].values()),{1});self.assertEqual(len(report['winPlayerIdMap']),2 if mode=='doubleBattle'else 3)
    # Tournament replays are public, while ordinary arena reports stay private.
    viewed=await arena.handle(self.store,3,'logic.arenaHandler.report',{'id':reports[0]['id']});self.assertTrue(viewed['_temp']['report']['publicTournament'])
    fixture=Path(__file__).parent/'fixtures/client_profile.cjs';out=subprocess.run(['node',str(fixture)],input=json.dumps({'profile':self.store.player(1),'checkTeam':True,'checkHome':True,'tournamentReport':report}),text=True,capture_output=True);self.assertEqual(out.returncode,0,out.stderr);self.assertEqual(len(json.loads(out.stdout)['tournamentReplay']['logItems']),len(report['winPlayerIdMap']))
    p=self.store.player(1);count=len(p['extra']['mails']);await self.call(mode,'battleInfo');self.assertEqual(len(self.store.player(1)['extra']['mails']),count)
    titles=[m for m in p['extra']['mails']if m['body'].startswith('CHAMPION')];self.assertEqual(len(titles),1 if mode=='worshipBattle'else 2)
    with self.assertRaises(ValueError):await self.call(mode,'worshipStatue',{'levelType':level})
  self.assertEqual(self.seen,tournaments.ROUTES)
 async def test_team_reuse_theme_ownership_signup_deadline_and_duplicate_apply(self):
  with patch('time.time',return_value=self.when(6)):
   roles,ships=self.rosters('doubleBattle')
   for bad in ({'1':['1'],'2':['1'],'3':['3']},{'1':['1'],'2':['2'],'3':['999']},{'1':['1'],'2':['2'],'3':['4']}):
    with self.assertRaises(ValueError):await self.call('doubleBattle','apply',{'teamIndexsMap':bad,'shipIndexsMap':{}})
   await self.call('doubleBattle','apply',{'teamIndexsMap':roles,'shipIndexsMap':ships});before=self.store.player(1)['bag'];await self.call('doubleBattle','apply',{'teamIndexsMap':roles,'shipIndexsMap':ships});self.assertEqual(self.store.player(1)['bag'],before)
   with self.assertRaises(ValueError):await self.call('doubleBattle','getChampionTeam',{'levelType':'fake'})
   with self.assertRaises(ValueError):await self.call('doubleBattle','getTeam',{'targetId':3})
  with patch('time.time',return_value=self.when(9,12)):
   roles,ships=self.rosters('worshipBattle')
   with self.assertRaises(ValueError):await self.call('worshipBattle','apply',{'teamIndexsMap':roles,'shipIndexsMap':ships})
 async def test_delayed_settlement_survives_reopen_and_worship_marks_reset_by_server_day(self):
  with patch('time.time',return_value=self.when(6)):
   roles,ships=self.rosters('worshipBattle');await self.call('worshipBattle','apply',{'teamIndexsMap':roles,'shipIndexsMap':ships})
  with patch('time.time',return_value=self.when(12,21)):
   await self.call('worshipBattle','openInfo');level=tournaments.level_type('worshipBattle',80);await self.call('worshipBattle','worshipStatue',{'levelType':level});p=self.store.player(1);self.assertTrue(p['worshipStatueExtMap'][level]);count=len(p['extra']['mails'])
   self.store.db.close();self.store=Store(Path(self.tmp.name)/'db');await self.call('worshipBattle','openInfo');self.assertEqual(len(self.store.player(1)['extra']['mails']),count)
  with patch('time.time',return_value=self.when(13,12)):
   await self.call('worshipBattle','worshipStatue',{'levelType':level});self.assertEqual(len(self.store.player(1)['extra']['mails']),count);self.assertTrue(self.store.player(1)['worshipStatueExtMap'][level])
  with patch('time.time',return_value=self.when(19,21)):
   await self.call('worshipBattle','openInfo');await self.call('worshipBattle','worshipStatue',{'levelType':level});self.assertEqual((await self.call('worshipBattle','getChampionTeam',{'levelType':level}))['_temp']['team']['playerId'],1)
 async def test_real_tournament_and_team_generators_accept_profile(self):
  with patch('time.time',return_value=self.when(6)):
   for mode in ('worshipBattle','doubleBattle'):
    roles,ships=self.rosters(mode);await self.call(mode,'apply',{'teamIndexsMap':roles,'shipIndexsMap':ships})
   root=Path(__file__).parent;p=self.store.player(1);result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':p,'checkTeam':True,'checkHome':True,'checkTournaments':True}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);views=json.loads(result.stdout)['tournamentViews'];self.assertEqual(len(views['themes']['themeItems']),5);self.assertTrue(views['double']['isApply']);self.assertTrue(views['worship']['isApply'])
 async def test_background_settlement_keeps_rpc_bounded_and_commits_once_after_resume(self):
  import asyncio
  with patch('time.time',return_value=self.when(6)):
   roles,ships=self.rosters('worshipBattle')
   for account in (1,2):await self.call('worshipBattle','apply',{'teamIndexsMap':roles,'shipIndexsMap':ships},account)
  original=tournaments.play;entered=asyncio.Event();release=asyncio.Event()
  async def delayed(*args):entered.set();await release.wait();return await original(*args)
  with patch('time.time',return_value=self.when(12,21)),patch.object(tournaments,'SETTLE_WAIT',.01),patch.object(tournaments,'play',side_effect=delayed):
   result=await self.call('worshipBattle','battleInfo');self.assertTrue(result['_temp']['settlementPending']);await entered.wait()
   self.assertEqual(self.store.db.execute("SELECT count(*)FROM battle_reports WHERE mode='worshipBattle'").fetchone()[0],0)
   release.set();await asyncio.gather(*tournaments._pending[self.store].values())
   room=tournaments.load(self.store,'worshipBattle',0);self.assertTrue(room['finished']);count=len(self.store.player(1)['extra']['mails'])
   await tournaments.settle(self.store,'worshipBattle',0);self.assertEqual(len(self.store.player(1)['extra']['mails']),count)
