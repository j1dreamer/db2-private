import os,shutil,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from server.node_runtime import runtime_status,resolve_node,probe
class NodeRuntimeTests(unittest.TestCase):
 def test_explicit_node_works_without_login_shell_path(self):
  node=shutil.which('node');self.assertTrue(node)
  with patch.dict(os.environ,{'PATH':'','DB2_NODE':node}):
   d=runtime_status();self.assertTrue(d['available']);self.assertEqual(resolve_node(),str(Path(node).resolve()))
 def test_bad_override_falls_back_and_missing_runtime_has_actionable_error(self):
  with patch.dict(os.environ,{'DB2_NODE':'/no/db2-node'}):self.assertTrue(runtime_status()['available'])
  with patch('server.node_runtime.candidates',return_value=()):
   self.assertFalse(runtime_status()['available'])
   with self.assertRaisesRegex(ValueError,'Setup-Ubuntu'):resolve_node()
 def test_old_or_non_node_executable_is_rejected(self):
  import subprocess
  with patch('server.node_runtime.subprocess.run',return_value=subprocess.CompletedProcess([],0,'v18.20.0','')):
   self.assertIsNone(probe('/fake-node18',1))
  with patch('server.node_runtime.subprocess.run',return_value=subprocess.CompletedProcess([],0,'not node','')):
   self.assertIsNone(probe('/fake-other',1))
