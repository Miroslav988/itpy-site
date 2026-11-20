# Telegram для блога через Mac Ильи

Из российского дата-центра `t.me` может быть закрыт. Тогда блог на сервере читает канал через VPN на
Mac Ильи: Mac сам открывает к серверу обратный SSH-туннель, и HTTP-прокси его VPN-клиента появляется
на сервере по адресу `127.0.0.1:10809`.

- На Mac работает только встроенный `ssh` в виде фоновой службы. Node.js и Homebrew не нужны.
- На сервере у туннеля свой пользователь `tgtunnel`: без командной строки, ключ разрешает только этот
  проброс и только на `127.0.0.1`. Из интернета прокси не виден.
- Если Mac выключен или спит, не обновляется только блог: сайт пробует снова каждый час. Сам сайт от Mac
  не зависит.

Сначала проверьте на сервере, нужен ли туннель вообще:
`curl -s -o /dev/null -w '%{http_code}\n' https://t.me/s/informatika_kege_itpy`. Если `200`, туннель не
нужен, `TELEGRAM_PROXY` оставьте пустым.

## Настройка

1. **Порт прокси VPN-клиента на Mac.** VPN включён, в Терминале:
   ```bash
   for p in 10809 10808 7890 7897 12334 2080 1080; do printf "порт $p: "; curl -s --max-time 5 -x http://127.0.0.1:$p -o /dev/null -w '%{http_code}\n' https://t.me/s/informatika_kege_itpy; done
   ```
   Нужен порт с ответом `200`. Если такого нет, найдите в настройках клиента «HTTP-прокси» или «mixed port».
2. **Туннель на Mac.**
   ```bash
   curl -fsSLo ~/itpy-tunnel.sh https://raw.githubusercontent.com/Miroslav988/itpy-site/redesign-blank-ege/deploy/tunnel/mac.sh
   bash ~/itpy-tunnel.sh <адрес сервера> <порт из шага 1>
   ```
   Скрипт проверит прокси, создаст ключ `~/.ssh/itpy_tunnel`, поставит службу и покажет открытый ключ.
3. **Ключ на сервере.** Открытый ключ из шага 2 сохраните на сервере в `~/itpy/tunnel.pub`, затем
   `~/itpy/site/deploy/server/install.sh`. В `~/itpy/site.env` укажите
   `TELEGRAM_PROXY=http://127.0.0.1:10809` и перезапустите сайт: `sudo systemctl restart itpy-site`.
4. **Проверка на сервере.**
   ```bash
   curl -s -x http://127.0.0.1:10809 -o /dev/null -w '%{http_code}\n' https://t.me/s/informatika_kege_itpy
   ```
   Должно быть `200`.

На Mac должен быть включён автоматический вход: служба туннеля и VPN-клиент работают после входа в
учётную запись.

## Если блог не обновляется

- На сервере: `journalctl -u itpy-site | grep "blog sync"`. `ECONNREFUSED` значит, что туннеля сейчас нет.
- На Mac: `tail ~/Library/Logs/itpy-tg-tunnel.log` и
  `launchctl print gui/$(id -u)/online.itpy.tg-tunnel | grep state`.
- Сменился порт VPN-клиента: снова `bash ~/itpy-tunnel.sh <адрес сервера> <новый порт>`.
- Убрать туннель с Mac: `launchctl bootout gui/$(id -u)/online.itpy.tg-tunnel` и удалить
  `~/Library/LaunchAgents/online.itpy.tg-tunnel.plist`.
