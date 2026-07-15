# Scenario 6 Seam Decision

Task authority: `T072` in `specs/002-characterization-tests/tasks.md`

Exact Scenario 6 wording:

`Production completion survives reconnect and rewards once.`

## Summary

- Broad scenario classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Final seam decision: `MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`
- Recommended first narrow contract: `REWARD_GRANT_EXACTLY_ONCE_FIRST`

The current source can describe the production lifecycle and the reward path,
but it cannot honestly expose a deterministic one-time reward fence as a pure
production boundary. Completion and reward are separate caller-owned branches,
and the reward branch is not isolated as a pure decision helper.

## Evidence Status

| Evidence | Status | What it confirms | What it does not confirm |
| --- | --- | --- | --- |
| `tests/characterization/slice-b/scenario-06-source-audit.md` | Source-only audit | The scenario has source anchors, ownership notes, and explicit gaps. | Runtime proof, seam selection, or owner acceptance. |
| `tests/characterization/slice-b/scenario-06-classification.md` | Preliminary classification | The broad scenario stays `UNCONFIRMED_RUNTIME_BEHAVIOR`, and no concrete active bug was found for the exact contract. | A frozen behavior or a selected seam. |
| `App.tsx:635-760`, `App.tsx:669-677`, `App.tsx:15131-15152` | Production completion source trail | `processOfflineTimers(...)` and the live production loop can finalize overdue work by moving buildings to finished state. | That reward delivery is exactly once or that completion and reward are atomic. |
| `App.tsx:14551-14659`, `App.tsx:14936-15024`, `App.tsx:6552-6560` | Reward source trail | Reward / inventory credit is computed in the collection handlers and applied through `updatePlayerResources(...)`. | That the same finished state cannot be collected twice across retry / reconnect edges. |
| `App.tsx:7916-8560`, `App.tsx:11352-11379` | Reconnect / merge source trail | Server snapshots are merged with local state through freshness gates and reconciliation logic. | That reconnect / reload ordering is runtime-proven for reward once. |
| `src/pocketbase.ts:658-699`, `src/pocketbase.ts:1037-1165`, `src/pocketbase.ts:1204-1458`, `src/pocketbase.ts:1841-2219` | Adapter source trail | The adapter preserves fields, handles dead-record suppression, and performs initial fetch before subscription. | That PocketBase provides an exactly-once reward transaction. |
| `specs/_baseline/05-timers-and-processes.md` | Baseline source | Offline catch-up, reward emission, and timer-backed completion remain partially confirmed where replay edges matter. | A runtime proof that the exact Scenario 6 contract is already frozen. |
| `specs/_baseline/07-production-system.md` | Baseline source | Production start, completion, and collection are distinct operational paths. | That completion and reward are one atomic operation. |
| `specs/_baseline/09-realtime-sync.md` | Baseline source | Initial fetch precedes subscription and retry behavior is bounded. | That every reconnect ordering permutation preserves exactly-once reward delivery. |
| `specs/_baseline/10-optimistic-ui.md` | Baseline source | Local-first writes, freshness refs, and tombstone / dead-id suppression exist. | That local guards become cross-client authority or exact reward fences. |
| `specs/_baseline/11-error-handling.md` | Baseline source | Writes, retries, and 404 handling are best-effort in several places. | That retry / timeout behavior cannot duplicate reward or completion. |
| `specs/_baseline/15-invariants.md` | Baseline source | Reward idempotency, offline catch-up, and stale-snapshot invariants are still only partially confirmed where the exact edges matter. | That the exact Scenario 6 behavior is already accepted. |
| `specs/_baseline/16-risk-register.md` | Baseline source | The project still records duplicate reward, offline replay / skip, stale snapshot, and out-of-order response risks. | That those risks are concrete active bugs for the exact scenario. |
| `specs/_baseline/17-traceability-index.md` | Baseline source | The production and PocketBase surfaces are traceable, but the timer / offline rows remain partial. | That traceability alone proves the final runtime outcome. |

## Source Trail

### Production Completion Boundary

- `App.tsx:635-760` `processOfflineTimers(...)`
- `App.tsx:669-677` production completion branch inside offline timers
- `App.tsx:15131-15152` manual production loop

### Reward Boundary

- `App.tsx:14551-14659` `handleCollectProductionFromWorld(...)`
- `App.tsx:14936-15024` `handleCollectProduction(...)`
- `App.tsx:6552-6560` `updatePlayerResources(...)`

### Reconnect / Merge Boundary

- `App.tsx:7916-8560` `updatePlacedBuildingsFromServer(...)`
- `App.tsx:11352-11379` freshness gate in the local completion loop
- `src/pocketbase.ts:1841-2219` `onSnapshot(...)`

### Persistence / Adapter Boundary

- `src/pocketbase.ts:658-699` dead-record suppression caches
- `src/pocketbase.ts:1037-1165` `setDoc(...)` known-field / raw JSON preservation
- `src/pocketbase.ts:1204-1458` `updateDoc(...)` preservation and repeated-404 suppression

## State Ownership Map

| Slice | Owner | Mirrors / caches | Notes |
| --- | --- | --- | --- |
| Persistent building records | PocketBase via `src/pocketbase.ts` | `serverMyBuildingsRef`, `serverZoneBuildingsRef`, other read mirrors | PocketBase remains the persistent authority for building state. |
| Persistent reward / resource state | PocketBase user / resource records via `src/pocketbase.ts` | `updatePlayerResources(...)`, resource mirrors, UI state | Reward credit is caller-owned in `App.tsx`, then mirrored into persistent records. |
| Production orchestration | `App.tsx` | `processOfflineTimers(...)`, collection handlers, timer loop | Caller-owned orchestration advances or collects the process. |
| Reconnect and snapshot reconciliation | `App.tsx` + `src/pocketbase.ts` | `lastServerSyncRef`, `lastInteractionRef`, `serverMyBuildingsRef`, `serverZoneBuildingsRef` | Merge / replay behavior is split between the adapter and the UI monolith. |
| Suppression helpers | `App.tsx` + `src/pocketbase.ts` | `_offlineTimersSynced`, `deadBuildingIds`, `deletedRecordKeys` | These helpers suppress duplicate work; they are not authority. |

## Current Source-Of-Truth Analysis

- PocketBase is still the persistent authority for the building and reward
  records.
- `App.tsx` owns the production lifecycle, reward accounting, offline catch-up,
  and caller-side writes.
- `src/pocketbase.ts` owns the adapter, field preservation, initial fetch,
  retry policy, and realtime delivery.
- Session-local guards reduce duplicate work, but they do not prove once-only
  behavior across devices, reloads, or retry edges.
- The source shows the machinery for the scenario, but not the deterministic
  reward fence as a pure boundary.

## Completion Boundary

The completion branch is already visible in source:

- `processOfflineTimers(...)` completes overdue production from persisted time
  fields.
- The live manual loop marks overdue working buildings as finished.

That boundary is still completion-oriented. It does not decide reward grant by
itself, and it does not prove the broader reward fence.

## Reward Boundary

The reward path is caller-owned and separate from completion:

- production collection computes gold and inventory deltas in the collection
  handlers
- `updatePlayerResources(...)` applies the reward / resource mutation
- the handlers then write updated building state through the persistence path

That means the current source does not expose a pure, deterministic reward
eligibility helper that can stand on its own as the seam boundary.

## Is Completion And Reward Atomic?

No, not in the audited source.

The completion branch and reward branch are separate operational paths. The code
does not prove that they are an indivisible operation, and the reward payload is
also influenced by collection-time logic that sits in the caller-owned branch.

## Retry And Timeout Implications

- `safeSubscribe()` retries transient realtime failures with bounded backoff.
- `updateBuildingDocSafe(...)` and the `updateDoc(...)` / `setDoc(...)` paths
  handle not-found and stale-record cases.
- Those controls help the client recover, but they do not prove that retries
  and timeouts cannot duplicate reward or completion in every edge case.

## Realtime / Reconnect Implications

- The adapter performs initial fetch before subscription and can refetch or
  deliver incremental updates.
- Delete events and stale-record suppression reduce resurrection churn.
- `App.tsx` merges server snapshots with local reconciliation and then runs
  offline timer logic.
- The current source does not prove that every reconnect ordering permutation
  preserves exactly-once reward delivery.

## Multi-Client Implications

- The guards observed here are local-session guards, not a cross-client
  authority fence.
- A second client does not share the same in-memory suppression state.
- No server-enforced single-finalizer contract was found for reward delivery.
- Therefore the current source does not prove the exact once-only behavior
  across multiple devices.

## Contract Comparison

| Contract | Classification | Why |
| --- | --- | --- |
| A. Production completion transition | `UNCONFIRMED_RUNTIME_BEHAVIOR` | Source shows completion branches, but not runtime proof that repeated replay cannot re-run them on every edge. |
| B. Reward grant / resource credit | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | Reward is caller-owned and should be isolated behind a reward-specific seam before a permanent contract is chosen. |
| C. Repeated collection or reward claim | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | This is the smallest deterministic reward-fence candidate, but it still needs owner scope before freezing. |
| D. Offline catch-up completion | `UNCONFIRMED_RUNTIME_BEHAVIOR` | `processOfflineTimers(...)` exists, but repeated replay of the same state is not runtime-proven. |
| E. Reconnect / reload replay ordering | `UNCONFIRMED_RUNTIME_BEHAVIOR` | Initial fetch, subscription, and merge exist, but the exact replay ordering is not proven. |
| F. Snapshot merge and stale-state convergence | `UNCONFIRMED_RUNTIME_BEHAVIOR` | Merge guards exist, but the broad stale-state guarantee is not runtime-proven. |
| G. Persistence ordering between completion state and reward state | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | Completion and reward live in separate branches and are not atomic in source. |
| H. Multi-client reward authority | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | The source does not show a server-enforced single-finalizer fence. |

## Final Decision

- Broad scenario classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Seam decision: `MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`
- Selected first narrow contract: `REWARD_GRANT_EXACTLY_ONCE_FIRST`

## Why This First Narrow Contract

The reward fence is the smallest deterministic subcase that fits the current
source shape. It keeps production completion, offline catch-up, reconnect /
reload ordering, snapshot convergence, and multi-client authority deferred
instead of folding them into one broad contract.

This is the narrowest honest next step because:

- it is reward-specific
- it is deterministic in terms of the decision boundary
- it can be reasoned about without moving writes or traces into a helper
- it does not require treating completion and reward as one atomic operation

## Why The Other Options Are Deferred

- Production completion transition only: too narrow to answer the reward fence
  question that Scenario 6 actually asks.
- Reconnect / reload ordering only: this is a transport / replay concern, not
  the reward fence itself.
- Completion plus reward as one combined contract: too broad, and the source
  already shows completion and reward live in separate caller-owned branches.
- Reward grant exactly once as a broad scenario: still requires a seam because
  the current source does not expose a pure reward decision boundary.

## Smallest Missing Production Boundary

A pure, deterministic, importable reward-eligibility helper that decides only
whether the reward transition may occur.

It must stay free of:

- PocketBase writes
- trace logging
- refs
- subscriptions
- UI state setters
- reward payload mutation

## What Must Remain Caller-Owned

- PocketBase writes
- resource / inventory mutation
- trace logging
- optimistic UI updates
- refs and caches
- retries
- subscriptions
- orchestration

## Evidence Gaps

- No controlled observation of the exact reward-fence contract.
- No deterministic replay evidence for repeated reward handling on the same
  frozen state.
- No owner acceptance for the observed contract.
- No end-to-end proof that reward delivery is exactly once across every retry,
  reconnect, or replay edge.

## Stop Conditions For T073

- The fixture would need live PocketBase or network access.
- The fixture would require moving writes or traces into the seam.
- The fixture would broaden into completion, reconnect, or snapshot semantics
  instead of staying reward-specific.
- The seam would need to own refs, caches, or UI state setters.

## Whether T073 May Proceed

Yes, T073 may proceed to fixture design for the selected reward-fence subcase,
as long as it stays documentation-only and does not begin implementation.

## Task State

- `T072` is complete.
- `T073` remains open.
