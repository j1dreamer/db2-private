"""Private activity policies using the recovered client DTOs, not original live events.

Catalogs, prices and probabilities here are intentionally private rules. Claims,
spending and state transitions commit together; no RPC can attest real payments.
"""
import copy,datetime,json,secrets,time
from .state import integer,snapshot,delta,consume,stack_count
from .adventure import grant
from .item_actions import description
ROUTES={'logic.playerHandler.'+a for a in ('activitySaveGem','activitySelectDropList','dreamRoll','fillLoginTopUp','fillTaskActive','receiveScorePointBoxReward','rollDial','scorePoint','spWish','updateFreeActivity','updateRepeatReceiveActivityTime')}
ZONE=datetime.timezone(datetime.timedelta(hours=7))
DIAL_COST={'luck':113,'vip':114,'svip':117,'shen':89,'pay':88}
# Exactly eight visible prizes, matching the eight slots in both original panels.
PRIZES=[(101,5000,30),(20001,5,20),(23001,5,15),(119,1,10),(120,1,2),(21001,2,10),(102,50,5),(113,2,8)]
POOL=','.join(f'{kind}x{n}_W{w}'for kind,n,w in PRIZES)
SP_POOL='105504_star_3x1_W5,20001x20_W25,23001x20_W25,119x1_W20,120x1_W10,21001x5_W15'
SCORES=[10,30,50,100,200]
BOXES=['113x2','119x1','120x1','120x2','120x3']
EVENT_TILES={4,13,23,35,50}
SELECT=['119x2','20001x20','23001x20']

def periods():
    current=datetime.datetime.fromtimestamp(time.time(),ZONE);start=current.replace(hour=0,minute=0,second=0,microsecond=0);week=start-datetime.timedelta(days=start.weekday())
    return start.date().isoformat(),int(start.timestamp()*1000),int((start+datetime.timedelta(days=1)).timestamp()*1000),week.date().isoformat(),int(week.timestamp()*1000),int((week+datetime.timedelta(days=7)).timestamp()*1000)

def reward(desc,needs,received=False,reach=None):
    ready=all((reach or {}).get(k,0)>=v for k,v in needs.items())
    return {'dropListDesc':desc,'needMap':needs,'status':3 if received else 2 if ready else 1,'desc':''}

def event(name,typ,start,end,reach,rewards,**extra):
    from .liveops import TEMPLATES
    return {'name':name,'type':typ,'desc':TEMPLATES.get(name,(name,''))[0],'resId':126,'priority':300,'start_time':start,'end_time':end,'reachMap':reach,'rewards':rewards,**extra}

def refresh(store,p):
    from . import liveops
    before=json.dumps(p,sort_keys=True);day,start,end,week,ws,we=periods();now=int(time.time()*1000)
    state=p.setdefault('privateActivities',{});daily=state.setdefault('daily',{})
    if daily.get('day')!=day:daily.clear();daily.update(day=day,filled=0,spGem=0,dial={},repeat={})
    weekly=state.setdefault('weekly',{})
    if weekly.get('week')!=week:weekly.clear();weekly.update(week=week,loginDays=[],filled=0,score={},boxes={},dream={'curPos':0,'logs':[]},dreamTimes=0,spLuck=0,spTimes=0)
    dream_cfg=liveops.configured(store,'dream');dream_window=liveops.window(dream_cfg)if 'start'in dream_cfg else None
    if dream_window:
        managed=state.setdefault('managedDream',{})
        cycle=str(dream_window['start'])
        if managed.get('cycle')!=cycle:managed.clear();managed.update(cycle=cycle,dream={'curPos':0,'logs':[]},times=0)
        weekly['dream']=managed['dream'];weekly['dreamTimes']=managed['times']
    if day not in weekly['loginDays']:weekly['loginDays'].append(day)
    claims=state.setdefault('claims',{});maps=p['activity']['map']
    def made(name,typ,period,reach,specs,**extra):
        a,b=(start,end)if period==day else (ws,we)if period==week else (-1,-1)
        claimed=claims.get(name,{}).get(period,[])
        maps[name]=event(name,typ,a,b,reach,[reward(desc,need,i in claimed,reach)for i,(desc,need)in enumerate(specs)],**extra)
        maps[name]['privateClaimPeriod']=period
        return maps[name]
    saved=state.get('saved',0);reach={'saveGemUpgradeLevelSaveGem':saved,'playerLevel':p['level']}
    made('saveGemUpgradeLevel','saveGemUpgradeLevel','lifetime',reach,[('102x600',{'saveGemUpgradeLevelSaveGem':1000,'playerLevel':20}),('102x600',{'saveGemUpgradeLevelSaveGem':1000,'playerLevel':40})],needSaveGem=1000,needVip=0)
    freeReach={'saveGemUpgradeLevelCount':int(saved==1000)}
    made('saveGemUpgradeLevelFree','saveGemUpgradeLevelFree',day,freeReach,[('119x1',{'saveGemUpgradeLevelCount':1})],match='saveGemUpgradeLevel')
    active=min(100,p['task']['dailyActivePoint']+daily.get('filled',0))
    task=made('task_active','taskActive',day,{'taskActivePoint':active},[('113x1,20001x5',{'taskActivePoint':i})for i in (20,40,60,80,100)])
    # This panel unconditionally reads advanced.reachMap even without a paid tier.
    task['advanced']={'reachMap':{'buyGoodsId_604_times':0},'rewards':[]}
    loginReach={'loginDays2':min(7,len(weekly['loginDays'])+weekly['filled']),'buyGoods_1':int(p['buyGoodsTimesMap'].get('1',0)>0)}
    made('privateLogin','loginTopUp',week,loginReach,[('94x1',{'loginDays2':i})for i in range(1,8)]+[('95x1',{'loginDays2':i,'buyGoods_1':1})for i in range(1,8)],isUnlockMore=True)
    for entry in maps['privateLogin']['rewards'][7:]:entry['isAdvanced']=True
    made('upgradeVip','upgradeVip','lifetime',{'vipLevel':p['vip']['level']},[(f'119x1,112x{i*10}',{'vipLevel':i})for i in range(1,17)])
    selected=state.get('selected');made('privateSelect','selectDropList','lifetime',{'selected':int(selected is not None)},[(SELECT[selected]if selected is not None else SELECT[0],{'selected':1})],selectDropListDescs=SELECT,selectDropIdxs=[]if selected is None else [selected])
    repeatReach={f'buyGoods_{i}':int(p['buyGoodsTimesMap'].get(str(i),0)>0)for i in (1,2)};repeatReach['nextReceiveWaitTime']=now
    specs=[('101x10000',{'buyGoods_1':1,'nextReceiveWaitTime':daily['repeat'].get('0',0)}),('102x25',{'buyGoods_2':1,'nextReceiveWaitTime':daily['repeat'].get('1',0)})]
    maps['endless_reward']=event('endless_reward','repeatReceive',start,end,repeatReach,[reward(desc,need,False,repeatReach)for desc,need in specs])
    card_fields=['monthCardExpire','bigMonthCardExpire','yearCardExpire','weekCardExpire']
    made('buyCard7day','buyGoods',day,{k:p.get(k,0)for k in card_fields},[(f'102x{n}',{key:now})for key,n in zip(card_fields,[50,100,150,25])])
    made('dreamRollQuest','login',week,{'dreamRollTimes':weekly['dreamTimes']},[(f'93x{v*10}',{'dreamRollTimes':v})for v in (5,10,20)],isDream=True)
    spReach={'wishTimes':weekly['spLuck'],'spWishGemTimes':daily['spGem']}
    maps['privateSpWish']=event('privateSpWish','spWish',ws,we,spReach,[],spClassId=55,maxLuck=20,costGem=300,costGemMaxTiems=10,rdDropListDesc=SP_POOL)
    from . import liveops
    pool_desc=','.join(f'{kind}x{n}_W{w}'for kind,n,w in liveops.prizes(store))
    p['activity']['dial']={**{typ+'Desc':pool_desc for typ in DIAL_COST},'shenEndTime':we,'payGetTicketNeedMoney':1,'payFirstRunNeedGoodsId':4,'payRunNeedGoodsId':4,'payData':{'receiveIdxs':daily['dial'].get('pay',[]),'todayTopUpMoney':0,'todayGetFull':len(daily['dial'].get('pay',[]))==8}}
    info=p['activity']['scorePointInfoMap']
    for name,cost in (('scorePoint1',113),('scorePointStarSign',61002)):
        value=weekly['score'].get(name,0);info[name]={'activityName':name,'score':value,'receivedScoreMap':weekly['boxes'].get(name,{}),'isReset':False,'activityItem':{'name':name,'desc':'Private score draw','costMoneyId':cost,'rdDropListDesc':pool_desc,'needScoresDesc':json.dumps(SCORES),'boxDropListDescs':BOXES,'start_time':ws,'end_time':we,'rewards':[]}}
        p.setdefault('rankScores',{})[name+'_score']=value
    p['rankScores']['sp_wish_times']=weekly['spTimes']
    dream=weekly['dream'];p['activity']['dream']={**dream,'activityItem':{'start_time':ws,'end_time':we,'fillReward':'93x100','rewardMap':{str(i):'event'if i in EVENT_TILES else ['101x5000','20001x5','93x10','23001x5'][(i-1)%4]for i in range(1,59)}}}
    liveops.apply(store,p)
    if dream_window and 'start'not in liveops.configured(store,'dreamRollQuest'):
        quest=maps['dreamRollQuest'];period='dream:'+str(dream_window['start']);quest['privateClaimPeriod']=period
        quest.update(start_time=dream_window['start']*1000,end_time=dream_window['end']*1000)
        received=claims.get('dreamRollQuest',{}).get(period,[])
        for i,row in enumerate(quest['rewards']):row['status']=3 if i in received else 2 if dream_window['active']and weekly['dreamTimes']>=row['needMap']['dreamRollTimes']else 1
    for index,ident in enumerate((902,903,904,901)):
        goods=p['extra']['goodsList'].get(str(ident))
        if goods:goods['dailyGem']=sum(r['count']for r in description(maps['buyCard7day']['rewards'][index]['dropListDesc'])if r['entityId']==102)
    from . import sp_events
    sp_events.refresh(store,p)
    return before!=json.dumps(p,sort_keys=True)

def name_arg(args,allowed):
    name=args.get('activityName')
    if not isinstance(name,str)or name not in allowed:raise ValueError('Event riêng không tồn tại')
    return name

def _merge(target,values):
    for key,value in values.items():target[key]=target.get(key,0)+value

def claim_batch(store,account,names,indices):
    if not isinstance(names,list)or not isinstance(indices,list)or len(names)!=len(indices)or not 1<=len(names)<=50:raise ValueError('Danh sách thưởng không hợp lệ')
    normalized=[]
    for name,index in zip(names,indices):
        if not isinstance(name,str)or type(index)not in (str,int)or isinstance(index,str)and not index.isdecimal():raise ValueError('Chỉ số thưởng không hợp lệ')
        normalized.append((name,integer(int(index),'Chỉ số thưởng',0,1000)))
    if len(set(normalized))!=len(normalized):raise ValueError('Phần thưởng trùng trong yêu cầu')
    with store.transaction():
        p=store.player(account);before=snapshot(p);day,_,_,week,_,_=periods();counts={};state=p['privateActivities'];now=time.time()
        for name,index in normalized:
            config=p['activity']['map'].get(name)
            if name.startswith('spEvent_'):
                from .sp_events import claim
                _merge(counts,claim(store,p,name,index))
            elif config and name in ('saveGemUpgradeLevel','saveGemUpgradeLevelFree','task_active','privateLogin','upgradeVip','privateSelect','endless_reward','dreamRollQuest','buyCard7day'):
                from .liveops import require_open
                require_open(store,name)
                if index>=len(config['rewards']):raise ValueError('Phần thưởng không tồn tại')
                entry=config['rewards'][index]
                if entry['status']!=2:raise ValueError('Chưa đủ điều kiện hoặc đã nhận')
                period='lifetime'if config['start_time']==-1 else day if config['end_time']-config['start_time']==86400000 else week
                period=config.get('privateClaimPeriod',period)
                if name=='endless_reward':
                    # Eligibility and deadline are checked in the same locked transaction.
                    token=str(state['daily']['repeat'].get(str(index),0));state['daily']['repeat'][str(index)]=int(now*1000)+3600000
                    period=day+':'+token
                else:state['claims'].setdefault(name,{}).setdefault(period,[]).append(index)
                store.db.execute('INSERT INTO activity_claims VALUES(?,?,?,?)',(p['id'],name,period,index));_merge(counts,grant(p,description(entry['dropListDesc'])))
            else:
                from .liveops import claim_custom
                _merge(counts,claim_custom(store,p,name,index))
        refresh(store,p);store.save(p);store.audit('claim_events',{'player':p['id'],'events':normalized,'rewards':counts})
        result=delta(before,p,'logic.playerHandler.receiveActivityAward',{'entityCountMap':counts});result.setdefault('gem',p['gem']);return result

def times_arg(args):
    times=integer(args.get('times'),'Số lượt',1,100)
    if times not in (1,10,100):raise ValueError('Số lượt phải là 1, 10 hoặc 100')
    return times

def pick(entries):
    from .gameplay import choose
    return choose([{'idx':i,'weight':w}for i,(_,_,w)in entries])['idx']

def draw_prizes(p,times,indices=None,entries=None):
    entries=PRIZES if entries is None else entries
    rewards=[];chosen=[]
    for _ in range(times):
        options=[(i,v)for i,v in enumerate(entries)if indices is None or i not in indices+chosen]
        if not options:raise ValueError('Vòng quay đã hết phần thưởng')
        i=pick(options);chosen.append(i);kind,n,_=entries[i];rewards.append({'entityId':kind,'count':n,'extra':{}})
    return rewards,chosen

def dream_roll(p,args):
    chosen=args.get('diyPoint');gold=chosen is not None
    if gold:integer(chosen,'Điểm xúc xắc',1,6)
    consume(p,95 if gold else 94,1);w=p['privateActivities']['weekly'];dream=w['dream'];raw=chosen if gold else secrets.randbelow(6)+1;point=raw*(1 if gold else dream.pop('multiple',1))
    dream.pop('multiple',None);old=dream['curPos'];pos=(old+point-1)%58+1;awards=[];event_id=0;skip=dream.pop('skip',False);triple=dream.pop('triple',1)
    if not skip:
        if old+point>58:awards.extend(description(p['activity']['dream']['activityItem']['fillReward']))
        if pos in EVENT_TILES:
            event_id=secrets.randbelow(6)+1
            if event_id==1:dream['triple']=3
            elif event_id==2:awards.extend(description('95x1'))
            elif event_id==3:awards.extend(description('94x1'))
            elif event_id==4:dream['multiple']=2
            elif event_id==5:pos=max(1,pos-5)
            elif event_id==6:dream['skip']=True
            # A pending triple applies to the next tile reward, not an event gift.
            if triple>1:dream['triple']=triple
        else:
            desc=p['activity']['dream']['activityItem']['rewardMap'][str(pos)];loot=description(desc)
            for row in loot:row['count']*=triple
            awards.extend(loot)
    dream['curPos']=pos;w['dreamTimes']+=1
    for row in awards:dream['logs'].append({'time':int(time.time()*1000),'dropDesc':f"{row['entityId']}x{row['count']}",'isFill':row['entityId']==93 and row['count']==100})
    dream['logs']=dream['logs'][-100:]
    if p['privateActivities'].get('managedDream')and p['privateActivities']['managedDream'].get('dream')is dream:p['privateActivities']['managedDream']['times']=w['dreamTimes']
    # The client applies its saved movement multiplier to this raw dice value.
    return awards,{'point':raw,'event':event_id,'authoritativePos':pos,'fromPos':old,'stepMultiplier':point//raw,'skipReward':bool(skip)}

def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Route event không tồn tại')
    action=route.rsplit('.',1)[-1]
    with store.transaction():
        p=store.player(account);before=snapshot(p);state=p['privateActivities'];daily=state['daily'];weekly=state['weekly'];awards=[];temp={}
        from . import liveops
        target={'activitySaveGem':'saveGemUpgradeLevel','activitySelectDropList':'privateSelect','fillTaskActive':'task_active','fillLoginTopUp':'privateLogin','dreamRoll':'dream','spWish':'privateSpWish'}.get(action)
        if action=='rollDial':target='dial:'+str(args.get('type',''))
        if action in ('scorePoint','receiveScorePointBoxReward','updateFreeActivity'):target=str(args.get('activityName',''))
        if target:liveops.require_open(store,target)
        if action=='activitySaveGem':
            name_arg(args,{'saveGemUpgradeLevel'})
            if state.get('saved'):raise ValueError('Đã gửi gem cho event này')
            consume(p,102,1000);state['saved']=1000
        elif action=='activitySelectDropList':
            name_arg(args,{'privateSelect'});idxs=args.get('selectDropIdxs')
            if not isinstance(idxs,list)or len(idxs)!=1:raise ValueError('Chọn đúng một phần thưởng')
            idx=integer(idxs[0],'Phần thưởng chọn',0,len(SELECT)-1)
            if state.get('selected')is not None:raise ValueError('Đã chốt lựa chọn')
            state['selected']=idx
        elif action=='fillTaskActive':
            if str(args.get('activityName','')).startswith('spEvent_'):
                from . import sp_events
                banner=sp_events.current(store);dto=p['activity']['map'].get(args['activityName'])
                if not banner or not dto or dto['type']!='taskActive':raise ValueError('Chiến lệnh không mở')
                counter=sp_events.state(p,banner)
                if not(counter.get('passUnlocked')or banner['passUnlockGem']==0):raise ValueError('Chưa mở tinh anh')
                if banner['end']-time.time()>2*86400:raise ValueError('Chỉ bù trong 2 ngày cuối')
                missing=max(0,banner['pass'][-1]['target']-dto['reachMap']['taskActivePoint'])
                if missing:consume(p,102,missing*2);counter['passFilled']=counter.get('passFilled',0)+missing
                refresh(store,p);store.save(p);return delta(before,p,route,{})
            name_arg(args,{'task_active'});cost=args.get('oneCostGem',2)
            if type(cost)is not int or cost!=2:raise ValueError('Giá event không khớp')
            missing=max(0,100-p['task']['dailyActivePoint']-daily['filled'])
            if missing:consume(p,102,missing*2);daily['filled']+=missing
        elif action=='fillLoginTopUp':
            name_arg(args,{'privateLogin'});_,_,_,_,_,end=periods()
            if end-int(time.time()*1000)>2*86400000:raise ValueError('Chỉ bù ngày trong hai ngày cuối event')
            missing=max(0,7-len(weekly['loginDays'])-weekly['filled'])
            if missing:consume(p,102,missing*50);weekly['filled']+=missing
        elif action=='updateFreeActivity':name_arg(args,{'saveGemUpgradeLevelFree'})
        elif action=='updateRepeatReceiveActivityTime':pass # Refresh below derives actual entitlement and next deadline.
        elif action=='dreamRoll':awards,temp=dream_roll(p,args)
        elif action=='rollDial':
            typ=args.get('type');times=times_arg(args)
            if not isinstance(typ,str)or typ not in DIAL_COST or times>10:raise ValueError('Vòng quay không hợp lệ')
            if args.get('isAd',False):
                if args['isAd']is not True or typ!='luck'or times!=1:raise ValueError('Lượt hỗ trợ chỉ dùng quay thường một lần')
                from .local_boosts import consume_boost
                consume_boost(p,3)
            else:consume(p,DIAL_COST[typ],times)
            indices=daily['dial'].setdefault('pay',[])if typ=='pay'else None
            awards,selected=draw_prizes(p,times,indices,liveops.prizes(store))
            if indices is not None:indices.extend(selected)
            temp['idxs']=selected;temp['idx']=selected[0]
        elif action in ('scorePoint','receiveScorePointBoxReward'):
            name=name_arg(args,{'scorePoint1','scorePointStarSign'});info=p['activity']['scorePointInfoMap'][name]
            if action=='scorePoint':
                times=times_arg(args);consume(p,info['activityItem']['costMoneyId'],times);awards,_=draw_prizes(p,times,entries=liveops.prizes(store));weekly['score'][name]=weekly['score'].get(name,0)+times
            else:
                score=integer(args.get('score'),'Mốc điểm',1)
                if score not in json.loads(info['activityItem']['needScoresDesc']) or info['score']<score:raise ValueError('Chưa đủ điểm nhận rương')
                boxes=weekly['boxes'].setdefault(name,{})
                if boxes.get(str(score)):raise ValueError('Rương đã nhận')
                boxes[str(score)]=True;awards=description(info['activityItem']['boxDropListDescs'][json.loads(info['activityItem']['needScoresDesc']).index(score)])
        elif action=='spWish':
            name_arg(args,{'privateSpWish'});times=times_arg(args)
            from . import sp_events
            banner=sp_events.current(store)
            if sp_events.config(store)['banners']and not banner:raise ValueError('Không có banner SP đang mở')
            counter=sp_events.state(p,banner)if banner else weekly
            luck_key='luck'if banner else'spLuck';times_key='times'if banner else'spTimes'
            gem_counter=counter if banner else daily;gem_key='gemTimes'if banner else'spGem'
            ticket=banner['ticketId']if banner else 11
            if stack_count(p,ticket)>=times:consume(p,ticket,times)
            else:
                if gem_counter[gem_key]+times>p['activity']['map']['privateSpWish']['costGemMaxTiems']:raise ValueError('Hết lượt quay SP bằng gem hôm nay')
                consume(p,102,p['activity']['map']['privateSpWish']['costGem']*times);gem_counter[gem_key]+=times
            from .gameplay import choose
            pool=banner['pool']if banner else [{'entityId':105504,'count':1,'extra':{'star':3},'weight':5}]+[{'entityId':k,'count':n,'extra':{},'weight':w}for k,n,w in [(20001,20,25),(23001,20,25),(119,1,20),(120,1,10),(21001,5,15)]]
            for _ in range(times):
                guaranteed=counter[luck_key]>=p['activity']['map']['privateSpWish']['maxLuck']-1
                row=copy.deepcopy(pool[0])if guaranteed else copy.deepcopy(choose(pool));row.pop('weight',None);awards.append(row)
                counter[luck_key]=0 if row['entityId']==pool[0]['entityId']else counter[luck_key]+1
                counter[times_key]+=1
        if action in ('dreamRoll','rollDial','scorePoint','spWish'):temp['dropList']=awards
        if awards:temp['entityCountMap']=grant(p,awards)
        refresh(store,p);store.save(p);store.audit('private_activity',{'player':p['id'],'route':route,'args':args,'rewards':awards})
        result=delta(before,p,route,temp)
        if action in ('updateFreeActivity','updateRepeatReceiveActivityTime'):result['activity']={**result.get('activity',{}),'map':copy.deepcopy(p['activity']['map'])}
        return result
