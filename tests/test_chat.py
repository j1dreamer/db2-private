import tempfile,unittest,json
from pathlib import Path
from server.storage import Store
from server.chat import handle,load,history

class ChatTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db')
  for name in ('alice','bobby','carol'):
   self.store.register(name,'password');self.store.create_player(self.store.db.execute('SELECT id FROM accounts WHERE name=?',(name,)).fetchone()[0],name)
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def send(self,kind=1,words='Hello'):return handle(self.store,1,'logic.playerHandler.sendChat',{'type':kind,'words':words})
 def test_world_chat_is_durable_and_delivered_once_by_outbox(self):
  self.assertEqual(self.send()['code'],200)
  events=self.store.db.execute('SELECT * FROM notifications').fetchall();self.assertEqual(len(events),3)
  event=json.loads(events[0]['data']);self.assertIn('playerPhotoInfo',event);self.assertEqual(event['playerId'],1)
  p=self.store.player(2);load(self.store,p);self.assertEqual(p['extra']['chat']['worldList'][0]['words'],'Hello')
  self.assertEqual(p['extra']['chat']['guildList'],[])
  with self.assertRaises(ValueError):self.send(words='Again')
  self.assertEqual(len(history(self.store,p,1)),1)
 def test_guild_scope_excludes_nonmembers_and_history_matches(self):
  from server.guild import handle as guild_action
  for account in (1,2):
   p=self.store.player(account);p.update(level=20,gem=1000);self.store.save(p)
  gid=guild_action(self.store,1,'logic.guildHandler.create',{'name':'Saiyans','badgeId':1})['guildId']
  guild_action(self.store,2,'logic.guildHandler.applyJoin',{'guildId':gid});guild_action(self.store,1,'logic.guildHandler.handleApply',{'targetId':2,'isAgree':True})
  self.send(2);targets=[r[0]for r in self.store.db.execute("SELECT account FROM notifications WHERE event='onChat'")];self.assertEqual(targets,[1,2])
  result=handle(self.store,2,'chat.chatHandler.getGuildLast',{})
  self.assertEqual(len(result['extra']['chat']['guildList']),1)
  self.assertEqual(history(self.store,self.store.player(3),2),[])
 def test_channel_entitlements_and_untrusted_content_are_rejected(self):
  for kind in (2,0,True):
   with self.subTest(kind=kind):
    with self.assertRaises(ValueError):self.send(kind)
  for words in ('','<b>x</b>','x\n','a'*201,{},'😀'*101):
   with self.subTest(words=words):
    with self.assertRaises(ValueError):self.send(words=words)
  # Long Chi Dao explicitly lowers the cross-server VIP requirement to zero.
  from server.rules import constants
  self.assertEqual(constants('server.PLAYER.CONSTS.SEND_ALL_SERVER_NEED_VIP'),0)
  self.assertEqual(self.send(3)['code'],200)
