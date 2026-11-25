"""Private-server economy; shipped drop tables are inputs, not original server code."""
import json,secrets,time
from functools import lru_cache
from .profile import table

@lru_cache(None)
def rows(name):return table(name)

def choose(entries):
    total=sum(max(0,int(r['weight'])) for r in entries)
    if total<=0:raise ValueError('Pool không có trọng số hợp lệ')
    n=secrets.randbelow(total)
    for r in entries:
        n-=max(0,int(r['weight']))
        if n<0:return r
    raise ValueError('Pool không hợp lệ')

def drops(class_id,depth=0):
    if depth>12:raise ValueError('Drop reference cycle')
    groups={}
    for row in rows('drop'):
        if row['classId']==class_id:groups.setdefault(row['groupId'],[]).append(row)
    if not groups:raise ValueError('Pool không tồn tại')
    result=[]
    for entries in groups.values():
        row=choose(entries)
        # The recovered table contains zero-quantity leaves/references. They
        # represent no reward under our documented private-server drop policy.
        if row['count']==0:continue
        if row['count']<0:raise ValueError('Negative drop quantity')
        if row['refClassId']:
            for child in drops(row['refClassId'],depth+1):
                child=dict(child);child['count']*=row['count'];result.append(child)
        elif row['entityId']:
            result.append({'entityId':row['entityId'],'count':row['count'],'extra':row['extra'] if isinstance(row['extra'],dict) else {}})
    return result

def add_reward(player,reward):
    entity=int(reward['entityId']);count=int(reward['count'])
    if count<1:raise ValueError('Invalid reward count')
    if entity==100:
        from .adventure import add_experience
        add_experience(player,count);return {str(entity):count}
    if entity==99:player['actionPoint']+=count;return {str(entity):count}
    if entity==98:
        vip=player['vip'];vip['topUpGem']=vip.get('topUpGem',0)+count;levels={r['level']:r for r in rows('vip')}
        while vip['level']<max(levels) and vip['topUpGem']>=levels[vip['level']]['nextLevelTopUpGem']:vip['level']+=1
        player['timesMaxMap']['skillPoint']=5+levels[vip['level']]['increaseSkillPointMax']
        return {str(entity):count}
    if entity==102:player['gem']+=count;return {str(entity):count}
    if entity==101:player['coin']+=count;return {str(entity):count}
    role=next((r for r in rows('role') if r['kindId']==entity),None)
    if role:
        if count!=1:raise ValueError('Multiple role reward not supported')
        owned=next((r for r in player['team']['roles'].values() if next(x['classId']for x in rows('role')if x['kindId']==r['kindId'])==role['classId']),None)
        if owned:
            soul=next(r for r in rows('soul') if r['classId']==role['classId'])
            from .rules import constants
            equivalents=constants('server.ROLE.CONSTS.EQUIVALENT_SOULS');star=int(reward.get('extra',{}).get('star',1))
            quantity=equivalents[star] if 0<=star<len(equivalents) else 0
            return add_reward(player,{'entityId':soul['kindId'],'count':quantity,'extra':{}}) if quantity else {}
        from .profile import character
        idx=max([int(k) for k in player['team']['roles']]+[0])+1
        player['team']['roles'][str(idx)]=character(entity,idx,int(reward['extra'].get('star',1)))
        from .progression import learn_skills,recalculate
        created=player['team']['roles'][str(idx)];learn_skills(created);recalculate(player,created)
        return {str(entity):count}
    from .inventory import insert
    insert(player,entity,count,reward.get('extra',{}))
    return {str(entity):count}

def point_default():return {'normalTimes':0,'advancedTimes':0,'dailyNormalUseGemTimes':0,'selectAdvancedIdx':0,'advancedLuck':0,'advancedLuckClassId':1,'advancedSpecialInfo':None}

def draw(store,account,mode,count):
    if mode not in ('normal','advanced') or count not in (1,10,100):raise ValueError('Invalid draw')
    with store.transaction():
        player=store.player(account)
        if not player:raise ValueError('Chưa có nhân vật')
        before_items=json.loads(json.dumps(player['bag']['items']));before_roles=set(player['team']['roles'])
        point=player.setdefault('point',point_default());ticket=119 if mode=='normal' else 120
        from .state import stack_count,consume
        items=player['bag']['items'];available=stack_count(player,ticket)
        if available>=count:
            consume(player,ticket,count)
        elif mode=='normal':
            cost=300 if count==1 else 2700*(count//10)
            if player['gem']<cost:raise ValueError('Không đủ gem hoặc vé')
            player['gem']-=cost;player['costGem']+=cost;point['dailyNormalUseGemTimes']+=count
        else:raise ValueError('Không đủ vé cao cấp')
        previous=point[mode+'Times'];pool=102 if mode=='normal' else [202,203,204][point['selectAdvancedIdx']]
        overrides=[json.loads(r[0]) for r in store.db.execute('SELECT data FROM pool_entries WHERE pool=?',(pool,))]
        rewards=[]
        for i in range(count):
            if overrides:
                item=dict(choose(overrides));item.pop('weight',None);rewards.append(item)
            else:rewards.extend(drops((101 if mode=='normal' else 201) if previous+i==0 else pool))
        entity_map={}
        for reward in rewards:
            granted=add_reward(player,reward)
            for key,value in granted.items():entity_map[key]=entity_map.get(key,0)+value
        point[mode+'Times']+=count;store.save(player);store.audit('gacha',{'player':player['id'],'mode':mode,'count':count,'rewards':rewards})
        item_delta={key:player['bag']['items'].get(key) for key in set(before_items)|set(player['bag']['items']) if before_items.get(key)!=player['bag']['items'].get(key)}
        role_delta={key:value for key,value in player['team']['roles'].items() if key not in before_roles}
        return {'code':200,**{key:player[key] for key in ('gem','coin','costGem','point')},'bag':{'items':item_delta,'lastIdx':player['bag']['lastIdx']},'team':{'roles':role_delta},'_temp':{'route':'logic.pointHandler.'+mode,'dropList':rewards,'entityCountMap':entity_map}}

def claim_events(store,account,names,indices):
    if not isinstance(names,list) or not isinstance(indices,list) or len(names)!=len(indices) or not 1<=len(names)<=50 or len(set(names))!=len(names):raise ValueError('Danh sách thưởng không hợp lệ')
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        gem=0
        for name,index in zip(names,indices):
            if not isinstance(name,str) or index!=0:raise ValueError('Chỉ hỗ trợ phần thưởng riêng số 0')
            row=store.db.execute('SELECT data FROM events WHERE id=?',(name,)).fetchone()
            if not row:raise ValueError('Event không tồn tại')
            event=json.loads(row[0]);now=time.time()
            if not event['start']<=now<event['end']:raise ValueError('Event chưa mở hoặc đã kết thúc')
            store.db.execute('INSERT INTO event_claims VALUES(?,?)',(name,p['id']));gem+=event['gem']
        p['gem']+=gem;store.save(p);store.audit('claim_events',{'player':p['id'],'events':names,'gem':gem})
        return {'code':200,'gem':p['gem'],'_temp':{'route':'logic.playerHandler.receiveActivityAward','entityCountMap':{'102':gem}}}

def validate_pool_entry(body):
    pool=int(body['pool']);entity=int(body['entity']);weight=int(body['weight']);count=int(body['count']);star=int(body.get('star',1))
    if pool not in (102,202,203,204) or not 1<=weight<=10**9 or not 1<=count<=10**6 or not 1<=star<=7:raise ValueError('Thông số pool không hợp lệ')
    role=any(r['kindId']==entity for r in rows('role'))
    if not role and not any(r['kindId']==entity for name in ('entity','entityExt') for r in rows(name)):raise ValueError('Vật phẩm không tồn tại')
    if role and count!=1:raise ValueError('Tướng phải có số lượng 1')
    return pool,{'entityId':entity,'weight':weight,'count':count,'extra':{'star':star} if role else {}}

def select_pool(store,account,action,args):
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        point=p.setdefault('point',point_default())
        if action=='switchAdvancedPool':
            index=args.get('idx')
            if type(index) is not int or index not in (0,1,2):raise ValueError('Pool không hợp lệ')
            if index!=point['selectAdvancedIdx']:
                if p['gem']<300:raise ValueError('Không đủ gem')
                p['gem']-=300;p['costGem']+=300;point['selectAdvancedIdx']=index
        elif action=='selectWishClassId':
            value=args.get('classId')
            if type(value) is not int or not any(r['classId']==value for r in rows('soul')):raise ValueError('Tướng không hợp lệ')
            point['advancedLuckClassId']=value
        else:raise ValueError('Thao tác không hợp lệ')
        store.save(p);store.audit(action,{'player':p['id'],**args})
        return {'code':200,'gem':p['gem'],'costGem':p['costGem'],'point':point,'_temp':{'route':'logic.pointHandler.'+action}}

def rename_player(store,account,name):
    """Client sends only name; infer the tutorial's first rename from saved state."""
    if not isinstance(name,str) or not name.strip() or not name.isprintable() or '<' in name or '>' in name:
        raise ValueError('Tên không hợp lệ')
    name=name.strip()
    # Cocos EditBox/JS limits use UTF-16 code units (this client displays 10).
    if len(name.encode('utf-16-le',errors='surrogatepass'))//2>10:
        raise ValueError('Tên tối đa 10 ký tự')
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        if name==p['userName']:raise ValueError('Chọn tên đội khác tên tài khoản để hoàn tất hướng dẫn')
        route='logic.playerHandler.rename'
        if name==p['name']:
            return {'code':200,'name':p['name'],'gem':p['gem'],'costGem':p['costGem'],'_temp':{'route':route}}
        for row in store.db.execute('SELECT id,data FROM players WHERE id<>?',(p['id'],)):
            if json.loads(row['data']).get('name','').casefold()==name.casefold():
                raise ValueError('Tên đội đã được sử dụng')
        count=p.get('privateRenameCount',0 if p['name']==p['userName'] else 1)
        cost=0 if count==0 else 100  # recovered PLAYER.CONSTS.RE_NAME_COST_GEM
        if p['gem']<cost:raise ValueError('Đổi tên cần 100 gem')
        p['gem']-=cost;p['costGem']+=cost;p['name']=name;p['privateRenameCount']=count+1
        store.save(p);store.audit('rename',{'player':p['id'],'cost':cost})
        return {'code':200,'name':name,'gem':p['gem'],'costGem':p['costGem'],'_temp':{'route':route}}
