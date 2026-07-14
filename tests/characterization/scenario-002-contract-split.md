# Scenario 2 Contract Split

## Broad Contract

`Deleted building cannot be resurrected by a reconnect snapshot.`

This broad wording is too wide to freeze as one deterministic characterization
target. It spans several different ownership and lifetime boundaries, so it
must be split before T033 can become a fixture decision.

## Source Boundaries Reviewed

- `App.tsx:updatePlacedBuildingsFromServer()` at `App.tsx:7925-8149`
- `App.tsx` tombstone refs and cache cleanup at `App.tsx:3305-3479`
- `App.tsx` building subscriptions at `App.tsx:8254-8393`
- `src/pocketbase.ts:onSnapshot()` at `src/pocketbase.ts:1854-2228`
- `src/pocketbase.ts` dead-id / deleted-record caches at `src/pocketbase.ts:658-699` and `src/pocketbase.ts:1213-1496`
- `src/game/buildings/resolveBuildingSnapshotMerge.js:1-181`
- Baseline evidence:
  - `specs/_baseline/03-state-ownership.md`
  - `specs/_baseline/04-pocketbase-contracts.md`
  - `specs/_baseline/06-building-system.md`
  - `specs/_baseline/09-realtime-sync.md`
  - `specs/_baseline/10-optimistic-ui.md`
  - `specs/_baseline/11-error-handling.md`
  - `specs/_baseline/15-invariants.md`
  - `specs/_baseline/16-risk-register.md`
  - `specs/_baseline/17-traceability-index.md`

## Source Ownership Map

| Boundary | Primary owner | Source of truth during the contract | Lifetime |
| --- | --- | --- | --- |
| App tombstone reconnect suppression | `App.tsx` session refs and merge state | `deletingBuildingsRef`, `confirmedDeletedRef`, `isBuildingDeleting()`, `isBuildingTombstoned()`, and the merged client building set | In-memory, cache-local, time-bounded |
| Adapter dead-id suppression | `src/pocketbase.ts` adapter runtime | `deadBuildingIds`, `deletedRecordKeys`, and the adapter fetch / realtime callbacks | In-memory, adapter-local, reset on reload |
| Persistent deletion durability | PocketBase server state | persistent building record state after deletion acknowledgement | Persistent, server-owned |

## Candidate Contract Table

| Candidate | Exact wording | Owner | Source of truth | Lifetime | Source boundaries | Deterministic locally | Live PocketBase required | Existing pure seam | Owner-approved runtime seam required | Feature 002 MVP | Proposed classification | Next task path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A. Local tombstone reconnect suppression | `While a local deletion tombstone is active, a reconnect snapshot does not restore the deleted building into the client building set.` | `App.tsx` | Session refs plus merged client building set | In-memory, time-bounded | `App.tsx:3305-3479`, `App.tsx:7925-8149`, `App.tsx:8254-8393`, `src/pocketbase.ts:1854-2228`, `src/game/buildings/resolveBuildingSnapshotMerge.js:1-181` | Yes | No | No importable pure boundary; the behavior lives in runtime-owned state and merge flow | Not for this split decision; a later extraction would need explicit approval | Yes | `UNCONFIRMED_RUNTIME_BEHAVIOR` | `T033` tombstone/reconnect fixture target |
| B. Adapter dead-id suppression | `While a building id is present in the PocketBase adapter dead/deleted cache, snapshot and realtime results do not reintroduce that building record.` | `src/pocketbase.ts` | Adapter dead-id / deleted-record caches | In-memory, adapter-local, reset on reload | `src/pocketbase.ts:658-699`, `src/pocketbase.ts:1213-1496`, `src/pocketbase.ts:1854-2228` | Yes for adapter-level logic | No for the cache-suppression contract itself; yes for a full end-to-end proof against the real server | No importable pure boundary; the boundary is the adapter itself | Not for the current MVP slice | No, defer after A | `UNCONFIRMED_RUNTIME_BEHAVIOR` | Deferred until the tombstone reconnect subcase is settled |
| C. Persistent deletion durability | `After deletion is acknowledged and the client fully reloads with empty in-memory tombstone/dead-id caches, the deleted building does not return from persistent server state.` | PocketBase server persistence | Persistent server records | Persistent, cross-reload | `src/pocketbase.ts:onSnapshot()`, deletion helpers, app bootstrap / reload path | No | Yes | No | Yes, if this contract is ever pursued as a runtime proof | No | `UNCONFIRMED_RUNTIME_BEHAVIOR` | Future persistent-state / server-backed investigation |

## Why The Broad Scenario Must Be Split

The broad scenario is not one contract:

1. delete event suppression is a session behavior
2. tombstone suppression during reconnect is a merge behavior
3. dead-id filtering is an adapter behavior
4. snapshot-cache cleanup is a cache-lifetime behavior
5. terminal-state merge suppression is a per-building merge behavior
6. full reload durability is a persistent-server behavior

Those pieces do not share one safe deterministic boundary. Collapsing them into
one generic deletion lifecycle helper would create a false abstraction and would
mix client tombstones with adapter dead-id caches and persistent server state.

## Recommended Next Subcase

`TOMBSTONE_RECONNECT_SUBCASE_FIRST`

This is the narrowest locally deterministic continuation of Scenario 2 and the
best fit for T033 onward.

Why it is the right first continuation:

- it stays within session-scoped tombstone logic
- it does not require live PocketBase to define the contract target
- it does not depend on full reload durability
- it does not collapse adapter caches and App refs into one source of truth
- it is the smallest subcase that still matches the current T033 fixture path

## Deferred Subcases

- `ADAPTER_DEAD_ID_SUBCASE_FIRST` is deferred
- `PERSISTENT_DELETION_SUBCASE_FIRST` is deferred

## Current Scenario Status

`Scenario 2` remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

The original broad wording stays unconfirmed until one of the narrower
contracts is separately proven.

## T033 Direction

`T033` should continue as the tombstone/reconnect fixture target.

`T033` may proceed next only against the tombstone reconnect subcase.

## Tasks.md Clarification

`tasks.md` does not need immediate clarification for this split decision.
`T033` already points at the tombstone/reconnect fixture concept, so the split
note is enough for the next deterministic fixture target.

If a later pass changes the target subcase, `tasks.md` can be clarified then.

## Owner Approval Boundary

No owner-approved runtime seam is requested in this pass.

If a later replay pass needs to extract or change runtime code, that will
require explicit owner approval before implementation.

## Stop Conditions For T033

T033 remains blocked until the tombstone reconnect subcase is used as the
fixture target and the later fixture pass can prove a deterministic local
boundary without live PocketBase or runtime modification.

## Final Recommendation

`TOMBSTONE_RECONNECT_SUBCASE_FIRST`
