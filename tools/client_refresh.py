"""Refresh authored controls in the pinned BoxInfo clients; preserve gameplay/data."""
from pathlib import Path
from .client_patches import patch_private_startup,patch_private_recovery
ROOT=Path(__file__).resolve().parents[1]
def refresh(old):
 begin=old.index('// Server selector displayed');end=old.index('// Private client: persistent engine speed;',begin)
 settings='\n'.join((ROOT/'tools'/f'{n}.js').read_text()for n in ['private_ui','private_connection','private_font','private_settings'])+'\n'
 text=old[:begin]+settings+old[end:];text=patch_private_recovery(patch_private_startup(text))
 a=text.index('// Private client: persistent engine speed;');b=text.index('// Authored private-server GM UI.',a)
 text=text[:a]+(ROOT/'tools/private_runtime.js').read_text()+'\n'+(ROOT/'tools/private_auto.js').read_text()+'\n'+text[b:]
 a=text.index('// Authored quantity/close controls around the original ENG reward panel and RPCs.');b=text.index('// Private control panel: the shipped archive has no Time Peak scene module.',a)
 text=text[:a]+(ROOT/'tools/private_box.js').read_text()+'\n'+text[b:]
 a=text.index('// Private control panel: the shipped archive has no Time Peak scene module.');b=text.index('window.DB2_PRIVATE_VI=',a)
 return text[:a]+(ROOT/'tools/private_time_peak.js').read_text()+'\n'+text[b:]
