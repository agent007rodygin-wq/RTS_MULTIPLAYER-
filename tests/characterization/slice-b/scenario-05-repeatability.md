# Scenario 5 Repeatability

Task authority: `T069` in `specs/002-characterization-tests/tasks.md`

Scenario wording:

`Construction state survives reload and converges from persisted end time.`

Accepted narrow contract:

`After an already-expired persisted construction process is replayed by offline catch-up, the local construction completion transition occurs once. Replaying the same unchanged completed state again produces no second local construction completion transition.`

## Exact Command

`node tests/characterization/slice-b/scenario-05.mjs`

## Characterization Run 1

Status: `PASS`

Recorded internal repeatability shape:

- `scenarioExecution1`: `PASS`
  - `firstPass`: `complete_construction`
  - `secondPass`: `no_completion`
- `scenarioExecution2`: `PASS`
  - `firstPass`: `complete_construction`
  - `secondPass`: `no_completion`
- internal comparison: `IDENTICAL`
- `productionSourceExecution`: `true`
- `sourceBoundaryExecuted`: `true`

Protected fields preserved in both internal scenario executions:

- `isConstructing`: `false`
- `workState`: `idle`
- `constructionEndTime`: `1704067140000`
- `hp`: `120`
- `maxHp`: `120`
- `pendingDamage`: `0`

Unrelated fields unchanged in both internal scenario executions:

- `buildingId`: `301`
- `ownerId`: `user-9`
- `zoneId`: `zone-2`
- `x`: `18`
- `y`: `11`
- `isLocal`: `true`
- `constructionDurationMs`: `180000`
- `constructionMaxLifetimeMs`: `240000`
- `timestamp`: `1704067198200`

## Characterization Run 2

Status: `PASS`

Recorded internal repeatability shape:

- `scenarioExecution1`: `PASS`
  - `firstPass`: `complete_construction`
  - `secondPass`: `no_completion`
- `scenarioExecution2`: `PASS`
  - `firstPass`: `complete_construction`
  - `secondPass`: `no_completion`
- internal comparison: `IDENTICAL`
- `productionSourceExecution`: `true`
- `sourceBoundaryExecuted`: `true`

Protected fields preserved in both internal scenario executions:

- `isConstructing`: `false`
- `workState`: `idle`
- `constructionEndTime`: `1704067140000`
- `hp`: `120`
- `maxHp`: `120`
- `pendingDamage`: `0`

Unrelated fields unchanged in both internal scenario executions:

- `buildingId`: `301`
- `ownerId`: `user-9`
- `zoneId`: `zone-2`
- `x`: `18`
- `y`: `11`
- `isLocal`: `true`
- `constructionDurationMs`: `180000`
- `constructionMaxLifetimeMs`: `240000`
- `timestamp`: `1704067198200`

## Control Results

Supported controls:

- `completion-time-not-reached`: `FAIL` / `unexpected-helper-result` / exit `0`
- `missing-identity`: `BLOCKED` / `missing-building-identity` / exit `0`
- `second-pass-completes-again`: `FAIL` / `unexpected-helper-result` / exit `0`
- `completed-fields-regress`: `FAIL` / `unexpected-helper-result` / exit `0`
- `unrelated-field-changed`: `FAIL` / `unexpected-helper-result` / exit `0`
- `production-boundary-not-available`: `BLOCKED` / `production-boundary-not-available` / exit `0`

Unsupported control:

- `unknown-control-name`: non-zero exit
- exact error: `Unsupported Scenario 5 characterization control "unknown-control-name"`

## Explicit Exclusions

- reward delivery
- inventory/resources
- reconnect ordering
- realtime ordering
- PocketBase persistence
- stale snapshots
- duplicate writes
- multi-client behavior
- upgrade completion
- production completion
- destruction completion
- generic timer guarantees
- broader persisted-process guarantees

## Limitations

- This note proves repeatability for the narrow construction-convergence contract only.
- It does not widen the accepted contract.
- It does not claim reward, reconnect, PocketBase, inventory, realtime, or broader persisted-process behavior.
- `Scenario 5` remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside the accepted narrow subcase.

## Final Conclusion

The repeatability result is `PASS / PASS / IDENTICAL` for the accepted narrow construction-convergence contract.

## Task State

- `T069` complete: `yes`
- `T070` remains open: `yes`
