# Scenario 7 Classification

Task authority: `T079`

Exact Scenario 7 wording:

`Upgrade completion survives reconnect without duplicate transformation.`

This is a preliminary classification and known-bug review only. It records
what the live source supports, what remains unproven at runtime, and why the
scenario is still not ready to freeze as a permanent contract.

## Exact Source Trail

| Area | Source anchors | Evidence label | What the source supports |
| --- | --- | --- | --- |
| Upgrade start and local rewrite | `App.tsx:14335-14491` `handleUpgrade(...)` | proven by source | The selected building is validated, upgrade target and cost are resolved, `upgradeConstructionEndTime` is computed, resources are deducted locally, and the selected building is rewritten immediately with the upgraded `buildingId`, `type`, `isConstructing`, `constructionEndTime`, `hp`, `maxHp`, and destruction reset fields. |
| Persisted upgrade fields | `App.tsx:14335-14491` `handleUpgrade(...)`; `specs/_baseline/08-upgrade-system.md` | proven by source | The active source persists upgrade-shaped construction fields on the same record id, not a separate upgrade record. |
| Upgrade end time | `App.tsx:14335-14491` `handleUpgrade(...)`; `specs/_baseline/05-timers-and-processes.md`; `specs/_baseline/08-upgrade-system.md` | proven by source | The upgrade deadline is an absolute timestamp derived from `Date.now()` plus construction duration. |
| Offline completion | `App.tsx:636-707` `processOfflineTimers(...)`; `src/game/buildings/resolveLocalConstructionCompletion.js` | proven by source | Overdue construction is finalized when `now >= constructionEndTime`, and the pure construction-completion helper projects the idle completed state. |
| Projected transformed building state | `App.tsx:636-707` `processOfflineTimers(...)`; `App.tsx:14335-14491` `handleUpgrade(...)` | proven by source | The projected state is the upgraded building record with construction cleared and the upgraded shape visible before server ack. |
| PocketBase write-back | `App.tsx:14335-14491` `handleUpgrade(...)`; `App.tsx:11439-11471` `updateBuildingDocSafe(...)`; `src/pocketbase.ts:1037-1450` | proven by source | The optimistic upgrade is written back through the PocketBase adapter, which preserves known fields during partial writes. |
| Optimistic / local replacement | `App.tsx:14335-14491` `handleUpgrade(...)` | proven by source | `setPlacedBuildings(...)` and `setSelectedBuilding(...)` rewrite the building locally first so the upgraded form appears immediately. |
| Initial fetch | `src/pocketbase.ts:1853-2219` `onSnapshot(...)`; `App.tsx:8263-8402` | proven by source | Realtime collection listeners fetch the current server view before subscribing, and the buildings sync effects feed those snapshots into the merge path. |
| Realtime subscription | `src/pocketbase.ts:1853-2219` `onSnapshot(...)`; `App.tsx:8263-8402` | proven by source | Realtime updates are delivered through the adapter wrapper with retry, cooldown, and incremental refresh behavior. |
| Reconnect merge | `App.tsx:7917-8124` `updatePlacedBuildingsFromServer(...)`; `src/game/buildings/resolveBuildingSnapshotMerge.js` | suggested by source | Server and local building views are merged through a dedicated snapshot-merge helper, and the reconnect path replays offline timers before the final building array is committed. |
| Stale snapshot suppression | `App.tsx:3299-3414`, `App.tsx:7954-8560`, `App.tsx:12130-12668` | proven by source | Deletion caches, tombstones, last-interaction tracking, and server-revived-state checks suppress known stale or resurrecting records. |
| Duplicate transformation guards | `App.tsx:11439-11471`, `App.tsx:12130-12668`, `App.tsx:3299-3414`, `src/pocketbase.ts:1853-2219` | guarded but not proven | Several guards bias toward the newest local or server-confirmed state, including `updateBuildingDocSafe(...)`, sticky merge windows, server-revival preference, and dead-record suppression. |

## State Ownership Summary

| Owner | Source-backed responsibility | Notes |
| --- | --- | --- |
| PocketBase record | Persistent building row with upgrade-shaped fields | The building record remains the persistent source of truth, including `buildingId`, `isConstructing`, `constructionEndTime`, `workState`, `hp`, `maxHp`, and destruction-reset fields. |
| `App.tsx` orchestration | Upgrade validation, optimistic rewrite, offline catch-up, reconnect merge, and write-back coordination | `handleUpgrade(...)`, `processOfflineTimers(...)`, `updatePlacedBuildingsFromServer(...)`, and `updateBuildingDocSafe(...)` all live here. |
| Pure helpers | Construction completion and snapshot merge logic | `resolveLocalConstructionCompletion(...)`, `resolvePlacedBuildingSnapshotMerge(...)`, and `shouldPreferServerRevivedBuildingState(...)` are the reusable boundaries currently available. |
| Optimistic / local state | Immediate transformed view before server ack | `setPlacedBuildings(...)`, `setSelectedBuilding(...)`, and the locally rewritten upgraded record show the transformed building immediately. |
| Refs / caches / tombstones | Suppression and freshness helpers | `lastInteractionRef`, `lastServerSyncRef`, `snapshotMergeDecisionLogRef`, deletion caches, tombstones, and optimism caches bias merge order and suppress stale resurrection. |
| Realtime adapter | Fetch-first / subscribe / retry boundary | `src/pocketbase.ts` owns the initial fetch, subscription, retry, and partial-update behavior. |

## Upgrade Completion Path

1. `handleUpgrade(...)` validates the selected building, target upgrade, cost,
   population, and inventory.
2. The upgrade deadline is computed as an absolute end timestamp.
3. `updatePlayerResources(...)` applies the local cost immediately.
4. `setPlacedBuildings(...)` rewrites the selected building in place to the
   upgraded form.
5. `updateDoc(...)` writes the transformed record back to PocketBase.
6. `processOfflineTimers(...)` later finalizes overdue construction by calling
   the pure completion helper.
7. The completion helper projects the consumed idle state instead of leaving
   the building in the constructing shape.

## Reload / Reconnect Path

1. Realtime listeners fetch the current server view before subscribing.
2. `App.tsx` collects owner and zone snapshots.
3. `updatePlacedBuildingsFromServer(...)` merges server state with local
   optimistic state.
4. `resolvePlacedBuildingSnapshotMerge(...)` applies sticky interaction,
   deletion protection, and revival preference.
5. `shouldPreferServerRevivedBuildingState(...)` can prefer a newer server view
   when the local state still shows a terminal or protected condition.
6. The resulting merged buildings are normalized and committed back to the
   visible building list.

## Duplicate-Transformation Analysis

The source contains several guards that reduce duplicate transformation risk:

- `lastInteractionRef` biases the merge toward the most recent local intent.
- `snapshotMergeDecisionLogRef` records the most recent merge decision per
  building.
- `updateBuildingDocSafe(...)` suppresses write attempts for buildings already
  queued for deletion.
- `resolvePlacedBuildingSnapshotMerge(...)` uses sticky interaction windows and
  server-revival checks.
- `shouldPreferServerRevivedBuildingState(...)` allows a fresher live server
  view to win over a stale protected local state.
- `safeSubscribe()` in `src/pocketbase.ts` retries transient subscription
  failures without inventing new state.

What remains unproven is the exact runtime guarantee that these guards prevent
every possible reconnect or retry ordering from duplicating the upgrade
transformation.

## Retry Implications

- `src/pocketbase.ts` serializes request work and applies read / subscription
  retry behavior.
- The current source supports bounded retries and initial-fetch-first
  subscription behavior.
- The source does not prove that every timeout / retry combination around
  upgrade persistence is duplicate-free.

## Realtime Implications

- `onSnapshot(...)` fetches first, then subscribes.
- Collection refreshes and incremental updates are explicitly handled.
- Offline timer reconciliation runs on top of merged server snapshots.
- The source supports a coherent merge order, but not an exhaustive proof of
  every race.

## Multi-Client Implications

- PocketBase remains the persistent authority for the building row.
- Server snapshots can still influence the final merged view when they are
  fresher or more authoritative.
- The source does not prove cross-client authority for every possible
  reconnect or replay interleaving.

## Existing Guards

- `src/game/buildings/resolveLocalConstructionCompletion.js` is the pure
  construction-completion helper already used by offline catch-up.
- `src/game/buildings/resolveBuildingSnapshotMerge.js` provides the pure
  snapshot-merge helper and `shouldPreferServerRevivedBuildingState(...)`.
- No dedicated pure upgrade-completion helper was found in the current source
  snapshot.
- The upgrade start path itself remains inline in `App.tsx`.

## Baseline Alignment

| Baseline doc | Alignment observed in source | What remains unproven |
| --- | --- | --- |
| `specs/_baseline/05-timers-and-processes.md` | Upgrade is construction-shaped; offline catch-up and construction end timestamps are source-backed. | Exact runtime ordering between upgrade completion and reconnect merge. |
| `specs/_baseline/08-upgrade-system.md` | `handleUpgrade(...)` uses construction semantics, rewrites the same building record, and clears destruction fields. | Every reconnect / replay edge of the upgraded record. |
| `specs/_baseline/09-realtime-sync.md` | Initial fetch, subscribe, retry, and merge behavior are source-backed. | Exact event ordering under all races. |
| `specs/_baseline/10-optimistic-ui.md` | Upgrade is local-first and optimistic before ack. | Full rollback or convergence proof for every failure edge. |
| `specs/_baseline/11-error-handling.md` | Retry / timeout / not-found suppression and stale-state handling exist. | That these protections eliminate duplicate transformation in every case. |
| `specs/_baseline/15-invariants.md` | Duplicate completion, stale snapshot, state ownership, and replay risks are partially confirmed or still open. | A full runtime proof that upgrade completion survives reconnect without duplicate transformation. |

## Known-Bug Review

I searched the live source and the scenario-traceability docs for a concrete
active bug report that matches the exact Scenario 7 contract. I did not find
one.

- Risk-register and invariant entries mention duplicate-transformation risk,
  but they are not proof of a currently reproducing bug.
- The source audit and baseline docs show the behavior is guarded, but not
  runtime-proven.
- There is no documented active bug report strong enough to classify this row
  as `KNOWN_BUG_DO_NOT_FREEZE`.

## Classification Comparison

| Candidate classification | Supported? | Why |
| --- | --- | --- |
| `CURRENT_ACCEPTED_BEHAVIOR` | No | No controlled observation, replay evidence, or owner acceptance exists yet. |
| `LEGACY_COMPATIBILITY_BEHAVIOR` | No | The source does not frame this as an intentionally preserved legacy contract. |
| `KNOWN_BUG_DO_NOT_FREEZE` | No | No concrete active bug report exists for the exact Scenario 7 wording. |
| `UNCONFIRMED_RUNTIME_BEHAVIOR` | Yes | The source shows the relevant paths and guards, but not a controlled runtime proof that reconnect convergence prevents duplicate transformation on every retry / reconnect edge. |

## Proven, Suggested, Guarded, Unknown

- Proven by source:
  - upgrade start rewrites the selected record immediately
  - offline completion helper projects idle completed construction
  - PocketBase write-back exists
  - fetch-first subscription and merge logic exist
  - stale snapshot suppression exists
- Suggested by source:
  - reconnect convergence is intended to prefer fresher server state when
    appropriate
  - duplicate-transformation risk is reduced by several guards
- Guarded but not proven:
  - every retry / reconnect ordering edge prevents duplicate transformation
  - the transformed record always appears exactly once at runtime
- UNCONFIRMED_RUNTIME_BEHAVIOR:
  - the exact Scenario 7 contract is not yet runtime-proven
- Not part of this audit:
  - controlled observation
  - replay evidence
  - owner acceptance

## Evidence Gaps

- No controlled runtime reproduction of the full Scenario 7 path.
- No owner-accepted contract yet.
- No replay note yet.
- No runtime proof that reconnect or replay cannot duplicate the upgrade
  transformation in every edge.

## Likely Split Need

The scenario wording touches several runtime surfaces: inline upgrade start,
offline completion catch-up, and reconnect / snapshot merge. That does not
force a split yet, but it strongly suggests T080 should inspect whether a
minimal seam is needed before any replay work.

## Whether T080 May Proceed

T080 may proceed to the seam decision step. It should still treat the scenario
as `UNCONFIRMED_RUNTIME_BEHAVIOR` and should not assume any promotion or
permanent characterization is available yet.

## Final Classification

`UNCONFIRMED_RUNTIME_BEHAVIOR`

Task state:

- `T079`: complete
- `T080`: open
