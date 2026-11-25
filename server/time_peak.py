"""Private Time Peak adapter for incomplete shipped map content; no claimed original rules."""
import copy,json,math,secrets,time
from functools import lru_cache
from .profile import table,character
from .rules import constants
from .state import integer,snapshot,delta
from .battle import validate_team,build_team,validate_records,simulate_async
from .arena import npc,raw_team,combat_raw
from .adventure import grant,map_info,stars
from .inventory import entity
from .item_actions import description
from .cooperative import equivalent
from .progression import recalculate,learn_skills
ROUTES={'logic.timePeakHandler.'+a for a in ('openMap','closeMap','challenge','selectBlessing','borrowRole','spa','altar','openBox','setStatus','recordLog','setExtInfo','getBlessing','updateBattleInfo')}
BEGIN_ROUTE='logic.privateHandler.beginTimePeak'
BLESSINGS={900001:{'name':'Private precision','skillId':3011},900002:{'name':'Private attack','skillId':3021},900003:{'name':'Private recovery','skillId':3041}}
@lru_cache(None)
def configs():return ({r['kindId']:r for r in table('timePeakBmap')},{r['kindId']:r for r in table('timePeakSmap')})
def refresh(p):
    before=json.dumps(p,sort_keys=True);s=p.setdefault('timePeak',{});defaults={'bmapId':0,'version':0,'smapStatusMap':{},'selfInfo':{'hpMap':{},'mpMap':{}},'challengerInfoMap':{},'winSmapIds':[],'blessingIds':[],'privateBlessingIds':[],'blessingIdGetTimeMap':{},'challengeWinTimeList':[],'borrowedRoleMap':{},'clearedSmapIds':{},'extInfo':{},'blessingOffers':{}}
    for k,v in defaults.items():s.setdefault(k,copy.deepcopy(v))
    return before!=json.dumps(p,sort_keys=True)
def admit(p):
    if p['level']<constants('server.TIME_PEAK.CONSTS.INIT_BATTLE_LEVEL'):raise ValueError('Time Peak riêng mở từ cấp 50')
def state(p):
    if not p['timePeak']['bmapId']:raise ValueError('Cần mở bản đồ Time Peak trước')
    return p['timePeak']
def tile_list(bmap):return sorted((r for r in configs()[1].values()if r['bmapId']==bmap),key=lambda r:r['no'])
def complete(s,t):return s['smapStatusMap'].get(str(t['kindId']))==(3 if t['type']==1 else 2)
def current(s):return next((t for t in tile_list(s['bmapId'])if not complete(s,t)),None)
def tile(p,sid,types=None):
    integer(sid,'Ô bản đồ',1);s=state(p);t=configs()[1].get(sid)
    if not t or t['bmapId']!=s['bmapId']or types and t['type']not in types:raise ValueError('Ô hoặc thao tác không phù hợp')
    pending=current(s)
    if not complete(s,t)and (not pending or pending['kindId']!=sid):raise ValueError('Cần hoàn thành ô phía trước')
    return s,t

def finish(s,t):
    s['smapStatusMap'][str(t['kindId'])]=3 if t['type']==1 else 2;s['clearedSmapIds'][str(t['kindId'])]=True;s['version']+=1

def borrowed(p):
    fake=copy.deepcopy(p);fake['team']['roles'].update(copy.deepcopy(p['timePeak']['borrowedRoleMap']));return fake

def opponent(p,t):
    # Every shipped Time Peak mob reference is unresolved. Use an explicitly
    # private robot template instead of pretending those mobs were recovered.
    s=p['timePeak'];key=str(t['kindId'])
    if key not in s['challengerInfoMap']:
        other=npc(20);other['id']=-700000-t['kindId'];other['name']='Private Time Peak '+str(t['no']);raw=raw_team(other);factor=1+(.25*(t.get('extra')or{}).get('enemyType',1));role=raw['roles'][0]
        for k in ('hp','atk','def','mdef'):role['attr'][k]=math.floor(role['attr'][k]*factor)
        role['attr']['maxHp']=role['attr']['hp'];s['challengerInfoMap'][key]=raw
    return s['challengerInfoMap'][key]

def camp(p):
    result={}
    for i,class_id in enumerate((1,2,3),1000001):
        r=character(min(x['kindId']for x in table('role')if x['classId']==class_id),i);r['level']=50;fake=copy.deepcopy(p);fake['team']['roles']={str(i):r};recalculate(fake,r);learn_skills(r);result[str(i)]=r
    return result

def view(p):
    s=p['timePeak'];t=current(s)if s['bmapId']else None;temp={'policy':'private-time-peak-v1','currentTile':copy.deepcopy(t),'mapComplete':bool(s['bmapId']and not t),'blessings':[{**v,'kindId':k}for k,v in BLESSINGS.items()]}
    if t and t['type']==1:temp['defenseTeam']=opponent(p,t)
    if t and t['type']==5:temp['borrowRoles']=camp(p)
    return temp

def begin(store,account,args):
    with store.transaction():
        p=store.player(account);admit(p);before=snapshot(p);s,t=tile(p,args.get('smapId'),(1,))
        if complete(s,t)or s['smapStatusMap'].get(str(t['kindId']))==2:raise ValueError('Trận đã thắng, hãy chọn blessing')
        fake=borrowed(p);indices=validate_team(fake,args.get('teamIndexs'));ships=args.get('shipIdxs',[]);team=build_team(fake,indices,ships);ships=list(map(str,ships));hp=s['selfInfo']['hpMap'];mp=s['selfInfo']['mpMap']
        for r in team['roles']:
            key=str(r['idx']);r['maxHp']=r['hp'];r['hp']=min(r['hp'],hp.get(key,r['hp']));r['mp']=mp.get(key,0)
            if r['hp']<=0:raise ValueError('Chiến binh đã bị hạ')
        team['skills']=[{'kindId':BLESSINGS[i]['skillId'],'level':1}for i in s['privateBlessingIds']];defense=combat_raw(opponent(p,t));slot='timePeak';prior=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],slot)).fetchone()
        if prior and prior['expires']>time.time():
            v=json.loads(prior['data'])
            if v['version']==s['version']and v['smapId']==t['kindId']and v['indices']==indices and v['ships']==ships:return delta(before,p,BEGIN_ROUTE,{'seed':v['seed'],'team1':v['team'],'team2':v['defender']})
        v={'version':s['version'],'smapId':t['kindId'],'indices':indices,'ships':ships,'team':team,'defender':defense,'seed':secrets.randbelow(2**31-1)+1};store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],slot,json.dumps(v),int(time.time())+900));store.save(p);return delta(before,p,BEGIN_ROUTE,{'seed':v['seed'],'team1':team,'team2':defense})

async def challenge(store,account,args):
    p=store.player(account);admit(p);r=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='timePeak'",(p['id'],)).fetchone()
    if not r or r['expires']<=time.time():raise ValueError('Trận Time Peak không tồn tại hoặc hết hạn')
    run=json.loads(r['data']);s,t=tile(p,args.get('smapId'),(1,))
    if type(args.get('seed'))is not int or args['seed']!=run['seed']or type(args.get('isWin'))is not bool or run['version']!=s['version']or run['smapId']!=t['kindId']:raise ValueError('Trận Time Peak không khớp')
    records=args.get('manualRecordMap',{});validate_records(records);integer(args.get('tickNumber'),'Tick',1,10000);out=await simulate_async({'mode':'timePeak','team':run['team'],'defender':run['defender'],'seed':run['seed'],'manualRecordMap':records})
    ah={str(x['idx']):x['hp']if out['isWin']else 0 for x in out['attacker']['roles']};am={str(x['idx']):x.get('mp',0)for x in out['attacker']['roles']};dh={str(x['idx']):x['hp']for x in out['defender']['roles']};dm={str(x['idx']):x.get('mp',0)for x in out['defender']['roles']}
    if out['isWin']!=args['isWin']or out['tickNumber']!=args['tickNumber']or any(not equivalent(args.get(k),v)for k,v in (('selfHpMap',ah),('selfMpMap',am),('challengerHpMap',dh),('challengerMpMap',dm))):raise ValueError('HP/MP, kỹ năng hoặc kết quả không khớp engine')
    with store.transaction():
        check=store.db.execute("SELECT *FROM pvp_runs WHERE player=?AND mode='timePeak'",(p['id'],)).fetchone();p=store.player(account);before=snapshot(p);s,t=tile(p,args['smapId'],(1,))
        if not check or check['data']!=r['data']or check['expires']<=time.time()or s['version']!=run['version']:raise ValueError('Trận đã xử lý hoặc bản đồ thay đổi')
        s['selfInfo']['hpMap'].update(ah);s['selfInfo']['mpMap'].update(am);raw=s['challengerInfoMap'][str(t['kindId'])]
        for x in raw['roles']:x['attr']['hp']=dh[str(x['idx'])];x['mp']=dm[str(x['idx'])]
        if out['isWin']:
            s['smapStatusMap'][str(t['kindId'])]=2;s['winSmapIds'].append(t['kindId']);s['challengeWinTimeList'].append(int(time.time()*1000))
        s['version']+=1;store.db.execute("DELETE FROM pvp_runs WHERE player=?AND mode='timePeak'",(p['id'],));store.save(p);return delta(before,p,'logic.timePeakHandler.challenge',view(p))

async def handle(store,account,route,args):
    if route==BEGIN_ROUTE:return begin(store,account,args)
    if route not in ROUTES:raise ValueError('Thao tác Time Peak không tồn tại')
    action=route.rsplit('.',1)[-1]
    if action=='challenge':return await challenge(store,account,args)
    with store.transaction():
        p=store.player(account);admit(p);before=snapshot(p);s=p['timePeak'];temp={}
        if action=='openMap':
            mid=integer(args.get('bmapId'),'Bản đồ',1);b=configs()[0].get(mid)
            if not b:raise ValueError('Bản đồ không tồn tại')
            if s['bmapId']and s['bmapId']!=mid:raise ValueError('Cần đóng bản đồ hiện tại trước')
            if not s['bmapId']:
                parent,sm=map_info(b['unlockSmapId'])
                if not stars(p,parent,sm['kindId']):raise ValueError('Cần vượt ải mở khóa trong bảng gốc')
                previous=next((x for x in configs()[0].values()if x['group']==b['group']and x['no']==b['no']-1),None)
                if previous:
                    tiles=tile_list(previous['kindId']);rate=sum(bool(s['clearedSmapIds'].get(str(x['kindId'])))for x in tiles)/len(tiles)
                    if rate<constants('server.TIME_PEAK.CONSTS.PRE_MAP_NEED_COMPLETE_RATE'):raise ValueError('Cần hoàn thành 60% bản đồ trước')
                if b['group']==2 and time.time()*1000-p['ctime']<constants('server.TIME_PEAK.CONSTS.GROUP2_OPEN_DAYS')*86400000:raise ValueError('Nhóm hai mở sau 14 ngày tạo nhân vật')
                s.update(bmapId=mid,smapStatusMap={},selfInfo={'hpMap':{},'mpMap':{}},challengerInfoMap={},winSmapIds=[],blessingIds=[],privateBlessingIds=[],blessingIdGetTimeMap={},challengeWinTimeList=[],borrowedRoleMap={},blessingOffers={},version=s['version']+1)
        elif action=='closeMap':
            state(p);s['bmapId']=0;s['version']+=1;store.db.execute("DELETE FROM pvp_runs WHERE player=?AND mode='timePeak'",(p['id'],))
        elif action in ('getBlessing','selectBlessing'):
            s,t=tile(p,args.get('smapId'),(1,));sid=str(t['kindId'])
            if s['smapStatusMap'].get(sid)!=2:raise ValueError('Chỉ chọn blessing sau trận thắng đang chờ')
            offers=s['blessingOffers'].setdefault(sid,list(BLESSINGS));temp['blessingIds']=offers
            if action=='selectBlessing':
                bid=integer(args.get('blessingId'),'Blessing',1)
                if bid not in offers:raise ValueError('Blessing không nằm trong lựa chọn đã cấp')
                if bid not in s['privateBlessingIds']:s['privateBlessingIds'].append(bid);s['blessingIdGetTimeMap'][str(bid)]=int(time.time()*1000)
                finish(s,t)
        elif action in ('borrowRole','spa','altar','openBox','setStatus'):
            expected={'borrowRole':(5,),'spa':(4,),'altar':(6,),'openBox':(2,3),'setStatus':(7,8)};s,t=tile(p,args.get('smapId'),expected[action])
            if complete(s,t):raise ValueError('Ô đã dùng xong')
            if action=='borrowRole':
                idx=args.get('roleIdx');catalog=camp(p)
                if type(idx)not in (str,int)or str(idx)not in catalog:raise ValueError('Chiến binh mượn không hợp lệ')
                s['borrowedRoleMap'][str(idx)]=catalog[str(idx)]
            elif action in ('spa','altar'):
                fake=borrowed(p)
                for key,r in fake['team']['roles'].items():
                    maximum=build_team(fake,[key],[])['roles'][0]['hp'];hp=s['selfInfo']['hpMap'].get(key,maximum)
                    if action=='spa'and hp>0:s['selfInfo']['hpMap'][key]=min(maximum,hp+maximum*.5)
                    if action=='altar'and hp<=0:s['selfInfo']['hpMap'][key]=maximum*.5;s['selfInfo']['mpMap'][key]=0
            elif action=='openBox':
                rewards=description(t.get('extra'))
                try:
                    for x in rewards:entity(x['entityId'])
                except ValueError:rewards=[{'entityId':102,'count':10,'extra':{}}]
                if store.db.execute('INSERT OR IGNORE INTO time_peak_claims VALUES(?,?)',(p['id'],t['kindId'])).rowcount:temp['entityCountMap']=grant(p,rewards)
                else:temp['entityCountMap']={}
            elif type(args.get('status'))is not int or args['status']!=2:raise ValueError('Điểm dừng chỉ được hoàn thành, không đổi trạng thái chiến đấu')
            finish(s,t)
        elif action=='setExtInfo':
            state(p);key=args.get('key');value=args.get('value');valid=(key=='selectedPage'and type(value)is int and 0<=value<46)or(key=='autoBattle'and type(value)is bool)or(key=='note'and isinstance(value,str)and len(value)<=200)or(key=='camera'and isinstance(value,dict)and set(value)=={'x','y'}and all(type(v)in (int,float)and math.isfinite(v)and abs(v)<=100000 for v in value.values()))
            if not valid:raise ValueError('Chỉ lưu thiết lập giao diện Time Peak đã định nghĩa')
            s['extInfo'][key]=value
        elif action=='recordLog':
            state(p);text=args.get('text')
            if not isinstance(text,str)or not 1<=len(text)<=2048:raise ValueError('Nhật ký dài 1–2048 ký tự')
            store.audit('time_peak_log',{'player':p['id'],'text':text})
        elif action=='updateBattleInfo':
            state(p)
            for k,v in (('selfHpMap',s['selfInfo']['hpMap']),('selfMpMap',s['selfInfo']['mpMap']),('challengerInfoMap',s['challengerInfoMap']),('winSmapIds',s['winSmapIds'])):
                if not equivalent(args.get(k),v):raise ValueError('Đồng bộ không được tự đổi máu, đối thủ hay chiến thắng')
            s['lastVerifiedSync']=int(time.time()*1000)
        temp.update(view(p));store.save(p);return delta(before,p,route,temp)
