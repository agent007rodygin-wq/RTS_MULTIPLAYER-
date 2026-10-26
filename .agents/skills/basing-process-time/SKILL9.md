---
name: basing-process-time
description: Use when changing construction, production, upgrades, destruction, offline catch-up, or any absolute timestamp or completion logic.
---

# Purpose

Keep process timing idempotent, replay-safe, and anchored to persisted end
timestamps.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-state-ownership`
- `basing-pocketbase-contracts`

## Sources Of Truth

- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/07-production-system.md`
- `specs/_baseline/08-upgrade-system.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Core Rules

- Persist absolute end timestamps, not countdown-only state.
- Local countdowns are display-only.
- Earlier end times complete earlier.
- Completion is exactly once.
- Reloads and reconnects do not reset a persisted process.
- Time units must be explicit and converted in one direction only.
- Track `destructionStartedAt` alongside the persisted end fields when the
  process uses destruction windows.
- A closed tab, a clock drift, or a reconnect is a replay condition, not a
  special timing mode.
- process isolation means one process cannot finalize another process.
- A later `endsAt` cannot complete before an earlier `endsAt`.

## Common Failure Modes

- Replacing persisted timestamps with countdown-only state.
- Treating reconnect as restart instead of replay.
- Letting a stale completion race win.

## Never Do

- Invent a timer field without a source anchor.
- Make local countdowns authoritative.
- Complete a process twice.

## Examples

- Good: build finishes after reconnect because `endsAt` was already persisted.
- Wrong: reset the timer when the tab reloads.

## Workflow

1. Identify the process family.
2. Map the persisted fields and the completion fence.
3. Trace the offline catch-up and reload path.
4. Check duplicate completion and reward emission.
5. Then patch the narrowest timing rule.

## Invariants

- One stable process identity survives reloads.
- Timer-backed processes are idempotent.
- A UI countdown never outranks persisted state.
- A stale response cannot rewrite newer process state.
- `destructionEndTime`, `destructionStartedAt`, and related end-time fields are
  handled as persisted process data, not transient UI state.

## Stop Conditions

- The logic depends only on local countdown state.
- A new timer field would be added without a source anchor.
- The change would alter reward timing or process identity.

## Verification

- Confirm the relevant timestamp fields in source and baseline.
- Confirm offline catch-up and reload behavior are still idempotent.
- Confirm the process family still uses canonical absolute time.

## Completion Report

- List the affected process family and fields.
- State whether exactly-once completion still holds.
- Note any replay, reconnect, or clock-skew risk.
