"""Account-scoped profile and paid resource actions, using shipped constants."""
import math,secrets
from .profile import table
from .rules import constants
from .state import integer,snapshot,delta,consume,vip_data,refresh_time
ROUTES={'logic.playerHandler.'+name for name in ('setPhotoImg','setShipImg','setTitleImg','setChatSkin','setHideEqpt','buyActionPoint','buySkillPoint','buyCoin','signIn')}

def handle(store,account,route,args):
    action=route.rsplit('.',1)[-1]
    with store.transaction():
        p=store.player(account)
        if not p:raise ValueError('Chưa có nhân vật')
        before=snapshot(p);temp={}
        if action=='setHideEqpt':
            if type(args.get('isHideEqpt'))is not bool:raise ValueError('Giá trị ẩn trang bị không hợp lệ')
            p['isHideEqpt']=args['isHideEqpt']
        elif action in ('setPhotoImg','setShipImg','setTitleImg','setChatSkin'):
            image=integer(args.get('imgId'),'Hình ảnh',0)
            if action=='setPhotoImg':
                data={r['kindId']:r for name in ('entity','entityExt') for r in table(name)}
                owned={data[r['kindId']]['imgId'] for r in p['team']['roles'].values()}
                if image not in owned:raise ValueError('Chưa sở hữu chiến binh có ảnh này')
                p['photoInfo']['photoImgId']=image
            elif action=='setShipImg':
                owned={900,901}|set(p.get('frameIds',[]));ships={r['kindId']:r for r in table('ship')}
                owned|={r.get('imgId',r['kindId']) for r in ships.values() if any(x['kindId']==r['kindId'] for x in p['bag']['items'].values())}
                if image not in owned:raise ValueError('Chưa sở hữu ảnh đồng hành')
                p['photoInfo']['shipImgId']=image
            else:
                # Non-default cosmetics require a durable unlock grant. Client
                # provided image IDs never create an entitlement by themselves.
                if action=='setTitleImg':
                    import time
                    grant=p.get('titleInfoMap',{}).get(str(image))
                    if image and (not grant or grant.get('expireTime',0) and grant['expireTime']<time.time()*1000):raise ValueError('Danh hiệu chưa mở hoặc đã hết hạn')
                elif image not in p.get('chatSkinIds',[0]):raise ValueError('Chưa mở ngoại hình chat này')
                p['photoInfo']['titleImgId' if action=='setTitleImg' else 'chatImgId']=image
        elif action in ('buyActionPoint','buySkillPoint','buyCoin'):
            local_boost=args.get('isAd',False)
            if type(local_boost)is not bool:raise ValueError('Chế độ nhận tài nguyên không hợp lệ')
            if local_boost:
                from .local_boosts import consume_boost
                if action=='buySkillPoint':raise ValueError('Điểm kỹ năng không có lượt hỗ trợ')
                consume_boost(p,7 if action=='buyActionPoint'else 8);temp['privateLocalReward']=True
            vip=vip_data(p)
            if action=='buyActionPoint':
                count=p['vip'].get('buyActionPointTimes',0)
                if not local_boost and count>=vip['buyActionPointTimes']:raise ValueError('Đã hết lượt mua thể lực')
                costs=[0,50,50,50,100,100,100,200,200,200,400]
                if not local_boost:consume(p,102,costs[min(count+1,len(costs)-1)]);p['vip']['buyActionPointTimes']=count+1
                p['actionPoint']+=120
            elif action=='buySkillPoint':
                count=p['vip'].get('buySkillPointTimes',0);costs=constants('server.PLAYER.CONSTS.BUY_SKILL_COST_GEMS')
                if count>=len(costs)-1:raise ValueError('Đã hết lượt mua điểm kỹ năng')
                consume(p,102,costs[count+1]);p['vip']['buySkillPointTimes']=count+1;p['skillPoint']+=constants('server.PLAYER.CONSTS.BUY_SKILL_POINT')
            else:
                count=p['vip'].get('buyCoinTimes',0);costs=[0,10,20,20,20,40,40,40,40,40,100,100,100,100,100,100,100,100,100,100,200]
                if not local_boost and count>=len(costs)-1:raise ValueError('Đã hết lượt mua vàng')
                cost=costs[min(count+1,len(costs)-1)]
                if not local_boost:consume(p,102,cost)
                roll=secrets.randbelow(1000000)/1000000
                ratio=10 if roll<=.001 else 5 if roll<=.011 else 3 if roll<=.061 else 2 if roll<=.211 else 1
                amount=math.floor((30000+100*p['level'])*cost**.35/2.23)*ratio;p['coin']+=amount
                if not local_boost:p['vip']['buyCoinTimes']=count+1
                temp.update({'getCoin':amount,'ratio':ratio,'costGem':0 if local_boost else cost})
            refresh_time(p)
        elif action=='signIn':
            local_boost=args.get('isAd',False)
            if type(local_boost)is not bool:raise ValueError('Chế độ điểm danh không hợp lệ')
            if local_boost:
                from .local_boosts import consume_boost
                consume_boost(p,2);temp['privateLocalReward']=True
            from .gameplay import add_reward
            from .state import nested
            day=p['privateDay']
            if p.get('privateSignInDay')==day:raise ValueError('Hôm nay đã điểm danh')
            next_day=p['signInDays']+1
            schedule=sorted(table('signIn'),key=lambda r:r['signInDays']);entry=next((r for r in schedule if r['signInDays']==next_day),None)
            if not entry:raise ValueError('Đã nhận hết lịch điểm danh hiện tại')
            rewards={}
            multiplier=2 if entry['doubleVip'] and p['vip']['level']>=entry['doubleVip'] else 1
            if local_boost:multiplier*=2
            for text in entry['dropListDesc'].split(','):
                raw,count=text.split('x');parts=raw.split('_');extra={}
                if len(parts)==3:extra[parts[1]]=int(parts[2])
                for key,value in add_reward(p,{'entityId':int(parts[0]),'count':int(count)*multiplier,'extra':extra}).items():rewards[key]=rewards.get(key,0)+value
            import time
            p['signInDays']=next_day;p['signInTime']=int(time.time()*1000);p['privateSignInDay']=day;temp['entityCountMap']=rewards
        store.save(p);store.audit(action,{'player':p['id']})
        return delta(before,p,route,temp)
