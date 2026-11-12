/**
 * Quick-sell logic for directly selling inventory resources at a discounted instant rate.
 */

export const QUICK_SELL_PRICES: Record<number, number> = {
    // Basic resources
    10001: 20,     // Дерево (База ~77, Быстрая продажа: 20)
    10002: 200,    // Доски (База ~777, Быстрая продажа: 200)
    10005: 40,     // Камни (База ~155, Быстрая продажа: 40)
    10006: 200,    // Каменные блоки (База ~777, Быстрая продажа: 200)
    10008: 200,    // Бочка с нефтью (База ~777, Быстрая продажа: 200)
    10009: 400,    // Канистра с бензином (База ~1555, Быстрая продажа: 400)
    10019: 250,    // Мешок муки (База ~777, Быстрая продажа: 250)
    10022: 100,    // Руда (База ~388, Быстрая продажа: 100)
    10023: 400,    // Сталь (База ~1555, Быстрая продажа: 400)
    10025: 400,    // Золотая руда (База ~1555, Быстрая продажа: 400)
    10026: 2000,   // Золото (слиток) (База 7777, Быстрая продажа: 2000)
    10041: 40,     // Песок (База ~155, Быстрая продажа: 40)
    10044: 400,    // Самородок (База ~1555, Быстрая продажа: 400)

    // Bed rare harvest items (Super plants)
    10003: 2000,   // Куски супер гриба (База 7777, Быстрая продажа: 2000)
    10004: 2000,   // Куски супер тыквы (База 7777, Быстрая продажа: 2000)
    10021: 2000,   // Куски супер репки (База 7777, Быстрая продажа: 2000)
    10024: 5000,   // Супер лилия (База 7777, Быстрая продажа: 5000)
    10027: 200,    // Зёрна гигантской пшеницы (База ~777, Быстрая продажа: 200)
    10030: 200,    // Цветок подсолнуха (База ~777, Быстрая продажа: 200)

    // Explosives / Bombs
    10010: 500,    // Садовая бомба
    10011: 800,    // Огненная бомба
    10012: 1200,   // Ледяная бомба
    10013: 70,     // Петарда (База ~259, Быстрая продажа: 70)
    10015: 1500,   // Ящик петард
    10016: 2000,   // Мега петарда
    10017: 1500,   // Детонатор
    10020: 3000,   // Супер детонатор

    // Consumables & Miscellaneous
    10046: 1500,   // Энергетик
    10047: 2200,   // Тыквенный пирог
    10048: 2400,   // Эликсир дровосека
    10049: 800,    // Каменный укрепляющий раствор
    10050: 450,    // Связка хлопушек
    10051: 150,    // Кости
    10052: 600,    // Костяная мука
    10032: 400,    // Рекомендация
};

/**
 * Returns the unit quick-sell price in gold coins for a given item.
 */
export function getItemQuickSellPrice(
    itemOrId: number | { id: number; rubyPackQuantity?: number }
): number {
    const id = typeof itemOrId === 'number' ? itemOrId : itemOrId.id;
    if (QUICK_SELL_PRICES[id]) {
        return QUICK_SELL_PRICES[id];
    }
    if (typeof itemOrId === 'object' && itemOrId?.rubyPackQuantity && itemOrId.rubyPackQuantity > 0) {
        return Math.max(5, Math.floor((7777 / itemOrId.rubyPackQuantity) * 0.25));
    }
    return 10;
}

/**
 * Validates whether an item can be sold and calculates the total payout.
 */
export function calculateQuickSellTotal(
    itemId: number,
    amount: number,
    availableAmount: number,
    itemInfo?: { id: number; rubyPackQuantity?: number }
): {
    canSell: boolean;
    unitPrice: number;
    totalGold: number;
    error?: string;
} {
    if (amount <= 0) {
        return { canSell: false, unitPrice: 0, totalGold: 0, error: 'Количество должно быть больше 0' };
    }
    if (amount > availableAmount) {
        return { canSell: false, unitPrice: 0, totalGold: 0, error: 'Недостаточно предметов в наличии' };
    }

    const unitPrice = getItemQuickSellPrice(itemInfo || itemId);
    const totalGold = unitPrice * amount;

    return {
        canSell: true,
        unitPrice,
        totalGold
    };
}
