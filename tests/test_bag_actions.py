import tempfile,unittest,time
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.bag_actions import handle,ROUTES
from server.gameplay import add_reward,draw
from server.state import stack_count,consume,delta,snapshot
from server.profile import upgrade_profile

class BagActionTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Goku');p['gem']=10**7;p['coin']=10**9;self.store.save(p)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args):return handle(self.store,1,'logic.bagHandler.'+action,args)
 def grant(self,kind,count=1,extra=None):
  p=self.store.player(1);add_reward(p,{'entityId':kind,'count':count,'extra':extra or {}});self.store.save(p)
  return [key for key,item in p['bag']['items'].items()if item['kindId']==kind]
 def test_sell_uses_owned_indices_prices_and_atomic_validation(self):
  key=self.grant(20001,3)[0];before=self.store.player(1)
  r=self.call('sell',{'bagIndexs':[key],'itemCounts':[2]});self.assertEqual(r['coin'],before['coin']+320)
  for indices,counts in (([key,key],[1,1]),([key],[2]),(['999'],[1]),([key],[True])):
   with self.assertRaises(ValueError):self.call('sell',{'bagIndexs':indices,'itemCounts':counts})
  self.assertEqual(stack_count(self.store.player(1),20001),1)
 def test_compose_role_consumes_source_cost_once(self):
  self.grant(50040,30);before=self.store.player(1);r=self.call('composeRole',{'classId':4})
  role=next(iter(r['team']['roles'].values()));self.assertEqual(role['star'],2);self.assertEqual(r['coin'],before['coin']-35000)
  with self.assertRaises(ValueError):self.call('composeRole',{'classId':4})
 def test_stone_compose_all_and_insufficient_materials_rollback(self):
  self.grant(60101,9);r=self.call('composeItem',{'kindId':60102,'isAll':True});self.assertEqual(r['_temp']['entityCountMap'],{'60102':2})
  self.assertEqual(stack_count(self.store.player(1),60101),1)
  with self.assertRaises(ValueError):self.call('composeItem',{'kindId':60102,'isAll':False})
  self.assertEqual(stack_count(self.store.player(1),60102),2)
 def test_artifact_and_fruit_compose_rate_boost_and_upgrade(self):
  for typ,fragment,kind in (('Artifact',80101,70101),('Fruit',10010,1001)):
   self.grant(fragment,40);self.call('compose'+typ,{'fragmentId':fragment})
   key=next(key for key,item in self.store.player(1)['bag']['items'].items()if item['kindId']==kind)
   self.call('increase'+typ+'UpgradeStarSuccessRate',{'bagIndex':key})
   with patch('server.bag_actions.secrets.randbelow',return_value=0):r=self.call('upgradeStar'+typ,{'bagIndex':key})
   self.assertTrue(r['_temp']['isSuccess']);item=self.store.player(1)['bag']['items'][key];self.assertEqual(item['star'],2);self.assertEqual(item['increaseTimes'],0)
 def test_ship_compose_experience_gem_skill_and_star(self):
  self.grant(9020,100);self.call('composeShip',{'fragmentId':9020})
  key=next(k for k,item in self.store.player(1)['bag']['items'].items()if item['kindId']==902)
  self.grant(108,1000);before=self.store.player(1)['bag']['items'][key]['experience'];self.call('addShipExperience',{'bagIndex':key,'experience':10})
  self.assertEqual(self.store.player(1)['bag']['items'][key]['experience'],before+10)
  self.call('upgradeShip',{'bagIndex':key});self.assertEqual(self.store.player(1)['vip']['shipUpgradeLevelTimes'],1)
  self.call('upgradeShipSkill',{'bagIndex':key});self.assertEqual(self.store.player(1)['bag']['items'][key]['skillLevel'],2)
  with self.assertRaises(ValueError):self.call('upgradeShipStar',{'bagIndex':key})
  p=self.store.player(1);p['bag']['items'][key]['level']=100;self.store.save(p);self.call('upgradeShipStar',{'bagIndex':key})
  self.assertEqual(self.store.player(1)['bag']['items'][key]['star'],2)
  with self.assertRaises(ValueError):self.call('composeShip',{'fragmentId':9020})
 def test_capsule_reset_save_and_compose_selected_instances(self):
  keys=self.grant(60001,5);self.assertEqual(len(keys),5);self.grant(60007,100)
  self.call('resetCapsule',{'bagIndex':keys[0]});rolled=self.store.player(1)['bag']['items'][keys[0]]['cacheSkillInfo']
  self.call('saveResetCapsule',{'bagIndex':keys[0],'isSave':True});self.assertEqual(self.store.player(1)['bag']['items'][keys[0]]['skillInfo'],rolled)
  with self.assertRaises(ValueError):self.call('saveResetCapsule',{'bagIndex':keys[0],'isSave':True})
  with self.assertRaises(ValueError):self.call('composeCapsule',{'bagIndexs':[keys[0]]*5,'capsuleId':60002})
  self.assertEqual(self.call('composeCapsule',{'bagIndexs':keys,'capsuleId':60002})['_temp']['entityCountMap'],{'60002':1})
  self.assertEqual(stack_count(self.store.player(1),60001),0)
 def test_star_sign_upgrade_and_decompose_return_half_spent_materials_once(self):
  key=self.grant(61011)[0];self.grant(61201,1);self.grant(61001,5)
  before=self.store.player(1)['bag']['items'][key]['attrValue'];self.call('upgradeStarSign',{'bagIndex':key});after=self.store.player(1)['bag']['items'][key]
  self.assertEqual(after['level'],2);self.assertGreater(after['attrValue'],before)
  r=self.call('decomposeStarSign',{'bagIndexs':[key]});self.assertEqual(r['_temp']['entityCountMap'],{'61002':2,'61201':1,'61001':3});self.assertIsNone(r['bag']['items'][key])
  with self.assertRaises(ValueError):self.call('decomposeStarSign',{'bagIndexs':[key]})
 def test_expired_stacks_are_not_spent_and_legacy_unique_items_are_repaired(self):
  self.grant(120,3,{'expireTime':1});p=self.store.player(1)
  self.assertEqual(stack_count(p,120),1);consume(p,120,1);self.assertEqual(stack_count(p,120),0);self.store.save(p)
  with self.assertRaises(ValueError):draw(self.store,1,'advanced',1)
  p=self.store.player(1);p['profileSchemaVersion']=8;p['bag']['items']['99']={'idx':99,'kindId':60001,'count':3}
  self.assertTrue(upgrade_profile(p,1));caps=[item for item in p['bag']['items'].values()if item['kindId']==60001]
  self.assertEqual(len(caps),3);self.assertTrue(all(item['count']==1 and item['skillInfo']for item in caps))
 def test_shallow_extra_delta_does_not_overwrite_live_chat(self):
  before=self.store.player(1);after=snapshot(before);after['extra']['mails']=[{'_id':'new'}]
  self.assertEqual(delta(before,after,'test')['extra'],{'mails':[{'_id':'new'}]})
