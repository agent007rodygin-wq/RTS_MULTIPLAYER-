# Scenario 3 Replay Boundary Audit

## Status

`BLOCKED`

This is a blocked-boundary audit, not a completed replay proof.
The narrow contract remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

## Narrow Contract Under Review

`After local destruction completion has produced a terminal building state, a later older snapshot does not restore the pre-terminal building state.`

## Source Boundaries Reviewed

- `App.tsx:processOfflineTimers(...)`
- `App.tsx:updatePlacedBuildingsFromServer(...)`
- `resolvePlacedBuildingSnapshotMerge(...)`
- `shouldPreferServerRevivedBuildingState(...)`
- `tests/characterization/scenario-003-fixture-design.md`
- `tests/characterization/scenario-003-contract-narrowing.md`

## Production-Boundary Status

| Half | Status | Why |
| --- | --- | --- |
| Local destruction completion | `SYNTHETIC_OR_MISSING` | `processOfflineTimers` is a local `const` inside `App.tsx` and is not exported/importable, so the local completion boundary cannot be executed as a production helper. |
| Merge / reconciliation | `PRODUCTION_BOUNDARY_AVAILABLE` | `resolvePlacedBuildingSnapshotMerge(...)` is exported from `src/game/buildings/resolveBuildingSnapshotMerge.js` and can be imported directly. |

## Why T042 Remains Open

The replay cannot be completed honestly because the completion half of the
contract is still embedded inside `App.tsx`.

The smallest missing seam is:

- extract the local destruction-completion branch from `App.tsx` into a pure
  importable helper;
- keep the reconnect merge boundary separate and unchanged;
- do not fold Scenario 2 tombstone logic into this scenario.

Until that seam exists, any end-to-end replay would have to copy substantial
`App.tsx` logic, which would be a synthetic model rather than a production
boundary execution.

## Intended Frozen Inputs

- deterministic local completion time
- deterministic reconnect time
- same stable building identity on both sides
- local terminal-state record from completion
- older pre-terminal snapshot payload
- frozen merge-context refs / caches

## Event Order the Replay Would Need

1. destruction process is active
2. deterministic completion time passes
3. local completion boundary produces terminal state
4. older pre-terminal snapshot arrives
5. production merge boundary executes
6. pre-terminal state is not restored

This order is documented for the future seam, but it was not executed here.

## Run Results

`Run 1`: `BLOCKED`

`Run 2`: `BLOCKED`

Both runs agree that the completion half cannot be exercised through an
importable production boundary yet.

## Negative Controls

All controls stop at the same missing-boundary blocker and do not become a
behavioral replay:

- completion time not reached: `BLOCKED`
- snapshot is not older: `BLOCKED`
- missing building identity: `BLOCKED`
- pre-terminal state restored: `BLOCKED`
- unrelated building changed: `BLOCKED`

## Exact Narrow Claim Supported

The current source review supports only this claim:

`resolvePlacedBuildingSnapshotMerge(...)` is importable, but the local
destruction-completion half remains embedded in `App.tsx` and is not yet
available as a production boundary for replay.

That is enough to justify the block, but not enough to prove the narrow
contract.

## Fidelity Limitations

- No production-bound replay was executed.
- No live PocketBase access occurred.
- No reload durability was tested.
- No server-revival contract was tested.
- No Scenario 2 tombstone contract was used as a proxy.
- No exactly-once destruction claim was made.

## Whether T042 Completed

`T042` remains open.

## Whether T043 May Proceed

No. `T043` remains blocked until a seam exposes the local destruction-completion
boundary without copying substantial `App.tsx` logic.

