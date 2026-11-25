"""One-command launcher for Windows, macOS, Linux and Termux."""
from pathlib import Path
import os,sys,subprocess,venv,threading,time,urllib.request,webbrowser,shutil,argparse
root=Path(__file__).resolve().parent
venvdir=root/'.venv';python=venvdir/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
if not python.exists():venv.EnvBuilder(with_pip=True).create(venvdir)
probe=subprocess.run([str(python),'-c','import aiohttp'],capture_output=True)
if probe.returncode:subprocess.run([str(python),'-m','pip','install','-r',str(root/'requirements.txt')],check=True)
args=sys.argv[1:];no_browser='--no-browser' in args
args=[a for a in args if a!='--no-browser']
if '--help' not in args and '-h' not in args and not no_browser:
    parser=argparse.ArgumentParser(add_help=False);parser.add_argument('--bind',default='127.0.0.1');parser.add_argument('--port',type=int,default=20003);opts,_=parser.parse_known_args(args)
    host='127.0.0.1' if opts.bind=='0.0.0.0' else opts.bind;url=f'http://{host}:{opts.port}'
    def open_admin():
        for _ in range(100):
            try:
                with urllib.request.urlopen(url+'/health',timeout=1) as r:
                    if r.status==200:break
            except (OSError,ValueError):time.sleep(.1)
        else:return
        termux=shutil.which('termux-open-url')
        if termux:subprocess.run([termux,url],check=False)
        else:webbrowser.open(url)
    threading.Thread(target=open_admin,daemon=True).start()
try:raise SystemExit(subprocess.call([str(python),'-m','server.app',*args],cwd=root))
except KeyboardInterrupt:raise SystemExit(130)
