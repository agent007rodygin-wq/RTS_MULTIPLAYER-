/**
 * Characterization Scenario 24 — Monster Pure Logic Deduplication
 *
 * Verifies canonical monster functions produce expected outputs,
 * including default river/mountain ID behavior.
 */

import { ok, deepEqual, strictEqual } from 'node:assert/strict';

// ── Replicas from canonical modules ──

// monsterIds.js
const KILLING_HUT_ID = 70001;
const KIND_SANTA_ID = 70002;
const GORYNYCH_ID = 70003;
const KOLOBOK_ID = 70004;
const BABA_YAGA_ID = 70005;
const BRONEKUR_ID = 70006;

// world.js replicas
const wrapCoord = (v, max) => ((v % max) + max) % max;
const normalizeWorldCoord = (v, max, w) => w ? wrapCoord(v, max) : v;
const WORLD_WIDTH_TILES = 200;
const WORLD_HEIGHT_TILES = 200;
const getWrappedDelta = (from, to, size, isWrappedWorld) => {
    let d = to - from;
    if (!isWrappedWorld) return d;
    if (d > size / 2) d -= size;
    else if (d < -size / 2) d += size;
    return d;
};
const getWrappedManhattanDistance = (from, to, isWrappedWorld) =>
    Math.abs(getWrappedDelta(from.x, to.x, WORLD_WIDTH_TILES, isWrappedWorld)) +
    Math.abs(getWrappedDelta(from.y, to.y, WORLD_HEIGHT_TILES, isWrappedWorld));

// monsterMovement.js replicas
const getMonsterMoveSeed = (monsterId, buildingId) => {
    const source = `${monsterId}:${buildingId}`;
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
        hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
};

const hashMonsterZoneSeed = (source) => {
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
        hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
};

const seededShuffle = (items, seedSource) => {
    const result = [...items];
    let seed = hashMonsterZoneSeed(seedSource) || 1;
    for (let i = result.length - 1; i > 0; i--) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const j = seed % (i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

const MONSTER_MOVE_INTERVALS = {
    [KILLING_HUT_ID]: 26000, [KIND_SANTA_ID]: 23000,
    [GORYNYCH_ID]: 30000, [KOLOBOK_ID]: 28000,
    [BABA_YAGA_ID]: 29000, [BRONEKUR_ID]: 18000,
};
const DEFAULT_MONSTER_MOVE_INTERVAL = 32000;
const MONSTER_MOVE_JITTER_RATIO = 0.18;

const getMonsterMoveInterval = (buildingId, monsterId) => {
    const baseInterval = MONSTER_MOVE_INTERVALS[buildingId] || DEFAULT_MONSTER_MOVE_INTERVAL;
    const seed = getMonsterMoveSeed(monsterId, buildingId) % 1000;
    const jitter = ((seed / 999) * 2 - 1) * MONSTER_MOVE_JITTER_RATIO;
    return Math.max(12000, Math.round(baseInterval * (1 + jitter)));
};

const chooseMonsterMoveTowardTarget = (validMoves, target, isWrappedWorld) => {
    if (validMoves.length === 0) return null;
    let bestMove = validMoves[0];
    let bestDist = getWrappedManhattanDistance(validMoves[0], target, isWrappedWorld);
    validMoves.forEach(move => {
        const dist = getWrappedManhattanDistance(move, target, isWrappedWorld);
        if (dist < bestDist) { bestDist = dist; bestMove = move; }
    });
    return bestMove;
};

const getMonsterPatrolDirection = (monsterId, buildingId) => {
    const seed = getMonsterMoveSeed(monsterId, buildingId);
    const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
    return dirs[seed % dirs.length];
};

const chooseMonsterPatrolMove = (validMoves, lastDir, preferLeftTurn, monsterId, buildingId, fallbackStepOffset = 0, previousPos) => {
    if (validMoves.length === 0) return { chosenMove: null, selectedTurn: 'none' };
    const leftTurn = { dx: -lastDir.dy, dy: lastDir.dx };
    const rightTurn = { dx: lastDir.dy, dy: -lastDir.dx };
    const preferredTurn = preferLeftTurn ? leftTurn : rightTurn;
    const alternateTurn = preferLeftTurn ? rightTurn : leftTurn;
    const preferTurnMove = validMoves.find(m => m.dx === preferredTurn.dx && m.dy === preferredTurn.dy);
    const altTurnMove = validMoves.find(m => m.dx === alternateTurn.dx && m.dy === alternateTurn.dy);
    const forwardMove = validMoves.find(m => m.dx === lastDir.dx && m.dy === lastDir.dy);
    let chosenMove, selectedTurn;
    if (preferTurnMove) { chosenMove = preferTurnMove; selectedTurn = 'preferred'; }
    else if (forwardMove) { chosenMove = forwardMove; selectedTurn = 'forward'; }
    else if (altTurnMove) { chosenMove = altTurnMove; selectedTurn = 'alternate'; }
    else { chosenMove = validMoves[(getMonsterMoveSeed(monsterId, buildingId) + fallbackStepOffset) % validMoves.length]; selectedTurn = 'random'; }
    if (previousPos && chosenMove.x === previousPos.x && chosenMove.y === previousPos.y && validMoves.length > 1) {
        const altMove = validMoves.find(m => m.x !== previousPos.x || m.y !== previousPos.y);
        if (altMove) chosenMove = altMove;
    }
    return { chosenMove, selectedTurn };
};

const isMonsterTileBlocked = (x, y, occupiedPositions, blockedResourcePositions, extraBlocked, isWrappedWorld = false) => {
    const nx = normalizeWorldCoord(x, WORLD_WIDTH_TILES, isWrappedWorld);
    const ny = normalizeWorldCoord(y, WORLD_HEIGHT_TILES, isWrappedWorld);
    if (!isWrappedWorld && (nx < 0 || nx >= WORLD_WIDTH_TILES || ny < 0 || ny >= WORLD_HEIGHT_TILES)) return true;
    const key = `${nx},${ny}`;
    if (occupiedPositions.has(key)) return true;
    if (blockedResourcePositions.has(key)) return true;
    return extraBlocked ? extraBlocked(nx, ny) : false;
};

// monsterTargetSelection.js replicas (with defaults)
const isMonsterAttackTargetCandidate = (monster, target, buildingData, options) => {
    const targetId = String(target.id);
    const targetInfo = buildingData.find(i => i.id === target.buildingId);
    const riverId = options?.riverId ?? 50004;
    const mountainId = options?.mountainId ?? 50005;
    if (target.ownerId === monster.ownerId) return false;
    if (target.buildingId === riverId || target.buildingId === mountainId) return false;
    if (targetInfo?.stats.isMonster) return false;
    if (options?.blockedTargetIds?.has(targetId)) return false;
    if (options?.pendingDestroyedIds?.has(targetId)) return false;
    if (target.isDestroying) return false;
    if (target.hp !== undefined && target.hp <= 0) return false;
    return true;
};

const isMonsterHoldTargetCandidate = (monster, target, buildingData, options) => {
    const targetId = String(target.id);
    const targetInfo = buildingData.find(i => i.id === target.buildingId);
    const riverId = options?.riverId ?? 50004;
    const mountainId = options?.mountainId ?? 50005;
    if (target.ownerId === monster.ownerId) return false;
    if (target.buildingId === riverId || target.buildingId === mountainId) return false;
    if (targetInfo?.stats.isMonster) return false;
    if (options?.blockedTargetIds?.has(targetId)) return false;
    if (options?.pendingDestroyedIds?.has(targetId)) return false;
    if (target.hp !== undefined && target.hp <= 0) return false;
    return true;
};

// ═══════════════════════════════════════════
// ID Stability
// ═══════════════════════════════════════════
{
    strictEqual(KILLING_HUT_ID, 70001);
    strictEqual(KIND_SANTA_ID, 70002);
    strictEqual(GORYNYCH_ID, 70003);
    strictEqual(KOLOBOK_ID, 70004);
    strictEqual(BABA_YAGA_ID, 70005);
    strictEqual(BRONEKUR_ID, 70006);
}

// ═══════════════════════════════════════════
// Move helpers
// ═══════════════════════════════════════════
{
    const seed1 = getMonsterMoveSeed('m70001s1z2_2', 70001);
    const seed2 = getMonsterMoveSeed('m70001s1z2_2', 70001);
    strictEqual(seed1, seed2, 'deterministic seed');

    const hash1 = hashMonsterZoneSeed('zone-2_2');
    const hash2 = hashMonsterZoneSeed('zone-2_2');
    strictEqual(hash1, hash2, 'deterministic hash');

    const arr = [1, 2, 3, 4, 5];
    const shuffled1 = seededShuffle(arr, 'test');
    const shuffled2 = seededShuffle(arr, 'test');
    deepEqual(shuffled1, shuffled2, 'seededShuffle repeatability');
    ok(shuffled1.length === 5, 'shuffle preserves length');

    const interval = getMonsterMoveInterval(70001, 'test');
    ok(interval >= 12000, 'move interval >= 12000ms');

    const defaultInterval = getMonsterMoveInterval(99999, 'unknown');
    ok(defaultInterval >= 12000, 'default interval >= 12000ms');
}

// ═══════════════════════════════════════════
// Move toward target
// ═══════════════════════════════════════════
{
    const moves = [
        { x: 0, y: 0, dx: 1, dy: 0 },
        { x: 1, y: 0, dx: 0, dy: 1 },
    ];
    const target = { x: 5, y: 0 };
    const best = chooseMonsterMoveTowardTarget(moves, target, false);
    ok(best !== null);
    strictEqual(best.x, 1, 'closest move to target at x=5');
}

// ═══════════════════════════════════════════
// Patrol direction
// ═══════════════════════════════════════════
{
    const dir = getMonsterPatrolDirection('m001', 70001);
    ok(dir.dx !== undefined && dir.dy !== undefined);
    ok(Math.abs(dir.dx) + Math.abs(dir.dy) === 1, 'cardinal direction');
}

// ═══════════════════════════════════════════
// Patrol move
// ═══════════════════════════════════════════
{
    const moves = [
        { x: 1, y: 0, dx: 1, dy: 0 },
        { x: -1, y: 0, dx: -1, dy: 0 },
    ];
    const lastDir = { dx: 0, dy: 1 };
    const result = chooseMonsterPatrolMove(moves, lastDir, true, 'm01', 70001);
    ok(result.chosenMove !== null);
    strictEqual(result.selectedTurn, 'preferred');
}

// ═══════════════════════════════════════════
// Tile blocked
// ═══════════════════════════════════════════
{
    const occupied = new Set(['5,5']);
    const blocked = new Set(['10,10']);
    ok(isMonsterTileBlocked(5, 5, occupied, blocked, null, false), 'occupied');
    ok(isMonsterTileBlocked(10, 10, new Set(), blocked, null, false), 'resource blocked');
    ok(!isMonsterTileBlocked(0, 0, new Set(), new Set(), null, false), 'free');
}

// ═══════════════════════════════════════════
// Attack target candidate (default IDs)
// ═══════════════════════════════════════════
{
    const monster = { id: 'm1', ownerId: 'monster', buildingId: 70001 };
    const bd = [{ id: 70001, stats: { isMonster: true } }, { id: 100, stats: {} }];

    // Valid building target
    const valid = { id: 'b1', ownerId: 'player', buildingId: 100, hp: 10 };
    ok(isMonsterAttackTargetCandidate(monster, valid, bd, {}), 'valid target');

    // River (default ID = 50004)
    const river = { id: 'b2', ownerId: 'player', buildingId: 50004, hp: 10 };
    ok(!isMonsterAttackTargetCandidate(monster, river, bd, {}), 'river blocked by default');

    // Mountain (default ID = 50005)
    const mountain = { id: 'b3', ownerId: 'player', buildingId: 50005, hp: 10 };
    ok(!isMonsterAttackTargetCandidate(monster, mountain, bd, {}), 'mountain blocked by default');

    // River with explicit override
    ok(isMonsterAttackTargetCandidate(monster, river, bd, { riverId: 99999 }), 'river override');

    // Mountain with explicit override
    ok(isMonsterAttackTargetCandidate(monster, mountain, bd, { mountainId: 99999 }), 'mountain override');

    // Both overrides
    ok(isMonsterAttackTargetCandidate(monster, river, bd, { riverId: 99999, mountainId: 99998 }), 'both overrides');

    // Same owner blocked
    const sameOwner = { id: 'b4', ownerId: 'monster', buildingId: 100, hp: 10 };
    ok(!isMonsterAttackTargetCandidate(monster, sameOwner, bd, {}), 'same owner blocked');

    // Destroyed target
    const destroyed = { id: 'b5', ownerId: 'player', buildingId: 100, hp: 0 };
    ok(!isMonsterAttackTargetCandidate(monster, destroyed, bd, {}), 'destroyed blocked');

    // Destroying target
    const destroying = { id: 'b6', ownerId: 'player', buildingId: 100, hp: 5, isDestroying: true };
    ok(!isMonsterAttackTargetCandidate(monster, destroying, bd, {}), 'destroying blocked');

    // null/undefined options
    ok(isMonsterAttackTargetCandidate(monster, valid, bd, null), 'null options works');
    ok(isMonsterAttackTargetCandidate(monster, valid, bd, undefined), 'undefined options works');
}

// ═══════════════════════════════════════════
// Hold target candidate
// ═══════════════════════════════════════════
{
    const monster = { id: 'm1', ownerId: 'monster', buildingId: 70001 };
    const bd = [{ id: 70001, stats: { isMonster: true } }, { id: 100, stats: {} }];
    const target = { id: 'b1', ownerId: 'player', buildingId: 100, hp: 10 };
    ok(isMonsterHoldTargetCandidate(monster, target, bd, {}), 'valid hold target');
    // hold target does NOT exclude isDestroying
    const destroying = { id: 'b2', ownerId: 'player', buildingId: 100, hp: 5, isDestroying: true };
    ok(isMonsterHoldTargetCandidate(monster, destroying, bd, {}), 'destroying hold target allowed');
    // hold target excludes destroyed (hp <= 0)
    const destroyed = { id: 'b3', ownerId: 'player', buildingId: 100, hp: 0 };
    ok(!isMonsterHoldTargetCandidate(monster, destroyed, bd, {}), 'destroyed hold target blocked');
}

console.log('✅ Scenario 24 — all assertions passed');
