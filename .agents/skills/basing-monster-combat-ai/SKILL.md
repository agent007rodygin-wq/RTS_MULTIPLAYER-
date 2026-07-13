---
name: basing-monster-combat-ai
description: Use when adjusting monster spawn, respawn, target selection, movement, attacks, destruction, or combat cooldowns.
---

# Purpose

Keep monster combat deterministic and replay-safe.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-change-safety`
- `basing-pocketbase-contracts`
- `basing-process-time`
- `basing-state-ownership`
- `basing-realtime-sync`

## Sources Of Truth

- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `App.tsx`
- `data/destructionWeapons.ts`
- `src/game/ui/actionOptions.ts`

## Core Rules

- Target lock, cooldowns, and destruction timing must be deterministic.
- A monster cannot double-hit or double-destroy a target.
- Spawn and respawn timing must respect the authoritative process model.
- Server writes must match the combat decision chain, not override it.
- Use `basing-realtime-sync` when the issue is stale targets or late snapshots.
- Keep already-destroyed targets suppressed.

## Common Failure Modes

- Changing damage while chasing stale snapshots.
- Letting target selection and destruction rules drift apart.
- Assuming a cooldown race is "just lag".

## Never Do

- Change damage, cooldown, or respawn rate silently.
- Let a destroyed target resurrect from a late event.
- Split combat state across helpers without source proof.

## Examples

- Good: trace selection -> lock -> damage -> destruction before patching.
- Wrong: adjust combat numbers when the real issue is realtime ordering.

## Workflow

1. Trace the chain: selection -> lock -> movement -> cooldown -> damage ->
   destruction -> persistence.
2. Check the owning state slice and the persisted timer fields.
3. Confirm how the combat loop writes to PocketBase.
4. Patch only the branch that owns the incorrect transition.

## Invariants

- Monster ids and target ids stay stable through the decision chain.
- Combat cooldowns are explicit and bounded.
- Respawn is not a hidden side effect of a stale snapshot.
- A destroyed target stays destroyed.

## Stop Conditions

- The change would alter damage, cooldowns, or respawn rate without source
  proof.
- The source does not show who owns the combat state.
- The task turns into a broader economy or building change.

## Verification

- Run `node check_regressions_worker6.mjs` and expect the confirmed baseline
  to remain `9/9 PASS`.
- Confirm the trace chain in source.
- Confirm cooldown and destruction fields still line up with the baseline.
- Confirm stale or duplicate combat events cannot win.

## Classification Notes

- A helper pattern failure is not automatically a runtime bug.
- A runtime bug is not automatically a stale helper expectation.
- Classify the helper and the runtime separately.

## Completion Report

- List the combat surface that changed.
- State whether spawn, respawn, or damage semantics shifted.
- Note any remaining race or retry risk.
