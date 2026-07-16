# Scenario 9 Replay Evidence

Task authority: `T098` in `specs/002-characterization-tests/tasks.md`

Exact Scenario 9 wording:

`Late command acknowledgement cannot overwrite a newer local intent.`

Exact narrow contract:

Given frozen local building state, frozen server acknowledgement state, and
explicit reconciliation context, the real pure helper deterministically chooses
`preserve_local` and projects the canonical remapped building without mutating
its inputs.

A separate frozen case proves `accept_server` when no newer protected local
intent exists.

Two complete executions rebuilt from identical original inputs produce
identical outputs.

Broad Scenario 9 classification remains:

`UNCONFIRMED_RUNTIME_BEHAVIOR`

## Replay Units

The repeatability units are:

- `scenarioExecution1`
- `scenarioExecution2`

Each complete scenario execution contains exactly one primary helper invocation
from the original frozen preserve-local input plus the separate frozen
accept-server case from its own original inputs.

Do **not** feed the first projected building back into the helper as the main
second pass. The projected-state reentry case is a negative control only.

## Why Projected-State Reentry Is Not The Main Unit

`App.tsx` clears the optimistic temp/canonical mapping immediately after the
first successful reconciliation.

The helper is deterministic, so repeating the same frozen original inputs
produces identical results.

Feeding `firstPass.projectedBuilding` back into the helper with the original
optimistic mapping is fail-closed negative evidence, not the main replay unit.

## Evidence Summary

### Scenario Execution 1

- result: `PASS`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`
- preserve-local case:
  - `decision`: `preserve_local`
  - `preserveLocal`: `true`
  - `acceptServer`: `false`
  - `blocked`: `false`
  - `blockedReason`: `undefined`
  - `identityRemap`: `{ tempId: 'temp-ack-9', docId: 'doc-ack-9' }`
  - `projectedBuilding` matches `expectedPreserveLocalResult`
  - source inputs remain unchanged
- accept-server case:
  - `decision`: `accept_server`
  - `preserveLocal`: `false`
  - `acceptServer`: `true`
  - `blocked`: `false`
  - `blockedReason`: `undefined`
  - `identityRemap`: `{ tempId: 'temp-ack-9', docId: 'doc-ack-9' }`
  - `projectedBuilding` matches `acceptServerCase.expectedOutputState`
  - source inputs remain unchanged

### Scenario Execution 2

- result: `PASS`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`
- preserve-local case:
  - `decision`: `preserve_local`
  - `preserveLocal`: `true`
  - `acceptServer`: `false`
  - `blocked`: `false`
  - `blockedReason`: `undefined`
  - `identityRemap`: `{ tempId: 'temp-ack-9', docId: 'doc-ack-9' }`
  - `projectedBuilding` matches `expectedPreserveLocalResult`
  - source inputs remain unchanged
- accept-server case:
  - `decision`: `accept_server`
  - `preserveLocal`: `false`
  - `acceptServer`: `true`
  - `blocked`: `false`
  - `blockedReason`: `undefined`
  - `identityRemap`: `{ tempId: 'temp-ack-9', docId: 'doc-ack-9' }`
  - `projectedBuilding` matches `acceptServerCase.expectedOutputState`
  - source inputs remain unchanged

### Comparison

- comparison: `IDENTICAL`
- no meaningful semantic field differs between the two executions
- JSON-safe normalization may omit only optional properties whose raw value is
  `undefined`, such as `blockedReason` on successful results
- normalization does not hide differences in `decision`, `projectedBuilding`,
  `identityRemap`, `preserveLocal`, `acceptServer`, or `blocked`

## Projected-State Negative Control

- control id: `projected-state-with-stale-identity-context`
- decision: `blocked_identity_mismatch`
- preserveLocal: `false`
- acceptServer: `false`
- blocked: `true`
- blockedReason: `identity-mismatch`
- identityRemap: `undefined`
- `projectedBuilding` remains the supplied canonical local building
- inputs remain unchanged
- `productionSourceExecution`: `true`
- `sourceBoundaryExecuted`: `true`

This is the concrete stale identity-mapping negative control. It is fail-closed
evidence, not the repeatability unit.

## Helper Validation Controls

These helper-executed blocked validations are already proven by the focused
seam test and fixture:

| Control | Decision | Reason | productionSourceExecution | sourceBoundaryExecuted |
| --- | --- | --- | --- | --- |
| `missing-local-building` | `blocked_missing_local_building` | `missing-local-building` | `true` | `true` |
| `missing-server-building` | `blocked_missing_server_building` | `missing-server-building` | `true` | `true` |
| `identity-mismatch` | `blocked_identity_mismatch` | `identity-mismatch` | `true` | `true` |
| `invalid-timestamp` | `blocked_invalid_timestamp` | `invalid-timestamp` | `true` | `true` |
| `invalid-acknowledgement-kind` | `blocked_invalid_acknowledgement_kind` | `invalid-acknowledgement-kind` | `true` | `true` |
| `projected-state-with-stale-identity-context` | `blocked_identity_mismatch` | `identity-mismatch` | `true` | `true` |

The broader ambiguous-identity-mapping concern is represented here by the
stale-identity projected-state control above.

## Declarative Pre-Boundary Controls

These controls are recorded in the fixture as declarative boundary checks and
are not executed as the main replay unit:

| Control | Decision | Reason | productionSourceExecution | sourceBoundaryExecuted |
| --- | --- | --- | --- | --- |
| `production-boundary-not-available` | `BLOCKED` | `production-boundary-not-available` | `false` | `false` |
| `live-pocketbase-required` | `BLOCKED` | `live-pocketbase-required` | `false` | `false` |
| `timeout-order-required` | `BLOCKED` | `timeout-order-required` | `false` | `false` |
| `reconnect-order-required` | `BLOCKED` | `reconnect-order-required` | `false` | `false` |
| `realtime-order-required` | `BLOCKED` | `realtime-order-required` | `false` | `false` |
| `multi-client-authority-required` | `BLOCKED` | `multi-client-authority-required` | `false` | `false` |

## Protected Fields

The fixture-proven protected fields remain stable:

- `reconciledState.id`
- `reconciledState.clientBuildTraceId`
- `reconciledState.buildingId`
- `reconciledState.ownerId`
- `reconciledState.x`
- `reconciledState.y`
- `reconciledState.zoneId`
- `reconciledState.type`
- `reconciledState.isLocal`
- `reconciledState.isConstructing`
- `reconciledState.constructionEndTime`
- `reconciledState.workState`
- `reconciledState.hp`
- `reconciledState.maxHp`
- `reconciledState.pendingDamage`
- `reconciledState.status`
- `reconciledState.syncState`
- `reconciledState.timestamp`
- `acceptedServerState.id`
- `acceptedServerState.clientBuildTraceId`
- `acceptedServerState.buildingId`
- `acceptedServerState.ownerId`
- `acceptedServerState.x`
- `acceptedServerState.y`
- `acceptedServerState.zoneId`
- `acceptedServerState.type`
- `acceptedServerState.isLocal`
- `acceptedServerState.isConstructing`
- `acceptedServerState.constructionEndTime`
- `acceptedServerState.workState`
- `acceptedServerState.hp`
- `acceptedServerState.maxHp`
- `acceptedServerState.pendingDamage`
- `acceptedServerState.status`
- `acceptedServerState.syncState`
- `acceptedServerState.timestamp`
- `expectedOutcome.identityRemap.tempId`
- `expectedOutcome.identityRemap.docId`

## Unrelated Fields

The fixture-proven unrelated fields remain unchanged:

- `reconciledState.localMarker`
- `reconciledState.localNested`
- `acceptedServerState.serverMarker`
- `acceptedServerState.serverNested`

## Helper Purity

The helper remains pure and deterministic. It does not own:

- PocketBase
- React setters
- refs or caches internally
- network
- subscriptions
- retries
- reconnect
- wall-clock reads
- collection iteration
- persistent fields
- synthetic acknowledgement tokens

## Caller-Owned Behavior Outside Replay

Caller-owned behavior remains in `App.tsx` and the PocketBase layer:

- App.tsx collection iteration
- ref lookups and updates
- optimistic temp/canonical mapping cleanup
- React state mutation
- PocketBase writes
- realtime subscriptions
- refetch
- retry/backoff
- timeout handling
- reconnect
- logging / tracing
- UI feedback
- multi-client conflict handling

## Explicit Exclusions

This replay evidence does **not** prove:

- actual late acknowledgement delivery correctness
- duplicate acknowledgement handling
- projected-state reentry as a normal lifecycle step
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
- The replayed negative control is fail-closed, not a positive idempotency
  claim.
- Broader lifecycle, ordering, and authority guarantees remain outside scope.

## Verification Results

- `node tests/characterization/slice-c/scenario-09-reconciliation-seam.mjs`: PASS
- `node --check tests/characterization/slice-c/scenario-09-reconciliation-seam.mjs`: PASS
- `node --check src/game/buildings/resolveLateAcknowledgementReconciliation.js`: PASS
- `npm run lint`: PASS
- `node check_regressions_worker6.mjs`: PASS 9/9
- `git diff --check`: PASS
- `git status --short --untracked-files=all`: clean before the doc update

## Task State

- `T097`: complete
- `T098`: complete
- `T099`: open
- `T114`: complete

