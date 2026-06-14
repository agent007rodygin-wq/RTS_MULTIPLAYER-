// Generate nuclear bomb buildings with correct IDs and data from the spec files
const fs = require('fs');

// Image URLs from data files
const bombImages = [
  'https://i.ibb.co/qY5F4VW0/116.png',   // bomb 1 -> for ID 600 (base)
  'https://i.ibb.co/b5CPYhC7/117.png',   // bomb 2 -> 617
  'https://i.ibb.co/GvJ6mgq2/118.png',   // bomb 3 -> 618
  'https://i.ibb.co/Kz9JNHWY/119.png',   // bomb 4 -> 619
  'https://i.ibb.co/wZsq8brb/120.png',   // bomb 5 -> 620
  'https://i.ibb.co/DHtKZYZt/121.png',   // bomb 6 -> 621
  'https://i.ibb.co/60tVN7Jc/122.png',   // bomb 7 -> 622
  'https://i.ibb.co/qY9bRZtQ/123.png',   // bomb 8 -> 623
  'https://i.ibb.co/5XYNkz8Y/124.png',   // bomb 9 -> 624
  'https://i.ibb.co/ymr6d8MT/125.png',   // bomb 10 -> 625
  'https://i.ibb.co/4gVtVjSp/126.png',   // bomb 11 -> 626
];
const superImages = [
  'https://i.ibb.co/2RyCkcN/127.png',   // super 1 -> 627
  'https://i.ibb.co/Q3t009cH/128.png',   // super 2 -> 628
  'https://i.ibb.co/N2CFjDkM/129.png',   // super 3 -> 629
  'https://i.ibb.co/n8cBNqHh/130.png',   // super 4 -> 630
  'https://i.ibb.co/ZRQ8WzfV/131.png',   // super 5 -> 631
  'https://i.ibb.co/gQ47fvY/132.png',    // super 6 -> 632
  'https://i.ibb.co/svSKT4R0/133.png',   // super 7 -> 633
  'https://i.ibb.co/nNQrmHQs/134.png',   // closed project -> 634
];

// Data from all11.txt - Bombs 1-11
// All bombs 1-10 share: price 600000, takesPopulation 15, workTime 800s (13m20s), coins 20, durability 7376, glory 30000
// Bomb 11: takesPopulation 17, workTime 8s, durability 9656, produces atomic bomb, different drops
// Consumes: бензин 10, супер тыква 1

const bombDrops = [
  // Bomb 1 (ID 617): часто: золото 3, сталь 6, монеты 10631; редко: самородок 74
  { freq: [{id:10026,name:'Золото',amount:3},{id:10023,name:'Сталь',amount:6}], rare: [{id:10044,name:'Самородок',amount:74}], coins: 10631 },
  // Bomb 2 (ID 618): часто: золото 3, супер детонатор 2, монеты 10631; редко: изумрудная руда 20
  { freq: [{id:10026,name:'Золото',amount:3},{id:10045,name:'Супер детонатор',amount:2}], rare: [{id:10036,name:'Изумрудная руда',amount:20}], coins: 10631 },
  // Bomb 3 (ID 619): часто: супер детонатор 2, стальной лист 2, монеты 10631; редко: изумруды 10
  { freq: [{id:10045,name:'Супер детонатор',amount:2},{id:10040,name:'Стальной лист',amount:2}], rare: [{id:10034,name:'Изумруд',amount:10}], coins: 10631 },
  // Bomb 4 (ID 620): часто: самородок 5, стальной лист 2, монеты 10631; редко: суператомная бомба 2
  { freq: [{id:10044,name:'Самородок',amount:5},{id:10040,name:'Стальной лист',amount:2}], rare: [{id:10043,name:'Суператомная бомба',amount:2}], coins: 10631 },
  // Bomb 5 (ID 621): часто: железная руда 28, супер подсолнух 2, монеты 10631; редко: самородок 74
  { freq: [{id:10022,name:'Железная руда',amount:28},{id:10019,name:'Супер подсолнух',amount:2}], rare: [{id:10044,name:'Самородок',amount:74}], coins: 10631 },
  // Bomb 6 (ID 622): часто: железная руда 28, сталь 6, монеты 10631; редко: изумрудная руда 20
  { freq: [{id:10022,name:'Железная руда',amount:28},{id:10023,name:'Сталь',amount:6}], rare: [{id:10036,name:'Изумрудная руда',amount:20}], coins: 10631 },
  // Bomb 7 (ID 623): часто: золото 3, сталь 6, монеты 10631; редко: изумруды 10
  { freq: [{id:10026,name:'Золото',amount:3},{id:10023,name:'Сталь',amount:6}], rare: [{id:10034,name:'Изумруд',amount:10}], coins: 10631 },
  // Bomb 8 (ID 624): часто: золото 3, супер детонатор 2, монеты 10631; редко: суператомная бомба 2
  { freq: [{id:10026,name:'Золото',amount:3},{id:10045,name:'Супер детонатор',amount:2}], rare: [{id:10043,name:'Суператомная бомба',amount:2}], coins: 10631 },
  // Bomb 9 (ID 625): часто: супер детонатор 2, стальной лист 2, монеты 10631; редко: самородок 74
  { freq: [{id:10045,name:'Супер детонатор',amount:2},{id:10040,name:'Стальной лист',amount:2}], rare: [{id:10044,name:'Самородок',amount:74}], coins: 10631 },
  // Bomb 10 (ID 626): часто: самородок 5, стальной лист 2, монеты 10631; редко: изумрудная руда 20
  { freq: [{id:10044,name:'Самородок',amount:5},{id:10040,name:'Стальной лист',amount:2}], rare: [{id:10036,name:'Изумрудная руда',amount:20}], coins: 10631 },
];

// Bomb 11 (ID 627) - special
const bomb11Drops = {
  freq: [{id:10022,name:'Железная руда',amount:48},{id:10023,name:'Сталь',amount:9}],
  rare: [{id:10034,name:'Изумруд',amount:16}],
  coins: 13538
};

// Super bombs 1-6 share: takesPopulation 15, workTime 900s (15min), durability 7376, glory 30000
// Super bomb 7: takesPopulation 35, workTime 4s, durability 38800, produces super atomic bomb
const superDrops = [
  // Super 1 (ID 627): часто: железная руда 28, сталь 6, монеты 10631; редко: суператомная бомба 2
  { freq: [{id:10022,name:'Железная руда',amount:28},{id:10023,name:'Сталь',amount:6}], rare: [{id:10043,name:'Суператомная бомба',amount:2}], coins: 10631 },
  // Super 2 (ID 628): часто: золото 3, сталь 6, монеты 10631; редко: самородок 74
  { freq: [{id:10026,name:'Золото',amount:3},{id:10023,name:'Сталь',amount:6}], rare: [{id:10044,name:'Самородок',amount:74}], coins: 10631 },
  // Super 3 (ID 629): часто: золото 3, супер детонатор 2, монеты 10631; редко: изумрудная руда 20
  { freq: [{id:10026,name:'Золото',amount:3},{id:10045,name:'Супер детонатор',amount:2}], rare: [{id:10036,name:'Изумрудная руда',amount:20}], coins: 10631 },
  // Super 4 (ID 630): часто: супер детонатор 2, стальной лист 2, монеты 10631; редко: изумруды 10
  { freq: [{id:10045,name:'Супер детонатор',amount:2},{id:10040,name:'Стальной лист',amount:2}], rare: [{id:10034,name:'Изумруд',amount:10}], coins: 10631 },
  // Super 5 (ID 631): часто: самородок 5, стальной лист 2, монеты 10631; редко: суператомная бомба 2
  { freq: [{id:10044,name:'Самородок',amount:5},{id:10040,name:'Стальной лист',amount:2}], rare: [{id:10043,name:'Суператомная бомба',amount:2}], coins: 10631 },
  // Super 6 (ID 632): часто: железная руда 28, супер подсолнух 2, монеты 10631; редко: самородок 74
  { freq: [{id:10022,name:'Железная руда',amount:28},{id:10019,name:'Супер подсолнух',amount:2}], rare: [{id:10044,name:'Самородок',amount:74}], coins: 10631 },
];

// Super 7 (ID 633) - special
const super7Drops = {
  freq: [{id:10026,name:'Золото',amount:60},{id:10045,name:'Супер детонатор',amount:32}],
  rare: [{id:10036,name:'Изумрудная руда',amount:545}],
  coins: 20997
};

// Closed project (ID 634)
const closedDrops = {
  freq: [{id:10026,name:'Золото',amount:3},{id:10023,name:'Сталь',amount:6}],
  rare: [{id:10034,name:'Изумруд',amount:11}],
  coins: 10631
};

function dropStr(d) {
  return `{ id: ${d.id}, name: '${d.name}', amount: ${d.amount} }`;
}

function genDestruction(durability) {
  // Scale destruction info based on durability 
  const petards = Math.ceil(durability / 6);
  const petardTime = Math.round(petards * 25);
  const gardens = Math.ceil(durability / 73);
  const gardenTime = gardens * 1800;
  const lances = Math.ceil(durability / 328);
  const lanceTime = Math.round(lances * 2600);
  const supers = Math.ceil(durability / 328);
  const superTime = supers * 1800;
  const atoms = Math.ceil(durability / 656);
  const atomTime = atoms * 3600;
  const superAtoms = Math.ceil(durability / 656);
  const superAtomTime = superAtoms * 3600;
  
  return `[
      { resourceId: 10013, weaponName: 'Петарда', amount: ${petards}, goldCost: ${petards*5}, energyCost: ${petards}, timeSeconds: ${petardTime}, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: ${gardens}, goldCost: ${gardens*500}, energyCost: ${gardens*4}, timeSeconds: ${gardenTime}, damage: 73 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: ${lances}, goldCost: ${lances*5000}, energyCost: ${lances*16}, timeSeconds: ${lanceTime}, damage: 328 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: ${supers}, goldCost: ${supers*15000}, energyCost: ${supers*20}, timeSeconds: ${superTime}, damage: 328 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: ${atoms}, goldCost: ${atoms*10000}, energyCost: ${atoms*48}, timeSeconds: ${atomTime}, damage: 656 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: ${superAtoms}, goldCost: ${superAtoms*40000}, energyCost: ${superAtoms*60}, timeSeconds: ${superAtomTime}, damage: 656 }
    ]`;
}

// Use real destruction data from the spec files
function genDestructionFromSpec(petards, gardens, lances, supers, atoms, superAtoms) {
  return `[
      { resourceId: 10013, weaponName: 'Петарда', amount: ${petards}, goldCost: ${petards*5}, energyCost: ${petards}, timeSeconds: ${Math.round(petards*25)}, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: ${gardens}, goldCost: ${gardens*500}, energyCost: ${gardens*4}, timeSeconds: ${gardens*1800}, damage: 73 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: ${lances}, goldCost: ${lances*5000}, energyCost: ${lances*16}, timeSeconds: ${Math.round(lances*2600/3)*3}, damage: 328 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: ${supers}, goldCost: ${supers*15000}, energyCost: ${supers*20}, timeSeconds: ${supers*1800}, damage: 328 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: ${atoms}, goldCost: ${atoms*10000}, energyCost: ${atoms*48}, timeSeconds: ${atoms*3600}, damage: 656 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: ${superAtoms}, goldCost: ${superAtoms*40000}, energyCost: ${superAtoms*60}, timeSeconds: ${superAtoms*3600}, damage: 656 }
    ]`;
}

let buildings = [];

// Bombs 1-10 (IDs 617-626)
for (let i = 0; i < 10; i++) {
  const id = 617 + i;
  const level = i + 1;
  const nextId = id + 1; // 618-627
  const d = bombDrops[i];
  const img = bombImages[i + 1]; // shifted: bomb 1 uses image index 1 (117.png)
  
  buildings.push(`  {
    id: ${id},
    name: 'Атомная бомба ${level}',
    englishName: 'Nuclear bomb ${level}',
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
      givesCoins: ${d.coins}
    },
    drops: {
      frequent: [
        ${d.freq.map(dropStr).join(',\n        ')}
      ],
      rare: [${d.rare.map(dropStr).join(', ')}]
    },
    destructionInfo: ${genDestructionFromSpec(1230, 93, 19, 13, 4, 3)},
    description: 'Грядка для выращивания атомных бомб. Уровень ${level}.',
    imageUrl: '${img}',
  }`);
}

// Bomb 11 (ID 627) - special stats
buildings.push(`  {
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
      givesCoins: ${bomb11Drops.coins}
    },
    drops: {
      frequent: [
        ${bomb11Drops.freq.map(dropStr).join(',\n        ')}
      ],
      rare: [${bomb11Drops.rare.map(dropStr).join(', ')}]
    },
    destructionInfo: ${genDestructionFromSpec(1610, 121, 25, 17, 5, 4)},
    description: 'Грядка для выращивания атомных бомб. Максимальный уровень. 45% шанс на супер атомную бомбу.',
    imageUrl: '${bombImages[10]}',
  }`);

// Super bombs 1-6 (IDs 628-633)
for (let i = 0; i < 6; i++) {
  const id = 628 + i;
  const level = i + 1;
  const d = superDrops[i];
  const img = superImages[i];
  
  buildings.push(`  {
    id: ${id},
    name: 'Супер атомная бомба ${level}',
    englishName: 'Super nuclear bomb ${level}',
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
      givesCoins: ${d.coins}
    },
    drops: {
      frequent: [
        ${d.freq.map(dropStr).join(',\n        ')}
      ],
      rare: [${d.rare.map(dropStr).join(', ')}]
    },
    destructionInfo: ${genDestructionFromSpec(1230, 93, 19, 13, 4, 3)},
    description: 'Грядка для выращивания супер атомных бомб. Уровень ${level}.',
    imageUrl: '${img}',
  }`);
}

// Super bomb 7 (ID 634) - special stats
buildings.push(`  {
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
      givesCoins: ${super7Drops.coins}
    },
    drops: {
      frequent: [
        ${super7Drops.freq.map(dropStr).join(',\n        ')}
      ],
      rare: [${super7Drops.rare.map(dropStr).join(', ')}]
    },
    destructionInfo: ${genDestructionFromSpec(6467, 485, 97, 65, 20, 13)},
    description: 'Грядка для выращивания супер атомных бомб. Максимальный уровень.',
    imageUrl: '${superImages[6]}',
  }`);

// Closed project (ID 635)
buildings.push(`  {
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
      givesCoins: ${closedDrops.coins}
    },
    drops: {
      frequent: [
        ${closedDrops.freq.map(dropStr).join(',\n        ')}
      ],
      rare: [${closedDrops.rare.map(dropStr).join(', ')}]
    },
    destructionInfo: ${genDestructionFromSpec(1300, 98, 20, 13, 4, 3)},
    description: 'Атомную бомбу строили слишком долго и деньги инвесторов закончились. После сбора возвращается в Атомная бомба.',
    imageUrl: '${superImages[7]}',
  }`);

const result = buildings.join(',\n');
fs.writeFileSync('scratch/out_nuclear.ts', result, 'utf8');
console.log(`Generated ${buildings.length} buildings`);
console.log('Output written to scratch/out_nuclear.ts');
