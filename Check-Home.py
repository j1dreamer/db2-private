"""Read-only diagnostics for the server copy next to this script. No credentials exported."""
from pathlib import Path
import argparse,hashlib,json,sqlite3,urllib.request,datetime

ROOT=Path(__file__).resolve().parent
REQUIRED=('task.daily','task.dailyActivePoint','task.weeklyActivePoint','task.receivedPointMap.daily','task.receivedPointMap.weekly','activity.scorePointInfoMap','timesMaxMap.actionPoint','timesMaxMap.skillPoint','nextRecoverTimeMap.actionPoint','nextRecoverTimeMap.skillPoint')
def missing(profile):
    result=[]
    for path in REQUIRED:
        current=profile
        for key in path.split('.'):
            if not isinstance(current,dict) or key not in current:
                result.append(path);break
            current=current[key]
        else:
            if current is None:result.append(path)
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data',type=Path,default=ROOT/'data')
    parser.add_argument('--port',type=int,default=20003)
    args=parser.parse_args()
    out={'checked_folder':str(ROOT),'checked_database':str(args.data/'game.sqlite3')}
    try:
        import server.profile as profile
        from server.storage import Store
        import inspect
        out['profile_file']=str(Path(profile.__file__).resolve())
        out['profile_sha256']=hashlib.sha256(Path(profile.__file__).read_bytes()).hexdigest()
        sample=profile.new_profile(1,1,'Diagnostic','diagnostic')
        out['code_schema']=sample.get('profileSchemaVersion')
        out['code_missing_fields']=missing(sample)
        out['storage_calls_upgrade']='upgrade_profile' in inspect.getsource(Store.player)
    except Exception as exc:out['code_error']=str(exc)
    db_path=(args.data/'game.sqlite3').resolve()
    if db_path.exists():
        try:
            # mode=ro plus query_only prevents accidental writes or migrations.
            with sqlite3.connect(db_path.as_uri()+'?mode=ro',uri=True) as db:
                db.execute('PRAGMA query_only=ON')
                out['players']=[]
                for pid,raw in db.execute('SELECT id,data FROM players'):
                    p=json.loads(raw)
                    out['players'].append({'id':pid,'schema':p.get('profileSchemaVersion'),'missing_fields':missing(p),'starter_tickets_granted':bool(p.get('privateStarterTicketsGranted')),'ticket_counts':{str(kind):sum(x.get('count',0) for x in p.get('bag',{}).get('items',{}).values() if x.get('kindId')==kind) for kind in (119,120)}})
                rows=db.execute("SELECT id,created,action,detail FROM audit WHERE action IN ('profile_migration','client_error') ORDER BY id DESC LIMIT 5").fetchall()
                out['recent_audit']=[]
                for ident,created,action,detail in rows:
                    d=json.loads(detail)
                    summary={k:d[k] for k in ('player','schema') if k in d}
                    if action=='client_error':summary={'error':str(d.get('msg','')).split('\n')[0][:300]}
                    out['recent_audit'].append({'id':ident,'time':datetime.datetime.fromtimestamp(created).astimezone().isoformat(),'action':action,**summary})
        except Exception as exc:out['database_error']=str(exc)
    else:out['database_error']='Database not found in this folder; check --data or server folder.'
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{args.port}/health',timeout=3) as response:
            out['running_health']=json.load(response)
    except Exception as exc:out['health_error']=str(exc)
    print(json.dumps(out,ensure_ascii=True,indent=2))
if __name__=='__main__':main()
