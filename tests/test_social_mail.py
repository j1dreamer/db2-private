import tempfile,unittest
from pathlib import Path
from server.storage import Store
from server import social,mail

class SocialMailTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'db')
  for name in ('alice','bobby','carol'):
   self.store.register(name,'password')
   account=self.store.db.execute('SELECT id FROM accounts WHERE name=?',(name,)).fetchone()[0]
   self.store.create_player(account,name.title())
 def tearDown(self):self.store.db.close();self.tmp.cleanup()
 def friend(self,account,action,**args):return social.handle(self.store,account,'logic.friendHandler.'+action,args)
 def message(self,account,action,**args):return mail.handle(self.store,account,'logic.mailHandler.'+action,args)
 def link(self,a,b):self.friend(a,'requestAddFriend',targetId=b);self.friend(b,'acceptAddFriend',targetId=a)
 def test_request_accept_list_search_recommend_and_remove(self):
  self.assertEqual(len(self.friend(1,'recommendList')['_temp']['list']),2)
  self.assertEqual(self.friend(1,'findTarget',content='Bobb')['_temp']['list'][0]['playerId'],2)
  self.friend(1,'requestAddFriend',targetId=2)
  self.assertEqual(self.friend(2,'requestAddFriendList')['_temp']['list'][0]['playerId'],1)
  self.friend(2,'acceptAddFriend',targetId=1)
  result=self.friend(1,'myFriendList')
  self.assertEqual(result['friend']['count'],1);self.assertEqual(result['friend']['infoMap']['2']['status'],2)
  self.friend(1,'removeFriend',targetId=2)
  self.assertEqual(self.friend(2,'myFriendList')['friend']['count'],0)
 def test_refusal_self_and_invalid_ownership(self):
  self.friend(1,'requestAddFriend',targetId=2);self.friend(2,'refuseAddFriend',targetId=1)
  self.assertEqual(self.friend(2,'requestAddFriendList')['_temp']['list'],[])
  for action in ('requestAddFriend','giveGift','receiveGift'):
   with self.subTest(action=action):
    with self.assertRaises(ValueError):self.friend(1,action,targetId=1)
  with self.assertRaises(ValueError):self.friend(1,'acceptAddFriend',targetId=3)
 def test_gifts_are_once_daily_and_ticket_exchange_is_atomic(self):
  self.link(1,2);self.link(1,3)
  self.friend(1,'giveGift',targetId=2)
  with self.assertRaises(ValueError):self.friend(1,'giveGift',targetId=2)
  self.assertEqual(self.friend(2,'receiveGift',targetId=1)['friend']['point'],1)
  with self.assertRaises(ValueError):self.friend(2,'receiveGift',targetId=1)
  self.friend(2,'giveGiftAll');self.friend(3,'giveAndReceiveGiftAll')
  self.assertEqual(self.friend(1,'receiveGiftAll')['friend']['point'],2)
  self.friend(1,'giveAndReceiveGiftAll')
  p=self.store.player(1);p['friend']['point']=20;self.store.save(p)
  self.assertEqual(self.friend(1,'exchangeTicket')['_temp']['entityCountMap'],{'119':2})
  with self.assertRaises(ValueError):self.friend(1,'exchangeTicket')
 def test_mail_send_read_delete_and_foreign_mail_rejected(self):
  self.message(1,'send',targetId=2,content='Xin chao')
  target=self.store.player(2);letter=target['extra']['mails'][0]
  self.assertEqual(letter['body'],'Xin chao');self.assertEqual(letter['senderId'],1)
  with self.assertRaises(ValueError):self.message(3,'read',mailId=letter['_id'])
  self.message(2,'read',mailId=letter['_id']);self.message(2,'removeAllRead')
  self.assertEqual(self.store.player(2)['extra']['mails'],[])
 def test_mail_rewards_claim_once_and_receive_all_preserves_unread_text(self):
  p=self.store.player(1)
  def letter(mid,rewards):return {'_id':mid,'title':'Gift','body':'Gift','status':1,'isSys':True,'ctime':1,'dropList':rewards}
  p['extra']['mails']=[letter('one',[{'entityId':102,'count':100,'extra':{}}]),letter('two',[{'entityId':119,'count':1,'extra':{}}]),letter('text',[])]
  self.store.save(p)
  with self.assertRaises(ValueError):self.message(1,'read',mailId='one')
  self.assertEqual(self.message(1,'receive',mailId='one',isSys=True)['gem'],150)
  with self.assertRaises(ValueError):self.message(1,'receive',mailId='one',isSys=True)
  self.assertEqual(self.message(1,'receiveAll',isHaveSys=True)['_temp']['entityCountMap'],{'119':1})
  self.message(1,'removeAllRead')
  self.assertEqual([x['_id'] for x in self.store.player(1)['extra']['mails']],['text'])
