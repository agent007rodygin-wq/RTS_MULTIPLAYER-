---
name: basing-buildings-production-upgrades
description: Use when changing building placement, construction, production, collection, upgrades, speed-up, or deletion-protection behavior.
---

# Purpose

Keep the building lifecycle compatible while touching only the narrow operation
under review.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-change-safety`
- `basing-pocketbase-contracts`
- `basing-process-time`
- `basing-optimistic-commands`
- `basing-state-ownership`

## Sources Of Truth

- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/07-production-system.md`
- `specs/_baseline/08-upgrade-system.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`
- `data/buildings.ts`
- `types.ts`

## Core Rules

- Preserve building IDs, costs, durations, rewards, and max hp.
- Use `basing-process-time` for any end-time or catch-up question.
- Use `basing-optimistic-commands` for local-first placement, collection, or
  speed-up paths.
- Upgrades keep construction semantics unless source proves a different
  contract.
- Deletion protection and offline completion stay idempotent.

## Surface Details

- Placement covers validation, costs, limits, population, temporary IDs,
  persistence, rollback, `oil rig`, and `quarry`.
- Production covers `consumes`, `produces`, `sometimesProduces`, gold, tax,
  transformations, and offline completion.
- Upgrades cover `buildingId` transformations, construction-shaped upgrade
  flow, `hp` / `maxHp`, and speed-up rollback gaps.
- buildingId transformations are part of the upgrade surface.
- deletion protection is part of the lifecycle, not an afterthought.

## Common Failure Modes

- Broadening one lifecycle fix into a balance rewrite.
- Mixing process timing with optimistic rollback.
- Changing upgrade semantics while handling a single building branch.

## Never Do

- Change costs, durations, rewards, or building IDs silently.
- Move deletion protection into a hidden side rule.
- Touch unrelated lifecycle phases while patching one branch.

## Examples

- Good: patch one upgrade branch, then verify the persisted end-time path.
- Wrong: refactor all building flows while fixing one speed-up bug.

## Workflow

1. Classify the operation: placement, production, upgrade, speed-up, collect,
   or delete.
2. Read the canonical config in `data/buildings.ts`.
3. Trace the persisted fields and the local-first mutation path.
4. Check the compensation or rollback boundary.
5. Patch only the targeted lifecycle branch.

## Invariants

- Building IDs are canonical.
- Balance facts come from source, not memory.
- Construction, production, and upgrade flows must still converge after a
  reload.
- A building operation without a completion fence is incomplete.

## Stop Conditions

- The edit would alter costs, durations, rewards, or building IDs.
- The task needs a schema migration or a broader economy change.
- The source does not prove the operation's rollback or completion path.

## Verification

- Confirm the exact operation path and state fields in source.
- Confirm the config fields still match the intended lifecycle.
- Confirm no balance or identity change slipped in.

## Completion Report

- List the affected lifecycle operations.
- State whether balance-sensitive fields stayed untouched.
- Note any delete, rollback, or replay risk that remains.
