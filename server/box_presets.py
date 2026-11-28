"""Private, named selection boxes over ENG's per-instance box format (#351)."""
from .profile import table
from .inventory import entity,insert
from .state import integer

def presets():
 from .sp_events import role_catalog
 classes={r['classId']for r in role_catalog()}
 souls=sorted((r for r in table('soul')if r['classId']in classes),key=lambda r:r['classId'])
 if {r['classId']for r in souls}!=classes or len(souls)!=len(classes):raise ValueError('Danh sách mảnh SP chưa đầy đủ')
 return {'sp60':{'id':'sp60','source':'private-server-rule','name':'Rương chọn SP · 60 mảnh','kindId':351,'choices':[{'entityId':r['kindId'],'count':60}for r in souls]}}

def configuration(key):
 preset=presets().get(key)
 if not preset:raise ValueError('Mẫu rương không tồn tại')
 return {'kindName':preset['name'],'desc':'Mở 1 rương: chọn 1 loại mảnh SP, nhận ×60 mảnh. Danh sách tương thích ENG; luật rương riêng của DB2.','imgId':entity(727)['imgId'],'color':7,'dropListDesc':','.join(str(r['entityId'])+'x60'for r in preset['choices']),'selectCount':1}

def grant(player,key,count):
 integer(count,'Số rương',1,100)
 insert(player,351,count,{'privateBoxConfig':configuration(key)})
