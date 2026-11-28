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
APK_BOXINFO_SHA='20b1bb238e2c5687c163b6ab75b0afca3679e8d1a800670d835b2430a833bc47'
APK_BOXINFO_SIZE=525062849
APK_PUBLIC_REF='7f8f1d1dbc62f79663fec257d1e1b39b7dbeda80'
APK_PUBLIC_PATCH_SHA='9a8eb4545290d55de91a070cca60374eb914df4bcd7d8fd05833e1463cdc924d'
APK_V15_SHA='1ea45760723a4b653dd205382ed66c419057374aafdfc0b1810274ecc2921a37'
IPA_BASE_SHA='c6c324ce858b2e5d7106246882f80479458af713e4bdbf16e13b04e882dac10b'
IPA_V15_SHA='c20e9ce1cd71ed65a1350bfff7f6f595a41a5a2b6b701c110fd9807d9a5d53b7'
IOS_LAUNCH_REF='7f8f1d1dbc62f79663fec257d1e1b39b7dbeda80'
IOS_LAUNCH_PATCH_SHA='b52cfdf5fcf25ec38ce1417e62c57f3820a19828faca2a622ec9f1a2a78d03ad'
APK_V15_SIZE=525071041
IPA_BASE_SIZE=511242249
IPA_V15_SIZE=510866848
V16_REF='3a1fd3306f6edd0f4b48917e63efe85e4a1bfc6d'
APK_V16_PATCH_SHA='7c95da44f65cd0a8ef1300d35460fa122faf30ed4625d3b187b71d2a75a2f03f'
IPA_V16_PATCH_SHA='049f1fa8796895e3f1609474e7f4e735760c68987c4e70eeb7bb52208deeafaf'
APK_V16_SHA='cd6e29cf40106a1ea8879a133051fde688f4b01764afdd761e8eebcf2867e45f'
IPA_V16_SHA='73723505dd78db90a6bd05a5d6846daa240572e96773a6577a51239c7a35bb00'
APK_V16_SIZE=525095617
IPA_V16_SIZE=510880829
APK_V17_PATCH_SHA='e9b416b2d506caa37879922b0de5fe8c944b36f679f1f1eedebf3ea713dededf'
IPA_V17_PATCH_SHA='dddb255a4affebc429e1ce910a3612c54d3a01c428c91c5fa945c1c21bb71251'
APK_V17_SHA='0759f93d287312b5d5f550fdee831ef547dcd9b66129212334ec0ab34702b677'
IPA_V17_SHA='a3027cd42e0cad3d386edf2183b87a6d8f5b6dd7b984d4400520363b96abf85a'
APK_V17_SIZE=525095617
IPA_V17_SIZE=510881941
V18_REF='6d31aefb32cd38ea89e5de312ec88a892a3ce211'
APK_V18_PATCH_SHA='9387a709b7ed7f4e3b01355511190fac251fdfce9c8eed3b117fafb35a2e583a'
IPA_V18_PATCH_SHA='799c8d81b307fd69db33b6e7d2c9129049a9df26323ca1a0656d86993df7dea7'
APK_SHA='1a475ee920d22e3ba6db2914f74665899ec80b199f73c8af03f899d649fe8bc2'
IPA_SHA='03b6125f3665f946db421bef05e0b090dbc0145ecd00f3dbe65b53bc2916621d'
APK_SIZE=525362076
IPA_SIZE=511149926
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
    def read(self,offset,size):return b''.join(self.blocks(offset,size))
    def blocks(self,offset,size):
        while size:
            index=bisect.bisect_right(self.ends,offset);start=self.ends[index-1]if index else 0;op=self.ops[index];within=offset-start;count=min(size,op['size']-within,CHUNK)
            block=self.source.read(op['copy']+within,count)if'copy'in op else self.literal[op['literal']+within:op['literal']+within+count]
            yield block;offset+=count;size-=count

def finish(temporary,output,size,digest):
    if temporary.stat().st_size!=size or sha(temporary)!=digest:raise ValueError('Final checksum mismatch; output was NOT accepted: '+output.name)
    os.replace(temporary,output);print('COMPLETE:',output,flush=True)

def android(output,cache,workers,source=None):
    target=output/'DB2-ENG-SPSSS-v18.apk'
    if ready(target,APK_SIZE,APK_SHA):return target
    if source is not None:
        source=Path(source).expanduser().resolve()
        if not source.is_file()or source.stat().st_size!=APK_BOXINFO_SIZE or sha(source)!=APK_BOXINFO_SHA:raise ValueError('Use the original signed BoxInfo APK as --apk-source, or omit to download automatically.')
        paths=[source];first=lit1=second=lit2=None
    else:
        paths=parts(cache/'android',ANDROID_REF,ANDROID_MANIFEST,524284609,BASE_SHA,'APK',workers)
        fix=fetch(RAW+'eac27239410d1251638431eb35e798dc00d89ba7/tools/legacy/APK-Install-Fix.zip',cache/'packaging.zip','7a6a3f74d7260a1024645808f5692d87bab238fb118c939897dd042f0c197e75')
        client=fetch(RAW+'eng-sp-sss/Client-ENG-SPSSS-BoxInfo-Patch.zip',cache/'client.zip','dee7233a2ad07523b1aeaaed867917588b30ae4585117f7ae38a608dcf866b55')
        first,lit1=load_patch(fix,BASE_SHA,FIXED_SHA);second,lit2=load_patch(client,FIXED_SHA,APK_BOXINFO_SHA)
        if first['old_size']!=524284609 or first['new_size']!=second['old_size']or second['new_size']!=APK_BOXINFO_SIZE:raise ValueError('Unexpected APK base sizes')
    patch=fetch(RAW+APK_PUBLIC_REF+'/Client-ENG-SPSSS-Android-v15.zip',cache/'android-publicready.zip',APK_PUBLIC_PATCH_SHA)
    base_plan,base_literal=load_patch(patch,APK_BOXINFO_SHA,APK_V15_SHA)
    if base_plan['old_size']!=APK_BOXINFO_SIZE or base_plan['new_size']!=APK_V15_SIZE:raise ValueError('Unexpected APK v15 reconstruction sizes')
    patch=fetch(RAW+V16_REF+'/Client-ENG-SPSSS-Android-v16.zip',cache/'android-v16.zip',APK_V16_PATCH_SHA)
    middle_plan,middle_literal=load_patch(patch,APK_V15_SHA,APK_V16_SHA)
    if middle_plan['old_size']!=APK_V15_SIZE or middle_plan['new_size']!=APK_V16_SIZE:raise ValueError('Unexpected APK v16 sizes')
    patch=fetch(RAW+V16_REF+'/Client-ENG-SPSSS-Android-v17.zip',cache/'android-v17.zip',APK_V17_PATCH_SHA)
    last_plan,last_literal=load_patch(patch,APK_V16_SHA,APK_V17_SHA)
    if last_plan['old_size']!=APK_V16_SIZE or last_plan['new_size']!=APK_V17_SIZE:raise ValueError('Unexpected APK v17 sizes')
    patch=fetch(RAW+V18_REF+'/Client-ENG-SPSSS-Android-v18.zip',cache/'android-v18.zip',APK_V18_PATCH_SHA)
    plan,literal=load_patch(patch,APK_V17_SHA,APK_SHA)
    if plan['old_size']!=APK_V17_SIZE or plan['new_size']!=APK_SIZE:raise ValueError('Unexpected APK reconstruction sizes')
    temporary=target.with_name(target.name+'.downloading');print('APK: creating complete signed PublicReady file...',flush=True)
    with contextlib.ExitStack()as stack,temporary.open('wb')as dest:
        src=PartSource(paths,stack)
        if first is not None:src=FixedSource(FixedSource(src,first,lit1),second,lit2)
        src=FixedSource(FixedSource(FixedSource(src,base_plan,base_literal),middle_plan,middle_literal),last_plan,last_literal)
        for op in plan['operations']:
            if'literal'in op:dest.write(literal[op['literal']:op['literal']+op['size']])
            else:
                offset=op['copy'];remaining=op['size']
                while remaining:
                    count=min(remaining,CHUNK);dest.write(src.read(offset,count));offset+=count;remaining-=count
    finish(temporary,target,APK_SIZE,APK_SHA);return target

def ios(output,cache,workers,source=None):
    target=output/'DB2-ENG-SPSSS-v18-unsigned.ipa'
    if ready(target,IPA_SIZE,IPA_SHA):return target
    if source is not None:
        source=Path(source).expanduser().resolve()
        if not source.is_file()or source.stat().st_size!=IPA_BASE_SIZE or sha(source)!=IPA_BASE_SHA:
            raise ValueError('Use the original unsigned BoxInfo IPA as --ipa-source, before Sideloadly signing. Omit this option to download automatically.')
        paths=[source];print('IPA: verified original unsigned BoxInfo input.',flush=True)
    else:paths=parts(cache/'ios',IOS_REF,IOS_MANIFEST,IPA_BASE_SIZE,IPA_BASE_SHA,'IPA',workers)
    patch=fetch(RAW+IOS_LAUNCH_REF+'/Client-ENG-SPSSS-IOS-v15.zip',cache/'ios-publicready.zip',IOS_LAUNCH_PATCH_SHA)
    base_plan,base_literal=load_patch(patch,IPA_BASE_SHA,IPA_V15_SHA)
    if base_plan['old_size']!=IPA_BASE_SIZE or base_plan['new_size']!=IPA_V15_SIZE:raise ValueError('Unexpected IPA v15 reconstruction sizes')
    patch=fetch(RAW+V16_REF+'/Client-ENG-SPSSS-IOS-v16.zip',cache/'ios-v16.zip',IPA_V16_PATCH_SHA)
    middle_plan,middle_literal=load_patch(patch,IPA_V15_SHA,IPA_V16_SHA)
    if middle_plan['old_size']!=IPA_V15_SIZE or middle_plan['new_size']!=IPA_V16_SIZE:raise ValueError('Unexpected IPA v16 sizes')
    patch=fetch(RAW+V16_REF+'/Client-ENG-SPSSS-IOS-v17.zip',cache/'ios-v17.zip',IPA_V17_PATCH_SHA)
    last_plan,last_literal=load_patch(patch,IPA_V16_SHA,IPA_V17_SHA)
    if last_plan['old_size']!=IPA_V16_SIZE or last_plan['new_size']!=IPA_V17_SIZE:raise ValueError('Unexpected IPA v17 sizes')
    patch=fetch(RAW+V18_REF+'/Client-ENG-SPSSS-IOS-v18.zip',cache/'ios-v18.zip',IPA_V18_PATCH_SHA)
    plan,literal=load_patch(patch,IPA_V17_SHA,IPA_SHA)
    if plan['old_size']!=IPA_V17_SIZE or plan['new_size']!=IPA_SIZE:raise ValueError('Unexpected IPA reconstruction sizes')
    temporary=target.with_name(target.name+'.downloading');print('IPA: creating complete unsigned PublicReady file...',flush=True)
    with contextlib.ExitStack()as stack,temporary.open('wb')as dest:
        source=FixedSource(FixedSource(FixedSource(PartSource(paths,stack),base_plan,base_literal),middle_plan,middle_literal),last_plan,last_literal)
        for op in plan['operations']:
            if 'literal'in op:dest.write(literal[op['literal']:op['literal']+op['size']])
            else:
                offset=op['copy'];remaining=op['size']
                while remaining:
                    count=min(remaining,CHUNK);dest.write(source.read(offset,count));offset+=count;remaining-=count
    finish(temporary,target,IPA_SIZE,IPA_SHA);return target

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--only',choices=('both','apk','ipa'),default='both');parser.add_argument('--output',type=Path,default=Path(__file__).resolve().parent);parser.add_argument('--apk-source',type=Path,help='Optional verified signed BoxInfo APK');parser.add_argument('--ipa-source',type=Path,help='Optional original unsigned BoxInfo IPA to avoid downloading it again');parser.add_argument('--workers',type=int,choices=range(1,9),default=4);args=parser.parse_args()
    output=args.output.expanduser().resolve();output.mkdir(parents=True,exist_ok=True);cache=output/'.longzhidao-download-cache'
    print('DB2 ENG SSS/SP + GM VI - complete clients, BoxInfo + Speed 1x-10x. iOS PublicReady is unsigned; sign again.',flush=True)
    print('Output:',output,'\nKeep this window open. Run again to reuse verified downloads.',flush=True)
    files=[]
    if args.only in('both','apk'):files.append(android(output,cache,args.workers,args.apk_source))
    if args.only in('both','ipa'):files.append(ios(output,cache,args.workers,args.ipa_source))
    (output/'CLIENT-SHA256SUMS.txt').write_text(''.join(sha(p)+'  '+p.name+'\n'for p in files))
    print('DONE. Use/upload the complete APK/IPA above; no manual joining is needed.',flush=True)
    print('Verified cache can be deleted after success:',cache,flush=True)
if __name__=='__main__':
    try:main()
    except KeyboardInterrupt:print('\nStopped. Run again to reuse verified downloads.');raise SystemExit(130)
    except Exception as error:print('\nFAILED:',str(error),'\nKeep the cache and run again. No incomplete output is accepted.');raise SystemExit(1)
