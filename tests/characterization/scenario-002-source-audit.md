# Scenario 2 Source Audit

## Scenario

`Deleted building cannot be resurrected by a reconnect snapshot.`

This audit is read-only. It does not classify the behavior, design a seam,
design fixtures, or prove the contract.

## Source Anchors

- `App.tsx:updatePlacedBuildingsFromServer()` at `App.tsx:7925-8149`
- `App.tsx` building tombstone state at `App.tsx:3305-3479`
- `App.tsx` building subscriptions at `App.tsx:8254-8393`
- `src/pocketbase.ts:onSnapshot()` at `src/pocketbase.ts:1854-2228`
- `src/game/buildings/resolveBuildingSnapshotMerge.js:1-181`
- Baseline references:
  - `specs/_baseline/03-state-ownership.md`
  - `specs/_baseline/06-building-system.md`
  - `specs/_baseline/09-realtime-sync.md`
  - `specs/_baseline/10-optimistic-ui.md`
  - `specs/_baseline/11-error-handling.md`
  - `specs/_baseline/15-invariants.md`

## Exact Reconnect Path

1. `App.tsx` mounts the building sync effects for `serverMyBuildingsRef` and
   `serverZoneBuildingsRef` once auth and zone state are ready.
2. `src/pocketbase.ts:onSnapshot()` performs an initial fetch (`getDoc()` for
   single docs or `fetchQueryRecords()` for collection queries) and labels it as
   `refresh-load`.
3. The same `onSnapshot()` then subscribes to realtime events through
   `safeSubscribe()`.
4. `App.tsx` receives the fresh snapshot in the `unsubscribeMy` and
   `unsubscribeZone` handlers and calls `updatePlacedBuildingsFromServer()`.
5. `updatePlacedBuildingsFromServer()` merges `serverMyBuildingsRef` and
   `serverZoneBuildingsRef`, then runs `resolvePlacedBuildingSnapshotMerge()`
   for each building.

## Reconnect Snapshot Flow

- Single-doc subscriptions:
  - initial fetch at `src/pocketbase.ts:1939-1957`
  - delete event handling at `src/pocketbase.ts:1974-1993`
- Query subscriptions:
  - initial fetch at `src/pocketbase.ts:2087-2107`
  - incremental zone merge at `src/pocketbase.ts:2058-2085`
  - throttled refetch on realtime events at `src/pocketbase.ts:2145-2222`
- App-level merge:
  - `unsubscribeMy` updates owner-scoped building state and calls
    `updatePlacedBuildingsFromServer()` at `App.tsx:8261-8334`
  - `unsubscribeZone` updates zone-scoped building state and calls the same
    merge path at `App.tsx:8345-8426`

## PocketBase Fetch Path

- `getDoc()` / `fetchQueryRecords()` are the authoritative fetch steps inside
  `src/pocketbase.ts:onSnapshot()`.
- Initial fetches are explicitly tagged as `refresh-load`.
- Realtime events are tagged as `realtime-event`.
- Generic realtime 404s fall back to initial fetch only.

## Realtime Resubscribe Path

- `safeSubscribe()` applies staggered subscription start and retry backoff.
- Realtime 404 client-id and transport errors retry with bounded backoff.
- Generic realtime 404s disable live realtime and leave only the fetch path.
- Query subscriptions can use incremental zone snapshots when the event remains
  zone-local; otherwise the code falls back to `handleUpdate()` and refetch.

## Deletion And Tombstone Flow

- `App.tsx` keeps delete state in `deletingBuildingsRef` and
  `confirmedDeletedRef`.
- `removeBuildingFromSnapshotCaches()` marks a building deleted, removes it
  from the server snapshot caches, and adds it to the confirmed-deleted set.
- `isBuildingDeleting()` and `isBuildingTombstoned()` suppress stale data during
  the protection window.
- `src/pocketbase.ts` keeps persistent dead-record state in `deadBuildingIds`
  and `deletedRecordKeys`.
- `deleteDoc()` and `updateDoc()` skip repeat writes for known-deleted building
  ids.

## Building Resurrection Guards

- `App.tsx` skips tombstoned ids when rebuilding the owner and zone maps.
- `updatePlacedBuildingsFromServer()` filters tombstoned buildings out before
  the final merge.
- `resolvePlacedBuildingSnapshotMerge()` returns `skip_server_dead` when the
  incoming server building is dead and the local interaction window still
  matters.
- The helper also exposes sticky merge branches for the protected case, but
  the deleted-building path is the direct resurrection guard relevant to
  Scenario 2.

## Reconnect Merge Pipeline

1. Fetch or refetch snapshot from `src/pocketbase.ts:onSnapshot()`.
2. Populate `serverMyBuildingsRef` and/or `serverZoneBuildingsRef`.
3. Call `updatePlacedBuildingsFromServer()`.
4. Rebuild `merged` with tombstone filtering and offline timer processing.
5. Apply `resolvePlacedBuildingSnapshotMerge()` per building.
6. Deduplicate by id and tile.
7. Emit the merged building list back into React state.

## Evidence Gaps

- No controlled Scenario 2 replay has been run yet.
- No permanent Scenario 2 test exists yet.
- No seam decision has been recorded for this scenario yet.
- No deterministic fixture or owner acceptance exists yet.
- The audit does not prove the specific reconnect race outcome under stale
  replay conditions.

## Unknowns

- Whether the stale reconnect snapshot reaches the merge helper before the
  delete tombstone is confirmed in every timing edge.
- Whether every consumer path for building snapshots uses the same guard chain.
- Whether owner-scoped and zone-scoped snapshots stay aligned under a reconnect.
- Whether all late snapshot shapes are blocked by the same deletion window.

## Missing Proof

- Controlled observation of delete -> reconnect -> stale snapshot ordering.
- Deterministic replay evidence for the reconnect boundary.
- Proof that the reconnect snapshot cannot resurrect a deleted building across
  all relevant consumer paths.

## Status

`Scenario 2` remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.
