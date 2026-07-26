# Deployment Traceability

This document describes how production deployments are tracked in this
repository, how to find out exactly what revision is running in production, and
how to safely roll back.

---

## 1. What is generated, and where

Every successful `npm run deploy` (i.e. `node deploy.cjs`) produces two new
artifacts that didn't exist before this change:

1. **`dist/version.json`** — a small JSON file that ships inside the deploy
   bundle. After deploy it is reachable at the root of the served site:
   ```
   https://<game-host>/version.json
   ```
2. **`deploy.log`** — an append-only local file at the repository root that
   records every deploy as one line of structured key=value fields. It is
   gitignored (see `.gitignore` → `*.log`) so it stays on the operator's
   machine and is never committed.

The generator is `scripts/build-version.cjs`. It is invoked by `deploy.cjs`
once before the build (to block on a dirty tree if needed) and once after the
build (to write `dist/version.json` with the freshly-built commit hash). The
script is pure read-only against the working tree; it never modifies source
files.

---

## 2. The `version.json` schema (v1, frozen)

Field names, types, and order are frozen as schema v1. Future schema changes
must bump `VERSION_JSON_SCHEMA_VERSION` in `scripts/build-version.cjs` before
renaming, removing, or repurposing any existing field. Add-only changes
(new optional fields) are permitted without a version bump.

The exact field set, in the order it appears in `version.json`:

| Field            | Type    | Source                                                              |
| ---------------- | ------- | ------------------------------------------------------------------ |
| `schemaVersion`  | number  | `VERSION_JSON_SCHEMA_VERSION` constant (currently `1`). First field, lets parsers detect schema drift before reading the rest. |
| `version`        | string  | `package.json#version` (fallback `"0.0.0"`)                         |
| `commit`         | string  | `git rev-parse HEAD` (fallback `"unknown"`)                        |
| `shortCommit`    | string  | First 7 chars of `commit` (fallback `"unknown"`)                   |
| `branch`         | string  | `git rev-parse --abbrev-ref HEAD` (fallback `"unknown"`)           |
| `buildDate`      | string  | `new Date().toISOString()` (UTC ISO-8601)                          |
| `buildId`        | string  | Derived: `<commit12>-<compactBuildDate>` (see §3)                 |
| `deploymentMode` | string  | `"dirty"` if `git status --porcelain` has any non-empty line, else `"clean"`. Human-readable form of `dirty`. |
| `dirty`          | boolean | `true` iff `git status --porcelain` has any non-empty line. Machine-readable form of `deploymentMode` (kept for backwards compatibility with existing consumers). |
| `buildMachine`   | string  | `COMPUTERNAME` \|\| `HOSTNAME` \|\| `os.hostname()` (fallback `unknown`) |
| `nodeVersion`    | string  | `process.versions.node` prefixed with `v` (fallback `"unknown"`)  |
| `viteVersion`    | string  | `node_modules/vite/package.json#version` (fallback `"unknown"`)   |

Example:

```json
{
  "schemaVersion": 1,
  "version": "0.0.0",
  "commit": "4eee8792c635f1770f001b3337dcec144cc4a78e",
  "shortCommit": "4eee879",
  "branch": "main",
  "buildDate": "2026-07-26T16:15:47.938Z",
  "buildId": "4eee8792c635-20260726T161547",
  "deploymentMode": "clean",
  "dirty": false,
  "buildMachine": "URO",
  "nodeVersion": "v24.18.0",
  "viteVersion": "6.4.1"
}
```

A `deploymentMode: "dirty"` (or `dirty: true`) value in version.json is a red
flag — it means the deploy was forced past the dirty-tree guard via
`--allow-dirty` (see §5) and the deployed build does NOT match any committed
revision. Investigate before treating the deployed code as canonical.
`deploymentMode` is the recommended human-readable field; `dirty` is kept for
machine consumers (logs scrapers, dashboards) that already depend on a
boolean.

---

## 3. How `buildId` is generated

`buildId` is deterministic and unique per (commit, build second):

```
<commit12>-<compactBuildDate>
```

- **`commit12`** — first 12 hex chars of `git rev-parse HEAD`, or literal
  `"unknown"` when the script is run outside a git repository.
- **`compactBuildDate`** — `buildDate` (ISO-8601 UTC) with every character
  that is not a digit or `T` removed, then truncated to 15 chars. The result
  is fixed-length `YYYYMMDDTHHMMSS`.
- Joined by a single `-`.

Example: commit `b3c0f8fc607cc9ffe1e0e4ae32f3519d9fb0acaf`, buildDate
`2026-07-26T14:44:57.832Z` → `buildId = "b3c0f8fc607c-20260726T144457"`.

Properties:
- Identical inputs always produce identical `buildId`.
- Two builds of the same commit at different seconds differ in the date half.
- Two builds at the same second on different commits differ in the commit half.
- URL-safe, filename-safe, JSON-safe (no quotes, slashes, or spaces).
- Max length 30 chars (`"unknown"`-padded when git is unavailable).

---

## 4. How to inspect the production version

Pick whichever works for you — all three options take less than 30 seconds
and don't require SSH access to the VPS.

### Option A — curl the deployed `version.json` (server side)

```bash
curl -s https://<game-host>/version.json | python -m json.tool
```

Output is the JSON object shown in §2. The fields `commit`, `shortCommit`,
`branch`, `buildDate`, and `buildId` together unambiguously identify the
running revision.

### Option B — open the production URL with `?debugBuild=1`

Open in a browser:

```
https://<game-host>/?debugBuild=1
```

The application will print a one-time line to the DevTools console:

```
[Application Version] { schemaVersion: 1, version: "0.0.0", commit: "b3c0f8f…",
  shortCommit: "b3c0f8f", branch: "main", buildDate: "…",
  buildId: "b3c0f8fc607c-20260726T144457", deploymentMode: "clean", dirty: false }
```

This banner is the *only* side effect of `?debugBuild=1`. It does not change
any gameplay, network, or rendering behavior, and it disappears the moment
the URL parameter is removed.

### Option C — set the runtime flag from the browser console

```js
window.__SHOW_BUILD_INFO__ = true
```

Then refresh the page. Same banner as Option B is printed. Remove the flag
with `delete window.__SHOW_BUILD_INFO__` and refresh to silence it again.

### Important: normal users never see this banner

The banner is gated by **all three of these conditions being false**:

1. `import.meta.env.DEV === true` (Vite dev build, never true in `vite build`).
2. `window.__SHOW_BUILD_INFO__ === true` (set manually, never set by the app).
3. `?debugBuild=1` in the URL (must be added deliberately).

In a normal production visit all three are false, the `useEffect` returns
early before issuing any `fetch`. No request to `/version.json` is made, no
log line is emitted, and no extra JS chunk is loaded (the banner reads
`/version.json` inline via `fetch`, with no helper module and no dynamic
import — the chain is `App.tsx` `useEffect` → `fetch('/version.json')` →
`console.log`). Console noise for end users is exactly zero.

---

## 5. Why dirty deployments are blocked, and how `--allow-dirty` works

Running `npm run deploy` with a dirty working tree is **blocked by default**.
The check is in `deploy.cjs::main()`:

```text
Deploy blocked: working tree is dirty.
  Commit : b3c0f8fc607cc9ffe1e0e4ae32f3519d9fb0acaf
  Branch : main
  Status : uncommitted or untracked files present

To proceed anyway, re-run with --allow-dirty only if you understand
that the production deploy will not match any committed revision and
git-based traceability will be unreliable for this deploy.
```

### Why this guard exists

Without it, every previous "which revision is in production?" investigation
became a multi-hour forensic exercise because the deployed bundle could be a
dirty snapshot that matched no commit. The guard turns that into a fast,
reliable `curl /version.json`.

### How to override (only when you really mean it)

```bash
node deploy.cjs --allow-dirty
# or via the wrapper:
.\deploy.ps1 --allow-dirty
# or:
$env:DEPLOY_ALLOW_DIRTY = "1"; node deploy.cjs
```

When `--allow-dirty` is used:
- The deploy proceeds.
- `version.json` is still written and still reaches production.
- `version.json.deploymentMode` is set to `"dirty"` and `dirty` is set to
  `true`. `deploy.log` records `dirty=true`.
- A warning is printed at the start of the deploy.

The operator is therefore free to ship a hotfix from a dirty tree without
losing traceability — the `deploymentMode: "dirty"` flag is the audit trail
that this deploy did not come from a clean commit, and it is visible in
production via `curl /version.json`. Either `deploymentMode` or `dirty` is
enough to detect dirty deploys programmatically; humans typically scan the
string field, scripts typically check the boolean.

---

## 6. The `deploy.log` format (append-only)

`deploy.log` lives at the repository root and is gitignored. It is written
exclusively via `fs.appendFileSync` in `deploy.cjs::main()`; the deploy script
never opens it in write mode, never truncates it, and never deletes it. Old
deployment history is preserved indefinitely on the operator's machine.

Each successful deploy appends **exactly one line** of space-separated
`key=value` fields:

```
[2026-07-26T14:44:57Z] commit=b3c0f8fc607cc9ffe1e0e4ae32f3519d9fb0acaf short=b3c0f8f branch=main version=0.0.0 dirty=false buildId=b3c0f8fc607c-20260726T144457 node=v24.18.0 vite=6.4.1 machine=URO dest=root@89.127.214.182:/var/www/basingselegions mode=custom music=skip animation=skip
```

To review the deploy history:

```bash
tail -n 50 deploy.log
# or, for a single commit:
grep 'commit=b3c0f8f' deploy.log
```

---

## 7. Rollback

There are two levels of rollback.

### Level 1 — Code-level: revert the traceability feature

This change touches only deployment tooling and is fully reversible.

```bash
git revert <commit-sha>          # revert the traceability commit
rm dist/version.json 2>/dev/null # optional: drop the generated file
git push origin main              # optional, only if you want to share the revert
```

After the revert:
- `vite build` no longer writes `dist/version.json` (the write was always in
  `deploy.cjs`, not `vite.config.ts`, so plain `npm run build` was unaffected).
- The lazy banner chunk in `dist/assets/buildInfo-*.js` is no longer emitted
  (no `useEffect` references `import('./src/buildInfo')` anymore).
- Generated `version.json` already on the VPS is wiped on the next deploy
  because the new `deploy.cjs` continues to `find ${remoteDir} … -exec rm -rf`
  before extracting the tar — and the next deploy produces no `version.json`
  to put back.

Nothing else game-facing changed; the revert has no gameplay, networking,
rendering, or PocketBase side effects.

### Level 2 — Production-level: roll back the deployed bundle

If a deploy ships a bad bundle and you need to re-deploy an older committed
revision:

```bash
git checkout <older-good-commit>
git status --porcelain         # ensure clean (or use --allow-dirty with caution)
node deploy.cjs
curl -s https://<game-host>/version.json   # confirm deployed revision
```

Restoring the prior good revision is the same as any normal deploy — it now
leaves a `version.json` and `deploy.log` entry identifying what was rolled
back to. That audit trail is exactly the gap this feature closes.

---

## 8. Source map of the traceability feature

| File                          | Role                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| `scripts/build-version.cjs`  | Reads git+package state, produces build-info object, optionally writes `dist/version.json`. Exports `getBuildInfo`, `VERSION_JSON_SCHEMA`, `VERSION_JSON_SCHEMA_VERSION`. |
| `deploy.cjs`                  | Imports the generator. Blocks on dirty tree unless `--allow-dirty`. Writes `dist/version.json` after `runBuild()`. Appends to `deploy.log`. Prints version metadata to deployer terminal. Echoes `cat version.json` on the VPS after upload. |
| `App.tsx`                    | Adds one top-level `useEffect` inside the `App` component that, when explicitly enabled (`import.meta.env.DEV` OR `window.__SHOW_BUILD_INFO__` OR `?debugBuild=1`), issues a direct `fetch('/version.json')` and prints the `[Application Version] {...}` banner to the console. No helper module, no dynamic `import()`, no extra JS chunk. No module-scope logging. No hook reordering. |
| `docs/deployment-traceability.md` | This document. |

No other files in this repository are touched by the traceability feature.
