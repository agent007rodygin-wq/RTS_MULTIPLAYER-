// @ts-check

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveLocalRewardEligibility } from '../../../src/game/buildings/resolveLocalRewardEligibility.js';

const COMMAND = 'node tests/characterization/slice-b/scenario-06.mjs';
const FIXTURE_PATH = 'tests/characterization/slice-b/scenario-06-fixture.json';
const HELPER = 'src/game/buildings/resolveLocalRewardEligibility.js';
const SCENARIO_ID = 'scenario-06';
const SELECTED_SUBCASE = 'REWARD_GRANT_EXACTLY_ONCE_FIRST';
const ACCEPTED_CONTRACT =
  "After a source-backed reward-eligible production building with workState === 'finished' is processed through the production reward seam, one reward transition is allowed and the projected consumed state has workState === 'idle'. Processing the same unchanged consumed state again does not allow a second reward transition.";
const BROAD_SCENARIO_CLASSIFICATION = 'UNCONFIRMED_RUNTIME_BEHAVIOR';
const CONTROL_KEYS = [
  'baseline',
  'reward-not-yet-eligible',
  'missing-building-identity',
  'second-pass-rewards-again',
  'rewarded-state-regresses',
  'unrelated-field-changed',
  'production-boundary-not-available',
  'reward-payload-mutation-required',
  'live-pocketbase-required',
];

const CONTROL_EXPECTATIONS = {
  'reward-not-yet-eligible': {
    result: 'FAIL',
    reason: 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'missing-building-identity': {
    result: 'BLOCKED',
    reason: 'missing-building-identity',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'second-pass-rewards-again': {
    result: 'FAIL',
    reason: 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'rewarded-state-regresses': {
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
  'reward-payload-mutation-required': {
    result: 'BLOCKED',
    reason: 'reward-payload-mutation-required',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
  },
  'live-pocketbase-required': {
    result: 'BLOCKED',
    reason: 'live-pocketbase-required',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
  },
};

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_06_CHARACTERIZATION_CONTROL || 'baseline').trim();

  if (!CONTROL_KEYS.includes(raw)) {
    throw new Error(`Unsupported Scenario 6 characterization control "${raw}"`);
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

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function pickProtectedFields(building) {
  return {
    workState: building?.workState ?? null,
    hp: building?.hp ?? null,
    maxHp: building?.maxHp ?? null,
    pendingDamage: building?.pendingDamage ?? null,
  };
}

function pickUnrelatedFields(building) {
  return {
    x: building?.x ?? null,
    y: building?.y ?? null,
    zoneId: building?.zoneId ?? null,
    ownerId: building?.ownerId ?? null,
    isLocal: building?.isLocal ?? null,
    timestamp: building?.timestamp ?? null,
  };
}

async function loadFixture() {
  return JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
}

function buildScenario(fixture, control) {
  const scenario = clone(fixture);
  scenario.acceptedContract = ACCEPTED_CONTRACT;
  scenario.acceptedContractMetadata = fixture.proposedContract;
  scenario.selectedSubcase = SELECTED_SUBCASE;
  scenario.productionBoundaryStatus = fixture.productionBoundaryStatus;
  scenario.selectedRewardAction = fixture.selectedRewardAction;
  scenario.selectedRewardActionReason = fixture.selectedRewardActionReason;
  scenario.productionBoundary = {
    available: true,
    reason: 'production-boundary-available',
  };
  scenario.requirements = {
    requiresRewardPayloadMutation: false,
    requiresLivePocketBase: false,
  };
  scenario.firstPass = {
    expectedDecision: 'grant_reward',
    expectedGranted: true,
  };
  scenario.secondPass = {
    expectedDecision: 'no_reward',
    expectedGranted: false,
  };
  scenario.expectedConsumedState = clone(fixture.rewardedState.building);
  scenario.expectedProtectedFields = pickProtectedFields(fixture.rewardedState.building);
  scenario.expectedUnrelatedFields = pickUnrelatedFields(fixture.initialEligibleState.building);
  scenario.secondPassInputMode = 'consumed';
  scenario.skipHelperExecution = false;

  if (control === 'reward-not-yet-eligible') {
    scenario.initialEligibleState.building.workState = 'working';
  } else if (control === 'missing-building-identity') {
    delete scenario.initialEligibleState.building.id;
  } else if (control === 'second-pass-rewards-again') {
    scenario.secondPassInputMode = 'repeat-initial';
  } else if (control === 'rewarded-state-regresses') {
    scenario.expectedConsumedState.workState = 'finished';
    scenario.expectedConsumedState.hp = 999;
    scenario.expectedConsumedState.maxHp = 999;
    scenario.expectedConsumedState.pendingDamage = 7;
    scenario.expectedProtectedFields = pickProtectedFields(scenario.expectedConsumedState);
  } else if (control === 'unrelated-field-changed') {
    scenario.expectedUnrelatedFields.x = scenario.expectedUnrelatedFields.x + 1;
  } else if (
    control === 'production-boundary-not-available'
  ) {
    scenario.productionBoundary.available = false;
    scenario.productionBoundary.reason = 'production-boundary-not-available';
  } else if (control === 'reward-payload-mutation-required') {
    scenario.requirements.requiresRewardPayloadMutation = true;
  } else if (control === 'live-pocketbase-required') {
    scenario.requirements.requiresLivePocketBase = true;
  }

  return deepFreeze(scenario);
}

function validateScenario(scenario) {
  const requiredFields = [
    ['scenarioId', scenario.scenarioId],
    ['acceptedContract', scenario.acceptedContract],
    ['productionBoundaryStatus', scenario.productionBoundaryStatus],
    ['selectedSubcase', scenario.selectedSubcase],
    ['selectedRewardAction', scenario.selectedRewardAction],
    ['selectedRewardActionReason', scenario.selectedRewardActionReason],
    ['frozenClock.now', scenario.frozenClock?.now],
    ['productionBoundary', scenario.productionBoundary],
    ['requirements', scenario.requirements],
    ['initialEligibleState.building', scenario.initialEligibleState?.building],
    ['rewardedState.building', scenario.rewardedState?.building],
    ['expectedConsumedState', scenario.expectedConsumedState],
    ['expectedProtectedFields', scenario.expectedProtectedFields],
    ['expectedUnrelatedFields', scenario.expectedUnrelatedFields],
  ];

  const missing = requiredFields
    .filter(([, value]) => value === undefined || value === null)
    .map(([label]) => label);

  if (missing.length > 0) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'missing-required-fields',
      missing,
      diagnostics: {
        productionBoundary: clone(scenario.productionBoundary),
        requirements: clone(scenario.requirements),
      },
    };
  }

  if (scenario.productionBoundary?.available === false) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'production-boundary-not-available',
      missing: [],
      diagnostics: {
        productionBoundary: clone(scenario.productionBoundary),
        requirements: clone(scenario.requirements),
      },
    };
  }

  if (scenario.requirements?.requiresRewardPayloadMutation) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'reward-payload-mutation-required',
      missing: [],
      diagnostics: {
        productionBoundary: clone(scenario.productionBoundary),
        requirements: clone(scenario.requirements),
      },
    };
  }

  if (scenario.requirements?.requiresLivePocketBase) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'live-pocketbase-required',
      missing: [],
      diagnostics: {
        productionBoundary: clone(scenario.productionBoundary),
        requirements: clone(scenario.requirements),
      },
    };
  }

  return {
    ok: true,
    status: 'PASS',
    reason: null,
    missing: [],
    diagnostics: {
      productionBoundary: clone(scenario.productionBoundary),
      requirements: clone(scenario.requirements),
    },
  };
}

function runRewardPass(building, now) {
  return resolveLocalRewardEligibility({
    building: clone(building),
    now,
  });
}

function evaluateScenarioExecution(scenario) {
  const firstPassInput = clone(scenario.initialEligibleState.building);
  const firstPassInputSnapshot = clone(firstPassInput);
  const firstPass = runRewardPass(firstPassInput, scenario.frozenClock.now);

  const secondPassInput =
    scenario.secondPassInputMode === 'repeat-initial'
      ? clone(scenario.initialEligibleState.building)
      : clone(firstPass.consumedBuilding);
  const secondPassInputSnapshot = clone(secondPassInput);
  const secondPass = runRewardPass(secondPassInput, scenario.frozenClock.now);

  const firstPassProtectedFields = pickProtectedFields(firstPass.consumedBuilding);
  const secondPassProtectedFields = pickProtectedFields(secondPass.consumedBuilding);
  const firstPassUnrelatedFields = pickUnrelatedFields(firstPass.consumedBuilding);
  const secondPassUnrelatedFields = pickUnrelatedFields(secondPass.consumedBuilding);
  const expectedProtectedFields = scenario.expectedProtectedFields;
  const expectedUnrelatedFields = scenario.expectedUnrelatedFields;

  const firstPassDecisionMatches = firstPass.decision === scenario.firstPass.expectedDecision;
  const firstPassGrantedMatches = firstPass.granted === scenario.firstPass.expectedGranted;
  const firstPassBlockedMatches = firstPass.blocked === false;
  const firstPassBlockedReasonMatches = firstPass.blockedReason === undefined;
  const firstPassFieldsMatch = sameValue(firstPassProtectedFields, expectedProtectedFields);
  const secondPassDecisionMatches = secondPass.decision === scenario.secondPass.expectedDecision;
  const secondPassGrantedMatches = secondPass.granted === scenario.secondPass.expectedGranted;
  const secondPassBlockedMatches = secondPass.blocked === false;
  const secondPassBlockedReasonMatches = secondPass.blockedReason === undefined;
  const secondPassFieldsMatch = sameValue(secondPassProtectedFields, expectedProtectedFields);
  const unrelatedFieldPreserved =
    sameValue(firstPassUnrelatedFields, expectedUnrelatedFields) &&
    sameValue(secondPassUnrelatedFields, expectedUnrelatedFields);
  const inputPreserved =
    sameValue(firstPassInput, firstPassInputSnapshot) && sameValue(secondPassInput, secondPassInputSnapshot);

  const baselineHeld =
    firstPassDecisionMatches &&
    firstPassGrantedMatches &&
    firstPassBlockedMatches &&
    firstPassBlockedReasonMatches &&
    firstPassFieldsMatch &&
    secondPassDecisionMatches &&
    secondPassGrantedMatches &&
    secondPassBlockedMatches &&
    secondPassBlockedReasonMatches &&
    secondPassFieldsMatch &&
    unrelatedFieldPreserved &&
    inputPreserved;

  return {
    status: baselineHeld ? 'PASS' : 'FAIL',
    reason: baselineHeld ? 'accepted-narrow-reward-seam-contract-held' : 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    baselineHeld,
    inputPreserved,
    firstPass: {
      decision: firstPass.decision,
      granted: firstPass.granted,
      blocked: firstPass.blocked,
      blockedReason: firstPass.blockedReason,
      protectedFields: firstPassProtectedFields,
      unrelatedFields: firstPassUnrelatedFields,
      consumedBuilding: firstPass.consumedBuilding,
    },
    secondPass: {
      decision: secondPass.decision,
      granted: secondPass.granted,
      blocked: secondPass.blocked,
      blockedReason: secondPass.blockedReason,
      protectedFields: secondPassProtectedFields,
      unrelatedFields: secondPassUnrelatedFields,
      consumedBuilding: secondPass.consumedBuilding,
    },
    rewardTransitionResult: {
      decision: firstPass.decision,
      granted: firstPass.granted,
    },
    secondPassResult: {
      decision: secondPass.decision,
      granted: secondPass.granted,
    },
    firstPassDecisionMatches,
    firstPassGrantedMatches,
    firstPassBlockedMatches,
    firstPassBlockedReasonMatches,
    firstPassFieldsMatch,
    secondPassDecisionMatches,
    secondPassGrantedMatches,
    secondPassBlockedMatches,
    secondPassBlockedReasonMatches,
    secondPassFieldsMatch,
    unrelatedFieldPreserved,
  };
}

function compareScenarioExecutions(execution1, execution2) {
  return {
    identical: sameValue(execution1, execution2),
    sameScenarioId: execution1.scenarioId === execution2.scenarioId,
    sameAcceptedContract: execution1.acceptedContract === execution2.acceptedContract,
    sameFirstPassDecision: execution1.firstPass.decision === execution2.firstPass.decision,
    sameFirstPassGranted: execution1.firstPass.granted === execution2.firstPass.granted,
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
    sameSecondPassGranted: execution1.secondPass.granted === execution2.secondPass.granted,
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
    sameRewardTransitionResult: sameValue(
      execution1.rewardTransitionResult,
      execution2.rewardTransitionResult,
    ),
    sameSecondPassResult: sameValue(execution1.secondPassResult, execution2.secondPassResult),
    sameUnrelatedFieldPreservation: execution1.unrelatedFieldPreserved === execution2.unrelatedFieldPreserved,
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
  const scenarioExecution1 = evaluateScenarioExecution(buildScenario(fixture, 'baseline'));
  const scenarioExecution2 = evaluateScenarioExecution(buildScenario(fixture, 'baseline'));
  const comparison = compareScenarioExecutions(scenarioExecution1, scenarioExecution2);
  const pass = scenarioExecution1.status === 'PASS' && scenarioExecution2.status === 'PASS' && comparison.identical;

  const report = {
    command: COMMAND,
    taskId: 'T076',
    scenarioId: fixture.scenarioId,
    acceptedContract: ACCEPTED_CONTRACT,
    acceptedContractMetadata: fixture.proposedContract,
    selectedSubcase: SELECTED_SUBCASE,
    selectedRewardAction: fixture.selectedRewardAction,
    selectedRewardActionReason: fixture.selectedRewardActionReason,
    broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
    fixturePath: FIXTURE_PATH,
    productionHelper: HELPER,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    scenarioExecution1,
    scenarioExecution2,
    comparison,
    protectedFields: fixture.protectedFields,
    unrelatedFields: fixture.unrelatedFields,
    explicitExclusions: fixture.excludedContracts,
    callerOwnedSideEffects: fixture.callerOwnedSideEffects,
    stopConditions: fixture.stopConditions,
    limitations: fixture.limitations,
    result: pass ? 'PASS' : 'FAIL',
    status: pass ? 'PASS' : 'FAIL',
    reason: pass ? 'accepted-narrow-reward-seam-contract-held' : 'unexpected-helper-result',
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
  const scenario = buildScenario(fixture, control);
  const validation = validateScenario(scenario);

  if (!validation.ok) {
    const report = {
      command: `${COMMAND} --control=${control}`,
      taskId: 'T076',
      scenarioId: scenario.scenarioId,
      acceptedContract: scenario.acceptedContract,
      acceptedContractMetadata: scenario.acceptedContractMetadata,
      selectedSubcase: scenario.selectedSubcase,
      selectedRewardAction: scenario.selectedRewardAction,
      selectedRewardActionReason: scenario.selectedRewardActionReason,
      broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
      fixturePath: FIXTURE_PATH,
      productionHelper: HELPER,
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

  const scenarioExecution = evaluateScenarioExecution(scenario);

  let status = scenarioExecution.baselineHeld ? 'PASS' : 'FAIL';
  let reason = scenarioExecution.baselineHeld ? 'control-did-not-fail' : 'unexpected-helper-result';
  let productionSourceExecution = scenarioExecution.productionSourceExecution;
  let sourceBoundaryExecuted = scenarioExecution.sourceBoundaryExecuted;

  if (control === 'missing-building-identity') {
    if (scenarioExecution.firstPass.blocked && scenarioExecution.firstPass.blockedReason === 'missing-building-identity') {
      status = 'BLOCKED';
      reason = 'missing-building-identity';
    }
  }

  const report = {
    command: `${COMMAND} --control=${control}`,
    taskId: 'T076',
    scenarioId: scenario.scenarioId,
    acceptedContract: scenario.acceptedContract,
    acceptedContractMetadata: scenario.acceptedContractMetadata,
    selectedSubcase: scenario.selectedSubcase,
    selectedRewardAction: scenario.selectedRewardAction,
    selectedRewardActionReason: scenario.selectedRewardActionReason,
    broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
    fixturePath: FIXTURE_PATH,
    productionHelper: HELPER,
    control,
    productionSourceExecution,
    sourceBoundaryExecuted,
    result: status,
    status,
    reason,
    replayOutcome: status === 'PASS' ? 'HELD' : status === 'BLOCKED' ? 'BLOCKED' : 'FAILED',
    scenarioExecution,
    protectedFields: fixture.protectedFields,
    unrelatedFields: fixture.unrelatedFields,
    explicitExclusions: fixture.excludedContracts,
    callerOwnedSideEffects: fixture.callerOwnedSideEffects,
    stopConditions: fixture.stopConditions,
    limitations: fixture.limitations,
    summary: {
      narrowClaimSupported: status === 'PASS',
      broaderClaimSupported: false,
      broadScenarioStatus: BROAD_SCENARIO_CLASSIFICATION,
      repeatability: 'N/A',
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
