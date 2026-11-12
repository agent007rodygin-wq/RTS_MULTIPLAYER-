import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    KOTOFEY_ID,
    TROLL_ID,
    AIBOLIT_ID,
    BIG_AIBOLIT_ID,
    GORYNYCH_ID,
} from '../src/game/monsters/monsterIds.js';
import { REGULAR_MONSTER_SPAWN_CONFIG } from '../src/game/monsters/monsterSpawnPlanning.js';
import { MONSTER_MOVE_INTERVALS, getMonsterMoveInterval } from '../src/game/monsters/monsterMovement.js';
import {
    KOTOFEY_ITEM_ID,
    TROLL_ITEM_ID,
    AIBOLIT_ITEM_ID,
    ACADEMY_CRAFTABLE_MONSTER_ITEM_BY_BUILDING_ID,
    isHealerMonster,
    isRoadCapableCustomMonster,
    getKotofeyRepairAmount,
    isKotofeyTileBlocked,
} from '../src/game/monsters/kotofeyLogic.js';
import {
    DEFENDER_STATUE_LEVEL_BY_ID,
    WARRIOR_STATUE_LEVEL_BY_ID,
    getDefenderStatueLevel,
    getWarriorStatueLevel,
    getOwnerMaxDefenderStatueLevel,
    getOwnerMaxWarriorStatueLevel,
    getAibolitBaseRepair,
    getBigAibolitBaseRepair,
    getTrollDamageToBuilding,
    getTrollDamageToMonster,
    getCustomMonsterScaledStats,
} from '../src/game/monsters/statueBonusLogic.js';
import {
    TROLL_PRICE_GOLD,
    TROLL_WORK_BOOST_COOLDOWN_MS,
    TROLL_WORK_BOOST_REDUCE_MS,
    FARM_TIER_DAMAGE_MAP,
    isTrollMonster,
    isFarmOrPlantationBuilding,
    getTrollWorkSelfDamage,
    getTrollAdjacentProductionTarget,
    resolveTrollProductionWhip,
    getTrollCombatDamage,
} from '../src/game/monsters/trollLogic.js';
import {
    TROLL_ANIMATION_SPEC,
    AIBOLIT_ANIMATION_SPEC,
    BIG_AIBOLIT_ANIMATION_SPEC,
} from '../src/game/monsters/newMonstersAnimationConfig.ts';
import {
    getMonsterAdjacentAttackTarget,
    getMonsterChaseTarget,
} from '../src/game/monsters/monsterTargetSelection.js';
import { chooseMonsterBackgroundMove } from '../src/game/monsters/monsterBackgroundMove.js';
import { resolvePlacedBuildingSnapshotMerge } from '../src/game/buildings/resolveBuildingSnapshotMerge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

function extractBuildingBlock(src, buildingId) {
    const startIdx = src.search(new RegExp(`\\bid:\\s*${buildingId}\\s*,`));
    assert.notEqual(startIdx, -1, `Could not find building ${buildingId} in data/buildings.ts`);
    const nextIdx = src.indexOf('\n    id:', startIdx + 10);
    return src.slice(Math.max(0, startIdx - 12), nextIdx === -1 ? src.length : nextIdx);
}

function parseItemsMap(itemsSrc) {
    const map = new Map();
    const re = /id:\s*(\d+)[\s\S]*?name:\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(itemsSrc)) !== null) {
        map.set(Number(m[1]), m[2]);
    }
    return map;
}

const mockBuildingData = [
    {
        id: KOTOFEY_ID,
        name: 'Котофей',
        category: 'Монстры',
        stats: { isMonster: true, durability: 27432, repair: '300', loves: 'Подарки' },
    },
    {
        id: TROLL_ID,
        name: 'Тролль',
        category: 'Монстры',
        stats: { isMonster: true, durability: 2800, damage: '4', hates: 'Грядки' },
    },
    {
        id: AIBOLIT_ID,
        name: 'Айболит',
        category: 'Монстры',
        stats: { isMonster: true, durability: 2248, repair: '5', loves: 'Монстры' },
    },
    {
        id: BIG_AIBOLIT_ID,
        name: 'Большой Айболит',
        category: 'Монстры',
        stats: { isMonster: true, durability: 10072, repair: '50', loves: 'Хранилища монет' },
    },
    { id: GORYNYCH_ID, name: 'Горыныч', category: 'Монстры', stats: { isMonster: true, durability: 500 } },
    { id: 1, name: 'Дом', category: 'Дома', stats: { durability: 1000 } },
    { id: 27, name: 'Хранилище монет', type: 'storage', category: 'Бизнес', stats: { durability: 1000 } },
    { id: 41, name: 'Хранилище монет 2', type: 'storage', category: 'Бизнес', stats: { durability: 2000 } },
    { id: 70, name: 'Грядка грибов', category: 'Грядки', stats: { durability: 500 } },
    { id: 71, name: 'Грибы росток', category: 'Бизнес', stats: { durability: 500 } },
    { id: 600, name: 'Атомная грядка', category: 'Грядки', stats: { durability: 500 } },
    { id: 200, name: 'Кузница', category: 'Заводы', stats: { durability: 1200 } },
    { id: 689, name: 'Академия монстров', category: 'Заводы', stats: { durability: 5000 } },
];

test('data integrity: buildings, canonical item names, Academy craftability, spawn exclusion, and WebP assets on disk', () => {
    const buildingsSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'data/buildings.ts'), 'utf8');
    const itemsSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'data/items.ts'), 'utf8');
    const canonicalItems = parseItemsMap(itemsSrc);

    const trollBlock = extractBuildingBlock(buildingsSrc, TROLL_ID);
    const aibolitBlock = extractBuildingBlock(buildingsSrc, AIBOLIT_ID);
    const bigAibolitBlock = extractBuildingBlock(buildingsSrc, BIG_AIBOLIT_ID);
    const kotofeyBlock = extractBuildingBlock(buildingsSrc, KOTOFEY_ID);

    assert.match(trollBlock, /name:\s*'Тролль'/);
    assert.match(trollBlock, /price:\s*700000/);
    assert.match(trollBlock, /durability:\s*2800/);
    assert.match(trollBlock, /hates:\s*'Грядки'/);
    assert.match(trollBlock, /givesCoins:\s*13538/);
    assert.match(trollBlock, /Angry and clumsy/);

    assert.match(aibolitBlock, /name:\s*'Айболит'/);
    assert.match(aibolitBlock, /price:\s*50000/);
    assert.match(aibolitBlock, /durability:\s*2248/);
    assert.match(aibolitBlock, /loves:\s*'Монстры'/);
    assert.match(aibolitBlock, /givesCoins:\s*3260/);
    assert.match(aibolitBlock, /He loves and treats animals all/);

    assert.match(bigAibolitBlock, /name:\s*'Большой Айболит'/);
    assert.match(bigAibolitBlock, /price:\s*1000000/);
    assert.match(bigAibolitBlock, /durability:\s*10072/);
    assert.match(bigAibolitBlock, /loves:\s*'Хранилища монет'/);
    assert.match(bigAibolitBlock, /givesCoins:\s*13538/);
    assert.match(bigAibolitBlock, /Senior Doctor saves buildings/);

    // Verify every resource/drop { id, name } inside blocks 70007..70010 matches canonical data/items.ts name
    const entryRe = /\{\s*id:\s*(\d+)\s*,\s*name:\s*'([^']+)'/g;
    for (const [label, block] of [
        ['70007', kotofeyBlock],
        ['70008', trollBlock],
        ['70009', aibolitBlock],
        ['70010', bigAibolitBlock],
    ]) {
        const reqIdx = block.indexOf('constructionRequirements');
        const subBlock = reqIdx >= 0 ? block.slice(reqIdx) : block;
        entryRe.lastIndex = 0;
        let em;
        let checked = 0;
        while ((em = entryRe.exec(subBlock)) !== null) {
            const id = Number(em[1]);
            const name = em[2];
            if (id === 999) {
                assert.equal(name, 'Монеты');
                checked++;
                continue;
            }
            const expected = canonicalItems.get(id);
            assert.ok(expected, `Monster ${label} references unknown item id ${id} (${name})`);
            assert.equal(name, expected, `Monster ${label} item ${id} name mismatch: got '${name}', expected '${expected}'`);
            checked++;
        }
        assert.ok(checked >= 3, `Expected item references in monster ${label}`);
    }

    // Inventory items & Academy map
    assert.equal(canonicalItems.get(TROLL_ITEM_ID), 'Тролль');
    assert.equal(canonicalItems.get(AIBOLIT_ITEM_ID), 'Айболит');
    assert.equal(ACADEMY_CRAFTABLE_MONSTER_ITEM_BY_BUILDING_ID[KOTOFEY_ID], KOTOFEY_ITEM_ID);
    assert.equal(ACADEMY_CRAFTABLE_MONSTER_ITEM_BY_BUILDING_ID[TROLL_ID], TROLL_ITEM_ID);
    assert.equal(ACADEMY_CRAFTABLE_MONSTER_ITEM_BY_BUILDING_ID[AIBOLIT_ID], AIBOLIT_ITEM_ID);
    assert.equal(ACADEMY_CRAFTABLE_MONSTER_ITEM_BY_BUILDING_ID[BIG_AIBOLIT_ID], undefined);

    // None of 70007..70010 auto-spawn in REGULAR_MONSTER_SPAWN_CONFIG or App.tsx wild list
    const spawnIds = new Set(REGULAR_MONSTER_SPAWN_CONFIG.map(c => c.typeId));
    const appSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'App.tsx'), 'utf8');
    const spawnBlockMatch = appSrc.match(/const REGULAR_MONSTER_SPAWN_CONFIG\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(spawnBlockMatch);
    assert.doesNotMatch(spawnBlockMatch[1], /KOTOFEY_ID|TROLL_ID|AIBOLIT_ID|BIG_AIBOLIT_ID|70007|70008|70009|70010/);

    for (const id of [KOTOFEY_ID, TROLL_ID, AIBOLIT_ID, BIG_AIBOLIT_ID]) {
        assert.equal(spawnIds.has(id), false, `Monster ${id} must not auto-spawn`);
        assert.equal(MONSTER_MOVE_INTERVALS[id], 22000);
        const jittered = getMonsterMoveInterval(id, `m${id}`);
        assert.ok(jittered >= 18040 && jittered <= 25960, `Expected jittered interval around 22000 for ${id}, got ${jittered}`);
        assert.equal(isRoadCapableCustomMonster(id), true);
    }

    // Verify UI icons & all extracted WebP frames exist on disk
    for (const iconRel of [
        '/buildings/Монстры/Тролль/70008.webp',
        '/buildings/Монстры/Айболит/70009.webp',
        '/buildings/Монстры/Большой Айболит/70010.webp',
    ]) {
        const iconPath = path.join(PROJECT_ROOT, 'public', iconRel.replace(/^\//, ''));
        assert.equal(fs.existsSync(iconPath), true, `Missing UI icon: ${iconPath}`);
        assert.ok(fs.statSync(iconPath).size > 0, `Empty UI icon: ${iconPath}`);
    }

    for (const spec of [TROLL_ANIMATION_SPEC, AIBOLIT_ANIMATION_SPEC, BIG_AIBOLIT_ANIMATION_SPEC]) {
        assert.equal(spec.fps, 24);
        assert.ok(spec.allAnimationFrames.length > 100);
        for (const frameRel of spec.allAnimationFrames) {
            const fullPath = path.join(PROJECT_ROOT, 'public', frameRel.replace(/^\//, ''));
            assert.equal(fs.existsSync(fullPath), true, `Missing animation frame: ${fullPath}`);
        }
    }
});

test('defender & warrior statue ID maps and exact scaling tables across all levels', () => {
    assert.equal(Object.keys(DEFENDER_STATUE_LEVEL_BY_ID).length, 20);
    assert.equal(getDefenderStatueLevel(48901), 1);
    for (let lvl = 2; lvl <= 20; lvl++) {
        assert.equal(getDefenderStatueLevel(51101 + (lvl - 2) * 100), lvl);
    }

    assert.equal(Object.keys(WARRIOR_STATUE_LEVEL_BY_ID).length, 21);
    for (let lvl = 1; lvl <= 10; lvl++) {
        assert.equal(getWarriorStatueLevel(49001 + (lvl - 1) * 100), lvl);
    }
    assert.equal(getWarriorStatueLevel(50011), 11);
    for (let lvl = 12; lvl <= 21; lvl++) {
        assert.equal(getWarriorStatueLevel(50101 + (lvl - 12) * 100), lvl);
    }

    assert.equal(getAibolitBaseRepair(0), 5);
    for (let lvl = 1; lvl <= 20; lvl++) {
        assert.equal(getAibolitBaseRepair(lvl), 5 + Math.ceil(lvl / 2));
    }
    assert.equal(getAibolitBaseRepair(20), 15);

    assert.equal(getBigAibolitBaseRepair(0), 50);
    for (let lvl = 1; lvl <= 20; lvl++) {
        assert.equal(getBigAibolitBaseRepair(lvl), 60 + (lvl - 1) * 5);
    }
    assert.equal(getBigAibolitBaseRepair(20), 155);

    const expectedBuildingDmg = [4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12];
    const expectedMonsterDmg = [2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6];
    for (let lvl = 0; lvl <= 21; lvl++) {
        assert.equal(getTrollDamageToBuilding(lvl), expectedBuildingDmg[lvl]);
        assert.equal(getTrollDamageToMonster(lvl), expectedMonsterDmg[lvl]);
    }

    const now = 1000000;
    const buildings = [
        { id: 'def1', buildingId: 48901, ownerId: 'p1', hp: 100 },
        { id: 'def10', buildingId: 51901, ownerId: 'p1', hp: 100, isConstructing: true, constructionEndTime: now + 5000 },
        { id: 'def20', buildingId: 52901, ownerId: 'p2', hp: 100 },
        { id: 'war4', buildingId: 49301, ownerId: 'p1', hp: 100 },
        { id: 'war21', buildingId: 51001, ownerId: 'p1', hp: 0 },
        { id: 'war19', buildingId: 50801, ownerId: 'p1', hp: 100, isDestroying: true },
    ];
    assert.equal(getOwnerMaxDefenderStatueLevel('p1', buildings, now), 1);
    assert.equal(getOwnerMaxWarriorStatueLevel('p1', buildings, now), 4);
    assert.equal(getCustomMonsterScaledStats({ buildingId: AIBOLIT_ID, ownerId: 'p1', buildings, now }).baseRepair, 6);
    assert.equal(getCustomMonsterScaledStats({ buildingId: BIG_AIBOLIT_ID, ownerId: 'p1', buildings, now }).lovedRepair, 120);
    assert.equal(getCustomMonsterScaledStats({ buildingId: TROLL_ID, ownerId: 'p1', buildings, now }).damageToBuilding, 6);
    assert.equal(getCustomMonsterScaledStats({ buildingId: TROLL_ID, ownerId: 'p1', buildings, now }).damageToMonster, 3);
});

test('Small Aibolit (70009): loves Monsters (2x + anti-distraction), statue scaling, and ally-only filter', () => {
    assert.equal(isHealerMonster(AIBOLIT_ID), true);
    const aibolitInfo = mockBuildingData.find(b => b.id === AIBOLIT_ID);
    const kotofeyInfo = mockBuildingData.find(b => b.id === KOTOFEY_ID);

    const buildings = [
        { id: 'aib1', buildingId: AIBOLIT_ID, ownerId: 'p1', x: 10, y: 10, hp: 2248, monsterMode: 'patrol' },
        { id: 'def4', buildingId: 51301, ownerId: 'p1', x: 5, y: 5, hp: 100 }, // Defender lvl 4 -> base 7, loved 14
        { id: 'house1', buildingId: 1, ownerId: 'p1', x: 10, y: 11, hp: 500, maxHp: 1000 },
        { id: 'allyKotofey', buildingId: KOTOFEY_ID, ownerId: 'p1', x: 14, y: 10, hp: 1000, maxHp: 27432 },
        { id: 'wildMonster', buildingId: GORYNYCH_ID, ownerId: 'monster', x: 11, y: 10, hp: 10, maxHp: 100 },
        { id: 'enemyKotofey', buildingId: KOTOFEY_ID, ownerId: 'p2', x: 9, y: 10, hp: 10, maxHp: 27432 },
    ];

    // Anti-distraction: skips adjacent house while damaged ally monster is within 10 tiles
    assert.equal(getMonsterAdjacentAttackTarget(buildings[0], buildings, mockBuildingData), null);
    assert.equal(getMonsterChaseTarget(buildings[0], buildings, mockBuildingData)?.id, 'allyKotofey');

    // Moves adjacent -> heals allyKotofey by 14 (7 * 2)
    const movedAibolit = { ...buildings[0], x: 13, y: 10 };
    const adjTarget = getMonsterAdjacentAttackTarget(movedAibolit, buildings, mockBuildingData);
    assert.equal(adjTarget?.id, 'allyKotofey');
    const heal = getKotofeyRepairAmount(aibolitInfo, kotofeyInfo, adjTarget, {
        monster: movedAibolit,
        allBuildings: buildings,
    });
    assert.equal(heal, 14);
});

test('Big Aibolit (70010): loves Storages including 27/41 (2x + anti-distraction) and Defender scaling', () => {
    assert.equal(isHealerMonster(BIG_AIBOLIT_ID), true);
    const bigInfo = mockBuildingData.find(b => b.id === BIG_AIBOLIT_ID);
    const storage27Info = mockBuildingData.find(b => b.id === 27);

    const buildings = [
        { id: 'big1', buildingId: BIG_AIBOLIT_ID, ownerId: 'p1', x: 10, y: 10, hp: 10072, monsterMode: 'patrol' },
        { id: 'def2', buildingId: 51101, ownerId: 'p1', x: 5, y: 5, hp: 100 }, // Defender lvl 2 -> base 65, loved 130
        { id: 'house1', buildingId: 1, ownerId: 'p1', x: 11, y: 10, hp: 500, maxHp: 1000 },
        { id: 'stor27', buildingId: 27, ownerId: 'p1', x: 13, y: 10, hp: 200, maxHp: 1000 },
    ];

    assert.equal(getMonsterAdjacentAttackTarget(buildings[0], buildings, mockBuildingData), null);
    assert.equal(getMonsterChaseTarget(buildings[0], buildings, mockBuildingData)?.id, 'stor27');

    const adjBig = { ...buildings[0], x: 12, y: 10 };
    const heal = getKotofeyRepairAmount(bigInfo, storage27Info, buildings[3], {
        monster: adjBig,
        allBuildings: buildings,
    });
    assert.equal(heal, 130);
});

test('Troll (70008): patrol combat, hated farms 2x + anti-distraction, monster combat, toggles, and roads', () => {
    assert.equal(isTrollMonster(TROLL_ID), true);
    const now = 500000;

    const troll = {
        id: 'troll1',
        buildingId: TROLL_ID,
        ownerId: 'p1',
        x: 10,
        y: 10,
        hp: 2800,
        monsterMode: 'patrol',
        trollSettings: {
            attackEnabled: true,
            walkRoads: false,
            walkFriendRoads: false,
            attackClan: false,
            attackFriends: false,
            attackNeutralMonsters: true,
            attackPlayerMonsters: false,
            boostOwnProduction: true,
        },
    };

    const buildings = [
        troll,
        { id: 'war9', buildingId: 49801, ownerId: 'p1', hp: 100 }, // Warrior lvl 9 -> bld 8 (farm 16), monster 4
        { id: 'enemyHouse', buildingId: 1, ownerId: 'enemy', x: 11, y: 10, hp: 500 },
        { id: 'enemyFarm', buildingId: 71, ownerId: 'enemy', x: 13, y: 10, hp: 500 }, // Hated crop stage!
        { id: 'wildMon', buildingId: GORYNYCH_ID, ownerId: 'monster', x: 10, y: 11, hp: 400 },
        { id: 'enemyMon', buildingId: KOTOFEY_ID, ownerId: 'enemy', x: 9, y: 10, hp: 400 },
        { id: 'clanHouse', buildingId: 1, ownerId: 'clanmate', x: 10, y: 9, hp: 500 },
    ];

    const ctx = {
        kotofeyContext: {
            allUsers: { p1: { clanId: 'c1' }, clanmate: { clanId: 'c1' } },
        },
    };

    assert.equal(getMonsterAdjacentAttackTarget(troll, buildings, mockBuildingData, ctx), null);
    assert.equal(getMonsterChaseTarget(troll, buildings, mockBuildingData, ctx)?.id, 'enemyFarm');

    assert.equal(getTrollCombatDamage(troll, buildings[2], buildings, mockBuildingData, now), 8);
    assert.equal(getTrollCombatDamage(troll, buildings[3], buildings, mockBuildingData, now), 16);
    assert.equal(getTrollCombatDamage(troll, buildings[4], buildings, mockBuildingData, now), 4);

    const noFarmBuildings = buildings.filter(b => b.id !== 'enemyFarm');
    const chosen = getMonsterAdjacentAttackTarget(troll, noFarmBuildings, mockBuildingData, ctx);
    assert.ok(chosen?.id === 'wildMon' || chosen?.id === 'enemyHouse');

    const passiveTroll = { ...troll, trollSettings: { ...troll.trollSettings, attackEnabled: false } };
    assert.equal(getMonsterAdjacentAttackTarget(passiveTroll, buildings, mockBuildingData, ctx), null);
    assert.equal(getMonsterChaseTarget(passiveTroll, buildings, mockBuildingData, ctx), null);

    const ownRoad = { id: 'road1', buildingId: 50001, ownerId: 'p1', x: 10, y: 11, hp: 100 };
    assert.equal(isKotofeyTileBlocked(troll, 10, 11, [troll, ownRoad], new Set(), ctx.kotofeyContext), true);
    const roadTroll = { ...troll, trollSettings: { ...troll.trollSettings, walkRoads: true } };
    assert.equal(isKotofeyTileBlocked(roadTroll, 10, 11, [troll, ownRoad], new Set(), ctx.kotofeyContext), false);

    const movePlan = chooseMonsterBackgroundMove(
        roadTroll,
        [roadTroll, ownRoad],
        mockBuildingData,
        new Set(['10,10']),
        new Set(),
        new Map(),
        false,
        null,
        null,
        [],
        ctx.kotofeyContext
    );
    assert.ok(movePlan && 'chosenMove' in movePlan);
});

test('Troll (70008): 40s worker whip speedup (-5s), academy exclusion, and all 8 farm tier damages', () => {
    const now = 1000000;
    const factory = mockBuildingData.find(b => b.id === 200);
    const atomicBed = mockBuildingData.find(b => b.id === 600);

    const troll = {
        id: 'troll1',
        buildingId: TROLL_ID,
        ownerId: 'p1',
        x: 10,
        y: 10,
        hp: 2800,
        monsterMode: 'stand',
    };

    const academyOnly = [
        troll,
        { id: 'acad', buildingId: 689, ownerId: 'p1', x: 11, y: 10, hp: 5000, workState: 'working', workEndTime: now + 60000 },
    ];
    assert.equal(getTrollAdjacentProductionTarget(troll, academyOnly, mockBuildingData, { now }), null);

    const withFactory = [
        ...academyOnly,
        { id: 'fac1', buildingId: factory.id, ownerId: 'p1', x: 10, y: 11, hp: 1000, maxHp: 1000, workState: 'working', workEndTime: now + 30000 },
    ];
    const target = getTrollAdjacentProductionTarget(troll, withFactory, mockBuildingData, { now });
    assert.equal(target?.id, 'fac1');

    const whipNoDmg = resolveTrollProductionWhip(target, factory, now, () => 0.8);
    assert.equal(whipNoDmg.nextWorkEndTime, now + 30000 - TROLL_WORK_BOOST_REDUCE_MS);
    assert.equal(whipNoDmg.selfDamage, 0);
    assert.equal(whipNoDmg.nextHp, 1000);

    const whipWithDmg = resolveTrollProductionWhip(target, factory, now, () => 0.2);
    assert.equal(whipWithDmg.nextWorkEndTime, now + 25000);
    assert.equal(whipWithDmg.selfDamage, getTrollWorkSelfDamage(factory.id, factory));
    assert.equal(whipWithDmg.nextHp, 1000 - whipWithDmg.selfDamage);

    const expectedFarmTiers = [
        [400, 2], [577, 2],
        [70, 3], [874, 3],
        [82, 10],
        [102, 15],
        [240, 30],
        [274, 50],
        [313, 100],
        [600, 150], [617, 150], [636, 150],
    ];
    for (const [bid, dmg] of expectedFarmTiers) {
        assert.equal(FARM_TIER_DAMAGE_MAP.get(bid), dmg, `Farm ${bid} self-damage mismatch`);
        assert.equal(isFarmOrPlantationBuilding(bid), true);
        assert.equal(getTrollWorkSelfDamage(bid), dmg);
    }

    const fragileFarm = { id: 'f1', buildingId: 600, hp: 50, maxHp: 500, workEndTime: now + 3000 };
    const fatalWhip = resolveTrollProductionWhip(fragileFarm, atomicBed, now, () => 0.1);
    assert.equal(fatalWhip.nextWorkEndTime, now);
    assert.equal(fatalWhip.selfDamage, 150);
    assert.equal(fatalWhip.nextHp, 0);
    assert.equal(fatalWhip.targetDestroyed, true);

    assert.equal(TROLL_PRICE_GOLD, 700000);
    assert.equal(TROLL_WORK_BOOST_COOLDOWN_MS, 40000);
});

test('snapshot merge preserves trollSettings and lastTrollBoostAt', () => {
    const now = 500000;
    const local = {
        id: 'troll1',
        buildingId: TROLL_ID,
        ownerId: 'p1',
        x: 10,
        y: 10,
        hp: 2800,
        lastTrollBoostAt: now - 1000,
        trollSettings: { attackEnabled: false, boostOwnProduction: true },
    };
    const server = {
        id: 'troll1',
        buildingId: TROLL_ID,
        ownerId: 'p1',
        x: 10,
        y: 10,
        hp: 2800,
        lastTrollBoostAt: now - 20000,
    };
    const res = resolvePlacedBuildingSnapshotMerge({
        serverBuilding: server,
        localBuilding: local,
        currentUserId: 'p1',
        now,
        lastInteractionAt: now - 1000,
        lastMoveAt: 0,
        localIsProtectedByCombat: false,
        stickyInteractionMs: 5000,
        deletionProtectionMs: 10000,
    });
    assert.equal(res.mergedBuilding.lastTrollBoostAt, now - 1000);
    assert.deepEqual(res.mergedBuilding.trollSettings, local.trollSettings);
});
