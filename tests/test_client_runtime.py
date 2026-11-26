import json,shutil,subprocess,unittest
from pathlib import Path
from tools.client_patches import patch_response_boundary,patch_private_sdk

@unittest.skipUnless(shutil.which('node'),'Node needed for recovered client checks')
class RuntimeTests(unittest.TestCase):
 def test_native_bundle_loads_before_director_scheduler_and_binds_on_scene_launch(self):
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_runtime.cjs')],input=json.dumps({'delayedScheduler':True}),text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout)['scale'],2)
 def test_engine_rate_one_to_ten_pause_and_invalid_values(self):
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_runtime.cjs')],input='{}',text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout)['scale'],2)
 def test_data_and_animation_errors_release_loading_and_keep_request_queue_live(self):
  source=(Path(__file__).parent/'fixtures/client_socket.js').read_text()
  source=patch_response_boundary(source)
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_runtime.cjs')],input=json.dumps({'socket':source}),text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout)['reports'],2)
 def test_private_sdk_uses_internal_gem_offer_and_never_native_payment_or_telemetry(self):
  source=patch_private_sdk((Path(__file__).parent/'fixtures/client_sdkApi.js').read_text())
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_private_sdk.cjs')],input=json.dumps({'source':source}),text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout),{'native':0,'offers':1})

 def test_original_tournament_controls_select_explicit_rank_and_do_not_load_empty_report(self):
  from tools.client_patches import patch_tournament_controls
  from server.profile import new_profile
  root=Path(__file__).parent;overrides={name:patch_tournament_controls((root/'fixtures'/('client_'+name+'.js')).read_text(),name)for name in ('worshipRankPanel','arena3v3Scene')}
  result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps({'profile':new_profile(1,1,'Tester','tester'),'moduleOverrides':overrides,'checkTournamentControls':True}),text=True,capture_output=True,check=True)
  self.assertEqual(json.loads(result.stdout)['tournamentControls'],{'enumValue':4,'theme':3,'rows':[{'playerId':1}],'network':0,'hints':1,'loadingExtra':0})
