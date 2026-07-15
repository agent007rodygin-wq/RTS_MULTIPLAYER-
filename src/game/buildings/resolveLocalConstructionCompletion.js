// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @typedef {Object} LocalConstructionCompletionInput
 * @property {PlacedBuilding} building
 * @property {number} now
 */

/**
 * @typedef {Object} LocalConstructionCompletionResult
 * @property {PlacedBuilding} completedBuilding
 * @property {'complete_construction' | 'no_completion'} decision
 * @property {boolean} completed
 */

/**
 * Resolve the narrow construction completion transition for a single
 * persisted building record.
 *
 * @param {LocalConstructionCompletionInput} input
 * @returns {LocalConstructionCompletionResult}
 */
export function resolveLocalConstructionCompletion(input) {
    const { building, now } = input;

    if (!building?.isConstructing || !building.constructionEndTime || now < building.constructionEndTime) {
        return {
            completedBuilding: building,
            decision: 'no_completion',
            completed: false,
        };
    }

    return {
        completedBuilding: {
            ...building,
            isConstructing: false,
            workState: 'idle',
        },
        decision: 'complete_construction',
        completed: true,
    };
}
