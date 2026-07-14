# Scenario 1 Characterization Test

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

Within the active sticky-interaction window,
an older building snapshot does not replace
the accepted current building position.

## Explicit Exclusion

This test does **not** claim the broader contract:

`UNCONFIRMED_RUNTIME_BEHAVIOR`

`Initial fetch cannot be overwritten by an older late snapshot.`

This test also does **not** claim that the full accepted building object
survives unchanged. Non-position server fields remain outside the guarantee.

## Command

```bash
node tests/characterization/scenario-001-characterization.mjs
```

Negative controls:

```bash
SCENARIO_001_CHARACTERIZATION_CONTROL=wrong-expected node tests/characterization/scenario-001-characterization.mjs
SCENARIO_001_CHARACTERIZATION_CONTROL=missing-fields node tests/characterization/scenario-001-characterization.mjs
```

## Production Helper Imported

- `src/game/buildings/resolveBuildingSnapshotMerge.js`

## Frozen Inputs

- `scenarioId`: `scenario-001`
- `buildingId`: `building-001`
- `currentUserId`: `user-1`
- `now`: `1000000`
- `stickyInteractionMs`: `15000`
- `deletionProtectionMs`: `120000`
- `acceptedCurrentState`: accepted building state at `x=13`, `y=9`
- `olderLateSnapshot`: older snapshot at `x=12`, `y=9`
- `lastInteractionAt`: `990000`
- `recentMoveAt`: `999500`
- `deletingIds`: `[]`
- `tombstonedIds`: `[]`

## Assertions

- imports and executes the production helper directly
- uses deterministic frozen in-memory inputs only
- confirms the older snapshot does not replace the accepted current position
- confirms the production decision is `accept_server_update`
- confirms `shouldStickPosition === true`
- confirms `shouldStickHealthState === false`
- confirms `x`, `y`, and `zoneId` remain the accepted current position
- confirms non-position server fields are not part of the permanent guarantee
- confirms there is no live PocketBase, network, timer, random, or player-data dependency
- fails closed when required fields are missing

## Results

- baseline: `PASS`
- baseline output: accepted current position held, `decision=accept_server_update`, `replayOutcome=HELD`
- negative control `wrong-expected`: `FAIL`
- negative control `missing-fields`: `BLOCKED`
- missing-fields reason: `missing-required-fields`

## Remaining Limitation

The broader initial-fetch-versus-late-snapshot contract remains
`UNCONFIRMED_RUNTIME_BEHAVIOR`.

## Task State

`T028` is complete.
`T029` remains open.
