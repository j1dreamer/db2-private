"""Box previews and an exhaustive, read-only catalog check; never change rewards."""
import re
from pathlib import Path
from .inventory import entities
from .item_actions import description

def box_preview(row):
 from .admin import item_view
 cfg=row.get('extra')or {};groups=[]
 for key,label in [('dropListDesc','Chọn thưởng'if cfg.get('selectCount')else'Thưởng cố định'),('rdDropListDesc','Khả năng rơi ngẫu nhiên')]:
  items=[]
  for part in cfg.get(key,'').split(','):
   part=part.strip()
   if not part:continue
   weight=None;probability=None
   if key=='rdDropListDesc':
    m=re.fullmatch(r'(.+)_([WR])([\d.]+)',part)
    if not m:raise ValueError('Cấu hình ngẫu nhiên không hợp lệ')
    part,typ,value=m.groups();weight=float(value)if typ=='W'else None;probability=float(value)if typ=='R'else None
   for reward in description(part):items.append({**reward,'weight':weight,'probability':probability,'item':item_view(entities()[reward['entityId']])})
  if items:groups.append({'label':label,'random':key=='rdDropListDesc','items':items})
 return {'configurable':not groups,'selectCount':cfg.get('selectCount',0),'exchange':bool(cfg.get('isExchange')),'groups':groups,'source':'client-config'}

def audit_catalog():
 from .admin import ROOT,item_view
 rows=entities();errors=[];boxes=[];image_paths=set()
 for ident,row in rows.items():
  v=item_view(row,True)
  if not v['name'].strip():errors.append({'id':ident,'error':'Tên rỗng'})
  if not v['image']or not (ROOT/'web'/v['image'].lstrip('/')).is_file():errors.append({'id':ident,'error':'Thiếu ảnh'})
  else:image_paths.add(v['image'])
  if row['type']=='box':
   try:
    box=box_preview(row);n=sum(len(g['items'])for g in box['groups'])
    if box['selectCount']and not 0<box['selectCount']<=n:raise ValueError('Số lựa chọn vượt phần thưởng')
    for group in box['groups']:
     for reward in group['items']:
      if reward['count']<1:raise ValueError('Số lượng thưởng không dương')
    boxes.append({'id':ident,'name':v['name'],'choices':n,'configurable':box['configurable'],'selectCount':box['selectCount']})
   except (KeyError,ValueError)as e:errors.append({'id':ident,'error':str(e)})
 return {'items':len(rows),'box_count':len(boxes),'unique_images':len(image_paths),'boxes':boxes,'errors':errors,'native_use_verified':False}
