# Scenario 1 Replay Evidence

## Scope

This is synthetic model evidence only.
It does not execute the production `App.tsx` or `src/pocketbase.ts` merge
boundary.

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

Observed narrow contract under replay:

> Within the active sticky-interaction window, an older building snapshot does
> not replace the accepted current building state.

This note records controlled replay evidence only. It does not promote the
scenario, request owner acceptance, or create a permanent characterization
test.

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

- `tests/characterization/scenario-001-source-audit.md`
- `tests/characterization/scenario-001-classification.md`
- `tests/characterization/scenario-001-seam-decision.md`
- `tests/characterization/scenario-001-fixture-design.md`
- `tests/characterization/scenario-001-readiness-review.md`

## Frozen Inputs

The replay used frozen in-memory inputs only:

- fixed clock: `1000000`
- sticky interaction window: `15000`
- deletion protection window: `120000`
- initial refresh-load state for building `building-001`
- newer accepted current state for the same building
- older late realtime-event state for the same building
- `lastInteractionRef[building-001] = 990000`
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
- `run1.observedOutput.reason`: `sticky-interaction-kept-current-state`
- `run1.observedOutput.winnerEqualsAcceptedState`: `true`

## Negative Control Output

- `reverse-order`: `FAIL`, `event-order-violated`
- `sticky-expired`: `FAIL`, `late-snapshot-overwrote-current-state`
- `missing-fields`: `BLOCKED`, `missing-required-fields`
- `stale-wins`: `FAIL`, `late-snapshot-overwrote-current-state`

Each control produced identical run 1 / run 2 results.

## Observed Result

The older late snapshot loses in the baseline synthetic model, but the broader
"initial fetch cannot be overwritten by an older late snapshot" statement is
not proven by this artifact.

## Known Limitations

- The replay intentionally models only the documented Scenario 1 sticky-window
  slice.
- It does not mutate live PocketBase.
- It does not widen the boundary to unrelated consumers or other scenarios.
- It is evidence for owner review, not owner acceptance.

## Open State

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` until owner acceptance is
recorded later.

## Remaining Requirement For T026

T026 is still open for the broad Scenario 1 contract.

It can only be completed after one of these happens:

1. The actual production boundary is executed through an existing importable
   pure seam.
2. A minimal test-only seam is proposed, explicitly owner-approved, and then
   used without changing runtime behavior.
3. The broad Scenario 1 contract is formally split or narrowed through a
   separate owner decision.
