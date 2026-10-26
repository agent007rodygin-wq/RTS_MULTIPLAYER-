---
name: basing-verification
description: Use when proving a change, checking scope, or preparing a completion report after edits to runtime, persistence, or state-handling paths.
---

# Purpose

Turn claims into evidence.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-change-safety`

## Sources Of Truth

- `specs/_baseline/14-test-strategy.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/17-traceability-index.md`
- `package.json`
- `verify_repository_health.ps1`
- `check_regressions_worker6.mjs`

## Verification Matrix

| Risk | Typical changes | Required checks |
| --- | --- | --- |
| LOW | docs, comments, formatting, runtime-neutral text | targeted diff review; `git diff --check` |
| MEDIUM | types, local UI state, pure helpers, TypeScript fixes | `npm run lint`; `node check_regressions_worker6.mjs`; `git diff --check` |
| HIGH | timers, completion, PocketBase, realtime, optimistic state, economy, rewards, combat, deletion, migrations, saves, schema, auth, permissions | `npm run lint`; `node check_regressions_worker6.mjs`; `verify_repository_health.ps1`; `git diff --check`; build/network only with owner approval |

## Status Vocabulary

- `PASS` - the check succeeded and the evidence supports the claim.
- `WARN` - the check ran, but the result leaves a residual concern.
- `BLOCKED` - the check could not be completed because the required evidence
  or environment was missing.
- `FAIL` - the check ran and contradicted the claim.
- `SKIPPED` - the check was intentionally not run; report why.

## Core Rules

- No completion claim without fresh evidence.
- Choose checks by risk, not by habit.
- For doc-only router work, structural validation and diff checks are enough.
- Do not invoke build or network helpers unless the task really needs them.
- Report PASS, WARN, BLOCKED, FAIL, or SKIPPED explicitly.

## Workflow

1. Define the claim that needs proof.
2. Choose the lightest check that can prove it.
3. Run the check fresh.
4. Read the full output, not just the exit code.
5. State the result with evidence or state the gap.

## Invariants

- Fresh output beats memory.
- Partial checks do not prove whole-system safety.
- A skipped check is still a result.
- A claim without a check is not a claim.
- Git trust, baseline freshness, Graphify freshness, protected paths, and
  Feature gate are part of the verification decision.

## Stop Conditions

- The evidence is stale.
- The check was never run.
- The task would need build or network helpers that the user has ruled out.

## Common Failure Modes

- Announcing success on stale evidence.
- Running partial checks and calling them proof.
- Using the wrong check depth for the risk.

## Never Do

- Claim completion without fresh verification.
- Skip build or network helpers when the risk requires them.
- Treat agent self-report as evidence.

## Examples

- Good: run `git diff --check` for router-only docs edits, then report
  evidence.
- Wrong: say "looks good" because the diff seems small.

## Verification

- Confirm the relevant files changed and the protected files did not.
- Confirm the check set matches the task risk.
- Confirm the output supports the claim word for word.
- If `npm` is unavailable, do not claim `npm`-based PASS; report the fallback
  explicitly and keep the caveat in the final report.

## Completion Report

- List the checks that were actually run.
- List the checks that were intentionally skipped and why.
- State the residual risk after verification.
