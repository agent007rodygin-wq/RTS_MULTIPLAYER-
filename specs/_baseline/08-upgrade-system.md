# 08. Upgrade System

## Scope And Evidence

This document covers the building upgrade path and the construction-speed-up helper that ends construction early.
Graphify was used only as a navigation map. Every claim below is verified directly from the current source snapshot.

Main sources:

- `App.tsx`
- `types.ts`
- `data/buildings.ts`
- `src/pocketbase.ts`

## Confirmed Upgrade-Related Entry Points

| Entry point | Approx. lines | Purpose | Confidence |
| --- | --- | --- | --- |
| `handleUpgrade` | `14461-14610` | Upgrades the selected building to its `upgradesTo` target using construction semantics | `CONFIRMED_BY_SOURCE` |
| `handleSpeedUp` | `16123-16185` | Ends construction early and rolls back only on the confirmed not-found path | `CONFIRMED_BY_SOURCE` |
| `processOfflineTimers` | `627-860` | Completes overdue construction while offline, which also covers upgrades | `CONFIRMED_BY_SOURCE` |
| `ConstructionTimer` | `2496-2520` | Renders the countdown for any building whose `constructionEndTime` is active | `CONFIRMED_BY_SOURCE` |

## Confirmed Upgrade State Model

| State / field combo | Meaning in current source | Evidence | Confidence |
| --- | --- | --- | --- |
| Upgrade queued | The selected building is rewritten to the upgraded `buildingId` and marked `isConstructing: true` | `handleUpgrade` | `CONFIRMED_BY_SOURCE` |
| Upgrade countdown active | `isConstructing === true` and `constructionEndTime` is in the future | `handleUpgrade`, `ConstructionTimer`, `processOfflineTimers` | `CONFIRMED_BY_SOURCE` |
| Upgrade complete / active | The upgraded building keeps the new `buildingId` and new durability values after completion | `handleUpgrade`, offline completion path | `CONFIRMED_BY_SOURCE` |
| Speed-up pending | Construction is locally cleared and the building is put back into idle state before the write returns | `handleSpeedUp` | `CONFIRMED_BY_SOURCE` |

## Building Upgrade Flow

### Confirmed inputs

- `selectedBuilding`
- `currentBuildingInfo.upgradesTo`
- `currentBuildingInfo.upgradeCost`
- `newBuildingInfo.stats.constructionTimeSeconds`
- `newBuildingInfo.constructionRequirements.population`
- `newBuildingInfo.constructionRequirements.resources`
- `playerGold`
- `currentPopulation`
- `maxPopulation`
- `inventory`

### Confirmed behavior

| Step | Reads | Writes | Effects | Confidence |
| --- | --- | --- | --- | --- |
| Resolve target | Current building metadata | None yet | Finds the target building definition and its cost | `CONFIRMED_BY_SOURCE` |
| Validate requirements | Gold, population, inventory, target info | None yet | Rejects upgrades that cannot be paid or staffed | `CONFIRMED_BY_SOURCE` |
| Compute deadline | `Date.now()`, target construction seconds | `upgradeStartedAt`, `upgradeConstructionEndTime` | Reuses construction timing for the upgrade | `CONFIRMED_BY_SOURCE` |
| Deduct payment | `updatePlayerResources` | Gold and any required inventory deltas | Charges the player immediately | `CONFIRMED_BY_SOURCE` |
| Optimistically rewrite building | Selected building record | `buildingId`, `isConstructing`, `constructionEndTime`, `lastAttackTime`, `type`, `hp`, `maxHp`, destruction reset fields | Shows the upgraded building immediately in the client | `CONFIRMED_BY_SOURCE` |
| Persist to PocketBase | Building doc id | `updateDoc(...buildings...)` | Mirrors the optimistic upgrade in the backend | `CONFIRMED_BY_SOURCE` |

The upgrade path explicitly clears destruction-related fields and resets `pendingDamage` and `initiatorId`.
The source does not define a separate upgrade flag; upgrade is modeled as construction on the upgraded building record.

## Speed-Up Flow

| Step | Reads | Writes | Effects | Confidence |
| --- | --- | --- | --- | --- |
| Duplicate-click guard | `speedUpInFlightRef`, `buildingDocId` | None yet | Prevents concurrent speed-up writes for the same building | `CONFIRMED_BY_SOURCE` |
| Ruby affordability | `playerRubies`, `accelerationCost` | None yet | Opens a warning modal if the player cannot pay | `CONFIRMED_BY_SOURCE` |
| Local early finish | Current selected building | `isConstructing: false`, `constructionEndTime: undefined`, `workState: 'idle'` | Makes the construction end immediately in the UI | `CONFIRMED_BY_SOURCE` |
| Persist early finish | Building doc id | `updateDoc(..., { isConstructing: false, constructionEndTime: deleteField(), workState: 'idle' })` | Mirrors the local finish in PocketBase | `CONFIRMED_BY_SOURCE` |
| Not-found rollback | Missing building error | Restore rubies, remove local building, clear selection | Rolls back the ruby spend if the building was already gone | `CONFIRMED_BY_SOURCE` |
| General failure path | Other update errors | `handleFirestoreError` only | The source does not prove a full rollback for all other failures | `PARTIALLY_CONFIRMED` |

## Shared And Divergent Logic

| Topic | Confirmed status | Notes | Confidence |
| --- | --- | --- | --- |
| Construction semantics | Shared | Upgrade reuses `isConstructing` and `constructionEndTime` | `CONFIRMED_BY_SOURCE` |
| Timer rendering | Shared | The countdown UI is driven by the same construction end timestamp | `CONFIRMED_BY_SOURCE` |
| Resource refund behavior | Divergent | Generic upgrade rollback is not fully proven; speed-up has a specific not-found refund path | `PARTIALLY_CONFIRMED` |
| Weapon upgrade path | Unconfirmed | No dedicated weapon-upgrade handler was found in the audited source | `UNCONFIRMED` |

## Current Config Notes

`data/buildings.ts` supplies the upgrade target, cost, and construction duration used by `handleUpgrade`.
`types.ts` confirms the building fields that are mutated during upgrade and speed-up: `isConstructing`, `constructionEndTime`, `workState`, `lastAttackTime`, `hp`, `maxHp`, and the destruction-state fields.

## Unconfirmed Details

- whether every failed upgrade path fully restores the exact pre-upgrade local state
- whether the upgraded building ever preserves any previous `workState` or production progress in cases not inspected here
- whether a separate weapon-upgrade flow exists elsewhere in legacy code or inactive files
- whether runtime snapshot ordering can briefly show the old building after the optimistic rewrite

## Summary

The current source shows that building upgrades are construction-shaped state transitions, not a distinct lifecycle.
`handleSpeedUp` is the only upgrade-adjacent helper with a clearly confirmed rollback path, and that rollback is limited to the not-found case.
This document is sufficient for the next SDD stage, but not for implementation.
