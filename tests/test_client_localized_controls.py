import json,subprocess,unittest
from pathlib import Path
from fontTools.ttLib import TTFont
ROOT=Path(__file__).parents[1]
class LocalizedControlsTests(unittest.TestCase):
 def test_packaged_unicode_font_covers_vietnamese_and_original_font_is_retained(self):
  cmap=TTFont(ROOT/'client/fonts/NotoSans-Regular.ttf').getBestCmap()
  text='Rương chọn SP · 60 mảnh. Chạm để chạy. Địa chỉ kết nối.'
  self.assertFalse({c for c in text if ord(c)not in cmap})
  original=json.loads((ROOT/'client/fonts/provenance.json').read_text())['original'];self.assertEqual(original['family'],'FZZhunYuan-M02');self.assertTrue(original['missingVietnamese'])
 def test_english_vietnamese_catalogs_box_metadata_and_source_names(self):
  script=r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert');let lang='en';const desc=Array.from({length:20},(_,i)=>(50550+i)+'x60').join(',');const cc={sys:{localStorage:{getItem:()=>lang}}};const window={DB2_PRIVATE_UI_LOCALES:JSON.parse(fs.readFileSync('tables/localization/private-ui.json')),__require:()=>({findEntityById:()=>({extra:{dropListDesc:desc}})})};vm.runInNewContext(fs.readFileSync('tools/private_i18n.js','utf8'),{window,cc});const I=window.DB2PrivateI18n;
assert.equal(I.t('settings.004'),'Connect');assert.equal(I.t('auto.013'),'Run');assert(!/[\u0100-\u1eff]/.test(I.boxMeta({kindId:724}).name));assert(I.boxMeta({kindId:351,selectCount:1,dropListDesc:desc}).name.includes('SP Selection'));
lang='vi';assert.equal(I.t('settings.004'),'Kết nối');assert.equal(I.t('auto.013'),'Chạy');assert(I.boxMeta({kindId:724}).desc.includes('60 mảnh'));
assert.equal(I.boxMeta({kindId:351,selectCount:1,dropListDesc:'101x123'}),null);
'''
  r=subprocess.run(['node','-e',script],cwd=ROOT,text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr)
 def test_ui_source_uses_catalog_keys_instead_of_vietnamese_labels(self):
  import re
  for name in ('private_auto','private_settings','private_runtime','private_gm','private_expedition','private_box','private_server_config'):
   text=(ROOT/'tools'/(name+'.js')).read_text();self.assertFalse(re.search('[\u0102\u0103\u0110\u0111\u01a0\u01a1\u01af\u01b0\u1ea0-\u1ef9]',text),name)

 def test_real_controls_switch_language_and_require_picking_a_game_target(self):
  r=subprocess.run(['node','tests/fixtures/localized_controls.cjs'],cwd=ROOT,text=True,capture_output=True);self.assertEqual(r.returncode,0,r.stderr)

 def test_original_box_generators_localize_old_sp_instances_in_both_languages(self):
  import tempfile
  from server.storage import Store
  from server.box_presets import grant
  from tools.client_patches import patch_box_quantities
  with tempfile.TemporaryDirectory()as folder:
   store=Store(Path(folder)/'db');store.register('tester','password');p=store.create_player(1,'Tester');grant(p,'sp60',1);store.save(p);idx=next(v['idx']for v in p['bag']['items'].values()if v['kindId']==351)
   source=Path(folder)/'client.js';source.write_text(patch_box_quantities((ROOT/'client/main.decoded.js').read_text()))
   for language,expected in (('en','SP Selection Chest'),('vi','Rương chọn SP')):
    payload={'profile':p,'sourceBundle':str(source),'checkBoxes':True,'checkTeam':True,'boxIndex':idx,'uiLanguage':language}
    result=subprocess.run(['node','tests/fixtures/client_profile.cjs'],input=json.dumps(payload),cwd=ROOT,text=True,capture_output=True);self.assertEqual(result.returncode,0,result.stderr);view=json.loads(result.stdout)['boxViews']['selection'];self.assertIn(expected,view['boxName']);self.assertEqual(len(view['itemItems']),20)
   store.db.close()
