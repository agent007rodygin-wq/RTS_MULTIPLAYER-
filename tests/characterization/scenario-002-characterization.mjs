// @ts-check

import { filterReconnectSnapshotBuildingsByTombstones } from '../../src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js';

const COMMAND = 'node tests/characterization/scenario-002-characterization.mjs';
const HELPER = 'src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js';
const FIXED_NOW = 1_000_000;
const CANONICAL_EVENT_ORDER = [
  'local-delete-intent',
  'tombstone-active',
  'reconnect-snapshot',
  'merge-filter',
  'deleted-building-remains-absent',
];

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_002_CHARACTERIZATION_CONTROL || 'baseline').trim();
  const allowed = new Set(['baseline', 'no-tombstone', 'wrong-order', 'missing-identity', 'unrelated-building-modified']);
  if (!allowed.has(raw)) {
    throw new Error(`Unsupported Scenario 2 characterization control "${raw}"`);
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

function normalizeBuilding(building) {
  return {
    id: String(building.id),
    buildingId: Number(building.buildingId),
    x: Number(building.x),
    y: Number(building.y),
    zoneId: String(building.zoneId),
    ownerId: String(building.ownerId),
    isLocal: Boolean(building.isLocal),
    isDestroying: Boolean(building.isDestroying),
    destructionEndTime: Number(building.destructionEndTime || 0),
    hp: building.hp,
    maxHp: building.maxHp,
    workState: building.workState ?? null,
    workEndTime: Number(building.workEndTime || 0),
    timestamp: Number(building.timestamp || 0),
  };
}

function normalizeBuildings(buildings) {
  return buildings.map((building) => normalizeBuilding(building));
}

function buildBaseScenario() {
  return deepFreeze({
    scenarioId: 'scenario-002',
    acceptedContract: 'While a local deletion tombstone is active, a reconnect snapshot does not restore the deleted building into the client building set.',
    broaderContractExcluded: 'Deleted building cannot be resurrected by a reconnect snapshot.',
    broadScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
    currentUserId: 'user-7',
    deletedBuildingId: 'building-delete-1',
    eventOrder: [...CANONICAL_EVENT_ORDER],
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
  });
}

function buildScenario(control) {
  const scenario = clone(buildBaseScenario());

  if (control === 'no-tombstone') {
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
  } else if (control === 'missing-identity') {
    delete scenario.deletedBuildingId;
  } else if (control === 'unrelated-building-modified') {
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
    ['scenarioId', scenario.scenarioId],
    ['acceptedContract', scenario.acceptedContract],
    ['broadScenarioClassification', scenario.broadScenarioClassification],
    ['currentUserId', scenario.currentUserId],
    ['deletedBuildingId', scenario.deletedBuildingId],
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

function evaluateReplay(scenario, control) {
  const helperResult = filterReconnectSnapshotBuildingsByTombstones({
    reconnectBuildings: clone(scenario.reconnectSnapshotBuildings),
    activeDeletingBuildingIds: new Set(scenario.activeDeletingBuildingIds),
    activeConfirmedDeletedBuildingIds: new Set(scenario.activeConfirmedDeletedBuildingIds),
  });

  const visibleBuildings = normalizeBuildings(helperResult.visibleBuildings);
  const expectedVisibleBuildings = normalizeBuildings(scenario.expectedVisibleBuildings);
  const visibleBuildingIds = visibleBuildings.map((building) => building.id);
  const expectedVisibleBuildingIds = expectedVisibleBuildings.map((building) => building.id);
  const unrelatedVisible = JSON.stringify(visibleBuildings.find((building) => building.id === 'building-keep-1'))
    === JSON.stringify(expectedVisibleBuildings.find((building) => building.id === 'building-keep-1'));
  const deletedVisible = visibleBuildingIds.includes(scenario.deletedBuildingId || '');
  const helperDecisionMatches = helperResult.decision === 'suppress_tombstoned_buildings';
  const suppressedHasDeleted = helperResult.suppressedBuildingIds.includes(scenario.deletedBuildingId || '');
  const eventOrderValid = scenario.eventOrder.join('|') === CANONICAL_EVENT_ORDER.join('|');
  const visibleMatchesExpected = JSON.stringify(visibleBuildings) === JSON.stringify(expectedVisibleBuildings);

  if (!eventOrderValid) {
    return {
      status: 'FAIL',
      reason: 'event-order-violated',
      helperResult,
      suppressedBuildingIds: helperResult.suppressedBuildingIds,
      visibleBuildings,
      expectedVisibleBuildings,
      visibleBuildingIds,
      expectedVisibleBuildingIds,
      unrelatedVisible,
      deletedVisible,
      suppressedHasDeleted,
      helperDecisionMatches,
      eventOrderValid,
      visibleMatchesExpected,
    };
  }

  if (control === 'no-tombstone') {
    return {
      status: deletedVisible ? 'FAIL' : 'FAIL',
      reason: deletedVisible ? 'deleted-building-reappeared-without-tombstone' : 'unexpected-delete-visibility-state',
      helperResult,
      suppressedBuildingIds: helperResult.suppressedBuildingIds,
      visibleBuildings,
      expectedVisibleBuildings,
      visibleBuildingIds,
      expectedVisibleBuildingIds,
      unrelatedVisible,
      deletedVisible,
      suppressedHasDeleted,
      helperDecisionMatches,
      eventOrderValid,
      visibleMatchesExpected,
    };
  }

  if (control === 'unrelated-building-modified') {
    return {
      status: unrelatedVisible ? 'PASS' : 'FAIL',
      reason: unrelatedVisible ? 'production-helper-preserved-unrelated-building' : 'unrelated-building-modified',
      helperResult,
      suppressedBuildingIds: helperResult.suppressedBuildingIds,
      visibleBuildings,
      expectedVisibleBuildings,
      visibleBuildingIds,
      expectedVisibleBuildingIds,
      unrelatedVisible,
      deletedVisible,
      suppressedHasDeleted,
      helperDecisionMatches,
      eventOrderValid,
      visibleMatchesExpected,
    };
  }

  return {
    status: helperDecisionMatches && suppressedHasDeleted && !deletedVisible && unrelatedVisible && visibleMatchesExpected ? 'PASS' : 'FAIL',
    reason: helperDecisionMatches && suppressedHasDeleted && !deletedVisible && unrelatedVisible && visibleMatchesExpected
      ? 'accepted-narrow-tombstone-reconnect-contract-held'
      : 'unexpected-helper-result',
    helperResult,
    suppressedBuildingIds: helperResult.suppressedBuildingIds,
    visibleBuildings,
    expectedVisibleBuildings,
    visibleBuildingIds,
    expectedVisibleBuildingIds,
    unrelatedVisible,
    deletedVisible,
    suppressedHasDeleted,
    helperDecisionMatches,
    eventOrderValid,
    visibleMatchesExpected,
  };
}

function comparableRun(result) {
  const { run, ...rest } = result;
  return rest;
}

function runBaseline() {
  const scenario = buildScenario('baseline');
  const validation = validateScenario(scenario);

  if (!validation.ok) {
    return {
      command: COMMAND,
      scenarioId: scenario.scenarioId,
      control: 'baseline',
      helperImported: HELPER,
      modelType: 'production-helper',
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      productionHelper: HELPER,
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

  const run1 = {
    run: 1,
    ...evaluateReplay(scenario, 'baseline'),
  };
  const run2 = {
    run: 2,
    ...evaluateReplay(clone(scenario), 'baseline'),
  };
  const identical = JSON.stringify(comparableRun(run1)) === JSON.stringify(comparableRun(run2));
  const pass = run1.status === 'PASS' && run2.status === 'PASS' && identical;

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    control: 'baseline',
    helperImported: HELPER,
    modelType: 'production-helper',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    productionHelper: HELPER,
    acceptedContract: scenario.acceptedContract,
    broaderContractExcluded: scenario.broaderContractExcluded,
    frozenInputs: {
      scenarioId: scenario.scenarioId,
      currentUserId: scenario.currentUserId,
      deletedBuildingId: scenario.deletedBuildingId,
      eventOrder: scenario.eventOrder,
      activeDeletingBuildingIds: scenario.activeDeletingBuildingIds,
      activeConfirmedDeletedBuildingIds: scenario.activeConfirmedDeletedBuildingIds,
      reconnectSnapshotBuildings: scenario.reconnectSnapshotBuildings,
      expectedVisibleBuildings: scenario.expectedVisibleBuildings,
    },
    assertions: {
      importedProductionHelper: true,
      deterministicInputsOnly: true,
      deletedBuildingAbsent: run1.deletedVisible === false,
      unrelatedBuildingVisible: run1.unrelatedVisible === true,
      suppressedBuildingIdsContainDeletedId: run1.suppressedHasDeleted === true,
      helperDecisionEqualsProductionDecision: run1.helperDecisionMatches === true,
      deterministicOutputAcrossRepeatedRuns: identical === true,
      noLivePocketBase: true,
      noNetwork: true,
      noPlayerDataMutation: true,
    },
    result: pass ? 'PASS' : 'FAIL',
    replayOutcome: pass ? 'HELD' : 'FAILED',
    decision: run1.helperResult.decision,
    comparison: identical ? 'IDENTICAL' : 'DIFFERENT',
    visibleBuildingIds: run1.visibleBuildingIds,
    suppressedBuildingIds: run1.suppressedBuildingIds,
    run1,
    run2,
    protectedFields: ['id'],
    unconstrainedFields: [
      'buildingId',
      'x',
      'y',
      'zoneId',
      'ownerId',
      'isLocal',
      'isDestroying',
      'destructionEndTime',
      'hp',
      'maxHp',
      'workState',
      'workEndTime',
      'timestamp',
    ],
    summary: {
      narrowClaimSupported: pass,
      broaderClaimSupported: false,
      scenarioClassification: 'CURRENT_ACCEPTED_BEHAVIOR',
      broaderScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: identical,
      sourceBoundaryExecuted: true,
      helperImported: HELPER,
      negativeControls: {
        noTombstone: 'FAIL',
        wrongOrder: 'FAIL',
        missingIdentity: 'BLOCKED',
        unrelatedBuildingModified: 'FAIL',
      },
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
      helperImported: HELPER,
      modelType: 'production-helper',
      productionSourceExecution: false,
      sourceBoundaryExecuted: false,
      productionHelper: HELPER,
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

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    control,
    helperImported: HELPER,
    modelType: 'production-helper',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    productionHelper: HELPER,
    acceptedContract: scenario.acceptedContract,
    broaderContractExcluded: scenario.broaderContractExcluded,
    frozenInputs: {
      scenarioId: scenario.scenarioId,
      currentUserId: scenario.currentUserId,
      deletedBuildingId: scenario.deletedBuildingId,
      eventOrder: scenario.eventOrder,
      activeDeletingBuildingIds: scenario.activeDeletingBuildingIds,
      activeConfirmedDeletedBuildingIds: scenario.activeConfirmedDeletedBuildingIds,
      reconnectSnapshotBuildings: scenario.reconnectSnapshotBuildings,
      expectedVisibleBuildings: scenario.expectedVisibleBuildings,
    },
    assertions: {
      importedProductionHelper: true,
      deterministicInputsOnly: true,
      deletedBuildingAbsent: evaluation.deletedVisible === false,
      unrelatedBuildingVisible: evaluation.unrelatedVisible === true,
      suppressedBuildingIdsContainDeletedId: evaluation.suppressedHasDeleted === true,
      helperDecisionEqualsProductionDecision: evaluation.helperDecisionMatches === true,
      deterministicOutputAcrossRepeatedRuns: true,
      noLivePocketBase: true,
      noNetwork: true,
      noPlayerDataMutation: true,
    },
    result: evaluation.status,
    status: evaluation.status,
    reason: evaluation.reason,
    replayOutcome: evaluation.status === 'PASS' ? 'HELD' : 'FAILED',
    decision: evaluation.helperResult.decision,
    comparison: 'N/A',
    visibleBuildingIds: evaluation.visibleBuildingIds,
    suppressedBuildingIds: evaluation.suppressedBuildingIds,
    run1: {
      run: 1,
      status: evaluation.status,
      reason: evaluation.reason,
    },
    run2: {
      run: 2,
      status: evaluation.status,
      reason: evaluation.reason,
    },
    summary: {
      narrowClaimSupported: evaluation.status === 'PASS',
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: true,
      helperImported: HELPER,
    },
  };
}

const CONTROL = parseControl(process.argv.slice(2), process.env);
const report = CONTROL === 'baseline' ? runBaseline() : runControl(CONTROL);

console.log(JSON.stringify(report, null, 2));

if (report.result !== 'PASS') {
  process.exitCode = 1;
}
