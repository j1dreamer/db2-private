"""Weighted shop stock, scheduled/paid refresh and atomic purchases."""
import datetime,secrets
from .profile import table
from .rules import constants
from .state import integer,snapshot,delta,consume
from .gameplay import choose,add_reward
ROUTES={'logic.shopHandler.buy','logic.shopHandler.refresh'}

def slot(kind,now=None):
    now=now or datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
    hours=constants('server.SHOP.CONSTS.REFRESH_HOURS_MAP')[str(kind)]
    available=[hour for hour in hours if hour<=now.hour]
    day=now.date() if available else now.date()-datetime.timedelta(days=1)
    return day.isoformat()+'_'+str(max(available)if available else max(hours))

def stock(player,kind):
    groups={}
    for row in table('shop'):
        if row['type']==kind and row['minLevel']<=player['level']<=row['maxLevel']:groups.setdefault(row['group'],[]).append(row)
    result={}
    for group,rows in groups.items():
        row=rows[0] if len(rows)==1 else choose(rows) if sum(r['weight'] for r in rows)>0 else secrets.choice(rows)
        # Long Chi Dao rows 140004/140005 ship minCount > maxCount.
        # Private fallback, disclosed in provenance: use the declared minimum.
        low=row['minCount'];high=max(low,row['maxCount'])
        amount=low+secrets.randbelow(high-low+1)
        result[str(row['kindId'])]={'entityId':row['entityId'],'moneyId':row['requireEntityId'],'count':amount,'price':row['price']*amount,'isSaleOut':False,'requireVip':row['requireVip'],'shopType':kind,'priority':row['priority'],'isUnlimit':bool(row['isUnlimit'])}
    return result

def initialize(player):
    shop=player['shop'];shop['goodsMap']={str(kind):stock(player,kind)for kind in range(1,15)}
    shop.setdefault('refreshTimesMap',{str(kind):0 for kind in range(1,15)})
    player['privateShopSlots']={str(kind):slot(kind)for kind in range(1,15)};player['privateShopStockVersion']=1

def refresh_due(player,now=None):
    if not player.get('privateShopStockVersion'):initialize(player);return True
    changed=False
    for kind in range(1,15):
        value=slot(kind,now);key=str(kind)
        if player['privateShopSlots'].get(key)!=value:
            player['shop']['goodsMap'][key]=stock(player,kind);player['privateShopSlots'][key]=value;changed=True
    return changed

def allowed(player,kind):
    unlock=constants('client.CONSTS.UNLOCK_LEVEL')
    required={9:unlock['WORSHIP_BATTLE'],12:unlock['ISLAND'],13:unlock['TOP_ARENA_3V3'],14:unlock['STAR_SIGN']}
    if player['level']<required.get(kind,unlock['SHOP']):raise ValueError('Cửa hàng chưa mở ở cấp hiện tại')

def refresh(store,account,args):
    kind=integer(args.get('type'),'Cửa hàng',1,14)
    with store.transaction():
        p=store.player(account);before=snapshot(p);allowed(p,kind);key=str(kind)
        costs=constants('server.SHOP.CONSTS.REFRESH_COST_MONEY_MAP').get(key,[0,50,100,100,200])
        currency=constants('server.SHOP.CONSTS.REFRESH_MONEY_ID_MAP').get(key,102)
        count=p['shop']['refreshTimesMap'].get(key,0)
        consume(p,currency,costs[min(count+1,len(costs)-1)])
        p['shop']['goodsMap'][key]=stock(p,kind);p['shop']['refreshTimesMap'][key]=count+1;p['privateShopSlots'][key]=slot(kind)
        store.save(p);store.audit('refresh_shop',{'player':p['id'],'type':kind})
        return delta(before,p,'logic.shopHandler.refresh')

def buy(store,account,args):
    kind=args.get('kindId')
    if type(kind)not in (int,str) or not str(kind).isdigit():raise ValueError('Hàng hóa không hợp lệ')
    key=str(int(kind))
    with store.transaction():
        p=store.player(account);before=snapshot(p)
        matches=[(typ,goods[key]) for typ,goods in p['shop']['goodsMap'].items() if key in goods]
        if len(matches)!=1:raise ValueError('Hàng hóa không còn trong cửa hàng')
        typ,item=matches[0];allowed(p,int(typ))
        if item['isSaleOut']:raise ValueError('Hàng hóa đã bán hết')
        if p['vip']['level']<item['requireVip']:raise ValueError('Chưa đủ VIP để mua')
        consume(p,item['moneyId'],item['price'])
        rewards=add_reward(p,{'entityId':item['entityId'],'count':item['count'],'extra':{}})
        if not item.get('isUnlimit'):item['isSaleOut']=True
        store.save(p);store.audit('buy_shop',{'player':p['id'],'shop':int(typ),'id':key,'count':item['count']})
        return delta(before,p,'logic.shopHandler.buy',{'entityCountMap':rewards})

def handle(store,account,route,args):
    if not store.player(account):raise ValueError('Chưa có nhân vật')
    return (buy if route.endswith('.buy') else refresh)(store,account,args)
