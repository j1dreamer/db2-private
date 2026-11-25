import sqlite3,json,secrets,hashlib,hmac,time
from contextlib import contextmanager

def password_hash(password,salt):
    return hashlib.scrypt(password.encode(),salt=bytes.fromhex(salt),n=16384,r=8,p=1).hex()

class Store:
    def __init__(self,path):
        self.db=sqlite3.connect(path,isolation_level=None)
        self.db.row_factory=sqlite3.Row
        self.db.executescript('''PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
        CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY,name TEXT UNIQUE NOT NULL,salt TEXT NOT NULL,password TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,account INTEGER REFERENCES accounts(id),expires INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY,account INTEGER UNIQUE REFERENCES accounts(id),data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS giftcodes(code TEXT PRIMARY KEY,gem INTEGER NOT NULL CHECK(gem>=0),expires INTEGER NOT NULL,max_uses INTEGER NOT NULL CHECK(max_uses>0));
        CREATE TABLE IF NOT EXISTS redemptions(code TEXT REFERENCES giftcodes(code),player INTEGER REFERENCES players(id),PRIMARY KEY(code,player));
        CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS activity_claims(player INTEGER REFERENCES players(id),name TEXT NOT NULL,period TEXT NOT NULL,idx INTEGER NOT NULL,PRIMARY KEY(player,name,period,idx));
        CREATE TABLE IF NOT EXISTS event_claims(event TEXT REFERENCES events(id),player INTEGER REFERENCES players(id),PRIMARY KEY(event,player));
        CREATE TABLE IF NOT EXISTS pool_entries(pool INTEGER NOT NULL,entity INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(pool,entity));
        CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY AUTOINCREMENT,account INTEGER REFERENCES accounts(id),event TEXT NOT NULL,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS chat_messages(id INTEGER PRIMARY KEY AUTOINCREMENT,player INTEGER REFERENCES players(id),kind INTEGER NOT NULL,scope INTEGER NOT NULL,created INTEGER NOT NULL,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS task_counters(player INTEGER REFERENCES players(id),name TEXT NOT NULL,period TEXT NOT NULL,value INTEGER NOT NULL,PRIMARY KEY(player,name,period));
        CREATE TABLE IF NOT EXISTS task_claims(player INTEGER REFERENCES players(id),task INTEGER NOT NULL,period TEXT NOT NULL,PRIMARY KEY(player,task,period));
        CREATE TABLE IF NOT EXISTS arena_entries(player INTEGER PRIMARY KEY,rank INTEGER UNIQUE NOT NULL,source TEXT NOT NULL,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS pvp_runs(player INTEGER REFERENCES players(id),mode TEXT NOT NULL,data TEXT NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(player,mode));
        CREATE TABLE IF NOT EXISTS battle_reports(id TEXT PRIMARY KEY,mode TEXT NOT NULL,attacker INTEGER NOT NULL,defender INTEGER NOT NULL,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS multi_ladder(mode TEXT NOT NULL,bracket TEXT NOT NULL,player INTEGER NOT NULL,rank INTEGER NOT NULL,source TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(mode,bracket,player),UNIQUE(mode,bracket,rank));
        CREATE TABLE IF NOT EXISTS worship_counts(mode TEXT NOT NULL,player INTEGER NOT NULL,value INTEGER NOT NULL,PRIMARY KEY(mode,player));
        CREATE TABLE IF NOT EXISTS guilds(id INTEGER PRIMARY KEY,name TEXT UNIQUE NOT NULL,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS guild_members(player INTEGER PRIMARY KEY REFERENCES players(id),guild INTEGER REFERENCES guilds(id),role TEXT NOT NULL,joined INTEGER NOT NULL,contribution INTEGER NOT NULL,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS guild_requests(guild INTEGER REFERENCES guilds(id),player INTEGER REFERENCES players(id),created INTEGER NOT NULL,PRIMARY KEY(guild,player));
        CREATE TABLE IF NOT EXISTS guild_war_days(mode TEXT NOT NULL,day TEXT NOT NULL,PRIMARY KEY(mode,day));
        CREATE TABLE IF NOT EXISTS guild_war_rooms(mode TEXT NOT NULL,day TEXT NOT NULL,room INTEGER NOT NULL,guild1 INTEGER NOT NULL,guild2 INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(mode,day,room));
        CREATE TABLE IF NOT EXISTS guild_war_history(mode TEXT NOT NULL,guild INTEGER NOT NULL,wins INTEGER NOT NULL,losses INTEGER NOT NULL,PRIMARY KEY(mode,guild));
        CREATE TABLE IF NOT EXISTS guild_war_awards(mode TEXT NOT NULL,day TEXT NOT NULL,player INTEGER REFERENCES players(id),PRIMARY KEY(mode,day,player));
        CREATE TABLE IF NOT EXISTS resource_rooms(day TEXT NOT NULL,level TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(day,level));
        CREATE TABLE IF NOT EXISTS resource_registrations(day TEXT NOT NULL,player INTEGER REFERENCES players(id),level TEXT NOT NULL,PRIMARY KEY(day,player));
        CREATE TABLE IF NOT EXISTS resource_awards(day TEXT NOT NULL,level TEXT NOT NULL,player INTEGER REFERENCES players(id),kind TEXT NOT NULL,PRIMARY KEY(day,level,player,kind));
        CREATE TABLE IF NOT EXISTS resource_champions(level TEXT PRIMARY KEY,player INTEGER REFERENCES players(id),data TEXT NOT NULL,day TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS resource_worship(day TEXT NOT NULL,player INTEGER REFERENCES players(id),level TEXT NOT NULL,champion INTEGER REFERENCES players(id),PRIMARY KEY(day,player,level));
        CREATE TABLE IF NOT EXISTS top_arena_seats(season INTEGER NOT NULL,no INTEGER NOT NULL,player INTEGER REFERENCES players(id),joined INTEGER NOT NULL,paid INTEGER NOT NULL,end INTEGER NOT NULL,PRIMARY KEY(season,no),UNIQUE(season,player));
        CREATE TABLE IF NOT EXISTS top_arena_settlements(season INTEGER NOT NULL,no INTEGER NOT NULL,player INTEGER REFERENCES players(id),PRIMARY KEY(season,no,player));
        CREATE TABLE IF NOT EXISTS tournament_rooms(mode TEXT NOT NULL,theme INTEGER NOT NULL,season TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(mode,theme,season));
        CREATE TABLE IF NOT EXISTS tournament_champions(mode TEXT NOT NULL,theme INTEGER NOT NULL,level TEXT NOT NULL,player INTEGER REFERENCES players(id),data TEXT NOT NULL,season TEXT NOT NULL,PRIMARY KEY(mode,theme,level));
        CREATE TABLE IF NOT EXISTS tournament_awards(mode TEXT NOT NULL,theme INTEGER NOT NULL,season TEXT NOT NULL,player INTEGER REFERENCES players(id),stage TEXT NOT NULL,PRIMARY KEY(mode,theme,season,player,stage));
        CREATE TABLE IF NOT EXISTS tournament_worship(mode TEXT NOT NULL,theme INTEGER NOT NULL,day TEXT NOT NULL,player INTEGER REFERENCES players(id),level TEXT NOT NULL,champion INTEGER REFERENCES players(id),PRIMARY KEY(mode,theme,day,player,level));
        CREATE TABLE IF NOT EXISTS boss_damage(mode TEXT NOT NULL,day TEXT NOT NULL,scope INTEGER NOT NULL,bracket TEXT NOT NULL,player INTEGER REFERENCES players(id),damage REAL NOT NULL,info TEXT NOT NULL,PRIMARY KEY(mode,day,scope,bracket,player));
        CREATE TABLE IF NOT EXISTS boss_settlements(mode TEXT NOT NULL,day TEXT NOT NULL,scope INTEGER NOT NULL,bracket TEXT NOT NULL,player INTEGER REFERENCES players(id),rank INTEGER NOT NULL,PRIMARY KEY(mode,day,scope,bracket,player));
        CREATE TABLE IF NOT EXISTS practice_sessions(mode TEXT NOT NULL,player INTEGER REFERENCES players(id),ctime INTEGER NOT NULL,data TEXT NOT NULL,finish INTEGER NOT NULL,settled INTEGER NOT NULL,PRIMARY KEY(mode,player,ctime));
        CREATE TABLE IF NOT EXISTS eye_occupations(id INTEGER PRIMARY KEY,player INTEGER REFERENCES players(id),day TEXT NOT NULL,type TEXT NOT NULL,rank INTEGER NOT NULL,start INTEGER NOT NULL,finish INTEGER NOT NULL,ready INTEGER NOT NULL,data TEXT NOT NULL,active INTEGER NOT NULL,rewarded INTEGER NOT NULL);
        CREATE UNIQUE INDEX IF NOT EXISTS eye_one_team ON eye_occupations(player) WHERE active=1;
        CREATE UNIQUE INDEX IF NOT EXISTS eye_one_seat ON eye_occupations(rank) WHERE active=1 AND type='public';
        CREATE INDEX IF NOT EXISTS chat_channel ON chat_messages(kind,scope,id);
        CREATE INDEX IF NOT EXISTS chat_sender ON chat_messages(player,id);
        CREATE TABLE IF NOT EXISTS friend_requests(source INTEGER REFERENCES players(id),target INTEGER REFERENCES players(id),created INTEGER NOT NULL,PRIMARY KEY(source,target));
        CREATE TABLE IF NOT EXISTS friend_links(a INTEGER REFERENCES players(id),b INTEGER REFERENCES players(id),PRIMARY KEY(a,b));
        CREATE TABLE IF NOT EXISTS friend_gifts(source INTEGER REFERENCES players(id),target INTEGER REFERENCES players(id),day TEXT NOT NULL,received INTEGER NOT NULL,PRIMARY KEY(source,target,day));
        CREATE TABLE IF NOT EXISTS adventure_runs(player INTEGER PRIMARY KEY REFERENCES players(id),data TEXT NOT NULL,expires INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,created INTEGER NOT NULL,action TEXT NOT NULL,detail TEXT NOT NULL);
        ''')
    @contextmanager
    def transaction(self):
        self.db.execute('BEGIN IMMEDIATE')
        try:yield;self.db.execute('COMMIT')
        except BaseException:self.db.execute('ROLLBACK');raise
    def register(self,name,password):
        if not 3<=len(name)<=40 or not 6<=len(password)<=256:raise ValueError('Tên 3–40 ký tự, mật khẩu 6–256 ký tự')
        salt=secrets.token_hex(16)
        self.db.execute('INSERT INTO accounts(name,salt,password) VALUES(?,?,?)',(name,salt,password_hash(password,salt)))
    def login(self,name,password):
        row=self.db.execute('SELECT * FROM accounts WHERE name=?',(name,)).fetchone()
        if not row or not hmac.compare_digest(row['password'],password_hash(password,row['salt'])):return None
        token=secrets.token_urlsafe(32)
        self.db.execute('INSERT INTO sessions VALUES(?,?,?)',(token,row['id'],int(time.time())+86400))
        return row['id'],token
    def account(self,token):
        row=self.db.execute('SELECT account FROM sessions WHERE token=? AND expires>?',(token,int(time.time()))).fetchone()
        return row[0] if row else None
    def player(self,account):
        # Profile migration and its one-time gifts must commit together.
        if not self.db.in_transaction:
            with self.transaction():return self.player(account)
        row=self.db.execute('SELECT id,data FROM players WHERE account=?',(account,)).fetchone()
        if not row:return None
        data=json.loads(row['data'])
        from .profile import upgrade_profile
        had_starter_gift=bool(data.get('privateStarterTicketsGranted'))
        if upgrade_profile(data,account):
            if not had_starter_gift and data.get('privateStarterTicketsGranted'):
                self.audit('starter_tickets',{'player':data['id'],'items':{'119':1,'120':1}})
            self.save(data);self.audit('profile_migration',{'player':data['id'],'schema':data['profileSchemaVersion']})
        from .state import refresh_time
        changed=refresh_time(data)
        from .social import refresh as refresh_friend
        changed=refresh_friend(self,data)or changed
        from .shops import refresh_due
        changed=refresh_due(data)or changed
        from .tasks import refresh as refresh_tasks
        changed=refresh_tasks(self,data)or changed
        from .arena import refresh as refresh_arena
        changed=refresh_arena(self,data)or changed
        from .arena3v3 import refresh as refresh_three
        changed=refresh_three(self,data)or changed
        from .guild import refresh as refresh_guild
        changed=refresh_guild(self,data)or changed
        from .bosses import refresh as refresh_bosses
        changed=refresh_bosses(self,data)or changed
        from .practice import refresh as refresh_practice
        changed=refresh_practice(self,data)or changed
        from .eye import refresh as refresh_eye
        changed=refresh_eye(self,data)or changed
        from .endless import refresh as refresh_endless
        changed=refresh_endless(data)or changed
        from .expedition import refresh as refresh_expedition
        changed=refresh_expedition(data)or changed
        from .commerce import refresh as refresh_commerce
        changed=refresh_commerce(data)or changed
        from .activities import refresh as refresh_activities
        changed=refresh_activities(self,data)or changed
        from .tournaments import refresh as refresh_tournaments
        changed=refresh_tournaments(self,data)or changed
        from .top_arena import refresh as refresh_top
        changed=refresh_top(data)or changed
        from .resources import refresh as refresh_resources
        changed=refresh_resources(self,data)or changed
        from .guild_wars import refresh as refresh_wars
        if refresh_wars(self,data)or changed:self.save(data)
        return data
    def create_player(self,account,name):
        from .profile import new_profile
        if not isinstance(name,str) or not 1<=len(name)<=20:raise ValueError('Tên nhân vật 1–20 ký tự')
        with self.transaction():
            existing=self.player(account)
            if existing:return existing
            username=self.db.execute('SELECT name FROM accounts WHERE id=?',(account,)).fetchone()[0]
            cur=self.db.execute("INSERT INTO players(account,data) VALUES(?,'{}')",(account,))
            profile=new_profile(cur.lastrowid,account,name,username);self.save(profile)
            self.audit('create_player',{'player':profile['id'],'account':account})
            self.audit('starter_tickets',{'player':profile['id'],'items':{'119':1,'120':1}})
            from .state import refresh_time
            from .tasks import refresh
            refresh_time(profile);refresh(self,profile);self.save(profile)
            return profile
    def save(self,player):self.db.execute('UPDATE players SET data=? WHERE id=?',(json.dumps(player,ensure_ascii=False),player['id']))
    def redeem(self,player,code):
        with self.transaction():
            row=self.db.execute('SELECT * FROM giftcodes WHERE code=?',(code,)).fetchone()
            if not row or row['expires']<time.time():raise ValueError('Giftcode không tồn tại hoặc hết hạn')
            count=self.db.execute('SELECT count(*) FROM redemptions WHERE code=?',(code,)).fetchone()[0]
            if count>=row['max_uses']:raise ValueError('Giftcode đã hết lượt')
            # Load state inside the transaction, never trust a cached client profile.
            data=json.loads(self.db.execute('SELECT data FROM players WHERE id=?',(player,)).fetchone()[0])
            self.db.execute('INSERT INTO redemptions VALUES(?,?)',(code,player))
            data['gem']+=row['gem'];self.save(data)
            self.audit('redeem',{'player':player,'code':code,'gem':row['gem']})
            return data
    def notify(self,account,event,data):
        self.db.execute('INSERT INTO notifications(account,event,data) VALUES(?,?,?)',(account,event,json.dumps(data,ensure_ascii=False)))
    def audit(self,action,detail):
        self.db.execute('INSERT INTO audit(created,action,detail) VALUES(?,?,?)',(int(time.time()),action,json.dumps(detail,ensure_ascii=False)))
        from .tasks import record
        record(self,action,detail)
