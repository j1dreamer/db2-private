import tempfile,unittest,zipfile,struct
from pathlib import Path
from tools.verify_apk import resource_layout

class ApkResourceLayoutTests(unittest.TestCase):
 def create(self,path,compression,extra=b''):
  with zipfile.ZipFile(path,'w') as z:
   entry=zipfile.ZipInfo('resources.arsc');entry.extra=extra;entry.compress_type=compression;z.writestr(entry,b'resource payload')
 def test_compressed_resources_rejected_even_if_zip_is_valid(self):
  with tempfile.TemporaryDirectory() as td:
   p=Path(td)/'bad.apk';self.create(p,zipfile.ZIP_DEFLATED)
   with self.assertRaisesRegex(ValueError,'compressed'):resource_layout(p)
 def test_uncompressed_but_misaligned_resources_rejected(self):
  with tempfile.TemporaryDirectory() as td:
   p=Path(td)/'bad.apk';self.create(p,zipfile.ZIP_STORED,struct.pack('<HH',0xcafe,1)+b'x')
   with self.assertRaisesRegex(ValueError,'aligned'):resource_layout(p)
 def test_uncompressed_and_aligned_resources_accepted(self):
  with tempfile.TemporaryDirectory() as td:
   p=Path(td)/'good.apk';self.create(p,zipfile.ZIP_STORED)
   self.assertTrue(resource_layout(p)['aligned_4_bytes'])
