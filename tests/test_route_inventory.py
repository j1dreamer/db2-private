import json,unittest
from pathlib import Path
class RouteInventoryTests(unittest.TestCase):
 def test_all_342_client_routes_have_extracted_request_contracts(self):
  root=Path(__file__).resolve().parent.parent
  contracts=json.loads((root/'analysis/route-contracts.json').read_text())
  coverage=json.loads((root/'analysis/route-coverage.json').read_text())
  names=[r['route'] for r in contracts['contracts']]
  self.assertEqual(len(names),342);self.assertEqual(len(set(names)),342)
  self.assertEqual(set(names),{r['route'] for r in coverage['routes']})
  for contract in contracts['contracts']:
   self.assertTrue(contract['calls'])
   for call in contract['calls']:
    self.assertTrue(call['module']);self.assertTrue(call['request_expression']);self.assertGreater(call['line'],0)
