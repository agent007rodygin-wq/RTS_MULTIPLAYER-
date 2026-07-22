// @ts-check
// Monster attack runtime executor — target selection, damage calculation,
// cooldown management, and destruction marking via injected callbacks.
// Dependencies: canonical target-selection, world.js

import { getMonsterAdjacentAttackTarget } from './monsterTargetSelection.js';
import { getWrappedDirectionToTarget } from '../../world.js';

/**
 * @typedef {{ x: number; y: number; id?: string|number; buildingId: number; ownerId?: string|number; lastAttackTime?: number; hostId?: string }} MonsterRecord
 */

/**
 * Executes one tick of monster attacks. Mutates runtime Maps/Sets
 * and invokes callbacks for damage recording, destruction marking,
 * and persistence.
 *
 * @param {{
 *   now: number,
 *   monstersReadyToAttack: MonsterRecord[],
 *   buildings: MonsterRecord[],
 *   buildingData: Array<{ id: number; stats?: any; category?: string }>,
 *   isWorldWrapped: boolean,
 *   pendingDestroyedIds: Set<string>,
 *   runtimeState: {
 *     targetLock: Map<string, string>,
 *     direction: Map<string, { dx: number; dy: number }>,
 *     attackDirection: Map<string, { dx: number; dy: number }>,
 *     attackTime: Map<string, number>,
 *     attackCancelTime: Map<string, number>,
 *     lastAction: Map<string, number>,
 *   },
 *   callbacks: {
 *     onDamageQueued: (monsterId: string, targetId: string, damage: number) => void,
 *     onAttackSource: (targetId: string, monsterId: string) => void,
 *     onDamageInitiator: (targetId: string, ownerId: string|null) => void,
 *     persistMonsterAttack: (monsterId: string, update: { lastAttackTime: number, hostId: string }) => void,
 *     onMonsterAttackComplete: (monsterId: string) => void,
 *   },
 *   isBuildingDeleting: (id: string) => boolean,
 *   isBuildingTombstoned: (id: string) => boolean,
 *   hostId: string,
 *   isNeutralMonster: (ownerId: string|number) => boolean,
 * }} params
 */
export function executeMonsterAttackBatch({
    now, monstersReadyToAttack, buildings, buildingData,
    isWorldWrapped, pendingDestroyedIds, runtimeState,
    callbacks, isBuildingDeleting, isBuildingTombstoned,
    hostId, isNeutralMonster,
}) {
    monstersReadyToAttack.forEach(monster => {
        const monsterInfo = buildingData.find(i => i.id === monster.buildingId);
        const monsterId = String(monster.id || '');
        const preferredTargetId = runtimeState.targetLock.get(monsterId) || null;
        const target = getMonsterAdjacentAttackTarget(monster, buildings, buildingData, {
            preferredTargetId,
            isWrappedWorld: isWorldWrapped,
            pendingDestroyedIds,
        });

        if (!target) {
            runtimeState.targetLock.delete(monsterId);
            return;
        }
        const targetId = String(target.id);

        if (
            target.isDestroying ||
            (target.hp !== undefined && target.hp <= 0) ||
            pendingDestroyedIds.has(targetId) ||
            isBuildingDeleting(targetId) ||
            isBuildingTombstoned(targetId)
        ) {
            runtimeState.targetLock.delete(monsterId);
            return;
        }
        runtimeState.targetLock.set(monsterId, targetId);

        let dmg = monsterInfo?.stats.damage ? parseInt(monsterInfo.stats.damage) : 4;
        const targetInfo = buildingData.find(i => i.id === target.buildingId);
        if (monsterInfo?.stats.hates && targetInfo?.category === monsterInfo.stats.hates) {
            dmg *= 2;
        }

        callbacks.onDamageQueued(monsterId, targetId, dmg);

        const targetCurrentHp = target.hp ?? (targetInfo?.stats.durability ?? 100);
        // damageMap check is handled by the callback tracking cumulative damage
        callbacks.onAttackSource(targetId, monsterId);
        const monsterOwnerId = String(monster.ownerId || '');
        const monsterIsNeutral = monsterOwnerId === 'monster' || monsterOwnerId === '-1' || monsterOwnerId === '0';
        callbacks.onDamageInitiator(targetId, monsterIsNeutral ? null : monsterOwnerId);

        const attackDir = getWrappedDirectionToTarget(monster, target, isWorldWrapped);
        runtimeState.direction.set(monsterId, attackDir);
        runtimeState.attackDirection.set(monsterId, attackDir);
        runtimeState.attackTime.set(monsterId, now);
        runtimeState.attackCancelTime.delete(monsterId);
        runtimeState.lastAction.set(monsterId, now);

        if (isNeutralMonster(monster.ownerId || '')) {
            callbacks.persistMonsterAttack(monsterId, { lastAttackTime: now, hostId });
        }
        if (callbacks.onMonsterAttackComplete) {
            callbacks.onMonsterAttackComplete(monsterId);
        }
    });
}
