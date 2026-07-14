# Scenario 2 Seam Decision

## Scenario Under Review

`Deleted building cannot be resurrected by a reconnect snapshot.`

## Exact Observable Contract

The review target is the broad reconnect/delete contract:

> After a building is deleted, a later reconnect snapshot must not make that
> deleted building visible again.

## Contract Decomposition

The broad wording is not one atomic contract. It contains several distinct
behaviors:

1. delete event suppression
2. tombstone suppression during reconnect
3. dead-id filtering in the PocketBase adapter
4. snapshot-cache cleanup
5. terminal-state merge suppression
6. full reload durability

Those pieces live in different parts of the source and do not share one safe,
deterministic boundary.

## Source Boundaries Reviewed

- `App.tsx:updatePlacedBuildingsFromServer()` at `App.tsx:7925-8149`
- `App.tsx` tombstone state and cache cleanup at `App.tsx:3305-3479`
- `App.tsx` building subscriptions at `App.tsx:8254-8393`
- `src/pocketbase.ts:onSnapshot()` at `src/pocketbase.ts:1854-2228`
- `src/pocketbase.ts` delete / dead-id logic at `src/pocketbase.ts:658-699`, `1213-1496`
- `src/game/buildings/resolveBuildingSnapshotMerge.js:1-181`
- Baseline references:
  - `specs/_baseline/03-state-ownership.md`
  - `specs/_baseline/04-pocketbase-contracts.md`
  - `specs/_baseline/06-building-system.md`
  - `specs/_baseline/09-realtime-sync.md`
  - `specs/_baseline/10-optimistic-ui.md`
  - `specs/_baseline/11-error-handling.md`
  - `specs/_baseline/15-invariants.md`
  - `specs/_baseline/16-risk-register.md`
  - `specs/_baseline/17-traceability-index.md`

## Ownership Map

| Boundary | Owner | What it owns | What it does not own |
| --- | --- | --- | --- |
| `App.tsx` tombstone refs | React runtime state | deletion protection window, cache-local suppression, snapshot cache cleanup | permanent delete authority, reload durability |
| `src/pocketbase.ts` dead-id caches | Adapter runtime state | repeat-write suppression, 404 classification, realtime fetch/subscription wrapping | React tombstone lifetime, permanent deletion truth |
| `resolvePlacedBuildingSnapshotMerge.js` | Pure merge helper | sticky merge decisions, terminal-state merge suppression, per-building merge output | delete acknowledgements, dead-id cache lifetime, reconnect orchestration |

## Tombstone / Dead-ID Lifetime Analysis

- `deletingBuildingsRef` and `confirmedDeletedRef` are in-memory refs in
  `App.tsx`.
- `isBuildingDeleting()` expires the protection window after
  `DELETION_PROTECTION_MS` and clears the refs.
- `deadBuildingIds` and `deletedRecordKeys` in `src/pocketbase.ts` are also
  in-memory caches.
- Nothing in the reviewed source proves either cache survives a full reload.
- Therefore the deletion/tombstone protection is time-bounded and cache-local,
  not permanent authority.

## Candidate Seam Table

| Candidate | Sufficiency | Why sufficient or insufficient |
| --- | --- | --- |
| `App.tsx` tombstone suppression and snapshot-cache cleanup | Narrowly sufficient for in-session stale-delete suppression | It can suppress a deleted building while the refs are alive, but it does not prove reconnect durability or full reload behavior. |
| `src/pocketbase.ts:onSnapshot()` plus dead-id caches | Narrowly sufficient for adapter-level delete filtering | It proves fetch/delete/realtime plumbing and known-deleted write suppression, but it is not a deterministic pure boundary and its caches are in-memory. |
| `resolvePlacedBuildingSnapshotMerge.js` | Sufficient only for merge decisions that already flow through the helper | It can decide per-building sticky merge outcomes, but it does not own deletion acknowledgment, dead-id lifetime, or reconnect orchestration. |
| One generic "deletion lifecycle" helper | Insufficient | It would collapse distinct responsibilities from `App.tsx`, `src/pocketbase.ts`, and the merge helper into a false abstraction. |

## Why the Broad Scenario Is Too Wide

The reconnect/delete wording spans both session-scoped suppression and
reload-durability questions. Those are not the same contract:

- delete event suppression is a live-session behavior
- tombstone suppression during reconnect is a merge-time behavior
- dead-id filtering is an adapter behavior
- full reload durability is a persistence/lifetime question

That means the broad scenario should later be narrowed or split before fixture
design, instead of forcing all of it through one seam.

## Existing Production Boundaries

- There is no single existing importable pure boundary that covers the entire
  broad reconnect/delete scenario.
- `resolvePlacedBuildingSnapshotMerge.js` is the closest pure boundary, but it
  only covers a merge subcase and not the reconnect/delete lifecycle itself.
- `App.tsx` and `src/pocketbase.ts` each cover parts of the behavior, but they
  are separate runtime-owned boundaries with different lifetimes.

## Narrowing Recommendation

The safest path is to split the broad scenario into narrower contracts later.
The current wording is too wide to turn into one deterministic fixture target.

## Runtime Behavior That Must Remain Unchanged

- tombstone suppression stays cache-local and time-bounded
- adapter dead-id filtering stays in-memory and compatibility-preserving
- merge helper behavior stays unchanged
- no reload durability claim is added
- no new runtime helper is extracted

## Owner-Approval Boundary

No owner-approved seam is requested in this pass.

If a later pass needs a new runtime seam, it would need explicit owner approval
before any code extraction or helper introduction.

## Stop Conditions for T033

T033 should not proceed yet because there is no single deterministic fixture
boundary for the broad Scenario 2 wording.

Blocked until one of these happens:

1. the scenario is split into narrower contracts, or
2. a later pass defines a safe deterministic boundary that does not require
   live PocketBase or runtime modification

## Final Seam Outcome

`SCENARIO_SPLIT_REQUIRED`

## Scenario Status

`Scenario 2` remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

## Whether T033 May Proceed

No. T033 remains blocked until the scenario is split or narrowed to a single
deterministic fixture target.
