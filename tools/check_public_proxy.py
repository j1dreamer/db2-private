"""Run real Caddy against an isolated DB2 server over loopback; no public deployment."""
import argparse,asyncio,json,os,socket,subprocess,tempfile,time
from pathlib import Path
from aiohttp import ClientSession,BasicAuth
from aiohttp.test_utils import TestServer
from server.app import create_app
from server.protocol import package,packages
from .public_proxy import caddyfile
ROOT=Path(__file__).resolve().parents[1]
async def main(binary):
 with tempfile.TemporaryDirectory()as td:
  td=Path(td);server=TestServer(create_app(td/'db',public_host='auto',admin_token='proxy-qa-token'));await server.start_server();caddy=None
  try:
   with socket.socket()as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
   digest=subprocess.check_output([binary,'hash-password','--plaintext','proxy-test-only-password'],text=True).strip()
   version=subprocess.check_output([binary,'version'],text=True).split()[0];legacy=tuple(int(x)for x in version.lstrip('v').split('.')[:2])<(2,8)
   cfg=td/'Caddyfile';cfg.write_text('{\n admin off\n}\n'+caddyfile('db2.teck.io.vn','db2.teck.io.vn','db2admin',digest,legacy=legacy,test_port=port,backend_port=server.port))
   subprocess.run([binary,'validate','--config',str(cfg),'--adapter','caddyfile'],capture_output=True,text=True,check=True)
   log=(td/'caddy.log').open('w');caddy=subprocess.Popen([binary,'run','--config',str(cfg),'--adapter','caddyfile'],stdout=log,stderr=log,env={**os.environ,'XDG_DATA_HOME':str(td/'caddy-data'),'XDG_CONFIG_HOME':str(td/'caddy-config')})
   base=f'http://127.0.0.1:{port}';host={'Host':'db2.teck.io.vn:'+str(port)};auth=BasicAuth('db2admin','proxy-test-only-password');checks=[]
   async with ClientSession()as client:
    for _ in range(50):
     try:
      async with client.get(base+'/health',headers=host)as r:
       if r.status==200:break
     except OSError:pass
     await asyncio.sleep(.1)
    else:raise RuntimeError((td/'caddy.log').read_text())
    async def status(path,expected,credentials=None,token=None):
     h={**host,**({'X-DB2-Admin-Token':token}if token else{})}
     async with client.get(base+path,headers=h,auth=credentials)as r:
      assert r.status==expected,(path,r.status,await r.text());checks.append([path,expected])
      return r.headers
    await status('/user/clientConfig',200);await status('/admin',401);await status('/admin/overview',401,token='proxy-qa-token');await status('/admin/overview',401,credentials=auth);await status('/admin/overview',200,credentials=auth,token='proxy-qa-token')
    for path in ['/assets/item-icons.json','/admin.js','/%61dmin/api','/user/../admin/api'] :await status(path,401)
    headers=await status('/admin',200,credentials=auth);assert headers['X-Content-Type-Options']=='nosniff'and headers['Strict-Transport-Security'].startswith('max-age=')
    ws=await client.ws_connect(base+'/',headers=host)
    await ws.send_bytes(package(1,b'{"sys":{}}'));await ws.receive();await ws.send_bytes(package(2));await ws.receive()
    route=b'gate.gateHandler.queryEntry';await ws.send_bytes(package(4,b'\0\1'+bytes([len(route)])+route+b'{}'))
    gate=json.loads(list(packages((await ws.receive()).data))[0][1][2:]);assert gate['host']=='db2.teck.io.vn'and gate['port']==port,gate
    await ws.close();checks.append(['public_game_gate_advertises_frontend_host_and_port',200]);checks.append(['websocket_root_without_admin_password',101])
   report={'passed':True,'caddy_version':version,'checks':checks,'domain_configured':'db2.teck.io.vn','transport':'loopback HTTP only for integration test; production config enables automatic HTTPS','live_dns_or_acme_verified':False,'user_vps_deployed':False}
   (ROOT/'analysis/public-proxy-integration.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
  finally:
   if caddy:caddy.terminate();caddy.wait(timeout=10)
   await server.close()
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--caddy',required=True);a=p.parse_args();asyncio.run(main(a.caddy))
