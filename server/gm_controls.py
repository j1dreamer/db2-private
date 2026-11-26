"""Private GM controls. Permissions are checked by the calling authenticated API."""
from .state import integer
from .profile import table
from .progression import recalculate,learn_skills,max_level,friendships

def set_player(p,values):
    allowed={'level','vipLevel','gem','coin','actionPoint','skillPoint'}
    if not isinstance(values,dict)or not values or set(values)-allowed:raise ValueError('Chỉ chỉnh cấp, VIP và tài nguyên được liệt kê')
    for key,value in values.items():
        if key=='level':
            p['level']=integer(value,'Cấp người chơi',1,100);p['experience']=0
            p['nextLevelExp']=next(r['playerExp']for r in table('experience')if r['level']==value)
            p['timesMaxMap']['actionPoint']=60+value
        elif key=='vipLevel':
            levels={r['level']:r for r in table('vip')};level=integer(value,'Cấp VIP',0,max(levels));p['vip']['level']=level
            p['vip']['topUpGem']=levels[level-1]['nextLevelTopUpGem']if level else 0
            p['privateVIPGrant']=True;p['timesMaxMap']['skillPoint']=5+levels[level]['increaseSkillPointMax']
        else:p[key]=integer(value,key,0,10**9)
    for role in p['team']['roles'].values():recalculate(p,role)
    friendships(p)

def set_role(p,args):
    index=str(integer(args.get('teamIndex'),'Ô tướng',1));role=p['team']['roles'].get(index)
    if not role:raise ValueError('Tướng không thuộc người chơi')
    values=args.get('values')
    if not isinstance(values,dict)or not values or set(values)-{'level'}:raise ValueError('Chỉ chỉnh cấp tướng')
    role['level']=integer(values.get('level'),'Cấp tướng',1,max_level(p,role));role['experience']=0
    role['nextLevelExp']=next(r['roleExp']for r in table('experience')if r['level']==role['level'])
    learn_skills(role);recalculate(p,role);friendships(p)

def catalog(args):
    from .inventory import entities
    from .admin import item_view,search_key
    query=args.get('q','');typ=args.get('type','');page=integer(args.get('page',1),'Trang',1,10000)
    if not isinstance(query,str)or len(query)>80 or not isinstance(typ,str):raise ValueError('Bộ lọc không hợp lệ')
    rows=list(entities().values());types=sorted({r['type']for r in rows})
    if typ and typ not in types:raise ValueError('Loại vật phẩm không hợp lệ')
    query=search_key(query);rows=[r for r in rows if(not typ or r['type']==typ)]
    views=[item_view(r)for r in rows];views=[v for v in views if not query or query in search_key(str(v['id'])+' '+v['name']+' '+v['originalName'])];views.sort(key=lambda r:r['id'])
    pages=max(1,(len(views)+7)//8);page=min(page,pages)
    return {'items':views[(page-1)*8:page*8],'page':page,'pages':pages,'total':len(views),'types':types}
