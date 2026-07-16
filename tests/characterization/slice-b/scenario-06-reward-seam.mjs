// @ts-check

import assert from 'node:assert/strict';
import { resolveLocalRewardEligibility } from '../../../src/game/buildings/resolveLocalRewardEligibility.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildEligibleBuilding(overrides = {}) {
  return {
    id: 'reward-seam-1',
    buildingId: 67,
    ownerId: 'user-9',
    x: 18,
    y: 11,
    zoneId: 'zone-2',
    isLocal: true,
    workState: 'finished',
    hp: 1632,
    maxHp: 1632,
    pendingDamage: 0,
    timestamp: 1704067198200,
    customTag: 'preserve-me',
    productionNotes: { chain: 'cafe-2' },
    ...overrides,
  };
}

function expectPreservedFields(before, after) {
  assert.equal(after.id, before.id);
  assert.equal(after.buildingId, before.buildingId);
  assert.equal(after.ownerId, before.ownerId);
  assert.equal(after.x, before.x);
  assert.equal(after.y, before.y);
  assert.equal(after.zoneId, before.zoneId);
  assert.equal(after.isLocal, before.isLocal);
  assert.equal(after.hp, before.hp);
  assert.equal(after.maxHp, before.maxHp);
  assert.equal(after.pendingDamage, before.pendingDamage);
  assert.equal(after.timestamp, before.timestamp);
  assert.equal(after.customTag, before.customTag);
  assert.deepEqual(after.productionNotes, before.productionNotes);
}

function run() {
  const eligible = buildEligibleBuilding();
  const eligibleSnapshot = clone(eligible);

  const firstPass = resolveLocalRewardEligibility({ building: eligible });

  assert.equal(firstPass.decision, 'grant_reward');
  assert.equal(firstPass.granted, true);
  assert.equal(firstPass.blocked, false);
  assert.equal(firstPass.blockedReason, undefined);
  assert.notStrictEqual(firstPass.consumedBuilding, eligible);
  assert.equal(firstPass.consumedBuilding.workState, 'idle');
  expectPreservedFields(eligibleSnapshot, firstPass.consumedBuilding);
  assert.deepEqual(eligible, eligibleSnapshot);

  const secondPass = resolveLocalRewardEligibility({ building: firstPass.consumedBuilding });
  assert.equal(secondPass.decision, 'no_reward');
  assert.equal(secondPass.granted, false);
  assert.equal(secondPass.blocked, false);
  assert.equal(secondPass.blockedReason, undefined);
  assert.equal(secondPass.consumedBuilding.workState, 'idle');
  expectPreservedFields(firstPass.consumedBuilding, secondPass.consumedBuilding);

  const missingIdentity = resolveLocalRewardEligibility({
    building: { ...buildEligibleBuilding(), id: undefined },
  });
  assert.equal(missingIdentity.decision, 'blocked_missing_identity');
  assert.equal(missingIdentity.granted, false);
  assert.equal(missingIdentity.blocked, true);
  assert.equal(missingIdentity.blockedReason, 'missing-building-identity');

  const invalidInput = resolveLocalRewardEligibility({
    building: { ...buildEligibleBuilding(), workState: 'broken' },
  });
  assert.equal(invalidInput.decision, 'blocked_invalid_input');
  assert.equal(invalidInput.granted, false);
  assert.equal(invalidInput.blocked, true);
  assert.equal(invalidInput.blockedReason, 'invalid-work-state');

  const notFinished = resolveLocalRewardEligibility({
    building: { ...buildEligibleBuilding(), workState: 'working' },
  });
  assert.equal(notFinished.decision, 'no_reward');
  assert.equal(notFinished.granted, false);
  assert.equal(notFinished.blocked, false);
  assert.equal(notFinished.blockedReason, undefined);
  assert.equal(notFinished.consumedBuilding.workState, 'working');
  expectPreservedFields(buildEligibleBuilding({ workState: 'working' }), notFinished.consumedBuilding);

  const alreadyIdle = resolveLocalRewardEligibility({
    building: { ...buildEligibleBuilding(), workState: 'idle' },
  });
  assert.equal(alreadyIdle.decision, 'no_reward');
  assert.equal(alreadyIdle.granted, false);
  assert.equal(alreadyIdle.blocked, false);
  assert.equal(alreadyIdle.blockedReason, undefined);
  assert.equal(alreadyIdle.consumedBuilding.workState, 'idle');
  expectPreservedFields(buildEligibleBuilding({ workState: 'idle' }), alreadyIdle.consumedBuilding);

  const missingBuilding = resolveLocalRewardEligibility({ building: undefined });
  assert.equal(missingBuilding.decision, 'blocked_invalid_input');
  assert.equal(missingBuilding.granted, false);
  assert.equal(missingBuilding.blocked, true);
  assert.equal(missingBuilding.blockedReason, 'missing-building-object');
}

try {
  run();
  console.log('PASS scenario-06-reward-seam');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
