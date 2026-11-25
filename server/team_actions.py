"""Owned roster progression with source costs and refundable investment ledgers."""
import copy,math,secrets
from .profile import table
from .inventory import entity,bag_item,active
from .state import integer,consume,stack_count,snapshot,delta,vip_data
from .rules import constants
from . import progression
from .bag_actions import indices,take_index,reward
EQUIPMENT_NAMES=('upgradeEquipment','upgradeEquipmentMax','upgradeAllEquipmentMax','evolveEquipment','evolveAllEquipment')
OTHER_NAMES=('evolveRole','upgradeRoleStar','roleBreak','upgradeRoleSkill','useExpItem','useExpItemMax','upgradeRoleAwakeLevel','increaseAwakeLevelUpgradeSuccessRate','upgradeRoleAwakeSkill','trainRole','resetRoleTrain','unlockRoleTrain','unlockFriendship','resetRole','soulRole','increaseEvolveSkillSuccessRate','evolveRoleSkill')
GEAR_TYPES=('Stone','Artifact','Capsule','StarSign')
ROUTES={'logic.teamHandler.'+name for name in EQUIPMENT_NAMES+OTHER_NAMES}
ROUTES|={'logic.teamHandler.'+verb+typ for typ in GEAR_TYPES for verb in ('equip','unEquip','equipAll','unEquipAll')}

def owned(player,index):
    if type(index)not in (int,str) or not str(index).isdigit():raise ValueError('Ô chiến binh không hợp lệ')
    role=player['team']['roles'].get(str(int(index)))
    if not role:raise ValueError('Chiến binh không thuộc tài khoản')
    return role

def basis(player,role):
    key=str(role['idx']);bases=player.setdefault('privateRoleBases',{})
    if key not in bases:
        bases[key]=copy.deepcopy(role)
        bases[key]['equipments']={k:v for k,v in bases[key]['equipments'].items()if k.startswith('evlItem_')}
    return player.setdefault('privateRoleInvestments',{}).setdefault(key,[])

def spend(player,role,kind,count,group='progression'):
    consume(player,kind,count)
    if count:basis(player,role).append({'kindId':kind,'count':count,'group':group})

def put_item(player,item):
    item=copy.deepcopy(item);bag=player['bag'];kind=item['kindId']
    if entity(kind)['maxNum']<0:
        existing=next((x for x in bag['items'].values()if x['kindId']==kind and x.get('expireTime')==item.get('expireTime')and active(x)),None)
        if existing:existing['count']+=item.get('count',1);return
    idx=max([bag['lastIdx']]+[int(k)for k in bag['items']])+1;bag['lastIdx']=idx;item.update(idx=idx,count=item.get('count',1));bag['items'][str(idx)]=item

def slots(role,typ):
    cfg=constants('server.EQUIPMENTS.CONSTS');need=cfg['EQUIP_TYPE_NEED_AWAKE_LEVEL_MAP']
    return [key for key in cfg[{'Stone':'STONE_ITEM_TYPES','Artifact':'ARTIFACT_ITEM_TYPES','Capsule':'CAPSULE_ITEM_TYPES','StarSign':'STAR_SIGN_ITEM_TYPES'}[typ]]if role['awakeLevel']>=need.get(key,0)]

def item_score(item):
    row=entity(item['kindId']);return (row['color'],item.get('star',0),item.get('level',0),sum(s['level']for s in item.get('skillInfo',{}).values()),item['kindId'])

def compatible(role,item,typ,slot):
    row=entity(item['kindId'])
    if typ=='Stone':return row['equipmentType']==slot
    if typ=='Artifact':return not any(other and key!=slot and isinstance(other,dict)and other['kindId']==item['kindId']for key,other in role['equipments'].items())
    return True

def equip_at(player,role,item,slot):
    old=role['equipments'].get(slot);value=copy.deepcopy(item);value.pop('idx',None);value['count']=1
    take_index(player,item['idx']);role['equipments'][slot]=value
    if old:put_item(player,old)

def gear(player,role,action,args):
    typ=next(t for t in GEAR_TYPES if action.endswith(t));minimum=constants('client.CONSTS.UNLOCK_LEVEL')[{'StarSign':'STAR_SIGN'}.get(typ,typ.upper())]
    if player['level']<minimum:raise ValueError('Chưa mở loại trang bị này')
    available=slots(role,typ);valid_type=typ[0].lower()+typ[1:];changed=False
    if action.startswith('unEquip'):
        targets=available if action.startswith('unEquipAll')else [args.get('equipmentType')]
        if any(key not in available for key in targets):raise ValueError('Vị trí trang bị không hợp lệ')
        for key in targets:
            item=role['equipments'].get(key)
            if item:put_item(player,item);role['equipments'][key]=None;changed=True
    elif action.startswith('equipAll'):
        for key in available:
            current=role['equipments'].get(key)
            choices=[item for item in player['bag']['items'].values()if active(item)and entity(item['kindId'])['type']==valid_type and compatible(role,item,typ,key)and (not current or item_score(item)>item_score(current))]
            if choices:equip_at(player,role,max(choices,key=item_score),key);changed=True
    else:
        item=bag_item(player,args.get('bagIndex'),valid_type)
        choices=[key for key in available if compatible(role,item,typ,key)]
        if not choices:raise ValueError('Không có vị trí trang bị phù hợp')
        key=min(choices,key=lambda key:(bool(role['equipments'].get(key)),item_score(role['equipments'][key])if role['equipments'].get(key)else ()))
        equip_at(player,role,item,key);changed=True
    if not changed:raise ValueError('Không có trang bị cần thay đổi')

def equipment(player,role,action,args):
    all_slots=constants('server.EQUIPMENTS.CONSTS.EVL_ITEM_TYPES')
    targets=all_slots if 'All'in action else [args.get('equipmentType')]
    if any(key not in all_slots for key in targets):raise ValueError('Chiêu thức trang bị không hợp lệ')
    changed=[];costs={row['level']:row['eqpUpgradeCoin']for row in table('cost')}
    if action=='upgradeAllEquipmentMax' and not vip_data(player)['isUpgradeAllEquipmentMax']:raise ValueError('VIP hiện tại chưa mở nâng tất cả tối đa')
    for slot in targets:
        item=role['equipments'][slot];row=entity(item['kindId'])
        if action.startswith('upgrade'):
            maximum=role['level']if action.endswith('Max')else min(role['level'],item['level']+1)
            while item['level']<maximum:
                cost=costs[item['level']+1]
                if player['coin']<cost:break
                spend(player,role,101,cost);item['level']+=1
                if slot not in changed:changed.append(slot)
        else:
            kind=row.get('evolutionItemId');next_row=entity(kind)if kind else None
            if not next_row or row['color']>entity(role['kindId'])['color']:continue
            needed=list(zip(next_row['requiredIds']or [],next_row['requiredCounts']or []));coin=constants('server.EQUIPMENTS.CONSTS.EVOLVE_COST_COINS')[next_row['color']]
            if any(stack_count(player,k)<n for k,n in needed)or player['coin']<coin:continue
            for kind,count in needed:spend(player,role,kind,count)
            spend(player,role,101,coin);item['kindId']=next_row['kindId'];changed.append(slot)
    if not changed:raise ValueError('Không thể nâng trang bị: thiếu nguyên liệu, vàng hoặc đã đạt giới hạn')
    return {'equipmentTypes':changed}

def use_exp(player,role,args,all_items=False):
    need=progression.needed_exp(player,role)
    if role['level']>=progression.max_level(player,role)or need<=0:raise ValueError('Chiến binh đã đạt cấp tối đa hiện tại')
    if all_items:
        items=sorted((item for item in player['bag']['items'].values()if active(item)and entity(item['kindId']).get('extra',{}).get('roleExp')),key=lambda item:entity(item['kindId'])['extra']['roleExp'])
    else:items=[bag_item(player,args.get('bagIndex'))]
    gained=0
    for item in items:
        value=entity(item['kindId']).get('extra',{}).get('roleExp')
        if not value:raise ValueError('Vật phẩm không tăng kinh nghiệm chiến binh')
        amount=min(item['count'],math.ceil((need-gained)/value))if all_items else integer(args.get('itemCount'),'Số lượng',1,item['count'])
        if amount<=0:break
        # Explicit input is capped to items needed, rather than burning excess.
        amount=min(amount,math.ceil((need-gained)/value));kind=item['kindId'];take_index(player,item['idx'],amount)
        basis(player,role).append({'kindId':kind,'count':amount,'group':'experience'});gained+=value*amount
        if gained>=need:break
    if not gained:raise ValueError('Không có vật phẩm kinh nghiệm')
    progression.role_exp(player,role,gained)

def skill(player,role,action,args):
    kind=integer(args.get('skillKindId'),'Kỹ năng',1);awake=action=='upgradeRoleAwakeSkill';group='awakeSkills'if awake else 'skills';entry=role[group].get(str(kind))
    if not entry:raise ValueError('Kỹ năng chưa mở hoặc không thuộc chiến binh')
    maximum=entry['maxLevel']if awake else min(role['level'],constants('server.ROLE.CONSTS.MAX_SKILL_LEVEL'))
    is_max=args.get('isMax',False)
    if type(is_max)is not bool:raise ValueError('Chế độ nâng kỹ năng không hợp lệ')
    end=maximum if is_max else min(maximum,entry['level']+1);changed=False;costs={r['level']:r['skillUpgradeCoin']for r in table('cost')}
    while entry['level']<end:
        cost=costs[entry['level']+100 if awake else entry['level']]
        if player['coin']<cost or player['skillPoint']<1:break
        spend(player,role,101,cost);player['skillPoint']-=1;basis(player,role).append({'kindId':'skillPoint','count':1,'group':'progression'});entry['level']+=1;changed=True
    if not changed:raise ValueError('Không thể nâng kỹ năng: hết điểm, vàng hoặc đã đạt giới hạn')

def star(player,role,action,args):
    row=entity(role['kindId']);current=role['star'];maximum=15 if row['group']==2 else 20
    if current>=maximum or action=='upgradeRoleStar'and current>=5 or action=='roleBreak'and current<5:raise ValueError('Cấp sao không phù hợp với thao tác')
    cost=progression.rules()['starCosts'][current];soul=next(r for r in table('soul')if r['classId']==row['classId'])
    if action=='upgradeRoleStar':spend(player,role,soul['kindId'],cost['soul'])
    else:
        keys=indices(args.get('bagIndexs'));remaining=cost['soul']
        for key in keys:
            item=bag_item(player,key,'soul');fragment=entity(item['kindId']);owner=next((r for r in player['team']['roles'].values()if entity(r['kindId'])['classId']==fragment['classId']),None)
            if not owner or (cost['isSelf'] and owner['kindId']!=role['kindId']) or (not cost['isSelf']and owner['star']<5):raise ValueError('Linh hồn được chọn không hợp lệ')
            amount=min(remaining,item['count']);take_index(player,key,amount);basis(player,role).append({'kindId':item['kindId'],'count':amount,'group':'progression'});remaining-=amount
            if not remaining:break
        if remaining:raise ValueError('Không đủ linh hồn đột phá')
    spend(player,role,101,cost['coin']);spend(player,role,102,cost['gem']);role['star']+=1

def awake(player,role,action):
    cfg=constants('server.ROLE.CONSTS');row=entity(role['kindId'])
    if row['group']<cfg['AWAKE_NEED_GROUP']or role['star']!=cfg['AWAKE_NEED_STAR']or role['awakeLevel']>=cfg['MAX_AWAKE_LEVEL']:raise ValueError('Chưa đủ điều kiện thức tỉnh hoặc đã đạt tối đa')
    if action.startswith('increase'):
        costs=cfg['UPGRADE_AWAKE_LEVEL_INCREASE_RATE_COST_GEMS'];times=role['awakeRateIncreaseTimes']
        if times+1>=len(costs):raise ValueError('Tỷ lệ thức tỉnh đã đạt tối đa')
        spend(player,role,102,costs[times+1]);role['awakeRateIncreaseTimes']+=1;return {}
    cost=progression.rules()['awakeCosts'][role['awakeLevel']];soul=next(r for r in table('soul')if r['classId']==row['classId'])
    spend(player,role,101,cost['coin']);spend(player,role,soul['kindId'],cost['soul'])
    rate=min(1,cfg['UPGRADE_AWAKE_LEVEL_RATE']+cfg['UPGRADE_AWAKE_LEVEL_INCREASE_RATE']*role['awakeRateIncreaseTimes']);success=secrets.randbelow(10**6)<round(rate*10**6)
    if success:role['awakeLevel']+=1
    role['awakeRateIncreaseTimes']=0;return {'isSuccess':success}

def refund(player,entries):
    result={};points=0
    for entry in entries:
        if entry['kindId']=='skillPoint':player['skillPoint']+=entry['count'];points+=entry['count']
        else:
            for key,count in reward(player,entry['kindId'],entry['count']).items():result[key]=result.get(key,0)+count
    return {'entityCountMap':result,'getSkillPoint':points}

def train(player,role,action,args):
    cfg=constants('server.ROLE.CONSTS');typ=str(integer(args.get('type'),'Mục tu luyện',1,15))
    if role['awakeLevel']<10:raise ValueError('Tu luyện cần thức tỉnh cấp 10')
    level=role['trainLevelMap'].get(typ,0);group='train_'+typ
    if action=='unlockRoleTrain':
        if role['trainUnlockMap'].get(typ):raise ValueError('Đã mở mục tu luyện')
        spend(player,role,cfg['TRAIN_UNLOCK_COST']['ID'],cfg['TRAIN_UNLOCK_COST']['COUNT']);role['trainUnlockMap'][typ]=True
    elif action=='resetRoleTrain':
        if not level:raise ValueError('Chưa có tu luyện để đặt lại')
        consume(player,102,cfg['RESET_TRAIN_COST_GEM']);ledger=basis(player,role);selected=[r for r in ledger if r['group']==group]
        if not selected:raise ValueError('Không có sổ tài nguyên tu luyện để hoàn trả')
        temp=refund(player,selected);ledger[:]=[r for r in ledger if r['group']!=group];role['trainLevelMap'][typ]=0;return temp
    else:
        if not role['trainUnlockMap'].get(typ)or level>=len(cfg['TRAIN_ITEM_IDS_MAP'][typ]):raise ValueError('Tu luyện chưa mở hoặc đã đạt tối đa')
        cost=cfg['TRAIN_COST'];row=entity(role['kindId']);soul=next(r for r in table('soul')if r['classId']==row['classId'])
        for kind,count in ((soul['kindId'],cost['SOUL']),(102,cost['GEM']),(101,cost['COIN']),(cost['STONE']['ID'],cost['STONE']['COUNT'])):spend(player,role,kind,count,group)
        role['trainLevelMap'][typ]=level+1
    return {}

def evolve_skill(player,role,action,args):
    cfg=constants('server.ROLE.CONSTS');times=role['evolveSkillRateIncreaseTimes']
    if action=='increaseEvolveSkillSuccessRate':
        costs=cfg['EVOLVE_SKILL_INCREASE_RATE_COST_GEMS']
        if times+1>=len(costs):raise ValueError('Tỷ lệ tiến hóa kỹ năng đã tối đa')
        spend(player,role,102,costs[times+1]);role['evolveSkillRateIncreaseTimes']+=1;return {}
    kind=integer(args.get('skillKindId'),'Kỹ năng',1);entry=role['skills'].get(str(kind));row=next((r for r in table('fightSkill')if r['kindId']==kind),None)
    if not entry or not row or not row.get('unlockDesc') or entry['level']<cfg['EVOLVE_SKILL_NO_LEVEL_MAP'].get(str(row['no']),100)or kind in role['evolveSkillIds']:raise ValueError('Kỹ năng chưa đủ điều kiện tiến hóa')
    soul=next(r for r in table('soul')if r['classId']==entity(role['kindId'])['classId']);spend(player,role,soul['kindId'],120);spend(player,role,85,1)
    success=secrets.randbelow(10**6)<round(min(1,cfg['EVOLVE_SKILL_RATE']+cfg['EVOLVE_SKILL_INCREASE_RATE']*times)*10**6)
    if success:role['evolveSkillIds'].append(kind)
    role['evolveSkillRateIncreaseTimes']=0;return {'isSuccess':success}

def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác đội hình không tồn tại')
    action=route.rsplit('.',1)[-1]
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        before=snapshot(p);temp={}
        if action=='unlockFriendship':
            fid=integer(args.get('friendShipId'),'Duyên phận',1);class_id=integer(args.get('classId'),'Tướng',1);row=next((r for r in table('friendship')if r['kindId']==fid),None);owned_classes={entity(r['kindId'])['classId']for r in p['team']['roles'].values()}
            if not row or class_id not in row['requiredClassIds']or not set(row['requiredClassIds'])<=owned_classes:raise ValueError('Chưa sở hữu đủ nhóm duyên phận')
            mapping=p['friendshipUnlockMap'].setdefault(str(fid),{})
            if mapping.get(str(class_id)):raise ValueError('Duyên phận đã được mở')
            mapping[str(class_id)]=True
        else:
            role=owned(p,args.get('teamIndex'));pre=copy.deepcopy(role);basis(p,role)
            if any(action.endswith(t)for t in GEAR_TYPES):gear(p,role,action,args)
            elif action in EQUIPMENT_NAMES:temp.update(equipment(p,role,action,args))
            elif action in ('useExpItem','useExpItemMax'):use_exp(p,role,args,action.endswith('Max'))
            elif action in ('upgradeRoleSkill','upgradeRoleAwakeSkill'):skill(p,role,action,args)
            elif action in ('upgradeRoleStar','roleBreak'):star(p,role,action,args);temp['preRole']=pre
            elif action in ('upgradeRoleAwakeLevel','increaseAwakeLevelUpgradeSuccessRate'):temp.update(awake(p,role,action));temp['preRole']=pre
            elif action in ('trainRole','resetRoleTrain','unlockRoleTrain'):temp.update(train(p,role,action,args))
            elif action in ('increaseEvolveSkillSuccessRate','evolveRoleSkill'):temp.update(evolve_skill(p,role,action,args))
            elif action=='evolveRole':
                row=entity(role['kindId']);kind=row.get('evolutionRoleId')
                if not kind or any(entity(role['equipments'][key]['kindId'])['color']!=row['color']+1 for key in constants('server.EQUIPMENTS.CONSTS.EVL_ITEM_TYPES')):raise ValueError('Cần tiến hóa đủ sáu chiêu thức trước')
                needed=constants('server.ROLE.CONSTS.EVOLVE_COLOR_NEED_STAR_MAP').get(str(entity(kind)['color']),0)
                if role['star']<needed:raise ValueError('Chưa đủ sao để tiến hóa màu này')
                role['kindId']=kind;temp['preRole']=pre
            elif action=='soulRole':
                typ=str(integer(args.get('type'),'Chiến hồn',1,9));row=entity(role['kindId']);level=role['soulLevelMap'].get(typ,0)
                if row['group']<4 or role['level']<50 or level>=progression.rules()['soulMaxLevels'][str(role['star'])][typ]:raise ValueError('Chiến hồn chưa mở hoặc đã đạt giới hạn')
                cost=progression.rules()['soulCosts'][str(int(row['group']>=5))][typ][level]
                for kind,count in zip(cost['costItemIds'],cost['costItemCounts']):spend(p,role,kind,count)
                role['soulLevelMap'][typ]=level+1
            elif action=='resetRole':
                ledger=basis(p,role)
                if not ledger:raise ValueError('Chưa có tài nguyên huấn luyện để đặt lại')
                consume(p,102,constants('server.ROLE.CONSTS.RESET_COST_GEM'))
                for key,item in role['equipments'].items():
                    if not key.startswith('evlItem_')and isinstance(item,dict):put_item(p,item)
                temp.update(refund(p,ledger));base=copy.deepcopy(p['privateRoleBases'][str(role['idx'])]);role.clear();role.update(base);ledger.clear()
            progression.learn_skills(role)
        progression.friendships(p)
        store.save(p);store.audit(action,{'player':p['id'],'team':args.get('teamIndex')})
        return delta(before,p,route,temp)
