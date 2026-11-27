"""Check every catalog detail and image over real HTTP against an isolated server."""
import asyncio,json,tempfile
from pathlib import Path
from aiohttp.test_utils import TestClient,TestServer
from server.app import create_app
from server.catalog_audit import audit_catalog
from server.inventory import entities
ROOT=Path(__file__).resolve().parents[1]
async def main():
 report=audit_catalog();headers={'Authorization':'Bearer catalog-audit-only'};sem=asyncio.Semaphore(8);pictures=set();fail=[]
 with tempfile.TemporaryDirectory()as td:
  async with TestClient(TestServer(create_app(td,admin_token='catalog-audit-only')))as client:
   async def inspect(kind):
    async with sem:
     r=await client.get('/admin/catalog/'+str(kind),headers=headers)
     if r.status!=200:fail.append({'id':kind,'http':r.status});return
     d=await r.json()
     if d['id']!=kind or not d['name']or 'definition'not in d:fail.append({'id':kind,'error':'detail mismatch'})
     if entities()[kind]['type']=='box'and 'box'not in d:fail.append({'id':kind,'error':'missing box preview'})
     pictures.add(d['image'])
   await asyncio.gather(*(inspect(k)for k in entities()))
   async def image(path):
    async with sem:
     r=await client.get(path);b=await r.read()
     if r.status!=200 or not b.startswith(b'\x89PNG\r\n\x1a\n'):fail.append({'image':path,'error':'image response invalid'})
   await asyncio.gather(*(image(p)for p in pictures))
 report.update(http_details_checked=len(entities()),http_unique_images_checked=len(pictures),http_failures=fail,dataset='isolated temporary SQLite; no user account changed')
 (ROOT/'analysis/catalog-all-items-web-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:v for k,v in report.items()if k!='boxes'},ensure_ascii=False))
 if report['errors']or fail:raise SystemExit(1)
if __name__=='__main__':asyncio.run(main())
