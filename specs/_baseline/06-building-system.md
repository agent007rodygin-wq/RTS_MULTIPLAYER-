# 06. Building System

## Scope And Evidence

This document covers the active building placement and construction lifecycle in the current source snapshot.
Graphify was used only to find the relevant source paths. All claims below are verified directly from the code.

Main sources:

- `App.tsx`
- `src/pocketbase.ts`
- `types.ts`
- `data/buildings.ts`

## Current Confirmed State Model

The code does not expose a single enum for the full building lifecycle. The current state model is inferred from the actual fields that the runtime reads and writes.

| State / field combo | Meaning in the current source | Evidence | Confidence |
| --- | --- | --- | --- |
| Optimistic create pending | A new building is visible locally before the PocketBase write returns | `placeBuildingAtTile`, `handleBuildOilRig`, `handleBuildWildQuarry` | `CONFIRMED_BY_SOURCE` |
| Constructing | `isConstructing === true` and `constructionEndTime` is in the future | `placeBuildingAtTile`, `handleUpgrade`, `ConstructionTimer`, `processOfflineTimers` | `CONFIRMED_BY_SOURCE` |
| Construction complete | `isConstructing === false` after the end timestamp is reached | `processOfflineTimers`, building-state loop, tutorial finalize path | `CONFIRMED_BY_SOURCE` |
| Working / active production | `workState === 'working'` and `workEndTime` is in the future | `handleStartProduction*`, `manual production loop`, `processOfflineTimers` | `CONFIRMED_BY_SOURCE` |
| Finished production | `workState === 'finished'` | `processOfflineTimers`, building-state loop, collection handlers | `CONFIRMED_BY_SOURCE` |
| Destroying | `isDestroying === true` with destruction timestamps and pending damage | `handleExplode`, combat loop, `processOfflineTimers` | `CONFIRMED_BY_SOURCE` |

## Building Placement And Construction Flow

### Generic placement

`placeBuildingAtTile` is the main generic construction path.

| Step | Reads | Writes | Effects | Confidence |
| --- | --- | --- | --- | --- |
| Validate placement | `validatePlacementTarget`, `playerRubies`, `playerGold`, `inventory`, `maxPopulation`, `maxBuildings`, `buildingData` | None yet | Rejects illegal placement before any local mutation | `CONFIRMED_BY_SOURCE` |
| Deduct resources | `updatePlayerResources` | Player resources and inventory | Applies the cost immediately when placement is accepted | `CONFIRMED_BY_SOURCE` |
| Create optimistic building | `building.id`, `constructionTimeSeconds`, `Date.now()` | `setPlacedBuildings`, `isConstructing`, `constructionEndTime`, `isLocal` | Shows the building immediately in the world | `CONFIRMED_BY_SOURCE` |
| Persist to PocketBase | Temp id and final id path | `setDoc(doc(db, 'buildings', ...))` | Writes the building record after the optimistic state exists | `CONFIRMED_BY_SOURCE` |
| Roll back on create failure | Server error, local temp id | Remove optimistic building; restore costs in the generic path | Keeps the client from staying in a broken half-created state | `CONFIRMED_BY_SOURCE` |

The generic path uses `constructionEndTime = Date.now() + constructionTimeSeconds * 1000`.
The actual construction-start timestamp is only captured in runtime audit traces; it is not persisted as a canonical field in the audited source.

### Special resource placements

`handleBuildOilRig` and `handleBuildWildQuarry` follow the same optimistic pattern, but they also remove the source map resource from `mapResources`.

| Path | Extra reads | Extra writes | Failure behavior | Confidence |
| --- | --- | --- | --- | --- |
| Oil rig | `selectedOilDeposit`, `oilRigInfo`, `validatePlacementTarget` | `setMapResources` removes the oil tile; building is created optimistically | Restores the removed resource tile if `setDoc` fails | `CONFIRMED_BY_SOURCE` |
| Quarry | `selectedQuarry`, `wildQuarryInfo`, `validatePlacementTarget` | `setMapResources` removes the quarry tile; building is created optimistically | Restores the removed resource tile if `setDoc` fails | `CONFIRMED_BY_SOURCE` |

### UI entry and duplicate-click protection

`handleConfirmBuild` is the visible UI entry point for standard construction.

- `isBuildingActionProcessing` blocks repeated clicks while a build action is in flight.
- tutorial placement paths also pause briefly before they finalize the state.
- `isBuildingDeleting` and `DELETION_PROTECTION_MS` keep late snapshots from resurrecting records that are already being removed.

## Rollback And Reconciliation

| Situation | Confirmed behavior | Confidence |
| --- | --- | --- |
| Generic create failure | Optimistic building is removed and the cost is restored in the construction path | `CONFIRMED_BY_SOURCE` |
| Oil / quarry create failure | The removed map resource is restored | `CONFIRMED_BY_SOURCE` |
| Tutorial finalize path | The temporary construction state is cleared after the delayed finalize step | `CONFIRMED_BY_SOURCE` |
| Late snapshot for a deleting building | Tombstone logic blocks resurrection for a short protection window | `CONFIRMED_BY_SOURCE` |

`src/pocketbase.ts` is relevant here because the adapter preserves top-level building fields and the `data` JSON payload during partial updates. That matters for timer fields such as `constructionEndTime`, `workState`, and `isDestroying`.

## Inferred Process Model

The runtime behavior can be described as a simple sequence:

`validate placement`
`-> optimistic local building`
`-> PocketBase create/update`
`-> construction countdown`
`-> construction complete`
`-> later realtime merge`

This sequence is confirmed by source, but the exact interleaving with reconnects and late snapshots remains a runtime question for the next stage.

## Notes On Current Configs

The active building catalog in `data/buildings.ts` confirms that the construction system must support:

- construction time values in seconds
- upgrade chains that reuse construction timing
- production buildings with `workTimeSeconds`, `produces`, `sometimesProduces`, and `consumes`
- buildings that change type during collection-driven progress chains

`types.ts` confirms the persisted building fields used by this system:

- `isConstructing`
- `constructionEndTime`
- `workState`
- `workEndTime`
- `isDestroying`
- `destructionEndTime`
- `destructionStartedAt`
- `destructionExpiresAt`
- `destructionDurationMs`
- `destructionMaxLifetimeMs`
- `lastAttackTime`
- `lastMoveTime`
- `protectionEndTime`

## Unconfirmed Details

- A dedicated `building.status` state machine is not required by the current source to explain the observed lifecycle.
- The current source does not prove that every create / update failure path has a full UI rollback.
- The current source does not prove a separate `constructionStartTime` persistence field; that timestamp is only visible in runtime traces.
