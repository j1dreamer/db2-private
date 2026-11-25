"""Run the AST-based extractor (Node + Acorn; development tool only)."""
import subprocess,sys
from pathlib import Path
if __name__=='__main__':
 if len(sys.argv)!=3:raise SystemExit('Usage: split_bundle.py INPUT.js OUTPUT_DIRECTORY')
 subprocess.run(['node',str(Path(__file__).with_suffix('.cjs')),*sys.argv[1:]],check=True)
