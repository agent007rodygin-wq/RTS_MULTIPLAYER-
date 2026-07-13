# 07. Production System

## Scope And Evidence

This document covers the active production lifecycle: start, completion, collection, reward delivery, and local reconciliation.
Graphify was used only to find the relevant source paths. Every claim below is backed by the current source code.

Main sources:

- `App.tsx`
- `types.ts`
- `data/buildings.ts`
- `src/pocketbase.ts`

## Confirmed Entry Points

| Entry point | Approx. lines | What it does | Confidence |
| --- | --- | --- | --- |
| `handleStartProductionFromWorld` | `14618-14677` | Starts production directly from a world click on a building | `CONFIRMED_BY_SOURCE` |
| `handleStartProduction` | `148?` / `15028-15057` | Starts production from the selected-building panel | `CONFIRMED_BY_SOURCE` |
| `handleCollectProductionFromWorld` | `14678-14984` | Collects production directly from a world click | `CONFIRMED_BY_SOURCE` |
| `handleCollectProduction` | `15063-15590` | Collects production from the selected-building panel | `CONFIRMED_BY_SOURCE` |
| Manual production loop | `15252-15280` | Marks overdue working buildings as finished every second | `CONFIRMED_BY_SOURCE` |
| `processOfflineTimers` | `624-760` | Completes overdue production while the player is offline | `CONFIRMED_BY_SOURCE` |

## Confirmed Production States

| State | Field combo | Meaning | Confidence |
| --- | --- | --- | --- |
| Idle | `workState === 'idle'` | The building is not currently producing | `CONFIRMED_BY_SOURCE` |
| Working | `workState === 'working'` and `workEndTime` is in the future | Production is running | `CONFIRMED_BY_SOURCE` |
| Finished | `workState === 'finished'` | The reward is ready to collect | `CONFIRMED_BY_SOURCE` |
| Reset to idle | `workState === 'idle'`, `workEndTime` cleared | Collection completed or the chain advanced to its next state | `CONFIRMED_BY_SOURCE` |

## Production Start

### Confirmed inputs

- `info.stats.workTimeSeconds`
- `info.stats.takesPopulation`
- `info.stats.consumes`
- `building.isConstructing`
- `isBanditCastleBuildingId(building.buildingId)`
- `currentPopulation` and `maxPopulation`
- `inventory`

### Confirmed behavior

| Step | Reads | Writes | Effects | Confidence |
| --- | --- | --- | --- | --- |
| Guard conditions | `building.isConstructing`, bandit-castle check, population, inventory | None yet | Rejects invalid start attempts | `CONFIRMED_BY_SOURCE` |
| Compute timing | `Date.now()`, `info.stats.workTimeSeconds` | `workStartTime` trace value, `workEndTime` | Creates the production deadline in ms | `CONFIRMED_BY_SOURCE` |
| Start locally first | `building.id`, `selectedBuilding` or world object | `workState: 'working'`, `workEndTime`, `isLocal: true` | Production starts immediately in the UI | `CONFIRMED_BY_SOURCE` |
| Persist start | `buildingDocId` | `updateDoc(..., { workState: 'working', workEndTime })` | Mirrors the local start in PocketBase | `CONFIRMED_BY_SOURCE` |

The inspected source confirms that production start is blocked while the building is constructing.
The inspected source does not explicitly prove an `isDestroying` guard in the start path, so that part remains `UNCONFIRMED`.

## Production Rewards

| Reward source | Confirmed use | Notes | Confidence |
| --- | --- | --- | --- |
| `workYieldGold` | Yes | Used to compute the gold reward for work-based buildings | `CONFIRMED_BY_SOURCE` |
| `produces` | Yes | Adds guaranteed item rewards to `inventoryDeltas` | `CONFIRMED_BY_SOURCE` |
| `sometimesProduces` | Yes | Adds probabilistic item rewards to `inventoryDeltas` | `CONFIRMED_BY_SOURCE` |
| `consumes` | Yes | Deducted at start time, not at collection time | `CONFIRMED_BY_SOURCE` |
| `givesCoins` | Not proven as a separate payout branch in the inspected path | Present in the active config and the UI, but the reward handler we inspected uses `workYieldGold` for gold payout | `PARTIALLY_CONFIRMED` |
| Bandit-castle tax share | Yes | Watchtowers can redirect part of the gold reward to a bandit castle bank | `CONFIRMED_BY_SOURCE` |

Reward delivery sequence:

`production complete`
`-> compute goldShare / taxShare`
`-> compute produces / sometimesProduces`
`-> updatePlayerResources`
`-> clear workState and workEndTime`
`-> optional buildingId transformation on collection`
`-> PocketBase update`

## Collection Paths

| Path | What is written | Special behavior | Confidence |
| --- | --- | --- | --- |
| `handleCollectProductionFromWorld` | `workState: 'idle'`, `workEndTime: deleteField()` | Direct-world collection path; used by lilies, mushrooms, and similar direct-interaction buildings | `CONFIRMED_BY_SOURCE` |
| `handleCollectProduction` | `workState: 'idle'`, `workEndTime: deleteField()` | Selected-building path; can also advance some buildings to a next `buildingId` | `CONFIRMED_BY_SOURCE` |

Some production chains are not simple "collect and stop" flows. The current source confirms that a few building ids are advanced to another id during collection, which makes the production system part of a larger progression chain.

## Manual And Offline Completion

| Completion path | Reads | Writes | Confidence |
| --- | --- | --- | --- |
| Manual production loop | `placedBuildingsRef.current`, `workState`, `workEndTime`, `Date.now()` | Marks a building as finished in the UI and updates PocketBase to `workState: 'finished'`, `workEndTime: deleteField()` | `CONFIRMED_BY_SOURCE` |
| Offline timer reconciliation | `processOfflineTimers` | Marks overdue work as finished when the player returns | `CONFIRMED_BY_SOURCE` |

The manual loop runs every second.
The offline path runs when the client processes a building snapshot or catch-up pass.

## Reconciliation And Safety

- `lastInteractionRef` records the local action start time so stale snapshots are less likely to overwrite a freshly started production.
- `SERVER_FRESHNESS_MS` is used in the game loop to avoid auto-completing timers when the latest server snapshot is too old.
- direct-interaction factories can open the menu or collect from the world depending on `workState`
- the audited source does not prove a dedicated, full rollback for every production failure case

## Unconfirmed Details

- The inspected source does not prove that every production start path blocks `isDestroying`.
- The inspected source does not prove that every reward path is exactly-once under all retry / reconnect sequences.
- The inspected source does not prove that `givesCoins` is a separate runtime payout branch.

## Current Config Evidence

`data/buildings.ts` confirms that the active content includes:

- production buildings with `workTimeSeconds`
- reward-bearing buildings with `produces` and `sometimesProduces`
- input-driven production buildings with `consumes`
- direct-interaction buildings that use the same work-state lifecycle but different UI entry points

`types.ts` confirms the runtime fields used by this system:

- `workState`
- `workEndTime`
- `isConstructing`
- `constructionEndTime`
- `lastAttackTime`
- `lastMoveTime`
- `isDestroying`
- `destructionEndTime`

## Summary

The active source supports a single production lifecycle with two entry points and two completion paths:

- active play: start from the UI, finish in the game loop, collect from the world or panel
- offline play: `processOfflineTimers` marks overdue work as finished, then the player collects later
