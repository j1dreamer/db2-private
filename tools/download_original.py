"""Download the user-supplied public client archive for reproducible release builds."""
import argparse,hashlib,urllib.request,urllib.parse,os
from html.parser import HTMLParser
from pathlib import Path
FILE_ID='1XVzVUKKxOkqnbYoqIpC6nVXABgMs9ItH'
EXPECTED_SHA256='027cbdae200848d67103a2dd3e3520f4ea42215d1d37e8efb74305d8f655d069'
class DownloadForm(HTMLParser):
    def __init__(self):super().__init__();self.action=None;self.values=[];self.active=False
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='form' and attrs.get('id')=='download-form':self.active=True;self.action=attrs.get('action')
        if self.active and tag=='input' and attrs.get('type')=='hidden' and attrs.get('name'):self.values.append((attrs['name'],attrs.get('value','')))
    def handle_endtag(self,tag):
        if tag=='form':self.active=False
    def url(self):
        target=urllib.parse.urlsplit(self.action or '')
        if target.scheme!='https' or target.hostname!='drive.usercontent.google.com' or target.path!='/download':raise ValueError('Unexpected Google download form')
        if dict(self.values).get('id')!=FILE_ID:raise ValueError('Unexpected file ID')
        return self.action+'?'+urllib.parse.urlencode(self.values)
def sha(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()
def download(output):
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
    if output.exists():
        if sha(output)==EXPECTED_SHA256:print('Archive already verified');return
        raise ValueError('Existing archive checksum mismatch; refusing to overwrite')
    url='https://drive.google.com/uc?'+urllib.parse.urlencode({'export':'download','id':FILE_ID})
    opener=urllib.request.build_opener()
    with opener.open(url,timeout=60) as r:
        if 'text/html' in r.headers.get('Content-Type',''):
            form=DownloadForm();form.feed(r.read(2*1024*1024).decode('utf8'));url=form.url();response=None
        else:response=r.read()
    part=output.with_suffix(output.suffix+'.part')
    try:
        if response is not None:part.write_bytes(response)
        else:
            with opener.open(url,timeout=60) as r,part.open('xb') as f:
                if 'text/html' in r.headers.get('Content-Type',''):raise ValueError('Google returned HTML instead of the archive')
                total=0
                while True:
                    chunk=r.read(1024*1024)
                    if not chunk:break
                    total+=len(chunk)
                    if total>700*1024*1024:raise ValueError('Archive exceeds expected size bound')
                    f.write(chunk)
        if sha(part)!=EXPECTED_SHA256:raise ValueError('Downloaded archive checksum mismatch')
        os.replace(part,output);print('Archive SHA-256 verified')
    except BaseException:
        part.unlink(missing_ok=True);raise
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();download(a.output)
