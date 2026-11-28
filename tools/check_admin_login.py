#!/usr/bin/env python3
"""Check/repair the managed Caddy password without printing credentials."""
import argparse
import grp
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time

BCRYPT = r'\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}'


def credentials(path):
    value = json.loads(Path(path).read_text())
    user, password = value['username'], value['password']
    if not re.fullmatch(r'[A-Za-z0-9_-]{3,40}', user):
        raise ValueError('Invalid stored username')
    if not isinstance(password, str) or not password or any(ord(c) < 32 for c in password):
        raise ValueError('Invalid stored password')
    return user, password


def matching_line(config, user):
    pattern = re.compile(r'(?m)^(\s*)' + re.escape(user) + r'[ \t]+(' + BCRYPT + r')[ \t]*$')
    found = list(pattern.finditer(config))
    if len(found) != 1:
        raise ValueError('Expected exactly one managed password entry; no configuration changed')
    return pattern, found[0].group(2)


def verify_password(user, password, digest, work):
    path = work / 'verify.htpasswd'
    path.write_text(user + ':' + digest + '\n')
    path.chmod(0o600)
    result = subprocess.run(['htpasswd', '-vi', str(path), user], input=password + '\n', text=True, capture_output=True)
    if result.returncode not in (0, 3):
        raise ValueError('htpasswd verification failed to run')
    return result.returncode == 0


def request_status(host, user, password, work, authenticated):
    options = work / ('auth.curl' if authenticated else 'anon.curl')
    options.write_text(('user = ' + json.dumps(user + ':' + password) + '\n') if authenticated else '')
    options.chmod(0o600)
    result = subprocess.run([
        'curl', '--silent', '--show-error', '--max-time', '15',
        '--noproxy', host, '--resolve', host + ':443:127.0.0.1',
        '--config', str(options), '--output', os.devnull, '--write-out', '%{http_code}',
        'https://' + host + '/admin',
    ], text=True, capture_output=True)
    # Do not print curl arguments/config or credentials, including on failures.
    return {'http': result.stdout.strip(), 'curl_exit': result.returncode}


def run(host, repair):
    if os.geteuid() != 0:
        raise ValueError('Run using sudo python3; this tool reads root-only files')
    if '.' not in host or not all(re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?', p) for p in host.split('.')):
        raise ValueError('Use a DNS hostname without https:// or a path')
    entry = Path('/etc/caddy/Caddyfile')
    config_path = Path('/etc/caddy/db2.caddy')
    if '# DB2 managed entrypoint' not in entry.read_text() or 'import /etc/caddy/db2.caddy' not in entry.read_text():
        raise ValueError('Unmanaged Caddy entrypoint; no configuration changed')
    user, password = credentials('/etc/db2/public-admin-login.json')
    config = config_path.read_text()
    pattern, digest = matching_line(config, user)
    with tempfile.TemporaryDirectory(prefix='db2-login-') as directory:
        work = Path(directory)
        matches = verify_password(user, password, digest, work)
        report = {'stored_password_matches_config': matches, 'configuration_reloaded': False}
        if repair:
            if not matches:
                result = subprocess.run(['htpasswd', '-niBC', '10', user], input=password + '\n', text=True, capture_output=True, check=True)
                new_digest = result.stdout.strip().split(':', 1)[1]
                if not re.fullmatch(BCRYPT, new_digest):
                    raise ValueError('Unexpected password hash; no configuration changed')
                updated = pattern.sub(lambda m: m.group(1) + user + ' ' + new_digest, config)
                candidate = work / 'db2.caddy'
                candidate.write_text(updated)
                # Validate before replacing the managed file.
                subprocess.run(['caddy', 'validate', '--config', str(candidate), '--adapter', 'caddyfile'], capture_output=True, check=True)
                backup = Path('/etc/db2') / ('db2.caddy.login-backup-' + str(time.time_ns()))
                shutil.copyfile(config_path, backup)
                backup.chmod(0o600)
                replacement = config_path.with_suffix('.login-tmp')
                replacement.write_text(updated)
                replacement.chmod(0o640)
                os.chown(replacement, 0, grp.getgrnam('caddy').gr_gid)
                os.replace(replacement, config_path)
                report['password_hash_repaired'] = True
            # Re-read the main entrypoint even if its on-disk hash was correct.
            subprocess.run(['caddy', 'validate', '--config', str(entry), '--adapter', 'caddyfile'], capture_output=True, check=True)
            subprocess.run(['systemctl', 'reload', 'caddy'], capture_output=True, check=True)
            report['configuration_reloaded'] = True
        report['without_password'] = request_status(host, user, password, work, False)
        report['with_stored_password'] = request_status(host, user, password, work, True)
        report['edge_login_verified'] = report['without_password'] == {'http': '401', 'curl_exit': 0} and report['with_stored_password'] == {'http': '200', 'curl_exit': 0}
        print(json.dumps(report, indent=2))
        return 0 if report['edge_login_verified'] else 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('host')
    parser.add_argument('--repair', action='store_true', help='Sync an incorrect hash and reload managed Caddy; keep the existing password')
    args = parser.parse_args()
    try:
        raise SystemExit(run(args.host, args.repair))
    except (OSError, ValueError, KeyError, subprocess.SubprocessError):
        print('Login check could not complete. Check Caddy status and managed configuration. No credentials printed.')
        raise SystemExit(1)
