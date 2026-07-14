const COMMAND = 'node tests/characterization/scenario-002-replay.mjs';
const HELPER = 'src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js';
const FIXED_NOW = 1_000_000;
const CANONICAL_ORDER = [
  'local-delete-intent',
  'tombstone-active',
  'reconnect-snapshot',
  'merge-filter',
  'deleted-building-remains-absent',
];

import {
  filterReconnectSnapshotBuildingsByTombstones,
} from '../../src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function freezeSet(entries) {
  return new Set(entries.map((value) => String(value)));
}

function comparablePayload(result) {
  const { run, ...rest } = result;
  return rest;
}

function normalizeBuildingList(buildings) {
  return buildings.map((building) => ({
    id: String(building.id),
    buildingId: Number(building.buildingId),
    x: Number(building.x),
    y: Number(building.y),
    zoneId: String(building.zoneId),
    ownerId: String(building.ownerId),
    hp: building.hp,
    maxHp: building.maxHp,
    isLocal: Boolean(building.isLocal),
    isDestroying: Boolean(building.isDestroying),
    destructionEndTime: Number(building.destructionEndTime || 0),
    workState: building.workState ?? null,
    workEndTime: Number(building.workEndTime || 0),
    timestamp: Number(building.timestamp || 0),
  }));
}

function referenceFilterReconnectSnapshotBuildingsByTombstones(input) {
  const reconnectBuildings = Array.from(input?.reconnectBuildings ?? []);
  const activeDeletingBuildingIds = new Set(Array.from(input?.activeDeletingBuildingIds ?? [], String));
  const activeConfirmedDeletedBuildingIds = new Set(Array.from(input?.activeConfirmedDeletedBuildingIds ?? [], String));
  const activeSuppressedIds = new Set([...activeDeletingBuildingIds, ...activeConfirmedDeletedBuildingIds]);

  const visibleBuildings = [];
  const suppressedBuildingIds = [];

  for (const building of reconnectBuildings) {
    const id = String(building?.id ?? '');
    if (id && activeSuppressedIds.has(id)) {
      suppressedBuildingIds.push(id);
      continue;
    }
    visibleBuildings.push(building);
  }

  return {
    visibleBuildings,
    suppressedBuildingIds,
    decision: suppressedBuildingIds.length > 0
      ? 'suppress_tombstoned_buildings'
      : 'accept_reconnect_snapshot',
  };
}

function runParitySweep() {
  const cases = [
    {
      name: 'keep-when-no-tombstones',
      input: {
        reconnectBuildings: [
          { id: 'building-a', x: 1, y: 1, zoneId: 'zone-1' },
          { id: 'building-b', x: 2, y: 1, zoneId: 'zone-1' },
        ],
        activeDeletingBuildingIds: [],
        activeConfirmedDeletedBuildingIds: [],
      },
    },
    {
      name: 'suppress-via-deleting-set',
      input: {
        reconnectBuildings: [
          { id: 'building-a', x: 1, y: 1, zoneId: 'zone-1' },
          { id: 'building-b', x: 2, y: 1, zoneId: 'zone-1' },
        ],
        activeDeletingBuildingIds: ['building-a'],
        activeConfirmedDeletedBuildingIds: [],
      },
    },
    {
      name: 'suppress-via-confirmed-set',
      input: {
        reconnectBuildings: [
          { id: 'building-a', x: 1, y: 1, zoneId: 'zone-1' },
          { id: 'building-b', x: 2, y: 1, zoneId: 'zone-1' },
        ],
        activeDeletingBuildingIds: [],
        activeConfirmedDeletedBuildingIds: ['building-a'],
      },
    },
    {
      name: 'suppress-via-both-sets',
      input: {
        reconnectBuildings: [
          { id: 'building-a', x: 1, y: 1, zoneId: 'zone-1' },
          { id: 'building-b', x: 2, y: 1, zoneId: 'zone-1' },
        ],
        activeDeletingBuildingIds: ['building-a'],
        activeConfirmedDeletedBuildingIds: ['building-a'],
      },
    },
  ];

  const evaluated = cases.map((testCase) => {
    const helperResult = filterReconnectSnapshotBuildingsByTombstones(testCase.input);
    const referenceResult = referenceFilterReconnectSnapshotBuildingsByTombstones(testCase.input);
    return {
      name: testCase.name,
      helper: {
        visibleBuildingIds: helperResult.visibleBuildings.map((building) => String(building.id)),
        suppressedBuildingIds: [...helperResult.suppressedBuildingIds],
        decision: helperResult.decision,
      },
      reference: {
        visibleBuildingIds: referenceResult.visibleBuildings.map((building) => String(building.id)),
        suppressedBuildingIds: [...referenceResult.suppressedBuildingIds],
        decision: referenceResult.decision,
      },
      identical: JSON.stringify(helperResult) === JSON.stringify(referenceResult),
    };
  });

  return {
    result: evaluated.every((entry) => entry.identical) ? 'PASS' : 'FAIL',
    cases: evaluated,
  };
}

function buildScenario(control) {
  const base = {
    id: 'scenario-002',
    deletedBuildingId: 'building-delete-1',
    currentUserId: 'user-7',
    eventOrder: [...CANONICAL_ORDER],
    activeDeletingBuildingIds: ['building-delete-1'],
    activeConfirmedDeletedBuildingIds: [],
    reconnectSnapshotBuildings: [
      {
        id: 'building-delete-1',
        buildingId: 501,
        x: 12,
        y: 9,
        zoneId: 'zone-1',
        ownerId: 'user-7',
        isLocal: false,
        isDestroying: false,
        destructionEndTime: 0,
        hp: 700,
        maxHp: 700,
        workState: 'idle',
        workEndTime: 0,
        timestamp: FIXED_NOW - 1000,
      },
      {
        id: 'building-keep-1',
        buildingId: 502,
        x: 13,
        y: 9,
        zoneId: 'zone-1',
        ownerId: 'user-7',
        isLocal: false,
        isDestroying: false,
        destructionEndTime: 0,
        hp: 450,
        maxHp: 450,
        workState: 'idle',
        workEndTime: 0,
        timestamp: FIXED_NOW - 900,
      },
    ],
    expectedVisibleBuildings: [
      {
        id: 'building-keep-1',
        buildingId: 502,
        x: 13,
        y: 9,
        zoneId: 'zone-1',
        ownerId: 'user-7',
        isLocal: false,
        isDestroying: false,
        destructionEndTime: 0,
        hp: 450,
        maxHp: 450,
        workState: 'idle',
        workEndTime: 0,
        timestamp: FIXED_NOW - 900,
      },
    ],
  };

  const scenario = clone(base);

  if (control === 'tombstone-absent') {
    scenario.activeDeletingBuildingIds = [];
    scenario.activeConfirmedDeletedBuildingIds = [];
  } else if (control === 'wrong-order') {
    scenario.eventOrder = [
      'reconnect-snapshot',
      'local-delete-intent',
      'tombstone-active',
      'merge-filter',
      'deleted-building-remains-absent',
    ];
    scenario.activeDeletingBuildingIds = [];
    scenario.activeConfirmedDeletedBuildingIds = [];
  } else if (control === 'missing-identity') {
    delete scenario.deletedBuildingId;
  } else if (control === 'unrelated-building-changed') {
    scenario.reconnectSnapshotBuildings[1] = {
      ...scenario.reconnectSnapshotBuildings[1],
      x: 99,
      y: 98,
    };
  }

  return scenario;
}

function validateScenario(scenario) {
  const requiredFields = [
    ['id', scenario.id],
    ['deletedBuildingId', scenario.deletedBuildingId],
    ['currentUserId', scenario.currentUserId],
    ['eventOrder', scenario.eventOrder],
    ['activeDeletingBuildingIds', scenario.activeDeletingBuildingIds],
    ['activeConfirmedDeletedBuildingIds', scenario.activeConfirmedDeletedBuildingIds],
    ['reconnectSnapshotBuildings', scenario.reconnectSnapshotBuildings],
    ['expectedVisibleBuildings', scenario.expectedVisibleBuildings],
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

  const snapshotIdsMissing = scenario.reconnectSnapshotBuildings.some((building) => !building || building.id === undefined || building.id === null || building.id === '');
  if (snapshotIdsMissing) {
    return {
      ok: false,
      status: 'BLOCKED',
      reason: 'missing-building-identity',
      missing: ['reconnectSnapshotBuildings[].id'],
    };
  }

  return {
    ok: true,
    status: 'PASS',
    reason: null,
    missing: [],
  };
}

function executeReplay(runNumber, scenario, control, parity) {
  const replayInputs = {
    reconnectSnapshotBuildings: clone(scenario.reconnectSnapshotBuildings),
    activeDeletingBuildingIds: freezeSet(scenario.activeDeletingBuildingIds),
    activeConfirmedDeletedBuildingIds: freezeSet(scenario.activeConfirmedDeletedBuildingIds),
    deletedBuildingId: scenario.deletedBuildingId,
  };

  const eventOrderValid = scenario.eventOrder.join('|') === CANONICAL_ORDER.join('|');
  const helperResult = filterReconnectSnapshotBuildingsByTombstones({
    reconnectBuildings: replayInputs.reconnectSnapshotBuildings,
    activeDeletingBuildingIds: replayInputs.activeDeletingBuildingIds,
    activeConfirmedDeletedBuildingIds: replayInputs.activeConfirmedDeletedBuildingIds,
  });
  const visibleBuildings = normalizeBuildingList(helperResult.visibleBuildings);
  const expectedVisibleBuildings = normalizeBuildingList(scenario.expectedVisibleBuildings);
  const visibleIds = visibleBuildings.map((building) => building.id);
  const expectedVisibleIds = expectedVisibleBuildings.map((building) => building.id);
  const deletedVisible = visibleIds.includes(String(scenario.deletedBuildingId || ''));
  const unrelatedBuildingMatches = JSON.stringify(visibleBuildings.find((building) => building.id === 'building-keep-1')) === JSON.stringify(expectedVisibleBuildings.find((building) => building.id === 'building-keep-1'));
  const visibleMatchesExpected = JSON.stringify(visibleBuildings) === JSON.stringify(expectedVisibleBuildings);

  if (!eventOrderValid) {
    return {
      run: runNumber,
      scenarioId: scenario.id,
      control,
      command: COMMAND,
      helperImported: HELPER,
      productionSourceExecution: true,
      sourceBoundaryExecuted: true,
      sourceBoundary: 'filterReconnectSnapshotBuildingsByTombstones',
      replayOrder: scenario.eventOrder,
      frozenInputs: replayInputs,
      parityResult: parity.result,
      observedOutput: {
        status: 'FAIL',
        replayResult: 'FAIL',
        reason: 'event-order-violated',
        helperDecision: helperResult.decision,
        visibleBuildingIds: visibleIds,
        suppressedBuildingIds: helperResult.suppressedBuildingIds,
        deletedBuildingVisible: deletedVisible,
        unrelatedBuildingMatches,
      },
      status: 'FAIL',
    };
  }

  if (!scenario.deletedBuildingId) {
    return {
      run: runNumber,
      scenarioId: scenario.id,
      control,
      command: COMMAND,
      helperImported: HELPER,
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      sourceBoundary: 'filterReconnectSnapshotBuildingsByTombstones',
      replayOrder: scenario.eventOrder,
      frozenInputs: replayInputs,
      parityResult: parity.result,
      observedOutput: {
        status: 'BLOCKED',
        replayResult: 'BLOCKED',
        reason: 'missing-building-identity',
      },
      status: 'BLOCKED',
    };
  }

  let status = 'PASS';
  let reason = 'production-helper-suppressed-deleted-building';

  if (control === 'tombstone-absent') {
    status = 'FAIL';
    reason = deletedVisible ? 'deleted-building-reappeared-without-tombstone' : 'unexpected-delete-visibility-state';
  } else if (control === 'unrelated-building-changed') {
    status = unrelatedBuildingMatches ? 'PASS' : 'FAIL';
    reason = unrelatedBuildingMatches ? 'production-helper-preserved-unrelated-building' : 'unrelated-building-changed';
  } else if (!visibleMatchesExpected || deletedVisible) {
    status = 'FAIL';
    reason = 'deleted-building-not-suppressed';
  }

  return {
    run: runNumber,
    scenarioId: scenario.id,
    control,
    command: COMMAND,
    helperImported: HELPER,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    sourceBoundary: 'filterReconnectSnapshotBuildingsByTombstones',
    replayOrder: scenario.eventOrder,
    frozenInputs: replayInputs,
    parityResult: parity.result,
    observedOutput: {
      status,
      replayResult: status,
      reason,
      helperDecision: helperResult.decision,
      visibleBuildings,
      visibleBuildingIds: visibleIds,
      expectedVisibleBuildingIds: expectedVisibleIds,
      suppressedBuildingIds: helperResult.suppressedBuildingIds,
      deletedBuildingVisible: deletedVisible,
      unrelatedBuildingMatches,
      narrowClaimSupported: status === 'PASS' && deletedVisible === false && visibleMatchesExpected,
      broaderClaimSupported: false,
    },
    status,
  };
}

function buildReport(control) {
  const scenario = buildScenario(control);
  const validation = validateScenario(scenario);
  const parity = runParitySweep();

  if (!validation.ok) {
    return {
      command: COMMAND,
      scenarioId: scenario.id,
      control,
      helperImported: HELPER,
      modelType: 'production-helper',
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      sourceBoundary: 'filterReconnectSnapshotBuildingsByTombstones',
      sourceAnchors: [
        'tests/characterization/scenario-002-source-audit.md',
        'tests/characterization/scenario-002-classification.md',
        'tests/characterization/scenario-002-seam-decision.md',
        'tests/characterization/scenario-002-contract-split.md',
        'tests/characterization/scenario-002-fixture-design.md',
        'src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js',
        'App.tsx',
        'src/pocketbase.ts',
      ],
      parity,
      replayClaim: 'While a local deletion tombstone is active, a reconnect snapshot does not restore the deleted building into the client building set.',
      broaderClaim: 'Deleted building cannot be resurrected by a reconnect snapshot.',
      result: validation.status,
      comparison: 'N/A',
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
      summary: {
        parityResult: parity.result,
        narrowClaimSupported: false,
        broaderClaimSupported: false,
        scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
        deterministicTwoRunResult: true,
        sourceBoundaryExecuted: false,
        adapterDeadIdDeferred: true,
        persistentDeletionDeferred: true,
      },
      validation,
    };
  }

  const run1 = executeReplay(1, scenario, control, parity);
  const run2 = executeReplay(2, scenario, control, parity);
  const identical = JSON.stringify(comparablePayload(run1)) === JSON.stringify(comparablePayload(run2));
  const overallStatus =
    parity.result === 'PASS' &&
    run1.status === 'PASS' &&
    run2.status === 'PASS' &&
    identical
      ? 'PASS'
      : run1.status === 'BLOCKED' || run2.status === 'BLOCKED'
        ? 'BLOCKED'
        : 'FAIL';

  return {
    command: COMMAND,
    scenarioId: scenario.id,
    control,
    helperImported: HELPER,
    modelType: 'production-helper',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    sourceBoundary: 'filterReconnectSnapshotBuildingsByTombstones',
    sourceAnchors: [
      'tests/characterization/scenario-002-source-audit.md',
      'tests/characterization/scenario-002-classification.md',
      'tests/characterization/scenario-002-seam-decision.md',
      'tests/characterization/scenario-002-contract-split.md',
      'tests/characterization/scenario-002-fixture-design.md',
      'src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js',
      'App.tsx',
      'src/pocketbase.ts',
    ],
    parity,
    replayClaim: 'While a local deletion tombstone is active, a reconnect snapshot does not restore the deleted building into the client building set.',
    broaderClaim: 'Deleted building cannot be resurrected by a reconnect snapshot.',
    result: overallStatus,
    comparison: identical ? 'IDENTICAL' : 'DIFFERENT',
    run1,
    run2,
    summary: {
      parityResult: parity.result,
      narrowClaimSupported: run1.observedOutput?.narrowClaimSupported === true,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: identical,
      sourceBoundaryExecuted: true,
      helperImported: HELPER,
      adapterDeadIdDeferred: true,
      persistentDeletionDeferred: true,
    },
  };
}

const CONTROL = (process.argv.find((value) => value.startsWith('--control='))?.split('=')[1] || process.env.SCENARIO_002_CONTROL || 'baseline').trim();
const report = buildReport(CONTROL);

console.log(JSON.stringify(report, null, 2));

if (report.result !== 'PASS') {
  process.exitCode = 1;
}
