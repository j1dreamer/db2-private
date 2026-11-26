"""Private local reward claims. These do not attest third-party ad completion."""
import time,datetime
from .state import integer,snapshot,delta
from .rules import constants
from .adventure import grant
ROUTES={'logic.playerHandler.viewAd','logic.pointHandler.adReward'}

def day(now):return datetime.datetime.fromtimestamp(now/1000,datetime.timezone(datetime.timedelta(hours=7))).date().isoformat()

def consume_boost(player,kind):
    now=int(time.time()*1000);token=player.setdefault('privateLocalBoosts',{}).get(str(kind))
    if not token or token['day']!=day(now)or token['expires']<now:raise ValueError('Chưa nhận lượt hỗ trợ riêng hoặc lượt đã hết hạn')
    del player['privateLocalBoosts'][str(kind)]

def handle(store,account,route,args):
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        before=snapshot(p);temp={'privateLocalReward':True};now=int(time.time()*1000)
        if route.endswith('adReward'):
            consume_boost(p,constants('server.AD.CONSTS.TYPE.POINT'));temp['entityCountMap']=grant(p,[{'entityId':119,'count':1,'extra':{}}])
        else:
            kind=integer(args.get('type'),'Loại hỗ trợ',1,8);key=str(kind);caps=constants('server.AD.CONSTS.TYPE_TIMES_MAP');today=day(now)
            history=p.setdefault('adViewTimeMap',{}).setdefault(key,[]);history[:]=[value for value in history if day(value)==today]
            if len(history)>=caps[key]or kind==4 and history and now-history[-1]<21600000:raise ValueError('Chưa đến lượt hỗ trợ tiếp theo')
            pending=p.setdefault('privateLocalBoosts',{}).get(key)
            if pending and pending['day']==today and pending['expires']>=now:raise ValueError('Hãy sử dụng lượt hỗ trợ đã nhận trước')
            history.append(now);p['privateLocalBoosts'][key]={'day':today,'expires':now+3600000};temp['type']=kind
        store.save(p);store.audit('private_local_boost',{'player':p['id'],'route':route,'type':args.get('type')})
        return delta(before,p,route,temp)
