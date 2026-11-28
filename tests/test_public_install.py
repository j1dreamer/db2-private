"""Run the repository bootstrap with system/network commands isolated."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = (ROOT / 'Setup-Public.sh').read_text()
BLOCK = '# Caddy official' + SCRIPT.split('# Caddy official', 1)[1].split('install -d -m 700 /etc/db2', 1)[0]


class PublicInstallTests(unittest.TestCase):
    def run_bootstrap(self, installed):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            env = dict(os.environ, work=folder, CADDY_PRESENT=str(int(installed)))
            wrapped = r'''
                set -Eeuo pipefail
                umask 077
                command() {
                    if [[ ${1:-} == -v && ${2:-} == caddy ]]; then
                        [[ $CADDY_PRESENT == 1 ]]; return
                    fi
                    builtin command "$@"
                }
                apt-get() { printf '%s\n' "$*" >>"$work/apt.log"; }
                curl() { printf '%s\n' "$*" >>"$work/curl.log"; printf downloaded >"${@: -1}"; }
                gpg() { cp "${@: -1}" "$work/caddy-keyring.gpg"; }
                install() {
                    local args=() arg
                    for arg in "$@"; do
                        case "$arg" in /etc/apt/*|/usr/share/*) arg="$work$arg";; esac
                        args+=("$arg")
                    done
                    /usr/bin/install "${args[@]}"
                }
            '''
            subprocess.run(['bash', '-ec', wrapped + BLOCK], env=env, check=True)
            apt = (root / 'apt.log').read_text()
            self.assertIn('install -y caddy apache2-utils', apt)
            if installed:
                self.assertFalse((root / 'curl.log').exists())
                self.assertNotIn('update', apt)
            else:
                self.assertIn('gnupg', apt)
                self.assertIn('update', apt)
                self.assertIn('https://dl.cloudsmith.io/public/caddy/stable/gpg.key', (root / 'curl.log').read_text())
                for name in ('usr/share/keyrings/caddy-stable-archive-keyring.gpg', 'etc/apt/sources.list.d/caddy-stable.list'):
                    self.assertEqual((root / name).stat().st_mode & 0o777, 0o644)
                    self.assertEqual((root / name).read_text(), 'downloaded')

    def test_minimal_ubuntu_adds_signed_repository_with_readable_files(self):
        self.run_bootstrap(False)

    def test_existing_caddy_does_not_replace_repository(self):
        self.run_bootstrap(True)
