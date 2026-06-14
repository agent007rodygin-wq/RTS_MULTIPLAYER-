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
        { id: 10003, name: 'Куски супер гриба', chance: 30.25, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 30, goldCost: 150, energyCost: 30, timeSeconds: 750, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 3, goldCost: 1500, energyCost: 12, timeSeconds: 5400, damage: 59 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 1, goldCost: 5000, energyCost: 16, timeSeconds: 2600, damage: 176 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 1, goldCost: 15000, energyCost: 20, timeSeconds: 1800, damage: 176 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 1, goldCost: 10000, energyCost: 48, timeSeconds: 3600, damage: 176 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 1, goldCost: 40000, energyCost: 60, timeSeconds: 3, damage: 176 }
    ],
    description: 'Улучшеная грибная грядка. Приносит доход и иногда производит супер гриб.',
    imageUrl: 'https://i.ibb.co/Txdx19f5/874.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 31, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 62, goldCost: 310, energyCost: 62, timeSeconds: 1550, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 5, goldCost: 2500, energyCost: 20, timeSeconds: 9000, damage: 74 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 1, goldCost: 5000, energyCost: 16, timeSeconds: 2600, damage: 368 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 1, goldCost: 15000, energyCost: 20, timeSeconds: 1800, damage: 368 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 1, goldCost: 10000, energyCost: 48, timeSeconds: 3600, damage: 368 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 1, goldCost: 40000, energyCost: 60, timeSeconds: 3, damage: 368 }
    ],
    description: 'Улучшеная грибная грядка 2 уровня.',
    imageUrl: 'https://i.ibb.co/Txdx19f5/874.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 32.25, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 190, goldCost: 950, energyCost: 190, timeSeconds: 4750, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 15, goldCost: 7500, energyCost: 60, timeSeconds: 27000, damage: 76 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 3, goldCost: 15000, energyCost: 48, timeSeconds: 7800, damage: 379 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 2, goldCost: 30000, energyCost: 40, timeSeconds: 3600, damage: 568 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 1, goldCost: 10000, energyCost: 48, timeSeconds: 3600, damage: 1136 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 1, goldCost: 40000, energyCost: 60, timeSeconds: 3, damage: 1136 }
    ],
    description: 'Улучшеная грибная грядка 3 уровня.',
    imageUrl: 'https://i.ibb.co/Txdx19f5/874.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 34, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 303, goldCost: 1515, energyCost: 303, timeSeconds: 7575, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 23, goldCost: 11500, energyCost: 92, timeSeconds: 41400, damage: 79 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 5, goldCost: 25000, energyCost: 80, timeSeconds: 13000, damage: 364 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 4, goldCost: 60000, energyCost: 80, timeSeconds: 7200, damage: 454 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 1, goldCost: 10000, energyCost: 48, timeSeconds: 3600, damage: 1816 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 1, goldCost: 40000, energyCost: 60, timeSeconds: 3, damage: 1816 }
    ],
    description: 'Улучшеная грибная грядка 4 уровня.',
    imageUrl: 'https://i.ibb.co/Txdx19f5/874.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 36.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10003, name: 'Куски супер гриба', amount: 5 },
        { id: 10024, name: 'Супер лилия', amount: 10 },
        { id: 10000, name: 'Монеты', amount: 2735 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 3 }
      ]
    },
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 439, goldCost: 2195, energyCost: 439, timeSeconds: 10975, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 33, goldCost: 16500, energyCost: 132, timeSeconds: 59400, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 7, goldCost: 35000, energyCost: 112, timeSeconds: 18200, damage: 376 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 5, goldCost: 75000, energyCost: 100, timeSeconds: 9000, damage: 527 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 2, goldCost: 20000, energyCost: 96, timeSeconds: 7200, damage: 1316 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 1, goldCost: 40000, energyCost: 60, timeSeconds: 3, damage: 2632 }
    ],
    description: 'Улучшеная грибная грядка 5 уровня.',
    imageUrl: 'https://i.ibb.co/Txdx19f5/874.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 39, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 595, goldCost: 2975, energyCost: 595, timeSeconds: 14875, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 45, goldCost: 22500, energyCost: 180, timeSeconds: 81000, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 9, goldCost: 45000, energyCost: 144, timeSeconds: 23400, damage: 397 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 6, goldCost: 90000, energyCost: 120, timeSeconds: 10800, damage: 595 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 2, goldCost: 20000, energyCost: 96, timeSeconds: 7200, damage: 1784 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 2, goldCost: 80000, energyCost: 120, timeSeconds: 3, damage: 1784 }
    ],
    description: 'Улучшеная грибная грядка 6 уровня.',
    imageUrl: 'https://i.ibb.co/pjpvsgZZ/879.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 42.25, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 774, goldCost: 3870, energyCost: 774, timeSeconds: 19350, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 58, goldCost: 29000, energyCost: 232, timeSeconds: 104400, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 12, goldCost: 60000, energyCost: 192, timeSeconds: 31200, damage: 387 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 8, goldCost: 120000, energyCost: 160, timeSeconds: 14400, damage: 580 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 3, goldCost: 30000, energyCost: 144, timeSeconds: 10800, damage: 1547 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 2, goldCost: 80000, energyCost: 120, timeSeconds: 3, damage: 2320 }
    ],
    description: 'Улучшеная грибная грядка 7 уровня.',
    imageUrl: 'https://i.ibb.co/pjpvsgZZ/879.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 46, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 972, goldCost: 4860, energyCost: 972, timeSeconds: 24300, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 73, goldCost: 36500, energyCost: 292, timeSeconds: 131400, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 15, goldCost: 75000, energyCost: 240, timeSeconds: 39000, damage: 389 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 10, goldCost: 150000, energyCost: 200, timeSeconds: 18000, damage: 584 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 3, goldCost: 30000, energyCost: 144, timeSeconds: 10800, damage: 1944 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 2, goldCost: 80000, energyCost: 120, timeSeconds: 3, damage: 2916 }
    ],
    description: 'Улучшеная грибная грядка 8 уровня.',
    imageUrl: 'https://i.ibb.co/pjpvsgZZ/879.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 50.25, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 1191, goldCost: 5955, energyCost: 1191, timeSeconds: 29775, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 90, goldCost: 45000, energyCost: 360, timeSeconds: 162000, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 18, goldCost: 90000, energyCost: 288, timeSeconds: 46800, damage: 397 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 12, goldCost: 180000, energyCost: 240, timeSeconds: 21600, damage: 596 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 4, goldCost: 40000, energyCost: 192, timeSeconds: 14400, damage: 1786 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 3, goldCost: 120000, energyCost: 180, timeSeconds: 3, damage: 2382 }
    ],
    description: 'Улучшеная грибная грядка 9 уровня.',
    imageUrl: 'https://i.ibb.co/pjpvsgZZ/879.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 55, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 1431, goldCost: 7155, energyCost: 1431, timeSeconds: 35775, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 108, goldCost: 54000, energyCost: 432, timeSeconds: 194400, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 22, goldCost: 110000, energyCost: 352, timeSeconds: 57200, damage: 391 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 15, goldCost: 225000, energyCost: 300, timeSeconds: 27000, damage: 573 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 5, goldCost: 50000, energyCost: 240, timeSeconds: 18000, damage: 1717 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 3, goldCost: 120000, energyCost: 180, timeSeconds: 3, damage: 2862 }
    ],
    description: 'Улучшеная грибная грядка 10 уровня.',
    imageUrl: 'https://i.ibb.co/pjpvsgZZ/879.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 60.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 5 },
        { id: 10042, name: 'Супер детонатор', amount: 3 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 140 }
      ]
    },
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 1692, goldCost: 8460, energyCost: 1692, timeSeconds: 42300, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 127, goldCost: 63500, energyCost: 508, timeSeconds: 228600, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 26, goldCost: 130000, energyCost: 416, timeSeconds: 67600, damage: 391 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 17, goldCost: 255000, energyCost: 340, timeSeconds: 30600, damage: 598 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 6, goldCost: 60000, energyCost: 288, timeSeconds: 21600, damage: 1692 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 4, goldCost: 160000, energyCost: 240, timeSeconds: 3, damage: 2538 }
    ],
    description: 'Улучшеная грибная грядка 11 уровня.',
    imageUrl: 'https://i.ibb.co/LhRRPVtb/884.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 66, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: 'Супер детонатор', amount: 3 },
        { id: 10040, name: 'Стальной лист', amount: 6 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10036, name: 'Изумрудная руда', amount: 51 }
      ]
    },
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 1974, goldCost: 9870, energyCost: 1974, timeSeconds: 49350, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 148, goldCost: 74000, energyCost: 592, timeSeconds: 266400, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 30, goldCost: 150000, energyCost: 480, timeSeconds: 78000, damage: 395 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 20, goldCost: 300000, energyCost: 400, timeSeconds: 36000, damage: 592 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 6, goldCost: 60000, energyCost: 288, timeSeconds: 21600, damage: 1974 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 4, goldCost: 160000, energyCost: 240, timeSeconds: 3, damage: 2960 }
    ],
    description: 'Улучшеная грибная грядка 12 уровня.',
    imageUrl: 'https://i.ibb.co/LhRRPVtb/884.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 72.25, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 2275, goldCost: 11375, energyCost: 2275, timeSeconds: 56875, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 171, goldCost: 85500, energyCost: 684, timeSeconds: 307800, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 35, goldCost: 175000, energyCost: 560, timeSeconds: 91000, damage: 390 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 23, goldCost: 345000, energyCost: 460, timeSeconds: 41400, damage: 594 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 7, goldCost: 70000, energyCost: 336, timeSeconds: 25200, damage: 1950 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 5, goldCost: 200000, energyCost: 300, timeSeconds: 3, damage: 2730 }
    ],
    description: 'Улучшеная грибная грядка 13 уровня.',
    imageUrl: 'https://i.ibb.co/LhRRPVtb/884.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 79, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 2598, goldCost: 12990, energyCost: 2598, timeSeconds: 64950, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 195, goldCost: 97500, energyCost: 780, timeSeconds: 351000, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 39, goldCost: 195000, energyCost: 624, timeSeconds: 101400, damage: 400 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 26, goldCost: 390000, energyCost: 520, timeSeconds: 46800, damage: 600 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 8, goldCost: 80000, energyCost: 384, timeSeconds: 28800, damage: 1948 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 6, goldCost: 240000, energyCost: 360, timeSeconds: 3, damage: 2598 }
    ],
    description: 'Улучшеная грибная грядка 14 уровня.',
    imageUrl: 'https://i.ibb.co/LhRRPVtb/884.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 86.25, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 2940, goldCost: 14700, energyCost: 2940, timeSeconds: 73500, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 221, goldCost: 110500, energyCost: 884, timeSeconds: 397800, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 45, goldCost: 225000, energyCost: 720, timeSeconds: 117000, damage: 392 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 30, goldCost: 450000, energyCost: 600, timeSeconds: 54000, damage: 588 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 9, goldCost: 90000, energyCost: 432, timeSeconds: 32400, damage: 1960 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 6, goldCost: 240000, energyCost: 360, timeSeconds: 3, damage: 2940 }
    ],
    description: 'Улучшеная грибная грядка 15 уровня.',
    imageUrl: 'https://i.ibb.co/LhRRPVtb/884.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 94, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 3303, goldCost: 16515, energyCost: 3303, timeSeconds: 82575, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 248, goldCost: 124000, energyCost: 992, timeSeconds: 446400, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 50, goldCost: 250000, energyCost: 800, timeSeconds: 130000, damage: 397 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 34, goldCost: 510000, energyCost: 680, timeSeconds: 61200, damage: 583 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 10, goldCost: 100000, energyCost: 480, timeSeconds: 36000, damage: 1982 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 7, goldCost: 280000, energyCost: 420, timeSeconds: 3, damage: 2831 }
    ],
    description: 'Улучшеная грибная грядка 16 уровня.',
    imageUrl: 'https://i.ibb.co/Kp7JwHy5/889.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 102.25, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 20 },
        { id: 10042, name: 'Супер детонатор', amount: 11 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10034, name: 'Изумруд', amount: 84 }
      ]
    },
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 3686, goldCost: 18430, energyCost: 3686, timeSeconds: 92150, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 277, goldCost: 138500, energyCost: 1108, timeSeconds: 498600, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 56, goldCost: 280000, energyCost: 896, timeSeconds: 145600, damage: 395 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 37, goldCost: 555000, energyCost: 740, timeSeconds: 66600, damage: 598 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 12, goldCost: 120000, energyCost: 576, timeSeconds: 43200, damage: 1843 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 8, goldCost: 320000, energyCost: 480, timeSeconds: 3, damage: 2764 }
    ],
    description: 'Улучшеная грибная грядка 17 уровня.',
    imageUrl: 'https://i.ibb.co/Kp7JwHy5/889.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 111, amount: 1 }
      ]
    },
    drops: {
      frequent: [
        { id: 10042, name: 'Супер детонатор', amount: 13 },
        { id: 10040, name: 'Стальной лист', amount: 22 },
        { id: 10000, name: 'Монеты', amount: 13538 },
      ],
      rare: [
        { id: 10043, name: 'Суператомная бомба', amount: 14 }
      ]
    },
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 4090, goldCost: 20450, energyCost: 4090, timeSeconds: 102250, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 307, goldCost: 153500, energyCost: 1228, timeSeconds: 552600, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 62, goldCost: 310000, energyCost: 992, timeSeconds: 161200, damage: 396 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 41, goldCost: 615000, energyCost: 820, timeSeconds: 73800, damage: 599 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 13, goldCost: 130000, energyCost: 624, timeSeconds: 46800, damage: 1888 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 9, goldCost: 360000, energyCost: 540, timeSeconds: 3, damage: 2727 }
    ],
    description: 'Улучшеная грибная грядка 18 уровня.',
    imageUrl: 'https://i.ibb.co/Kp7JwHy5/889.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 120.25, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 4514, goldCost: 22570, energyCost: 4514, timeSeconds: 112850, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 339, goldCost: 169500, energyCost: 1356, timeSeconds: 608400, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 68, goldCost: 340000, energyCost: 1088, timeSeconds: 176800, damage: 399 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 46, goldCost: 690000, energyCost: 920, timeSeconds: 82800, damage: 589 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 14, goldCost: 140000, energyCost: 672, timeSeconds: 50400, damage: 1935 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 10, goldCost: 400000, energyCost: 600, timeSeconds: 3, damage: 2708 }
    ],
    description: 'Улучшеная грибная грядка 19 уровня.',
    imageUrl: 'https://i.ibb.co/Kp7JwHy5/889.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 130, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 4958, goldCost: 24790, energyCost: 4958, timeSeconds: 123950, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 372, goldCost: 186000, energyCost: 1488, timeSeconds: 669600, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 75, goldCost: 375000, energyCost: 1200, timeSeconds: 195000, damage: 397 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 50, goldCost: 750000, energyCost: 1000, timeSeconds: 90000, damage: 595 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 15, goldCost: 150000, energyCost: 720, timeSeconds: 54000, damage: 1983 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 10, goldCost: 400000, energyCost: 600, timeSeconds: 3, damage: 2975 }
    ],
    description: 'Улучшеная грибная грядка 20 уровня.',
    imageUrl: 'https://i.ibb.co/Kp7JwHy5/889.png',
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
        { id: 10003, name: 'Куски супер гриба', chance: 140.25, amount: 1 }
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
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 5423, goldCost: 27115, energyCost: 5423, timeSeconds: 135575, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 407, goldCost: 203500, energyCost: 1628, timeSeconds: 732600, damage: 80 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 82, goldCost: 410000, energyCost: 1312, timeSeconds: 213200, damage: 397 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 55, goldCost: 825000, energyCost: 1100, timeSeconds: 99000, damage: 592 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 17, goldCost: 170000, energyCost: 816, timeSeconds: 61200, damage: 1914 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 11, goldCost: 440000, energyCost: 660, timeSeconds: 3, damage: 2958 }
    ],
    description: 'Максимальный уровень улучшеной грибной грядки. Невероятная мощь!',
    imageUrl: 'https://i.ibb.co/BVYMkLwj/894.png',
  },
