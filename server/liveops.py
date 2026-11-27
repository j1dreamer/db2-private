"""Validated live operations shared by administration and the actual game RPCs."""
import copy,datetime,json,re,time
from .state import integer
ZONE=datetime.timezone(datetime.timedelta(hours=7))
EVENT_METRICS={'none':'Quà theo lịch','gem_spent':'Tiêu Gem','adventure_wins':'Vượt màn thắng (gồm quét màn)','summon_draws':'Quay thường / cao cấp'}

def requirement(value):
 if value is None:return {'metric':'none','target':0}
 if not isinstance(value,dict)or value.get('metric')not in EVENT_METRICS:raise ValueError('Điều kiện sự kiện không hợp lệ')
 metric=value['metric']
 return {'metric':metric,'target':integer(value.get('target'),'Mốc nhận quà',1,10**9)if metric!='none'else 0}

def event_progress(store,p,item,now=None):
 goal=requirement(item.get('requirement'))
 if goal['metric']=='none':return 0
 now=time.time()if now is None else now;w=window(item,now)
 if store is None:return 0
 return store.db.execute('SELECT coalesce(sum(amount),0)FROM event_metrics WHERE player=?AND metric=?AND created>=?AND created<?AND created<=?',(p['id'],goal['metric'],w['start'],w['end'],now)).fetchone()[0]

def objective_label(item):
 goal=requirement(item.get('requirement'))
 return EVENT_METRICS[goal['metric']]+(' · mốc '+format(goal['target'],',').replace(',','.')if goal['metric']!='none'else'')

def progress_events(store,p):
 return {e['id']:p['activity']['map'][e['id']]for e in custom_events(store)if not e.get('deleted')and requirement(e.get('requirement'))['metric']!='none'and e['id']in p['activity']['map']}
TEMPLATES={
 'saveGemUpgradeLevel':('Gửi gem · thưởng lên cấp','lifetime'),
 'saveGemUpgradeLevelFree':('Quà gửi gem hằng ngày','daily'),
 'task_active':('Nhiệm vụ năng động','daily'),
 'privateLogin':('Đăng nhập 7 ngày','weekly'),
 'upgradeVip':('Quà cấp VIP','lifetime'),
 'privateSelect':('Quà tự chọn','lifetime'),
 'endless_reward':('Quà nhận định kỳ','daily'),
 'dreamRollQuest':('Nhiệm vụ xúc xắc','weekly'),
 'privateSpWish':('Điều ước SP','weekly'),
 'scorePoint1':('Tích điểm vòng quay','weekly'),
 'scorePointStarSign':('Tích điểm cung mệnh','weekly'),
 'dream':('Bàn cờ mộng ước','weekly'),
 **{'dial:'+x:(label,'weekly')for x,label in [('luck','Vòng quay may mắn'),('vip','Vòng quay VIP'),('svip','Vòng quay SVIP'),('shen','Vòng quay thần'),('pay','Vòng quay đặc biệt')]}}

def record(store,key,default=None):
 if store is None:return copy.deepcopy(default if default is not None else {})
 row=store.db.execute('SELECT data FROM ops_records WHERE key=?',(key,)).fetchone()
 return json.loads(row[0])if row else copy.deepcopy(default if default is not None else {})

def put(store,key,value,expected=None):
 row=store.db.execute('SELECT version FROM ops_records WHERE key=?',(key,)).fetchone();version=row[0]if row else 0
 if expected is not None and expected!=version:raise ValueError('Dữ liệu đã được sửa ở cửa sổ khác. Làm mới rồi thử lại.')
 store.db.execute('INSERT INTO ops_records VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data,version=excluded.version,updated=excluded.updated',(key,json.dumps(value,ensure_ascii=False),version+1,int(time.time())))
 return version+1

def revision(store):return store.db.execute('SELECT coalesce(sum(version),0) FROM ops_records').fetchone()[0]

def rewards(value,allow_empty=False):
 from .inventory import entity
 if not isinstance(value,list)or len(value)>30 or not value and not allow_empty:raise ValueError('Cần 1–30 vật phẩm thưởng')
 out=[]
 for r in value:
  if not isinstance(r,dict):raise ValueError('Vật phẩm thưởng không hợp lệ')
  kind=integer(r.get('entityId'),'Item ID',1);count=integer(r.get('count'),'Số lượng',1,10**6);item=entity(kind);extra={}
  if item['type']=='role':
   if count!=1:raise ValueError('Mỗi dòng tướng cần số lượng 1')
   extra={'star':integer(r.get('extra',{}).get('star',1),'Sao tướng',1,7)}
  out.append({'entityId':kind,'count':count,'extra':extra})
 return out

def desc(items):
 return ','.join(str(r['entityId'])+('_star_'+str(r['extra']['star'])if r.get('extra',{}).get('star')else'')+'x'+str(r['count'])for r in items)

def schedule(value):
 if not isinstance(value,dict):raise ValueError('Lịch không hợp lệ')
 start=integer(value.get('start',0),'Bắt đầu',0,4102444800);end=integer(value.get('end',0),'Kết thúc',0,4102444800)
 repeat=value.get('repeat','none');until=value.get('until',0)
 if repeat not in ('none','daily','weekly'):raise ValueError('Chu kỳ không hợp lệ')
 if end<=start:raise ValueError('Kết thúc phải sau bắt đầu')
 step={'none':0,'daily':86400,'weekly':604800}[repeat]
 if step and end-start>step:raise ValueError('Khoảng chạy dài hơn chu kỳ lặp')
 until=integer(until,'Dừng lặp',0,4102444800)
 if until and until<=start:raise ValueError('Dừng lặp phải sau bắt đầu')
 return {'start':start,'end':end,'repeat':repeat,'until':until}

def window(config,now=None):
 now=time.time()if now is None else now;start=config.get('start',0);end=config.get('end',4102444800);step={'daily':86400,'weekly':604800}.get(config.get('repeat'),0)
 index=max(0,int((now-start)//step))if step else 0;a=start+index*step;b=end+index*step;until=config.get('until',0)
 active=config.get('enabled',True)and not config.get('deleted')and a<=now<b and(not until or now<until)
 date=datetime.datetime.fromtimestamp(a,ZONE)
 period=('D:'+date.date().isoformat())if step==86400 else('W:'+str(date.isocalendar().year)+'-'+str(date.isocalendar().week))if step else'once'
 return {'start':a,'end':min(b,until)if until else b,'period':period,'active':bool(active)}

def configured(store,name):return record(store,'activity:'+name)

def is_open(store,name,now=None):
 cfg=configured(store,name)
 return cfg.get('enabled',True)and('start'not in cfg or window(cfg,now)['active'])

def require_open(store,name):
 if not is_open(store,name):raise ValueError('Sự kiện đang đóng hoặc ngoài thời gian chạy')

def validate_activity(name,body):
 if name not in TEMPLATES:raise ValueError('Loại sự kiện chưa được hỗ trợ')
 enabled=body.get('enabled',True)
 if type(enabled)is not bool:raise ValueError('Trạng thái không hợp lệ')
 out={'enabled':enabled,'description':str(body.get('description',''))[:1000]}
 if body.get('schedule'):out.update(schedule(body['schedule']))
 if 'rewards'in body:
  if name not in TEMPLATES or name in ('privateSpWish','privateSelect','dream','scorePoint1','scorePointStarSign')or name.startswith('dial:'):raise ValueError('Loại sự kiện dùng bảng thưởng chuyên biệt')
  rows=body['rewards']
  if not isinstance(rows,list)or len(rows)>32:raise ValueError('Bảng thưởng không hợp lệ')
  out['rewards']=[rewards(r)for r in rows]
 if 'options'in body:
  options=body['options']
  if not isinstance(options,dict):raise ValueError('Thiết lập không hợp lệ')
  if name=='privateSpWish':
   out['options']={'costGem':integer(options.get('costGem',300),'Gem mỗi lượt',1,100000),'dailyGemLimit':integer(options.get('dailyGemLimit',10),'Lượt gem/ngày',1,1000),'maxLuck':integer(options.get('maxLuck',20),'Bảo hiểm SP',2,1000)}
  elif name=='privateSelect':
   choices=options.get('choices',[])
   if not isinstance(choices,list)or len(choices)!=3:raise ValueError('Cần đúng 3 lựa chọn quà')
   out['options']={'choices':[rewards(r)for r in choices]}
  elif name in ('scorePoint1','scorePointStarSign'):
   scores=options.get('scores',[10,30,50,100,200]);boxes=options.get('boxes',[[{'entityId':120,'count':1}]]*5)
   if not isinstance(scores,list)or len(scores)!=5 or sorted(set(scores))!=scores:raise ValueError('Cần 5 mốc tăng dần, không trùng')
   for s in scores:integer(s,'Mốc điểm',1,10**6)
   if not isinstance(boxes,list)or len(boxes)!=5:raise ValueError('Cần 5 rương thưởng')
   out['options']={'scores':scores,'boxes':[rewards(r)for r in boxes]}
  elif name=='dream':
   tiles=options.get('tiles',[])
   if not isinstance(tiles,list)or len(tiles)!=4:raise ValueError('Cần 4 nhóm thưởng ô bàn cờ')
   out['options']={'tiles':[rewards(r)for r in tiles],'lap':rewards(options.get('lap',[]))}
  else:raise ValueError('Sự kiện này không có thiết lập nâng cao')
 return out

def prizes(store):
 from .activities import PRIZES
 value=record(store,'wheel-prizes')
 return [tuple(r)for r in value]if value else PRIZES

def validate_prizes(rows):
 if not isinstance(rows,list)or len(rows)!=8:raise ValueError('Client cần đúng 8 ô vòng quay')
 out=[]
 for r in rows:
  reward=rewards([r])[0]
  from .inventory import entity
  if entity(reward['entityId'])['type']=='role':raise ValueError('Vòng quay 8 ô dùng vật phẩm; tướng chỉnh ở gacha/SP')
  out.append([reward['entityId'],reward['count'],integer(r.get('weight'),'Trọng số',1,10**9)])
 return out

def custom_events(store):return []if store is None else [json.loads(r[0])for r in store.db.execute('SELECT data FROM events')]

def apply(store,p):
 now=time.time();maps=p['activity']['map']
 for name in TEMPLATES:
  cfg=configured(store,name)
  target=maps.get(name)
  if name in p['activity'].get('scorePointInfoMap',{}):target=p['activity']['scorePointInfoMap'][name]['activityItem']
  if name=='dream':target=p['activity']['dream']['activityItem']
  if not target:continue
  if cfg.get('description'):target['desc']=cfg['description']
  if 'start'in cfg:target.update(start_time=cfg['start']*1000,end_time=cfg['end']*1000);w=window(cfg,now);target.update(start_time=w['start']*1000,end_time=w['end']*1000)
  if not is_open(store,name,now):target.update(start_time=0,end_time=1)
  overrides=cfg.get('rewards',[])
  for i,items in enumerate(overrides):
   if i<len(target.get('rewards',[])):target['rewards'][i]['dropListDesc']=desc(items)
  options=cfg.get('options',{})
  if name=='privateSpWish':target.update(costGem=options.get('costGem',300),costGemMaxTiems=options.get('dailyGemLimit',10),maxLuck=options.get('maxLuck',20))
  if name.startswith('scorePoint')and options:
   target.update(needScoresDesc=json.dumps(options['scores']),boxDropListDescs=[desc(r)for r in options['boxes']])
  if name=='privateSelect'and options:
   target['selectDropListDescs']=[desc(r)for r in options['choices']];selected=p['privateActivities'].get('selected',0)
   target['rewards'][0]['dropListDesc']=target['selectDropListDescs'][selected]
  if name=='dream'and options:
   from .activities import EVENT_TILES
   target['fillReward']=desc(options['lap']);target['rewardMap']={str(i):'event'if i in EVENT_TILES else desc(options['tiles'][(i-1)%4])for i in range(1,59)}
 # Old custom DTOs are removed with a tombstone by state.delta when disabled/deleted.
 for key in p.get('privateManagedEventIds',[]):maps.pop(key,None)
 ids=[]
 for item in custom_events(store):
  if item.get('deleted'):continue
  key=item['id'];ids.append(key);w=window(item,now);claimed=store.db.execute('SELECT 1 FROM event_claims WHERE event=? AND player=?',(key,p['id'])).fetchone()if w['period']=='once'else store.db.execute('SELECT 1 FROM event_window_claims WHERE event=? AND player=? AND period=?',(key,p['id'],w['period'])).fetchone()
  loot=item.get('rewards')or([{'entityId':102,'count':item['gem'],'extra':{}}]if item.get('gem')else[])
  level=item.get('minLevel',1);goal=requirement(item.get('requirement'));progress=event_progress(store,p,item,now);eligible=p['level']>=level and progress>=goal['target']
  text=item.get('name',key)if goal['metric']=='none'else EVENT_METRICS[goal['metric']]+': '+str(progress)+' / '+str(goal['target'])
  maps[key]={'name':key,'title':item.get('name',key),'type':'login','desc':item.get('description')or item.get('name',key),'resId':126,'priority':item.get('priority',200),'start_time':w['start']*1000 if item.get('enabled',True)else 0,'end_time':w['end']*1000 if item.get('enabled',True)else 1,'reachMap':{'playerLevel':p['level']},'rewards':[{'dropListDesc':desc(loot),'needMap':{'playerLevel':level},'status':3 if claimed else 2 if w['active']and eligible else 1,'desc':text,'desci18n':text}]}
 p['privateManagedEventIds']=ids


def event_save(body,existing=None):
 name=str(body.get('id','')).strip()
 reserved={'__proto__','constructor','prototype','firstTopUp','againTopUp','againTopUp2','buyCard7day','login8day','triggerTopUp','online_reward','signIn','exchange','dial','payRank','payRankAllServer','costGemRankAllServer','powerRank','pointRankAllServer','dialSvipRankAllServer','task_active2','task_active_advanced','task_active_advanced2','returnGift2','loginReward','login_2','acePack1','acePack2','daily_ticket'}
 if not re.fullmatch(r'[\w -]{1,64}',name)or name in TEMPLATES or name in reserved:raise ValueError('ID sự kiện cần 1–64 chữ/số/gạch, không trùng event hệ thống')
 title=str(body.get('name','')).strip()
 if not title or len(title)>100:raise ValueError('Tên sự kiện cần 1–100 ký tự')
 out={'id':name,'name':title,**schedule(body),'enabled':body.get('enabled',True),'description':str(body.get('description',''))[:1000],'minLevel':integer(body.get('minLevel',1),'Cấp tối thiểu',1,200),'priority':integer(body.get('priority',200),'Thứ tự',1,10000)}
 out['requirement']=requirement(body.get('requirement',(existing or {}).get('requirement')))
 if type(out['enabled'])is not bool:raise ValueError('Trạng thái không hợp lệ')
 if 'rewards'in body:out.update(rewards=rewards(body['rewards']),gem=0)
 else:out['gem']=integer(int(body.get('gem',0)),'Gem thưởng',0)
 if not out.get('rewards')and not out['gem']:raise ValueError('Cần ít nhất một phần thưởng')
 if existing and existing.get('deleted'):raise ValueError('ID đã lưu trữ, hãy tạo ID mới để giữ lịch sử nhận thưởng')
 return out


def claim_custom(store,p,name,index):
 if index!=0:raise ValueError('Sự kiện chỉ có phần thưởng số 0')
 row=store.db.execute('SELECT data FROM events WHERE id=?',(name,)).fetchone()
 if not row:raise ValueError('Event không tồn tại')
 item=json.loads(row[0]);w=window(item)
 if not w['active']or p['level']<item.get('minLevel',1):raise ValueError('Sự kiện đóng hoặc chưa đủ cấp')
 goal=requirement(item.get('requirement'))
 if event_progress(store,p,item)<goal['target']:raise ValueError('Chưa đạt mốc sự kiện: '+objective_label(item))
 if w['period']=='once':store.db.execute('INSERT INTO event_claims VALUES(?,?)',(name,p['id']))
 else:store.db.execute('INSERT INTO event_window_claims VALUES(?,?,?)',(name,p['id'],w['period']))
 from .adventure import grant
 loot=item.get('rewards')or([{'entityId':102,'count':item['gem'],'extra':{}}]if item.get('gem')else[])
 return grant(p,loot)


def calendar(store,start,end):
 integer(start,'Từ ngày',0,4102444800);integer(end,'Đến ngày',0,4102444800)
 if not 0<end-start<=366*86400:raise ValueError('Xem lịch tối đa 366 ngày')
 events=[]
 rows=custom_events(store)+[{**cfg,'id':name,'name':title,'source':'builtin'}for name,(title,_)in TEMPLATES.items()if'start'in(cfg:=configured(store,name))]
 for e in rows:
  if e.get('deleted'):continue
  step={'daily':86400,'weekly':604800}.get(e.get('repeat'),0);i=max(0,(start-e['end'])//step)if step else 0
  while True:
   a=e['start']+i*step;b=e['end']+i*step;until=e.get('until',0)
   if a>=end or until and a>=until:break
   if b>start:events.append({'id':e['id'],'name':e.get('name',e['id']),'start':a,'end':min(b,until)if until else b,'enabled':e.get('enabled',True),'source':e.get('source','custom'),'repeat':e.get('repeat','none')})
   if not step:break
   i+=1
   if len(events)>2000:raise ValueError('Lịch quá dày, hãy thu hẹp khoảng ngày')
 return events
