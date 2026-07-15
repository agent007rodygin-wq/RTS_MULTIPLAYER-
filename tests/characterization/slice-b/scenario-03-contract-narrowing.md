# Scenario 3 Contract Narrowing

Task authority: `T047` in `specs/002-characterization-tests/tasks.md`

Audit target: `Persisted process whose end time passed completes exactly once`

This is a scope-selection pass only. It does not accept runtime behavior, does
not design a seam, and does not promote the broad scenario.

## Summary

- Broad scenario: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Contract decision: `SCENARIO_SPLIT_REQUIRED`
- Selected continuation: `CONSTRUCTION_COMPLETION_FIRST`

The source does not prove one generic local-completion contract that can safely
cover construction, production, upgrades, destruction, and generic work timers
without blurring distinct side effects.

Exact narrowed continuation contract for T048 onward:

> After an expired persisted construction process is completed locally,
> processing the same unchanged expired construction state again does not
> perform the construction completion transition a second time.

This selects the next investigation target only. It does not accept or
promote runtime behavior.

## Process-Type Comparison

| Process type | Can honestly share the selected narrow contract? | Notes |
| --- | --- | --- |
| Construction | Yes, selected first | The completion check is the smallest deterministic local transition and does not add reward semantics. |
| Upgrades | Partially, but deferred | Upgrade reuses construction semantics, yet the upgrade flow still has its own rewrite / persistence shape and should stay separate for this pass. |
| Production | No, separate | Production completion is coupled to reward / collection behavior, so it is not the first narrow target. |
| Destruction | No, separate | Destruction has its own terminal-field cleanup shape and its own helper path. |
| Generic work timers | No, separate for now | The source treats work completion as a different branch family with reward-related follow-on behavior. |

## Source Ownership

| Layer | Owns | Notes |
| --- | --- | --- |
| PocketBase | Persistent record authority | Server records remain the persistent source of truth. |
| `App.tsx` | Local completion transition and mirroring | Construction completion is owned by the client-side timer reconciliation and the live building-state loop. |
| `processOfflineTimers` | Offline completion reconciliation | This is the offline construction completion branch in the current source. |
| Live building-state loop | Foreground completion reconciliation | The same construction completion transition is also present in the live loop. |
| `src/pocketbase.ts` | Snapshot delivery / transport | It delivers refresh-load and realtime data, but it does not own the completion rule. |

## Exact Local Completion Entry Points

- `processOfflineTimers` construction branch in `App.tsx` around `652-665`
- live building-state construction branch in `App.tsx` around `12185-12201`

## Exact State Boundary

### Pre-completion state

- `isConstructing === true`
- `constructionEndTime` is at or before `now`
- the building still represents the expired in-progress construction state

### Locally completed state

- `isConstructing === false`
- `workState === 'idle'`
- `constructionEndTime` remains the historical persisted timestamp; this branch
  does not clear it

### What counts as a second completion transition

- the same construction-complete branch firing again on the same expired
  construction record
- another call attempting to flip the same record back through the construction
  completion transition a second time

## Local Guards And Cleared Fields

| Guard or field | Where it appears | What it does |
| --- | --- | --- |
| `isConstructing` | `processOfflineTimers`, live building-state loop | Prevents the construction-complete branch from re-running once the state is flipped false |
| `constructionEndTime` | current building record | Marks the completion fence that must already have passed |
| `_offlineTimersSynced` | `processOfflineTimers` | Prevents duplicate DB writes for the same stale offline completion pass |
| `lastServerSyncRef` | `App.tsx` sync / merge paths | Reduces stale overwrite risk, but only within the current client session |
| `lastInteractionRef` | client merge / optimistic paths | Helps protect recent local interaction state, but only within the current client session |

These guards help the current client session avoid a second local transition,
but they do not prove reward exactness, server persistence, reload safety, or
another-device safety.

## Deferred Guarantees

- completion side-effect idempotency
- reward exactly-once
- reload / reconnect catch-up idempotency
- multi-client finalization authority
- stale-snapshot convergence
- broad persisted-process exactly-once behavior

## Shared Versus Distinct Completion Logic

The source shows a shared family of timer-backed processes, but not a single
shared completion abstraction:

- construction completion is a direct local state flip in `App.tsx`
- upgrades reuse construction semantics, but are still an upgrade-shaped flow
- production has its own work-state / reward path
- destruction has its own terminal-state cleanup and helper shape
- generic work timers track `workState` / `workEndTime` and remain separate

Because those paths differ, a generic boundary is not the honest first target.

## Boundary Check

- Pure importable boundary already exists: no
- Minimal owner-approved seam may later be required: yes, if T048 needs a
  deterministic construction completion fixture without copying the inline
  branch

## Stop Conditions For T048

- Do not widen T048 to reward exactness, reconnect safety, or multi-client
  authority.
- Do not mix construction completion with production / upgrade / destruction in
  one fixture.
- Do not treat local guard flips as proof of server persistence.

## T048 Readiness

T048 may proceed only to fixture design for the construction-completion
subcase.

