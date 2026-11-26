"""Initial profile inferred from client constructors and shipped data tables.
This is a compatibility draft; entering every original UI has not been verified.
"""
import json,time,datetime,math
from functools import lru_cache
from pathlib import Path
SCHEMA_VERSION=29
TABLES=Path(__file__).resolve().parent.parent/'tables'
@lru_cache(None)
def table(name):
    rows=json.loads((TABLES/(name+'Data.json')).read_text());return [dict(zip(rows[0],r)) for r in rows[1:]]
def character(kind_id,idx,star=1):
    role=next(r for r in table('role') if r['kindId']==kind_id)
    exp=next(r for r in table('experience') if r['level']==1)
    growth=1+.25*(star-1)  # serverConfig.ROLE.CONSTS.STAR_GROWTH
    attrs={key:math.floor(role[field]+math.floor(role[growth_field]*growth)) for key,field,growth_field in [('hp','initHp','hpGrowth'),('atk','initAtk','atkGrowth'),('def','initDef','defGrowth'),('mdef','initMdef','mdefGrowth')]}
    attrs.update({key:math.floor(role[key]) for key in ('hit','crit','dodge')})
    attrs.update({key:math.floor(role[key]*growth) for key in ('hpGrowth','atkGrowth','defGrowth','mdefGrowth')})
    equipment={f'evlItem_{i+1}':{'kindId':kind,'level':1} for i,kind in enumerate(role['initEvlItemIds'])}
    return {'idx':idx,'kindId':kind_id,'level':1,'star':star,'experience':0,'nextLevelExp':exp['roleExp'],'attr':attrs,'initAttr':dict(attrs),'skills':{str(role['skillIds'][0]):{'kindId':role['skillIds'][0],'level':1}},'awakeSkills':{},'awakeLevel':0,'awakeRateIncreaseTimes':0,'evolveSkillRateIncreaseTimes':0,'evolveSkillIds':[],'trainLevelMap':{},'trainUnlockMap':{},'soulLevelMap':{str(i):0 for i in range(1,10)},'skillLevels':{},'equipments':equipment,'power':0}
def new_profile(pid,account,name,username):
    from .gameplay import point_default
    now=int(time.time()*1000)
    exp=next(r for r in table('experience') if r['level']==1)
    initial=character(100101,1)
    profile={'id':pid,'userId':account,'userName':username,'name':name,'serverId':1,'oldServerId':1,'level':1,'gem':50,'coin':0,'experience':0,'nextLevelExp':exp['playerExp'],'ctime':now,'upgradeTime':now,'power':0,'costGem':0,'signInDays':0,'signInTime':0,'guildId':0,'guildName':'','actionPoint':60,'skillPoint':10,'timesMaxMap':{'actionPoint':61,'skillPoint':10},'nextRecoverTimeMap':{'actionPoint':0,'skillPoint':0},'bag':{'lastIdx':0,'items':{}},'team':{'roles':{'1':initial},'friendshipAttr':{'hp':0,'atk':0,'def':0,'mdef':0},'titleAttr':{}},'vip':{'level':0,'topUpMoney':0,'topUpGem':0,'buyActionPointTimes':0,'buySkillPointTimes':0,'buyCoinTimes':0,'resetSmapTimesTimesMap':{},'buyMapType5Times':0},'shop':{'hideRoleClassIds':[],'hideShipClassIds':[],'refreshTimesMap':{str(i):0 for i in range(1,15)},'goodsMap':{str(i):({'1':{'entityId':20001,'moneyId':101,'count':1,'price':100,'isSaleOut':True,'requireVip':0,'shopType':1,'priority':1},'2':{'entityId':20002,'moneyId':101,'count':1,'price':100,'isSaleOut':True,'requireVip':0,'shopType':1,'priority':2}} if i==1 else {}) for i in range(1,15)}},'task':{'daily':{},'dailyActivePoint':0,'weeklyActivePoint':0,'receivedPointMap':{'daily':{},'weekly':{}},'main':{'1':{'taskId':0,'show':{},'isComplete':False}}},'endless':{'fruitMapPowerUp':0,'pursuitTeamMap':{},'fruitMapUseRolesNo':1,'starSignMapUseRolesNo':1},'smapStarMap':{'1':{'101':{}}},'smapTimesMap':{},'bmapBoxReceivedMap':{},'friendshipUnlockMap':{},'frameIds':[],'titleInfoMap':{},'chatSkinIds':[0],'isHideEqpt':False,'photoInfo':{'photoImgId':1001,'shipImgId':901},'arena':{'rank':0,'challengeCD':0,'remainingChallengeTimes':5},'arena3v3':{'rank':0,'challengeCD':0,'remainingChallengeTimes':5},'friend':{'list':[],'infoMap':{},'point':0,'count':0,'pointReceiveTimes':0},'activity':{'map':{},'scorePointInfoMap':{}},'extra':{'mails':[],'serverTime':now,'serverTimeStr':datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),'openDays':1,'goodsList':{},'chat':{'worldList':[],'guildList':[],'allServerList':[]}},'point':point_default(),'profileSchemaVersion':SCHEMA_VERSION,'privateCompatibilityDraft':True}
    profile['vip']['topUpGem']=0;profile['honourPoint']=0;profile['honourReceivedMap']={}
    profile['adViewTimeMap']={};profile['privateLocalBoosts']={}
    for key in ('buyChallengeTimesTimes','buy3v3ChallengeTimesTimes','worshipStatue3v3Times','tailChallengeTimesTimes'):profile['vip'][key]=0
    from .guild import empty
    profile['guild']=empty();profile['guildLevel']=0;profile['guildSkill']={'levelMap':{key:0 for key in ('HP','ATK','DEF','MDEF')},'attr':{'hp':0,'atk':0,'def':0,'mdef':0}}
    for key in ('guildBattle','newGuildBattle','guildBoss'):profile['extra'][key]={'openInfo':{'isOpen':False,'openTime':now+86400000}}
    for key in ('worldBoss','guildBoss'):profile['extra'][key]={'openInfo':{'isOpen':False,'openTime':now+86400000,'attackTimes':0,'attackTeamIndexs':[],'attackShipIndexs':[],'upPower':1},'playerInfoMap':{}}
    profile['practice']={'remainingDefenseTimes':6,'remainingChallengeTimes':6,'sixRemainingDefenseTimes':1,'sixRemainingChallengeTimes':2,'usedTeamIndexs':[],'usedShipIndexs':[],'allDefenseTeamIndexs':[],'allDefenseShipIndexs':[]}
    profile['eye']={'type':'','startTime':0,'remainingChallengeTimes':2,'list':[{'rank':rank,'playerId':0,'eyeDuration':0}for rank in range(1,12)]}
    profile['vip']['buyEyeChallengeTimesTimes']=0
    profile['vip']['endlessSkipTimes']=0
    profile['endless'].update(topPassId=0,otherTopPassIdMap={},fruitMapChallengeTimes=0,fruitMapBuyTimes=0,starSignMapChallengeTimes=0,setPursuitTeamTimesMap={},fruitMapPassTimesMap={},starSignMapPassTimesMap={})
    profile['expedition']={name:value for name,value in [('passId',0),('prePassId',0),('sixPassId',0),('preSixPassId',0),('status',1),('sixStatus',1),('selfInfo',{'hpMap':{},'mpMap':{}}),('sixSelfInfo',{'hpMap':{},'mpMap':{}}),('sixPlayerInfos',[])]}
    profile['vip'].update(resetExpeditionTimes=0,resetSixExpeditionTimes=0)
    from .arena import npc,raw_team
    preview=raw_team(npc(1))
    profile['expedition']['challengerInfo']={'team':preview}
    profile['expedition']['sixChallengerInfo']={'team':json.loads(json.dumps(preview))}
    from .commerce import refresh as refresh_commerce
    profile['buyGoodsTimesMap']={};profile['topUpPoint']=0;refresh_commerce(profile)
    from .activities import refresh as refresh_activities
    refresh_activities(None,profile)
    from .tournaments import refresh as refresh_tournaments
    refresh_tournaments(None,profile)
    from .top_arena import refresh as refresh_top
    refresh_top(profile)
    from .resources import refresh as refresh_resources
    refresh_resources(None,profile)
    from .guild_wars import refresh as refresh_wars
    refresh_wars(None,profile)
    from .island import refresh as refresh_island
    refresh_island(None,profile)
    from .cooperative import refresh as refresh_cooperative
    refresh_cooperative(None,profile)
    from .time_peak import refresh as refresh_time_peak
    refresh_time_peak(profile)
    grant_starter_tickets(profile)
    from .shops import initialize
    initialize(profile)
    from .progression import learn_skills,friendships
    learn_skills(initial);friendships(profile)
    profile['privateRulesBaseline']='longzhidao-17327'
    return profile

def grant_starter_tickets(profile):
    if profile.get('privateStarterTicketsGranted'):return
    bag=profile['bag'];items=bag['items']
    for kind in (119,120):
        existing=next((item for item in items.values() if item['kindId']==kind),None)
        if existing:existing['count']+=1
        else:
            idx=max([bag.get('lastIdx',0)]+[int(key) for key in items])+1
            bag['lastIdx']=idx;items[str(idx)]={'idx':idx,'kindId':kind,'count':1}
    profile['privateStarterTicketsGranted']=True

def upgrade_profile(data,account):
    """Add missing fields from older development schemas without resetting balances."""
    if data.get('profileSchemaVersion',0)>=SCHEMA_VERSION:return False
    base=new_profile(data['id'],account,data.get('name','Player'),data.get('userName',''))
    # A template must not overwrite bag slots or mark an old player as gifted.
    base['bag']={'lastIdx':0,'items':{}}
    base.pop('privateStarterTicketsGranted',None)
    base['shop']['goodsMap']={str(kind):{}for kind in range(1,15)}
    base.pop('privateShopSlots',None);base.pop('privateShopStockVersion',None)
    # Recovered PLAYER.FUNS.getActionPointMax(level) = 60 + level.
    base['timesMaxMap']['actionPoint']=60+data.get('level',1)
    def fill(target,defaults):
        for key,value in defaults.items():
            if key not in target:
                target[key]=json.loads(json.dumps(value))
            elif isinstance(value,dict) and isinstance(target[key],dict):
                # Existing rosters must never gain the template's starter role.
                if key!='roles':fill(target[key],value)
    fill(data,base)
    for role in data.get('team',{}).get('roles',{}).values():
        try:
            template=character(role['kindId'],role['idx'],role.get('star',1))
            fill(role,template)
            if not role.get('skills'):role['skills']=template['skills']
            for key in ('skills','awakeSkills'):
                if isinstance(role.get(key),list):role[key]={str(item['kindId']):item for item in role[key]}
        except (KeyError,StopIteration):continue
    grant_starter_tickets(data)
    if not data.get('privateShopStockVersion'):
        from .shops import initialize
        initialize(data)
    from .inventory import repair
    repair(data)
    # Private migration policy: keep inventory/currencies/manual VIP grants;
    # re-derive combat stats once using the selected Long Chi Dao rules.
    from .progression import recalculate,learn_skills
    for role in data.get('team',{}).get('roles',{}).values():
        learn_skills(role);recalculate(data,role)
    data['privateRulesBaseline']='longzhidao-17327'
    data['profileSchemaVersion']=SCHEMA_VERSION
    return True
