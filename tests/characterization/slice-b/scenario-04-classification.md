# Scenario 4 Offline Catch-Up Classification

Task authority: `T055` in `specs/002-characterization-tests/tasks.md`

## Exact Scenario 4 Wording

`Offline catch-up cannot duplicate completion or reward.`

## Behavior Under Review

The current source combines more than one timer-backed contract under the
offline reconciliation path:

- completion of overdue timer-backed buildings
- emission of rewards or other side effects when a process is collected
- replay/reload/reconnect ordering around stale snapshots and repeated catch-up

That makes the scenario broad enough that the exact contract is not yet frozen
as a single narrow invariant.

## Evidence Status

| Evidence | Status | What it shows | Why it is insufficient |
| --- | --- | --- | --- |
| `specs/002-characterization-tests/spec.md`, `plan.md`, `research.md`, `scenario-index.md`, `ownership-matrix.md`, `path-matrix.md` | Source-backed planning only | Scenario 4 is a Slice B timer / reward risk and is still listed as `UNCONFIRMED_RUNTIME_BEHAVIOR`. | These docs describe the target, but they are not replay evidence or owner acceptance. |
| `App.tsx:635-750` | Source-backed | `processOfflineTimers` walks construction, work, and destruction branches, and `_offlineTimersSynced` suppresses duplicate DB writes for already-synced buildings. | Guards exist, but runtime proof that every edge is once-only is missing. |
| `App.tsx:11438-11456` | Source-backed | `updateBuildingDocSafe(...)` is the caller-owned write helper and removes stale cache entries on not-found. | This is a write guard, not a proof of exact-once completion or reward delivery. |
| `App.tsx:14551-15106` | Source-backed | Production collection emits gold/items and writes updated building state through caller-owned updates. | The presence of reward logic does not prove duplicate-free behavior under repeated catch-up or reconnect. |
| `App.tsx:15920-16054` | Source-backed | Destruction completion clears terminal fields and writes caller-owned updates. | This confirms another timer branch exists, but not end-to-end idempotency across replay edges. |
| `src/pocketbase.ts:391-395, 498-515, 592-643, 1841-2092` | Source-backed | The adapter persists timer fields, filters snapshots, and handles initial fetch / realtime subscribe / delete events. | Adapter guards are not the same as controlled observation of the exact Scenario 4 contract. |
| `types.ts:134-145` | Source-backed | Timer and destruction fields are persisted building state, not UI-only state. | Field definitions alone do not prove exact-once completion or reward. |
| `pb_hooks/tree_server_utils.js` | Source-backed but unrelated | Server-side reward logic exists for tree hits. | It is not the offline catch-up behavior under review. |

## State Ownership Map

| Slice | Owner | Mirrors / caches | Notes |
| --- | --- | --- | --- |
| Persisted timer-backed building state | PocketBase records via `src/pocketbase.ts` | `placedBuildingsRef`, snapshot maps, `lastServerSyncRef`, `_offlineTimersSynced`, `lastInteractionRef` | Mirrors and refs help reconciliation, but they are not authority. |
| Offline reconciliation | `App.tsx` | `processOfflineTimers(...)` local loop | Caller-owned orchestration applies timer completion and traces. |
| Reward emission on collection | `App.tsx` | local reward calculations and optimistic updates | Reward logic is separate from the timer guard and still needs end-to-end proof for every edge. |

## Source-Of-Truth Analysis

- PocketBase is the persistent authority for the building record.
- `App.tsx` owns the reconciliation/orchestration path that turns persisted
  timestamps into local completion or collection effects.
- `_offlineTimersSynced` and `lastServerSyncRef` are suppression / freshness
  helpers, not sources of truth.
- The source proves the machinery exists, but not that repeated offline
  catch-up can never double-apply completion or reward across every reload or
  reconnect ordering.

## Realtime / Reconnect Implications

- `src/pocketbase.ts` performs initial fetch before subscription and converts
  delete events into synthetic empty snapshots.
- `App.tsx` merges those snapshots with local optimistic state and then runs
  offline timer reconciliation.
- The baseline explicitly says the exact ordering between local completion,
  later realtime snapshots, and the game loop is not fully proven yet.
- That leaves the offline catch-up / reconnect envelope partially confirmed,
  not closed.

## Retry And Timeout Implications

- `safeSubscribe()` retries transient realtime failures.
- `updateBuildingDocSafe(...)` and the various `updateDoc(...)` callers handle
  writes with not-found cleanup and caller-owned error handling.
- The risk register still treats duplicate completion payout and replay/skip
  during offline catch-up as active risks.
- Those guards reduce risk, but they do not prove a fail-closed exactly-once
  result for every retry or timeout edge.

## Multi-Client Implications

- The audited source does not prove that a second client, reconnect, or reload
  cannot trigger a repeated completion or reward path.
- The ownership model and timer guards are local-process guards, not a
  cross-device authority fence.
- Because of that, the scenario is still runtime-sensitive rather than owner-
  accepted.

## Historical Bug Findings

- No explicit active bug report for this exact Scenario 4 contract was found in
  the audited docs.
- The closest evidence is risk-register coverage for duplicate completion,
  duplicate reward, stale snapshot resurrection, and offline replay / skip
  during catch-up.
- The invariants and traceability docs mark completion and reward idempotency as
  only partially confirmed.
- That is evidence of risk, not evidence that the bug is currently happening.

## Controlled Observation Status

None found for this pass.

## Replay Evidence Status

None found for this pass.

## Owner Acceptance Status

None found for this pass.

## Classification Comparison

| Classification | Supported? | Why |
| --- | --- | --- |
| `CURRENT_ACCEPTED_BEHAVIOR` | No | There is no controlled observation, replay evidence, or explicit owner acceptance for this scenario. |
| `KNOWN_BUG_DO_NOT_FREEZE` | No | The repo shows risk and partial confirmation, but not a concrete active bug report for the exact offline catch-up contract. |
| `UNCONFIRMED_RUNTIME_BEHAVIOR` | Yes | Source confirms the timer and reward machinery exists, but not the exact no-duplication behavior across repeated catch-up / replay edges. |
| `LEGACY_COMPATIBILITY_BEHAVIOR` | No | Nothing in the source or docs identifies this as an intentionally preserved legacy contract. |
| `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | No | No owner-selected narrower target has been recorded yet for this scenario. |

## Final Proposed Classification

`UNCONFIRMED_RUNTIME_BEHAVIOR`

## Evidence Gaps

- No controlled observation of the exact Scenario 4 contract.
- No deterministic replay evidence for repeated offline catch-up on the same
  frozen state.
- No owner acceptance for the observed contract.
- No end-to-end proof that completion and reward stay single-shot across every
  replay/reconnect ordering.

## Unknowns

- Whether offline catch-up can be repeated across the same stale state without
  duplicating completion or reward in every edge case.
- Whether completion and reward should remain a single combined scenario or be
  split into narrower contracts.
- Whether reconnect or reload ordering can surface a path not covered by the
  current guards.

## Why T056 May Proceed

T056 may proceed as the next seam-decision pass because T055 is a
classification-only step and the scenario is now documented as
`UNCONFIRMED_RUNTIME_BEHAVIOR`.

T056 may still decide that the scenario should be split or narrowed before any
fixture work, because the current wording bundles multiple contracts.

## Likely Split / Narrowing Need

The current wording appears to bundle at least:

- completion idempotency for the offline catch-up path
- reward idempotency for completed processes
- reconnect / reload ordering around stale snapshots and replay

A future split or narrowing decision is likely required before fixture design
can stay honest.

## Task State

`T055` is complete.
`T056` remains open.
