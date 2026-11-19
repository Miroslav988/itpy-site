#!/bin/bash
# First setup of the site on the Mac (deploy/mac/README.md). Run again at any time: every step
# checks what is already in place. Run as the Mac's user, not with sudo; it asks for the
# password when a step needs it.
#   ~/itpy/site/deploy/mac/install.sh
. "$(dirname "$0")/lib.sh"

[ "$(uname)" = Darwin ] || die "этот скрипт для macOS"
[ "$(id -u)" -ne 0 ] || die "запускайте без sudo: пароль спросят, когда понадобится"
case "$REPO" in
  "$HOME/Desktop"*|"$HOME/Documents"*|"$HOME/Downloads"*)
    die "репозиторий лежит в $REPO: macOS не даёт службам читать Рабочий стол, Документы и Загрузки, клонируйте в ~/itpy/site" ;;
esac

say "Настройки: $ENV_FILE"
mkdir -p "$ITPY_HOME" "$LOGS"
if [ ! -f "$ENV_FILE" ]; then
  cp "$REPO/deploy/mac/site.env.example" "$ENV_FILE"
  die "создан $ENV_FILE — заполните его (домен, почта для сертификата, прокси VPN) и запустите install.sh ещё раз"
fi
load_env
[ -n "${DOMAIN:-}" ] || die "в $ENV_FILE не указан DOMAIN"
[ -n "${CERT_EMAIL:-}" ] || die "в $ENV_FILE не указан CERT_EMAIL"

say "Программы"
command -v brew >/dev/null || die "нужен Homebrew: https://brew.sh"
BREW="$(brew --prefix)"
NODE="$(node_bin)"
for formula in nginx certbot; do
  brew list "$formula" >/dev/null 2>&1 || brew install "$formula"
done
echo "node $("$NODE" -v), $("$BREW/bin/nginx" -v 2>&1), $("$BREW/bin/certbot" --version 2>&1)"

build_and_release

say "Служба сайта (запуск при включении Mac, перезапуск при сбое)"
PLIST="/Library/LaunchDaemons/$SERVICE.plist"
sudo tee "$PLIST" >/dev/null <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$SERVICE</string>
  <key>UserName</key><string>$(id -un)</string>
  <key>ProgramArguments</key>
  <array><string>/bin/bash</string><string>$REPO/deploy/mac/run.sh</string></array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key><string>$HOME</string>
    <key>ITPY_HOME</key><string>$ITPY_HOME</string>
    <key>NODE_BIN</key><string>$NODE</string>
    <key>PATH</key><string>$(dirname "$NODE"):/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>$LOGS/site.log</string>
  <key>StandardErrorPath</key><string>$LOGS/site.log</string>
</dict>
</plist>
PLIST
sudo launchctl bootout "system/$SERVICE" 2>/dev/null || true
sudo launchctl bootstrap system "$PLIST"
site_answers || die "сайт не отвечает на 127.0.0.1:${PORT:-3000}, смотрите $LOGS/site.log"
rm -rf "$APP.old"
echo "Сайт работает на 127.0.0.1:${PORT:-3000}"

say "nginx"
ACME="$BREW/var/www/itpy-acme"
CERTS="/etc/letsencrypt/live/$DOMAIN"
CONF="$BREW/etc/nginx/servers/itpy.conf"
mkdir -p "$ACME" "$(dirname "$CONF")"
# nginx runs as root (ports 80 and 443) under its own launchd service rather than
# «sudo brew services», which leaves root-owned files in Homebrew's folders.
brew services stop nginx >/dev/null 2>&1 || true
NGINX_PLIST="/Library/LaunchDaemons/online.itpy.nginx.plist"
start_nginx() {
  if [ ! -f "$NGINX_PLIST" ]; then
    sudo tee "$NGINX_PLIST" >/dev/null <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>online.itpy.nginx</string>
  <key>ProgramArguments</key>
  <array><string>$BREW/bin/nginx</string><string>-g</string><string>daemon off;</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$LOGS/nginx.log</string>
  <key>StandardErrorPath</key><string>$LOGS/nginx.log</string>
</dict>
</plist>
PLIST
    sudo launchctl bootstrap system "$NGINX_PLIST"
  else
    sudo launchctl kickstart -k system/online.itpy.nginx
  fi
}

write_full_config() {
  sed -e "s|__DOMAIN__|$DOMAIN|g" -e "s|__ACME__|$ACME|g" -e "s|__CERTS__|$CERTS|g" \
    -e "s|127.0.0.1:3000|127.0.0.1:${PORT:-3000}|" "$REPO/deploy/mac/nginx-itpy.conf" > "$CONF"
}

if sudo test -f "$CERTS/fullchain.pem"; then
  write_full_config
else
  # No certificate yet: plain HTTP first, so Let's Encrypt can check the domain.
  cat > "$CONF" <<NGINX
server {
  listen 80;
  server_name $DOMAIN www.$DOMAIN;
  location /.well-known/acme-challenge/ { root $ACME; }
  location / { proxy_pass http://127.0.0.1:${PORT:-3000}; proxy_set_header Host \$host; }
}
NGINX
fi
sudo "$BREW/bin/nginx" -t
start_nginx

if ! sudo test -f "$CERTS/fullchain.pem"; then
  say "Сертификат Let's Encrypt для $DOMAIN и www.$DOMAIN"
  sudo "$BREW/bin/certbot" certonly --webroot -w "$ACME" -d "$DOMAIN" -d "www.$DOMAIN" \
    -m "$CERT_EMAIL" --agree-tos --no-eff-email --non-interactive \
    || die "сертификат не выдан. Проверьте, что A-записи $DOMAIN и www ведут на внешний IP этой сети, а роутер пробрасывает порты 80 и 443 на этот Mac. Сайт пока доступен по http://$DOMAIN"
  write_full_config
  sudo "$BREW/bin/nginx" -t
  sudo "$BREW/bin/nginx" -s reload
fi

say "Продление сертификата (каждый день в 04:17)"
RENEW="/Library/LaunchDaemons/online.itpy.certbot.plist"
sudo tee "$RENEW" >/dev/null <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>online.itpy.certbot</string>
  <key>ProgramArguments</key>
  <array>
    <string>$BREW/bin/certbot</string><string>renew</string><string>--quiet</string>
    <string>--deploy-hook</string><string>$BREW/bin/nginx -s reload</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>$BREW/bin:/usr/bin:/bin:/usr/sbin:/sbin</string></dict>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>4</integer><key>Minute</key><integer>17</integer></dict>
  <key>StandardOutPath</key><string>$LOGS/certbot.log</string>
  <key>StandardErrorPath</key><string>$LOGS/certbot.log</string>
</dict>
</plist>
PLIST
sudo launchctl bootout system/online.itpy.certbot 2>/dev/null || true
sudo launchctl bootstrap system "$RENEW"

say "Mac не засыпает и включается сам после отключения света"
sudo pmset -a sleep 0 disksleep 0 womp 1
sudo pmset -a autorestart 1 2>/dev/null || echo "autorestart эта модель не поддерживает"

say "Готово"
cat <<DONE
  Сайт:        https://$DOMAIN
  Логи:        $LOGS/site.log (там же видно синхронизацию блога)
  Обновление:  $REPO/deploy/mac/update.sh
  Проверка:    curl -I https://$DOMAIN
DONE
