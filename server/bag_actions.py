"""Inventory RPCs: owned instances, source costs, atomic consume/upgrade/grant."""
import math,secrets
from .profile import table
from .rules import constants
from .inventory import entity,bag_item,capsule_skills,star_growth,ship_attrs
from .state import integer,consume,stack_count,snapshot,delta,vip_data
from .gameplay import add_reward
NAMES=('sell','composeRole','composeItem','composeArtifact','upgradeStarArtifact','increaseArtifactUpgradeStarSuccessRate','composeFruit','upgradeStarFruit','increaseFruitUpgradeStarSuccessRate','composeShip','addShipExperience','upgradeShip','upgradeShipStar','upgradeShipSkill','resetCapsule','saveResetCapsule','composeCapsule','upgradeStarSign','decomposeStarSign')
ROUTES={'logic.bagHandler.'+name for name in NAMES}

def indices(values):
    if not isinstance(values,list) or not 1<=len(values)<=500:raise ValueError('Danh sách ô túi không hợp lệ')
    result=[]
    for value in values:
        if type(value)not in (str,int) or not str(value).isdigit():raise ValueError('Ô túi không hợp lệ')
        result.append(str(int(value)))
    if len(set(result))!=len(result):raise ValueError('Ô túi bị lặp')
    return result

def take_index(player,index,count=1):
    item=bag_item(player,index);integer(count,'Số lượng',1)
    if item['count']<count:raise ValueError('Không đủ vật phẩm trong ô túi')
    item['count']-=count
    if not item['count']:del player['bag']['items'][str(int(index))]

def reward(player,kind,count=1):return add_reward(player,{'entityId':kind,'count':count,'extra':{}})

def compose_fragment(player,typ,fragment):
    integer(fragment,'Mảnh ghép',1);row=next((r for r in table(typ)if r['fragmentId']==fragment),None)
    if not row:raise ValueError('Mảnh ghép không hợp lệ')
    cfg=constants('server.'+typ.upper()+'.CONSTS')
    if typ=='ship' and any(x['kindId']==row['kindId'] for x in player['bag']['items'].values()):raise ValueError('Đã sở hữu đồng hành này')
    consume(player,fragment,cfg['COMPOSE_REQUIRED_FRAGMENT_COUNT']);consume(player,101,cfg['COMPOSE_COST_COIN'])
    return reward(player,row['kindId'])

def artifact_upgrade(player,item,typ,increase=False):
    cfg=constants('server.'+typ.upper()+'.CONSTS');star=item['star'];times=item['increaseTimes']
    if star>=cfg['MAX_STAR']:raise ValueError('Đã đạt sao tối đa')
    if increase:
        if times>=cfg['INCREASE_SUCCESS_RATE_MAX_TIMES']:raise ValueError('Đã tăng tỷ lệ tối đa')
        consume(player,102,cfg['INCREASE_SUCCESS_RATE_COST_GEMS'][times+1]);item['increaseTimes']+=1
        return {}
    consume(player,entity(item['kindId'])['fragmentId'],cfg['UPGRADE_REQUIRED_FRAGMENT_COUNT'])
    rate=min(1,cfg['UPGRADE_SUCCESS_RATES'][star+1]+cfg['INCREASE_SUCCESS_RATE']*times)
    success=secrets.randbelow(10**6)<round(rate*10**6)
    if success:item['star']+=1
    item['increaseTimes']=0
    return {'isSuccess':success}

def ship_exp(item):return next(r['shipExp']for r in table('experience')if r['level']==item['level'])

def ship(player,item,action,args):
    cfg=constants('server.SHIP.CONSTS');maximum=cfg['MAX_LEVEL']
    if action=='upgradeShipStar':
        if item['star']>=cfg['MAX_STAR'] or item['level']!=maximum:raise ValueError('Cần cấp tối đa và chưa đủ sao tối đa')
        consume(player,entity(item['kindId'])['fragmentId'],50)
        # Private progression policy for the server-only reset: each 100-level
        # cycle advances a star and restarts at level 1, preserving skill levels.
        item['star']+=1;item['level']=1;item['experience']=0;item['nextLevelExp']=ship_exp(item)
    elif action=='upgradeShipSkill':
        level=item['skillLevel']
        if level>=item['star']*cfg['STAR_MAX_LEVEL_SCALE']:raise ValueError('Kỹ năng đã đạt giới hạn của sao hiện tại')
        cost=next(r['skillUpgradeCoin']for r in table('cost')if r['level']==level)*5
        consume(player,101,cost);consume(player,102,3*level);item['skillLevel']+=1
    else:
        if item['level']>=maximum:raise ValueError('Đồng hành đã đạt cấp tối đa')
        if action=='upgradeShip':
            if player['vip'].get('shipUpgradeLevelTimes',0)>=vip_data(player)['shipUpgradeLevelTimes']:raise ValueError('Đã hết lượt nâng cấp bằng gem hôm nay')
            consume(player,102,math.ceil(cfg['UPGRADE_COST_GEM']*(item['nextLevelExp']-item['experience'])/item['nextLevelExp']))
            amount=item['nextLevelExp']-item['experience'];player['vip']['shipUpgradeLevelTimes']=player['vip'].get('shipUpgradeLevelTimes',0)+1
        else:
            amount=integer(args.get('experience'),'Kinh nghiệm',1,10**7)
            consume(player,cfg['ADD_EXP_COST_ENTITY_ID'],amount)
        item['experience']+=amount
        while item['level']<maximum and item['experience']>=item['nextLevelExp']:
            item['experience']-=item['nextLevelExp'];item['level']+=1;item['nextLevelExp']=ship_exp(item)
        if item['level']==maximum:item['experience']=0

def capsule_cost(kind,compose=False):
    if compose:
        if kind not in range(60002,60007):raise ValueError('Cấp capsule không hợp lệ')
        cost={101:[500000,1000000,1500000,3000000,5000000][kind-60002],kind-1:3 if kind==60006 else 5}
        if kind==60006:cost[60008]=1
    else:
        if kind not in range(60001,60007):raise ValueError('Capsule không hợp lệ')
        cost={101:[100000,300000,600000,1500000,3000000,5000000][kind-60001],60007:[20,50,120,300,750,2000][kind-60001]}
    return cost

STAR_SOUL={'critRate':61201,'incAtkRate':61202,'incHpRate':61203,'atkSpeedRate':61204,'cdSpeedRate':61205,'unDeBuffRate':61206,'ignoreCritRate':61207,'addMpRecoverRate':61208,'addHpRecoverRate':61209,'skipHitRate':61210,'hitReduceMpRate':61211,'ignoreUnDeBuffRate':61212}
STAR_SOUL_COUNTS=[[1,1,2,2,3,4,5,5,6],[2,2,4,4,6,8,10,10,12],[4,4,8,8,12,16,20,20,24],[6,6,12,12,18,24,30,30,36],[8,8,16,16,24,32,40,40,50]]
STAR_STONE_COUNTS=[[5,5,10,10,15,20,25,25,30],[10,10,20,20,30,40,50,50,60],[20,20,40,40,60,80,100,100,120],[30,30,60,60,90,120,150,150,180],[40,40,80,80,120,160,200,200,250]]

def handle(store,account,route,args):
    action=route.rsplit('.',1)[-1]
    if route not in ROUTES:raise ValueError('Thao tác túi không tồn tại')
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        before=snapshot(p);temp={};granted={}
        if action=='sell':
            keys=indices(args.get('bagIndexs'));counts=args.get('itemCounts')
            if not isinstance(counts,list) or len(keys)!=len(counts):raise ValueError('Số lượng bán không hợp lệ')
            gain=0
            for key,count in zip(keys,counts):
                item=bag_item(p,key);row=entity(item['kindId']);integer(count,'Số lượng bán',1)
                if row['type']in ('money','box') or row['price']<=0:raise ValueError('Vật phẩm này không thể bán')
                gain+=row['price']*count;take_index(p,key,count)
            p['coin']+=gain;granted={'101':gain}
        elif action=='composeRole':
            class_id=integer(args.get('classId'),'Tướng',1);soul=next((r for r in table('soul')if r['classId']==class_id),None)
            if not soul:raise ValueError('Tướng không tồn tại')
            if any(entity(r['kindId'])['classId']==class_id for r in p['team']['roles'].values()):raise ValueError('Đã sở hữu tướng này')
            star=soul['star']
            if star not in (1,2,3):raise ValueError('Không có chi phí hợp thành ở cấp sao này')
            consume(p,soul['kindId'],[0,10,30,60][star]);consume(p,101,[0,1000,35000,120000][star])
            granted=add_reward(p,{'entityId':soul['roleId'],'count':1,'extra':{'star':star}})
        elif action=='composeItem':
            kind=integer(args.get('kindId'),'Vật phẩm',1);row=entity(kind)
            if row['type']!='stone' or not row.get('requiredIds'):raise ValueError('Vật phẩm không thể hợp thành')
            all_items=args.get('isAll',False)
            if type(all_items)is not bool:raise ValueError('Chế độ hợp thành không hợp lệ')
            number=min(stack_count(p,k)//n for k,n in zip(row['requiredIds'],row['requiredCounts']))
            if row['requiredCoin']:number=min(number,p['coin']//row['requiredCoin'])
            number=min(number,1000)if all_items else min(number,1)
            if not number:raise ValueError('Không đủ nguyên liệu hợp thành')
            for k,n in zip(row['requiredIds'],row['requiredCounts']):consume(p,k,n*number)
            consume(p,101,row['requiredCoin']*number);granted=reward(p,kind,number)
        elif action in ('composeArtifact','composeFruit','composeShip'):
            granted=compose_fragment(p,action[7:].lower(),args.get('fragmentId'))
        elif 'Artifact'in action or 'Fruit'in action:
            typ='artifact'if 'Artifact'in action else 'fruit';item=bag_item(p,args.get('bagIndex'),typ)
            temp.update(artifact_upgrade(p,item,typ,action.startswith('increase')))
        elif 'Ship'in action:
            item=bag_item(p,args.get('bagIndex'),'ship');ship(p,item,action,args);ship_attrs(item)
        elif action in ('resetCapsule','saveResetCapsule'):
            item=bag_item(p,args.get('bagIndex'),'capsule')
            if action=='resetCapsule':
                for kind,count in capsule_cost(item['kindId']).items():consume(p,kind,count)
                item['cacheSkillInfo']=capsule_skills(item['kindId'])
            else:
                save=args.get('isSave')
                if type(save)is not bool:raise ValueError('Lựa chọn lưu không hợp lệ')
                if not item.get('cacheSkillInfo'):raise ValueError('Chưa có thuộc tính tái tạo')
                if save:item['skillInfo']=item['cacheSkillInfo']
                item['cacheSkillInfo']={}
        elif action=='composeCapsule':
            kind=integer(args.get('capsuleId'),'Capsule',60002,60006);cost=capsule_cost(kind,True);keys=indices(args.get('bagIndexs'));actual={}
            for key in keys:
                item=bag_item(p,key);actual[item['kindId']]=actual.get(item['kindId'],0)+1
            if actual!={k:v for k,v in cost.items()if k!=101}:raise ValueError('Nguyên liệu capsule không đúng')
            consume(p,101,cost[101])
            for key in keys:take_index(p,key)
            granted=reward(p,kind)
        elif action=='upgradeStarSign':
            item=bag_item(p,args.get('bagIndex'),'starSign');row=entity(item['kindId']);level=item['level'];color=row['extra']['color'];attr=row['extra']['attr']
            if level>=constants('server.STAR_SIGN.CONSTS.MAX_LEVEL'):raise ValueError('Tinh tú đã đạt cấp tối đa')
            consume(p,STAR_SOUL[attr],STAR_SOUL_COUNTS[color-1][level-1]);consume(p,61001,STAR_STONE_COUNTS[color-1][level-1])
            item['attrValue']=round(item['attrValue']+star_growth(row),12);item['level']+=1
        elif action=='decomposeStarSign':
            keys=indices(args.get('bagIndexs'))
            rewards={}
            for key in keys:
                item=bag_item(p,key,'starSign');row=entity(item['kindId']);color=row['extra']['color'];level=item['level'];soul=STAR_SOUL[row['extra']['attr']]
                rewards[61002]=rewards.get(61002,0)+[2,4,8,16,30][color-1]
                for kind,count in ((soul,math.ceil(sum(STAR_SOUL_COUNTS[color-1][:level-1])/2)),(61001,math.ceil(sum(STAR_STONE_COUNTS[color-1][:level-1])/2))):rewards[kind]=rewards.get(kind,0)+count
                take_index(p,key)
            for kind,count in rewards.items():
                if count:granted.update(reward(p,kind,count))
        if granted:temp['entityCountMap']=granted
        store.save(p);store.audit(action,{'player':p['id'],'count':sum(granted.values())if action=='composeItem'else 1})
        return delta(before,p,route,temp)
