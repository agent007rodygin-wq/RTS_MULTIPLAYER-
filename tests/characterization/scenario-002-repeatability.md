# Scenario 2 Repeatability

## Accepted Contract

`While a local deletion tombstone is active, a reconnect snapshot does not restore the deleted building into the client building set.`

This note covers the permanent characterization test only. The broader Scenario 2 claim remains unconfirmed outside this narrow tombstone/reconnect subcase.

## Exact Command

`node tests/characterization/scenario-002-characterization.mjs`

## Run 1 Result

- result: `PASS`
- status: `PASS`
- comparison: `IDENTICAL`
- decision: `suppress_tombstoned_buildings`
- visibleBuildingIds: `["building-keep-1"]`
- suppressedBuildingIds: `["building-delete-1"]`
- deletedBuildingVisible: `false`
- unrelatedBuildingVisible: `true`
- failureReason: `accepted-narrow-tombstone-reconnect-contract-held`

## Run 2 Result

- result: `PASS`
- status: `PASS`
- comparison: `IDENTICAL`
- decision: `suppress_tombstoned_buildings`
- visibleBuildingIds: `["building-keep-1"]`
- suppressedBuildingIds: `["building-delete-1"]`
- deletedBuildingVisible: `false`
- unrelatedBuildingVisible: `true`
- failureReason: `accepted-narrow-tombstone-reconnect-contract-held`

## Semantic Comparison

| Field | Run 1 | Run 2 | Match |
| --- | --- | --- | --- |
| `scenarioId` | `scenario-002` | `scenario-002` | Yes |
| `result` | `PASS` | `PASS` | Yes |
| `status` | `PASS` | `PASS` | Yes |
| accepted contract | narrow tombstone/reconnect contract | narrow tombstone/reconnect contract | Yes |
| production decision | `suppress_tombstoned_buildings` | `suppress_tombstoned_buildings` | Yes |
| `visibleBuildingIds` | `["building-keep-1"]` | `["building-keep-1"]` | Yes |
| `suppressedBuildingIds` | `["building-delete-1"]` | `["building-delete-1"]` | Yes |
| deleted building visibility | `false` | `false` | Yes |
| unrelated building visibility | `true` | `true` | Yes |
| failure reason | `accepted-narrow-tombstone-reconnect-contract-held` | `accepted-narrow-tombstone-reconnect-contract-held` | Yes |

## Controls

| Control | Expected | Observed | Result |
| --- | --- | --- | --- |
| `no-tombstone` | `FAIL` | `FAIL` with `deleted-building-reappeared-without-tombstone` | Pass |
| `wrong-order` | `FAIL` | `FAIL` with `event-order-violated` | Pass |
| `missing-identity` | `BLOCKED` | `BLOCKED` with `validation.reason = missing-required-fields` | Pass |
| `unrelated-building-modified` | `FAIL` | `FAIL` with `unrelated-building-modified` | Pass |

## Evidence Notes

- The test ran twice without changing files, environment variables, fixtures, inputs, clock, or process state.
- No network access occurred.
- No live PocketBase access occurred.
- The production helper import remained `src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js`.
- The output was deterministic across both runs.

## Residual Limitations

- This proves only the accepted narrow tombstone/reconnect contract.
- Adapter dead-id suppression remains deferred.
- Persistent deletion durability remains deferred.
- Full reload behavior remains deferred.
- The broader deletion-resurrection contract remains unconfirmed outside this subcase.

## Task State

- `T037` is complete.
- `T038` remains open.
