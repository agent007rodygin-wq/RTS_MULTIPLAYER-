# Scenario 2 Fixture Design

## Scope

Scenario 2 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

Selected subcase:

> While a local deletion tombstone is active, a reconnect snapshot does not
> restore the deleted building into the client building set.

This document defines the deterministic local fixture boundary for that one
subcase only. It does not create fixture data, replay traces, or executable
code.

## Evidence Reused

This design is based on the current evidence already recorded in:

- `tests/characterization/scenario-002-source-audit.md`
- `tests/characterization/scenario-002-classification.md`
- `tests/characterization/scenario-002-seam-decision.md`
- `tests/characterization/scenario-002-contract-split.md`

Relevant source anchors already identified there:

- `App.tsx:3305-3479`
- `App.tsx:7925-8149`
- `App.tsx:8254-8393`
- `src/pocketbase.ts:658-699`
- `src/pocketbase.ts:1213-1496`
- `src/pocketbase.ts:1854-2228`
- `src/game/buildings/resolveBuildingSnapshotMerge.js:1-181`

Baseline references already used for ownership and sync context:

- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/04-pocketbase-contracts.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/17-traceability-index.md`

## Minimal Deterministic Fixture Boundary

The smallest useful fixture boundary is a single reconnect replay slice that
exercises the tombstone-protection path for one deleted building id.

The fixture only needs to represent enough state to answer one question:
does the stale reconnect snapshot leave the deleted building absent from the
client building set while the local tombstone is active?

## Exact Local Tombstone State Required

The future fixture must represent one active local deletion tombstone for the
same building id that appears in the reconnect snapshot.

That tombstone state must be visible through the App-owned suppression state,
including the refs or sets used by:

- `deletingBuildingsRef`
- `confirmedDeletedRef`
- the tombstone checks that guard the client building merge path

The tombstone must be active before the reconnect snapshot is observed.

## Reconnect Snapshot Input

The future fixture must provide one stale reconnect snapshot for that same
building id.

The reconnect snapshot must:

- arrive after the tombstone is active
- still contain the deleted building record
- represent the older state that would have resurrected the building if the
  tombstone guard were missing
- remain local and deterministic

The snapshot is an input only. It is not authority.

## Deleted Building Identity

The deleted building identity is the single persisted building record whose
`id` is shared by:

- the local tombstone
- the pre-reconnect client building set
- the stale reconnect snapshot payload

The fixture must carry that same identity through the whole replay slice so
the merge step can prove suppression of that exact deleted building.

## Client Building Set Before Reconnect

Before the reconnect snapshot arrives, the client building set must already
reflect the local deletion intent:

- the deleted building is absent from the client set
- the tombstone state is active
- the remaining client buildings are preserved
- no adapter dead-id cache is needed for this subcase

## Expected Client Building Set After Merge

After the reconnect snapshot is merged:

- the deleted building stays absent from the client building set
- the tombstone-protected client state is unchanged for that building id
- unrelated buildings remain unchanged
- the reconnect snapshot does not restore the deleted building

## Authoritative Refs And Sets

For this subcase, the authoritative client-side state is the App-level
tombstone suppression state and the merged client building set derived from
it.

Authoritative for the fixture:

- `deletingBuildingsRef`
- `confirmedDeletedRef`
- the merged client building set

Transient inputs only, not authority:

- `serverMyBuildingsRef`
- `serverZoneBuildingsRef`
- the reconnect snapshot payload itself

## Explicitly Out Of Scope

This fixture does not represent or prove:

- `deadBuildingIds`
- `deletedRecordKeys`
- adapter-level dead-id suppression
- persistent server deletion durability
- full reload safety with empty in-memory caches
- live PocketBase state
- any consumer outside the App-level tombstone reconnect merge path

## Event Order

The future replay must follow this exact order:

1. local delete intent
2. tombstone becomes active
3. reconnect snapshot arrives
4. merge/filter step runs
5. deleted building remains absent

If this order changes, the replay no longer proves the selected subcase.

## Reset And Cleanup Assumptions

The future replay must assume:

- all refs and sets are reset before each run
- no prior optimistic building intent leaks into the run
- no previous replay result is reused as input
- no live PocketBase record is touched
- the same deleted building identity is used in every run

## Deterministic Ordering Assumptions

The future replay must enforce:

- one tombstone-activation point
- one reconnect snapshot input
- the same merge order every run
- the same reset order every run
- the same comparison target every run

If the ordering changes, the replay becomes a different scenario.

## Failure Conditions

The fixture design fails if:

- live PocketBase would be needed to observe the result
- the fixture would need to become a second source of truth
- the reconnect path depends on hidden network timing
- the scenario requires adapter dead-id caches to prove the result
- the scenario requires full reload durability to prove the result
- the design needs executable code to explain the schema

## Preconditions For T034

Before T034 can record controlled replay evidence, the following must exist:

- this fixture boundary note
- the source audit note
- the preliminary classification note
- the seam decision note
- the contract split note

T034 must still prove the replay outcome with a deterministic local boundary.
This document only prepares the shape of that evidence.

## Why No Live PocketBase Is Required

This fixture only needs a frozen reconnect snapshot and the local tombstone
state that already exists in the client. The replay is local because the
contract under test is the client-side suppression decision, not a live
persistence transaction.

## Why This Fixture Does Not Prove Other Contracts

This fixture does not prove:

- adapter dead-id suppression, because it never tests the adapter cache
  lifetime separately
- persistent deletion durability, because it does not reload a fresh client
  with empty caches and verify server persistence
- full reload safety, because the replay stays within the local tombstone
  boundary only

## Open State

Scenario 2 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

The broad Scenario 2 wording stays unconfirmed until the narrower tombstone
reconnect subcase is later replayed and accepted.

