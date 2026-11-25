"""Small format fixtures test inspection tools, not native iOS execution."""
import gzip,json,plistlib,struct,tempfile,unittest,zipfile
from pathlib import Path
from tools.inspect_ipa import macho,inspect
from tools.decode_jsc import decrypt,gunzip,decode_archive
from tools.build_client import encrypt
from tools.extract_tables import extract

class IpaInspectionTests(unittest.TestCase):
 def binary(self,cryptid=0):
  build=struct.pack('<6I',0x32,24,2,13<<16,17<<16,0);encryption=struct.pack('<6I',0x2c,24,100,200,cryptid,0)
  return struct.pack('<8I',0xfeedfacf,0x100000c,0,2,2,48,0,0)+build+encryption
 def test_macho_device_encryption_fat_slices_and_truncation(self):
  b=self.binary();r=macho(b);self.assertEqual(r['architecture'],'arm64');self.assertEqual(r['build'][0]['platform'],'iOS-device');self.assertFalse(r['encryption'][0]['encrypted']);self.assertTrue(macho(self.binary(1))['encryption'][0]['encrypted'])
  fat=struct.pack('>II',0xcafebabe,1)+struct.pack('>5I',0x100000c,0,28,len(b),2)+b;self.assertEqual(macho(fat)['slices'][0]['bits'],64)
  with self.assertRaises(ValueError):macho(b[:40])
  with self.assertRaises(ValueError):macho(fat[:-1])
 def test_jsc_roundtrip_requires_valid_length_and_gzip_contents(self):
  for n in (0,1,2,3,16,1000):
   raw=b'console.log("'+b'x'*n+b'");';data=encrypt(gzip.compress(raw,mtime=0));self.assertEqual(gunzip(decrypt(data)),raw)
  with self.assertRaises(ValueError):decrypt(b'not-a-word-aligned-JSC')
  with self.assertRaises(ValueError):gunzip(b'function plainJs(){}')
 def test_ipa_reads_actual_plist_and_binary_and_rejects_script_traversal(self):
  with tempfile.TemporaryDirectory()as td:
   root=Path(td);ipa=root/'test.ipa';script=encrypt(gzip.compress(b'var answer = 42;',mtime=0))
   with zipfile.ZipFile(ipa,'w')as z:
    z.writestr('Payload/Game.app/Info.plist',plistlib.dumps({'CFBundleIdentifier':'example.test','CFBundleExecutable':'Game','CFBundleVersion':'3'},fmt=plistlib.FMT_BINARY));z.writestr('Payload/Game.app/Game',self.binary());z.writestr('Payload/Game.app/assets/main/index.jsc',script);z.writestr('../escape.jsc',script)
   r=inspect(ipa,root/'report');self.assertEqual(r['app_info']['CFBundleVersion'],'3');self.assertEqual(r['executable']['architecture'],'arm64');self.assertFalse(r['native_execution_tested']);self.assertEqual(len(r['scripts']),1)
   decoded=decode_archive(ipa,root/'decoded');self.assertEqual((root/'decoded/Payload/Game.app/assets/main/index.js').read_bytes(),b'var answer = 42;');self.assertIn('Unsafe',next(x for x in decoded if x['archive_path']=='../escape.jsc')['decode_error']);self.assertFalse((root/'escape.js').exists())

 def test_cocos_table_extraction_detects_android_and_ios_roots(self):
  uuid='12345678-1234-1234-1234-123456789abc';rows=[['kindId','value'],[1,42]];raw=json.dumps(rows).encode()+b'a'*64
  for prefix in ('DB2-GD/assets/assets/resources/','Payload/Game.app/assets/resources/'):
   with self.subTest(prefix=prefix),tempfile.TemporaryDirectory()as td:
    root=Path(td);archive=root/'source.zip'
    with zipfile.ZipFile(archive,'w')as z:
     if prefix.startswith('DB2-GD/'):z.writestr('DB2-GD/AndroidManifest.xml',b'fixture')
     z.writestr(prefix+'config.json',json.dumps({'paths':{'0':['data/testData']},'uuids':[uuid]}));z.writestr(prefix+'native/12/'+uuid+'.bin',gzip.compress(raw,mtime=0))
    extract(archive,root/'tables');self.assertEqual(json.loads((root/'tables/testData.json').read_text()),rows)
