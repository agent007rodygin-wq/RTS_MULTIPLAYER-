---
name: basing-change-safety
description: Use when making or reviewing any code, data, or doc change that could affect runtime behavior, persistence, timers, balance, saves, or protected paths.
---

# Purpose

Keep every change small, evidence-backed, and reversible.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`

## Sources Of Truth

- `.specify/memory/constitution.md`
- `specs/_baseline/12-target-architecture.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/17-traceability-index.md`

## Core Rules

- Start from evidence, not a guess.
- Keep the scope as small as the risk allows.
- Do not invent fixes that the source does not justify.
- Do not change balance, persistence, or replay-sensitive behavior without
  explicit owner approval.
- Do not turn a patch into a broad rewrite.
- Use `basing-verification` after the edit to prove the result.

## Common Failure Modes

- Turning a narrow fix into a broad rewrite.
- Guessing at the fix before reading the source trace.
- Changing balance, persistence, or replay-sensitive behavior silently.
- Skipping rollback planning.

## Never Do

- Invent a fix the source does not support.
- Change balance silently.
- Patch protected paths without explicit user approval.
- Skip diff review.

## Examples

- Good: confirm one handler path, patch one branch, then verify.
- Wrong: refactor PocketBase writes while fixing a single UI bug.

## Workflow

1. Identify the branch, status, and target files.
2. Read the source anchors and the matching baseline docs.
3. List the invariants and rollback path.
4. Pick the narrowest viable patch.
5. Make the change.
6. Hand off to verification with the risk level attached.

## Invariants

- One change, one purpose.
- Compatibility beats convenience.
- Silent extra behavior is a bug until source proves it is intentional.
- Protected paths stay untouched unless the user explicitly asks.

## Stop Conditions

- The edit would require a schema migration, data rewrite, or balance change.
- The patch depends on an assumption the source does not confirm.
- The task would spill into a second independent subsystem.

## Verification

- Review the diff before claiming success.
- Use only checks that match the task risk.
- Confirm no unexpected files changed.

## Completion Report

- List the changed files.
- State the risk level and any owner approval used.
- Note any invariant that was preserved deliberately.
