#!/usr/bin/env bash
set -u

export PATH="/home/uro/node/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

URL_FILE="/tmp/basingse_localtunnel_url.txt"
LOG_FILE="/tmp/basingse_localtunnel.log"
DESKTOP_URL_FILE="/home/uro/Рабочий стол/ССЫЛКА_ДЛЯ_ДРУЗЕЙ.txt"
CF_URL_FILE="/tmp/basingse_public_url.txt"
SUBDOMAIN="basingse-rts"
PORT=3000

echo "[LocalTunnel] Получение внешнего IP для пароля..."
EXT_IP=$(curl -s --max-time 3 https://loca.lt/mytunnelpassword 2>/dev/null || curl -s --max-time 3 https://ifconfig.me 2>/dev/null || echo "45.130.247.30")
echo "$EXT_IP" > /tmp/basingse_localtunnel_ip.txt

update_desktop_file() {
  local lt_url="$1"
  local cf_url=""
  if [ -f "$CF_URL_FILE" ]; then
    cf_url=$(cat "$CF_URL_FILE" 2>/dev/null || true)
  fi

  cat <<EOF > "$DESKTOP_URL_FILE"
======================================================================
       🏰 BASINGSE MMORPG — ССЫЛКИ ДЛЯ ДРУЗЕЙ В ИНТЕРНЕТЕ 🏰
======================================================================

Скопируй и отправь другу подходящую ссылку:

1️⃣  ДЛЯ ДРУЗЕЙ ИЗ УКРАИНЫ (И ДЛЯ ТЕХ, У КОГО НЕ РАБОТАЕТ БЕЗ VPN):
👉  $lt_url
🔑  Пароль при первом входе: $EXT_IP
    (При первом переходе по ссылке сайт попросит ввести этот IP-пароль 
    и нажать «Click to Submit» — после этого игра откроется напрямую!)

----------------------------------------------------------------------

2️⃣  ОСНОВНАЯ ССЫЛКА (Cloudflare — без паролей, для всех остальных):
👉  ${cf_url:-"https://ranges-tours-increases-radios.trycloudflare.com"}

----------------------------------------------------------------------
ℹ️  Оба туннеля работают БЕЗ ЛИМИТОВ ТРАФИКА и подключены к одному миру.
ℹ️  Работает и с компьютеров, и со смартфонов (Android / iOS).

⏰ Обновлено: $(date '+%d.%m.%Y в %H:%M:%S')
======================================================================
EOF
  chmod 664 "$DESKTOP_URL_FILE" 2>/dev/null || true
}

while true; do
  rm -f "$LOG_FILE"
  echo "[LocalTunnel] Запуск localtunnel для порта $PORT..."

  # Пытаемся запустить localtunnel с перенаправлением вывода в лог
  npx --yes localtunnel --port "$PORT" --subdomain "$SUBDOMAIN" > "$LOG_FILE" 2>&1 &
  LT_PID=$!

  # Ждем появления ссылки в логе
  FOUND_URL=""
  for i in $(seq 1 15); do
    if [ -f "$LOG_FILE" ]; then
      FOUND_URL=$(grep -o 'https://[-a-zA-Z0-9.]*\.loca\.lt' "$LOG_FILE" | head -n 1)
      if [ -n "$FOUND_URL" ]; then
        echo "$FOUND_URL" > "$URL_FILE"
        echo "[LocalTunnel] Готово! Ссылка: $FOUND_URL (Пароль: $EXT_IP)"
        update_desktop_file "$FOUND_URL"

        if command -v notify-send >/dev/null 2>&1; then
          notify-send -u normal -i applications-games "🏰 BaSingSe MMORPG (Ссылка для Украины)" "Ссылка: $FOUND_URL\nПароль: $EXT_IP" 2>/dev/null || true
        fi
        break
      fi
    fi
    sleep 1
  done

  # Ожидаем завершения процесса туннеля
  wait $LT_PID 2>/dev/null || true
  echo "[LocalTunnel] Соединение оборвалось, переподключение через 3 секунды..."
  sleep 3
done
