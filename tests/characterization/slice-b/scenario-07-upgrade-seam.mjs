// @ts-check

import assert from 'node:assert/strict';
import { resolveLocalUpgradeTransformation } from '../../../src/game/buildings/resolveLocalUpgradeTransformation.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildSourceBuildingInfo() {
  return {
    id: 301,
    type: 'town_hall',
    buildable: true,
    upgradesTo: 306,
    upgradeCost: 500,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 40,
    },
  };
}

function buildTargetBuildingInfo() {
  return {
    id: 306,
    type: 'town_hall',
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10001, name: 'Wood', amount: 1 }],
      population: 2,
    },
    stats: {
      constructionTimeSeconds: 440,
      durability: 232,
    },
  };
}

function buildUpgradeableBuilding(overrides = {}) {
  return {
    id: 'scenario-7-upgrade-seam-1',
    buildingId: 301,
    ownerId: 'user-9',
    x: 18,
    y: 11,
    zoneId: 'zone-2',
    isLocal: true,
    isConstructing: false,
    constructionEndTime: 0,
    workState: 'idle',
    hp: 40,
    maxHp: 40,
    pendingDamage: 0,
    timestamp: 1704067198200,
    customTag: 'preserve-me',
    upgradeAudit: { source: '301-to-306' },
    ...overrides,
  };
}

function expectPreservedFields(before, after) {
  assert.equal(after.id, before.id);
  assert.equal(after.ownerId, before.ownerId);
  assert.equal(after.x, before.x);
  assert.equal(after.y, before.y);
  assert.equal(after.zoneId, before.zoneId);
  assert.equal(after.isLocal, before.isLocal);
  assert.equal(after.workState, before.workState);
  assert.equal(after.timestamp, before.timestamp);
  assert.equal(after.customTag, before.customTag);
  assert.deepEqual(after.upgradeAudit, before.upgradeAudit);
}

function run() {
  const sourceBuildingInfo = buildSourceBuildingInfo();
  const targetBuildingInfo = buildTargetBuildingInfo();
  const frozenClock = 1704067200000;

  const eligible = buildUpgradeableBuilding();
  const eligibleSnapshot = clone(eligible);

  const firstPass = resolveLocalUpgradeTransformation({
    building: eligible,
    sourceBuildingInfo,
    targetBuildingInfo,
    now: frozenClock,
  });

  assert.equal(firstPass.decision, 'transform_upgrade');
  assert.equal(firstPass.transformed, true);
  assert.equal(firstPass.blocked, false);
  assert.equal(firstPass.blockedReason, undefined);
  assert.notStrictEqual(firstPass.projectedBuilding, eligible);
  assert.equal(firstPass.projectedBuilding.buildingId, 306);
  assert.equal(firstPass.projectedBuilding.type, targetBuildingInfo.type);
  assert.equal(firstPass.projectedBuilding.isConstructing, true);
  assert.equal(firstPass.projectedBuilding.constructionEndTime, frozenClock + (targetBuildingInfo.stats.constructionTimeSeconds * 1000));
  assert.equal(firstPass.projectedBuilding.lastAttackTime, frozenClock);
  assert.equal(firstPass.projectedBuilding.hp, targetBuildingInfo.stats.durability);
  assert.equal(firstPass.projectedBuilding.maxHp, targetBuildingInfo.stats.durability);
  assert.equal(firstPass.projectedBuilding.pendingDamage, 0);
  assert.equal(firstPass.projectedBuilding.isDestroying, false);
  assert.equal(firstPass.projectedBuilding.destructionStartedAt, undefined);
  assert.equal(firstPass.projectedBuilding.destructionEndTime, undefined);
  assert.equal(firstPass.projectedBuilding.destructionExpiresAt, undefined);
  assert.equal(firstPass.projectedBuilding.destructionDurationMs, undefined);
  assert.equal(firstPass.projectedBuilding.destructionMaxLifetimeMs, undefined);
  assert.equal(firstPass.projectedBuilding.destructionStatus, 'finished');
  assert.equal(firstPass.projectedBuilding.initiatorId, undefined);
  expectPreservedFields(eligibleSnapshot, firstPass.projectedBuilding);
  assert.deepEqual(eligible, eligibleSnapshot);

  const secondPass = resolveLocalUpgradeTransformation({
    building: firstPass.projectedBuilding,
    sourceBuildingInfo,
    targetBuildingInfo,
    now: frozenClock,
  });

  assert.equal(secondPass.decision, 'no_transformation');
  assert.equal(secondPass.transformed, false);
  assert.equal(secondPass.blocked, false);
  assert.equal(secondPass.blockedReason, undefined);
  assert.notStrictEqual(secondPass.projectedBuilding, firstPass.projectedBuilding);
  expectPreservedFields(firstPass.projectedBuilding, secondPass.projectedBuilding);
  assert.equal(secondPass.projectedBuilding.buildingId, 306);
  assert.equal(secondPass.projectedBuilding.isConstructing, true);
  assert.equal(secondPass.projectedBuilding.constructionEndTime, frozenClock + (targetBuildingInfo.stats.constructionTimeSeconds * 1000));
  assert.equal(secondPass.projectedBuilding.lastAttackTime, frozenClock);
  assert.equal(secondPass.projectedBuilding.hp, targetBuildingInfo.stats.durability);
  assert.equal(secondPass.projectedBuilding.maxHp, targetBuildingInfo.stats.durability);
  assert.equal(secondPass.projectedBuilding.pendingDamage, 0);

  const invalidUpgradeState = resolveLocalUpgradeTransformation({
    building: buildUpgradeableBuilding({ isConstructing: true }),
    sourceBuildingInfo,
    targetBuildingInfo,
    now: frozenClock,
  });

  assert.equal(invalidUpgradeState.decision, 'blocked_invalid_upgrade_state');
  assert.equal(invalidUpgradeState.transformed, false);
  assert.equal(invalidUpgradeState.blocked, true);
  assert.equal(invalidUpgradeState.blockedReason, 'invalid-upgrade-state');

  const missingIdentity = resolveLocalUpgradeTransformation({
    building: buildUpgradeableBuilding({ id: undefined }),
    sourceBuildingInfo,
    targetBuildingInfo,
    now: frozenClock,
  });

  assert.equal(missingIdentity.decision, 'blocked_missing_identity');
  assert.equal(missingIdentity.transformed, false);
  assert.equal(missingIdentity.blocked, true);
  assert.equal(missingIdentity.blockedReason, 'missing-building-identity');

  const missingTargetBuilding = resolveLocalUpgradeTransformation({
    building: buildUpgradeableBuilding(),
    sourceBuildingInfo,
    targetBuildingInfo: undefined,
    now: frozenClock,
  });

  assert.equal(missingTargetBuilding.decision, 'blocked_missing_target');
  assert.equal(missingTargetBuilding.transformed, false);
  assert.equal(missingTargetBuilding.blocked, true);
  assert.equal(missingTargetBuilding.blockedReason, 'missing-target-building-definition');

  const unrelatedFieldChanged = resolveLocalUpgradeTransformation({
    building: buildUpgradeableBuilding({ customTag: 'keep-me', upgradeAudit: { source: '301-to-306' }, extraField: 'extra' }),
    sourceBuildingInfo,
    targetBuildingInfo,
    now: frozenClock,
  });

  assert.equal(unrelatedFieldChanged.projectedBuilding.customTag, 'keep-me');
  assert.deepEqual(unrelatedFieldChanged.projectedBuilding.upgradeAudit, { source: '301-to-306' });
  assert.equal(unrelatedFieldChanged.projectedBuilding.extraField, 'extra');
}

try {
  run();
  console.log('PASS scenario-07-upgrade-seam');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
