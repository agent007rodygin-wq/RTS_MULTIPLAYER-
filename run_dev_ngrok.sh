#!/usr/bin/env bash
# ==============================================================================
#  🏰 BaSingSe MMORPG — Запуск и управление сервером через Ngrok
# ==============================================================================

if [ -z "${BASINGSE_TERMINAL_RUNNING:-}" ] && [ ! -t 0 ]; then
  export BASINGSE_TERMINAL_RUNNING=1
  for term in ptyxis x-terminal-emulator gnome-terminal xdg-terminal-exec xterm; do
    if command -v "$term" >/dev/null 2>&1; then
      if [ "$term" = "ptyxis" ]; then
        exec ptyxis -s --title "🏰 BaSingSe MMORPG — Сервер Игры (Ngrok)" -- bash "$0" "$@"
      else
        exec "$term" -e bash "$0" "$@"
      fi
    fi
  done
fi

PB_DIR="/home/uro/pocketbase-local"
PB_BIN="$PB_DIR/pocketbase"
PB_DATA="$PB_DIR/pb_data"
PB_HOOKS="$PB_DIR/pb_hooks"
APP_DIR="/home/uro/Рабочий стол/my projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main"
DESKTOP_DIR="/home/uro/Рабочий стол"
APP_PORT=3000
URL_FILE="/tmp/basingse_public_url.txt"
DESKTOP_URL_FILE="$DESKTOP_DIR/ССЫЛКА_ДЛЯ_ДРУЗЕЙ.txt"

# Цвета ANSI
CLR_RESET="\033[0m"
CLR_BOLD="\033[1m"
CLR_GREEN="\033[1;32m"
CLR_CYAN="\033[1;36m"
CLR_YELLOW="\033[1;33m"
CLR_PURPLE="\033[1;35m"
CLR_WHITE="\033[1;37m"
CLR_RED="\033[1;31m"
CLR_BLUE="\033[1;34m"

clear
echo -e "${CLR_PURPLE}======================================================================${CLR_RESET}"
echo -e "${CLR_WHITE}${CLR_BOLD}     🏰  BASINGSE MMORPG — ЗАПУСК СЛУЖБ И NGROK ТУННЕЛЯ  🏰${CLR_RESET}"
echo -e "${CLR_PURPLE}======================================================================${CLR_RESET}"
echo ""

# --- 1. PocketBase (База данных) ---
if systemctl --user is-active --quiet aiagent-pocketbase.service 2>/dev/null; then
  echo -e " ${CLR_GREEN}[✔] PocketBase (База данных):${CLR_RESET} работает в фоне (0.0.0.0:8090)"
elif curl -s -o /dev/null -m 2 http://127.0.0.1:8090/api/health; then
  echo -e " ${CLR_GREEN}[✔] PocketBase (База данных):${CLR_RESET} активен на порту 8090"
else
  echo -e " ${CLR_YELLOW}[⏳] Запуск PocketBase на 0.0.0.0:8090...${CLR_RESET}"
  systemctl --user start aiagent-pocketbase.service 2>/dev/null || {
    nohup "$PB_BIN" serve --http=0.0.0.0:8090 --hooksDir="$PB_HOOKS" --dir="$PB_DATA" > "$PB_DIR/pb.log" 2>&1 &
  }
  sleep 2
fi

# --- 2. Vite Dev Server (Игра) ---
if systemctl --user is-active --quiet aiagent-game-vite.service 2>/dev/null; then
  echo -e " ${CLR_GREEN}[✔] Игровой сервер Vite:${CLR_RESET} работает в фоне (порт $APP_PORT)"
elif curl -s -o /dev/null -m 2 http://127.0.0.1:$APP_PORT; then
  echo -e " ${CLR_GREEN}[✔] Игровой сервер Vite:${CLR_RESET} активен на порту $APP_PORT"
else
  echo -e " ${CLR_YELLOW}[⏳] Запуск игрового сервера Vite...${CLR_RESET}"
  systemctl --user start aiagent-game-vite.service 2>/dev/null || {
    cd "$APP_DIR"
    nohup npx vite --host 0.0.0.0 --port "$APP_PORT" > /tmp/basingse_vite.log 2>&1 &
  }
  sleep 3
fi

# --- 3. Telegram Бот ---
if systemctl --user is-active --quiet basingse-bot.service 2>/dev/null; then
  echo -e " ${CLR_GREEN}[✔] Telegram Бот:${CLR_RESET} активен"
else
  echo -e " ${CLR_YELLOW}[⏳] Запуск Telegram бота...${CLR_RESET}"
  systemctl --user start basingse-bot.service 2>/dev/null || {
    pkill -f "telegram_bot.mjs" 2>/dev/null || true
    nohup /home/uro/node/bin/node "$APP_DIR/scripts/telegram_bot.mjs" > "$APP_DIR/telegram_bot.log" 2>&1 &
  }
fi

# --- 4. Интернет-Туннель (Ngrok) ---
# Останавливаем конкурирующий Cloudflare Tunnel
if systemctl --user is-active --quiet aiagent-tunnel.service 2>/dev/null; then
  systemctl --user stop aiagent-tunnel.service 2>/dev/null || true
fi
pkill -f "cloudflared tunnel" 2>/dev/null || true

if ! systemctl --user is-active --quiet aiagent-ngrok.service 2>/dev/null; then
  echo -e " ${CLR_YELLOW}[⏳] Запуск интернет-туннеля Ngrok...${CLR_RESET}"
  systemctl --user start aiagent-ngrok.service 2>/dev/null || {
    nohup /bin/bash "$APP_DIR/scripts/start_ngrok.sh" > /dev/null 2>&1 &
  }
fi

# --- 5. Ожидание ссылки Ngrok ---
PUBLIC_TUNNEL_URL=""
echo -e " ${CLR_CYAN}[⏳] Ожидание подключения к сети Ngrok...${CLR_RESET}"
for i in {1..15}; do
  if [ -f "$URL_FILE" ]; then
    PUBLIC_TUNNEL_URL=$(cat "$URL_FILE" 2>/dev/null | tr -d '\r\n')
    if [ -n "$PUBLIC_TUNNEL_URL" ]; then
      break
    fi
  fi
  sleep 1
done

if [ -z "$PUBLIC_TUNNEL_URL" ] && curl -s http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
  PUBLIC_TUNNEL_URL=$(python3 -c "import urllib.request, json; data=json.loads(urllib.request.urlopen('http://127.0.0.1:4040/api/tunnels').read()); print(data['tunnels'][0]['public_url'])" 2>/dev/null || true)
fi

# Сохраняем ссылку в файл на Рабочем столе
if [ -n "$PUBLIC_TUNNEL_URL" ]; then
  cat <<EOF > "$DESKTOP_URL_FILE"
======================================================================
       🏰 BASINGSE MMORPG — ССЫЛКА ДЛЯ ДРУЗЕЙ В ИНТЕРНЕТЕ 🏰
======================================================================

Скопируй эту ссылку и отправь игрокам:

👉  $PUBLIC_TUNNEL_URL

----------------------------------------------------------------------
ℹ️  Туннель Ngrok: работает в Украине и России без VPN.
ℹ️  При первом открытии друзьям нужно нажать кнопку «Visit Site».
    
⏰ Ссылка обновлена: $(date '+%d.%m.%Y в %H:%M:%S')
======================================================================
EOF
  chmod 664 "$DESKTOP_URL_FILE" 2>/dev/null || true

  if command -v notify-send >/dev/null 2>&1; then
    notify-send -u normal -i applications-games "🏰 BaSingSe MMORPG Сервер готов!" "Ссылка для друзей (Ngrok):\n$PUBLIC_TUNNEL_URL" 2>/dev/null || true
  fi
fi

# Локальный IP
LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$LOCAL_IP" ] && LOCAL_IP="127.0.0.1"

# Открываем браузер у хоста, если еще не открыт
xdg-open "http://localhost:$APP_PORT" >/dev/null 2>&1 &

show_dashboard() {
  clear
  echo -e "${CLR_PURPLE}╔══════════════════════════════════════════════════════════════════════════╗${CLR_RESET}"
  echo -e "${CLR_PURPLE}║${CLR_RESET}${CLR_WHITE}${CLR_BOLD}        🏰  BASINGSE MMORPG — СЕРВЕР РАБОТАЕТ ЧЕРЕЗ NGROK!  🏰            ${CLR_RESET}${CLR_PURPLE}║${CLR_RESET}"
  echo -e "${CLR_PURPLE}╚══════════════════════════════════════════════════════════════════════════╝${CLR_RESET}"
  echo ""
  echo -e " ${CLR_BOLD}Статус служб:${CLR_RESET}"
  echo -e "  • База данных PocketBase : ${CLR_GREEN}🟢 РАБОТАЕТ${CLR_RESET} (порт 8090)"
  echo -e "  • Сервер игры Vite       : ${CLR_GREEN}🟢 РАБОТАЕТ${CLR_RESET} (порт 3000)"
  echo -e "  • Интернет-туннель Ngrok : ${CLR_GREEN}🟢 АКТИВЕН${CLR_RESET} (работает в Украине и РФ)"
  echo -e "  • Telegram Бот           : ${CLR_GREEN}🟢 АКТИВЕН${CLR_RESET}"
  echo ""
  echo -e "${CLR_CYAN}┌──────────────────────────────────────────────────────────────────────────┐${CLR_RESET}"
  echo -e "${CLR_CYAN}│${CLR_RESET}${CLR_WHITE}${CLR_BOLD}  🌍  ССЫЛКА ДЛЯ ДРУЗЕЙ В ИНТЕРНЕТЕ (СКИДЫВАТЬ ИГРОКАМ):                  ${CLR_RESET}${CLR_CYAN}│${CLR_RESET}"
  echo -e "${CLR_CYAN}│                                                                          │${CLR_RESET}"
  if [ -n "$PUBLIC_TUNNEL_URL" ]; then
    echo -e "${CLR_CYAN}│${CLR_RESET}   👉  ${CLR_GREEN}${CLR_BOLD}$PUBLIC_TUNNEL_URL${CLR_RESET}"
  else
    echo -e "${CLR_CYAN}│${CLR_RESET}   👉  ${CLR_YELLOW}Получение ссылки... Нажмите [3] для рестарта туннеля${CLR_RESET}"
  fi
  echo -e "${CLR_CYAN}│                                                                          │${CLR_RESET}"
  echo -e "${CLR_CYAN}│${CLR_RESET}   📄 ${CLR_WHITE}Файл со ссылкой сохранён на Рабочем столе:${CLR_RESET}                       ${CLR_CYAN}│${CLR_RESET}"
  echo -e "${CLR_CYAN}│${CLR_RESET}       ${CLR_YELLOW}Рабочий стол/ССЫЛКА_ДЛЯ_ДРУЗЕЙ.txt${CLR_RESET}                                 ${CLR_CYAN}│${CLR_RESET}"
  echo -e "${CLR_CYAN}└──────────────────────────────────────────────────────────────────────────┘${CLR_RESET}"
  echo ""
  echo -e " ${CLR_BOLD}Локальные адреса:${CLR_RESET}"
  echo -e "  • Для тебя на этом ПК   : ${CLR_GREEN}http://localhost:$APP_PORT${CLR_RESET}"
  echo -e "  • Для друзей в твоем Wi-Fi: ${CLR_YELLOW}http://$LOCAL_IP:$APP_PORT${CLR_RESET}"
  echo -e "  • Админка PocketBase     : ${CLR_BLUE}http://localhost:8090/_/${CLR_RESET} (admin@basingse.game / BaSingSe2024)"
  echo ""
  echo -e "${CLR_PURPLE}--------------------------------------------------------------------------${CLR_RESET}"
  echo -e " ${CLR_WHITE}${CLR_BOLD}Меню команд:${CLR_RESET}"
  echo -e "  ${CLR_BOLD}[1]${CLR_RESET} 📋 Показать ссылку в окне (чтобы скопировать мышкой)"
  echo -e "  ${CLR_BOLD}[2]${CLR_RESET} 🌐 Открыть игру в браузере (http://localhost:$APP_PORT)"
  echo -e "  ${CLR_BOLD}[3]${CLR_RESET} 🔄 Перезапустить туннель Ngrok (получить новую ссылку)"
  echo -e "  ${CLR_BOLD}[4]${CLR_RESET} 📜 Показать логи сервера в реальном времени"
  echo -e "  ${CLR_BOLD}[5]${CLR_RESET} ⚙️  Открыть админку PocketBase"
  echo -e "  ${CLR_BOLD}[0]${CLR_RESET} 🚪 Закрыть это окно (сервер ПРОДОЛЖИТ работать в фоне)"
  echo -e "${CLR_PURPLE}--------------------------------------------------------------------------${CLR_RESET}"
  echo -n "Выберите действие [1-5, 0 для выхода]: "
}

while true; do
  show_dashboard
  read -r choice || break

  case "$choice" in
    1)
      if [ -n "$PUBLIC_TUNNEL_URL" ]; then
        if command -v zenity >/dev/null 2>&1; then
          zenity --entry --title="Ссылка для игроков BaSingSe MMORPG" \
            --text="Скопируйте эту ссылку (Ctrl+C) и отправьте игрокам:" \
            --entry-text="$PUBLIC_TUNNEL_URL" 2>/dev/null &
        fi
        if command -v notify-send >/dev/null 2>&1; then
          notify-send -i applications-games "Ссылка для друзей" "$PUBLIC_TUNNEL_URL" 2>/dev/null || true
        fi
        echo ""
        echo -e "${CLR_GREEN}Ссылка:${CLR_RESET} $PUBLIC_TUNNEL_URL"
        sleep 2
      else
        echo -e "${CLR_RED}Ссылка пока недоступна.${CLR_RESET}"
        sleep 2
      fi
      ;;
    2)
      xdg-open "http://localhost:$APP_PORT" >/dev/null 2>&1 &
      echo -e "${CLR_GREEN}Игра открыта в браузере!${CLR_RESET}"
      sleep 1.5
      ;;
    3)
      echo -e "${CLR_YELLOW}Перезапуск туннеля Ngrok...${CLR_RESET}"
      systemctl --user restart aiagent-ngrok.service 2>/dev/null || {
        pkill -f "ngrok http" 2>/dev/null || true
        nohup /bin/bash "$APP_DIR/scripts/start_ngrok.sh" > /dev/null 2>&1 &
      }
      sleep 5
      if [ -f "$URL_FILE" ]; then
        PUBLIC_TUNNEL_URL=$(cat "$URL_FILE" 2>/dev/null | tr -d '\r\n')
      fi
      echo -e "${CLR_GREEN}Новая ссылка готова!${CLR_RESET}"
      sleep 2
      ;;
    4)
      clear
      echo -e "${CLR_CYAN}=== ЖУРНАЛ СОБЫТИЙ СЕРВЕРА (Нажмите Ctrl+C, чтобы вернуться в меню) ===${CLR_RESET}"
      echo ""
      journalctl --user -u aiagent-game-vite.service -u aiagent-pocketbase.service -u aiagent-ngrok.service -f -n 25
      ;;
    5)
      xdg-open "http://localhost:8090/_/" >/dev/null 2>&1 &
      sleep 1.5
      ;;
    0|q|Q)
      echo ""
      echo -e "${CLR_GREEN}Сервер и туннель продолжают работать в фоне!${CLR_RESET}"
      echo -e "${CLR_WHITE}Друзья могут играть по ссылке. До свидания!${CLR_RESET}"
      sleep 1.5
      exit 0
      ;;
    *)
      ;;
  esac
done
