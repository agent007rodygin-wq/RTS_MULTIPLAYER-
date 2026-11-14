# BasingseCryptoCity — Oracle Cloud Runbook

Live server: `basingsecryptocity-server` — `130.61.108.45` (Oracle Cloud, Frankfurt,
VM.Standard.A1.Flex ARM64, Ubuntu 24.04, Always Free).
Player URLs: **https://basingsecryptocity.duckdns.org** and
**https://gnomograd.duckdns.org** (both HTTPS, Let's Encrypt via Caddy, same app).
Local SSH: `ssh -i ~/.ssh/oracle_worldless.key ubuntu@130.61.108.45`

## Layout on the server

```text
/opt/basingsecryptocity/
    frontend/                  # built React/Vite client (rsync target for CI)
    pocketbase/
        pocketbase             # PB binary v0.36.8 (official linux_arm64 release)
        pb_data/               # SQLite data (data.db, auxiliary.db) — 750 basingse
        pb_hooks/              # JSVM hooks (main.pb.js + utils), identical to repo
    releases/                  # reserved for rollback copies
    shared/                    # duckdns_update.sh
    backups/                   # daily sqlite snapshots (14-day retention)
    logs/
```

Services (systemd):

| Service | Purpose | Status check |
| --- | --- | --- |
| `basingsecryptocity-pocketbase.service` | PocketBase on `127.0.0.1:8090`, enabled at boot, Restart=always | `systemctl status basingsecryptocity-pocketbase` |
| `basingsecryptocity-backup.timer` | Daily 04:00 UTC snapshot + integrity check + 14-day retention | `systemctl list-timers basingsecryptocity-backup*` |
| `basingse-duckdns.timer` | DuckDNS IP keep-alive every 15 min (disabled until token) | `systemctl status basingse-duckdns.timer` |
| `caddy` | Public web server on 80/443 | `systemctl status caddy` |

Caddy routes (`/etc/caddy/Caddyfile`, pre-deploy backup: `/etc/caddy/Caddyfile.bak_pre_basingse_*`):

- `/api/dev-token` → **404** (unauthenticated auth-token backdoor in `pb_hooks/main.pb.js`;
  blocked at the proxy layer. 2026-11 security pass: the route was **removed from
  `pb_hooks/main.pb.js` entirely** — the Caddy block now is defense-in-depth only).
- `/api/*` → `127.0.0.1:8090`, `flush_interval -1` (realtime SSE-safe, no buffering).
- `/_/*` → PocketBase dashboard + Caddy `basic_auth` (user `basingse-admin`;
  password in `/home/uro/basingse-oracle-credentials.txt` on the dev machine).
- everything else → static `/opt/basingsecryptocity/frontend`, SPA fallback to `index.html`,
  immutable cache headers for game assets (mirrors `vite.config.ts` policy).

## PocketBase admin

- Dashboard: `https://basingsecryptocity.duckdns.org/_/` (basic-auth + PB superuser login).
- Superuser credentials are **not** documented here: they live only in the owner's
  credentials file / `PB_ADMIN_EMAIL` + `PB_ADMIN_PASSWORD` env. Rotate them if they
  ever appeared in an older revision of this repository.

## Performance indexes (2026-11 perf pass)

The local `pb_data/data.db` already carries 12 game-table indexes
(`scripts/sql/pb_performance_indexes.sql`; verified 30–140× faster on hot queries:
buildings tile-check 0.75 ms → 0.008 ms). Oracle gets them automatically with the
next local→Oracle `pb_data` sync, or apply manually:

```bash
sqlite3 /opt/basingsecryptocity/pocketbase/pb_data/data.db \
  < scripts/sql/pb_performance_indexes.sql
```

(WAL mode: applying while PocketBase runs is safe; no restart needed. An
idempotent JSVM migration copy lives at `scripts/pb_performance_indexes_migration.js`.)

## Deploy (CI/CD)

1. `push` to `main` → GitHub Actions: `npm ci`, characterization tests, regression
   diagnostics, `vite build` (gates the pipeline), tsc report as artifact (non-blocking,
   pre-existing App.tsx errors).
2. Deploy runs **only via manual `workflow_dispatch`** (owner confirmation gate).
3. Owner setup (one-time, needs GitHub access):
   - Repo secrets: `ORACLE_SSH_KEY` = contents of `~/.ssh/basingse_deploy_ci` (private).
   - Server already accepts this key as `deploy@130.61.108.45` (frontend write access verified).
4. After the first successful deploy runs, auto-deploy on push can be enabled by
   changing the deploy job condition in `.github/workflows/deploy.yml`.

Rollback: re-run `workflow_dispatch` on the previous commit (GitHub "Run workflow"
with the older branch/ref). PocketBase is never restarted by frontend deploys.

### Manual frontend deploy (local machine)

```bash
rsync -az -e "ssh -i ~/.ssh/basingse_deploy_ci" dist/ \
  deploy@130.61.108.45:/opt/basingsecryptocity/frontend/
```

### Deploying pb_hooks changes (manual, backup first)

```bash
# 1. local: diff hooks against server
ssh -i ~/.ssh/oracle_worldless.key ubuntu@130.61.108.45 \
  "sudo cp -r /opt/basingsecryptocity/pocketbase/pb_hooks /opt/basingsecryptocity/releases/pb_hooks_$(date +%Y%m%d_%H%M%S)"
# 2. copy new hooks, then
sudo systemctl restart basingsecryptocity-pocketbase.service
```

## Data sync (local → Oracle cutover)

`scripts/sync_local_pb_to_oracle.sh` takes a consistent online snapshot of the
local live PocketBase and installs it on Oracle (safe while both run; PocketBase
on Oracle restarts automatically). Run it once more right before the real
player cutover so Oracle holds the newest local progress.

Restore from backup (proven on a test copy on 2026-11-14):

```bash
sudo systemctl stop basingsecryptocity-pocketbase.service
sudo cp /opt/basingsecryptocity/backups/data_<STAMP>.db  /opt/basingsecryptocity/pocketbase/pb_data/data.db
sudo cp /opt/basingsecryptocity/backups/auxiliary_<STAMP>.db /opt/basingsecryptocity/pocketbase/pb_data/auxiliary.db
sudo chown basingse:basingse /opt/basingsecryptocity/pocketbase/pb_data/*.db
sudo systemctl start basingsecryptocity-pocketbase.service
```

Off-site copy limitation: backups live only on the Oracle VM so far. Pull one to
the home machine regularly (does not require the home PC to be always on):

```bash
scp -i ~/.ssh/oracle_worldless.key \
  ubuntu@130.61.108.45:/opt/basingsecryptocity/backups/data_*.db ~/basingse_remote_backups/
```

## HTTPS / DuckDNS (live since 2026-11-14)

Done on 2026-11-14. Player-facing addresses:
**https://basingsecryptocity.duckdns.org** and **https://gnomograd.duckdns.org** —
one Caddy site block serves both; each gets its own Let's Encrypt certificate.

1. Both domains registered at https://www.duckdns.org
   (login `agent007rodygin-wq@github`), A records pinned to `130.61.108.45`.
   Note: the typo domain `basinsecretcity.duckdns.org` also exists in the same
   account and points to the same IP; it is unused.
2. DuckDNS token lives in `/etc/basingse/duckdns.token` (chmod 600, root) on the
   server. Never commit it.
3. `basingse-duckdns.timer` enabled: re-points BOTH domains at the server IP every
   15 minutes (`/opt/basingsecryptocity/shared/duckdns_update.sh`,
   `DOMAIN=basingsecryptocity,gnomograd`).
4. `/etc/caddy/Caddyfile` site address is
   `basingsecryptocity.duckdns.org, gnomograd.duckdns.org` (backups:
   `/etc/caddy/Caddyfile.bak_pre_https_*`, `Caddyfile.bak_pre_gnomograd_*`).
   Caddy obtained both Let's Encrypt certificates automatically and renews them
   on its own; HTTP is 308-redirected to HTTPS.

Verification evidence (2026-11-14): both domains return HTTP 200 over HTTPS with
`TLS verify 0` from an external client, `/api/health` 200 on both, certs issued
by Let's Encrypt, `curl -I http://...` → 308 redirect.

`http://130.61.108.45` no longer serves the game directly: a dedicated
`http://130.61.108.45` site block (added 2026-11-14 after plain-IP access broke
when the main block switched to named hosts) 301-redirects every legacy IP link,
including deep paths like `/#12,41` and asset URLs, to
`https://basingsecryptocity.duckdns.org` (backup:
`/etc/caddy/Caddyfile.bak_pre_ip_redir_*`). Use the domain names for all player
and admin access.

## Monitoring / limits

- Both services auto-restart (systemd `Restart=always`).
- journald logging; check with `journalctl -u basingsecryptocity-pocketbase.service -n 200`.
- Health probe: `curl https://basingsecryptocity.duckdns.org/api/health`.
- VM: 2 OCPU / 12 GB RAM / 45 GB disk, ~43 GB free after deployment. No extra
  daemons installed (no containers, no panels).
