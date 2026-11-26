"""Interoperability checks against the original client's recovered JS codec."""
import unittest,subprocess,json,base64,shutil
from pathlib import Path
from server.protocol import packages,request,response,push

@unittest.skipUnless(shutil.which('node'),'Node needed only for original-client contract tests')
class ClientContractTests(unittest.TestCase):
 def codec(self,data):
  result=subprocess.run(['node',str(Path(__file__).parent/'fixtures/client_codec.cjs')],input=json.dumps(data),text=True,capture_output=True,check=True)
  return result.stdout
 def test_original_client_request_parses_in_python(self):
  body={'giftCode':'CHÀO-BẠN'}
  encoded=self.codec({'operation':'request','id':300,'route':'logic.playerHandler.useGiftCode','body':body})
  kind,packet=list(packages(base64.b64decode(encoded)))[0]
  self.assertEqual(kind,4);self.assertEqual(request(packet),(300,'logic.playerHandler.useGiftCode',body))
 def test_python_push_parses_in_original_client(self):
  body={'mail':{'_id':'hello'}}
  decoded=json.loads(self.codec({'operation':'response','data':base64.b64encode(push('onNewMail',body)).decode()}))
  self.assertEqual(decoded['route'],'onNewMail');self.assertEqual(decoded['body'],body)
 def test_python_response_parses_in_original_client(self):
  body={'code':200,'gem':150,'msg':'Đã nhận thưởng'}
  decoded=json.loads(self.codec({'operation':'response','data':base64.b64encode(response(300,body)).decode()}))
  self.assertEqual(decoded,{'type':4,'id':300,'body':body})
