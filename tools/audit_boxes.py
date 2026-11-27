"""Exercise every configured stock box, every selectable outcome and random opening."""
import copy,json,tempfile
from pathlib import Path
from server.storage import Store
from server.inventory import entities,insert
from server.item_actions import handle,description,box_config
ROOT=Path(__file__).resolve().parents[1]
def main():
 report={'configured_boxes':0,'configurable_without_default':[],'cases':0,'selection_cases':0,'errors':[],'source_tables_unchanged':True,'native_verified':False}
 with tempfile.TemporaryDirectory()as td:
  s=Store(Path(td)/'db');s.register('boxaudit','audit-only-password');baseline=s.create_player(1,'BoxAudit')
  for kind,row in entities().items():
   if row['type']!='box':continue
   cfg=row.get('extra')or{};choices=description(cfg.get('dropListDesc'));select=cfg.get('selectCount',0)
   if not choices and not cfg.get('rdDropListDesc'):report['configurable_without_default'].append(kind);continue
   report['configured_boxes']+=1
   cases=[('selectBoxReward',i,1)for i in range(len(choices))]if select else[('useItem',None,1),('useItem',None,2)]
   for action,i,n in cases:
    try:
     s.db.execute('UPDATE players SET data=?WHERE id=1',(json.dumps(baseline),))
     p=s.player(1);insert(p,kind,2);idx=next(int(k)for k,v in p['bag']['items'].items()if v['kindId']==kind);s.save(p)
     args={'bagIndex':idx,'itemCount':n}
     if i is not None:args['rewardIdxs']=[i]
     result=handle(s,1,'logic.playerHandler.'+action,args);loot=result['_temp']['entityCountMap']
     assert loot and all(v>0 for v in loot.values()),'empty or invalid reward delta'
     if i is not None and entities()[choices[i]['entityId']]['type']!='role':assert loot.get(str(choices[i]['entityId']))==choices[i]['count']*n,'wrong chosen reward count'
     p=s.player(1);left=sum(x['count']for x in p['bag']['items'].values()if x['kindId']==kind)
     assert left==2-n,'box consumption mismatch'
     report['cases']+=1;report['selection_cases']+=i is not None
    except Exception as e:report['errors'].append({'box':kind,'choice':i,'count':n,'error':str(e)})
  s.db.close()
 (ROOT/'analysis/all-box-open-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
 if report['errors']:raise SystemExit(1)
if __name__=='__main__':main()
