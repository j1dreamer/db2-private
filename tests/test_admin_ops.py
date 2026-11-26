import asyncio,base64,gzip,json,sqlite3,subprocess,tempfile,time,unittest,importlib.util
from pathlib import Path
from unittest.mock import patch
from aiohttp.test_utils import TestClient,TestServer
from server.app import create_app
from server.storage import Store
from server import activities,liveops
from server.gameplay import claim_events
from server.state import stack_count
from server.protocol import package,packages

class AdminOpsTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();app=create_app(self.tmp.name,admin_token='admin-test');self.store=next(v for v in app.values()if isinstance(v,Store));self.client=TestClient(TestServer(app));await self.client.start_server();self.h={'Authorization':'Bearer admin-test'};self.store.register('tester','password');self.store.create_player(1,'Son Goku')
 async def asyncTearDown(self):await self.client.close();self.tmp.cleanup()
 async def post(self,body,status=200):
  r=await self.client.post('/admin/api',headers=self.h,json=body);d=await r.json();self.assertEqual(r.status,status,d);return d
 async def get(self,path):
  r=await self.client.get(path,headers=self.h);self.assertEqual(r.status,200);return await r.json()
 def event(self,**kw):
  now=int(time.time());return {'action':'event_save','id':'SUMMER','name':'Test event','start':now-60,'end':now+3600,'enabled':True,'rewards':[{'entityId':119,'count':3}],**kw}
 async def test_every_admin_read_requires_token_and_catalog_uses_real_icons(self):
  for path in ('api','catalog','catalog/119','overview','players','players/1','events','calendar?start=1&end=2','gacha','giftcodes','audit','provenance'):
   self.assertEqual((await self.client.get('/admin/'+path)).status,401,path)
  d=await self.get('/admin/catalog?type=role&limit=3');self.assertEqual(len(d['items']),3);self.assertTrue(all(r['type']=='role'for r in d['items']));self.assertGreater(d['total'],100)
  it=await self.get('/admin/catalog/119');self.assertEqual(it['imgId'],119);self.assertTrue(it['image'].startswith('/assets/items/'));png=await self.client.get(it['image']);self.assertTrue((await png.read()).startswith(b'\x89PNG'))
 async def test_event_save_reaches_game_and_claims_once_atomic(self):
  await self.post(self.event());p=self.store.player(1);self.assertEqual(p['activity']['map']['SUMMER']['rewards'][0]['status'],2)
  before=stack_count(p,119);claim_events(self.store,1,['SUMMER'],[0]);self.assertEqual(stack_count(self.store.player(1),119),before+3)
  with self.assertRaises(sqlite3.IntegrityError):claim_events(self.store,1,['SUMMER'],[0])
  await self.post({'action':'event_delete','id':'SUMMER'});self.assertNotIn('SUMMER',self.store.player(1)['activity']['map']);self.assertEqual(self.store.db.execute('SELECT count(*)FROM event_claims').fetchone()[0],1)
  await self.post(self.event(),400)
 async def test_recurring_window_claims_next_day_and_calendar_expands(self):
  now=int(time.time());base=now-86400
  await self.post(self.event(start=base,end=base+3600,repeat='daily'))
  with patch('time.time',return_value=base+60):claim_events(self.store,1,['SUMMER'],[0])
  with patch('time.time',return_value=base+86400+60):claim_events(self.store,1,['SUMMER'],[0])
  self.assertEqual(self.store.db.execute('SELECT count(*)FROM event_window_claims').fetchone()[0],2)
  # Moving the window within its same day cannot create a second claim slot.
  await self.post(self.event(start=base+30,end=base+3630,repeat='daily'))
  with patch('time.time',return_value=base+86400+120):
   with self.assertRaises(sqlite3.IntegrityError):claim_events(self.store,1,['SUMMER'],[0])
  await self.post(self.event(start=base,end=base+3600,repeat='weekly'),400)
  reopened=Store(Path(self.tmp.name)/'game.sqlite3');self.assertEqual(reopened.db.execute('SELECT count(*)FROM event_window_claims').fetchone()[0],2);reopened.db.close()
  d=await self.get(f'/admin/calendar?start={base}&end={base+3*86400}');self.assertEqual(len(d['items']),3)
  await self.post({'action':'event_toggle','id':'SUMMER','enabled':False})
  with patch('time.time',return_value=base+2*86400+60):
   with self.assertRaises(ValueError):claim_events(self.store,1,['SUMMER'],[0])
 async def test_event_validation_and_batch_rollback(self):
  await self.post(self.event(id='__proto__'),400);await self.post(self.event(id='firstTopUp'),400);await self.post(self.event(start=10,end=9),400);await self.post(self.event(rewards=[{'entityId':999999999,'count':1}]),400)
  self.assertEqual(self.store.db.execute('SELECT count(*)FROM events').fetchone()[0],0)
  await self.post(self.event(minLevel=100));before=self.store.player(1)
  with self.assertRaises(ValueError):claim_events(self.store,1,['SUMMER'],[0])
  self.assertEqual(self.store.player(1)['bag'],before['bag'])
 async def test_builtin_pause_price_pity_and_optimistic_conflict(self):
  body={'action':'activity_config','id':'privateSpWish','enabled':True,'version':0,'options':{'costGem':1,'dailyGemLimit':10,'maxLuck':2}}
  await self.post(body);await self.post(body,409)
  with patch('secrets.randbelow',side_effect=lambda n:n-1):
   activities.handle(self.store,1,'logic.playerHandler.spWish',{'activityName':'privateSpWish','times':1});activities.handle(self.store,1,'logic.playerHandler.spWish',{'activityName':'privateSpWish','times':1})
  p=self.store.player(1);self.assertEqual(p['gem'],48);self.assertEqual(len(p['team']['roles']),2)
  await self.post({'action':'activity_config','id':'privateSpWish','enabled':False,'version':1})
  with self.assertRaises(ValueError):activities.handle(self.store,1,'logic.playerHandler.spWish',{'activityName':'privateSpWish','times':1})
 async def test_builtin_reward_override_keeps_claim_history_after_schedule_edit(self):
  await self.post({'action':'player_update','player':1,'values':{'gem':1000}});activities.handle(self.store,1,'logic.playerHandler.fillTaskActive',{'activityName':'task_active','oneCostGem':2})
  body={'action':'activity_config','id':'task_active','enabled':True,'version':0,'rewards':[[{'entityId':119,'count':2}]for _ in range(5)]}
  await self.post(body);claim_events(self.store,1,['task_active'],[0]);now=int(time.time());body.update(version=1,schedule={'start':now-60,'end':now+3600,'repeat':'none'});await self.post(body)
  with self.assertRaises(ValueError):claim_events(self.store,1,['task_active'],[0])
 async def test_giftcode_item_rewards_pause_and_history_survive_edit(self):
  await self.post({'action':'giftcode_save','code':'TICKETS','gem':10,'max_uses':3,'rewards':[{'entityId':120,'count':2}]})
  p,counts=self.store.redeem(1,'TICKETS',return_counts=True);self.assertEqual(p['gem'],60);self.assertEqual(counts,{'102':10,'120':2});self.assertEqual(stack_count(p,120),3)
  await self.post({'action':'giftcode_toggle','code':'TICKETS','enabled':False})
  with self.assertRaises(ValueError):self.store.redeem(1,'TICKETS')
  d=await self.get('/admin/giftcodes');self.assertEqual(d['items'][0]['used'],1);self.assertEqual(d['items'][0]['status'],'paused')
 async def test_grant_player_inventory_and_mail_use_actual_game_handlers(self):
  await self.post({'action':'grant_items','player':1,'rewards':[{'entityId':119,'count':10},{'entityId':70101,'count':1}]})
  p=self.store.player(1);self.assertEqual(stack_count(p,119),11);self.assertEqual(stack_count(p,70101),1)
  await self.post({'action':'send_mail','player':1,'title':'Gift','body':'Test','rewards':[{'entityId':102,'count':100}]});p=self.store.player(1);mail=p['extra']['mails'][-1]
  from server.mail import handle
  handle(self.store,1,'logic.mailHandler.receive',{'mailId':mail['_id'],'isSys':True});self.assertEqual(self.store.player(1)['gem'],150)
  with self.assertRaises(ValueError):handle(self.store,1,'logic.mailHandler.receive',{'mailId':mail['_id'],'isSys':True})
 async def test_admin_event_edit_pushes_original_on_sync_contract(self):
  uid,token=self.store.login('tester','password');ws=await self.client.ws_connect('/');await ws.send_bytes(package(1,b'{"sys":{}}'));await ws.receive();await ws.send_bytes(package(2));await ws.receive();n=0
  async def call(route,args):
   nonlocal n
   n+=1;r=route.encode();await ws.send_bytes(package(4,bytes([0,n,len(r)])+r+json.dumps(args).encode()))
   while True:
    kind,b=list(packages((await ws.receive()).data))[0]
    if kind==4 and b[0]==4:return json.loads(b[2:])
  await call('connector.entryHandler.entry',{'token':token,'serverId':1});await call('connector.playerHandler.entry',{'playerId':1});await self.post(self.event())
  while True:
   kind,b=list(packages((await ws.receive(timeout=5)).data))[0]
   if kind==4 and b[0]==6:
    name=b[2:2+b[1]].decode();payload=json.loads(b[2+b[1]:]);break
  self.assertEqual(name,'onSync');self.assertIn('SUMMER',payload['activity']['map']);await ws.close()
 async def test_actual_client_generators_accept_custom_event_and_new_rewards(self):
  await self.post(self.event());p=self.store.player(1);root=Path(__file__).parent
  r=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':p,'checkEvents':True,'checkHome':True,'checkTeam':True,'checkManagedEvents':True}),text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr);self.assertIn('SUMMER',json.dumps(json.loads(r.stdout)['managedEvents']))
 async def test_selectable_gift_updates_both_client_choices_and_actual_claim(self):
  await self.post({'action':'activity_config','id':'privateSelect','enabled':True,'version':0,'options':{'choices':[[{'entityId':101,'count':n}]for n in(10,20,30)]}})
  p=self.store.player(1);self.assertEqual(p['activity']['map']['privateSelect']['selectDropListDescs'],['101x10','101x20','101x30'])
  activities.handle(self.store,1,'logic.playerHandler.activitySelectDropList',{'activityName':'privateSelect','selectDropIdxs':[2]});claim_events(self.store,1,['privateSelect'],[0]);self.assertEqual(self.store.player(1)['coin'],30)
 async def test_closed_builtin_wheel_and_custom_prizes_really_apply(self):
  entries=[{'entityId':101,'count':i+1,'weight':1}for i in range(8)];await self.post({'action':'wheel_prizes','entries':entries})
  from server.inventory import insert
  p=self.store.player(1);insert(p,113,1);self.store.save(p)
  with patch('secrets.randbelow',return_value=0):r=activities.handle(self.store,1,'logic.playerHandler.rollDial',{'type':'luck','times':1})
  self.assertEqual(r['_temp']['entityCountMap'],{'101':1})
  await self.post({'action':'activity_config','id':'dial:luck','enabled':False,'version':0})
  with self.assertRaises(ValueError):activities.handle(self.store,1,'logic.playerHandler.rollDial',{'type':'luck','times':1})

@unittest.skipUnless(importlib.util.find_spec('cryptography'),'cryptography is optional; required only for native PNG decoder tests')
class ImageCodecTests(unittest.TestCase):
 def test_encrypted_native_prefix_and_every_chunk_crc(self):
  from tools.extract_admin_icons import decode_png,valid_png
  from cryptography.hazmat.primitives.ciphers import Cipher,algorithms,modes
  # Actual PNG extracted from the Android client, then re-encrypted with a test key.
  p=next((Path(__file__).resolve().parents[1]/'web/assets/items').glob('*.png'));raw=p.read_bytes();key=b'test-image-key12';iv=b'test-image-iv123';key=key.ljust(16,b'0');iv=iv.ljust(16,b'0');enc=Cipher(algorithms.AES(key),modes.CBC(iv)).encryptor();encrypted=enc.update(raw[:64]+b'\x10'*16)+enc.finalize()+raw[64:]
  self.assertTrue(valid_png(raw));self.assertEqual(decode_png(encrypted,key,iv),raw)
  with self.assertRaises(ValueError):decode_png(encrypted[:-1]+bytes([encrypted[-1]^1]),key,iv)
