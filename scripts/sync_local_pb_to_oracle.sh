#!/usr/bin/env bash
# Sync the local live PocketBase data to the Oracle Cloud server.
# Safe to run while both PocketBase instances are serving:
#  - consistent online snapshot via the sqlite3 backup API (handles WAL)
#  - Oracle side installs the snapshot under a running restart window
# Run this once more right before the real player cutover.

set -euo pipefail

ORACLE_HOST="130.61.108.45"
ORACLE_USER="ubuntu"
ORACLE_KEY="$HOME/.ssh/oracle_worldless.key"
LOCAL_PB_DATA="/home/uro/pocketbase-local/pb_data"
STAMP="$(date +%Y%m%d_%H%M%S)"
TMP="/tmp/pb_sync_${STAMP}"

echo "[1/4] Taking consistent online snapshot of local PocketBase..."
mkdir -p "$TMP"
python3 - "$LOCAL_PB_DATA" "$TMP" <<'PY'
import sqlite3, sys
src_dir, dst_dir = sys.argv[1], sys.argv[2]
for name in ("data.db", "auxiliary.db"):
    try:
        src = sqlite3.connect(f"{src_dir}/{name}")
        dst = sqlite3.connect(f"{dst_dir}/{name}")
        src.backup(dst)
        dst.close(); src.close()
        print(f"  {name}: snapshot ok")
    except Exception as e:
        if name == "auxiliary.db":
            print(f"  {name}: skipped ({e})")
        else:
            raise
PY

echo "[2/4] Uploading snapshot to Oracle..."
ssh -i "$ORACLE_KEY" "$ORACLE_USER@$ORACLE_HOST" "mkdir -p /tmp/pb_sync_in"
rsync -az -e "ssh -i $ORACLE_KEY" "$TMP/" "$ORACLE_USER@$ORACLE_HOST:/tmp/pb_sync_in/"

echo "[3/4] Installing snapshot on Oracle (brief PocketBase restart)..."
ssh -i "$ORACLE_KEY" "$ORACLE_USER@$ORACLE_HOST" '
set -euo pipefail
sqlite3 /tmp/pb_sync_in/data.db "PRAGMA integrity_check;" | head -1
sudo systemctl stop basingsecryptocity-pocketbase.service
sudo cp /tmp/pb_sync_in/data.db      /opt/basingsecryptocity/pocketbase/pb_data/data.db
sudo cp /tmp/pb_sync_in/auxiliary.db /opt/basingsecryptocity/pocketbase/pb_data/auxiliary.db 2>/dev/null || true
sudo bash -c "chown basingse:basingse /opt/basingsecryptocity/pocketbase/pb_data/*.db 2>/dev/null; true"
sudo rm -f /opt/basingsecryptocity/pocketbase/pb_data/data.db-wal /opt/basingsecryptocity/pocketbase/pb_data/data.db-shm
sudo systemctl start basingsecryptocity-pocketbase.service
sleep 3
curl -s -m 5 http://127.0.0.1:8090/api/health && echo " <- health after sync"
rm -rf /tmp/pb_sync_in
'

echo "[4/4] Cleaning local temp..."
rm -rf "$TMP"
echo "DONE: Oracle PocketBase now matches the local database as of $STAMP"
