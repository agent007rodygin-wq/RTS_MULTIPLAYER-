# Scenario 9 Repeatability

Task authority:

- `specs/002-characterization-tests/tasks.md` T101
- `tests/characterization/slice-c/scenario-09.mjs`
- `tests/characterization/slice-c/scenario-09-fixture.json`
- `src/game/buildings/resolveLateAcknowledgementReconciliation.js`
- checkpoint under verification: `1e6e27d` (`test: add late acknowledgement characterization`)

Exact T101 row:

`[ ] T101 [US3] Run the scenario-9 check twice from \`tests/characterization/slice-c/scenario-09.mjs\` and confirm the old ack never wins over newer intent; record the result in \`tests/characterization/slice-c/scenario-09-repeatability.md\`. (SC-007, SC-009)`

Exact Scenario 9 wording:

`Late command acknowledgement cannot overwrite a newer local intent.`

Accepted narrow contract:

- `preserve_local` when protected newer local intent must win
- `accept_server` when no protected newer local intent exists
- deterministic projection from frozen original inputs
- fail-closed `blocked_identity_mismatch` for stale identity context

Classification:

- narrow contract: `CURRENT_ACCEPTED_BEHAVIOR`
- broad Scenario 9: `UNCONFIRMED_RUNTIME_BEHAVIOR`

Process-level methodology:

- every run used a fresh Node process
- no App mount occurred
- no PocketBase connection occurred
- no network, realtime, or reconnect path occurred
- no live `Date.now` or random dependency was used
- the permanent test imported the real helper and loaded the real fixture

## Baseline Executions

The permanent Scenario 9 characterization was run three times in separate fresh Node processes.

| Run | Command | Exit | Result | Reason | Scenario Execution 1 | Scenario Execution 2 | Comparison | productionSourceExecution | sourceBoundaryExecuted | exitGate.matched | Semantic comparison |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Run 1 | `node tests/characterization/slice-c/scenario-09.mjs` | `0` | `PASS` | `accepted-narrow-late-ack-contract-held` | `PASS` | `PASS` | `IDENTICAL` | `true` | `true` | `true` | identical to Runs 2 and 3 |
| Run 2 | `node tests/characterization/slice-c/scenario-09.mjs` | `0` | `PASS` | `accepted-narrow-late-ack-contract-held` | `PASS` | `PASS` | `IDENTICAL` | `true` | `true` | `true` | identical to Runs 1 and 3 |
| Run 3 | `node tests/characterization/slice-c/scenario-09.mjs` | `0` | `PASS` | `accepted-narrow-late-ack-contract-held` | `PASS` | `PASS` | `IDENTICAL` | `true` | `true` | `true` | identical to Runs 1 and 2 |

Cross-run comparison:

- Run 1 vs Run 2: `IDENTICAL`
- Run 1 vs Run 3: `IDENTICAL`
- Run 2 vs Run 3: `IDENTICAL`

The three full parsed JSON reports were compared directly as semantic objects.
No semantic normalization was needed for the baseline runs.

## Representative Control Repeatability

Each representative control was run twice in fresh Node processes.

| Control | Run 1 | Run 2 | Exit codes | Result / reason | Flags | exitGate.matched | Cross-run |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `preserve-local` | `PASS` | `PASS` | `0 / 0` | `PASS` / `preserve_local` | `true / true` both runs | `true` both runs | `IDENTICAL` |
| `accept-server` | `PASS` | `PASS` | `0 / 0` | `PASS` / `accept_server` | `true / true` both runs | `true` both runs | `IDENTICAL` |
| `projected-state-with-stale-identity-context` | `BLOCKED` | `BLOCKED` | `0 / 0` | `BLOCKED` / `identity-mismatch` | `true / true` both runs | `true` both runs | `IDENTICAL` |
| `production-boundary-not-available` | `BLOCKED` | `BLOCKED` | `0 / 0` | `BLOCKED` / `production-boundary-not-available` | `false / false` both runs | `true` both runs | `IDENTICAL` |
| `protected-field-regresses` | `FAIL` | `FAIL` | `0 / 0` | `FAIL` / `unexpected-helper-result` | `true / true` both runs | `true` both runs | `IDENTICAL` |

The repeatable representative controls prove that the helper-backed control
contract is stable across fresh process boundaries.

## Full Fixture Control Sweep

Every declared control in `tests/characterization/slice-c/scenario-09-fixture.json`
was run once and matched the fixture contract.

| Control | Expected | Actual | Expected reason | Actual reason | Expected flags | Actual flags | Exit | exitGate.matched |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `preserve-local` | `PASS` | `PASS` | `preserve_local` | `preserve_local` | `true / true` | `true / true` | `0` | `true` |
| `accept-server` | `PASS` | `PASS` | `accept_server` | `accept_server` | `true / true` | `true / true` | `0` | `true` |
| `identity-remap` | `PASS` | `PASS` | `preserve_local` | `preserve_local` | `true / true` | `true / true` | `0` | `true` |
| `protected-field-regresses` | `FAIL` | `FAIL` | `unexpected-helper-result` | `unexpected-helper-result` | `true / true` | `true / true` | `0` | `true` |
| `unrelated-field-changed` | `FAIL` | `FAIL` | `unexpected-helper-result` | `unexpected-helper-result` | `true / true` | `true / true` | `0` | `true` |
| `missing-local-building` | `BLOCKED` | `BLOCKED` | `missing-local-building` | `missing-local-building` | `true / true` | `true / true` | `0` | `true` |
| `missing-server-building` | `BLOCKED` | `BLOCKED` | `missing-server-building` | `missing-server-building` | `true / true` | `true / true` | `0` | `true` |
| `missing-local-interaction-at` | `BLOCKED` | `BLOCKED` | `invalid-timestamp` | `invalid-timestamp` | `true / true` | `true / true` | `0` | `true` |
| `missing-last-server-sync-at` | `BLOCKED` | `BLOCKED` | `invalid-timestamp` | `invalid-timestamp` | `true / true` | `true / true` | `0` | `true` |
| `invalid-timestamp` | `BLOCKED` | `BLOCKED` | `invalid-timestamp` | `invalid-timestamp` | `true / true` | `true / true` | `0` | `true` |
| `invalid-acknowledgement-kind` | `BLOCKED` | `BLOCKED` | `invalid-acknowledgement-kind` | `invalid-acknowledgement-kind` | `true / true` | `true / true` | `0` | `true` |
| `projected-state-with-stale-identity-context` | `BLOCKED` | `BLOCKED` | `identity-mismatch` | `identity-mismatch` | `true / true` | `true / true` | `0` | `true` |
| `production-boundary-not-available` | `BLOCKED` | `BLOCKED` | `production-boundary-not-available` | `production-boundary-not-available` | `false / false` | `false / false` | `0` | `true` |
| `live-pocketbase-required` | `BLOCKED` | `BLOCKED` | `live-pocketbase-required` | `live-pocketbase-required` | `false / false` | `false / false` | `0` | `true` |
| `timeout-order-required` | `BLOCKED` | `BLOCKED` | `timeout-order-required` | `timeout-order-required` | `false / false` | `false / false` | `0` | `true` |
| `reconnect-order-required` | `BLOCKED` | `BLOCKED` | `reconnect-order-required` | `reconnect-order-required` | `false / false` | `false / false` | `0` | `true` |
| `realtime-order-required` | `BLOCKED` | `BLOCKED` | `realtime-order-required` | `realtime-order-required` | `false / false` | `false / false` | `0` | `true` |
| `multi-client-authority-required` | `BLOCKED` | `BLOCKED` | `multi-client-authority-required` | `multi-client-authority-required` | `false / false` | `false / false` | `0` | `true` |

## Unknown-Control Evidence

The unsupported control contract was also repeatable across fresh processes.

| Run | Command | Exit | Shared error contract |
| --- | --- | --- | --- |
| Unknown 1 | `node tests/characterization/slice-c/scenario-09.mjs --control=unknown-control-name` | `1` | Same unsupported-control error message and type signature |
| Unknown 2 | `node tests/characterization/slice-c/scenario-09.mjs --control=unknown-control-name` | `1` | Same unsupported-control error message and type signature |

The script rejects unsupported controls by throwing
`Unsupported Scenario 9 characterization control "unknown-control-name"`.
Stack-trace formatting is not treated as semantic evidence.

## Input Immutability And Projection Evidence

The permanent test proves:

- local input unchanged
- server input unchanged
- reconciliation context unchanged
- preserve-local projection matches `expectedPreserveLocalResult`
- accept-server projection matches `acceptServerCase.expectedOutputState`
- unrelated fields remain unchanged
- stale projected-state reentry is fail-closed with `blocked_identity_mismatch`

## Fail-Closed Gate Evidence

The baseline exit gate now requires all of:

- `report.result === 'PASS'`
- `report.reason === ACCEPTED_RESULT_REASON`
- `report.productionSourceExecution === true`
- `report.sourceBoundaryExecuted === true`

The permanent test also verifies in-memory that baseline-gate copies with a
wrong reason, `productionSourceExecution = false`, or
`sourceBoundaryExecuted = false` all produce `matched = false`.

## Explicit Exclusions

This repeatability evidence does **not** prove:

- actual late acknowledgement delivery correctness
- duplicate acknowledgement handling
- mapping cleanup exactly once
- realtime ordering
- refetch ordering
- timeout ordering
- retry correctness
- reconnect convergence
- stale snapshot convergence
- full collection-level reconciliation
- cross-client authority
- server compare-and-swap
- server transactionality
- broad Scenario 9 correctness

## Residual Limitations

- The evidence covers the narrow replay contract only.
- The replayed projected-state reentry control remains fail-closed negative
  evidence, not a positive broad-coverage claim.
- Caller lifecycle and network-order guarantees remain outside scope.
- Optimistic mapping cleanup remains caller-owned and unproven here.
- Duplicate acknowledgement delivery remains unproven.
- Multi-client authority remains unproven.

## Final Decision

`REPEATABILITY_CONFIRMED`

## Task State

- `T100`: complete
- `T101`: complete
- `T114`: complete
