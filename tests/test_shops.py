import tempfile,unittest
from pathlib import Path
from server.storage import Store
from server.shops import handle,refresh_due
from server.profile import upgrade_profile,SCHEMA_VERSION

class ShopTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.p=self.store.create_player(1,'Goku')
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args):return handle(self.store,1,'logic.shopHandler.'+action,args)
 def open(self):
  p=self.store.player(1);p['level']=100;p['coin']=10**8;p['gem']=10**6;self.store.save(p);return p
 def test_new_profile_stock_and_upgrade_preserve_balances(self):
  self.assertGreaterEqual(len(self.p['shop']['goodsMap']['1']),2)
  old=self.p;old['profileSchemaVersion']=7;old.pop('privateShopStockVersion');old['gem']=777
  self.assertTrue(upgrade_profile(old,1));self.assertEqual(old['gem'],777);self.assertEqual(old['profileSchemaVersion'],SCHEMA_VERSION)
  self.assertFalse(upgrade_profile(old,1))
 def test_buy_is_atomic_and_sold_out_cannot_be_replayed(self):
  p=self.open();key,item=next((k,v)for k,v in p['shop']['goodsMap']['1'].items()if not v['requireVip'])
  before=p['coin']if item['moneyId']==101 else p['gem']
  r=self.call('buy',{'kindId':key});self.assertEqual(r['_temp']['entityCountMap'],{str(item['entityId']):item['count']})
  after=self.store.player(1);self.assertEqual(after['coin']if item['moneyId']==101 else after['gem'],before-item['price'])
  with self.assertRaises(ValueError):self.call('buy',{'kindId':key})
  self.assertEqual(self.store.player(1)['bag'],after['bag'])
 def test_refresh_charges_and_restock_is_durable(self):
  self.open();before=self.store.player(1);r=self.call('refresh',{'type':1});after=self.store.player(1)
  self.assertEqual(after['gem'],before['gem']-50);self.assertEqual(after['shop']['refreshTimesMap']['1'],1)
  self.assertIn('goodsMap',r['shop']);self.assertTrue(all(not v['isSaleOut']for v in after['shop']['goodsMap']['1'].values()))
  self.assertFalse(refresh_due(after))
 def test_locked_shop_bad_ids_and_no_funds_do_not_change_state(self):
  with self.assertRaises(ValueError):self.call('refresh',{'type':1})
  self.open();p=self.store.player(1);p['gem']=0;p['coin']=0;self.store.save(p)
  with self.assertRaises(ValueError):self.call('refresh',{'type':1})
  self.assertEqual(self.store.player(1)['shop'],p['shop'])
  for key in ('abc',True,-1,{},99999999):
   with self.subTest(key=key):
    with self.assertRaises(ValueError):self.call('buy',{'kindId':key})
