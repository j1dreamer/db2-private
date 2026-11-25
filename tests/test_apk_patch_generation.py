import tempfile,unittest,zipfile
from pathlib import Path
from unittest.mock import patch
from tools.make_apk_patch import make_patch
import tools.apply_apk_fix as apply

class ApkPatchGenerationTests(unittest.TestCase):
 def test_changed_added_and_removed_entries_reconstruct_exact_target(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td);old=root/'old.apk';new=root/'new.apk';out=root/'rebuilt.apk'
   with zipfile.ZipFile(old,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('unchanged',b'A'*10000);z.writestr('changed',b'old');z.writestr('removed',b'gone')
   with zipfile.ZipFile(new,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('added',b'new-entry');z.writestr('unchanged',b'A'*10000);z.writestr('changed',b'new')
    z.comment=b'new comment'
   before=old.read_bytes();plan=make_patch(old,new,root/'patch')
   self.assertTrue(any('copy' in op for op in plan['operations']))
   with patch.object(apply,'OLD_SHA',plan['old_sha256']),patch.object(apply,'NEW_SHA',plan['new_sha256']):
    apply.apply_fix(old,out,root/'patch')
   self.assertEqual(out.read_bytes(),new.read_bytes());self.assertEqual(old.read_bytes(),before)
