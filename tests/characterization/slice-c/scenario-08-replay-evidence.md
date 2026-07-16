# Scenario 8 Replay Evidence

Task authority:

- `specs/002-characterization-tests/tasks.md` T090
- `tests/characterization/slice-c/scenario-08-fixture.json`
- `tests/characterization/slice-c/scenario-08-source-audit.md`
- `tests/characterization/slice-c/scenario-08-classification.md`
- `tests/characterization/slice-c/scenario-08-seam.md`
- `src/game/buildings/resolveRejectedOptimisticPlacementRollback.js`
- `tests/characterization/slice-c/scenario-08-rollback-seam.mjs`
- `App.tsx` rollback delegation point around `placeBuildingAtTile(...)`

Scenario wording:

"Rejected optimistic building placement restores the pre-command state."

Broad classification:

`UNCONFIRMED_RUNTIME_BEHAVIOR`

Accepted replay scope:

Only the pure rejected-placement rollback projection seam.

## Helper And Fixture

- Helper path: `src/game/buildings/resolveRejectedOptimisticPlacementRollback.js`
- Fixture path: `tests/characterization/slice-c/scenario-08-fixture.json`

The replay imports the real helper directly and loads the real fixture directly.
No rollback logic is copied or reimplemented.

## Replay Shape

One complete scenario execution contains two intra-execution stages:

- `firstPass`
- `secondPass`

Repeatability units are:

- `scenarioExecution1`
- `scenarioExecution2`

`firstPass` and `secondPass` are not separate repeatability executions.

## First Pass

First-pass input from the frozen fixture:

- `currentBuildings`
- `optimisticBuilding`
- `spentResourceDeltas`
- `rollbackIdentity`
- `alreadyRestored = false`

Observed first-pass result:

- `decision = rollback_rejected_placement`
- `restored = true`
- `blocked = false`
- `blockedReason = undefined`
- `removeTemporaryBuilding = true`
- `projectedBuildings` exactly matches `fixture.restoredState.currentBuildings`
- the temporary building is absent from the projection
- the unrelated building is unchanged
- `projectedResourceRestoration` exactly matches the fixture expectation
- input objects remain unchanged

Observed projected resource restoration:

- `goldDelta = 1250`
- `rubiesDelta = 0`
- `inventoryDeltas = { 10001: 3, 10002: 1 }`

Observed restored state:

- temporary building removed
- unrelated building preserved
- resource restoration projected exactly
- no synthetic rollback marker added

## Second Pass

Second-pass input:

- unchanged deep clone of `firstPass.projectedBuildings`
- same optimistic building as required by the helper API
- same spent resource deltas
- same rollback identity
- `alreadyRestored = true`

Observed second-pass result:

- `decision = no_rollback`
- `restored = false`
- `blocked = false`
- `blockedReason = undefined`
- `removeTemporaryBuilding = false`
- projected buildings remain unchanged
- projected resource restoration is zero / empty
- no second resource restoration occurs
- no second temporary removal occurs
- unrelated state remains unchanged

## Two-Execution Replay

Temporary one-shot helper-backed execution summary:

- Scenario Execution 1: PASS
- Scenario Execution 2: PASS
- comparison: IDENTICAL
- `productionSourceExecution = true`
- `sourceBoundaryExecuted = true`

## Protected State

The replay protects the fixture-proven state below:

- `buildings[0].id`
- `buildings[0].buildingId`
- `buildings[0].ownerId`
- `buildings[0].ownerName`
- `buildings[0].x`
- `buildings[0].y`
- `buildings[0].zoneId`
- `buildings[0].status`
- `buildings[0].syncState`
- `buildings[0].isConstructing`
- `buildings[0].constructionEndTime`
- `buildings[0].workState`
- `buildings[0].hp`
- `buildings[0].maxHp`
- `buildings[0].pendingDamage`
- `buildings[0].isLocal`
- `buildings[0].timestamp`
- `projectedResourceRestoration.goldDelta`
- `projectedResourceRestoration.rubiesDelta`
- `projectedResourceRestoration.inventoryDeltas`
- `removeTemporaryBuilding`
- `decision`
- `restored`

## Unrelated Fields Proven Unchanged

- `buildings[0].tag`
- `resourceState.cosmeticFlag`

## Focused Seam Test Evidence

The focused seam test proves the helper-backed negative cases below. Each case
executes the real helper and reports the exact blocked reason from the helper
contract:

| Control | Expected status | Expected reason |
| --- | --- | --- |
| `missing-rollback-identity` | `BLOCKED` | `missing-rollback-identity` |
| `missing-optimistic-building` | `BLOCKED` | `missing-optimistic-building` |
| `missing-current-buildings` | `BLOCKED` | `missing-current-buildings` |
| `missing-resource-deltas` | `BLOCKED` | `missing-resource-deltas` |
| `invalid-optimistic-placement-state` | `BLOCKED` | `invalid-optimistic-placement-state` |
| `rollback-identity-mismatch` | `BLOCKED` | `rollback-identity-mismatch` |

The focused seam test also proves the positive idempotency case:

- `already-restored` -> `no_rollback`
- `restored = false`
- `blocked = false`
- `removeTemporaryBuilding = false`

Declarative boundary-blocked controls remain blocked in the fixture and are not
executed in this replay pass:

- `production-boundary-not-available`
- `live-pocketbase-required`
- `timeout-order-required`
- `reconnect-order-required`

## Caller-Owned Side Effects Outside Replay

The replay does not own:

- `updatePlayerResourcesRef.current(...)`
- `setPlacedBuildings(...)`
- PocketBase writes
- refs / cache cleanup
- logging / traces
- error UI
- retries
- realtime
- reconnect
- snapshot merge

## Explicit Exclusions

This replay does not claim:

- live PocketBase rollback
- timeout correctness
- reconnect convergence
- stale snapshot resolution
- duplicate server-create prevention
- multi-client authority
- coordinate fencing
- server transactionality
- actual React state restoration

## Residual Limitations

This replay proves only the narrow pure rollback projection seam. It does not
prove:

- persistence rollback exactly once
- server create failure correctness
- lost-response recovery
- retry idempotency
- duplicate backend-create prevention
- stale snapshot convergence
- cross-client authority
- coordinate occupancy fencing
- cost / create transactionality
- broad Scenario 8 behavior

## Validation

Commands run for this evidence pass:

- `node` one-shot helper summary importing `src/game/buildings/resolveRejectedOptimisticPlacementRollback.js` and loading `tests/characterization/slice-c/scenario-08-fixture.json`
- `node tests/characterization/slice-c/scenario-08-rollback-seam.mjs`
- `node --check tests/characterization/slice-c/scenario-08-rollback-seam.mjs`
- `node --check src/game/buildings/resolveRejectedOptimisticPlacementRollback.js`
- `npm run lint`
- `node check_regressions_worker6.mjs`
- `git diff --check`
- `git status --short --untracked-files=all`

Results:

- helper-backed summary: PASS
- seam test: PASS
- both `--check` runs: PASS
- lint: PASS
- regression checks: PASS 9/9
- `git diff --check`: clean
- `git status`: only the expected Scenario 8 documentation/data work in progress

## Final Status

- Scenario Execution 1: PASS
- Scenario Execution 2: PASS
- comparison: IDENTICAL
- helper purity: proven by source and replay
- caller-owned side effects: remain outside replay
- broad Scenario 8: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- owner acceptance: not recorded yet
- T090 remains unpromoted until T091
