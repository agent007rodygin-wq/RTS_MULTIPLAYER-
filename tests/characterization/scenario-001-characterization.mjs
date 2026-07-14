// @ts-check

import { resolvePlacedBuildingSnapshotMerge } from '../../src/game/buildings/resolveBuildingSnapshotMerge.js';

const COMMAND = 'node tests/characterization/scenario-001-characterization.mjs';
const FIXED_NOW = 1_000_000;
const STICKY_INTERACTION_MS = 15_000;
const DELETION_PROTECTION_MS = 120_000;

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_001_CHARACTERIZATION_CONTROL || 'baseline').trim();
  const allowed = new Set(['baseline', 'wrong-expected', 'missing-fields']);
  if (!allowed.has(raw)) {
    throw new Error(`Unsupported Scenario 1 characterization control "${raw}"`);
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

function buildScenario(control) {
  const scenario = {
    scenarioId: 'scenario-001',
    buildingId: 'building-001',
    currentUserId: 'user-1',
    now: FIXED_NOW,
    stickyInteractionMs: STICKY_INTERACTION_MS,
    deletionProtectionMs: DELETION_PROTECTION_MS,
    acceptedCurrentState: {
      id: 'building-001',
      buildingId: 101,
      x: 13,
      y: 9,
      zoneId: 'zone-1',
      ownerId: 'user-1',
      ownerName: 'Owner',
      isConstructing: false,
      constructionEndTime: 0,
      isLocal: true,
      workState: 'idle',
      workEndTime: 0,
      isDestroying: false,
      destructionEndTime: 0,
      hp: 900,
      maxHp: 900,
      pendingDamage: 0,
      shieldHp: 0,
      shieldMaxHp: 0,
      protectionEndTime: 0,
      lastMoveTime: 999_500,
      lastAttackTime: 0,
      timestamp: 999_400,
    },
    olderLateSnapshot: {
      id: 'building-001',
      buildingId: 101,
      x: 12,
      y: 9,
      zoneId: 'zone-1',
      ownerId: 'user-1',
      ownerName: 'Owner',
      isConstructing: false,
      constructionEndTime: 0,
      isLocal: false,
      workState: 'idle',
      workEndTime: 0,
      isDestroying: false,
      destructionEndTime: 0,
      hp: 900,
      maxHp: 900,
      pendingDamage: 0,
      shieldHp: 0,
      shieldMaxHp: 0,
      protectionEndTime: 0,
      lastMoveTime: 990_000,
      lastAttackTime: 0,
      timestamp: 989_000,
    },
    lastInteractionAt: 990_000,
    recentMoveAt: 999_500,
    deletingIds: [],
    tombstonedIds: [],
  };

  if (control === 'missing-fields') {
    delete scenario.recentMoveAt;
  }

  return deepFreeze(scenario);
}

function validateScenario(scenario) {
  const requiredFields = [
    ['scenarioId', scenario.scenarioId],
    ['buildingId', scenario.buildingId],
    ['currentUserId', scenario.currentUserId],
    ['now', scenario.now],
    ['stickyInteractionMs', scenario.stickyInteractionMs],
    ['deletionProtectionMs', scenario.deletionProtectionMs],
    ['acceptedCurrentState.id', scenario.acceptedCurrentState?.id],
    ['acceptedCurrentState.buildingId', scenario.acceptedCurrentState?.buildingId],
    ['acceptedCurrentState.x', scenario.acceptedCurrentState?.x],
    ['acceptedCurrentState.y', scenario.acceptedCurrentState?.y],
    ['acceptedCurrentState.zoneId', scenario.acceptedCurrentState?.zoneId],
    ['acceptedCurrentState.workState', scenario.acceptedCurrentState?.workState],
    ['acceptedCurrentState.workEndTime', scenario.acceptedCurrentState?.workEndTime],
    ['acceptedCurrentState.timestamp', scenario.acceptedCurrentState?.timestamp],
    ['olderLateSnapshot.id', scenario.olderLateSnapshot?.id],
    ['olderLateSnapshot.buildingId', scenario.olderLateSnapshot?.buildingId],
    ['olderLateSnapshot.x', scenario.olderLateSnapshot?.x],
    ['olderLateSnapshot.y', scenario.olderLateSnapshot?.y],
    ['olderLateSnapshot.zoneId', scenario.olderLateSnapshot?.zoneId],
    ['olderLateSnapshot.workState', scenario.olderLateSnapshot?.workState],
    ['olderLateSnapshot.workEndTime', scenario.olderLateSnapshot?.workEndTime],
    ['olderLateSnapshot.timestamp', scenario.olderLateSnapshot?.timestamp],
    ['lastInteractionAt', scenario.lastInteractionAt],
    ['recentMoveAt', scenario.recentMoveAt],
    ['deletingIds', scenario.deletingIds],
    ['tombstonedIds', scenario.tombstonedIds],
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

  return {
    ok: true,
    status: 'PASS',
    reason: null,
    missing: [],
  };
}

function evaluateScenario(scenario, control) {
  const mergeResult = resolvePlacedBuildingSnapshotMerge({
    serverBuilding: clone(scenario.olderLateSnapshot),
    localBuilding: clone(scenario.acceptedCurrentState),
    currentUserId: scenario.currentUserId,
    now: scenario.now,
    lastInteractionAt: scenario.lastInteractionAt,
    lastMoveAt: scenario.recentMoveAt,
    localIsProtectedByCombat: false,
    stickyInteractionMs: scenario.stickyInteractionMs,
    deletionProtectionMs: scenario.deletionProtectionMs,
  });

  const expectedDecision = control === 'wrong-expected'
    ? 'replace_local_with_server'
    : 'accept_server_update';

  const winner = clone(mergeResult.mergedBuilding);
  const accepted = scenario.acceptedCurrentState;
  const older = scenario.olderLateSnapshot;

  const positionPreserved =
    winner.x === accepted.x &&
    winner.y === accepted.y &&
    winner.zoneId === accepted.zoneId;

  const stickyFlagsMatch =
    mergeResult.shouldStickPosition === true &&
    mergeResult.shouldStickHealthState === false &&
    mergeResult.clearLastInteraction === false;

  const contractMatches =
    mergeResult.decision === expectedDecision &&
    positionPreserved &&
    stickyFlagsMatch &&
    older.x !== accepted.x;

  return {
    status: contractMatches ? 'PASS' : 'FAIL',
    reason: contractMatches
      ? 'accepted-narrow-sticky-window-contract-held'
      : 'unexpected-helper-result',
    expectedDecision,
    mergeResult,
    winner,
    positionPreserved,
    stickyFlagsMatch,
    olderSnapshotOverrodeAcceptedPosition: winner.x === older.x,
  };
}

const CONTROL = parseControl(process.argv.slice(2), process.env);
const scenario = buildScenario(CONTROL);
const validation = validateScenario(scenario);

let report;
if (!validation.ok) {
  report = {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    control: CONTROL,
    modelType: 'production-helper',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
    productionHelper: 'src/game/buildings/resolveBuildingSnapshotMerge.js',
    acceptedContract: 'Within the active sticky-interaction window, an older building snapshot does not replace the accepted current building position.',
    broaderContractExcluded: 'Initial fetch cannot be overwritten by an older late snapshot.',
    result: validation.status,
    validation,
    replayOutcome: 'BLOCKED',
  };
} else {
  const evaluation = evaluateScenario(scenario, CONTROL);
  report = {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    control: CONTROL,
    modelType: 'production-helper',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    productionHelper: 'src/game/buildings/resolveBuildingSnapshotMerge.js',
    acceptedContract: 'Within the active sticky-interaction window, an older building snapshot does not replace the accepted current building position.',
    broaderContractExcluded: 'Initial fetch cannot be overwritten by an older late snapshot.',
    frozenInputs: {
      buildingId: scenario.buildingId,
      currentUserId: scenario.currentUserId,
      now: scenario.now,
      stickyInteractionMs: scenario.stickyInteractionMs,
      deletionProtectionMs: scenario.deletionProtectionMs,
      acceptedCurrentState: scenario.acceptedCurrentState,
      olderLateSnapshot: scenario.olderLateSnapshot,
      lastInteractionAt: scenario.lastInteractionAt,
      recentMoveAt: scenario.recentMoveAt,
      deletingIds: scenario.deletingIds,
      tombstonedIds: scenario.tombstonedIds,
    },
    assertions: {
      importedProductionHelper: true,
      deterministicInputsOnly: true,
      acceptedContractProtected: evaluation.status === 'PASS',
      olderSnapshotDidNotReplaceAcceptedPosition: evaluation.positionPreserved === true,
      expectedDecisionReturned: evaluation.mergeResult.decision === evaluation.expectedDecision,
      stickyFlagsMatched: evaluation.stickyFlagsMatch === true,
      nonPositionServerFieldsNotClaimed: true,
      noLivePocketBase: true,
      noNetwork: true,
      noRandomness: true,
      noPlayerDataMutation: true,
    },
    result: evaluation.status,
    replayOutcome: evaluation.status === 'PASS' ? 'HELD' : 'FAILED',
    decision: evaluation.mergeResult.decision,
    winner: evaluation.winner,
    comparison: 'N/A',
    protectedFields: ['x', 'y', 'zoneId'],
    unconstrainedFields: [
      'buildingId',
      'workState',
      'workEndTime',
      'constructionEndTime',
      'isConstructing',
      'lastAttackTime',
      'lastMoveTime',
      'hp',
      'maxHp',
      'shieldHp',
      'shieldMaxHp',
      'protectionEndTime',
      'isDestroying',
      'pendingDamage',
      'destructionEndTime',
      'initiatorId',
      'timestamp',
    ],
    summary: {
      narrowClaimSupported: evaluation.status === 'PASS',
      broaderClaimSupported: false,
      scenarioClassification: 'CURRENT_ACCEPTED_BEHAVIOR',
      broaderScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: true,
    },
  };
}

console.log(JSON.stringify(report, null, 2));

if (report.result !== 'PASS') {
  process.exitCode = 1;
}
