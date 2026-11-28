"""Literal constants evaluated from the recovered serverConfig/clientConfig modules."""
import json
from functools import lru_cache
from pathlib import Path
@lru_cache(None)
def constants(path):
    value=json.loads((Path(__file__).resolve().parent.parent/'tables/clientConstants.json').read_text())
    # Only explicit selected overrides: shared by Python, battle worker and clients.
    root=Path(__file__).resolve().parent.parent/'tables'
    for dotted,override in json.loads((root/'clientRules.json').read_text())['config'].items():
        parts=dotted.split('.');target=value['server']
        for part in parts[:-1]:target=target[part]
        target[parts[-1]]=override
    for key in path.split('.'):value=value[key]
    return value
