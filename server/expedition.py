"""Persistent expedition HP/MP, immutable battle starts and once-only chests."""
import copy,json,math,secrets,time
from .profile import table
from .state import integer,snapshot,delta,vip_data
from .rules import constants
from .battle import validate_team,build_team,validate_records,simulate_async
from .arena import npc,raw_team
from .adventure import grant
from .gameplay import drops
ROUTES={'logic.expeditionHandler.'+a for a in ('reset','skip','challenge','receive')}|{'logic.sixExpeditionHandler.'+a for a in ('info','reset','skip','challenge','receive')}
BEGIN_ROUTE='logic.privateHandler.beginExpedition'

def cfg(six=False):return constants('server.'+('SIX_EXPEDITION'if six else 'EXPEDITION')+'.CONSTS')
def key(six,name):return {'passId':'sixPassId','prePassId':'preSixPassId','status':'sixStatus','selfInfo':'sixSelfInfo','challengerInfo':'sixChallengerInfo'}[name]if six else name
def counter(six):return 'resetSixExpeditionTimes'if six else 'resetExpeditionTimes'
def mode(six):return 'sixExpedition'if six else 'expedition'
def admit(p,six):
    if p['level']<(80 if six else 25):raise ValueError('Chưa đủ cấp mở viễn chinh')

def opponents(p,six):
    # Private matching rule: thirteen/twelve deterministic sparring templates
    # with increasing stats. All stats/skills originate in the robot table.
    result=[]
    for floor in range(1,cfg(six)['CHALLENGER_COUNT']+1):
        other=npc(floor);other['id']=-300000-(100 if six else 0)-floor;other['name']=('Six 'if six else '')+'Expedition '+str(floor);other['level']=p['level'];role=other['team']['roles']['1'];factor=1+floor/10
        for attr in ('hp','atk','def','mdef'):role['attr'][attr]=math.floor(role['attr'][attr]*factor)
        result.append({**raw_team(other),'serverId':1,'guildName':'','totalPower':other['power']})
    return result

def refresh(p):
    old=json.dumps(p,sort_keys=True);state=p.setdefault('expedition',{})
    if p.get('privateExpeditionDay')!=p['privateDay']:
        p['privateExpeditionDay']=p['privateDay']
        for six in (False,True):
            p['vip'][counter(six)]=0;state[key(six,'passId')]=0;state[key(six,'status')]=1;state[key(six,'selfInfo')]={'hpMap':{},'mpMap':{}};p.setdefault('privateExpeditions',{}).pop(mode(six),None)
    for six in (False,True):
        for name,default in (('passId',0),('prePassId',0),('status',1),('selfInfo',{'hpMap':{},'mpMap':{}})):state.setdefault(key(six,name),copy.deepcopy(default))
        if key(six,'challengerInfo')not in state:state[key(six,'challengerInfo')]={'team':opponents(p,six)[0]}
    state.setdefault('sixPlayerInfos',[])
    return old!=json.dumps(p,sort_keys=True)

def state_for(p,six):
    data=p.get('privateExpeditions',{}).get(mode(six))
    if not data:raise ValueError('Hãy đặt lại viễn chinh trước')
    return data

def next_team(p,six):
    data=state_for(p,six);floor=p['expedition'][key(six,'passId')]
    p['expedition'][key(six,'challengerInfo')]={'team':copy.deepcopy(data['teams'][min(floor,len(data['teams'])-1)])}
    data['seed']=secrets.randbelow(2**31-1)+1;data['version']=data.get('version',0)+1

def reset(p,six):
    admit(p,six);state=p['expedition'];used=p['vip'][counter(six)];maximum=vip_data(p)[counter(six)]
    if used>=maximum:raise ValueError('Đã hết lượt đặt lại viễn chinh hôm nay')
    if state[key(six,'status')]==2:raise ValueError('Hãy nhận rương đang chờ trước khi đặt lại')
    state[key(six,'prePassId')]=max(state[key(six,'prePassId')],state[key(six,'passId')]);state[key(six,'passId')]=0;state[key(six,'status')]=1;state[key(six,'selfInfo')]={'hpMap':{},'mpMap':{}};p['vip'][counter(six)]=used+1
    p.setdefault('privateExpeditions',{})[mode(six)]={'teams':opponents(p,six)};next_team(p,six)
    if six:state['sixPlayerInfos']=[{k:team[k]for k in ('playerId','playerName','playerLevel','playerPhotoInfo','serverId')}for team in state_for(p,six)['teams']]

def reward(p,six,floor,store=None):
    config=cfg(six)
    if six:
        result=drops(config['LEVEL_85_REWARD_CLASS_ID']if p['level']>=85 else config['LEVEL_80_REWARD_CLASS_ID']);x=floor/2;coin=math.floor((15000+100*p['level'])*(.00195*x**3-.02403*x**2+.12922*x+.89286)*p['level']/25+.5)
    else:
        result=drops(config['REWARD_CLASS_ID_MAP'][str(floor)]);x=floor;coin=math.floor((15000+100*p['level'])*(.00195*x**3-.02403*x**2+.12922*x+.89286)*p['level']/25*2+.5)
        extra=config['REWARD_EXPEDITION_MONEY_MAP'].get(str(floor),0)
        if extra:result.append({'entityId':105,'count':extra,'extra':{}})
    from .economy import expedition_bonus
    result+=expedition_bonus(store,six,floor)
    result.append({'entityId':101,'count':coin,'extra':{}});return result

def begin(store,account,args):
    six=args.get('isSix')
    if type(six)is not bool:raise ValueError('Loại viễn chinh không hợp lệ')
    with store.transaction():
        p=store.player(account);admit(p,six);before=snapshot(p);data=state_for(p,six);state=p['expedition'];floor=state[key(six,'passId')]
        if state[key(six,'status')]!=1 or floor>=cfg(six)['CHALLENGER_COUNT']:raise ValueError('Không có cửa viễn chinh đang chờ đấu')
        indices=validate_team(p,args.get('teamIndexs'));ships=args.get('shipIdxs',[]);team=build_team(p,indices,ships);ships=list(map(str,ships));self_info=state[key(six,'selfInfo')]
        for role in team['roles']:
            idx=str(role['idx']);hp=self_info['hpMap'].get(idx,role['hp']);role['maxHp']=role['hp'];role['hp']=min(role['hp'],hp);role['mp']=self_info['mpMap'].get(idx,role.get('mp',0))
            if role['hp']<=0:raise ValueError('Chiến binh đã bị hạ trong viễn chinh')
        defense=build_defender(state[key(six,'challengerInfo')]['team']);slot='expedition:'+mode(six);prior=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
        if prior and prior['expires']>time.time():
            run=json.loads(prior['data'])
            if run['day']==p['privateDay']and run['version']==data['version']and run['indices']==indices and run['ships']==ships:return delta(before,p,BEGIN_ROUTE,{'seed':run['seed'],'team1':run['team'],'team2':run['defender']})
        run={'day':p['privateDay'],'version':data['version'],'floor':floor,'indices':indices,'ships':ships,'team':team,'defender':defense,'seed':data['seed'],'isSix':six}
        store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],slot,json.dumps(run),int(time.time())+900));store.save(p)
        return delta(before,p,BEGIN_ROUTE,{'seed':run['seed'],'team1':team,'team2':defense})

def build_defender(raw):
    from .arena import combat_raw
    return combat_raw(raw)

def hpmp(team):return ({str(r['idx']):r['hp']for r in team['roles']},{str(r['idx']):r.get('mp',0)for r in team['roles']})

async def challenge(store,account,six,args):
    p=store.player(account);admit(p,six);slot='expedition:'+mode(six);row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
    if not row or row['expires']<time.time():raise ValueError('Cần client mới bắt đầu trận viễn chinh có snapshot')
    run=json.loads(row['data']);data=state_for(p,six)
    if run['day']!=p['privateDay']or run['version']!=data['version']or type(args.get('seed'))is not int or args['seed']!=run['seed']or type(args.get('isWin'))is not bool:raise ValueError('Trận viễn chinh không khớp')
    first=args.get('manualRecordMap',{});validate_records(first);integer(args.get('tickNumber'),'Tick',1,10000)
    out=await simulate_async({'mode':'expedition','team':run['team'],'defender':run['defender'],'seed':run['seed'],'manualRecordMap':first})
    a_hp,a_mp=hpmp(out['attacker']);d_hp,d_mp=hpmp(out['defender'])
    if out['isWin']!=args['isWin']or out['tickNumber']!=args['tickNumber']or any(args.get(k)!=v for k,v in (('selfHpMap',a_hp),('selfMpMap',a_mp),('challengerHpMap',d_hp),('challengerMpMap',d_mp))):raise ValueError('HP/MP hoặc kết quả không khớp engine server')
    with store.transaction():
        current=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
        if not current or current['data']!=row['data']or current['expires']<time.time():raise ValueError('Trận đã nhận hoặc đã đổi')
        p=store.player(account);before=snapshot(p);data=state_for(p,six);state=p['expedition']
        if run['day']!=p['privateDay']or run['version']!=data['version']:raise ValueError('Viễn chinh đã được đặt lại')
        own=state[key(six,'selfInfo')];own['hpMap'].update(a_hp);own['mpMap'].update(a_mp);raw=state[key(six,'challengerInfo')]['team']
        for role in raw['roles']:
            idx=str(role['idx']);role['attr']['maxHp']=role['attr'].get('maxHp',role['attr']['hp']);role['attr']['hp']=d_hp.get(idx,0);role['mp']=d_mp.get(idx,0)
        if out['isWin']:state[key(six,'status')]=2
        data['seed']=secrets.randbelow(2**31-1)+1;data['version']+=1;store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot));store.save(p);store.audit('expedition_challenge',{'player':p['id'],'six':six,'floor':run['floor']+1,'isWin':out['isWin']})
        return delta(before,p,'logic.'+mode(six)+'Handler.challenge',{})

async def handle(store,account,route,args):
    if route==BEGIN_ROUTE:return begin(store,account,args)
    if route not in ROUTES:raise ValueError('Thao tác viễn chinh không tồn tại')
    six='.sixExpeditionHandler.'in route;action=route.rsplit('.',1)[-1]
    if action=='challenge':return await challenge(store,account,six,args)
    with store.transaction():
        p=store.player(account);admit(p,six);before=snapshot(p);state=p['expedition'];temp={}
        if action=='reset':reset(p,six);store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],'expedition:'+mode(six)))
        elif action=='info':temp['playerInfos']=state['sixPlayerInfos']
        else:
            state_for(p,six);floor=state[key(six,'passId')]
            if action=='receive':
                if state[key(six,'status')]!=2 or floor>=cfg(six)['CHALLENGER_COUNT']:raise ValueError('Chưa có rương viễn chinh để nhận')
                temp['entityCountMap']=grant(p,reward(p,six,floor+1,store));state[key(six,'passId')]=floor+1;state[key(six,'prePassId')]=max(state[key(six,'prePassId')],floor+1);state[key(six,'status')]=1;next_team(p,six)
            else:
                maximum=state[key(six,'prePassId')]
                if p['vip'][counter(six)]<2 or maximum<=floor or state[key(six,'status')]!=1:raise ValueError('Càn quét cần lần đặt lại thứ hai và mốc đã vượt')
                rewards=[]
                for number in range(floor+1,maximum+1):rewards+=reward(p,six,number,store)
                temp['entityCountMap']=grant(p,rewards);state[key(six,'passId')]=maximum;next_team(p,six)
            store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],'expedition:'+mode(six)))
        store.save(p);return delta(before,p,route,temp)
