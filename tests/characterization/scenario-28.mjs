/**
 * Characterization Scenario 28 — Monster Runtime Snapshot Builder Extraction
 */

import { ok, strictEqual } from 'node:assert/strict';

// Replicas from canonical modules
const getMonsterMoveSeed = (mid, bid) => { const s = `${mid}:${bid}`; let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };
const MONSTER_MOVE_INTERVALS = { 70001: 26000, 70002: 23000, 70003: 30000, 70004: 28000, 70005: 29000, 70006: 18000 };
const DEFAULT_MONSTER_MOVE_INTERVAL = 32000;
const MONSTER_MOVE_JITTER_RATIO = 0.18;
const getMonsterMoveInterval = (bid, mid) => { const base = MONSTER_MOVE_INTERVALS[bid] || DEFAULT_MONSTER_MOVE_INTERVAL; const seed = getMonsterMoveSeed(mid, bid) % 1000; const jitter = ((seed / 999) * 2 - 1) * MONSTER_MOVE_JITTER_RATIO; return Math.max(12000, Math.round(base * (1 + jitter))); };
const getZoneId = (x, y) => `${Math.floor(x / 40)}_${Math.floor(y / 40)}`;
const getMonsterZoneId = (m) => m.zoneId || getZoneId(m.x, m.y);
const buildMonsterZoneCounts = (buildings, buildingData) => { const counts = new Map(); buildings.forEach((b) => { const info = buildingData.find(i => i.id === b.buildingId); if (!info || !info.stats.isMonster) return; if (b.isConstructing || b.isDestroying) return; if (b.hp !== undefined && b.hp <= 0) return; const zid = getMonsterZoneId(b); counts.set(zid, (counts.get(zid) || 0) + 1); }); return counts; };
const wrapCoord = (v, max) => ((v % max) + max) % max;
const normalizeWorldCoord = (v, max, w) => w ? wrapCoord(v, max) : v;
const WORLD_WIDTH_TILES = 200; const WORLD_HEIGHT_TILES = 200;
const getCardinalNeighborTiles = (x, y, isWrappedWorld) => [{ x: x + 1, y, dx: 1, dy: 0 }, { x: x - 1, y, dx: -1, dy: 0 }, { x, y: y + 1, dx: 0, dy: 1 }, { x, y: y - 1, dx: 0, dy: -1 }].map(n => ({ ...n, x: normalizeWorldCoord(n.x, WORLD_WIDTH_TILES, isWrappedWorld), y: normalizeWorldCoord(n.y, WORLD_HEIGHT_TILES, isWrappedWorld) }));
const isMonsterAttackTargetCandidate = (monster, target, buildingData, options) => { const tid = String(target.id); const ti = buildingData.find(i => i.id === target.buildingId); if (target.ownerId === monster.ownerId) return false; if (target.buildingId === (options?.riverId ?? 50004) || target.buildingId === (options?.mountainId ?? 50005)) return false; if (ti?.stats.isMonster) return false; if (options?.blockedTargetIds?.has(tid)) return false; if (options?.pendingDestroyedIds?.has(tid)) return false; if (target.isDestroying) return false; if (target.hp !== undefined && target.hp <= 0) return false; return true; };
const getMonsterAdjacentAttackTarget = (monster, buildings, buildingData, options) => { const mi = buildingData.find(i => i.id === monster.buildingId); const neighbors = getCardinalNeighborTiles(monster.x, monster.y, !!options?.isWrappedWorld); const candidates = buildings.filter(t => neighbors.some(n => n.x === t.x && n.y === t.y) && isMonsterAttackTargetCandidate(monster, t, buildingData, options)); if (candidates.length === 0) return null; const preferredTargetId = options?.preferredTargetId ? String(options.preferredTargetId) : null; if (preferredTargetId) { const pt = candidates.find(t => String(t.id) === preferredTargetId); if (pt) return pt; } const hates = mi?.stats.hates; const hated = candidates.find(t => { const i = buildingData.find(b => b.id === t.buildingId); return hates && i?.category === hates; }); return hated || candidates[0]; };

// Stub host checker — always true for test isolation
const alwaysHost = () => true;

function buildMonsterRuntimeSnapshot({ now, buildings, buildingData, monsterLastAction, monsterAttackTime, isMonsterHost, isWorldWrapped, pendingDestroyedIds, maxMovesPerBatch }) {
    const monstersMoving = buildings.filter(b => {
        if (b.isConstructing || b.isDestroying) return false;
        if (b.hp !== undefined && b.hp <= 0) return false;
        const info = buildingData.find(i => i.id === b.buildingId);
        if (!info || !info.stats.isMonster) return false;
        if (!isMonsterHost(b)) return false;
        const monsterId = String(b.id || '');
        const lastTime = Math.max(b.lastMoveTime || 0, monsterLastAction.get(monsterId) || 0);
        const moveInterval = getMonsterMoveInterval(b.buildingId, monsterId);
        return (now - lastTime >= moveInterval);
    });
    const monstersReadyToAttack = buildings.filter(monster => {
        if (monster.isConstructing || monster.isDestroying) return false;
        if (monster.hp !== undefined && monster.hp <= 0) return false;
        const info = buildingData.find(i => i.id === monster.buildingId);
        if (!info || !info.stats.isMonster) return false;
        if (!isMonsterHost(monster)) return false;
        const monsterId = String(monster.id || '');
        const lastAttackTime = Math.max(monster.lastAttackTime || 0, monsterAttackTime.get(monsterId) || 0);
        if (lastAttackTime > now) return false;
        if ((now - lastAttackTime) < 40000) return false;
        return !!getMonsterAdjacentAttackTarget(monster, buildings, buildingData, { isWrappedWorld: isWorldWrapped, pendingDestroyedIds });
    });
    const monsterZoneCounts = buildMonsterZoneCounts(buildings, buildingData);
    const sorted = [...monstersMoving].sort((a, b) => {
        const aId = String(a.id || ''); const bId = String(b.id || '');
        const aLastTime = Math.max(a.lastMoveTime || 0, monsterLastAction.get(aId) || 0);
        const bLastTime = Math.max(b.lastMoveTime || 0, monsterLastAction.get(bId) || 0);
        const aOverdue = now - aLastTime - getMonsterMoveInterval(a.buildingId, aId);
        const bOverdue = now - bLastTime - getMonsterMoveInterval(b.buildingId, bId);
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        return getMonsterMoveSeed(aId, a.buildingId) - getMonsterMoveSeed(bId, b.buildingId);
    });
    const actingMonsters = sorted.slice(0, maxMovesPerBatch);
    return { actingMonsters, monstersReadyToAttack, monsterZoneCounts };
}

const bd = [{ id: 70001, stats: { isMonster: true } }, { id: 70003, stats: { isMonster: true } }];
const now = Date.now();

// No monsters
{
    const r = buildMonsterRuntimeSnapshot({ now, buildings: [], buildingData: bd, monsterLastAction: new Map(), monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    strictEqual(r.actingMonsters.length, 0, 'empty input');
    strictEqual(r.monstersReadyToAttack.length, 0, 'empty attack');
    strictEqual(r.monsterZoneCounts.size, 0, 'empty zone counts');
}

// One eligible movement monster
{
    const m = { id: 'm1', buildingId: 70001, x: 0, y: 0, hp: 100 };
    const r = buildMonsterRuntimeSnapshot({ now, buildings: [m], buildingData: bd, monsterLastAction: new Map([['m1', now - 30000]]), monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    strictEqual(r.actingMonsters.length, 1, 'one eligible');
}

// Cooldown not elapsed
{
    const m = { id: 'm1', buildingId: 70001, x: 0, y: 0, hp: 100 };
    const r = buildMonsterRuntimeSnapshot({ now, buildings: [m], buildingData: bd, monsterLastAction: new Map([['m1', now - 1000]]), monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    strictEqual(r.actingMonsters.length, 0, 'cooldown not elapsed');
}

// Constructing filtered
{
    const m = { id: 'm1', buildingId: 70001, x: 0, y: 0, hp: 100, isConstructing: true };
    const r = buildMonsterRuntimeSnapshot({ now, buildings: [m], buildingData: bd, monsterLastAction: new Map(), monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    strictEqual(r.actingMonsters.length, 0, 'constructing filtered');
}

// Dead filtered
{
    const m = { id: 'm1', buildingId: 70001, x: 0, y: 0, hp: 0 };
    const r = buildMonsterRuntimeSnapshot({ now, buildings: [m], buildingData: bd, monsterLastAction: new Map(), monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    strictEqual(r.actingMonsters.length, 0, 'dead filtered');
}

// Sort order preserved (deterministic)
{
    const m1 = { id: 'a', buildingId: 70001, x: 0, y: 0, hp: 100 };
    const m2 = { id: 'b', buildingId: 70001, x: 1, y: 1, hp: 100 };
    const la = new Map([['a', now - 30000], ['b', now - 30000]]);
    const r1 = buildMonsterRuntimeSnapshot({ now, buildings: [m1, m2], buildingData: bd, monsterLastAction: la, monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    const r2 = buildMonsterRuntimeSnapshot({ now, buildings: [m1, m2], buildingData: bd, monsterLastAction: la, monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    strictEqual(r1.actingMonsters.length, r2.actingMonsters.length, 'deterministic length');
    strictEqual(r1.actingMonsters[0].id, r2.actingMonsters[0].id, 'deterministic order');
}

// Batch limit
{
    const monsters = Array.from({ length: 10 }, (_, i) => ({ id: `m${i}`, buildingId: 70001, x: i, y: i, hp: 100 }));
    const la = new Map(monsters.map(m => [String(m.id), now - 30000]));
    const r = buildMonsterRuntimeSnapshot({ now, buildings: monsters, buildingData: bd, monsterLastAction: la, monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 4 });
    strictEqual(r.actingMonsters.length, 4, 'batch limit respected');
}

// Zone counts
{
    const m = { id: 'm1', buildingId: 70001, x: 0, y: 0, hp: 100 };
    const r = buildMonsterRuntimeSnapshot({ now, buildings: [m], buildingData: bd, monsterLastAction: new Map(), monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    strictEqual(r.monsterZoneCounts.get('0_0'), 1, 'zone count correct');
}

// No mutation of inputs
{
    const m = { id: 'm1', buildingId: 70001, x: 0, y: 0, hp: 100 };
    const buildings = [m];
    const la = new Map([['m1', now - 30000]]);
    const copy = JSON.parse(JSON.stringify(buildings));
    buildMonsterRuntimeSnapshot({ now, buildings, buildingData: bd, monsterLastAction: la, monsterAttackTime: new Map(), isMonsterHost: alwaysHost, isWorldWrapped: false, pendingDestroyedIds: new Set(), maxMovesPerBatch: 6 });
    strictEqual(la.get('m1'), now - 30000, 'lastAction not mutated');
    ok(JSON.stringify(buildings) === JSON.stringify(copy), 'buildings not mutated');
}

console.log('✅ Scenario 28 — all assertions passed');
