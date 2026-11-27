"""Public game / private administration boundary, using the real TCP peer only."""
import ipaddress,os,time
from collections import OrderedDict
from aiohttp import web
DEFAULT_ADMIN_NETWORKS='127.0.0.0/8,::1/128,100.64.0.0/10'

def admin_networks(value=None):
 value=os.environ.get('DB2_ADMIN_NETWORKS',DEFAULT_ADMIN_NETWORKS)if value is None else value
 return tuple(ipaddress.ip_network(v.strip(),strict=False)for v in value.split(',')if v.strip())

def private_admin_peer(peer,networks):
 try:
  ip=ipaddress.ip_address(peer or'');ip=ip.ipv4_mapped if getattr(ip,'ipv4_mapped',None)else ip
 except ValueError:return False
 return any(ip.version==n.version and ip in n for n in networks)

def admin_path(path):return path=='/admin'or path.startswith('/admin/')or path in('/admin.css','/admin.js')or path.startswith('/assets/')

class AttemptLimiter:
 def __init__(self,limit,seconds=60,capacity=4096):self.limit=limit;self.seconds=seconds;self.capacity=capacity;self.rows=OrderedDict()
 def allow(self,key,now=None):
  now=time.monotonic()if now is None else now
  # Expire old keys instead of evicting live counters under a flood.
  for k,(_,until)in list(self.rows.items()):
   if until>now:break
   self.rows.pop(k,None)
  n,until=self.rows.get(key,(0,now+self.seconds))
  if until<=now:n,until=0,now+self.seconds
  if key not in self.rows and len(self.rows)>=self.capacity:return False
  if n>=self.limit:return False
  self.rows[key]=(n+1,until);return True

def middleware(networks=None):
 networks=admin_networks(networks);login=AttemptLimiter(60);register=AttemptLimiter(5);sockets={}
 @web.middleware
 async def guard(req,handler):
  private=private_admin_peer(req.remote,networks)
  if admin_path(req.path)and not private:raise web.HTTPForbidden(text='Administration is available only through the private network or SSH tunnel.')
  if req.path=='/'and req.headers.get('Upgrade','').lower()!='websocket'and not private:
   return web.json_response({'service':'DB2 game','administration':'private'})
  source=req.remote or'unknown'
  if os.environ.get('DB2_TRUST_LOCAL_PROXY')=='1':
   try:
    if ipaddress.ip_address(source).is_loopback:source=str(ipaddress.ip_address(req.headers.get('X-DB2-Client-IP',source)))
   except ValueError:pass
  bucket=register if req.path=='/user/register'else login if req.path=='/user/login'else None
  if bucket is not None and not bucket.allow(source):
   return web.json_response({'code':500,'msg':'Quá nhiều lần thử. Vui lòng chờ một phút.'},status=429,headers={'Retry-After':'60'})
  is_ws=req.path=='/'and req.headers.get('Upgrade','').lower()=='websocket'
  if is_ws:
   if sockets.get(source,0)>=64 or sum(sockets.values())>=256:raise web.HTTPTooManyRequests(text='Too many connections',headers={'Retry-After':'30'})
   sockets[source]=sockets.get(source,0)+1
  try:response=await handler(req)
  finally:
   if is_ws:
    sockets[source]-=1
    if not sockets[source]:sockets.pop(source,None)
  if admin_path(req.path)or req.path=='/':
   response.headers.update({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"})
  return response
 return guard
