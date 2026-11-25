"""Run the recovered Player/Bag/Team and point data generator against server data.
UI and network dependencies are stubbed; this is not a rendering/device test.
"""
import json,shutil,subprocess,tempfile,unittest
from pathlib import Path
from server.storage import Store
from server.gameplay import draw

@unittest.skipUnless(shutil.which('node'),'Node required for recovered-client model checks')
class ClientModelTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.store.register('tester','password');self.profile=self.store.create_player(1,'Goku')
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def client(self,profile,deltas):
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_profile.cjs')],input=json.dumps({'profile':profile,'deltas':deltas,'checkPoint':True,'checkRoles':True,'checkTeam':True}),text=True,capture_output=True,check=True)
  return json.loads(result.stdout)
 def test_initial_profile_constructs_original_models(self):
  state=self.client(self.profile,[])
  self.assertTrue(state['roles'][0]['imgId']);self.assertEqual(state['gem'],50);self.assertEqual(state['point']['normalTicketCount'],0);self.assertEqual(state['team']['1']['kindId'],100101)
 def test_original_team_generators_accept_equipment_and_friendship(self):
  state=self.client(self.profile,[])
  self.assertEqual(len(state['teamItems'][0]['itemItems']),6)
  self.assertGreater(len(state['friendship']['friendshipItems']),0)
  self.assertEqual(state['teamItems'][0]['classId'],1)
 def test_consumed_ticket_removed_by_original_client(self):
  p=self.profile;p['bag']={'lastIdx':1,'items':{'1':{'kindId':119,'idx':1,'count':1}}};self.store.save(p)
  response=draw(self.store,1,'normal',1);state=self.client(p,[response]);persisted=self.store.player(1)
  self.assertNotIn('1',state['bag']);self.assertEqual(state['point']['normalTicketCount'],0)
  self.assertEqual(sorted(r['kindId'] for r in state['team'].values()),sorted(r['kindId'] for r in persisted['team']['roles'].values()))
 def test_duplicate_soul_reward_and_wallet_match_original_client(self):
  p=self.profile;p['gem']=1000;self.store.save(p)
  row={'entityId':100101,'count':1,'weight':1,'extra':{'star':1}}
  self.store.db.execute('INSERT INTO pool_entries VALUES(?,?,?)',(102,100101,json.dumps(row)))
  first=draw(self.store,1,'normal',1);second=draw(self.store,1,'normal',1)
  state=self.client(p,[first,second]);persisted=self.store.player(1)
  self.assertEqual(state['gem'],400);self.assertEqual({k:(r['kindId'],r['count']) for k,r in state['bag'].items()},{k:(r['kindId'],r['count']) for k,r in persisted['bag']['items'].items()});self.assertEqual(len(state['team']),1)
if __name__=='__main__':unittest.main()
