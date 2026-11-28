"""Timed training teams and once-only raids for ordinary and six practice."""
import copy,datetime,json,math,secrets,time
from .profile import table
from .state import integer,snapshot,delta,consume
from .rules import constants
from .battle import validate_team,build_team,simulate_async
from .arena import combat_raw
from .adventure import grant
from .social import public,profile_by_id
ROUTES={'logic.'+mode+'Handler.'+action for mode in ('practice','sixPractice')for action in ('match','setDefenseInfo','defenseTeam','choose','challenge')}

def cfg(mode):return constants('server.'+('PRACTICE'if mode=='practice'else 'SIX_PRACTICE')+'.CONSTS')
def tier(vip):return 3 if vip>=13 else 2 if vip>=10 else 1
def admit(p,mode):
    if p['level']<(35 if mode=='practice'else 80):raise ValueError('Chưa đủ cấp mở đặc huấn')
def allowed_six(p,indices):
    day=(datetime.datetime.fromtimestamp(time.time(),datetime.timezone(datetime.timedelta(hours=7))).weekday()+1)%7;allowed=constants('server.SIX_SMAP.CONSTS.DAY_ROLE_CLASS_IDS_MAP')[str(day)];roles={r['kindId']:r for r in table('role')}
    if any(roles[p['team']['roles'][idx]['kindId']]['classId']not in allowed for idx in indices):raise ValueError('Chiến binh không phù hợp lịch hôm nay')
def rate(attacker,defender):return max(.05,min(.2,.1-.1*(attacker-defender)/5))

def reward(mode,kind,level,training_level,vip,ratio=1,raid=False):
    config=cfg(mode)
    if mode=='sixPractice':return [{'entityId':49918,'count':math.ceil(config['CKL_REWARD_COUNT_MAP'][str(tier(vip))]*ratio),'extra':{}}]
    if kind==1:entity=111;count=math.ceil(config['MONEY_REWARD_COUNT_MAP'][str(training_level)]*ratio)
    elif kind==2:entity=102;count=math.ceil(config['GEM_REWARD_COUNT']*ratio)*(3 if raid else 1)
    else:
        # PRACTICE.getRewardCoinCount delegates to EXPEDITION.getRewardCoin(2).
        x=2;coin=3*math.floor((15000+100*level)*(.00195*x**3-.02403*x**2+.12922*x+.89286)*level/25*2+.5)
        if kind==3:entity=101;count=math.ceil(coin*ratio)
        else:
            count=math.ceil(math.ceil(2*coin/400)*ratio)
            return [{'entityId':entity,'count':n,'extra':{}}for entity,n in ((20003,count//25),(20002,count%25//5),(20001,count%5))if n]
    return [{'entityId':entity,'count':count,'extra':{}}]if count else []

def save_session(store,mode,pid,ctime,data):store.db.execute('UPDATE practice_sessions SET data=?WHERE mode=?AND player=?AND ctime=?',(json.dumps(data),mode,pid,ctime))
def notice(store,p,title,body,rewards=()):
    mail={'_id':secrets.token_hex(12),'senderId':0,'senderName':'DB2 Private','title':title,'body':body,'status':1,'isSys':True,'dropList':list(rewards),'ctime':int(time.time()*1000)};p['extra']['mails'].append(mail);store.notify(p['userId'],'onNewMail',{'mail':mail})

def refresh(store,p):
    before=json.dumps(p,sort_keys=True);state=p.setdefault('practice',{});private=p.setdefault('privatePractice',{})
    if private.get('day')!=p['privateDay']:private.update(day=p['privateDay'],defenses=0,attacks=0,sixDefenses=0,sixAttacks=0);state.update(usedTeamIndexs=[],usedShipIndexs=[])
    normal=cfg('practice');six=cfg('sixPractice');state.update(remainingDefenseTimes=max(0,normal['DEFENSE_TIMES']-private['defenses']),remainingChallengeTimes=max(0,normal['CHALLENGE_TIMES']-private['attacks']),sixRemainingDefenseTimes=max(0,six['DEFENSE_TIMES']-private['sixDefenses']),sixRemainingChallengeTimes=max(0,six['CHALLENGE_TIMES_MAP'][str(tier(p['vip']['level']))]-private['sixAttacks']))
    rows=store.db.execute('SELECT *FROM practice_sessions WHERE player=?AND settled=0',(p['id'],)).fetchall();active_roles=[];active_ships=[]
    for row in rows:
        data=json.loads(row['data'])
        if row['finish']<=time.time()*1000:
            rewards=reward(row['mode'],data['type'],data['playerLevel'],data['level'],data['vipLevel'])
            rewards=[{**r,'count':max(0,r['count']-data.get('losses',{}).get(str(r['entityId']),0))}for r in rewards];rewards=[r for r in rewards if r['count']]
            store.db.execute('UPDATE practice_sessions SET settled=1 WHERE mode=?AND player=?AND ctime=?AND settled=0',(row['mode'],p['id'],row['ctime']));notice(store,p,cfg(row['mode'])['REWARD_MAIL_TITLE'],'Training completed; disruptions: '+str(data['beAttackTimes']),rewards)
        elif row['mode']=='practice':active_roles+=data['indices'];active_ships+=data['ships']
    state['allDefenseTeamIndexs']=list(map(int,set(active_roles)));state['allDefenseShipIndexs']=list(map(int,set(active_ships)))
    return before!=json.dumps(p,sort_keys=True)

def find(store,mode,pid,ctime):
    integer(pid,'Đối thủ',1);integer(ctime,'Mốc đội hình',1,2**53-1);row=store.db.execute('SELECT *FROM practice_sessions WHERE mode=?AND player=?AND ctime=?',(mode,pid,ctime)).fetchone()
    if not row or row['settled']or row['finish']<=time.time()*1000:raise ValueError('Đội đặc huấn không còn hoạt động')
    return row,json.loads(row['data'])

def view(data):
    raw=copy.deepcopy(data['team']);raw['defenseInfo']={key:data[key]for key in ('type','level','vipLevel','ctime','finishTime','beAttackTimes','maxBeAttackTimes','attackerIds')};return raw

def defend(store,p,mode,args):
    admit(p,mode);indices=validate_team(p,args.get('defenseTeamIndexs'));ships=args.get('defenseShipIndexs',[]);build_team(p,indices,ships);ships=list(map(str,ships));config=cfg(mode);private=p['privatePractice'];six=mode=='sixPractice';key='sixDefenses'if six else 'defenses';maximum=config['DEFENSE_TIMES']
    if private[key]>=maximum:raise ValueError('Đã hết lượt lập đội hôm nay')
    kind=1 if six else integer(args.get('type'),'Loại đặc huấn',1,4);level=1 if six else integer(args.get('level'),'Cấp đặc huấn',1,3)
    if kind!=1 and level!=1:raise ValueError('Loại đặc huấn này chỉ có cấp 1')
    if six:
        allowed_six(p,indices)
    else:
        if set(indices)&set(map(str,p['practice']['allDefenseTeamIndexs']))or set(ships)&set(map(str,p['practice']['allDefenseShipIndexs'])):raise ValueError('Đội hình đang đặc huấn')
        count=store.db.execute('SELECT count(*)FROM practice_sessions WHERE mode=?AND player=?AND settled=0 AND finish>?AND json_extract(data,\'$.type\')=?',(mode,p['id'],time.time()*1000,kind)).fetchone()[0]
        if count>=config['SAME_TYPE_MAX_TEAM_COUNT']:raise ValueError('Đã đạt giới hạn đội cùng loại')
        consume(p,102,config['LEVEL_COST_GEMS'][level])
    timestamp=int(time.time()*1000);last=store.db.execute('SELECT max(ctime)FROM practice_sessions WHERE mode=?AND player=?',(mode,p['id'])).fetchone()[0];timestamp=max(timestamp,(last or 0)+1)
    duration=config['PRACTICE_TIME_MAP'][str(tier(p['vip']['level']))]if six else config['PRACTICE_TIME'];raw={**public(p),'roles':[copy.deepcopy(p['team']['roles'][idx])for idx in indices],'ships':[copy.deepcopy(p['bag']['items'][idx])for idx in ships]}
    data={'team':raw,'indices':indices,'ships':ships,'type':kind,'level':level,'vipLevel':p['vip']['level'],'playerLevel':p['level'],'ctime':timestamp,'finishTime':timestamp+duration,'beAttackTimes':0,'maxBeAttackTimes':config['BE_ATTACK_TIMES_MAP'][str(tier(p['vip']['level']))]if six else config['BE_ATTACK_TIMES'],'attackerIds':[],'losses':{}}
    store.db.execute('INSERT INTO practice_sessions VALUES(?,?,?,?,?,0)',(mode,p['id'],timestamp,json.dumps(data),timestamp+duration));private[key]+=1;refresh(store,p);return data

def choose(store,p,mode,args):
    admit(p,mode);target=integer(args.get('defenderId'),'Đối thủ',1);ctime=args.get('ctime');row,other=find(store,mode,target,ctime)
    if target==p['id']:raise ValueError('Không thể tự cướp đội đặc huấn')
    indices=validate_team(p,args.get('attackTeamIndexs'));ships=args.get('attackShipIndexs',[]);build_team(p,indices,ships);ships=list(map(str,ships));slot='practice:'+mode;old=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
    if mode=='sixPractice':allowed_six(p,indices)
    if old and old['expires']>time.time():
        run=json.loads(old['data'])
        if run['day']==p['privateDay']and run['target']==target and run['ctime']==ctime and run['indices']==indices and run['ships']==ships:return run
    if p['id']in other['attackerIds']or other['beAttackTimes']>=other['maxBeAttackTimes']:raise ValueError('Đội đã hết lượt bị cướp hoặc đã bị bạn cướp')
    private=p['privatePractice'];key='attacks'if mode=='practice'else 'sixAttacks';maximum=cfg(mode)['CHALLENGE_TIMES']if mode=='practice'else cfg(mode)['CHALLENGE_TIMES_MAP'][str(tier(p['vip']['level']))]
    if private[key]>=maximum:raise ValueError('Đã hết lượt cướp đặc huấn hôm nay')
    if mode=='practice'and (set(indices)&set(map(str,p['practice']['usedTeamIndexs']))or set(ships)&set(map(str,p['practice']['usedShipIndexs']))):raise ValueError('Đội hình đã dùng cướp hôm nay')
    attack={**public(p),'roles':[copy.deepcopy(p['team']['roles'][idx])for idx in indices],'ships':[copy.deepcopy(p['bag']['items'][idx])for idx in ships]};run={'day':p['privateDay'],'target':target,'ctime':ctime,'indices':indices,'ships':ships,'attack':attack,'defense':view(other),'seed':secrets.randbelow(2**31-1)+1};private[key]+=1
    if mode=='practice':p['practice']['usedTeamIndexs']+=list(map(int,indices));p['practice']['usedShipIndexs']+=list(map(int,ships))
    store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],slot,json.dumps(run),int(time.time())+900));refresh(store,p)
    from .battle_prefetch import begin as prefetch
    prefetch(store,p['id'],{'mode':'practice','team':combat_raw(attack),'defender':combat_raw(run['defense']),'seed':run['seed']})
    return run

async def challenge(store,account,mode,args):
    p=store.player(account);admit(p,mode);slot='practice:'+mode;row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
    if not row or row['expires']<time.time():raise ValueError('Không có lượt cướp đang chờ')
    run=json.loads(row['data']);ships=args.get('attackShipIndexs',[])
    if not isinstance(ships,list)or validate_team(p,args.get('attackTeamIndexs'))!=run['indices']or list(map(str,ships))!=run['ships']or args.get('defenderId')!=run['target']or args.get('ctime')!=run['ctime']or type(args.get('seed'))is not int or args['seed']!=run['seed']or type(args.get('isWin'))is not bool or p['privateDay']!=run['day']:raise ValueError('Trận không khớp lượt cướp')
    find(store,mode,run['target'],run['ctime'])
    from .battle_prefetch import outcome
    out=await outcome(store,p['id'],{'mode':'practice','team':combat_raw(run['attack']),'defender':combat_raw(run['defense']),'seed':run['seed']})
    if out['isWin']!=args['isWin']:raise ValueError('Kết quả đặc huấn không khớp engine')
    with store.transaction():
        current=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
        if not current or current['data']!=row['data']or current['expires']<time.time():raise ValueError('Lượt cướp đã đổi hoặc đã nhận')
        p=store.player(account);before=snapshot(p);target,other=find(store,mode,run['target'],run['ctime'])
        if p['privateDay']!=run['day']or p['id']in other['attackerIds']or other['beAttackTimes']>=other['maxBeAttackTimes']:raise ValueError('Lượt cướp không còn hợp lệ')
        rewards=[];other['attackerIds'].append(p['id']);other['beAttackTimes']+=1
        if out['isWin']:
            ratio=rate(run['attack']['playerLevel'],other['playerLevel']);rewards=reward(mode,other['type'],other['playerLevel'],other['level'],other['vipLevel'],ratio,True)
            for item in reward(mode,other['type'],other['playerLevel'],other['level'],other['vipLevel'],ratio):key=str(item['entityId']);other['losses'][key]=other['losses'].get(key,0)+item['count']
        save_session(store,mode,run['target'],run['ctime'],other);recipient=profile_by_id(store,run['target']);notice(store,recipient,cfg(mode)['BE_ATTACK_MAIL_TITLE'],p['name']+(' won the raid.'if out['isWin']else ' lost the raid.'));store.save(recipient)
        awarded=grant(p,rewards);store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot));store.save(p);store.audit('practice'if mode=='practice'else 'six_practice',{'player':p['id'],'defender':run['target'],'isWin':out['isWin']})
        return delta(before,p,'logic.'+mode+'Handler.challenge',{'entityCountMap':awarded})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác đặc huấn không tồn tại')
    mode='sixPractice'if '.sixPracticeHandler.'in route else 'practice';action=route.rsplit('.',1)[-1]
    if action=='challenge':return await challenge(store,account,mode,args)
    with store.transaction():
        p=store.player(account);admit(p,mode);before=snapshot(p);temp={}
        if action=='setDefenseInfo':defend(store,p,mode,args)
        elif action=='choose':
            run=choose(store,p,mode,args);temp.update(attackTeam=run['attack'],defenseTeam=run['defense'],seed=run['seed'])
        elif action=='defenseTeam':row,data=find(store,mode,args.get('playerId'),args.get('ctime'));temp['defenseTeam']=view(data)
        else:
            rows=store.db.execute('SELECT data FROM practice_sessions WHERE mode=?AND settled=0 AND finish>?ORDER BY player=?,ctime LIMIT ?',(mode,time.time()*1000,p['id'],cfg(mode)['MATCH_PLAYER_COUNT'])).fetchall();values=[{**public_data['team'],**{key:public_data[key]for key in ('level','type','ctime')}}for public_data in map(lambda r:json.loads(r['data']),rows)]
            if mode=='sixPractice':temp['defenseInfos']=values
            else:temp['defenseInfosMap']={str(kind):[v for v in values if v['type']==kind]for kind in range(1,5)}
        store.save(p);return delta(before,p,route,temp)
