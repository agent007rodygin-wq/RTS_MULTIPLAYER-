/**
 * Characterization Scenario 26 — Monster Spawn Planning Extraction
 */

import { ok, strictEqual, deepEqual } from 'node:assert/strict';

const GORYNYCH_ID = 70003;
const KILLING_HUT_ID = 70001;
const KIND_SANTA_ID = 70002;
const KOLOBOK_ID = 70004;
const BABA_YAGA_ID = 70005;
const BRONEKUR_ID = 70006;
const ZONES_X = 5;
const ZONES_Y = 5;

const REGULAR_MONSTER_SPAWN_CONFIG = [
    { typeId: GORYNYCH_ID, count: 1, name: 'горыныч' },
    { typeId: KILLING_HUT_ID, count: 1, name: 'избушка' },
    { typeId: KIND_SANTA_ID, count: 1, name: 'санта' },
    { typeId: KOLOBOK_ID, count: 1, name: 'колобок' },
    { typeId: BABA_YAGA_ID, count: 1, name: 'баба яга' }
];

const getRegularMonsterPlanForZone = (zoneX, zoneY) => {
    const excludedIndex = ((zoneY * ZONES_X) + zoneX) % REGULAR_MONSTER_SPAWN_CONFIG.length;
    return REGULAR_MONSTER_SPAWN_CONFIG.filter((_, index) => index !== excludedIndex);
};

const getRegularMonsterId = (typeId, slot, zoneId) => `m${typeId}s${slot}z${zoneId}`;

const getBronekurHomeZoneId = () => `${Math.floor(ZONES_X / 2)}_${Math.floor(ZONES_Y / 2)}`;

const getBronekurMonsterId = () => `m${BRONEKUR_ID}s1z${getBronekurHomeZoneId()}`;

// ═══════════════════════════════════════════
// REGULAR_MONSTER_SPAWN_CONFIG
// ═══════════════════════════════════════════
{
    strictEqual(REGULAR_MONSTER_SPAWN_CONFIG.length, 5, '5 monster types');
    strictEqual(REGULAR_MONSTER_SPAWN_CONFIG[0].typeId, GORYNYCH_ID, 'first is Gorynych');
    strictEqual(REGULAR_MONSTER_SPAWN_CONFIG[1].typeId, KILLING_HUT_ID, 'second is Izbushka');
    strictEqual(REGULAR_MONSTER_SPAWN_CONFIG[2].typeId, KIND_SANTA_ID, 'third is Santa');
    strictEqual(REGULAR_MONSTER_SPAWN_CONFIG[3].typeId, KOLOBOK_ID, 'fourth is Kolobok');
    strictEqual(REGULAR_MONSTER_SPAWN_CONFIG[4].typeId, BABA_YAGA_ID, 'fifth is Baba Yaga');
    const ids = REGULAR_MONSTER_SPAWN_CONFIG.map(c => c.typeId);
    strictEqual(new Set(ids).size, 5, 'no duplicate IDs');
}

// ═══════════════════════════════════════════
// getRegularMonsterPlanForZone
// ═══════════════════════════════════════════
{
    // Zone (0,0): excludedIndex = 0 → Gorynych excluded, returns [1,2,3,4]
    const p1 = getRegularMonsterPlanForZone(0, 0);
    strictEqual(p1.length, 4, '4 types returned');
    strictEqual(p1[0].typeId, KILLING_HUT_ID, 'zone(0,0) first is Izbushka');

    // Zone (4,4): excludedIndex = (4*5+4)%5 = 24%5 = 4 → Baba Yaga excluded
    const p2 = getRegularMonsterPlanForZone(4, 4);
    strictEqual(p2.length, 4, 'zone(4,4) 4 types');
    strictEqual(p2[3].typeId, KOLOBOK_ID, 'zone(4,4) last is Kolobok');

    // Zone (2,2): excludedIndex = (2*5+2)%5 = 12%5 = 2 → Santa excluded
    const p3 = getRegularMonsterPlanForZone(2, 2);
    strictEqual(p3.length, 4, 'center zone 4 types');
    strictEqual(p3.find(c => c.typeId === KIND_SANTA_ID), undefined, 'Santa excluded from center');

    // Deterministic
    const r1 = getRegularMonsterPlanForZone(1, 3);
    const r2 = getRegularMonsterPlanForZone(1, 3);
    deepEqual(r1, r2, 'deterministic repeat');

    // Does not mutate config
    const copy = [...REGULAR_MONSTER_SPAWN_CONFIG];
    getRegularMonsterPlanForZone(0, 0);
    deepEqual(REGULAR_MONSTER_SPAWN_CONFIG, copy, 'config not mutated');
}

// ═══════════════════════════════════════════
// getRegularMonsterId
// ═══════════════════════════════════════════
{
    strictEqual(getRegularMonsterId(GORYNYCH_ID, 1, '2_2'), 'm70003s1z2_2', 'Gorynych ID');
    strictEqual(getRegularMonsterId(KILLING_HUT_ID, 3, '0_4'), 'm70001s3z0_4', 'Izbushka ID');
    strictEqual(getRegularMonsterId(BABA_YAGA_ID, 2, '4_0'), 'm70005s2z4_0', 'Baba Yaga ID');
    strictEqual(getRegularMonsterId(70001, 1, '2_2'), getRegularMonsterId(70001, 1, '2_2'), 'deterministic');
}

// ═══════════════════════════════════════════
// getBronekurHomeZoneId
// ═══════════════════════════════════════════
{
    strictEqual(getBronekurHomeZoneId(), '2_2', 'center of 5x5 world');
    strictEqual(getBronekurHomeZoneId(), getBronekurHomeZoneId(), 'deterministic');
}

// ═══════════════════════════════════════════
// getBronekurMonsterId
// ═══════════════════════════════════════════
{
    strictEqual(getBronekurMonsterId(), 'm70006s1z2_2', 'bronekur boss ID');
    strictEqual(getBronekurMonsterId(), getBronekurMonsterId(), 'deterministic');
}

console.log('✅ Scenario 26 — all assertions passed');
