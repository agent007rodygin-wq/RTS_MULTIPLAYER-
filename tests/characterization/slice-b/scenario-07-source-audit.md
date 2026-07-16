# Scenario 7 Source Audit

Task authority: `T078` in `specs/002-characterization-tests/tasks.md`

Exact Scenario 7 wording:

`Upgrade completion survives reconnect without duplicate transformation.`

This is a source audit only. It records what the live source supports and what
remains unproven at runtime. It does not classify the behavior or claim a
controlled replay.

## Evidence Status

| Area | Source anchors | What is proven by source | What is guarded but not proven |
| --- | --- | --- | --- |
| Upgrade start and local rewrite | `App.tsx:14335-14491` `handleUpgrade(...)` | The selected building is validated, the upgrade target and cost are resolved, `upgradeConstructionEndTime` is computed, resources are deducted locally, and the selected building is rewritten immediately with the upgraded `buildingId`, `type`, `isConstructing`, `constructionEndTime`, `hp`, `maxHp`, and destruction reset fields. | That every reconnect / retry edge keeps the same transformation exactly once. |
| Persisted upgrade fields | `App.tsx:14335-14491` `handleUpgrade(...)`; `specs/_baseline/08-upgrade-system.md` | The active source persists upgrade-shaped construction fields on the same record id, not a separate upgrade record. | That all later snapshots can never briefly reapply the upgrade. |
| Upgrade end time | `App.tsx:14335-14491` `handleUpgrade(...)`; `specs/_baseline/05-timers-and-processes.md`; `specs/_baseline/08-upgrade-system.md` | The upgrade end time is an absolute ms timestamp derived from `Date.now()` plus the new building's construction duration. | That every reload / reconnect ordering edge is runtime-proven. |
| Offline completion | `App.tsx:636-707` `processOfflineTimers(...)`; `src/game/buildings/resolveLocalConstructionCompletion.js` | Overdue construction is finalized when `now >= constructionEndTime`, and the pure construction completion helper projects the completed idle state. | That the same upgrade-shaped building cannot be transformed twice across all reconnect / replay edges without runtime proof. |
| Projected transformed building state | `App.tsx:636-707` `processOfflineTimers(...)`; `App.tsx:14335-14491` `handleUpgrade(...)` | The projected state is the upgraded building record with `isConstructing` cleared, the end time consumed, and the building visible in the transformed shape before server ack. | That the transformed state is always the final converged state after every possible snapshot race. |
| PocketBase write-back | `App.tsx:14335-14491` `handleUpgrade(...)`; `App.tsx:11439-11471` `updateBuildingDocSafe(...)`; `src/pocketbase.ts:1037-1450` | The optimistic upgrade is written back through the PocketBase adapter, which preserves known fields during partial writes. | That PocketBase persistence alone proves replay / reconnect convergence. |
| Optimistic / local replacement | `App.tsx:14335-14491` `handleUpgrade(...)` | `setPlacedBuildings(...)` and `setSelectedBuilding(...)` rewrite the building locally first so the upgraded form appears immediately. | That the local rewrite is enough by itself to prove correctness across reconnects. |
| Initial fetch | `src/pocketbase.ts:1853-2219` `onSnapshot(...)`; `App.tsx:8263-8402` | Realtime collection listeners fetch the current server view before subscribing, and the buildings sync effects feed those snapshots into the merge path. | That the fetch-before-subscribe order eliminates every race. |
| Realtime subscription | `src/pocketbase.ts:1853-2219` `onSnapshot(...)`; `App.tsx:8263-8402` | Realtime updates are delivered through the adapter wrapper with retry, cooldown, and incremental refresh behavior. | That every event-order permutation is runtime-proven. |
| Reconnect merge | `App.tsx:7917-8124` `updatePlacedBuildingsFromServer(...)`; `src/game/buildings/resolveBuildingSnapshotMerge.js` | Server and local building views are merged through a dedicated snapshot-merge helper, and the reconnect path replays offline timers before the final building array is committed. | That reconnect convergence is exhaustively proven for every client timing edge. |
| Stale snapshot suppression | `App.tsx:3299-3414`, `App.tsx:7954-8560`, `App.tsx:12130-12668` | Deletion caches, tombstones, last-interaction tracking, and server-revived-state checks suppress known stale or resurrecting records. | That a stale snapshot can never win in every possible ordering edge. |
| Duplicate transformation guards | `App.tsx:11439-11471`, `App.tsx:12130-12668`, `App.tsx:3299-3414`, `src/pocketbase.ts:1853-2219` | The source has several guards that bias toward the newest local or server-confirmed state, including `updateBuildingDocSafe(...)`, sticky merge windows, server-revival preference, and dead-record suppression. | That the upgrade transformation is proven exactly once across every retry / reconnect path. |

## State Ownership Map

| Owner | Source-backed responsibility | Notes |
| --- | --- | --- |
| PocketBase record | Persistent building row with upgrade-shaped fields | The building record remains the persistent source of truth, including `buildingId`, `isConstructing`, `constructionEndTime`, `workState`, `hp`, `maxHp`, and destruction-reset fields. |
| `App.tsx` orchestration | Upgrade validation, local optimistic rewrite, offline catch-up, reconnect merge, and write-back coordination | `handleUpgrade(...)`, `processOfflineTimers(...)`, `updatePlacedBuildingsFromServer(...)`, and `updateBuildingDocSafe(...)` all live here. |
| Pure helpers | Construction completion and snapshot merge logic | `resolveLocalConstructionCompletion(...)`, `resolvePlacedBuildingSnapshotMerge(...)`, and `shouldPreferServerRevivedBuildingState(...)` are the reusable boundaries currently available. |
| Optimistic / local state | Immediate transformed view before server ack | `setPlacedBuildings(...)`, `setSelectedBuilding(...)`, and the locally rewritten upgraded record show the transformed building immediately. |
| Refs / caches / tombstones | Suppression and freshness helpers | `lastInteractionRef`, `lastServerSyncRef`, `snapshotMergeDecisionLogRef`, deletion caches, tombstones, and optimism caches bias merge order and suppress stale resurrection. |
| Realtime adapter | Fetch-first / subscribe / retry boundary | `src/pocketbase.ts` owns the initial fetch, subscription, retry, and partial-update behavior. |

## Source-Of-Truth Analysis

| Question | Source-backed answer | Confidence |
| --- | --- | --- |
| Upgrade in progress | `isConstructing === true` and a future `constructionEndTime` on the same building record | Proven by source |
| Upgrade end time | Absolute ms timestamp computed from `Date.now()` plus construction duration | Proven by source |
| Target level / building | The same record is rewritten to the target `buildingId` and target `type` | Proven by source |
| Completion state | `processOfflineTimers(...)` completes overdue construction and clears the constructing state through the pure completion helper | Proven by source |
| Transformed identity / type | The same building id survives, while `buildingId` / `type` are rewritten to the upgraded form | Proven by source |
| Persisted result | The upgraded record is written back through the PocketBase adapter | Proven by source |
| Reconnect convergence | The reconnect snapshot path merges server state, offline timers, and sticky freshness guards | Suggested by source, but not runtime-proven here |

## Upgrade Completion Flow

1. `handleUpgrade(...)` validates the selected building, target upgrade, cost, population, and inventory.
2. The upgrade deadline is computed as an absolute end timestamp.
3. `updatePlayerResources(...)` applies the local cost immediately.
4. `setPlacedBuildings(...)` rewrites the selected building in place to the upgraded form.
5. `updateDoc(...)` writes the transformed record back to PocketBase.
6. `processOfflineTimers(...)` later finalizes overdue construction by calling the pure completion helper.
7. The completion helper projects the consumed idle state instead of leaving the building in the constructing shape.

## Reload / Reconnect Flow

1. Realtime listeners fetch the current server view before subscribing.
2. `App.tsx` collects owner and zone snapshots.
3. `updatePlacedBuildingsFromServer(...)` merges server state with local optimistic state.
4. `resolvePlacedBuildingSnapshotMerge(...)` applies sticky interaction, deletion protection, and revival preference.
5. `shouldPreferServerRevivedBuildingState(...)` can prefer a newer server view when the local state still shows a terminal or protected condition.
6. The resulting merged buildings are normalized and committed back to the visible building list.

## Duplicate-Transformation Analysis

The source contains several guards that reduce duplicate transformation risk:

- `lastInteractionRef` biases the merge toward the most recent local intent.
- `snapshotMergeDecisionLogRef` records the most recent merge decision per building.
- `updateBuildingDocSafe(...)` suppresses write attempts for buildings already queued for deletion.
- `resolvePlacedBuildingSnapshotMerge(...)` uses sticky interaction windows and server-revival checks.
- `shouldPreferServerRevivedBuildingState(...)` allows a fresher live server view to win over a stale protected local state.
- `safeSubscribe()` in `src/pocketbase.ts` retries transient subscription failures without inventing new state.

What remains unproven is the exact runtime guarantee that these guards eliminate every possible reconnect or retry ordering that could duplicate the upgrade transformation.

## Retry / Timeout Implications

- `src/pocketbase.ts` serializes request work and applies read / subscription retry behavior.
- The current source supports bounded retries and initial-fetch-first subscription behavior.
- The source does not prove that every timeout / retry combination around upgrade persistence is duplicate-free.

## Realtime Ordering

- `onSnapshot(...)` fetches first, then subscribes.
- Collection refreshes and incremental updates are explicitly handled.
- Offline timer reconciliation runs on top of merged server snapshots.
- The source supports a coherent merge order, but not an exhaustive proof of every race.

## Multi-Client Implications

- PocketBase remains the persistent authority for the building row.
- Server snapshots can still influence the final merged view when they are fresher or more authoritative.
- The source does not prove cross-client authority for every possible reconnect / replay interleaving.

## Existing Helper Boundaries

- `src/game/buildings/resolveLocalConstructionCompletion.js` is the pure construction-completion helper already used by offline catch-up.
- `src/game/buildings/resolveBuildingSnapshotMerge.js` provides the pure snapshot-merge helper and `shouldPreferServerRevivedBuildingState(...)`.
- No dedicated pure upgrade-completion helper was found in the current source snapshot.
- The upgrade start path itself remains inline in `App.tsx`.

## Baseline Alignment

| Baseline doc | Alignment observed in source | What remains unproven |
| --- | --- | --- |
| `specs/_baseline/05-timers-and-processes.md` | Upgrade is construction-shaped; offline catch-up and construction end timestamps are source-backed. | Exact runtime ordering between upgrade completion and reconnect merge. |
| `specs/_baseline/08-upgrade-system.md` | `handleUpgrade(...)` uses construction semantics, rewrites the same building record, and clears destruction fields. | Every reconnect / replay edge of the upgraded record. |
| `specs/_baseline/09-realtime-sync.md` | Initial fetch, subscribe, retry, and merge behavior are source-backed. | Exact event ordering under all races. |
| `specs/_baseline/10-optimistic-ui.md` | Upgrade is local-first and optimistic before ack. | Full rollback or convergence proof for every failure edge. |
| `specs/_baseline/11-error-handling.md` | Retry / timeout / not-found suppression and stale-state handling exist. | That these protections eliminate duplicate transformation in every case. |
| `specs/_baseline/15-invariants.md` | Duplicate completion, stale snapshot, state ownership, and replay risks are partially confirmed or still open. | A full runtime proof that upgrade completion survives reconnect without duplicate transformation. |

## Known Risks And Likely Bug Surfaces

- The upgrade path is construction-shaped and local-first, so a stale snapshot race is the main risk surface.
- Realtime merge and revival preference are source-backed, but the exact ordering between an optimistic local upgrade and later reconnect snapshots remains unproven.
- The source shows duplicate-transformation guards, but not a controlled runtime proof for every retry / reconnect edge.
- No dedicated upgrade helper exists yet, so any future seam work would still need to preserve the current App.tsx orchestration.

## Controlled Observation / Replay / Acceptance Status

- Controlled observation status: not part of this audit
- Replay evidence status: not part of this audit
- Owner acceptance status: not part of this audit

This audit intentionally stops before classification. The runtime behavior is not fully proven from source alone.

## Evidence Gaps

- No controlled runtime reproduction of the full Scenario 7 path.
- No owner-accepted contract yet.
- No replay note yet.
- No runtime proof that reconnect / replay cannot duplicate the upgrade transformation in every edge.

## Likely Split Need

The source shows one scenario wording that touches multiple runtime surfaces: an inline upgrade-start path, offline completion catch-up, and reconnect / snapshot merge. That does not force a split yet, but it does mean later tasks should watch for seam pressure if the runtime proof cannot be made honest through the existing boundaries.

## Task Progression

- T079 may proceed to classification and known-bug review.
- No seam, fixture, replay, promotion, or characterization implementation is required by this source audit alone.

## Task State

- `T078` complete: `yes`
- `T079` remains open: `yes`
