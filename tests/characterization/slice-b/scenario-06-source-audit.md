# Scenario 6 Source Audit

Task authority: `T070` in `specs/002-characterization-tests/tasks.md`

Scenario wording:

`Production completion survives reconnect and rewards once.`

This is a source audit only. It does not classify the behavior and it does not
claim a runtime proof yet.

## Evidence Status

| Area | Source evidence | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Production lifecycle | `App.tsx:14491-15024` `handleStartProductionFromWorld(...)`, `handleStartProduction(...)`, `handleCollectProductionFromWorld(...)`, `handleCollectProduction(...)` | Production can be started, completed, and collected through both world-click and selected-building paths. The code computes rewards, updates `workState`, and clears `workEndTime` on collection. | That reward delivery is exactly once across every reconnect / retry edge. |
| Offline production catch-up | `App.tsx:635-760` `processOfflineTimers(...)`, `App.tsx:15131-15280` manual production loop | Overdue working buildings are finalized from persisted `workEndTime` / `workState`, and the production loop marks finished buildings every second while the client is active. | That every reconnect ordering edge is runtime-proven without replay. |
| Reconnect merge path | `App.tsx:7916-8560` `updatePlacedBuildingsFromServer(...)`, `App.tsx:11352-11379` freshness gate | Reconnect snapshots are merged through server refs, local freshness guards, tombstones, and offline timer reconciliation. | That stale snapshots can never briefly win in every edge case. |
| PocketBase field preservation | `src/pocketbase.ts:1037-1165, 1204-1458` | Partial updates preserve known fields and raw JSON, including timer-backed building fields used by production. | That PocketBase alone guarantees end-to-end reconnect convergence. |
| Realtime ordering | `src/pocketbase.ts:1841-2219` | Initial fetch happens before subscription, collection refreshes are explicit, and retry / cooldown behavior is bounded. | That every realtime event ordering permutation is runtime-proven. |
| Error and suppression helpers | `src/pocketbase.ts:658-699, 1213-1458` | Dead-record caches and repeated-404 suppression prevent resurrection churn for deleted records. | That suppression helpers become the authoritative process state. |

## Source Anchors

### `App.tsx`

- `App.tsx:635-760` `processOfflineTimers(...)`
- `App.tsx:7916-8560` `updatePlacedBuildingsFromServer(...)`
- `App.tsx:11352-11379` freshness gate in the local completion loop
- `App.tsx:14491-15024` production start / collect entry points
- `App.tsx:15131-15280` manual production loop

### `src/pocketbase.ts`

- `src/pocketbase.ts:658-699` dead-record suppression caches
- `src/pocketbase.ts:1037-1165` `setDoc(...)` known-field / raw JSON preservation
- `src/pocketbase.ts:1204-1458` `updateDoc(...)` preservation and repeated-404 suppression
- `src/pocketbase.ts:1841-2219` `onSnapshot(...)` initial fetch, subscribe, and refetch behavior

### Baseline Docs

- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/07-production-system.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Ownership Model

- PocketBase remains the persistent authority for building records.
- `App.tsx` owns production orchestration, offline timer reconciliation,
  reward accounting, and caller-side state writes.
- `src/pocketbase.ts` owns the read / write / subscribe adapter behavior and
  the field-preservation rules that keep timer-backed production fields intact.
- `processOfflineTimers(...)` is the runtime convergence mechanism for overdue
  production when the client catches up.
- `updatePlacedBuildingsFromServer(...)` is the bridge that merges server
  snapshots, tombstones, and offline production reconciliation.

## Observed Behavior

- Production state is persisted with `workState` and `workEndTime`.
- `processOfflineTimers(...)` can finalize overdue production from the
  persisted end time.
- Collection paths clear `workState` and `workEndTime` when production is
  collected, while reward values and inventory deltas are computed in the
  collection handlers.
- PocketBase partial updates preserve known building fields instead of
  dropping them from `data`.
- Initial fetch happens before realtime subscription, and update paths can
  refetch or incrementally merge after events.
- Dead-record suppression caches prevent repeated deletion churn from becoming
  a resurrection source.

## Proven vs Inferred

### Proven by source

- Production completion uses persisted timer comparison in the offline and
  active-loop paths.
- Production collection clears the production work state and applies reward /
  inventory updates locally before write-back.
- PocketBase partial writes preserve known fields and raw JSON.
- Realtime fetches the current view before attaching subscriptions.

### Inferred from source

- A reconnect should converge by re-reading persisted production fields and
  then running the same offline reconciliation path.
- The reward and collection state should remain stable through the adapter's
  partial-update preservation rules.

### Still unknown

- Whether every reconnect / replay ordering edge behaves identically at
  runtime.
- Whether reward delivery is exactly once across every retry or reconnect
  sequence.
- Whether all production-reload paths are equally covered across the whole app
  without runtime reproduction.

## Risks And Deferred Contracts

- This audit does not prove reconnect durability end to end.
- This audit does not prove that PocketBase persistence is the only source of
  truth during every replay edge.
- This audit does not prove a single global convergence guarantee for every
  process family.
- Reward idempotency, reconnect ordering, and generic timer behavior remain
  separate contracts.

## Task State

- `T070` complete: `yes`
- `T071` remains open: `yes`
