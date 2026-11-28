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
   old_sha=plan['new_sha256'];middle=root/'v16.zip';mid=expected+b'!';middle_plan={'old_size':12,'new_size':13,'old_sha256':old_sha,'new_sha256':hashlib.sha256(mid).hexdigest(),'operations':[{'copy':0,'size':12},{'literal':0,'size':1}]}
   with zipfile.ZipFile(middle,'w')as z:z.writestr('plan.json',json.dumps(middle_plan));z.writestr('literals.bin',b'!')
   last=root/'v17.zip';new=mid+b'?';final={'old_size':13,'new_size':14,'old_sha256':middle_plan['new_sha256'],'new_sha256':hashlib.sha256(new).hexdigest(),'operations':[{'copy':0,'size':13},{'literal':0,'size':1}]}
   with zipfile.ZipFile(last,'w')as z:z.writestr('plan.json',json.dumps(final));z.writestr('literals.bin',b'?')
   expected=new
   with patch.multiple(d,IPA_BASE_SIZE=14,IPA_V15_SIZE=12,IPA_V16_SIZE=13,IPA_SIZE=14,IPA_BASE_SHA=plan['old_sha256'],IPA_V15_SHA=old_sha,IPA_V16_SHA=middle_plan['new_sha256'],IPA_SHA=final['new_sha256']),patch.object(d,'fetch',side_effect=lambda url,*args:last if 'v17.zip'in url else middle if 'v16.zip'in url else archive)as fetch,patch.object(d,'parts')as parts:
    target=d.ios(root,root/'cache',1,source);self.assertEqual(target.read_bytes(),expected);self.assertFalse(parts.called)
    d.ios(root,root/'cache',1,source);self.assertEqual(fetch.call_count,3)
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

 def test_signed_boxinfo_apk_patch_and_cli_source_argument(self):
  import sys
  with tempfile.TemporaryDirectory()as td:
   root=Path(td);source=root/'old.apk';source.write_bytes(b'BOXINFO-INPUT');expected=b'BOXINFO-V9';archive=root/'android-patch.zip'
   plan={'old_size':13,'new_size':10,'old_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'new_sha256':hashlib.sha256(expected).hexdigest(),'operations':[{'copy':0,'size':8},{'literal':0,'size':2}]}
   with zipfile.ZipFile(archive,'w')as z:z.writestr('plan.json',json.dumps(plan));z.writestr('literals.bin',b'V9')
   old_sha=plan['new_sha256'];middle=root/'v16.zip';mid=expected+b'!';middle_plan={'old_size':10,'new_size':11,'old_sha256':old_sha,'new_sha256':hashlib.sha256(mid).hexdigest(),'operations':[{'copy':0,'size':10},{'literal':0,'size':1}]}
   with zipfile.ZipFile(middle,'w')as z:z.writestr('plan.json',json.dumps(middle_plan));z.writestr('literals.bin',b'!')
   last=root/'v17.zip';new=mid+b'?';final={'old_size':11,'new_size':12,'old_sha256':middle_plan['new_sha256'],'new_sha256':hashlib.sha256(new).hexdigest(),'operations':[{'copy':0,'size':11},{'literal':0,'size':1}]}
   with zipfile.ZipFile(last,'w')as z:z.writestr('plan.json',json.dumps(final));z.writestr('literals.bin',b'?')
   expected=new
   with patch.multiple(d,APK_BOXINFO_SIZE=13,APK_V15_SIZE=10,APK_V16_SIZE=11,APK_SIZE=12,APK_BOXINFO_SHA=plan['old_sha256'],APK_V15_SHA=old_sha,APK_V16_SHA=middle_plan['new_sha256'],APK_SHA=final['new_sha256']),patch.object(d,'fetch',side_effect=lambda url,*args:last if 'v17.zip'in url else middle if 'v16.zip'in url else archive),patch.object(d,'parts')as parts:
    target=d.android(root,root/'cache',1,source);self.assertEqual(target.read_bytes(),expected);self.assertFalse(parts.called)
   with patch.object(sys,'argv',['Download-Clients.py','--only','apk','--apk-source',str(source),'--output',str(root)]),patch.object(d,'android',return_value=target)as android:
    d.main();self.assertEqual(android.call_args.args[-1],source)
 def test_nested_virtual_apk_sources_read_across_copy_literal_boundaries(self):
  class Source:
   def read(self,offset,n):return b'abcdefgh'[offset:offset+n]
  a=d.FixedSource(Source(),{'operations':[{'copy':0,'size':3},{'literal':0,'size':2},{'copy':5,'size':3}]},b'XY')
  b=d.FixedSource(a,{'operations':[{'copy':1,'size':5},{'literal':0,'size':1}]},b'!')
  c=d.FixedSource(b,{'operations':[{'literal':0,'size':1},{'copy':0,'size':6}]},b'@')
  for source,expected in [(a,b'abcXYfgh'),(b,b'bcXYf!'),(c,b'@bcXYf!')]:
   for start in range(len(expected)+1):
    for n in range(len(expected)-start+1):self.assertEqual(source.read(start,n),expected[start:start+n])
