# Scenario 9 Owner Acceptance

Task authority: `T099` in `specs/002-characterization-tests/tasks.md`

Scenario wording:

`Late command acknowledgement cannot overwrite a newer local intent.`

Final classification:

`CURRENT_ACCEPTED_BEHAVIOR`

## Accepted Contract

The owner accepts the narrow source-backed reconciliation contract proven by
the replay evidence:

- a frozen local building, frozen server acknowledgement state, and explicit
  reconciliation context are enough for the real pure helper to choose
  `preserve_local` when the protected local intent is newer;
- the same helper chooses `accept_server` when no newer protected local intent
  exists;
- the helper projects the canonical remapped building without mutating its
  inputs;
- repeating the same frozen original inputs produces identical outputs;
- the stale projected-state identity-mismatch control remains fail-closed
  negative evidence, not a positive requirement of the accepted contract.

This acceptance applies only to the narrow replay-backed late-command
acknowledgement contract. It does not promote the broader Scenario 9 behavior.

## Evidence Basis

- `src/game/buildings/resolveLateAcknowledgementReconciliation.js`
- `tests/characterization/slice-c/scenario-09-reconciliation-seam.mjs`
- `tests/characterization/slice-c/scenario-09-replay-evidence.md`
- `Scenario Execution 1 = PASS`
- `Scenario Execution 2 = PASS`
- `comparison = IDENTICAL`
- `productionSourceExecution = true`
- `sourceBoundaryExecuted = true`

## Source-Backed Decisions

- `preserve_local` is the accepted decision when newer protected local intent
  should win.
- `accept_server` is the accepted decision when no newer protected local
  intent exists.
- `blocked_identity_mismatch` remains a valid fail-closed negative control for
  projected-state reentry with stale identity context.

## Protected Fields Proven by Evidence

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

## Unrelated Fields Proven Unchanged

- `reconciledState.localMarker`
- `reconciledState.localNested`
- `acceptedServerState.serverMarker`
- `acceptedServerState.serverNested`

## Why This Is Current Behavior

This is `CURRENT_ACCEPTED_BEHAVIOR` because the observed replay contract is
now supported by helper-backed evidence and explicit owner acceptance.

It is not:

- `LEGACY_COMPATIBILITY_BEHAVIOR`
- `KNOWN_BUG_DO_NOT_FREEZE`
- `UNCONFIRMED_RUNTIME_BEHAVIOR`
- `TARGET_INVARIANT_REQUIRES_OWNER_DECISION`

## Explicit Exclusions

This acceptance does **not** claim:

- late acknowledgement delivery correctness beyond the frozen replay contract
- duplicate acknowledgement handling
- replay idempotency for projected-state reentry as a normal lifecycle step
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

## Caller-Owned Work Outside Acceptance

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

## Residual Limitations

- The acceptance covers the narrow replay contract only.
- The replayed projected-state reentry control remains fail-closed negative
  evidence, not a positive broad-coverage claim.
- Broader lifecycle, ordering, and authority guarantees remain outside scope.

## Task State

- `T097`: complete: `yes`
- `T098`: complete: `yes`
- `T099`: complete: `yes`
- `T114`: complete: `yes`
