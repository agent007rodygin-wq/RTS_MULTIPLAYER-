// @ts-check

import { getZoneId } from '../../world.js';

/**
 * @param {Pick<import('../../../types').PlacedBuilding, 'x' | 'y' | 'zoneId'>} monster
 * @returns {string}
 */
export function getMonsterZoneId(monster) {
    return monster.zoneId || getZoneId(monster.x, monster.y);
}

/**
 * @param {import('../../../types').PlacedBuilding[]} buildings
 * @param {import('../../../types').Building[]} buildingData
 * @returns {Map<string, number>}
 */
export function buildMonsterZoneCounts(buildings, buildingData) {
    const counts = new Map();
    buildings.forEach((building) => {
        const info = buildingData.find(i => Number(i.id) === Number(building.buildingId));
        if (!info || !info.stats.isMonster) return;
        if (building.isConstructing || building.isDestroying) return;
        if (building.hp !== undefined && building.hp <= 0) return;
        const zoneId = getMonsterZoneId(building);
        counts.set(zoneId, (counts.get(zoneId) || 0) + 1);
    });
    return counts;
}
