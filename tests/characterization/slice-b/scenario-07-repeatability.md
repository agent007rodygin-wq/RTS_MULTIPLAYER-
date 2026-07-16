# Scenario 7 Repeatability

Task authority: `T085` in `specs/002-characterization-tests/tasks.md`

Exact accepted contract:

`A source-backed source building with buildingId 301 is transformed once through the real upgrade-transformation seam into the projected target construction-shaped state with buildingId 306. Processing the same unchanged already-transformed target state again produces no second transformation.`

This note records repeatability for the narrow upgrade-transformation seam only. It does not promote Scenario 7 broadly.

## Exact Commands

- `node tests/characterization/slice-b/scenario-07.mjs`
- `node tests/characterization/slice-b/scenario-07.mjs`
- `node tests/characterization/slice-b/scenario-07.mjs --control=upgrade-not-eligible`
- `node tests/characterization/slice-b/scenario-07.mjs --control=missing-building-identity`
- `node tests/characterization/slice-b/scenario-07.mjs --control=missing-source-building`
- `node tests/characterization/slice-b/scenario-07.mjs --control=missing-target-building`
- `node tests/characterization/slice-b/scenario-07.mjs --control=already-transformed-target`
- `node tests/characterization/slice-b/scenario-07.mjs --control=second-pass-transforms-again`
- `node tests/characterization/slice-b/scenario-07.mjs --control=transformed-state-regresses`
- `node tests/characterization/slice-b/scenario-07.mjs --control=unrelated-field-changed`
- `node tests/characterization/slice-b/scenario-07.mjs --control=production-boundary-not-available`
- `node tests/characterization/slice-b/scenario-07.mjs --control=live-pocketbase-required`
- `node tests/characterization/slice-b/scenario-07.mjs --control=reconnect-order-required`
- `node tests/characterization/slice-b/scenario-07.mjs --control=unknown-control-name`
- `node --check tests/characterization/slice-b/scenario-07.mjs`
- `node --check src/game/buildings/resolveLocalUpgradeTransformation.js`
- `npm run lint`
- `node check_regressions_worker6.mjs`
- `git diff --check`
- `git status --short --untracked-files=all`

## Repeatability Result

- Characterization Run 1: PASS
- Characterization Run 2: PASS
- comparison: IDENTICAL
- productionSourceExecution: true
- sourceBoundaryExecuted: true

The repeatability units are `Scenario Execution 1` and `Scenario Execution 2`.
`firstPass` and `secondPass` are stages inside one execution.

## Scenario Execution 1

- firstPass: `transform_upgrade`
- secondPass: `no_transformation`
- projected building matches the fixture: `true`
- source input was not mutated: `true`

Protected fields remained stable:

- `buildingId`
- `type`
- `isConstructing`
- `constructionEndTime`
- `lastAttackTime`
- `isDestroying`
- `destructionStatus`
- `hp`
- `maxHp`
- `pendingDamage`

Unrelated fields remained unchanged:

- `id`
- `ownerId`
- `x`
- `y`
- `zoneId`
- `isLocal`
- `timestamp`
- `customTag`
- `upgradeAudit`

## Scenario Execution 2

- firstPass: `transform_upgrade`
- secondPass: `no_transformation`
- projected building matches the fixture: `true`
- source input was not mutated: `true`

Protected fields remained stable:

- `buildingId`
- `type`
- `isConstructing`
- `constructionEndTime`
- `lastAttackTime`
- `isDestroying`
- `destructionStatus`
- `hp`
- `maxHp`
- `pendingDamage`

Unrelated fields remained unchanged:

- `id`
- `ownerId`
- `x`
- `y`
- `zoneId`
- `isLocal`
- `timestamp`
- `customTag`
- `upgradeAudit`

## Control Summary

| Control | Result | Reason | productionSourceExecution | sourceBoundaryExecuted | Exit gate |
| --- | --- | --- | --- | --- | --- |
| `upgrade-not-eligible` | `BLOCKED` | `invalid-upgrade-state` | `true` | `true` | matched |
| `missing-building-identity` | `BLOCKED` | `missing-building-identity` | `true` | `true` | matched |
| `missing-source-building` | `BLOCKED` | `missing-source-building-definition` | `true` | `true` | matched |
| `missing-target-building` | `BLOCKED` | `missing-target-building-definition` | `true` | `true` | matched |
| `already-transformed-target` | `PASS` | `accepted-narrow-upgrade-transformation-contract-held` | `true` | `true` | matched |
| `second-pass-transforms-again` | `FAIL` | `unexpected-helper-result` | `true` | `true` | matched |
| `transformed-state-regresses` | `FAIL` | `unexpected-helper-result` | `true` | `true` | matched |
| `unrelated-field-changed` | `FAIL` | `unexpected-helper-result` | `true` | `true` | matched |
| `production-boundary-not-available` | `BLOCKED` | `production-boundary-not-available` | `false` | `false` | matched |
| `live-pocketbase-required` | `BLOCKED` | `live-pocketbase-required` | `false` | `false` | matched |
| `reconnect-order-required` | `BLOCKED` | `reconnect-order-required` | `false` | `false` | matched |
| `unknown-control-name` | non-zero exit | `Unsupported Scenario 7 characterization control "unknown-control-name"` | n/a | n/a | n/a |

## Why The Positive Control Passes

`already-transformed-target` is the positive idempotency control. It starts from
the already-transformed target state, so the real helper executes normally and
returns `no_transformation` on both passes. That is the correct PASS outcome
because it proves the helper does not transform the same already-transformed
state a second time.

## Explicit Exclusions

This note does not claim:

- PocketBase persistence
- resource deduction
- reconnect ordering
- stale snapshot convergence
- retry behavior
- construction completion
- broader Scenario 7 behavior

## Verification Result

- `node tests/characterization/slice-b/scenario-07.mjs`: PASS
- `node tests/characterization/slice-b/scenario-07.mjs`: PASS
- `node --check tests/characterization/slice-b/scenario-07.mjs`: PASS
- `node --check src/game/buildings/resolveLocalUpgradeTransformation.js`: PASS
- `npm run lint`: PASS
- `node check_regressions_worker6.mjs`: PASS 9/9
- `git diff --check`: PASS
- `git status --short --untracked-files=all`: shows only the two expected docs changes

## Task State

- `T085` complete: `yes`
- `T086` remains open: `yes`
