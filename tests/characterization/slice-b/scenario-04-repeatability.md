# Scenario 4 Repeatability

Task authority: `T061` in `specs/002-characterization-tests/tasks.md`

Accepted narrow contract:

`After an already-expired persisted construction process is replayed by offline catch-up, the local construction completion transition occurs once. Replaying the same unchanged completed state again produces no second local completion transition.`

This repeatability note is construction-only. It does not extend into reward delivery, reconnect ordering, persistence, or any broader Scenario 4 guarantee.

## Repeatability Model

- `firstPass` and `secondPass` are inside one scenario execution.
- `Characterization Run 1` and `Characterization Run 2` are the repeatability runs.
- Repeatability compares the two complete scenario executions, not the inner passes.

## Exact Command

`node tests/characterization/slice-b/scenario-04.mjs`

The command above was run twice with the same frozen fixture and no file or input changes between runs.

## Characterization Runs

| Characterization Run | Result | Comparison | firstPass | secondPass | productionSourceExecution | sourceBoundaryExecuted |
| --- | --- | --- | --- | --- | --- | --- |
| Run 1 | PASS | IDENTICAL | `complete_construction` | `no_completion` | `true` | `true` |
| Run 2 | PASS | IDENTICAL | `complete_construction` | `no_completion` | `true` | `true` |

## Scenario Executions

Both complete scenario executions were PASS and identical.

### Scenario Execution 1

- status: `PASS`
- reason: `accepted-narrow-construction-completion-contract-held`
- firstPass decision: `complete_construction`
- firstPass completed: `true`
- secondPass decision: `no_completion`
- secondPass completed: `false`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`

### Scenario Execution 2

- status: `PASS`
- reason: `accepted-narrow-construction-completion-contract-held`
- firstPass decision: `complete_construction`
- firstPass completed: `true`
- secondPass decision: `no_completion`
- secondPass completed: `false`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`

## Stable Semantic Outputs

The protected fields were stable across both repeatability runs:

- `isConstructing: false`
- `workState: idle`
- `constructionEndTime: 1704067140000`
- `hp: 120`
- `maxHp: 120`
- `pendingDamage: 0`

Unrelated fields were preserved unchanged:

- `x: 18`
- `y: 11`
- `zoneId: zone-2`
- `buildingId: 301`
- `ownerId: user-9`
- `isLocal: true`
- `constructionDurationMs: 180000`
- `constructionMaxLifetimeMs: 240000`
- `timestamp: 1704067198200`

## Controls

The supported controls were executed separately and remained fail-closed against unexpected PASS.

| Command | Result | Reason | productionSourceExecution | sourceBoundaryExecuted | exitGate.matched | Exit code |
| --- | --- | --- | --- | --- | --- | --- |
| `node tests/characterization/slice-b/scenario-04.mjs --control=completion-time-not-reached` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `true` | `0` |
| `node tests/characterization/slice-b/scenario-04.mjs --control=missing-identity` | `BLOCKED` | `missing-building-identity` | `false` | `false` | `true` | `0` |
| `node tests/characterization/slice-b/scenario-04.mjs --control=second-pass-completes-again` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `true` | `0` |
| `node tests/characterization/slice-b/scenario-04.mjs --control=completed-fields-regress` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `true` | `0` |
| `node tests/characterization/slice-b/scenario-04.mjs --control=unrelated-field-changed` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `true` | `0` |
| `node tests/characterization/slice-b/scenario-04.mjs --control=production-boundary-not-available` | `BLOCKED` | `production-boundary-not-available` | `false` | `false` | `true` | `0` |

## Unknown Control

Command:

`node tests/characterization/slice-b/scenario-04.mjs --control=unknown-control-name`

Result:

- unsupported-control error: `Unsupported Scenario 4 characterization control "unknown-control-name"`
- exit code: `1`

## Explicit Exclusions

This note does **not** claim:

- reward delivery
- reward exactly-once
- inventory/resource changes
- PocketBase persistence
- duplicate-write prevention
- completion side-effect exactly-once
- reconnect/reload
- realtime ordering
- stale-snapshot convergence
- multi-client authority
- upgrade completion
- production completion
- destruction completion
- generic timers
- broad Scenario 4 guarantees

## Residual Limitations

- The broad Scenario 4 contract remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside this narrow construction-only subcase.
- Reward, reconnect, and persistence guarantees remain separate contracts.
- No files changed between Characterization Run 1 and Characterization Run 2.

## Task State

- `T061` complete: `yes`
- `T062` remains open: `yes`
