# Scenario 4 Owner Acceptance

Task authority: `T059` in `specs/002-characterization-tests/tasks.md`

Accepted contract:

`After an already-expired persisted construction process is replayed by the offline catch-up path, the local construction completion transition occurs once. Replaying the same unchanged completed state again produces no second local construction completion transition.`

## Final Classification

`CURRENT_ACCEPTED_BEHAVIOR`

## Evidence Basis

- production helper: `src/game/buildings/resolveLocalConstructionCompletion.js`
- Scenario Execution 1: `PASS`
- Scenario Execution 2: `PASS`
- comparison: `IDENTICAL`
- in both executions:
  - `firstPass = complete_construction`
  - `secondPass = no_completion`
  - `productionSourceExecution = true`
  - `sourceBoundaryExecuted = true`

## Accepted Fields

Acceptance is limited to the fields proven by replay:

- `isConstructing`
- `workState`
- `constructionEndTime`
- `hp`
- `maxHp`
- `pendingDamage`

## Accepted Second-Pass Behavior

- the completed first-pass output is processed again unchanged
- no second local construction completion occurs
- the second-pass decision is `no_completion`
- `completed = false`

## Unchanged Fields

Unrelated fields remained unchanged in both complete scenario executions.

## Deferred Contracts

Explicitly deferred and unaccepted:

- reward delivery
- reward exactly-once
- inventory/resource updates
- PocketBase persistence success
- duplicate-write prevention
- completion side-effect exactly-once
- reload/reconnect idempotency
- realtime ordering
- stale-snapshot convergence
- multi-client authority
- upgrade completion
- production completion
- destruction completion
- generic timer behavior
- broad Scenario 4 behavior

## Scope Note

This acceptance is local and construction-only.
It does not imply:

- server atomicity
- cross-device locking
- cross-reload protection
- reward atomicity
- exactly-once completion outside the local construction transition

The broader Scenario 4 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside this
narrow construction-only subcase.

## Owner Decision

The owner accepts only the narrow local transition behavior above. The broader
scenario remains open for later investigation.
