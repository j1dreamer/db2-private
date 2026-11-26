"""Persistent friend requests, mutual links, daily gifts and ticket exchange."""
import json,time
from .rules import constants
from .state import integer,snapshot,delta
from .gameplay import add_reward
ACTIONS=('myFriendList','recommendList','requestAddFriendList','findTarget','requestAddFriend','acceptAddFriend','refuseAddFriend','giveGift','receiveGift','giveGiftAll','receiveGiftAll','giveAndReceiveGiftAll','exchangeTicket','removeFriend')
ROUTES={'logic.friendHandler.'+x for x in ACTIONS}

def public(player):
    return {'playerId':player['id'],'playerName':player.get('name',''),'playerLevel':player.get('level',1),'playerPhotoInfo':player.get('photoInfo',{}),'serverId':player.get('serverId',1),'power':player.get('power',0),'guildName':player.get('guildName',''),'atime':player.get('atime',player.get('ctime',0)),'isOnline':False}

def profile_by_id(store,pid):
    row=store.db.execute('SELECT data FROM players WHERE id=?',(pid,)).fetchone()
    if not row:raise ValueError('Nhân vật không tồn tại')
    return json.loads(row[0])

def linked(store,a,b):return bool(store.db.execute('SELECT 1 FROM friend_links WHERE a=? AND b=?',(min(a,b),max(a,b))).fetchone())

def refresh(store,p):
    old=json.dumps(p.get('friend',{}),sort_keys=True);state=p.setdefault('friend',{})
    for key,value in [('point',0),('pointReceiveTimes',0)]:state.setdefault(key,value)
    friends=[r[0] for r in store.db.execute('SELECT CASE WHEN a=? THEN b ELSE a END FROM friend_links WHERE a=? OR b=?',(p['id'],p['id'],p['id']))]
    state['count']=len(friends);state['list']=[];state['infoMap']={};today=p.get('privateDay','')
    for fid in friends:
        target=profile_by_id(store,fid);info={'status':2,'giftStatus':1,'isGived':False}
        outgoing=store.db.execute('SELECT 1 FROM friend_gifts WHERE source=? AND target=? AND day=?',(p['id'],fid,today)).fetchone()
        incoming=store.db.execute('SELECT received FROM friend_gifts WHERE source=? AND target=? AND day=?',(fid,p['id'],today)).fetchone()
        info['isGived']=bool(outgoing)
        if incoming:info['giftStatus']=3 if incoming[0] else 2
        state['infoMap'][str(fid)]=info;state['list'].append({**public(target),'friendInfo':info})
    for row in store.db.execute('SELECT source FROM friend_requests WHERE target=?',(p['id'],)):
        state['infoMap'][str(row[0])]={'status':1,'giftStatus':1,'isGived':False}
    return old!=json.dumps(state,sort_keys=True)

def handle(store,account,route,args):
    action=route.rsplit('.',1)[-1];config=constants('server.FRIEND.CONSTS')
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        refresh(store,p);before=snapshot(p);me=p['id'];temp={};notify_targets=set()
        targets={row[0] for row in store.db.execute('SELECT CASE WHEN a=? THEN b ELSE a END FROM friend_links WHERE a=? OR b=?',(me,me,me))}
        if action in ('myFriendList','recommendList','requestAddFriendList','findTarget'):
            if action=='myFriendList':result=p['friend']['list']
            elif action=='requestAddFriendList':result=[public(profile_by_id(store,r[0])) for r in store.db.execute('SELECT source FROM friend_requests WHERE target=? ORDER BY created DESC',(me,))]
            else:
                people=[json.loads(row[0]) for row in store.db.execute('SELECT data FROM players WHERE id<>? LIMIT 500',(me,))]
                if action=='findTarget':
                    content=args.get('content')
                    if not isinstance(content,str) or not 1<=len(content.strip())<=40:raise ValueError('Từ khóa tìm kiếm không hợp lệ')
                    content=content.strip().casefold();people=[x for x in people if content in x.get('name','').casefold() or content==str(x['id'])]
                else:people=sorted((x for x in people if x['id']not in targets),key=lambda x:(abs(x['level']-p['level']),x['id']))
                result=[public(x) for x in people[:20] if not x.get('isBan')]
            temp['list']=result
        elif action in ('requestAddFriend','acceptAddFriend','refuseAddFriend','removeFriend'):
            target=integer(args.get('targetId'),'Nhân vật',1);other=profile_by_id(store,target);notify_targets.add(target)
            if target==me:raise ValueError('Không thể kết bạn với chính mình')
            if action=='requestAddFriend':
                if target in targets:raise ValueError('Đã là bạn bè')
                if len(targets)>=config['MAX_COUNT']:raise ValueError('Danh sách bạn đã đầy')
                if store.db.execute('SELECT count(*) FROM friend_requests WHERE source=?',(me,)).fetchone()[0]>=50:raise ValueError('Đã gửi quá nhiều yêu cầu đang chờ')
                store.db.execute('INSERT OR IGNORE INTO friend_requests VALUES(?,?,?)',(me,target,int(time.time())))
            elif action=='acceptAddFriend':
                if not store.db.execute('SELECT 1 FROM friend_requests WHERE source=? AND target=?',(target,me)).fetchone():raise ValueError('Yêu cầu không tồn tại')
                other_count=store.db.execute('SELECT count(*) FROM friend_links WHERE a=? OR b=?',(target,target)).fetchone()[0]
                if len(targets)>=config['MAX_COUNT'] or other_count>=config['MAX_COUNT']:raise ValueError('Một danh sách bạn đã đầy')
                store.db.execute('INSERT OR IGNORE INTO friend_links VALUES(?,?)',(min(me,target),max(me,target)))
                store.db.execute('DELETE FROM friend_requests WHERE (source=? AND target=?) OR (source=? AND target=?)',(me,target,target,me))
            elif action=='refuseAddFriend':store.db.execute('DELETE FROM friend_requests WHERE source=? AND target=?',(target,me))
            else:
                if target not in targets:raise ValueError('Không nằm trong danh sách bạn')
                store.db.execute('DELETE FROM friend_links WHERE a=? AND b=?',(min(me,target),max(me,target)))
        elif action in ('giveGift','receiveGift','giveGiftAll','receiveGiftAll','giveAndReceiveGiftAll'):
            selected=targets
            if action in ('giveGift','receiveGift'):
                target=integer(args.get('targetId'),'Nhân vật',1)
                if target not in targets:raise ValueError('Không nằm trong danh sách bạn')
                selected={target}
            notify_targets|=selected
            given=received=0;day=p['privateDay']
            for target in sorted(selected):
                if action in ('giveGift','giveGiftAll','giveAndReceiveGiftAll'):
                    given+=store.db.execute('INSERT OR IGNORE INTO friend_gifts VALUES(?,?,?,0)',(me,target,day)).rowcount
                if action in ('receiveGift','receiveGiftAll','giveAndReceiveGiftAll') and p['friend']['pointReceiveTimes']<config['CAN_RECEIVE_TIMES']:
                    changed=store.db.execute('UPDATE friend_gifts SET received=1 WHERE source=? AND target=? AND day=? AND received=0',(target,me,day)).rowcount
                    if changed:p['friend']['pointReceiveTimes']+=1;p['friend']['point']+=1;received+=1
            if action in ('giveGift','receiveGift') and not given and not received:raise ValueError('Quà đã xử lý, chưa được gửi hoặc đã hết lượt nhận')
            temp.update({'given':given,'received':received})
        elif action=='exchangeTicket':
            count=p['friend']['point']//config['POINT_TICKET_RATIO']
            if not count:raise ValueError('Chưa đủ điểm bạn bè')
            p['friend']['point']-=count*config['POINT_TICKET_RATIO']
            temp['entityCountMap']=add_reward(p,{'entityId':config['TICKET_ENTITY_ID'],'count':count,'extra':{}})
        refresh(store,p);store.save(p)
        for target in notify_targets:
            row=store.db.execute('SELECT account FROM players WHERE id=?',(target,)).fetchone()
            if row:
                other=store.player(row[0]);store.notify(row[0],'onSync',{'code':200,'friend':other['friend']})
        if action not in ('myFriendList','recommendList','requestAddFriendList','findTarget'):store.audit(action,{'player':me})
        result=delta(before,p,route,temp);result['friend']=p['friend']
        return result
