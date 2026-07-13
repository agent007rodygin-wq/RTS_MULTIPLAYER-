export type MarketBuySection = 'resources' | 'beds' | 'monsters';
export type MarketResourceSection = 'wood' | 'stone' | 'oil' | 'ore' | 'gold' | 'emerald' | 'misc';
export type MarketBedSection = 'mushroom' | 'pumpkin' | 'turnip' | 'lily' | 'wheat' | 'sunflower';
export type MarketMonsterSection = 'hut' | 'gorynych' | 'troll';

export const GENERAL_MARKET_ENGLISH_NAMES = new Set(['Market']);
export const MILITARY_MARKET_ENGLISH_NAMES = new Set(['Military Market']);
export const MILITARY_ITEM_IDS = [10010, 10011, 10012, 10013, 10015, 10016, 10017, 10042, 10043];

export const MARKET_BUY_SECTION_LABELS: Record<MarketBuySection, string> = {
    resources: 'Ресурсы',
    beds: 'Грядки',
    monsters: 'Монстры',
};

export const MARKET_RESOURCE_SECTION_LABELS: Record<MarketResourceSection, string> = {
    wood: 'Дерево',
    stone: 'Камни',
    oil: 'Нефть/Бензин',
    ore: 'Руда',
    gold: 'Золото',
    emerald: 'Изумруд',
    misc: 'Разное',
};

export const MARKET_BED_SECTION_LABELS: Record<MarketBedSection, string> = {
    mushroom: 'Грибы',
    pumpkin: 'Тыквы',
    turnip: 'Репка',
    lily: 'Лилии',
    wheat: 'Пшеница',
    sunflower: 'Подсолнух',
};

export const MARKET_MONSTER_SECTION_LABELS: Record<MarketMonsterSection, string> = {
    hut: 'Избушка',
    gorynych: 'Горыныч',
    troll: 'Тролли',
};

export const GENERAL_MARKET_RESOURCE_SECTION_IDS: Record<MarketResourceSection, number[]> = {
    wood: [10001, 10002, 10035],
    stone: [10005, 10006],
    oil: [10008, 10009],
    ore: [10022, 10023, 10040],
    gold: [10025, 10026],
    emerald: [10034, 10036],
    misc: [10019, 10028, 10029, 10032, 10033, 10041, 10039, 10038],
};

export const GENERAL_MARKET_BED_SECTION_IDS: Record<MarketBedSection, number[]> = {
    mushroom: [10003],
    pumpkin: [10004],
    turnip: [10021],
    lily: [10024],
    wheat: [10027],
    sunflower: [10030],
};

export const GENERAL_MARKET_MONSTER_SECTION_IDS: Record<MarketMonsterSection, number[]> = {
    hut: [10007],
    gorynych: [10018],
    troll: [10037],
};
