# Scenario 6 Repeatability

Task authority: `T077` in `specs/002-characterization-tests/tasks.md`

Accepted narrow contract:

`After a source-backed reward-eligible production building with workState === 'finished' is processed through the production reward seam, one reward transition is allowed and the projected consumed state has workState === 'idle'. Processing the same unchanged consumed state again does not allow a second reward transition.`

This note records repeatability for the already-verified reward-eligibility seam. It does not widen Scenario 6 beyond the narrow reward fence.

## Commands Executed

- `node tests/characterization/slice-b/scenario-06.mjs`
- `node tests/characterization/slice-b/scenario-06.mjs`
- `node tests/characterization/slice-b/scenario-06.mjs --control=reward-not-yet-eligible`
- `node tests/characterization/slice-b/scenario-06.mjs --control=missing-building-identity`
- `node tests/characterization/slice-b/scenario-06.mjs --control=second-pass-rewards-again`
- `node tests/characterization/slice-b/scenario-06.mjs --control=rewarded-state-regresses`
- `node tests/characterization/slice-b/scenario-06.mjs --control=unrelated-field-changed`
- `node tests/characterization/slice-b/scenario-06.mjs --control=production-boundary-not-available`
- `node tests/characterization/slice-b/scenario-06.mjs --control=reward-payload-mutation-required`
- `node tests/characterization/slice-b/scenario-06.mjs --control=live-pocketbase-required`
- `node tests/characterization/slice-b/scenario-06.mjs --control=unknown-control-name`
- `node --check tests/characterization/slice-b/scenario-06.mjs`
- `node --check src/game/buildings/resolveLocalRewardEligibility.js`
- `npm run lint`
- `node check_regressions_worker6.mjs`
- `git diff --check`
- `git status --short --untracked-files=all`

## Repeatability Result

The scenario-06 check was run twice as two complete top-level executions.
Each run internally produced `scenarioExecution1` and `scenarioExecution2`.
The two complete command outputs were identical.

### Run 1

- result: `PASS`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`
- internal `scenarioExecution1`: `PASS`
  - `firstPass`: `grant_reward`
  - `secondPass`: `no_reward`
- internal `scenarioExecution2`: `PASS`
  - `firstPass`: `grant_reward`
  - `secondPass`: `no_reward`
- comparison: `IDENTICAL`

### Run 2

- result: `PASS`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`
- internal `scenarioExecution1`: `PASS`
  - `firstPass`: `grant_reward`
  - `secondPass`: `no_reward`
- internal `scenarioExecution2`: `PASS`
  - `firstPass`: `grant_reward`
  - `secondPass`: `no_reward`
- comparison: `IDENTICAL`

## Stable Protected Fields

- `workState`
- `hp`
- `maxHp`
- `pendingDamage`

The consumed state is the projected `workState: 'idle'` result from the helper.

## Unchanged Unrelated Fields

- `x`
- `y`
- `zoneId`
- `ownerId`
- `isLocal`
- `timestamp`

## Control Summary

The controls were executed against the same narrow reward boundary and remained fail-closed.

| Control | Result | Reason | productionSourceExecution | sourceBoundaryExecuted | Exit code |
| --- | --- | --- | --- | --- | --- |
| `reward-not-yet-eligible` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `missing-building-identity` | `BLOCKED` | `missing-building-identity` | `true` | `true` | `0` |
| `second-pass-rewards-again` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `rewarded-state-regresses` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `unrelated-field-changed` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `production-boundary-not-available` | `BLOCKED` | `production-boundary-not-available` | `false` | `false` | `0` |
| `reward-payload-mutation-required` | `BLOCKED` | `reward-payload-mutation-required` | `false` | `false` | `0` |
| `live-pocketbase-required` | `BLOCKED` | `live-pocketbase-required` | `false` | `false` | `0` |
| `unknown-control-name` | `nonzero exit` | `Unsupported Scenario 6 characterization control "unknown-control-name"` | `n/a` | `n/a` | `1` |

## Verification Results

- `node --check tests/characterization/slice-b/scenario-06.mjs`: PASS
- `node --check src/game/buildings/resolveLocalRewardEligibility.js`: PASS
- `npm run lint`: PASS
- `node check_regressions_worker6.mjs`: PASS (9/9)
- `git diff --check`: PASS
- `git status --short --untracked-files=all`: clean

## Explicit Exclusions

This note does **not** claim:

- reward persistence
- exactly-once resource credit
- reconnect idempotency
- stale snapshot convergence
- server transactionality
- multi-client authority
- broad Scenario 6 behavior

## Residual Limitations

- The repeatability evidence covers only the narrow reward-eligibility fence.
- Reward, reconnect, and persistence guarantees remain separate contracts.
- The broader Scenario 6 wording remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside this subcase.

## Final Conclusion

- The repeatability check is stable.
- The fail-closed controls behaved as expected.
- The narrow reward seam remains the only supported contract here.
