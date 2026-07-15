# Scenario 3 Characterization

Task authority: `T052` in `specs/002-characterization-tests/tasks.md`

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

After an expired persisted construction process is completed locally,
processing the same unchanged expired construction state again does not
perform the construction completion transition a second time.

This is the narrow accepted Scenario 3 contract only.

## Evidence Basis

- production helper exists and is imported
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`
- `App.tsx` delegates both matching construction-completion branches to the helper
- caller-side traces and PocketBase writes remain outside the helper
- Scenario Run 1: PASS
- Scenario Run 2: PASS
- comparison: IDENTICAL
- first pass decision: `complete_construction`
- second pass decision: `no_completion`
- all six controls behaved as expected

## Production Helper Imported

- `src/game/buildings/resolveLocalConstructionCompletion.js`

## Exact Command

```bash
node tests/characterization/slice-b/scenario-03.mjs
```

Negative controls:

```bash
SCENARIO_03_CHARACTERIZATION_CONTROL=completion-time-not-reached node tests/characterization/slice-b/scenario-03.mjs
SCENARIO_03_CHARACTERIZATION_CONTROL=missing-identity node tests/characterization/slice-b/scenario-03.mjs
SCENARIO_03_CHARACTERIZATION_CONTROL=second-pass-completes-again node tests/characterization/slice-b/scenario-03.mjs
SCENARIO_03_CHARACTERIZATION_CONTROL=completed-fields-regress node tests/characterization/slice-b/scenario-03.mjs
SCENARIO_03_CHARACTERIZATION_CONTROL=unrelated-building-changed node tests/characterization/slice-b/scenario-03.mjs
SCENARIO_03_CHARACTERIZATION_CONTROL=production-helper-not-executed node tests/characterization/slice-b/scenario-03.mjs
```

## Frozen Inputs

- `scenarioId = scenario-03`
- `currentUserId = user-9`
- `now = 1704067200000`
- `activeConstructionBuilding` with:
  - `id = construction-terminal-1`
  - `buildingId = 301`
  - `x = 18`
  - `y = 11`
  - `zoneId = zone-2`
  - `isConstructing = true`
  - `constructionEndTime = 1704067140000`
  - `workState = working`
  - `hp = 120`
  - `maxHp = 120`
  - `pendingDamage = 0`
- `completedConstructionBuilding` with the same persisted fields and:
  - `isConstructing = false`
  - `workState = idle`
- `unrelatedBuilding` that must remain visible and unchanged
- `expectedUnrelatedBuilding` matching the unrelated building baseline

## Assertions

The permanent test asserts only the owner-accepted fields and decisions:

- `isConstructing`
- `workState`
- `constructionEndTime`
- `hp`
- `maxHp`
- `pendingDamage`

First-pass assertions:

- `decision === complete_construction`
- `completed === true`
- `isConstructing === false`
- `workState === idle`
- the source-supported completed fields match the accepted evidence

Second-pass assertions:

- `decision === no_completion`
- `completed === false`
- the completed output remains unchanged
- no second construction completion occurs

The unrelated building remains unchanged across both passes.

## Run Results

- Run 1: `PASS`
- Run 2: `PASS`
- comparison: `IDENTICAL`

Observed first-pass result:

- `decision = complete_construction`
- `completed = true`
- `isConstructing = false`
- `workState = idle`
- `constructionEndTime = 1704067140000`
- `hp = 120`
- `maxHp = 120`
- `pendingDamage = 0`

Observed second-pass result:

- `decision = no_completion`
- `completed = false`
- `completedBuilding` remained unchanged from the first pass

## Controls

- `completion-time-not-reached`: `FAIL` / `unexpected-helper-result`
- `missing-identity`: `BLOCKED` / `missing-building-identity`
- `second-pass-completes-again`: `FAIL` / `unexpected-helper-result`
- `completed-fields-regress`: `FAIL` / `unexpected-helper-result`
- `unrelated-building-changed`: `FAIL` / `unexpected-helper-result`
- `production-helper-not-executed`: `BLOCKED` / `production-helper-not-executed`

## Exit Gate Correction

Prior weakness:

- control mode previously relied on a generic non-PASS exit path instead of an
  explicit expected-result contract
- an unexpected control `PASS` could therefore have reached the wrong exit
  behavior without an explicit fail-closed mismatch check

Corrected exit-code contract:

- baseline mode is unchanged: exit `0` only on `PASS`; `FAIL` or `BLOCKED`
  still exit nonzero
- control mode now compares the observed semantic result, branch reason, and
  helper-execution state against an explicit expected contract for that control
- an unexpected control `PASS`, wrong branch, wrong reason, or wrong
  helper-execution state now sets `process.exitCode = 1`

Expected semantic results and helper-execution states:

| Control | Expected result | Expected helper execution |
| --- | --- | --- |
| `completion-time-not-reached` | `FAIL` | `productionSourceExecution: true`, `sourceBoundaryExecuted: true` |
| `missing-identity` | `BLOCKED` | `productionSourceExecution: false`, `sourceBoundaryExecuted: false` |
| `second-pass-completes-again` | `FAIL` | `productionSourceExecution: true`, `sourceBoundaryExecuted: true` |
| `completed-fields-regress` | `FAIL` | `productionSourceExecution: true`, `sourceBoundaryExecuted: true` |
| `unrelated-building-changed` | `FAIL` | `productionSourceExecution: true`, `sourceBoundaryExecuted: true` |
| `production-helper-not-executed` | `BLOCKED` | `productionSourceExecution: false`, `sourceBoundaryExecuted: false` |

Baseline gate confirmation:

- the baseline PASS gate itself was left unchanged
- expected baseline exit behavior remains `0` only for `PASS`

## Explicit Exclusions

This test does **not** claim:

- PocketBase persistence success
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

`T052` is complete.
`T053` remains open.
