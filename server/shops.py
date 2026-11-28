"""Weighted shop stock, scheduled/paid refresh and atomic purchases."""
import datetime,secrets
from .profile import table
from .rules import constants
from .state import integer,snapshot,delta,consume
from .gameplay import choose,add_reward
ROUTES={'logic.shopHandler.buy','logic.shopHandler.refresh'}

def slot(kind,now=None,store=None):
    now=now or datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
    from .economy import shop_settings
    hours=shop_settings(store,kind)['hours']
    available=[hour for hour in hours if hour<=now.hour]
    day=now.date() if available else now.date()-datetime.timedelta(days=1)
    return day.isoformat()+'_'+str(max(available)if available else max(hours))

def stock(player,kind,store=None):
    groups={}
    from .economy import shop_rows
    for row in shop_rows(store,kind):
        if row['type']==kind and row['minLevel']<=player['level']<=row['maxLevel']:groups.setdefault(row['group'],[]).append(row)
    result={}
    for group,rows in groups.items():
        row=rows[0] if len(rows)==1 else choose(rows) if sum(r['weight'] for r in rows)>0 else secrets.choice(rows)
        # Long Chi Dao rows 140004/140005 ship minCount > maxCount.
        # Private fallback, disclosed in provenance: use the declared minimum.
        low=row['minCount'];high=max(low,row['maxCount'])
        amount=low+secrets.randbelow(high-low+1)
        result[str(row['kindId'])]={'entityId':row['entityId'],'moneyId':row['requireEntityId'],'count':amount,'price':row['price']*amount,'isSaleOut':False,'requireVip':row['requireVip'],'shopType':kind,'priority':row['priority'],'isUnlimit':bool(row['isUnlimit']),'privateGroup':row['group']}
    return result

def initialize(player):
    shop=player['shop'];shop['goodsMap']={str(kind):stock(player,kind)for kind in range(1,15)}
    shop.setdefault('refreshTimesMap',{str(kind):0 for kind in range(1,15)})
    player['privateShopSlots']={str(kind):slot(kind)for kind in range(1,15)};player['privateShopStockVersion']=1

def refresh_due(player,now=None,store=None):
    initialized=not player.get('privateShopStockVersion')
    if initialized:initialize(player)
    from .economy import shop_stamp
    changed=initialized;stamps=player.setdefault('privateShopConfigStamps',{})
    for kind in range(1,15):
        value=slot(kind,now,store);key=str(kind);stamp=shop_stamp(store,kind)
        if player['privateShopSlots'].get(key)!=value or stamps.get(key)!=stamp:
            same_slot=player['privateShopSlots'].get(key)==value
            source_groups={str(r['kindId']):r['group']for r in table('shop')if r['type']==kind}
            bought={r.get('privateGroup',source_groups.get(ident))for ident,r in player['shop']['goodsMap'].get(key,{}).items()if r.get('isSaleOut')}if same_slot else set()
            fresh=stock(player,kind,store)
            for ident,row in fresh.items():
                prior=player['shop']['goodsMap'].get(key,{}).get(ident,{})
                if same_slot and (prior.get('isSaleOut')or row.get('privateGroup')in bought):row['isSaleOut']=True
            player['shop']['goodsMap'][key]=fresh;player['privateShopSlots'][key]=value;stamps[key]=stamp;changed=True
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
        p['shop']['goodsMap'][key]=stock(p,kind,store);p['shop']['refreshTimesMap'][key]=count+1;p['privateShopSlots'][key]=slot(kind,store=store)
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
