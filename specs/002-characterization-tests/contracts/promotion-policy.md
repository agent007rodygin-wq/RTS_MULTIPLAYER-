# Promotion Policy

## Purpose

Define how a scenario moves from investigation to a permanent characterization contract.

## Approved Classifications

- `CURRENT_ACCEPTED_BEHAVIOR`
- `KNOWN_BUG_DO_NOT_FREEZE`
- `UNCONFIRMED_RUNTIME_BEHAVIOR`
- `LEGACY_COMPATIBILITY_BEHAVIOR`
- `TARGET_INVARIANT_REQUIRES_OWNER_DECISION`

## Promotion Rule

A proposed scenario may move to `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR` only after all of the following are true:

- direct current-source confirmation
- controlled observation or deterministic fixture evidence
- confirmation that the behavior is not a known bug
- owner acceptance of the observed contract

## Non-Promotion Rules

- `UNCONFIRMED_RUNTIME_BEHAVIOR` stays out of the permanent suite until it is promoted.
- `KNOWN_BUG_DO_NOT_FREEZE` never enters the permanent suite until a separate fix decision exists.
- `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` cannot be auto-promoted.

## Stop Conditions

- the behavior is still unconfirmed
- the behavior is a known bug
- the scenario needs a live PocketBase mutation
- the scenario would require a production refactor
- the scenario is outside P1 MVP scope

## Never Do

- do not freeze a known bug by accident
- do not treat a target invariant as current behavior
- do not skip owner acceptance
