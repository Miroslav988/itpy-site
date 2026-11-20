#!/bin/bash
# Run on Ilia's Mac. Keeps a reverse SSH tunnel to the site's server open, so the blog there reads
# Telegram through this Mac's VPN client (deploy/tunnel/README.md). Nothing to install: macOS has
# ssh and launchd. Written for the old bash 3.2 of macOS.
#   bash mac.sh <server address> <VPN client's HTTP proxy port>
set -euo pipefail

SERVER="${1:-}"
PORT="${2:-}"
if [ -z "$SERVER" ] || [ -z "$PORT" ]; then
  echo "Запуск: bash mac.sh <адрес сервера> <порт HTTP-прокси VPN-клиента>"
  exit 1
fi
KEY="$HOME/.ssh/itpy_tunnel"
LABEL=online.itpy.tg-tunnel
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/itpy-tg-tunnel.log"

# The VPN client's proxy has to reach Telegram before anything else.
code="$(curl -s --max-time 15 -x "http://127.0.0.1:$PORT" -o /dev/null -w '%{http_code}' https://t.me/s/informatika_kege_itpy || true)"
if [ "$code" != 200 ]; then
  echo "Через 127.0.0.1:$PORT Telegram не открывается (ответ: ${code:-нет}). Проверьте, что VPN включён и порт верный."
  exit 1
fi
echo "Прокси 127.0.0.1:$PORT открывает Telegram."

mkdir -p "$HOME/.ssh" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
chmod 700 "$HOME/.ssh"
[ -f "$KEY" ] || ssh-keygen -q -t ed25519 -N "" -C "itpy-tg-tunnel" -f "$KEY"

# ssh brings 127.0.0.1:10809 on the server to the proxy here. It quits when the connection hangs
# (no answer for ~90 seconds) or the port is taken; launchd then starts it again.
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/ssh</string><string>-N</string>
    <string>-i</string><string>$KEY</string>
    <string>-o</string><string>IdentitiesOnly=yes</string>
    <string>-o</string><string>BatchMode=yes</string>
    <string>-o</string><string>StrictHostKeyChecking=accept-new</string>
    <string>-o</string><string>ExitOnForwardFailure=yes</string>
    <string>-o</string><string>ServerAliveInterval=30</string>
    <string>-o</string><string>ServerAliveCountMax=3</string>
    <string>-R</string><string>127.0.0.1:10809:127.0.0.1:$PORT</string>
    <string>tgtunnel@$SERVER</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>30</integer>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo
echo "Туннель запущен и будет подниматься сам после входа в систему."
echo "Этот ключ нужно положить на сервер в ~/itpy/tunnel.pub и запустить install.sh:"
echo
cat "$KEY.pub"
echo
echo "Лог туннеля: $LOG"
