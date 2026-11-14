# BasingseCryptoCity — Oracle Cloud Runbook

Live server: `basingsecryptocity-server` — `130.61.108.45` (Oracle Cloud, Frankfurt,
VM.Standard.A1.Flex ARM64, Ubuntu 24.04, Always Free).
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
  blocked at the proxy layer because `pb_hooks/**` is protected scope. Permanent fix:
  gate the route on a superuser/admin token inside the hook).
- `/api/*` → `127.0.0.1:8090`, `flush_interval -1` (realtime SSE-safe, no buffering).
- `/_/*` → PocketBase dashboard + Caddy `basic_auth` (user `basingse-admin`;
  password in `/home/uro/basingse-oracle-credentials.txt` on the dev machine).
- everything else → static `/opt/basingsecryptocity/frontend`, SPA fallback to `index.html`,
  immutable cache headers for game assets (mirrors `vite.config.ts` policy).

## PocketBase admin

- Dashboard: `http://130.61.108.45/_/` (basic-auth + PB superuser login).
- Superuser (migrated from local): `admin@basingse.game` — same password as local.

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

## HTTPS / DuckDNS (pending owner action)

1. Register `basingsecryptocity.duckdns.org` at https://www.duckdns.org (name was
   free as of 2026-11-14; login via GitHub/Google).
2. Either give the DuckDNS token to the agent, or run:
   ```bash
   ssh -i ~/.ssh/oracle_worldless.key ubuntu@130.61.108.45
   echo "<TOKEN>" | sudo tee /etc/basingse/duckdns.token && sudo chmod 600 /etc/basingse/duckdns.token
   sudo systemctl enable --now basingse-duckdns.timer
   sudo sed -i 's/^:80 {/basingsecryptocity.duckdns.org {/' /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```
3. Caddy obtains/renews the Let's Encrypt certificate automatically once DNS
   resolves to 130.61.108.45.

Until HTTPS is live, `http://130.61.108.45` is for technical diagnostics only
(no real player auth over plain HTTP).

## Monitoring / limits

- Both services auto-restart (systemd `Restart=always`).
- journald logging; check with `journalctl -u basingsecryptocity-pocketbase.service -n 200`.
- Health probe: `curl http://130.61.108.45/api/health`.
- VM: 2 OCPU / 12 GB RAM / 45 GB disk, ~43 GB free after deployment. No extra
  daemons installed (no containers, no panels).
