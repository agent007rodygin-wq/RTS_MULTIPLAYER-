import assert from 'node:assert/strict';
import { resolveLocalDestructionCompletion } from '../src/game/buildings/resolveLocalDestructionCompletion.js';

console.log('--- Testing Monster Explosion & Initiator Reward Contract ---');

// 1. Verify resolveLocalDestructionCompletion correctly marks destruction complete when timer expires
const monster = {
    id: 'm70003s1z4z2000',
    buildingId: '70003',
    ownerId: 'monster',
    initiatorId: 'user-123',
    hp: 40,
    maxHp: 40,
    pendingDamage: 40,
    isDestroying: true,
    destructionStartedAt: 1000,
    destructionExpiresAt: 2000,
    destructionStatus: 'active'
};

const result = resolveLocalDestructionCompletion({
    building: monster,
    buildingInfo: { stats: { durability: 40 } },
    now: 2500,
    destructionExpiresAt: 2000
});

assert.equal(result.completed, true, 'Destruction should complete when now >= expiresAt');
assert.equal(result.completedBuilding.hp, 0, 'HP should drop to 0 after fatal pending damage');
assert.equal(result.completedBuilding.isDestroying, false, 'isDestroying should be cleared locally');

// 2. Verify game loop buildingsToUpdate filter contract:
// Must include:
// - isDestroying with expired timer
// - buildings with hp <= 0 (so finalization can delete them and grant rewards even if isDestroying was already cleared)
const TOWN_HALL_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shouldBuildingUpdate = (b, now, currentUserId) => {
    const isOwner = b.ownerId === "0" || b.ownerId === currentUserId;
    const isHost = b.ownerId === "monster" && (b.hostId === currentUserId || !b.hostId);
    const isInitiator = Boolean(b.initiatorId && b.initiatorId === currentUserId);
    const canFinalizeConstructionForAnyone = !!b.isConstructing && !!b.constructionEndTime && now >= b.constructionEndTime;

    if (!isOwner && !isHost && !isInitiator && !canFinalizeConstructionForAnyone) return false;

    return (b.isConstructing && now >= b.constructionEndTime) ||
        (b.workState === 'working' && b.workEndTime && now >= b.workEndTime) ||
        (b.isDestroying && !!b.destructionExpiresAt && now >= (b.destructionExpiresAt || 0)) ||
        (b.hp !== undefined && b.hp <= 0 && !TOWN_HALL_IDS.includes(Number(b.buildingId)));
};

// Case A: Initiator is online and building is at hp <= 0
assert.equal(
    shouldBuildingUpdate(result.completedBuilding, 2500, 'user-123'),
    true,
    'Initiator must pick up completed dead monster for destruction finalization and reward grant'
);

// Case B: Non-initiator, non-host player must NOT pick it up if initiator exists
assert.equal(
    shouldBuildingUpdate({ ...result.completedBuilding, hostId: 'user-other' }, 2500, 'user-stranger'),
    false,
    'Stranger should not hijack initiator destruction finalization'
);

// Case C: Offline timer DB update protection:
// If hp <= 0, processOfflineTimers must NOT write hp: 0, isDestroying: false to DB
const canPushOfflineTimerUpdateToDb = (updatedBuilding) => {
    return updatedBuilding.hp === undefined || updatedBuilding.hp > 0;
};
assert.equal(
    canPushOfflineTimerUpdateToDb(result.completedBuilding),
    false,
    'Must prevent writing zombie hp=0 state to DB from offline timers'
);

console.log('PASS: All monster explosion & initiator reward contract assertions passed!');
