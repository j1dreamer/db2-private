"""Register normally and test ONE +100 item GM call on your own legacy server.
Requires Python 3.8+ and aiohttp. No privilege grants, invite guessing, or automatic GM retries.
"""
import argparse,asyncio,base64,getpass,json,os,re,secrets,struct,sys,time,zlib
from pathlib import Path
from urllib.parse import urlsplit,urlunsplit
import aiohttp
if sys.version_info < (3,8):raise SystemExit('This checker requires Python 3.8 or newer.')
CLIENT_VERSION=6  # Verified in the supplied APK's serverMain.login, not a guessed newer version.

def pack(kind,body=b''):
    return bytes([kind])+len(body).to_bytes(3,'big')+body

def packets(data):
    pos=0
    while pos<len(data):
        if len(data)-pos<4:raise ValueError('Truncated Pomelo package')
        kind=data[pos];size=int.from_bytes(data[pos+1:pos+4],'big');pos+=4
        if pos+size>len(data):raise ValueError('Truncated Pomelo body')
        yield kind,data[pos:pos+size];pos+=size

def varint(value):
    out=bytearray()
    while value>127:out.append((value&127)|128);value>>=7
    out.append(value);return bytes(out)

def message(data):
    flag=data[0];typ=(flag>>1)&7;compressed=flag&1;pos=1;rid=0
    if typ in (0,2):
        shift=0
        while True:
            b=data[pos];pos+=1;rid|=(b&127)<<shift;shift+=7
            if b<128:break
            if shift>35:raise ValueError('Invalid request ID')
    route=None
    if typ in (0,1,3):
        if compressed:route=int.from_bytes(data[pos:pos+2],'big');pos+=2
        else:
            size=data[pos];pos+=1;route=data[pos:pos+size].decode();pos+=size
    return rid,route,data[pos:]

class Pomelo:
    def __init__(self,session,url):self.session=session;self.url=url;self.rid=0;self.pending=[];self.ws=None;self.heartbeat=None;self.protos={};self.routes={}
    async def close(self):
        if self.heartbeat:
            self.heartbeat.cancel()
            try:await self.heartbeat
            except asyncio.CancelledError:pass
        if self.ws:await self.ws.close()
    async def frame(self):
        while not self.pending:
            event=await self.ws.receive(timeout=15)
            if event.type!=aiohttp.WSMsgType.BINARY:raise RuntimeError('WebSocket closed or returned a non-binary message')
            self.pending.extend(packets(event.data))
        return self.pending.pop(0)
    async def beat(self,seconds):
        while True:
            await asyncio.sleep(min(seconds,5));await self.ws.send_bytes(pack(3))
    async def connect(self):
        self.ws=await self.session.ws_connect(self.url,max_msg_size=16*1024*1024,timeout=15)
        await self.ws.send_bytes(pack(1,json.dumps({'sys':{'type':'js-websocket','version':'0.0.1','rsa':{},'protoVersion':0},'user':{}}).encode()))
        kind,body=await self.frame()
        if kind!=1:raise RuntimeError('No Pomelo handshake response')
        result=json.loads(body);check(result,'handshake');system=result.get('sys')or{}
        self.routes=system.get('dict')or{};self.protos=system.get('protos')or{}
        await self.ws.send_bytes(pack(2))
        if system.get('heartbeat'):self.heartbeat=asyncio.create_task(self.beat(system['heartbeat']))
        return self
    async def request(self,route,args):
        if route in (self.protos.get('client')or{}):raise RuntimeError('Server requires protobuf for '+route+'; this JSON-only checker stopped')
        self.rid+=1;rid=self.rid;code=self.routes.get(route);name=route.encode()
        route_header=struct.pack('>H',code)if code is not None else bytes([len(name)])+name
        data=bytes([1 if code is not None else 0])+varint(rid)+route_header+json.dumps(args,separators=(',',':')).encode()
        await self.ws.send_bytes(pack(4,data))
        return await asyncio.wait_for(self.response(rid,route),timeout=20)
    async def response(self,rid,route):
        while True:
            kind,body=await self.frame()
            if kind==5:raise RuntimeError('Server disconnected this account')
            if kind!=4:continue
            response_id,_,raw=message(body)
            if response_id!=rid:continue
            if route in (self.protos.get('server')or{}):raise RuntimeError('Server response requires protobuf for '+route)
            return json.loads(raw)

def check(result,stage):
    if result.get('code')!=200:raise RuntimeError(stage+': '+str(result.get('msg',result.get('code','unknown response'))))
    return result

def profile(result):
    value=check(result,'player entry').get('player')
    if isinstance(value,str):
        try:value=json.loads(value)
        except json.JSONDecodeError:
            blob=base64.b64decode(value)
            for window in (47,15,-15):
                try:value=json.loads(zlib.decompress(blob,window));break
                except (zlib.error,ValueError):continue
    if not isinstance(value,dict):raise RuntimeError('No readable player profile; stopped before GM')
    return value

def item_count(player,kind):
    bag=player.get('bag',{});items=bag.get('items',{})
    if isinstance(items,dict):items=items.values()
    return sum(int(item.get('count',0))for item in items if int(item.get('kindId',0))==kind)

async def post(session,base,path,fields):
    form=dict(fields)
    if path.startswith('/user/'):form.setdefault('cver',str(CLIENT_VERSION))
    async with session.post(base+path,data=form,allow_redirects=False)as response:
        if response.status!=200:raise RuntimeError(path+': HTTP '+str(response.status))
        return await response.json(content_type=None)

async def login_player(session,base,credentials,create):
    common={'name':credentials['username'],'password':credentials['password'],'device':credentials.get('device',''),'cver':str(CLIENT_VERSION),'serverId':'9999'}
    info=check(await post(session,base,'/user/serverInfo',{'userName':common['name']}),'server info')
    servers=info.get('serverList')or[]
    if not servers:raise RuntimeError('Server list is empty')
    server=servers[0];common['serverId']=str(server['serverId']);login=check(await post(session,base,'/user/login',common),'login')
    parsed=urlsplit(base);scheme='wss'if parsed.scheme=='https'else'ws';gate=Pomelo(session,urlunsplit((scheme,parsed.netloc,'/','','')))
    try:
        await gate.connect();endpoint=check(await gate.request('gate.gateHandler.queryEntry',{'uid':login['uid']}),'gate')
    finally:await gate.close()
    host=str(endpoint['host']);port=int(endpoint['port'])
    if not 1<=port<=65535 or '/'in host or '@'in host:raise RuntimeError('Invalid connector address')
    authority=('['+host+']'if ':'in host else host)+':'+str(port)
    conn=Pomelo(session,urlunsplit((scheme,authority,'/','','')))
    try:
        await conn.connect();check(await conn.request('connector.entryHandler.entry',{'token':login['token'],'serverId':server['serverId'],'oldServerId':server.get('oldServerId',server['serverId'])}),'connector')
        players=check(await conn.request('connector.playerHandler.getPlayers',{}),'get players').get('players')or[]
        if players:result=await conn.request('connector.playerHandler.entry',{'playerId':players[0]['id'],'preReconnectTime':False})
        elif create:result=await conn.request('connector.playerHandler.createPlayer',{'name':credentials['username']})
        else:raise RuntimeError('Player disappeared on relogin')
        return conn,profile(result)
    except BaseException:
        await conn.close();raise

async def check_connection(server):
    base=server.rstrip('/')
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=12),trust_env=True)as session:
        try:
            async with session.get(base+'/health',allow_redirects=False)as response:
                if response.status==200:
                    try:data=await response.json(content_type=None)
                    except (ValueError,aiohttp.ClientError):data={}
                    if isinstance(data,dict)and data.get('status')=='ok':print('HEALTH OK: server reachable.')
                    else:print('HTTP 200: HTTP endpoint reachable; game login not yet verified.')
                elif response.status==404:print('HTTP 404: HTTP endpoint reachable; this old server may not have /health.')
                else:raise RuntimeError('HTTP '+str(response.status)+': server reachability is not confirmed; check Tailscale and the server.')
        except (aiohttp.ClientError,asyncio.TimeoutError)as error:
            raise RuntimeError('Cannot reach server. Check Tailscale, the server IP/port and whether the server is running.')from error
    print('Read-only check. No account created and no GM request sent.')

def installation_device(directory):
    # An ID for this checker installation, not a claimed native Android hardware ID.
    # Keep it across runs so this tool does not pretend to be a new device each time.
    path=directory/'.legacy-gm-installation-id'
    try:
        fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    except FileExistsError:pass
    else:
        with os.fdopen(fd,'w')as output:output.write(secrets.token_hex(8)+'\n')
    value=path.read_text().strip()
    if not re.fullmatch('[0-9a-fA-F]{8,64}',value):raise RuntimeError('Stored checker installation ID is invalid; inspect '+str(path))
    return value

async def run(args,out,report):
    base=args.server.rstrip('/');parsed=urlsplit(base)
    if parsed.scheme not in ('http','https')or not parsed.hostname or parsed.path or parsed.query or parsed.fragment or parsed.username:raise ValueError('Use http://HOST:PORT, with no credentials or path')
    username='zuri'+secrets.token_hex(3);password=secrets.token_urlsafe(18)
    device=args.device or installation_device(Path(__file__).resolve().parent)
    if not re.fullmatch('[0-9a-fA-F]{8,64}',device):raise ValueError('Device ID must match the APK format: 8 to 64 hexadecimal characters')
    credentials={'server':base,'username':username,'password':password,'device':device}
    path=out/'ACCOUNT-PRIVATE.json';path.write_text(json.dumps(credentials,indent=2)+'\n');os.chmod(path,0o600)
    report.update(server=base,account=username,kind_id=args.kind_id,grant_count=100,client_version=CLIENT_VERSION,device_present=True,device_source='provided'if args.device else'checker-installation-id',registration_succeeded=False,gm_request_sent=False,persistence_verified=False)
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=25),trust_env=True)as session:
        registration_name=username+('#'+args.invite if args.invite else'')
        result=await post(session,base,'/user/register',{'name':registration_name,'password':password,'from':'mmx','channel':'Android','accountId':registration_name,'device':device})
        check(result,'registration');report['registration_succeeded']=True
        conn,before=await login_player(session,base,credentials,True)
        try:
            report['before']=item_count(before,args.kind_id)
            report['gm_request_sent']=True
            # Exactly one GM request. Never retry after an ambiguous timeout.
            result=await conn.request('logic.gmHandler.addItem',{'kindId':args.kind_id,'itemCount':100})
            report['gm_response']={k:result[k]for k in ('code','msg')if k in result};check(result,'GM addItem')
        finally:await conn.close()
        conn,after=await login_player(session,base,credentials,False)
        try:
            report['after_relogin']=item_count(after,args.kind_id);report['difference']=report['after_relogin']-report['before'];report['persistence_verified']=report['difference']==100
            if not report['persistence_verified']:raise RuntimeError('GM returned success but persistent inventory did not increase by exactly 100')
        finally:await conn.close()

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--server');parser.add_argument('--check-only',action='store_true',help='Read-only connectivity check: no account or GM changes');parser.add_argument('--kind-id',type=int,default=119,help='Default: normal summon ticket 119 from the ENG client');parser.add_argument('--device',default='',help='Your own Android ID if this backend requires it');parser.add_argument('--output',type=Path);args=parser.parse_args()
    if not args.server:args.server=input('Server URL (for example http://100.x.x.x:20003): ').strip()
    if args.check_only:
        try:asyncio.run(check_connection(args.server));return 0
        except Exception as error:print('STOPPED:',str(error));return 1
    args.invite=getpass.getpass('Invite code if required (Enter if none): ')
    if args.kind_id<1:parser.error('kind-id must be positive')
    out=args.output or Path(__file__).resolve().parent/('gm-test-'+time.strftime('%Y%m%d-%H%M%S')+'-'+secrets.token_hex(2));out.mkdir(parents=True,exist_ok=False);os.chmod(out,0o700);report={};status=1
    try:
        asyncio.run(run(args,out,report));status=0;print('PASS: inventory increased by exactly 100 after a fresh login.')
    except (Exception,KeyboardInterrupt)as error:
        report['error']=str(error);print('STOPPED:',str(error));print('No GM retry was sent. If a GM request timed out, check the inventory before retrying.')
    finally:
        (out/'REPORT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Results:',out);print('Account/password are in ACCOUNT-PRIVATE.json. Keep that file private.')
    return status
if __name__=='__main__':raise SystemExit(main())
