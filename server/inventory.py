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
    if typ in ('artifact','fruit'):result.update(star=1,increaseTimes=0)
    elif typ=='ship':
        result.update(level=1,star=1,skillLevel=1,experience=0,nextLevelExp=next(r['shipExp']for r in table('experience')if r['level']==1))
    elif typ=='capsule':result.update(skillInfo=capsule_skills(kind),cacheSkillInfo={})
    elif typ=='starSign':result.update(level=1,attrValue=star_growth(row))
    if 'expireTime'in extra:
        if type(extra['expireTime'])is not int or extra['expireTime']<=0:raise ValueError('Hạn dùng không hợp lệ')
        result['expireTime']=extra['expireTime']
    return result

def insert(player,kind,count,extra=None):
    row=entity(kind);bag=player['bag'];limit=row.get('maxNum',-1)
    if limit==1 and count>1000:raise ValueError('Quá nhiều vật phẩm riêng lẻ')
    extra=extra or {}
    while count:
        existing=next((item for item in bag['items'].values()if item['kindId']==kind and active(item) and item.get('expireTime')==extra.get('expireTime') and (limit<0 or item['count']<limit)),None)
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
        if row['type']not in ('artifact','fruit','ship','capsule','starSign'):continue
        defaults=model(item['kindId'])
        for field,value in defaults.items():item.setdefault(field,value)
        if row['maxNum']==1 and item['count']>1:
            remaining=item['count']-1;item['count']=1;insert(player,item['kindId'],remaining,{'expireTime':item['expireTime']}if item.get('expireTime') else {})
