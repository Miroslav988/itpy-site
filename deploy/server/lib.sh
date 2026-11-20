# Shared by install.sh and update.sh.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ITPY_HOME="${ITPY_HOME:-$HOME/itpy}"
ENV_FILE="$ITPY_HOME/site.env"
APP="$ITPY_HOME/app"
SERVICE=itpy-site

# Node.js from nodejs.org, pinned and checked against its published checksum (SHASUMS256.txt):
# Ubuntu's own package is older than the site needs. 24 is an LTS line, supported until April 2028.
NODE_VERSION=24.22.3
NODE_SHA256_X64=4f2b175a6d53a5c617a80dba2676238a0688cef28c6da4eba35c7d844e66fcfb
NODE_SHA256_ARM64=6e51a2ada00f0011cc266f65d98922b403d7ad88f809ca2aa615a5fe1ce6e86c
NODE_DIR="$ITPY_HOME/node"
export PATH="$NODE_DIR/bin:$PATH"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[31mОшибка: %s\033[0m\n' "$*" >&2; exit 1; }

load_env() {
  [ -f "$ENV_FILE" ] || die "нет $ENV_FILE — сначала запустите deploy/server/install.sh"
  set -a
  . "$ENV_FILE"
  set +a
}

install_node() {
  local arch sum name tmp
  case "$(uname -m)" in
    x86_64) arch=x64; sum=$NODE_SHA256_X64 ;;
    aarch64) arch=arm64; sum=$NODE_SHA256_ARM64 ;;
    *) die "нет сборки Node.js для $(uname -m)" ;;
  esac
  if [ -x "$NODE_DIR/bin/node" ] && [ "$("$NODE_DIR/bin/node" -v)" = "v$NODE_VERSION" ]; then return; fi
  say "Node.js $NODE_VERSION"
  name="node-v$NODE_VERSION-linux-$arch"
  tmp="$(mktemp -d)"
  curl -fsSL -o "$tmp/$name.tar.xz" "https://nodejs.org/dist/v$NODE_VERSION/$name.tar.xz"
  echo "$sum  $tmp/$name.tar.xz" | sha256sum -c --quiet || die "контрольная сумма Node.js не совпала"
  rm -rf "$NODE_DIR.new"
  mkdir -p "$NODE_DIR.new"
  tar -xJf "$tmp/$name.tar.xz" -C "$NODE_DIR.new" --strip-components=1
  rm -rf "$NODE_DIR" "$tmp"
  mv "$NODE_DIR.new" "$NODE_DIR"
}

# Builds the site and swaps it into ~/itpy/app; the previous build is kept until the new one answers.
build_and_release() {
  load_env
  install_node
  cd "$REPO"
  # Before the build: the prerendered pages (home, sitemap) read the posts from here.
  say "Данные блога: $BLOG_DIR"
  mkdir -p "$BLOG_DIR"
  # Adds what the live folder lacks (the first time: everything); never overwrites newer posts.
  rsync -a --ignore-existing "$REPO/content/blog/" "$BLOG_DIR/"

  say "Зависимости"
  npm ci --no-audit --no-fund
  say "Сборка"
  npm run build

  say "Выкладка в $APP"
  rm -rf "$APP.new"
  cp -a "$REPO/.next/standalone" "$APP.new"
  # rsync merges: the standalone build may already have some of these folders (public/media).
  rsync -a "$REPO/.next/static/" "$APP.new/.next/static/"
  rsync -a "$REPO/public/" "$APP.new/public/"
  rm -rf "$APP.old"
  if [ -d "$APP" ]; then mv "$APP" "$APP.old"; fi
  mv "$APP.new" "$APP"
}

restart_site() {
  sudo systemctl restart "$SERVICE"
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
    die "новая сборка не запустилась (journalctl -u $SERVICE), вернул предыдущую; неудачная лежит в $APP.failed"
  else
    die "сайт не отвечает, смотрите journalctl -u $SERVICE"
  fi
}
