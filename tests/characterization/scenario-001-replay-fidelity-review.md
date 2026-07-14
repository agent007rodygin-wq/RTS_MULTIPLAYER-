# Scenario 1 Replay Fidelity Review

## Outcome

`NARROW_SYNTHETIC_EVIDENCE_ONLY`

The replay script does **not** import or execute a production helper from
`App.tsx` or `src/pocketbase.ts`. It is a local synthetic model that narrows
the claim to a sticky-interaction window replay and proves that the model can
fail under meaningful negative controls.

That makes the artifact useful, but it must not be described as execution of
the real production merge boundary.

## What Was Copied Or Modeled

### From `App.tsx:updatePlacedBuildingsFromServer()`

- sticky interaction window gating
- `currentUserId` / local ownership gate
- `lastInteractionRef`
- `lastServerSyncRef`
- tombstone / deleting guards
- building identity fields: `id`, `buildingId`, `x`, `y`, `zoneId`, `ownerId`
- state fields modeled in the synthetic slice: `isConstructing`,
  `constructionEndTime`, `isLocal`, `workState`, `workEndTime`, `isDestroying`,
  `destructionEndTime`, `hp`, `maxHp`, `pendingDamage`, `shieldHp`,
  `shieldMaxHp`, `protectionEndTime`, `lastMoveTime`, `lastAttackTime`,
  `timestamp`

### From Related Merge Helpers

- `hasActiveDestructionWindow(...)`
- `shouldPreferServerRevivedBuildingState(...)` shape
- the idea that terminal combat state can block revival

### From `src/pocketbase.ts:onSnapshot()`

- refresh-load versus realtime-event distinction
- the concept that an initial fetch arrives before the realtime event
- the audit-source labels used by the replay note

## Exact Matches

- the replay is deterministic
- the replay rebuilds fresh `Map`, `Set`, and state objects for each run
- the replay uses a fixed clock and frozen in-memory inputs
- the replay can observe the sticky-window behavior the current source
  documents

## Omitted Or Simplified Production Branches

- no import of the production merge helper
- no `processOfflineTimers(...)`
- no `findLocalMatchForServerBuilding(...)`
- no `serverMatchesLocal` early-clear path
- no `shouldStickPosition` / `shouldStickHealthState` per-field merge split
- no live `serverZoneBuildingsRef` / `serverMyBuildingsRef` merge pipeline
- no `removeBuildingFromSnapshotCaches(...)`
- no Town Hall grace-window logic
- no full dedup / recovery pass
- no incremental-zone snapshot path from `onSnapshot()`

## Drift Risks

- the model is intentionally narrower than the production merge boundary
- the model can validate the sticky-window slice while still missing a regression
  in one of the omitted branches
- the baseline PASS therefore proves only the narrow claim, not the full
  Scenario 1 statement

## Negative Controls

- `reverse-order` failed with `event-order-violated`
- `sticky-expired` failed with `late-snapshot-overwrote-current-state`
- `missing-fields` blocked with `missing-required-fields`
- `stale-wins` failed with `late-snapshot-overwrote-current-state`

The controls confirm that the replay is not self-confirming.

## Claim Supported

The artifact supports only this narrow statement:

> Within the active sticky-interaction window, an older building snapshot does
> not replace the accepted current building state.

It does **not** prove the broader statement:

> Initial fetch cannot be overwritten by an older late snapshot.

## T026 Status

T026 is reopened because the artifact is useful but only narrow synthetic
evidence.
It is not source-boundary execution and it does not complete the broad Scenario
1 replay requirement.
