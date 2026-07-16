// @ts-check

import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { readFile } from 'node:fs/promises';
import { resolveLateAcknowledgementReconciliation } from '../../../src/game/buildings/resolveLateAcknowledgementReconciliation.js';

const COMMAND = 'node tests/characterization/slice-c/scenario-09.mjs';
const FIXTURE_PATH = 'tests/characterization/slice-c/scenario-09-fixture.json';
const HELPER = 'src/game/buildings/resolveLateAcknowledgementReconciliation.js';
const SCENARIO_ID = 'scenario-09';
const ACCEPTED_RESULT_REASON = 'accepted-narrow-late-ack-contract-held';
const BROAD_SCENARIO_CLASSIFICATION = 'UNCONFIRMED_RUNTIME_BEHAVIOR';

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
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

function buildCanonicalProjectedBuilding(building, canonicalDocId) {
  const projected = clone(building);

  if (!projected) {
    return projected;
  }

  projected.id = canonicalDocId ?? projected.id;
  projected.tempId = undefined;
  return projected;
}

function extractProtectedFields(building) {
  return {
    id: building?.id ?? null,
    clientBuildTraceId: building?.clientBuildTraceId ?? null,
    buildingId: building?.buildingId ?? null,
    ownerId: building?.ownerId ?? null,
    x: building?.x ?? null,
    y: building?.y ?? null,
    zoneId: building?.zoneId ?? null,
    type: building?.type ?? null,
    isLocal: building?.isLocal ?? null,
    isConstructing: building?.isConstructing ?? null,
    constructionEndTime: building?.constructionEndTime ?? null,
    workState: building?.workState ?? null,
    hp: building?.hp ?? null,
    maxHp: building?.maxHp ?? null,
    pendingDamage: building?.pendingDamage ?? null,
    status: building?.status ?? null,
    syncState: building?.syncState ?? null,
    timestamp: building?.timestamp ?? null,
  };
}

function extractUnrelatedFields(building) {
  return {
    localMarker: building?.localMarker ?? null,
    localNested: building?.localNested ?? null,
    serverMarker: building?.serverMarker ?? null,
    serverNested: building?.serverNested ?? null,
  };
}

function parseControl(argv, env, controlKeys) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_09_CHARACTERIZATION_CONTROL || 'baseline').trim();

  if (!controlKeys.includes(raw)) {
    throw new Error(`Unsupported Scenario 9 characterization control "${raw}"`);
  }

  return raw;
}

async function loadFixture() {
  return JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
}

function runReconciliation(input) {
  const snapshot = clone(input);
  const result = resolveLateAcknowledgementReconciliation({
    localBuilding: clone(input.localBuilding),
    serverBuilding: clone(input.serverBuilding),
    localInteractionAt: input.localInteractionAt,
    lastServerSyncAt: input.lastServerSyncAt,
    optimisticTempId: input.optimisticTempId,
    canonicalDocId: input.canonicalDocId,
    acknowledgementKind: input.acknowledgementKind,
    localIsProtected: input.localIsProtected,
    now: input.now,
  });

  return {
    inputPreserved: sameValue(input, snapshot),
    decision: result.decision,
    preserveLocal: result.preserveLocal,
    acceptServer: result.acceptServer,
    blocked: result.blocked,
    blockedReason: result.blockedReason,
    identityRemap: result.identityRemap,
    projectedBuilding: result.projectedBuilding,
    protectedFields: extractProtectedFields(result.projectedBuilding),
    unrelatedFields: extractUnrelatedFields(result.projectedBuilding),
  };
}

function buildReplayCaseExpectation(kind, fixture) {
  const canonicalDocId = fixture.reconciliationContext.canonicalDocId;

  switch (kind) {
    case 'preserve-local':
      return {
        decision: 'preserve_local',
        preserveLocal: true,
        acceptServer: false,
        blocked: false,
        blockedReason: undefined,
        identityRemap: {
          tempId: fixture.reconciliationContext.optimisticTempId,
          docId: canonicalDocId,
        },
        projectedBuilding: clone(fixture.expectedPreserveLocalResult),
        protectedFields: extractProtectedFields(fixture.expectedPreserveLocalResult),
        unrelatedFields: extractUnrelatedFields(fixture.localBuilding),
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
      };
    case 'accept-server':
      return {
        decision: 'accept_server',
        preserveLocal: false,
        acceptServer: true,
        blocked: false,
        blockedReason: undefined,
        identityRemap: {
          tempId: fixture.reconciliationContext.optimisticTempId,
          docId: canonicalDocId,
        },
        projectedBuilding: buildCanonicalProjectedBuilding(fixture.acceptServerCase.serverBuilding, canonicalDocId),
        protectedFields: extractProtectedFields(
          buildCanonicalProjectedBuilding(fixture.acceptServerCase.serverBuilding, canonicalDocId),
        ),
        unrelatedFields: extractUnrelatedFields(fixture.acceptServerCase.serverBuilding),
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
      };
    case 'projected-state-with-stale-identity-context':
      return {
        decision: 'blocked_identity_mismatch',
        preserveLocal: false,
        acceptServer: false,
        blocked: true,
        blockedReason: 'identity-mismatch',
        identityRemap: undefined,
        projectedBuilding: undefined,
        protectedFields: extractProtectedFields(undefined),
        unrelatedFields: extractUnrelatedFields(undefined),
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
      };
    default:
      throw new Error(`Unsupported replay case "${kind}"`);
  }
}

function buildControlExpectation(control, fixture) {
  const controlEntry = fixture.controls.find((entry) => entry.id === control);

  if (!controlEntry) {
    throw new Error(`Missing control expectation for "${control}"`);
  }

  return {
    result: controlEntry.expectedStatus,
    reason: controlEntry.expectedReason,
    productionSourceExecution: controlEntry.productionSourceExecution,
    sourceBoundaryExecuted: controlEntry.sourceBoundaryExecuted,
  };
}

function buildReplayUnit(fixture) {
  const preserveLocalInput = {
    localBuilding: clone(fixture.localBuilding),
    serverBuilding: clone(fixture.serverBuilding),
    ...clone(fixture.reconciliationContext),
  };
  const preserveLocal = runReconciliation(preserveLocalInput);
  const preserveLocalInputSnapshot = clone(preserveLocalInput);

  const acceptServerInput = {
    localBuilding: clone(fixture.acceptServerCase.localBuilding),
    serverBuilding: clone(fixture.acceptServerCase.serverBuilding),
    ...clone(fixture.acceptServerCase.reconciliationContext),
  };
  const acceptServer = runReconciliation(acceptServerInput);
  const acceptServerInputSnapshot = clone(acceptServerInput);

  const reentryInput = {
    localBuilding: clone(preserveLocal.projectedBuilding),
    serverBuilding: clone(fixture.serverBuilding),
    ...clone(fixture.reconciliationContext),
  };
  const reentry = runReconciliation(reentryInput);
  const reentryInputSnapshot = clone(reentryInput);

  const expectedAcceptServerProjectedBuilding = buildCanonicalProjectedBuilding(
    fixture.acceptServerCase.serverBuilding,
    fixture.reconciliationContext.canonicalDocId,
  );

  const matches =
    preserveLocal.decision === 'preserve_local' &&
    preserveLocal.preserveLocal === true &&
    preserveLocal.acceptServer === false &&
    preserveLocal.blocked === false &&
    preserveLocal.blockedReason === undefined &&
    sameValue(preserveLocal.projectedBuilding, fixture.expectedPreserveLocalResult) &&
    sameValue(preserveLocal.identityRemap, {
      tempId: fixture.reconciliationContext.optimisticTempId,
      docId: fixture.reconciliationContext.canonicalDocId,
    }) &&
    acceptServer.decision === 'accept_server' &&
    acceptServer.preserveLocal === false &&
    acceptServer.acceptServer === true &&
    acceptServer.blocked === false &&
    acceptServer.blockedReason === undefined &&
    sameValue(acceptServer.projectedBuilding, expectedAcceptServerProjectedBuilding) &&
    sameValue(acceptServer.identityRemap, {
      tempId: fixture.reconciliationContext.optimisticTempId,
      docId: fixture.reconciliationContext.canonicalDocId,
    }) &&
    reentry.decision === 'blocked_identity_mismatch' &&
    reentry.preserveLocal === false &&
    reentry.acceptServer === false &&
    reentry.blocked === true &&
    reentry.blockedReason === 'identity-mismatch' &&
    reentry.identityRemap === undefined &&
    sameValue(reentry.projectedBuilding, reentryInputSnapshot.localBuilding) &&
    preserveLocal.inputPreserved &&
    acceptServer.inputPreserved &&
    reentry.inputPreserved &&
    sameValue(preserveLocalInput, preserveLocalInputSnapshot) &&
    sameValue(acceptServerInput, acceptServerInputSnapshot) &&
    sameValue(reentryInput, reentryInputSnapshot);

  const replayUnit = {
    preserveLocal,
    acceptServer,
    projectedStateReentry: reentry,
    expectedPreserveLocalResult: clone(fixture.expectedPreserveLocalResult),
    expectedAcceptServerResult: expectedAcceptServerProjectedBuilding,
    expectedProjectedStateReentryResult: reentryInputSnapshot.localBuilding,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    inputPreserved:
      preserveLocal.inputPreserved && acceptServer.inputPreserved && reentry.inputPreserved,
  };

  return {
    ...replayUnit,
    status: matches ? 'PASS' : 'FAIL',
    reason: matches ? ACCEPTED_RESULT_REASON : 'unexpected-helper-result',
    matches,
  };
}

function buildControlCase(fixture, control) {
  const canonicalDocId = fixture.reconciliationContext.canonicalDocId;
  const base = {
    localBuilding: clone(fixture.localBuilding),
    serverBuilding: clone(fixture.serverBuilding),
    ...clone(fixture.reconciliationContext),
  };

  const caseInput = {
    ...base,
  };
  const caseExpected = {
    ...buildReplayCaseExpectation('preserve-local', fixture),
  };
  let productionSourceExecution = true;
  let sourceBoundaryExecuted = true;

  function setBlockedProjectionToLocalState() {
    caseExpected.projectedBuilding = clone(base.localBuilding);
    caseExpected.protectedFields = extractProtectedFields(caseExpected.projectedBuilding);
    caseExpected.unrelatedFields = extractUnrelatedFields(caseExpected.projectedBuilding);
  }

  switch (control) {
    case 'preserve-local':
      break;
    case 'accept-server':
      caseInput.localBuilding = clone(fixture.acceptServerCase.localBuilding);
      caseInput.serverBuilding = clone(fixture.acceptServerCase.serverBuilding);
      Object.assign(caseInput, clone(fixture.acceptServerCase.reconciliationContext));
      Object.assign(caseExpected, buildReplayCaseExpectation('accept-server', fixture));
      break;
    case 'identity-remap':
      break;
    case 'protected-field-regresses':
      caseExpected.projectedBuilding = clone(fixture.expectedPreserveLocalResult);
      caseExpected.projectedBuilding.hp = 999;
      caseExpected.protectedFields = extractProtectedFields(caseExpected.projectedBuilding);
      caseExpected.blockedReason = undefined;
      break;
    case 'unrelated-field-changed':
      caseExpected.projectedBuilding = clone(fixture.expectedPreserveLocalResult);
      caseExpected.projectedBuilding.localMarker = 'changed';
      caseExpected.unrelatedFields = extractUnrelatedFields(caseExpected.projectedBuilding);
      caseExpected.blockedReason = undefined;
      break;
    case 'missing-local-building':
      caseInput.localBuilding = undefined;
      caseExpected.decision = 'blocked_missing_local_building';
      caseExpected.preserveLocal = false;
      caseExpected.acceptServer = false;
      caseExpected.blocked = true;
      caseExpected.blockedReason = 'missing-local-building';
      caseExpected.identityRemap = undefined;
      caseExpected.projectedBuilding = undefined;
      caseExpected.protectedFields = extractProtectedFields(undefined);
      caseExpected.unrelatedFields = extractUnrelatedFields(undefined);
      break;
    case 'missing-server-building':
      caseInput.serverBuilding = undefined;
      caseExpected.decision = 'blocked_missing_server_building';
      caseExpected.preserveLocal = false;
      caseExpected.acceptServer = false;
      caseExpected.blocked = true;
      caseExpected.blockedReason = 'missing-server-building';
      caseExpected.identityRemap = undefined;
      setBlockedProjectionToLocalState();
      break;
    case 'missing-local-interaction-at':
      caseInput.localInteractionAt = undefined;
      caseExpected.decision = 'blocked_invalid_timestamp';
      caseExpected.preserveLocal = false;
      caseExpected.acceptServer = false;
      caseExpected.blocked = true;
      caseExpected.blockedReason = 'invalid-timestamp';
      caseExpected.identityRemap = undefined;
      setBlockedProjectionToLocalState();
      break;
    case 'missing-last-server-sync-at':
      caseInput.lastServerSyncAt = undefined;
      caseExpected.decision = 'blocked_invalid_timestamp';
      caseExpected.preserveLocal = false;
      caseExpected.acceptServer = false;
      caseExpected.blocked = true;
      caseExpected.blockedReason = 'invalid-timestamp';
      caseExpected.identityRemap = undefined;
      setBlockedProjectionToLocalState();
      break;
    case 'invalid-timestamp':
      caseInput.now = Number.NaN;
      caseExpected.decision = 'blocked_invalid_timestamp';
      caseExpected.preserveLocal = false;
      caseExpected.acceptServer = false;
      caseExpected.blocked = true;
      caseExpected.blockedReason = 'invalid-timestamp';
      caseExpected.identityRemap = undefined;
      setBlockedProjectionToLocalState();
      break;
    case 'invalid-acknowledgement-kind':
      caseInput.acknowledgementKind = 'retry';
      caseExpected.decision = 'blocked_invalid_acknowledgement_kind';
      caseExpected.preserveLocal = false;
      caseExpected.acceptServer = false;
      caseExpected.blocked = true;
      caseExpected.blockedReason = 'invalid-acknowledgement-kind';
      caseExpected.identityRemap = undefined;
      setBlockedProjectionToLocalState();
      break;
    case 'projected-state-with-stale-identity-context':
      caseInput.localBuilding = clone(fixture.expectedPreserveLocalResult);
      caseExpected.decision = 'blocked_identity_mismatch';
      caseExpected.preserveLocal = false;
      caseExpected.acceptServer = false;
      caseExpected.blocked = true;
      caseExpected.blockedReason = 'identity-mismatch';
      caseExpected.identityRemap = undefined;
      caseExpected.projectedBuilding = clone(fixture.expectedPreserveLocalResult);
      caseExpected.protectedFields = extractProtectedFields(caseExpected.projectedBuilding);
      caseExpected.unrelatedFields = extractUnrelatedFields(caseExpected.projectedBuilding);
      break;
    case 'production-boundary-not-available':
      productionSourceExecution = false;
      sourceBoundaryExecuted = false;
      return {
        control,
        status: 'BLOCKED',
        reason: 'production-boundary-not-available',
        productionSourceExecution,
        sourceBoundaryExecuted,
        caseResult: null,
      };
    case 'live-pocketbase-required':
      productionSourceExecution = false;
      sourceBoundaryExecuted = false;
      return {
        control,
        status: 'BLOCKED',
        reason: 'live-pocketbase-required',
        productionSourceExecution,
        sourceBoundaryExecuted,
        caseResult: null,
      };
    case 'timeout-order-required':
      productionSourceExecution = false;
      sourceBoundaryExecuted = false;
      return {
        control,
        status: 'BLOCKED',
        reason: 'timeout-order-required',
        productionSourceExecution,
        sourceBoundaryExecuted,
        caseResult: null,
      };
    case 'reconnect-order-required':
      productionSourceExecution = false;
      sourceBoundaryExecuted = false;
      return {
        control,
        status: 'BLOCKED',
        reason: 'reconnect-order-required',
        productionSourceExecution,
        sourceBoundaryExecuted,
        caseResult: null,
      };
    case 'realtime-order-required':
      productionSourceExecution = false;
      sourceBoundaryExecuted = false;
      return {
        control,
        status: 'BLOCKED',
        reason: 'realtime-order-required',
        productionSourceExecution,
        sourceBoundaryExecuted,
        caseResult: null,
      };
    case 'multi-client-authority-required':
      productionSourceExecution = false;
      sourceBoundaryExecuted = false;
      return {
        control,
        status: 'BLOCKED',
        reason: 'multi-client-authority-required',
        productionSourceExecution,
        sourceBoundaryExecuted,
        caseResult: null,
      };
    default:
      throw new Error(`Unsupported Scenario 9 control "${control}"`);
  }

  const caseResult = runReconciliation(caseInput);
  const inputPreserved = caseResult.inputPreserved;
  const matches =
    caseResult.decision === caseExpected.decision &&
    caseResult.preserveLocal === caseExpected.preserveLocal &&
    caseResult.acceptServer === caseExpected.acceptServer &&
    caseResult.blocked === caseExpected.blocked &&
    caseResult.blockedReason === caseExpected.blockedReason &&
    sameValue(caseResult.identityRemap, caseExpected.identityRemap) &&
    sameValue(caseResult.projectedBuilding, caseExpected.projectedBuilding) &&
    sameValue(caseResult.protectedFields, caseExpected.protectedFields) &&
    sameValue(caseResult.unrelatedFields, caseExpected.unrelatedFields) &&
    inputPreserved;

  const status = matches ? caseExpected.blocked ? 'BLOCKED' : 'PASS' : 'FAIL';
  const reason = matches
    ? caseExpected.blocked
      ? caseExpected.blockedReason
      : caseExpected.decision
    : 'unexpected-helper-result';

  return {
    control,
    status,
    reason,
    productionSourceExecution,
    sourceBoundaryExecuted,
    caseResult: {
      ...caseResult,
      expected: caseExpected,
      inputPreserved,
      matches,
    },
  };
}

function compareExecutions(execution1, execution2) {
  return {
    identical: sameValue(execution1, execution2),
    sameStatus: execution1.status === execution2.status,
    sameReason: execution1.reason === execution2.reason,
    sameProductionSourceExecution:
      execution1.productionSourceExecution === execution2.productionSourceExecution,
    sameSourceBoundaryExecuted: execution1.sourceBoundaryExecuted === execution2.sourceBoundaryExecuted,
    samePayload: sameValue(execution1, execution2),
  };
}

function buildBaselineReport(fixture) {
  const replayUnit1 = buildReplayUnit(fixture);
  const replayUnit2 = buildReplayUnit(fixture);
  const comparison = compareExecutions(replayUnit1, replayUnit2);
  const pass = replayUnit1.status === 'PASS' && replayUnit2.status === 'PASS' && comparison.identical;

  const report = {
    command: COMMAND,
    taskId: 'T100',
    scenarioId: fixture.scenarioId,
    acceptedContract: fixture.proposedContract,
    acceptedContractMetadata: fixture.proposedContract,
    selectedSubcase: fixture.selectedSubcase,
    broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
    helper: HELPER,
    fixturePath: FIXTURE_PATH,
    productionSourceExecution: true,
    sourceBoundaryExecuted: true,
    scenarioExecution1: replayUnit1,
    scenarioExecution2: replayUnit2,
    comparison,
    protectedFields: fixture.protectedFields,
    unrelatedFields: fixture.unrelatedFields,
    explicitExclusions: fixture.excludedContracts,
    callerOwnedSideEffects: fixture.callerOwnedSideEffects,
    stopConditions: fixture.stopConditions,
    limitations: fixture.limitations,
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

function buildControlReport(control, fixture, controlExpectations) {
  const execution1 = buildControlCase(fixture, control);
  const execution2 = buildControlCase(fixture, control);
  const comparison = compareExecutions(execution1, execution2);
  const expected = controlExpectations[control];
  const matched =
    execution1.status === execution2.status &&
    execution1.reason === execution2.reason &&
    comparison.identical;

  const status = matched ? execution1.status : 'FAIL';
  const reason = matched ? execution1.reason : 'unexpected-helper-result';
  const productionSourceExecution = execution1.productionSourceExecution;
  const sourceBoundaryExecuted = execution1.sourceBoundaryExecuted;

  const report = {
    command: `${COMMAND} --control=${control}`,
    taskId: 'T100',
    scenarioId: fixture.scenarioId,
    acceptedContract: fixture.proposedContract,
    acceptedContractMetadata: fixture.proposedContract,
    selectedSubcase: fixture.selectedSubcase,
    broaderScenarioClassification: BROAD_SCENARIO_CLASSIFICATION,
    helper: HELPER,
    fixturePath: FIXTURE_PATH,
    control,
    productionSourceExecution,
    sourceBoundaryExecuted,
    scenarioExecution1: execution1,
    scenarioExecution2: execution2,
    comparison,
    explicitExclusions: fixture.excludedContracts,
    callerOwnedSideEffects: fixture.callerOwnedSideEffects,
    stopConditions: fixture.stopConditions,
    limitations: fixture.limitations,
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

  report.exitGate = buildExitGateReport(report, control, controlExpectations);
  return report;
}

function buildExitGateReport(report, control, controlExpectations) {
  if (control === 'baseline') {
    const mismatches = [];
    const checks = [
      ['result', report.result, 'PASS'],
      ['reason', report.reason, ACCEPTED_RESULT_REASON],
      ['productionSourceExecution', report.productionSourceExecution, true],
      ['sourceBoundaryExecuted', report.sourceBoundaryExecuted, true],
    ];

    for (const [label, actual, expected] of checks) {
      if (!Object.is(actual, expected)) {
        mismatches.push(`${label}: expected ${JSON.stringify(expected)} received ${JSON.stringify(actual)}`);
      }
    }

    return {
      mode: 'baseline',
      expectedResult: 'PASS',
      expectedReason: ACCEPTED_RESULT_REASON,
      expectedProductionSourceExecution: true,
      expectedSourceBoundaryExecuted: true,
      actualResult: report.result,
      actualReason: report.reason,
      actualProductionSourceExecution: report.productionSourceExecution,
      actualSourceBoundaryExecuted: report.sourceBoundaryExecuted,
      matched: mismatches.length === 0,
      mismatches,
      failureReason: mismatches.length === 0 ? null : 'baseline-exit-contract-mismatch',
    };
  }

  const expected = controlExpectations[control];
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

function verifyBaselineGateStrictness(report) {
  const alteredReports = [
    {
      ...report,
      reason: '__wrong-reason__',
    },
    {
      ...report,
      productionSourceExecution: false,
    },
    {
      ...report,
      sourceBoundaryExecuted: false,
    },
  ];

  for (const alteredReport of alteredReports) {
    const gate = buildExitGateReport(alteredReport, 'baseline');
    assert.strictEqual(gate.matched, false);
  }
}

function parseControlExpectations(fixture) {
  return Object.fromEntries(
    fixture.controls.map((control) => [
      control.id,
      {
        result: control.expectedStatus,
        reason: control.expectedReason,
        productionSourceExecution: control.productionSourceExecution,
        sourceBoundaryExecuted: control.sourceBoundaryExecuted,
      },
    ]),
  );
}

const fixture = deepFreeze(await loadFixture());
const CONTROL_KEYS = ['baseline', ...fixture.controls.map((control) => control.id)];
const CONTROL = parseControl(process.argv.slice(2), process.env, CONTROL_KEYS);
const CONTROL_EXPECTATIONS = parseControlExpectations(fixture);

const report = CONTROL === 'baseline'
  ? buildBaselineReport(fixture)
  : buildControlReport(CONTROL, fixture, CONTROL_EXPECTATIONS);

if (CONTROL === 'baseline') {
  verifyBaselineGateStrictness(report);
}

console.log(JSON.stringify(report, null, 2));

if (CONTROL === 'baseline') {
  if (!report.exitGate?.matched) {
    process.exitCode = 1;
    console.error(
      JSON.stringify(
        {
          type: 'baseline-exit-contract-mismatch',
          exitGate: report.exitGate,
        },
        null,
        2,
      ),
    );
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
