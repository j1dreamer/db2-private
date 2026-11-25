"""Read-only environment checks plus disposable SQLite/socket probes."""
import argparse,sys,sqlite3,hashlib,importlib.util,tempfile,socket
from pathlib import Path

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=20003);parser.add_argument('--skip-network',action='store_true');args=parser.parse_args()
    failures=[]
    def check(name,fn):
        try:detail=fn();print('OK  '+name+(' — '+str(detail) if detail else ''))
        except Exception as exc:failures.append(name);print('LỖI '+name+' — '+str(exc))
    def python():
        if sys.version_info<(3,10):raise RuntimeError('Cần Python 3.10 trở lên')
        return sys.version.split()[0]
    def aiohttp():
        if importlib.util.find_spec('aiohttp') is None:raise RuntimeError('Chạy python start.py để cài vào .venv, rồi dùng Python trong .venv kiểm tra lại')
    def crypto():hashlib.scrypt(b'probe',salt=b'0123456789abcdef',n=16384,r=8,p=1)
    def database():
        root=Path(__file__).resolve().parent.parent
        with tempfile.TemporaryDirectory(prefix='db2-doctor-',dir=root) as tmp:
            with sqlite3.connect(Path(tmp)/'probe.sqlite3') as db:
                db.execute('CREATE TABLE probe(value INTEGER)');db.commit();db.execute('INSERT INTO probe VALUES(1)');db.rollback()
                assert db.execute('SELECT count(*) FROM probe').fetchone()[0]==0
                assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
        return sqlite3.sqlite_version
    def port():
        with socket.socket() as sock:sock.bind(('127.0.0.1',args.port))
        return str(args.port)
    check('Python',python);check('aiohttp',aiohttp);check('scrypt',crypto);check('SQLite và quyền ghi thư mục',database)
    if not args.skip_network:check('Cổng localhost còn trống',port)
    print('Không đọc hoặc hiển thị token quản trị. Không sửa dữ liệu game.')
    return 1 if failures else 0
if __name__=='__main__':raise SystemExit(main())
