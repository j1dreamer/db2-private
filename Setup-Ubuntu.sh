#!/usr/bin/env bash
# DB2 ENG v10: first install / repeat install with backup; no SSH backdoor.
set -Eeuo pipefail
umask 077
REF=a143bfd59487ef67aad0e6d70bcb2fe326de91c1
BASE=/opt/db2
if (( EUID != 0 )); then exec sudo bash "$0" "$@"; fi
NETWORK=private
if [[ ${1:-} == --loopback ]]; then NETWORK=loopback; shift; fi
[[ $# == 0 ]] || { echo 'Usage: Setup-Ubuntu.sh [--loopback]'; exit 1; }
[[ -d /run/systemd/system ]] || { echo 'Run this on the Ubuntu VPS after SSH, not in iSH locally.'; exit 1; }
. /etc/os-release
[[ ${ID:-} == ubuntu || ${ID:-} == debian ]] || { echo 'Ubuntu/Debian required.'; exit 1; }
work=$(mktemp -d /tmp/db2-install.XXXXXX)
old_active=0
switched=0
finish() {
 rc=$?
 if ((rc)); then
  echo 'Installation failed; see the error above. No database was deleted.' >&2
  if ((switched)); then
   systemctl stop db2 || true
   if [[ -n ${previous:-} && -d $previous ]]; then ln -sfn "$previous" "$BASE/app"; fi
   if [[ -n ${backup:-} && -d $backup ]]; then
    [[ ! -f $backup/server.env ]] || cp -a "$backup/server.env" /etc/db2/server.env
    if [[ -f $backup/db2.service ]]; then
     cp -a "$backup/db2.service" /etc/systemd/system/db2.service
    else
     systemctl disable db2 || true
     rm -f /etc/systemd/system/db2.service
    fi
    systemctl daemon-reload
   fi
  fi
  if ((old_active)); then systemctl start db2 || true; fi
 fi
 rm -rf "$work"
}
trap finish EXIT
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl tar xz-utils python3 python3-venv
python3 -c 'import sys; assert sys.version_info >= (3,10), "Python 3.10+ required"'
install -d -m 755 "$BASE" "$BASE/releases"
# Use supported Node 22 with upstream checksum, without replacing system Node.
nodebin=$(command -v node || true)
if [[ -n $nodebin ]]; then nodebin=$(readlink -f "$nodebin"); fi
# The service cannot read login-shell nvm installs under ProtectHome=true.
case "$nodebin" in /root/*|/home/*|/run/user/*) nodebin=;; esac
if [[ -z $nodebin ]] || ! "$nodebin" -e 'process.exit(Number(process.versions.node.split(".")[0])>=22?0:1)'; then
 case $(uname -m) in x86_64) arch=x64;; aarch64|arm64) arch=arm64;; *) echo 'Unsupported CPU'; exit 1;; esac
 curl --fail --location --retry 3 https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt -o "$work/node-shas"
 nodefile=$(awk -v arch="$arch" '$2 ~ ("-linux-" arch "\\.tar\\.xz$") {print $2}' "$work/node-shas")
 [[ $nodefile =~ ^node-v22\.[0-9]+\.[0-9]+-linux-(x64|arm64)\.tar\.xz$ ]] || exit 1
 curl --fail --location --retry 3 "https://nodejs.org/dist/latest-v22.x/$nodefile" -o "$work/$nodefile"
 (cd "$work"; awk -v f="$nodefile" '$2==f' node-shas | sha256sum -c -)
 mkdir "$work/node"; tar -xJf "$work/$nodefile" --strip-components=1 -C "$work/node"
 install -d -m 755 "$BASE/node"; cp -a "$work/node/." "$BASE/node/"
 nodebin=$BASE/node/bin/node
fi
# cp -a preserves the mode of the source directory itself. Under umask 077,
# the extraction root is 0700: repair both new and previously installed trees.
if [[ -d $BASE/node ]]; then chmod -R a+rX "$BASE/node"; fi
if [[ $NETWORK == loopback ]]; then
 bind=127.0.0.1
else
# Official Tailscale installer; reuse an existing installation/login.
if ! command -v tailscale >/dev/null; then
 curl --fail --location --retry 3 https://tailscale.com/install.sh -o "$work/tailscale-install.sh"
 sh "$work/tailscale-install.sh"
fi
systemctl enable --now tailscaled
if ! tailscale ip -4 >"$work/tail-ip" 2>/dev/null || ! grep -Eq '^100\.' "$work/tail-ip"; then
 echo 'Open the Tailscale login URL below on your phone. Keep this terminal open.'
 tailscale up --timeout=10m
 tailscale ip -4 >"$work/tail-ip"
fi
bind=$(head -n 1 "$work/tail-ip")
python3 - "$bind" <<'PY'
import ipaddress,sys
assert ipaddress.ip_address(sys.argv[1]) in ipaddress.ip_network('100.64.0.0/10')
PY
fi
# Extract only runtime files; do not install APK/IPA archives or old player data.
curl --fail --location --retry 3 "https://codeload.github.com/j1dreamer/db2-private/tar.gz/$REF" -o "$work/source.tar.gz"
mkdir "$work/app"
tar -xzf "$work/source.tar.gz" --strip-components=1 -C "$work/app" \
 "db2-private-$REF/server" "db2-private-$REF/web" "db2-private-$REF/tables" \
 "db2-private-$REF/client" "db2-private-$REF/analysis/route-coverage.json" \
 "db2-private-$REF/deploy" "db2-private-$REF/requirements.txt" "db2-private-$REF/tools/public_proxy.py"
id db2 >/dev/null 2>&1 || useradd --system --home-dir /var/lib/db2 --shell /usr/sbin/nologin db2
# Probe as the service account, not root, before stopping an existing server.
if ! runuser -u db2 -- "$nodebin" -e 'process.exit(Number(process.versions.node.split(".")[0])>=22?0:1)'; then
 echo "Node runtime is not usable by db2: $nodebin. Existing deployment was left untouched." >&2
 exit 1
fi
install -d -m 700 -o db2 -g db2 /var/lib/db2
install -d -m 700 /etc/db2 "$BASE/backups"
# Refuse an unrelated existing listener instead of stopping it.
if ! systemctl is-active --quiet db2; then
 python3 - "$bind" <<'PY'
import socket,sys
with socket.socket() as s:
 try:s.bind((sys.argv[1],20003))
 except OSError:raise SystemExit('Port 20003 is occupied; existing service was left untouched.')
PY
fi
# Prepare dependencies before interrupting a previous deployment.
new="$BASE/releases/$REF-$(date +%s)"
mkdir "$new"; cp -a "$work/app/." "$new/"
python3 -m venv "$new/.venv"
"$new/.venv/bin/pip" install -r "$new/requirements.txt"
chmod -R a+rX "$new"
previous=$(readlink -f "$BASE/app" 2>/dev/null || true)
if [[ -e $BASE/app && ! -L $BASE/app ]]; then echo '/opt/db2/app exists and is not a managed link; stopped safely.'; exit 1; fi
if systemctl is-active --quiet db2; then old_active=1; systemctl stop db2; fi
backup="$BASE/backups/$(date +%Y%m%d-%H%M%S)"
mkdir "$backup"
cp -a /var/lib/db2 "$backup/data"
[[ ! -f /etc/db2/server.env ]] || cp -a /etc/db2/server.env "$backup/server.env"
[[ ! -f /etc/systemd/system/db2.service ]] || cp -a /etc/systemd/system/db2.service "$backup/db2.service"
ln -sfn "$new" "$BASE/app"
switched=1
printf 'DB2_BIND=%s\nDB2_NODE=%s\nDB2_ADMIN_NETWORKS=127.0.0.0/8,::1/128,100.64.0.0/10\nPATH=%s:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n' "$bind" "$nodebin" "$(dirname "$nodebin")" >/etc/db2/server.env
sed 's@/opt/db2/venv/bin/python@/opt/db2/app/.venv/bin/python@' "$new/deploy/db2.service" >/etc/systemd/system/db2.service
systemctl daemon-reload
systemctl enable --now db2
healthy=0
for attempt in {1..30}; do
 if curl --fail --silent --max-time 3 "http://$bind:20003/health" -o "$work/health.json"; then healthy=1; break; fi
 sleep 1
done
if (( ! healthy )); then journalctl -u db2 -n 40 --no-pager; exit 1; fi
python3 - "$work/health.json" <<'PY'
import json,sys
h=json.load(open(sys.argv[1]));assert h.get('status')=='ok' and h.get('build')=='eng-sp-sss-sp-schedule-v10' and h.get('profile_schema')==30 and h.get('combat',{}).get('available'),h
print(json.dumps(h,ensure_ascii=False,indent=2))
PY
switched=0
if [[ $NETWORK == loopback ]]; then
 echo 'Backend ready on 127.0.0.1:20003; configure the HTTPS proxy before remote play.'
else
printf '\nDONE. APK/IPA server: http://%s:20003\nWeb admin: http://%s:20003/admin\n' "$bind" "$bind"
echo 'Enable Tailscale on the phone in the same tailnet. ACL must allow TCP 20003.'
fi
echo 'Read admin token privately: sudo cat /var/lib/db2/admin-token'
echo 'Status: sudo systemctl status db2 --no-pager'
echo 'Logs: sudo journalctl -u db2 -n 80 --no-pager'
printf 'Backup: %s\n' "$backup"
