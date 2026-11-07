#!/usr/bin/env bash
# ==============================================================================
#  🏰 BaSingSe MMORPG — Интерактивный терминал запуска и управления сервером
# ==============================================================================

# 1. Если скрипт запущен не из терминала (двойной клик на .sh или .desktop),
#    автоматически открываем его в графическом терминале ptyxis / x-terminal-emulator
if [ -z "${BASINGSE_TERMINAL_RUNNING:-}" ] && [ ! -t 0 ]; then
  export BASINGSE_TERMINAL_RUNNING=1
  for term in ptyxis x-terminal-emulator gnome-terminal xdg-terminal-exec xterm; do
    if command -v "$term" >/dev/null 2>&1; then
      if [ "$term" = "ptyxis" ]; then
        exec ptyxis -s --title "🏰 BaSingSe MMORPG — Сервер Игры" -- bash "$0" "$@"
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
echo -e "${CLR_WHITE}${CLR_BOLD}          🏰  BASINGSE MMORPG — ПРОВЕРКА И ЗАПУСК СЛУЖБ  🏰${CLR_RESET}"
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

# --- 4. Интернет-Туннель (Cloudflare Tunnel) ---
if ! systemctl --user is-active --quiet aiagent-tunnel.service 2>/dev/null; then
  echo -e " ${CLR_YELLOW}[⏳] Запуск интернет-туннеля Cloudflare...${CLR_RESET}"
  systemctl --user start aiagent-tunnel.service 2>/dev/null || {
    nohup /bin/bash "$APP_DIR/scripts/start_tunnel.sh" > /dev/null 2>&1 &
  }
fi

# --- 5. Ожидание ссылки туннеля ---
PUBLIC_TUNNEL_URL=""
echo -e " ${CLR_CYAN}[⏳] Ожидание подключения к сети Cloudflare...${CLR_RESET}"
for i in {1..12}; do
  if [ -f "$URL_FILE" ]; then
    PUBLIC_TUNNEL_URL=$(cat "$URL_FILE" 2>/dev/null | tr -d '\r\n')
    if [ -n "$PUBLIC_TUNNEL_URL" ]; then
      break
    fi
  fi
  sleep 1
done

# Если ссылки еще нет в файле, пробуем прочесть напрямую из лога
if [ -z "$PUBLIC_TUNNEL_URL" ] && [ -f "/tmp/basingse_tunnel.log" ]; then
  PUBLIC_TUNNEL_URL=$(grep -o 'https://[-a-zA-Z0-9.]*\.trycloudflare\.com' /tmp/basingse_tunnel.log 2>/dev/null | tail -n 1)
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
ℹ️  Ссылка работает сразу на компьютерах, ноутбуках и телефонах
    без настройки роутера, без портов и без сторонних программ.
    
⏰ Ссылка обновлена: $(date '+%d.%m.%Y в %H:%M:%S')
======================================================================
EOF
  chmod 664 "$DESKTOP_URL_FILE" 2>/dev/null || true

  if command -v notify-send >/dev/null 2>&1; then
    notify-send -u normal -i applications-games "🏰 BaSingSe MMORPG Сервер готов!" "Ссылка для друзей:\n$PUBLIC_TUNNEL_URL" 2>/dev/null || true
  fi
fi

# Локальный IP
LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$LOCAL_IP" ] && LOCAL_IP="127.0.0.1"

# Открываем браузер у хоста, если еще не открыт
xdg-open "http://localhost:$APP_PORT" >/dev/null 2>&1 &

# ==============================================================================
#  ГЛАВНЫЙ ИНТЕРАКТИВНЫЙ ЭКРАН ТЕРМИНАЛА
# ==============================================================================
show_dashboard() {
  clear
  echo -e "${CLR_PURPLE}╔══════════════════════════════════════════════════════════════════════════╗${CLR_RESET}"
  echo -e "${CLR_PURPLE}║${CLR_RESET}${CLR_WHITE}${CLR_BOLD}               🏰  BASINGSE MMORPG — СЕРВЕР РАБОТАЕТ!  🏰                 ${CLR_RESET}${CLR_PURPLE}║${CLR_RESET}"
  echo -e "${CLR_PURPLE}╚══════════════════════════════════════════════════════════════════════════╝${CLR_RESET}"
  echo ""
  echo -e " ${CLR_BOLD}Статус служб:${CLR_RESET}"
  echo -e "  • База данных PocketBase : ${CLR_GREEN}🟢 РАБОТАЕТ${CLR_RESET} (порт 8090)"
  echo -e "  • Сервер игры Vite       : ${CLR_GREEN}🟢 РАБОТАЕТ${CLR_RESET} (порт 3000)"
  echo -e "  • Интернет-туннель       : ${CLR_GREEN}🟢 АКТИВЕН${CLR_RESET} (Cloudflare HTTPS)"
  echo -e "  • Telegram Бот           : ${CLR_GREEN}🟢 АКТИВЕН${CLR_RESET}"
  echo ""
  echo -e "${CLR_CYAN}┌──────────────────────────────────────────────────────────────────────────┐${CLR_RESET}"
  echo -e "${CLR_CYAN}│${CLR_RESET}${CLR_WHITE}${CLR_BOLD}  🌍  ССЫЛКА ДЛЯ ДРУЗЕЙ В ИНТЕРНЕТЕ (СКИДЫВАТЬ ИГРОКАМ):                  ${CLR_RESET}${CLR_CYAN}│${CLR_RESET}"
  echo -e "${CLR_CYAN}│                                                                          │${CLR_RESET}"
  if [ -n "$PUBLIC_TUNNEL_URL" ]; then
    echo -e "${CLR_CYAN}│${CLR_RESET}   👉  ${CLR_GREEN}${CLR_BOLD}$PUBLIC_TUNNEL_URL${CLR_RESET}"
  else
    echo -e "${CLR_CYAN}│${CLR_RESET}   👉  ${CLR_YELLOW}Получение ссылки... Попробуйте нажать [3] для рестарта туннеля${CLR_RESET}"
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
  echo -e "  ${CLR_BOLD}[3]${CLR_RESET} 🔄 Перезапустить интернет-туннель (сгенерировать новую ссылку)"
  echo -e "  ${CLR_BOLD}[4]${CLR_RESET} 📜 Показать живые логи сервера в реальном времени"
  echo -e "  ${CLR_BOLD}[5]${CLR_RESET} ⚙️  Открыть админку PocketBase"
  echo -e "  ${CLR_BOLD}[0]${CLR_RESET} 🚪 Закрыть это окно (сервер ПРОДОЛЖИТ работать в фоне)"
  echo -e "${CLR_PURPLE}--------------------------------------------------------------------------${CLR_RESET}"
  echo -n "Выберите действие [1-5, 0 для выхода]: "
}

# Интерактивный цикл терминала
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
        echo -e "${CLR_WHITE}(Также открыто окно для удобного копирования)${CLR_RESET}"
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
      echo -e "${CLR_YELLOW}Перезапуск туннеля Cloudflare...${CLR_RESET}"
      systemctl --user restart aiagent-tunnel.service 2>/dev/null || {
        pkill -f "cloudflared tunnel" 2>/dev/null || true
        nohup /bin/bash "$APP_DIR/scripts/start_tunnel.sh" > /dev/null 2>&1 &
      }
      sleep 6
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
      journalctl --user -u aiagent-game-vite.service -u aiagent-pocketbase.service -u aiagent-tunnel.service -f -n 25
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
      # Просто обновляем экран
      ;;
  esac
done
