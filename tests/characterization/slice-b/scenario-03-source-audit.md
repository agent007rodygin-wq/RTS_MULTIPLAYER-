# Scenario 3 Source Audit

Task authority: `T046` in `specs/002-characterization-tests/tasks.md`

Audit target: `Persisted process whose end time passed completes exactly once`

This is a source-only audit. It records anchors, ownership, and observed
behavior from the current source snapshot. It does not classify the behavior,
design a seam, design a fixture, or prove a permanent test.

## Source Anchors

| Surface | Anchor | What it shows |
| --- | --- | --- |
| `App.tsx` | `processOfflineTimers` at `634-748` | Central offline reconciliation over buildings. It checks construction, production, and destruction branches independently and writes updates only when a timer branch is overdue. |
| `App.tsx` | game-loop timer checks at `11350-11374` | Live timer reconciliation uses freshness guards such as `lastServerSyncRef` and `SERVER_FRESHNESS_MS` so stale server state is less likely to override a fresh local completion. |
| `App.tsx` | destruction finalize path at `12125-12185` | The destruction branch resolves a terminal state, clears destruction fields, resets pending damage, and writes the result back when the building is owned locally or host-managed. |
| `App.tsx` | manual production loop at `15252-15280` | Production completion is also handled by a live loop that marks overdue work as finished and clears `workEndTime`. |
| `App.tsx` | `updateBuildingDocSafe` at `11434-11460` | Writes are skipped for recently deleted buildings, which shows that completion and persistence are guarded separately from deletion safety. |
| `src/pocketbase.ts` | `onSnapshot` at `1841-2227` | The adapter always delivers an initial fetch, then realtime events or refetches. It is a transport boundary, not the completion authority. |
| `src/pocketbase.ts` | write/delete guards at `1213-1555` | The adapter keeps idempotent write and delete guards, plus 404 handling, but it does not define process completion semantics. |
| `specs/_baseline/05-timers-and-processes.md` | offline timer reconciliation and process table | Confirms the active source has construction, production, and destruction timer branches with absolute end timestamps, and notes that exact ordering against later snapshots is not fully proven. |
| `specs/_baseline/06-building-system.md` | building lifecycle table | Confirms the relevant lifecycle states: constructing, working, finished, and destroying. |
| `specs/_baseline/07-production-system.md` | manual/offline completion sections | Confirms production completion exists in both the live loop and `processOfflineTimers`, but exact-once reward / completion behavior is only partially confirmed. |
| `specs/_baseline/08-upgrade-system.md` | process and upgrade sections | Confirms upgrades reuse construction semantics and are part of the same timestamp-driven completion model. |
| `specs/_baseline/15-invariants.md` | `INV-TIME-01` through `INV-TIME-10` | Confirms the timer family uses canonical absolute end timestamps, that offline catch-up is meant to run once per stale state, and that stale-snapshot restoration is still only partially proven. |

## Ownership Model

| Layer | Owns | Notes |
| --- | --- | --- |
| PocketBase | Persistent records | The server remains the persistent authority for the underlying building rows. |
| `App.tsx` | Client mirror and completion decisions | The React app owns the timer reconciliation loop, local refs, and the writes that follow completion. |
| `processOfflineTimers` | Overdue completion reconciliation | This is the main offline decision boundary for construction, production, and destruction. |
| `src/pocketbase.ts` | Transport and delivery shape | The adapter delivers refresh-load and realtime snapshots, but it does not own completion semantics. |
| `lastServerSyncRef` / `lastInteractionRef` / `_offlineTimersSynced` | Freshness and duplicate-write guards | These refs reduce stale overwrite and duplicate sync risk, but they are guards, not proof of exactly-once behavior. |

## Observed Behavior

### Completion branches

- Construction completes when `isConstructing` is true and `now >= constructionEndTime`.
- Production completes when `workState === 'working'` and `now >= workEndTime`.
- Destruction completes when `isDestroying` is true and `now >= getEffectiveDestructionExpiresAt(building)`.

### Completion shape

- `processOfflineTimers` updates the relevant building record in one pass and only queues a DB write when the building was actually changed.
- `_offlineTimersSynced` prevents the same building from being written twice during the same stale-timer pass.
- The live timer loop uses freshness guards so a stale server snapshot is less likely to overwrite a just-completed local state.
- The PocketBase adapter can deliver `refresh-load` and `realtime-event` snapshots, but those are delivery modes, not proof that a timer completes exactly once.

### What is confirmed

- The source confirms canonical absolute end timestamps for the timer family.
- The source confirms that overdue construction, production, and destruction all have explicit completion branches.
- The source confirms that the client treats completion as a local reconciliation step plus a persistence step.

### What is not yet proven

- The source does not prove that a persisted process can never complete twice across every reload, reconnect, and replay order.
- The source does not prove the exact ordering between local completion, later snapshots, and later game-loop ticks for every edge case.
- The source does not prove exactly-once reward / completion behavior end to end for every retry sequence.

## Current Audit Summary

The current source clearly supports a timestamp-driven completion model with local reconciliation and duplicate-write guards. It does not yet provide runtime proof that the scenario's exactly-once claim holds under every reconnect or replay edge.
