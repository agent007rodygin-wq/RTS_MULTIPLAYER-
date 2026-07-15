# Scenario 3 Construction-Completion Invariants Note

Task authority: `T054` in `specs/002-characterization-tests/tasks.md`

## Purpose

This note freezes the narrow construction-completion invariants proven by the
accepted Scenario 3 characterization. It does not broaden the contract.

## Evidence Basis

- production helper exists and is imported
- `App.tsx` delegates both matching construction-completion branches to the helper
- caller-side traces and PocketBase writes remain outside the helper
- Scenario Run 1: PASS
- Scenario Run 2: PASS
- comparison: IDENTICAL
- first pass decision: `complete_construction`
- second pass decision: `no_completion`
- all six controls behaved as expected

## Invariant Freeze

The frozen invariant set is exactly the one listed in
`tests/characterization/slice-b/scenario-03-invariants.md`:

- state transition: `isConstructing` and `workState`
- construction timer: `constructionEndTime`
- completion decisions: `complete_construction` then `no_completion`
- protected fields: `hp`, `maxHp`, `pendingDamage`
- unrelated-field preservation
- helper idempotency on unchanged completed output
- identity block before helper execution
- helper-only decision boundary

## Explicit Exclusions

This note does **not** claim:

- PocketBase persistence success
- duplicate-write prevention
- completion side-effect exactly-once
- reward exactly-once
- reload/reconnect idempotency
- multi-client authority
- stale-snapshot convergence
- upgrade completion
- production completion
- destruction completion
- generic work timers
- broad persisted-process exactly-once behavior

## Task State

`T054` is complete.
`T055` remains open.
