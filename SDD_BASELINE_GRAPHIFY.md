# SDD Baseline (Graphify + Source)

Date: 2026-07-12

This document is a navigation baseline, not a proof of runtime behavior.
Graphify is used only to find relevant code paths; the source code is the final authority.

## Current Tooling State

- Graphify version: `0.9.13`
- Installed via: `uv tool install graphifyy`
- Working launch path in this shell: Python runtime from `C:\Users\goldw\AppData\Roaming\kimi-desktop\daimon-bundle\runtime\python\cpython-3.12\python.exe` with `PYTHONPATH` pointing to `C:\Users\goldw\AppData\Roaming\uv\tools\graphifyy\Lib\site-packages`
- Bare `graphify` launcher on PATH is not portable in this shell because the launcher points at a missing Python install
- Repo-local Spec Kit files were not visible in this snapshot (`AGENTS.md` and `.specify` were not found)
- Durable project rules already exist in `DEVELOPMENT_RULES.md`, `PROJECT_DECISIONS.md`, `GAME_ARCHITECTURE.md`, and `NETWORK_FLOW.md`

## Graph Freshness Check

- `App.tsx` last modified: `2026-07-12 18:14:32`
- `src/pocketbase.ts` last modified: `2026-07-12 15:17:28`
- `graphify-out/graph.json` last modified: `2026-07-12 18:46:05`
- `graphify-out/GRAPH_REPORT.md` last modified: `2026-07-12 18:46:05`
- `graphify-out/graph.html` last modified: `2026-07-12 18:46:05`
- No active source under the main code paths checked (`src`, `pb_hooks`, `components`, `data`, `services`, `public`, and root files) was modified after the graph was built
- Conclusion: the graph appears current for the active source snapshot, with the usual caveat that legacy backups and helper scripts may still exist outside the main runtime path

## Graphify Map

### Areas found through Graphify

- `App.tsx` as the main shell and gameplay orchestrator
- `src/pocketbase.ts` as the PocketBase adapter and realtime wrapper
- `monsterAnimationConfig.ts` and `playerAssets.ts` as animation/data modules
- `marketStaticData.ts`, `actionOptions.ts`, and `energyPurchaseOptions.ts` as economy/UI data
- `types.ts` as the shared domain model
- `pb_hooks/tree_server_utils.js` as a server hook area
- root maintenance scripts such as schema repair, respawn, cleanup, import/export, and smoke scripts

### Most connected nodes

- `App()`
- `pocketbase`
- `updateDoc()`
- `setDoc()`
- `getPriorityAnimationUrlsForBuilding()`
- `processTreeHit()`
- `collection()`
- `getDoc()`
- `deleteDoc()`
- `onSnapshot()`

## CONFIRMED_BY_SOURCE

| Area | File / symbol | Approx. lines | Caller | Reads | Writes | Side effects | Network / subscription |
|---|---|---:|---|---|---|---|---|
| Global reload listener | `App.tsx` / `useEffect` | 4450-4477 | React effect after auth readiness | `map_state/status.forceReloadAt`, `lastForceReloadAt.current` | local reload timestamp ref | reloads the page when server reload time increases | `onSnapshot(doc(db, 'map_state', 'status'))` |
| Map resources sync | `App.tsx` / `useEffect` | 4789-4805 | React effect when zones change | `currentZones`, snapshot docs | `setMapResources(resourcesData)` | clears retry state and derives intel notifications from added resources | `onSnapshot(query(collection(db, 'map_resources'), where('zoneId', 'in', currentZones)))` |
| Offline catch-up | `App.tsx` / game loop block | 7988-8028 | Main reconciliation loop | `allBuildings`, `mapResources`, `isWorldWrapped`, `buildingData`, `userRef.current` | merged building state, server updates | processes overdue timers, normalizes building health, fires `updateDoc` writes | `updateDoc(doc(db, 'buildings', id), data)` |
| Tree hit flow | `App.tsx` / tree action handler + `src/pocketbase.ts` / `requestTreeHit` | 5424-5446 and 2392-2418 | Player click on a tree | `playerEnergy`, `resource.type`, `resourceId`, auth token | local energy/gold state after server response | plays coin sound, applies server-returned rewards only if `applied` | `fetch POST /api/basingse/tree-hit` |
| Optimistic UI guard | `App.tsx` / building-destruction handler | 16023-16034 | Local destruction interaction | `lastInteractionRef`, computed damage/timing fields | `lastInteractionRef.current`, `updateData` payload | prevents snapshot overwrite of explosion state | subsequent `updateDoc` and realtime reconciliation |
| PocketBase client bootstrap | `src/pocketbase.ts` / module init | 1-19 | Module import time | env vars, `pb.baseUrl` | `PB_*` runtime flags, audit context | creates the PocketBase client and disables auto-cancellation | `new PocketBase('http://89.127.214.182:8090')` |
| Realtime wrapper | `src/pocketbase.ts` / `onSnapshot` | 1853-2215 | `App.tsx` and other callers | query descriptor, auth/realtime state | callback snapshots, retry state, prev snapshot cache | staggered subscribe, retries, initial fetch, throttled refetch, fallback if realtime 404s | `pb.collection(...).subscribe(...)`, `fetchQueryRecords(...)` |
| Partial write protection | `src/pocketbase.ts` / `updateDoc` | 1204-1455 | `App.tsx` and other callers | current record, raw `data` JSON, deleted-record guards | merged payload, `dead*` caches, deleted-record markers | avoids overwriting sibling fields, preserves JSON fields, suppresses repeated 404 spam | `pb.collection(ref.collectionName).update(targetId, payload)` |

## RUNTIME_CONFIRMED

| Chain | Status | Notes |
|---|---|---|
| Player hits tree -> UI handler -> `requestTreeHit` -> server response -> local energy/gold update -> later reconciliation | Confirmed | The handler checks energy, calls the server endpoint, and only then applies returned values locally |
| Auth-ready app -> `onSnapshot(map_state/status)` -> reload on `forceReloadAt` increase | Confirmed | The effect ignores the initial snapshot and reloads only on a newer server timestamp |
| Zone-visible resources -> realtime query -> callback -> `setMapResources` | Confirmed | The effect builds a zone-scoped query and writes snapshot data into local state |
| Overdue buildings -> `processOfflineTimers` -> `updateDoc` writes | Confirmed | The loop processes timers and syncs resulting updates back to PocketBase |
| Local destructive interaction -> local timestamp guard -> snapshot reconciliation | Confirmed | The code marks the interaction before writing so realtime updates do not immediately erase the local explosion state |

## INFERRED_BY_GRAPH

These links came from Graphify and should still be checked against source before being treated as architecture facts.

- `App()` -> `getPriorityAnimationUrlsForBuilding()` via an inferred indirect call
- `App()` -> `createVisualEffect()` via an inferred indirect call
- `App()` -> `src/pocketbase` snapshot data helpers via inferred indirect dataflow
- `pb_hooks/tree_server_utils.js` -> `processTreeHit()` / `processDueTreeRespawns()` via inferred call edges
- `smoke_pocketbase_startup.mjs` -> health / realtime checks via inferred call edges
- `src/pocketbase.ts` transaction helpers -> ref/data helpers via inferred indirect calls

## UNCONFIRMED

- Exact runtime ordering between every optimistic local write and every later realtime snapshot
- Whether every maintenance script in the repository is still active or only historical
- Whether the graph captured all dynamic callback wiring inside `App.tsx`
- Whether every backup file in the repository is truly inactive
- Whether all future spec boundaries should mirror the current monolith boundary or split it first

## What The Graph Cannot Prove

- It cannot prove runtime order for async effects, retries, or race conditions
- It cannot prove that an inferred edge is executed in production
- It cannot prove that a function is called in every code path
- It cannot prove whether a legacy helper is still relevant to the current build
- It cannot replace direct source reading for PocketBase, realtime, optimistic UI, timers, or rollback behavior

## SDD Readiness

The graph is useful enough to start a Spec-Driven baseline because it clearly points to the important boundaries:

- `App.tsx` monolith
- PocketBase adapter and realtime layer
- tree / reward server flow
- timer catch-up and reconciliation
- animation and economy data modules

It is not yet strong enough to serve as the only proof source for behavior.
For SDD, use this file and the existing project rules as the starting map, then validate each spec against source and runtime evidence.
