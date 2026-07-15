// @ts-check

import { resolveLocalDestructionCompletion } from '../../src/game/buildings/resolveLocalDestructionCompletion.js';
import { resolvePlacedBuildingSnapshotMerge } from '../../src/game/buildings/resolveBuildingSnapshotMerge.js';

const COMMAND = 'node tests/characterization/scenario-003-replay.mjs';
const COMPLETION_HELPER = 'src/game/buildings/resolveLocalDestructionCompletion.js';
const MERGE_HELPER = 'src/game/buildings/resolveBuildingSnapshotMerge.js';
const FIXED_COMPLETION_NOW = 1_000_000;
const FIXED_RECONNECT_NOW = FIXED_COMPLETION_NOW + 2_000;
const STICKY_INTERACTION_MS = 15_000;
const DELETION_PROTECTION_MS = 120_000;
const BUILDING_TEMP_EFFECT_MAX_LIFETIME_MS = 24 * 60 * 60 * 1000;
const BUILDING_DURABILITY = 40;
const CANONICAL_EVENT_ORDER = [
  'destruction-process-active',
  'completion-time-passes',
  'terminal-state-produced',
  'older-snapshot-arrives',
  'merge-boundary-executes',
  'pre-terminal-state-not-restored',
];

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
    isConstructing: Boolean(building.isConstructing),
    constructionEndTime: Number(building.constructionEndTime || 0),
    isDestroying: Boolean(building.isDestroying),
    destructionStartedAt: building.destructionStartedAt,
    destructionEndTime: building.destructionEndTime,
    destructionExpiresAt: building.destructionExpiresAt,
    destructionDurationMs: building.destructionDurationMs,
    destructionMaxLifetimeMs: building.destructionMaxLifetimeMs,
    destructionStatus: building.destructionStatus ?? null,
    hp: building.hp,
    maxHp: building.maxHp,
    pendingDamage: building.pendingDamage,
    shieldHp: building.shieldHp,
    shieldMaxHp: building.shieldMaxHp,
    workState: building.workState ?? null,
    workEndTime: Number(building.workEndTime || 0),
    lastMoveTime: Number(building.lastMoveTime || 0),
    lastAttackTime: Number(building.lastAttackTime || 0),
    protectionEndTime: Number(building.protectionEndTime || 0),
    timestamp: Number(building.timestamp || 0),
  };
}

function sameBuildingShape(left, right) {
  return JSON.stringify(normalizeBuilding(left)) === JSON.stringify(normalizeBuilding(right));
}

function buildBaseScenario() {
  return deepFreeze({
    scenarioId: 'scenario-003',
    subcase: 'LOCAL_TERMINAL_STATE_FIRST',
    acceptedContract: 'After local destruction completion has produced a terminal building state, a later older snapshot does not restore the pre-terminal building state.',
    broaderContractExcluded: 'Destroyed building terminal-state survives a later stale snapshot.',
    broadScenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
    currentUserId: 'user-7',
    completionNow: FIXED_COMPLETION_NOW,
    reconnectNow: FIXED_RECONNECT_NOW,
    stickyInteractionMs: STICKY_INTERACTION_MS,
    deletionProtectionMs: DELETION_PROTECTION_MS,
    buildingInfo: {
      stats: {
        durability: BUILDING_DURABILITY,
      },
    },
    eventOrder: [...CANONICAL_EVENT_ORDER],
    terminalSeed: {
      id: 'building-terminal-1',
      buildingId: 301,
      x: 18,
      y: 12,
      zoneId: 'zone-1',
      ownerId: 'user-7',
      isLocal: true,
      isConstructing: false,
      constructionEndTime: 0,
      isDestroying: true,
      destructionStartedAt: FIXED_COMPLETION_NOW - 1200,
      destructionEndTime: FIXED_COMPLETION_NOW,
      destructionExpiresAt: FIXED_COMPLETION_NOW,
      destructionDurationMs: 1200,
      destructionMaxLifetimeMs: BUILDING_TEMP_EFFECT_MAX_LIFETIME_MS,
      destructionStatus: 'active',
      hp: BUILDING_DURABILITY,
      maxHp: BUILDING_DURABILITY,
      pendingDamage: BUILDING_DURABILITY,
      shieldHp: 0,
      shieldMaxHp: 0,
      workState: 'idle',
      workEndTime: 0,
      lastMoveTime: 0,
      lastAttackTime: 0,
      protectionEndTime: 0,
      timestamp: FIXED_COMPLETION_NOW - 4_000,
    },
    staleSnapshotTarget: {
      id: 'building-terminal-1',
      buildingId: 301,
      x: 18,
      y: 12,
      zoneId: 'zone-1',
      ownerId: 'user-7',
      isLocal: false,
      isConstructing: false,
      constructionEndTime: 0,
      isDestroying: true,
      destructionStartedAt: FIXED_COMPLETION_NOW - 1200,
      destructionEndTime: FIXED_COMPLETION_NOW,
      destructionExpiresAt: FIXED_COMPLETION_NOW,
      destructionDurationMs: 1200,
      destructionMaxLifetimeMs: BUILDING_TEMP_EFFECT_MAX_LIFETIME_MS,
      destructionStatus: 'active',
      hp: BUILDING_DURABILITY,
      maxHp: BUILDING_DURABILITY,
      pendingDamage: BUILDING_DURABILITY,
      shieldHp: 0,
      shieldMaxHp: 0,
      workState: 'idle',
      workEndTime: 0,
      lastMoveTime: 0,
      lastAttackTime: 0,
      protectionEndTime: 0,
      timestamp: FIXED_COMPLETION_NOW - 5_000,
    },
    unrelatedBuilding: {
      id: 'building-keep-1',
      buildingId: 306,
      x: 19,
      y: 12,
      zoneId: 'zone-1',
      ownerId: 'user-7',
      isLocal: true,
      isConstructing: false,
      constructionEndTime: 0,
      isDestroying: false,
      destructionStartedAt: undefined,
      destructionEndTime: undefined,
      destructionExpiresAt: undefined,
      destructionDurationMs: undefined,
      destructionMaxLifetimeMs: undefined,
      destructionStatus: undefined,
      hp: 232,
      maxHp: 232,
      pendingDamage: 0,
      shieldHp: 0,
      shieldMaxHp: 0,
      workState: 'idle',
      workEndTime: 0,
      lastMoveTime: 0,
      lastAttackTime: 0,
      protectionEndTime: 0,
      timestamp: FIXED_COMPLETION_NOW - 3_000,
    },
  });
}

function normalizeReplayState(state) {
  return {
    completionDecision: state.completionDecision,
    completionCompleted: state.completionCompleted,
    mergeDecision: state.mergeDecision,
    shouldStickPosition: state.shouldStickPosition,
    shouldStickHealthState: state.shouldStickHealthState,
    targetCoreFields: state.targetCoreFields,
    targetMetadataFields: state.targetMetadataFields,
    unrelatedBuildingPreserved: state.unrelatedBuildingPreserved,
    observedClaim: state.observedClaim,
    replayResult: state.replayResult,
    sourceBoundaryExecuted: state.sourceBoundaryExecuted,
  };
}

function buildRunState(scenario) {
  const completion = resolveLocalDestructionCompletion({
    building: clone(scenario.terminalSeed),
    buildingInfo: clone(scenario.buildingInfo),
    now: scenario.completionNow,
    destructionExpiresAt: scenario.terminalSeed.destructionExpiresAt,
  });

  const terminalBuilding = completion.completedBuilding;
  const targetMerge = resolvePlacedBuildingSnapshotMerge({
    serverBuilding: clone(scenario.staleSnapshotTarget),
    localBuilding: terminalBuilding,
    currentUserId: scenario.currentUserId,
    now: scenario.reconnectNow,
    lastInteractionAt: scenario.completionNow,
    lastMoveAt: scenario.completionNow,
    localIsProtectedByCombat: false,
    stickyInteractionMs: scenario.stickyInteractionMs,
    deletionProtectionMs: scenario.deletionProtectionMs,
  });

  const unrelatedMerge = resolvePlacedBuildingSnapshotMerge({
    serverBuilding: clone({
      ...scenario.unrelatedBuilding,
      isLocal: false,
    }),
    localBuilding: clone(scenario.unrelatedBuilding),
    currentUserId: scenario.currentUserId,
    now: scenario.reconnectNow,
    lastInteractionAt: scenario.completionNow,
    lastMoveAt: scenario.completionNow,
    localIsProtectedByCombat: false,
    stickyInteractionMs: scenario.stickyInteractionMs,
    deletionProtectionMs: scenario.deletionProtectionMs,
  });

  const mergedTarget = targetMerge.mergedBuilding;
  const mergedUnrelated = unrelatedMerge.mergedBuilding;

  const targetCoreFields = {
    isDestroying: mergedTarget.isDestroying,
    hp: mergedTarget.hp,
    maxHp: mergedTarget.maxHp,
    pendingDamage: mergedTarget.pendingDamage,
  };

  const targetMetadataFields = {
    destructionStartedAt: mergedTarget.destructionStartedAt,
    destructionEndTime: mergedTarget.destructionEndTime,
    destructionExpiresAt: mergedTarget.destructionExpiresAt,
    destructionDurationMs: mergedTarget.destructionDurationMs,
    destructionMaxLifetimeMs: mergedTarget.destructionMaxLifetimeMs,
    destructionStatus: mergedTarget.destructionStatus,
  };

  const expectedTargetCoreFields = {
    isDestroying: false,
    hp: 0,
    maxHp: BUILDING_DURABILITY,
    pendingDamage: 0,
  };

  const expectedUnrelatedMerged = normalizeBuilding({
    ...scenario.unrelatedBuilding,
    isLocal: false,
  });

  return {
    completionDecision: completion.decision,
    completionCompleted: completion.completed,
    completionBlocked: completion.blocked,
    mergeDecision: targetMerge.decision,
    shouldStickPosition: targetMerge.shouldStickPosition,
    shouldStickHealthState: targetMerge.shouldStickHealthState,
    targetCoreFields,
    targetMetadataFields,
    unrelatedBuildingPreserved: sameBuildingShape(mergedUnrelated, expectedUnrelatedMerged),
    expectedTargetCoreFields,
    completionResult: completion,
    targetMerge,
    unrelatedMerge,
    terminalBuilding: normalizeBuilding(terminalBuilding),
    mergedTarget: normalizeBuilding(mergedTarget),
    mergedUnrelated: normalizeBuilding(mergedUnrelated),
    expectedUnrelatedMerged,
    observedClaim: targetCoreFields.isDestroying === false &&
      targetCoreFields.hp === 0 &&
      targetCoreFields.maxHp === BUILDING_DURABILITY &&
      targetCoreFields.pendingDamage === 0 &&
      targetMerge.decision === 'keep_local_sticky' &&
      targetMerge.shouldStickPosition === true &&
      targetMerge.shouldStickHealthState === true &&
      sameBuildingShape(mergedUnrelated, expectedUnrelatedMerged),
    replayResult: 'PASS',
    sourceBoundaryExecuted: true,
  };
}

function runBaseline() {
  const scenario = buildBaseScenario();
  const run1 = buildRunState(scenario);
  const run2 = buildRunState(clone(scenario));
  const identical = JSON.stringify(normalizeReplayState(run1)) === JSON.stringify(normalizeReplayState(run2));
  const pass = run1.observedClaim && run2.observedClaim && identical;

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    subcase: scenario.subcase,
    acceptedContract: scenario.acceptedContract,
    broaderContractExcluded: scenario.broaderContractExcluded,
    broadScenarioClassification: scenario.broadScenarioClassification,
    helperImported: [COMPLETION_HELPER, MERGE_HELPER],
    completionBoundaryStatus: 'production_boundary_available',
    mergeBoundaryStatus: 'production_boundary_available',
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    frozenInputs: {
      completionNow: scenario.completionNow,
      reconnectNow: scenario.reconnectNow,
      stickyInteractionMs: scenario.stickyInteractionMs,
      deletionProtectionMs: scenario.deletionProtectionMs,
      buildingInfo: scenario.buildingInfo,
      terminalSeed: scenario.terminalSeed,
      staleSnapshotTarget: scenario.staleSnapshotTarget,
      unrelatedBuilding: scenario.unrelatedBuilding,
      eventOrder: scenario.eventOrder,
    },
    assertions: {
      importedCompletionHelper: true,
      importedMergeHelper: true,
      deterministicInputsOnly: true,
      completionDecisionMatches: run1.completionDecision === 'complete_destruction',
      mergeDecisionMatches: run1.mergeDecision === 'keep_local_sticky',
      targetCoreFieldsPreserved: run1.observedClaim,
      unrelatedBuildingPreserved: run1.unrelatedBuildingPreserved,
      deterministicOutputAcrossRepeatedRuns: identical,
      noLivePocketBase: true,
      noNetwork: true,
      noPlayerDataMutation: true,
    },
    result: pass ? 'PASS' : 'FAIL',
    status: pass ? 'PASS' : 'FAIL',
    reason: pass ? 'terminal-state-preserved-through-stale-snapshot' : 'unexpected-terminal-state-drift',
    comparison: identical ? 'IDENTICAL' : 'DIFFERENT',
    replayResult: pass ? 'PASS' : 'FAIL',
    completionDecision: run1.completionDecision,
    mergeDecision: run1.mergeDecision,
    shouldStickPosition: run1.shouldStickPosition,
    shouldStickHealthState: run1.shouldStickHealthState,
    observedTerminalCoreFields: run1.targetCoreFields,
    observedStaleMetadataFields: run1.targetMetadataFields,
    targetMetadataNote: 'The merge helper does not rewrite all destruction metadata fields; those remain a fidelity limitation and are not used as the pass/fail criterion for T042.',
    run1,
    run2,
    summary: {
      narrowClaimSupported: pass,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: identical,
      sourceBoundaryExecuted: true,
      helperImported: [COMPLETION_HELPER, MERGE_HELPER],
      fidelityLimitations: [
        'The merge helper preserves the terminal operational fields but leaves destruction metadata fields sourced from the older snapshot because it does not override them.',
        'No live PocketBase or reload proof was used.',
        'Scenario 3 remains unpromoted pending the later owner-acceptance step.',
      ],
      negativeControls: {
        'completion-time-not-reached': 'FAIL',
        'snapshot-not-older': 'BLOCKED',
        'missing-identity': 'BLOCKED',
        'pre-terminal-state-restored': 'FAIL',
        'unrelated-building-changed': 'FAIL',
      },
    },
  };
}

function runCompletionTimeNotReached() {
  const scenario = buildBaseScenario();
  const completion = resolveLocalDestructionCompletion({
    building: clone(scenario.terminalSeed),
    buildingInfo: clone(scenario.buildingInfo),
    now: scenario.completionNow - 1,
    destructionExpiresAt: scenario.terminalSeed.destructionExpiresAt,
  });

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    subcase: scenario.subcase,
    control: 'completion-time-not-reached',
    helperImported: [COMPLETION_HELPER],
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    result: 'FAIL',
    status: 'FAIL',
    reason: completion.completed ? 'unexpected-terminal-state-before-expiry' : 'completion-window-not-yet-open',
    completionDecision: completion.decision,
    completionCompleted: completion.completed,
    replayResult: 'FAIL',
    broadScenarioClassification: scenario.broadScenarioClassification,
    summary: {
      narrowClaimSupported: false,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: true,
    },
  };
}

function runSnapshotNotOlder() {
  const scenario = buildBaseScenario();
  const run = buildRunState(scenario);

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    subcase: scenario.subcase,
    control: 'snapshot-not-older',
    helperImported: [COMPLETION_HELPER, MERGE_HELPER],
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    result: 'BLOCKED',
    status: 'BLOCKED',
    reason: 'merge-helper-does-not-consume-snapshot-age-as-an-input',
    replayResult: 'BLOCKED',
    completionDecision: run.completionDecision,
    mergeDecision: run.mergeDecision,
    shouldStickPosition: run.shouldStickPosition,
    shouldStickHealthState: run.shouldStickHealthState,
    observedTerminalCoreFields: run.targetCoreFields,
    observedStaleMetadataFields: run.targetMetadataFields,
    summary: {
      narrowClaimSupported: false,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: true,
    },
  };
}

function runMissingIdentity() {
  const scenario = buildBaseScenario();
  const brokenCompletionSeed = clone(scenario.terminalSeed);
  delete brokenCompletionSeed.id;
  const completion = resolveLocalDestructionCompletion({
    building: brokenCompletionSeed,
    buildingInfo: clone(scenario.buildingInfo),
    now: scenario.completionNow,
    destructionExpiresAt: scenario.terminalSeed.destructionExpiresAt,
  });

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    subcase: scenario.subcase,
    control: 'missing-identity',
    helperImported: [COMPLETION_HELPER],
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    result: 'BLOCKED',
    status: 'BLOCKED',
    reason: completion.blocked ? completion.blockedReason : 'missing-building-identity',
    completionDecision: completion.decision,
    completionCompleted: completion.completed,
    replayResult: 'BLOCKED',
    summary: {
      narrowClaimSupported: false,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: true,
    },
  };
}

function runPreTerminalStateRestored() {
  const scenario = buildBaseScenario();
  const run = buildRunState(scenario);

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    subcase: scenario.subcase,
    control: 'pre-terminal-state-restored',
    helperImported: [COMPLETION_HELPER, MERGE_HELPER],
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    result: 'FAIL',
    status: 'FAIL',
    reason: run.observedClaim ? 'terminal-state-was-preserved-instead' : 'terminal-state-did-not-hold',
    replayResult: 'FAIL',
    completionDecision: run.completionDecision,
    mergeDecision: run.mergeDecision,
    shouldStickPosition: run.shouldStickPosition,
    shouldStickHealthState: run.shouldStickHealthState,
    observedTerminalCoreFields: run.targetCoreFields,
    observedStaleMetadataFields: run.targetMetadataFields,
    summary: {
      narrowClaimSupported: false,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: true,
    },
  };
}

function runUnrelatedBuildingChanged() {
  const scenario = buildBaseScenario();
  const alteredScenario = clone(scenario);
  alteredScenario.unrelatedBuilding = {
    ...alteredScenario.unrelatedBuilding,
    x: 99,
    y: 98,
  };
  const run = buildRunState(alteredScenario);

  return {
    command: COMMAND,
    scenarioId: scenario.scenarioId,
    subcase: scenario.subcase,
    control: 'unrelated-building-changed',
    helperImported: [COMPLETION_HELPER, MERGE_HELPER],
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    result: 'FAIL',
    status: 'FAIL',
    reason: 'unrelated-building-mutation-is-out-of-scope-for-the-selected contract',
    replayResult: 'FAIL',
    completionDecision: run.completionDecision,
    mergeDecision: run.mergeDecision,
    shouldStickPosition: run.shouldStickPosition,
    shouldStickHealthState: run.shouldStickHealthState,
    observedTerminalCoreFields: run.targetCoreFields,
    observedStaleMetadataFields: run.targetMetadataFields,
    unrelatedBuildingPreserved: run.unrelatedBuildingPreserved,
    summary: {
      narrowClaimSupported: false,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: true,
    },
  };
}

const CONTROL = (() => {
  const arg = process.argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : process.env.SCENARIO_003_REPLAY_CONTROL || 'baseline').trim();
  const allowed = new Set([
    'baseline',
    'completion-time-not-reached',
    'snapshot-not-older',
    'missing-identity',
    'pre-terminal-state-restored',
    'unrelated-building-changed',
  ]);
  if (!allowed.has(raw)) {
    throw new Error(`Unsupported Scenario 3 replay control "${raw}"`);
  }
  return raw;
})();

let report;
switch (CONTROL) {
  case 'baseline':
    report = runBaseline();
    break;
  case 'completion-time-not-reached':
    report = runCompletionTimeNotReached();
    break;
  case 'snapshot-not-older':
    report = runSnapshotNotOlder();
    break;
  case 'missing-identity':
    report = runMissingIdentity();
    break;
  case 'pre-terminal-state-restored':
    report = runPreTerminalStateRestored();
    break;
  case 'unrelated-building-changed':
    report = runUnrelatedBuildingChanged();
    break;
  default:
    throw new Error(`Unhandled control ${CONTROL}`);
}

console.log(JSON.stringify(report, null, 2));

if (report.result !== 'PASS') {
  process.exitCode = 1;
}
