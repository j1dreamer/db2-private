"""Durable channel history and authenticated, scoped chat delivery."""
import json,time
from .state import integer
from .rules import constants
ROUTES={'logic.playerHandler.sendChat','chat.chatHandler.getGuildLast'}

def history(store,player,kind):
    scope=player['guildId'] if kind==2 else player['serverId'] if kind==1 else 0
    if kind==2 and not scope:return []
    rows=store.db.execute('SELECT data FROM chat_messages WHERE kind=? AND scope=? ORDER BY id DESC LIMIT 100',(kind,scope)).fetchall()
    return [json.loads(row[0])for row in reversed(rows)]

def load(store,player):
    player['extra']['chat']={name:history(store,player,kind)for kind,name in ((1,'worldList'),(2,'guildList'),(3,'allServerList'))}

def handle(store,account,route,args):
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        if route.endswith('getGuildLast'):
            load(store,p)
            return {'code':200,'extra':{'chat':p['extra']['chat']},'_temp':{'route':route}}
        kind=integer(args.get('type'),'Kênh chat',1,3);words=args.get('words')
        if not isinstance(words,str) or not words.strip() or len(words.encode('utf-16-le',errors='surrogatepass'))//2>200 or any(ord(c)<32 for c in words) or '<'in words or '>'in words:raise ValueError('Nội dung chat không hợp lệ')
        if kind==2 and not p['guildId']:raise ValueError('Chưa tham gia bang hội')
        if kind==3 and p['vip']['level']<constants('server.PLAYER.CONSTS.SEND_ALL_SERVER_NEED_VIP') and p['level']<constants('server.PLAYER.CONSTS.SEND_ALL_SERVER_NEED_LEVEL'):raise ValueError('Chưa đủ cấp hoặc VIP cho chat liên server')
        now=int(time.time()*1000)
        # Private moderation policy: 3 seconds between sends, 200 UTF-16 units.
        recent=store.db.execute('SELECT created FROM chat_messages WHERE player=? ORDER BY id DESC LIMIT 1',(p['id'],)).fetchone()
        if recent and now-recent[0]<3000:raise ValueError('Gửi chat quá nhanh')
        scope=p['guildId'] if kind==2 else p['serverId'] if kind==1 else 0
        message={'type':kind,'words':words.strip(),'playerId':p['id'],'playerName':p['name'],'playerLevel':p['level'],'playerPhotoInfo':p['photoInfo'],'ctime':now,'serverId':p['serverId'],'honourLevel':p.get('honourLevel',0)}
        store.db.execute('INSERT INTO chat_messages(player,kind,scope,created,data) VALUES(?,?,?,?,?)',(p['id'],kind,scope,now,json.dumps(message)))
        store.db.execute('DELETE FROM chat_messages WHERE kind=? AND scope=? AND id NOT IN(SELECT id FROM chat_messages WHERE kind=? AND scope=? ORDER BY id DESC LIMIT 100)',(kind,scope,kind,scope))
        for row in store.db.execute('SELECT account,data FROM players'):
            other=json.loads(row['data'])
            if kind==3 or (kind==1 and other['serverId']==scope) or (kind==2 and other['guildId']==scope):store.notify(row['account'],'onChat',message)
        store.audit('chat',{'player':p['id']})
        return {'code':200,'_temp':{'route':route}}
