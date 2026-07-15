// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @typedef {Object} LocalDestructionCompletionInput
 * @property {PlacedBuilding} building
 * @property {{ stats?: { durability?: number } } | undefined} [buildingInfo]
 * @property {number} now
 * @property {number | undefined} destructionExpiresAt
 */

/**
 * @typedef {Object} LocalDestructionCompletionResult
 * @property {PlacedBuilding} completedBuilding
 * @property {'complete_destruction' | 'no_completion' | 'blocked_missing_identity' | 'blocked_malformed_timing'} decision
 * @property {boolean} completed
 * @property {boolean} blocked
 * @property {string | undefined} blockedReason
 */

/**
 * @param {LocalDestructionCompletionInput} input
 * @returns {LocalDestructionCompletionResult}
 */
export function resolveLocalDestructionCompletion(input) {
    const { building, buildingInfo, now, destructionExpiresAt } = input;

    if (!building || building.id === undefined || building.id === null || building.id === '') {
        return {
            completedBuilding: building,
            decision: 'blocked_missing_identity',
            completed: false,
            blocked: true,
            blockedReason: 'missing-building-identity',
        };
    }

    if (!Number.isFinite(Number(now))) {
        return {
            completedBuilding: building,
            decision: 'blocked_malformed_timing',
            completed: false,
            blocked: true,
            blockedReason: 'invalid-now',
        };
    }

    const resolvedExpiresAt = Number(destructionExpiresAt || 0) || 0;
    if (!building.isDestroying || !resolvedExpiresAt || now < resolvedExpiresAt) {
        return {
            completedBuilding: building,
            decision: 'no_completion',
            completed: false,
            blocked: false,
            blockedReason: undefined,
        };
    }

    const damage = building.pendingDamage || 0;
    // Use maxHp as fallback if hp is undefined; never default to 0 which would
    // cause any pending damage to instantly kill a building with unknown HP.
    const fullHp = building.maxHp ?? buildingInfo?.stats?.durability ?? 100;
    const currentHp = building.hp ?? fullHp;
    const remainingHp = currentHp - damage;

    const completedBuilding = {
        ...building,
        hp: remainingHp,
        // Persist maxHp during destruction finalization so hp=0 cannot be
        // misread as a migration artifact and restored on next sync.
        maxHp: fullHp,
        isDestroying: false,
        destructionStartedAt: undefined,
        destructionEndTime: undefined,
        destructionExpiresAt: undefined,
        destructionDurationMs: undefined,
        destructionMaxLifetimeMs: undefined,
        destructionStatus: /** @type {'finished'} */ ('finished'),
        pendingDamage: 0,
    };

    if (remainingHp <= 0) {
        completedBuilding.hp = 0;
    }

    return {
        completedBuilding,
        decision: 'complete_destruction',
        completed: true,
        blocked: false,
        blockedReason: undefined,
    };
}
