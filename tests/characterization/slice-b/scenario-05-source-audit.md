# Scenario 5 Source Audit

Task authority: `T062` in `specs/002-characterization-tests/tasks.md`

Scenario wording:

`Construction state survives reload and converges from persisted end time.`

This is a source audit only. It does not classify the behavior and it does not
claim a runtime proof yet.

## Evidence Status

| Area | Source evidence | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Persisted construction fields | `App.tsx`, `src/pocketbase.ts` | Construction state is stored and restored through persisted building fields such as `isConstructing` and `constructionEndTime`. | A full reload / reconnect runtime proof for every edge. |
| Offline convergence | `App.tsx:635-747` `processOfflineTimers(...)` | Overdue construction completes when `now >= constructionEndTime`, and the helper prepares write-backs from the updated building state. | That every reload ordering edge is fully proven in runtime. |
| Reconnect merge path | `App.tsx:7916-8125` `updatePlacedBuildingsFromServer(...)` | Reconnect snapshots are merged through server zone / my-building refs, tombstones, and the offline timer pass. | That every stale-snapshot / reload race is closed. |
| Freshness guard | `App.tsx:11352-11379` | The local completion loop only auto-completes when the server view is fresh enough or the action is locally recent. | That the guard alone proves reload durability. |
| Local completion write | `App.tsx:12208-12213` | The local tick finalizes construction by clearing `isConstructing` and `workState` when the construction end time is reached. | That this local mutation by itself proves persistence. |
| PocketBase field preservation | `src/pocketbase.ts:1037-1165, 1204-1458` | Partial updates preserve raw `data` JSON and known fields, including building timer fields. | That PocketBase alone guarantees end-to-end reload convergence. |
| Realtime ordering | `src/pocketbase.ts:1841-2219` | Initial fetch happens before subscription, and collection refreshes / incremental merges are handled explicitly. | That every event-order permutation is runtime-proven. |
| Compatibility / deletion caches | `src/pocketbase.ts:658-699, 1213-1458` | Tombstones and dead-record caches suppress repeated 404 churn and stale resurrection attempts. | That caches become authoritative state. |

## Source Anchors

### `App.tsx`

- `App.tsx:635-747` `processOfflineTimers(...)`
- `App.tsx:7916-8125` `updatePlacedBuildingsFromServer(...)`
- `App.tsx:11352-11379` construction freshness gate in the local completion loop
- `App.tsx:12208-12213` local construction completion write
- `App.tsx:3297-3381` deletion and sync refs used by merge / suppression

### `src/pocketbase.ts`

- `src/pocketbase.ts:1037-1165` `setDoc(...)` preserves known fields and raw JSON during partial updates
- `src/pocketbase.ts:1204-1458` `updateDoc(...)` preserves known fields and suppresses repeated 404 churn
- `src/pocketbase.ts:1841-2219` `onSnapshot(...)` initial fetch, subscribe, and refetch behavior
- `src/pocketbase.ts:658-699` deleted-record caches and dead-id suppression

### Baseline Docs

- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/08-upgrade-system.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Ownership Model

- PocketBase remains the persistent authority for building records.
- `App.tsx` owns the merge orchestration, offline timer reconciliation, and
  caller-side state orchestration.
- `src/pocketbase.ts` owns the read / write / subscribe adapter behavior and the
  compatibility fields that preserve timer data during partial updates.
- `processOfflineTimers(...)` is the runtime convergence mechanism for overdue
  construction when the client catches up after a reload or offline gap.
- `updatePlacedBuildingsFromServer(...)` is the bridge that pulls together the
  server snapshots, tombstones, and offline timer reconciliation.

## Observed Behavior

- Construction state is written with a persisted `constructionEndTime` and a
  local `isConstructing` mirror.
- On reconnect / refresh, the app first reads the persisted source and then
  merges it through the server snapshot path.
- `processOfflineTimers(...)` can complete overdue construction from the
  persisted end time after the source state is reloaded.
- Partial updates in the PocketBase adapter preserve the known construction
  fields rather than dropping them from `data`.
- Tombstones and dead-record caches are suppression helpers, not persistent
  truth.

## Proven vs Inferred

### Proven by source

- Construction completion uses the persisted end-time comparison.
- The merge path replays offline timers after server snapshot assembly.
- PocketBase partial writes preserve known fields and raw JSON.
- Realtime fetches the current view before attaching subscriptions.

### Inferred from source

- A reload should converge by re-reading the persisted construction end time and
  then running the same offline reconciliation path.
- Construction state should remain stable through the adapter's partial-update
  preservation rules.

### Still unknown

- Whether every reload / reconnect ordering edge behaves identically at runtime.
- Whether a stale server snapshot can briefly win before the freshness / sticky
  guards settle.
- Whether all construction-reload paths are equally covered across the whole app
  without runtime reproduction.

## Risks And Deferred Contracts

- This audit does not prove reload durability end to end.
- This audit does not prove that PocketBase persistence is the only source of
  truth during every replay edge.
- This audit does not prove a single global convergence guarantee for every
  process family.
- Upgrade, production, destruction, and generic-timer behavior remain separate
  contracts.

## Task State

- `T062` complete: `yes`
- `T063` remains open: `yes`
