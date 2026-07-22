// @ts-check
// Monster world-level spawn planning — deterministic zone ranking,
// bonus selection, and per-zone spawn plan generation.
// Pure: zero React, refs, backend, timers, or side effects.
// Dependencies: monsterMovement.js (seededShuffle, hashMonsterZoneSeed), monsterSpawnPlanning.js

import { seededShuffle, hashMonsterZoneSeed } from './monsterMovement.js';
import { REGULAR_MONSTER_SPAWN_CONFIG } from './monsterSpawnPlanning.js';
import { ZONES_X, ZONES_Y } from '../../world.js';

/**
 * @typedef {{ zoneId: string, zoneX: number, zoneY: number, typeOrder: Array<{ typeId: number, count: number, name: string }>, desiredTypeCounts: Map<number, number>, targetCount: number }} ZoneSpawnPlan
 */

/**
 * Builds a deterministic world-level spawn plan: ranks all zones, selects
 * bonus zones, assigns bonus types, and computes per-zone desired type
 * counts and type iteration order.
 *
 * @param {{
 *   managedZoneIds: string[],
 *   constants?: {
 *     basePerZone?: number,
 *     totalTarget?: number,
 *   },
 * }} params
 * @returns {{
 *   bonusZoneIds: Set<string>,
 *   bonusTypeByZone: Map<string, number>,
 *   zonePlans: Map<string, ZoneSpawnPlan>,
 * }}
 */
export function buildMonsterWorldSpawnPlan({
    managedZoneIds,
    constants = {},
}) {
    const BASE_WILD_MONSTERS_PER_ZONE = constants.basePerZone ?? 5;
    const TARGET_WILD_MONSTERS_TOTAL = constants.totalTarget ?? 129;
    const bonusZoneCount = Math.max(0, TARGET_WILD_MONSTERS_TOTAL - (ZONES_X * ZONES_Y * BASE_WILD_MONSTERS_PER_ZONE));

    // Rank all zones by deterministic seed
    const zoneSpawnRanking = [];
    for (let zx = 0; zx < ZONES_X; zx++) {
        for (let zy = 0; zy < ZONES_Y; zy++) {
            zoneSpawnRanking.push({
                zoneId: `${zx}_${zy}`,
                score: hashMonsterZoneSeed(`wild-zone:${zx}_${zy}`),
            });
        }
    }
    zoneSpawnRanking.sort((a, b) => b.score - a.score || a.zoneId.localeCompare(b.zoneId));

    const bonusZoneIds = new Set(zoneSpawnRanking.slice(0, bonusZoneCount).map(z => z.zoneId));
    const bonusTypes = seededShuffle(REGULAR_MONSTER_SPAWN_CONFIG.map(cfg => cfg.typeId), 'wild-extra-types');
    const bonusTypeByZone = new Map();
    zoneSpawnRanking.slice(0, bonusZoneCount).forEach((zone, index) => {
        bonusTypeByZone.set(zone.zoneId, bonusTypes[index % bonusTypes.length]);
    });

    // Build per-zone plans
    const zonePlans = new Map();
    for (const zoneId of managedZoneIds) {
        const [zX, zY] = zoneId.split('_').map(Number);
        if (!Number.isFinite(zX) || !Number.isFinite(zY)) continue;

        const zoneTypeOrder = seededShuffle(REGULAR_MONSTER_SPAWN_CONFIG, `wild-types:${zoneId}`);
        const duplicateTypeId = bonusZoneIds.has(zoneId) ? (bonusTypeByZone.get(zoneId) || null) : null;
        const targetCount = BASE_WILD_MONSTERS_PER_ZONE + (bonusZoneIds.has(zoneId) ? 1 : 0);
        const desiredTypeCounts = new Map();
        zoneTypeOrder.forEach(cfg => desiredTypeCounts.set(cfg.typeId, 1));
        if (duplicateTypeId !== null) {
            desiredTypeCounts.set(duplicateTypeId, 2);
        }

        zonePlans.set(zoneId, {
            zoneId,
            zoneX: zX,
            zoneY: zY,
            typeOrder: zoneTypeOrder,
            desiredTypeCounts,
            targetCount,
        });
    }

    return { bonusZoneIds, bonusTypeByZone, zonePlans };
}
