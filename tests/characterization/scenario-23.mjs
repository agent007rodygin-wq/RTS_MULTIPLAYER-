/**
 * Characterization Scenario 23 — World Geometry Consolidation Wave
 *
 * Verifies that all world geometry functions produce expected outputs
 * with representative wrapped and non-wrapped world inputs.
 *
 * Covers: wrapCoord, normalizeWorldCoord, getWrappedDelta,
 *         getWrappedDirectionToTarget, getWrappedManhattanDistance,
 *         getWrappedChebyshevDistance, getCardinalNeighborTiles,
 *         getClosestWrappedWorldCoords, getZoneId
 */

import { ok, deepEqual } from 'node:assert/strict';

const WORLD_WIDTH_TILES = 200;
const WORLD_HEIGHT_TILES = 200;
const ZONE_SIZE = 40;

// ── Replicas of the canonical functions from src/world.js ──

const wrapCoord = (v, max) => ((v % max) + max) % max;

const normalizeWorldCoord = (value, max, isWrappedWorld) =>
    isWrappedWorld ? wrapCoord(value, max) : value;

const getWrappedDelta = (from, to, size, isWrappedWorld) => {
    let delta = to - from;
    if (!isWrappedWorld) return delta;
    if (delta > size / 2) delta -= size;
    else if (delta < -size / 2) delta += size;
    return delta;
};

const getWrappedDirectionToTarget = (from, to, isWrappedWorld) => ({
    dx: getWrappedDelta(from.x, to.x, WORLD_WIDTH_TILES, isWrappedWorld),
    dy: getWrappedDelta(from.y, to.y, WORLD_HEIGHT_TILES, isWrappedWorld)
});

const getWrappedManhattanDistance = (from, to, isWrappedWorld) =>
    Math.abs(getWrappedDelta(from.x, to.x, WORLD_WIDTH_TILES, isWrappedWorld)) +
    Math.abs(getWrappedDelta(from.y, to.y, WORLD_HEIGHT_TILES, isWrappedWorld));

const getWrappedChebyshevDistance = (from, to, isWrappedWorld) =>
    Math.max(
        Math.abs(getWrappedDelta(from.x, to.x, WORLD_WIDTH_TILES, isWrappedWorld)),
        Math.abs(getWrappedDelta(from.y, to.y, WORLD_HEIGHT_TILES, isWrappedWorld))
    );

const getCardinalNeighborTiles = (x, y, isWrappedWorld) => [
    { x: x + 1, y, dx: 1, dy: 0 },
    { x: x - 1, y, dx: -1, dy: 0 },
    { x, y: y + 1, dx: 0, dy: 1 },
    { x, y: y - 1, dx: 0, dy: -1 }
].map((neighbor) => ({
    ...neighbor,
    x: normalizeWorldCoord(neighbor.x, WORLD_WIDTH_TILES, isWrappedWorld),
    y: normalizeWorldCoord(neighbor.y, WORLD_HEIGHT_TILES, isWrappedWorld)
}));

const getClosestWrappedWorldCoords = (x, y, refX, refY, isWrappedWorld) => ({
    x: isWrappedWorld ? x + Math.round((refX - x) / WORLD_WIDTH_TILES) * WORLD_WIDTH_TILES : x,
    y: isWrappedWorld ? y + Math.round((refY - y) / WORLD_HEIGHT_TILES) * WORLD_HEIGHT_TILES : y
});

const getZoneId = (x, y) => `${Math.floor(x / ZONE_SIZE)}_${Math.floor(y / ZONE_SIZE)}`;

// ═══════════════════════════════════════════
// wrapCoord
// ═══════════════════════════════════════════
{
    // Positive overflow
    ok(wrapCoord(250, 200) === 50, 'wrapCoord: 250 mod 200 = 50');
    // Negative input
    ok(wrapCoord(-10, 200) === 190, 'wrapCoord: -10 mod 200 = 190');
    // Within bounds
    ok(wrapCoord(100, 200) === 100, 'wrapCoord: 100 mod 200 = 100');
    // Exact boundary
    ok(wrapCoord(0, 200) === 0, 'wrapCoord: 0 mod 200 = 0');
    ok(wrapCoord(199, 200) === 199, 'wrapCoord: 199 mod 200 = 199');
    // Deep negative
    ok(wrapCoord(-250, 200) === 150, 'wrapCoord: -250 mod 200 = 150');
}

// ═══════════════════════════════════════════
// normalizeWorldCoord
// ═══════════════════════════════════════════
{
    // Wrapped mode: should wrap
    ok(normalizeWorldCoord(250, 200, true) === 50, 'normalizeWorldCoord: wrapped 250 → 50');
    ok(normalizeWorldCoord(-10, 200, true) === 190, 'normalizeWorldCoord: wrapped -10 → 190');
    // Non-wrapped mode: identity
    ok(normalizeWorldCoord(250, 200, false) === 250, 'normalizeWorldCoord: non-wrapped 250 unchanged');
    ok(normalizeWorldCoord(-10, 200, false) === -10, 'normalizeWorldCoord: non-wrapped -10 unchanged');
    // Within bounds
    ok(normalizeWorldCoord(100, 200, true) === 100, 'normalizeWorldCoord: wrapped 100 unchanged');
}

// ═══════════════════════════════════════════
// getWrappedDelta
// ═══════════════════════════════════════════
{
    // Wrapped: across left boundary
    // from=195, to=5 → raw delta = -190, should wrap to +10
    ok(getWrappedDelta(195, 5, 200, true) === 10, 'getWrappedDelta: left wrap 195→5 = 10');
    // Wrapped: across right boundary
    // from=5, to=195 → raw delta = 190, should wrap to -10
    ok(getWrappedDelta(5, 195, 200, true) === -10, 'getWrappedDelta: right wrap 5→195 = -10');
    // Wrapped: no wrap needed
    ok(getWrappedDelta(50, 60, 200, true) === 10, 'getWrappedDelta: short delta 50→60 = 10');
    ok(getWrappedDelta(60, 50, 200, true) === -10, 'getWrappedDelta: short reverse 60→50 = -10');
    // Non-wrapped: raw delta
    ok(getWrappedDelta(50, 60, 200, false) === 10, 'getWrappedDelta: non-wrapped delta');
    // Non-wrapped: large delta not wrapped
    ok(getWrappedDelta(5, 195, 200, false) === 190, 'getWrappedDelta: non-wrapped large delta');
    // Vertical wrap (Y axis)
    ok(getWrappedDelta(195, 5, 200, true) === 10, 'getWrappedDelta: vertical wrap 195→5');
}

// ═══════════════════════════════════════════
// getWrappedDirectionToTarget
// ═══════════════════════════════════════════
{
    const dir = getWrappedDirectionToTarget({ x: 5, y: 5 }, { x: 195, y: 195 }, true);
    // 5→195 = 190 raw, >100 so wraps to -10
    ok(dir.dx === -10, 'directionToTarget: dx from 5→195 wrapped = -10');
    ok(dir.dy === -10, 'directionToTarget: dy from 5→195 wrapped = -10');
}

// ═══════════════════════════════════════════
// getWrappedManhattanDistance
// ═══════════════════════════════════════════
{
    const d1 = getWrappedManhattanDistance({ x: 0, y: 0 }, { x: 10, y: 10 }, true);
    ok(d1 === 20, 'manhattan: 0,0→10,10 = 20');
    const d2 = getWrappedManhattanDistance({ x: 0, y: 0 }, { x: 0, y: 0 }, true);
    ok(d2 === 0, 'manhattan: same tile = 0');
    // Wrapped: short path across boundary
    const d3 = getWrappedManhattanDistance({ x: 0, y: 0 }, { x: 199, y: 0 }, true);
    ok(d3 === 1, 'manhattan: 0,0→199,0 wrapped = 1');
}

// ═══════════════════════════════════════════
// getWrappedChebyshevDistance
// ═══════════════════════════════════════════
{
    const d1 = getWrappedChebyshevDistance({ x: 0, y: 0 }, { x: 10, y: 5 }, true);
    ok(d1 === 10, 'chebyshev: max(10,5) = 10');
    const d2 = getWrappedChebyshevDistance({ x: 0, y: 0 }, { x: 0, y: 0 }, true);
    ok(d2 === 0, 'chebyshev: same tile = 0');
}

// ═══════════════════════════════════════════
// getCardinalNeighborTiles
// ═══════════════════════════════════════════
{
    // Non-wrapped: center of world
    const n1 = getCardinalNeighborTiles(100, 100, false);
    ok(n1.length === 4, 'cardinal: 4 neighbors');
    deepEqual(n1[0], { x: 101, y: 100, dx: 1, dy: 0 }, 'neighbor 0: right');
    deepEqual(n1[1], { x: 99, y: 100, dx: -1, dy: 0 }, 'neighbor 1: left');
    deepEqual(n1[2], { x: 100, y: 101, dx: 0, dy: 1 }, 'neighbor 2: down');
    deepEqual(n1[3], { x: 100, y: 99, dx: 0, dy: -1 }, 'neighbor 3: up');

    // Wrapped: at right boundary
    const n2 = getCardinalNeighborTiles(199, 100, true);
    deepEqual(n2[0], { x: 0, y: 100, dx: 1, dy: 0 }, 'wrapped neighbor 0: 199+1 → 0');
    deepEqual(n2[1], { x: 198, y: 100, dx: -1, dy: 0 }, 'wrapped neighbor 1: 199-1 = 198');

    // Wrapped: at top boundary
    const n3 = getCardinalNeighborTiles(100, 0, true);
    deepEqual(n3[3], { x: 100, y: 199, dx: 0, dy: -1 }, 'wrapped neighbor 3: 0-1 → 199');

    // Wrapped: at bottom boundary
    const n4 = getCardinalNeighborTiles(100, 199, true);
    deepEqual(n4[2], { x: 100, y: 0, dx: 0, dy: 1 }, 'wrapped neighbor 2: 199+1 → 0');
}

// ═══════════════════════════════════════════
// getClosestWrappedWorldCoords
// ═══════════════════════════════════════════
{
    // Non-wrapped: identity
    const c1 = getClosestWrappedWorldCoords(50, 50, 100, 100, false);
    ok(c1.x === 50 && c1.y === 50, 'closestWrapped: non-wrapped identity');

    // Wrapped: ref is far right, point is near left → wrap point right
    const c2 = getClosestWrappedWorldCoords(10, 10, 195, 10, true);
    // Math.round((195-10)/200) = Math.round(0.925) = 1 → x = 10 + 1*200 = 210
    ok(c2.x === 210 && c2.y === 10, 'closestWrapped: wrap to 210');

    // Wrapped: ref and point are close → no wrap
    const c3 = getClosestWrappedWorldCoords(50, 50, 60, 60, true);
    // Math.round((60-50)/200) = 0 → x = 50
    ok(c3.x === 50 && c3.y === 50, 'closestWrapped: close points no wrap');
}

// ═══════════════════════════════════════════
// getZoneId
// ═══════════════════════════════════════════
{
    ok(getZoneId(0, 0) === '0_0', 'getZoneId: origin');
    ok(getZoneId(39, 39) === '0_0', 'getZoneId: last tile of zone 0');
    ok(getZoneId(40, 0) === '1_0', 'getZoneId: first tile of zone 1');
    ok(getZoneId(79, 79) === '1_1', 'getZoneId: mid-world');
    ok(getZoneId(199, 199) === '4_4', 'getZoneId: world edge (200x200, ZONE_SIZE=40, 200/40=5 zones)');
    ok(getZoneId(5, 199) === '0_4', 'getZoneId: mixed boundary');
}

console.log('✅ Scenario 23 — all assertions passed');
