import assert from 'node:assert';
import {
    ACHIEVEMENTS_DATA,
    ACHIEVEMENT_TIERS_MAP,
    TOTAL_ACHIEVEMENT_TIERS,
    getStatValue,
    checkTierCompletion,
    evaluateAllCompletedTiers,
    findNewlyUnlockedTiers,
    getUnlockedTitles
} from '../src/game/achievements/achievementsData.ts';

console.log('[TEST] Running Achievement System Tests...');

// 1. Verify structure
assert.strictEqual(ACHIEVEMENTS_DATA.length, 15, 'Should have exactly 15 base achievement categories');
assert.strictEqual(TOTAL_ACHIEVEMENT_TIERS, 45, 'Should have exactly 45 tiers (15 * 3)');

const allTierIds = new Set();
const allPrefixes = new Set();

ACHIEVEMENTS_DATA.forEach(category => {
    assert.strictEqual(category.tiers.length, 3, `Category ${category.id} must have 3 tiers`);
    category.tiers.forEach((tier, index) => {
        assert.strictEqual(tier.tier, index + 1, `Tier sequence mismatch in ${category.id}`);
        assert.ok(tier.id, `Tier ID must be defined in ${category.id}`);
        assert.ok(!allTierIds.has(tier.id), `Duplicate tier ID: ${tier.id}`);
        allTierIds.add(tier.id);

        assert.ok(tier.prefix, `Tier prefix must be defined for ${tier.id}`);
        assert.ok(tier.rubies > 0, `Tier rubies reward must be > 0 for ${tier.id}`);
        assert.ok(tier.target > 0, `Tier target must be > 0 for ${tier.id}`);
    });
});

console.log('✓ Structure test passed: 15 categories, 45 tiers with unique IDs and rewards');

// 2. Test Woodcutter progression (15, 100, 500)
const woodStats1 = { treesChopped: 14 };
assert.deepStrictEqual(evaluateAllCompletedTiers(woodStats1), []);

const woodStats2 = { treesChopped: 15 };
assert.ok(evaluateAllCompletedTiers(woodStats2).includes('woodcutter_1'));
assert.ok(!evaluateAllCompletedTiers(woodStats2).includes('woodcutter_2'));

const woodStats3 = { treesChopped: 500 };
const woodCompleted3 = evaluateAllCompletedTiers(woodStats3);
assert.ok(woodCompleted3.includes('woodcutter_1'));
assert.ok(woodCompleted3.includes('woodcutter_2'));
assert.ok(woodCompleted3.includes('woodcutter_3'));
console.log('✓ Woodcutter evaluation passed (15 / 100 / 500 trees)');

// 3. Test Builder progression (1, 10, 50)
assert.ok(evaluateAllCompletedTiers({ buildingsBuilt: 1 }).includes('builder_1'));
assert.ok(evaluateAllCompletedTiers({ buildingsBuilt: 10 }).includes('builder_2'));
assert.ok(evaluateAllCompletedTiers({ buildingsBuilt: 50 }).includes('builder_3'));
console.log('✓ Builder evaluation passed (1 / 10 / 50 buildings)');

// 4. Test Millionaire progression (10k, 100k, 1M)
assert.ok(evaluateAllCompletedTiers({ gold: 10000 }).includes('millionaire_1'));
assert.ok(evaluateAllCompletedTiers({ gold: 100000 }).includes('millionaire_2'));
assert.ok(evaluateAllCompletedTiers({ gold: 1000000 }).includes('millionaire_3'));
console.log('✓ Millionaire evaluation passed (10k / 100k / 1M gold)');

// 5. Test Monster Hunter progression (5, 20, 100)
assert.ok(evaluateAllCompletedTiers({ monstersDestroyed: 5 }).includes('monster_hunter_1'));
assert.ok(evaluateAllCompletedTiers({ monstersDestroyed: 20 }).includes('monster_hunter_2'));
assert.ok(evaluateAllCompletedTiers({ monstersDestroyed: 100 }).includes('monster_hunter_3'));
console.log('✓ Monster Hunter evaluation passed (5 / 20 / 100 monsters)');

// 6. Test Pioneer ranking (<= 1000, <= 500, <= 100)
assert.ok(evaluateAllCompletedTiers({ joinNumber: 999 }).includes('pioneer_1'));
assert.ok(!evaluateAllCompletedTiers({ joinNumber: 999 }).includes('pioneer_2'));

assert.ok(evaluateAllCompletedTiers({ joinNumber: 450 }).includes('pioneer_1'));
assert.ok(evaluateAllCompletedTiers({ joinNumber: 450 }).includes('pioneer_2'));
assert.ok(!evaluateAllCompletedTiers({ joinNumber: 450 }).includes('pioneer_3'));

assert.ok(evaluateAllCompletedTiers({ joinNumber: 42 }).includes('pioneer_1'));
assert.ok(evaluateAllCompletedTiers({ joinNumber: 42 }).includes('pioneer_2'));
assert.ok(evaluateAllCompletedTiers({ joinNumber: 42 }).includes('pioneer_3'));
console.log('✓ Pioneer evaluation passed (top 1000 / 500 / 100 players)');

// 7. Test Time Master (5h, 15h, 20h per day)
// 5 hours = 18000s, 15 hours = 54000s, 20 hours = 72000s
assert.ok(evaluateAllCompletedTiers({ playTimeTodaySeconds: 5 * 3600 }).includes('time_master_1'));
assert.ok(evaluateAllCompletedTiers({ playTimeTodaySeconds: 15 * 3600 }).includes('time_master_2'));
assert.ok(evaluateAllCompletedTiers({ playTimeTodaySeconds: 20 * 3600 }).includes('time_master_3'));
console.log('✓ Time Master evaluation passed (5h / 15h / 20h in a day)');

// 8. Test Login Days (1, 7, 30 days)
assert.ok(evaluateAllCompletedTiers({ totalLoginDays: 1 }).includes('login_days_1'));
assert.ok(evaluateAllCompletedTiers({ totalLoginDays: 7 }).includes('login_days_2'));
assert.ok(evaluateAllCompletedTiers({ totalLoginDays: 30 }).includes('login_days_3'));
console.log('✓ Login Days evaluation passed (1 / 7 / 30 days)');

// 9. Test findNewlyUnlockedTiers
const existingTiers = ['woodcutter_1'];
const currentStats = { treesChopped: 150 };
const newlyUnlocked = findNewlyUnlockedTiers(currentStats, existingTiers);
assert.strictEqual(newlyUnlocked.length, 1);
assert.strictEqual(newlyUnlocked[0].id, 'woodcutter_2');
assert.strictEqual(newlyUnlocked[0].prefix, 'Старший лесоруб');
console.log('✓ findNewlyUnlockedTiers correctly returns newly completed tiers');

// 10. Test getUnlockedTitles
const unlockedTitles = getUnlockedTitles(['woodcutter_1', 'millionaire_3', 'pioneer_3']);
assert.ok(unlockedTitles.includes('Младший лесоруб'));
assert.ok(unlockedTitles.includes('Магнат'));
assert.ok(unlockedTitles.includes('Первый среди первых'));
console.log('✓ getUnlockedTitles correctly extracts all prefixes/titles');

console.log('\n[SUCCESS] ALL ACHIEVEMENT TESTS PASSED PERFECTLY!\n');
