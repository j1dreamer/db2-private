"""Previewed bag-only recall with stale-state guards and reversible archives."""
import copy,hashlib,json,re,time
from .state import integer
from . import liveops
PREFIX='inventory-recall:'


def options(body):
 scope=body.get('scope','player')
 if scope not in ('player','server'):raise ValueError('Phạm vi không hợp lệ')
 player=integer(int(body.get('player',0)),'Nhân vật',0)
 kind=integer(int(body.get('kindId',0)),'Item ID',0)
 limit=integer(int(body.get('count',0)),'Số lượng mỗi người',0,10**9)
 slot=str(body.get('slot',''))
 if scope=='player'and not player:raise ValueError('Cần ID nhân vật')
 if scope=='server'and(not kind or slot):raise ValueError('Thu hồi toàn server cần Item ID và không dùng số ô')
 if slot and(not slot.isdecimal()or scope!='player'):raise ValueError('Ô túi không hợp lệ')
 return {'scope':scope,'player':player,'kindId':kind,'count':limit,'slot':slot}


def selection(store,body):
 cfg=options(body);rows=[];players=0
 query='SELECT id,account,data FROM players'+(' WHERE id=?'if cfg['scope']=='player'else'')+' ORDER BY id'
 result=store.db.execute(query,(cfg['player'],)if cfg['scope']=='player'else()).fetchall()
 for record in result:
  p=json.loads(record['data']);remaining=cfg['count']or 10**30;found=False
  for slot,item in sorted(p['bag']['items'].items(),key=lambda pair:int(pair[0])):
   if (cfg['slot']and slot!=cfg['slot'])or(cfg['kindId']and item['kindId']!=cfg['kindId']):continue
   amount=min(item['count'],remaining)
   if amount<=0:continue
   rows.append({'player':p['id'],'account':record['account'],'name':p['name'],'slot':slot,'kindId':item['kindId'],'count':item['count'],'removeCount':amount,'before':copy.deepcopy(item)})
   remaining-=amount;found=True
  players+=int(found)
 digest=hashlib.sha256(json.dumps({'options':cfg,'rows':rows},sort_keys=True,separators=(',',':')).encode()).hexdigest()
 return cfg,rows,{'fingerprint':digest,'players':players,'stacks':len(rows),'count':sum(r['removeCount']for r in rows)}


def preview(store,body):
 cfg,rows,summary=selection(store,body)
 return {'options':cfg,**summary,'items':rows[:200],'truncated':len(rows)>200,'scopeNote':'Chỉ túi đồ; không đụng đội hình, đồ đang trang bị hoặc thư chưa nhận.'}


def recall(store,body):
 cfg,rows,summary=selection(store,body)
 if not cfg['kindId']and not cfg['slot']:raise ValueError('Chọn đúng Item ID hoặc ô túi cần thu hồi')
 if not rows:raise ValueError('Không có vật phẩm phù hợp')
 if body.get('fingerprint')!=summary['fingerprint']:raise ValueError('Kho đã thay đổi; xem trước lại rồi xác nhận')
 # Existing ledger makes retries safe even after later inventory modifications.
 request=str(body.get('requestId',''))
 if not re.fullmatch('[a-f0-9]{32}',request):raise ValueError('Thiếu mã xem trước hợp lệ')
 key=PREFIX+request
 if liveops.record(store,key):raise ValueError('Lượt thu hồi này đã thực hiện; xem lịch sử trước khi thử lại')
 by_player={}
 for line in rows:by_player.setdefault(line['player'],[]).append(line)
 for pid,lines in by_player.items():
  p=json.loads(store.db.execute('SELECT data FROM players WHERE id=?',(pid,)).fetchone()[0])
  for line in lines:
   item=p['bag']['items'][line['slot']];left=item['count']-line['removeCount']
   if left:item['count']=left;line['after']=copy.deepcopy(item)
   else:p['bag']['items'].pop(line['slot']);line['after']=None
  store.save(p)
 liveops.put(store,key,{'id':request,'created':int(time.time()),'restored':False,'options':cfg,'summary':summary,'items':rows})
 return request


def restore(store,body):
 ident=str(body.get('recallId',''))
 if not re.fullmatch('[a-f0-9]{32}',ident):raise ValueError('Mã thu hồi không hợp lệ')
 key=PREFIX+ident;archive=liveops.record(store,key)
 if not archive or archive.get('restored'):raise ValueError('Không có lượt thu hồi chưa phục hồi')
 grouped={}
 for line in archive['items']:grouped.setdefault(line['player'],[]).append(line)
 loaded={}
 for pid,lines in grouped.items():
  row=store.db.execute('SELECT data FROM players WHERE id=?',(pid,)).fetchone()
  if not row:raise ValueError('Nhân vật không còn tồn tại')
  p=json.loads(row[0]);loaded[pid]=p
  for line in lines:
   current=p['bag']['items'].get(line['slot'])
   if current!=line['after']:raise ValueError('Ô túi đã thay đổi sau thu hồi; không ghi đè vật phẩm mới')
   p['bag']['items'][line['slot']]=copy.deepcopy(line['before'])
 for p in loaded.values():store.save(p)
 archive.update(restored=True,restoredAt=int(time.time()));liveops.put(store,key,archive)


def history(store):
 result=[]
 for row in store.db.execute("SELECT data FROM ops_records WHERE key LIKE 'inventory-recall:%' ORDER BY updated DESC LIMIT 30"):
  item=json.loads(row[0]);result.append({k:item[k]for k in ('id','created','restored','options','summary')})
 return result
