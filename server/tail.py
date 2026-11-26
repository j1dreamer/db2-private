"""Damage trials: immutable selection, recovered combat replay, one settlement.

Boss stat growth/initial HP and reward currency mapping are private rules. The
damage conversion rate, mob IDs and daily VIP limit come from the client.
"""
import copy,json,secrets,time,math
from .profile import table
from .state import integer,snapshot,delta,vip_data
from .rules import constants
from .battle import validate_team,build_team,simulate_async
from .adventure import grant
ROUTES={'logic.tailHandler.choose','logic.tailHandler.challenge'}
BOSS_CONFIG={'HP_GROWTH':10000,'ATK_GROWTH':50,'DEF_GROWTH':2,'MDEF_GROWTH':2}
INITIAL_HP=10**12

def mob_team(kind,level=1,hp=INITIAL_HP):
    row=next(r for r in table('mob')if r['kindId']==kind)
    role={key:row[key]for key in ('kindId','atk','def','mdef','hit','crit','dodge','star')}
    role.update(idx=0,level=level,hp=hp,maxHp=hp,skills=[{'kindId':skill,'level':row['skillLevels'][i]}for i,skill in enumerate(row['skillIds'])],awakeSkills=[],evolveSkillIds=[],trainLevelMap={},awakeLevel=0)
    return {'playerId':0,'roles':[role],'ships':[],'skills':[]}

def choose(store,account,args):
    kind=integer(args.get('tailType'),'Thử thách',1,3)
    with store.transaction():
        p=store.player(account);before=snapshot(p)
        if p['level']<constants('client.CONSTS.UNLOCK_LEVEL.TAIL'):raise ValueError('Thử thách mở từ cấp 40')
        indices=validate_team(p,args.get('attackTeamIndexs'));ships=args.get('attackShipIndexs',[]);team=build_team(p,indices,ships);ships=list(map(str,ships))
        prior=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],'tail')).fetchone()
        if prior and prior['expires']>time.time():
            run=json.loads(prior['data'])
            if run['day']==p['privateDay']and run['indices']==indices and run['ships']==ships and run['type']==kind:return response(before,p,run)
        maximum=vip_data(p)['tailChallengeTimesTimes'];used=p['vip'].get('tailChallengeTimesTimes',0)
        if used>=maximum:raise ValueError('Đã hết lượt thử thách hôm nay')
        p['vip']['tailChallengeTimesTimes']=used+1
        raw={'playerId':p['id'],'roles':[copy.deepcopy(p['team']['roles'][key])for key in indices],'ships':[copy.deepcopy(p['bag']['items'][key])for key in ships]}
        run={'day':p['privateDay'],'type':kind,'indices':indices,'ships':ships,'team':team,'attack':raw,'defender':mob_team(constants('server.SHIP.CONSTS.MOB_ID_MAP')[str(kind)]),'seed':secrets.randbelow(2**31-1)+1,'config':BOSS_CONFIG}
        store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],'tail',json.dumps(run),int(time.time())+900));store.save(p);store.audit('tail_choose',{'player':p['id'],'type':kind})
        return response(before,p,run)

def response(before,p,run):return delta(before,p,'logic.tailHandler.choose',{'attackTeam':run['attack'],'defenseTeam':run['defender'],'BOSS_CONFIG':run['config'],'seed':run['seed']})

async def challenge(store,account,args):
    p=store.player(account);row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],'tail')).fetchone()
    if not row or row['expires']<time.time():raise ValueError('Không có thử thách đang chờ')
    run=json.loads(row['data']);indices=validate_team(p,args.get('attackTeamIndexs'));ships=args.get('attackShipIndexs',[])
    if not isinstance(ships,list):raise ValueError('Đồng hành không hợp lệ')
    if indices!=run['indices']or list(map(str,ships))!=run['ships']or args.get('seed')!=run['seed']or type(args.get('seed'))is not int or run['day']!=p['privateDay']:raise ValueError('Trận không khớp lượt đã chọn')
    reported=args.get('bossHp')
    if type(reported)not in (float,int)or not math.isfinite(reported)or not 0<=reported<=INITIAL_HP:raise ValueError('HP boss không hợp lệ')
    outcome=await simulate_async({'mode':'boss','bossType':'TAIL','team':run['team'],'defender':run['defender'],'seed':run['seed'],'config':run['config'],'auto':True})
    if reported!=outcome['bossHp']:raise ValueError('HP boss không khớp mô phỏng server')
    with store.transaction():
        current=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],'tail')).fetchone()
        if not current or current['data']!=row['data']or current['expires']<time.time():raise ValueError('Thử thách đã được nhận hoặc đã đổi')
        p=store.player(account);before=snapshot(p)
        if p['privateDay']!=run['day']:raise ValueError('Lượt thử thách đã sang ngày mới')
        damage=INITIAL_HP-outcome['bossHp'];count=math.floor(damage*constants('server.SHIP.CONSTS.DMG_TO_MONEY_RATE'));reward={1:101,2:108,3:23001}[run['type']]
        rewards=grant(p,[{'entityId':reward,'count':count,'extra':{}}])if count else {}
        store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],'tail'));store.save(p);store.audit('tail_challenge',{'player':p['id'],'type':run['type'],'damage':damage,'reward':rewards})
        return delta(before,p,'logic.tailHandler.challenge',{'entityCountMap':rewards})

async def handle(store,account,route,args):
    if route=='logic.tailHandler.choose':return choose(store,account,args)
    if route=='logic.tailHandler.challenge':return await challenge(store,account,args)
    raise ValueError('Thử thách không tồn tại')
