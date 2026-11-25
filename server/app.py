import argparse,asyncio,json,os,secrets,hmac,sqlite3,time,gzip,base64
from pathlib import Path
from aiohttp import web,WSMsgType
from .storage import Store
from .protocol import package,packages,request,response
ROOT=Path(__file__).resolve().parent.parent

def create_app(data_dir,public_host='127.0.0.1',game_port=20003,admin_token=None):
    data_dir=Path(data_dir);data_dir.mkdir(parents=True,exist_ok=True)
    store=Store(data_dir/'game.sqlite3');token=admin_token or secrets.token_urlsafe(32)
    app=web.Application(client_max_size=256*1024)
    app[web.AppKey('store',Store)]=store
    async def health(req):return web.json_response({'status':'ok','stage':'protocol-development','playable_verified':False})
    async def config(req):return web.json_response({'runScriptInfo':{'script':''},'inReviewPackageInfos':[]})
    async def account(req):
        fields=await req.post();name=fields.get('name','');password=fields.get('password','')
        try:
            if req.path.endswith('/register'):
                store.register(name,password);return web.json_response({'code':200})
            result=store.login(name,password)
            if not result:return web.json_response({'code':500,'msg':'Sai tài khoản hoặc mật khẩu'})
            uid,session=result;return web.json_response({'code':200,'uid':str(uid),'token':session,'age':18})
        except (ValueError,sqlite3.IntegrityError) as exc:return web.json_response({'code':500,'msg':str(exc) if isinstance(exc,ValueError) else 'Tên tài khoản đã tồn tại'})
    async def servers(req):return web.json_response({'code':200,'serverList':[{'serverId':1,'oldServerId':1,'name':'DB2 Private'}]})
    async def report_error(req):
        fields=await req.post();account_id=store.account(str(fields.get('token','')))
        if not account_id:raise web.HTTPUnauthorized()
        store.audit('client_error',{'account':account_id,'msg':str(fields.get('msg',''))[:4096]})
        return web.json_response({'code':200})
    async def notice(req):return web.json_response({'title':'DB2 Private','content':'Server thử nghiệm tương thích client.'})
    async def admin_page(req):return web.FileResponse(ROOT/'web/index.html',headers={'Cache-Control':'no-store'})
    async def admin(req):
        supplied=req.headers.get('Authorization','')
        if not hmac.compare_digest(supplied,'Bearer '+token):raise web.HTTPUnauthorized()
        if req.method=='GET':
            if req.path=='/admin/catalog':
                from .gameplay import rows
                query=req.query.get('q','').casefold()[:80];items={r['kindId']:r for name in ('entity','entityExt') for r in rows(name)}
                matches=[{'id':r['kindId'],'name':r['kindName'],'type':r['type']} for r in items.values() if query in (str(r['kindId'])+' '+str(r['kindName'])).casefold()]
                return web.json_response({'items':matches[:50],'total':len(matches)})
            return web.json_response({'players':[json.loads(r[0]) for r in store.db.execute('SELECT data FROM players')], 'giftcodes':[dict(r) for r in store.db.execute('SELECT * FROM giftcodes')], 'events':[json.loads(r[0]) for r in store.db.execute('SELECT data FROM events')], 'gacha':[{'pool':r['pool'],**json.loads(r['data'])} for r in store.db.execute('SELECT pool,data FROM pool_entries ORDER BY pool,entity')], 'audit':[dict(r) for r in store.db.execute('SELECT * FROM audit ORDER BY id DESC LIMIT 40')]})
        try:
            body=await req.json();action=body.get('action')
            with store.transaction():
                if action=='giftcode':
                    code=str(body['code']).strip();gem=int(body['gem']);uses=int(body.get('max_uses',100));expires=int(body.get('expires',time.time()+86400*30))
                    if not code or len(code)>64 or not 0<=gem<=10**9 or uses<1:raise ValueError('Dữ liệu giftcode không hợp lệ')
                    store.db.execute('INSERT INTO giftcodes VALUES(?,?,?,?)',(code,gem,expires,uses))
                elif action=='grant':
                    pid=int(body['player']);amount=int(body['gem'])
                    if not 0<amount<=10**9:raise ValueError('Số gem không hợp lệ')
                    row=store.db.execute('SELECT data FROM players WHERE id=?',(pid,)).fetchone()
                    if not row:raise ValueError('Không tìm thấy nhân vật')
                    p=json.loads(row[0]);p['gem']+=amount;store.save(p)
                elif action=='gacha_reset':
                    pool=int(body['pool'])
                    if pool not in (102,202,203,204):raise ValueError('Pool không hợp lệ')
                    body['previous']=[json.loads(r[0]) for r in store.db.execute('SELECT data FROM pool_entries WHERE pool=?',(pool,))]
                    store.db.execute('DELETE FROM pool_entries WHERE pool=?',(pool,))
                elif action=='gacha_entry':
                    from .gameplay import validate_pool_entry
                    pool,entry=validate_pool_entry(body)
                    store.db.execute('INSERT INTO pool_entries VALUES(?,?,?) ON CONFLICT(pool,entity) DO UPDATE SET data=excluded.data',(pool,entry['entityId'],json.dumps(entry)))
                elif action=='event':
                    event={'id':str(body['id']),'name':str(body['name']),'start':int(body['start']),'end':int(body['end']),'gem':int(body['gem'])}
                    if not event['id'] or event['end']<=event['start'] or not 0<=event['gem']<=10**9:raise ValueError('Event không hợp lệ')
                    store.db.execute('INSERT INTO events VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',(event['id'],json.dumps(event)))
                else:raise ValueError('Thao tác chưa được hỗ trợ')
                store.audit(action,body)
            return web.json_response({'ok':True})
        except (ValueError,KeyError,TypeError,sqlite3.IntegrityError):return web.json_response({'error':'Dữ liệu không hợp lệ hoặc mã đã tồn tại'},status=400)
    async def ws_handler(req):
        ws=web.WebSocketResponse(max_msg_size=256*1024);await ws.prepare(req)
        uid=None;handshake=False;acked=False;recent={}
        async for msg in ws:
            if msg.type!=WSMsgType.BINARY:continue
            try:
                for kind,body in packages(msg.data):
                    if kind==1:
                        json.loads(body);handshake=True
                        await ws.send_bytes(package(1,json.dumps({'code':200,'sys':{'heartbeat':5,'dict':{},'protos':{'version':1,'server':{},'client':{}}}}).encode()))
                    elif kind==2:
                        if not handshake:raise ValueError('Missing handshake')
                        acked=True;await ws.send_bytes(package(3))
                    elif kind==3:
                        if not acked:raise ValueError('Missing handshake ACK')
                        await ws.send_bytes(package(3))
                    elif kind==4:
                        if not acked:raise ValueError('Missing handshake ACK')
                        ident,route,args=request(body)
                        if ident in recent:
                            original,encoded=recent[ident]
                            if original!=body:raise ValueError('Request ID reused with different payload')
                            await ws.send_bytes(encoded);continue
                        if route=='gate.gateHandler.queryEntry':result={'code':200,'host':public_host,'port':game_port}
                        elif route=='connector.entryHandler.entry':
                            uid=store.account(args.get('token','')) if args.get('serverId')==1 else None;result={'code':200 if uid else 500,'msg':'' if uid else 'Phiên đăng nhập không hợp lệ'}
                        elif not uid:result={'code':500,'msg':'Chưa đăng nhập'}
                        elif route=='connector.playerHandler.getPlayers':
                            p=store.player(uid);result={'code':200,'players':[{'id':p['id'],'oldServerId':1,'name':p['name']}] if p else []}
                        elif route in ('connector.playerHandler.createPlayer','connector.playerHandler.entry'):
                            try:
                                p=store.create_player(uid,args.get('name','')) if route.endswith('createPlayer') else store.player(uid)
                                if not p or (route.endswith('.entry') and args.get('playerId')!=p['id']):raise ValueError('Không tìm thấy nhân vật')
                                packed=base64.b64encode(gzip.compress(json.dumps(p,ensure_ascii=False).encode())).decode()
                                result={'code':200,'player':packed}
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route.startswith('logic.pointHandler.'):
                            from .gameplay import draw,select_pool
                            action=route.rsplit('.',1)[-1]
                            mapping={name+suffix:(name,count) for name in ('normal','advanced') for suffix,count in (('',1),('Ten',10),('Hundred',100))}
                            try:
                                if action in ('switchAdvancedPool','selectWishClassId'):result=select_pool(store,uid,action,args)
                                elif action in mapping:result=draw(store,uid,*mapping[action]);result['_temp']['route']=route
                                else:raise ValueError('Thao tác pool chưa triển khai')
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route=='logic.playerHandler.rename':
                            from .gameplay import rename_player
                            try:result=rename_player(store,uid,args.get('name'))
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route=='logic.playerHandler.receiveActivityAward':
                            from .gameplay import claim_events
                            try:result=claim_events(store,uid,args.get('activityNames'),args.get('rewardIdxs'))
                            except (ValueError,sqlite3.IntegrityError):result={'code':500,'msg':'Không thể nhận thưởng hoặc đã nhận'}
                        elif route=='logic.playerHandler.useGiftCode':
                            try:
                                p=store.player(uid)
                                if not p:raise ValueError('Chưa có nhân vật')
                                p=store.redeem(p['id'],str(args.get('giftCode','')))
                                result={'code':200,'gem':p['gem'],'_temp':{'route':route}}
                            except (ValueError,sqlite3.IntegrityError):result={'code':500,'msg':'Giftcode không hợp lệ, đã dùng hoặc hết lượt'}
                        else:
                            # Do not pretend unimplemented gameplay succeeded.
                            result={'code':500,'msg':'Route đang được triển khai: '+route}
                            store.audit('unsupported_route',{'route':route,'account':uid})
                        if ident:
                            encoded=response(ident,result);recent[ident]=(body,encoded)
                            if len(recent)>256:del recent[next(iter(recent))]
                            await ws.send_bytes(encoded)
                    else:raise ValueError('Unknown package')
            except (ValueError,KeyError,IndexError,UnicodeError):await ws.close(code=1002,message=b'Invalid Pomelo packet')
        return ws
    async def root(req):
        if req.headers.get('Upgrade','').lower()=='websocket':return await ws_handler(req)
        return await admin_page(req)
    app.router.add_get('/',root);app.router.add_get('/health',health)
    app.router.add_get('/user/clientConfig',config);app.router.add_get('/client_config.json',config)
    app.router.add_post('/user/reportClientError',report_error)
    app.router.add_post('/user/register',account);app.router.add_post('/user/login',account)
    app.router.add_route('*','/user/serverInfo',servers);app.router.add_get('/notice.json',notice)
    app.router.add_route('*','/admin/api',admin);app.router.add_get('/admin/catalog',admin)
    async def close(app):store.db.close()
    app.on_cleanup.append(close)
    return app

def main():
    p=argparse.ArgumentParser();p.add_argument('--bind',default='127.0.0.1');p.add_argument('--public-host',default='127.0.0.1');p.add_argument('--port',type=int,default=20003);p.add_argument('--data',default=str(ROOT/'data'));a=p.parse_args()
    directory=Path(a.data);directory.mkdir(parents=True,exist_ok=True);secret=directory/'admin-token'
    if not secret.exists():
        fd=os.open(secret,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,'w') as f:f.write(secrets.token_urlsafe(32))
    app=create_app(directory,a.public_host,a.port,secret.read_text().strip())
    print(f'Web quản trị: http://127.0.0.1:{a.port} — token tại {secret}')
    web.run_app(app,host=a.bind,port=a.port)
if __name__=='__main__':main()
