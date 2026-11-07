import test from 'node:test';
import assert from 'node:assert/strict';
import {
    QUICK_SELL_PRICES,
    getItemQuickSellPrice,
    calculateQuickSellTotal
} from '../src/game/economy/quickSellLogic.ts';

test('Quick Sell - Defined Resource Prices', () => {
    // Wood
    assert.equal(getItemQuickSellPrice(10001), 20);
    // Planks
    assert.equal(getItemQuickSellPrice(10002), 200);
    // Super mushroom
    assert.equal(getItemQuickSellPrice(10003), 2000);
    // Firecracker
    assert.equal(getItemQuickSellPrice(10013), 70);
    // Energy drink
    assert.equal(getItemQuickSellPrice(10046), 1500);
    // Stone
    assert.equal(getItemQuickSellPrice(10005), 40);
});

test('Quick Sell - Dynamic Fallback Pricing', () => {
    // Item not in explicit map, but has rubyPackQuantity
    const item = { id: 99999, rubyPackQuantity: 50 };
    // 7777 / 50 = 155.54, 25% = 38
    const price = getItemQuickSellPrice(item);
    assert.equal(price, 38);

    // Completely unknown item defaults to 10
    assert.equal(getItemQuickSellPrice(88888), 10);
});

test('Quick Sell - Validation & Payout Calculation', () => {
    // Valid sell
    const res1 = calculateQuickSellTotal(10001, 100, 500);
    assert.equal(res1.canSell, true);
    assert.equal(res1.unitPrice, 20);
    assert.equal(res1.totalGold, 2000);

    // Selling exact available
    const res2 = calculateQuickSellTotal(10002, 5, 5);
    assert.equal(res2.canSell, true);
    assert.equal(res2.unitPrice, 200);
    assert.equal(res2.totalGold, 1000);

    // Exceeding available
    const resFail = calculateQuickSellTotal(10001, 10, 5);
    assert.equal(resFail.canSell, false);
    assert.ok(resFail.error);

    // Zero or negative count
    const resZero = calculateQuickSellTotal(10001, 0, 5);
    assert.equal(resZero.canSell, false);
});
