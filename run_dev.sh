#!/usr/bin/env bash
# BaSingSe MMORPG — локальный запуск: PocketBase + Vite
set -u

PB_DIR="/home/uro/pocketbase-local"
PB_BIN="$PB_DIR/pocketbase"
PB_DATA="$PB_DIR/pb_data"
APP_DIR="/home/uro/Рабочий стол/my projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main"
APP_PORT=3002

# 1. PocketBase (если ещё не запущен)
if ! curl -s -o /dev/null http://127.0.0.1:8090/api/health; then
  echo "[run] старт PocketBase :8090 ..."
  nohup "$PB_BIN" serve --http=127.0.0.1:8090 --dir="$PB_DATA" > "$PB_DIR/pb.log" 2>&1 &
  sleep 2
else
  echo "[run] PocketBase уже работает :8090"
fi

# 2. Vite dev-сервер
cd "$APP_DIR"
echo "[run] старт Vite на http://localhost:$APP_PORT ..."
echo "[run] аккаунт: test@test.com / testpass123"
echo "[run] админка PocketBase: http://127.0.0.1:8090/_ (admin@basingse.game / BaSingSe2024)"
npx vite --port "$APP_PORT" --strictPort
