import copy,datetime,json,subprocess,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
from aiohttp.test_utils import TestClient,TestServer
from server.app import create_app
from server.storage import Store
from server import economy,adventure,expedition,shops,commerce,activities,liveops
from server.profile import table
from server.inventory import insert,voucher_expiry
from server.state import stack_count

class EconomyTests(unittest.IsolatedAsyncioTestCase):
 async def asyncSetUp(self):
  self.tmp=tempfile.TemporaryDirectory();app=create_app(self.tmp.name,admin_token='eco-test');self.s=next(v for v in app.values()if isinstance(v,Store))
  self.s.register('tester','password');p=self.s.create_player(1,'Tester');p.update(level=99,gem=1000000,coin=10000000);p['vip']['level']=16;self.s.save(p)
  self.client=TestClient(TestServer(app));await self.client.start_server();self.h={'X-DB2-Admin-Token':'eco-test'}
 async def asyncTearDown(self):await self.client.close();self.tmp.cleanup()
 def save(self,**body):
  with self.s.transaction():economy.save(self.s,body)
 async def test_star_boxes_append_small_vouchers_once_and_keep_source_rewards(self):
  big,small=adventure.maps();p=self.s.player(1)
  bid=next(k for k,b in big.items()if sum(3 for r in small.values()if r.get('bmapId')==k and r.get('repeatable'))>=21)
  b=big[bid];p['smapStarMap'].setdefault(str(b['type']),{})[str(bid)]={str(r['kindId']):3 for r in small.values()if r.get('bmapId')==bid};self.s.save(p);before=stack_count(p,2)
  for star in (14,21):response=adventure.receive_box(self.s,1,{'bmapId':bid,'star':star})
  self.assertEqual(response['topUpPoint'],before+3)
  self.assertEqual(stack_count(self.s.player(1),2),before+3)
  with self.assertRaises(ValueError):adventure.receive_box(self.s,1,{'bmapId':bid,'star':21})
  script=economy.client_script(self.s)
  js="const vm=require('vm');const D={bmap:{data:"+json.dumps({str(bid):copy.deepcopy(b)})+"}},E={};const c={window:{},require:n=>n==='dataApi'?D:E};vm.runInNewContext("+json.dumps(script)+",c);E.hackDataApi();console.log(JSON.stringify(D.bmap.data))"
  result=json.loads(subprocess.check_output(['node','-e',js],text=True));self.assertTrue(result[str(bid)]['box2'].endswith('2x1'));self.assertEqual(result[str(bid)]['box3'].count('2x2'),1)
 async def test_expedition_final_and_skip_include_trial_once_per_run(self):
  for six in (False,True):
   p=self.s.player(1);expedition.reset(p,six);data=expedition.state_for(p,six);last=expedition.cfg(six)['CHALLENGER_COUNT'];p['expedition'][expedition.key(six,'passId')]=last-1;p['expedition'][expedition.key(six,'status')]=2;self.s.save(p)
   before=stack_count(p,2);route='logic.'+('sixExpeditionHandler'if six else'expeditionHandler')+'.receive';await expedition.handle(self.s,1,route,{})
   self.assertEqual(stack_count(self.s.player(1),2),before+1)
   with self.assertRaises(ValueError):await expedition.handle(self.s,1,route,{})
 async def test_shop_price_stock_and_sold_out_survive_admin_edit(self):
  p=self.s.player(1);ident,item=next(iter(p['shop']['goodsMap']['1'].items()));source=next(r for r in table('shop')if r['kindId']==int(ident));changes=[{'kindId':r['kindId'],'enabled':r['kindId']==int(ident),'minCount':max(r['minCount'],1),'maxCount':max(r['minCount'],r['maxCount'],1)}for r in table('shop')if r['type']==1 and r['group']==source['group']]
  selected=next(r for r in changes if r['kindId']==int(ident));selected.update(price=1,minCount=1,maxCount=1,requireEntityId=102,requireVip=0)
  self.save(section='shop',shopType=1,rows=changes,version=0);p=self.s.player(1);before=p['gem'];shops.buy(self.s,1,{'kindId':ident});self.assertEqual(self.s.player(1)['gem'],before-1)
  selected.update(price=2);self.save(section='shop',shopType=1,rows=changes,version=1)
  self.assertTrue(self.s.player(1)['shop']['goodsMap']['1'][ident]['isSaleOut'])
  with self.assertRaises(ValueError):shops.buy(self.s,1,{'kindId':ident})
 async def test_offer_gem_voucher_shared_limit_schedule_and_mandatory_cards(self):
  now=int(time.time());self.save(section='goods',id=1,name='Test dice',cost=10,point=1,limit=1,rewards=[{'entityId':94,'count':2}],schedule={'start':now-10,'end':now+100},version=0)
  before=self.s.player(1);commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':1,'costGem':10});p=self.s.player(1);self.assertEqual(p['gem'],before['gem']-10);self.assertEqual(stack_count(p,94),stack_count(before,94)+2)
  insert(p,2,10);self.s.save(p)
  with self.assertRaises(ValueError):commerce.handle(self.s,1,'logic.playerHandler.costTopUpPoint',{'goodsId':1})
  self.assertEqual(self.s.player(1)['vip']['topUpMoney'],0)
  with patch('time.time',return_value=now+101):
   self.assertNotIn('1',self.s.player(1)['extra']['goodsList'])
   with self.assertRaises(ValueError):commerce.handle(self.s,1,'logic.playerHandler.buyGemGoods',{'id':1,'costGem':10})
  self.save(section='goods',id=901,cost=175,point=175,limit=1,rewards=[{'entityId':102,'count':1}],enabled=False,version=1)
  p=self.s.player(1);self.assertEqual(p['extra']['goodsList']['901']['isWeekCard'],1);self.assertFalse(p['extra']['goodsList']['901']['privateEnabled'])
 async def test_exchange_rows_and_custom_currency_are_authoritative(self):
  self.save(section='exchanges',name='exchange',moneyId=2,rows=[{'id':1,'price':3,'maxBuyTimes':1,'rewards':[{'entityId':95,'count':2}]}],version=0)
  p=self.s.player(1);insert(p,2,10);self.s.save(p);before=stack_count(p,95);commerce.handle(self.s,1,'logic.playerHandler.exchangeBuy',{'id':1});p=self.s.player(1)
  self.assertEqual(stack_count(p,2),7);self.assertEqual(stack_count(p,95),before+2)
  with self.assertRaises(ValueError):commerce.handle(self.s,1,'logic.playerHandler.exchangeBuy',{'id':1})
 async def test_voucher_expiry_applies_only_to_new_stacks(self):
  p=self.s.player(1);insert(p,1,2);self.s.save(p);old=next(r['expireTime']for r in p['bag']['items'].values()if r['kindId']==1)
  self.save(section='rewards',voucherExpiryMinute=510,**{k:[]for k in ('stars14','stars21','expedition','sixExpedition')},version=0)
  p=self.s.player(1);insert(p,1,1);self.s.save(p);expiries={r['expireTime']for r in p['bag']['items'].values()if r['kindId']==1};self.assertIn(old,expiries);self.assertIn(voucher_expiry(p),expiries)
  local=datetime.datetime.fromtimestamp(voucher_expiry(p)/1000,datetime.timezone(datetime.timedelta(hours=7)));self.assertEqual((local.hour,local.minute),(8,30))
 async def test_configured_dice_cycle_survives_week_change_and_resets_on_next_cycle(self):
  now=int(time.time());start=now-2*86400;end=now+12*86400
  with self.s.transaction():liveops.put(self.s,'activity:dream',{'enabled':True,'start':start,'end':end})
  p=self.s.player(1);p['privateActivities']['managedDream']['times']=5;p['privateActivities']['managedDream']['dream']['curPos']=7;self.s.save(p)
  activities.claim_batch(self.s,1,['dreamRollQuest'],[0])
  with patch('time.time',return_value=now+7*86400):
   p=self.s.player(1);self.assertEqual(p['activity']['dream']['curPos'],7);self.assertEqual(p['privateActivities']['weekly']['dreamTimes'],5)
   with self.assertRaises(ValueError):activities.claim_batch(self.s,1,['dreamRollQuest'],[0])
  with patch('time.time',return_value=end+1):
   with self.assertRaises(ValueError):activities.handle(self.s,1,'logic.playerHandler.dreamRoll',{})
  with self.s.transaction():liveops.put(self.s,'activity:dream',{'enabled':True,'start':now-1,'end':end})
  self.assertEqual(self.s.player(1)['activity']['dream']['curPos'],0)
 async def test_all_fourteen_catalogs_and_auth(self):
  for kind in range(1,15):
   r=await self.client.get('/admin/economy?shop='+str(kind),headers=self.h);d=await r.json();self.assertEqual(r.status,200,d);self.assertTrue(d['shopRows']);self.assertEqual(d['shopSource'],'eng-client')
  r=await self.client.post('/admin/api',json={'action':'economy_save','section':'rewards'});self.assertEqual(r.status,401)
