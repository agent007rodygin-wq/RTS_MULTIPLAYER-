# Scenario 7 Owner Acceptance

Task authority: `T083` in `specs/002-characterization-tests/tasks.md`

Accepted contract:

`A source-backed source building with buildingId 301 is transformed once through the real upgrade-transformation seam into the projected target construction-shaped state with buildingId 306. Processing the same unchanged already-transformed target state again produces no second transformation.`

Important terminology:

This acceptance covers the upgrade-start / target-replacement transformation
entering construction.

It does not describe the behavior as a full upgrade completion claim if the
live source does not support that framing.

## Final Classification

`CURRENT_ACCEPTED_BEHAVIOR`

## Evidence Basis

- `src/game/buildings/resolveLocalUpgradeTransformation.js`
- `tests/characterization/slice-b/scenario-07-upgrade-seam.mjs`
- `tests/characterization/slice-b/scenario-07-replay-evidence.md`
- `T112` pure importable helper exists
- `App.tsx` delegates the transformation decision to the helper
- `productionSourceExecution = true`
- `sourceBoundaryExecuted = true`
- `Scenario Execution 1 = PASS`
- `Scenario Execution 2 = PASS`
- `comparison = IDENTICAL`
- `first pass = transform_upgrade`
- `second pass = no_transformation`

## Source-Backed Pair

- source buildingId = `301`
- target buildingId = `306`
- target type = `town_hall`

## Accepted Projected Target State

- `buildingId = 306`
- `type = town_hall`
- `isConstructing = true`
- `constructionEndTime = 1704067640000`
- `hp = 232`
- `maxHp = 232`
- `pendingDamage = 0`

## Accepted Behavior

- first eligible source state transforms once
- projected target state matches the helper output
- source input remains unchanged
- unchanged transformed target state does not transform again
- protected fields remain stable
- unrelated fields remain unchanged

## Protected Fields Proven by Evidence

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

## Unrelated Fields Proven Unchanged

- `ownerId`
- `x`
- `y`
- `zoneId`
- `isLocal`
- `timestamp`
- `customTag`
- `upgradeAudit`

## Owner Acceptance

I explicitly accept the observed narrow Scenario 7 upgrade-transformation
contract above as `CURRENT_ACCEPTED_BEHAVIOR`.

This acceptance applies only to the narrow source-backed upgrade
transformation that enters construction and projects the transformed target
state once.

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

- upgrade persistence exactly once
- cost / resource deduction exactly once
- PocketBase transactionality
- duplicate-write prevention
- reconnect / reload idempotency
- stale snapshot convergence
- multi-client authority
- retry / timeout guarantees
- construction completion
- broad Scenario 7 behavior

## Caller-Owned Work Outside Acceptance

The following remain outside this acceptance and stay owned by `App.tsx`:

- resource / cost deduction
- PocketBase writes
- optimistic UI
- React state
- traces
- refs / caches
- retries
- subscriptions
- reconnect orchestration
- snapshot merge
- construction completion

## Residual Limitations

- Upgrade persistence exactly once remains unproven.
- Cost / resource deduction exactly once remains unproven.
- PocketBase transactionality remains unproven.
- Duplicate-write prevention remains unproven.
- Reconnect / reload idempotency remains unproven.
- Stale-snapshot convergence remains unproven.
- Multi-client authority remains unproven.
- Retry / timeout guarantees remain unproven.
- Construction completion remains a separate contract.
- The broader Scenario 7 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside this
  narrow accepted seam.

## Task State

- `T083` complete: `yes`
- `T084` remains open: `yes`
- `T112` remains complete: `yes`
