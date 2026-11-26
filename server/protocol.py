"""Pomelo framing recovered from the supplied client's protocol.js."""
import json

def package(kind, body=b''):
    if len(body)>0xffffff: raise ValueError('Packet too large')
    return bytes([kind])+len(body).to_bytes(3,'big')+body

def packages(data):
    offset=0
    while offset<len(data):
        if len(data)-offset<4: raise ValueError('Truncated header')
        kind=data[offset]; length=int.from_bytes(data[offset+1:offset+4],'big'); offset+=4
        if offset+length>len(data): raise ValueError('Truncated packet')
        yield kind,data[offset:offset+length]
        offset+=length

def request(data):
    if not data: raise ValueError('Empty message')
    flag=data[0]; kind=(flag>>1)&7; offset=1; ident=0
    if kind not in (0,1): raise ValueError('Expected request or notify')
    if kind==0:
        for shift in range(0,35,7):
            if offset>=len(data): raise ValueError('Truncated ID')
            x=data[offset]; offset+=1; ident|=(x&127)<<shift
            if x<128:break
        else:raise ValueError('Invalid ID')
    if flag&1:raise ValueError('Compressed routes not negotiated')
    if offset>=len(data): raise ValueError('Missing route')
    length=data[offset]; offset+=1
    if offset+length>len(data):raise ValueError('Truncated route')
    route=data[offset:offset+length].decode();offset+=length
    body=json.loads(data[offset:])
    if not isinstance(body,dict):raise ValueError('Expected object')
    return ident,route,body

def response(ident,body):
    result=bytearray([4])
    while True:
        n=ident&127;ident>>=7;result.append(n|(128 if ident else 0))
        if not ident:break
    return package(4,bytes(result)+json.dumps(body,ensure_ascii=False,separators=(',',':')).encode())

def push(route,body):
    encoded=route.encode()
    if not 1<=len(encoded)<=255:raise ValueError('Invalid push route')
    return package(4,bytes([6,len(encoded)])+encoded+json.dumps(body,ensure_ascii=False,separators=(',',':')).encode())
