#!/bin/sh
set -eu
cd -- "$(dirname -- "$0")"
if [ ! -e "DB2-Private-Android-dev.apk" ]; then
  cat parts/part-*.bin > "DB2-Private-Android-dev.apk"
fi
if command -v sha256sum >/dev/null 2>&1; then sha256sum -c SHA256SUMS.txt; else shasum -a 256 -c SHA256SUMS.txt; fi
