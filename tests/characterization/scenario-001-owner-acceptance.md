# Scenario 1 Owner Acceptance

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

Within the active sticky-interaction window,
an older building snapshot does not replace
the accepted current building state.

This acceptance is limited to the narrow sticky-interaction-window contract.
It does not promote the broader Scenario 1 claim.

## Explicit Non-Extension

This acceptance does **not** extend to:

- refresh-load ordering in general
- every realtime consumer
- every snapshot source
- every merge path
- all stale snapshot races

## Scenario 1 State

Scenario 1 now consists of:

- `CURRENT_ACCEPTED_BEHAVIOR`: the narrow sticky-interaction-window contract above
- `UNCONFIRMED_RUNTIME_BEHAVIOR`: the broader initial-fetch-versus-late-snapshot contract remains unproven

## Evidence Referenced

- `tests/characterization/scenario-001-replay-evidence.md`
- `tests/characterization/scenario-001-production-boundary-review.md`
- `tests/characterization/scenario-001-replay-fidelity-review.md`

## Note

This is an owner-acceptance record only.
No runtime code, replay, seam, or permanent test behavior changes are included here.
