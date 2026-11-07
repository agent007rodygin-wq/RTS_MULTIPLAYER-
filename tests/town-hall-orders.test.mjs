import test from 'node:test';
import assert from 'node:assert/strict';
import {
    generateTownHallOrder,
    generateThreeTownHallOrders,
    getCurrentOrdersCycle,
    getTimeUntilNextOrdersCycle,
    isOrderSkipAvailable,
    getTimeUntilSkipAvailable,
    canFulfillTownHallOrder,
    normalizeTownHallOrder,
    CYCLE_DURATION_MS,
    SKIP_COOLDOWN_MS
} from '../src/game/townHallOrders/townHallOrdersLogic.ts';

test('Town Hall Orders - Basic Generation', () => {
    const orders = generateThreeTownHallOrders(1, 1, 100);
    assert.equal(orders.length, 3, 'Should generate exactly 3 orders');

    for (const order of orders) {
        assert.ok(order.title, 'Order must have title');
        assert.ok(order.description, 'Order must have description');
        assert.ok(order.requirements.length >= 2, 'Order must require at least 2 resources');
        assert.ok(order.rewardGold > 0, 'Order must reward gold');
        assert.ok(order.rewardGlory > 0, 'Order must reward glory');
        assert.equal(order.completed, false, 'Initial state should be incomplete');

        // STRICT REQUIREMENT: No rubies in rewards!
        for (const item of order.rewardItems) {
            assert.notEqual(item.id, 10014, 'STRICT: Reward item must never be a Ruby!');
            assert.ok(item.amount > 0, 'Item amount must be positive');
        }
    }
});

test('Town Hall Orders - Progression Scaling (Tier 1 vs Tier 5)', () => {
    const lowTierOrders = generateThreeTownHallOrders(1, 1, 100);
    const highTierOrders = generateThreeTownHallOrders(20, 25, 100);

    // Compare gold rewards
    const lowAvgGold = lowTierOrders.reduce((sum, o) => sum + o.rewardGold, 0) / 3;
    const highAvgGold = highTierOrders.reduce((sum, o) => sum + o.rewardGold, 0) / 3;
    assert.ok(highAvgGold > lowAvgGold * 5, 'High tier Town Hall must yield significantly more gold');

    // Compare glory rewards
    const lowAvgGlory = lowTierOrders.reduce((sum, o) => sum + o.rewardGlory, 0) / 3;
    const highAvgGlory = highTierOrders.reduce((sum, o) => sum + o.rewardGlory, 0) / 3;
    assert.ok(highAvgGlory > lowAvgGlory * 3, 'High tier Town Hall must yield significantly more glory');

    // Tier 1 firecracker reward must be modest (<= 2)
    for (const order of lowTierOrders) {
        for (const item of order.rewardItems) {
            if (item.id === 10013) { // Петарда
                assert.ok(item.amount <= 2, `Tier 1 must receive at most 2 firecrackers, got ${item.amount}`);
            }
        }
    }
});

test('Town Hall Orders - Cycle Timing', () => {
    const now = 1700000000000;
    const cycle = getCurrentOrdersCycle(now);
    assert.equal(cycle, Math.floor(now / CYCLE_DURATION_MS));

    const timeUntil = getTimeUntilNextOrdersCycle(now);
    assert.ok(timeUntil.totalMs > 0 && timeUntil.totalMs <= CYCLE_DURATION_MS);
    assert.ok(timeUntil.hours < 4);
    assert.ok(timeUntil.formatted.includes(':'));
});

test('Town Hall Orders - Skip Cooldown (24 Hours)', () => {
    const now = 1700000000000;

    // Never skipped before
    assert.equal(isOrderSkipAvailable(0, now), true, 'Never skipped should be available');

    // Skipped 1 hour ago -> NOT available
    const skipped1hAgo = now - 3600 * 1000;
    assert.equal(isOrderSkipAvailable(skipped1hAgo, now), false, '1h ago must NOT be available');
    const timeUntil = getTimeUntilSkipAvailable(skipped1hAgo, now);
    assert.equal(timeUntil.available, false);
    assert.equal(timeUntil.hours, 23); // 23h remaining (24h - 1h)

    // Skipped 24.1 hours ago -> AVAILABLE
    const skipped25hAgo = now - 25 * 3600 * 1000;
    assert.equal(isOrderSkipAvailable(skipped25hAgo, now), true, '25h ago must be available');
});

test('Town Hall Orders - Fulfillment Check', () => {
    const order = generateTownHallOrder(0, 1, 1, 10);
    const req1 = order.requirements[0];
    const req2 = order.requirements[1];

    // Empty inventory -> false
    assert.equal(canFulfillTownHallOrder(order, {}), false);

    // Partial inventory -> false
    assert.equal(canFulfillTownHallOrder(order, { [req1.id]: req1.amount, [req2.id]: req2.amount - 1 }), false);

    // Exact inventory -> true
    assert.equal(canFulfillTownHallOrder(order, { [req1.id]: req1.amount, [req2.id]: req2.amount }), true);

    // Surplus inventory -> true
    assert.equal(canFulfillTownHallOrder(order, { [req1.id]: req1.amount + 50, [req2.id]: req2.amount + 100 }), true);

    // Already completed -> false
    const completedOrder = { ...order, completed: true };
    assert.equal(canFulfillTownHallOrder(completedOrder, { [req1.id]: req1.amount + 50, [req2.id]: req2.amount + 100 }), false);
});

test('Town Hall Orders - Encoding & Mojibake Protection', () => {
    // Simulate an order corrupted by Latin-1 / double UTF-8 decoding
    const corruptedOrder = {
        id: 'th_order_test_corrupted',
        slotIndex: 0,
        title: 'Ã Â¡Ã Â½Ã Â°Ã Â±Ã Â¶Ã ÂµÃ Â½Ã Â¸Ã Âµ',
        description: 'Ã Â“Ã Â¾Ã‘Â€Ã Â¾Ã Â´Ã‘Âƒ',
        icon: 'Ã°ÂŸÂŒÂ¾',
        tier: 1,
        requirements: [
            { id: 10027, name: 'Ã Â—Ã‘Â‘Ã‘Â€Ã Â½Ã Â°', amount: 10, imageUrl: '/broken/url' },
            { id: 10004, name: 'Ã ÂšÃ‘ÂƒÃ‘Â', amount: 10, imageUrl: '/broken/url2' }
        ],
        rewardGold: 3000,
        rewardGlory: 50,
        rewardItems: [
            { id: 10019, name: 'Ã ÂœÃ ÂµÃ‘ÂˆÃ Â¾Ã Âº', amount: 3, imageUrl: '/broken/url3' }
        ],
        completed: false
    };

    const cleanOrder = normalizeTownHallOrder(corruptedOrder);

    assert.equal(cleanOrder.title, 'Снабжение городских пекарен');
    assert.equal(cleanOrder.icon, '🌾');
    assert.equal(cleanOrder.requirements[0].name, 'Зёрна гигантской пшеницы');
    assert.equal(cleanOrder.requirements[0].imageUrl, '/buildings/ресурсы/Грядки/Зёрна гигантской пше/10027.webp');
    assert.equal(cleanOrder.requirements[1].name, 'Куски супер тыквы');
    assert.equal(cleanOrder.rewardItems[0].name, 'Мешок муки');
    assert.equal(cleanOrder.rewardItems[0].imageUrl, '/buildings/ресурсы/Ресурсы/Мешок муки/10019.webp');
});
