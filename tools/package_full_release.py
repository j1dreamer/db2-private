"""Package a clean source ZIP and checksum-pinned full clients, without old data."""
import argparse,hashlib,json,shutil,subprocess,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def sha(path):
    digest=hashlib.sha256()
    with Path(path).open('rb')as stream:
        for block in iter(lambda:stream.read(1024*1024),b''):digest.update(block)
    return digest.hexdigest()

def package(apk,ipa,output):
    release=json.loads((ROOT/'release.json').read_text());output=Path(output).resolve();output.mkdir(parents=True,exist_ok=True)
    clients=[]
    for name,path in (('android',Path(apk)),('ios',Path(ipa))):
        info=release[name]
        if path.stat().st_size!=info['bytes']or sha(path)!=info['sha256']:raise ValueError('Wrong or incomplete '+name+' client')
        target=output/info['file']
        if target.resolve()!=path.resolve():shutil.copyfile(path,target)
        clients.append(target)
    commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    if subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True).strip():raise ValueError('Commit source changes before packaging')
    source=output/release['server']['file']
    subprocess.run(['git','archive','--format=zip','--prefix=DB2-ENG-SPSSS-GM-Server/','--output',str(source),commit],cwd=ROOT,check=True)
    with zipfile.ZipFile(source)as archive:
        if archive.testzip():raise ValueError('Source ZIP CRC failure')
        names=set(archive.namelist())
        for name in names:
            parts=Path(name).parts
            if len(parts)>1 and parts[1]in('data','backups','.venv','.git'):raise ValueError('Private/runtime directory in archive: '+name)
            if Path(name).name=='admin-token'or Path(name).suffix.lower()in('.sqlite3','.db','.keystore','.jks','.ipa','.apk'):raise ValueError('Unexpected runtime/client file in source ZIP: '+name)
        for name in ('start.bat','start.py','Install-Android.bat','release.json','web/admin.js','tables/roleData.json','server/app.py'):
            if 'DB2-ENG-SPSSS-GM-Server/'+name not in names:raise ValueError('Missing source entry: '+name)
    readme=output/'README-FIRST.txt';shutil.copyfile(ROOT/'INSTALL.txt',readme)
    files=clients+[source,readme]
    manifest={**release,'source_commit':commit,'player_database_included':False,'assets':[{'file':p.name,'bytes':p.stat().st_size,'sha256':sha(p)}for p in files]}
    manifest_path=output/'release-manifest.json';manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');files.append(manifest_path)
    (output/'SHA256SUMS.txt').write_text(''.join(sha(p)+'  '+p.name+'\n'for p in files))
    print(json.dumps({'source_commit':commit,'source_zip_entries':len(names),'assets':manifest['assets']},indent=2))
    return manifest

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--apk',required=True,type=Path);parser.add_argument('--ipa',required=True,type=Path);parser.add_argument('--output',required=True,type=Path);args=parser.parse_args();package(args.apk,args.ipa,args.output)
