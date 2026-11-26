"""Source progression formulas and explicitly composed private-server stats."""
import json,math
from functools import lru_cache
from pathlib import Path
from .inventory import entity
from .profile import table
from .rules import constants

@lru_cache(None)
def rules():return json.loads((Path(__file__).resolve().parent.parent/'tables/derivedProgression.json').read_text())

def max_level(player,role):
    level=player['level']
    return level+5 if level<=10 else 20 if level<20 else level if level<=80 else rules()['maxLevels'][min(30,role['star']+min(10,role['awakeLevel']))]

def role_exp(player,role,amount):
    levels={r['level']:r['roleExp']for r in table('experience')};cap=max_level(player,role)
    role['experience']+=amount
    while role['level']<cap and role['experience']>=levels[role['level']]:
        role['experience']-=levels[role['level']];role['level']+=1
    role['nextLevelExp']=levels[role['level']]
    if role['level']>=cap:role['experience']=min(role['experience'],max(0,role['nextLevelExp']-1))

def needed_exp(player,role):
    values={r['level']:r['roleExp']for r in table('experience')}
    return sum(values[level]for level in range(role['level'],max_level(player,role)))-role['experience']

def effect_attrs(item):
    row=entity(item['kindId']);typ=row['type']
    if typ=='evolutionItem':
        effect=row['effect'];attrs={}
        for key in ('hp','atk','def','mdef','hit','crit','dodge'):
            init=effect.get('init'+key[0].upper()+key[1:],0);growth=effect.get(key+'Growth',0)
            if init or growth:attrs[key]=math.floor(init+growth*item['level'])
        item['attrs']=attrs;return attrs
    if typ=='stone':return dict(row['effect'])
    if typ in ('artifact','fruit'):return {key:row['starVals'][item['star']]for key in row['effect']}
    if typ=='capsule':
        result={key:value for key,value in row['extra'].items()if isinstance(value,(int,float))and key not in ('buildCount','composeId')}
        values=constants('server.CAPSULE.CONSTS.ATTR_VALUES_MAP')
        result.update({key:values[key][skill['level']-1]for key,skill in item['skillInfo'].items()})
        return result
    if typ=='starSign':return {row['extra']['attr']:item['attrValue']}
    return {}

def add_attrs(target,extra):
    for key,value in extra.items():
        if key in ('removeDeBuffSec','hitMaxHpRate') and value:target[key]=min(target.get(key,value),value)
        else:target[key]=target.get(key,0)+value

def recalculate(player,role):
    row=entity(role['kindId']);cfg=constants('server.ROLE.CONSTS');growth=cfg['STAR_GROWTH'][str(role['star'])]+cfg['AWAKE_GROWTH'][str(role['awakeLevel'])]
    attrs={key:math.floor(row[key])for key in ('hit','crit','dodge')}
    for key in ('hp','atk','def','mdef'):
        g=math.floor(row[key+'Growth']*growth);attrs[key+'Growth']=g;attrs[key]=math.floor(row['init'+key[0].upper()+key[1:]]+g*role['level'])
    role['initAttr']=dict(attrs)
    equipment_attrs={}
    for item in role['equipments'].values():
        if isinstance(item,dict)and item.get('kindId'):add_attrs(equipment_attrs,effect_attrs(item))
    role['equipmentsAttr']=equipment_attrs;add_attrs(attrs,equipment_attrs)
    signs=[role['equipments'].get('starSignItem_'+str(i))for i in range(1,5)]
    suit=None
    # Private suit activation policy where the server-only threshold is absent:
    # four of one attribute, minimum rarity 3 for weak / 5 for strong suit.
    if all(signs):
        rows=[entity(sign['kindId'])for sign in signs];names={r['extra']['attr']for r in rows};color=min(r['extra']['color']for r in rows)
        if len(names)==1 and color>=3:suit=constants('server.STAR_SIGN.CONSTS.ATTR_NAME_SUIT_SKILL_IDS_MAP')[rows[0]['extra']['attr']][int(color>=5)]
    role['equipments']['starSignSkillId']=suit
    add_attrs(attrs,player['team']['friendshipAttr']);add_attrs(attrs,player['team']['titleAttr'])
    add_attrs(attrs,player.get('guildSkill',{}).get('attr',{}))
    for typ,level in role['trainLevelMap'].items():
        for attr_id in cfg['TRAIN_ITEM_IDS_MAP'][typ][:level]:add_attrs(attrs,cfg['TRAIN_ATTR_ITEM_MAP'][str(attr_id)])
    soul_map=cfg['SOUL_TYPE_SP_ATTR_ITEM_MAP']if row['group']>=5 else cfg['SOUL_TYPE_ATTR_ITEM_MAP']
    for typ,level in role.get('soulLevelMap',{}).items():
        for key,values in soul_map[typ].items():add_attrs(attrs,{key:values[level]})
    # Same secondary break attributes returned by ROLE.FUNS.getBreakAttr.
    add_attrs(attrs,{'atkSpeedRate':.02*min(5,max(0,role['star']-5)),'unDeBuffRate':.02*min(5,max(0,role['star']-10)),'skipHitRate':.01*max(0,role['star']-15)})
    role['attr']=attrs
    power=sum(attrs.get(key,0)*factor for key,factor in rules()['powerFactors'].items()if key not in ('hitMaxHpRate','removeDeBuffSec'))
    if attrs.get('hitMaxHpRate'):power+=3000*(1-attrs['hitMaxHpRate'])
    if attrs.get('removeDeBuffSec'):power+=300*(20-attrs['removeDeBuffSec'])
    role['power']=math.floor(power+30*sum(s['level']for group in ('skills','awakeSkills')for s in role[group].values())+5000*len(role['evolveSkillIds']))
    player['power']=sum(r.get('power',0)for r in player['team']['roles'].values())

def learn_skills(role):
    row=entity(role['kindId']);unlock=constants('server.SKILL.CONSTS.UN_LOCK_COLOR')
    for color,index in unlock.items():
        if row['color']>=int(color):
            kind=row['skillIds'][index];role['skills'].setdefault(str(kind),{'kindId':kind,'level':1})
    awake_ids=constants('server.SKILL.CONSTS.UN_LOCK_AWAKE_SKILL_ID');maximums=constants('server.SKILL.CONSTS.UN_LOCK_AWAKE_SKILL_MAX_LEVEL')
    for level in range(1,role['awakeLevel']+1):
        kind=awake_ids[str(level)];role['awakeSkills'].setdefault(str(kind),{'kindId':kind,'level':1});role['awakeSkills'][str(kind)]['maxLevel']=maximums[str(level)]

def friendships(player):
    owned={entity(role['kindId'])['classId']:role for role in player['team']['roles'].values()};attrs={'hp':0,'atk':0,'def':0,'mdef':0}
    for row in table('friendship'):
        unlocked=player['friendshipUnlockMap'].get(str(row['kindId']),{})
        if all(class_id in owned and unlocked.get(str(class_id))for class_id in row['requiredClassIds']):
            key={1:'hp',2:'atk',3:'def',4:'mdef'}[row['type']];attrs[key]+=row['base']+row['starGrowth']*sum(owned[c]['star']-1 for c in row['requiredClassIds'])
    player['team']['friendshipAttr']=attrs
    for role in player['team']['roles'].values():recalculate(player,role)
