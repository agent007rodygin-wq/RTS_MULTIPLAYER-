# Scenario 1 Production Boundary Review

## Outcome

`MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`

I did **not** find an already exported, importable pure decision boundary that
executes the actual Scenario 1 building merge decision.

The production decision is currently embedded in `App.tsx:updatePlacedBuildingsFromServer()`
and is only partially factorizable through internal, non-exported helpers.

## Files And Symbols Inspected

### `App.tsx`

- `hasActiveDestructionWindow`
- `shouldPreferServerRevivedBuildingState`
- `isBuildingDeleting`
- `isBuildingTombstoned`
- `removeBuildingFromSnapshotCaches`
- `processOfflineTimers`
- `updatePlacedBuildingsFromServer`
- `serverZoneBuildingsRef`
- `serverMyBuildingsRef`
- `lastInteractionRef`
- `lastServerSyncRef`

### `src/pocketbase.ts`

- `onSnapshot`
- `fetchQueryRecords`
- `buildIncrementalZoneSnapshot`
- `fetchLatestSnapshot`
- `getDoc`
- `getDocs`

### Existing Scenario 1 docs reviewed

- `tests/characterization/scenario-001-source-audit.md`
- `tests/characterization/scenario-001-classification.md`
- `tests/characterization/scenario-001-seam-decision.md`
- `tests/characterization/scenario-001-fixture-design.md`
- `tests/characterization/scenario-001-readiness-review.md`
- `tests/characterization/scenario-001-replay-evidence.md`
- `tests/characterization/scenario-001-replay-fidelity-review.md`

### Baseline docs reviewed

- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/15-invariants.md`

## Existing Importable Candidates

### `src/pocketbase.ts:onSnapshot`

Sufficient for source ordering, not sufficient for Scenario 1 proof.

Why insufficient:

- it delivers `refresh-load` and `realtime-event` snapshots;
- it does **not** decide the visible building merge outcome;
- it cannot prove whether the older late snapshot loses inside the
  `App.tsx` building reconciliation path.

### `src/pocketbase.ts:getDoc` / `getDocs` / `fetchQueryRecords`

Sufficient for observing initial fetch inputs, not sufficient for the final
decision.

Why insufficient:

- they produce the snapshot payloads;
- they do not contain the building merge policy;
- they cannot replace the `updatePlacedBuildingsFromServer()` decision surface.

### Internal App helpers

- `hasActiveDestructionWindow`
- `shouldPreferServerRevivedBuildingState`

These are pure, but they are **internal** to `App.tsx` and are not exportable
or importable as-is.

Why insufficient:

- they are helper predicates, not the whole Scenario 1 merge decision;
- they still depend on the surrounding building merge context;
- they do not expose a real production replay boundary without code changes.

## Why The Synthetic Replay Was Not Enough

The synthetic replay proved only a narrow sticky-window subcase.
It did not execute the production merge boundary and it omitted production
branches such as:

- `processOfflineTimers(...)`
- `findLocalMatchForServerBuilding(...)`
- `serverMatchesLocal` early-clear behavior
- per-field sticky merge splits (`shouldStickPosition`, `shouldStickHealthState`)
- Town Hall grace-window handling
- `lastServerSyncRef`-driven freshness retention
- `removeBuildingFromSnapshotCaches(...)` side effects
- the full `updatePlacedBuildingsFromServer()` merge pipeline

That is why the synthetic evidence is useful but not sufficient for the broad
Scenario 1 contract.

## Minimal Behavior-Preserving Seam Proposal

### Exact source location

`App.tsx`, inside `updatePlacedBuildingsFromServer()`

The seam should be extracted from the `finalBuildings = Array.from(merged.values()).map(...)`
building reconciliation block, together with the immediate sticky-interaction
decision code that compares `localB`, `serverB`, `lastInteractionRef`, and
`lastServerSyncRef`.

### Proposed exported function signature

```ts
resolveBuildingSnapshotMerge({
  serverBuilding,
  localBuilding,
  currentUserId,
  now,
  lastInteractionAt,
  lastServerSyncAt,
  deleting,
  tombstoned,
  stickyInteractionMs,
  deletionProtectionMs,
}: {
  serverBuilding: PlacedBuilding;
  localBuilding?: PlacedBuilding;
  currentUserId?: string | null;
  now: number;
  lastInteractionAt: number;
  lastServerSyncAt: number;
  deleting: boolean;
  tombstoned: boolean;
  stickyInteractionMs: number;
  deletionProtectionMs: number;
}): {
  mergedBuilding: PlacedBuilding;
  decision:
    | 'keep_local_protected'
    | 'replace_local_with_server'
    | 'keep_local_sticky'
    | 'accepted_server_matches_local'
    | 'accept_server_update'
    | 'skip_server_dead'
    | 'blocked_deleted';
  clearLastInteraction: boolean;
}
```

### Inputs

- server snapshot building
- optional local building match
- current user id
- current time
- last interaction time
- last server sync time
- deletion / tombstone flags
- sticky and deletion protection windows

### Output

- the merged building result
- the merge decision label
- whether the caller should clear `lastInteractionRef` for that id

### Dependencies

- `normalizePlacedBuildingHealth`
- `hasActiveDestructionWindow`
- `shouldPreferServerRevivedBuildingState`

### Why this does not create a second source of truth

- the helper is pure
- all authority still comes from the current server snapshot and the current
  caller-provided state
- the helper only returns a decision; it does not own persistence, refs, or
  caches

### Why this does not change runtime behavior

- `App.tsx` would delegate to the extracted helper with the exact same inputs
- the side effects remain in the caller
- the merge rules remain identical

### Why a broader refactor is unnecessary

- Scenario 1 only needs the building merge decision path
- the other realtime consumers do not need to be moved or rewritten
- the replay boundary can be proven with a narrow helper instead of a
  broad App architecture change

### Risks

- object-identity drift if the caller reconstructs buildings differently
- accidentally dropping one of the sticky / tombstone branches
- forgetting to preserve `lastInteractionRef` clearing semantics
- overgeneralizing the seam so it starts to own unrelated consumers

### Required verification

- compare current source behavior to the extracted helper on the same inputs
- rerun the baseline replay with the real boundary
- rerun the negative controls
- confirm no runtime writes, PocketBase mutation, or behavior change
- confirm `git diff --check` is clean

### Rollback path

- inline the helper body back into `updatePlacedBuildingsFromServer()`
- remove the export / import
- keep the caller-side side effects unchanged

### Owner approval required

Yes. This seam touches replay-sensitive building merge behavior and must be
explicitly approved before implementation.

## Final Assessment

- T026 cannot complete against a real production boundary without a seam or an
  already exported helper.
- T027 remains blocked.
- Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.
