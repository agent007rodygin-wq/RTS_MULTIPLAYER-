// @ts-check
// Monster spawn runtime — spawns regular monsters and Bronekur boss.
// Planning via monsterSpawnPlanning.js; record creation via injected callbacks.
// Dependencies: monsterSpawnPlanning.js, monsterIds.js

import { REGULAR_MONSTER_SPAWN_CONFIG, getRegularMonsterId, getBronekurMonsterId, getBronekurHomeZoneId } from './monsterSpawnPlanning.js';
import { BRONEKUR_ID } from './monsterIds.js';
import { getZoneId } from '../../world.js';

const ZONES_X = 5;
const ZONES_Y = 5;
const ZONE_SIZE = 40;
const BRONEKUR_BOSS_HP = 250000;

/**
 * @typedef {{ id?: string|number; buildingId: number; ownerId?: string|number; zoneId?: string; hp?: number; x: number; y: number }} BuildingRecord
 */

/**
 * Executes regular monster spawn for a single zone. Finds missing types
 * and invokes create callbacks.
 *
 * @param {{
 *   zoneId: string,
 *   zoneX: number,
 *   zoneY: number,
 *   buildings: Array<{ id?: string|number; buildingId: number; ownerId?: string|number; zoneId?: string; hp?: number; x: number; y: number }>,
 *   buildingData: Array<{ id: number; stats?: any }>,
 *   findFreeSpot: (zoneX: number, zoneY: number) => { x: number, y: number } | null,
 *   onRegularSpawn: (params: {
 *     monsterId: string, x: number, y: number, zoneId: string,
 *     typeId: number, typeName: string, durability: number, slot: number,
 *   }) => void,
 * }} params
 * @returns {{ regularSpawned: number }}
 */
export function executeRegularMonsterSpawn({ zoneId, zoneX, zoneY, buildings, buildingData, findFreeSpot, onRegularSpawn }) {
    let regularSpawned = 0;

    for (const cfg of REGULAR_MONSTER_SPAWN_CONFIG) {
        const existing = buildings.filter(b =>
            Number(b.buildingId) === cfg.typeId &&
            (b.ownerId === '-1' || b.ownerId === 'monster') &&
            b.zoneId === zoneId &&
            (b.hp === undefined || b.hp > 0)
        );

        if (existing.length >= cfg.count) continue;

        for (let i = 0; i < cfg.count - existing.length; i++) {
            const slot = existing.length + i + 1;
            const monsterId = getRegularMonsterId(cfg.typeId, slot, zoneId);
            if (buildings.some(b => b.id === monsterId)) continue;

            const pos = findFreeSpot(zoneX, zoneY);
            if (!pos) break;

            const monsterInfo = buildingData.find(b => b.id === cfg.typeId);
            if (!monsterInfo) continue;

            onRegularSpawn({
                monsterId,
                x: pos.x, y: pos.y, zoneId,
                typeId: cfg.typeId, typeName: cfg.name,
                durability: monsterInfo.stats.durability,
                slot,
            });
            regularSpawned++;
        }
    }

    return { regularSpawned };
}

/**
 * Executes Bronekur boss management: normalizes HP, removes duplicates,
 * creates missing boss.
 *
 * @param {{
 *   buildings: Array<{ id?: string|number; buildingId: number; ownerId?: string|number; hp?: number; maxHp?: number }>,
 *   findFreeSpot: (zoneX: number, zoneY: number) => { x: number, y: number } | null,
 *   onBronekurSpawn: (params: { monsterId: string, x: number, y: number, zoneId: string }) => void,
 *   onBronekurHpNormalize: (params: { monsterId: string, currentHp: number }) => void,
 *   onInvalidBronekur: (monsterId: string) => void,
 * }} params
 * @returns {{ bronekurSpawned: number }}
 */
export function executeBronekurSpawn({ buildings, findFreeSpot, onBronekurSpawn, onBronekurHpNormalize, onInvalidBronekur }) {
    let bronekurSpawned = 0;

    const existingBronekurs = buildings.filter(b =>
        Number(b.buildingId) === BRONEKUR_ID &&
        (b.ownerId === '-1' || b.ownerId === 'monster' || b.ownerId === '0') &&
        (b.hp === undefined || b.hp > 0)
    );

    const primaryBronekur = existingBronekurs[0];

    for (const extraBoss of existingBronekurs.slice(1)) {
        onInvalidBronekur(String(extraBoss.id));
    }

    if (primaryBronekur && (primaryBronekur.hp !== BRONEKUR_BOSS_HP || primaryBronekur.maxHp !== BRONEKUR_BOSS_HP)) {
        onBronekurHpNormalize({ monsterId: String(primaryBronekur.id), currentHp: primaryBronekur.hp || 0 });
    }

    if (!primaryBronekur) {
        const homeZoneId = getBronekurHomeZoneId();
        const [bzX, bzY] = homeZoneId.split('_').map(Number);
        const pos = findFreeSpot(bzX, bzY);
        if (pos) {
            const bossMonsterId = getBronekurMonsterId();
            onBronekurSpawn({ monsterId: bossMonsterId, x: pos.x, y: pos.y, zoneId: homeZoneId });
            bronekurSpawned++;
        }
    }

    return { bronekurSpawned };
}

/**
 * Per-zone regular monster reconciliation: classifies existing monsters,
 * deletes excess, heals displaced records, and creates missing canonical IDs.
 * World-level planning (bonus zones, desiredTypeCounts) must be computed externally.
 *
 * @param {{
 *   zoneId: string,
 *   zoneX: number,
 *   zoneY: number,
 *   desiredTypeCounts: Map<number, number>,
 *   zoneTargetCount: number,
 *   buildings: Array<{ id?: string|number; buildingId: number; ownerId?: string|number; zoneId?: string; hp?: number; x: number; y: number; lastMoveTime?: number }>,
 *   buildingData: Array<{ id: number; stats?: any }>,
 *   findFreeSpot: (zoneX: number, zoneY: number) => { x: number, y: number } | null,
 *   onDeleteExcess: (monsterId: string, monster: any) => void,
 *   onHealDisplaced: (monsterId: string, patch: { zoneId: string }) => void,
 *   onCreateMissing: (spec: { monsterId: string, x: number, y: number, zoneId: string, typeId: number, typeName: string, durability: number, slot: number }) => void,
 * }} params
 * @returns {{ deletedCount: number, healedCount: number, createdCount: number }}
 */
export function reconcileRegularMonstersForZone({
    zoneId, zoneX, zoneY, desiredTypeCounts, zoneTargetCount,
    buildings, buildingData, findFreeSpot,
    onDeleteExcess, onHealDisplaced, onCreateMissing,
}) {
    // 1. Classify regular monsters in this zone
    const zoneRegularMonsters = buildings
        .filter(b =>
            Number(b.buildingId) !== BRONEKUR_ID &&
            REGULAR_MONSTER_SPAWN_CONFIG.some(cfg => cfg.typeId === Number(b.buildingId)) &&
            (b.ownerId === '-1' || b.ownerId === 'monster') &&
            (b.hp === undefined || b.hp > 0) &&
            (b.zoneId || getZoneId(b.x, b.y)) === zoneId
        )
        .sort((a, b) =>
            (a.lastMoveTime || 0) - (b.lastMoveTime || 0) ||
            String(a.id).localeCompare(String(b.id))
        );

    // 2. Identify excess records
    const monstersToDelete = [];
    const typeSeen = new Map();
    for (const monster of zoneRegularMonsters) {
        const typeId = Number(monster.buildingId);
        const desiredCount = desiredTypeCounts.get(typeId) || 0;
        const seenCount = typeSeen.get(typeId) || 0;
        if (seenCount < desiredCount) {
            typeSeen.set(typeId, seenCount + 1);
        } else {
            monstersToDelete.push(monster);
        }
    }

    // 3. Delete excess records
    const excessCount = Math.max(0, zoneRegularMonsters.length - zoneTargetCount);
    const monstersMarkedForDeletion = monstersToDelete.slice(0, excessCount);
    for (const monster of monstersMarkedForDeletion) {
        onDeleteExcess(String(monster.id), monster);
    }
    let deletedCount = monstersMarkedForDeletion.length;

    // 4. Calculate remaining counts after deletion
    const keptMonsterIds = new Set(monstersMarkedForDeletion.map(m => String(m.id)));
    const remainingMonsters = zoneRegularMonsters.filter(m => !keptMonsterIds.has(String(m.id)));
    const remainingTypeCounts = new Map();
    remainingMonsters.forEach(m => {
        const typeId = Number(m.buildingId);
        remainingTypeCounts.set(typeId, (remainingTypeCounts.get(typeId) || 0) + 1);
    });

    // 5-6. Heal displaced and create missing canonical records
    let healedCount = 0;
    let createdCount = 0;

    for (const cfg of REGULAR_MONSTER_SPAWN_CONFIG) {
        const desiredCount = desiredTypeCounts.get(cfg.typeId) || 1;
        const existingCount = remainingTypeCounts.get(cfg.typeId) || 0;
        if (existingCount >= desiredCount) continue;

        for (let slot = existingCount + 1; slot <= desiredCount; slot++) {
            const monsterId = getRegularMonsterId(cfg.typeId, slot, zoneId);
            const existingById = buildings.find(b =>
                String(b.id) === monsterId &&
                Number(b.buildingId) === cfg.typeId &&
                (b.ownerId === '-1' || b.ownerId === 'monster') &&
                (b.hp === undefined || b.hp > 0)
            );

            if (existingById) {
                // Heal displaced record
                const actualZoneId = existingById.zoneId || `${Math.floor(existingById.x / 40)}_${Math.floor(existingById.y / 40)}`;
                if (existingById.zoneId !== actualZoneId) {
                    onHealDisplaced(monsterId, { zoneId: actualZoneId });
                    healedCount++;
                }
                continue;
            }

            // Create missing record
            const pos = findFreeSpot(zoneX, zoneY);
            if (!pos) break;
            const monsterInfo = buildingData.find(b => b.id === cfg.typeId);
            if (!monsterInfo) continue;

            onCreateMissing({
                monsterId,
                x: pos.x, y: pos.y, zoneId,
                typeId: cfg.typeId, typeName: cfg.name,
                durability: monsterInfo.stats.durability,
                slot,
            });
            createdCount++;
        }
    }

    return { deletedCount, healedCount, createdCount };
}
