# Scenario 7 Replay Evidence

Task authority: `T082` in `specs/002-characterization-tests/tasks.md`

Exact Scenario 7 wording:

`Upgrade completion survives reconnect without duplicate transformation.`

This note records the source-backed replay evidence for the narrow upgrade
transformation contract. It does not promote Scenario 7 broadly, and it does
not claim reconnect correctness, persistence correctness, or any broader
upgrade-system guarantee.

## Evidence Basis

- Source audit: `tests/characterization/slice-b/scenario-07-source-audit.md`
- Classification: `tests/characterization/slice-b/scenario-07-classification.md`
- Seam decision: `tests/characterization/slice-b/scenario-07-seam.md`
- Fixture: `tests/characterization/slice-b/scenario-07-fixture.json`
- Focused seam test: `tests/characterization/slice-b/scenario-07-upgrade-seam.mjs`
- Production helper: `src/game/buildings/resolveLocalUpgradeTransformation.js`
- Live source anchors:
  - `App.tsx:14382-14468` `handleUpgrade(...)`
  - `App.tsx:7917-8124` `updatePlacedBuildingsFromServer(...)`
  - `App.tsx:11439-11471` `updateBuildingDocSafe(...)`
  - `src/pocketbase.ts:1853-2219` `onSnapshot(...)`
  - `src/game/buildings/resolveBuildingSnapshotMerge.js`
  - `data/buildings.ts:7-31` Town Hall 1 definition
  - `data/buildings.ts:34-60` Town Hall 2 definition

## Replay Result

- `PASS`

Reason:

- The real helper executed directly, both complete scenario executions were
  `PASS`, and the comparison was `IDENTICAL`.

## Boundary Status

- `production_boundary_available`
- `pureImportableUpgradeBoundaryAvailable = true`
- `replayableUpgradeBoundaryAvailable = true`
- `minimalOwnerApprovedSeamRequired = false`
- `productionSourceExecution = true`
- `sourceBoundaryExecuted = true`
- helper is pure

## Exact Replay Command

The replay evidence was produced by importing
`src/game/buildings/resolveLocalUpgradeTransformation.js` directly, loading
`tests/characterization/slice-b/scenario-07-fixture.json`, and running two
complete scenario executions from the frozen input. The focused seam test
command used for verification was:

`node tests/characterization/slice-b/scenario-07-upgrade-seam.mjs`

## Scenario Execution 1

- status: `PASS`
- firstPass decision: `transform_upgrade`
- firstPass transformed: `true`
- firstPass blocked: `false`
- secondPass decision: `no_transformation`
- secondPass transformed: `false`
- secondPass blocked: `false`
- projected building matches `fixture.transformedState.building`: `true`
- source input was not mutated: `true`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`

Projected building:

- `buildingId = 306`
- `type = town_hall`
- `isConstructing = true`
- `constructionEndTime = 1704067640000`
- `hp = 232`
- `maxHp = 232`
- `pendingDamage = 0`

Protected fields stayed stable:

- `buildingId`
- `type`
- `isConstructing`
- `constructionEndTime`
- `hp`
- `maxHp`
- `pendingDamage`

Unchanged unrelated fields:

- `id`
- `ownerId`
- `x`
- `y`
- `zoneId`
- `isLocal`
- `timestamp`
- `customTag`
- `upgradeAudit`

## Scenario Execution 2

- status: `PASS`
- firstPass decision: `transform_upgrade`
- firstPass transformed: `true`
- firstPass blocked: `false`
- secondPass decision: `no_transformation`
- secondPass transformed: `false`
- secondPass blocked: `false`
- projected building matches `fixture.transformedState.building`: `true`
- source input was not mutated: `true`
- productionSourceExecution: `true`
- sourceBoundaryExecuted: `true`

Projected building:

- `buildingId = 306`
- `type = town_hall`
- `isConstructing = true`
- `constructionEndTime = 1704067640000`
- `hp = 232`
- `maxHp = 232`
- `pendingDamage = 0`

Protected fields stayed stable:

- `buildingId`
- `type`
- `isConstructing`
- `constructionEndTime`
- `hp`
- `maxHp`
- `pendingDamage`

Unchanged unrelated fields:

- `id`
- `ownerId`
- `x`
- `y`
- `zoneId`
- `isLocal`
- `timestamp`
- `customTag`
- `upgradeAudit`

## Comparison

- `Scenario Execution 1: PASS`
- `Scenario Execution 2: PASS`
- `comparison: IDENTICAL`
- `firstPass` and `secondPass` are intra-execution stages, not the
  repeatability units.
- No second projection occurs.
- The PASS gate depends on actual helper output and the frozen fixture, not on
  synthetic state.

## Ownership

The helper is pure and source-backed. `App.tsx` still owns resource deduction,
PocketBase writes, optimistic UI, realtime handling, retry/orchestration, and
snapshot merge behavior.

No new persistent fields were introduced, and no synthetic state token is used.

## Explicit Exclusions

This note does **not** claim:

- reward delivery
- inventory/resource changes
- PocketBase writes
- reconnect ordering
- stale snapshot convergence
- duplicate write prevention
- multi-client authority
- construction completion
- production completion
- destruction completion
- generic timer behavior
- broad Scenario 7 behavior

## Limitations

- The note proves only the narrow upgrade transformation replay.
- Reconnect, persistence, and broader upgrade-system guarantees remain
  separate contracts.
- Scenario 7 remains unpromoted outside this subcase.

## Task State

- `T082` complete: `yes`
- `T083` remains open: `yes`
