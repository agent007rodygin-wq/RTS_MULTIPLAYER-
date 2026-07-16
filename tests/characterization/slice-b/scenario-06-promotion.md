# Scenario 6 Owner Acceptance

Task authority: `T075` in `specs/002-characterization-tests/tasks.md`

Accepted contract:

`After a source-backed reward-eligible production building with workState === 'finished' is processed through the production reward seam, one reward transition is allowed and the projected consumed state has workState === 'idle'. Processing the same unchanged consumed state again does not allow a second reward transition.`

## Final Classification

`CURRENT_ACCEPTED_BEHAVIOR`

## Evidence Basis

- `src/game/buildings/resolveLocalRewardEligibility.js`
- `tests/characterization/slice-b/scenario-06-reward-seam.mjs`
- `tests/characterization/slice-b/scenario-06-replay-evidence.md`
- `Scenario Execution 1: PASS`
- `Scenario Execution 2: PASS`
- `comparison: IDENTICAL`
- in both executions:
  - `firstPass = grant_reward`
  - `secondPass = no_reward`
  - `productionSourceExecution = true`
  - `sourceBoundaryExecuted = true`
- both App.tsx collection handlers delegate to the pure helper boundary

## Source-Backed State Model

- eligible: `workState === 'finished'`
- consumed projected state: `workState === 'idle'`

## Accepted Protected Behavior

- first eligible pass grants one reward transition
- projected consumed state becomes idle
- unchanged idle state denies another reward transition
- input is not mutated
- protected fields remain stable
- unrelated fields remain unchanged

## Protected Fields Proven by Evidence

- `workState`
- `hp`
- `maxHp`
- `pendingDamage`

## Unrelated Fields Proven Unchanged

- `x`
- `y`
- `zoneId`
- `ownerId`
- `isLocal`
- `timestamp`

## Owner Acceptance

I explicitly accept the observed narrow Scenario 6 reward-eligibility
contract above as `CURRENT_ACCEPTED_BEHAVIOR`.

This acceptance applies only to the pure reward-eligibility decision and the
projected consumed state.

## Why This Is Current Behavior

This is `CURRENT_ACCEPTED_BEHAVIOR` because the behavior is now supported by
helper-backed replay evidence and explicit owner acceptance.

It is not:

- `LEGACY_COMPATIBILITY_BEHAVIOR`
- `KNOWN_BUG_DO_NOT_FREEZE`
- `UNCONFIRMED_RUNTIME_BEHAVIOR`
- `TARGET_INVARIANT_REQUIRES_OWNER_DECISION`

## Explicit Exclusions

This acceptance does **not** claim:

- actual reward/resource persistence exactly once
- `updatePlayerResources(...)` exactly once
- inventory/resource credit exactly once
- completion and reward atomicity
- PocketBase transactionality
- duplicate-write prevention
- reconnect/reload idempotency
- stale snapshot convergence
- multi-client authority
- retry / timeout side-effect guarantees
- production completion
- broad Scenario 6 behavior

## Caller-Owned Work Outside Acceptance

The following remain outside this acceptance and stay owned by `App.tsx`:

- reward payload calculation
- `updatePlayerResources(...)`
- inventory/resource mutation
- PocketBase writes
- optimistic UI
- traces
- refs / caches
- retries
- subscriptions
- orchestration

## Residual Limitations

- Reward persistence exactly once remains unproven.
- Inventory / resource credit exactly once remains unproven.
- Completion and reward atomicity remain unproven.
- PocketBase transactionality remains unproven.
- Duplicate-write prevention remains unproven.
- Reconnect / reload idempotency remains unproven.
- Stale-snapshot convergence remains unproven.
- Multi-client authority remains unproven.
- Retry / timeout side effects remain unproven.
- Production completion remains a separate contract.
- The broader Scenario 6 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside this
  narrow reward-eligibility subcase.

## Task State

- `T075` complete: `yes`
- `T076` remains open: `yes`
- `T111` remains complete: `yes`
