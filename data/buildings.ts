
import { Building, BuildingType } from '../types';
import { validateBuildingItemNames } from './validateBuildingItemNames';

export const buildings: Building[] = [
  {
    id: 301,
    name: 'Городской центр',
    englishName: 'Town Hall',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 10,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      accelerationCost: 0,
      permits: 5,
      durability: 40,
      gloryOnExplosion: 1,
      populationBonus: 8, // Added starting population
    },
    drops: {
      rare: [{ id: 10001, name: 'Дерево', amount: 2, chance: 30 }]
    },
    description: 'Центр нужен для управления городом. Чем выше уровень «Городского центра» тем больше зданий игрок может построить.',
    imageUrl: '/buildings/TawnHall/301.webp',
    upgradesTo: 306,
    upgradeCost: 500,
  },
  {
    id: 306,
    name: 'Городской центр 2',
    englishName: 'Town Hall 2',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 500,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 1 }
      ],
      population: 2,
    },
    stats: {
      constructionTimeSeconds: 440, // 7m 20s
      accelerationCost: 4,
      permits: 8,
      durability: 232,
      gloryOnExplosion: 25,
      populationBonus: 15
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 7 },
        { id: 10008, name: 'Бочка с нефтью', amount: 3 }
      ],
      rare: [
        { id: 10041, name: 'Песок', amount: 2 }
      ]
    },
    description: 'Улучшенный центр города, позволяющий строить больше зданий.',
    imageUrl: '/buildings/TawnHall/306.webp',
    upgradesTo: 312,
    upgradeCost: 8770,
  },
  {
    id: 312,
    name: 'Городской центр 3',
    englishName: 'Town Hall 3',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 8770,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 23 }
      ],
      population: 4,
    },
    stats: {
      constructionTimeSeconds: 1120, // 18m 40s
      accelerationCost: 7,
      permits: 11,
      durability: 1024,
      gloryOnExplosion: 439,
      populationBonus: 25
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 46 },
        { id: 10009, name: 'Канистра с бензином', amount: 31 }
      ],
      rare: [
        { id: 10018, name: 'Яйцо Горыныча', amount: 2 }
      ]
    },
    description: 'Центр города 3 уровня. Еще больше разрешений на строительство и укрепленная защита.',
    imageUrl: '/buildings/TawnHall/312.webp',
    upgradesTo: 331,
    upgradeCost: 28020,
  },
  {
    id: 331,
    name: 'Городской центр 4',
    englishName: 'Town Hall 4',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 28020,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 74 },
        { id: 10002, name: 'Доски', amount: 28 }
      ],
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 2280, // 38 mins
      accelerationCost: 10,
      permits: 14,
      durability: 1904,
      gloryOnExplosion: 1401,
      populationBonus: 35
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 3 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 2 }
      ]
    },
    description: 'Центр города 4 уровня. Открывает новые горизонты развития.',
    imageUrl: '/buildings/TawnHall/331.webp',
    upgradesTo: 345,
    upgradeCost: 68610,
  },
  {
    id: 345,
    name: 'Городской центр 5',
    englishName: 'Town Hall 5',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 68610,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 181 },
        { id: 10002, name: 'Доски', amount: 69 }
      ],
      population: 8,
    },
    stats: {
      constructionTimeSeconds: 4160, // 1h 9m 20s
      accelerationCost: 14,
      permits: 17,
      durability: 3080,
      gloryOnExplosion: 3431,
      populationBonus: 45
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 7 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 13 }
      ]
    },
    description: 'Центр города 5 уровня. Вершина развития вашего города.',
    imageUrl: '/buildings/TawnHall/345.webp',
    upgradesTo: 346,
    upgradeCost: 142420,
  },
  {
    id: 346,
    name: 'Городской центр 6',
    englishName: 'Town Hall 6',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 142420,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 375 },
        { id: 10002, name: 'Доски', amount: 142 },
        { id: 10005, name: 'Камни', amount: 40 }
      ],
      population: 10,
    },
    stats: {
      constructionTimeSeconds: 7000, // 1h 56m 40s
      accelerationCost: 28,
      permits: 20,
      durability: 4584,
      gloryOnExplosion: 3431,
      populationBonus: 45
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 7 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 13 }
      ]
    },
    description: 'Центр города 6 уровня. Вершина развития вашего города.',
    imageUrl: '/buildings/TawnHall/346.webp',
    upgradesTo: 347,
    upgradeCost: 263970,
  },
  {
    id: 347,
    name: 'Городской центр 7',
    englishName: 'Town Hall 7',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 263970,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 695 },
        { id: 10002, name: 'Доски', amount: 264 },
        { id: 10005, name: 'Камни', amount: 73 }
      ],
      population: 13,
    },
    stats: {
      constructionTimeSeconds: 7000, // 1h 56m 40s
      accelerationCost: 28,
      permits: 2000,
      durability: 6432,
      gloryOnExplosion: 13199,
      populationBonus: 50
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 7 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 13 }
      ]
    },
    description: 'Центр города 7 уровня. Вершина развития вашего города.',
    imageUrl: '/buildings/TawnHall/347.webp',
    upgradesTo: 348,
    upgradeCost: 450420,
  },
  {
    id: 348,
    name: 'Городской центр 8',
    englishName: 'Town Hall 8',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 450420,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 1185 },
        { id: 10002, name: 'Доски', amount: 450 },
        { id: 10005, name: 'Камни', amount: 125 }
      ],
      population: 16,
    },
    stats: {
      constructionTimeSeconds: 23680, // 6h 34m 40s
      accelerationCost: 32,
      permits: 26,
      durability: 8648,
      gloryOnExplosion: 22521,
      populationBonus: 55
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 38 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 102 }
      ]
    },
    description: 'Центр города 8 уровня.',
    imageUrl: '/buildings/TawnHall/348.webp',
    upgradesTo: 349,
    upgradeCost: 721570,
  },
  {
    id: 349,
    name: 'Городской центр 9',
    englishName: 'Town Hall 9',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 721570,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 200 },
        { id: 10006, name: 'Каменные блоки', amount: 72 },
        { id: 10024, name: 'Супер лилия', amount: 24 }
      ],
      population: 19,
    },
    stats: {
      constructionTimeSeconds: 38095, // 10h 34m 55s
      accelerationCost: 41,
      permits: 29,
      durability: 11240,
      gloryOnExplosion: 36079,
      populationBonus: 60
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 12 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 46 }
      ]
    },
    description: 'Центр города 9 уровня.',
    imageUrl: '/buildings/TawnHall/349.webp',
    upgradesTo: 350,
    upgradeCost: 1099860,
  },
  {
    id: 350,
    name: 'Городской центр 10',
    englishName: 'Town Hall 10',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 1099860,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 306 },
        { id: 10006, name: 'Каменные блоки', amount: 110 },
        { id: 10024, name: 'Супер лилия', amount: 37 }
      ],
      population: 22,
    },
    stats: {
      constructionTimeSeconds: 57640, // 16h 40s
      accelerationCost: 51,
      permits: 32,
      durability: 14240,
      gloryOnExplosion: 54993,
      populationBonus: 65
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 8 },
        { id: 10045, name: 'Супер детонатор', amount: 5 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 35 }
      ]
    },
    description: 'Центр города 10 уровня.',
    imageUrl: '/buildings/TawnHall/350.webp',
    upgradesTo: 351,
    upgradeCost: 1610370,
  },
  {
    id: 351,
    name: 'Городской центр 11',
    englishName: 'Town Hall 11',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 1610370,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10032, name: 'Рекомендация', amount: 16 },
        { id: 10023, name: 'Сталь', amount: 4 },
        { id: 10003, name: 'Куски супер гриба', amount: 24 }
      ],
      population: 26,
    },
    stats: {
      constructionTimeSeconds: 93080, // 1d 1h 51m 20s
      accelerationCost: 64,
      permits: 35,
      durability: 17656,
      gloryOnExplosion: 80519,
      populationBonus: 70
    },
    drops: {
      frequent: [
        { id: 10045, name: 'Супер детонатор', amount: 7 },
        { id: 10024, name: 'Стальной лист', amount: 12 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 8 }
      ]
    },
    description: 'Центр города 11 уровня.',
    imageUrl: '/buildings/TawnHall/351.webp',
    upgradesTo: 352,
    upgradeCost: 2280820,
  },
  {
    id: 352,
    name: 'Городской центр 12',
    englishName: 'Town Hall 12',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 2280820,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10032, name: 'Рекомендация', amount: 23 },
        { id: 10023, name: 'Сталь', amount: 5 },
        { id: 10003, name: 'Куски супер гриба', amount: 34 }
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 141060, // 1d 15h 10m
      accelerationCost: 79,
      permits: 38,
      durability: 21504,
      gloryOnExplosion: 114041,
      populationBonus: 75
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 42 },
        { id: 10024, name: 'Стальной лист', amount: 17 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 628 }
      ]
    },
    description: 'Центр города 12 уровня.',
    imageUrl: '/buildings/TawnHall/352.webp',
    upgradesTo: 353,
    upgradeCost: 3141570,
  },
  {
    id: 353,
    name: 'Городской центр 13',
    englishName: 'Town Hall 13',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 3141570,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 7 },
        { id: 10004, name: 'Куски супер тыквы', amount: 28 }
      ],
      population: 34,
    },
    stats: {
      constructionTimeSeconds: 188120, // 2d 8h 28m 40s
      accelerationCost: 95,
      permits: 41,
      durability: 25808,
      gloryOnExplosion: 157079,
      populationBonus: 80
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 8 },
        { id: 10036, name: 'Изумрудная руда', amount: 17 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 241 }
      ]
    },
    description: 'Центр города 13 уровня.',
    imageUrl: '/buildings/TawnHall/353.webp',
    upgradesTo: 354,
    upgradeCost: 4225620,
  },
  {
    id: 354,
    name: 'Городской центр 14',
    englishName: 'Town Hall 14',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 4225620,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 9 },
        { id: 10004, name: 'Куски супер тыквы', amount: 38 }
      ],
      population: 38,
    },
    stats: {
      constructionTimeSeconds: 273560,
      accelerationCost: 112,
      permits: 44,
      durability: 30568,
      gloryOnExplosion: 211281,
      populationBonus: 85
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 37 },
        { id: 10023, name: 'Сталь', amount: 89 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 161 }
      ]
    },
    description: 'Центр города 14 уровня.',
    imageUrl: '/buildings/TawnHall/354.webp',
    upgradesTo: 355,
    upgradeCost: 5568610,
  },
  {
    id: 355,
    name: 'Городской центр 15',
    englishName: 'Town Hall 15',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 5568610,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 12 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 3 }
      ],
      population: 43,
    },
    stats: {
      constructionTimeSeconds: 403735,
      accelerationCost: 134,
      permits: 47,
      durability: 35816,
      gloryOnExplosion: 278431,
      populationBonus: 90
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 51 },
        { id: 10045, name: 'Супер детонатор', amount: 27 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 30 }
      ]
    },
    description: 'Центр города 15 уровня.',
    imageUrl: '/buildings/TawnHall/355.webp',
    upgradesTo: 360,
    upgradeCost: 7208820,
  },
  {
    id: 360,
    name: 'Городской центр 16',
    englishName: 'Town Hall 16',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 7208820,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 16 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 4 }
      ],
      population: 48,
    },
    stats: {
      constructionTimeSeconds: 561560,
      accelerationCost: 158,
      permits: 50,
      durability: 41560,
      gloryOnExplosion: 360441,
      populationBonus: 95
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 69 },
        { id: 10023, name: 'Сталь', amount: 164 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 2343 }
      ]
    },
    description: 'Центр города 16 уровня.',
    imageUrl: '/buildings/TawnHall/360.webp',
    upgradesTo: 361,
    upgradeCost: 9187170,
  },
  {
    id: 361,
    name: 'Городской центр 17',
    englishName: 'Town Hall 17',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 9187170,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 8 },
        { id: 10034, name: 'Изумруд', amount: 2 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 5 }
      ],
      population: 53,
    },
    stats: {
      constructionTimeSeconds: 754385,
      accelerationCost: 183,
      permits: 53,
      durability: 47816,
      gloryOnExplosion: 459359,
      populationBonus: 100
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 91 },
        { id: 10045, name: 'Супер детонатор', amount: 48 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 827 }
      ]
    },
    description: 'Центр города 17 уровня.',
    imageUrl: '/buildings/TawnHall/361.webp',
    upgradesTo: 371,
    upgradeCost: 11547220,
  },
  {
    id: 371,
    name: 'Городской центр 18',
    englishName: 'Town Hall 18',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 11547220,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 10 },
        { id: 10034, name: 'Изумруд', amount: 3 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 6 }
      ],
      population: 58,
    },
    stats: {
      constructionTimeSeconds: 988360,
      accelerationCost: 209,
      permits: 56,
      durability: 54584,
      gloryOnExplosion: 577361,
      populationBonus: 105
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 35 },
        { id: 10036, name: 'Изумрудная руда', amount: 72 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 68 }
      ]
    },
    description: 'Центр города 18 уровня.',
    imageUrl: '/buildings/TawnHall/371.webp',
    upgradesTo: 381,
    upgradeCost: 14335170,
  },
  {
    id: 381,
    name: 'Городской центр 19',
    englishName: 'Town Hall 19',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 14335170,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 13 },
        { id: 10034, name: 'Изумруд', amount: 4 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 8 }
      ],
      population: 64,
    },
    stats: {
      constructionTimeSeconds: 1328320,
      accelerationCost: 243,
      permits: 59,
      durability: 61896,
      gloryOnExplosion: 716759,
      populationBonus: 110
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 347 },
        { id: 10024, name: 'Стальной лист', amount: 139 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 1386 }
      ]
    },
    description: 'Центр города 19 уровня.',
    imageUrl: '/buildings/TawnHall/381.webp',
    upgradesTo: 413,
    upgradeCost: 17599860,
  },
  {
    id: 413,
    name: 'Городской центр 20',
    englishName: 'Town Hall 20',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 17599860,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 16 },
        { id: 10034, name: 'Изумруд', amount: 5 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 10 }
      ],
      population: 70,
    },
    stats: {
      constructionTimeSeconds: 1732600,
      accelerationCost: 277,
      permits: 62,
      durability: 69760,
      gloryOnExplosion: 879993,
      populationBonus: 115
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 56 },
        { id: 10036, name: 'Изумрудная руда', amount: 118 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 1760 }
      ]
    },
    description: 'Центр города 20 уровня.',
    imageUrl: '/buildings/TawnHall/413.webp',
    upgradesTo: 414,
    upgradeCost: 21392770,
  },
  {
    id: 414,
    name: 'Городской центр 21',
    englishName: 'Town Hall 21',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 21392770,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 19 },
        { id: 10034, name: 'Изумруд', amount: 6 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 12 }
      ],
      population: 76,
    },
    stats: {
      constructionTimeSeconds: 2214880,
      accelerationCost: 313,
      permits: 65,
      durability: 78176,
      gloryOnExplosion: 1069639,
      populationBonus: 120
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 242 },
        { id: 10023, name: 'Сталь', amount: 578 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 1048 }
      ]
    },
    description: 'Центр города 21 уровня.',
    imageUrl: '/buildings/TawnHall/414.webp',
    upgradesTo: 452,
    upgradeCost: 25768020,
  },
  {
    id: 452,
    name: 'Городской центр 22',
    englishName: 'Town Hall 22',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 25768020,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 23 },
        { id: 10034, name: 'Изумруд', amount: 7 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 14 }
      ],
      population: 82,
    },
    stats: {
      constructionTimeSeconds: 2772120,
      accelerationCost: 351,
      permits: 68,
      durability: 87176,
      gloryOnExplosion: 1288401,
      populationBonus: 125
    },
    drops: {
      frequent: [
        { id: 10045, name: 'Супер детонатор', amount: 158 },
        { id: 10024, name: 'Стальной лист', amount: 275 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 10308 }
      ]
    },
    description: 'Центр города 22 уровня.',
    imageUrl: '/buildings/TawnHall/452.webp',
    upgradesTo: 726,
    upgradeCost: 30782370,
  },
  {
    id: 726,
    name: 'Городской центр 23',
    englishName: 'Town Hall 23',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 30782370,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 28 },
        { id: 10034, name: 'Изумруд', amount: 8 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 17 }
      ],
      population: 89,
    },
    stats: {
      constructionTimeSeconds: 3365285,
      accelerationCost: 397,
      permits: 71,
      durability: 96760,
      gloryOnExplosion: 1539119,
      populationBonus: 130
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 370 },
        { id: 10023, name: 'Сталь', amount: 886 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 1604 }
      ]
    },
    description: 'Центр города 23 уровня.',
    imageUrl: '/buildings/TawnHall/726.webp',
    upgradesTo: 752,
    upgradeCost: 36495220,
  },
  {
    id: 752,
    name: 'Городской центр 24',
    englishName: 'Town Hall 24',
    category: 'Центр города',
    type: BuildingType.TownHall,
    price: 36495220,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 33 },
        { id: 10034, name: 'Изумруд', amount: 10 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 20 }
      ],
      population: 96,
    },
    stats: {
      constructionTimeSeconds: 4132800,
      accelerationCost: 444,
      permits: 2500,
      durability: 106936,
      gloryOnExplosion: 1824761,
      populationBonus: 135
    },
    drops: {
      frequent: [
        { id: 10045, name: 'Супер детонатор', amount: 238 },
        { id: 10024, name: 'Стальной лист', amount: 414 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 15511 }
      ]
    },
    description: 'Центр города 24 уровня. Максимальный уровень.',
    imageUrl: '/buildings/TawnHall/752.webp'
  },
  {
    id: 1,
    name: 'Лягушачья нора',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 25,
    buildable: true,
    constructionRequirements: {
      population: 2
    },
    stats: {
      populationBonus: 2,
      constructionTimeSeconds: 40,
      accelerationCost: 1,
      durability: 48,
      gloryOnExplosion: 1
    },
    drops: {
      rare: [{ id: 10001, name: 'Дерево', amount: 5, chance: 30 }]
    },
    description: 'Маленький домик для самых неприхотливых жителей.',
    imageUrl: '/buildings/residential/1.webp',
    upgradesTo: 26,
    upgradeCost: 90,
  },
  {
    id: 26,
    name: 'Лягушачья нора 2',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 0,
    buildable: false,
    constructionRequirements: {
      population: 3
    },
    stats: {
      populationBonus: 3,
      constructionTimeSeconds: 81,
      accelerationCost: 2,
      durability: 96,
      gloryOnExplosion: 5,
      givesCoins: 58
    },
    drops: {
      frequent: [{ id: 10001, name: 'Дерево', amount: 2, chance: 50 }],
      rare: [{ id: 10013, name: 'Петарда', amount: 3, chance: 30 }]
    },
    description: 'Улучшенная нора с занавесками.',
    imageUrl: '/buildings/residential/26.webp',
    upgradesTo: 53,
    upgradeCost: 210,
  },
  {
    id: 5,
    name: 'Деревянный дом',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 2000,
    buildable: true,
    constructionRequirements: {},
    stats: {
      populationBonus: 5,
      constructionTimeSeconds: 30,
      durability: 300,
      gloryOnExplosion: 10
    },
    drops: {},
    description: 'Простой, но уютный деревянный дом.',
    imageUrl: '/buildings/residential/5.webp',
    upgradesTo: 6,
    upgradeCost: 4000,
  },
  {
    id: 7,
    name: 'Кирпичный дом',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 25000,
    buildable: true,
    constructionRequirements: {},
    stats: {
      populationBonus: 10,
      constructionTimeSeconds: 120,
      durability: 800,
      gloryOnExplosion: 50
    },
    drops: {},
    description: 'Надежный дом из кирпича.',
    imageUrl: '/buildings/residential/7.webp',
    upgradesTo: 1000,
    upgradeCost: 50000
  },
  {
    id: 1000,
    name: 'Двухэтажный дом',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 50000,
    buildable: false,
    constructionRequirements: {},
    stats: {
      populationBonus: 15,
      constructionTimeSeconds: 300,
      durability: 1200,
      gloryOnExplosion: 100
    },
    drops: {},
    description: 'Больше места для вашей растущей популяции.',
    imageUrl: '/buildings/residential/9.webp',
    upgradesTo: 1001,
    upgradeCost: 100000
  },
  {
    id: 1001,
    name: 'Дом с гаражом',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 100000,
    buildable: false,
    constructionRequirements: {},
    stats: {
      populationBonus: 20,
      constructionTimeSeconds: 600,
      durability: 1500,
      gloryOnExplosion: 150
    },
    drops: {},
    description: 'Современный дом с местом для вашего гномомобиля.',
    imageUrl: '/buildings/residential/10.webp',
    upgradesTo: 28,
    upgradeCost: 150000
  },
  {
    id: 28,
    name: 'Каменный дом 4',
    englishName: 'Stone house 12',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 150000,
    buildable: false,
    constructionRequirements: {
      population: 21,
      resources: [
        { id: 10005, name: 'Камни', amount: 42 },
        { id: 10006, name: 'Каменные блоки', amount: 15 },
        { id: 10024, name: 'Супер лилия', amount: 5 }
      ]
    },
    stats: {
      populationBonus: 15,
      constructionTimeSeconds: 27783,
      accelerationCost: 35,
      durability: 5512,
      gloryOnExplosion: 7500
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10033, name: 'Черепки', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 3 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 17 }
      ]
    },
    description: 'Каменный дом 4 - Stone house 12',
    imageUrl: '/buildings/residential/28.webp',
    upgradesTo: 219,
    upgradeCost: 200000
  },
  {
    id: 219,
    name: 'Каменный дом 5',
    englishName: 'Stone house 1',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 200000,
    buildable: false,
    constructionRequirements: {
      population: 19,
      resources: [
        { id: 10005, name: 'Камни', amount: 56 },
        { id: 10006, name: 'Каменные блоки', amount: 20 },
        { id: 10024, name: 'Супер лилия', amount: 7 }
      ]
    },
    stats: {
      populationBonus: 16,
      constructionTimeSeconds: 20577,
      accelerationCost: 30,
      durability: 4504,
      gloryOnExplosion: 10000
    },
    drops: {
      frequent: [
        { id: 10033, name: 'Черепки', amount: 10 },
        { id: 10018, name: 'Яйцо Горыныча', amount: 3 },
        { id: 10021, name: 'Супер репка', amount: 2 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 4 }
      ]
    },
    description: 'Каменный дом 5 - Stone house 1',
    imageUrl: '/buildings/residential/219.webp',
    upgradesTo: 220,
    upgradeCost: 400000
  },
  {
    id: 220,
    name: 'Каменный дом 6',
    englishName: 'Stone house 13',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 400000,
    buildable: false,
    constructionRequirements: {
      population: 27,
      resources: [
        { id: 10005, name: 'Камни', amount: 111 },
        { id: 10006, name: 'Каменные блоки', amount: 40 },
        { id: 10024, name: 'Супер лилия', amount: 13 }
      ]
    },
    stats: {
      populationBonus: 18,
      constructionTimeSeconds: 59049,
      accelerationCost: 51,
      durability: 9208,
      gloryOnExplosion: 20000
    },
    drops: {
      frequent: [
        { id: 10033, name: 'Черепки', amount: 12 },
        { id: 10042, name: '??????', amount: 2 },
        { id: 10040, name: 'Стальной лист', amount: 4 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 115 }
      ]
    },
    description: 'Каменный дом 6 - Stone house 13',
    imageUrl: '/buildings/residential/220.webp',
    upgradesTo: 1002,
    upgradeCost: 500000
  },
  {
    id: 1002,
    name: 'Особняк',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 500000,
    buildable: true,
    constructionRequirements: {},
    stats: {
      populationBonus: 30,
      constructionTimeSeconds: 1800,
      durability: 2500,
      gloryOnExplosion: 300
    },
    drops: {},
    description: 'Роскошный особняк для самых богатых жителей.',
    imageUrl: '/buildings/residential/100.webp',
    upgradesTo: 101,
    upgradeCost: 700000,
  },
  {
    id: 146,
    name: 'Вилла',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 1500000,
    buildable: true,
    constructionRequirements: {},
    stats: {
      populationBonus: 50,
      constructionTimeSeconds: 3600,
      durability: 4000,
      gloryOnExplosion: 500
    },
    drops: {},
    description: 'Элитная вилла с бассейном и видом на закат.',
    imageUrl: '/buildings/residential/146.webp',
    upgradesTo: 148,
    upgradeCost: 1400000,
  },
  {
    id: 205,
    name: 'Дворец',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 5000000,
    buildable: true,
    constructionRequirements: {},
    stats: {
      populationBonus: 100,
      constructionTimeSeconds: 10800,
      durability: 8000,
      gloryOnExplosion: 1000
    },
    drops: {},
    description: 'Величественный дворец, достойный короля гномов.',
    imageUrl: '/buildings/residential/205.webp',
    upgradesTo: 206,
    upgradeCost: 5800000,
  },
  {
    id: 70,
    name: 'Грибная грядка',
    englishName: 'Mushroom Bed',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 400,
    buildable: true,
    constructionRequirements: {
      population: 4,
    },
    stats: {
      constructionTimeSeconds: 80, // 1 minute 20 seconds
      accelerationCost: 2,
      durability: 1,
      gloryOnExplosion: 20,
      takesPopulation: 2,
      workTimeSeconds: 80, // 1 minute 20 seconds
      workYieldGold: 5,
      givesCoins: 181,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 30, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10008, name: 'Бочка с нефтью', amount: 3 }
      ],
      rare: [
        { id: 10005, name: 'Камни', amount: 8 }
      ]
    },
    description: 'Грядка для выращивания грибов.',
    imageUrl: '/buildings/garden_beds/mushroom/mushroom_bed/70.webp',
  },
  {
    id: 71,
    name: 'Грибная грядка 2',
    englishName: 'Mushroom Bed 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5,
    buildable: false,
    constructionRequirements: {
      population: 4,
    },
    stats: {
      constructionTimeSeconds: 80,
      accelerationCost: 2,
      durability: 1,
      gloryOnExplosion: 20,
      takesPopulation: 2,
      workTimeSeconds: 80,
      workYieldGold: 5,
      givesCoins: 181
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10009, name: 'Канистра с бензином', amount: 2 },
        { id: 999, name: 'Монеты', amount: 181 }
      ],
      rare: []
    },
    description: 'Грядка для выращивания грибов.',
    imageUrl: '/buildings/garden_beds/mushroom/mushroom_bed/71.webp',
  },
  {
    id: 72,
    name: 'Грибная грядка 3',
    englishName: 'Mushroom Bed 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5,
    buildable: false,
    constructionRequirements: {
      population: 4,
    },
    stats: {
      constructionTimeSeconds: 80,
      accelerationCost: 2,
      durability: 1,
      gloryOnExplosion: 20,
      takesPopulation: 2,
      workTimeSeconds: 80,
      workYieldGold: 5,
      givesCoins: 181
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10008, name: 'Бочка с нефтью', amount: 3 },
        { id: 999, name: 'Монеты', amount: 181 }
      ],
      rare: [
        { id: 10010, name: 'Садовая бомба', amount: 4 }
      ]
    },
    description: 'Грядка для выращивания грибов.',
    imageUrl: '/buildings/garden_beds/mushroom/mushroom_bed/72.webp',
  },
  {
    id: 73,
    name: 'Грибная грядка 4',
    englishName: 'Mushroom Bed 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 170,
    buildable: false,
    constructionRequirements: {
      population: 4,
    },
    stats: {
      constructionTimeSeconds: 80,
      accelerationCost: 181,
      durability: 1,
      gloryOnExplosion: 20,
      takesPopulation: 2,
      workTimeSeconds: 80,
      workYieldGold: 5,
      givesCoins: 181
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10008, name: 'Бочка с нефтью', amount: 3 },
        { id: 999, name: 'Монеты', amount: 181 }
      ],
      rare: [
        { id: 10006, name: 'Каменные блоки', amount: 3 }
      ]
    },
    description: 'Грядка для выращивания грибов.',
    imageUrl: '/buildings/garden_beds/mushroom/mushroom_bed/73.webp',
  },
  {
    id: 77,
    name: 'Супер гриб 1',
    englishName: 'Super Mushroom 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 50,
    buildable: false,
    constructionRequirements: {
      population: 2,        // Занимает населения для работы
    },
    stats: {
      constructionTimeSeconds: 296,     // не указано — оставляем 0
      accelerationCost: 0,
      durability: 200,
      gloryOnExplosion: 20,
      takesPopulation: 2,
      workTimeSeconds: 350,           // 5 минут 50 секунд = 350 сек
      workYieldGold: 5,
      givesCoins: 5
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10009, name: 'Канистра с бензином', amount: 2 },
        { id: 999, name: 'Монеты', amount: 181 }
      ],
      rare: [
        { id: 10006, name: 'Каменные блоки', amount: 3 }
      ]
    },
    description: 'Супер гриб 1 уровня.',
    imageUrl: '/buildings/garden_beds/mushroom/mushroom_bed/77.webp',
  },
  {
    id: 78,
    name: 'Супер гриб 2',
    englishName: 'Super Mushroom 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 400,
    buildable: false,
    constructionRequirements: {
      population: 2,
    },
    stats: {
      constructionTimeSeconds: 0,
      accelerationCost: 0,
      durability: 200,
      gloryOnExplosion: 20,
      takesPopulation: 2,
      workTimeSeconds: 350,
      workYieldGold: 5,
      givesCoins: 5
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10008, name: 'Бочка с нефтью', amount: 3 },
        { id: 999, name: 'Монеты', amount: 181 }
      ],
      rare: [
        { id: 10005, name: 'Камни', amount: 8 }
      ]
    },
    description: 'Супер гриб 2 - Super mushroom 2',
    imageUrl: '/buildings/garden_beds/mushroom/mushroom_bed/78.webp',
    upgradesTo: 79,
    upgradeCost: 40,
  },
  {
    id: 79,
    name: 'Супер гриб 3',
    englishName: 'Super Mushroom 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 40,
    buildable: false,
    constructionRequirements: {
      population: 2,
    },
    stats: {
      constructionTimeSeconds: 0,
      accelerationCost: 0,
      durability: 200,
      gloryOnExplosion: 20,
      takesPopulation: 2,
      workTimeSeconds: 350,
      workYieldGold: 5,
      givesCoins: 5
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10008, name: 'Бочка с нефтью', amount: 3 },
        { id: 999, name: 'Монеты', amount: 181 }
      ],
      rare: []
    },
    description: 'Супер гриб 3 уровня.',
    imageUrl: '/buildings/garden_beds/mushroom/mushroom_bed/79.webp',
  },
  {
    id: 80,
    name: 'Супер гриб 4',
    englishName: 'Super Mushroom 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 40,
    buildable: false,
    constructionRequirements: {
      population: 9,
    },
    stats: {
      constructionTimeSeconds: 0,
      accelerationCost: 0,
      durability: 2632,
      gloryOnExplosion: 20,
      takesPopulation: 9,
      workTimeSeconds: 2,           // 2 секунды
      workYieldGold: 2200,
      givesCoins: 2200
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 10 },
        { id: 999, name: 'Монеты', amount: 2735 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 4 }
      ]
    },
    description: 'Супер гриб 4 уровня.',
    imageUrl: '/buildings/garden_beds/mushroom/mushroom_bed/80.webp',
  },
  {
    id: 82,
    name: 'Тыквенная грядка',
    englishName: 'Pumpkin Patch',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 2000,
    buildable: true,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120, // 2 minutes
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 110, // 1 minute 50 seconds
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 9 },
        { id: 10013, name: 'Петарда', amount: 3 }
      ],
      rare: [
        { id: 10004, name: 'Куски супер тыквы', amount: 2 }
      ]
    },
    description: 'Грядка для выращивания тыкв.',
    imageUrl: '/buildings/garden_beds/pumpkin/pumpkin_patch/82.webp',
  },
  {
    id: 83,
    name: 'Тыквенная грядка 2',
    englishName: 'Pumpkin garden bed 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 110,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10013, name: 'Петарда', amount: 3 },
        { id: 10010, name: 'Садовая бомба', amount: 2 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10022, name: 'Железная руда', amount: 2 }
      ]
    },
    description: 'Тыквенная грядка 2 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/pumpkin_patch/83.webp',
    upgradeCost: 2000,
  },
  {
    id: 84,
    name: 'Тыквенная грядка 3',
    englishName: 'Pumpkin garden bed 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 110,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 24 },
        { id: 10008, name: 'Бочка с нефтью', amount: 11 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 2 }
      ]
    },
    description: 'Тыквенная грядка 3 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/pumpkin_patch/84.webp',
    upgradeCost: 2000,
  },
  {
    id: 85,
    name: 'Тыквенная грядка 4',
    englishName: 'Pumpkin garden bed 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 110,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 24 },
        { id: 10008, name: 'Бочка с нефтью', amount: 11 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10035, name: 'Элитная древесина', amount: 2 }
      ]
    },
    description: 'Тыквенная грядка 4 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/pumpkin_patch/85.webp',
    upgradeCost: 2000,
  },
  {
    id: 86,
    name: 'Тыквенная грядка 5',
    englishName: 'Pumpkin garden bed 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 110,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 24 },
        { id: 10009, name: 'Канистра с бензином', amount: 6 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10004, name: 'Куски супер тыквы', amount: 2 }
      ]
    },
    description: 'Тыквенная грядка 5 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/pumpkin_patch/86.webp',
    upgradeCost: 2000,
  },
  {
    id: 87,
    name: 'Тыквенная грядка 6',
    englishName: 'Pumpkin garden bed 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 6,
      workYieldGold: 400,
      givesCoins: 405,
      sometimesProduces: [
        { id: 10004, name: 'Куски супер тыквы', chance: 1, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 9 },
        { id: 10009, name: 'Канистра с бензином', amount: 6 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10022, name: 'Железная руда', amount: 2 }
      ]
    },
    description: 'Тыквенная грядка 6 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/pumpkin_patch/87.webp',
    upgradesTo: 82,
    upgradeCost: 2000,
  },
  {
    id: 89,
    name: 'Супер тыква',
    englishName: 'Super pumpkin 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 500,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10013, name: 'Петарда', amount: 3 },
        { id: 10010, name: 'Садовая бомба', amount: 2 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10035, name: 'Элитная древесина', amount: 2 }
      ]
    },
    description: 'Супер тыква 1 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/super_pumpkin/89.webp',
    upgradeCost: 2000,
  },
  {
    id: 90,
    name: 'Супер тыква 2',
    englishName: 'Super pumpkin 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 500,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 24 },
        { id: 10008, name: 'Бочка с нефтью', amount: 11 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10004, name: 'Куски супер тыквы', amount: 2 }
      ]
    },
    description: 'Супер тыква 2 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/super_pumpkin/90.webp',
    upgradeCost: 2000,
  },
  {
    id: 91,
    name: 'Супер тыква 3',
    englishName: 'Super pumpkin 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 500,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 24 },
        { id: 10008, name: 'Бочка с нефтью', amount: 11 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10022, name: 'Железная руда', amount: 2 }
      ]
    },
    description: 'Супер тыква 3 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/super_pumpkin/91.webp',
    upgradeCost: 2000,
  },
  {
    id: 92,
    name: 'Супер тыква 4',
    englishName: 'Super pumpkin 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 500,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 24 },
        { id: 10009, name: 'Канистра с бензином', amount: 6 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 2 }
      ]
    },
    description: 'Супер тыква 4 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/super_pumpkin/92.webp',
    upgradeCost: 2000,
  },
  {
    id: 93,
    name: 'Супер тыква 5',
    englishName: 'Super pumpkin 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 448,
      gloryOnExplosion: 100,
      takesPopulation: 3,
      workTimeSeconds: 500,
      workYieldGold: 10,
      givesCoins: 405
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 9 },
        { id: 10009, name: 'Канистра с бензином', amount: 6 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10035, name: 'Элитная древесина', amount: 2 }
      ]
    },
    description: 'Супер тыква 5 уровня.',
    imageUrl: '/buildings/garden_beds/pumpkin/super_pumpkin/93.webp',
    upgradeCost: 2000,
  },
  {
    id: 94,
    name: 'Супер тыква 6',
    englishName: 'Super pumpkin 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 120,
      accelerationCost: 2,
      durability: 3392,
      gloryOnExplosion: 100,
      takesPopulation: 10,
      workTimeSeconds: 2,
      workYieldGold: 4000,
      givesCoins: 4775,
      produces: [
        { id: 10004, name: 'Куски супер тыквы', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 6 },
        { id: 10018, name: 'Яйцо Горыныча', amount: 2 },
        { id: 999, name: 'Монеты', amount: 4775 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 5 }
      ]
    },
    description: 'Супер тыква 6 уровня. После сбора урожая возвращается в обычную тыквенную грядку.',
    imageUrl: '/buildings/garden_beds/pumpkin/super_pumpkin/94.webp',
    upgradesTo: 82,
    upgradeCost: 2000,
  },
  
  {
    id: 102,
    name: 'Грядка с бомбами',
    englishName: 'Garden bed with bombs',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 5000,
    buildable: true,
    constructionRequirements: { population: 7 },
    stats: {
      constructionTimeSeconds: 140,
      accelerationCost: 2,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 130, // 2 minutes 10 seconds
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 50 },
        { id: 10008, name: 'Нефть', amount: 24 }
      ],
      rare: [{ id: 10004, name: 'Куски супер тыквы', amount: 3 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/garden_bed_with_bombs/102.webp',
  },
  {
    id: 103,
    name: 'Грядка с бомбами 2',
    englishName: 'Garden bed with bombs 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 130,
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 50 },
        { id: 10009, name: 'Канистра с бензином', amount: 13 }
      ],
      rare: [{ id: 10005, name: 'Железная руда', amount: 4 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/garden_bed_with_bombs/103.webp',
  },
  {
    id: 104,
    name: 'Грядка с бомбами 3',
    englishName: 'Garden bed with bombs 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 130,
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 19 },
        { id: 10009, name: 'Канистра с бензином', amount: 13 }
      ],
      rare: [{ id: 10011, name: 'Садовая супер бомба', amount: 2 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/garden_bed_with_bombs/104.webp',
  },
  {
    id: 105,
    name: 'Грядка с бомбами 4',
    englishName: 'Garden bed with bombs 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 130,
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 19 },
        { id: 10013, name: 'Петарда', amount: 7 }
      ],
      rare: [{ id: 10003, name: '????? ????? ?????', amount: 3 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/garden_bed_with_bombs/105.webp',
  },
  {
    id: 106,
    name: 'Грядка с бомбами 5',
    englishName: 'Garden bed with bombs 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 130,
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10013, name: 'Петарда', amount: 7 },
        { id: 10010, name: 'Садовая бомба', amount: 3 }
      ],
      rare: [{ id: 10004, name: 'Куски супер тыквы', amount: 3 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/garden_bed_with_bombs/106.webp',
  },
  {
    id: 107,
    name: 'Грядка с бомбами 6',
    englishName: 'Garden bed with bombs 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 912,
      gloryOnExplosion: 250,
      takesPopulation: 5,
      workTimeSeconds: 6, // Instant collection logic
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }],
      produces: [{ id: 10010, name: 'Садовая бомба', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10015, name: 'Камень', amount: 11 },
        { id: 10022, name: 'Песок', amount: 2 }
      ],
      rare: [{ id: 10044, name: 'Самородок', amount: 2 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/garden_bed_with_bombs/107.webp',
  },
  {
    id: 109,
    name: 'Садовая супер бомба 1',
    englishName: 'Super garden bomb 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 700, // 11 minutes 40 seconds
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 50 },
        { id: 10009, name: 'Канистра с бензином', amount: 13 }
      ],
      rare: [{ id: 10003, name: '????? ????? ?????', amount: 3 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/super_garden_bomb/109.webp',
  },
  {
    id: 110,
    name: 'Садовая супер бомба 2',
    englishName: 'Super garden bomb 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 700,
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 19 },
        { id: 10009, name: 'Канистра с бензином', amount: 13 }
      ],
      rare: [{ id: 10004, name: 'Куски супер тыквы', amount: 3 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/super_garden_bomb/110.webp',
  },
  {
    id: 111,
    name: 'Садовая супер бомба 3',
    englishName: 'Super garden bomb 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 700,
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 19 },
        { id: 10013, name: 'Петарда', amount: 7 }
      ],
      rare: [{ id: 10005, name: 'Железная руда', amount: 4 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/super_garden_bomb/111.webp',
  },
  {
    id: 112,
    name: 'Садовая супер бомба 4',
    englishName: 'Super garden bomb 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 3688,
      gloryOnExplosion: 250,
      takesPopulation: 11,
      workTimeSeconds: 4, // 4 seconds collection logic
      consumes: [{ id: 10009, name: 'Канистра с бензином', amount: 1 }],
      produces: [{ id: 10011, name: 'Садовая супер бомба', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10005, name: 'Железная руда', amount: 7 },
        { id: 10017, name: 'Яйцо Горыныча', amount: 2 }
      ],
      rare: [{ id: 10006, name: 'Стальной лист', amount: 8 }]
    },
    description: 'Опасная грядка с бомбами.',
    imageUrl: '/buildings/garden_beds/garden_bombs/super_garden_bomb/112.webp',
  },
  {
    id: 617,
    name: 'Атомная бомба 1',
    englishName: 'Nuclear bomb 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      rare: [{ id: 10044, name: 'Самородок', amount: 74 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 1.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/117.webp',
  },
  {
    id: 618,
    name: 'Атомная бомба 2',
    englishName: 'Nuclear bomb 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10045, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 20 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 2.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/118.webp',
  },
  {
    id: 636,
    name: 'Атомная бомба 3',
    englishName: 'Nuclear bomb 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10045, name: 'Супер детонатор', amount: 2 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      rare: [{ id: 10034, name: 'Изумруд', amount: 10 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 3.',
    imageUrl: '/buildings/factories/Петардный завод - Petard factory/636.webp',
  },
  {
    id: 620,
    name: 'Атомная бомба 4',
    englishName: 'Nuclear bomb 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 5 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 2 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 4.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/120.webp',
  },
  {
    id: 621,
    name: 'Атомная бомба 5',
    englishName: 'Nuclear bomb 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 28 },
        { id: 10019, name: 'Супер подсолнух', amount: 2 }
      ],
      rare: [{ id: 10044, name: 'Самородок', amount: 74 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 5.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/121.webp',
  },
  {
    id: 622,
    name: 'Атомная бомба 6',
    englishName: 'Nuclear bomb 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 28 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 20 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 6.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/122.webp',
  },
  {
    id: 623,
    name: 'Атомная бомба 7',
    englishName: 'Nuclear bomb 7',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      rare: [{ id: 10034, name: 'Изумруд', amount: 10 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 7.',
    imageUrl: '/buildings/factories/Петардный завод - Petard factory/623.webp',
  },
  {
    id: 624,
    name: 'Атомная бомба 8',
    englishName: 'Nuclear bomb 8',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10045, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 2 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 8.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/124.webp',
  },
  {
    id: 625,
    name: 'Атомная бомба 9',
    englishName: 'Nuclear bomb 9',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10045, name: 'Супер детонатор', amount: 2 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      rare: [{ id: 10044, name: 'Самородок', amount: 74 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 9.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/125.webp',
  },
  {
    id: 626,
    name: 'Атомная бомба 10',
    englishName: 'Nuclear bomb 10',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 5 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 20 }]
    },
    description: 'Грядка для выращивания атомных бомб. Уровень 10.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/126.webp',
  },
  {
    id: 627,
    name: 'Атомная бомба 11',
    englishName: 'Nuclear bomb 11',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 9656,
      gloryOnExplosion: 30000,
      takesPopulation: 17,
      workTimeSeconds: 8, // 8 seconds
      workYieldGold: 20,
      produces: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 48 },
        { id: 10023, name: 'Сталь', amount: 9 }
      ],
      rare: [{ id: 10034, name: 'Изумруд', amount: 16 }]
    },
    description: 'Грядка для выращивания атомных бомб. Максимальный уровень. 45% шанс на супер атомную бомбу.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/126.webp',
  },
  {
    id: 628,
    name: 'Супер атомная бомба 1',
    englishName: 'Super nuclear bomb 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 900, // 15 minutes
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 28 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 2 }]
    },
    description: 'Грядка для выращивания супер атомных бомб. Уровень 1.',
    imageUrl: '/buildings/factories/Петардный завод - Petard factory/628.webp',
  },
  {
    id: 629,
    name: 'Супер атомная бомба 2',
    englishName: 'Super nuclear bomb 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 900, // 15 minutes
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      rare: [{ id: 10044, name: 'Самородок', amount: 74 }]
    },
    description: 'Грядка для выращивания супер атомных бомб. Уровень 2.',
    imageUrl: '/buildings/Грядки/атомка/Супер атомная бомба - Super nuclear bomb/128.webp',
  },
  {
    id: 630,
    name: 'Супер атомная бомба 3',
    englishName: 'Super nuclear bomb 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 900, // 15 minutes
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10045, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 20 }]
    },
    description: 'Грядка для выращивания супер атомных бомб. Уровень 3.',
    imageUrl: '/buildings/Грядки/атомка/Супер атомная бомба - Super nuclear bomb/129.webp',
  },
  {
    id: 631,
    name: 'Супер атомная бомба 4',
    englishName: 'Super nuclear bomb 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 900, // 15 minutes
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10045, name: 'Супер детонатор', amount: 2 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      rare: [{ id: 10034, name: 'Изумруд', amount: 10 }]
    },
    description: 'Грядка для выращивания супер атомных бомб. Уровень 4.',
    imageUrl: '/buildings/Грядки/атомка/Супер атомная бомба - Super nuclear bomb/130.webp',
  },
  {
    id: 632,
    name: 'Супер атомная бомба 5',
    englishName: 'Super nuclear bomb 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 900, // 15 minutes
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 5 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 2 }]
    },
    description: 'Грядка для выращивания супер атомных бомб. Уровень 5.',
    imageUrl: '/buildings/Грядки/атомка/Супер атомная бомба - Super nuclear bomb/131.webp',
  },
  {
    id: 633,
    name: 'Супер атомная бомба 6',
    englishName: 'Super nuclear bomb 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 900, // 15 minutes
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 28 },
        { id: 10019, name: 'Супер подсолнух', amount: 2 }
      ],
      rare: [{ id: 10044, name: 'Самородок', amount: 74 }]
    },
    description: 'Грядка для выращивания супер атомных бомб. Уровень 6.',
    imageUrl: '/buildings/factories/Петардный завод - Petard factory/633.webp',
  },
  {
    id: 634,
    name: 'Супер атомная бомба 7',
    englishName: 'Super nuclear bomb 7',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 38800,
      gloryOnExplosion: 30000,
      takesPopulation: 35,
      workTimeSeconds: 4, // 4 seconds
      workYieldGold: 20,
      produces: [
        { id: 10043, name: 'Суператомная бомба', amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 20997
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 60 },
        { id: 10045, name: 'Супер детонатор', amount: 32 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 545 }]
    },
    description: 'Грядка для выращивания супер атомных бомб. Максимальный уровень.',
    imageUrl: '/buildings/Грядки/атомка/Супер атомная бомба - Super nuclear bomb/133.webp',
  },
  {
    id: 635,
    name: 'Закрытый проект',
    englishName: 'Closed project',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 7800,
      gloryOnExplosion: 30000,
      takesPopulation: 16,
      workTimeSeconds: 10, // 10 seconds
      workYieldGold: 10,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      rare: [{ id: 10034, name: 'Изумруд', amount: 11 }]
    },
    description: 'Атомную бомбу строили слишком долго и деньги инвесторов закончились. После сбора возвращается в Атомная бомба.',
    imageUrl: '/buildings/Грядки/атомка/Супер атомная бомба - Super nuclear bomb/134.webp',
  },

  {
    id: 240,
    name: 'Репка',
    englishName: 'Turnip',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 25000,
    buildable: true,
    constructionRequirements: {
      population: 11,
    },
    stats: {
      constructionTimeSeconds: 220, // 3 minutes 40 seconds
      accelerationCost: 3,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500, // 25 minutes
      workYieldGold: 20,
      givesCoins: 2035
    },
    drops: {
      frequent: [
        { id: 10005, name: 'Камни', amount: 31 },
        { id: 10041, name: 'Песок', amount: 6 }
      ],
      rare: [
        { id: 10023, name: 'Сталь', amount: 4 }
      ]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/240.webp',
  },
  {
    id: 274,
    name: 'Пшеница',
    englishName: 'Wheat',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 80000,
    buildable: true,
    constructionRequirements: {
      population: 15,
    },
    stats: {
      constructionTimeSeconds: 300, // 5 minutes
      accelerationCost: 4,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400, // 40 minutes
      workYieldGold: 40,
      givesCoins: 3260
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 4 },
        { id: 10011, name: 'Садовая супер бомба', amount: 2 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 3 }
      ]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/274.webp',
  },
  {
    id: 313,
    name: 'Подсолнух',
    englishName: 'Sunflower',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 250000,
    buildable: true,
    constructionRequirements: {
      population: 20,
    },
    stats: {
      constructionTimeSeconds: 400, // 6m 40s
      accelerationCost: 4,
      durability: 5032,
      gloryOnExplosion: 12500,
      takesPopulation: 12,
      workTimeSeconds: 4000, // 1h 6m 40s
      workYieldGold: 70,
      givesCoins: 7132
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 2 },
        { id: 10021, name: 'Куски супер репки', amount: 2 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 35 }
      ]
    },
    description: 'Грядка для выращивания подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/sunflower/313.webp',
  },
  {
    id: 400,
    name: 'Пруд с лилиями',
    englishName: 'Pond with Lilies',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 50,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 40,
      accelerationCost: 5,
      durability: 1,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 65, // 1 minute 5 seconds
      workYieldGold: 3,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 30, amount: 1 }
      ]
    },
    drops: {
      rare: [
        { id: 10001, name: 'Дерево', chance: 30, amount: 5 }
      ]
    },
    description: 'Тихий пруд с лилиями, который приносит небольшой доход.',
    imageUrl: '/buildings/Грядки/лилии/Пруд с лилиями - Lilies pond/153.webp',
  },
  {
    id: 401,
    name: 'Супер лилия 1 уровня',
    englishName: 'Super Lily Level 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 1000,
    buildable: false,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 40,
      accelerationCost: 5,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 300, // 5 minutes
      workYieldGold: 3,
    },
    drops: {
      rare: [{ id: 10013, name: 'Петарда', amount: 2 }]
    },
    description: 'Редкий и красивый пруд с супер лилией.',
    imageUrl: '/buildings/Грядки/лилии/Супер лилия - Super lily/159.webp',
  },
  {
    id: 406,
    name: 'Супер лилия 2 уровня',
    englishName: 'Super Lily Level 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 240, // 4 minutes
      workYieldGold: 3,
    },
    drops: {
      rare: [{ id: 10001, name: 'Дерево', amount: 9 }]
    },
    description: 'Супер лилия, которая стала еще красивее.',
    imageUrl: '/buildings/Грядки/лилии/Супер лилия - Super lily/160.webp'
  },
  {
    id: 407,
    name: 'Супер лилия 3 уровня',
    englishName: 'Super Lily Level 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 180, // 3 minutes
      workYieldGold: 3,
    },
    drops: {
      rare: [{ id: 10009, name: 'Канистра с бензином', amount: 3 }]
    },
    description: 'Великолепная супер лилия третьего уровня.',
    imageUrl: '/buildings/Грядки/лилии/Супер лилия - Super lily/161.webp'
  },
  {
    id: 408,
    name: 'Супер лилия 4 уровня',
    englishName: 'Super Lily Level 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 120, // 2 minutes
      workYieldGold: 3,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 4 }]
    },
    description: 'Невероятная супер лилия четвертого уровня.',
    imageUrl: '/buildings/Грядки/лилии/Супер лилия - Super lily/162.webp'
  },
  {
    id: 409,
    name: 'Супер лилия 5 уровня',
    englishName: 'Super Lily Level 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1232,
      gloryOnExplosion: 3,
      takesPopulation: 6,
      workTimeSeconds: 2, // 2 seconds
      workYieldGold: 1200,
      givesCoins: 1115,
      produces: [{ id: 10024, name: 'Супер лилия', amount: 1 }]
    },
    drops: {
      frequent: [
        { id: 10013, name: 'Петарда', amount: 23 },
        { id: 10010, name: 'Садовая бомба', amount: 9 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 3 }
      ]
    },
    description: 'Финальная стадия супер лилии. Приносит огромный доход.',
    imageUrl: '/buildings/Грядки/лилии/Супер лилия - Super lily/163.webp'
  },
  {
    id: 402,
    name: 'Пруд с лилиями 2 уровня',
    englishName: 'Pond with Lilies Level 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 0, // Not directly buildable
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 60, // 1 minute
      workYieldGold: 3,
    },
    drops: {
      rare: [{ id: 10013, name: 'Петарда', amount: 2 }]
    },
    description: 'Пруд развивается. Лилии начинают цвести.',
    imageUrl: '/buildings/Грядки/лилии/Пруд с лилиями - Lilies pond/154.webp'
  },
  {
    id: 403,
    name: 'Пруд с лилиями 3 уровня',
    englishName: 'Pond with Lilies Level 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 60, // 1 minute
      workYieldGold: 3,
    },
    drops: {
      rare: [{ id: 10001, name: 'Дерево', amount: 9 }]
    },
    description: 'Пруд с цветущими лилиями.',
    imageUrl: '/buildings/Грядки/лилии/Пруд с лилиями - Lilies pond/155.webp'
  },
  {
    id: 404,
    name: 'Пруд с лилиями 4 уровня',
    englishName: 'Pond with Lilies Level 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 60, // 1 minute
      workYieldGold: 3,
    },
    drops: {
      rare: [{ id: 10009, name: 'Канистра с бензином', amount: 3 }]
    },
    description: 'Пышный пруд, почти готовый принести доход.',
    imageUrl: '/buildings/Грядки/лилии/Пруд с лилиями - Lilies pond/156.webp'
  },
  {
    id: 405,
    name: 'Пруд с лилиями 5 уровня',
    englishName: 'Pond with Lilies Level 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 6, // 6 seconds
      workYieldGold: 100,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 4 }]
    },
    description: 'Полностью расцветший пруд с золотыми лилиями!',
    imageUrl: '/buildings/Грядки/лилии/Пруд с лилиями - Lilies pond/157.webp'
  },
  {
    id: 55,
    name: 'Лесопилка',
    englishName: 'Sawmill',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 300,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 2 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 368,
      gloryOnExplosion: 15,
      takesPopulation: 2,
      workTimeSeconds: 497, // 8m 17s
      workYieldGold: 50,
      givesCoins: 303,
      produces: [
        { id: 10002, name: 'Доски', amount: 4 }
      ],
      sometimesProduces: [
        { id: 10035, name: 'Элитная древесина', chance: 0.5 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 5 }
      ]
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 16 },
        { id: 10008, name: 'Бочка с нефтью', amount: 8 },
        { id: 999, name: 'Монеты', amount: 303 }
      ],
      rare: [
        { id: 10022, name: 'Руда', amount: 2 }
      ]
    },
    description: 'Производит доски из дерева. Иногда можно найти элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/55.webp',
    upgradesTo: 56,
    upgradeCost: 4800,
  },
  {
    id: 56,
    name: 'Лесопилка 2',
    englishName: 'Sawmill 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 13 },
        { id: 10002, name: 'Доски', amount: 5 }
      ],
      population: 7
    },
    stats: {
      constructionTimeSeconds: 445, // 7m 25s
      accelerationCost: 4,
      durability: 800,
      gloryOnExplosion: 240,
      takesPopulation: 3,
      workTimeSeconds: 486, // 8m 6s
      workYieldGold: 50,
      givesCoins: 659,
      produces: [
        { id: 10002, name: 'Доски', amount: 5 }
      ],
      sometimesProduces: [
        { id: 10035, name: 'Элитная древесина', chance: 2 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 8 }
      ]
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 28 },
        { id: 10013, name: 'Петарда', amount: 10 }
      ],
      rare: [
        { id: 10035, name: 'Элитная древесина', amount: 5 }
      ]
    },
    description: 'Улучшенная лесопилка. Производит больше досок и чаще находит элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/56.webp',
    upgradesTo: 391,
    upgradeCost: 24300,
  },
  {
    id: 340,
    name: 'Финансовая разведка',
    englishName: 'Financial Intelligence',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 30000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 30 },
        { id: 10002, name: 'Доски', amount: 20 },
        { id: 10003, name: 'Куски супер гриба', amount: 7 }
      ],
    },
    stats: {
      constructionTimeSeconds: 240, // 4 minutes
      accelerationCost: 3,
      durability: 1744,
      gloryOnExplosion: 1500,
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 2 },
        { id: 10024, name: 'Супер лилия', amount: 5 }
      ],
      rare: [
        { id: 10025, name: 'Золотая руда', amount: 5 }
      ]
    },
    description: 'Здесь можно получить информацию о месторождениях. Когда на карте появляется новое месторождение, в чате "Находки" появляется уведомление с координатами.',
    imageUrl: '/buildings/Специальные Здания/Финансовая разведка - Financial intelligence/14.webp',
    upgradesTo: 341,
    upgradeCost: 35000,
  },
  {
    id: 341,
    name: 'Финансовая разведка 2',
    englishName: 'Financial Intelligence 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 35000,
    buildable: false,
    constructionRequirements: {},
    stats: {
      constructionTimeSeconds: 6591, // 1h 49m 51s
      accelerationCost: 17,
      durability: 1968,
      gloryOnExplosion: 1750,
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 3 },
        { id: 10024, name: 'Супер лилия', amount: 6 }
      ],
      rare: [
        { id: 10042, name: '??????', amount: 2 }
      ]
    },
    description: 'Улучшенная финансовая разведка. Обнаруживает месторождения нефти и клады.',
    imageUrl: '/buildings/Специальные Здания/Финансовая разведка - Financial intelligence/20.webp',
    upgradesTo: 342,
    upgradeCost: 40000,
  },
  {
    id: 342,
    name: 'Финансовая разведка 3',
    englishName: 'Financial Intelligence 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 40000,
    buildable: false,
    constructionRequirements: {},
    stats: {
      constructionTimeSeconds: 6591, // 1h 49m 51s (Same as Lvl 2 per prompt)
      accelerationCost: 17,
      durability: 2192,
      gloryOnExplosion: 2000,
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 3 },
        { id: 10004, name: 'Куски супер тыквы', amount: 2 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ]
    },
    description: 'Максимальный уровень финансовой разведки. Обнаруживает месторождения ресурсов и спрятанные клады на карте.',
    imageUrl: '/buildings/Специальные Здания/Финансовая разведка - Financial intelligence/29.webp',
  },
  {
    id: 311,
    name: 'Аукцион',
    englishName: 'Auction',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000000,
    buildable: true,
    constructionRequirements: {
      population: 41
    },
    stats: {
      constructionTimeSeconds: 820, // 13m 40s
      accelerationCost: 6,
      durability: 22512,
      gloryOnExplosion: 250000,
      takesPopulation: 0 // Returns population after build
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 22 },
        { id: 10013, name: 'Петарда', amount: 8 },
        { id: 10010, name: 'Садовая бомба', amount: 3 }
      ],
      rare: [
        { id: 10004, name: 'Куски супер тыквы', amount: 2 }
      ]
    },
    description: 'Здание для торговли драгоценностями. Здесь можно купить рубины.',
    imageUrl: '/buildings/Специальные Здания/Аукцион - Auction/311.webp'
  },
  {
    id: 31532,
    name: 'Рынок',
    englishName: 'Market',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 10000,
    buildable: true,
    constructionRequirements: {
      population: 9,
    },
    stats: {
      constructionTimeSeconds: 180,
      accelerationCost: 3,
      durability: 1008,
      gloryOnExplosion: 500,
      givesCoins: 839
    },
    drops: {
      frequent: [
        { id: 10005, name: 'Камни', amount: 13 },
        { id: 10006, name: 'Каменные блоки', amount: 5 }
      ],
      rare: [
        { id: 10018, name: 'Яйцо Горыныча', amount: 2 }
      ]
    },
    description: 'Место для торговли и обмена товаров.',
    imageUrl: '/buildings/Специальные Здания/Рынок - Market/76.webp',
  },
  {
    id: 310,
    name: 'Тюрьма',
    englishName: 'Prison',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 300000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 10 },
        { id: 10006, name: 'Каменные блоки', amount: 40 },
        { id: 10023, name: 'Сталь', amount: 12 },
        { id: 10029, name: 'Тюремный замок', amount: 1 },
      ],
      population: 21,
    },
    stats: {
      constructionTimeSeconds: 420,
      accelerationCost: 4,
      durability: 5512,
      gloryOnExplosion: 15000,
      givesCoins: 7853,
      chanceToCatchThief: 50,
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 3 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 11 },
      ],
    },
    description: 'Даёт возможность полиции отправлять воров в тюрьму (шанс 50%)',
    imageUrl: '/buildings/Специальные Здания/Тюрьма - Prison/310.webp',
  },
  {
    id: 99999,
    name: 'Хранилище золота',
    englishName: 'Gold Storage',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 100,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10001, name: 'Дерево', amount: 20 }],
    },
    stats: {
      constructionTimeSeconds: 30,
      accelerationCost: 2,
      durability: 800,
      gloryOnExplosion: 50,
      increasesGoldCapacity: 500,
      takesPopulation: 1,
    },
    drops: {
      frequent: [{ id: 10001, name: 'дерево', amount: 10 }],
    },
    description: 'Увеличивает максимальный запас золота.',
    imageUrl: 'https://picsum.photos/seed/99999/200',
  },
  {
    id: 600,
    name: 'Атомная бомба',
    englishName: 'Nuclear Bomb',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 600000,
    buildable: true,
    constructionRequirements: {
      population: 24,
    },
    stats: {
      constructionTimeSeconds: 480, // 8 minutes
      accelerationCost: 5,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 74 }
      ]
    },
    description: 'Грядка для выращивания атомных бомб.',
    imageUrl: '/buildings/Грядки/атомка/Атомная бомба - Nuclear bomb/116.webp',
  },
  {
    id: 601,
    name: 'Завод детонаторов',
    englishName: 'Detonator Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2000000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 500 },
        { id: 10006, name: 'Каменные блоки', amount: 200 },
        { id: 10004, name: 'Куски супер тыквы', amount: 60 },
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 14328,
      gloryOnExplosion: 100000,
      takesPopulation: 11,
      workTimeSeconds: 2014,
      workYieldGold: 20,
      produces: [
        { id: 10017, name: 'Детонатор', amount: 2 }
      ],
      consumes: [
        { id: 10002, name: 'Доски', amount: 5 },
        { id: 10006, name: 'Каменные блоки', amount: 6 },
        { id: 10009, name: 'Канистра с бензином', amount: 15 }
      ],
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 5 },
        { id: 10040, name: 'Стальной лист', amount: 8 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 5 }
      ]
    },
    description: 'Производит детонаторы, для бомб',
    imageUrl: '/buildings/Заводы/Завод детонаторов - Detonator factory/135.webp',
  },
  {
    id: 602,
    name: 'Дьявольская машина',
    englishName: "Devil\'s Machine",
    category: 'Заводы',
    type: BuildingType.Default,
    price: 10000000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 2000 },
        { id: 10026, name: 'Золото', amount: 30 },
        { id: 10006, name: 'Каменные блоки', amount: 600 },
        { id: 10004, name: 'Куски супер тыквы', amount: 130 },
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 33200,
      gloryOnExplosion: 500000,
      takesPopulation: 17,
      workTimeSeconds: 11826, // 3h 17m 6s
      workYieldGold: 60,
      givesCoins: 20997,
      produces: [
        { id: 10042, name: '??????', amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 25 },
        { id: 10017, name: 'Детонатор', amount: 4 },
        { id: 10024, name: 'Супер лилия', amount: 1 }
      ],
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 100 },
        { id: 10040, name: 'Стальной лист', amount: 40 },
        { id: 999, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 399 }
      ]
    },
    description: 'Производит супердетонаторы, для бомб',
    imageUrl: '/buildings/Заводы/Дьявольская машина - Diabolical machine/225.webp',
  },
  {
    id: 606,
    name: 'Нефтяная вышка',
    englishName: 'Oil Rig',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 10000,
    buildable: false,
    constructionRequirements: {
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 56,
      accelerationCost: 2,
      durability: 234,
      gloryOnExplosion: 500,
      takesPopulation: 12,
      workTimeSeconds: 1096, // 18m 16s
      workYieldGold: 20,
      givesCoins: 5322,
      produces: [
        { id: 10008, name: 'Бочка с нефтью', amount: 300 }
      ]
    },
    drops: {
      frequent: [
        { id: 10018, name: 'Яйцо Горыныча', amount: 2 },
        { id: 10004, name: 'Куски супер тыквы', amount: 6 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 3 }
      ]
    },
    description: 'Нефть нужна для работы ваших нефтеперерабатывающих заводов.',
    imageUrl: '/buildings/Нефтяная вышка - Oil derrick/15.webp',
    upgradesTo: 607,
    upgradeCost: 10000,
  },
  {
    id: 607,
    name: 'Две нефтяные вышки',
    englishName: 'Two Oil Rigs',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 10000,
    buildable: false,
    constructionRequirements: {
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 5184, // 1h 26m 24s
      accelerationCost: 15,
      durability: 331,
      gloryOnExplosion: 500,
      takesPopulation: 21,
      workTimeSeconds: 1265, // 21m 5s
      workYieldGold: 20,
      givesCoins: 6401,
      produces: [
        { id: 10008, name: 'Бочка с нефтью', amount: 400 }
      ]
    },
    drops: {
      frequent: [
        { id: 10027, name: 'Зёрна гигантской пшеницы', amount: 2 },
        { id: 10021, name: 'Куски супер репки', amount: 2 }
      ],
      rare: [
        { id: 10025, name: 'Золотая руда', amount: 28 }
      ]
    },
    description: 'Улучшенная добыча нефти.',
    imageUrl: '/buildings/Нефтяная вышка - Oil derrick/49.webp',
  },
  {
    id: 330,
    name: 'Фабрика рекомендаций',
    englishName: 'Recommendation Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 200000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 20 },
        { id: 10023, name: 'Сталь', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 60 },
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 11640,
      gloryOnExplosion: 10000,
      takesPopulation: 10,
      workTimeSeconds: 13486, // 3h 44m 46s
      workYieldGold: 40,
      givesCoins: 13538,
      produces: [
        { id: 10032, name: 'Рекомендация', amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 50 },
        { id: 10009, name: 'Канистра с бензином', amount: 50 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 69 },
        { id: 10023, name: 'Сталь', amount: 13 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 24 }
      ]
    },
    description: 'Печатает рекомендации из подсолнухов',
    imageUrl: '/buildings/factories/Фабрика рекомендаций - Recommendations factory/330.webp',
  },
  {
    id: 60332,
    name: 'Военный завод',
    englishName: 'Military Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 200000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 90 },
        { id: 10006, name: 'Каменные блоки', amount: 40 },
        { id: 10004, name: 'Куски супер тыквы', amount: 14 },
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 5480,
      gloryOnExplosion: 10000,
      takesPopulation: 7,
      workTimeSeconds: 3932, // 1h 5m 32s
      workYieldGold: 10,
      givesCoins: 7853,
      produces: [
        { id: 10012, name: 'MGM-52 «Ланс»', amount: 3 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 40 },
        { id: 10023, name: 'Сталь', amount: 1 },
        { id: 10003, name: '????? ????? ?????', amount: 5 }
      ],
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 2 },
        { id: 10018, name: 'Яйцо Горыныча', amount: 4 }
      ],
      rare: [
        { id: 10025, name: 'Золотая руда', amount: 41 }
      ]
    },
    description: 'Занимается производством MGM-52 «Ланс».',
    imageUrl: '/buildings/Заводы/Военный завод - Military facility/13.webp',
    upgradesTo: 604,
    upgradeCost: 220000,
  },
  {
    id: 604,
    name: 'Секретный военный завод 1 уровня',
    englishName: 'Secret Military Factory Level 1',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 220000,
    buildable: false,
    constructionRequirements: {
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 1029, // 17m 9s
      accelerationCost: 7,
      durability: 5952,
      gloryOnExplosion: 11000,
      takesPopulation: 16,
      workTimeSeconds: 4007, // 1h 6m 47s
      workYieldGold: 15,
      givesCoins: 7853,
      produces: [
        { id: 10012, name: 'MGM-52 «Ланс»', amount: 3 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 35 },
        { id: 10023, name: 'Сталь', amount: 1 },
        { id: 10003, name: '????? ????? ?????', amount: 5 }
      ],
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 3 },
        { id: 10018, name: 'Яйцо Горыныча', amount: 4 }
      ],
      rare: [
        { id: 10025, name: 'Золотая руда', amount: 49 }
      ]
    },
    description: 'Занимается производством MGM-52 «Ланс» и Атомной бомбы.',
    imageUrl: '/buildings/Заводы/Военный завод - Military facility/13.webp',
    upgradesTo: 605,
    upgradeCost: 240000,
  },
  {
    id: 605,
    name: 'Секретный военный завод 2 уровня',
    englishName: 'Secret Military Factory Level 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 240000,
    buildable: false,
    constructionRequirements: {
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 5184, // 1h 26m 24s
      accelerationCost: 15,
      durability: 6648,
      gloryOnExplosion: 12000,
      takesPopulation: 24,
      workTimeSeconds: 4540, // 1h 15m 40s
      workYieldGold: 20,
      givesCoins: 9707,
      produces: [
        { id: 10012, name: 'MGM-52 «Ланс»', amount: 4 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 50 },
        { id: 10023, name: 'Сталь', amount: 1 },
        { id: 10003, name: '????? ????? ?????', amount: 9 }
      ],
    },
    drops: {
      frequent: [
        { id: 10025, name: 'Золотая руда', amount: 4 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Занимается производством MGM-52 «Ланс», MGM-53 «Буря» и Атомной бомбы.',
    imageUrl: '/buildings/Заводы/Военный завод - Military facility/13.webp',
  },
  {
    id: 615,
    name: 'Алхимический завод',
    englishName: 'Alchemical Plant',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 30000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 60 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 1720,
      gloryOnExplosion: 1500,
      takesPopulation: 6,
      workTimeSeconds: 126, // 2m 6s
      workYieldGold: 10,
      givesCoins: 2268,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 5 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 8.68, amount: 1 },
        { id: 10022, name: 'Руда', chance: 10.91, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 11 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 2 }
      ],
      rare: [
        { id: 10026, name: 'Золото', amount: 2 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Иногда находит ценные ресурсы.',
    imageUrl: '/buildings/Заводы/Алхимический завод - Alchemical factory/16.webp',
    upgradesTo: 419,
    upgradeCost: 120000
  },
  {
    id: 419,
    name: 'Алхимический завод 2',
    englishName: 'Alchemical Factory 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 120000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 120 },
        { id: 10006, name: 'Каменные блоки', amount: 12 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 1029, // 17m 9s
      accelerationCost: 7,
      durability: 3640,
      gloryOnExplosion: 6000,
      takesPopulation: 8,
      workTimeSeconds: 126, // 2m 6s
      workYieldGold: 50,
      givesCoins: 4775,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 7 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 1.36, amount: 1 },
        { id: 10022, name: 'Руда', chance: 1.81, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 14 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 4775 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 3 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 2.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/419.webp',
    upgradesTo: 420,
    upgradeCost: 270000
  },
  {
    id: 420,
    name: 'Алхимический завод 3',
    englishName: 'Alchemical Factory 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 270 },
        { id: 10006, name: 'Каменные блоки', amount: 27 }
      ],
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 5184, // 1h 26m 24s
      accelerationCost: 15,
      durability: 5696,
      gloryOnExplosion: 13500,
      takesPopulation: 10,
      workTimeSeconds: 407, // 6m 47s
      workYieldGold: 50,
      givesCoins: 7853,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 11 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 2.04, amount: 1 },
        { id: 10022, name: 'Руда', chance: 2.72, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 19 }
      ]
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 2 },
        { id: 10025, name: 'Супер репка', amount: 3 },
        { id: 10000, name: 'Монеты', amount: 7853 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 18 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 3.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/420.webp',
    upgradesTo: 421,
    upgradeCost: 480000
  },
  {
    id: 421,
    name: 'Алхимический завод 4',
    englishName: 'Alchemical Factory 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 480000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 5 },
        { id: 10006, name: 'Каменные блоки', amount: 48 },
        { id: 10023, name: 'Сталь', amount: 1 }
      ],
      population: 17,
    },
    stats: {
      constructionTimeSeconds: 14739, // 4h 5m 39s
      accelerationCost: 26,
      durability: 7912,
      gloryOnExplosion: 24000,
      takesPopulation: 11,
      workTimeSeconds: 1266, // 21m 6s
      workYieldGold: 50,
      givesCoins: 10631,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 21 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 2.72, amount: 1 },
        { id: 10022, name: 'Руда', chance: 3.63, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 26 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 32 },
        { id: 10023, name: 'Сталь', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10020, name: 'Изумрудная руда', amount: 23 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 4.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/421.webp',
    upgradesTo: 422,
    upgradeCost: 750000
  },
  {
    id: 422,
    name: 'Алхимический завод 5',
    englishName: 'Alchemical Factory 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 750000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 8 },
        { id: 10006, name: 'Каменные блоки', amount: 75 },
        { id: 10023, name: 'Сталь', amount: 2 }
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 36501, // 10h 8m 21s
      accelerationCost: 40,
      durability: 10264,
      gloryOnExplosion: 37500,
      takesPopulation: 13,
      workTimeSeconds: 2416, // 40m 16s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 36 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 3.4, amount: 1 },
        { id: 10022, name: 'Руда', chance: 4.54, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 35 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10042, name: '??????', amount: 3 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 19 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 5.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/422.webp',
    upgradesTo: 423,
    upgradeCost: 1080000
  },
  {
    id: 423,
    name: 'Алхимический завод 6',
    englishName: 'Alchemical Factory 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1080000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 11 },
        { id: 10006, name: 'Каменные блоки', amount: 108 },
        { id: 10023, name: 'Сталь', amount: 2 }
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 81000, // 22h 30m
      accelerationCost: 60,
      durability: 12768,
      gloryOnExplosion: 54000,
      takesPopulation: 16,
      workTimeSeconds: 4060, // 1h 7m 40s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 59 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 4.08, amount: 1 },
        { id: 10022, name: 'Руда', chance: 5.44, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 46 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 4 },
        { id: 10040, name: 'Стальной лист', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 4 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 6.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/423.webp',
    upgradesTo: 424,
    upgradeCost: 1470000
  },
  {
    id: 424,
    name: 'Алхимический завод 7',
    englishName: 'Alchemical Factory 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1470000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 15 },
        { id: 10026, name: 'Золото', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 3 }
      ],
      population: 37,
    },
    stats: {
      constructionTimeSeconds: 154359, // 1d 18h 12m 39s
      accelerationCost: 82,
      durability: 15400,
      gloryOnExplosion: 73500,
      takesPopulation: 22,
      workTimeSeconds: 6155, // 1h 42m 35s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 90 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 4.76, amount: 1 },
        { id: 10022, name: 'Руда', chance: 6.35, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 59 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 22 },
        { id: 10040, name: 'Стальной лист', amount: 9 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 27 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 7.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/424.webp',
    upgradesTo: 425,
    upgradeCost: 1920000
  },
  {
    id: 425,
    name: 'Алхимический завод 8',
    englishName: 'Alchemical Factory 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1920000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 19 },
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 4 }
      ],
      population: 45,
    },
    stats: {
      constructionTimeSeconds: 230400, // 2d 16h
      accelerationCost: 108,
      durability: 19712,
      gloryOnExplosion: 96000,
      takesPopulation: 26,
      workTimeSeconds: 8918, // 2h 28m 38s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 128 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 5.44, amount: 1 },
        { id: 10022, name: 'Руда', chance: 7.26, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 74 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 30 },
        { id: 10040, name: 'Стальной лист', amount: 12 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 36 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 8.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/425.webp',
    upgradesTo: 426,
    upgradeCost: 2430000
  },
  {
    id: 426,
    name: 'Алхимический завод 9',
    englishName: 'Alchemical Factory 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2430000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 24 },
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      population: 53,
    },
    stats: {
      constructionTimeSeconds: 345600, // 4d
      accelerationCost: 142,
      durability: 24640,
      gloryOnExplosion: 121500,
      takesPopulation: 30,
      workTimeSeconds: 12080, // 3h 21m 20s
      workYieldGold: 50,
      givesCoins: 16923,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 172 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 6.12, amount: 1 },
        { id: 10022, name: 'Руда', chance: 8.17, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 91 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 40 },
        { id: 10040, name: 'Стальной лист', amount: 16 },
        { id: 10000, name: 'Монеты', amount: 16923 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 48 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 9.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/426.webp',
    upgradesTo: 427,
    upgradeCost: 3000000
  },
  {
    id: 427,
    name: 'Алхимический завод 10',
    englishName: 'Alchemical Factory 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 30 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      population: 62,
    },
    stats: {
      constructionTimeSeconds: 518400, // 6d
      accelerationCost: 186,
      durability: 30800,
      gloryOnExplosion: 150000,
      takesPopulation: 35,
      workTimeSeconds: 15840, // 4h 24m
      workYieldGold: 50,
      givesCoins: 21154,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 224 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 6.80, amount: 1 },
        { id: 10022, name: 'Руда', chance: 9.08, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 110 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 52 },
        { id: 10040, name: 'Стальной лист', amount: 21 },
        { id: 10000, name: 'Монеты', amount: 21154 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 63 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 10.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/427.webp',
    upgradesTo: 428,
    upgradeCost: 3750000
  },
  {
    id: 428,
    name: 'Алхимический завод 11',
    englishName: 'Alchemical Factory 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3750000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 38 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 8 },
        { id: 10034, name: 'Изумруд', amount: 5 }
      ],
      population: 72,
    },
    stats: {
      constructionTimeSeconds: 777600, // 9d
      accelerationCost: 240,
      durability: 38500,
      gloryOnExplosion: 187500,
      takesPopulation: 40,
      workTimeSeconds: 20400, // 5h 40m
      workYieldGold: 50,
      givesCoins: 26442,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 290 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 7.48, amount: 1 },
        { id: 10022, name: 'Руда', chance: 9.99, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 132 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 67 },
        { id: 10040, name: 'Стальной лист', amount: 27 },
        { id: 10000, name: 'Монеты', amount: 26442 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 82 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Уровень 11.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/428.webp',
    upgradesTo: 429,
    upgradeCost: 4680000
  },
  {
    id: 429,
    name: 'Алхимический завод 12',
    englishName: 'Alchemical Factory 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4680000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 47 },
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 10 },
        { id: 10034, name: 'Изумруд', amount: 10 }
      ],
      population: 83,
    },
    stats: {
      constructionTimeSeconds: 1166400, // 13d 12h
      accelerationCost: 310,
      durability: 48125,
      gloryOnExplosion: 234000,
      takesPopulation: 46,
      workTimeSeconds: 25920, // 7h 12m
      workYieldGold: 50,
      givesCoins: 33053,
      produces: [
        { id: 10009, name: 'Канистра с бензином', amount: 370 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 8.16, amount: 1 },
        { id: 10022, name: 'Руда', chance: 10.90, amount: 1 }
      ],
      consumes: [
        { id: 10008, name: 'Бочка с нефтью', amount: 158 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 86 },
        { id: 10040, name: 'Стальной лист', amount: 35 },
        { id: 10000, name: 'Монеты', amount: 33053 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 106 }
      ]
    },
    description: 'Максимальный уровень Алхимического завода. Перерабатывает нефть в бензин с максимальной эффективностью.',
    imageUrl: '/buildings/factories/Алхимический завод - Alchemical factory/429.webp'
  },
  {
    id: 700,
    name: 'Пушка',
    englishName: 'Cannon',
    category: 'Защита',
    type: BuildingType.Default,
    price: 400,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 2 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 2340, // 39 mins
      accelerationCost: 10,
      durability: 175,
      gloryOnExplosion: 20,
      damage: '5'
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10008, name: 'Бочка с нефтью', amount: 3 }
      ],
      rare: [
        { id: 10041, name: 'Песок', amount: 2 }
      ]
    },
    description: 'Оборонительное сооружение. Наносит урон врагам.',
    imageUrl: '/buildings/Пушка - Сannon/363.webp',
    upgradesTo: 701,
    upgradeCost: 6400,
  },
  {
    id: 701,
    name: 'Пушка 2 уровня',
    englishName: 'Cannon Level 2',
    category: 'Защита',
    type: BuildingType.Default,
    price: 6400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 17 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 11060, // 3h 4m 20s
      accelerationCost: 22,
      durability: 415,
      gloryOnExplosion: 320,
      damage: '12'
    },
    drops: {
      frequent: [
        { id: 10005, name: 'Камни', amount: 9, chance: 40 },
        { id: 10006, name: 'Каменные блоки', amount: 4, chance: 40 }
      ],
      rare: [
        { id: 10004, name: 'Куски супер тыквы', amount: 5, chance: 30 }
      ]
    },
    description: 'Улучшенная пушка, наносящая больше урона.',
    imageUrl: '/buildings/Пушка - Сannon/364.webp',
    upgradesTo: 365,
    upgradeCost: 32400,
  },
  {
    id: 702,
    name: 'Защищённая башня',
    englishName: 'Protected Tower',
    category: 'Защита',
    type: BuildingType.Default,
    price: 100000,
    buildable: false,
    constructionRequirements: {
      population: 16,
    },
    stats: {
      constructionTimeSeconds: 12288, // 3h 24m 48s
      accelerationCost: 23,
      durability: 3184,
      gloryOnExplosion: 5000,
      damage: '15',
      workTimeSeconds: 4,
      givesCoins: 3788,
      takesPopulation: 16
    },
    drops: {
      frequent: [
        { id: 10012, name: 'MGM-52 «Ланс»', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 7 }
      ],
      rare: [
        { id: 10025, name: 'Золотая руда', amount: 14 }
      ]
    },
    description: 'Мощное оборонительное сооружение.',
    imageUrl: '/buildings/защищенная башня/337.webp',
  },
  {
    id: 800,
    name: 'Бандитский замок 1',
    englishName: 'Bandit Castle 1',
    category: 'Клан',
    type: BuildingType.Default,
    price: 105400,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 46 },
        { id: 10033, name: 'Черепок', amount: 1 }
      ],
      population: 4,
    },
    stats: {
      constructionTimeSeconds: 200000, // 2d 7h 33m 20s
      accelerationCost: 94,
      durability: 1004090,
      gloryOnExplosion: 5270,
      givesCoins: 4299,
      bandCapacity: 12
    },
    drops: {
      frequent: [
        { id: 10012, name: 'MGM-52 «Ланс»', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 7 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 6 }
      ]
    },
    description: 'Замок нужен для создания клана. Если ваш замок взорвут или вы его продадите, ваш клан перестанет существовать. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.',
    imageUrl: '/buildings/bandit_castle/373.webp',
    upgradesTo: 373,
    upgradeCost: 105400
  },
  {
    id: 801,
    name: 'Сторожевая башня',
    englishName: 'Watchtower',
    category: 'Клан',
    type: BuildingType.Default,
    price: 100000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10006, name: 'Каменные блоки', amount: 50 },
        { id: 10033, name: 'Черепок', amount: 50 },
        { id: 10021, name: 'Куски супер репки', amount: 8 },
        { id: 10004, name: 'Куски супер тыквы', amount: 10 }
      ],
      population: 16,
    },
    stats: {
      constructionTimeSeconds: 320, // 5m 20s
      accelerationCost: 4,
      durability: 3184,
      gloryOnExplosion: 5000,
      damage: '10',
      takesPopulation: 16
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 5 },
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 2 }
      ]
    },
    description: 'Собирает налоги с сектора, на котором находится. Для постройки требуется Бандитский замок.',
    imageUrl: '/buildings/watchtower/147.webp',
    upgradesTo: 214,
    upgradeCost: 200000
  },
  {
    id: 610,
    name: 'Дикая каменоломня',
    englishName: 'Wild Quarry',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 30000,
    buildable: false,
    constructionRequirements: {
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 56,
      accelerationCost: 2,
      durability: 1094,
      gloryOnExplosion: 1500,
      takesPopulation: 18,
      workTimeSeconds: 2404, // 40m 4s
      workYieldGold: 20,
      givesCoins: 10631,
      produces: [
        { id: 10005, name: 'Камни', amount: 250 },
        { id: 10022, name: 'Руда', amount: 3 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 50, amount: 1 },
        { id: 10036, name: 'Изумрудная руда', chance: 10, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10042, name: '??????', amount: 2 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Добывает камень и ценные руды.',
    imageUrl: '/buildings/Дикая каменоломня - Stone pit/99.webp',
  },
  {
    id: 27,
    name: 'Хранилище монет',
    englishName: 'Coin Storage',
    category: 'Бизнес',
    type: BuildingType.Storage,
    price: 500,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10001, name: 'Дерево', amount: 1 }],
      population: 5,
    },
    stats: {
      constructionTimeSeconds: 100, // 1m 40s
      accelerationCost: 2,
      durability: 598,
      gloryOnExplosion: 25,
      increasesGoldCapacity: 5500,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 5 500 монет.',
    imageUrl: '/buildings/storage_coins/27.webp',
    upgradesTo: 41,
    upgradeCost: 1000,
  },
  {
    id: 41,
    name: 'Хранилище монет 2',
    englishName: 'Coin Storage 2',
    category: 'Бизнес',
    type: BuildingType.Storage,
    price: 1000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 1 }
      ],
      population: 5,
    },
    stats: {
      constructionTimeSeconds: 375,
      accelerationCost: 4,
      durability: 647,
      gloryOnExplosion: 50,
      increasesGoldCapacity: 8000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 8 000 монет.',
    imageUrl: '/buildings/storage_coins/41.webp',
    upgradesTo: 42,
    upgradeCost: 2000,
  },
  {
    id: 42,
    name: 'Хранилище монет 3 уровня',
    englishName: 'Coin Storage 3',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 1 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 1029, // 17m 9s
      accelerationCost: 7,
      durability: 713,
      gloryOnExplosion: 100,
      increasesGoldCapacity: 13000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 13 000 монет.',
    imageUrl: '/buildings/storage_coins/42.webp',
    upgradesTo: 44,
    upgradeCost: 4000,
  },
  {
    id: 44,
    name: 'Хранилище монет 4',
    englishName: 'Coin Storage 4',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 4000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 2 },
        { id: 10002, name: 'Доски', amount: 1 }
      ],
      population: 8,
    },
    stats: {
      constructionTimeSeconds: 1536, // 25m 36s
      accelerationCost: 8,
      durability: 815,
      gloryOnExplosion: 200,
      increasesGoldCapacity: 23000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 23 000 монет.',
    imageUrl: '/buildings/storage_coins/44.webp',
    upgradesTo: 45,
    upgradeCost: 8000,
  },
  {
    id: 45,
    name: 'Хранилище монет 5',
    englishName: 'Coin Storage 5',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 8000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10002, name: 'Доски', amount: 2 }
      ],
      population: 9,
    },
    stats: {
      constructionTimeSeconds: 2187, // 36m 27s
      accelerationCost: 10,
      durability: 958,
      gloryOnExplosion: 400,
      increasesGoldCapacity: 43000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 43 000 монет.',
    imageUrl: '/buildings/storage_coins/45.webp',
    upgradesTo: 46,
    upgradeCost: 16000,
  },
  {
    id: 46,
    name: 'Хранилище монет 6',
    englishName: 'Coin Storage 6',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 16000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 8 },
        { id: 10002, name: 'Доски', amount: 3 },
        { id: 10005, name: 'Камни', amount: 1 }
      ],
      population: 11,
    },
    stats: {
      constructionTimeSeconds: 3993, // 1h 6m 33s
      accelerationCost: 13,
      durability: 1172,
      gloryOnExplosion: 800,
      increasesGoldCapacity: 83000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 83 000 монет.',
    imageUrl: '/buildings/storage_coins/46.webp',
    upgradesTo: 47,
    upgradeCost: 32000,
  },
  {
    id: 47,
    name: 'Хранилище монет 7',
    englishName: 'Coin Storage 7',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 32000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 17 },
        { id: 10002, name: 'Доски', amount: 6 },
        { id: 10005, name: 'Камни', amount: 2 }
      ],
      population: 13,
    },
    stats: {
      constructionTimeSeconds: 6591, // 1h 49m 51s
      accelerationCost: 17,
      durability: 1480,
      gloryOnExplosion: 1600,
      increasesGoldCapacity: 163000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 163 000 монет.',
    imageUrl: '/buildings/storage_coins/47.webp',
    upgradesTo: 48,
    upgradeCost: 64000,
  },
  {
    id: 48,
    name: 'Хранилище монет 8',
    englishName: 'Coin Storage 8',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 64000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 34 },
        { id: 10002, name: 'Доски', amount: 13 },
        { id: 10005, name: 'Камни', amount: 4 }
      ],
      population: 16,
    },
    stats: {
      constructionTimeSeconds: 12288, // 3h 24m 48s
      accelerationCost: 23,
      durability: 1924,
      gloryOnExplosion: 3200,
      increasesGoldCapacity: 323000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 323 000 монет.',
    imageUrl: '/buildings/storage_coins/48.webp',
    upgradesTo: 68,
    upgradeCost: 128000,
  },
  {
    id: 68,
    name: 'Хранилище монет 9',
    englishName: 'Coin Storage 9',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 128000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 26 },
        { id: 10005, name: 'Камни', amount: 7 },
        { id: 10024, name: 'Супер лилия', amount: 1 }
      ],
      population: 19,
    },
    stats: {
      constructionTimeSeconds: 20577, // 5h 42m 57s
      accelerationCost: 30,
      durability: 2572,
      gloryOnExplosion: 6400,
      increasesGoldCapacity: 643000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 643 000 монет.',
    imageUrl: '/buildings/storage_coins/68.webp',
    upgradesTo: 69,
    upgradeCost: 256000,
  },
  {
    id: 69,
    name: 'Хранилище монет 10',
    englishName: 'Coin Storage 10',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 256000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 14 },
        { id: 10003, name: 'Куски супер гриба', amount: 1 },
        { id: 10024, name: 'Супер лилия', amount: 2 }
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 36501, // 10h 8m 21s
      accelerationCost: 40,
      durability: 3506,
      gloryOnExplosion: 12800,
      increasesGoldCapacity: 1283000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 1 283 000 монет.',
    imageUrl: '/buildings/storage_coins/69.webp',
    upgradesTo: 75,
    upgradeCost: 512000,
  },
  {
    id: 75,
    name: 'Хранилище монет 11',
    englishName: 'Coin Storage 11',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 512000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 36 },
        { id: 10003, name: 'Куски супер гриба', amount: 2 }
      ],
      population: 28,
    },
    stats: {
      constructionTimeSeconds: 65856, // 18h 17m 36s
      accelerationCost: 54,
      durability: 4854,
      gloryOnExplosion: 25600,
      increasesGoldCapacity: 2563000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 2 563 000 монет.',
    imageUrl: '/buildings/storage_coins/75.webp',
    upgradesTo: 97,
    upgradeCost: 1024000,
  },
  {
    id: 97,
    name: 'Хранилище монет 12',
    englishName: 'Coin Storage 12',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 1024000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 72 },
        { id: 10003, name: 'Куски супер гриба', amount: 3 },
        { id: 10024, name: 'Супер лилия', amount: 3 }
      ],
      population: 34,
    },
    stats: {
      constructionTimeSeconds: 93420, // 25h 57m (approximate)
      accelerationCost: 72,
      durability: 6700,
      gloryOnExplosion: 51200,
      increasesGoldCapacity: 5123000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 5 123 000 монет.',
    imageUrl: '/buildings/storage_coins/97.webp',
    upgradesTo: 152,
    upgradeCost: 2048000,
  },
  {
    id: 152,
    name: 'Хранилище монет 13',
    englishName: 'Coin Storage 13',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 2048000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 144 },
        { id: 10003, name: 'Куски супер гриба', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 5 }
      ],
      population: 42,
    },
    stats: {
      constructionTimeSeconds: 133200, // 37h (approximate)
      accelerationCost: 96,
      durability: 9200,
      gloryOnExplosion: 102400,
      increasesGoldCapacity: 10243000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 10 243 000 монет.',
    imageUrl: '/buildings/storage_coins/152.webp',
    upgradesTo: 176,
    upgradeCost: 4096000,
  },
  {
    id: 176,
    name: 'Хранилище монет 14',
    englishName: 'Coin Storage 14',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 4096000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 288 },
        { id: 10003, name: 'Куски супер гриба', amount: 8 },
        { id: 10024, name: 'Супер лилия', amount: 8 }
      ],
      population: 52,
    },
    stats: {
      constructionTimeSeconds: 190080, // 52h 48m (approximate)
      accelerationCost: 128,
      durability: 12600,
      gloryOnExplosion: 204800,
      increasesGoldCapacity: 20483000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 20 483 000 монет.',
    imageUrl: '/buildings/storage_coins/176.webp',
    upgradesTo: 250,
    upgradeCost: 8192000,
  },
  {
    id: 250,
    name: 'Хранилище монет 15',
    englishName: 'Coin Storage 15',
    category: 'Хранилище',
    type: BuildingType.Storage,
    price: 8192000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 4 },
        { id: 10021, name: 'Куски супер репки', amount: 3 }
      ],
      population: 57,
    },
    stats: {
      constructionTimeSeconds: 555579, // 6 days 10h 19m 39s
      accelerationCost: 157,
      durability: 19508,
      gloryOnExplosion: 409600,
      increasesGoldCapacity: 40963000,
      takesPopulation: 0,
    },
    drops: {
      frequent: [],
      rare: []
    },
    description: 'Вмещает 40 963 000 монет.',
    imageUrl: '/buildings/storage_coins/250.webp',
  },
  {
    id: 50005,
    name: 'Гора',
    englishName: 'Mountain',
    category: 'Природа',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 999999,
      gloryOnExplosion: 0,
      takesPopulation: 0,
    },
    drops: {},
    description: 'Величественная гора. Несокрушимая и тяжелая.',
    imageUrl: '/buildings/Реки и Горы/50005.webp'
  },
  {
    id: 50004,
    name: 'Река',
    englishName: 'River',
    category: 'Природа',
    type: BuildingType.Default,
    price: 0,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 999999,
      gloryOnExplosion: 0,
      takesPopulation: 0,
    },
    drops: {},
    description: 'Бурная река.',
    imageUrl: '/buildings/Реки и Горы/50004.webp'
  },
  {
    id: 31612,
    name: 'Военный рынок',
    englishName: 'Military Market',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 40000,
    buildable: true,
    constructionRequirements: {
      population: 13,
    },
    stats: {
      constructionTimeSeconds: 260,
      accelerationCost: 3,
      durability: 2016,
      gloryOnExplosion: 2000,
      givesCoins: 2268
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 3 }
      ],
      rare: [
        { id: 10042, name: '??????', amount: 2 }
      ]
    },
    description: 'Специализированный рынок для торговли военными товарами и редкими ресурсами.',
    imageUrl: '/buildings/Специальные Здания/Военный рынок - Military market/136.webp'
  },
  {
    id: 6200,
    name: 'Камнедробилка',
    englishName: 'Stone Crusher',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 100000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 200 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 3328,
      gloryOnExplosion: 5000,
      takesPopulation: 8,
      workTimeSeconds: 1262, // 21m 2s
      workYieldGold: 50,
      givesCoins: 4775,
      produces: [
        { id: 10006, name: 'Каменные блоки', amount: 6 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 0.13, amount: 1 }
      ],
      consumes: [
        { id: 10005, name: 'Камни', amount: 11 },
        { id: 10009, name: 'Канистра с бензином', amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 5 },
        { id: 10004, name: 'Куски супер тыквы', amount: 5 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 5 }
      ]
    },
    description: 'Дробит камни в каменные блоки.',
    imageUrl: '/buildings/Заводы/Камнедробилка - Stone crusher/98.webp',
    upgradesTo: 4091,
    upgradeCost: 400000
  },
  {
    id: 262,
    name: 'Сталеплавильный завод',
    englishName: 'Steel Mill',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1060000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 2120 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 10928,
      gloryOnExplosion: 53000,
      takesPopulation: 13,
      workTimeSeconds: 4349, // 1h 12m 29s
      workYieldGold: 30,
      givesCoins: 13538,
      produces: [
        { id: 10023, name: 'Сталь', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 0.68, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 15 },
        { id: 10022, name: 'Руда', amount: 2 },
        { id: 10024, name: 'Супер лилия', amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 11 },
        { id: 10040, name: 'Стальной лист', amount: 5 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 21 }
      ]
    },
    description: 'Производит сталь из руды. Требует бензин и супер лилию для работы.',
    imageUrl: '/buildings/Заводы/Сталеплавильный завод - Steel mill/560.webp',
    upgradesTo: 475,
    upgradeCost: 1240000
  },
  {
    id: 475,
    name: 'Сталеплавильный завод уровень - 2',
    englishName: 'Steel Mill Level 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1240000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1240 },
        { id: 10006, name: 'Каменные блоки', amount: 124 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 1029, // 17m 9s
      accelerationCost: 7,
      durability: 12776,
      gloryOnExplosion: 62000,
      takesPopulation: 14,
      workTimeSeconds: 6150, // 1h 42m 30s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10023, name: 'Сталь', amount: 2 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 1.36, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 30 },
        { id: 10022, name: 'Руда', amount: 4 },
        { id: 10024, name: 'Супер лилия', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 16 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 4 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 2.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/560.webp',
    upgradesTo: 476,
    upgradeCost: 1540000
  },
  {
    id: 476,
    name: 'Сталеплавильный завод уровень - 3',
    englishName: 'Steel Mill Level 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1540000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1540 },
        { id: 10006, name: 'Каменные блоки', amount: 154 }
      ],
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 5184, // 1h 26m 24s
      accelerationCost: 15,
      durability: 14976,
      gloryOnExplosion: 77000,
      takesPopulation: 16,
      workTimeSeconds: 7288, // 2h 1m 28s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10023, name: 'Сталь', amount: 3 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 2.04, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 55 },
        { id: 10022, name: 'Руда', amount: 6 },
        { id: 10024, name: 'Супер лилия', amount: 4 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 9 },
        { id: 10042, name: '??????', amount: 5 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 305 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 3.',
    imageUrl: '/buildings/factories/Золотоплавильный завод - Gold factory/476.webp',
    upgradesTo: 477,
    upgradeCost: 1960000
  },
  {
    id: 477,
    name: 'Сталеплавильный завод уровень - 4',
    englishName: 'Steel Mill Level 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1960000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 20 },
        { id: 10006, name: 'Каменные блоки', amount: 196 },
        { id: 10023, name: 'Сталь', amount: 4 }
      ],
      population: 17,
    },
    stats: {
      constructionTimeSeconds: 14739, // 4h 5m 39s
      accelerationCost: 26,
      durability: 18048,
      gloryOnExplosion: 98000,
      takesPopulation: 17,
      workTimeSeconds: 12668, // 3h 31m 8s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 2.72, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 90 },
        { id: 10022, name: 'Руда', amount: 10 },
        { id: 10024, name: 'Супер лилия', amount: 6 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 7 },
        { id: 10040, name: 'Стальной лист', amount: 12 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 118 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 4.',
    imageUrl: '/buildings/factories/Золотоплавильный завод - Gold factory/477.webp',
    upgradesTo: 478,
    upgradeCost: 2500000
  },
  {
    id: 478,
    name: 'Сталеплавильный завод уровень - 5',
    englishName: 'Steel Mill Level 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 25 },
        { id: 10006, name: 'Каменные блоки', amount: 250 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 36501, // 10h 8m 21s
      accelerationCost: 40,
      durability: 21272,
      gloryOnExplosion: 125000,
      takesPopulation: 18,
      workTimeSeconds: 18547, // 5h 9m 7s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10023, name: 'Сталь', amount: 7 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 3.4, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 135 },
        { id: 10022, name: 'Руда', amount: 14 },
        { id: 10024, name: 'Супер лилия', amount: 9 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 41 },
        { id: 10040, name: 'Стальной лист', amount: 17 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 78 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 5.',
    imageUrl: '/buildings/factories/Золотоплавильный завод - Gold factory/478.webp',
    upgradesTo: 479,
    upgradeCost: 3160000
  },
  {
    id: 479,
    name: 'Сталеплавильный завод уровень - 6',
    englishName: 'Steel Mill Level 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3160000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 32 },
        { id: 10006, name: 'Каменные блоки', amount: 316 },
        { id: 10023, name: 'Сталь', amount: 7 }
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 81000, // 22h 30m
      accelerationCost: 60,
      durability: 25080,
      gloryOnExplosion: 158000,
      takesPopulation: 24,
      workTimeSeconds: 26599, // 7h 23m 19s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10023, name: 'Сталь', amount: 10 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 4.08, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 190 },
        { id: 10022, name: 'Руда', amount: 20 },
        { id: 10024, name: 'Супер лилия', amount: 13 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 57 },
        { id: 10036, name: 'Изумрудная руда', amount: 16 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 15 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 6.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/561.webp',
    upgradesTo: 480,
    upgradeCost: 3940000
  },
  {
    id: 480,
    name: 'Сталеплавильный завод уровень - 7',
    englishName: 'Steel Mill Level 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3940000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 39 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 9 }
      ],
      population: 37,
    },
    stats: {
      constructionTimeSeconds: 151959, // 1d 18h 12m 39s
      accelerationCost: 82,
      durability: 29000,
      gloryOnExplosion: 197000,
      takesPopulation: 29,
      workTimeSeconds: 35289, // 9h 48m 9s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10023, name: 'Сталь', amount: 13 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 4.76, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 255 },
        { id: 10022, name: 'Руда', amount: 26 },
        { id: 10024, name: 'Супер лилия', amount: 17 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 34 },
        { id: 10023, name: 'Сталь', amount: 80 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 1141 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 7.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/570.webp',
    upgradesTo: 481,
    upgradeCost: 4840000
  },
  {
    id: 481,
    name: 'Сталеплавильный завод уровень - 8',
    englishName: 'Steel Mill Level 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4840000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 48 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 11 }
      ],
      population: 45,
    },
    stats: {
      constructionTimeSeconds: 268575, // 3d 3h 56m 15s
      accelerationCost: 110,
      durability: 33376,
      gloryOnExplosion: 242000,
      takesPopulation: 36,
      workTimeSeconds: 46191, // 12h 49m 51s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10023, name: 'Сталь', amount: 17 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 5.44, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 330 },
        { id: 10022, name: 'Руда', amount: 34 },
        { id: 10024, name: 'Супер лилия', amount: 22 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 44 },
        { id: 10042, name: '??????', amount: 24 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 403 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 8.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/575.webp',
    upgradesTo: 482,
    upgradeCost: 5860000
  },
  {
    id: 482,
    name: 'Сталеплавильный завод уровень - 9',
    englishName: 'Steel Mill Level 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5860000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 59 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 13 }
      ],
      population: 54,
    },
    stats: {
      constructionTimeSeconds: 471192, // 5d 11h 13m 12s
      accelerationCost: 145,
      durability: 37792,
      gloryOnExplosion: 293000,
      takesPopulation: 43,
      workTimeSeconds: 57533, // 15h 58m 53s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10023, name: 'Сталь', amount: 21 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 6.12, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 415 },
        { id: 10022, name: 'Руда', amount: 42 },
        { id: 10024, name: 'Супер лилия', amount: 28 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 30 },
        { id: 10040, name: 'Стальной лист', amount: 52 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 245 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 9.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/576.webp',
    upgradesTo: 483,
    upgradeCost: 7000000
  },
  {
    id: 483,
    name: 'Сталеплавильный завод уровень - 10',
    englishName: 'Steel Mill Level 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 7000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 70 },
        { id: 10026, name: 'Золото', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 15 }
      ],
      population: 63,
    },
    stats: {
      constructionTimeSeconds: 753741, // 8d 16h 22m 21s
      accelerationCost: 183,
      durability: 42624,
      gloryOnExplosion: 350000,
      takesPopulation: 52,
      workTimeSeconds: 71288, // 19h 48m 8s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10023, name: 'Сталь', amount: 26 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 6.8, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 510 },
        { id: 10022, name: 'Руда', amount: 52 },
        { id: 10024, name: 'Супер лилия', amount: 34 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 165 },
        { id: 10040, name: 'Стальной лист', amount: 66 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 42 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 10.',
    imageUrl: '/buildings/factories/Золотоплавильный завод - Gold factory/483.webp',
    upgradesTo: 484,
    upgradeCost: 8260000
  },
  {
    id: 484,
    name: 'Сталеплавильный завод уровень - 11',
    englishName: 'Steel Mill Level 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 8260000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 11 },
        { id: 10034, name: 'Изумруд', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 27 }
      ],
      population: 73,
    },
    stats: {
      constructionTimeSeconds: 1168251, // 13d 12h 10m 51s
      accelerationCost: 228,
      durability: 47496,
      gloryOnExplosion: 413000,
      takesPopulation: 59,
      workTimeSeconds: 85473, // 23h 44m 33s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10023, name: 'Сталь', amount: 31 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 7.48, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 615 },
        { id: 10022, name: 'Руда', amount: 62 },
        { id: 10024, name: 'Супер лилия', amount: 41 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 204 },
        { id: 10036, name: 'Изумрудная руда', amount: 55 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 3060 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 11.',
    imageUrl: '/buildings/factories/Золотоплавильный завод - Gold factory/484.webp',
    upgradesTo: 485,
    upgradeCost: 9640000
  },
  {
    id: 485,
    name: 'Сталеплавильный завод уровень - 12',
    englishName: 'Steel Mill Level 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 9640000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 13 },
        { id: 10034, name: 'Изумруд', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 32 }
      ],
      population: 84,
    },
    stats: {
      constructionTimeSeconds: 1781712, // 20d 13h 55m 12s
      accelerationCost: 281,
      durability: 52696,
      gloryOnExplosion: 482000,
      takesPopulation: 69,
      workTimeSeconds: 100692, // 1d 4h 18m 12s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10023, name: 'Сталь', amount: 37 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 8.16, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 730 },
        { id: 10022, name: 'Руда', amount: 74 },
        { id: 10024, name: 'Супер лилия', amount: 49 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 32 },
        { id: 10036, name: 'Изумрудная руда', amount: 67 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 1005 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 12.',
    imageUrl: '/buildings/factories/Золотоплавильный завод - Gold factory/485.webp',
    upgradesTo: 486,
    upgradeCost: 11140000
  },
  {
    id: 486,
    name: 'Сталеплавильный завод уровень - 13',
    englishName: 'Steel Mill Level 13',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 11140000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 15 },
        { id: 10034, name: 'Изумруд', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 36 }
      ],
      population: 95,
    },
    stats: {
      constructionTimeSeconds: 2574525, // 29d 18h 28m 45s
      accelerationCost: 338,
      durability: 57960,
      gloryOnExplosion: 557000,
      takesPopulation: 78,
      workTimeSeconds: 120124, // 1d 9h 2m 4s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10023, name: 'Сталь', amount: 43 }
      ],
      sometimesProduces: [
        { id: 10018, name: 'Яйцо Горыныча', chance: 8.85, amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 855 },
        { id: 10022, name: 'Руда', amount: 86 },
        { id: 10024, name: 'Супер лилия', amount: 57 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 133 },
        { id: 10023, name: 'Сталь', amount: 318 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 576 }
      ]
    },
    description: 'Производит сталь из руды. Уровень 13. Максимальный уровень.',
    imageUrl: '/buildings/factories/Золотоплавильный завод - Gold factory/486.webp'
  },
  {
    id: 266,
    name: 'Золотоплавильный завод',
    englishName: 'Gold Smelter',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1570000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 3140 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 7218, // 2h 18s
      accelerationCost: 18,
      durability: 12824,
      gloryOnExplosion: 78500,
      takesPopulation: 14,
      workTimeSeconds: 2881, // 48m 1s
      workYieldGold: 60,
      givesCoins: 13538,
      produces: [
        { id: 10026, name: 'Золото', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 10.68, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 10.68, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 2 },
        { id: 10009, name: 'Канистра с бензином', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10042, name: '??????', amount: 4 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 29 }
      ]
    },
    description: 'Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/560.webp',
    upgradesTo: 557,
    upgradeCost: 1780000,
  },
  {
    id: 557,
    name: 'Золотоплавильный завод уровень - 2',
    englishName: 'Gold Smelter Level 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1780000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1780 },
        { id: 10006, name: 'Каменные блоки', amount: 178 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 7440,
      accelerationCost: 18,
      durability: 14168,
      gloryOnExplosion: 89000,
      takesPopulation: 15,
      workTimeSeconds: 2377,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10026, name: 'Золото', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 1.36, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 1.36, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 2 },
        { id: 10009, name: 'Канистра с бензином', amount: 7 },
        { id: 10024, name: 'Супер лилия', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 19 },
        { id: 10036, name: 'Изумрудная руда', amount: 5 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 73 }
      ]
    },
    upgradesTo: 558,
    upgradeCost: 2130000,
    description: 'Золотоплавильный завод 2 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/560.webp',
  },
  {
    id: 558,
    name: 'Золотоплавильный завод уровень - 3',
    englishName: 'Gold Smelter Level 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2130000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 2130 },
        { id: 10006, name: 'Каменные блоки', amount: 213 }
      ],
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 8409,
      accelerationCost: 19,
      durability: 17112,
      gloryOnExplosion: 106500,
      takesPopulation: 17,
      workTimeSeconds: 7086,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10026, name: 'Золото', amount: 2 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 2.04, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 2.04, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 3 },
        { id: 10009, name: 'Канистра с бензином', amount: 9 },
        { id: 10024, name: 'Супер лилия', amount: 4 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 149 },
        { id: 10023, name: 'Сталь', amount: 28 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 51 }
      ]
    },
    upgradesTo: 559,
    upgradeCost: 2620000,
    description: 'Золотоплавильный завод 3 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/560.webp',
  },
  {
    id: 559,
    name: 'Золотоплавильный завод уровень - 4',
    englishName: 'Gold Smelter Level 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2620000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 26 },
        { id: 10006, name: 'Каменные блоки', amount: 262 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      population: 17,
    },
    stats: {
      constructionTimeSeconds: 10639,
      accelerationCost: 22,
      durability: 18528,
      gloryOnExplosion: 131000,
      takesPopulation: 17,
      workTimeSeconds: 3409,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10026, name: 'Золото', amount: 2 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 2.72, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 2.72, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 4 },
        { id: 10009, name: 'Канистра с бензином', amount: 13 },
        { id: 10024, name: 'Супер лилия', amount: 6 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 14 },
        { id: 10023, name: 'Сталь', amount: 33 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 8 }
      ]
    },
    upgradesTo: 560,
    upgradeCost: 3250000,
    description: 'Золотоплавильный завод 4 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/560.webp',
  },
  {
    id: 560,
    name: 'Золотоплавильный завод уровень - 5',
    englishName: 'Gold Smelter Level 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3250000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 33 },
        { id: 10006, name: 'Каменные блоки', amount: 325 },
        { id: 10023, name: 'Сталь', amount: 7 }
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 15716,
      accelerationCost: 26,
      durability: 21400,
      gloryOnExplosion: 162500,
      takesPopulation: 18,
      workTimeSeconds: 5288,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10026, name: 'Золото', amount: 3 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 3.4, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 3.4, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 6 },
        { id: 10009, name: 'Канистра с бензином', amount: 17 },
        { id: 10024, name: 'Супер лилия', amount: 9 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 19 },
        { id: 10042, name: '??????', amount: 10 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 622 }
      ]
    },
    upgradesTo: 561,
    upgradeCost: 4020000,
    description: 'Золотоплавильный завод 5 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/560.webp',
  },
  {
    id: 561,
    name: 'Золотоплавильный завод уровень - 6',
    englishName: 'Gold Smelter Level 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4020000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 40 },
        { id: 10006, name: 'Каменные блоки', amount: 402 },
        { id: 10023, name: 'Сталь', amount: 9 }
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 26100,
      accelerationCost: 34,
      durability: 26152,
      gloryOnExplosion: 201000,
      takesPopulation: 24,
      workTimeSeconds: 19895,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 5 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 4.08, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 4.08, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 8 },
        { id: 10009, name: 'Канистра с бензином', amount: 23 },
        { id: 10024, name: 'Супер лилия', amount: 13 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 62 },
        { id: 10040, name: 'Стальной лист', amount: 25 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 248 }
      ]
    },
    upgradesTo: 562,
    upgradeCost: 4930000,
    description: 'Золотоплавильный завод 6 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/561.webp',
  },
  {
    id: 562,
    name: 'Золотоплавильный завод уровень - 7',
    englishName: 'Gold Smelter Level 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4930000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 49 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 11 }
      ],
      population: 37,
    },
    stats: {
      constructionTimeSeconds: 42657,
      accelerationCost: 44,
      durability: 31000,
      gloryOnExplosion: 246500,
      takesPopulation: 30,
      workTimeSeconds: 23315,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 6 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 4.76, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 4.76, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 10 },
        { id: 10009, name: 'Канистра с бензином', amount: 29 },
        { id: 10024, name: 'Супер лилия', amount: 17 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 25 },
        { id: 10040, name: 'Стальной лист', amount: 30 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 300 }
      ]
    },
        upgradesTo: 563,
    upgradeCost: 5980000,
    description: 'Золотоплавильный завод 7 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/561.webp',
  },
  {
    id: 563,
    name: 'Золотоплавильный завод уровень - 8',
    englishName: 'Gold Smelter Level 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5980000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 60 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 13 }
      ],
      population: 45,
    },
    stats: {
      constructionTimeSeconds: 71007,
      accelerationCost: 56,
      durability: 34424,
      gloryOnExplosion: 299000,
      takesPopulation: 36,
      workTimeSeconds: 36378,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 8 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 5.44, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 5.44, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 12 },
        { id: 10009, name: 'Канистра с бензином', amount: 37 },
        { id: 10024, name: 'Супер лилия', amount: 22 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 14 },
        { id: 10036, name: 'Изумрудная руда', amount: 29 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 27 }
      ]
    },
    upgradesTo: 564,
    upgradeCost: 7170000,
    description: 'Золотоплавильный завод 8 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/561.webp',
  },
  {
    id: 564,
    name: 'Золотоплавильный завод уровень - 9',
    englishName: 'Gold Smelter Level 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 7170000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 72 },
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 16 }
      ],
      population: 54,
    },
    stats: {
      constructionTimeSeconds: 117424,
      accelerationCost: 72,
      durability: 38840,
      gloryOnExplosion: 358500,
      takesPopulation: 45,
      workTimeSeconds: 45650,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 10 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 6.12, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 6.12, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 15 },
        { id: 10009, name: 'Канистра с бензином', amount: 45 },
        { id: 10024, name: 'Супер лилия', amount: 28 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 60 },
        { id: 10023, name: 'Сталь', amount: 143 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 2047 }
      ]
    },
    upgradesTo: 565,
    upgradeCost: 8500000,
    description: 'Золотоплавильный завод 9 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/561.webp',
  },
  {
    id: 565,
    name: 'Золотоплавильный завод уровень - 10',
    englishName: 'Gold Smelter Level 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 8500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 85 },
        { id: 10026, name: 'Золото', amount: 8 },
        { id: 10023, name: 'Сталь', amount: 19 }
      ],
      population: 63,
    },
    stats: {
      constructionTimeSeconds: 182232,
      accelerationCost: 90,
      durability: 43424,
      gloryOnExplosion: 425000,
      takesPopulation: 52,
      workTimeSeconds: 55454,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 12 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 6.8, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 6.8, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 18 },
        { id: 10009, name: 'Канистра с бензином', amount: 55 },
        { id: 10024, name: 'Супер лилия', amount: 34 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 75 },
        { id: 10042, name: '??????', amount: 40 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 682 }
      ]
    },
    upgradesTo: 566,
    upgradeCost: 9970000,
    description: 'Золотоплавильный завод 10 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/561.webp',
  },
  {
    id: 566,
    name: 'Золотоплавильный завод уровень - 11',
    englishName: 'Gold Smelter Level 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 9970000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 100 },
        { id: 10026, name: 'Золото', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 22 }
      ],
      population: 73,
    },
    stats: {
      constructionTimeSeconds: 279511,
      accelerationCost: 111,
      durability: 47640,
      gloryOnExplosion: 498500,
      takesPopulation: 59,
      workTimeSeconds: 61484,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 14 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 7.48, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 7.48, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 22 },
        { id: 10009, name: 'Канистра с бензином', amount: 65 },
        { id: 10024, name: 'Супер лилия', amount: 41 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 48 },
        { id: 10040, name: 'Стальной лист', amount: 83 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 389 }
      ]
    },
    upgradesTo: 567,
    upgradeCost: 11580000,
    description: 'Золотоплавильный завод 11 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/570.webp',
  },
  {
    id: 567,
    name: 'Золотоплавильный завод уровень - 12',
    englishName: 'Gold Smelter Level 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 11580000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 116 },
        { id: 10026, name: 'Золото', amount: 11 },
        { id: 10023, name: 'Сталь', amount: 25 }
      ],
      population: 84,
    },
    stats: {
      constructionTimeSeconds: 422092,
      accelerationCost: 137,
      durability: 53080,
      gloryOnExplosion: 579000,
      takesPopulation: 69,
      workTimeSeconds: 77041,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 17 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 8.16, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 8.16, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 26 },
        { id: 10009, name: 'Канистра с бензином', amount: 77 },
        { id: 10024, name: 'Супер лилия', amount: 49 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 255 },
        { id: 10040, name: 'Стальной лист', amount: 102 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 65 }
      ]
    },
    upgradesTo: 568,
    upgradeCost: 13330000,
    description: 'Золотоплавильный завод 12 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/570.webp',
  },
  {
    id: 568,
    name: 'Золотоплавильный завод уровень - 13',
    englishName: 'Gold Smelter Level 13',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 13330000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 133 },
        { id: 10026, name: 'Золото', amount: 12 },
        { id: 10023, name: 'Сталь', amount: 29 }
      ],
      population: 95,
    },
    stats: {
      constructionTimeSeconds: 607362,
      accelerationCost: 164,
      durability: 57616,
      gloryOnExplosion: 666500,
      takesPopulation: 78,
      workTimeSeconds: 83661,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 19 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 8.85, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 8.85, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 30 },
        { id: 10009, name: 'Канистра с бензином', amount: 89 },
        { id: 10024, name: 'Супер лилия', amount: 57 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 301 },
        { id: 10036, name: 'Изумрудная руда', amount: 81 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 4503 }
      ]
    },
    upgradesTo: 569,
    upgradeCost: 15220000,
    description: 'Золотоплавильный завод 13 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/570.webp',
  },
  {
    id: 569,
    name: 'Золотоплавильный завод уровень - 14',
    englishName: 'Gold Smelter Level 14',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 15220000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 152 },
        { id: 10026, name: 'Золото', amount: 14 },
        { id: 10023, name: 'Сталь', amount: 33 }
      ],
      population: 107,
    },
    stats: {
      constructionTimeSeconds: 864730,
      accelerationCost: 196,
      durability: 63264,
      gloryOnExplosion: 761000,
      takesPopulation: 86,
      workTimeSeconds: 100076,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 22 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 9.53, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 9.53, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 34 },
        { id: 10009, name: 'Канистра с бензином', amount: 103 },
        { id: 10024, name: 'Супер лилия', amount: 66 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 46 },
        { id: 10036, name: 'Изумрудная руда', amount: 97 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 1448 }
      ]
    },
    upgradesTo: 570,
    upgradeCost: 17250000,
    description: 'Золотоплавильный завод 14 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/570.webp',
  },
  {
    id: 570,
    name: 'Золотоплавильный завод уровень - 15',
    englishName: 'Gold Smelter Level 15',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 17250000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 24 },
        { id: 10034, name: 'Изумруд', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 56 }
      ],
      population: 120,
    },
    stats: {
      constructionTimeSeconds: 1216800,
      accelerationCost: 233,
      durability: 69496,
      gloryOnExplosion: 862500,
      takesPopulation: 99,
      workTimeSeconds: 121883,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 26 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 10.21, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 10.21, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 39 },
        { id: 10009, name: 'Канистра с бензином', amount: 117 },
        { id: 10024, name: 'Супер лилия', amount: 76 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 191 },
        { id: 10023, name: 'Сталь', amount: 457 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 828 }
      ]
    },
    upgradesTo: 571,
    upgradeCost: 19420000,
    description: 'Золотоплавильный завод 15 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/570.webp',
  },
  {
    id: 571,
    name: 'Золотоплавильный завод уровень - 16',
    englishName: 'Gold Smelter Level 16',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 19420000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 26 },
        { id: 10034, name: 'Изумруд', amount: 8 },
        { id: 10023, name: 'Сталь', amount: 63 }
      ],
      population: 133,
    },
    stats: {
      constructionTimeSeconds: 1654045,
      accelerationCost: 271,
      durability: 74912,
      gloryOnExplosion: 971000,
      takesPopulation: 108,
      workTimeSeconds: 134958,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 29 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 10.89, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 10.89, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 44 },
        { id: 10009, name: 'Канистра с бензином', amount: 133 },
        { id: 10024, name: 'Супер лилия', amount: 86 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 222 },
        { id: 10042, name: '??????', amount: 117 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 128 }
      ]
    },
    upgradesTo: 572,
    upgradeCost: 21730000,
    description: 'Золотоплавильный завод 16 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/575.webp',
  },
  {
    id: 572,
    name: 'Золотоплавильный завод уровень - 17',
    englishName: 'Gold Smelter Level 17',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 21730000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 30 },
        { id: 10034, name: 'Изумруд', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 71 }
      ],
      population: 147,
    },
    stats: {
      constructionTimeSeconds: 2230766,
      accelerationCost: 315,
      durability: 80920,
      gloryOnExplosion: 1086500,
      takesPopulation: 119,
      workTimeSeconds: 153485,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 33 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 11.57, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 11.57, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 50 },
        { id: 10009, name: 'Канистра с бензином', amount: 149 },
        { id: 10024, name: 'Супер лилия', amount: 97 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 137 },
        { id: 10040, name: 'Стальной лист', amount: 237 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 8882 }
      ]
    },
    upgradesTo: 573,
    upgradeCost: 24180000,
    description: 'Золотоплавильный завод 17 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/575.webp',
  },
  {
    id: 573,
    name: 'Золотоплавильный завод уровень - 18',
    englishName: 'Gold Smelter Level 18',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 24180000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 33 },
        { id: 10034, name: 'Изумруд', amount: 10 },
        { id: 10023, name: 'Сталь', amount: 79 }
      ],
      population: 162,
    },
    stats: {
      constructionTimeSeconds: 2983269,
      accelerationCost: 364,
      durability: 87000,
      gloryOnExplosion: 1209000,
      takesPopulation: 133,
      workTimeSeconds: 172264,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 37 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 12.25, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 12.25, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 56 },
        { id: 10009, name: 'Канистра с бензином', amount: 167 },
        { id: 10024, name: 'Супер лилия', amount: 109 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 685 },
        { id: 10040, name: 'Стальной лист', amount: 274 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 2738 }
      ]
    },
    upgradesTo: 574,
    upgradeCost: 26770000,
    description: 'Золотоплавильный завод 18 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/575.webp',
  },
  {
    id: 574,
    name: 'Золотоплавильный завод уровень - 19',
    englishName: 'Gold Smelter Level 19',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 26770000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 37 },
        { id: 10034, name: 'Изумруд', amount: 11 },
        { id: 10023, name: 'Сталь', amount: 87 }
      ],
      population: 177,
    },
    stats: {
      constructionTimeSeconds: 3888863,
      accelerationCost: 416,
      durability: 93184,
      gloryOnExplosion: 1338500,
      takesPopulation: 144,
      workTimeSeconds: 191574,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 41 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 12.93, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 12.93, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 62 },
        { id: 10009, name: 'Канистра с бензином', amount: 185 },
        { id: 10024, name: 'Супер лилия', amount: 121 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 786 },
        { id: 10036, name: 'Изумрудная руда', amount: 210 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 1488 }
      ]
    },
    upgradesTo: 575,
    upgradeCost: 29500000,
    description: 'Золотоплавильный завод 19 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/575.webp',
  },
  {
    id: 575,
    name: 'Золотоплавильный завод уровень - 20',
    englishName: 'Gold Smelter Level 20',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 29500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 40 },
        { id: 10034, name: 'Изумруд', amount: 12 },
        { id: 10023, name: 'Сталь', amount: 96 }
      ],
      population: 193,
    },
    stats: {
      constructionTimeSeconds: 5039539,
      accelerationCost: 473,
      durability: 99448,
      gloryOnExplosion: 1475000,
      takesPopulation: 156,
      workTimeSeconds: 211135,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 45 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 13.61, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 13.61, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 68 },
        { id: 10009, name: 'Канистра с бензином', amount: 205 },
        { id: 10024, name: 'Супер лилия', amount: 134 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 113 },
        { id: 10036, name: 'Изумрудная руда', amount: 239 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 225 }
      ]
    },
    upgradesTo: 576,
    upgradeCost: 32370000,
    description: 'Золотоплавильный завод 20 уровня. Переплавляет самородки в чистое золото.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/575.webp',
  },
  {
    id: 576,
    name: 'Золотоплавильный завод уровень - 21',
    englishName: 'Gold Smelter Level 21',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 32370000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 44 },
        { id: 10034, name: 'Изумруд', amount: 13 },
        { id: 10023, name: 'Сталь', amount: 106 }
      ],
      population: 210,
    },
    stats: {
      constructionTimeSeconds: 6489900,
      accelerationCost: 537,
      durability: 106208,
      gloryOnExplosion: 1618500,
      takesPopulation: 168,
      workTimeSeconds: 236164,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10026, name: 'Золото', amount: 50 }
      ],
      sometimesProduces: [
        { id: 10033, name: 'Черепок', chance: 14.29, amount: 1 },
        { id: 10019, name: 'Мешок муки', chance: 14.29, amount: 1 }
      ],
      consumes: [
        { id: 10044, name: 'Самородок', amount: 75 },
        { id: 10009, name: 'Канистра с бензином', amount: 225 },
        { id: 10024, name: 'Супер лилия', amount: 148 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 446 },
        { id: 10023, name: 'Сталь', amount: 1067 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 15300 }
      ]
    },
    description: 'Золотоплавильный завод 21 уровня. Максимальный уровень.',
    imageUrl: '/buildings/factories/Сталеплавильный завод - Steel mill/576.webp',
  },
  {
    id: 273,
    name: 'Мельница',
    englishName: 'Mill',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5000000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 10 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 20880,
      gloryOnExplosion: 250000,
      takesPopulation: 14,
      workTimeSeconds: 126, // 2m 6s
      workYieldGold: 200,
      givesCoins: 13538,
      produces: [
        { id: 10019, name: 'Мешок муки', amount: 1 }
      ],
      consumes: [
        { id: 10027, name: 'Зёрна гигантской пшеницы', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 11 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 10 },
        { id: 10040, name: 'Стальной лист', amount: 16 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 158 }
      ]
    },
    description: 'Производит муку из пшеницы и лилий.',
    imageUrl: '/buildings/factories/Мельница - Mill/273.webp',
  },
  {
    id: 307,
    name: 'Петардный завод',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 500,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 3 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 27,
      accelerationCost: 1,
      durability: 2032,
      gloryOnExplosion: 25,
      takesPopulation: 6,
      workTimeSeconds: 6368, // 1h 46m 8s
      workYieldGold: 30,
      givesCoins: 2268,
      produces: [
        { id: 10013, name: 'Петарда', amount: 50 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 0.53, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 4.17, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 0.66, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10003, name: '????? ????? ?????', amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 3 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 2 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/623.webp',
    upgradesTo: 619,
    upgradeCost: 3000,
  },
  {
    id: 619,
    name: 'Петардный завод 2',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 8 }
      ],
      population: 6,
    },
    stats: {
      constructionTimeSeconds: 216, // 3m 36s
      accelerationCost: 3,
      durability: 2248,
      gloryOnExplosion: 150,
      takesPopulation: 6,
      workTimeSeconds: 6616, // 1h 50m 16s
      workYieldGold: 60,
      givesCoins: 2268,
      produces: [
        { id: 10013, name: 'Петарда', amount: 52 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 0.13, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 0.67, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 0.25, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 7 },
        { id: 10003, name: '????? ????? ?????', amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 4 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 2268 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 2 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/623.webp',
    upgradesTo: 6201,
    upgradeCost: 10800,
  },
  {
    id: 6201,
    name: 'Петардный завод 3',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 10800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 28 },
        { id: 10002, name: 'Доски', amount: 11 }
      ],
      population: 10,
    },
    stats: {
      constructionTimeSeconds: 1000, // 16m 40s
      accelerationCost: 7,
      durability: 2592,
      gloryOnExplosion: 540,
      takesPopulation: 7,
      workTimeSeconds: 6870, // 1h 54m 30s
      workYieldGold: 90,
      givesCoins: 2735,
      produces: [
        { id: 10013, name: 'Петарда', amount: 54 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 0.3, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 1.5, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 0.56, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 9 },
        { id: 10003, name: '????? ????? ?????', amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Супер гриб', amount: 5 },
        { id: 10020, name: 'Супер лилия', amount: 10 },
        { id: 10000, name: 'Монеты', amount: 2735 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 4 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/623.webp',
    upgradesTo: 6211,
    upgradeCost: 25600,
  },
  {
    id: 6211,
    name: 'Петардный завод 4',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 25600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 67 },
        { id: 10002, name: 'Доски', amount: 26 }
      ],
      population: 14,
    },
    stats: {
      constructionTimeSeconds: 2744, // 45m 44s
      accelerationCost: 11,
      durability: 2272,
      gloryOnExplosion: 1280,
      takesPopulation: 6,
      workTimeSeconds: 5523, // 1h 32m 3s
      workYieldGold: 120,
      givesCoins: 2268,
      produces: [
        { id: 10013, name: 'Петарда', amount: 58 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 0.53, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 2.67, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 1, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 13 },
        { id: 10008, name: 'Бочка с нефтью', amount: 6 },
        { id: 10003, name: '????? ????? ?????', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Супер гриб', amount: 4 },
        { id: 10020, name: 'Супер лилия', amount: 8 },
        { id: 10000, name: 'Монеты', amount: 2268 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/623.webp',
    upgradesTo: 6221,
    upgradeCost: 50000,
  },
  {
    id: 6221,
    name: 'Петардный завод 5',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 50000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 50 },
        { id: 10005, name: 'Камни', amount: 14 },
        { id: 10026, name: 'Золото', amount: 1 }
      ],
      population: 19,
    },
    stats: {
      constructionTimeSeconds: 6859, // 1h 54m 19s
      accelerationCost: 17,
      durability: 3088,
      gloryOnExplosion: 2500,
      takesPopulation: 7,
      workTimeSeconds: 7956, // 2h 12m 36s
      workYieldGold: 150,
      givesCoins: 7853,
      produces: [
        { id: 10013, name: 'Петарда', amount: 62 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 0.83, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 4.17, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 1.56, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 17 },
        { id: 10008, name: 'Бочка с нефтью', amount: 8 },
        { id: 10003, name: '????? ????? ?????', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 5 },
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 3260 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 4 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/623.webp',
    upgradesTo: 6231,
    upgradeCost: 86400,
  },
  {
    id: 6231,
    name: 'Петардный завод 6',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 86400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 86 },
        { id: 10005, name: 'Камни', amount: 24 },
        { id: 10026, name: 'Золото', amount: 1 }
      ],
      population: 24,
    },
    stats: {
      constructionTimeSeconds: 13824, // 3h 50m 24s
      accelerationCost: 25,
      durability: 4064,
      gloryOnExplosion: 4320,
      takesPopulation: 9,
      workTimeSeconds: 11110, // 3h 5m 10s
      workYieldGold: 180,
      givesCoins: 5839,
      produces: [
        { id: 10013, name: 'Петарда', amount: 68 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 1.2, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 6, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 2.25, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 23 },
        { id: 10008, name: 'Бочка с нефтью', amount: 11 },
        { id: 10003, name: '????? ????? ?????', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 5839 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 3 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/623.webp',
    upgradesTo: 6241,
    upgradeCost: 137200,
  },
  {
    id: 6241,
    name: 'Петардный завод 7',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 137200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 137 },
        { id: 10005, name: 'Камни', amount: 38 },
        { id: 10026, name: 'Золото', amount: 2 }
      ],
      population: 29,
    },
    stats: {
      constructionTimeSeconds: 24389, // 6h 46m 29s
      accelerationCost: 33,
      durability: 5336,
      gloryOnExplosion: 6860,
      takesPopulation: 12,
      workTimeSeconds: 5336, // 1h 28m 56s
      workYieldGold: 210,
      givesCoins: 7853,
      produces: [
        { id: 10013, name: 'Петарда', amount: 75 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 1.67, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 8.33, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 3.13, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 28 },
        { id: 10008, name: 'Бочка с нефтью', amount: 14 },
        { id: 10003, name: '????? ????? ?????', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Яйцо Горыныча', amount: 4 },
        { id: 10017, name: 'Детонатор', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 7853 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 3 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/628.webp',
    upgradesTo: 6251,
    upgradeCost: 204800,
  },
  {
    id: 6251,
    name: 'Петардный завод 8',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 204800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 2 },
        { id: 10005, name: 'Камни', amount: 57 },
        { id: 10004, name: 'Куски супер тыквы', amount: 2 }
      ],
      population: 34,
    },
    stats: {
      constructionTimeSeconds: 39304, // 10h 55m 4s
      accelerationCost: 42,
      durability: 5928,
      gloryOnExplosion: 10240,
      takesPopulation: 16,
      workTimeSeconds: 10633, // 2h 57m 13s
      workYieldGold: 240,
      givesCoins: 7853,
      produces: [
        { id: 10013, name: 'Петарда', amount: 82 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 2.13, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 10.67, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 4, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 37 },
        { id: 10008, name: 'Бочка с нефтью', amount: 18 },
        { id: 10003, name: '????? ????? ?????', amount: 3 }
      ]
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба', amount: 2 },
        { id: 10007, name: 'Яйцо Горыныча', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 7853 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 48 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/628.webp',
    upgradesTo: 6261,
    upgradeCost: 291600,
  },
  {
    id: 6261,
    name: 'Петардный завод 9',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 291600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 3 },
        { id: 10005, name: 'Камни', amount: 81 },
        { id: 10023, name: 'Сталь', amount: 1 },
        { id: 10004, name: 'Куски супер тыквы', amount: 3 }
      ],
      population: 40,
    },
    stats: {
      constructionTimeSeconds: 64000, // 17h 46m 40s
      accelerationCost: 53,
      durability: 7336,
      gloryOnExplosion: 14580,
      takesPopulation: 19,
      workTimeSeconds: 15519, // 4h 18m 39s
      workYieldGold: 270,
      givesCoins: 10631,
      produces: [
        { id: 10013, name: 'Петарда', amount: 90 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 2.7, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 13.5, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 5.06, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 45 },
        { id: 10008, name: 'Бочка с нефтью', amount: 22 },
        { id: 10003, name: '????? ????? ?????', amount: 3 }
      ]
    },
    drops: {
      frequent: [
        { id: 10009, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 10 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/628.webp',
    upgradesTo: 6271,
    upgradeCost: 400000,
  },
  {
    id: 6271,
    name: 'Петардный завод 10',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 400000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 4 },
        { id: 10005, name: 'Камни', amount: 111 },
        { id: 10023, name: 'Сталь', amount: 1 },
        { id: 10004, name: 'Куски супер тыквы', amount: 4 }
      ],
      population: 46,
    },
    stats: {
      constructionTimeSeconds: 98536, // 1d 3h 22m 16s
      accelerationCost: 66,
      durability: 8512,
      gloryOnExplosion: 20000,
      takesPopulation: 24,
      workTimeSeconds: 8286, // 2h 18m 6s
      workYieldGold: 300,
      givesCoins: 10631,
      produces: [
        { id: 10013, name: 'Петарда', amount: 100 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 3.33, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 16.67, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 6.25, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 55 },
        { id: 10008, name: 'Бочка с нефтью', amount: 27 },
        { id: 10003, name: '????? ????? ?????', amount: 4 }
      ]
    },
    drops: {
      frequent: [
        { id: 10009, name: 'Золото', amount: 3 },
        { id: 10019, name: 'Супер детонатор', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10025, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/628.webp',
    upgradesTo: 6281,
    upgradeCost: 532400,
  },
  {
    id: 6281,
    name: 'Петардный завод 11',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 532400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 8 },
        { id: 10006, name: 'Каменные блоки', amount: 80 },
        { id: 10023, name: 'Сталь', amount: 2 },
        { id: 10004, name: 'Куски супер тыквы', amount: 7 }
      ],
      population: 53,
    },
    stats: {
      constructionTimeSeconds: 148877, // 1d 17h 21m 17s
      accelerationCost: 81,
      durability: 10192,
      gloryOnExplosion: 26620,
      takesPopulation: 28,
      workTimeSeconds: 16257, // 4h 30m 57s
      workYieldGold: 330,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 110 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 4.03, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 20.17, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 7.56, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 65 },
        { id: 10008, name: 'Бочка с нефтью', amount: 32 },
        { id: 10003, name: '????? ????? ?????', amount: 4 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 10 },
        { id: 10040, name: 'Стальной лист', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 141 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/628.webp',
    upgradesTo: 6291,
    upgradeCost: 691200,
  },
  {
    id: 6291,
    name: 'Петардный завод 12',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 691200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 10 },
        { id: 10006, name: 'Каменные блоки', amount: 104 },
        { id: 10023, name: 'Сталь', amount: 2 },
        { id: 10004, name: 'Куски супер тыквы', amount: 9 }
      ],
      population: 60,
    },
    stats: {
      constructionTimeSeconds: 216000, // 2d 12h
      accelerationCost: 98,
      durability: 11992,
      gloryOnExplosion: 34560,
      takesPopulation: 33,
      workTimeSeconds: 23859, // 6h 37m 39s
      workYieldGold: 360,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 122 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 4.8, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 24, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 9, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 77 },
        { id: 10008, name: 'Бочка с нефтью', amount: 38 },
        { id: 10003, name: '????? ????? ?????', amount: 4 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 13 },
        { id: 10036, name: 'Изумрудная руда', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 52 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/633.webp',
    upgradesTo: 6301,
    upgradeCost: 878800,
  },
  {
    id: 6301,
    name: 'Петардный завод 13',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 878800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 13 },
        { id: 10006, name: 'Каменные блоки', amount: 132 },
        { id: 10023, name: 'Сталь', amount: 3 },
        { id: 10004, name: 'Куски супер тыквы', amount: 12 }
      ],
      population: 67,
    },
    stats: {
      constructionTimeSeconds: 303163, // 3d 11h 32m 43s
      accelerationCost: 116,
      durability: 13672,
      gloryOnExplosion: 43940,
      takesPopulation: 39,
      workTimeSeconds: 18282, // 5h 4m 42s
      workYieldGold: 390,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 134 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 5.63, amount: 1 },
        { id: 10010, name: 'Садовая бомба', chance: 28.17, amount: 1 },
        { id: 10011, name: 'Садовая супер бомба', chance: 10.56, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 88 },
        { id: 10009, name: 'Канистра с бензином', amount: 44 },
        { id: 10003, name: '????? ????? ?????', amount: 5 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 16 },
        { id: 10019, name: 'Супер детонатор', amount: 8 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 64 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/633.webp',
    upgradesTo: 6311,
    upgradeCost: 1097600,
  },
  {
    id: 6311,
    name: 'Петардный завод 14',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1097600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 16 },
        { id: 10009, name: 'Канистра с бензином', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 4 },
        { id: 10040, name: 'Стальной лист', amount: 1 }
      ],
      population: 74,
    },
    stats: {
      constructionTimeSeconds: 408022, // 4d 16h 33m 44s
      accelerationCost: 134,
      durability: 15552,
      gloryOnExplosion: 54880,
      takesPopulation: 44,
      workTimeSeconds: 102598, // 1d 4h 49m 58s
      workYieldGold: 420,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 148 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 6.53, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 6.53, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 3.27, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 103 },
        { id: 10009, name: 'Канистра с бензином', amount: 51 },
        { id: 10003, name: '????? ????? ?????', amount: 5 }
      ]
    },
    drops: {
      frequent: [
        { id: 10009, name: 'Золото', amount: 10 },
        { id: 10023, name: 'Сталь', amount: 23 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10025, name: 'Суператомная бомба', amount: 6 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/633.webp',
    upgradesTo: 6321,
    upgradeCost: 1350000,
  },
  {
    id: 6321,
    name: 'Петардный завод 15',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1350000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 20 },
        { id: 10009, name: 'Канистра с бензином', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 4 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      population: 82,
    },
    stats: {
      constructionTimeSeconds: 551368, // 6d 9h 9m 28s
      accelerationCost: 157,
      durability: 17688,
      gloryOnExplosion: 67500,
      takesPopulation: 51,
      workTimeSeconds: 123712, // 1d 9h 28m 32s
      workYieldGold: 450,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 162 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 7.5, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 7.5, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 3.75, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 117 },
        { id: 10009, name: 'Канистра с бензином', amount: 58 },
        { id: 10003, name: '????? ????? ?????', amount: 5 }
      ]
    },
    drops: {
      frequent: [
        { id: 10009, name: 'Золото', amount: 13 },
        { id: 10019, name: 'Супер детонатор', amount: 7 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 425 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/633.webp',
    upgradesTo: 6331,
    upgradeCost: 1638400,
  },
  {
    id: 6331,
    name: 'Петардный завод 16',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1638400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 2 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 5 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      population: 90,
    },
    stats: {
      constructionTimeSeconds: 730980, // 8d 10h 30m
      accelerationCost: 180,
      durability: 19752,
      gloryOnExplosion: 81920,
      takesPopulation: 57,
      workTimeSeconds: 135040, // 1d 13h 30m 40s
      workYieldGold: 480,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 178 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 8.53, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 8.53, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 4.27, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 133 },
        { id: 10009, name: 'Канистра с бензином', amount: 66 },
        { id: 10003, name: '????? ????? ?????', amount: 6 }
      ]
    },
    drops: {
      frequent: [
        { id: 10019, name: 'Супер детонатор', amount: 9 },
        { id: 10040, name: 'Стальной лист', amount: 15 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 142 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/633.webp',
    upgradesTo: 6341,
    upgradeCost: 1965200,
  },
  {
    id: 6341,
    name: 'Петардный завод 17',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1965200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 3 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 6 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      population: 99,
    },
    stats: {
      constructionTimeSeconds: 967899, // 11d 5h 31m 39s
      accelerationCost: 208,
      durability: 22136,
      gloryOnExplosion: 98260,
      takesPopulation: 64,
      workTimeSeconds: 154124, // 1d 18h 48m 44s
      workYieldGold: 510,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 194 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 9.63, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 9.63, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 4.82, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 149 },
        { id: 10009, name: 'Канистра с бензином', amount: 74 },
        { id: 10003, name: '????? ????? ?????', amount: 6 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 45 },
        { id: 10040, name: 'Стальной лист', amount: 18 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 84 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/636.webp',
    upgradesTo: 6351,
    upgradeCost: 2332800,
  },
  {
    id: 6351,
    name: 'Петардный завод 18',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2332800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 3 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 8 },
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ],
      population: 108,
    },
    stats: {
      constructionTimeSeconds: 1263312, // 14d 13h 55m 12s
      accelerationCost: 237,
      durability: 24648,
      gloryOnExplosion: 116640,
      takesPopulation: 72,
      workTimeSeconds: 175598, // 2d 26m 38s
      workYieldGold: 540,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 212 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 10.8, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 10.8, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 5.4, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 167 },
        { id: 10009, name: 'Канистра с бензином', amount: 83 },
        { id: 10003, name: '????? ????? ?????', amount: 6 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 55 },
        { id: 10036, name: 'Изумрудная руда', amount: 15 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10025, name: 'Суператомная бомба', amount: 14 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/636.webp',
    upgradesTo: 6361,
    upgradeCost: 2743600,
  },
  {
    id: 6361,
    name: 'Петардный завод 19',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2743600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 4 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 9 },
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ],
      population: 117,
    },
    stats: {
      constructionTimeSeconds: 1600413, // 18d 12h 53m 33s
      accelerationCost: 267,
      durability: 27296,
      gloryOnExplosion: 137180,
      takesPopulation: 79,
      workTimeSeconds: 198315, // 2d 7h 5m 15s
      workYieldGold: 570,
      givesCoins: 13538,
      produces: [
        { id: 10013, name: 'Петарда', amount: 230 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 12.03, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 12.03, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 6.02, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 185 },
        { id: 10009, name: 'Канистра с бензином', amount: 92 },
        { id: 10003, name: '????? ????? ?????', amount: 7 }
      ]
    },
    drops: {
      frequent: [
        { id: 10009, name: 'Золото', amount: 28 },
        { id: 10019, name: 'Супер детонатор', amount: 15 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 232 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/636.webp',
    upgradesTo: 6371,
    upgradeCost: 3200000,
  },
  {
    id: 6371,
    name: 'Петардный завод 20',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3200000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 4 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 10 },
        { id: 10040, name: 'Стальной лист', amount: 4 }
      ],
      population: 126,
    },
    stats: {
      constructionTimeSeconds: 2000376, // 23d 3h 39m 36s
      accelerationCost: 298,
      durability: 29856,
      gloryOnExplosion: 160000,
      takesPopulation: 88,
      workTimeSeconds: 213754, // 2d 11h 22m 34s
      workYieldGold: 600,
      givesCoins: 20997,
      produces: [
        { id: 10013, name: 'Петарда', amount: 250 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 13.33, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 13.33, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 6.67, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 205 },
        { id: 10009, name: 'Канистра с бензином', amount: 102 },
        { id: 10003, name: '????? ????? ?????', amount: 7 }
      ]
    },
    drops: {
      frequent: [
        { id: 10009, name: 'Золото', amount: 36 },
        { id: 10019, name: 'Супер детонатор', amount: 19 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 323 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/636.webp',
    upgradesTo: 6381,
    upgradeCost: 3704400,
  },
  {
    id: 6381,
    name: 'Петардный завод 21',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3704400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 5 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 12 },
        { id: 10040, name: 'Стальной лист', amount: 5 }
      ],
      population: 136,
    },
    stats: {
      constructionTimeSeconds: 2515666, // 29d 2h 44m 16s
      accelerationCost: 334,
      durability: 32720,
      gloryOnExplosion: 185220,
      takesPopulation: 96,
      workTimeSeconds: 238590, // 2d 18h 16m 30s
      workYieldGold: 630,
      givesCoins: 20997,
      produces: [
        { id: 10013, name: 'Петарда', amount: 270 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 14.7, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 14.7, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 7.35, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 225 },
        { id: 10009, name: 'Канистра с бензином', amount: 112 },
        { id: 10003, name: '????? ????? ?????', amount: 7 }
      ]
    },
    drops: {
      frequent: [
        { id: 10019, name: 'Супер детонатор', amount: 23 },
        { id: 10040, name: 'Стальной лист', amount: 39 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 184 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/636.webp',
    upgradesTo: 6391,
    upgradeCost: 4259200,
  },
  {
    id: 6391,
    name: 'Петардный завод 22',
    englishName: 'Firecracker Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4259200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 6 },
        { id: 10034, name: 'Изумруд', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 14 },
        { id: 10040, name: 'Стальной лист', amount: 5 }
      ],
      population: 146,
    },
    stats: {
      constructionTimeSeconds: 3137336, // 1mo 6d 28m 56s
      accelerationCost: 372,
      durability: 35560,
      gloryOnExplosion: 212960,
      takesPopulation: 105,
      workTimeSeconds: 246866, // 2d 19h 14m 26s
      workYieldGold: 660,
      givesCoins: 20997,
      produces: [
        { id: 10013, name: 'Петарда', amount: 292 }
      ],
      sometimesProduces: [
        { id: 10019, name: 'Супер детонатор', chance: 12.1, amount: 1 },
        { id: 10016, name: 'Атомная бомба', chance: 16.13, amount: 1 },
        { id: 10025, name: 'Суператомная бомба', chance: 6.05, amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 247 },
        { id: 10009, name: 'Канистра с бензином', amount: 123 },
        { id: 10003, name: '????? ????? ?????', amount: 8 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 115 },
        { id: 10040, name: 'Стальной лист', amount: 46 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10025, name: 'Суператомная бомба', amount: 29 }
      ]
    },
    description: 'Производит петарды. Иногда можно получить детонатор или бомбы.',
    imageUrl: '/buildings/Заводы/Петардный завод - Petard factory/639.webp',
  },
  {
    id: 430,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 15,
    buildable: true,
    constructionRequirements: {
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 40,
      gloryOnExplosion: 1,
      takesPopulation: 1,
      workTimeSeconds: 296, // 4m 56s
      workYieldGold: 55,
    },
    drops: {
      rare: [
        { id: 10008, name: 'Бочка с нефтью', amount: 2 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/430.webp',
    upgradesTo: 431,
    upgradeCost: 2500,
  },
  {
    id: 431,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2500,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 7 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 411, // 6m 51s
      accelerationCost: 4,
      durability: 528,
      gloryOnExplosion: 125,
      takesPopulation: 3,
      workTimeSeconds: 379, // 6m 19s
      workYieldGold: 90,
    },
    drops: {
      frequent: [
        { id: 10006, name: 'Каменные блоки', amount: 2 },
        { id: 10018, name: 'Садовая бомба', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 504 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 3 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/431.webp',
    upgradesTo: 432,
    upgradeCost: 78750,
  },
  {
    id: 432,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 78750,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 207 },
        { id: 10005, name: 'Камни', amount: 22 }
      ],
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 2073, // 34m 33s
      accelerationCost: 10,
      durability: 3072,
      gloryOnExplosion: 3938,
      takesPopulation: 7,
      workTimeSeconds: 544, // 9m 4s
      workYieldGold: 185,
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 6 },
        { id: 10010, name: 'Супер лилия', amount: 14 },
        { id: 10000, name: 'Монеты', amount: 3260 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 6 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/432.webp',
    upgradesTo: 433,
    upgradeCost: 160000,
  },
  {
    id: 433,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 160000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 421 },
        { id: 10005, name: 'Камни', amount: 44 }
      ],
      population: 17,
    },
    stats: {
      constructionTimeSeconds: 5895, // 1h 38m 15s
      accelerationCost: 16,
      durability: 4544,
      gloryOnExplosion: 8000,
      takesPopulation: 9,
      workTimeSeconds: 1025, // 17m 5s
      workYieldGold: 370,
    },
    drops: {
      frequent: [
        { id: 10028, name: 'Супер пшеница', amount: 2 },
        { id: 10029, name: 'Супер репка', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 6401 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 28 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/433.webp',
    upgradesTo: 434,
    upgradeCost: 281250,
  },
  {
    id: 434,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 281250,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 281 },
        { id: 10005, name: 'Камни', amount: 78 },
        { id: 10023, name: 'Сталь', amount: 1 }
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 14600, // 4h 3m 20s
      accelerationCost: 25,
      durability: 6232,
      gloryOnExplosion: 14063,
      takesPopulation: 10,
      workTimeSeconds: 1732, // 28m 52s
      workYieldGold: 675,
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 20 },
        { id: 10016, name: 'Яйцо Горыныча', amount: 5 },
        { id: 10000, name: 'Монеты', amount: 7853 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 15 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/434.webp',
    upgradesTo: 435,
    upgradeCost: 450000,
  },
  {
    id: 435,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 450000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 450 },
        { id: 10005, name: 'Камни', amount: 125 },
        { id: 10023, name: 'Сталь', amount: 1 }
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 32400, // 9h
      accelerationCost: 38,
      durability: 8144,
      gloryOnExplosion: 22500,
      takesPopulation: 14,
      workTimeSeconds: 2689, // 44m 49s
      workYieldGold: 1130,
    },
    drops: {
      frequent: [
        { id: 10009, name: 'Золото', amount: 3 },
        { id: 10019, name: 'Супер детонатор', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10025, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/435.webp',
    upgradesTo: 436,
    upgradeCost: 673750,
  },
  {
    id: 436,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 673750,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 7 },
        { id: 10006, name: 'Каменные блоки', amount: 67 },
        { id: 10023, name: 'Сталь', amount: 1 }
      ],
      population: 37,
    },
    stats: {
      constructionTimeSeconds: 60783, // 16h 53m 3s
      accelerationCost: 52,
      durability: 10272,
      gloryOnExplosion: 33688,
      takesPopulation: 18,
      workTimeSeconds: 3921, // 1h 5m 21s
      workYieldGold: 1765,
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 10 },
        { id: 10040, name: 'Стальной лист', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 144 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/436.webp',
    upgradesTo: 437,
    upgradeCost: 960000,
  },
  {
    id: 437,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 960000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 10 },
        { id: 10006, name: 'Каменные блоки', amount: 96 },
        { id: 10023, name: 'Сталь', amount: 2 }
      ],
      population: 45,
    },
    stats: {
      constructionTimeSeconds: 103680, // 28h 48m
      accelerationCost: 68,
      durability: 12512,
      gloryOnExplosion: 48000,
      takesPopulation: 22,
      workTimeSeconds: 5400, // 1h 30m
      workYieldGold: 2600,
    },
    drops: {
      frequent: [
        { id: 10025, name: 'Суператомная бомба', amount: 3 },
        { id: 10020, name: 'Супер лилия', amount: 5 },
        { id: 10000, name: 'Монеты', amount: 16800 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 8 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/437.webp',
    upgradesTo: 438,
    upgradeCost: 1312500,
  },
  {
    id: 438,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1312500,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 14 },
        { id: 10006, name: 'Каменные блоки', amount: 131 },
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ],
      population: 54,
    },
    stats: {
      constructionTimeSeconds: 165600, // 46h
      accelerationCost: 86,
      durability: 14960,
      gloryOnExplosion: 65625,
      takesPopulation: 26,
      workTimeSeconds: 7200, // 2h
      workYieldGold: 3650,
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 15 },
        { id: 10019, name: 'Супер детонатор', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 20500 }
      ],
      rare: [
        { id: 10009, name: 'Золото', amount: 12 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/438.webp',
    upgradesTo: 439,
    upgradeCost: 1728000,
  },
  {
    id: 439,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1728000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 18 },
        { id: 10006, name: 'Каменные блоки', amount: 173 },
        { id: 10040, name: 'Стальной лист', amount: 4 }
      ],
      population: 64,
    },
    stats: {
      constructionTimeSeconds: 252000, // 70h
      accelerationCost: 106,
      durability: 17616,
      gloryOnExplosion: 86400,
      takesPopulation: 30,
      workTimeSeconds: 9300, // 2h 35m
      workYieldGold: 4950,
    },
    drops: {
      frequent: [
        { id: 10036, name: 'Изумрудная руда', amount: 25 },
        { id: 10010, name: 'Супер лилия', amount: 8 },
        { id: 10000, name: 'Монеты', amount: 24800 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 200 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/439.webp',
    upgradesTo: 440,
    upgradeCost: 2212500,
  },
  {
    id: 440,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2212500,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 23 },
        { id: 10006, name: 'Каменные блоки', amount: 221 },
        { id: 10044, name: 'Самородок', amount: 5 }
      ],
      population: 75,
    },
    stats: {
      constructionTimeSeconds: 367200, // 102h
      accelerationCost: 128,
      durability: 20480,
      gloryOnExplosion: 110625,
      takesPopulation: 35,
      workTimeSeconds: 11700, // 3h 15m
      workYieldGold: 6500,
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 5 },
        { id: 10025, name: 'Суператомная бомба', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 29600 }
      ],
      rare: [
        { id: 10009, name: 'Золото', amount: 20 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/440.webp',
    upgradesTo: 441,
    upgradeCost: 2764800,
  },
  {
    id: 441,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2764800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 28 },
        { id: 10006, name: 'Каменные блоки', amount: 276 },
        { id: 10044, name: 'Самородок', amount: 7 }
      ],
      population: 87,
    },
    stats: {
      constructionTimeSeconds: 518400, // 144h
      accelerationCost: 152,
      durability: 23552,
      gloryOnExplosion: 138240,
      takesPopulation: 40,
      workTimeSeconds: 14400, // 4h
      workYieldGold: 8300,
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 25 },
        { id: 10019, name: 'Супер детонатор', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 35000 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 15 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/441.webp',
    upgradesTo: 442,
    upgradeCost: 3386880,
  },
  {
    id: 442,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3386880,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 34 },
        { id: 10006, name: 'Каменные блоки', amount: 339 },
        { id: 10044, name: 'Самородок', amount: 9 }
      ],
      population: 100,
    },
    stats: {
      constructionTimeSeconds: 705600, // 196h
      accelerationCost: 178,
      durability: 26832,
      gloryOnExplosion: 169344,
      takesPopulation: 46,
      workTimeSeconds: 17400, // 4h 50m
      workYieldGold: 10400,
    },
    drops: {
      frequent: [
        { id: 10036, name: 'Изумрудная руда', amount: 40 },
        { id: 10010, name: 'Супер лилия', amount: 10 },
        { id: 10000, name: 'Монеты', amount: 41000 }
      ],
      rare: [
        { id: 10009, name: 'Золото', amount: 30 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/442.webp',
    upgradesTo: 443,
    upgradeCost: 4082400,
  },
  {
    id: 443,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4082400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 41 },
        { id: 10006, name: 'Каменные блоки', amount: 408 },
        { id: 10034, name: 'Изумруд', amount: 3 }
      ],
      population: 114,
    },
    stats: {
      constructionTimeSeconds: 933120, // 259h 12m
      accelerationCost: 206,
      durability: 30320,
      gloryOnExplosion: 204120,
      takesPopulation: 52,
      workTimeSeconds: 20700, // 5h 45m
      workYieldGold: 12800,
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 35 },
        { id: 10025, name: 'Суператомная бомба', amount: 5 },
        { id: 10000, name: 'Монеты', amount: 47800 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 300 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/443.webp',
    upgradesTo: 444,
    upgradeCost: 4851000,
  },
  {
    id: 444,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4851000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 49 },
        { id: 10006, name: 'Каменные блоки', amount: 485 },
        { id: 10034, name: 'Изумруд', amount: 5 }
      ],
      population: 129,
    },
    stats: {
      constructionTimeSeconds: 1200960, // 333h 36m
      accelerationCost: 236,
      durability: 34016,
      gloryOnExplosion: 242550,
      takesPopulation: 58,
      workTimeSeconds: 24300, // 6h 45m
      workYieldGold: 15550,
    },
    drops: {
      frequent: [
        { id: 10009, name: 'Золото', amount: 50 },
        { id: 10019, name: 'Супер детонатор', amount: 8 },
        { id: 10000, name: 'Монеты', amount: 55400 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 25 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/444.webp',
    upgradesTo: 445,
    upgradeCost: 5703750,
  },
  {
    id: 445,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5703750,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 57 },
        { id: 10006, name: 'Каменные блоки', amount: 570 },
        { id: 10034, name: 'Изумруд', amount: 7 }
      ],
      population: 145,
    },
    stats: {
      constructionTimeSeconds: 1512000, // 420h
      accelerationCost: 268,
      durability: 37920,
      gloryOnExplosion: 285188,
      takesPopulation: 65,
      workTimeSeconds: 28200, // 7h 50m
      workYieldGold: 18650,
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 50 },
        { id: 10010, name: 'Супер лилия', amount: 12 },
        { id: 10000, name: 'Монеты', amount: 64000 }
      ],
      rare: [
        { id: 10009, name: 'Золото', amount: 40 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/445.webp',
    upgradesTo: 469,
    upgradeCost: 6654375,
  },
  {
    id: 469,
    name: 'Монетный заводик',
    englishName: 'Coin Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 6654375,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 67 },
        { id: 10006, name: 'Каменные блоки', amount: 665 },
        { id: 10034, name: 'Изумруд', amount: 10 }
      ],
      population: 162,
    },
    stats: {
      constructionTimeSeconds: 1866240, // 518h 24m
      accelerationCost: 302,
      durability: 42032,
      gloryOnExplosion: 332719,
      takesPopulation: 72,
      workTimeSeconds: 32400, // 9h
      workYieldGold: 22150,
    },
    drops: {
      frequent: [
        { id: 10036, name: 'Изумрудная руда', amount: 60 },
        { id: 10025, name: 'Суператомная бомба', amount: 7 },
        { id: 10000, name: 'Монеты', amount: 73500 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 400 }
      ]
    },
    description: 'Производит монеты.',
    imageUrl: '/buildings/factories/Монетный заводик - Coin factory/469.webp',
  },
  {
    id: 640,
    name: 'Изумрудный завод',
    englishName: 'Emerald Factory',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5100000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 10200 },
        { id: 10006, name: 'Каменные блоки', amount: 1020 }
      ],
      population: 89,
    },
    stats: {
      constructionTimeSeconds: 218690,
      accelerationCost: 99,
      durability: 20056,
      gloryOnExplosion: 255000,
      takesPopulation: 18,
      workTimeSeconds: 12649,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10034, name: 'Изумруд', amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 15 },
        { id: 10021, name: 'Куски супер репки', amount: 1 },
        { id: 10036, name: 'Изумрудная руда', amount: 3 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 37 },
        { id: 10040, name: 'Стальной лист', amount: 15 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 546 }
      ]
    },
    description: 'Перерабатывает изумрудную руду в ограненные изумруды.',
    imageUrl: '/buildings/factories/Изумрудный завод - Emerald factory/640.webp',
    upgradesTo: 641,
    upgradeCost: 5400000
  },
  {
    id: 668,
    name: 'Шахта',
    englishName: 'Mine',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 20000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 105 },
        { id: 10013, name: 'Петарда', amount: 13 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 1544,
      gloryOnExplosion: 1000,
      takesPopulation: 3,
      workTimeSeconds: 809, // 13m 29s
      workYieldGold: 50,
      givesCoins: 2035,
      produces: [
        { id: 10005, name: 'Камни', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 2 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 }
      ],
      rare: [
        { id: 10023, name: 'Сталь', amount: 4 }
      ]
    },
    description: 'Добывает камни из недр земли.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/668.webp',
    upgradesTo: 669,
    upgradeCost: 80000
  },
  {
    id: 669,
    name: 'Шахта 2 уровня',
    englishName: 'Mine Level 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 211 },
        { id: 10005, name: 'Камни', amount: 22 },
        { id: 10013, name: 'Петарда', amount: 27 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 137, // 2m 17s
      accelerationCost: 2,
      durability: 3040,
      gloryOnExplosion: 4000,
      takesPopulation: 4,
      workTimeSeconds: 809, // 13m 29s
      workYieldGold: 50,
      givesCoins: 3260,
      produces: [
        { id: 10005, name: 'Камни', amount: 2 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 0.56, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 6 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 13 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 2.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/668.webp',
    upgradesTo: 670,
    upgradeCost: 180000
  },
  {
    id: 670,
    name: 'Шахта 3 уровня',
    englishName: 'Mine Level 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 474 },
        { id: 10005, name: 'Камни', amount: 50 },
        { id: 10013, name: 'Петарда', amount: 60 }
      ],
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 691, // 11m 31s
      accelerationCost: 6,
      durability: 4712,
      gloryOnExplosion: 9000,
      takesPopulation: 5,
      workTimeSeconds: 971, // 16m 11s
      workYieldGold: 50,
      givesCoins: 6401,
      produces: [
        { id: 10005, name: 'Камни', amount: 3 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 1.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 12 },
        { id: 10018, name: 'Яйцо Горыныча', amount: 3 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 9 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 3.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/668.webp',
    upgradesTo: 671,
    upgradeCost: 320000
  },
  {
    id: 671,
    name: 'Шахта 4 уровня',
    englishName: 'Mine Level 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 320000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 89 },
        { id: 10006, name: 'Каменные блоки', amount: 32 },
        { id: 10010, name: 'Садовая бомба', amount: 40 }
      ],
      population: 17,
    },
    stats: {
      constructionTimeSeconds: 1965, // 32m 45s
      accelerationCost: 9,
      durability: 6496,
      gloryOnExplosion: 16000,
      takesPopulation: 5,
      workTimeSeconds: 1479, // 24m 39s
      workYieldGold: 50,
      givesCoins: 9707,
      produces: [
        { id: 10005, name: 'Камни', amount: 4 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 2.22, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 4 },
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 8 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 4.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/668.webp',
    upgradesTo: 672,
    upgradeCost: 500000
  },
  {
    id: 672,
    name: 'Шахта 5 уровня',
    englishName: 'Mine Level 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 139 },
        { id: 10006, name: 'Каменные блоки', amount: 50 },
        { id: 10010, name: 'Садовая бомба', amount: 63 }
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 4866, // 1h 21m 6s
      accelerationCost: 15,
      durability: 8416,
      gloryOnExplosion: 25000,
      takesPopulation: 7,
      workTimeSeconds: 2412, // 40m 12s
      workYieldGold: 50,
      givesCoins: 10631,
      produces: [
        { id: 10005, name: 'Камни', amount: 7 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 3.47, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 36 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 2 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 97 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 5.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/668.webp',
    upgradesTo: 673,
    upgradeCost: 720000
  },
  {
    id: 673,
    name: 'Шахта 6 уровня',
    englishName: 'Mine Level 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 720000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 200 },
        { id: 10006, name: 'Каменные блоки', amount: 72 },
        { id: 10010, name: 'Садовая бомба', amount: 90 }
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 10800, // 3h
      accelerationCost: 22,
      durability: 10448,
      gloryOnExplosion: 36000,
      takesPopulation: 10,
      workTimeSeconds: 3604, // 1h 4s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10005, name: 'Камни', amount: 11 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 11 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 40 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 6.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/673.webp',
    upgradesTo: 674,
    upgradeCost: 980000
  },
  {
    id: 674,
    name: 'Шахта 7 уровня',
    englishName: 'Mine Level 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 980000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 10 },
        { id: 10005, name: 'Камни', amount: 272 },
        { id: 10006, name: 'Каменные блоки', amount: 98 },
        { id: 10010, name: 'Садовая бомба', amount: 123 }
      ],
      population: 37,
    },
    stats: {
      constructionTimeSeconds: 20261, // 5h 37m 41s
      accelerationCost: 30,
      durability: 12568,
      gloryOnExplosion: 49000,
      takesPopulation: 12,
      workTimeSeconds: 5052, // 1h 24m 12s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10005, name: 'Камни', amount: 16 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 6.81, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10042, name: '??????', amount: 4 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 28 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 7.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/673.webp',
    upgradesTo: 675,
    upgradeCost: 1280000
  },
  {
    id: 675,
    name: 'Шахта 8 уровня',
    englishName: 'Mine Level 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1280000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 13 },
        { id: 10005, name: 'Камни', amount: 356 },
        { id: 10006, name: 'Каменные блоки', amount: 128 },
        { id: 10010, name: 'Садовая бомба', amount: 160 }
      ],
      population: 45,
    },
    stats: {
      constructionTimeSeconds: 36450, // 10h 7m 30s
      accelerationCost: 40,
      durability: 14808,
      gloryOnExplosion: 64000,
      takesPopulation: 16,
      workTimeSeconds: 6904, // 1h 55m 4s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10005, name: 'Камни', amount: 23 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 8.89, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 5 },
        { id: 10040, name: 'Стальной лист', amount: 8 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 5 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 8.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/673.webp',
    upgradesTo: 676,
    upgradeCost: 1620000
  },
  {
    id: 676,
    name: 'Шахта 9 уровня',
    englishName: 'Mine Level 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1620000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 24 },
        { id: 10006, name: 'Каменные блоки', amount: 243 },
        { id: 10011, name: 'Садовая супер бомба', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      population: 54,
    },
    stats: {
      constructionTimeSeconds: 62985, // 17h 29m 45s
      accelerationCost: 53,
      durability: 17136,
      gloryOnExplosion: 81000,
      takesPopulation: 20,
      workTimeSeconds: 9146, // 2h 32m 26s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10005, name: 'Камни', amount: 32 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 11.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 27 },
        { id: 10040, name: 'Стальной лист', amount: 11 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 399 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 9.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/673.webp',
    upgradesTo: 677,
    upgradeCost: 2000000
  },
  {
    id: 677,
    name: 'Шахта 10 уровня',
    englishName: 'Mine Level 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 30 },
        { id: 10006, name: 'Каменные блоки', amount: 300 },
        { id: 10011, name: 'Садовая супер бомба', amount: 12 },
        { id: 10023, name: 'Сталь', amount: 7 }
      ],
      population: 63,
    },
    stats: {
      constructionTimeSeconds: 100018, // 1d 3h 46m 58s
      accelerationCost: 67,
      durability: 19568,
      gloryOnExplosion: 100000,
      takesPopulation: 22,
      workTimeSeconds: 11768, // 3h 16m 8s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10005, name: 'Камни', amount: 43 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 13.89, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 35 },
        { id: 10036, name: 'Изумрудная руда', amount: 10 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 139 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 10.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/673.webp',
    upgradesTo: 678,
    upgradeCost: 2420000
  },
  {
    id: 678,
    name: 'Шахта 11 уровня',
    englishName: 'Mine Level 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2420000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 36 },
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10011, name: 'Садовая супер бомба', amount: 14 },
        { id: 10023, name: 'Сталь', amount: 8 }
      ],
      population: 73,
    },
    stats: {
      constructionTimeSeconds: 158006, // 1d 19h 13m 26s
      accelerationCost: 83,
      durability: 22096,
      gloryOnExplosion: 121000,
      takesPopulation: 27,
      workTimeSeconds: 14892, // 4h 8m 12s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10005, name: 'Камни', amount: 57 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 16.81, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 249 },
        { id: 10023, name: 'Сталь', amount: 47 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 84 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 11.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/678.webp',
    upgradesTo: 679,
    upgradeCost: 2880000
  },
  {
    id: 679,
    name: 'Шахта 12 уровня',
    englishName: 'Mine Level 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2880000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 43 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 9 }
      ],
      population: 84,
    },
    stats: {
      constructionTimeSeconds: 236681, // 2d 17h 51m 21s
      accelerationCost: 103,
      durability: 24720,
      gloryOnExplosion: 144000,
      takesPopulation: 30,
      workTimeSeconds: 18500, // 5h 8m 20s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10005, name: 'Камни', amount: 74 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 20, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 25 },
        { id: 10023, name: 'Сталь', amount: 58 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 14 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 12.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/678.webp',
    upgradesTo: 680,
    upgradeCost: 3380000
  },
  {
    id: 680,
    name: 'Шахта 13 уровня',
    englishName: 'Mine Level 13',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3380000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 51 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 11 }
      ],
      population: 95,
    },
    stats: {
      constructionTimeSeconds: 342950, // 3d 23h 15m 50s
      accelerationCost: 123,
      durability: 27424,
      gloryOnExplosion: 169000,
      takesPopulation: 35,
      workTimeSeconds: 22459, // 6h 14m 19s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 93 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 23.47, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 16 },
        { id: 10040, name: 'Стальной лист', amount: 28 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 1020 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 13.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/678.webp',
    upgradesTo: 681,
    upgradeCost: 3920000
  },
  {
    id: 681,
    name: 'Шахта 14 уровня',
    englishName: 'Mine Level 14',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3920000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10034, name: 'Изумруд', amount: 2 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 8 },
        { id: 10023, name: 'Сталь', amount: 13 }
      ],
      population: 107,
    },
    stats: {
      constructionTimeSeconds: 492417, // 5d 16h 6m 57s
      accelerationCost: 148,
      durability: 30216,
      gloryOnExplosion: 196000,
      takesPopulation: 38,
      workTimeSeconds: 27005, // 7h 30m 5s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 116 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 27.22, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 83 },
        { id: 10040, name: 'Стальной лист', amount: 34 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 331 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 14.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/678.webp',
    upgradesTo: 682,
    upgradeCost: 4500000
  },
  {
    id: 682,
    name: 'Шахта 15 уровня',
    englishName: 'Mine Level 15',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 6 },
        { id: 10034, name: 'Изумруд', amount: 2 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 15 }
      ],
      population: 120,
    },
    stats: {
      constructionTimeSeconds: 691200, // 8d
      accelerationCost: 175,
      durability: 33104,
      gloryOnExplosion: 225000,
      takesPopulation: 45,
      workTimeSeconds: 32006, // 8h 53m 26s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 142 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 31.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 100 },
        { id: 10036, name: 'Изумрудная руда', amount: 27 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 188 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 15.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/678.webp',
    upgradesTo: 683,
    upgradeCost: 5120000
  },
  {
    id: 683,
    name: 'Шахта 16 уровня',
    englishName: 'Mine Level 16',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5120000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10034, name: 'Изумруд', amount: 2 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 10 },
        { id: 10023, name: 'Сталь', amount: 17 }
      ],
      population: 133,
    },
    stats: {
      constructionTimeSeconds: 942854, // 10d 21h 24m 14s
      accelerationCost: 205,
      durability: 36072,
      gloryOnExplosion: 256000,
      takesPopulation: 48,
      workTimeSeconds: 37567, // 10h 26m 7s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 172 }
      ],
      sometimesProduces: [
        { id: 10022, name: 'Руда', chance: 35.56, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 15 },
        { id: 10036, name: 'Изумрудная руда', amount: 32 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 30 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 16.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/683.webp',
    upgradesTo: 684,
    upgradeCost: 5780000
  },
  {
    id: 684,
    name: 'Шахта 17 уровня',
    englishName: 'Mine Level 17',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5780000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 8 },
        { id: 10034, name: 'Изумруд', amount: 2 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 11 },
        { id: 10023, name: 'Сталь', amount: 19 }
      ],
      population: 147,
    },
    stats: {
      constructionTimeSeconds: 1273009, // 14d 16h 56m 49s
      accelerationCost: 238,
      durability: 39120,
      gloryOnExplosion: 289000,
      takesPopulation: 55,
      workTimeSeconds: 43676, // 12h 7m 56s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 206 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 18.06, amount: 1 },
        { id: 10022, name: 'Руда', chance: 40.14, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 61 },
        { id: 10023, name: 'Сталь', amount: 145 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 2076 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 17.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/683.webp',
    upgradesTo: 685,
    upgradeCost: 6480000
  },
  {
    id: 685,
    name: 'Шахта 18 уровня',
    englishName: 'Mine Level 18',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 6480000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 9 },
        { id: 10034, name: 'Изумруд', amount: 3 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 13 },
        { id: 10023, name: 'Сталь', amount: 21 }
      ],
      population: 162,
    },
    stats: {
      constructionTimeSeconds: 1705411, // 19d 16h 23m 31s
      accelerationCost: 275,
      durability: 42264,
      gloryOnExplosion: 324000,
      takesPopulation: 58,
      workTimeSeconds: 50428, // 14h 28s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 245 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 20.25, amount: 1 },
        { id: 10022, name: 'Руда', chance: 45, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 71 },
        { id: 10042, name: '??????', amount: 38 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 646 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 18.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/683.webp',
    upgradesTo: 686,
    upgradeCost: 7220000
  },
  {
    id: 686,
    name: 'Шахта 19 уровня',
    englishName: 'Mine Level 19',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 7220000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 10 },
        { id: 10034, name: 'Изумруд', amount: 3 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 14 },
        { id: 10023, name: 'Сталь', amount: 24 }
      ],
      population: 177,
    },
    stats: {
      constructionTimeSeconds: 2215693, // 25d 16h 8m 13s
      accelerationCost: 314,
      durability: 45472,
      gloryOnExplosion: 361000,
      takesPopulation: 66,
      workTimeSeconds: 57607, // 16h 7s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 287 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 22.56, amount: 1 },
        { id: 10022, name: 'Руда', chance: 50.14, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 43 },
        { id: 10040, name: 'Стальной лист', amount: 75 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 355 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 19.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/683.webp',
    upgradesTo: 687,
    upgradeCost: 8000000
  },
  {
    id: 687,
    name: 'Шахта 20 уровня',
    englishName: 'Mine Level 20',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 8000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 11 },
        { id: 10034, name: 'Изумруд', amount: 3 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 16 },
        { id: 10023, name: 'Сталь', amount: 26 }
      ],
      population: 193,
    },
    stats: {
      constructionTimeSeconds: 2815622, // 1m 3d 6h 47m 2s (32d)
      accelerationCost: 357,
      durability: 48768,
      gloryOnExplosion: 400000,
      takesPopulation: 70,
      workTimeSeconds: 65509, // 18h 11m 49s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 335 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 25, amount: 1 },
        { id: 10022, name: 'Руда', chance: 55.56, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 216 },
        { id: 10040, name: 'Стальной лист', amount: 87 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 55 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 20.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/683.webp',
    upgradesTo: 688,
    upgradeCost: 8820000
  },
  {
    id: 688,
    name: 'Шахта 21 уровня',
    englishName: 'Mine Level 21',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 8820000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 12 },
        { id: 10034, name: 'Изумруд', amount: 3 },
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 17 },
        { id: 10023, name: 'Сталь', amount: 29 }
      ],
      population: 210,
    },
    stats: {
      constructionTimeSeconds: 3855600, // 1m 12d 21h (44d 21h)
      accelerationCost: 406,
      durability: 52144,
      gloryOnExplosion: 441000,
      takesPopulation: 73,
      workTimeSeconds: 73927, // 20h 32m 7s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10005, name: 'Камни', amount: 387 }
      ],
      sometimesProduces: [
        { id: 10044, name: 'Самородок', chance: 27.56, amount: 1 },
        { id: 10022, name: 'Руда', chance: 61.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 246 },
        { id: 10036, name: 'Изумрудная руда', amount: 66 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 3688 }
      ]
    },
    description: 'Добывает камни из недр земли. Уровень 21. Максимальный уровень.',
    imageUrl: '/buildings/Заводы/Шахта - The mine/688.webp'
  },
  {
    id: 689,
    name: 'Академия монстров',
    englishName: 'Monster Academy',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 30000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 60 }
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 5048, // 1h 24m 8s
      accelerationCost: 15,
      durability: 2464,
      gloryOnExplosion: 1500,
      takesPopulation: 7,
      workTimeSeconds: 2209, // 36m 49s
      workYieldGold: 50,
      givesCoins: 2735,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 2.68, amount: 1 },
        { id: 10042, name: '??????', chance: 1.19, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 3 },
        { id: 10004, name: 'Куски супер тыквы', amount: 3 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 9 }
      ]
    },
    description: 'Производит яйца монстров.',
    imageUrl: '/buildings/factories/Академия монстров - Monster Academy/689.webp',
    upgradesTo: 690,
    upgradeCost: 120000
  },
  {
    id: 690,
    name: 'Академия монстров 2 уровня',
    englishName: 'Monster Academy Level 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 120000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 240 },
        { id: 10006, name: 'Каменные блоки', amount: 24 }
      ],
      population: 5,
    },
    stats: {
      constructionTimeSeconds: 7560, // 2h 6m
      accelerationCost: 22,
      durability: 3696,
      gloryOnExplosion: 3000,
      takesPopulation: 9,
      workTimeSeconds: 1988, // 33m 8s
      workYieldGold: 50,
      givesCoins: 4103,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 3.02, amount: 1 },
        { id: 10042, name: '??????', chance: 1.34, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 4 },
        { id: 10004, name: 'Куски супер тыквы', amount: 4 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 12 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 2.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/689.webp',
    upgradesTo: 691,
    upgradeCost: 240000
  },
  {
    id: 691,
    name: 'Академия монстров 3 уровня',
    englishName: 'Monster Academy Level 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 240000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 480 },
        { id: 10006, name: 'Каменные блоки', amount: 48 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 11340, // 3h 9m
      accelerationCost: 30,
      durability: 5544,
      gloryOnExplosion: 6000,
      takesPopulation: 11,
      workTimeSeconds: 1789, // 29m 49s
      workYieldGold: 50,
      givesCoins: 6155,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 3.40, amount: 1 },
        { id: 10042, name: '??????', chance: 1.51, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 5 },
        { id: 10004, name: 'Куски супер тыквы', amount: 5 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 16 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 3.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/689.webp',
    upgradesTo: 692,
    upgradeCost: 480000
  },
  {
    id: 692,
    name: 'Академия монстров 4 уровня',
    englishName: 'Monster Academy Level 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 480000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 960 },
        { id: 10006, name: 'Каменные блоки', amount: 96 }
      ],
      population: 9,
    },
    stats: {
      constructionTimeSeconds: 17010, // 4h 43m 30s
      accelerationCost: 42,
      durability: 8316,
      gloryOnExplosion: 12000,
      takesPopulation: 13,
      workTimeSeconds: 1610, // 26m 50s
      workYieldGold: 50,
      givesCoins: 9233,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 3.83, amount: 1 },
        { id: 10042, name: '??????', chance: 1.70, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 6 },
        { id: 10004, name: 'Куски супер тыквы', amount: 6 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 21 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 4.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/689.webp',
    upgradesTo: 693,
    upgradeCost: 960000
  },
  {
    id: 693,
    name: 'Академия монстров 5 уровня',
    englishName: 'Monster Academy Level 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 960000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1920 },
        { id: 10006, name: 'Каменные блоки', amount: 192 }
      ],
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 25515, // 7h 5m 15s
      accelerationCost: 58,
      durability: 12474,
      gloryOnExplosion: 24000,
      takesPopulation: 15,
      workTimeSeconds: 1449, // 24m 9s
      workYieldGold: 50,
      givesCoins: 13850,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 4.31, amount: 1 },
        { id: 10042, name: '??????', chance: 1.91, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 8 },
        { id: 10004, name: 'Куски супер тыквы', amount: 8 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 28 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 5.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/689.webp',
    upgradesTo: 694,
    upgradeCost: 1920000
  },
  {
    id: 694,
    name: 'Академия монстров 6 уровня',
    englishName: 'Monster Academy Level 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1920000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 3840 },
        { id: 10006, name: 'Каменные блоки', amount: 384 },
        { id: 10026, name: 'Золото', amount: 50 }
      ],
      population: 15,
    },
    stats: {
      constructionTimeSeconds: 38273, // 10h 37m 53s
      accelerationCost: 80,
      durability: 18711,
      gloryOnExplosion: 48000,
      takesPopulation: 18,
      workTimeSeconds: 1304, // 21m 44s
      workYieldGold: 50,
      givesCoins: 20775,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 4.85, amount: 1 },
        { id: 10042, name: '??????', chance: 2.15, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 10 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 37 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 6.',
    imageUrl: '/buildings/factories/Академия монстров - Monster Academy/694.webp',
    upgradesTo: 695,
    upgradeCost: 3840000
  },
  {
    id: 695,
    name: 'Академия монстров 7 уровня',
    englishName: 'Monster Academy Level 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3840000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 7680 },
        { id: 10006, name: 'Каменные блоки', amount: 768 },
        { id: 10026, name: 'Золото', amount: 100 }
      ],
      population: 18,
    },
    stats: {
      constructionTimeSeconds: 57409, // 15h 56m 49s
      accelerationCost: 110,
      durability: 28067,
      gloryOnExplosion: 96000,
      takesPopulation: 21,
      workTimeSeconds: 1174, // 19m 34s
      workYieldGold: 50,
      givesCoins: 31163,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 5.46, amount: 1 },
        { id: 10042, name: '??????', chance: 2.42, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 13 },
        { id: 10004, name: 'Куски супер тыквы', amount: 13 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 49 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 7.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/694.webp',
    upgradesTo: 696,
    upgradeCost: 7680000
  },
  {
    id: 696,
    name: 'Академия монстров 8 уровня',
    englishName: 'Monster Academy Level 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 7680000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 15360 },
        { id: 10006, name: 'Каменные блоки', amount: 1536 },
        { id: 10026, name: 'Золото', amount: 200 }
      ],
      population: 22,
    },
    stats: {
      constructionTimeSeconds: 86114, // 23h 55m 14s
      accelerationCost: 150,
      durability: 42101,
      gloryOnExplosion: 192000,
      takesPopulation: 25,
      workTimeSeconds: 1057, // 17m 37s
      workYieldGold: 50,
      givesCoins: 46745,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 6.14, amount: 1 },
        { id: 10042, name: '??????', chance: 2.72, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 16 },
        { id: 10004, name: 'Куски супер тыквы', amount: 16 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 65 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 8.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/694.webp',
    upgradesTo: 697,
    upgradeCost: 15360000
  },
  {
    id: 697,
    name: 'Академия монстров 9 уровня',
    englishName: 'Monster Academy Level 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 15360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 30720 },
        { id: 10006, name: 'Каменные блоки', amount: 3072 },
        { id: 10026, name: 'Золото', amount: 400 }
      ],
      population: 26,
    },
    stats: {
      constructionTimeSeconds: 129171, // 1d 11h 52m 51s
      accelerationCost: 205,
      durability: 63152,
      gloryOnExplosion: 384000,
      takesPopulation: 29,
      workTimeSeconds: 951, // 15m 51s
      workYieldGold: 50,
      givesCoins: 70118,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 6.91, amount: 1 },
        { id: 10042, name: '??????', chance: 3.06, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 20 },
        { id: 10004, name: 'Куски супер тыквы', amount: 20 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 86 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 9.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/694.webp',
    upgradesTo: 698,
    upgradeCost: 30720000
  },
  {
    id: 698,
    name: 'Академия монстров 10 уровня',
    englishName: 'Monster Academy Level 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 30720000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 61440 },
        { id: 10006, name: 'Каменные блоки', amount: 6144 },
        { id: 10026, name: 'Золото', amount: 800 }
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 193757, // 2d 5h 49m 17s
      accelerationCost: 280,
      durability: 94728,
      gloryOnExplosion: 768000,
      takesPopulation: 33,
      workTimeSeconds: 856, // 14m 16s
      workYieldGold: 50,
      givesCoins: 105177,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 7.77, amount: 1 },
        { id: 10042, name: '??????', chance: 3.44, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 25 },
        { id: 10004, name: 'Куски супер тыквы', amount: 25 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 114 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 10.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/694.webp',
    upgradesTo: 69966,
    upgradeCost: 61440000
  },
  {
    id: 69966,
    name: 'Академия монстров 11 уровня',
    englishName: 'Monster Academy Level 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 61440000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 122880 },
        { id: 10006, name: 'Каменные блоки', amount: 12288 },
        { id: 10026, name: 'Золото', amount: 1600 },
        { id: 10034, name: 'Изумруд', amount: 50 }
      ],
      population: 35,
    },
    stats: {
      constructionTimeSeconds: 290636, // 3d 8h 43m 56s
      accelerationCost: 380,
      durability: 142092,
      gloryOnExplosion: 1536000,
      takesPopulation: 38,
      workTimeSeconds: 770, // 12m 50s
      workYieldGold: 50,
      givesCoins: 157766,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 8.74, amount: 1 },
        { id: 10042, name: '??????', chance: 3.87, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 31 },
        { id: 10004, name: 'Куски супер тыквы', amount: 31 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 151 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 11.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/699.webp',
    upgradesTo: 70066,
    upgradeCost: 122880000
  },
  {
    id: 70066,
    name: 'Академия монстров 12 уровня',
    englishName: 'Monster Academy Level 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 122880000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 245760 },
        { id: 10006, name: 'Каменные блоки', amount: 24576 },
        { id: 10026, name: 'Золото', amount: 3200 },
        { id: 10034, name: 'Изумруд', amount: 100 }
      ],
      population: 40,
    },
    stats: {
      constructionTimeSeconds: 435954, // 5d 1h 5m 54s
      accelerationCost: 520,
      durability: 213138,
      gloryOnExplosion: 3072000,
      takesPopulation: 43,
      workTimeSeconds: 693, // 11m 33s
      workYieldGold: 50,
      givesCoins: 236649,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 9.83, amount: 1 },
        { id: 10042, name: '??????', chance: 4.35, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 38 },
        { id: 10004, name: 'Куски супер тыквы', amount: 38 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 200 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 12.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/699.webp',
    upgradesTo: 70166,
    upgradeCost: 245760000
  },
  {
    id: 70166,
    name: 'Академия монстров 13 уровня',
    englishName: 'Monster Academy Level 13',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 245760000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 491520 },
        { id: 10006, name: 'Каменные блоки', amount: 49152 },
        { id: 10026, name: 'Золото', amount: 6400 },
        { id: 10034, name: 'Изумруд', amount: 200 }
      ],
      population: 46,
    },
    stats: {
      constructionTimeSeconds: 653931, // 7d 13h 38m 51s
      accelerationCost: 710,
      durability: 319707,
      gloryOnExplosion: 6144000,
      takesPopulation: 49,
      workTimeSeconds: 624, // 10m 24s
      workYieldGold: 50,
      givesCoins: 354974,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 11.06, amount: 1 },
        { id: 10042, name: '??????', chance: 4.89, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 47 },
        { id: 10004, name: 'Куски супер тыквы', amount: 47 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 265 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 13.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/699.webp',
    upgradesTo: 70266,
    upgradeCost: 491520000
  },
  {
    id: 70266,
    name: 'Академия монстров 14 уровня',
    englishName: 'Monster Academy Level 14',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 491520000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 983040 },
        { id: 10006, name: 'Каменные блоки', amount: 98304 },
        { id: 10026, name: 'Золото', amount: 12800 },
        { id: 10034, name: 'Изумруд', amount: 400 }
      ],
      population: 52,
    },
    stats: {
      constructionTimeSeconds: 980897, // 11d 8h 28m 17s
      accelerationCost: 970,
      durability: 479561,
      gloryOnExplosion: 12288000,
      takesPopulation: 55,
      workTimeSeconds: 561, // 9m 21s
      workYieldGold: 50,
      givesCoins: 532461,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 12.44, amount: 1 },
        { id: 10042, name: '??????', chance: 5.50, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 58 },
        { id: 10004, name: 'Куски супер тыквы', amount: 58 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 351 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 14.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/699.webp',
    upgradesTo: 70366,
    upgradeCost: 983040000
  },
  {
    id: 70366,
    name: 'Академия монстров 15 уровня',
    englishName: 'Monster Academy Level 15',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 983040000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1966080 },
        { id: 10006, name: 'Каменные блоки', amount: 196608 },
        { id: 10026, name: 'Золото', amount: 25600 },
        { id: 10034, name: 'Изумруд', amount: 800 }
      ],
      population: 58,
    },
    stats: {
      constructionTimeSeconds: 1471346, // 17d 0h 42m 26s
      accelerationCost: 1320,
      durability: 719342,
      gloryOnExplosion: 24576000,
      takesPopulation: 61,
      workTimeSeconds: 505, // 8m 25s
      workYieldGold: 50,
      givesCoins: 798692,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 14.00, amount: 1 },
        { id: 10042, name: '??????', chance: 6.19, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 72 },
        { id: 10004, name: 'Куски супер тыквы', amount: 72 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 465 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 15.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/699.webp',
    upgradesTo: 70466,
    upgradeCost: 1966080000
  },
  {
    id: 70466,
    name: 'Академия монстров 16 уровня',
    englishName: 'Monster Academy Level 16',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1966080000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 3932160 },
        { id: 10006, name: 'Каменные блоки', amount: 393216 },
        { id: 10026, name: 'Золото', amount: 51200 },
        { id: 10034, name: 'Изумруд', amount: 1600 }
      ],
      population: 65,
    },
    stats: {
      constructionTimeSeconds: 2207019, // 25d 13h 3m 39s
      accelerationCost: 1800,
      durability: 1079013,
      gloryOnExplosion: 49152000,
      takesPopulation: 68,
      workTimeSeconds: 455, // 7m 35s
      workYieldGold: 50,
      givesCoins: 1198038,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 15.75, amount: 1 },
        { id: 10042, name: '??????', chance: 6.96, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 90 },
        { id: 10004, name: 'Куски супер тыквы', amount: 90 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 616 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 16.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/704.webp',
    upgradesTo: 70566,
    upgradeCost: 3932160000
  },
  {
    id: 70566,
    name: 'Академия монстров 17 уровня',
    englishName: 'Monster Academy Level 17',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3932160000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 7864320 },
        { id: 10006, name: 'Каменные блоки', amount: 786432 },
        { id: 10026, name: 'Золото', amount: 102400 },
        { id: 10034, name: 'Изумруд', amount: 3200 }
      ],
      population: 72,
    },
    stats: {
      constructionTimeSeconds: 3310529, // 38d 7h 35m 29s
      accelerationCost: 2450,
      durability: 1618520,
      gloryOnExplosion: 98304000,
      takesPopulation: 75,
      workTimeSeconds: 409, // 6m 49s
      workYieldGold: 50,
      givesCoins: 1797057,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 17.72, amount: 1 },
        { id: 10042, name: '??????', chance: 7.83, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 112 },
        { id: 10004, name: 'Куски супер тыквы', amount: 112 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 816 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 17.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/704.webp',
    upgradesTo: 70666,
    upgradeCost: 7864320000
  },
  {
    id: 70666,
    name: 'Академия монстров 18 уровня',
    englishName: 'Monster Academy Level 18',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 7864320000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 15728640 },
        { id: 10006, name: 'Каменные блоки', amount: 1572864 },
        { id: 10026, name: 'Золото', amount: 204800 },
        { id: 10034, name: 'Изумруд', amount: 6400 }
      ],
      population: 80,
    },
    stats: {
      constructionTimeSeconds: 4965794, // 57d 11h 23m 14s
      accelerationCost: 3340,
      durability: 2427780,
      gloryOnExplosion: 196608000,
      takesPopulation: 83,
      workTimeSeconds: 368, // 6m 8s
      workYieldGold: 50,
      givesCoins: 2695586,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 4 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 19.93, amount: 1 },
        { id: 10042, name: '??????', chance: 8.81, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 140 },
        { id: 10004, name: 'Куски супер тыквы', amount: 140 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 1080 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 18.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/704.webp',
    upgradesTo: 70766,
    upgradeCost: 15728640000
  },
  {
    id: 70766,
    name: 'Академия монстров 19 уровня',
    englishName: 'Monster Academy Level 19',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 15728640000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 31457280 },
        { id: 10006, name: 'Каменные блоки', amount: 3145728 },
        { id: 10026, name: 'Золото', amount: 409600 },
        { id: 10034, name: 'Изумруд', amount: 12800 }
      ],
      population: 88,
    },
    stats: {
      constructionTimeSeconds: 7448691, // 86d 5h 4m 51s
      accelerationCost: 4550,
      durability: 3641670,
      gloryOnExplosion: 393216000,
      takesPopulation: 91,
      workTimeSeconds: 331, // 5m 31s
      workYieldGold: 50,
      givesCoins: 4043379,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 4 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 22.42, amount: 1 },
        { id: 10042, name: '??????', chance: 9.91, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 175 },
        { id: 10004, name: 'Куски супер тыквы', amount: 175 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 1430 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 19.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/704.webp',
    upgradesTo: 70866,
    upgradeCost: 31457280000
  },
  {
    id: 70866,
    name: 'Академия монстров 20 уровня',
    englishName: 'Monster Academy Level 20',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 31457280000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 62914560 },
        { id: 10006, name: 'Каменные блоки', amount: 6291456 },
        { id: 10026, name: 'Золото', amount: 819200 },
        { id: 10034, name: 'Изумруд', amount: 25600 }
      ],
      population: 96,
    },
    stats: {
      constructionTimeSeconds: 11173037, // 129d 7h 37m 17s
      accelerationCost: 6200,
      durability: 5462505,
      gloryOnExplosion: 786432000,
      takesPopulation: 99,
      workTimeSeconds: 298, // 4m 58s
      workYieldGold: 50,
      givesCoins: 6065069,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 5 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 25.22, amount: 1 },
        { id: 10042, name: '??????', chance: 11.15, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 218 },
        { id: 10004, name: 'Куски супер тыквы', amount: 218 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 1893 }
      ]
    },
    description: 'Производит яйца монстров. Уровень 20.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/704.webp',
    upgradesTo: 70966,
    upgradeCost: 62914560000
  },
  {
    id: 70966,
    name: 'Академия монстров 21 уровня',
    englishName: 'Monster Academy Level 21',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 62914560000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 125829120 },
        { id: 10006, name: 'Каменные блоки', amount: 12582912 },
        { id: 10026, name: 'Золото', amount: 1638400 },
        { id: 10034, name: 'Изумруд', amount: 51200 }
      ],
      population: 105,
    },
    stats: {
      constructionTimeSeconds: 16759556, // 194d 0h 25m 56s
      accelerationCost: 8450,
      durability: 8193758,
      gloryOnExplosion: 1572864000,
      takesPopulation: 108,
      workTimeSeconds: 268, // 4m 28s
      workYieldGold: 50,
      givesCoins: 9097604,
      produces: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 5 }
      ],
      sometimesProduces: [
        { id: 10017, name: 'Детонатор', chance: 28.37, amount: 1 },
        { id: 10042, name: '??????', chance: 12.54, amount: 1 }
      ],
      consumes: []
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 272 },
        { id: 10004, name: 'Куски супер тыквы', amount: 272 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 2506 }
      ]
    },
    description: 'Максимальный уровень Академии монстров. Производит яйца монстров с максимальной эффективностью.',
    imageUrl: '/buildings/Заводы/Академия монстров - Monster Academy/709.webp'
  },
  {
    id: 853,
    name: 'Сталепрокатный завод',
    englishName: 'Steel Rolling Mill',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2080000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 4160 },
        { id: 10006, name: 'Каменные блоки', amount: 416 }
      ],
      population: 80,
    },
    stats: {
      constructionTimeSeconds: 160800, // 1d 20h 40m
      accelerationCost: 85,
      durability: 14928,
      gloryOnExplosion: 104000,
      takesPopulation: 15,
      workTimeSeconds: 3273, // 54m 33s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10023, name: 'Сталь', amount: 2 },
        { id: 10024, name: 'Супер лилия', amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 22 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 81 }
      ]
    },
    description: 'Прокатывает сталь в листы. Высокотехнологичное производство.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/857.webp',
    upgradesTo: 854,
    upgradeCost: 2320000
  },
  {
    id: 854,
    name: 'Сталепрокатный завод - 2',
    englishName: 'Steel Rolling Mill Level 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2320000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 2320 },
        { id: 10006, name: 'Каменные блоки', amount: 232 }
      ],
      population: 84,
    },
    stats: {
      constructionTimeSeconds: 185011, // 2d 3h 23m 31s
      accelerationCost: 91,
      durability: 17560,
      gloryOnExplosion: 116000,
      takesPopulation: 17,
      workTimeSeconds: 6499, // 1h 48m 19s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 17 },
        { id: 10023, name: 'Сталь', amount: 3 },
        { id: 10024, name: 'Супер лилия', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 13 },
        { id: 10042, name: '??????', amount: 7 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 53 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 2.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/857.webp',
    upgradesTo: 855,
    upgradeCost: 2720000
  },
  {
    id: 855,
    name: 'Сталепрокатный завод - 3',
    englishName: 'Steel Rolling Mill Level 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2720000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 2720 },
        { id: 10006, name: 'Каменные блоки', amount: 272 }
      ],
      population: 90,
    },
    stats: {
      constructionTimeSeconds: 227100, // 2d 14h 45m
      accelerationCost: 100,
      durability: 20632,
      gloryOnExplosion: 136000,
      takesPopulation: 18,
      workTimeSeconds: 8667, // 2h 24m 27s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 24 },
        { id: 10023, name: 'Сталь', amount: 4 },
        { id: 10024, name: 'Супер лилия', amount: 2 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 9 },
        { id: 10040, name: 'Стальной лист', amount: 16 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 10 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 3.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/857.webp',
    upgradesTo: 856,
    upgradeCost: 3280000
  },
  {
    id: 856,
    name: 'Сталепрокатный завод - 4',
    englishName: 'Steel Rolling Mill Level 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3280000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 33 },
        { id: 10006, name: 'Каменные блоки', amount: 328 },
        { id: 10023, name: 'Сталь', amount: 7 }
      ],
      population: 93,
    },
    stats: {
      constructionTimeSeconds: 252107, // 2d 21h 1m 47s
      accelerationCost: 105,
      durability: 22328,
      gloryOnExplosion: 164000,
      takesPopulation: 19,
      workTimeSeconds: 9675, // 2h 41m 15s
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 31 },
        { id: 10023, name: 'Сталь', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 3 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 46 },
        { id: 10040, name: 'Стальной лист', amount: 19 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 677 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 4.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/857.webp',
    upgradesTo: 857,
    upgradeCost: 4000000
  },
  {
    id: 857,
    name: 'Сталепрокатный завод - 5',
    englishName: 'Steel Rolling Mill Level 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 40 },
        { id: 10006, name: 'Каменные блоки', amount: 400 },
        { id: 10023, name: 'Сталь', amount: 9 }
      ],
      population: 99,
    },
    stats: {
      constructionTimeSeconds: 298289, // 3d 10h 51m 29s
      accelerationCost: 115,
      durability: 26160,
      gloryOnExplosion: 200000,
      takesPopulation: 20,
      workTimeSeconds: 15414, // 4h 16m 54s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 4 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 38 },
        { id: 10023, name: 'Сталь', amount: 6 },
        { id: 10024, name: 'Супер лилия', amount: 3 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 8 },
        { id: 10036, name: 'Изумрудная руда', amount: 17 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 248 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 5.',
    imageUrl: '/buildings/factories/Сталепрокатный завод - Steel rolling plant/857.webp',
    upgradesTo: 858,
    upgradeCost: 4880000
  },
  {
    id: 858,
    name: 'Сталепрокатный завод - 6',
    englishName: 'Steel Rolling Mill Level 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4880000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 49 },
        { id: 10006, name: 'Каменные блоки', amount: 488 },
        { id: 10023, name: 'Сталь', amount: 11 }
      ],
      population: 105,
    },
    stats: {
      constructionTimeSeconds: 356887, // 4d 2h 28m 7s
      accelerationCost: 126,
      durability: 30184,
      gloryOnExplosion: 244000,
      takesPopulation: 26,
      workTimeSeconds: 21639, // 6h 0m 39s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 5 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 45 },
        { id: 10023, name: 'Сталь', amount: 7 },
        { id: 10024, name: 'Супер лилия', amount: 4 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 36 },
        { id: 10023, name: 'Сталь', amount: 87 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 157 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 6.',
    imageUrl: '/buildings/factories/Сталепрокатный завод - Steel rolling plant/858.webp',
    upgradesTo: 859,
    upgradeCost: 5920000
  },
  {
    id: 859,
    name: 'Сталепрокатный завод - 7',
    englishName: 'Steel Rolling Mill Level 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5920000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 59 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 13 }
      ],
      population: 110,
    },
    stats: {
      constructionTimeSeconds: 412500, // 4d 16h 55m
      accelerationCost: 134,
      durability: 34472,
      gloryOnExplosion: 296000,
      takesPopulation: 32,
      workTimeSeconds: 28571, // 7h 56m 11s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 6 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 52 },
        { id: 10023, name: 'Сталь', amount: 8 },
        { id: 10024, name: 'Супер лилия', amount: 4 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 47 },
        { id: 10042, name: '??????', amount: 25 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 28 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 7.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/858.webp',
    upgradesTo: 860,
    upgradeCost: 7120000
  },
  {
    id: 860,
    name: 'Сталепрокатный завод - 8',
    englishName: 'Steel Rolling Mill Level 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 7120000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 71 },
        { id: 10026, name: 'Золото', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 16 }
      ],
      population: 116,
    },
    stats: {
      constructionTimeSeconds: 475468, // 5d 12h 4m 28s
      accelerationCost: 145,
      durability: 38928,
      gloryOnExplosion: 356000,
      takesPopulation: 40,
      workTimeSeconds: 35922, // 9h 58m 42s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 7 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 59 },
        { id: 10023, name: 'Сталь', amount: 9 },
        { id: 10024, name: 'Супер лилия', amount: 5 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 32 },
        { id: 10040, name: 'Стальной лист', amount: 55 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 2056 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 8.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/858.webp',
    upgradesTo: 861,
    upgradeCost: 8480000
  },
  {
    id: 861,
    name: 'Сталепрокатный завод - 9',
    englishName: 'Steel Rolling Mill Level 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 8480000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 85 },
        { id: 10026, name: 'Золото', amount: 8 },
        { id: 10023, name: 'Сталь', amount: 18 }
      ],
      population: 122,
    },
    stats: {
      constructionTimeSeconds: 475154, // 5d 11h 13m 12s (corrected)
      accelerationCost: 157,
      durability: 43608,
      gloryOnExplosion: 424000,
      takesPopulation: 46,
      workTimeSeconds: 43922, // 12h 12m 2s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 8 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 66 },
        { id: 10023, name: 'Сталь', amount: 10 },
        { id: 10024, name: 'Супер лилия', amount: 5 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 172 },
        { id: 10040, name: 'Стальной лист', amount: 69 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 688 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 9.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/858.webp',
    upgradesTo: 862,
    upgradeCost: 10000000
  },
  {
    id: 862,
    name: 'Сталепрокатный завод - 10',
    englishName: 'Steel Rolling Mill Level 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 10000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 100 },
        { id: 10026, name: 'Золото', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 22 }
      ],
      population: 126,
    },
    stats: {
      constructionTimeSeconds: 696112, // 8d 1h 41m 52s (corrected)
      accelerationCost: 164,
      durability: 47288,
      gloryOnExplosion: 500000,
      takesPopulation: 54,
      workTimeSeconds: 46173, // 12h 49m 33s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 8 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 73 },
        { id: 10023, name: 'Сталь', amount: 11 },
        { id: 10024, name: 'Супер лилия', amount: 6 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 203 },
        { id: 10036, name: 'Изумрудная руда', amount: 54 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 384 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 10.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/867.webp',
    upgradesTo: 863,
    upgradeCost: 11680000
  },
  {
    id: 863,
    name: 'Сталепрокатный завод - 11',
    englishName: 'Steel Rolling Mill Level 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 11680000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 117 },
        { id: 10026, name: 'Золото', amount: 11 },
        { id: 10023, name: 'Сталь', amount: 25 }
      ],
      population: 131,
    },
    stats: {
      constructionTimeSeconds: 683227, // 7d 21h 20m 27s
      accelerationCost: 174,
      durability: 52384,
      gloryOnExplosion: 584000,
      takesPopulation: 63,
      workTimeSeconds: 54970, // 15h 16m 10s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 9 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 80 },
        { id: 10023, name: 'Сталь', amount: 12 },
        { id: 10024, name: 'Супер лилия', amount: 6 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 32 },
        { id: 10036, name: 'Изумрудная руда', amount: 67 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 63 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 11.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/867.webp',
    upgradesTo: 864,
    upgradeCost: 13520000
  },
  {
    id: 864,
    name: 'Сталепрокатный завод - 12',
    englishName: 'Steel Rolling Mill Level 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 13520000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 135 },
        { id: 10026, name: 'Золото', amount: 12 },
        { id: 10040, name: 'Стальной лист', amount: 11 }
      ],
      population: 137,
    },
    stats: {
      constructionTimeSeconds: 778605, // 9d 16m 45s
      accelerationCost: 186,
      durability: 57608,
      gloryOnExplosion: 676000,
      takesPopulation: 72,
      workTimeSeconds: 64035, // 17h 47m 15s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 10 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 87 },
        { id: 10023, name: 'Сталь', amount: 13 },
        { id: 10024, name: 'Супер лилия', amount: 7 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 131 },
        { id: 10023, name: 'Сталь', amount: 314 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 4501 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 12.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/867.webp',
    upgradesTo: 865,
    upgradeCost: 15520000
  },
  {
    id: 865,
    name: 'Сталепрокатный завод - 13',
    englishName: 'Steel Rolling Mill Level 13',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 15520000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 155 },
        { id: 10026, name: 'Золото', amount: 14 },
        { id: 10040, name: 'Стальной лист', amount: 13 }
      ],
      population: 143,
    },
    stats: {
      constructionTimeSeconds: 874862, // 10d 5h 41m 2s
      accelerationCost: 198,
      durability: 63016,
      gloryOnExplosion: 776000,
      takesPopulation: 80,
      workTimeSeconds: 73687, // 20h 28m 7s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 11 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 94 },
        { id: 10023, name: 'Сталь', amount: 14 },
        { id: 10024, name: 'Супер лилия', amount: 7 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 157 },
        { id: 10042, name: '??????', amount: 83 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 1437 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 13.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/867.webp',
    upgradesTo: 866,
    upgradeCost: 17680000
  },
  {
    id: 866,
    name: 'Сталепрокатный завод - 14',
    englishName: 'Steel Rolling Mill Level 14',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 17680000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 177 },
        { id: 10026, name: 'Золото', amount: 16 },
        { id: 10040, name: 'Стальной лист', amount: 15 }
      ],
      population: 147,
    },
    stats: {
      constructionTimeSeconds: 958956, // 11d 2h 42m 36s
      accelerationCost: 207,
      durability: 68544,
      gloryOnExplosion: 884000,
      takesPopulation: 92,
      workTimeSeconds: 83570, // 23h 12m 50s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 12 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 101 },
        { id: 10023, name: 'Сталь', amount: 15 },
        { id: 10024, name: 'Супер лилия', amount: 8 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 98 },
        { id: 10040, name: 'Стальной лист', amount: 170 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 805 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 14.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/868.webp',
    upgradesTo: 867,
    upgradeCost: 20000000
  },
  {
    id: 867,
    name: 'Сталепрокатный завод - 15',
    englishName: 'Steel Rolling Mill Level 15',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 20000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 27 },
        { id: 10034, name: 'Изумруд', amount: 8 },
        { id: 10040, name: 'Стальной лист', amount: 25 }
      ],
      population: 152,
    },
    stats: {
      constructionTimeSeconds: 1055942, // 12d 6h 39m 2s
      accelerationCost: 217,
      durability: 74248,
      gloryOnExplosion: 1000000,
      takesPopulation: 102,
      workTimeSeconds: 94017, // 1d 2h 6m 57s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 13 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 108 },
        { id: 10023, name: 'Сталь', amount: 16 },
        { id: 10024, name: 'Супер лилия', amount: 8 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 499 },
        { id: 10040, name: 'Стальной лист', amount: 200 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 126 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 15.',
    imageUrl: '/buildings/factories/Сталепрокатный завод - Steel rolling plant/867.webp',
    upgradesTo: 868,
    upgradeCost: 22480000
  },
  {
    id: 868,
    name: 'Сталепрокатный завод - 16',
    englishName: 'Steel Rolling Mill Level 16',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 22480000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 31 },
        { id: 10034, name: 'Изумруд', amount: 9 },
        { id: 10040, name: 'Стальной лист', amount: 28 }
      ],
      population: 156,
    },
    stats: {
      constructionTimeSeconds: 1141324, // 13d 6h 22m 4s
      accelerationCost: 226,
      durability: 79168,
      gloryOnExplosion: 1124000,
      takesPopulation: 112,
      workTimeSeconds: 97046, // 1d 2h 57m 26s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 13 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 115 },
        { id: 10023, name: 'Сталь', amount: 17 },
        { id: 10024, name: 'Супер лилия', amount: 9 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 567 },
        { id: 10036, name: 'Изумрудная руда', amount: 152 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 8502 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 16.',
    imageUrl: '/buildings/factories/Сталепрокатный завод - Steel rolling plant/868.webp',
    upgradesTo: 869,
    upgradeCost: 25120000
  },
  {
    id: 869,
    name: 'Сталепрокатный завод - 17',
    englishName: 'Steel Rolling Mill Level 17',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 25120000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 34 },
        { id: 10034, name: 'Изумруд', amount: 10 },
        { id: 10040, name: 'Стальной лист', amount: 31 }
      ],
      population: 162,
    },
    stats: {
      constructionTimeSeconds: 1276658, // 14d 20h 17m 38s
      accelerationCost: 239,
      durability: 85184,
      gloryOnExplosion: 1256000,
      takesPopulation: 122,
      workTimeSeconds: 108110, // 1d 6h 1m 50s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 14 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 122 },
        { id: 10023, name: 'Сталь', amount: 18 },
        { id: 10024, name: 'Супер лилия', amount: 9 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 83 },
        { id: 10036, name: 'Изумрудная руда', amount: 175 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 2625 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 17.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/868.webp',
    upgradesTo: 870,
    upgradeCost: 27920000
  },
  {
    id: 870,
    name: 'Сталепрокатный завод - 18',
    englishName: 'Steel Rolling Mill Level 18',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 27920000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 38 },
        { id: 10034, name: 'Изумруд', amount: 11 },
        { id: 10040, name: 'Стальной лист', amount: 35 }
      ],
      population: 167,
    },
    stats: {
      constructionTimeSeconds: 1397238, // 16d 6h 7m 18s
      accelerationCost: 250,
      durability: 91312,
      gloryOnExplosion: 1396000,
      takesPopulation: 136,
      workTimeSeconds: 119324, // 1d 9h 8m 44s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 15 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 129 },
        { id: 10023, name: 'Сталь', amount: 19 },
        { id: 10024, name: 'Супер лилия', amount: 10 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 330 },
        { id: 10023, name: 'Сталь', amount: 789 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 1429 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 18.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/868.webp',
    upgradesTo: 871,
    upgradeCost: 30880000
  },
  {
    id: 871,
    name: 'Сталепрокатный завод - 19',
    englishName: 'Steel Rolling Mill Level 19',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 30880000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 42 },
        { id: 10034, name: 'Изумруд', amount: 12 },
        { id: 10040, name: 'Стальной лист', amount: 39 }
      ],
      population: 171,
    },
    stats: {
      constructionTimeSeconds: 1479663, // 17d 10h 41m 3s
      accelerationCost: 259,
      durability: 97600,
      gloryOnExplosion: 1544000,
      takesPopulation: 148,
      workTimeSeconds: 130484, // 1d 12h 24m 44s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 16 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 136 },
        { id: 10023, name: 'Сталь', amount: 20 },
        { id: 10024, name: 'Супер лилия', amount: 10 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 376 },
        { id: 10042, name: '??????', amount: 198 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 217 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 19.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/868.webp',
    upgradesTo: 872,
    upgradeCost: 34000000
  },
  {
    id: 872,
    name: 'Сталепрокатный завод - 20',
    englishName: 'Steel Rolling Mill Level 20',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 34000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 46 },
        { id: 10034, name: 'Изумруд', amount: 13 },
        { id: 10040, name: 'Стальной лист', amount: 43 }
      ],
      population: 177,
    },
    stats: {
      constructionTimeSeconds: 1658769, // 19d 8h 6m 9s
      accelerationCost: 273,
      durability: 103984,
      gloryOnExplosion: 1700000,
      takesPopulation: 160,
      workTimeSeconds: 142971, // 1d 15h 42m 51s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 17 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 143 },
        { id: 10023, name: 'Сталь', amount: 21 },
        { id: 10024, name: 'Супер лилия', amount: 11 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 225 },
        { id: 10040, name: 'Стальной лист', amount: 392 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 14667 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 20.',
    imageUrl: '/buildings/Заводы/Сталепрокатный завод - Steel rolling plant/873.webp',
    upgradesTo: 873,
    upgradeCost: 37280000
  },
  {
    id: 873,
    name: 'Сталепрокатный завод - 21',
    englishName: 'Steel Rolling Mill Level 21',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 37280000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 51 },
        { id: 10034, name: 'Изумруд', amount: 15 },
        { id: 10040, name: 'Стальной лист', amount: 47 }
      ],
      population: 182,
    },
    stats: {
      constructionTimeSeconds: 1814570, // 21d 22m 50s
      accelerationCost: 284,
      durability: 110520,
      gloryOnExplosion: 1864000,
      takesPopulation: 172,
      workTimeSeconds: 156592, // 1d 19h 9m 52s
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        { id: 10040, name: 'Стальной лист', amount: 18 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 150 },
        { id: 10023, name: 'Сталь', amount: 22 },
        { id: 10024, name: 'Супер лилия', amount: 11 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 1105 },
        { id: 10040, name: 'Стальной лист', amount: 442 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 4419 }
      ]
    },
    description: 'Прокатывает сталь в листы. Уровень 21. Максимальный уровень.',
    imageUrl: '/buildings/factories/Сталепрокатный завод - Steel rolling plant/873.webp'
  },
  {
    id: 6000,
    name: 'Воровское логово',
    englishName: 'Den of Thieves',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 9000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 25 },
        { id: 10005, name: 'Камни', amount: 30 }
      ],
      population: 9,
    },
    stats: {
      constructionTimeSeconds: 180,
      accelerationCost: 3,
      durability: 952,
      gloryOnExplosion: 450,
      givesCoins: 839
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 40 },
        { id: 10009, name: 'Канистра с бензином', amount: 27 }
      ],
      rare: [
        { id: 10018, name: 'Яйцо Горыныча', amount: 2 }
      ]
    },
    description: 'Воровское логово. Для постройки требуется 2 уровень аккаунта.',
    imageUrl: '/buildings/Специальные Здания/Воровское логово - Den of thieves/6000.webp'
  },
  {
    id: 308,
    name: 'Полицейский участок',
    englishName: 'Police station',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 500000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 50 },
        { id: 10006, name: 'Каменные блоки', amount: 30 }
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 460,
      accelerationCost: 5,
      durability: 7120,
      gloryOnExplosion: 25000,
      givesCoins: 250000,
      chanceToCatchThief: 20
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 40 },
        { id: 10009, name: 'Канистра с бензином', amount: 27 },
        { id: 10023, name: 'Сталь', amount: 20 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 69 }
      ]
    },
    description: 'Поможет ловить воров (шанс 20%), и даст возможность участвовать в выборах полиции.',
    imageUrl: '/buildings/Специальные Здания/Полицейский участок - Police station/308.webp',
    upgradesTo: 309,
    upgradeCost: 700000
  },
  {
    id: 309,
    name: 'Полицейский участок 2',
    englishName: 'Police station 2',
    category: 'Специальные',
    type: BuildingType.Default,
    price: 700000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 80 },
        { id: 10006, name: 'Каменные блоки', amount: 50 }
      ],
      population: 26,
    },
    stats: {
      constructionTimeSeconds: 52728,
      accelerationCost: 48,
      durability: 8800,
      gloryOnExplosion: 35000,
      chanceToCatchThief: 40
    },
    drops: {
      frequent: [
        { id: 10002, name: 'золото', amount: 4 },
        { id: 10042, name: '??????', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 10631 }
      ],
      rare: [
        { id: 10035, name: 'изумрудная руда', amount: 28 }
      ]
    },
    description: 'Поможет ловить воров (шанс 40%), и даст возможность участвовать в выборах полиции.',
    imageUrl: '/buildings/Специальные Здания/Полицейский участок - Police station/309.webp'
  },
  {
    id: 50001,
    name: 'Дорога',
    englishName: 'Road',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 70,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 1,
      gloryOnExplosion: 4,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 5, chance: 30 }]
    },
    description: 'Обычная дорога.',
    imageUrl: '/buildings/Дороги/Дорога/IMG-74939-11.webp',
  },
  {
    id: 500012,
    name: 'Дорога',
    englishName: 'Road',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 70,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 1,
      gloryOnExplosion: 4,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 5, chance: 30 }]
    },
    description: 'Обычная дорога.',
    imageUrl: '/buildings/Дороги/Дорога/Icogram-2026.webp',
  },
  {
    id: 50006,
    name: 'Мостовая',
    englishName: 'Pavement',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 10000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10006, name: 'Каменные блоки', amount: 15 },
      ],
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 1008,
      gloryOnExplosion: 500,
    },
    drops: {
      frequent: [
        { id: 10013, name: 'Петарда', amount: 15, chance: 30 },
        { id: 10010, name: 'Садовая бомба', amount: 6, chance: 30 },
        { id: 999, name: 'Монеты', amount: 839, chance: 30 }
      ],
      rare: [
        { id: 10023, name: 'Сталь', amount: 2, chance: 30 }
      ]
    },
    description: 'Мостовая.',
    imageUrl: '/buildings/Дороги/Мостовая/50006.webp',
  },
  {
    id: 500061,
    name: 'Мостовая',
    englishName: 'Pavement',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 10000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10006, name: 'Каменные блоки', amount: 15 },
      ],
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 1008,
      gloryOnExplosion: 500,
    },
    drops: {
      frequent: [
        { id: 10013, name: 'Петарда', amount: 15, chance: 30 },
        { id: 10010, name: 'Садовая бомба', amount: 6, chance: 30 },
        { id: 999, name: 'Монеты', amount: 839, chance: 30 }
      ],
      rare: [
        { id: 10023, name: 'Сталь', amount: 2, chance: 30 }
      ]
    },
    description: 'Мостовая (поворот).',
    imageUrl: '/buildings/Дороги/Мостовая/Icogram-2026-04-15-01-12-1.webp',
  },
  {
    id: 50002,
    name: 'Стена',
    englishName: 'Wall',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 600,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 248,
      gloryOnExplosion: 4,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 5, chance: 30 }]
    },
    description: 'Стена.',
    imageUrl: '/buildings/Дороги/Стена/50002.webp',
  },
  {
    id: 500021,
    name: 'Стена',
    englishName: 'Wall',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 600,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 248,
      gloryOnExplosion: 4,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 5, chance: 30 }]
    },
    description: 'Стена.',
    imageUrl: '/buildings/Дороги/Стена/Icogram-12026-04-01-14-24-1.webp',
  },
  {
    id: 50003,
    name: 'Каменная стена',
    englishName: 'Stone wall',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 6000,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 776,
      gloryOnExplosion: 4,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 5, chance: 30 }]
    },
    description: 'Каменная стена.',
    imageUrl: '/buildings/Дороги/Каменная стена/50003.webp',
  },
  {
    id: 500031,
    name: 'Каменная стена',
    englishName: 'Stone wall',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 6000,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 776,
      gloryOnExplosion: 4,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 5, chance: 30 }]
    },
    description: 'Каменная стена.',
    imageUrl: '/buildings/Дороги/Каменная стена/Icogram-2026-1.webp',
  },
  {
    id: 500032,
    name: 'Каменная стена',
    englishName: 'Stone wall',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 6000,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 776,
      gloryOnExplosion: 4,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 5, chance: 30 }]
    },
    description: 'Каменная стена.',
    imageUrl: '/buildings/Дороги/Каменная стена/Gemini-G32321.webp',
  },
  {
    id: 300,
    name: 'Табличка с надписью',
    englishName: 'Sign',
    category: 'Дороги и стены',
    type: BuildingType.Default,
    price: 100000,
    buildable: true,
    constructionRequirements: {
      population: 0,
    },
    stats: {
      constructionTimeSeconds: 1,
      durability: 3184,
      gloryOnExplosion: 4,
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 5, chance: 30 }]
    },
    description: 'Табличка с надписью.',
    imageUrl: '/buildings/Дороги/Табличка с надписью/300.webp',
  },
  {
    id: 70001,
    name: 'Избушка-убийца',
    englishName: 'Killing Hut',
    category: 'Монстры',
    type: BuildingType.Default,
    price: 1000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10007, name: 'Яйцо Избушки-убийцы', amount: 1 }]
    },
    stats: {
      durability: 5,
      constructionTimeSeconds: 10,
      damage: '4',
      hates: 'Грядки',
      givesCoins: 303,
      isMonster: true,
      moveIntervalSeconds: 10,
      gloryOnExplosion: 50
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 20, chance: 30 },
        { id: 10008, name: 'Бочка с нефтью', amount: 10, chance: 30 },
        { id: 10009, name: 'Канистра с бензином', amount: 5, chance: 30 },
        { id: 999, name: 'Монеты', amount: 303, chance: 30 }
      ],
      rare: [
        { id: 10002, name: 'Доски', amount: 4, chance: 30 }
      ]
    },
    description: 'Ходит по карте и атакует здания. Ненавидит фермы.',
    imageUrl: '/buildings/Монстры/Избушка/70001.webp'
  },
  {
    id: 70002,
    name: 'Добрый Санта',
    englishName: 'Kind Santa',
    category: 'Монстры',
    type: BuildingType.Default,
    price: 3000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3 }]
    },
    stats: {
      durability: 13,
      constructionTimeSeconds: 15,
      damage: '14',
      hates: 'Заводы',
      givesCoins: 659,
      isMonster: true,
      moveIntervalSeconds: 10,
      gloryOnExplosion: 100
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 22 },
        { id: 10013, name: 'Петарда', amount: 8 },
        { id: 10010, name: 'Садовая бомба', amount: 3 }
      ],
      rare: [
        { id: 10004, name: 'Куски супер тыквы', amount: 2 }
      ]
    },
    description: 'Добрый Санта, который почему-то ненавидит заводы.',
    imageUrl: '/buildings/Монстры/Добрый Санта/70002.webp'
  },
  {
    id: 70003,
    name: 'Горыныч',
    englishName: 'Gorynych',
    category: 'Монстры',
    type: BuildingType.Default,
    price: 15000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10018, name: 'Яйцо Горыныча', amount: 1 },
        { id: 10003, name: 'Куски супер гриба', amount: 3 }
      ]
    },
    stats: {
      durability: 40,
      constructionTimeSeconds: 20,
      damage: '50',
      hates: 'Жилые',
      givesCoins: 2035,
      isMonster: true,
      moveIntervalSeconds: 10,
      gloryOnExplosion: 500
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 2 },
        { id: 10024, name: 'Супер лилия', amount: 4 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 3 }
      ]
    },
    description: 'Легендарный Змея Горыныч. Ненавидит жилые постройки.',
    imageUrl: '/buildings/Монстры/Горыныч/70003.webp'
  },
  {
    id: 70004,
    name: 'Колобок',
    englishName: 'Gingerbread man',
    category: 'Монстры',
    type: BuildingType.Default,
    price: 60000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10021, name: 'Куски супер репки', amount: 3 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 },
        { id: 10019, name: 'Мешок муки', amount: 1 }
      ]
    },
    stats: {
      durability: 60,
      constructionTimeSeconds: 25,
      damage: '85',
      hates: 'Хранилища монет',
      givesCoins: 3788,
      isMonster: true,
      moveIntervalSeconds: 10,
      gloryOnExplosion: 800
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 5 },
        { id: 10018, name: 'Яйцо Горыныча', amount: 2 },
        { id: 10004, name: 'Куски супер тыквы', amount: 4 },
        { id: 999, name: 'Монеты', amount: 3788 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 4 }
      ]
    },
    description: 'Ходит по карте и атакует здания. Ненавидит хранилища монет.',
    imageUrl: '/buildings/Монстры/Колобок/70004.webp'
  },
  {
    id: 70005,
    name: 'Баба Яга',
    englishName: 'Old Hag',
    category: 'Монстры',
    type: BuildingType.Default,
    price: 100000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 3000 },
        { id: 10003, name: 'Куски супер гриба', amount: 20 }
      ]
    },
    stats: {
      durability: 80,
      constructionTimeSeconds: 30,
      damage: '120',
      hates: 'Дороги и стены',
      givesCoins: 5839,
      isMonster: true,
      moveIntervalSeconds: 10,
      gloryOnExplosion: 1200
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 8 },
        { id: 10027, name: 'Зёрна гигантской пшеницы', amount: 2 },
        { id: 10004, name: 'Куски супер тыквы', amount: 7 },
        { id: 999, name: 'Монеты', amount: 5839 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 14 }
      ]
    },
    description: 'Крайне опасная и вредная старушка. Имеет не здоровую страсть к оружию и вспыльчивый характер.',
    imageUrl: '/buildings/Монстры/Баба Яга/70005.webp'
  },
  {
    id: 70006,
    name: 'Бронекур',
    englishName: 'Armoured chicken',
    category: 'Монстры',
    type: BuildingType.Default,
    price: 5000000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10009, name: 'Канистра с бензином', amount: 40000 },
        { id: 10023, name: 'Сталь', amount: 700 }
      ]
    },
    stats: {
      durability: 250000,
      constructionTimeSeconds: 60,
      damage: '1',
      hates: 'Подарки',
      givesCoins: 816502,
      isMonster: true,
      moveIntervalSeconds: 60,
      gloryOnExplosion: 10000
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 250 },
        { id: 10017, name: 'Детонатор', amount: 132 },
        { id: 10040, name: 'Стальной лист', amount: 230 },
        { id: 999, name: 'Монеты', amount: 816502 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 579 }
      ]
    },
    description: 'Страшно кошмарно ужасная мощь. Если в городе он, бегите все прочь!',
    imageUrl: '/buildings/Монстры/Бронекур/70006.webp'
  },
  {
    id: 53,
    name: 'Лягушачья нора 3',
    englishName: "Frog's burrow 3",
    category: 'Жилые',
    price: 210,
    buildable: false,
    constructionRequirements: {
      population: 4,
      resources: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 1
        }
      ]
    },
    stats: {
      "populationBonus": 4,
      constructionTimeSeconds: 192,
      accelerationCost: 3,
      durability: 160,
      gloryOnExplosion: 11,
      givesCoins: 140
    },
    drops: {
      frequent: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 3
        },
        {
          id: 10008,
          name: 'Нефть',
          amount: 2
        }
      ],
      rare: [
        {
          id: 10010,
          name: 'Садовая бомба',
          amount: 3
        }
      ]
    },
    imageUrl: '/buildings/residential/53.webp',
    upgradesTo: 54,
    "upgradeCost": 380,
    type: BuildingType.Residential,
    description: 'Лягушачья нора 3'
  },
  {
    id: 54,
    name: 'Лягушачья нора 4',
    englishName: "Frog's burrow 4",
    category: 'Жилые',
    price: 380,
    buildable: false,
    constructionRequirements: {
      population: 5,
      resources: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 1
        }
      ]
    },
    stats: {
      "populationBonus": 5,
      constructionTimeSeconds: 375,
      accelerationCost: 4,
      durability: 224,
      gloryOnExplosion: 19,
      givesCoins: 181
    },
    drops: {
      frequent: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 6
        },
        {
          id: 10008,
          name: 'Нефть',
          amount: 3
        }
      ],
      rare: [
        {
          id: 10041,
          name: 'Песок',
          amount: 2
        }
      ]
    },
    imageUrl: '/buildings/residential/54.webp',
    upgradesTo: 5,
    "upgradeCost": 2000,
    type: BuildingType.Residential,
    description: 'Лягушачья нора 4'
  },
  {
    id: 6,
    name: 'Деревянный дом 2',
    englishName: 'Wooden house 6',
    category: 'Жилые',
    price: 4000,
    buildable: false,
    constructionRequirements: {
      population: 8,
      resources: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 11
        },
        {
          id: 10002,
          name: 'Доски',
          amount: 4
        }
      ]
    },
    stats: {
      "populationBonus": 7,
      constructionTimeSeconds: 1536,
      accelerationCost: 8,
      durability: 768,
      gloryOnExplosion: 200
    },
    drops: {
      frequent: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 68
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 1
        },
        {
          id: 10009,
          name: 'Бензин',
          amount: 18
        }
      ],
      rare: [
        {
          id: 10004,
          name: 'Супер тыква',
          amount: 4
        }
      ]
    },
    imageUrl: '/buildings/residential/6.webp',
    upgradesTo: 51,
    "upgradeCost": 7000,
    type: BuildingType.Residential,
    description: 'Деревянный дом 2'
  },
  {
    id: 51,
    name: 'Деревянный дом 3',
    englishName: 'Wooden house 7',
    category: 'Жилые',
    price: 7000,
    buildable: false,
    constructionRequirements: {
      population: 9,
      resources: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 18
        },
        {
          id: 10002,
          name: 'Доски',
          amount: 7
        }
      ]
    },
    stats: {
      "populationBonus": 8,
      constructionTimeSeconds: 2187,
      accelerationCost: 10,
      durability: 1048,
      gloryOnExplosion: 350
    },
    drops: {
      frequent: [
        {
          id: 10006,
          name: 'Каменные блоки',
          amount: 5
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 2
        },
        {
          id: 10010,
          name: 'Садовая бомба',
          amount: 6
        }
      ],
      rare: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 2
        }
      ]
    },
    imageUrl: '/buildings/residential/51.webp',
    upgradesTo: 217,
    "upgradeCost": 17000,
    type: BuildingType.Residential,
    description: 'Деревянный дом 3'
  },
  {
    id: 52,
    name: 'Деревянный дом 4',
    englishName: 'Wooden house 1',
    category: 'Жилые',
    price: 12000,
    buildable: false,
    constructionRequirements: {
      population: 10,
      resources: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 32
        },
        {
          id: 10002,
          name: 'Доски',
          amount: 12
        }
      ]
    },
    stats: {
      "populationBonus": 9,
      constructionTimeSeconds: 3000,
      accelerationCost: 12,
      durability: 1104,
      gloryOnExplosion: 600
    },
    drops: {
      frequent: [
        {
          id: 10005,
          name: 'Камни',
          amount: 15
        },
        {
          id: 10006,
          name: 'Каменные блоки',
          amount: 6
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 3
        }
      ],
      rare: [
        {
          id: 10018,
          name: 'Яйцо Горыныча',
          amount: 2
        }
      ]
    },
    imageUrl: '/buildings/residential/52.webp',
    upgradesTo: 217,
    "upgradeCost": 17000,
    type: BuildingType.Residential,
    description: 'Деревянный дом 4'
  },
  {
    id: 217,
    name: 'Деревянный дом 5',
    englishName: 'Wooden house 8',
    category: 'Жилые',
    price: 17000,
    buildable: false,
    constructionRequirements: {
      population: 12,
      resources: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 45
        },
        {
          id: 10002,
          name: 'Доски',
          amount: 17
        }
      ]
    },
    stats: {
      "populationBonus": 10,
      constructionTimeSeconds: 5184,
      accelerationCost: 15,
      durability: 1680,
      gloryOnExplosion: 850
    },
    drops: {
      frequent: [
        {
          id: 10033,
          name: 'Черепки',
          amount: 4
        },
        {
          id: 10017,
          name: 'Детонатор',
          amount: 2
        },
        {
          id: 10007,
          name: 'Яйцо избушки',
          amount: 3
        }
      ],
      rare: [
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 2
        }
      ]
    },
    imageUrl: '/buildings/residential/217.webp',
    upgradesTo: 218,
    "upgradeCost": 25000,
    type: BuildingType.Residential,
    description: 'Деревянный дом 5'
  },
  {
    id: 218,
    name: 'Деревянный дом 6',
    englishName: 'Wooden house 1',
    category: 'Жилые',
    price: 25000,
    buildable: false,
    constructionRequirements: {
      population: 11,
      resources: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 66
        },
        {
          id: 10002,
          name: 'Доски',
          amount: 25
        },
        {
          id: 10005,
          name: 'Камни',
          amount: 7
        }
      ]
    },
    stats: {
      "populationBonus": 11,
      constructionTimeSeconds: 3993,
      accelerationCost: 13,
      durability: 1592,
      gloryOnExplosion: 1250
    },
    drops: {
      frequent: [
        {
          id: 10033,
          name: 'Черепки',
          amount: 5
        },
        {
          id: 10017,
          name: 'Детонатор',
          amount: 2
        },
        {
          id: 10007,
          name: 'Яйцо избушки',
          amount: 2
        }
      ],
      rare: [
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 2
        }
      ]
    },
    imageUrl: '/buildings/residential/218.webp',
    upgradesTo: 7,
    "upgradeCost": 25000,
    type: BuildingType.Residential,
    description: 'Деревянный дом 6'
  },
  {
    id: 101,
    name: 'Маленький замок 2',
    englishName: 'Little castle 1',
    category: 'Жилые',
    price: 700000,
    buildable: false,
    constructionRequirements: {
      population: 25,
      resources: [
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 7
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 2
        },
        {
          id: 10003,
          name: 'Куски супер гриба',
          amount: 10
        }
      ]
    },
    stats: {
      "populationBonus": 19,
      constructionTimeSeconds: 46875,
      accelerationCost: 46,
      durability: 8424,
      gloryOnExplosion: 35000
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 7
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 13
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 3
        }
      ],
      rare: [
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 26
        }
      ]
    },
    imageUrl: '/buildings/residential/101.webp',
    upgradesTo: 114,
    "upgradeCost": 900000,
    type: BuildingType.Residential,
    description: 'Маленький замок 2'
  },
  {
    id: 114,
    name: 'Маленький замок 3',
    englishName: 'Little castle 1',
    category: 'Жилые',
    price: 900000,
    buildable: false,
    constructionRequirements: {
      population: 27,
      resources: [
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 9
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 2
        },
        {
          id: 10003,
          name: 'Куски супер гриба',
          amount: 13
        }
      ]
    },
    stats: {
      "populationBonus": 20,
      constructionTimeSeconds: 59049,
      accelerationCost: 51,
      durability: 9552,
      gloryOnExplosion: 45000
    },
    drops: {
      frequent: [
        {
          id: 10033,
          name: 'Черепки',
          amount: 14
        },
        {
          id: 10022,
          name: 'Железная руда',
          amount: 47
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 9
        }
      ],
      rare: [
        {
          id: 10034,
          name: 'Изумруд',
          amount: 16
        }
      ]
    },
    imageUrl: '/buildings/residential/114.webp',
    upgradesTo: 115,
    "upgradeCost": 1000000,
    type: BuildingType.Residential,
    description: 'Маленький замок 3'
  },
  {
    id: 115,
    name: 'Маленький замок 4',
    englishName: 'Little castle 1',
    category: 'Жилые',
    price: 1000000,
    buildable: false,
    constructionRequirements: {
      population: 28,
      resources: [
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 10
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 2
        },
        {
          id: 10003,
          name: 'Куски супер гриба',
          amount: 15
        }
      ]
    },
    stats: {
      "populationBonus": 21,
      constructionTimeSeconds: 65856,
      accelerationCost: 54,
      durability: 10072,
      gloryOnExplosion: 50000
    },
    drops: {
      frequent: [
        {
          id: 10026,
          name: 'Золото',
          amount: 4
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 15
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 10
        }
      ],
      rare: [
        {
          id: 10043,
          name: 'Суператомная бомба',
          amount: 3
        }
      ]
    },
    imageUrl: '/buildings/residential/115.webp',
    upgradesTo: 146,
    "upgradeCost": 1500000,
    type: BuildingType.Residential,
    description: 'Маленький замок 4'
  },
  {
    id: 148,
    name: 'Вилла 2',
    englishName: 'Villa 15',
    category: 'Жилые',
    price: 1400000,
    buildable: false,
    constructionRequirements: {
      population: 37,
      resources: [
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 14
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 3
        },
        {
          id: 10003,
          name: 'Куски супер гриба',
          amount: 21
        }
      ]
    },
    stats: {
      "populationBonus": 22,
      constructionTimeSeconds: 152679,
      accelerationCost: 82,
      durability: 17960,
      gloryOnExplosion: 70000
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 30
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 16
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 12
        }
      ],
      rare: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 438
        }
      ]
    },
    imageUrl: '/buildings/residential/148.webp',
    upgradesTo: 149,
    "upgradeCost": 2100000,
    type: BuildingType.Residential,
    description: 'Вилла 2'
  },
  {
    id: 149,
    name: 'Вилла 3',
    englishName: 'Villa 1',
    category: 'Жилые',
    price: 2100000,
    buildable: false,
    constructionRequirements: {
      population: 33,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 2
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 5
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 1
        }
      ]
    },
    stats: {
      "populationBonus": 24,
      constructionTimeSeconds: 107811,
      accelerationCost: 69,
      durability: 14592,
      gloryOnExplosion: 105000
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 20
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 18
        },
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 6
        }
      ],
      rare: [
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 77
        }
      ]
    },
    imageUrl: '/buildings/residential/149.webp',
    upgradesTo: 150,
    "upgradeCost": 2500000,
    type: BuildingType.Residential,
    description: 'Вилла 3'
  },
  {
    id: 150,
    name: 'Вилла 4',
    englishName: 'Villa 16',
    category: 'Жилые',
    price: 2500000,
    buildable: false,
    constructionRequirements: {
      population: 43,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 2
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 5
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 1
        }
      ]
    },
    stats: {
      "populationBonus": 25,
      constructionTimeSeconds: 238521,
      accelerationCost: 103,
      durability: 24472,
      gloryOnExplosion: 125000
    },
    drops: {
      frequent: [
        {
          id: 10033,
          name: 'Черепки',
          amount: 19
        },
        {
          id: 10022,
          name: 'Железная руда',
          amount: 305
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 57
        }
      ],
      rare: [
        {
          id: 10034,
          name: 'Изумруд',
          amount: 103
        }
      ]
    },
    imageUrl: '/buildings/residential/150.webp',
    upgradesTo: 151,
    "upgradeCost": 2900000,
    type: BuildingType.Residential,
    description: 'Вилла 4'
  },
  {
    id: 151,
    name: 'Вилла 5',
    englishName: 'Villa 1',
    category: 'Жилые',
    price: 2900000,
    buildable: false,
    constructionRequirements: {
      population: 36,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 3
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 6
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 2
        }
      ]
    },
    stats: {
      "populationBonus": 26,
      constructionTimeSeconds: 139968,
      accelerationCost: 79,
      durability: 17144,
      gloryOnExplosion: 145000
    },
    drops: {
      frequent: [
        {
          id: 10026,
          name: 'Золото',
          amount: 12
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 20
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 28
        }
      ],
      rare: [
        {
          id: 10043,
          name: 'Суператомная бомба',
          amount: 7
        }
      ]
    },
    imageUrl: '/buildings/residential/151.webp',
    upgradesTo: 205,
    "upgradeCost": 5000000,
    type: BuildingType.Residential,
    description: 'Вилла 5'
  },
  {
    id: 206,
    name: 'Дворец 2',
    englishName: 'Palace 1',
    category: 'Жилые',
    price: 5400000,
    buildable: false,
    constructionRequirements: {
      population: 42,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 5
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 12
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 3
        }
      ]
    },
    stats: {
      "populationBonus": 28,
      constructionTimeSeconds: 222264,
      accelerationCost: 99,
      durability: 23400,
      gloryOnExplosion: 270000
    },
    drops: {
      frequent: [
        {
          id: 10026,
          name: 'Золото',
          amount: 22
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 22
        },
        {
          id: 10042,
          name: '??????',
          amount: 12
        }
      ],
      rare: [
        {
          id: 10034,
          name: 'Изумруд',
          amount: 94
        }
      ]
    },
    imageUrl: '/buildings/residential/206.webp',
    upgradesTo: 207,
    "upgradeCost": 5800000,
    type: BuildingType.Residential,
    description: 'Дворец 2'
  },
  {
    id: 207,
    name: 'Дворец 3',
    englishName: 'Palace 1',
    category: 'Жилые',
    price: 5800000,
    buildable: false,
    constructionRequirements: {
      population: 43,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 5
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 13
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 3
        }
      ]
    },
    stats: {
      "populationBonus": 29,
      constructionTimeSeconds: 238521,
      accelerationCost: 103,
      durability: 24248,
      gloryOnExplosion: 290000
    },
    drops: {
      frequent: [
        {
          id: 10033,
          name: 'Черепки',
          amount: 23
        },
        {
          id: 10042,
          name: '??????',
          amount: 13
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 22
        }
      ],
      rare: [
        {
          id: 10043,
          name: 'Суператомная бомба',
          amount: 14
        }
      ]
    },
    imageUrl: '/buildings/residential/207.webp',
    upgradesTo: 208,
    "upgradeCost": 6200000,
    type: BuildingType.Residential,
    description: 'Дворец 3'
  },
  {
    id: 208,
    name: 'Дворец 4',
    englishName: 'Palace 18',
    category: 'Жилые',
    price: 6200000,
    buildable: false,
    constructionRequirements: {
      population: 55,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 6
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 14
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 3
        }
      ]
    },
    stats: {
      "populationBonus": 30,
      constructionTimeSeconds: 499125,
      accelerationCost: 149,
      durability: 40000,
      gloryOnExplosion: 310000
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 145
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 24
        },
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 39
        }
      ],
      rare: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 2170
        }
      ]
    },
    imageUrl: '/buildings/residential/208.webp',
    upgradesTo: 209,
    "upgradeCost": 6600000,
    type: BuildingType.Residential,
    description: 'Дворец 4'
  },
  {
    id: 209,
    name: 'Дворец 5',
    englishName: 'Palace 19',
    category: 'Жилые',
    price: 6600000,
    buildable: false,
    constructionRequirements: {
      population: 56,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 6
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 14
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 4
        }
      ]
    },
    stats: {
      "populationBonus": 31,
      constructionTimeSeconds: 526848,
      accelerationCost: 153,
      durability: 42000,
      gloryOnExplosion: 330000
    },
    drops: {
      frequent: [
        {
          id: 10033,
          name: 'Черепки',
          amount: 25
        },
        {
          id: 10034,
          name: 'Изумруд',
          amount: 21
        },
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 43
        }
      ],
      rare: [
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 638
        }
      ]
    },
    imageUrl: '/buildings/residential/209.webp',
    upgradesTo: 210,
    "upgradeCost": 7000000,
    type: BuildingType.Residential,
    description: 'Дворец 5'
  },
  {
    id: 210,
    name: 'Дворец 6',
    englishName: 'Palace 20',
    category: 'Жилые',
    price: 7000000,
    buildable: false,
    constructionRequirements: {
      population: 57,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 6
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 15
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 4
        }
      ]
    },
    stats: {
      "populationBonus": 32,
      constructionTimeSeconds: 555579,
      accelerationCost: 157,
      durability: 43992,
      gloryOnExplosion: 350000
    },
    drops: {
      frequent: [
        {
          id: 10026,
          name: 'Золото',
          amount: 77
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 26
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 184
        }
      ],
      rare: [
        {
          id: 10034,
          name: 'Изумруд',
          amount: 332
        }
      ]
    },
    imageUrl: '/buildings/residential/210.webp',
    upgradesTo: 211,
    "upgradeCost": 7400000,
    type: BuildingType.Residential,
    description: 'Дворец 6'
  },
  {
    id: 211,
    name: 'Дворец 7',
    englishName: 'Palace 21',
    category: 'Жилые',
    price: 7400000,
    buildable: false,
    constructionRequirements: {
      population: 59,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 7
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 16
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 4
        }
      ]
    },
    stats: {
      "populationBonus": 33,
      constructionTimeSeconds: 616137,
      accelerationCost: 165,
      durability: 45976,
      gloryOnExplosion: 370000
    },
    drops: {
      frequent: [
        {
          id: 10026,
          name: 'Золото',
          amount: 84
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 27
        },
        {
          id: 10042,
          name: '??????',
          amount: 44
        }
      ],
      rare: [
        {
          id: 10043,
          name: 'Суператомная бомба',
          amount: 49
        }
      ]
    },
    imageUrl: '/buildings/residential/211.webp',
    upgradesTo: 212,
    "upgradeCost": 7800000,
    type: BuildingType.Residential,
    description: 'Дворец 7'
  },
  {
    id: 212,
    name: 'Дворец 8',
    englishName: 'Palace 22',
    category: 'Жилые',
    price: 7800000,
    buildable: false,
    constructionRequirements: {
      population: 60,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 7
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 17
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 4
        }
      ]
    },
    stats: {
      "populationBonus": 34,
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 47960,
      gloryOnExplosion: 390000
    },
    drops: {
      frequent: [
        {
          id: 10033,
          name: 'Черепки',
          amount: 28
        },
        {
          id: 10042,
          name: '??????',
          amount: 48
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 84
        }
      ],
      rare: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 3120
        }
      ]
    },
    imageUrl: '/buildings/residential/212.webp',
    upgradesTo: 213,
    "upgradeCost": 8000000,
    type: BuildingType.Residential,
    description: 'Дворец 8'
  },
  {
    id: 213,
    name: 'Дворец 9',
    englishName: 'Palace 23',
    category: 'Жилые',
    price: 8000000,
    buildable: false,
    constructionRequirements: {
      population: 61,
      resources: [
        {
          id: 10026,
          name: 'Золото',
          amount: 7
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 17
        },
        {
          id: 10030,
          name: 'Цветок подсолнуха',
          amount: 4
        }
      ]
    },
    stats: {
      "populationBonus": 35,
      constructionTimeSeconds: 680943,
      accelerationCost: 174,
      durability: 49328,
      gloryOnExplosion: 400000
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 220
        },
        {
          id: 10033,
          name: 'Черепки',
          amount: 29
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 88
        }
      ],
      rare: [
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 880
        }
      ]
    },
    imageUrl: '/buildings/residential/213.webp',
    type: BuildingType.Residential,
    description: 'Дворец 9'
  },
  {
    id: 241,
    name: 'Репка 2',
    englishName: 'Turnip 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500
    },
    drops: {
      frequent: [{"id":10018,"name":"Яйцо избушки","amount":2},{"id":10041,"name":"Песок","amount":6}],
      rare: [{"id":10045,"name":"Золото","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/241.webp',
  },
  {
    id: 242,
    name: 'Репка 3',
    englishName: 'Turnip 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":2},{"id":10018,"name":"Яйцо избушки","amount":2}],
      rare: [{"id":10006,"name":"Стальной лист","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/242.webp',
  },
  {
    id: 243,
    name: 'Репка 4',
    englishName: 'Turnip 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":2},{"id":10024,"name":"Супер лилия","amount":4}],
      rare: [{"id":10044,"name":"Самородок","amount":4}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/243.webp',
  },
  {
    id: 244,
    name: 'Репка 5',
    englishName: 'Turnip 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500
    },
    drops: {
      frequent: [{"id":10020,"name":"Супер гриб","amount":2},{"id":10024,"name":"Супер лилия","amount":4}],
      rare: [{"id":10023,"name":"Сталь","amount":4}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/244.webp',
  },
  {
    id: 245,
    name: 'Репка 6',
    englishName: 'Turnip 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":2},{"id":10020,"name":"Супер гриб","amount":2}],
      rare: [{"id":10045,"name":"Золото","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/245.webp',
  },
  {
    id: 246,
    name: 'Репка 7',
    englishName: 'Turnip 7',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500
    },
    drops: {
      frequent: [{"id":10005,"name":"Камни","amount":31},{"id":10041,"name":"Песок","amount":6}],
      rare: [{"id":10006,"name":"Стальной лист","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/246.webp',
  },
  {
    id: 247,
    name: 'Репка 8',
    englishName: 'Turnip 8',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500
    },
    drops: {
      frequent: [{"id":10018,"name":"Яйцо избушки","amount":2},{"id":10041,"name":"Песок","amount":6}],
      rare: [{"id":10044,"name":"Самородок","amount":4}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/247.webp',
  },
  {
    id: 248,
    name: 'Репка 9',
    englishName: 'Turnip 9',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 1500
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":2},{"id":10018,"name":"Яйцо избушки","amount":2}],
      rare: [{"id":10023,"name":"Сталь","amount":4}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/248.webp',
  },
  {
    id: 249,
    name: 'Репка 10',
    englishName: 'Turnip 10',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 8
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":2},{"id":10024,"name":"Супер лилия","amount":4}],
      rare: [{"id":10045,"name":"Золото","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/turnip/249.webp',
  },
  {
    id: 251,
    name: 'Супер репка 1',
    englishName: 'Super turnip 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 2000
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":2},{"id":10020,"name":"Супер гриб","amount":2}],
      rare: [{"id":10044,"name":"Самородок","amount":4}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/251.webp',
  },
  {
    id: 252,
    name: 'Супер репка 2',
    englishName: 'Super turnip 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 2000
    },
    drops: {
      frequent: [{"id":10005,"name":"Камни","amount":31},{"id":10041,"name":"Песок","amount":6}],
      rare: [{"id":10023,"name":"Сталь","amount":4}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/252.webp',
  },
  {
    id: 253,
    name: 'Супер репка 3',
    englishName: 'Super turnip 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 2000
    },
    drops: {
      frequent: [{"id":10018,"name":"Яйцо избушки","amount":2},{"id":10041,"name":"Песок","amount":6}],
      rare: [{"id":10045,"name":"Золото","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/253.webp',
  },
  {
    id: 254,
    name: 'Супер репка 4',
    englishName: 'Super turnip 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 2000
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":2},{"id":10018,"name":"Яйцо избушки","amount":2}],
      rare: [{"id":10006,"name":"Стальной лист","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/254.webp',
  },
  {
    id: 255,
    name: 'Супер репка 5',
    englishName: 'Super turnip 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 2000
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":2},{"id":10024,"name":"Супер лилия","amount":4}],
      rare: [{"id":10044,"name":"Самородок","amount":4}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/255.webp',
  },
  {
    id: 256,
    name: 'Супер репка 6',
    englishName: 'Super turnip 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 2000
    },
    drops: {
      frequent: [{"id":10020,"name":"Супер гриб","amount":2},{"id":10024,"name":"Супер лилия","amount":4}],
      rare: [{"id":10023,"name":"Сталь","amount":4}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/256.webp',
  },
  {
    id: 257,
    name: 'Супер репка 7',
    englishName: 'Super turnip 7',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 2000
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":2},{"id":10020,"name":"Супер гриб","amount":2}],
      rare: [{"id":10045,"name":"Золото","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/257.webp',
  },
  {
    id: 258,
    name: 'Супер репка 8',
    englishName: 'Super turnip 8',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 1592,
      gloryOnExplosion: 1250,
      takesPopulation: 7,
      workTimeSeconds: 2000
    },
    drops: {
      frequent: [{"id":10005,"name":"Камни","amount":31},{"id":10041,"name":"Песок","amount":6}],
      rare: [{"id":10006,"name":"Стальной лист","amount":2}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/258.webp',
  },
  {
    id: 259,
    name: 'Супер репка 9',
    englishName: 'Super turnip 9',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 5920,
      gloryOnExplosion: 1250,
      takesPopulation: 13,
      workTimeSeconds: 3,
      produces: [{"id":10021,"name":"Куски супер репки","amount":1}]
    },
    drops: {
      frequent: [{"id":10016,"name":"Атомная бомба","amount":2},{"id":10017,"name":"Яйцо Горыныча","amount":4}],
      rare: [{"id":10034,"name":"Изумруд","amount":7}]
    },
    description: 'Грядка для выращивания репки.',
    imageUrl: '/buildings/garden_beds/turnip/super_turnip/259.webp',
  },
  {
    id: 275,
    name: 'Пшеница 2',
    englishName: 'Wheat 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":4},{"id":10024,"name":"Супер тыква","amount":4}],
      rare: [{"id":10034,"name":"Изумруд","amount":2}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/275.webp',
  },
  {
    id: 276,
    name: 'Пшеница 3',
    englishName: 'Wheat 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":6},{"id":10024,"name":"Супер лилия","amount":12}],
      rare: [{"id":10006,"name":"Стальной лист","amount":5}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/276.webp',
  },
  {
    id: 277,
    name: 'Пшеница 4',
    englishName: 'Wheat 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10012,"name":"MGM-52 «Ланс»","amount":2},{"id":10024,"name":"Супер лилия","amount":12}],
      rare: [{"id":10044,"name":"Самородок","amount":11}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/277.webp',
  },
  {
    id: 278,
    name: 'Пшеница 5',
    englishName: 'Wheat 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10012,"name":"MGM-52 «Ланс»","amount":2},{"id":10020,"name":"Супер гриб","amount":6}],
      rare: [{"id":10036,"name":"Изумрудная руда","amount":3}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/278.webp',
  },
  {
    id: 279,
    name: 'Пшеница 6',
    englishName: 'Wheat 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10011,"name":"Садовая супер бомба","amount":2},{"id":10020,"name":"Супер гриб","amount":6}],
      rare: [{"id":10034,"name":"Изумруд","amount":2}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/279.webp',
  },
  {
    id: 280,
    name: 'Пшеница 7',
    englishName: 'Wheat 7',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":4},{"id":10011,"name":"Садовая супер бомба","amount":2}],
      rare: [{"id":10006,"name":"Стальной лист","amount":5}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/280.webp',
  },
  {
    id: 281,
    name: 'Пшеница 8',
    englishName: 'Wheat 8',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":4},{"id":10024,"name":"Супер тыква","amount":4}],
      rare: [{"id":10044,"name":"Самородок","amount":11}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/281.webp',
  },
  {
    id: 282,
    name: 'Пшеница 9',
    englishName: 'Wheat 9',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":6},{"id":10024,"name":"Супер лилия","amount":12}],
      rare: [{"id":10036,"name":"Изумрудная руда","amount":3}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/282.webp',
  },
  {
    id: 283,
    name: 'Пшеница 10',
    englishName: 'Wheat 10',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10012,"name":"MGM-52 «Ланс»","amount":2},{"id":10024,"name":"Супер лилия","amount":12}],
      rare: [{"id":10034,"name":"Изумруд","amount":2}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/283.webp',
  },
  {
    id: 284,
    name: 'Пшеница 11',
    englishName: 'Wheat 11',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 2400
    },
    drops: {
      frequent: [{"id":10012,"name":"MGM-52 «Ланс»","amount":2},{"id":10020,"name":"Супер гриб","amount":6}],
      rare: [{"id":10006,"name":"Стальной лист","amount":5}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/284.webp',
  },
  {
    id: 285,
    name: 'Пшеница 12',
    englishName: 'Wheat 12',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 9
    },
    drops: {
      frequent: [{"id":10011,"name":"Садовая супер бомба","amount":2},{"id":10020,"name":"Супер гриб","amount":6}],
      rare: [{"id":10044,"name":"Самородок","amount":11}]
    },
    description: 'Грядка для выращивания пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/wheat/285.webp',
  },
  {
    id: 286,
    name: 'Гигантская пшеница 1',
    englishName: 'Giant wheat 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":4},{"id":10011,"name":"Садовая супер бомба","amount":2}],
      rare: [{"id":10036,"name":"Изумрудная руда","amount":3}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/286.webp',
  },
  {
    id: 287,
    name: 'Гигантская пшеница 2',
    englishName: 'Giant wheat 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":4},{"id":10024,"name":"Супер тыква","amount":4}],
      rare: [{"id":10034,"name":"Изумруд","amount":2}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/287.webp',
  },
  {
    id: 288,
    name: 'Гигантская пшеница 3',
    englishName: 'Giant wheat 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":6},{"id":10024,"name":"Супер лилия","amount":12}],
      rare: [{"id":10006,"name":"Стальной лист","amount":5}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/288.webp',
  },
  {
    id: 289,
    name: 'Гигантская пшеница 4',
    englishName: 'Giant wheat 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10012,"name":"MGM-52 «Ланс»","amount":2},{"id":10024,"name":"Супер лилия","amount":12}],
      rare: [{"id":10044,"name":"Самородок","amount":11}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/289.webp',
  },
  {
    id: 290,
    name: 'Гигантская пшеница 5',
    englishName: 'Giant wheat 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10012,"name":"MGM-52 «Ланс»","amount":2},{"id":10020,"name":"Супер гриб","amount":6}],
      rare: [{"id":10036,"name":"Изумрудная руда","amount":3}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/290.webp',
  },
  {
    id: 291,
    name: 'Гигантская пшеница 6',
    englishName: 'Giant wheat 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10011,"name":"Садовая супер бомба","amount":2},{"id":10020,"name":"Супер гриб","amount":6}],
      rare: [{"id":10034,"name":"Изумруд","amount":2}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/291.webp',
  },
  {
    id: 292,
    name: 'Гигантская пшеница 7',
    englishName: 'Giant wheat 7',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":4},{"id":10011,"name":"Садовая супер бомба","amount":2}],
      rare: [{"id":10006,"name":"Стальной лист","amount":5}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/292.webp',
  },
  {
    id: 293,
    name: 'Гигантская пшеница 8',
    englishName: 'Giant wheat 8',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10003,"name":"????? ????? ?????","amount":4},{"id":10024,"name":"Супер тыква","amount":4}],
      rare: [{"id":10044,"name":"Самородок","amount":11}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/293.webp',
  },
  {
    id: 294,
    name: 'Гигантская пшеница 9',
    englishName: 'Giant wheat 9',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 2848,
      gloryOnExplosion: 4000,
      takesPopulation: 9,
      workTimeSeconds: 3400
    },
    drops: {
      frequent: [{"id":10040,"name":"Детонатор","amount":6},{"id":10024,"name":"Супер лилия","amount":12}],
      rare: [{"id":10036,"name":"Изумрудная руда","amount":3}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/294.webp',
  },
  {
    id: 295,
    name: 'Гигантская пшеница 10',
    englishName: 'Giant wheat 10',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 6264,
      gloryOnExplosion: 4000,
      takesPopulation: 14,
      workTimeSeconds: 3,
      produces: [{"id":10050,"name":"Супер пшеница","amount":1}]
    },
    drops: {
      frequent: [{"id":10016,"name":"Атомная бомба","amount":3},{"id":10017,"name":"Яйцо Горыныча","amount":5}],
      rare: [{"id":10034,"name":"Изумруд","amount":7}]
    },
    description: 'Грядка для выращивания гигантской пшеницы.',
    imageUrl: '/buildings/garden_beds/wheat/giant_wheat/295.webp',
  },
  {
    id: 314,
    name: 'Подсолнух 2',
    englishName: 'Sunflower 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 4272,
      gloryOnExplosion: 9000,
      takesPopulation: 11,
      workTimeSeconds: 4000
    },
    drops: {
      frequent: [{"id":10016,"name":"Атомная бомба","amount":2},{"id":10019,"name":"Супер репка","amount":2}],
      rare: [{"id":10036,"name":"Изумрудная руда","amount":7}]
    },
    description: 'Грядка для выращивания подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/sunflower/314.webp',
  },
  {
    id: 315,
    name: 'Подсолнух 3',
    englishName: 'Sunflower 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 4272,
      gloryOnExplosion: 9000,
      takesPopulation: 11,
      workTimeSeconds: 4000
    },
    drops: {
      frequent: [{"id":10017,"name":"Яйцо Горыныча","amount":2},{"id":10019,"name":"Супер репка","amount":2}],
      rare: [{"id":10034,"name":"Изумруд","amount":4}]
    },
    description: 'Грядка для выращивания подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/sunflower/315.webp',
  },
  {
    id: 316,
    name: 'Подсолнух 4',
    englishName: 'Sunflower 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 4272,
      gloryOnExplosion: 9000,
      takesPopulation: 11,
      workTimeSeconds: 4000
    },
    drops: {
      frequent: [{"id":10005,"name":"Железная руда","amount":10},{"id":10017,"name":"Яйцо Горыныча","amount":2}],
      rare: [{"id":10006,"name":"Стальной лист","amount":10}]
    },
    description: 'Грядка для выращивания подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/sunflower/316.webp',
  },
  {
    id: 317,
    name: 'Подсолнух 5',
    englishName: 'Sunflower 5',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 4272,
      gloryOnExplosion: 9000,
      takesPopulation: 11,
      workTimeSeconds: 4000
    },
    drops: {
      frequent: [{"id":10005,"name":"Железная руда","amount":10},{"id":10023,"name":"Сталь","amount":2}],
      rare: [{"id":10044,"name":"Самородок","amount":25}]
    },
    description: 'Грядка для выращивания подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/sunflower/317.webp',
  },
  {
    id: 318,
    name: 'Подсолнух 6',
    englishName: 'Sunflower 6',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 4272,
      gloryOnExplosion: 9000,
      takesPopulation: 11,
      workTimeSeconds: 8
    },
    drops: {
      frequent: [{"id":10050,"name":"Супер пшеница","amount":2},{"id":10024,"name":"Супер тыква","amount":8}],
      rare: [{"id":10036,"name":"Изумрудная руда","amount":7}]
    },
    description: 'Грядка для выращивания подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/sunflower/318.webp',
  },
  {
    id: 320,
    name: 'Супер подсолнух 1',
    englishName: 'Super sunflower 1',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 4272,
      gloryOnExplosion: 9000,
      takesPopulation: 11,
      workTimeSeconds: 6000
    },
    drops: {
      frequent: [{"id":10016,"name":"Атомная бомба","amount":2},{"id":10019,"name":"Супер репка","amount":2}],
      rare: [{"id":10006,"name":"Стальной лист","amount":10}]
    },
    description: 'Грядка для выращивания супер подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/super_sunflower/320.webp',
  },
  {
    id: 321,
    name: 'Супер подсолнух 2',
    englishName: 'Super sunflower 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 4272,
      gloryOnExplosion: 9000,
      takesPopulation: 11,
      workTimeSeconds: 6000
    },
    drops: {
      frequent: [{"id":10017,"name":"Яйцо Горыныча","amount":2},{"id":10019,"name":"Супер репка","amount":2}],
      rare: [{"id":10044,"name":"Самородок","amount":25}]
    },
    description: 'Грядка для выращивания супер подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/super_sunflower/321.webp',
  },
  {
    id: 322,
    name: 'Супер подсолнух 3',
    englishName: 'Super sunflower 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 4272,
      gloryOnExplosion: 9000,
      takesPopulation: 11,
      workTimeSeconds: 6000
    },
    drops: {
      frequent: [{"id":10005,"name":"Железная руда","amount":10},{"id":10017,"name":"Яйцо Горыныча","amount":2}],
      rare: [{"id":10036,"name":"Изумрудная руда","amount":7}]
    },
    description: 'Грядка для выращивания супер подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/super_sunflower/322.webp',
  },
  {
    id: 323,
    name: 'Супер подсолнух 4',
    englishName: 'Super sunflower 4',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 180000,
    buildable: false,
    constructionRequirements: { population: 0 },
    stats: {
      constructionTimeSeconds: 0,
      durability: 10504,
      gloryOnExplosion: 9000,
      takesPopulation: 18,
      workTimeSeconds: 5,
      produces: [{"id":10030,"name":"Цветок подсолнуха","amount":10}]
    },
    drops: {
      frequent: [{"id":10044,"name":"Самородок","amount":10},{"id":10036,"name":"Изумрудная руда","amount":3}],
      rare: [{"id":10043,"name":"Суператомная бомба","amount":3}]
    },
    description: 'Грядка для выращивания супер подсолнухов.',
    imageUrl: '/buildings/garden_beds/sunflower/super_sunflower/323.webp',
  },
  {
    id: 391,
    name: 'Лесопилка 3',
    englishName: 'Sawmill 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 24300,
    buildable: false,
    constructionRequirements: {
      population: 12,
      resources: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 64
        },
        {
          id: 10002,
          name: 'Доски',
          amount: 24
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 2246,
      accelerationCost: 10,
      durability: 1776,
      gloryOnExplosion: 1215,
      takesPopulation: 4,
      workTimeSeconds: 636,
      workYieldGold: 50,
      givesCoins: 2268,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 9
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 4.5
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 13
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10017,
          name: 'Детонатор',
          amount: 2
        },
        {
          id: 10007,
          name: 'Яйцо избушки',
          amount: 3
        },
        {
          id: 999,
          name: 'монеты',
          amount: 2268
        }
      ],
      rare: [
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 2
        }
      ]
    },
    description: 'Улучшенная Лесопилка 3. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/391.webp',
    upgradesTo: 392,
    upgradeCost: 76800
  },
  {
    id: 392,
    name: 'Лесопилка 4',
    englishName: 'Sawmill 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 76800,
    buildable: false,
    constructionRequirements: {
      population: 17,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 77
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 1
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 6386,
      accelerationCost: 17,
      durability: 3232,
      gloryOnExplosion: 3840,
      takesPopulation: 6,
      workTimeSeconds: 1156,
      workYieldGold: 50,
      givesCoins: 3788,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 16
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 8
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 20
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10011,
          name: 'Садовая супер бомба',
          amount: 2
        },
        {
          id: 10003,
          name: '????? ????? ?????',
          amount: 7
        },
        {
          id: 999,
          name: 'монеты',
          amount: 3788
        }
      ],
      rare: [
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 6
        }
      ]
    },
    description: 'Улучшенная Лесопилка 4. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/392.webp',
    upgradesTo: 393,
    upgradeCost: 187500
  },
  {
    id: 393,
    name: 'Лесопилка 5',
    englishName: 'Sawmill 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 187500,
    buildable: false,
    constructionRequirements: {
      population: 23,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 188
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 2
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 15817,
      accelerationCost: 27,
      durability: 5208,
      gloryOnExplosion: 9375,
      takesPopulation: 7,
      workTimeSeconds: 2053,
      workYieldGold: 50,
      givesCoins: 7132,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 29
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 12.5
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 29
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10022,
          name: 'Железная руда',
          amount: 14
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 3
        },
        {
          id: 999,
          name: 'монеты',
          amount: 7132
        }
      ],
      rare: [
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 15
        }
      ]
    },
    description: 'Улучшенная Лесопилка 5. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/400.webp',
    upgradesTo: 394,
    upgradeCost: 388800
  },
  {
    id: 394,
    name: 'Лесопилка 6',
    englishName: 'Sawmill 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 388800,
    buildable: false,
    constructionRequirements: {
      population: 30,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 389
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 4
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 35100,
      accelerationCost: 39,
      durability: 7728,
      gloryOnExplosion: 19440,
      takesPopulation: 9,
      workTimeSeconds: 3239,
      workYieldGold: 50,
      givesCoins: 10631,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 47
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 18
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 40
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 6
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 3
        },
        {
          id: 999,
          name: 'монеты',
          amount: 10631
        }
      ],
      rare: [
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 22
        }
      ]
    },
    description: 'Улучшенная Лесопилка 6. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/401.webp',
    upgradesTo: 395,
    upgradeCost: 720300
  },
  {
    id: 395,
    name: 'Лесопилка 7',
    englishName: 'Sawmill 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 720300,
    buildable: false,
    constructionRequirements: {
      population: 37,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 720
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 7
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 65848,
      accelerationCost: 54,
      durability: 10816,
      gloryOnExplosion: 36015,
      takesPopulation: 14,
      workTimeSeconds: 4798,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 72
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 24.5
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 53
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10022,
          name: 'Железная руда',
          amount: 60
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 12
        },
        {
          id: 999,
          name: 'монеты',
          amount: 13538
        }
      ],
      rare: [
        {
          id: 10034,
          name: 'Изумруд',
          amount: 21
        }
      ]
    },
    description: 'Улучшенная Лесопилка 7. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/402.webp',
    upgradesTo: 396,
    upgradeCost: 1228800
  },
  {
    id: 396,
    name: 'Лесопилка 8',
    englishName: 'Sawmill 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1228800,
    buildable: false,
    constructionRequirements: {
      population: 45,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 1229
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 12
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 118462,
      accelerationCost: 73,
      durability: 14512,
      gloryOnExplosion: 61440,
      takesPopulation: 17,
      workTimeSeconds: 6794,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 106
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 32
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 68
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10026,
          name: 'Золото',
          amount: 9
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 20
        },
        {
          id: 999,
          name: 'монеты',
          amount: 13538
        }
      ],
      rare: [
        {
          id: 10043,
          name: 'Суператомная бомба',
          amount: 5
        }
      ]
    },
    description: 'Улучшенная Лесопилка 8. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/403.webp',
    upgradesTo: 397,
    upgradeCost: 1968300
  },
  {
    id: 397,
    name: 'Лесопилка 9',
    englishName: 'Sawmill 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1968300,
    buildable: false,
    constructionRequirements: {
      population: 54,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 1968
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 20
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 4
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 204703,
      accelerationCost: 95,
      durability: 18840,
      gloryOnExplosion: 98415,
      takesPopulation: 23,
      workTimeSeconds: 9205,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 149
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 40.5
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 85
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10026,
          name: 'Золото',
          amount: 15
        },
        {
          id: 10042,
          name: '??????',
          amount: 8
        },
        {
          id: 999,
          name: 'монеты',
          amount: 13538
        }
      ],
      rare: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 482
        }
      ]
    },
    description: 'Улучшенная Лесопилка 9. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/404.webp',
    upgradesTo: 398,
    upgradeCost: 3000000
  },
  {
    id: 398,
    name: 'Лесопилка 10',
    englishName: 'Sawmill 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3000000,
    buildable: false,
    constructionRequirements: {
      population: 63,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 3000
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 30
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 7
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 325061,
      accelerationCost: 120,
      durability: 23832,
      gloryOnExplosion: 150000,
      takesPopulation: 30,
      workTimeSeconds: 12128,
      workYieldGold: 50,
      givesCoins: 13538,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 204
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 50
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 104
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10042,
          name: '??????',
          amount: 12
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 21
        },
        {
          id: 999,
          name: 'монеты',
          amount: 13538
        }
      ],
      rare: [
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 206
        }
      ]
    },
    description: 'Улучшенная Лесопилка 10. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/405.webp',
    upgradesTo: 399,
    upgradeCost: 4392300
  },
  {
    id: 399,
    name: 'Лесопилка 11',
    englishName: 'Sawmill 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 4392300,
    buildable: false,
    constructionRequirements: {
      population: 73,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 4392
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 44
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 10
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 505722,
      accelerationCost: 150,
      durability: 29520,
      gloryOnExplosion: 219615,
      takesPopulation: 35,
      workTimeSeconds: 15504,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 270
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 60.5
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 125
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 79
        },
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 22
        },
        {
          id: 999,
          name: 'монеты',
          amount: 20997
        }
      ],
      rare: [
        {
          id: 10034,
          name: 'Изумруд',
          amount: 150
        }
      ]
    },
    description: 'Улучшенная Лесопилка 11. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/406.webp',
    upgradesTo: 453,
    upgradeCost: 6220800
  },
  {
    id: 453,
    name: 'Лесопилка 12',
    englishName: 'Sawmill 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 6220800,
    buildable: false,
    constructionRequirements: {
      population: 84,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 9331
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 93
        },
        {
          id: 10026,
          name: 'Золото',
          amount: 8
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 20
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 770515,
      accelerationCost: 185,
      durability: 35928,
      gloryOnExplosion: 311040,
      takesPopulation: 43,
      workTimeSeconds: 19391,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 349
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 72
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 148
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 117
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 47
        },
        {
          id: 999,
          name: 'монеты',
          amount: 20997
        }
      ],
      rare: [
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 467
        }
      ]
    },
    description: 'Улучшенная Лесопилка уровень. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/453.webp',
    upgradesTo: 454,
    upgradeCost: 8568300
  },
  {
    id: 454,
    name: 'Лесопилка 13',
    englishName: 'Sawmill 13',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 8568300,
    buildable: false,
    constructionRequirements: {
      population: 95,
      resources: [
        {
          id: 10002,
          name: 'Доски',
          amount: 12852
        },
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 129
        },
        {
          id: 10026,
          name: 'Золото',
          amount: 12
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 28
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 1114587,
      accelerationCost: 223,
      durability: 43080,
      gloryOnExplosion: 428415,
      takesPopulation: 49,
      workTimeSeconds: 23837,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 443
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 84.5
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 173
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 168
        },
        {
          id: 10036,
          name: 'Изумрудная руда',
          amount: 45
        },
        {
          id: 999,
          name: 'монеты',
          amount: 20997
        }
      ],
      rare: [
        {
          id: 10034,
          name: 'Изумруд',
          amount: 319
        }
      ]
    },
    description: 'Улучшенная Лесопилка уровень. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/454.webp',
    upgradesTo: 468,
    upgradeCost: 11524800
  },
  {
    id: 468,
    name: 'Лесопилка 14',
    englishName: 'Sawmill 14',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 11524800,
    buildable: false,
    constructionRequirements: {
      population: 107,
      resources: [
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 173
        },
        {
          id: 10026,
          name: 'Золото',
          amount: 16
        },
        {
          id: 10034,
          name: 'Изумруд',
          amount: 5
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 38
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 1592555,
      accelerationCost: 266,
      durability: 51008,
      gloryOnExplosion: 576240,
      takesPopulation: 58,
      workTimeSeconds: 28827,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 552
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 98
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 200
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10026,
          name: 'Золото',
          amount: 103
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 247
        },
        {
          id: 999,
          name: 'монеты',
          amount: 20997
        }
      ],
      rare: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 3529
        }
      ]
    },
    description: 'Улучшенная Лесопилка уровень. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/468.webp',
    upgradesTo: 470,
    upgradeCost: 15187500
  },
  {
    id: 470,
    name: 'Лесопилка 15',
    englishName: 'Sawmill 15',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 15187500,
    buildable: false,
    constructionRequirements: {
      population: 120,
      resources: [
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 228
        },
        {
          id: 10026,
          name: 'Золото',
          amount: 21
        },
        {
          id: 10034,
          name: 'Изумруд',
          amount: 6
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 50
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 2246400,
      accelerationCost: 316,
      durability: 59728,
      gloryOnExplosion: 759375,
      takesPopulation: 69,
      workTimeSeconds: 34437,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 679
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 112.5
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 229
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10042,
          name: '??????',
          amount: 75
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 130
        },
        {
          id: 999,
          name: 'монеты',
          amount: 20997
        }
      ],
      rare: [
        {
          id: 10034,
          name: 'Изумруд',
          amount: 612
        }
      ]
    },
    description: 'Улучшенная Лесопилка уровень. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/factories/Лесопилка 1 - Sawmill 1/470.webp',
    upgradesTo: 471,
    upgradeCost: 19660800
  },
  {
    id: 471,
    name: 'Лесопилка 16',
    englishName: 'Sawmill 16',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 19660800,
    buildable: false,
    constructionRequirements: {
      population: 133,
      resources: [
        {
          id: 10035,
          name: 'Элитная древесина',
          amount: 295
        },
        {
          id: 10026,
          name: 'Золото',
          amount: 27
        },
        {
          id: 10034,
          name: 'Изумруд',
          amount: 8
        },
        {
          id: 10023,
          name: 'Сталь',
          amount: 64
        }
      ]
    },
    stats: {
      constructionTimeSeconds: 3058428,
      accelerationCost: 369,
      durability: 69264,
      gloryOnExplosion: 983040,
      takesPopulation: 76,
      workTimeSeconds: 40623,
      workYieldGold: 50,
      givesCoins: 20997,
      produces: [
        {
          id: 10002,
          name: 'Доски',
          amount: 823
        }
      ],
      sometimesProduces: [
        {
          id: 10035,
          name: 'Элитная древесина',
          chance: 128
        }
      ],
      consumes: [
        {
          id: 10001,
          name: 'Дерево',
          amount: 260
        }
      ]
    },
    drops: {
      frequent: [
        {
          id: 10044,
          name: 'Самородок',
          amount: 434
        },
        {
          id: 10040,
          name: 'Стальной лист',
          amount: 174
        },
        {
          id: 999,
          name: 'монеты',
          amount: 20997
        }
      ],
      rare: [
        {
          id: 10043,
          name: 'Суператомная бомба',
          amount: 110
        }
      ]
    },
    description: 'Улучшенная Лесопилка уровень. Производит доски и добывает элитную древесину.',
    imageUrl: '/buildings/Пушка - Сannon/385.webp'
  },
  {
    "id": 365,
    "name": "Пушка 3",
    "englishName": "Cannon 3",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 32400,
    "buildable": false,
    "constructionRequirements": {
      "population": 12,
      "resources": [
        {
          "id": 10001,
          "name": "Дерево",
          "amount": 85
        },
        {
          "id": 10002,
          "name": "Доски",
          "amount": 32
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 41760,
      "accelerationCost": 43,
      "durability": 838,
      "gloryOnExplosion": 1620,
      "damage": "3",
      "workTimeSeconds": 5,
      "givesCoins": 2268
    },
    "drops": {
      "frequent": [
        {
          "id": 10035,
          "name": "Элитная древесина",
          "amount": 2
        },
        {
          "id": 10004, "name": "Куски супер тыквы",
          "amount": 2
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 2268
        }
      ],
      "rare": [
        {
          "id": 10040,
          "name": "Стальной лист",
          "amount": 3
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/365.webp',
    "upgradesTo": 366,
    "upgradeCost": 102400
  },
  {
    "id": 366,
    "name": "Пушка 4",
    "englishName": "Cannon 4",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 102400,
    "buildable": false,
    "constructionRequirements": {
      "population": 17,
      "resources": [
        {
          "id": 10001,
          "name": "Дерево",
          "amount": 269
        },
        {
          "id": 10002,
          "name": "Доски",
          "amount": 102
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 108460,
      "accelerationCost": 69,
      "durability": 1462,
      "gloryOnExplosion": 5120,
      "damage": "4",
      "workTimeSeconds": 5,
      "givesCoins": 4775
    },
    "drops": {
      "frequent": [
        {
          "id": 10011,
          "name": "Садовая супер бомба",
          "amount": 3
        },
        {
          "id": 10003,
          "name": "????? ????? ?????",
          "amount": 9
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 4775
        }
      ],
      "rare": [
        {
          "id": 10036,
          "name": "Изумрудная руда",
          "amount": 5
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/366.webp',
    "upgradesTo": 367,
    "upgradeCost": 250000
  },
  {
    "id": 367,
    "name": "Пушка 5",
    "englishName": "Cannon 5",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 250000,
    "buildable": false,
    "constructionRequirements": {
      "population": 23,
      "resources": [
        {
          "id": 10002,
          "name": "Доски",
          "amount": 250
        },
        {
          "id": 10005, "name": "Камни",
          "amount": 69
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 1
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 257140,
      "accelerationCost": 107,
      "durability": 2305,
      "gloryOnExplosion": 12500,
      "damage": "5",
      "workTimeSeconds": 5,
      "givesCoins": 7853
    },
    "drops": {
      "frequent": [
        {
          "id": 10016,
          "name": "Атомная бомба",
          "amount": 2
        },
        {
          "id": 10018, "name": "Яйцо Горыныча",
          "amount": 4
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 7853
        }
      ],
      "rare": [
        {
          "id": 10034,
          "name": "Изумруд",
          "amount": 6
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/367.webp',
    "upgradesTo": 368,
    "upgradeCost": 518400
  },
  {
    "id": 368,
    "name": "Пушка 6",
    "englishName": "Cannon 6",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 518400,
    "buildable": false,
    "constructionRequirements": {
      "population": 30,
      "resources": [
        {
          "id": 10002,
          "name": "Доски",
          "amount": 518
        },
        {
          "id": 10005, "name": "Камни",
          "amount": 144
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 1
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 558000,
      "accelerationCost": 157,
      "durability": 3379,
      "gloryOnExplosion": 25920,
      "damage": "6",
      "workTimeSeconds": 5,
      "givesCoins": 10631
    },
    "drops": {
      "frequent": [
        {
          "id": 10026,
          "name": "Золото",
          "amount": 4
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 8
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 10631
        }
      ],
      "rare": [
        {
          "id": 10044,
          "name": "Самородок",
          "amount": 104
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/368.webp',
    "upgradesTo": 369,
    "upgradeCost": 960400
  },
  {
    "id": 369,
    "name": "Пушка 7",
    "englishName": "Cannon 7",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 960400,
    "buildable": false,
    "constructionRequirements": {
      "population": 37,
      "resources": [
        {
          "id": 10006, "name": "Каменные блоки",
          "amount": 96
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 2
        },
        {
          "id": 10024, "name": "Супер лилия",
          "amount": 32
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 1035260,
      "accelerationCost": 215,
      "durability": 4699,
      "gloryOnExplosion": 48020,
      "damage": "7",
      "workTimeSeconds": 5,
      "givesCoins": 13538
    },
    "drops": {
      "frequent": [
        {
          "id": 10042,
          "name": "??????",
          "amount": 4
        },
        {
          "id": 10040,
          "name": "Стальной лист",
          "amount": 6
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 13538
        }
      ],
      "rare": [
        {
          "id": 10036,
          "name": "Изумрудная руда",
          "amount": 55
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/369.webp',
    "upgradesTo": 370,
    "upgradeCost": 1638400
  },
  {
    "id": 370,
    "name": "Пушка 8",
    "englishName": "Cannon 8",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 1638400,
    "buildable": false,
    "constructionRequirements": {
      "population": 45,
      "resources": [
        {
          "id": 10006, "name": "Каменные блоки",
          "amount": 164
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 4
        },
        {
          "id": 10024, "name": "Супер лилия",
          "amount": 55
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 1849500,
      "accelerationCost": 287,
      "durability": 6283,
      "gloryOnExplosion": 81920,
      "damage": "8",
      "workTimeSeconds": 5,
      "givesCoins": 13538
    },
    "drops": {
      "frequent": [
        {
          "id": 10044,
          "name": "Самородок",
          "amount": 25
        },
        {
          "id": 10040,
          "name": "Стальной лист",
          "amount": 10
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 13538
        }
      ],
      "rare": [
        {
          "id": 10034,
          "name": "Изумруд",
          "amount": 47
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/370.webp',
    "upgradesTo": 382,
    "upgradeCost": 2624400
  },
  {
    "id": 382,
    "name": "Пушка 9",
    "englishName": "Cannon 9",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 2624400,
    "buildable": false,
    "constructionRequirements": {
      "population": 54,
      "resources": [
        {
          "id": 10002,
          "name": "Доски",
          "amount": 2624
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 6
        },
        {
          "id": 10003,
          "name": "????? ????? ?????",
          "amount": 39
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 3181680,
      "accelerationCost": 376,
      "durability": 8140,
      "gloryOnExplosion": 131220,
      "damage": "9",
      "workTimeSeconds": 5,
      "givesCoins": 13538
    },
    "drops": {
      "frequent": [
        {
          "id": 10044,
          "name": "Самородок",
          "amount": 42
        },
        {
          "id": 10040,
          "name": "Стальной лист",
          "amount": 17
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 13538
        }
      ],
      "rare": [
        {
          "id": 10034,
          "name": "Изумруд",
          "amount": 79
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/382.webp',
    "upgradesTo": 383,
    "upgradeCost": 4000000
  },
  {
    "id": 383,
    "name": "Пушка 10",
    "englishName": "Cannon 10",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 4000000,
    "buildable": false,
    "constructionRequirements": {
      "population": 63,
      "resources": [
        {
          "id": 10002,
          "name": "Доски",
          "amount": 4000
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 9
        },
        {
          "id": 10003,
          "name": "????? ????? ?????",
          "amount": 59
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 5038740,
      "accelerationCost": 473,
      "durability": 10282,
      "gloryOnExplosion": 200000,
      "damage": "10",
      "workTimeSeconds": 5,
      "givesCoins": 20997
    },
    "drops": {
      "frequent": [
        {
          "id": 10034,
          "name": "Изумруд",
          "amount": 9
        },
        {
          "id": 10036,
          "name": "Изумрудная руда",
          "amount": 18
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 20997
        }
      ],
      "rare": [
        {
          "id": 10043,
          "name": "Суператомная бомба",
          "amount": 17
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/383.webp',
    "upgradesTo": 384,
    "upgradeCost": 5856400
  },
  {
    "id": 384,
    "name": "Пушка 11",
    "englishName": "Cannon 11",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 5856400,
    "buildable": false,
    "constructionRequirements": {
      "population": 73,
      "resources": [
        {
          "id": 10026,
          "name": "Золото",
          "amount": 5
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 13
        },
        {
          "id": 10004, "name": "Куски супер тыквы",
          "amount": 52
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 5232140,
      "accelerationCost": 590,
      "durability": 12724,
      "gloryOnExplosion": 292820,
      "damage": "11",
      "workTimeSeconds": 5,
      "givesCoins": 20997
    },
    "drops": {
      "frequent": [
        {
          "id": 10026,
          "name": "Золото",
          "amount": 45
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 108
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 20997
        }
      ],
      "rare": [
        {
          "id": 10044,
          "name": "Самородок",
          "amount": 1538
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/384.webp',
    "upgradesTo": 385,
    "upgradeCost": 8294400
  },
  {
    "id": 385,
    "name": "Пушка 12",
    "englishName": "Cannon 12",
    "category": "Защита",
    "type": BuildingType.Default,
    "price": 8294400,
    "buildable": false,
    "constructionRequirements": {
      "population": 84,
      "resources": [
        {
          "id": 10026,
          "name": "Золото",
          "amount": 8
        },
        {
          "id": 10023,
          "name": "Сталь",
          "amount": 18
        },
        {
          "id": 10030, "name": "Цветок подсолнуха",
          "amount": 5
        }
      ]
    },
    "stats": {
      "constructionTimeSeconds": 11904480,
      "accelerationCost": 727,
      "durability": 15478,
      "gloryOnExplosion": 414720,
      "damage": "12",
      "workTimeSeconds": 5,
      "givesCoins": 20997
    },
    "drops": {
      "frequent": [
        {
          "id": 10026,
          "name": "Золото",
          "amount": 67
        },
        {
          "id": 10042,
          "name": "??????",
          "amount": 35
        },
        {
          "id": 999,
          "name": "монеты",
          "amount": 20997
        }
      ],
      "rare": [
        {
          "id": 10036,
          "name": "Изумрудная руда",
          "amount": 609
        }
      ]
    },
        "description": "Оборонительное сооружение. Наносит урон врагам.",
    imageUrl: '/buildings/Пушка - Сannon/385.webp'
  },
  // Egyptian Obelisks 1-20
  {
    "id": 185,
    "name": "Египетский обелиск 1",
    "englishName": "Egyptian obelisk 1",
    "category": "Статуи",
    "type": BuildingType.Default,
    "rubyPrice": 60,
    "buildable": true,
    "constructionRequirements": {
      "population": 1
    },
    "stats": {
      "constructionTimeSeconds": 20,
      "accelerationCost": 1,
      "durability": 7800,
      "gloryOnExplosion": 15000
    },
    "drops": {
      "frequent": [
        { "id": 10003, "name": "????? ????? ?????", "amount": 6, "chance": 80 },
        { "id": 10005, "name": "Стальной лист", "amount": 3, "chance": 70 },
        { "id": 10000, "name": "Монеты", "amount": 10631, "chance": 100 }
      ],
      "rare": [
        { "id": 10020, "name": "Изумрудная руда", "amount": 22, "chance": 20 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/164.webp',
    "upgradesTo": 186,
    "upgradeCost": 90000
  },
  {
    "id": 186,
    "name": "Египетский обелиск 2",
    "englishName": "Egyptian obelisk 2",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 90000,
    "buildable": false,
    "constructionRequirements": {
      "population": 16
    },
    "stats": {
      "constructionTimeSeconds": 12288,
      "accelerationCost": 23,
      "durability": 3152,
      "gloryOnExplosion": 4500
    },
    "drops": {
      "frequent": [
        { "id": 10012, "name": "MGM-52 «Ланс»", "amount": 2, "chance": 60 },
        { "id": 10025, "name": "Супер лилия", "amount": 15, "chance": 70 },
        { "id": 10000, "name": "Монеты", "amount": 3788, "chance": 100 }
      ],
      "rare": [
        { "id": 10020, "name": "Изумрудная руда", "amount": 4, "chance": 20 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/165.webp',
    "upgradesTo": 187,
    "upgradeCost": 100000
  },
  {
    "id": 187,
    "name": "Египетский обелиск 3",
    "englishName": "Egyptian obelisk 3",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 100000,
    "buildable": false,
    "constructionRequirements": {
      "population": 16
    },
    "stats": {
      "constructionTimeSeconds": 12288,
      "accelerationCost": 23,
      "durability": 3464,
      "gloryOnExplosion": 5000
    },
    "drops": {
      "frequent": [
        { "id": 10002, "name": "Элитная древесина", "amount": 6, "chance": 70 },
        { "id": 10011, "name": "Садовая супер бомба", "amount": 3, "chance": 60 },
        { "id": 10000, "name": "Монеты", "amount": 4775, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 3, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/166.webp',
    "upgradesTo": 188,
    "upgradeCost": 110000
  },
  {
    "id": 188,
    "name": "Египетский обелиск 4",
    "englishName": "Egyptian obelisk 4",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 110000,
    "buildable": false,
    "constructionRequirements": {
      "population": 17
    },
    "stats": {
      "constructionTimeSeconds": 14739,
      "accelerationCost": 26,
      "durability": 3768,
      "gloryOnExplosion": 5500
    },
    "drops": {
      "frequent": [
        { "id": 10030, "name": "Супер пшеница", "amount": 2, "chance": 50 },
        { "id": 10031, "name": "Супер тыква", "amount": 6, "chance": 60 },
        { "id": 10000, "name": "Монеты", "amount": 5322, "chance": 100 }
      ],
      "rare": [
        { "id": 10005, "name": "Стальной лист", "amount": 8, "chance": 25 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/167.webp',
    "upgradesTo": 189,
    "upgradeCost": 120000
  },
  {
    "id": 189,
    "name": "Египетский обелиск 5",
    "englishName": "Egyptian obelisk 5",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 120000,
    "buildable": false,
    "constructionRequirements": {
      "population": 18
    },
    "stats": {
      "constructionTimeSeconds": 17496,
      "accelerationCost": 28,
      "durability": 4072,
      "gloryOnExplosion": 6000
    },
    "drops": {
      "frequent": [
        { "id": 10040, "name": "Яйцо Горыныча", "amount": 2, "chance": 40 },
        { "id": 10032, "name": "Супер репка", "amount": 2, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 5839, "chance": 100 }
      ],
      "rare": [
        { "id": 10003, "name": "????? ????? ?????", "amount": 23, "chance": 20 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/168.webp',
    "upgradesTo": 190,
    "upgradeCost": 130000
  },
  {
    "id": 190,
    "name": "Египетский обелиск 6",
    "englishName": "Egyptian obelisk 6",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 130000,
    "buildable": false,
    "constructionRequirements": {
      "population": 18
    },
    "stats": {
      "constructionTimeSeconds": 17496,
      "accelerationCost": 28,
      "durability": 4376,
      "gloryOnExplosion": 6500
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 10, "chance": 70 },
        { "id": 10040, "name": "Яйцо Горыныча", "amount": 3, "chance": 40 },
        { "id": 10000, "name": "Монеты", "amount": 6401, "chance": 100 }
      ],
      "rare": [
        { "id": 10020, "name": "Изумрудная руда", "amount": 7, "chance": 20 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/169.webp',
    "upgradesTo": 191,
    "upgradeCost": 140000
  },
  {
    "id": 191,
    "name": "Египетский обелиск 7",
    "englishName": "Egyptian obelisk 7",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 140000,
    "buildable": false,
    "constructionRequirements": {
      "population": 19
    },
    "stats": {
      "constructionTimeSeconds": 20577,
      "accelerationCost": 30,
      "durability": 4680,
      "gloryOnExplosion": 7000
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 12, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 3, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 6401, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 4, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/170.webp',
    "upgradesTo": 192,
    "upgradeCost": 150000
  },
  {
    "id": 192,
    "name": "Египетский обелиск 8",
    "englishName": "Egyptian obelisk 8",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 150000,
    "buildable": false,
    "constructionRequirements": {
      "population": 19
    },
    "stats": {
      "constructionTimeSeconds": 20577,
      "accelerationCost": 30,
      "durability": 4984,
      "gloryOnExplosion": 7500
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 14, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 4, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 7000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 5, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/171.webp',
    "upgradesTo": 193,
    "upgradeCost": 160000
  },
  {
    "id": 193,
    "name": "Египетский обелиск 9",
    "englishName": "Egyptian obelisk 9",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 160000,
    "buildable": false,
    "constructionRequirements": {
      "population": 20
    },
    "stats": {
      "constructionTimeSeconds": 23500,
      "accelerationCost": 32,
      "durability": 5288,
      "gloryOnExplosion": 8000
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 16, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 5, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 7600, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 6, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/172.webp',
    "upgradesTo": 194,
    "upgradeCost": 170000
  },
  {
    "id": 194,
    "name": "Египетский обелиск 10",
    "englishName": "Egyptian obelisk 10",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 170000,
    "buildable": false,
    "constructionRequirements": {
      "population": 20
    },
    "stats": {
      "constructionTimeSeconds": 23500,
      "accelerationCost": 32,
      "durability": 5592,
      "gloryOnExplosion": 8500
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 18, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 6, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 8200, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 7, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/173.webp',
    "upgradesTo": 195,
    "upgradeCost": 180000
  },
  {
    "id": 195,
    "name": "Египетский обелиск 11",
    "englishName": "Egyptian obelisk 11",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 180000,
    "buildable": false,
    "constructionRequirements": {
      "population": 21
    },
    "stats": {
      "constructionTimeSeconds": 26500,
      "accelerationCost": 34,
      "durability": 5896,
      "gloryOnExplosion": 9000
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 20, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 7, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 8800, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 8, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/174.webp',
    "upgradesTo": 196,
    "upgradeCost": 190000
  },
  {
    "id": 196,
    "name": "Египетский обелиск 12",
    "englishName": "Egyptian obelisk 12",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 190000,
    "buildable": false,
    "constructionRequirements": {
      "population": 21
    },
    "stats": {
      "constructionTimeSeconds": 26500,
      "accelerationCost": 34,
      "durability": 6200,
      "gloryOnExplosion": 9500
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 22, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 8, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 9400, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 9, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/175.webp',
    "upgradesTo": 197,
    "upgradeCost": 200000
  },
  {
    "id": 197,
    "name": "Египетский обелиск 13",
    "englishName": "Egyptian obelisk 13",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 200000,
    "buildable": false,
    "constructionRequirements": {
      "population": 22
    },
    "stats": {
      "constructionTimeSeconds": 29500,
      "accelerationCost": 36,
      "durability": 6504,
      "gloryOnExplosion": 10000
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 24, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 9, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 10000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 10, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/164.webp',
    "upgradesTo": 198,
    "upgradeCost": 220000
  },
  {
    "id": 198,
    "name": "Египетский обелиск 14",
    "englishName": "Egyptian obelisk 14",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 220000,
    "buildable": false,
    "constructionRequirements": {
      "population": 22
    },
    "stats": {
      "constructionTimeSeconds": 29500,
      "accelerationCost": 36,
      "durability": 6808,
      "gloryOnExplosion": 10500
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 26, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 10, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 10600, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 11, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/165.webp',
    "upgradesTo": 199,
    "upgradeCost": 240000
  },
  {
    "id": 199,
    "name": "Египетский обелиск 15",
    "englishName": "Egyptian obelisk 15",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 240000,
    "buildable": false,
    "constructionRequirements": {
      "population": 23
    },
    "stats": {
      "constructionTimeSeconds": 32500,
      "accelerationCost": 38,
      "durability": 7112,
      "gloryOnExplosion": 11000
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 28, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 11, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 11200, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 12, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/166.webp',
    "upgradesTo": 200,
    "upgradeCost": 260000
  },
  {
    "id": 200,
    "name": "Египетский обелиск 16",
    "englishName": "Egyptian obelisk 16",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 260000,
    "buildable": false,
    "constructionRequirements": {
      "population": 23
    },
    "stats": {
      "constructionTimeSeconds": 32500,
      "accelerationCost": 38,
      "durability": 7416,
      "gloryOnExplosion": 11500
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 30, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 12, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 11800, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 13, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/167.webp',
    "upgradesTo": 201,
    "upgradeCost": 280000
  },
  {
    "id": 201,
    "name": "Египетский обелиск 17",
    "englishName": "Egyptian obelisk 17",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 280000,
    "buildable": false,
    "constructionRequirements": {
      "population": 24
    },
    "stats": {
      "constructionTimeSeconds": 35500,
      "accelerationCost": 40,
      "durability": 7720,
      "gloryOnExplosion": 12000
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 32, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 13, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 12400, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 14, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/168.webp',
    "upgradesTo": 202,
    "upgradeCost": 300000
  },
  {
    "id": 202,
    "name": "Египетский обелиск 18",
    "englishName": "Egyptian obelisk 18",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 300000,
    "buildable": false,
    "constructionRequirements": {
      "population": 24
    },
    "stats": {
      "constructionTimeSeconds": 35500,
      "accelerationCost": 40,
      "durability": 8024,
      "gloryOnExplosion": 12500
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 34, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 14, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 13000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 15, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/169.webp',
    "upgradesTo": 203,
    "upgradeCost": 320000
  },
  {
    "id": 203,
    "name": "Египетский обелиск 19",
    "englishName": "Egyptian obelisk 19",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 320000,
    "buildable": false,
    "constructionRequirements": {
      "population": 25
    },
    "stats": {
      "constructionTimeSeconds": 38500,
      "accelerationCost": 42,
      "durability": 8328,
      "gloryOnExplosion": 13000
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 36, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 15, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 13600, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 16, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/170.webp',
    "upgradesTo": 204,
    "upgradeCost": 340000
  },
  {
    "id": 204,
    "name": "Египетский обелиск 20",
    "englishName": "Egyptian obelisk 20",
    "category": "Статуи",
    "type": BuildingType.Default,
    "price": 340000,
    "buildable": false,
    "constructionRequirements": {
      "population": 25
    },
    "stats": {
      "constructionTimeSeconds": 38500,
      "accelerationCost": 42,
      "durability": 8632,
      "gloryOnExplosion": 13500
    },
    "drops": {
      "frequent": [
        { "id": 10004, "name": "Железная руда", "amount": 38, "chance": 70 },
        { "id": 10006, "name": "Сталь", "amount": 16, "chance": 50 },
        { "id": 10000, "name": "Монеты", "amount": 14200, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 17, "chance": 15 }
      ]
    },
        "description": "Древний египетский обелиск. Декоративное сооружение.",
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/171.webp'
  },
  // Obelisk Xm chain (164-175)
  {
    id: 164,
    name: 'Обелиск 1м',
    englishName: 'Obelisk 1m',
    category: 'Статуи',
    type: BuildingType.Default,
    rubyPrice: 70,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 8424,
      gloryOnExplosion: 17500
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 7 },
        { id: 999, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 97 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/164.webp',
    upgradesTo: 165,
    upgradeCost: 50000
  },
  {
    id: 165,
    name: 'Обелиск 2м',
    englishName: 'Obelisk 2m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 50000,
    buildable: false,
    constructionRequirements: {
      population: 14
    },
    stats: {
      constructionTimeSeconds: 8232, // 2 hours 17 minutes 12 seconds
      accelerationCost: 19,
      durability: 2352,
      gloryOnExplosion: 2500
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 4 },
        { id: 10024, name: 'Супер лилия', amount: 8 },
        { id: 999, name: 'Монеты', amount: 2268 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/165.webp',
    upgradesTo: 166,
    upgradeCost: 60000
  },
  {
    id: 166,
    name: 'Обелиск 3м',
    englishName: 'Obelisk 3m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 60000,
    buildable: false,
    constructionRequirements: {
      population: 15
    },
    stats: {
      constructionTimeSeconds: 10125, // 2 hours 48 minutes 45 seconds
      accelerationCost: 21,
      durability: 2680,
      gloryOnExplosion: 3000
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 4 },
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 999, name: 'Монеты', amount: 2735 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 3 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/166.webp',
    upgradesTo: 167,
    upgradeCost: 70000
  },
  {
    id: 167,
    name: 'Обелиск 4м',
    englishName: 'Obelisk 4m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 70000,
    buildable: false,
    constructionRequirements: {
      population: 15
    },
    stats: {
      constructionTimeSeconds: 10125, // 2 hours 48 minutes 45 seconds
      accelerationCost: 21,
      durability: 3008,
      gloryOnExplosion: 3500
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 4 },
        { id: 10004, name: 'Супер тыква', amount: 4 },
        { id: 999, name: 'Монеты', amount: 3260 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 2 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/167.webp',
    upgradesTo: 168,
    upgradeCost: 80000
  },
  {
    id: 168,
    name: 'Обелиск 5м',
    englishName: 'Obelisk 5m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 80000,
    buildable: false,
    constructionRequirements: {
      population: 16
    },
    stats: {
      constructionTimeSeconds: 12288, // 3 hours 24 minutes 48 seconds
      accelerationCost: 23,
      durability: 3328,
      gloryOnExplosion: 4000
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 8 },
        { id: 999, name: 'Монеты', amount: 4775 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 6 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/168.webp',
    upgradesTo: 169,
    upgradeCost: 90000
  },
  {
    id: 169,
    name: 'Обелиск 6м',
    englishName: 'Obelisk 6m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 90000,
    buildable: false,
    constructionRequirements: {
      population: 17
    },
    stats: {
      constructionTimeSeconds: 14739, // 4 hours 5 minutes 39 seconds
      accelerationCost: 26,
      durability: 3640,
      gloryOnExplosion: 4500
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 6 },
        { id: 10011, name: 'Садовая супер бомба', amount: 3 },
        { id: 999, name: 'Монеты', amount: 4775 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 18 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/169.webp',
    upgradesTo: 170,
    upgradeCost: 100000
  },
  {
    id: 170,
    name: 'Обелиск 7м',
    englishName: 'Obelisk 7m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 100000,
    buildable: false,
    constructionRequirements: {
      population: 18
    },
    stats: {
      constructionTimeSeconds: 17496, // 4 hours 51 minutes 36 seconds
      accelerationCost: 28,
      durability: 3960,
      gloryOnExplosion: 5000
    },
    drops: {
      frequent: [
        { id: 10038, name: 'Супер репка', amount: 2 },
        { id: 10004, name: 'Супер тыква', amount: 7 },
        { id: 999, name: 'Монеты', amount: 5839 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 6 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/170.webp',
    upgradesTo: 171,
    upgradeCost: 110000
  },
  {
    id: 171,
    name: 'Обелиск 8м',
    englishName: 'Obelisk 8m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 110000,
    buildable: false,
    constructionRequirements: {
      population: 18
    },
    stats: {
      constructionTimeSeconds: 17496, // 4 hours 51 minutes 36 seconds
      accelerationCost: 28,
      durability: 4272,
      gloryOnExplosion: 5500
    },
    drops: {
      frequent: [
        { id: 10007, name: 'Яйцо Горыныча', amount: 2 },
        { id: 10038, name: 'Супер репка', amount: 2 },
        { id: 999, name: 'Монеты', amount: 6401 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 4 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/171.webp',
    upgradesTo: 172,
    upgradeCost: 120000
  },
  {
    id: 172,
    name: 'Обелиск 9м',
    englishName: 'Obelisk 9m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 120000,
    buildable: false,
    constructionRequirements: {
      population: 19
    },
    stats: {
      constructionTimeSeconds: 20577, // 5 hours 42 minutes 57 seconds
      accelerationCost: 30,
      durability: 4584,
      gloryOnExplosion: 6000
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 11 },
        { id: 10007, name: 'Яйцо Горыныча', amount: 3 },
        { id: 999, name: 'Монеты', amount: 6401 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 12 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/172.webp',
    upgradesTo: 173,
    upgradeCost: 140000
  },
  {
    id: 173,
    name: 'Обелиск 10м',
    englishName: 'Obelisk 10m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 140000,
    buildable: false,
    constructionRequirements: {
      population: 20
    },
    stats: {
      constructionTimeSeconds: 24000, // 6 hours 40 minutes
      accelerationCost: 33,
      durability: 5080,
      gloryOnExplosion: 7000
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 3 },
        { id: 999, name: 'Монеты', amount: 7132 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 35 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/173.webp',
    upgradesTo: 174,
    upgradeCost: 160000
  },
  {
    id: 174,
    name: 'Обелиск 11м',
    englishName: 'Obelisk 11m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 160000,
    buildable: false,
    constructionRequirements: {
      population: 21
    },
    stats: {
      constructionTimeSeconds: 27783, // 7 hours 43 minutes 3 seconds
      accelerationCost: 35,
      durability: 5568,
      gloryOnExplosion: 8000
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба', amount: 2 },
        { id: 10038, name: 'Супер репка', amount: 3 },
        { id: 999, name: 'Монеты', amount: 7853 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 12 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/174.webp',
    upgradesTo: 175,
    upgradeCost: 200000
  },
  {
    id: 175,
    name: 'Обелиск 12м',
    englishName: 'Obelisk 12m',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 200000,
    buildable: false,
    constructionRequirements: {
      population: 22
    },
    stats: {
      constructionTimeSeconds: 31944, // 8 hours 52 minutes 24 seconds
      accelerationCost: 38,
      durability: 6368,
      gloryOnExplosion: 10000
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба', amount: 3 },
        { id: 10007, name: 'Яйцо Горыныча', amount: 5 },
        { id: 999, name: 'Монеты', amount: 7853 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 7 }
      ]
    },
    description: 'Древний египетский обелиск. Декоративное сооружение.',
    imageUrl: '/buildings/Статуи/Обелиск - Obelisk/175.webp'
  },
  // Статуя Гнома Защитника (Gnome Statue Defender) - 20 levels
  {
    id: 48901,
    name: 'Статуя Гнома Защитника',
    englishName: 'Gnome Statue Defender',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1060000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 2120 },
        { id: 10024, name: 'Супер лилия', amount: 71 }
      ],
      population: 28
    },
    stats: {
      constructionTimeSeconds: 560,
      accelerationCost: 5,
      durability: 10368,
      gloryOnExplosion: 53000,
      populationBonus: 0
    },
    upgradesTo: 51101,
    upgradeCost: 1240000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 3 },
        { id: 10006, name: 'Стальной лист', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 39 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать. Помните, монстры обращают внимание только на самую большую статую.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51101,
    name: 'Статуя Гнома Защитника уровень - 2',
    englishName: 'Gnome Statue Defender Level 2',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1240000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1240 },
        { id: 10006, name: 'Каменные блоки', amount: 124 },
        { id: 10024, name: 'Супер лилия', amount: 41 }
      ],
      population: 30
    },
    stats: {
      constructionTimeSeconds: 81000,
      accelerationCost: 60,
      durability: 11712,
      gloryOnExplosion: 62000,
      populationBonus: 0
    },
    upgradesTo: 51201,
    upgradeCost: 1540000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 6 },
        { id: 10005, name: 'Сталь', amount: 13 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 4 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51201,
    name: 'Статуя Гнома Защитника уровень - 3',
    englishName: 'Gnome Statue Defender Level 3',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1540000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1540 },
        { id: 10006, name: 'Каменные блоки', amount: 154 },
        { id: 10024, name: 'Супер лилия', amount: 51 }
      ],
      population: 32
    },
    stats: {
      constructionTimeSeconds: 11904,
      accelerationCost: 66,
      durability: 13584,
      gloryOnExplosion: 77000,
      populationBonus: 0
    },
    upgradesTo: 51301,
    upgradeCost: 1960000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 8 },
        { id: 10015, name: 'Супер детонатор', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 251 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51301,
    name: 'Статуя Гнома Защитника уровень - 4',
    englishName: 'Gnome Statue Defender Level 4',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1960000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 20 },
        { id: 10006, name: 'Каменные блоки', amount: 196 },
        { id: 10023, name: 'Сталь', amount: 4 }
      ],
      population: 35
    },
    stats: {
      constructionTimeSeconds: 42225,
      accelerationCost: 76,
      durability: 15904,
      gloryOnExplosion: 98000,
      populationBonus: 0
    },
    upgradesTo: 51401,
    upgradeCost: 2500000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 6 },
        { id: 10006, name: 'Стальной лист', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 92 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51401,
    name: 'Статуя Гнома Защитника уровень - 5',
    englishName: 'Gnome Statue Defender Level 5',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 2500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 25 },
        { id: 10006, name: 'Каменные блоки', amount: 250 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      population: 38
    },
    stats: {
      constructionTimeSeconds: 78216,
      accelerationCost: 86,
      durability: 18592,
      gloryOnExplosion: 125000,
      populationBonus: 0
    },
    upgradesTo: 51501,
    upgradeCost: 3160000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 32 },
        { id: 10006, name: 'Стальной лист', amount: 13 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 60 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51501,
    name: 'Статуя Гнома Защитника уровень - 6',
    englishName: 'Gnome Statue Defender Level 6',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 3160000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10035, name: 'Элитная древесина', amount: 32 },
        { id: 10006, name: 'Каменные блоки', amount: 316 },
        { id: 10023, name: 'Сталь', amount: 7 }
      ], population: 40 },
    stats: { constructionTimeSeconds: 192000, accelerationCost: 92, durability: 21584, gloryOnExplosion: 158000, populationBonus: 0 },
    upgradesTo: 51601, upgradeCost: 3940000,
    drops: { frequent: [{ id: 10004, name: 'Самородок', amount: 43 }, { id: 10036, name: 'Изумрудная руда', amount: 12 }, { id: 999, name: 'монеты', amount: 13538 }], rare: [{ id: 10043, name: 'Суператомная бомба', amount: 11 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51601,
    name: 'Статуя Гнома Защитника уровень - 7',
    englishName: 'Gnome Statue Defender Level 7',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 3940000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10035, name: 'Элитная древесина', amount: 39 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 9 }
      ], population: 43 },
    stats: { constructionTimeSeconds: 238521, accelerationCost: 103, durability: 24848, gloryOnExplosion: 197000, populationBonus: 0 },
    upgradesTo: 51701, upgradeCost: 4840000,
    drops: { frequent: [{ id: 10003, name: '????? ????? ?????', amount: 314 }, { id: 10005, name: 'Сталь', amount: 59 }, { id: 999, name: 'монеты', amount: 13538 }], rare: [{ id: 10004, name: 'Самородок', amount: 838 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51701,
    name: 'Статуя Гнома Защитника уровень - 8',
    englishName: 'Gnome Statue Defender Level 8',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 4840000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10035, name: 'Элитная древесина', amount: 48 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 11 }
      ], population: 46 },
    stats: { constructionTimeSeconds: 292008, accelerationCost: 114, durability: 28336, gloryOnExplosion: 242000, populationBonus: 0 },
    upgradesTo: 51801, upgradeCost: 5860000,
    drops: { frequent: [{ id: 10002, name: 'Золото', amount: 32 }, { id: 10015, name: 'Супер детонатор', amount: 17 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10036, name: 'Изумрудная руда', amount: 291 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51801,
    name: 'Статуя Гнома Защитника уровень - 9',
    englishName: 'Gnome Statue Defender Level 9',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 5860000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10035, name: 'Элитная древесина', amount: 59 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 13 }
      ], population: 49 },
    stats: { constructionTimeSeconds: 352947, accelerationCost: 125, durability: 32032, gloryOnExplosion: 293000, populationBonus: 0 },
    upgradesTo: 51901, upgradeCost: 7000000,
    drops: { frequent: [{ id: 10015, name: 'Супер детонатор', amount: 22 }, { id: 10006, name: 'Стальной лист', amount: 38 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10037, name: 'Изумруды', amount: 176 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 51901,
    name: 'Статуя Гнома Защитника уровень - 10',
    englishName: 'Gnome Statue Defender Level 10',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 7000000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10035, name: 'Элитная древесина', amount: 70 },
        { id: 10026, name: 'Золото', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 15 }
      ], population: 52 },
    stats: { constructionTimeSeconds: 421824, accelerationCost: 137, durability: 35920, gloryOnExplosion: 350000, populationBonus: 0 },
    upgradesTo: 52001, upgradeCost: 8260000,
    drops: { frequent: [{ id: 10004, name: 'Самородок', amount: 117 }, { id: 10006, name: 'Стальной лист', amount: 47 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10043, name: 'Суператомная бомба', amount: 30 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52001,
    name: 'Статуя Гнома Защитника уровень - 11',
    englishName: 'Gnome Statue Defender Level 11',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 8260000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 11 },
        { id: 10034, name: 'Изумруд', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 27 }
      ], population: 55 },
    stats: { constructionTimeSeconds: 499125, accelerationCost: 149, durability: 39984, gloryOnExplosion: 413000, populationBonus: 0 },
    upgradesTo: 52101, upgradeCost: 9640000,
    drops: { frequent: [{ id: 10004, name: 'Самородок', amount: 145 }, { id: 10036, name: 'Изумрудная руда', amount: 39 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10004, name: 'Самородок', amount: 2169 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52101,
    name: 'Статуя Гнома Защитника уровень - 12',
    englishName: 'Gnome Statue Defender Level 12',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 9640000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 13 },
        { id: 10034, name: 'Изумруд', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 32 }
      ], population: 58 },
    stats: { constructionTimeSeconds: 585336, accelerationCost: 161, durability: 44208, gloryOnExplosion: 482000, populationBonus: 0 },
    upgradesTo: 52201, upgradeCost: 11140000,
    drops: { frequent: [{ id: 10037, name: 'Изумруды', amount: 23 }, { id: 10036, name: 'Изумрудная руда', amount: 48 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10036, name: 'Изумрудная руда', amount: 707 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52201,
    name: 'Статуя Гнома Защитника уровень - 13',
    englishName: 'Gnome Statue Defender Level 13',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 11140000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 15 },
        { id: 10034, name: 'Изумруд', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 36 }
      ], population: 60 },
    stats: { constructionTimeSeconds: 648000, accelerationCost: 170, durability: 48592, gloryOnExplosion: 557000, populationBonus: 0 },
    upgradesTo: 52301, upgradeCost: 12760000,
    drops: { frequent: [{ id: 10002, name: 'Золото', amount: 94 }, { id: 10005, name: 'Сталь', amount: 224 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10037, name: 'Изумруды', amount: 405 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52301,
    name: 'Статуя Гнома Защитника уровень - 14',
    englishName: 'Gnome Statue Defender Level 14',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 12760000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 17 },
        { id: 10034, name: 'Изумруд', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 42 }
      ], population: 63 },
    stats: { constructionTimeSeconds: 750141, accelerationCost: 183, durability: 53128, gloryOnExplosion: 638000, populationBonus: 0 },
    upgradesTo: 52401, upgradeCost: 14500000,
    drops: { frequent: [{ id: 10002, name: 'Золото', amount: 112 }, { id: 10015, name: 'Супер детонатор', amount: 59 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10043, name: 'Суператомная бомба', amount: 65 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52401,
    name: 'Статуя Гнома Защитника уровень - 15',
    englishName: 'Gnome Statue Defender Level 15',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 14500000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 20 },
        { id: 10034, name: 'Изумруд', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 47 }
      ], population: 66 },
    stats: { constructionTimeSeconds: 862488, accelerationCost: 196, durability: 57800, gloryOnExplosion: 725000, populationBonus: 0 },
    upgradesTo: 52501, upgradeCost: 16360000,
    drops: { frequent: [{ id: 10015, name: 'Супер детонатор', amount: 70 }, { id: 10006, name: 'Стальной лист', amount: 121 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10004, name: 'Самородок', amount: 4532 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52501,
    name: 'Статуя Гнома Защитника уровень - 16',
    englishName: 'Gnome Statue Defender Level 16',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 16360000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 22 },
        { id: 10034, name: 'Изумруд', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 53 }
      ], population: 68 },
    stats: { constructionTimeSeconds: 943296, accelerationCost: 205, durability: 62608, gloryOnExplosion: 818000, populationBonus: 0 },
    upgradesTo: 52601, upgradeCost: 18340000,
    drops: { frequent: [{ id: 10004, name: 'Самородок', amount: 355 }, { id: 10006, name: 'Стальной лист', amount: 142 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10036, name: 'Изумрудная руда', amount: 1418 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52601,
    name: 'Статуя Гнома Защитника уровень - 17',
    englishName: 'Gnome Statue Defender Level 17',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 18340000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 25 },
        { id: 10034, name: 'Изумруд', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 60 }
      ], population: 71 },
    stats: { constructionTimeSeconds: 1073733, accelerationCost: 218, durability: 67552, gloryOnExplosion: 917000, populationBonus: 0 },
    upgradesTo: 52701, upgradeCost: 20440000,
    drops: { frequent: [{ id: 10004, name: 'Самородок', amount: 413 }, { id: 10036, name: 'Изумрудная руда', amount: 111 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10037, name: 'Изумруды', amount: 782 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52701,
    name: 'Статуя Гнома Защитника уровень - 18',
    englishName: 'Gnome Statue Defender Level 18',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 20440000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 28 },
        { id: 10034, name: 'Изумруд', amount: 8 },
        { id: 10023, name: 'Сталь', amount: 67 }
      ], population: 74 },
    stats: { constructionTimeSeconds: 1215672, accelerationCost: 232, durability: 72624, gloryOnExplosion: 1022000, populationBonus: 0 },
    upgradesTo: 52801, upgradeCost: 22660000,
    drops: { frequent: [{ id: 10037, name: 'Изумруды', amount: 61 }, { id: 10036, name: 'Изумрудная руда', amount: 128 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10043, name: 'Суператомная бомба', amount: 120 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52801,
    name: 'Статуя Гнома Защитника уровень - 19',
    englishName: 'Gnome Statue Defender Level 19',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 22660000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 31 },
        { id: 10034, name: 'Изумруд', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 74 }
      ], population: 76 },
    stats: { constructionTimeSeconds: 1316928, accelerationCost: 242, durability: 77824, gloryOnExplosion: 1133000, populationBonus: 0 },
    upgradesTo: 52901, upgradeCost: 25000000,
    drops: { frequent: [{ id: 10002, name: 'Золото', amount: 239 }, { id: 10005, name: 'Сталь', amount: 573 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10004, name: 'Самородок', amount: 8215 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/489.webp'
  },
  {
    id: 52901,
    name: 'Статуя Гнома Защитника уровень - 20',
    englishName: 'Gnome Statue Defender Level 20',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 25000000,
    buildable: false,
    constructionRequirements: { resources: [
        { id: 10026, name: 'Золото', amount: 34 },
        { id: 10034, name: 'Изумруд', amount: 10 },
        { id: 10023, name: 'Сталь', amount: 82 }
      ], population: 79 },
    stats: { constructionTimeSeconds: 1479117, accelerationCost: 256, durability: 83136, gloryOnExplosion: 1250000, populationBonus: 0 },
    drops: { frequent: [{ id: 10002, name: 'Золото', amount: 273 }, { id: 10015, name: 'Супер детонатор', amount: 144 }, { id: 999, name: 'монеты', amount: 20997 }], rare: [{ id: 10036, name: 'Изумрудная руда', amount: 2500 }] },
    description: 'Вдохновляет ваших монстров, и они начинают лучше лечить и ремонтировать.', imageUrl: '/buildings/Статуи/Статуя Гнома Защитника уровень/529.webp'
  },
  // Watchtower upgrades 2-4
  {
    "id": 214,
    "name": "Сторожевая башня 2",
    "englishName": "Watchtower 2",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 200000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10033, "name": "Черепок", "amount": 5 }
      ],
      "population": 19
    },
    "stats": {
      "constructionTimeSeconds": 20577,
      "accelerationCost": 30,
      "durability": 4704,
      "gloryOnExplosion": 10000,
      "damage": "10"
    },
    "drops": {
      "frequent": [
        { "id": 10022, "name": "Руда", "amount": 12, "chance": 70 },
        { "id": 10018, "name": "Яйцо Горыныча", "amount": 3, "chance": 60 },
        { "id": 10000, "name": "Монеты", "amount": 6401, "chance": 100 }
      ],
      "rare": [
        { "id": 10020, "name": "Изумрудная руда", "amount": 8, "chance": 20 }
      ]
    },
        "description": "Собирает налоги с сектора, на котором находится.",
    "imageUrl": "/buildings/watchtower/214.webp",
    "upgradesTo": 215,
    "upgradeCost": 300000
  },
  {
    "id": 215,
    "name": "Сторожевая башня 3",
    "englishName": "Watchtower 3",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 300000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10033, "name": "Черепок", "amount": 5 }
      ],
      "population": 22
    },
    "stats": {
      "constructionTimeSeconds": 31944,
      "accelerationCost": 38,
      "durability": 5992,
      "gloryOnExplosion": 15000,
      "damage": "10"
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 2, "chance": 60 },
        { "id": 10040, "name": "Стальной лист", "amount": 2, "chance": 70 },
        { "id": 10000, "name": "Монеты", "amount": 7853, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 7, "chance": 15 }
      ]
    },
        "description": "Собирает налоги с сектора, на котором находится.",
    "imageUrl": "/buildings/watchtower/215.webp",
    "upgradesTo": 216,
    "upgradeCost": 400000
  },
  {
    "id": 216,
    "name": "Сторожевая башня 4",
    "englishName": "Watchtower 4",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 400000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10033, "name": "Черепок", "amount": 5 }
      ],
      "population": 24
    },
    "stats": {
      "constructionTimeSeconds": 41472,
      "accelerationCost": 43,
      "durability": 7184,
      "gloryOnExplosion": 20000,
      "damage": "10"
    },
    "drops": {
      "frequent": [
        { "id": 10022, "name": "Руда", "amount": 27, "chance": 70 },
        { "id": 10000, "name": "Монеты", "amount": 10631, "chance": 100 }
      ],
      "rare": [
        { "id": 10003, "name": "????? ????? ?????", "amount": 70, "chance": 10 }
      ]
    },
        "description": "Собирает налоги с сектора, на котором находится.",
    "imageUrl": "/buildings/watchtower/216.webp"
  },
  // Bandit Castle upgrades 2-15
  {
    "id": 373,
    "name": "Бандитский замок 2",
    "englishName": "Bandit Castle 2",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 105400,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10001, "name": "Дерево", "amount": 92 },
        { "id": 10033, "name": "Черепок", "amount": 2 }
      ],
      "population": 4
    },
    "stats": {
      "constructionTimeSeconds": 186800,
      "accelerationCost": 94,
      "durability": 1004090,
      "gloryOnExplosion": 5270,
      "bandCapacity": 12
    },
    "drops": {
      "frequent": [
        { "id": 10011, "name": "Садовая супер бомба", "amount": 2, "chance": 70 },
        { "id": 10003, "name": "????? ????? ?????", "amount": 7, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 4299, "chance": 100 }
      ],
      "rare": [
        { "id": 10003, "name": "????? ????? ?????", "amount": 15, "chance": 15 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/373.webp',
    "upgradesTo": 374,
    "upgradeCost": 186400
  },
  {
    "id": 374,
    "name": "Бандитский замок 3",
    "englishName": "Bandit Castle 3",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 186400,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10001, "name": "Дерево", "amount": 82 },
        { "id": 10002, "name": "Доски", "amount": 31 },
        { "id": 10033, "name": "Черепок", "amount": 2 }
      ],
      "population": 10
    },
    "stats": {
      "constructionTimeSeconds": 186800,
      "accelerationCost": 94,
      "durability": 1005680,
      "gloryOnExplosion": 9320,
      "bandCapacity": 18
    },
    "drops": {
      "frequent": [
        { "id": 10016, "name": "Атомная бомба «Снежинка»", "amount": 2, "chance": 60 },
        { "id": 10003, "name": "????? ????? ?????", "amount": 2, "chance": 70 },
        { "id": 10000, "name": "Монеты", "amount": 6401, "chance": 100 }
      ],
      "rare": [
        { "id": 10020, "name": "Изумрудная руда", "amount": 8, "chance": 20 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/374.webp',
    "upgradesTo": 375,
    "upgradeCost": 537400
  },
  {
    "id": 375,
    "name": "Бандитский замок 4",
    "englishName": "Bandit Castle 4",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 537400,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10001, "name": "Дерево", "amount": 236 },
        { "id": 10002, "name": "Доски", "amount": 90 },
        { "id": 10033, "name": "Черепок", "amount": 4 }
      ],
      "population": 18
    },
    "stats": {
      "constructionTimeSeconds": 186800,
      "accelerationCost": 94,
      "durability": 1010030,
      "gloryOnExplosion": 26870,
      "bandCapacity": 24
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 3, "chance": 60 },
        { "id": 10039, "name": "?????? ?????", "amount": 2, "chance": 70 },
        { "id": 10000, "name": "Монеты", "amount": 10631, "chance": 100 }
      ],
      "rare": [
        { "id": 10043, "name": "Суператомная бомба", "amount": 2, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/375.webp',
    "upgradesTo": 376,
    "upgradeCost": 1482400
  },
  {
    "id": 376,
    "name": "Бандитский замок 5",
    "englishName": "Bandit Castle 5",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 1482400,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 247 },
        { "id": 10033, "name": "Черепок", "amount": 12 },
        { "id": 10023, "name": "Сталь", "amount": 1 }
      ],
      "population": 28
    },
    "stats": {
      "constructionTimeSeconds": 214720,
      "accelerationCost": 101,
      "durability": 1017290,
      "gloryOnExplosion": 74120,
      "bandCapacity": 30
    },
    "drops": {
      "frequent": [
        { "id": 10003, "name": "????? ????? ?????", "amount": 18, "chance": 70 },
        { "id": 10040, "name": "Стальной лист", "amount": 7, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10003, "name": "????? ????? ?????", "amount": 260, "chance": 5 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/376.webp',
    "upgradesTo": 377,
    "upgradeCost": 3475000
  },
  {
    "id": 377,
    "name": "Бандитский замок 6",
    "englishName": "Bandit Castle 6",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 3475000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 579 },
        { "id": 10033, "name": "Черепок", "amount": 29 },
        { "id": 10023, "name": "Сталь", "amount": 1 }
      ],
      "population": 40
    },
    "stats": {
      "constructionTimeSeconds": 328000,
      "accelerationCost": 121,
      "durability": 1027400,
      "gloryOnExplosion": 173750,
      "bandCapacity": 36
    },
    "drops": {
      "frequent": [
        { "id": 10003, "name": "????? ????? ?????", "amount": 44, "chance": 70 },
        { "id": 10020, "name": "Изумрудная руда", "amount": 12, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10020, "name": "Изумрудная руда", "amount": 174, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/377.webp',
    "upgradesTo": 378,
    "upgradeCost": 7098400
  },
  {
    "id": 378,
    "name": "Бандитский замок 7",
    "englishName": "Bandit Castle 7",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 7098400,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 1183 },
        { "id": 10033, "name": "Черепок", "amount": 59 },
        { "id": 10023, "name": "Сталь", "amount": 3 }
      ],
      "population": 54
    },
    "stats": {
      "constructionTimeSeconds": 444180,
      "accelerationCost": 141,
      "durability": 1040440,
      "gloryOnExplosion": 354920,
      "bandCapacity": 42
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 42, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 99, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 20997, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 180, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/378.webp',
    "upgradesTo": 379,
    "upgradeCost": 15000000
  },
  {
    "id": 379,
    "name": "Бандитский замок 8",
    "englishName": "Bandit Castle 8",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 15000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 1500 },
        { "id": 10033, "name": "Черепок", "amount": 80 },
        { "id": 10023, "name": "Сталь", "amount": 5 }
      ],
      "population": 68
    },
    "stats": {
      "constructionTimeSeconds": 500000,
      "accelerationCost": 160,
      "durability": 1055000,
      "gloryOnExplosion": 500000,
      "bandCapacity": 48
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 50, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 120, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 25000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 200, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/379.webp',
    "upgradesTo": 380,
    "upgradeCost": 30000000
  },
  {
    "id": 380,
    "name": "Бандитский замок 9",
    "englishName": "Bandit Castle 9",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 30000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 2000 },
        { "id": 10033, "name": "Черепок", "amount": 100 },
        { "id": 10023, "name": "Сталь", "amount": 8 }
      ],
      "population": 82
    },
    "stats": {
      "constructionTimeSeconds": 600000,
      "accelerationCost": 180,
      "durability": 1070000,
      "gloryOnExplosion": 700000,
      "bandCapacity": 54
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 60, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 150, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 30000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 250, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/380.webp',
    "upgradesTo": 386,
    "upgradeCost": 50000000
  },
  {
    "id": 386,
    "name": "Бандитский замок 10",
    "englishName": "Bandit Castle 10",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 50000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 2500 },
        { "id": 10033, "name": "Черепок", "amount": 120 },
        { "id": 10023, "name": "Сталь", "amount": 10 }
      ],
      "population": 96
    },
    "stats": {
      "constructionTimeSeconds": 700000,
      "accelerationCost": 200,
      "durability": 1085000,
      "gloryOnExplosion": 900000,
      "bandCapacity": 60
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 70, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 180, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 35000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 300, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/386.webp',
    "upgradesTo": 387,
    "upgradeCost": 75000000
  },
  {
    "id": 387,
    "name": "Бандитский замок 11",
    "englishName": "Bandit Castle 11",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 75000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 3000 },
        { "id": 10033, "name": "Черепок", "amount": 140 },
        { "id": 10023, "name": "Сталь", "amount": 12 }
      ],
      "population": 110
    },
    "stats": {
      "constructionTimeSeconds": 800000,
      "accelerationCost": 220,
      "durability": 1100000,
      "gloryOnExplosion": 1100000,
      "bandCapacity": 66
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 80, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 200, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 40000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 350, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/387.webp',
    "upgradesTo": 388,
    "upgradeCost": 100000000
  },
  {
    "id": 388,
    "name": "Бандитский замок 12",
    "englishName": "Bandit Castle 12",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 100000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 3500 },
        { "id": 10033, "name": "Черепок", "amount": 160 },
        { "id": 10023, "name": "Сталь", "amount": 15 }
      ],
      "population": 124
    },
    "stats": {
      "constructionTimeSeconds": 900000,
      "accelerationCost": 240,
      "durability": 1115000,
      "gloryOnExplosion": 1300000,
      "bandCapacity": 72
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 90, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 220, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 45000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 400, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/388.webp',
    "upgradesTo": 389,
    "upgradeCost": 150000000
  },
  {
    "id": 389,
    "name": "Бандитский замок 13",
    "englishName": "Bandit Castle 13",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 150000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 4000 },
        { "id": 10033, "name": "Черепок", "amount": 180 },
        { "id": 10023, "name": "Сталь", "amount": 18 }
      ],
      "population": 138
    },
    "stats": {
      "constructionTimeSeconds": 1000000,
      "accelerationCost": 260,
      "durability": 1130000,
      "gloryOnExplosion": 1500000,
      "bandCapacity": 78
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 100, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 250, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 50000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 450, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/389.webp',
    "upgradesTo": 415,
    "upgradeCost": 200000000
  },
  {
    "id": 415,
    "name": "Бандитский замок 14",
    "englishName": "Bandit Castle 14",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 200000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 4500 },
        { "id": 10033, "name": "Черепок", "amount": 200 },
        { "id": 10023, "name": "Сталь", "amount": 20 }
      ],
      "population": 152
    },
    "stats": {
      "constructionTimeSeconds": 1100000,
      "accelerationCost": 280,
      "durability": 1145000,
      "gloryOnExplosion": 1700000,
      "bandCapacity": 84
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 110, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 280, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 55000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 500, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/415.webp',
    "upgradesTo": 416,
    "upgradeCost": 250000000
  },
  {
    "id": 416,
    "name": "Бандитский замок 15",
    "englishName": "Bandit Castle 15",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 250000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 5000 },
        { "id": 10033, "name": "Черепок", "amount": 220 },
        { "id": 10023, "name": "Сталь", "amount": 25 }
      ],
      "population": 166
    },
    "stats": {
      "constructionTimeSeconds": 1200000,
      "accelerationCost": 300,
      "durability": 1160000,
      "gloryOnExplosion": 2000000,
      "bandCapacity": 90
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 120, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 300, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 60000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 550, "chance": 10 }
      ]
    },
        "description": "Замок нужен для создания клана. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.",
    "imageUrl": '/buildings/bandit_castle/416.webp',
    "upgradesTo": 451,
    "upgradeCost": 300000000
  },
  {
    "id": 451,
    "name": "Бандитский замок 16",
    "englishName": "Bandit Castle 16",
    "category": "Клан",
    "type": BuildingType.Default,
    "price": 300000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 5500 },
        { "id": 10033, "name": "Черепок", "amount": 250 },
        { "id": 10023, "name": "Сталь", "amount": 30 }
      ],
      "population": 180
    },
    "stats": {
      "constructionTimeSeconds": 1300000,
      "accelerationCost": 320,
      "durability": 1175000,
      "gloryOnExplosion": 2500000,
      "bandCapacity": 100
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 130, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 350, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 70000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 600, "chance": 10 }
      ]
    },
        "description": "Максимальный уровень замка для вашего клана.",
    "imageUrl": '/buildings/bandit_castle/451.webp'
  },
  // Stone Crusher upgrades 2-16
  {
    "id": 4091,
    "name": "Камнедробилка 2",
    "englishName": "Stone Crusher 2",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 400000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 400 },
        { "id": 10006, "name": "Каменные блоки", "amount": 40 }
      ],
      "population": 7
    },
    "stats": {
      "constructionTimeSeconds": 343,
      "accelerationCost": 4,
      "durability": 6704,
      "gloryOnExplosion": 20000,
      "takesPopulation": 11,
      "workTimeSeconds": 1083,
      "workYieldGold": 50,
      "givesCoins": 9707,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 7 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 0.5, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 14 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 4 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10022, "name": "Руда", "amount": 23, "chance": 70 },
        { "id": 10000, "name": "Монеты", "amount": 9707, "chance": 100 }
      ],
      "rare": [
        { "id": 10020, "name": "Изумрудная руда", "amount": 17, "chance": 20 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/409.webp",
    "upgradesTo": 410,
    "upgradeCost": 900000
  },
  {
    "id": 410,
    "name": "Камнедробилка 3",
    "englishName": "Stone Crusher 3",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 900000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 900 },
        { "id": 10006, "name": "Каменные блоки", "amount": 90 }
      ],
      "population": 12
    },
    "stats": {
      "constructionTimeSeconds": 1728,
      "accelerationCost": 9,
      "durability": 10408,
      "gloryOnExplosion": 45000,
      "takesPopulation": 13,
      "workTimeSeconds": 861,
      "workYieldGold": 50,
      "givesCoins": 13538,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 9 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 1.13, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 19 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 9 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 5, "chance": 60 },
        { "id": 10039, "name": "?????? ?????", "amount": 3, "chance": 70 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 19, "chance": 15 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/410.webp",
    "upgradesTo": 411,
    "upgradeCost": 1600000
  },
  {
    "id": 411,
    "name": "Камнедробилка 4",
    "englishName": "Stone Crusher 4",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 1600000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 16 },
        { "id": 10006, "name": "Каменные блоки", "amount": 160 },
        { "id": 10023, "name": "Сталь", "amount": 3 }
      ],
      "population": 17
    },
    "stats": {
      "constructionTimeSeconds": 4913,
      "accelerationCost": 15,
      "durability": 14416,
      "gloryOnExplosion": 80000,
      "takesPopulation": 15,
      "workTimeSeconds": 1836,
      "workYieldGold": 50,
      "givesCoins": 13538,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 14 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 2, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 26 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 16 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10039, "name": "?????? ?????", "amount": 5, "chance": 70 },
        { "id": 10040, "name": "Стальной лист", "amount": 8, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10043, "name": "Суператомная бомба", "amount": 5, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/411.webp",
    "upgradesTo": 412,
    "upgradeCost": 2500000
  },
  {
    "id": 412,
    "name": "Камнедробилка 5",
    "englishName": "Stone Crusher 5",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 2500000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 25 },
        { "id": 10006, "name": "Каменные блоки", "amount": 250 },
        { "id": 10023, "name": "Сталь", "amount": 5 }
      ],
      "population": 23
    },
    "stats": {
      "constructionTimeSeconds": 12167,
      "accelerationCost": 23,
      "durability": 18680,
      "gloryOnExplosion": 125000,
      "takesPopulation": 17,
      "workTimeSeconds": 3265,
      "workYieldGold": 50,
      "givesCoins": 13538,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 21 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 3.13, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 35 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 25 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 32, "chance": 70 },
        { "id": 10040, "name": "Стальной лист", "amount": 13, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10044, "name": "Самородок", "amount": 474, "chance": 5 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/412.webp",
    "upgradesTo": 455,
    "upgradeCost": 3600000
  },
  {
    "id": 455,
    "name": "Камнедробилка 6",
    "englishName": "Stone Crusher 6",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 3600000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 36 },
        { "id": 10006, "name": "Каменные блоки", "amount": 360 },
        { "id": 10023, "name": "Сталь", "amount": 8 }
      ],
      "population": 30
    },
    "stats": {
      "constructionTimeSeconds": 27000,
      "accelerationCost": 35,
      "durability": 23216,
      "gloryOnExplosion": 180000,
      "takesPopulation": 22,
      "workTimeSeconds": 5989,
      "workYieldGold": 50,
      "givesCoins": 13538,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 33 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 4.5, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 46 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 36 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 49, "chance": 70 },
        { "id": 10020, "name": "Изумрудная руда", "amount": 13, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10043, "name": "Суператомная бомба", "amount": 13, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/456.webp",
    "upgradesTo": 456,
    "upgradeCost": 4900000
  },
  {
    "id": 456,
    "name": "Камнедробилка 7",
    "englishName": "Stone Crusher 7",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 4900000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 49 },
        { "id": 10006, "name": "Каменные блоки", "amount": 490 },
        { "id": 10023, "name": "Сталь", "amount": 11 }
      ],
      "population": 37
    },
    "stats": {
      "constructionTimeSeconds": 50653,
      "accelerationCost": 47,
      "durability": 27984,
      "gloryOnExplosion": 245000,
      "takesPopulation": 29,
      "workTimeSeconds": 9241,
      "workYieldGold": 50,
      "givesCoins": 20997,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 48 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 6.13, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 59 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 49 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 31, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 75, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 20997, "chance": 100 }
      ],
      "rare": [
        { "id": 10044, "name": "Самородок", "amount": 1062, "chance": 5 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/457.webp",
    "upgradesTo": 457,
    "upgradeCost": 6500000
  },
  {
    "id": 457,
    "name": "Камнедробилка 8",
    "englishName": "Stone Crusher 8",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 6500000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 65 },
        { "id": 10006, "name": "Каменные блоки", "amount": 650 },
        { "id": 10023, "name": "Сталь", "amount": 15 }
      ],
      "population": 45
    },
    "stats": {
      "constructionTimeSeconds": 80000,
      "accelerationCost": 60,
      "durability": 33000,
      "gloryOnExplosion": 320000,
      "takesPopulation": 35,
      "workTimeSeconds": 14000,
      "workYieldGold": 50,
      "givesCoins": 25000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 65 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 8, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 75 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 65 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 40, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 100, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 25000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 200, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/458.webp",
    "upgradesTo": 458,
    "upgradeCost": 8500000
  },
  {
    "id": 458,
    "name": "Камнедробилка 9",
    "englishName": "Stone Crusher 9",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 8500000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 85 },
        { "id": 10006, "name": "Каменные блоки", "amount": 850 },
        { "id": 10023, "name": "Сталь", "amount": 20 }
      ],
      "population": 55
    },
    "stats": {
      "constructionTimeSeconds": 120000,
      "accelerationCost": 75,
      "durability": 38500,
      "gloryOnExplosion": 400000,
      "takesPopulation": 42,
      "workTimeSeconds": 20000,
      "workYieldGold": 50,
      "givesCoins": 30000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 85 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 10, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 95 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 85 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 50, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 130, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 30000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 250, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/459.webp",
    "upgradesTo": 459,
    "upgradeCost": 11000000
  },
  {
    "id": 459,
    "name": "Камнедробилка 10",
    "englishName": "Stone Crusher 10",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 11000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 110 },
        { "id": 10006, "name": "Каменные блоки", "amount": 1100 },
        { "id": 10023, "name": "Сталь", "amount": 25 }
      ],
      "population": 65
    },
    "stats": {
      "constructionTimeSeconds": 170000,
      "accelerationCost": 90,
      "durability": 44000,
      "gloryOnExplosion": 500000,
      "takesPopulation": 50,
      "workTimeSeconds": 28000,
      "workYieldGold": 50,
      "givesCoins": 35000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 110 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 12, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 120 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 110 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 60, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 160, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 35000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 300, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/460.webp",
    "upgradesTo": 460,
    "upgradeCost": 14000000
  },
  {
    "id": 460,
    "name": "Камнедробилка 11",
    "englishName": "Stone Crusher 11",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 14000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 140 },
        { "id": 10006, "name": "Каменные блоки", "amount": 1400 },
        { "id": 10023, "name": "Сталь", "amount": 30 }
      ],
      "population": 75
    },
    "stats": {
      "constructionTimeSeconds": 220000,
      "accelerationCost": 105,
      "durability": 50000,
      "gloryOnExplosion": 600000,
      "takesPopulation": 58,
      "workTimeSeconds": 36000,
      "workYieldGold": 50,
      "givesCoins": 40000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 140 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 14, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 150 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 140 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 70, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 190, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 40000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 350, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/461.webp",
    "upgradesTo": 461,
    "upgradeCost": 18000000
  },
  {
    "id": 461,
    "name": "Камнедробилка 12",
    "englishName": "Stone Crusher 12",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 18000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 180 },
        { "id": 10006, "name": "Каменные блоки", "amount": 1800 },
        { "id": 10023, "name": "Сталь", "amount": 38 }
      ],
      "population": 85
    },
    "stats": {
      "constructionTimeSeconds": 280000,
      "accelerationCost": 120,
      "durability": 56000,
      "gloryOnExplosion": 720000,
      "takesPopulation": 65,
      "workTimeSeconds": 45000,
      "workYieldGold": 50,
      "givesCoins": 45000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 180 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 16, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 180 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 180 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 80, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 220, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 45000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 400, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/462.webp",
    "upgradesTo": 462,
    "upgradeCost": 22000000
  },
  {
    "id": 462,
    "name": "Камнедробилка 13",
    "englishName": "Stone Crusher 13",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 22000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 220 },
        { "id": 10006, "name": "Каменные блоки", "amount": 2200 },
        { "id": 10023, "name": "Сталь", "amount": 45 }
      ],
      "population": 95
    },
    "stats": {
      "constructionTimeSeconds": 340000,
      "accelerationCost": 135,
      "durability": 62000,
      "gloryOnExplosion": 850000,
      "takesPopulation": 72,
      "workTimeSeconds": 55000,
      "workYieldGold": 50,
      "givesCoins": 50000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 220 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 18, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 220 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 220 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 90, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 250, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 50000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 450, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/463.webp",
    "upgradesTo": 463,
    "upgradeCost": 28000000
  },
  {
    "id": 463,
    "name": "Камнедробилка 14",
    "englishName": "Stone Crusher 14",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 28000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 280 },
        { "id": 10006, "name": "Каменные блоки", "amount": 2800 },
        { "id": 10023, "name": "Сталь", "amount": 55 }
      ],
      "population": 105
    },
    "stats": {
      "constructionTimeSeconds": 400000,
      "accelerationCost": 150,
      "durability": 68000,
      "gloryOnExplosion": 1000000,
      "takesPopulation": 80,
      "workTimeSeconds": 66000,
      "workYieldGold": 50,
      "givesCoins": 55000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 280 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 20, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 260 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 280 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 100, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 280, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 55000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 500, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/464.webp",
    "upgradesTo": 464,
    "upgradeCost": 35000000
  },
  {
    "id": 464,
    "name": "Камнедробилка 15",
    "englishName": "Stone Crusher 15",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 35000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 350 },
        { "id": 10006, "name": "Каменные блоки", "amount": 3500 },
        { "id": 10023, "name": "Сталь", "amount": 65 }
      ],
      "population": 115
    },
    "stats": {
      "constructionTimeSeconds": 470000,
      "accelerationCost": 165,
      "durability": 75000,
      "gloryOnExplosion": 1200000,
      "takesPopulation": 88,
      "workTimeSeconds": 78000,
      "workYieldGold": 50,
      "givesCoins": 60000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 350 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 22, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 310 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 350 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 110, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 320, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 60000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 550, "chance": 10 }
      ]
    },
        "description": "Дробит камни в каменные блоки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/465.webp",
    "upgradesTo": 465,
    "upgradeCost": 42000000
  },
  {
    "id": 465,
    "name": "Камнедробилка 16",
    "englishName": "Stone Crusher 16",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 42000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 420 },
        { "id": 10006, "name": "Каменные блоки", "amount": 4200 },
        { "id": 10023, "name": "Сталь", "amount": 75 }
      ],
      "population": 125
    },
    "stats": {
      "constructionTimeSeconds": 540000,
      "accelerationCost": 180,
      "durability": 82000,
      "gloryOnExplosion": 1400000,
      "takesPopulation": 95,
      "workTimeSeconds": 90000,
      "workYieldGold": 50,
      "givesCoins": 70000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 420 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 25, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 360 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 420 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 120, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 360, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 70000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 600, "chance": 10 }
      ]
    },
        "description": "Максимальный уровень камнедробилки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/466.webp",
    "upgradesTo": 466,
    "upgradeCost": 50000000
  },
  {
    "id": 466,
    "name": "Камнедробилка 17",
    "englishName": "Stone Crusher 17",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 50000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 500 },
        { "id": 10006, "name": "Каменные блоки", "amount": 5000 },
        { "id": 10023, "name": "Сталь", "amount": 90 }
      ],
      "population": 135
    },
    "stats": {
      "constructionTimeSeconds": 620000,
      "accelerationCost": 200,
      "durability": 90000,
      "gloryOnExplosion": 1600000,
      "takesPopulation": 105,
      "workTimeSeconds": 100000,
      "workYieldGold": 50,
      "givesCoins": 80000,
      "produces": [
        { "id": 10006, "name": "Каменные блоки", "amount": 500 }
      ],
      "sometimesProduces": [
        { "id": 10044, "name": "Самородок", "chance": 28, "amount": 1 }
      ],
      "consumes": [
        { "id": 10005, "name": "Камни", "amount": 420 },
        { "id": 10009, "name": "Канистра с бензином", "amount": 500 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 130, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 400, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 80000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 650, "chance": 10 }
      ]
    },
        "description": "Максимальный уровень камнедробилки.",
    "imageUrl": "/buildings/Заводы/Камнедробилка - Stone crusher/467.webp"
  },
  // Emerald Factory upgrades 2-21
  {
    "id": 641,
    "name": "Изумрудный завод 2",
    "englishName": "Emerald Factory 2",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 5400000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 5400 },
        { "id": 10006, "name": "Каменные блоки", "amount": 540 }
      ],
      "population": 86
    },
    "stats": {
      "constructionTimeSeconds": 186416,
      "accelerationCost": 94,
      "durability": 18336,
      "gloryOnExplosion": 270000,
      "takesPopulation": 17,
      "workTimeSeconds": 12649,
      "workYieldGold": 50,
      "givesCoins": 13538,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 1 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 25 },
        { "id": 10021, "name": "Куски супер репки", "amount": 2 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 4 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 31, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 9, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10036, "name": "Изумрудная руда", "amount": 122, "chance": 10 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/640.webp",
    "upgradesTo": 642,
    "upgradeCost": 5900000
  },
  {
    "id": 642,
    "name": "Изумрудный завод 3",
    "englishName": "Emerald Factory 3",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 5900000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10002, "name": "Доски", "amount": 5900 },
        { "id": 10006, "name": "Каменные блоки", "amount": 590 }
      ],
      "population": 95
    },
    "stats": {
      "constructionTimeSeconds": 263212,
      "accelerationCost": 108,
      "durability": 23304,
      "gloryOnExplosion": 295000,
      "takesPopulation": 19,
      "workTimeSeconds": 12649,
      "workYieldGold": 50,
      "givesCoins": 13538,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 2 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 35 },
        { "id": 10021, "name": "Куски супер репки", "amount": 2 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 5 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10022, "name": "Руда", "amount": 276, "chance": 70 },
        { "id": 10023, "name": "Сталь", "amount": 52, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 94, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/640.webp",
    "upgradesTo": 643,
    "upgradeCost": 6600000
  },
  {
    "id": 643,
    "name": "Изумрудный завод 4",
    "englishName": "Emerald Factory 4",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 6600000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 66 },
        { "id": 10006, "name": "Каменные блоки", "amount": 660 },
        { "id": 10023, "name": "Сталь", "amount": 14 }
      ],
      "population": 93
    },
    "stats": {
      "constructionTimeSeconds": 255707,
      "accelerationCost": 105,
      "durability": 22728,
      "gloryOnExplosion": 330000,
      "takesPopulation": 19,
      "workTimeSeconds": 16865,
      "workYieldGold": 50,
      "givesCoins": 13538,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 2 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 45 },
        { "id": 10021, "name": "Куски супер репки", "amount": 3 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 6 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10026, "name": "Золото", "amount": 21, "chance": 60 },
        { "id": 10023, "name": "Сталь", "amount": 49, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 13538, "chance": 100 }
      ],
      "rare": [
        { "id": 10043, "name": "Суператомная бомба", "amount": 12, "chance": 10 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/640.webp",
    "upgradesTo": 644,
    "upgradeCost": 7500000
  },
  {
    "id": 644,
    "name": "Изумрудный завод 5",
    "englishName": "Emerald Factory 5",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 7500000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 75 },
        { "id": 10006, "name": "Каменные блоки", "amount": 750 },
        { "id": 10023, "name": "Сталь", "amount": 16 }
      ],
      "population": 102
    },
    "stats": {
      "constructionTimeSeconds": 322762,
      "accelerationCost": 120,
      "durability": 28552,
      "gloryOnExplosion": 375000,
      "takesPopulation": 21,
      "workTimeSeconds": 21081,
      "workYieldGold": 50,
      "givesCoins": 20997,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 3 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 55 },
        { "id": 10021, "name": "Куски супер репки", "amount": 3 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 7 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10039, "name": "?????? ?????", "amount": 17, "chance": 70 },
        { "id": 10040, "name": "Стальной лист", "amount": 30, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 20997, "chance": 100 }
      ],
      "rare": [
        { "id": 10044, "name": "Самородок", "amount": 1106, "chance": 5 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/640.webp",
    "upgradesTo": 645,
    "upgradeCost": 8600000
  },
  {
    "id": 645,
    "name": "Изумрудный завод 6",
    "englishName": "Emerald Factory 6",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 8600000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 86 },
        { "id": 10006, "name": "Каменные блоки", "amount": 860 },
        { "id": 10023, "name": "Сталь", "amount": 19 }
      ],
      "population": 104
    },
    "stats": {
      "constructionTimeSeconds": 343459,
      "accelerationCost": 124,
      "durability": 29168,
      "gloryOnExplosion": 430000,
      "takesPopulation": 25,
      "workTimeSeconds": 25298,
      "workYieldGold": 50,
      "givesCoins": 20997,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 3 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 65 },
        { "id": 10021, "name": "Куски супер репки", "amount": 4 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 8 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 77, "chance": 70 },
        { "id": 10040, "name": "Стальной лист", "amount": 31, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 20997, "chance": 100 }
      ],
      "rare": [
        { "id": 10036, "name": "Изумрудная руда", "amount": 308, "chance": 10 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/645.webp",
    "upgradesTo": 646,
    "upgradeCost": 9900000
  },
  {
    "id": 646,
    "name": "Изумрудный завод 7",
    "englishName": "Emerald Factory 7",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 9900000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 99 },
        { "id": 10026, "name": "Золото", "amount": 9 },
        { "id": 10023, "name": "Сталь", "amount": 22 }
      ],
      "population": 111
    },
    "stats": {
      "constructionTimeSeconds": 420689,
      "accelerationCost": 136,
      "durability": 35536,
      "gloryOnExplosion": 495000,
      "takesPopulation": 33,
      "workTimeSeconds": 29514,
      "workYieldGold": 50,
      "givesCoins": 20997,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 4 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 75 },
        { "id": 10021, "name": "Куски супер репки", "amount": 4 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 9 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 115, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 31, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 20997, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 217, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/645.webp",
    "upgradesTo": 647,
    "upgradeCost": 11500000
  },
  {
    "id": 647,
    "name": "Изумрудный завод 8",
    "englishName": "Emerald Factory 8",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 11500000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 115 },
        { "id": 10026, "name": "Золото", "amount": 12 },
        { "id": 10023, "name": "Сталь", "amount": 26 }
      ],
      "population": 120
    },
    "stats": {
      "constructionTimeSeconds": 500000,
      "accelerationCost": 150,
      "durability": 42000,
      "gloryOnExplosion": 570000,
      "takesPopulation": 40,
      "workTimeSeconds": 34000,
      "workYieldGold": 50,
      "givesCoins": 25000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 5 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 90 },
        { "id": 10021, "name": "Куски супер репки", "amount": 5 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 10 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 140, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 40, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 25000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 260, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/645.webp",
    "upgradesTo": 648,
    "upgradeCost": 13500000
  },
  {
    "id": 648,
    "name": "Изумрудный завод 9",
    "englishName": "Emerald Factory 9",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 13500000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 135 },
        { "id": 10026, "name": "Золото", "amount": 15 },
        { "id": 10023, "name": "Сталь", "amount": 30 }
      ],
      "population": 130
    },
    "stats": {
      "constructionTimeSeconds": 580000,
      "accelerationCost": 165,
      "durability": 49000,
      "gloryOnExplosion": 650000,
      "takesPopulation": 48,
      "workTimeSeconds": 39000,
      "workYieldGold": 50,
      "givesCoins": 30000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 6 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 105 },
        { "id": 10021, "name": "Куски супер репки", "amount": 6 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 12 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 170, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 50, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 30000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 310, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/645.webp",
    "upgradesTo": 649,
    "upgradeCost": 16000000
  },
  {
    "id": 649,
    "name": "Изумрудный завод 10",
    "englishName": "Emerald Factory 10",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 16000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 160 },
        { "id": 10026, "name": "Золото", "amount": 18 },
        { "id": 10023, "name": "Сталь", "amount": 35 }
      ],
      "population": 140
    },
    "stats": {
      "constructionTimeSeconds": 660000,
      "accelerationCost": 180,
      "durability": 56000,
      "gloryOnExplosion": 740000,
      "takesPopulation": 55,
      "workTimeSeconds": 45000,
      "workYieldGold": 50,
      "givesCoins": 35000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 7 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 120 },
        { "id": 10021, "name": "Куски супер репки", "amount": 7 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 14 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 200, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 60, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 35000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 360, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/645.webp",
    "upgradesTo": 650,
    "upgradeCost": 19000000
  },
  {
    "id": 650,
    "name": "Изумрудный завод 11",
    "englishName": "Emerald Factory 11",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 19000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 190 },
        { "id": 10026, "name": "Золото", "amount": 22 },
        { "id": 10023, "name": "Сталь", "amount": 40 }
      ],
      "population": 150
    },
    "stats": {
      "constructionTimeSeconds": 740000,
      "accelerationCost": 195,
      "durability": 63000,
      "gloryOnExplosion": 840000,
      "takesPopulation": 62,
      "workTimeSeconds": 51000,
      "workYieldGold": 50,
      "givesCoins": 40000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 8 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 140 },
        { "id": 10021, "name": "Куски супер репки", "amount": 8 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 16 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 230, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 70, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 40000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 410, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/650.webp",
    "upgradesTo": 651,
    "upgradeCost": 22000000
  },
  {
    "id": 651,
    "name": "Изумрудный завод 12",
    "englishName": "Emerald Factory 12",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 22000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 220 },
        { "id": 10026, "name": "Золото", "amount": 26 },
        { "id": 10023, "name": "Сталь", "amount": 48 }
      ],
      "population": 160
    },
    "stats": {
      "constructionTimeSeconds": 820000,
      "accelerationCost": 210,
      "durability": 71000,
      "gloryOnExplosion": 950000,
      "takesPopulation": 70,
      "workTimeSeconds": 58000,
      "workYieldGold": 50,
      "givesCoins": 45000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 9 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 160 },
        { "id": 10021, "name": "Куски супер репки", "amount": 9 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 18 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 260, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 80, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 45000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 460, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/650.webp",
    "upgradesTo": 652,
    "upgradeCost": 26000000
  },
  {
    "id": 652,
    "name": "Изумрудный завод 13",
    "englishName": "Emerald Factory 13",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 26000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 260 },
        { "id": 10026, "name": "Золото", "amount": 30 },
        { "id": 10023, "name": "Сталь", "amount": 55 }
      ],
      "population": 170
    },
    "stats": {
      "constructionTimeSeconds": 900000,
      "accelerationCost": 225,
      "durability": 79000,
      "gloryOnExplosion": 1070000,
      "takesPopulation": 78,
      "workTimeSeconds": 65000,
      "workYieldGold": 50,
      "givesCoins": 50000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 10 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 180 },
        { "id": 10021, "name": "Куски супер репки", "amount": 10 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 20 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 290, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 90, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 50000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 510, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/650.webp",
    "upgradesTo": 653,
    "upgradeCost": 30000000
  },
  {
    "id": 653,
    "name": "Изумрудный завод 14",
    "englishName": "Emerald Factory 14",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 30000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 300 },
        { "id": 10026, "name": "Золото", "amount": 35 },
        { "id": 10023, "name": "Сталь", "amount": 65 }
      ],
      "population": 180
    },
    "stats": {
      "constructionTimeSeconds": 980000,
      "accelerationCost": 240,
      "durability": 88000,
      "gloryOnExplosion": 1200000,
      "takesPopulation": 86,
      "workTimeSeconds": 73000,
      "workYieldGold": 50,
      "givesCoins": 55000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 11 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 200 },
        { "id": 10021, "name": "Куски супер репки", "amount": 11 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 22 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 320, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 100, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 55000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 560, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/650.webp",
    "upgradesTo": 654,
    "upgradeCost": 35000000
  },
  {
    "id": 654,
    "name": "Изумрудный завод 15",
    "englishName": "Emerald Factory 15",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 35000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 350 },
        { "id": 10026, "name": "Золото", "amount": 40 },
        { "id": 10023, "name": "Сталь", "amount": 75 }
      ],
      "population": 190
    },
    "stats": {
      "constructionTimeSeconds": 1060000,
      "accelerationCost": 255,
      "durability": 97000,
      "gloryOnExplosion": 1340000,
      "takesPopulation": 94,
      "workTimeSeconds": 82000,
      "workYieldGold": 50,
      "givesCoins": 60000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 12 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 220 },
        { "id": 10021, "name": "Куски супер репки", "amount": 12 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 25 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 350, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 110, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 60000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 610, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/650.webp",
    "upgradesTo": 655,
    "upgradeCost": 40000000
  },
  {
    "id": 655,
    "name": "Изумрудный завод 16",
    "englishName": "Emerald Factory 16",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 40000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 400 },
        { "id": 10026, "name": "Золото", "amount": 45 },
        { "id": 10023, "name": "Сталь", "amount": 85 }
      ],
      "population": 200
    },
    "stats": {
      "constructionTimeSeconds": 1140000,
      "accelerationCost": 270,
      "durability": 106000,
      "gloryOnExplosion": 1500000,
      "takesPopulation": 102,
      "workTimeSeconds": 91000,
      "workYieldGold": 50,
      "givesCoins": 65000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 13 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 240 },
        { "id": 10021, "name": "Куски супер репки", "amount": 13 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 28 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 380, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 120, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 65000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 660, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/655.webp",
    "upgradesTo": 656,
    "upgradeCost": 46000000
  },
  {
    "id": 656,
    "name": "Изумрудный завод 17",
    "englishName": "Emerald Factory 17",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 46000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 460 },
        { "id": 10026, "name": "Золото", "amount": 52 },
        { "id": 10023, "name": "Сталь", "amount": 98 }
      ],
      "population": 210
    },
    "stats": {
      "constructionTimeSeconds": 1220000,
      "accelerationCost": 285,
      "durability": 116000,
      "gloryOnExplosion": 1660000,
      "takesPopulation": 110,
      "workTimeSeconds": 100000,
      "workYieldGold": 50,
      "givesCoins": 70000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 14 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 260 },
        { "id": 10021, "name": "Куски супер репки", "amount": 14 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 31 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 410, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 130, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 70000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 710, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/655.webp",
    "upgradesTo": 657,
    "upgradeCost": 52000000
  },
  {
    "id": 657,
    "name": "Изумрудный завод 18",
    "englishName": "Emerald Factory 18",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 52000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 520 },
        { "id": 10026, "name": "Золото", "amount": 58 },
        { "id": 10023, "name": "Сталь", "amount": 110 }
      ],
      "population": 220
    },
    "stats": {
      "constructionTimeSeconds": 1300000,
      "accelerationCost": 300,
      "durability": 126000,
      "gloryOnExplosion": 1830000,
      "takesPopulation": 118,
      "workTimeSeconds": 110000,
      "workYieldGold": 50,
      "givesCoins": 75000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 15 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 280 },
        { "id": 10021, "name": "Куски супер репки", "amount": 15 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 34 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 440, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 140, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 75000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 760, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/655.webp",
    "upgradesTo": 658,
    "upgradeCost": 59000000
  },
  {
    "id": 658,
    "name": "Изумрудный завод 19",
    "englishName": "Emerald Factory 19",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 59000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 590 },
        { "id": 10026, "name": "Золото", "amount": 65 },
        { "id": 10023, "name": "Сталь", "amount": 125 }
      ],
      "population": 230
    },
    "stats": {
      "constructionTimeSeconds": 1380000,
      "accelerationCost": 315,
      "durability": 137000,
      "gloryOnExplosion": 2010000,
      "takesPopulation": 126,
      "workTimeSeconds": 120000,
      "workYieldGold": 50,
      "givesCoins": 80000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 16 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 300 },
        { "id": 10021, "name": "Куски супер репки", "amount": 16 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 37 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 470, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 150, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 80000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 810, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/655.webp",
    "upgradesTo": 659,
    "upgradeCost": 66000000
  },
  {
    "id": 659,
    "name": "Изумрудный завод 20",
    "englishName": "Emerald Factory 20",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 66000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 660 },
        { "id": 10026, "name": "Золото", "amount": 72 },
        { "id": 10023, "name": "Сталь", "amount": 140 }
      ],
      "population": 240
    },
    "stats": {
      "constructionTimeSeconds": 1460000,
      "accelerationCost": 330,
      "durability": 148000,
      "gloryOnExplosion": 2200000,
      "takesPopulation": 134,
      "workTimeSeconds": 130000,
      "workYieldGold": 50,
      "givesCoins": 85000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 17 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 320 },
        { "id": 10021, "name": "Куски супер репки", "amount": 17 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 40 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 500, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 160, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 85000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 860, "chance": 15 }
      ]
    },
        "description": "Перерабатывает изумрудную руду в ограненные изумруды.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/655.webp",
    "upgradesTo": 660,
    "upgradeCost": 75000000
  },
  {
    "id": 660,
    "name": "Изумрудный завод 21",
    "englishName": "Emerald Factory 21",
    "category": "Заводы",
    "type": BuildingType.Default,
    "price": 75000000,
    "buildable": false,
    "constructionRequirements": {
      "resources": [
        { "id": 10035, "name": "Элитная древесина", "amount": 750 },
        { "id": 10026, "name": "Золото", "amount": 80 },
        { "id": 10023, "name": "Сталь", "amount": 160 }
      ],
      "population": 250
    },
    "stats": {
      "constructionTimeSeconds": 1540000,
      "accelerationCost": 345,
      "durability": 160000,
      "gloryOnExplosion": 2400000,
      "takesPopulation": 142,
      "workTimeSeconds": 140000,
      "workYieldGold": 50,
      "givesCoins": 90000,
      "produces": [
        { "id": 10034, "name": "Изумруд", "amount": 18 }
      ],
      "consumes": [
        { "id": 10009, "name": "Канистра с бензином", "amount": 350 },
        { "id": 10021, "name": "Куски супер репки", "amount": 18 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 45 }
      ]
    },
    "drops": {
      "frequent": [
        { "id": 10044, "name": "Самородок", "amount": 540, "chance": 70 },
        { "id": 10036, "name": "Изумрудная руда", "amount": 180, "chance": 80 },
        { "id": 10000, "name": "Монеты", "amount": 90000, "chance": 100 }
      ],
      "rare": [
        { "id": 10034, "name": "Изумруд", "amount": 920, "chance": 15 }
      ]
    },
        "description": "Максимальный уровень изумрудного завода.",
    "imageUrl": "/buildings/Заводы/Изумрудный завод - Emerald factory/660.webp"
  },
  {
    id: 325,
    name: 'Полицейский жетон',
    englishName: 'Police Badge',
    category: 'Специальные',
    type: BuildingType.Default,
    price: 0,
    buildable: true,
    constructionRequirements: {
      population: 16,
    },
    stats: {
      constructionTimeSeconds: 12288, // 3h 24m 48s
      accelerationCost: 23,
      durability: 3184,
      gloryOnExplosion: 5000,
    },
    drops: {
      frequent: [
        { id: 10012, name: 'MGM-52 «Ланс»', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 7 },
        { id: 10000, name: 'Монеты', amount: 3788 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 14 }
      ]
    },
    description: 'Специальный предмет, который выдается участникам полиции или победителям выборов. Его наличие может быть признаком особого статуса или давать дополнительные бонусы к поимке преступников.',
    imageUrl: '/buildings/Специальные Здания/Полицейский жетон/325.webp'
  },
  {
    id: 328,
    name: 'Казино',
    englishName: 'Casino',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 8000000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 10 },
        { id: 10006, name: 'Каменные блоки', amount: 100 },
        { id: 10023, name: 'Сталь', amount: 5 },
        { id: 10003, name: 'Куски супер гриба', amount: 40 }
      ],
      population: 46
    },
    stats: {
      constructionTimeSeconds: 292008, // 3 days 9 hours 6 minutes 48 seconds
      accelerationCost: 114,
      durability: 28480,
      gloryOnExplosion: 400000,
      takesPopulation: 0
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 74 },
        { id: 10036, name: 'Изумрудная руда', amount: 20 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 1100 }
      ]
    },
    upgradesTo: 329,
    upgradeCost: 12000000,
    description: 'Ваши гости смогут делать ставки в монетах, выигрывать джекпоты, а вам достанется небольшая часть от каждого выигрыша. Казино невозможно переместить.',
    imageUrl: '/buildings/Специальные Здания/Казино - Сasino/328.webp'
  },
  {
    id: 329,
    name: 'Рубиновое казино 2',
    englishName: 'Ruby Casino 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 12000000,
    buildable: false,
    constructionRequirements: {
      population: 52
    },
    stats: {
      constructionTimeSeconds: 421824, // 4 days 21 hours 10 minutes 24 seconds
      accelerationCost: 137,
      durability: 36432,
      gloryOnExplosion: 600000,
      takesPopulation: 0
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 16 },
        { id: 10036, name: 'Изумрудная руда', amount: 32 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 480 }
      ]
    },
    description: 'Ваши гости смогут делать ставки в рубинах, выигрывать джекпоты, а вам достанется небольшая часть от каждого выигрыша. Казино невозможно переместить.',
    imageUrl: '/buildings/Специальные Здания/Казино - Сasino/329.webp'
  },
  // English Letters (A-Z) - IDs 20045-20070
  {
    id: 20045,
    name: 'Буква A',
    englishName: 'Letter A',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20045.webp'
  },
  {
    id: 20046,
    name: 'Буква B',
    englishName: 'Letter B',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20046.webp'
  },
  {
    id: 20047,
    name: 'Буква C',
    englishName: 'Letter C',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20047.webp'
  },
  {
    id: 20048,
    name: 'Буква D',
    englishName: 'Letter D',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20048.webp'
  },
  {
    id: 20049,
    name: 'Буква E',
    englishName: 'Letter E',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20049.webp'
  },
  {
    id: 20050,
    name: 'Буква F',
    englishName: 'Letter F',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20050.webp'
  },
  {
    id: 20051,
    name: 'Буква G',
    englishName: 'Letter G',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20051.webp'
  },
  {
    id: 20052,
    name: 'Буква H',
    englishName: 'Letter H',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20052.webp'
  },
  {
    id: 20053,
    name: 'Буква I',
    englishName: 'Letter I',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20053.webp'
  },
  {
    id: 20054,
    name: 'Буква J',
    englishName: 'Letter J',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20054.webp'
  },
  {
    id: 20055,
    name: 'Буква K',
    englishName: 'Letter K',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20055.webp'
  },
  {
    id: 20056,
    name: 'Буква L',
    englishName: 'Letter L',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20056.webp'
  },
  {
    id: 20057,
    name: 'Буква M',
    englishName: 'Letter M',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20057.webp'
  },
  {
    id: 20058,
    name: 'Буква N',
    englishName: 'Letter N',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20058.webp'
  },
  {
    id: 20059,
    name: 'Буква O',
    englishName: 'Letter O',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20059.webp'
  },
  {
    id: 20060,
    name: 'Буква P',
    englishName: 'Letter P',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20060.webp'
  },
  {
    id: 20061,
    name: 'Буква Q',
    englishName: 'Letter Q',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20061.webp'
  },
  {
    id: 20062,
    name: 'Буква R',
    englishName: 'Letter R',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20062.webp'
  },
  {
    id: 20063,
    name: 'Буква S',
    englishName: 'Letter S',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20063.webp'
  },
  {
    id: 20064,
    name: 'Буква T',
    englishName: 'Letter T',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20064.webp'
  },
  {
    id: 20065,
    name: 'Буква U',
    englishName: 'Letter U',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20065.webp'
  },
  {
    id: 20066,
    name: 'Буква V',
    englishName: 'Letter V',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20066.webp'
  },
  {
    id: 20067,
    name: 'Буква W',
    englishName: 'Letter W',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20067.webp'
  },
  {
    id: 20068,
    name: 'Буква X',
    englishName: 'Letter X',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20068.webp'
  },
  {
    id: 20069,
    name: 'Буква Y',
    englishName: 'Letter Y',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20069.webp'
  },
  {
    id: 20070,
    name: 'Буква Z',
    englishName: 'Letter Z',
    category: 'Буквы',
    letterSubCategory: 'english',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/abc/20070.webp'
  },
  // Russian Letters (А-Я) - IDs 20001-20033
  {
    id: 20001,
    name: 'Буква А',
    englishName: 'Letter А',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20001.webp'
  },
  {
    id: 20002,
    name: 'Буква Б',
    englishName: 'Letter Б',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20002.webp'
  },
  {
    id: 20003,
    name: 'Буква В',
    englishName: 'Letter В',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20003.webp'
  },
  {
    id: 20004,
    name: 'Буква Г',
    englishName: 'Letter Г',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20004.webp'
  },
  {
    id: 20005,
    name: 'Буква Д',
    englishName: 'Letter Д',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20005.webp'
  },
  {
    id: 20006,
    name: 'Буква Е',
    englishName: 'Letter Е',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20006.webp'
  },
  {
    id: 20007,
    name: 'Буква Ё',
    englishName: 'Letter Ё',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20007.webp'
  },
  {
    id: 20008,
    name: 'Буква Ж',
    englishName: 'Letter Ж',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20008.webp'
  },
  {
    id: 20009,
    name: 'Буква З',
    englishName: 'Letter З',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20009.webp'
  },
  {
    id: 20010,
    name: 'Буква И',
    englishName: 'Letter И',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20010.webp'
  },
  {
    id: 20011,
    name: 'Буква Й',
    englishName: 'Letter Й',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20011.webp'
  },
  {
    id: 20012,
    name: 'Буква К',
    englishName: 'Letter К',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20012.webp'
  },
  {
    id: 20013,
    name: 'Буква Л',
    englishName: 'Letter Л',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20013.webp'
  },
  {
    id: 20014,
    name: 'Буква М',
    englishName: 'Letter М',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20014.webp'
  },
  {
    id: 20015,
    name: 'Буква Н',
    englishName: 'Letter Н',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20015.webp'
  },
  {
    id: 20016,
    name: 'Буква О',
    englishName: 'Letter О',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20016.webp'
  },
  {
    id: 20017,
    name: 'Буква П',
    englishName: 'Letter П',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20017.webp'
  },
  {
    id: 20018,
    name: 'Буква Р',
    englishName: 'Letter Р',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20018.webp'
  },
  {
    id: 20019,
    name: 'Буква С',
    englishName: 'Letter С',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20019.webp'
  },
  {
    id: 20020,
    name: 'Буква Т',
    englishName: 'Letter Т',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20020.webp'
  },
  {
    id: 20021,
    name: 'Буква У',
    englishName: 'Letter У',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20021.webp'
  },
  {
    id: 20022,
    name: 'Буква Ф',
    englishName: 'Letter Ф',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20022.webp'
  },
  {
    id: 20023,
    name: 'Буква Х',
    englishName: 'Letter Х',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20023.webp'
  },
  {
    id: 20024,
    name: 'Буква Ц',
    englishName: 'Letter Ц',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20024.webp'
  },
  {
    id: 20025,
    name: 'Буква Ч',
    englishName: 'Letter Ч',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20025.webp'
  },
  {
    id: 20026,
    name: 'Буква Ш',
    englishName: 'Letter Ш',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20026.webp'
  },
  {
    id: 20027,
    name: 'Буква Щ',
    englishName: 'Letter Щ',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20027.webp'
  },
  {
    id: 20028,
    name: 'Буква Є',
    englishName: 'Letter Є',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20028.webp'
  },
  {
    id: 20029,
    name: 'Буква Ы',
    englishName: 'Letter Ы',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20029.webp'
  },
  {
    id: 20030,
    name: 'Буква Ь',
    englishName: 'Letter Ь',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20030.webp'
  },
  {
    id: 20031,
    name: 'Буква Э',
    englishName: 'Letter Э',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20031.webp'
  },
  {
    id: 20032,
    name: 'Буква Ю',
    englishName: 'Letter Ю',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20032.webp'
  },
  {
    id: 20033,
    name: 'Буква Я',
    englishName: 'Letter Я',
    category: 'Буквы',
    letterSubCategory: 'russian',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/cyrillic/20033.webp'
  },
  // Numbers and Space - IDs 20034-20044
  {
    id: 20034,
    name: 'Пробел',
    englishName: 'Space',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20034.webp'
  },
  {
    id: 20035,
    name: 'Цифра 0',
    englishName: 'Number 0',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20035.webp'
  },
  {
    id: 20036,
    name: 'Цифра 1',
    englishName: 'Number 1',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20036.webp'
  },
  {
    id: 20037,
    name: 'Цифра 2',
    englishName: 'Number 2',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20037.webp'
  },
  {
    id: 20038,
    name: 'Цифра 3',
    englishName: 'Number 3',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20038.webp'
  },
  {
    id: 20039,
    name: 'Цифра 4',
    englishName: 'Number 4',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20039.webp'
  },
  {
    id: 20040,
    name: 'Цифра 5',
    englishName: 'Number 5',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20040.webp'
  },
  {
    id: 20041,
    name: 'Цифра 6',
    englishName: 'Number 6',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20041.webp'
  },
  {
    id: 20042,
    name: 'Цифра 7',
    englishName: 'Number 7',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20042.webp'
  },
  {
    id: 20043,
    name: 'Цифра 8',
    englishName: 'Number 8',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20043.webp'
  },
  {
    id: 20044,
    name: 'Цифра 9',
    englishName: 'Number 9',
    category: 'Буквы',
    letterSubCategory: 'numbers',
    type: BuildingType.Default,
    rubyPrice: 20,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 4504,
      gloryOnExplosion: 5000,
      populationBonus: 0
    },
    drops: {},
    description: 'Оставь свой след в истории города! Leave your mark in city\'s history!',
    imageUrl: '/buildings/letters/symbols_123/20044.webp'
  },
  {
    id: 3768,
    name: 'Беседка',
    englishName: 'Gazebo',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 30,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 5512,
      gloryOnExplosion: 7500
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба', amount: 2 },
        { id: 10040, name: 'Супер репка', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10024, name: 'Стальной лист', amount: 17 }
      ]
    },
    description: 'Иногда спасает гуляющих в парке гномов от дождя. Makes gnomes from the rain.',
    imageUrl: '/buildings/Декор/Беседка - Gazebo/396.webp'
  },
  {
    id: 60005,
    name: 'Газончик',
    englishName: 'Lawn',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 5,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 2248,
      gloryOnExplosion: 1250
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 3 },
        { id: 10041, name: 'Супер тыква', amount: 2 },
        { id: 999, name: 'монеты', amount: 2268 }
      ],
      rare: [
        { id: 10024, name: 'Стальной лист', amount: 3 }
      ]
    },
    description: 'Отличный ухоженный газон. Nice trim lawn.',
    imageUrl: '/buildings/Декор/Газончик - Lawn/60005.webp'
  },
  {
    id: 43,
    name: 'Фонтанчик',
    englishName: 'Fountain',
    category: 'Декор',
    type: BuildingType.Default,
    price: 15000,
    buildable: true,
    constructionRequirements: {
      population: 10
    },
    stats: {
      constructionTimeSeconds: 3000, // 50 minutes
      accelerationCost: 12,
      durability: 1232,
      gloryOnExplosion: 750
    },
    drops: {
      frequent: [
        { id: 10013, name: 'Петарда', amount: 22 },
        { id: 10010, name: 'Садовая бомба', amount: 9 },
        { id: 999, name: 'Монеты', amount: 1115 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 3 }
      ]
    },
    description: 'Декоративный фонтанчик для украшения города.',
    imageUrl: '/buildings/Декор/Фонтанчик/43.webp'
  },
  {
    id: 60001,
    name: 'Красные цветочки',
    englishName: 'Red flowers',
    category: 'Декор',
    type: BuildingType.Default,
    price: 100,
    buildable: true,
    constructionRequirements: {
      population: 3
    },
    stats: {
      constructionTimeSeconds: 81, // 1 minute 21 seconds
      accelerationCost: 2,
      durability: 104,
      gloryOnExplosion: 5
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 2 },
        { id: 999, name: 'Монеты', amount: 58 }
      ],
      rare: [
        { id: 10002, name: 'Доски', amount: 7 }
      ]
    },
    description: 'Цветочная клумба, для поднятия настроения. Flowerbed, to cheer you up.',
    imageUrl: '/buildings/Декор/Красные цветочки/60001.webp'
  },
  {
    id: 60002,
    name: 'Розовые цветочки',
    englishName: 'Pink flowers',
    category: 'Декор',
    type: BuildingType.Default,
    price: 100,
    buildable: true,
    constructionRequirements: {
      population: 3
    },
    stats: {
      constructionTimeSeconds: 81, // 1 minute 21 seconds
      accelerationCost: 2,
      durability: 104,
      gloryOnExplosion: 5
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 2 },
        { id: 999, name: 'Монеты', amount: 58 }
      ],
      rare: [
        { id: 10013, name: 'Петарда', amount: 3 }
      ]
    },
    description: 'Цветочная клумба, для поднятия настроения. Flowerbed, to cheer you up.',
    imageUrl: '/buildings/Декор/Розовые цветочки/60002.webp'
  },
  {
    id: 60003,
    name: 'Голубые цветочки',
    englishName: 'Blue flowers',
    category: 'Декор',
    type: BuildingType.Default,
    price: 100,
    buildable: true,
    constructionRequirements: {
      population: 3
    },
    stats: {
      constructionTimeSeconds: 81, // 1 minute 21 seconds
      accelerationCost: 2,
      durability: 104,
      gloryOnExplosion: 5
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 2 },
        { id: 999, name: 'Монеты', amount: 58 }
      ],
      rare: [
        { id: 10005, name: 'Камни', amount: 2 }
      ]
    },
    description: 'Цветочная клумба, для поднятия настроения. Flowerbed, to cheer you up.',
    imageUrl: '/buildings/Декор/Голубые цветочки/60003.webp'
  },
  {
    id: 60004,
    name: 'Оранжевые цветочки',
    englishName: 'Orange flowers',
    category: 'Декор',
    type: BuildingType.Default,
    price: 100,
    buildable: true,
    constructionRequirements: {
      population: 3
    },
    stats: {
      constructionTimeSeconds: 81, // 1 minute 21 seconds
      accelerationCost: 2,
      durability: 104,
      gloryOnExplosion: 5
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 2 },
        { id: 999, name: 'Монеты', amount: 58 }
      ],
      rare: [
        { id: 10009, name: 'Бензин', amount: 5 }
      ]
    },
    description: 'Цветочная клумба, для поднятия настроения. Flowerbed, to cheer you up.',
    imageUrl: '/buildings/Декор/Оранжевые цветочки/60004.webp'
  },
  {
    id: 60007,
    name: 'Кипарисовая аллея 1',
    englishName: 'Cypress alley 1',
    category: 'Декор',
    type: BuildingType.Default,
    price: 300,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 176,
      gloryOnExplosion: 15
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 140 }
      ],
      rare: [
        { id: 10005, name: 'Камни', amount: 6 }
      ]
    },
    description: 'Кипарисовая аллея для украшения города.',
    imageUrl: '/buildings/Декор/Кипарисовая аллея 1/60007.webp'
  },
  {
    id: 60008,
    name: 'Кипарисовая аллея 2',
    englishName: 'Cypress alley 2',
    category: 'Декор',
    type: BuildingType.Default,
    price: 300,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 176,
      gloryOnExplosion: 15
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 140 }
      ],
      rare: [
        { id: 10013, name: 'Петарда', amount: 7 }
      ]
    },
    description: 'Кипарисовая аллея для украшения города.',
    imageUrl: '/buildings/Декор/Кипарисовая аллея 2/60008.webp'
  },
  {
    id: 60009,
    name: 'Парковые деревья 1',
    englishName: 'Park trees 1',
    category: 'Декор',
    type: BuildingType.Default,
    price: 200,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 144,
      gloryOnExplosion: 10
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 3 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 103 }
      ],
      rare: [
        { id: 10010, name: 'Садовая бомба', amount: 2 }
      ]
    },
    description: 'Парковые деревья для украшения города.',
    imageUrl: '/buildings/Декор/Парковые деревья 1/60009.webp'
  },
  {
    id: 60010,
    name: 'Парковые деревья 2',
    englishName: 'Park trees 2',
    category: 'Декор',
    type: BuildingType.Default,
    price: 200,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 144,
      gloryOnExplosion: 10
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 3 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 103 }
      ],
      rare: [
        { id: 10006, name: 'Каменные блоки', amount: 2 }
      ]
    },
    description: 'Парковые деревья для украшения города.',
    imageUrl: '/buildings/Декор/Парковые деревья 2/60010.webp'
  },
  {
    id: 60011,
    name: 'Парковые деревья 3',
    englishName: 'Park trees 3',
    category: 'Декор',
    type: BuildingType.Default,
    price: 200,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 144,
      gloryOnExplosion: 10
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 3 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 103 }
      ],
      rare: [
        { id: 10005, name: 'Камни', amount: 4 }
      ]
    },
    description: 'Парковые деревья для украшения города.',
    imageUrl: '/buildings/Декор/Парковые деревья 3/60011.webp'
  },
  {
    id: 60014,
    name: 'Кипарисовая аллея 3',
    englishName: 'Cypress alley 3',
    category: 'Декор',
    type: BuildingType.Default,
    price: 300,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 176,
      gloryOnExplosion: 15
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 140 }
      ],
      rare: [
        { id: 10006, name: 'Каменные блоки', amount: 2 }
      ]
    },
    description: 'Кипарисовая аллея для украшения города.',
    imageUrl: '/buildings/Декор/Кипарисовая аллея 3/60014.webp'
  },
  {
    id: 60015,
    name: 'Кипарисовая аллея 4',
    englishName: 'Cypress alley 4',
    category: 'Декор',
    type: BuildingType.Default,
    price: 300,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 176,
      gloryOnExplosion: 15
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 140 }
      ],
      rare: [
        { id: 10005, name: 'Камни', amount: 6 }
      ]
    },
    description: 'Кипарисовая аллея для украшения города.',
    imageUrl: '/buildings/Декор/Кипарисовая аллея 4/60015.webp'
  },
  {
    id: 60016,
    name: 'Кипарисовая аллея 5',
    englishName: 'Cypress alley 5',
    category: 'Декор',
    type: BuildingType.Default,
    price: 300,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 176,
      gloryOnExplosion: 15
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 140 }
      ],
      rare: [
        { id: 10013, name: 'Петарда', amount: 7 }
      ]
    },
    description: 'Кипарисовая аллея для украшения города.',
    imageUrl: '/buildings/Декор/Кипарисовая аллея 5/60016.webp'
  },
  {
    id: 60017,
    name: 'Кипарисовая аллея 6',
    englishName: 'Cypress alley 6',
    category: 'Декор',
    type: BuildingType.Default,
    price: 300,
    buildable: true,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 176,
      gloryOnExplosion: 15
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 140 }
      ],
      rare: [
        { id: 10010, name: 'Садовая бомба', amount: 3 }
      ]
    },
    description: 'Кипарисовая аллея для украшения города.',
    imageUrl: '/buildings/Декор/Кипарисовая аллея 6/60017.webp'
  },
  {
    id: 3493,
    name: 'Декоративное дерево',
    englishName: 'Decorative tree',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 30,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 5512,
      gloryOnExplosion: 7500
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 16 },
        { id: 10023, name: 'Сталь', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10025, name: 'Самородок', amount: 42 }
      ]
    },
    description: 'Украсит ваш город. Make your city more beautiful.',
    imageUrl: '/buildings/Декор/Декоративное дерево - Decorative tree/393.webp'
  },
  {
    id: 9367,
    name: 'Монумент освободителю',
    englishName: 'Monument to The Liberator',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 10,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 3184,
      gloryOnExplosion: 2500
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10003, name: '????? ????? ?????', amount: 7 },
        { id: 999, name: 'монеты', amount: 3788 }
      ],
      rare: [
        { id: 10024, name: 'Стальной лист', amount: 6 }
      ]
    },
    description: 'Статуя вооруженной птицы. Statue of armored bird.',
    imageUrl: '/buildings/Декор/Монумент  освободителю - Monument to The Liberator/332.webp'
  },
  {
    id: 3494,
    name: 'Цветник',
    englishName: 'Flower bed',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 15,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 1500,
      gloryOnExplosion: 800
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 2 },
        { id: 999, name: 'монеты', amount: 1500 }
      ],
      rare: [
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ]
    },
    description: 'Красивый цветник для украшения города. Beautiful flower bed for city decoration.',
    imageUrl: '/buildings/Декор/Цветник - Flower bed/395.webp'
  },
  {
    id: 13701,
    name: 'Маленький снеговик',
    englishName: 'Little snowman',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 250,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 11382,
      gloryOnExplosion: 62500,
      populationBonus: 3
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 21 },
        { id: 10036, name: 'Изумрудная руда', amount: 6 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 84 }
      ]
    },
    description: 'Маленький снеговик',
    imageUrl: '/buildings/Подарки/Основные/Маленький снеговик/137.webp'
  },
  {
    id: 13801,
    name: 'Большой снеговик',
    englishName: 'Big snowman',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 500,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 16098,
      gloryOnExplosion: 125000,
      populationBonus: 8
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 235 },
        { id: 10005, name: 'Сталь', amount: 44 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 79 }
      ]
    },
    description: 'Большой снеговик',
    imageUrl: '/buildings/Подарки/Основные/Большой снеговик/138.webp'
  },
  {
    id: 13901,
    name: 'Маленькая ёлочка',
    englishName: 'Little fur-tree',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 300,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 12468,
      gloryOnExplosion: 75000,
      populationBonus: 3
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 11 },
        { id: 10005, name: 'Сталь', amount: 27 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 7 }
      ]
    },
    description: 'Маленькая ёлочка',
    imageUrl: '/buildings/Подарки/Основные/Маленькая елочка/139.webp'
  },
  {
    id: 14001,
    name: 'Новогодняя ёлка',
    englishName: 'Christmas tree',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 600,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 17634,
      gloryOnExplosion: 150000,
      populationBonus: 10
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 22 },
        { id: 10017, name: 'Супер детонатор', amount: 12 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 750 }
      ]
    },
    description: 'Новогодняя ёлка',
    imageUrl: '/buildings/Подарки/Основные/Новогодняя елка/140.webp'
  },
  {
    id: 14101,
    name: 'Медведь девочка',
    englishName: 'Bear-girl',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 550,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 16884,
      gloryOnExplosion: 137500,
      populationBonus: 7
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 11 },
        { id: 10024, name: 'Стальной лист', amount: 19 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 184 }
      ]
    },
    description: 'Медведь девочка',
    imageUrl: '/buildings/Подарки/Основные/Медведь девочка/141.webp'
  },
  {
    id: 14201,
    name: 'Медведь мальчик',
    englishName: 'Bear-boy',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 550,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 16884,
      gloryOnExplosion: 137500,
      populationBonus: 9
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 46 },
        { id: 10024, name: 'Стальной лист', amount: 19 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 87 }
      ]
    },
    description: 'Медведь мальчик',
    imageUrl: '/buildings/Подарки/Основные/Медведь мальчик/142.webp'
  },
  {
    id: 14301,
    name: 'Большая новогодняя ёлка',
    englishName: 'Big Christmas tree',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 900,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 21600,
      gloryOnExplosion: 225000,
      populationBonus: 11
    },
    drops: {
      frequent: [
        { id: 10037, name: 'Изумруды', amount: 10 },
        { id: 10036, name: 'Изумрудная руда', amount: 20 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 19 }
      ]
    },
    description: 'Большая новогодняя ёлка',
    imageUrl: '/buildings/Подарки/Основные/Большая новогодняя ёлка/143.webp'
  },
  {
    id: 33801,
    name: 'Снежная королева змей',
    englishName: 'Snow queen snakes',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 1000,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 22770,
      gloryOnExplosion: 250000,
      populationBonus: 16
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 20 },
        { id: 10024, name: 'Стальной лист', amount: 34 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 158 }
      ]
    },
    description: 'Снежная королева змей',
    imageUrl: '/buildings/Подарки/Основные/Снежная королева змей/338.webp'
  },
  {
    id: 33901,
    name: 'Кулон Влюбленное сердце',
    englishName: 'Love Heart Pendant',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 600,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 17634,
      gloryOnExplosion: 150000,
      populationBonus: 9
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 12 },
        { id: 10024, name: 'Стальной лист', amount: 20 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 13 }
      ]
    },
    description: 'Кулон Влюбленное сердце',
    imageUrl: '/buildings/Подарки/Основные/Кулон Влюбленное сердце/339.webp'
  },
  {
    id: 34001,
    name: 'Боевой корабль',
    englishName: 'Warship',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 700,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 19050,
      gloryOnExplosion: 175000,
      populationBonus: 11
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 59 },
        { id: 10024, name: 'Стальной лист', amount: 24 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 875 }
      ]
    },
    description: 'Боевой корабль',
    imageUrl: '/buildings/Подарки/Основные/Боевой корабль/340.webp'
  },
  {
    id: 34301,
    name: 'Автомобиль',
    englishName: 'Car',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 700,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 19050,
      gloryOnExplosion: 175000,
      populationBonus: 10
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 26 },
        { id: 10005, name: 'Сталь', amount: 62 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 15 }
      ]
    },
    description: 'Автомобиль',
    imageUrl: '/buildings/Подарки/Основные/Автомобиль/343.webp'
  },
  {
    id: 34401,
    name: 'Тропический Рай',
    englishName: 'Tropical paradise',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 350,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 13470,
      gloryOnExplosion: 87500,
      populationBonus: 5
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 13 },
        { id: 10017, name: 'Супер детонатор', amount: 7 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 438 }
      ]
    },
    description: 'Тропический Рай',
    imageUrl: '/buildings/Подарки/Основные/Тропический Рай/344.webp'
  },
  {
    id: 39901,
    name: 'Ангел хранитель',
    englishName: 'Guardian Angel',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 1200,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 24942,
      gloryOnExplosion: 300000,
      populationBonus: 20
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 100 },
        { id: 10024, name: 'Стальной лист', amount: 40 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 26 }
      ]
    },
    description: 'Гномы верят, что Ангел хранитель приносит счастье и благополучие жителям города. Gnomes believe that guardian angel brings happiness and prosperity to the city',
    imageUrl: '/buildings/Подарки/Основные/Ангел хранитель/399.webp'
  },
  {
    id: 40701,
    name: 'Сердце океана',
    englishName: 'Heart of Ocean',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 3000,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 39438,
      gloryOnExplosion: 750000,
      populationBonus: 50
    },
    drops: {
      frequent: [
        { id: 10037, name: 'Изумруды', amount: 32 },
        { id: 10036, name: 'Изумрудная руда', amount: 67 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 63 }
      ]
    },
    description: 'Самый известный бриллиант в мире. После гибели Титаникуса, казалось что он навсегда утерян, но отважный гном Барундубра отыскал эту изумительную драгоценность. Она станет прекрасным подарком для особенного человека. The most famous diamond in the world. After the death of Titanikusa seemed that he was lost forever, but the brave dwarf Barundubra found this amazing jewel. It will be the perfect gift for that special person.',
    imageUrl: '/buildings/Подарки/Основные/Сердце океана/407.webp'
  },
  {
    id: 40801,
    name: 'Кольцо дьявола',
    englishName: 'Ring of the Devil',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 1331,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 26268,
      gloryOnExplosion: 332750,
      populationBonus: 22
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 49 },
        { id: 10005, name: 'Сталь', amount: 116 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 1664 }
      ]
    },
    description: 'Увидев это это кольцо, враги разбегаются в ужасе. Seeing this ring, enemies flee in terror',
    imageUrl: '/buildings/Подарки/Основные/Кольцо дьявола/408.webp'
  },
  {
    id: 41801,
    name: 'Барашка',
    englishName: 'Christmas lamb',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 1400,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 26940,
      gloryOnExplosion: 350000,
      populationBonus: 23
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 117 },
        { id: 10036, name: 'Изумрудная руда', amount: 32 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 222 }
      ]
    },
    description: 'Барашка это не только ценный мех, но и много счастья и удачи в новом году! Lamb is not only valuable fur, but also a lot of happiness and good luck in the new year!',
    imageUrl: '/buildings/Подарки/Основные/Барашка/418.webp'
  },
  {
    id: 45001,
    name: 'Хрустальная туфелька',
    englishName: 'Glass slipper',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 999,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 22758,
      gloryOnExplosion: 249750,
      populationBonus: 17
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 37 },
        { id: 10005, name: 'Сталь', amount: 88 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 158 }
      ]
    },
    description: 'Резко повышает шансы на принца и успешное замужество. Increases the chances of the Prince and successful marriage',
    imageUrl: '/buildings/Подарки/Основные/Хрустальная туфелька/450.webp'
  },
  {
    id: 47301,
    name: 'Орден «За разгром мужских сердец»',
    englishName: 'Medal "For the rout of the male hearts"',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 600,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 17634,
      gloryOnExplosion: 150000,
      populationBonus: 10
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 50 },
        { id: 10036, name: 'Изумрудная руда', amount: 14 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 200 }
      ]
    },
    description: 'Высшая степень награды для девушек за умелую оборону, изматывание и затем переход в решительное контрнаступление, приведшие к полному разгрому сил и сердец противников. The highest degree of reward for women for skillful defense and further offensive, that led to the complete defeat of the forces and the hearts of opponents.',
    imageUrl: '/buildings/Подарки/Основные/Орден «За разгром мужских сердец»/473.webp'
  },
  {
    id: 47401,
    name: 'Орден «За оборону Города»',
    englishName: 'Medal «For the defense of City»',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 700,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 19050,
      gloryOnExplosion: 175000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 328 },
        { id: 10005, name: 'Сталь', amount: 62 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 111 }
      ]
    },
    description: 'За умелые действия по обороне от противника своих строений и коммуникаций, приведшие к уничтожению значительных сил врага, срыву его наступательной операции и сохранению города. Medal «For the defense of Citys»',
    imageUrl: '/buildings/Подарки/Основные/Орден «За оборону Города»/474.webp'
  },
  {
    id: 53001,
    name: 'Оберег — Кроличья лапка',
    englishName: "Rabbit's foot",
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 500,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 16098,
      gloryOnExplosion: 125000,
      populationBonus: 8
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 19 },
        { id: 10017, name: 'Супер детонатор', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 79 }
      ]
    },
    description: 'Этот талисман отгонит злых духов от построек и принесет немалую удачу владельцу. Издревле считается, что Кроличья лапка — самая сильная защита от любовного приворота, дурного глаза и нечистой силы. This talisman drives away evil spirits from buildings and bring good luck to the owner. Since ancient times it was believed that the rabbit\'s foot is the strongest protection from love spell, the evil eye and bad spirits.',
    imageUrl: '/buildings/Подарки/Основные/Оберег Кроличья лапка/530.webp'
  },
  {
    id: 53101,
    name: 'Кукла Вуду — Невеста',
    englishName: 'Groom Voodoo Doll',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 300,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 12468,
      gloryOnExplosion: 75000,
      populationBonus: 5
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 6 },
        { id: 10024, name: 'Стальной лист', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 7 }
      ]
    },
    description: 'Издревне эта кукла считалась главным инструментом злых Ведьм и Колдунов. С ней вы сможете околдовать любую девушку, а Черная магия поможет закрепить чувства на всю жизнь. This doll can charm even the most inveterate bachelor and turn him into your heart\'s servant. Be careful what you wish, because Halloween Voodoo Doll will enslave any man.',
    imageUrl: '/buildings/Подарки/Основные/Кукла Вуду  Невеста/531.webp'
  },
  {
    id: 53201,
    name: 'Кукла Вуду — Жених',
    englishName: 'Bride Voodoo Doll',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 300,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 12468,
      gloryOnExplosion: 75000,
      populationBonus: 5
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 25 },
        { id: 10024, name: 'Стальной лист', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 375 }
      ]
    },
    description: 'Эта кукла приворожит даже самого заядлого холостяка и превратит его в раба вашего сердца. Осторожней с желаниями, ведь в канун Дня всех святых Кукла Вуду поработит любого мужчину. Since ancient times, this doll is the main tool of evil witches and wizards. With it, you can cast a spell on any girl. Black magic will help strengthen this infatuation for life.',
    imageUrl: '/buildings/Подарки/Основные/Кукла Вуду Жених/532.webp'
  },
  {
    id: 55501,
    name: 'Обручальные кольца',
    englishName: 'Marry me',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 600,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 17634,
      gloryOnExplosion: 150000,
      populationBonus: 10
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 12 },
        { id: 10024, name: 'Стальной лист', amount: 20 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 13 }
      ]
    },
    description: 'Сегодня идеальный день, чтобы сделать предложение руки и сердца. Не переживайте, в День Всех Влюбленных ответ «Да» вам гарантирован. Решайтесь! Make up your mind and make a marriage proposal. And don\'t worry! During Valentine\'s holidays you will definitely get only \'Yes\' answer.',
    imageUrl: '/buildings/Подарки/Основные/Обручальные кольца/555.webp'
  },
  {
    id: 55601,
    name: 'Признание в любви',
    englishName: 'Forever Love',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 300,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 12468,
      gloryOnExplosion: 75000,
      populationBonus: 5
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 25 },
        { id: 10024, name: 'Стальной лист', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 375 }
      ]
    },
    description: 'Признайтесь в безоговорочной любви и преданности к вашей второй половинке. Будьте уверены, о таком подарке мечтает каждый в День Святого Валентина. Wow your sweetheart with this love-declaration gift and show that special someone exactly how you feel. Mutual warm feelings guaranteed.',
    imageUrl: '/buildings/Подарки/Основные/Признание в любви/556.webp'
  },
  {
    id: 59801,
    name: 'Мартовский заяц',
    englishName: 'March Hare',
    category: 'Подарки',
    type: BuildingType.Default,
    price: 800000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10034, name: 'Изумруд', amount: 80 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 7452,
      gloryOnExplosion: 40000,
      populationBonus: 2
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 9 },
        { id: 10024, name: 'Стальной лист', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 17 }
      ]
    },
    description: 'Этот заяц до безумия любит девушек: щедро задаривает их цветами, усыпает комплиментами и бесконечно угощает конфетами. Идеальный подарок на 8 марта. This gallant hare is madly in love with women. He gives beautiful flowers, makes infinite compliments and generously treats with sweets. Yes, it\'s an ideal gift.',
    imageUrl: '/buildings/Подарки/Основные/Мартовский заяц/598.webp'
  },
  {
    id: 66101,
    name: 'Амурский тигренок',
    englishName: 'Amur baby tiger',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 555,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 16962,
      gloryOnExplosion: 138750,
      populationBonus: 9
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 21 },
        { id: 10005, name: 'Сталь', amount: 49 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 185 }
      ]
    },
    description: 'Этих красивых и сильных животных осталось очень мало, но у вас есть уникальный шанс разместить такого на своем участке! Часть средств от продажи этого подарка отправится в WWF, на сохранение популяции Амурских тигров, самых северных тигров на планете. There is a very small number of that strong and beautiful animals still live on our planet. You have a great chance to place one of them on your map! Portions of the proceeds are going to be forvarded to WWF to protect the population of the northernmost tigers in the world',
    imageUrl: '/buildings/Подарки/Основные/Амурский тигренок/661.webp'
  },
  // Ice Castles - 4 castles with 4 levels each
  {
    id: 71001,
    name: 'Южный ледяной дворец',
    englishName: 'South Ice palace',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 27 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 0
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 16 },
        { id: 10007, name: 'Яйцо Горыныча', amount: 4 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 12 }
      ]
    },
    upgradesTo: 71101,
    upgradeCost: 710000,
    description: 'Южный ледяной дворец',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/1/710.webp'
  },
  {
    id: 71101,
    name: 'Южный ледяной дворец 2',
    englishName: 'South Ice palace 2',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 59 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 3 },
        { id: 10024, name: 'Стальной лист', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 3 }
      ]
    },
    upgradesTo: 71201,
    upgradeCost: 1360000,
    description: 'Южный ледяной дворец 2',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/1/711.webp'
  },
  {
    id: 71201,
    name: 'Южный ледяной дворец 3',
    englishName: 'South Ice palace 3',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 113 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 21 },
        { id: 10024, name: 'Стальной лист', amount: 9 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 314 }
      ]
    },
    upgradesTo: 71301,
    upgradeCost: 2270000,
    description: 'Южный ледяной дворец 3',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/1/712.webp'
  },
  {
    id: 71301,
    name: 'Южный ледяной дворец 4',
    englishName: 'South Ice palace 4',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 189 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 28
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 41 },
        { id: 10036, name: 'Изумрудная руда', amount: 11 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 164 }
      ]
    },
    description: 'Южный ледяной дворец 4',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/1/713.webp'
  },
  // East Ice Palace
  {
    id: 71401,
    name: 'Восточный ледяной дворец',
    englishName: 'East Ice palace',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 27 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 0
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба', amount: 2 },
        { id: 10015, name: 'Супер репка', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 12 }
      ]
    },
    upgradesTo: 71501,
    upgradeCost: 710000,
    description: 'Восточный ледяной дворец',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/2/714.webp'
  },
  {
    id: 71501,
    name: 'Восточный ледяной дворец 2',
    englishName: 'East Ice palace 2',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 59 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 4 },
        { id: 10005, name: 'Сталь', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 3 }
      ]
    },
    upgradesTo: 71601,
    upgradeCost: 1360000,
    description: 'Восточный ледяной дворец 2',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/2/715.webp'
  },
  {
    id: 71601,
    name: 'Восточный ледяной дворец 3',
    englishName: 'East Ice palace 3',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 113 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 10 },
        { id: 10017, name: 'Супер детонатор', amount: 5 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 314 }
      ]
    },
    upgradesTo: 71701,
    upgradeCost: 2270000,
    description: 'Восточный ледяной дворец 3',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/2/716.webp'
  },
  {
    id: 71701,
    name: 'Восточный ледяной дворец 4',
    englishName: 'East Ice palace 4',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 189 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 28
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 10 },
        { id: 10024, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 164 }
      ]
    },
    description: 'Восточный ледяной дворец 4',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/2/717изменил.webp'
  },
  // North Ice Palace
  {
    id: 71801,
    name: 'Северный ледяной дворец',
    englishName: 'Northern Ice palace',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 27 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 0
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 2 },
        { id: 10005, name: 'Сталь', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 12 }
      ]
    },
    upgradesTo: 71901,
    upgradeCost: 710000,
    description: 'Северный ледяной дворец',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/3/718.webp'
  },
  {
    id: 71901,
    name: 'Северный ледяной дворец 2',
    englishName: 'Northern Ice palace 2',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 59 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 10 },
        { id: 10036, name: 'Изумрудная руда', amount: 3 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 3 }
      ]
    },
    upgradesTo: 72001,
    upgradeCost: 1360000,
    description: 'Северный ледяной дворец 2',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/3/719.webp'
  },
  {
    id: 72001,
    name: 'Северный ледяной дворец 3',
    englishName: 'Northern Ice palace 3',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 113 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 118 },
        { id: 10005, name: 'Сталь', amount: 22 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 314 }
      ]
    },
    upgradesTo: 72101,
    upgradeCost: 2270000,
    description: 'Северный ледяной дворец 3',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/3/720.webp'
  },
  {
    id: 72101,
    name: 'Северный ледяной дворец 4',
    englishName: 'Northern Ice palace 4',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 189 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 28
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 18 },
        { id: 10005, name: 'Сталь', amount: 43 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 164 }
      ]
    },
    description: 'Северный ледяной дворец 4',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/3/721.webp'
  },
  // West Ice Palace
  {
    id: 72201,
    name: 'Западный ледяной дворец',
    englishName: 'West Ice Palace',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 27 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 0
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 16 },
        { id: 10007, name: 'Яйцо Горыныча', amount: 4 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 12 }
      ]
    },
    upgradesTo: 72301,
    upgradeCost: 710000,
    description: 'Западный ледяной дворец',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/4/722.webp'
  },
  {
    id: 72301,
    name: 'Западный ледяной дворец 2',
    englishName: 'West Ice Palace 2',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 59 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 3 },
        { id: 10024, name: 'Стальной лист', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 3 }
      ]
    },
    upgradesTo: 72401,
    upgradeCost: 1360000,
    description: 'Западный ледяной дворец 2',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/4/723.webp'
  },
  {
    id: 72401,
    name: 'Западный ледяной дворец 3',
    englishName: 'West Ice Palace 3',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 113 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 21 },
        { id: 10024, name: 'Стальной лист', amount: 9 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 314 }
      ]
    },
    upgradesTo: 72501,
    upgradeCost: 2270000,
    description: 'Западный ледяной дворец 3',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/4/724.webp'
  },
  {
    id: 72501,
    name: 'Западный ледяной дворец 4',
    englishName: 'West Ice Palace 4',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10033, name: 'Черепок', amount: 189 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 28
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 41 },
        { id: 10036, name: 'Изумрудная руда', amount: 11 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 164 }
      ]
    },
    description: 'Западный ледяной дворец 4',
    imageUrl: '/buildings/Подарки/Замки/ледяной дворец/4/725.webp'
  },
  // Sand Castles - 4 castles with 4 levels each
  {
    id: 79501,
    name: 'Северный песочный замок 1',
    englishName: 'Northern Sand Castle',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 32 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 900,
      accelerationCost: 6,
      durability: 4272,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 17 },
        { id: 10005, name: 'Сталь', amount: 4 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 6 }
      ]
    },
    upgradesTo: 79601,
    upgradeCost: 710000,
    description: 'Многие видят просто гору песка и только настоящий художник разглядит в ней прекрасный замок.',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/1/795.webp'
  },
  {
    id: 79601,
    name: 'Северный песочный замок 2',
    englishName: 'Northern Sand Castle 2',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 36 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7542,
      gloryOnExplosion: 35500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 10 },
        { id: 10024, name: 'Стальной лист', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 138 }
      ]
    },
    upgradesTo: 79701,
    upgradeCost: 1360000,
    description: 'Северный песочный замок 2',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/1/796.webp'
  },
  {
    id: 79701,
    name: 'Северный песочный замок 3',
    englishName: 'Northern Sand Castle 3',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 68 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11442,
      gloryOnExplosion: 68000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 22 },
        { id: 10036, name: 'Изумрудная руда', amount: 6 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 85 }
      ]
    },
    upgradesTo: 79801,
    upgradeCost: 2270000,
    description: 'Северный песочный замок 3',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/1/797.webp'
  },
  {
    id: 79801,
    name: 'Северный песочный замок 4',
    englishName: 'Northern Sand Castle 4',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 114 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15954,
      gloryOnExplosion: 113500,
      populationBonus: 28
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 230 },
        { id: 10005, name: 'Сталь', amount: 43 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 78 }
      ]
    },
    description: 'Северный песочный замок 4',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/1/798.webp'
  },
  // East Sand Castle
  {
    id: 79901,
    name: 'Восточный песочный замок 1',
    englishName: 'East Sand Castle',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 32 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 900,
      accelerationCost: 6,
      durability: 4272,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба', amount: 2 },
        { id: 10007, name: 'Яйцо Горыныча', amount: 4 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 6 }
      ]
    },
    upgradesTo: 80001,
    upgradeCost: 710000,
    description: 'Восточный песочный замок 1',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/2/799.webp'
  },
  {
    id: 80001,
    name: 'Восточный песочный замок 2',
    englishName: 'East Sand Castle 2',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 36 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7542,
      gloryOnExplosion: 35500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 4 },
        { id: 10017, name: 'Супер детонатор', amount: 3 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 138 }
      ]
    },
    upgradesTo: 80101,
    upgradeCost: 1360000,
    description: 'Восточный песочный замок 2',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/2/800.webp'
  },
  {
    id: 80101,
    name: 'Восточный песочный замок 3',
    englishName: 'East Sand Castle 3',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 68 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11442,
      gloryOnExplosion: 68000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 5 },
        { id: 10024, name: 'Стальной лист', amount: 9 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 85 }
      ]
    },
    upgradesTo: 80201,
    upgradeCost: 2270000,
    description: 'Восточный песочный замок 3',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/2/801.webp'
  },
  {
    id: 80201,
    name: 'Восточный песочный замок 4',
    englishName: 'East Sand Castle 4',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 114 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15954,
      gloryOnExplosion: 113500,
      populationBonus: 28
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 41 },
        { id: 10024, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 78 }
      ]
    },
    description: 'Восточный песочный замок 4',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/2/802.webp'
  },
  // South Sand Castle
  {
    id: 80301,
    name: 'Южный песочный замок 1',
    englishName: 'South Sand Castle',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 32 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 900,
      accelerationCost: 6,
      durability: 4272,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 2 },
        { id: 10024, name: 'Стальной лист', amount: 2 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 6 }
      ]
    },
    upgradesTo: 80401,
    upgradeCost: 710000,
    description: 'Южный песочный замок 1',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/3/803.webp'
  },
  {
    id: 80401,
    name: 'Южный песочный замок 2',
    englishName: 'South Sand Castle 2',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 36 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7542,
      gloryOnExplosion: 35500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 52 },
        { id: 10005, name: 'Сталь', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 138 }
      ]
    },
    upgradesTo: 80501,
    upgradeCost: 1360000,
    description: 'Южный песочный замок 2',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/3/804.webp'
  },
  {
    id: 80501,
    name: 'Южный песочный замок 3',
    englishName: 'South Sand Castle 3',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 68 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11442,
      gloryOnExplosion: 68000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 10 },
        { id: 10005, name: 'Сталь', amount: 23 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 85 }
      ]
    },
    upgradesTo: 80601,
    upgradeCost: 2270000,
    description: 'Южный песочный замок 3',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/3/805.webp'
  },
  {
    id: 80601,
    name: 'Южный песочный замок 4',
    englishName: 'South Sand Castle 4',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 114 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15954,
      gloryOnExplosion: 113500,
      populationBonus: 28
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Золото', amount: 18 },
        { id: 10017, name: 'Супер детонатор', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 78 }
      ]
    },
    description: 'Южный песочный замок 4',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/3/806.webp'
  },
  // Western Sand Castle
  {
    id: 80701,
    name: 'Западный песочный замок 1',
    englishName: 'Western Sand Castle',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 32 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 900,
      accelerationCost: 6,
      durability: 4272,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 17 },
        { id: 10005, name: 'Сталь', amount: 4 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 6 }
      ]
    },
    upgradesTo: 80801,
    upgradeCost: 710000,
    description: 'Западный песочный замок 1',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/4/807.webp'
  },
  {
    id: 80801,
    name: 'Западный песочный замок 2',
    englishName: 'Western Sand Castle 2',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 36 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7542,
      gloryOnExplosion: 35500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 10 },
        { id: 10024, name: 'Стальной лист', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10035, name: 'Самородок', amount: 138 }
      ]
    },
    upgradesTo: 80901,
    upgradeCost: 1360000,
    description: 'Западный песочный замок 2',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/4/808.webp'
  },
  {
    id: 80901,
    name: 'Западный песочный замок 3',
    englishName: 'Western Sand Castle 3',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 68 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11442,
      gloryOnExplosion: 68000,
      populationBonus: 12
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Самородок', amount: 22 },
        { id: 10036, name: 'Изумрудная руда', amount: 6 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 85 }
      ]
    },
    upgradesTo: 81001,
    upgradeCost: 2270000,
    description: 'Западный песочный замок 3',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/4/809.webp'
  },
  {
    id: 81001,
    name: 'Западный песочный замок 4',
    englishName: 'Western Sand Castle 4',
    category: 'Подарки',
    giftSubCategory: 'castles',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10041, name: 'Песок', amount: 114 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15954,
      gloryOnExplosion: 113500,
      populationBonus: 28
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 230 },
        { id: 10005, name: 'Сталь', amount: 43 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [
        { id: 10037, name: 'Изумруды', amount: 78 }
      ]
    },
    description: 'Западный песочный замок 4',
    imageUrl: '/buildings/Подарки/Замки/песочный замок/4/810.webp'
  },
  // Малыши (Babies) - Медведь (Bear)
  {
    id: 72701,
    name: 'Малыш (Медведь) 1',
    englishName: 'Baby Bear 1',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 32 }],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    upgradesTo: 72801,
    upgradeCost: 710000,
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 2 },
        { id: 10027, name: 'Яйцо Горыныча', amount: 4 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 6 }]
    },
    description: 'Малыш Медведь 1 уровня',
    imageUrl: '/buildings/Подарки/Малышы/малыш медведь/731.webp'
  },
  {
    id: 72801,
    name: 'Малыш (Медведь) 2',
    englishName: 'Baby Bear 2',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 71 }],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 2
    },
    upgradesTo: 72901,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 4 },
        { id: 10015, name: 'Супер детонатор', amount: 3 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 136 }]
    },
    description: 'Малыш Медведь 2 уровня',
    imageUrl: '/buildings/Подарки/Малышы/малыш медведь/733.webp'
  },
  {
    id: 72901,
    name: 'Малыш (Медведь) 3',
    englishName: 'Baby Bear 3',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 136 }],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 7
    },
    upgradesTo: 73001,
    upgradeCost: 2270000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 5 },
        { id: 10006, name: 'Стальной лист', amount: 9 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 84 }]
    },
    description: 'Малыш Медведь 3 уровня',
    imageUrl: '/buildings/Подарки/Малышы/малыш медведь/733.webp'
  },
  {
    id: 73001,
    name: 'Малыш (Медведь) 4',
    englishName: 'Baby Bear 4',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 227 }],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 16
    },
    upgradesTo: 73101,
    upgradeCost: 3440000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 41 },
        { id: 10006, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 78 }]
    },
    description: 'Малыш Медведь 4 уровня',
    imageUrl: '/buildings/Подарки/Малышы/малыш медведь/735.webp'
  },
  {
    id: 73101,
    name: 'Малыш (Медведь) 5',
    englishName: 'Baby Bear 5',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 3440000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 344 }],
      population: 75
    },
    stats: {
      constructionTimeSeconds: 1262025,
      accelerationCost: 237,
      durability: 21000,
      gloryOnExplosion: 172000,
      populationBonus: 34
    },
    drops: {
      frequent: [
        { id: 10037, name: 'Изумруды', amount: 9 },
        { id: 10036, name: 'Изумрудная руда', amount: 19 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 18 }]
    },
    description: 'Этот очаровательный малыш принесёт в ваш город любовь и счастье',
    imageUrl: '/buildings/Подарки/Малышы/малыш медведь/731.webp'
  },
  // Малыши (Babies) - Ангел девочка (Angel Girl)
  {
    id: 73201,
    name: 'Малыш (Ангел девочка) 1',
    englishName: 'Baby Angel Girl 1',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 32 }],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    upgradesTo: 73301,
    upgradeCost: 710000,
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 2 },
        { id: 10026, name: 'Супер репка', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [{ id: 10006, name: 'Стальной лист', amount: 17 }]
    },
    description: 'Малыш Ангел девочка 1 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ ДЕВОЧКА/736.webp'
  },
  {
    id: 73301,
    name: 'Малыш (Ангел девочка) 2',
    englishName: 'Baby Angel Girl 2',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 71 }],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 2
    },
    upgradesTo: 73401,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 4 },
        { id: 10005, name: 'Сталь', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 37 }]
    },
    description: 'Малыш Ангел девочка 2 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ ДЕВОЧКА/733.webp'
  },
  {
    id: 73401,
    name: 'Малыш (Ангел девочка) 3',
    englishName: 'Baby Angel Girl 3',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 136 }],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 7
    },
    upgradesTo: 73501,
    upgradeCost: 2270000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 10 },
        { id: 10015, name: 'Супер детонатор', amount: 5 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 6 }]
    },
    description: 'Малыш Ангел девочка 3 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ ДЕВОЧКА/733.webp'
  },
  {
    id: 73501,
    name: 'Малыш (Ангел девочка) 4',
    englishName: 'Baby Angel Girl 4',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 227 }],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 16
    },
    upgradesTo: 73601,
    upgradeCost: 3440000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 10 },
        { id: 10006, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 11 }]
    },
    description: 'Малыш Ангел девочка 4 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ ДЕВОЧКА/735.webp'
  },
  {
    id: 73601,
    name: 'Малыш (Ангел девочка) 5',
    englishName: 'Baby Angel Girl 5',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 3440000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 344 }],
      population: 75
    },
    stats: {
      constructionTimeSeconds: 1262025,
      accelerationCost: 237,
      durability: 21000,
      gloryOnExplosion: 172000,
      populationBonus: 34
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 71 },
        { id: 10036, name: 'Изумрудная руда', amount: 19 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 1064 }]
    },
    description: 'Малыш Ангел девочка 5 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ ДЕВОЧКА/736.webp'
  },
  // Малыши (Babies) - Динозаврик (Dino)
  {
    id: 73701,
    name: 'Малыш (Динозаврик) 1',
    englishName: 'Baby Dino 1',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 32 }],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    upgradesTo: 73801,
    upgradeCost: 710000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 2 },
        { id: 10006, name: 'Стальной лист', amount: 2 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 42 }]
    },
    description: 'Малыш Динозаврик 1 уровня',
    imageUrl: '/buildings/Подарки/Малышы/дино/741.webp'
  },
  {
    id: 73801,
    name: 'Малыш (Динозаврик) 2',
    englishName: 'Baby Dino 2',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 71 }],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 2
    },
    upgradesTo: 73901,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 51 },
        { id: 10005, name: 'Сталь', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 18 }]
    },
    description: 'Малыш Динозаврик 2 уровня',
    imageUrl: '/buildings/Подарки/Малышы/дино/733.webp'
  },
  {
    id: 73901,
    name: 'Малыш (Динозаврик) 3',
    englishName: 'Baby Dino 3',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 136 }],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 7
    },
    upgradesTo: 74001,
    upgradeCost: 2270000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 10 },
        { id: 10005, name: 'Сталь', amount: 22 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 6 }]
    },
    description: 'Малыш Динозаврик 3 уровня',
    imageUrl: '/buildings/Подарки/Малышы/дино/733.webp'
  },
  {
    id: 74001,
    name: 'Малыш (Динозаврик) 4',
    englishName: 'Baby Dino 4',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 227 }],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 16
    },
    upgradesTo: 74101,
    upgradeCost: 3440000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 18 },
        { id: 10015, name: 'Супер детонатор', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 612 }]
    },
    description: 'Малыш Динозаврик 4 уровня',
    imageUrl: '/buildings/Подарки/Малышы/дино/735.webp'
  },
  {
    id: 74101,
    name: 'Малыш (Динозаврик) 5',
    englishName: 'Baby Dino 5',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 3440000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 344 }],
      population: 75
    },
    stats: {
      constructionTimeSeconds: 1262025,
      accelerationCost: 237,
      durability: 21000,
      gloryOnExplosion: 172000,
      populationBonus: 34
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 71 },
        { id: 10006, name: 'Стальной лист', amount: 29 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 284 }]
    },
    description: 'Малыш Динозаврик 5 уровня',
    imageUrl: '/buildings/Подарки/Малышы/дино/741.webp'
  },
  // Малыши (Babies) - Поросёнок (Piglet)
  {
    id: 74201,
    name: 'Малыш (Поросёнок) 1',
    englishName: 'Baby Piglet 1',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 32 }],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    upgradesTo: 74301,
    upgradeCost: 710000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 2 },
        { id: 10005, name: 'Сталь', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 12 }]
    },
    description: 'Малыш Поросёнок 1 уровня',
    imageUrl: '/buildings/Подарки/Малышы/поросенок/746.webp'
  },
  {
    id: 74301,
    name: 'Малыш (Поросёнок) 2',
    englishName: 'Baby Piglet 2',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 71 }],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 2
    },
    upgradesTo: 74401,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 10 },
        { id: 10036, name: 'Изумрудная руда', amount: 3 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 3 }]
    },
    description: 'Малыш Поросёнок 2 уровня',
    imageUrl: '/buildings/Подарки/Малышы/поросенок/733.webp'
  },
  {
    id: 74401,
    name: 'Малыш (Поросёнок) 3',
    englishName: 'Baby Piglet 3',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 136 }],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 7
    },
    upgradesTo: 74501,
    upgradeCost: 2270000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 118 },
        { id: 10005, name: 'Сталь', amount: 22 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 314 }]
    },
    description: 'Малыш Поросёнок 3 уровня',
    imageUrl: '/buildings/Подарки/Малышы/поросенок/733.webp'
  },
  {
    id: 74501,
    name: 'Малыш (Поросёнок) 4',
    englishName: 'Baby Piglet 4',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 227 }],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 16
    },
    upgradesTo: 74601,
    upgradeCost: 3440000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 18 },
        { id: 10005, name: 'Сталь', amount: 43 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 164 }]
    },
    description: 'Малыш Поросёнок 4 уровня',
    imageUrl: '/buildings/Подарки/Малышы/поросенок/735.webp'
  },
  {
    id: 74601,
    name: 'Малыш (Поросёнок) 5',
    englishName: 'Baby Piglet 5',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 3440000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 344 }],
      population: 75
    },
    stats: {
      constructionTimeSeconds: 1262025,
      accelerationCost: 237,
      durability: 21000,
      gloryOnExplosion: 172000,
      populationBonus: 34
    },
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 17 },
        { id: 10006, name: 'Стальной лист', amount: 29 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 135 }]
    },
    description: 'Малыш Поросёнок 5 уровня',
    imageUrl: '/buildings/Подарки/Малышы/поросенок/746.webp'
  },
  // Малыши (Babies) - Кот (Cat)
  {
    id: 74701,
    name: 'Малыш (Кот) 1',
    englishName: 'Baby Cat 1',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 32 }],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    upgradesTo: 74801,
    upgradeCost: 710000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 16 },
        { id: 10005, name: 'Сталь', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 6 }]
    },
    description: 'Малыш Кот 1 уровня',
    imageUrl: '/buildings/Подарки/Малышы/кот/751.webp'
  },
  {
    id: 74801,
    name: 'Малыш (Кот) 2',
    englishName: 'Baby Cat 2',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 71 }],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 2
    },
    upgradesTo: 74901,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 10 },
        { id: 10006, name: 'Стальной лист', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 136 }]
    },
    description: 'Малыш Кот 2 уровня',
    imageUrl: '/buildings/Подарки/Малышы/кот/733.webp'
  },
  {
    id: 74901,
    name: 'Малыш (Кот) 3',
    englishName: 'Baby Cat 3',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 136 }],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 7
    },
    upgradesTo: 75001,
    upgradeCost: 2270000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 21 },
        { id: 10036, name: 'Изумрудная руда', amount: 6 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 84 }]
    },
    description: 'Малыш Кот 3 уровня',
    imageUrl: '/buildings/Подарки/Малышы/кот/733.webp'
  },
  {
    id: 75001,
    name: 'Малыш (Кот) 4',
    englishName: 'Baby Cat 4',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 227 }],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 16
    },
    upgradesTo: 75101,
    upgradeCost: 3440000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 230 },
        { id: 10005, name: 'Сталь', amount: 43 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 78 }]
    },
    description: 'Малыш Кот 4 уровня',
    imageUrl: '/buildings/Подарки/Малышы/кот/735.webp'
  },
  {
    id: 75101,
    name: 'Малыш (Кот) 5',
    englishName: 'Baby Cat 5',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 3440000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 344 }],
      population: 75
    },
    stats: {
      constructionTimeSeconds: 1262025,
      accelerationCost: 237,
      durability: 21000,
      gloryOnExplosion: 172000,
      populationBonus: 34
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 31 },
        { id: 10015, name: 'Супер детонатор', amount: 17 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 18 }]
    },
    description: 'Малыш Кот 5 уровня',
    imageUrl: '/buildings/Подарки/Малышы/кот/751.webp'
  },
  // Малыши (Babies) - Ангел мальчик (Angel Boy)
  {
    id: 75701,
    name: 'Малыш (Ангел мальчик) 1',
    englishName: 'Baby Angel Boy 1',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 32 }],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    upgradesTo: 75801,
    upgradeCost: 710000,
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 2 },
        { id: 10027, name: 'Яйцо Горыныча', amount: 4 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 42 }]
    },
    description: 'Малыш Ангел мальчик 1 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ МАЛЬЧИК/761.webp'
  },
  {
    id: 75801,
    name: 'Малыш (Ангел мальчик) 2',
    englishName: 'Baby Angel Boy 2',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 71 }],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 2
    },
    upgradesTo: 75901,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 4 },
        { id: 10015, name: 'Супер детонатор', amount: 3 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 18 }]
    },
    description: 'Малыш Ангел мальчик 2 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ МАЛЬЧИК/733.webp'
  },
  {
    id: 75901,
    name: 'Малыш (Ангел мальчик) 3',
    englishName: 'Baby Angel Boy 3',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 136 }],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 7
    },
    upgradesTo: 76001,
    upgradeCost: 2270000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 5 },
        { id: 10006, name: 'Стальной лист', amount: 9 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 6 }]
    },
    description: 'Малыш Ангел мальчик 3 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ МАЛЬЧИК/733.webp'
  },
  {
    id: 76001,
    name: 'Малыш (Ангел мальчик) 4',
    englishName: 'Baby Angel Boy 4',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 227 }],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 16
    },
    upgradesTo: 76101,
    upgradeCost: 3440000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 41 },
        { id: 10006, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 612 }]
    },
    description: 'Малыш Ангел мальчик 4 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ МАЛЬЧИК/735.webp'
  },
  {
    id: 76101,
    name: 'Малыш (Ангел мальчик) 5',
    englishName: 'Baby Angel Boy 5',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 3440000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 344 }],
      population: 75
    },
    stats: {
      constructionTimeSeconds: 1262025,
      accelerationCost: 237,
      durability: 21000,
      gloryOnExplosion: 172000,
      populationBonus: 34
    },
    drops: {
      frequent: [
        { id: 10037, name: 'Изумруды', amount: 9 },
        { id: 10036, name: 'Изумрудная руда', amount: 19 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 284 }]
    },
    description: 'Малыш Ангел мальчик 5 уровня',
    imageUrl: '/buildings/Подарки/Малышы/АНГЕЛ МАЛЬЧИК/761.webp'
  },
  // Малыши (Babies) - Панда (Panda)
  {
    id: 76201,
    name: 'Малыш (Панда) 1',
    englishName: 'Baby Panda 1',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 32 }],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    upgradesTo: 76301,
    upgradeCost: 710000,
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 2 },
        { id: 10026, name: 'Супер репка', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 12 }]
    },
    description: 'Малыш Панда 1 уровня',
    imageUrl: '/buildings/Подарки/Малышы/малыш медведь/731.webp'
  },
  {
    id: 76301,
    name: 'Малыш (Панда) 2',
    englishName: 'Baby Panda 2',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 71 }],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 2
    },
    upgradesTo: 76401,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 4 },
        { id: 10005, name: 'Сталь', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 3 }]
    },
    description: 'Малыш Панда 2 уровня',
    imageUrl: '/buildings/Подарки/Малышы/панда/733.webp'
  },
  {
    id: 76401,
    name: 'Малыш (Панда) 3',
    englishName: 'Baby Panda 3',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 136 }],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 7
    },
    upgradesTo: 76501,
    upgradeCost: 2270000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 10 },
        { id: 10015, name: 'Супер детонатор', amount: 5 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 314 }]
    },
    description: 'Малыш Панда 3 уровня',
    imageUrl: '/buildings/Подарки/Малышы/панда/733.webp'
  },
  {
    id: 76501,
    name: 'Малыш (Панда) 4',
    englishName: 'Baby Panda 4',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 227 }],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 16
    },
    upgradesTo: 76601,
    upgradeCost: 3440000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 10 },
        { id: 10006, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 164 }]
    },
    description: 'Малыш Панда 4 уровня',
    imageUrl: '/buildings/Подарки/Малышы/панда/735.webp'
  },
  {
    id: 76601,
    name: 'Малыш (Панда) 5',
    englishName: 'Baby Panda 5',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 3440000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 344 }],
      population: 75
    },
    stats: {
      constructionTimeSeconds: 1262025,
      accelerationCost: 237,
      durability: 21000,
      gloryOnExplosion: 172000,
      populationBonus: 34
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 71 },
        { id: 10036, name: 'Изумрудная руда', amount: 19 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 135 }]
    },
    description: 'Малыш Панда 5 уровня',
    imageUrl: '/buildings/Подарки/Малышы/малыш медведь/731.webp'
  },
  // Малыши (Babies) - Лягушонок (Frog)
  {
    id: 76801,
    name: 'Малыш (Лягушонок) 1',
    englishName: 'Baby Frog 1',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 320000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 32 }],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 268575,
      accelerationCost: 110,
      durability: 4176,
      gloryOnExplosion: 16000,
      populationBonus: 1
    },
    upgradesTo: 76901,
    upgradeCost: 710000,
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 2 },
        { id: 10026, name: 'Супер репка', amount: 3 },
        { id: 999, name: 'монеты', amount: 7853 }
      ],
      rare: [{ id: 10006, name: 'Стальной лист', amount: 17 }]
    },
    description: 'Малыш Лягушонок 1 уровня',
    imageUrl: '/buildings/Подарки/Малышы/лягушонок/772.webp'
  },
  {
    id: 76901,
    name: 'Малыш (Лягушонок) 2',
    englishName: 'Baby Frog 2',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 710000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 71 }],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 7488,
      gloryOnExplosion: 35500,
      populationBonus: 2
    },
    upgradesTo: 77001,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 4 },
        { id: 10005, name: 'Сталь', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 37 }]
    },
    description: 'Малыш Лягушонок 2 уровня',
    imageUrl: '/buildings/Подарки/Малышы/лягушонок/733.webp'
  },
  {
    id: 77001,
    name: 'Малыш (Лягушонок) 3',
    englishName: 'Baby Frog 3',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 136 }],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 11406,
      gloryOnExplosion: 68000,
      populationBonus: 7
    },
    upgradesTo: 77101,
    upgradeCost: 2270000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 10 },
        { id: 10015, name: 'Супер детонатор', amount: 5 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 40 }]
    },
    description: 'Малыш Лягушонок 3 уровня',
    imageUrl: '/buildings/Подарки/Малышы/лягушонок/733.webp'
  },
  {
    id: 77101,
    name: 'Малыш (Лягушонок) 4',
    englishName: 'Baby Frog 4',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 2270000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 227 }],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 15924,
      gloryOnExplosion: 113500,
      populationBonus: 16
    },
    upgradesTo: 77201,
    upgradeCost: 3440000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 10 },
        { id: 10006, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 11 }]
    },
    description: 'Малыш Лягушонок 4 уровня',
    imageUrl: '/buildings/Подарки/Малышы/лягушонок/735.webp'
  },
  {
    id: 77201,
    name: 'Малыш (Лягушонок) 5',
    englishName: 'Baby Frog 5',
    category: 'Подарки',
    giftSubCategory: 'babies',
    type: BuildingType.Default,
    price: 3440000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10042, name: 'Сердце', amount: 344 }],
      population: 75
    },
    stats: {
      constructionTimeSeconds: 1262025,
      accelerationCost: 237,
      durability: 21000,
      gloryOnExplosion: 172000,
      populationBonus: 34
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 71 },
        { id: 10036, name: 'Изумрудная руда', amount: 19 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 1064 }]
    },
    description: 'Малыш Лягушонок 5 уровня',
    imageUrl: '/buildings/Подарки/Малышы/лягушонок/772.webp'
  },
  // 8 марта (March 8) buildings
  {
    id: 44601,
    name: 'Машина страсти',
    englishName: 'Machine of Passion',
    category: 'Подарки',
    giftSubCategory: 'march8',
    type: BuildingType.Default,
    rubyPrice: 370,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 13848,
      gloryOnExplosion: 92500,
      populationBonus: 5
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 14 },
        { id: 10015, name: 'Супер детонатор', amount: 8 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 59 }]
    },
    description: 'Часть механизма любви. Part of the mechanism of love.',
    imageUrl: '/buildings/Подарки/8 марта/Машина страсти/Машина страсти 446.webp'
  },
  {
    id: 44701,
    name: 'Генератор гармонии',
    englishName: 'Generator of Harmony',
    category: 'Подарки',
    giftSubCategory: 'march8',
    type: BuildingType.Default,
    rubyPrice: 370,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 13848,
      gloryOnExplosion: 92500,
      populationBonus: 5
    },
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 8 },
        { id: 10006, name: 'Стальной лист', amount: 13 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 8 }]
    },
    description: 'Часть механизма любви. Part of the mechanism of love.',
    imageUrl: '/buildings/Подарки/8 марта/Машина страсти/Генератор гармонии 447.webp'
  },
  {
    id: 44801,
    name: 'Излучатель красоты',
    englishName: 'Emitter of Beauty',
    category: 'Подарки',
    giftSubCategory: 'march8',
    type: BuildingType.Default,
    rubyPrice: 370,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 13848,
      gloryOnExplosion: 92500,
      populationBonus: 5
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 31 },
        { id: 10006, name: 'Стальной лист', amount: 13 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 463 }]
    },
    description: 'Часть механизма любви. Part of the mechanism of love.',
    imageUrl: '/buildings/Подарки/8 марта/Машина страсти/Излучатель красоты 448.webp'
  },
  {
    id: 44901,
    name: 'Аккумулятор счастья',
    englishName: 'Battery of Happiness',
    category: 'Подарки',
    giftSubCategory: 'march8',
    type: BuildingType.Default,
    rubyPrice: 370,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 13848,
      gloryOnExplosion: 92500,
      populationBonus: 5
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 31 },
        { id: 10036, name: 'Изумрудная руда', amount: 9 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 124 }]
    },
    description: 'Часть механизма любви. Part of the mechanism of love.',
    imageUrl: '/buildings/Подарки/8 марта/Машина страсти/Аккумулятор счастья 449.webp'
  },
  // 8 марта - Кулоны (Pendants)
  {
    id: 22101,
    name: 'Серебряный кулон',
    englishName: 'Silver Pendant',
    category: 'Подарки',
    giftSubCategory: 'march8',
    type: BuildingType.Default,
    rubyPrice: 300,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 12468,
      gloryOnExplosion: 75000,
      populationBonus: 4
    },
    upgradesTo: 22201,
    upgradeCost: 400,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 25 },
        { id: 10036, name: 'Изумрудная руда', amount: 7 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 100 }]
    },
    description: 'Элегантный серебряный кулон для особого случая',
    imageUrl: '/buildings/Подарки/8 марта/Серебряный Кулон/221.webp'
  },
  {
    id: 22201,
    name: 'Золотой кулон',
    englishName: 'Golden Pendant',
    category: 'Подарки',
    giftSubCategory: 'march8',
    type: BuildingType.Default,
    rubyPrice: 400,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 19050,
      gloryOnExplosion: 100000,
      populationBonus: 7
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 328 },
        { id: 10005, name: 'Сталь', amount: 62 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 111 }]
    },
    description: 'Роскошный золотой кулон для особого случая',
    imageUrl: '/buildings/Подарки/8 марта/Серебряный Кулон/222.webp'
  },
  // 8 марта - Рубиновое сердце (Ruby Heart)
  {
    id: 26001,
    name: 'Рубиновое сердце 1',
    englishName: 'Ruby Heart 1',
    category: 'Подарки',
    giftSubCategory: 'march8',
    type: BuildingType.Default,
    rubyPrice: 350,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 13470,
      gloryOnExplosion: 87500,
      populationBonus: 6
    },
    upgradesTo: 26101,
    upgradeCost: 450,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 13 },
        { id: 10015, name: 'Супер детонатор', amount: 7 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 438 }]
    },
    description: 'Символ любви и страсти',
    imageUrl: '/buildings/Подарки/8 марта/Рубиновое Серце/260.webp'
  },
  {
    id: 26101,
    name: 'Рубиновое сердце 2',
    englishName: 'Ruby Heart 2',
    category: 'Подарки',
    giftSubCategory: 'march8',
    type: BuildingType.Default,
    rubyPrice: 450,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 20364,
      gloryOnExplosion: 112500,
      populationBonus: 6
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 67 },
        { id: 10006, name: 'Стальной лист', amount: 27 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 267 }]
    },
    description: 'Символ любви и страсти',
    imageUrl: '/buildings/Подарки/8 марта/Рубиновое Серце/261.webp'
  },
  // Роза (Rose) - Main Gifts tab
  {
    id: 26301,
    name: 'Роза',
    englishName: 'Rose',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 500,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 16098,
      gloryOnExplosion: 125000,
      populationBonus: 6
    },
    upgradesTo: 26401,
    upgradeCost: 600,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 42 },
        { id: 10036, name: 'Изумрудная руда', amount: 12 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 11 }]
    },
    description: 'Прекрасная роза для вашего города',
    imageUrl: '/buildings/Подарки/Основные/Роза/263.webp'
  },
  {
    id: 26401,
    name: 'Розы',
    englishName: 'Roses',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 600,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 23880,
      gloryOnExplosion: 150000,
      populationBonus: 10
    },
    upgradesTo: 26501,
    upgradeCost: 700,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 40 },
        { id: 10005, name: 'Сталь', amount: 96 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 1375 }]
    },
    description: 'Прекрасные розы для вашего города',
    imageUrl: '/buildings/Подарки/Основные/Роза/264.webp'
  },
  {
    id: 26501,
    name: 'Розы',
    englishName: 'Roses',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 700,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 30546,
      gloryOnExplosion: 175000,
      populationBonus: 9
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 66 },
        { id: 10015, name: 'Супер детонатор', amount: 35 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 600 }]
    },
    description: 'Прекрасные розы для вашего города',
    imageUrl: '/buildings/Подарки/Основные/Роза/265.webp'
  },
  // HELLOWEEN buildings - Фонарь Джека (Jack-o'-lantern)
  {
    id: 35601,
    name: 'Фонарь Джека 1',
    englishName: "Jack-o'-lantern 1",
    category: 'Подарки',
    giftSubCategory: 'halloween',
    type: BuildingType.Default,
    price: 300000,
    buildable: true,
    constructionRequirements: {
      resources: [{ id: 10004, name: 'Куски супер тыквы', amount: 200 }],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 8568,
      gloryOnExplosion: 15000,
      populationBonus: 2
    },
    upgradesTo: 35701,
    upgradeCost: 100000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 6 },
        { id: 10015, name: 'Супер детонатор', amount: 3 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 177 }]
    },
    description: 'Какой же Хэллоуин без фонаря из тыквы, с горящей дьявольской усмешкой?',
    imageUrl: '/buildings/Подарки/Halloween/Фонарь Джека 1/356.webp'
  },
  {
    id: 35701,
    name: 'Фонарь Джека 2',
    englishName: "Jack-o'-lantern 2",
    category: 'Подарки',
    giftSubCategory: 'halloween',
    type: BuildingType.Default,
    price: 100000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10004, name: 'Куски супер тыквы', amount: 80 }],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 10086,
      gloryOnExplosion: 5000,
      populationBonus: 6
    },
    upgradesTo: 35801,
    upgradeCost: 100000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 4 },
        { id: 10006, name: 'Стальной лист', amount: 7 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 66 }]
    },
    description: "What's Halloween without a lantern pumpkin with burning devilish grin?",
    imageUrl: '/buildings/Подарки/Halloween/Фонарь Джека 1/357.webp'
  },
  {
    id: 35801,
    name: 'Фонарь Джека 3',
    englishName: "Jack-o'-lantern 3",
    category: 'Подарки',
    giftSubCategory: 'halloween',
    type: BuildingType.Default,
    price: 100000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10004, name: 'Куски супер тыквы', amount: 80 }],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 11406,
      gloryOnExplosion: 5000,
      populationBonus: 12
    },
    upgradesTo: 35901,
    upgradeCost: 100000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 21 },
        { id: 10006, name: 'Стальной лист', amount: 9 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 40 }]
    },
    description: "What's Halloween without a lantern pumpkin with burning devilish grin?",
    imageUrl: '/buildings/Подарки/Halloween/Фонарь Джека 1/358.webp'
  },
  {
    id: 35901,
    name: 'Фонарь Джека 4',
    englishName: "Jack-o'-lantern 4",
    category: 'Подарки',
    giftSubCategory: 'halloween',
    type: BuildingType.Default,
    price: 100000,
    buildable: false,
    constructionRequirements: {
      resources: [{ id: 10004, name: 'Куски супер тыквы', amount: 80 }],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 12582,
      gloryOnExplosion: 5000,
      populationBonus: 16
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 26 },
        { id: 10036, name: 'Изумрудная руда', amount: 7 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 7 }]
    },
    description: "What's Halloween without a lantern pumpkin with burning devilish grin?",
    imageUrl: '/buildings/Подарки/Halloween/Фонарь Джека 1/359.webp'
  },
  // HELLOWEEN - Принцесса/Королева ужаса (Horror Princess/Queen)
  {
    id: 33301,
    name: 'Принцесса ужаса',
    englishName: 'Horror Princess',
    category: 'Подарки',
    giftSubCategory: 'halloween',
    type: BuildingType.Default,
    rubyPrice: 400,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 14400,
      gloryOnExplosion: 100000,
      populationBonus: 7
    },
    upgradesTo: 33401,
    upgradeCost: 100,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 8 },
        { id: 10006, name: 'Стальной лист', amount: 14 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 134 }]
    },
    description: 'Владычица тьмы, правящая ночью Хэллоуина',
    imageUrl: '/buildings/Подарки/Halloween/Принцесса ужаса/333.webp'
  },
  {
    id: 33401,
    name: 'Королева ужаса',
    englishName: 'Horror Queen',
    category: 'Подарки',
    giftSubCategory: 'halloween',
    type: BuildingType.Default,
    rubyPrice: 100,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 16098,
      gloryOnExplosion: 25000,
      populationBonus: 14
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 42 },
        { id: 10006, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 79 }]
    },
    description: 'Верховная правительница мира теней и ужаса',
    imageUrl: '/buildings/Подарки/Halloween/Принцесса ужаса/334.webp'
  },
  // HELLOWEEN - Принц/Король ужаса (Horror Prince/King)
  {
    id: 33501,
    name: 'Принц ужаса',
    englishName: 'Horror Prince',
    category: 'Подарки',
    giftSubCategory: 'halloween',
    type: BuildingType.Default,
    rubyPrice: 500,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 16098,
      gloryOnExplosion: 125000,
      populationBonus: 14
    },
    upgradesTo: 33601,
    upgradeCost: 100,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 42 },
        { id: 10036, name: 'Изумрудная руда', amount: 12 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 11 }]
    },
    description: 'Тёмный принц, владыка ночи и страха',
    imageUrl: '/buildings/Подарки/Halloween/Принц ужаса/335.webp'
  },
  {
    id: 33601,
    name: 'Король ужаса',
    englishName: 'Horror King',
    category: 'Подарки',
    giftSubCategory: 'halloween',
    type: BuildingType.Default,
    rubyPrice: 100,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 17634,
      gloryOnExplosion: 25000,
      populationBonus: 16
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 281 },
        { id: 10005, name: 'Сталь', amount: 53 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 750 }]
    },
    description: 'Верховный повелитель царства тьмы',
    imageUrl: '/buildings/Подарки/Halloween/Принц ужаса/335.webp'
  },
  // Весеннее Обновление (Spring Update) - Весенний букет (Spring Bouquet)
  {
    id: 34101,
    name: 'Весенний букет',
    englishName: 'Spring Bouquet',
    category: 'Подарки',
    giftSubCategory: 'spring',
    type: BuildingType.Default,
    rubyPrice: 350,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 13470,
      gloryOnExplosion: 87500,
      populationBonus: 5
    },
    upgradesTo: 34201,
    upgradeCost: 350,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 30 },
        { id: 10036, name: 'Изумрудная руда', amount: 8 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 117 }]
    },
    description: 'Прекрасный букет весенних цветов',
    imageUrl: '/buildings/Подарки/Весеннее Обновление/341.webp'
  },
  {
    id: 34201,
    name: 'Весенний букет',
    englishName: 'Spring Bouquet',
    category: 'Подарки',
    giftSubCategory: 'spring',
    type: BuildingType.Default,
    rubyPrice: 350,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 19050,
      gloryOnExplosion: 87500,
      populationBonus: 6
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 328 },
        { id: 10005, name: 'Сталь', amount: 62 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 111 }]
    },
    description: 'Прекрасный букет весенних цветов',
    imageUrl: '/buildings/Подарки/Весеннее Обновление/342.webp'
  },
  // 14 февраля (Valentine's Day) - Перстни (Rings)
  {
    id: 22601,
    name: 'Серебряный перстень',
    englishName: 'Silver Finger Ring',
    category: 'Подарки',
    giftSubCategory: 'valentine',
    type: BuildingType.Default,
    rubyPrice: 500,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 16098,
      gloryOnExplosion: 125000,
      populationBonus: 8
    },
    upgradesTo: 22701,
    upgradeCost: 600,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 42 },
        { id: 10006, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 79 }]
    },
    description: 'Изящный серебряный перстень символизирует чистую любовь',
    imageUrl: '/buildings/Подарки/14 Февраля/Серебряный перстень/226.webp'
  },
  {
    id: 22701,
    name: 'Золотой перстень',
    englishName: 'Golden Finger Ring',
    category: 'Подарки',
    giftSubCategory: 'valentine',
    type: BuildingType.Default,
    rubyPrice: 600,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 23880,
      gloryOnExplosion: 150000,
      populationBonus: 14
    },
    drops: {
      frequent: [
        { id: 10037, name: 'Изумруды', amount: 12 },
        { id: 10036, name: 'Изумрудная руда', amount: 25 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 24 }]
    },
    description: 'Великолепный золотой перстень символизирует вечную любовь',
    imageUrl: '/buildings/Подарки/14 Февраля/Серебряный перстень/227.webp'
  },
  // 14 февраля - Самолёт (Plane)
  {
    id: 30201,
    name: 'Самолёт 1',
    englishName: 'Plane 1',
    category: 'Подарки',
    giftSubCategory: 'valentine',
    type: BuildingType.Default,
    rubyPrice: 300,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 12468,
      gloryOnExplosion: 75000,
      populationBonus: 5
    },
    upgradesTo: 30301,
    upgradeCost: 350,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 11 },
        { id: 10015, name: 'Супер детонатор', amount: 6 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10037, name: 'Изумруды', amount: 48 }]
    },
    description: 'Самолёт любви доставит ваши чувства к самому сердцу',
    imageUrl: '/buildings/Подарки/14 Февраля/самолет 1/302.webp'
  },
  {
    id: 30301,
    name: 'Самолёт 2',
    englishName: 'Plane 2',
    category: 'Подарки',
    giftSubCategory: 'valentine',
    type: BuildingType.Default,
    rubyPrice: 350,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 18354,
      gloryOnExplosion: 87500,
      populationBonus: 4
    },
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 13 },
        { id: 10006, name: 'Стальной лист', amount: 22 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 14 }]
    },
    description: 'Самолёт любви доставит ваши чувства к самому сердцу',
    imageUrl: '/buildings/Подарки/14 Февраля/самолет 1/303.webp'
  },
  // Статуя дракона (Dragon Statue) - Main Gifts tab
  {
    id: 14401,
    name: 'Статуя дракона',
    englishName: 'Statue of Dragon',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 1000,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 22770,
      gloryOnExplosion: 250000,
      populationBonus: 17
    },
    upgradesTo: 14501,
    upgradeCost: 1200,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 37 },
        { id: 10005, name: 'Сталь', amount: 88 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 1250 }]
    },
    description: 'Приносит удачу в новом году. Brings luck in new year.',
    imageUrl: '/buildings/Подарки/Основные/Статуя дракона/144.webp'
  },
  {
    id: 14501,
    name: 'Золотая статуя дракона',
    englishName: 'Golden Statue of Dragon',
    category: 'Подарки',
    type: BuildingType.Default,
    rubyPrice: 1200,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 50000,
      gloryOnExplosion: 300000,
      populationBonus: 15
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 80 },
        { id: 10015, name: 'Супер детонатор', amount: 43 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 734 }]
    },
    description: 'Приносит удачу в новом году. Brings luck in new year.',
    imageUrl: '/buildings/Подарки/Основные/Статуя дракона/145.webp'
  },
  // Статуя Гнома Воителя (Statue Dwarf Warrior) - Statues category
  {
    id: 49001,
    name: 'Статуя Гнома Воителя',
    englishName: 'Statue Dwarf Warrior',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1060000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 2120 },
        { id: 10003, name: 'Куски супер гриба', amount: 31 }
      ],
      population: 28
    },
    stats: {
      constructionTimeSeconds: 560,
      accelerationCost: 5,
      durability: 10368,
      gloryOnExplosion: 53000,
      populationBonus: 0
    },
    upgradesTo: 49101,
    upgradeCost: 1240000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 10 },
        { id: 10008, name: 'Стальной лист', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 19 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49101,
    name: 'Статуя Гнома Воителя уровень - 2',
    englishName: 'Statue Dwarf Warrior Level 2',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1240000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1240 },
        { id: 10006, name: 'Каменные блоки', amount: 124 },
        { id: 10003, name: 'Куски супер гриба', amount: 18 }
      ],
      population: 30
    },
    stats: {
      constructionTimeSeconds: 81000,
      accelerationCost: 60,
      durability: 11712,
      gloryOnExplosion: 62000,
      populationBonus: 0
    },
    upgradesTo: 49201,
    upgradeCost: 1540000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 13 },
        { id: 10036, name: 'Изумрудная руда', amount: 4 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 4 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49201,
    name: 'Статуя Гнома Воителя уровень - 3',
    englishName: 'Statue Dwarf Warrior Level 3',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1540000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1540 },
        { id: 10006, name: 'Каменные блоки', amount: 154 },
        { id: 10003, name: 'Куски супер гриба', amount: 23 }
      ],
      population: 32
    },
    stats: {
      constructionTimeSeconds: 11904,
      accelerationCost: 66,
      durability: 13584,
      gloryOnExplosion: 77000,
      populationBonus: 0
    },
    upgradesTo: 49301,
    upgradeCost: 1960000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 94 },
        { id: 10009, name: 'Сталь', amount: 18 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 251 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49301,
    name: 'Статуя Гнома Воителя уровень - 4',
    englishName: 'Statue Dwarf Warrior Level 4',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1960000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 20 },
        { id: 10006, name: 'Каменные блоки', amount: 196 },
        { id: 10023, name: 'Сталь', amount: 4 }
      ],
      population: 35
    },
    stats: {
      constructionTimeSeconds: 42225,
      accelerationCost: 76,
      durability: 15904,
      gloryOnExplosion: 98000,
      populationBonus: 0
    },
    upgradesTo: 49401,
    upgradeCost: 2500000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 10 },
        { id: 10009, name: 'Сталь', amount: 24 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 92 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49401,
    name: 'Статуя Гнома Воителя уровень - 5',
    englishName: 'Statue Dwarf Warrior Level 5',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 2500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 25 },
        { id: 10006, name: 'Каменные блоки', amount: 250 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      population: 38
    },
    stats: {
      constructionTimeSeconds: 78216,
      accelerationCost: 86,
      durability: 18592,
      gloryOnExplosion: 125000,
      populationBonus: 0
    },
    upgradesTo: 49501,
    upgradeCost: 3160000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 14 },
        { id: 10015, name: 'Супер детонатор', amount: 8 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 60 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49501,
    name: 'Статуя Гнома Воителя уровень - 6',
    englishName: 'Statue Dwarf Warrior Level 6',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 3160000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 32 },
        { id: 10006, name: 'Каменные блоки', amount: 316 },
        { id: 10023, name: 'Сталь', amount: 7 }
      ],
      population: 40
    },
    stats: {
      constructionTimeSeconds: 192000,
      accelerationCost: 92,
      durability: 21584,
      gloryOnExplosion: 158000,
      populationBonus: 0
    },
    upgradesTo: 49601,
    upgradeCost: 3940000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 10 },
        { id: 10008, name: 'Стальной лист', amount: 17 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 11 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49601,
    name: 'Статуя Гнома Воителя уровень - 7',
    englishName: 'Statue Dwarf Warrior Level 7',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 3940000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 39 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 9 }
      ],
      population: 43
    },
    stats: {
      constructionTimeSeconds: 238521,
      accelerationCost: 103,
      durability: 24848,
      gloryOnExplosion: 197000,
      populationBonus: 0
    },
    upgradesTo: 49701,
    upgradeCost: 4840000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 56 },
        { id: 10008, name: 'Стальной лист', amount: 23 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 838 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49701,
    name: 'Статуя Гнома Воителя уровень - 8',
    englishName: 'Statue Dwarf Warrior Level 8',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 4840000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 48 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 11 }
      ],
      population: 46
    },
    stats: {
      constructionTimeSeconds: 292008,
      accelerationCost: 114,
      durability: 28336,
      gloryOnExplosion: 242000,
      populationBonus: 0
    },
    upgradesTo: 49801,
    upgradeCost: 5860000,
    drops: {
      frequent: [
        { id: 10035, name: 'Изумруды', amount: 10 },
        { id: 10036, name: 'Изумрудная руда', amount: 20 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 291 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49801,
    name: 'Статуя Гнома Воителя уровень - 9',
    englishName: 'Statue Dwarf Warrior Level 9',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 5860000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 59 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 13 }
      ],
      population: 49
    },
    stats: {
      constructionTimeSeconds: 352947,
      accelerationCost: 125,
      durability: 32032,
      gloryOnExplosion: 293000,
      populationBonus: 0
    },
    upgradesTo: 49901,
    upgradeCost: 7000000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 41 },
        { id: 10009, name: 'Сталь', amount: 98 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 176 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 49901,
    name: 'Статуя Гнома Воителя уровень - 10',
    englishName: 'Statue Dwarf Warrior Level 10',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 7000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 70 },
        { id: 10026, name: 'Золото', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 15 }
      ],
      population: 52
    },
    stats: {
      constructionTimeSeconds: 421824,
      accelerationCost: 137,
      durability: 35920,
      gloryOnExplosion: 350000,
      populationBonus: 0
    },
    upgradesTo: 50001,
    upgradeCost: 8260000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 51 },
        { id: 10015, name: 'Супер детонатор', amount: 27 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 30 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50001,
    name: 'Статуя Гнома Воителя уровень - 11',
    englishName: 'Statue Dwarf Warrior Level 11',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 8260000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 11 },
        { id: 10034, name: 'Изумруд', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 27 }
      ],
      population: 55
    },
    stats: {
      constructionTimeSeconds: 499125,
      accelerationCost: 149,
      durability: 39984,
      gloryOnExplosion: 413000,
      populationBonus: 0
    },
    upgradesTo: 50101,
    upgradeCost: 9640000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 34 },
        { id: 10008, name: 'Стальной лист', amount: 58 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 2169 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50101,
    name: 'Статуя Гнома Воителя уровень - 12',
    englishName: 'Statue Dwarf Warrior Level 12',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 9640000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 13 },
        { id: 10034, name: 'Изумруд', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 32 }
      ],
      population: 58
    },
    stats: {
      constructionTimeSeconds: 585336,
      accelerationCost: 161,
      durability: 44208,
      gloryOnExplosion: 482000,
      populationBonus: 0
    },
    upgradesTo: 50201,
    upgradeCost: 11140000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 177 },
        { id: 10008, name: 'Стальной лист', amount: 71 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 707 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50201,
    name: 'Статуя Гнома Воителя уровень - 13',
    englishName: 'Statue Dwarf Warrior Level 13',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 11140000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 15 },
        { id: 10034, name: 'Изумруд', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 36 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 48592,
      gloryOnExplosion: 557000,
      populationBonus: 0
    },
    upgradesTo: 50301,
    upgradeCost: 12760000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 214 },
        { id: 10036, name: 'Изумрудная руда', amount: 57 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 405 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50301,
    name: 'Статуя Гнома Воителя уровень - 14',
    englishName: 'Statue Dwarf Warrior Level 14',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 12760000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 17 },
        { id: 10034, name: 'Изумруд', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 42 }
      ],
      population: 63
    },
    stats: {
      constructionTimeSeconds: 750141,
      accelerationCost: 183,
      durability: 53128,
      gloryOnExplosion: 638000,
      populationBonus: 0
    },
    upgradesTo: 50401,
    upgradeCost: 14500000,
    drops: {
      frequent: [
        { id: 10035, name: 'Изумруды', amount: 33 },
        { id: 10036, name: 'Изумрудная руда', amount: 69 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 65 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50401,
    name: 'Статуя Гнома Воителя уровень - 15',
    englishName: 'Statue Dwarf Warrior Level 15',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 14500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 20 },
        { id: 10034, name: 'Изумруд', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 47 }
      ],
      population: 66
    },
    stats: {
      constructionTimeSeconds: 862488,
      accelerationCost: 196,
      durability: 57800,
      gloryOnExplosion: 725000,
      populationBonus: 0
    },
    upgradesTo: 50501,
    upgradeCost: 16360000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 132 },
        { id: 10009, name: 'Сталь', amount: 316 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 4532 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50501,
    name: 'Статуя Гнома Воителя уровень - 16',
    englishName: 'Statue Dwarf Warrior Level 16',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 16360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 22 },
        { id: 10034, name: 'Изумруд', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 53 }
      ],
      population: 68
    },
    stats: {
      constructionTimeSeconds: 943296,
      accelerationCost: 205,
      durability: 62608,
      gloryOnExplosion: 818000,
      populationBonus: 0
    },
    upgradesTo: 50601,
    upgradeCost: 18340000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 155 },
        { id: 10015, name: 'Супер детонатор', amount: 82 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 1418 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50601,
    name: 'Статуя Гнома Воителя уровень - 17',
    englishName: 'Statue Dwarf Warrior Level 17',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 18340000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 25 },
        { id: 10034, name: 'Изумруд', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 60 }
      ],
      population: 71
    },
    stats: {
      constructionTimeSeconds: 1073733,
      accelerationCost: 218,
      durability: 67552,
      gloryOnExplosion: 917000,
      populationBonus: 0
    },
    upgradesTo: 50701,
    upgradeCost: 20440000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 95 },
        { id: 10008, name: 'Стальной лист', amount: 166 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 782 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50701,
    name: 'Статуя Гнома Воителя уровень - 18',
    englishName: 'Statue Dwarf Warrior Level 18',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 20440000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 28 },
        { id: 10034, name: 'Изумруд', amount: 8 },
        { id: 10023, name: 'Сталь', amount: 67 }
      ],
      population: 74
    },
    stats: {
      constructionTimeSeconds: 1215672,
      accelerationCost: 232,
      durability: 72624,
      gloryOnExplosion: 1022000,
      populationBonus: 0
    },
    upgradesTo: 50801,
    upgradeCost: 22660000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 477 },
        { id: 10008, name: 'Стальной лист', amount: 191 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 120 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50801,
    name: 'Статуя Гнома Воителя уровень - 19',
    englishName: 'Statue Dwarf Warrior Level 19',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 22660000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 31 },
        { id: 10034, name: 'Изумруд', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 74 }
      ],
      population: 76
    },
    stats: {
      constructionTimeSeconds: 1316928,
      accelerationCost: 242,
      durability: 77824,
      gloryOnExplosion: 1133000,
      populationBonus: 0
    },
    upgradesTo: 50901,
    upgradeCost: 25000000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 548 },
        { id: 10036, name: 'Изумрудная руда', amount: 147 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 8215 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 50901,
    name: 'Статуя Гнома Воителя уровень - 20',
    englishName: 'Statue Dwarf Warrior Level 20',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 25000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 34 },
        { id: 10034, name: 'Изумруд', amount: 10 },
        { id: 10023, name: 'Сталь', amount: 82 }
      ],
      population: 79
    },
    stats: {
      constructionTimeSeconds: 1479117,
      accelerationCost: 256,
      durability: 83136,
      gloryOnExplosion: 1250000,
      populationBonus: 0
    },
    upgradesTo: 51001,
    upgradeCost: 27460000,
    drops: {
      frequent: [
        { id: 10035, name: 'Изумруды', amount: 79 },
        { id: 10036, name: 'Изумрудная руда', amount: 167 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 2500 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/490.webp'
  },
  {
    id: 51001,
    name: 'Статуя Гнома Воителя уровень - 21',
    englishName: 'Statue Dwarf Warrior Level 21',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 27460000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 37 },
        { id: 10034, name: 'Изумруд', amount: 11 },
        { id: 10023, name: 'Сталь', amount: 90 }
      ],
      population: 81
    },
    stats: {
      constructionTimeSeconds: 1594323,
      accelerationCost: 266,
      durability: 88576,
      gloryOnExplosion: 1373000,
      populationBonus: 0
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 310 },
        { id: 10009, name: 'Сталь', amount: 742 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 1345 }]
    },
    description: 'Вдохновляет ваших монстров, и они начинают лучше атаковать. Помните, монстры обращают внимание только на самую большую статую и нет смысла строить несколько одинаковых. Inspire your monsters, and they begin to attack the better. Remember, monsters pay attention only to the largest statue and there is no sense to build more of the same.',
    imageUrl: '/buildings/Статуи/Статуя Гнома Воителя/510.webp'
  },
  // Статуя деда Гномороза (Statue of Santa Gnomus) - Statues category
  {
    id: 53301,
    name: 'Статуя деда Гномороза',
    englishName: 'Statue of Santa Gnomus',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1040000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1040 },
        { id: 10003, name: 'Куски супер гриба', amount: 15 }
      ],
      population: 28
    },
    stats: {
      constructionTimeSeconds: 65856,
      accelerationCost: 54,
      durability: 10264,
      gloryOnExplosion: 52000,
      populationBonus: 0
    },
    upgradesTo: 53401,
    upgradeCost: 1160000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 10 },
        { id: 10036, name: 'Изумрудная руда', amount: 3 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 39 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 53401,
    name: 'Статуя деда Гномороза уровень - 2',
    englishName: 'Statue of Santa Gnomus Level 2',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1160000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1160 },
        { id: 10003, name: 'Куски супер гриба', amount: 17 }
      ],
      population: 29
    },
    stats: {
      constructionTimeSeconds: 73167,
      accelerationCost: 57,
      durability: 11328,
      gloryOnExplosion: 58000,
      populationBonus: 0
    },
    upgradesTo: 53501,
    upgradeCost: 1360000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 66 },
        { id: 10009, name: 'Сталь', amount: 13 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 22 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 53501,
    name: 'Статуя деда Гномороза уровень - 3',
    englishName: 'Statue of Santa Gnomus Level 3',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1360000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1360 },
        { id: 10006, name: 'Каменные блоки', amount: 136 },
        { id: 10003, name: 'Куски супер гриба', amount: 20 }
      ],
      population: 31
    },
    stats: {
      constructionTimeSeconds: 2973,
      accelerationCost: 63,
      durability: 12768,
      gloryOnExplosion: 68000,
      populationBonus: 0
    },
    upgradesTo: 53601,
    upgradeCost: 1640000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 7 },
        { id: 10009, name: 'Сталь', amount: 16 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 4 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 53601,
    name: 'Статуя деда Гномороза уровень - 4',
    englishName: 'Statue of Santa Gnomus Level 4',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1640000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1640 },
        { id: 10006, name: 'Каменные блоки', amount: 164 },
        { id: 10003, name: 'Куски супер гриба', amount: 24 }
      ],
      population: 33
    },
    stats: {
      constructionTimeSeconds: 21411,
      accelerationCost: 69,
      durability: 14544,
      gloryOnExplosion: 82000,
      populationBonus: 0
    },
    upgradesTo: 53701,
    upgradeCost: 2000000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 9 },
        { id: 10015, name: 'Супер детонатор', amount: 5 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 287 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 53701,
    name: 'Статуя деда Гномороза уровень - 5',
    englishName: 'Statue of Santa Gnomus Level 5',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 2000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 20 },
        { id: 10006, name: 'Каменные блоки', amount: 200 },
        { id: 10023, name: 'Сталь', amount: 4 }
      ],
      population: 35
    },
    stats: {
      constructionTimeSeconds: 42225,
      accelerationCost: 76,
      durability: 16624,
      gloryOnExplosion: 100000,
      populationBonus: 0
    },
    upgradesTo: 53801,
    upgradeCost: 2440000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 6 },
        { id: 10008, name: 'Стальной лист', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 100 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 53801,
    name: 'Статуя деда Гномороза уровень - 6',
    englishName: 'Statue of Santa Gnomus Level 6',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 2440000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 24 },
        { id: 10006, name: 'Каменные блоки', amount: 244 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      population: 38
    },
    stats: {
      constructionTimeSeconds: 78216,
      accelerationCost: 86,
      durability: 18968,
      gloryOnExplosion: 122000,
      populationBonus: 0
    },
    upgradesTo: 53901,
    upgradeCost: 2960000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 33 },
        { id: 10008, name: 'Стальной лист', amount: 14 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 62 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 53901,
    name: 'Статуя деда Гномороза уровень - 7',
    englishName: 'Statue of Santa Gnomus Level 7',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 2960000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 30 },
        { id: 10006, name: 'Каменные блоки', amount: 296 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      population: 40
    },
    stats: {
      constructionTimeSeconds: 192000,
      accelerationCost: 92,
      durability: 21536,
      gloryOnExplosion: 148000,
      populationBonus: 0
    },
    upgradesTo: 54001,
    upgradeCost: 3560000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 42 },
        { id: 10036, name: 'Изумрудная руда', amount: 12 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 11 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54001,
    name: 'Статуя деда Гномороза уровень - 8',
    englishName: 'Statue of Santa Gnomus Level 8',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 3560000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 36 },
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 8 }
      ],
      population: 43
    },
    stats: {
      constructionTimeSeconds: 238521,
      accelerationCost: 103,
      durability: 24304,
      gloryOnExplosion: 178000,
      populationBonus: 0
    },
    upgradesTo: 54101,
    upgradeCost: 4240000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 300 },
        { id: 10009, name: 'Сталь', amount: 56 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 801 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54101,
    name: 'Статуя деда Гномороза уровень - 9',
    englishName: 'Statue of Santa Gnomus Level 9',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 4240000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 42 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 9 }
      ],
      population: 45
    },
    stats: {
      constructionTimeSeconds: 273375,
      accelerationCost: 110,
      durability: 27248,
      gloryOnExplosion: 212000,
      populationBonus: 0
    },
    upgradesTo: 54201,
    upgradeCost: 5000000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 30 },
        { id: 10015, name: 'Супер детонатор', amount: 16 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 269 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54201,
    name: 'Статуя деда Гномороза уровень - 10',
    englishName: 'Statue of Santa Gnomus Level 10',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 5000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 50 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 11 }
      ],
      population: 48
    },
    stats: {
      constructionTimeSeconds: 331776,
      accelerationCost: 121,
      durability: 30360,
      gloryOnExplosion: 250000,
      populationBonus: 0
    },
    upgradesTo: 54301,
    upgradeCost: 5840000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 20 },
        { id: 10008, name: 'Стальной лист', amount: 34 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 158 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54301,
    name: 'Статуя деда Гномороза уровень - 11',
    englishName: 'Statue of Santa Gnomus Level 11',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 5840000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 58 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 13 }
      ],
      population: 50
    },
    stats: {
      constructionTimeSeconds: 375000,
      accelerationCost: 129,
      durability: 33616,
      gloryOnExplosion: 292000,
      populationBonus: 0
    },
    upgradesTo: 54401,
    upgradeCost: 6760000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 103 },
        { id: 10008, name: 'Стальной лист', amount: 41 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 26 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54401,
    name: 'Статуя деда Гномороза уровень - 12',
    englishName: 'Statue of Santa Gnomus Level 12',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 6760000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 68 },
        { id: 10026, name: 'Золото', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 15 }
      ],
      population: 53
    },
    stats: {
      constructionTimeSeconds: 446631,
      accelerationCost: 141,
      durability: 37024,
      gloryOnExplosion: 338000,
      populationBonus: 0
    },
    upgradesTo: 54501,
    upgradeCost: 7760000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 124 },
        { id: 10036, name: 'Изумрудная руда', amount: 34 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 1859 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54501,
    name: 'Статуя деда Гномороза уровень - 13',
    englishName: 'Statue of Santa Gnomus Level 13',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 7760000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 78 },
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 17 }
      ],
      population: 55
    },
    stats: {
      constructionTimeSeconds: 499125,
      accelerationCost: 149,
      durability: 40560,
      gloryOnExplosion: 388000,
      populationBonus: 0
    },
    upgradesTo: 54601,
    upgradeCost: 8840000,
    drops: {
      frequent: [
        { id: 10035, name: 'Изумруды', amount: 19 },
        { id: 10036, name: 'Изумрудная руда', amount: 40 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 595 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54601,
    name: 'Статуя деда Гномороза уровень - 14',
    englishName: 'Statue of Santa Gnomus Level 14',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 8840000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 88 },
        { id: 10026, name: 'Золото', amount: 8 },
        { id: 10023, name: 'Сталь', amount: 19 }
      ],
      population: 58
    },
    stats: {
      constructionTimeSeconds: 585336,
      accelerationCost: 161,
      durability: 44216,
      gloryOnExplosion: 442000,
      populationBonus: 0
    },
    upgradesTo: 54701,
    upgradeCost: 10000000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 78 },
        { id: 10009, name: 'Сталь', amount: 185 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 335 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54701,
    name: 'Статуя деда Гномороза уровень - 15',
    englishName: 'Statue of Santa Gnomus Level 15',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 10000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 100 },
        { id: 10026, name: 'Золото', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 22 }
      ],
      population: 60
    },
    stats: {
      constructionTimeSeconds: 648000,
      accelerationCost: 170,
      durability: 48000,
      gloryOnExplosion: 500000,
      populationBonus: 0
    },
    upgradesTo: 54801,
    upgradeCost: 11240000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 91 },
        { id: 10015, name: 'Супер детонатор', amount: 48 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 53 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54801,
    name: 'Статуя деда Гномороза уровень - 16',
    englishName: 'Statue of Santa Gnomus Level 16',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 11240000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 15 },
        { id: 10034, name: 'Изумруд', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 37 }
      ],
      population: 62
    },
    stats: {
      constructionTimeSeconds: 714984,
      accelerationCost: 178,
      durability: 51896,
      gloryOnExplosion: 562000,
      populationBonus: 0
    },
    upgradesTo: 54901,
    upgradeCost: 12560000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 56 },
        { id: 10008, name: 'Стальной лист', amount: 98 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 3653 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 54901,
    name: 'Статуя деда Гномороза уровень - 17',
    englishName: 'Statue of Santa Gnomus Level 17',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 12560000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 17 },
        { id: 10034, name: 'Изумруд', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 41 }
      ],
      population: 65
    },
    stats: {
      constructionTimeSeconds: 823875,
      accelerationCost: 191,
      durability: 55904,
      gloryOnExplosion: 628000,
      populationBonus: 0
    },
    upgradesTo: 55001,
    upgradeCost: 13960000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 283 },
        { id: 10008, name: 'Стальной лист', amount: 114 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 1131 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/533.webp'
  },
  {
    id: 55001,
    name: 'Статуя деда Гномороза уровень - 18',
    englishName: 'Statue of Santa Gnomus Level 18',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 13960000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 19 },
        { id: 10034, name: 'Изумруд', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 46 }
      ],
      population: 67
    },
    stats: {
      constructionTimeSeconds: 902289,
      accelerationCost: 200,
      durability: 60016,
      gloryOnExplosion: 698000,
      populationBonus: 0
    },
    upgradesTo: 55101,
    upgradeCost: 15440000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 326 },
        { id: 10036, name: 'Изумрудная руда', amount: 87 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 618 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/553.webp'
  },
  {
    id: 55101,
    name: 'Статуя деда Гномороза уровень - 19',
    englishName: 'Statue of Santa Gnomus Level 19',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 15440000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 21 },
        { id: 10034, name: 'Изумруд', amount: 6 },
        { id: 10023, name: 'Сталь', amount: 50 }
      ],
      population: 69
    },
    stats: {
      constructionTimeSeconds: 985527,
      accelerationCost: 209,
      durability: 64240,
      gloryOnExplosion: 772000,
      populationBonus: 0
    },
    upgradesTo: 55201,
    upgradeCost: 17000000,
    drops: {
      frequent: [
        { id: 10035, name: 'Изумруды', amount: 48 },
        { id: 10036, name: 'Изумрудная руда', amount: 100 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 94 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/553.webp'
  },
  {
    id: 55201,
    name: 'Статуя деда Гномороза уровень - 20',
    englishName: 'Statue of Santa Gnomus Level 20',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 17000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 23 },
        { id: 10034, name: 'Изумруд', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 56 }
      ],
      population: 72
    },
    stats: {
      constructionTimeSeconds: 1119744,
      accelerationCost: 223,
      durability: 68560,
      gloryOnExplosion: 850000,
      populationBonus: 0
    },
    upgradesTo: 55301,
    upgradeCost: 18640000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 186 },
        { id: 10009, name: 'Сталь', amount: 445 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 6375 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/553.webp'
  },
  {
    id: 55301,
    name: 'Статуя деда Гномороза уровень - 21',
    englishName: 'Statue of Santa Gnomus Level 21',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 18640000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 25 },
        { id: 10034, name: 'Изумруд', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 61 }
      ],
      population: 74
    },
    stats: {
      constructionTimeSeconds: 1215672,
      accelerationCost: 232,
      durability: 72976,
      gloryOnExplosion: 932000,
      populationBonus: 0
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 211 },
        { id: 10015, name: 'Супер детонатор', amount: 111 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 1927 }]
    },
    description: 'Легенды рассказывают нам об ужасном Гноморозе, который ходил зимой по фабрикам. Он заставлял гномов работать сверхурочно и забирал всё, что они сделали, в свой бездонный мешок, бормоча при этом что-то про детей, которые хорошо себя вели. С тех пор прошло много лет, но гномы до сих пор дрожат, вспоминая деда Гномороза. Если установить его статую в городе, гномы на фабриках начнут работать быстрей. Legends tell us about the terrible Santa Gnomus, who went to the factories in the winter. He forced the dwarves to work overtime, and taking away all that they have done in their bottomless bag, muttering something about the children who are well-behaved. Since then, many years have passed, but the dwarves still shiver recalling the grandfather Santa Gnomus. If you install this statue in the city, gnomes factories will start working faster.',
    imageUrl: '/buildings/Статуи/Статуя деда Гномороза/553.webp'
  },
  // Статуя ГномБабы (Statue of the Spring Baba) - Statues category
  {
    id: 773,
    name: 'Статуя ГномБабы',
    englishName: 'Statue of the Spring Baba',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 520000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1040 },
        { id: 10003, name: 'Куски супер гриба', amount: 15 },
        { id: 10039, name: 'Символ любви', amount: 104 }
      ],
      population: 24
    },
    stats: {
      constructionTimeSeconds: 480,
      accelerationCost: 5,
      durability: 7264,
      gloryOnExplosion: 26000,
      populationBonus: 0
    },
    upgradesTo: 774,
    upgradeCost: 580000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 5 },
        { id: 10008, name: 'Стальной лист', amount: 2 },
        { id: 999, name: 'монеты', amount: 10631 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 20 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/773.webp'
  },
  {
    id: 774,
    name: 'Статуя ГномБабы - 2',
    englishName: 'Statue of the Spring Baba Level 2',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 580000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 580 },
        { id: 10003, name: 'Куски супер гриба', amount: 9 },
        { id: 10039, name: 'Символ любви', amount: 58 }
      ],
      population: 25
    },
    stats: {
      constructionTimeSeconds: 46875,
      accelerationCost: 46,
      durability: 8008,
      gloryOnExplosion: 29000,
      populationBonus: 0
    },
    upgradesTo: 775,
    upgradeCost: 680000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 33 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 2 },
        { id: 999, name: 'монеты', amount: 10631 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 11 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/773.webp'
  },
  {
    id: 775,
    name: 'Статуя ГномБабы - 3',
    englishName: 'Statue of the Spring Baba Level 3',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 680000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10006, name: 'Каменные блоки', amount: 68 },
        { id: 10003, name: 'Куски супер гриба', amount: 10 },
        { id: 10039, name: 'Символ любви', amount: 68 }
      ],
      population: 26
    },
    stats: {
      constructionTimeSeconds: 52728,
      accelerationCost: 48,
      durability: 9024,
      gloryOnExplosion: 34000,
      populationBonus: 0
    },
    upgradesTo: 776,
    upgradeCost: 820000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 42 },
        { id: 10009, name: 'Сталь', amount: 8 },
        { id: 999, name: 'монеты', amount: 10631 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 2 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/773.webp'
  },
  {
    id: 776,
    name: 'Статуя ГномБабы - 4',
    englishName: 'Statue of the Spring Baba Level 4',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 820000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10006, name: 'Каменные блоки', amount: 82 },
        { id: 10003, name: 'Куски супер гриба', amount: 12 },
        { id: 10039, name: 'Символ любви', amount: 82 }
      ],
      population: 28
    },
    stats: {
      constructionTimeSeconds: 65856,
      accelerationCost: 54,
      durability: 10288,
      gloryOnExplosion: 41000,
      populationBonus: 0
    },
    upgradesTo: 777,
    upgradeCost: 1000000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 5 },
        { id: 10015, name: 'Супер детонатор', amount: 3 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 144 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/773.webp'
  },
  {
    id: 777,
    name: 'Статуя ГномБабы - 5',
    englishName: 'Statue of the Spring Baba Level 5',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 10 },
        { id: 10006, name: 'Каменные блоки', amount: 100 },
        { id: 10023, name: 'Сталь', amount: 2 }
      ],
      population: 30
    },
    stats: {
      constructionTimeSeconds: 81000,
      accelerationCost: 60,
      durability: 11760,
      gloryOnExplosion: 50000,
      populationBonus: 0
    },
    upgradesTo: 778,
    upgradeCost: 1220000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 3 },
        { id: 10008, name: 'Стальной лист', amount: 5 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 50 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/778.webp'
  },
  {
    id: 778,
    name: 'Статуя ГномБабы - 6',
    englishName: 'Statue of the Spring Baba Level 6',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1220000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 12 },
        { id: 10006, name: 'Каменные блоки', amount: 122 },
        { id: 10023, name: 'Сталь', amount: 3 }
      ],
      population: 32
    },
    stats: {
      constructionTimeSeconds: 11904,
      accelerationCost: 66,
      durability: 13416,
      gloryOnExplosion: 61000,
      populationBonus: 0
    },
    upgradesTo: 779,
    upgradeCost: 1480000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 17 },
        { id: 10008, name: 'Стальной лист', amount: 7 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 31 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/778.webp'
  },
  {
    id: 779,
    name: 'Статуя ГномБабы - 7',
    englishName: 'Statue of the Spring Baba Level 7',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1480000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 15 },
        { id: 10006, name: 'Каменные блоки', amount: 148 },
        { id: 10023, name: 'Сталь', amount: 3 }
      ],
      population: 34
    },
    stats: {
      constructionTimeSeconds: 31512,
      accelerationCost: 72,
      durability: 15224,
      gloryOnExplosion: 74000,
      populationBonus: 0
    },
    upgradesTo: 780,
    upgradeCost: 1780000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 21 },
        { id: 10036, name: 'Изумрудная руда', amount: 6 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 6 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/778.webp'
  },
  {
    id: 780,
    name: 'Статуя ГномБабы - 8',
    englishName: 'Statue of the Spring Baba Level 8',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 1780000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 18 },
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 4 },
        { id: 10039, name: 'Символ любви', amount: 178 }
      ],
      population: 36
    },
    stats: {
      constructionTimeSeconds: 53568,
      accelerationCost: 79,
      durability: 17184,
      gloryOnExplosion: 89000,
      populationBonus: 0
    },
    upgradesTo: 781,
    upgradeCost: 2120000,
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 150 },
        { id: 10009, name: 'Сталь', amount: 28 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 401 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/778.webp'
  },
  {
    id: 781,
    name: 'Статуя ГномБабы - 9',
    englishName: 'Statue of the Spring Baba Level 9',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 2120000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 21 },
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 5 },
        { id: 10039, name: 'Символ любви', amount: 212 }
      ],
      population: 38
    },
    stats: {
      constructionTimeSeconds: 78216,
      accelerationCost: 86,
      durability: 19264,
      gloryOnExplosion: 106000,
      populationBonus: 0
    },
    upgradesTo: 782,
    upgradeCost: 2500000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 15 },
        { id: 10009, name: 'Сталь', amount: 36 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 135 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/783.webp'
  },
  {
    id: 782,
    name: 'Статуя ГномБабы - 10',
    englishName: 'Statue of the Spring Baba Level 10',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 2500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 25 },
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 5 },
        { id: 10039, name: 'Символ любви', amount: 250 }
      ],
      population: 40
    },
    stats: {
      constructionTimeSeconds: 192000,
      accelerationCost: 92,
      durability: 21464,
      gloryOnExplosion: 125000,
      populationBonus: 0
    },
    upgradesTo: 783,
    upgradeCost: 2920000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 19 },
        { id: 10015, name: 'Супер детонатор', amount: 10 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 79 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/783.webp'
  },
  {
    id: 783,
    name: 'Статуя ГномБабы - 11',
    englishName: 'Statue of the Spring Baba Level 11',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 2920000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 29 },
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 6 },
        { id: 10039, name: 'Символ любви', amount: 292 }
      ],
      population: 42
    },
    stats: {
      constructionTimeSeconds: 222264,
      accelerationCost: 99,
      durability: 23776,
      gloryOnExplosion: 146000,
      populationBonus: 0
    },
    upgradesTo: 784,
    upgradeCost: 3380000,
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 12 },
        { id: 10008, name: 'Стальной лист', amount: 21 },
        { id: 999, name: 'монеты', amount: 13538 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 13 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/783.webp'
  },
  {
    id: 784,
    name: 'Статуя ГномБабы - 12',
    englishName: 'Statue of the Spring Baba Level 12',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 3380000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 34 },
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 7 },
        { id: 10039, name: 'Символ любви', amount: 338 }
      ],
      population: 44
    },
    stats: {
      constructionTimeSeconds: 255552,
      accelerationCost: 107,
      durability: 26176,
      gloryOnExplosion: 169000,
      populationBonus: 0
    },
    upgradesTo: 785,
    upgradeCost: 3880000,
    drops: {
      frequent: [
        { id: 10004, name: 'Самородок', amount: 62 },
        { id: 10036, name: 'Изумрудная руда', amount: 17 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 930 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/783.webp'
  },
  {
    id: 785,
    name: 'Статуя ГномБабы - 13',
    englishName: 'Statue of the Spring Baba Level 13',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 3880000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 39 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 8 },
        { id: 10039, name: 'Символ любви', amount: 388 }
      ],
      population: 46
    },
    stats: {
      constructionTimeSeconds: 292008,
      accelerationCost: 114,
      durability: 28680,
      gloryOnExplosion: 194000,
      populationBonus: 0
    },
    upgradesTo: 786,
    upgradeCost: 4420000,
    drops: {
      frequent: [
        { id: 10035, name: 'Изумруды', amount: 10 },
        { id: 10036, name: 'Изумрудная руда', amount: 20 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10036, name: 'Изумрудная руда', amount: 298 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/783.webp'
  },
  {
    id: 786,
    name: 'Статуя ГномБабы - 14',
    englishName: 'Statue of the Spring Baba Level 14',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 4420000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 44 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 10 },
        { id: 10039, name: 'Символ любви', amount: 442 }
      ],
      population: 48
    },
    stats: {
      constructionTimeSeconds: 331776,
      accelerationCost: 121,
      durability: 31264,
      gloryOnExplosion: 221000,
      populationBonus: 0
    },
    upgradesTo: 787,
    upgradeCost: 5000000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 39 },
        { id: 10009, name: 'Сталь', amount: 93 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10035, name: 'Изумруды', amount: 168 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/783.webp'
  },
  {
    id: 787,
    name: 'Статуя ГномБабы - 15',
    englishName: 'Statue of the Spring Baba Level 15',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 5000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 50 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 11 },
        { id: 10039, name: 'Символ любви', amount: 500 }
      ],
      population: 50
    },
    stats: {
      constructionTimeSeconds: 375000,
      accelerationCost: 129,
      durability: 33944,
      gloryOnExplosion: 250000,
      populationBonus: 0
    },
    upgradesTo: 788,
    upgradeCost: 5620000,
    drops: {
      frequent: [
        { id: 10002, name: 'Золото', amount: 46 },
        { id: 10015, name: 'Супер детонатор', amount: 24 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10043, name: 'Суператомная бомба', amount: 27 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/783.webp'
  },
  {
    id: 788,
    name: 'Статуя ГномБабы - 16',
    englishName: 'Statue of the Spring Baba Level 16',
    category: 'Статуи',
    type: BuildingType.Default,
    price: 5620000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 8 },
        { id: 10034, name: 'Изумруд', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 18 },
        { id: 10039, name: 'Символ любви', amount: 843 }
      ],
      population: 52
    },
    stats: {
      constructionTimeSeconds: 421824,
      accelerationCost: 137,
      durability: 36696,
      gloryOnExplosion: 281000,
      populationBonus: 0
    },
    drops: {
      frequent: [
        { id: 10015, name: 'Супер детонатор', amount: 28 },
        { id: 10008, name: 'Стальной лист', amount: 49 },
        { id: 999, name: 'монеты', amount: 20997 }
      ],
      rare: [{ id: 10004, name: 'Самородок', amount: 1827 }]
    },
    description: 'Говорят ГномБаба была настолько прекрасной, что гномы работали не покладая рук лишь бы угодить ей. It makes the gnomes work faster in the spring.',
    imageUrl: '/buildings/Статуи/Статуя ГномБабы/788.webp'
  },
  {
    id: 8,
    name: 'Кинотеатр',
    englishName: 'Movie Theater',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 66 },
        { id: 10002, name: 'Доски', amount: 25 },
        { id: 10005, name: 'Камни', amount: 7 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 11382,
      gloryOnExplosion: 62500,
      populationBonus: 4,
      takesPopulation: 2,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 4000,
      givesCoins: 4000
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 10 },
        { id: 10045, name: 'Супер детонатор', amount: 5 },
        { id: 999, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 313 }
      ]
    },
    description: 'Всегда в прокате самые интересные и свежие фильмы. Always interesting and fresh movies.',
    imageUrl: '/buildings/Специальные Здания/Кинотеатр - Movie theater/8.webp',
    upgradesTo: 22,
    upgradeCost: 35000
  },
  {
    id: 22,
    name: 'Большой кинотеатр',
    englishName: 'Big Movie Theater',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 35000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 132 },
        { id: 10002, name: 'Доски', amount: 50 },
        { id: 10005, name: 'Камни', amount: 14 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 13470,
      gloryOnExplosion: 25000,
      populationBonus: 5,
      takesPopulation: 4,
      workTimeSeconds: 14400, // 4 hours
      workYieldGold: 6000,
      givesCoins: 6000
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 30 },
        { id: 10040, name: 'Стальной лист', amount: 12 },
        { id: 999, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруды', amount: 56 }
      ]
    },
    description: 'Всегда в прокате самые интересные и свежие фильмы. Always interesting and fresh movies.',
    imageUrl: '/buildings/Специальные Здания/Кинотеатр - Movie theater/22.webp',
    upgradesTo: 23,
    upgradeCost: 45000
  },
  {
    id: 23,
    name: 'Большой 3D кинотеатр',
    englishName: 'Big 3D Movie Theater',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 45000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 56 },
        { id: 10006, name: 'Каменные блоки', amount: 20 },
        { id: 10024, name: 'Супер лилия', amount: 7 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 15276,
      gloryOnExplosion: 25000,
      populationBonus: 6,
      takesPopulation: 6,
      workTimeSeconds: 18000, // 5 hours
      workYieldGold: 15000,
      givesCoins: 15000
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 38 },
        { id: 10036, name: 'Изумрудная руда', amount: 10 },
        { id: 999, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 10 }
      ]
    },
    description: 'Всегда в прокате самые интересные и свежие фильмы в 3D. Always interesting and fresh 3D movies.',
    imageUrl: '/buildings/Специальные Здания/Кинотеатр - Movie theater/23.webp'
  },
  {
    id: 12,
    name: 'Банк',
    englishName: 'Bank',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 200000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 66 },
        { id: 10002, name: 'Доски', amount: 25 },
        { id: 10005, name: 'Камни', amount: 7 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 10182,
      gloryOnExplosion: 50000,
      populationBonus: 3,
      takesPopulation: 2,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 30000,
      givesCoins: 30000
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 94 },
        { id: 10023, name: 'Сталь', amount: 18 },
        { id: 999, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 250 }
      ]
    },
    description: 'Большой надежный и прибыльный. Major operations, reliable and profitable.',
    imageUrl: '/buildings/Специальные Здания/Банк - Bank/12.webp',
    upgradesTo: 33,
    upgradeCost: 300000
  },
  {
    id: 33,
    name: 'Крупный банк',
    englishName: 'Major Bank',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 300000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10023, name: 'Сталь', amount: 10 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 11454,
      gloryOnExplosion: 15000,
      populationBonus: 8,
      takesPopulation: 4,
      workTimeSeconds: 14400, // 4 hours
      workYieldGold: 40000,
      givesCoins: 40000
    },
    drops: {
      frequent: [
        { id: 10045, name: 'Супер детонатор', amount: 5 },
        { id: 10040, name: 'Стальной лист', amount: 9 },
        { id: 999, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 85 }
      ]
    },
    description: 'Большой надежный и прибыльный. Major operations, reliable and profitable.',
    imageUrl: '/buildings/Специальные Здания/Банк - Bank/33.webp',
    upgradesTo: 34,
    upgradeCost: 600000
  },
  {
    id: 34,
    name: 'Очень крупный банк',
    englishName: 'Top Bank',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10023, name: 'Сталь', amount: 15 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 13422,
      gloryOnExplosion: 30000,
      populationBonus: 15,
      takesPopulation: 6,
      workTimeSeconds: 18000, // 5 hours
      workYieldGold: 50000,
      givesCoins: 50000
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 29 },
        { id: 10040, name: 'Стальной лист', amount: 12 },
        { id: 999, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруды', amount: 55 }
      ]
    },
    description: 'Большой надежный и прибыльный. Major operations, reliable and profitable.',
    imageUrl: '/buildings/Специальные Здания/Банк - Bank/34.webp'
  },
  {
    id: 60,
    name: 'Телебашня',
    englishName: 'TV Tower',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 400000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10023, name: 'Сталь', amount: 10 }
      ],
      population: 22
    },
    stats: {
      constructionTimeSeconds: 31944, // 8 hours 52 minutes 24 seconds
      accelerationCost: 38,
      durability: 6368,
      gloryOnExplosion: 20000,
      takesPopulation: 4,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 60000,
      givesCoins: 60000
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба «Снежинка»', amount: 3 },
        { id: 10021, name: 'Куски супер репки', amount: 3 },
        { id: 999, name: 'Монеты', amount: 7853 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 22 }
      ]
    },
    description: 'Телебашня 1 уровня. TV Tower Level 1.',
    imageUrl: '/buildings/watchtower/147.webp',
    upgradesTo: 61,
    upgradeCost: 500000
  },
  {
    id: 61,
    name: 'Телебашня 2',
    englishName: 'TV Tower 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 500000,
    buildable: false,
    constructionRequirements: {
      population: 24
    },
    stats: {
      constructionTimeSeconds: 41472, // 11 hours 31 minutes 12 seconds
      accelerationCost: 43,
      durability: 7440,
      gloryOnExplosion: 25000,
      takesPopulation: 9,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 50000,
      givesCoins: 50000
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 29 },
        { id: 10023, name: 'Сталь', amount: 6 },
        { id: 999, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 20 }
      ]
    },
    description: 'Телебашня 2 уровня. TV Tower Level 2.',
    imageUrl: '/buildings/watchtower/214.webp',
    upgradesTo: 62,
    upgradeCost: 600000
  },
  {
    id: 62,
    name: 'Телебашня 3',
    englishName: 'TV Tower 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: false,
    constructionRequirements: {
      population: 25
    },
    stats: {
      constructionTimeSeconds: 46875, // 13 hours 1 minute 15 seconds
      accelerationCost: 46,
      durability: 8480,
      gloryOnExplosion: 30000,
      takesPopulation: 17,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 70000,
      givesCoins: 70000
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 7 },
        { id: 999, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10034, name: 'Изумруды', amount: 13 }
      ]
    },
    description: 'Телебашня 3 уровня. TV Tower Level 3.',
    imageUrl: '/buildings/watchtower/215.webp'
  },
  {
    id: 39,
    name: 'Современный дом 1',
    englishName: 'Modern House 1',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 500000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 1 },
        { id: 10003, name: 'Куски супер гриба', amount: 7 }
      ],
      population: 23
    },
    stats: {
      constructionTimeSeconds: 36501, // 10 hours 8 minutes 21 seconds
      accelerationCost: 40,
      durability: 7120,
      gloryOnExplosion: 25000,
      populationBonus: 15
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10033, name: 'Черепок', amount: 9 },
        { id: 10045, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Современный дом 1 уровня. Modern House Level 1.',
    imageUrl: '/buildings/residential/39.webp',
    upgradesTo: 40,
    upgradeCost: 700000
  },
  {
    id: 40,
    name: 'Современный дом 2',
    englishName: 'Modern House 2',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 700000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 2 },
        { id: 10003, name: 'Куски супер гриба', amount: 10 }
      ],
      population: 26
    },
    stats: {
      constructionTimeSeconds: 52728, // 14 hours 38 minutes 48 seconds
      accelerationCost: 48,
      durability: 8800,
      gloryOnExplosion: 35000,
      populationBonus: 17
    },
    drops: {
      frequent: [
        { id: 10033, name: 'Черепок', amount: 11 },
        { id: 10045, name: 'Супер детонатор', amount: 2 },
        { id: 10040, name: 'Стальной лист', amount: 3 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 105 }
      ]
    },
    description: 'Современный дом 2 уровня. Modern House Level 2.',
    imageUrl: '/buildings/residential/40.webp',
    upgradesTo: 63,
    upgradeCost: 900000
  },
  {
    id: 63,
    name: 'Современный дом 3',
    englishName: 'Modern House 3',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 900000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 9 },
        { id: 10023, name: 'Сталь', amount: 2 },
        { id: 10003, name: 'Куски супер гриба', amount: 13 }
      ],
      population: 28
    },
    stats: {
      constructionTimeSeconds: 65856, // 18 hours 17 minutes 36 seconds
      accelerationCost: 54,
      durability: 10384,
      gloryOnExplosion: 45000,
      populationBonus: 18
    },
    drops: {
      frequent: [
        { id: 10033, name: 'Черепок', amount: 12 },
        { id: 10045, name: 'Супер детонатор', amount: 3 },
        { id: 10040, name: 'Стальной лист', amount: 4 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 3 }
      ]
    },
    description: 'Современный дом 3 уровня. Modern House Level 3.',
    imageUrl: '/buildings/residential/63.webp'
  },
  {
    id: 64,
    name: 'Поместье 1',
    englishName: 'Estate 1',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 1300000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 13 },
        { id: 10023, name: 'Сталь', amount: 3 },
        { id: 10003, name: 'Куски супер гриба', amount: 19 }
      ],
      population: 30
    },
    stats: {
      constructionTimeSeconds: 81000, // 22 hours 30 minutes
      accelerationCost: 60,
      durability: 11480,
      gloryOnExplosion: 65000,
      populationBonus: 19
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 12 },
        { id: 10033, name: 'Черепок', amount: 13 },
        { id: 10040, name: 'Стальной лист', amount: 5 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 179 }
      ]
    },
    description: 'Поместье 1 уровня. Estate Level 1.',
    imageUrl: '/buildings/residential/64.webp',
    upgradesTo: 65,
    upgradeCost: 1500000
  },
  {
    id: 65,
    name: 'Поместье 2',
    englishName: 'Estate 2',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 1500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10026, name: 'Золото', amount: 1 },
        { id: 10023, name: 'Сталь', amount: 3 },
        { id: 10004, name: 'Куски супер тыквы', amount: 13 }
      ],
      population: 31
    },
    stats: {
      constructionTimeSeconds: 89373, // 1 day 49 minutes 33 seconds
      accelerationCost: 63,
      durability: 12880,
      gloryOnExplosion: 75000,
      populationBonus: 20
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 15 },
        { id: 10033, name: 'Черепок', amount: 14 },
        { id: 10036, name: 'Изумрудная руда', amount: 4 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 60 }
      ]
    },
    description: 'Поместье 2 уровня. Estate Level 2.',
    imageUrl: '/buildings/residential/65.webp'
  },
  {
    id: 66,
    name: 'Кафе',
    englishName: 'Cafe',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 16000,
    buildable: true,
    constructionRequirements: {
      population: 10
    },
    stats: {
      constructionTimeSeconds: 3000, // 50 minutes
      accelerationCost: 12,
      durability: 1272,
      gloryOnExplosion: 800,
      takesPopulation: 1,
      workTimeSeconds: 2400, // 40 minutes
      workYieldGold: 2000,
      givesCoins: 2000
    },
    drops: {
      frequent: [
        { id: 10006, name: 'Каменные блоки', amount: 8 },
        { id: 10010, name: 'Садовая бомба', amount: 9 },
        { id: 999, name: 'Монеты', amount: 1572 }
      ],
      rare: [
        { id: 10023, name: 'Сталь', amount: 3 }
      ]
    },
    description: 'Кафе 1 уровня. Cafe Level 1.',
    imageUrl: '/buildings/Бизнес/кафе/66.webp',
    upgradesTo: 67,
    upgradeCost: 24000
  },
  {
    id: 67,
    name: 'Кафе 2',
    englishName: 'Cafe 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 24000,
    buildable: false,
    constructionRequirements: {
      population: 11
    },
    stats: {
      constructionTimeSeconds: 3993, // 1 hour 6 minutes 33 seconds
      accelerationCost: 13,
      durability: 1632,
      gloryOnExplosion: 1200,
      takesPopulation: 2,
      workTimeSeconds: 7200, // 2 hours
      workYieldGold: 4000,
      givesCoins: 4000
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 2 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 },
        { id: 999, name: 'Монеты', amount: 2268 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 4 }
      ]
    },
    description: 'Кафе 2 уровня. Cafe Level 2.',
    imageUrl: '/buildings/Бизнес/кафе/67.webp'
  },
  {
    id: 11,
    name: 'Магазинчик',
    englishName: 'Small Shop',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 8000,
    buildable: true,
    constructionRequirements: {
      population: 9
    },
    stats: {
      constructionTimeSeconds: 2187, // 36 minutes 27 seconds
      accelerationCost: 10,
      durability: 904,
      gloryOnExplosion: 400,
      takesPopulation: 1,
      workTimeSeconds: 1200, // 20 minutes
      workYieldGold: 1000,
      givesCoins: 1000
    },
    drops: {
      frequent: [
        { id: 10005, name: 'Камни', amount: 10 },
        { id: 10041, name: 'Песок', amount: 2 },
        { id: 999, name: 'Монеты', amount: 839 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 2 }
      ]
    },
    description: 'Маленький магазинчик. Small shop.',
    imageUrl: '/buildings/Бизнес/магазинчик/21.webp',
    upgradesTo: 21,
    upgradeCost: 10000
  },
  {
    id: 21,
    name: 'Магазин',
    englishName: 'Shop',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 10000,
    buildable: false,
    constructionRequirements: {
      population: 9
    },
    stats: {
      constructionTimeSeconds: 2187, // 36 minutes 27 seconds
      accelerationCost: 10,
      durability: 1048,
      gloryOnExplosion: 500,
      takesPopulation: 1,
      workTimeSeconds: 1740, // 29 minutes
      workYieldGold: 1700,
      givesCoins: 1700
    },
    drops: {
      frequent: [
        { id: 10006, name: 'Каменные блоки', amount: 5 },
        { id: 10010, name: 'Садовая бомба', amount: 6 },
        { id: 999, name: 'Монеты', amount: 839 }
      ],
      rare: [
        { id: 10022, name: 'Железная руда', amount: 9 }
      ]
    },
    description: 'Магазин. Shop.',
    imageUrl: '/buildings/Бизнес/магазинчик/21.webp'
  },
  {
    id: 2,
    name: 'Тележка с хотдогами',
    englishName: 'Hot Dog Cart',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 80,
    buildable: true,
    constructionRequirements: {
      population: 3
    },
    stats: {
      constructionTimeSeconds: 81, // 1 minute 21 seconds
      accelerationCost: 2,
      durability: 88,
      gloryOnExplosion: 4,
      takesPopulation: 1,
      workTimeSeconds: 60, // 1 minute
      workYieldGold: 5
    },
    drops: {
      frequent: [],
      rare: [
        { id: 10013, name: 'Петарда', amount: 2 }
      ]
    },
    description: 'Что может быть лучше горячего хотдога на свежем воздухе! Отличный бизнес для новичка. Nothing can be better than a tasty hot dog on the go! Nice business for a newbie.',
    imageUrl: '/buildings/Бизнес/тележка с хот догом/Тележка с хотдогами 2.webp',
    upgradesTo: 17,
    upgradeCost: 200
  },
  {
    id: 17,
    name: 'Тележки с хотдогами и пирожками',
    englishName: 'Hot Dogs and Patty Carts',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 200,
    buildable: false,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 152,
      gloryOnExplosion: 10,
      takesPopulation: 2,
      workTimeSeconds: 120, // 2 minutes
      workYieldGold: 50
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 3 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 103 }
      ],
      rare: [
        { id: 10010, name: 'Садовая бомба', amount: 2 }
      ]
    },
    description: 'Хотдоги! Горячие пирожки! Больше ассортимент, больше денег! Hot dogs! Fresh patties! Larger assortment, more money!',
    imageUrl: '/buildings/Бизнес/тележка с хот догом/две обычных тележки 17.webp',
    upgradesTo: 18,
    upgradeCost: 300
  },
  {
    id: 18,
    name: 'Большая тележка с хотдогами',
    englishName: 'Big Hot Dog Cart',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 300,
    buildable: false,
    constructionRequirements: {
      population: 4
    },
    stats: {
      constructionTimeSeconds: 192, // 3 minutes 12 seconds
      accelerationCost: 3,
      durability: 192,
      gloryOnExplosion: 15,
      takesPopulation: 1,
      workTimeSeconds: 180, // 3 minutes
      workYieldGold: 100
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 5 },
        { id: 10008, name: 'Нефть', amount: 2 },
        { id: 999, name: 'Монеты', amount: 181 }
      ],
      rare: [
        { id: 10005, name: 'Камни', amount: 7 }
      ]
    },
    description: 'Что может быть лучше горячего хотдога! Больше тележка, больше денег! Nothing can be better than a tasty hot dog on the go! Bigger cart, more money!',
    imageUrl: '/buildings/Бизнес/тележка с хот догом/Тележка с хотдогами улучшенная 18.webp',
    upgradesTo: 19,
    upgradeCost: 450
  },
  {
    id: 19,
    name: 'Большие тележки с горячим',
    englishName: 'Big Carts with Hot Food',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 450,
    buildable: false,
    constructionRequirements: {
      population: 5
    },
    stats: {
      constructionTimeSeconds: 375, // 6 minutes 15 seconds
      accelerationCost: 4,
      durability: 240,
      gloryOnExplosion: 23,
      takesPopulation: 2,
      workTimeSeconds: 240, // 4 minutes
      workYieldGold: 150
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 7 },
        { id: 10008, name: 'Нефть', amount: 4 },
        { id: 999, name: 'Монеты', amount: 181 }
      ],
      rare: [
        { id: 10024, name: 'Супер лилия', amount: 2 }
      ]
    },
    description: 'Хотдоги! Горячие пирожки! Больше тележки, больше денег! Hot dogs! Fresh patties! Bigger carts, more money!',
    imageUrl: '/buildings/Бизнес/тележка с хот догом/две улучшенных тележки 19.webp',
    upgradesTo: 30,
    upgradeCost: 700
  },
  {
    id: 30,
    name: 'Три тележки с горячим',
    englishName: 'Three Carts with Hot Food',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 700,
    buildable: false,
    constructionRequirements: {
      population: 5
    },
    stats: {
      constructionTimeSeconds: 375, // 6 minutes 15 seconds
      accelerationCost: 4,
      durability: 312,
      gloryOnExplosion: 35,
      takesPopulation: 3,
      workTimeSeconds: 300, // 5 minutes
      workYieldGold: 260
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 12 },
        { id: 10008, name: 'Нефть', amount: 6 },
        { id: 999, name: 'Монеты', amount: 303 }
      ],
      rare: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 }
      ]
    },
    description: 'Хотдоги! Горячие пирожки! Больше тележки, больше денег! Hot dogs! Fresh patties! More carts, more money!',
    imageUrl: '/buildings/Бизнес/тележка с хот догом/три тележки 30.webp',
    upgradesTo: 31,
    upgradeCost: 1000
  },
  {
    id: 31,
    name: 'Четыре тележки с горячим',
    englishName: 'Four Hot Dog Carts',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 1000,
    buildable: false,
    constructionRequirements: {
      population: 6
    },
    stats: {
      constructionTimeSeconds: 648, // 10 minutes 48 seconds
      accelerationCost: 5,
      durability: 384,
      gloryOnExplosion: 50,
      takesPopulation: 4,
      workTimeSeconds: 240, // 4 minutes
      workYieldGold: 350
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 17 },
        { id: 10008, name: 'Нефть', amount: 8 },
        { id: 999, name: 'Монеты', amount: 303 }
      ],
      rare: [
        { id: 10022, name: 'Железная руда', amount: 2 }
      ]
    },
    description: 'Хотдоги! Горячие пирожки! Больше тележки, больше денег! Hot dogs! Fresh patties! Bigger carts, more money!',
    imageUrl: '/buildings/Бизнес/тележка с хот догом/четыре тележки 31.webp',
    upgradesTo: 32,
    upgradeCost: 1400
  },
  {
    id: 32,
    name: 'Супер тележка с пирожками',
    englishName: 'Super Patty Cart',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 1400,
    buildable: false,
    constructionRequirements: {
      population: 6
    },
    stats: {
      constructionTimeSeconds: 648, // 10 minutes 48 seconds
      accelerationCost: 5,
      durability: 472,
      gloryOnExplosion: 70,
      takesPopulation: 1,
      workTimeSeconds: 360, // 6 minutes
      workYieldGold: 666
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 26 },
        { id: 10009, name: 'Бензин', amount: 7 },
        { id: 999, name: 'Монеты', amount: 405 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 3 }
      ]
    },
    description: 'Хотдоги! Горячие пирожки! Супер тележка, супер доходы! Hot dogs! Fresh patties! Super cart, super income!',
    imageUrl: '/buildings/Бизнес/тележка с хот догом/Большая Тележка с Хот Донами.webp'
  },
  {
    id: 178,
    name: 'Цветочное дерево 1',
    englishName: 'Flower tree 1',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 60,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7800,
      gloryOnExplosion: 15000
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Супер детонатор', amount: 2, chance: 80 },
        { id: 10040, name: 'Стальной лист', amount: 3, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 10631, chance: 100 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 11, chance: 20 }
      ]
    },
    description: 'Волшебное цветочное дерево. Укрась свой город!',
    imageUrl: '/buildings/Декор/Цветочное дерево 1 - Flower tree/178.webp',
    upgradesTo: 179,
    upgradeCost: 25000
  },
  {
    id: 179,
    name: 'Цветочное дерево 2',
    englishName: 'Flower tree 2',
    category: 'Декор',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: {
      population: 12
    },
    stats: {
      constructionTimeSeconds: 5184,
      accelerationCost: 15,
      durability: 1664,
      gloryOnExplosion: 1250
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 2, chance: 80 },
        { id: 10031, name: 'Супер тыква', amount: 2, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2268, chance: 100 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 1, chance: 20 }
      ]
    },
    description: 'Волшебное цветочное дерево. Укрась свой город!',
    imageUrl: '/buildings/Декор/Цветочное дерево 1 - Flower tree/179.webp',
    upgradesTo: 180,
    upgradeCost: 30000
  },
  {
    id: 180,
    name: 'Цветочное дерево 3',
    englishName: 'Flower tree 3',
    category: 'Декор',
    type: BuildingType.Default,
    price: 30000,
    buildable: false,
    constructionRequirements: {
      population: 12
    },
    stats: {
      constructionTimeSeconds: 5184,
      accelerationCost: 15,
      durability: 1896,
      gloryOnExplosion: 1500
    },
    drops: {
      frequent: [
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3, chance: 80 },
        { id: 10041, name: 'Песок', amount: 8, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2268, chance: 100 }
      ],
      rare: [
        { id: 10017, name: 'Супер детонатор', amount: 2, chance: 20 }
      ]
    },
    description: 'Волшебное цветочное дерево. Укрась свой город!',
    imageUrl: '/buildings/Декор/Цветочное дерево 1 - Flower tree/180.webp',
    upgradesTo: 181,
    upgradeCost: 35000
  },
  {
    id: 181,
    name: 'Цветочное дерево 4',
    englishName: 'Flower tree 4',
    category: 'Декор',
    type: BuildingType.Default,
    price: 35000,
    buildable: false,
    constructionRequirements: {
      population: 13
    },
    stats: {
      constructionTimeSeconds: 6591,
      accelerationCost: 17,
      durability: 2128,
      gloryOnExplosion: 1750
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 3, chance: 80 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 4, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2268, chance: 100 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 3, chance: 20 }
      ]
    },
    description: 'Волшебное цветочное дерево. Укрась свой город!',
    imageUrl: '/buildings/Декор/Цветочное дерево 1 - Flower tree/181.webp',
    upgradesTo: 182,
    upgradeCost: 40000
  },
  {
    id: 182,
    name: 'Цветочное дерево 5',
    englishName: 'Flower tree 5',
    category: 'Декор',
    type: BuildingType.Default,
    price: 40000,
    buildable: false,
    constructionRequirements: {
      population: 14
    },
    stats: {
      constructionTimeSeconds: 8232,
      accelerationCost: 19,
      durability: 2352,
      gloryOnExplosion: 2000
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 4, chance: 80 },
        { id: 10025, name: 'Супер лилия', amount: 8, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2268, chance: 100 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 8, chance: 20 }
      ]
    },
    description: 'Волшебное цветочное дерево. Укрась свой город!',
    imageUrl: '/buildings/Декор/Цветочное дерево 1 - Flower tree/182.webp',
    upgradesTo: 183,
    upgradeCost: 45000
  },
  {
    id: 183,
    name: 'Цветочное дерево 6',
    englishName: 'Flower tree 6',
    category: 'Декор',
    type: BuildingType.Default,
    price: 45000,
    buildable: false,
    constructionRequirements: {
      population: 14
    },
    stats: {
      constructionTimeSeconds: 8232,
      accelerationCost: 19,
      durability: 2576,
      gloryOnExplosion: 2250
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2, chance: 80 },
        { id: 10003, name: '????? ????? ?????', amount: 5, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2735, chance: 100 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 2, chance: 20 }
      ]
    },
    description: 'Волшебное цветочное дерево. Укрась свой город!',
    imageUrl: '/buildings/Декор/Цветочное дерево 1 - Flower tree/183.webp',
    upgradesTo: 184,
    upgradeCost: 60000
  },
  {
    id: 184,
    name: 'Цветочное дерево 7',
    englishName: 'Flower tree 7',
    category: 'Декор',
    type: BuildingType.Default,
    price: 60000,
    buildable: false,
    constructionRequirements: {
      population: 16
    },
    stats: {
      constructionTimeSeconds: 12288,
      accelerationCost: 23,
      durability: 3064,
      gloryOnExplosion: 3000
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 5, chance: 80 },
        { id: 10011, name: 'Садовая супер бомба', amount: 2, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 3260, chance: 100 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 6, chance: 20 }
      ]
    },
    description: 'Волшебное цветочное дерево. Укрась свой город!',
    imageUrl: '/buildings/Декор/Цветочное дерево 1 - Flower tree/184.webp'
  },
  {
    id: 228,
    name: 'Беседка 1',
    englishName: 'Garden house 1',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 25,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 5032,
      gloryOnExplosion: 6250
    },
    drops: {
      frequent: [
        { id: 10030, name: 'Супер пшеница', amount: 2, chance: 80 },
        { id: 10032, name: 'Супер репка', amount: 2, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 7132, chance: 100 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 14, chance: 20 }
      ]
    },
    description: 'Уютная беседка для отдыха. Укрась свой город!',
    imageUrl: '/buildings/Декор/Беседка 1 - Garden house/228.webp',
    upgradesTo: 229,
    upgradeCost: 35000
  },
  {
    id: 229,
    name: 'Беседка 2',
    englishName: 'Garden house 2',
    category: 'Декор',
    type: BuildingType.Default,
    price: 35000,
    buildable: false,
    constructionRequirements: {
      population: 13
    },
    stats: {
      constructionTimeSeconds: 6591,
      accelerationCost: 17,
      durability: 1968,
      gloryOnExplosion: 1750
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 3, chance: 80 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2268, chance: 100 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 3, chance: 20 }
      ]
    },
    description: 'Уютная беседка для отдыха. Укрась свой город!',
    imageUrl: '/buildings/Декор/Беседка 1 - Garden house/229.webp',
    upgradesTo: 230,
    upgradeCost: 40000
  },
  {
    id: 230,
    name: 'Беседка 3',
    englishName: 'Garden house 3',
    category: 'Декор',
    type: BuildingType.Default,
    price: 40000,
    buildable: false,
    constructionRequirements: {
      population: 13
    },
    stats: {
      constructionTimeSeconds: 6591,
      accelerationCost: 17,
      durability: 2192,
      gloryOnExplosion: 2000
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 4, chance: 80 },
        { id: 10025, name: 'Супер лилия', amount: 7, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2268, chance: 100 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 7, chance: 20 }
      ]
    },
    description: 'Уютная беседка для отдыха. Укрась свой город!',
    imageUrl: '/buildings/Декор/Беседка 1 - Garden house/230.webp',
    upgradesTo: 231,
    upgradeCost: 45000
  },
  {
    id: 231,
    name: 'Беседка 4',
    englishName: 'Garden house 4',
    category: 'Декор',
    type: BuildingType.Default,
    price: 45000,
    buildable: false,
    constructionRequirements: {
      population: 14
    },
    stats: {
      constructionTimeSeconds: 8232,
      accelerationCost: 19,
      durability: 2408,
      gloryOnExplosion: 2250
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 4, chance: 80 },
        { id: 10025, name: 'Супер лилия', amount: 9, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2268, chance: 100 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 3, chance: 20 }
      ]
    },
    description: 'Уютная беседка для отдыха. Укрась свой город!',
    imageUrl: '/buildings/Декор/Беседка 1 - Garden house/231.webp'
  },
  {
    id: 232,
    name: 'Цветочки 1',
    englishName: 'Flowers 1',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 10,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 3184,
      gloryOnExplosion: 2500
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Элитная древесина', amount: 5, chance: 80 },
        { id: 10031, name: 'Супер тыква', amount: 4, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 3788, chance: 100 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 6, chance: 20 }
      ]
    },
    description: 'Красивые цветочки для украшения города.',
    imageUrl: '/buildings/Декор/цветочная грядка/232.webp',
    upgradesTo: 233,
    upgradeCost: 1300
  },
  {
    id: 233,
    name: 'Цветочки 2',
    englishName: 'Flowers 2',
    category: 'Декор',
    type: BuildingType.Default,
    price: 1300,
    buildable: false,
    constructionRequirements: {
      population: 6
    },
    stats: {
      constructionTimeSeconds: 648,
      accelerationCost: 5,
      durability: 376,
      gloryOnExplosion: 65
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 7, chance: 80 },
        { id: 10013, name: 'Петарда', amount: 3, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 303, chance: 100 }
      ],
      rare: [
        { id: 10025, name: 'Супер лилия', amount: 4, chance: 20 }
      ]
    },
    description: 'Красивые цветочки для украшения города.',
    imageUrl: '/buildings/Декор/цветочная грядка/233.webp',
    upgradesTo: 234,
    upgradeCost: 1600
  },
  {
    id: 234,
    name: 'Цветочки 3',
    englishName: 'Flowers 3',
    category: 'Декор',
    type: BuildingType.Default,
    price: 1600,
    buildable: false,
    constructionRequirements: {
      population: 6
    },
    stats: {
      constructionTimeSeconds: 648,
      accelerationCost: 5,
      durability: 440,
      gloryOnExplosion: 80
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 22, chance: 80 },
        { id: 10008, name: 'Бочка с нефтью', amount: 11, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 405, chance: 100 }
      ],
      rare: [
        { id: 10031, name: 'Супер тыква', amount: 2, chance: 20 }
      ]
    },
    description: 'Красивые цветочки для украшения города.',
    imageUrl: '/buildings/Декор/цветочная грядка/234.webp',
    upgradesTo: 235,
    upgradeCost: 2000
  },
  {
    id: 235,
    name: 'Цветочки 4',
    englishName: 'Flowers 4',
    category: 'Декор',
    type: BuildingType.Default,
    price: 2000,
    buildable: false,
    constructionRequirements: {
      population: 7
    },
    stats: {
      constructionTimeSeconds: 1029,
      accelerationCost: 7,
      durability: 504,
      gloryOnExplosion: 100
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 30, chance: 80 },
        { id: 10009, name: 'Канистра с бензином', amount: 8, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 504, chance: 100 }
      ],
      rare: [
        { id: 10004, name: 'Железная руда', amount: 2, chance: 20 }
      ]
    },
    description: 'Красивые цветочки для украшения города.',
    imageUrl: '/buildings/Декор/цветочная грядка/235.webp',
    upgradesTo: 236,
    upgradeCost: 2400
  },
  {
    id: 236,
    name: 'Цветочки 5',
    englishName: 'Flowers 5',
    category: 'Декор',
    type: BuildingType.Default,
    price: 2400,
    buildable: false,
    constructionRequirements: {
      population: 7
    },
    stats: {
      constructionTimeSeconds: 1029,
      accelerationCost: 7,
      durability: 576,
      gloryOnExplosion: 120
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 15, chance: 80 },
        { id: 10009, name: 'Канистра с бензином', amount: 10, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 504, chance: 100 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 4, chance: 20 }
      ]
    },
    description: 'Красивые цветочки для украшения города.',
    imageUrl: '/buildings/Декор/цветочная грядка/236.webp',
    upgradesTo: 237,
    upgradeCost: 2800
  },
  {
    id: 237,
    name: 'Цветочки 6',
    englishName: 'Flowers 6',
    category: 'Декор',
    type: BuildingType.Default,
    price: 2800,
    buildable: false,
    constructionRequirements: {
      population: 7
    },
    stats: {
      constructionTimeSeconds: 1029,
      accelerationCost: 7,
      durability: 640,
      gloryOnExplosion: 140
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 18, chance: 80 },
        { id: 10013, name: 'Петарда', amount: 6, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 504, chance: 100 }
      ],
      rare: [
        { id: 10035, name: 'Элитная древесина', amount: 3, chance: 20 }
      ]
    },
    description: 'Красивые цветочки для украшения города.',
    imageUrl: '/buildings/Декор/цветочная грядка/237.webp'
  },
  {
    id: 60006,
    name: 'Скамейка',
    englishName: 'Bench',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 15,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 2752,
      gloryOnExplosion: 3500
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 5, chance: 80 },
        { id: 10013, name: 'Петарда', amount: 3, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 2520, chance: 100 }
      ],
      rare: [
        { id: 10035, name: 'Элитная древесина', amount: 2, chance: 20 }
      ]
    },
    description: 'Удобная скамейка для отдыха. Укрась свой город!',
    imageUrl: '/buildings/Декор/Парковые скамейки - Park benches/394.webp'
  },
  {
    id: 60012,
    name: 'Фонтан 1',
    englishName: 'Fountain 1',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 40,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 6368,
      gloryOnExplosion: 10000
    },
    drops: {
      frequent: [
        { id: 10016, name: 'Атомная бомба', amount: 3, chance: 80 },
        { id: 10018, name: 'Яйцо Горыныча', amount: 5, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 7853, chance: 100 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 55, chance: 20 }
      ]
    },
    description: 'Гномы говорят, если у города нет фонтана, то у него нет души. Gnomes said, if the city has no fountain, he has no soul.',
    imageUrl: '/buildings/Декор/Фонтан 1/397.webp',
    upgradesTo: 60013,
    upgradeCost: 40000
  },
  {
    id: 60013,
    name: 'Фонтан 2',
    englishName: 'Fountain 2',
    category: 'Декор',
    type: BuildingType.Default,
    price: 40000,
    buildable: false,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 6648,
      gloryOnExplosion: 10000
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Железная руда', amount: 23, chance: 80 },
        { id: 10006, name: 'Сталь', amount: 5, chance: 70 },
        { id: 10000, name: 'Монеты', amount: 9707, chance: 100 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 8, chance: 20 }
      ]
    },
    description: 'Гномы говорят, если у города нет фонтана, то у него нет души. Gnomes said, if the city has no fountain, he has no soul.',
    imageUrl: '/buildings/Декор/Фонтан 1/398.webp'
  },
  // Flags - Флаги
  {
    id: 21007,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21007.webp'
  },
  {
    id: 21001,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10040, name: 'Изумрудная руда', amount: 19 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21001.webp'
  },
  {
    id: 21002,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 9 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21002.webp'
  },
  {
    id: 21004,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10028, name: 'Супер детонатор', amount: 2 },
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10025, name: 'Самородок', amount: 69 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21004.webp'
  },
  {
    id: 21005,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10025, name: 'Самородок', amount: 5 },
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10040, name: 'Изумрудная руда', amount: 19 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21005.webp'
  },
  {
    id: 21006,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10019, name: 'Супер подсолнух', amount: 2 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 9 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21006.webp'
  },
  {
    id: 21008,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10025, name: 'Самородок', amount: 69 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21008.webp'
  },
  {
    id: 21009,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10028, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [
        { id: 10040, name: 'Изумрудная руда', amount: 19 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21009.webp'
  },
  {
    id: 21010,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10028, name: 'Супер детонатор', amount: 2 },
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 9 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21010.webp'
  },
  {
    id: 21011,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10025, name: 'Самородок', amount: 5 },
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21011.webp'
  },
  {
    id: 21012,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10019, name: 'Супер подсолнух', amount: 2 }
      ],
      rare: [
        { id: 10025, name: 'Самородок', amount: 69 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21012.webp'
  },
  {
    id: 21013,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10040, name: 'Изумрудная руда', amount: 19 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21013.webp'
  },
  {
    id: 21014,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 9 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21014.webp'
  },
  {
    id: 21015,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10028, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21015.webp'
  },
  {
    id: 21017,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10025, name: 'Самородок', amount: 5 },
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10040, name: 'Изумрудная руда', amount: 19 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21017.webp'
  },
  {
    id: 21018,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10019, name: 'Супер подсолнух', amount: 2 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 9 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21018.webp'
  },
  {
    id: 21019,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21019.webp'
  },
  {
    id: 21020,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10025, name: 'Самородок', amount: 69 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21020.webp'
  },
  {
    id: 21021,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10028, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [
        { id: 10040, name: 'Изумрудная руда', amount: 19 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21021.webp'
  },
  {
    id: 21022,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10028, name: 'Супер детонатор', amount: 2 },
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 9 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21022.webp'
  },
  {
    id: 21023,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10025, name: 'Самородок', amount: 5 },
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21023.webp'
  },
  {
    id: 21024,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10019, name: 'Супер подсолнух', amount: 2 }
      ],
      rare: [
        { id: 10025, name: 'Самородок', amount: 69 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21024.webp'
  },
  {
    id: 21025,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 26 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10040, name: 'Изумрудная руда', amount: 19 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21025.webp'
  },
  {
    id: 21026,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 9 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21026.webp'
  },
  {
    id: 21027,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10021, name: 'Золото', amount: 2 },
        { id: 10028, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21027.webp'
  },
  {
    id: 21029,
    name: 'Флаг',
    englishName: 'Flag',
    category: 'Декор',
    decorSubCategory: 'flags',
    type: BuildingType.Default,
    rubyPrice: 50,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 7120,
      gloryOnExplosion: 12500,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10025, name: 'Самородок', amount: 5 },
        { id: 10024, name: 'Стальной лист', amount: 2 }
      ],
      rare: [
        { id: 10040, name: 'Изумрудная руда', amount: 19 }
      ]
    },
    description: 'Декоративный флаг для украшения города.',
    imageUrl: '/buildings/Декор/Флаги/21029.webp'
  },
  {
    id: 3,
    name: 'Цирковой шатёр',
    englishName: 'Circus Tent',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 50000,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 6828,
      gloryOnExplosion: 22500,
      populationBonus: 2,
      takesPopulation: 1,
      workTimeSeconds: 3600, // 60 minutes
      workYieldGold: 5000,
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10045, name: 'Супер детонатор', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Собственный цирк с клоунами, это лучший подарок для ребёнка! Audience wants to see the show. Sell people fun and laughter, earn coins!',
    imageUrl: '/buildings/Бизнес/шатер/3.webp',
    upgradesTo: 24,
    upgradeCost: 210000
  },
  {
    id: 24,
    name: 'Цирковой шатёр с шариками',
    englishName: 'Circus Tent with Balloons',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 210000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 66 },
        { id: 10002, name: 'Доски', amount: 25 },
        { id: 10005, name: 'Камни', amount: 7 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 9108,
      gloryOnExplosion: 15000,
      populationBonus: 4,
      takesPopulation: 3,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 30000,
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 75 },
        { id: 10023, name: 'Сталь', amount: 14 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 201 }
      ]
    },
    description: 'Собственный цирк с клоунами, это лучший подарок для ребёнка! Audience wants to see the show. Sell people fun and laughter, earn coins!',
    imageUrl: '/buildings/Бизнес/шатер/24.webp'
  },
  // Светлый газончик - Bright Lawn
  {
    id: 60020,
    name: 'Светлый газончик',
    englishName: 'Bright lawn',
    category: 'Декор',
    type: BuildingType.Default,
    rubyPrice: 5,
    buildable: true,
    constructionRequirements: {
      population: 1
    },
    stats: {
      constructionTimeSeconds: 20,
      accelerationCost: 1,
      durability: 2248,
      gloryOnExplosion: 1250,
      givesCoins: 2268
    },
    drops: {
      frequent: [
        { id: 10018, name: 'Яйцо избушки', amount: 4 },
        { id: 10004, name: 'Песок', amount: 11 }
      ],
      rare: [
        { id: 10025, name: 'Самородок', amount: 7 }
      ]
    },
    description: 'Отличный ухоженный светлый газон. Nice trim bright lawn.',
    imageUrl: '/buildings/Декор/Светлый газончик - Bright lawn/60006.webp'
  },
  {
    id: 4,
    name: 'Овощной киоск',
    englishName: 'Vegetable Stand',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 25000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 66 },
        { id: 10002, name: 'Доски', amount: 25 },
        { id: 10005, name: 'Камни', amount: 7 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 7890,
      gloryOnExplosion: 30000,
      populationBonus: 2,
      takesPopulation: 1,
      workTimeSeconds: 1500, // 25 minutes
      workYieldGold: 2500,
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 10 },
        { id: 10040, name: 'Стальной лист', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 150 }
      ]
    },
    description: 'Все любят сочные спелые овощи, а особенно жители мегаполиса! Everyone loves ripe and juicy vegetables, especially those who live in a big city!',
    imageUrl: '/buildings/Бизнес/магазинчик/50.webp',
    upgradesTo: 50,
    upgradeCost: 500000
  },
  {
    id: 50,
    name: 'Киоск фрукты-овощи',
    englishName: 'Vegetable/Fruit Stand',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 500000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 40 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 10920,
      gloryOnExplosion: 45000,
      populationBonus: 6,
      takesPopulation: 4,
      workTimeSeconds: 18000, // 5 hours
      workYieldGold: 45000,
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 9 },
        { id: 10045, name: 'Супер детонатор', amount: 5 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 37 }
      ]
    },
    description: 'Все любят сочные спелые фрукты и овощи, а особенно жители мегаполиса! Everyone loves ripe and juicy vegetables, especially those who live in a big city!',
    imageUrl: '/buildings/Бизнес/магазинчик/50.webp'
  },
  {
    id: 57,
    name: 'Цветочный магазин',
    englishName: 'Flower Shop',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 600000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 132 },
        { id: 10002, name: 'Доски', amount: 50 },
        { id: 10005, name: 'Камни', amount: 14 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 14034,
      gloryOnExplosion: 95000,
      populationBonus: 20,
      takesPopulation: 17,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 70000,
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10045, name: 'Супер детонатор', amount: 8 },
        { id: 10040, name: 'Стальной лист', amount: 13 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 127 }
      ]
    },
    description: 'Цветочный магазин. Flower shop.',
    imageUrl: '/buildings/Бизнес/цветочный магазин/57.webp',
    upgradesTo: 58,
    upgradeCost: 1200000
  },
  {
    id: 58,
    name: 'Цветочный магазин 2',
    englishName: 'Flower Shop 2',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 1200000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10025, name: 'Золотая руда', amount: 16 },
        { id: 10023, name: 'Сталь', amount: 10 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 16218,
      gloryOnExplosion: 60000,
      populationBonus: 25,
      takesPopulation: 20,
      workTimeSeconds: 14400, // 4 hours
      workYieldGold: 140000,
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 43 },
        { id: 10040, name: 'Стальной лист', amount: 17 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 81 }
      ]
    },
    description: 'Цветочный магазин. Flower shop.',
    imageUrl: '/buildings/Бизнес/цветочный магазин/58.webp',
    upgradesTo: 59,
    upgradeCost: 2000000
  },
  {
    id: 59,
    name: 'Цветочный магазин 3',
    englishName: 'Flower Shop 3',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 2000000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10025, name: 'Золотая руда', amount: 50 },
        { id: 10023, name: 'Сталь', amount: 30 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 19356,
      gloryOnExplosion: 100000,
      populationBonus: 30,
      takesPopulation: 25,
      workTimeSeconds: 18000, // 5 hours
      workYieldGold: 300000,
      givesCoins: 20997
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 8 },
        { id: 10036, name: 'Изумрудная руда', amount: 17 },
        { id: 10000, name: 'Монеты', amount: 20997 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 16 }
      ]
    },
    description: 'Цветочный магазин. Flower shop.',
    imageUrl: '/buildings/Бизнес/цветочный магазин/59.webp'
  },
  {
    id: 36,
    name: 'Большой магазин',
    englishName: 'Big Shop',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 210000,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 132 },
        { id: 10002, name: 'Доски', amount: 50 },
        { id: 10005, name: 'Камни', amount: 14 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 12468,
      gloryOnExplosion: 75000,
      populationBonus: 5,
      takesPopulation: 3,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 32000,
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Железная руда', amount: 141 },
        { id: 10023, name: 'Сталь', amount: 27 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 375 }
      ]
    },
    description: 'Магазин для небольшого городка. Shop for a small town.',
    imageUrl: '/buildings/Бизнес/магазинчик/21.webp',
    upgradesTo: 37,
    upgradeCost: 550000
  },
  {
    id: 37,
    name: 'Большой двухэтажный магазин',
    englishName: 'Big Two-Storey Shop',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 550000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10025, name: 'Золотая руда', amount: 7 },
        { id: 10023, name: 'Сталь', amount: 5 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 13614,
      gloryOnExplosion: 27500,
      populationBonus: 10,
      takesPopulation: 9,
      workTimeSeconds: 10800, // 3 hours
      workYieldGold: 60000,
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 13 },
        { id: 10023, name: 'Сталь', amount: 32 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 120 }
      ]
    },
    description: 'Магазин для небольшого городка. Shop for a small town.',
    imageUrl: '/buildings/Специальные Здания/Рынок - Market/76.webp',
    upgradesTo: 38,
    upgradeCost: 650000
  },
  {
    id: 38,
    name: 'Большой трехэтажный магазин',
    englishName: 'Big Three-Storey Shop',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 650000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10025, name: 'Золотая руда', amount: 12 },
        { id: 10023, name: 'Сталь', amount: 10 }
      ],
      population: 1
    },
    stats: {
      constructionTimeSeconds: 3,
      accelerationCost: 0,
      durability: 14868,
      gloryOnExplosion: 32500,
      populationBonus: 18,
      takesPopulation: 17,
      workTimeSeconds: 14400, // 4 hours
      workYieldGold: 75000,
      givesCoins: 13538
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 16 },
        { id: 10045, name: 'Супер детонатор', amount: 9 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 68 }
      ]
    },
    description: 'Магазин для небольшого городка. Shop for a small town.',
    imageUrl: '/buildings/Специальные Здания/Кинотеатр - Movie theater/22.webp'
  },
  // ============================================================
  // Улучшеный пруд с Лилиями (Enhanced Lily Pond) - IDs 577-597
  // Category: Заводы, 21 levels with special upgrade system
  // ============================================================
  {
    id: 577,
    name: 'Улучшеный пруд с Лилиями',
    englishName: 'Enhanced Lily Pond',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 15,
    buildable: true,
    constructionRequirements: {
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 40,
      gloryOnExplosion: 1,
      takesPopulation: 1,
      workTimeSeconds: 264,
      workYieldGold: 30,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 30.5, amount: 1 }
      ]
    },
    drops: {
      rare: [
        { id: 10008, name: 'Бочка с нефтью', amount: 2 }
      ]
    },
    description: 'Улучшеный пруд с лилиями. Приносит доход и иногда производит супер лилию.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/581.webp',
    upgradesTo: 578,
    upgradeCost: 300,
  },
  {
    id: 578,
    name: 'Улучшеный пруд с Лилиями уровень - 2',
    englishName: 'Enhanced Lily Pond Level 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 300,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 1 }
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 171,
      accelerationCost: 3,
      durability: 184,
      gloryOnExplosion: 15,
      takesPopulation: 2,
      workTimeSeconds: 278,
      workYieldGold: 60,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 32, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10008, name: 'Бочка с нефтью', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 140 }
      ],
      rare: [
        { id: 10003, name: '????? ????? ?????', amount: 6 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 2 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/581.webp',
    upgradesTo: 579,
    upgradeCost: 5400,
  },
  {
    id: 579,
    name: 'Улучшеный пруд с Лилиями уровень - 3',
    englishName: 'Enhanced Lily Pond Level 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 5400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 14 },
        { id: 10002, name: 'Доски', amount: 5 }
      ],
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 864,
      accelerationCost: 6,
      durability: 808,
      gloryOnExplosion: 270,
      takesPopulation: 3,
      workTimeSeconds: 295,
      workYieldGold: 90,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 34.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10013, name: 'Петарда', amount: 10 },
        { id: 10010, name: 'Садовая бомба', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 659 }
      ],
      rare: [
        { id: 10004, name: 'Железная руда', amount: 5 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 3 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/581.webp',
    upgradesTo: 580,
    upgradeCost: 12800,
  },
  {
    id: 580,
    name: 'Улучшеный пруд с Лилиями уровень - 4',
    englishName: 'Enhanced Lily Pond Level 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 12800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 13 }
      ],
      population: 17,
    },
    stats: {
      constructionTimeSeconds: 2456,
      accelerationCost: 10,
      durability: 1288,
      gloryOnExplosion: 640,
      takesPopulation: 4,
      workTimeSeconds: 420,
      workYieldGold: 120,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 38, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 2 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 1572 }
      ],
      rare: [
        { id: 10018, name: 'Яйцо Горыныча', amount: 3 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 4 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/581.webp',
    upgradesTo: 581,
    upgradeCost: 25000,
  },
  {
    id: 581,
    name: 'Улучшеный пруд с Лилиями уровень - 5',
    englishName: 'Enhanced Lily Pond Level 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 25000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 25 }
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 6083,
      accelerationCost: 16,
      durability: 1856,
      gloryOnExplosion: 1250,
      takesPopulation: 4,
      workTimeSeconds: 561,
      workYieldGold: 150,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 42.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10005, name: 'Элитная древесина', amount: 2 },
        { id: 10025, name: 'Супер тыква', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 2268 }
      ],
      rare: [
        { id: 10006, name: 'Стальной лист', amount: 2 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 5 уровня.',
    imageUrl: '/buildings/garden_beds/lilies/enhanced_lilies_pond/581.webp',
    upgradesTo: 582,
    upgradeCost: 43200,
  },
  {
    id: 582,
    name: 'Улучшеный пруд с Лилиями уровень - 6',
    englishName: 'Enhanced Lily Pond Level 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 43200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 43 }
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 13500,
      accelerationCost: 24,
      durability: 2520,
      gloryOnExplosion: 2160,
      takesPopulation: 6,
      workTimeSeconds: 720,
      workYieldGold: 180,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 48, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 5 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 5 },
        { id: 10000, name: 'Монеты', amount: 2735 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 3 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 6 уровня.',
    imageUrl: '/buildings/garden_beds/lilies/enhanced_lilies_pond/582.webp',
    upgradesTo: 583,
    upgradeCost: 68600,
  },
  {
    id: 583,
    name: 'Улучшеный пруд с Лилиями уровень - 7',
    englishName: 'Enhanced Lily Pond Level 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 68600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 69 },
        { id: 10005, name: 'Камни', amount: 1 }
      ],
      population: 37,
    },
    stats: {
      constructionTimeSeconds: 25326,
      accelerationCost: 34,
      durability: 3280,
      gloryOnExplosion: 3430,
      takesPopulation: 8,
      workTimeSeconds: 897,
      workYieldGold: 210,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 54.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10026, name: 'Супер гриб', amount: 7 },
        { id: 10000, name: 'Монеты', amount: 4299 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 2 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 7 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/582.webp',
    upgradesTo: 584,
    upgradeCost: 102400,
  },
  {
    id: 584,
    name: 'Улучшеный пруд с Лилиями уровень - 8',
    englishName: 'Enhanced Lily Pond Level 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 102400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 102 },
        { id: 10005, name: 'Камни', amount: 1 }
      ],
      population: 45,
    },
    stats: {
      constructionTimeSeconds: 45562,
      accelerationCost: 45,
      durability: 4120,
      gloryOnExplosion: 5120,
      takesPopulation: 9,
      workTimeSeconds: 1094,
      workYieldGold: 240,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 62, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10027, name: 'Супер репка', amount: 2 },
        { id: 10025, name: 'Супер тыква', amount: 7 },
        { id: 10000, name: 'Монеты', amount: 5839 }
      ],
      rare: [
        { id: 10006, name: 'Стальной лист', amount: 10 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 8 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/582.webp',
    upgradesTo: 585,
    upgradeCost: 145000,
  },
  {
    id: 585,
    name: 'Улучшеный пруд с Лилиями уровень - 9',
    englishName: 'Enhanced Lily Pond Level 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 145000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 148 },
        { id: 10005, name: 'Камни', amount: 2 }
      ],
      population: 54,
    },
    stats: {
      constructionTimeSeconds: 80000,
      accelerationCost: 58,
      durability: 5056,
      gloryOnExplosion: 7400,
      takesPopulation: 12,
      workTimeSeconds: 1300,
      workYieldGold: 270,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 71, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Золото', amount: 1 },
        { id: 10006, name: 'Стальной лист', amount: 5 },
        { id: 10000, name: 'Монеты', amount: 6800 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 8 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 9 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/582.webp',
    upgradesTo: 586,
    upgradeCost: 200000,
  },
  {
    id: 586,
    name: 'Улучшеный пруд с Лилиями уровень - 10',
    englishName: 'Enhanced Lily Pond Level 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 200000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 200 },
        { id: 10005, name: 'Камни', amount: 2 }
      ],
      population: 63,
    },
    stats: {
      constructionTimeSeconds: 125023,
      accelerationCost: 75,
      durability: 6072,
      gloryOnExplosion: 10000,
      takesPopulation: 16,
      workTimeSeconds: 1549,
      workYieldGold: 300,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 80, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Золото', amount: 2 },
        { id: 10037, name: 'Сталь', amount: 4 },
        { id: 10000, name: 'Монеты', amount: 7853 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 14 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 10 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/582.webp',
    upgradesTo: 587,
    upgradeCost: 266200,
  },
  {
    id: 587,
    name: 'Улучшеный пруд с Лилиями уровень - 11',
    englishName: 'Enhanced Lily Pond Level 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 266200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 266 },
        { id: 10005, name: 'Камни', amount: 3 },
        { id: 10037, name: 'Камень Тролля', amount: 1 }
      ],
      population: 73,
    },
    stats: {
      constructionTimeSeconds: 194508,
      accelerationCost: 93,
      durability: 7176,
      gloryOnExplosion: 13310,
      takesPopulation: 17,
      workTimeSeconds: 1807,
      workYieldGold: 330,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 90.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 5 },
        { id: 10006, name: 'Стальной лист', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 11 уровня.',
    imageUrl: '/buildings/garden_beds/lilies/enhanced_lilies_pond/587.webp',
    upgradesTo: 588,
    upgradeCost: 345600,
  },
  {
    id: 588,
    name: 'Улучшеный пруд с Лилиями уровень - 12',
    englishName: 'Enhanced Lily Pond Level 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 345600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 518 },
        { id: 10005, name: 'Камни', amount: 5 }
      ],
      population: 84,
    },
    stats: {
      constructionTimeSeconds: 295152,
      accelerationCost: 115,
      durability: 8368,
      gloryOnExplosion: 17280,
      takesPopulation: 21,
      workTimeSeconds: 2086,
      workYieldGold: 360,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 102, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Железная руда', amount: 36 },
        { id: 10028, name: 'Супер подсолнух', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 10631 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 96 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 12 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/587.webp',
    upgradesTo: 589,
    upgradeCost: 439400,
  },
  {
    id: 589,
    name: 'Улучшеный пруд с Лилиями уровень - 13',
    englishName: 'Enhanced Lily Pond Level 13',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 439400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 659 },
        { id: 10005, name: 'Камни', amount: 7 },
        { id: 10035, name: 'Элитная древесина', amount: 1 },
        { id: 10006, name: 'Каменные блоки', amount: 1 }
      ],
      population: 95,
    },
    stats: {
      constructionTimeSeconds: 427487,
      accelerationCost: 138,
      durability: 9648,
      gloryOnExplosion: 21970,
      takesPopulation: 23,
      workTimeSeconds: 2386,
      workYieldGold: 390,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 114.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Золото', amount: 4 },
        { id: 10037, name: 'Сталь', amount: 9 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 34 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 13 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/587.webp',
    upgradesTo: 590,
    upgradeCost: 548800,
  },
  {
    id: 590,
    name: 'Улучшеный пруд с Лилиями уровень - 14',
    englishName: 'Enhanced Lily Pond Level 14',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 548800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 8 },
        { id: 10035, name: 'Элитная древесина', amount: 1 },
        { id: 10006, name: 'Каменные блоки', amount: 1 }
      ],
      population: 107,
    },
    stats: {
      constructionTimeSeconds: 612521,
      accelerationCost: 165,
      durability: 11016,
      gloryOnExplosion: 27440,
      takesPopulation: 28,
      workTimeSeconds: 2708,
      workYieldGold: 420,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 128, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Золото', amount: 5 },
        { id: 10042, name: '??????', amount: 3 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 21 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 14 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/587.webp',
    upgradesTo: 591,
    upgradeCost: 675000,
  },
  {
    id: 591,
    name: 'Улучшеный пруд с Лилиями уровень - 15',
    englishName: 'Enhanced Lily Pond Level 15',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 675000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 10 },
        { id: 10035, name: 'Элитная древесина', amount: 1 },
        { id: 10006, name: 'Каменные блоки', amount: 1 }
      ],
      population: 120,
    },
    stats: {
      constructionTimeSeconds: 864000,
      accelerationCost: 196,
      durability: 12472,
      gloryOnExplosion: 33750,
      takesPopulation: 33,
      workTimeSeconds: 3051,
      workYieldGold: 450,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 142.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 4 },
        { id: 10006, name: 'Стальной лист', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 4 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 15 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/587.webp',
    upgradesTo: 592,
    upgradeCost: 819200,
  },
  {
    id: 592,
    name: 'Улучшеный пруд с Лилиями уровень - 16',
    englishName: 'Enhanced Lily Pond Level 16',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 819200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 12 },
        { id: 10035, name: 'Элитная древесина', amount: 1 },
        { id: 10006, name: 'Каменные блоки', amount: 1 }
      ],
      population: 133,
    },
    stats: {
      constructionTimeSeconds: 1175118,
      accelerationCost: 229,
      durability: 14008,
      gloryOnExplosion: 40960,
      takesPopulation: 35,
      workTimeSeconds: 3416,
      workYieldGold: 480,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 158, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 18 },
        { id: 10006, name: 'Стальной лист', amount: 8 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 267 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 16 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/597.webp',
    upgradesTo: 593,
    upgradeCost: 982600,
  },
  {
    id: 593,
    name: 'Улучшеный пруд с Лилиями уровень - 17',
    englishName: 'Enhanced Lily Pond Level 17',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 982600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 15 },
        { id: 10035, name: 'Элитная древесина', amount: 1 },
        { id: 10006, name: 'Каменные блоки', amount: 1 }
      ],
      population: 147,
    },
    stats: {
      constructionTimeSeconds: 1587061,
      accelerationCost: 266,
      durability: 15640,
      gloryOnExplosion: 49130,
      takesPopulation: 40,
      workTimeSeconds: 3802,
      workYieldGold: 510,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 174.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 23 },
        { id: 10036, name: 'Изумрудная руда', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 89 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 17 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/597.webp',
    upgradesTo: 594,
    upgradeCost: 1166400,
  },
  {
    id: 594,
    name: 'Улучшеный пруд с Лилиями уровень - 18',
    englishName: 'Enhanced Lily Pond Level 18',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1166400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 17 },
        { id: 10035, name: 'Элитная древесина', amount: 2 },
        { id: 10006, name: 'Каменные блоки', amount: 1 }
      ],
      population: 162,
    },
    stats: {
      constructionTimeSeconds: 2127564,
      accelerationCost: 307,
      durability: 17352,
      gloryOnExplosion: 58320,
      takesPopulation: 43,
      workTimeSeconds: 4210,
      workYieldGold: 540,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 192, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Железная руда', amount: 153 },
        { id: 10037, name: 'Сталь', amount: 29 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 52 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 18 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/597.webp',
    upgradesTo: 595,
    upgradeCost: 1371800,
  },
  {
    id: 595,
    name: 'Улучшеный пруд с Лилиями уровень - 19',
    englishName: 'Enhanced Lily Pond Level 19',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1371800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 21 },
        { id: 10035, name: 'Элитная древесина', amount: 2 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10006, name: 'Каменные блоки', amount: 2 }
      ],
      population: 177,
    },
    stats: {
      constructionTimeSeconds: 2782216,
      accelerationCost: 351,
      durability: 19144,
      gloryOnExplosion: 68590,
      takesPopulation: 49,
      workTimeSeconds: 4639,
      workYieldGold: 570,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 210.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Золото', amount: 15 },
        { id: 10037, name: 'Сталь', amount: 35 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 9 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 19 уровня.',
    imageUrl: '/buildings/Грядки/Пруд с лилиями - Lilies pond/597.webp',
    upgradesTo: 596,
    upgradeCost: 1600000,
  },
  {
    id: 596,
    name: 'Улучшеный пруд с Лилиями уровень - 20',
    englishName: 'Enhanced Lily Pond Level 20',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1600000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 24 },
        { id: 10035, name: 'Элитная древесина', amount: 2 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10006, name: 'Каменные блоки', amount: 2 }
      ],
      population: 193,
    },
    stats: {
      constructionTimeSeconds: 3574128,
      accelerationCost: 400,
      durability: 21032,
      gloryOnExplosion: 80000,
      takesPopulation: 56,
      workTimeSeconds: 5090,
      workYieldGold: 600,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 230, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10035, name: 'Золото', amount: 18 },
        { id: 10042, name: '??????', amount: 10 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 600 }
      ]
    },
    description: 'Улучшеный пруд с лилиями 20 уровня.',
    imageUrl: '/buildings/garden_beds/lilies/enhanced_lilies_pond/596.webp',
    upgradesTo: 597,
    upgradeCost: 1852200,
  },
  {
    id: 597,
    name: 'Улучшеный пруд с Лилиями уровень - 21',
    englishName: 'Enhanced Lily Pond Level 21',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1852200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10005, name: 'Камни', amount: 28 },
        { id: 10035, name: 'Элитная древесина', amount: 3 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10006, name: 'Каменные блоки', amount: 2 }
      ],
      population: 210,
    },
    stats: {
      constructionTimeSeconds: 4655700,
      accelerationCost: 454,
      durability: 23000,
      gloryOnExplosion: 92610,
      takesPopulation: 58,
      workTimeSeconds: 5563,
      workYieldGold: 630,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия', chance: 250.5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 11 },
        { id: 10006, name: 'Стальной лист', amount: 20 },
        { id: 10000, name: 'Монеты', amount: 13538 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 192 }
      ]
    },
    description: 'Максимальный уровень улучшенного пруда с лилиями. Невероятная мощь!',
    imageUrl: '/buildings/garden_beds/lilies/enhanced_lilies_pond/597.webp',
  },
  // ============================================================
  // Улучшеная Грибная Грядка (Enhanced Mushroom Bed) - IDs 874-894
  // Category: Заводы, 21 levels with special upgrade system
  // ============================================================
  {
    id: 874,
    name: 'Улучшеная Грибная Грядка',
    englishName: 'Enhanced Mushroom Bed',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 300,
    buildable: true,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 2 },
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 2,
      durability: 176,
      gloryOnExplosion: 15,
      takesPopulation: 2,
      workTimeSeconds: 655,
      workYieldGold: 50,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 30.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 4 },
        { id: 10008, name: 'Бочка с нефтью', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 140 },
      ],
      rare: [
        { id: 10006, name: 'Каменные блоки', amount: 2 }
      ]
    },
    description: 'Улучшеная грибная грядка. Приносит доход и иногда производит супер гриб.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/878.webp',
    upgradesTo: 875,
    upgradeCost: 1200,
  },
  {
    id: 875,
    name: 'Улучшеная Грибная Грядка уровень - 2',
    englishName: 'Enhanced Mushroom Bed Level 2',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 3 },
        { id: 10002, name: 'Доски', amount: 1 },
      ],
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 205,
      accelerationCost: 3,
      durability: 368,
      gloryOnExplosion: 60,
      takesPopulation: 2,
      workTimeSeconds: 677,
      workYieldGold: 100,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 31, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 6 },
        { id: 10013, name: 'Петарда', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 303 },
      ],
      rare: [
        { id: 10022, name: 'Руда', amount: 2 }
      ]
    },
    description: 'Улучшеная грибная грядка 2 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/878.webp',
    upgradesTo: 876,
    upgradeCost: 10800,
  },
  {
    id: 876,
    name: 'Улучшеная Грибная Грядка уровень - 3',
    englishName: 'Enhanced Mushroom Bed Level 3',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 10800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10001, name: 'Дерево', amount: 28 },
        { id: 10002, name: 'Доски', amount: 11 },
      ],
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 1036,
      accelerationCost: 7,
      durability: 1136,
      gloryOnExplosion: 540,
      takesPopulation: 4,
      workTimeSeconds: 1057,
      workYieldGold: 150,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 32.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10002, name: 'Доски', amount: 57 },
        { id: 10009, name: 'Канистра с бензином', amount: 38 },
        { id: 10000, name: 'Монеты', amount: 839 },
      ],
      rare: [
        { id: 10018, name: 'Яйцо Горыныча', amount: 3 }
      ]
    },
    description: 'Улучшеная грибная грядка 3 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/878.webp',
    upgradesTo: 877,
    upgradeCost: 25600,
  },
  {
    id: 877,
    name: 'Улучшеная Грибная Грядка уровень - 4',
    englishName: 'Enhanced Mushroom Bed Level 4',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 25600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 26 },
      ],
      population: 17,
    },
    stats: {
      constructionTimeSeconds: 2947,
      accelerationCost: 11,
      durability: 1816,
      gloryOnExplosion: 1280,
      takesPopulation: 4,
      workTimeSeconds: 1470,
      workYieldGold: 200,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 34, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 3 },
        { id: 10007, name: 'Яйцо Избушки-убийцы', amount: 3 },
        { id: 10000, name: 'Монеты', amount: 2268 },
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 2 }
      ]
    },
    description: 'Улучшеная грибная грядка 4 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/878.webp',
    upgradesTo: 878,
    upgradeCost: 50000,
  },
  {
    id: 878,
    name: 'Улучшеная Грибная Грядка уровень - 5',
    englishName: 'Enhanced Mushroom Bed Level 5',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 50000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 50 },
        { id: 10035, name: 'Элитная древесина', amount: 1 },
      ],
      population: 23,
    },
    stats: {
      constructionTimeSeconds: 7300,
      accelerationCost: 18,
      durability: 2632,
      gloryOnExplosion: 2500,
      takesPopulation: 5,
      workTimeSeconds: 1921,
      workYieldGold: 250,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 36.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10003, name: '????? ????? ?????', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 10 },
        { id: 10000, name: 'Монеты', amount: 2735 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 3 }
      ]
    },
    description: 'Улучшеная грибная грядка 5 уровня.',
    imageUrl: '/buildings/garden_beds/mushroom/enhanced_mushroom_bed/878.webp',
    upgradesTo: 879,
    upgradeCost: 86400,
  },
  {
    id: 879,
    name: 'Улучшеная Грибная Грядка уровень - 6',
    englishName: 'Enhanced Mushroom Bed Level 6',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 86400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 86 },
        { id: 10035, name: 'Элитная древесина', amount: 1 },
      ],
      population: 30,
    },
    stats: {
      constructionTimeSeconds: 16200,
      accelerationCost: 27,
      durability: 3568,
      gloryOnExplosion: 4320,
      takesPopulation: 7,
      workTimeSeconds: 2414,
      workYieldGold: 300,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 39, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10018, name: 'Яйцо Горыныча', amount: 2 },
        { id: 10004, name: 'Куски супер тыквы', amount: 5 },
        { id: 10000, name: 'Монеты', amount: 4775 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 3 }
      ]
    },
    description: 'Улучшеная грибная грядка 6 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/883.webp',
    upgradesTo: 880,
    upgradeCost: 137200,
  },
  {
    id: 880,
    name: 'Улучшеная Грибная Грядка уровень - 7',
    englishName: 'Enhanced Mushroom Bed Level 7',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 137200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 137 },
        { id: 10035, name: 'Элитная древесина', amount: 1 },
      ],
      population: 37,
    },
    stats: {
      constructionTimeSeconds: 30391,
      accelerationCost: 37,
      durability: 4640,
      gloryOnExplosion: 6860,
      takesPopulation: 9,
      workTimeSeconds: 2954,
      workYieldGold: 350,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 42.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 11 },
        { id: 10018, name: 'Яйцо Горыныча', amount: 3 },
        { id: 10000, name: 'Монеты', amount: 6401 },
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 12 }
      ]
    },
    description: 'Улучшеная грибная грядка 7 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/883.webp',
    upgradesTo: 881,
    upgradeCost: 204800,
  },
  {
    id: 881,
    name: 'Улучшеная Грибная Грядка уровень - 8',
    englishName: 'Enhanced Mushroom Bed Level 8',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 204800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 205 },
        { id: 10035, name: 'Элитная древесина', amount: 2 },
      ],
      population: 45,
    },
    stats: {
      constructionTimeSeconds: 54675,
      accelerationCost: 49,
      durability: 5832,
      gloryOnExplosion: 10240,
      takesPopulation: 11,
      workTimeSeconds: 3539,
      workYieldGold: 400,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 46, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10040, name: 'Стальной лист', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 7853 },
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 47 }
      ]
    },
    description: 'Улучшеная грибная грядка 8 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/883.webp',
    upgradesTo: 882,
    upgradeCost: 291600,
  },
  {
    id: 882,
    name: 'Улучшеная Грибная Грядка уровень - 9',
    englishName: 'Enhanced Mushroom Bed Level 9',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 291600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 292 },
        { id: 10035, name: 'Элитная древесина', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 1 },
      ],
      population: 54,
    },
    stats: {
      constructionTimeSeconds: 94478,
      accelerationCost: 65,
      durability: 7144,
      gloryOnExplosion: 14580,
      takesPopulation: 14,
      workTimeSeconds: 4174,
      workYieldGold: 450,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 50.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 26 },
        { id: 10030, name: 'Супер подсолнух', amount: 2 },
        { id: 10000, name: 'Монеты', amount: 10631 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 9 }
      ]
    },
    description: 'Улучшеная грибная грядка 9 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/883.webp',
    upgradesTo: 883,
    upgradeCost: 400000,
  },
  {
    id: 883,
    name: 'Улучшеная Грибная Грядка уровень - 10',
    englishName: 'Enhanced Mushroom Bed Level 10',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 400000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 400 },
        { id: 10035, name: 'Элитная древесина', amount: 4 },
        { id: 10023, name: 'Сталь', amount: 1 },
      ],
      population: 63,
    },
    stats: {
      constructionTimeSeconds: 150028,
      accelerationCost: 82,
      durability: 8584,
      gloryOnExplosion: 20000,
      takesPopulation: 18,
      workTimeSeconds: 4860,
      workYieldGold: 500,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 55, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 38 },
        { id: 10023, name: 'Сталь', amount: 7 },
        { id: 10000, name: 'Монеты', amount: 10631 },
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Улучшеная грибная грядка 10 уровня.',
    imageUrl: '/buildings/garden_beds/mushroom/enhanced_mushroom_bed/883.webp',
    upgradesTo: 884,
    upgradeCost: 532400,
  },
  {
    id: 884,
    name: 'Улучшеная Грибная Грядка уровень - 11',
    englishName: 'Enhanced Mushroom Bed Level 11',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 532400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 532 },
        { id: 10035, name: 'Элитная древесина', amount: 5 },
        { id: 10023, name: 'Сталь', amount: 1 },
      ],
      population: 73,
    },
    stats: {
      constructionTimeSeconds: 233410,
      accelerationCost: 102,
      durability: 10152,
      gloryOnExplosion: 26620,
      takesPopulation: 22,
      workTimeSeconds: 5598,
      workYieldGold: 550,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 60.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10042, name: '??????', amount: 3 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 140 }
      ]
    },
    description: 'Улучшеная грибная грядка 11 уровня.',
    imageUrl: '/buildings/garden_beds/mushroom/enhanced_mushroom_bed/884.webp',
    upgradesTo: 885,
    upgradeCost: 691200,
  },
  {
    id: 885,
    name: 'Улучшеная Грибная Грядка уровень - 12',
    englishName: 'Enhanced Mushroom Bed Level 12',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 691200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1037 },
        { id: 10035, name: 'Элитная древесина', amount: 10 },
        { id: 10026, name: 'Золото', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 1 },
      ],
      population: 84,
    },
    stats: {
      constructionTimeSeconds: 355622,
      accelerationCost: 126,
      durability: 11840,
      gloryOnExplosion: 34560,
      takesPopulation: 24,
      workTimeSeconds: 6389,
      workYieldGold: 600,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 66, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 3 },
        { id: 10040, name: 'Стальной лист', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 51 }
      ]
    },
    description: 'Улучшеная грибная грядка 12 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/884.webp',
    upgradesTo: 886,
    upgradeCost: 878800,
  },
  {
    id: 886,
    name: 'Улучшеная Грибная Грядка уровень - 13',
    englishName: 'Enhanced Mushroom Bed Level 13',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 878800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10002, name: 'Доски', amount: 1318 },
        { id: 10035, name: 'Элитная древесина', amount: 13 },
        { id: 10026, name: 'Золото', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 1 },
      ],
      population: 95,
    },
    stats: {
      constructionTimeSeconds: 514425,
      accelerationCost: 151,
      durability: 13648,
      gloryOnExplosion: 43940,
      takesPopulation: 28,
      workTimeSeconds: 7234,
      workYieldGold: 650,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 72.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 17 },
        { id: 10040, name: 'Стальной лист', amount: 7 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 32 }
      ]
    },
    description: 'Улучшеная грибная грядка 13 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/884.webp',
    upgradesTo: 887,
    upgradeCost: 1097600,
  },
  {
    id: 887,
    name: 'Улучшеная Грибная Грядка уровень - 14',
    englishName: 'Enhanced Mushroom Bed Level 14',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1097600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 16 },
        { id: 10026, name: 'Золото', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 1 },
      ],
      population: 107,
    },
    stats: {
      constructionTimeSeconds: 735025,
      accelerationCost: 181,
      durability: 15584,
      gloryOnExplosion: 54880,
      takesPopulation: 33,
      workTimeSeconds: 8133,
      workYieldGold: 700,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 79, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 22 },
        { id: 10036, name: 'Изумрудная руда', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 6 }
      ]
    },
    description: 'Улучшеная грибная грядка 14 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/884.webp',
    upgradesTo: 888,
    upgradeCost: 1350000,
  },
  {
    id: 888,
    name: 'Улучшеная Грибная Грядка уровень - 15',
    englishName: 'Enhanced Mushroom Bed Level 15',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1350000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 20 },
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 2 },
      ],
      population: 120,
    },
    stats: {
      constructionTimeSeconds: 1036800,
      accelerationCost: 215,
      durability: 17640,
      gloryOnExplosion: 67500,
      takesPopulation: 39,
      workTimeSeconds: 9088,
      workYieldGold: 750,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 86.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 159 },
        { id: 10023, name: 'Сталь', amount: 30 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 422 }
      ]
    },
    description: 'Улучшеная грибная грядка 15 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/884.webp',
    upgradesTo: 889,
    upgradeCost: 1638400,
  },
  {
    id: 889,
    name: 'Улучшеная Грибная Грядка уровень - 16',
    englishName: 'Enhanced Mushroom Bed Level 16',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1638400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 25 },
        { id: 10026, name: 'Золото', amount: 2 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 2 },
      ],
      population: 133,
    },
    stats: {
      constructionTimeSeconds: 1411582,
      accelerationCost: 250,
      durability: 19816,
      gloryOnExplosion: 81920,
      takesPopulation: 41,
      workTimeSeconds: 10097,
      workYieldGold: 800,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 94, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 16 },
        { id: 10023, name: 'Сталь', amount: 38 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 142 }
      ]
    },
    description: 'Улучшеная грибная грядка 16 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/894.webp',
    upgradesTo: 890,
    upgradeCost: 1965200,
  },
  {
    id: 890,
    name: 'Улучшеная Грибная Грядка уровень - 17',
    englishName: 'Enhanced Mushroom Bed Level 17',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 1965200,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 29 },
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 2 },
      ],
      population: 147,
    },
    stats: {
      constructionTimeSeconds: 1905913,
      accelerationCost: 291,
      durability: 22112,
      gloryOnExplosion: 98260,
      takesPopulation: 47,
      workTimeSeconds: 11164,
      workYieldGold: 850,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 102.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 20 },
        { id: 10042, name: '??????', amount: 11 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 84 }
      ]
    },
    description: 'Улучшеная грибная грядка 17 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/894.webp',
    upgradesTo: 891,
    upgradeCost: 2332800,
  },
  {
    id: 891,
    name: 'Улучшеная Грибная Грядка уровень - 18',
    englishName: 'Enhanced Mushroom Bed Level 18',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2332800,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 35 },
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 3 },
      ],
      population: 162,
    },
    stats: {
      constructionTimeSeconds: 2550916,
      accelerationCost: 337,
      durability: 24536,
      gloryOnExplosion: 116640,
      takesPopulation: 54,
      workTimeSeconds: 12286,
      workYieldGold: 900,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 111, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: '??????', amount: 13 },
        { id: 10040, name: 'Стальной лист', amount: 22 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 14 }
      ]
    },
    description: 'Улучшеная грибная грядка 18 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/894.webp',
    upgradesTo: 892,
    upgradeCost: 2743600,
  },
  {
    id: 892,
    name: 'Улучшеная Грибная Грядка уровень - 19',
    englishName: 'Enhanced Mushroom Bed Level 19',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 2743600,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 41 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 3 },
      ],
      population: 177,
    },
    stats: {
      constructionTimeSeconds: 3327139,
      accelerationCost: 385,
      durability: 27080,
      gloryOnExplosion: 137180,
      takesPopulation: 57,
      workTimeSeconds: 13464,
      workYieldGold: 950,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 120.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10044, name: 'Самородок', amount: 67 },
        { id: 10036, name: 'Изумрудная руда', amount: 18 },
        { id: 10000, name: 'Монеты', amount: 20997 },
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 995 }
      ]
    },
    description: 'Улучшеная грибная грядка 19 уровня.',
    imageUrl: '/buildings/Грядки/Грибная грядка  - Mushroom beds/894.webp',
    upgradesTo: 893,
    upgradeCost: 3200000,
  },
  {
    id: 893,
    name: 'Улучшеная Грибная Грядка уровень - 20',
    englishName: 'Enhanced Mushroom Bed Level 20',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3200000,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 48 },
        { id: 10026, name: 'Золото', amount: 4 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 4 },
      ],
      population: 193,
    },
    stats: {
      constructionTimeSeconds: 4313434,
      accelerationCost: 438,
      durability: 29744,
      gloryOnExplosion: 160000,
      takesPopulation: 64,
      workTimeSeconds: 14701,
      workYieldGold: 1000,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 130, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10034, name: 'Изумруд', amount: 11 },
        { id: 10036, name: 'Изумрудная руда', amount: 22 },
        { id: 10000, name: 'Монеты', amount: 20997 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 320 }
      ]
    },
    description: 'Улучшеная грибная грядка 20 уровня.',
    imageUrl: '/buildings/garden_beds/mushroom/enhanced_mushroom_bed/893.webp',
    upgradesTo: 894,
    upgradeCost: 3704400,
  },
  {
    id: 894,
    name: 'Улучшеная Грибная Грядка уровень - 21',
    englishName: 'Enhanced Mushroom Bed Level 21',
    category: 'Заводы',
    type: BuildingType.Default,
    price: 3704400,
    buildable: false,
    constructionRequirements: {
      resources: [
        { id: 10035, name: 'Элитная древесина', amount: 56 },
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10034, name: 'Изумруд', amount: 1 },
        { id: 10040, name: 'Стальной лист', amount: 5 },
      ],
      population: 210,
    },
    stats: {
      constructionTimeSeconds: 5556600,
      accelerationCost: 497,
      durability: 32536,
      gloryOnExplosion: 185220,
      takesPopulation: 71,
      workTimeSeconds: 15993,
      workYieldGold: 1050,
      sometimesProduces: [
        { id: 10003, name: '????? ????? ?????', chance: 140.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 42 },
        { id: 10023, name: 'Сталь', amount: 101 },
        { id: 10000, name: 'Монеты', amount: 20997 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 182 }
      ]
    },
    description: 'Максимальный уровень улучшеной грибной грядки. Невероятная мощь!',
    imageUrl: '/buildings/garden_beds/mushroom/enhanced_mushroom_bed/894.webp',
  },
];

if (import.meta.env.DEV) {
  validateBuildingItemNames(buildings);
}




