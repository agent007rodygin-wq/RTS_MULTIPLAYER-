# Scenario 3 Construction-Completion Invariants

Task authority: `T054` in `specs/002-characterization-tests/tasks.md`

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

After an expired persisted construction process is completed locally,
processing the same unchanged expired construction state again does not
perform the construction completion transition a second time.

This is the narrow accepted Scenario 3 contract only.

## State Transition Invariants

- `isConstructing`: `true -> false`
- `workState`: `constructing -> idle`

## Construction Timer Invariants

- `constructionEndTime` remains unchanged after completion

## Completion Decision Invariants

- first pass:
  - `decision == complete_construction`
  - `completed == true`
- second pass:
  - `decision == no_completion`
  - `completed == false`

## Protected Fields

- `hp` unchanged
- `maxHp` unchanged
- `pendingDamage` unchanged

## Field Preservation Invariants

- unrelated fields remain unchanged

## Idempotency Invariant

Running the helper again on the unchanged completed output does not produce
another construction completion transition.

## Identity Invariant

Missing building identity is `BLOCKED` before production helper execution.

## Boundary Invariant

The production helper owns only the pure construction-completion decision.

`App.tsx` continues to own:

- PocketBase writes
- `recordBuildingTimerTrace`
- orchestration
- caller-side effects

## Explicit Exclusions

Do **not** freeze:

- PocketBase persistence success
- duplicate-write prevention
- reward exactly-once
- completion side effects
- reload/reconnect behavior
- multi-client authority
- stale-snapshot convergence
- upgrade completion
- production completion
- destruction completion
- generic work timers
- broad persisted-process exactly-once behavior

## Residual Limitation

The broader persisted-process scenario remains `UNCONFIRMED_RUNTIME_BEHAVIOR`
outside this narrow construction-completion subcase.

`T054` is complete.
`T055` remains open.
