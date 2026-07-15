# Scenario 5 Seam Decision

Task authority: `T064` in `specs/002-characterization-tests/tasks.md`

Audit target: `Construction state survives reload and converges from persisted end time.`

This is a seam-decision pass only. It does not classify the behavior, does not
design a fixture, and does not promote the broad scenario.

## Summary

- Broad scenario: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Seam outcome: `MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`
- Pure importable boundary already exists: `no`
- Minimal owner-approved seam may later be required: `yes`

The source shows reload/convergence machinery, but it is split across inline
`App.tsx` orchestration and `src/pocketbase.ts` adapter behavior. There is no
single importable pure boundary that exposes the full construction reload
convergence decision without also pulling in caller-owned writes and snapshot
merge orchestration.

## Source Boundaries Reviewed

- `App.tsx:635-747` `processOfflineTimers(...)`
- `App.tsx:7916-8125` `updatePlacedBuildingsFromServer(...)`
- `App.tsx:11352-11379` construction freshness gate in the local completion loop
- `App.tsx:12208-12213` local construction completion write
- `src/game/buildings/resolveLocalConstructionCompletion.js:1-47`
- `src/game/buildings/resolveBuildingSnapshotMerge.js:1-185`
- `src/pocketbase.ts:658-699`
- `src/pocketbase.ts:1037-1165`
- `src/pocketbase.ts:1204-1458`
- `src/pocketbase.ts:1841-2219`
- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/08-upgrade-system.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/17-traceability-index.md`

## Ownership Map

| Layer | Owns | Notes |
| --- | --- | --- |
| `PocketBase` | Persistent record authority | Server records remain the persistent source of truth. |
| `src/pocketbase.ts` | Transport / snapshot delivery | Delivers persisted building state, but does not decide reload convergence. |
| `App.tsx` | Local convergence orchestration | Owns `processOfflineTimers(...)`, merge orchestration, traces, and writes. |
| `processOfflineTimers(...)` | Offline convergence | Finalizes overdue construction after the client catches up. |
| `updatePlacedBuildingsFromServer(...)` | Reconnect / reload merge path | Combines server snapshots, tombstones, and offline timer reconciliation. |
| `resolveLocalConstructionCompletion.js` | Narrow completion decision | Handles the local completion transition only. |
| `resolveBuildingSnapshotMerge.js` | Snapshot merge policy | Handles stale snapshot merge, not the construction reload fence. |

## Persistence / Reload Map

| Path | What it owns | Why it matters |
| --- | --- | --- |
| `processOfflineTimers(...)` | completion detection and caller-owned write payloads | This is the runtime path that converges overdue construction after reload. |
| `updatePlacedBuildingsFromServer(...)` | snapshot merge plus offline timer replay | It is the runtime bridge that makes the reload path meaningful. |
| `src/pocketbase.ts` adapter helpers | field preservation and snapshot transport | They preserve the persisted fields, but they do not prove the full convergence contract. |

## Candidate Seam Table

| Candidate | Status | Why it is sufficient or insufficient |
| --- | --- | --- |
| Current inline `App.tsx` path | Insufficient as a seam | It proves the behavior exists, but it is not importable and carries orchestration / write side effects. |
| `resolveLocalConstructionCompletion.js` | Insufficient | It isolates only the completion decision; it does not expose the reload / persisted-end-time convergence question. |
| `resolveBuildingSnapshotMerge.js` | Insufficient | It handles snapshot merge policy, not the offline convergence branch. |
| New pure construction-convergence seam | Minimal seam candidate | This is the narrowest importable helper that can expose the reload convergence decision without moving refs, writes, or merge orchestration. |

## Proven vs Inferred

### Proven by source

- Persisted construction fields are present in the adapter and app state.
- `processOfflineTimers(...)` completes overdue construction from persisted end time.
- `updatePlacedBuildingsFromServer(...)` runs merge + offline reconciliation after reload / reconnect paths.
- PocketBase partial updates preserve the known timer fields.

### Inferred from source

- Reload should converge by re-reading the persisted construction end time and then running the same offline reconciliation path.
- A deterministic replay may be possible only if the reload / convergence decision is separated from caller-owned write orchestration.

### Runtime evidence

- None yet for the exact Scenario 5 wording.

## Risks And Unknowns

- The reload / reconnect envelope is still partially confirmed in baseline docs.
- The convergence path is split across `App.tsx` and the PocketBase adapter, so a deterministic replay would otherwise have to copy orchestration logic.
- `resolveLocalConstructionCompletion.js` is useful evidence, but it does not by itself prove the reload convergence contract.
- No controlled observation or replay evidence exists yet for the exact scenario.

## Decision

`MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`

The current source does not expose a single importable pure boundary that can
honestly prove the full construction reload-convergence decision. The narrowest
safe next step is to extract a construction-convergence seam that leaves these
outside the helper:

- React refs and state setters
- PocketBase writes
- trace logging
- reconnect / merge orchestration
- upgrade and other lifecycle branches

## Why This Is First

- It stays focused on construction convergence and avoids pulling in reward,
  upgrade, or destruction behavior.
- It is smaller than trying to prove the entire reload envelope from App-level
  orchestration.
- It leaves the caller-owned write path and adapter behavior intact.

## Deferred Work

- Seam implementation, if owner-approved
- Fixture design for the narrow construction-convergence subcase
- Controlled replay evidence
- Owner acceptance

## Future Replay Target

Future replay should target only the narrow construction-convergence seam once
it exists. It should not widen to reward, production, upgrade, or destruction
behavior.

## Task State

- `T064` complete: `yes`
- `T065` remains open: `yes`
