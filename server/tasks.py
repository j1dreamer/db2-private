"""Source task chains, persisted action counters and one-time reward claims."""
import datetime,json,re,time
from .profile import table
from .inventory import entity,active
from .rules import constants
from .state import integer,snapshot,delta
from .item_actions import description
from .adventure import grant
ROUTES={'logic.playerHandler.receiveTaskAward','logic.playerHandler.receiveTaskActiveAward'}

def period(now=None):return datetime.datetime.fromtimestamp(time.time()if now is None else now,datetime.timezone(datetime.timedelta(hours=7))).date().isoformat()

def increment(store,pid,key,amount=1):
    if amount<=0:return
    scope=period()if key.startswith('daily')else '*'
    store.db.execute('INSERT INTO task_counters VALUES(?,?,?,?) ON CONFLICT(player,name,period)DO UPDATE SET value=value+excluded.value',(pid,key,scope,amount))

def record(store,action,detail):
    pid=detail.get('player')
    if type(pid)is not int:return
    mapping={'composeRole':('composeRoleTimes',),'composeItem':('composeStoneCount',),'addShipExperience':('addShipExpTimes','dailyAddShipExpTimes'),'buyCoin':('dailyBuyCoinTimes',),'buyActionPoint':('dailyBuyActionPointTimes',),'giveGift':('dailyFriendGiftTimes',),'giveGiftAll':('dailyFriendGiftTimes',),'giveAndReceiveGiftAll':('dailyFriendGiftTimes',),'sendChat':('dailyChatTimes',),'chat':('dailyChatTimes',),'useExpItem':('dailyUseExperienceItemTimes',),'useExpItemMax':('dailyUseExperienceItemTimes',),'arena_challenge':('arenaTimes','dailyArenaTimes'),'expedition_challenge':('dailyExpeditionTimes',),'tail_challenge':('dailyTailTimes',),'practice':('dailyPracticeTimes',),'guild_worship':('dailyGuildWorshipTimes',),'endless_skip':('dailyEndlessSkipTimes',),'eye_challenge':('dailyEyeTimes',)}
    for name in mapping.get(action,()):increment(store,pid,name,detail.get('count',1))
    if action=='gacha':increment(store,pid,'dailyPointTimes',detail['count'])
    if action=='buy_shop'and detail['shop']==1:increment(store,pid,'buyType1ShopItemTimes')
    if action in ('upgradeRoleSkill','upgradeRoleAwakeSkill'):
        number=detail.get('skillUpgrades',1);increment(store,pid,'skillLevel',number);increment(store,pid,'dailyUpgradeSkillTimes',number)
    if action in ('upgradeEquipment','upgradeEquipmentMax','upgradeAllEquipmentMax'):increment(store,pid,'dailyUpgradeEquipmentTimes',detail.get('equipmentUpgrades',1))
    if action=='useItem'and detail.get('item'):increment(store,pid,'useItem'+str(detail['item'])+'Count',detail['count'])
    if action in ('end_smap','skip_smap')and (action=='skip_smap'or detail.get('star',0)>0):
        smap=next(r for r in table('smap')if r['kindId']==detail['smap']);bmap=next(r for r in table('bmap')if r['kindId']==smap['bmapId'])
        increment(store,pid,'dailyMapType'+str(bmap['type'])+'Times',detail.get('count',1))

def metrics(store,p):
    day=p['privateDay'];values={r['name']:r['value']for r in store.db.execute('SELECT * FROM task_counters WHERE player=? AND period IN(?,?)',(p['id'],'*',day))}
    roles=list(p['team']['roles'].values());items=[item for item in p['bag']['items'].values()if active(item)]
    equipment=[item for role in roles for item in role['equipments'].values()if isinstance(item,dict)and item.get('kindId')]
    values.update(roleCount=len(roles),totalPower=p['power'],vip=p['vip']['level'],guildLevel=p.get('guildLevel',0))
    for typ in (1,2):values['mapType'+str(typ)+'SmapId']=max([int(smap)for chapter in p['smapStarMap'].get(str(typ),{}).values()for smap,stars in chapter.items()if stars>0]+[0])
    for row in table('task'):
        for key in (row.get('require')or {}):
            match=re.fullmatch(r'(roleColor|roleStar|roleLevel|evoItemLevel|haveStone|shipStar)(\d+)Count',key)
            if not match or key in values:continue
            category,number=match.groups();number=int(number)
            if category=='roleColor':value=sum(entity(role['kindId'])['color']>=number for role in roles)
            elif category=='roleStar':value=sum(role['star']>=number for role in roles)
            elif category=='roleLevel':value=sum(role['level']>=number for role in roles)
            elif category=='evoItemLevel':value=sum(entity(item['kindId'])['type']=='evolutionItem'and item.get('level',0)>=number for item in equipment)
            elif category=='haveStone':value=sum(item.get('count',1)for item in items+equipment if entity(item['kindId'])['type']=='stone'and entity(item['kindId'])['level']>=number)
            else:value=sum(entity(item['kindId'])['type']=='ship'and item.get('star',0)>=number for item in items)
            values[key]=value
    now=int(time.time()*1000)
    for key,field in (('isWeekCard','weekCardExpire'),('isMonthCard','monthCardExpire'),('isBigMonthCard','bigMonthCardExpire'),('isYearCard','yearCardExpire')):values[key]=int(p.get(field,0)>now)
    return values

def state(row,p,values):
    requirement=row.get('require')or {};complete=p['level']>=row['requireLevel'];parts=[]
    for name,minimum in requirement.items():
        if name in ('minHours','maxHours'):
            hour=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).hour
            complete=complete and (hour>=minimum if name=='minHours'else hour<minimum);continue
        actual=values.get(name,0);complete=complete and actual>=minimum;parts.append(str(min(actual,minimum))+'/'+str(minimum))
    return {'taskId':row['kindId'],'show':', '.join(parts),'isComplete':bool(complete)}

def refresh(store,p):
    before=json.dumps(p['task'],sort_keys=True);values=metrics(store,p);day=p['privateDay']
    claims={(r['task'],r['period'])for r in store.db.execute('SELECT task,period FROM task_claims WHERE player=? AND period IN(?,?)',(p['id'],'*',day))}
    grouped={};groups={1:'main',2:'daily',3:'achievement'}
    for row in table('task'):
        if row['type']in groups and isinstance(row.get('require'),dict):grouped.setdefault((row['type'],row['groupId']),[]).append(row)
    for name in groups.values():p['task'][name]={}
    for (typ,group),rows in grouped.items():
        selected=next((row for row in sorted(rows,key=lambda r:r['rankId'])if (row['kindId'],day if typ==2 else '*')not in claims),None)
        p['task'][groups[typ]][str(group)]=state(selected,p,values)if selected else {'taskId':0,'show':'','isComplete':False}
    p['task'].setdefault('achievementPoint',0)
    return before!=json.dumps(p['task'],sort_keys=True)

def handle(store,account,route,args):
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        before=snapshot(p)
        local_boost=False
        if route.endswith('receiveTaskAward'):
            local_boost=args.get('isAd',False)
            if type(local_boost)is not bool:raise ValueError('Chế độ thưởng nhiệm vụ không hợp lệ')
            tid=integer(args.get('taskId'),'Nhiệm vụ',1);row=next((row for row in table('task')if row['kindId']==tid),None)
            if not row or row['type']not in (1,2,3):raise ValueError('Nhiệm vụ không tồn tại')
            group={1:'main',2:'daily',3:'achievement'}[row['type']];current=p['task'][group].get(str(row['groupId']))
            if not current or current['taskId']!=tid or not current['isComplete']:raise ValueError('Nhiệm vụ chưa hoàn thành hoặc đã nhận')
            if local_boost:
                if row['type']!=2:raise ValueError('Lượt hỗ trợ chỉ áp dụng nhiệm vụ hằng ngày')
                from .local_boosts import consume_boost
                consume_boost(p,6)
            scope=p['privateDay']if row['type']==2 else '*';store.db.execute('INSERT INTO task_claims VALUES(?,?,?)',(p['id'],tid,scope))
            entries=description(row['dropListDesc'])
            if local_boost:entries=[{**entry,'count':entry['count']*2}for entry in entries]
            rewards=grant(p,entries);points=(row.get('activePoint')or 0)*(2 if local_boost else 1)
            p['task']['dailyActivePoint']+=points;p['task']['weeklyActivePoint']+=points;p['task']['achievementPoint']+=row.get('achievementPoint')or 0
        else:
            typ=args.get('type');point=integer(args.get('point'),'Mốc hoạt động',1,100000)
            if typ not in ('daily','weekly'):raise ValueError('Loại hoạt động không hợp lệ')
            reward=constants('server.TASK.CONSTS.ACTIVE_REWARD_MAP')[typ].get(str(point));claimed=p['task']['receivedPointMap'][typ]
            if not reward or p['task'][typ+'ActivePoint']<point or claimed.get(str(point)):raise ValueError('Chưa đạt mốc hoặc đã nhận thưởng')
            rewards=grant(p,description(reward));claimed[str(point)]=True
        refresh(store,p);store.save(p);store.audit('task_reward',{'player':p['id'],'route':route})
        return delta(before,p,route,{'entityCountMap':rewards,'privateLocalReward':local_boost})
