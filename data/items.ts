
import { Item } from '../types';

export const items: Item[] = [
  {
    id: 10000,
    name: 'Сундук с сокровищем',
    englishName: 'Treasure Chest',
    category: 'Ресурсы',
    description: 'Монетки! Монетки! Монетки!!! Выпадает при взрыве зданий.',
    imageUrl: 'https://i.ibb.co/9kRL4JWP/10000.png',
  },
  {
    id: 10001,
    name: 'Дерево',
    englishName: 'Tree',
    category: 'Ресурсы',
    description: 'Дерево можно добыть, вырубая лес.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Дерево/10001.webp',
    requiredFor: [
      { id: 5, name: 'Деревянный дом 1', amount: 5 },
      { id: 6, name: 'Деревянный дом 2', amount: 11 },
      { id: 7, name: 'Каменный дом 1', amount: 66 },
    ],
    usedInWork: [
      { id: 55, name: 'Лесопилка 1', amount: 5 },
      { id: 56, name: 'Лесопилка 2', amount: 8 },
      { id: 307, name: 'Петардный завод', amount: 5 },
    ],
    dropsFrom: [
      { id: 55, name: 'Лесопилка 1', amount: 16, frequency: 'часто' },
      { id: 70, name: 'Грибная грядка 1', amount: 5, frequency: 'часто' },
      { id: 1, name: 'Лягушачья нора 1', amount: 5, frequency: 'редко' },
    ],
    rubyPackQuantity: 100
  },
  {
    id: 10002,
    name: 'Доски',
    englishName: 'Boards',
    category: 'Ресурсы',
    description: 'Доски можно добыть на лесопилке.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Доски/10002.webp',
    producedBy: [
        { id: 55, name: 'Лесопилка 1', amount: 4},
        { id: 56, name: 'Лесопилка 2', amount: 5},
    ],
    requiredFor: [
      { id: 5, name: 'Деревянный дом 1', amount: 2 },
      { id: 6, name: 'Деревянный дом 2', amount: 4 },
    ],
    rubyPackQuantity: 10
  },
  {
    id: 10003,
    name: 'Куски супер гриба',
    englishName: 'Super mushroom pieces',
    category: 'Ресурсы',
    description: 'Можно добыть, если вам повезет, и на вашей грядке с грибами вырастет супер гриб.',
    imageUrl: '/buildings/ресурсы/Грядки/Куски супер гриба/10003.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10004,
    name: 'Куски супер тыквы',
    englishName: 'Super pumpkin pieces',
    category: 'Ресурсы',
    description: 'Можно добыть, если вам повезет, и на вашей грядке с тыквами вырастет супер тыква.',
    imageUrl: '/buildings/ресурсы/Грядки/Куски супер тыквы/10004.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10005,
    name: 'Камни',
    englishName: 'Stones',
    category: 'Ресурсы',
    description: 'Можно найти на карте.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Камни/10005.webp',
    rubyPackQuantity: 50
  },
  {
    id: 10006,
    name: 'Каменные блоки',
    englishName: 'Stone blocks',
    category: 'Ресурсы',
    description: 'Можно сделать из камней в камнедробилке.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Каменные блоки/10006.webp',
    rubyPackQuantity: 10
  },
  {
    id: 10007,
    name: 'Яйцо Избушки-убийцы',
    englishName: 'Egg of the killing hut on the chicken legs',
    category: 'Ресурсы',
    description: 'Можно получить из Академии монстров.',
    imageUrl: '/buildings/ресурсы/Монстры/Яйцо Избушки-убийцы/10007.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10008,
    name: 'Бочка с нефтью',
    englishName: 'Oil barrel',
    category: 'Ресурсы',
    description: 'Можно добыть из месторождения нефти, используя нефтяную вышку.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Бочка с нефтью/10008.webp',
    rubyPackQuantity: 10
  },
  {
    id: 10009,
    name: 'Канистра с бензином',
    englishName: 'Canister with gasoline',
    category: 'Ресурсы',
    description: 'Можно добыть из нефти на алхимическом заводе.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Канистра с бензином/10009.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10010,
    name: 'Садовая бомба',
    englishName: 'Garden bomb',
    category: 'Ресурсы',
    description: 'Можно вырастить на грядке с бомбами.',
    imageUrl: '/buildings/ресурсы/Бомбы/Садовая бомба/10010.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10011,
    name: 'Садовая супер бомба',
    englishName: 'Super Garden Bomb',
    category: 'Ресурсы',
    description: 'Усиленная версия садовой бомбы. Можно вырастить на грядке с бомбами при большой удаче.',
    imageUrl: '/buildings/ресурсы/Бомбы/Садовая супер бомба/10011.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10012,
    name: 'MGM-52 «Ланс»',
    englishName: 'MGM-52 Lance',
    category: 'Ресурсы',
    description: 'Производится на военном заводе.',
    imageUrl: '/buildings/ресурсы/Бомбы/MGM-52 «Ланс»/10012.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10013,
    name: 'Петарда',
    englishName: 'Firecracker',
    category: 'Ресурсы',
    description: 'Используется для подрыва зданий.',
    imageUrl: '/buildings/ресурсы/Бомбы/Петарда/10013.webp',
    rubyPackQuantity: 10
  },
  {
    id: 10014,
    name: 'Рубин',
    englishName: 'Ruby',
    category: 'Ресурсы',
    description: 'Драгоценный камень. Можно купить на Аукционе.',
    imageUrl: 'https://i.ibb.co/qFC6RQ8P/ruby.png',
    // Not buyable for rubies
  },
  {
    id: 10015,
    name: 'Ящик петард',
    englishName: 'Box of Firecrackers',
    category: 'Ресурсы',
    description: 'Ящик с петардами.',
    imageUrl: '/buildings/ресурсы/Бомбы/Ящик петард/10014.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10016,
    name: 'Атомная бомба «Снежинка»',
    englishName: 'Atomic bomb Snowflake',
    category: 'Ресурсы',
    description: 'Производится на военном заводе.',
    imageUrl: '/buildings/ресурсы/Бомбы/Атомная бомба «Снежин/10015.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10017,
    name: 'Детонатор',
    englishName: 'Detonator',
    category: 'Ресурсы',
    description: 'Необходим для создания мощной взрывчатки.',
    imageUrl: '/buildings/ресурсы/Бомбы/Детонатор/10017.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10018,
    name: 'Яйцо Горыныча',
    englishName: 'Egg of Gorynych',
    category: 'Ресурсы',
    description: 'Редкое яйцо легендарного Змея Горыныча.',
    imageUrl: '/buildings/ресурсы/Монстры/Яйцо Горыныча/10018.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10019,
    name: 'Мешок муки',
    englishName: 'Bag of flour',
    category: 'Ресурсы',
    description: 'Можно получить на мельнице.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Мешок муки/10019.webp',
    rubyPackQuantity: 10
  },
  {
    id: 10021,
    name: 'Куски супер репки',
    englishName: 'Super turnip pieces',
    category: 'Ресурсы',
    description: 'Можно добыть, если вам повезет, и на вашей грядке с репками вырастет супер репка.',
    imageUrl: '/buildings/ресурсы/Грядки/Куски супер репки/10021.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10022,
    name: 'Руда',
    englishName: 'Ore',
    category: 'Ресурсы',
    description: 'Можно добыть в шахте.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Руда/10022.webp',
    rubyPackQuantity: 20
  },
  {
    id: 10023,
    name: 'Сталь',
    englishName: 'Steel',
    category: 'Ресурсы',
    description: 'Прочный металл. Производится из руды.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Сталь/10023.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10024,
    name: 'Супер лилия',
    englishName: 'Super Lily',
    category: 'Ресурсы',
    description: 'Можно добыть, если вам повезет, и в вашем пруду с лилиями вырастет супер лилия.',
    imageUrl: '/buildings/ресурсы/Грядки/Супер лилия/10024.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10025,
    name: 'Золотая руда',
    englishName: 'Gold ore',
    category: 'Ресурсы',
    description: 'Можно добыть в золотой шахте.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Золотая руда или Самородок/10025.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10026,
    name: 'Золото',
    englishName: 'Gold',
    category: 'Ресурсы',
    description: 'Слиток золота. Очень ценный ресурс.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Золото/10026.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10027,
    name: 'Зёрна гигантской пшеницы',
    englishName: 'Giant wheat grains',
    category: 'Ресурсы',
    description: 'Семена необычайно большой пшеницы.',
    imageUrl: '/buildings/ресурсы/Грядки/Зёрна гигантской пше/10027.webp',
    rubyPackQuantity: 10
  },
  {
    id: 10028,
    name: 'Чертёж таблички',
    englishName: 'Blueprint for a sign',
    category: 'Ресурсы',
    description: 'Необходим для строительства табличек.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Чертёж таблички/10028.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10029,
    name: 'Тюремный замок',
    englishName: 'Prison Castle',
    category: 'Ресурсы',
    description: 'Нужен для строительства тюрьмы.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Тюремный замок/10029.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10030,
    name: 'Цветок подсолнуха',
    englishName: 'Sunflower Flower',
    category: 'Ресурсы',
    description: 'Нужен для изготовления рекомендаций.',
    imageUrl: '/buildings/ресурсы/Грядки/Цветок подсолнуха/10030.webp',
    rubyPackQuantity: 10
  },
  {
    id: 10032,
    name: 'Рекомендация',
    englishName: 'Recommendation',
    category: 'Ресурсы',
    description: 'Даёт возможность хвалить или жаловаться на других игроков. Влияет на репутацию: чем выше репутация, тем дороже стоит ваш бан.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Рекомендация/10032.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10033,
    name: 'Черепок',
    englishName: 'Skull',
    category: 'Ресурсы',
    description: 'Остатки древних скелетов.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Черепок/10033.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10034,
    name: 'Изумруд',
    englishName: 'Emerald',
    category: 'Ресурсы',
    description: 'Редкий драгоценный камень.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Изумруд/10034.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10035,
    name: 'Элитная древесина',
    englishName: 'Elite Wood',
    category: 'Ресурсы',
    description: 'Редкая и прочная древесина высокого качества.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Элитная древесина/10035.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10036,
    name: 'Изумрудная руда',
    englishName: 'Emerald Ore',
    category: 'Ресурсы',
    description: 'Редкая руда, содержащая драгоценные изумруды.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Изумрудная руда/10036.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10037,
    name: 'Камень Тролля',
    englishName: 'Troll Stone',
    category: 'Ресурсы',
    description: 'Древний камень, пропитанный силой горных троллей.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Камень Тролля/10037.webp',
    rubyPackQuantity: 2
  },
  {
    id: 10038,
    name: 'Лёд',
    englishName: 'Ice',
    category: 'Ресурсы',
    description: 'Холодный кусок льда.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Лёд/10038.webp',
    rubyPackQuantity: 20
  },
  {
    id: 10039,
    name: 'Символ любви',
    englishName: 'Symbol of Love',
    category: 'Ресурсы',
    description: 'Редкий символ, олицетворяющий искренние чувства.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Символ любви или Сердце/10039.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10040,
    name: 'Стальной лист',
    englishName: 'Steel Sheet',
    category: 'Ресурсы',
    description: 'Он нужен для строительства и производится на фабрике из стальных слитков.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Стальной лист/10040.webp',
    rubyPackQuantity: 5
  },
  {
    id: 10041,
    name: 'Песок',
    englishName: 'Sand',
    category: 'Ресурсы',
    description: 'Обычный песок, который можно найти в карьере.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Песок/10041.webp',
    rubyPackQuantity: 20
  },
  {
    id: 10042,
    name: 'Сердце',
    englishName: 'Heart',
    category: 'Ресурсы',
    description: 'Редкий символ, олицетворяющий искренние чувства.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Символ любви или Сердце/10039.webp',
    rubyPackQuantity: 1
  },
  {
    id: 10043,
    name: 'Суператомная бомба',
    englishName: 'Super Atomic Bomb',
    category: 'Ресурсы',
    description: 'Оружие массового поражения невероятной силы.',
    imageUrl: '/buildings/ресурсы/Бомбы/Суператомная бомба/10016.webp',
    rubyPackQuantity: 2
  },
  {
    id: 10044,
    name: 'Самородок',
    englishName: 'Gold Nugget',
    category: 'Ресурсы',
    description: 'Крупный кусок самородного золота.',
    imageUrl: '/buildings/ресурсы/Ресурсы/Золотая руда или Самородок/10025.webp',
    rubyPackQuantity: 2
  }
  ,
  {
    id: 10045,
    name: 'РЎСѓРїРµСЂ РґРµС‚РѕРЅР°С‚РѕСЂ',
    englishName: 'Super Detonator',
    category: 'Ресурсы',
    description: 'РЈСЃРєРѕСЂСЏРµС‚ РІР·СЂС‹РІ Р±РѕРјР± РЅР° 70%. РњРѕР¶РЅРѕ РёР·РіРѕС‚РѕРІРёС‚СЊ РЅР° РґСЊСЏРІРѕР»СЊСЃРєРѕР№ РјР°С€РёРЅРµ.',
    imageUrl: '/buildings/ресурсы/Бомбы/Супер детонатор/10020.webp',
    rubyPackQuantity: 1
  }
];
