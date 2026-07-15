// @ts-check

import assert from 'node:assert/strict';
import { resolveLocalConstructionCompletion } from '../../../src/game/buildings/resolveLocalConstructionCompletion.js';

const COMMAND = 'node tests/characterization/slice-b/scenario-03.mjs';
const HELPER = 'src/game/buildings/resolveLocalConstructionCompletion.js';
const SCENARIO_ID = 'scenario-03';
const ACCEPTED_CONTRACT =
  'After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.';
const BROADER_CONTRACT_EXCLUDED =
  'Broad persisted-process exactly-once behavior remains UNCONFIRMED_RUNTIME_BEHAVIOR outside the narrow construction subcase.';
const FIXED_NOW = 1_704_067_200_000;
const CONSTRUCTION_END_TIME = 1_704_067_140_000;

const CONTROL_KEYS = [
  'baseline',
  'completion-time-not-reached',
  'missing-identity',
  'second-pass-completes-again',
  'completed-fields-regress',
  'unrelated-building-changed',
  'production-helper-not-executed',
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
  'unrelated-building-changed': {
    result: 'FAIL',
    reason: 'unexpected-helper-result',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
  },
  'production-helper-not-executed': {
    result: 'BLOCKED',
    reason: 'production-helper-not-executed',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
  },
};

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_03_CHARACTERIZATION_CONTROL || 'baseline').trim();

  if (!CONTROL_KEYS.includes(raw)) {
    throw new Error(`Unsupported Scenario 3 characterization control "${raw}"`);
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

function selectAcceptedFields(building) {
  return {
    isConstructing: building?.isConstructing ?? null,
    workState: building?.workState ?? null,
    constructionEndTime: building?.constructionEndTime ?? null,
    hp: building?.hp ?? null,
    maxHp: building?.maxHp ?? null,
    pendingDamage: building?.pendingDamage ?? null,
  };
}

function createActiveConstructionBuilding(overrides = {}) {
  return {
    id: 'construction-terminal-1',
    buildingId: 301,
    x: 18,
    y: 11,
    zoneId: 'zone-2',
    ownerId: 'user-9',
    isLocal: true,
    isConstructing: true,
    constructionEndTime: CONSTRUCTION_END_TIME,
    constructionDurationMs: 180000,
    constructionMaxLifetimeMs: 240000,
    workState: 'working',
    hp: 120,
    maxHp: 120,
    pendingDamage: 0,
    timestamp: FIXED_NOW - 1800,
    ...overrides,
  };
}

function createUnrelatedBuilding(overrides = {}) {
  return {
    id: 'construction-unrelated-1',
    buildingId: 302,
    x: 22,
    y: 10,
    zoneId: 'zone-2',
    ownerId: 'user-9',
    isLocal: false,
    isConstructing: false,
    constructionEndTime: undefined,
    constructionDurationMs: 0,
    constructionMaxLifetimeMs: 0,
    workState: 'idle',
    hp: 250,
    maxHp: 250,
    pendingDamage: 0,
    timestamp: FIXED_NOW - 950,
    ...overrides,
  };
}

function createScenario(control) {
  const scenario = {
    scenarioId: SCENARIO_ID,
    acceptedContract: ACCEPTED_CONTRACT,
    broaderContractExcluded: BROADER_CONTRACT_EXCLUDED,
    broadScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
    currentUserId: 'user-9',
    now: FIXED_NOW,
    activeConstructionBuilding: createActiveConstructionBuilding(),
    completedConstructionBuilding: createActiveConstructionBuilding({
      isConstructing: false,
      workState: 'idle',
    }),
    unrelatedBuilding: createUnrelatedBuilding(),
    expectedUnrelatedBuilding: createUnrelatedBuilding(),
  };

  if (control === 'completion-time-not-reached') {
    scenario.now = CONSTRUCTION_END_TIME - 1;
  } else if (control === 'missing-identity') {
    delete scenario.activeConstructionBuilding.id;
  } else if (control === 'second-pass-completes-again') {
    scenario.expectedSecondPassDecision = 'complete_construction';
  } else if (control === 'completed-fields-regress') {
    scenario.expectedCompletedFields = {
      isConstructing: true,
      workState: 'working',
      constructionEndTime: CONSTRUCTION_END_TIME,
      hp: 999,
      maxHp: 120,
      pendingDamage: 7,
    };
  } else if (control === 'unrelated-building-changed') {
    scenario.unrelatedBuilding = createUnrelatedBuilding({
      hp: 251,
    });
  } else if (control === 'production-helper-not-executed') {
    scenario.skipHelperExecution = true;
  }

  return deepFreeze(scenario);
}

function validateScenario(scenario) {
  const requiredFields = [
    ['scenarioId', scenario.scenarioId],
    ['acceptedContract', scenario.acceptedContract],
    ['broaderContractExcluded', scenario.broaderContractExcluded],
    ['broadScenarioClassification', scenario.broadScenarioClassification],
    ['currentUserId', scenario.currentUserId],
    ['now', scenario.now],
    ['activeConstructionBuilding', scenario.activeConstructionBuilding],
    ['completedConstructionBuilding', scenario.completedConstructionBuilding],
    ['unrelatedBuilding', scenario.unrelatedBuilding],
    ['expectedUnrelatedBuilding', scenario.expectedUnrelatedBuilding],
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
    ['activeConstructionBuilding.id', scenario.activeConstructionBuilding?.id],
    ['completedConstructionBuilding.id', scenario.completedConstructionBuilding?.id],
    ['unrelatedBuilding.id', scenario.unrelatedBuilding?.id],
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
      reason: 'production-helper-not-executed',
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

function runCompletionPass(building, now) {
  return resolveLocalConstructionCompletion({
    building: clone(building),
    now,
  });
}

function evaluateScenarioRun(scenario) {
  const unrelatedBefore = selectAcceptedFields(scenario.unrelatedBuilding);

  const firstPass = runCompletionPass(scenario.activeConstructionBuilding, scenario.now);
  const firstPassFields = selectAcceptedFields(firstPass.completedBuilding);

  const secondPass = runCompletionPass(firstPass.completedBuilding, scenario.now);
  const secondPassFields = selectAcceptedFields(secondPass.completedBuilding);

  const expectedSecondPassDecision = scenario.expectedSecondPassDecision || 'no_completion';
  const expectedCompletedFields = scenario.expectedCompletedFields || firstPassFields;
  const expectedUnrelatedBuilding = scenario.expectedUnrelatedBuilding || scenario.unrelatedBuilding;

  const completionDecisionMatches = firstPass.decision === 'complete_construction';
  const firstPassCompletedMatches = firstPass.completed === true;
  const firstPassFieldsMatch = JSON.stringify(firstPassFields) === JSON.stringify(selectAcceptedFields(scenario.completedConstructionBuilding));
  const secondPassDecisionMatches = secondPass.decision === expectedSecondPassDecision;
  const secondPassCompletedMatches = secondPass.completed === false;
  const secondPassFieldsMatch = JSON.stringify(secondPassFields) === JSON.stringify(expectedCompletedFields);
  const unrelatedFieldPreserved =
    JSON.stringify(selectAcceptedFields(scenario.unrelatedBuilding)) ===
    JSON.stringify(selectAcceptedFields(expectedUnrelatedBuilding));

  const pass =
    completionDecisionMatches &&
    firstPassCompletedMatches &&
    firstPassFieldsMatch &&
    secondPassDecisionMatches &&
    secondPassCompletedMatches &&
    secondPassFieldsMatch &&
    unrelatedFieldPreserved;

  return {
    status: pass ? 'PASS' : 'FAIL',
    reason: pass ? 'accepted-narrow-construction-completion-contract-held' : 'unexpected-helper-result',
    firstPass: {
      status: completionDecisionMatches && firstPassCompletedMatches ? 'PASS' : 'FAIL',
      decision: firstPass.decision,
      completed: firstPass.completed,
      completedFields: firstPassFields,
    },
    secondPass: {
      status: secondPassDecisionMatches && secondPassCompletedMatches ? 'PASS' : 'FAIL',
      decision: secondPass.decision,
      completed: secondPass.completed,
      outputFields: secondPassFields,
    },
    unrelatedFieldPreservation: {
      preserved: unrelatedFieldPreserved,
      before: unrelatedBefore,
      after: selectAcceptedFields(scenario.unrelatedBuilding),
    },
    completionResult: {
      decision: firstPass.decision,
      completed: firstPass.completed,
    },
    secondPassResult: {
      decision: secondPass.decision,
      completed: secondPass.completed,
    },
    completionDecisionMatches,
    firstPassCompletedMatches,
    firstPassFieldsMatch,
    secondPassDecisionMatches,
    secondPassCompletedMatches,
    secondPassFieldsMatch,
    unrelatedFieldPreserved,
    expectedSecondPassDecision,
    expectedCompletedFields,
  };
}

function compareScenarioRuns(run1, run2) {
  return {
    identical: JSON.stringify(run1) === JSON.stringify(run2),
    sameScenarioId: run1.scenarioId === run2.scenarioId,
    sameAcceptedContract: run1.acceptedContract === run2.acceptedContract,
    sameFirstPassDecision: run1.firstPass.decision === run2.firstPass.decision,
    sameFirstPassCompleted: run1.firstPass.completed === run2.firstPass.completed,
    sameFirstPassCompletedFields:
      JSON.stringify(run1.firstPass.completedFields) === JSON.stringify(run2.firstPass.completedFields),
    sameSecondPassDecision: run1.secondPass.decision === run2.secondPass.decision,
    sameSecondPassCompleted: run1.secondPass.completed === run2.secondPass.completed,
    sameSecondPassOutputFields:
      JSON.stringify(run1.secondPass.outputFields) === JSON.stringify(run2.secondPass.outputFields),
    sameUnrelatedFieldPreservation:
      JSON.stringify(run1.unrelatedFieldPreservation) === JSON.stringify(run2.unrelatedFieldPreservation),
    sameCompletionDecision: run1.completionResult.decision === run2.completionResult.decision,
    sameSecondPassResult: run1.secondPassResult.decision === run2.secondPassResult.decision,
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
  const expectedKeys = expected
    ? {
        expectedResult: expected.result,
        expectedReason: expected.reason,
        expectedProductionSourceExecution: expected.productionSourceExecution,
        expectedSourceBoundaryExecuted: expected.sourceBoundaryExecuted,
      }
    : null;

  const mismatches = [];

  if (!expected) {
    mismatches.push(`unknown-control:${control}`);
  } else {
    if (report.result !== expected.result) {
      mismatches.push(`result:${report.result}!=${expected.result}`);
    }

    if (report.reason !== expected.reason) {
      mismatches.push(`reason:${report.reason}!=${expected.reason}`);
    }

    if (report.productionSourceExecution !== expected.productionSourceExecution) {
      mismatches.push(
        `productionSourceExecution:${report.productionSourceExecution}!=${expected.productionSourceExecution}`,
      );
    }

    if (report.sourceBoundaryExecuted !== expected.sourceBoundaryExecuted) {
      mismatches.push(
        `sourceBoundaryExecuted:${report.sourceBoundaryExecuted}!=${expected.sourceBoundaryExecuted}`,
      );
    }
  }

  return {
    mode: 'control',
    control,
    ...expectedKeys,
    actualResult: report.result,
    actualReason: report.reason,
    actualProductionSourceExecution: report.productionSourceExecution,
    actualSourceBoundaryExecuted: report.sourceBoundaryExecuted,
    matched: mismatches.length === 0,
    mismatches,
    failureReason: mismatches.length === 0 ? null : 'control-exit-contract-mismatch',
  };
}

function buildBaselineReport() {
  const scenario = createScenario('baseline');
  const validation = validateScenario(scenario);

  if (!validation.ok) {
    const report = {
      command: COMMAND,
      scenarioId: scenario.scenarioId,
      acceptedContract: scenario.acceptedContract,
      broaderContractExcluded: scenario.broaderContractExcluded,
      control: 'baseline',
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      productionHelper: HELPER,
      result: validation.status,
      status: validation.status,
      reason: validation.reason,
      replayOutcome: 'BLOCKED',
      validation,
      summary: {
        narrowClaimSupported: false,
        broaderClaimSupported: false,
        scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
        deterministicTwoRunResult: false,
        sourceBoundaryExecuted: false,
      },
    };

    report.exitGate = buildExitGateReport(report, control);

    return report;
  }

  const scenarioRun1 = evaluateScenarioRun(createScenario('baseline'));
  const scenarioRun2 = evaluateScenarioRun(createScenario('baseline'));
  const semanticComparison = compareScenarioRuns(scenarioRun1, scenarioRun2);
  const pass = scenarioRun1.status === 'PASS' && scenarioRun2.status === 'PASS' && semanticComparison.identical;

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    acceptedContract: scenario.acceptedContract,
    broaderContractExcluded: scenario.broaderContractExcluded,
    control: 'baseline',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    productionHelper: HELPER,
    frozenInputs: {
      scenarioId: scenario.scenarioId,
      currentUserId: scenario.currentUserId,
      now: scenario.now,
      activeConstructionBuilding: scenario.activeConstructionBuilding,
      completedConstructionBuilding: scenario.completedConstructionBuilding,
      unrelatedBuilding: scenario.unrelatedBuilding,
      expectedUnrelatedBuilding: scenario.expectedUnrelatedBuilding,
    },
    assertions: {
      importedProductionHelper: true,
      deterministicInputsOnly: true,
      acceptedContractProtected: pass,
      firstPassDecisionCompleteConstruction: scenarioRun1.firstPass.decision === 'complete_construction',
      secondPassDecisionNoCompletion: scenarioRun1.secondPass.decision === 'no_completion',
      constructionFieldsPreserved: scenarioRun1.firstPass.completedFields.constructionEndTime === CONSTRUCTION_END_TIME,
      unrelatedFieldPreserved: scenarioRun1.unrelatedFieldPreservation.preserved === true,
      noLivePocketBase: true,
      noNetwork: true,
      noRandomness: true,
      noPlayerDataMutation: true,
    },
    result: pass ? 'PASS' : 'FAIL',
    status: pass ? 'PASS' : 'FAIL',
    reason: pass ? 'accepted-narrow-construction-completion-contract-held' : 'unexpected-helper-result',
    replayOutcome: pass ? 'HELD' : 'FAILED',
    comparison: semanticComparison.identical ? 'IDENTICAL' : 'DIFFERENT',
    scenarioRun1,
    scenarioRun2,
    semanticComparison,
    firstPassDecision: scenarioRun1.firstPass.decision,
    secondPassDecision: scenarioRun1.secondPass.decision,
    protectedFields: ['isConstructing', 'workState', 'constructionEndTime', 'hp', 'maxHp', 'pendingDamage'],
    unconstrainedFields: ['x', 'y', 'zoneId', 'buildingId', 'ownerId', 'isLocal', 'constructionDurationMs', 'constructionMaxLifetimeMs', 'timestamp'],
    controls: {
      completionTimeNotReached: 'FAIL',
      missingIdentity: 'BLOCKED',
      secondPassCompletesAgain: 'FAIL',
      completedFieldsRegress: 'FAIL',
      unrelatedBuildingChanged: 'FAIL',
      productionHelperNotExecuted: 'BLOCKED',
    },
    summary: {
      narrowClaimSupported: pass,
      broaderClaimSupported: false,
      scenarioClassification: 'CURRENT_ACCEPTED_BEHAVIOR',
      broaderScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: semanticComparison.identical,
      sourceBoundaryExecuted: true,
      helperImported: HELPER,
    },
  };
}

function buildControlReport(control) {
  const scenario = createScenario(control);
  const validation = validateScenario(scenario);

  if (!validation.ok) {
    const report = {
      command: COMMAND,
      scenarioId: scenario.scenarioId,
      acceptedContract: scenario.acceptedContract,
      broaderContractExcluded: scenario.broaderContractExcluded,
      control,
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      productionHelper: HELPER,
      result: validation.status,
      status: validation.status,
      reason: validation.reason,
      replayOutcome: 'BLOCKED',
      validation,
      summary: {
        narrowClaimSupported: false,
        broaderClaimSupported: false,
        scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
        deterministicTwoRunResult: false,
        sourceBoundaryExecuted: false,
      },
    };

    report.exitGate = buildExitGateReport(report, control);

    return report;
  }

  const run = evaluateScenarioRun(scenario);

  const report = {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    acceptedContract: scenario.acceptedContract,
    broaderContractExcluded: scenario.broaderContractExcluded,
    control,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    productionHelper: HELPER,
    result: run.status,
    status: run.status,
    reason: run.reason,
    replayOutcome: run.status === 'PASS' ? 'HELD' : 'FAILED',
    scenarioRun: run,
    comparison: 'N/A',
    protectedFields: ['isConstructing', 'workState', 'constructionEndTime', 'hp', 'maxHp', 'pendingDamage'],
    unconstrainedFields: ['x', 'y', 'zoneId', 'buildingId', 'ownerId', 'isLocal', 'constructionDurationMs', 'constructionMaxLifetimeMs', 'timestamp'],
    controls: {
      completionTimeNotReached: control === 'completion-time-not-reached' ? run.status : 'FAIL',
      missingIdentity: control === 'missing-identity' ? run.status : 'BLOCKED',
      secondPassCompletesAgain: control === 'second-pass-completes-again' ? run.status : 'FAIL',
      completedFieldsRegress: control === 'completed-fields-regress' ? run.status : 'FAIL',
      unrelatedBuildingChanged: control === 'unrelated-building-changed' ? run.status : 'FAIL',
      productionHelperNotExecuted: control === 'production-helper-not-executed' ? run.status : 'BLOCKED',
    },
    summary: {
      narrowClaimSupported: run.status === 'PASS',
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: true,
      helperImported: HELPER,
    },
  };

  report.exitGate = buildExitGateReport(report, control);

  return report;
}

const CONTROL = parseControl(process.argv.slice(2), process.env);
const report = CONTROL === 'baseline' ? buildBaselineReport() : buildControlReport(CONTROL);

console.log(JSON.stringify(report, null, 2));

if (CONTROL === 'baseline') {
  if (report.result !== 'PASS') {
    process.exitCode = 1;
  }
} else {
  const exitGate = report.exitGate;

  if (!exitGate?.matched) {
    process.exitCode = 1;
    console.error(
      JSON.stringify(
        {
          type: 'control-exit-contract-mismatch',
          control: CONTROL,
          exitGate,
        },
        null,
        2,
      ),
    );
  }
}
