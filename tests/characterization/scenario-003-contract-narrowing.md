# Scenario 3 Contract Narrowing

## Owner Decision

The selected continuation for `T041` onward is:

`LOCAL_TERMINAL_STATE_FIRST`

This is a scope decision only. It does **not** accept the runtime behavior yet.
The target stays `UNCONFIRMED_RUNTIME_BEHAVIOR`.

## Exact Narrowed Contract

`After local destruction completion has produced a terminal building state, a later older snapshot does not restore the pre-terminal building state.`

This is the only contract selected for the next step in Scenario 3.

## Explicitly Deferred

- Persisted terminal-state reconnect durability
- Server-revival precedence
- Scenario 2 tombstone suppression
- Broad destroyed-building terminal-state durability

## Meaning of the Owner Decision

This owner decision chooses the investigation target only.

It says:

- we are starting from the local completion boundary;
- we are not claiming persistence or reload durability;
- we are not accepting a final behavior contract yet;
- we are not widening into server-revival or tombstone logic.

## Relevant Terminal Fields

The local terminal state under review is expressed through these fields:

- `isDestroying`
- `destructionStartedAt`
- `destructionEndTime`
- `destructionExpiresAt`
- `destructionDurationMs`
- `destructionMaxLifetimeMs`
- `hp`
- `maxHp`

These fields are the ones the local completion branch writes or clears when a
building finishes destruction.

## Pre-Terminal Fields An Older Snapshot Could Restore

An older stale snapshot could attempt to restore the pre-terminal record shape,
including:

- `isDestroying: true`
- the earlier destruction timestamps
- the earlier destruction duration and max-lifetime values
- the pre-final `hp` / `maxHp` state

That is the exact shape the next investigation must guard against.

## Local Completion Boundary

The boundary under review is the handoff between:

- `App.tsx:processOfflineTimers(...)` completing destruction locally; and
- later reconnect reconciliation in `App.tsx:updatePlacedBuildingsFromServer(...)`
  plus `resolvePlacedBuildingSnapshotMerge(...)`

This is a local completion boundary, not a persistence boundary.

## Why No Persistent Reconnect / PocketBase Durability Claim Is Included

- This decision does not test a reload or full reconnect persistence guarantee.
- It does not assert that the terminal state survives when in-memory state is
  gone.
- It does not claim PocketBase durability beyond the local completion result.
- That broader proof needs a later subcase and possibly a different boundary.

## Why Server-Revival Precedence Remains Deferred

- `shouldPreferServerRevivedBuildingState(...)` is a separate decision rule.
- It may matter later, but it is not needed to define the local-terminal-state
  investigation target.
- Folding it into this subcase would widen the contract and blur the fixture.

## Why Scenario 2 Tombstone Suppression Is Not Duplicated

- Scenario 2 already owns tombstone / dead-id suppression.
- This narrowed Scenario 3 contract is about destruction completion, not
  deletion resurrection.
- Tombstone suppression is therefore deferred and must not be copied into this
  scenario.

## Whether T041 May Proceed

Yes, `T041` may proceed to fixture design for the selected
`LOCAL_TERMINAL_STATE_FIRST` subcase.

It may not proceed toward the deferred reconnect-durability or server-revival
subcases.

## Stop Conditions for T041

Stop `T041` if the fixture attempt starts to require any of the following:

1. persistent reconnect durability;
2. server-revival precedence;
3. Scenario 2 tombstone suppression;
4. broad destroyed-state durability claims;
5. live PocketBase proof instead of a local deterministic fixture boundary.

## Scenario Status

`Scenario 3` remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.
