# Scenario 8 Repeatability

Task authority:

- `specs/002-characterization-tests/tasks.md` T093
- `tests/characterization/slice-c/scenario-08-fixture.json`
- `tests/characterization/slice-c/scenario-08-source-audit.md`
- `tests/characterization/slice-c/scenario-08-classification.md`
- `tests/characterization/slice-c/scenario-08-seam.md`
- `tests/characterization/slice-c/scenario-08-replay-evidence.md`
- `tests/characterization/slice-c/scenario-08-promotion.md`
- `tests/characterization/slice-c/scenario-08.mjs`
- `src/game/buildings/resolveRejectedOptimisticPlacementRollback.js`

Scenario wording:

"Rejected optimistic building placement restores the pre-command state."

Broad classification:

`UNCONFIRMED_RUNTIME_BEHAVIOR`

Accepted repeatability scope:

Only the pure rejected-placement rollback projection seam.

## Repeatability Model

The scenario uses two repeatability units:

- `scenarioExecution1`
- `scenarioExecution2`

Each complete scenario execution contains two intra-execution stages:

- `firstPass`
- `secondPass`

`firstPass` and `secondPass` are not the repeatability runs themselves.

## Command

The repeatability check ran from the real characterization script:

```text
node tests/characterization/slice-c/scenario-08.mjs
node tests/characterization/slice-c/scenario-08.mjs
```

## Baseline Result

Observed repeatability result:

- Scenario Execution 1: PASS
- Scenario Execution 2: PASS
- comparison: IDENTICAL
- `productionSourceExecution = true`
- `sourceBoundaryExecuted = true`

## First Pass

The first pass starts from the frozen optimistic placement state and proves the
actual rollback projection:

- `decision = rollback_rejected_placement`
- `restored = true`
- `blocked = false`
- `blockedReason = undefined`
- `removeTemporaryBuilding = true`
- projected buildings exactly match `fixture.restoredState.currentBuildings`
- projected resource restoration exactly matches the fixture expectation
- the temporary building is removed
- the unrelated building remains unchanged
- the input objects remain unchanged

Observed projected resource restoration:

- `goldDelta = 1250`
- `rubiesDelta = 0`
- `inventoryDeltas = { 10001: 3, 10002: 1 }`

## Second Pass

The second pass uses the already-restored output from the first pass:

- `decision = no_rollback`
- `restored = false`
- `blocked = false`
- `blockedReason = undefined`
- `removeTemporaryBuilding = false`
- projected buildings remain unchanged
- projected resource restoration is zero / empty
- no second rollback occurs
- no second resource restoration occurs
- unrelated state remains unchanged

## Protected State

The repeatability proof preserves the same protected state accepted by the
fixture and replay evidence:

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

## Unrelated Fields

Unchanged unrelated fields remain:

- `buildings[0].tag`
- `resourceState.cosmeticFlag`

## Control Summary

The control matrix remains fail-closed and helper-backed.

Helper-executed controls:

- `missing-rollback-identity` -> `BLOCKED / missing-rollback-identity`
- `missing-optimistic-building` -> `BLOCKED / missing-optimistic-building`
- `missing-current-buildings` -> `BLOCKED / missing-current-buildings`
- `missing-resource-deltas` -> `BLOCKED / missing-resource-deltas`
- `invalid-optimistic-placement-state` -> `BLOCKED / invalid-optimistic-placement-state`
- `rollback-identity-mismatch` -> `BLOCKED / rollback-identity-mismatch`
- `already-restored` -> `PASS / no_rollback`
- `second-pass-rolls-back-again` -> `FAIL / unexpected-helper-result`
- `restored-state-regresses` -> `FAIL / unexpected-helper-result`
- `unrelated-building-changed` -> `FAIL / unexpected-helper-result`
- `unrelated-resource-field-changed` -> `FAIL / unexpected-helper-result`

Boundary-blocked controls remain blocked before helper execution:

- `production-boundary-not-available`
- `live-pocketbase-required`
- `timeout-order-required`
- `reconnect-order-required`

## Exit Behavior

The repeatability script fails closed:

- unexpected PASS exits nonzero
- wrong reason exits nonzero
- wrong productionSourceExecution exits nonzero
- wrong sourceBoundaryExecuted exits nonzero
- unknown controls exit nonzero

## Exclusions

This repeatability proof does not claim:

- PocketBase rollback
- actual React state restoration
- server create rejection correctness
- timeout handling
- reconnect ordering
- stale snapshot convergence
- duplicate backend-create prevention
- cross-client authority
- broad Scenario 8 behavior

## Residual Limitations

The repeatability note proves only the narrow pure rollback projection seam.
It does not prove:

- persistence rollback exactly once
- server create failure correctness
- lost-response recovery
- retry idempotency
- duplicate backend-create prevention
- stale snapshot convergence
- cross-client authority
- coordinate occupancy fencing
- cost / create transactionality

## Final Status

- Scenario Execution 1: PASS
- Scenario Execution 2: PASS
- comparison: IDENTICAL
- helper purity: proven by source and replay
- caller-owned side effects: remain outside replay
- broad Scenario 8: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- T093 remains the repeatability record for the accepted narrow rollback seam
