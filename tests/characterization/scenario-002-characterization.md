# Scenario 2 Characterization Test

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

> While a local deletion tombstone is active, a reconnect snapshot does not
> restore the deleted building into the client building set.

This is the only accepted contract covered by the permanent characterization
test.

## Explicit Exclusions

This test does **not** accept or prove:

- adapter dead-id suppression
- persistent deletion durability
- full reload behavior
- any broader deletion guarantee
- any PocketBase interaction or reconnect persistence guarantee

The broader Scenario 2 contract remains `UNCONFIRMED_RUNTIME_BEHAVIOR`
outside the accepted tombstone/reconnect subcase.

## Command

```bash
node tests/characterization/scenario-002-characterization.mjs
```

Negative controls:

```bash
SCENARIO_002_CHARACTERIZATION_CONTROL=no-tombstone node tests/characterization/scenario-002-characterization.mjs
SCENARIO_002_CHARACTERIZATION_CONTROL=wrong-order node tests/characterization/scenario-002-characterization.mjs
SCENARIO_002_CHARACTERIZATION_CONTROL=missing-identity node tests/characterization/scenario-002-characterization.mjs
SCENARIO_002_CHARACTERIZATION_CONTROL=unrelated-building-modified node tests/characterization/scenario-002-characterization.mjs
```

## Production Helper Imported

- `src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js`

## Frozen Inputs

- `scenarioId`: `scenario-002`
- `currentUserId`: `user-7`
- `deletedBuildingId`: `building-delete-1`
- `eventOrder`: local delete intent -> tombstone active -> reconnect snapshot arrives -> merge/filter -> deleted building remains absent
- `activeDeletingBuildingIds`: `['building-delete-1']`
- `activeConfirmedDeletedBuildingIds`: `[]`
- `reconnectSnapshotBuildings`: deleted building plus unrelated keep building
- `expectedVisibleBuildings`: keep building only

## Assertions

- imports and executes the production helper directly
- uses deterministic frozen in-memory inputs only
- deleted building is absent from visible buildings
- unrelated building remains visible
- `suppressedBuildingIds` contains the deleted id
- helper decision equals the production decision
- output is deterministic across repeated runs
- no live PocketBase, network, random, or player-data dependency is used
- fail-closed behavior applies when required fields are missing

## Results

- baseline: `PASS`
- baseline comparison: `IDENTICAL`
- baseline run 1: `PASS`
- baseline run 2: `PASS`
- negative control `no-tombstone`: `FAIL`
- negative control `wrong-order`: `FAIL`
- negative control `missing-identity`: `BLOCKED`
- negative control `unrelated-building-modified`: `FAIL`

## Remaining Limitation

This test proves only the accepted tombstone/reconnect subcase.
It does not prove broader deletion durability, adapter dead-id suppression,
or full reload safety.

## Task State

`T036` is complete.
`T037` remains open.

