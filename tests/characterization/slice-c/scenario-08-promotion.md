# Scenario 8 Promotion

Task authority:

- `specs/002-characterization-tests/tasks.md` T091
- `tests/characterization/slice-c/scenario-08-source-audit.md`
- `tests/characterization/slice-c/scenario-08-classification.md`
- `tests/characterization/slice-c/scenario-08-seam.md`
- `tests/characterization/slice-c/scenario-08-fixture.json`
- `tests/characterization/slice-c/scenario-08-replay-evidence.md`
- `src/game/buildings/resolveRejectedOptimisticPlacementRollback.js`
- `tests/characterization/slice-c/scenario-08-rollback-seam.mjs`
- `App.tsx` rollback delegation point around `placeBuildingAtTile(...)`

Scenario wording:

"Rejected optimistic building placement restores the pre-command state."

Final narrow classification:

`CURRENT_ACCEPTED_BEHAVIOR`

Broad Scenario 8 classification remains:

`UNCONFIRMED_RUNTIME_BEHAVIOR`

## Accepted Contract

The owner accepts only the narrow pure rollback projection seam:

- a rejected optimistic building placement removes only its temporary optimistic building;
- the exact resource deltas spent for that placement are projected back;
- processing the same already-restored state again produces no second rollback and no second resource restoration.

## Evidence Basis

- `T113` pure importable helper exists;
- `App.tsx` delegates only rollback projection to the helper;
- `productionSourceExecution = true`;
- `sourceBoundaryExecuted = true`;
- `Scenario Execution 1 = PASS`;
- `Scenario Execution 2 = PASS`;
- `comparison = IDENTICAL`;
- `first pass = rollback_rejected_placement`;
- `second pass = no_rollback`.

## Accepted First-Pass Behavior

- `restored = true`
- `blocked = false`
- `removeTemporaryBuilding = true`
- only the matching temporary optimistic building is removed
- unrelated buildings remain unchanged
- projected resource restoration exactly matches the fixture
- inputs remain unchanged

Accepted restoration values:

- `goldDelta = 1250`
- `rubiesDelta = 0`
- `inventoryDeltas = { 10001: 3, 10002: 1 }`

## Accepted Second-Pass Behavior

- `decision = no_rollback`
- `restored = false`
- `blocked = false`
- `removeTemporaryBuilding = false`
- projected buildings remain unchanged
- projected resource restoration is zero / empty
- no second rollback occurs
- no second resource restoration occurs

## Protected State

The owner accepts the protected state proven by the replay:

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

## Unrelated State Proven Unchanged

- `buildings[0].tag`
- `resourceState.cosmeticFlag`

## Negative Helper Validations Proven

The focused seam test proved the helper-backed blocked cases with exact helper
decision / blocked reason names:

- `missing-rollback-identity` -> `blocked_missing_rollback_identity` / `missing-rollback-identity`
- `missing-optimistic-building` -> `blocked_missing_optimistic_building` / `missing-optimistic-building`
- `missing-current-buildings` -> `blocked_missing_current_buildings` / `missing-current-buildings`
- `missing-resource-deltas` -> `blocked_missing_resource_deltas` / `missing-resource-deltas`
- `invalid-optimistic-placement-state` -> `blocked_invalid_placement_state` / `invalid-optimistic-placement-state`
- `rollback-identity-mismatch` -> `blocked_identity_mismatch` / `rollback-identity-mismatch`

The same focused seam test also proved the positive idempotency case:

- `already-restored` -> `no_rollback`
- `restored = false`
- `blocked = false`
- `removeTemporaryBuilding = false`

## Why This Is CURRENT_ACCEPTED_BEHAVIOR

This is not `LEGACY_COMPATIBILITY_BEHAVIOR` because the accepted behavior is the
active narrow rollback projection for the current optimistic placement flow, not
an old compatibility path.

It is not `KNOWN_BUG_DO_NOT_FREEZE` because no concrete active bug report was
found for the exact narrow contract.

It is not `UNCONFIRMED_RUNTIME_BEHAVIOR` because controlled evidence now exists:
the real helper executed, the replay passed twice, and the scenario comparison
was identical.

It is not `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` because the owner has now
explicitly accepted this narrow projection contract.

## Explicit Owner Acceptance

The owner accepts only the narrow pure rollback projection contract and nothing
broader.

## Caller-Owned Behavior Outside Acceptance

The acceptance does not cover:

- actual `updatePlayerResourcesRef.current(...)` refund execution
- `React.setPlacedBuildings(...)`
- PocketBase writes
- refs / cache cleanup
- logging / traces
- error UI
- retries
- subscriptions
- realtime
- reconnect
- snapshot merge
- timeout handling
- server-record cleanup

## Explicit Exclusions

The acceptance does not prove:

- persistence rollback exactly once
- server create rejection correctness
- timeout correctness
- lost-response recovery
- retry idempotency
- duplicate backend-create prevention
- stale snapshot convergence
- cross-client authority
- coordinate occupancy fencing
- cost / create transactionality
- actual React state restoration
- broad Scenario 8 behavior

## Status

- T090 replay evidence remains the source for the narrow acceptance
- T091 records the owner acceptance and final promotion decision
- Scenario 8 broad behavior remains `UNCONFIRMED_RUNTIME_BEHAVIOR`
