"""Durable ladder, snapshotted PvP runs and deterministic original-engine results."""
import copy,json,secrets,time,datetime
from .profile import table,character
from .inventory import entity
from .state import integer,snapshot,delta,consume,vip_data
from .rules import constants
from .progression import learn_skills,friendships
from .battle import validate_team,build_team,simulate_async
from .social import public,profile_by_id
from .item_actions import description
from .adventure import grant
ROUTES={'logic.arenaHandler.'+name for name in ('info','match','setDefenseTeamIndexs','buyChallengeTimes','defenseTeam','choose','challenge','reportList','report')}

def npc(rank):
    row=next(r for r in table('robot')if r['miniRange']<=rank<=r['maxRange'])
    # Twenty fixed private opponents, using the shipped robot stat template.
    role_row=next(r for r in table('role')if entity(r['kindId'])['color']==row['color']and r['positionType']==row['positionType'])
    role=character(role_row['kindId'],1,row['star']);role['level']=row['level'];role['attr']={key:row[key]for key in ('hp','atk','def','mdef','hit','crit','dodge')};role['initAttr']=dict(role['attr']);role['skills']={str(k):{'kindId':k,'level':row['skillLevel']}for k in role_row['skillIds'][:row['skillNum']]}
    power=round(row['hp']*.1+row['atk']+row['def']+row['mdef']+2*row['hit']+30*row['skillNum']*row['skillLevel']);role['power']=power
    return {'id':-rank,'userId':None,'name':'Sparring '+str(rank),'level':row['level'],'serverId':1,'photoInfo':{'photoImgId':entity(role_row['kindId'])['imgId'],'shipImgId':900},'power':power,'team':{'roles':{'1':role}},'bag':{'items':{}},'arena':{'defenseTeamIndexs':[1],'defenseShipIndexs':[]}}

def seed_ladder(store):
    if store.db.execute('SELECT 1 FROM arena_entries LIMIT 1').fetchone():return
    for position in range(1,21):
        p=npc(position);store.db.execute('INSERT INTO arena_entries VALUES(?,?,?,?)',(p['id'],position,'npc',json.dumps(p)))

def ensure(store,p):
    if p['level']<constants('server.ARENA.CONSTS.REQUIRED_LEVEL'):raise ValueError('武道会 cần đội cấp 10')
    seed_ladder(store);entry=store.db.execute('SELECT rank FROM arena_entries WHERE player=?',(p['id'],)).fetchone()
    p['vip'].setdefault('buyChallengeTimesTimes',0)
    if not entry:
        rank=store.db.execute('SELECT max(rank)FROM arena_entries').fetchone()[0]+1
        store.db.execute('INSERT INTO arena_entries VALUES(?,?,?,?)',(p['id'],rank,'player','{}'));p['arena'].update(rank=rank,topRank=rank)
    refresh(store,p)
    roles=[key for key in p['arena'].get('defenseTeamIndexs',[])if str(key)in p['team']['roles']]
    if not roles:roles=list(p['team']['roles'])[:5]
    ships=[key for key in p['arena'].get('defenseShipIndexs',[])if str(key)in p['bag']['items']]
    p['arena'].update(defenseTeamIndexs=roles,defenseShipIndexs=ships,maxChallengeTimes=constants('server.ARENA.CONSTS.FREE_TIMES')+p['vip'].get('buyChallengeTimesTimes',0));store.save(p)

def settlement_day():
    now=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
    return (now.date()if now.hour>=constants('server.ARENA.CONSTS.SETTLEMENT_REWARD_HOURS')else now.date()-datetime.timedelta(days=1)).isoformat()

def refresh(store,p):
    entry=store.db.execute('SELECT rank FROM arena_entries WHERE player=?',(p['id'],)).fetchone()
    if not entry:return False
    old=json.dumps(p,sort_keys=True);rank=entry['rank'];p['arena']['rank']=rank
    day=settlement_day();previous=p.get('privateArenaSettlementDay');p['privateArenaSettlementDay']=day
    if previous and previous!=day:
        row=next(r for r in table('arenaRewards')if r['rankBetween'][0]<=rank<=r['rankBetween'][1]);mail={'_id':secrets.token_hex(12),'senderId':0,'senderName':'Arena','title':'Arena daily reward','body':'Private ladder settlement '+day,'status':1,'isSys':True,'dropList':description(row['dropListDesc']),'ctime':int(time.time()*1000)}
        p['extra']['mails'].append(mail);p['arena']['dailyRank']=rank;store.notify(p['userId'],'onNewMail',{'mail':mail})
    return old!=json.dumps(p,sort_keys=True)

def participant(store,pid):
    entry=store.db.execute('SELECT * FROM arena_entries WHERE player=?',(pid,)).fetchone()
    if not entry:raise ValueError('Đối thủ không tồn tại trên bảng đấu')
    return (json.loads(entry['data'])if entry['source']=='npc'else profile_by_id(store,pid)),entry['rank']

def raw_team(p):
    indices=p['arena'].get('defenseTeamIndexs')or list(p['team']['roles'])[:5];indices=[str(k)for k in indices if str(k)in p['team']['roles']]
    if not indices:raise ValueError('Đội phòng thủ không có chiến binh')
    ships=p['arena'].get('defenseShipIndexs',[])
    return {'playerId':p['id'],'playerName':p['name'],'playerLevel':p['level'],'playerPhotoInfo':p['photoInfo'],'roles':[copy.deepcopy(p['team']['roles'][str(k)])for k in indices],'ships':[copy.deepcopy(p['bag']['items'][str(k)])for k in ships if str(k)in p['bag']['items']]}

def combat_raw(raw):
    fake={'id':raw['playerId'],'team':{'roles':{str(role['idx']):role for role in raw['roles']}},'bag':{'items':{str(item['idx']):item for item in raw['ships']}}}
    return build_team(fake,list(fake['team']['roles']),list(fake['bag']['items']))

def choose(store,account,args):
    defender=integer(args.get('defenderId'),'Đối thủ',-10000,10**9)
    with store.transaction():
        p=store.player(account);before=snapshot(p);ensure(store,p);indices=validate_team(p,args.get('attackTeamIndexs'));ships=args.get('attackShipIndexs',[]);build_team(p,indices,ships)
        if defender==p['id']:raise ValueError('Không thể tự thách đấu')
        prior=store.db.execute('SELECT *FROM pvp_runs WHERE player=? AND mode=?',(p['id'],'arena')).fetchone()
        if prior and prior['expires']>time.time():
            run=json.loads(prior['data'])
            if run['defenderId']==defender and run['indices']==indices and list(map(str,run['shipIndices']))==list(map(str,ships)):return delta(before,p,'logic.arenaHandler.choose',{'attackTeam':run['attackTeam'],'defenseTeam':run['defenseTeam'],'seed':run['seed']})
        if p['arena']['remainingChallengeTimes']<=0:raise ValueError('Đã hết lượt thách đấu hôm nay')
        other,rank=participant(store,defender);defense=raw_team(other);attack={'playerId':p['id'],'playerName':p['name'],'playerLevel':p['level'],'playerPhotoInfo':p['photoInfo'],'roles':[copy.deepcopy(p['team']['roles'][key])for key in indices],'ships':[copy.deepcopy(p['bag']['items'][str(key)])for key in ships]}
        p['arena']['remainingChallengeTimes']-=1;seed=secrets.randbelow(2**31-1)+1;run={'defenderId':defender,'indices':indices,'shipIndices':ships,'attackTeam':attack,'defenseTeam':defense,'seed':seed}
        store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],'arena',json.dumps(run),int(time.time())+900));store.save(p);store.audit('arena_choose',{'player':p['id'],'defender':defender})
        return delta(before,p,'logic.arenaHandler.choose',{'attackTeam':attack,'defenseTeam':defense,'seed':seed})

async def challenge(store,account,args):
    p=store.player(account)
    if not p:raise ValueError('Chưa có nhân vật')
    row=store.db.execute('SELECT * FROM pvp_runs WHERE player=? AND mode=?',(p['id'],'arena')).fetchone()
    if not row or row['expires']<=time.time():raise ValueError('Trận đấu không tồn tại hoặc đã hết hạn')
    run=json.loads(row['data']);indices=validate_team(p,args.get('attackTeamIndexs'));seed=integer(args.get('seed'),'Seed',1,2**31-1)
    if args.get('defenderId')!=run['defenderId']or indices!=run['indices']or list(map(str,args.get('attackShipIndexs',[])))!=list(map(str,run['shipIndices']))or seed!=run['seed']or type(args.get('isWin'))is not bool:raise ValueError('Thông tin trận đấu không khớp')
    background=integer(args.get('bgImgId'),'Hình nền',1,100000)
    if background not in constants('battle.ARENA_BACKGROUND_IMG_IDS'):raise ValueError('Hình nền trận đấu không hợp lệ')
    result=await simulate_async({'mode':'pvp','team':combat_raw(run['attackTeam']),'defender':combat_raw(run['defenseTeam']),'seed':seed})
    if result['isWin']!=args['isWin']:raise ValueError('Kết quả không khớp engine chiến đấu')
    with store.transaction():
        check=store.db.execute('SELECT data FROM pvp_runs WHERE player=? AND mode=?',(p['id'],'arena')).fetchone()
        if not check or check['data']!=row['data']:raise ValueError('Trận đấu đã được xử lý hoặc thay đổi')
        p=store.player(account);before=snapshot(p);ensure(store,p);old_rank=p['arena']['rank'];other,other_rank=participant(store,run['defenderId']);up=0
        if result['isWin']and other_rank<old_rank:
            store.db.execute('UPDATE arena_entries SET rank=0 WHERE player=?',(p['id'],));store.db.execute('UPDATE arena_entries SET rank=? WHERE player=?',(old_rank,other['id']));store.db.execute('UPDATE arena_entries SET rank=?WHERE player=?',(other_rank,p['id']));p['arena']['rank']=other_rank;up=old_rank-other_rank
            if other['id']>0:other['arena']['rank']=old_rank;store.save(other);store.notify(other['userId'],'onSync',{'code':200,'arena':other['arena']})
        best=p['arena'].get('topRank',old_rank);new_best=min(best,p['arena']['rank']);rewards=[]
        for reward in table('arenaAchieveRewards'):
            if new_best<=reward['rank']<best:rewards.extend(description(reward['dropListDesc']))
        p['arena']['topRank']=new_best;entities=grant(p,rewards);report_id=secrets.token_hex(12);now=int(time.time()*1000)
        report={'id':report_id,'type':'arena','ctime':now,'attackTeam':run['attackTeam'],'defenseTeam':run['defenseTeam'],'seed':seed,'isWin':result['isWin'],'damageMap':result['damageMap'],'bgImgId':background,'up':up}
        store.db.execute('INSERT INTO battle_reports VALUES(?,?,?,?,?)',(report_id,'arena',p['id'],other['id'],json.dumps(report)));store.db.execute('DELETE FROM pvp_runs WHERE player=? AND mode=?',(p['id'],'arena'));store.save(p);store.audit('arena_challenge',{'player':p['id'],'defender':other['id'],'isWin':result['isWin']})
        return delta(before,p,'logic.arenaHandler.challenge',{'reportId':report_id,'rank':p['arena']['rank'],'entityCountMap':entities})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác arena không tồn tại')
    if not store.player(account):raise ValueError('Chưa có nhân vật')
    action=route.rsplit('.',1)[-1]
    if action=='choose':return choose(store,account,args)
    if action=='challenge':return await challenge(store,account,args)
    with store.transaction():
        p=store.player(account);before=snapshot(p);ensure(store,p);temp={}
        if action=='setDefenseTeamIndexs':
            indices=validate_team(p,args.get('defenseTeamIndexs'));ships=args.get('defenseShipIndexs',[]);build_team(p,indices,ships);p['arena'].update(defenseTeamIndexs=indices,defenseShipIndexs=ships)
        elif action=='buyChallengeTimes':
            count=p['vip'].get('buyChallengeTimesTimes',0)
            if p['arena']['remainingChallengeTimes']or count>=vip_data(p)['buyChallengeTimesTimes']:raise ValueError('Chưa cần mua lượt hoặc đã hết hạn mức VIP')
            costs=constants('server.ARENA.CONSTS.BUY_CHALLENGE_TIMES');consume(p,102,costs[min(count+1,len(costs)-1)]);p['vip']['buyChallengeTimesTimes']=count+1;p['arena']['remainingChallengeTimes']+=1;p['arena']['maxChallengeTimes']+=1
        elif action=='match':
            rows=store.db.execute('SELECT player,rank FROM arena_entries WHERE player<>? ORDER BY rank',(p['id'],)).fetchall();rank=p['arena']['rank'];chosen=[]
            for target in (max(1,rank//2),max(1,rank-2),rank+2):
                entry=min((row for row in rows if row['player']not in chosen),key=lambda row:abs(row['rank']-target));chosen.append(entry['player'])
            for key,pid in zip(('smaller','middle','larger'),chosen):
                other,rank=participant(store,pid);temp[key]={**public(other),'rank':rank,'totalPower':other['power']}
        elif action=='defenseTeam':
            pid=integer(args.get('playerId'),'Đối thủ',-10000,10**9)
            other,rank=(profile_by_id(store,pid),0)if args.get('isShow')is True and pid>0 else participant(store,pid)
            temp['defenseTeam']={**public(other),**raw_team(other),'totalPower':sum(r.get('power',0)for r in raw_team(other)['roles']),'rank':rank}
        elif action=='reportList':
            rows=store.db.execute('SELECT * FROM battle_reports WHERE mode=? AND(attacker=?OR defender=?)ORDER BY rowid DESC LIMIT 50',('arena',p['id'],p['id'])).fetchall();logs=[]
            for row in rows:
                report=json.loads(row['data']);attacker=row['attacker']==p['id'];other=report['defenseTeam']if attacker else report['attackTeam'];logs.append({'id':row['id'],'ctime':report['ctime'],'isAttacker':attacker,'isWin':report['isWin']if attacker else not report['isWin'],'up':report['up']if attacker else -report['up'],'is3v3':False,'playerInfo':other})
            temp['reportList']=logs
        elif action=='report':
            rid=args.get('id')
            if not isinstance(rid,str):raise ValueError('ID báo cáo không hợp lệ')
            row=store.db.execute("SELECT *FROM battle_reports WHERE id=?AND(attacker=?OR defender=?OR mode IN ('worshipBattle','doubleBattle'))",(rid,p['id'],p['id'])).fetchone()
            if not row:raise ValueError('Báo cáo không thuộc tài khoản')
            temp['report']=json.loads(row['data'])
        store.save(p);return delta(before,p,route,temp)
