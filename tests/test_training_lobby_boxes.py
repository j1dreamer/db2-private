import copy,json,subprocess,tempfile,unittest
from pathlib import Path
from server.storage import Store
from server import lobby
from server.profile import table
from server.rules import constants
from server.state import stack_count
from server.inventory import insert,entity
from server.team_actions import handle as team
from server.item_actions import handle as items
from server.box_presets import presets,grant
from server.admin import Admin

class TrainingLobbyBoxTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=Store(Path(self.tmp.name)/'db');self.s.register('tester','password');p=self.s.create_player(1,'Tester');p.update(level=100,gem=10**8,coin=10**10);p['team']['roles']['1']['awakeLevel']=10
  for kind in (86,87,50010):insert(p,kind,10000)
  self.s.save(p)
 def tearDown(self):self.s.db.close();self.tmp.cleanup()
 def call(self,action,typ):return team(self.s,1,'logic.teamHandler.'+action,{'teamIndex':1,'type':typ})
 def test_native_string_training_ids_unlock_train_reset_all_fifteen(self):
  for typ in constants('server.ROLE.CONSTS.TRAIN_ITEM_IDS_MAP'):
   self.call('unlockRoleTrain',typ);self.call('trainRole',int(typ));p=self.s.player(1);self.assertEqual(p['team']['roles']['1']['trainLevelMap'][typ],1)
   self.call('resetRoleTrain',typ);self.assertEqual(self.s.player(1)['team']['roles']['1']['trainLevelMap'][typ],0)
 def test_training_invalid_or_skipped_id_never_spends(self):
  for typ in ('2','01','1.0','99',True,None,{},1.2):
   before=copy.deepcopy(self.s.player(1))
   with self.assertRaises(ValueError):self.call('unlockRoleTrain',typ)
   p=self.s.player(1);self.assertEqual(p['bag'],before['bag']);self.assertEqual(p['team'],before['team'])
 def test_sp_preset_has_twenty_real_sp_souls_and_original_box_unchanged(self):
  original=copy.deepcopy(entity(727));preset=presets()['sp60'];self.assertEqual(len(preset['choices']),20)
  classes={r['classId']for r in table('role')if r['group']==5}
  self.assertEqual({entity(r['entityId'])['classId']for r in preset['choices']},classes)
  admin=Admin(self.s,'test',lambda:set(),lambda:None)
  with self.s.transaction():admin.mutate({'action':'grant_box_preset','player':1,'preset':'sp60','count':2})
  p=self.s.player(1);boxes=[v for v in p['bag']['items'].values()if v['kindId']==351];self.assertEqual(len(boxes),2)
  kind=preset['choices'][0]['entityId'];before=stack_count(p,kind)
  for box in boxes:items(self.s,1,'logic.playerHandler.selectBoxReward',{'bagIndex':box['idx'],'itemCount':1,'rewardIdxs':[0]})
  self.assertEqual(stack_count(self.s.player(1),kind),before+120);self.assertEqual(entity(727),original)
  with self.assertRaises(ValueError):items(self.s,1,'logic.playerHandler.selectBoxReward',{'bagIndex':boxes[0]['idx'],'itemCount':1,'rewardIdxs':[0]})
 def test_champions_follow_actual_rank_and_avatar_changes(self):
  from server.arena3v3 import bracket
  from server.cooperative import period
  p=self.s.player(1);self.assertIsNone(p['extra']['arenaRankTop1'])
  self.s.db.execute("INSERT INTO arena_entries VALUES(?,1,'player','{}')",(1,))
  self.s.db.execute("INSERT INTO multi_ladder VALUES('arena3v3',?,?,1,'player','{}')",(bracket(100),1))
  self.s.db.execute("INSERT INTO cooperative_scores VALUES('prestigeBattle',?,1,10)",(period(),))
  p=self.s.player(1)
  for key in lobby.FIELDS:self.assertEqual(p['extra'][key]['playerId'],1)
  before=lobby.stamp(self.s);p['name']='Changed';self.s.save(p);self.assertNotEqual(before,lobby.stamp(self.s));self.assertEqual(self.s.player(1)['extra']['arenaRankTop1']['playerName'],'Changed')
  self.s.db.execute("UPDATE arena_entries SET player=-1,source='npc'")
  self.assertIsNone(self.s.player(1)['extra']['arenaRankTop1'])
 def test_private_id_hook_keeps_real_users_and_negative_robots(self):
  from server.economy import client_script
  script=client_script(self.s)
  js='const vm=require("vm"),C={PLAYER:{FUNS:{isRobot:id=>id<=10000}}};vm.runInNewContext('+json.dumps(script)+',{window:{__require:n=>C}});if(C.PLAYER.FUNS.isRobot(1)||!C.PLAYER.FUNS.isRobot(-1))throw Error("wrong IDs");'
  r=subprocess.run(['node','-e',js],text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr)

 def test_native_box_names_and_font_hook_is_repeat_safe(self):
  result=subprocess.run(['node','tests/fixtures/native_box_compat.cjs'],capture_output=True,text=True)
  self.assertEqual(result.returncode,0,result.stderr)
 def test_all_quality_chains_preserve_class_and_grade(self):
  for row in table('role'):
   target=row.get('evolutionRoleId')
   if target:
    evolved=entity(target);self.assertEqual(evolved['classId'],row['classId']);self.assertEqual(evolved['group'],row['group'])

 def test_real_eng_generators_read_all_twenty_sp_sixty_choices(self):
  p=self.s.player(1);grant(p,'sp60',1);self.s.save(p)
  idx=next(v['idx']for v in p['bag']['items'].values()if v['kindId']==351)
  payload={'profile':p,'sourceBundle':str(Path('client/main.decoded.js').resolve()),'checkBoxes':True,'checkTeam':True,'boxIndex':idx}
  result=subprocess.run(['node','tests/fixtures/client_profile.cjs'],input=json.dumps(payload),capture_output=True,text=True)
  self.assertEqual(result.returncode,0,result.stderr)
  view=json.loads(result.stdout)['boxViews']['selection'];self.assertEqual(view['selectCount'],1);self.assertEqual(len(view['itemItems']),20)
  self.assertTrue(all(v['count']==60 and v['_data']['type']=='soul'for v in view['itemItems']))
