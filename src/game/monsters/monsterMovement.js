// @ts-check

import { getWrappedDelta, getWrappedManhattanDistance, normalizeWorldCoord, WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES } from '../../world.js';
import { KILLING_HUT_ID, KIND_SANTA_ID, GORYNYCH_ID, KOLOBOK_ID, BABA_YAGA_ID, BRONEKUR_ID, KOTOFEY_ID, TROLL_ID, AIBOLIT_ID, BIG_AIBOLIT_ID } from './monsterIds.js';

/** @type {Record<number, number>} */
export const MONSTER_MOVE_INTERVALS = {
  [KILLING_HUT_ID]: 26000,
  [KIND_SANTA_ID]: 23000,
  [GORYNYCH_ID]: 30000,
  [KOLOBOK_ID]: 28000,
  [BABA_YAGA_ID]: 29000,
  [BRONEKUR_ID]: 18000,
  [KOTOFEY_ID]: 22000,
  [TROLL_ID]: 22000,
  [AIBOLIT_ID]: 22000,
  [BIG_AIBOLIT_ID]: 22000,
};
export const DEFAULT_MONSTER_MOVE_INTERVAL = 30000;
export const MONSTER_MOVE_JITTER_RATIO = 0.18;
export const MONSTER_RECENT_POSITIONS_LIMIT = 6;
export const MONSTER_MOVE_BATCH_INTERVAL_MS = 500;
export const MAX_MONSTER_MOVES_PER_BATCH = 6;
export const MAX_MONSTER_WRITE_UPDATES_PER_TICK = 8;
export const MONSTER_WRITE_MIN_INTERVAL_MS = 800;
export const MONSTER_WALK_DURATION_MULTIPLIER = 1.5;

/**
 * @typedef {{ x: number; y: number; dx: number; dy: number }} MonsterMoveStep
 * @typedef {{ dx: number; dy: number }} MonsterDirection
 * @typedef {{ chosenMove: (MonsterMoveStep | null); selectedTurn: 'preferred' | 'alternate' | 'forward' | 'random' | 'none' }} MonsterPatrolMoveResult
 * @typedef {{ x: number; y: number; zoneId: string }} MonsterTeleportSpot
 */

export function getMonsterMoveSeed(monsterId, buildingId) {
    const source = `${monsterId}:${buildingId}`;
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
        hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export function hashMonsterZoneSeed(source) {
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
        hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export function seededShuffle(items, seedSource) {
    const result = [...items];
    let seed = hashMonsterZoneSeed(seedSource) || 1;
    for (let i = result.length - 1; i > 0; i--) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const j = seed % (i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function getMonsterMoveInterval(buildingId, monsterId) {
    const baseInterval = MONSTER_MOVE_INTERVALS[Number(buildingId)] || MONSTER_MOVE_INTERVALS[buildingId] || DEFAULT_MONSTER_MOVE_INTERVAL;
    const seed = getMonsterMoveSeed(monsterId, buildingId) % 1000;
    const jitter = ((seed / 999) * 2 - 1) * MONSTER_MOVE_JITTER_RATIO;
    return Math.max(12000, Math.round(baseInterval * (1 + jitter)));
}

export function getPlaybackDurationMs(frameCount, fps, durationMultiplier = 1) {
    return frameCount * (1000 / fps) * durationMultiplier;
}

export function getPlaybackFrameIndex(elapsedMs, frameCount, fps, durationMultiplier = 1) {
    const effectiveFps = fps / durationMultiplier;
    return Math.min(Math.floor(elapsedMs / (1000 / effectiveFps)), frameCount - 1);
}

export function chooseMonsterMoveTowardTarget(validMoves, target, isWrappedWorld, currentPos) {
    if (validMoves.length === 0) return null;
    let bestMove = validMoves[0];
    let bestDist = getWrappedManhattanDistance(validMoves[0], target, isWrappedWorld);

    const dxToTarget = currentPos ? Math.abs(getWrappedDelta(currentPos.x, target.x, WORLD_WIDTH_TILES, isWrappedWorld)) : 0;
    const dyToTarget = currentPos ? Math.abs(getWrappedDelta(currentPos.y, target.y, WORLD_HEIGHT_TILES, isWrappedWorld)) : 0;
    const preferY = dyToTarget > dxToTarget;

    validMoves.forEach(move => {
        const dist = getWrappedManhattanDistance(move, target, isWrappedWorld);
        if (dist < bestDist) {
            bestDist = dist;
            bestMove = move;
        } else if (dist === bestDist && currentPos) {
            if (preferY && move.dy !== 0 && bestMove.dy === 0) {
                bestMove = move;
            } else if (!preferY && move.dx !== 0 && bestMove.dx === 0) {
                bestMove = move;
            }
        }
    });
    return bestMove;
}

export function getMonsterPatrolDirection(monsterId, buildingId) {
    const seed = getMonsterMoveSeed(monsterId, buildingId);
    const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];
    return dirs[seed % dirs.length];
}

export function chooseMonsterPatrolMove(validMoves, lastDir, preferLeftTurn, monsterId, buildingId, fallbackStepOffset = 0, previousPos) {
    if (validMoves.length === 0) {
        return { chosenMove: null, selectedTurn: 'none' };
    }

    const leftTurn = { dx: -lastDir.dy, dy: lastDir.dx };
    const rightTurn = { dx: lastDir.dy, dy: -lastDir.dx };
    const preferredTurn = preferLeftTurn ? leftTurn : rightTurn;
    const alternateTurn = preferLeftTurn ? rightTurn : leftTurn;
    const preferTurnMove = validMoves.find(m => m.dx === preferredTurn.dx && m.dy === preferredTurn.dy);
    const altTurnMove = validMoves.find(m => m.dx === alternateTurn.dx && m.dy === alternateTurn.dy);
    const forwardMove = validMoves.find(m => m.dx === lastDir.dx && m.dy === lastDir.dy);

    let chosenMove;
    let selectedTurn;

    // Monsters walk straight forward by default (~80% chance) for smooth, natural patrolling.
    // They turn when forward is blocked or with a ~20% wandering chance.
    const seed = getMonsterMoveSeed(monsterId, buildingId) + fallbackStepOffset;
    const shouldRandomlyTurn = (seed % 5 === 0);

    if (forwardMove && !shouldRandomlyTurn && (!previousPos || forwardMove.x !== previousPos.x || forwardMove.y !== previousPos.y)) {
        chosenMove = forwardMove;
        selectedTurn = 'forward';
    } else if (preferTurnMove) {
        chosenMove = preferTurnMove;
        selectedTurn = 'preferred';
    } else if (altTurnMove) {
        chosenMove = altTurnMove;
        selectedTurn = 'alternate';
    } else if (forwardMove) {
        chosenMove = forwardMove;
        selectedTurn = 'forward';
    } else {
        chosenMove = validMoves[seed % validMoves.length];
        selectedTurn = 'random';
    }

    if (previousPos && chosenMove.x === previousPos.x && chosenMove.y === previousPos.y && validMoves.length > 1) {
        const altMove = validMoves.find(m => m.x !== previousPos.x || m.y !== previousPos.y);
        if (altMove) chosenMove = altMove;
    }

    return { chosenMove, selectedTurn };
}

export function isMonsterTileBlocked(x, y, occupiedPositions, blockedResourcePositions, extraBlocked, isWrappedWorld = false) {
    const normalizedX = normalizeWorldCoord(x, WORLD_WIDTH_TILES, isWrappedWorld);
    const normalizedY = normalizeWorldCoord(y, WORLD_HEIGHT_TILES, isWrappedWorld);
    if (!isWrappedWorld && (normalizedX < 0 || normalizedX >= WORLD_WIDTH_TILES || normalizedY < 0 || normalizedY >= WORLD_HEIGHT_TILES)) {
        return true;
    }
    const key = `${normalizedX},${normalizedY}`;
    if (occupiedPositions.has(key)) return true;
    if (blockedResourcePositions.has(key)) return true;
    return extraBlocked ? extraBlocked(normalizedX, normalizedY) : false;
}
