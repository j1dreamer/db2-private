"""Resource battlefield: source graph, HP-carry PvP, durable captures and rewards.

Private camps share this server; they are not impersonated remote servers.
Policies not available from the client are documented in IMPLEMENTATION-342.md.
"""
import copy,datetime,json,math,secrets,time
from .rules import constants
from .state import integer,snapshot,delta,consume
from .battle import validate_team,build_team,simulate_async
from . import arena
from .social import public,profile_by_id
from .adventure import grant
from .gameplay import drops
from .practice import notice
MODE='allServerBattle';ZONE=datetime.timezone(datetime.timedelta(hours=7))
ROUTES={'logic.allServerBattleHandler.'+a for a in ('apply','applyRank','beginBattle','endBattle','endTopRankInfo','enter','exit','getReport','getTeam','move','openInfo','receiveAward','recover','winTimesRank','worshipRank','worshipStatue')}
def cfg():return constants('server.ALL_SERVER_BATTLE.CONSTS')
def level_type(level):
    c=cfg();i=max([i for i,n in enumerate(c['LEVEL_BETWEEN'])if level>=n]+[0]);return c['LEVEL_TYPE_BETWEEN'][i]
def times(day):
    c=cfg();start=datetime.datetime.combine(datetime.date.fromisoformat(day),datetime.time(),ZONE);battle=start+datetime.timedelta(hours=c['START_HOURS'],minutes=c['START_MINUTE']);return int(start.timestamp()),int((start+datetime.timedelta(hours=c['APPLY_END_HOURS'])).timestamp()),int(battle.timestamp()),int((battle+datetime.timedelta(minutes=c['DURATION_MINUTE'])).timestamp())
def day_open(day):return (datetime.date.fromisoformat(day).weekday()+1)%7 in cfg()['OPEN_DAYS']
def event_day():
    today=datetime.datetime.fromtimestamp(time.time(),ZONE).date()
    for offset in range(8):
        day=(today+datetime.timedelta(days=offset)).isoformat()
        if day_open(day)and time.time()<times(day)[3]:return day

def registered_level(store,p,day):
    row=store.db.execute('SELECT level FROM resource_registrations WHERE day=?AND player=?',(day,p['id'])).fetchone()if store else None
    return row[0]if row else level_type(p['level'])

def camps():return {str(i):{'id':i,'name':'Private camp '+str(i),'serverId':1,'flagId':i}for i in range(1,4)}
def fresh(day,level):return {'day':day,'level':level,'entries':{},'towers':{str(i):{'teamId':i if i<4 else 0,'playerIds':[]}for i in range(1,23)},'finished':False,'endRanks':[]}
def load(store,day,level,create=True):
    row=store.db.execute('SELECT data FROM resource_rooms WHERE day=?AND level=?',(day,level)).fetchone()
    if row:return json.loads(row[0])
    room=fresh(day,level)
    if create:save_room(store,room)
    return room

def save_room(store,room):store.db.execute('INSERT INTO resource_rooms VALUES(?,?,?)ON CONFLICT(day,level)DO UPDATE SET data=excluded.data',(room['day'],room['level'],json.dumps(room)))
def own_entry(room,p):
    entry=room['entries'].get(str(p['id']))
    if not entry:raise ValueError('Chưa đăng ký chiến trường này')
    return entry

def rank_entries(room,camp=None,wins=False):
    entries=[e for e in room['entries'].values()if (camp is None or e['camp']==camp)and (not wins or e.get('entered'))];return sorted(entries,key=lambda e:(-(e.get('wins',0)if wins else e['power']),e['id']))
def qualifies(room,entry):return entry['id']in [e['id']for e in rank_entries(room,entry['camp'])[:cfg()['JOIN_COUNT']]]
def active(room,p):
    if not times(room['day'])[2]<=time.time()<times(room['day'])[3]:raise ValueError('Chiến trường chưa mở hoặc đã đóng')
    entry=own_entry(room,p)
    if not entry.get('active'):raise ValueError('Chưa vào chiến trường')
    return entry

def alive(entry):return any(hp>0 for hp in entry.get('hp',{}).values())
def raw_alive(entry):
    raw=copy.deepcopy(entry['raw']);raw['roles']=[r for r in raw['roles']if entry['hp'].get(str(r['idx']),0)>0];return raw

def engine_team(entry):
    raw=raw_alive(entry)
    if not raw['roles']:raise ValueError('Đội không còn chiến binh có HP')
    team=arena.combat_raw(raw)
    for role in team['roles']:
        key=str(role['idx']);role.update(hp=entry['hp'][key],maxHp=entry['maxHp'][key],mp=0)
    return team

def locate(room,entry,tower):
    for no,value in room['towers'].items():
        value['playerIds']=[pid for pid in value['playerIds']if pid!=entry['id']]
        if int(no)>3 and not value['playerIds']:value['teamId']=0
    entry['tower']=tower
    if tower:
        target=room['towers'][str(tower)];target['teamId']=entry['camp'];target['playerIds'].append(entry['id'])
    entry['moveAt']=time.time()+cfg()['MOVE_CD'];entry['rewardAt']=time.time()+cfg()['GET_REWARD_CD']

def sync(store,p,room):
    if not store:return
    refresh(store,p);store.save(p);store.notify(p['userId'],'onSync',{'code':200,'extra':{MODE:p['extra'][MODE]}})

def broadcast(store,room,reports=None):
    champions={r['level']:json.loads(r['data'])for r in store.db.execute('SELECT level,data FROM resource_champions')}
    common={'towerInfoMap':room['towers'],'teamInfoMap':camps(),'playerInfoMap':{**champions,**{pid:{**e['public'],'teamId':e['camp'],'winTimes':e.get('wins',0)}for pid,e in room['entries'].items()}}}
    for entry in room['entries'].values():
        if not entry.get('active'):continue
        own={'towerNo':entry['tower'],'moveAt':int(entry.get('moveAt',0)*1000),'rewardAt':int(entry.get('rewardAt',0)*1000),'moveCD':max(0,math.ceil(entry.get('moveAt',0)-time.time())),'getRewardCD':max(0,math.ceil(entry.get('rewardAt',0)-time.time()))}
        if reports and entry['id']in reports:own['reports']=reports[entry['id']]
        store.notify(entry['account'],'onAllServerBattle',{**common,**own})

def refresh(store,p):
    before=json.dumps(p,sort_keys=True);day=event_day();level=registered_level(store,p,day);room=load(store,day,level,False)if store else fresh(day,level);start,close,opened,end=times(day);entry=room['entries'].get(str(p['id']));champions={}
    if store:
        champions={r['level']:json.loads(r['data'])for r in store.db.execute('SELECT level,data FROM resource_champions')}
    player_map={**champions,**{pid:{**e['public'],'teamId':e['camp'],'winTimes':e.get('wins',0)}for pid,e in room['entries'].items()}}
    reports=[]
    if store:
        for row in store.db.execute('SELECT data,attacker FROM battle_reports WHERE mode=?AND(attacker=?OR defender=?)ORDER BY rowid DESC LIMIT 50',(MODE,p['id'],p['id'])):
            r=json.loads(row['data']);attack=row['attacker']==p['id'];target=r['defenseTeam']if attack else r['attackTeam'];reports.append({'id':r['id'],'ctime':r['ctime'],'targetPhotoInfo':target['playerPhotoInfo'],'targetName':target['playerName'],'targetServerId':target.get('serverId',1),'targetLevel':target['playerLevel'],'isWin':r['isWin']if attack else not r['isWin'],'isAttack':attack})
    p['extra'][MODE]={'getOpenInfoTime':int(time.time()*1000),'openInfo':{'openTime':opened*1000,'applyBeginTime':start*1000,'applyEndTime':close*1000,'isOpen':opened<=time.time()<end,'isApply':bool(entry)},'playerInfoMap':player_map,'teamInfoMap':camps(),'towerInfoMap':copy.deepcopy(room['towers']),'reports':reports,'towerNo':entry.get('tower',0)if entry else 0,'moveAt':int(entry.get('moveAt',0)*1000)if entry else 0,'rewardAt':int(entry.get('rewardAt',0)*1000)if entry else 0,'moveCD':max(0,math.ceil(entry.get('moveAt',0)-time.time()))if entry else 0,'getRewardCD':max(0,math.ceil(entry.get('rewardAt',0)-time.time()))if entry else 0}
    today=datetime.datetime.fromtimestamp(time.time(),ZONE).date().isoformat()
    if p.get('privateResourceWorshipDay')!=today:p['privateResourceWorshipDay']=today;p['worshipStatueMap']={}
    if store:
        for row in store.db.execute('SELECT level FROM resource_worship WHERE day=?AND player=?',(today,p['id'])):p['worshipStatueMap'][row['level']]=True
    return before!=json.dumps(p,sort_keys=True)

def award(store,room,pid,kind,rewards):
    args=(room['day'],room['level'],pid,kind)
    if store.db.execute('SELECT 1 FROM resource_awards WHERE day=?AND level=?AND player=?AND kind=?',args).fetchone():return
    p=profile_by_id(store,pid);notice(store,p,'Private resource battlefield',kind+' '+room['day'],copy.deepcopy(rewards));store.save(p);store.db.execute('INSERT INTO resource_awards VALUES(?,?,?,?)',args)

def settle(store):
    for row in store.db.execute('SELECT day,level FROM resource_rooms').fetchall():
        if time.time()<times(row['day'])[3]:continue
        with store.transaction():
            room=load(store,row['day'],row['level'])
            if room['finished']:continue
            ranked=rank_entries(room,wins=True);c=cfg()
            for index,entry in enumerate(ranked,1):
                rewards=c['WIN_TIMES_RANK_REWARD_DROP_LIST_MAP'].get(str(index))
                if rewards is None:
                    for threshold,value in zip(c['WIN_TIMES_RANK_BETWEEN'],c['WIN_TIMES_RANK_REWARD_BETWEEN']):
                        if index>=threshold:rewards=value
                if rewards:award(store,room,entry['id'],'RANK:'+str(index),rewards)
            for entry in room['entries'].values():
                if not entry.get('entered'):award(store,room,entry['id'],'NO_ENTER',c['NO_ENTER_REWARD_DROP_LIST'])
            if ranked:
                champion=ranked[0];award(store,room,champion['id'],'TITLE',[{'entityId':c['TITLE_ITEM_IDS'][c['LEVEL_TYPE_BETWEEN'].index(room['level'])],'count':1,'extra':{}}]);store.db.execute('INSERT INTO resource_champions VALUES(?,?,?,?)ON CONFLICT(level)DO UPDATE SET player=excluded.player,data=excluded.data,day=excluded.day WHERE excluded.day>=resource_champions.day',(room['level'],champion['id'],json.dumps(champion['public']),room['day']))
            scores={i:sum(t['teamId']==i for no,t in room['towers'].items()if int(no)>3)for i in range(1,4)};room['endRanks']=[{'teamId':i,'value':scores[i],'rank':n+1,**camps()[str(i)]}for n,i in enumerate(sorted(scores,key=lambda i:(-scores[i],i)))];room['finished']=True
            for entry in room['entries'].values():
                if entry.get('active'):store.notify(entry['account'],'onAllServerBattle',{'isEnd':True})
                entry['active']=False
            save_room(store,room)

def map_type(no):return next(int(k)for k,values in cfg()['TYPE_TOWERS_MAP'].items()if no in values)
def validate_maps(actual,claimed,label):
    if not isinstance(claimed,dict)or set(claimed)!=set(actual):raise ValueError(label+' không đủ chiến binh')
    for key,value in claimed.items():
        if type(value)not in (int,float)or not math.isfinite(value)or not math.isfinite(actual[key])or abs(value-actual[key])>max(.01,abs(actual[key])*1e-7):raise ValueError(label+' không khớp engine')

async def end_battle(store,account,args):
    p=store.player(account);row=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone()
    if not row or row['expires']<=time.time():raise ValueError('Trận chiến trường không tồn tại hoặc hết hạn')
    run=json.loads(row['data']);seed=integer(args.get('seed'),'Seed',1,2**31-1);bg=integer(args.get('bgImgId'),'Hình nền',1)
    if seed!=run['seed']or type(args.get('isWin'))is not bool or bg not in constants('battle.GUILD_BATTLE_IMG_IDS'):raise ValueError('Thông tin trận không hợp lệ')
    result=await simulate_async({'mode':'pvp','team':run['team'],'defender':run['defender'],'seed':seed});hp={str(r['idx']):r['hp']/1.45 for r in result['attacker']['roles']};target_hp={str(r['idx']):r['hp']/1.45 for r in result['defender']['roles']}
    validate_maps(hp,args.get('hpMap'),'HP đội mình');validate_maps(target_hp,args.get('targetHpMap'),'HP đối thủ')
    if args['isWin']!=result['isWin']:raise ValueError('Kết quả thắng không khớp engine')
    with store.transaction():
        p=store.player(account);before=snapshot(p);current=store.db.execute('SELECT data FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone();room=load(store,run['day'],run['level']);entry=active(room,p);enemy=room['entries'].get(str(run['target']))
        if not current or current[0]!=row['data']or entry!=run['selfState']or enemy!=run['targetState']:raise ValueError('Đội hoặc trận đã thay đổi, chưa trừ tài nguyên')
        entry['hp'].update({k:max(0,min(entry['maxHp'][k],v))for k,v in hp.items()});enemy['hp'].update({k:max(0,min(enemy['maxHp'][k],v))for k,v in target_hp.items()});entry['moveAt']=enemy['moveAt']=time.time()+cfg()['MOVE_CD'];win=result['isWin'];winner,loser=(entry,enemy)if win else (enemy,entry);winner['wins']+=1;winner['streak']+=1;loser['streak']=0;locate(room,loser,loser['camp'])
        if win:
            # Capture only after the last opposing occupant has left.
            occupants=room['towers'][str(run['tower'])]['playerIds']
            if not any(room['entries'][str(pid)]['camp']!=entry['camp']for pid in occupants):locate(room,entry,run['tower'])
        if winner['streak']>=cfg()['GO_BACK_WIN_TIMES']:winner['streak']=0;locate(room,winner,winner['camp'])
        rewards=grant(p,drops(cfg()['BATTLE_WIN_DROP_CLASS_ID']if win else cfg()['BATTLE_FAIL_DROP_CLASS_ID']));rid=secrets.token_hex(12);report={'id':rid,'type':MODE,'ctime':int(time.time()*1000),'attackTeam':run['raw'],'defenseTeam':run['targetRaw'],'hpMap':{str(r['idx']):r['hp']for r in run['team']['roles']},'targetHpMap':{str(r['idx']):r['hp']for r in run['defender']['roles']},'seed':seed,'bgImgId':bg,'isWin':win,'damageMap':result['damageMap']}
        store.db.execute('INSERT INTO battle_reports VALUES(?,?,?,?,?)',(rid,MODE,p['id'],enemy['id'],json.dumps(report)));store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE));save_room(store,room);sync(store,p,room);other=profile_by_id(store,enemy['id']);sync(store,other,room);broadcast(store,room,{p['id']:p['extra'][MODE]['reports'],other['id']:other['extra'][MODE]['reports']});store.audit('resource_battle',{'player':p['id'],'target':enemy['id'],'isWin':win});return delta(before,p,'logic.allServerBattleHandler.endBattle',{'entityCountMap':rewards,'reportId':rid})

async def handle(store,account,route,args):
    if route not in ROUTES:raise ValueError('Route chiến trường không tồn tại')
    settle(store);action=route.rsplit('.',1)[-1]
    if action=='endBattle':return await end_battle(store,account,args)
    with store.transaction():
        p=store.player(account);before=snapshot(p)
        if p['level']<cfg()['LEVEL_BETWEEN'][0]:raise ValueError('Chiến trường cần cấp 58')
        day=event_day();level=registered_level(store,p,day);room=load(store,day,level);start,close,opened,end=times(day);entry=room['entries'].get(str(p['id']));temp={}
        if action=='apply':
            if not start<=time.time()<close:raise ValueError('Chưa mở hoặc đã đóng đăng ký')
            if not entry:
                store.db.execute('INSERT INTO resource_registrations VALUES(?,?,?)',(day,p['id'],level))
                power=sum(sorted((r.get('power',0)for r in p['team']['roles'].values()),reverse=True)[:5]);room['entries'][str(p['id'])]={'id':p['id'],'account':p['userId'],'public':public(p),'power':power,'camp':(p['id']-1)%3+1,'entered':False,'active':False,'tower':0,'wins':0,'streak':0}
        elif action=='applyRank':
            lists={str(i):[{**e['public'],'rank':n+1,'value':e['power']}for n,e in enumerate(rank_entries(room,i))]for i in range(1,4)};camp=(p['id']-1)%3+1;mine=next((r for r in lists[str(camp)]if r['playerId']==p['id']),{});temp.update(myLevel=cfg()['LEVEL_BETWEEN'][cfg()['LEVEL_TYPE_BETWEEN'].index(level)],myRank=mine.get('rank',0),myValue=mine.get('value',0),myTeamId=camp,teamInfoMap=camps(),listMap=lists)
        elif action=='enter':
            if not opened<=time.time()<end:raise ValueError('Chiến trường chưa mở hoặc đã đóng')
            entry=own_entry(room,p)
            if not qualifies(room,entry):raise ValueError('Không thuộc 30 người đủ điều kiện của phe')
            roles=validate_team(p,args.get('teamIndexs'));ship_input=args.get('shipIndexs',[]);team=build_team(p,roles,ship_input);ships=list(map(str,ship_input))
            if entry['entered']:
                if entry['roles']!=roles or entry['ships']!=ships:raise ValueError('Đội đã chốt cho trận chiến trường này')
            else:
                entry.update(roles=roles,ships=ships,raw={'playerId':p['id'],'playerName':p['name'],'playerLevel':p['level'],'playerPhotoInfo':p['photoInfo'],'serverId':1,'roles':[copy.deepcopy(p['team']['roles'][i])for i in roles],'ships':[copy.deepcopy(p['bag']['items'][i])for i in ships]},hp={str(r['idx']):r['hp']for r in team['roles']},maxHp={str(r['idx']):r['hp']for r in team['roles']},entered=True)
            if not entry['active']:entry['active']=True;locate(room,entry,entry['camp'])
            temp['result']=True
        elif action=='exit':
            if not entry:
                last=store.db.execute('SELECT day,level FROM resource_registrations WHERE player=?ORDER BY day DESC LIMIT 1',(p['id'],)).fetchone()
                if last:room=load(store,last['day'],last['level']);entry=room['entries'].get(str(p['id']))
            if entry:entry['active']=False;locate(room,entry,0)
            store.db.execute('DELETE FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE));temp['result']=True
        elif action in ('move','beginBattle'):
            entry=active(room,p);tower=integer(args.get('toTowerNo'),'Điểm đến',4,22)
            if not alive(entry)or entry.get('moveAt',0)>time.time():raise ValueError('Đội cần hồi phục hoặc chờ hồi di chuyển')
            if tower not in cfg()['CAN_MOVE_TOWERS_MAP'][str(entry['tower'])]:raise ValueError('Điểm đến không liền kề')
            target=room['towers'][str(tower)];enemies=[room['entries'][str(pid)]for pid in target['playerIds']if room['entries'][str(pid)]['camp']!=entry['camp']and alive(room['entries'][str(pid)])]
            if action=='move':
                if enemies:raise ValueError('Có đối thủ, cần bắt đầu trận trước')
                locate(room,entry,tower)
            else:
                if not enemies:raise ValueError('Điểm đến không có đội đối thủ')
                enemy=min(enemies,key=lambda e:e['id']);old=store.db.execute('SELECT *FROM pvp_runs WHERE player=?AND mode=?',(p['id'],MODE)).fetchone();run=json.loads(old['data'])if old and old['expires']>time.time()else None
                if not run or run['tower']!=tower or run['selfState']!=entry or run['targetState']!=enemy:
                    run={'day':day,'level':level,'tower':tower,'target':enemy['id'],'selfState':copy.deepcopy(entry),'targetState':copy.deepcopy(enemy),'raw':raw_alive(entry),'targetRaw':raw_alive(enemy),'team':engine_team(entry),'defender':engine_team(enemy),'seed':secrets.randbelow(2**31-1)+1};store.db.execute('INSERT INTO pvp_runs VALUES(?,?,?,?)ON CONFLICT(player,mode)DO UPDATE SET data=excluded.data,expires=excluded.expires',(p['id'],MODE,json.dumps(run),min(end,int(time.time())+300)))
                temp['battleInfo']={'team':run['raw'],'targetTeam':run['targetRaw'],'hpMap':{str(r['idx']):r['hp']for r in run['team']['roles']},'targetHpMap':{str(r['idx']):r['hp']for r in run['defender']['roles']},'seed':run['seed']}
        elif action=='getTeam':
            entry=active(room,p);raw=copy.deepcopy(entry['raw'])
            for role in raw['roles']:key=str(role['idx']);role['attr'].update(hp=entry['hp'][key],maxHp=entry['maxHp'][key])
            temp['battleTeam']=raw
        elif action=='recover':
            entry=active(room,p)
            if entry['hp']==entry['maxHp']:raise ValueError('Đội đã đầy HP')
            consume(p,102,cfg()['RECOVER_COST_GEM']);entry['hp']=dict(entry['maxHp'])
        elif action=='receiveAward':
            entry=active(room,p);tower=entry['tower']
            if tower<=3 or entry.get('rewardAt',0)>time.time()or not alive(entry):raise ValueError('Chưa thể nhận tài nguyên ở điểm này')
            kind=str(map_type(tower));rewards=copy.deepcopy(cfg()['TOWER_TYPE_REWARD_DROP_LIST_MAP'][kind]);bonus=cfg()['TOWER_TYPE_RANDOM_REWARD_DROP_LIST_MAP'][kind];rewards.append(copy.deepcopy(bonus[secrets.randbelow(len(bonus))]));count=len(room['towers'][str(tower)]['playerIds'])
            if count>cfg()['HALVE_ABOVE_MEMBER_COUNT']:
                for row in rewards:row['count']=max(1,row['count']//2)
            temp['entityCountMap']=grant(p,rewards);entry['rewardAt']=time.time()+cfg()['GET_REWARD_CD']
        elif action=='getReport':
            rid=args.get('reportId')
            if not isinstance(rid,str):raise ValueError('ID báo cáo không hợp lệ')
            row=store.db.execute('SELECT data FROM battle_reports WHERE id=?AND mode=?AND(attacker=?OR defender=?)',(rid,MODE,p['id'],p['id'])).fetchone()
            if not row:raise ValueError('Báo cáo không thuộc người chơi')
            temp['report']=json.loads(row[0])
        elif action in ('winTimesRank','endTopRankInfo'):
            rooms=[json.loads(r[0])for r in store.db.execute('SELECT data FROM resource_rooms WHERE day<=?ORDER BY day DESC',(datetime.datetime.fromtimestamp(time.time(),ZONE).date().isoformat(),))];latest=max([r['day']for r in rooms],default=day);rooms=[r for r in rooms if r['day']==latest];lists={key:[]for key in cfg()['LEVEL_TYPE_BETWEEN']}
            for other in rooms:lists[other['level']]=[{**e['public'],'rank':n+1,'value':e['wins']}for n,e in enumerate(rank_entries(other,wins=True))]
            mine={};rank_level=level
            for key,rows in lists.items():
                found=next((r for r in rows if r['playerId']==p['id']),None)
                if found:mine=found;rank_level=key;break
            temp.update(myLevel=cfg()['LEVEL_BETWEEN'][cfg()['LEVEL_TYPE_BETWEEN'].index(rank_level)],myRank=mine.get('rank',0),myValue=mine.get('value',0),listMap=lists)
            if action=='endTopRankInfo':temp.update(day=latest,teamRanks={r['level']:r['endRanks']for r in rooms})
        elif action=='worshipStatue':
            target=args.get('levelType')
            if target not in cfg()['LEVEL_TYPE_BETWEEN']:raise ValueError('Bảng cấp không hợp lệ')
            champion=store.db.execute('SELECT player FROM resource_champions WHERE level=?',(target,)).fetchone()
            if not champion:raise ValueError('Bảng chưa có nhà vô địch')
            today=datetime.datetime.fromtimestamp(time.time(),ZONE).date().isoformat();key=(today,p['id'],target)
            if store.db.execute('SELECT 1 FROM resource_worship WHERE day=?AND player=?AND level=?',key).fetchone():raise ValueError('Đã cổ vũ bảng này hôm nay')
            store.db.execute('INSERT INTO resource_worship VALUES(?,?,?,?)',(*key,champion[0]));index=0
            for i,threshold in enumerate((22,40,60,70,80,90)):
                if p['level']>threshold:index=i
            temp['entityCountMap']=grant(p,[{'entityId':101,'count':[20000,40000,50000,60000,70000,80000][index],'extra':{}}])
        elif action=='worshipRank':
            rows=store.db.execute('SELECT champion,count(*)AS n FROM resource_worship GROUP BY champion ORDER BY n DESC,champion LIMIT 100').fetchall();temp['list']=[{**public(profile_by_id(store,r['champion'])),'rank':i+1,'value':r['n']}for i,r in enumerate(rows)]
        save_room(store,room);refresh(store,p)
        if action=='openInfo':temp.update(openInfo=p['extra'][MODE]['openInfo'],playerInfoMap=p['extra'][MODE]['playerInfoMap'])
        store.save(p)
        if action in ('enter','exit','move','recover','receiveAward'):broadcast(store,room)
        store.audit('resource_'+action,{'player':p['id'],'day':room['day']});result=delta(before,p,route,temp);result['extra']={**result.get('extra',{}),MODE:p['extra'][MODE]};return result
