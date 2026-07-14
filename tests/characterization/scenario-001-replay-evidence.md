# Scenario 1 Replay Evidence

## Scope

This is production-helper replay evidence.
It executes the imported boundary in `src/game/buildings/resolveBuildingSnapshotMerge.js`,
which `App.tsx` also imports, so the replay and runtime are looking at the same
merge decision.

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` because owner acceptance is
still pending.

Observed claim:

> Initial fetch cannot be overwritten by an older late snapshot.

## Exact Commands

Baseline:

```bash
node tests/characterization/scenario-001-replay.mjs
```

Negative controls:

```bash
SCENARIO_001_CONTROL=reverse-order node tests/characterization/scenario-001-replay.mjs
SCENARIO_001_CONTROL=sticky-expired node tests/characterization/scenario-001-replay.mjs
SCENARIO_001_CONTROL=missing-fields node tests/characterization/scenario-001-replay.mjs
SCENARIO_001_CONTROL=stale-wins node tests/characterization/scenario-001-replay.mjs
```

## Anchors Used

- `src/game/buildings/resolveBuildingSnapshotMerge.js`
- `App.tsx`
- `src/pocketbase.ts`
- `tests/characterization/scenario-001-source-audit.md`
- `tests/characterization/scenario-001-classification.md`
- `tests/characterization/scenario-001-seam-decision.md`
- `tests/characterization/scenario-001-fixture-design.md`
- `tests/characterization/scenario-001-readiness-review.md`
- `tests/characterization/scenario-001-production-boundary-review.md`
- `tests/characterization/scenario-001-replay-fidelity-review.md`

## Frozen Inputs

The replay used frozen in-memory inputs only:

- fixed clock: `1000000`
- sticky interaction window: `15000`
- deletion protection window: `120000`
- initial refresh-load state for building `building-001`
- newer accepted current state for the same building
- older late realtime-event state for the same building
- `lastInteractionRef[building-001] = 990000`
- `recentMoveInteractionRef[building-001] = 999500`
- `lastServerSyncRef[building-001] = 995000`
- empty deleting and tombstone sets

### Replay Order

Canonical order:

1. `refresh-load`
2. `accepted-current-state`
3. `older-late-realtime-event`

## Baseline Output

- `result`: `PASS`
- `comparison`: `IDENTICAL`
- `run1.status`: `PASS`
- `run2.status`: `PASS`
- `run1.observedOutput.replayOutcome`: `LOST`
- `run1.observedOutput.decision`: `accept_server_update`
- `run1.observedOutput.shouldStickPosition`: `true`
- `run1.observedOutput.shouldStickHealthState`: `false`
- `run1.observedOutput.winnerMatchesProductionExpectation`: `true`
- `run1.observedOutput.reason`: `production-helper-kept-accepted-current-state`

## Negative Control Output

- `reverse-order`: `FAIL`, `event-order-violated`
- `sticky-expired`: `FAIL`, `production-helper-allowed-late-overwrite`
- `missing-fields`: `BLOCKED`, `missing-required-fields`
- `stale-wins`: `FAIL`, `production-helper-allowed-late-overwrite`

Each control produced identical run 1 / run 2 results.

## Observed Result

The production helper keeps the accepted current building state against the
older late snapshot in the baseline run, while the negative controls fail or
block as expected.

## Known Limitations

- The replay is still limited to the documented Scenario 1 replay inputs.
- It does not mutate live PocketBase.
- It does not widen the boundary to unrelated consumers or other scenarios.
- It is evidence for owner review, not owner acceptance.

## Open State

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` until owner acceptance is
recorded later.

## T026 Status

T026 is complete as replay evidence only.
T027 remains blocked until explicit owner acceptance is recorded.
