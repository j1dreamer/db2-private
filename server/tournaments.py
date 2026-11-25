"""Worship and themed Double tournaments with original team restrictions/rewards.

Private matchmaking/schedule: weekly local roster, maximum 32 per level bracket,
seeded by a fixed season random key; vacant slots are byes, never NPC entrants.
All fights execute the recovered PvP engine. Delayed rounds settle on next access.
"""
import asyncio,copy,datetime,hashlib,json,secrets,time,weakref
from .profile import table
from .state import integer,snapshot,delta,consume
from .rules import constants
from .battle import validate_team,build_team,simulate_async
from .social import public,profile_by_id
from .adventure import grant
from .arena import combat_raw
from .practice import notice
ROUTES={'logic.'+mode+'Handler.'+action for mode in ('worshipBattle','doubleBattle')for action in ('apply','battleInfo','bet','getChampionTeam','getMyTeam','getTeam','openInfo','worshipRank','worshipStatue')}
ZONE=datetime.timezone(datetime.timedelta(hours=7));_locks=weakref.WeakKeyDictionary();_pending=weakref.WeakKeyDictionary();SETTLE_WAIT=3

def cfg(mode):return constants('server.'+('WORSHIP_BATTLE'if mode=='worshipBattle'else 'DOUBLE_BATTLE')+'.CONSTS')
def level_type(mode,level):
    c=cfg(mode);i=max([i for i,x in enumerate(c['LEVEL_BETWEEN'])if level>=x]+[0]);return c['LEVEL_TYPE_BETWEEN'][i]
def clock():
    now=datetime.datetime.fromtimestamp(time.time(),ZONE);day=now.replace(hour=0,minute=0,second=0,microsecond=0);start=day-datetime.timedelta(days=(day.weekday()+1)%7)
    return start.date().isoformat(),int(start.timestamp()),now.date().isoformat()
def due(start):return [start+3*86400+20*3600,start+4*86400+20*3600,start+5*86400+20*3600,start+6*86400+20*3600,start+6*86400+20*3600]
def status(start):
    now=time.time()
    if now<start+3*86400:return 2
    if now<due(start)[0]:return 3
    if now<due(start)[1]:return 4
    if now<due(start)[2]:return 5
    if now<due(start)[3]:return 6
    return 1

def empty_info():return {'playerId':0,'playerName':'Bye','playerLevel':0,'serverId':1,'playerPhotoInfo':{'photoImgId':1001,'shipImgId':901},'power':0}
def room_status(room):
    # Expose only stages whose required group data has committed already.
    if not room.get('finished')and time.time()>=due(room['start'])[0]:return (3,4,5,6,6)[room.get('phase',0)]
    return status(room['start'])
def slot(room,pid):return {'id':pid,'attr':copy.deepcopy(room['entries'][str(pid)]['public'])if pid else empty_info()}

def create_room(mode,theme):
    season,start,_=clock();return {'mode':mode,'theme':theme,'season':season,'start':start,'seed':secrets.token_hex(16),'phase':0,'seeded':False,'finished':False,'entries':{},'groups':{},'champions':{},'bets':{}}

def load(store,mode,theme,season=None,create=True):
    season=season or clock()[0];row=store.db.execute('SELECT data FROM tournament_rooms WHERE mode=?AND theme=?AND season=?',(mode,theme,season)).fetchone()
    if row:return json.loads(row[0])
    if not create:return None
    room=create_room(mode,theme);save_room(store,room);return room

def save_room(store,room):
    store.db.execute('INSERT INTO tournament_rooms VALUES(?,?,?,?)ON CONFLICT(mode,theme,season)DO UPDATE SET data=excluded.data',(room['mode'],room['theme'],room['season'],json.dumps(room)))

def previous(store,mode,theme,season):
    if not store:return None
    row=store.db.execute('SELECT data FROM tournament_rooms WHERE mode=?AND theme=?AND season<? ORDER BY season DESC LIMIT 1',(mode,theme,season)).fetchone();return json.loads(row[0])if row else None

def champion_catalog(store,mode,theme):
    if not store:return {}
    return {row['level']:json.loads(row['data'])for row in store.db.execute('SELECT level,data FROM tournament_champions WHERE mode=?AND theme=?',(mode,theme))}

def battle_info(room,pid,prior):
    c=cfg(room['mode']);info={'status':room_status(room),'isApply':str(pid)in room['entries'],'pre8PlayerIdsMap':{},'championIdMap':room['champions'],'betTargetIdMap':room['bets'].get(str(pid),{}),'betTargetCountMap':{}}
    for size in (32,16,8,4,2):info['be'+str(size)+'GroupInfoMap']={}
    for level in c['LEVEL_TYPE_BETWEEN']:
        stages=room['groups'].get(level,[])
        for index,groups in enumerate(stages):info['be'+str((32,16,8,4,2)[index])+'GroupInfoMap'][level]=groups
        info['pre8PlayerIdsMap'][level]=[]
        if prior:
            groups=prior.get('groups',{}).get(level,[])
            if len(groups)>2:info['pre8PlayerIdsMap'][level]=[s['id']for group in groups[2].values()for s in group['players']if s['id']]
    for bets in room['bets'].values():
        for target in bets.values():info['betTargetCountMap'][str(target)]=info['betTargetCountMap'].get(str(target),0)+1
    return info

def refresh(store,p):
    before=json.dumps(p,sort_keys=True);season,start,day=clock();private=p.setdefault('privateTournaments',{})
    if private.get('day')!=day:private['day']=day;p['worshipStatueExtMap']={};p['worshipStatueDoubleMap']={str(i):{}for i in range(1,6)}
    for mode in ('worshipBattle','doubleBattle'):
        infos=[]
        for theme in range(1,6)if mode=='doubleBattle'else (0,):
            room=load(store,mode,theme,create=False)if store else None;room=room or {'mode':mode,'start':start,'entries':{},'groups':{},'champions':{},'bets':{}}
            prior=previous(store,mode,theme,season);champions={level:entry['public']for level,entry in champion_catalog(store,mode,theme).items()}
            info={'openInfo':{'status':room_status(room),'isApply':str(p['id'])in room['entries'],'openTime':start*1000,'endTime':(start+7*86400)*1000},'playerInfoMap':champions,'battleInfo':battle_info(room,p['id'],prior)}
            if mode=='doubleBattle':infos.append(info)
            else:p['extra'][mode]=info
        if mode=='doubleBattle':
            selected=private.get('theme',1);p['extra'][mode]={'infos':infos,'battleInfo':infos[selected-1]['battleInfo']}
    return before!=json.dumps(p,sort_keys=True)

def selected(mode,args):
    return integer(args.get('themeNo'),'Chủ đề giải',1,5)if mode=='doubleBattle'else 0

def teams(p,mode,theme,roles,ships):
    count=3 if mode=='doubleBattle'else 5;keys={str(i)for i in range(1,count+1)}
    if not isinstance(roles,dict)or set(roles)!=keys or not isinstance(ships,dict)or set(ships)-keys:raise ValueError('Cần đủ '+str(count)+' đội hình')
    normalized={};fleets={};used=set();used_ships=set();role_data={r['kindId']:r for r in table('role')}
    allowed=cfg(mode)['THEME_ROLE_CLASS_IDS_MAP'][str(theme)]if mode=='doubleBattle'else None
    for key in sorted(keys):
        own=validate_team(p,roles[key],2 if mode=='doubleBattle'else 5);fleet=ships.get(key,[]);build_team(p,own,fleet)
        if used.intersection(own)or used_ships.intersection(map(str,fleet)):raise ValueError('Không dùng chiến binh/đồng hành trong hai đội')
        if allowed and any(role_data[p['team']['roles'][idx]['kindId']]['classId']not in allowed for idx in own):raise ValueError('Chiến binh không thuộc chủ đề giải')
        normalized[key]=own;fleets[key]=list(map(str,fleet));used.update(own);used_ships.update(fleets[key])
    raw={**public(p),'playerId':p['id'],'playerName':p['name'],'playerLevel':p['level'],'playerPhotoInfo':p['photoInfo'],'rolesMap':{key:[copy.deepcopy(p['team']['roles'][idx])for idx in ids]for key,ids in normalized.items()},'shipsMap':{key:[copy.deepcopy(p['bag']['items'][idx])for idx in fleets[key]]for key in normalized}}
    return normalized,fleets,raw

def award(store,room,pid,stage,rewards):
    if not pid:return
    args=(room['mode'],room['theme'],room['season'],pid,stage)
    if store.db.execute('SELECT 1 FROM tournament_awards WHERE mode=?AND theme=?AND season=?AND player=?AND stage=?',args).fetchone():return
    p=profile_by_id(store,pid);notice(store,p,'Private '+room['mode'],stage+' — '+room['season'],copy.deepcopy(rewards));store.save(p);store.db.execute('INSERT INTO tournament_awards VALUES(?,?,?,?,?)',args)

def seed_room(store,room):
    c=cfg(room['mode'])
    for level in c['LEVEL_TYPE_BETWEEN']:
        entrants=[int(pid)for pid,e in room['entries'].items()if e['level']==level];entrants.sort(key=lambda pid:hashlib.sha256((room['seed']+':'+str(pid)).encode()).digest());slots=[0]*32
        for i,pid in enumerate(entrants):
            position=int(f'{i:05b}'[::-1],2);slots[position]=pid;award(store,room,pid,'BE_32',c['BE_32_REWARD_DROP_LIST'])
        if entrants:room['groups'][level]=[{str(i+1):{'players':[slot(room,slots[2*i]),slot(room,slots[2*i+1])],'winPlayerId':0,'reportId':None}for i in range(16)}]
    room['seeded']=True;save_room(store,room)

async def play(room,a,b,seed):
    left=room['entries'][str(a)]['raw'];right=room['entries'][str(b)]['raw'];pairs=[]
    for key in sorted(left['rolesMap']):pairs.append({'key':key,'team':combat_raw({'playerId':a,'roles':left['rolesMap'][key],'ships':left['shipsMap'][key]}),'defender':combat_raw({'playerId':b,'roles':right['rolesMap'][key],'ships':right['shipsMap'][key]})})
    result=await simulate_async({'mode':'series','pairs':pairs,'seed':seed})
    return {'id':secrets.token_hex(12),'type':room['mode'],'ctime':int(time.time()*1000),'attackerId':a,'attackTeam':left,'defenseTeam':right,'seed':seed,'isWin':result['isWin'],'winPlayerIdMap':{r['key']:a if r['isWin']else b for r in result['rounds']},'damageMapMap':{r['key']:r['damageMap']for r in result['rounds']},'bgImgId':101,'publicTournament':True}

async def settle(store,mode,theme):
    locks=_locks.setdefault(store,{})
    async with locks.setdefault((mode,theme),asyncio.Lock()):
        load(store,mode,theme)
        rows=store.db.execute('SELECT season FROM tournament_rooms WHERE mode=?AND theme=?ORDER BY season',(mode,theme)).fetchall()
        for row in rows:
            room=load(store,mode,theme,row['season']);deadlines=due(room['start'])
            if room['finished']or time.time()<deadlines[0]:continue
            if not room['seeded']:
                with store.transaction():seed_room(store,room)
            while room['phase']<5 and time.time()>=deadlines[room['phase']]:
                phase=room['phase'];reports=[]
                for level,stages in room['groups'].items():
                    for key,group in stages[phase].items():
                        a,b=[s['id']for s in group['players']]
                        if a and b:
                            seed=int.from_bytes(hashlib.sha256(f"{room['seed']}:{level}:{phase}:{key}".encode()).digest()[:4],'big')%(2**31-1)+1;report=await play(room,a,b,seed);reports.append(report);group.update(winPlayerId=a if report['isWin']else b,reportId=report['id'])
                        else:group['winPlayerId']=a or b
                    winners=[g['winPlayerId']for g in stages[phase].values()]
                    if phase<4:stages.append({str(i+1):{'players':[slot(room,winners[2*i]),slot(room,winners[2*i+1])],'winPlayerId':0,'reportId':None}for i in range(len(winners)//2)})
                    else:room['champions'][level]=winners[0]
                with store.transaction():
                    # Bets may have been committed by another request while a
                    # worker was running. Never replace them with an old copy.
                    room['bets']=load(store,mode,theme,room['season'])['bets']
                    for report in reports:store.db.execute('INSERT INTO battle_reports VALUES(?,?,?,?,?)',(report['id'],mode,report['attackTeam']['playerId'],report['defenseTeam']['playerId'],json.dumps(report)))
                    for level,stages in room['groups'].items():
                        winners=[g['winPlayerId']for g in stages[phase].values()if g['winPlayerId']];stage=['BE_16','BE_8','BE_4',None,'CHAMPION'][phase]
                        if stage:
                            reward=cfg(mode)['CHAMPION_DROP_LIST'if stage=='CHAMPION'else stage+'_REWARD_DROP_LIST']
                            for pid in winners:
                                rewards=copy.deepcopy(reward)
                                if stage=='CHAMPION':
                                    index=cfg(mode)['LEVEL_TYPE_BETWEEN'].index(level);title=cfg(mode)['THEME_TITLE_ITEM_IDS'][str(theme)][index]if mode=='doubleBattle'else cfg(mode)['TITLE_ITEM_IDS'][index];rewards.append({'entityId':title,'count':1,'extra':{}})
                                award(store,room,pid,stage,rewards)
                    room['phase']+=1;room['finished']=room['phase']==5
                    if room['finished']:
                        for level,winner in room['champions'].items():
                            if winner:store.db.execute('INSERT INTO tournament_champions VALUES(?,?,?,?,?,?)ON CONFLICT(mode,theme,level)DO UPDATE SET player=excluded.player,data=excluded.data,season=excluded.season WHERE excluded.season>=tournament_champions.season',(mode,theme,level,winner,json.dumps(room['entries'][str(winner)]),room['season']))
                        for pid,bets in room['bets'].items():
                            for level,target in bets.items():
                                if room['champions'].get(level)==target:award(store,room,int(pid),'BET:'+level,[{'entityId':102,'count':cfg(mode)['BET_COST_GEM']*cfg(mode)['BET_WIN_GET_X'],'extra':{}}])
                    save_room(store,room)

def worship_reward(mode,level):
    index=0
    for i,threshold in enumerate((22,40,60,70,80,90)):
        if level>threshold:index=i
    choices=[(101,10000),(101,20000),(102,8),(102,10),(109,1),(109,2)]if mode=='doubleBattle'else [(101,20000),(101,40000),(116,3),(116,4),(116,5),(116,6)]
    kind,n=choices[index];return [{'entityId':kind,'count':n,'extra':{}}]

async def prepare(store,mode,themes):
    tasks=[];registry=_pending.setdefault(store,{})
    for theme in themes:
        task=registry.get((mode,theme))
        if task is None or task.done():
            task=asyncio.create_task(settle(store,mode,theme));registry[(mode,theme)]=task
            task.add_done_callback(lambda t:None if t.cancelled()else t.exception())
        tasks.append(task)
    done,pending=await asyncio.wait(tasks,timeout=SETTLE_WAIT)
    errors=[str(t.exception())for t in done if not t.cancelled()and t.exception()]
    return bool(pending),errors

async def close(store):
    tasks=list(_pending.pop(store,{}).values())
    for task in tasks:
        if not task.done():task.cancel()
    if tasks:await asyncio.gather(*tasks,return_exceptions=True)
    _locks.pop(store,None)

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Giải đấu không tồn tại')
    _,handler,action=route.split('.');mode=handler.removesuffix('Handler');theme=selected(mode,args)if mode=='doubleBattle'and action!='openInfo'else 0
    pending,errors=await prepare(store,mode,range(1,6)if mode=='doubleBattle'and action=='openInfo'else (theme,))
    with store.transaction():
        p=store.player(account);before=snapshot(p);season,start,day=clock();room=load(store,mode,theme)if theme or mode=='worshipBattle'else None;temp={'settlementPending':pending,'settlementErrors':errors}
        if p['level']<cfg(mode)['LEVEL_BETWEEN'][0]:raise ValueError('Cần cấp đội 61 để mở giải')
        if mode=='doubleBattle'and theme:p['privateTournaments']['theme']=theme
        if action=='apply':
            if status(start)!=2:raise ValueError('Đã hết thời gian đăng ký')
            indices,fleets,raw=teams(p,mode,theme,args.get('teamIndexsMap'),args.get('shipIndexsMap',{}));level=level_type(mode,p['level']);entry=room['entries'].get(str(p['id']))
            if entry:
                if entry['indices']!=indices or entry['fleets']!=fleets:raise ValueError('Đội đã chốt trong mùa này')
            else:
                if sum(e['level']==level for e in room['entries'].values())>=32:raise ValueError('Bảng đấu đã đủ 32 người')
                room['entries'][str(p['id'])]={'indices':indices,'fleets':fleets,'raw':raw,'public':public(p),'level':level};temp['entityCountMap']=grant(p,copy.deepcopy(cfg(mode)['APPLY_REWARD_DROP_LIST']));save_room(store,room)
        elif action=='bet':
            level=args.get('type');target=integer(args.get('targetId'),'Người dự đoán',1)
            if level not in cfg(mode)['LEVEL_TYPE_BETWEEN']or not due(start)[1]<=time.time()<due(start)[2]:raise ValueError('Chưa mở hoặc đã khóa dự đoán')
            stages=room['groups'].get(level,[]);eligible=[s['id']for g in stages[2].values()for s in g['players']if s['id']]if len(stages)>2 else []
            if target not in eligible:raise ValueError('Người chơi không có trong tám vị trí vòng này')
            bets=room['bets'].setdefault(str(p['id']),{})
            if level in bets:raise ValueError('Đã dự đoán cho bảng này')
            consume(p,102,cfg(mode)['BET_COST_GEM']);bets[level]=target;save_room(store,room)
        elif action in ('getTeam','getMyTeam','getChampionTeam'):
            target=p['id']if action=='getMyTeam'else args.get('targetId');source=room
            if action=='getChampionTeam':
                level=args.get('levelType')
                if level not in cfg(mode)['LEVEL_TYPE_BETWEEN']:raise ValueError('Bảng cấp không hợp lệ')
                champion=champion_catalog(store,mode,theme).get(level)
                if not champion:raise ValueError('Bảng này chưa có nhà vô địch')
                temp['team']=champion['raw'];target=champion['raw']['playerId']
            integer(target,'Đội dự giải',1)
            if action!='getChampionTeam':
                if not source or str(target)not in source['entries']:source=previous(store,mode,theme,season)
                if not source or str(target)not in source['entries']:raise ValueError('Đội dự giải không tồn tại')
                temp['team']=source['entries'][str(target)]['raw']
        elif action=='worshipStatue':
            level=args.get('levelType')
            if level not in cfg(mode)['LEVEL_TYPE_BETWEEN']:raise ValueError('Bảng cấp không hợp lệ')
            champion_info=champion_catalog(store,mode,theme).get(level);champion=champion_info['raw']['playerId']if champion_info else None
            if not champion:raise ValueError('Bảng này chưa có nhà vô địch')
            key=(mode,theme,day,p['id'],level)
            if store.db.execute('SELECT 1 FROM tournament_worship WHERE mode=?AND theme=?AND day=?AND player=?AND level=?',key).fetchone():raise ValueError('Đã cổ vũ bảng này hôm nay')
            store.db.execute('INSERT INTO tournament_worship VALUES(?,?,?,?,?,?)',(*key,champion));temp['entityCountMap']=grant(p,worship_reward(mode,p['level']))
        elif action=='worshipRank':
            rows=store.db.execute('SELECT champion,count(*)AS n FROM tournament_worship WHERE mode=?AND theme=?GROUP BY champion ORDER BY n DESC,champion LIMIT 100',(mode,theme)).fetchall();ranking=[]
            for i,row in enumerate(rows):
                try:other=profile_by_id(store,row['champion'])
                except ValueError:continue
                ranking.append({**public(other),'rank':i+1,'value':row['n']})
            own=next((r for r in ranking if r['playerId']==p['id']),{});temp.update(list=ranking,myRank=own.get('rank',0),myValue=own.get('value',0))
        refresh(store,p)
        # Daily worship marks come from SQL, independent of profile cache/reset.
        for row in store.db.execute('SELECT theme,level FROM tournament_worship WHERE mode=?AND day=?AND player=?',(mode,day,p['id'])):
            target=p['worshipStatueDoubleMap'][str(row['theme'])]if mode=='doubleBattle'else p['worshipStatueExtMap'];target[row['level']]=True
        store.save(p);store.audit('tournament_'+action,{'player':p['id'],'mode':mode,'theme':theme})
        if action=='battleInfo':temp['battleInfo']=p['extra'][mode]['battleInfo']
        result=delta(before,p,route,temp);result['extra']={**result.get('extra',{}),mode:p['extra'][mode]};return result
