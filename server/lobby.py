"""Home portraits from real current rankings; robots keep negative private IDs."""
import json
from .social import public

FIELDS=('arenaRankTop1','arena3v3RankTop1','prestigeBattleRankTop1')

def _person(store,pid,rank=1):
 if pid is None or pid<=0:return None
 row=store.db.execute('SELECT data FROM players WHERE id=?',(pid,)).fetchone()
 if not row:return None
 p=json.loads(row[0])
 return None if p.get('isBan')else{**public(p),'rank':rank,'totalPower':p.get('power',0)}

def leaders(store,p):
 from .arena3v3 import bracket
 from .cooperative import period
 normal=store.db.execute('SELECT player FROM arena_entries ORDER BY rank LIMIT 1').fetchone()
 multi=store.db.execute('SELECT player FROM multi_ladder WHERE mode=?AND bracket=?ORDER BY rank LIMIT 1',('arena3v3',bracket(p['level']))).fetchone()
 prestige=store.db.execute('SELECT player FROM cooperative_scores WHERE mode=?AND period=?AND score>0 ORDER BY score DESC,player LIMIT 1',('prestigeBattle',period())).fetchone()
 return {key:_person(store,row[0]if row else None)for key,row in zip(FIELDS,(normal,multi,prestige))}

def refresh(store,p):
 values=leaders(store,p);changed=any(k not in p['extra']or p['extra'][k]!=v for k,v in values.items())
 p['extra'].update(values);return changed


def stamp(store):
 from .cooperative import period
 normal=[tuple(r)for r in store.db.execute('SELECT player,rank FROM arena_entries WHERE rank=1')]
 multi=[tuple(r)for r in store.db.execute('SELECT bracket,player,rank FROM multi_ladder WHERE mode=?AND rank=1',('arena3v3',))]
 prestige=[tuple(r)for r in store.db.execute('SELECT player,score FROM cooperative_scores WHERE mode=?AND period=?AND score>0 ORDER BY score DESC,player LIMIT 1',('prestigeBattle',period()))]
 rows=normal+multi+prestige
 ids={r[0]for r in normal+prestige if r[0]>0}|{r[1]for r in multi if r[1]>0}
 for pid in sorted(ids):
  row=store.db.execute('SELECT data FROM players WHERE id=?',(pid,)).fetchone()
  if row:
   p=json.loads(row[0]);rows.append((pid,p.get('name'),p.get('photoInfo'),p.get('level'),p.get('power')))
 return rows
