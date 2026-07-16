// @ts-check

import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { readFile } from 'node:fs/promises';
import { resolveLocalUpgradeTransformation } from '../../../src/game/buildings/resolveLocalUpgradeTransformation.js';

const COMMAND = 'node tests/characterization/slice-b/scenario-07.mjs';
const FIXTURE_PATH = 'tests/characterization/slice-b/scenario-07-fixture.json';
const HELPER = 'src/game/buildings/resolveLocalUpgradeTransformation.js';
const SCENARIO_ID = 'scenario-07';
const ACCEPTED_CONTRACT =
  'A source-backed source building with buildingId 301 is transformed once through the real upgrade-transformation seam into the projected target construction-shaped state with buildingId 306. Processing the same unchanged already-transformed target state again produces no second transformation.';
const BROAD_SCENARIO_CLASSIFICATION = 'UNCONFIRMED_RUNTIME_BEHAVIOR';
const ACCEPTED_RESULT_REASON = 'accepted-narrow-upgrade-transformation-contract-held';
const CONTROL_KEYS = [
  'baseline',
  'upgrade-not-eligible',
  'missing-building-identity',
  'missing-source-building',
  'missing-target-building',
  'already-transformed-target',
  'second-pass-transforms-again',
  'transformed-state-regresses',
  'unrelated-field-changed',
  'production-boundary-not-available',
  'live-pocketbase-required',
  'reconnect-order-required',
];

const CONTROL_EXPECTATIONS = {
  baseline: {
    result: 'PASS',
    reason: ACCEPTED_RESULT_REASON,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'upgrade-not-eligible': {
    result: 'BLOCKED',
    reason: 'invalid-upgrade-state',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'missing-building-identity': {
    result: 'BLOCKED',
    reason: 'missing-building-identity',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'missing-source-building': {
    result: 'BLOCKED',
    reason: 'missing-source-building-definition',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'missing-target-building': {
    result: 'BLOCKED',
    reason: 'missing-target-building-definition',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'already-transformed-target': {
    result: 'PASS',
    reason: ACCEPTED_RESULT_REASON,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'second-pass-transforms-again': {
    result: 'FAIL',
    reason: 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'transformed-state-regresses': {
    result: 'FAIL',
    reason: 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'unrelated-field-changed': {
    result: 'FAIL',
    reason: 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'production-boundary-not-available': {
    result: 'BLOCKED',
    reason: 'production-boundary-not-available',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
  },
  'live-pocketbase-required': {
    result: 'BLOCKED',
    reason: 'live-pocketbase-required',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
  },
  'reconnect-order-required': {
    result: 'BLOCKED',
    reason: 'reconnect-order-required',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
  },
};

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_07_CHARACTERIZATION_CONTROL || 'baseline').trim();

  if (!CONTROL_KEYS.includes(raw)) {
    throw new Error(`Unsupported Scenario 7 characterization control "${raw}"`);
  }

  return raw;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function pickProtectedFields(building) {
  return {
    buildingId: building?.buildingId ?? null,
    type: building?.type ?? null,
    isConstructing: building?.isConstructing ?? null,
    constructionEndTime: building?.constructionEndTime ?? null,
    lastAttackTime: building?.lastAttackTime ?? null,
    isDestroying: building?.isDestroying ?? null,
    destructionStatus: building?.destructionStatus ?? null,
    hp: building?.hp ?? null,
    maxHp: building?.maxHp ?? null,
    pendingDamage: building?.pendingDamage ?? null,
  };
}

function pickUnrelatedFields(building) {
  return {
    id: building?.id ?? null,
    ownerId: building?.ownerId ?? null,
    x: building?.x ?? null,
    y: building?.y ?? null,
    zoneId: building?.zoneId ?? null,
    isLocal: building?.isLocal ?? null,
    timestamp: building?.timestamp ?? null,
    customTag: building?.customTag ?? null,
    upgradeAudit: building?.upgradeAudit ?? null,
  };
}

async function loadFixture() {
  return JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
}

function configureScenario(fixture, control) {
  const scenario = clone(fixture);
  scenario.acceptedContract = ACCEPTED_CONTRACT;
  scenario.control = control;
  scenario.expectedOutcome = clone(CONTROL_EXPECTATIONS[control]);
  scenario.sourceBuildingInfo = clone(fixture.sourceBuilding);
  scenario.targetBuildingInfo = clone(fixture.targetBuilding);
  scenario.productionBoundary = {
    available: true,
    reason: 'production-boundary-available',
  };
  scenario.requirements = {
    requiresLivePocketBase: false,
    requiresReconnectOrdering: false,
  };
  scenario.firstPassInputMode = 'source';
  scenario.secondPassInputMode = 'consumed';
  scenario.expectedProjectedState = clone(fixture.transformedState.building);
  scenario.expectedProtectedFields = pickProtectedFields(fixture.transformedState.building);
  scenario.expectedUnrelatedFields = pickUnrelatedFields(fixture.initialUpgradeState.building);
  scenario.firstPassExpectation = {
    decision: 'transform_upgrade',
    transformed: true,
    blocked: false,
    blockedReason: undefined,
  };
  scenario.secondPassExpectation = {
    decision: 'no_transformation',
    transformed: false,
    blocked: false,
    blockedReason: undefined,
  };

  switch (control) {
    case 'upgrade-not-eligible':
      scenario.initialUpgradeState.building.isConstructing = true;
      scenario.expectedProjectedState = clone(scenario.initialUpgradeState.building);
      scenario.expectedProtectedFields = pickProtectedFields(scenario.expectedProjectedState);
      scenario.expectedUnrelatedFields = pickUnrelatedFields(scenario.expectedProjectedState);
      scenario.firstPassExpectation = {
        decision: 'blocked_invalid_upgrade_state',
        transformed: false,
        blocked: true,
        blockedReason: 'invalid-upgrade-state',
      };
      scenario.secondPassExpectation = {
        decision: 'blocked_invalid_upgrade_state',
        transformed: false,
        blocked: true,
        blockedReason: 'invalid-upgrade-state',
      };
      break;
    case 'missing-building-identity':
      delete scenario.initialUpgradeState.building.id;
      scenario.expectedProjectedState = clone(scenario.initialUpgradeState.building);
      scenario.expectedProtectedFields = pickProtectedFields(scenario.expectedProjectedState);
      scenario.expectedUnrelatedFields = pickUnrelatedFields(scenario.expectedProjectedState);
      scenario.firstPassExpectation = {
        decision: 'blocked_missing_identity',
        transformed: false,
        blocked: true,
        blockedReason: 'missing-building-identity',
      };
      scenario.secondPassExpectation = {
        decision: 'blocked_missing_identity',
        transformed: false,
        blocked: true,
        blockedReason: 'missing-building-identity',
      };
      break;
    case 'missing-source-building':
      scenario.sourceBuildingInfo = undefined;
      scenario.expectedProjectedState = clone(scenario.initialUpgradeState.building);
      scenario.expectedProtectedFields = pickProtectedFields(scenario.expectedProjectedState);
      scenario.expectedUnrelatedFields = pickUnrelatedFields(scenario.expectedProjectedState);
      scenario.firstPassExpectation = {
        decision: 'blocked_invalid_upgrade_state',
        transformed: false,
        blocked: true,
        blockedReason: 'missing-source-building-definition',
      };
      scenario.secondPassExpectation = {
        decision: 'blocked_invalid_upgrade_state',
        transformed: false,
        blocked: true,
        blockedReason: 'missing-source-building-definition',
      };
      break;
    case 'missing-target-building':
      scenario.targetBuildingInfo = undefined;
      scenario.expectedProjectedState = clone(scenario.initialUpgradeState.building);
      scenario.expectedProtectedFields = pickProtectedFields(scenario.expectedProjectedState);
      scenario.expectedUnrelatedFields = pickUnrelatedFields(scenario.expectedProjectedState);
      scenario.firstPassExpectation = {
        decision: 'blocked_missing_target',
        transformed: false,
        blocked: true,
        blockedReason: 'missing-target-building-definition',
      };
      scenario.secondPassExpectation = {
        decision: 'blocked_missing_target',
        transformed: false,
        blocked: true,
        blockedReason: 'missing-target-building-definition',
      };
      break;
    case 'already-transformed-target':
      scenario.firstPassInputMode = 'target';
      scenario.expectedProjectedState = clone(fixture.transformedState.building);
      scenario.expectedProtectedFields = pickProtectedFields(scenario.expectedProjectedState);
      scenario.expectedUnrelatedFields = pickUnrelatedFields(scenario.expectedProjectedState);
      scenario.firstPassExpectation = {
        decision: 'no_transformation',
        transformed: false,
        blocked: false,
        blockedReason: undefined,
      };
      scenario.secondPassExpectation = {
        decision: 'no_transformation',
        transformed: false,
        blocked: false,
        blockedReason: undefined,
      };
      break;
    case 'second-pass-transforms-again':
      scenario.secondPassInputMode = 'repeat-initial';
      break;
    case 'transformed-state-regresses':
      scenario.expectedProjectedState.hp = 999;
      scenario.expectedProjectedState.maxHp = 999;
      scenario.expectedProjectedState.pendingDamage = 7;
      scenario.expectedProtectedFields = pickProtectedFields(scenario.expectedProjectedState);
      break;
    case 'unrelated-field-changed':
      scenario.expectedUnrelatedFields.x += 1;
      break;
    case 'production-boundary-not-available':
      scenario.productionBoundary.available = false;
      break;
    case 'live-pocketbase-required':
      scenario.requirements.requiresLivePocketBase = true;
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

function runUpgradePass(building, sourceBuildingInfo, targetBuildingInfo, now) {
  return resolveLocalUpgradeTransformation({
    building: clone(building),
    sourceBuildingInfo,
    targetBuildingInfo,
    now,
  });
}

function evaluateScenarioExecution(scenario) {
  const firstPassInput =
    scenario.firstPassInputMode === 'target'
      ? clone(scenario.expectedProjectedState)
      : clone(scenario.initialUpgradeState.building);
  const firstPassInputSnapshot = clone(firstPassInput);
  const firstPass = runUpgradePass(
    firstPassInput,
    scenario.sourceBuildingInfo,
    scenario.targetBuildingInfo,
    scenario.frozenClock.now,
  );

  const secondPassInput =
    scenario.secondPassInputMode === 'repeat-initial'
      ? clone(firstPassInputSnapshot)
      : clone(firstPass.projectedBuilding);
  const secondPassInputSnapshot = clone(secondPassInput);
  const secondPass = runUpgradePass(
    secondPassInput,
    scenario.sourceBuildingInfo,
    scenario.targetBuildingInfo,
    scenario.frozenClock.now,
  );

  const firstPassDecisionMatches = firstPass.decision === scenario.firstPassExpectation.decision;
  const firstPassTransformedMatches = firstPass.transformed === scenario.firstPassExpectation.transformed;
  const firstPassBlockedMatches = firstPass.blocked === scenario.firstPassExpectation.blocked;
  const firstPassBlockedReasonMatches = firstPass.blockedReason === scenario.firstPassExpectation.blockedReason;
  const firstPassProjectedMatches = sameValue(firstPass.projectedBuilding, scenario.expectedProjectedState);
  const firstPassInputPreserved = sameValue(firstPassInput, firstPassInputSnapshot);

  const secondPassDecisionMatches = secondPass.decision === scenario.secondPassExpectation.decision;
  const secondPassTransformedMatches = secondPass.transformed === scenario.secondPassExpectation.transformed;
  const secondPassBlockedMatches = secondPass.blocked === scenario.secondPassExpectation.blocked;
  const secondPassBlockedReasonMatches = secondPass.blockedReason === scenario.secondPassExpectation.blockedReason;
  const secondPassProjectedMatches = sameValue(secondPass.projectedBuilding, scenario.expectedProjectedState);
  const secondPassInputPreserved = sameValue(secondPassInput, secondPassInputSnapshot);

  const firstPassProtectedFields = pickProtectedFields(firstPass.projectedBuilding);
  const secondPassProtectedFields = pickProtectedFields(secondPass.projectedBuilding);
  const firstPassUnrelatedFields = pickUnrelatedFields(firstPass.projectedBuilding);
  const secondPassUnrelatedFields = pickUnrelatedFields(secondPass.projectedBuilding);
  const protectedFieldsMatch =
    sameValue(firstPassProtectedFields, scenario.expectedProtectedFields) &&
    sameValue(secondPassProtectedFields, scenario.expectedProtectedFields);
  const unrelatedFieldsMatch =
    sameValue(firstPassUnrelatedFields, scenario.expectedUnrelatedFields) &&
    sameValue(secondPassUnrelatedFields, scenario.expectedUnrelatedFields);

  const matches =
    firstPassDecisionMatches &&
    firstPassTransformedMatches &&
    firstPassBlockedMatches &&
    firstPassBlockedReasonMatches &&
    firstPassProjectedMatches &&
    firstPassInputPreserved &&
    secondPassDecisionMatches &&
    secondPassTransformedMatches &&
    secondPassBlockedMatches &&
    secondPassBlockedReasonMatches &&
    secondPassProjectedMatches &&
    secondPassInputPreserved &&
    protectedFieldsMatch &&
    unrelatedFieldsMatch;

  const status = matches ? scenario.expectedOutcome.result : 'FAIL';
  const reason = matches ? scenario.expectedOutcome.reason : 'unexpected-helper-result';

  return {
    status,
    reason,
    productionSourceExecution: scenario.expectedOutcome.productionSourceExecution,
    sourceBoundaryExecuted: scenario.expectedOutcome.sourceBoundaryExecuted,
    firstPass: {
      decision: firstPass.decision,
      transformed: firstPass.transformed,
      blocked: firstPass.blocked,
      blockedReason: firstPass.blockedReason,
      projectedBuilding: firstPass.projectedBuilding,
      protectedFields: firstPassProtectedFields,
      unrelatedFields: firstPassUnrelatedFields,
      inputPreserved: firstPassInputPreserved,
    },
    secondPass: {
      decision: secondPass.decision,
      transformed: secondPass.transformed,
      blocked: secondPass.blocked,
      blockedReason: secondPass.blockedReason,
      projectedBuilding: secondPass.projectedBuilding,
      protectedFields: secondPassProtectedFields,
      unrelatedFields: secondPassUnrelatedFields,
      inputPreserved: secondPassInputPreserved,
    },
    comparison: {
      sameDecision: firstPass.decision === secondPass.decision,
      sameTransformed: firstPass.transformed === secondPass.transformed,
      sameBlocked: firstPass.blocked === secondPass.blocked,
      sameBlockedReason: firstPass.blockedReason === secondPass.blockedReason,
      sameProjectedBuilding: sameValue(firstPass.projectedBuilding, secondPass.projectedBuilding),
      sameProtectedFields: sameValue(firstPassProtectedFields, secondPassProtectedFields),
      sameUnrelatedFields: sameValue(firstPassUnrelatedFields, secondPassUnrelatedFields),
      sameInputPreserved: firstPassInputPreserved && secondPassInputPreserved,
      identical:
        firstPassDecisionMatches &&
        firstPassTransformedMatches &&
        firstPassBlockedMatches &&
        firstPassBlockedReasonMatches &&
        firstPassProjectedMatches &&
        secondPassDecisionMatches &&
        secondPassTransformedMatches &&
        secondPassBlockedMatches &&
        secondPassBlockedReasonMatches &&
        secondPassProjectedMatches &&
        protectedFieldsMatch &&
        unrelatedFieldsMatch &&
        firstPassInputPreserved &&
        secondPassInputPreserved &&
        sameValue(firstPass, secondPass),
    },
    matches,
  };
}

function compareScenarioExecutions(execution1, execution2) {
  return {
    identical: sameValue(execution1, execution2),
    sameScenarioId: execution1.scenarioId === execution2.scenarioId,
    sameAcceptedContract: execution1.acceptedContract === execution2.acceptedContract,
    sameFirstPassDecision: execution1.firstPass.decision === execution2.firstPass.decision,
    sameFirstPassTransformed: execution1.firstPass.transformed === execution2.firstPass.transformed,
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
    sameSecondPassTransformed: execution1.secondPass.transformed === execution2.secondPass.transformed,
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
    sameProductionSourceExecution:
      execution1.productionSourceExecution === execution2.productionSourceExecution,
    sameSourceBoundaryExecuted: execution1.sourceBoundaryExecuted === execution2.sourceBoundaryExecuted,
    sameComparisonDecision: sameValue(execution1.comparison, execution2.comparison),
    sameMatches: execution1.matches === execution2.matches,
  };
}

function buildExitGateReport(report, control) {
  if (control === 'baseline') {
    return {
      mode: 'baseline',
      expectedResult: 'PASS',
      actualResult: report.result,
      matched: report.result === 'PASS',
      failureReason: report.result === 'PASS' ? null : 'baseline-did-not-pass',
    };
  }

  const expected = CONTROL_EXPECTATIONS[control];
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
    taskId: 'T084',
    scenarioId: fixture.scenarioId,
    acceptedContract: scenario.acceptedContract,
    acceptedContractMetadata: fixture.proposedContract,
    selectedSubcase: fixture.selectedSubcase,
    broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
    helper: HELPER,
    fixturePath: FIXTURE_PATH,
    sourceBuildingId: fixture.sourceBuilding.id,
    targetBuildingId: fixture.targetBuilding.id,
    targetType: fixture.targetBuilding.type,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    scenarioExecution1,
    scenarioExecution2,
    comparison,
    protectedFields: scenario.expectedProtectedFields,
    unrelatedFields: scenario.expectedUnrelatedFields,
    explicitExclusions: fixture.excludedContracts,
    result: pass ? 'PASS' : 'FAIL',
    status: pass ? 'PASS' : 'FAIL',
    reason: pass ? ACCEPTED_RESULT_REASON : 'unexpected-helper-result',
    replayOutcome: pass ? 'HELD' : 'FAILED',
    summary: {
      narrowClaimSupported: pass,
      broaderClaimSupported: false,
      broadScenarioStatus: BROAD_SCENARIO_CLASSIFICATION,
      repeatability: comparison.identical ? 'IDENTICAL' : 'DIFFERENT',
      sourceBoundaryExecuted: true,
    },
  };

  report.exitGate = buildExitGateReport(report, 'baseline');
  return report;
}

async function buildControlReport(control, fixture) {
  const scenario = configureScenario(fixture, control);
  const validation = validateScenario(scenario, control);

  if (!validation.ok) {
    const report = {
      command: `${COMMAND} --control=${control}`,
      taskId: 'T084',
      scenarioId: scenario.scenarioId,
      acceptedContract: scenario.acceptedContract,
      acceptedContractMetadata: fixture.proposedContract,
      selectedSubcase: fixture.selectedSubcase,
      broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
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
        broadScenarioStatus: BROAD_SCENARIO_CLASSIFICATION,
        repeatability: 'N/A',
        sourceBoundaryExecuted: false,
      },
    };

    report.exitGate = buildExitGateReport(report, control);
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
    taskId: 'T084',
    scenarioId: scenario.scenarioId,
    acceptedContract: scenario.acceptedContract,
    acceptedContractMetadata: fixture.proposedContract,
    selectedSubcase: fixture.selectedSubcase,
    broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
    helper: HELPER,
    fixturePath: FIXTURE_PATH,
    control,
    productionSourceExecution,
    sourceBoundaryExecuted,
    scenarioExecution1,
    scenarioExecution2,
    comparison,
    protectedFields: scenario.expectedProtectedFields,
    unrelatedFields: scenario.expectedUnrelatedFields,
    explicitExclusions: fixture.excludedContracts,
    result: status,
    status,
    reason,
    replayOutcome: status === 'PASS' ? 'HELD' : status === 'BLOCKED' ? 'BLOCKED' : 'FAILED',
    summary: {
      narrowClaimSupported: status === 'PASS',
      broaderClaimSupported: false,
      broadScenarioStatus: BROAD_SCENARIO_CLASSIFICATION,
      repeatability: comparison.identical ? 'IDENTICAL' : 'DIFFERENT',
      sourceBoundaryExecuted,
    },
  };

  report.exitGate = buildExitGateReport(report, control);
  return report;
}

const CONTROL = parseControl(process.argv.slice(2), process.env);
const fixture = deepFreeze(await loadFixture());
const report = CONTROL === 'baseline'
  ? await buildBaselineReport(fixture)
  : await buildControlReport(CONTROL, fixture);

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
