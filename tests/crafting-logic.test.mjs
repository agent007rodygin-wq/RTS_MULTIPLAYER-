import test from 'node:test';
import assert from 'node:assert/strict';
import {
    SUPER_MUSHROOM_ID,
    SUPER_PUMPKIN_ID,
    PLANKS_ID,
    STONE_BLOCKS_ID,
    STEEL_ID,
    FIRECRACKER_ID,
    FLOUR_BAG_ID,
    ENERGY_DRINK_ID,
    ENERGY_DRINK_RESTORE,
    PUMPKIN_PIE_ID,
    PUMPKIN_PIE_RESTORE,
    LUMBERJACK_ELIXIR_ID,
    LUMBERJACK_BUFF_DURATION_MS,
    LUMBERJACK_EXTRA_WOOD,
    REINFORCING_MORTAR_ID,
    MORTAR_REPAIR_DISCOUNT_PERCENT,
    MORTAR_BUFF_DURATION_MS,
    FIRECRACKER_BUNDLE_ID,
    FIRECRACKER_BUNDLE_DAMAGE,
    CRAFTING_RECIPES,
    getCraftingRecipe,
    canCraftRecipe,
    getMaxCraftableCount,
    craftRecipe,
    isUsableInventoryItem,
    isWeaponInventoryItem,
    getItemEnergyRestore,
    getItemActionLabel,
    getItemBadgeInfo,
    calculateMortarDiscountPrice,
    consumeInventoryItem
} from '../src/game/crafting/craftingLogic.ts';

test('Crafting Logic - Recipe Definitions (All 5 Recipes)', () => {
    assert.equal(CRAFTING_RECIPES.length, 5);

    // 1. Energy Drink
    const rDrink = getCraftingRecipe('energy_drink');
    assert.ok(rDrink);
    assert.equal(rDrink.resultItemId, ENERGY_DRINK_ID);
    assert.equal(rDrink.energyRestore, 15);

    // 2. Pumpkin Pie
    const rPie = getCraftingRecipe('pumpkin_pie');
    assert.ok(rPie, 'Pumpkin pie recipe must exist');
    assert.equal(rPie.resultItemId, PUMPKIN_PIE_ID);
    assert.equal(rPie.energyRestore, 25);
    assert.equal(rPie.category, 'Кулинария');
    assert.deepEqual(rPie.ingredients, [
        { itemId: SUPER_PUMPKIN_ID, amount: 1, name: 'Куски супер тыквы', imageUrl: '/buildings/ресурсы/Грядки/Куски супер тыквы/10004.webp' },
        { itemId: FLOUR_BAG_ID, amount: 1, name: 'Мешок муки', imageUrl: '/buildings/ресурсы/Ресурсы/Мешок муки/10019.webp' }
    ]);

    // 3. Lumberjack Elixir
    const rElixir = getCraftingRecipe('lumberjack_elixir');
    assert.ok(rElixir, 'Lumberjack elixir recipe must exist');
    assert.equal(rElixir.resultItemId, LUMBERJACK_ELIXIR_ID);
    assert.equal(rElixir.buffDurationMinutes, 10);
    assert.deepEqual(rElixir.ingredients, [
        { itemId: SUPER_MUSHROOM_ID, amount: 1, name: 'Куски супер гриба', imageUrl: '/buildings/ресурсы/Грядки/Куски супер гриба/10003.webp' },
        { itemId: PLANKS_ID, amount: 2, name: 'Доски', imageUrl: '/buildings/ресурсы/Ресурсы/Доски/10002.webp' }
    ]);

    // 4. Reinforcing Mortar
    const rMortar = getCraftingRecipe('reinforcing_mortar');
    assert.ok(rMortar, 'Reinforcing mortar recipe must exist');
    assert.equal(rMortar.resultItemId, REINFORCING_MORTAR_ID);
    assert.equal(rMortar.repairDiscountPercent, 30);
    assert.deepEqual(rMortar.ingredients, [
        { itemId: STONE_BLOCKS_ID, amount: 2, name: 'Каменные блоки', imageUrl: '/buildings/ресурсы/Ресурсы/Каменные блоки/10006.webp' },
        { itemId: STEEL_ID, amount: 1, name: 'Сталь', imageUrl: '/buildings/ресурсы/Ресурсы/Сталь/10023.webp' }
    ]);

    // 5. Firecracker Bundle
    const rBundle = getCraftingRecipe('firecracker_bundle');
    assert.ok(rBundle, 'Firecracker bundle recipe must exist');
    assert.equal(rBundle.resultItemId, FIRECRACKER_BUNDLE_ID);
    assert.equal(rBundle.weaponDamage, 25);
    assert.deepEqual(rBundle.ingredients, [
        { itemId: FIRECRACKER_ID, amount: 3, name: 'Петарда', imageUrl: '/buildings/ресурсы/Бомбы/Петарда/10013.webp' },
        { itemId: PLANKS_ID, amount: 1, name: 'Доски', imageUrl: '/buildings/ресурсы/Ресурсы/Доски/10002.webp' }
    ]);
});

test('Crafting Logic - Crafting Execution for New Consumables', () => {
    // 1. Craft Pumpkin Pie
    const pieRecipe = getCraftingRecipe('pumpkin_pie');
    const pieInv = { [SUPER_PUMPKIN_ID]: 2, [FLOUR_BAG_ID]: 5 };
    assert.equal(canCraftRecipe(pieRecipe, pieInv, 2), true);
    assert.equal(getMaxCraftableCount(pieRecipe, pieInv), 2);

    const pieResult = craftRecipe(pieRecipe, pieInv, 2);
    assert.equal(pieResult.success, true);
    assert.equal(pieResult.producedItems.itemId, PUMPKIN_PIE_ID);
    assert.equal(pieResult.producedItems.amount, 2);
    assert.equal(pieResult.nextInventory[SUPER_PUMPKIN_ID], undefined);
    assert.equal(pieResult.nextInventory[FLOUR_BAG_ID], 3);
    assert.equal(pieResult.nextInventory[PUMPKIN_PIE_ID], 2);

    // 2. Craft Lumberjack Elixir (1 Super Mushroom + 2 Planks)
    const elixirRecipe = getCraftingRecipe('lumberjack_elixir');
    const elixirInv = { [SUPER_MUSHROOM_ID]: 3, [PLANKS_ID]: 5 };
    assert.equal(getMaxCraftableCount(elixirRecipe, elixirInv), 2); // 5 planks / 2 = 2 max
    const elixirResult = craftRecipe(elixirRecipe, elixirInv, 2);
    assert.equal(elixirResult.success, true);
    assert.equal(elixirResult.nextInventory[SUPER_MUSHROOM_ID], 1);
    assert.equal(elixirResult.nextInventory[PLANKS_ID], 1);
    assert.equal(elixirResult.nextInventory[LUMBERJACK_ELIXIR_ID], 2);

    // 3. Craft Reinforcing Mortar (2 Stone Blocks + 1 Steel)
    const mortarRecipe = getCraftingRecipe('reinforcing_mortar');
    const mortarInv = { [STONE_BLOCKS_ID]: 6, [STEEL_ID]: 2 };
    assert.equal(getMaxCraftableCount(mortarRecipe, mortarInv), 2);
    const mortarResult = craftRecipe(mortarRecipe, mortarInv, 2);
    assert.equal(mortarResult.success, true);
    assert.equal(mortarResult.nextInventory[STONE_BLOCKS_ID], 2);
    assert.equal(mortarResult.nextInventory[STEEL_ID], undefined);
    assert.equal(mortarResult.nextInventory[REINFORCING_MORTAR_ID], 2);

    // 4. Craft Firecracker Bundle (3 Firecrackers + 1 Plank)
    const bundleRecipe = getCraftingRecipe('firecracker_bundle');
    const bundleInv = { [FIRECRACKER_ID]: 10, [PLANKS_ID]: 4 };
    assert.equal(getMaxCraftableCount(bundleRecipe, bundleInv), 3);
    const bundleResult = craftRecipe(bundleRecipe, bundleInv, 3);
    assert.equal(bundleResult.success, true);
    assert.equal(bundleResult.nextInventory[FIRECRACKER_ID], 1);
    assert.equal(bundleResult.nextInventory[PLANKS_ID], 1);
    assert.equal(bundleResult.nextInventory[FIRECRACKER_BUNDLE_ID], 3);
});

test('Crafting Logic - Usability and Consumables Effects', () => {
    // Usability flags
    assert.equal(isUsableInventoryItem(PUMPKIN_PIE_ID), true);
    assert.equal(isUsableInventoryItem(LUMBERJACK_ELIXIR_ID), true);
    assert.equal(isUsableInventoryItem(REINFORCING_MORTAR_ID), true);
    assert.equal(isWeaponInventoryItem(FIRECRACKER_BUNDLE_ID), true);

    // Energy restoration values
    assert.equal(getItemEnergyRestore(PUMPKIN_PIE_ID), 25);
    assert.equal(getItemEnergyRestore(ENERGY_DRINK_ID), 15);
    assert.equal(getItemEnergyRestore(LUMBERJACK_ELIXIR_ID), 0);

    // Labels & Badges
    assert.equal(getItemActionLabel(PUMPKIN_PIE_ID), '🥧 Съесть (+25)');
    assert.equal(getItemActionLabel(LUMBERJACK_ELIXIR_ID), '🧪 Выпить (10 мин)');
    assert.equal(getItemActionLabel(REINFORCING_MORTAR_ID), '🧱 Применить (-30%)');
    assert.ok(getItemBadgeInfo(PUMPKIN_PIE_ID));
    assert.ok(getItemBadgeInfo(LUMBERJACK_ELIXIR_ID));
    assert.ok(getItemBadgeInfo(REINFORCING_MORTAR_ID));
    assert.ok(getItemBadgeInfo(FIRECRACKER_BUNDLE_ID));

    // Mortar 30% discount calculation
    assert.equal(calculateMortarDiscountPrice(100), 70);
    assert.equal(calculateMortarDiscountPrice(1000), 700);
    assert.equal(calculateMortarDiscountPrice(3), 3); // Math.ceil(3 * 0.7) = 3

    // Consuming Pumpkin Pie (restores 25 energy)
    const inv1 = { [PUMPKIN_PIE_ID]: 2 };
    const pieUse = consumeInventoryItem(PUMPKIN_PIE_ID, inv1);
    assert.equal(pieUse.success, true);
    assert.equal(pieUse.energyRestored, 25);
    assert.equal(pieUse.nextInventory[PUMPKIN_PIE_ID], 1);

    // Consuming Lumberjack Elixir (gives 10 min buff)
    const inv2 = { [LUMBERJACK_ELIXIR_ID]: 1 };
    const elixirUse = consumeInventoryItem(LUMBERJACK_ELIXIR_ID, inv2);
    assert.equal(elixirUse.success, true);
    assert.equal(elixirUse.buffType, 'lumberjack');
    assert.equal(elixirUse.buffDurationMs, 600000);
    assert.equal(elixirUse.nextInventory[LUMBERJACK_ELIXIR_ID], undefined);

    // Consuming Reinforcing Mortar (gives 30 min buff)
    const inv3 = { [REINFORCING_MORTAR_ID]: 1 };
    const mortarUse = consumeInventoryItem(REINFORCING_MORTAR_ID, inv3);
    assert.equal(mortarUse.success, true);
    assert.equal(mortarUse.buffType, 'mortar');
    assert.equal(mortarUse.buffDurationMs, 1800000);
    assert.equal(mortarUse.nextInventory[REINFORCING_MORTAR_ID], undefined);
});
