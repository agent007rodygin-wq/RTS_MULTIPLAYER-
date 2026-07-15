# Scenario 3 Owner Acceptance

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

> After local destruction completion has produced a terminal building state,
> a later older snapshot does not restore the pre-terminal building state.

This is the only accepted contract for the narrowed Scenario 3 subcase.

## Evidence Basis

This acceptance is backed by the production-helper replay in:

- `tests/characterization/scenario-003-replay.mjs`
- `tests/characterization/scenario-003-replay-evidence.md`

That replay:

- imports the production local-completion helper directly;
- imports the production merge helper directly;
- runs twice with identical outputs;
- reports `PASS` on both runs with `IDENTICAL` semantic comparison;
- includes the expected negative controls;
- stays deterministic and does not rely on live PocketBase or network access.

## Terminal Fields Covered

The replay-supported terminal operational state covered by this acceptance is:

- `isDestroying`
- `hp`
- `maxHp`
- `pendingDamage`

The accepted contract is limited to the proven no-restore behavior for that
terminal state after local completion.

## Explicit Non-Extension

This acceptance does **not** extend to:

- persisted terminal-state reconnect durability
- full reload durability
- server-revival precedence
- Scenario 2 tombstone suppression
- exactly-once destruction completion
- broad destroyed-building durability

## Status Notes

This acceptance does **not** imply PocketBase persistence success.

Server-revival behavior remains a separate future contract.

Scenario 3 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside the narrow accepted
subcase above.

T043 is complete. T044 remains open.
