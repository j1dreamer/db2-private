import copy,json,subprocess,tempfile,unittest
from pathlib import Path
from server.storage import Store
from server.gm import handle
from server.inventory import entities
from server.state import stack_count
from server.admin import Admin
from server.item_actions import handle as item_action
from tools.client_patches import patch_optional_vip_gifts
ROOT=Path(__file__).resolve().parents[1]
class GMControlsTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db')
  for aid,name in enumerate(('owner','second'),1):
   self.store.register(name,'password');self.store.create_player(aid,name)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args):return handle(self.store,1,'logic.gmHandler.'+action,args)
 def enable(self):
  p=self.store.player(1);p['privateGM']=True;self.store.save(p)
 def test_catalog_search_and_revoked_rights_are_checked_every_request(self):
  for action,args in [('catalog',{}),('setPlayer',{'values':{'level':99},'privateGM':True}),('setRole',{'teamIndex':1,'values':{'level':2}})]:
   with self.assertRaises(ValueError):self.call(action,args)
  self.enable();data=self.call('catalog',{'q':'','type':'role'})['_temp']['gmCatalog'];self.assertGreater(data['total'],100);self.assertLessEqual(len(data['items']),8)
  self.assertTrue(all(r['type']=='role'for r in data['items']));self.assertTrue(all('grade'in r for r in data['items']))
  item=self.call('catalog',{'q':'120'})['_temp']['gmCatalog'];self.assertTrue(any(r['id']==120 for r in item['items']))
  self.call('addItem',{'kindId':120,'itemCount':3,'extra':{}});self.assertEqual(stack_count(self.store.player(1),120),4)
  p=self.store.player(1);p['privateGM']=False;self.store.save(p)
  with self.assertRaises(ValueError):self.call('catalog',{})
 def test_set_levels_vip_and_resources_are_durable_without_attesting_payments(self):
  self.enable();result=self.call('setPlayer',{'values':{'level':99,'vipLevel':16,'gem':777},'playerId':2});self.assertEqual(result['level'],99)
  self.call('setRole',{'teamIndex':1,'values':{'level':50}});p=self.store.player(1)
  self.assertEqual(p['team']['roles']['1']['level'],50);self.assertEqual(p['vip']['level'],16);self.assertEqual(p['vip']['topUpMoney'],0);self.assertEqual(p['timesMaxMap']['actionPoint'],159);self.assertEqual(p['gem'],777)
  self.assertEqual(self.store.player(2)['level'],1)
  self.assertEqual(len(p['extra']['goodsList']),6);self.assertTrue(p['team']['roles']['1']['power']>0)
  for action,args in [('setPlayer',{'values':{'level':1}}),('setPlayer',{'values':{'level':101}}),('setPlayer',{'values':{'vipLevel':17}}),('setPlayer',{'values':{'privateGM':True}}),('setRole',{'teamIndex':999,'values':{'level':5}})]:
   before=copy.deepcopy(self.store.player(1))
   with self.assertRaises(ValueError):self.call(action,args)
   after=self.store.player(1);self.assertEqual(after['level'],before['level']);self.assertEqual(after['gem'],before['gem']);self.assertEqual(after['team'],before['team'])
 def test_web_level_vip_update_push_consumes_actual_eng_home_and_vip_models(self):
  admin=Admin(self.store,'not-a-real-token',lambda:{1},lambda:None);before=admin.snapshots()
  with self.store.transaction():admin.mutate({'action':'player_update','player':1,'values':{'level':99,'vipLevel':16}});admin.sync(before)
  push=json.loads(self.store.db.execute("SELECT data FROM notifications WHERE account=1 AND event='onSync' ORDER BY id DESC").fetchone()[0]);self.assertEqual(len(push['extra']['goodsList']),6)
  payload={'profile':before[1],'deltas':[push],'checkHome':True,'checkCommerce':True,'checkManagedEvents':True,'moduleOverrides':{'topUpPanel':patch_optional_vip_gifts((ROOT/'tests/fixtures/client_topUpPanel.js').read_text())}}
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/client_profile.cjs')],input=json.dumps(payload),capture_output=True,text=True);self.assertEqual(r.returncode,0,r.stderr)
  data=json.loads(r.stdout);self.assertEqual(data['commerceViews']['goods']['vip'],16);self.assertEqual(len(data['commerceViews']['goods']['topUpItems']),6)
 def test_cosmetics_unlock_without_empty_reward_overlay(self):
  self.enable()
  for kind,field in [(401,'titleInfoMap'),(801,'frameIds')]:
   self.call('addItem',{'kindId':kind,'itemCount':1,'extra':{}});p=self.store.player(1);slot=next(k for k,v in p['bag']['items'].items()if v['kindId']==kind)
   result=item_action(self.store,1,'logic.bagHandler.useItem',{'bagIndex':int(slot),'itemCount':1});self.assertIn(field,result);self.assertNotIn('entityCountMap',result['_temp']);self.assertNotIn(slot,self.store.player(1)['bag']['items'])
