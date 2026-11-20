#!/bin/bash
# Updates the site on the server: pulls the code, builds it and restarts the service. If the new
# build does not start, the previous one comes back.
#   ~/itpy/site/deploy/server/update.sh
. "$(dirname "$0")/lib.sh"

say "Код из git"
cd "$REPO"
git pull --ff-only

build_and_release
release_or_roll_back
