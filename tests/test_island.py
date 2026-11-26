import copy,json,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server import island,arena
from server.profile import character
from server.storage import Store
from server.battle import simulate_async
from server.adventure import grant
from tools.client_patches import patch_island_transport
class IslandTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.clock=patch('time.time',return_value=1795570000);self.now=self.clock.start();self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set()
  for pid in (1,2,3):
   self.store.register('island'+str(pid),'password');p=self.store.create_player(pid,'Player'+str(pid));p.update(level=61,gem=10000);base=next(iter(p['team']['roles'].values()));p['team']['roles']={}
   for i in range(1,16):
    r=character(base['kindId'],i);r.update(level=61,power=100000 if pid==1 else 1000 if pid==3 else 100);r['attr'].update(hp=100000 if pid==1 else 1000,atk=10000 if pid==1 else 20,mdef=100 if pid==1 else 1);r['attr']['def']=100 if pid==1 else 1;r['initAttr']=dict(r['attr']);p['team']['roles'][str(i)]=r
   grant(p,[{'entityId':40,'count':1000,'extra':{}}]);self.store.save(p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup();self.clock.stop()
 async def call(self,action,args=None,pid=1):
  route='logic.islandHandler.'+action;out=await island.handle(self.store,pid,route,args or {});self.seen.add(route);return out
 async def start(self,resource=1,pid=2,indices=None,helping=False):
  await self.call('practice',{'resourceId':resource,'isNeedHelp':helping,'defenseTeamIndexs':indices or [1],'defenseShipIndexs':[]},pid);return self.store.db.execute('SELECT max(id)FROM island_sessions').fetchone()[0]
 async def fight(self,sid,guard=2):
  args={'id':sid,'defenderId':guard,'attackTeamIndexs':[1],'attackShipIndexs':[]};response=await self.call('choose',args);run=response['_temp'];out=await simulate_async({'mode':'island','team':arena.combat_raw(run['attackTeam']),'defender':arena.combat_raw(run['defenseTeam']),'seed':run['seed']});return {**args,'targetId':2,'seed':run['seed'],'isWin':out['isWin'],'bgImgId':island.constants('battle.ARENA_BACKGROUND_IMG_IDS')[0]}
 async def test_all_fifteen_routes_actual_engine_capture_help_claim_report_and_revive(self):
  sid=await self.start(helping=True);await self.call('match');await self.call('myIslandList');await self.call('defenseTeam',{'playerId':2,'id':sid});await self.call('setNeedHelp',{'resourceInfoId':sid,'isNeedHelp':True},2);await self.call('help',{'targetId':2,'resourceInfoId':sid,'defenseTeamIndexs':[1],'defenseShipIndexs':[]},3)
  self.assertEqual(self.store.player(3)['island']['remainingDefenseTimes'],2);self.now.return_value+=1801;args=await self.fight(sid,3);self.assertTrue(args['isWin']);out=await self.call('challenge',args);self.assertGreater(out['_temp']['entityCountMap']['40'],0)
  self.assertEqual(self.store.player(1)['island']['remainingDefenseTimes'],2);self.assertEqual(self.store.player(3)['island']['remainingDefenseTimes'],3);self.assertIn('1',self.store.player(3)['island']['teamIdxUnLockTimeMap']);await self.call('reviveRole',{'teamIndex':1},3)
  enemies=(await self.call('enemyList',pid=2))['_temp']['list'];self.assertEqual(enemies[0]['playerId'],1);self.assertEqual(enemies[0]['attackTimes'],1);logs=(await self.call('reportList'))['_temp']['reportList'];self.assertEqual(len(logs),1);report=(await self.call('report',{'id':out['_temp']['reportId']}))['_temp']['report'];self.assertEqual(report['seed'],args['seed'])
  await self.call('buyChallengeTimes');mine=self.store.db.execute('SELECT id FROM island_sessions WHERE owner=1 AND active=1').fetchone()[0];self.now.return_value+=1801;self.assertTrue((await self.call('earlySettlement',{'resourceInfoId':mine}))['_temp']['entityCountMap']);await self.call('settlement');self.assertEqual(self.seen,island.ROUTES)
 async def test_real_scene_generators_and_ordinary_profile_view_without_ladder_registration(self):
  sid=await self.start(pid=1);mine=(await self.call('myIslandList'))['_temp']['resourceInfoIdTeamMap'];logs=(await self.call('reportList'))['_temp']['reportList'];root=Path(__file__).parent;res=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkIsland':True,'checkHome':True,'islandTeams':mine,'islandLog':logs}),capture_output=True,text=True);self.assertEqual(res.returncode,0,res.stderr);views=json.loads(res.stdout)['islandViews'];self.assertEqual(views['mine']['islandCount'],1);self.assertTrue(views['team']['roleItems']);self.assertEqual(views['open']['battlefieldLevel'],61)
  out=await arena.handle(self.store,1,'logic.arenaHandler.defenseTeam',{'playerId':2,'isShow':True});self.assertEqual(out['_temp']['defenseTeam']['playerId'],2)
 async def test_expiry_restart_whole_half_hours_and_once_only_reward(self):
  sid=await self.start(-1,pid=1);self.now.return_value+=1799;self.assertEqual((await self.call('earlySettlement',{'resourceInfoId':sid}))['_temp']['entityCountMap'],{})
  sid=await self.start(-1,pid=1);self.now.return_value+=28801;match=await self.call('match');self.assertTrue(match['_temp']['info']['isNeedSettlement']);self.assertEqual(self.store.player(1)['island']['remainingDefenseTimes'],3);first=(await self.call('settlement'))['_temp']['entityCountMap'];self.assertEqual(first['40'],64);self.assertEqual(first['19'],160);self.store.db.close();self.store=Store(Path(self.tmp.name)/'db');self.assertEqual((await self.call('settlement'))['_temp']['entityCountMap'],{})
 async def test_quotas_unique_occupations_invalid_helpers_and_locked_roster(self):
  sid=await self.start(pid=1)
  for resource in (0,19,True):
   with self.assertRaises(ValueError):await self.start(resource,pid=1,indices=[2])
  with self.assertRaises(ValueError):await self.start(pid=2)
  with self.assertRaises(ValueError):await self.start(2,pid=1)
  await self.start(2,pid=1,indices=[2]);await self.start(3,pid=1,indices=[3])
  with self.assertRaises(ValueError):await self.start(4,pid=1,indices=[4])
  with self.assertRaises(ValueError):await self.call('setNeedHelp',{'resourceInfoId':sid,'isNeedHelp':True},2)
  with self.assertRaises(ValueError):await self.call('help',{'targetId':1,'resourceInfoId':sid,'defenseTeamIndexs':[1]},2)
 async def test_seed_forgery_replay_stale_guard_and_spent_attempt_not_refunded(self):
  sid=await self.start(helping=True);self.now.return_value+=1801;args=await self.fight(sid);before=self.store.player(1)['island']['remainingChallengeTimes'];again=await self.call('choose',{k:args[k]for k in ('id','defenderId','attackTeamIndexs','attackShipIndexs')});self.assertEqual(args['seed'],again['_temp']['seed']);self.assertEqual(before,self.store.player(1)['island']['remainingChallengeTimes'])
  for bad in ({**args,'seed':args['seed']+1},{**args,'isWin':not args['isWin']},{**args,'bgImgId':-1}):
   with self.assertRaises(ValueError):await self.call('challenge',bad)
  await self.call('help',{'targetId':2,'resourceInfoId':sid,'defenseTeamIndexs':[1]},3)
  with self.assertRaises(ValueError):await self.call('challenge',args)
  args=await self.fight(sid,3);await self.call('challenge',args)
  with self.assertRaises(ValueError):await self.call('challenge',args)
  rid=self.store.db.execute("SELECT id FROM battle_reports WHERE mode='island'").fetchone()[0]
  with self.assertRaises(ValueError):await self.call('report',{'id':rid},2)
 async def test_helper_withdrawal_keeps_owner_reserved_team_no_currency_creation(self):
  sid=await self.start(helping=True);await self.call('help',{'targetId':2,'resourceInfoId':sid,'defenseTeamIndexs':[1]},3);await self.call('earlySettlement',{'resourceInfoId':sid},3);row=island.find(self.store,sid);self.assertEqual(row['guard'],2);self.assertEqual(self.store.player(2)['island']['defenseTeamIndexs'],[1]);self.assertEqual(self.store.player(3)['island']['helpTeamIndexs'],[])
 async def test_weekly_source_rank_reward_once_and_zero_score_excluded(self):
  with self.store.transaction():island.score(self.store,self.store.player(1),'coin',50)
  self.now.return_value+=8*86400;await self.call('match');mails=self.store.player(1)['extra']['mails'];self.assertEqual(mails[-1]['dropList'][0]['count'],888);n=len(mails);await self.call('match');self.assertEqual(len(self.store.player(1)['extra']['mails']),n);self.assertEqual(self.store.player(1)['rankScores']['island_plunder_coin'],0);self.assertFalse(self.store.player(2)['extra']['mails'])
 async def test_source_patch_exact_anchors_and_seed(self):
  source=Path('client/main.decoded.js').read_text();patched=patch_island_transport(source);self.assertIn('d.islandBattleInstant(l.clone(i), l.clone(o), e._temp.seed)',patched);self.assertIn('s = l.ISLAND.FUNS.getAreaId(e.playerLevel)',patched)
  with self.assertRaises(ValueError):patch_island_transport(patched)
