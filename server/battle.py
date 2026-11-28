"""Build trusted combat inputs and execute the recovered deterministic JS engine."""
import asyncio,json,shutil,subprocess,weakref,os
from pathlib import Path
from .profile import table
from .state import integer
from .inventory import active
from .rules import constants
WORKER=Path(__file__).with_name('battle_worker.cjs')

def validate_team(player,indices,maximum=5):
    if not isinstance(indices,list) or not 1<=len(indices)<=maximum:raise ValueError('Chọn 1–5 chiến binh')
    keys=[]
    for value in indices:
        if type(value)not in (int,str) or not str(value).isdigit():raise ValueError('Chiến binh không hợp lệ')
        key=str(int(value))
        if key not in player['team']['roles'] or key in keys:raise ValueError('Đội hình không hợp lệ')
        keys.append(key)
    return keys

def build_team(player,indices,ship_indices=None):
    indices=validate_team(player,indices);ship_indices=ship_indices or []
    if not isinstance(ship_indices,list) or len(ship_indices)>3 or len(set(map(str,ship_indices)))!=len(ship_indices):raise ValueError('Đội hình đồng hành không hợp lệ')
    ship_data={r['kindId']:r for r in table('ship')};ships=[];bonus={k:0 for k in ('hp','atk','def','mdef')}
    for idx in ship_indices:
        item=player['bag']['items'].get(str(idx))
        if not item or item['kindId']not in ship_data or not active(item):raise ValueError('Đồng hành không thuộc nhân vật')
        row=ship_data[item['kindId']]
        for key in bonus:bonus[key]+=item.get('attr',{}).get(key,0)
        ships.append({'kindId':item['kindId'],'star':item.get('star',1),'level':item.get('level',1),'skill':{'kindId':row['skillId'],'level':item.get('skillLevel',1)}})
    roles=[];role_data={r['kindId']:r for r in table('role')}
    suit_ids=constants('server.STAR_SIGN.CONSTS.ATTR_NAME_SUIT_SKILL_IDS_MAP');suits={key:0 for key in suit_ids if key not in ('skipHitRate','hitReduceMpRate','ignoreUnDeBuffRate')}
    for idx in indices:
        r=player['team']['roles'][idx];data=dict(r['attr'])
        for key in bonus:data[key]=data.get(key,0)+bonus[key]
        for key in ('skills','awakeSkills'):
            value=r[key];data[key]=list(value.values()) if isinstance(value,dict) else value
        data.update({key:r.get(key,default) for key,default in [('kindId',0),('idx',0),('level',1),('star',1),('awakeLevel',0),('trainLevelMap',{}),('evolveSkillIds',[]),('mp',0)]})
        suit=r.get('equipments',{}).get('starSignSkillId')
        if suit:
            name=next((name for name,ids in suit_ids.items()if suit in ids),None)
            if name not in suits or suits[name]<suit:
                data['skills']=list(data['skills'])+[{'kindId':suit,'level':0}]
                if name in suits:suits[name]=suit
        data['attr']={**r['attr'],**{key:r['attr'].get(key,0)+value for key,value in bonus.items()}};data['evolveSkillCount']=len(r.get('evolveSkillIds',[]))
        roles.append(data)
    roles.sort(key=lambda r:role_data[r['kindId']]['positionPriority'])
    return {'playerId':player['id'],'roles':roles,'ships':ships,'skills':[]}

def validate_records(records):
    if not isinstance(records,dict) or len(records)>2000:raise ValueError('Lịch sử kỹ năng không hợp lệ')
    for tick,actions in records.items():
        if not isinstance(tick,str) or not tick.isdigit() or not 1<=int(tick)<=10000:raise ValueError('Tick kỹ năng không hợp lệ')
        if not isinstance(actions,list) or len(actions)>100:raise ValueError('Lịch sử kỹ năng không hợp lệ')
        for action in actions:
            if not isinstance(action,dict) or type(action.get('teamId'))is not int or action.get('teamId')not in (1,2):raise ValueError('Đội kỹ năng không hợp lệ')
            integer(action.get('skillId'),'Kỹ năng',1)

def simulate(payload):
    from .node_runtime import resolve_node
    node=resolve_node()
    if os.environ.get('DB2_BATTLE_PERSISTENT','1')=='1':
        from .battle_runtime import simulate as reusable
        return reusable(node,payload)
    try:
        result=subprocess.run([node,str(WORKER)],input=json.dumps(payload),text=True,capture_output=True,timeout=30 if payload.get('mode')in ('bestOfThree','series')else 15,check=True)
        return json.loads(result.stdout)
    except (subprocess.TimeoutExpired,subprocess.CalledProcessError,json.JSONDecodeError) as exc:
        raise ValueError('Không thể kiểm tra trận đấu; kết quả chưa được nhận thưởng') from exc

_limits=weakref.WeakKeyDictionary()
async def simulate_async(payload):
    loop=asyncio.get_running_loop()
    semaphore=_limits.setdefault(loop,asyncio.Semaphore(2))
    try:await asyncio.wait_for(semaphore.acquire(),timeout=5)
    except asyncio.TimeoutError as exc:raise ValueError('Server đang kiểm tra nhiều trận; hãy thử lại, kết quả chưa được nhận')from exc
    worker=asyncio.create_task(asyncio.to_thread(simulate,payload))
    try:
        try:return await asyncio.shield(worker)
        except asyncio.CancelledError:
            try:await worker
            finally:raise
    finally:semaphore.release()
