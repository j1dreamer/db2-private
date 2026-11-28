"""Typed inventory models from dataApi and the recovered item consumers."""
import secrets,time
from functools import lru_cache
from .profile import table
from .rules import constants

@lru_cache(None)
def entities():
    result={r['kindId']:dict(r) for name in ('entity','entityExt')for r in table(name)}
    for name in {r['type']for r in result.values()}:
        try:rows=table(name)
        except FileNotFoundError:continue
        for row in rows:
            if row['kindId']in result:result[row['kindId']].update(row)
    return result

def entity(kind):
    if type(kind)is not int or kind not in entities():raise ValueError('Vật phẩm không tồn tại')
    return entities()[kind]

def active(item,now=None):return not item.get('expireTime') or item['expireTime']>=(int(time.time()*1000)if now is None else now)

def weighted(weights):
    total=sum(weights.values())
    if total<=0:raise ValueError('Trọng số không hợp lệ')
    n=secrets.randbelow(total)
    for key,value in weights.items():
        n-=value
        if n<0:return key

def capsule_skills(kind):
    row=entity(kind);cfg=constants('server.CAPSULE.CONSTS.ATTR_VALUES_MAP');keys=list(cfg)
    # Same exclusions as CAPSULE.FUNS.buildSkillAttrs for the basic capsule.
    if kind==60001:
        excluded={'incHpRate','unDeBuffRate','beginMaxHpRateShield','beginHitDmgRate','beginHitMdmgRate','hitUnReviveRate','hitRateSilence2','hitRepeledRate2','hitBleedingHpRate','recoverHp10SecRate2','beginRecoverFullMpRate','removeDeBuffSec','reboundDmgRate'}
        keys=[key for key in keys if key not in excluded]
    result={}
    for _ in range(row['extra']['buildCount']):
        index=secrets.randbelow(len(keys));key=keys.pop(index)
        result[key]={'level':int(weighted(row['extra']['levelWeightMap']))}
    return result

def star_growth(row):
    low,high=constants('server.STAR_SIGN.CONSTS.COLOR_ATTR_VALUE_RANGE_MAP')[row['extra']['attr']][row['extra']['color']-1]
    return (low+secrets.randbelow(high-low+1))/1000

def model(kind,extra=None):
    row=entity(kind);extra=extra or {};result={'kindId':kind,'count':1};typ=row['type']
    if kind==351:
        config=extra.get('privateBoxConfig')or {'kindName':'Private reward box','desc':'Private server reward: 1,000 coin.','imgId':351,'color':7,'dropListDesc':'101x1000'}
        required=('kindName','desc','imgId','color')
        if not isinstance(config,dict)or any(key not in config for key in required)or not (config.get('dropListDesc')or config.get('rdDropListDesc')):raise ValueError('Cấu hình rương riêng không hợp lệ')
        result.update({key:config[key]for key in ('kindName','desc','imgId','color','dropListDesc','rdDropListDesc','selectCount')if key in config})
    elif typ in ('artifact','fruit'):result.update(star=1,increaseTimes=0)
    elif typ=='ship':
        result.update(level=1,star=1,skillLevel=1,experience=0,nextLevelExp=next(r['shipExp']for r in table('experience')if r['level']==1))
        ship_attrs(result)
    elif typ=='capsule':result.update(skillInfo=capsule_skills(kind),cacheSkillInfo={})
    elif typ=='starSign':result.update(level=1,attrValue=star_growth(row))
    if 'star'in extra:
        if typ not in ('artifact','fruit','ship')or type(extra['star'])is not int or not 1<=extra['star']<=10:raise ValueError('Cấp sao vật phẩm không hợp lệ')
        result['star']=extra['star']
        if typ=='ship':ship_attrs(result)
    if 'expireTime'in extra:
        if type(extra['expireTime'])is not int or extra['expireTime']<=0:raise ValueError('Hạn dùng không hợp lệ')
        result['expireTime']=extra['expireTime']
    return result

def ship_attrs(item):
    row=entity(item['kindId']);value=(100*(item['star']-1)+item['level'])*row['growth'];attrs={'hp':0,'atk':0,'def':0,'mdef':0}
    for key in {1:('hp',),2:('atk',),3:('def','mdef')}[row['attrType']]:attrs[key]=value
    item['attr']=attrs
    item['power']=round(.1*attrs['hp']+attrs['atk']+attrs['def']+attrs['mdef']+30*item['skillLevel'])

def voucher_expiry(player,now=None):
    import datetime
    clock=datetime.datetime.fromtimestamp(time.time()if now is None else now,datetime.timezone(datetime.timedelta(hours=7)))
    minute=player.get('privateVoucherExpiryMinute',1439)
    end=clock.replace(hour=minute//60,minute=minute%60,second=59,microsecond=999000)
    if end<=clock:end+=datetime.timedelta(days=1)
    return int(end.timestamp()*1000)

def insert(player,kind,count,extra=None):
    row=entity(kind);bag=player['bag'];limit=row.get('maxNum',-1)
    if limit==1 and count>1000:raise ValueError('Quá nhiều vật phẩm riêng lẻ')
    extra=extra or {}
    if kind==1 and not extra.get('expireTime'):
        extra={**extra,'expireTime':voucher_expiry(player)}
    if kind==351 and 'id'in extra:
        config=player['shop'].get('randomBoxList',{}).get(str(extra['id']))
        if not config:raise ValueError('Mã cấu hình rương riêng không tồn tại')
        extra={**extra,'privateBoxConfig':config}
    box_fields=('kindName','desc','imgId','color','dropListDesc','rdDropListDesc','selectCount')
    box_model=model(kind,extra)if kind==351 else None
    while count:
        existing=next((item for item in bag['items'].values()if item['kindId']==kind and active(item) and item.get('expireTime')==extra.get('expireTime') and (box_model is None or all(item.get(k)==box_model.get(k)for k in box_fields)) and (limit<0 or item['count']<limit)),None)
        if existing:
            amount=count if limit<0 else min(count,limit-existing['count']);existing['count']+=amount;count-=amount
        else:
            item=model(kind,extra);amount=count if limit<0 else min(count,limit);item['count']=amount;count-=amount
            idx=max([bag['lastIdx']]+[int(key)for key in bag['items']])+1;bag['lastIdx']=idx;item['idx']=idx;bag['items'][str(idx)]=item

def bag_item(player,index,typ=None):
    if type(index)not in (str,int) or not str(index).isdigit():raise ValueError('Ô túi không hợp lệ')
    item=player['bag']['items'].get(str(int(index)))
    if not item or not active(item):raise ValueError('Vật phẩm không tồn tại hoặc đã hết hạn')
    if typ and entity(item['kindId'])['type']!=typ:raise ValueError('Sai loại vật phẩm')
    return item

def repair(player):
    """One-time repair of old generic stacks without replacing rolled attributes."""
    bag=player['bag']
    for key,item in list(bag['items'].items()):
        row=entity(item['kindId'])
        if row['type']not in ('artifact','fruit','ship','capsule','starSign')and item['kindId']!=351:continue
        defaults=model(item['kindId'])
        for field,value in defaults.items():item.setdefault(field,value)
        if row['type']=='ship':ship_attrs(item)
        if row['maxNum']==1 and item['count']>1:
            remaining=item['count']-1;item['count']=1;insert(player,item['kindId'],remaining,{'expireTime':item['expireTime']}if item.get('expireTime') else {})
