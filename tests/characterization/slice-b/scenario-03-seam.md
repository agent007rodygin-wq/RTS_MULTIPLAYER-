# Scenario 3 Seam Decision

Task authority: `T048` in `specs/002-characterization-tests/tasks.md`

Audit target: `After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.`

This is a seam-decision pass only. It does not accept runtime behavior, does
not design a fixture, and does not promote the broad scenario.

## Summary

- Broad scenario: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Contract decision: `SCENARIO_SPLIT_REQUIRED`
- Selected continuation: `CONSTRUCTION_COMPLETION_FIRST`
- Final seam outcome: `MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`
- Pure importable boundary already exists: `no`
- Minimal owner-approved seam may later be required: `yes`

The source shows a concrete construction-completion branch in `App.tsx`, but it
is still inline. The only nearby importable helpers are for destruction
completion and snapshot merge; neither one is the construction-completion
boundary under review.

## Source Boundaries Reviewed

- `App.tsx:634-715` `processOfflineTimers`
- `App.tsx:12185-12203` live building-state completion branch
- `App.tsx:14370-14484` upgrade start path and its construction-shaped fields
- `src/game/buildings/resolveBuildingSnapshotMerge.js:1-185`
- `src/game/buildings/resolveLocalDestructionCompletion.js:1-58`
- `src/pocketbase.ts:391-641`
- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/07-production-system.md`
- `specs/_baseline/08-upgrade-system.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/17-traceability-index.md`

## Construction Ownership Map

| Layer | Owns | Notes |
| --- | --- | --- |
| `PocketBase` | Persistent record authority | Server records remain the persistent source of truth. |
| `src/pocketbase.ts` | Transport / snapshot delivery | Delivers refresh-load and realtime state, but does not decide completion. |
| `App.tsx` | Local completion transition | Owns the inline construction-completion branch and the write / trace calls around it. |
| `processOfflineTimers` | Offline reconciliation | Finalizes expired construction when the client replays overdue timers. |
| Live building-state loop | Foreground reconciliation | Runs the same construction-completion transition when a building stays expired in the foreground. |
| `resolveBuildingSnapshotMerge.js` | Snapshot merge policy | Handles stale snapshot reconciliation, not construction completion. |
| `resolveLocalDestructionCompletion.js` | Adjacent helper pattern | Proves helper style exists for destruction, but it is not the construction boundary. |

## Exact Construction Branch Under Review

- Offline path: `if (building.isConstructing && building.constructionEndTime && now >= building.constructionEndTime)`
- Live path: `else if (updatedB.isConstructing && now >= updatedB.constructionEndTime)`

## Input-Field Inventory

| Field | Used by the branch? | Role |
| --- | --- | --- |
| `isConstructing` | Yes | Primary guard that decides whether construction can complete. |
| `constructionEndTime` | Yes | Timer fence that must be reached. |
| `now` | Yes | Deterministic completion time check. |
| `building.id` | Yes, indirectly | Used for timer-trace / persistence keying. |
| `workState` | No, as input | It is written to `'idle'` after completion, not consulted first. |
| `constructionStartTime` | No | Not consulted by the current completion branch. |
| building type/config | No | Not used for the completion decision itself. |
| upgrade markers / legacy fallback fields | No | No evidence that the branch consults them. |

## Output-Field Transition Inventory

- `isConstructing` becomes `false`
- `workState` becomes `'idle'`
- `recordBuildingTimerTrace(..., transition: 'construction-complete')`
- `updateBuildingDocSafe(docId, { isConstructing: false, workState: 'idle' })`
- `needsUpdate` / `stateChanged` become `true` so the updated building is emitted

The branch does **not** clear `constructionEndTime`; the local no-op comes from
the state flip, not from timestamp erasure.

## Local Idempotency Guard Analysis

- The immediate guard is the `isConstructing && constructionEndTime && now >= constructionEndTime` check.
- In `processOfflineTimers`, `_offlineTimersSynced` prevents duplicate DB writes for the same stale offline pass.
- The second attempt is a no-op only when the mutated local building state is preserved and reprocessed.
- There is no persisted once-only marker proving cross-reload or cross-device idempotency.
- The guard does not prove reward exactness, server persistence, or multi-client safety.

## Upgrade Overlap Analysis

- Upgrades use the same `isConstructing` / `constructionEndTime` shape, so there is a partial semantic overlap.
- The source does **not** prove an identical completion abstraction:
  - upgrade initiation rewrites building identity / target shape elsewhere;
  - the upgrade lifecycle carries its own semantics and persistence shape.
- Construction and upgrade should stay separate for now; do not force them into one generic timer helper.
- The current evidence is enough to say the construction branch is construction-shaped, not enough to say upgrades are the same contract.

## Candidate Seam Table

| Candidate | Status | Why it is sufficient or insufficient |
| --- | --- | --- |
| Current inline `App.tsx` branch | Sufficient as evidence, insufficient as a replay seam | It proves the behavior exists, but it is duplicated inline and not importable. |
| `resolveBuildingSnapshotMerge.js` | Insufficient | It handles stale snapshot merge, not local construction completion. |
| `resolveLocalDestructionCompletion.js` | Insufficient | It demonstrates the helper pattern, but it is destruction-specific and uses different fields. |
| New `resolveLocalConstructionCompletion.js` | Minimal seam candidate | This is the narrowest importable helper that can lift only the completion decision without moving PocketBase, refs, or reconciliation side effects. |

## Smallest Safe Seam Proposal

- Add one pure helper under `src/game/buildings/resolveLocalConstructionCompletion.js`.
- Suggested boundary:
  - inputs: `building`, deterministic `now`, normalized `constructionEndTime`
  - optional input: `building.id` only if the caller wants a blocked-missing-identity result
  - outputs: `completedBuilding`, `decision`, `completed`, and `blockedReason` only if the helper validates malformed inputs
- Keep these outside the helper:
  - React refs and state setters
  - PocketBase writes
  - trace logging
  - offline sync bookkeeping
  - reconnect merge logic
  - upgrade-specific rewrite semantics
- The helper should only answer whether the construction completion transition fires and what the completed building looks like.

## Runtime Behavior That Must Remain Unchanged

- Construction still completes when the same end-time fence is reached.
- The live loop and offline timer pass still own their own orchestration.
- `recordBuildingTimerTrace` and `updateBuildingDocSafe` stay in `App.tsx`.
- No new persistence semantics are introduced.
- Upgrade, production, destruction, and generic timer families remain untouched.

## Rollback Path

- Keep the inline branch until the helper has parity coverage.
- If parity fails, revert helper usage and retain the current inline branch.
- If owner approval is not granted, do not extract the helper.

## Owner-Approval Boundary

- Owner approval is required before implementation because this touches a protected timer / completion path.
- The approval would cover only the minimal construction-completion helper and no broader lifecycle refactor.

## T049 Readiness

- T049 may proceed to fixture design for the construction-completion subcase.
- That fixture work should assume the narrow helper candidate above, but it should not treat the seam as implemented yet.
