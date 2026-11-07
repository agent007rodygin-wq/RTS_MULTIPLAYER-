// @ts-check

import { getCardinalNeighborTiles, getWrappedManhattanDistance } from '../../world.js';
import { isBuildingAlive } from '../buildings/isBuildingAlive.js';

export function isMonsterAttackTargetCandidate(monster, target, buildingData, options) {
    const targetId = String(target.id);
    const targetInfo = buildingData.find(i => Number(i.id) === Number(target.buildingId));
    const riverId = options?.riverId ?? 50004;
    const mountainId = options?.mountainId ?? 50005;
    if (target.ownerId === monster.ownerId) return false;
    if (Number(target.buildingId) === Number(riverId) || Number(target.buildingId) === Number(mountainId)) return false;
    if (targetInfo?.stats.isMonster) return false;
    if (options?.blockedTargetIds?.has(targetId)) return false;
    if (options?.pendingDestroyedIds?.has(targetId)) return false;
    if (target.isDestroying) return false;
    if (target.hp !== undefined && target.hp <= 0) return false;
    return true;
}

export function isMonsterHoldTargetCandidate(monster, target, buildingData, options) {
    const targetId = String(target.id);
    const targetInfo = buildingData.find(i => Number(i.id) === Number(target.buildingId));
    const riverId = options?.riverId ?? 50004;
    const mountainId = options?.mountainId ?? 50005;
    if (target.ownerId === monster.ownerId) return false;
    if (Number(target.buildingId) === Number(riverId) || Number(target.buildingId) === Number(mountainId)) return false;
    if (targetInfo?.stats.isMonster) return false;
    if (options?.blockedTargetIds?.has(targetId)) return false;
    if (options?.pendingDestroyedIds?.has(targetId)) return false;
    if (target.hp !== undefined && target.hp <= 0) return false;
    return true;
}

export function getMonsterAdjacentAttackTarget(monster, buildings, buildingData, options) {
    const monsterInfo = buildingData.find(i => Number(i.id) === Number(monster.buildingId));
    const neighbors = getCardinalNeighborTiles(monster.x, monster.y, !!options?.isWrappedWorld);

    const candidates = buildings.filter(target =>
        neighbors.some(n => n.x === target.x && n.y === target.y) &&
        isMonsterAttackTargetCandidate(monster, target, buildingData, options)
    );
    if (candidates.length === 0) return null;

    const preferredTargetId = options?.preferredTargetId ? String(options.preferredTargetId) : null;
    if (preferredTargetId) {
        const preferredTarget = candidates.find((t) => String(t.id) === preferredTargetId);
        if (preferredTarget) return preferredTarget;
    }

    const hates = monsterInfo?.stats.hates;
    const hatedTarget = candidates.find((t) => {
        const info = buildingData.find(i => Number(i.id) === Number(t.buildingId));
        return hates && info?.category === hates;
    });
    return hatedTarget || candidates[0];
}

export function getMonsterAdjacentHoldTarget(monster, buildings, buildingData, options) {
    const monsterInfo = buildingData.find(i => Number(i.id) === Number(monster.buildingId));
    const neighbors = getCardinalNeighborTiles(monster.x, monster.y, !!options?.isWrappedWorld);

    const candidates = buildings.filter(target =>
        neighbors.some(n => n.x === target.x && n.y === target.y) &&
        isMonsterHoldTargetCandidate(monster, target, buildingData, options)
    );
    if (candidates.length === 0) return null;

    const preferredTargetId = options?.preferredTargetId ? String(options.preferredTargetId) : null;
    if (preferredTargetId) {
        const preferredTarget = candidates.find((t) => String(t.id) === preferredTargetId);
        if (preferredTarget) return preferredTarget;
    }

    const hates = monsterInfo?.stats.hates;
    const hatedTarget = candidates.find((t) => {
        const info = buildingData.find(i => Number(i.id) === Number(t.buildingId));
        return hates && info?.category === hates;
    });
    return hatedTarget || candidates[0];
}

export function getMonsterChaseTarget(monster, buildings, buildingData, options) {
    const monsterInfo = buildingData.find(i => Number(i.id) === Number(monster.buildingId));
    const searchRadius = options?.searchRadius ?? (Number(monster.buildingId) === Number(options?.bronekurId) ? 10 : 5);
    let nearestTarget = null;

    buildings.forEach((target) => {
        if (String(target.id) === String(monster.id)) return;
        if (!isMonsterAttackTargetCandidate(monster, target, buildingData, options)) return;
        const dist = getWrappedManhattanDistance(monster, target, !!options?.isWrappedWorld);
        if (dist > searchRadius) return;
        const targetInfo = buildingData.find(i => Number(i.id) === Number(target.buildingId));
        const hated = Boolean(monsterInfo?.stats.hates && targetInfo?.category === monsterInfo.stats.hates);
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
