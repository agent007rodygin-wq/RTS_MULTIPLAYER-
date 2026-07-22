// @ts-check
// Monster spawn runtime — spawns regular monsters and Bronekur boss.
// Planning via monsterSpawnPlanning.js; record creation via injected callbacks.
// Dependencies: monsterSpawnPlanning.js, monsterIds.js

import { REGULAR_MONSTER_SPAWN_CONFIG, getRegularMonsterId, getBronekurMonsterId, getBronekurHomeZoneId } from './monsterSpawnPlanning.js';
import { BRONEKUR_ID } from './monsterIds.js';

const ZONES_X = 5;
const ZONES_Y = 5;
const ZONE_SIZE = 40;
const BRONEKUR_BOSS_HP = 250000;

/**
 * @typedef {{ id?: string|number; buildingId: number; ownerId?: string|number; zoneId?: string; hp?: number; x: number; y: number }} BuildingRecord
 */

/**
 * Executes one spawn cycle: finds missing regular monsters per zone,
 * finds missing Bronekur boss, and invokes create callbacks.
 *
 * @param {{
 *   buildings: BuildingRecord[],
 *   buildingData: Array<{ id: number; stats?: any }>,
 *   isOccupied: (x: number, y: number) => boolean,
 *   onRegularSpawn: (params: {
 *     monsterId: string, x: number, y: number, zoneId: string,
 *     typeId: number, typeName: string, durability: number, slot: number,
 *   }) => void,
 *   onBronekurSpawn: (params: {
 *     monsterId: string, x: number, y: number, zoneId: string,
 *   }) => void,
 *   onBronekurHpNormalize: (params: { monsterId: string, currentHp: number }) => void,
 *   onInvalidBronekur: (monsterId: string) => void,
 *   findFreeSpot: (zoneX: number, zoneY: number) => { x: number, y: number } | null,
 * }} params
 * @returns {{ regularSpawned: number, bronekurSpawned: number }}
 */
export function executeMonsterSpawnCycle({
    buildings, buildingData, isOccupied,
    onRegularSpawn, onBronekurSpawn, onBronekurHpNormalize,
    onInvalidBronekur, findFreeSpot,
}) {
    let regularSpawned = 0;
    let bronekurSpawned = 0;

    // Bronekur boss management
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

    // Regular monsters: check each zone for missing types
    for (let zX = 0; zX < ZONES_X; zX++) {
        for (let zY = 0; zY < ZONES_Y; zY++) {
            const zoneId = `${zX}_${zY}`;

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

                    const pos = findFreeSpot(zX, zY);
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
        }
    }

    return { regularSpawned, bronekurSpawned };
}
