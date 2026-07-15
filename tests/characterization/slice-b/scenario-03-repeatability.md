# Scenario 3 Repeatability

Task authority: `T053` in `specs/002-characterization-tests/tasks.md`

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

After an expired persisted construction process is completed locally,
processing the same unchanged expired construction state again does not
perform the construction completion transition a second time.

This is the narrow accepted Scenario 3 contract only.

## Exact Command

```bash
node tests/characterization/slice-b/scenario-03.mjs
```

## Scenario Run 1

- result: `PASS`
- status: `PASS`
- reason: `accepted-narrow-construction-completion-contract-held`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`
- firstPass decision: `complete_construction`
- firstPass completed: `true`
- secondPass decision: `no_completion`
- secondPass completed: `false`
- comparison: `IDENTICAL`

Observed stable outputs:

- `isConstructing = false`
- `workState = idle`
- `constructionEndTime = 1704067140000`
- `hp = 120`
- `maxHp = 120`
- `pendingDamage = 0`
- unrelated-field preservation: `true`

## Scenario Run 2

- result: `PASS`
- status: `PASS`
- reason: `accepted-narrow-construction-completion-contract-held`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`
- firstPass decision: `complete_construction`
- firstPass completed: `true`
- secondPass decision: `no_completion`
- secondPass completed: `false`
- comparison: `IDENTICAL`

Observed stable outputs:

- `isConstructing = false`
- `workState = idle`
- `constructionEndTime = 1704067140000`
- `hp = 120`
- `maxHp = 120`
- `pendingDamage = 0`
- unrelated-field preservation: `true`

## Semantic Comparison

- `scenarioId`: identical
- `acceptedContract`: identical
- `result/status`: identical
- `reason`: identical
- `productionSourceExecution`: identical
- `sourceBoundaryExecuted`: identical
- `firstPassDecision`: identical
- `firstPassCompleted`: identical
- `secondPassDecision`: identical
- `secondPassCompleted`: identical
- protected fields: identical
- unrelated-field preservation: identical

## Controls

Each control exited `0` only because the observed semantic result, branch reason,
and helper-execution state matched the expected contract for that control.

| Control | Result | Reason | productionSourceExecution | sourceBoundaryExecuted | Exit code |
| --- | --- | --- | --- | --- | --- |
| `completion-time-not-reached` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `missing-identity` | `BLOCKED` | `missing-building-identity` | `false` | `false` | `0` |
| `second-pass-completes-again` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `completed-fields-regress` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `unrelated-building-changed` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `production-helper-not-executed` | `BLOCKED` | `production-helper-not-executed` | `false` | `false` | `0` |

## Exit-Code Contract

Baseline gate:

- exit `0` only when the baseline result is `PASS`
- exit nonzero for `FAIL`, `BLOCKED`, or an uncontrolled exception

Control gate:

- exit `0` only when the semantic result, reason, and helper-execution state
  match the expected control contract
- unexpected `PASS`, wrong branch, wrong reason, or wrong execution state set a
  nonzero exit code
- unknown control names also exit nonzero

## Stable Protected Fields

- `isConstructing`
- `workState`
- `constructionEndTime`
- `hp`
- `maxHp`
- `pendingDamage`

## Explicit Exclusions

This note does **not** claim:

- PocketBase persistence
- duplicate-write prevention
- completion side-effect exactly-once
- reward exactly-once
- reload/reconnect idempotency
- multi-client authority
- stale-snapshot convergence
- upgrade completion
- production completion
- destruction completion
- generic work timers
- broad persisted-process exactly-once behavior

## Residual Limitation

The broader persisted-process scenario remains `UNCONFIRMED_RUNTIME_BEHAVIOR`
outside this narrow construction-completion subcase.

## Fresh-Run Confirmation

- no source changed between Run 1 and Run 2
- baseline passed twice with identical semantic output
- every supported control behaved as expected with fail-closed exit gating
- `T053` is complete
- `T054` remains open
