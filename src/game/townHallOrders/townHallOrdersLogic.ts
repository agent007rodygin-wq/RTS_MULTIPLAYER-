export interface OrderRequirement {
    id: number;
    name: string;
    amount: number;
    imageUrl: string;
}

export interface OrderRewardItem {
    id: number;
    name: string;
    amount: number;
    imageUrl: string;
}

export interface TownHallOrder {
    id: string;
    slotIndex: number;
    title: string;
    description: string;
    icon: string;
    tier: number;
    requirements: OrderRequirement[];
    rewardGold: number;
    rewardGlory: number;
    rewardItems: OrderRewardItem[];
    completed: boolean;
    completedAt?: number;
}

export interface TownHallOrdersState {
    orders: TownHallOrder[];
    cycle: number;
    lastSkipTime: number; // Timestamp of last skipped order
}

export const CYCLE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
export const SKIP_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours (1 сутки)

export const BASE_ITEMS_CATALOG: Record<number, { name: string; imageUrl: string }> = {
    10001: { name: 'Дерево', imageUrl: '/buildings/ресурсы/Ресурсы/Дерево/10001.webp' },
    10002: { name: 'Доски', imageUrl: '/buildings/ресурсы/Ресурсы/Доски/10002.webp' },
    10003: { name: 'Куски супер гриба', imageUrl: '/buildings/ресурсы/Грядки/Куски супер гриба/10003.webp' },
    10004: { name: 'Куски супер тыквы', imageUrl: '/buildings/ресурсы/Грядки/Куски супер тыквы/10004.webp' },
    10005: { name: 'Камни', imageUrl: '/buildings/ресурсы/Ресурсы/Камни/10005.webp' },
    10006: { name: 'Каменные блоки', imageUrl: '/buildings/ресурсы/Ресурсы/Каменные блоки/10006.webp' },
    10008: { name: 'Бочка с нефтью', imageUrl: '/buildings/ресурсы/Ресурсы/Бочка с нефтью/10008.webp' },
    10009: { name: 'Канистра с бензином', imageUrl: '/buildings/ресурсы/Ресурсы/Канистра с бензином/10009.webp' },
    10010: { name: 'Садовая бомба', imageUrl: '/buildings/ресурсы/Бомбы/Садовая бомба/10010.webp' },
    10013: { name: 'Петарда', imageUrl: '/buildings/ресурсы/Бомбы/Петарда/10013.webp' },
    10015: { name: 'Ящик петард', imageUrl: '/buildings/ресурсы/Бомбы/Ящик петард/10014.webp' },
    10017: { name: 'Детонатор', imageUrl: '/buildings/ресурсы/Бомбы/Детонатор/10017.webp' },
    10019: { name: 'Мешок муки', imageUrl: '/buildings/ресурсы/Ресурсы/Мешок муки/10019.webp' },
    10021: { name: 'Куски супер репки', imageUrl: '/buildings/ресурсы/Грядки/Куски супер репки/10021.webp' },
    10022: { name: 'Руда', imageUrl: '/buildings/ресурсы/Ресурсы/Руда/10022.webp' },
    10023: { name: 'Сталь', imageUrl: '/buildings/ресурсы/Ресурсы/Сталь/10023.webp' },
    10024: { name: 'Супер лилия', imageUrl: '/buildings/ресурсы/Грядки/Супер лилия/10024.webp' },
    10025: { name: 'Золотая руда', imageUrl: '/buildings/ресурсы/Ресурсы/Золотая руда или Самородок/10025.webp' },
    10026: { name: 'Золото', imageUrl: '/buildings/ресурсы/Ресурсы/Золото/10026.webp' },
    10027: { name: 'Зёрна гигантской пшеницы', imageUrl: '/buildings/ресурсы/Грядки/Зёрна гигантской пше/10027.webp' },
    10030: { name: 'Цветок подсолнуха', imageUrl: '/buildings/ресурсы/Грядки/Цветок подсолнуха/10030.webp' },
    10041: { name: 'Песок', imageUrl: '/buildings/ресурсы/Ресурсы/Песок/10041.webp' },
    10044: { name: 'Самородок', imageUrl: '/buildings/ресурсы/Ресурсы/Золотая руда или Самородок/10025.webp' },
    10046: { name: 'Энергетик', imageUrl: '/Gui/energy_potion.svg' },
    10047: { name: 'Тыквенный пирог', imageUrl: '/Gui/pumpkin_pie.svg' },
    10048: { name: 'Эликсир дровосека', imageUrl: '/Gui/lumberjack_elixir.svg' },
    10049: { name: 'Каменный укрепляющий раствор', imageUrl: '/Gui/stone_mortar.svg' },
    10050: { name: 'Связка хлопушек', imageUrl: '/Gui/firecracker_bundle.svg' },
};

/**
 * Calculates current 4-hour cycle index
 */
export function getCurrentOrdersCycle(now = Date.now()): number {
    return Math.floor(now / CYCLE_DURATION_MS);
}

/**
 * Returns formatted time remaining until the next 4-hour orders refresh
 */
export function getTimeUntilNextOrdersCycle(now = Date.now()): {
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
    totalMs: number;
} {
    const currentCycle = getCurrentOrdersCycle(now);
    const nextCycleMs = (currentCycle + 1) * CYCLE_DURATION_MS;
    const diff = Math.max(0, nextCycleMs - now);

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        hours,
        minutes,
        seconds,
        formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
        totalMs: diff,
    };
}

/**
 * Checks if skipping an order is currently allowed (24-hour cooldown)
 */
export function isOrderSkipAvailable(lastSkipTime = 0, now = Date.now()): boolean {
    if (!lastSkipTime || lastSkipTime <= 0) return true;
    return (now - lastSkipTime) >= SKIP_COOLDOWN_MS;
}

/**
 * Returns time remaining until the skip cooldown expires
 */
export function getTimeUntilSkipAvailable(lastSkipTime = 0, now = Date.now()): {
    available: boolean;
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
    totalMs: number;
} {
    if (isOrderSkipAvailable(lastSkipTime, now)) {
        return { available: true, hours: 0, minutes: 0, seconds: 0, formatted: 'Готов', totalMs: 0 };
    }

    const availableAt = lastSkipTime + SKIP_COOLDOWN_MS;
    const diff = Math.max(0, availableAt - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        available: false,
        hours,
        minutes,
        seconds,
        formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
        totalMs: diff,
    };
}

/**
 * Simple pseudo-random number generator from seed
 */
function seededRandom(seed: number): () => number {
    let s = Math.abs(seed) % 2147483647;
    if (s === 0) s = 1234567;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

interface ContractArchetype {
    title: string;
    description: string;
    icon: string;
    primaryId: number;
    secondaryId: number;
    tertiaryId?: number;
    rewardItemId: (tier: number, rand: () => number) => { id: number; amount: number };
}

const ARCHETYPES: ContractArchetype[] = [
    {
        title: 'Ремонт городских укреплений',
        description: 'Городская стража укрепляет фортификации перед сезоном штормов. Требуются стройматериалы.',
        icon: '🛡️',
        primaryId: 10002, // Доски
        secondaryId: 10005, // Камни
        tertiaryId: 10006, // Каменные блоки
        rewardItemId: (tier, rand) => {
            if (tier === 1) return { id: 10013, amount: rand() > 0.5 ? 2 : 1 }; // 1-2 петарды
            if (tier === 2) return { id: 10013, amount: 2 + Math.floor(rand() * 2) }; // 2-3 петарды
            if (tier === 3) return { id: 10010, amount: rand() > 0.5 ? 2 : 1 }; // 1-2 садовые бомбы
            if (tier === 4) return { id: 10017, amount: 1 }; // 1 детонатор
            return { id: 10015, amount: 1 }; // 1 ящик петард
        }
    },
    {
        title: 'Снабжение городских пекарен',
        description: 'Городу требуются свежие зерновые и овощные припасы для бесперебойного снабжения жителей.',
        icon: '🌾',
        primaryId: 10027, // Зёрна пшеницы
        secondaryId: 10004, // Куски тыквы
        tertiaryId: 10021, // Куски репки
        rewardItemId: (tier, rand) => {
            if (tier === 1) return { id: 10019, amount: 3 + Math.floor(rand() * 3) }; // 3-5 мешков муки
            if (tier === 2) return { id: 10019, amount: 6 + Math.floor(rand() * 4) }; // 6-9 муки
            if (tier === 3) return { id: 10044, amount: 3 + Math.floor(rand() * 3) }; // 3-5 самородков
            if (tier === 4) return { id: 10044, amount: 6 + Math.floor(rand() * 4) }; // 6-9 самородков
            return { id: 10044, amount: 10 + Math.floor(rand() * 6) }; // 10-15 самородков
        }
    },
    {
        title: 'Городская кузня и мастерские',
        description: 'Мастерам гильдии необходимо сырьё для литья инструментов и защитных механизмов.',
        icon: '⚒️',
        primaryId: 10022, // Руда
        secondaryId: 10008, // Бочка с нефтью
        tertiaryId: 10023, // Сталь
        rewardItemId: (tier, rand) => {
            if (tier === 1) return { id: 10006, amount: 3 + Math.floor(rand() * 3) }; // Каменные блоки
            if (tier === 2) return { id: 10023, amount: 2 + Math.floor(rand() * 2) }; // Сталь
            if (tier === 3) return { id: 10010, amount: 2 }; // Садовые бомбы
            if (tier === 4) return { id: 10017, amount: 1 }; // Детонатор
            return { id: 10017, amount: 2 }; // 2 Детонатора
        }
    },
    {
        title: 'Заготовка древесины и смолы',
        description: 'Плотницкий квартал испытывает нехватку свежего строевого леса и лесных материалов.',
        icon: '🪵',
        primaryId: 10001, // Дерево
        secondaryId: 10002, // Доски
        tertiaryId: 10003, // Куски гриба
        rewardItemId: (tier, rand) => {
            if (tier === 1) return { id: 10013, amount: 1 }; // 1 петарда
            if (tier === 2) return { id: 10013, amount: 2 }; // 2 петарды
            if (tier === 3) return { id: 10013, amount: 4 }; // 4 петарды
            if (tier === 4) return { id: 10010, amount: 3 }; // 3 садовые бомбы
            return { id: 10015, amount: 1 }; // 1 ящик петард
        }
    },
    {
        title: 'Оборонный заказ магистрата',
        description: 'Казначейство собирает ресурсы для фортификации сторожевых постов и патрулей.',
        icon: '🏰',
        primaryId: 10006, // Каменные блоки
        secondaryId: 10023, // Сталь
        tertiaryId: 10002, // Доски
        rewardItemId: (tier, rand) => {
            if (tier === 1) return { id: 10010, amount: 1 }; // 1 садовая бомба
            if (tier === 2) return { id: 10010, amount: 2 }; // 2 садовые бомбы
            if (tier === 3) return { id: 10044, amount: 4 }; // 4 самородка
            if (tier === 4) return { id: 10017, amount: 1 }; // 1 детонатор
            return { id: 10017, amount: 2 }; // 2 детонатора
        }
    }
];

/**
 * Generates an individual contract scaled by town hall level and player level
 */
export function generateTownHallOrder(
    slotIndex: number,
    townHallLevel: number,
    playerLevel: number,
    cycle: number,
    extraSalt = 0
): TownHallOrder {
    const effectiveTh = Math.max(1, townHallLevel || 1);
    const effectivePl = Math.max(1, playerLevel || 1);

    // Progression tier from 1 to 5
    const tier = Math.min(5, Math.max(1, Math.ceil((effectiveTh + Math.floor(effectivePl / 4)) / 4)));

    const seed = cycle * 10007 + slotIndex * 1013 + effectiveTh * 97 + extraSalt * 313;
    const rand = seededRandom(seed);

    // Pick archetype ensuring variation across slots
    const archetypeIndex = Math.floor((slotIndex * 2 + rand() * ARCHETYPES.length)) % ARCHETYPES.length;
    const archetype = ARCHETYPES[archetypeIndex];

    // Scaling multipliers per tier
    // Tier 1: basic early game (15-40 planks, 10-25 stones)
    // Tier 2: mid early game (40-90 planks, 30-70 stones)
    // Tier 3: established (90-180 planks, 60-120 stones)
    // Tier 4: advanced (180-350 planks)
    // Tier 5: late game endgame (350-600 planks)
    let primaryBase = 25;
    let secondaryBase = 15;
    let goldBase = 3000;
    let gloryBase = 50;

    switch (tier) {
        case 1:
            primaryBase = 20 + Math.floor(rand() * 20); // 20 - 40
            secondaryBase = 10 + Math.floor(rand() * 15); // 10 - 25
            goldBase = 2000 + Math.floor(rand() * 1500); // 2,000 - 3,500
            gloryBase = 40 + Math.floor(rand() * 30); // 40 - 70
            break;
        case 2:
            primaryBase = 50 + Math.floor(rand() * 40); // 50 - 90
            secondaryBase = 30 + Math.floor(rand() * 30); // 30 - 60
            goldBase = 5000 + Math.floor(rand() * 4000); // 5,000 - 9,000
            gloryBase = 80 + Math.floor(rand() * 60); // 80 - 140
            break;
        case 3:
            primaryBase = 100 + Math.floor(rand() * 70); // 100 - 170
            secondaryBase = 60 + Math.floor(rand() * 50); // 60 - 110
            goldBase = 12000 + Math.floor(rand() * 8000); // 12,000 - 20,000
            gloryBase = 160 + Math.floor(rand() * 90); // 160 - 250
            break;
        case 4:
            primaryBase = 200 + Math.floor(rand() * 120); // 200 - 320
            secondaryBase = 120 + Math.floor(rand() * 90); // 120 - 210
            goldBase = 25000 + Math.floor(rand() * 18000); // 25,000 - 43,000
            gloryBase = 280 + Math.floor(rand() * 140); // 280 - 420
            break;
        case 5:
        default:
            primaryBase = 350 + Math.floor(rand() * 200); // 350 - 550
            secondaryBase = 200 + Math.floor(rand() * 150); // 200 - 350
            goldBase = 50000 + Math.floor(rand() * 30000); // 50,000 - 80,000
            gloryBase = 450 + Math.floor(rand() * 250); // 450 - 700
            break;
    }

    // Adjust quantities for heavier resources (e.g. blocks/steel require fewer units than raw wood)
    const scaleForResource = (itemId: number, baseAmount: number) => {
        if ([10006, 10008, 10009, 10019, 10023].includes(itemId)) {
            return Math.max(3, Math.floor(baseAmount * 0.25));
        }
        if ([10021, 10003, 10004, 10027, 10030].includes(itemId)) {
            return Math.max(5, Math.floor(baseAmount * 0.45));
        }
        return baseAmount;
    };

    const requirements: OrderRequirement[] = [
        {
            id: archetype.primaryId,
            name: BASE_ITEMS_CATALOG[archetype.primaryId]?.name || 'Ресурс',
            amount: scaleForResource(archetype.primaryId, primaryBase),
            imageUrl: BASE_ITEMS_CATALOG[archetype.primaryId]?.imageUrl || ''
        },
        {
            id: archetype.secondaryId,
            name: BASE_ITEMS_CATALOG[archetype.secondaryId]?.name || 'Ресурс',
            amount: scaleForResource(archetype.secondaryId, secondaryBase),
            imageUrl: BASE_ITEMS_CATALOG[archetype.secondaryId]?.imageUrl || ''
        }
    ];

    // On tier 3+, add a 3rd smaller resource requirement if available
    if (tier >= 3 && archetype.tertiaryId) {
        const tertiaryBase = Math.max(4, Math.floor(secondaryBase * 0.4));
        requirements.push({
            id: archetype.tertiaryId,
            name: BASE_ITEMS_CATALOG[archetype.tertiaryId]?.name || 'Ресурс',
            amount: scaleForResource(archetype.tertiaryId, tertiaryBase),
            imageUrl: BASE_ITEMS_CATALOG[archetype.tertiaryId]?.imageUrl || ''
        });
    }

    // Determine non-ruby reward items
    const rawRewardItem = archetype.rewardItemId(tier, rand);
    const rewardItems: OrderRewardItem[] = [];
    if (rawRewardItem.id !== 10014 && BASE_ITEMS_CATALOG[rawRewardItem.id]) { // STRICT: Never rubies
        rewardItems.push({
            id: rawRewardItem.id,
            name: BASE_ITEMS_CATALOG[rawRewardItem.id].name,
            amount: Math.max(1, rawRewardItem.amount),
            imageUrl: BASE_ITEMS_CATALOG[rawRewardItem.id].imageUrl
        });
    }

    return {
        id: `th_order_${cycle}_${slotIndex}_${tier}_${extraSalt}`,
        slotIndex,
        title: archetype.title,
        description: archetype.description,
        icon: archetype.icon,
        tier,
        requirements,
        rewardGold: goldBase,
        rewardGlory: gloryBase,
        rewardItems,
        completed: false
    };
}

/**
 * Generates 3 contracts for the current cycle
 */
export function generateThreeTownHallOrders(
    townHallLevel: number,
    playerLevel: number,
    cycle = getCurrentOrdersCycle()
): TownHallOrder[] {
    return [0, 1, 2].map(slotIndex =>
        generateTownHallOrder(slotIndex, townHallLevel, playerLevel, cycle)
    );
}

/**
 * Checks if the player has all required resources in inventory
 */
export function canFulfillTownHallOrder(
    order: TownHallOrder,
    inventory: Record<number, number> = {}
): boolean {
    if (order.completed) return false;
    return order.requirements.every(req => (Number(inventory[req.id]) || 0) >= req.amount);
}

/**
 * Ensures contract strings (title, description, icon, item names, image paths)
 * are always canonical and immune to any network/storage encoding issues or mojibake.
 */
export function normalizeTownHallOrder(order: TownHallOrder): TownHallOrder {
    if (!order) return order;

    const primaryId = order.requirements?.[0]?.id;
    const secondaryId = order.requirements?.[1]?.id;
    const archetype = ARCHETYPES.find(a => a.primaryId === primaryId && a.secondaryId === secondaryId)
        || ARCHETYPES[order.slotIndex % ARCHETYPES.length];

    const cleanRequirements = (order.requirements || []).map(req => {
        const cat = BASE_ITEMS_CATALOG[req.id];
        return {
            ...req,
            name: cat?.name || req.name || 'Ресурс',
            imageUrl: cat?.imageUrl || req.imageUrl || ''
        };
    });

    const cleanRewardItems = (order.rewardItems || []).map(item => {
        const cat = BASE_ITEMS_CATALOG[item.id];
        return {
            ...item,
            name: cat?.name || item.name || 'Награда',
            imageUrl: cat?.imageUrl || item.imageUrl || ''
        };
    });

    return {
        ...order,
        title: archetype?.title || order.title,
        description: archetype?.description || order.description,
        icon: archetype?.icon || order.icon || '📜',
        requirements: cleanRequirements,
        rewardItems: cleanRewardItems
    };
}
