"""Package a small, checksum-pinned development APK update for Windows/Python."""
import argparse,json,zipfile
from pathlib import Path
from .apply_apk_fix import sha
from .make_apk_patch import make_patch
from .verify_apk import resource_layout
OLD_SHA='d3dd3db256d550667eba386217e969327c82cc37985e2b503adea3673f883c3f'
ROOT=Path(__file__).resolve().parent.parent

def package(source,target,output,apk_name='DB2-Private-route342-dev.apk',archive_name='Client-Route342-Dev-Patch.zip'):
    for name,suffix in ((apk_name,'.apk'),(archive_name,'.zip')):
        if Path(name).name!=name or not name.endswith(suffix) or not all(c.isalnum() or c in '-_.' for c in name):raise ValueError('Use a plain output filename')
    if sha(source)!=OLD_SHA:raise ValueError('Expected the signed fixed APK as patch source')
    layout=resource_layout(target);output=Path(output);output.mkdir(parents=True,exist_ok=True);plan=make_patch(source,target,output);target_sha=plan['new_sha256']
    script=(ROOT/'tools/apply_dev_patch.ps1.in').read_text().replace('__OLD_SHA__',OLD_SHA).replace('__NEW_SHA__',target_sha)
    script=script.replace('DB2-Private-route342-dev.apk',apk_name)
    (output/'apply-dev.ps1').write_text(script)
    python=(ROOT/'tools/apply_apk_fix.py').read_text().replace("OLD_SHA='a198837ccae5a3ad662d2489c4e1748016aebe77359e84f4bc4734c5f389f430'","OLD_SHA='"+OLD_SHA+"'").replace("NEW_SHA='"+OLD_SHA+"'","NEW_SHA='"+target_sha+"'")
    python=python.replace("default='DB2-Private-Android-dev.apk'","default='DB2-Private-Android-fixed.apk'").replace("default='DB2-Private-Android-fixed.apk');p.add_argument('--patch'","default='DB2-Private-route342-dev.apk');p.add_argument('--patch'")
    python=python.replace('DB2-Private-route342-dev.apk',apk_name)
    (output/'apply-dev.py').write_text(python)
    def bat(name,body):(output/name).write_bytes(('@echo off\ncd /d "%~dp0"\n'+body+'\npause\n').replace('\n','\r\n').encode('ascii'))
    bat('Apply-Dev.bat','powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply-dev.ps1"')
    bat('Apply-Dev-Python.bat','python "%~dp0apply-dev.py"')
    bat('Install-Dev.bat','''set "DB2_ADB=C:\\Program Files\\BlueStacks_polar\\HD-Adb.exe"
if not exist "%DB2_ADB%" (
echo Cannot find BlueStacks ADB. Edit the DB2_ADB path in this file.
exit /b 1
)
"%DB2_ADB%" connect 127.0.0.1:6610
"%DB2_ADB%" -s 127.0.0.1:6610 install -r "%~dp0DB2-Private-route342-dev.apk"
if errorlevel 1 exit /b 1
"%DB2_ADB%" -s 127.0.0.1:6610 reverse tcp:20003 tcp:20003
"%DB2_ADB%" -s 127.0.0.1:6610 reverse --list'''.replace('DB2-Private-route342-dev.apk',apk_name))
    coverage=json.loads((ROOT/'analysis/route-coverage.json').read_text());manifest={'stage':'development-not-device-verified','implemented_routes':coverage['implemented_routes'],'target_routes':342,'apk_sha256':target_sha,'old_apk_sha256':OLD_SHA,'resources':layout,'tutorial':False,'game_speed':[1,10],'server_branch':'route-342','new_original_routes_complete':False,'all_route_handlers_implemented':coverage['implemented_routes']==342,'private_time_peak_adapter':True}
    manifest.update(apk_filename=apk_name,runtime_scheduler_binding='lazy-after-director-init')
    (output/'development-build.json').write_text(json.dumps(manifest,indent=2)+'\n')
    (output/'README.txt').write_text('''DB2 route-342 - BẢN PHÁT TRIỂN, CHƯA XÁC MINH TRÊN THIẾT BỊ

Độ phủ server: %s/342 route. Đây chưa phải bản chơi đã được xác minh trên thiết bị.
1. Giải nén gói này vào thư mục mới.
2. Chép DB2-Private-Android-fixed.apk đã ghép/cài thành công trước đây vào cùng thư mục.
3. Mở Apply-Dev.bat (PowerShell có sẵn). Hoặc Apply-Dev-Python.bat nếu đã cài Python.
4. Công cụ kiểm SHA-256 trước/sau và tạo DB2-Private-route342-dev.apk. Không ghép file bằng copy /b.
5. BlueStacks bật Android Debug Bridge, cổng 127.0.0.1:6610. Mở Install-Dev.bat để cài đè và reverse cổng 20003.
6. Server phải dùng source nhánh route-342 và có Node.js LTS + Python. Dừng server cũ, cập nhật source, giữ thư mục data rồi chạy start.bat.

APK cùng package/chứng thư bản fixed, cài đè bằng install -r; không cần gỡ app trước.
Bỏ hướng dẫn; nút Speed góc màn hình chuyển 1x đến 10x cho cả giao diện. Timer/thưởng/ngày dựa trên server.
Đã sửa lỗi màn nền: không gọi setTimeScale khi scheduler còn null lúc nạp bundle.
ADB không thấy máy: kiểm tra cổng trong BlueStacks, sửa 6610 trong Install-Dev.bat nếu cổng đã đổi.
APK/server là nhánh phát triển. Đủ handler không đồng nghĩa mọi luồng gameplay đã được thử trên thiết bị.
Time Peak dùng màn điều khiển và luật riêng vì source gốc thiếu màn hình/bảng blessing/quái.
SHA-256 APK mới: %s
'''%(coverage['implemented_routes'],target_sha))
    readme=output/'README.txt'
    readme.write_text(readme.read_text().replace('DB2-Private-route342-dev.apk',apk_name))
    names=['plan.json','literals.bin','apply-dev.ps1','apply-dev.py','Apply-Dev.bat','Apply-Dev-Python.bat','Install-Dev.bat','README.txt','development-build.json']
    archive=ROOT/archive_name
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9)as z:
        for name in names:z.write(output/name,name)
    print(json.dumps({'zip':str(archive),'sha256':sha(archive),'size':archive.stat().st_size,'apk_sha256':target_sha}));return archive

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('source');parser.add_argument('target');parser.add_argument('output');parser.add_argument('--apk-name',default='DB2-Private-route342-dev.apk');parser.add_argument('--archive-name',default='Client-Route342-Dev-Patch.zip');args=parser.parse_args();package(args.source,args.target,args.output,args.apk_name,args.archive_name)
