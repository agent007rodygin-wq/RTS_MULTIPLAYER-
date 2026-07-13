---
name: basing-optimistic-commands
description: Use when a player action mutates local state before server ack, needs rollback, or can be submitted twice.
---

# Purpose

Make local-first commands explicit about mutation, ack, rollback, and late
responses.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-change-safety`
- `basing-pocketbase-contracts`
- `basing-state-ownership`

## Sources Of Truth

- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/04-pocketbase-contracts.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Core Rules

- Every optimistic command needs a pre-state, local mutation, server write,
  success reconciliation, error rollback, duplicate guard, and late-response
  policy.
- Local state is provisional until the server confirms it.
- Tombstones and in-flight refs are suppression helpers, not truth.
- Never invent rollback semantics that the source does not prove.

## Common Failure Modes

- Forgetting rollback after local mutation.
- Allowing duplicate submits to create duplicate effects.
- Letting late acks overwrite newer intent.

## Never Do

- Promote provisional state to truth.
- Invent rollback semantics the source does not prove.
- Hide a second source of truth.

## Examples

- Good: place a building with a temp id, reconcile, and roll back on error.
- Wrong: keep local inventory authoritative after server reject.

## Operation Inventory

- building placement
- move
- upgrade
- production start
- production collect
- protection
- explosion
- pickup
- repair
- active toggle
- bank withdrawal
- clan join / leave

## Workflow

1. Identify the command family.
2. Trace the local-first path and the server ack path.
3. Write down the rollback or compensation boundary.
4. Check duplicate-submit and late-response guards.
5. Confirm the command still respects the owner model.

## Invariants

- One command, one identity.
- Duplicate clicks do not become duplicate effects.
- Late acks cannot overwrite newer intent.
- A failed optimistic command must either roll back or be explicitly repaired.

## Stop Conditions

- The command has no clear rollback or compensation boundary.
- The task would silently create a second source of truth.
- The change needs timing or realtime behavior, so open those skills too.

## Verification

- Confirm the command name, temp ids, and duplicate guard in source.
- Confirm the rollback or repair path matches the current contract.
- Confirm the late-response policy is explicit.

## Completion Report

- Name the command family and its optimistic mutation.
- State whether rollback is full, partial, or absent.
- Record any remaining ack, retry, or duplicate risk.
