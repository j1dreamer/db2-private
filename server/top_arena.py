"""Private Top 3v3 scoring/seat league using recovered constants and PvP replay.

The shipped bundle contains its RPCs/selector but no Top league scene. DTOs beyond
those consumers are explicit private API data; this is not a claim of a built UI.
"""
import copy,datetime,json,secrets,time
from .rules import constants
from .state import integer,snapshot,delta,consume,stack_count
from .arena3v3 import validate_maps,raw_multi,round_team
from . import arena
from .profile import character,table
from .battle import simulate_async
from .social import public,profile_by_id
from .adventure import grant
from .item_actions import description
from .practice import notice
ROUTES={'logic.topArena3v3Handler.'+a for a in ('info','match','setDefenseTeamIndexsMap','defenseTeam','choose','challenge','reportList','buyMatchTimes','receiveFirstReachReward','challengeTopNull','challengeTop')}
MODE='topArena3v3';ZONE=datetime.timezone(datetime.timedelta(hours=7))
def cfg():return constants('server.TOP_ARENA_3V3.CONSTS')
def season():
    c=cfg();origin=int(datetime.datetime.fromisoformat(c['FIRST_OPEN_TIME']).replace(tzinfo=ZONE).timestamp());cycle=(c['RESET_DAYS']+c['DELAY_DAYS'])*86400;number=max(0,int((time.time()-origin)//cycle));start=origin+number*cycle;end=start+(c['RESET_DAYS']-1)*86400+c['SETTLEMENT_REWARD_HOURS']*3600
    return number,start,end,start+cycle

def tier(score):return max(i+1 for i,x in enumerate(cfg()['SCORE_BETWEEN'])if score>=x)

def refresh(p):
    old=json.dumps(p,sort_keys=True);number,start,end,nxt=season();own=p.setdefault(MODE,{});private=p.setdefault('privateTopArena',{});day=datetime.datetime.fromtimestamp(time.time(),ZONE).date().isoformat()
    private.setdefault('receivedTiers',[]);private.setdefault('maxTier',1)
    if private.get('season')!=number:private.update(season=number,matched={});own.update(score=0,scoreType=1,joined=False)
    if private.get('day')!=day:private.update(day=day,bought=0,topAttempts=0);own['remainingMatchTimes']=cfg()['FREE_TIMES']
    own.update(scoreType=tier(own.get('score',0)),remainingTopChallengeTimes=max(0,cfg()['TOP_CHALLENGE_TIMES']-private['topAttempts']),buyMatchTimesTimes=private['bought'],isOpen=start<=time.time()<end,season=number,startTime=start*1000,endTime=end*1000,nextOpenTime=nxt*1000)
    private['maxTier']=max(private['maxTier'],own['scoreType']);own['firstReachReceivedTypes']=list(private['receivedTiers']);own['firstReachType']=private['maxTier'];p.setdefault('rankScores',{})[MODE+'_score']=own['score']
    return old!=json.dumps(p,sort_keys=True)

def ensure(p):
    if p['level']<cfg()['REQUIRED_LEVEL']:raise ValueError('Đấu trường đỉnh cao cần cấp 40')
    if len(p['team']['roles'])<3:raise ValueError('Cần ít nhất ba chiến binh cho ba đội')
    refresh(p);own=p[MODE];default={str(i+1):[key]for i,key in enumerate(list(p['team']['roles'])[:3])}
    try:roles,ships=validate_maps(p,own.get('defenseTeamIndexsMap'),own.get('defenseShipIndexsMap',{}))
    except ValueError:roles=default;ships={key:[]for key in default}
    own.update(defenseTeamIndexsMap=roles,defenseShipIndexsMap=ships,joined=True)

def raw(p):return raw_multi(p,p[MODE]['defenseTeamIndexsMap'],p[MODE]['defenseShipIndexsMap'])
def admit(p):
    if not p[MODE]['isOpen']:raise ValueError('Mùa đấu đã đóng, chờ mùa tiếp theo')

def sparring(pid):
    if pid not in (-700001,-700002,-700003):raise ValueError('Đối thủ luyện tập không tồn tại')
    p=arena.npc(18+(-pid-700001));template=p['team']['roles']['1'];p.update(id=pid,name='Private trio '+str(-pid-700000));roles={}
    for i,kind in enumerate((100106,100806,101106),1):
        r=character(kind,i);r.update(level=template['level'],star=template['star'],power=template['power'],attr=copy.deepcopy(template['attr']),initAttr=copy.deepcopy(template['initAttr']));data=next(x for x in table('role')if x['kindId']==kind);r['skills']={str(k):{'kindId':k,'level':1}for k in data['skillIds'][:1]};roles[str(i)]=r
    p['team']['roles']=roles;p['arena3v3']={};p[MODE]={'defenseTeamIndexsMap':{key:[key]for key in roles},'defenseShipIndexsMap':{key:[]for key in roles},'score':0};return p

def opponent(store,pid):
    if pid<0:return sparring(pid)
    other=profile_by_id(store,pid);refresh(other)
    if not other[MODE].get('joined'):raise ValueError('Đối thủ chưa đăng ký mùa đấu')
    ensure(other);return other

def seat_list(store):
    number,_,_,_=season();rows={str(row['no']):dict(row)for row in store.db.execute('SELECT *FROM top_arena_seats WHERE season=?',(number,))};result={}
    for no in range(1,11):
        row=rows.get(str(no));value={'no':no,'playerId':0,'protectTime':0}
        if row:
            try:p=profile_by_id(store,row['player']);value.update(public(p),protectTime=(row['joined']+cfg()['TOP_UN_ATTACK_HOURS']*3600)*1000)
            except ValueError:pass
        result[str(no)]=value
    return result

def pay_slot(store,row,until,player=None):
    until=min(until,row['end']);hours=max(0,int((until-row['paid'])//3600))
    if hours:
        p=player if player is not None and player['id']==row['player']else profile_by_id(store,row['player']);notice(store,p,'Top league hourly rewards','Private seat '+str(row['no']),[{'entityId':cfg()['MONEY_ID'],'count':hours*cfg()['TOP_HOURS_REWARD_MONEY_MAP'][str(row['no'])],'extra':{}}]);store.save(p);store.db.execute('UPDATE top_arena_seats SET paid=? WHERE season=?AND no=?',(row['paid']+hours*3600,row['season'],row['no']))

def settle(store):
    with store.transaction():
        for row in store.db.execute('SELECT *FROM top_arena_seats').fetchall():
            pay_slot(store,row,time.time())
            if time.time()>=row['end']:
                key=(row['season'],row['no'],row['player'])
                if not store.db.execute('SELECT 1 FROM top_arena_settlements WHERE season=?AND no=?AND player=?',key).fetchone():
                    p=profile_by_id(store,row['player']);notice(store,p,'Top league season reward','Private season '+str(row['season']),[{'entityId':cfg()['MONEY_ID'],'count':cfg()['TOP_SETTLEMENT_REWARD_MONEY_MAP'][str(row['no'])],'extra':{}}]);store.save(p);store.db.execute('INSERT INTO top_arena_settlements VALUES(?,?,?)',key)

def seat_admit(p,no):
    admit(p);integer(no,'Vị trí đỉnh cao',1,10)
    if no not in cfg()['SCORE_TYPE_CAN_CHALLENGE_TOP_NOS_MAP'][str(p[MODE]['scoreType'])]:raise ValueError('Bậc điểm chưa cho phép tranh vị trí này')
    if p['privateTopArena']['topAttempts']>=cfg()['TOP_CHALLENGE_TIMES']:raise ValueError('Đã hết lượt tranh vị trí hôm nay')

def occupy(store,p,no):
    number,_,end,_=season();now=int(time.time());old=store.db.execute('SELECT *FROM top_arena_seats WHERE season=?AND player=?',(number,p['id'])).fetchone()
    if old:
        if old['no']<=no:raise ValueError('Chỉ được chuyển lên vị trí cao hơn')
        pay_slot(store,old,now,p);store.db.execute('DELETE FROM top_arena_seats WHERE season=?AND player=?',(number,p['id']))
    target=store.db.execute('SELECT *FROM top_arena_seats WHERE season=?AND no=?',(number,no)).fetchone()
    if target:pay_slot(store,target,now)
    store.db.execute('INSERT INTO top_arena_seats VALUES(?,?,?,?,?,?)ON CONFLICT(season,no)DO UPDATE SET player=excluded.player,joined=excluded.joined,paid=excluded.paid,end=excluded.end',(number,no,p['id'],now,now,end))

async def challenge(store,account,args,top=False):
    p=store.player(account);ensure(p);admit(p);row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone()
    if not row or row['expires']<=time.time():raise ValueError('Trận đấu không tồn tại hoặc hết hạn')
    run=json.loads(row['data']);roles,ships=validate_maps(p,args.get('attackTeamIndexsMap'),args.get('attackShipIndexsMap',{}));seed=integer(args.get('seed'),'Seed',1,2**31-1);bg=integer(args.get('bgImgId'),'Hình nền',1)
    if run['season']!=season()[0]or args.get('defenderId')!=run['target']or roles!=run['roles']or ships!=run['ships']or seed!=run['seed']or type(args.get('isWin'))is not bool or bg not in constants('battle.ARENA_BACKGROUND_IMG_IDS'):raise ValueError('Thông tin ba trận không khớp')
    no=args.get('no');seat=None
    if top:
        seat_admit(p,no);seat=store.db.execute('SELECT *FROM top_arena_seats WHERE season=?AND no=?',(run['season'],no)).fetchone()
        if not seat or seat['player']!=run['target']or time.time()<seat['joined']+cfg()['TOP_UN_ATTACK_HOURS']*3600:raise ValueError('Vị trí đã đổi hoặc còn được bảo vệ')
    elif p[MODE]['remainingMatchTimes']<=0 or run['target']not in run['offered']:raise ValueError('Đã hết lượt hoặc đối thủ không có trong lần ghép này')
    pairs=[{'key':key,'team':round_team(run['attack'],key),'defender':round_team(run['defense'],key)}for key in ('1','2','3')];result=await simulate_async({'mode':'bestOfThree','pairs':pairs,'seed':seed});wins={r['key']:p['id']if r['isWin']else run['target']for r in result['rounds']}
    if args['isWin']!=result['isWin']or args.get('winPlayerIdMap')!=wins:raise ValueError('Kết quả từng đội không khớp engine')
    with store.transaction():
        current=store.db.execute('SELECT data FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone()
        if not current or current[0]!=row['data']:raise ValueError('Trận đấu đã được xử lý hoặc thay đổi')
        p=store.player(account);before=snapshot(p);ensure(p);admit(p)
        if season()[0]!=run['season']:raise ValueError('Mùa đấu đã thay đổi')
        if top:
            seat_admit(p,no);nowseat=store.db.execute('SELECT *FROM top_arena_seats WHERE season=?AND no=?',(run['season'],no)).fetchone()
            if not nowseat or dict(nowseat)!=dict(seat):raise ValueError('Vị trí đã thay đổi trong lúc đánh')
            p['privateTopArena']['topAttempts']+=1
            if result['isWin']:occupy(store,p,no)
        else:
            if p[MODE]['remainingMatchTimes']<=0:raise ValueError('Đã hết lượt ghép trận')
            p[MODE]['remainingMatchTimes']-=1;p[MODE]['score']=max(0,p[MODE]['score']+(3 if result['isWin']else -1));p['privateTopArena']['matched']={}
        rewards=grant(p,[{'entityId':cfg()['MONEY_ID'],'count':10 if result['isWin']else 5,'extra':{}}]);rid=secrets.token_hex(12);report={'id':rid,'type':MODE,'ctime':int(time.time()*1000),'attackerId':p['id'],'attackTeam':run['attack'],'defenseTeam':run['defense'],'seed':seed,'isWin':result['isWin'],'winPlayerIdMap':wins,'damageMapMap':{r['key']:r['damageMap']for r in result['rounds']},'bgImgId':bg,'up':p[MODE]['score']-before[MODE]['score'],'isTop':top,'no':no}
        store.db.execute('INSERT INTO battle_reports VALUES(?,?,?,?,?)',(rid,MODE,p['id'],run['target'],json.dumps(report)));store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE));refresh(p);p[MODE]['topInfoMap']=seat_list(store);store.save(p);store.audit('top_league_battle',{'player':p['id'],'top':top,'isWin':result['isWin']})
        return delta(before,p,'logic.topArena3v3Handler.'+('challengeTop'if top else 'challenge'),{'reportId':rid,'entityCountMap':rewards})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Route đấu trường đỉnh cao không tồn tại')
    settle(store);action=route.rsplit('.',1)[-1]
    if action in ('challenge','challengeTop'):return await challenge(store,account,args,action=='challengeTop')
    with store.transaction():
        p=store.player(account);before=snapshot(p);ensure(p);own=p[MODE];private=p['privateTopArena'];temp={};number,_,_,_=season()
        if action=='setDefenseTeamIndexsMap':
            roles,ships=validate_maps(p,args.get('defenseTeamIndexsMap'),args.get('defenseShipIndexsMap',{}));own.update(defenseTeamIndexsMap=roles,defenseShipIndexsMap=ships)
        elif action=='match':
            admit(p)
            if own['remainingMatchTimes']<=0:raise ValueError('Đã hết lượt ghép trận')
            candidates=[]
            for row in store.db.execute('SELECT data FROM players WHERE id!=?',(p['id'],)):
                other=json.loads(row[0]);refresh(other)
                if other[MODE].get('joined')and other['level']>=cfg()['REQUIRED_LEVEL']and not other.get('isBan')and len(other['team']['roles'])>=3:candidates.append(other)
            candidates.sort(key=lambda o:(abs(o[MODE]['score']-own['score']),o['id']));ids=[o['id']for o in candidates[:3]]
            for pid in (-700001,-700002,-700003):
                if len(ids)<3:ids.append(pid)
            private['matched']={'ids':ids,'expires':int(time.time())+900};temp['list']=[]
            for pid in ids:
                other=opponent(store,pid);temp['list'].append({**public(other),'score':other[MODE]['score'],'privateSparring':pid<0})
        elif action=='defenseTeam':
            target=integer(args.get('playerId'),'Đối thủ',-10**9,10**9);temp['team']=raw(opponent(store,target))
        elif action=='choose':
            admit(p);target=integer(args.get('defenderId'),'Đối thủ',-10**9,10**9)
            if target==p['id']:raise ValueError('Không được tự thách đấu')
            offered=private.get('matched',{});ids=offered.get('ids',[])if offered.get('expires',0)>time.time()else [];seat=store.db.execute('SELECT 1 FROM top_arena_seats WHERE season=?AND player=?',(number,target)).fetchone()
            if target not in ids and not seat:raise ValueError('Đối thủ chưa được ghép hoặc không giữ vị trí')
            roles,ships=validate_maps(p,args.get('attackTeamIndexsMap'),args.get('attackShipIndexsMap',{}));previous=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone();run=json.loads(previous['data'])if previous and previous['expires']>time.time()else None
            if not run or (run['target'],run['roles'],run['ships'],run['season'])!=(target,roles,ships,number):
                run={'target':target,'roles':roles,'ships':ships,'attack':raw_multi(p,roles,ships),'defense':raw(opponent(store,target)),'seed':secrets.randbelow(2**31-1)+1,'season':number,'offered':ids};store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],MODE,json.dumps(run),int(time.time())+900))
            temp.update(attackTeam=run['attack'],defenseTeam=run['defense'],seed=run['seed'])
        elif action=='buyMatchTimes':
            admit(p)
            if own['remainingMatchTimes']>0 or private['bought']>=5:raise ValueError('Chưa cần mua hoặc hết hạn mức riêng năm lần/ngày')
            prices=cfg()['BUY_MATCH_COST_MONEY_MAP'];ordinal=private['bought']+1;cost=prices[ordinal]if ordinal<len(prices)and prices[ordinal]else prices[-1];consume(p,cfg()['MONEY_ID'],cost);private['bought']+=1;own['remainingMatchTimes']+=1
        elif action=='receiveFirstReachReward':
            available=[i for i in range(1,private['maxTier']+1)if i not in private['receivedTiers']]
            if not available:raise ValueError('Đã nhận các mốc bậc từng đạt')
            rewards=[]
            for i in available:
                replacements=['119x1','119x2','120x1','120x2','120x3','120x4'];rewards.extend(description(f'97x{[500,700,1000,1300,1600,2000][i-1]},'+replacements[i-1]))
            temp['privateMissingOriginalRewardIds']=[688+i for i in available]
            temp['entityCountMap']=grant(p,rewards);private['receivedTiers'].extend(available)
        elif action=='challengeTopNull':
            no=integer(args.get('no'),'Vị trí',1,10);seat_admit(p,no)
            if store.db.execute('SELECT 1 FROM top_arena_seats WHERE season=?AND no=?',(number,no)).fetchone():raise ValueError('Vị trí đã có người, cần thách đấu')
            occupy(store,p,no);private['topAttempts']+=1
        elif action=='reportList':
            logs=[]
            for row in store.db.execute('SELECT *FROM battle_reports WHERE mode=?AND(attacker=?OR defender=?)ORDER BY rowid DESC LIMIT 50',(MODE,p['id'],p['id'])):
                r=json.loads(row['data']);attacker=row['attacker']==p['id'];logs.append({'id':row['id'],'ctime':r['ctime'],'isAttacker':attacker,'isWin':r['isWin']if attacker else not r['isWin'],'up':r['up']if attacker else 0,'is3v3':True,'playerInfo':r['defenseTeam']if attacker else r['attackTeam']})
            temp['reportList']=logs
        refresh(p);own['topInfoMap']=seat_list(store);store.save(p);store.audit('top_league_'+action,{'player':p['id']});result=delta(before,p,route,temp)
        if action=='info':result[MODE]=copy.deepcopy(own)
        return result
