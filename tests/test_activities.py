import copy,datetime,json,sqlite3,subprocess,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server import activities,commerce,local_boosts,rank
from server.storage import Store
from server.inventory import insert
from server.state import stack_count
from server.gameplay import claim_events

class ActivityTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Tester');p.update(level=80,gem=100000);self.store.save(p);self.seen=set()
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args=None):
  route='logic.playerHandler.'+action;result=activities.handle(self.store,1,route,args or {});self.seen.add(route);return result
 def stock(self,kind,n):
  p=self.store.player(1);insert(p,kind,n);self.store.save(p)
 def claim(self,names,idxs):return claim_events(self.store,1,names,idxs)
 def test_deposit_free_task_choice_and_unique_atomic_batch(self):
  self.call('updateFreeActivity',{'activityName':'saveGemUpgradeLevelFree'})
  with self.assertRaises(ValueError):self.claim(['saveGemUpgradeLevelFree'],[0])
  self.call('activitySaveGem',{'activityName':'saveGemUpgradeLevel'});gem=self.store.player(1)['gem']
  with self.assertRaises(ValueError):self.call('activitySaveGem',{'activityName':'saveGemUpgradeLevel'})
  r=self.claim(['saveGemUpgradeLevel']*2,['0',1]);self.assertEqual(r['gem'],gem+1200)
  self.call('updateFreeActivity',{'activityName':'saveGemUpgradeLevelFree'});self.claim(['saveGemUpgradeLevelFree'],[0])
  with self.assertRaises(ValueError):self.claim(['saveGemUpgradeLevelFree'],[0])
  self.call('fillTaskActive',{'activityName':'task_active','oneCostGem':2});p=self.store.player(1);self.assertEqual(p['task']['dailyActivePoint'],0);self.assertEqual(p['activity']['map']['task_active']['reachMap']['taskActivePoint'],100)
  before=p['bag'];self.claim(['task_active']*5,list(range(5)));self.assertEqual(stack_count(self.store.player(1),113),5)
  self.call('activitySelectDropList',{'activityName':'privateSelect','selectDropIdxs':[2]});self.claim(['privateSelect'],[0])
  self.assertGreaterEqual(stack_count(self.store.player(1),23001),20)
  with self.assertRaises(ValueError):self.call('activitySelectDropList',{'activityName':'privateSelect','selectDropIdxs':[1]})
  before=self.store.player(1)
  with self.assertRaises(ValueError):self.claim(['upgradeVip','missing'],[0,0])
  self.assertEqual(self.store.player(1)['bag'],before['bag'])
 def test_login_real_dates_fill_window_and_local_goods_unlock(self):
  # A fresh private week on Sunday starts with one actual login, never seven.
  sunday=datetime.datetime(2026,12,6,12,tzinfo=activities.ZONE).timestamp()
  with patch('time.time',return_value=sunday):
   p=self.store.player(1);self.assertEqual(p['activity']['map']['privateLogin']['reachMap']['loginDays2'],1)
   gem=p['gem'];self.call('fillLoginTopUp',{'activityName':'privateLogin'});self.assertEqual(self.store.player(1)['gem'],gem-300)
   with self.assertRaises(ValueError):self.claim(['privateLogin'],[7])
   commerce.handle(self.store,1,'logic.playerHandler.buyGemGoods',{'id':1,'costGem':300});self.claim(['privateLogin']*2,[0,7]);p=self.store.player(1);self.assertEqual(stack_count(p,94),1);self.assertEqual(stack_count(p,95),1);self.assertEqual(p['vip']['topUpMoney'],0)
   self.call('fillLoginTopUp',{'activityName':'privateLogin'});self.assertEqual(self.store.player(1)['gem'],gem-600)
  monday=sunday+86400
  with patch('time.time',return_value=monday):
   before=self.store.player(1)['gem']
   with self.assertRaises(ValueError):self.call('fillLoginTopUp',{'activityName':'privateLogin'})
   self.assertEqual(self.store.player(1)['gem'],before)
 def test_repeat_requires_actual_purchase_and_server_cooldown(self):
  self.call('updateRepeatReceiveActivityTime')
  with self.assertRaises(ValueError):self.claim(['endless_reward'],[0])
  commerce.handle(self.store,1,'logic.playerHandler.buyGemGoods',{'id':1,'costGem':300});self.claim(['endless_reward'],[0]);coin=self.store.player(1)['coin']
  with self.assertRaises(ValueError):self.claim(['endless_reward'],[0])
  deadline=self.store.player(1)['privateActivities']['daily']['repeat']['0']
  with patch('time.time',return_value=(deadline+1)/1000):
   self.call('updateRepeatReceiveActivityTime');self.claim(['endless_reward'],[0]);self.assertEqual(self.store.player(1)['coin'],coin+10000)
 def test_wheels_spend_tickets_and_pay_wheel_never_repeats(self):
  for typ,kind in activities.DIAL_COST.items():
   self.stock(kind,10);r=self.call('rollDial',{'type':typ,'times':1,'isAd':False});self.assertEqual(len(r['_temp']['dropList']),1);self.assertEqual(stack_count(self.store.player(1),kind),9 if kind!=113 else 9+r['_temp']['entityCountMap'].get('113',0))
  for _ in range(7):self.call('rollDial',{'type':'pay','times':1})
  p=self.store.player(1);self.assertEqual(len(set(p['activity']['dial']['payData']['receiveIdxs'])),8);before=stack_count(p,88)
  with self.assertRaises(ValueError):self.call('rollDial',{'type':'pay','times':1})
  self.assertEqual(stack_count(self.store.player(1),88),before)
  local_boosts.handle(self.store,1,'logic.playerHandler.viewAd',{'type':3});self.call('rollDial',{'type':'luck','times':1,'isAd':True})
  with self.assertRaises(ValueError):self.call('rollDial',{'type':'luck','times':1,'isAd':True})
 def test_score_boxes_rank_and_persistence(self):
  for name,kind in (('scorePoint1',113),('scorePointStarSign',61002)):
   self.stock(kind,100);r=self.call('scorePoint',{'activityName':name,'times':100});self.assertEqual(len(r['_temp']['dropList']),100)
   self.call('receiveScorePointBoxReward',{'activityName':name,'score':10})
   with self.assertRaises(ValueError):self.call('receiveScorePointBoxReward',{'activityName':name,'score':10})
   self.assertEqual(rank.handle(self.store,1,'logic.rankHandler.top50',{'type':name+'_score'})['_temp']['myValue'],100)
  other=Store(Path(self.tmp.name)/'db');self.assertTrue(other.player(1)['activity']['scorePointInfoMap']['scorePoint1']['receivedScoreMap']['10']);other.db.close()
 def test_sp_guarantee_duplicate_role_conversion_and_gem_cap(self):
  self.stock(11,20)
  with patch('server.activities.secrets.randbelow',side_effect=lambda n:n-1):r=self.call('spWish',{'activityName':'privateSpWish','times':10});r=self.call('spWish',{'activityName':'privateSpWish','times':10})
  p=self.store.player(1);self.assertEqual(p['privateActivities']['weekly']['spLuck'],0);self.assertTrue(any(x['kindId']==105504 for x in p['team']['roles'].values()))
  self.stock(11,20);before=p
  with patch('server.activities.secrets.randbelow',side_effect=lambda n:n-1):self.call('spWish',{'activityName':'privateSpWish','times':10});r=self.call('spWish',{'activityName':'privateSpWish','times':10})
  self.assertEqual(r['_temp']['dropList'][-1]['entityId'],105504);self.assertNotIn('team',r)
  fixture=Path(__file__).parent/'fixtures/client_profile.cjs';out=subprocess.run(['node',str(fixture)],input=json.dumps({'profile':before,'deltas':[r],'checkGameplay':True,'checkTeam':True,'checkHome':True}),text=True,capture_output=True);self.assertEqual(out.returncode,0,out.stderr);self.assertTrue(json.loads(out.stdout)['effects'][0]['entityItems'])
  self.call('spWish',{'activityName':'privateSpWish','times':10});gem=self.store.player(1)['gem']
  with self.assertRaises(ValueError):self.call('spWish',{'activityName':'privateSpWish','times':1})
  self.assertEqual(self.store.player(1)['gem'],gem)
 def test_dream_authoritative_rewards_multipliers_events_and_rollback(self):
  self.stock(94,30);self.stock(95,10)
  def position(n,**extra):
   p=self.store.player(1);p['privateActivities']['weekly']['dream']={'curPos':n,'logs':[],**extra};self.store.save(p)
  position(0);r=self.call('dreamRoll',{'diyPoint':2});self.assertEqual(r['_temp']['authoritativePos'],2);self.assertEqual(r['_temp']['dropList'][0]['entityId'],20001)
  position(58);r=self.call('dreamRoll',{'diyPoint':1});self.assertEqual(r['_temp']['dropList'][0]['entityId'],93)
  position(0,multiple=2)
  with patch('server.activities.secrets.randbelow',side_effect=[1,3]):r=self.call('dreamRoll') # raw2 -> tile4 -> double next normal move
  self.assertEqual((r['_temp']['point'],r['_temp']['event']),(2,4));self.assertEqual(self.store.player(1)['privateActivities']['weekly']['dream']['multiple'],2)
  r=self.call('dreamRoll',{'diyPoint':1});self.assertEqual(r['_temp']['authoritativePos'],5);self.assertNotIn('multiple',self.store.player(1)['privateActivities']['weekly']['dream'])
  position(0)
  with patch('server.activities.secrets.randbelow',return_value=4):r=self.call('dreamRoll',{'diyPoint':4})
  self.assertEqual((r['_temp']['event'],r['_temp']['authoritativePos']),(5,1))
  position(0,skip=True);r=self.call('dreamRoll',{'diyPoint':4});self.assertEqual(r['_temp'].get('dropList',[]),[]);self.assertEqual(r['_temp']['event'],0)
  position(0,triple=3);r=self.call('dreamRoll',{'diyPoint':2});self.assertEqual(r['_temp']['dropList'][0]['count'],15)
  before=self.store.player(1)
  for value in (0,7,True,'2'):
   with self.assertRaises(ValueError):self.call('dreamRoll',{'diyPoint':value})
  self.assertEqual(self.store.player(1)['bag'],before['bag'])
 def test_invalid_inputs_do_not_spend_or_create_claims(self):
  for action,args in [('rollDial',{'type':'luck','times':3}),('scorePoint',{'activityName':'scorePoint1','times':True}),('spWish',{'activityName':'unknown','times':1}),('fillTaskActive',{'activityName':'task_active','oneCostGem':1}),('activitySelectDropList',{'activityName':'privateSelect','selectDropIdxs':[99]})]:
   before=self.store.player(1)
   with self.assertRaises(ValueError):self.call(action,args)
   self.assertEqual(self.store.player(1)['gem'],before['gem']);self.assertEqual(self.store.player(1)['bag'],before['bag'])
 def test_all_original_activity_consumers_accept_initialized_and_updated_profile(self):
  root=Path(__file__).parent;result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkTeam':True,'checkEvents':True,'checkHome':True}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);data=json.loads(result.stdout)['eventViews'];self.assertEqual(len(data['pay']['itemItems']),8);self.assertIsNotNone(data['sp']);self.assertTrue(data['dream']['activitys']);self.assertIn('scorePoint1',data['score']['scorePointInfoMap'])

 def test_real_dream_startup_restores_server_flags_and_auto_handles_empty_reward(self):
  from tools.client_patches import patch_dream_state
  root=Path(__file__).parent;source=patch_dream_state((root/'fixtures/client_dreamActivityPanel.js').read_text())
  for dream in ({'curPos':4,'multiple':2,'skip':True},{'curPos':17}):
   result=subprocess.run(['node',str(root/'fixtures/client_dream.cjs')],input=json.dumps({'source':source,'dream':{'activityItem':{'start_time':1,'end_time':9999999999999,'rewardMap':{},'fillReward':'93x100'},**dream}}),text=True,capture_output=True)
   self.assertEqual(result.returncode,0,result.stderr);self.assertTrue(json.loads(result.stdout)['autoSurvived'])
