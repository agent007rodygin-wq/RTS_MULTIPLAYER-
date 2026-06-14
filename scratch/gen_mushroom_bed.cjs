// Generate Enhanced Mushroom Bed (Улучшеная Грибная Грядка) building entries
// IDs 874-894, 21 levels

const levels = [
  { id:874, lvl:1, price:300, popBuild:3, res:[{id:10001,n:'Дерево',a:2}], popWork:2, ctSec:60, accel:2, dur:176, glory:15, workSec:655, coins:50, chance:30.25,
    freqDrops:[{id:10001,n:'Дерево',a:4},{id:10008,n:'Бочка с нефтью',a:2},{id:10000,n:'Монеты',a:140}], rareDrops:[{id:10006,n:'Каменные блоки',a:2}],
    bomb:{pet:{a:30,g:150,e:30,t:750},sad:{a:3,g:1500,e:12,t:5400},lan:{a:1,g:5000,e:16,t:2600},sup:{a:1,g:15000,e:20,t:1800},ato:{a:1,g:10000,e:48,t:3600},sat:{a:1,g:40000,e:60}} },
  { id:875, lvl:2, price:1200, popBuild:7, res:[{id:10001,n:'Дерево',a:3},{id:10002,n:'Доски',a:1}], popWork:2, ctSec:205, accel:3, dur:368, glory:60, workSec:677, coins:100, chance:31,
    freqDrops:[{id:10002,n:'Доски',a:6},{id:10013,n:'Петарда',a:2},{id:10000,n:'Монеты',a:303}], rareDrops:[{id:10022,n:'Руда',a:2}],
    bomb:{pet:{a:62,g:310,e:62,t:1550},sad:{a:5,g:2500,e:20,t:9000},lan:{a:1,g:5000,e:16,t:2600},sup:{a:1,g:15000,e:20,t:1800},ato:{a:1,g:10000,e:48,t:3600},sat:{a:1,g:40000,e:60}} },
  { id:876, lvl:3, price:10800, popBuild:12, res:[{id:10001,n:'Дерево',a:28},{id:10002,n:'Доски',a:11}], popWork:4, ctSec:1036, accel:7, dur:1136, glory:540, workSec:1057, coins:150, chance:32.25,
    freqDrops:[{id:10002,n:'Доски',a:57},{id:10009,n:'Канистра с бензином',a:38},{id:10000,n:'Монеты',a:839}], rareDrops:[{id:10018,n:'Яйцо Горыныча',a:3}],
    bomb:{pet:{a:190,g:950,e:190,t:4750},sad:{a:15,g:7500,e:60,t:27000},lan:{a:3,g:15000,e:48,t:7800},sup:{a:2,g:30000,e:40,t:3600},ato:{a:1,g:10000,e:48,t:3600},sat:{a:1,g:40000,e:60}} },
  { id:877, lvl:4, price:25600, popBuild:17, res:[{id:10002,n:'Доски',a:26}], popWork:4, ctSec:2947, accel:11, dur:1816, glory:1280, workSec:1470, coins:200, chance:34,
    freqDrops:[{id:10017,n:'Детонатор',a:3},{id:10007,n:'Яйцо Избушки-убийцы',a:3},{id:10000,n:'Монеты',a:2268}], rareDrops:[{id:10040,n:'Стальной лист',a:2}],
    bomb:{pet:{a:303,g:1515,e:303,t:7575},sad:{a:23,g:11500,e:92,t:41400},lan:{a:5,g:25000,e:80,t:13000},sup:{a:4,g:60000,e:80,t:7200},ato:{a:1,g:10000,e:48,t:3600},sat:{a:1,g:40000,e:60}} },
  { id:878, lvl:5, price:50000, popBuild:23, res:[{id:10002,n:'Доски',a:50},{id:10035,n:'Элитная древесина',a:1}], popWork:5, ctSec:7300, accel:18, dur:2632, glory:2500, workSec:1921, coins:250, chance:36.25,
    freqDrops:[{id:10003,n:'Куски супер гриба',a:5},{id:10024,n:'Супер лилия',a:10},{id:10000,n:'Монеты',a:2735}], rareDrops:[{id:10036,n:'Изумрудная руда',a:3}],
    bomb:{pet:{a:439,g:2195,e:439,t:10975},sad:{a:33,g:16500,e:132,t:59400},lan:{a:7,g:35000,e:112,t:18200},sup:{a:5,g:75000,e:100,t:9000},ato:{a:2,g:20000,e:96,t:7200},sat:{a:1,g:40000,e:60}} },
  { id:879, lvl:6, price:86400, popBuild:30, res:[{id:10002,n:'Доски',a:86},{id:10035,n:'Элитная древесина',a:1}], popWork:7, ctSec:16200, accel:27, dur:3568, glory:4320, workSec:2414, coins:300, chance:39,
    freqDrops:[{id:10018,n:'Яйцо Горыныча',a:2},{id:10004,n:'Куски супер тыквы',a:5},{id:10000,n:'Монеты',a:4775}], rareDrops:[{id:10034,n:'Изумруд',a:3}],
    bomb:{pet:{a:595,g:2975,e:595,t:14875},sad:{a:45,g:22500,e:180,t:81000},lan:{a:9,g:45000,e:144,t:23400},sup:{a:6,g:90000,e:120,t:10800},ato:{a:2,g:20000,e:96,t:7200},sat:{a:2,g:80000,e:120}} },
  { id:880, lvl:7, price:137200, popBuild:37, res:[{id:10002,n:'Доски',a:137},{id:10035,n:'Элитная древесина',a:1}], popWork:9, ctSec:30391, accel:37, dur:4640, glory:6860, workSec:2954, coins:350, chance:42.25,
    freqDrops:[{id:10022,n:'Руда',a:11},{id:10018,n:'Яйцо Горыныча',a:3},{id:10000,n:'Монеты',a:6401}], rareDrops:[{id:10040,n:'Стальной лист',a:12}],
    bomb:{pet:{a:774,g:3870,e:774,t:19350},sad:{a:58,g:29000,e:232,t:104400},lan:{a:12,g:60000,e:192,t:31200},sup:{a:8,g:120000,e:160,t:14400},ato:{a:3,g:30000,e:144,t:10800},sat:{a:2,g:80000,e:120}} },
  { id:881, lvl:8, price:204800, popBuild:45, res:[{id:10002,n:'Доски',a:205},{id:10035,n:'Элитная древесина',a:2}], popWork:11, ctSec:54675, accel:49, dur:5832, glory:10240, workSec:3539, coins:400, chance:46,
    freqDrops:[{id:10026,n:'Золото',a:2},{id:10040,n:'Стальной лист',a:2},{id:10000,n:'Монеты',a:7853}], rareDrops:[{id:10044,n:'Самородок',a:47}],
    bomb:{pet:{a:972,g:4860,e:972,t:24300},sad:{a:73,g:36500,e:292,t:131400},lan:{a:15,g:75000,e:240,t:39000},sup:{a:10,g:150000,e:200,t:18000},ato:{a:3,g:30000,e:144,t:10800},sat:{a:2,g:80000,e:120}} },
  { id:882, lvl:9, price:291600, popBuild:54, res:[{id:10002,n:'Доски',a:292},{id:10035,n:'Элитная древесина',a:3},{id:10023,n:'Сталь',a:1}], popWork:14, ctSec:94478, accel:65, dur:7144, glory:14580, workSec:4174, coins:450, chance:50.25,
    freqDrops:[{id:10022,n:'Руда',a:26},{id:10030,n:'Супер подсолнух',a:2},{id:10000,n:'Монеты',a:10631}], rareDrops:[{id:10034,n:'Изумруд',a:9}],
    bomb:{pet:{a:1191,g:5955,e:1191,t:29775},sad:{a:90,g:45000,e:360,t:162000},lan:{a:18,g:90000,e:288,t:46800},sup:{a:12,g:180000,e:240,t:21600},ato:{a:4,g:40000,e:192,t:14400},sat:{a:3,g:120000,e:180}} },
  { id:883, lvl:10, price:400000, popBuild:63, res:[{id:10002,n:'Доски',a:400},{id:10035,n:'Элитная древесина',a:4},{id:10023,n:'Сталь',a:1}], popWork:18, ctSec:150028, accel:82, dur:8584, glory:20000, workSec:4860, coins:500, chance:55,
    freqDrops:[{id:10022,n:'Руда',a:38},{id:10023,n:'Сталь',a:7},{id:10000,n:'Монеты',a:10631}], rareDrops:[{id:10043,n:'Суператомная бомба',a:2}],
    bomb:{pet:{a:1431,g:7155,e:1431,t:35775},sad:{a:108,g:54000,e:432,t:194400},lan:{a:22,g:110000,e:352,t:57200},sup:{a:15,g:225000,e:300,t:27000},ato:{a:5,g:50000,e:240,t:18000},sat:{a:3,g:120000,e:180}} },
  { id:884, lvl:11, price:532400, popBuild:73, res:[{id:10002,n:'Доски',a:532},{id:10035,n:'Элитная древесина',a:5},{id:10023,n:'Сталь',a:1}], popWork:22, ctSec:233410, accel:102, dur:10152, glory:26620, workSec:5598, coins:550, chance:60.25,
    freqDrops:[{id:10026,n:'Золото',a:5},{id:10042,n:'Супер детонатор',a:3},{id:10000,n:'Монеты',a:13538}], rareDrops:[{id:10044,n:'Самородок',a:140}],
    bomb:{pet:{a:1692,g:8460,e:1692,t:42300},sad:{a:127,g:63500,e:508,t:228600},lan:{a:26,g:130000,e:416,t:67600},sup:{a:17,g:255000,e:340,t:30600},ato:{a:6,g:60000,e:288,t:21600},sat:{a:4,g:160000,e:240}} },
  { id:885, lvl:12, price:691200, popBuild:84, res:[{id:10002,n:'Доски',a:1037},{id:10035,n:'Элитная древесина',a:10},{id:10026,n:'Золото',a:1},{id:10040,n:'Стальной лист',a:1}], popWork:24, ctSec:355622, accel:126, dur:11840, glory:34560, workSec:6389, coins:600, chance:66,
    freqDrops:[{id:10042,n:'Супер детонатор',a:3},{id:10040,n:'Стальной лист',a:6},{id:10000,n:'Монеты',a:13538}], rareDrops:[{id:10036,n:'Изумрудная руда',a:51}],
    bomb:{pet:{a:1974,g:9870,e:1974,t:49350},sad:{a:148,g:74000,e:592,t:266400},lan:{a:30,g:150000,e:480,t:78000},sup:{a:20,g:300000,e:400,t:36000},ato:{a:6,g:60000,e:288,t:21600},sat:{a:4,g:160000,e:240}} },
  { id:886, lvl:13, price:878800, popBuild:95, res:[{id:10002,n:'Доски',a:1318},{id:10035,n:'Элитная древесина',a:13},{id:10026,n:'Золото',a:1},{id:10040,n:'Стальной лист',a:1}], popWork:28, ctSec:514425, accel:151, dur:13648, glory:43940, workSec:7234, coins:650, chance:72.25,
    freqDrops:[{id:10044,n:'Самородок',a:17},{id:10040,n:'Стальной лист',a:7},{id:10000,n:'Монеты',a:13538}], rareDrops:[{id:10034,n:'Изумруд',a:32}],
    bomb:{pet:{a:2275,g:11375,e:2275,t:56875},sad:{a:171,g:85500,e:684,t:307800},lan:{a:35,g:175000,e:560,t:91000},sup:{a:23,g:345000,e:460,t:41400},ato:{a:7,g:70000,e:336,t:25200},sat:{a:5,g:200000,e:300}} },
  { id:887, lvl:14, price:1097600, popBuild:107, res:[{id:10035,n:'Элитная древесина',a:16},{id:10026,n:'Золото',a:1},{id:10040,n:'Стальной лист',a:1}], popWork:33, ctSec:735025, accel:181, dur:15584, glory:54880, workSec:8133, coins:700, chance:79,
    freqDrops:[{id:10044,n:'Самородок',a:22},{id:10036,n:'Изумрудная руда',a:6},{id:10000,n:'Монеты',a:13538}], rareDrops:[{id:10043,n:'Суператомная бомба',a:6}],
    bomb:{pet:{a:2598,g:12990,e:2598,t:64950},sad:{a:195,g:97500,e:780,t:351000},lan:{a:39,g:195000,e:624,t:101400},sup:{a:26,g:390000,e:520,t:46800},ato:{a:8,g:80000,e:384,t:28800},sat:{a:6,g:240000,e:360}} },
  { id:888, lvl:15, price:1350000, popBuild:120, res:[{id:10035,n:'Элитная древесина',a:20},{id:10026,n:'Золото',a:2},{id:10034,n:'Изумруд',a:1},{id:10040,n:'Стальной лист',a:2}], popWork:39, ctSec:1036800, accel:215, dur:17640, glory:67500, workSec:9088, coins:750, chance:86.25,
    freqDrops:[{id:10022,n:'Руда',a:159},{id:10023,n:'Сталь',a:30},{id:10000,n:'Монеты',a:13538}], rareDrops:[{id:10044,n:'Самородок',a:422}],
    bomb:{pet:{a:2940,g:14700,e:2940,t:73500},sad:{a:221,g:110500,e:884,t:397800},lan:{a:45,g:225000,e:720,t:117000},sup:{a:30,g:450000,e:600,t:54000},ato:{a:9,g:90000,e:432,t:32400},sat:{a:6,g:240000,e:360}} },
  { id:889, lvl:16, price:1638400, popBuild:133, res:[{id:10035,n:'Элитная древесина',a:25},{id:10026,n:'Золото',a:2},{id:10034,n:'Изумруд',a:1},{id:10040,n:'Стальной лист',a:2}], popWork:41, ctSec:1411582, accel:250, dur:19816, glory:81920, workSec:10097, coins:800, chance:94,
    freqDrops:[{id:10026,n:'Золото',a:16},{id:10023,n:'Сталь',a:38},{id:10000,n:'Монеты',a:13538}], rareDrops:[{id:10036,n:'Изумрудная руда',a:142}],
    bomb:{pet:{a:3303,g:16515,e:3303,t:82575},sad:{a:248,g:124000,e:992,t:446400},lan:{a:50,g:250000,e:800,t:130000},sup:{a:34,g:510000,e:680,t:61200},ato:{a:10,g:100000,e:480,t:36000},sat:{a:7,g:280000,e:420}} },
  { id:890, lvl:17, price:1965200, popBuild:147, res:[{id:10035,n:'Элитная древесина',a:29},{id:10026,n:'Золото',a:3},{id:10034,n:'Изумруд',a:1},{id:10040,n:'Стальной лист',a:2}], popWork:47, ctSec:1905913, accel:291, dur:22112, glory:98260, workSec:11164, coins:850, chance:102.25,
    freqDrops:[{id:10026,n:'Золото',a:20},{id:10042,n:'Супер детонатор',a:11},{id:10000,n:'Монеты',a:13538}], rareDrops:[{id:10034,n:'Изумруд',a:84}],
    bomb:{pet:{a:3686,g:18430,e:3686,t:92150},sad:{a:277,g:138500,e:1108,t:498600},lan:{a:56,g:280000,e:896,t:145600},sup:{a:37,g:555000,e:740,t:66600},ato:{a:12,g:120000,e:576,t:43200},sat:{a:8,g:320000,e:480}} },
  { id:891, lvl:18, price:2332800, popBuild:162, res:[{id:10035,n:'Элитная древесина',a:35},{id:10026,n:'Золото',a:3},{id:10034,n:'Изумруд',a:1},{id:10040,n:'Стальной лист',a:3}], popWork:54, ctSec:2550916, accel:337, dur:24536, glory:116640, workSec:12286, coins:900, chance:111,
    freqDrops:[{id:10042,n:'Супер детонатор',a:13},{id:10040,n:'Стальной лист',a:22},{id:10000,n:'Монеты',a:13538}], rareDrops:[{id:10043,n:'Суператомная бомба',a:14}],
    bomb:{pet:{a:4090,g:20450,e:4090,t:102250},sad:{a:307,g:153500,e:1228,t:552600},lan:{a:62,g:310000,e:992,t:161200},sup:{a:41,g:615000,e:820,t:73800},ato:{a:13,g:130000,e:624,t:46800},sat:{a:9,g:360000,e:540}} },
  { id:892, lvl:19, price:2743600, popBuild:177, res:[{id:10035,n:'Элитная древесина',a:41},{id:10026,n:'Золото',a:4},{id:10034,n:'Изумруд',a:1},{id:10040,n:'Стальной лист',a:3}], popWork:57, ctSec:3327139, accel:385, dur:27080, glory:137180, workSec:13464, coins:950, chance:120.25,
    freqDrops:[{id:10044,n:'Самородок',a:67},{id:10036,n:'Изумрудная руда',a:18},{id:10000,n:'Монеты',a:20997}], rareDrops:[{id:10044,n:'Самородок',a:995}],
    bomb:{pet:{a:4514,g:22570,e:4514,t:112850},sad:{a:339,g:169500,e:1356,t:608400},lan:{a:68,g:340000,e:1088,t:176800},sup:{a:46,g:690000,e:920,t:82800},ato:{a:14,g:140000,e:672,t:50400},sat:{a:10,g:400000,e:600}} },
  { id:893, lvl:20, price:3200000, popBuild:193, res:[{id:10035,n:'Элитная древесина',a:48},{id:10026,n:'Золото',a:4},{id:10034,n:'Изумруд',a:1},{id:10040,n:'Стальной лист',a:4}], popWork:64, ctSec:4313434, accel:438, dur:29744, glory:160000, workSec:14701, coins:1000, chance:130,
    freqDrops:[{id:10034,n:'Изумруд',a:11},{id:10036,n:'Изумрудная руда',a:22},{id:10000,n:'Монеты',a:20997}], rareDrops:[{id:10036,n:'Изумрудная руда',a:320}],
    bomb:{pet:{a:4958,g:24790,e:4958,t:123950},sad:{a:372,g:186000,e:1488,t:669600},lan:{a:75,g:375000,e:1200,t:195000},sup:{a:50,g:750000,e:1000,t:90000},ato:{a:15,g:150000,e:720,t:54000},sat:{a:10,g:400000,e:600}} },
  { id:894, lvl:21, price:3704400, popBuild:210, res:[{id:10035,n:'Элитная древесина',a:56},{id:10026,n:'Золото',a:5},{id:10034,n:'Изумруд',a:1},{id:10040,n:'Стальной лист',a:5}], popWork:71, ctSec:5556600, accel:497, dur:32536, glory:185220, workSec:15993, coins:1050, chance:140.25,
    freqDrops:[{id:10026,n:'Золото',a:42},{id:10023,n:'Сталь',a:101},{id:10000,n:'Монеты',a:20997}], rareDrops:[{id:10034,n:'Изумруд',a:182}],
    bomb:{pet:{a:5423,g:27115,e:5423,t:135575},sad:{a:407,g:203500,e:1628,t:732600},lan:{a:82,g:410000,e:1312,t:213200},sup:{a:55,g:825000,e:1100,t:99000},ato:{a:17,g:170000,e:816,t:61200},sat:{a:11,g:440000,e:660}} },
];

const images = {
  1: 'https://i.ibb.co/Txdx19f5/874.png',
  6: 'https://i.ibb.co/pjpvsgZZ/879.png',
  11: 'https://i.ibb.co/LhRRPVtb/884.png',
  16: 'https://i.ibb.co/Kp7JwHy5/889.png',
  21: 'https://i.ibb.co/BVYMkLwj/894.png',
};

function getImage(lvl) {
  if (lvl >= 21) return images[21];
  if (lvl >= 16) return images[16];
  if (lvl >= 11) return images[11];
  if (lvl >= 6) return images[6];
  return images[1];
}

const prices = levels.map(l => l.price);

let out = '';
out += `  // ============================================================\n`;
out += `  // Улучшеная Грибная Грядка (Enhanced Mushroom Bed) - IDs 874-894\n`;
out += `  // Category: Заводы, 21 levels with special upgrade system\n`;
out += `  // ============================================================\n`;

for (const l of levels) {
  const nameRu = l.lvl === 1 ? 'Улучшеная Грибная Грядка' : `Улучшеная Грибная Грядка уровень - ${l.lvl}`;
  const nameEn = l.lvl === 1 ? 'Enhanced Mushroom Bed' : `Enhanced Mushroom Bed Level ${l.lvl}`;
  const buildable = l.lvl === 1 ? 'true' : 'false';
  const nextIdx = levels.findIndex(x => x.id === l.id + 1);
  const hasUpgrade = nextIdx >= 0;
  const upgradeCost = hasUpgrade ? levels[nextIdx].price : null;
  const dur = l.dur;

  // Calculate damage for each weapon
  const petDmg = Math.ceil(dur / l.bomb.pet.a);
  const sadDmg = Math.ceil(dur / l.bomb.sad.a);
  const lanDmg = Math.ceil(dur / l.bomb.lan.a);
  const supDmg = Math.ceil(dur / l.bomb.sup.a);
  const atoDmg = Math.ceil(dur / l.bomb.ato.a);
  const satDmg = Math.ceil(dur / l.bomb.sat.a);

  out += `  {\n`;
  out += `    id: ${l.id},\n`;
  out += `    name: '${nameRu}',\n`;
  out += `    englishName: '${nameEn}',\n`;
  out += `    category: 'Заводы',\n`;
  out += `    type: BuildingType.Default,\n`;
  out += `    price: ${l.price},\n`;
  out += `    buildable: ${buildable},\n`;
  out += `    constructionRequirements: {\n`;
  if (l.res && l.res.length > 0) {
    out += `      resources: [\n`;
    for (const r of l.res) {
      out += `        { id: ${r.id}, name: '${r.n}', amount: ${r.a} },\n`;
    }
    out += `      ],\n`;
  }
  out += `      population: ${l.popBuild},\n`;
  out += `    },\n`;
  out += `    stats: {\n`;
  out += `      constructionTimeSeconds: ${l.ctSec},\n`;
  out += `      accelerationCost: ${l.accel},\n`;
  out += `      durability: ${l.dur},\n`;
  out += `      gloryOnExplosion: ${l.glory},\n`;
  out += `      takesPopulation: ${l.popWork},\n`;
  out += `      workTimeSeconds: ${l.workSec},\n`;
  out += `      workYieldGold: ${l.coins},\n`;
  out += `      sometimesProduces: [\n`;
  out += `        { id: 10003, name: 'Куски супер гриба', chance: ${l.chance}, amount: 1 }\n`;
  out += `      ]\n`;
  out += `    },\n`;
  out += `    drops: {\n`;
  if (l.freqDrops && l.freqDrops.length > 0) {
    out += `      frequent: [\n`;
    for (const d of l.freqDrops) {
      out += `        { id: ${d.id}, name: '${d.n}', amount: ${d.a} },\n`;
    }
    out += `      ],\n`;
  }
  if (l.rareDrops && l.rareDrops.length > 0) {
    out += `      rare: [\n`;
    for (const d of l.rareDrops) {
      out += `        { id: ${d.id}, name: '${d.n}', amount: ${d.a} }\n`;
    }
    out += `      ]\n`;
  }
  out += `    },\n`;
  out += `    destructionInfo: [\n`;
  out += `      { resourceId: 10013, weaponName: 'Петарда', amount: ${l.bomb.pet.a}, goldCost: ${l.bomb.pet.g}, energyCost: ${l.bomb.pet.e}, timeSeconds: ${l.bomb.pet.t}, damage: ${petDmg} },\n`;
  out += `      { resourceId: 10010, weaponName: 'Садовая бомба', amount: ${l.bomb.sad.a}, goldCost: ${l.bomb.sad.g}, energyCost: ${l.bomb.sad.e}, timeSeconds: ${l.bomb.sad.t}, damage: ${sadDmg} },\n`;
  out += `      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: ${l.bomb.lan.a}, goldCost: ${l.bomb.lan.g}, energyCost: ${l.bomb.lan.e}, timeSeconds: ${l.bomb.lan.t}, damage: ${lanDmg} },\n`;
  out += `      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: ${l.bomb.sup.a}, goldCost: ${l.bomb.sup.g}, energyCost: ${l.bomb.sup.e}, timeSeconds: ${l.bomb.sup.t}, damage: ${supDmg} },\n`;
  out += `      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: ${l.bomb.ato.a}, goldCost: ${l.bomb.ato.g}, energyCost: ${l.bomb.ato.e}, timeSeconds: ${l.bomb.ato.t}, damage: ${atoDmg} },\n`;
  out += `      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: ${l.bomb.sat.a}, goldCost: ${l.bomb.sat.g}, energyCost: ${l.bomb.sat.e}, timeSeconds: 3, damage: ${satDmg} }\n`;
  out += `    ],\n`;
  const desc = l.lvl === 1
    ? 'Улучшеная грибная грядка. Приносит доход и иногда производит супер гриб.'
    : l.lvl === 21
    ? 'Максимальный уровень улучшеной грибной грядки. Невероятная мощь!'
    : `Улучшеная грибная грядка ${l.lvl} уровня.`;
  out += `    description: '${desc}',\n`;
  out += `    imageUrl: '${getImage(l.lvl)}',\n`;
  if (hasUpgrade) {
    out += `    upgradesTo: ${l.id + 1},\n`;
    out += `    upgradeCost: ${upgradeCost},\n`;
  }
  out += `  },\n`;
}

// Write to file
const fs = require('fs');
const path = require('path');
const outPath = path.join(__dirname, 'out_mushroom_bed.ts');
fs.writeFileSync(outPath, out, 'utf8');
console.log('Generated ' + levels.length + ' building entries to ' + outPath);
console.log('Total lines: ' + out.split('\n').length);
