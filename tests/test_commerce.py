import datetime,json,subprocess,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server import commerce,guild
from server.inventory import insert
from server.state import stack_count
from tools.client_patches import patch_private_vouchers,patch_voucher_labels,patch_optional_vip_gifts,patch_activity_callbacks

class CommerceTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Tester');p.update(level=80,gem=100000);self.store.save(p);self.seen=set()
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args=None):
  route='logic.playerHandler.'+action;r=commerce.handle(self.store,1,route,args or {});self.seen.add(route);return r
 def test_all_nine_routes_charge_owned_resources_and_persist_limits(self):
  r=self.call('topUpGoodsList');self.assertEqual(len(r['extra']['goodsList']),6)
  self.call('buyGemGoods',{'id':1,'costGem':300});p=self.store.player(1);self.assertEqual(p['gem'],99700);self.assertEqual(stack_count(p,2),1);self.assertEqual(p['vip']['topUpMoney'],0)
  insert(p,1,20);insert(p,2,20);insert(p,113,20);insert(p,119,20);insert(p,105,1000);insert(p,116,1000);insert(p,107,1000);self.store.save(p)
  self.call('costTopUpPoint',{'goodsId':2});self.call('costTopUpPoint2',{'goodsId':3})
  for action in ('exchangeBuy','exchange2Buy','exchange4Buy','spWishExchangeBuy'):self.call(action,{'id':1})
  guild.handle(self.store,1,'logic.guildHandler.create',{'name':'Saiyans','badgeId':1});self.call('exchange',{'exchangeId':1,'id':1})
  self.assertEqual(self.seen,commerce.ROUTES);self.assertEqual(self.store.player(1)['vip']['topUpMoney'],0)
  with self.assertRaises(ValueError):self.call('buyGemGoods',{'id':1,'costGem':300})
  reopened=Store(Path(self.tmp.name)/'db');self.assertEqual(reopened.player(1)['buyGoodsTimesMap']['1'],1);reopened.db.close()
 def test_forged_prices_unknown_catalogs_and_insufficient_items_roll_back(self):
  for action,args in (('buyGemGoods',{'id':1,'costGem':1}),('buyGemGoods',{'id':999,'costGem':1}),('costTopUpPoint',{'goodsId':1}),('exchange2Buy',{'id':1}),('exchange',{'id':1,'exchangeId':999})):
   before=self.store.player(1)
   with self.assertRaises(ValueError):self.call(action,args)
   after=self.store.player(1);self.assertEqual(after['gem'],before['gem']);self.assertEqual(after['bag'],before['bag'])
 def test_daily_vouchers_expire_and_gem_voucher_methods_share_limit(self):
  p=self.store.player(1);insert(p,1,10);expiry=next(x['expireTime']for x in p['bag']['items'].values()if x['kindId']==1);self.store.save(p);self.call('costTopUpPoint2',{'goodsId':1})
  with self.assertRaises(ValueError):self.call('buyGemGoods',{'id':1,'costGem':300})
  with patch('time.time',return_value=(expiry+2)/1000):
   p=self.store.player(1);self.assertEqual(stack_count(p,1),0)
   with self.assertRaises(ValueError):self.call('costTopUpPoint2',{'goodsId':1})
   self.call('buyGemGoods',{'id':1,'costGem':300});self.assertEqual(self.store.player(1)['buyGoodsTimesMap']['1'],2)
 def test_recovered_shop_voucher_and_exchange_consumers_accept_profile(self):
  root=Path(__file__).parent;p=self.store.player(1);insert(p,1,4);insert(p,2,5);self.store.save(p);source=(root.parent/'client/main.decoded.js').read_text();subprocess.run(['node','--check'],input=patch_private_vouchers(source),text=True,capture_output=True,check=True)
  overrides={'dataApi':patch_voucher_labels((root/'fixtures/client_dataApi.js').read_text()),'topUpPanel':patch_optional_vip_gifts((root/'fixtures/client_topUpPanel.js').read_text())}
  result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkTeam':True,'checkCommerce':True,'checkHome':True,'moduleOverrides':overrides}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);views=json.loads(result.stdout)['commerceViews'];self.assertEqual(len(views['goods']['topUpItems']),6);self.assertEqual(views['vouchers']['topUpPoint'],9);self.assertEqual(views['dailyVouchers']['topUpPoint'],4);self.assertEqual(views['voucherNames'],['Daily local voucher','Local voucher'])
 def test_original_activity_buttons_send_names_prices_and_run_callbacks(self):
  root=Path(__file__).parent;overrides={name:patch_activity_callbacks((root/'fixtures'/('client_'+name+'.js')).read_text(),name)for name in ('activityPanel','dreamExtActivityPanel')};result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':self.store.player(1),'checkTeam':True,'checkActivityCallbacks':True,'moduleOverrides':overrides}),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);self.assertEqual(json.loads(result.stdout)['activityCalls'],[{'name':'privateTask','cost':2},{'updated':'task'},{'name':'privateLogin'},{'updated':'login'}])
