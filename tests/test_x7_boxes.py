import json,subprocess,tempfile,unittest
from pathlib import Path
from server.storage import Store
from server.inventory import entity,insert
from server.item_actions import handle,description
from server import economy,expedition
from server.state import stack_count
class X7BoxTests(unittest.TestCase):
 def test_source_sp_box_has_exact_twenty_sixty_fragment_choices_and_awards(self):
  audit=json.loads(Path('analysis/x7-box-gacha-v16-source-audit.json').read_text());self.assertEqual(entity(724)['extra'],audit['boxes']['724']['after']['extra'])
  choices=description(entity(724)['extra']['dropListDesc']);self.assertEqual(len(choices),20);self.assertTrue(all(r['count']==60 and entity(r['entityId'])['type']=='soul'for r in choices))
  with tempfile.TemporaryDirectory()as folder:
   s=Store(Path(folder)/'db');s.register('tester','password');p=s.create_player(1,'Tester');insert(p,724,20);s.save(p);idx=next(v['idx']for v in p['bag']['items'].values()if v['kindId']==724)
   for i,choice in enumerate(choices):
    before=stack_count(s.player(1),choice['entityId']);out=handle(s,1,'logic.playerHandler.selectBoxReward',{'bagIndex':idx,'itemCount':1,'rewardIdxs':[i],'clientContentRevision':16});self.assertEqual(out['_temp']['entityCountMap'],{str(choice['entityId']):60});self.assertEqual(stack_count(s.player(1),choice['entityId']),before+60)
   s.db.close()
 def test_x7_gacha_rows_are_verified_equal_not_invented_online_rates(self):
  data=json.loads(Path('analysis/x7-box-gacha-v16-source-audit.json').read_text());self.assertTrue(data['tables']['drop']['identicalToEng']);self.assertFalse(data['gacha']['onlineX7ServerRatesVerified'])
 def test_expedition_preview_reads_same_final_bonus_as_reward(self):
  with tempfile.TemporaryDirectory()as folder:
   s=Store(Path(folder)/'db');s.register('tester','password');p=s.create_player(1,'Tester');p['level']=99
   data=economy.runtime_config(s)['expeditionBonuses']
   for key,six in (('normal',False),('six',True)):
    last=data[key]['floor'];expected=data[key]['rewards'];self.assertEqual(expected,[{'entityId':2,'count':1,'extra':{}}]);self.assertEqual(economy.expedition_bonus(s,six,last-1),[])
    self.assertIn(expected[0],expedition.reward(p,six,last,s));self.assertNotIn(expected[0],expedition.reward(p,six,last-1,s))
   s.db.close()
 def test_native_final_chest_preview_uses_latest_data(self):
  r=subprocess.run(['node','tests/fixtures/expedition_bonus_ui.cjs'],text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr)
 def test_old_client_cannot_consume_redefined_source_box(self):
  with tempfile.TemporaryDirectory()as folder:
   s=Store(Path(folder)/'db');s.register('tester','password');p=s.create_player(1,'Tester');insert(p,724,1);s.save(p);idx=next(v['idx']for v in p['bag']['items'].values()if v['kindId']==724)
   with self.assertRaisesRegex(ValueError,'v16'):handle(s,1,'logic.playerHandler.selectBoxReward',{'bagIndex':idx,'itemCount':1,'rewardIdxs':[0]})
   self.assertEqual(stack_count(s.player(1),724),1);s.db.close()
 def test_skip_both_expeditions_also_awards_final_voucher_once(self):
  import asyncio
  with tempfile.TemporaryDirectory()as folder:
   s=Store(Path(folder)/'db');s.register('tester','password');s.create_player(1,'Tester')
   for six in (False,True):
    p=s.player(1);p['level']=99;expedition.reset(p,six);p['expedition'][expedition.key(six,'prePassId')]=expedition.cfg(six)['CHALLENGER_COUNT'];p['vip'][expedition.counter(six)]=2;s.save(p)
    before=stack_count(p,2);route='logic.'+('sixExpeditionHandler'if six else'expeditionHandler')+'.skip';asyncio.run(expedition.handle(s,1,route,{}));self.assertEqual(stack_count(s.player(1),2),before+1)
    with self.assertRaises(ValueError):asyncio.run(expedition.handle(s,1,route,{}))
   s.db.close()

 def test_imported_x7_rewards_match_audited_source_hashes(self):
  import hashlib
  audit=json.loads(Path('analysis/x7-box-gacha-v16-source-audit.json').read_text())
  for name,row in audit['importedRewards'].items():
   data=json.loads(Path('tables/'+name+'Data.json').read_text());digest=hashlib.sha256(json.dumps(data,ensure_ascii=False,separators=(',',':')).encode()).hexdigest();self.assertEqual(digest,row['contentSha256'])
  self.assertFalse(audit['serverEventRules']['onlineX7SchedulePricesAndRatesAvailable'])
