import test from 'node:test';
import assert from 'node:assert/strict';

import {
    checkHasEgyptianObelisk,
    getFinancialCollectCooldownStatus,
    isBuildingReadyForCollection,
    isBuildingProductionIdle,
    calculateNextCropBuildingId,
    calculateBuildingBaseGoldYield,
    calculateBuildingReward,
    FINANCIAL_COLLECT_COOLDOWN_MS,
    EGYPTIAN_OBELISK_IDS,
    FINANCIAL_INTELLIGENCE_IDS,
} from '../src/game/economy/productionCollectLogic.ts';
import { resolveLocalRewardEligibility } from '../src/game/buildings/resolveLocalRewardEligibility.js';
import { resolvePlacedBuildingSnapshotMerge } from '../src/game/buildings/resolveBuildingSnapshotMerge.js';

test('Production Collect - Egyptian Obelisk IDs & Detection', () => {
    assert.equal(EGYPTIAN_OBELISK_IDS.length, 20);
    assert.equal(EGYPTIAN_OBELISK_IDS[0], 185);
    assert.equal(EGYPTIAN_OBELISK_IDS[19], 204);

    const isMy = (b) => b.ownerId === 'player1';

    // No obelisk
    const buildingsNoObelisk = [
        { id: '1', buildingId: 301, ownerId: 'player1', isConstructing: false, hp: 100 },
        { id: '2', buildingId: 340, ownerId: 'player1', isConstructing: false, hp: 100 },
    ];
    assert.equal(checkHasEgyptianObelisk(buildingsNoObelisk, isMy), false);

    // Obelisk under construction -> does not grant perk yet
    const buildingsConstructing = [
        { id: '3', buildingId: 185, ownerId: 'player1', isConstructing: true, hp: 100 },
    ];
    assert.equal(checkHasEgyptianObelisk(buildingsConstructing, isMy), false);

    // Destroyed obelisk -> does not grant perk
    const buildingsDestroyed = [
        { id: '4', buildingId: 185, ownerId: 'player1', isConstructing: false, hp: 0 },
    ];
    assert.equal(checkHasEgyptianObelisk(buildingsDestroyed, isMy), false);

    // Active completed Egyptian Obelisk (e.g. ID 185 or 190)
    const buildingsActive = [
        { id: '5', buildingId: 190, ownerId: 'player1', isConstructing: false, hp: 3000 },
    ];
    assert.equal(checkHasEgyptianObelisk(buildingsActive, isMy), true);
});

test('Production Collect - Financial Cooldown & Obelisk Bypass', () => {
    const now = 10000000;
    const cooldownMs = FINANCIAL_COLLECT_COOLDOWN_MS; // 30 minutes = 1,800,000 ms

    // Without obelisk: right after collection -> should be on cooldown
    const statusJustCollected = getFinancialCollectCooldownStatus(now, false, now);
    assert.equal(statusJustCollected.isReady, false);
    assert.equal(statusJustCollected.hasObeliskPerk, false);
    assert.equal(statusJustCollected.remainingMs, cooldownMs);

    // Without obelisk: 15 minutes elapsed -> remaining 15 mins
    const statusHalfway = getFinancialCollectCooldownStatus(now - 15 * 60 * 1000, false, now);
    assert.equal(statusHalfway.isReady, false);
    assert.equal(statusHalfway.remainingMs, 15 * 60 * 1000);

    // Without obelisk: 31 minutes elapsed -> ready!
    const statusReady = getFinancialCollectCooldownStatus(now - 31 * 60 * 1000, false, now);
    assert.equal(statusReady.isReady, true);
    assert.equal(statusReady.remainingMs, 0);

    // WITH Egyptian Obelisk: 0 ms cooldown ALWAYS!
    const statusObeliskActive = getFinancialCollectCooldownStatus(now, true, now);
    assert.equal(statusObeliskActive.isReady, true);
    assert.equal(statusObeliskActive.hasObeliskPerk, true);
    assert.equal(statusObeliskActive.remainingMs, 0);
    assert.equal(statusObeliskActive.cooldownMs, 0);
});

test('Production Collect - Building Ready Status', () => {
    const now = 20000;

    // Finished building -> ready
    const finishedBuilding = {
        id: 'b1',
        buildingId: 70,
        workState: 'finished',
        isConstructing: false,
    };
    assert.equal(isBuildingReadyForCollection(finishedBuilding, now), true);

    // Working building whose workEndTime has passed -> ready
    const elapsedBuilding = {
        id: 'b2',
        buildingId: 70,
        workState: 'working',
        workEndTime: now - 100,
        isConstructing: false,
    };
    assert.equal(isBuildingReadyForCollection(elapsedBuilding, now), true);

    // Working building whose timer is still running -> not ready
    const runningBuilding = {
        id: 'b3',
        buildingId: 70,
        workState: 'working',
        workEndTime: now + 5000,
        isConstructing: false,
    };
    assert.equal(isBuildingReadyForCollection(runningBuilding, now), false);

    // Constructing building -> never ready
    const constructingBuilding = {
        id: 'b4',
        buildingId: 70,
        workState: 'finished',
        isConstructing: true,
    };
    assert.equal(isBuildingReadyForCollection(constructingBuilding, now), false);
});

test('Production Collect - Rewards & Yield Calculation', () => {
    const mockInfo = {
        id: 70,
        stats: {
            givesCoins: 5,
            produces: [{ id: 10003, amount: 2 }],
        },
    };

    const reward = calculateBuildingReward({
        building: { id: 'b1', buildingId: 70, x: 10, y: 10 },
        info: mockInfo,
    });

    assert.equal(reward.gold, 5);
    assert.equal(reward.inventoryDeltas[10003], 2);
    // Mushroom stage 70 advances
    assert.ok([71, 77].includes(reward.nextBuildingId));
});

test('Production Collect - Lily Pond Progression (400 -> 402 -> 403 -> 404 -> 405)', () => {
    assert.equal(calculateNextCropBuildingId(400), 402, 'Level 1 Lily Pond (400) advances to Level 2 (402)');
    assert.equal(calculateNextCropBuildingId(402), 403, 'Level 2 Lily Pond (402) advances to Level 3 (403)');
    assert.equal(calculateNextCropBuildingId(403), 404, 'Level 3 Lily Pond (403) advances to Level 4 (404)');
    assert.equal(calculateNextCropBuildingId(404), 405, 'Level 4 Lily Pond (404) advances to Level 5 (405)');
    const nextAfter5 = calculateNextCropBuildingId(405);
    assert.ok([400, 401].includes(nextAfter5), 'Level 5 Lily Pond (405) advances to Super Lily (401) or resets to 400');
});

test('Production Collect - Reward Eligibility with Elapsed Work Timer', () => {
    const now = 50000;

    // Building in 'finished' state is immediately eligible
    const finishedBuilding = { id: 'b100', buildingId: 400, workState: 'finished' };
    const resFinished = resolveLocalRewardEligibility({ building: finishedBuilding, now });
    assert.equal(resFinished.granted, true);
    assert.equal(resFinished.consumedBuilding.workState, 'idle');

    // Building in 'working' state whose workEndTime has passed (e.g. now >= 50000) is eligible
    const elapsedBuilding = { id: 'b101', buildingId: 400, workState: 'working', workEndTime: now - 500 };
    const resElapsed = resolveLocalRewardEligibility({ building: elapsedBuilding, now });
    assert.equal(resElapsed.granted, true, 'Building with elapsed timer is eligible for collection');
    assert.equal(resElapsed.consumedBuilding.workState, 'idle');

    // Building in 'working' state whose timer is still running is NOT eligible
    const runningBuilding = { id: 'b102', buildingId: 400, workState: 'working', workEndTime: now + 43000 };
    const resRunning = resolveLocalRewardEligibility({ building: runningBuilding, now });
    assert.equal(resRunning.granted, false, 'Building with active countdown must not be granted reward');
});

test('Production Collect - Snapshot Merge Preserves Active Production Countdown', () => {
    const now = 1000000;
    // Local building is working with 43 seconds left (workEndTime = now + 43000)
    const localBuilding = {
        id: 'lily-1',
        buildingId: 400,
        ownerId: 'player1',
        workState: 'working',
        workEndTime: now + 43000,
        isLocal: true,
        hp: 72,
        maxHp: 72,
    };

    // Stale server snapshot arrived with workState: 'idle' or expired timer
    const staleServerBuilding = {
        id: 'lily-1',
        buildingId: 400,
        ownerId: 'player1',
        workState: 'idle',
        workEndTime: undefined,
        isLocal: false,
        hp: 72,
        maxHp: 72,
    };

    // Even outside the sticky window (lastInteractionAt was 25 seconds ago)
    const result = resolvePlacedBuildingSnapshotMerge({
        serverBuilding: staleServerBuilding,
        localBuilding,
        currentUserId: 'player1',
        now,
        lastInteractionAt: now - 25000,
        lastMoveAt: 0,
        localIsProtectedByCombat: false,
        stickyInteractionMs: 15000,
        deletionProtectionMs: 120000,
    });

    // The active working timer must NOT be aborted or jumped to finished!
    assert.equal(result.mergedBuilding.workState, 'working', 'Active working countdown must remain working');
    assert.equal(result.mergedBuilding.workEndTime, now + 43000, 'workEndTime must be preserved');
});
