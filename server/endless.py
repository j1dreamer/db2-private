"""Sequential endless/fruit/star-sign maps verified by the original smap engine."""
import copy,datetime,json,secrets,time
from functools import lru_cache
from .profile import table
from .state import integer,snapshot,delta,consume,vip_data
from .rules import constants
from .battle import validate_team,build_team,validate_records,simulate_async
from .adventure import grant,reward_plan
ROUTES={'logic.endlessHandler.'+a for a in ('begin','pass','skip','setPursuitTeamIndexs','resetSetPursuitTeamTimes','buyFruitMapTimes')}
def cfg():return constants('server.MAP.CONSTS')
@lru_cache(None)
def maps():return {r['kindId']:r for r in table('smap')if r['bmapId']in(401,402,409,410,411,415,416)}
def family(bmap):
    integer(bmap,'Bản đồ',401,416)
    if bmap not in (*range(401,412),415,416):raise ValueError('Bản đồ không hợp lệ')
    return 'fruit'if bmap in (409,410,411)else 'starSign'if bmap in (415,416)else 'endless'
def top(p,bmap):return p['endless']['topPassId']if bmap==401 else p['endless']['otherTopPassIdMap'].get(str(bmap),0)
def set_top(p,bmap,value):
    if bmap==401:p['endless']['topPassId']=value
    else:p['endless']['otherTopPassIdMap'][str(bmap)]=value
def day():return (datetime.datetime.fromtimestamp(time.time(),datetime.timezone(datetime.timedelta(hours=7))).weekday()+1)%7

def refresh(p):
    old=json.dumps(p['endless'],sort_keys=True);state=p['endless']
    if p.get('privateEndlessDay')!=p['privateDay']:
        p['privateEndlessDay']=p['privateDay'];p['vip']['endlessSkipTimes']=0;state.update(fruitMapChallengeTimes=0,fruitMapBuyTimes=0,starSignMapChallengeTimes=0,setPursuitTeamTimesMap={});p['privatePursuitChanges']=0
    return old!=json.dumps(state,sort_keys=True)

def check(p,bmap,smap,indices):
    typ=family(bmap);config=cfg();state=p['endless'];required=20 if bmap==401 else config['ENDLESS_MORE_UNLOCK_NEED_LEVEL']if bmap<=408 else config['FRUIT_MAP_UNLOCK_NEED_LEVEL']if typ=='fruit'else constants('client.CONSTS.UNLOCK_LEVEL.STAR_SIGN')
    if p['level']<max(required,smap.get('levelLimit')or 0):raise ValueError('Chưa đủ cấp mở bản đồ')
    if smap['bmapId']!=(402 if 402<=bmap<=408 else bmap)or smap['no']!=top(p,bmap)+1:raise ValueError('Cần vượt tầng trước')
    allowed=None
    if 402<=bmap<=408:
        if day()not in config['MAP_OPEN_DAYS_MAP'][str(bmap)]:raise ValueError('Bản đồ chưa mở hôm nay')
        allowed=config['ENDLESS_DAY_ROLE_CLASS_IDS_MAP'][str(day())]
    elif typ in ('fruit','starSign'):
        field=typ+'Map';used=state[field+'ChallengeTimes'];maximum=config['DAILY_FRUIT_MAP_TIMES']+state['fruitMapBuyTimes']if typ=='fruit'else config['DAILY_STAR_SIGN_MAP_TIMES']
        if used>=maximum:raise ValueError('Đã hết lượt bản đồ hôm nay')
        theme=(state[field+'UseRolesNo']-1)%5+1;allowed=constants('server.DOUBLE_BATTLE.CONSTS.THEME_ROLE_CLASS_IDS_MAP')[str(theme)]
    if allowed is not None:
        roles={r['kindId']:r for r in table('role')}
        if any(roles[p['team']['roles'][idx]['kindId']]['classId']not in allowed for idx in indices):raise ValueError('Chiến binh không phù hợp bản đồ')
    return typ

def plan(smap,bmap):
    rewards=reward_plan(smap)
    if smap.get('coin'):rewards.append({'entityId':101,'count':smap['coin'],'extra':{}})
    if bmap==401:rewards.append({'entityId':102,'count':cfg()['PASS_GET_GEM'],'extra':{}})
    return rewards

def begin(store,account,args):
    with store.transaction():
        p=store.player(account);before=snapshot(p);smap=maps().get(args.get('smapId'));bmap=args.get('bmapId')
        if not smap:raise ValueError('Tầng không tồn tại')
        indices=validate_team(p,args.get('teamIndexs'));ships=args.get('shipIdxs',[]);team=build_team(p,indices,ships);ships=list(map(str,ships));family(bmap)
        prior=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='endless'",(p['id'],)).fetchone()
        if prior and prior['expires']>time.time():
            run=json.loads(prior['data'])
            if run['day']==p['privateDay']and run['smapId']==smap['kindId']and run['bmapId']==bmap and run['indices']==indices and run['ships']==ships:return delta(before,p,'logic.endlessHandler.begin',{'seed':run['seed']})
        typ=check(p,bmap,smap,indices)
        if typ in ('fruit','starSign'):p['endless'][typ+'MapChallengeTimes']+=1
        run={'day':p['privateDay'],'smapId':smap['kindId'],'bmapId':bmap,'indices':indices,'ships':ships,'team':team,'seed':secrets.randbelow(2**31-1)+1,'rewards':plan(smap,bmap)}
        store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],'endless',json.dumps(run),int(time.time())+900));store.save(p)
        return delta(before,p,'logic.endlessHandler.begin',{'seed':run['seed']})

async def finish(store,account,args):
    p=store.player(account);row=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='endless'",(p['id'],)).fetchone()
    if not row or row['expires']<time.time():raise ValueError('Không có trận đang chờ')
    run=json.loads(row['data']);ships=args.get('shipIdxs',[])
    if not isinstance(ships,list)or validate_team(p,args.get('teamIndexs'))!=run['indices']or list(map(str,ships))!=run['ships']or args.get('smapId')!=run['smapId']or args.get('bmapId')!=run['bmapId']or type(args.get('seed'))is not int or args['seed']!=run['seed']or p['privateDay']!=run['day']:raise ValueError('Trận không khớp tầng đã chọn')
    first=args.get('manualRecordMap1',{});second=args.get('manualRecordMap2',{});validate_records(first);validate_records(second);integer(args.get('tickNumber'),'Tick',1,10000)
    if maps()[run['smapId']]['mobZoneCount']==1:first,second=second,{}
    out=await simulate_async({'team':run['team'],'smapId':run['smapId'],'seed':run['seed'],'manualRecordMap1':first,'manualRecordMap2':second})
    if not out['isWin']or out['tickNumber']!=args['tickNumber']:raise ValueError('Tầng chưa được vượt đúng engine server')
    with store.transaction():
        current=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='endless'",(p['id'],)).fetchone()
        if not current or current['data']!=row['data']or current['expires']<time.time():raise ValueError('Tầng đã được nhận hoặc đã đổi')
        p=store.player(account);before=snapshot(p);smap=maps()[run['smapId']]
        if p['privateDay']!=run['day']or top(p,run['bmapId'])+1!=smap['no']:raise ValueError('Tiến độ tầng đã đổi')
        set_top(p,run['bmapId'],smap['no']);rewards=grant(p,run['rewards']);typ=family(run['bmapId'])
        if typ in ('fruit','starSign'):
            state=p['endless'];state[typ+'MapUseRolesNo']+=1;key=typ+'MapPassTimesMap';state.setdefault(key,{})[str(run['bmapId'])]=state.get(key,{}).get(str(run['bmapId']),0)+1
        store.db.execute("DELETE FROM pvp_runs WHERE player=?AND mode='endless'",(p['id'],));store.save(p);store.audit('endless_pass',{'player':p['id'],'bmapId':run['bmapId'],'floor':smap['no']})
        return delta(before,p,'logic.endlessHandler.pass',{'entityCountMap':rewards})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác tầng không tồn tại')
    action=route.rsplit('.',1)[-1]
    if action=='begin':return begin(store,account,args)
    if action=='pass':return await finish(store,account,args)
    with store.transaction():
        p=store.player(account);before=snapshot(p);state=p['endless'];temp={};config=cfg()
        if action=='skip':
            if p['level']<20 or not state['topPassId']:raise ValueError('Chưa vượt tầng nào để càn quét')
            if p['vip']['endlessSkipTimes']>=vip_data(p)['endlessSkipTimes']:raise ValueError('Đã hết lượt càn quét VIP hôm nay')
            rewards=[]
            for smap in maps().values():
                if smap['bmapId']==401 and smap['no']<=state['topPassId']:rewards+=plan(smap,401)
            temp['entityCountMap']=grant(p,rewards);p['vip']['endlessSkipTimes']+=1;store.audit('endless_skip',{'player':p['id']})
        elif action=='buyFruitMapTimes':
            if p['level']<config['FRUIT_MAP_UNLOCK_NEED_LEVEL']:raise ValueError('Chưa mở bản đồ trái cây')
            count=state['fruitMapBuyTimes']
            if count>=config['DAILY_BUY_FRUIT_MAP_TIMES']:raise ValueError('Đã hết lượt mua hôm nay')
            consume(p,102,[50,100,100,150,150][count]);state['fruitMapBuyTimes']=count+1
        else:
            bmap=integer(args.get('bmapId'),'Bản đồ truy kích',401,408)
            if p['level']<config['ENDLESS_MORE_UNLOCK_NEED_LEVEL']or not top(p,bmap):raise ValueError('Cần mở và vượt tầng trước khi chốt đội truy kích')
            key=str(bmap);times=state['setPursuitTeamTimesMap'].get(key,0)
            if action=='resetSetPursuitTeamTimes':
                if not times:raise ValueError('Chưa đổi đội truy kích để đặt lại')
                consume(p,102,config['RESET_PURSUIT_TEAM_TIMES_COST_GEM']);state['setPursuitTeamTimesMap'][key]=0
            else:
                if times>=config['DAILY_PURSUIT_TIMES']:raise ValueError('Đã hết lượt đổi đội bản đồ này hôm nay')
                indices=validate_team(p,args.get('teamIndexs'));ships=args.get('shipIndexs',[]);build_team(p,indices,ships);ships=list(map(str,ships))
                for other,assignment in state['pursuitTeamMap'].items():
                    if other!=key and (set(indices)&set(map(str,assignment['teamIndexs']))or set(ships)&set(map(str,assignment['shipIndexs']))):raise ValueError('Đội hình đã truy kích bản đồ khác')
                state['pursuitTeamMap'][key]={'teamIndexs':list(map(int,indices)),'shipIndexs':list(map(int,ships))};state['setPursuitTeamTimesMap'][key]=times+1
        store.save(p);return delta(before,p,route,temp)
