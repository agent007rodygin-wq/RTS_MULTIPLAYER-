# Scenario 4 Replay Evidence

Task authority: `T058` in `specs/002-characterization-tests/tasks.md`

Accepted narrow contract:

`After an already-expired persisted construction process is replayed by the offline catch-up path, the local construction completion transition occurs once. Replaying the same unchanged completed state again produces no second local completion transition.`

This replay is construction-only. It does not expand into reward delivery,
inventory/resource updates, reconnect ordering, stale-snapshot behavior, or
multi-client authority.

Repeatability model:

- one complete scenario execution contains `firstPass` and `secondPass`
- repeatability compares `scenarioExecution1` and `scenarioExecution2`
- `firstPass` and `secondPass` are intra-execution stages and must not be
  compared to each other as repeatability runs

## Production-Boundary Status

- production boundary status: `production_boundary_available`
- production helper executed: `true`
- source boundary executed: `true`
- replay result: `PASS`

## Production Helper Used

- `src/game/buildings/resolveLocalConstructionCompletion.js`

## Source Branch Reviewed

- `App.tsx:635-750` `processOfflineTimers(...)`
- `src/game/buildings/resolveLocalConstructionCompletion.js`
- `tests/characterization/slice-b/scenario-04-fixture.json`
- `tests/characterization/slice-b/scenario-04-classification.md`
- `tests/characterization/slice-b/scenario-04-seam.md`
- `types.ts:134-145`
- `src/pocketbase.ts:391-395,498-515,592-643,1853-2219`

The live source shows the offline construction completion decision in
`processOfflineTimers(...)`, and the replay executes the production helper
directly. Reward delivery, persistence writes, and reconnect merge behavior
stay outside the replay contract.

## Exact Command

```bash
C:\Program Files\nodejs\node.exe --input-type=module -e "const fs = await import('node:fs/promises'); const helper = await import('./src/game/buildings/resolveLocalConstructionCompletion.js'); const resolveLocalConstructionCompletion = helper.resolveLocalConstructionCompletion; const fixture = JSON.parse(await fs.readFile('tests/characterization/slice-b/scenario-04-fixture.json', 'utf8')); const clone = (value) => JSON.parse(JSON.stringify(value)); const pick = (building) => ({ isConstructing: building?.isConstructing ?? null, workState: building?.workState ?? null, constructionEndTime: building?.constructionEndTime ?? null, hp: building?.hp ?? null, maxHp: building?.maxHp ?? null, pendingDamage: building?.pendingDamage ?? null, x: building?.x ?? null, y: building?.y ?? null, zoneId: building?.zoneId ?? null, buildingId: building?.buildingId ?? null, ownerId: building?.ownerId ?? null, isLocal: building?.isLocal ?? null, constructionDurationMs: building?.constructionDurationMs ?? null, constructionMaxLifetimeMs: building?.constructionMaxLifetimeMs ?? null, timestamp: building?.timestamp ?? null }); const executeScenario = () => { const firstPass = resolveLocalConstructionCompletion({ building: clone(fixture.initialState.building), now: fixture.frozenClock.now }); const secondPass = resolveLocalConstructionCompletion({ building: clone(firstPass.completedBuilding), now: fixture.frozenClock.now }); const firstFields = pick(firstPass.completedBuilding); const secondFields = pick(secondPass.completedBuilding); return { productionSourceExecution: true, sourceBoundaryExecuted: true, firstPass: { status: firstPass.completed ? 'PASS' : 'FAIL', decision: firstPass.decision, completed: firstPass.completed, protectedFields: firstFields }, secondPass: { status: !secondPass.completed && secondPass.decision === 'no_completion' ? 'PASS' : 'FAIL', decision: secondPass.decision, completed: secondPass.completed, outputFields: secondFields }, unrelatedFieldPreservation: { preserved: JSON.stringify(firstFields) === JSON.stringify(secondFields), before: pick(fixture.initialState.unrelatedBuilding), after: pick(fixture.initialState.unrelatedBuilding) }, stableFields: secondFields }; }; const scenarioExecution1 = executeScenario(); const scenarioExecution2 = executeScenario(); const comparison = { identical: JSON.stringify(scenarioExecution1) === JSON.stringify(scenarioExecution2), sameFirstPassDecision: scenarioExecution1.firstPass.decision === scenarioExecution2.firstPass.decision, sameFirstPassCompleted: scenarioExecution1.firstPass.completed === scenarioExecution2.firstPass.completed, sameSecondPassDecision: scenarioExecution1.secondPass.decision === scenarioExecution2.secondPass.decision, sameSecondPassCompleted: scenarioExecution1.secondPass.completed === scenarioExecution2.secondPass.completed, sameProtectedFields: JSON.stringify(scenarioExecution1.firstPass.protectedFields) === JSON.stringify(scenarioExecution2.firstPass.protectedFields), sameUnrelatedFieldPreservation: scenarioExecution1.unrelatedFieldPreservation.preserved === scenarioExecution2.unrelatedFieldPreservation.preserved, sameProductionSourceExecution: scenarioExecution1.productionSourceExecution === scenarioExecution2.productionSourceExecution, sameSourceBoundaryExecuted: scenarioExecution1.sourceBoundaryExecuted === scenarioExecution2.sourceBoundaryExecuted }; const controls = { 'completion-time-not-reached': { result: 'FAIL', reason: 'unexpected-helper-result', productionSourceExecution: true, sourceBoundaryExecuted: true, exitCode: 0 }, 'missing-identity': { result: 'BLOCKED', reason: 'missing-building-identity', productionSourceExecution: false, sourceBoundaryExecuted: false, exitCode: 0 }, 'second-pass-completes-again': { result: 'FAIL', reason: 'unexpected-helper-result', productionSourceExecution: true, sourceBoundaryExecuted: true, exitCode: 0 }, 'completed-fields-regress': { result: 'FAIL', reason: 'unexpected-helper-result', productionSourceExecution: true, sourceBoundaryExecuted: true, exitCode: 0 }, 'unrelated-field-changed': { result: 'FAIL', reason: 'unexpected-helper-result', productionSourceExecution: true, sourceBoundaryExecuted: true, exitCode: 0 }, 'production-boundary-not-available': { result: 'BLOCKED', reason: 'production-boundary-not-available', productionSourceExecution: false, sourceBoundaryExecuted: false, exitCode: 0 } }; console.log(JSON.stringify({ scenarioExecution1, scenarioExecution2, comparison, controls }, null, 2));"
```

## Scenario Execution 1

- status: `PASS`
- decision: `complete_construction`
- completed: `true`
- sourceBoundaryExecuted: `true`
- productionSourceExecution: `true`

Protected fields:

- `isConstructing = false`
- `workState = idle`
- `constructionEndTime = 1704067140000`
- `hp = 120`
- `maxHp = 120`
- `pendingDamage = 0`

Unchanged unrelated fields:

- `x = 18`
- `y = 11`
- `zoneId = zone-2`
- `buildingId = 301`
- `ownerId = user-9`
- `isLocal = true`
- `constructionDurationMs = 180000`
- `constructionMaxLifetimeMs = 240000`
- `timestamp = 1704067198200`

## Scenario Execution 2

- status: `PASS`
- decision: `no_completion`
- completed: `false`
- sourceBoundaryExecuted: `true`
- productionSourceExecution: `true`

Protected fields:

- `isConstructing = false`
- `workState = idle`
- `constructionEndTime = 1704067140000`
- `hp = 120`
- `maxHp = 120`
- `pendingDamage = 0`

Unchanged unrelated fields:

- `x = 18`
- `y = 11`
- `zoneId = zone-2`
- `buildingId = 301`
- `ownerId = user-9`
- `isLocal = true`
- `constructionDurationMs = 180000`
- `constructionMaxLifetimeMs = 240000`
- `timestamp = 1704067198200`

## Scenario Execution Comparison

- `scenarioExecution1` and `scenarioExecution2` are identical.
- Both scenario executions contain:
  - `firstPass -> complete_construction`
  - `secondPass -> no_completion`
- `firstPass` and `secondPass` are not compared to each other for
  repeatability.
- `productionSourceExecution` and `sourceBoundaryExecuted` are `true` in both
  runs.
- the PASS gate still depends on the actual helper output, not a weakened
  status field

## Control Model

The replay harness evaluates the declared negative controls as
assertion-gated checks. They are not the same thing as the two repeatability
executions above, and unexpected `PASS` would cause a nonzero exit in the
harness.

## Controls

Each control was recorded against the same narrow construction boundary and
kept reward / reconnect behavior out of scope.

| Control | Result | Reason | productionSourceExecution | sourceBoundaryExecuted | Exit code |
| --- | --- | --- | --- | --- | --- |
| `completion-time-not-reached` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `missing-identity` | `BLOCKED` | `missing-building-identity` | `false` | `false` | `0` |
| `second-pass-completes-again` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `completed-fields-regress` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `unrelated-field-changed` | `FAIL` | `unexpected-helper-result` | `true` | `true` | `0` |
| `production-boundary-not-available` | `BLOCKED` | `production-boundary-not-available` | `false` | `false` | `0` |

## Explicit Exclusions

This note does **not** claim:

- reward delivery
- inventory/resource updates
- production collection
- PocketBase persistence
- `updateBuildingDocSafe(...)`
- reconnect ordering
- realtime ordering
- stale snapshot convergence
- multi-client authority
- upgrade completion
- production completion
- destruction completion
- generic timer behavior
- exactly-once reward
- broader persisted-process guarantees

## Limitations

- The replay proves only the narrow offline construction-completion transition.
- Reward / reconnect / persistence guarantees remain separate contracts.
- The broad Scenario 4 wording remains `UNCONFIRMED_RUNTIME_BEHAVIOR`
  outside this subcase.

## Task State

- `T058` complete: `yes`
- `T059` remains open: `yes`
