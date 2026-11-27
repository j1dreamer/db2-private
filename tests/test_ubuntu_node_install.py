"""Exercise installer file modes under its real restrictive umask."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = (ROOT / 'Setup-Ubuntu.sh').read_text()


class UbuntuNodeInstallTests(unittest.TestCase):
    def test_copied_private_extraction_root_becomes_service_readable(self):
        repair = SCRIPT.split('# cp -a preserves', 1)[1].split('if [[ $NETWORK', 1)[0]
        repair = '# cp -a preserves' + repair
        with tempfile.TemporaryDirectory() as folder:
            env = dict(os.environ, BASE=folder)
            subprocess.run(['bash', '-ec', '''
                umask 077
                mkdir "$BASE/extract" "$BASE/extract/bin"
                printf '#!/bin/sh\nexit 0\n' >"$BASE/extract/bin/node"
                chmod u+x "$BASE/extract/bin/node"
                mkdir "$BASE/node"
                cp -a "$BASE/extract/." "$BASE/node/"
            '''], env=env, check=True)
            node_root = Path(folder) / 'node'
            self.assertEqual(node_root.stat().st_mode & 0o777, 0o700)
            subprocess.run(['bash', '-ec', repair], env=env, check=True)
            for path in (node_root, node_root / 'bin', node_root / 'bin/node'):
                self.assertEqual(path.stat().st_mode & 0o555, 0o555, path)

    def test_service_user_probe_failure_stops_before_switch(self):
        probe = SCRIPT.split('# Probe as the service account', 1)[1].split('install -d -m 700 -o db2', 1)[0]
        probe = '# Probe as the service account' + probe
        result = subprocess.run(['bash', '-ec', '''
            runuser() { [[ "$1 $2 $3" == '-u db2 --' ]] || exit 99; return 1; }
            nodebin=/root/private-node
        ''' + probe + '\necho SHOULD_NOT_CONTINUE'], text=True, capture_output=True)
        self.assertEqual(result.returncode, 1)
        self.assertIn('Existing deployment was left untouched', result.stderr)
        self.assertNotIn('SHOULD_NOT_CONTINUE', result.stdout)
        self.assertLess(SCRIPT.index('# Probe as the service account'), SCRIPT.index('systemctl stop db2;'))
