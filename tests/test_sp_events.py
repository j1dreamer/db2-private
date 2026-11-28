import copy,json,subprocess,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server import sp_events,activities,commerce,liveops
from server.storage import Store
from server.inventory import insert
from server.state import stack_count
from server.gameplay import claim_events

class SPEventTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(Path(self.tmp.name)/'db');self.s.register('tester','password');p=self.s.create_player(1,'Tester');p['gem']=100000;self.s.save(p);self.now=int(time.time());self.b={**sp_events.defaults(),'id':'broly_a','name':'Broly A','start':self.now-60,'end':self.now+5*86400,'enabled':True,'version':0}
 def tearDown(self):self.s.db.close();self.tmp.cleanup()
 def save(self,b=None):
  with self.s.transaction():sp_events.save(self.s,b or self.b)
 def call(self,name,**args):return activities.handle(self.s,1,'logic.playerHandler.'+name,args)
 def test_schedule_overlap_ticket_role_and_pity_are_authoritative(self):
  role=next(r for r in sp_events.role_catalog()if r['classId']!=55);b={**self.b,**sp_events.defaults(role['roleId'])};b['maxLuck']=2;self.save(b)
  p=self.s.player(1);insert(p,role['ticketId'],2);insert(p,11,5);self.s.save(p)
  with patch('server.gameplay.choose',side_effect=lambda pool:pool[-1]):
   self.call('spWish',activityName='privateSpWish',times=1);r=self.call('spWish',activityName='privateSpWish',times=1)
  p=self.s.player(1);self.assertEqual(stack_count(p,role['ticketId']),0);self.assertEqual(stack_count(p,11),5);self.assertEqual(r['_temp']['dropList'][0]['entityId'],role['roleId']);self.assertEqual(sp_events.state(p,b)['luck'],0)
  bad={**b,'id':'overlap','version':1}
  with self.assertRaises(ValueError):self.save(bad)
  with patch('time.time',return_value=b['end']):
   with self.assertRaises(ValueError):self.call('spWish',activityName='privateSpWish',times=1)
  cfg=liveops.configured(self.s,'privateSpWish');liveops.put(self.s,'activity:privateSpWish',{'enabled':False})
  with self.assertRaises(ValueError):self.call('spWish',activityName='privateSpWish',times=1)
 def test_rewards_limits_advanced_unlock_credit_and_claims_survive_restart(self):
  self.b['login'][0]['base']=[{'entityId':119,'count':60}];self.save();p=self.s.player(1);name='spEvent_broly_a_login';before=stack_count(p,119)
  claim_events(self.s,1,[name],[0]);self.assertEqual(stack_count(self.s.player(1),119),before+60)
  with self.assertRaises(ValueError):claim_events(self.s,1,[name],[0])
  offer=next(g for g in self.s.player(1)['extra']['goodsList'].values()if g.get('spOfferIndex')==0)
  commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':offer['id'],'costGem':offer['price']})
  with self.assertRaises(ValueError):commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':offer['id'],'costGem':offer['price']})
  unlock=next(g for g in self.s.player(1)['extra']['goodsList'].values()if g.get('spOfferIndex')==len(self.b['offers']))
  commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':unlock['id'],'costGem':unlock['price']});claim_events(self.s,1,[name+'Advanced'],[0])
  with self.s.transaction():
   p=self.s.player(1);sp_events.state(p,self.b)['credit']=50000;self.s.save(p)
  claim_events(self.s,1,['spEvent_broly_a_topup'],[0]);self.s.db.close();self.s=Store(Path(self.tmp.name)/'db')
  with self.assertRaises(ValueError):claim_events(self.s,1,[name],[0])
  p=self.s.player(1);self.assertEqual(p['vip']['topUpMoney'],0)
 def test_next_banner_resets_state_and_gem_day_at_midnight(self):
  self.save();p=self.s.player(1);st=sp_events.state(p,self.b);st.update(luck=9,times=10,gemTimes=7);self.s.save(p)
  with patch('time.time',return_value=self.now+86400):
   p=self.s.player(1);self.assertEqual(sp_events.state(p,self.b)['gemTimes'],0);self.assertEqual(sp_events.state(p,self.b)['luck'],9);self.assertEqual(len(sp_events.state(p,self.b)['days']),2)
  b={**self.b,'id':'next','start':self.b['end'],'end':self.b['end']+86400,'version':1};self.save(b)
  with patch('time.time',return_value=b['start']+1):
   p=self.s.player(1);self.assertEqual(sp_events.state(p,b)['luck'],0);self.assertFalse(any(k.startswith('spEvent_broly_a_')for k in p['activity']['map']))
  self.assertEqual([r['id']for r in liveops.calendar(self.s,self.now-100,b['end']+1)if r['source']=='sp'],['broly_a','next'])
 def test_invalid_pool_missing_ticket_and_duplicate_milestones_rejected(self):
  for changes in [{'roleId':100101},{'pool':self.b['pool'][:2]},{'login':[self.b['login'][0]]*2},{'pass':[{'target':100,'base':[{'entityId':119,'count':1}]*4,'advanced':[{'entityId':120,'count':1}]}]}]:
   with self.subTest(changes=changes),self.assertRaises(ValueError):self.save({**self.b,**changes})
  self.save()
  with self.assertRaises(ValueError):self.save({**self.b,'version':0})
 def test_original_client_models_accept_all_sp_tabs_and_login_advanced_contract(self):
  self.save();p=self.s.player(1);root=Path(__file__).parent
  r=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':p,'checkEvents':True,'checkHome':True,'checkTeam':True,'checkManagedEvents':True,'checkEventContracts':True}),text=True,capture_output=True)
  self.assertEqual(r.returncode,0,r.stderr);d=json.loads(r.stdout);self.assertTrue(d['eventContracts']['loginAdvanced']);self.assertEqual(len(d['eventViews']['sp']['activitys']),6)
 def test_rank_settlement_mails_once_after_end_and_uses_current_banner_score(self):
  self.save();p=self.s.player(1);sp_events.state(p,self.b)['times']=10;self.s.save(p)
  with patch('time.time',return_value=self.b['end']+1):
   sp_events.settle(self.s);sp_events.settle(self.s)
   p=self.s.player(1);self.assertEqual(len(p['extra']['mails']),1);self.assertEqual(p['extra']['mails'][0]['dropList'][0]['count'],20)
   with self.assertRaises(ValueError):self.save({**self.b,'version':1})
 def test_pass_uses_committed_adventure_wins_and_tier_unlock(self):
  self.b['pass'][0]['target']=20;self.save()
  with self.s.transaction():self.s.record_event_metric(1,'adventure_wins',1)
  name='spEvent_broly_a_pass';p=self.s.player(1);self.assertEqual(p['activity']['map'][name]['reachMap']['taskActivePoint'],20)
  claim_events(self.s,1,[name],[0])
  with self.assertRaises(ValueError):claim_events(self.s,1,[name+'Advanced'],[0])
  offer=next(g for g in self.s.player(1)['extra']['goodsList'].values()if g.get('spOfferIndex')==len(self.b['offers'])+1)
  commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':offer['id'],'costGem':offer['price']});claim_events(self.s,1,[name+'Advanced'],[0])
  with self.assertRaises(ValueError):claim_events(self.s,1,[name],[0])
 def test_cards_have_real_goods_and_daily_claim_without_real_topup(self):
  p=self.s.player(1);self.assertTrue(all(any(g.get(flag)for g in p['extra']['goodsList'].values())for field,flag,days,daily in commerce.CARDS.values()))
  commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':901,'costGem':175});claim_events(self.s,1,['buyCard7day'],[3])
  with self.assertRaises(ValueError):claim_events(self.s,1,['buyCard7day'],[3])
  self.assertEqual(self.s.player(1)['vip']['topUpMoney'],0)

 def test_direct_hero_offer_is_separate_from_draw_and_cannot_repeat(self):
  role=self.b['roleId'];self.b['offers'].append({'costGem':3000,'limit':1,'rewards':[{'entityId':role,'count':1,'extra':{'star':3}}]});self.save();p=self.s.player(1)
  offer=next(v for v in p['extra']['goodsList'].values()if v.get('spOfferIndex')==1);self.assertIn('Mua tướng',offer['name']);before=len(p['team']['roles']);luck=sp_events.state(p,self.b)['luck']
  commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':offer['id'],'costGem':3000});p=self.s.player(1);self.assertEqual(len(p['team']['roles']),before+1);self.assertEqual(p['gem'],97000);self.assertEqual(sp_events.state(p,self.b)['luck'],luck)
  with self.assertRaises(ValueError):commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':offer['id'],'costGem':3000})
