# 09. Realtime Sync

## Scope

This document captures the current realtime synchronization behavior in `App.tsx` and `src/pocketbase.ts`. Graphify was used only to find likely sync boundaries; every factual statement below is confirmed by direct source reading.

## Realtime Model Summary

| Path | Confirmed behavior | Confidence |
| --- | --- | --- |
| Single-document subscriptions | `onSnapshot()` performs an initial `getDoc()` first, then subscribes to the document id. A `delete` event is converted into a synthetic empty snapshot. Cleanup unsubscribes and suppresses stale-client 404 noise. | CONFIRMED |
| Collection subscriptions | `onSnapshot()` performs `fetchQueryRecords()` first, then subscribes to `*`. Zone-scoped `map_resources`, `buildings`, and `dropped_items` queries can merge incrementally; all other collection updates refetch with a short cooldown. | CONFIRMED |
| Subscription scheduling | Realtime subscriptions are staggered with `subscriptionCounter`, `SUBSCRIPTION_DELAY_MS = 150`, jitter, and exponential retry backoff for transient errors. | CONFIRMED |
| Read transport | Query reads are queued and wrapped with `QUERY_REQUEST_TIMEOUT_MS = 15000` so realtime refreshes cannot hang forever. | CONFIRMED |

## Confirmed Realtime Surfaces

| Surface | Source path | PocketBase shape | Local state or refs | Runtime behavior | Confidence |
| --- | --- | --- | --- | --- | --- |
| Map reload gate | `App.tsx:4450-4477` | `map_state/status` | `lastForceReloadAt.current` | Single-doc listener reloads the page when the server flag changes. | CONFIRMED |
| Map generation sync | `App.tsx:4480-4509` | `map_state/status`, `buildings`, `map_resources` | generation state and first-load guards | Reads the map bootstrap state and writes the initial generated world when needed. | CONFIRMED |
| Zone resource sync | `App.tsx:4794-4805` | `map_resources` | `mapResources` state | Zone query subscribes through `onSnapshot()` and updates local resource state. | CONFIRMED |
| Dropped items sync | `App.tsx:4880-4897` | `dropped_items` | dropped-item state | Zone query subscribes through `onSnapshot()` and refreshes local ground-loot state. | CONFIRMED |
| Current-user status sync | `App.tsx:7247-7311` | `users/<uid>` and `users` | profile / ban / curse state | Current-user doc and related user state are kept in sync through realtime and reload effects. | CONFIRMED |
| User roster and leaderboard sync | `App.tsx:6848-7708` | `users`, `leaderboard_profiles` | `allUsers`, leaderboard state | Broad user snapshot plus leaderboard materialized view keep social stats current. | CONFIRMED |
| Presence sync | `App.tsx:7501-7840` | `presence` | online-user / presence state | Presence snapshots update live online-state data. | CONFIRMED |
| Buildings owner snapshot | `App.tsx:8389-8468` | `buildings` | owner-specific building cache | Owner-scoped building query is kept in sync via realtime subscription. | CONFIRMED |
| Buildings zone snapshot | `App.tsx:8470-8560` | `buildings` | zone building cache | Zone-scoped building query is kept in sync via realtime subscription and refetch fallback. | CONFIRMED |
| Elections sync | `App.tsx:8599-8642` | `elections/police`, `elections/royal` | election state | Two single-doc subscriptions keep election state current. | CONFIRMED |
| Chat sync | `App.tsx:7340-7496` | `chat_messages` | chat message list and cleanup refs | Realtime updates keep chat history fresh, with local-only message handling and dedupe. | CONFIRMED |
| Private messages | `App.tsx:9347-9365` | `private_messages` | private chat state | Direct-message snapshots update live. | CONFIRMED |

## Runtime Chains

### Map status reload

`map_state/status` change
-> `App.tsx` reload listener
-> `lastForceReloadAt.current` update
-> `window.location.reload()`
-> fresh app bootstrap.

### Zone resource updates

`map_resources` event in current zones
-> `src/pocketbase.ts` `onSnapshot()` collection handler
-> zone incremental merge or cooldown refetch
-> `App.tsx` `mapResources` state update
-> canvas and interaction systems re-read the new resource list.

### Dropped-item updates

`dropped_items` event in current zones
-> `src/pocketbase.ts` `onSnapshot()` collection handler
-> refetch or merge path
-> local loot state refresh
-> pickup / render logic sees the new records.

### Current-user sync

`users/<uid>` change
-> user-doc listener in `App.tsx`
-> profile / ban / curse state reconciliation
-> UI and gameplay gating update.

### Buildings sync

`buildings` event
-> owner or zone subscription in `App.tsx`
-> local building cache refresh
-> building timers, collision, and production views re-evaluate.

## Retry, Deduplication, and Staleness Controls

| Control | Where it lives | Confirmed effect |
| --- | --- | --- |
| Staggered subscription start | `src/pocketbase.ts` `safeSubscribe()` | Reduces the initial realtime burst by delaying subscription start. |
| Transient retry backoff | `src/pocketbase.ts` `safeSubscribe()` | Retries 404-client-id, 429, 503, network, timeout, socket, and fetch-style failures. |
| Realtime unavailable fallback | `src/pocketbase.ts` `safeSubscribe()` | Logs a single warning for generic realtime 404s and falls back to initial fetch only. |
| Cooldown coalescing | `src/pocketbase.ts` `handleUpdate()` / `armCooldown()` | Coalesces bursts of collection events into refetches spaced by `THROTTLE_MS = 250`. |
| Destroyed guard | `src/pocketbase.ts` `onSnapshot()` | Prevents late async work from mutating state after unsubscribe. |
| Delete dedupe and dead-record caches | `src/pocketbase.ts` write helpers | Prevents repeated delete/update churn for records already known to be gone. |

## Server-Side Event Boundary

| Boundary | Source | Role | Confidence |
| --- | --- | --- | --- |
| Tree-hit endpoint | `src/pocketbase.ts:2392-2418`, `pb_hooks/main.pb.js:3-56` | Client posts `resourceId` to `/api/basingse/tree-hit`; the hook requires auth and updates tree state server-side. | CONFIRMED |
| Tree respawn cron | `pb_hooks/main.pb.js:55-56`, `pb_hooks/tree_server_utils.js:632-694` | Backend cron manages `tree_respawns` and respawn scheduling. | CONFIRMED |

## Legacy and Compatibility Notes

| Item | Status | Why it matters |
| --- | --- | --- |
| `storage`, `ref()`, `uploadBytes()`, `getDownloadURL()`, `uploadBytesResumable()` | LEGACY_COMPATIBILITY | They are stubs and do not participate in the active realtime model. |
| `db` and `googleProvider` exports | LEGACY_COMPATIBILITY | Present for compatibility only; the current app uses PocketBase, not Firestore. |
| `runTransaction()` / `writeBatch()` | PARTIALLY_CONFIRMED | They provide a compatibility surface, but they are not atomic PocketBase transactions. |

## Unconfirmed Runtime Questions

- Whether the first realtime event can ever arrive before the initial fetch resolves on a slow network.
- Whether every optimistic local mutation in `App.tsx` is always reconciled by a later snapshot without duplicate application.
- Whether the cooldown refetch strategy preserves every intermediate state that matters to gameplay, or only the final visible state.
- Whether offline timer catch-up and realtime snapshots can race in edge cases that change visible ordering.
- Whether every legacy compatibility export is truly unreachable from the active app surface.

## Audit Readiness

The realtime layer is good enough for navigation and baseline documentation. It clearly shows which collections are live-synced, how retries and cooldowns work, and where server-side boundaries exist. It does not fully prove exact event ordering, optimistic reconciliation, or timer interaction order, so those points remain reserved for later runtime-focused audit stages.

## Counts

- Confirmed realtime subscription loci in active client code: 13
- Confirmed collection/doc families participating in realtime sync: 13
- Confirmed main collection-refetch cooldown: 250 ms
- Confirmed subscription stagger: 150 ms per slot, plus jitter
- Confirmed read timeout: 15 s
