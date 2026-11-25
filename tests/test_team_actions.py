import tempfile,unittest,copy,json,subprocess,shutil
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.team_actions import handle,ROUTES
from server.profile import character,table
from server.inventory import entity
from server.gameplay import add_reward
from server.progression import learn_skills,friendships,rules
from server.battle import build_team

class TeamActionTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');p=self.store.create_player(1,'Goku');p.update(level=100,coin=10**10,gem=10**8,skillPoint=1000);p['vip']['level']=5;self.store.save(p);self.called=set()
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args=None):
  result=handle(self.store,1,'logic.teamHandler.'+action,{'teamIndex':1,**(args or {})});self.assertEqual(result['code'],200);self.called.add('logic.teamHandler.'+action);return result
 def grant(self,kind,count=1):
  p=self.store.player(1);add_reward(p,{'entityId':kind,'count':count,'extra':{}});self.store.save(p)
  return [key for key,item in p['bag']['items'].items()if item['kindId']==kind]
 def edit(self,**values):
  p=self.store.player(1);p['team']['roles']['1'].update(values);learn_skills(p['team']['roles']['1']);friendships(p);self.store.save(p)
 def test_all_38_team_routes_have_successful_stateful_paths(self):
  gear=[('Stone',60101,'stoneItem_1',2),('Artifact',70101,'artifactItem_1',2),('Capsule',60001,'capsuleItem_1',4),('StarSign',61011,'starSignItem_1',4)]
  for typ,kind,slot,count in gear:
   with self.subTest(gear=typ):
    key=self.grant(kind,count)[0];before=self.store.player(1)['team']['roles']['1']['power'];self.call('equip'+typ,{'bagIndex':key});self.assertGreater(self.store.player(1)['team']['roles']['1']['power'],before)
    self.call('unEquip'+typ,{'equipmentType':slot});self.call('equipAll'+typ);self.call('unEquipAll'+typ)
    self.assertEqual(sum(x['count']for x in self.store.player(1)['bag']['items'].values()if x['kindId']==kind),count)
  self.grant(20001,1000);self.grant(20002,1000)
  key=next(k for k,v in self.store.player(1)['bag']['items'].items()if v['kindId']==20001)
  self.call('useExpItem',{'bagIndex':key,'itemCount':1});self.edit(level=5)
  self.call('upgradeEquipment',{'equipmentType':'evlItem_1'});self.call('upgradeEquipmentMax',{'equipmentType':'evlItem_1'});self.call('upgradeAllEquipmentMax')
  for key in ('evlItem_1','evlItem_2','evlItem_3','evlItem_4','evlItem_5','evlItem_6'):
   item=self.store.player(1)['team']['roles']['1']['equipments'][key];row=entity(entity(item['kindId'])['evolutionItemId'])
   for kind,count in zip(row['requiredIds'],row['requiredCounts']):self.grant(kind,count)
  self.call('evolveEquipment',{'equipmentType':'evlItem_1'});self.call('evolveAllEquipment');r=self.call('evolveRole');self.assertEqual(r['team']['roles']['1']['kindId'],100102)
  self.call('upgradeRoleSkill',{'skillKindId':100101,'isMax':False});self.call('useExpItemMax')
  self.grant(50010,300);self.call('upgradeRoleStar');self.edit(star=5);self.call('roleBreak',{'bagIndexs':[next(k for k,v in self.store.player(1)['bag']['items'].items()if v['kindId']==50010)]})
  self.edit(kindId=102207,star=20,awakeLevel=0,skills={},awakeSkills={});self.grant(50220,500)
  self.call('increaseAwakeLevelUpgradeSuccessRate')
  with patch('server.team_actions.secrets.randbelow',return_value=0):self.assertTrue(self.call('upgradeRoleAwakeLevel')['_temp']['isSuccess'])
  self.call('upgradeRoleAwakeSkill',{'skillKindId':101,'isMax':False})
  self.edit(awakeLevel=10);self.grant(86,100);self.grant(87,100)
  self.call('unlockRoleTrain',{'type':1});self.call('trainRole',{'type':1});self.assertIn('entityCountMap',self.call('resetRoleTrain',{'type':1})['_temp'])
  self.grant(31,20);self.call('soulRole',{'type':1})
  p=self.store.player(1);p['team']['roles']['1']['skills']['102201']['level']=100;self.store.save(p);self.grant(85)
  self.call('increaseEvolveSkillSuccessRate')
  with patch('server.team_actions.secrets.randbelow',return_value=0):self.assertTrue(self.call('evolveRoleSkill',{'skillKindId':102201})['_temp']['isSuccess'])
  self.call('resetRole');p=self.store.player(1);self.assertEqual(p['team']['roles']['1']['kindId'],100101)
  friendship=table('friendship')[0]
  for idx,class_id in enumerate(friendship['requiredClassIds'],2):
   kind=next(r['kindId']for r in table('role')if r['classId']==class_id);p['team']['roles'][str(idx)]=character(kind,idx)
  self.store.save(p)
  for class_id in friendship['requiredClassIds']:self.call('unlockFriendship',{'friendShipId':friendship['kindId'],'classId':class_id})
  self.assertGreater(self.store.player(1)['team']['friendshipAttr']['hp'],0)
  self.assertEqual(self.called,ROUTES)
 def test_wrong_owner_slot_and_cost_fail_without_state_changes(self):
  before=self.store.player(1)
  for action,args in (('upgradeEquipment',{'teamIndex':999,'equipmentType':'evlItem_1'}),('equipArtifact',{'bagIndex':999}),('unEquipStone',{'equipmentType':'evlItem_1'}),('upgradeRoleSkill',{'skillKindId':999}),('useExpItem',{'bagIndex':True,'itemCount':1}),('soulRole',{'type':0}),('resetRole',{})):
   with self.subTest(action=action):
    with self.assertRaises(ValueError):self.call(action,args)
  p=self.store.player(1);self.assertEqual(p['coin'],before['coin']);self.assertEqual(p['gem'],before['gem']);self.assertEqual(p['team'],before['team'])
 def test_equipped_unique_instance_keeps_attributes_and_cannot_be_used_from_bag(self):
  key=self.grant(60001)[0];original=copy.deepcopy(self.store.player(1)['bag']['items'][key]);self.call('equipCapsule',{'bagIndex':key})
  with self.assertRaises(ValueError):self.call('equipCapsule',{'bagIndex':key})
  self.call('unEquipCapsule',{'equipmentType':'capsuleItem_1'});returned=next(v for v in self.store.player(1)['bag']['items'].values()if v['kindId']==60001)
  self.assertEqual(returned['skillInfo'],original['skillInfo']);self.assertEqual(returned['count'],1)
 def test_reset_refunds_once_and_training_reset_does_not_duplicate(self):
  self.edit(level=2);before=self.store.player(1);self.call('upgradeEquipment',{'equipmentType':'evlItem_1'})
  paid=before['coin']-self.store.player(1)['coin'];r=self.call('resetRole');self.assertEqual(r['_temp']['entityCountMap']['101'],paid)
  self.assertEqual(self.store.player(1)['coin'],before['coin']);self.assertEqual(self.store.player(1)['gem'],before['gem']-200)
  with self.assertRaises(ValueError):self.call('resetRole')
 @unittest.skipUnless(shutil.which('node'),'Node required for recovered progression functions')
 def test_derived_costs_limits_and_power_factors_match_original_functions(self):
  result=subprocess.run(['node',str(Path(__file__).resolve().parent.parent/'server/battle_worker.cjs')],input=json.dumps({'mode':'progression'}),text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout),rules())
 @unittest.skipUnless(shutil.which('node'),'Node required for original team builder')
 def test_battle_input_matches_original_builder_with_ship_and_suit(self):
  key=self.grant(902)[0];p=self.store.player(1);p['team']['roles']['1']['equipments']['starSignSkillId']=3011
  payload={'mode':'clientTeam','player':p,'indices':['1'],'shipIndices':[key]}
  result=subprocess.run(['node',str(Path(__file__).resolve().parent.parent/'server/battle_worker.cjs')],input=json.dumps(payload),text=True,capture_output=True,check=True)
  expected=json.loads(result.stdout);actual=build_team(p,['1'],[key])
  for role in actual['roles']:
   # The client omits mp when unset and Node's parser omits undefined props.
   if not role.get('mp'):role.pop('mp',None)
  self.assertEqual(actual,expected)
