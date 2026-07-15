# Scenario 5 Promotion

Task authority: `T067` in `specs/002-characterization-tests/tasks.md`

Scenario wording:

`Construction state survives reload and converges from persisted end time.`

Owner decision:

The observed narrow Scenario 5 construction-convergence contract is accepted as
`CURRENT_ACCEPTED_BEHAVIOR`.

Accepted narrow contract:

`After an already-expired persisted construction process is replayed by offline catch-up, the local construction completion transition occurs once. Replaying the same unchanged completed state again produces no second local construction completion transition.`

## Evidence Basis

- Replay evidence: `tests/characterization/slice-b/scenario-05-replay-evidence.md`
- Fixture: `tests/characterization/slice-b/scenario-05-fixture.json`
- Source audit: `tests/characterization/slice-b/scenario-05-source-audit.md`
- Classification: `tests/characterization/slice-b/scenario-05-classification.md`
- Seam decision: `tests/characterization/slice-b/scenario-05-seam.md`

The acceptance is grounded entirely in that existing Scenario 5 evidence.

## Acceptance Summary

- Scenario Execution 1: `PASS`
- Scenario Execution 2: `PASS`
- comparison: `IDENTICAL`
- firstPass: `complete_construction`
- secondPass: `no_completion`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`

## Protected Fields

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
- the second-pass `completed` flag is `false`
- unrelated fields remain unchanged

## Explicit Exclusions

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
- broader persisted-process guarantees

## Scope Statement

This acceptance is local and construction-only.
It does not imply server atomicity.
It does not imply cross-device locking.
It does not imply cross-reload protection.
It does not imply reward atomicity.
It does not promote the broader Scenario 5 contract.

The broad Scenario 5 wording remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside
this narrow accepted subcase.

## Task State

- `T067` complete: `yes`
- `T068` remains open: `yes`
