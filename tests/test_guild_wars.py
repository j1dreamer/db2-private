import copy,datetime,json,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.profile import character,table
from server import guild,guild_wars
from server.battle import simulate_async
from server.arena import combat_raw
from tools.client_patches import patch_guild_war_transport

class GuildWarTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.clock=patch('time.time',return_value=self.when(25,12));self.now=self.clock.start();self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set()
  for pid in range(1,11):
   self.store.register('tester'+str(pid),'password');p=self.store.create_player(pid,'Player'+str(pid));p.update(level=80,gem=10000);p['team']['roles']={}
   for i in range(1,6):
    row=min((r for r in table('role')if r['classId']==i),key=lambda r:r['kindId']);r=character(row['kindId'],i);r.update(level=80,power=100000 if pid<=5 else 100);r['attr'].update(hp=100000 if pid<=5 else 1000,atk=10000 if pid<=5 else 20);r['attr']['def']=100 if pid<=5 else 1;r['attr']['mdef']=100 if pid<=5 else 1;r['initAttr']=dict(r['attr']);p['team']['roles'][str(i)]=r
   self.store.save(p)
  self.gids=[]
  for leader in (1,6):
   guild.handle(self.store,leader,'logic.guildHandler.create',{'name':'Guild'+str(leader),'badgeId':1});gid=self.store.player(leader)['guildId'];self.gids.append(gid)
   with self.store.transaction():
    g=guild.record(self.store,gid)
    for pid in range(leader+1,leader+5):guild.join(self.store,g,self.store.player(pid))
    self.store.db.execute('UPDATE guilds SET data=?WHERE id=?',(json.dumps(g),gid))
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup();self.clock.stop()
 def when(self,day,hour):return datetime.datetime(2026,11,day,hour,tzinfo=guild_wars.ZONE).timestamp()
 async def call(self,mode,action,args=None,account=1):
  route='logic.'+mode+'Handler.'+action;result=await guild_wars.handle(self.store,account,route,args or {});self.seen.add(route);return result
 async def ready(self,mode,day=25):
  self.now.return_value=self.when(day,17);await self.call(mode,'openInfo');await self.call(mode,'setDefenseTeamInfo',{'teamIndexs':[1,2,3,4,5],'shipIndexs':[]});self.now.return_value=self.when(day,19);await self.call(mode,'enter');await self.call(mode,'enter',account=6)
 async def begin(self,mode,target=6,roles=None,account=1):
  args={'defenderId':target,'attackTeamIndexs':roles or [1,2,3,4,5],'attackShipIndexs':[]};result=await self.call(mode,'choose',args,account);temp=result['_temp'];out=await simulate_async({'mode':'pvp','team':combat_raw(temp['attackTeam']),'defender':combat_raw(temp['defenseTeam']),'seed':temp['seed']});return {'defenderId':target,'diedNum':out['diedNum']},result,out
 async def test_all_sixteen_routes_five_bars_real_survivors_and_once_rewards(self):
  for mode,day in (('newGuildBattle',25),('activityGuildBattle',29)):
   await self.ready(mode,day);args,chosen,out=await self.begin(mode,roles=[1]);self.assertTrue(out['isWin']);self.assertEqual(args['diedNum'],4);first=await self.call(mode,'challenge',args);self.assertEqual(first['_temp']['star'],1);self.assertEqual(first['_temp']['attackTimes'],3)
   args,chosen,out=await self.begin(mode);self.assertEqual(args['diedNum'],0);second=await self.call(mode,'challenge',args);self.assertEqual(second['_temp']['star'],5);self.assertEqual(second['_temp']['attackTimes'],2)
   with self.assertRaises(ValueError):await self.call(mode,'choose',{'defenderId':6,'attackTeamIndexs':[1],'attackShipIndexs':[]})
   result=(await self.call(mode,'result'))['_temp']['result'];self.assertEqual(result['infoMap'][str(self.gids[1])]['score'],40);self.assertEqual(result['infoMap'][str(self.gids[0])]['score'],90)
   await self.call(mode,'exit');self.now.return_value=self.when(day,22)+1;await self.call(mode,'openInfo');rank_action='winTimesRank'if mode=='newGuildBattle'else 'wintTimesRank';rank=(await self.call(mode,rank_action))['_temp']['list'];self.assertEqual(rank[0]['guildId'],self.gids[0]);self.assertEqual(rank[0]['winTimes'],1)
   last=(await self.call(mode,'result'))['_temp']['result'];self.assertEqual(last['attackTimes'],2);self.assertEqual(last['maxAttackTimes'],4);count=len(self.store.player(1)['extra']['mails']);await self.call(mode,'openInfo');self.assertEqual(len(self.store.player(1)['extra']['mails']),count)
  self.assertEqual(self.seen,guild_wars.ROUTES)
 async def test_forged_casualties_idempotent_choose_and_target_ownership(self):
  await self.ready('newGuildBattle');args,chosen,out=await self.begin('newGuildBattle');same=await self.call('newGuildBattle','choose',{'defenderId':6,'attackTeamIndexs':[1,2,3,4,5],'attackShipIndexs':[]});self.assertEqual(same['_temp']['seed'],chosen['_temp']['seed']);self.assertEqual(same['_temp']['attackTimes'],3);before=self.store.player(1)
  for bad in ({**args,'diedNum':5},{**args,'diedNum':True},{**args,'defenderId':7}):
   with self.assertRaises(ValueError):await self.call('newGuildBattle','challenge',bad)
   self.assertEqual(self.store.player(1)['bag'],before['bag'])
  for target in (1,2,999):
   with self.assertRaises(ValueError):await self.call('newGuildBattle','choose',{'defenderId':target,'attackTeamIndexs':[1],'attackShipIndexs':[]})
  await self.call('newGuildBattle','challenge',args)
  with self.assertRaises(ValueError):await self.call('newGuildBattle','challenge',args)
 async def test_loss_zero_damage_attack_limits_and_expired_run(self):
  await self.ready('newGuildBattle');args,chosen,out=await self.begin('newGuildBattle',target=1,account=7);self.assertFalse(out['isWin']);self.assertEqual(out['diedNum'],5);result=await self.call('newGuildBattle','challenge',args,7);self.assertEqual(result['_temp']['star'],0)
  args,_,_=await self.begin('newGuildBattle',target=2,account=7);self.now.return_value+=901
  with self.assertRaises(ValueError):await self.call('newGuildBattle','challenge',args,7)
  with self.assertRaises(ValueError):await self.call('newGuildBattle','choose',{'defenderId':3,'attackTeamIndexs':[1],'attackShipIndexs':[]},7)
 async def test_bye_is_real_no_fake_opponent_and_restart_does_not_duplicate_mail(self):
  # One eligible guild remains: source UI explicitly promises a bye win reward.
  with self.store.transaction():
   self.store.db.execute('DELETE FROM guild_members WHERE guild=?',(self.gids[1],));self.store.db.execute('DELETE FROM guilds WHERE id=?',(self.gids[1],))
  self.now.return_value=self.when(25,17);info=await self.call('newGuildBattle','openInfo');self.assertFalse(info['_temp']['openInfo']['isHaveTarget']);self.now.return_value=self.when(25,19)
  with self.assertRaises(ValueError):await self.call('newGuildBattle','enter')
  self.now.return_value=self.when(25,22)+1;await self.call('newGuildBattle','openInfo');p=self.store.player(1);self.assertEqual(len(p['extra']['mails']),1);self.assertTrue(p['extra']['newGuildBattle']['openInfo']['preBattleResult']['lose']['isBye'])
  self.store.db.close();self.store=Store(Path(self.tmp.name)/'db');await self.call('newGuildBattle','openInfo');self.assertEqual(len(self.store.player(1)['extra']['mails']),1)
 async def test_member_exit_after_leaving_guild_is_safe_and_ready_defense_locks(self):
  await self.ready('newGuildBattle')
  with self.assertRaises(ValueError):await self.call('newGuildBattle','setDefenseTeamInfo',{'teamIndexs':[1],'shipIndexs':[]})
  await self.call('newGuildBattle','enter',account=2);self.store.db.execute('DELETE FROM guild_members WHERE player=2');result=await self.call('newGuildBattle','exit',account=2);self.assertTrue(result['_temp']['withdrawn']);self.assertFalse(self.store.player(2)['guildId'])
  with self.assertRaises(ValueError):await self.call('newGuildBattle','choose',{'defenderId':6,'attackTeamIndexs':[1],'attackShipIndexs':[]},2)
 async def test_source_scene_result_and_watcher_push_models_accept_snapshots(self):
  await self.ready('newGuildBattle');args,_,_=await self.begin('newGuildBattle');await self.call('newGuildBattle','challenge',args);p=self.store.player(1);result=(await self.call('newGuildBattle','result'))['_temp']['result'];root=Path(__file__).parent;output=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':p,'checkTeam':True,'checkHome':True,'checkGuildWar':True,'guildWarResult':result}),text=True,capture_output=True);self.assertEqual(output.returncode,0,output.stderr);views=json.loads(output.stdout)['guildWarViews'];self.assertEqual(views['battle']['attackTimes'],3);self.assertEqual(len(views['result']['guildInfos']),2)
  rows=self.store.db.execute("SELECT account,data FROM notifications WHERE event='onNewGuildBattle'").fetchall();self.assertEqual({row['account']for row in rows},{1,6});self.assertTrue(all(json.loads(row['data'])['star']==5 for row in rows))
 async def test_actual_selector_callbacks_use_server_seed_and_canonical_remaining_attempts(self):
  root=Path(__file__).parent;source=patch_guild_war_transport((root.parent/'client/main.decoded.js').read_text());result=subprocess.run(['node',str(root/'fixtures/client_guild_war_transport.cjs')],input=json.dumps({'source':source}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);self.assertEqual(json.loads(result.stdout),{'checked':2})
