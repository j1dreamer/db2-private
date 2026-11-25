"""Evaluate literal progression functions from the recovered serverConfig."""
import json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
if __name__=='__main__':
    result=subprocess.run(['node',str(ROOT/'server/battle_worker.cjs')],input=json.dumps({'mode':'progression'}),text=True,capture_output=True,check=True)
    data=json.loads(result.stdout)
    (ROOT/'tables/derivedProgression.json').write_text(json.dumps(data,indent=2)+'\n')
    print('Exported source progression costs, limits and power factors')
