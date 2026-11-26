"""Build a selective data overlay from actual archive contents and canonical tables.

This patches the JS data initialization boundary, not native code or asset signatures.
For iOS the output alone is not a private-server client or a signed/installable IPA.
"""
import argparse
import hashlib
import json
from pathlib import Path
from tools.extract_tables import read_tables

ROOT = Path(__file__).resolve().parents[1]
SOUL_MAPS = ('SOUL_TYPE_ATTR_ITEM_MAP', 'SOUL_TYPE_SP_ATTR_ITEM_MAP')
ANCHOR = 'dataApi.init();\nbuildExt.hackDataApi && buildExt.hackDataApi();'
HOOK = ('window.DB2PrivateData.applyRaw(data);\n'
        'dataApi.init();\n'
        'window.DB2PrivateData.applyConfig(serverConfig);\n'
        'window.DB2PrivateData.applyBuildExt(buildExt);\n'
        'buildExt.hackDataApi && buildExt.hackDataApi();')

def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))

def canonical(tables_dir=ROOT/'tables'):
    tables = {p.name[:-9]: json.loads(p.read_text()) for p in sorted(Path(tables_dir).glob('*Data.json'))}
    consts = json.loads((Path(tables_dir)/'clientConstants.json').read_text())['server']['ROLE']['CONSTS']
    maps = {key: consts[key] for key in SOUL_MAPS}
    rules=json.loads((Path(tables_dir)/'longzhidaoOverrides.json').read_text())
    digest = hashlib.sha256(encoded({'tables': tables, 'soulMaps': maps,'startupRules':rules}).encode()).hexdigest()
    return tables, maps, digest

def overlay(source, tables_dir=ROOT/'tables'):
    tables, maps, digest = canonical(tables_dir)
    shipped = {name: obj for name, obj, *_ in read_tables(source)}
    if set(tables) != set(shipped):
        raise ValueError('Canonical/archive table names differ')
    changed = {key: value for key, value in tables.items() if value != shipped[key]}
    rules=json.loads((Path(tables_dir)/'longzhidaoOverrides.json').read_text())
    config=dict(rules['config']);config.update({'ROLE.CONSTS.'+key:value for key,value in maps.items()})
    # Fresh copies matter: dataApi.init destructively removes each table header.
    script = ('(function(w){"use strict";var tables='+encoded(changed)+';var config='+encoded(config)+';var flags='+encoded(rules['flags'])+';'
              'function clone(x){return JSON.parse(JSON.stringify(x));}'
              'w.DB2PrivateData={sha256:'+encoded(digest)+','
              'applyRaw:function(data){Object.keys(tables).forEach(function(k){data[k]=clone(tables[k]);});},'
              'applyConfig:function(cfg){Object.keys(config).forEach(function(k){var p=k.split("."),o=cfg;for(var i=0;i<p.length-1;i++)o=o[p[i]]||(o[p[i]]={});o[p[p.length-1]]=clone(config[k]);});},'
              'applyBuildExt:function(ext){Object.keys(flags).forEach(function(k){ext[k]=clone(flags[k]);});}'
              '};})(window);\n')
    return script, {'baseline': 'longzhidao-17327', 'canonical_sha256': digest,
                    'overridden_tables': sorted(changed), 'soul_maps': list(SOUL_MAPS),
                    'overlay_sha256': hashlib.sha256(script.encode()).hexdigest(),
                    'native_modified': False,'startup_config_paths':sorted(config),'build_ext_flags':sorted(rules['flags']),'provenance':'tables/canonical-policy.json'}

def patch_bundle(bundle, script):
    if bundle.count(ANCHOR) != 1:
        raise ValueError('Expected one verified logoScene data initialization boundary')
    return script + bundle.replace(ANCHOR, HOOK, 1)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', help='original Android archive/APK or iOS IPA')
    parser.add_argument('output', type=Path, help='output overlay JavaScript')
    args = parser.parse_args()
    script, report = overlay(args.source)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(script)
    args.output.with_suffix('.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
