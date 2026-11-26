"""Build Vietnamese labels with per-key source attribution; never overwrite ENG VI."""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def build():
 source=json.loads((ROOT/'tables/localization/vi.eng.json').read_text());authored=json.loads((ROOT/'tables/localization/vi.authored.json').read_text())
 tokens=lambda s:sorted(re.findall(r'\$\d*|%%',s))
 for key,value in authored.items():
  if tokens(key)!=tokens(value):raise ValueError('Translation placeholders differ: '+key)
 final=dict(source);final.update(authored)
 origins={key:'new-vietnamese-translation'if key in authored else'eng-client-vietnamese'for key in final}
 report={'base':'client ENG Vietnamese dictionary','source_eng_entries':len(source),'authored_entries':len(authored),'overrides_of_eng_entries':sorted(source.keys()&authored.keys()),'merged_entries':len(final),'eng_dictionary_sha256':hashlib.sha256((ROOT/'tables/localization/vi.eng.json').read_bytes()).hexdigest(),'placeholder_validation':'passed for all authored entries','key_sources':origins,'new_translation_file':'tables/localization/vi.authored.json','source_dictionary_file':'tables/localization/vi.eng.json'}
 (ROOT/'tables/localization/vi.provenance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 (ROOT/'tables/localization/vi.merged.json').write_text(json.dumps(final,ensure_ascii=False,indent=2)+'\n')
 from server.inventory import entities
 labels={}
 for key,row in entities().items():
  text=lambda s:final.get(s,s)
  name=row['kindName'];desc=row.get('desc','')or''
  labels[str(key)]={'name':text(name),'description':text(desc),'nameSource':origins.get(name,'source-text-untranslated'),'descriptionSource':origins.get(desc,'no-text'if not desc else'source-text-untranslated')}
 (ROOT/'tables/adminLabels.json').write_text(json.dumps(labels,ensure_ascii=False,indent=2)+'\n')
 return {'source_eng_entries':len(source),'authored_entries':len(authored),'merged_entries':len(final),'catalog_items':len(labels),'untranslated_catalog_names':[k for k,v in labels.items()if re.search('[\u3400-\u9fff]',v['name'])],'untranslated_catalog_descriptions':[k for k,v in labels.items()if re.search('[\u3400-\u9fff]',v['description'])]}
if __name__=='__main__':print(json.dumps(build(),ensure_ascii=False,indent=2))
