#!/bin/bash
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v python3 >/dev/null 2>&1; then
    echo "Install Python 3.10+ first. See IPA-INSTALL.md."
    read -r -p "Press Return to close..." _db2_close
    exit 1
fi
python3 -u ./Download-Clients.py --only ipa "$@"
db2_result=$?
if [ "$db2_result" -eq 0 ]; then
    echo "IPA downloaded and verified. Sign it before installing; see IPA-INSTALL.md."
fi
read -r -p "Press Return to close..." _db2_close
exit "$db2_result"
