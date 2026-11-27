"""Authenticated administration over the same SQLite state as game RPCs."""
import copy,datetime,hashlib,hmac,json,math,secrets,sqlite3,time,unicodedata
from functools import lru_cache
from pathlib import Path
from aiohttp import web
from . import liveops
from . import provenance
from .inventory import entities
from .state import delta,snapshot,integer
ROOT=Path(__file__).resolve().parents[1]

@lru_cache(None)
def labels():return json.loads((ROOT/'tables/adminLabels.json').read_text(encoding='utf-8'))
@lru_cache(None)
def images():
 p=ROOT/'web/assets/item-icons.json'
 return json.loads(p.read_text(encoding='utf-8'))if p.exists()else{}

def search_key(value):return ''.join(c for c in unicodedata.normalize('NFKD',str(value).casefold().replace('đ','d'))if not unicodedata.combining(c))

def item_view(row,detail=False):
 k=row['kindId'];label=labels().get(str(k),{});out={'id':k,'name':label.get('name',row['kindName']),'originalName':row['kindName'],'description':label.get('description',row.get('desc','')),'type':row['type'],'color':row.get('color',0),'image':images().get(str(k)),'imgId':row.get('imgId'),'price':row.get('price',0),'maxStack':row.get('maxNum',-1)}
 out['dataSource']=provenance.item_source(k);out['translationSource']={'name':label.get('nameSource','source-text-untranslated'),'description':label.get('descriptionSource','source-text-untranslated')}
 if row['type']=='role':out['grade']={2:'S',3:'SS',4:'SSS',5:'SP'}.get(row.get('group'),'')
 if detail:
  out['definition']=row
  if row['type']=='box':
   from .catalog_audit import box_preview
   out['box']=box_preview(row)
 return out

def page_args(req):
 page=max(1,int(req.query.get('page',1)));limit=min(100,max(1,int(req.query.get('limit',24))))
 return page,limit

def stamp(store):
 from .sp_events import config
 now=time.time();rows=[('sp:'+b['id'],liveops.window(b,now))for b in config(store)['banners']]+[(e['id'],liveops.window(e,now))for e in liveops.custom_events(store)]
 for key in liveops.TEMPLATES:
  cfg=liveops.configured(store,key)
  if 'start'in cfg:rows.append((key,liveops.window(cfg,now)))
 day=datetime.datetime.fromtimestamp(now,liveops.ZONE).date().isoformat()
 return hashlib.sha256(json.dumps([store.db.execute("SELECT coalesce(sum(version),0)FROM ops_records WHERE key LIKE 'activity:%'OR key LIKE 'event-revision:%'OR key='wheel-prizes'OR key='sp-banners'").fetchone()[0],day,rows],sort_keys=True).encode()).hexdigest()

class Admin:
 def __init__(self,store,token,online_ids,flush):self.store=store;self.token=token;self.online_ids=online_ids;self.flush=flush;self.started=time.time()
 def auth(self,req):
  supplied=req.headers.get('X-DB2-Admin-Token')
  if supplied is None:
   auth=req.headers.get('Authorization','');supplied=auth[7:]if auth.startswith('Bearer ')else''
  if not hmac.compare_digest(supplied.encode(),self.token.encode()):raise web.HTTPUnauthorized(text='Token quản trị không đúng hoặc phiên đã kết thúc')
 def snapshots(self):
  ids=self.online_ids()
  return {r['id']:json.loads(r['data'])for r in self.store.db.execute('SELECT id,data FROM players')if r['id']in ids}
 def sync(self,before):
  for pid,old in before.items():
   p=self.store.player(old['userId'])
   if not p:continue
   p['privateOpsStamp']=stamp(self.store);self.store.save(p)
   payload=delta(old,p,'admin.sync');payload.setdefault('extra',{})['goodsList']=p['extra']['goodsList'];payload.pop('privateOpsStamp',None)
   if len(payload)>2:self.store.notify(p['userId'],'onSync',payload)
  self.flush()
 def tick(self):
  from .sp_events import settle
  settle(self.store)
  mark=stamp(self.store);before={pid:p for pid,p in self.snapshots().items()if p.get('privateOpsStamp')!=mark}
  if before:
   with self.store.transaction():self.sync(before)
 async def get(self,req):
  self.auth(req)
  try:return web.json_response(self.read(req))
  except (ValueError,KeyError,TypeError)as e:return web.json_response({'error':str(e)},status=400)
 def raw_players(self):return [json.loads(r[0])for r in self.store.db.execute('SELECT data FROM players ORDER BY id DESC')]
 def read(self,req):
  s=self.store;path=req.path;now=int(time.time())
  if path=='/admin/catalog':
   q=search_key(req.query.get('q','').strip()[:100]);typ=req.query.get('type','');color=req.query.get('color','');page,limit=page_args(req)
   all_rows=list(entities().values());matches=[r for r in all_rows if(not typ or r['type']==typ)and(not color or str(r.get('color'))==color)and(not q or q in search_key(str(r['kindId'])+' '+r['kindName']+' '+labels().get(str(r['kindId']),{}).get('name','')))];matches.sort(key=lambda r:r['kindId'])
   return {'items':[item_view(r)for r in matches[(page-1)*limit:page*limit]],'total':len(matches),'page':page,'pages':max(1,math.ceil(len(matches)/limit)),'colors':sorted({r.get('color',0)for r in all_rows}),'types':{t:sum(r['type']==t for r in all_rows)for t in sorted({r['type']for r in all_rows})}}
  if path.startswith('/admin/catalog/'):
   from .inventory import entity
   return item_view(entity(int(req.match_info['id'])),True)
  if path=='/admin/overview':
   players=self.raw_players();online=self.online_ids();events=liveops.custom_events(s);recent=self.audit('',8);draws=0
   for r in s.db.execute("SELECT detail FROM audit WHERE action IN('draw','gacha') AND created>?",(now-86400,)):
    try:draws+=json.loads(r[0]).get('count',1)
    except (ValueError,TypeError):pass
   errors=s.db.execute("SELECT count(*)FROM audit WHERE action='client_error'AND created>?",(now-86400,)).fetchone()[0]
   series=[]
   for i in range(6,-1,-1):
    day=(datetime.datetime.fromtimestamp(now,liveops.ZONE)-datetime.timedelta(days=i)).replace(hour=0,minute=0,second=0,microsecond=0);a=int(day.timestamp());count=s.db.execute('SELECT count(*)FROM audit WHERE created>=?AND created<?',(a,a+86400)).fetchone()[0];series.append({'date':day.date().isoformat(),'count':count})
   return {'stats':{'players':len(players),'online':len(online),'activeEvents':sum(liveops.window(e)['active']for e in events),'builtinOpen':sum(liveops.is_open(s,k)for k in liveops.TEMPLATES),'draws24h':draws,'errors24h':errors,'items':len(entities())},'recentPlayers':[self.player_summary(p,online)for p in players[:5]],'recentAudit':recent['items'],'series':series,'upcomingEvents':[self.event_view(e)for e in sorted(events,key=lambda e:liveops.window(e)['start'])if not e.get('deleted')and liveops.window(e)['end']>now][:5],'version':liveops.revision(s),'serverTime':now,'uptime':int(time.time()-self.started),'timezone':'Asia/Ho_Chi_Minh'}
  if path=='/admin/players':
   q=search_key(req.query.get('q','')[:100]);page,limit=page_args(req);online=self.online_ids();rows=[p for p in self.raw_players()if q in search_key(str(p['id'])+' '+p['name']+' '+p['userName'])];mode=req.query.get('status','')
   if mode=='online':rows=[p for p in rows if p['id']in online]
   return {'items':[self.player_summary(p,online)for p in rows[(page-1)*limit:page*limit]],'total':len(rows),'page':page,'pages':max(1,math.ceil(len(rows)/limit))}
  if path.startswith('/admin/players/'):
   pid=int(req.match_info['id']);row=s.db.execute('SELECT account FROM players WHERE id=?',(pid,)).fetchone()
   if not row:raise ValueError('Không tìm thấy người chơi')
   p=s.player(row[0]);bag=[];team=[]
   for slot,r in p['bag']['items'].items():bag.append({**item_view(entities()[r['kindId']]),'slot':slot,'count':r['count'],'instance':r})
   for slot,r in p['team']['roles'].items():team.append({**item_view(entities()[r['kindId']]),'slot':slot,'count':1,'instance':r})
   return {'player':self.player_summary(p,self.online_ids()),'bag':bag,'team':team,'profile':p}
  if path=='/admin/provenance':return provenance.summary()
  if path=='/admin/events':
   events=[self.event_view(e)for e in liveops.custom_events(s)if not e.get('deleted')];templates=self.templates()
   ids={int(r['entityId'])for event in events+templates for group in event['rewardGroups']for r in group['items']}
   return {'events':events,'templates':templates,'rewardItems':[item_view(entities()[kind])for kind in sorted(ids)],**self.sp_data(),'eventMetrics':[{'id':key,'label':label}for key,label in liveops.EVENT_METRICS.items()],'version':liveops.revision(s)}
  if path=='/admin/calendar':return {'items':liveops.calendar(s,int(req.query['start']),int(req.query['end'])),'timezone':'Asia/Ho_Chi_Minh'}
  if path=='/admin/gacha':return self.gacha()
  if path=='/admin/giftcodes':return {'items':self.codes()}
  if path=='/admin/audit':return self.audit(req.query.get('action',''),int(req.query.get('limit',40)),int(req.query.get('page',1)))
  if path=='/admin/api':return {'players':self.raw_players(),'giftcodes':self.codes(),'events':[self.event_view(e)for e in liveops.custom_events(s)if not e.get('deleted')],'gacha':[{'pool':r['pool'],**json.loads(r['data'])}for r in s.db.execute('SELECT pool,data FROM pool_entries')],'audit':self.audit('',40)['items'],'version':liveops.revision(s)}
  raise ValueError('Mục quản trị không tồn tại')
 def player_summary(self,p,online):return {k:p.get(k)for k in('id','name','userName','level','gem','coin','power','actionPoint','skillPoint','ctime','atime','privateGM')}|{'vip':p['vip']['level'],'online':p['id']in online,'roles':len(p['team']['roles']),'items':len(p['bag']['items'])}
 def event_view(self,e):
  w=liveops.window(e);now=time.time();count=self.store.db.execute('SELECT count(*)FROM event_claims WHERE event=?',(e['id'],)).fetchone()[0]+self.store.db.execute('SELECT count(*)FROM event_window_claims WHERE event=?',(e['id'],)).fetchone()[0]
  version=self.store.db.execute('SELECT version FROM ops_records WHERE key=?',('event-revision:'+e['id'],)).fetchone()
  loot=e.get('rewards')or([{'entityId':102,'count':e['gem'],'extra':{}}]if e.get('gem')else[])
  return {**e,'requirement':liveops.requirement(e.get('requirement')),'objectiveLabel':liveops.objective_label(e),'version':version[0]if version else 0,'window':w,'claims':count,'status':'paused'if not e.get('enabled',True)else'active'if w['active']else'scheduled'if w['start']>now or e.get('repeat','none')!='none'and(not e.get('until')or e['until']>now)else'ended','rewards':loot,'rewardGroups':[{'label':'Mỗi kỳ · nhận một lần','items':loot}]}
 def templates(self):
  from .profile import new_profile
  from .activities import refresh,SCORES,BOXES,SELECT
  from .item_actions import description
  p=new_profile(0,0,'Preview','preview');refresh(self.store,p);result=[]
  for key,(title,period)in liveops.TEMPLATES.items():
   cfg=liveops.configured(self.store,key);row=self.store.db.execute('SELECT version FROM ops_records WHERE key=?',('activity:'+key,)).fetchone();dto=p['activity']['map'].get(key,{})
   if key in p['activity']['scorePointInfoMap']:dto=p['activity']['scorePointInfoMap'][key]['activityItem']
   if key=='dream':dto=p['activity']['dream']['activityItem']
   reward_rows=[{'items':description(r['dropListDesc']),'needMap':r.get('needMap',{})}for r in dto.get('rewards',[])if r.get('dropListDesc')]
   if key=='privateSelect':reward_rows=[]
   options=cfg.get('options')
   if key=='privateSpWish'and options is None:options={'costGem':300,'dailyGemLimit':10,'maxLuck':20}
   if key.startswith('scorePoint')and options is None:options={'scores':SCORES,'boxes':[description(x)for x in BOXES]}
   if key=='privateSelect'and options is None:options={'choices':[description(x)for x in SELECT]}
   if key=='dream'and options is None:options={'tiles':[description(x)for x in('101x5000','20001x5','93x10','23001x5')],'lap':description('93x100')}
   groups=[{'label':f'Mốc {i+1}','items':r['items']}for i,r in enumerate(reward_rows)]
   for field,label in (('boxes','Rương mốc'),('choices','Lựa chọn'),('tiles','Nhóm ô')):
    groups.extend({'label':f'{label} {i+1}','items':items}for i,items in enumerate((options or {}).get(field,[])))
   if (options or {}).get('lap'):groups.append({'label':'Qua một vòng','items':options['lap']})
   if key.startswith('dial:'):
    groups=[{'label':f'Ô quay {i+1}','items':[{'entityId':kind,'count':count,'extra':{}}]}for i,(kind,count,weight)in enumerate(liveops.prizes(self.store))]
   result.append({'id':key,'title':title,'period':period,'enabled':cfg.get('enabled',True),'open':liveops.is_open(self.store,key),'description':cfg.get('description',''),'schedule':{k:cfg[k]for k in('start','end','repeat','until')}if'start'in cfg else None,'version':row[0]if row else 0,'rewards':reward_rows,'rewardGroups':groups,'options':options,'clientVisibility':'Nút vòng quay có thể còn hiện trên client cũ; server chặn lượt quay khi đóng'if key.startswith('dial:')else'Theo thời gian và dữ liệu activity của game'})
  return result
 def sp_data(self):
  from . import sp_events
  cfg=sp_events.config(self.store);row=self.store.db.execute('SELECT version FROM ops_records WHERE key=?',(sp_events.KEY,)).fetchone()
  roles=sp_events.role_catalog()
  for r in roles:r['item']=item_view(entities()[r['roleId']]);r['ticket']=item_view(entities()[r['ticketId']])
  return {'spBanners':[{**b,'settlement':liveops.record(self.store,'sp-settled:'+b['id'])}for b in cfg['banners']],'spVersion':row[0]if row else 0,'spRoles':roles,'spDefaults':sp_events.defaults(),'spCalendarSource':'private-server-rule'}
 def codes(self):
  rows=[]
  for r in self.store.db.execute('SELECT *FROM giftcodes ORDER BY rowid DESC'):
   cfg=liveops.record(self.store,'giftcode:'+r['code']);uses=self.store.db.execute('SELECT count(*)FROM redemptions WHERE code=?',(r['code'],)).fetchone()[0];rows.append({**dict(r),'used':uses,'enabled':cfg.get('enabled',True),'rewards':cfg.get('rewards',[]),'status':'paused'if not cfg.get('enabled',True)else'expired'if r['expires']<=time.time()else'exhausted'if uses>=r['max_uses']else'active'})
  return rows
 def audit(self,action,limit=40,page=1):
  limit=min(100,max(1,limit));page=max(1,page);where=' WHERE action=?'if action else'';args=(action,)if action else();total=self.store.db.execute('SELECT count(*)FROM audit'+where,args).fetchone()[0];rows=[dict(r)for r in self.store.db.execute('SELECT *FROM audit'+where+' ORDER BY id DESC LIMIT ? OFFSET ?',(*args,limit,(page-1)*limit))]
  for r in rows:
   try:r['parsed']=json.loads(r['detail'])
   except ValueError:r['parsed']={}
  return {'items':rows,'total':total,'page':page,'pages':max(1,math.ceil(total/limit)),'actions':[r[0]for r in self.store.db.execute('SELECT DISTINCT action FROM audit ORDER BY action')]}
 def gacha(self):
  from .gameplay import rows
  result=[]
  for pool,name in((102,'Thường'),(202,'Cao cấp I'),(203,'Cao cấp II'),(204,'Cao cấp III')):
   custom=[json.loads(r[0])for r in self.store.db.execute('SELECT data FROM pool_entries WHERE pool=?',(pool,))];total=sum(r['weight']for r in custom)
   view=[{**r,'item':item_view(entities()[r['entityId']]),'probability':r['weight']/total}for r in custom]
   source=[r for r in rows('drop')if r['classId']==pool]
   result.append({'id':pool,'name':name,'custom':bool(custom),'entries':view,'sourceRows':source,'totalWeight':total})
  return {'pools':result,'wheelPrizes':[{'entityId':k,'count':n,'weight':w,'item':item_view(entities()[k])}for k,n,w in liveops.prizes(self.store)]}
 async def post(self,req):
  self.auth(req)
  try:
   body=await req.json();before=self.snapshots()
   with self.store.transaction():
    self.mutate(body);action=str(body.get('action'));self.store.audit(action if action in('giftcode','grant','set_gm','gacha_reset','gacha_entry','event')else'admin_'+action,body)
    if action in('event','event_save','event_toggle','event_delete','activity_config','sp_banner_save','sp_credit','wheel_prizes','grant','grant_items','player_update','set_gm','send_mail'):self.sync(before)
   return web.json_response({'ok':True,'version':liveops.revision(self.store)})
  except (ValueError,KeyError,TypeError,sqlite3.IntegrityError)as e:return web.json_response({'error':str(e)if isinstance(e,ValueError)else'Dữ liệu không hợp lệ hoặc mã đã tồn tại'},status=409 if'cửa sổ khác'in str(e)else 400)
 def mutate(self,b):
  s=self.store;a=b.get('action')
  if a in('event','event_save'):
   data=dict(b)
   for k in('start','end','gem'):
    if k in data:data[k]=int(data[k])
   old=s.db.execute('SELECT data FROM events WHERE id=?',(str(b.get('id','')),)).fetchone();event=liveops.event_save(data,json.loads(old[0])if old else None)
   previous=json.loads(old[0])if old else None
   metric_changed=previous and liveops.requirement(previous.get('requirement'))['metric']!=event['requirement']['metric']
   if previous and(previous.get('repeat','none')!=event['repeat']or metric_changed):
    claimed=s.db.execute('SELECT count(*)FROM event_claims WHERE event=?',(event['id'],)).fetchone()[0]+s.db.execute('SELECT count(*)FROM event_window_claims WHERE event=?',(event['id'],)).fetchone()[0]
    if claimed:raise ValueError('Sự kiện đã có lượt nhận. Tạo ID mới nếu muốn đổi chu kỳ hoặc loại điều kiện.')
   s.db.execute('INSERT INTO events VALUES(?,?) ON CONFLICT(id)DO UPDATE SET data=excluded.data',(event['id'],json.dumps(event,ensure_ascii=False)));liveops.put(s,'event-revision:'+event['id'],{'updated':int(time.time())},b.get('version'));return
  if a in('event_toggle','event_delete'):
   row=s.db.execute('SELECT data FROM events WHERE id=?',(b['id'],)).fetchone()
   if not row:raise ValueError('Sự kiện không tồn tại')
   e=json.loads(row[0]);e['enabled']=False if a=='event_delete'else b['enabled']
   if type(e['enabled'])is not bool:raise ValueError('Trạng thái không hợp lệ')
   if a=='event_delete':e['deleted']=True
   s.db.execute('UPDATE events SET data=?WHERE id=?',(json.dumps(e,ensure_ascii=False),b['id']));liveops.put(s,'event-revision:'+b['id'],{'updated':int(time.time())});return
  if a=='sp_banner_save':
   from .sp_events import save
   save(s,b);return
  if a=='sp_credit':
   from . import sp_events
   row=s.db.execute('SELECT account FROM players WHERE id=?',(integer(b.get('player'),'Nhân vật',1),)).fetchone()
   if not row:raise ValueError('Không có người chơi')
   p=s.player(row[0]);banner=sp_events.current(s)
   if not banner:raise ValueError('Không có banner đang mở')
   sp_events.state(p,banner)['credit']+=integer(b.get('amount'),'Điểm nạp riêng',1,10**9)
   from .activities import refresh
   refresh(s,p);s.save(p);return
  if a=='activity_config':
   cfg=liveops.validate_activity(b['id'],b)
   if 'rewards'in cfg:
    template=next(t for t in self.templates()if t['id']==b['id'])
    if len(cfg['rewards'])!=len(template['rewards']):raise ValueError('Cần giữ đúng số mốc thưởng của client')
   liveops.put(s,'activity:'+b['id'],cfg,b.get('version'));return
  if a=='wheel_prizes':liveops.put(s,'wheel-prizes',liveops.validate_prizes(b['entries']));return
  if a in('giftcode','giftcode_save'):
   code=str(b['code']).strip();gem=int(b.get('gem',0));uses=int(b.get('max_uses',100));expires=int(b.get('expires',time.time()+30*86400));loot=liveops.rewards(b.get('rewards',[]),True);enabled=b.get('enabled',True)
   if a=='giftcode_save'and gem==0 and not loot:raise ValueError('Giftcode cần gem hoặc ít nhất một vật phẩm')
   if not code or len(code)>64 or any(ord(c)<32 for c in code)or not 0<=gem<=10**9 or uses<1 or expires<0 or type(enabled)is not bool:raise ValueError('Giftcode không hợp lệ')
   old=s.db.execute('SELECT code FROM giftcodes WHERE code=?',(code,)).fetchone()
   if a=='giftcode'and old:raise ValueError('Mã đã tồn tại')
   used=s.db.execute('SELECT count(*)FROM redemptions WHERE code=?',(code,)).fetchone()[0]
   integer(uses,'Giới hạn lượt',1,10**9);integer(expires,'Hạn dùng',1,4102444800)
   if uses<used:raise ValueError('Giới hạn mới nhỏ hơn số lượt đã dùng')
   s.db.execute('INSERT INTO giftcodes VALUES(?,?,?,?)ON CONFLICT(code)DO UPDATE SET gem=excluded.gem,expires=excluded.expires,max_uses=excluded.max_uses',(code,gem,expires,uses));liveops.put(s,'giftcode:'+code,{'enabled':enabled,'rewards':loot});return
  if a=='giftcode_toggle':
   cfg=liveops.record(s,'giftcode:'+b['code']);cfg['enabled']=b['enabled']
   if type(cfg['enabled'])is not bool:raise ValueError('Trạng thái không hợp lệ')
   if not s.db.execute('SELECT 1 FROM giftcodes WHERE code=?',(b['code'],)).fetchone():raise ValueError('Mã không tồn tại')
   liveops.put(s,'giftcode:'+b['code'],cfg);return
  if a in('gacha_entry','gacha_reset','gacha_remove'):
   from .gameplay import validate_pool_entry
   pool=int(b['pool'])
   if pool not in(102,202,203,204):raise ValueError('Pool không hợp lệ')
   if a=='gacha_reset':s.db.execute('DELETE FROM pool_entries WHERE pool=?',(pool,))
   elif a=='gacha_remove':s.db.execute('DELETE FROM pool_entries WHERE pool=?AND entity=?',(pool,int(b['entity'])))
   else:
    pool,r=validate_pool_entry(b);s.db.execute('INSERT INTO pool_entries VALUES(?,?,?)ON CONFLICT(pool,entity)DO UPDATE SET data=excluded.data',(pool,r['entityId'],json.dumps(r)))
   liveops.put(s,'pool-revision:'+str(pool),{'updated':int(time.time())});return
  if a in('grant','grant_items','player_update','set_gm','send_mail'):
   if a=='send_mail'and b.get('all'):ids=[r[0]for r in s.db.execute('SELECT id FROM players')]
   else:ids=[int(b['player'])]
   if len(ids)>1000:raise ValueError('Gửi tối đa 1.000 người chơi mỗi đợt')
   loot=liveops.rewards(b.get('rewards',[]))if a in('grant_items','send_mail')else[]
   for pid in ids:
    row=s.db.execute('SELECT account FROM players WHERE id=?',(pid,)).fetchone()
    if not row:raise ValueError('Không tìm thấy người chơi')
    p=s.player(row[0])
    if a=='grant':p['gem']+=integer(int(b['gem']),'Gem',1)
    elif a=='set_gm':
     if type(b.get('enabled'))is not bool:raise ValueError('Quyền GM không hợp lệ')
     p['privateGM']=b['enabled']
    elif a=='grant_items':
     from .adventure import grant
     grant(p,loot)
    elif a=='player_update':
     values=b.get('values',{});expected=b.get('expected',{})
     if not isinstance(expected,dict):raise ValueError('Dữ liệu đối chiếu không hợp lệ')
     if any((p['vip']['level']if k=='vipLevel'else p.get(k))!=v for k,v in expected.items()):raise ValueError('Dữ liệu đã được sửa ở cửa sổ khác. Làm mới rồi thử lại.')
     from .gm_controls import set_player
     set_player(p,values)
    else:
     title=str(b.get('title','')).strip();body=str(b.get('body','')).strip()
     if not title or len(title)>100 or len(body)>2000 or len(p['extra']['mails'])>=200:raise ValueError('Tiêu đề/nội dung không hợp lệ hoặc hộp thư đã đầy')
     mail={'_id':secrets.token_hex(12),'senderId':0,'senderName':'Hệ thống','title':title,'body':body,'status':1,'isSys':True,'dropList':loot,'ctime':int(time.time()*1000)};p['extra']['mails'].append(mail);s.notify(p['userId'],'onNewMail',{'mail':mail})
    s.save(p)
   return
  raise ValueError('Thao tác chưa được hỗ trợ')
