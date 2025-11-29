
import { Building, BuildingType } from '../types';

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
    destructionInfo: [
      {
        resourceId: 10013,
        weaponName: 'Петарда',
        amount: 1,
        goldCost: 5,
        energyCost: 1,
        timeSeconds: 10, 
        damage: 10
      }
    ],
    description: 'Центр нужен для управления городом. Чем выше уровень “Городского центра” тем больше зданий игрок может построить.',
    imageUrl: 'https://i.ibb.co/qYMqvQxj/301.png',
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
      populationBonus: 15,
      givesCoins: 181
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
    destructionInfo: [
      {
        resourceId: 10013,
        weaponName: 'Петарда',
        amount: 2,
        goldCost: 10,
        energyCost: 2,
        timeSeconds: 15, 
        damage: 20
      }
    ],
    description: 'Улучшенный центр города, позволяющий строить больше зданий.',
    imageUrl: 'https://i.ibb.co/twSHGWcf/306-1.png',
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
      populationBonus: 25,
      givesCoins: 839
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
    imageUrl: 'https://i.ibb.co/jvFQmJ9R/312.png',
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
      populationBonus: 35,
      givesCoins: 2268
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
    imageUrl: 'https://i.ibb.co/j95QM2j2/331.png',
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
      populationBonus: 45,
      givesCoins: 3260
    },
    drops: {
      frequent: [
        { id: 10011, name: 'Садовая супер бомба', amount: 2 },
        { id: 10003, name: 'Куски супер гриба', amount: 7 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 13 }
      ]
    },
    description: 'Центр города 5 уровня. Вершина развития вашего города.',
    imageUrl: 'https://i.ibb.co/YFzVG8C8/345.png',
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
    destructionInfo: [
      {
        resourceId: 10013,
        weaponName: 'Петарда',
        amount: 1,
        goldCost: 5,
        energyCost: 1,
        timeSeconds: 25, 
        damage: 8
      }
    ],
    description: 'Маленький домик для самых неприхотливых жителей.',
    imageUrl: 'https://i.ibb.co/27666vfZ/1.png',
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
    imageUrl: 'https://i.ibb.co/21zhN4TH/26.png'
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
    imageUrl: 'https://picsum.photos/seed/5/200'
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
    imageUrl: 'https://picsum.photos/seed/7/200'
  },
  {
    id: 1000,
    name: 'Двухэтажный дом',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 50000,
    buildable: true,
    constructionRequirements: {},
    stats: {
        populationBonus: 15,
        constructionTimeSeconds: 300,
        durability: 1200,
        gloryOnExplosion: 100
    },
    drops: {},
    description: 'Больше места для вашей растущей популяции.',
    imageUrl: 'https://picsum.photos/seed/1000/200'
  },
  {
    id: 1001,
    name: 'Дом с гаражом',
    category: 'Жилые',
    type: BuildingType.Residential,
    price: 100000,
    buildable: true,
    constructionRequirements: {},
    stats: {
        populationBonus: 20,
        constructionTimeSeconds: 600,
        durability: 1500,
        gloryOnExplosion: 150
    },
    drops: {},
    description: 'Современный дом с местом для вашего гномомобиля.',
    imageUrl: 'https://picsum.photos/seed/1001/200'
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
    imageUrl: 'https://picsum.photos/seed/1002/200'
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
    imageUrl: 'https://picsum.photos/seed/146/200'
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
    imageUrl: 'https://picsum.photos/seed/205/200'
  },
  {
    id: 70,
    name: 'Грибная грядка',
    englishName: 'Mushroom Bed',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 400,
    buildable: true,
    constructionRequirements: {
      population: 4,
    },
    stats: {
      constructionTimeSeconds: 80, // 1 minute 20 seconds
      accelerationCost: 2,
      durability: 200,
      gloryOnExplosion: 20,
      takesPopulation: 2,
      workTimeSeconds: 80, // 1 minute 20 seconds
      workYieldGold: 5,
      givesCoins: 181
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
    imageUrl: 'https://i.ibb.co/M4LxrBJ/70.png',
  },
  {
    id: 82,
    name: 'Тыквенная грядка',
    englishName: 'Pumpkin Patch',
    category: 'Бизнес',
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
    imageUrl: 'https://i.ibb.co/27436Skv/82.png',
  },
  {
    id: 102,
    name: 'Грядка с бомбами',
    englishName: 'Bomb Patch',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 5000,
    buildable: true,
    constructionRequirements: {
      population: 7,
    },
    stats: {
      constructionTimeSeconds: 140, // 2 minutes 20 seconds
      accelerationCost: 2,
      durability: 656,
      gloryOnExplosion: 250,
      takesPopulation: 4,
      workTimeSeconds: 140, 
      workYieldGold: 5,
      givesCoins: 504,
      consumes: [
          { id: 10009, name: 'Канистра с бензином', amount: 1 }
      ],
      produces: [
          { id: 10010, name: 'Садовая бомба', amount: 1 }
      ],
      sometimesProduces: [
          { id: 10011, name: 'Садовая супер бомба', chance: 5, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10001, name: 'Дерево', amount: 50 },
        { id: 10008, name: 'Бочка с нефтью', amount: 24 }
      ],
      rare: [
        { id: 10004, name: 'Куски супер тыквы', amount: 3 }
      ]
    },
    description: 'Грядка для выращивания бомб.',
    imageUrl: 'https://i.ibb.co/LhBDr9rt/102.png',
  },
  {
    id: 240,
    name: 'Репка',
    englishName: 'Turnip',
    category: 'Бизнес',
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
    imageUrl: 'https://i.ibb.co/nMDzspZx/240.png',
  },
  {
    id: 274,
    name: 'Пшеница',
    englishName: 'Wheat',
    category: 'Бизнес',
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
    imageUrl: 'https://i.ibb.co/yFrky2ns/274.png',
  },
  {
    id: 313,
    name: 'Подсолнух',
    englishName: 'Sunflower',
    category: 'Бизнес',
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
    imageUrl: 'https://i.ibb.co/fYTzbstN/313.png',
  },
  {
    id: 400,
    name: 'Пруд с лилиями',
    englishName: 'Pond with Lilies',
    category: 'Бизнес',
    type: BuildingType.Default,
    price: 50,
    buildable: true,
    constructionRequirements: {
      population: 0, 
    },
    stats: {
      constructionTimeSeconds: 40,
      accelerationCost: 5,
      durability: 72,
      gloryOnExplosion: 3,
      takesPopulation: 1,
      workTimeSeconds: 65, // 1 minute 5 seconds
      workYieldGold: 3,
      sometimesProduces: [
        { id: 10024, name: 'Супер лилия 1', chance: 30, amount: 1 }
      ]
    },
    drops: {
      rare: [{ id: 10002, name: 'Доски', amount: 4 }] 
    },
    description: 'Тихий пруд с лилиями, который приносит небольшой доход.',
    imageUrl: 'https://i.ibb.co/G4HYVTjr/153.png',
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
    imageUrl: 'https://i.ibb.co/JwzR2SVP/159.png',
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
    imageUrl: 'https://i.ibb.co/N2ZsJnRm/160.png'
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
    imageUrl: 'https://i.ibb.co/JwFztDSS/161.png'
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
    imageUrl: 'https://i.ibb.co/pBffYJ3L/162.png'
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
      produces: [{ id: 10024, name: 'Супер лилия 1', amount: 1 }]
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
    imageUrl: 'https://i.ibb.co/mrxRyx53/163.png'
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
    imageUrl: 'https://i.ibb.co/4R1X2pYL/155.png'
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
    imageUrl: 'https://i.ibb.co/PG2rNn0y/156.png'
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
    imageUrl: 'https://i.ibb.co/Rk8mhJXP/157.png'
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
    imageUrl: 'https://i.ibb.co/9LcXnS4/158.png'
  },
  {
    id: 500,
    name: 'Лесопилка',
    englishName: 'Sawmill',
    category: 'Бизнес',
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
          { id: 10008, name: 'Бочка с нефтью', amount: 8 }
      ],
      rare: [
          { id: 10022, name: 'Руда', amount: 2 }
      ]
    },
    description: 'Производит доски из дерева. Иногда можно найти элитную древесину.',
    imageUrl: 'https://i.ibb.co/B5Vw1VCm/55.png',
    upgradesTo: 56,
    upgradeCost: 4800,
  },
  {
    id: 56,
    name: 'Лесопилка 2',
    englishName: 'Sawmill 2',
    category: 'Бизнес',
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
    imageUrl: 'https://i.ibb.co/G4GQ4QST/56.png'
  },
  {
    id: 340,
    name: 'Финансовая разведка 1',
    englishName: 'Financial Intelligence 1',
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
      population: 12,
    },
    stats: {
      constructionTimeSeconds: 240, // 4 minutes
      accelerationCost: 3,
      durability: 1744,
      gloryOnExplosion: 1500,
      givesCoins: 2268,
      takesPopulation: 12
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 2 },
        { id: 10024, name: 'Супер лилия 1', amount: 5 }
      ],
      rare: [
        { id: 10025, name: 'Золотая руда', amount: 5 }
      ]
    },
    description: 'Здесь можно получить информацию о месторождениях. Когда на карте появляется новое месторождение, в чате "Находки" появляется уведомление с координатами.',
    imageUrl: 'https://i.ibb.co/hRn5CbH1/14.png',
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
    constructionRequirements: {
      population: 13,
    },
    stats: {
      constructionTimeSeconds: 6591, // 1h 49m 51s
      accelerationCost: 17,
      durability: 1968,
      gloryOnExplosion: 1750,
      givesCoins: 2268,
      takesPopulation: 13
    },
    drops: {
      frequent: [
        { id: 10017, name: 'Детонатор', amount: 3 },
        { id: 10024, name: 'Супер лилия 1', amount: 6 }
      ],
      rare: [
        { id: 10042, name: 'Супер детонатор', amount: 2 }
      ]
    },
    description: 'Улучшенная финансовая разведка. Обнаруживает месторождения нефти и клады.',
    imageUrl: 'https://i.ibb.co/KxQfrJJ3/20.png',
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
    constructionRequirements: {
      population: 13,
    },
    stats: {
      constructionTimeSeconds: 6591, // 1h 49m 51s (Same as Lvl 2 per prompt)
      accelerationCost: 17,
      durability: 2192,
      gloryOnExplosion: 2000,
      givesCoins: 2268,
      takesPopulation: 13
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
    imageUrl: 'https://i.ibb.co/mV4qSMfQ/29.png',
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
    drops: {},
    description: 'Здание для торговли драгоценностями. Здесь можно купить рубины.',
    imageUrl: 'https://i.ibb.co/1JqxktH7/311.png'
  },
  {
    id: 315,
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
    imageUrl: 'https://i.ibb.co/5Xwd2RjZ/76.png',
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
    imageUrl: 'https://i.ibb.co/nqJx9WNv/310.png',
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
    englishName: 'Atomic Bomb Factory',
    category: 'Заводы',
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
      workTimeSeconds: 60,
      workYieldGold: 20,
      consumes: [
         { id: 10009, name: 'Канистра с бензином', amount: 10 },
         { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
          { id: 10005, name: 'Камни', amount: 6 },
          { id: 10000, name: 'Сундук с сокровищем', amount: 3 }
      ],
      rare: [
          { id: 10005, name: 'Камни', amount: 74 }
      ]
    },
    description: 'Мощный завод для создания разрушительного оружия.',
    imageUrl: 'https://i.ibb.co/b5Lyn5S3/116.png',
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
      accelerationCost: 10,
      durability: 14328,
      gloryOnExplosion: 100000,
      takesPopulation: 11,
      workTimeSeconds: 60,
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
          { id: 10042, name: 'Супер детонатор', amount: 5 },
          { id: 10040, name: 'Стальной лист', amount: 8 }
      ],
      rare: [
          { id: 10043, name: 'Суператомная бомба', amount: 5 }
      ]
    },
    description: 'Производит детонаторы, для бомб',
    imageUrl: 'https://i.ibb.co/DHDNbPrx/135.png',
  },
  {
    id: 602,
    name: 'Дьявольская машина',
    englishName: 'Devil\'s Machine',
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
        { id: 10042, name: 'Супер детонатор', amount: 1 }
      ],
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 25 },
        { id: 10017, name: 'Детонатор', amount: 4 },
        { id: 10024, name: 'Супер лилия 1', amount: 1 }
      ],
    },
    drops: {
      frequent: [
        { id: 10025, name: 'Золотая руда', amount: 100 },
        { id: 10040, name: 'Стальной лист', amount: 40 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 399 }
      ]
    },
    description: 'Производит супердетонаторы, для бомб',
    imageUrl: 'https://i.ibb.co/fGx1mz82/225.png',
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
    imageUrl: 'https://i.ibb.co/BHtZ18r4/15.png',
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
    imageUrl: 'https://i.ibb.co/LXNjWXgD/49.png',
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
        { id: 10024, name: 'Супер лилия 1', amount: 60 },
      ],
      population: 3,
    },
    stats: {
      constructionTimeSeconds: 60,
      accelerationCost: 5,
      durability: 11640,
      gloryOnExplosion: 10000,
      takesPopulation: 10,
      workTimeSeconds: 60,
      workYieldGold: 40,
      produces: [
        { id: 10032, name: 'Рекомендация', amount: 1 }
      ],
      consumes: [
        { id: 10001, name: 'Дерево', amount: 50 },
        { id: 10009, name: 'Канистра с бензином', amount: 50 },
        { id: 10030, name: 'Цветок подсолнуха', amount: 2 }
      ],
      givesCoins: 13538,
    },
    drops: {
      frequent: [
        { id: 10022, name: 'Руда', amount: 69, chance: 45 },
        { id: 10023, name: 'Сталь', amount: 13, chance: 45 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 24, chance: 30 }
      ]
    },
    description: 'Печатает рекомендации из подсолнухов',
    imageUrl: 'https://i.ibb.co/mVdQsB9C/330.png',
  },
  {
    id: 603,
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
        { id: 10003, name: 'Куски супер гриба', amount: 5 }
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
    imageUrl: 'https://i.ibb.co/D2yV8M8/13.png',
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
        { id: 10003, name: 'Куски супер гриба', amount: 5 }
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
    imageUrl: 'https://i.ibb.co/D2yV8M8/13.png',
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
        { id: 10003, name: 'Куски супер гриба', amount: 9 }
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
    imageUrl: 'https://i.ibb.co/D2yV8M8/13.png',
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
        { id: 10003, name: 'Куски супер гриба', amount: 2 }
      ],
      rare: [
        { id: 10026, name: 'Золото', amount: 2 }
      ]
    },
    description: 'Перерабатывает нефть в бензин. Иногда находит ценные ресурсы.',
    imageUrl: 'https://i.ibb.co/QFw2g09Y/16.png',
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
      damage: '1',
      givesCoins: 181
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
    imageUrl: 'https://i.ibb.co/PzhpNmWb/363.png',
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
      damage: '2',
      givesCoins: 839
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
    imageUrl: 'https://i.ibb.co/nNSjQhbB/364.png',
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
      givesCoins: 3788,
      takesPopulation: 16
    },
    drops: {
      frequent: [
        { id: 10012, name: 'MGM-52 «Ланс»', amount: 2 },
        { id: 10003, name: 'Куски супер гриба', amount: 7 }
      ],
      rare: [
        { id: 10025, name: 'Золотая руда', amount: 14 }
      ]
    },
    description: 'Мощное оборонительное сооружение.',
    imageUrl: 'https://i.ibb.co/5gbWdk4N/337.png',
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
        { id: 10003, name: 'Куски супер гриба', amount: 7 }
      ],
      rare: [
        { id: 10040, name: 'Стальной лист', amount: 6 }
      ]
    },
    description: 'Замок нужен для создания клана. Если ваш замок взорвут или вы его продадите, ваш клан перестанет существовать. Чем выше уровень замка тем больше игроков вы сможете набрать в клан.',
    imageUrl: 'https://i.ibb.co/8D1jnPjp/372.png',
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
      givesCoins: 3788,
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
    imageUrl: 'https://i.ibb.co/vx5tdH3h/147.png',
    upgradesTo: 214,
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
        { id: 10042, name: 'Супер детонатор', amount: 2 }
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 2 }
      ]
    },
    description: 'Добывает камень и ценные руды.',
    imageUrl: 'https://i.ibb.co/9HxHLJsp/99.png',
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
    imageUrl: 'https://i.ibb.co/v6qy8C2j/27-1.png',
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
    imageUrl: 'https://i.ibb.co/gZKt5Nvy/41.png',
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
    imageUrl: 'https://i.ibb.co/QvkFL8PS/42.png',
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
      moveIntervalSeconds: 120, // 2 minutes
      gloryOnExplosion: 50
    },
    drops: {
      frequent: [
         { id: 10001, name: 'Дерево', amount: 20 },
         { id: 10008, name: 'Бочка с нефтью', amount: 10 },
         { id: 10009, name: 'Канистра с бензином', amount: 5 }
      ],
      rare: [
         { id: 10041, name: 'Песок', amount: 4 }
      ]
    },
    destructionInfo: [
        {
            resourceId: 10013,
            weaponName: 'Петарда',
            amount: 1,
            goldCost: 5,
            energyCost: 1,
            timeSeconds: 5,
            damage: 1
        },
        {
            resourceId: 10010,
            weaponName: 'Садовая бомба',
            amount: 1,
            goldCost: 10,
            energyCost: 2,
            timeSeconds: 5,
            damage: 3
        },
        {
            resourceId: 10012,
            weaponName: 'MGM-52 «Ланс»',
            amount: 1,
            goldCost: 50,
            energyCost: 5,
            timeSeconds: 5,
            damage: 10
        },
        {
            resourceId: 10016,
            weaponName: 'Атомная бомба «Снежинка»',
            amount: 1,
            goldCost: 100,
            energyCost: 10,
            timeSeconds: 5,
            damage: 50
        },
         {
            resourceId: 10043,
            weaponName: 'Суператомная бомба',
            amount: 1,
            goldCost: 500,
            energyCost: 20,
            timeSeconds: 5,
            damage: 100
        }
    ],
    description: 'Ходит по карте и атакует здания. Ненавидит фермы.',
    imageUrl: 'https://i.ibb.co/05hFW5y/70001.png'
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
    imageUrl: 'https://i.ibb.co/NnxqY7ZV/50005.png'
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
    imageUrl: 'https://i.ibb.co/5W5GqDvD/50004.png'
  },
  {
    id: 316,
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
        { id: 10003, name: 'Куски супер гриба', amount: 3 }
      ],
      rare: [
        { id: 10042, name: 'Супер детонатор', amount: 2 }
      ]
    },
    description: 'Специализированный рынок для торговли военными товарами и редкими ресурсами.',
    imageUrl: 'https://i.ibb.co/prKZpcPd/136.png'
  },
  {
    id: 620,
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
    imageUrl: 'https://i.ibb.co/j9bXS99h/98.png',
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
        { id: 10024, name: 'Супер лилия 1', amount: 1 }
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
    imageUrl: 'https://i.ibb.co/zhk30rLj/262.png',
    upgradesTo: 475,
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
        { id: 10024, name: 'Супер лилия 1', amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 7 },
        { id: 10042, name: 'Супер детонатор', amount: 4 }
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 29 }
      ]
    },
    description: 'Переплавляет самородки в чистое золото.',
    imageUrl: 'https://i.ibb.co/tTyG1jqV/266.png',
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
        { id: 10024, name: 'Супер лилия 1', amount: 11 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: 'Супер детонатор', amount: 10 },
        { id: 10040, name: 'Стальной лист', amount: 16 }
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 158 }
      ]
    },
    description: 'Производит муку из пшеницы и лилий.',
    imageUrl: 'https://i.ibb.co/fVJzyhYS/273.png',
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
        { id: 10003, name: 'Куски супер гриба', amount: 1 }
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
    imageUrl: 'https://i.ibb.co/PsrjM8bK/307.png',
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
    imageUrl: 'https://i.ibb.co/SDRnHLy1/430.png',
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
    imageUrl: 'https://i.ibb.co/spRpjGDS/640.png',
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
    imageUrl: 'https://i.ibb.co/PGkGvX0R/668.png',
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
        { id: 10042, name: 'Супер детонатор', chance: 1.19, amount: 1 }
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
    imageUrl: 'https://i.ibb.co/Hf3mmqvY/689.png',
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
        { id: 10024, name: 'Супер лилия 1', amount: 1 }
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
    imageUrl: 'https://i.ibb.co/Lyts9bS/853.png',
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
      constructionTimeSeconds: 15, // Assuming short time
      damage: '14', // Base damage
      hates: 'Заводы', // Hates Factories
      givesCoins: 659,
      isMonster: true,
      moveIntervalSeconds: 120, // 2 minutes
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
    destructionInfo: [
      {
         resourceId: 10013,
            weaponName: 'Петарда',
            amount: 1,
            goldCost: 5,
            energyCost: 1,
            timeSeconds: 5,
            damage: 1
        },
        {
            resourceId: 10010,
            weaponName: 'Садовая бомба',
            amount: 1,
            goldCost: 10,
            energyCost: 2,
            timeSeconds: 5,
            damage: 3
        },
        {
            resourceId: 10012,
            weaponName: 'MGM-52 «Ланс»',
            amount: 1,
            goldCost: 50,
            energyCost: 5,
            timeSeconds: 5,
            damage: 10
        },
        {
            resourceId: 10016,
            weaponName: 'Атомная бомба «Снежинка»',
            amount: 1,
            goldCost: 100,
            energyCost: 10,
            timeSeconds: 5,
            damage: 50
        },
         {
            resourceId: 10043,
            weaponName: 'Суператомная бомба',
            amount: 1,
            goldCost: 500,
            energyCost: 20,
            timeSeconds: 5,
            damage: 100
       }
    ],   
    description: 'Добрый Санта, который почему-то ненавидит заводы.',
    imageUrl: 'https://i.ibb.co/8n3y7Q5F/70002.png' // Using provided image, though it matches Steel Mill in prompt? Assuming intentional placeholder or user error, using provided.
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
      moveIntervalSeconds: 120,
      gloryOnExplosion: 500
    },
    drops: {
      frequent: [
         { id: 10017, name: 'Детонатор', amount: 2 },
         { id: 10003, name: 'Куски супер гриба', amount: 2 },
         { id: 10024, name: 'Супер лилия 1', amount: 4 }
      ],
      rare: [
         { id: 10044, name: 'Самородок', amount: 3 }
      ]
    },
    description: 'Легендарный Змея Горыныч. Ненавидит жилые постройки.',
    imageUrl: 'https://i.ibb.co/1JpVg6mk/70003.png'
  },
];
