import argparse,asyncio,json,os,secrets,hmac,sqlite3,time,gzip,base64,datetime
from pathlib import Path
from aiohttp import web,WSMsgType
from .storage import Store
from .protocol import package,packages,request,response,push
from . import adventure,player_actions,social,mail,rank,shops,chat,bag_actions,team_actions,item_actions,tasks,online,gm,arena,local_boosts,arena3v3,guild,tail,bosses,practice,eye,endless,expedition,commerce,activities,tournaments,top_arena,resources,guild_wars,island,cooperative,time_peak
ROOT=Path(__file__).resolve().parent.parent

def advertised_endpoint(authority,public_host,game_port,forwarded_proto='http'):
    """For private SSH/Tailscale relays, keep the address used by this client."""
    if public_host!='auto':return public_host,game_port
    from urllib.parse import urlsplit
    parsed=urlsplit('//'+authority)
    if not parsed.hostname or parsed.username or parsed.password or parsed.path or parsed.query or parsed.fragment:
        raise ValueError('Invalid connection Host')
    return parsed.hostname,parsed.port or (443 if forwarded_proto=='https'else game_port)

def create_app(data_dir,public_host='127.0.0.1',game_port=20003,admin_token=None,admin_networks=None):
    data_dir=Path(data_dir);data_dir.mkdir(parents=True,exist_ok=True)
    store=Store(data_dir/'game.sqlite3');token=admin_token or secrets.token_urlsafe(32)
    from .profile import SCHEMA_VERSION
    route_coverage=json.loads((ROOT/'analysis/route-coverage.json').read_text())
    from .access_control import middleware
    app=web.Application(client_max_size=256*1024,middlewares=[middleware(admin_networks)])
    app[web.AppKey('store',Store)]=store
    live={};mail_seen={};selected_players={};notification_lock=asyncio.Lock();notification_task=None
    war_maintenance_task=None
    liveops_task=None
    # Offline users load durable state on login; stale pre-restart pushes must not
    # be delivered again after that full snapshot.
    store.db.execute('DELETE FROM notifications')
    def annotate_online(value):
        online=set(selected_players.values())
        def walk(node):
            if isinstance(node,dict):
                if 'playerId'in node and 'isOnline'in node:node['isOnline']=node['playerId']in online
                for item in node.values():walk(item)
            elif isinstance(node,list):
                for item in node:walk(item)
        walk(value)
    async def flush_notifications():
        async with notification_lock:
            while True:
                rows=store.db.execute('SELECT * FROM notifications ORDER BY id LIMIT 100').fetchall()
                if not rows:return
                for row in rows:
                    body=json.loads(row['data']);annotate_online(body)
                    for peer in list(live.get(row['account'],())):
                        if peer.closed or peer not in mail_seen:continue
                        if row['event']=='onNewMail':
                            mid=body['mail']['_id'];seen=mail_seen.setdefault(peer,set())
                            if mid in seen:continue
                            seen.add(mid)
                        try:await asyncio.wait_for(peer.send_bytes(push(row['event'],body)),timeout=3)
                        except (ConnectionError,RuntimeError,asyncio.TimeoutError):pass
                    store.db.execute('DELETE FROM notifications WHERE id=?',(row['id'],))
    def start_notifications():
        nonlocal notification_task
        if notification_task is None or notification_task.done():notification_task=asyncio.create_task(flush_notifications())
    async def maintain_guild_wars():
        while True:
            for mode in guild_wars.MODES:
                try:guild_wars.prepare(store,mode)
                except (ValueError,sqlite3.IntegrityError)as exc:store.audit('guild_war_maintenance_error',{'mode':mode,'error':str(exc)[:500]})
            start_notifications()
            await asyncio.sleep(30)
    async def liveops_maintenance():
        while True:
            control.tick()
            await asyncio.sleep(10)
    async def start_war_maintenance(app):
        nonlocal war_maintenance_task,liveops_task
        liveops_task=asyncio.create_task(liveops_maintenance())
        war_maintenance_task=asyncio.create_task(maintain_guild_wars())
    app.on_startup.append(start_war_maintenance)
    async def health(req):
        from .node_runtime import runtime_status
        combat={k:v for k,v in runtime_status().items()if k!='executable'}
        return web.json_response({'combat':combat,'status':'ok'if combat['available']else'degraded','stage':'protocol-development','playable_verified':False,'build':'eng-sp-sss-slots-snake-v13','profile_schema':SCHEMA_VERSION,'routes':{'implemented':route_coverage['implemented_routes'],'target':342}})
    async def config(req):
        from .economy import client_script
        return web.json_response({'runScriptInfo':{'script':client_script(store)},'inReviewPackageInfos':[]})
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
    from .admin import Admin
    control=Admin(store,token,lambda:set(selected_players.values()),start_notifications)
    async def admin(req):return await(control.get(req)if req.method=='GET'else control.post(req))
    async def ws_handler(req):
        ws=web.WebSocketResponse(max_msg_size=256*1024,heartbeat=30,receive_timeout=90);await ws.prepare(req)
        uid=None;handshake=False;acked=False;recent={}
        async for msg in ws:
            if msg.type!=WSMsgType.BINARY:continue
            try:
                for kind,body in packages(msg.data):
                    if kind==1:
                        json.loads(body);handshake=True
                        await ws.send_bytes(package(1,json.dumps({'code':200,'sys':{'heartbeat':30,'dict':{},'protos':{'version':1,'server':{},'client':{}}}}).encode()))
                    elif kind==2:
                        if not handshake:raise ValueError('Missing handshake')
                        acked=True;await ws.send_bytes(package(3))
                    elif kind==3:
                        if not acked:raise ValueError('Missing handshake ACK')
                        await ws.send_bytes(package(3))
                        if uid and ws in selected_players:
                            current=store.player(uid)
                            if current:current['atime']=int(time.time()*1000);store.save(current)
                            start_notifications()
                    elif kind==4:
                        if not acked:raise ValueError('Missing handshake ACK')
                        ident,route,args=request(body)
                        if ident in recent:
                            original,encoded=recent[ident]
                            if original!=body:raise ValueError('Request ID reused with different payload')
                            await ws.send_bytes(encoded);continue
                        if route=='gate.gateHandler.queryEntry':
                            host,port=advertised_endpoint(req.host,public_host,game_port,req.headers.get('X-Forwarded-Proto',req.scheme))
                            result={'code':200,'host':host,'port':port}
                        elif route=='connector.entryHandler.entry':
                            if uid in live:live[uid].discard(ws)
                            mail_seen.pop(ws,None);selected_players.pop(ws,None)
                            uid=store.account(args.get('token','')) if args.get('serverId')==1 else None;result={'code':200 if uid else 500,'msg':'' if uid else 'Phiên đăng nhập không hợp lệ'}
                            if uid:live.setdefault(uid,set()).add(ws)
                        elif not uid:result={'code':500,'msg':'Chưa đăng nhập'}
                        elif route=='connector.playerHandler.getPlayers':
                            p=store.player(uid);result={'code':200,'players':[{'id':p['id'],'oldServerId':1,'name':p['name']}] if p else []}
                        elif route in ('connector.playerHandler.createPlayer','connector.playerHandler.entry'):
                            try:
                                p=store.create_player(uid,args.get('name','')) if route.endswith('createPlayer') else store.player(uid)
                                if not p or (route.endswith('.entry') and args.get('playerId')!=p['id']):raise ValueError('Không tìm thấy nhân vật')
                                p['atime']=int(time.time()*1000);p['privateOnlineClock']=p['atime'];p['extra']['serverTime']=p['atime'];p['extra']['serverTimeStr']=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).strftime('%Y-%m-%d %H:%M:%S')
                                store.save(p);selected_players[ws]=p['id']
                                chat.load(store,p)
                                packed=base64.b64encode(gzip.compress(json.dumps(p,ensure_ascii=False).encode())).decode()
                                result={'code':200,'player':packed}
                                mail_seen[ws]={m['_id'] for m in p['extra']['mails']}
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route.startswith(('logic.','chat.'))and ws not in selected_players:result={'code':500,'msg':'Chưa chọn nhân vật'}
                        elif route in guild_wars.ROUTES:
                            try:result=await guild_wars.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in resources.ROUTES:
                            try:result=await resources.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in top_arena.ROUTES:
                            try:result=await top_arena.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in tournaments.ROUTES:
                            try:result=await tournaments.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in activities.ROUTES:
                            try:result=activities.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in commerce.ROUTES:
                            try:result=commerce.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in expedition.ROUTES or route==expedition.BEGIN_ROUTE:
                            try:result=await expedition.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in endless.ROUTES:
                            try:result=await endless.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in eye.ROUTES:
                            try:result=await eye.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in time_peak.ROUTES or route==time_peak.BEGIN_ROUTE:
                            try:result=await time_peak.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in cooperative.ROUTES:
                            try:result=await cooperative.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in island.ROUTES:
                            try:result=await island.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in practice.ROUTES:
                            try:result=await practice.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in bosses.ROUTES:
                            try:result=await bosses.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in tail.ROUTES:
                            try:result=await tail.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in guild.ROUTES:
                            try:result=guild.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in arena3v3.ROUTES:
                            try:result=await arena3v3.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in arena.ROUTES:
                            try:result=await arena.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in gm.ROUTES:
                            try:result=gm.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in online.ROUTES:
                            try:result=online.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in local_boosts.ROUTES:
                            try:result=local_boosts.handle(store,uid,route,args)
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
                        elif route in tasks.ROUTES:
                            try:result=tasks.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in item_actions.ROUTES:
                            try:result=item_actions.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in team_actions.ROUTES:
                            try:result=team_actions.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in bag_actions.ROUTES:
                            try:result=bag_actions.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in chat.ROUTES:
                            try:result=chat.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in shops.ROUTES:
                            try:result=shops.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in rank.ROUTES:
                            try:result=rank.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in social.ROUTES or route in mail.ROUTES:
                            try:result=(social if route in social.ROUTES else mail).handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in player_actions.ROUTES:
                            try:result=player_actions.handle(store,uid,route,args)
                            except ValueError as exc:result={'code':500,'msg':str(exc)}
                        elif route in adventure.ROUTES:
                            try:result=await adventure.handle(store,uid,route,args)
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
                                from .state import snapshot,delta
                                before=snapshot(p);p,counts=store.redeem(p['id'],str(args.get('giftCode','')),return_counts=True)
                                result=delta(before,p,route,{'entityCountMap':counts});result['gem']=p['gem']
                            except (ValueError,sqlite3.IntegrityError):result={'code':500,'msg':'Giftcode không hợp lệ, đã dùng hoặc hết lượt'}
                        else:
                            # Do not pretend unimplemented gameplay succeeded.
                            result={'code':500,'msg':'Route đang được triển khai: '+route}
                            store.audit('unsupported_route',{'route':route,'account':uid})
                        if ident:
                            if uid and ws in selected_players and result.get('code')==200 and route.startswith(('logic.','chat.')):
                                current=store.player(uid)
                                if current:
                                    result['task']=current['task']
                                    from .liveops import progress_events
                                    progress=progress_events(store,current)
                                    if progress:result.setdefault('activity',{}).setdefault('map',{}).update(progress)
                            annotate_online(result)
                            encoded=response(ident,result);recent[ident]=(body,encoded)
                            if len(recent)>256:del recent[next(iter(recent))]
                            await ws.send_bytes(encoded)
                            start_notifications()
                    else:raise ValueError('Unknown package')
            except (ValueError,KeyError,IndexError,UnicodeError):await ws.close(code=1002,message=b'Invalid Pomelo packet')
        if uid in live:live[uid].discard(ws)
        mail_seen.pop(ws,None);selected_players.pop(ws,None)
        if uid:
            p=store.player(uid)
            if p:p['atime']=int(time.time()*1000);store.save(p)
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
    for endpoint in ('overview','players','events','calendar','gacha','giftcodes','audit','provenance','economy','inventory','box-presets'):app.router.add_get('/admin/'+endpoint,admin)
    app.router.add_get('/admin/players/{id}',admin);app.router.add_get('/admin/catalog/{id}',admin)
    async def admin_css(req):return web.FileResponse(ROOT/'web/admin.css')
    async def admin_js(req):return web.FileResponse(ROOT/'web/admin.js')
    app.router.add_get('/admin',admin_page);app.router.add_static('/assets/',ROOT/'web/assets');app.router.add_get('/admin.css',admin_css);app.router.add_get('/admin.js',admin_js)
    async def close(app):
        if liveops_task and not liveops_task.done():
            liveops_task.cancel();await asyncio.gather(liveops_task,return_exceptions=True)
        if war_maintenance_task and not war_maintenance_task.done():
            war_maintenance_task.cancel();await asyncio.gather(war_maintenance_task,return_exceptions=True)
        if notification_task and not notification_task.done():
            notification_task.cancel();await asyncio.gather(notification_task,return_exceptions=True)
        await tournaments.close(store)
        store.db.close()
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
