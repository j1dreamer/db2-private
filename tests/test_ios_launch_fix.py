import struct,unittest
from tools.fix_ios_launch import PLUGINS,remove_plugin_commands,bind_ordinals
from tools.inspect_ipa import macho

class IosLaunchFixTests(unittest.TestCase):
 def binary(self,bind=b'',imports=(),extra_after=False):
  def library(name):
   name=name.encode()+b'\0';size=(24+len(name)+7)//8*8
   return struct.pack('<6I',12,size,24,0,0,0)+name+b'\0'*(size-24-len(name))
  libs=['/usr/lib/libSystem.B.dylib',*PLUGINS]+(['/usr/lib/libobjc.A.dylib']if extra_after else[])
  symbols=b''.join(struct.pack('<IBBHQ',0,1,0,ordinal<<8,0)for ordinal in imports)
  cmds=[library(n)for n in libs];size=sum(map(len,cmds))+48+24;off=32+size
  cmds+=[struct.pack('<12I',0x80000022,48,0,0,off,len(bind),0,0,0,0,0,0),struct.pack('<6I',2,24,off+len(bind),len(imports),0,0)]
  return struct.pack('<8I',0xfeedfacf,0x100000c,0,2,len(cmds),size,0,0)+b''.join(cmds)+bind+symbols+b'unchanged instruction and data payload'
 def test_removal_retains_remaining_library_and_every_payload_byte(self):
  b=self.binary(b'\x11\x40symbol\0\x90\0',imports=(1,));fixed,r=remove_plugin_commands(b)
  self.assertEqual(macho(fixed)['dylibs'],['/usr/lib/libSystem.B.dylib']);self.assertEqual(len(fixed),len(b));self.assertFalse(r['native_instructions_patched'])
  start=32+struct.unpack_from('<I',b,20)[0];self.assertEqual(fixed[start:],b[start:])
 def test_rejects_plugin_imports_in_dyld_stream_or_undefined_symbol_table(self):
  for b in [self.binary(b'\x12\x40need_plugin\0\x90\0'),self.binary(imports=(3,)),self.binary(b'\x20\x03\x90\0')]:
   with self.assertRaisesRegex(ValueError,'imported symbols'):remove_plugin_commands(b)
 def test_rejects_unknown_order_and_truncated_binary(self):
  with self.assertRaisesRegex(ValueError,'final two'):remove_plugin_commands(self.binary(extra_after=True))
  with self.assertRaises(ValueError):remove_plugin_commands(self.binary()[:50])
 def test_bind_parser_handles_lazy_multiple_entries_and_threaded_table(self):
  self.assertEqual(bind_ordinals(b'\x11\x40first\0\x90\0\x20\x81\x01\xd0\x02\xd1\0'),{1,129})
  for value in [b'\x40unterminated',b'\x20\x80',b'\xe0']:
   with self.assertRaises(ValueError):bind_ordinals(value)
