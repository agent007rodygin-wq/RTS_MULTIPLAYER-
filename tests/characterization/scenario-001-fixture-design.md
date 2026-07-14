# Scenario 1 Fixture Design

## Scope

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

Observed contract under design:

> Initial fetch cannot be overwritten by an older late snapshot.

This document defines the future deterministic replay fixture boundary for
Scenario 1. It does not define actual fixture values, does not create fixture
files, and does not promote the scenario.

## Evidence Reused

This design is based on the current evidence already recorded in:

- `tests/characterization/scenario-001-source-audit.md`
- `tests/characterization/scenario-001-classification.md`
- `tests/characterization/scenario-001-seam-decision.md`

Relevant source anchors already identified there:

- `src/pocketbase.ts:1854-2204`
- `App.tsx:7954-8560`
- `App.tsx:8392-8560`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/15-invariants.md`

## Minimal Deterministic Fixture Boundary

The smallest useful fixture boundary is a single building-merge replay slice
that exercises the path where:

1. the initial `refresh-load` snapshot is applied first;
2. a later older snapshot is replayed second;
3. the building merge policy decides whether the late snapshot is ignored;
4. the outcome is observed only through the current building consumer path.

This fixture boundary is intentionally narrower than the full realtime system.
It only needs the data required to drive the building merge logic that
protects newer local or server state from stale overwrite.

## Runtime Objects That Must Be Represented

The future fixture must represent only the state needed by the building merge
path:

- `placedBuildings`
- `serverMyBuildingsRef`
- `serverZoneBuildingsRef`
- `lastInteractionRef`
- `lastServerSyncRef`
- tombstone / delete suppression caches
- audit metadata that distinguishes `refresh-load` from `realtime-event`
- the specific building record(s) participating in the replay

## Runtime Objects That Must Not Be Represented

The future fixture must not represent unrelated runtime surfaces:

- live PocketBase clients or subscriptions
- network sockets
- `App.tsx` consumers outside the building merge path
- `map_resources`
- `dropped_items`
- chat history
- leaderboard or social state
- presence state
- election state
- any gameplay systems not needed to prove the Scenario 1 merge outcome

## Required Frozen Inputs

The replay fixture will need frozen inputs for:

- the initial building snapshot payload
- the later older snapshot payload
- the exact ordering of those two snapshots
- the pre-existing local optimistic state, if any
- the current server mirror state before the stale snapshot arrives
- the tombstone or deletion state for the involved building id
- any freshness metadata used by the merge path

No concrete values are defined here.

## Required Replay Inputs

The replay strategy needs to feed the merge path with:

- a deterministic `refresh-load` event
- a deterministic older `realtime-event`
- the same building identity across both events
- a stable merge invocation order
- the same local state reset before each run

The fixture must replay the same pair of inputs in the same order each time.

## Required Evidence References

The fixture design must continue to point back to:

- the source audit for the fetch-first and merge-path evidence
- the classification note for the still-unconfirmed status
- the seam decision for the current boundary choice
- baseline docs that describe realtime sync and stale overwrite risk

## Cleanup And Reset Assumptions

The future replay must assume:

- all refs and caches are reset before each run
- no previous optimistic building intent leaks into the next run
- no live PocketBase records are touched
- no previous replay result is reused as input
- any derived state is rebuilt from the frozen inputs only

## Deterministic Ordering

The fixture must enforce:

- initial fetch first
- stale late snapshot second
- same merge boundary every run
- same current-state reset every run
- same result comparison every run

If the order changes, the replay no longer proves this scenario.

## Failure Conditions

Fixture design fails if:

- the scenario needs live PocketBase data to observe the result
- the fixture would have to become a second source of truth
- the merge outcome depends on hidden network timing
- the replay boundary spills into unrelated consumers
- the design needs executable code to explain the schema

## Preconditions For T026

Before T026 can record replay evidence, the following must already exist:

- this fixture boundary note
- the seam decision note
- the source audit note
- the preliminary classification note
- a documented reset and ordering strategy

T026 still requires controlled replay evidence; this document only prepares the
shape of that evidence.

## Why This Fixture Does Not Require Live PocketBase

This fixture only needs to replay recorded inputs into the local merge path.
It does not need to mutate live PocketBase records, subscribe to the network,
or wait for a real server event.

The replay is local because the contract under test is the client merge
decision, not a live persistence transaction.

## Why This Fixture Cannot Become A Second Source Of Truth

This fixture is declarative and scenario-scoped. It describes input shape,
ordering, and observation strategy only.

It is not authority over persistence, state ownership, or gameplay data. The
runtime and PocketBase remain the source of truth; the fixture only stages a
controlled observation of the existing behavior.

## Open State

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

Promotion remains blocked, and permanent test creation remains blocked, until
replay evidence and owner acceptance exist.
