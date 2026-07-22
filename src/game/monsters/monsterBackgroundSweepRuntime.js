// @ts-check
// Background monster maintenance runtime — remote zone healing,
// lightweight attacks, and stuck-monster teleport.
// Dependencies: canonical target-selection, world.js

import { getMonsterAdjacentAttackTarget, getMonsterAdjacentHoldTarget } from './monsterTargetSelection.js';
import { getZoneId, getWrappedDirectionToTarget } from '../../world.js';

const MONSTER_ATTACK_INTERVAL_MS = 40000;
const MONSTER_FATAL_HIT_DELAY_MS = 1200;

/**
 * Executes background maintenance on remote sweep zones: heals displaced
 * records, applies lightweight attacks, and teleports stuck monsters.
 *
 * @param {{
 *   now: number,
 *   sweepZoneIds: string[],
 *   buildings: any[],
 *   buildingData: any[],
 *   maxActions: number,
 *   stuckThresholdMs: number,
 *   isWorldWrapped: boolean,
 *   runtimeState: {
 *     attackTime: Map<string, number>,
 *     lastAction: Map<string, number>,
 *     targetLock: Map<string, string>,
 *   },
 *   onHealZone: (monsterId: string, newZoneId: string) => void,
 *   onAttackApplied: (params: {
 *     monsterId: string, targetId: string,
 *     monsterLastAttackTime: number,
 *     targetHp: number, targetShieldHp: number|undefined,
 *     isFatal: boolean, destructionEndTime?: number,
 *   }) => void,
 *   onTeleportStuck: (params: {
 *     monsterId: string, x: number, y: number, zoneId: string,
 *   }) => boolean,
 * }} params
 * @returns {{ actionsTaken: number }}
 */
export function executeMonsterBackgroundSweep({
    now, sweepZoneIds, buildings, buildingData,
    maxActions, stuckThresholdMs, isWorldWrapped,
    runtimeState, onHealZone, onAttackApplied, onTeleportStuck,
}) {
    let actionsTaken = 0;

    for (const sweepZoneId of sweepZoneIds) {
        if (actionsTaken >= maxActions) break;

        const zoneMonsters = buildings
            .filter(b => {
                const info = buildingData.find(i => i.id === b.buildingId);
                if (!info?.stats.isMonster) return false;
                if (b.isConstructing || b.isDestroying) return false;
                if (b.hp !== undefined && b.hp <= 0) return false;
                return (b.zoneId || getZoneId(b.x, b.y)) === sweepZoneId;
            })
            .sort((a, b) => (a.lastMoveTime || 0) - (b.lastMoveTime || 0));

        for (const monster of zoneMonsters) {
            if (actionsTaken >= maxActions) break;

            const monsterId = String(monster.id);
            const actualZoneId = getZoneId(monster.x, monster.y);
            if (monster.zoneId !== actualZoneId) {
                monster.zoneId = actualZoneId;
                onHealZone(monsterId, actualZoneId);
            }

            const attackTarget = getMonsterAdjacentAttackTarget(monster, buildings, buildingData, {
                preferredTargetId: runtimeState.targetLock.get(monsterId) || null,
                isWrappedWorld,
            });
            const holdTarget = attackTarget || getMonsterAdjacentHoldTarget(monster, buildings, buildingData, {
                preferredTargetId: runtimeState.targetLock.get(monsterId) || null,
                isWrappedWorld,
            });
            if (holdTarget) {
                runtimeState.targetLock.set(monsterId, String(holdTarget.id));
            } else {
                runtimeState.targetLock.delete(monsterId);
            }
            const lastAttackTime = Math.max(
                monster.lastAttackTime || 0,
                runtimeState.attackTime.get(monsterId) || 0
            );
            if (attackTarget && (now - lastAttackTime) >= MONSTER_ATTACK_INTERVAL_MS) {
                const monsterInfo = buildingData.find(i => i.id === monster.buildingId);
                const targetInfo = buildingData.find(i => i.id === attackTarget.buildingId);
                let damage = monsterInfo?.stats.damage ? parseInt(monsterInfo.stats.damage) : 4;
                if (monsterInfo?.stats.hates && targetInfo?.category === monsterInfo.stats.hates) {
                    damage *= 2;
                }

                let nextShield = Math.max(0, Number(attackTarget.shieldHp) || 0);
                let remainingDamage = damage;
                if (nextShield > 0) {
                    const shieldDamage = Math.min(nextShield, remainingDamage);
                    nextShield -= shieldDamage;
                    remainingDamage -= shieldDamage;
                }

                const targetBaseHp = attackTarget.hp ?? (targetInfo?.stats.durability ?? 100);
                const nextHp = Math.max(0, targetBaseHp - remainingDamage);
                const isFatalHit = remainingDamage > 0 && nextHp <= 0;

                attackTarget.hp = isFatalHit ? targetBaseHp : nextHp;
                attackTarget.shieldHp = nextShield > 0 ? nextShield : undefined;
                if (isFatalHit) {
                    const destructionEndTime = now + MONSTER_FATAL_HIT_DELAY_MS;
                    attackTarget.isDestroying = true;
                    attackTarget.destructionEndTime = destructionEndTime;
                    attackTarget.pendingDamage = targetBaseHp;
                }
                monster.lastAttackTime = now;
                runtimeState.attackTime.set(monsterId, now);
                runtimeState.lastAction.set(monsterId, now);

                onAttackApplied({
                    monsterId, targetId: String(attackTarget.id),
                    monsterLastAttackTime: now,
                    targetHp: nextHp, targetShieldHp: nextShield > 0 ? nextShield : undefined,
                    isFatal: isFatalHit,
                    destructionEndTime: isFatalHit ? now + MONSTER_FATAL_HIT_DELAY_MS : undefined,
                });
                actionsTaken++;
                continue;
            }

            if (holdTarget) continue;

            const lastMoveTime = Math.max(monster.lastMoveTime || 0, runtimeState.lastAction.get(monsterId) || 0);
            const moveInterval = 30000;
            if ((now - lastMoveTime) >= (moveInterval * stuckThresholdMs / 30000)) {
                const teleported = onTeleportStuck({ monsterId, x: monster.x, y: monster.y, zoneId: monster.zoneId });
                if (teleported) {
                    actionsTaken++;
                }
            }
        }
    }

    return { actionsTaken };
}
