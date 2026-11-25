import tempfile,unittest,time
from pathlib import Path
from server.storage import Store
from server.item_actions import handle,ROUTES,description
from server.gameplay import add_reward
from server.state import stack_count
from server.player_actions import handle as player_action

class ItemActionTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.store.create_player(1,'Goku')
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def grant(self,kind,count=1):
  p=self.store.player(1);add_reward(p,{'entityId':kind,'count':count,'extra':{}});self.store.save(p)
  return next(k for k,v in p['bag']['items'].items()if v['kindId']==kind)
 def call(self,action,args):return handle(self.store,1,'logic.playerHandler.'+action,args)
 def test_consumables_and_cosmetics_apply_source_effects_once(self):
  key=self.grant(21003,2);r=self.call('useItem',{'bagIndex':key,'itemCount':2});self.assertEqual(r['actionPoint'],180)
  for kind,field,image in ((401,'titleInfoMap',401),(801,'frameIds',801),(501,'chatSkinIds',1)):
   key=self.grant(kind);self.call('useItem',{'bagIndex':key,'itemCount':1});p=self.store.player(1)
   self.assertIn(str(image)if field=='titleInfoMap'else image,p[field])
   with self.assertRaises(ValueError):self.call('useItem',{'bagIndex':key,'itemCount':1})
  self.assertEqual(player_action(self.store,1,'logic.playerHandler.setTitleImg',{'imgId':401})['photoInfo']['titleImgId'],401)
 def test_random_boxes_and_use_all_do_not_reopen_consumed_items(self):
  key=self.grant(311,2);r=self.call('useItem',{'bagIndex':key,'itemCount':1});self.assertEqual(sum(r['_temp']['entityCountMap'].values()),1)
  self.call('useAllBox',{});self.assertEqual(stack_count(self.store.player(1),311),0)
  with self.assertRaises(ValueError):self.call('useAllBox',{})
 def test_select_box_and_exchange_allocations_are_validated_and_atomic(self):
  key=self.grant(701,2);r=self.call('selectBoxReward',{'bagIndex':key,'itemCount':1,'rewardIdxs':[1]});self.assertEqual(r['_temp']['entityCountMap'],{'9020':50})
  for selected in ([0,0],[True],[-1],[999]):
   with self.assertRaises(ValueError):self.call('selectBoxReward',{'bagIndex':key,'itemCount':1,'rewardIdxs':selected})
  self.assertEqual(stack_count(self.store.player(1),701),1)
  key=self.grant(353,3);r=self.call('selectBoxReward2',{'bagIndex':key,'itemCount':3,'rewardIdxCountMap':{'0':1,'1':2}});self.assertEqual(r['_temp']['entityCountMap'],{'31':1,'32':2})
  with self.assertRaises(ValueError):self.call('selectBoxReward2',{'bagIndex':key,'itemCount':3,'rewardIdxCountMap':{'0':3}})
 def test_honour_threshold_and_reward_are_server_owned(self):
  with self.assertRaises(ValueError):self.call('receiveHonourReward',{'level':1})
  p=self.store.player(1);p['honourPoint']=20;self.store.save(p)
  self.assertEqual(self.call('receiveHonourReward',{'level':1})['_temp']['entityCountMap'],{'97':30})
  with self.assertRaises(ValueError):self.call('receiveHonourReward',{'level':1})
 def test_description_preserves_role_extra_and_exp_is_not_a_bag_currency(self):
  self.assertEqual(description('100101_star_3x1'),[{'entityId':100101,'count':1,'extra':{'star':3}}])
  p=self.store.player(1);add_reward(p,{'entityId':100,'count':100,'extra':{}});self.assertGreater(p['level'],1);self.assertEqual(stack_count(p,100),0)
  add_reward(p,{'entityId':98,'count':10,'extra':{}});self.assertEqual(p['vip']['level'],1);self.assertEqual(p['vip']['topUpMoney'],0)
