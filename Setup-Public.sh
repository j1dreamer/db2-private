#!/usr/bin/env bash
# HTTPS game + HTTPS admin, backed by a loopback-only game service.
set -Eeuo pipefail
umask 077
if (( EUID != 0 )); then exec sudo bash "$0" "$@"; fi
[[ $# == 1 || $# == 2 ]] || { echo 'Usage: sudo bash Setup-Public.sh db2.example.com [admin.example.com]'; exit 1; }
GAME=$1
ADMIN=${2:-$GAME}
# Validate before apt/systemd changes. Reject shell/Caddyfile injection.
python3 - "$GAME" "$ADMIN" <<'PY'
import re,sys,ipaddress
for host in sys.argv[1:]:
 if '.'not in host or len(host)>253 or not all(re.fullmatch(r'[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?',p)for p in host.split('.')):raise SystemExit('Use DNS hostnames only; no URL, port, wildcard or path.')
 try:ipaddress.ip_address(host)
 except ValueError:continue
 raise SystemExit('A DNS name is required for this public HTTPS configuration.')
PY
[[ -d /run/systemd/system ]] || { echo 'Run on the Ubuntu VPS, not iSH locally.'; exit 1; }
# A managed Caddy config is added via import. Do not overwrite an existing web stack.
if [[ -f /etc/caddy/Caddyfile ]] && ! grep -q '^# DB2 managed entrypoint$' /etc/caddy/Caddyfile; then
 # The distro default is safe to replace only if no real sites are configured.
 if ! grep -q 'Welcome to Caddy' /etc/caddy/Caddyfile; then
  echo 'Existing Caddyfile detected. Review/merge the DB2 proxy config first; no site was replaced.'; exit 1
 fi
fi
if ! command -v caddy >/dev/null; then
 if ss -lnt | awk 'NR>1{print $4}' | grep -Eq '(^|:)(80|443)$'; then echo 'Ports 80/443 already in use. Existing web server was left untouched.'; exit 1; fi
fi
work=$(mktemp -d /tmp/db2-public.XXXXXX)
trap 'rm -rf "$work"' EXIT
# Filled with an immutable reviewed installer ref at release time.
REF=faaa2325baf4ad07491dceda466faa3450a2e3b5
curl --fail --location --retry 3 "https://raw.githubusercontent.com/j1dreamer/db2-private/$REF/Setup-Ubuntu.sh" -o "$work/setup.sh"
bash "$work/setup.sh" --loopback
export DEBIAN_FRONTEND=noninteractive
apt-get update
# Caddy official stable repository: minimal Ubuntu mirrors may omit Caddy.
# Download first, then install explicit readable modes despite umask 077.
# https://caddyserver.com/docs/install#debian-ubuntu-raspbian
if ! command -v caddy >/dev/null; then
 apt-get install -y ca-certificates curl gnupg debian-keyring debian-archive-keyring apt-transport-https
 curl --fail --location --retry 3 https://dl.cloudsmith.io/public/caddy/stable/gpg.key -o "$work/caddy.key"
 gpg --batch --yes --dearmor -o "$work/caddy-keyring.gpg" "$work/caddy.key"
 curl --fail --location --retry 3 https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt -o "$work/caddy-stable.list"
 install -d -m 755 /usr/share/keyrings /etc/apt/sources.list.d
 install -m 644 "$work/caddy-keyring.gpg" /usr/share/keyrings/caddy-stable-archive-keyring.gpg
 install -m 644 "$work/caddy-stable.list" /etc/apt/sources.list.d/caddy-stable.list
 apt-get update
fi
apt-get install -y caddy apache2-utils
install -d -m 700 /etc/db2
if [[ ! -f /etc/db2/public-admin-login.json ]]; then
 python3 - <<'PY'
import json,secrets,os
p='/etc/db2/public-admin-login.json'
fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w')as f:json.dump({'username':'db2admin','password':secrets.token_urlsafe(32)},f)
PY
fi
install -d -m 755 /etc/caddy
if [[ -f /etc/caddy/Caddyfile ]]; then cp -a /etc/caddy/Caddyfile "/etc/db2/Caddyfile.backup-$(date +%Y%m%d-%H%M%S)"; fi
# This helper is part of the runtime source installed by the reviewed installer.
/opt/db2/app/.venv/bin/python - "$GAME" "$ADMIN" "$work/db2.caddy" <<'PY'
import json,subprocess,sys
sys.path.insert(0,'/opt/db2/app')
from tools.public_proxy import caddyfile
secret=json.load(open('/etc/db2/public-admin-login.json'))
# Password goes via stdin, never argv or console output.
p=subprocess.run(['htpasswd','-niBC','10',secret['username']],input=secret['password']+'\n',text=True,capture_output=True,check=True)
hash=p.stdout.strip().split(':',1)[1]
version=subprocess.check_output(['caddy','version'],text=True).split()[0].lstrip('v').split('.')
legacy=tuple(map(int,version[:2]))<(2,8)
open(sys.argv[3],'w').write(caddyfile(sys.argv[1],sys.argv[2],secret['username'],hash,legacy=legacy))
PY
caddy validate --config "$work/db2.caddy" --adapter caddyfile
install -m 640 -o root -g caddy "$work/db2.caddy" /etc/caddy/db2.caddy
printf '# DB2 managed entrypoint\nimport /etc/caddy/db2.caddy\n' >/etc/caddy/Caddyfile
chmod 644 /etc/caddy/Caddyfile
# Trust the private header for throttling only; it never grants admin rights.
if ! grep -q '^DB2_TRUST_LOCAL_PROXY=' /etc/db2/server.env; then echo 'DB2_TRUST_LOCAL_PROXY=1' >>/etc/db2/server.env; fi
systemctl restart db2
systemctl enable --now caddy
systemctl reload caddy
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then ufw allow 80/tcp; ufw allow 443/tcp; fi
printf '\nGame: https://%s\nAdmin: https://%s/admin\n' "$GAME" "$ADMIN"
echo 'Login credentials: sudo cat /etc/db2/public-admin-login.json'
echo 'App admin token (second check): sudo cat /var/lib/db2/admin-token'
echo 'DNS A/AAAA must point to this VPS; provider firewall must allow TCP 80/443.'
echo 'Wait for a valid public certificate before signing in. Do not bypass certificate errors.'
echo 'Check TLS: curl --fail https://YOUR_GAME_HOST/health'
echo 'Caddy logs: sudo journalctl -u caddy -n 60 --no-pager'

ready=0
for attempt in {1..12}; do
 if curl --fail --silent --max-time 5 "https://$GAME/health" -o "$work/health.json"; then ready=1; break; fi
 sleep 5
done
if (( ! ready )); then echo 'HTTPS is not verified yet. Check DNS/80/443 and Caddy logs; do not sign in over HTTP.'; exit 1; fi
python3 - "$work/health.json" <<'PY'
import json,sys
h=json.load(open(sys.argv[1]));assert h.get('combat',{}).get('available'),h
PY
status=$(curl --silent --show-error --max-time 10 -o /dev/null -w '%{http_code}' "https://$ADMIN/admin")
[[ $status == 401 ]] || { echo 'Admin edge authentication check failed; inspect Caddy config.'; exit 1; }
echo 'HTTPS game and admin edge authentication verified. Backend stays on loopback.'
