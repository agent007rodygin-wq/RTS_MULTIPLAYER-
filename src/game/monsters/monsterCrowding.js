// @ts-check
// Monster crowding — zone population counting and escape movement.
// Dependencies: src/world.js (getZoneId, ZONE_SIZE, ZONES_X, ZONES_Y, wrapCoord)

import { getZoneId, ZONE_SIZE, ZONES_X, ZONES_Y, wrapCoord } from '../../world.js';

export const WILD_MONSTER_CROWDING_SOFT_CAP = 5;
export const WILD_MONSTER_CROWDING_HARD_CAP = 6;
export const TARGET_WILD_MONSTERS_PER_ZONE = 4;

/**
 * Returns the zone ID for a monster, preferring the cached monster.zoneId
 * and falling back to computing from coordinates.
 * @param {{ x: number; y: number; zoneId?: string }} monster
 * @returns {string}
 */
export function getMonsterZoneId(monster) {
    return monster.zoneId || getZoneId(monster.x, monster.y);
}

/**
 * Counts live monsters per zone. Filters out non-monster buildings,
 * structures under construction or destruction, and dead (hp <= 0) entities.
 * @param {Array<{ buildingId: number; isConstructing?: boolean; isDestroying?: boolean; hp?: number; x: number; y: number; zoneId?: string }>} buildings
 * @param {Array<{ id: number; stats?: { isMonster?: boolean } }>} buildingData
 * @returns {Map<string, number>}
 */
const buildingDataMapCache = new WeakMap();

function getBuildingByIdMap(buildingData) {
    let map = buildingDataMapCache.get(buildingData);
    if (!map) {
        map = new Map();
        for (let i = 0; i < buildingData.length; i++) {
            const info = buildingData[i];
            map.set(Number(info.id), info);
        }
        buildingDataMapCache.set(buildingData, map);
    }
    return map;
}

export function buildMonsterZoneCounts(buildings, buildingData) {
    const counts = new Map();
    const byId = getBuildingByIdMap(buildingData);
    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
        if (building.buildingId === 50005 || building.buildingId === 50004) continue;
        const info = byId.get(Number(building.buildingId));
        if (!info || !info.stats.isMonster) continue;
        if (building.isConstructing || building.isDestroying) continue;
        if (building.hp !== undefined && building.hp <= 0) continue;
        const zoneId = getMonsterZoneId(building);
        counts.set(zoneId, (counts.get(zoneId) || 0) + 1);
    }
    return counts;
}

/**
 * Picks a move that escapes a crowded zone. Returns null if the current zone
 * is under the soft cap or no valid escape move exists.
 * @param {{ x: number; y: number; zoneId?: string }} monster
 * @param {Array<{ x: number; y: number; dx: number; dy: number }>} validMoves
 * @param {Map<string, number>} zoneCounts
 * @param {boolean} isWrappedWorld
 * @returns {{ x: number; y: number; dx: number; dy: number } | null}
 */
export function getCrowdingEscapeMove(monster, validMoves, zoneCounts, isWrappedWorld) {
    if (validMoves.length === 0) return null;

    const currentZoneId = getMonsterZoneId(monster);
    const currentCount = zoneCounts.get(currentZoneId) || 0;

    const zoneX = Math.floor(monster.x / ZONE_SIZE);
    const zoneY = Math.floor(monster.y / ZONE_SIZE);
    const localX = monster.x - (zoneX * ZONE_SIZE);
    const localY = monster.y - (zoneY * ZONE_SIZE);

    const neighborChecks = [
        { dx: -1, dy: 0, zoneX: zoneX - 1, zoneY, borderDist: localX },
        { dx: 1, dy: 0, zoneX: zoneX + 1, zoneY, borderDist: ZONE_SIZE - 1 - localX },
        { dx: 0, dy: -1, zoneX, zoneY: zoneY - 1, borderDist: localY },
        { dx: 0, dy: 1, zoneX, zoneY: zoneY + 1, borderDist: ZONE_SIZE - 1 - localY }
    ].filter(({ zoneX: nx, zoneY: ny }) =>
        isWrappedWorld || (nx >= 0 && nx < ZONES_X && ny >= 0 && ny < ZONES_Y)
    );

    const isCrowded = currentCount >= WILD_MONSTER_CROWDING_SOFT_CAP;
    // Don't abandon a zone that is already sparse (<= 2) unless neighbor is completely empty and we have at least 2.
    const isSparseZone = currentCount <= 2;

    let bestDirection = null;
    let bestScore = -Infinity;
    const pressureMultiplier = currentCount >= WILD_MONSTER_CROWDING_HARD_CAP ? 2 : 1;

    neighborChecks.forEach(({ dx, dy, zoneX: nx, zoneY: ny, borderDist }) => {
        const wrappedX = isWrappedWorld ? wrapCoord(nx, ZONES_X) : nx;
        const wrappedY = isWrappedWorld ? wrapCoord(ny, ZONES_Y) : ny;
        const neighborZoneId = `${wrappedX}_${wrappedY}`;
        const neighborCount = zoneCounts.get(neighborZoneId) || 0;

        if (isSparseZone && (neighborCount >= currentCount || currentCount <= 1)) {
            return;
        }

        const hasScarcityDeficit = neighborCount < TARGET_WILD_MONSTERS_PER_ZONE && currentCount > neighborCount;
        if (!isCrowded && !hasScarcityDeficit) {
            return;
        }

        const scarcityScore = currentCount - neighborCount;
        let urgencyBonus = 0;
        if (neighborCount === 0) urgencyBonus = 400;
        else if (neighborCount === 1) urgencyBonus = 250;
        else if (neighborCount === 2) urgencyBonus = 120;

        const borderBonus = Math.max(0, ZONE_SIZE - borderDist);
        const score = (scarcityScore * 100 * pressureMultiplier) + urgencyBonus + borderBonus;
        if (score > bestScore) {
            bestScore = score;
            bestDirection = { dx, dy };
        }
    });

    if (!bestDirection) return null;

    const preferredMove = validMoves.find(move => move.dx === bestDirection.dx && move.dy === bestDirection.dy);
    if (preferredMove) return preferredMove;

    let fallbackMove = null;
    let fallbackScore = -Infinity;
    validMoves.forEach(move => {
        const moveZoneId = getZoneId(move.x, move.y);
        const moveZoneCount = zoneCounts.get(moveZoneId) || 0;
        const score = -moveZoneCount * 100 - (moveZoneId === currentZoneId ? 25 : 0);
        if (score > fallbackScore) {
            fallbackScore = score;
            fallbackMove = move;
        }
    });
    return fallbackMove;
}
