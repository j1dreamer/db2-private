"""Real-player team and prestige battles; private daily enrollment/settlement rules."""
import copy,datetime,json,math,secrets,time
from .rules import constants
from .state import integer,snapshot,delta,consume
from .battle import validate_team,build_team,simulate_async
from .arena import combat_raw
from .social import public,profile_by_id
from .practice import notice
from .adventure import grant
MODES=('teamBattle','prestigeBattle')
ACTIONS=('getInfo','getReadyTeamInfos','match','createTeam','joinTeam','removeTeamMember','dissolveTeam','setAutoPractice','practice','choose','challenge','rank')
ROUTES={'logic.'+m+'Handler.'+a for m in MODES for a in ACTIONS}|{'logic.teamBattleHandler.refresh'}
ZONE=datetime.timezone(datetime.timedelta(hours=7))
def cfg(mode):return constants('server.'+('TEAM_BATTLE'if mode=='teamBattle'else 'PRESTIGE_BATTLE')+'.CONSTS')
def clock():return datetime.datetime.fromtimestamp(time.time(),ZONE)
def day():return clock().date().isoformat()
def period(date=None):
    d=datetime.date.fromisoformat(date)if date else clock().date();return (d-datetime.timedelta(days=d.weekday())).isoformat()
def opened(mode):
    c=cfg(mode);h=clock().hour;return {'isOpen':c['READY_HOURS']<=h<c['END_HOURS'],'isReady':c['READY_HOURS']<=h<c['READY_END_HOURS'],'isRunning':c['START_HOURS']<=h<c['END_HOURS']}
def admit(p,mode):
    if p['level']<cfg(mode)['REQUIRED_LEVEL']:raise ValueError('Chưa đủ cấp đấu đội')
def all_teams(store,mode,date=None):return [json.loads(r[0])for r in store.db.execute('SELECT data FROM cooperative_teams WHERE mode=?AND day=?ORDER BY id',(mode,date or day()))]
def save(store,t):store.db.execute('UPDATE cooperative_teams SET status=?,data=?WHERE id=?',(t['status'],json.dumps(t),t['teamId']))
def get(store,mode,tid):
    integer(tid,'Đội',1);r=store.db.execute('SELECT data FROM cooperative_teams WHERE id=?AND mode=?AND day=?',(tid,mode,day())).fetchone()
    if not r:raise ValueError('Đội không tồn tại hôm nay')
    t=json.loads(r[0])
    if t['status']==0:raise ValueError('Đội đã giải tán')
    return t

def refresh(store,p):
    old=json.dumps(p,sort_keys=True)
    for mode in MODES:
        ts=[t for t in all_teams(store,mode)if t['status']and str(p['id'])in t['battleTeamMap']]if store else [];members=[t['battleTeamMap'][str(p['id'])]for t in ts];created=next((t for t in ts if t['status']==1 and t['leaderId']==p['id']),None);active=[t for t in ts if t['status']==2 and t['leaderId']==p['id']]
        private=p.setdefault('privateCooperative',{}).setdefault(mode,{})
        if private.get('day')!=p.get('privateDay'):private.update(day=p.get('privateDay'),refreshTimes=0)
        p['extra'][mode]={'openInfo':opened(mode),'practiceTimes':len(ts),'refreshTimes':private.get('refreshTimes',0),'defenseTeamIndexs':[int(i)for m in members for i in m['teamIndexs']],'defenseShipIndexs':[int(i)for m in members for i in m['shipIndexs']],'createTeamInfo':created,'ruingTeamInfos':active,'myTeamInfos':active,'teamInfos':active}
    return old!=json.dumps(p,sort_keys=True)

def sync(store,mode,pids,actor=None,event_team=None):
    for pid in set(pids):
        if pid==actor:continue
        p=store.player(profile_by_id(store,pid)['userId']);store.notify(p['userId'],'onSync',{'code':200,'extra':{mode:p['extra'][mode]}})
        if event_team:store.notify(p['userId'],'onUpdate'+('TeamBattle'if mode=='teamBattle'else 'PrestigeBattle')+'CreateTeamInfo',event_team)

def ready(mode):
    if not opened(mode)['isReady']:raise ValueError('Đã ngoài giờ lập đội')
def leader(t,p):
    if t['leaderId']!=p['id']:raise ValueError('Chỉ đội trưởng được thao tác')
def raw_team(store,p,mode,args):
    indices=validate_team(p,args.get('teamIndexs'));ships=args.get('shipIndexs',[]);build_team(p,indices,ships);ships=list(map(str,ships));s=p['extra'][mode]
    if s['practiceTimes']>=cfg(mode)['PRACTICE_TIMES']:raise ValueError('Đã hết lượt lập/tham gia đội hôm nay')
    if set(indices)&set(map(str,s['defenseTeamIndexs']))or set(ships)&set(map(str,s['defenseShipIndexs'])):raise ValueError('Chiến binh hoặc đồng hành đã tham gia đội khác')
    return {**public(p),'roles':[copy.deepcopy(p['team']['roles'][i])for i in indices],'ships':[copy.deepcopy(p['bag']['items'][i])for i in ships],'teamIndexs':list(map(int,indices)),'shipIndexs':list(map(int,ships))}

def start(t,mode):
    if t['status']!=1:raise ValueError('Đội không còn chờ xuất phát')
    if mode=='teamBattle'and len(t['battleTeamMap'])!=3:raise ValueError('Đấu đội cần đủ ba người chơi thật')
    t.update(status=2,startTime=int(time.time()*1000))
def stats(store,mode,pid,value):
    if value>0:store.db.execute('INSERT INTO cooperative_scores VALUES(?,?,?,?)ON CONFLICT(mode,period,player)DO UPDATE SET score=score+excluded.score',(mode,period(),pid,value))

def maintenance(store,mode):
    # A run completes at the source END_HOURS; enrollment has its own cutoff.
    now=clock()
    for r in store.db.execute('SELECT data FROM cooperative_teams WHERE mode=?AND status IN (1,2)',(mode,)).fetchall():
        t=json.loads(r[0]);end=datetime.datetime.combine(datetime.date.fromisoformat(t['day']),datetime.time(cfg(mode)['END_HOURS']),ZONE)
        if now<end:continue
        t['status']=3;save(store,t)
        if mode=='prestigeBattle'and t.get('startTime'):
            n=len(t['battleTeamMap']);base=cfg(mode)['MONEY_REWARD_COUNT_MAP'][str(n)];loss=t.get('loss',0);ids=sorted(map(int,t['battleTeamMap']))
            for i,pid in enumerate(ids):
                if store.db.execute('SELECT 1 FROM cooperative_awards WHERE mode=?AND period=?AND team=?AND player=?',(mode,t['day'],t['teamId'],pid)).fetchone():continue
                p=store.player(profile_by_id(store,pid)['userId']);count=max(0,base-loss//n-(1 if i<loss%n else 0));notice(store,p,cfg(mode)['REWARD_MAIL_TITLE'],'Private daily completion '+t['day'],[{'entityId':115,'count':count,'extra':{}},{'entityId':102,'count':cfg(mode)['REWARD_GEM'],'extra':{}}]);store.save(p);store.db.execute('INSERT INTO cooperative_awards VALUES(?,?,?,?)',(mode,t['day'],t['teamId'],pid))
    if mode=='teamBattle':
        # Source SETTLEMENT_DAYS=Sunday; private weekly period Sunday23..Sunday23.
        current=period()
        if now.weekday()==6 and now.hour>=23:current=(datetime.date.fromisoformat(current)+datetime.timedelta(days=7)).isoformat()
        for old in store.db.execute('SELECT DISTINCT period FROM cooperative_scores WHERE mode=?AND period<?',(mode,current)).fetchall():
            for rank,r in enumerate(store.db.execute('SELECT player FROM cooperative_scores WHERE mode=?AND period=?AND score>0 ORDER BY score DESC,player',(mode,old[0])).fetchall(),1):
                if store.db.execute('SELECT 1 FROM cooperative_awards WHERE mode=?AND period=?AND team=0 AND player=?',(mode,old[0],r[0])).fetchone():continue
                c=cfg(mode);reward=c['RANK_REWARD_DROP_LIST_MAP'].get(str(rank))
                if reward is None:idx=max((i for i,start_ in enumerate(c['RANK_BETWEEN'])if rank>=start_),default=0);reward=c['RANK_REWARD_BETWEEN'][idx]
                p=store.player(profile_by_id(store,r[0])['userId']);notice(store,p,'Team battle weekly ranking','Private Sunday settlement; rank '+str(rank),reward);store.save(p);store.db.execute('INSERT INTO cooperative_awards VALUES(?,?,0,?)',(mode,old[0],r[0]))

def choose(store,p,mode,args):
    if not opened(mode)['isRunning']:raise ValueError('Chưa tới giờ chiến đấu')
    a=get(store,mode,args.get('attackTeamId'));b=get(store,mode,args.get('defenderTeamId'));leader(a,p)
    if a['teamId']==b['teamId']or a['status']!=2 or b['status']!=2 or set(a['battleTeamMap'])&set(b['battleTeamMap']):raise ValueError('Hai đội không thể giao chiến')
    if mode=='prestigeBattle'and a['guildId']and a['guildId']==b['guildId']:raise ValueError('Không thể cướp đội cùng gia tộc')
    prior=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode)).fetchone()
    if prior and prior['expires']>time.time():
        v=json.loads(prior['data'])
        if v['day']==day()and v['attack']['teamId']==a['teamId']and v['defense']['teamId']==b['teamId']and v['attackVersion']==json.dumps(a)and v['defenseVersion']==json.dumps(b):return v
    if a['attackTimes']>=cfg(mode)['ATTACK_TIMES']or b['teamId']in a['attackedTeamIds']or mode=='prestigeBattle'and b['beAttackTimes']>=cfg(mode)['BE_ATTACK_TIMES']:raise ValueError('Đã hết lượt hoặc đã đấu đội này')
    a['attackTimes']+=1;a['attackedTeamIds'].append(b['teamId']);save(store,a)
    v={'day':day(),'attack':a,'defense':b,'attackVersion':json.dumps(a),'defenseVersion':json.dumps(b),'seed':secrets.randbelow(2**31-1)+1};end=datetime.datetime.combine(clock().date(),datetime.time(23),ZONE).timestamp();store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],mode,json.dumps(v),min(int(time.time())+900,int(end))));return v

async def replay(mode,run):
    a=copy.deepcopy(run['attack']);b=copy.deepcopy(run['defense']);key=(lambda r:r['idx'])if mode=='teamBattle'else(lambda r:-r['playerLevel']);aa=sorted(a['battleTeamMap'].values(),key=key);bb=sorted(b['battleTeamMap'].values(),key=key);i=j=0;wins=0;winmap={};damage={};round_=1
    while i<len(aa)and j<len(bb):
        out=await simulate_async({'mode':'pvp','team':combat_raw(aa[i]),'defender':combat_raw(bb[j]),'seed':run['seed']});winner=a if out['isWin']else b;damage[str(round_)]=out['damageMap']
        if mode=='teamBattle':winmap[str(round_)]=winner['teamId'];wins+=int(out['isWin']);i+=1;j+=1
        else:
            team_=aa[i]if out['isWin']else bb[j];hp={str(r['kindId']):r['hp']for r in out['attacker'if out['isWin']else 'defender']['roles']};winmap[str(round_)]={'teamId':winner['teamId'],'hpMap':hp}
            for r in team_['roles']:r['attr']['hp']=hp[str(r['kindId'])]
            if out['isWin']:j+=1
            else:i+=1
        round_+=1
    return {'isWin':wins>=2 if mode=='teamBattle'else j==len(bb),'wins':wins,'winPlayerIdMap':winmap,'damageMapMap':damage}

def equivalent(a,b):
    if isinstance(a,dict)and isinstance(b,dict):return a.keys()==b.keys()and all(equivalent(a[k],b[k])for k in a)
    if isinstance(a,(int,float))and not isinstance(a,bool)and isinstance(b,(int,float))and not isinstance(b,bool):return math.isfinite(a)and math.isfinite(b)and math.isclose(a,b,rel_tol=1e-8,abs_tol=1e-6)
    return a==b and type(a)is type(b)

async def challenge(store,account,mode,args):
    p=store.player(account);row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode)).fetchone()
    if not row or row['expires']<=time.time():raise ValueError('Trận đấu đội đã hết hạn')
    v=json.loads(row['data'])
    if type(args.get('isWin'))is not bool or any(type(args.get(k))is not int or args[k]!=x for k,x in (('attackTeamId',v['attack']['teamId']),('defenderTeamId',v['defense']['teamId']),('seed',v['seed']))):raise ValueError('Thông tin trận không khớp')
    out=await replay(mode,v)
    if out['isWin']!=args['isWin']or not equivalent(out['winPlayerIdMap'],args.get('winPlayerIdMap'))or not equivalent(out['damageMapMap'],args.get('damageMapMap')):raise ValueError('Kết quả đấu đội không khớp engine')
    with store.transaction():
        current=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode)).fetchone();a=get(store,mode,v['attack']['teamId']);b=get(store,mode,v['defense']['teamId'])
        if not current or current['expires']<=time.time()or current['data']!=row['data']or json.dumps(a)!=v['attackVersion']or json.dumps(b)!=v['defenseVersion']or day()!=v['day']or not opened(mode)['isRunning']:raise ValueError('Trận đã nhận hoặc đội đã đổi')
        p=store.player(account);before=snapshot(p);members=set(map(int,a['battleTeamMap']));points=(3 if out['wins']>2 else 2)if out['isWin']else 0
        if mode=='teamBattle':
            for pid in members:stats(store,mode,pid,points)
        else:
            b['beAttackTimes']+=1;save(store,b)
            if out['isWin']:
                n=len(b['battleTeamMap']);base=cfg(mode)['MONEY_REWARD_COUNT_MAP'][str(n)];rate=max(.05,min(.2,.1-.1*(a['topLevel']-b['topLevel'])/5));loot=min(base*n-b.get('loss',0),math.ceil(base*n*rate));b['loss']=b.get('loss',0)+loot;save(store,b)
                for i,pid in enumerate(sorted(members)):
                    count=loot//len(members)+int(i<loot%len(members));target=p if pid==p['id']else store.player(profile_by_id(store,pid)['userId']);notice(store,target,cfg(mode)['ATTACK_MAIL_TITLE'],'Private shared loot.',[{'entityId':115,'count':count,'extra':{}}]);stats(store,mode,pid,count)
                    if pid!=p['id']:store.save(target)
        rid=secrets.token_hex(12);report={'id':rid,'type':mode,'ctime':int(time.time()*1000),'attackTeam':v['attack'],'defenseTeam':v['defense'],'seed':v['seed'],**out};store.db.execute('INSERT INTO battle_reports VALUES(?,?,?,?,?)',(rid,mode,p['id'],b['leaderId'],json.dumps(report)));store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],mode));refresh(store,p);store.save(p);sync(store,mode,members|set(map(int,b['battleTeamMap'])),p['id']);store.audit(mode,{'player':p['id'],'isWin':out['isWin']});result=delta(before,p,'logic.'+mode+'Handler.challenge',{'reportId':rid,'canonicalState':p['extra'][mode]});result.pop('extra',None);return result

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác đấu đội không tồn tại')
    mode='prestigeBattle'if '.prestigeBattleHandler.'in route else 'teamBattle';action=route.rsplit('.',1)[-1]
    if action=='challenge':return await challenge(store,account,mode,args)
    with store.transaction():
        maintenance(store,mode);p=store.player(account);admit(p,mode);before=snapshot(p);temp={};affected=set();event=None
        if action=='getInfo':
            s=p['extra'][mode];temp.update(openInfo=s['openInfo'],practiceTimes=s['practiceTimes'],refreshTimes=s['refreshTimes'],defenseTeamIndexs=s['defenseTeamIndexs'],defenseShipIndexs=s['defenseShipIndexs'],createTeamInfo=s['createTeamInfo'],battleInfo={'createTeamInfo':s['createTeamInfo'],'ruingTeamInfos':s['ruingTeamInfos']})
        elif action in ('match','refresh','getReadyTeamInfos'):
            if action=='refresh':
                n=p['privateCooperative'][mode]['refreshTimes'];consume(p,102,[0,100,200,300,400][min(n+1,4)]);p['privateCooperative'][mode]['refreshTimes']+=1
            ts=[t for t in all_teams(store,mode)if t['status']==(1 if action=='getReadyTeamInfos'else 2)];mine=[t for t in ts if t['leaderId']==p['id']];other=[t for t in ts if t not in mine];offset=p['privateCooperative'][mode]['refreshTimes']%max(1,len(other));other=other[offset:]+other[:offset];temp.update(teamInfos=mine+other[:max(0,cfg(mode)['MATCH_PLAYER_COUNT']-len(mine))],defenseTeamIndexs=p['extra'][mode]['defenseTeamIndexs'],defenseShipIndexs=p['extra'][mode]['defenseShipIndexs'])
        elif action in ('createTeam','joinTeam'):
            ready(mode);raw=raw_team(store,p,mode,args)
            if action=='createTeam':
                if p['extra'][mode]['createTeamInfo']:raise ValueError('Bạn đã có đội đang chờ')
                tid=store.db.execute('INSERT INTO cooperative_teams(mode,day,status,data)VALUES(?,?,1,?)',(mode,day(),'{}')).lastrowid;t={'teamId':tid,'day':day(),'leaderId':p['id'],'guildId':p.get('guildId',0),'guildName':p.get('guildName',''),'serverId':p['serverId'],'topLevel':p['level'],'battleTeamMap':{},'isAutoPractice':False,'status':1,'startTime':0,'attackTimes':0,'attackedTeamIds':[],'beAttackTimes':0,'loss':0}
            else:t=get(store,mode,args.get('teamId'))
            if t['status']!=1 or str(p['id'])in t['battleTeamMap']or len(t['battleTeamMap'])>=3:raise ValueError('Đội không còn chỗ trống')
            raw['idx']=next(i for i in range(1,4)if i not in [r['idx']for r in t['battleTeamMap'].values()]);t['battleTeamMap'][str(p['id'])]=raw;t['topLevel']=max(r['playerLevel']for r in t['battleTeamMap'].values())
            if t['isAutoPractice']and len(t['battleTeamMap'])==3:start(t,mode)
            save(store,t);affected=set(map(int,t['battleTeamMap']));event=t;temp['teamInfo']=t
        elif action in ('removeTeamMember','dissolveTeam','setAutoPractice','practice'):
            ready(mode);t=get(store,mode,args.get('teamId'))
            if t['status']!=1:raise ValueError('Đội đã xuất phát')
            affected=set(map(int,t['battleTeamMap']))
            if action=='removeTeamMember':
                pid=integer(args.get('playerId'),'Thành viên',1)
                if pid==t['leaderId']or str(pid)not in t['battleTeamMap']or p['id']not in (pid,t['leaderId']):raise ValueError('Không có quyền xóa thành viên')
                del t['battleTeamMap'][str(pid)];t['topLevel']=max(r['playerLevel']for r in t['battleTeamMap'].values())
            else:
                leader(t,p)
                if action=='dissolveTeam':t['status']=0
                elif action=='practice':start(t,mode)
                else:
                    if type(args.get('isAuto'))is not bool:raise ValueError('Tự động phải là boolean')
                    t['isAutoPractice']=args['isAuto']
                    if t['isAutoPractice']and len(t['battleTeamMap'])==3:start(t,mode)
            save(store,t);event=t if t['status']else None
        elif action=='choose':
            v=choose(store,p,mode,args);temp.update(attackTeamInfo=v['attack'],defenseTeamInfo=v['defense'],seed=v['seed'])
        elif action=='rank':
            rs=store.db.execute('SELECT player,score FROM cooperative_scores WHERE mode=?AND period=?AND score>0 ORDER BY score DESC,player LIMIT 50',(mode,period())).fetchall();temp['list']=[{**public(profile_by_id(store,r['player'])),'rank':i+1,'value':r['score']}for i,r in enumerate(rs)];me=next((r for r in temp['list']if r['playerId']==p['id']),None);temp.update(myRank=me['rank']if me else 0,myValue=me['value']if me else 0)
        refresh(store,p);store.save(p);sync(store,mode,affected,p['id'],event);temp['canonicalState']=p['extra'][mode];result=delta(before,p,route,temp);result.pop('extra',None);return result
