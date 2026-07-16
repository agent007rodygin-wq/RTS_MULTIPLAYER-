// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @typedef {import('../../../types').Building} Building
 */

/**
 * @typedef {Object} LocalUpgradeTransformationInput
 * @property {PlacedBuilding | undefined} [building]
 * @property {Building | undefined} [sourceBuildingInfo]
 * @property {Building | undefined} [targetBuildingInfo]
 * @property {number} now
 */

/**
 * @typedef {Object} LocalUpgradeTransformationResult
 * @property {PlacedBuilding | undefined} projectedBuilding
 * @property {'transform_upgrade' | 'no_transformation' | 'blocked_missing_identity' | 'blocked_missing_target' | 'blocked_invalid_upgrade_state' | 'blocked_invalid_input'} decision
 * @property {boolean} transformed
 * @property {boolean} blocked
 * @property {string | undefined} blockedReason
 */

/**
 * Resolve the narrow deterministic upgrade-transformation fence for a single
 * persisted building record.
 *
 * The helper stays pure: it only decides whether the upgrade transformation may
 * occur and, when eligible, projects the transformed building state without
 * owning caller-side mutation or persistence.
 *
 * @param {LocalUpgradeTransformationInput} input
 * @returns {LocalUpgradeTransformationResult}
 */
export function resolveLocalUpgradeTransformation(input) {
    const building = input?.building;
    const sourceBuildingInfo = input?.sourceBuildingInfo;
    const targetBuildingInfo = input?.targetBuildingInfo;
    const now = Number(input?.now);

    if (!building || typeof building !== 'object') {
        return {
            projectedBuilding: building,
            decision: 'blocked_invalid_input',
            transformed: false,
            blocked: true,
            blockedReason: 'missing-building-object',
        };
    }

    if (building.id === undefined || building.id === null || building.id === '') {
        return {
            projectedBuilding: building,
            decision: 'blocked_missing_identity',
            transformed: false,
            blocked: true,
            blockedReason: 'missing-building-identity',
        };
    }

    if (!sourceBuildingInfo || typeof sourceBuildingInfo !== 'object') {
        return {
            projectedBuilding: { ...building },
            decision: 'blocked_invalid_upgrade_state',
            transformed: false,
            blocked: true,
            blockedReason: 'missing-source-building-definition',
        };
    }

    if (!targetBuildingInfo || typeof targetBuildingInfo !== 'object') {
        return {
            projectedBuilding: { ...building },
            decision: 'blocked_missing_target',
            transformed: false,
            blocked: true,
            blockedReason: 'missing-target-building-definition',
        };
    }

    if (!Number.isFinite(now)) {
        return {
            projectedBuilding: { ...building },
            decision: 'blocked_invalid_input',
            transformed: false,
            blocked: true,
            blockedReason: 'invalid-now',
        };
    }

    const sourceUpgradeTargetId = Number(sourceBuildingInfo.upgradesTo);
    const targetBuildingId = Number(targetBuildingInfo.id);
    const constructionTimeSeconds = Number(targetBuildingInfo.stats?.constructionTimeSeconds);
    const targetDurability = Number(targetBuildingInfo.stats?.durability);

    if (
        !Number.isFinite(sourceUpgradeTargetId) ||
        !Number.isFinite(targetBuildingId) ||
        sourceUpgradeTargetId !== targetBuildingId ||
        !Number.isFinite(constructionTimeSeconds) ||
        !Number.isFinite(targetDurability)
    ) {
        return {
            projectedBuilding: { ...building },
            decision: 'blocked_invalid_upgrade_state',
            transformed: false,
            blocked: true,
            blockedReason: 'invalid-upgrade-state',
        };
    }

    if (building.buildingId === targetBuildingId) {
        return {
            projectedBuilding: { ...building },
            decision: 'no_transformation',
            transformed: false,
            blocked: false,
            blockedReason: undefined,
        };
    }

    if (
        building.buildingId !== Number(sourceBuildingInfo.id) ||
        building.isConstructing === true
    ) {
        return {
            projectedBuilding: { ...building },
            decision: 'blocked_invalid_upgrade_state',
            transformed: false,
            blocked: true,
            blockedReason: 'invalid-upgrade-state',
        };
    }

    return {
        projectedBuilding: {
            ...building,
            buildingId: targetBuildingId,
            type: targetBuildingInfo.type ?? building.type,
            isConstructing: true,
            constructionEndTime: now + (constructionTimeSeconds * 1000),
            lastAttackTime: now,
            hp: targetDurability,
            maxHp: targetDurability,
            isDestroying: false,
            destructionStartedAt: undefined,
            destructionEndTime: undefined,
            destructionExpiresAt: undefined,
            destructionDurationMs: undefined,
            destructionMaxLifetimeMs: undefined,
            destructionStatus: /** @type {'finished'} */ ('finished'),
            pendingDamage: 0,
            initiatorId: undefined,
        },
        decision: 'transform_upgrade',
        transformed: true,
        blocked: false,
        blockedReason: undefined,
    };
}
