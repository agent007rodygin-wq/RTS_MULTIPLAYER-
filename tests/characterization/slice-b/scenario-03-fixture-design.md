# Scenario 3 Fixture Design

Task authority: `T049` in `specs/002-characterization-tests/tasks.md`

Audit target: `After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.`

This is a fixture-design note only. It does not implement runtime behavior, and
it does not create fixture data.

## Summary

- Broad scenario: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Narrow contract: construction completion is idempotent on the same unchanged
  expired construction state
- Selected continuation: `CONSTRUCTION_COMPLETION_FIRST`

## Exact Construction Branch Under Review

- Offline path: `App.tsx:634-715` `processOfflineTimers`
- Live mirror path: `App.tsx:12185-12203`

The fixture stays anchored to the offline path for determinism, while the live
mirror is recorded as the matching foreground branch.

## Frozen Inputs

The fixture should freeze only the inputs the current construction-completion
branch actually reads:

- `isConstructing`
- `constructionEndTime`
- `now`
- stable building identity via `id`

Do not invent construction-start data, upgrade markers, or unrelated building
fields that the branch does not consult.

## First Local Processing Pass

The first pass starts from an expired construction state:

- `isConstructing` is `true`
- `constructionEndTime` is already at or before the frozen `now`
- the building is the same persisted record across both passes

Expected first-pass result:

- construction transition fires
- `isConstructing` becomes `false`
- `workState` becomes `'idle'`
- `constructionEndTime` remains as the historical persisted timestamp

## Second Processing Pass

The second pass reuses the completed state produced by the first pass without
changing it.

Expected second-pass result:

- no second construction-completion transition
- no additional field transition
- no duplicate completion decision

## Source-Supported Output Transitions

The current source supports only these outputs for the branch:

| Field | Transition |
| --- | --- |
| `isConstructing` | `false` |
| `workState` | `'idle'` |
| `constructionEndTime` | retained as the historical persisted timestamp; not cleared by this branch |

## Local Idempotency Analysis

The second pass is a no-op because the first pass clears `isConstructing`, so
the construction guard no longer matches.

Relevant local guard:

- `isConstructing && constructionEndTime && now >= constructionEndTime`

`_offlineTimersSynced` may suppress duplicate offline DB writes in
`processOfflineTimers`, but it is caller-side persistence suppression only. It
is not the authority for the pure construction transition itself.

## Caller-Owned Side Effects

These remain outside the fixture contract:

- traces
- PocketBase writes
- refs
- state setters
- orchestration
- retry behavior

The fixture models the transition decision only, not the caller-side effects.

## Meaning of "Same Unchanged Expired Construction State"

This means:

- the same persisted building record is passed back into the branch
- `isConstructing` is not reintroduced as `true`
- `constructionEndTime` is not replaced with a fresh future timer
- no caller-side cache or ref reset is counted as part of the pure transition

## What Counts as a Second Completion Transition

- the same construction-complete branch firing again for the same persisted
  building record
- another completion decision after the first pass already cleared the local
  constructing flag

## Reset And Cleanup Assumptions

- each check starts from a fresh cloned fixture object graph
- the same frozen clock value is reused for both passes
- no live PocketBase or network access is required
- `_offlineTimersSynced` is not treated as persisted authority

## Deterministic Event Order

1. construction is active
2. end time has passed
3. first local processing pass executes
4. construction completion transition occurs
5. resulting completed state is fed into a second unchanged pass
6. second pass performs no completion transition

## Failure Conditions

The fixture is invalid if:

- the initial state does not satisfy the construction guard
- the first pass does not clear `isConstructing`
- the second pass still completes construction
- the fixture claims extra field transitions beyond the current source
- the fixture treats caller-side persistence suppression as the pure transition
- upgrade, production, destruction, or reconnect semantics are mixed into the
  fixture
- actual executable fixture data is introduced

## Preconditions For T050

T050 may proceed only if:

- a deterministic production-bound construction-completion seam exists or is
  explicitly approved
- the replay uses the same narrow construction-completion contract and does not
  widen into reward, reconnect, or multi-client behavior
- if the seam stays missing, T050 remains blocked

## Limitations

This fixture does not prove:

- PocketBase persistence
- duplicate-write prevention
- reward or side-effect exactly-once
- reload / reconnect safety
- multi-client authority
- upgrade completion
- production completion
- destruction completion
- broad process exactly-once behavior

## Upgrade Overlap

Construction and upgrade both use construction-shaped fields in source, but the
source does not prove one exact shared abstraction. The overlap is partial only.

## Scenario Status

`UNCONFIRMED_RUNTIME_BEHAVIOR`
