"""Admin-visible source records; server implementations are never called original source."""
import json
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
@lru_cache(None)
def policy():return json.loads((ROOT/'tables/canonical-policy.json').read_text())
def item_source(kind):
 for row in policy()['compatibility_definitions']:
  if row['kindId']==kind:return row['source']
 return 'eng-client'
@lru_cache(None)
def summary():
 locale=json.loads((ROOT/'tables/localization/vi.provenance.json').read_text())
 return {'baseline':policy()['baseline'],'source':policy()['source'],'tables':policy()['tables'],'compatibilityDefinitions':policy()['compatibility_definitions'],'localization':{k:v for k,v in locale.items()if k!='key_sources'},'privateRules':json.loads((ROOT/'tables/privateRules.json').read_text()),'legend':{'longzhidao-client':'Client Long Chi Đảo · không phải source ENG','eng-client':'Client ENG gốc','eng-client-vietnamese':'Tiếng Việt có sẵn trong client ENG','new-vietnamese-translation':'Bản dịch Việt bổ sung · không có sẵn trong ENG','original-ios-compatibility':'Định nghĩa từ IPA gốc để giữ tương thích','private-server-rule':'Luật server mình tự viết · không phải luật server gốc','private-server-implementation':'Mã dự án mình viết · không phải source ENG gốc'}}
