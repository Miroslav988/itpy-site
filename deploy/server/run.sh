#!/bin/bash
# Started by systemd (/etc/systemd/system/itpy-site.service): loads the settings and runs the
# built site from ~/itpy/app. systemd restarts it if it stops.
set -euo pipefail
ITPY_HOME="${ITPY_HOME:-$HOME/itpy}"
set -a
. "$ITPY_HOME/site.env"
set +a
export NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
cd "$ITPY_HOME/app"
exec "${NODE_BIN:-node}" server.js
