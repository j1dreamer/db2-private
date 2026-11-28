import copy,json,subprocess,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.profile import character
from server.inventory import insert
from server.team_actions import slots,handle
from server.progression import learn_skills,recalculate
from server.battle import build_team,simulate
from server.rules import constants
ROOT=Path(__file__).resolve().parents[1]

class FiveEquipmentTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)/'db';self.s=Store(self.path);self.s.register('tester','password');p=self.s.create_player(1,'Tester');p.update(level=100,gem=10**8,coin=10**10);r=character(102207,1,20);r.update(level=100,awakeLevel=20);learn_skills(r);p['team']['roles']={'1':r};recalculate(p,r);self.s.save(p)
 def tearDown(self):self.s.db.close();self.tmp.cleanup()
 def call(self,action,**kw):return handle(self.s,1,'logic.teamHandler.'+action,{'teamIndex':1,**kw})
 def give(self,kind,count=1):
  p=self.s.player(1);insert(p,kind,count);self.s.save(p);return next(v['idx']for v in p['bag']['items'].values()if v['kindId']==kind)
 def fill(self):
  for k in (70101,70102,70103,70201,70202):self.call('equipArtifact',bagIndex=self.give(k))
  for _ in range(5):self.call('equipCapsule',bagIndex=self.give(60001))
 def test_exact_unlock_thresholds_without_war_soul_requirement(self):
  p=self.s.player(1);r=p['team']['roles']['1'];self.assertTrue(all(v==0 for v in r['soulLevelMap'].values()))
  for awake,art,cap in ((0,3,2),(9,3,2),(10,3,3),(14,3,3),(15,4,4),(19,4,4),(20,5,5)):
   r['awakeLevel']=awake;self.assertEqual(len(slots(r,'Artifact')),art);self.assertEqual(len(slots(r,'Capsule')),cap)
 def test_ten_equipped_items_affect_stats_and_match_original_eng_battle_builder(self):
  before=self.s.player(1)['team']['roles']['1']['power'];self.fill();p=self.s.player(1);r=p['team']['roles']['1'];self.assertGreater(r['power'],before)
  for typ in ('artifactItem','capsuleItem'):self.assertTrue(all(r['equipments'].get(typ+'_'+str(i))for i in range(1,6)))
  actual=build_team(p,['1']);expected=simulate({'mode':'clientTeam','player':p,'indices':['1']})
  for role in actual['roles']:
   if not role.get('mp'):role.pop('mp',None)
  self.assertEqual(actual,expected)
  from server.arena import npc,raw_team,combat_raw
  battle=simulate({'mode':'pvp','team':build_team(p,['1']),'defender':combat_raw(raw_team(npc(20))),'seed':123})
  self.assertIs(type(battle['isWin']),bool);self.assertGreater(battle['tickNumber'],0)
  self.s.db.close();self.s=Store(self.path);self.assertEqual(self.s.player(1)['team']['roles']['1']['equipments'],r['equipments'])
  self.call('unEquipAllArtifact');self.call('unEquipAllCapsule');self.assertFalse(any(self.s.player(1)['team']['roles']['1']['equipments'].get(t+'_'+str(i))for t in ('artifactItem','capsuleItem')for i in range(1,6)))
 def test_cannot_remove_locked_slots_or_duplicate_artifact(self):
  p=self.s.player(1);p['team']['roles']['1']['awakeLevel']=14;self.s.save(p)
  with self.assertRaises(ValueError):self.call('unEquipArtifact',equipmentType='artifactItem_4')
  for k in (70101,70102,70103):self.call('equipArtifact',bagIndex=self.give(k))
  idx=self.give(70101);before=copy.deepcopy(self.s.player(1))
  self.call('equipArtifact',bagIndex=idx)
  gear=self.s.player(1)['team']['roles']['1']['equipments']
  self.assertEqual(sum(isinstance(v,dict)and v.get('kindId')==70101 for v in gear.values()),1)
 def test_awakening_10_through_20_costs_growth_and_cap_are_valid(self):
  p=self.s.player(1);r=p['team']['roles']['1'];r['awakeLevel']=10;insert(p,50220,10000);recalculate(p,r);self.s.save(p);start=r['attr']['hp']
  with patch('server.team_actions.secrets.randbelow',return_value=0):
   for level in range(11,21):
    self.assertTrue(self.call('upgradeRoleAwakeLevel')['_temp']['isSuccess']);self.assertEqual(self.s.player(1)['team']['roles']['1']['awakeLevel'],level)
  p=self.s.player(1);self.assertGreater(p['team']['roles']['1']['attr']['hp'],start);before=copy.deepcopy(p)
  with self.assertRaises(ValueError):self.call('upgradeRoleAwakeLevel')
  self.assertEqual(before['bag'],self.s.player(1)['bag']);self.assertEqual(before['coin'],self.s.player(1)['coin'])
 def test_real_eng_role_generator_displays_five_of_each(self):
  self.fill();p=self.s.player(1)
  payload={'profile':p,'sourceBundle':str(ROOT/'client/main.decoded.js'),'startupRules':json.loads((ROOT/'tables/clientRules.json').read_text()),'checkGameplay':True,'checkTeam':True,'checkHome':True}
  result=subprocess.run(['node','tests/fixtures/client_profile.cjs'],input=json.dumps(payload),capture_output=True,text=True);self.assertEqual(result.returncode,0,result.stderr)
  role=json.loads(result.stdout)['roleScenes'][0]
  for key in ('equipmentArtifactItemMap','equipmentCapsuleItemMap'):self.assertEqual(len(role[key]),5);self.assertTrue(all(role[key].values()))
 def test_hot_rules_survive_native_data_reset_and_repeated_login(self):
  from server.economy import client_script
  base=json.loads((ROOT/'tables/clientConstants.json').read_text())['server'];script=client_script(self.s)
  js='''const vm=require('vm'),assert=require('assert'),C=BASE,E={hackDataApi(){C.ROLE.CONSTS.MAX_AWAKE_LEVEL=10;C.EQUIPMENTS.CONSTS.ARTIFACT_ITEM_TYPES=['artifactItem_1'];}},D={};const ctx={window:{__require:n=>n==='serverConfig'?C:n==='buildExt'?E:D}};vm.runInNewContext(SCRIPT,ctx);const wrapped=E.hackDataApi;vm.runInNewContext(SCRIPT,ctx);assert.equal(E.hackDataApi,wrapped);E.hackDataApi();assert.equal(C.ROLE.CONSTS.MAX_AWAKE_LEVEL,20);assert.equal(C.EQUIPMENTS.CONSTS.ARTIFACT_ITEM_TYPES.length,5);assert.equal(C.EQUIPMENTS.CONSTS.CAPSULE_ITEM_TYPES.length,5);'''
  r=subprocess.run(['node','-e',js.replace('BASE',json.dumps(base)).replace('SCRIPT',json.dumps(script))],capture_output=True,text=True);self.assertEqual(r.returncode,0,r.stderr)
