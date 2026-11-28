"""Editable private economy layered over ENG shops; never payment attestation."""
import copy,json
from . import liveops
from .state import integer
from .inventory import entity
from .profile import table

KEY='economy:'

def version(store,key):
 if store is None:return 0
 row=store.db.execute('SELECT version FROM ops_records WHERE key=?',(KEY+key,)).fetchone()
 return row[0]if row else 0

def reward_settings(store=None):
 return liveops.record(store,KEY+'rewards',{'stars14':[{'entityId':2,'count':1,'extra':{}}],'stars21':[{'entityId':2,'count':2,'extra':{}}],'expedition':[{'entityId':2,'count':1,'extra':{}}],'sixExpedition':[{'entityId':2,'count':1,'extra':{}}],'voucherExpiryMinute':1439})

def star_bonus(store,threshold):return copy.deepcopy(reward_settings(store).get('stars'+str(threshold),[]))
def expedition_bonus(store,six,floor):
 from .expedition import cfg
 return copy.deepcopy(reward_settings(store)['sixExpedition'if six else'expedition'])if floor==cfg(six)['CHALLENGER_COUNT']else[]

def shop_settings(store,kind):
 from .rules import constants
 return liveops.record(store,KEY+'shop:'+str(kind),{'hours':constants('server.SHOP.CONSTS.REFRESH_HOURS_MAP')[str(kind)],'rows':{}})

def base_shop_row(row):
 value=copy.deepcopy(row)
 # ENG uses currency 97 for top arena; shipped shop 13 still references removed 84.
 if value['type']==13 and value['requireEntityId']==84:
  from .rules import constants
  value['requireEntityId']=constants('server.CONSTS.ENTITY_ID.TOP_ARENA_3V3_COIN')
 return value

def shop_rows(store,kind):
 edits=shop_settings(store,kind)['rows']
 return [{**base_shop_row(r),**edits.get(str(r['kindId']),{})}for r in table('shop')if r['type']==kind and edits.get(str(r['kindId']),{}).get('enabled',True)]

def shop_stamp(store,kind):return str(version(store,'shop:'+str(kind)))

def goods(store=None):
 from .commerce import GOODS
 edits=liveops.record(store,KEY+'goods',{})
 return {k:{**copy.deepcopy(v),**edits.get(str(k),{})}for k,v in GOODS.items()}

def exchanges(store=None):
 from .commerce import EXCHANGES
 edits=liveops.record(store,KEY+'exchanges',{})
 return {k:{**copy.deepcopy(v),**edits.get(k,{})}for k,v in EXCHANGES.items()}

def active(offer):return liveops.window(offer)['active']

def save(store,body):
 section=body.get('section');expected=body.get('version')
 if section=='rewards':
  value={k:liveops.rewards(body.get(k,[]),allow_empty=True)for k in ('stars14','stars21','expedition','sixExpedition')}
  value['voucherExpiryMinute']=integer(body.get('voucherExpiryMinute',1439),'Phút hết hạn',0,1439)
  liveops.put(store,KEY+'rewards',value,expected);return
 if section=='shop':
  kind=integer(body.get('shopType'),'Shop',1,14);current=shop_settings(store,kind)
  hours=body.get('hours',current['hours'])
  if not isinstance(hours,list)or not hours or sorted(set(hours))!=hours:raise ValueError('Giờ làm mới cần tăng dần, không trùng')
  for hour in hours:integer(hour,'Giờ',0,23)
  rows=copy.deepcopy(current['rows']);changes=body.get('rows',[])
  if not isinstance(changes,list)or len(changes)>1000:raise ValueError('Danh sách shop không hợp lệ')
  source={r['kindId']:base_shop_row(r)for r in table('shop')if r['type']==kind}
  for r in changes:
   ident=integer(r.get('kindId'),'Mã hàng',1)
   if ident not in source:raise ValueError('Mã hàng không thuộc shop')
   out={k:integer(r.get(k,source[ident][k]),k,lo,hi)for k,lo,hi in [('entityId',1,10**9),('requireEntityId',1,10**9),('price',0,10**9),('minCount',1,10**6),('maxCount',1,10**6),('weight',0,10**9),('requireVip',0,16)]}
   if out['maxCount']<out['minCount']:raise ValueError('Số lượng tối đa phải >= tối thiểu')
   entity(out['entityId']);entity(out['requireEntityId'])
   if entity(out['requireEntityId'])['type']=='role':raise ValueError('Không dùng tướng trong đội làm tiền mua shop')
   if entity(out['entityId'])['type']=='role':raise ValueError('Shop dùng mảnh/vật phẩm; tướng nguyên dùng gacha/SP')
   out['enabled']=r.get('enabled',True);out['isUnlimit']=r.get('isUnlimit',bool(source[ident]['isUnlimit']))
   if type(out['enabled'])is not bool or type(out['isUnlimit'])is not bool:raise ValueError('Trạng thái không hợp lệ')
   rows[str(ident)]=out
  liveops.put(store,KEY+'shop:'+str(kind),{'hours':hours,'rows':rows},expected);return
 if section=='goods':
  from .commerce import GOODS
  ident=integer(body.get('id'),'Gói',1)
  if ident not in GOODS:raise ValueError('Chỉ sửa gói đã có màn tương thích')
  value={'name':str(body.get('name',GOODS[ident]['name'])).strip()[:80],'cost':integer(body.get('cost'),'Giá Gem',1,10**9),'point':integer(body.get('point'),'Giá vé nạp',1,10**9),'limit':integer(body.get('limit'),'Giới hạn/ngày',1,10000),'rewards':liveops.desc(liveops.rewards(body.get('rewards',[]))),'enabled':body.get('enabled',True)}
  if type(value['enabled'])is not bool:raise ValueError('Trạng thái không hợp lệ')
  if body.get('schedule'):value.update(liveops.schedule(body['schedule']))
  edits=liveops.record(store,KEY+'goods',{});edits[str(ident)]=value
  liveops.put(store,KEY+'goods',edits,expected);return
 if section=='exchanges':
  from .commerce import EXCHANGES
  name=body.get('name')
  if name not in EXCHANGES:raise ValueError('Nhóm đổi không tồn tại')
  value={'enabled':body.get('enabled',True),'list':[]}
  if name!='exchange2':
   value['moneyId']=integer(body.get('moneyId',EXCHANGES[name]['moneyId']),'Tiền đổi',1);entity(value['moneyId'])
   if entity(value['moneyId'])['type']=='role':raise ValueError('Không dùng tướng trong đội làm tiền đổi')
  if type(value['enabled'])is not bool:raise ValueError('Trạng thái không hợp lệ')
  if body.get('schedule'):value.update(liveops.schedule(body['schedule']))
  rows=body.get('rows',[]);old=exchanges(store)[name]['list']
  if not isinstance(rows,list)or not 1<=len(rows)<=50:raise ValueError('Cần 1–50 dòng đổi')
  if [r.get('id')for r in rows[:len(old)]]!=[r['id']for r in old]:raise ValueError('Giữ mã/thứ tự hàng cũ để bảo toàn lượt mua')
  seen=set()
  for r in rows:
   ident=integer(r.get('id'),'Mã dòng',1,100000)
   if ident in seen:raise ValueError('Mã dòng bị trùng')
   seen.add(ident);limit=integer(r.get('maxBuyTimes'),'Giới hạn/ngày',1,10000)
   if name=='exchange2':
    costs=liveops.rewards(r.get('costs',[]))
    if any(entity(c['entityId'])['type']=='role'for c in costs):raise ValueError('Quầy đổi không thu tướng trong đội')
    row={'id':ident,'maxBuyTimes':limit,'needDesc':liveops.desc(costs),'getDesc':liveops.desc(liveops.rewards(r.get('rewards',[])))}
   else:
    loot=liveops.rewards(r.get('rewards',[]))
    if len(loot)!=1 or entity(loot[0]['entityId'])['type']=='role':raise ValueError('Màn đổi này cần đúng một vật phẩm/mảnh')
    row={'id':ident,'maxBuyTimes':limit,'entityId':loot[0]['entityId'],'count':loot[0]['count'],'extra':loot[0]['extra'],'price':integer(r.get('price'),'Giá',1,10**9)}
   value['list'].append(row)
  edits=liveops.record(store,KEY+'exchanges',{});edits[name]=value
  liveops.put(store,KEY+'exchanges',edits,expected);return
 raise ValueError('Mục kinh tế không tồn tại')

def client_script(store):
 """Update native chapter chest previews on login, without modifying APK/IPA."""
 cfg=reward_settings(store);boxes={}
 for row in table('bmap'):
  if not any(row.get('box'+str(i))for i in (1,2,3)):continue
  boxes[str(row['kindId'])]={}
  for threshold,index in ((14,2),(21,3)):
   base=row.get('box'+str(index))or'';bonus=liveops.desc(cfg['stars'+str(threshold)])
   boxes[str(row['kindId'])]['box'+str(index)]=base+(','if base and bonus else'')+bonus
 data=json.dumps(boxes,separators=(',',':'))
 script='''try{(function(B){var R=window.__require||(typeof require==="function"?require:null),D=R("dataApi"),E=R("buildExt"),G=window.__db2Economy||(window.__db2Economy={});G.boxes=B;function apply(){var B=G.boxes;if(!D.bmap||!D.bmap.data)return;for(var id in B){var r=D.bmap.data[id];if(r)for(var k in B[id])r[k]=B[id][k];}}apply();if(!E.__db2Economy){var old=E.hackDataApi;E.hackDataApi=function(){var out=old?old.apply(this,arguments):undefined;apply();return out;};E.__db2Economy=1;}})('''+data+''');}catch(e){}'''

 # Hide the obsolete floating prototype on older clients too, using their existing hot script hook.
 script+='''try{(function(){if(typeof cc==='undefined')return;function hide(){try{var root=cc.Canvas.instance&&cc.Canvas.instance.node;['PrivateTimePeakButton','PrivateTimePeakPanel'].forEach(function(name){var n=root&&root.getChildByName(name);if(n)n.destroy();});}catch(e){}}var P=window.DB2PrivateTimePeak;if(P){P.mount=hide;P.show=hide;}hide();if(!window.__db2HideTimePeak&&cc.director){window.__db2HideTimePeak=true;cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH,hide);}})();}catch(e){}'''
 script+='''try{(function(){var R=window.__require||(typeof require==="function"?require:null),C=R("serverConfig");C.PLAYER.FUNS.isRobot=function(id){return Number(id)<=0;};})();}catch(e){}'''
 from pathlib import Path
 script+='try{'+(Path(__file__).with_name('native_compat.js')).read_text()+'}catch(e){}'
 return script
