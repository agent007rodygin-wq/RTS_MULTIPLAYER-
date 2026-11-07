#!/usr/bin/env bash
set -u

URL_FILE="/tmp/basingse_public_url.txt"
DESKTOP_URL_FILE="/home/uro/Рабочий стол/ССЫЛКА_ДЛЯ_ДРУЗЕЙ.txt"
LOG_FILE="/tmp/basingse_tunnel.log"
BIN="/home/uro/.local/bin/cloudflared"

rm -f "$URL_FILE" "$LOG_FILE"

# Останавливаем любые конкурирующие туннели
pkill -9 -f "ngrok http" 2>/dev/null || true
pkill -9 -f "cloudflared tunnel" 2>/dev/null || true
sleep 1

# Запуск Cloudflare Tunnel для порта 3000
"$BIN" tunnel --no-autoupdate --url http://127.0.0.1:3000 > "$LOG_FILE" 2>&1 &
CF_PID=$!

trap 'kill $CF_PID 2>/dev/null; exit 0' SIGTERM SIGINT

# Поиск ссылки в выводе туннеля (до 40 секунд)
for i in $(seq 1 40); do
  if [ -f "$LOG_FILE" ]; then
    FOUND_URL=$(grep -o 'https://[-a-zA-Z0-9.]*\.trycloudflare\.com' "$LOG_FILE" | head -n 1)
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
ℹ️  Туннель: Cloudflare (БЕЗ ЛИМИТОВ, бесплатно, навсегда).
ℹ️  Ссылка работает сразу на компьютерах, ноутбуках и телефонах
    без настройки роутера, без портов и без сторонних программ.
    
⏰ Ссылка обновлена: $(date '+%d.%m.%Y в %H:%M:%S')
======================================================================
EOF
      chmod 664 "$DESKTOP_URL_FILE" 2>/dev/null || true

      echo "[Tunnel] Готово! Ссылка: $FOUND_URL"

      # Всплывающее системное уведомление на Рабочем столе
      if command -v notify-send >/dev/null 2>&1; then
        notify-send -u normal -i applications-games "🏰 BaSingSe MMORPG Сервер запущен!" "Ссылка для игроков:\n$FOUND_URL\n\nФайл сохранён на Рабочем столе." 2>/dev/null || true
      fi
      break
    fi
  fi
  sleep 1
done

wait $CF_PID
