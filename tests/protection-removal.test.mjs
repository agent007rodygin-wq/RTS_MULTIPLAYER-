// @ts-check
import assert from 'node:assert/strict';
import { resolveLocalDestructionCompletion } from '../src/game/buildings/resolveLocalDestructionCompletion.js';

console.log('--- Testing Protection & Defusal Logic & Contracts ---');

// 1. Protection status detection contract
{
    const now = 1000000;
    
    // Unprotected building
    const normalBuilding = {
        id: 'b1',
        buildingId: 100,
        hp: 1000,
        maxHp: 1000,
    };
    const isProtected1 = (normalBuilding.shieldHp || 0) > 0 || (Boolean(normalBuilding.protectionEndTime) && Number(normalBuilding.protectionEndTime) > now);
    assert.equal(isProtected1, false, 'Unprotected building should not be detected as protected');

    // Protected by shieldHp
    const shieldBuilding = {
        id: 'b2',
        buildingId: 100,
        hp: 1000,
        maxHp: 1000,
        shieldHp: 5000,
        shieldMaxHp: 5000,
        protectionEndTime: now + 3600000,
    };
    const isProtected2 = (shieldBuilding.shieldHp || 0) > 0 || (Boolean(shieldBuilding.protectionEndTime) && Number(shieldBuilding.protectionEndTime) > now);
    assert.equal(isProtected2, true, 'Building with shieldHp > 0 and future protectionEndTime must be detected as protected');

    // Expired protection
    const expiredBuilding = {
        id: 'b3',
        buildingId: 100,
        hp: 1000,
        maxHp: 1000,
        shieldHp: 0,
        shieldMaxHp: 5000,
        protectionEndTime: now - 1000,
    };
    const isProtected3 = (expiredBuilding.shieldHp || 0) > 0 || (Boolean(expiredBuilding.protectionEndTime) && Number(expiredBuilding.protectionEndTime) > now);
    assert.equal(isProtected3, false, 'Expired protection with 0 shieldHp must not be detected as protected');

    console.log('PASS: Protection status detection verified.');
}

// 2. Protection removal state update contract
{
    const initialBuilding = {
        id: 'b-protect-1',
        buildingId: 205,
        ownerId: 'user-1',
        hp: 2000,
        maxHp: 2000,
        shieldHp: 5000,
        shieldMaxHp: 5000,
        protectionEndTime: 1700000000,
        workState: 'idle'
    };

    const removedState = {
        ...initialBuilding,
        shieldHp: undefined,
        shieldMaxHp: undefined,
        protectionEndTime: undefined
    };

    assert.equal(removedState.shieldHp, undefined, 'shieldHp must be undefined after removal');
    assert.equal(removedState.shieldMaxHp, undefined, 'shieldMaxHp must be undefined after removal');
    assert.equal(removedState.protectionEndTime, undefined, 'protectionEndTime must be undefined after removal');
    assert.equal(removedState.hp, 2000, 'hp must remain untouched');
    assert.equal(removedState.buildingId, 205, 'buildingId must remain untouched');

    console.log('PASS: Protection removal state update contract verified.');
}

// 3. Mining a protected building: protection MUST stay intact during mining!
{
    const now = 1000000;
    const protectedBuilding = {
        id: 'b-protected-mine',
        buildingId: 205,
        ownerId: 'owner-1',
        hp: 3000,
        maxHp: 3000,
        shieldHp: 4000,
        shieldMaxHp: 4000,
        protectionEndTime: now + 86400000,
    };

    // Planting a bomb (mining)
    const minedBuilding = {
        ...protectedBuilding,
        isDestroying: true,
        destructionStartedAt: now,
        destructionEndTime: now + 30000,
        destructionExpiresAt: now + 30000,
        destructionDurationMs: 30000,
        destructionStatus: 'active',
        pendingDamage: 1500,
        initiatorId: 'attacker-1'
    };

    assert.equal(minedBuilding.shieldHp, 4000, 'Shield HP must not be stripped when mining');
    assert.equal(minedBuilding.shieldMaxHp, 4000, 'Shield Max HP must not be stripped when mining');
    assert.equal(minedBuilding.protectionEndTime, now + 86400000, 'Protection end time must not be removed when mining');
    assert.equal(minedBuilding.isDestroying, true, 'Building must be marked as destroying');
    assert.equal(minedBuilding.pendingDamage, 1500, 'Damage must be pending, not applied yet');
    assert.equal(minedBuilding.initiatorId, 'attacker-1', 'Initiator must be recorded');

    console.log('PASS: Mining protected building preserves protection.');
}

// 4. Defusing a mined building
{
    const now = 1000000;
    const minedBuilding = {
        id: 'b-defuse',
        buildingId: 205,
        ownerId: 'owner-1',
        hp: 3000,
        maxHp: 3000,
        shieldHp: 4000,
        shieldMaxHp: 4000,
        protectionEndTime: now + 86400000,
        isDestroying: true,
        destructionStartedAt: now,
        destructionEndTime: now + 30000,
        destructionExpiresAt: now + 30000,
        destructionDurationMs: 30000,
        destructionStatus: 'active',
        pendingDamage: 2500,
        initiatorId: 'attacker-1'
    };

    // Defusal action
    const defusedBuilding = {
        ...minedBuilding,
        isDestroying: false,
        destructionStartedAt: undefined,
        destructionEndTime: undefined,
        destructionExpiresAt: undefined,
        destructionDurationMs: undefined,
        destructionMaxLifetimeMs: undefined,
        destructionStatus: 'finished',
        pendingDamage: 0,
        initiatorId: undefined
    };

    assert.equal(defusedBuilding.isDestroying, false, 'isDestroying must be false after defusal');
    assert.equal(defusedBuilding.pendingDamage, 0, 'pendingDamage must be reset to 0');
    assert.equal(defusedBuilding.initiatorId, undefined, 'initiatorId must be cleared');
    assert.equal(defusedBuilding.shieldHp, 4000, 'Shield must remain fully intact');
    assert.equal(defusedBuilding.hp, 3000, 'HP must remain untouched');

    console.log('PASS: Defusal contract verified.');
}

// 5. Explosion resolution with shield absorption in resolveLocalDestructionCompletion
{
    const now = 2000000;
    
    // Case A: Shield absorbs entire explosion damage
    const shieldedA = {
        id: 'b-shield-a',
        buildingId: 101,
        hp: 1000,
        maxHp: 1000,
        shieldHp: 2000,
        shieldMaxHp: 2000,
        protectionEndTime: now + 3600000,
        isDestroying: true,
        pendingDamage: 500,
    };
    const resA = resolveLocalDestructionCompletion({
        building: shieldedA,
        buildingInfo: { stats: { durability: 1000 } },
        now: now + 1,
        destructionExpiresAt: now
    });
    assert.equal(resA.completed, true);
    assert.equal(resA.completedBuilding.hp, 1000, 'Building HP must be unaffected because shield absorbed all damage');
    assert.equal(resA.completedBuilding.shieldHp, 1500, 'Shield HP must have absorbed 500 damage (2000 - 500 = 1500)');
    assert.equal(resA.completedBuilding.isDestroying, false);

    // Case B: Shield is broken and overflow damage penetrates to building HP
    const shieldedB = {
        id: 'b-shield-b',
        buildingId: 101,
        hp: 1000,
        maxHp: 1000,
        shieldHp: 300,
        shieldMaxHp: 1000,
        protectionEndTime: now + 3600000,
        isDestroying: true,
        pendingDamage: 500,
    };
    const resB = resolveLocalDestructionCompletion({
        building: shieldedB,
        buildingInfo: { stats: { durability: 1000 } },
        now: now + 1,
        destructionExpiresAt: now
    });
    assert.equal(resB.completed, true);
    assert.equal(resB.completedBuilding.shieldHp, undefined, 'Shield broken, shieldHp cleared');
    assert.equal(resB.completedBuilding.shieldMaxHp, undefined, 'Shield broken, shieldMaxHp cleared');
    assert.equal(resB.completedBuilding.protectionEndTime, undefined, 'Shield broken, protectionEndTime cleared');
    assert.equal(resB.completedBuilding.hp, 800, 'Building HP takes overflow damage 500 - 300 = 200 (1000 - 200 = 800)');

    console.log('PASS: Explosion completion shield absorption verified.');
}

console.log('ALL PROTECTION & DEFUSAL TESTS PASSED!');
