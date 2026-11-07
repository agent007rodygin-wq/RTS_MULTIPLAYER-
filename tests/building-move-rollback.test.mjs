// @ts-check
import assert from 'node:assert/strict';
import { resolvePlacedBuildingSnapshotMerge } from '../src/game/buildings/resolveBuildingSnapshotMerge.js';

console.log('--- Testing Building Move Rollback & Sticky Position Protection ---');

const STICKY_INTERACTION_MS = 15000;
const DELETION_PROTECTION_MS = 120000;
const NOW = 1000000;

// Test 1: Building moved locally, server arrives with older coordinates -> new position MUST stick
{
  const localBuilding = {
    id: 'building-101',
    buildingId: 54,
    x: 25,
    y: 30,
    zoneId: '0_1',
    ownerId: 'user-abc',
    isLocal: true,
    hp: 500,
    maxHp: 500,
    workState: 'idle',
    lastMoveTime: NOW - 500,
  };

  const staleServerBuilding = {
    id: 'building-101',
    buildingId: 54,
    x: 10,
    y: 12,
    zoneId: '0_0',
    ownerId: 'user-abc',
    isLocal: false,
    hp: 500,
    maxHp: 500,
    workState: 'idle',
    lastMoveTime: NOW - 60000,
  };

  const result = resolvePlacedBuildingSnapshotMerge({
    serverBuilding: staleServerBuilding,
    localBuilding: localBuilding,
    currentUserId: 'user-abc',
    now: NOW,
    lastInteractionAt: NOW - 500,
    lastMoveAt: NOW - 500,
    localIsProtectedByCombat: false,
    stickyInteractionMs: STICKY_INTERACTION_MS,
    deletionProtectionMs: DELETION_PROTECTION_MS,
  });

  assert.equal(result.shouldStickPosition, true, 'shouldStickPosition must be true within move window');
  assert.equal(result.mergedBuilding.x, 25, 'Merged building must keep new local x coordinate');
  assert.equal(result.mergedBuilding.y, 30, 'Merged building must keep new local y coordinate');
  assert.equal(result.mergedBuilding.zoneId, '0_1', 'Merged building must keep new local zoneId');
  console.log('PASS: Test 1 - Local move coordinates are protected against stale server snapshot');
}

// Test 2: Guest user (no currentUserId, ownerId: "0") moves building -> must not teleport back
{
  const localGuestBuilding = {
    id: 'building-guest-1',
    buildingId: 1,
    x: 40,
    y: 45,
    zoneId: '1_1',
    ownerId: '0',
    isLocal: false, // Even if isLocal was stripped on previous frame
    hp: 300,
    maxHp: 300,
    workState: 'idle',
    lastMoveTime: NOW - 1000,
  };

  const staleServerBuilding = {
    id: 'building-guest-1',
    buildingId: 1,
    x: 15,
    y: 20,
    zoneId: '0_0',
    ownerId: '0',
    isLocal: false,
    hp: 300,
    maxHp: 300,
    workState: 'idle',
    lastMoveTime: 0,
  };

  const result = resolvePlacedBuildingSnapshotMerge({
    serverBuilding: staleServerBuilding,
    localBuilding: localGuestBuilding,
    currentUserId: null,
    now: NOW,
    lastInteractionAt: 0,
    lastMoveAt: NOW - 1000,
    localIsProtectedByCombat: false,
    stickyInteractionMs: STICKY_INTERACTION_MS,
    deletionProtectionMs: DELETION_PROTECTION_MS,
  });

  assert.equal(result.shouldStickPosition, true, 'Guest move must stick even with currentUserId=null');
  assert.equal(result.mergedBuilding.x, 40, 'Guest building must keep new x');
  assert.equal(result.mergedBuilding.y, 45, 'Guest building must keep new y');
  console.log('PASS: Test 2 - Guest player move is protected against stale server rollback');
}

// Test 3: Server catches up and matches new coordinates -> cleanly accepts server update
{
  const localBuilding = {
    id: 'building-101',
    buildingId: 54,
    x: 25,
    y: 30,
    zoneId: '0_1',
    ownerId: 'user-abc',
    isLocal: true,
    hp: 500,
    maxHp: 500,
    workState: 'idle',
    lastMoveTime: NOW - 2000,
  };

  const confirmedServerBuilding = {
    id: 'building-101',
    buildingId: 54,
    x: 25,
    y: 30,
    zoneId: '0_1',
    ownerId: 'user-abc',
    isLocal: false,
    hp: 500,
    maxHp: 500,
    workState: 'idle',
    lastMoveTime: NOW - 2000,
  };

  const result = resolvePlacedBuildingSnapshotMerge({
    serverBuilding: confirmedServerBuilding,
    localBuilding: localBuilding,
    currentUserId: 'user-abc',
    now: NOW,
    lastInteractionAt: NOW - 2000,
    lastMoveAt: NOW - 2000,
    localIsProtectedByCombat: false,
    stickyInteractionMs: STICKY_INTERACTION_MS,
    deletionProtectionMs: DELETION_PROTECTION_MS,
  });

  assert.equal(result.decision, 'accepted_server_matches_local', 'Server match should yield accepted_server_matches_local');
  assert.equal(result.clearLastInteraction, true, 'Interaction should be cleared once server confirms move');
  assert.equal(result.mergedBuilding.x, 25, 'Coordinates match server confirmation');
  assert.equal(result.mergedBuilding.y, 30, 'Coordinates match server confirmation');
  console.log('PASS: Test 3 - Confirmed move clears sticky state and accepts server state cleanly');
}

console.log('ALL BUILDING MOVE ROLLBACK CONTRACT ASSERTIONS PASSED!');
