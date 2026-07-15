# Scenario 5 Classification

Task authority: `T063` in `specs/002-characterization-tests/tasks.md`

## Exact Scenario 5 Wording

`Construction state survives reload and converges from persisted end time.`

## Behavior Under Review

The current source confirms the persisted construction-timer machinery, the
offline reconciliation path, and the reconnect merge path. It does **not**
prove that the full reload / reconnect envelope converges without race or
repeat-processing risk in every edge.

That makes the scenario a runtime question, not an accepted contract.

## Evidence Status

| Evidence | Status | What it confirms | What it does not confirm |
| --- | --- | --- | --- |
| `tests/characterization/slice-b/scenario-05-source-audit.md` | Source-only audit | The live source contains persisted construction fields, offline reconciliation, reconnect merge, freshness guards, and PocketBase field preservation. | End-to-end runtime convergence across every reload / reconnect ordering edge. |
| `App.tsx:635-747` `processOfflineTimers(...)` | Direct source anchor | Overdue construction is finalized from persisted end time and prepared for write-back. | That every reload / reconnect race is proven idempotent at runtime. |
| `App.tsx:7916-8125` `updatePlacedBuildingsFromServer(...)` | Direct source anchor | Reconnect snapshots are merged through tombstones, server refs, and offline timer reconciliation. | That stale snapshots can never briefly win in every edge case. |
| `App.tsx:11352-11379` | Direct source anchor | The local completion loop only auto-completes when the server view is fresh enough or the action is locally recent. | That the freshness guard alone proves reload durability. |
| `App.tsx:12208-12213` | Direct source anchor | The local timer loop clears `isConstructing` and `workState` when construction completes. | That this local transition by itself proves persistence through reload. |
| `src/pocketbase.ts:1037-1165, 1204-1458` | Direct source anchor | Partial writes preserve known fields and raw `data` JSON for building timer fields. | That PocketBase alone guarantees end-to-end convergence. |
| `src/pocketbase.ts:1841-2219` | Direct source anchor | Initial fetch happens before subscription, and collection refresh / incremental merge behavior is explicit. | That the whole reload / reconnect ordering envelope is runtime-proven. |
| `specs/_baseline/05-timers-and-processes.md`, `06-building-system.md`, `08-upgrade-system.md`, `09-realtime-sync.md`, `10-optimistic-ui.md`, `11-error-handling.md`, `15-invariants.md`, `16-risk-register.md`, `17-traceability-index.md` | Baseline / risk evidence | The current docs record offline catch-up, reload freshness, partial confirmation of timer completion, and explicit risks for reload, replay, and timer drift. | That those risks are already solved in runtime. |

## Ownership Model

- PocketBase remains the persistent authority for the building record.
- `App.tsx` owns merge orchestration, offline timer reconciliation, and caller-
  side state orchestration.
- `src/pocketbase.ts` owns the read / write / subscribe adapter behavior and
  the compatibility fields that preserve timer data during partial updates.
- `processOfflineTimers(...)` is the runtime convergence mechanism for overdue
  construction after the client catches up.
- `updatePlacedBuildingsFromServer(...)` is the bridge that merges the server
  snapshot, tombstones, and offline timer reconciliation.

## Source-Of-Truth Analysis

- Construction state is persisted through `constructionEndTime` and mirrored
  locally through `isConstructing`.
- On reconnect / refresh, the app re-reads persisted building state and then
  reconciles it through the server snapshot path.
- `processOfflineTimers(...)` is the mechanism that completes overdue
  construction from the persisted end time after the source state is reloaded.
- PocketBase partial updates preserve known construction fields instead of
  dropping them from `data`.
- Tombstones and dead-record caches are suppression helpers, not authority.

## Realtime / Reconnect Implications

- `src/pocketbase.ts` performs initial fetch before subscription and handles
  collection refreshes / incremental merge behavior explicitly.
- `App.tsx` merges those snapshots with local optimism and then runs offline
  timer reconciliation.
- The baseline docs explicitly leave the exact reload / reconnect ordering
  envelope partially confirmed.
- That means the scenario is still runtime-sensitive, not yet accepted.

## Risk Register Review

- `RISK-TIME-01` records absolute timer drift as a live concern.
- `RISK-OFFLINE-01` records replay or skip during offline catch-up as a live
  concern.
- `RISK-SNAPSHOT-01` records stale snapshot resurrection as a live concern.
- `RISK-LOAD-01` records startup / reload gate fragility as a live concern.
- These are risks, not proof that the exact Scenario 5 contract is currently
  broken in a way that should be frozen as legacy behavior.

## Known-Bug Review

- No concrete active bug report was found for the exact scenario wording.
- The current docs show timer, reload, and reconnect risk surfaces, but not a
  confirmed reproducing bug for this contract.
- The risk register entries above are current concerns, not a frozen bug
  classification.
- Therefore `KNOWN_BUG_DO_NOT_FREEZE` is not the right result for this pass.

## Controlled Observation Status

None found.

## Replay Evidence Status

None found.

## Classification Comparison

| Classification | Supported? | Why |
| --- | --- | --- |
| `CURRENT_ACCEPTED_BEHAVIOR` | No | There is no owner acceptance or runtime proof for the full reload / converge contract. |
| `KNOWN_BUG_DO_NOT_FREEZE` | No | The repo shows risk, but no concrete active bug report for the exact scenario. |
| `UNCONFIRMED_RUNTIME_BEHAVIOR` | Yes | Source confirms the machinery exists, but the runtime reload / reconnect convergence is not proven end to end. |
| `LEGACY_COMPATIBILITY_BEHAVIOR` | No | Nothing in the source or docs marks this as an intentionally preserved legacy contract. |
| `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | No | The scenario has not been narrowed to a separate owner-selected subcase in this pass. |

## Final Proposed Classification

`UNCONFIRMED_RUNTIME_BEHAVIOR`

## Evidence Gaps

- No controlled observation of the exact reload / converge scenario.
- No deterministic runtime replay evidence for repeated reloads over the same
  frozen construction state.
- No owner acceptance for the behavior.
- No end-to-end proof that the persisted construction timer converges without
  race across every reconnect edge.

## Unknowns

- Whether a stale snapshot can briefly win before the freshness / sticky guards
  settle.
- Whether all construction-reload paths are equally covered by the existing
  source anchors.
- Whether a future narrowing decision should isolate a smaller construction
  subcase before any replay work begins.

## Deferred Work

- Controlled replay evidence for the exact reload / converge contract.
- Any seam decision, if later needed, for the narrow construction-reload path.
- Any owner acceptance of the runtime behavior.

## Why T064 Remains Open

- Classification alone does not decide whether the existing boundary is enough
  for runtime replay proof.
- The scenario still reads as a runtime question, so the next step is the seam
  / boundary decision, not acceptance.

## Task State

- `T063` complete: `yes`
- `T064` remains open: `yes`
