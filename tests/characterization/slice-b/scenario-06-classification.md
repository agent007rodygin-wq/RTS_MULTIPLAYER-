# Scenario 6 Classification

Task authority: `T071` in `specs/002-characterization-tests/tasks.md`

Exact Scenario 6 wording:

`Production completion survives reconnect and rewards once.`

## Summary

- Broad scenario classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Known-bug review result: no concrete active bug report was found for the exact contract
- The scenario bundles multiple contracts: production completion, reward delivery, reconnect / replay ordering, and offline catch-up / snapshot merge behavior
- T072 may proceed only as a seam-decision pass; it should not proceed directly to fixture, replay, or runtime implementation work yet

## Behavior Under Review

The audited source shows a real production lifecycle, a real offline catch-up path, and a real reconnect / snapshot merge path. That is enough to map the contract surface, but not enough to prove the exact once-only reward outcome at runtime.

The current source therefore supports the existence of the mechanism, not the final runtime guarantee.

## Evidence Status

| Evidence | Status | What it confirms | What it does not confirm |
| --- | --- | --- | --- |
| `tests/characterization/slice-b/scenario-06-source-audit.md` | Source-only audit | The scenario has source anchors, ownership notes, and a clear evidence gap record. | Runtime proof, owner acceptance, or a selected seam. |
| `App.tsx:635-760`, `App.tsx:7916-8560`, `App.tsx:11352-11379`, `App.tsx:14491-15024`, `App.tsx:15131-15280` | Direct source anchor | Production lifecycle, offline catch-up, reconnect merge, and the freshness gate all exist in live source. | That reward delivery is exactly once across reconnect / retry edges. |
| `src/pocketbase.ts:658-699`, `src/pocketbase.ts:1037-1165`, `src/pocketbase.ts:1204-1458`, `src/pocketbase.ts:1841-2219` | Direct source anchor | Dead-record suppression, field preservation, initial fetch, and retry / subscription handling are active. | That PocketBase alone guarantees end-to-end convergence or atomic payout. |
| `specs/_baseline/05-timers-and-processes.md` | Baseline source | Timer-backed completion, offline catch-up, and the partially confirmed idempotency risks are documented. | A runtime proof that the exact Scenario 6 contract is already frozen. |
| `specs/_baseline/07-production-system.md` | Baseline source | Production completion and collection are separate operational paths. | That collection/reward delivery is exactly once across all retry and reconnect edges. |
| `specs/_baseline/09-realtime-sync.md` | Baseline source | Initial fetch precedes subscription, and realtime retries / cooldowns are bounded. | That every reconnect ordering edge is runtime-proven. |
| `specs/_baseline/10-optimistic-ui.md` | Baseline source | Local-first writes, freshness refs, and tombstone / dead-id suppression are present. | That the local guards become cross-client authority. |
| `specs/_baseline/11-error-handling.md` | Baseline source | Writes, retries, and 404 handling are classified, and recovery is best-effort in several places. | That retry / timeout behavior cannot duplicate reward or completion. |
| `specs/_baseline/15-invariants.md` | Baseline source | Timer, reward, and stale-snapshot invariants are still only partially confirmed where the exact edges matter. | That the exact Scenario 6 behavior is already accepted. |
| `specs/_baseline/16-risk-register.md` | Baseline source | The project still records duplicate reward, offline replay / skip, stale snapshot, and retry / response risks. | That those risks are current bug proofs for the exact scenario. |
| `specs/_baseline/17-traceability-index.md` | Baseline source | The production and PocketBase surfaces are traceable, but the timer / offline row remains partial. | That traceability alone proves the full runtime outcome. |

## Source Trail

### Live Source Anchors

- `App.tsx:635-760` `processOfflineTimers(...)`
- `App.tsx:7916-8560` `updatePlacedBuildingsFromServer(...)`
- `App.tsx:11352-11379` freshness gate in the local completion loop
- `App.tsx:14491-15024` production start / collect entry points
- `App.tsx:15131-15280` manual production loop
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
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/17-traceability-index.md`

## State Ownership Map

| Slice | Owner | Mirrors / caches | Notes |
| --- | --- | --- | --- |
| Persistent building records | PocketBase via `src/pocketbase.ts` | `serverMyBuildingsRef`, `serverZoneBuildingsRef`, other read mirrors | PocketBase is still the persistent authority for building data. |
| Production orchestration and reward accounting | `App.tsx` | `processOfflineTimers(...)`, `handleStartProduction*`, `handleCollectProduction*`, manual production loop | Caller-owned orchestration applies completion, reward, and local writes. |
| Reconnect and snapshot reconciliation | `App.tsx` + `src/pocketbase.ts` | `lastServerSyncRef`, `lastInteractionRef`, `safeSubscribe`, `onSnapshot(...)` | The merge / replay envelope is split between the adapter and the UI monolith. |
| Suppression helpers | `App.tsx` + `src/pocketbase.ts` | `_offlineTimersSynced`, `deadBuildingIds`, `deletedRecordKeys` | These helpers suppress duplicate work; they are not authority. |

## Current Source-Of-Truth Analysis

- PocketBase remains the persistent authority for the building records.
- `App.tsx` owns the production lifecycle, offline catch-up, reward accounting, and caller-side writes.
- `src/pocketbase.ts` owns the adapter, partial-field preservation, initial fetch, retry policy, and realtime delivery.
- Session-local guards reduce duplicate work, but they do not prove once-only behavior across devices or reloads.
- The source shows the plumbing needed for the scenario, but not the end-to-end guarantee that the scenario wording asks for.

## Relevant Fields, Refs, Caches, Timers, And Persistence Paths

- Process fields: `workState`, `workEndTime`, `isConstructing`, `constructionEndTime`, `isDestroying`, `destructionEndTime`, `destructionExpiresAt`, `destructionDurationMs`, `destructionMaxLifetimeMs`, `pendingDamage`, `hp`, `maxHp`
- Reward-related state: gold / inventory deltas and collection writes in the production collection paths
- Local freshness and suppression refs: `lastServerSyncRef`, `lastInteractionRef`, `_offlineTimersSynced`
- Snapshot / merge refs: `serverMyBuildingsRef`, `serverZoneBuildingsRef`
- Adapter suppression caches: `deadBuildingIds`, `deletedRecordKeys`
- Persistence paths: `updateBuildingDocSafe(...)`, `updateDoc(...)`, `setDoc(...)`, `onSnapshot(...)`

## Reward / Completion Relationship

- The source separates production completion from reward delivery.
- `processOfflineTimers(...)` and the manual loop can complete overdue work.
- The collection handlers compute rewards and update player resources separately.
- `workState` / `workEndTime` are visible in the source as the completion state, but the current audit does not prove reward delivery is exactly once across retry or reconnect edges.
- That makes reward exactness a separate unresolved contract, not a frozen conclusion for Scenario 6.

## Retry And Timeout Implications

- `safeSubscribe()` retries transient realtime failures with bounded backoff.
- Request queueing and timeouts exist in the adapter layer.
- `updateBuildingDocSafe(...)` and the `updateDoc(...)` / `setDoc(...)` paths handle not-found and stale-record cases.
- Those controls help the client recover, but they do not prove that retries and timeouts cannot duplicate reward or completion in every edge case.

## Realtime / Reconnect Implications

- The adapter performs initial fetch before subscription and can refetch or deliver incremental updates.
- Delete events and stale-record suppression reduce resurrection churn.
- `App.tsx` merges server snapshots with local reconciliation and then runs offline timer logic.
- The current source does not prove that every reconnect ordering permutation preserves exactly-once reward delivery.

## Multi-Client Implications

- The guards observed here are local-session guards, not a cross-client authority fence.
- A second client does not share the same in-memory suppression state.
- No server-enforced single-finalizer contract was found for this scenario.
- Therefore the current source does not prove the exact once-only behavior across multiple devices.

## Historical Bug Findings

- No explicit active bug report for this exact Scenario 6 contract was found in the audited docs.
- The closest evidence is risk-register coverage for duplicate reward, offline replay / skip, stale snapshot resurrection, and out-of-order response overwrite.
- The baseline invariants and traceability docs still mark reward idempotency and replay-order edges as partial or unconfirmed.
- Those items are risk surfaces, not proof of a current frozen bug.

## Known-Bug Findings

- No concrete active bug report for the exact Scenario 6 contract was found.
- No debug-manifest entry or equivalent frozen-bug record was found for this exact behavior.
- Risk-register and invariant entries show concern, but they do not establish a currently reproducing bug that should be frozen as legacy behavior.
- `KNOWN_BUG_DO_NOT_FREEZE` is therefore not supported on the current evidence.

## Controlled Observation Status

None found.

## Replay Evidence Status

None found.

## Owner Acceptance Status

None found.

## Classification Comparison

| Classification | Supported? | Why |
| --- | --- | --- |
| `CURRENT_ACCEPTED_BEHAVIOR` | No | There is no controlled observation, replay evidence, or explicit owner acceptance for this scenario. |
| `KNOWN_BUG_DO_NOT_FREEZE` | No | The docs show risks, but not a concrete active bug for the exact Scenario 6 contract. |
| `UNCONFIRMED_RUNTIME_BEHAVIOR` | Yes | The live source shows the mechanism, but not the exact once-only reward outcome across reconnect / retry edges. |
| `LEGACY_COMPATIBILITY_BEHAVIOR` | No | Nothing in the live source or baseline docs identifies this as intentionally preserved legacy behavior. |
| `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | No | This pass does not yet select a narrower contract; that belongs in the later seam-decision step. |

## Final Proposed Classification

`UNCONFIRMED_RUNTIME_BEHAVIOR`

## Evidence Gaps

- No controlled observation of the exact Scenario 6 contract.
- No deterministic replay evidence for repeated offline / reconnect processing of the same frozen state.
- No owner acceptance for the observed contract.
- No end-to-end proof that completion and reward stay single-shot across every retry, reconnect, or replay edge.

## Unknowns

- Whether reward delivery is exactly once when completion is replayed across reconnect or retry boundaries.
- Whether the scenario should be split into smaller contracts before any seam or fixture work.
- Whether a later runtime pass will expose a narrow deterministic boundary for reward or reconnect ordering.

## Whether Scenario 6 Bundles Multiple Contracts

Yes. The wording bundles at least:

- production completion
- reward delivery
- reconnect / replay ordering
- offline catch-up / snapshot merge behavior

That is why this pass stays at source-backed classification and does not promote behavior.

## Exact Reason T072 May Or May Not Proceed

T072 may proceed as the seam-decision pass because T071 has documented the scenario as source-backed but still unconfirmed.

T072 may not proceed directly to fixture, replay, or runtime implementation work, because the exact once-only reward behavior is still unproven and no controlled observation exists yet.

## Task State

`T070` is complete.
`T071` is complete.
`T072` remains open.
