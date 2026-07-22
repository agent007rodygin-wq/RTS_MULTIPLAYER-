/**
 * Characterization Scenario 25 — Monster Crowding Extraction
 */

import { ok, strictEqual, deepEqual } from 'node:assert/strict';

// Replicas from canonical modules
const ZONE_SIZE = 40;
const ZONES_X = 5;
const ZONES_Y = 5;
const wrapCoord = (v, max) => ((v % max) + max) % max;
const getZoneId = (x, y) => `${Math.floor(x / ZONE_SIZE)}_${Math.floor(y / ZONE_SIZE)}`;
const WILD_MONSTER_CROWDING_SOFT_CAP = 5;
const WILD_MONSTER_CROWDING_HARD_CAP = 6;

const getMonsterZoneId = (monster) => monster.zoneId || getZoneId(monster.x, monster.y);

const buildMonsterZoneCounts = (buildings, buildingData) => {
    const counts = new Map();
    buildings.forEach((building) => {
        const info = buildingData.find(i => i.id === building.buildingId);
        if (!info || !info.stats.isMonster) return;
        if (building.isConstructing || building.isDestroying) return;
        if (building.hp !== undefined && building.hp <= 0) return;
        const zoneId = getMonsterZoneId(building);
        counts.set(zoneId, (counts.get(zoneId) || 0) + 1);
    });
    return counts;
};

const getCrowdingEscapeMove = (monster, validMoves, zoneCounts, isWrappedWorld) => {
    if (validMoves.length === 0) return null;
    const currentZoneId = getMonsterZoneId(monster);
    const currentCount = zoneCounts.get(currentZoneId) || 0;
    if (currentCount < WILD_MONSTER_CROWDING_SOFT_CAP) return null;
    const zoneX = Math.floor(monster.x / ZONE_SIZE);
    const zoneY = Math.floor(monster.y / ZONE_SIZE);
    const localX = monster.x - (zoneX * ZONE_SIZE);
    const localY = monster.y - (zoneY * ZONE_SIZE);
    const neighborChecks = [
        { dx: -1, dy: 0, zoneX: zoneX - 1, zoneY, borderDist: localX },
        { dx: 1, dy: 0, zoneX: zoneX + 1, zoneY, borderDist: ZONE_SIZE - 1 - localX },
        { dx: 0, dy: -1, zoneX, zoneY: zoneY - 1, borderDist: localY },
        { dx: 0, dy: 1, zoneX, zoneY: zoneY + 1, borderDist: ZONE_SIZE - 1 - localY }
    ].filter(({ zoneX: nx, zoneY: ny }) =>
        isWrappedWorld || (nx >= 0 && nx < ZONES_X && ny >= 0 && ny < ZONES_Y)
    );
    let bestDirection = null, bestScore = -Infinity;
    const pressureMultiplier = currentCount >= WILD_MONSTER_CROWDING_HARD_CAP ? 2 : 1;
    neighborChecks.forEach(({ dx, dy, zoneX: nx, zoneY: ny, borderDist }) => {
        const wrappedX = isWrappedWorld ? wrapCoord(nx, ZONES_X) : nx;
        const wrappedY = isWrappedWorld ? wrapCoord(ny, ZONES_Y) : ny;
        const neighborZoneId = `${wrappedX}_${wrappedY}`;
        const neighborCount = zoneCounts.get(neighborZoneId) || 0;
        const scarcityScore = currentCount - neighborCount;
        const borderBonus = Math.max(0, ZONE_SIZE - borderDist);
        const score = scarcityScore * 100 * pressureMultiplier + borderBonus;
        if (score > bestScore) { bestScore = score; bestDirection = { dx, dy }; }
    });
    if (!bestDirection) return null;
    const preferredMove = validMoves.find(m => m.dx === bestDirection.dx && m.dy === bestDirection.dy);
    if (preferredMove) return preferredMove;
    let fallbackMove = null, fallbackScore = -Infinity;
    validMoves.forEach(move => {
        const moveZoneId = getZoneId(move.x, move.y);
        const moveZoneCount = zoneCounts.get(moveZoneId) || 0;
        const score = -moveZoneCount * 100 - (moveZoneId === currentZoneId ? 25 : 0);
        if (score > fallbackScore) { fallbackScore = score; fallbackMove = move; }
    });
    return fallbackMove;
};

// ═══════════════════════════════════════════
// getMonsterZoneId
// ═══════════════════════════════════════════
{
    strictEqual(getMonsterZoneId({ x: 0, y: 0, zoneId: '2_3' }), '2_3', 'cached zoneId returned');
    strictEqual(getMonsterZoneId({ x: 45, y: 85 }), '1_2', 'fallback from coordinates');
    strictEqual(getMonsterZoneId({ x: 45, y: 85, zoneId: '' }), '1_2', 'empty string falls back');
    strictEqual(getMonsterZoneId({ x: 0, y: 0 }), '0_0', 'origin coordinates');
}

// ═══════════════════════════════════════════
// buildMonsterZoneCounts
// ═══════════════════════════════════════════
{
    const bd = [{ id: 1, stats: { isMonster: true } }, { id: 2, stats: {} }];

    // Empty
    deepEqual(buildMonsterZoneCounts([], bd), new Map(), 'empty list');

    // One monster
    const m1 = buildMonsterZoneCounts([{ buildingId: 1, x: 0, y: 0 }], bd);
    strictEqual(m1.get('0_0'), 1, 'one monster');

    // Multiple in same zone from cached zoneId
    const m2 = buildMonsterZoneCounts([
        { buildingId: 1, zoneId: '2_2' },
        { buildingId: 1, zoneId: '2_2' },
        { buildingId: 1, zoneId: '2_2' },
    ], bd);
    strictEqual(m2.get('2_2'), 3, 'three same zone');

    // Non-monster filtered
    const m3 = buildMonsterZoneCounts([{ buildingId: 2, x: 0, y: 0 }], bd);
    strictEqual(m3.size, 0, 'non-monster filtered');

    // Constructing filtered
    const m4 = buildMonsterZoneCounts([{ buildingId: 1, x: 0, y: 0, isConstructing: true }], bd);
    strictEqual(m4.size, 0, 'constructing filtered');

    // Destroying filtered
    const m5 = buildMonsterZoneCounts([{ buildingId: 1, x: 0, y: 0, isDestroying: true }], bd);
    strictEqual(m5.size, 0, 'destroying filtered');

    // Dead filtered
    const m6 = buildMonsterZoneCounts([{ buildingId: 1, x: 0, y: 0, hp: 0 }], bd);
    strictEqual(m6.size, 0, 'dead filtered');

    // Multiple zones
    const m7 = buildMonsterZoneCounts([
        { buildingId: 1, x: 0, y: 0 },
        { buildingId: 1, x: 80, y: 0 },
        { buildingId: 1, x: 160, y: 0 },
    ], bd);
    strictEqual(m7.get('0_0'), 1);
    strictEqual(m7.get('2_0'), 1);
    strictEqual(m7.get('4_0'), 1);
    strictEqual(m7.size, 3, 'multiple zones');

    // Does not mutate inputs
    const buildings = [{ buildingId: 1, x: 0, y: 0, extra: true }];
    const copy = JSON.parse(JSON.stringify(buildings));
    buildMonsterZoneCounts(buildings, bd);
    deepEqual(buildings, copy, 'no input mutation');
}

// ═══════════════════════════════════════════
// getCrowdingEscapeMove
// ═══════════════════════════════════════════
{
    const monster = { x: 40, y: 40, zoneId: '1_1' };
    const moves = [
        { x: 41, y: 40, dx: 1, dy: 0 },
        { x: 39, y: 40, dx: -1, dy: 0 },
    ];

    // No crowding — below soft cap
    const result1 = getCrowdingEscapeMove(monster, moves, new Map([['1_1', 3]]), false);
    strictEqual(result1, null, 'below soft cap returns null');

    // Above soft cap — should escape
    const crowded = new Map([['1_1', 8], ['0_1', 1], ['2_1', 1]]);
    const result2 = getCrowdingEscapeMove(monster, moves, crowded, false);
    ok(result2 !== null, 'above soft cap returns move');
    strictEqual(result2.dx, -1, 'escapes toward less crowded zone (left)');

    // All candidates blocked
    strictEqual(getCrowdingEscapeMove(monster, [], new Map([['1_1', 8]]), false), null, 'no valid moves');

    // Equal counts — deterministic choice
    const equal = new Map([['1_1', 8], ['0_1', 8], ['2_1', 8]]);
    const r1 = getCrowdingEscapeMove(monster, moves, equal, false);
    const r2 = getCrowdingEscapeMove(monster, moves, equal, false);
    strictEqual(r1.dx, r2.dx, 'deterministic output');

    // No mutation of inputs
    const countCopy = new Map(crowded);
    getCrowdingEscapeMove(monster, moves, crowded, false);
    strictEqual(crowded.get('1_1'), countCopy.get('1_1'), 'zoneCounts not mutated');
}

console.log('✅ Scenario 25 — all assertions passed');
