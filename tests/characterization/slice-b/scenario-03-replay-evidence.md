# Scenario 3 Replay Evidence

Task authority: `T050` in `specs/002-characterization-tests/tasks.md`

Audit target: `After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.`

This note records the corrected nested repeatability model:

- one full scenario execution contains `firstPass` and `secondPass`;
- repeatability compares `scenarioRun1` and `scenarioRun2`;
- `firstPass` and `secondPass` are intentionally different stages and must not be compared to each other as repeatability runs.

## Why the previous repeatability shape was incorrect

The earlier harness conflated:

- `firstPass` / `secondPass` inside one scenario execution;

with:

- `scenarioRun1` / `scenarioRun2` repeatability executions.

That was logically wrong because the two inner passes are supposed to have
different decisions:

- `firstPass -> complete_construction`
- `secondPass -> no_completion`

The corrected model compares two complete scenario executions instead.

## Production-Boundary Status

- completion boundary status: `production_boundary_available`
- sourceBoundaryExecuted for the replay chain: `true`
- replay result: `PASS`
- replay kind: production-bound replay evidence

## Production Helper Used

- `src/game/buildings/resolveLocalConstructionCompletion.js`

## Source Branch Reviewed

- `App.tsx:634-671` `processOfflineTimers`
- `App.tsx:12189-12229` foreground construction-completion loop
- `src/game/buildings/resolveLocalConstructionCompletion.js`
- `tests/characterization/slice-b/scenario-03-fixture-design.md`
- `tests/characterization/slice-b/scenario-03-seam.md`

The live source shows the construction-completion guard inline in `App.tsx`,
but the completion decision itself is now factored into the production helper
above. The helper stays construction-specific; upgrade completion remains a
separate path.

## Exact Commands

1. `node tests/characterization/slice-b/scenario-03-replay.mjs`
2. `node tests/characterization/slice-b/scenario-03-replay.mjs --control=completion-time-not-reached`
3. `node tests/characterization/slice-b/scenario-03-replay.mjs --control=missing-identity`
4. `node tests/characterization/slice-b/scenario-03-replay.mjs --control=second-pass-completes-again`
5. `node tests/characterization/slice-b/scenario-03-replay.mjs --control=completed-fields-regress`
6. `node tests/characterization/slice-b/scenario-03-replay.mjs --control=unrelated-building-changed`
7. `node tests/characterization/slice-b/scenario-03-replay.mjs --control=production-helper-not-executed`

## Scenario Run 1 Output

```json
{
  "scenarioId": "T050",
  "acceptedContract": "After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.",
  "command": "node tests/characterization/slice-b/scenario-03-replay.mjs",
  "status": "PASS",
  "productionSourceExecution": true,
  "sourceBoundaryExecuted": true,
  "scenarioRun1": {
    "scenarioId": "T050",
    "acceptedContract": "After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.",
    "productionSourceExecution": true,
    "sourceBoundaryExecuted": true,
    "firstPass": {
      "status": "PASS",
      "decision": "complete_construction",
      "completed": true,
      "completedFields": {
        "isConstructing": false,
        "workState": "idle",
        "constructionEndTime": 1704067140000,
        "hp": 120,
        "maxHp": 120,
        "pendingDamage": 0
      }
    },
    "secondPass": {
      "status": "PASS",
      "decision": "no_completion",
      "completed": false,
      "outputFields": {
        "isConstructing": false,
        "workState": "idle",
        "constructionEndTime": 1704067140000,
        "hp": 120,
        "maxHp": 120,
        "pendingDamage": 0
      }
    },
    "unrelatedFieldPreservation": {
      "preserved": true,
      "before": {
        "isConstructing": false,
        "workState": "idle",
        "constructionEndTime": null,
        "hp": 95,
        "maxHp": 95,
        "pendingDamage": 0
      },
      "after": {
        "isConstructing": false,
        "workState": "idle",
        "constructionEndTime": null,
        "hp": 95,
        "maxHp": 95,
        "pendingDamage": 0
      }
    }
  },
  "scenarioRun2": {
    "scenarioId": "T050",
    "acceptedContract": "After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.",
    "productionSourceExecution": true,
    "sourceBoundaryExecuted": true,
    "firstPass": {
      "status": "PASS",
      "decision": "complete_construction",
      "completed": true,
      "completedFields": {
        "isConstructing": false,
        "workState": "idle",
        "constructionEndTime": 1704067140000,
        "hp": 120,
        "maxHp": 120,
        "pendingDamage": 0
      }
    },
    "secondPass": {
      "status": "PASS",
      "decision": "no_completion",
      "completed": false,
      "outputFields": {
        "isConstructing": false,
        "workState": "idle",
        "constructionEndTime": 1704067140000,
        "hp": 120,
        "maxHp": 120,
        "pendingDamage": 0
      }
    },
    "unrelatedFieldPreservation": {
      "preserved": true,
      "before": {
        "isConstructing": false,
        "workState": "idle",
        "constructionEndTime": null,
        "hp": 95,
        "maxHp": 95,
        "pendingDamage": 0
      },
      "after": {
        "isConstructing": false,
        "workState": "idle",
        "constructionEndTime": null,
        "hp": 95,
        "maxHp": 95,
        "pendingDamage": 0
      }
    }
  },
  "semanticComparison": {
    "identical": true,
    "sameScenarioId": true,
    "sameAcceptedContract": true,
    "sameFirstPassDecision": true,
    "sameFirstPassCompleted": true,
    "sameFirstPassCompletedFields": true,
    "sameSecondPassDecision": true,
    "sameSecondPassCompleted": true,
    "sameSecondPassOutputFields": true,
    "sameUnrelatedFieldPreservation": true,
    "sameProductionSourceExecution": true,
    "sameSourceBoundaryExecuted": true
  },
  "controls": {
    "completionTimeNotReached": "FAIL",
    "missingIdentity": "BLOCKED",
    "secondPassCompletesAgain": "FAIL",
    "completedFieldsRegress": "FAIL",
    "unrelatedBuildingChanged": "FAIL",
    "productionHelperNotExecuted": "BLOCKED"
  },
  "limitations": [
    "Construction completion is still caller-owned for traces and PocketBase writes in App.tsx.",
    "This replay covers the local construction-completion transition only.",
    "Upgrade, production, destruction, and reconnect persistence remain separate contracts."
  ]
}
```

## Control Command Outputs

| Command | Exit code | Semantic result | Boundary state | Reason |
| --- | ---: | --- | --- | --- |
| `node tests/characterization/slice-b/scenario-03-replay.mjs --control=completion-time-not-reached` | `0` | `FAIL` | `productionSourceExecution: true`, `sourceBoundaryExecuted: true` | completion time was still in the future, so the construction transition correctly did not fire |
| `node tests/characterization/slice-b/scenario-03-replay.mjs --control=missing-identity` | `0` | `BLOCKED` | `productionSourceExecution: false`, `sourceBoundaryExecuted: false` | missing building identity prevented the replay from reaching the production helper |
| `node tests/characterization/slice-b/scenario-03-replay.mjs --control=second-pass-completes-again` | `0` | `FAIL` | `productionSourceExecution: true`, `sourceBoundaryExecuted: true` | the already-completed state stayed idempotent on the second pass |
| `node tests/characterization/slice-b/scenario-03-replay.mjs --control=completed-fields-regress` | `0` | `FAIL` | `productionSourceExecution: true`, `sourceBoundaryExecuted: true` | the protected completed fields remained stable and did not regress |
| `node tests/characterization/slice-b/scenario-03-replay.mjs --control=unrelated-building-changed` | `0` | `FAIL` | `productionSourceExecution: true`, `sourceBoundaryExecuted: true` | the unrelated building stayed unchanged and did not interfere with the replay |
| `node tests/characterization/slice-b/scenario-03-replay.mjs --control=production-helper-not-executed` | `0` | `BLOCKED` | `productionSourceExecution: false`, `sourceBoundaryExecuted: false` | production-helper-not-executed |

## Exit-Code Behavior

- Baseline run: exit code `0`
- Expected negative controls: exit code `0`
- Unexpected command names: exit nonzero
- Uncontrolled exceptions: exit nonzero
- `FAIL` and `BLOCKED` remain semantically distinct in the report

## Semantic Comparison

- `scenarioRun1` and `scenarioRun2` are identical.
- Each scenario run contains:
  - `firstPass -> complete_construction`
  - `secondPass -> no_completion`
- The repeatability comparison is between the two complete scenario runs.
- `firstPass` and `secondPass` are not compared to each other for equality.
- `sameProductionSourceExecution` and `sameSourceBoundaryExecuted` are both `true`.
- The PASS gate still depends on the actual helper output, not a weakened status field.

## Supported Claim

`After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.`

## Limitations

- Construction completion still leaves trace logging and PocketBase writes to `App.tsx`.
- The helper is construction-specific and does not absorb upgrade completion.
- Upgrade, production, destruction, reload, reconnect, and multi-client contracts remain separate.

## T050 Status

- T050 complete: `yes`
- T051 remains open: `yes`
- five-file checkpoint ready to commit: `yes`
- broad persisted-process exactly-once scenario remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside the narrow construction subcase
