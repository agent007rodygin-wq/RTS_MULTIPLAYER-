# Scenario 2 Replay Evidence

## Scope

Selected subcase:

> While a local deletion tombstone is active, a reconnect snapshot does not
> restore the deleted building into the client building set.

Scenario 2 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

This pass is blocked before any real replay evidence can be produced.
It documents the missing importable boundary and the blocker report emitted by
`tests/characterization/scenario-002-replay.mjs`.

## Production Boundary Status

`BLOCKED`

The selected tombstone suppression boundary is not importable from production
source. `App.tsx` owns the tombstone refs and the reconnect merge filter, but
it does not expose a narrow pure helper for the reconnect suppression
decision.

The replay would therefore have to reimplement App-level tombstone state and
merge filtering, which is exactly the kind of substantial `App.tsx` logic this
pass is not allowed to copy.

## Exact Commands

Baseline blocker probe:

```bash
node tests/characterization/scenario-002-replay.mjs
```

Control probes:

```bash
node tests/characterization/scenario-002-replay.mjs --control=tombstone-absent
node tests/characterization/scenario-002-replay.mjs --control=wrong-order
node tests/characterization/scenario-002-replay.mjs --control=missing-identity
node tests/characterization/scenario-002-replay.mjs --control=unrelated-building-changed
```

## Frozen Inputs

The blocker probe is tied to the documented Scenario 2 fixture shape, but it
does not execute a production replay. The intended inputs remain the ones
described in:

- `tests/characterization/scenario-002-source-audit.md`
- `tests/characterization/scenario-002-classification.md`
- `tests/characterization/scenario-002-seam-decision.md`
- `tests/characterization/scenario-002-contract-split.md`
- `tests/characterization/scenario-002-fixture-design.md`

## Observed Output

Run 1 and Run 2 were identical blocked reports:

- `scenarioId`: `scenario-002`
- `control`: `baseline`
- `modelType`: `blocked-boundary-audit`
- `productionBoundaryStatus`: `missing-importable-production-boundary`
- `sourceBoundaryExecuted`: `false`
- `run1.status`: `BLOCKED`
- `run2.status`: `BLOCKED`
- `comparison`: `IDENTICAL`
- `summary.replayResult`: `BLOCKED`

The same blocked report shape was emitted for the control probes.
The controls were not behaviorally executed past the blocker; every control
stopped at the same missing-boundary condition instead of producing replay
evidence.

## Negative Control Output

All requested controls reported the same blocker instead of a replay result:

- `tombstone-absent`
- `wrong-order`
- `missing-identity`
- `unrelated-building-changed`

The blocker is the same in every case: there is no importable pure boundary
for App-level tombstone reconnect suppression, so the replay cannot be made
honest without copying runtime logic or introducing a minimal seam.

## Exact Claim Supported

This evidence supports only the blocker conclusion:

> A production-bound replay for this subcase cannot be produced yet because
> the necessary App-level tombstone suppression boundary is not importable.

It does **not** prove the reconnect contract itself.

## Known Limitations

- No production-bound replay was executed.
- No real pass/fail behavior for the reconnect contract was observed.
- No live PocketBase data was used.
- No owner acceptance was recorded.
- No seam was implemented in this pass.

## T035 Status

T035 may not proceed from this evidence alone.
The scenario remains `UNCONFIRMED_RUNTIME_BEHAVIOR` and the replay task
remains open until a safe boundary exists.

## T034 Status

T034 remains blocked/open because no importable production boundary exists for
the selected tombstone reconnect suppression path.
