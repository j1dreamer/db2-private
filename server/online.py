"""Count authenticated play time against the server's selected-session clock."""
import time
from .state import integer,snapshot,delta
ROUTES={'logic.playerHandler.incOnlineTime'}
def handle(store,account,route,args):
    seconds=integer(args.get('seconds'),'Số giây',1,60);now=int(time.time()*1000)
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        before=snapshot(p);last=p.get('privateOnlineClock')
        if not last or now-last+250<seconds*1000:raise ValueError('Chưa đủ thời gian online')
        p['privateOnlineClock']=max(last+seconds*1000,now-60000);p['privateOnlineSeconds']=p.get('privateOnlineSeconds',0)+seconds
        activity=p['activity']['map'].get('online_reward')
        if activity:
            reach=activity.setdefault('reachMap',{});reach['onlineSeconds']=reach.get('onlineSeconds',0)+seconds
            for reward in activity.get('rewards',[]):
                if reward.get('status')==1 and reach['onlineSeconds']>=reward.get('needMap',{}).get('onlineSeconds',10**9):reward['status']=2
        store.save(p);store.audit('online_time',{'player':p['id'],'seconds':seconds})
        return delta(before,p,route)
