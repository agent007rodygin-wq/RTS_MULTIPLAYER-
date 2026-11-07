#!/usr/bin/env bash
set -u

URL_FILE="/tmp/basingse_public_url.txt"
DESKTOP_URL_FILE="/home/uro/Рабочий стол/ССЫЛКА_ДЛЯ_ДРУЗЕЙ.txt"
LOG_FILE="/tmp/basingse_ngrok.log"
BIN="/home/uro/.local/bin/ngrok"

rm -f "$URL_FILE" "$LOG_FILE"

# Останавливаем конкурирующий cloudflared и старые процессы ngrok
pkill -f "cloudflared tunnel" 2>/dev/null || true
pkill -9 -f "ngrok http" 2>/dev/null || true
sleep 1

# Запуск ngrok для порта 3000
"$BIN" http 3000 --log=stdout > "$LOG_FILE" 2>&1 &
NGROK_PID=$!

trap 'kill -9 $NGROK_PID 2>/dev/null; exit 0' SIGTERM SIGINT

# Поиск ссылки в API ngrok (до 30 секунд)
FOUND_URL=""
for i in $(seq 1 30); do
  if ! kill -0 "$NGROK_PID" 2>/dev/null; then
    echo "[Ngrok Tunnel] Ошибка: процесс ngrok неожиданно завершился!"
    cat "$LOG_FILE" 2>/dev/null
    exit 1
  fi

  if curl -s http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
    FOUND_URL=$(python3 -c "import urllib.request, json; data=json.loads(urllib.request.urlopen('http://127.0.0.1:4040/api/tunnels').read()); print(data['tunnels'][0]['public_url'])" 2>/dev/null || true)
    if [ -n "$FOUND_URL" ]; then
      echo "$FOUND_URL" > "$URL_FILE"

      # Запись на Рабочий стол
      cat <<EOF > "$DESKTOP_URL_FILE"
======================================================================
       🏰 BASINGSE MMORPG — ССЫЛКА ДЛЯ ДРУЗЕЙ В ИНТЕРНЕТЕ 🏰
======================================================================

Скопируй эту ссылку и отправь игрокам (в Telegram, Discord, VK и т.д.):

👉  $FOUND_URL

----------------------------------------------------------------------
ℹ️  Туннель: Ngrok (работает в Украине и России без VPN).
ℹ️  При первом входе браузер покажет кнопку «Visit Site» —
    игрокам нужно просто нажать её один раз для подтверждения.
    
⏰ Ссылка обновлена: $(date '+%d.%m.%Y в %H:%M:%S')
======================================================================
EOF
      chmod 664 "$DESKTOP_URL_FILE" 2>/dev/null || true

      echo "[Ngrok Tunnel] Готово! Ссылка: $FOUND_URL"

      # Всплывающее системное уведомление на Рабочем столе
      if command -v notify-send >/dev/null 2>&1; then
        notify-send -u normal -i applications-games "🏰 BaSingSe MMORPG Сервер (Ngrok) запущен!" "Ссылка для игроков:\n$FOUND_URL\n\nФайл сохранён на Рабочем столе." 2>/dev/null || true
      fi
      break
    fi
  fi
  sleep 1
done

wait $NGROK_PID
