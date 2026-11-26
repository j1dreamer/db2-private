import copy,json,subprocess,tempfile,unittest
from pathlib import Path
from server.storage import Store
from server.inventory import insert,entity
from server.item_actions import handle,description
from server.state import stack_count
from server.rules import constants
from server.profile import table
from tools.client_patches import patch_box_quantities
ROOT=Path(__file__).resolve().parents[1]
class BoxQuantityTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.store.create_player(1,'Tester')
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def give(self,kind,count,config=None):
  p=self.store.player(1);before=set(p['bag']['items']);insert(p,kind,count,{'privateBoxConfig':config}if config else{});self.store.save(p)
  return int(next(iter(set(p['bag']['items'])-before)))
 def custom(self,desc):return {'kindName':'Rương chọn SP thử nghiệm','desc':'Thưởng thử theo cấu hình server','imgId':351,'color':7,'dropListDesc':desc,'selectCount':1}
 def open(self,index,count,choice=0):return handle(self.store,1,'logic.playerHandler.selectBoxReward',{'bagIndex':index,'itemCount':count,'rewardIdxs':[choice]})
 def test_sp_soul_quantity_ten_per_box_and_owned_count_decrease(self):
  idx=self.give(351,4,self.custom('50570x10,50590x10'));r=self.open(idx,1);self.assertEqual(r['_temp']['entityCountMap'],{'50570':10});self.assertEqual(stack_count(self.store.player(1),50570),10);self.assertEqual(r['_temp']['boxOpenedCount'],1);self.assertEqual(r['_temp']['boxRemainingCount'],0);self.assertEqual(stack_count(self.store.player(1),351),3)
  before=copy.deepcopy(self.store.player(1))
  with self.assertRaises(ValueError):self.open(idx,2)
  self.assertEqual(self.store.player(1)['bag'],before['bag'])
 def test_ten_sp_copies_create_one_role_and_convert_duplicates_without_loss(self):
  idx=self.give(351,2,self.custom('105504_star_3x10'));equivalent=constants('server.ROLE.CONSTS.EQUIVALENT_SOULS')[3];soul=next(r['kindId']for r in table('soul')if r['classId']==entity(105504)['classId'])
  first=self.open(idx,1);self.assertEqual(first['_temp']['entityCountMap'],{'105504_star_3':1,str(soul):9*equivalent});self.assertEqual(len(self.store.player(1)['team']['roles']),2)
  idx=next(int(k)for k,v in self.store.player(1)['bag']['items'].items()if v['kindId']==351)
  second=self.open(idx,1);self.assertEqual(second['_temp']['entityCountMap'],{str(soul):10*equivalent});self.assertEqual(stack_count(self.store.player(1),soul),19*equivalent);self.assertEqual(len(self.store.player(1)['team']['roles']),2)
 def test_open_ten_selection_boxes_keeps_remaining_two(self):
  idx=self.give(721,12);r=self.open(idx,10,1);self.assertEqual(r['_temp']['boxOpenedCount'],10);self.assertEqual(r['_temp']['boxRemainingCount'],2);self.assertEqual(self.store.player(1)['bag']['items'][str(idx)]['count'],2)
  for count,choice in [(3,1),(1,99)]:
   before=copy.deepcopy(self.store.player(1))
   with self.assertRaises(ValueError):self.open(idx,count,choice)
   self.assertEqual(self.store.player(1)['bag'],before['bag'])
 def test_shipped_role_box_trailing_comma_matches_client_parser(self):
  self.assertTrue(entity(724)['extra']['dropListDesc'].endswith(','));idx=self.give(724,1);self.assertTrue(self.open(idx,1)['_temp']['entityCountMap']);self.assertTrue(description('105504_star_3x1, '))
 def test_different_configurable_boxes_do_not_merge_rewards(self):
  first=self.give(351,2,self.custom('50570x10'));second=self.give(351,3,self.custom('50590x60'));self.assertNotEqual(first,second);self.open(first,1);self.open(second,1);p=self.store.player(1);self.assertEqual(stack_count(p,50570),10);self.assertEqual(stack_count(p,50590),60)
 def test_actual_client_preview_retains_role_and_item_reward_counts(self):
  idx=self.give(351,4,self.custom('105504_star_3x10,50570x60'));source=Path(self.tmp.name)/'client.js';source.write_text(patch_box_quantities((ROOT/'client/main.decoded.js').read_text()))
  payload={'profile':self.store.player(1),'sourceBundle':str(source),'checkBoxes':True,'checkTeam':True,'boxIndex':idx}
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr)
  data=json.loads(r.stdout)['boxViews'];self.assertEqual(data['selection']['count'],1);self.assertEqual([r['privateRewardCount']for r in data['selection']['itemItems']],[10,60]);self.assertEqual([r['privateRewardCount']for r in data['preview']['itemItems']],[10,60])
 def test_box_controls_counts_close_and_preview_use_renderer_adapter(self):
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/private_box_ui.cjs')],capture_output=True,text=True);self.assertEqual(r.returncode,0,r.stderr);self.assertTrue(all(json.loads(r.stdout).values()))
  source=patch_box_quantities((ROOT/'client/main.decoded.js').read_text());r=subprocess.run(['node',str(ROOT/'tests/fixtures/box_preview_guard.cjs')],input=json.dumps({'source':source}),capture_output=True,text=True);self.assertEqual(r.returncode,0,r.stderr);self.assertTrue(all(json.loads(r.stdout).values()))
