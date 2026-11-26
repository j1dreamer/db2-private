"""Eleven public training seats, private training and original PvP replays."""
import copy,datetime,json,secrets,time
from .rules import constants
from .state import integer,snapshot,delta,consume,vip_data
from .battle import validate_team,build_team,simulate_async
from .arena import combat_raw
from .social import public,profile_by_id
from .gameplay import drops
from .practice import notice
ROUTES={'logic.eyeHandler.'+a for a in ('info','choose','buyChallengeTimes','defenseTeam','challenge','startPrivate','report')}
TZ=datetime.timezone(datetime.timedelta(hours=7))
def cfg():return constants('server.EYE.CONSTS')
def clock():return datetime.datetime.fromtimestamp(time.time(),TZ)
def admit(p):
    if p['level']<30:raise ValueError('Vòng quay đặc huấn mở từ cấp 30')
    if not cfg()['OPEN_HOURS']<=clock().hour<cfg()['CLOSE_HOURS']:raise ValueError('Đặc huấn mở 10–22 giờ UTC+7')
def team(p,indices,ships):return {**public(p),'roles':[copy.deepcopy(p['team']['roles'][idx])for idx in indices],'ships':[copy.deepcopy(p['bag']['items'][idx])for idx in ships]}
def validate(p,indices,ships):
    indices=validate_team(p,indices);build_team(p,indices,ships);day=(clock().weekday()+1)%7;allowed=cfg()['DAY_ROLE_CLASS_IDS_MAP'][str(day)]
    from .profile import table
    roles={r['kindId']:r for r in table('role')}
    if any(roles[p['team']['roles'][idx]['kindId']]['classId']not in allowed for idx in indices):raise ValueError('Chiến binh không phù hợp ngày đặc huấn')
    return indices,list(map(str,ships))
def active(store,pid):return store.db.execute('SELECT *FROM eye_occupations WHERE player=?AND active=1',(pid,)).fetchone()
def seats(store):
    rows=store.db.execute("SELECT *FROM eye_occupations WHERE type='public'AND active=1").fetchall();values={r['rank']:r for r in rows};result=[]
    for rank in range(1,cfg()['RANK_COUNT']+1):
        row=values.get(rank)
        result.append({**json.loads(row['data'])['team'],'rank':rank,'eyeDuration':max(0,int(time.time()*1000)-row['start'])}if row else {'rank':rank,'playerId':0,'eyeDuration':0})
    return result

def rewards(row):
    halves=max(0,min(24,(row['finish']-row['start'])//1800000));config=cfg();result=[]
    source=config['RANK_30_MINUTE_REWARD_LIST_MAP'][str(row['rank'])]if row['type']=='public'else config['PRIVATE_30_MINUTE_REWARD_LIST']
    if halves:result=[{**r,'count':r['count']*halves,'extra':{}}for r in source]
    if row['type']=='public'and row['rank']<=5:
        for _ in range(halves//2*(2 if row['rank']==1 else 1)):result+=drops(config['PUBLIC_STONE_CLASS_ID'])
    return result

def refresh(store,p):
    old=json.dumps(p,sort_keys=True);ms=int(time.time()*1000);day=clock().date().isoformat();state=p.setdefault('eye',{})
    if p.get('privateEyeDay')!=day:p['privateEyeDay']=day;state['remainingChallengeTimes']=cfg()['FREE_TIMES'];p['vip']['buyEyeChallengeTimesTimes']=0
    store.db.execute('UPDATE eye_occupations SET active=0 WHERE active=1 AND finish<=?',(ms,))
    for row in store.db.execute('SELECT *FROM eye_occupations WHERE player=?AND rewarded=0 AND ready<=?',(p['id'],ms)).fetchall():
        award=rewards(row);store.db.execute('UPDATE eye_occupations SET rewarded=1 WHERE id=?AND rewarded=0',(row['id'],))
        if award:notice(store,p,'Training seat reward','Completed training in '+row['type']+' seat.',award)
    current=active(store,p['id']);state.update(type=current['type']if current else '',startTime=current['start']if current else 0,list=seats(store))
    return old!=json.dumps(p,sort_keys=True)

def leave(store,pid):
    ms=int(time.time()*1000);store.db.execute('UPDATE eye_occupations SET active=0,finish=min(finish,?),ready=CASE WHEN ?>=finish THEN ready ELSE ? END WHERE player=?AND active=1',(ms,ms,ms,pid))

def occupy(store,p,kind,rank,raw):
    leave(store,p['id']);now=clock();end=int(now.replace(hour=cfg()['CLOSE_HOURS'],minute=0,second=0,microsecond=0).timestamp()*1000);ready=end+cfg()['SETTLEMENT_REWARD_MINUTE']*60000
    store.db.execute('INSERT INTO eye_occupations(player,day,type,rank,start,finish,ready,data,active,rewarded)VALUES(?,?,?,?,?,?,?,?,1,0)',(p['id'],now.date().isoformat(),kind,rank,int(time.time()*1000),end,ready,json.dumps({'team':raw})));refresh(store,p)

def sync(store,pid):
    other=profile_by_id(store,pid);refresh(store,other);store.save(other);store.notify(other['userId'],'onSync',{'code':200,'eye':other['eye']})

def choose(store,account,args):
    with store.transaction():
        p=store.player(account);admit(p);before=snapshot(p);rank=integer(args.get('rank'),'Vị trí',1,cfg()['RANK_COUNT']);indices,ships=validate(p,args.get('teamIndexs'),args.get('shipIndexs',[]));target=store.db.execute("SELECT *FROM eye_occupations WHERE type='public'AND rank=?AND active=1",(rank,)).fetchone();temp={};raw=team(p,indices,ships)
        if target and target['player']==p['id']:return delta(before,p,'logic.eyeHandler.choose',{})
        prior=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='eye'",(p['id'],)).fetchone()
        if prior and prior['expires']>time.time()and target:
            run=json.loads(prior['data'])
            if run['day']==p['privateDay']and run['occupation']==target['id']and run['indices']==indices and run['ships']==ships:return delta(before,p,'logic.eyeHandler.choose',{'attackTeam':run['attack'],'defenseTeam':run['defense'],'seed':run['seed']})
        if p['eye']['remainingChallengeTimes']<=0:raise ValueError('Đã hết lượt tranh vị trí')
        p['eye']['remainingChallengeTimes']-=1;store.db.execute("DELETE FROM pvp_runs WHERE player=?AND mode='eye'",(p['id'],))
        if not target:occupy(store,p,'public',rank,raw)
        else:
            run={'day':p['privateDay'],'rank':rank,'occupation':target['id'],'target':target['player'],'indices':indices,'ships':ships,'attack':raw,'defense':json.loads(target['data'])['team'],'seed':secrets.randbelow(2**31-1)+1};store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)',(p['id'],'eye',json.dumps(run),int(time.time())+900));temp.update(attackTeam=raw,defenseTeam=run['defense'],seed=run['seed'])
        store.save(p);return delta(before,p,'logic.eyeHandler.choose',temp)

async def challenge(store,account,args):
    p=store.player(account);admit(p);row=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='eye'",(p['id'],)).fetchone()
    if not row or row['expires']<time.time():raise ValueError('Không có trận tranh vị trí đang chờ')
    run=json.loads(row['data']);indices,ships=validate(p,args.get('teamIndexs'),args.get('shipIndexs',[]))
    if run['indices']!=indices or run['ships']!=ships or args.get('rank')!=run['rank']or args.get('defenderId')!=run['target']or type(args.get('seed'))is not int or args['seed']!=run['seed']or type(args.get('isWin'))is not bool or p['privateDay']!=run['day']:raise ValueError('Trận tranh vị trí không khớp')
    bg=integer(args.get('bgImgId'),'Phông nền',1)
    if bg not in constants('battle.ARENA_BACKGROUND_IMG_IDS'):raise ValueError('Phông nền không hợp lệ')
    outcome=await simulate_async({'mode':'pvp','team':combat_raw(run['attack']),'defender':combat_raw(run['defense']),'seed':run['seed']})
    if outcome['isWin']!=args['isWin']:raise ValueError('Kết quả không khớp engine gốc')
    with store.transaction():
        current=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='eye'",(p['id'],)).fetchone();target=store.db.execute('SELECT *FROM eye_occupations WHERE id=?AND active=1',(run['occupation'],)).fetchone()
        if not current or current['data']!=row['data']or current['expires']<time.time()or not target or target['finish']<=time.time()*1000:raise ValueError('Lượt đã nhận hoặc vị trí đã thay đổi')
        p=store.player(account);admit(p);before=snapshot(p)
        if outcome['isWin']:leave(store,run['target']);occupy(store,p,'public',run['rank'],run['attack']);sync(store,run['target'])
        rid=secrets.token_hex(12);report={'id':rid,'ctime':int(time.time()*1000),'isWin':outcome['isWin'],'seed':run['seed'],'bgImgId':bg,'attackTeam':run['attack'],'defenseTeam':run['defense'],'damageMap':outcome['damageMap'],'rank':run['rank'],'up':0}
        store.db.execute('INSERT INTO battle_reports VALUES(?,?,?,?,?)',(rid,'eye',p['id'],run['target'],json.dumps(report)));store.db.execute("DELETE FROM pvp_runs WHERE player=?AND mode='eye'",(p['id'],));store.save(p);store.audit('eye_challenge',{'player':p['id'],'target':run['target'],'isWin':outcome['isWin']})
        return delta(before,p,'logic.eyeHandler.challenge',{'reportId':rid,'entityCountMap':{}})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác vòng quay không tồn tại')
    action=route.rsplit('.',1)[-1]
    if action=='choose':return choose(store,account,args)
    if action=='challenge':return await challenge(store,account,args)
    with store.transaction():
        p=store.player(account);before=snapshot(p);temp={}
        if p['level']<30:raise ValueError('Đặc huấn mở từ cấp 30')
        if action=='startPrivate':
            admit(p);indices,ships=validate(p,args.get('teamIndexs'),[]);own=active(store,p['id'])
            if not own or own['type']!='private':occupy(store,p,'private',0,team(p,indices,ships))
        elif action=='buyChallengeTimes':
            admit(p);count=p['vip'].get('buyEyeChallengeTimesTimes',0)
            if count>=vip_data(p)['buyEyeChallengeTimesTimes']:raise ValueError('Đã hết lượt mua theo VIP')
            costs=[0,50,50,100,100,100,100,200,200,200];consume(p,102,costs[min(count+1,len(costs)-1)]);p['vip']['buyEyeChallengeTimesTimes']=count+1;p['eye']['remainingChallengeTimes']+=1
        elif action=='defenseTeam':
            row=active(store,integer(args.get('playerId'),'Người chơi',1))
            if not row:raise ValueError('Người chơi chưa chiếm vị trí')
            temp['defenseTeam']=json.loads(row['data'])['team']
        elif action=='report':
            rid=args.get('id')
            if not isinstance(rid,str):raise ValueError('ID báo cáo không hợp lệ')
            row=store.db.execute("SELECT data FROM battle_reports WHERE id=?AND mode='eye'AND(attacker=?OR defender=?)",(rid,p['id'],p['id'])).fetchone()
            if not row:raise ValueError('Báo cáo không thuộc tài khoản')
            temp['report']=json.loads(row['data'])
        else:temp['list']=p['eye']['list']
        store.save(p);result=delta(before,p,route,temp);result['eye']=p['eye'];return result
