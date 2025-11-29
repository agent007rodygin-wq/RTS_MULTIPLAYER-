
import { Item } from '../types';

export const items: Item[] = [
  {
    id: 10000,
    name: 'Сундук с сокровищем',
    englishName: 'Treasure Chest',
    category: 'Ресурсы',
    description: 'Монетки! Монетки! Монетки!!! Выпадает при взрыве зданий.',
    imageUrl: 'https://i.ibb.co/9kRL4JWP/10000.png',
    rubyPackQuantity: 1
  },
  {
    id: 10001,
    name: 'Дерево',
    englishName: 'Tree',
    category: 'Ресурсы',
    description: 'Дерево можно добыть, вырубая лес.',
    imageUrl: 'https://i.ibb.co/ZR5vnNqR/10001.png',
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
    imageUrl: 'https://i.ibb.co/7JLgmTd7/10002.png',
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
    imageUrl: 'https://i.ibb.co/wrF63S8P/10003.png',
    rubyPackQuantity: 1
  },
  {
    id: 10004,
    name: 'Куски супер тыквы',
    englishName: 'Super pumpkin pieces',
    category: 'Ресурсы',
    description: 'Можно добыть, если вам повезет, и на вашей грядке с тыквами вырастет супер тыква.',
    imageUrl: 'https://i.ibb.co/3yQZJSPD/10004.png',
    rubyPackQuantity: 1
  },
  {
    id: 10005,
    name: 'Камни',
    englishName: 'Stones',
    category: 'Ресурсы',
    description: 'Можно найти на карте.',
    imageUrl: 'https://i.ibb.co/YTF53bws/10005.png',
    rubyPackQuantity: 50
  },
  {
    id: 10006,
    name: 'Каменные блоки',
    englishName: 'Stone blocks',
    category: 'Ресурсы',
    description: 'Можно сделать из камней в камнедробилке.',
    imageUrl: 'https://i.ibb.co/TjQVM42/10006.png',
    rubyPackQuantity: 10
  },
  {
    id: 10007,
    name: 'Яйцо Избушки-убийцы',
    englishName: 'Egg of the killing hut on the chicken legs',
    category: 'Ресурсы',
    description: 'Можно получить из Академии монстров.',
    imageUrl: 'https://i.ibb.co/7J4Cd03L/10007.png',
    rubyPackQuantity: 1
  },
  {
    id: 10008,
    name: 'Бочка с нефтью',
    englishName: 'Oil barrel',
    category: 'Ресурсы',
    description: 'Можно добыть из месторождения нефти, используя нефтяную вышку.',
    imageUrl: 'https://i.ibb.co/2Y3mYHGX/10008.png',
    rubyPackQuantity: 10
  },
  {
    id: 10009,
    name: 'Канистра с бензином',
    englishName: 'Canister with gasoline',
    category: 'Ресурсы',
    description: 'Можно добыть из нефти на алхимическом заводе.',
    imageUrl: 'https://i.ibb.co/gZL5q1r7/10009-2.png',
    rubyPackQuantity: 5
  },
  {
    id: 10010,
    name: 'Садовая бомба',
    englishName: 'Garden bomb',
    category: 'Ресурсы',
    description: 'Можно вырастить на грядке с бомбами.',
    imageUrl: 'https://i.ibb.co/rKqsX4Hj/10010.png',
    rubyPackQuantity: 5
  },
  {
    id: 10011,
    name: 'Садовая супер бомба',
    englishName: 'Super Garden Bomb',
    category: 'Ресурсы',
    description: 'Усиленная версия садовой бомбы. Можно вырастить на грядке с бомбами при большой удаче.',
    imageUrl: 'https://i.ibb.co/jkqQy3L8/10011.png',
    rubyPackQuantity: 1
  },
  {
    id: 10012,
    name: 'MGM-52 «Ланс»',
    englishName: 'MGM-52 Lance',
    category: 'Ресурсы',
    description: 'Производится на военном заводе.',
    imageUrl: 'https://i.ibb.co/7Jts8WJv/10012.png',
    rubyPackQuantity: 1
  },
  {
    id: 10013,
    name: 'Петарда',
    englishName: 'Firecracker',
    category: 'Ресурсы',
    description: 'Используется для подрыва зданий.',
    imageUrl: 'https://i.ibb.co/j997mCCj/10013.png',
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
    imageUrl: 'https://i.ibb.co/TDTkWmfx/10014.png',
    rubyPackQuantity: 1
  },
  {
    id: 10016,
    name: 'Атомная бомба «Снежинка»',
    englishName: 'Atomic bomb Snowflake',
    category: 'Ресурсы',
    description: 'Производится на военном заводе.',
    imageUrl: 'https://i.ibb.co/yc3qhmJn/10015.png',
    rubyPackQuantity: 1
  },
  {
    id: 10017,
    name: 'Детонатор',
    englishName: 'Detonator',
    category: 'Ресурсы',
    description: 'Необходим для создания мощной взрывчатки.',
    imageUrl: 'https://i.ibb.co/nNG6dYJ0/10017.png',
    rubyPackQuantity: 5
  },
  {
    id: 10018,
    name: 'Яйцо Горыныча',
    englishName: 'Egg of Gorynych',
    category: 'Ресурсы',
    description: 'Редкое яйцо легендарного Змея Горыныча.',
    imageUrl: 'https://i.ibb.co/JR9MnWfX/10018.png',
    rubyPackQuantity: 1
  },
  {
    id: 10019,
    name: 'Мешок муки',
    englishName: 'Bag of flour',
    category: 'Ресурсы',
    description: 'Можно получить на мельнице.',
    imageUrl: 'https://i.ibb.co/zT3fjp7v/10019.png',
    rubyPackQuantity: 10
  },
  {
    id: 10021,
    name: 'Куски супер репки',
    englishName: 'Super turnip pieces',
    category: 'Ресурсы',
    description: 'Можно добыть, если вам повезет, и на вашей грядке с репками вырастет супер репка.',
    imageUrl: 'https://i.ibb.co/bMpYKVC2/10021.png',
    rubyPackQuantity: 1
  },
  {
    id: 10022,
    name: 'Руда',
    englishName: 'Ore',
    category: 'Ресурсы',
    description: 'Можно добыть в шахте.',
    imageUrl: 'https://i.ibb.co/PZb6Mwt3/10022.png',
    rubyPackQuantity: 20
  },
  {
    id: 10023,
    name: 'Сталь',
    englishName: 'Steel',
    category: 'Ресурсы',
    description: 'Прочный металл. Производится из руды.',
    imageUrl: 'https://i.ibb.co/mry2BYzb/10023.png',
    rubyPackQuantity: 5
  },
  {
    id: 10024,
    name: 'Супер лилия 1',
    englishName: 'Super Lily 1',
    category: 'Ресурсы',
    description: 'Можно добыть, если вам повезет, и в вашем пруду с лилиями вырастет супер лилия.',
    imageUrl: 'https://i.ibb.co/ynvVTTY1/10024.png',
    rubyPackQuantity: 1
  },
  {
    id: 10025,
    name: 'Золотая руда',
    englishName: 'Gold ore',
    category: 'Ресурсы',
    description: 'Можно добыть в золотой шахте.',
    imageUrl: 'https://i.ibb.co/WptMKP84/10025.png',
    rubyPackQuantity: 5
  },
  {
    id: 10026,
    name: 'Золото',
    englishName: 'Gold',
    category: 'Ресурсы',
    description: 'Слиток золота. Очень ценный ресурс.',
    imageUrl: 'https://i.ibb.co/DPLxWcdf/10026.png',
    rubyPackQuantity: 1
  },
  {
    id: 10027,
    name: 'Зёрна гигантской пшеницы',
    englishName: 'Giant wheat grains',
    category: 'Ресурсы',
    description: 'Семена необычайно большой пшеницы.',
    imageUrl: 'https://i.ibb.co/KTzDmD3/10027.png',
    rubyPackQuantity: 10
  },
  {
    id: 10028,
    name: 'Чертёж таблички',
    englishName: 'Blueprint for a sign',
    category: 'Ресурсы',
    description: 'Необходим для строительства табличек.',
    imageUrl: 'https://i.ibb.co/p67prqNc/10028.png',
    rubyPackQuantity: 1
  },
  {
    id: 10029,
    name: 'Тюремный замок',
    englishName: 'Prison Castle',
    category: 'Ресурсы',
    description: 'Нужен для строительства тюрьмы.',
    imageUrl: 'https://i.ibb.co/gb1yRXbZ/10029.png',
    rubyPackQuantity: 1
  },
  {
    id: 10030,
    name: 'Цветок подсолнуха',
    englishName: 'Sunflower Flower',
    category: 'Ресурсы',
    description: 'Нужен для изготовления рекомендаций.',
    imageUrl: 'https://i.ibb.co/mVnsX1XL/10030.png',
    rubyPackQuantity: 10
  },
  {
    id: 10032,
    name: 'Рекомендация',
    englishName: 'Recommendation',
    category: 'Ресурсы',
    description: 'Даёт возможность хвалить или жаловаться на других игроков. Влияет на репутацию: чем выше репутация, тем дороже стоит ваш бан.',
    imageUrl: 'https://i.ibb.co/F4gtL2xX/10032.png',
    rubyPackQuantity: 1
  },
  {
    id: 10033,
    name: 'Черепок',
    englishName: 'Skull',
    category: 'Ресурсы',
    description: 'Остатки древних скелетов.',
    imageUrl: 'https://i.ibb.co/HDPWbb5t/10033.png',
    rubyPackQuantity: 5
  },
  {
    id: 10034,
    name: 'Изумруд',
    englishName: 'Emerald',
    category: 'Ресурсы',
    description: 'Редкий драгоценный камень.',
    imageUrl: 'https://i.ibb.co/JFz3f7Bj/10034.png',
    rubyPackQuantity: 1
  },
  {
    id: 10035,
    name: 'Элитная древесина',
    englishName: 'Elite Wood',
    category: 'Ресурсы',
    description: 'Редкая и прочная древесина высокого качества.',
    imageUrl: 'https://i.ibb.co/tMbCCDdb/10035.png',
    rubyPackQuantity: 5
  },
  {
    id: 10036,
    name: 'Изумрудная руда',
    englishName: 'Emerald Ore',
    category: 'Ресурсы',
    description: 'Редкая руда, содержащая драгоценные изумруды.',
    imageUrl: 'https://i.ibb.co/ycMWhH9g/10036.png',
    rubyPackQuantity: 5
  },
  {
    id: 10037,
    name: 'Камень Тролля',
    englishName: 'Troll Stone',
    category: 'Ресурсы',
    description: 'Древний камень, пропитанный силой горных троллей.',
    imageUrl: 'https://i.ibb.co/YTX8gNXG/10037.png',
    rubyPackQuantity: 2
  },
  {
    id: 10038,
    name: 'Лёд',
    englishName: 'Ice',
    category: 'Ресурсы',
    description: 'Холодный кусок льда.',
    imageUrl: 'https://i.ibb.co/p6rSGdd7/10038.png',
    rubyPackQuantity: 20
  },
  {
    id: 10039,
    name: 'Символ любви',
    englishName: 'Symbol of Love',
    category: 'Ресурсы',
    description: 'Редкий символ, олицетворяющий искренние чувства.',
    imageUrl: 'https://i.ibb.co/xRQ0M6m/10039.png',
    rubyPackQuantity: 1
  },
  {
    id: 10040,
    name: 'Стальной лист',
    englishName: 'Steel Sheet',
    category: 'Ресурсы',
    description: 'Он нужен для строительства и производится на фабрике из стальных слитков.',
    imageUrl: 'https://i.ibb.co/nqNhTnY8/10040.png',
    rubyPackQuantity: 5
  },
  {
    id: 10041,
    name: 'Песок',
    englishName: 'Sand',
    category: 'Ресурсы',
    description: 'Обычный песок, который можно найти в карьере.',
    imageUrl: 'https://placehold.co/200x200/E6DFA7/000000?text=Sand',
    rubyPackQuantity: 20
  },
  {
    id: 10042,
    name: 'Супер детонатор',
    englishName: 'Super Detonator',
    category: 'Ресурсы',
    description: 'Усиленный детонатор для особо мощных взрывов.',
    imageUrl: 'https://i.ibb.co/nqztrdy9/10020.png',
    rubyPackQuantity: 2
  },
  {
    id: 10043,
    name: 'Суператомная бомба',
    englishName: 'Super Atomic Bomb',
    category: 'Ресурсы',
    description: 'Оружие массового поражения невероятной силы.',
    imageUrl: 'https://i.ibb.co/yc3qhmJn/10015.png',
    rubyPackQuantity: 2
  },
  {
    id: 10044,
    name: 'Самородок',
    englishName: 'Gold Nugget',
    category: 'Ресурсы',
    description: 'Крупный кусок самородного золота.',
    imageUrl: 'https://i.ibb.co/WptMKP84/10025.png',
    rubyPackQuantity: 2
  }
];
