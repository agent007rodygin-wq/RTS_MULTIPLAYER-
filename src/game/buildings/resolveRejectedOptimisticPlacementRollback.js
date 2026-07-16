// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @typedef {Object} RejectedOptimisticPlacementRollbackIdentity
 * @property {string | number | undefined} [tempId]
 * @property {string | number | undefined} [docId]
 */

/**
 * @typedef {Object} RejectedOptimisticPlacementSpentResourceDeltas
 * @property {number | undefined} [goldDelta]
 * @property {number | undefined} [rubiesDelta]
 * @property {Record<number, number> | undefined} [inventoryDeltas]
 */

/**
 * @typedef {Object} RejectedOptimisticPlacementRollbackInput
 * @property {PlacedBuilding[] | undefined} [currentBuildings]
 * @property {PlacedBuilding | undefined} [optimisticBuilding]
 * @property {RejectedOptimisticPlacementSpentResourceDeltas | undefined} [spentResourceDeltas]
 * @property {RejectedOptimisticPlacementRollbackIdentity | undefined} [rollbackIdentity]
 * @property {boolean | undefined} [alreadyRestored]
 */

/**
 * @typedef {Object} RejectedOptimisticPlacementRollbackResourceRestoration
 * @property {number} goldDelta
 * @property {number} rubiesDelta
 * @property {Record<number, number>} inventoryDeltas
 */

/**
 * @typedef {Object} RejectedOptimisticPlacementRollbackResult
 * @property {PlacedBuilding[] | undefined} projectedBuildings
 * @property {RejectedOptimisticPlacementRollbackResourceRestoration} projectedResourceRestoration
 * @property {boolean} removeTemporaryBuilding
 * @property {boolean} restored
 * @property {boolean} blocked
 * @property {string | undefined} blockedReason
 * @property {'rollback_rejected_placement' | 'no_rollback' | 'blocked_invalid_input' | 'blocked_missing_current_buildings' | 'blocked_missing_optimistic_building' | 'blocked_missing_rollback_identity' | 'blocked_missing_resource_deltas' | 'blocked_invalid_placement_state' | 'blocked_identity_mismatch'} decision
 */

/**
 * @returns {RejectedOptimisticPlacementRollbackResourceRestoration}
 */
function zeroResourceRestoration() {
  return {
    goldDelta: 0,
    rubiesDelta: 0,
    inventoryDeltas: /** @type {Record<number, number>} */ ({}),
  };
}

/**
 * @param {Record<number, number> | undefined} inventoryDeltas
 * @returns {Record<number, number>}
 */
function invertInventoryDeltas(inventoryDeltas) {
  const projected = /** @type {Record<number, number>} */ ({});
  Object.entries(inventoryDeltas || {}).forEach(([resourceId, amount]) => {
    const numericAmount = Number(amount) || 0;
    projected[Number(resourceId)] = numericAmount === 0 ? 0 : -numericAmount;
  });
  return projected;
}

function normalizeId(value) {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * Resolve the deterministic rollback fence for a rejected optimistic building
 * placement.
 *
 * The helper stays pure: it only decides whether the rollback may occur and,
 * when eligible, projects the restored building collection plus the exact
 * resource deltas that were spent for the rejected placement.
 *
 * @param {RejectedOptimisticPlacementRollbackInput} input
 * @returns {RejectedOptimisticPlacementRollbackResult}
 */
export function resolveRejectedOptimisticPlacementRollback(input) {
  const currentBuildings = input?.currentBuildings;
  const optimisticBuilding = input?.optimisticBuilding;
  const spentResourceDeltas = input?.spentResourceDeltas;
  const rollbackIdentity = input?.rollbackIdentity;
  const alreadyRestored = Boolean(input?.alreadyRestored);

  if (!Array.isArray(currentBuildings)) {
    return {
      projectedBuildings: currentBuildings,
      projectedResourceRestoration: zeroResourceRestoration(),
      removeTemporaryBuilding: false,
      restored: false,
      blocked: true,
      blockedReason: 'missing-current-buildings',
      decision: 'blocked_missing_current_buildings',
    };
  }

  if (!optimisticBuilding || typeof optimisticBuilding !== 'object') {
    return {
      projectedBuildings: [...currentBuildings],
      projectedResourceRestoration: zeroResourceRestoration(),
      removeTemporaryBuilding: false,
      restored: false,
      blocked: true,
      blockedReason: 'missing-optimistic-building',
      decision: 'blocked_missing_optimistic_building',
    };
  }

  if (optimisticBuilding.id === undefined || optimisticBuilding.id === null || optimisticBuilding.id === '') {
    return {
      projectedBuildings: [...currentBuildings],
      projectedResourceRestoration: zeroResourceRestoration(),
      removeTemporaryBuilding: false,
      restored: false,
      blocked: true,
      blockedReason: 'invalid-optimistic-placement-state',
      decision: 'blocked_invalid_placement_state',
    };
  }

  if (!rollbackIdentity || (rollbackIdentity.tempId === undefined && rollbackIdentity.docId === undefined)) {
    return {
      projectedBuildings: [...currentBuildings],
      projectedResourceRestoration: zeroResourceRestoration(),
      removeTemporaryBuilding: false,
      restored: false,
      blocked: true,
      blockedReason: 'missing-rollback-identity',
      decision: 'blocked_missing_rollback_identity',
    };
  }

  if (!spentResourceDeltas || typeof spentResourceDeltas !== 'object') {
    return {
      projectedBuildings: [...currentBuildings],
      projectedResourceRestoration: zeroResourceRestoration(),
      removeTemporaryBuilding: false,
      restored: false,
      blocked: true,
      blockedReason: 'missing-resource-deltas',
      decision: 'blocked_missing_resource_deltas',
    };
  }

  const rollbackTempId = normalizeId(rollbackIdentity.tempId || optimisticBuilding.tempId || optimisticBuilding.id);
  const rollbackDocId = normalizeId(rollbackIdentity.docId);
  const optimisticBuildingId = normalizeId(optimisticBuilding.id);
  const optimisticTempId = normalizeId(optimisticBuilding.tempId);

  if (!rollbackTempId || (optimisticTempId && rollbackTempId !== optimisticTempId) || rollbackTempId !== optimisticBuildingId && !alreadyRestored) {
    return {
      projectedBuildings: [...currentBuildings],
      projectedResourceRestoration: zeroResourceRestoration(),
      removeTemporaryBuilding: false,
      restored: false,
      blocked: true,
      blockedReason: 'rollback-identity-mismatch',
      decision: 'blocked_identity_mismatch',
    };
  }

  const hasRollbackCandidate = currentBuildings.some((building) => {
    const buildingId = normalizeId(building?.id);
    const buildingTempId = normalizeId(building?.tempId);
    return buildingId === rollbackTempId || buildingId === rollbackDocId || buildingTempId === rollbackTempId || buildingTempId === rollbackDocId;
  });

  if (!hasRollbackCandidate || alreadyRestored) {
    return {
      projectedBuildings: [...currentBuildings],
      projectedResourceRestoration: zeroResourceRestoration(),
      removeTemporaryBuilding: false,
      restored: false,
      blocked: false,
      blockedReason: undefined,
      decision: 'no_rollback',
    };
  }

  const projectedBuildings = currentBuildings.filter((building) => {
    const buildingId = normalizeId(building?.id);
    const buildingTempId = normalizeId(building?.tempId);
    return !(
      buildingId === rollbackTempId ||
      buildingId === rollbackDocId ||
      buildingTempId === rollbackTempId ||
      buildingTempId === rollbackDocId
    );
  });

  return {
    projectedBuildings,
    projectedResourceRestoration: {
      goldDelta: (() => {
        const numericAmount = Number(spentResourceDeltas.goldDelta) || 0;
        return numericAmount === 0 ? 0 : -numericAmount;
      })(),
      rubiesDelta: (() => {
        const numericAmount = Number(spentResourceDeltas.rubiesDelta) || 0;
        return numericAmount === 0 ? 0 : -numericAmount;
      })(),
      inventoryDeltas: invertInventoryDeltas(spentResourceDeltas.inventoryDeltas),
    },
    removeTemporaryBuilding: true,
    restored: true,
    blocked: false,
    blockedReason: undefined,
    decision: 'rollback_rejected_placement',
  };
}
