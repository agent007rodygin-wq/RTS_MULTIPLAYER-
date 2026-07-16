// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @typedef {Object} LateAcknowledgementReconciliationIdentityRemap
 * @property {string | number | undefined} [tempId]
 * @property {string | number | undefined} [docId]
 */

/**
 * @typedef {Object} LateAcknowledgementReconciliationInput
 * @property {PlacedBuilding | undefined} [localBuilding]
 * @property {PlacedBuilding | undefined} [serverBuilding]
 * @property {number | undefined} [localInteractionAt]
 * @property {number | undefined} [lastServerSyncAt]
 * @property {string | number | undefined} [optimisticTempId]
 * @property {string | number | undefined} [canonicalDocId]
 * @property {'ack' | 'snapshot'} acknowledgementKind
 * @property {boolean | undefined} [localIsProtected]
 * @property {number} now
 */

/**
 * @typedef {Object} LateAcknowledgementReconciliationResult
 * @property {PlacedBuilding | undefined} projectedBuilding
 * @property {'preserve_local' | 'accept_server' | 'blocked_missing_local_building' | 'blocked_missing_server_building' | 'blocked_missing_identity' | 'blocked_invalid_timestamp' | 'blocked_invalid_acknowledgement_kind' | 'blocked_identity_mismatch'} decision
 * @property {boolean} preserveLocal
 * @property {boolean} acceptServer
 * @property {LateAcknowledgementReconciliationIdentityRemap | undefined} identityRemap
 * @property {boolean} blocked
 * @property {string | undefined} blockedReason
 */

const VALID_ACKNOWLEDGEMENT_KINDS = new Set(['ack', 'snapshot']);

/**
 * @param {unknown} value
 * @returns {value is PlacedBuilding}
 */
function isBuildingObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @param {string | number | undefined} value
 * @returns {string}
 */
function normalizeId(value) {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * @param {PlacedBuilding} building
 * @param {string | number | undefined} canonicalDocId
 * @returns {PlacedBuilding}
 */
function remapProjectedBuilding(building, canonicalDocId) {
  const remappedId = normalizeId(canonicalDocId || building.id);
  return {
    ...building,
    id: remappedId,
    tempId: undefined,
  };
}

/**
 * Resolve the deterministic late-response reconciliation fence for a
 * single optimistic building acknowledgement.
 *
 * The helper stays pure: it only compares the source-backed inputs and
 * returns the projected building plus the caller-owned identity remap
 * instructions.
 *
 * @param {LateAcknowledgementReconciliationInput} input
 * @returns {LateAcknowledgementReconciliationResult}
 */
export function resolveLateAcknowledgementReconciliation(input) {
  const {
    localBuilding,
    serverBuilding,
    localInteractionAt,
    lastServerSyncAt,
    optimisticTempId,
    canonicalDocId,
    acknowledgementKind,
    localIsProtected,
    now,
  } = input || {};

  if (!isBuildingObject(localBuilding)) {
    return {
      projectedBuilding: localBuilding,
      decision: 'blocked_missing_local_building',
      preserveLocal: false,
      acceptServer: false,
      identityRemap: undefined,
      blocked: true,
      blockedReason: 'missing-local-building',
    };
  }

  if (!isBuildingObject(serverBuilding)) {
    return {
      projectedBuilding: localBuilding,
      decision: 'blocked_missing_server_building',
      preserveLocal: false,
      acceptServer: false,
      identityRemap: undefined,
      blocked: true,
      blockedReason: 'missing-server-building',
    };
  }

  if (
    !Number.isFinite(Number(now)) ||
    !Number.isFinite(Number(localInteractionAt)) ||
    !Number.isFinite(Number(lastServerSyncAt))
  ) {
    return {
      projectedBuilding: localBuilding,
      decision: 'blocked_invalid_timestamp',
      preserveLocal: false,
      acceptServer: false,
      identityRemap: undefined,
      blocked: true,
      blockedReason: 'invalid-timestamp',
    };
  }

  if (!VALID_ACKNOWLEDGEMENT_KINDS.has(String(acknowledgementKind))) {
    return {
      projectedBuilding: localBuilding,
      decision: 'blocked_invalid_acknowledgement_kind',
      preserveLocal: false,
      acceptServer: false,
      identityRemap: undefined,
      blocked: true,
      blockedReason: 'invalid-acknowledgement-kind',
    };
  }

  const localId = normalizeId(localBuilding.id);
  const localTempId = normalizeId(localBuilding.tempId);
  const serverId = normalizeId(serverBuilding.id);
  const canonicalId = normalizeId(canonicalDocId || serverId);
  const optimisticId = normalizeId(optimisticTempId || localTempId || localId);

  if (!localId || !serverId || !canonicalId || !optimisticId) {
    return {
      projectedBuilding: localBuilding,
      decision: 'blocked_missing_identity',
      preserveLocal: false,
      acceptServer: false,
      identityRemap: undefined,
      blocked: true,
      blockedReason: 'missing-identity',
    };
  }

  const optimisticMatchesLocal = optimisticId === localId || optimisticId === localTempId;
  const canonicalMatchesServer = canonicalId === serverId;

  if (!optimisticMatchesLocal || !canonicalMatchesServer) {
    return {
      projectedBuilding: localBuilding,
      decision: 'blocked_identity_mismatch',
      preserveLocal: false,
      acceptServer: false,
      identityRemap: undefined,
      blocked: true,
      blockedReason: 'identity-mismatch',
    };
  }

  const preserveLocal = Boolean(localIsProtected) || Number(localInteractionAt) > Number(lastServerSyncAt);
  const identityRemap = optimisticId !== canonicalId
    ? {
        tempId: optimisticId,
        docId: canonicalId,
      }
    : undefined;

  return {
    projectedBuilding: remapProjectedBuilding(
      preserveLocal ? localBuilding : serverBuilding,
      canonicalId,
    ),
    decision: preserveLocal ? 'preserve_local' : 'accept_server',
    preserveLocal,
    acceptServer: !preserveLocal,
    identityRemap,
    blocked: false,
    blockedReason: undefined,
  };
}
