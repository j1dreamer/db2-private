import hashlib,importlib.util,json,tempfile,unittest,zipfile
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('client_download',Path(__file__).parents[1]/'Download-Clients.py');d=importlib.util.module_from_spec(spec);spec.loader.exec_module(d)

class IpaDownloadTests(unittest.TestCase):
 def test_local_original_reconstruction_and_verified_output_reuse(self):
  with tempfile.TemporaryDirectory()as td:
   root=Path(td);source=root/'old.ipa';source.write_bytes(b'ORIGINAL-INPUT');expected=b'ORIGINAL-FIX';archive=root/'patch.zip'
   plan={'old_size':14,'new_size':12,'old_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'new_sha256':hashlib.sha256(expected).hexdigest(),'operations':[{'copy':0,'size':9},{'literal':0,'size':3}]}
   with zipfile.ZipFile(archive,'w')as z:z.writestr('plan.json',json.dumps(plan));z.writestr('literals.bin',b'FIX')
   with patch.multiple(d,IPA_BASE_SIZE=14,IPA_SIZE=12,IPA_BASE_SHA=plan['old_sha256'],IPA_SHA=plan['new_sha256']),patch.object(d,'fetch',return_value=archive)as fetch,patch.object(d,'parts')as parts:
    target=d.ios(root,root/'cache',1,source);self.assertEqual(target.read_bytes(),expected);self.assertFalse(parts.called)
    d.ios(root,root/'cache',1,source);self.assertEqual(fetch.call_count,1)
    target.unlink();parts.return_value=[source];self.assertEqual(d.ios(root,root/'cache',1).read_bytes(),expected);parts.assert_called_once_with(root/'cache'/'ios',d.IOS_REF,d.IOS_MANIFEST,14,plan['old_sha256'],'IPA',1)
 def test_signed_or_other_input_rejected_without_network(self):
  with tempfile.TemporaryDirectory()as td,patch.object(d,'fetch')as fetch:
   root=Path(td);source=root/'signed.ipa';source.write_bytes(b'OTHER')
   with self.assertRaisesRegex(ValueError,'before Sideloadly signing'):d.ios(root,root/'cache',1,source)
   self.assertFalse(fetch.called)
 def test_unexpected_plan_ranges_rejected(self):
  with tempfile.TemporaryDirectory()as td:
   p=Path(td)/'bad.zip'
   with zipfile.ZipFile(p,'w')as z:
    z.writestr('plan.json',json.dumps({'old_sha256':'old','new_sha256':'new','old_size':3,'new_size':5,'operations':[{'copy':0,'size':5}]}));z.writestr('literals.bin',b'')
   with self.assertRaisesRegex(ValueError,'range'):d.load_patch(p,'old','new')
