# Scenario 3 Classification

Task authority: `T047` in `specs/002-characterization-tests/tasks.md`

Audit target: `Persisted process whose end time passed completes exactly once`

This pass is documentation and classification only. It does not accept any
runtime behavior, design a seam, design a fixture, create replay evidence, or
create a permanent test.

## Summary

- Broad scenario classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Contract decision: `SCENARIO_SPLIT_REQUIRED`
- Recommended continuation: `LOCAL_COMPLETION_TRANSITION_FIRST`

The broad wording combines at least six different contracts. The source has
guards and completion branches, but it does not provide runtime proof that the
whole scenario is exactly-once across reload, reconnect, retry, and multi-client
edges.

## Evidence Status

| Evidence | Status | What it confirms | What it does not confirm |
| --- | --- | --- | --- |
| `tests/characterization/slice-b/scenario-03-source-audit.md` | Source-only audit | The timer/completion path exists in `App.tsx`, `src/pocketbase.ts`, and the baseline docs | Exactly-once behavior across every retry or reconnect edge |
| `App.tsx:processOfflineTimers` and live timer loop | Direct source anchor | Construction, production, and destruction have explicit overdue-completion branches | That those branches are idempotent across all reload / reconnect / multi-client paths |
| `src/pocketbase.ts:onSnapshot` | Direct source anchor | Initial fetch comes first, then realtime delivery / refetch behavior | That snapshot delivery cannot repeat completion or reward side effects |
| `types.ts` | Direct source anchor | Persistent timer fields exist for construction, production, and destruction | That persistent fields alone enforce exactly-once behavior |
| `pb_hooks/**` | Direct source anchor | Only tree hit / tree respawn behavior is present in the audited hooks | Any server-owned building completion boundary |
| Baseline 05 / 07 / 08 / 15 / 16 / 17 | Direct baseline evidence | The scenario family is known to have duplicate-completion, duplicate-reward, replay, and stale-snapshot risks | Full end-to-end proof that those risks are already solved |

## Process-Type Comparison

| Process type | Current source entry points | Owned state | Main completion / finish fields | Reward or side-effect shape | Current reading |
| --- | --- | --- | --- | --- | --- |
| Construction | `processOfflineTimers`, construction branch in the building-state loop, build / upgrade paths | `App.tsx` plus persisted building record | `isConstructing`, `constructionEndTime` | Local completion plus persistence write; no reward path in the same branch | Timer completion exists, but exactly-once is not proven |
| Production | `processOfflineTimers`, manual production loop, `handleCollectProduction*` | `App.tsx` plus player resource state | `workState`, `workEndTime` | Completion and reward are separate operational paths | Reward exactness is not proven |
| Upgrade | `handleUpgrade`, `handleSpeedUp`, `processOfflineTimers` | `App.tsx` and building record | `isConstructing`, `constructionEndTime`, plus upgrade rewrite fields | Upgrade uses construction semantics, not a distinct process | Upgrade completion exists, but is not proven exactly-once |
| Destruction | `processOfflineTimers`, destruction finalize branch, live game-loop finalize branch | `App.tsx` and building record | `isDestroying`, `destructionEndTime`, `destructionExpiresAt`, `destructionDurationMs`, `destructionMaxLifetimeMs`, `pendingDamage`, `hp`, `maxHp` | Finalization clears terminal fields and may persist the terminal state | Terminal transition exists, but reconnect and retry idempotency are unproven |

## Known-Bug Findings

- No confirmed current-source bug was found that proves the broad scenario is
  already broken in a way that should be frozen as legacy behavior.
- The baseline docs still treat duplicate completion, duplicate reward,
  stale-snapshot restore, and replay-order races as risk surfaces rather than
  solved end-to-end proofs.
- `pb_hooks/**` does not add a building-process completion authority that would
  close the gap from the server side.
- Therefore the right conclusion here is not `KNOWN_BUG_DO_NOT_FREEZE`; the
  behavior remains unconfirmed at the broad scenario level.

## Completion Versus Reward Separation

- `processOfflineTimers` completes overdue process state in the building record.
- `handleCollectProductionFromWorld` and `handleCollectProduction` apply reward
  and inventory / gold effects separately from the offline completion branch.
- The code does not prove that completion and reward are one atomic operation.
- A partial write, retry, or reconnect could separate the completion mutation
  from a later reward write unless an additional contract is proven.

## Guard Analysis

| Guard or fence | Lifetime | What it blocks | Can it survive reload? | Can another client bypass it? |
| --- | --- | --- | --- | --- |
| `_offlineTimersSynced` | Component / session-local | Rewriting the same stale offline completion twice in one session | No | Yes |
| `lastInteractionRef` | Component / session-local | Some stale overwrite windows | No | Yes |
| `lastServerSyncRef` | Component / session-local | Some stale server overwrite windows | No | Yes |
| `updateBuildingDocSafe` tombstone skip | Component / session-local | Writing recently deleted buildings | No | Yes |
| `deletedRecordKeys` / `deadBuildingIds` in `src/pocketbase.ts` | Adapter-session-local | Repeated delete / 404 churn | No | Yes |
| `inFlightDeleteRequests` | Adapter-session-local | Duplicate delete requests during one adapter session | No | Yes |

These guards help the current client session, but they are not persisted and
they do not prove multi-device authority.

## Reload And Reconnect Analysis

- `src/pocketbase.ts:onSnapshot` clearly models refresh-load followed by
  realtime delivery or refetch.
- The app uses freshness guards (`lastServerSyncRef`, `lastInteractionRef`,
  `_offlineTimersSynced`) to reduce stale overwrite risk.
- Reload clears the in-memory guards, so a reload is not protected by the same
  session-local fences.
- The current source does not prove that an already completed process cannot be
  reprocessed after reconnect in every edge case.

## Multi-Client Analysis

- The persistent authority is still the PocketBase record, but the runtime
  completion decision is made in the client session.
- Two clients do not share the same in-memory guards.
- No server-enforced single-finalizer fence was found for this scenario.
- Therefore the source does not prove that two devices cannot both finalize the
  same persisted process independently.

## Partial-Write And Retry Analysis

- Completion writes and reward writes are separate operations in the current
  source shape.
- `src/pocketbase.ts` queues requests and handles 404 / duplicate-delete cases,
  but it does not make completion + reward a single atomic transaction.
- A completion write can succeed while a later reward write fails, and a retry
  can revisit the process state unless a stronger contract is proven.
- The source therefore leaves room for partial-write duplication risk.

## Contract Decomposition

### A. Local completion transition idempotency

> After an expired persisted process is completed locally, processing the same
> unchanged expired state again does not perform the completion transition a
> second time.

- Affected process types: construction, production, upgrade-as-construction, and
  destruction.
- Current owner: `App.tsx` timer reconciliation and the live completion loop.
- Source of truth: persisted end timestamps plus the current building record.
- Current entry points: `processOfflineTimers`, the live game-loop timer branch,
  and analogous process finish branches.
- Fields involved: `isConstructing`, `constructionEndTime`, `workState`,
  `workEndTime`, `isDestroying`, `destructionEndTime`, `destructionExpiresAt`,
  `destructionDurationMs`, `destructionMaxLifetimeMs`, `pendingDamage`, `hp`,
  `maxHp`.
- Side effects involved: state mutation, trace logging, and possible persistence
  writes.
- PocketBase writes involved: yes.
- Reward application separate: yes, for reward-bearing processes.
- Visible guards: `_offlineTimersSynced`, `lastServerSyncRef`, `lastInteractionRef`.
- Guard lifetime: component / session-local.
- Reload invalidates the guard: yes.
- Another client bypasses the guard: yes.
- Controlled observation status: not yet proven.
- Deterministic replay status: not yet proven.
- Known-bug status: no confirmed duplicate-completion bug found, but the broad
  scenario is still unconfirmed.
- Proposed classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Belongs in Feature 002 MVP: yes, this is the preferred first deterministic
  subcase.
- Requires later owner decision: yes, for promotion after observation.

### B. Completion side-effect idempotency

> The non-reward side effects or record transformation associated with process
> completion are applied once.

- Affected process types: the same timer-backed process families as A.
- Current owner: `App.tsx` completion branches and the matching persistence write
  helpers.
- Source of truth: persisted process fields plus the updated building record.
- Current entry points: `processOfflineTimers`, live finalize branches, and the
  completion-specific DB write sites.
- Fields involved: completion fields plus cleared destruction / work timestamps.
- Side effects involved: field clearing, completion markers, trace logging, and
  record writes.
- PocketBase writes involved: yes.
- Reward application separate: yes; this contract is about non-reward side
  effects only.
- Visible guards: local freshness refs and session-local duplicate-write guards.
- Guard lifetime: component / session-local.
- Reload invalidates the guard: yes.
- Another client bypasses the guard: yes.
- Controlled observation status: not yet proven.
- Deterministic replay status: not yet proven.
- Known-bug status: unresolved risk, no confirmed bug frozen here.
- Proposed classification: `TARGET_INVARIANT_REQUIRES_OWNER_DECISION`
- Belongs in Feature 002 MVP: no, not until the narrower first subcase is chosen.
- Requires later owner decision: yes.

### C. Reward exactly-once

> The reward associated with one completed process is granted no more than
> once.

- Affected process types: mainly production, and any process path that grants a
  reward or inventory delta.
- Current owner: `App.tsx` reward handlers and player-resource mutation paths.
- Source of truth: player resource state in the current client plus PocketBase
  records.
- Current entry points: `handleCollectProductionFromWorld`,
  `handleCollectProduction`, and related collection flows.
- Fields involved: `workState`, `workEndTime`, gold, inventory deltas, and any
  reward-bearing record fields.
- Side effects involved: gold / inventory updates, building collection writes,
  and history logs.
- PocketBase writes involved: yes.
- Reward application separate: yes, by definition.
- Visible guards: duplicate-click guards, local freshness refs, and completion
  write guards.
- Guard lifetime: component / session-local.
- Reload invalidates the guard: yes.
- Another client bypasses the guard: yes.
- Controlled observation status: not yet proven.
- Deterministic replay status: not yet proven.
- Known-bug status: no confirmed current duplicate-reward bug was found, but the
  source does not prove exactly-once delivery.
- Proposed classification: `TARGET_INVARIANT_REQUIRES_OWNER_DECISION`
- Belongs in Feature 002 MVP: no.
- Requires later owner decision: yes.

### D. Reload / reconnect catch-up idempotency

> Reload or reconnect does not re-run completion or reward delivery for an
> already completed process.

- Affected process types: all timer-backed process families.
- Current owner: `App.tsx` reconciliation plus `src/pocketbase.ts` snapshot
  delivery.
- Source of truth: persisted end timestamps and the live PocketBase records.
- Current entry points: `processOfflineTimers`, the live game-loop timer branch,
  `onSnapshot`, initial fetch, and query refetch paths.
- Fields involved: the same process end fields plus freshness refs.
- Side effects involved: completion writes and any later reward or transform
  writes.
- PocketBase writes involved: yes.
- Reward application separate: sometimes, depending on the process family.
- Visible guards: `lastServerSyncRef`, `lastInteractionRef`, `_offlineTimersSynced`.
- Guard lifetime: component / session-local.
- Reload invalidates the guard: yes.
- Another client bypasses the guard: yes.
- Controlled observation status: not yet proven.
- Deterministic replay status: not yet proven.
- Known-bug status: unresolved risk.
- Proposed classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Belongs in Feature 002 MVP: no, not before the narrow local completion subcase.
- Requires later owner decision: yes.

### E. Multi-client finalization authority

> Two clients or devices cannot both finalize the same persisted process and
> apply its side effects independently.

- Affected process types: all persisted process families.
- Current owner: not singular; the current source does not show a server-owned
  single-finalizer fence.
- Source of truth: PocketBase records plus whichever client session currently
  performs the completion path.
- Current entry points: client-side timer reconciliation, manual finish paths,
  and persistence writes from each client session.
- Fields involved: process end fields and the write-side completion markers.
- Side effects involved: completion transitions and any follow-on writes.
- PocketBase writes involved: yes.
- Reward application separate: yes, and this is one reason the contract is
  broader than a single transition.
- Visible guards: local session guards only.
- Guard lifetime: component / session-local.
- Reload invalidates the guard: yes.
- Another client bypasses the guard: yes, by design of local-only guards.
- Controlled observation status: not yet proven.
- Deterministic replay status: not yet proven.
- Known-bug status: no confirmed bug, but the contract needs owner decision if
  it is to become a server-level invariant.
- Proposed classification: `TARGET_INVARIANT_REQUIRES_OWNER_DECISION`
- Belongs in Feature 002 MVP: no.
- Requires later owner decision: yes.

### F. Stale-snapshot convergence

> After completion, a later stale snapshot cannot restore the process to an
> active or incomplete state.

- Affected process types: all timer-backed process families.
- Current owner: `App.tsx` merge / reconciliation logic, with `src/pocketbase.ts`
  as the delivery layer.
- Source of truth: persisted process state plus the current merge policy.
- Current entry points: `resolvePlacedBuildingSnapshotMerge`, the live game-loop
  merge path, `processOfflineTimers`, and `onSnapshot` refresh-load / refetch
  delivery.
- Fields involved: `workState`, `workEndTime`, `isConstructing`,
  `constructionEndTime`, `isDestroying`, `destructionEndTime`,
  `destructionExpiresAt`, `destructionDurationMs`,
  `destructionMaxLifetimeMs`, `pendingDamage`, `hp`, `maxHp`.
- Side effects involved: merge decisions, sticky-field preservation, and
  completion-state suppression.
- PocketBase writes involved: sometimes, depending on whether the merge later
  triggers a correction write.
- Reward application separate: yes; this is a merge contract, not a reward
  contract.
- Visible guards: `lastServerSyncRef`, `lastInteractionRef`,
  `shouldPreferServerRevivedBuildingState`, and tombstone/dead-id suppression
  helpers.
- Guard lifetime: component / session-local.
- Reload invalidates the guard: yes.
- Another client bypasses the guard: yes.
- Controlled observation status: not yet proven.
- Deterministic replay status: not yet proven.
- Known-bug status: unresolved risk.
- Proposed classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Belongs in Feature 002 MVP: no, not before the local completion subcase is
  isolated.
- Requires later owner decision: yes.

## Classification Comparison

| Contract | Proposed classification | Why |
| --- | --- | --- |
| A. Local completion transition idempotency | `UNCONFIRMED_RUNTIME_BEHAVIOR` | The source has duplicate-write guards, but not runtime proof that the same expired state cannot be processed twice across all edges. |
| B. Completion side-effect idempotency | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | The side effects are broader than a single transition and may need owner scope before a permanent contract is chosen. |
| C. Reward exactly-once | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | Reward delivery is separated from completion and is not proven atomic or exactly once. |
| D. Reload / reconnect catch-up idempotency | `UNCONFIRMED_RUNTIME_BEHAVIOR` | Guards exist, but reload/reconnect replay proof is still missing. |
| E. Multi-client finalization authority | `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | The source does not show a server-enforced single-finalizer contract. |
| F. Stale-snapshot convergence | `UNCONFIRMED_RUNTIME_BEHAVIOR` | Merge guards exist, but the broad stale-snapshot guarantee is not runtime-proven. |

## Recommended First Subcase

`LOCAL_COMPLETION_TRANSITION_FIRST`

This is the narrowest deterministic boundary in the scenario. It can be
investigated without claiming PocketBase atomicity, reward exactly-once,
multi-client authority, or reload durability.

## Deferred Subcases

- completion side-effect idempotency
- reward exactly-once
- reload / reconnect catch-up idempotency
- multi-client finalization authority
- stale-snapshot convergence

## Why T048 Remains Blocked

- The broad scenario is not one contract; it is a contract bundle.
- The next deterministic target has to be selected as the local completion
  transition subcase before seam work can be scoped safely.
- Reward, reconnect, and multi-client claims are still unresolved and must not
  be folded into the first seam decision.
- The task chain should be narrowed to the local completion subcase before
  fixture design can begin.

## Final Decision

- Broad scenario: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Contract decision: `SCENARIO_SPLIT_REQUIRED`
- Next continuation: `LOCAL_COMPLETION_TRANSITION_FIRST`
- T047 closes the classification / decomposition review only; it does not
  promote any runtime behavior.
