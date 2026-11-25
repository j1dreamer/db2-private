"""Daily guild war and a private weekly activity variant, with five source HP bars.

Pairing is private: eligible real guilds, nearest frozen roster power, odd bye.
Activity handler exists in this bundle without a scene/constants; shared rules
are explicitly private and do not claim that its missing UI has been restored.
"""
import copy,datetime,json,secrets,time
from .rules import constants
from .state import integer,snapshot,delta
from .battle import validate_team,build_team,simulate_async
from .social import public,profile_by_id
from .arena import combat_raw
from .adventure import grant
from .practice import notice
from . import guild
MODES=('newGuildBattle','activityGuildBattle');ZONE=datetime.timezone(datetime.timedelta(hours=7))
ROUTES={'logic.'+m+'Handler.'+a for m in MODES for a in ('openInfo','setDefenseTeamInfo','enter','choose','challenge','exit','result',('winTimesRank'if m=='newGuildBattle'else 'wintTimesRank'))}
def cfg():return constants('server.NEW_GUILD_BATTLE.CONSTS')
def times(day):
    start=datetime.datetime.combine(datetime.date.fromisoformat(day),datetime.time(),ZONE);c=cfg();opened=start+datetime.timedelta(hours=c['START_HOURS'],minutes=c['START_MINUTE']);return int((start+datetime.timedelta(hours=c['READY_HOURS'])).timestamp()),int(opened.timestamp()),int((opened+datetime.timedelta(minutes=c['DURATION_MINUTE'])).timestamp())
def date_for(mode):
    today=datetime.datetime.fromtimestamp(time.time(),ZONE).date()
    for offset in range(8):
        day=(today+datetime.timedelta(days=offset)).isoformat()
        if (mode=='newGuildBattle'or(datetime.date.fromisoformat(day).weekday()+1)%7==0)and time.time()<times(day)[2]:return day

def role_key(role):return {'chairman':'CHAIRMAN','vice':'VICE_CHAIRMAN','member':'MEMBER'}[role]
def member(store,p):
    row=store.db.execute('SELECT *FROM guild_members WHERE player=?',(p['id'],)).fetchone()
    if not row:raise ValueError('Cần gia nhập bang hội')
    return row

def defense(p,mode):
    setting=p.setdefault('privateGuildWarDefense',{}).get(mode,{})
    try:roles=validate_team(p,setting.get('roles'));ships=setting.get('ships',[]);build_team(p,roles,ships)
    except ValueError:roles=list(p['team']['roles'])[:5];ships=[];build_team(p,roles,ships)
    raw={'playerId':p['id'],'playerName':p['name'],'playerLevel':p['level'],'playerPhotoInfo':p['photoInfo'],'serverId':p['serverId'],'roles':[copy.deepcopy(p['team']['roles'][idx])for idx in roles],'ships':[copy.deepcopy(p['bag']['items'][str(idx)])for idx in ships]}
    return roles,list(map(str,ships)),raw

def load(store,mode,day,room_id):
    row=store.db.execute('SELECT data FROM guild_war_rooms WHERE mode=?AND day=?AND room=?',(mode,day,room_id)).fetchone();return json.loads(row[0])if row else None

def save_room(store,room):store.db.execute('INSERT INTO guild_war_rooms VALUES(?,?,?,?,?,?)ON CONFLICT(mode,day,room)DO UPDATE SET data=excluded.data',(room['mode'],room['day'],room['id'],room['guilds'][0],room['guilds'][1]if len(room['guilds'])>1 else 0,json.dumps(room)))
def room_for(store,mode,day,gid):
    if not store:return None
    row=store.db.execute('SELECT data FROM guild_war_rooms WHERE mode=?AND day=?AND(guild1=?OR guild2=?)',(mode,day,gid,gid)).fetchone();return json.loads(row[0])if row else None

def previous(store,mode,gid,day):
    row=store.db.execute('SELECT data FROM guild_war_rooms WHERE mode=?AND day<?AND(guild1=?OR guild2=?)ORDER BY day DESC LIMIT 1',(mode,day,gid,gid)).fetchone()if store else None;return json.loads(row[0])if row else None

def history(store,mode,gid):
    row=store.db.execute('SELECT wins,losses FROM guild_war_history WHERE mode=?AND guild=?',(mode,gid)).fetchone()if store else None;return (row['wins'],row['losses'])if row else (0,0)
def summary(store,room,gid):
    value=copy.deepcopy(room['sides'][str(gid)]);wins,losses=history(store,room['mode'],gid);value.update(winTimes=wins,loseTimes=losses);return value

def battle_info(store,room,p):
    entry=room['players'].get(str(p['id']))
    if not entry:return {'guildId':p.get('guildId',0),'map':{},'attackTimes':0,'maxAttackTimes':0}
    return {'guildId':entry['guild'],'map':{str(g):summary(store,room,g)for g in room['guilds']},'attackTimes':max(0,entry['maximum']-entry['used']),'maxAttackTimes':entry['maximum']}

def prior_result(store,room):
    if not room or not room['finished']:return None
    winner=room['winner'];loser=next((g for g in room['guilds']if g!=winner),0);bye={'guildId':0,'guildName':'Bye','guildLevel':0,'badgeId':1,'serverId':0,'memberCount':0,'score':0,'winTimes':0,'loseTimes':0,'positionInfoMap':{},'isBye':True}
    return {'win':summary(store,room,winner),'lose':summary(store,room,loser)if loser else bye}

def refresh(store,p):
    before=json.dumps(p,sort_keys=True)
    for mode in MODES:
        day=date_for(mode);ready,opened,end=times(day);own=store.db.execute('SELECT guild FROM guild_members WHERE player=?',(p['id'],)).fetchone()if store else None;gid=own['guild']if own else 0;room=room_for(store,mode,day,gid)if gid else None;entry=room['players'].get(str(p['id']))if room else None;roles,ships,_=defense(p,mode);prior=previous(store,mode,gid,day)if gid else None
        if room and room['finished']:prior=room
        info={'isReady':bool(gid and ready<=time.time()<opened),'isOpen':bool(entry and opened<=time.time()<end),'isHaveTarget':bool(room and len(room['guilds'])==2),'isEligible':bool(entry),'openTime':opened*1000,'defenseTeamInfo':{'teamIndexs':roles,'shipIndexs':ships},'preBattleResult':prior_result(store,prior)}
        p['extra'][mode]={'getOpenInfoTime':int(time.time()*1000),'openInfo':info,'battleInfo':battle_info(store,room,p)if room else {'guildId':gid,'map':{},'attackTimes':0,'maxAttackTimes':0}}
    return before!=json.dumps(p,sort_keys=True)

def notify_views(store,room):
    for entry in room['players'].values():
        p=profile_by_id(store,entry['id']);refresh(store,p);store.save(p);store.notify(entry['account'],'onSync',{'code':200,'extra':{room['mode']:p['extra'][room['mode']]}})

def create_day(store,mode,day):
    ready,opened,end=times(day)
    if not ready<=time.time()<end:return
    if store.db.execute('SELECT 1 FROM guild_war_days WHERE mode=?AND day=?',(mode,day)).fetchone():return
    rosters=[]
    for row in store.db.execute('SELECT id FROM guilds ORDER BY id').fetchall():
        g=guild.record(store,row['id']);members=store.db.execute('SELECT *FROM guild_members WHERE guild=?AND joined<=?ORDER BY CASE role WHEN ?THEN 0 WHEN ?THEN 1 ELSE 2 END,player',(g['id'],ready*1000,'chairman','vice')).fetchall()
        if len(members)<cfg()['NEED_MEMBER_COUNT']:continue
        players={};positions={};power=0
        for position,m in enumerate(members,1):
            p=profile_by_id(store,m['player']);roles,ships,raw=defense(p,mode);key=role_key(m['role']);maximum=cfg()['ATTACK_TIMES'][key];players[str(p['id'])]={'id':p['id'],'account':p['userId'],'guild':g['id'],'role':key,'position':position,'used':0,'maximum':maximum,'watching':False,'roles':roles,'ships':ships,'raw':raw};positions[str(position)]={'playerId':p['id'],'playerInfo':public(p),'star':0};power+=sum(r.get('power',0)for r in raw['roles'])
        side={'guildId':g['id'],'guildName':g['name'],'guildLevel':g['level'],'badgeId':g['badgeId'],'serverId':1,'memberCount':len(members),'score':sum(cfg()['ADD_SCORE'][e['role']]for e in players.values()),'positionInfoMap':positions}
        rosters.append({'id':g['id'],'players':players,'side':side,'power':power})
    rosters.sort(key=lambda g:(g['power'],g['id']));index=1
    while rosters:
        first=rosters.pop(0);second=rosters.pop(0)if rosters else None;items=[first]+([second]if second else []);room={'mode':mode,'day':day,'id':index,'guilds':[g['id']for g in items],'sides':{str(g['id']):g['side']for g in items},'players':{pid:e for g in items for pid,e in g['players'].items()},'locked':False,'finished':False,'winner':0}
        save_room(store,room);notify_views(store,room);index+=1
    store.db.execute('INSERT INTO guild_war_days VALUES(?,?)',(mode,day))

def lock_room(store,room):
    if room['locked']:return
    for entry in room['players'].values():
        p=profile_by_id(store,entry['id']);roles,ships,raw=defense(p,room['mode']);entry.update(roles=roles,ships=ships,raw=raw)
    room['locked']=True;save_room(store,room);notify_views(store,room)

def settle_room(store,room):
    if room['finished']:return
    winner=min(room['guilds'],key=lambda gid:(-room['sides'][str(gid)]['score'],gid));room['winner']=winner;room['finished']=True
    for gid in room['guilds']:
        win=gid==winner;store.db.execute('INSERT INTO guild_war_history VALUES(?,?,?,?)ON CONFLICT(mode,guild)DO UPDATE SET wins=wins+excluded.wins,losses=losses+excluded.losses',(room['mode'],gid,int(win),int(not win)))
    for entry in room['players'].values():
        key=(room['mode'],room['day'],entry['id'])
        if not store.db.execute('SELECT 1 FROM guild_war_awards WHERE mode=?AND day=?AND player=?',key).fetchone():
            p=profile_by_id(store,entry['id']);won=entry['guild']==winner;notice(store,p,'Private guild war',room['mode']+' '+room['day'],copy.deepcopy(cfg()['WIN_REWARD_DROP_LIST'if won else 'LOSE_REWARD_DROP_LIST']));store.save(p);store.db.execute('INSERT INTO guild_war_awards VALUES(?,?,?)',key)
        if entry['watching']and room['mode']=='newGuildBattle':store.notify(entry['account'],'onNewGuildBattle',{'isEnd':True})
        entry['watching']=False
    save_room(store,room);notify_views(store,room)

def prepare(store,mode):
    with store.transaction():
        create_day(store,mode,date_for(mode))
        for row in store.db.execute('SELECT day,room FROM guild_war_rooms WHERE mode=?ORDER BY day,room',(mode,)).fetchall():
            room=load(store,mode,row['day'],row['room']);ready,opened,end=times(room['day'])
            if time.time()>=opened:lock_room(store,room)
            if time.time()>=end:settle_room(store,room)

def admission(store,p,mode,allow_closed=False):
    own=member(store,p);day=date_for(mode);room=room_for(store,mode,day,own['guild']);entry=room['players'].get(str(p['id']))if room else None;ready,opened,end=times(day)
    if not allow_closed:
        if not entry:raise ValueError('Bang cần ít nhất 5 thành viên có mặt trước 16:00 và người chơi trong danh sách chốt')
        if entry['guild']!=own['guild']:raise ValueError('Bạn không còn thuộc bang đã đăng ký')
    return own,room,entry,(ready,opened,end)

def push_change(store,room,defender,star):
    for entry in room['players'].values():
        if not entry['watching']:continue
        if room['mode']=='newGuildBattle':store.notify(entry['account'],'onNewGuildBattle',{'guildId':defender['guild'],'location':defender['position'],'star':star})
        else:
            p=profile_by_id(store,entry['id']);refresh(store,p);store.save(p);store.notify(entry['account'],'onSync',{'code':200,'extra':{room['mode']:p['extra'][room['mode']]}})

async def challenge(store,account,mode,args):
    p=store.player(account);own,room,entry,(ready,opened,end)=admission(store,p,mode)
    if not opened<=time.time()<end:raise ValueError('Bang chiến chưa mở hoặc đã kết thúc')
    row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode)).fetchone()
    if not row or row['expires']<=time.time():raise ValueError('Lượt đánh không tồn tại hoặc hết hạn')
    run=json.loads(row['data']);died=integer(args.get('diedNum'),'Số vị trí không sống sót',0,5)
    if args.get('defenderId')!=run['target']:raise ValueError('Đối thủ không khớp lượt đã chốt')
    result=await simulate_async({'mode':'pvp','team':combat_raw(run['attack']),'defender':combat_raw(run['defense']),'seed':run['seed']})
    if died!=result['diedNum']:raise ValueError('Số vị trí còn sống không khớp engine')
    with store.transaction():
        p=store.player(account);before=snapshot(p);own,room,entry,(ready,opened,end)=admission(store,p,mode);current=store.db.execute('SELECT data FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode)).fetchone();target=room['players'].get(str(run['target']));position=room['sides'][str(target['guild'])]['positionInfoMap'][str(target['position'])]if target else None
        if not opened<=time.time()<end or not current or current[0]!=row['data']or not target or position['star']!=run['star']or room['day']!=run['day']or room['id']!=run['room']:raise ValueError('Vị trí hoặc lượt đánh đã thay đổi')
        gained=min(5-position['star'],5-died)if result['isWin']else 0;position['star']+=gained;room['sides'][str(target['guild'])]['score']-=gained*cfg()['REDUCE_STAR_SCORE'][target['role']];entry['wins']=entry.get('wins',0)+int(result['isWin']);entry['losses']=entry.get('losses',0)+int(not result['isWin']);rewards=grant(p,copy.deepcopy(cfg()['ATTACK_WIN_REWARD_DROP_LIST'if result['isWin']else 'ATTACK_LOSE_REWARD_DROP_LIST']));rid=secrets.token_hex(12);report={'id':rid,'type':mode,'ctime':int(time.time()*1000),'attackTeam':run['attack'],'defenseTeam':run['defense'],'seed':run['seed'],'isWin':result['isWin'],'diedNum':died,'damageMap':result['damageMap'],'bgImgId':constants('battle.GUILD_BATTLE_IMG_IDS')[0],'gained':gained}
        store.db.execute('INSERT INTO battle_reports VALUES(?,?,?,?,?)',(rid,mode,p['id'],target['id'],json.dumps(report)));store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode));save_room(store,room);refresh(store,p);store.save(p);push_change(store,room,target,position['star']);store.audit('guild_war_battle',{'player':p['id'],'mode':mode,'target':target['id'],'gained':gained});return delta(before,p,'logic.'+mode+'Handler.challenge',{'entityCountMap':rewards,'attackTimes':entry['maximum']-entry['used'],'star':position['star'],'isWin':result['isWin'],'reportId':rid})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Bang chiến không tồn tại')
    _,handler,action=route.split('.');mode=handler.removesuffix('Handler');prepare(store,mode)
    if action=='challenge':return await challenge(store,account,mode,args)
    if action=='exit':
        with store.transaction():
            p=store.player(account);before=snapshot(p);ref=p.setdefault('privateGuildWarViews',{}).pop(mode,None)
            if ref:
                room=load(store,mode,ref['day'],ref['room']);entry=room['players'].get(str(p['id']))if room else None
                if entry:entry['watching']=False;save_room(store,room)
            store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode));refresh(store,p);store.save(p);return delta(before,p,route,{'withdrawn':True})

    with store.transaction():
        p=store.player(account);before=snapshot(p);own,room,entry,(ready,opened,end)=admission(store,p,mode,action in ('openInfo','setDefenseTeamInfo','exit','result','winTimesRank','wintTimesRank'));temp={}
        if action=='openInfo':
            count=store.db.execute('SELECT count(*)FROM guild_members WHERE guild=?',(own['guild'],)).fetchone()[0]
            if not room and count<cfg()['NEED_MEMBER_COUNT']:raise ValueError('Bang chiến cần ít nhất 5 thành viên')
        elif action=='setDefenseTeamInfo':
            if not ready<=time.time()<opened:raise ValueError('Chỉ được chỉnh đội trong giờ chuẩn bị 16:00–19:00')
            if not entry:raise ValueError('Không trong danh sách bang chiến đã chốt')
            roles=validate_team(p,args.get('teamIndexs'));ship_input=args.get('shipIndexs',[]);build_team(p,roles,ship_input);p.setdefault('privateGuildWarDefense',{})[mode]={'roles':roles,'ships':list(map(str,ship_input))};roles,ships,raw=defense(p,mode);entry.update(roles=roles,ships=ships,raw=raw);save_room(store,room)
        elif action=='enter':
            if not opened<=time.time()<end or len(room['guilds'])<2:raise ValueError('Chưa mở hoặc không có đối thủ; thưởng miễn đấu gửi khi kết thúc')
            entry['watching']=True;p.setdefault('privateGuildWarViews',{})[mode]={'day':room['day'],'room':room['id']};save_room(store,room);temp['battleInfo']=battle_info(store,room,p)
        elif action=='exit':
            if room and entry:entry['watching']=False;save_room(store,room)
            store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode))
        elif action=='choose':
            if not opened<=time.time()<end or len(room['guilds'])<2:raise ValueError('Bang chiến chưa mở hoặc không có đối thủ')
            target_id=integer(args.get('defenderId'),'Đối thủ',1);target=room['players'].get(str(target_id))
            if not target or target['guild']==entry['guild']:raise ValueError('Không được đánh người cùng bang hoặc ngoài trận')
            star=room['sides'][str(target['guild'])]['positionInfoMap'][str(target['position'])]['star']
            if star>=5:raise ValueError('Vị trí đã hết HP')
            roles=validate_team(p,args.get('attackTeamIndexs'));ship_input=args.get('attackShipIndexs',[]);build_team(p,roles,ship_input);ships=list(map(str,ship_input));old=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode)).fetchone();run=json.loads(old['data'])if old and old['expires']>time.time()else None
            if not run or (run['target'],run['roles'],run['ships'],run['day'],run['star'])!=(target_id,roles,ships,room['day'],star):
                if entry['used']>=entry['maximum']:raise ValueError('Đã hết lượt đánh bang chiến')
                attack={'playerId':p['id'],'playerName':p['name'],'playerLevel':p['level'],'playerPhotoInfo':p['photoInfo'],'roles':[copy.deepcopy(p['team']['roles'][idx])for idx in roles],'ships':[copy.deepcopy(p['bag']['items'][idx])for idx in ships]};run={'day':room['day'],'room':room['id'],'target':target_id,'roles':roles,'ships':ships,'attack':attack,'defense':target['raw'],'star':star,'seed':secrets.randbelow(2**31-1)+1};entry['used']+=1;store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],mode,json.dumps(run),min(end,int(time.time())+900)));save_room(store,room)
            temp.update(attackTeam=run['attack'],defenseTeam=run['defense'],seed=run['seed'],attackTimes=entry['maximum']-entry['used'])
        elif action=='result':
            source=room or previous(store,mode,own['guild'],date_for(mode));infos={str(g):summary(store,source,g)for g in source['guilds']}if source else {};result_entry=source['players'].get(str(p['id']))if source else None;temp['result']={'infoMap':infos,'attackTimes':result_entry['maximum']-result_entry['used']if result_entry else 0,'maxAttackTimes':result_entry['maximum']if result_entry else 0}
        elif action in ('winTimesRank','wintTimesRank'):
            rows=store.db.execute('SELECT guild,wins,losses FROM guild_war_history WHERE mode=?ORDER BY wins DESC,losses,guild LIMIT 100',(mode,)).fetchall();ranked=[]
            for i,row in enumerate(rows,1):
                try:g=guild.record(store,row['guild'])
                except ValueError:continue
                ranked.append({'guildId':g['id'],'guildName':g['name'],'guildLevel':g['level'],'badgeId':g['badgeId'],'serverId':1,'rank':len(ranked)+1,'value':row['wins'],'winTimes':row['wins'],'loseTimes':row['losses']})
            temp['list']=ranked
        refresh(store,p);store.save(p)
        if action=='openInfo':temp['openInfo']=p['extra'][mode]['openInfo']
        store.audit('guild_war_'+action,{'player':p['id'],'mode':mode});result=delta(before,p,route,temp);result['extra']={**result.get('extra',{}),mode:p['extra'][mode]};return result
