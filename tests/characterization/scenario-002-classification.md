# Scenario 2 Preliminary Classification

## Scenario

`Deleted building cannot be resurrected by a reconnect snapshot.`

This note is classification-only. It does not design a seam, fixture, replay,
test, or owner-acceptance step.

## Evidence Status

| Area | Current source confirmation | Controlled observation | Deterministic replay | Note |
| --- | --- | --- | --- | --- |
| Delete / tombstone suppression | Yes | No | No | `App.tsx` uses `deletingBuildingsRef`, `confirmedDeletedRef`, `isBuildingDeleting()`, `isBuildingTombstoned()`, and `removeBuildingFromSnapshotCaches()`. `src/pocketbase.ts` maintains `deadBuildingIds` and `deletedRecordKeys`. |
| Reconnect snapshot filtering | Yes for the guard path, no for the outcome | No | No | Reconnect goes through `src/pocketbase.ts:onSnapshot()` and back into `App.tsx:updatePlacedBuildingsFromServer()`, but there is no runtime replay proving the stale reconnect order. |
| Stale snapshot merge behavior | Yes for the merge path, no for the full race outcome | No | No | `resolvePlacedBuildingSnapshotMerge()` can return `skip_server_dead`, but source guards alone do not prove reconnect resurrection cannot still happen in every edge. |
| Snapshot-cache cleanup | Yes | No | No | Cache cleanup exists in memory refs and dead-id sets; reload durability is unproven. |
| Terminal deletion state | Yes for in-session terminal/deletion markers | No | No | The code has tombstone and confirmed-deleted markers, but not durable proof across reload or reconnect timing edges. |

## Known-Bug Review

- Search of the current source and baseline evidence did **not** find a
  documented confirmed bug stating that deleted buildings are currently
  resurrecting after reconnect.
- The evidence does show a **risk** category for stale snapshot resurrection
  and deletion resurrection in `specs/_baseline/16-risk-register.md`, which is
  not the same as a confirmed bug.
- The current evidence therefore does **not** prove
  `KNOWN_BUG_DO_NOT_FREEZE`.

## Tombstone Lifetime Analysis

- `deletingBuildingsRef` and `confirmedDeletedRef` are in-memory React refs in
  `App.tsx`; they are cache-local, not persistent storage.
- `isBuildingDeleting()` auto-expires the protection window after
  `DELETION_PROTECTION_MS` (`120000` ms) and clears the refs when the window
  ends.
- `src/pocketbase.ts` uses in-memory `deadBuildingIds` and
  `deletedRecordKeys` sets to suppress repeat writes and repeated 404 churn.
- Nothing in the reviewed source proves those caches survive a full reload.
- Tombstone behavior is therefore time-bounded, cache-local, and dependent on
  the deletion/confirmation path inside the current session.

## Reconnect / Reset Uncertainty

- `src/pocketbase.ts:onSnapshot()` confirms the reconnect plumbing and initial
  fetch ordering, but not the exact runtime result when a deleted building is
  followed by a late reconnect snapshot.
- `App.tsx:updatePlacedBuildingsFromServer()` confirms the merge path and the
  tombstone filters, but not that the reconnect race is exhausted in every
  consumer path.
- The source audit does not show controlled observation or deterministic replay
  for the reconnect/delete edge.
- Cache cleanup is not the same thing as durable reload proof.

## Classification Comparison

| Classification | Verdict | Why |
| --- | --- | --- |
| `CURRENT_ACCEPTED_BEHAVIOR` | Not selected | There is no controlled observation or replay evidence proving the broad contract. |
| `KNOWN_BUG_DO_NOT_FREEZE` | Not selected | No explicit current known-bug record was found for this exact behavior. |
| `UNCONFIRMED_RUNTIME_BEHAVIOR` | Selected | Source guards exist, but the reconnect outcome is not runtime-proven. |
| `LEGACY_COMPATIBILITY_BEHAVIOR` | Not selected | Nothing in the source or baseline evidence frames this as a legacy compatibility exception. |
| `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | Not selected | The case may later need narrowing, but no owner decision has been requested or recorded yet. |

## Proposed Classification

`UNCONFIRMED_RUNTIME_BEHAVIOR`

This is the conservative classification because the code clearly contains
delete/tombstone guards, yet there is still no controlled proof that a deleted
building cannot reappear after a reconnect snapshot across the relevant edge
cases.

## Why T032 Remains Blocked

T032 needs a seam decision, but the current evidence is not enough to choose
that seam safely.

Blocked reasons:

1. Source guards alone do not prove the reconnect race outcome.
2. The tombstone caches are in-memory and time-bounded, so they do not prove
   durable deletion behavior across reload or all reconnect edges.
3. There is no controlled observation or deterministic replay yet.
4. We do not yet know whether the correct next step is a pure boundary, a
   minimal owner-approved seam, or a later narrowing of the scenario wording.

`Scenario 2` therefore stays `UNCONFIRMED_RUNTIME_BEHAVIOR`, and `T032`
remains blocked until seam design can exercise the actual deletion/reconnect
boundary safely.
