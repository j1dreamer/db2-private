"""Download the complete, checksum-pinned DB2 ENG SSS/SP + GM + BoxInfo APK/IPA without chat downloads.
Standard-library only. Public HTTPS inputs; no login, token, Git, Java or old APK needed.
"""
import argparse,bisect,concurrent.futures,contextlib,hashlib,json,os,re,sys,time,urllib.error,urllib.request,zipfile
from pathlib import Path
RAW='https://raw.githubusercontent.com/j1dreamer/db2-private/'
ANDROID_REF='f193ded34731bfbb63074301cd582f032a8f9107'
IOS_REF='63d1537f2d4e8d0c9f7eb19a76911251da3a4907'
ANDROID_MANIFEST='058c91565e0caee080ff4e2f50606c615eef8af6baa75c8ad7df0b3480805ec2'
IOS_MANIFEST='680b31b9219ab931c73dc2d1b3cbc673d9ee91a7a3a06a645001440c88f75012'
BASE_SHA='a198837ccae5a3ad662d2489c4e1748016aebe77359e84f4bc4734c5f389f430'
FIXED_SHA='d3dd3db256d550667eba386217e969327c82cc37985e2b503adea3673f883c3f'
APK_SHA='20b1bb238e2c5687c163b6ab75b0afca3679e8d1a800670d835b2430a833bc47'
IPA_BASE_SHA='c6c324ce858b2e5d7106246882f80479458af713e4bdbf16e13b04e882dac10b'
IPA_SHA='36fe32b8fadabbe73f1f9b17c3e66ce829645e9258a56f9fff2d53708f548ad4'
IOS_LAUNCH_REF='68958aef01e5c0b3fd3fa58f5651e4672476d56e'
IOS_LAUNCH_PATCH_SHA='81e38ad77c2e0f090035bd94db8147b4881bf2d43e6695d0439361877b206a5f'
APK_SIZE=525062849
IPA_BASE_SIZE=511242249
IPA_SIZE=510862012
CHUNK=1024*1024

def sha(path):
    h=hashlib.sha256()
    with Path(path).open('rb')as stream:
        for block in iter(lambda:stream.read(CHUNK),b''):h.update(block)
    return h.hexdigest()

def ready(path,size,digest):
    if not path.exists():return False
    if not path.is_file()or path.stat().st_size!=size or sha(path)!=digest:
        raise ValueError('Existing output differs from this build. Move it before retrying: '+str(path))
    print('Already complete and verified:',path,flush=True);return True

def fetch(url,path,digest,size=None,limit=24*1024*1024):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    if path.is_file()and(size is None or path.stat().st_size==size)and sha(path)==digest:return path
    temporary=path.with_name(path.name+'.partial')
    for attempt in range(3):
        try:
            request=urllib.request.Request(url,headers={'User-Agent':'LongChiDao-ClientDownloader/1.0'})
            with urllib.request.urlopen(request,timeout=90)as response,temporary.open('wb')as dest:
                h=hashlib.sha256();count=0
                while block:=response.read(CHUNK):
                    count+=len(block)
                    if count>limit or(size is not None and count>size):raise ValueError('Download exceeds expected size: '+path.name)
                    dest.write(block);h.update(block)
            if(size is not None and count!=size)or h.hexdigest()!=digest:raise ValueError('Download checksum mismatch: '+path.name)
            os.replace(temporary,path);return path
        except(OSError,ValueError,urllib.error.URLError):
            temporary.unlink(missing_ok=True)
            if attempt==2:raise
            print('Retrying:',path.name,flush=True);time.sleep(2**attempt)

def parts(cache,ref,manifest_digest,expected_size,expected_sha,label,workers):
    path=fetch(RAW+ref+'/manifest.json',cache/'manifest.json',manifest_digest,limit=1024*1024)
    manifest=json.loads(path.read_text());rows=manifest['parts']
    if manifest['sha256']!=expected_sha or manifest.get('size',manifest.get('bytes'))!=expected_size or len(rows)!=25:raise ValueError('Unexpected '+label+' manifest')
    normalized=[]
    for index,row in enumerate(rows):
        name=f'parts/part-{index:03d}.bin';size=row.get('size',row.get('bytes'));digest=row['sha256']
        if row['file']!=name or type(size)is not int or not 0<size<=20*1024*1024 or not re.fullmatch('[a-f0-9]{64}',digest):raise ValueError('Invalid transport metadata')
        normalized.append((name,size,digest))
    if sum(n for _,n,_ in normalized)!=expected_size:raise ValueError('Wrong transport size')
    def get(item):
        name,size,digest=item;dest=cache/Path(name).name
        fetch(RAW+ref+'/'+name,dest,digest,size)
        print(label+': verified '+Path(name).name,flush=True);return dest
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers)as pool:paths=list(pool.map(get,normalized))
    # Validate the entire source too, rather than trusting only the part list.
    h=hashlib.sha256()
    for p in paths:
        with p.open('rb')as stream:
            for block in iter(lambda:stream.read(CHUNK),b''):h.update(block)
    if h.hexdigest()!=expected_sha:raise ValueError('Complete transport checksum mismatch')
    return paths

def load_patch(path,old_sha,new_sha):
    with zipfile.ZipFile(path)as archive:
        if archive.getinfo('plan.json').file_size>8*1024*1024 or archive.getinfo('literals.bin').file_size>16*1024*1024:raise ValueError('Unexpected patch bounds')
        plan=json.loads(archive.read('plan.json'));literal=archive.read('literals.bin')
    if plan['old_sha256']!=old_sha or plan['new_sha256']!=new_sha or len(plan['operations'])>50000:raise ValueError('Unexpected APK reconstruction version')
    total=0
    for op in plan['operations']:
        if set(op)not in({'copy','size'},{'literal','size'}):raise ValueError('Invalid reconstruction operation')
        size=op['size'];offset=op.get('copy',op.get('literal'));bound=plan['old_size']if'copy'in op else len(literal)
        if type(size)is not int or type(offset)is not int or size<=0 or offset<0 or offset+size>bound:raise ValueError('Invalid reconstruction range')
        total+=size
    if total!=plan['new_size']:raise ValueError('Invalid reconstruction length')
    return plan,literal

class PartSource:
    def __init__(self,paths,stack):
        self.handles=[stack.enter_context(p.open('rb'))for p in paths];self.ends=[];total=0
        for p in paths:total+=p.stat().st_size;self.ends.append(total)
    def read(self,offset,size):
        data=[]
        while size:
            index=bisect.bisect_right(self.ends,offset);start=self.ends[index-1]if index else 0;count=min(size,self.ends[index]-offset)
            f=self.handles[index];f.seek(offset-start);block=f.read(count)
            if len(block)!=count:raise ValueError('Truncated source chunk')
            data.append(block);offset+=count;size-=count
        return b''.join(data)

class FixedSource:
    """Read a virtual fixed APK, avoiding two 500 MB intermediate files."""
    def __init__(self,source,plan,literal):
        self.source=source;self.ops=plan['operations'];self.literal=literal;self.ends=[];total=0
        for op in self.ops:total+=op['size'];self.ends.append(total)
    def blocks(self,offset,size):
        while size:
            index=bisect.bisect_right(self.ends,offset);start=self.ends[index-1]if index else 0;op=self.ops[index];within=offset-start;count=min(size,op['size']-within,CHUNK)
            block=self.source.read(op['copy']+within,count)if'copy'in op else self.literal[op['literal']+within:op['literal']+within+count]
            yield block;offset+=count;size-=count

def finish(temporary,output,size,digest):
    if temporary.stat().st_size!=size or sha(temporary)!=digest:raise ValueError('Final checksum mismatch; output was NOT accepted: '+output.name)
    os.replace(temporary,output);print('COMPLETE:',output,flush=True)

def android(output,cache,workers):
    target=output/'DB2-ENG-SPSSS-BoxInfo.apk'
    if ready(target,APK_SIZE,APK_SHA):return target
    paths=parts(cache/'android',ANDROID_REF,ANDROID_MANIFEST,524284609,BASE_SHA,'APK',workers)
    fix=fetch(RAW+'eac27239410d1251638431eb35e798dc00d89ba7/tools/legacy/APK-Install-Fix.zip',cache/'packaging.zip','7a6a3f74d7260a1024645808f5692d87bab238fb118c939897dd042f0c197e75')
    client=fetch(RAW+'eng-sp-sss/Client-ENG-SPSSS-BoxInfo-Patch.zip',cache/'client.zip','dee7233a2ad07523b1aeaaed867917588b30ae4585117f7ae38a608dcf866b55')
    first,lit1=load_patch(fix,BASE_SHA,FIXED_SHA);second,lit2=load_patch(client,FIXED_SHA,APK_SHA)
    if first['old_size']!=524284609 or first['new_size']!=second['old_size']or second['new_size']!=APK_SIZE:raise ValueError('Unexpected reconstruction sizes')
    temporary=target.with_name(target.name+'.downloading');print('APK: creating complete signed file...',flush=True)
    with contextlib.ExitStack()as stack,temporary.open('wb')as dest:
        source=FixedSource(PartSource(paths,stack),first,lit1)
        for op in second['operations']:
            if'literal'in op:dest.write(lit2[op['literal']:op['literal']+op['size']])
            else:
                for block in source.blocks(op['copy'],op['size']):dest.write(block)
    finish(temporary,target,APK_SIZE,APK_SHA);return target

def ios(output,cache,workers,source=None):
    target=output/'DB2-ENG-SPSSS-TextFix-unsigned.ipa'
    if ready(target,IPA_SIZE,IPA_SHA):return target
    if source is not None:
        source=Path(source).expanduser().resolve()
        if not source.is_file()or source.stat().st_size!=IPA_BASE_SIZE or sha(source)!=IPA_BASE_SHA:
            raise ValueError('Use the original unsigned BoxInfo IPA as --ipa-source, before Sideloadly signing. Omit this option to download automatically.')
        paths=[source];print('IPA: verified original unsigned BoxInfo input.',flush=True)
    else:paths=parts(cache/'ios',IOS_REF,IOS_MANIFEST,IPA_BASE_SIZE,IPA_BASE_SHA,'IPA',workers)
    patch=fetch(RAW+IOS_LAUNCH_REF+'/Client-ENG-SPSSS-IOS-TextFix.zip',cache/'ios-textfix.zip',IOS_LAUNCH_PATCH_SHA)
    plan,literal=load_patch(patch,IPA_BASE_SHA,IPA_SHA)
    if plan['old_size']!=IPA_BASE_SIZE or plan['new_size']!=IPA_SIZE:raise ValueError('Unexpected IPA reconstruction sizes')
    temporary=target.with_name(target.name+'.downloading');print('IPA: creating complete unsigned TextFix file...',flush=True)
    with contextlib.ExitStack()as stack,temporary.open('wb')as dest:
        source=PartSource(paths,stack)
        for op in plan['operations']:
            if 'literal'in op:dest.write(literal[op['literal']:op['literal']+op['size']])
            else:
                offset=op['copy'];remaining=op['size']
                while remaining:
                    count=min(remaining,CHUNK);dest.write(source.read(offset,count));offset+=count;remaining-=count
    finish(temporary,target,IPA_SIZE,IPA_SHA);return target

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--only',choices=('both','apk','ipa'),default='both');parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parent);parser.add_argument('--ipa-source',type=Path,help='Optional original unsigned BoxInfo IPA to avoid downloading it again');parser.add_argument('--workers',type=int,choices=range(1,9),default=4);args=parser.parse_args()
    output=args.output.expanduser().resolve();output.mkdir(parents=True,exist_ok=True);cache=output/'.longzhidao-download-cache'
    print('DB2 ENG SSS/SP + GM VI - complete clients, BoxInfo + Speed 1x-10x. iOS TextFix is unsigned; sign again.',flush=True)
    print('Output:',output,'\nKeep this window open. Run again to reuse verified downloads.',flush=True)
    files=[]
    if args.only in('both','apk'):files.append(android(output,cache,args.workers))
    if args.only in('both','ipa'):files.append(ios(output,cache,args.workers,args.ipa_source))
    (output/'CLIENT-SHA256SUMS.txt').write_text(''.join(sha(p)+'  '+p.name+'\n'for p in files))
    print('DONE. Use/upload the complete APK/IPA above; no manual joining is needed.',flush=True)
    print('Verified cache can be deleted after success:',cache,flush=True)
if __name__=='__main__':
    try:main()
    except KeyboardInterrupt:print('\nStopped. Run again to reuse verified downloads.');raise SystemExit(130)
    except Exception as error:print('\nFAILED:',str(error),'\nKeep the cache and run again. No incomplete output is accepted.');raise SystemExit(1)
