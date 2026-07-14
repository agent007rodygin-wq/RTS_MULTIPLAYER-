# Scenario 2 Replay Evidence

## Scope

Selected narrow contract:

> While a local deletion tombstone is active, a reconnect snapshot does not
> restore the deleted building into the client building set.

Scenario 2 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

This checkpoint is now a production-helper replay, not a blocked-boundary
audit. The replay imports the production seam directly and exercises the local
tombstone suppression decision that is already owned by `App.tsx`.

## Production Boundary

- **Helper imported:** `src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js`
- **Helper execution:** `true`
- **Source boundary executed:** `true`
- **Boundary name:** `filterReconnectSnapshotBuildingsByTombstones`

The helper only filters reconnect-snapshot buildings against active tombstone
ids. It does not own refs, cache cleanup, persistence, subscription lifecycle,
or PocketBase state.

## Exact Command

```bash
node tests/characterization/scenario-002-replay.mjs
```

The replay was executed twice with the same frozen in-memory inputs and the
same command.

## Frozen Inputs

Baseline replay inputs:

- deleted building id: `building-delete-1`
- current user id: `user-7`
- active deleting tombstone ids: `building-delete-1`
- active confirmed-deleted ids: none
- reconnect snapshot buildings:
  - deleted building `building-delete-1`
  - unrelated building `building-keep-1`

The replay order was:

1. local delete intent
2. tombstone active
3. reconnect snapshot arrives
4. merge/filter step
5. deleted building remains absent

## Replay Result

Run 1 and Run 2 were identical.

| Field | Run 1 | Run 2 |
| --- | --- | --- |
| `result` | `PASS` | `PASS` |
| `comparison` | `IDENTICAL` | `IDENTICAL` |
| `parityResult` | `PASS` | `PASS` |
| `helperDecision` | `suppress_tombstoned_buildings` | `suppress_tombstoned_buildings` |
| visible building ids | `building-keep-1` | `building-keep-1` |
| suppressed building ids | `building-delete-1` | `building-delete-1` |
| deleted building visible | `false` | `false` |
| unrelated building preserved | `true` | `true` |
| narrow claim supported | `true` | `true` |

Parity sweep:

- `keep-when-no-tombstones` - PASS
- `suppress-via-deleting-set` - PASS
- `suppress-via-confirmed-set` - PASS
- `suppress-via-both-sets` - PASS

## Negative Controls

| Control | Result | Observed reason |
| --- | --- | --- |
| `tombstone-absent` | `FAIL` | deleted building reappeared without the active tombstone |
| `wrong-order` | `FAIL` | event order violated |
| `missing-identity` | `BLOCKED` | missing required building identity |
| `unrelated-building-changed` | `FAIL` | unrelated building changed |

These controls are useful because they fail for the expected reasons instead
of producing a fake pass.

## Exact Claim Supported

This evidence supports only the narrow sticky-window contract:

> While a local deletion tombstone is active, a reconnect snapshot does not
> restore the deleted building into the client building set.

It does **not** prove:

- adapter dead-id suppression;
- persistent deletion durability after reload;
- full reload safety;
- broad Scenario 2 promotion;
- any PocketBase schema or persistence contract.

## Deferred Contracts

The following remain intentionally deferred:

- adapter dead-id suppression in `src/pocketbase.ts`
- persistent deletion durability after a full reload

Those subcases still need their own evidence and owner decisions.

## Status

- `productionSourceExecution`: `true`
- `sourceBoundaryExecuted`: `true`
- `summary.adapterDeadIdDeferred`: `true`
- `summary.persistentDeletionDeferred`: `true`
- `summary.scenarioClassification`: `UNCONFIRMED_RUNTIME_BEHAVIOR`

T034 is now satisfied for the selected subcase, and this evidence is enough for
the later owner-acceptance review. T035 itself remains open until that separate
owner decision is recorded.
