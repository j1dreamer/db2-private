import copy,datetime,json,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server import resources,arena,bosses,tournaments,arena3v3
from server.battle import simulate_async
from server.profile import character,table
from server.storage import Store
from server.inventory import insert
from tools.client_patches import patch_resource_transport

class ResourceTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.clock=patch('time.time',return_value=datetime.datetime(2026,11,25,12,tzinfo=resources.ZONE).timestamp());self.now=self.clock.start();self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set()
  for pid in (1,2,3):
   self.store.register('tester'+str(pid),'password');p=self.store.create_player(pid,'Player'+str(pid));p.update(level=80,gem=10000);p['team']['roles']={}
   for i in range(1,16):
    row=min((r for r in table('role')if r['classId']==i),key=lambda r:r['kindId']);r=character(row['kindId'],i);r.update(level=80,power=100000 if pid==1 else 100);r['attr'].update(hp=100000 if pid==1 else 1000,atk=10000 if pid==1 else 20);r['attr']['def']=100 if pid==1 else 1;r['attr']['mdef']=100 if pid==1 else 1;r['initAttr']=dict(r['attr']);p['team']['roles'][str(i)]=r
   self.store.save(p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup();self.clock.stop()
 async def call(self,action,args=None,account=1):
  route='logic.allServerBattleHandler.'+action;result=await resources.handle(self.store,account,route,args or {});self.seen.add(route);return result
 async def register(self):
  for account in (1,2,3):await self.call('apply',account=account)
  self.now.return_value=datetime.datetime(2026,11,25,21,10,tzinfo=resources.ZONE).timestamp()
  for account in (1,2):await self.call('enter',{'teamIndexs':['1'],'shipIndexs':[]},account)
  self.now.return_value+=11
 async def meet(self):
  await self.register();await self.call('move',{'toTowerNo':4})
  for tower in (7,6,5):await self.call('move',{'toTowerNo':tower},2);self.now.return_value+=11
 async def battle(self):
  data=(await self.call('beginBattle',{'toTowerNo':5}))['_temp']['battleInfo'];room=resources.load(self.store,'2026-11-25',resources.level_type(80));run=json.loads(self.store.db.execute('SELECT data FROM pvp_runs WHERE player=1 AND mode=?',(resources.MODE,)).fetchone()[0]);out=await simulate_async({'mode':'pvp','team':run['team'],'defender':run['defender'],'seed':data['seed']});return {'seed':data['seed'],'bgImgId':resources.constants('battle.GUILD_BATTLE_IMG_IDS')[0],'isWin':out['isWin'],'hpMap':{str(r['idx']):r['hp']/1.45 for r in out['attacker']['roles']},'targetHpMap':{str(r['idx']):r['hp']/1.45 for r in out['defender']['roles']}}
 async def test_all_sixteen_routes_capture_real_battle_claim_end_rank_and_worship(self):
  await self.call('openInfo');rank=await self.call('applyRank');self.assertEqual(rank['_temp']['myTeamId'],1);await self.meet();team=(await self.call('getTeam'))['_temp']['battleTeam'];self.assertEqual(team['roles'][0]['attr']['hp'],100000)
  args=await self.battle();self.assertTrue(args['isWin']);result=await self.call('endBattle',args);self.assertTrue(result['_temp']['entityCountMap']);rid=result['_temp']['reportId'];self.assertEqual((await self.call('getReport',{'reportId':rid}))['_temp']['report']['seed'],args['seed'])
  push=json.loads(self.store.db.execute("SELECT data FROM notifications WHERE account=1 AND event='onAllServerBattle'ORDER BY id DESC LIMIT 1").fetchone()[0]);root=Path(__file__).parent;client=subprocess.run(['node',str(root/'fixtures/client_resource_push.cjs')],input=json.dumps({'source':(root/'fixtures/client_resource_push.js').read_text(),'payload':push}),text=True,capture_output=True);self.assertEqual(client.returncode,0,client.stderr)
  p=self.store.player(1);self.assertEqual(p['extra']['allServerBattle']['towerNo'],5);room=resources.load(self.store,'2026-11-25',resources.level_type(80));self.assertEqual(room['entries']['1']['wins'],1);self.assertEqual(room['entries']['2']['hp']['1'],0);self.assertEqual(room['entries']['2']['tower'],2)
  await self.call('recover',account=2);self.assertEqual(self.store.player(2)['gem'],9950)
  self.now.return_value+=41;award=await self.call('receiveAward');self.assertGreaterEqual(award['_temp']['entityCountMap']['101'],12000)
  with self.assertRaises(ValueError):await self.call('receiveAward')
  await self.call('exit');self.assertEqual(self.store.player(1)['extra']['allServerBattle']['towerNo'],0)
  self.now.return_value=datetime.datetime(2026,11,25,21,31,tzinfo=resources.ZONE).timestamp();ranking=(await self.call('winTimesRank'))['_temp'];self.assertEqual(ranking['myRank'],1);self.assertEqual(ranking['myValue'],1);end=await self.call('endTopRankInfo');self.assertTrue(end['_temp']['teamRanks'][resources.level_type(80)])
  await self.call('worshipStatue',{'levelType':resources.level_type(80)});worship=await self.call('worshipRank');self.assertEqual(worship['_temp']['list'][0]['playerId'],1)
  self.assertTrue(any(m['body'].startswith('NO_ENTER')for m in self.store.player(3)['extra']['mails']));self.assertEqual(self.seen,resources.ROUTES)
 async def test_schedule_graph_cooldowns_and_exit_reentry_cannot_heal(self):
  with self.assertRaises(ValueError):await self.call('enter',{'teamIndexs':[1]})
  await self.register()
  for no in (1,22,0,True):
   with self.assertRaises(ValueError):await self.call('move',{'toTowerNo':no})
  await self.call('move',{'toTowerNo':4})
  with self.assertRaises(ValueError):await self.call('move',{'toTowerNo':5})
  room=resources.load(self.store,'2026-11-25',resources.level_type(80));room['entries']['1']['hp']['1']=12;resources.save_room(self.store,room);await self.call('exit');await self.call('enter',{'teamIndexs':[1],'shipIndexs':[]});room=resources.load(self.store,'2026-11-25',resources.level_type(80));self.assertEqual(room['entries']['1']['hp']['1'],12)
  with self.assertRaises(ValueError):await self.call('enter',{'teamIndexs':[2],'shipIndexs':[]})
  await self.call('recover');self.assertEqual(self.store.player(1)['gem'],9950)
  with self.assertRaises(ValueError):await self.call('recover')
  self.now.return_value=datetime.datetime(2026,11,25,21,31,tzinfo=resources.ZONE).timestamp();await self.call('exit');self.assertEqual(self.store.player(1)['extra']['allServerBattle']['towerNo'],0)
 async def test_forged_hp_seed_replay_and_moved_defender_do_not_award(self):
  await self.meet();args=await self.battle();before=self.store.player(1);forged={**args,'hpMap':{'1':999999}}
  for bad in (forged,{**args,'seed':args['seed']+1},{**args,'isWin':False}):
   with self.assertRaises(ValueError):await self.call('endBattle',bad)
   self.assertEqual(self.store.player(1)['bag'],before['bag'])
  await self.call('move',{'toTowerNo':6},2)
  with self.assertRaises(ValueError):await self.call('endBattle',args)
  self.now.return_value+=11;await self.call('move',{'toTowerNo':5},2);self.now.return_value+=11;args=await self.battle();await self.call('endBattle',args)
  with self.assertRaises(ValueError):await self.call('endBattle',args)
  rid=self.store.db.execute("SELECT id FROM battle_reports WHERE mode='allServerBattle'").fetchone()[0]
  with self.assertRaises(ValueError):await self.call('getReport',{'reportId':rid},3)
 async def test_original_hp_map_builder_keeps_ship_bonus_once_and_recovery_limits(self):
  p=self.store.player(1);ship=insert(p,902,1);self.store.save(p);idx=next(k for k,v in p['bag']['items'].items()if v['kindId']==902)
  await self.call('apply');self.now.return_value=datetime.datetime(2026,11,25,21,10,tzinfo=resources.ZONE).timestamp();await self.call('enter',{'teamIndexs':['1'],'shipIndexs':[idx]});room=resources.load(self.store,'2026-11-25',resources.level_type(80));entry=room['entries']['1'];self.assertEqual(entry['maxHp']['1'],100040);entry['hp']['1']=33;resources.save_room(self.store,room)
  ours=resources.engine_team(entry);client=await simulate_async({'mode':'clientTeam','player':p,'indices':['1'],'shipIndices':[idx],'hpMap':entry['hp']});self.assertEqual(client['roles'][0]['hp'],ours['roles'][0]['hp']);self.assertEqual(client['roles'][0]['maxHp'],ours['roles'][0]['maxHp']);self.assertEqual(client['roles'][0]['atk'],ours['roles'][0]['atk']);self.assertEqual(ours['roles'][0]['maxHp'],100040)
  shown=(await self.call('getTeam'))['_temp']['battleTeam'];self.assertEqual(shown['roles'][0]['attr']['hp'],33);self.assertEqual(shown['roles'][0]['attr']['maxHp'],100040)
 async def test_settlement_restart_registration_bracket_and_once_claims(self):
  await self.call('apply');p=self.store.player(1);p['level']=95;self.store.save(p);await self.call('apply');self.assertEqual(self.store.db.execute('SELECT count(*)FROM resource_registrations WHERE player=1').fetchone()[0],1)
  self.now.return_value=datetime.datetime(2026,11,25,21,10,tzinfo=resources.ZONE).timestamp();await self.call('enter',{'teamIndexs':[1]});self.assertEqual(self.store.db.execute('SELECT level FROM resource_registrations WHERE player=1').fetchone()[0],resources.level_type(80))
  self.now.return_value+=1201;await self.call('openInfo');count=len(self.store.player(1)['extra']['mails']);self.store.db.close();self.store=Store(Path(self.tmp.name)/'db');await self.call('openInfo');self.assertEqual(len(self.store.player(1)['extra']['mails']),count)
  await self.call('worshipStatue',{'levelType':resources.level_type(80)})
  with self.assertRaises(ValueError):await self.call('worshipStatue',{'levelType':resources.level_type(80)})
 async def test_actual_cross_server_entry_callbacks_and_resource_generators(self):
  responses={'resources':await self.call('openInfo'),'world':await bosses.handle(self.store,1,'logic.worldBossHandler.openInfo',{}),'worship':await tournaments.handle(self.store,1,'logic.worshipBattleHandler.openInfo',{}),'double':await tournaments.handle(self.store,1,'logic.doubleBattleHandler.openInfo',{}),'trio':await arena3v3.handle(self.store,1,'logic.arena3v3Handler.info',{})}
  root=Path(__file__).parent;result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkTeam':True,'checkHome':True,'checkResources':True,'entryResponses':responses}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);views=json.loads(result.stdout);self.assertEqual(views['entryViews']['scenes'],['world','resources','worship','trio','double']);self.assertEqual(len(views['entryViews']['doubleInfos']),5);self.assertIsInstance(views['entryViews']['trioRank'],int);self.assertIn('isOpen',views['entryViews']['worldOpen'])
 async def test_original_resource_transport_sends_seed_carry_and_replays_same_maps(self):
  root=Path(__file__).parent;source=patch_resource_transport((root/'fixtures/client_allServerBattleScene.js').read_text());result=subprocess.run(['node',str(root/'fixtures/client_resource_transport.cjs')],input=json.dumps({'source':source}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);self.assertTrue(json.loads(result.stdout)['seedVerified'])
