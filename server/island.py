"""Original island DTOs/formulas; documented private capture and settlement policy."""
import copy,datetime,json,math,secrets,time
from .rules import constants
from .state import integer,snapshot,delta,consume
from .profile import table
from .social import public,profile_by_id
from .battle import validate_team,build_team,simulate_async
from .arena import combat_raw
from .adventure import grant
from .item_actions import random_description,description
from .practice import notice
ROUTES={'logic.islandHandler.'+a for a in ('match','practice','defenseTeam','choose','challenge','settlement','earlySettlement','buyChallengeTimes','enemyList','myIslandList','reviveRole','setNeedHelp','help','reportList','report')}

def cfg():return constants('server.ISLAND.CONSTS')
def now():return int(time.time()*1000)
def area(level):return 1 if level<71 else 2 if level<81 else 3 if level<91 else 4
def tier(resource):return 4 if resource==-1 else 1 if resource<=3 else 2 if resource<=9 else 3
def admit(p):
    if p['level']<61:raise ValueError('Đảo tài nguyên mở từ cấp 61')
def rows(store,pid):return store.db.execute('SELECT *FROM island_sessions WHERE active=1 AND finish>?AND(owner=?OR guard=?)ORDER BY id',(now(),pid,pid)).fetchall()
def data(row):return json.loads(row['data'])
def dto(row):
    d=data(row);return {'id':row['id'],'resourceId':row['resource'],'playerId':row['owner'],'playerLevel':d['owner']['playerLevel'],'playerInfo':d['owner'],'defenserId':row['guard'],'ctime':row['ctime'],'finishTime':row['finish'],'isNeedHelp':d['help']}
def week():
    day=datetime.datetime.fromtimestamp(time.time(),datetime.timezone(datetime.timedelta(hours=7))).date()
    return (day-datetime.timedelta(days=day.weekday())).isoformat()
def score(store,p,kind,count):
    if count>0:store.db.execute('INSERT INTO island_scores VALUES(?,?,?,?)ON CONFLICT(week,kind,player)DO UPDATE SET score=score+excluded.score',(week(),kind,p['id'],count))
def settle_rankings(store):
    for period in store.db.execute('SELECT DISTINCT week FROM island_scores WHERE week<?',(week(),)).fetchall():
        for kind,column in (('coin','dropListDesc1'),('help_times','dropListDesc2')):
            for rank,row in enumerate(store.db.execute('SELECT player,score FROM island_scores WHERE week=?AND kind=?AND score>0 ORDER BY score DESC,player',(period[0],kind)).fetchall(),1):
                if store.db.execute('SELECT 1 FROM island_awards WHERE week=?AND kind=?AND player=?',(period[0],kind,row['player'])).fetchone():continue
                reward_row=next((r for r in table('islandRewards')if r['rankBetween'][0]<=rank<=r['rankBetween'][1]),None)
                if reward_row:
                    target=store.player(profile_by_id(store,row['player'])['userId']);notice(store,target,'Island weekly ranking','Private Monday settlement '+period[0]+'; rank '+str(rank),description(reward_row[column]));store.save(target)
                store.db.execute('INSERT INTO island_awards VALUES(?,?,?)',(period[0],kind,row['player']))

def refresh(store,p):
    old=json.dumps(p,sort_keys=True);s=p.setdefault('island',{});v=p.setdefault('privateIsland',{})
    if 'spent'not in v or v.get('day')!=p.get('privateDay'):v.update(day=p.get('privateDay'),spent=0,bought=0)
    locks=s.get('teamIdxUnLockTimeMap',{});s.update(attackerIds=v.get('attackers',[]),buyChallengeTimesTimes=v.get('bought',0),remainingChallengeTimes=max(0,cfg()['CHALLENGE_TIMES']+v['bought']-v['spent']),defenseInfoMap={},defenseTeamIndexs=[],defenseShipIndexs=[],helpTeamIndexs=[],helpShipIndexs=[],teamIdxUnLockTimeMap={k:t for k,t in locks.items()if t>now()})
    if store:
        for row in rows(store,p['id']):
            d=data(row);s['defenseInfoMap'][str(row['id'])]=dto(row);prefix='defense'if row['owner']==p['id']else 'help'
            team=d['ownerTeam']if prefix=='defense'else d['guardTeam'];s[prefix+'TeamIndexs']+=list(map(int,[r['idx']for r in team['roles']]));s[prefix+'ShipIndexs']+=list(map(int,[r['idx']for r in team['ships']]))
    if store:
        for kind in ('coin','help_times'):
            row=store.db.execute('SELECT score FROM island_scores WHERE week=?AND kind=?AND player=?',(week(),kind,p['id'])).fetchone();p.setdefault('rankScores',{})['island_plunder_'+kind]=row[0]if row else 0
    s['remainingDefenseTimes']=max(0,cfg()['DEFENSE_TIMES']-len(s['defenseInfoMap']))
    return old!=json.dumps(p,sort_keys=True)
def expire(store):store.db.execute('UPDATE island_sessions SET active=0 WHERE active=1 AND finish<=?',(now(),))
def find(store,sid):
    integer(sid,'Mỏ',1);r=store.db.execute('SELECT *FROM island_sessions WHERE id=?AND active=1 AND finish>?',(sid,now())).fetchone()
    if not r:raise ValueError('Mỏ đã kết thúc hoặc không tồn tại')
    return r

def save(store,row,d):store.db.execute('UPDATE island_sessions SET data=?WHERE id=?',(json.dumps(d),row['id']))
def team(store,p,indices,ships):
    refresh(store,p);indices=validate_team(p,indices);build_team(p,indices,ships);ships=list(map(str,ships));s=p['island']
    if not s['remainingDefenseTimes']:raise ValueError('Đã dùng hết ba vị trí khai thác/hộ vệ')
    used=set(map(str,s['defenseTeamIndexs']+s['helpTeamIndexs']));used_ships=set(map(str,s['defenseShipIndexs']+s['helpShipIndexs']))
    if used&set(indices)or used_ships&set(ships)or any(str(i)in s['teamIdxUnLockTimeMap']for i in indices):raise ValueError('Đội hình đang khai thác, hộ vệ hoặc chờ hồi sinh')
    if any(p['team']['roles'][i]['level']<cfg()['AREA_NEED_ROLE_LEVEL_MAP'][str(area(p['level']))]for i in indices):raise ValueError('Chiến binh chưa đủ cấp khu vực')
    return {**public(p),'totalPower':sum(p['team']['roles'][i].get('power',0)for i in indices),'roles':[copy.deepcopy(p['team']['roles'][i])for i in indices],'ships':[copy.deepcopy(p['bag']['items'][i])for i in ships]},indices,ships

def start(store,p,resource,helping,raw):
    d={'owner':public(p),'ownerTeam':raw,'guardTeam':raw,'help':helping};t=now();sid=store.db.execute('INSERT INTO island_sessions(owner,guard,area,resource,ctime,finish,active,claimed,data)VALUES(?,?,?,?,?,?,1,0,?)',(p['id'],p['id'],area(p['level']),resource,t,t+cfg()['PRACTICE_TIME'],json.dumps(d))).lastrowid;return sid

def reward(row,ratio=1):
    h=max(0,(min(now(),row['finish'])-row['ctime'])//1800000);d=data(row);out=[];money=math.ceil(cfg()['RES_HALF_HOURS_REWARD_MONEY_COUN_MAP'][str(tier(row['resource']))]*h*ratio)
    if money:out.append({'entityId':40,'count':money,'extra':{}})
    if area(d['owner']['playerLevel'])in (1,2)and h:out.append({'entityId':19,'count':10*h,'extra':{}})
    return out

def settle(store,p,selected=None):
    rewards=[]
    for r in store.db.execute('SELECT *FROM island_sessions WHERE owner=?AND claimed=0 AND active=0'+(' AND id=?'if selected else ''),(p['id'],selected)if selected else (p['id'],)).fetchall():
        rewards+=reward(r);level=tier(r['resource'])
        if now()>=r['finish']and level!=4 and secrets.randbelow(100)<cfg()['RES_LEVEL_EXT_DROP_RATE'][str(level)]:rewards+=random_description(cfg()['RES_LEVEL_EXT_DROP_DESC'][str(level)])
        store.db.execute('UPDATE island_sessions SET claimed=1 WHERE id=?AND claimed=0',(r['id'],))
    return grant(p,rewards)

def choose(store,p,args):
    r=find(store,args.get('id'));d=data(r);guard=integer(args.get('defenderId'),'Hộ vệ',1)
    if guard!=r['guard']or p['id']in (r['owner'],guard)or area(p['level'])!=r['area']:raise ValueError('Đối thủ hoặc khu vực không hợp lệ')
    if now()<r['ctime']+1800000:raise ValueError('Mỏ chưa được khai thác đủ nửa giờ')
    raw,indices,ships=team(store,p,args.get('attackTeamIndexs'),args.get('attackShipIndexs',[]));old=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='island'",(p['id'],)).fetchone()
    if old and old['expires']>time.time():
        prior=json.loads(old['data'])
        if prior['day']==p['privateDay']and prior['id']==r['id']and prior['version']==r['data']and prior['indices']==indices and prior['ships']==ships:return prior
    if not p['island']['remainingChallengeTimes']:raise ValueError('Đã hết lượt chiếm đảo')
    run={'day':p['privateDay'],'id':r['id'],'owner':r['owner'],'guard':guard,'version':r['data'],'indices':indices,'ships':ships,'attackTeam':raw,'defenseTeam':d['guardTeam'],'seed':secrets.randbelow(2**31-1)+1};p['privateIsland']['spent']+=1
    store.db.execute("INSERT INTO pvp_runs VALUES(?,'island',?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires",(p['id'],json.dumps(run),min(int(time.time())+900,r['finish']//1000)));return run

def lock_dead(p,result):
    for r in result['roles']:
        if r['hp']<=0 and str(r['idx'])in p['team']['roles']:p['island']['teamIdxUnLockTimeMap'][str(r['idx'])]=now()+cfg()['CHALLENGE_ROLE_LOCK_TIME']

async def challenge(store,account,args):
    p=store.player(account);row=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='island'",(p['id'],)).fetchone()
    if not row or row['expires']<=time.time():raise ValueError('Trận chiếm đảo đã hết hạn')
    run=json.loads(row['data']);indices=validate_team(p,args.get('attackTeamIndexs'));ships=args.get('attackShipIndexs',[])
    if not isinstance(ships,list)or indices!=run['indices']or list(map(str,ships))!=run['ships']or any(type(args.get(k))is not int or args[k]!=run[v]for k,v in (('id','id'),('targetId','owner'),('defenderId','guard'),('seed','seed')))or type(args.get('isWin'))is not bool or args.get('bgImgId')not in constants('battle.ARENA_BACKGROUND_IMG_IDS'):raise ValueError('Thông tin trận chiếm đảo không khớp')
    r=find(store,run['id'])
    if r['data']!=run['version']:raise ValueError('Đội hộ vệ đã thay đổi')
    out=await simulate_async({'mode':'island','team':combat_raw(run['attackTeam']),'defender':combat_raw(run['defenseTeam']),'seed':run['seed']})
    if out['isWin']!=args['isWin']:raise ValueError('Kết quả đảo không khớp engine')
    with store.transaction():
        current=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='island'",(p['id'],)).fetchone();p=store.player(account);before=snapshot(p);r=find(store,run['id'])
        if not current or current['data']!=row['data']or current['expires']<=time.time()or r['data']!=run['version']or p['privateDay']!=run['day']:raise ValueError('Trận đã xử lý hoặc đội hình thay đổi')
        team(store,p,run['indices'],run['ships'])
        if area(p['level'])!=r['area']:raise ValueError('Bạn đã đổi khu vực trong lúc chiến đấu')
        owner=store.player(profile_by_id(store,r['owner'])['userId']);guard=owner if r['guard']==r['owner']else store.player(profile_by_id(store,r['guard'])['userId']);rewards=[];d=data(r)
        lock_dead(p,out['attacker']);lock_dead(guard,out['defender'])
        for victim in {owner['id']:owner,guard['id']:guard}.values():
            attackers=victim['privateIsland'].setdefault('attackers',[])
            if p['id']not in attackers:attackers.append(p['id'])
            victim['privateIsland']['attackers']=attackers[-50:];victim['privateIsland'].setdefault('attackCounts',{})[str(p['id'])]=victim['privateIsland'].get('attackCounts',{}).get(str(p['id']),0)+1
        if out['isWin']:
            ratio=max(.099,min(.1995,.15-.15*(p['level']-d['owner']['playerLevel'])/10))*(2 if r['owner']in p['island']['attackerIds']else 1);rewards=reward(r,ratio);full=reward(r);stolen=next((x['count']for x in rewards if x['entityId']==40),0)
            for x in full:
                if x['entityId']==40:x['count']=max(0,x['count']-stolen)
            notice(store,owner,'Island captured','Accrued production less plunder. Private capture policy.',full);store.db.execute('UPDATE island_sessions SET active=0,claimed=1 WHERE id=?',(r['id'],))
            survivors={str(x['idx'])for x in out['attacker']['roles']if x['hp']>0};new=copy.deepcopy(run['attackTeam']);new['roles']=[x for x in new['roles']if str(x['idx'])in survivors]
            if new['roles']:start(store,p,r['resource'],False,new)
            score(store,p,'coin',stolen)
        elif guard['id']!=owner['id']:
            score(store,guard,'help_times',1);notice(store,guard,'Island defense','Private guard victory stipend.',[{'entityId':40,'count':10,'extra':{}}])
        for victim in {owner['id']:owner,guard['id']:guard}.values():refresh(store,victim);store.save(victim)
        awarded=grant(p,rewards);rid=secrets.token_hex(12);report={'id':rid,'ctime':now(),'type':'islandBattle','attackTeam':run['attackTeam'],'defenseTeam':run['defenseTeam'],'seed':run['seed'],'isWin':out['isWin'],'bgImgId':args['bgImgId'],'damageMap':out['damageMap'],'entityCountMap':awarded,'resourceId':r['resource']}
        store.db.execute("INSERT INTO battle_reports VALUES(?,'island',?,?,?)",(rid,p['id'],r['guard'],json.dumps(report)));store.db.execute("DELETE FROM pvp_runs WHERE player=?AND mode='island'",(p['id'],));refresh(store,p);store.save(p);store.audit('island_challenge',{'player':p['id'],'owner':r['owner'],'guard':r['guard'],'isWin':out['isWin']});return delta(before,p,'logic.islandHandler.challenge',{'entityCountMap':awarded,'reportId':rid})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác đảo không tồn tại')
    action=route.rsplit('.',1)[-1]
    if action=='challenge':return await challenge(store,account,args)
    with store.transaction():
        expire(store);settle_rankings(store);p=store.player(account);admit(p);before=snapshot(p);temp={}
        if action=='match':
            occupied=store.db.execute('SELECT *FROM island_sessions WHERE active=1 AND area=?ORDER BY id DESC',(area(p['level']),)).fetchall();base={str(i):{'resourceId':i}for i in range(1,19)};low=[]
            for r in occupied:
                if r['resource']>0:base[str(r['resource'])]=dto(r)
                elif len(low)<30:low.append(dto(r))
            temp.update(info={'baseResInfoMap':base,'lowestResInfos':low,'isNeedSettlement':bool(store.db.execute('SELECT 1 FROM island_sessions WHERE owner=?AND active=0 AND claimed=0',(p['id'],)).fetchone())},island=copy.deepcopy(p['island']))
        elif action=='practice':
            resource=integer(args.get('resourceId'),'Tài nguyên',-1,18)
            if resource==0 or type(args.get('isNeedHelp'))is not bool or resource==-1 and args['isNeedHelp']:raise ValueError('Tài nguyên/yêu cầu hộ vệ không hợp lệ')
            raw,_,_=team(store,p,args.get('defenseTeamIndexs'),args.get('defenseShipIndexs',[]))
            if not p['island']['remainingChallengeTimes']:raise ValueError('Đã hết lượt chiếm đảo')
            if resource>0 and store.db.execute('SELECT 1 FROM island_sessions WHERE area=?AND resource=?AND active=1',(area(p['level']),resource)).fetchone():raise ValueError('Mỏ đã có người chiếm')
            start(store,p,resource,args['isNeedHelp'],raw);p['privateIsland']['spent']+=1
        elif action=='choose':
            run=choose(store,p,args);temp.update({k:run[k]for k in ('attackTeam','defenseTeam','seed')})
        elif action=='defenseTeam':
            r=find(store,args.get('id'))
            if type(args.get('playerId'))is not int or args['playerId']!=r['owner']:raise ValueError('Chủ mỏ không khớp')
            temp['defenseTeam']=data(r)['guardTeam']
        elif action=='myIslandList':temp['resourceInfoIdTeamMap']={str(r['id']):data(r)['guardTeam']for r in rows(store,p['id'])}
        elif action=='settlement':temp['entityCountMap']=settle(store,p)
        elif action=='earlySettlement':
            r=find(store,args.get('resourceInfoId'));d=data(r)
            if p['id']==r['owner']:
                # Preserve the real finish timestamp for accrual, but no full-cycle bonus.
                store.db.execute('UPDATE island_sessions SET active=0 WHERE id=?',(r['id'],));temp['entityCountMap']=settle(store,p,r['id'])
            elif p['id']==r['guard']:
                d['guardTeam']=d['ownerTeam'];d['help']=False;store.db.execute('UPDATE island_sessions SET guard=?WHERE id=?',(r['owner'],r['id']));save(store,r,d)
            else:raise ValueError('Mỏ không thuộc đội của bạn')
        elif action=='setNeedHelp':
            r=find(store,args.get('resourceInfoId'));d=data(r)
            if r['owner']!=p['id']or r['resource']==-1 or type(args.get('isNeedHelp'))is not bool:raise ValueError('Không thể thay yêu cầu hộ vệ')
            d['help']=args['isNeedHelp'];save(store,r,d)
        elif action=='help':
            r=find(store,args.get('resourceInfoId'));d=data(r)
            if type(args.get('targetId'))is not int or args['targetId']!=r['owner']or r['owner']==p['id']or r['guard']!=r['owner']or not d['help']or r['resource']==-1 or r['area']!=area(p['level']):raise ValueError('Mỏ không nhận hộ vệ này')
            raw,_,_=team(store,p,args.get('defenseTeamIndexs'),args.get('defenseShipIndexs',[]))
            if raw['totalPower']<math.floor(d['ownerTeam']['totalPower']*1.3):raise ValueError('Hộ vệ cần 130% lực chiến đội chủ mỏ')
            d['guardTeam']=raw;store.db.execute('UPDATE island_sessions SET guard=?WHERE id=?',(p['id'],r['id']));save(store,r,d)
        elif action=='buyChallengeTimes':
            n=p['privateIsland']['bought'];consume(p,40,[0,30,30,40,40,50][min(n+1,5)]);p['privateIsland']['bought']+=1
        elif action=='reviveRole':
            idx=args.get('teamIndex')
            if type(idx)not in (int,str)or str(idx)not in p['team']['roles']:raise ValueError('Chiến binh không hợp lệ')
            idx=str(idx);until=p['island']['teamIdxUnLockTimeMap'].get(idx,0)
            if until<=now():raise ValueError('Chiến binh không cần hồi sinh')
            consume(p,40,10*math.ceil((until-now())/3600000));del p['island']['teamIdxUnLockTimeMap'][idx]
        elif action=='enemyList':temp['list']=[{**public(profile_by_id(store,pid)),'attackTimes':p['privateIsland'].get('attackCounts',{}).get(str(pid),0)}for pid in p['island']['attackerIds']]
        elif action=='reportList':
            temp['reportList']=[]
            for r in store.db.execute("SELECT *FROM battle_reports WHERE mode='island'AND(attacker=?OR defender=?)ORDER BY rowid DESC LIMIT 50",(p['id'],p['id'])):
                v=json.loads(r['data']);attacker=r['attacker']==p['id'];temp['reportList'].append({'id':r['id'],'ctime':v['ctime'],'isAttacker':attacker,'isWin':v['isWin']if attacker else not v['isWin'],'playerInfo':v['defenseTeam']if attacker else v['attackTeam'],'resourceId':v['resourceId']})
        elif action=='report':
            if not isinstance(args.get('id'),str):raise ValueError('Báo cáo không hợp lệ')
            r=store.db.execute("SELECT data FROM battle_reports WHERE id=?AND mode='island'AND(attacker=?OR defender=?)",(args['id'],p['id'],p['id'])).fetchone()
            if not r:raise ValueError('Báo cáo không thuộc tài khoản')
            temp['report']=json.loads(r['data'])
        refresh(store,p);store.save(p);return delta(before,p,route,temp)
