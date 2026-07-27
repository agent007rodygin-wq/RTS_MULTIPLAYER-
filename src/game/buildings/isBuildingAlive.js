// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @param {Pick<PlacedBuilding, 'hp'>} building
 * @returns {boolean}
 */
export const isBuildingAlive = (building) =>
    building.hp === undefined || building.hp > 0;
