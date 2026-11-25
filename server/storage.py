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
        CREATE TABLE IF NOT EXISTS event_claims(event TEXT REFERENCES events(id),player INTEGER REFERENCES players(id),PRIMARY KEY(event,player));
        CREATE TABLE IF NOT EXISTS pool_entries(pool INTEGER NOT NULL,entity INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(pool,entity));
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
        if refresh_time(data):self.save(data)
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
    def audit(self,action,detail):self.db.execute('INSERT INTO audit(created,action,detail) VALUES(?,?,?)',(int(time.time()),action,json.dumps(detail,ensure_ascii=False)))
