@echo off
cd /d "%~dp0"
where python >nul 2>&1
if errorlevel 1 (
    py -3 -u "%~dp0Download-Clients.py" %*
) else (
    python -u "%~dp0Download-Clients.py" %*
)
if errorlevel 1 echo Download did not finish. Read the error above. Install Python 3.10+ if it was not found.
pause
