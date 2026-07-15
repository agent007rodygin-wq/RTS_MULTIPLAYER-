# Scenario 5 Replay Evidence

Task authority: `T066` in `specs/002-characterization-tests/tasks.md`

Scenario wording:

`Construction state survives reload and converges from persisted end time.`

This note is a blocked-boundary audit. It is grounded in the existing fixture,
source audit, classification, and seam decision, but it does **not** claim a
successful executable replay yet.

## Evidence Basis

- Fixture: `tests/characterization/slice-b/scenario-05-fixture.json`
- Source audit: `tests/characterization/slice-b/scenario-05-source-audit.md`
- Classification: `tests/characterization/slice-b/scenario-05-classification.md`
- Seam decision: `tests/characterization/slice-b/scenario-05-seam.md`

## Boundary Status

- Broad scenario: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Seam outcome: `MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`
- Production source execution: `false`
- Source boundary executed: `false`
- Replay result: `BLOCKED`

The current source does not expose a single importable pure boundary for the
full reload-convergence decision. `App.tsx` still owns the orchestration and
write side effects, while `src/pocketbase.ts` owns the persistence transport.
That means a deterministic replay cannot honestly be claimed yet without a
later seam implementation task.

## Fixture-Backed Intended Shape

The fixture models the narrow construction-convergence contract only:

- deterministic frozen clock
- expired persisted construction state
- first pass completes construction locally
- second pass over the unchanged completed state returns `no_completion`
- protected fields remain stable
- unrelated fields remain unchanged

Expected two-execution repeatability shape, once an executable boundary exists:

- `scenarioExecution1.firstPass`: `complete_construction`
- `scenarioExecution1.secondPass`: `no_completion`
- `scenarioExecution2.firstPass`: `complete_construction`
- `scenarioExecution2.secondPass`: `no_completion`
- expected comparison: `IDENTICAL`

These are the intended replay semantics derived from the fixture. They were not
executed in this pass.

## Protected Fields

- `isConstructing`
- `workState`
- `constructionEndTime`
- `hp`
- `maxHp`
- `pendingDamage`

## Unrelated Fields

- `buildingId`
- `ownerId`
- `zoneId`
- `x`
- `y`
- `isLocal`
- `constructionDurationMs`
- `constructionMaxLifetimeMs`
- `timestamp`

## Explicit Exclusions

- reward delivery
- inventory/resource changes
- PocketBase writes
- realtime ordering
- reconnect ordering
- stale snapshot convergence
- duplicate-write prevention
- multi-client authority
- upgrade completion
- production completion
- destruction completion
- generic timer behavior
- broad persisted-process guarantees

## Controls

The fixture and seam decision define the following expected control outcomes
for a future executable replay path, but they were **not behaviorally
executed** in this pass:

- `completion-time-not-reached`: blocked at the missing executable boundary
- `missing-identity`: blocked at the missing executable boundary
- `second-pass-completes-again`: blocked at the missing executable boundary
- `completed-fields-regress`: blocked at the missing executable boundary
- `unrelated-field-changed`: blocked at the missing executable boundary
- `production-boundary-not-available`: blocked at the missing executable
  boundary
- unknown controls: should remain non-zero once a runnable boundary exists

## Why This Remains Blocked

- The seam decision still requires a minimal owner-approved construction-
  convergence seam.
- No replay script has been introduced for this task.
- No production boundary was executed in this pass.
- The source / adapter boundary remains split across `App.tsx` and
  `src/pocketbase.ts`.

## Known Limitations

- This note does not prove runtime behavior.
- This note does not establish replay evidence.
- This note does not claim owner acceptance.
- This note does not promote the broad Scenario 5 contract.

## Task State

- `T066` complete: `yes`
- `T066` blocked: `yes`
- `T067` remains open: `yes`
