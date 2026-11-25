"""Create a consistent SQLite snapshot, including committed WAL data."""
import argparse,sqlite3,os,time,datetime
from pathlib import Path

def backup(source,output):
    source=Path(source).resolve();output=Path(output).resolve()
    if not source.is_file():raise ValueError('Không tìm thấy database nguồn')
    output.parent.mkdir(parents=True,exist_ok=True)
    # Never overwrite an existing backup or database, including through symlinks.
    fd=os.open(output,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600);os.close(fd)
    try:
        started=time.monotonic()
        def progress(status,remaining,total):
            if time.monotonic()-started>30:raise TimeoutError('Database bận quá 30 giây; thử sao lưu lại sau')
        src=sqlite3.connect(source.as_uri()+'?mode=ro',uri=True,timeout=5)
        try:
            dst=sqlite3.connect(output)
            try:
                src.backup(dst,pages=128,progress=progress,sleep=.05)
                if dst.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise RuntimeError('Bản sao không qua kiểm tra SQLite')
            finally:dst.close()
        finally:src.close()
    except BaseException:
        output.unlink(missing_ok=True)
        raise
    return output

def main():
    root=Path(__file__).resolve().parent.parent
    parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,default=root/'data/game.sqlite3');parser.add_argument('--output',type=Path)
    args=parser.parse_args();stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f');dest=args.output or root/'backups'/('game-'+stamp+'.sqlite3')
    print('Đã sao lưu và kiểm tra SQLite:',backup(args.source,dest))
if __name__=='__main__':main()
