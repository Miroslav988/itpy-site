#!/bin/bash
# First setup of the site on an Ubuntu server (deploy/server/README.md). Run again at any time:
# every step checks what is already in place. Run as the server's user, not as root; it calls sudo
# where a step needs it.
#   ~/itpy/site/deploy/server/install.sh
. "$(dirname "$0")/lib.sh"

[ "$(id -u)" -ne 0 ] || die "запускайте под своим пользователем, а не root: sudo скрипт вызовет сам"
command -v apt-get >/dev/null || die "этот скрипт для Ubuntu"
command -v systemctl >/dev/null || die "нужен systemd"

say "Настройки: $ENV_FILE"
mkdir -p "$ITPY_HOME"
if [ ! -f "$ENV_FILE" ]; then
  cp "$REPO/deploy/server/site.env.example" "$ENV_FILE"
  die "создан $ENV_FILE — проверьте его (домен, почта для сертификата, прокси для Telegram) и запустите install.sh ещё раз"
fi
load_env
[ -n "${DOMAIN:-}" ] || die "в $ENV_FILE не указан DOMAIN"

say "Программы"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx certbot rsync curl xz-utils git ca-certificates dnsutils >/dev/null
install_node
echo "node $(node -v), $(nginx -v 2>&1), $(certbot --version 2>&1)"

build_and_release

say "Служба сайта (запуск при старте сервера, перезапуск при сбое)"
sudo tee "/etc/systemd/system/$SERVICE.service" >/dev/null <<UNIT
[Unit]
Description=ITPY site
After=network-online.target
Wants=network-online.target

[Service]
User=$(id -un)
Environment=HOME=$HOME ITPY_HOME=$ITPY_HOME NODE_BIN=$NODE_DIR/bin/node
ExecStart=/bin/bash $REPO/deploy/server/run.sh
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE" >/dev/null 2>&1
sudo systemctl restart "$SERVICE"
site_answers || die "сайт не отвечает на 127.0.0.1:${PORT:-3000}, смотрите journalctl -u $SERVICE"
rm -rf "$APP.old"
echo "Сайт работает на 127.0.0.1:${PORT:-3000}"

say "nginx"
ACME=/var/www/itpy-acme
CERTS="/etc/letsencrypt/live/$DOMAIN"
CONF=/etc/nginx/sites-available/itpy.conf
sudo mkdir -p "$ACME"
# Ubuntu's sample site also claims port 80 as the default one.
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf "$CONF" /etc/nginx/sites-enabled/itpy.conf

write_full_config() {
  sed -e "s|__DOMAIN__|$DOMAIN|g" -e "s|__ACME__|$ACME|g" -e "s|__CERTS__|$CERTS|g" \
    -e "s|127.0.0.1:3000|127.0.0.1:${PORT:-3000}|" "$REPO/deploy/server/nginx-itpy.conf" | sudo tee "$CONF" >/dev/null
}

if sudo test -f "$CERTS/fullchain.pem"; then
  write_full_config
else
  # No certificate yet: plain HTTP for any address, so the site can be checked by the server's IP
  # and Let's Encrypt can check the domain.
  sudo tee "$CONF" >/dev/null <<NGINX
server {
  listen 80 default_server;
  server_name _;
  client_max_body_size 1m;
  location /.well-known/acme-challenge/ { root $ACME; }
  location / {
    proxy_pass http://127.0.0.1:${PORT:-3000};
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP \$remote_addr;
  }
}
NGINX
fi
sudo nginx -t
sudo systemctl enable --now nginx >/dev/null 2>&1
sudo systemctl reload nginx

# The certificate needs the domain and www to lead to this server (A records in reg.ru). Until
# then the site works over plain HTTP, and install.sh run again later gets it.
domain_leads_here() {
  local here apex www
  here="$(curl -fsS --max-time 10 https://api.ipify.org 2>/dev/null \
    || curl -fsS --max-time 10 https://ipv4.icanhazip.com 2>/dev/null || true)"
  here="$(printf '%s' "$here" | tr -d '[:space:]')"
  apex="$(dig +short "$DOMAIN" A | tail -n 1)"
  www="$(dig +short "www.$DOMAIN" A | tail -n 1)"
  echo "Адрес сервера: ${here:-не определился}; $DOMAIN ведёт на: ${apex:-никуда}; www.$DOMAIN — на: ${www:-никуда}"
  [ -n "$here" ] && [ "$here" = "$apex" ] && [ "$here" = "$www" ]
}
HTTPS=yes
if ! sudo test -f "$CERTS/fullchain.pem"; then
  say "Сертификат Let's Encrypt для $DOMAIN и www.$DOMAIN"
  HTTPS=no
  if [ -z "${CERT_EMAIL:-}" ]; then
    echo "Пропускаю: в $ENV_FILE не указан CERT_EMAIL."
  elif ! domain_leads_here; then
    echo "Пропускаю: A-записи $DOMAIN и www в reg.ru должны вести на адрес этого сервера."
  elif ! sudo certbot certonly --webroot -w "$ACME" -d "$DOMAIN" -d "www.$DOMAIN" \
      -m "$CERT_EMAIL" --agree-tos --no-eff-email --non-interactive \
      --deploy-hook "systemctl reload nginx"; then
    echo "Let's Encrypt не смог проверить домен: проверьте, что порт 80 открыт в группе безопасности (лог: /var/log/letsencrypt/letsencrypt.log)."
  else
    write_full_config
    sudo nginx -t
    sudo systemctl reload nginx
    HTTPS=yes
  fi
  [ "$HTTPS" = yes ] || echo "Сайт пока работает по http. Когда домен будет готов, запустите install.sh ещё раз."
fi
# The certbot package renews certificates by itself (certbot.timer); the deploy hook above
# reloads nginx after each renewal.

# Telegram is reached through Ilia's Mac: it opens a reverse SSH tunnel to this server and brings
# its VPN client's HTTP proxy to 127.0.0.1:10809 here (deploy/tunnel/README.md). The tunnel has its
# own user that can do nothing else: no shell, and only that one forward on the loopback address.
TUNNEL_KEY="$ITPY_HOME/tunnel.pub"
if [ -f "$TUNNEL_KEY" ]; then
  say "Туннель для Telegram"
  id tgtunnel >/dev/null 2>&1 || sudo useradd --system --create-home --shell /usr/sbin/nologin tgtunnel
  sudo install -d -m 700 -o tgtunnel -g tgtunnel /home/tgtunnel/.ssh
  printf 'restrict,port-forwarding,permitlisten="127.0.0.1:10809",command="/bin/false" %s\n' "$(head -n 1 "$TUNNEL_KEY")" \
    | sudo tee /home/tgtunnel/.ssh/authorized_keys >/dev/null
  sudo chown tgtunnel:tgtunnel /home/tgtunnel/.ssh/authorized_keys
  sudo chmod 600 /home/tgtunnel/.ssh/authorized_keys
  # A dropped connection is noticed within ~90 seconds, so the Mac can open a new tunnel on the
  # same port instead of waiting for the old one to time out. "Match all" ends the block, so
  # nothing after this file applies to the tunnel user only.
  sudo tee /etc/ssh/sshd_config.d/itpy-tunnel.conf >/dev/null <<'SSHD'
Match User tgtunnel
  AllowTcpForwarding remote
  PermitListen 127.0.0.1:10809
  PermitTTY no
  X11Forwarding no
  ClientAliveInterval 30
  ClientAliveCountMax 3
Match all
SSHD
  sudo sshd -t || { sudo rm -f /etc/ssh/sshd_config.d/itpy-tunnel.conf; die "настройка SSH для туннеля не прошла проверку, убрал её"; }
  sudo systemctl reload ssh 2>/dev/null || sudo systemctl restart ssh
  echo "Ключ Mac добавлен. В $ENV_FILE: TELEGRAM_PROXY=http://127.0.0.1:10809"
fi

say "Готово"
if [ "$HTTPS" = yes ]; then
  echo "  Сайт:        https://$DOMAIN"
else
  echo "  Сайт:        http://<адрес сервера>; https://$DOMAIN — после сертификата (install.sh ещё раз)"
fi
cat <<DONE
  Логи сайта:  journalctl -u $SERVICE -f (там же синхронизация блога)
  Обновление:  $REPO/deploy/server/update.sh
DONE
