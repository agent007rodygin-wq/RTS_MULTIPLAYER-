// @ts-check

import assert from 'node:assert/strict';
import { resolveRejectedOptimisticPlacementRollback } from '../../../src/game/buildings/resolveRejectedOptimisticPlacementRollback.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildUnrelatedBuilding() {
  return {
    id: 'other-building-1',
    buildingId: 12,
    x: 2,
    y: 3,
    zoneId: 'zone-1',
    ownerId: 'user-7',
    ownerName: 'Neighbor',
    status: 'normal',
    syncState: 'synced',
    isConstructing: false,
    constructionEndTime: 0,
    workState: 'idle',
    hp: 10,
    maxHp: 10,
    pendingDamage: 0,
    isLocal: false,
    timestamp: 1704067100000,
    tag: 'keep-me',
  };
}

function buildOptimisticBuilding(overrides = {}) {
  return {
    id: 'temp-placement-1',
    tempId: 'temp-placement-1',
    clientBuildTraceId: 'temp-placement-1',
    buildingId: 301,
    ownerId: 'user-9',
    ownerName: 'Player Nine',
    x: 18,
    y: 11,
    zoneId: 'zone-2',
    status: 'pending',
    syncState: 'creating',
    isConstructing: true,
    constructionEndTime: 1704067640000,
    workState: 'idle',
    hp: 40,
    maxHp: 40,
    pendingDamage: 0,
    isLocal: true,
    timestamp: 1704067200000,
    rollbackAudit: { source: 'optimistic-placement' },
    ...overrides,
  };
}

function buildCurrentBuildings(includeOptimistic = true, optimisticOverrides = {}) {
  const buildings = [buildUnrelatedBuilding()];
  if (includeOptimistic) {
    buildings.push(buildOptimisticBuilding(optimisticOverrides));
  }
  return buildings;
}

function buildSpentResourceDeltas() {
  return {
    goldDelta: -1250,
    rubiesDelta: 0,
    inventoryDeltas: {
      10001: -3,
      10002: -1,
    },
  };
}

function buildResourceState() {
  return {
    gold: 9400,
    rubies: 4,
    inventory: {
      10001: 11,
      10002: 9,
      10003: 7,
    },
    cosmeticFlag: 'keep-me',
  };
}

function applyProjectedResourceRestoration(resourceState, restoration) {
  const nextInventory = { ...resourceState.inventory };
  Object.entries(restoration.inventoryDeltas || {}).forEach(([id, delta]) => {
    nextInventory[Number(id)] = (nextInventory[Number(id)] || 0) + delta;
  });

  return {
    ...resourceState,
    gold: resourceState.gold + (restoration.goldDelta || 0),
    rubies: resourceState.rubies + (restoration.rubiesDelta || 0),
    inventory: nextInventory,
  };
}

function expectUnrelatedBuildingPreserved(before, after) {
  assert.equal(after.id, before.id);
  assert.equal(after.buildingId, before.buildingId);
  assert.equal(after.ownerId, before.ownerId);
  assert.equal(after.ownerName, before.ownerName);
  assert.equal(after.x, before.x);
  assert.equal(after.y, before.y);
  assert.equal(after.zoneId, before.zoneId);
  assert.equal(after.status, before.status);
  assert.equal(after.syncState, before.syncState);
  assert.equal(after.isConstructing, before.isConstructing);
  assert.equal(after.constructionEndTime, before.constructionEndTime);
  assert.equal(after.workState, before.workState);
  assert.equal(after.hp, before.hp);
  assert.equal(after.maxHp, before.maxHp);
  assert.equal(after.pendingDamage, before.pendingDamage);
  assert.equal(after.isLocal, before.isLocal);
  assert.equal(after.timestamp, before.timestamp);
  assert.equal(after.tag, before.tag);
}

function expectZeroRestoration(restoration) {
  assert.deepEqual(restoration, {
    goldDelta: 0,
    rubiesDelta: 0,
    inventoryDeltas: {},
  });
}

function run() {
  const currentBuildings = buildCurrentBuildings();
  const currentBuildingsSnapshot = clone(currentBuildings);
  const optimisticBuilding = currentBuildings[1];
  const optimisticBuildingSnapshot = clone(optimisticBuilding);
  const spentResourceDeltas = buildSpentResourceDeltas();
  const spentResourceDeltasSnapshot = clone(spentResourceDeltas);
  const resourceState = buildResourceState();
  const resourceStateSnapshot = clone(resourceState);
  const rollbackIdentity = {
    tempId: optimisticBuilding.tempId,
    docId: 'server-placement-1',
  };

  const firstPass = resolveRejectedOptimisticPlacementRollback({
    currentBuildings,
    optimisticBuilding,
    spentResourceDeltas,
    rollbackIdentity,
    alreadyRestored: false,
  });

  assert.equal(firstPass.decision, 'rollback_rejected_placement');
  assert.equal(firstPass.restored, true);
  assert.equal(firstPass.blocked, false);
  assert.equal(firstPass.blockedReason, undefined);
  assert.equal(firstPass.removeTemporaryBuilding, true);
  assert.notStrictEqual(firstPass.projectedBuildings, currentBuildings);
  assert.equal(firstPass.projectedBuildings.length, 1);
  expectUnrelatedBuildingPreserved(currentBuildingsSnapshot[0], firstPass.projectedBuildings[0]);
  assert.deepEqual(currentBuildings, currentBuildingsSnapshot);
  assert.deepEqual(optimisticBuilding, optimisticBuildingSnapshot);
  assert.deepEqual(spentResourceDeltas, spentResourceDeltasSnapshot);
  assert.deepEqual(firstPass.projectedResourceRestoration, {
    goldDelta: 1250,
    rubiesDelta: 0,
    inventoryDeltas: {
      10001: 3,
      10002: 1,
    },
  });

  const restoredResources = applyProjectedResourceRestoration(resourceState, firstPass.projectedResourceRestoration);
  assert.equal(restoredResources.gold, 10650);
  assert.equal(restoredResources.rubies, 4);
  assert.deepEqual(restoredResources.inventory, {
    10001: 14,
    10002: 10,
    10003: 7,
  });
  assert.equal(restoredResources.cosmeticFlag, 'keep-me');
  assert.deepEqual(resourceState, resourceStateSnapshot);

  const secondPassInputBuildings = clone(firstPass.projectedBuildings);
  const secondPass = resolveRejectedOptimisticPlacementRollback({
    currentBuildings: secondPassInputBuildings,
    optimisticBuilding,
    spentResourceDeltas,
    rollbackIdentity,
    alreadyRestored: true,
  });

  assert.equal(secondPass.decision, 'no_rollback');
  assert.equal(secondPass.restored, false);
  assert.equal(secondPass.blocked, false);
  assert.equal(secondPass.blockedReason, undefined);
  assert.equal(secondPass.removeTemporaryBuilding, false);
  assert.deepEqual(secondPass.projectedBuildings, secondPassInputBuildings);
  expectZeroRestoration(secondPass.projectedResourceRestoration);

  const missingRollbackIdentity = resolveRejectedOptimisticPlacementRollback({
    currentBuildings,
    optimisticBuilding,
    spentResourceDeltas,
    rollbackIdentity: undefined,
    alreadyRestored: false,
  });
  assert.equal(missingRollbackIdentity.decision, 'blocked_missing_rollback_identity');
  assert.equal(missingRollbackIdentity.restored, false);
  assert.equal(missingRollbackIdentity.blocked, true);
  assert.equal(missingRollbackIdentity.blockedReason, 'missing-rollback-identity');

  const missingOptimisticBuilding = resolveRejectedOptimisticPlacementRollback({
    currentBuildings,
    optimisticBuilding: undefined,
    spentResourceDeltas,
    rollbackIdentity,
    alreadyRestored: false,
  });
  assert.equal(missingOptimisticBuilding.decision, 'blocked_missing_optimistic_building');
  assert.equal(missingOptimisticBuilding.restored, false);
  assert.equal(missingOptimisticBuilding.blocked, true);
  assert.equal(missingOptimisticBuilding.blockedReason, 'missing-optimistic-building');

  const missingCurrentBuildings = resolveRejectedOptimisticPlacementRollback({
    currentBuildings: undefined,
    optimisticBuilding,
    spentResourceDeltas,
    rollbackIdentity,
    alreadyRestored: false,
  });
  assert.equal(missingCurrentBuildings.decision, 'blocked_missing_current_buildings');
  assert.equal(missingCurrentBuildings.restored, false);
  assert.equal(missingCurrentBuildings.blocked, true);
  assert.equal(missingCurrentBuildings.blockedReason, 'missing-current-buildings');

  const missingResourceDeltas = resolveRejectedOptimisticPlacementRollback({
    currentBuildings,
    optimisticBuilding,
    spentResourceDeltas: undefined,
    rollbackIdentity,
    alreadyRestored: false,
  });
  assert.equal(missingResourceDeltas.decision, 'blocked_missing_resource_deltas');
  assert.equal(missingResourceDeltas.restored, false);
  assert.equal(missingResourceDeltas.blocked, true);
  assert.equal(missingResourceDeltas.blockedReason, 'missing-resource-deltas');

  const invalidOptimisticPlacementShape = resolveRejectedOptimisticPlacementRollback({
    currentBuildings,
    optimisticBuilding: { ...optimisticBuilding, id: undefined },
    spentResourceDeltas,
    rollbackIdentity,
    alreadyRestored: false,
  });
  assert.equal(invalidOptimisticPlacementShape.decision, 'blocked_invalid_placement_state');
  assert.equal(invalidOptimisticPlacementShape.restored, false);
  assert.equal(invalidOptimisticPlacementShape.blocked, true);
  assert.equal(invalidOptimisticPlacementShape.blockedReason, 'invalid-optimistic-placement-state');

  const optimisticBuildingIdentityMismatch = resolveRejectedOptimisticPlacementRollback({
    currentBuildings,
    optimisticBuilding: { ...optimisticBuilding, tempId: 'temp-placement-mismatch' },
    spentResourceDeltas,
    rollbackIdentity,
    alreadyRestored: false,
  });
  assert.equal(optimisticBuildingIdentityMismatch.decision, 'blocked_identity_mismatch');
  assert.equal(optimisticBuildingIdentityMismatch.restored, false);
  assert.equal(optimisticBuildingIdentityMismatch.blocked, true);
  assert.equal(optimisticBuildingIdentityMismatch.blockedReason, 'rollback-identity-mismatch');
}

try {
  run();
  console.log('PASS scenario-08-rollback-seam');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
