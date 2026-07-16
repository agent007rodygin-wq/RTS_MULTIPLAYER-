# Scenario 8 Source Audit

Scenario 8 wording:

"Rejected optimistic building placement restores the pre-command state."

This is a source-only audit. The runtime behavior remains
`UNCONFIRMED_RUNTIME_BEHAVIOR`.

## Source Trail

- `App.tsx:3730-3815` - `validatePlacementTarget(...)`, the App-owned placement preflight guard.
- `App.tsx:5826-6215` - `placeBuildingAtTile(...)`, the main optimistic placement, write, rollback, and temp-to-server identity flow.
- `App.tsx:6237-6255` - `handleConfirmBuild(...)`, which owns the placement action gate around `placeBuildingAtTile(...)`.
- `App.tsx:7918-8194` - `updatePlacedBuildingsFromServer(...)`, which merges server snapshots, applies offline timers, and dedupes local/server building state.
- `App.tsx:8264-8395` - realtime snapshot consumers that feed building snapshots into reconciliation.
- `App.tsx:11440-11505` - `updateBuildingDocSafe(...)`, an App-owned guarded write helper used by other building flows.
- `App.tsx:13943-14186` - oil rig / wild quarry optimistic placement analogs with explicit rollback and resource-tile restore.
- `src/pocketbase.ts:80-193` - request queue and timeout wrapper used by read/query helpers.
- `src/pocketbase.ts:832-978` - `getDoc(...)`, including 404 handling and non-404 error propagation.
- `src/pocketbase.ts:981-1028` - `getDocs(...)`, including the empty-snapshot-on-error fallback.
- `src/pocketbase.ts:1037-1555` - `setDoc(...)`, `updateDoc(...)`, and `deleteDoc(...)`, including raw JSON preservation, idempotent delete, and `validation_not_unique` fallback.
- `src/pocketbase.ts:1854-2219` - realtime subscription wrapper, initial fetch, retry/backoff, and refetch ordering.
- `src/pocketbase.ts:2326-2354` - error normalization and path-aware logging.
- `src/game/buildings/resolveBuildingSnapshotMerge.js` - pure merge helper already used during building reconciliation.
- `src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js` - pure reconnect suppression helper already used during building reconciliation.

## Ownership Model

| Slice | Owner | Evidence / notes | Status |
| --- | --- | --- | --- |
| Temporary building identity | App.tsx orchestration and optimistic local state | `tempId`, `clientBuildTraceId`, `optimisticBuildDocIdByTempIdRef`, `optimisticBuildTempIdByDocIdRef` | proven by source |
| Persisted building identity | PocketBase persistent authority | `docId = makePlacedEntityId(currentUser?.uid)` and `setDoc(..., { id: docId, ... })` | proven by source |
| Placement coordinates | App.tsx orchestration first, then PocketBase record | `x`, `y`, `zoneId` are projected locally before write | proven by source |
| Owner identity | PocketBase persistent authority, seeded from App.tsx | `ownerId` is written from `user.uid` or `"0"` | proven by source |
| Optimistic building state | optimistic/local React state | `setPlacedBuildings(prev => [...prev, newBuilding])` and temp metadata | proven by source |
| Resource deduction | App.tsx orchestration, mirrored into PocketBase `users/<uid>` | `updatePlayerResourcesRef.current?.(...)` runs before `setDoc(...)` | proven by source |
| Persisted record | PocketBase persistent authority | `buildings` create/update via `setDoc(...)` | proven by source |
| Failure state | App.tsx orchestration | create-failure catch removes temp state and refunds resources | proven by source |
| Rollback / refund state | App.tsx orchestration plus resource helper | temp record removal, refund, trace cleanup | proven by source |
| Final converged state | PocketBase plus App.tsx reconciliation | merge and tombstone logic reconcile later snapshots | guarded but not proven |
| Duplicate suppression | App refs/caches plus adapter dedupe | `isBuildingActionProcessing`, temp/doc refs, tombstones, merge dedupe | guarded but not proven |

## Source-of-Truth Analysis

- Whether placement is pending: App.tsx owns the pending optimistic record and trace refs.
- Whether the building exists locally: App.tsx `placedBuildings` owns the local optimistic copy.
- Whether the building exists persistently: PocketBase `buildings` collection is authoritative.
- Whether resources have been spent: App.tsx applies the local deduction first; PocketBase `users/<uid>` mirrors are updated by `updatePlayerResources()`.
- Whether rollback is required: App.tsx decides this in the create-failure catch path.
- Which building ID is canonical: the client-generated `docId` becomes canonical only after the create succeeds; `tempId` is provisional.
- Final post-reconciliation state: server snapshots plus `updatePlacedBuildingsFromServer(...)` and `resolvePlacedBuildingSnapshotMerge(...)` determine the converged view.

## Exact Optimistic Placement Order

The source-backed order for the generic placement flow is:

1. Action entry and preflight guard in `handleConfirmBuild(...)`.
2. `validatePlacementTarget(...)` plus Town Hall / build-limit / population / resource checks.
3. Local resource deduction through `updatePlayerResourcesRef.current?.(...)`.
4. Validation trace marker (`validationDoneAt`).
5. Temporary identity generation:
   - `tempId = traceId || \`temp-\${makePlacedEntityId(currentUser?.uid)}\``
   - `docId = makePlacedEntityId(currentUser?.uid)`
6. Local optimistic insertion with `setPlacedBuildings(prev => [...prev, newBuilding])`.
7. PocketBase create request via `setDoc(doc(db, 'buildings', docId), serverBuilding)`.
8. On success, temp id is replaced by `docId`, optimistic refs are cleared, and the local record is normalized to the server identity.
9. Later snapshots flow through `onSnapshot(...)` and `updatePlacedBuildingsFromServer(...)` to converge the final state.

## Rejected / Failure Flow

- Validation rejection before optimistic mutation is source-backed: the guard returns early before `setPlacedBuildings(...)` or `setDoc(...)`.
- Backend rejection after optimistic mutation is source-backed: the create-failure catch removes both temp and server ids from local state, clears trace / mapping refs, and refunds the spent resources.
- Resource refund on create failure is source-backed for the generic placement flow.
- Temporary-building cleanup is source-backed through removal from `placedBuildings`, `optimisticBuildDocIdByTempIdRef`, `optimisticBuildTempIdByDocIdRef`, `lastInteractionRef`, and trace maps.
- A later snapshot arriving after rollback can still rehydrate server truth through `updatePlacedBuildingsFromServer(...)`.
- Ambiguous timeout handling on placement writes is not fully proven because the placement write path is not wrapped in the read/query `withTimeout(...)` boundary.
- A write that succeeds but whose response is lost is not separately proven.
- Retry after timeout is not a placement-path feature in the current source.

## Duplicate-Action Analysis

| Scenario | Source-backed evidence | Status |
| --- | --- | --- |
| Double click | `isBuildingActionProcessing` gates `handleConfirmBuild(...)` | proven by source |
| Repeated handler invocation | Same guard returns early before any placement work | proven by source |
| Repeated optimistic insertion | Temp / doc refs and `lastInteractionRef` reduce repeated local insertions | guarded but not proven |
| Duplicate backend create | Deterministic `docId` plus `validation_not_unique` fallback in `setDoc(...)` | proven by source |
| Retry after ambiguous timeout | No placement-specific timeout / retry fence exists in the write path | guarded but not proven |
| Duplicate realtime event | `updatePlacedBuildingsFromServer(...)`, id/tile dedupe, and tombstones suppress repeats | guarded but not proven |
| Two clients placing the same action | No server-side occupancy fence or transaction is proven | guarded but not proven |
| Stale temporary record reapplied | Temp/doc refs, tombstones, and merge helpers reduce resurrection risk | guarded but not proven |
| Server record and temporary record coexist | Local merge dedupe and temp/doc replacement converge the view | guarded but not proven |

## PocketBase Contract

- Collection name: `buildings`.
- Create payload: the `serverBuilding` object passed to `setDoc(...)`, which is wrapped by the adapter with `gameId` and then persisted.
- Identity assignment: the client chooses `docId` with `makePlacedEntityId(currentUser?.uid)`; the server stores that id as the record id.
- Fields written for placement include `x`, `y`, `zoneId`, `buildingId`, `ownerId`, `ownerName`, `timestamp`, `status`, `syncState`, `isConstructing`, `constructionEndTime`, `workState`, `hp`, `maxHp`, `type` when present, `isLocal`, and the create/update shape preserved by the adapter.
- Fields preserved: the adapter merges known fields into raw `data` JSON so sibling fields are not lost on partial update.
- Uniqueness constraints: only record-id uniqueness is source-backed via the `validation_not_unique` fallback; coordinate-level uniqueness is not proven here.
- Compare-and-swap: not proven.
- Transactionality: not proven for placement.
- Idempotency: create fallback and delete dedupe exist, but a full idempotent placement protocol is not proven.
- Last-write-wins implications: later PocketBase / snapshot state can replace earlier local optimism unless merge and tombstone guards keep the local view sticky.

## Snapshot / Reconciliation Analysis

- Optimistic local state is inserted first.
- The create success path converts the optimistic temp record to the canonical `docId`.
- `onSnapshot(...)` performs an initial fetch and then feeds realtime events into `updatePlacedBuildingsFromServer(...)`.
- `updatePlacedBuildingsFromServer(...)` merges owner-scoped and zone-scoped server buildings, applies `processOfflineTimers(...)`, and then deduplicates by id and tile.
- `resolvePlacedBuildingSnapshotMerge(...)` and `filterReconnectSnapshotBuildingsByTombstones(...)` provide pure reconciliation and reconnect suppression boundaries.
- `lastInteractionRef` and `lastServerSyncRef` bias the merge toward newer local intent and newer confirmed server state.
- Temporary/server record coexistence is resolved by id and tile scoring, but the full race envelope remains unproven.

## Existing Guards

| Guard | Provenance | Status |
| --- | --- | --- |
| `isBuildingActionProcessing` | `handleConfirmBuild(...)` action gate | proven by source |
| `validatePlacementTarget(...)` | App-owned preflight guard | proven by source |
| `tempId` / `docId` | deterministic optimistic identity pair | proven by source |
| `optimisticBuildDocIdByTempIdRef` / `optimisticBuildTempIdByDocIdRef` | temp-to-server identity map | proven by source |
| `lastInteractionRef` | sticky-intent guard | proven by source |
| `lastServerSyncRef` | freshness guard during merge | proven by source |
| `deletingBuildingsRef` / `confirmedDeletedRef` | deletion suppression | proven by source |
| `deadBuildingIds`, `deadResourceIds`, `deadDroppedItemIds` | adapter-side suppression caches | proven by source |
| `zoneSyncRetryCountsRef`, `zoneSyncRetryTimeoutsRef` | realtime retry caps | guarded but not placement-proven |

## Multi-Client Implications

The source does **not** prove:

- server-side placement fencing,
- unique coordinate occupancy,
- single-writer authority,
- a transaction around cost + create,
- cross-client duplicate suppression,
- or conflict resolution for two simultaneous placement attempts.

The client preflight and deterministic ids reduce collision risk, but the current source still relies on App-side checks plus later reconciliation.

## Existing Helper Boundaries

- Placement eligibility: `validatePlacementTarget(...)` exists, but it is an App-owned async guard, not a pure importable boundary.
- Optimistic projection: embedded in `placeBuildingAtTile(...)`; no dedicated pure helper is present.
- Rollback projection: embedded in the create-failure catch of `placeBuildingAtTile(...)`.
- Temporary-to-server identity replacement: embedded in the create-success branch of `placeBuildingAtTile(...)`.
- Snapshot merge: `resolveBuildingSnapshotMerge(...)` is an existing pure helper.
- Duplicate suppression: partially covered by App refs/caches plus the pure reconnect helper, but not extracted as a dedicated placement helper.

## Baseline Alignment

| Baseline doc | Alignment |
| --- | --- |
| `specs/_baseline/03-state-ownership.md` | partially confirmed - placed buildings are a merge zone with optimistic/local state and tombstones |
| `specs/_baseline/04-pocketbase-contracts.md` | proven by source - PocketBase queue, read/write contract, and realtime wrapper are source-backed |
| `specs/_baseline/10-optimistic-ui.md` | proven by source for the optimistic placement / rollback shape |
| `specs/_baseline/11-error-handling.md` | guarded but not proven for placement write ambiguity; read/query timeout and not-found behavior are source-backed |
| `specs/_baseline/15-invariants.md` | partially confirmed - duplicate suppression and snapshot-race edges remain open |

## Known Risks / Likely Bug Surfaces

- resources deducted but the building is later rejected,
- building created but the client rolls back incorrectly,
- duplicate server records after retry,
- temporary and server records coexist for a short time,
- a stale snapshot resurrects a rejected placement,
- optimistic UI survives a failure branch,
- refund occurs after a successful server write,
- fields are lost during replacement,
- two clients occupy the same tile,
- ambiguous timeout result on the placement write,
- missing rollback on one failure branch.

None of those are called an active bug here without runtime proof.

## Controlled Observation / Replay / Acceptance Status

- Controlled observation status: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Replay evidence status: not part of this audit
- Owner acceptance status: not part of this audit

## Evidence Gaps

- Placement write timeout / response-loss behavior.
- Cross-client tile occupancy fencing.
- Server-side transaction around cost + create.
- Full duplicate suppression under concurrent retry / race conditions.
- Whether every stale-snapshot path is blocked for rejected placements.

## Likely Contract Decomposition

Scenario 8 likely bundles multiple contracts:

- placement eligibility,
- optimistic projection,
- resource deduction,
- persistence,
- rollback / refund,
- temporary/server identity convergence,
- realtime reconciliation,
- duplicate suppression,
- and multi-client authority.

That makes a split likely before any later runtime evidence work.

## T087 Readiness

T087 may proceed to classification because the source audit is complete.
The classification should still treat the behavior as `UNCONFIRMED_RUNTIME_BEHAVIOR` until stronger runtime evidence exists.

