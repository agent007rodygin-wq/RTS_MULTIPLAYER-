# Scenario 9 Seam Decision

Task authority:

- `specs/002-characterization-tests/tasks.md` T096
- `tests/characterization/slice-c/scenario-09-source-audit.md`
- `tests/characterization/slice-c/scenario-09-classification.md`

Scenario wording:

"Late command acknowledgement cannot overwrite a newer local intent."

## Decision

- Broad scenario classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Final seam outcome: `CURRENT_BOUNDARY_NOT_REPLAYABLE`
- Current boundary classification: `inline-only` for the optimistic-command /
  reconciliation flow
- Narrow existing replayable subcontract: `resolveBuildingSnapshotMerge(...)`
  can prefer a supplied protected recent local building over a stale server
  building
- Exact broad Scenario 9 contract: a late acknowledgement or server snapshot
  must not overwrite newer local intent
- Pure importable late-response seam already exists: `no`
- Owner-approved seam requested now: `no`
- Replayable boundary exists today: only the narrow snapshot-preference
  subcontract, not the exact broad contract

## Source Boundary

The live source already exposes the late-ack fence through the existing
placement and reconciliation paths:

- `App.tsx:3336-3381` - optimistic placement and identity refs
- `App.tsx:5827-6234` - `placeBuildingAtTile(...)` optimistic placement flow
- `App.tsx:6099-6206` - optimistic render, server write, success remap, and
  rollback catch
- `App.tsx:7929-8145` - `updatePlacedBuildingsFromServer(...)` merge /
  offline catch-up / snapshot repair
- `App.tsx:11374-12680` - later building-merge and protection paths that still
  consult `lastInteractionRef`
- `src/pocketbase.ts:1854-2219` - realtime subscription adapter, initial
  fetch, retry, cooldown refetch
- `src/pocketbase.ts:1037-1460` - create/update helpers and failure handling
  shape

The baseline documents reinforce the same ownership split and the fact that
this is still only partially confirmed at runtime:

- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Ownership

| Slice | Owner | Source-backed responsibility |
| --- | --- | --- |
| Optimistic command orchestration | `App.tsx` | Applies the local optimistic change, tracks `lastInteractionRef`, and coordinates the write / remap / rollback flow. |
| Persisted building record | PocketBase via `src/pocketbase.ts` | Stores the building row and participates in the realtime delivery path. |
| Realtime transport and retry | `src/pocketbase.ts` | Performs initial fetch, subscribe, retry, and cooldown refetch. |
| Local-intent and identity refs | App-owned refs | Bias the merge toward the newer local intent and preserve temp/doc identity mappings. |

## Why The Existing Helper Does Not Prove The Broad Contract

`resolveBuildingSnapshotMerge(...)` is pure and replayable, but it only proves
the narrow snapshot-preference subcontract. It does **not** prove the exact
broad late-response fence because it does not receive the full caller-owned
reconciliation facts needed to model the command acknowledgement boundary:

- optimistic temp/canonical identity mapping
- acknowledgement context
- `lastServerSyncRef`
- App-level collection iteration
- server acknowledgement ordering
- realtime/refetch ordering

The helper can say which supplied building should win a merge, but it cannot
by itself prove that a late acknowledgement or late snapshot will never
overwrite newer local intent in the live app flow.

The source therefore supports the narrow replayable subcontract, but the exact
Scenario 9 contract remains outside the current replay boundary.

## Whether A New Helper Is Required

Yes, if future replay work needs the exact broad Scenario 9 fence to be
proven, a new seam would be required. The seam would need to stay narrowly
focused on the late-response reconciliation boundary and would have to avoid:

- PocketBase writes
- resource mutation
- trace logging
- refs, caches, retries, or subscriptions inside the helper
- any broader gameplay subsystem

## Stop Conditions

- stop if later evidence proves the current boundary cannot express the
  late-response fence without runtime changes
- stop if a future helper would need to own persistence or resource mutation
- stop if the scenario is widened into a multi-contract replay bundle

## Missing Implementation Authority

The current task graph does not contain an open seam-implementation task for
Scenario 9. Record this gap explicitly as:

`MISSING_SCENARIO_9_SEAM_IMPLEMENTATION_TASK`

That means T097 cannot become a completed replayable fixture yet; it can only
be a blocked fixture-design step until seam implementation authority exists.

## T097 Readiness

T097 may proceed only as a blocked fixture design. The completed replayable
fixture must wait for seam implementation.

Task state:

- `T096`: complete
- `T097`: open
