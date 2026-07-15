# Scenario 4 Split Decision

Task authority: `T056`

## Exact Scenario 4 Wording

`Offline catch-up cannot duplicate completion or reward.`

## Current Classification

`UNCONFIRMED_RUNTIME_BEHAVIOR`

## Source Anchors

- `App.tsx:635-750` - `processOfflineTimers(...)` walks construction, work, and destruction branches and uses `_offlineTimersSynced` to suppress duplicate DB writes.
- `App.tsx:14557-15590` - reward delivery, gold/item calculation, and the production collect paths.
- `App.tsx:12129-12667` - reconnect / revived-state merge gate via `shouldPreferServerRevivedBuildingState(...)` and `resolvePlacedBuildingSnapshotMerge(...)`.
- `src/pocketbase.ts:1853-2219` - initial fetch, realtime subscription, and delete-event handling.
- `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/07-production-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md`, `specs/_baseline/16-risk-register.md`, `specs/_baseline/17-traceability-index.md`

## Ownership Map

| Slice | Owner | Mirrors / caches | Notes |
| --- | --- | --- | --- |
| Persisted timer-backed state | PocketBase via `src/pocketbase.ts` | `placedBuildingsRef`, `serverMyBuildingsRef`, `serverZoneBuildingsRef`, `_offlineTimersSynced`, `lastInteractionRef` | Mirrors and refs are reconciliation aids, not authority. |
| Offline completion transition | `App.tsx / processOfflineTimers(...)` | caller-owned state updates and traces | Local catch-up is the branch under review for the first narrow contract. |
| Reward delivery | `App.tsx / handleCollectProduction*` | `updatePlayerResources(...)`, selected-building state | Reward emission is a separate path from the offline completion branch. |
| Reconnect / replay ordering | `src/pocketbase.ts / onSnapshot(...)`, `App.tsx` merge helpers | tombstones, dead-id caches, revived-state guard | Snapshot ordering is a separate concern from offline catch-up. |

## Persistence Map

| Path | What it owns | Why it matters |
| --- | --- | --- |
| `processOfflineTimers(...)` | completion detection and caller-owned write payloads | This is the only source-backed place that can honestly support the completion-transition subcase. |
| Production collect handlers | reward calculation, inventory deltas, gold payout, collection writes | Reward idempotency is not the same contract as completion idempotency. |
| `onSnapshot(...)` and merge helpers | initial fetch, realtime replay, resurrection suppression, revived-state precedence | Reconnect ordering belongs here, not in the offline catch-up fence. |

## Candidate Contracts

| Candidate | Provisional classification | Why it is separate |
| --- | --- | --- |
| A. Offline completion transition idempotency | `UNCONFIRMED_RUNTIME_BEHAVIOR` | The source shows the offline completion branch and `_offlineTimersSynced`, but not a full runtime proof of repeated catch-up behavior. |
| B. Reward exactly-once | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | Reward emission lives in the collect paths and mixes in reward calculation, inventory changes, and collection writes. |
| C. Reconnect / reload ordering | `UNCONFIRMED_RUNTIME_BEHAVIOR` | This is handled by `onSnapshot(...)` and merge guards, not by the offline completion branch. |
| D. Offline replay after stale snapshot | `UNCONFIRMED_RUNTIME_BEHAVIOR` | This needs its own deterministic replay boundary; the current broad wording is still too large. |
| E. Completion state vs reward state ownership | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | The source splits these concerns across different paths, so the owner must decide whether they belong together. |
| F. Persistence ordering | `UNCONFIRMED_RUNTIME_BEHAVIOR` | The source shows persistence writes, but not the exact cross-pass guarantee for the broad contract. |

## Contract Comparison

- Offline completion transition is the narrowest deterministic boundary and is fully rooted in `processOfflineTimers(...)`.
- Reward exactly-once is broader because it depends on the reward collection code path, inventory deltas, and collection-time writes.
- Reconnect / reload ordering is broader because it belongs to the realtime merge and snapshot layer.
- Offline completion + reward together is too broad because it merges two distinct ownership and write paths into one contract.

## Classification Comparison

| Classification | Supported for Scenario 4? | Why |
| --- | --- | --- |
| `CURRENT_ACCEPTED_BEHAVIOR` | No | No controlled observation, replay evidence, or owner acceptance exists yet. |
| `KNOWN_BUG_DO_NOT_FREEZE` | No | The docs show risk, not a concrete active bug report for the exact Scenario 4 wording. |
| `UNCONFIRMED_RUNTIME_BEHAVIOR` | Yes | The source confirms the machinery exists, but not the exact no-duplication behavior across catch-up / replay edges. |
| `LEGACY_COMPATIBILITY_BEHAVIOR` | No | Nothing in the audited source identifies this as an intentionally preserved legacy contract. |
| `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | Partially | Some candidate subcontracts, especially reward ownership and reward exactly-once, need owner selection before they can be frozen. |

## Evidence Gaps

- No controlled observation for the exact Scenario 4 wording.
- No deterministic replay evidence for repeated offline catch-up on the same frozen state.
- No proof that completion and reward are one atomic contract.
- No proof that reconnect or reload ordering is covered by the offline catch-up guard.

## Unknowns

- Whether reward exactly-once should be part of the same MVP contract as offline completion.
- Whether reconnect / reload replay can be proven from the same fixture without dragging in realtime merge behavior.
- Whether persistence ordering needs its own contract boundary.

## Decision

`SCENARIO_SPLIT_REQUIRED`

The current scenario wording bundles multiple contracts that live in different source paths:

- offline completion transition idempotency
- reward exactly-once
- reconnect / reload ordering
- offline replay after stale snapshot

## Recommended First Narrow Contract

`Offline completion transition only`

Suggested narrow wording:

`After offline catch-up completes an expired persisted process locally, processing the same unchanged expired state again does not perform the completion transition a second time.`

### Why this is first

- It is the smallest contract that stays entirely inside `processOfflineTimers(...)`.
- It is the only candidate that can be anchored to the current offline catch-up branch without bringing in reward delivery.
- It keeps reconnect / reload replay, revived-state precedence, and reward idempotency deferred instead of mixing them into the first follow-up.

### Why the other options are rejected for now

1. **Reward exactly-once only** - too broad for this pass because it depends on collection-time reward logic, not just offline catch-up.
2. **Reconnect ordering only** - too broad because it belongs to the realtime merge / snapshot layer, not the offline completion fence.
3. **Offline completion + reward together** - too broad because it merges two distinct ownership and write paths and would leave the scenario ambiguous again.

## What Remains Deferred

- reward exactly-once
- reconnect / reload ordering
- offline replay after stale snapshot
- completion state vs reward state ownership
- persistence ordering
- any broader persisted-process exactly-once claim

## Future Replay Target

Future replay should target only the selected narrow contract above, not the broad Scenario 4 wording.

## Task State

`T056` is complete.
`T057` remains open.
