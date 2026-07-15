# Scenario 3 Owner Acceptance

Task authority: `T051` in `specs/002-characterization-tests/tasks.md`

Accepted contract:

`After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.`

## Evidence Basis

- production helper exists and is imported
- `App.tsx` delegates both matching construction-completion branches to the helper
- caller-side traces and PocketBase writes remain outside the helper
- Scenario Run 1: PASS
- Scenario Run 2: PASS
- comparison: IDENTICAL
- first pass decision: `complete_construction`
- second pass decision: `no_completion`
- all six controls behaved as expected

## Accepted Fields

Acceptance is limited to the fields proven by replay:

- `isConstructing`
- `workState`
- `constructionEndTime`
- `hp`
- `maxHp`
- `pendingDamage`

## Accepted Second-Pass Behavior

- the completed output is processed again unchanged
- no second construction completion occurs
- the second-pass decision is `no_completion`
- unrelated fields remain unchanged

## Deferred Contracts

Explicitly unaccepted and deferred:

- PocketBase persistence success
- duplicate-write prevention
- completion side-effect exactly-once
- reward exactly-once
- reload/reconnect catch-up idempotency
- multi-client finalization authority
- stale-snapshot convergence
- upgrade completion
- production completion
- destruction completion
- generic work timers
- broad persisted-process exactly-once behavior

## Scope Note

This acceptance does not imply:

- server atomicity
- cross-device locking
- cross-reload protection
- reward atomicity
- exactly-once completion outside the local construction transition

The broader persisted-process scenario remains `UNCONFIRMED_RUNTIME_BEHAVIOR`
outside this narrow local construction-completion subcase.

## Owner Decision

The owner accepts only the narrow local transition behavior above. The broader
scenario remains open for later investigation.
