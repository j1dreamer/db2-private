import tempfile,unittest,subprocess,json,shutil
from pathlib import Path
from server.storage import Store
from server.gm import handle
from tools.client_patches import patch_roster_removal

class GMTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.store.create_player(1,'Goku')
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args):return handle(self.store,1,'logic.gmHandler.'+action,args)
 def enable(self):
  p=self.store.player(1);p['privateGM']=True;self.store.save(p)
 def test_all_gm_routes_reject_unentitled_players_and_self_granted_flags(self):
  for action,args in (('addItem',{'kindId':102,'itemCount':100,'privateGM':True}),('addRole',{'kindId':100801}),('removeRole',{'teamIndex':1})):
   with self.assertRaises(ValueError):self.call(action,args)
  self.assertEqual(self.store.player(1)['gem'],50)
 def test_entitled_gm_grants_owned_models_and_removes_once(self):
  self.enable();self.assertEqual(self.call('addItem',{'kindId':120,'itemCount':2,'extra':{}})['_temp']['entityCountMap'],{'120':2})
  r=self.call('addRole',{'kindId':100801});self.assertEqual(r['team']['roles']['2']['kindId'],100801)
  with self.assertRaises(ValueError):self.call('addRole',{'kindId':100801})
  self.assertIsNone(self.call('removeRole',{'teamIndex':2})['team']['roles']['2'])
  for index in (2,1):
   with self.assertRaises(ValueError):self.call('removeRole',{'teamIndex':index})
  p=self.store.player(1);p['privateGM']=False;self.store.save(p)
  with self.assertRaises(ValueError):self.call('addItem',{'kindId':102,'itemCount':1})
 @unittest.skipUnless(shutil.which('node'),'Node needed for recovered model removal')
 def test_patched_client_removes_md5_and_scene_cache_without_null_exception(self):
  self.enable();self.call('addRole',{'kindId':100801});before=self.store.player(1);removed=self.call('removeRole',{'teamIndex':2})
  root=Path(__file__).parent;team=(root/'fixtures/client_team.js').read_text();player=(root/'fixtures/client_player.js').read_text();delimiter='\n/*BOUNDARY*/\n';patched=patch_roster_removal(team+delimiter+player);team,player=patched.split(delimiter)
  payload={'profile':before,'deltas':[removed],'moduleOverrides':{'team':team,'player':player},'prepareRosterCache':True,'checkTeam':True}
  result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);state=json.loads(result.stdout)
  self.assertEqual(set(state['team']),{'1'});self.assertEqual(state['rosterCachedIds'],['1']);self.assertEqual(state['rosterNavigationCount'],1)
  source=patch_roster_removal((root.parent/'client/main.decoded.js').read_text())
  subprocess.run(['node','--check'],input=source,text=True,capture_output=True,check=True)
