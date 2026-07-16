// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @typedef {Object} LocalRewardEligibilityInput
 * @property {PlacedBuilding | undefined} [building]
 */

/**
 * @typedef {Object} LocalRewardEligibilityResult
 * @property {PlacedBuilding | undefined} consumedBuilding
 * @property {'grant_reward' | 'no_reward' | 'blocked_missing_identity' | 'blocked_invalid_input'} decision
 * @property {boolean} granted
 * @property {boolean} blocked
 * @property {string | undefined} blockedReason
 */

const VALID_WORK_STATES = new Set(['finished', 'idle', 'working']);

/**
 * Resolve the narrow reward-eligibility fence for a persisted building record.
 *
 * The helper stays pure: it only decides whether the reward transition may
 * occur and, when eligible, projects the consumed state to `workState: 'idle'`.
 *
 * @param {LocalRewardEligibilityInput} input
 * @returns {LocalRewardEligibilityResult}
 */
export function resolveLocalRewardEligibility(input) {
    const building = input?.building;

    if (!building || typeof building !== 'object') {
        return {
            consumedBuilding: building,
            decision: 'blocked_invalid_input',
            granted: false,
            blocked: true,
            blockedReason: 'missing-building-object',
        };
    }

    if (building.id === undefined || building.id === null || building.id === '') {
        return {
            consumedBuilding: building,
            decision: 'blocked_missing_identity',
            granted: false,
            blocked: true,
            blockedReason: 'missing-building-identity',
        };
    }

    if (!VALID_WORK_STATES.has(String(building.workState))) {
        return {
            consumedBuilding: building,
            decision: 'blocked_invalid_input',
            granted: false,
            blocked: true,
            blockedReason: 'invalid-work-state',
        };
    }

    if (building.workState !== 'finished') {
        return {
            consumedBuilding: { ...building },
            decision: 'no_reward',
            granted: false,
            blocked: false,
            blockedReason: undefined,
        };
    }

    return {
        consumedBuilding: {
            ...building,
            workState: 'idle',
        },
        decision: 'grant_reward',
        granted: true,
        blocked: false,
        blockedReason: undefined,
    };
}
