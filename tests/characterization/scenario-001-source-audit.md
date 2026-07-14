# Scenario 1 Source Audit

## Scope

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

Observed contract under audit:

> Initial fetch cannot be overwritten by an older late snapshot.

This document only records current source evidence, participating modules,
current merge paths, and the evidence still missing before any classification
decision.

## Where This Behavior Lives Today

The behavior is not isolated to one helper. It lives in the PocketBase adapter
and in every `App.tsx` subscription that consumes adapter snapshots.

### Direct source anchors

- `src/pocketbase.ts:1854-2204` - `onSnapshot()` performs the initial fetch,
  tags the callback as `refresh-load`, and then handles later
  `realtime-event` callbacks.
- `src/pocketbase.ts:1940-2204` - collection subscriptions build a
  `refresh-load` snapshot first, then switch to a realtime path that either
  refetches or merges incrementally.
- `App.tsx:4794-4897` - `map_resources` and `dropped_items` subscriptions
  accept snapshot payloads into local state.
- `App.tsx:6852-7053` - current-user `users/<uid>` sync merges snapshot data
  into the current client view.
- `App.tsx:7395-7464` - chat snapshots are merged into local history.
- `App.tsx:7591-7710` - user roster and leaderboard snapshots merge into
  `allUsers`.
- `App.tsx:8392-8560` - `buildings` owner and zone snapshots merge into
  `placedBuildings` through `updatePlacedBuildingsFromServer()`.

## Runtime Modules Found

| Module | Role in scenario 1 | Why it matters |
| --- | --- | --- |
| `src/pocketbase.ts` | Defines the initial fetch and realtime callback ordering for doc and collection subscriptions. | This is where refresh-load and later realtime events are separated. |
| `App.tsx` | Consumes snapshot callbacks and merges them into local state. | This is where a late snapshot can affect the visible client state. |
| `specs/_baseline/09-realtime-sync.md` | Baseline description of initial fetch, subscription, retries, and stale snapshot handling. | Confirms the intended sync model for this investigation. |
| `specs/_baseline/15-invariants.md` | Baseline invariant catalog for stale overwrite / replay risk. | Confirms the exact risk family still needs runtime proof. |

## PocketBase Operations Participating

| Operation | Where it appears | Role |
| --- | --- | --- |
| `getDoc()` | `src/pocketbase.ts:1940-1946` and `App.tsx` user / map state loads | Initial fetch for doc subscriptions. |
| `getDocs()` / `fetchQueryRecords()` | `src/pocketbase.ts:2088-2106` and many `App.tsx` loaders | Initial fetch for collection subscriptions and explicit refreshes. |
| `pb.collection(...).subscribe()` | `src/pocketbase.ts:1889-1898` | Realtime event stream after the initial fetch. |
| `updateDoc()` / `setDoc()` / `deleteDoc()` | `App.tsx` merge and optimistic flows | These writes can create newer local or server state that a stale snapshot might try to overwrite. |

## Merge Pipeline

### Adapter level

1. `onSnapshot()` starts with an initial fetch.
2. Single-doc subscriptions call `getDoc()` first and mark the callback as
   `__auditSource: 'refresh-load'`.
3. Collection subscriptions call `fetchQueryRecords()` first and emit a
   `refresh-load` snapshot before realtime events are processed.
4. For zone-scoped collections, later events may be converted into an
   incremental merge through `buildIncrementalZoneSnapshot()`.
5. For other collection queries, later events trigger `fetchLatestSnapshot()`
   with a cooldown / refetch policy.

### App level

1. `map_resources` and `dropped_items` callbacks replace the visible arrays
   from snapshot payloads.
2. `users` and leaderboard callbacks merge incoming docs into `allUsers`
   using current client state as a base.
3. `buildings` snapshots are merged by `updatePlacedBuildingsFromServer()`,
   which combines server maps, local optimistic state, tombstones, and
   freshness guards.
4. `lastInteractionRef` and `lastServerSyncRef` bias building merges toward
   newer local intent and the most recent confirmed server view.

## Optimistic State Participating

| State slice / ref | Role |
| --- | --- |
| `placedBuildings` | Main building state merge surface. |
| `mapResources` | Zone resource state that is replaced from snapshots. |
| `droppedItems` | Zone loot state that is replaced from snapshots. |
| `allUsers` | Social / profile merge surface that is updated from user and leaderboard snapshots. |
| `lastInteractionRef` | Marks the most recent local intent for stale-overwrite protection. |
| `lastServerSyncRef` | Tracks the latest server-seen time for a building. |
| `serverMyBuildingsRef` | Owner-scoped server view used during merge. |
| `serverZoneBuildingsRef` | Zone-scoped server view used during merge. |
| Tombstone / delete caches | Suppress resurrection of already-deleted records. |

## Replay Paths

These are the current runtime paths that can replay state into the client:

- a doc subscription emits `refresh-load`, then later `realtime-event`
  callbacks
- a collection subscription emits `refresh-load`, then later `realtime-event`
  callbacks
- zone-scoped collection events can be merged incrementally instead of full
  refetch
- building snapshots can be replayed through
  `updatePlacedBuildingsFromServer()`
- local optimistic writes can be followed by later snapshot reconciliation
- owner / zone / leaderboard / chat listeners can each re-emit state after the
  initial fetch

## Stale-Snapshot Paths

The current source contains multiple stale-snapshot sensitive paths:

- doc subscriptions deliver a later `realtime-event` after the initial fetch
- collection subscriptions can refetch after a realtime event and then merge
  the result back into state
- `buildings` merge logic explicitly compares server and local state and may
  keep local protected state while the server catches up
- `map_resources` and `dropped_items` replace local arrays directly from the
  latest snapshot payload
- `users` and leaderboard merges preserve stronger local counters and cached
  values, which means the visible state can differ from a naive overwrite

## Current Evidence Supporting the Behavior

- `src/pocketbase.ts` clearly fetches before subscribing.
- `src/pocketbase.ts` explicitly distinguishes `refresh-load` from
  `realtime-event`.
- `App.tsx` uses freshness guards and tombstones around buildings.
- `App.tsx` keeps local mirrors for users, resources, dropped items, chat, and
  leaderboard data.
- Baseline docs `09-realtime-sync.md` and `15-invariants.md` already treat
  stale snapshots and replay risk as a real concern.

## Evidence Still Missing

- No runtime proof yet shows that an older late snapshot cannot overwrite a
  newer state in every participating consumer.
- No controlled replay trace yet compares a fresh initial fetch against a late
  stale snapshot for this scenario.
- No proof yet shows whether the protection is uniform across all consumers or
  only strongest in the building merge path.
- No explicit monotonic snapshot versioning is visible in the current source
  for this scenario.
- No fixture-based observation exists yet for this scenario.

## What Must Be Verified Before Classification

- direct current-source confirmation for the exact consumer path under audit
- controlled observation or deterministic replay showing the older snapshot
  loses to the newer state
- confirmation that the observed behavior is not a known bug

## Investigation Blockers

- The source proves fetch-first and merge logic, but not the full replay race
  envelope for every consumer.
- The source does not yet expose a scenario-specific monotonic snapshot
  comparator.
- The current audit is still source-only; no deterministic replay has been run
  for scenario 1 yet.

## Open State

Scenario 1 stays `UNCONFIRMED_RUNTIME_BEHAVIOR` until a later pass verifies the
behavior with controlled replay and owner review.
