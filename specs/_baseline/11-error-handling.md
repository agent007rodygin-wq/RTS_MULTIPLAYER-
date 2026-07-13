# 11. Error Handling and Recovery

## Scope

This document catalogs the confirmed error-handling and recovery behavior in the active source snapshot. Graphify was used only as a navigation aid; every factual statement below is backed by direct source reading.

## Confirmed Error Matrix

| Error class | Confirmed handling | Source / lines | Status |
| --- | --- | --- | --- |
| Request timeout and request-queue saturation | `withTimeout()` rejects after 15000ms, and `enqueueRequest()` serializes queued requests so reads do not run without bounds. | `src/pocketbase.ts:80-99, 161-193` | CONFIRMED_BY_SOURCE |
| 404 missing record | `getDoc()` treats 404 as "not found"; `updateDoc()` and `deleteDoc()` suppress repeat writes for known-deleted buildings, resources, and dropped items; single-doc realtime subscriptions also tolerate missing docs. | `src/pocketbase.ts:832-1034, 1204-1460, 1853-1964` | CONFIRMED_BY_SOURCE |
| Stale auth record / missing user doc | A 404 while updating the user auth record clears auth state, and the auth bootstrap path skips auto-init when a non-404 fetch error occurs so it does not overwrite data with defaults. | `src/pocketbase.ts:1105-1111`; `App.tsx:6367-6376` | CONFIRMED_BY_SOURCE |
| Permission denied / 403 | `handleFirestoreError()` logs operation details and emits a permission warning, but it does not convert the error into a global crash. | `src/pocketbase.ts:2325-2354` | CONFIRMED_BY_SOURCE |
| Duplicate create / uniqueness conflict | `setDoc()` falls back from create to update when PocketBase returns `validation_not_unique` during create. A raw 409-specific branch was not separately confirmed. | `src/pocketbase.ts:1168-1197` | PARTIALLY_CONFIRMED |
| 401 unauthorized tree-hit | The tree-hit request path alerts the user to log in again when the server answers 401. | `App.tsx:5411-5545`; `src/pocketbase.ts:2392-2418` | CONFIRMED_BY_SOURCE |
| Realtime unavailable, stale CID, 429, 503, network, timeout, socket, or fetch failures | `safeSubscribe()` retries stale-client 404s and transient realtime failures with exponential backoff; generic realtime 404 falls back to initial-fetch-only mode when realtime is unavailable on the server. | `src/pocketbase.ts:1863-1928` | CONFIRMED_BY_SOURCE |
| Non-404 read failure | `getDoc()` rethrows non-404 errors so callers do not silently overwrite data with defaults; `getDocs()` returns an empty snapshot on error instead of throwing. | `src/pocketbase.ts:953-968, 980-1028` | CONFIRMED_BY_SOURCE |
| Partial write failure | Specific optimistic flows roll back their own local state when the create/update fails, but many other write paths only log the error and let later snapshots reconcile the view. | `App.tsx:5246-5285, 5862-6234, 16123-16189, 16441-16456, 17111-17183` | PARTIALLY_CONFIRMED |
| Silent best-effort catches | Presence updates ignore errors to keep game flow moving; cleanup loops, audio playback, and some chat-notification writes also swallow failures or warn only. | `App.tsx:3484-3500, 7318-7498, 7531-7564, 8805, 20792` | CONFIRMED_BY_SOURCE |
| Unhandled rejection and window error logging | The app registers `window` listeners for `error` and `unhandledrejection` and records startup debug events instead of trying to recover globally. | `App.tsx:2976-2991` | CONFIRMED_BY_SOURCE |
| Malformed record, missing field, invalid timestamp, or JSON parse failure | Some helpers normalize and heal corrupted cached data and legacy fields, but the current source does not prove a universal recovery branch for every malformed payload. | `App.tsx:1012-1070, 6949-6954`; `src/pocketbase.ts:492-556` | PARTIALLY_CONFIRMED |
| Component unmount during request | Realtime subscriptions clean up their unsubscribe handlers and suppress stale-client 404 noise during shutdown, but write cancellation for ordinary promises is not proven. | `src/pocketbase.ts:1841-1964, 1891, 2219`; `App.tsx:7310, 7497, 7838, 8560` | PARTIALLY_CONFIRMED |
| Loading hang risk | The loading overlay only closes when `loadingReady && user`; read-side timeouts exist, but a missing readiness signal can still keep the splash screen visible. | `App.tsx:3109-3111, 8442-8451, 17912-17941`; `LoadingScreen.tsx:46-47` | CONFIRMED_BY_SOURCE |

## Timeout And Retry Boundaries

- Read paths have a confirmed 15000ms timeout through `withTimeout()`.
- Realtime retry backoff is capped at 30000ms.
- The current source does not prove a matching timeout for every write promise.

## Rollback Completeness Summary

- Full rollback confirmed: building placement, building move, oil rig build, wild quarry build.
- Partial rollback confirmed: speed-up construction only rolls back cleanly when the target building is already gone.
- No direct rollback confirmed: upgrade, production start, production collect, protection, explosion, dropped-item pickup, repair, active toggle, bank withdrawal, clan join, clan leave.
- Transactional rather than optimistic: market write paths and building-permit purchase.

## Stale-State Protections

- `userRef`, `isAuthReadyRef`, `cameraOffsetRef`, `zoomIndexRef`, `playerClanIdRef`, `playerLeaderboardStatsRef`, and `allUsersRef` let async code read the latest values without depending only on a render-time closure.
- `lastInteractionRef` and `lastServerSyncRef` bias merges toward the newest local intent and the newest confirmed server view.
- `speedUpInFlightRef` prevents duplicate clicks from generating duplicate writes.
- Tombstone caches and delete-tracking refs prevent deleted records from being resurrected by older snapshots.
- `zoneSyncRetryCountsRef` and `zoneSyncRetryTimeoutsRef` prevent zone sync from retrying forever.

## Silent Inconsistency Risks

- `getDocs()` can fail open into an empty snapshot, which is safe for some refresh flows but can also hide a temporary backend failure as "no data."
- `handleFirestoreError()` logs and warns, but it does not globally halt the app.
- `updatePresence()` intentionally ignores errors, so online-state divergence can be invisible until a later sync.
- `cleanupExpiredCurses()` and `cleanupExpiredSystemMessages()` are best-effort maintenance loops.
- `safeSubscribe()` can fall back to fetch-only mode, which keeps the UI alive but may reduce realtime freshness.

## Unconfirmed Gaps

- Raw 409 handling was not separately proven beyond the `validation_not_unique` create fallback.
- JSON parse failures are not universally covered by dedicated recovery code.
- Invalid timestamp recovery is partially normalized, but not proven for every source record.
- Component-unmount cancellation for ordinary write promises is not proven.
- The exact runtime ordering between an optimistic local write and a later realtime snapshot remains runtime-sensitive in several flows.

## Reload Gate Correction

- `forceReloadAt` is a reload gate only.
- It does not prove persistence of construction or production after reload.
- Persistence is demonstrated by timer fields written into `buildings` records and reread through `processOfflineTimers()` and snapshot reconciliation.
