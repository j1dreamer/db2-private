@echo off
cd /d "%~dp0"
python tools\download_apk.py --output DB2-Private-Android-dev.apk
if errorlevel 1 echo Download failed. Check that Python 3 is installed and retry. Downloaded parts can be resumed.
pause
