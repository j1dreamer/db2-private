#!/data/data/com.termux/files/usr/bin/bash
set -eu
cd -- "$(dirname -- "$0")"
if [ ! -x .venv/bin/python ] || ! command -v node >/dev/null 2>&1; then
    echo 'Run first: bash Setup-Termux.sh' >&2
    exit 1
fi
export AIOHTTP_NO_EXTENSIONS=1 MULTIDICT_NO_EXTENSIONS=1
export YARL_NO_EXTENSIONS=1 FROZENLIST_NO_EXTENSIONS=1 PROPCACHE_NO_EXTENSIONS=1
if command -v termux-wake-lock >/dev/null 2>&1; then termux-wake-lock || true; fi
release_wake_lock() {
    if command -v termux-wake-unlock >/dev/null 2>&1; then termux-wake-unlock || true; fi
}
trap release_wake_lock EXIT
echo 'DB2 server: keep this Termux session running. Ctrl+C stops it.'
echo 'Admin on this phone: http://127.0.0.1:20003'
echo 'Other devices: http://<Android Tailscale IPv4>:20003'
echo 'Admin token file: data/admin-token (created on first start).'
echo 'Player data: data/game.sqlite3 (kept between restarts).'
# Listen on Android interfaces, then advertise the same address the client used.
# This prevents the gate redirecting remote iPhones back to their own localhost.
python start.py --bind 0.0.0.0 --public-host auto --no-browser
