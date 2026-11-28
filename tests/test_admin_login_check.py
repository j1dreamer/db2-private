import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from tools import check_admin_login as checker

HASH = '$2y$10$' + 'a' * 53
NEW_HASH = '$2y$10$' + 'b' * 53


class LoginCheckTests(unittest.TestCase):
    def test_duplicate_or_missing_user_does_not_get_rewritten(self):
        for text in ('other '+HASH, ('user '+HASH+'\n')*2):
            with self.assertRaises(ValueError):checker.matching_line(text, 'user')

    def test_curl_keeps_credentials_out_of_arguments_and_checks_tls(self):
        with tempfile.TemporaryDirectory() as folder:
            def fake_run(args, **kwargs):
                self.assertNotIn('test-secret', ' '.join(args))
                self.assertNotIn('--insecure', args)
                self.assertNotIn('-k', args)
                cfg = Path(args[args.index('--config')+1])
                self.assertEqual(cfg.stat().st_mode & 0o777, 0o600)
                self.assertIn('test-secret', cfg.read_text())
                return subprocess.CompletedProcess(args, 0, '200', '')
            with patch.object(checker.subprocess, 'run', side_effect=fake_run):
                self.assertEqual(checker.request_status('db2.teck.io.vn', 'user', 'test-secret', Path(folder), True), {'http':'200','curl_exit':0})

    def scenario(self, matches, repair):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            def mapped(value):
                value=str(value)
                return root/value.lstrip('/') if value.startswith('/etc/') else Path(value)
            entry=mapped('/etc/caddy/Caddyfile');entry.parent.mkdir(parents=True)
            entry.write_text('# DB2 managed entrypoint\nimport /etc/caddy/db2.caddy\n')
            cfg=mapped('/etc/caddy/db2.caddy');cfg.write_text('db2.teck.io.vn {\n basic_auth {\n user '+HASH+'\n }\n}\n')
            secrets=mapped('/etc/db2/public-admin-login.json');secrets.parent.mkdir()
            secrets.write_text(json.dumps({'username':'user','password':'test-secret'}))
            calls=[]
            def execute(args, **kwargs):
                calls.append(args)
                if args[:2]==['htpasswd','-vi']:
                    return subprocess.CompletedProcess(args,0 if matches else 3,'','')
                if args[:2]==['htpasswd','-niBC']:
                    return subprocess.CompletedProcess(args,0,'user:'+NEW_HASH+'\n','')
                return subprocess.CompletedProcess(args,0,'','')
            output=io.StringIO()
            with patch.object(checker,'Path',side_effect=mapped),patch.object(checker.os,'geteuid',return_value=0),patch.object(checker.os,'chown'),patch.object(checker.grp,'getgrnam'),patch.object(checker.subprocess,'run',side_effect=execute),patch.object(checker,'request_status',side_effect=[{'http':'401','curl_exit':0},{'http':'200','curl_exit':0}]),contextlib.redirect_stdout(output):
                self.assertEqual(checker.run('db2.teck.io.vn',repair),0)
            report=json.loads(output.getvalue())
            self.assertNotIn('test-secret', output.getvalue())
            self.assertTrue(report['edge_login_verified'])
            self.assertEqual(any(c[:2]==['systemctl','reload'] for c in calls),repair)
            self.assertEqual(NEW_HASH in cfg.read_text(), repair and not matches)
            if repair and not matches:
                self.assertEqual(cfg.stat().st_mode & 0o777,0o640)
                backups=list(secrets.parent.glob('db2.caddy.login-backup-*'))
                self.assertEqual(len(backups),1)
                self.assertEqual(backups[0].stat().st_mode & 0o777,0o600)
                self.assertIn(HASH,backups[0].read_text())

    def test_wrong_hash_repaired_and_config_reloaded(self):self.scenario(False,True)
    def test_correct_hash_reloaded_for_stale_active_config(self):self.scenario(True,True)
    def test_read_only_mode_does_not_reload_or_rewrite(self):self.scenario(False,False)
