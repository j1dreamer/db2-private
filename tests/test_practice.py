import asyncio,datetime,json,subprocess,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server import practice
from server.profile import character,table
from server.rules import constants
from server.battle import simulate
from tools.client_patches import patch_practice_transport

class PracticeTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set();day=(datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).weekday()+1)%7;cls=constants('server.SIX_SMAP.CONSTS.DAY_ROLE_CLASS_IDS_MAP')[str(day)][0];kind=next(r['kindId']for r in table('role')if r['classId']==cls)
  for account,name in enumerate(('attacker','defender'),1):
   self.store.register(name,'password');p=self.store.create_player(account,name);p.update(level=80,gem=10000);p['team']['roles']={'1':character(kind,1)};p['team']['roles']['1']['attr'].update(hp=100000 if account==1 else 100,atk=100000 if account==1 else 1);self.store.save(p)
 async def asyncTearDown(self):self.store.db.close();self.tmp.cleanup()
 async def call(self,mode,action,args=None,account=1):
  route='logic.'+mode+'Handler.'+action;r=await practice.handle(self.store,account,route,args or {});self.seen.add(route);return r
 async def defend(self,mode,kind=1,level=1):
  await self.call(mode,'setDefenseInfo',{'type':kind,'level':level,'defenseTeamIndexs':[1],'defenseShipIndexs':[]},2)
  return self.store.db.execute('SELECT ctime FROM practice_sessions WHERE mode=?AND player=2 ORDER BY ctime DESC',(mode,)).fetchone()[0]
 async def test_all_ten_routes_replay_and_transfer_rewards_once(self):
  for mode in ('practice','sixPractice'):
   ctime=await self.defend(mode);matched=await self.call(mode,'match');self.assertTrue(matched['_temp']['defenseInfosMap']['1']if mode=='practice'else matched['_temp']['defenseInfos'])
   defense=await self.call(mode,'defenseTeam',{'playerId':2,'ctime':ctime});self.assertEqual(defense['_temp']['defenseTeam']['defenseInfo']['beAttackTimes'],0)
   args={'defenderId':2,'ctime':ctime,'attackTeamIndexs':[1],'attackShipIndexs':[]};r=await self.call(mode,'choose',args);self.assertEqual((await self.call(mode,'choose',args))['_temp']['seed'],r['_temp']['seed'])
   run=json.loads(self.store.db.execute('SELECT data FROM pvp_runs WHERE mode=?',('practice:'+mode,)).fetchone()[0]);out=await asyncio.to_thread(simulate,{'mode':'practice','team':practice.combat_raw(run['attack']),'defender':practice.combat_raw(run['defense']),'seed':run['seed']});self.assertTrue(out['isWin']);result={**args,'seed':run['seed'],'isWin':True}
   with self.assertRaises(ValueError):await self.call(mode,'challenge',{**result,'isWin':False})
   r=await self.call(mode,'challenge',result);self.assertTrue(r['_temp']['entityCountMap'])
   with self.assertRaises(ValueError):await self.call(mode,'challenge',result)
   with self.assertRaises(ValueError):await self.call(mode,'choose',args)
   data=json.loads(self.store.db.execute('SELECT data FROM practice_sessions WHERE mode=?',(mode,)).fetchone()[0]);self.assertEqual(data['attackerIds'],[1]);self.assertEqual(data['beAttackTimes'],1)
  self.assertEqual(self.seen,practice.ROUTES)
 async def test_training_finishes_to_mail_once_and_releases_roles(self):
  ctime=await self.defend('practice',2);p=self.store.player(2);self.assertEqual(p['practice']['allDefenseTeamIndexs'],[1])
  self.store.db.execute('UPDATE practice_sessions SET finish=0');p=self.store.player(2);self.assertEqual(p['practice']['allDefenseTeamIndexs'],[]);self.assertEqual(p['extra']['mails'][0]['dropList'],[{'entityId':102,'count':60,'extra':{}}]);self.assertEqual(len(self.store.player(2)['extra']['mails']),1)
  with self.assertRaises(ValueError):await self.call('practice','defenseTeam',{'playerId':2,'ctime':ctime})
 async def test_costs_overlap_level_and_day_role_guards(self):
  before=self.store.player(2)['gem'];await self.defend('practice',1,3);self.assertEqual(self.store.player(2)['gem'],before-500)
  with self.assertRaises(ValueError):await self.defend('practice',1,3)
  self.assertEqual(self.store.player(2)['gem'],before-500)
  p=self.store.player(1);p['level']=1;self.store.save(p)
  with self.assertRaises(ValueError):await self.call('practice','match')
  p['level']=80;p['privateDay']='2000-01-01';p['privatePractice']['day']='2000-01-01';p['privatePractice']['defenses']=6;self.store.save(p);self.assertEqual(self.store.player(1)['practice']['remainingDefenseTimes'],6)
 async def test_source_reward_functions_match_python_for_boundaries(self):
  cases=[{'mode':mode,'type':typ,'level':level,'trainingLevel':training,'vip':vip,'ratio':ratio,'raid':raid}for mode in ('practice','sixPractice')for typ in (1,2,3,4)for level in (1,35,100)for training in (1,3)for vip in (0,10,13)for ratio in (.05,.2,1)for raid in (False,True)];src=await asyncio.to_thread(simulate,{'mode':'practiceRewards','cases':cases})
  for c,expected in zip(cases,src):self.assertEqual(practice.reward(c['mode'],c['type'],c['level'],c['trainingLevel'],c['vip'],c['ratio'],c['raid']),[{**r,'extra':{}}for r in expected],c)
 async def test_recovered_training_generators_and_defense_panel_accept_data(self):
  root=Path(__file__).parent
  for mode in ('practice','sixPractice'):
   ctime=await self.defend(mode);defense=(await self.call(mode,'defenseTeam',{'playerId':2,'ctime':ctime}))['_temp']['defenseTeam'];payload={'profile':self.store.player(1),'checkTeam':True,'checkPractice':True,'practiceDefense':defense,'practiceMode':mode};result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);view=json.loads(result.stdout)['practiceViews'];self.assertEqual(view['team']['extra']['practice']['ctime'],ctime);self.assertEqual(view['team']['extra']['practice']['beAttackTimes'],0)
  source=patch_practice_transport((root.parent/'client/main.decoded.js').read_text());subprocess.run(['node','--check'],input=source,text=True,capture_output=True,check=True)
