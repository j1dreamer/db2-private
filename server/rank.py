"""Read-only, stable rankings from persisted player progress and event scores."""
import json,re
from .state import integer
from .social import public
ROUTES={'logic.rankHandler.top50','logic.rankHandler.arenaTop50'}

def value(player,kind):
    roles=player['team']['roles'].values()
    if kind=='level':return player['level']
    if kind=='star':return sum(v for typ in player['smapStarMap'].values() for chapter in typ.values() for v in chapter.values())
    if kind=='playerTop5power':return sum(sorted((r.get('power',0) for r in roles),reverse=True)[:5])
    if kind=='totalPower':return sum(r.get('power',0) for r in roles)
    if kind=='achievement_point':return player.get('achievementPoint',player['task'].get('achievementPoint',0))
    if kind=='endless_pass_id':return player['endless'].get('topPassId',0)
    if kind.startswith('endless_pass_id') and kind[15:].isdigit():return player['endless'].get('otherTopPassIdMap',{}).get(kind[15:],0)
    if kind=='pay':return player['vip'].get('topUpGem',0)
    if kind=='cost_gem':return player['costGem']
    if kind=='advancedPoint':return player['point']['advancedTimes']
    # Seasonal services keep named counters here; an unopened season has no
    # participants rather than awarding a fabricated score.
    return player.get('rankScores',{}).get(kind,0)

def handle(store,account,route,args):
    own=store.player(account)
    if not own:raise ValueError('Chưa có nhân vật')
    kind=('arena_daily' if args.get('isDaily') else 'arena') if route.endswith('arenaTop50') else args.get('type')
    if not isinstance(kind,str) or not re.fullmatch(r'[A-Za-z0-9_]{1,100}',kind):raise ValueError('Loại xếp hạng không hợp lệ')
    allowed={'level','star','playerTop5power','totalPower','achievement_point','endless_pass_id','arena','arena_daily'}
    if kind not in allowed and not kind.startswith(('endless_pass_id','endless_pass_times','pay','cost_gem','advancedPoint','dial_svip_times','sp_wish_times','island_plunder_')) and '_score'not in kind:
        raise ValueError('Loại xếp hạng không tồn tại')
    begin=integer(args.get('begin',0),'Vị trí bắt đầu',0,10000);end=integer(args.get('end',49),'Vị trí kết thúc',begin,10000)
    if end-begin>=100:raise ValueError('Mỗi lần lấy tối đa 100 vị trí')
    server=args.get('serverId')
    if server is not None and (type(server)is not int or server<0):raise ValueError('Server không hợp lệ')
    people=[]
    for row in store.db.execute('SELECT account FROM players'):
        p=store.player(row[0])
        if p.get('isBan') or server and p['serverId']!=server:continue
        if kind in ('arena','arena_daily'):score=p['arena'].get('dailyRank' if kind=='arena_daily' else 'rank',0)
        else:score=value(p,kind)
        if score>0:people.append((p,score))
    people.sort(key=lambda x:((x[1]if kind in ('arena','arena_daily') else -x[1]),x[0]['id']))
    rows=[{**public(p),'rank':i+1,'value':score} for i,(p,score) in enumerate(people)]
    mine=next((r for r in rows if r['playerId']==own['id']),None)
    return {'code':200,'_temp':{'route':route,'list':rows[begin:end+1],'myRank':mine['rank']if mine else 0,'myValue':mine['value']if mine else 0}}
