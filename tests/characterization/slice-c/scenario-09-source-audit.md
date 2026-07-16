# Scenario 9 Source Audit

Task authority:

- `specs/002-characterization-tests/tasks.md` T094
- `App.tsx`
- `src/pocketbase.ts`
- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

Scenario wording:

"Late command acknowledgement cannot overwrite a newer local intent."

Broad scenario classification:

`UNCONFIRMED_RUNTIME_BEHAVIOR`

This audit stays source-only. It identifies the current optimistic-command
boundary, the realtime reconciliation boundary, and the places where the source
suggests protection against stale acknowledgements. It does not claim runtime
proof.

## Source Trail

Primary anchors reviewed for this audit:

- `App.tsx:3336-3381` - optimistic placement and identity refs
- `App.tsx:5827-6234` - `placeBuildingAtTile(...)` optimistic placement flow
- `App.tsx:6099-6206` - optimistic render, server write, success remap, and rollback catch
- `App.tsx:6565-6682` - `updatePlayerResources(...)` local-first resource mutation
- `App.tsx:7929-8145` - `updatePlacedBuildingsFromServer(...)` merge / offline catch-up / snapshot repair
- `App.tsx:11374-12680` - later building merge and protection paths that also read `lastInteractionRef`
- `src/pocketbase.ts:1854-2219` - realtime subscription adapter, initial fetch, retry, cooldown refetch
- `src/pocketbase.ts:1037-1460` - create/update helpers and failure handling shape
- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Ownership Model

The current source separates the behavior into these ownership slices:

- PocketBase owns persistent multiplayer records.
- `App.tsx` owns orchestration, optimistic placement, local state updates, and
  the decision to call the persistence helper.
- `src/pocketbase.ts` owns the transport adapter, request queue, realtime
  subscription lifecycle, retry behavior, and snapshot delivery shape.
- Refs and tombstones own suppression / ordering helpers:
  - `lastInteractionRef`
  - `optimisticBuildDocIdByTempIdRef`
  - `optimisticBuildTempIdByDocIdRef`
  - `lastServerSyncRef`
  - `deletingBuildingsRef`
  - `confirmedDeletedRef`
  - `deadBuildingIds`
  - `deletedRecordKeys`

## Source-Of-Truth Analysis

- Persistent building records are PocketBase-owned.
- A placed building is first represented optimistically in React state, then
  later reconciled against the server write and later snapshots.
- `lastInteractionRef` is the main local-intent guard visible in the source.
- `optimisticBuildDocIdByTempIdRef` and `optimisticBuildTempIdByDocIdRef`
  bridge temp ids and server ids after the create ack.
- `lastServerSyncRef` and the merge pipeline bias the view toward the newest
  confirmed server state while preserving protected local intent.
- `updatePlayerResources(...)` mutates React mirrors immediately and then writes
  the user doc.

## Observed Source Behavior

The source-backed flow that is visible today is:

1. `placeBuildingAtTile(...)` validates the target.
2. The command applies a local optimistic building and, when needed, local
   resource deduction.
3. The server create is issued through `setDoc(...)`.
4. On success, the temp id is remapped to the doc id and the optimistic refs
   are updated.
5. On failure, rollback restores the optimistic placement via the dedicated
   helper and refunds the spent deltas.
6. Realtime snapshots later flow through `updatePlacedBuildingsFromServer(...)`
   and the PocketBase adapter.

That source trail suggests the app is trying to protect newer local intent
while acknowledgements and snapshots arrive later, but the exact end-to-end
runtime guarantee is still not proven.

## Relevant Fields And Guards

The source-backed placement / reconciliation shape uses:

- `tempId`
- `docId`
- `clientBuildTraceId`
- `lastInteractionRef`
- `optimisticBuildDocIdByTempIdRef`
- `optimisticBuildTempIdByDocIdRef`
- `lastServerSyncRef`
- `placedBuildings`
- `syncState`
- `status`
- `isLocal`
- `isConstructing`
- `constructionEndTime`
- `workState`
- `hp`
- `maxHp`
- `pendingDamage`

These are the fields and guards that matter for the local-intent / late-ack
question in the current source.

## Realtime And Merge Analysis

The PocketBase adapter confirms:

- initial fetch happens before subscribe for both docs and collections
- subscriptions are staggered and retried with backoff
- collection events can be merged incrementally for zone-scoped queries
- other collection updates refetch with a cooldown

In `App.tsx`, the merge path:

- rebuilds merged building state from server snapshots
- applies offline timer processing
- tracks `lastServerSyncRef`
- preserves recently interacted / optimistic local entries
- uses snapshot merge decisions to keep local intent from snapping back too
  early

This is strong source evidence for a reconciliation boundary, but it is not a
full runtime proof that a late server acknowledgement can never overwrite a
newer local intent.

## Error-Handling And Retry Implications

The source shows:

- request timeout and queueing in `src/pocketbase.ts`
- realtime retry and cooldown handling
- best-effort fallback behavior for some reads
- explicit rollback on the rejected build create path

That means timeout and retry behavior exist, but the current audit does not
prove that every late response edge is safe for this scenario.

## Baseline Alignment

This audit aligns with the current baseline documents:

- `03-state-ownership.md` confirms PocketBase-owned persistent state and
  optimistic mirrors.
- `09-realtime-sync.md` confirms initial fetch, subscribe, retry, and cooldown
  refetch behavior.
- `10-optimistic-ui.md` confirms optimistic placement and rollback patterns,
  but also notes partial proof in other flows.
- `11-error-handling.md` confirms request timeout, retry boundaries, and
  partial recovery behavior.
- `15-invariants.md` confirms ownership, optimistic-state, and snapshot-race
  invariants that are still only partially proven at runtime.

## Known Risks And Likely Split Need

The scenario likely bundles multiple contracts:

- late acknowledgement versus newer local intent
- optimistic create success remap
- rollback on create failure
- snapshot reconciliation after acknowledgement
- retry / timeout edges

That means the source audit supports the existence of the boundary, but it does
not yet fully prove the broad scenario as a single runtime contract.

## Controlled Observation Status

- controlled observation: not performed in this audit
- replay evidence: not yet part of this task
- owner acceptance: not recorded here

## Evidence Gaps

Missing evidence still includes:

- a runtime replay proving late acknowledgements cannot overwrite newer local
  intent
- a repeatability run showing the same outcome twice from frozen inputs
- a tighter split between the optimistic create path and the later snapshot
  merge edge

## Whether T095 May Proceed

T095 may proceed as the preliminary classification step, but only as a source-
backed classification audit. This source audit does not promote Scenario 9 to
accepted behavior.

## Final Status

- Scenario 9 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`
- T094 records the source anchors, ownership model, and observed source shape
- the runtime guarantee remains unproven until later characterization steps
