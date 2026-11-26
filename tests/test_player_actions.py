import tempfile,unittest
from pathlib import Path
from server.storage import Store
from server.player_actions import handle,ROUTES

class PlayerActionTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.p=self.store.create_player(1,'Goku')
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args):return handle(self.store,1,'logic.playerHandler.'+action,args)
 def test_all_profile_routes_apply_and_validate_entitlements(self):
  self.assertEqual(self.call('setPhotoImg',{'imgId':1001})['code'],200)
  self.assertEqual(self.call('setShipImg',{'imgId':900})['photoInfo']['shipImgId'],900)
  self.assertEqual(self.call('setTitleImg',{'imgId':0})['photoInfo']['titleImgId'],0)
  self.assertEqual(self.call('setChatSkin',{'imgId':0})['photoInfo']['chatImgId'],0)
  self.assertTrue(self.call('setHideEqpt',{'isHideEqpt':True})['isHideEqpt'])
  for action in ('setPhotoImg','setShipImg','setTitleImg','setChatSkin'):
   with self.subTest(action=action):
    with self.assertRaises(ValueError):self.call(action,{'imgId':999999})
  with self.assertRaises(ValueError):self.call('setHideEqpt',{'isHideEqpt':'yes'})
 def test_buy_resource_limits_and_shipped_costs(self):
  self.assertEqual(self.call('buySkillPoint',{})['skillPoint'],20)
  self.assertEqual(self.store.player(1)['gem'],40)
  self.assertEqual(self.call('buySkillPoint',{})['gem'],20)
  self.assertEqual(self.call('buyCoin',{'isAd':False})['_temp']['costGem'],10)
  p=self.store.player(1);p['gem']=100;self.store.save(p)
  self.assertEqual(self.call('buyActionPoint',{'isAd':False})['actionPoint'],180)
  self.assertEqual(self.store.player(1)['gem'],50)
  with self.assertRaises(ValueError):self.call('buyActionPoint',{'isAd':False})
  self.assertEqual(self.store.player(1)['gem'],50)
 def test_sign_in_grants_shipped_reward_once(self):
  r=self.call('signIn',{'isAd':False})
  self.assertEqual(r['signInDays'],1);self.assertEqual(r['_temp']['entityCountMap'],{'49904':30})
  with self.assertRaises(ValueError):self.call('signIn',{'isAd':False})
  self.assertEqual(self.store.player(1)['signInDays'],1)
