"""Persistent guild membership, delegated permissions and source contribution costs."""
import copy,json,time,datetime,secrets
from .profile import table
from .state import integer,snapshot,delta,consume
from .rules import constants
from .social import public,profile_by_id
from .gameplay import drops
from .adventure import grant
from .progression import friendships
ROUTES={'logic.guildHandler.'+name for name in ('info','create','list','applyJoin','worship','receiveWorshipAward','modifySetting','handleApply','modifyNotice','inherit','dismiss','addViceChairman','removeViceChairman','changeChairman','exit','openBox','drum','upgradeSkill')}

def config():return constants('server.GUILD.CONSTS')

def empty():
    return {'id':0,'name':'','badgeId':1,'chairmanId':0,'chairmanName':'','viceChairmanIds':[],'notice':'','level':1,'activePoint':0,'members':[],'maxMemberCount':config()['MAX_MEMBER_COUNTS'][1],'applyInfoMap':{},'applyPlayerList':[],'giveActivePointMap':{},'logList':[],'openBoxTimes':0,'openBoxSoulIds':config()['OPEN_BOX_SOUL_IDS'],'drumTimes':0,'beWorshipTimes':0,'beWorshipAwardCoin':0,'joinRequireType':2,'joinLevelLimit':18}

def name(value):
    if not isinstance(value,str)or not value.strip()or len(value.strip().encode('utf-16-le',errors='surrogatepass'))//2>16 or any(ord(c)<32 for c in value)or '<'in value or '>'in value:raise ValueError('Tên bang hội cần 1–16 ký tự hợp lệ')
    return value.strip()

def record(store,gid):
    row=store.db.execute('SELECT * FROM guilds WHERE id=?',(gid,)).fetchone()
    if not row:raise ValueError('Bang hội không tồn tại')
    data=json.loads(row['data']);data.update(id=row['id'],name=row['name']);return data

def member(store,pid,gid=None):
    row=store.db.execute('SELECT * FROM guild_members WHERE player=?',(pid,)).fetchone()
    if not row or gid is not None and row['guild']!=gid:raise ValueError('Nhân vật không thuộc bang hội')
    return row

def daily(row,day):
    data=json.loads(row['data'])
    if data.get('day')!=day:data.update(day=day,openBoxTimes=0,drumTimes=0,worshipTimes=0,sharedDrumMails=0)
    return data

def save_member(store,pid,data):store.db.execute('UPDATE guild_members SET data=?WHERE player=?',(json.dumps(data),pid))
def save_guild(store,g):store.db.execute('UPDATE guilds SET name=?,data=?WHERE id=?',(g['name'],json.dumps(g),g['id']))

def refresh(store,p):
    old_gid=p.get('guildId',0)
    before=json.dumps({'guild':p.get('guild'),'guildId':p.get('guildId'),'guildName':p.get('guildName'),'guildLevel':p.get('guildLevel')},sort_keys=True)
    row=store.db.execute('SELECT *FROM guild_members WHERE player=?',(p['id'],)).fetchone();view=empty()
    if row:
        g=record(store,row['guild']);rows=store.db.execute('SELECT *FROM guild_members WHERE guild=?ORDER BY joined,player',(g['id'],)).fetchall();own=daily(row,p['privateDay']);save_member(store,p['id'],own)
        profiles={r['player']:profile_by_id(store,r['player'])for r in rows};profiles[p['id']]=p;chair=next((r for r in rows if r['role']=='chairman'),None)
        if not chair:raise ValueError('Bang hội thiếu chủ bang; cần quản trị sửa dữ liệu')
        applications=store.db.execute('SELECT player FROM guild_requests WHERE guild=?ORDER BY created,player',(g['id'],)).fetchall()
        view.update(g);view.update(chairmanId=chair['player'],chairmanName=profiles[chair['player']]['name'],viceChairmanIds=[r['player']for r in rows if r['role']=='vice'],members=[public(profiles[r['player']])for r in rows],maxMemberCount=config()['MAX_MEMBER_COUNTS'][g['level']],applyPlayerList=[public(profile_by_id(store,r['player']))for r in applications],giveActivePointMap={str(r['player']):r['contribution']for r in rows})
        view.update({key:own.get(key,0)for key in ('openBoxTimes','drumTimes','beWorshipTimes','beWorshipAwardCoin')})
    p['guild']=view;p['guildId']=view['id'];p['guildName']=view['name'];p['guildLevel']=view['level']if row else 0
    if old_gid!=p['guildId']:
        from .chat import load
        load(store,p)
    pending=store.db.execute('SELECT guild FROM guild_requests WHERE player=?',(p['id'],)).fetchall();view['applyInfoMap']={str(r['guild']):{'status':1}for r in pending}
    return before!=json.dumps({'guild':p['guild'],'guildId':p['guildId'],'guildName':p['guildName'],'guildLevel':p['guildLevel']},sort_keys=True)

def push_members(store,gid,except_account=None,extra_ids=()):
    ids={row['player']for row in store.db.execute('SELECT player FROM guild_members WHERE guild=?',(gid,))}|set(extra_ids)
    for pid in ids:
        p=profile_by_id(store,pid)
        if p['userId']==except_account:continue
        from .state import refresh_time
        old_gid=p.get('guildId',0);refresh_time(p);refresh(store,p);store.save(p);body={'code':200,**{key:p[key]for key in ('guildId','guildName','guildLevel','guild')}}
        if old_gid!=p['guildId']:body['extra']={'chat':p['extra']['chat']}
        store.notify(p['userId'],'onSync',body)

def authority(row,chair=False):
    if row['role']not in (('chairman',)if chair else ('chairman','vice')):raise ValueError('Chưa đủ quyền quản lý bang hội')

def log(g,p,text):g.setdefault('logList',[]).append({'playerId':p['id'],'playerName':p['name'],'ctime':int(time.time()*1000),'msg':text});g['logList']=g['logList'][-100:]

def contribute(store,g,p,points):
    g['activePoint']+=points;levels=config()['LEVEL_NEED_EXPS']
    while g['level']<10 and g['activePoint']>=levels[g['level']+1]:g['level']+=1
    store.db.execute('UPDATE guild_members SET contribution=contribution+?WHERE player=?',(points,p['id']))

def join(store,g,p):
    if p['level']<g['joinLevelLimit']:raise ValueError('Chưa đủ cấp gia nhập')
    if store.db.execute('SELECT 1 FROM guild_members WHERE player=?',(p['id'],)).fetchone():raise ValueError('Nhân vật đã có bang hội')
    count=store.db.execute('SELECT count(*)FROM guild_members WHERE guild=?',(g['id'],)).fetchone()[0]
    if count>=config()['MAX_MEMBER_COUNTS'][g['level']]:raise ValueError('Bang hội đã đủ thành viên')
    week=datetime.date.fromisoformat(p['privateDay']).isocalendar()[:2];key=str(week[0])+'-'+str(week[1]);history=p.setdefault('privateGuildJoins',{})
    if history.get('week')!=key:history.update(week=key,count=0)
    if history.get('count',0)>=config()['A_WEEK_JOIN_TIMES']:raise ValueError('Đã hết lượt đổi bang hội trong tuần')
    history['count']+=1;store.db.execute('INSERT INTO guild_members VALUES(?,?,?,?,?,?)',(p['id'],g['id'],'member',int(time.time()*1000),0,'{}'));store.db.execute('DELETE FROM guild_requests WHERE player=?',(p['id'],));store.save(p);log(g,p,'Joined the guild')

def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác bang hội không tồn tại')
    action=route.rsplit('.',1)[-1]
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        if p['level']<constants('client.CONSTS.UNLOCK_LEVEL.GUILD'):raise ValueError('Bang hội mở từ cấp 18')
        before=snapshot(p);temp={};gid=p['guildId'];g=record(store,gid)if gid else None;own=member(store,p['id'],gid)if gid else None;cfg=config();removed=[]
        if action=='list':
            rows=store.db.execute('SELECT id FROM guilds ORDER BY id').fetchall();values=[]
            for row in rows:
                guild=record(store,row['id']);count=store.db.execute('SELECT count(*)FROM guild_members WHERE guild=?',(guild['id'],)).fetchone()[0];leader=store.db.execute("SELECT player FROM guild_members WHERE guild=?AND role='chairman'",(guild['id'],)).fetchone()
                if not leader:continue
                values.append({**guild,'menberCount':count,'maxMemberCount':cfg['MAX_MEMBER_COUNTS'][guild['level']],'chairmanName':profile_by_id(store,leader['player'])['name']})
            values.sort(key=lambda v:(-v['level'],-v['activePoint'],v['id']));temp['list']=[{**value,'rank':i+1}for i,value in enumerate(values[:100])]
        elif action=='create':
            if gid:raise ValueError('Đã có bang hội')
            title=name(args.get('name'));badge=integer(args.get('badgeId'),'Huy hiệu',1,15)
            if store.db.execute('SELECT 1 FROM guilds WHERE lower(name)=lower(?)',(title,)).fetchone():raise ValueError('Tên bang hội đã được sử dụng')
            consume(p,102,cfg['CREATE_COST_GEM']);g={**empty(),'name':title,'badgeId':badge};g.pop('id');cur=store.db.execute('INSERT INTO guilds(name,data)VALUES(?,?)',(title,json.dumps(g)));g['id']=cur.lastrowid;gid=g['id'];join(store,g,p);store.db.execute("UPDATE guild_members SET role='chairman'WHERE player=?",(p['id'],));log(g,p,'Founded the guild')
        elif action=='applyJoin':
            if gid:raise ValueError('Hãy rời bang hội hiện tại trước')
            g=record(store,integer(args.get('guildId'),'Bang hội',1));gid=g['id']
            if g['joinRequireType']==3 or p['level']<g['joinLevelLimit']:raise ValueError('Không đủ điều kiện gia nhập')
            if g['joinRequireType']==1:join(store,g,p)
            else:
                if store.db.execute('SELECT 1 FROM guild_requests WHERE guild=?AND player=?',(gid,p['id'])).fetchone():raise ValueError('Đã gửi đơn gia nhập')
                if store.db.execute('SELECT count(*)FROM guild_requests WHERE player=?',(p['id'],)).fetchone()[0]>=10:raise ValueError('Chỉ được chờ tối đa 10 đơn')
                store.db.execute('INSERT INTO guild_requests VALUES(?,?,?)',(gid,p['id'],int(time.time()*1000)))
        elif action=='info':refresh(store,p)
        else:
            if not g:raise ValueError('Chưa gia nhập bang hội')
            data=daily(own,p['privateDay'])
            if action=='modifySetting':
                authority(own);badge=integer(args.get('badgeId'),'Huy hiệu',1,15);title=name(args.get('guildName'));require=integer(args.get('joinRequireType'),'Kiểu gia nhập',1,3);limit=integer(args.get('joinLevelLimit'),'Cấp tối thiểu',1,100)
                if title!=g['name']:
                    authority(own,True);week=datetime.date.fromisoformat(p['privateDay']).isocalendar()[:2];key=str(week)
                    if g.get('renameWeek')==key:raise ValueError('Mỗi tuần chỉ đổi tên một lần')
                    if store.db.execute('SELECT 1 FROM guilds WHERE lower(name)=lower(?)AND id<>?',(title,gid)).fetchone():raise ValueError('Tên bang hội đã dùng')
                    g.update(name=title,renameWeek=key)
                g.update(badgeId=badge,joinRequireType=require,joinLevelLimit=limit);log(g,p,'Updated guild settings')
            elif action=='modifyNotice':
                authority(own);notice=args.get('notice')
                if not isinstance(notice,str)or len(notice)>300 or '<'in notice or '>'in notice or any(ord(c)<32 and c!='\n'for c in notice):raise ValueError('Thông báo bang hội không hợp lệ')
                g['notice']=notice;log(g,p,'Updated guild notice')
            elif action=='handleApply':
                authority(own);target=integer(args.get('targetId'),'Người xin vào',1);agree=args.get('isAgree')
                if type(agree)is not bool:raise ValueError('Lựa chọn phê duyệt không hợp lệ')
                if not store.db.execute('SELECT 1 FROM guild_requests WHERE guild=?AND player=?',(gid,target)).fetchone():raise ValueError('Đơn xin không tồn tại')
                other=profile_by_id(store,target)
                if agree:
                    from .state import refresh_time
                    refresh_time(other);join(store,g,other)
                store.db.execute('DELETE FROM guild_requests WHERE guild=?AND player=?',(gid,target));removed.append(target)
            elif action in ('addViceChairman','removeViceChairman','changeChairman','exit'):
                target=integer(args.get('targetId'),'Thành viên',1);other=member(store,target,gid)
                if action=='exit':
                    if target!=p['id']:
                        authority(own)
                        if other['role']=='chairman'or own['role']=='vice'and other['role']=='vice':raise ValueError('Không thể loại thành viên có quyền này')
                    elif own['role']=='chairman':raise ValueError('Hãy chuyển chủ bang hoặc giải tán trước')
                    store.db.execute('DELETE FROM guild_members WHERE player=?',(target,));removed.append(target);log(g,p,'Removed guild member '+str(target))
                else:
                    authority(own,True)
                    if target==p['id']or other['role']=='chairman':raise ValueError('Không thể tự đổi chức vụ này')
                    if action=='addViceChairman':
                        if other['role']!='member'or store.db.execute("SELECT count(*)FROM guild_members WHERE guild=?AND role='vice'",(gid,)).fetchone()[0]>=cfg['VICE_CHAIRMAN_COUNT_LIMIT']:raise ValueError('Không thể bổ nhiệm thêm phó bang')
                        role='vice'
                    elif action=='removeViceChairman':
                        if other['role']!='vice':raise ValueError('Thành viên không phải phó bang')
                        role='member'
                    else:store.db.execute("UPDATE guild_members SET role='member'WHERE player=?",(p['id'],));role='chairman'
                    store.db.execute('UPDATE guild_members SET role=?WHERE player=?',(role,target));log(g,p,'Updated leadership for '+str(target))
            elif action=='inherit':
                leader=store.db.execute("SELECT player FROM guild_members WHERE guild=?AND role='chairman'",(gid,)).fetchone();other=profile_by_id(store,leader['player']);days=cfg['CHAIRMAN_EXPIRE_DAYS']if own['role']=='vice'else cfg['MEMBER_CHAIRMAN_EXPIRE_DAYS']
                if own['role']=='chairman'or time.time()*1000-other.get('atime',other['ctime'])<days*86400000:raise ValueError('Chủ bang chưa vắng đủ ngày để kế nhiệm')
                store.db.execute("UPDATE guild_members SET role='member'WHERE player=?",(other['id'],));store.db.execute("UPDATE guild_members SET role='chairman'WHERE player=?",(p['id'],));log(g,p,'Inherited guild leadership')
            elif action=='dismiss':
                authority(own,True);removed=[r[0]for r in store.db.execute('SELECT player FROM guild_members WHERE guild=?',(gid,))];store.db.execute('DELETE FROM guild_requests WHERE guild=?',(gid,));store.db.execute('DELETE FROM guild_members WHERE guild=?',(gid,));store.db.execute('DELETE FROM guilds WHERE id=?',(gid,));g=None
            elif action=='worship':
                target=integer(args.get('targetId'),'Người được chiêm bái',1);kind=integer(args.get('worshipType'),'Kiểu chiêm bái',1,3);target_row=member(store,target,gid);other=profile_by_id(store,target)
                if target==p['id']or not (other['level']>p['level']or target_row['role']in ('chairman','vice')):raise ValueError('Mục tiêu chiêm bái không hợp lệ')
                if data.get('worshipTimes',0)>=1:raise ValueError('Đã chiêm bái hôm nay')
                if kind==2:consume(p,101,cfg['WORSHIP_COIN_COST'])
                elif kind==3:consume(p,102,cfg['WORSHIP_GEM_COST'])
                p['actionPoint']+=cfg['WORSHIP_GET_ACTION_POINT_MAP'][str(kind)];points=cfg['WORSHIP_GET_ACTIVE_POINT_MAP'][str(kind)];contribute(store,g,p,points);data['worshipTimes']=1;receiver=daily(target_row,p['privateDay']);receiver['beWorshipTimes']=receiver.get('beWorshipTimes',0)+1;receiver['beWorshipAwardCoin']=receiver.get('beWorshipAwardCoin',0)+cfg['WORSHIP_AWARD_COIN'];save_member(store,target,receiver)
            elif action=='receiveWorshipAward':
                amount=data.get('beWorshipAwardCoin',0)
                if not amount:raise ValueError('Chưa có thưởng chiêm bái để nhận')
                temp['entityCountMap']=grant(p,[{'entityId':101,'count':amount,'extra':{}}]);data.update(beWorshipTimes=0,beWorshipAwardCoin=0)
            elif action=='openBox':
                index=data.get('openBoxTimes',0)+1
                if index>cfg['OPEN_BOX_TIMES']:raise ValueError('Đã hết lượt mở rương bang hội')
                consume(p,102,cfg['OPEN_BOX_COST_GEMS'][index]);rewards=drops(cfg['OPEN_BOX_FREE_CLASS_ID'])if index==1 else [{'entityId':kind,'count':cfg['OPEN_BOX_SOUL_COUNTS'][index],'extra':{}}for kind in cfg['OPEN_BOX_SOUL_IDS']]
                rewards.append({'entityId':100,'count':cfg['OPEN_BOX_GET_EXPS'][index],'extra':{}});temp['entityCountMap']=grant(p,rewards);contribute(store,g,p,cfg['OPEN_BOX_GET_GUILD_ACTIVE_POINTS'][index]);data['openBoxTimes']=index
            elif action=='drum':
                kind=integer(args.get('type'),'Kiểu đóng góp',1,3)
                if data.get('drumTimes',0)>=cfg['DRUM_TIMES']:raise ValueError('Đã đóng góp hôm nay')
                consume(p,101,cfg['DRUM_TYPE_1_COST_COIN']if kind==1 else 0);consume(p,102,cfg['DRUM_COST_GEM_MAP'][str(kind)]);points=cfg['DRUM_GET_GUILD_ACTIVE_POINT_MAP'][str(kind)];contribute(store,g,p,points);temp['entityCountMap']=grant(p,[{'entityId':107,'count':cfg['DRUM_GET_GUILD_COIN_MAP'][str(kind)],'extra':{}}]);data['drumTimes']=1
                rewards=cfg['DRUM_SEND_REWARD_MAP'].get(str(kind))
                if rewards:
                    rows=store.db.execute('SELECT *FROM guild_members WHERE guild=?',(gid,)).fetchall()
                    for target_row in rows:
                        recipient=data if target_row['player']==p['id']else daily(target_row,p['privateDay'])
                        if recipient.get('sharedDrumMails',0)>=cfg['DRUM_MAX_SHARE_TIMES']:continue
                        target=p if target_row['player']==p['id']else profile_by_id(store,target_row['player']);mail={'_id':secrets.token_hex(12),'senderId':0,'senderName':g['name'],'title':'Guild contribution reward','body':p['name']+' contributed to the guild.','status':1,'isSys':True,'dropList':rewards,'ctime':int(time.time()*1000)};target['extra']['mails'].append(mail);recipient['sharedDrumMails']=recipient.get('sharedDrumMails',0)+1;save_member(store,target_row['player'],recipient)
                        if target['id']!=p['id']:store.save(target)
                        store.notify(target['userId'],'onNewMail',{'mail':mail})
                log(g,p,'Contributed to the guild')
            elif action=='upgradeSkill':
                typ=args.get('type')
                if typ not in cfg['UNLOCK_MAX_SKILL_LEVEL_MAP']:raise ValueError('Kỹ năng bang hội không hợp lệ')
                skill=p.setdefault('guildSkill',{'levelMap':{key:0 for key in cfg['UNLOCK_MAX_SKILL_LEVEL_MAP']},'attr':{'hp':0,'atk':0,'def':0,'mdef':0}});level=skill['levelMap'][typ]
                if level>=cfg['UNLOCK_MAX_SKILL_LEVEL_MAP'][typ][str(g['level'])]:raise ValueError('Kỹ năng đã đạt giới hạn cấp bang')
                consume(p,cfg['UPGRADE_COST_ID'],cfg['UPGRADE_SKILL_COST']);skill['levelMap'][typ]=level+1;skill['attr'][typ.lower()]=(level+1)*cfg['SKILL_'+typ+'_GROWTH'];friendships(p)
            save_member(store,p['id'],data)
        if g:
            leader=store.db.execute("SELECT player FROM guild_members WHERE guild=?AND role='chairman'",(gid,)).fetchone()
            if leader:g['chairmanId']=leader['player'];g['chairmanName']=p['name']if leader['player']==p['id']else profile_by_id(store,leader['player'])['name']
            save_guild(store,g)
        refresh(store,p);store.save(p)
        if action not in ('info','list'):
            push_members(store,gid,account,removed);store.audit('guild_worship'if action=='worship'else 'guild_'+action,{'player':p['id'],'guild':gid,'target':args.get('targetId')})
        result=delta(before,p,route,temp)
        # The original scene clears its guild object on exit and appends an
        # accepted member locally. Return a complete authoritative view so that
        # unchanged template fields are also restored on a later join.
        result.update(guildId=p['guildId'],guildName=p['guildName'],guildLevel=p['guildLevel'],guild=p['guild'],guildSkill=p['guildSkill'])
        return result
