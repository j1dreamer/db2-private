"""Keep dispatch coverage distinct from device verification and the 342-route goal."""
import hashlib,json
from pathlib import Path
from server.adventure import ROUTES as ADVENTURE
from server.player_actions import ROUTES as PLAYER
from server.social import ROUTES as SOCIAL
from server.mail import ROUTES as MAIL
from server.rank import ROUTES as RANK
from server.shops import ROUTES as SHOP
from server.chat import ROUTES as CHAT
from server.bag_actions import ROUTES as BAG
from server.team_actions import ROUTES as TEAM
ROOT=Path(__file__).resolve().parent.parent
CORE={'gate.gateHandler.queryEntry','connector.entryHandler.entry','connector.playerHandler.getPlayers','connector.playerHandler.createPlayer','connector.playerHandler.entry','logic.playerHandler.rename','logic.playerHandler.useGiftCode','logic.playerHandler.receiveActivityAward'}
CORE|={'logic.pointHandler.'+name+suffix for name in ('normal','advanced') for suffix in ('','Ten','Hundred')}
CORE|={'logic.pointHandler.switchAdvancedPool','logic.pointHandler.selectWishClassId'}
def update():
    groups=[(CORE,['tests/test_server.py','tests/test_gameplay.py','tests/test_client_models.py']),(ADVENTURE,['tests/test_adventure.py']),(PLAYER,['tests/test_player_actions.py']),(SOCIAL|MAIL,['tests/test_social_mail.py','tests/test_push.py']),(RANK,['tests/test_rank.py']),(SHOP,['tests/test_shops.py']),(CHAT,['tests/test_chat.py','tests/test_push.py']),(BAG,['tests/test_bag_actions.py']),(TEAM,['tests/test_team_actions.py'])]
    contracts=json.loads((ROOT/'analysis/route-contracts.json').read_text());implemented=set().union(*(routes for routes,tests in groups))
    rows=[]
    for item in contracts['contracts']:
        route=item['route'];ready=route in implemented
        tests=next((tests for routes,tests in groups if route in routes),[])
        rows.append({'route':route,'implemented':ready,'status':'headless-tested' if ready else 'not-implemented','test_groups':tests,'device_verified':False})
    report={'source_bundle_sha256':hashlib.sha256((ROOT/'client/main.decoded.js').read_bytes()).hexdigest(),'target':342,'routes_in_client':len(rows),'implemented_routes':sum(r['implemented'] for r in rows),'unsupported_routes':sum(not r['implemented'] for r in rows),'note':'Draft branch coverage. Headless-tested dispatch is not device-verified or a complete original-server rule set.','routes':rows}
    (ROOT/'analysis/route-coverage.json').write_text(json.dumps(report,indent=2)+'\n')
    return report
if __name__=='__main__':
    x=update();print({k:v for k,v in x.items() if k!='routes'})
