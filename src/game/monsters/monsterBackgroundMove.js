// @ts-check
// Monster background movement planner — pure decision engine.
// Receives all runtime state as arguments, returns a movement plan.
// Dependencies: monsterMovement.js, monsterTargetSelection.js, monsterCrowding.js, ../../world.js

import { getMonsterPatrolDirection, chooseMonsterMoveTowardTarget, chooseMonsterPatrolMove, isMonsterTileBlocked } from './monsterMovement.js';
import { getMonsterAdjacentHoldTarget, getMonsterChaseTarget } from './monsterTargetSelection.js';
import { getCrowdingEscapeMove } from './monsterCrowding.js';
import { getCardinalNeighborTiles, getWrappedDirectionToTarget } from '../../world.js';

/**
 * Plans the best background move for a monster, considering hold targets,
 * chase targets, crowding escape, and patrol fallback in priority order.
 * @param {{ id: string|number; ownerId?: string|number; buildingId: number; x: number; y: number; zoneId?: string }} monster
 * @param {Array<any>} buildings
 * @param {Array<{ id: number; stats?: any }>} buildingData
 * @param {Set<string>} occupiedPositions
 * @param {Set<string>} blockedResourcePositions
 * @param {Map<string, number>} zoneCounts
 * @param {boolean} isWrappedWorld
 * @param {{ x: number; y: number }|undefined} previousPos
 * @param {{ dx: number; dy: number }|undefined} lastDir
 * @param {Array<{ x: number; y: number }>} recentPositions
 * @returns {{ chosenMove: (null | { x: number; y: number; dx: number; dy: number }); nextDir: { dx: number; dy: number } }}
 */
export function chooseMonsterBackgroundMove(
    monster, buildings, buildingData,
    occupiedPositions, blockedResourcePositions,
    zoneCounts, isWrappedWorld,
    previousPos, lastDir, recentPositions
) {
    const isPlayerOwned = Boolean(monster.ownerId && monster.ownerId !== 'monster' && monster.ownerId !== '-1' && monster.ownerId !== '0');
    if (monster.monsterMode === 'stand' || (isPlayerOwned && monster.monsterMode !== 'patrol')) {
        return {
            chosenMove: null,
            nextDir: lastDir || getMonsterPatrolDirection(monster.id, monster.buildingId)
        };
    }
    const nextDir = lastDir || getMonsterPatrolDirection(monster.id, monster.buildingId);
    const adjacentHoldTarget = getMonsterAdjacentHoldTarget(monster, buildings, buildingData, { isWrappedWorld });
    if (adjacentHoldTarget) {
        return {
            chosenMove: null,
            nextDir: getWrappedDirectionToTarget(monster, adjacentHoldTarget, isWrappedWorld)
        };
    }

    const neighbors = getCardinalNeighborTiles(monster.x, monster.y, isWrappedWorld);

    const validMoves = neighbors.filter(move =>
        !isMonsterTileBlocked(move.x, move.y, occupiedPositions, blockedResourcePositions, undefined, isWrappedWorld)
    );
    if (validMoves.length === 0) {
        return { chosenMove: null, nextDir };
    }
    const recentKeys = new Set((recentPositions || []).map(pos => `${pos.x},${pos.y}`));
    const preferredMoves = validMoves.filter(move => !recentKeys.has(`${move.x},${move.y}`));
    const candidateMoves = preferredMoves.length > 0 ? preferredMoves : validMoves;

    const chaseTarget = getMonsterChaseTarget(monster, buildings, buildingData, { isWrappedWorld });
    let chosenMove = null;
    if (chaseTarget) {
        chosenMove = chooseMonsterMoveTowardTarget(candidateMoves, chaseTarget, isWrappedWorld);
    } else {
        chosenMove = getCrowdingEscapeMove(monster, candidateMoves, zoneCounts, isWrappedWorld);
        if (!chosenMove) {
            chosenMove = chooseMonsterPatrolMove(
                candidateMoves, nextDir, true,
                monster.id, monster.buildingId, 0, previousPos
            ).chosenMove;
        }
    }

    if (chosenMove && previousPos && chosenMove.x === previousPos.x && chosenMove.y === previousPos.y && candidateMoves.length > 1) {
        const altMove = candidateMoves.find(m => m.x !== previousPos.x || m.y !== previousPos.y);
        if (altMove) chosenMove = altMove;
    }

    return {
        chosenMove,
        nextDir: chosenMove ? { dx: chosenMove.dx, dy: chosenMove.dy } : nextDir
    };
}
