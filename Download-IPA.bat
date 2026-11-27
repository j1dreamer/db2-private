@echo off
rem Downloads the verified unsigned IPA. Signing is a separate step.
call "%~dp0Download-Clients.bat" --only ipa %*
