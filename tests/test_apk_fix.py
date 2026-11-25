import tempfile,unittest,json,hashlib
from pathlib import Path
from unittest.mock import patch
import tools.apply_apk_fix as fix

class ApkFixTests(unittest.TestCase):
 def test_reconstruction_verifies_target_and_preserves_original(self):
  with tempfile.TemporaryDirectory() as td:
   r=Path(td);src=r/'old.apk';out=r/'fixed.apk';src.write_bytes(b'ABCD');old=hashlib.sha256(b'ABCD').hexdigest();new=hashlib.sha256(b'XYZABCD').hexdigest()
   (r/'literals.bin').write_bytes(b'XYZ');(r/'plan.json').write_text(json.dumps({'old_sha256':old,'old_size':4,'new_sha256':new,'new_size':7,'operations':[{'literal':0,'size':3},{'copy':0,'size':4}]}))
   with patch.object(fix,'OLD_SHA',old),patch.object(fix,'NEW_SHA',new):fix.apply_fix(src,out,r)
   self.assertEqual(out.read_bytes(),b'XYZABCD');self.assertEqual(src.read_bytes(),b'ABCD')
 def test_wrong_original_rejected_without_creating_output(self):
  with tempfile.TemporaryDirectory() as td:
   r=Path(td);src=r/'old.apk';out=r/'fixed.apk';src.write_bytes(b'incomplete')
   with self.assertRaisesRegex(ValueError,'checksum'):fix.apply_fix(src,out,r)
   self.assertFalse(out.exists())
 def test_out_of_bounds_copy_rejected_before_writing(self):
  with tempfile.TemporaryDirectory() as td:
   r=Path(td);src=r/'old.apk';out=r/'fixed.apk';src.write_bytes(b'ABCD');old=hashlib.sha256(b'ABCD').hexdigest()
   (r/'literals.bin').write_bytes(b'');(r/'plan.json').write_text(json.dumps({'old_sha256':old,'old_size':4,'new_sha256':fix.NEW_SHA,'new_size':5,'operations':[{'copy':0,'size':5}]}))
   with patch.object(fix,'OLD_SHA',old):
    with self.assertRaisesRegex(ValueError,'range'):fix.apply_fix(src,out,r)
   self.assertFalse(out.exists())
