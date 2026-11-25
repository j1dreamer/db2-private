"""Literal constants evaluated from the recovered serverConfig/clientConfig modules."""
import json
from functools import lru_cache
from pathlib import Path
@lru_cache(None)
def constants(path):
    value=json.loads((Path(__file__).resolve().parent.parent/'tables/clientConstants.json').read_text())
    for key in path.split('.'):value=value[key]
    return value
