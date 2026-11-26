"""Adventure RPC state machine. Seeds and replay are checked by the recovered engine."""
import copy,datetime,json,secrets,time
from functools import lru_cache
from .profile import table
from .rules import constants
from .state import integer,nested,snapshot,delta,consume,vip_data,refresh_time
from .gameplay import add_reward
from .battle import validate_team,build_team,validate_records,simulate_async
ROUTES={'logic.smapHandler.'+name for name in ('beginSmap','endSmap','skip','receiveBmapAward','resetSmapTimes','buyMapType5Times')}

@lru_cache(None)
def maps():
    big={r['kindId']:r for r in table('bmap') if r.get('type')in (1,2,3,4,5,6)};small={r['kindId']:r for r in table('smap') if r['bmapId']in big}
    return big,small

def map_info(smap_id):
    integer(smap_id,'Ải',1);big,small=maps()
    if smap_id not in small:raise ValueError('Ải không tồn tại')
    smap=small[smap_id];return big[smap['bmapId']],smap

def stars(player,bmap,smap_id):return player['smapStarMap'].get(str(bmap['type']),{}).get(str(bmap['kindId']),{}).get(str(smap_id),0)
def used(player,bmap,smap_id):return player['smapTimesMap'].get(str(bmap['type']),{}).get(str(bmap['kindId']),{}).get(str(smap_id),0)

def check_open(player,bmap,smap):
    if player['level']<max(bmap['levelLimit'] or 0,smap['levelLimit'] or 0):raise ValueError('Chưa đủ cấp mở ải')
    typ=bmap['type'];unlock=constants('client.CONSTS.UNLOCK_LEVEL')
    required={3:unlock['MAP_TYPE_3'],4:unlock['MAP_TYPE_4'],5:unlock['SIX'],6:unlock['MAP_TYPE_6']}
    if player['level']<required.get(typ,0):raise ValueError('Chế độ chưa mở ở cấp hiện tại')
    days=constants('server.MAP.CONSTS.MAP_OPEN_DAYS_MAP').get(str(bmap['kindId']))
    day=(datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).weekday()+1)%7
    if days is not None and day not in days:raise ValueError('Ải chưa mở hôm nay')
    big,small=maps()
    ordered=sorted((r for r in small.values() if big[r['bmapId']]['type']==typ),key=lambda r:(big[r['bmapId']]['rankId'],r['rankId']))
    index=next(i for i,r in enumerate(ordered) if r['kindId']==smap['kindId'])
    if typ in (1,2,6) and index:
        previous=ordered[index-1];parent=big[previous['bmapId']]
        if not stars(player,parent,previous['kindId']):raise ValueError('Cần hoàn thành ải trước')
    if typ==2:
        normal=next((r for r in big.values() if r['type']==1 and r['rankId']==bmap['rankId']),None)
        children=sorted((r for r in small.values() if normal and r['bmapId']==normal['kindId']),key=lambda r:r['rankId'])
        if not children or not stars(player,normal,children[-1]['kindId']):raise ValueError('Cần vượt chương thường tương ứng')
    if not smap['repeatable'] and stars(player,bmap,smap['kindId']):raise ValueError('Ải chỉ có thể hoàn thành một lần')

def limit(player,bmap,smap):
    typ=bmap['type']
    if typ in (1,2):return smap['times'],used(player,bmap,smap['kindId'])
    vip=vip_data(player);maximum=(bmap['times'] or 0)+(vip.get('increaseMapType'+str(typ)+'Times') or 0)+(player['vip'].get('buyMapType'+str(typ)+'Times') or 0)
    type_map=player['smapTimesMap'].get(str(typ),{})
    count=sum(v for chapter in type_map.values() for v in chapter.values()) if typ in (5,6) else sum(type_map.get(str(bmap['kindId']),{}).values())
    return maximum,count

def consume_attempt(player,bmap,smap,count=1):
    maximum,current=limit(player,bmap,smap)
    if maximum is not None and current+count>maximum:raise ValueError('Đã hết lượt ải hôm nay')
    cost=(smap['actionPoint'] or 0)*count
    if player['actionPoint']<cost:raise ValueError('Không đủ thể lực')
    player['actionPoint']-=cost
    counters=nested(player['smapTimesMap'],bmap['type'],bmap['kindId'])
    key=str(smap['kindId']);counters[key]=counters.get(key,0)+count
    refresh_time(player)

def reward_plan(smap):
    # starSignSmapScene renders these table values as item counts. Use the same
    # table quantity interpretation here; normal-map drop timing remains a
    # private-server rule because its original backend was not supplied.
    result=[]
    for entity,value in zip(smap.get('specifyDropEntityIds') or [],smap.get('specifyDropValues') or []):
        if entity and value>0:result.append({'entityId':entity,'count':int(value),'extra':{}})
    return result

def grant(player,rewards):
    result={}
    for reward in rewards:
        for key,value in add_reward(player,reward).items():result[key]=result.get(key,0)+value
    return result

def add_experience(player,amount,role_amount=0,indices=()):
    levels={r['level']:r for r in table('experience')};player['experience']+=amount
    while player['level']<100 and player['experience']>=levels[player['level']]['playerExp']:
        player['experience']-=levels[player['level']]['playerExp'];player['level']+=1
        player['timesMaxMap']['actionPoint']=60+player['level']
        level=player['level'];player['actionPoint']+=20 if level<=7 else 30 if level<=11 else 40 if level<=20 else 60 if level<=30 else 80 if level<=40 else 100 if level<=50 else 120
    player['nextLevelExp']=levels[player['level']]['playerExp']
    for idx in indices:
        from .progression import role_exp,recalculate
        role=player['team']['roles'][idx];role_exp(player,role,role_amount);recalculate(player,role)

def begin(store,account,args):
    with store.transaction():
        p=store.player(account);before=snapshot(p)
        bmap,smap=map_info(args.get('smapId'));check_open(p,bmap,smap)
        indices=validate_team(p,args.get('teamIndexs'))
        if bmap['kindId']==303:
            allowed=constants('client.CONSTS.FEMALE_CLASS_IDS');roles={r['kindId']:r for r in table('role')}
            if any(roles[p['team']['roles'][idx]['kindId']]['classId']not in allowed for idx in indices):raise ValueError('Đội hình không phù hợp ải')
        existing=store.db.execute('SELECT data,expires FROM adventure_runs WHERE player=?',(p['id'],)).fetchone()
        if existing and existing['expires']>time.time():
            prior=json.loads(existing['data'])
            if prior['smapId']==smap['kindId'] and prior['indices']==indices:
                show={str((smap.get('mobZone2') or smap['mobZone1'])[-1]):[r['entityId'] for r in prior['rewards']]}
                return delta(before,p,'logic.smapHandler.beginSmap',{'seed':prior['seed'],'showEntityIdsMap':show})
            store.audit('abandon_smap',{'player':p['id'],'smap':prior['smapId']})
        consume_attempt(p,bmap,smap);seed=secrets.randbelow(2**31-1)+1;rewards=reward_plan(smap)
        entry={'smapId':smap['kindId'],'indices':indices,'team':build_team(p,indices),'snapshot':copy.deepcopy(p),'rewards':rewards,'seed':seed}
        store.db.execute('INSERT INTO adventure_runs(player,data,expires) VALUES(?,?,?) ON CONFLICT(player) DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],json.dumps(entry),int(time.time())+900))
        store.save(p);store.audit('begin_smap',{'player':p['id'],'smap':smap['kindId']})
        show={str((smap.get('mobZone2') or smap['mobZone1'])[-1]):[r['entityId'] for r in rewards]}
        return delta(before,p,'logic.smapHandler.beginSmap',{'seed':seed,'showEntityIdsMap':show})

async def end(store,account,args):
    reported=integer(args.get('star'),'Sao',0,3)
    p=store.player(account)
    row=store.db.execute('SELECT data,expires FROM adventure_runs WHERE player=?',(p['id'],)).fetchone()
    if not row or row['expires']<time.time():raise ValueError('Không có trận đang hoạt động')
    run=json.loads(row['data']);indices=validate_team(p,args.get('teamIndexs'))
    if indices!=run['indices']:raise ValueError('Đội hình khác lúc bắt đầu trận')
    integer(args.get('seed'),'Seed',1,2**31-1)
    integer(args.get('tickNumber'),'Tick',0,10000)
    if args.get('seed')!=run['seed']:raise ValueError('Cập nhật client hỗ trợ seed chiến đấu trước khi vào ải')
    first=args.get('manualRecordMap1',{});second=args.get('manualRecordMap2',{});validate_records(first);validate_records(second)
    team=build_team(run['snapshot'],indices,args.get('shipIdxs'))
    # Ships are selected on the client after begin, but every referenced ship must
    # belong to this account. Role stats remain the committed start snapshot.
    team['roles']=run['team']['roles']
    if maps()[1][run['smapId']]['mobZoneCount']==1:first,second=second,{}
    if reported:
        outcome=await simulate_async({'team':team,'smapId':run['smapId'],'seed':run['seed'],'manualRecordMap1':first,'manualRecordMap2':second})
        if not outcome['isWin'] or outcome['star']!=reported or outcome['tickNumber']!=args.get('tickNumber'):raise ValueError('Kết quả trận không khớp mô phỏng')
    with store.transaction():
        p=store.player(account);before=snapshot(p)
        latest=store.db.execute('SELECT data FROM adventure_runs WHERE player=?',(p['id'],)).fetchone()
        if not latest or latest[0]!=row['data']:raise ValueError('Trận đã được xử lý hoặc thay thế')
        bmap,smap=map_info(run['smapId']);rewards=[];entities={}
        if reported:
            progress=nested(p['smapStarMap'],bmap['type'],bmap['kindId']);key=str(smap['kindId'])
            progress[key]=max(progress.get(key,0),reported)
            rewards=run['rewards'];entities=grant(p,rewards)
            p['coin']+=smap['coin'] or 0;add_experience(p,smap['actionPoint'] or 0,smap['roleExp'] or 0,indices)
        store.db.execute('DELETE FROM adventure_runs WHERE player=?',(p['id'],));store.save(p)
        store.audit('end_smap',{'player':p['id'],'smap':smap['kindId'],'star':reported})
        return delta(before,p,'logic.smapHandler.endSmap',{'entityCountMap':entities,'star':reported})

def skip(store,account,args):
    count=integer(args.get('times'),'Số lượt',1,100)
    with store.transaction():
        p=store.player(account);before=snapshot(p);bmap,smap=map_info(args.get('smapId'))
        check_open(p,bmap,smap)
        if stars(p,bmap,smap['kindId'])<3:raise ValueError('Cần thắng 3 sao trước khi càn quét')
        consume_attempt(p,bmap,smap,count);consume(p,102,count)
        results=[grant(p,reward_plan(smap)) for _ in range(count)]
        p['coin']+=(smap['coin'] or 0)*count;add_experience(p,(smap['actionPoint'] or 0)*count)
        # Recovered MAP.FUNS.getSkipExpDropList; reward XP consumables instead of
        # granting XP to a client-selected roster that the skip request lacks.
        remaining=5*(smap['actionPoint'] or 0)*count;entities={r['kindId']:r for n in ('entity','entityExt') for r in table(n)};extra=[]
        for kind in (20004,20003,20002,20001):
            xp=entities[kind]['extra']['roleExp'];amount=remaining//xp
            if kind==20001 and remaining%xp:amount+=1
            if amount:extra.append({'entityId':kind,'count':amount,'extra':{}});remaining=max(0,remaining-amount*xp)
        extra_map=grant(p,extra);store.save(p);store.audit('skip_smap',{'player':p['id'],'smap':smap['kindId'],'count':count})
        return delta(before,p,'logic.smapHandler.skip',{'entityCountMapList':results,'extraEntityCountMap':extra_map})

def receive_box(store,account,args):
    bid=integer(args.get('bmapId'),'Chương',1);threshold=integer(args.get('star'),'Sao',1)
    need=constants('server.MAP.CONSTS.NORMAL_TYPE_BOX_NEED_STARS')
    if threshold not in need:raise ValueError('Mốc sao không hợp lệ')
    big,small=maps()
    if bid not in big:raise ValueError('Chương không tồn tại')
    bmap=big[bid]
    with store.transaction():
        p=store.player(account);before=snapshot(p)
        total=sum(stars(p,bmap,r['kindId']) for r in small.values() if r['bmapId']==bid and r['repeatable'])
        received=nested(p['bmapBoxReceivedMap'],bid)
        if total<threshold or received.get(str(threshold)):raise ValueError('Chưa đủ sao hoặc đã nhận')
        text=bmap['box'+str(need.index(threshold)+1)] or '';rewards=[]
        for part in text.split(','):
            if not part:continue
            descriptor,count=part.split('x');pieces=descriptor.split('_');extra={}
            if len(pieces)==3:extra[pieces[1]]=int(pieces[2])
            rewards.append({'entityId':int(pieces[0]),'count':int(count),'extra':extra})
        entities=grant(p,rewards);received[str(threshold)]=True;store.save(p)
        store.audit('bmap_box',{'player':p['id'],'bmap':bid,'star':threshold})
        return delta(before,p,'logic.smapHandler.receiveBmapAward',{'entityCountMap':entities})

def reset(store,account,args):
    local_boost=args.get('isAd',False)
    if type(local_boost)is not bool:raise ValueError('Chế độ đặt lại không hợp lệ')
    with store.transaction():
        p=store.player(account);before=snapshot(p);bmap,smap=map_info(args.get('smapId'))
        check_open(p,bmap,smap)
        if bmap['type']not in (1,2):raise ValueError('Chế độ này không đặt lại theo từng ải')
        maximum,current=limit(p,bmap,smap)
        if current<maximum:raise ValueError('Chỉ đặt lại khi đã hết lượt')
        counters=nested(p['vip'].setdefault('resetSmapTimesTimesMap',{}),bmap['type'],bmap['kindId']);key=str(smap['kindId']);times=counters.get(key,0)
        if local_boost:
            from .local_boosts import consume_boost
            consume_boost(p,1)
        else:
            if times>=vip_data(p)['resetSmapTimesTimes']:raise ValueError('Đã hết quyền đặt lại hôm nay')
            costs=constants('server.MAP.CONSTS.RESET_SMAP_COST_GEMS');consume(p,102,costs[min(times+1,len(costs)-1)]);counters[key]=times+1
        nested(p['smapTimesMap'],bmap['type'],bmap['kindId'])[key]=0;store.save(p)
        return delta(before,p,'logic.smapHandler.resetSmapTimes',{'privateLocalReward':local_boost})

def buy_type5(store,account,args):
    with store.transaction():
        p=store.player(account);before=snapshot(p)
        if p['level']<constants('client.CONSTS.UNLOCK_LEVEL.SIX'):raise ValueError('Chế độ chưa mở')
        times=p['vip'].get('buyMapType5Times',0);maximum=vip_data(p)['buyMapType5TimesTimes']
        if times>=maximum:raise ValueError('Đã hết lượt mua hôm nay')
        costs=constants('server.MAP.CONSTS.BUY_MAP_TYPE5_TIMES_COST_GEMS');consume(p,102,costs[min(times+1,len(costs)-1)])
        p['vip']['buyMapType5Times']=times+1;store.save(p)
        return delta(before,p,'logic.smapHandler.buyMapType5Times')

async def handle(store,account,route,args):
    if not store.player(account):raise ValueError('Chưa có nhân vật')
    action=route.rsplit('.',1)[-1]
    if action=='endSmap':return await end(store,account,args)
    return {'beginSmap':begin,'skip':skip,'receiveBmapAward':receive_box,'resetSmapTimes':reset,'buyMapType5Times':buy_type5}[action](store,account,args)
