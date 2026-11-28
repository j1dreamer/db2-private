import datetime,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server import adventure
from server.storage import Store
from server.state import stack_count

class SundayDateTime(datetime.datetime):
 @classmethod
 def now(cls,tz=None):return cls(2026,11,29,12,tzinfo=datetime.timezone(datetime.timedelta(hours=7))).astimezone(tz)

class DailyRewardTests(unittest.TestCase):
 def test_all_fifty_seven_daily_stages_have_real_mob_drop_rewards(self):
  _,small=adventure.maps();self.assertEqual(len(adventure.daily_drop_classes()),57)
  for ident,classes in adventure.daily_drop_classes().items():
   with self.subTest(stage=ident):
    self.assertTrue(classes);self.assertTrue(adventure.reward_plan(small[ident]))
 def test_original_daily_drop_quantities(self):
  _,small=adventure.maps()
  for ident,expected in [(30101,{49904:4,49902:15}),(30401,{20002:12,20001:28}),(30501,{202:6,201:10}),(30601,{40115:20})]:
   self.assertEqual({r['entityId']:r['count']for r in adventure.reward_plan(small[ident])},expected)
 def test_skip_grants_source_boss_drops_and_keeps_daily_quota(self):
  noon=datetime.datetime(2026,11,29,12,tzinfo=datetime.timezone(datetime.timedelta(hours=7))).timestamp()
  with tempfile.TemporaryDirectory()as folder,patch('time.time',return_value=noon),patch('server.adventure.datetime.datetime',SundayDateTime):
   s=Store(Path(folder)/'db');s.register('daily','password');p=s.create_player(1,'Daily');p.update(level=99,gem=1000,actionPoint=100);p['smapStarMap'].setdefault('4',{})['301']={'30101':3};s.save(p)
   before=s.player(1);adventure.skip(s,1,{'smapId':30101,'times':1});after=s.player(1)
   self.assertEqual(stack_count(after,49904),stack_count(before,49904)+4);self.assertEqual(stack_count(after,49902),stack_count(before,49902)+15)
   self.assertEqual(after['actionPoint'],before['actionPoint']-6)
   adventure.skip(s,1,{'smapId':30101,'times':1})
   with self.assertRaises(ValueError):adventure.skip(s,1,{'smapId':30101,'times':1})
   s.db.close()

class DailyBattleTests(unittest.IsolatedAsyncioTestCase):
 async def test_daily_battle_returns_items_for_native_victory_panel_once(self):
  from server.profile import character
  from server import combat_prefetch
  noon=datetime.datetime(2026,11,29,12,tzinfo=datetime.timezone(datetime.timedelta(hours=7))).timestamp()
  with tempfile.TemporaryDirectory()as folder,patch('time.time',return_value=noon),patch('server.adventure.datetime.datetime',SundayDateTime):
   s=Store(Path(folder)/'db');s.register('dailyfight','password');p=s.create_player(1,'Daily Fight');p.update(level=99,gem=1000,actionPoint=100)
   p['team']['roles']['1']=character(107804,1,7);p['team']['roles']['1']['level']=150
   from server.progression import recalculate
   recalculate(p,p['team']['roles']['1']);s.save(p)
   response=adventure.begin(s,1,{'smapId':30101,'teamIndexs':[1]});seed=response['_temp']['seed']
   result=await combat_prefetch._cache(s)[(p['id'],seed)][2];self.assertTrue(result['isWin'])
   args={'star':result['star'],'seed':seed,'tickNumber':result['tickNumber'],'teamIndexs':[1],'shipIdxs':[],'manualRecordMap1':result['records'].get('1',{}),'manualRecordMap2':result['records'].get('2',{})}
   response=await adventure.end(s,1,args);self.assertEqual(response['_temp']['entityCountMap']['49904'],4);self.assertEqual(response['_temp']['entityCountMap']['49902'],15)
   with self.assertRaises(ValueError):await adventure.end(s,1,args)
   s.db.close()
