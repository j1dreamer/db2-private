import sqlite3,tempfile,unittest
from pathlib import Path
from tools.backup import backup

class BackupTests(unittest.TestCase):
 def test_committed_wal_is_in_snapshot_and_existing_backup_is_not_overwritten(self):
  with tempfile.TemporaryDirectory() as temp:
   root=Path(temp);source=root/'live.sqlite3';destination=root/'backup.sqlite3';db=sqlite3.connect(source)
   try:
    db.execute('PRAGMA journal_mode=WAL');db.execute('PRAGMA wal_autocheckpoint=0');db.execute('CREATE TABLE wallet(gem INTEGER)');db.execute('INSERT INTO wallet VALUES(123)');db.commit()
    self.assertGreater((root/'live.sqlite3-wal').stat().st_size,0)
    backup(source,destination)
    with sqlite3.connect(destination) as copy:self.assertEqual(copy.execute('SELECT gem FROM wallet').fetchone()[0],123)
    original=destination.read_bytes()
    with self.assertRaises(FileExistsError):backup(source,destination)
    self.assertEqual(destination.read_bytes(),original);self.assertEqual(db.execute('SELECT gem FROM wallet').fetchone()[0],123)
   finally:db.close()
if __name__=='__main__':unittest.main()
