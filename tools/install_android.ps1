param(
    [string]$Adb = $env:DB2_ADB,
    [string]$Serial,
    [string]$Apk,
    [switch]$LocalServer
)
$ErrorActionPreference = 'Stop'
try {
    if (-not $Apk) { $Apk = Join-Path (Split-Path $PSScriptRoot -Parent) ((Get-Content -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) 'release.json') -Raw | ConvertFrom-Json).android.file) }
    if (-not (Test-Path -LiteralPath $Apk -PathType Leaf)) { throw "Place the complete APK from this release beside Install-Android.bat. Missing: $Apk" }
    $expected = (Get-Content -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) 'release.json') -Raw | ConvertFrom-Json).android.sha256
    if ($expected -notmatch '^[a-f0-9]{64}$') { throw 'Invalid release manifest.' }
    if ((Get-FileHash -LiteralPath $Apk -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) { throw 'APK checksum mismatch. Download the APK from this release again.' }
    if (-not $Adb) {
        $candidates = @()
        foreach ($base in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
            if ($base -and (Test-Path -LiteralPath $base)) {
                $candidates += Get-ChildItem -LiteralPath $base -Directory -Filter 'BlueStacks*' | ForEach-Object { Join-Path $_.FullName 'HD-Adb.exe' }
            }
        }
        $Adb = $candidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
        if (-not $Adb) { $command = Get-Command adb -ErrorAction SilentlyContinue; if ($command) { $Adb = $command.Source } }
    }
    if (-not $Adb -or -not (Test-Path -LiteralPath $Adb -PathType Leaf)) { throw 'Cannot find ADB. Run tools\install_android.ps1 -Adb "FULL_PATH_TO_HD-Adb.exe".' }
    if (-not $Serial) { $Serial = Read-Host 'BlueStacks ADB address [127.0.0.1:6610]'; if (-not $Serial) { $Serial = '127.0.0.1:6610' } }
    if ($Serial -notmatch '^[A-Za-z0-9._:-]+$') { throw 'Invalid ADB address or serial.' }
    if ($Serial -match ':\d+$') { & $Adb connect $Serial; if ($LASTEXITCODE -ne 0) { throw 'ADB connect failed. Start BlueStacks and enable Android Debug Bridge.' } }
    & $Adb -s $Serial get-state
    if ($LASTEXITCODE -ne 0) { throw 'ADB device is not ready. Check the address shown in BlueStacks.' }
    & $Adb -s $Serial install -r $Apk
    if ($LASTEXITCODE -ne 0) { throw 'APK install failed. See the ADB error above.' }
    if ($LocalServer) {
    & $Adb -s $Serial reverse tcp:20003 tcp:20003
    if ($LASTEXITCODE -ne 0) { throw 'APK installed, but reverse failed. Check ADB before opening the game.' }
    & $Adb -s $Serial reverse --list
    if ($LASTEXITCODE -ne 0) { throw 'Cannot verify ADB reverse.' }
    Write-Host 'Installed for local server: http://127.0.0.1:20003'
    } else {
        Write-Host 'Installed. In the game Server settings enter https://db2.teck.io.vn after HTTPS deployment is ready. No ADB reverse or VPN is needed.'
    }
} catch { Write-Host $_.Exception.Message -ForegroundColor Red; exit 1 }
