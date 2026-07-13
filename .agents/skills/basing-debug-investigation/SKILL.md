---
name: basing-debug-investigation
description: Use when a behavior is wrong, flaky, or unexplained and you need a root-cause trail before fixing it.
---

# Purpose

Find the real cause before changing anything.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-change-safety`
- `basing-verification`

## Sources Of Truth

- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/14-test-strategy.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/17-traceability-index.md`

## Classification

Classify each issue as one of:

- `CONFIRMED_RUNTIME_BUG`
- `STALE_HELPER_EXPECTATION`
- `UNCONFIRMED_BEHAVIOR_GAP`
- `ENVIRONMENT_FAILURE`
- `DATA_COMPATIBILITY_ISSUE`
- `PERFORMANCE_BOTTLENECK`

## Core Rules

- Reproduce the symptom first.
- Collect the source path, logs, and event chain.
- Do not fix a symptom that the root cause does not explain.
- Keep the smallest fix that addresses the confirmed cause.
- If the symptom belongs to a known subsystem, open that domain skill too.
- Do not change a helper only to make a green result if the runtime bug is
  elsewhere.
- Do not change gameplay only to satisfy a regex or pattern helper.

## Common Failure Modes

- Reproducing the symptom after picking a cause.
- Treating helper failure as runtime failure.
- Collapsing hypothesis and proof into one note.

## Never Do

- Patch a helper just to make a green result.
- Change gameplay to satisfy a regex.
- Report confidence without a proof chain.

## Examples

- Good: reproduce the reconnect bug, then trace source -> state ->
  PocketBase -> realtime.
- Wrong: rename a function because a helper complained.

## Workflow

1. Reproduce the issue.
2. Gather logs and source anchors.
3. Build the chain: user action -> UI handler -> local state ->
   PocketBase -> realtime -> reconciliation -> result.
4. Confirm the root cause.
5. Patch the smallest viable branch.
6. Verify the same symptom again.

## Invariants

- Symptom and root cause are not the same thing.
- A helper can be wrong even when the runtime bug is elsewhere.
- Confidence is a separate decision from the fix.
- A green helper does not prove gameplay correctness.

## Stop Conditions

- The root cause is still unconfirmed.
- The source path is missing or ambiguous.
- The task needs a domain skill because the symptom is subsystem-specific.

## Verification

- Re-run the same reproduction path after the fix.
- Check adjacent flows for regression.
- Confirm the evidence matches the claimed root cause.

## Completion Report

- State the root cause and confidence level.
- List the proof chain.
- Note any hypotheses that were discarded.
- State the final classification.
