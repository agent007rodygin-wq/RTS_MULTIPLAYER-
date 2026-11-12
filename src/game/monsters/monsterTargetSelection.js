// @ts-check

import { getCardinalNeighborTiles, getWrappedManhattanDistance } from '../../world.js';
import { isBuildingAlive } from '../buildings/isBuildingAlive.js';
import {
    isKotofeyMonster,
    isHealerMonster,
    isKotofeyRepairCandidate,
    selectKotofeyAdjacentTarget,
    isTargetGiftCategory,
    KOTOFEY_SEARCH_RADIUS,
} from './kotofeyLogic.js';
import {
    isTrollMonster,
    isTrollCombatCandidate,
    selectTrollAdjacentCombatTarget,
    getTrollChaseTarget,
} from './trollLogic.js';

const targetSelectionBuildingMapCache = new WeakMap();

function getTargetSelectionBuildingInfo(buildingData, buildingId) {
    let map = targetSelectionBuildingMapCache.get(buildingData);
    if (!map) {
        map = new Map();
        for (let i = 0; i < buildingData.length; i++) {
            const info = buildingData[i];
            map.set(Number(info.id), info);
        }
        targetSelectionBuildingMapCache.set(buildingData, map);
    }
    return map.get(Number(buildingId));
}

function collectAdjacentCandidates(monster, buildings, buildingData, options, predicate) {
    const neighbors = getCardinalNeighborTiles(monster.x, monster.y, !!options?.isWrappedWorld);
    const byTile = options?.buildingsByTile;
    if (byTile instanceof Map) {
        const candidates = [];
        for (let i = 0; i < neighbors.length; i++) {
            const n = neighbors[i];
            const bucket = byTile.get(`${n.x},${n.y}`);
            if (!bucket) continue;
            for (let j = 0; j < bucket.length; j++) {
                const target = bucket[j];
                if (predicate(monster, target, buildingData, options)) {
                    candidates.push(target);
                }
            }
        }
        return candidates;
    }
    return buildings.filter(target =>
        neighbors.some(n => n.x === target.x && n.y === target.y) &&
        predicate(monster, target, buildingData, options)
    );
}

export function isMonsterAttackTargetCandidate(monster, target, buildingData, options) {
    if (isHealerMonster(monster?.buildingId)) {
        return isKotofeyRepairCandidate(monster, target, buildingData, options);
    }
    if (isTrollMonster(monster?.buildingId)) {
        return isTrollCombatCandidate(monster, target, buildingData, { ...(options?.kotofeyContext || {}), now: options?.now });
    }
    const isPlayerOwned = Boolean(monster.ownerId && monster.ownerId !== 'monster' && monster.ownerId !== '-1' && monster.ownerId !== '0');
    if (monster.monsterMode === 'stand' || (isPlayerOwned && monster.monsterMode !== 'patrol')) return false;
    const targetId = String(target.id);
    const targetInfo = getTargetSelectionBuildingInfo(buildingData, target.buildingId);
    const riverId = options?.riverId ?? 50004;
    const mountainId = options?.mountainId ?? 50005;
    if (target.ownerId === monster.ownerId) return false;
    if (options?.friendlyOwnerIds && options.friendlyOwnerIds.has(target.ownerId)) return false;
    if (Number(target.buildingId) === Number(riverId) || Number(target.buildingId) === Number(mountainId)) return false;
    if (targetInfo?.stats.isMonster) return false;
    if (options?.blockedTargetIds?.has(targetId)) return false;
    if (options?.pendingDestroyedIds?.has(targetId)) return false;
    if (target.hp !== undefined && target.hp <= 0) return false;
    if (target.destructionEndTime && target.destructionEndTime <= Date.now()) return false;
    return true;
}

export function isMonsterHoldTargetCandidate(monster, target, buildingData, options) {
    if (isHealerMonster(monster?.buildingId)) {
        return isKotofeyRepairCandidate(monster, target, buildingData, options);
    }
    if (isTrollMonster(monster?.buildingId)) {
        return isTrollCombatCandidate(monster, target, buildingData, { ...(options?.kotofeyContext || {}), now: options?.now });
    }
    const isPlayerOwned = Boolean(monster.ownerId && monster.ownerId !== 'monster' && monster.ownerId !== '-1' && monster.ownerId !== '0');
    if (monster.monsterMode === 'stand' || (isPlayerOwned && monster.monsterMode !== 'patrol')) return false;
    const targetId = String(target.id);
    const targetInfo = getTargetSelectionBuildingInfo(buildingData, target.buildingId);
    const riverId = options?.riverId ?? 50004;
    const mountainId = options?.mountainId ?? 50005;
    if (target.ownerId === monster.ownerId) return false;
    if (options?.friendlyOwnerIds && options.friendlyOwnerIds.has(target.ownerId)) return false;
    if (Number(target.buildingId) === Number(riverId) || Number(target.buildingId) === Number(mountainId)) return false;
    if (targetInfo?.stats.isMonster) return false;
    if (options?.blockedTargetIds?.has(targetId)) return false;
    if (options?.pendingDestroyedIds?.has(targetId)) return false;
    if (target.hp !== undefined && target.hp <= 0) return false;
    if (target.destructionEndTime && target.destructionEndTime <= Date.now()) return false;
    return true;
}

export function getMonsterAdjacentAttackTarget(monster, buildings, buildingData, options) {
    const monsterInfo = getTargetSelectionBuildingInfo(buildingData, monster.buildingId);
    const candidates = collectAdjacentCandidates(monster, buildings, buildingData, options, isMonsterAttackTargetCandidate);
    if (candidates.length === 0) return null;

    if (isHealerMonster(monster?.buildingId)) {
        return selectKotofeyAdjacentTarget(monster, candidates, buildings, buildingData, options);
    }
    if (isTrollMonster(monster?.buildingId)) {
        return selectTrollAdjacentCombatTarget(monster, buildings, buildingData, {
            ...(options?.kotofeyContext || {}),
            isWrappedWorld: options?.isWrappedWorld,
            searchRadius: options?.searchRadius,
            now: options?.now,
        });
    }

    const preferredTargetId = options?.preferredTargetId ? String(options.preferredTargetId) : null;
    if (preferredTargetId) {
        const preferredTarget = candidates.find((t) => String(t.id) === preferredTargetId);
        if (preferredTarget) return preferredTarget;
    }

    const hates = monsterInfo?.stats.hates;
    const hatedTarget = candidates.find((t) => {
        const info = getTargetSelectionBuildingInfo(buildingData, t.buildingId);
        return hates && info?.category === hates;
    });
    return hatedTarget || candidates[0];
}

export function getMonsterAdjacentHoldTarget(monster, buildings, buildingData, options) {
    const monsterInfo = getTargetSelectionBuildingInfo(buildingData, monster.buildingId);
    const candidates = collectAdjacentCandidates(monster, buildings, buildingData, options, isMonsterHoldTargetCandidate);
    if (candidates.length === 0) return null;

    if (isHealerMonster(monster?.buildingId)) {
        return selectKotofeyAdjacentTarget(monster, candidates, buildings, buildingData, options);
    }
    if (isTrollMonster(monster?.buildingId)) {
        return selectTrollAdjacentCombatTarget(monster, buildings, buildingData, {
            ...(options?.kotofeyContext || {}),
            isWrappedWorld: options?.isWrappedWorld,
            searchRadius: options?.searchRadius,
            now: options?.now,
        });
    }

    const preferredTargetId = options?.preferredTargetId ? String(options.preferredTargetId) : null;
    if (preferredTargetId) {
        const preferredTarget = candidates.find((t) => String(t.id) === preferredTargetId);
        if (preferredTarget) return preferredTarget;
    }

    const hates = monsterInfo?.stats.hates;
    const hatedTarget = candidates.find((t) => {
        const info = getTargetSelectionBuildingInfo(buildingData, t.buildingId);
        return hates && info?.category === hates;
    });
    return hatedTarget || candidates[0];
}

export function getMonsterChaseTarget(monster, buildings, buildingData, options) {
    const isPlayerOwned = Boolean(monster.ownerId && monster.ownerId !== 'monster' && monster.ownerId !== '-1' && monster.ownerId !== '0');
    if (monster.monsterMode === 'stand' || (isPlayerOwned && monster.monsterMode !== 'patrol')) return null;
    const monsterInfo = buildingData.find(i => Number(i.id) === Number(monster.buildingId));
    if (isTrollMonster(monster?.buildingId)) {
        return getTrollChaseTarget(monster, buildings, buildingData, {
            ...(options?.kotofeyContext || {}),
            isWrappedWorld: options?.isWrappedWorld,
            searchRadius: options?.searchRadius,
            now: options?.now,
        });
    }

    const isKotofey = isHealerMonster(monster?.buildingId);
    const searchRadius = options?.searchRadius ?? (
        isKotofey
            ? KOTOFEY_SEARCH_RADIUS
            : (Number(monster.buildingId) === Number(options?.bronekurId) ? 10 : (isPlayerOwned ? 8 : 5))
    );
    let nearestTarget = null;

    buildings.forEach((target) => {
        if (String(target.id) === String(monster.id)) return;
        if (!isMonsterAttackTargetCandidate(monster, target, buildingData, options)) return;
        const dist = getWrappedManhattanDistance(monster, target, !!options?.isWrappedWorld);
        if (dist > searchRadius) return;
        const targetInfo = buildingData.find(i => Number(i.id) === Number(target.buildingId));
        const hated = isKotofey
            ? isTargetGiftCategory(monsterInfo, targetInfo)
            : Boolean(monsterInfo?.stats.hates && targetInfo?.category === monsterInfo.stats.hates);
        if (
            !nearestTarget ||
            (hated && !nearestTarget.hated) ||
            (hated === nearestTarget.hated && dist < nearestTarget.dist)
        ) {
            nearestTarget = { id: String(target.id), x: target.x, y: target.y, dist, hated };
        }
    });

    if (!nearestTarget) return null;
    const target = buildings.find(b => String(b.id) === nearestTarget.id);
    return target && isBuildingAlive(target) ? target : null;
}
