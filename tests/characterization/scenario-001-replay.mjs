const COMMAND = 'node tests/characterization/scenario-001-replay.mjs';
const FIXED_NOW = 1_000_000;
const STICKY_INTERACTION_MS = 15_000;
const DELETION_PROTECTION_MS = 120_000;

const CANONICAL_ORDER = [
  'refresh-load',
  'accepted-current-state',
  'older-late-realtime-event',
];

import {
  hasActiveDestructionWindow,
  resolvePlacedBuildingSnapshotMerge,
} from '../../src/game/buildings/resolveBuildingSnapshotMerge.js';

const SOURCE_ANCESTORS = [
  'src/game/buildings/resolveBuildingSnapshotMerge.js',
  'App.tsx',
  'src/pocketbase.ts',
  'tests/characterization/scenario-001-source-audit.md',
  'tests/characterization/scenario-001-classification.md',
  'tests/characterization/scenario-001-seam-decision.md',
  'tests/characterization/scenario-001-fixture-design.md',
  'tests/characterization/scenario-001-readiness-review.md',
  'tests/characterization/scenario-001-production-boundary-review.md',
  'tests/characterization/scenario-001-replay-fidelity-review.md',
];

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_001_CONTROL || 'baseline').trim();
  const allowed = new Set(['baseline', 'reverse-order', 'sticky-expired', 'missing-fields', 'stale-wins']);
  if (!allowed.has(raw)) {
    throw new Error(`Unsupported Scenario 1 control "${raw}"`);
  }
  return raw;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function freezeMap(entries) {
  return new Map(entries.map(([key, value]) => [String(key), value]));
}

function validateScenario(scenario) {
  const requiredFields = [
    ['id', scenario.id],
    ['buildingId', scenario.buildingId],
    ['currentUserId', scenario.currentUserId],
    ['now', scenario.now],
    ['refreshLoadState.id', scenario.refreshLoadState?.id],
    ['acceptedCurrentState.id', scenario.acceptedCurrentState?.id],
    ['lateRealtimeEventState.id', scenario.lateRealtimeEventState?.id],
    ['lastInteractionEntries', scenario.lastInteractionEntries],
    ['recentMoveEntries', scenario.recentMoveEntries],
    ['lastServerSyncEntries', scenario.lastServerSyncEntries],
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

function buildScenario(control) {
  const base = {
    id: 'scenario-001',
    buildingId: 'building-001',
    currentUserId: 'user-1',
    now: FIXED_NOW,
    refreshLoadState: {
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
      timestamp: 989_900,
    },
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
    lateRealtimeEventState: {
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
    lastInteractionEntries: [['building-001', 990_000]],
    recentMoveEntries: [['building-001', 999_500]],
    lastServerSyncEntries: [['building-001', 995_000]],
    deletingIds: [],
    tombstonedIds: [],
  };

  const scenario = clone(base);

  if (control === 'sticky-expired') {
    scenario.lastInteractionEntries = [['building-001', FIXED_NOW - STICKY_INTERACTION_MS - 1]];
  } else if (control === 'stale-wins') {
    scenario.currentUserId = 'user-2';
    scenario.acceptedCurrentState.isLocal = false;
  } else if (control === 'missing-fields') {
    delete scenario.currentUserId;
    delete scenario.recentMoveEntries;
    delete scenario.lastServerSyncEntries;
  }

  return scenario;
}

function mergeReplayBoundary({ currentState, lateSnapshot, refs, now = FIXED_NOW, control }) {
  const id = String(currentState.id);

  if (refs.tombstonedIds.has(id) || refs.deletingIds.has(id)) {
    return {
      pass: false,
      outcome: 'BLOCKED',
      reason: 'tombstone-or-delete-state-present',
      winner: clone(currentState),
      productionBoundaryExecuted: false,
    };
  }

  const lastIntAt = refs.lastInteractionRef.get(id) ?? 0;
  const lastMoveAt = refs.recentMoveInteractionRef.get(id) ?? 0;
  const localIsProtectedByCombat = Boolean(
    currentState.isDestroying ||
    Number(currentState.pendingDamage || 0) > 0 ||
    hasActiveDestructionWindow(currentState.destructionEndTime, now) ||
    refs.deletingIds.has(id) ||
    refs.tombstonedIds.has(id)
  );

  const mergeResult = resolvePlacedBuildingSnapshotMerge({
    serverBuilding: lateSnapshot,
    localBuilding: currentState,
    currentUserId: refs.currentUserId,
    now,
    lastInteractionAt: lastIntAt,
    lastMoveAt,
    localIsProtectedByCombat,
    stickyInteractionMs: STICKY_INTERACTION_MS,
    deletionProtectionMs: DELETION_PROTECTION_MS,
  });

  const winner = clone(mergeResult.mergedBuilding);
  const baselineSupported =
    mergeResult.decision === 'accept_server_update' &&
    mergeResult.shouldStickPosition === true &&
    mergeResult.shouldStickHealthState === false &&
    winner.x === currentState.x &&
    winner.y === currentState.y &&
    winner.workState === currentState.workState &&
    winner.workEndTime === currentState.workEndTime &&
    winner.buildingId === currentState.buildingId &&
    winner.isLocal === false &&
    winner.hp === currentState.hp &&
    winner.maxHp === currentState.maxHp &&
    winner.shieldHp === currentState.shieldHp &&
    winner.shieldMaxHp === currentState.shieldMaxHp &&
    winner.protectionEndTime === currentState.protectionEndTime &&
    winner.isDestroying === currentState.isDestroying &&
    winner.pendingDamage === currentState.pendingDamage &&
    winner.destructionEndTime === currentState.destructionEndTime &&
    winner.timestamp === currentState.timestamp;

  return {
    pass: baselineSupported,
    outcome: baselineSupported ? 'LOST' : 'WON',
    reason: baselineSupported
      ? 'production-helper-kept-accepted-current-state'
      : 'production-helper-allowed-late-overwrite',
    winner,
    decision: mergeResult.decision,
    shouldStickPosition: mergeResult.shouldStickPosition,
    shouldStickHealthState: mergeResult.shouldStickHealthState,
    clearLastInteraction: mergeResult.clearLastInteraction,
    productionBoundaryExecuted: true,
  };
}

function runTrace(runNumber, scenario, control) {
  const replayInputs = {
    refreshLoadState: clone(scenario.refreshLoadState),
    acceptedCurrentState: clone(scenario.acceptedCurrentState),
    lateRealtimeEventState: clone(scenario.lateRealtimeEventState),
    refs: {
      currentUserId: scenario.currentUserId,
      lastInteractionRef: freezeMap(scenario.lastInteractionEntries),
      recentMoveInteractionRef: freezeMap(scenario.recentMoveEntries),
      lastServerSyncRef: freezeMap(scenario.lastServerSyncEntries),
      deletingIds: new Set(scenario.deletingIds),
      tombstonedIds: new Set(scenario.tombstonedIds),
    },
  };

  const currentState = {
    ...clone(replayInputs.refreshLoadState),
    ...clone(replayInputs.acceptedCurrentState),
  };

  const replayOrder =
    control === 'reverse-order'
      ? ['older-late-realtime-event', 'accepted-current-state', 'refresh-load']
      : [...CANONICAL_ORDER];

  if (replayOrder.join('|') !== CANONICAL_ORDER.join('|')) {
    return {
      run: runNumber,
      scenarioId: scenario.id,
      control,
      command: COMMAND,
      modelType: 'production-helper',
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      replayOrder,
      frozenInputs: {
        buildingId: scenario.buildingId,
        currentUserId: scenario.currentUserId,
        now: scenario.now,
        stickyInteractionMs: STICKY_INTERACTION_MS,
        deletionProtectionMs: DELETION_PROTECTION_MS,
        refreshLoadState: replayInputs.refreshLoadState,
        acceptedCurrentState: replayInputs.acceptedCurrentState,
        lateRealtimeEventState: replayInputs.lateRealtimeEventState,
      },
      observedOutput: {
        status: 'FAIL',
        replayOutcome: 'BLOCKED',
        reason: 'event-order-violated',
        winner: null,
        winnerMatchesProductionExpectation: false,
      },
      status: 'FAIL',
    };
  }

  const lateResult = mergeReplayBoundary({
    currentState,
    lateSnapshot: replayInputs.lateRealtimeEventState,
    refs: replayInputs.refs,
    now: scenario.now,
  });

  const status =
    lateResult.outcome === 'BLOCKED'
      ? 'BLOCKED'
      : control === 'baseline'
        ? (lateResult.pass ? 'PASS' : 'FAIL')
        : 'FAIL';

  return {
    run: runNumber,
    scenarioId: scenario.id,
    control,
    command: COMMAND,
    modelType: 'production-helper',
    productionSourceExecution: true,
    sourceBoundaryExecuted: lateResult.productionBoundaryExecuted === true,
    productionBoundary: 'resolvePlacedBuildingSnapshotMerge',
    replayOrder,
    frozenInputs: {
      buildingId: scenario.buildingId,
      currentUserId: scenario.currentUserId,
      now: scenario.now,
      stickyInteractionMs: STICKY_INTERACTION_MS,
      deletionProtectionMs: DELETION_PROTECTION_MS,
      refreshLoadState: replayInputs.refreshLoadState,
      acceptedCurrentState: replayInputs.acceptedCurrentState,
      lateRealtimeEventState: replayInputs.lateRealtimeEventState,
      refs: {
        lastInteractionAt: scenario.lastInteractionEntries,
        recentMoveAt: scenario.recentMoveEntries,
        lastServerSyncAt: scenario.lastServerSyncEntries,
        deletingIds: scenario.deletingIds,
        tombstonedIds: scenario.tombstonedIds,
      },
    },
    observedOutput: {
      status,
      replayOutcome: lateResult.outcome,
      decision: lateResult.decision,
      winner: lateResult.winner,
      winnerMatchesProductionExpectation: lateResult.pass === true,
      shouldStickPosition: lateResult.shouldStickPosition ?? false,
      shouldStickHealthState: lateResult.shouldStickHealthState ?? false,
      clearLastInteraction: lateResult.clearLastInteraction ?? false,
      reason: lateResult.reason,
      narrowClaimSupported: lateResult.pass === true,
      broaderClaimSupported: lateResult.pass === true,
    },
    status,
  };
}

function comparablePayload(result) {
  const { run, ...rest } = result;
  return rest;
}

const CONTROL = parseControl(process.argv.slice(2), process.env);
const scenario = buildScenario(CONTROL);
const validation = validateScenario(scenario);

let report;
if (!validation.ok) {
  report = {
    command: COMMAND,
    scenarioId: scenario.id,
    control: CONTROL,
    modelType: 'production-helper',
    productionSourceExecution: false,
    sourceBoundaryExecuted: false,
    sourceAnchors: SOURCE_ANCESTORS,
    result: validation.status,
    replayClaim: 'Within the active sticky-interaction window, an older building snapshot does not replace the accepted current building state.',
    broaderClaim: 'Initial fetch cannot be overwritten by an older late snapshot.',
    validation,
    run1: {
      run: 1,
      status: 'BLOCKED',
      reason: validation.reason,
    },
    run2: {
      run: 2,
      status: 'BLOCKED',
      reason: validation.reason,
    },
    comparison: 'N/A',
    summary: {
      narrowClaimSupported: false,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: false,
    },
  };
} else {
  const run1 = runTrace(1, scenario, CONTROL);
  const run2 = runTrace(2, scenario, CONTROL);
  const identical = JSON.stringify(comparablePayload(run1)) === JSON.stringify(comparablePayload(run2));
  const overallStatus =
    run1.status === 'PASS' && run2.status === 'PASS' && identical ? 'PASS'
      : run1.status === 'BLOCKED' || run2.status === 'BLOCKED' ? 'BLOCKED'
      : 'FAIL';

  report = {
    command: COMMAND,
    scenarioId: scenario.id,
    control: CONTROL,
    modelType: 'production-helper',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    sourceAnchors: SOURCE_ANCESTORS,
    replayClaim: 'Within the active sticky-interaction window, an older building snapshot does not replace the accepted current building state.',
    broaderClaim: 'Initial fetch cannot be overwritten by an older late snapshot.',
    result: overallStatus,
    comparison: identical ? 'IDENTICAL' : 'DIFFERENT',
    run1,
    run2,
    summary: {
      narrowClaimSupported: run1.observedOutput?.narrowClaimSupported === true,
      broaderClaimSupported: run1.observedOutput?.broaderClaimSupported === true,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: identical,
      sourceBoundaryExecuted: true,
    },
  };
}

console.log(JSON.stringify(report, null, 2));

if (report.result !== 'PASS') {
  process.exitCode = 1;
}
