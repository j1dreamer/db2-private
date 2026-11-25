"""Three owned teams, bracket ladders, best-of-three replay and statue rewards."""
import copy,json,secrets,time
from . import arena
from .profile import character,table
from .inventory import entity,active
from .state import integer,snapshot,delta,consume,vip_data
from .rules import constants
from .battle import validate_team,build_team,simulate_async
from .social import public,profile_by_id
from .adventure import grant
ROUTES={'logic.arena3v3Handler.'+name for name in ('info','match','setDefenseTeamIndexsMap','buyChallengeTimes','defenseTeam','choose','challenge','reportList','receive','worshipStatue','top50','worshipRank')}
MODE='arena3v3'

def bracket(level):
    cfg=constants('server.ARENA_3V3.CONSTS');index=max([i for i,value in enumerate(cfg['LEVEL_BETWEEN'])if level>=value]+[0]);return cfg['LEVEL_TYPE_BETWEEN'][index]

def validate_maps(p,roles,ships):
    if not isinstance(roles,dict)or set(roles)!={'1','2','3'}or not isinstance(ships,dict)or set(ships)-{'1','2','3'}:raise ValueError('Cần ba đội hình hợp lệ')
    normalized={};ship_map={};used=set();used_ships=set()
    for key in ('1','2','3'):
        team=validate_team(p,roles[key]);fleet=ships.get(key,[]);build_team(p,team,fleet)
        if used.intersection(team)or used_ships.intersection(map(str,fleet)):raise ValueError('Chiến binh hoặc đồng hành không được ở hai đội')
        used.update(team);used_ships.update(map(str,fleet));normalized[key]=team;ship_map[key]=list(map(str,fleet))
    return normalized,ship_map

def raw_multi(p,roles=None,ships=None):
    own=p['arena3v3'];roles=roles if roles is not None else own['defenseTeamIndexsMap'];ships=ships if ships is not None else own['defenseShipIndexsMap']
    try:roles,ships=validate_maps(p,roles,ships)
    except ValueError:
        if len(p['team']['roles'])<3:raise ValueError('Đối thủ không còn đủ ba chiến binh')
        roles={str(i+1):[key]for i,key in enumerate(list(p['team']['roles'])[:3])};ships={key:[]for key in roles}
    return {'playerId':p['id'],'playerName':p['name'],'playerLevel':p['level'],'playerPhotoInfo':p['photoInfo'],'rolesMap':{key:[copy.deepcopy(p['team']['roles'][str(i)])for i in values]for key,values in roles.items()},'shipsMap':{key:[copy.deepcopy(p['bag']['items'][str(i)])for i in ships.get(key,[])]for key in roles}}

def round_team(raw,key):return arena.combat_raw({'playerId':raw['playerId'],'roles':raw['rolesMap'][key],'ships':raw['shipsMap'][key]})

def seed_ladders(store):
    cfg=constants('server.ARENA_3V3.CONSTS')
    for index,level_type in enumerate(cfg['LEVEL_TYPE_BETWEEN']):
        if store.db.execute('SELECT 1 FROM multi_ladder WHERE mode=? AND bracket=? LIMIT 1',(MODE,level_type)).fetchone():continue
        for position in range(1,21):
            p=arena.npc(position);p['id']=-200000-(index+1)*100-position;p['name']='Trio '+str(index+1)+'-'+str(position);template=p['team']['roles']['1'];roles={}
            for slot,kind in enumerate((100106,100806,101106),1):
                role=character(kind,slot);role.update(level=template['level'],power=template['power'],attr=copy.deepcopy(template['attr']),initAttr=copy.deepcopy(template['initAttr']));row=entity(kind);role['skills']={str(k):{'kindId':k,'level':9}for k in row['skillIds'][:2]};roles[str(slot)]=role
            p['team']['roles']=roles;p['power']*=3;p['arena3v3']={'defenseTeamIndexsMap':{key:[key]for key in roles},'defenseShipIndexsMap':{key:[]for key in roles}}
            store.db.execute('INSERT INTO multi_ladder VALUES(?,?,?,?,?,?)',(MODE,level_type,p['id'],position,'npc',json.dumps(p)))

def participant(store,pid,level_type=None):
    row=store.db.execute('SELECT * FROM multi_ladder WHERE mode=?AND player=?'+('AND bracket=?'if level_type else '')+'ORDER BY rank LIMIT 1',(MODE,pid,level_type)if level_type else (MODE,pid)).fetchone()
    if not row:raise ValueError('Đối thủ không có trong bảng đấu')
    p=json.loads(row['data'])if row['source']=='npc'else profile_by_id(store,pid)
    return p,row['rank'],row['bracket']

def hour_coin(rank):return next(r['hourCoin']for r in table('arenaRewards')if r['rankBetween'][0]<=rank<=r['rankBetween'][1])

def accrue(p):
    now=int(time.time()*1000);last=p.get('private3v3CoinClock',now);elapsed=max(0,now-last);hours=min(24,elapsed//3600000)
    if hours:p['arena3v3']['receiveCoin']=p['arena3v3'].get('receiveCoin',0)+hours*p['arena3v3'].get('hourCoin',0)
    p['private3v3CoinClock']=now-elapsed%3600000 if elapsed//3600000>24 else last+hours*3600000

def refresh(store,p):
    row=store.db.execute('SELECT rank FROM multi_ladder WHERE mode=?AND bracket=?AND player=?',(MODE,bracket(p['level']),p['id'])).fetchone()
    if not row:
        prior=store.db.execute('SELECT 1 FROM multi_ladder WHERE mode=?AND player=?AND source=?',(MODE,p['id'],'player')).fetchone()
        if prior and p['level']>=40 and len(p['team']['roles'])>=3:ensure(store,p);return True
        return False
    before=json.dumps(p,sort_keys=True);accrue(p);p['arena3v3']['rank']=row['rank'];p['arena3v3']['hourCoin']=hour_coin(row['rank'])
    return before!=json.dumps(p,sort_keys=True)

def ensure(store,p):
    cfg=constants('server.ARENA_3V3.CONSTS')
    if p['level']<cfg['REQUIRED_LEVEL']:raise ValueError('Cần cấp đội 40 để mở đấu ba đội')
    if len(p['team']['roles'])<3:raise ValueError('Cần ít nhất ba chiến binh khác nhau')
    seed_ladders(store);own=p['arena3v3'];keys=list(p['team']['roles']);default={str(i+1):[key]for i,key in enumerate(keys[:3])}
    p['vip'].setdefault('buy3v3ChallengeTimesTimes',0);p['vip'].setdefault('worshipStatue3v3Times',0)
    try:roles,ships=validate_maps(p,own.get('defenseTeamIndexsMap'),own.get('defenseShipIndexsMap',{}))
    except ValueError:roles=default;ships={key:[]for key in default}
    own.update(defenseTeamIndexsMap=roles,defenseShipIndexsMap=ships)
    level_type=bracket(p['level']);row=store.db.execute('SELECT rank FROM multi_ladder WHERE mode=? AND bracket=? AND player=?',(MODE,level_type,p['id'])).fetchone()
    if not row:
        accrue(p);store.db.execute('DELETE FROM multi_ladder WHERE mode=?AND player=?AND source=?',(MODE,p['id'],'player'));rank=store.db.execute('SELECT max(rank)FROM multi_ladder WHERE mode=?AND bracket=?',(MODE,level_type)).fetchone()[0]+1;store.db.execute('INSERT INTO multi_ladder VALUES(?,?,?,?,?,?)',(MODE,level_type,p['id'],rank,'player','{}'));own['rank']=rank;p['private3v3CoinClock']=int(time.time()*1000)
    own.setdefault('receiveCoin',0);own['maxChallengeTimes']=cfg['FREE_TIMES']+p['vip'].get('buy3v3ChallengeTimesTimes',0);p.setdefault('worshipStatue3v3Map',{})
    refresh(store,p);tops={}
    for level in cfg['LEVEL_TYPE_BETWEEN']:
        leader=store.db.execute('SELECT player FROM multi_ladder WHERE mode=? AND bracket=? ORDER BY rank LIMIT 1',(MODE,level)).fetchone();other,rank,_=participant(store,leader['player'],level);tops[level]=public(other)
    own['playerInfoMap']=tops;store.save(p)

def choose(store,account,args):
    target=integer(args.get('defenderId'),'Đối thủ',-10**9,10**9)
    with store.transaction():
        p=store.player(account);before=snapshot(p);ensure(store,p);roles,ships=validate_maps(p,args.get('attackTeamIndexsMap'),args.get('attackShipIndexsMap',{}));level=bracket(p['level'])
        if target==p['id']:raise ValueError('Không thể tự thách đấu')
        previous=store.db.execute('SELECT * FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone()
        if previous and previous['expires']>time.time():
            run=json.loads(previous['data'])
            if run['target']==target and run['roles']==roles and run['ships']==ships:return delta(before,p,'logic.arena3v3Handler.choose',{'attackTeam':run['attack'],'defenseTeam':run['defense'],'seed':run['seed']})
        if p['arena3v3']['remainingChallengeTimes']<=0:raise ValueError('Đã hết lượt thách đấu')
        other,rank,level=participant(store,target,level);attack=raw_multi(p,roles,ships);defense=raw_multi(other);seed=secrets.randbelow(2**31-1)+1;run={'target':target,'roles':roles,'ships':ships,'attack':attack,'defense':defense,'seed':seed,'bracket':level}
        p['arena3v3']['remainingChallengeTimes']-=1;store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],MODE,json.dumps(run),int(time.time())+900));store.save(p)
        return delta(before,p,'logic.arena3v3Handler.choose',{'attackTeam':attack,'defenseTeam':defense,'seed':seed})

async def replay(run):
    pairs=[{'key':key,'team':round_team(run['attack'],key),'defender':round_team(run['defense'],key)}for key in ('1','2','3')]
    result=await simulate_async({'mode':'bestOfThree','pairs':pairs,'seed':run['seed']})
    win_map={row['key']:run['attack']['playerId']if row['isWin']else run['defense']['playerId']for row in result['rounds']};damage={row['key']:row['damageMap']for row in result['rounds']}
    return result['isWin'],win_map,damage

async def challenge(store,account,args):
    p=store.player(account);row=store.db.execute('SELECT * FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone()
    if not row or row['expires']<=time.time():raise ValueError('Trận đấu không tồn tại hoặc đã hết hạn')
    run=json.loads(row['data']);roles,ships=validate_maps(p,args.get('attackTeamIndexsMap'),args.get('attackShipIndexsMap',{}));seed=integer(args.get('seed'),'Seed',1,2**31-1);background=integer(args.get('bgImgId'),'Hình nền',1,100000)
    if background not in constants('battle.ARENA_BACKGROUND_IMG_IDS')or roles!=run['roles']or ships!=run['ships']or args.get('defenderId')!=run['target']or seed!=run['seed']or type(args.get('isWin'))is not bool:raise ValueError('Thông tin ba trận không khớp')
    is_win,win_map,damage=await replay(run)
    if args['isWin']!=is_win or args.get('winPlayerIdMap')!=win_map:raise ValueError('Kết quả từng đội không khớp engine')
    with store.transaction():
        current=store.db.execute('SELECT data FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone()
        if not current or current['data']!=row['data']:raise ValueError('Trận đấu đã được nhận hoặc thay đổi')
        p=store.player(account);before=snapshot(p);ensure(store,p);level=run['bracket']
        if bracket(p['level'])!=level:raise ValueError('Nhân vật đã đổi bảng cấp độ')
        other,rank,_=participant(store,run['target'],level);old=p['arena3v3']['rank'];up=0
        if is_win and rank<old:
            store.db.execute('UPDATE multi_ladder SET rank=0 WHERE mode=?AND bracket=?AND player=?',(MODE,level,p['id']));store.db.execute('UPDATE multi_ladder SET rank=?WHERE mode=?AND bracket=?AND player=?',(old,MODE,level,other['id']));store.db.execute('UPDATE multi_ladder SET rank=?WHERE mode=?AND bracket=?AND player=?',(rank,MODE,level,p['id']));p['arena3v3']['rank']=rank;up=old-rank
            if other['id']>0:other['arena3v3']['rank']=old;store.save(other);store.notify(other['userId'],'onSync',{'code':200,'arena3v3':other['arena3v3']})
        p['arena3v3']['hourCoin']=hour_coin(p['arena3v3']['rank']);rid=secrets.token_hex(12);report={'id':rid,'type':MODE,'ctime':int(time.time()*1000),'attackerId':p['id'],'attackTeam':run['attack'],'defenseTeam':run['defense'],'seed':seed,'isWin':is_win,'winPlayerIdMap':win_map,'damageMapMap':damage,'bgImgId':background,'up':up}
        store.db.execute('INSERT INTO battle_reports VALUES(?,?,?,?,?)',(rid,MODE,p['id'],other['id'],json.dumps(report)));store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE));store.save(p);store.audit('arena3v3_challenge',{'player':p['id'],'isWin':is_win})
        return delta(before,p,'logic.arena3v3Handler.challenge',{'rank':p['arena3v3']['rank'],'reportId':rid})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác ba đội không tồn tại')
    if not store.player(account):raise ValueError('Chưa có nhân vật')
    action=route.rsplit('.',1)[-1]
    if action=='choose':return choose(store,account,args)
    if action=='challenge':return await challenge(store,account,args)
    with store.transaction():
        p=store.player(account);before=snapshot(p);ensure(store,p);own=p['arena3v3'];level=bracket(p['level']);temp={}
        if action=='setDefenseTeamIndexsMap':
            roles,ships=validate_maps(p,args.get('defenseTeamIndexsMap'),args.get('defenseShipIndexsMap',{}));own.update(defenseTeamIndexsMap=roles,defenseShipIndexsMap=ships)
        elif action=='buyChallengeTimes':
            count=p['vip'].get('buy3v3ChallengeTimesTimes',0)
            if own['remainingChallengeTimes']or count>=vip_data(p)['buy3v3ChallengeTimesTimes']:raise ValueError('Chưa cần mua hoặc đã hết lượt VIP')
            costs=constants('server.ARENA_3V3.CONSTS.BUY_CHALLENGE_TIMES');consume(p,102,costs[min(count+1,len(costs)-1)]);p['vip']['buy3v3ChallengeTimesTimes']=count+1;own['remainingChallengeTimes']+=1;own['maxChallengeTimes']+=1
        elif action=='match':
            rows=store.db.execute('SELECT player,rank FROM multi_ladder WHERE mode=?AND bracket=?AND player<>?ORDER BY rank',(MODE,level,p['id'])).fetchall();selected=[]
            for target in (max(1,own['rank']//2),max(1,own['rank']-2),own['rank']+2):
                row=min((row for row in rows if row['player']not in selected),key=lambda row:abs(row['rank']-target));selected.append(row['player'])
            for key,target in zip(('smaller','middle','larger'),selected):
                other,rank,_=participant(store,target,level);temp[key]={**public(other),'rank':rank,'totalPower':other['power']}
        elif action=='defenseTeam':
            other,rank,_=participant(store,integer(args.get('playerId'),'Đối thủ',-10**9,10**9));temp['defenseTeam']=raw_multi(other)
        elif action=='receive':
            count=own['receiveCoin']
            if count<=0:raise ValueError('Chưa tích lũy đủ phần thưởng')
            temp['entityCountMap']=grant(p,[{'entityId':106,'count':count,'extra':{}}]);own['receiveCoin']=0
        elif action=='worshipStatue':
            selected=args.get('levelType')
            if selected not in constants('server.ARENA_3V3.CONSTS.LEVEL_TYPE_BETWEEN'):raise ValueError('Bảng cấp không hợp lệ')
            champion=own['playerInfoMap'][selected]
            if champion['playerId']<0:raise ValueError('Chưa có người chơi giữ tượng tại bảng này')
            if p['worshipStatue3v3Map'].get(selected)or p['vip'].get('worshipStatue3v3Times',0)>=vip_data(p)['worshipStatue3v3Times']:raise ValueError('Đã dùng lượt chiêm bái hôm nay')
            amount=20000
            for threshold,value in zip((22,40,60,70,80,90),(20000,40000,50000,60000,70000,80000)):
                if p['level']>threshold:amount=value
            temp['entityCountMap']=grant(p,[{'entityId':101,'count':amount,'extra':{}}]);p['worshipStatue3v3Map'][selected]=True;p['vip']['worshipStatue3v3Times']=p['vip'].get('worshipStatue3v3Times',0)+1
            store.db.execute('INSERT INTO worship_counts VALUES(?,?,1)ON CONFLICT(mode,player)DO UPDATE SET value=value+1',(MODE,champion['playerId']))
        elif action=='top50':
            selected=args.get('levelType')
            if selected not in constants('server.ARENA_3V3.CONSTS.LEVEL_TYPE_BETWEEN'):raise ValueError('Bảng cấp không hợp lệ')
            rows=store.db.execute('SELECT player,rank FROM multi_ladder WHERE mode=?AND bracket=?ORDER BY rank LIMIT 50',(MODE,selected)).fetchall();temp['list']=[{**public(participant(store,row['player'],selected)[0]),'rank':row['rank'],'value':row['rank']}for row in rows]
        elif action=='worshipRank':
            rows=store.db.execute('SELECT player,value FROM worship_counts WHERE mode=?ORDER BY value DESC,player LIMIT 50',(MODE,)).fetchall();temp['list']=[{**public(profile_by_id(store,row['player'])),'rank':i+1,'value':row['value']}for i,row in enumerate(rows)]
        elif action=='reportList':
            rows=store.db.execute('SELECT * FROM battle_reports WHERE mode=?AND(attacker=?OR defender=?)ORDER BY rowid DESC LIMIT 50',(MODE,p['id'],p['id'])).fetchall();logs=[]
            for row in rows:
                report=json.loads(row['data']);is_attacker=row['attacker']==p['id'];logs.append({'id':row['id'],'ctime':report['ctime'],'isAttacker':is_attacker,'isWin':report['isWin']if is_attacker else not report['isWin'],'up':report['up']if is_attacker else -report['up'],'is3v3':True,'playerInfo':report['defenseTeam']if is_attacker else report['attackTeam']})
            temp['reportList']=logs
        store.save(p);return delta(before,p,route,temp)
