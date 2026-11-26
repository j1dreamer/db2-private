"""Explicitly entitled private-server GM operations; never client self-granted."""
from .inventory import entity
from .state import integer,snapshot,delta
from .gameplay import add_reward
from .team_actions import owned,put_item
from .progression import friendships
ROUTES={'logic.gmHandler.'+name for name in ('addItem','addRole','removeRole')}
def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Thao tác GM không tồn tại')
    with store.transaction():
        p=store.player(account)
        if not p or not p.get('privateGM'):raise ValueError('Tài khoản chưa được quản trị viên cấp quyền GM')
        before=snapshot(p);action=route.rsplit('.',1)[-1];rewards={}
        if action=='removeRole':
            role=owned(p,args.get('teamIndex'))
            if len(p['team']['roles'])<=1:raise ValueError('Phải giữ lại ít nhất một chiến binh')
            for key,item in role['equipments'].items():
                if not key.startswith('evlItem_')and isinstance(item,dict):put_item(p,item)
            key=str(role['idx']);del p['team']['roles'][key]
            p.get('privateRoleBases',{}).pop(key,None);p.get('privateRoleInvestments',{}).pop(key,None)
            store.db.execute('DELETE FROM adventure_runs WHERE player=?',(p['id'],))
            store.db.execute('DELETE FROM pvp_runs WHERE player=?',(p['id'],))
            if len(p['team']['roles'])<3:
                store.db.execute('DELETE FROM multi_ladder WHERE player=?',(p['id'],));p['arena3v3'].update(rank=0,defenseTeamIndexsMap={},defenseShipIndexsMap={})
        else:
            kind=integer(args.get('kindId'),'Vật phẩm',1);row=entity(kind);count=1 if action=='addRole'else integer(args.get('itemCount'),'Số lượng',1,10**6)
            if action=='addRole':
                if row['type']!='role':raise ValueError('ID không phải chiến binh')
                if any(entity(role['kindId'])['classId']==row['classId']for role in p['team']['roles'].values()):raise ValueError('Đã sở hữu chiến binh này')
            extra=args.get('extra',{})
            if not isinstance(extra,dict)or any(key not in ('star','expireTime')for key in extra):raise ValueError('Thuộc tính vật phẩm GM không hợp lệ')
            if row['type']=='role'and 'expireTime'in extra:raise ValueError('Chiến binh không hỗ trợ hạn dùng')
            if 'star'in extra:integer(extra['star'],'Sao',1,20)
            rewards=add_reward(p,{'entityId':kind,'count':count,'extra':extra})
        friendships(p);store.save(p);store.audit('gm_'+action,{'player':p['id'],'args':args})
        return delta(before,p,route,{'entityCountMap':rewards})
