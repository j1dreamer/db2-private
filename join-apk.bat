@echo off
cd /d "%~dp0"
if exist "DB2-Private-Android-dev.apk" goto verify
copy /b "parts\part-000.bin"+"parts\part-001.bin"+"parts\part-002.bin"+"parts\part-003.bin"+"parts\part-004.bin"+"parts\part-005.bin"+"parts\part-006.bin"+"parts\part-007.bin"+"parts\part-008.bin"+"parts\part-009.bin"+"parts\part-010.bin"+"parts\part-011.bin"+"parts\part-012.bin"+"parts\part-013.bin"+"parts\part-014.bin"+"parts\part-015.bin"+"parts\part-016.bin"+"parts\part-017.bin"+"parts\part-018.bin"+"parts\part-019.bin"+"parts\part-020.bin"+"parts\part-021.bin"+"parts\part-022.bin"+"parts\part-023.bin"+"parts\part-024.bin" "DB2-Private-Android-dev.apk"
if errorlevel 1 goto failed
:verify
powershell -NoProfile -Command "$actual=(Get-FileHash -LiteralPath 'DB2-Private-Android-dev.apk' -Algorithm SHA256).Hash.ToLower(); if ($actual -ne 'a198837ccae5a3ad662d2489c4e1748016aebe77359e84f4bc4734c5f389f430') { Write-Error 'APK checksum mismatch'; exit 1 }; Write-Host 'APK verified: DB2-Private-Android-dev.apk'"
if errorlevel 1 goto failed
pause
exit /b 0
:failed
echo Assembly or checksum failed. Check all parts are present.
pause
exit /b 1
