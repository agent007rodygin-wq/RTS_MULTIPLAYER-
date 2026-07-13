const fs = require('fs');

const resourcesMap = {
  'дерево': 10001,
  'доски': 10002,
  'куски супер гриба': 10003,
  'супер гриб': 10003,
  'камни': 10005,
  'каменные блоки': 10006,
  'яйцо избушки': 10007,
  'нефть': 10008,
  'бензин': 10009,
  'садовая бомба': 10010,
  'садовая супер бомба': 10011,
  'петарда': 10013,
  'детонатор': 10017,
  'яйцо горыныча': 10018,
  'руда': 10022,
  'железная руда': 10022,
  'сталь': 10023,
  'золото': 10026,
  'супер подсолнух': 10030,
  'черепки': 10033,
  'изумруды': 10034,
  'элитная древесина': 10035,
  'изумрудная руда': 10036,
  'стальной лист': 10040,
  'песок': 10041,
  'супер детонатор': 10042,
  'суператомная бомба': 10043,
  'самородок': 10044,
  'супер тыква': 10004
};

function parseDrops(dropStr) {
  if (!dropStr) return undefined;
  const items = dropStr.split(',').map(s => s.trim()).filter(s => s);
  const result = [];
  for (const item of items) {
    const parts = item.split('-');
    if (parts.length >= 2) {
      const name = parts[0].trim().toLowerCase();
      const amount = parseInt(parts[1].trim(), 10);
      if (name !== 'монеты') { // coins handled in stats
        const id = resourcesMap[name];
        if (id) {
          result.push({ id, name: parts[0].trim().charAt(0).toUpperCase() + parts[0].trim().slice(1), amount });
        }
      }
    }
  }
  return result.length > 0 ? result : undefined;
}

const reqsStr = (str) => {
  if (!str) return [];
  const items = str.split(',').map(s => s.trim()).filter(s => s);
  const res = [];
  for (const item of items) {
    const parts = item.split('-');
    if (parts.length >= 2) {
      const name = parts[0].trim().toLowerCase();
      const amount = parseInt(parts[1].trim(), 10);
      const id = resourcesMap[name];
      if (id) {
        res.push({ id, name: parts[0].trim().charAt(0).toUpperCase() + parts[0].trim().slice(1), amount });
      }
    }
  }
  return res;
};

const newBuildingsData = [
  {
    id: 53,
    name: 'Лягушачья нора 3',
    englishName: 'Frog\'s burrow 3',
    category: 'Жилые дома',
    price: 210,
    buildable: false,
    constructionRequirements: { population: 4, resources: reqsStr("дерево - 1") },
    stats: { populationBonus: 4, constructionTimeSeconds: 192, accelerationCost: 3, durability: 160, gloryOnExplosion: 11, givesCoins: 140 },
    drops: { frequent: parseDrops("дерево - 3, нефть - 2"), rare: parseDrops("садовая бомба - 3") },
    imageUrl: 'https://i.ibb.co/j9XcWpz6/53.png',
    upgradesTo: 54
  },
  {
    id: 54,
    name: 'Лягушачья нора 4',
    englishName: 'Frog\'s burrow 4',
    category: 'Жилые дома',
    price: 380,
    buildable: false,
    constructionRequirements: { population: 5, resources: reqsStr("дерево - 1") },
    stats: { populationBonus: 5, constructionTimeSeconds: 375, accelerationCost: 4, durability: 224, gloryOnExplosion: 19, givesCoins: 181 },
    drops: { frequent: parseDrops("дерево - 6, нефть - 3"), rare: parseDrops("песок - 2") },
    imageUrl: 'https://i.ibb.co/0p7GSZPw/54.png',
    upgradesTo: 5
  },
  {
    id: 6,
    name: 'Деревянный дом 2',
    englishName: 'Wooden house 6',
    category: 'Жилые дома',
    price: 4000,
    buildable: false,
    constructionRequirements: { population: 8, resources: reqsStr("дерево - 11, доски - 4") },
    stats: { populationBonus: 7, constructionTimeSeconds: 1536, accelerationCost: 8, durability: 768, gloryOnExplosion: 200 },
    drops: { frequent: parseDrops("дерево - 68, черепки - 1, бензин - 18"), rare: parseDrops("супер тыква - 4") },
    imageUrl: 'https://i.ibb.co/1t42pXk6/6.png',
    upgradesTo: 51
  },
  {
    id: 51,
    name: 'Деревянный дом 3',
    englishName: 'Wooden house 7',
    category: 'Жилые дома',
    price: 7000,
    buildable: false,
    constructionRequirements: { population: 9, resources: reqsStr("дерево - 18, доски - 7") },
    stats: { populationBonus: 8, constructionTimeSeconds: 2187, accelerationCost: 10, durability: 1048, gloryOnExplosion: 350 },
    drops: { frequent: parseDrops("каменные блоки - 5, черепки - 2, садовая бомба - 6"), rare: parseDrops("самородок - 2") },
    imageUrl: 'https://i.ibb.co/d0WvMSr2/51.png',
    upgradesTo: 217
  },
  {
    id: 52,
    name: 'Деревянный дом 4',
    englishName: 'Wooden house 1',
    category: 'Архивные (Жилые дома)',
    price: 12000,
    buildable: false,
    constructionRequirements: { population: 10, resources: reqsStr("дерево - 32, доски - 12") },
    stats: { populationBonus: 9, constructionTimeSeconds: 3000, accelerationCost: 12, durability: 1104, gloryOnExplosion: 600 },
    drops: { frequent: parseDrops("камни - 15, каменные блоки - 6, черепки - 3"), rare: parseDrops("яйцо Горыныча - 2") },
    imageUrl: 'https://i.ibb.co/HDWB1tBN/52.png',
    upgradesTo: 217
  },
  {
    id: 217,
    name: 'Деревянный дом 5',
    englishName: 'Wooden house 8',
    category: 'Жилые дома',
    price: 17000,
    buildable: false,
    constructionRequirements: { population: 12, resources: reqsStr("дерево - 45, доски - 17") },
    stats: { populationBonus: 10, constructionTimeSeconds: 5184, accelerationCost: 15, durability: 1680, gloryOnExplosion: 850 },
    drops: { frequent: parseDrops("черепки - 4, детонатор - 2, яйцо избушки - 3"), rare: parseDrops("стальной лист - 2") },
    imageUrl: 'https://i.ibb.co/W4Vr3rmW/217.png',
    upgradesTo: 7
  },
  {
    id: 218,
    name: 'Деревянный дом 6',
    englishName: 'Wooden house 1',
    category: 'Архивные (Жилые дома)',
    price: 25000,
    buildable: false,
    constructionRequirements: { population: 11, resources: reqsStr("дерево - 66, доски - 25, камни - 7") },
    stats: { populationBonus: 11, constructionTimeSeconds: 3993, accelerationCost: 13, durability: 1592, gloryOnExplosion: 1250 },
    drops: { frequent: parseDrops("черепки - 5, детонатор - 2, яйцо избушки - 2"), rare: parseDrops("стальной лист - 2") },
    imageUrl: 'https://i.ibb.co/xqHnPyyW/218.png',
    upgradesTo: 7
  },
  {
    id: 101,
    name: 'Маленький замок 2',
    englishName: 'Little castle 1',
    category: 'Архивные (Жилые дома)',
    price: 700000,
    buildable: false,
    constructionRequirements: { population: 25, resources: reqsStr("элитная древесина - 7, сталь - 2, супер гриб - 10") },
    stats: { populationBonus: 19, constructionTimeSeconds: 46875, accelerationCost: 46, durability: 8424, gloryOnExplosion: 35000 },
    drops: { frequent: parseDrops("самородок - 7, черепки - 13, стальной лист - 3"), rare: parseDrops("изумрудная руда - 26") },
    imageUrl: 'https://i.ibb.co/x8Xz8pm5/101.png',
    upgradesTo: 114
  },
  {
    id: 114,
    name: 'Маленький замок 3',
    englishName: 'Little castle 1',
    category: 'Архивные (Жилые дома)',
    price: 900000,
    buildable: false,
    constructionRequirements: { population: 27, resources: reqsStr("элитная древесина - 9, сталь - 2, супер гриб - 13") },
    stats: { populationBonus: 20, constructionTimeSeconds: 59049, accelerationCost: 51, durability: 9552, gloryOnExplosion: 45000 },
    drops: { frequent: parseDrops("черепки - 14, железная руда - 47, сталь - 9"), rare: parseDrops("изумруды - 16") },
    imageUrl: 'https://i.ibb.co/vr07g0p/114.png',
    upgradesTo: 115
  },
  {
    id: 115,
    name: 'Маленький замок 4',
    englishName: 'Little castle 1',
    category: 'Архивные (Жилые дома)',
    price: 1000000,
    buildable: false,
    constructionRequirements: { population: 28, resources: reqsStr("элитная древесина - 10, сталь - 2, супер гриб - 15") },
    stats: { populationBonus: 21, constructionTimeSeconds: 65856, accelerationCost: 54, durability: 10072, gloryOnExplosion: 50000 },
    drops: { frequent: parseDrops("золото - 4, черепки - 15, сталь - 10"), rare: parseDrops("суператомная бомба - 3") },
    imageUrl: 'https://i.ibb.co/nNh3gbN5/115.png',
    upgradesTo: 146
  },
  {
    id: 148,
    name: 'Вилла 2',
    englishName: 'Villa 15',
    category: 'Жилые дома',
    price: 1400000,
    buildable: false,
    constructionRequirements: { population: 37, resources: reqsStr("элитная древесина - 14, сталь - 3, супер гриб - 21") },
    stats: { populationBonus: 22, constructionTimeSeconds: 152679, accelerationCost: 82, durability: 17960, gloryOnExplosion: 70000 },
    drops: { frequent: parseDrops("самородок - 30, черепки - 16, стальной лист - 12"), rare: parseDrops("самородок - 438") },
    imageUrl: 'https://i.ibb.co/C52g21XG/148.png',
    upgradesTo: 150
  },
  {
    id: 149,
    name: 'Вилла 3',
    englishName: 'Villa 1',
    category: 'Архивные (Жилые дома)',
    price: 2100000,
    buildable: false,
    constructionRequirements: { population: 33, resources: reqsStr("золото - 2, сталь - 5, супер подсолнух - 1") },
    stats: { populationBonus: 24, constructionTimeSeconds: 107811, accelerationCost: 69, durability: 14592, gloryOnExplosion: 105000 },
    drops: { frequent: parseDrops("самородок - 20, черепки - 18, изумрудная руда - 6"), rare: parseDrops("изумрудная руда - 77") },
    imageUrl: 'https://i.ibb.co/Kp1sDdnD/149.png',
    upgradesTo: 150
  },
  {
    id: 150,
    name: 'Вилла 4',
    englishName: 'Villa 16',
    category: 'Жилые дома',
    price: 2500000,
    buildable: false,
    constructionRequirements: { population: 43, resources: reqsStr("золото - 2, сталь - 5, супер подсолнух - 1") },
    stats: { populationBonus: 25, constructionTimeSeconds: 238521, accelerationCost: 103, durability: 24472, gloryOnExplosion: 125000 },
    drops: { frequent: parseDrops("черепки - 19, железная руда - 305, сталь - 57"), rare: parseDrops("изумруды - 103") },
    imageUrl: 'https://i.ibb.co/R4vQNZpM/150.png',
    upgradesTo: 205
  },
  {
    id: 151,
    name: 'Вилла 5',
    englishName: 'Villa 1',
    category: 'Архивные (Жилые дома)',
    price: 2900000,
    buildable: false,
    constructionRequirements: { population: 36, resources: reqsStr("золото - 3, сталь - 6, супер подсолнух - 2") },
    stats: { populationBonus: 26, constructionTimeSeconds: 139968, accelerationCost: 79, durability: 17144, gloryOnExplosion: 145000 },
    drops: { frequent: parseDrops("золото - 12, черепки - 20, сталь - 28"), rare: parseDrops("суператомная бомба - 7") },
    imageUrl: 'https://i.ibb.co/twQ9D0p6/151.png',
    upgradesTo: 205
  },
  {
    id: 206,
    name: 'Дворец 2',
    englishName: 'Palace 1',
    category: 'Архивные (Жилые дома)',
    price: 5400000,
    buildable: false,
    constructionRequirements: { population: 42, resources: reqsStr("золото - 5, сталь - 12, супер подсолнух - 3") },
    stats: { populationBonus: 28, constructionTimeSeconds: 222264, accelerationCost: 99, durability: 23400, gloryOnExplosion: 270000 },
    drops: { frequent: parseDrops("золото - 22, черепки - 22, супер детонатор - 12"), rare: parseDrops("изумруды - 94") },
    imageUrl: 'https://i.ibb.co/Jjzg5Kpc/206.png',
    upgradesTo: 207
  },
  {
    id: 207,
    name: 'Дворец 3',
    englishName: 'Palace 1',
    category: 'Архивные (Жилые дома)',
    price: 5800000,
    buildable: false,
    constructionRequirements: { population: 43, resources: reqsStr("золото - 5, сталь - 13, супер подсолнух - 3") },
    stats: { populationBonus: 29, constructionTimeSeconds: 238521, accelerationCost: 103, durability: 24248, gloryOnExplosion: 290000 },
    drops: { frequent: parseDrops("черепки - 23, супер детонатор - 13, стальной лист - 22"), rare: parseDrops("суператомная бомба - 14") },
    imageUrl: 'https://i.ibb.co/YTfx6JCV/207.png',
    upgradesTo: 208
  },
  {
    id: 208,
    name: 'Дворец 4',
    englishName: 'Palace 18',
    category: 'Жилые дома',
    price: 6200000,
    buildable: false,
    constructionRequirements: { population: 55, resources: reqsStr("золото - 6, сталь - 14, супер подсолнух - 3") },
    stats: { populationBonus: 30, constructionTimeSeconds: 499125, accelerationCost: 149, durability: 40000, gloryOnExplosion: 310000 },
    drops: { frequent: parseDrops("самородок - 145, черепки - 24, изумрудная руда - 39"), rare: parseDrops("самородок - 2170") },
    imageUrl: 'https://i.ibb.co/8gkj6fKs/208.png',
    upgradesTo: 209
  },
  {
    id: 209,
    name: 'Дворец 5',
    englishName: 'Palace 19',
    category: 'Жилые дома',
    price: 6600000,
    buildable: false,
    constructionRequirements: { population: 56, resources: reqsStr("золото - 6, сталь - 14, супер подсолнух - 4") },
    stats: { populationBonus: 31, constructionTimeSeconds: 526848, accelerationCost: 153, durability: 42000, gloryOnExplosion: 330000 },
    drops: { frequent: parseDrops("черепки - 25, изумруды - 21, изумрудная руда - 43"), rare: parseDrops("изумрудная руда - 638") },
    imageUrl: 'https://i.ibb.co/jK14X9D/209.png',
    upgradesTo: 210
  },
  {
    id: 210,
    name: 'Дворец 6',
    englishName: 'Palace 20',
    category: 'Жилые дома',
    price: 7000000,
    buildable: false,
    constructionRequirements: { population: 57, resources: reqsStr("золото - 6, сталь - 15, супер подсолнух - 4") },
    stats: { populationBonus: 32, constructionTimeSeconds: 555579, accelerationCost: 157, durability: 43992, gloryOnExplosion: 350000 },
    drops: { frequent: parseDrops("золото - 77, черепки - 26, сталь - 184"), rare: parseDrops("изумруды - 332") },
    imageUrl: 'https://i.ibb.co/0w7vJB9/210.png',
    upgradesTo: 211
  },
  {
    id: 211,
    name: 'Дворец 7',
    englishName: 'Palace 21',
    category: 'Жилые дома',
    price: 7400000,
    buildable: false,
    constructionRequirements: { population: 59, resources: reqsStr("золото - 7, сталь - 16, супер подсолнух - 4") },
    stats: { populationBonus: 33, constructionTimeSeconds: 616137, accelerationCost: 165, durability: 45976, gloryOnExplosion: 370000 },
    drops: { frequent: parseDrops("золото - 84, черепки - 27, супер детонатор - 44"), rare: parseDrops("суператомная бомба - 49") },
    imageUrl: 'https://i.ibb.co/cXxX82cx/211.png',
    upgradesTo: 212
  },
  {
    id: 212,
    name: 'Дворец 8',
    englishName: 'Palace 22',
    category: 'Жилые дома',
    price: 7800000,
    buildable: false,
    constructionRequirements: { population: 60, resources: reqsStr("золото - 7, сталь - 17, супер подсолнух - 4") },
    stats: { populationBonus: 34, constructionTimeSeconds: 648000, accelerationCost: 170, durability: 47960, gloryOnExplosion: 390000 },
    drops: { frequent: parseDrops("черепки - 28, супер детонатор - 48, стальной лист - 84"), rare: parseDrops("самородок - 3120") },
    imageUrl: 'https://i.ibb.co/15TMKrb/212.png',
    upgradesTo: 213
  },
  {
    id: 213,
    name: 'Дворец 9',
    englishName: 'Palace 23',
    category: 'Жилые дома',
    price: 8000000,
    buildable: false,
    constructionRequirements: { population: 61, resources: reqsStr("золото - 7, сталь - 17, супер подсолнух - 4") },
    stats: { populationBonus: 35, constructionTimeSeconds: 680943, accelerationCost: 174, durability: 49328, gloryOnExplosion: 400000 },
    drops: { frequent: parseDrops("самородок - 220, черепки - 29, стальной лист - 88"), rare: parseDrops("изумрудная руда - 880") },
    imageUrl: 'https://i.ibb.co/15TMKrb/212.png'
  }
];

// Reformat category appropriately (many are 'Жилые' instead of 'Жилые дома' based on what I saw earlier, wait: "category: 'Жилые'")
for (let b of newBuildingsData) {
  b.category = 'Жилые';
  b.type = 'Residential'; // BuildingType.Residential is probably used, as a string or enum. In existing file `type: BuildingType.Residential`
  b.description = b.name;
}

const outFile = 'data/buildings.ts';
let code = fs.readFileSync(outFile, 'utf-8');

// Build string for these buildings
const objs = newBuildingsData.map(b => {
  let str = JSON.stringify(b, null, 2);
  // Replace "type": "Residential" with type: BuildingType.Residential
  str = str.replace(/"type":\s*"Residential"/, 'type: BuildingType.Residential');
  return str;
});

const joined = ',\n  ' + objs.join(',\n  ');

// Insert carefully before the very last ];
const lastBracketIndex = code.lastIndexOf('];');
if (lastBracketIndex !== -1) {
  code = code.substring(0, lastBracketIndex) + joined + '\n];' + code.substring(lastBracketIndex + 2);
  fs.writeFileSync(outFile, code, 'utf-8');
  console.log("Successfully appended " + newBuildingsData.length + " buildings.");
} else {
  console.error("Could not find ending ];");
}
