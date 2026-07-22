// @ts-check
// Monster movement runtime executor — applies per-monster movement decisions,
// mutates runtime state, and invokes persistence through an injected callback.
// Dependencies: canonical pure monster modules, world.js

import { getMonsterPatrolDirection, chooseMonsterMoveTowardTarget, chooseMonsterPatrolMove, isMonsterTileBlocked, getPlaybackDurationMs, MONSTER_WALK_DURATION_MULTIPLIER } from './monsterMovement.js';
import { getMonsterAdjacentAttackTarget, getMonsterChaseTarget } from './monsterTargetSelection.js';
import { getCrowdingEscapeMove } from './monsterCrowding.js';
import { getCardinalNeighborTiles, getWrappedDirectionToTarget, getZoneId } from '../../world.js';

const KILLING_HUT_ID = 70001;
const MONSTER_ATTACK_INTERVAL_MS = 40000;
const MONSTER_RECENT_POSITIONS_LIMIT = 6;

/**
 * @typedef {{ x: number; y: number; id?: string|number; buildingId: number; ownerId?: string|number; lastMoveTime?: number; lastAttackTime?: number }} MonsterRecord
 */

/**
 * Executes one tick of monster movement. Mutates runtime state Maps/Sets
 * and calls `persistMonsterMove` for backend persistence.
 *
 * @param {{
 *   now: number,
 *   actingMonsters: MonsterRecord[],
 *   buildings: MonsterRecord[],
 *   buildingData: Array<{ id: number; stats?: any }>,
 *   isWorldWrapped: boolean,
 *   pendingDestroyedIds: Set<string>,
 *   blockedTargetIds: Set<string>,
 *   occupiedPositions: Set<string>,
 *   blockedResourcePositions: Set<string>,
 *   monsterZoneCounts: Map<string, number>,
 *   isZoneReadyFn: (x: number, y: number) => boolean,
 *   runtimeState: {
 *     prevPos: Map<string, { x: number; y: number }>,
 *     recentPositions: Map<string, Array<{ x: number; y: number }>>,
 *     direction: Map<string, { dx: number; dy: number }>,
 *     targetLock: Map<string, string>,
 *     lastAction: Map<string, number>,
 *     attackTime: Map<string, number>,
 *     attackCancelTime: Map<string, number>,
 *     turnState: Map<string, boolean>,
 *   },
 *   persistMonsterMove: (monsterId: string, update: {
 *     x: number, y: number, zoneId: string,
 *     lastMoveTime: number, hostId: string
 *   }) => void,
 *   persistMonsterStuck: (monsterId: string, update: { lastMoveTime: number, hostId: string }) => void,
 *   onMoveApplied: (monsterId: string, result: {
 *     moved: boolean, chosenX?: number, chosenY?: number
 *   }) => void,
 *   hostId: string,
 *   isNeutralMonster: (ownerId: string|number) => boolean,
 *   izbushkaWalkLeftFrames: string[],
 *   izbushkaWalkRightFrames: string[],
 *   izbushkaWalkDownFrames: string[],
 *   izbushkaWalkUpFrames: string[],
 * }} params
 */
export function executeMonsterMovementBatch({
    now, actingMonsters, buildings, buildingData,
    isWorldWrapped, pendingDestroyedIds, blockedTargetIds,
    occupiedPositions, blockedResourcePositions, monsterZoneCounts,
    isZoneReadyFn, runtimeState, persistMonsterMove, persistMonsterStuck,
    onMoveApplied, hostId, isNeutralMonster,
    izbushkaWalkLeftFrames, izbushkaWalkRightFrames,
    izbushkaWalkDownFrames, izbushkaWalkUpFrames,
}) {
    actingMonsters.forEach(monster => {
        const monsterId = String(monster.id || '');
        const recentPositions = runtimeState.recentPositions.get(monsterId) || [];

        let lastDir = runtimeState.direction.get(monsterId);
        if (!lastDir) {
            const dirs = [{dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}];
            lastDir = dirs[Math.floor(Math.random() * dirs.length)];
            runtimeState.direction.set(monsterId, lastDir);
        }
        const neighbors = getCardinalNeighborTiles(monster.x, monster.y, isWorldWrapped);
        const preferredTargetId = runtimeState.targetLock.get(monsterId) || null;
        const target = getMonsterAdjacentAttackTarget(monster, buildings, buildingData, {
            preferredTargetId,
            isWrappedWorld: isWorldWrapped,
        });
        if (target) {
            runtimeState.targetLock.set(monsterId, String(target.id));
        } else {
            runtimeState.targetLock.delete(monsterId);
        }

        const lastAttackTime = Math.max(
            monster.lastAttackTime || 0,
            runtimeState.attackTime.get(monsterId) || 0
        );
        const shouldHoldPositionForAttack = Boolean(target);

        if (shouldHoldPositionForAttack && target) {
            const attackDir = getWrappedDirectionToTarget(monster, target, isWorldWrapped);
            runtimeState.direction.set(monsterId, attackDir);
        } else {
            const validMoves = neighbors.filter(move =>
                !isMonsterTileBlocked(
                    move.x, move.y,
                    occupiedPositions, blockedResourcePositions,
                    (x, y) => !isZoneReadyFn(x, y),
                    isWorldWrapped
                )
            );
            const recentKeys = new Set(recentPositions.map(pos => `${pos.x},${pos.y}`));
            const preferredMoves = validMoves.filter(move => !recentKeys.has(`${move.x},${move.y}`));
            const candidateMoves = preferredMoves.length > 0 ? preferredMoves : validMoves;

            if (candidateMoves.length > 0) {
                const chaseTarget = getMonsterChaseTarget(monster, buildings, buildingData, {
                    blockedTargetIds, pendingDestroyedIds,
                    isWrappedWorld: isWorldWrapped,
                });

                let chosenMove = null;
                if (chaseTarget) {
                    chosenMove = chooseMonsterMoveTowardTarget(candidateMoves, chaseTarget, isWorldWrapped);
                } else {
                    chosenMove = getCrowdingEscapeMove(monster, candidateMoves, monsterZoneCounts, isWorldWrapped);
                    if (!chosenMove) {
                        const lastTurnWasLeft = runtimeState.turnState.get(monsterId) || false;
                        const patrolMove = chooseMonsterPatrolMove(
                            candidateMoves, lastDir, !lastTurnWasLeft,
                            monsterId, monster.buildingId, 0,
                            runtimeState.prevPos.get(monsterId)
                        );
                        if (patrolMove.chosenMove) {
                            if (patrolMove.selectedTurn === 'preferred') {
                                runtimeState.turnState.set(monsterId, !lastTurnWasLeft);
                            }
                            chosenMove = patrolMove.chosenMove;
                        }
                    }
                }

                if (chosenMove) {
                    const prevPos = runtimeState.prevPos.get(monsterId);
                    if (prevPos && chosenMove.x === prevPos.x && chosenMove.y === prevPos.y && candidateMoves.length > 1) {
                        const altMove = candidateMoves.find(m => m.x !== prevPos.x || m.y !== prevPos.y);
                        if (altMove) chosenMove = altMove;
                    }
                    runtimeState.prevPos.set(monsterId, { x: monster.x, y: monster.y });
                    const nextRecent = [...recentPositions, { x: monster.x, y: monster.y }].slice(-MONSTER_RECENT_POSITIONS_LIMIT);
                    runtimeState.recentPositions.set(monsterId, nextRecent);
                    runtimeState.direction.set(monsterId, { dx: chosenMove.dx, dy: chosenMove.dy });

                    if (monster.buildingId === KILLING_HUT_ID) {
                        let walkFrameCount = 75;
                        const absDx = Math.abs(chosenMove.dx);
                        const absDy = Math.abs(chosenMove.dy);
                        if (absDx === 0 && absDy === 0) walkFrameCount = izbushkaWalkLeftFrames.length;
                        else if (absDx >= absDy) walkFrameCount = chosenMove.dx > 0 ? izbushkaWalkRightFrames.length : izbushkaWalkLeftFrames.length;
                        else walkFrameCount = chosenMove.dy > 0 ? izbushkaWalkDownFrames.length : izbushkaWalkUpFrames.length;
                        const walkDuration = getPlaybackDurationMs(walkFrameCount, 30, MONSTER_WALK_DURATION_MULTIPLIER);
                        runtimeState.attackCancelTime.set(monsterId, now + walkDuration);
                    }

                    occupiedPositions.add(`${chosenMove.x},${chosenMove.y}`);
                    occupiedPositions.delete(`${monster.x},${monster.y}`);

                    const newZoneId = getZoneId(chosenMove.x, chosenMove.y);
                    runtimeState.lastAction.set(monsterId, now);

                    if (isNeutralMonster(monster.ownerId || '')) {
                        persistMonsterMove(monsterId, {
                            x: chosenMove.x, y: chosenMove.y,
                            zoneId: newZoneId, lastMoveTime: now, hostId,
                        });
                    }
                    if (onMoveApplied) onMoveApplied(monsterId, { moved: true, chosenX: chosenMove.x, chosenY: chosenMove.y });
                } else {
                    runtimeState.lastAction.set(monsterId, now);
                    if (isNeutralMonster(monster.ownerId || '')) {
                        persistMonsterStuck(monsterId, { lastMoveTime: now, hostId });
                    }
                    if (onMoveApplied) onMoveApplied(monsterId, { moved: false });
                }
            }
        }
    });
}
