// @ts-check

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveLocalConstructionCompletion } from '../../../src/game/buildings/resolveLocalConstructionCompletion.js';

const COMMAND = 'node tests/characterization/slice-b/scenario-04.mjs';
const FIXTURE_PATH = 'tests/characterization/slice-b/scenario-04-fixture.json';
const HELPER = 'src/game/buildings/resolveLocalConstructionCompletion.js';
const SCENARIO_ID = 'scenario-04';
const ACCEPTED_CONTRACT =
  'After an already-expired persisted construction process is replayed by offline catch-up, the local construction completion transition occurs once. Replaying the same unchanged completed state again produces no second local construction completion transition.';
const BROAD_SCENARIO_CLASSIFICATION = 'UNCONFIRMED_RUNTIME_BEHAVIOR';
const CONTROL_KEYS = [
  'baseline',
  'completion-time-not-reached',
  'missing-identity',
  'second-pass-completes-again',
  'completed-fields-regress',
  'unrelated-field-changed',
  'production-boundary-not-available',
];

const CONTROL_EXPECTATIONS = {
  'completion-time-not-reached': {
    result: 'FAIL',
    reason: 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'missing-identity': {
    result: 'BLOCKED',
    reason: 'missing-building-identity',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
  },
  'second-pass-completes-again': {
    result: 'FAIL',
    reason: 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'completed-fields-regress': {
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
};

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_04_CHARACTERIZATION_CONTROL || 'baseline').trim();

  if (!CONTROL_KEYS.includes(raw)) {
    throw new Error(`Unsupported Scenario 4 characterization control "${raw}"`);
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
    isConstructing: building?.isConstructing ?? null,
    workState: building?.workState ?? null,
    constructionEndTime: building?.constructionEndTime ?? null,
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
    buildingId: building?.buildingId ?? null,
    ownerId: building?.ownerId ?? null,
    isLocal: building?.isLocal ?? null,
    constructionDurationMs: building?.constructionDurationMs ?? null,
    constructionMaxLifetimeMs: building?.constructionMaxLifetimeMs ?? null,
    timestamp: building?.timestamp ?? null,
  };
}

async function loadFixture() {
  return JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
}

function buildScenario(fixture, control) {
  const scenario = clone(fixture);
  scenario.expectedCompletedState = clone(fixture.completedState.building);
  scenario.expectedUnrelatedFields = pickUnrelatedFields(fixture.initialState.building);
  scenario.skipHelperExecution = false;

  if (control === 'completion-time-not-reached') {
    scenario.frozenClock.now = scenario.frozenClock.processEndTime - 1;
  } else if (control === 'missing-identity') {
    delete scenario.initialState.building.id;
  } else if (control === 'second-pass-completes-again') {
    scenario.secondPass.expectedDecision = 'complete_construction';
  } else if (control === 'completed-fields-regress') {
    scenario.expectedCompletedState.isConstructing = true;
    scenario.expectedCompletedState.workState = 'working';
    scenario.expectedCompletedState.hp = 999;
    scenario.expectedCompletedState.pendingDamage = 7;
  } else if (control === 'unrelated-field-changed') {
    scenario.expectedUnrelatedFields.x = scenario.expectedUnrelatedFields.x + 1;
  } else if (control === 'production-boundary-not-available') {
    scenario.skipHelperExecution = true;
  }

  return deepFreeze(scenario);
}

function validateScenario(scenario) {
  const requiredFields = [
    ['scenarioId', scenario.scenarioId],
    ['acceptedContract', scenario.acceptedContract],
    ['productionBoundaryStatus', scenario.productionBoundaryStatus],
    ['selectedProcessType', scenario.selectedProcessType],
    ['frozenClock.now', scenario.frozenClock?.now],
    ['initialState.building', scenario.initialState?.building],
    ['completedState.building', scenario.completedState?.building],
    ['expectedCompletedState', scenario.expectedCompletedState],
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
    };
  }

  const missingIds = [
    ['initialState.building.id', scenario.initialState?.building?.id],
    ['completedState.building.id', scenario.completedState?.building?.id],
  ]
    .filter(([, value]) => value === undefined || value === null || value === '')
    .map(([label]) => label);

  if (missingIds.length > 0) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'missing-building-identity',
      missing: missingIds,
    };
  }

  if (scenario.skipHelperExecution) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'production-boundary-not-available',
      missing: [],
    };
  }

  return {
    ok: true,
    status: 'PASS',
    reason: null,
    missing: [],
  };
}

function runConstructionPass(building, now) {
  return resolveLocalConstructionCompletion({
    building: clone(building),
    now,
  });
}

function evaluateScenarioExecution(scenario) {
  const firstPass = runConstructionPass(scenario.initialState.building, scenario.frozenClock.now);
  const secondPass = runConstructionPass(firstPass.completedBuilding, scenario.frozenClock.now);

  const firstPassProtectedFields = pickProtectedFields(firstPass.completedBuilding);
  const secondPassProtectedFields = pickProtectedFields(secondPass.completedBuilding);
  const firstPassUnrelatedFields = pickUnrelatedFields(firstPass.completedBuilding);
  const secondPassUnrelatedFields = pickUnrelatedFields(secondPass.completedBuilding);
  const expectedProtectedFields = pickProtectedFields(scenario.expectedCompletedState);
  const expectedUnrelatedFields = scenario.expectedUnrelatedFields;

  const firstPassDecisionMatches = firstPass.decision === scenario.firstPass.expectedDecision;
  const firstPassCompletedMatches = firstPass.completed === scenario.firstPass.expectedCompleted;
  const firstPassFieldsMatch = sameValue(firstPassProtectedFields, expectedProtectedFields);
  const secondPassDecisionMatches = secondPass.decision === scenario.secondPass.expectedDecision;
  const secondPassCompletedMatches = secondPass.completed === scenario.secondPass.expectedCompleted;
  const secondPassFieldsMatch =
    sameValue(secondPassProtectedFields, expectedProtectedFields) &&
    sameValue(firstPassUnrelatedFields, expectedUnrelatedFields) &&
    sameValue(secondPassUnrelatedFields, expectedUnrelatedFields);
  const unrelatedFieldPreserved =
    sameValue(firstPassUnrelatedFields, expectedUnrelatedFields) &&
    sameValue(secondPassUnrelatedFields, expectedUnrelatedFields);

  const pass =
    firstPassDecisionMatches &&
    firstPassCompletedMatches &&
    firstPassFieldsMatch &&
    secondPassDecisionMatches &&
    secondPassCompletedMatches &&
    secondPassFieldsMatch &&
    unrelatedFieldPreserved;

  return {
    status: pass ? 'PASS' : 'FAIL',
    reason: pass ? 'accepted-narrow-construction-completion-contract-held' : 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    firstPass: {
      decision: firstPass.decision,
      completed: firstPass.completed,
      protectedFields: firstPassProtectedFields,
      unrelatedFields: firstPassUnrelatedFields,
    },
    secondPass: {
      decision: secondPass.decision,
      completed: secondPass.completed,
      protectedFields: secondPassProtectedFields,
      unrelatedFields: secondPassUnrelatedFields,
    },
    completionResult: {
      decision: firstPass.decision,
      completed: firstPass.completed,
    },
    secondPassResult: {
      decision: secondPass.decision,
      completed: secondPass.completed,
    },
    completionDecisionMatches: firstPassDecisionMatches,
    firstPassCompletedMatches,
    firstPassFieldsMatch,
    secondPassDecisionMatches,
    secondPassCompletedMatches,
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
    sameFirstPassCompleted: execution1.firstPass.completed === execution2.firstPass.completed,
    sameFirstPassProtectedFields: sameValue(
      execution1.firstPass.protectedFields,
      execution2.firstPass.protectedFields,
    ),
    sameFirstPassUnrelatedFields: sameValue(
      execution1.firstPass.unrelatedFields,
      execution2.firstPass.unrelatedFields,
    ),
    sameSecondPassDecision: execution1.secondPass.decision === execution2.secondPass.decision,
    sameSecondPassCompleted: execution1.secondPass.completed === execution2.secondPass.completed,
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
    sameCompletionResult: sameValue(execution1.completionResult, execution2.completionResult),
    sameSecondPassResult: sameValue(execution1.secondPassResult, execution2.secondPassResult),
    sameUnrelatedFieldPreservation:
      sameValue(execution1.firstPass.unrelatedFields, execution2.firstPass.unrelatedFields) &&
      sameValue(execution1.secondPass.unrelatedFields, execution2.secondPass.unrelatedFields),
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
    taskId: 'T060',
    scenarioId: fixture.scenarioId,
    acceptedContract: fixture.acceptedContract,
    selectedSubcase: fixture.selectedSubcase,
    selectedProcessType: fixture.selectedProcessType,
    selectedProcessTypeReason: fixture.selectedProcessTypeReason,
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
    result: pass ? 'PASS' : 'FAIL',
    status: pass ? 'PASS' : 'FAIL',
    reason: pass ? 'accepted-narrow-construction-completion-contract-held' : 'unexpected-helper-result',
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
      taskId: 'T060',
      scenarioId: scenario.scenarioId,
      acceptedContract: scenario.acceptedContract,
      selectedSubcase: scenario.selectedSubcase,
      selectedProcessType: scenario.selectedProcessType,
      selectedProcessTypeReason: scenario.selectedProcessTypeReason,
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
  const report = {
    command: `${COMMAND} --control=${control}`,
    taskId: 'T060',
    scenarioId: scenario.scenarioId,
    acceptedContract: scenario.acceptedContract,
    selectedSubcase: scenario.selectedSubcase,
    selectedProcessType: scenario.selectedProcessType,
    selectedProcessTypeReason: scenario.selectedProcessTypeReason,
    broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
    fixturePath: FIXTURE_PATH,
    productionHelper: HELPER,
    control,
    productionSourceExecution: scenarioExecution.productionSourceExecution,
    sourceBoundaryExecuted: scenarioExecution.sourceBoundaryExecuted,
    result: scenarioExecution.status,
    status: scenarioExecution.status,
    reason: scenarioExecution.reason,
    replayOutcome: scenarioExecution.status === 'PASS' ? 'HELD' : 'FAILED',
    scenarioExecution,
    protectedFields: fixture.protectedFields,
    unrelatedFields: fixture.unrelatedFields,
    explicitExclusions: fixture.excludedContracts,
    summary: {
      narrowClaimSupported: scenarioExecution.status === 'PASS',
      broaderClaimSupported: false,
      broadScenarioStatus: BROAD_SCENARIO_CLASSIFICATION,
      repeatability: 'N/A',
      sourceBoundaryExecuted: scenarioExecution.sourceBoundaryExecuted,
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
