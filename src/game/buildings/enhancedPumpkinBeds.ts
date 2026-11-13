import { Building, BuildingType } from '../../../types';

export const enhancedPumpkinBeds: Building[] = [
  // ============================================================
  // Улучшеная тыквенная грядка (Enhanced Pumpkin Bed) - IDs 911-931
  // Category: Грядки, 21 levels with special upgrade system
  // ============================================================
  {
    id: 911,
    name: 'Улучшеная тыквенная грядка',
    englishName: 'Enhanced Pumpkin Bed',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 30.25, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка. Приносит доход и иногда производит куски супер тыквы.',
    imageUrl: '/buildings/static/pumpkin_bed/911.webp',
    upgradesTo: 912,
    upgradeCost: 1200,
  },
  {
    id: 912,
    name: 'Улучшеная тыквенная грядка уровень - 2',
    englishName: 'Enhanced Pumpkin Bed Level 2',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 31, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 2 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/912.webp',
    upgradesTo: 913,
    upgradeCost: 10800,
  },
  {
    id: 913,
    name: 'Улучшеная тыквенная грядка уровень - 3',
    englishName: 'Enhanced Pumpkin Bed Level 3',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 32.25, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 3 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/913.webp',
    upgradesTo: 914,
    upgradeCost: 25600,
  },
  {
    id: 914,
    name: 'Улучшеная тыквенная грядка уровень - 4',
    englishName: 'Enhanced Pumpkin Bed Level 4',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 34, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 4 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/914.webp',
    upgradesTo: 915,
    upgradeCost: 50000,
  },
  {
    id: 915,
    name: 'Улучшеная тыквенная грядка уровень - 5',
    englishName: 'Enhanced Pumpkin Bed Level 5',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 36.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10004, name: 'Куски супер тыквы', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 10 },
        { id: 10000, name: 'Монеты', amount: 2735 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 3 }
      ]
    },
    description: 'Улучшеная тыквенная грядка 5 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/915.webp',
    upgradesTo: 916,
    upgradeCost: 86400,
  },
  {
    id: 916,
    name: 'Улучшеная тыквенная грядка уровень - 6',
    englishName: 'Enhanced Pumpkin Bed Level 6',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 39, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 6 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/916.webp',
    upgradesTo: 917,
    upgradeCost: 137200,
  },
  {
    id: 917,
    name: 'Улучшеная тыквенная грядка уровень - 7',
    englishName: 'Enhanced Pumpkin Bed Level 7',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 42.25, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 7 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/917.webp',
    upgradesTo: 918,
    upgradeCost: 204800,
  },
  {
    id: 918,
    name: 'Улучшеная тыквенная грядка уровень - 8',
    englishName: 'Enhanced Pumpkin Bed Level 8',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 46, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 8 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/918.webp',
    upgradesTo: 919,
    upgradeCost: 291600,
  },
  {
    id: 919,
    name: 'Улучшеная тыквенная грядка уровень - 9',
    englishName: 'Enhanced Pumpkin Bed Level 9',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 50.25, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 9 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/919.webp',
    upgradesTo: 920,
    upgradeCost: 400000,
  },
  {
    id: 920,
    name: 'Улучшеная тыквенная грядка уровень - 10',
    englishName: 'Enhanced Pumpkin Bed Level 10',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 55, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 10 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/920.webp',
    upgradesTo: 921,
    upgradeCost: 532400,
  },
  {
    id: 921,
    name: 'Улучшеная тыквенная грядка уровень - 11',
    englishName: 'Enhanced Pumpkin Bed Level 11',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 60.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10042, name: 'Сердце', amount: 3 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 140 }
      ]
    },
    description: 'Улучшеная тыквенная грядка 11 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/921.webp',
    upgradesTo: 922,
    upgradeCost: 691200,
  },
  {
    id: 922,
    name: 'Улучшеная тыквенная грядка уровень - 12',
    englishName: 'Enhanced Pumpkin Bed Level 12',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 66, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: 'Сердце', amount: 3 },
        { id: 10040, name: 'Стальной лист', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 51 }
      ]
    },
    description: 'Улучшеная тыквенная грядка 12 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/922.webp',
    upgradesTo: 923,
    upgradeCost: 878800,
  },
  {
    id: 923,
    name: 'Улучшеная тыквенная грядка уровень - 13',
    englishName: 'Enhanced Pumpkin Bed Level 13',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 72.25, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 13 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/923.webp',
    upgradesTo: 924,
    upgradeCost: 1097600,
  },
  {
    id: 924,
    name: 'Улучшеная тыквенная грядка уровень - 14',
    englishName: 'Enhanced Pumpkin Bed Level 14',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 79, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 14 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/924.webp',
    upgradesTo: 925,
    upgradeCost: 1350000,
  },
  {
    id: 925,
    name: 'Улучшеная тыквенная грядка уровень - 15',
    englishName: 'Enhanced Pumpkin Bed Level 15',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 86.25, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 15 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/925.webp',
    upgradesTo: 926,
    upgradeCost: 1638400,
  },
  {
    id: 926,
    name: 'Улучшеная тыквенная грядка уровень - 16',
    englishName: 'Enhanced Pumpkin Bed Level 16',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 94, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 16 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/926.webp',
    upgradesTo: 927,
    upgradeCost: 1965200,
  },
  {
    id: 927,
    name: 'Улучшеная тыквенная грядка уровень - 17',
    englishName: 'Enhanced Pumpkin Bed Level 17',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 102.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 20 },
        { id: 10042, name: 'Сердце', amount: 11 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 84 }
      ]
    },
    description: 'Улучшеная тыквенная грядка 17 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/927.webp',
    upgradesTo: 928,
    upgradeCost: 2332800,
  },
  {
    id: 928,
    name: 'Улучшеная тыквенная грядка уровень - 18',
    englishName: 'Enhanced Pumpkin Bed Level 18',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 111, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: 'Сердце', amount: 13 },
        { id: 10040, name: 'Стальной лист', amount: 22 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 14 }
      ]
    },
    description: 'Улучшеная тыквенная грядка 18 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/928.webp',
    upgradesTo: 929,
    upgradeCost: 2743600,
  },
  {
    id: 929,
    name: 'Улучшеная тыквенная грядка уровень - 19',
    englishName: 'Enhanced Pumpkin Bed Level 19',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 120.25, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 19 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/929.webp',
    upgradesTo: 930,
    upgradeCost: 3200000,
  },
  {
    id: 930,
    name: 'Улучшеная тыквенная грядка уровень - 20',
    englishName: 'Enhanced Pumpkin Bed Level 20',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 130, amount: 1 }
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
    description: 'Улучшеная тыквенная грядка 20 уровня.',
    imageUrl: '/buildings/static/pumpkin_bed/930.webp',
    upgradesTo: 931,
    upgradeCost: 3704400,
  },
  {
    id: 931,
    name: 'Улучшеная тыквенная грядка уровень - 21',
    englishName: 'Enhanced Pumpkin Bed Level 21',
    category: 'Грядки',
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
        { id: 10004, name: 'Куски супер тыквы', chance: 140.25, amount: 1 }
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
    description: 'Максимальный уровень улучшеной тыквенной грядки. Невероятная мощь!',
    imageUrl: '/buildings/static/pumpkin_bed/931.webp',
  }
];
