DB2 ENG SSS/SP + GM + BOX INFO/SPEED + IOS LAUNCH FIX - AUTOMATIC COMPLETE CLIENT DOWNLOAD

Windows: install Python 3.10+ (enable Add Python to PATH).
Extract this ZIP to a NEW folder and double-click Download-Clients.bat.
The program automatically downloads and checks every part, then creates:
  DB2-ENG-SPSSS-PublicReady.apk        (525,071,041 bytes; signed)
  DB2-ENG-SPSSS-PublicReady-unsigned.ipa   (510,866,000 bytes; unsigned)
Both include Speed 1x-10x and the original ENG gameplay, Vietnamese and permission-checked GM.
No old APK, Git, Java, Node or manual file joining is needed for downloading.

Allow about 2.2 GB free disk space for both clients and the resumable cache.
If interrupted, run the same BAT again. Verified cached parts are reused.
After DONE, the two complete files are beside the BAT. Upload those to Google Drive.
The .longzhidao-download-cache folder may be deleted after both files verify.
Never install an .apk.downloading file or rename an unfinished download.

APK-only: python Download-Clients.py --only apk
IPA-only (Mac): python3 Download-Clients.py --only ipa
IPA requires legitimate signing on your Mac before installing on iPhone.

Server source (separate, no old player data):
https://github.com/j1dreamer/db2-private/archive/refs/heads/eng-sp-sss.zip
Server runtime needs Python + Node.js LTS; extract into a new folder and run start.bat.
Source/provenance and implementation limits are documented in that repository.

GM: Admin > Players > Grant GM. New client shows GM below Speed.
GM has item/role lists and player/role level, VIP and resource controls.
Use the current eng-sp-sss-combat-box-v8 server (schema 30).
The v6 event update keeps these same BoxInfo clients.
IPA-only: double-click Download-IPA.bat; on Mac run bash Download-IPA.command.
Signing/install and later Tailscale IP setup: see IPA-INSTALL.md.

New box UI: owned/open/reward counts, 1/10/max, cancel X.
Speed is compact, draggable; position is saved, tap changes immediately.
Install the new client AND update server. Keep your existing ENG player database.

All box descriptions explain selection/full/random rewards from actual config.
One SP box with x60 fragments shows x60 on the reward cell (not chest count).

IOS LAUNCHFIX: removes two startup plugins after the device log showed
[sjcode] disabled/not-found; kill now, followed by a voluntary process exit.
Select the PublicReady IPA in Sideloadly and sign/install again.
Native instructions are unchanged; JSC includes the new controls. Native validation is pending.
Optional: Download-IPA.bat --ipa-source "C:\path\DB2-ENG-SPSSS-BoxInfo-unsigned.ipa"
Use the old ORIGINAL unsigned file, not a signed/edited IPA.

IOS LOGINFIX: original username/password form restored when unconfigured.
Connection failure returns to editable server settings within 8 seconds.
Source/rules button removed; Vietnamese labels use system font fallback.
The earlier startup plugin repair stays included. Re-sign the PublicReady IPA.

IOS CONTROLS: compact server dialog; network popup exits the retry loop.
Round speed button: drag to move, hold 2 seconds for 1-10x slider, tap for Auto/Record.
Named single/multiple-point plans, draggable markers, per-point delay/hold.
Separate saved recordings and drafts; play/pause/resume and draggable toolbar.
See CLIENT-CONTROLS.md. iPhone native interaction remains pending.

AutoPlans is project-authored from the statically inspected X7 plan/point/record model.
Pixel/native equivalence is not verified; user validates on iPhone after signing.

IOS BOXRESTORE: stock selection/count/confirm controls restored.
Canvas/system font for Vietnamese labels; source SP/SS/SSS box rewards unchanged.
Ubuntu v8 requires combat.available=true in /health. Read COMBAT-BOX-FIX.md.

PUBLICREADY: hides experimental floating Time Peak in both clients.
After HTTPS setup, enter https://db2.teck.io.vn in game; no VPN/reverse needed.
Admin setup and private credential locations: PUBLIC-HTTPS.md.
Optional fast APK update: python Download-Clients.py --only apk --apk-source "C:\path\DB2-ENG-SPSSS-BoxInfo.apk"
