"""Scheduled world/guild damage contests with original-engine verification.

Original tables define schedules, brackets, allowed roles and rewards. Each
player fights a private full-HP copy; cumulative damage ranks are server owned.
"""
import copy,datetime,json,math,secrets,time
from .rules import constants
from .profile import table
from .state import snapshot,delta,consume
from .battle import build_team,validate_team,validate_records,simulate_async
from .tail import mob_team
from .arena import combat_raw
from .adventure import grant
from .item_actions import description
from .social import public
ROUTES={'logic.worldBossHandler.'+a for a in ('openInfo','choose','challenge','dmgRank','inspire')}|{'logic.guildBossHandler.'+a for a in ('openInfo','choose','challenge','dmgRank')}
TZ=datetime.timezone(datetime.timedelta(hours=7))

def now():return datetime.datetime.fromtimestamp(time.time(),TZ)
def config(mode):return constants('server.'+('WORLD_BOSS'if mode=='worldBoss'else 'GUILD_BOSS')+'.CONSTS')
def bracket(mode,level):
    cfg=config(mode);index=max([i for i,v in enumerate(cfg['LEVEL_BETWEEN'])if level>=v]+[0]);return index,cfg['LEVEL_TYPE_BETWEEN'][index]
def is_open(mode,clock=None):
    clock=clock or now();cfg=config(mode);return (clock.weekday()+1)%7 in cfg['OPEN_DAYS']and cfg['START_HOURS']<=clock.hour<cfg['END_HOURS']

def ranking(store,mode,day,scope,level):
    rows=store.db.execute('SELECT *FROM boss_damage WHERE mode=?AND day=?AND scope=?AND bracket=?ORDER BY damage DESC,player',(mode,day,scope,level)).fetchall()
    return [{**json.loads(row['info']),'value':row['damage'],'rank':i+1}for i,row in enumerate(rows)]

def rank_reward(mode,level,rank):
    cfg=config(mode);index=cfg['LEVEL_TYPE_BETWEEN'].index(level);exact=cfg['RANK_REWARD_DROP_LIST_MAP']if mode=='worldBoss'else cfg['RANK_REWARD_DROP_LIST_MAPS'][index]
    reward=exact.get(str(rank))
    if reward is None:
        band=max([i for i,v in enumerate(cfg['RANK_BETWEEN'])if rank>=v]+[0]);reward=(cfg['RANK_REWARD_BETWEEN']if mode=='worldBoss'else cfg['RANK_REWARD_BETWEENS'][index])[band]
    return description(reward)if isinstance(reward,str)else copy.deepcopy(reward)

def refresh(store,p):
    before=json.dumps(p,sort_keys=True);clock=now();day=clock.date().isoformat()
    for mode in ('worldBoss','guildBoss'):
        value=p['extra'].setdefault(mode,{});info=value.setdefault('openInfo',{})
        if info.get('day')!=day:info.update(day=day,attackTimes=0,attackTeamIndexs=[],attackShipIndexs=[],upPower=1)
        minimum=65 if mode=='worldBoss'else 30
        info['isOpen']=p['level']>=minimum and (mode=='worldBoss'or bool(p.get('guildId')))and is_open(mode,clock)
        # Tomorrow's timestamp is display metadata; admission always checks the
        # source day/hour schedule rather than trusting this client field.
        info['openTime']=int((clock.replace(hour=config(mode)['START_HOURS'],minute=0,second=0,microsecond=0)+datetime.timedelta(days=1)).timestamp()*1000)
        scope=0 if mode=='worldBoss'else p.get('guildId',0)
        value['playerInfoMap']={}
        for level in config(mode)['LEVEL_TYPE_BETWEEN']:
            top=ranking(store,mode,day,scope,level)
            value['playerInfoMap'][level]=top[0]if top else None
    # Settle all owned closed contests exactly once, including a later login.
    rows=store.db.execute('SELECT b.*FROM boss_damage b LEFT JOIN boss_settlements s ON s.mode=b.mode AND s.day=b.day AND s.scope=b.scope AND s.bracket=b.bracket AND s.player=b.player WHERE b.player=?AND s.player IS NULL',(p['id'],)).fetchall()
    for row in rows:
        if row['day']>=day and clock.hour<config(row['mode'])['END_HOURS']:continue
        if row['day']>day:continue
        ranks=ranking(store,row['mode'],row['day'],row['scope'],row['bracket']);rank=next(v['rank']for v in ranks if v['playerId']==p['id']);reward=rank_reward(row['mode'],row['bracket'],rank)
        store.db.execute('INSERT INTO boss_settlements VALUES(?,?,?,?,?,?)',(row['mode'],row['day'],row['scope'],row['bracket'],p['id'],rank))
        mail={'_id':secrets.token_hex(12),'senderId':0,'senderName':'DB2 Private','title':row['mode']+' rank '+str(rank),'body':'Damage contest '+row['day'],'status':1,'isSys':True,'dropList':reward,'ctime':int(time.time()*1000)}
        p['extra']['mails'].append(mail);store.notify(p['userId'],'onNewMail',{'mail':mail})
    return before!=json.dumps(p,sort_keys=True)

def admit(p,mode):
    if p['level']<(65 if mode=='worldBoss'else 30):raise ValueError('Chưa đủ cấp thử thách boss')
    if mode=='guildBoss'and not p['guildId']:raise ValueError('Chưa gia nhập bang hội')
    if not is_open(mode):raise ValueError('Boss chưa mở theo lịch server UTC+7')

def choose(store,account,mode,args):
    with store.transaction():
        p=store.player(account);before=snapshot(p);admit(p,mode);indices=validate_team(p,args.get('attackTeamIndexs'));ships=args.get('attackShipIndexs',[]);build_team(p,indices,ships);ships=list(map(str,ships));slot='boss:'+mode
        row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone();scope=0 if mode=='worldBoss'else p['guildId'];index,level=bracket(mode,p['level'])
        if row and row['expires']>time.time():
            run=json.loads(row['data'])
            if run['day']==p['privateDay']and run['scope']==scope and run['bracket']==level and run['indices']==indices and run['ships']==ships:return selected(before,p,mode,run)
        cfg=config(mode);info=p['extra'][mode]['openInfo'];roles={r['kindId']:r for r in table('role')}
        if mode=='worldBoss'and (len(indices)!=5 or any(roles[p['team']['roles'][key]['kindId']]['classId']not in cfg['ALLOW_CLASS_IDS']for key in indices)):raise ValueError('Cần đúng năm chiến binh trong danh sách cho phép')
        if set(indices)&set(map(str,info['attackTeamIndexs']))or set(ships)&set(map(str,info['attackShipIndexs'])):raise ValueError('Chiến binh/đồng hành đã dùng trong ngày')
        maximum=3 if mode=='worldBoss'else cfg['ATTACK_TIMES_BETWEEN'][index]
        if info['attackTimes']>=maximum:raise ValueError('Đã hết lượt đánh boss hôm nay')
        raw={'playerId':p['id'],'roles':[copy.deepcopy(p['team']['roles'][key])for key in indices],'ships':[copy.deepcopy(p['bag']['items'][key])for key in ships]}
        for role in raw['roles']:
            for attr in ('hp','atk','def','mdef'):role['attr'][attr]*=info['upPower']
        hp=10**10*(index+1);defender=mob_team(cfg['BOSS_MOB_ID']if mode=='worldBoss'else cfg['BOSS_MOB_ID_BETWEEN'][index],p['level'],hp)
        run={'day':p['privateDay'],'scope':scope,'bracket':level,'indices':indices,'ships':ships,'attack':raw,'team':combat_raw(raw),'defender':defender,'seed':secrets.randbelow(2**31-1)+1}
        info['attackTimes']+=1;info['attackTeamIndexs']+=list(map(int,indices));info['attackShipIndexs']+=list(map(int,ships));info['upPower']=1
        store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],slot,json.dumps(run),int(time.time())+900));store.save(p)
        return selected(before,p,mode,run)

def selected(before,p,mode,run):return delta(before,p,'logic.'+mode+'Handler.choose',{'seed':run['seed'],'attackTeam':run['attack'],'defenseTeam':run['defender']})

async def challenge(store,account,mode,args):
    p=store.player(account);admit(p,mode);slot='boss:'+mode;row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
    if not row or row['expires']<time.time():raise ValueError('Không có trận boss đang chờ')
    run=json.loads(row['data']);indices=validate_team(p,args.get('attackTeamIndexs'));ships=args.get('attackShipIndexs',[])
    if not isinstance(ships,list)or indices!=run['indices']or list(map(str,ships))!=run['ships']or type(args.get('seed'))is not int or args['seed']!=run['seed']or run['day']!=p['privateDay']or run['scope']!=(0 if mode=='worldBoss'else p['guildId']):raise ValueError('Trận không khớp lượt boss đã chọn')
    records=args.get('manualRecordMap',{});validate_records(records)
    if type(args.get('isAuto'))is not bool or type(args.get('tickNumber'))is not int:raise ValueError('Cần client hỗ trợ replay boss')
    reported=args.get('bossHp')
    if type(reported)not in (int,float)or not math.isfinite(reported):raise ValueError('HP boss không hợp lệ')
    out=await simulate_async({'mode':'boss','bossType':'BOSS'if mode=='worldBoss'else 'GUILD_BOSS','team':run['team'],'defender':run['defender'],'seed':run['seed'],'auto':args['isAuto'],'manualRecordMap':records})
    if reported!=out['bossHp']or args['tickNumber']!=out['tickNumber']:raise ValueError('Kết quả boss không khớp engine server')
    with store.transaction():
        current=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
        if not current or current['data']!=row['data']or current['expires']<time.time():raise ValueError('Trận boss đã đổi hoặc đã được nhận')
        p=store.player(account);admit(p,mode);before=snapshot(p)
        if p['privateDay']!=run['day']or mode=='guildBoss'and p['guildId']!=run['scope']:raise ValueError('Kỳ boss hoặc bang hội đã đổi')
        damage=max(0,run['defender']['roles'][0]['hp']-out['bossHp'])
        if damage:
            store.db.execute('INSERT INTO boss_damage VALUES(?,?,?,?,?,?,?)ON CONFLICT(mode,day,scope,bracket,player)DO UPDATE SET damage=damage+excluded.damage,info=excluded.info',(mode,run['day'],run['scope'],run['bracket'],p['id'],damage,json.dumps(public(p))))
        rewards=grant(p,description(config(mode)['CHALLENGE_REWARD_DESC']))if mode=='guildBoss'else {}
        store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot));refresh(store,p);store.save(p);store.audit(mode+'_challenge',{'player':p['id'],'damage':damage})
        return delta(before,p,'logic.'+mode+'Handler.challenge',{'entityCountMap':rewards})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác boss không tồn tại')
    mode='worldBoss'if '.worldBossHandler.'in route else 'guildBoss';action=route.rsplit('.',1)[-1]
    if action=='choose':return choose(store,account,mode,args)
    if action=='challenge':return await challenge(store,account,mode,args)
    with store.transaction():
        p=store.player(account);before=snapshot(p);temp={};cfg=config(mode)
        if action=='inspire':
            admit(p,mode);info=p['extra'][mode]['openInfo']
            if info['upPower']>=2:raise ValueError('Đã đạt mức cổ vũ tối đa 200%')
            consume(p,102,cfg['INSPIRE_COST_GEM']);info['upPower']+=.25;temp.update(isUp=True,upPower=info['upPower'])
        elif action=='dmgRank':
            if mode=='guildBoss'and not p['guildId']:raise ValueError('Chưa có bang hội')
            level=args.get('type')or bracket(mode,p['level'])[1]
            if level not in cfg['LEVEL_TYPE_BETWEEN']:raise ValueError('Bảng cấp độ không hợp lệ')
            scope=0 if mode=='worldBoss'else p['guildId'];ranks=ranking(store,mode,p['privateDay'],scope,level);mine=next((r for r in ranks if r['playerId']==p['id']),{})
            temp.update(list=ranks[:100],myRank=mine.get('rank',0),myValue=mine.get('value',0))
        if action=='openInfo':temp.update(openInfo=p['extra'][mode]['openInfo'],playerInfoMap=p['extra'][mode]['playerInfoMap'])
        store.save(p);result=delta(before,p,route,temp)
        # openInfo is also the refresh entry point for scenes whose constructor
        # may have cleared a cached extra object.
        result['extra']={**result.get('extra',{}),mode:p['extra'][mode]}
        return result
