# Scenario 6 Replay Evidence

Task authority: `T074` in `specs/002-characterization-tests/tasks.md`

Exact Scenario 6 wording:

`Production completion survives reconnect and rewards once.`

This note records the helper-backed replay evidence for the narrow reward
eligibility fence. It does not promote Scenario 6 broadly, and it does not
claim reward persistence, reconnect ordering, or multi-client authority.

## Evidence Basis

- Source audit: `tests/characterization/slice-b/scenario-06-source-audit.md`
- Classification: `tests/characterization/slice-b/scenario-06-classification.md`
- Seam decision: `tests/characterization/slice-b/scenario-06-seam.md`
- Fixture: `tests/characterization/slice-b/scenario-06-fixture.json`
- Focused seam test: `tests/characterization/slice-b/scenario-06-reward-seam.mjs`
- Live source anchors:
  - `App.tsx:14552-14664` `handleCollectProductionFromWorld(...)`
  - `App.tsx:14941-15033` `handleCollectProduction(...)`
  - `App.tsx:6553-6560` `updatePlayerResources(...)`
  - `data/buildings.ts:29968-30001` Cafe 2 production definition
  - `src/game/buildings/resolveLocalRewardEligibility.js`

## Replay Result

- `PASS`

Reason:

- The production helper executed directly and the two complete scenario
  executions compared `IDENTICAL`.

## Production-Boundary Status

- `production_boundary_available`
- `production helper executed = true`
- `source boundary executed = true`

## Production Helper Used

- `src/game/buildings/resolveLocalRewardEligibility.js`

## Source Branch Reviewed

- `App.tsx:14552-14664` `handleCollectProductionFromWorld(...)`
- `App.tsx:14941-15033` `handleCollectProduction(...)`
- `App.tsx:6553-6560` `updatePlayerResources(...)`
- `src/game/buildings/resolveLocalRewardEligibility.js`
- `tests/characterization/slice-b/scenario-06-reward-seam.mjs`
- `tests/characterization/slice-b/scenario-06-fixture.json`
- `data/buildings.ts:29968-30001` Cafe 2 production definition

The live source now shows a pure importable reward-eligibility fence in
`resolveLocalRewardEligibility(...)`, while `App.tsx` still owns reward
mutation, PocketBase writes, traces, refs, caches, retries, subscriptions, and
orchestration.

## Exact Command

The replay was executed with the real helper imported directly from
`src/game/buildings/resolveLocalRewardEligibility.js` and the frozen fixture
loaded from `tests/characterization/slice-b/scenario-06-fixture.json`. The
command ran the complete scenario twice, compared
`scenarioExecution1` and `scenarioExecution2`, and evaluated the declared
controls against the same helper-backed boundary.

## Scenario Execution 1

- status: `PASS`
- decision: `grant_reward`
- granted: `true`
- blocked: `false`
- sourceBoundaryExecuted: `true`
- productionSourceExecution: `true`

Protected fields:

- `workState = idle`
- `hp = 1632`
- `maxHp = 1632`
- `pendingDamage = 0`

Unchanged unrelated fields:

- `x = 18`
- `y = 11`
- `zoneId = zone-2`
- `ownerId = user-9`
- `isLocal = true`
- `timestamp = 1704067198200`

## Scenario Execution 2

- status: `PASS`
- decision: `no_reward`
- granted: `false`
- blocked: `false`
- sourceBoundaryExecuted: `true`
- productionSourceExecution: `true`

Protected fields:

- `workState = idle`
- `hp = 1632`
- `maxHp = 1632`
- `pendingDamage = 0`

Unchanged unrelated fields:

- `x = 18`
- `y = 11`
- `zoneId = zone-2`
- `ownerId = user-9`
- `isLocal = true`
- `timestamp = 1704067198200`

## Scenario Execution Comparison

- `scenarioExecution1` and `scenarioExecution2` are identical.
- Both scenario executions contain:
  - `firstPass -> grant_reward`
  - `secondPass -> no_reward`
- `firstPass` and `secondPass` are intra-execution stages, not the
  repeatability units.
- `productionSourceExecution` and `sourceBoundaryExecuted` are `true` in both
  runs.
- The PASS gate depends on the actual helper output, not a weakened status
  field.

## Controls

Each control is evaluated against the same narrow reward boundary. Unexpected
`PASS` would still be a harness failure and would not be treated as accepted
behavior.

| Control | Result | Reason | productionSourceExecution | sourceBoundaryExecuted | Exit code |
| --- | --- | --- | --- | --- | --- |
| `reward-not-yet-eligible` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `missing-building-identity` | `BLOCKED` | `missing-building-identity` | `false` | `false` | `0` |
| `second-pass-rewards-again` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `rewarded-state-regresses` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `unrelated-field-changed` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `production-boundary-not-available` | `BLOCKED` | `production-boundary-not-available` | `false` | `false` | `0` |
| `reward-payload-mutation-required` | `BLOCKED` | `reward-payload-mutation-required` | `false` | `false` | `0` |
| `live-pocketbase-required` | `BLOCKED` | `live-pocketbase-required` | `false` | `false` | `0` |

## Explicit Exclusions

This note does **not** claim:

- reward persistence
- exactly-once resource credit
- reconnect idempotency
- stale snapshot convergence
- server transactionality
- multi-client authority
- broad Scenario 6 behavior

## Limitations

- The replay proves only the narrow reward-eligibility transition.
- Reward, reconnect, and persistence guarantees remain separate contracts.
- The broad Scenario 6 wording remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside
  this subcase.

## Task State

- `T074` complete: `yes`
- `T075` remains open: `no` (owner acceptance recorded in `tests/characterization/slice-b/scenario-06-promotion.md`)
