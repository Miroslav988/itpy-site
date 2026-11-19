# Shared by install.sh and update.sh.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ITPY_HOME="${ITPY_HOME:-$HOME/itpy}"
ENV_FILE="$ITPY_HOME/site.env"
APP="$ITPY_HOME/app"
LOGS="$ITPY_HOME/logs"
SERVICE=online.itpy.site

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[31mОшибка: %s\033[0m\n' "$*" >&2; exit 1; }

load_env() {
  [ -f "$ENV_FILE" ] || die "нет $ENV_FILE — сначала запустите deploy/mac/install.sh"
  set -a
  . "$ENV_FILE"
  set +a
}

node_bin() {
  local node
  node="$(command -v node || true)"
  [ -n "$node" ] || die "не найден Node.js: brew install node@24 и добавьте его в PATH (brew info node@24)"
  # package.json: "node": ">=22.13.0"
  "$node" -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&b>=13)?0:1)' \
    || die "нужен Node.js 22.13 или новее, сейчас $("$node" -v)"
  echo "$node"
}

# Builds the site and swaps it into ~/itpy/app; the previous build is kept until the new one answers.
build_and_release() {
  load_env
  cd "$REPO"
  say "Зависимости"
  npm ci --no-audit --no-fund
  say "Сборка"
  npm run build

  say "Данные блога: $BLOG_DIR"
  mkdir -p "$BLOG_DIR"
  # Adds what the live folder lacks (the first time: everything); never overwrites newer posts.
  rsync -a --ignore-existing "$REPO/content/blog/" "$BLOG_DIR/"

  say "Выкладка в $APP"
  rm -rf "$APP.new"
  cp -R "$REPO/.next/standalone" "$APP.new"
  # rsync merges: the standalone build may already have some of these folders (public/media).
  rsync -a "$REPO/.next/static/" "$APP.new/.next/static/"
  rsync -a "$REPO/public/" "$APP.new/public/"
  rm -rf "$APP.old"
  if [ -d "$APP" ]; then mv "$APP" "$APP.old"; fi
  mv "$APP.new" "$APP"
}

restart_site() {
  sudo launchctl kickstart -k "system/$SERVICE"
}

# Waits up to 30 seconds for the site to answer on its local port.
site_answers() {
  local port="${PORT:-3000}"
  for _ in $(seq 30); do
    curl -fsS -o /dev/null "http://127.0.0.1:$port/" && return 0
    sleep 1
  done
  return 1
}

release_or_roll_back() {
  restart_site
  if site_answers; then
    rm -rf "$APP.old"
    say "Сайт отвечает на 127.0.0.1:${PORT:-3000}"
  elif [ -d "$APP.old" ]; then
    rm -rf "$APP.failed"
    mv "$APP" "$APP.failed"
    mv "$APP.old" "$APP"
    restart_site
    die "новая сборка не запустилась (лог: $LOGS/site.log), вернул предыдущую; неудачная лежит в $APP.failed"
  else
    die "сайт не отвечает, смотрите $LOGS/site.log"
  fi
}
