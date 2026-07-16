// @ts-check

import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { readFile } from 'node:fs/promises';
import { resolveRejectedOptimisticPlacementRollback } from '../../../src/game/buildings/resolveRejectedOptimisticPlacementRollback.js';

const COMMAND = 'node tests/characterization/slice-c/scenario-08.mjs';
const FIXTURE_PATH = 'tests/characterization/slice-c/scenario-08-fixture.json';
const HELPER = 'src/game/buildings/resolveRejectedOptimisticPlacementRollback.js';
const SCENARIO_ID = 'scenario-08';
const ACCEPTED_RESULT_REASON = 'accepted-narrow-rejected-placement-contract-held';
const CONTROL_KEYS = [
  'baseline',
  'missing-rollback-identity',
  'missing-optimistic-building',
  'missing-current-buildings',
  'missing-resource-deltas',
  'invalid-optimistic-placement-state',
  'rollback-identity-mismatch',
  'already-restored',
  'second-pass-rolls-back-again',
  'restored-state-regresses',
  'unrelated-building-changed',
  'unrelated-resource-field-changed',
  'production-boundary-not-available',
  'live-pocketbase-required',
  'timeout-order-required',
  'reconnect-order-required',
];

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);

  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }

  return value;
}

function normalizeForComparison(value) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
}

function sameValue(left, right) {
  return isDeepStrictEqual(normalizeForComparison(left), normalizeForComparison(right));
}

function zeroResourceRestoration() {
  return {
    goldDelta: 0,
    rubiesDelta: 0,
    inventoryDeltas: {},
  };
}

function extractProtectedBuildingFields(building) {
  return {
    id: building?.id ?? null,
    buildingId: building?.buildingId ?? null,
    ownerId: building?.ownerId ?? null,
    ownerName: building?.ownerName ?? null,
    x: building?.x ?? null,
    y: building?.y ?? null,
    zoneId: building?.zoneId ?? null,
    status: building?.status ?? null,
    syncState: building?.syncState ?? null,
    isConstructing: building?.isConstructing ?? null,
    constructionEndTime: building?.constructionEndTime ?? null,
    workState: building?.workState ?? null,
    hp: building?.hp ?? null,
    maxHp: building?.maxHp ?? null,
    pendingDamage: building?.pendingDamage ?? null,
    isLocal: building?.isLocal ?? null,
    timestamp: building?.timestamp ?? null,
  };
}

function extractProtectedFields(result) {
  return {
    building: extractProtectedBuildingFields(result?.projectedBuildings?.[0]),
    projectedResourceRestoration: clone(result?.projectedResourceRestoration),
    removeTemporaryBuilding: result?.removeTemporaryBuilding ?? null,
    decision: result?.decision ?? null,
    restored: result?.restored ?? null,
  };
}

function extractUnrelatedFields(result) {
  return {
    buildingTag: result?.projectedBuildings?.[0]?.tag ?? null,
    resourceStateCosmeticFlag: result?.restoredResourceState?.cosmeticFlag ?? null,
  };
}

function applyProjectedResourceRestoration(resourceState, restoration) {
  const nextInventory = { ...(resourceState?.inventory || {}) };

  Object.entries(restoration?.inventoryDeltas || {}).forEach(([resourceId, delta]) => {
    nextInventory[Number(resourceId)] = (nextInventory[Number(resourceId)] || 0) + delta;
  });

  return {
    ...resourceState,
    gold: (resourceState?.gold || 0) + (restoration?.goldDelta || 0),
    rubies: (resourceState?.rubies || 0) + (restoration?.rubiesDelta || 0),
    inventory: nextInventory,
  };
}

function parseControl(argv, env, controlKeys) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_08_CHARACTERIZATION_CONTROL || 'baseline').trim();

  if (!controlKeys.includes(raw)) {
    throw new Error(`Unsupported Scenario 8 characterization control "${raw}"`);
  }

  return raw;
}

async function loadFixture() {
  return JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
}

function buildExpectedState(fixture) {
  const preCommandResourceState = clone(fixture.preCommandState.resourceState);
  const restoredResourceState = applyProjectedResourceRestoration(
    preCommandResourceState,
    fixture.restoredState.projectedResourceRestoration,
  );

  return {
    firstPass: {
      decision: fixture.firstPass.expectedDecision,
      restored: fixture.firstPass.expectedRestored,
      blocked: fixture.firstPass.expectedBlocked,
      blockedReason: undefined,
      removeTemporaryBuilding: fixture.firstPass.expectedRemoveTemporaryBuilding,
      projectedBuildings: clone(fixture.restoredState.currentBuildings),
      projectedResourceRestoration: clone(fixture.restoredState.projectedResourceRestoration),
      restoredResourceState: clone(restoredResourceState),
      protectedFields: {
        building: extractProtectedBuildingFields(fixture.restoredState.currentBuildings?.[0]),
        projectedResourceRestoration: clone(fixture.restoredState.projectedResourceRestoration),
        removeTemporaryBuilding: true,
        decision: 'rollback_rejected_placement',
        restored: true,
      },
      unrelatedFields: {
        buildingTag: fixture.preCommandState.currentBuildings?.[0]?.tag ?? null,
        resourceStateCosmeticFlag: preCommandResourceState?.cosmeticFlag ?? null,
      },
    },
    secondPass: {
      decision: fixture.secondPass.expectedDecision,
      restored: fixture.secondPass.expectedRestored,
      blocked: fixture.secondPass.expectedBlocked,
      blockedReason: undefined,
      removeTemporaryBuilding: fixture.secondPass.expectedRemoveTemporaryBuilding,
      projectedBuildings: clone(fixture.restoredState.currentBuildings),
      projectedResourceRestoration: zeroResourceRestoration(),
      restoredResourceState: clone(preCommandResourceState),
      protectedFields: {
        building: extractProtectedBuildingFields(fixture.restoredState.currentBuildings?.[0]),
        projectedResourceRestoration: zeroResourceRestoration(),
        removeTemporaryBuilding: false,
        decision: 'no_rollback',
        restored: false,
      },
      unrelatedFields: {
        buildingTag: fixture.preCommandState.currentBuildings?.[0]?.tag ?? null,
        resourceStateCosmeticFlag: preCommandResourceState?.cosmeticFlag ?? null,
      },
    },
  };
}

function configureScenario(fixture, control) {
  const scenario = clone(fixture);
  scenario.control = control;
  scenario.acceptedContract = fixture.proposedContract;
  scenario.expectedOutcome = clone({
    result: control === 'baseline' ? 'PASS' : fixture.controls.find((item) => item.id === control)?.expectedStatus,
    reason: control === 'baseline' ? ACCEPTED_RESULT_REASON : fixture.controls.find((item) => item.id === control)?.expectedReason,
    productionSourceExecution:
      control === 'baseline'
        ? true
        : fixture.controls.find((item) => item.id === control)?.productionSourceExecution ?? true,
    sourceBoundaryExecuted:
      control === 'baseline'
        ? true
        : fixture.controls.find((item) => item.id === control)?.sourceBoundaryExecuted ?? true,
  });
  scenario.productionBoundary = {
    available: fixture.productionBoundaryStatus === 'production_boundary_available',
    reason: fixture.productionBoundaryStatus,
  };
  scenario.requirements = {
    requiresLivePocketBase: false,
    requiresTimeoutOrdering: false,
    requiresReconnectOrdering: false,
  };
  scenario.firstPassInputMode = 'optimistic';
  scenario.secondPassInputMode = 'projected';
  scenario.firstPassAlreadyRestored = false;
  scenario.secondPassAlreadyRestored = true;
  scenario.expected = buildExpectedState(fixture);

  switch (control) {
    case 'missing-rollback-identity':
      scenario.rollbackIdentity = undefined;
      scenario.expected.firstPass.decision = 'blocked_missing_rollback_identity';
      scenario.expected.firstPass.restored = false;
      scenario.expected.firstPass.blocked = true;
      scenario.expected.firstPass.blockedReason = 'missing-rollback-identity';
      scenario.expected.firstPass.removeTemporaryBuilding = false;
      scenario.expected.firstPass.projectedBuildings = clone(fixture.optimisticPlacement.currentBuildings);
      scenario.expected.firstPass.projectedResourceRestoration = zeroResourceRestoration();
      scenario.expected.firstPass.restoredResourceState = clone(fixture.preCommandState.resourceState);
      scenario.expected.firstPass.protectedFields = {
        building: extractProtectedBuildingFields(fixture.optimisticPlacement.currentBuildings?.[0]),
        projectedResourceRestoration: zeroResourceRestoration(),
        removeTemporaryBuilding: false,
        decision: 'blocked_missing_rollback_identity',
        restored: false,
      };
      scenario.expected.firstPass.unrelatedFields = {
        buildingTag: fixture.optimisticPlacement.currentBuildings?.[0]?.tag ?? null,
        resourceStateCosmeticFlag: fixture.preCommandState.resourceState?.cosmeticFlag ?? null,
      };
      scenario.expected.secondPass = clone(scenario.expected.firstPass);
      break;
    case 'missing-optimistic-building':
      scenario.optimisticPlacement.optimisticBuilding = undefined;
      scenario.expected.firstPass.decision = 'blocked_missing_optimistic_building';
      scenario.expected.firstPass.restored = false;
      scenario.expected.firstPass.blocked = true;
      scenario.expected.firstPass.blockedReason = 'missing-optimistic-building';
      scenario.expected.firstPass.removeTemporaryBuilding = false;
      scenario.expected.firstPass.projectedBuildings = clone(fixture.optimisticPlacement.currentBuildings);
      scenario.expected.firstPass.projectedResourceRestoration = zeroResourceRestoration();
      scenario.expected.firstPass.restoredResourceState = clone(fixture.preCommandState.resourceState);
      scenario.expected.firstPass.protectedFields = {
        building: extractProtectedBuildingFields(fixture.optimisticPlacement.currentBuildings?.[0]),
        projectedResourceRestoration: zeroResourceRestoration(),
        removeTemporaryBuilding: false,
        decision: 'blocked_missing_optimistic_building',
        restored: false,
      };
      scenario.expected.firstPass.unrelatedFields = {
        buildingTag: fixture.optimisticPlacement.currentBuildings?.[0]?.tag ?? null,
        resourceStateCosmeticFlag: fixture.preCommandState.resourceState?.cosmeticFlag ?? null,
      };
      scenario.expected.secondPass = clone(scenario.expected.firstPass);
      break;
    case 'missing-current-buildings':
      scenario.optimisticPlacement.currentBuildings = undefined;
      scenario.expected.firstPass.decision = 'blocked_missing_current_buildings';
      scenario.expected.firstPass.restored = false;
      scenario.expected.firstPass.blocked = true;
      scenario.expected.firstPass.blockedReason = 'missing-current-buildings';
      scenario.expected.firstPass.removeTemporaryBuilding = false;
      scenario.expected.firstPass.projectedBuildings = undefined;
      scenario.expected.firstPass.projectedResourceRestoration = zeroResourceRestoration();
      scenario.expected.firstPass.restoredResourceState = clone(fixture.preCommandState.resourceState);
      scenario.expected.firstPass.protectedFields = {
        building: extractProtectedBuildingFields(undefined),
        projectedResourceRestoration: zeroResourceRestoration(),
        removeTemporaryBuilding: false,
        decision: 'blocked_missing_current_buildings',
        restored: false,
      };
      scenario.expected.firstPass.unrelatedFields = {
        buildingTag: null,
        resourceStateCosmeticFlag: fixture.preCommandState.resourceState?.cosmeticFlag ?? null,
      };
      scenario.expected.secondPass = clone(scenario.expected.firstPass);
      break;
    case 'missing-resource-deltas':
      scenario.spentResourceDeltas = undefined;
      scenario.expected.firstPass.decision = 'blocked_missing_resource_deltas';
      scenario.expected.firstPass.restored = false;
      scenario.expected.firstPass.blocked = true;
      scenario.expected.firstPass.blockedReason = 'missing-resource-deltas';
      scenario.expected.firstPass.removeTemporaryBuilding = false;
      scenario.expected.firstPass.projectedBuildings = clone(fixture.optimisticPlacement.currentBuildings);
      scenario.expected.firstPass.projectedResourceRestoration = zeroResourceRestoration();
      scenario.expected.firstPass.restoredResourceState = clone(fixture.preCommandState.resourceState);
      scenario.expected.firstPass.protectedFields = {
        building: extractProtectedBuildingFields(fixture.optimisticPlacement.currentBuildings?.[0]),
        projectedResourceRestoration: zeroResourceRestoration(),
        removeTemporaryBuilding: false,
        decision: 'blocked_missing_resource_deltas',
        restored: false,
      };
      scenario.expected.firstPass.unrelatedFields = {
        buildingTag: fixture.optimisticPlacement.currentBuildings?.[0]?.tag ?? null,
        resourceStateCosmeticFlag: fixture.preCommandState.resourceState?.cosmeticFlag ?? null,
      };
      scenario.expected.secondPass = clone(scenario.expected.firstPass);
      break;
    case 'invalid-optimistic-placement-state':
      scenario.optimisticPlacement.optimisticBuilding = {
        ...scenario.optimisticPlacement.optimisticBuilding,
        id: undefined,
      };
      scenario.expected.firstPass.decision = 'blocked_invalid_placement_state';
      scenario.expected.firstPass.restored = false;
      scenario.expected.firstPass.blocked = true;
      scenario.expected.firstPass.blockedReason = 'invalid-optimistic-placement-state';
      scenario.expected.firstPass.removeTemporaryBuilding = false;
      scenario.expected.firstPass.projectedBuildings = clone(fixture.optimisticPlacement.currentBuildings);
      scenario.expected.firstPass.projectedResourceRestoration = zeroResourceRestoration();
      scenario.expected.firstPass.restoredResourceState = clone(fixture.preCommandState.resourceState);
      scenario.expected.firstPass.protectedFields = {
        building: extractProtectedBuildingFields(fixture.optimisticPlacement.currentBuildings?.[0]),
        projectedResourceRestoration: zeroResourceRestoration(),
        removeTemporaryBuilding: false,
        decision: 'blocked_invalid_placement_state',
        restored: false,
      };
      scenario.expected.firstPass.unrelatedFields = {
        buildingTag: fixture.optimisticPlacement.currentBuildings?.[0]?.tag ?? null,
        resourceStateCosmeticFlag: fixture.preCommandState.resourceState?.cosmeticFlag ?? null,
      };
      scenario.expected.secondPass = clone(scenario.expected.firstPass);
      break;
    case 'rollback-identity-mismatch':
      scenario.rollbackIdentity = {
        ...scenario.rollbackIdentity,
        tempId: 'temp-placement-mismatch',
      };
      scenario.expected.firstPass.decision = 'blocked_identity_mismatch';
      scenario.expected.firstPass.restored = false;
      scenario.expected.firstPass.blocked = true;
      scenario.expected.firstPass.blockedReason = 'rollback-identity-mismatch';
      scenario.expected.firstPass.removeTemporaryBuilding = false;
      scenario.expected.firstPass.projectedBuildings = clone(fixture.optimisticPlacement.currentBuildings);
      scenario.expected.firstPass.projectedResourceRestoration = zeroResourceRestoration();
      scenario.expected.firstPass.restoredResourceState = clone(fixture.preCommandState.resourceState);
      scenario.expected.firstPass.protectedFields = {
        building: extractProtectedBuildingFields(fixture.optimisticPlacement.currentBuildings?.[0]),
        projectedResourceRestoration: zeroResourceRestoration(),
        removeTemporaryBuilding: false,
        decision: 'blocked_identity_mismatch',
        restored: false,
      };
      scenario.expected.firstPass.unrelatedFields = {
        buildingTag: fixture.optimisticPlacement.currentBuildings?.[0]?.tag ?? null,
        resourceStateCosmeticFlag: fixture.preCommandState.resourceState?.cosmeticFlag ?? null,
      };
      scenario.expected.secondPass = clone(scenario.expected.firstPass);
      break;
    case 'already-restored':
      scenario.firstPassInputMode = 'restored';
      scenario.firstPassAlreadyRestored = true;
      scenario.secondPassAlreadyRestored = true;
      scenario.expected.firstPass = {
        decision: 'no_rollback',
        restored: false,
        blocked: false,
        blockedReason: undefined,
        removeTemporaryBuilding: false,
        projectedBuildings: clone(fixture.restoredState.currentBuildings),
        projectedResourceRestoration: zeroResourceRestoration(),
        restoredResourceState: clone(fixture.preCommandState.resourceState),
        protectedFields: {
          building: extractProtectedBuildingFields(fixture.restoredState.currentBuildings?.[0]),
          projectedResourceRestoration: zeroResourceRestoration(),
          removeTemporaryBuilding: false,
          decision: 'no_rollback',
          restored: false,
        },
        unrelatedFields: {
          buildingTag: fixture.preCommandState.currentBuildings?.[0]?.tag ?? null,
          resourceStateCosmeticFlag: fixture.preCommandState.resourceState?.cosmeticFlag ?? null,
        },
      };
      scenario.expected.secondPass = clone(scenario.expected.firstPass);
      break;
    case 'second-pass-rolls-back-again':
      scenario.secondPassInputMode = 'repeat-initial';
      scenario.secondPassAlreadyRestored = false;
      break;
    case 'restored-state-regresses':
      scenario.expected.firstPass.protectedFields.building.hp = 999;
      scenario.expected.firstPass.protectedFields.building.maxHp = 999;
      scenario.expected.firstPass.protectedFields.building.pendingDamage = 7;
      scenario.expected.secondPass.protectedFields.building.hp = 999;
      scenario.expected.secondPass.protectedFields.building.maxHp = 999;
      scenario.expected.secondPass.protectedFields.building.pendingDamage = 7;
      break;
    case 'unrelated-building-changed':
      scenario.expected.firstPass.unrelatedFields.buildingTag = 'changed';
      scenario.expected.secondPass.unrelatedFields.buildingTag = 'changed';
      break;
    case 'unrelated-resource-field-changed':
      scenario.expected.firstPass.unrelatedFields.resourceStateCosmeticFlag = 'changed';
      scenario.expected.secondPass.unrelatedFields.resourceStateCosmeticFlag = 'changed';
      break;
    case 'production-boundary-not-available':
      scenario.productionBoundary.available = false;
      break;
    case 'live-pocketbase-required':
      scenario.requirements.requiresLivePocketBase = true;
      break;
    case 'timeout-order-required':
      scenario.requirements.requiresTimeoutOrdering = true;
      break;
    case 'reconnect-order-required':
      scenario.requirements.requiresReconnectOrdering = true;
      break;
    default:
      break;
  }

  return deepFreeze(scenario);
}

function validateScenario(scenario) {
  if (scenario.productionBoundary?.available === false) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'production-boundary-not-available',
    };
  }

  if (scenario.requirements?.requiresLivePocketBase) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'live-pocketbase-required',
    };
  }

  if (scenario.requirements?.requiresTimeoutOrdering) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'timeout-order-required',
    };
  }

  if (scenario.requirements?.requiresReconnectOrdering) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'reconnect-order-required',
    };
  }

  return {
    ok: true,
    status: 'PASS',
    reason: null,
  };
}

function runRollbackPass(input) {
  return resolveRejectedOptimisticPlacementRollback({
    currentBuildings: input.currentBuildings,
    optimisticBuilding: input.optimisticBuilding,
    spentResourceDeltas: input.spentResourceDeltas,
    rollbackIdentity: input.rollbackIdentity,
    alreadyRestored: input.alreadyRestored,
  });
}

function evaluateScenarioExecution(scenario) {
  const firstPassInput = {
    currentBuildings:
      scenario.firstPassInputMode === 'restored'
        ? clone(scenario.restoredState.currentBuildings)
        : clone(scenario.optimisticPlacement.currentBuildings),
    optimisticBuilding: clone(scenario.optimisticPlacement.optimisticBuilding),
    spentResourceDeltas: clone(scenario.spentResourceDeltas),
    rollbackIdentity: clone(scenario.rollbackIdentity),
    alreadyRestored: scenario.firstPassAlreadyRestored,
  };
  const firstPassInputSnapshot = clone(firstPassInput);
  const firstPass = runRollbackPass(firstPassInput);
  const firstPassResourceInputSnapshot = clone(scenario.preCommandState.resourceState);
  const firstPassRestoredResourceState = applyProjectedResourceRestoration(
    scenario.preCommandState.resourceState,
    firstPass.projectedResourceRestoration,
  );

  const secondPassInput = {
    currentBuildings:
      scenario.secondPassInputMode === 'repeat-initial'
        ? clone(firstPassInputSnapshot.currentBuildings)
        : clone(firstPass.projectedBuildings),
    optimisticBuilding: clone(scenario.optimisticPlacement.optimisticBuilding),
    spentResourceDeltas: clone(scenario.spentResourceDeltas),
    rollbackIdentity: clone(scenario.rollbackIdentity),
    alreadyRestored: scenario.secondPassAlreadyRestored,
  };
  const secondPassInputSnapshot = clone(secondPassInput);
  const secondPass = runRollbackPass(secondPassInput);
  const secondPassResourceInputSnapshot = clone(scenario.preCommandState.resourceState);
  const secondPassRestoredResourceState = applyProjectedResourceRestoration(
    scenario.preCommandState.resourceState,
    secondPass.projectedResourceRestoration,
  );

  const firstPassInputPreserved = sameValue(firstPassInput, firstPassInputSnapshot);
  const secondPassInputPreserved = sameValue(secondPassInput, secondPassInputSnapshot);
  const firstPassProtectedFields = extractProtectedFields(firstPass);
  const secondPassProtectedFields = extractProtectedFields(secondPass);
  const firstPassUnrelatedFields = extractUnrelatedFields({
    projectedBuildings: firstPass.projectedBuildings,
    restoredResourceState: firstPassRestoredResourceState,
  });
  const secondPassUnrelatedFields = extractUnrelatedFields({
    projectedBuildings: secondPass.projectedBuildings,
    restoredResourceState: secondPassRestoredResourceState,
  });

  const firstPassMatches =
    firstPass.decision === scenario.expected.firstPass.decision &&
    firstPass.restored === scenario.expected.firstPass.restored &&
    firstPass.blocked === scenario.expected.firstPass.blocked &&
    firstPass.blockedReason === scenario.expected.firstPass.blockedReason &&
    firstPass.removeTemporaryBuilding === scenario.expected.firstPass.removeTemporaryBuilding &&
    sameValue(firstPass.projectedBuildings, scenario.expected.firstPass.projectedBuildings) &&
    sameValue(firstPass.projectedResourceRestoration, scenario.expected.firstPass.projectedResourceRestoration) &&
    sameValue(firstPassRestoredResourceState, scenario.expected.firstPass.restoredResourceState) &&
    sameValue(firstPassProtectedFields, scenario.expected.firstPass.protectedFields) &&
    sameValue(firstPassUnrelatedFields, scenario.expected.firstPass.unrelatedFields) &&
    firstPassInputPreserved &&
    sameValue(firstPassResourceInputSnapshot, scenario.preCommandState.resourceState);

  const secondPassMatches =
    secondPass.decision === scenario.expected.secondPass.decision &&
    secondPass.restored === scenario.expected.secondPass.restored &&
    secondPass.blocked === scenario.expected.secondPass.blocked &&
    secondPass.blockedReason === scenario.expected.secondPass.blockedReason &&
    secondPass.removeTemporaryBuilding === scenario.expected.secondPass.removeTemporaryBuilding &&
    sameValue(secondPass.projectedBuildings, scenario.expected.secondPass.projectedBuildings) &&
    sameValue(secondPass.projectedResourceRestoration, scenario.expected.secondPass.projectedResourceRestoration) &&
    sameValue(secondPassRestoredResourceState, scenario.expected.secondPass.restoredResourceState) &&
    sameValue(secondPassProtectedFields, scenario.expected.secondPass.protectedFields) &&
    sameValue(secondPassUnrelatedFields, scenario.expected.secondPass.unrelatedFields) &&
    secondPassInputPreserved &&
    sameValue(secondPassResourceInputSnapshot, scenario.preCommandState.resourceState);

  const matches = firstPassMatches && secondPassMatches;
  const status = matches ? scenario.expectedOutcome.result : 'FAIL';
  const reason = matches ? scenario.expectedOutcome.reason : 'unexpected-helper-result';
  const productionSourceExecution = scenario.expectedOutcome.productionSourceExecution;
  const sourceBoundaryExecuted = scenario.expectedOutcome.sourceBoundaryExecuted;

  return {
    scenarioId: scenario.scenarioId,
    acceptedContract: scenario.acceptedContract,
    control: scenario.control,
    status,
    reason,
    productionSourceExecution,
    sourceBoundaryExecuted,
    firstPass: {
      input: scenario.firstPassInputMode,
      alreadyRestored: scenario.firstPassAlreadyRestored,
      decision: firstPass.decision,
      restored: firstPass.restored,
      blocked: firstPass.blocked,
      blockedReason: firstPass.blockedReason,
      removeTemporaryBuilding: firstPass.removeTemporaryBuilding,
      projectedBuildings: firstPass.projectedBuildings,
      projectedResourceRestoration: firstPass.projectedResourceRestoration,
      restoredResourceState: firstPassRestoredResourceState,
      protectedFields: firstPassProtectedFields,
      unrelatedFields: firstPassUnrelatedFields,
      inputPreserved: firstPassInputPreserved,
      resourceInputPreserved: sameValue(firstPassResourceInputSnapshot, scenario.preCommandState.resourceState),
    },
    secondPass: {
      input: scenario.secondPassInputMode,
      alreadyRestored: scenario.secondPassAlreadyRestored,
      decision: secondPass.decision,
      restored: secondPass.restored,
      blocked: secondPass.blocked,
      blockedReason: secondPass.blockedReason,
      removeTemporaryBuilding: secondPass.removeTemporaryBuilding,
      projectedBuildings: secondPass.projectedBuildings,
      projectedResourceRestoration: secondPass.projectedResourceRestoration,
      restoredResourceState: secondPassRestoredResourceState,
      protectedFields: secondPassProtectedFields,
      unrelatedFields: secondPassUnrelatedFields,
      inputPreserved: secondPassInputPreserved,
      resourceInputPreserved: sameValue(secondPassResourceInputSnapshot, scenario.preCommandState.resourceState),
    },
    matches,
  };
}

function compareScenarioExecutions(execution1, execution2) {
  return {
    identical: sameValue(execution1, execution2),
    sameScenarioId: execution1.scenarioId === execution2.scenarioId,
    sameAcceptedContract: execution1.acceptedContract === execution2.acceptedContract,
    sameControl: execution1.control === execution2.control,
    sameStatus: execution1.status === execution2.status,
    sameReason: execution1.reason === execution2.reason,
    sameProductionSourceExecution:
      execution1.productionSourceExecution === execution2.productionSourceExecution,
    sameSourceBoundaryExecuted: execution1.sourceBoundaryExecuted === execution2.sourceBoundaryExecuted,
    sameFirstPassDecision: execution1.firstPass.decision === execution2.firstPass.decision,
    sameFirstPassRestored: execution1.firstPass.restored === execution2.firstPass.restored,
    sameFirstPassBlocked: execution1.firstPass.blocked === execution2.firstPass.blocked,
    sameFirstPassBlockedReason: execution1.firstPass.blockedReason === execution2.firstPass.blockedReason,
    sameFirstPassProtectedFields: sameValue(
      execution1.firstPass.protectedFields,
      execution2.firstPass.protectedFields,
    ),
    sameFirstPassUnrelatedFields: sameValue(
      execution1.firstPass.unrelatedFields,
      execution2.firstPass.unrelatedFields,
    ),
    sameSecondPassDecision: execution1.secondPass.decision === execution2.secondPass.decision,
    sameSecondPassRestored: execution1.secondPass.restored === execution2.secondPass.restored,
    sameSecondPassBlocked: execution1.secondPass.blocked === execution2.secondPass.blocked,
    sameSecondPassBlockedReason: execution1.secondPass.blockedReason === execution2.secondPass.blockedReason,
    sameSecondPassProtectedFields: sameValue(
      execution1.secondPass.protectedFields,
      execution2.secondPass.protectedFields,
    ),
    sameSecondPassUnrelatedFields: sameValue(
      execution1.secondPass.unrelatedFields,
      execution2.secondPass.unrelatedFields,
    ),
    sameMatches: execution1.matches === execution2.matches,
  };
}

function buildExitGateReport(report, control, controlExpectations) {
  if (control === 'baseline') {
    return {
      mode: 'baseline',
      expectedResult: 'PASS',
      expectedReason: ACCEPTED_RESULT_REASON,
      expectedProductionSourceExecution: true,
      expectedSourceBoundaryExecuted: true,
      actualResult: report.result,
      actualReason: report.reason,
      actualProductionSourceExecution: report.productionSourceExecution,
      actualSourceBoundaryExecuted: report.sourceBoundaryExecuted,
      matched: report.result === 'PASS',
      failureReason: report.result === 'PASS' ? null : 'baseline-did-not-pass',
    };
  }

  const expected = controlExpectations[control];
  const mismatches = [];

  if (!expected) {
    mismatches.push(`unknown-control:${control}`);
  } else {
    try {
      assert.strictEqual(report.result, expected.result);
      assert.strictEqual(report.reason, expected.reason);
      assert.strictEqual(report.productionSourceExecution, expected.productionSourceExecution);
      assert.strictEqual(report.sourceBoundaryExecuted, expected.sourceBoundaryExecuted);
    } catch (error) {
      mismatches.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    mode: 'control',
    control,
    expectedResult: expected?.result ?? null,
    expectedReason: expected?.reason ?? null,
    expectedProductionSourceExecution: expected?.productionSourceExecution ?? null,
    expectedSourceBoundaryExecuted: expected?.sourceBoundaryExecuted ?? null,
    actualResult: report.result,
    actualReason: report.reason,
    actualProductionSourceExecution: report.productionSourceExecution,
    actualSourceBoundaryExecuted: report.sourceBoundaryExecuted,
    matched: mismatches.length === 0,
    mismatches,
    failureReason: mismatches.length === 0 ? null : 'control-exit-contract-mismatch',
  };
}

async function buildBaselineReport(fixture) {
  const scenario = configureScenario(fixture, 'baseline');
  const scenarioExecution1 = evaluateScenarioExecution(scenario);
  const scenarioExecution2 = evaluateScenarioExecution(scenario);
  const comparison = compareScenarioExecutions(scenarioExecution1, scenarioExecution2);
  const pass = scenarioExecution1.status === 'PASS' && scenarioExecution2.status === 'PASS' && comparison.identical;

  const report = {
    command: COMMAND,
    taskId: 'T092',
    scenarioId: fixture.scenarioId,
    acceptedContract: fixture.proposedContract,
    acceptedContractMetadata: fixture.proposedContract,
    selectedSubcase: fixture.selectedSubcase,
    broaderScenarioClassification: fixture.scenarioClassification,
    helper: HELPER,
    fixturePath: FIXTURE_PATH,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    scenarioExecution1,
    scenarioExecution2,
    comparison,
    protectedFields: scenarioExecution1.firstPass.protectedFields,
    unrelatedFields: scenarioExecution1.firstPass.unrelatedFields,
    explicitExclusions: fixture.excludedContracts,
    result: pass ? 'PASS' : 'FAIL',
    status: pass ? 'PASS' : 'FAIL',
    reason: pass ? ACCEPTED_RESULT_REASON : 'unexpected-helper-result',
    replayOutcome: pass ? 'HELD' : 'FAILED',
    summary: {
      narrowClaimSupported: pass,
      broaderClaimSupported: false,
      broadScenarioStatus: fixture.scenarioClassification,
      repeatability: comparison.identical ? 'IDENTICAL' : 'DIFFERENT',
      sourceBoundaryExecuted: true,
    },
  };

  report.exitGate = buildExitGateReport(report, 'baseline', {});
  return report;
}

async function buildControlReport(control, fixture, controlExpectations) {
  const scenario = configureScenario(fixture, control);
  const validation = validateScenario(scenario);

  if (!validation.ok) {
    const report = {
      command: `${COMMAND} --control=${control}`,
      taskId: 'T092',
      scenarioId: scenario.scenarioId,
      acceptedContract: scenario.acceptedContract,
      acceptedContractMetadata: fixture.proposedContract,
      selectedSubcase: fixture.selectedSubcase,
      broaderScenarioClassification: fixture.scenarioClassification,
      helper: HELPER,
      fixturePath: FIXTURE_PATH,
      control,
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      result: validation.status,
      status: validation.status,
      reason: validation.reason,
      replayOutcome: 'BLOCKED',
      validation,
      summary: {
        narrowClaimSupported: false,
        broaderClaimSupported: false,
        broadScenarioStatus: fixture.scenarioClassification,
        repeatability: 'N/A',
        sourceBoundaryExecuted: false,
      },
    };

    report.exitGate = buildExitGateReport(report, control, controlExpectations);
    return report;
  }

  const scenarioExecution1 = evaluateScenarioExecution(scenario);
  const scenarioExecution2 = evaluateScenarioExecution(scenario);
  const comparison = compareScenarioExecutions(scenarioExecution1, scenarioExecution2);
  const matched =
    scenarioExecution1.status === scenarioExecution2.status &&
    scenarioExecution1.reason === scenarioExecution2.reason &&
    comparison.identical;

  const status = matched ? scenarioExecution1.status : 'FAIL';
  const reason = matched ? scenarioExecution1.reason : 'unexpected-helper-result';
  const productionSourceExecution = scenarioExecution1.productionSourceExecution;
  const sourceBoundaryExecuted = scenarioExecution1.sourceBoundaryExecuted;

  const report = {
    command: `${COMMAND} --control=${control}`,
    taskId: 'T092',
    scenarioId: scenario.scenarioId,
    acceptedContract: scenario.acceptedContract,
    acceptedContractMetadata: fixture.proposedContract,
    selectedSubcase: fixture.selectedSubcase,
    broaderScenarioClassification: fixture.scenarioClassification,
    helper: HELPER,
    fixturePath: FIXTURE_PATH,
    control,
    productionSourceExecution,
    sourceBoundaryExecuted,
    scenarioExecution1,
    scenarioExecution2,
    comparison,
    protectedFields: scenarioExecution1.firstPass.protectedFields,
    unrelatedFields: scenarioExecution1.firstPass.unrelatedFields,
    explicitExclusions: fixture.excludedContracts,
    result: status,
    status,
    reason,
    replayOutcome: status === 'PASS' ? 'HELD' : status === 'BLOCKED' ? 'BLOCKED' : 'FAILED',
    summary: {
      narrowClaimSupported: status === 'PASS',
      broaderClaimSupported: false,
      broadScenarioStatus: fixture.scenarioClassification,
      repeatability: comparison.identical ? 'IDENTICAL' : 'DIFFERENT',
      sourceBoundaryExecuted,
    },
  };

  report.exitGate = buildExitGateReport(report, control, controlExpectations);
  return report;
}

const fixture = deepFreeze(await loadFixture());
const CONTROL_EXPECTATIONS = Object.fromEntries(
  fixture.controls.map((control) => [
    control.id,
    {
      result: control.expectedStatus,
      reason: control.expectedReason,
      productionSourceExecution: control.productionSourceExecution,
      sourceBoundaryExecuted: control.sourceBoundaryExecuted,
    },
  ]),
);
CONTROL_EXPECTATIONS.baseline = {
  result: 'PASS',
  reason: ACCEPTED_RESULT_REASON,
  productionSourceExecution: true,
  sourceBoundaryExecuted: true,
};

const CONTROL = parseControl(process.argv.slice(2), process.env, CONTROL_KEYS);
const report =
  CONTROL === 'baseline'
    ? await buildBaselineReport(fixture)
    : await buildControlReport(CONTROL, fixture, CONTROL_EXPECTATIONS);

console.log(JSON.stringify(report, null, 2));

if (CONTROL === 'baseline') {
  if (report.result !== 'PASS') {
    process.exitCode = 1;
  }
} else if (!report.exitGate?.matched) {
  process.exitCode = 1;
  console.error(
    JSON.stringify(
      {
        type: 'control-exit-contract-mismatch',
        control: CONTROL,
        exitGate: report.exitGate,
      },
      null,
      2,
    ),
  );
}
