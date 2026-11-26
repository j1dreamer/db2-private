import copy,json,re,sqlite3,tempfile,unittest,subprocess,shutil
from pathlib import Path
from unittest.mock import patch
from server.storage import Store
from server.profile import character,table
from server.gameplay import add_reward as grant_reward
from server.progression import learn_skills,recalculate
from server.rules import constants
from server.team_actions import handle
from server.shops import stock
from server.admin import item_view
from server.inventory import entity,entities
from server.provenance import summary
ROOT=Path(__file__).resolve().parents[1]
def add_reward(player,kind,count):return grant_reward(player,{'entityId':kind,'count':count,'extra':{}})

class EngGameplayTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)/'game.sqlite3';self.store=Store(self.path);self.store.register('tester','password');self.player=self.store.create_player(1,'Tester')
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def test_source_awakening_reaches_ten_then_rejects_without_consumption(self):
  p=self.player;p.update(level=100,coin=10**9,gem=10000);r=character(102207,1,20);r.update(level=100,awakeLevel=9);learn_skills(r);p['team']['roles']={'1':r};add_reward(p,50220,400);recalculate(p,r);self.store.save(p)
  with patch('server.team_actions.secrets.randbelow',return_value=0):
   result=handle(self.store,1,'logic.teamHandler.upgradeRoleAwakeLevel',{'teamIndex':1})
  self.assertTrue(result['_temp']['isSuccess']);p=self.store.player(1);self.assertEqual(p['team']['roles']['1']['awakeLevel'],10)
  self.assertEqual(max(s['maxLevel']for s in p['team']['roles']['1']['awakeSkills'].values()),100)
  before=copy.deepcopy(p)
  with self.assertRaises(ValueError):handle(self.store,1,'logic.teamHandler.upgradeRoleAwakeLevel',{'teamIndex':1})
  after=self.store.player(1);self.assertEqual(after['coin'],before['coin']);self.assertEqual(after['bag'],before['bag'])
 def test_skill_evolution_unlock_is_original_eng_hundred(self):
  self.assertEqual(constants('server.ROLE.CONSTS.EVOLVE_SKILL_NO_LEVEL_MAP'),{str(i):100 for i in range(1,5)})
  p=self.player;p.update(level=100,coin=10**9);r=character(102207,1,20);r.update(level=100,awakeLevel=10);r['skills']={'102201':{'kindId':102201,'level':100}};p['team']['roles']={'1':r};add_reward(p,85,10);add_reward(p,50220,120);self.store.save(p)
  with patch('server.team_actions.secrets.randbelow',return_value=0):self.assertTrue(handle(self.store,1,'logic.teamHandler.evolveRoleSkill',{'teamIndex':1,'skillKindId':102201})['_temp']['isSuccess'])
 def test_eng_shop_tables_are_not_long_chi_dao_quantity_overrides(self):
  p=self.player;p['level']=100;goods=stock(p,14)
  self.assertTrue(goods);self.assertTrue(all(r['minCount']<=r['maxCount']for r in table('shop')))
 def test_vietnamese_sources_and_placeholder_tokens_are_explicit(self):
  vi=json.loads((ROOT/'tables/localization/vi.eng.json').read_text());new=json.loads((ROOT/'tables/localization/vi.authored.json').read_text());p=summary()
  self.assertEqual(len(vi),8466);self.assertEqual(p['localization']['authored_entries'],len(new))
  for k,v in new.items():self.assertEqual(sorted(re.findall(r'\$\d*|%%',k)),sorted(re.findall(r'\$\d*|%%',v)))
  for r in entities().values():
   display=item_view(r);self.assertFalse(re.search('[\u3400-\u9fff]',display['name']));self.assertFalse(re.search('[\u3400-\u9fff]',display['description']))
  self.assertEqual(item_view(entity(1))['translationSource']['name'],'new-vietnamese-translation')
 def test_catalog_distinguishes_long_source_and_three_compatibility_definitions(self):
  self.assertEqual(item_view(entity(100101))['dataSource'],'eng-client');self.assertEqual(item_view(entity(373))['dataSource'],'original-ios-compatibility');self.assertEqual(item_view(entity(1))['dataSource'],'eng-client')
  self.assertEqual(len(summary()['tables']),34);self.assertEqual(item_view(entity(102207))['grade'],'SSS')
 def test_previous_schema_backup_preserves_balances_bag_and_manual_vip(self):
  p=self.player;p['profileSchemaVersion']=28;p['vip']['level']=5;p['gem']=12345;p['coin']=67890;add_reward(p,119,7);self.store.save(p)
  before=copy.deepcopy(p);self.store.db.execute("DELETE FROM ops_records WHERE key='rules-baseline'");self.store.db.close();self.store=Store(self.path)
  backups=list((self.path.parent/'backups').glob('before-eng-sp-sss-*.sqlite3'));self.assertEqual(len(backups),1)
  with sqlite3.connect(backups[0])as db:backup=json.loads(db.execute('SELECT data FROM players WHERE id=1').fetchone()[0])
  self.assertEqual(backup,before);after=self.store.player(1)
  for k in ('gem','coin','bag','vip'):self.assertEqual(after[k],before[k])
  self.assertEqual(after['profileSchemaVersion'],30);self.assertEqual(after['privateRulesBaseline'],'eng-sp-sss')
 @unittest.skipUnless(shutil.which('node'),'Node required for actual ENG model generators')
 def test_eng_client_models_accept_our_home_roles_commerce_and_events(self):
  payload={'profile':self.player,'sourceBundle':str(ROOT/'client/main.decoded.js'),'startupRules':json.loads((ROOT/'tables/clientRules.json').read_text()),'checkGameplay':True,'checkManagedEvents':True,'checkCommerce':True,'checkHome':True}
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True,check=True)
  result=json.loads(r.stdout);self.assertIsInstance(result,dict);self.assertTrue(result)
 @unittest.skipUnless(shutil.which('node'),'Node required for client locale startup')
 def test_embedded_vietnamese_loads_after_bundle_and_preserves_later_choice(self):
  r=subprocess.run(['node',str(ROOT/'tests/fixtures/client_locale.cjs')],text=True,capture_output=True,check=True);data=json.loads(r.stdout)
  self.assertEqual(data['dictionaryEntries'],8959);self.assertTrue(data['explicitSelectionPreserved'])
