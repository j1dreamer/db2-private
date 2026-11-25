"""Run actual admin browser flows against an isolated temporary game database.

Requires Node/Playwright and Chromium. Never connects to the running game server.
"""
import asyncio,json,os,secrets,shutil,subprocess,tempfile,time
from pathlib import Path
from aiohttp.test_utils import TestServer
from server.app import create_app
from server.storage import Store
from server.admin import Admin
ROOT=Path(__file__).resolve().parents[1]
async def main():
 with tempfile.TemporaryDirectory(prefix='db2-admin-browser-')as folder:
  path=Path(folder);store=Store(path/'game.sqlite3');token=secrets.token_urlsafe(24)
  for i,name in enumerate(('Son Goku','Vegeta','Trunks'),1):
   store.register('qauser'+str(i),'qa-only-password');p=store.create_player(i,name);p.update(gem=5000*i,coin=100000*i);store.save(p)
  control=Admin(store,token,lambda:set(),lambda:None);now=int(time.time())
  with store.transaction():
   for key,name,start,end,repeat in(('GIFT_OPEN','Quà khai mở',now-3600,now+86400,'none'),('WEEKEND','Cuối tuần rực rỡ',now+86400,now+172800,'none'),('DAILY_GIFT','Quà mỗi tối',now-86400,now-82800,'daily')):
    control.mutate({'action':'event_save','id':key,'name':name,'start':start,'end':end,'repeat':repeat,'enabled':True,'rewards':[{'entityId':119,'count':3},{'entityId':120,'count':1}]})
   control.mutate({'action':'giftcode_save','code':'WELCOME_DB2','gem':300,'max_uses':100,'expires':now+30*86400,'rewards':[{'entityId':119,'count':5}]})
   for kind,n,w in((119,3,80),(100101,1,20)):control.mutate({'action':'gacha_entry','pool':102,'entity':kind,'count':n,'star':3,'weight':w})
  store.db.close();server=TestServer(create_app(path,public_host='auto',admin_token=token));await server.start_server()
  try:
   output=ROOT/'artifacts/admin-browser';env={**os.environ,'DB2_QA_URL':str(server.make_url('/')).rstrip('/'),'DB2_QA_TOKEN':token,'DB2_QA_OUTPUT':str(output)}
   if shutil.which('chromium'):env['DB2_QA_BROWSER']=shutil.which('chromium')
   process=await asyncio.create_subprocess_exec('node',str(ROOT/'tests/browser/admin_flow.cjs'),env=env,cwd=ROOT)
   status=await process.wait()
   if status:raise SystemExit(status)
   report=json.loads((output/'report.json').read_text());report['dataset']='isolated temporary SQLite, never the running user database';(ROOT/'analysis/admin-browser-tests.json').write_text(json.dumps(report,indent=2)+'\n')
  finally:await server.close()
if __name__=='__main__':asyncio.run(main())
