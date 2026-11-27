import asyncio,json,sqlite3,subprocess,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from aiohttp.test_utils import TestClient,TestServer
from server.app import create_app
from server.storage import Store
from server import adventure,gameplay,liveops
from server.gameplay import claim_events
from server.state import consume,stack_count
from server.protocol import package,packages

class EventObjectiveTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();app=create_app(self.tmp.name,admin_token='quest-test');self.store=next(v for v in app.values()if isinstance(v,Store));self.client=TestClient(TestServer(app));await self.client.start_server();self.headers={'Authorization':'Bearer quest-test'};self.store.register('tester','password');self.store.create_player(1,'Tester')
 async def asyncTearDown(self):await self.client.close();self.tmp.cleanup()
 async def event(self,metric,target=1,**values):
  now=int(time.time());body={'action':'event_save','id':'QUEST','name':'Nhiệm vụ thử nghiệm','start':now-60,'end':now+3600,'rewards':[{'entityId':50570,'count':60}],'requirement':{'metric':metric,'target':target},**values}
  r=await self.client.post('/admin/api',headers=self.headers,json=body);data=await r.json();self.assertEqual(r.status,200,data);return body
 def progress(self,body):return liveops.event_progress(self.store,self.store.player(1),body)
 async def test_spending_uses_committed_cost_not_admin_grants_and_survives_claim(self):
  body=await self.event('gem_spent',300)
  r=await self.client.post('/admin/api',headers=self.headers,json={'action':'grant_items','player':1,'rewards':[{'entityId':102,'count':1000}]});self.assertEqual(r.status,200);self.assertEqual(self.progress(body),0)
  with self.assertRaises(ValueError):claim_events(self.store,1,['QUEST'],[0])
  p=self.store.player(1);p['bag']['items']={k:v for k,v in p['bag']['items'].items()if v['kindId']!=119};self.store.save(p)
  gameplay.draw(self.store,1,'normal',1);self.assertEqual(self.progress(body),300)
  for _ in range(3):p=self.store.player(1);self.store.save(p)
  self.assertEqual(self.progress(body),300);self.assertEqual(p['activity']['map']['QUEST']['rewards'][0]['status'],2)
  claim_events(self.store,1,['QUEST'],[0]);self.assertEqual(stack_count(self.store.player(1),50570),60)
  with self.assertRaises(sqlite3.IntegrityError):claim_events(self.store,1,['QUEST'],[0])
  result=await self.client.post('/admin/api',headers=self.headers,json={**body,'requirement':{'metric':'summon_draws','target':1}});self.assertEqual(result.status,400)
 async def test_actual_sweep_counts_only_successful_runs_and_forfeit_does_not(self):
  body=await self.event('adventure_wins',2);p=self.store.player(1);p['smapStarMap']['1']['101']={'10101':3,'10102':3};p['gem']=10;self.store.save(p)
  adventure.skip(self.store,1,{'smapId':10102,'times':2});self.assertEqual(self.progress(body),2)
  with self.assertRaises(ValueError):adventure.skip(self.store,1,{'smapId':10102,'times':100})
  self.assertEqual(self.progress(body),2)
  p=self.store.player(1);p['smapStarMap']['1']['101'].pop('10101',None);self.store.save(p)
  start=adventure.begin(self.store,1,{'smapId':10101,'teamIndexs':[1]})
  await adventure.end(self.store,1,{'star':0,'teamIndexs':[1],'shipIdxs':[],'seed':start['_temp']['seed'],'manualRecordMap1':{},'manualRecordMap2':{},'tickNumber':0})
  self.assertEqual(self.progress(body),2);claim_events(self.store,1,['QUEST'],[0]);self.assertEqual(stack_count(self.store.player(1),50570),60)
 async def test_ticket_summons_count_without_gem_spend_and_client_model_accepts_progress(self):
  body=await self.event('summon_draws',2)
  gameplay.draw(self.store,1,'normal',1);gameplay.draw(self.store,1,'advanced',1);self.assertEqual(self.progress(body),2)
  p=self.store.player(1);self.assertEqual(p['costGem'],0);self.assertIn('2 / 2',p['activity']['map']['QUEST']['rewards'][0]['desc'])
  payload={'profile':p,'checkEvents':True,'checkHome':True,'checkTeam':True,'checkManagedEvents':True}
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);self.assertIn('QUEST',result.stdout)
  claim_events(self.store,1,['QUEST'],[0]);self.assertEqual(stack_count(self.store.player(1),50570),60)
 async def test_daily_windows_rollback_and_metric_idempotency(self):
  base=int(time.time())-60;body=await self.event('gem_spent',10,start=base,end=base+3600,repeat='daily')
  with patch('time.time',return_value=base+60):
   p=self.store.player(1);consume(p,102,10);self.store.save(p);claim_events(self.store,1,['QUEST'],[0]);self.assertEqual(self.progress(body),10)
  with patch('time.time',return_value=base+86400+60):
   self.assertEqual(self.progress(body),0)
   with self.assertRaises(ValueError):claim_events(self.store,1,['QUEST'],[0])
   with self.assertRaises(RuntimeError),self.store.transaction():
    p=self.store.player(1);consume(p,102,10);self.store.save(p);raise RuntimeError('rollback')
   self.assertEqual(self.progress(body),0)
   p=self.store.player(1);consume(p,102,10);self.store.save(p);self.store.save(p);self.assertEqual(self.progress(body),10)
   claim_events(self.store,1,['QUEST'],[0]);self.assertEqual(stack_count(self.store.player(1),50570),120)
 async def test_invalid_goals_are_rejected_and_legacy_free_gifts_still_work(self):
  with self.assertRaises(ValueError):liveops.requirement({'metric':'gem_spent','target':0})
  with self.assertRaises(ValueError):liveops.requirement({'metric':'client_supplied_progress','target':1})
  body=await self.event('none',0);claim_events(self.store,1,['QUEST'],[0]);self.assertEqual(stack_count(self.store.player(1),50570),60)
 async def test_real_rpc_progress_sync_and_forged_client_progress_rejected(self):
  await self.event('gem_spent',10);_,token=self.store.login('tester','password');ws=await self.client.ws_connect('/');await ws.send_bytes(package(1,b'{"sys":{}}'));await ws.receive();await ws.send_bytes(package(2));await ws.receive();number=0
  async def call(route,args):
   nonlocal number
   number+=1;name=route.encode();await ws.send_bytes(package(4,bytes([0,number,len(name)])+name+json.dumps(args).encode()))
   while True:
    message=await ws.receive(timeout=10)
    for kind,body in packages(message.data):
     if kind==4 and body[0]==4:return json.loads(body[2:])
  try:
   await call('connector.entryHandler.entry',{'token':token,'serverId':1});await call('connector.playerHandler.entry',{'playerId':1})
   rejected=await call('logic.playerHandler.receiveActivityAward',{'activityNames':['QUEST'],'rewardIdxs':[0],'progress':99999999});self.assertEqual(rejected['code'],500)
   spent=await call('logic.playerHandler.buyCoin',{});self.assertEqual(spent['code'],200);self.assertEqual(spent['activity']['map']['QUEST']['rewards'][0]['status'],2);self.assertIn('10 / 10',spent['activity']['map']['QUEST']['rewards'][0]['desc'])
   reward=await call('logic.playerHandler.receiveActivityAward',{'activityNames':['QUEST'],'rewardIdxs':[0]});self.assertEqual(reward['code'],200);self.assertEqual(stack_count(self.store.player(1),50570),60)
  finally:await ws.close()
