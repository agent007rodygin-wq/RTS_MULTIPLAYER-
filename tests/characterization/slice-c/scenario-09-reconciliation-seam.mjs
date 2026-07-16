// @ts-check

import assert from 'node:assert/strict';
import { resolveLateAcknowledgementReconciliation } from '../../../src/game/buildings/resolveLateAcknowledgementReconciliation.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildLocalBuilding(overrides = {}) {
  return {
    id: 'temp-ack-9',
    tempId: 'temp-ack-9',
    clientBuildTraceId: 'trace-ack-9',
    buildingId: 301,
    ownerId: 'user-9',
    x: 18,
    y: 11,
    zoneId: 'zone-2',
    isLocal: true,
    status: 'normal',
    syncState: 'pending',
    timestamp: 1704067201000,
    localMarker: 'keep-me',
    localNested: { stage: 'optimistic' },
    ...overrides,
  };
}

function buildServerBuilding(overrides = {}) {
  return {
    id: 'doc-ack-9',
    clientBuildTraceId: 'trace-ack-9',
    buildingId: 301,
    ownerId: 'user-9',
    x: 18,
    y: 11,
    zoneId: 'zone-2',
    isLocal: false,
    status: 'normal',
    syncState: 'synced',
    timestamp: 1704067202000,
    serverMarker: 'keep-server',
    serverNested: { stage: 'acknowledged' },
    ...overrides,
  };
}

function assertPreservedIdentity(result, canonicalDocId) {
  assert.equal(result.projectedBuilding.id, canonicalDocId);
  assert.equal(result.projectedBuilding.tempId, undefined);
  assert.equal(result.identityRemap.docId, canonicalDocId);
}

function run() {
  const optimisticTempId = 'temp-ack-9';
  const canonicalDocId = 'doc-ack-9';
  const preservedLocal = buildLocalBuilding();
  const acceptedServer = buildServerBuilding();

  const preserveLocalInput = {
    localBuilding: preservedLocal,
    serverBuilding: acceptedServer,
    localInteractionAt: 1704067210000,
    lastServerSyncAt: 1704067200000,
    optimisticTempId,
    canonicalDocId,
    acknowledgementKind: 'ack',
    localIsProtected: true,
    now: 1704067215000,
  };
  const preserveLocalSnapshot = clone(preserveLocalInput);

  const preserveLocalResult = resolveLateAcknowledgementReconciliation(preserveLocalInput);
  assert.equal(preserveLocalResult.decision, 'preserve_local');
  assert.equal(preserveLocalResult.preserveLocal, true);
  assert.equal(preserveLocalResult.acceptServer, false);
  assert.equal(preserveLocalResult.blocked, false);
  assert.equal(preserveLocalResult.blockedReason, undefined);
  assert.ok(preserveLocalResult.projectedBuilding);
  assert.equal(preserveLocalResult.projectedBuilding.localMarker, 'keep-me');
  assert.deepEqual(preserveLocalResult.projectedBuilding.localNested, { stage: 'optimistic' });
  assertPreservedIdentity(preserveLocalResult, canonicalDocId);
  assert.deepEqual(preserveLocalInput, preserveLocalSnapshot);

  const preserveLocalSecondPass = resolveLateAcknowledgementReconciliation(clone(preserveLocalInput));
  assert.deepEqual(preserveLocalSecondPass, preserveLocalResult);

  const acceptServerInput = {
    localBuilding: buildLocalBuilding({
      localMarker: 'stale-local',
      localNested: { stage: 'stale' },
      timestamp: 1704067190000,
    }),
    serverBuilding: buildServerBuilding(),
    localInteractionAt: 1704067190000,
    lastServerSyncAt: 1704067200000,
    optimisticTempId,
    canonicalDocId,
    acknowledgementKind: 'snapshot',
    localIsProtected: false,
    now: 1704067215000,
  };

  const acceptServerSnapshot = clone(acceptServerInput);
  const acceptServerResult = resolveLateAcknowledgementReconciliation(acceptServerInput);
  assert.equal(acceptServerResult.decision, 'accept_server');
  assert.equal(acceptServerResult.preserveLocal, false);
  assert.equal(acceptServerResult.acceptServer, true);
  assert.equal(acceptServerResult.blocked, false);
  assert.equal(acceptServerResult.blockedReason, undefined);
  assert.ok(acceptServerResult.projectedBuilding);
  assert.equal(acceptServerResult.projectedBuilding.serverMarker, 'keep-server');
  assert.deepEqual(acceptServerResult.projectedBuilding.serverNested, { stage: 'acknowledged' });
  assertPreservedIdentity(acceptServerResult, canonicalDocId);
  assert.deepEqual(acceptServerInput, acceptServerSnapshot);

  const acceptServerSecondPass = resolveLateAcknowledgementReconciliation(clone(acceptServerInput));
  assert.deepEqual(acceptServerSecondPass, acceptServerResult);

  const missingLocalBuilding = resolveLateAcknowledgementReconciliation({
    localBuilding: undefined,
    serverBuilding: acceptedServer,
    localInteractionAt: 1704067210000,
    lastServerSyncAt: 1704067200000,
    optimisticTempId,
    canonicalDocId,
    acknowledgementKind: 'ack',
    localIsProtected: true,
    now: 1704067215000,
  });
  assert.equal(missingLocalBuilding.decision, 'blocked_missing_local_building');
  assert.equal(missingLocalBuilding.blocked, true);
  assert.equal(missingLocalBuilding.blockedReason, 'missing-local-building');

  const missingServerBuilding = resolveLateAcknowledgementReconciliation({
    localBuilding: preservedLocal,
    serverBuilding: undefined,
    localInteractionAt: 1704067210000,
    lastServerSyncAt: 1704067200000,
    optimisticTempId,
    canonicalDocId,
    acknowledgementKind: 'ack',
    localIsProtected: true,
    now: 1704067215000,
  });
  assert.equal(missingServerBuilding.decision, 'blocked_missing_server_building');
  assert.equal(missingServerBuilding.blocked, true);
  assert.equal(missingServerBuilding.blockedReason, 'missing-server-building');

  const invalidTimestamp = resolveLateAcknowledgementReconciliation({
    localBuilding: preservedLocal,
    serverBuilding: acceptedServer,
    localInteractionAt: Number.NaN,
    lastServerSyncAt: 1704067200000,
    optimisticTempId,
    canonicalDocId,
    acknowledgementKind: 'ack',
    localIsProtected: true,
    now: 1704067215000,
  });
  assert.equal(invalidTimestamp.decision, 'blocked_invalid_timestamp');
  assert.equal(invalidTimestamp.blocked, true);
  assert.equal(invalidTimestamp.blockedReason, 'invalid-timestamp');

  const invalidAckKind = resolveLateAcknowledgementReconciliation({
    localBuilding: preservedLocal,
    serverBuilding: acceptedServer,
    localInteractionAt: 1704067210000,
    lastServerSyncAt: 1704067200000,
    optimisticTempId,
    canonicalDocId,
    acknowledgementKind: 'retry',
    localIsProtected: true,
    now: 1704067215000,
  });
  assert.equal(invalidAckKind.decision, 'blocked_invalid_acknowledgement_kind');
  assert.equal(invalidAckKind.blocked, true);
  assert.equal(invalidAckKind.blockedReason, 'invalid-acknowledgement-kind');

  const identityMismatch = resolveLateAcknowledgementReconciliation({
    localBuilding: buildLocalBuilding({ id: 'temp-other', tempId: 'temp-other' }),
    serverBuilding: buildServerBuilding({ id: 'doc-other' }),
    localInteractionAt: 1704067210000,
    lastServerSyncAt: 1704067200000,
    optimisticTempId,
    canonicalDocId,
    acknowledgementKind: 'ack',
    localIsProtected: true,
    now: 1704067215000,
  });
  assert.equal(identityMismatch.decision, 'blocked_identity_mismatch');
  assert.equal(identityMismatch.blocked, true);
  assert.equal(identityMismatch.blockedReason, 'identity-mismatch');
}

try {
  run();
  console.log('PASS scenario-09-reconciliation-seam');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
