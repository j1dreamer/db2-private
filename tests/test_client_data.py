import gzip,json,subprocess,tempfile,unittest,zipfile
from pathlib import Path
from tools.client_data import ANCHOR,canonical,overlay,patch_bundle

class ClientDataTests(unittest.TestCase):
 def test_selective_overlay_restores_tables_and_android_soul_maps_after_mutation(self):
  tables,maps,digest=canonical()
  for ios in (False,True):
   with self.subTest(ios=ios),tempfile.TemporaryDirectory()as td:
    archive=Path(td)/'client.zip';root='Payload/Game.app/assets/resources/'if ios else'DB2-GD/assets/assets/resources/'
    with zipfile.ZipFile(archive,'w')as z:
     if not ios:z.writestr('DB2-GD/AndroidManifest.xml',b'fixture')
     paths={};uuids=[]
     for i,(name,rows)in enumerate(tables.items()):
      uuid=f'{i:08x}-1234-1234-1234-123456789abc';uuids.append(uuid);paths[str(i)]=['data/'+name+'Data']
      # Represents an older archive missing the two selected definitions.
      if name=='entityExt':rows=[rows[0]]+[r for r in rows[1:]if r[0]not in(373,379)]
      z.writestr(root+'native/'+uuid[:2]+'/'+uuid+'.bin',gzip.compress(json.dumps(rows).encode()+b'a'*64))
     z.writestr(root+'config.json',json.dumps({'paths':paths,'uuids':uuids}))
    script,report=overlay(archive);self.assertEqual(report['overridden_tables'],['entityExt']);self.assertEqual(report['canonical_sha256'],digest)
    node='const vm=require("vm"),fs=require("fs"),input=JSON.parse(fs.readFileSync(0,"utf8")),ctx={window:{}};vm.runInNewContext(input.script,ctx);let d={untouched:1},cfg={ROLE:{CONSTS:{}}};ctx.window.DB2PrivateData.applyRaw(d);d.entityExt.shift();ctx.window.DB2PrivateData.applyRaw(d);ctx.window.DB2PrivateData.applyConfig(cfg);process.stdout.write(JSON.stringify({data:d,maps:cfg.ROLE.CONSTS}));'
    p=subprocess.run(['node','-e',node],input=json.dumps({'script':script}),text=True,capture_output=True,check=True)
    result=json.loads(p.stdout);self.assertEqual(result['data']['entityExt'],tables['entityExt']);self.assertEqual(result['data']['untouched'],1)
    self.assertEqual({k:result['maps'][k]for k in maps},maps)
    self.assertEqual(result['maps']['MAX_AWAKE_LEVEL'],20);self.assertEqual(result['maps']['EVOLVE_SKILL_NO_LEVEL_MAP'],{str(i):50 for i in range(1,5)})
 def test_patch_rejects_missing_or_ambiguous_logo_boundary(self):
  self.assertIn('applyRaw(data);\ndataApi.init();',patch_bundle(ANCHOR,'//overlay\n'))
  for source in ('',ANCHOR+ANCHOR):
   with self.assertRaises(ValueError):patch_bundle(source,'')
