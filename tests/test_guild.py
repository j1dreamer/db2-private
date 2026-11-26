import tempfile,unittest,time,json,subprocess,shutil
from pathlib import Path
from server.storage import Store
from server import guild
from tools.client_patches import patch_guild_membership

class GuildTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db');self.seen=set()
  for account,name in enumerate(('alice','bobby','carol'),1):
   self.store.register(name,'password');p=self.store.create_player(account,name.title());p.update(level=19+account,gem=5000,coin=1000000);self.store.save(p)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def call(self,action,args=None,account=1):
  route='logic.guildHandler.'+action;r=guild.handle(self.store,account,route,args or {});self.assertEqual(r['code'],200);self.seen.add(route);return r
 def create(self):return self.call('create',{'name':'Saiyans','badgeId':1})['guild']['id']
 def add(self,pid,gid):
  self.call('applyJoin',{'guildId':gid},pid);self.call('handleApply',{'targetId':pid,'targetName':'untrusted name ignored','isAgree':True})
 def test_all_eighteen_guild_routes_have_successful_stateful_paths(self):
  gid=self.create();self.assertEqual(self.store.player(1)['gem'],4500);self.call('info');self.assertEqual(self.call('list',account=2)['_temp']['list'][0]['menberCount'],1)
  self.add(2,gid);self.add(3,gid);self.assertEqual(len(self.store.player(1)['guild']['members']),3)
  self.call('modifyNotice',{'notice':'Welcome!'});self.call('modifySetting',{'badgeId':2,'guildName':'Saiyans United','joinRequireType':1,'joinLevelLimit':18})
  self.call('addViceChairman',{'targetId':2});self.call('removeViceChairman',{'targetId':2});self.call('changeChairman',{'targetId':2});self.call('addViceChairman',{'targetId':1},2)
  p=self.store.player(2);p['atime']=int(time.time()*1000)-7*86400000;self.store.save(p);self.call('inherit');self.assertEqual(self.store.player(1)['guild']['chairmanId'],1)
  self.call('exit',{'targetId':3},3);self.assertEqual(self.store.player(3)['guildId'],0)
  r=self.call('worship',{'targetId':1,'worshipType':1},2);self.assertEqual(r['actionPoint'],85);self.assertEqual(self.store.player(1)['guild']['beWorshipAwardCoin'],3000)
  self.assertEqual(self.call('receiveWorshipAward')['_temp']['entityCountMap'],{'101':3000})
  self.call('openBox');self.assertEqual(self.store.player(1)['guild']['openBoxTimes'],1)
  self.call('drum',{'type':3});self.assertEqual(len(self.store.player(2)['extra']['mails']),1);before=self.store.player(1)['team']['roles']['1']['attr']['hp']
  self.call('upgradeSkill',{'type':'HP'});self.assertEqual(self.store.player(1)['team']['roles']['1']['attr']['hp'],before+100)
  self.call('exit',{'targetId':2},2);self.call('dismiss');self.assertEqual(self.store.player(1)['guildId'],0);self.assertEqual(self.call('list',account=3)['_temp']['list'],[])
  self.assertEqual(self.seen,guild.ROUTES)
 def test_members_cannot_escalate_kick_foreign_members_or_create_free(self):
  gid=self.create();self.add(2,gid)
  for action,args in (('modifyNotice',{'notice':'owned'}),('addViceChairman',{'targetId':2}),('changeChairman',{'targetId':2}),('dismiss',{}),('exit',{'targetId':1})):
   with self.subTest(action=action):
    with self.assertRaises(ValueError):self.call(action,args,2)
  with self.assertRaises(ValueError):self.call('exit',{'targetId':3})
  before=self.store.player(3);before['gem']=499;self.store.save(before)
  with self.assertRaises(ValueError):self.call('create',{'name':'Other','badgeId':1},3)
  self.assertEqual(self.store.player(3)['gem'],499);self.assertEqual(self.store.db.execute('SELECT count(*)FROM guilds').fetchone()[0],1)
 def test_daily_operations_and_receipts_cannot_be_replayed(self):
  gid=self.create();self.add(2,gid);self.call('worship',{'targetId':1,'worshipType':2},2)
  with self.assertRaises(ValueError):self.call('worship',{'targetId':1,'worshipType':1},2)
  self.call('receiveWorshipAward')
  with self.assertRaises(ValueError):self.call('receiveWorshipAward')
  self.call('drum',{'type':1});before=self.store.player(1)
  with self.assertRaises(ValueError):self.call('drum',{'type':3})
  self.assertEqual(self.store.player(1)['gem'],before['gem'])
  for _ in range(3):self.call('openBox')
  with self.assertRaises(ValueError):self.call('openBox')
  self.assertEqual(self.store.player(1)['guild']['openBoxTimes'],3)
 def test_approval_rejection_and_closed_guild_do_not_join(self):
  gid=self.create();self.call('applyJoin',{'guildId':gid},2);self.call('handleApply',{'targetId':2,'isAgree':False});self.assertEqual(self.store.player(2)['guildId'],0)
  self.call('modifySetting',{'badgeId':1,'guildName':'Saiyans','joinRequireType':3,'joinLevelLimit':18})
  with self.assertRaises(ValueError):self.call('applyJoin',{'guildId':gid},2)
  with self.assertRaises(ValueError):self.call('handleApply',{'targetId':2,'isAgree':True})
 @unittest.skipUnless(shutil.which('node'),'Node needed for recovered guild data generator')
 def test_original_client_generator_accepts_empty_and_joined_guild(self):
  root=Path(__file__).parent
  for joined in (False,True):
   if joined:self.create()
   payload={'profile':self.store.player(1),'deltas':[self.call('info')],'checkTeam':True,'checkGuild':True};result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);state=json.loads(result.stdout)
   self.assertEqual(bool(state['guildView']['guildId']),joined);self.assertEqual(state['guildView']['remainingOpenBoxTimes'],3)
  source=(root.parent/'client/main.decoded.js').read_text();patched=patch_guild_membership(source);self.assertIn('if (!t.findWhere(u.player.guild.members',patched);subprocess.run(['node','--check'],input=patched,text=True,capture_output=True,check=True)
 @unittest.skipUnless(shutil.which('node'),'Node needed for original guild callback')
 def test_original_approval_callback_does_not_duplicate_member_after_server_delta(self):
  gid=self.create();self.call('applyJoin',{'guildId':gid},2);before=self.store.player(1);info=self.call('info');accepted=self.call('handleApply',{'targetId':2,'isAgree':True});root=Path(__file__).parent
  source=patch_guild_membership((root/'fixtures/client_guildScene.js').read_text());payload={'profile':before,'deltas':[info],'guildApprovalDelta':accepted,'moduleOverrides':{'guildScene':source},'checkTeam':True}
  result=subprocess.run(['node',str(root/'fixtures/client_profile.cjs')],input=json.dumps(payload),text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);self.assertEqual(sorted(json.loads(result.stdout)['guildMemberIds']),[1,2])
