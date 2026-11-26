"""Box selections, source-described drops, usable items and cosmetic entitlements."""
import re,secrets,time
from .inventory import entity,bag_item,active
from .state import integer,snapshot,delta
from .bag_actions import take_index
from .gameplay import drops,choose
from .adventure import grant
from .rules import constants
ROUTES={'logic.playerHandler.'+name for name in ('useItem','useAllBox','selectBoxReward','selectBoxReward2','receiveHonourReward')}

def description(text):
    if not text:return []
    if isinstance(text,list):return text
    result=[]
    for part in text.split(','):
        match=re.fullmatch(r'(\d+)(?:_([A-Za-z][A-Za-z0-9]*)_(\d+))?x(\d+)',part.strip())
        if not match:raise ValueError('Cấu hình phần thưởng không hợp lệ')
        kind,field,value,count=match.groups();extra={field:int(value)}if field else {}
        result.append({'entityId':int(kind),'count':int(count),'extra':extra})
    return result

def random_description(text):
    weighted=[];independent=[]
    for part in text.split(','):
        match=re.fullmatch(r'(.+)_([WR])([\d.]+)',part)
        if not match:raise ValueError('Cấu hình rơi ngẫu nhiên không hợp lệ')
        desc,typ,value=match.groups();row=description(desc)[0]
        if typ=='W':row['weight']=int(float(value)*1000000);weighted.append(row)
        elif secrets.randbelow(10**6)<round(float(value)*10**6):independent.append(row)
    if weighted:independent.append({k:v for k,v in choose(weighted).items()if k!='weight'})
    return independent

def box_config(item):
    row=entity(item['kindId']);extra=dict(row.get('extra')or {})
    for key in ('dropListDesc','rdDropListDesc','selectCount'): 
        if key in item:extra[key]=item[key]
    return extra

def use(player,item,count):
    row=entity(item['kindId']);extra=box_config(item)
    if row['type']=='box':
        if extra.get('selectCount'):raise ValueError('Cần chọn phần thưởng của rương')
        if not extra.get('dropListDesc')and not extra.get('rdDropListDesc'):raise ValueError('Rương chưa có cấu hình phần thưởng')
        rewards=[]
        for _ in range(count):rewards.extend(description(extra.get('dropListDesc'))+random_description(extra['rdDropListDesc'])if extra.get('rdDropListDesc')else description(extra.get('dropListDesc')))
        take_index(player,item['idx'],count);return grant(player,rewards)
    if row['type']=='consumables':
        if extra.get('roleExp'):raise ValueError('Hãy chọn chiến binh để dùng vật phẩm kinh nghiệm')
        if extra.get('dropClassId'):
            cost=extra.get('costCount',1)
            if count%cost:raise ValueError('Số vật phẩm phải đủ mỗi lần hợp thành')
            rewards=[]
            for _ in range(count//cost):rewards.extend(drops(extra['dropClassId']))
            take_index(player,item['idx'],count);return grant(player,rewards)
        if extra.get('actionPoint'):player['actionPoint']+=count*extra['actionPoint']
        elif extra.get('skillPoint'):player['skillPoint']+=count*extra['skillPoint']
        elif isinstance(extra.get('money'),dict):
            rewards=[{'entityId':int(k),'count':v*count,'extra':{}}for k,v in extra['money'].items()]
            take_index(player,item['idx'],count);return grant(player,rewards)
        else:raise ValueError('Vật phẩm không có tác dụng dùng trực tiếp')
    elif row['type']in ('title','frame','chatSkin'):
        if count!=1:raise ValueError('Mỗi lần chỉ dùng một ngoại hình')
        image=extra['imgId']
        if row['type']=='title':
            old=player['titleInfoMap'].get(str(image));hours=extra.get('keepHours',-1)
            if old and old['expireTime']==0:raise ValueError('Đã có danh hiệu vĩnh viễn')
            expires=0 if hours<0 else max(int(time.time()*1000),old['expireTime']if old else 0)+hours*3600000
            player['titleInfoMap'][str(image)]={'imgId':image,'expireTime':expires}
        else:
            target=player['frameIds']if row['type']=='frame'else player['chatSkinIds']
            if image in target:raise ValueError('Đã mở ngoại hình này')
            target.append(image)
    else:raise ValueError('Vật phẩm không thể dùng trực tiếp')
    take_index(player,item['idx'],count);return {}

def handle(store,account,route,args):
    action=route.rsplit('.',1)[-1]
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        before=snapshot(p);rewards={};temp={}
        if action=='receiveHonourReward':
            level=integer(args.get('level'),'Cấp danh vọng',1,16);cfg=constants('server.HONOUR.CONSTS');minimum=cfg['POINT_BETWEEN'][level]
            if p.get('honourPoint',0)<minimum or p.setdefault('honourReceivedMap',{}).get(str(level)):raise ValueError('Chưa đủ danh vọng hoặc đã nhận thưởng')
            rewards=grant(p,description(cfg['LEVEL_REWARD_MAP'][str(level)]));p['honourReceivedMap'][str(level)]=True
        elif action=='useAllBox':
            total=0
            for item in list(p['bag']['items'].values()):
                cfg=box_config(item)
                if active(item)and entity(item['kindId'])['type']=='box'and not cfg.get('selectCount')and (cfg.get('dropListDesc')or cfg.get('rdDropListDesc')):
                    amount=min(item['count'],1000-total)
                    if not amount:break
                    for kind,count in use(p,item,amount).items():rewards[kind]=rewards.get(kind,0)+count
                    total+=amount
            if not total:raise ValueError('Không có rương có thể mở tự động')
        else:
            item=bag_item(p,args.get('bagIndex'));amount=integer(args.get('itemCount'),'Số lượng',1,min(1000,item['count']))
            if action=='useItem':rewards=use(p,item,amount)
            else:
                if entity(item['kindId'])['type']!='box':raise ValueError('Vật phẩm không phải rương')
                cfg=box_config(item);select=cfg.get('selectCount',0);choices=description(cfg.get('dropListDesc'))
                if not select or not choices:raise ValueError('Rương không hỗ trợ chọn phần thưởng')
                counts={}
                if action=='selectBoxReward':
                    selected=args.get('rewardIdxs')
                    if not isinstance(selected,list) or len(selected)!=select or any(type(i)is not int or not 0<=i<len(choices)for i in selected)or len(set(selected))!=len(selected):raise ValueError('Lựa chọn phần thưởng không hợp lệ')
                    counts={i:amount for i in selected}
                else:
                    selected=args.get('rewardIdxCountMap')
                    if select!=1 or not isinstance(selected,dict)or len(selected)>len(choices):raise ValueError('Phân bổ phần thưởng không hợp lệ')
                    for index,count in selected.items():
                        if not isinstance(index,str) or not index.isdigit()or str(int(index))!=index or int(index)>=len(choices):raise ValueError('Chỉ số phần thưởng không hợp lệ')
                        counts[int(index)]=integer(count,'Số lượng thưởng',0,amount)
                    if sum(counts.values())!=amount:raise ValueError('Tổng phần thưởng không khớp số rương')
                chosen=[{**choices[index],'count':choices[index]['count']*count}for index,count in counts.items()if count]
                take_index(p,item['idx'],amount);rewards=grant(p,chosen)
        temp['entityCountMap']=rewards;store.save(p);store.audit(action,{'player':p['id'],'item':before['bag']['items'].get(str(args.get('bagIndex')),{}).get('kindId'),'count':args.get('itemCount',0)})
        return delta(before,p,route,temp)
