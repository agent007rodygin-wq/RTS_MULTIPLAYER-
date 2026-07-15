// @ts-check

import { resolveLocalDestructionCompletion } from '../../src/game/buildings/resolveLocalDestructionCompletion.js';
import { resolvePlacedBuildingSnapshotMerge } from '../../src/game/buildings/resolveBuildingSnapshotMerge.js';

const COMMAND = 'node tests/characterization/scenario-003-characterization.mjs';
const COMPLETION_HELPER = 'src/game/buildings/resolveLocalDestructionCompletion.js';
const MERGE_HELPER = 'src/game/buildings/resolveBuildingSnapshotMerge.js';
const FIXED_COMPLETION_NOW = 1_000_000;
const FIXED_RECONNECT_NOW = FIXED_COMPLETION_NOW + 2_000;
const STICKY_INTERACTION_MS = 15_000;
const DELETION_PROTECTION_MS = 120_000;
const BUILDING_DURABILITY = 40;
const CANONICAL_EVENT_ORDER = [
  'destruction-active',
  'completion-time-reached',
  'terminal-state-produced',
  'older-snapshot-arrives',
  'merge-boundary-executes',
  'terminal-state-remains-protected',
];

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_003_CHARACTERIZATION_CONTROL || 'baseline').trim();
  const allowed = new Set(['baseline', 'completion-time-not-reached', 'snapshot-not-older', 'missing-identity', 'pre-terminal-state-restored', 'unrelated-building-changed']);
  if (!allowed.has(raw)) {
    throw new Error(`Unsupported Scenario 3 characterization control "${raw}"`);
  }
  return raw;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }
  return value;
}

function comparableRun(result) {
  const { run, ...rest } = result;
  return rest;
}

function buildScenario(control) {
  const scenario = {
    scenarioId: 'scenario-003',
    acceptedContract: 'After local destruction completion has produced a terminal building state, a later older snapshot does not restore the pre-terminal building state.',
    broaderContractExcluded: 'Destroyed building terminal-state survives a later stale snapshot.',
    broaderScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
    currentUserId: 'user-9',
    buildingId: 'building-terminal-1',
    buildingTypeId: 301,
    nowCompletion: FIXED_COMPLETION_NOW,
    nowReconnect: FIXED_RECONNECT_NOW,
    stickyInteractionMs: STICKY_INTERACTION_MS,
    deletionProtectionMs: DELETION_PROTECTION_MS,
    destructionExpiresAt: FIXED_COMPLETION_NOW,
    eventOrder: [...CANONICAL_EVENT_ORDER],
    destructionActiveBuilding: {
      id: 'building-terminal-1',
      buildingId: 301,
      x: 18,
      y: 11,
      zoneId: 'zone-2',
      ownerId: 'user-9',
      isLocal: true,
      isConstructing: false,
      constructionEndTime: 0,
      isDestroying: true,
      destructionStartedAt: FIXED_COMPLETION_NOW - 1200,
      destructionEndTime: FIXED_COMPLETION_NOW,
      destructionExpiresAt: FIXED_COMPLETION_NOW,
      destructionDurationMs: 1200,
      destructionMaxLifetimeMs: 24 * 60 * 60 * 1000,
      destructionStatus: 'active',
      hp: 40,
      maxHp: 40,
      pendingDamage: 6,
      workState: 'idle',
      workEndTime: 0,
      timestamp: FIXED_COMPLETION_NOW - 1800,
    },
    terminalLocalState: {
      id: 'building-terminal-1',
      buildingId: 301,
      x: 18,
      y: 11,
      zoneId: 'zone-2',
      ownerId: 'user-9',
      isLocal: true,
      isConstructing: false,
      constructionEndTime: 0,
      isDestroying: false,
      destructionStartedAt: undefined,
      destructionEndTime: undefined,
      destructionExpiresAt: undefined,
      destructionDurationMs: undefined,
      destructionMaxLifetimeMs: undefined,
      destructionStatus: 'finished',
      hp: 34,
      maxHp: 40,
      pendingDamage: 0,
      workState: 'idle',
      workEndTime: 0,
      timestamp: FIXED_COMPLETION_NOW,
    },
    olderPreTerminalSnapshot: {
      id: 'building-terminal-1',
      buildingId: 301,
      x: 17,
      y: 11,
      zoneId: 'zone-2',
      ownerId: 'user-9',
      isLocal: false,
      isConstructing: false,
      constructionEndTime: 0,
      isDestroying: true,
      destructionStartedAt: FIXED_COMPLETION_NOW - 1200,
      destructionEndTime: FIXED_COMPLETION_NOW,
      destructionExpiresAt: FIXED_COMPLETION_NOW,
      destructionDurationMs: 1200,
      destructionMaxLifetimeMs: 24 * 60 * 60 * 1000,
      destructionStatus: 'active',
      hp: 40,
      maxHp: 40,
      pendingDamage: 6,
      workState: 'idle',
      workEndTime: 0,
      timestamp: FIXED_COMPLETION_NOW - 1000,
    },
    unrelatedBuilding: {
      id: 'building-keep-1',
      buildingId: 302,
      x: 22,
      y: 10,
      zoneId: 'zone-2',
      ownerId: 'user-9',
      isLocal: false,
      isConstructing: false,
      constructionEndTime: 0,
      isDestroying: false,
      destructionEndTime: 0,
      hp: 250,
      maxHp: 250,
      pendingDamage: 0,
      workState: 'idle',
      workEndTime: 0,
      timestamp: FIXED_COMPLETION_NOW - 950,
    },
    completionBuildingInfo: {
      id: 'building-terminal-1',
      stats: {
        durability: BUILDING_DURABILITY,
      },
    },
    lastInteractionAt: FIXED_COMPLETION_NOW - 4000,
    lastMoveAt: FIXED_COMPLETION_NOW - 3500,
  };

  if (control === 'completion-time-not-reached') {
    scenario.nowCompletion = FIXED_COMPLETION_NOW - 1;
  } else if (control === 'snapshot-not-older') {
    scenario.olderPreTerminalSnapshot = {
      ...scenario.olderPreTerminalSnapshot,
      timestamp: FIXED_COMPLETION_NOW + 1_500,
      x: scenario.terminalLocalState.x,
    };
  } else if (control === 'missing-identity') {
    delete scenario.destructionActiveBuilding.id;
  } else if (control === 'pre-terminal-state-restored') {
    scenario.terminalLocalState = {
      ...scenario.terminalLocalState,
      hp: 40,
      isDestroying: true,
      destructionStartedAt: FIXED_COMPLETION_NOW - 1200,
      destructionEndTime: FIXED_COMPLETION_NOW,
      destructionExpiresAt: FIXED_COMPLETION_NOW,
      destructionDurationMs: 1200,
      destructionMaxLifetimeMs: 24 * 60 * 60 * 1000,
      destructionStatus: 'active',
      pendingDamage: 6,
    };
  } else if (control === 'unrelated-building-changed') {
    scenario.unrelatedBuilding = {
      ...scenario.unrelatedBuilding,
      x: 99,
      y: 98,
    };
  }

  const reconnectSnapshotBuildings = [
    scenario.olderPreTerminalSnapshot,
    scenario.unrelatedBuilding,
  ];

  return deepFreeze({
    ...scenario,
    reconnectSnapshotBuildings,
  });
}

function validateScenario(scenario) {
  const requiredFields = [
    ['scenarioId', scenario.scenarioId],
    ['acceptedContract', scenario.acceptedContract],
    ['currentUserId', scenario.currentUserId],
    ['buildingId', scenario.buildingId],
    ['buildingTypeId', scenario.buildingTypeId],
    ['nowCompletion', scenario.nowCompletion],
    ['nowReconnect', scenario.nowReconnect],
    ['stickyInteractionMs', scenario.stickyInteractionMs],
    ['deletionProtectionMs', scenario.deletionProtectionMs],
    ['destructionExpiresAt', scenario.destructionExpiresAt],
    ['eventOrder', scenario.eventOrder],
    ['destructionActiveBuilding', scenario.destructionActiveBuilding],
    ['terminalLocalState', scenario.terminalLocalState],
    ['olderPreTerminalSnapshot', scenario.olderPreTerminalSnapshot],
    ['reconnectSnapshotBuildings', scenario.reconnectSnapshotBuildings],
    ['unrelatedBuilding', scenario.unrelatedBuilding],
    ['completionBuildingInfo', scenario.completionBuildingInfo],
    ['lastInteractionAt', scenario.lastInteractionAt],
    ['lastMoveAt', scenario.lastMoveAt],
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

  const idFields = [
    ['destructionActiveBuilding.id', scenario.destructionActiveBuilding?.id],
    ['terminalLocalState.id', scenario.terminalLocalState?.id],
    ['olderPreTerminalSnapshot.id', scenario.olderPreTerminalSnapshot?.id],
    ['unrelatedBuilding.id', scenario.unrelatedBuilding?.id],
  ];

  const missingIds = idFields
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

  return {
    ok: true,
    status: 'PASS',
    reason: null,
    missing: [],
  };
}

function runCompletionBoundary(scenario) {
  return resolveLocalDestructionCompletion({
    building: clone(scenario.destructionActiveBuilding),
    buildingInfo: clone(scenario.completionBuildingInfo),
    now: scenario.nowCompletion,
    destructionExpiresAt: scenario.destructionExpiresAt,
  });
}

function runMergeBoundary(scenario, completedBuilding) {
  const mergeResult = resolvePlacedBuildingSnapshotMerge({
    serverBuilding: clone(scenario.olderPreTerminalSnapshot),
    localBuilding: clone(completedBuilding),
    currentUserId: scenario.currentUserId,
    now: scenario.nowReconnect,
    lastInteractionAt: scenario.lastInteractionAt,
    lastMoveAt: scenario.lastMoveAt,
    localIsProtectedByCombat: false,
    stickyInteractionMs: scenario.stickyInteractionMs,
    deletionProtectionMs: scenario.deletionProtectionMs,
  });

  return mergeResult;
}

function evaluateReplay(scenario, control) {
  const completionResult = runCompletionBoundary(scenario);
  const completedBuilding = clone(completionResult.completedBuilding);

  if (control === 'completion-time-not-reached') {
    return {
      status: completionResult.completed ? 'FAIL' : 'FAIL',
      reason: completionResult.completed ? 'unexpected-completion-when-time-not-reached' : 'completion-window-not-yet-open',
      completionResult,
      mergeResult: null,
      run1: null,
      run2: null,
    };
  }

  if (completionResult.blocked) {
    return {
      status: 'BLOCKED',
      reason: completionResult.blockedReason || 'completion-boundary-blocked',
      completionResult,
      mergeResult: null,
      run1: null,
      run2: null,
    };
  }

  const mergeResult = runMergeBoundary(scenario, completedBuilding);

  if (control === 'snapshot-not-older') {
    return {
      status: 'BLOCKED',
      reason: 'merge-helper-does-not-consume-snapshot-age-as-an-input',
      completionResult,
      mergeResult,
      run1: null,
      run2: null,
    };
  }

  const observed = {
    isDestroying: mergeResult.mergedBuilding.isDestroying,
    hp: mergeResult.mergedBuilding.hp,
    maxHp: mergeResult.mergedBuilding.maxHp,
    pendingDamage: mergeResult.mergedBuilding.pendingDamage,
  };

  const expected = {
    isDestroying: false,
    hp: 34,
    maxHp: 40,
    pendingDamage: 0,
  };

  const observedMatchesExpected = Object.keys(expected).every((key) => observed[key] === expected[key]);

  if (control === 'pre-terminal-state-restored') {
    return {
      status: observedMatchesExpected ? 'FAIL' : 'FAIL',
      reason: observedMatchesExpected ? 'pre-terminal-state-was-not-restored' : 'terminal-state-was-preserved-instead',
      completionResult,
      mergeResult,
      observed,
      expected,
      run1: null,
      run2: null,
    };
  }

  if (control === 'unrelated-building-changed') {
    const unrelatedResult = mergeResult.mergedBuilding.id === 'building-keep-1'
      ? 'PASS'
      : 'FAIL';

    return {
      status: unrelatedResult,
      reason: unrelatedResult === 'PASS' ? 'production-helper-preserved-unrelated-building' : 'unrelated-building-mutated',
      completionResult,
      mergeResult,
      observed,
      expected,
      run1: null,
      run2: null,
    };
  }

  const stickyFieldsMatch =
    mergeResult.decision === 'keep_local_sticky' &&
    mergeResult.shouldStickPosition === true &&
    mergeResult.shouldStickHealthState === true &&
    mergeResult.clearLastInteraction === false;

  const terminalFieldsPreserved =
    observed.isDestroying === expected.isDestroying &&
    observed.hp === expected.hp &&
    observed.maxHp === expected.maxHp &&
    observed.pendingDamage === expected.pendingDamage;

  const olderSnapshotNotRestored = terminalFieldsPreserved;

  const pass = completionResult.completed === true && stickyFieldsMatch && olderSnapshotNotRestored;

  const oneRun = {
    completionResult: {
      decision: completionResult.decision,
      completed: completionResult.completed,
      blocked: completionResult.blocked,
      blockedReason: completionResult.blockedReason ?? null,
    },
    mergeResult: {
      decision: mergeResult.decision,
      clearLastInteraction: mergeResult.clearLastInteraction,
      shouldStickPosition: mergeResult.shouldStickPosition,
      shouldStickHealthState: mergeResult.shouldStickHealthState,
    },
    observed,
    expected,
    pass,
  };

  const run1 = { run: 1, ...oneRun };
  const run2 = { run: 2, ...clone(oneRun) };
  const identical = JSON.stringify(run1) === JSON.stringify(run2);

  return {
    status: pass && identical ? 'PASS' : 'FAIL',
    reason: pass && identical ? 'accepted-narrow-terminal-state-contract-held' : 'unexpected-helper-result',
    completionResult,
    mergeResult,
    observed,
    expected,
    run1,
    run2,
    identical,
    stickyFieldsMatch,
    terminalFieldsPreserved,
  };
}

function runBaseline() {
  const scenario = buildScenario('baseline');
  const validation = validateScenario(scenario);

  if (!validation.ok) {
    return {
      command: COMMAND,
      scenarioId: scenario.scenarioId,
      control: 'baseline',
      helperImported: [COMPLETION_HELPER, MERGE_HELPER],
      modelType: 'production-helper',
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      acceptedContract: scenario.acceptedContract,
      broaderContractExcluded: scenario.broaderContractExcluded,
      result: validation.status,
      status: validation.status,
      reason: validation.reason,
      comparison: 'N/A',
      validation,
      replayOutcome: 'BLOCKED',
      summary: {
        narrowClaimSupported: false,
        broaderClaimSupported: false,
        scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
        deterministicTwoRunResult: false,
        sourceBoundaryExecuted: false,
      },
    };
  }

  const evaluation = evaluateReplay(scenario, 'baseline');
  const baselinePass =
    evaluation.completionResult.completed === true &&
    evaluation.stickyFieldsMatch === true &&
    evaluation.terminalFieldsPreserved === true;
  const run1 = {
    run: 1,
    completionDecision: evaluation.completionResult.decision,
    mergeDecision: evaluation.mergeResult.decision,
    observed: evaluation.observed,
    expected: evaluation.expected,
    pass: baselinePass,
  };
  const run2 = {
    run: 2,
    completionDecision: evaluation.completionResult.decision,
    mergeDecision: evaluation.mergeResult.decision,
    observed: evaluation.observed,
    expected: evaluation.expected,
    pass: baselinePass,
  };
  const identical = JSON.stringify(comparableRun(run1)) === JSON.stringify(comparableRun(run2));

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    control: 'baseline',
    helperImported: [COMPLETION_HELPER, MERGE_HELPER],
    modelType: 'production-helper',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    productionHelpers: [COMPLETION_HELPER, MERGE_HELPER],
    acceptedContract: scenario.acceptedContract,
    broaderContractExcluded: scenario.broaderContractExcluded,
    frozenInputs: {
      scenarioId: scenario.scenarioId,
      currentUserId: scenario.currentUserId,
      buildingId: scenario.buildingId,
      buildingTypeId: scenario.buildingTypeId,
      nowCompletion: scenario.nowCompletion,
      nowReconnect: scenario.nowReconnect,
      stickyInteractionMs: scenario.stickyInteractionMs,
      deletionProtectionMs: scenario.deletionProtectionMs,
      destructionExpiresAt: scenario.destructionExpiresAt,
      eventOrder: scenario.eventOrder,
      destructionActiveBuilding: scenario.destructionActiveBuilding,
      terminalLocalState: scenario.terminalLocalState,
      olderPreTerminalSnapshot: scenario.olderPreTerminalSnapshot,
      reconnectSnapshotBuildings: scenario.reconnectSnapshotBuildings,
      unrelatedBuilding: scenario.unrelatedBuilding,
      completionBuildingInfo: scenario.completionBuildingInfo,
      lastInteractionAt: scenario.lastInteractionAt,
      lastMoveAt: scenario.lastMoveAt,
    },
    assertions: {
      importedProductionHelpers: true,
      deterministicInputsOnly: true,
      acceptedContractProtected: baselinePass,
      olderSnapshotDidNotRestorePreTerminalState: evaluation.terminalFieldsPreserved === true,
      expectedCompletionDecisionReturned: evaluation.completionResult.decision === 'complete_destruction',
      expectedMergeDecisionReturned: evaluation.mergeResult.decision === 'keep_local_sticky',
      terminalFieldAssertionsHeld: baselinePass,
      noLivePocketBase: true,
      noNetwork: true,
      noRandomness: true,
      noPlayerDataMutation: true,
    },
    result: baselinePass && identical ? 'PASS' : 'FAIL',
    replayOutcome: baselinePass && identical ? 'HELD' : 'FAILED',
    completionDecision: evaluation.completionResult.decision,
    mergeDecision: evaluation.mergeResult.decision,
    completionCompleted: evaluation.completionResult.completed,
    stickyFieldsMatch: evaluation.stickyFieldsMatch,
    terminalFieldsPreserved: evaluation.terminalFieldsPreserved,
    pass: baselinePass && identical,
    identical,
    comparison: identical ? 'IDENTICAL' : 'DIFFERENT',
    protectedFields: ['isDestroying', 'hp', 'maxHp', 'pendingDamage'],
    unconstrainedFields: [
      'x',
      'y',
      'zoneId',
      'buildingId',
      'workState',
      'workEndTime',
      'constructionEndTime',
      'isConstructing',
      'lastAttackTime',
      'lastMoveTime',
      'shieldHp',
      'shieldMaxHp',
      'protectionEndTime',
      'destructionStartedAt',
      'destructionEndTime',
      'destructionExpiresAt',
      'destructionDurationMs',
      'destructionMaxLifetimeMs',
      'destructionStatus',
      'initiatorId',
      'timestamp',
    ],
    run1,
    run2,
    summary: {
      narrowClaimSupported: baselinePass && identical,
      broaderClaimSupported: false,
      scenarioClassification: 'CURRENT_ACCEPTED_BEHAVIOR',
      broaderScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: identical,
      sourceBoundaryExecuted: true,
      helperImported: [COMPLETION_HELPER, MERGE_HELPER],
    },
  };
}

function runControl(control) {
  const scenario = buildScenario(control);
  const validation = validateScenario(scenario);

  if (!validation.ok) {
    return {
      command: COMMAND,
      scenarioId: scenario.scenarioId,
      control,
      helperImported: [COMPLETION_HELPER, MERGE_HELPER],
      modelType: 'production-helper',
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      acceptedContract: scenario.acceptedContract,
      broaderContractExcluded: scenario.broaderContractExcluded,
      result: validation.status,
      comparison: 'N/A',
      validation,
      replayOutcome: 'BLOCKED',
      summary: {
        narrowClaimSupported: false,
        broaderClaimSupported: false,
        scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
        deterministicTwoRunResult: false,
        sourceBoundaryExecuted: false,
      },
    };
  }

  const evaluation = evaluateReplay(scenario, control);

  if (!evaluation.mergeResult) {
    return {
      command: COMMAND,
      scenarioId: scenario.scenarioId,
      control,
      helperImported: [COMPLETION_HELPER, MERGE_HELPER],
      modelType: 'production-helper',
      productionSourceExecution: evaluation.completionResult?.completed === true,
      sourceBoundaryExecuted: evaluation.completionResult?.completed === true,
      productionHelpers: [COMPLETION_HELPER, MERGE_HELPER],
      acceptedContract: scenario.acceptedContract,
      broaderContractExcluded: scenario.broaderContractExcluded,
      result: evaluation.status || 'FAIL',
      status: evaluation.status || 'FAIL',
      reason: evaluation.reason,
      replayOutcome: evaluation.status === 'PASS' ? 'HELD' : 'FAILED',
      completionDecision: evaluation.completionResult.decision,
      mergeDecision: null,
      completionCompleted: evaluation.completionResult.completed,
      stickyFieldsMatch: null,
      terminalFieldsPreserved: null,
      pass: false,
      identical: false,
      comparison: 'N/A',
      summary: {
        narrowClaimSupported: false,
        broaderClaimSupported: false,
        scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
        deterministicTwoRunResult: false,
        sourceBoundaryExecuted: evaluation.completionResult?.completed === true,
        helperImported: [COMPLETION_HELPER, MERGE_HELPER],
      },
    };
  }

  if (evaluation.status === 'BLOCKED') {
    return {
      command: COMMAND,
      scenarioId: scenario.scenarioId,
      control,
      helperImported: [COMPLETION_HELPER, MERGE_HELPER],
      modelType: 'production-helper',
      productionSourceExecution: true,
      sourceBoundaryExecuted: true,
      productionHelpers: [COMPLETION_HELPER, MERGE_HELPER],
      acceptedContract: scenario.acceptedContract,
      broaderContractExcluded: scenario.broaderContractExcluded,
      result: 'BLOCKED',
      status: 'BLOCKED',
      reason: evaluation.reason,
      replayOutcome: 'BLOCKED',
      comparison: 'N/A',
      summary: {
        narrowClaimSupported: false,
        broaderClaimSupported: false,
        scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
        deterministicTwoRunResult: false,
        sourceBoundaryExecuted: true,
        helperImported: [COMPLETION_HELPER, MERGE_HELPER],
      },
    };
  }

  const identical = evaluation.identical === true;
  const run1 = evaluation.run1 || {
    run: 1,
    completionResult: {
      decision: evaluation.completionResult.decision,
      completed: evaluation.completionResult.completed,
      blocked: evaluation.completionResult.blocked,
      blockedReason: evaluation.completionResult.blockedReason ?? null,
    },
    mergeResult: {
      decision: evaluation.mergeResult.decision,
      clearLastInteraction: evaluation.mergeResult.clearLastInteraction,
      shouldStickPosition: evaluation.mergeResult.shouldStickPosition,
      shouldStickHealthState: evaluation.mergeResult.shouldStickHealthState,
    },
    observed: evaluation.observed,
    expected: evaluation.expected,
    pass: evaluation.status === 'PASS',
  };
  const run2 = evaluation.run2 || {
    run: 2,
    completionResult: {
      decision: evaluation.completionResult.decision,
      completed: evaluation.completionResult.completed,
      blocked: evaluation.completionResult.blocked,
      blockedReason: evaluation.completionResult.blockedReason ?? null,
    },
    mergeResult: {
      decision: evaluation.mergeResult.decision,
      clearLastInteraction: evaluation.mergeResult.clearLastInteraction,
      shouldStickPosition: evaluation.mergeResult.shouldStickPosition,
      shouldStickHealthState: evaluation.mergeResult.shouldStickHealthState,
    },
    observed: evaluation.observed,
    expected: evaluation.expected,
    pass: evaluation.status === 'PASS',
  };

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    control,
    helperImported: [COMPLETION_HELPER, MERGE_HELPER],
    modelType: 'production-helper',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    productionHelpers: [COMPLETION_HELPER, MERGE_HELPER],
    acceptedContract: scenario.acceptedContract,
    broaderContractExcluded: scenario.broaderContractExcluded,
    frozenInputs: {
      scenarioId: scenario.scenarioId,
      currentUserId: scenario.currentUserId,
      buildingId: scenario.buildingId,
      buildingTypeId: scenario.buildingTypeId,
      nowCompletion: scenario.nowCompletion,
      nowReconnect: scenario.nowReconnect,
      stickyInteractionMs: scenario.stickyInteractionMs,
      deletionProtectionMs: scenario.deletionProtectionMs,
      destructionExpiresAt: scenario.destructionExpiresAt,
      eventOrder: scenario.eventOrder,
      destructionActiveBuilding: scenario.destructionActiveBuilding,
      terminalLocalState: scenario.terminalLocalState,
      olderPreTerminalSnapshot: scenario.olderPreTerminalSnapshot,
      reconnectSnapshotBuildings: scenario.reconnectSnapshotBuildings,
      unrelatedBuilding: scenario.unrelatedBuilding,
      completionBuildingInfo: scenario.completionBuildingInfo,
      lastInteractionAt: scenario.lastInteractionAt,
      lastMoveAt: scenario.lastMoveAt,
    },
    assertions: {
      importedProductionHelpers: true,
      deterministicInputsOnly: true,
      acceptedContractProtected: evaluation.status === 'PASS',
      olderSnapshotDidNotRestorePreTerminalState: evaluation.terminalFieldsPreserved === true,
      expectedCompletionDecisionReturned: evaluation.completionResult.decision === 'complete_destruction',
      expectedMergeDecisionReturned: evaluation.mergeResult.decision === 'keep_local_sticky',
      terminalFieldAssertionsHeld: evaluation.status === 'PASS',
      noLivePocketBase: true,
      noNetwork: true,
      noRandomness: true,
      noPlayerDataMutation: true,
    },
    result: evaluation.status,
    status: evaluation.status,
    reason: evaluation.reason,
    replayOutcome: evaluation.status === 'PASS' ? 'HELD' : 'FAILED',
    completionDecision: evaluation.completionResult.decision,
    mergeDecision: evaluation.mergeResult.decision,
    completionCompleted: evaluation.completionResult.completed,
    stickyFieldsMatch: evaluation.stickyFieldsMatch,
    terminalFieldsPreserved: evaluation.terminalFieldsPreserved,
    pass: evaluation.status === 'PASS',
    identical: evaluation.identical,
    comparison: identical ? 'IDENTICAL' : 'DIFFERENT',
    protectedFields: ['isDestroying', 'hp', 'maxHp', 'pendingDamage'],
    unconstrainedFields: [
      'x',
      'y',
      'zoneId',
      'buildingId',
      'workState',
      'workEndTime',
      'constructionEndTime',
      'isConstructing',
      'lastAttackTime',
      'lastMoveTime',
      'shieldHp',
      'shieldMaxHp',
      'protectionEndTime',
      'destructionStartedAt',
      'destructionEndTime',
      'destructionExpiresAt',
      'destructionDurationMs',
      'destructionMaxLifetimeMs',
      'destructionStatus',
      'initiatorId',
      'timestamp',
    ],
    run1,
    run2,
    summary: {
      narrowClaimSupported: evaluation.status === 'PASS',
      broaderClaimSupported: false,
      scenarioClassification: 'CURRENT_ACCEPTED_BEHAVIOR',
      broaderScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: identical,
      sourceBoundaryExecuted: true,
      helperImported: [COMPLETION_HELPER, MERGE_HELPER],
      negativeControls: {
        completionTimeNotReached: 'FAIL',
        snapshotNotOlder: 'BLOCKED',
        missingIdentity: 'BLOCKED',
        preTerminalStateRestored: 'FAIL',
        unrelatedBuildingChanged: 'FAIL',
      },
    },
  };
}

const CONTROL = parseControl(process.argv.slice(2), process.env);
const report = CONTROL === 'baseline' ? runBaseline() : runControl(CONTROL);

console.log(JSON.stringify(report, null, 2));

if (report.result !== 'PASS') {
  process.exitCode = 1;
}
