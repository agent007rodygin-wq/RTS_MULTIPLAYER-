// @ts-check
// Monster runtime snapshot builder — filters, classifies, and sorts monsters
// for the tick loop. Receives all runtime state as explicit arguments.
// Dependencies: monsterMovement.js, monsterCrowding.js, monsterTargetSelection.js

import { getMonsterMoveInterval, getMonsterMoveSeed } from './monsterMovement.js';
import { buildMonsterZoneCounts } from './monsterCrowding.js';
import { getMonsterAdjacentAttackTarget } from './monsterTargetSelection.js';

/**
 * @typedef {{ x: number; y: number; id?: string|number; gameId?: string|number; buildingId: number; hp?: number; ownerId?: string|number; isConstructing?: boolean; isDestroying?: boolean; lastMoveTime?: number; lastAttackTime?: number; monsterMode?: string; kotofeySettings?: any }} MonsterRecord
 */

/**
 * Builds the per-tick monster snapshot: movement candidates, attack candidates,
 * and zone population counts.
 *
 * @param {{
 *   now: number,
 *   buildings: MonsterRecord[],
 *   buildingData: Array<{ id: number; stats?: { isMonster?: boolean; hates?: string } }>,
 *   monsterLastAction: Map<string, number>,
 *   monsterAttackTime: Map<string, number>,
 *   isMonsterHost: (b: MonsterRecord) => boolean,
 *   isWorldWrapped: boolean,
 *   pendingDestroyedIds: Set<string>,
 *   maxMovesPerBatch: number,
 *   kotofeyContext?: any,
 * }} params
 * @returns {{
 *   actingMonsters: MonsterRecord[],
 *   monstersReadyToAttack: MonsterRecord[],
 *   monsterZoneCounts: Map<string, number>,
 * }}
 */
const runtimeSnapshotBuildingMapCache = new WeakMap();

function getBuildingByIdMap(buildingData) {
    let map = runtimeSnapshotBuildingMapCache.get(buildingData);
    if (!map) {
        map = new Map();
        for (let i = 0; i < buildingData.length; i++) {
            const info = buildingData[i];
            map.set(Number(info.id), info);
        }
        runtimeSnapshotBuildingMapCache.set(buildingData, map);
    }
    return map;
}

export function buildMonsterRuntimeSnapshot({
    now, buildings, buildingData,
    monsterLastAction, monsterAttackTime, isMonsterHost,
    isWorldWrapped, pendingDestroyedIds, maxMovesPerBatch,
    kotofeyContext,
}) {
    const byId = getBuildingByIdMap(buildingData);
    const buildingsByTile = new Map();
    const candidateMonsters = [];
    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (b.buildingId === 50005 || b.buildingId === 50004) continue;
        const key = `${b.x},${b.y}`;
        let bucket = buildingsByTile.get(key);
        if (!bucket) {
            bucket = [b];
            buildingsByTile.set(key, bucket);
        } else {
            bucket.push(b);
        }

        if (b.isConstructing || b.isDestroying) continue;
        if (b.hp !== undefined && b.hp <= 0) continue;
        const info = byId.get(Number(b.buildingId));
        if (!info || !info.stats.isMonster) continue;
        const isPlayerOwned = Boolean(b.ownerId && b.ownerId !== 'monster' && b.ownerId !== '-1' && b.ownerId !== '0');
        if (b.monsterMode === 'stand' || (isPlayerOwned && b.monsterMode !== 'patrol')) continue;
        if (isMonsterHost(b)) {
            candidateMonsters.push(b);
        }
    }

    const monstersMoving = [];
    const monstersReadyToAttack = [];
    for (let i = 0; i < candidateMonsters.length; i++) {
        const monster = candidateMonsters[i];
        const monsterId = String(monster.id || '');
        const gameIdStr = monster.gameId ? String(monster.gameId) : '';
        const refLastAction = Math.max(
            monsterLastAction.get(monsterId) || 0,
            gameIdStr ? (monsterLastAction.get(gameIdStr) || 0) : 0
        );
        const lastTime = Math.max(monster.lastMoveTime || 0, refLastAction);
        const moveInterval = getMonsterMoveInterval(monster.buildingId, monsterId);
        if (now - lastTime >= moveInterval) {
            monstersMoving.push(monster);
        }

        const refAttackTime = Math.max(
            monsterAttackTime.get(monsterId) || 0,
            gameIdStr ? (monsterAttackTime.get(gameIdStr) || 0) : 0
        );
        const lastAttackTime = Math.max(monster.lastAttackTime || 0, refAttackTime);
        if (lastAttackTime <= now && (now - lastAttackTime) >= 35000) {
            const target = getMonsterAdjacentAttackTarget(monster, buildings, buildingData, {
                isWrappedWorld: isWorldWrapped,
                pendingDestroyedIds,
                kotofeyContext,
                buildingsByTile,
            });
            if (target) {
                monstersReadyToAttack.push(monster);
            }
        }
    }

    const monsterZoneCounts = buildMonsterZoneCounts(buildings, buildingData);

    // Sort movement candidates: most overdue first, then by deterministic seed
    const sorted = [...monstersMoving].sort((a, b) => {
        const aId = String(a.id || '');
        const bId = String(b.id || '');
        const aGameId = a.gameId ? String(a.gameId) : '';
        const bGameId = b.gameId ? String(b.gameId) : '';
        const aLastTime = Math.max(a.lastMoveTime || 0, monsterLastAction.get(aId) || 0, aGameId ? (monsterLastAction.get(aGameId) || 0) : 0);
        const bLastTime = Math.max(b.lastMoveTime || 0, monsterLastAction.get(bId) || 0, bGameId ? (monsterLastAction.get(bGameId) || 0) : 0);
        const aOverdue = now - aLastTime - getMonsterMoveInterval(a.buildingId, aId);
        const bOverdue = now - bLastTime - getMonsterMoveInterval(b.buildingId, bId);
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        return getMonsterMoveSeed(aId, a.buildingId) - getMonsterMoveSeed(bId, b.buildingId);
    });

    const actingMonsters = sorted.slice(0, maxMovesPerBatch);

    return { actingMonsters, monstersReadyToAttack, monsterZoneCounts };
}
