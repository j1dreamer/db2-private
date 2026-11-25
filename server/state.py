"""Durable state helpers shared by RPC services; server day is UTC+7."""
import copy,datetime,time
from .profile import table

def integer(value,label,low=0,high=10**9):
    if type(value)is not int or not low<=value<=high:raise ValueError(label+' không hợp lệ')
    return value

def vip_data(player):
    return next(r for r in table('vip') if r['level']==player['vip']['level'])

def stack_count(player,kind):
    from .inventory import active
    return sum(x['count'] for x in player['bag']['items'].values() if x['kindId']==kind and active(x))

def consume(player,kind,count):
    from .inventory import active
    integer(count,'Số lượng',0)
    if count==0:return
    if kind in (101,102):
        key='coin' if kind==101 else 'gem'
        if player[key]<count:raise ValueError('Không đủ '+key)
        player[key]-=count
        if kind==102:player['costGem']+=count
        return
    if stack_count(player,kind)<count:raise ValueError('Không đủ vật phẩm')
    remaining=count
    for key in list(player['bag']['items']):
        item=player['bag']['items'][key]
        if item['kindId']!=kind or not active(item):continue
        n=min(remaining,item['count']);item['count']-=n;remaining-=n
        if not item['count']:del player['bag']['items'][key]
        if not remaining:return

def nested(root,*keys):
    for key in keys:root=root.setdefault(str(key),{})
    return root

def snapshot(player):return copy.deepcopy(player)

def delta(before,after,route,temp=None):
    result={'code':200,'_temp':{'route':route,**(temp or {})}}
    for key in after:
        if key=='bag':
            old=before['bag']['items'];new=after['bag']['items']
            diff={k:new.get(k) for k in old.keys()|new.keys() if old.get(k)!=new.get(k)}
            if diff or before['bag']['lastIdx']!=after['bag']['lastIdx']:
                result['bag']={'items':diff,'lastIdx':after['bag']['lastIdx']}
        elif key=='team':
            old=before['team']['roles'];new=after['team']['roles']
            roles={k:new.get(k) for k in old.keys()|new.keys() if old.get(k)!=new.get(k)}
            extras={key:after['team'][key]for key in ('friendshipAttr','titleAttr')if before['team'].get(key)!=after['team'].get(key)}
            if roles or extras:result['team']={'roles':roles,**extras}
        elif after[key]!=before.get(key):
            if isinstance(after[key],dict) and isinstance(before.get(key),dict):
                old=before[key];new=after[key]
                result[key]={k:new.get(k) for k in old.keys()|new.keys() if old.get(k)!=new.get(k)}
                # These four client models merge one extra level. Missing map
                # entries require explicit tombstones rather than omission.
                if key in ('vip','shop','task','activity'):
                    for field in result[key]:
                        if isinstance(old.get(field),dict) and isinstance(new.get(field),dict):
                            result[key][field]={k:new[field].get(k) for k in old[field].keys()|new[field].keys() if old[field].get(k)!=new[field].get(k)}
            else:result[key]=after[key]
    return result

DAILY_COUNTERS=('buyActionPointTimes','buySkillPointTimes','buyCoinTimes','buyMapType5Times','shipUpgradeLevelTimes','buyChallengeTimesTimes')
def refresh_time(player,now=None):
    now=int(time.time()*1000) if now is None else now;changed=False
    today=datetime.datetime.fromtimestamp(now/1000,datetime.timezone(datetime.timedelta(hours=7))).date().isoformat()
    prior=player.get('privateDay')
    if prior!=today:
        player['privateDay']=today;changed=True
        if prior:
            for key in DAILY_COUNTERS:player['vip'][key]=0
            player['vip']['resetSmapTimesTimesMap']={}
            player['shop']['refreshTimesMap']={str(kind):0 for kind in range(1,15)}
            player['friend']['pointReceiveTimes']=0
            player['smapTimesMap']={};player['point']['dailyNormalUseGemTimes']=0
            player['task']['dailyActivePoint']=0;player['task']['receivedPointMap']['daily']={}
            player['arena']['remainingChallengeTimes']=5;player['arena']['maxChallengeTimes']=5
            player['adViewTimeMap']={};player['privateLocalBoosts']={}
    week=datetime.date.fromisoformat(today).isocalendar()[:2];week_key=str(week[0])+'-'+str(week[1])
    if player.get('privateTaskWeek')!=week_key:
        if player.get('privateTaskWeek'):
            player['task']['weeklyActivePoint']=0;player['task']['receivedPointMap']['weekly']={}
        player['privateTaskWeek']=week_key;changed=True
    for key in ('actionPoint','skillPoint'):
        maximum=player['timesMaxMap'][key];next_time=player['nextRecoverTimeMap'].get(key,0)
        if player[key]>=maximum:
            if next_time:player['nextRecoverTimeMap'][key]=0;changed=True
        elif not next_time:
            player['nextRecoverTimeMap'][key]=now+300000;changed=True
        elif now>=next_time:
            amount=1+(now-next_time)//300000
            player[key]=min(maximum,player[key]+amount)
            player['nextRecoverTimeMap'][key]=0 if player[key]>=maximum else next_time+amount*300000
            changed=True
    return changed
