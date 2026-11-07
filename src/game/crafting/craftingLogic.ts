/**
 * Crafting logic for fast consumables, food, elixirs, mortars, and light weapons.
 */

// Basic & Super resource IDs
export const WOOD_ID = 10001;
export const PLANKS_ID = 10002;
export const SUPER_MUSHROOM_ID = 10003;
export const SUPER_PUMPKIN_ID = 10004;
export const STONES_ID = 10005;
export const STONE_BLOCKS_ID = 10006;
export const FIRECRACKER_ID = 10013;
export const FLOUR_BAG_ID = 10019;
export const STEEL_ID = 10023;

// Consumable & Weapon IDs
export const ENERGY_DRINK_ID = 10046;
export const ENERGY_DRINK_RESTORE = 15;

export const PUMPKIN_PIE_ID = 10047;
export const PUMPKIN_PIE_RESTORE = 25;

export const LUMBERJACK_ELIXIR_ID = 10048;
export const LUMBERJACK_BUFF_DURATION_MS = 10 * 60 * 1000; // 10 minutes
export const LUMBERJACK_EXTRA_WOOD = 1;

export const REINFORCING_MORTAR_ID = 10049;
export const MORTAR_REPAIR_DISCOUNT_PERCENT = 30; // 30% repair cost reduction
export const MORTAR_BUFF_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const FIRECRACKER_BUNDLE_ID = 10050;
export const FIRECRACKER_BUNDLE_DAMAGE = 25;

export type CraftEffectType = 'energy' | 'woodcutter_buff' | 'mortar_discount' | 'weapon';

export interface CraftingIngredient {
    itemId: number;
    amount: number;
    name?: string;
    imageUrl?: string;
}

export interface CraftingRecipe {
    id: string;
    resultItemId: number;
    resultAmount: number;
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    energyRestore?: number;
    effectType?: CraftEffectType;
    buffDurationMinutes?: number;
    buffDurationMs?: number;
    repairDiscountPercent?: number;
    weaponDamage?: number;
    hint?: string;
    ingredients: CraftingIngredient[];
}

export interface CraftResult {
    success: boolean;
    error?: string;
    consumedIngredients: { itemId: number; amount: number }[];
    producedItems: { itemId: number; amount: number };
    nextInventory: Record<number, number>;
}

export interface ItemUseResult {
    success: boolean;
    error?: string;
    energyRestored: number;
    buffType?: 'lumberjack' | 'mortar';
    buffDurationMs?: number;
    message?: string;
    nextInventory: Record<number, number>;
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
    {
        id: 'energy_drink',
        resultItemId: ENERGY_DRINK_ID,
        resultAmount: 1,
        name: 'Энергетик',
        description: 'Мгновенно восстанавливает 15 энергии. Готовится из кусочков супер гриба.',
        category: 'Кулинария и Ремесло',
        imageUrl: '/Gui/energy_potion.svg',
        energyRestore: ENERGY_DRINK_RESTORE,
        effectType: 'energy',
        hint: 'Куски супер гриба можно получить при сборе урожая с грибных грядок.',
        ingredients: [
            {
                itemId: SUPER_MUSHROOM_ID,
                amount: 1,
                name: 'Куски супер гриба',
                imageUrl: '/buildings/ресурсы/Грядки/Куски супер гриба/10003.webp'
            }
        ]
    },
    {
        id: 'pumpkin_pie',
        resultItemId: PUMPKIN_PIE_ID,
        resultAmount: 1,
        name: 'Тыквенный пирог',
        description: 'Свежеиспеченный сытный пирог из супер тыквы и муки. Восстанавливает 25 энергии.',
        category: 'Кулинария',
        imageUrl: '/Gui/pumpkin_pie.svg',
        energyRestore: PUMPKIN_PIE_RESTORE,
        effectType: 'energy',
        hint: 'Куски супер тыквы падают с тыквенных грядок, а муку можно смолоть на мельнице или купить.',
        ingredients: [
            {
                itemId: SUPER_PUMPKIN_ID,
                amount: 1,
                name: 'Куски супер тыквы',
                imageUrl: '/buildings/ресурсы/Грядки/Куски супер тыквы/10004.webp'
            },
            {
                itemId: FLOUR_BAG_ID,
                amount: 1,
                name: 'Мешок муки',
                imageUrl: '/buildings/ресурсы/Ресурсы/Мешок муки/10019.webp'
            }
        ]
    },
    {
        id: 'lumberjack_elixir',
        resultItemId: LUMBERJACK_ELIXIR_ID,
        resultAmount: 1,
        name: 'Эликсир дровосека',
        description: 'Магическое зелье лесоруба. Дает временный бафф: +1 дополнительное дерево за каждый срубленный ствол на 10 минут.',
        category: 'Кулинария и Ремесло',
        imageUrl: '/Gui/lumberjack_elixir.svg',
        effectType: 'woodcutter_buff',
        buffDurationMinutes: 10,
        buffDurationMs: LUMBERJACK_BUFF_DURATION_MS,
        hint: 'Куски супер гриба добываются на грядках, а доски производятся из древесины на лесопилке.',
        ingredients: [
            {
                itemId: SUPER_MUSHROOM_ID,
                amount: 1,
                name: 'Куски супер гриба',
                imageUrl: '/buildings/ресурсы/Грядки/Куски супер гриба/10003.webp'
            },
            {
                itemId: PLANKS_ID,
                amount: 2,
                name: 'Доски',
                imageUrl: '/buildings/ресурсы/Ресурсы/Доски/10002.webp'
            }
        ]
    },
    {
        id: 'reinforcing_mortar',
        resultItemId: REINFORCING_MORTAR_ID,
        resultAmount: 1,
        name: 'Каменный укрепляющий раствор',
        description: 'Особая строительная смесь высшей прочности. Снижает стоимость ремонта любого здания на 30%.',
        category: 'Ремесло',
        imageUrl: '/Gui/stone_mortar.svg',
        effectType: 'mortar_discount',
        repairDiscountPercent: MORTAR_REPAIR_DISCOUNT_PERCENT,
        buffDurationMinutes: 30,
        buffDurationMs: MORTAR_BUFF_DURATION_MS,
        hint: 'Каменные блоки обрабатываются из камней, а сталь куется в кузнице или на сталелитейном заводе.',
        ingredients: [
            {
                itemId: STONE_BLOCKS_ID,
                amount: 2,
                name: 'Каменные блоки',
                imageUrl: '/buildings/ресурсы/Ресурсы/Каменные блоки/10006.webp'
            },
            {
                itemId: STEEL_ID,
                amount: 1,
                name: 'Сталь',
                imageUrl: '/buildings/ресурсы/Ресурсы/Сталь/10023.webp'
            }
        ]
    },
    {
        id: 'firecracker_bundle',
        resultItemId: FIRECRACKER_BUNDLE_ID,
        resultAmount: 1,
        name: 'Связка хлопушек',
        description: 'Легкое оружие быстрого крафта. Наносит концентрированный взрывной урон (25+) зданиям и монстрам.',
        category: 'Ремесло и Оружие',
        imageUrl: '/Gui/firecracker_bundle.svg',
        effectType: 'weapon',
        weaponDamage: FIRECRACKER_BUNDLE_DAMAGE,
        hint: 'Петарды производятся в мастерской или находятся в тайниках, а доски делаются из дерева.',
        ingredients: [
            {
                itemId: FIRECRACKER_ID,
                amount: 3,
                name: 'Петарда',
                imageUrl: '/buildings/ресурсы/Бомбы/Петарда/10013.webp'
            },
            {
                itemId: PLANKS_ID,
                amount: 1,
                name: 'Доски',
                imageUrl: '/buildings/ресурсы/Ресурсы/Доски/10002.webp'
            }
        ]
    }
];

export function getCraftingRecipe(recipeId: string): CraftingRecipe | undefined {
    return CRAFTING_RECIPES.find(r => r.id === recipeId);
}

export function canCraftRecipe(
    recipe: CraftingRecipe,
    inventory: Record<number, number>,
    count: number = 1
): boolean {
    if (!recipe || count <= 0) return false;
    for (const ingredient of recipe.ingredients) {
        const available = Math.max(0, Number(inventory[ingredient.itemId]) || 0);
        if (available < ingredient.amount * count) {
            return false;
        }
    }
    return true;
}

export function getMaxCraftableCount(
    recipe: CraftingRecipe,
    inventory: Record<number, number>
): number {
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) return 0;
    let minCraftable = Infinity;
    for (const ingredient of recipe.ingredients) {
        const available = Math.max(0, Number(inventory[ingredient.itemId]) || 0);
        const craftableForIngredient = Math.floor(available / ingredient.amount);
        if (craftableForIngredient < minCraftable) {
            minCraftable = craftableForIngredient;
        }
    }
    return minCraftable === Infinity ? 0 : minCraftable;
}

export function craftRecipe(
    recipe: CraftingRecipe,
    inventory: Record<number, number>,
    count: number = 1
): CraftResult {
    if (!recipe) {
        return {
            success: false,
            error: 'Рецепт не найден',
            consumedIngredients: [],
            producedItems: { itemId: 0, amount: 0 },
            nextInventory: { ...inventory }
        };
    }

    if (count <= 0) {
        return {
            success: false,
            error: 'Некорректное количество',
            consumedIngredients: [],
            producedItems: { itemId: recipe.resultItemId, amount: 0 },
            nextInventory: { ...inventory }
        };
    }

    if (!canCraftRecipe(recipe, inventory, count)) {
        return {
            success: false,
            error: 'Недостаточно ингредиентов для создания',
            consumedIngredients: [],
            producedItems: { itemId: recipe.resultItemId, amount: 0 },
            nextInventory: { ...inventory }
        };
    }

    const nextInventory: Record<number, number> = { ...inventory };
    const consumedIngredients: { itemId: number; amount: number }[] = [];

    for (const ingredient of recipe.ingredients) {
        const totalNeeded = ingredient.amount * count;
        const currentAmount = Math.max(0, Number(nextInventory[ingredient.itemId]) || 0);
        const nextAmount = currentAmount - totalNeeded;
        if (nextAmount > 0) {
            nextInventory[ingredient.itemId] = nextAmount;
        } else {
            delete nextInventory[ingredient.itemId];
        }
        consumedIngredients.push({ itemId: ingredient.itemId, amount: totalNeeded });
    }

    const producedAmount = recipe.resultAmount * count;
    nextInventory[recipe.resultItemId] = (Math.max(0, Number(nextInventory[recipe.resultItemId]) || 0)) + producedAmount;

    return {
        success: true,
        consumedIngredients,
        producedItems: { itemId: recipe.resultItemId, amount: producedAmount },
        nextInventory
    };
}

export function isUsableInventoryItem(itemId: number): boolean {
    return (
        itemId === ENERGY_DRINK_ID ||
        itemId === PUMPKIN_PIE_ID ||
        itemId === LUMBERJACK_ELIXIR_ID ||
        itemId === REINFORCING_MORTAR_ID
    );
}

export function isWeaponInventoryItem(itemId: number): boolean {
    return itemId === FIRECRACKER_ID || itemId === FIRECRACKER_BUNDLE_ID;
}

export function getItemEnergyRestore(itemId: number): number {
    if (itemId === ENERGY_DRINK_ID) {
        return ENERGY_DRINK_RESTORE;
    }
    if (itemId === PUMPKIN_PIE_ID) {
        return PUMPKIN_PIE_RESTORE;
    }
    return 0;
}

export function getItemActionLabel(itemId: number): string {
    switch (itemId) {
        case ENERGY_DRINK_ID:
            return '⚡ Выпить (+15)';
        case PUMPKIN_PIE_ID:
            return '🥧 Съесть (+25)';
        case LUMBERJACK_ELIXIR_ID:
            return '🧪 Выпить (10 мин)';
        case REINFORCING_MORTAR_ID:
            return '🧱 Применить (-30%)';
        case FIRECRACKER_BUNDLE_ID:
            return '💥 Оружие (25)';
        default:
            return 'Использовать';
    }
}

export function getItemBadgeInfo(itemId: number): { text: string; bg: string; color?: string } | null {
    switch (itemId) {
        case ENERGY_DRINK_ID:
            return { text: `+${ENERGY_DRINK_RESTORE} ⚡`, bg: 'rgba(16, 185, 129, 0.85)' };
        case PUMPKIN_PIE_ID:
            return { text: `+${PUMPKIN_PIE_RESTORE} ⚡`, bg: 'rgba(245, 158, 11, 0.9)', color: '#ffffff' };
        case LUMBERJACK_ELIXIR_ID:
            return { text: '+1 🪓', bg: 'rgba(16, 185, 129, 0.9)' };
        case REINFORCING_MORTAR_ID:
            return { text: '-30% 🧱', bg: 'rgba(56, 189, 248, 0.9)', color: '#0f172a' };
        case FIRECRACKER_BUNDLE_ID:
            return { text: '💥 Урон 25', bg: 'rgba(239, 68, 68, 0.9)' };
        default:
            return null;
    }
}

export function calculateMortarDiscountPrice(baseCost: number): number {
    if (baseCost <= 0) return 0;
    const discount = MORTAR_REPAIR_DISCOUNT_PERCENT / 100;
    return Math.max(1, Math.ceil(baseCost * (1 - discount)));
}

export function consumeInventoryItem(
    itemId: number,
    inventory: Record<number, number>
): ItemUseResult {
    const currentCount = Math.max(0, Number(inventory[itemId]) || 0);
    if (currentCount <= 0) {
        return {
            success: false,
            error: 'Предмет отсутствует в инвентаре',
            energyRestored: 0,
            nextInventory: { ...inventory }
        };
    }

    if (!isUsableInventoryItem(itemId)) {
        return {
            success: false,
            error: 'Этот предмет нельзя использовать напрямую',
            energyRestored: 0,
            nextInventory: { ...inventory }
        };
    }

    const nextInventory: Record<number, number> = { ...inventory };
    const nextCount = currentCount - 1;
    if (nextCount > 0) {
        nextInventory[itemId] = nextCount;
    } else {
        delete nextInventory[itemId];
    }

    // Energy consumables
    const energyRestored = getItemEnergyRestore(itemId);
    if (energyRestored > 0) {
        return {
            success: true,
            energyRestored,
            message: `Восстановлено +${energyRestored} энергии!`,
            nextInventory
        };
    }

    // Lumberjack elixir
    if (itemId === LUMBERJACK_ELIXIR_ID) {
        return {
            success: true,
            energyRestored: 0,
            buffType: 'lumberjack',
            buffDurationMs: LUMBERJACK_BUFF_DURATION_MS,
            message: 'Активирован бафф: +1 дерево за каждый срубленный ствол на 10 минут!',
            nextInventory
        };
    }

    // Reinforcing mortar
    if (itemId === REINFORCING_MORTAR_ID) {
        return {
            success: true,
            energyRestored: 0,
            buffType: 'mortar',
            buffDurationMs: MORTAR_BUFF_DURATION_MS,
            message: 'Активирован бафф: стоимость ремонта любого здания снижена на 30%!',
            nextInventory
        };
    }

    return {
        success: false,
        error: 'Неизвестный тип предмета',
        energyRestored: 0,
        nextInventory: { ...inventory }
    };
}
