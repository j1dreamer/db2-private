"""Explicit private gem/voucher offers and source-compatible exchange catalogs.

These are in-game exchanges. They do not confirm payments or raise topUpMoney.
All prices, limits and offers in this module are documented private rules.
"""
import copy,datetime,time
from .state import integer,snapshot,delta,consume,stack_count
from .adventure import grant
from .item_actions import description
ROUTES={'logic.playerHandler.'+a for a in ('topUpGoodsList','buyGemGoods','costTopUpPoint','costTopUpPoint2','exchangeBuy','exchange2Buy','exchange4Buy','spWishExchangeBuy','exchange')}
GOODS={
 1:{'name':'Vé thường ×1','cost':300,'point':3,'rewards':'119x1,2x1','limit':1},
 2:{'name':'Vé cao cấp ×1','cost':600,'point':6,'rewards':'120x1,2x1','limit':1},
 3:{'name':'Nước luyện tập ×20','cost':200,'point':2,'rewards':'20001x20','limit':5},
 4:{'name':'Vé vòng quay ×1','cost':100,'point':1,'rewards':'88x1','limit':8},
 5:{'name':'Xúc xắc thường ×1','cost':50,'point':1,'rewards':'94x1','limit':20},
 6:{'name':'Xúc xắc vàng ×1','cost':100,'point':2,'rewards':'95x1','limit':5},
}
EXCHANGES={
 'exchange':{'moneyId':113,'list':[{'id':1,'entityId':20001,'count':5,'price':1,'maxBuyTimes':10,'extra':{}}]},
 'exchange2':{'list':[{'id':1,'getDesc':'120x1','needDesc':'119x5','maxBuyTimes':1}]},
 'exchange4':{'moneyId':105,'list':[{'id':1,'entityId':23001,'count':10,'price':100,'maxBuyTimes':5,'extra':{}}]},
 'spWishExchange':{'moneyId':116,'list':[{'id':1,'entityId':120,'count':1,'price':100,'maxBuyTimes':3,'extra':{}}]},
 'privateGuild':{'moneyId':107,'exchangeId':1,'name':'Vật phẩm bang','isDreamExchange':True,'priority':10,'list':[{'id':1,'entityId':21001,'count':5,'price':100,'maxBuyTimes':5,'extra':{}}]},
}

def stamp_bounds():
    now=datetime.datetime.fromtimestamp(time.time(),datetime.timezone(datetime.timedelta(hours=7)));start=now.replace(hour=0,minute=0,second=0,microsecond=0);return int(start.timestamp()*1000),int((start+datetime.timedelta(days=1)).timestamp()*1000)

def catalog(p):
    counters=p.get('privateCommerce',{}).get('counts',{});result={}
    for ident,offer in GOODS.items():
        used=counters.get('goods:'+str(ident),0);result[str(ident)]={'id':ident,'name':offer['name'],'price':offer['cost'],'privateCostGem':offer['cost'],'needPoint':offer['point'],'imgId':ident,'show':'$1 Gem','gem':0,'gift':0,'firstGiftRate':0,'isFirstDouble':False,'priceRate':1,'isRecommend':False,'isMonthCard':False,'isBigMonthCard':False,'isYearCard':False,'isWeekCard':False,'dailyGem':0,'point':False,'desc':'Đổi bằng gem/phiếu trong game. Còn lại hôm nay: '+str(max(0,offer['limit']-used))}
    return result

def refresh(p):
    import json
    before=json.dumps(p,sort_keys=True);private=p.setdefault('privateCommerce',{})
    today=p.get('privateDay')or datetime.datetime.fromtimestamp(time.time(),datetime.timezone(datetime.timedelta(hours=7))).date().isoformat()
    if private.get('day')!=today:private.update(day=today,counts={})
    p.setdefault('buyGoodsTimesMap',{});p['extra']['goodsList']=catalog(p);start,end=stamp_bounds()
    for name,config in EXCHANGES.items():
        value=copy.deepcopy(config);value.update(start_time=start,end_time=end)
        value.setdefault('name',name);value.setdefault('desc','Vật phẩm đổi trong server riêng');value.setdefault('resId',126);value.setdefault('priority',300)
        for row in value['list']:row['buyTimes']=private['counts'].get(name+':'+str(row['id']),0)
        if name=='privateGuild':p['activity'].setdefault('exchangeMap',{})['1']=value
        else:p['activity'][name]=value
    # Legacy daily vouchers get their first server expiry at the next midnight.
    for item in p['bag']['items'].values():
        if item['kindId']==1 and not item.get('expireTime'):item['expireTime']=end-1
    p['topUpPoint']=stack_count(p,1)+stack_count(p,2)
    return before!=json.dumps(p,sort_keys=True)

def purchase(p,action,args):
    ident=integer(args.get('id')if action=='buyGemGoods'else args.get('goodsId'),'Mã gói',1);offer=GOODS.get(ident)
    if not offer:raise ValueError('Gói riêng không tồn tại')
    key='goods:'+str(ident);used=p['privateCommerce']['counts'].get(key,0)
    if used>=offer['limit']:raise ValueError('Gói đã hết lượt trong ngày')
    if action=='buyGemGoods':
        if integer(args.get('costGem'),'Giá gem',1)!=offer['cost']:raise ValueError('Giá gem không khớp catalog server')
        consume(p,102,offer['cost'])
    else:
        currencies=(1,)if action=='costTopUpPoint2'else (1,2);required=offer['point']
        if sum(stack_count(p,kind)for kind in currencies)<required:raise ValueError('Không đủ phiếu riêng còn hạn')
        for kind in currencies:
            n=min(required,stack_count(p,kind));consume(p,kind,n);required-=n
    rewards=grant(p,description(offer['rewards']));p['privateCommerce']['counts'][key]=used+1;p['buyGoodsTimesMap'][str(ident)]=p['buyGoodsTimesMap'].get(str(ident),0)+1
    return rewards

def exchange(p,action,args):
    if action=='exchange':
        if integer(args.get('exchangeId'),'Nhóm đổi',1)!=1:raise ValueError('Nhóm đổi không tồn tại')
        name='privateGuild'
    else:name={'exchangeBuy':'exchange','exchange2Buy':'exchange2','exchange4Buy':'exchange4','spWishExchangeBuy':'spWishExchange'}[action]
    config=EXCHANGES[name];ident=integer(args.get('id'),'Mã vật phẩm đổi',1);row=next((r for r in config['list']if r['id']==ident),None)
    if not row:raise ValueError('Vật phẩm đổi không tồn tại')
    if name=='privateGuild'and not p.get('guildId'):raise ValueError('Đổi vật phẩm bang cần gia nhập bang')
    key=name+':'+str(ident);used=p['privateCommerce']['counts'].get(key,0)
    if used>=row['maxBuyTimes']:raise ValueError('Đã hết lượt đổi hôm nay')
    if name=='exchange2':
        for cost in description(row['needDesc']):consume(p,cost['entityId'],cost['count'])
        rewards=description(row['getDesc'])
    else:consume(p,config['moneyId'],row['price']);rewards=[{'entityId':row['entityId'],'count':row['count'],'extra':row['extra']}]
    result=grant(p,rewards);p['privateCommerce']['counts'][key]=used+1;return result

def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Đổi vật phẩm không tồn tại')
    action=route.rsplit('.',1)[-1]
    with store.transaction():
        p=store.player(account);before=snapshot(p);temp={'privateLocalPurchase':True}
        if action in ('buyGemGoods','costTopUpPoint','costTopUpPoint2'):temp['entityCountMap']=purchase(p,action,args)
        elif action!='topUpGoodsList':temp['entityCountMap']=exchange(p,action,args)
        refresh(p)
        from .activities import refresh as refresh_activities
        refresh_activities(store,p);store.save(p)
        if action!='topUpGoodsList':store.audit('private_exchange',{'player':p['id'],'route':route,'id':args.get('id',args.get('goodsId'))})
        result=delta(before,p,route,temp);result['extra']={**result.get('extra',{}),'goodsList':p['extra']['goodsList']};return result
