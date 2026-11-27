"""Authored SP campaign rules over existing ENG client panels; no original launch calendar."""
import copy,datetime,hashlib,time
from .state import integer,consume
from .inventory import entities,entity
from . import liveops
KEY='sp-banners'
PREFIX='spEvent_'

def role_catalog():
 es=entities();tickets={r.get('extra',{}).get('wishSpClassId'):r['kindId']for r in es.values()if r.get('extra',{}).get('wishSpClassId')};seen={}
 for r in es.values():
  cid=r.get('classId')
  if r['type']=='role'and cid in tickets and (cid not in seen or r['kindId']%100==4):seen[cid]={'roleId':r['kindId'],'classId':cid,'ticketId':tickets[cid]}
 return sorted(seen.values(),key=lambda r:r['classId'])

def defaults(role=105504):
 r=entity(role);ticket=next((x['ticketId']for x in role_catalog()if x['classId']==r.get('classId')),None)
 if ticket is None:raise ValueError('Tướng không có vé/ảnh SP tương thích trong client ENG')
 loot=lambda kind,n:[{'entityId':kind,'count':n,'extra':{}}]
 return {'roleId':role,'ticketId':ticket,'costGem':300,'dailyGemLimit':100,'maxLuck':100,'pool':[{'entityId':role,'count':1,'extra':{'star':3},'weight':5}]+[{'entityId':k,'count':n,'extra':{},'weight':w}for k,n,w in [(20001,20,25),(23001,20,25),(119,1,20),(120,1,10),(21001,5,15)]],'login':[{'target':i,'base':loot(ticket,2),'advanced':loot(119,5)}for i in range(1,6)],'pass':[{'target':i*100,'base':loot(ticket,1),'advanced':loot(120,1)}for i in range(1,6)],'topup':[{'target':i,'rewards':loot(ticket,n)}for i,n in [(20000,10),(50000,20),(100000,30)]],'ranking':[{'rankBegin':1,'rankEnd':1,'rewards':loot(ticket,20)},{'rankBegin':2,'rankEnd':10,'rewards':loot(ticket,5)}],'offers':[{'costGem':300,'limit':1,'rewards':loot(ticket,2)}],'loginUnlockGem':300,'passUnlockGem':600}

def config(store):return liveops.record(store,KEY,{'banners':[]})

def validate(body):
 ident=str(body.get('id',''))
 import re
 if ident in ('__proto__','constructor','prototype')or not re.fullmatch('[A-Za-z0-9_-]{1,40}',ident):raise ValueError('ID banner cần 1–40 chữ/số/_/-')
 d=defaults(integer(body.get('roleId'),'Tướng SP',1));out={'id':ident,'name':str(body.get('name','')).strip()[:80]or'Sự kiện SP','enabled':body.get('enabled',True),**liveops.schedule({'start':body.get('start'),'end':body.get('end')})}
 if type(out['enabled'])is not bool:raise ValueError('Trạng thái không hợp lệ')
 for key,lo,hi in [('costGem',1,100000),('dailyGemLimit',1,1000),('maxLuck',2,1000),('loginUnlockGem',0,1000000),('passUnlockGem',0,1000000)]:out[key]=integer(body.get(key,d[key]),key,lo,hi)
 out.update(roleId=d['roleId'],ticketId=d['ticketId'])
 pool=body.get('pool',d['pool'])
 if not isinstance(pool,list)or len(pool)!=6:raise ValueError('Client SP cần đúng 6 ô: 1 tướng và 5 vật phẩm')
 out['pool']=[]
 for i,row in enumerate(pool):
  rr=liveops.rewards([row])[0]
  if (i==0 and rr['entityId']!=d['roleId'])or(i>0 and entity(rr['entityId'])['type']=='role'):raise ValueError('Ô đầu phải là tướng banner; 5 ô còn lại là vật phẩm')
  out['pool'].append({**rr,'weight':integer(row.get('weight'),'Trọng số',1,10**9)})
 for key in ('login','pass','topup'):
  rows=body.get(key,d[key])
  if not isinstance(rows,list)or not 1<=len(rows)<=30:raise ValueError('Cần 1–30 mốc '+key)
  out[key]=[];last=-1
  for row in rows:
   target=integer(row.get('target'),'Mốc',1,10**9)
   if target<=last:raise ValueError('Mốc phải tăng dần và không trùng')
   last=target;v={'target':target}
   for field in (('rewards',)if key=='topup'else('base','advanced')):
    v[field]=liveops.rewards(row.get(field,[]))
    if key in ('login','pass')and len(v[field])>(1 if field=='base'else 2 if key=='login'else 3):raise ValueError('Quá số ô thưởng của client ENG')
    if key=='login'and any(entity(x['entityId'])['type']=='role'for x in v[field]):raise ValueError('Màn đăng nhập SP chỉ hỗ trợ vật phẩm/mảnh, không tướng nguyên')
   out[key].append(v)
 out['ranking']=[];last=0
 rows=body.get('ranking',d['ranking'])
 if not isinstance(rows,list)or not 1<=len(rows)<=20:raise ValueError('Cần 1–20 mốc BXH')
 for row in rows:
  a=integer(row.get('rankBegin'),'Hạng đầu',1,10000);z=integer(row.get('rankEnd'),'Hạng cuối',a,10000)
  if a<=last:raise ValueError('Các khoảng hạng không được chồng nhau')
  last=z;out['ranking'].append({'rankBegin':a,'rankEnd':z,'rewards':liveops.rewards(row.get('rewards',[]))})
 rows=body.get('offers',d['offers'])
 if not isinstance(rows,list)or len(rows)>10:raise ValueError('Tối đa 10 gói vé')
 out['offers']=[{'costGem':integer(r.get('costGem'),'Giá Gem',1,10**9),'limit':integer(r.get('limit'),'Giới hạn mỗi ngày',1,999),'rewards':liveops.rewards(r.get('rewards',[]))}for r in rows]
 return out

def save(store,body):
 cfg=config(store);b=validate(body);
 if liveops.record(store,'sp-settled:'+b['id']):raise ValueError('Đợt đã kết toán; hãy tạo ID mới')
 old=next((r for r in cfg['banners']if r['id']==b['id']),None)
 if old and len(b['offers'])<len(old['offers']):raise ValueError('Giữ số gói đã tạo để bảo toàn lịch sử mua; tăng giá/giảm giới hạn để đóng gói')
 rows=[r for r in cfg['banners']if r['id']!=b['id']]+[b]
 if len({goods_ids(r)for r in rows})!=len(rows):raise ValueError('Mã gói bị trùng; hãy dùng ID banner khác')
 if len(rows)>100:raise ValueError('Tối đa 100 banner')
 rows.sort(key=lambda r:(r['start'],r['id']))
 active=[r for r in rows if r['enabled']]
 if any(a['end']>b['start']for a,b in zip(active,active[1:])):raise ValueError('Lịch SP bị chồng nhau; mỗi thời điểm chỉ một tướng')
 liveops.put(store,KEY,{'banners':rows},body.get('version'))

def current(store,now=None):
 now=time.time()if now is None else now
 if not liveops.is_open(store,'privateSpWish',now):return None
 return next((b for b in config(store)['banners']if b['enabled']and b['start']<=now<b['end']),None)

def state(p,b):return p['privateActivities'].setdefault('spCampaigns',{}).setdefault(b['id'],{'days':[],'luck':0,'times':0,'gemDay':'','gemTimes':0,'claims':{},'offers':{},'credit':0})

def goods_ids(b):return 1000000+(int.from_bytes(hashlib.sha256(b['id'].encode()).digest()[:4],'big')%9000000)*100

def offers(store,p,b):
 s=state(p,b);out={};base=goods_ids(b)
 for i,row in enumerate(b['offers']+[{'costGem':b['loginUnlockGem'],'limit':1,'rewards':[]},{'costGem':b['passUnlockGem'],'limit':1,'rewards':[]}]):
  ident=base+i;unlock='login'if i==len(b['offers'])else'pass'if i==len(b['offers'])+1 else None
  used=int(s.get(unlock+'Unlocked',False))if unlock else s['offers'].get(s['gemDay']+':'+str(i),0)
  out[str(ident)]={'id':ident,'name':('Mở khóa '+unlock)if unlock else b['name']+' · Gói vé '+str(i+1),'price':row['costGem'],'privateCostGem':row['costGem'],'show':'$1 Gem','gem':0,'gift':0,'dailyGem':0,'priceRate':1,'isNoUsePoint':True,'spBannerId':b['id'],'spOfferIndex':i,'privateLimit':row['limit'],'privateUsed':used,'needPoint':0,'point':False,'desc':'Đổi bằng Gem trong game, không xác nhận thanh toán tiền thật.'}
 return out

def refresh(store,p):
 maps=p['activity']['map']
 for k in list(maps):
  if k.startswith(PREFIX):maps.pop(k)
 p['activity'].pop('spWishRankAllServer',None)
 # Drop stale generated goods on banner rollover.
 goods=p['extra']['goodsList']
 for k in list(goods):
  if goods[k].get('spBannerId'):goods.pop(k)
 cfg=config(store)
 if not cfg['banners']:return
 b=current(store)
 if not b:
  maps['privateSpWish'].update(start_time=0,end_time=1);p['rankScores']['sp_wish_times']=0;return
 from .activities import event,reward
 s=state(p,b);now=time.time();day=datetime.datetime.fromtimestamp(now,liveops.ZONE).date().isoformat()
 if day not in s['days']:s['days'].append(day)
 if s['gemDay']!=day:s.update(gemDay=day,gemTimes=0)
 cid=entity(b['roleId'])['classId'];a=b['start']*1000;z=b['end']*1000
 maps['privateSpWish']=event('privateSpWish','spWish',a,z,{'wishTimes':s['luck'],'spWishGemTimes':s['gemTimes']},[],spClassId=cid,maxLuck=b['maxLuck'],costGem=b['costGem'],costGemMaxTiems=b['dailyGemLimit'],rdDropListDesc=','.join(liveops.desc([r])+'_W'+str(r['weight'])for r in b['pool']))
 maps['privateSpWish']['priority']=100
 p['rankScores']['sp_wish_times']=s['times']
 p['activity']['spWishRankAllServer']=event('spWishRankAllServer_'+b['id'],'rank',a,z,{},[dict(reward(liveops.desc(r['rewards']),{},False,{}),status=1,rankBegin=r['rankBegin'],rankEnd=r['rankEnd'],limit=0)for r in b.get('ranking',[])],spClassId=cid,regionMap={},limitDesc='')
 p['activity']['spWishRankAllServer'].update(desc='BXH Ước Nguyện · thưởng qua thư',priority=200)
 goods.update(offers(store,p,b));base=goods_ids(b)
 def made(suffix,typ,title,reach,rows,priority):
  name=PREFIX+b['id']+'_'+suffix;claimed=s['claims'].get(name,[])
  v=event(name,typ,a,z,reach,[reward(liveops.desc(loot),need,i in claimed,reach)for i,(need,loot)in enumerate(rows)],spClassId=cid)
  v.update(desc=title,priority=priority,privateSpBanner=b['id']);maps[name]=v;return v
 for typ,key,need,progress,title,priority in [('login','login','loginDays',len(s['days']),'Phúc lợi đăng nhập',400),('taskActive','pass','taskActivePoint',store.db.execute('SELECT coalesce(sum(amount),0)*20 FROM event_metrics WHERE player=? AND metric=? AND created>=? AND created<?',(p['id'],'adventure_wins',b['start'],b['end'])).fetchone()[0]+s.get('passFilled',0),'SK Chiến lệnh',500)]:
  rows=b[key];unlockKey='buyGoods_'+str(base+len(b['offers'])+(key=='pass'));unlocked=int(s.get(key+'Unlocked',False)or b[key+'UnlockGem']==0)
  made(key,typ,title,{need:progress},[({need:r['target']},r['base'])for r in rows],priority)
  made(key+'Advanced',typ+'Advanced',title+' · Tinh anh',{need:progress,unlockKey:unlocked},[({need:r['target'],unlockKey:1},r['advanced'])for r in rows],priority+1)
 made('topup','topUpMoney','Phúc lợi nạp · điểm quản trị',{'topUpMoney':s['credit']},[({'topUpMoney':r['target']},r['rewards'])for r in b['topup']],600)
 rows=[];reach={}
 for i,r in enumerate(b['offers']):
  key='buyGoods_'+str(base+i);reach[key]=s['offers'].get(day+':'+str(i),0);rows.append(({key:reach[key]+1},r['rewards']))
 if rows:
  dto=made('offers','buyGoods','Quà giá trị · Gem',reach,rows,300)
  for i,r in enumerate(dto['rewards']):r.update(buyMaxTimes=b['offers'][i]['limit'],buyTimes=reach['buyGoods_'+str(base+i)],status=1 if reach['buyGoods_'+str(base+i)]<b['offers'][i]['limit']else 3)


def purchase(store,p,action,args):
 b=current(store)
 if not b:raise ValueError('Banner SP đã kết thúc')
 ident=integer(args.get('id')if action=='buyGemGoods'else args.get('goodsId'),'Gói SP',1);catalog=offers(store,p,b);offer=catalog.get(str(ident))
 if not offer:raise ValueError('Gói SP không còn trong banner')
 if action!='buyGemGoods':raise ValueError('Gói SP này đổi bằng Gem, không dùng phiếu thanh toán')
 s=state(p,b);i=offer['spOfferIndex'];n=len(b['offers'])
 if offer['privateUsed']>=offer['privateLimit']:raise ValueError('Đã hết lượt mua')
 if integer(args.get('costGem'),'Giá Gem',0)!=offer['price']:raise ValueError('Giá thay đổi, hãy mở lại sự kiện')
 if offer['price']:consume(p,102,offer['price'])
 if i>=n:s[('login'if i==n else'pass')+'Unlocked']=True;return {}
 from .adventure import grant
 s['offers'][s['gemDay']+':'+str(i)]=offer['privateUsed']+1
 return grant(p,b['offers'][i]['rewards'])

def claim(store,p,name,index):
 b=current(store);dto=p['activity']['map'].get(name)
 if not b or not dto or dto.get('privateSpBanner')!=b['id']or name.endswith('_offers'):raise ValueError('Phần thưởng SP không còn mở')
 if not 0<=index<len(dto['rewards'])or dto['rewards'][index]['status']!=2:raise ValueError('Chưa đạt mốc hoặc đã nhận')
 s=state(p,b);s['claims'].setdefault(name,[]).append(index)
 from .adventure import grant
 from .item_actions import description
 return grant(p,description(dto['rewards'][index]['dropListDesc']))


def settle(store):
 """End-of-banner mail exactly once, including players offline at rollover."""
 import json,secrets
 for b in config(store)['banners']:
  key='sp-settled:'+b['id']
  if not b['enabled']or time.time()<b['end']or liveops.record(store,key):continue
  with store.transaction():
   if liveops.record(store,key):continue
   people=[]
   for row in store.db.execute('SELECT data FROM players'):
    p=json.loads(row[0]);s=p.get('privateActivities',{}).get('spCampaigns',{}).get(b['id'],{});score=s.get('times',0)
    if score>0 and not p.get('isBan'):people.append((p,score))
   people.sort(key=lambda v:(-v[1],v[0]['id']));awards=[]
   for rank,(p,score)in enumerate(people,1):
    loot=next((r['rewards']for r in b.get('ranking',[])if r['rankBegin']<=rank<=r['rankEnd']),None)
    if not loot:continue
    if len(p['extra']['mails'])>=200:return # Retry safely after the player clears mail.
    awards.append((p,score,rank,loot))
   for p,score,rank,loot in awards:
    mail={'_id':secrets.token_hex(12),'senderId':0,'senderName':'Hệ thống','title':b['name']+' · BXH #'+str(rank),'body':'Kết toán lượt ước: '+str(score)+'. Luật thưởng riêng của server.','status':1,'isSys':True,'dropList':copy.deepcopy(loot),'ctime':int(time.time()*1000)}
    p['extra']['mails'].append(mail);store.save(p);store.notify(p['userId'],'onNewMail',{'mail':mail})
   liveops.put(store,key,{'participants':len(people),'mails':len(awards),'settled':int(time.time())})
   store.audit('sp_settlement',{'banner':b['id'],'participants':len(people),'mails':len(awards)})
