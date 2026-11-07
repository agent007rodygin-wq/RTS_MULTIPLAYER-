import test from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateResourceRubyCost,
    calculateMissingResources,
    calculateTotalRubiesNeeded
} from '../src/game/economy/blackMarketLogic.ts';

const mockItems = [
    { id: 10001, name: 'Дерево', rubyPackQuantity: 100, description: '', category: 'Ресурсы', imageUrl: '' },
    { id: 10002, name: 'Доски', rubyPackQuantity: 10, description: '', category: 'Ресурсы', imageUrl: '' },
    { id: 10003, name: 'Куски супер гриба', rubyPackQuantity: 1, description: '', category: 'Ресурсы', imageUrl: '' },
    { id: 10004, name: 'Куски супер тыквы', rubyPackQuantity: 1, description: '', category: 'Ресурсы', imageUrl: '' }
];

test('Black Market Logic - Ruby Cost Calculation', () => {
    // 1 item per ruby
    const cost1 = calculateResourceRubyCost(1, 1);
    assert.equal(cost1.rubies, 1);
    assert.equal(cost1.itemsReceived, 1);

    const cost5 = calculateResourceRubyCost(5, 1);
    assert.equal(cost5.rubies, 5);
    assert.equal(cost5.itemsReceived, 5);

    // 10 items per ruby (Planks)
    const costPlanks1 = calculateResourceRubyCost(8, 10);
    assert.equal(costPlanks1.rubies, 1); // 1 ruby gives 10
    assert.equal(costPlanks1.itemsReceived, 10);

    const costPlanks2 = calculateResourceRubyCost(1912, 10);
    assert.equal(costPlanks2.rubies, 192); // 192 rubies gives 1920
    assert.equal(costPlanks2.itemsReceived, 1920);

    // 100 items per ruby (Wood)
    const costWood = calculateResourceRubyCost(250, 100);
    assert.equal(costWood.rubies, 3);
    assert.equal(costWood.itemsReceived, 300);
});

test('Black Market Logic - Missing Resources Detection', () => {
    const requirements = [
        { id: 10001, name: 'Дерево', amount: 500 },
        { id: 10002, name: 'Доски', amount: 2000 },
        { id: 10003, name: 'Куски супер гриба', amount: 10 }
    ];

    const inventory = {
        10001: 500, // Exact
        10002: 88,  // Short by 1912
        10003: 0    // Short by 10
    };

    const missing = calculateMissingResources(requirements, inventory, mockItems);
    assert.equal(missing.length, 2);

    // Planks
    assert.equal(missing[0].id, 10002);
    assert.equal(missing[0].required, 2000);
    assert.equal(missing[0].available, 88);
    assert.equal(missing[0].missing, 1912);
    assert.equal(missing[0].rubiesNeeded, 192);
    assert.equal(missing[0].itemsToReceive, 1920);

    // Mushrooms
    assert.equal(missing[1].id, 10003);
    assert.equal(missing[1].required, 10);
    assert.equal(missing[1].available, 0);
    assert.equal(missing[1].missing, 10);
    assert.equal(missing[1].rubiesNeeded, 10);
    assert.equal(missing[1].itemsToReceive, 10);

    // Total rubies
    const total = calculateTotalRubiesNeeded(missing);
    assert.equal(total, 192 + 10);
});
