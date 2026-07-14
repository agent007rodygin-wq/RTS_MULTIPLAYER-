# Scenario 2 Owner Acceptance

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

> While a local deletion tombstone is active, a reconnect snapshot does not
> restore the deleted building into the client building set.

This is the only accepted contract for Scenario 2.

## Evidence Basis

The acceptance is backed by the production-helper replay in:

- `tests/characterization/scenario-002-replay.mjs`
- `tests/characterization/scenario-002-replay-evidence.md`

That replay:

- imports the production helper directly;
- runs twice with identical outputs;
- remains deterministic;
- fails the expected negative controls;
- does not require live PocketBase or network access.

## Deferred Contracts

The following are explicitly not accepted here:

- adapter dead-id suppression
- persistent deletion durability
- full reload behavior
- the broader claim that deleted buildings can never reappear after reconnect

Those remain deferred and unproven.

## Status

Scenario 2 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` except for the accepted
narrow tombstone/reconnect contract above.

T035 is complete.
T036 remains open.

