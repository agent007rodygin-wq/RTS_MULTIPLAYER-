# Scenario 1 Repeatability Verification

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

Within the active sticky-interaction window,
an older building snapshot does not replace
the accepted current building position.

## Broader Contract Still Unconfirmed

`UNCONFIRMED_RUNTIME_BEHAVIOR`

`Initial fetch cannot be overwritten by an older late snapshot.`

## Exact Command

```bash
node tests/characterization/scenario-001-characterization.mjs
```

## Run 1 Output

```json
{
  "command": "node tests/characterization/scenario-001-characterization.mjs",
  "scenarioId": "scenario-001",
  "control": "baseline",
  "modelType": "production-helper",
  "productionSourceExecution": true,
  "sourceBoundaryExecuted": true,
  "productionHelper": "src/game/buildings/resolveBuildingSnapshotMerge.js",
  "acceptedContract": "Within the active sticky-interaction window, an older building snapshot does not replace the accepted current building position.",
  "broaderContractExcluded": "Initial fetch cannot be overwritten by an older late snapshot.",
  "frozenInputs": {
    "buildingId": "building-001",
    "currentUserId": "user-1",
    "now": 1000000,
    "stickyInteractionMs": 15000,
    "deletionProtectionMs": 120000,
    "acceptedCurrentState": {
      "id": "building-001",
      "buildingId": 101,
      "x": 13,
      "y": 9,
      "zoneId": "zone-1",
      "ownerId": "user-1",
      "ownerName": "Owner",
      "isConstructing": false,
      "constructionEndTime": 0,
      "isLocal": true,
      "workState": "idle",
      "workEndTime": 0,
      "isDestroying": false,
      "destructionEndTime": 0,
      "hp": 900,
      "maxHp": 900,
      "pendingDamage": 0,
      "shieldHp": 0,
      "shieldMaxHp": 0,
      "protectionEndTime": 0,
      "lastMoveTime": 999500,
      "lastAttackTime": 0,
      "timestamp": 999400
    },
    "olderLateSnapshot": {
      "id": "building-001",
      "buildingId": 101,
      "x": 12,
      "y": 9,
      "zoneId": "zone-1",
      "ownerId": "user-1",
      "ownerName": "Owner",
      "isConstructing": false,
      "constructionEndTime": 0,
      "isLocal": false,
      "workState": "idle",
      "workEndTime": 0,
      "isDestroying": false,
      "destructionEndTime": 0,
      "hp": 900,
      "maxHp": 900,
      "pendingDamage": 0,
      "shieldHp": 0,
      "shieldMaxHp": 0,
      "protectionEndTime": 0,
      "lastMoveTime": 990000,
      "lastAttackTime": 0,
      "timestamp": 989000
    },
    "lastInteractionAt": 990000,
    "recentMoveAt": 999500,
    "deletingIds": [],
    "tombstonedIds": []
  },
  "assertions": {
    "importedProductionHelper": true,
    "deterministicInputsOnly": true,
    "acceptedContractProtected": true,
    "olderSnapshotDidNotReplaceAcceptedPosition": true,
    "expectedDecisionReturned": true,
    "stickyFlagsMatched": true,
    "nonPositionServerFieldsNotClaimed": true,
    "noLivePocketBase": true,
    "noNetwork": true,
    "noRandomness": true,
    "noPlayerDataMutation": true
  },
  "result": "PASS",
  "replayOutcome": "HELD",
  "decision": "accept_server_update",
  "winner": {
    "id": "building-001",
    "buildingId": 101,
    "x": 13,
    "y": 9,
    "zoneId": "zone-1",
    "ownerId": "user-1",
    "ownerName": "Owner",
    "isConstructing": false,
    "constructionEndTime": 0,
    "isLocal": false,
    "workState": "idle",
    "workEndTime": 0,
    "isDestroying": false,
    "destructionEndTime": 0,
    "hp": 900,
    "maxHp": 900,
    "pendingDamage": 0,
    "shieldHp": 0,
    "shieldMaxHp": 0,
    "protectionEndTime": 0,
    "lastMoveTime": 999500,
    "lastAttackTime": 0,
    "timestamp": 999400
  },
  "comparison": "N/A",
  "protectedFields": [
    "x",
    "y",
    "zoneId"
  ],
  "unconstrainedFields": [
    "buildingId",
    "workState",
    "workEndTime",
    "constructionEndTime",
    "isConstructing",
    "lastAttackTime",
    "lastMoveTime",
    "hp",
    "maxHp",
    "shieldHp",
    "shieldMaxHp",
    "protectionEndTime",
    "isDestroying",
    "pendingDamage",
    "destructionEndTime",
    "initiatorId",
    "timestamp"
  ],
  "summary": {
    "narrowClaimSupported": true,
    "broaderClaimSupported": false,
    "scenarioClassification": "CURRENT_ACCEPTED_BEHAVIOR",
    "broaderScenarioClassification": "UNCONFIRMED_RUNTIME_BEHAVIOR",
    "deterministicTwoRunResult": true,
    "sourceBoundaryExecuted": true
  }
}
```

## Run 2 Output

```json
{
  "command": "node tests/characterization/scenario-001-characterization.mjs",
  "scenarioId": "scenario-001",
  "control": "baseline",
  "modelType": "production-helper",
  "productionSourceExecution": true,
  "sourceBoundaryExecuted": true,
  "productionHelper": "src/game/buildings/resolveBuildingSnapshotMerge.js",
  "acceptedContract": "Within the active sticky-interaction window, an older building snapshot does not replace the accepted current building position.",
  "broaderContractExcluded": "Initial fetch cannot be overwritten by an older late snapshot.",
  "frozenInputs": {
    "buildingId": "building-001",
    "currentUserId": "user-1",
    "now": 1000000,
    "stickyInteractionMs": 15000,
    "deletionProtectionMs": 120000,
    "acceptedCurrentState": {
      "id": "building-001",
      "buildingId": 101,
      "x": 13,
      "y": 9,
      "zoneId": "zone-1",
      "ownerId": "user-1",
      "ownerName": "Owner",
      "isConstructing": false,
      "constructionEndTime": 0,
      "isLocal": true,
      "workState": "idle",
      "workEndTime": 0,
      "isDestroying": false,
      "destructionEndTime": 0,
      "hp": 900,
      "maxHp": 900,
      "pendingDamage": 0,
      "shieldHp": 0,
      "shieldMaxHp": 0,
      "protectionEndTime": 0,
      "lastMoveTime": 999500,
      "lastAttackTime": 0,
      "timestamp": 999400
    },
    "olderLateSnapshot": {
      "id": "building-001",
      "buildingId": 101,
      "x": 12,
      "y": 9,
      "zoneId": "zone-1",
      "ownerId": "user-1",
      "ownerName": "Owner",
      "isConstructing": false,
      "constructionEndTime": 0,
      "isLocal": false,
      "workState": "idle",
      "workEndTime": 0,
      "isDestroying": false,
      "destructionEndTime": 0,
      "hp": 900,
      "maxHp": 900,
      "pendingDamage": 0,
      "shieldHp": 0,
      "shieldMaxHp": 0,
      "protectionEndTime": 0,
      "lastMoveTime": 990000,
      "lastAttackTime": 0,
      "timestamp": 989000
    },
    "lastInteractionAt": 990000,
    "recentMoveAt": 999500,
    "deletingIds": [],
    "tombstonedIds": []
  },
  "assertions": {
    "importedProductionHelper": true,
    "deterministicInputsOnly": true,
    "acceptedContractProtected": true,
    "olderSnapshotDidNotReplaceAcceptedPosition": true,
    "expectedDecisionReturned": true,
    "stickyFlagsMatched": true,
    "nonPositionServerFieldsNotClaimed": true,
    "noLivePocketBase": true,
    "noNetwork": true,
    "noRandomness": true,
    "noPlayerDataMutation": true
  },
  "result": "PASS",
  "replayOutcome": "HELD",
  "decision": "accept_server_update",
  "winner": {
    "id": "building-001",
    "buildingId": 101,
    "x": 13,
    "y": 9,
    "zoneId": "zone-1",
    "ownerId": "user-1",
    "ownerName": "Owner",
    "isConstructing": false,
    "constructionEndTime": 0,
    "isLocal": false,
    "workState": "idle",
    "workEndTime": 0,
    "isDestroying": false,
    "destructionEndTime": 0,
    "hp": 900,
    "maxHp": 900,
    "pendingDamage": 0,
    "shieldHp": 0,
    "shieldMaxHp": 0,
    "protectionEndTime": 0,
    "lastMoveTime": 999500,
    "lastAttackTime": 0,
    "timestamp": 999400
  },
  "comparison": "N/A",
  "protectedFields": [
    "x",
    "y",
    "zoneId"
  ],
  "unconstrainedFields": [
    "buildingId",
    "workState",
    "workEndTime",
    "constructionEndTime",
    "isConstructing",
    "lastAttackTime",
    "lastMoveTime",
    "hp",
    "maxHp",
    "shieldHp",
    "shieldMaxHp",
    "protectionEndTime",
    "isDestroying",
    "pendingDamage",
    "destructionEndTime",
    "initiatorId",
    "timestamp"
  ],
  "summary": {
    "narrowClaimSupported": true,
    "broaderClaimSupported": false,
    "scenarioClassification": "CURRENT_ACCEPTED_BEHAVIOR",
    "broaderScenarioClassification": "UNCONFIRMED_RUNTIME_BEHAVIOR",
    "deterministicTwoRunResult": true,
    "sourceBoundaryExecuted": true
  }
}
```

## Semantic Comparison

| Field | Run 1 | Run 2 | Identical |
| --- | --- | --- | --- |
| `scenarioId` | `scenario-001` | `scenario-001` | Yes |
| `result` | `PASS` | `PASS` | Yes |
| `acceptedContract` | `Within the active sticky-interaction window, an older building snapshot does not replace the accepted current building position.` | same | Yes |
| `decision` | `accept_server_update` | `accept_server_update` | Yes |
| `shouldStickPosition` | `true` | `true` | Yes |
| `shouldStickHealthState` | `false` | `false` | Yes |
| `x` | `13` | `13` | Yes |
| `y` | `9` | `9` | Yes |
| `zoneId` | `zone-1` | `zone-1` | Yes |
| `failure reason` | none | none | Yes |

## Negative Controls

### Wrong Expected Result

```bash
SCENARIO_001_CHARACTERIZATION_CONTROL=wrong-expected node tests/characterization/scenario-001-characterization.mjs
```

- exit code: `1`
- `result`: `FAIL`
- `decision`: `accept_server_update`
- `acceptedContractProtected`: `false`
- `olderSnapshotDidNotReplaceAcceptedPosition`: `true`
- `expectedDecisionReturned`: `false`

### Missing Fields

```bash
SCENARIO_001_CHARACTERIZATION_CONTROL=missing-fields node tests/characterization/scenario-001-characterization.mjs
```

- exit code: `1`
- `result`: `BLOCKED`
- `reason`: `missing-required-fields`
- missing field: `recentMoveAt`

## Repeatability Verdict

- outputs are `IDENTICAL`: `true`
- no files changed between Run 1 and Run 2
- no network access occurred
- no PocketBase access occurred
- no live player data was mutated
- no hidden timestamp, random value, or prior-run state appeared in the output

## Residual Limitation

This verifies only the narrow sticky-position contract for Scenario 1.
The broader claim remains `UNCONFIRMED_RUNTIME_BEHAVIOR`:

`Initial fetch cannot be overwritten by an older late snapshot.`

## Final Result

`PASS`

`T029` is complete.
`T030` remains open.
