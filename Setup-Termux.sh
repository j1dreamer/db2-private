#!/data/data/com.termux/files/usr/bin/bash
# Run from the source folder in Termux's private home, not shared storage.
set -eu
cd -- "$(dirname -- "$0")"
if ! command -v pkg >/dev/null 2>&1; then
    echo 'Open this script in Termux on Android: bash Setup-Termux.sh' >&2
    exit 1
fi
case "$PWD" in
    /sdcard/*|/storage/*|/mnt/media_rw/*)
        echo 'Extract the server inside Termux home ($HOME), not shared storage.' >&2
        exit 1 ;;
esac
pkg update -y
pkg install -y python python-pip nodejs clang make pkg-config
# Android usually has no compatible PyPI binary wheels. These libraries support
# pure Python; avoid depending on desktop wheels or compiling optional C modules.
export AIOHTTP_NO_EXTENSIONS=1 MULTIDICT_NO_EXTENSIONS=1
export YARL_NO_EXTENSIONS=1 FROZENLIST_NO_EXTENSIONS=1 PROPCACHE_NO_EXTENSIONS=1
if [ ! -x .venv/bin/python ]; then python -m venv .venv; fi
# Do not upgrade pip itself: Termux manages its Python/pip installation.
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -c 'import aiohttp, sqlite3; print("Python / aiohttp / SQLite: OK")'
node --version
echo
echo 'Setup complete. Start: bash Start-Termux.sh'
echo 'Tailscale is the separate Android app; no root or tailscaled CLI is required.'
