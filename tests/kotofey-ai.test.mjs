import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { KOTOFEY_ID, BABA_YAGA_ID } from '../src/game/monsters/monsterIds.js';
import { MONSTER_MOVE_INTERVALS, getMonsterMoveInterval } from '../src/game/monsters/monsterMovement.js';
import {
    KOTOFEY_ITEM_ID,
    KOTOFEY_PRICE_GOLD,
    KOTOFEY_SEARCH_RADIUS,
    KOTOFEY_BASE_REPAIR,
    DEFAULT_KOTOFEY_SETTINGS,
    normalizeKotofeySettings,
    isKotofeyMonster,
    isGroundTileId,
    isMonsterAcademyBuilding,
    getKotofeyRepairAmount,
    isKotofeyRepairCandidate,
    isKotofeyTileBlocked,
} from '../src/game/monsters/kotofeyLogic.js';
import {
    getMonsterAdjacentAttackTarget,
    getMonsterAdjacentHoldTarget,
    getMonsterChaseTarget,
} from '../src/game/monsters/monsterTargetSelection.js';
import { chooseMonsterBackgroundMove } from '../src/game/monsters/monsterBackgroundMove.js';
import { buildMonsterRuntimeSnapshot } from '../src/game/monsters/monsterRuntimeSnapshot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const mockBuildingData = [
    {
        id: KOTOFEY_ID,
        category: 'Монстры',
        stats: {
            isMonster: true,
            durability: 27432,
            repair: '300',
            loves: 'Подарки',
        },
    },
    { id: 1, category: 'Дома', stats: { durability: 1000 } },
    { id: 2, category: 'Заборы', stats: { durability: 500 } },
    { id: 300, category: 'Подарки', stats: { durability: 800 } },
    { id: BABA_YAGA_ID, category: 'Монстры', stats: { isMonster: true, durability: 5000, damage: '20' } },
    { id: 50001, category: 'Ресурсы', stats: {} },  // Road
    { id: 500012, category: 'Ресурсы', stats: {} }, // Road variant
    { id: 50007, category: 'Ресурсы', stats: {} },  // Pavement
    { id: 50004, category: 'Ресурсы', stats: {} },  // River
    { id: 50005, category: 'Ресурсы', stats: {} },  // Mountain
];

function makeKotofey(overrides = {}) {
    return {
        id: 'koto-1',
        buildingId: KOTOFEY_ID,
        ownerId: 'u1',
        x: 50,
        y: 50,
        hp: 27432,
        maxHp: 27432,
        monsterMode: 'patrol',
        kotofeySettings: { ...DEFAULT_KOTOFEY_SETTINGS },
        ...overrides,
    };
}

test('Kotofey identity, Academy IDs, and ground tile helpers', () => {
    assert.equal(KOTOFEY_ID, 70007);
    assert.equal(KOTOFEY_ITEM_ID, 10053);
    assert.equal(KOTOFEY_PRICE_GOLD, 3300000);
    assert.equal(KOTOFEY_BASE_REPAIR, 300);
    assert.equal(KOTOFEY_SEARCH_RADIUS, 10);
    assert.equal(MONSTER_MOVE_INTERVALS[KOTOFEY_ID], 22000);
    assert.ok(getMonsterMoveInterval(KOTOFEY_ID, 'koto-1') >= 18000);
    assert.equal(isKotofeyMonster(70007), true);
    assert.equal(isKotofeyMonster(BABA_YAGA_ID), false);
    assert.equal(isMonsterAcademyBuilding(689), true);
    assert.equal(isMonsterAcademyBuilding(69966), true);
    assert.equal(isMonsterAcademyBuilding(70966), true);
    assert.equal(isMonsterAcademyBuilding(1), false);
    assert.equal(isGroundTileId(50001), true);
    assert.equal(isGroundTileId(500012), true);
    assert.equal(isGroundTileId(50007), true);
    assert.equal(isGroundTileId(50004), true);
    assert.equal(isGroundTileId(1), false);
});

test('Kotofey repairs own damaged buildings, walls, gifts, and own monsters — excludes full HP, roads, and strangers', () => {
    const kotoStanding = makeKotofey({ monsterMode: 'stand' });
    const kotoPatrol = makeKotofey({ monsterMode: 'patrol' });

    const ownHouseDamaged = { id: 'h1', buildingId: 1, ownerId: 'u1', x: 51, y: 50, hp: 500, maxHp: 1000 };
    const ownWallDamaged = { id: 'w1', buildingId: 2, ownerId: 'u1', x: 50, y: 51, hp: 100, maxHp: 500 };
    const ownMonsterDamaged = { id: 'm1', buildingId: BABA_YAGA_ID, ownerId: 'u1', x: 49, y: 50, hp: 4000, maxHp: 5000 };
    const ownFullHouse = { id: 'h2', buildingId: 1, ownerId: 'u1', x: 50, y: 49, hp: 1000, maxHp: 1000 };
    const ownRoad = { id: 'r1', buildingId: 50001, ownerId: 'u1', x: 52, y: 50, hp: 50, maxHp: 100 };
    const constructingHouse = { id: 'h3', buildingId: 1, ownerId: 'u1', x: 52, y: 51, hp: 100, maxHp: 1000, isConstructing: true };
    const strangerGift = { id: 'g-str', buildingId: 300, ownerId: 'u-stranger', x: 50, y: 52, hp: 100, maxHp: 800 };

    assert.equal(isKotofeyRepairCandidate(kotoStanding, ownHouseDamaged, mockBuildingData), false);
    assert.equal(isKotofeyRepairCandidate(kotoPatrol, ownHouseDamaged, mockBuildingData), true);
    assert.equal(isKotofeyRepairCandidate(kotoPatrol, ownWallDamaged, mockBuildingData), true);
    assert.equal(isKotofeyRepairCandidate(kotoPatrol, ownMonsterDamaged, mockBuildingData), true);
    assert.equal(isKotofeyRepairCandidate(kotoPatrol, kotoPatrol, mockBuildingData), false);
    assert.equal(isKotofeyRepairCandidate(kotoPatrol, ownFullHouse, mockBuildingData), false);
    assert.equal(isKotofeyRepairCandidate(kotoPatrol, ownRoad, mockBuildingData), false);
    assert.equal(isKotofeyRepairCandidate(kotoPatrol, constructingHouse, mockBuildingData), false);
    assert.equal(isKotofeyRepairCandidate(kotoPatrol, strangerGift, mockBuildingData), false);

    assert.equal(getKotofeyRepairAmount(mockBuildingData[0], mockBuildingData[1], ownHouseDamaged), 300);
    assert.equal(getKotofeyRepairAmount(mockBuildingData[0], mockBuildingData[3], strangerGift), 600);
});

test('Kotofey prioritizes loved Gifts with 2x repair and does not get distracted while a damaged gift is within 10 tiles', () => {
    const koto = makeKotofey();
    const adjHouse = { id: 'adj-h', buildingId: 1, ownerId: 'u1', x: 51, y: 50, hp: 400, maxHp: 1000 };
    const farGift = { id: 'far-g', buildingId: 300, ownerId: 'u1', x: 54, y: 54, hp: 200, maxHp: 800 }; // distance 8 <= 10
    const tooFarGift = { id: 'too-far-g', buildingId: 300, ownerId: 'u1', x: 65, y: 50, hp: 200, maxHp: 800 }; // distance 15 > 10

    // Adjacent regular house ignored while farGift is within 10 tiles:
    const buildingsWithNearGift = [koto, adjHouse, farGift];
    assert.equal(getMonsterAdjacentAttackTarget(koto, buildingsWithNearGift, mockBuildingData), null);
    assert.equal(getMonsterAdjacentHoldTarget(koto, buildingsWithNearGift, mockBuildingData), null);
    assert.equal(getMonsterChaseTarget(koto, buildingsWithNearGift, mockBuildingData)?.id, 'far-g');

    // When another gift is adjacent, it repairs the adjacent gift even if adjHouse is also adjacent:
    const adjGift = { id: 'adj-g', buildingId: 300, ownerId: 'u1', x: 49, y: 50, hp: 500, maxHp: 800 };
    const adjTarget = getMonsterAdjacentAttackTarget(koto, [koto, adjHouse, adjGift], mockBuildingData);
    assert.equal(adjTarget?.id, 'adj-g');

    // Once near gifts are full HP (and only >10-tile gift remains damaged), Kotofey repairs adjHouse:
    const fullGift = { ...farGift, hp: 800 };
    const buildingsAfterGiftRepaired = [koto, adjHouse, fullGift, tooFarGift];
    assert.equal(getMonsterAdjacentAttackTarget(koto, buildingsAfterGiftRepaired, mockBuildingData)?.id, 'adj-h');
});

test('Kotofey respects clan & friend repair toggles independently', () => {
    const kotofeyContext = {
        allUsers: {
            u1: { clanId: 77, friends: [{ uid: 'u-friend' }, { name: 'NamedFriend' }] },
            'u-clan': { clanId: '77' },
            'u-clan-leader': {},
            'u-friend': { clanId: 12 },
            'u-named-friend': { name: 'NamedFriend', clanId: 13 },
            'u-stranger': { clanId: 99 },
        },
        clans: [{ id: 77, leaderUid: 'u-clan-leader' }],
        localUserUid: 'u1',
        localFriends: [{ uid: 'u-friend' }],
    };

    const clanHouse = { id: 'c-h', buildingId: 1, ownerId: 'u-clan', x: 51, y: 50, hp: 400, maxHp: 1000 };
    const clanGift = { id: 'c-g', buildingId: 300, ownerId: 'u-clan-leader', x: 52, y: 50, hp: 400, maxHp: 800 };
    const friendHouse = { id: 'f-h', buildingId: 1, ownerId: 'u-named-friend', x: 49, y: 50, hp: 400, maxHp: 1000 };
    const friendGift = { id: 'f-g', buildingId: 300, ownerId: 'u-friend', x: 48, y: 50, hp: 400, maxHp: 800 };

    const kotoNone = makeKotofey({
        kotofeySettings: { walkRoads: true, walkFriendRoads: false, repairClan: false, repairClanGifts: false, repairFriends: false, repairFriendGifts: false },
    });
    assert.equal(isKotofeyRepairCandidate(kotoNone, clanHouse, mockBuildingData, { kotofeyContext }), false);
    assert.equal(isKotofeyRepairCandidate(kotoNone, clanGift, mockBuildingData, { kotofeyContext }), false);
    assert.equal(isKotofeyRepairCandidate(kotoNone, friendHouse, mockBuildingData, { kotofeyContext }), false);
    assert.equal(isKotofeyRepairCandidate(kotoNone, friendGift, mockBuildingData, { kotofeyContext }), false);

    const kotoClanGiftsOnly = makeKotofey({
        kotofeySettings: { walkRoads: true, walkFriendRoads: false, repairClan: false, repairClanGifts: true, repairFriends: false, repairFriendGifts: false },
    });
    assert.equal(isKotofeyRepairCandidate(kotoClanGiftsOnly, clanHouse, mockBuildingData, { kotofeyContext }), false);
    assert.equal(isKotofeyRepairCandidate(kotoClanGiftsOnly, clanGift, mockBuildingData, { kotofeyContext }), true);

    const kotoFriendsOnly = makeKotofey({
        kotofeySettings: { walkRoads: true, walkFriendRoads: false, repairClan: false, repairClanGifts: false, repairFriends: true, repairFriendGifts: false },
    });
    assert.equal(isKotofeyRepairCandidate(kotoFriendsOnly, friendHouse, mockBuildingData, { kotofeyContext }), true);
    assert.equal(isKotofeyRepairCandidate(kotoFriendsOnly, friendGift, mockBuildingData, { kotofeyContext }), false);

    const kotoFriendGiftsOnly = makeKotofey({
        kotofeySettings: { walkRoads: true, walkFriendRoads: false, repairClan: false, repairClanGifts: false, repairFriends: false, repairFriendGifts: true },
    });
    assert.equal(isKotofeyRepairCandidate(kotoFriendGiftsOnly, friendGift, mockBuildingData, { kotofeyContext }), true);
});

test('Kotofey road walking rules & standing still when boxed in with walkRoads=false', () => {
    const kotofeyContext = {
        allUsers: {
            u1: { friends: [{ uid: 'u-friend' }] },
            'u-friend': {},
            'u-stranger': {},
        },
        clans: [],
        localUserUid: 'u1',
        localFriends: [{ uid: 'u-friend' }],
    };

    const ownRoad = { id: 'r-own', buildingId: 50001, ownerId: 'u1', x: 51, y: 50, hp: 100, maxHp: 100 };
    const ownPavement = { id: 'p-own', buildingId: 50007, ownerId: 'u1', x: 49, y: 50, hp: 100, maxHp: 100 };
    const friendRoad = { id: 'r-fr', buildingId: 500012, ownerId: 'u-friend', x: 50, y: 51, hp: 100, maxHp: 100 };
    const strangerRoad = { id: 'r-str', buildingId: 50001, ownerId: 'u-stranger', x: 50, y: 49, hp: 100, maxHp: 100 };
    const buildings = [ownRoad, ownPavement, friendRoad, strangerRoad];
    const emptyRes = new Set();

    // walkRoads=true, walkFriendRoads=false: own roads/pavements open; friend/stranger blocked
    const kotoOwnRoads = makeKotofey({ kotofeySettings: normalizeKotofeySettings({ kotofeySettings: { walkRoads: true, walkFriendRoads: false } }) });
    assert.equal(isKotofeyTileBlocked(kotoOwnRoads, 51, 50, buildings, emptyRes, kotofeyContext), false);
    assert.equal(isKotofeyTileBlocked(kotoOwnRoads, 49, 50, buildings, emptyRes, kotofeyContext), false);
    assert.equal(isKotofeyTileBlocked(kotoOwnRoads, 50, 51, buildings, emptyRes, kotofeyContext), true);
    assert.equal(isKotofeyTileBlocked(kotoOwnRoads, 50, 49, buildings, emptyRes, kotofeyContext), true);

    // walkRoads=true, walkFriendRoads=true: friend roads open too; stranger still blocked
    const kotoFriendRoads = makeKotofey({ kotofeySettings: normalizeKotofeySettings({ kotofeySettings: { walkRoads: true, walkFriendRoads: true } }) });
    assert.equal(isKotofeyTileBlocked(kotoFriendRoads, 50, 51, buildings, emptyRes, kotofeyContext), false);
    assert.equal(isKotofeyTileBlocked(kotoFriendRoads, 50, 49, buildings, emptyRes, kotofeyContext), true);

    // walkRoads=false: all 4 neighbors are roads -> all blocked, chooseMonsterBackgroundMove returns null (stands still)
    const kotoNoRoads = makeKotofey({ kotofeySettings: normalizeKotofeySettings({ kotofeySettings: { walkRoads: false, walkFriendRoads: true } }) });
    for (const [nx, ny] of [[51, 50], [49, 50], [50, 51], [50, 49]]) {
        assert.equal(isKotofeyTileBlocked(kotoNoRoads, nx, ny, buildings, emptyRes, kotofeyContext), true);
    }
    const movePlan = chooseMonsterBackgroundMove(
        kotoNoRoads,
        [kotoNoRoads, ...buildings],
        mockBuildingData,
        new Set(['51,50', '49,50', '50,51', '50,49']),
        emptyRes,
        new Map(),
        false,
        undefined,
        { dx: 1, dy: 0 },
        [],
        kotofeyContext
    );
    assert.equal(movePlan.chosenMove, null);
});

test('buildMonsterRuntimeSnapshot respects Kotofey patrol mode and clan repair context', () => {
    const kotofeyContext = {
        allUsers: { u1: { clanId: 5 }, 'u-clan': { clanId: 5 } },
        clans: [],
        localUserUid: 'u1',
        localFriends: [],
    };
    const kotoPatrol = makeKotofey({
        lastMoveTime: 0,
        lastAttackTime: 0,
        kotofeySettings: { ...DEFAULT_KOTOFEY_SETTINGS, repairClan: true },
    });
    const kotoStand = makeKotofey({
        id: 'koto-stand',
        x: 60,
        y: 60,
        monsterMode: 'stand',
    });
    const damagedClanHouse = { id: 'clan-h', buildingId: 1, ownerId: 'u-clan', x: 51, y: 50, hp: 400, maxHp: 1000 };

    const snapshot = buildMonsterRuntimeSnapshot({
        now: 100000,
        buildings: [kotoPatrol, kotoStand, damagedClanHouse],
        buildingData: mockBuildingData,
        monsterLastAction: new Map(),
        monsterAttackTime: new Map(),
        isMonsterHost: () => true,
        isWorldWrapped: false,
        pendingDestroyedIds: new Set(),
        maxMovesPerBatch: 5,
        kotofeyContext,
    });

    assert.equal(snapshot.monstersReadyToAttack.map((m) => m.id).includes('koto-1'), true);
    assert.equal(snapshot.monstersReadyToAttack.map((m) => m.id).includes('koto-stand'), false);
    assert.equal(snapshot.actingMonsters.map((m) => m.id).includes('koto-stand'), false);
});

test('Kotofey data definitions, spawn exclusion, and generated WebP assets exist on disk', () => {
    const buildingsSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'data/buildings.ts'), 'utf8');
    assert.match(buildingsSrc, /id:\s*70007/);
    assert.match(buildingsSrc, /name:\s*'Котофей'/);
    assert.match(buildingsSrc, /price:\s*3300000/);
    assert.match(buildingsSrc, /durability:\s*27432/);
    assert.match(buildingsSrc, /repair:\s*'300'/);
    assert.match(buildingsSrc, /loves:\s*'Подарки'/);
    assert.match(buildingsSrc, /Walks and repair everything that comes to hand: the house, the monsters\. He's a strange…/);

    const itemsSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'data/items.ts'), 'utf8');
    assert.match(itemsSrc, /id:\s*10053/);

    const appSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'App.tsx'), 'utf8');
    const spawnBlockMatch = appSrc.match(/const REGULAR_MONSTER_SPAWN_CONFIG\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(spawnBlockMatch, 'REGULAR_MONSTER_SPAWN_CONFIG block must exist');
    assert.doesNotMatch(spawnBlockMatch[1], /KOTOFEY_ID|70007/);

    const animSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'src/game/monsters/kotofeyAnimationConfig.ts'), 'utf8');
    const baseMatch = animSrc.match(/const KOTOFEY_BASE = '([^']+)';/);
    assert.ok(baseMatch, 'KOTOFEY_BASE must exist');
    const seqRegex = /length:\s*(\d+)[^`]+`\$\{KOTOFEY_BASE\}\/([^`]+)\/\$\{i\}\.webp`/g;
    let totalFrames = 0;
    let match;
    while ((match = seqRegex.exec(animSrc)) !== null) {
        const count = Number(match[1]);
        const dirName = match[2];
        for (let i = 0; i < count; i++) {
            const relPath = `${baseMatch[1]}/${dirName}/${i}.webp`.replace(/^\//, '');
            const absPath = path.join(PROJECT_ROOT, 'public', relPath);
            assert.ok(fs.existsSync(absPath), `Missing WebP animation frame: ${relPath}`);
            totalFrames++;
        }
    }
    assert.equal(totalFrames, 406, `Expected 406 Kotofey frames, got ${totalFrames}`);

    const iconPath = path.join(PROJECT_ROOT, 'public/buildings/Монстры/Котофей/70007.webp');
    assert.ok(fs.existsSync(iconPath), 'Missing Kotofey UI icon 70007.webp');
});
