"""Keep dispatch coverage distinct from device verification and the 342-route goal."""
import hashlib,json
from pathlib import Path
from server.adventure import ROUTES as ADVENTURE
from server.player_actions import ROUTES as PLAYER
ROOT=Path(__file__).resolve().parent.parent
CORE={'gate.gateHandler.queryEntry','connector.entryHandler.entry','connector.playerHandler.getPlayers','connector.playerHandler.createPlayer','connector.playerHandler.entry','logic.playerHandler.rename','logic.playerHandler.useGiftCode','logic.playerHandler.receiveActivityAward'}
CORE|={'logic.pointHandler.'+name+suffix for name in ('normal','advanced') for suffix in ('','Ten','Hundred')}
CORE|={'logic.pointHandler.switchAdvancedPool','logic.pointHandler.selectWishClassId'}
def update():
    contracts=json.loads((ROOT/'analysis/route-contracts.json').read_text());implemented=CORE|ADVENTURE|PLAYER
    rows=[]
    for item in contracts['contracts']:
        route=item['route'];ready=route in implemented
        tests=['tests/test_adventure.py'] if route in ADVENTURE else ['tests/test_player_actions.py'] if route in PLAYER else ['tests/test_server.py','tests/test_gameplay.py','tests/test_client_models.py'] if route in CORE else []
        rows.append({'route':route,'implemented':ready,'status':'headless-tested' if ready else 'not-implemented','test_groups':tests,'device_verified':False})
    report={'source_bundle_sha256':hashlib.sha256((ROOT/'client/main.decoded.js').read_bytes()).hexdigest(),'target':342,'routes_in_client':len(rows),'implemented_routes':sum(r['implemented'] for r in rows),'unsupported_routes':sum(not r['implemented'] for r in rows),'note':'Draft branch coverage. Headless-tested dispatch is not device-verified or a complete original-server rule set.','routes':rows}
    (ROOT/'analysis/route-coverage.json').write_text(json.dumps(report,indent=2)+'\n')
    return report
if __name__=='__main__':
    x=update();print({k:v for k,v in x.items() if k!='routes'})
