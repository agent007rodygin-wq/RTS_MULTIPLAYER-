
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { buildings as buildingData } from './data/buildings';
import { items as itemData } from './data/items';
import { Building, MapResource, BuildingType, PlacedBuilding, VisualEffect, DestructionInfo, Item, MarketListing, Clan, HistoryEntry, UserProfile } from './types';
import { CloseIcon, EnergyIcon, UserIcon, ResidentialIcon, BusinessIcon, LettersIcon, GreeneryIcon, RoadsIcon, WallsIcon, FactoriesIcon, MonstersIcon, ClanIcon, GiftsIcon, InventoryIcon, MoveIcon, ShoppingCartIcon, RepairIcon, DefenseIcon, HomeIcon, ChevronUpIcon, ChevronDownIcon, SellIcon, ShieldIcon, MapIcon, CoinIcon, CompassIcon, SmileyIcon, TradeIcon, SearchIcon } from './components/IconComponents';
import { saveUserProfile, loadUserProfile, userExists, getAllOtherBuildings } from './services/storageService';

// Constants
const ZOOM_LEVELS = [1, 1.5, 2, 2.5, 3];
const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
const PLAYER_COLORS = ['#4299E1', '#F56565', '#48BB78', '#ECC94B'];
const WORLD_WIDTH_TILES = 200;
const WORLD_HEIGHT_TILES = 200;
const ZONES_X = 5;
const ZONES_Y = 5;
const ZONE_SIZE = 40; // 40x40 tiles per zone to make 200x200 total
const TREE_HP = 3;
const GOLD_PER_CHOP = 666665;
const NUM_TREES = 1800; // Increased density
const MAX_OIL_DEPOSITS = 10;
const MAX_CHESTS = 5;
const MAX_QUARRIES = 10;
const MAX_WILD_MONSTERS = 10;
const BASE_GOLD_CAPACITY = 5000000;
const TOWN_HALL_ID = 301;
const PROTECTED_TOWER_ID = 702;
const CLAN_CASTLE_ID = 800;
const WATCHTOWER_ID = 801;
const FINANCIAL_INTELLIGENCE_ID = 340;
const OIL_RIG_ID = 606;
const WILD_QUARRY_ID = 610;
const KILLING_HUT_ID = 70001;
const KIND_SANTA_ID = 70002;
const GORYNYCH_ID = 70003;
const MOUNTAIN_ID = 50005;
const MAX_MOUNTAINS = 250;
const RIVER_ID = 50004;
const MAX_RIVERS = 250;
const MARKET_ID = 315;
const MILITARY_MARKET_ID = 316;
const BASE_MAX_ENERGY = 500;
const ENERGY_COST_PER_CHOP = 1;
const ENERGY_REGEN_PER_MINUTE = 2;
const GLORY_PER_CHOP = 2;
const MAX_LEVEL = 30;
const TREE_RESPAWN_TIME = 5000; // 5 seconds
const UPGRADE_EFFECT_DURATION = 1000; // 1 second
const WOOD_ITEM_ID = 10001;
const FIRECRACKER_ID = 10013;
const TREASURE_CHEST_ID = 10000;
const STONE_ITEM_ID = 10005;
const RECOMMENDATION_ID = 10032;
const AUCTION_ID = 311;
const MOVE_ENERGY_COST = 30;
const MOUNTAIN_MOVE_COST = 1200;
const SHOUT_COST_GOLD = 1300;
const SHOUT_COST_ENERGY = 60;
const LOCATION_SHARE_COOLDOWN = 60000; // 1 minute
const MILITARY_ITEM_IDS = [10010, 10011, 10012, 10013, 10015, 10016, 10017, 10042, 10043];
const MAX_REPUTATION = 950;
const PROTECTION_IMAGE_URL = 'https://i.ibb.co/5gbWdk4N/337.png';

const PROTECTION_OPTIONS = [
    { cost: 2, duration: 10 * 60 * 60 * 1000, label: 'На 10 часов' },
    { cost: 4, duration: 24 * 60 * 60 * 1000, label: 'На 1 сутки' },
    { cost: 6, duration: 3 * 24 * 60 * 60 * 1000, label: 'На 3 суток' },
    { cost: 8, duration: 8 * 24 * 60 * 60 * 1000, label: 'На 8 суток' },
    { cost: 10, duration: 32 * 24 * 60 * 60 * 1000, label: 'На 32 суток' },
];

const BAN_OPTIONS = [
    { label: 'Забанить на 1 минуту', cost: 9000, durationMinutes: 1 },
    { label: 'Забанить на 5 минут', cost: 15000, durationMinutes: 5 },
    { label: 'Забанить на 30 минут', cost: 25000, durationMinutes: 30 },
    { label: 'Забанить на час', cost: 45000, durationMinutes: 60 },
    { label: 'Забанить на сутки', cost: 100000, durationMinutes: 1440 },
];

const PUNISHMENT_OPTIONS = [
    { cost: 1, gloryPenalty: 500, label: 'Отшлепать' },
    { cost: 2, gloryPenalty: 1000, label: 'Пнуть' },
    { cost: 3, gloryPenalty: 2400, label: 'Выпороть' },
    { cost: 4, gloryPenalty: 5500, label: 'Смешать с грязью' },
    { cost: 5, gloryPenalty: 9000, label: 'Закатать в асфальт' },
];

const CURSE_OPTIONS = [
    { label: 'Жаба', cost: 4000, durationMinutes: 1, prefix: '(ква-ква-ква)' },
    { label: 'Корова', cost: 8000, durationMinutes: 2, prefix: '(мууу-мууу-муу)' },
    { label: 'Собака', cost: 12000, durationMinutes: 3, prefix: '(гав-гав)' },
    { label: 'Свинья', cost: 16000, durationMinutes: 4, prefix: '(хрю-хрю)' },
    { label: 'Барашек', cost: 20000, durationMinutes: 5, prefix: '(бе-бе-бе)' },
];

const MOCK_USER_LEVELS: Record<string, number> = {
    'Nagibator2000': 5,
    'Elf80': 2,
    'CraftMaster': 10,
    'SteamLover': 2,
    'RelaxGuy': 1,
    'GoldFinder': 15,
    'LuckyOne': 7,
    'ClanLeader': 30,
    'Teammate': 3,
    'WarLord': 20,
    'GeneralZod': 25
};

// Kolobok / Classic style emojis
const KOLOBOK_EMOJIS = [
    { code: ':)', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/smile.gif' },
    { code: ':(', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/sad.gif' },
    { code: ';)', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/wink.gif' },
    { code: ':D', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/biggrin.gif' },
    { code: ':P', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/beee.gif' },
    { code: ':cool:', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/dirol.gif' },
    { code: ':crazy:', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/crazy.gif' },
    { code: ':mad:', url: 'https://i.ibb.co/gZ3Fx7Sz/aggressive.gif' },
    { code: ':blush:', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/blush.gif' },
    { code: ':rofl:', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/rofl.gif' },
    { code: ':ok:', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/ok.gif' },
    { code: ':hi:', url: 'https://raw.githubusercontent.com/walfas/kolobok/master/smiles/standart/hello.gif' }
];


type BuildMenuTab = 'Жилые' | 'Бизнес' | 'Буквы' | 'Зелень' | 'Дороги и стены' | 'Заводы' | 'Монстры' | 'Клан' | 'Подарки' | 'Защита';
type ChatTab = 'general' | 'banya' | 'loot' | 'clan';
type ProfileTab = 'info' | 'clan' | 'history' | 'friends' | 'mail' | 'private';
type MarketTab = 'buy' | 'sell';
type AuthMode = 'welcome' | 'login' | 'register' | null;

interface ChatMessage {
    id: number;
    sender: string;
    text: string;
    type: 'normal' | 'shout' | 'system';
    timestamp: number;
    tab: ChatTab | 'all';
    teleportCoordinates?: { x: number, y: number };
}

interface Friend {
    name: string;
    addedAt: number;
}

// Image assets
const treeImageUrl = 'https://i.ibb.co/q8h28yZ/5258156108210180005.png';
const groundTileImageUrl = 'https://i.ibb.co/V0qbnsYP/IMG-2378.png';
const coinImageUrl = 'https://i.ibb.co/gbbMMZ21/coin-1.png';
const gloryImageUrl = 'https://i.ibb.co/jZPDbP9W/slav.png';
const rubyImageUrl = 'https://i.ibb.co/qFC6RQ8P/ruby.png';
const populationImageUrl = 'https://i.ibb.co/5XWZdqnh/gn1.png';
const oilImageUrl = 'https://i.ibb.co/bMhPjZVp/30000.png';
const chestImageUrl = 'https://i.ibb.co/9kRL4JWP/10000.png';
const quarryImageUrl = 'https://i.ibb.co/Pvj6y4ZS/30001.png';
const builderIconUrl = 'https://i.ibb.co/8g87qFfv/gn1-1.png';
const level1IconUrl = 'https://i.ibb.co/nNvw3ND1/ur1.png';
const level2IconUrl = 'https://i.ibb.co/HDjFb8Mk/ur2.png';
const loadingIconUrl = 'https://i.ibb.co/Q7Cq6tcL/009-s.png';

const ConstructionTimer = ({ endTime, cost, onSpeedUp }: { endTime: number, cost: number, onSpeedUp: () => void }) => {
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const timeLeft = Math.max(0, endTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) return null;

    return (
        <div className="mt-2 p-2 bg-gray-900/40 rounded border border-blue-500/20">
             <div className="flex items-center space-x-2 mb-1">
                 <span className="text-white font-mono font-bold text-lg">⏳ {timeString}</span>
                 <div className="flex items-center bg-gray-800 px-2 py-0.5 rounded text-pink-400 font-bold border border-pink-500/30">
                     <img src={rubyImageUrl} className="w-4 h-4 mr-1 object-contain" alt="ruby"/>
                     {cost}
                 </div>
             </div>
             <button 
                 onClick={onSpeedUp}
                 className="text-xs text-purple-300 hover:text-white underline hover:no-underline transition-colors text-left"
             >
                 Построить мгновенно или ускорить за рубины
             </button>
        </div>
    );
};

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraOffset, setCameraOffset] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 4 });
  const [zoomIndex, setZoomIndex] = useState(2); // Corresponds to 1.0 zoom
  const [placedBuildings, setPlacedBuildings] = useState<PlacedBuilding[]>([]);
  const [mapResources, setMapResources] = useState<MapResource[]>([]);
  const [tooltip, setTooltip] = useState<{ visible: boolean, x: number, y: number, content: React.ReactNode | null }>({ visible: false, x: 0, y: 0, content: null });
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  
  // Auth State
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');
  const [currentUser, setCurrentUser] = useState<string>('guest');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '' });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [buildMenu, setBuildMenu] = useState<{visible: boolean, x: number, y: number}>({ visible: false, x: 0, y: 0});
  const [activeBuildTab, setActiveBuildTab] = useState<BuildMenuTab>('Жилые');
  const [selectedBuilding, setSelectedBuilding] = useState<{ building: PlacedBuilding, info: Building } | null>(null);
  const [showExplosionMenu, setShowExplosionMenu] = useState(false);
  const [showProtectionMenu, setShowProtectionMenu] = useState(false);
  const [buildConfirmation, setBuildConfirmation] = useState<{ visible: boolean, building: Building | null, x: number, y: number }>({ visible: false, building: null, x: 0, y: 0 });
  const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([]);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [moveMode, setMoveMode] = useState<{ active: boolean, building: PlacedBuilding | null }>({ active: false, building: null });
  const [selectedOilDeposit, setSelectedOilDeposit] = useState<MapResource | null>(null);
  const [selectedQuarry, setSelectedQuarry] = useState<MapResource | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState(1);
  const [playerHistory, setPlayerHistory] = useState<HistoryEntry[]>([]);

  // Market State
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [activeMarketTab, setActiveMarketTab] = useState<MarketTab>('buy');
  const [marketType, setMarketType] = useState<'general' | 'military'>('general');
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [sellItemSelection, setSellItemSelection] = useState<{itemId: number | null, amount: number, price: number, currency: 'coins' | 'rubies'}>({
      itemId: null, amount: 1, price: 10, currency: 'coins'
  });

  // Clan State
  const [clans, setClans] = useState<Clan[]>([
      { id: 1, name: 'Admins', description: 'Official Game Admins Clan', avatarUrl: null, leaderName: 'Admin', membersCount: 3 },
      { id: 2, name: 'Warriors', description: 'We fight for glory!', avatarUrl: null, leaderName: 'WarLord', membersCount: 15 }
  ]);
  const [playerClanId, setPlayerClanId] = useState<number | null>(null);
  const [showCreateClanMode, setShowCreateClanMode] = useState(false);
  const [showLeaveClanConfirmation, setShowLeaveClanConfirmation] = useState(false);
  const [newClanName, setNewClanName] = useState('');
  const [newClanDesc, setNewClanDesc] = useState('');
  const [newClanAvatar, setNewClanAvatar] = useState<string | null>(null);
  const [clanSearchTerm, setClanSearchTerm] = useState('');

  // Player stats state
  const [playerGold, setPlayerGold] = useState(100);
  const [clanBankBalance, setClanBankBalance] = useState(0);
  const [playerRubies, setPlayerRubies] = useState(100);
  const [goldCapacity, setGoldCapacity] = useState(BASE_GOLD_CAPACITY);
  const [playerEnergy, setPlayerEnergy] = useState(BASE_MAX_ENERGY);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerGlory, setPlayerGlory] = useState(0);
  const [playerReputation, setPlayerReputation] = useState(0);
  
  // New state to track reputation for all users
  const [userReputations, setUserReputations] = useState<Record<string, number>>({
      'Nagibator2000': 150,
      'Elf80': -10,
      'CraftMaster': 500,
      'ClanLeader': 900,
      'GeneralZod': 200
  });

  const [userGloryAdjustments, setUserGloryAdjustments] = useState<Record<string, number>>({});

  // Friends State
  const [friends, setFriends] = useState<Friend[]>([]);

  const [playerName, setPlayerName] = useState("Игрок 1");
  const [tempPlayerName, setTempPlayerName] = useState(playerName);
  const [playerGender, setPlayerGender] = useState<'male' | 'female' | null>(null);
  const [playerAvatar, setPlayerAvatar] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Record<number, number>>({ [FIRECRACKER_ID]: 30, [RECOMMENDATION_ID]: 5 }); // Added recommendations for testing
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('info');
  const [banEndTime, setBanEndTime] = useState(0);
  
  // Chat State
  const [chatOpen, setChatOpen] = useState(true);
  const [activeChatTab, setActiveChatTab] = useState<ChatTab>('general');
  const [chatInput, setChatInput] = useState('');
  const [showShoutModal, setShowShoutModal] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      { id: 1, sender: 'Система', text: 'Добро пожаловать в игру!', type: 'system', timestamp: Date.now(), tab: 'general' },
      { id: 2, sender: 'Система', text: 'Здесь будут отображаться ваши находки.', type: 'system', timestamp: Date.now(), tab: 'loot' }
  ]);
  const [lastLocationShareTime, setLastLocationShareTime] = useState<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [showBanMenu, setShowBanMenu] = useState(false);
  const [showPunishMenu, setShowPunishMenu] = useState(false);
  const [showCurseMenu, setShowCurseMenu] = useState(false);
  const [activeCurses, setActiveCurses] = useState<Record<string, { prefix: string, endTime: number }>>({});


  // Initialize online users with mock data and the current player
  const [onlineUsers, setOnlineUsers] = useState<Record<ChatTab, string[]>>({
      general: ['Nagibator2000', 'Elf80', 'CraftMaster', playerName],
      banya: ['SteamLover', 'RelaxGuy'],
      loot: ['GoldFinder', 'LuckyOne'],
      clan: ['ClanLeader', 'Teammate']
  });
  
  // Update playerReputation when userReputations changes for self
  useEffect(() => {
      if (userReputations[playerName] !== undefined) {
          setPlayerReputation(userReputations[playerName]);
      } else {
           // Init self
           setUserReputations(prev => ({...prev, [playerName]: 0}));
      }
  }, [playerName, userReputations]);

  // Use refs to hold current state for interval logic to avoid resetting timers on state change
  const placedBuildingsRef = useRef(placedBuildings);
  const mapResourcesRef = useRef(mapResources);

  useEffect(() => {
    placedBuildingsRef.current = placedBuildings;
  }, [placedBuildings]);

  useEffect(() => {
    mapResourcesRef.current = mapResources;
  }, [mapResources]);

  // Initial Market Listings
  useEffect(() => {
      setMarketListings([
          { id: 1, sellerName: 'Elf80', resourceId: 10001, amount: 50, price: 1000, currency: 'coins', isPlayer: false },
          { id: 2, sellerName: 'CraftMaster', resourceId: 10002, amount: 20, price: 500, currency: 'coins', isPlayer: false },
          { id: 3, sellerName: 'Nagibator2000', resourceId: 10005, amount: 100, price: 1, currency: 'rubies', isPlayer: false },
          { id: 4, sellerName: 'GoldFinder', resourceId: 10006, amount: 10, price: 2000, currency: 'coins', isPlayer: false },
          { id: 5, sellerName: 'WarLord', resourceId: 10013, amount: 100, price: 5000, currency: 'coins', isPlayer: false },
          { id: 6, sellerName: 'GeneralZod', resourceId: 10016, amount: 1, price: 100, currency: 'rubies', isPlayer: false },
      ]);
  }, []);

  // --- AUTH & STORAGE LOGIC START ---

  const saveCurrentData = useCallback(() => {
     if (currentUser && currentUser !== 'guest') {
        const existingProfile = loadUserProfile(currentUser);
        // CRITICAL: Only save MY buildings to MY profile. 
        const myBuildings = placedBuildings.filter(b => b.ownerId === 0);

        const profile: UserProfile = {
            username: currentUser,
            password: existingProfile?.password,
            buildings: myBuildings,
            mapResources: mapResources,
            gold: playerGold,
            rubies: playerRubies,
            energy: playerEnergy,
            level: playerLevel,
            glory: playerGlory,
            reputation: playerReputation,
            inventory: inventory,
            gender: playerGender,
            avatar: playerAvatar,
            clanId: playerClanId,
            history: playerHistory,
            friends: friends
        };
        saveUserProfile(profile);
     }
  }, [currentUser, placedBuildings, mapResources, playerGold, playerRubies, playerEnergy, playerLevel, playerGlory, playerReputation, inventory, playerGender, playerAvatar, playerClanId, playerHistory, friends]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentData();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveCurrentData]);

  const handleLogout = () => {
    saveCurrentData();

    setPlacedBuildings([]);
    setMapResources([]);
    setPlayerGold(100);
    setPlayerRubies(100);
    setPlayerEnergy(BASE_MAX_ENERGY);
    setPlayerLevel(1);
    setPlayerGlory(0);
    setPlayerName("Игрок 1");
    setPlayerAvatar(null);
    setPlayerGender(null);
    setInventory({ [FIRECRACKER_ID]: 30, [RECOMMENDATION_ID]: 5 });
    setPlayerHistory([]);
    setFriends([]);
    setCurrentUser('guest');
    
    setShowProfileModal(false);
    setAuthMode('welcome');
  };

  const loadUserToState = (profile: UserProfile) => {
      // 1. Load my buildings
      const myBuildings = profile.buildings || [];
      
      // 2. Load other players' buildings
      const otherBuildings = getAllOtherBuildings(profile.username);
      
      // 3. Merge them for the view
      setPlacedBuildings([...otherBuildings, ...myBuildings]);

      // Load user specific data
      setPlayerGold(profile.gold);
      setPlayerRubies(profile.rubies);
      setPlayerEnergy(profile.energy);
      setPlayerLevel(profile.level);
      setPlayerGlory(profile.glory);
      setPlayerReputation(profile.reputation);
      setPlayerName(profile.username); // Use username as display name for simplicity
      setTempPlayerName(profile.username);
      setPlayerGender(profile.gender);
      setPlayerAvatar(profile.avatar);
      setInventory(profile.inventory || {});
      setPlayerClanId(profile.clanId);
      setPlayerHistory(profile.history || []);
      setFriends(profile.friends || []);
      
      // If map resources were saved, load them, otherwise generate
      if (profile.mapResources && profile.mapResources.length > 0) {
          setMapResources(profile.mapResources);
      } else {
          // Initial tree generation if map is empty
          const newTrees: MapResource[] = [];
          const occupied = new Set<string>();
          for (let i = 0; i < NUM_TREES; i++) {
              const x = Math.floor(Math.random() * WORLD_WIDTH_TILES);
              const y = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
              const key = `${x},${y}`;
              if (!occupied.has(key)) {
                  newTrees.push({ x, y, hp: TREE_HP, type: 'tree' });
                  occupied.add(key);
              }
          }
          setMapResources(newTrees);
      }
      
      setCurrentUser(profile.username);
      setAuthMode(null);
  };

  const handleLogin = () => {
      if (!loginForm.username) return alert("Введите имя пользователя");
      const profile = loadUserProfile(loginForm.username);
      
      if (!profile) {
          alert("Пользователь не найден");
          return;
      }
      if (profile.password && profile.password !== loginForm.password) {
          alert("Неверный пароль");
          return;
      }
      
      loadUserToState(profile);
  };

  const handleRegister = () => {
      if (!registerForm.username) return alert("Введите имя пользователя");
      if (userExists(registerForm.username)) {
          alert("Пользователь уже существует");
          return;
      }
      
      const newProfile: UserProfile = {
          username: registerForm.username,
          password: registerForm.password,
          buildings: [],
          mapResources: [], // New users start with empty map (will generate on load)
          gold: 100,
          rubies: 100,
          energy: BASE_MAX_ENERGY,
          level: 1,
          glory: 0,
          reputation: 0,
          inventory: { [FIRECRACKER_ID]: 5 },
          gender: null,
          avatar: null,
          clanId: null,
          history: [],
          friends: []
      };
      
      saveUserProfile(newProfile);
      loadUserToState(newProfile);
  };

  const handleGuestStart = () => {
    // Even guests should see the world!
    const otherBuildings = getAllOtherBuildings('guest');
    setPlacedBuildings(otherBuildings);
    
    // Generate basic resources
    const newTrees: MapResource[] = [];
    const occupied = new Set<string>();
    for (let i = 0; i < NUM_TREES; i++) {
        const x = Math.floor(Math.random() * WORLD_WIDTH_TILES);
        const y = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
        const key = `${x},${y}`;
        if (!occupied.has(key)) {
            newTrees.push({ x, y, hp: TREE_HP, type: 'tree' });
            occupied.add(key);
        }
    }
    setMapResources(newTrees);

    setPlayerGold(100);
    setPlayerRubies(100);
    setPlayerEnergy(BASE_MAX_ENERGY);
    setCurrentUser('guest');
    setAuthMode(null);
  };

  // --- AUTH & STORAGE LOGIC END ---

  const addHistoryLog = (message: string, type: HistoryEntry['type']) => {
      setPlayerHistory(prev => [{
          id: Date.now(),
          message,
          timestamp: Date.now(),
          type
      }, ...prev]);
  };

  const getUserLevel = useCallback((name: string) => {
      if (name === playerName) return playerLevel;
      return MOCK_USER_LEVELS[name] || 1;
  }, [playerName, playerLevel]);

  const getUserGlory = useCallback((name: string) => {
      if (name === playerName) return playerGlory;
      const level = MOCK_USER_LEVELS[name] || 1;
      const baseGlory = level * 100 + (name.length * 10);
      const adjustment = userGloryAdjustments[name] || 0;
      return Math.max(0, baseGlory + adjustment);
  }, [playerName, playerGlory, userGloryAdjustments]);

  const handleChatUserClick = (userName: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedChatUser(userName);
      setShowBanMenu(false);
      setShowPunishMenu(false);
      setShowCurseMenu(false);
  };
  
  const handleReputationAction = (type: 'praise' | 'complain') => {
      if (!selectedChatUser) return;
      
      const userRecs = inventory[RECOMMENDATION_ID] || 0;
      if (userRecs < 1) {
          alert("У вас нет Рекомендаций!");
          return;
      }

      setInventory(prev => ({
          ...prev,
          [RECOMMENDATION_ID]: (prev[RECOMMENDATION_ID] || 0) - 1
      }));

      setUserReputations(prev => {
          const currentRep = prev[selectedChatUser] || 0;
          const newRep = type === 'praise' ? currentRep + 1 : currentRep - 1;
          const clampedRep = Math.min(MAX_REPUTATION, newRep);
          
          return {
              ...prev,
              [selectedChatUser]: clampedRep
          };
      });

      const actionText = type === 'praise' ? 'похвалили' : 'пожаловались на';
      addHistoryLog(`Вы ${actionText} игрока ${selectedChatUser}. Потрачена 1 Рекомендация.`, 'social');
      alert(`Вы успешно ${type === 'praise' ? 'похвалили' : 'пожаловались на'} игрока!`);
  };

  const getLevelIcon = useCallback((level: number) => {
      return level >= 2 ? level2IconUrl : level1IconUrl;
  }, []);

  const maxEnergy = useMemo(() => {
      return BASE_MAX_ENERGY + ((playerLevel - 1) * 50);
  }, [playerLevel]);

  const isBanned = useCallback(() => {
      return Date.now() < banEndTime;
  }, [banEndTime]);

  // Force switch to 'banya' tab if banned
  useEffect(() => {
      if (isBanned() && activeChatTab !== 'banya') {
          setActiveChatTab('banya');
      }
  }, [banEndTime, activeChatTab, isBanned]);

  const currentPopulation = useMemo(() => {
    return placedBuildings
        .filter(b => b.ownerId === 0)
        .reduce((sum, b) => {
            const buildingInfo = buildingData.find(bd => bd.id === b.buildingId);
            if (!buildingInfo) return sum;

            if (b.isConstructing) {
                return sum + (buildingInfo.constructionRequirements.population || 0);
            }

            if (!buildingInfo.stats.workTimeSeconds) {
                return sum + (buildingInfo.stats.takesPopulation || 0);
            }
            if (b.workState === 'working' || b.workState === 'finished') {
                return sum + (buildingInfo.stats.takesPopulation || 0);
            }
            return sum;
        }, 0);
  }, [placedBuildings]);

  const maxPopulation = useMemo(() => {
     return placedBuildings
        .filter(b => b.ownerId === 0 && (b.type === BuildingType.Residential || b.type === BuildingType.TownHall) && !b.isConstructing)
        .reduce((sum, b) => {
            const buildingInfo = buildingData.find(bd => bd.id === b.buildingId);
            return sum + (buildingInfo?.stats.populationBonus || 0);
        }, 0);
  }, [placedBuildings]);

  const isInClan = useMemo(() => playerClanId !== null, [playerClanId]);
  
  const hasClanCastle = useMemo(() => {
      return placedBuildings.some(b => b.buildingId === CLAN_CASTLE_ID && b.ownerId === 0 && !b.isConstructing);
  }, [placedBuildings]);
  
  const hasFinancialIntelligence = useMemo(() => {
      return placedBuildings.some(b => [340, 341, 342].includes(b.buildingId) && b.ownerId === 0 && !b.isConstructing);
  }, [placedBuildings]);

  const hasAdvancedFinancialIntelligence = useMemo(() => {
      return placedBuildings.some(b => [341, 342].includes(b.buildingId) && b.ownerId === 0 && !b.isConstructing);
  }, [placedBuildings]);
  
  const oilRigInfo = useMemo(() => buildingData.find(b => b.id === OIL_RIG_ID), []);
  const wildQuarryInfo = useMemo(() => buildingData.find(b => b.id === WILD_QUARRY_ID), []);

  // Update online users when player name changes
  useEffect(() => {
      setOnlineUsers(prev => {
          const cleanedUsers: Record<ChatTab, string[]> = {
              general: prev.general.filter(n => n !== playerName),
              banya: prev.banya.filter(n => n !== playerName),
              loot: prev.loot.filter(n => n !== playerName),
              clan: prev.clan.filter(n => n !== playerName)
          };
          
          cleanedUsers[activeChatTab].push(playerName);
          return cleanedUsers;
      });
  }, [playerName]);

  // Refs for drag logic
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  const getCanvasContext = (): [HTMLCanvasElement, CanvasRenderingContext2D] | [null, null] => {
    const canvas = canvasRef.current;
    if (!canvas) return [null, null];
    const context = canvas.getContext('2d');
    if (!context) return [null, null];
    return [canvas, context];
  }

  // Isometric coordinate conversion
  const worldToScreen = useCallback((x: number, y: number, zoom: number): { screenX: number, screenY: number } => {
    const screenX = (x - y) * (TILE_WIDTH * zoom / 2);
    const screenY = (x + y) * (TILE_HEIGHT * zoom / 2);
    return { screenX, screenY };
  }, []);

  const screenToWorld = useCallback((screenX: number, screenY: number, zoom: number): { x: number, y: number } => {
    const adjustedX = screenX - cameraOffset.x;
    const adjustedY = screenY - cameraOffset.y;
    const scaledTileWidth = TILE_WIDTH * zoom;
    const scaledTileHeight = TILE_HEIGHT * zoom;
    const x = Math.floor((adjustedX / (scaledTileWidth / 2) + adjustedY / (scaledTileHeight / 2)) / 2);
    const y = Math.floor((adjustedY / (scaledTileHeight / 2) - adjustedX / (scaledTileWidth / 2)) / 2);
    return { x, y };
  }, [cameraOffset]);


  // Preload images
  useEffect(() => {
    const allImageUrls = [
        ...buildingData.map(b => b.imageUrl),
        treeImageUrl,
        oilImageUrl,
        chestImageUrl,
        quarryImageUrl,
        groundTileImageUrl,
        coinImageUrl,
        gloryImageUrl,
        rubyImageUrl,
        populationImageUrl,
        builderIconUrl,
        level1IconUrl,
        level2IconUrl,
        loadingIconUrl,
        PROTECTION_IMAGE_URL
    ];
    const uniqueUrls = [...new Set(allImageUrls)];
    const loadedImages: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const totalImages = uniqueUrls.length;

    if (totalImages === 0) {
        setImages({});
        return;
    }

    uniqueUrls.forEach(url => {
        if(!url) {
          loadedCount++;
          if (loadedCount === totalImages) {
                setImages(loadedImages);
            }
          return;
        };
        const img = new Image();
        img.src = url;
        img.onload = () => {
            loadedImages[url] = img;
            loadedCount++;
            if (loadedCount === totalImages) {
                setImages(loadedImages);
            }
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          loadedCount++;
           if (loadedCount === totalImages) {
                setImages(loadedImages);
            }
        }
    });
  }, []);
  
  const getGloryForLevel = useCallback((level: number) => {
    if (level === 1) return 911;
    return 50 + (level - 1) * 50;
  }, []);

  const hasTownHall = useMemo(() => placedBuildings.some(b => b.type === BuildingType.TownHall && b.ownerId === 0), [placedBuildings]);
  const townHallLocation = useMemo(() => {
      const th = placedBuildings.find(b => b.type === BuildingType.TownHall && b.ownerId === 0);
      return th ? { x: th.x, y: th.y } : null;
  }, [placedBuildings]);

  const maxBuildings = useMemo(() => {
    return placedBuildings
        .filter(b => b.ownerId === 0)
        .reduce((total, b) => {
            const buildingInfo = buildingData.find(bd => bd.id === b.buildingId);
            return total + (buildingInfo?.stats.permits || 0);
        }, 0);
  }, [placedBuildings]);

  const isUserOnline = (name: string) => {
      if (name === playerName) return true;
      return (Object.values(onlineUsers) as string[][]).some(list => list.includes(name));
  };

  const handleAddFriend = () => {
      if (!selectedChatUser) return;
      if (selectedChatUser === playerName) {
          alert("Вы не можете добавить самого себя в друзья.");
          return;
      }
      if (friends.some(f => f.name === selectedChatUser)) {
          alert("Этот игрок уже в вашем списке друзей.");
          return;
      }
      
      setFriends(prev => [...prev, { name: selectedChatUser, addedAt: Date.now() }]);
      addHistoryLog(`Пользователь ${selectedChatUser} добавлен в друзья.`, 'social');
      alert(`Пользователь ${selectedChatUser} добавлен в друзья!`);
      setSelectedChatUser(null);
  };

  const handleRemoveFriend = (friendName: string) => {
      setFriends(prev => prev.filter(f => f.name !== friendName));
      addHistoryLog(`Пользователь ${friendName} удален из друзей.`, 'social');
  };

  const handlePunishPlayer = (cost: number, penalty: number, actionName: string) => {
      if (playerRubies < cost) {
          alert("Недостаточно рубинов!");
          return;
      }
      
      setPlayerRubies(prev => prev - cost);
      
      if (selectedChatUser) {
          if (selectedChatUser === playerName) {
               setPlayerGlory(prev => Math.max(0, prev - penalty));
          } else {
               setUserGloryAdjustments(prev => ({
                   ...prev,
                   [selectedChatUser!]: (prev[selectedChatUser!] || 0) - penalty
               }));
          }
          addHistoryLog(`Вы наказали игрока ${selectedChatUser}: ${actionName}. Потрачено ${cost} рубинов.`, 'social');
          alert(`Игрок ${selectedChatUser} потерял ${penalty} славы!`);
      }

      setShowPunishMenu(false);
      setSelectedChatUser(null);
  };

  const handleCursePlayer = (cost: number, durationMinutes: number, prefix: string, animalName: string) => {
      if (playerGold < cost) {
          alert(`Недостаточно золота! Требуется ${cost.toLocaleString()} монет.`);
          return;
      }

      setPlayerGold(prev => prev - cost);
      
      if (selectedChatUser) {
          setActiveCurses(prev => ({
              ...prev,
              [selectedChatUser]: {
                  prefix,
                  endTime: Date.now() + durationMinutes * 60 * 1000
              }
          }));

          addHistoryLog(`Вы заколдовали игрока ${selectedChatUser} в "${animalName}". Потрачено ${cost} монет.`, 'social');
          alert(`Игрок ${selectedChatUser} успешно заколдован!`);
      }
      
      setShowCurseMenu(false);
      setSelectedChatUser(null);
  };

  // Draw function
  const draw = useCallback(() => {
    const [canvas, context] = getCanvasContext();
    if (!canvas || !context) return;
    
    const zoom = ZOOM_LEVELS[zoomIndex];
    const scaledTileWidth = TILE_WIDTH * zoom;
    const scaledTileHeight = TILE_HEIGHT * zoom;

    context.fillStyle = '#1A202C';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(cameraOffset.x, cameraOffset.y);
    
    // Draw ground tiles
    const groundImg = images[groundTileImageUrl];
    if (groundImg) {
      for (let i = 0; i < WORLD_WIDTH_TILES; i++) {
        for (let j = 0; j < WORLD_HEIGHT_TILES; j++) {
          const { screenX, screenY } = worldToScreen(i, j, zoom);
          
          if (
            screenX + scaledTileWidth / 2 < -cameraOffset.x ||
            screenX - scaledTileWidth / 2 > canvas.width - cameraOffset.x ||
            screenY + scaledTileHeight / 2 < -cameraOffset.y ||
            screenY - scaledTileHeight / 2 > canvas.height - cameraOffset.y
          ) {
            continue;
          }

          context.save();
          context.beginPath();
          context.moveTo(screenX, screenY - scaledTileHeight / 2); 
          context.lineTo(screenX + scaledTileWidth / 2, screenY);
          context.lineTo(screenX, screenY + scaledTileHeight / 2);
          context.lineTo(screenX - scaledTileWidth / 2, screenY);
          context.closePath();
          context.clip();

          context.drawImage(
            groundImg,
            screenX - scaledTileWidth / 2,
            screenY - scaledTileHeight / 2,
            scaledTileWidth,
            scaledTileHeight
          );
          context.restore();
        }
      }
    }
    
    const drawableEntities = [
        ...mapResources.map(r => ({...r, entityType: 'resource'})),
        ...placedBuildings.map(b => ({...b, entityType: 'building'}))
    ];

    drawableEntities.sort((a, b) => (a.x + a.y) - (b.x + b.y));

    drawableEntities.forEach(entity => {
        const { screenX, screenY } = worldToScreen(entity.x, entity.y, zoom);
        
        if (
          screenX + scaledTileWidth / 2 < -cameraOffset.x ||
          screenX - scaledTileWidth / 2 > canvas.width - cameraOffset.x ||
          screenY < -cameraOffset.y - scaledTileHeight * 4 || 
          screenY - scaledTileHeight > canvas.height - cameraOffset.y
        ) {
          return;
        }

        let img: HTMLImageElement | undefined;
        let color: string = 'blue';
        let buildingInfo: Building | undefined;

        if (entity.entityType === 'resource') {
            if (entity.type === 'tree') {
                img = images[treeImageUrl];
                color = 'green';
            } else if (entity.type === 'oil') {
                img = images[oilImageUrl];
                color = 'black';
            } else if (entity.type === 'chest') {
                img = images[chestImageUrl];
                color = 'gold';
            } else if (entity.type === 'quarry') {
                img = images[quarryImageUrl];
                color = 'gray';
            }
        } else if (entity.entityType === 'building' && 'buildingId' in entity) {
             buildingInfo = buildingData.find(b => b.id === entity.buildingId);
             const isProtected = entity.protectionEndTime && entity.protectionEndTime > Date.now();
             
             if (isProtected) {
                img = images[PROTECTION_IMAGE_URL];
                color = PLAYER_COLORS[entity.ownerId] || 'blue';
             } else if (buildingInfo) {
                img = images[buildingInfo.imageUrl];
                color = PLAYER_COLORS[entity.ownerId] || 'blue';
                if (entity.ownerId === -1) color = '#E53E3E';
            }
        }
        
        const aspectRatio = img ? img.height / img.width : 1.5;
        const imageScaledWidth = scaledTileWidth * 0.9;
        const imageScaledHeight = imageScaledWidth * aspectRatio;

        const drawX = screenX - imageScaledWidth / 2;
        const drawY = screenY + (scaledTileHeight / 2) - imageScaledHeight;


        if (img) {
            context.globalAlpha = ('isConstructing' in entity && entity.isConstructing) ? 0.6 : 1.0;
            context.drawImage(img, drawX, drawY, imageScaledWidth, imageScaledHeight);
            context.globalAlpha = 1.0;
        } else {
            context.fillStyle = color;
            context.beginPath();
            context.moveTo(screenX, screenY - scaledTileHeight / 2);
            context.lineTo(screenX + scaledTileWidth / 2, screenY);
            context.lineTo(screenX, screenY + scaledTileHeight / 2);
            context.lineTo(screenX - scaledTileWidth / 2, screenY);
            context.closePath();
            context.fill();
        }
        
        if ('buildingId' in entity && buildingInfo) {
            const now = Date.now();
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            context.font = `bold ${12 * zoom}px sans-serif`;

            const hp = entity.hp;
            const maxHp = entity.maxHp || buildingInfo.stats.durability;
            
            if (buildingInfo.id !== MOUNTAIN_ID && buildingInfo.id !== RIVER_ID && hp !== undefined && hp < maxHp) {
                const barWidth = scaledTileWidth * 0.8;
                const barHeight = 6 * zoom;
                const barX = screenX - barWidth / 2;
                let barY = drawY - barHeight - (5 * zoom);
                
                if (entity.isDestroying || entity.isConstructing || (entity.workState === 'working' && entity.workEndTime)) {
                     barY -= (15 * zoom); 
                }

                context.fillStyle = 'rgba(0, 0, 0, 0.7)';
                context.fillRect(barX, barY, barWidth, barHeight);
                
                const hpPercent = Math.max(0, hp / maxHp);
                context.fillStyle = hpPercent > 0.5 ? '#48BB78' : hpPercent > 0.25 ? '#ECC94B' : '#F56565';
                context.fillRect(barX, barY, barWidth * hpPercent, barHeight);
            }

            if (entity.isDestroying && entity.destructionEndTime) {
                const timeRemaining = Math.max(0, entity.destructionEndTime - now);
                const barWidth = scaledTileWidth * 0.8;
                const barHeight = 10 * zoom;
                const barX = screenX - barWidth / 2;
                const barY = drawY - barHeight - (5 * zoom);

                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
                context.fillRect(barX, barY, barWidth, barHeight);
                context.fillStyle = '#EF4444'; 
                context.fillRect(barX, barY, barWidth * ((now % 1000)/1000), barHeight); 
                
                context.fillStyle = 'red';
                const minutes = Math.floor(timeRemaining / 60000);
                const seconds = Math.floor((timeRemaining % 60000) / 1000);
                context.fillText(`💥 ${minutes}:${seconds.toString().padStart(2, '0')}`, screenX, barY - (2 * zoom));

            } else if (entity.isConstructing) {
                const timeRemaining = Math.max(0, entity.constructionEndTime - now);
                const loadingImg = images[loadingIconUrl];

                if (loadingImg) {
                    const spinnerSize = 24 * zoom;
                    const centerX = screenX;
                    const centerY = drawY + imageScaledHeight / 2;

                    context.save();
                    context.translate(centerX, centerY);
                    context.rotate((Date.now() / 300));
                    context.drawImage(loadingImg, -spinnerSize / 2, -spinnerSize / 2, spinnerSize, spinnerSize);
                    context.restore();

                    context.textAlign = 'left';
                    context.textBaseline = 'middle';
                    context.font = `bold ${16 * zoom}px sans-serif`;
                    context.lineWidth = 4;
                    context.strokeStyle = 'black';
                    context.fillStyle = 'white';

                    const minutes = Math.floor(timeRemaining / 60000);
                    const seconds = Math.floor((timeRemaining % 60000) / 1000);
                    const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    context.strokeText(timeText, centerX + spinnerSize/2 + (2 * zoom), centerY);
                    context.fillText(timeText, centerX + spinnerSize/2 + (2 * zoom), centerY);
                } else {
                     const minutes = Math.floor(timeRemaining / 60000);
                     const seconds = Math.floor((timeRemaining % 60000) / 1000);
                     context.fillStyle = 'white';
                     context.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, screenX, drawY - (5 * zoom));
                }
            } else if (entity.workState === 'working' && entity.workEndTime) {
                const timeRemaining = Math.max(0, entity.workEndTime - now);
                const totalTime = (buildingInfo.stats.workTimeSeconds || 0) * 1000;
                const progress = totalTime > 0 ? 1 - (timeRemaining / totalTime) : 1;
                
                const barWidth = scaledTileWidth * 0.8;
                const barHeight = 10 * zoom;
                const barX = screenX - barWidth / 2;
                const barY = drawY - barHeight - (5 * zoom);

                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
                context.fillRect(barX, barY, barWidth, barHeight);
                context.fillStyle = '#F59E0B';
                context.fillRect(barX, barY, barWidth * progress, barHeight);

                context.fillStyle = 'white';
                const minutes = Math.floor(timeRemaining / 60000);
                const seconds = Math.floor((timeRemaining % 60000) / 1000);
                context.fillText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, screenX, barY - (2 * zoom));
            } else if (entity.workState === 'finished') {
                const isIntermediatePond = [400, 401, 402, 403, 404, 406, 407, 408].includes(buildingInfo.id);
                const isFinishedPond = [405, 409].includes(buildingInfo.id);

                if (isIntermediatePond) {
                    const builderImg = images[builderIconUrl];
                    if (builderImg) {
                        const iconSize = 32 * zoom;
                        const iconX = screenX - iconSize / 2;
                        const iconY = drawY - iconSize - (10 * zoom);
                        context.drawImage(builderImg, iconX, iconY, iconSize, iconSize);
                        
                        context.font = `bold ${24 * zoom}px sans-serif`;
                        context.fillStyle = 'white';
                        context.strokeStyle = 'black';
                        context.lineWidth = 3;
                        context.strokeText('1', iconX + iconSize, iconY + iconSize / 1.5);
                        context.fillText('1', iconX + iconSize, iconY + iconSize / 1.5);
                    }
                } else if (isFinishedPond) {
                   const coinImg = images[coinImageUrl];
                   if (coinImg) {
                        const iconSize = 32 * zoom;
                        const iconX = screenX - iconSize / 2;
                        const iconY = drawY - iconSize - (10 * zoom);
                        context.drawImage(coinImg, iconX, iconY, iconSize, iconSize);
                   } else {
                       context.fillStyle = '#FFD700';
                       context.fillText('$', screenX, drawY - (20 * zoom));
                   }
                } else {
                    const iconSize = 20 * zoom;
                    const boxHeight = Math.max(iconSize, 16 * zoom) + (10 * zoom);
                    const boxX = screenX - (iconSize * 1.5);
                    const boxY = drawY - boxHeight - (10 * zoom);

                    context.fillStyle = 'rgba(0,0,0,0.7)';
                    context.fillRect(boxX, boxY, iconSize * 3, boxHeight);
                    
                    context.fillStyle = '#FFD700';
                    context.fillText('Ready', screenX, boxY + (boxHeight / 1.5));
                }

            } else if (!entity.workState || entity.workState === 'idle') {
                if (buildingInfo.id === 400) {
                    const builderImg = images[builderIconUrl];
                    if (builderImg) {
                         const iconSize = 32 * zoom;
                         const iconX = screenX - iconSize; 
                         const iconY = drawY - iconSize - (10 * zoom);
                         
                         context.drawImage(builderImg, iconX, iconY, iconSize, iconSize);
                         
                         context.font = `bold ${24 * zoom}px sans-serif`;
                         context.fillStyle = 'white';
                         context.strokeStyle = 'black';
                         context.lineWidth = 3;
                         context.strokeText('1', iconX + iconSize + (5 * zoom), iconY + iconSize / 1.5);
                         context.fillText('1', iconX + iconSize + (5 * zoom), iconY + iconSize / 1.5);
                    }
                }
            }
        }
    });

    visualEffects.forEach(effect => {
        const now = Date.now();
        const elapsedTime = now - effect.startTime;
        const progress = Math.min(elapsedTime / effect.duration, 1.0);
        const { screenX, screenY } = worldToScreen(effect.x, effect.y, zoom);

        if (effect.type === 'upgrade') {
            const radius = scaledTileWidth * 0.75 * progress;
            const opacity = 1.0 - progress;
            context.beginPath();
            context.arc(screenX, screenY, radius, 0, 2 * Math.PI);
            context.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
            context.lineWidth = (4 * (1 - progress)) * zoom;
            context.stroke();
        } else if (effect.type === 'explosion') {
            const radius = scaledTileWidth * (0.5 + progress);
            const opacity = 1.0 - progress;
            context.beginPath();
            context.arc(screenX, screenY, radius, 0, 2 * Math.PI);
            context.fillStyle = `rgba(255, 69, 0, ${opacity})`;
            context.fill();
        }
    });

    if (hoveredTile) {
      const isOccupied = placedBuildings.some(b => b.x === hoveredTile.x && b.y === hoveredTile.y) || mapResources.some(r => r.x === hoveredTile.x && r.y === hoveredTile.y);
      if (!isOccupied && hasTownHall && !moveMode.active && !authMode) {
        const { screenX, screenY } = worldToScreen(hoveredTile.x, hoveredTile.y, zoom);
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = `bold ${20 * zoom}px sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Построить', screenX, screenY);
      } else if (!isOccupied && moveMode.active) {
        const { screenX, screenY } = worldToScreen(hoveredTile.x, hoveredTile.y, zoom);
        context.fillStyle = 'rgba(100, 255, 100, 0.8)';
        context.font = `bold ${20 * zoom}px sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Сюда!', screenX, screenY);
      }
    }
    
    context.restore();
  }, [cameraOffset, placedBuildings, mapResources, hoveredTile, hasTownHall, images, visualEffects, zoomIndex, worldToScreen, moveMode.active, authMode]);

  useEffect(() => {
    let animationFrameId: number;
    const gameLoop = () => {
      const now = Date.now();
      
      const buildingsToUpdate = placedBuildings.filter(b => 
        (b.isConstructing && now >= b.constructionEndTime) || 
        (b.workState === 'working' && b.workEndTime && now >= b.workEndTime) ||
        (b.isDestroying && b.destructionEndTime && now >= b.destructionEndTime)
      );
      
      const monstersMoving = placedBuildings.filter(b => {
          if (b.isConstructing || b.isDestroying) return false;
          const info = buildingData.find(i => i.id === b.buildingId);
          return info && info.stats.isMonster && (now - (b.lastMoveTime || b.constructionEndTime) >= (info.stats.moveIntervalSeconds || 120) * 1000);
      });

      if (buildingsToUpdate.length > 0 || monstersMoving.length > 0) {
          let gloryGained = 0;
          let chestsGained = 0;
          const newExplosions: VisualEffect[] = [];

          buildingsToUpdate.forEach(b => {
              if (b.isDestroying && b.destructionEndTime && now >= b.destructionEndTime) {
                   newExplosions.push({
                        id: Date.now() + Math.random(),
                        x: b.x,
                        y: b.y,
                        type: 'explosion',
                        startTime: now,
                        duration: 1000
                  });

                  const damage = b.pendingDamage || 0;
                  const currentHp = b.hp ?? 0;
                  const remainingHp = currentHp - damage;
                  
                  if (remainingHp <= 0) {
                      const buildingInfo = buildingData.find(bd => bd.id === b.buildingId);
                      if (buildingInfo) {
                          gloryGained += buildingInfo.stats.gloryOnExplosion;
                      }
                      chestsGained++;
                  }
              }
          });

          if (newExplosions.length > 0) {
              setVisualEffects(prev => [...prev, ...newExplosions]);
          }
          if (gloryGained > 0) {
            setPlayerGlory(prev => prev + gloryGained);
          }
          if (chestsGained > 0) {
            setInventory(prev => ({
                ...prev,
                [TREASURE_CHEST_ID]: (prev[TREASURE_CHEST_ID] || 0) + chestsGained
            }));
          }

          setPlacedBuildings(currentBuildings => {
              const occupiedPositions = new Set(currentBuildings.map(b => `${b.x},${b.y}`));
              mapResources.forEach(r => occupiedPositions.add(`${r.x},${r.y}`));

              const damageMap = new Map<string, number>();
              const monsterUpdates = new Map<string, PlacedBuilding>();

              const actingMonsters = currentBuildings.filter(b => {
                  const info = buildingData.find(i => i.id === b.buildingId);
                  return info && info.stats.isMonster && 
                         !b.isConstructing && !b.isDestroying && 
                         (now - (b.lastMoveTime || b.constructionEndTime) >= (info.stats.moveIntervalSeconds || 120) * 1000);
              });

              actingMonsters.forEach(monster => {
                  const monsterInfo = buildingData.find(i => i.id === monster.buildingId);
                  const neighbors = [
                      { x: monster.x + 1, y: monster.y },
                      { x: monster.x - 1, y: monster.y },
                      { x: monster.x, y: monster.y + 1 },
                      { x: monster.x, y: monster.y - 1 }
                  ];

                  const possibleTargets = currentBuildings.filter(t => 
                      neighbors.some(n => n.x === t.x && n.y === t.y) &&
                      t.ownerId !== monster.ownerId && 
                      !t.isConstructing
                  );

                  let target = possibleTargets.find(t => {
                      const info = buildingData.find(i => i.id === t.buildingId);
                      const hates = monsterInfo?.stats.hates;
                      if (hates && info?.category === hates) return true;
                      if (!hates && info?.category === 'Бизнес') return true; 
                      return false;
                  });
                  if (!target && possibleTargets.length > 0) target = possibleTargets[0];

                  if (target) {
                      const targetInfo = buildingData.find(i => i.id === target.buildingId);
                      let dmg = monsterInfo?.stats.damage ? parseInt(monsterInfo.stats.damage) : 4;
                      
                      if (monsterInfo?.stats.hates && targetInfo?.category === monsterInfo.stats.hates) {
                          dmg *= 2;
                      }

                      damageMap.set(`${target.x},${target.y}`, (damageMap.get(`${target.x},${target.y}`) || 0) + dmg);
                      monsterUpdates.set(`${monster.x},${monster.y}`, { ...monster, lastMoveTime: now });
                  } else {
                       const validMoves = neighbors.filter(move => 
                          move.x >= 0 && move.x < WORLD_WIDTH_TILES &&
                          move.y >= 0 && move.y < WORLD_HEIGHT_TILES &&
                          !occupiedPositions.has(`${move.x},${move.y}`)
                      );
                      
                      if (validMoves.length > 0) {
                           const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                           occupiedPositions.add(`${randomMove.x},${randomMove.y}`);
                           occupiedPositions.delete(`${monster.x},${monster.y}`);
                           
                           monsterUpdates.set(`${monster.x},${monster.y}`, { ...monster, x: randomMove.x, y: randomMove.y, lastMoveTime: now });
                      } else {
                           monsterUpdates.set(`${monster.x},${monster.y}`, { ...monster, lastMoveTime: now });
                      }
                  }
              });

              const nextBuildings: PlacedBuilding[] = [];

              currentBuildings.forEach(b => {
                  let updatedB = { ...b };
                  const key = `${b.x},${b.y}`;

                  if (monsterUpdates.has(key)) {
                      updatedB = monsterUpdates.get(key)!;
                  }

                  if (damageMap.has(key)) {
                      updatedB.hp = (updatedB.hp ?? buildingData.find(i=>i.id===updatedB.buildingId)?.stats.durability ?? 1) - damageMap.get(key)!;
                  }

                  if (updatedB.isDestroying && updatedB.destructionEndTime && now >= updatedB.destructionEndTime) {
                      const damage = updatedB.pendingDamage || 0;
                      const currentHp = updatedB.hp ?? 0;
                      const remainingHp = currentHp - damage;
                      updatedB.hp = remainingHp;
                      updatedB.isDestroying = false;
                      updatedB.destructionEndTime = undefined;
                      updatedB.pendingDamage = 0;
                  } else if (updatedB.isConstructing && now >= updatedB.constructionEndTime) {
                      updatedB.isConstructing = false;
                      updatedB.workState = 'idle';
                  } else if (updatedB.workState === 'working' && updatedB.workEndTime && now >= updatedB.workEndTime) {
                      updatedB.workState = 'finished';
                  }
                  
                  if ((updatedB.hp !== undefined && updatedB.hp <= 0)) {
                       // Destroyed
                  } else {
                      nextBuildings.push(updatedB);
                  }
              });

              return nextBuildings;
          });
      }

      setVisualEffects(prev => prev.filter(effect => Date.now() - effect.startTime < effect.duration));

      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [draw, placedBuildings, mapResources]);
  
  useEffect(() => {
    const handleResize = () => {
      const [canvas] = getCanvasContext();
      if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tree Spawning
  useEffect(() => {
    const newTrees: MapResource[] = [];
    const occupied = new Set<string>();
    for (let i = 0; i < NUM_TREES; i++) {
        const x = Math.floor(Math.random() * WORLD_WIDTH_TILES);
        const y = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
        const key = `${x},${y}`;
        if (!occupied.has(key)) {
            newTrees.push({ x, y, hp: TREE_HP, type: 'tree' });
            occupied.add(key);
        }
    }
    setMapResources(prev => [...prev, ...newTrees]);
  }, []);

  // Mountain Spawning Logic
  useEffect(() => {
      setPlacedBuildings(prev => {
          const mountains = prev.filter(b => b.buildingId === MOUNTAIN_ID);
          const countNeeded = MAX_MOUNTAINS - mountains.length;
          
          if (countNeeded <= 0) return prev;

          const occupied = new Set([
              ...prev.map(b => `${b.x},${b.y}`),
              ...mapResources.map(r => `${r.x},${r.y}`)
          ]);

          const newMountains: PlacedBuilding[] = [];
          const mountainInfo = buildingData.find(b => b.id === MOUNTAIN_ID);

          if (!mountainInfo) return prev;

          for (let i = 0; i < countNeeded; i++) {
              let newX, newY, key;
              const maxTries = 50;
              let tries = 0;
              
              do {
                  newX = Math.floor(Math.random() * WORLD_WIDTH_TILES);
                  newY = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
                  key = `${newX},${newY}`;
                  tries++;
              } while (occupied.has(key) && tries < maxTries);

              if (!occupied.has(key)) {
                  occupied.add(key);
                  newMountains.push({
                      x: newX,
                      y: newY,
                      buildingId: MOUNTAIN_ID,
                      ownerId: -1, // Nature
                      isConstructing: false,
                      constructionEndTime: 0,
                      type: BuildingType.Default,
                      workState: 'idle',
                      hp: mountainInfo.stats.durability,
                      maxHp: mountainInfo.stats.durability
                  });
              }
          }

          return [...prev, ...newMountains];
      });
  }, [mapResources]); 

  // River Spawning Logic
  useEffect(() => {
      setPlacedBuildings(prev => {
          const rivers = prev.filter(b => b.buildingId === RIVER_ID);
          const countNeeded = MAX_RIVERS - rivers.length;
          
          if (countNeeded <= 0) return prev;

          const occupied = new Set([
              ...prev.map(b => `${b.x},${b.y}`),
              ...mapResources.map(r => `${r.x},${r.y}`)
          ]);

          const newRivers: PlacedBuilding[] = [];
          const riverInfo = buildingData.find(b => b.id === RIVER_ID);

          if (!riverInfo) return prev;

          for (let i = 0; i < countNeeded; i++) {
              let newX, newY, key;
              const maxTries = 50;
              let tries = 0;
              
              do {
                  newX = Math.floor(Math.random() * WORLD_WIDTH_TILES);
                  newY = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
                  key = `${newX},${newY}`;
                  tries++;
              } while (occupied.has(key) && tries < maxTries);

              if (!occupied.has(key)) {
                  occupied.add(key);
                  newRivers.push({
                      x: newX,
                      y: newY,
                      buildingId: RIVER_ID,
                      ownerId: -1, // Nature
                      isConstructing: false,
                      constructionEndTime: 0,
                      type: BuildingType.Default,
                      workState: 'idle',
                      hp: riverInfo.stats.durability,
                      maxHp: riverInfo.stats.durability
                  });
              }
          }

          return [...prev, ...newRivers];
      });
  }, [mapResources]);

  // Oil Deposit Spawning Logic
  useEffect(() => {
      const oilSpawner = setInterval(() => {
          setMapResources(prev => {
              const prevBuildings = placedBuildingsRef.current;
              const oilDeposits = prev.filter(r => r.type === 'oil');
              if (oilDeposits.length >= MAX_OIL_DEPOSITS) return prev;

              if (Math.random() > 0.2) return prev;

              let newX, newY, key;
              const maxTries = 50;
              let tries = 0;
              const occupied = new Set([
                  ...prev.map(r => `${r.x},${r.y}`),
                  ...prevBuildings.map(b => `${b.x},${b.y}`)
              ]);

              do {
                  newX = Math.floor(Math.random() * WORLD_WIDTH_TILES);
                  newY = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
                  key = `${newX},${newY}`;
                  tries++;
              } while (occupied.has(key) && tries < maxTries);

              if (!occupied.has(key)) {
                  const sectorX = Math.floor(newX / ZONE_SIZE) + 1;
                  const sectorY = Math.floor(newY / ZONE_SIZE) + 1;

                  const hasIntel = prevBuildings.some(b => [340, 341, 342].includes(b.buildingId) && b.ownerId === 0 && !b.isConstructing);

                  if (hasIntel) {
                      setChatHistory(history => {
                          const msg: ChatMessage = {
                              id: Date.now(),
                              sender: 'Система',
                              text: `В секторе ${sectorX}-${sectorY} обнаружено новое месторождение нефти!`,
                              type: 'system',
                              timestamp: Date.now(),
                              tab: 'loot',
                              teleportCoordinates: { x: (sectorX - 1) * ZONE_SIZE + ZONE_SIZE/2, y: (sectorY - 1) * ZONE_SIZE + ZONE_SIZE/2 }
                          };
                          return [...history, msg];
                      });
                  }

                  return [...prev, { x: newX, y: newY, hp: 10, type: 'oil' }]; 
              }
              return prev;
          });
      }, 15000); 

      return () => clearInterval(oilSpawner);
  }, []); 
  
  // Abandoned Quarry Spawning Logic
  useEffect(() => {
      const quarrySpawner = setInterval(() => {
          setMapResources(prev => {
              const prevBuildings = placedBuildingsRef.current;
              const quarries = prev.filter(r => r.type === 'quarry');
              if (quarries.length >= MAX_QUARRIES) return prev;

              if (Math.random() > 0.2) return prev;

              let newX, newY, key;
              const maxTries = 50;
              let tries = 0;
              const occupied = new Set([
                  ...prev.map(r => `${r.x},${r.y}`),
                  ...prevBuildings.map(b => `${b.x},${b.y}`)
              ]);

              do {
                  newX = Math.floor(Math.random() * WORLD_WIDTH_TILES);
                  newY = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
                  key = `${newX},${newY}`;
                  tries++;
              } while (occupied.has(key) && tries < maxTries);

              if (!occupied.has(key)) {
                  return [...prev, { x: newX, y: newY, hp: 50, type: 'quarry' }];
              }
              return prev;
          });
      }, 18000); 

      return () => clearInterval(quarrySpawner);
  }, []);

  // Treasure Chest Spawning Logic
  useEffect(() => {
      const chestSpawner = setInterval(() => {
          setMapResources(prev => {
              const prevBuildings = placedBuildingsRef.current;
              const chests = prev.filter(r => r.type === 'chest');
              if (chests.length >= MAX_CHESTS) return prev;

              if (Math.random() > 0.15) return prev;

              let newX, newY, key;
              const maxTries = 50;
              let tries = 0;
              const occupied = new Set([
                  ...prev.map(r => `${r.x},${r.y}`),
                  ...prevBuildings.map(b => `${b.x},${b.y}`)
              ]);

              do {
                  newX = Math.floor(Math.random() * WORLD_WIDTH_TILES);
                  newY = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
                  key = `${newX},${newY}`;
                  tries++;
              } while (occupied.has(key) && tries < maxTries);

              if (!occupied.has(key)) {
                  const sectorX = Math.floor(newX / ZONE_SIZE) + 1;
                  const sectorY = Math.floor(newY / ZONE_SIZE) + 1;

                  const hasAdvancedIntel = prevBuildings.some(b => [341, 342].includes(b.buildingId) && b.ownerId === 0 && !b.isConstructing);

                  if (hasAdvancedIntel) {
                      setChatHistory(history => {
                          const msg: ChatMessage = {
                              id: Date.now(),
                              sender: 'Система',
                              text: `В секторе ${sectorX}-${sectorY} обнаружен спрятанный клад!`,
                              type: 'system',
                              timestamp: Date.now(),
                              tab: 'loot',
                              teleportCoordinates: { x: (sectorX - 1) * ZONE_SIZE + ZONE_SIZE/2, y: (sectorY - 1) * ZONE_SIZE + ZONE_SIZE/2 }
                          };
                          return [...history, msg];
                      });
                  }

                  return [...prev, { x: newX, y: newY, hp: 1, type: 'chest' }];
              }
              return prev;
          });
      }, 20000); 

      return () => clearInterval(chestSpawner);
  }, []);
  
  // Wild Monster Spawning Logic
  useEffect(() => {
      const monsterSpawner = setInterval(() => {
          setPlacedBuildings(prev => {
              const prevResources = mapResourcesRef.current;
              const monsterTypes = [KILLING_HUT_ID, KIND_SANTA_ID, GORYNYCH_ID];
              let updatedBuildings = [...prev];
              let hasChange = false;

              const occupied = new Set([
                  ...prevResources.map(r => `${r.x},${r.y}`),
                  ...prev.map(b => `${b.x},${b.y}`)
              ]);

              monsterTypes.forEach(typeId => {
                  const currentCount = updatedBuildings.filter(b => b.buildingId === typeId && b.ownerId === -1).length;
                  if (currentCount >= MAX_WILD_MONSTERS) return;

                  if (Math.random() > 0.4) return;

                  let newX, newY, key;
                  const maxTries = 50;
                  let tries = 0;

                  do {
                      newX = Math.floor(Math.random() * WORLD_WIDTH_TILES);
                      newY = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
                      key = `${newX},${newY}`;
                      tries++;
                  } while (occupied.has(key) && tries < maxTries);

                  if (!occupied.has(key)) {
                      const monsterInfo = buildingData.find(b => b.id === typeId);
                      if (monsterInfo) {
                          occupied.add(key);
                          updatedBuildings.push({
                              x: newX,
                              y: newY,
                              buildingId: typeId,
                              ownerId: -1, 
                              isConstructing: false,
                              constructionEndTime: 0, 
                              type: BuildingType.Default,
                              workState: 'idle',
                              hp: monsterInfo.stats.durability,
                              maxHp: monsterInfo.stats.durability,
                              lastMoveTime: Date.now()
                          });
                          hasChange = true;
                      }
                  }
              });

              return hasChange ? updatedBuildings : prev;
          });
      }, 5000); 

      return () => clearInterval(monsterSpawner);
  }, []); 

  useEffect(() => {
      const additionalCapacity = placedBuildings
          .filter(b => b.ownerId === 0 && b.type === BuildingType.Storage && !b.isConstructing)
          .reduce((sum, b) => {
              const buildingInfo = buildingData.find(bd => bd.id === b.buildingId);
              return sum + (buildingInfo?.stats.increasesGoldCapacity || 0);
          }, 0);
      setGoldCapacity(BASE_GOLD_CAPACITY + additionalCapacity);
  }, [placedBuildings]);

  useEffect(() => {
    const energyTimer = setInterval(() => {
      setPlayerEnergy(currentEnergy => Math.min(maxEnergy, currentEnergy + ENERGY_REGEN_PER_MINUTE));
    }, 60000);
    return () => clearInterval(energyTimer);
  }, [maxEnergy]);

  useEffect(() => {
    const gloryToNextLevel = getGloryForLevel(playerLevel);
    if (playerGlory >= gloryToNextLevel && playerLevel < MAX_LEVEL) {
      setPlayerLevel(prev => prev + 1);
      setPlayerGlory(prev => prev - gloryToNextLevel);
      setPlayerEnergy(prev => prev + 50); 
    }
  }, [playerGlory, playerLevel, getGloryForLevel]);

  // Market Handlers
  const handleBuyMarketItem = (listing: MarketListing) => {
      if (listing.currency === 'coins') {
          if (playerGold < listing.price) {
              alert("Недостаточно монет!");
              return;
          }
          setPlayerGold(prev => prev - listing.price);
      } else {
          if (playerRubies < listing.price) {
              alert("Недостаточно рубинов!");
              return;
          }
          setPlayerRubies(prev => prev - listing.price);
      }

      setInventory(prev => ({
          ...prev,
          [listing.resourceId]: (prev[listing.resourceId] || 0) + listing.amount
      }));

      const itemInfo = itemData.find(i => i.id === listing.resourceId);
      addHistoryLog(`Куплено ${listing.amount} ${itemInfo?.name || 'предметов'} за ${listing.price} ${listing.currency === 'coins' ? 'монет' : 'рубинов'}`, 'economy');

      setMarketListings(prev => prev.filter(l => l.id !== listing.id));
      alert(`Вы купили ${listing.amount} шт.`);
  };

  const handleCreateMarketListing = () => {
      if (!sellItemSelection.itemId) {
          alert("Выберите предмет для продажи!");
          return;
      }
      if (sellItemSelection.amount <= 0 || sellItemSelection.price <= 0) {
          alert("Некорректное количество или цена.");
          return;
      }
      
      const currentAmount = inventory[sellItemSelection.itemId] || 0;
      if (currentAmount < sellItemSelection.amount) {
          alert("Недостаточно предметов в инвентаре.");
          return;
      }

      // Deduct from inventory
      setInventory(prev => ({
          ...prev,
          [sellItemSelection.itemId!]: (prev[sellItemSelection.itemId!] || 0) - sellItemSelection.amount
      }));

      const newListing: MarketListing = {
          id: Date.now(),
          sellerName: playerName,
          resourceId: sellItemSelection.itemId,
          amount: sellItemSelection.amount,
          price: sellItemSelection.price,
          currency: sellItemSelection.currency,
          isPlayer: true
      };

      const itemInfo = itemData.find(i => i.id === sellItemSelection.itemId);
      addHistoryLog(`Выставлено на продажу: ${sellItemSelection.amount} ${itemInfo?.name} за ${sellItemSelection.price} ${sellItemSelection.currency === 'coins' ? 'монет' : 'рубинов'}`, 'economy');

      setMarketListings(prev => [...prev, newListing]);
      alert("Товар выставлен на продажу!");
      setSellItemSelection(prev => ({ ...prev, itemId: null, amount: 1, price: 10 })); // Reset form
  };

  const handleCancelListing = (listing: MarketListing) => {
      setMarketListings(prev => prev.filter(l => l.id !== listing.id));
      // Refund items
      setInventory(prev => ({
          ...prev,
          [listing.resourceId]: (prev[listing.resourceId] || 0) + listing.amount
      }));
  };

  const handleBanPlayer = (cost: number, durationMinutes: number) => {
      if (playerGold < cost) {
          alert(`Недостаточно золота! Требуется ${cost.toLocaleString()} монет.`);
          return;
      }
      
      setPlayerGold(prev => prev - cost);
      
      addHistoryLog(`Игрок ${selectedChatUser} забанен на ${durationMinutes} минут. Потрачено ${cost} монет.`, 'social');
      alert(`Игрок ${selectedChatUser} успешно забанен на ${durationMinutes} минут!`);
      
      // FOR TESTING PURPOSES: If I ban myself, apply the restrictions.
      if (selectedChatUser === playerName) {
          setBanEndTime(Date.now() + durationMinutes * 60 * 1000);
      }

      setShowBanMenu(false);
      setSelectedChatUser(null);
  };

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
  }, []);
  
 const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
        const dx = event.clientX - dragStartRef.current.x;
        const dy = event.clientY - dragStartRef.current.y;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasDraggedRef.current = true;
        }
        
        setCameraOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: event.clientX, y: event.clientY };
    }
    const zoom = ZOOM_LEVELS[zoomIndex];
    const { x: gridX, y: gridY } = screenToWorld(event.clientX, event.clientY, zoom);
    
    if (gridX >= 0 && gridX < WORLD_WIDTH_TILES && gridY >= 0 && gridY < WORLD_HEIGHT_TILES) {
      setHoveredTile({x: gridX, y: gridY});
      const hoveredBuilding = placedBuildings.find(b => b.x === gridX && b.y === gridY);
      if (hoveredBuilding && !hoveredBuilding.isConstructing && !hoveredBuilding.isDestroying) {
          const buildingInfo = buildingData.find(b => b.id === hoveredBuilding.buildingId);
          if (buildingInfo) {
              const ownerName = hoveredBuilding.ownerId === 0 ? "Вы" : (hoveredBuilding.ownerId === -1 ? "Природа" : "Враг");
              const ownerColor = PLAYER_COLORS[hoveredBuilding.ownerId] || (hoveredBuilding.ownerId === -1 ? 'gray' : 'blue');
              
              const curHp = hoveredBuilding.hp ?? buildingInfo.stats.durability;
              const maxHp = hoveredBuilding.maxHp ?? buildingInfo.stats.durability;
              
              const isProtected = hoveredBuilding.protectionEndTime && hoveredBuilding.protectionEndTime > Date.now();

              const content = (
                  <div>
                      <p className="font-bold">{buildingInfo.name}</p>
                      <p className="text-xs">Владелец: <span style={{ color: ownerColor }}>{ownerName}</span></p>
                      {buildingInfo.id !== MOUNTAIN_ID && buildingInfo.id !== RIVER_ID && (
                         <p className="text-xs">Прочность: <span className={curHp < maxHp ? 'text-red-400' : 'text-green-400'}>{curHp} / {maxHp}</span></p>
                      )}
                      {buildingInfo.stats.increasesGoldCapacity && (
                          <p className="text-xs text-yellow-400">Вместимость: +{buildingInfo.stats.increasesGoldCapacity}</p>
                      )}
                      {buildingInfo.stats.workTimeSeconds && hoveredBuilding.workState === 'working' && (
                          <p className="text-xs text-blue-400">Работает...</p>
                      )}
                      {buildingInfo.id === WATCHTOWER_ID && hoveredBuilding.taxRate !== undefined && (
                          <p className="text-xs text-purple-400">Налог сектора: {hoveredBuilding.taxRate}%</p>
                      )}
                      {isProtected && (
                          <p className="text-xs text-blue-300 font-bold mt-1">🛡️ Под защитой</p>
                      )}
                  </div>
              );
              
              setTooltip({ visible: true, x: event.clientX, y: event.clientY, content });
          }
      } else {
          if (tooltip.visible) {
              setTooltip({ visible: false, x: 0, y: 0, content: null });
          }
      }
    } else {
      setHoveredTile(null);
       if (tooltip.visible) {
          setTooltip({ visible: false, x: 0, y: 0, content: null });
      }
    }

  }, [cameraOffset, placedBuildings, tooltip.visible, zoomIndex, screenToWorld]);
  
  const handleConfirmBuild = () => {
    // ... (logic unchanged) ...
    if (!buildConfirmation.building) return;

    const { building, x, y } = buildConfirmation;
    const currentBuildingCount = placedBuildings.filter(b => b.ownerId === 0).length;

    if (currentBuildingCount >= maxBuildings && building.id !== TOWN_HALL_ID) {
      alert("Достигнут лимит зданий! Постройте или улучшите Городской центр.");
      setBuildConfirmation({ visible: false, building: null, x: 0, y: 0 });
      return;
    }

    if (building.id === WATCHTOWER_ID) {
        const hasClanCastle = placedBuildings.some(b => b.buildingId === CLAN_CASTLE_ID && b.ownerId === 0 && !b.isConstructing);
        if (!hasClanCastle) {
            alert("Для постройки Сторожевой башни требуется Бандитский замок!");
            setBuildConfirmation({ visible: false, building: null, x: 0, y: 0 });
            return;
        }
    }

    if (playerGold < (building.price || 0)) {
      alert("Недостаточно золота!");
      setBuildConfirmation({ visible: false, building: null, x: 0, y: 0 });
      return;
    }
    
    if (building.constructionRequirements.population) {
        const requiredPop = building.constructionRequirements.population;
        const availablePop = maxPopulation - currentPopulation;
        
        if (availablePop < requiredPop) {
            alert(`Недостаточно свободного населения! Требуется: ${requiredPop}`);
             setBuildConfirmation({ visible: false, building: null, x: 0, y: 0 });
            return;
        }
    }

    if (building.constructionRequirements.resources) {
        const missingResources = building.constructionRequirements.resources.filter(req => (inventory[req.id] || 0) < (req.amount || 0));
        if (missingResources.length > 0) {
            const missingNames = missingResources.map(r => r.name).join(', ');
            alert(`Недостаточно ресурсов: ${missingNames}`);
            setBuildConfirmation({ visible: false, building: null, x: 0, y: 0 });
            return;
        }

        setInventory(prev => {
            const newInventory = { ...prev };
            building.constructionRequirements.resources!.forEach(req => {
                newInventory[req.id] = (newInventory[req.id] || 0) - (req.amount || 0);
            });
            return newInventory;
        });
    }

    setPlayerGold(prev => prev - (building.price || 0));
    
    addHistoryLog(`Построено здание "${building.name}" в точке [${x}, ${y}]. Стоимость: ${building.price} монет.`, 'build');

    const newBuilding: PlacedBuilding = {
      x: x,
      y: y,
      buildingId: building.id,
      ownerId: 0,
      isConstructing: true,
      constructionEndTime: Date.now() + (building.stats.constructionTimeSeconds || 0) * 1000,
      type: building.type,
      workState: 'idle',
      hp: building.stats.durability,
      maxHp: building.stats.durability,
      taxRate: building.id === WATCHTOWER_ID ? 0 : undefined
    };
    setPlacedBuildings(prev => [...prev, newBuilding]);
    setBuildConfirmation({ visible: false, building: null, x: 0, y: 0 });
  };


  // ... (handleMouseUp, handleStartGame, handleShareOil, handleShareQuarry, handleBuildOilRig, handleBuildWildQuarry, handleNameChange, handleBuyRuby, handleBuyShopItem, handleRubyExchange, handleUpgrade, handleStartProduction, handleCollectProduction, handleSetTax, handleWithdrawBank, handleSectorTeleport, handleMoveClick, calculateRepairCost, handleRepair, handleSell, handleApplyProtection, handleExplode, handleSpeedUp, handleAvatarChange, handleSelectBuildingFromMenu, handleWheel, handleTeleportToTownHall, handleSendMessage, handleConfirmShout, handleSwitchChatTab, handleSendLocation, handleEmojiClick, renderMessageText... all unchanged logic) ...
  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (authMode) return;
    const wasDragging = hasDraggedRef.current;
    isDraggingRef.current = false;
    hasDraggedRef.current = false;

    if (!wasDragging) { 
        if (buildMenu.visible || buildConfirmation.visible) {
          setBuildMenu({visible: false, x: 0, y: 0});
          setBuildConfirmation({ visible: false, building: null, x: 0, y: 0 });
          return;
        }
        
        const zoom = ZOOM_LEVELS[zoomIndex];
        const { x: gridX, y: gridY } = screenToWorld(event.clientX, event.clientY, zoom);

        if (moveMode.active && moveMode.building) {
            if (gridX < 0 || gridX >= WORLD_WIDTH_TILES || gridY < 0 || gridY >= WORLD_HEIGHT_TILES) return;

            const isOccupied = placedBuildings.some(b => b.x === gridX && b.y === gridY && (b.x !== moveMode.building!.x || b.y !== moveMode.building!.y)) || mapResources.some(r => r.x === gridX && r.y === gridY);
            
            if (isOccupied) {
                alert("Место занято!");
                return;
            }
            
            const moveCost = (moveMode.building.buildingId === MOUNTAIN_ID || moveMode.building.buildingId === RIVER_ID) ? MOUNTAIN_MOVE_COST : MOVE_ENERGY_COST;

            if (playerEnergy < moveCost) {
                alert(`Недостаточно энергии! Нужно ${moveCost}.`);
                setMoveMode({active: false, building: null});
                return;
            }

            setPlayerEnergy(prev => prev - moveCost);
            
            const buildingInfo = buildingData.find(b => b.id === moveMode.building!.buildingId);
            addHistoryLog(`Перемещен объект "${buildingInfo?.name}" с [${moveMode.building!.x}, ${moveMode.building!.y}] на [${gridX}, ${gridY}]. Расход: ${moveCost} энергии.`, 'move');

            setPlacedBuildings(prev => prev.map(b => {
                if (b.x === moveMode.building!.x && b.y === moveMode.building!.y) {
                    return { ...b, x: gridX, y: gridY };
                }
                return b;
            }));
            setMoveMode({ active: false, building: null });
            return;
        }

        if (selectedBuilding) {
          setSelectedBuilding(null);
          setShowExplosionMenu(false);
          setShowProtectionMenu(false);
          return;
        }

        if (gridX < 0 || gridX >= WORLD_WIDTH_TILES || gridY < 0 || gridY >= WORLD_HEIGHT_TILES) {
          return; 
        }
        
        const resourceIndex = mapResources.findIndex(r => r.x === gridX && r.y === gridY);
        const buildingAtTile = placedBuildings.find(b => b.x === gridX && b.y === gridY);

        if (resourceIndex !== -1) {
            const resource = mapResources[resourceIndex];

            if (resource.type === 'oil') {
                setSelectedOilDeposit(resource);
                return;
            }

            if (resource.type === 'quarry') {
                setSelectedQuarry(resource);
                return;
            }

            if (playerEnergy < ENERGY_COST_PER_CHOP) return;

            setPlayerEnergy(prev => prev - ENERGY_COST_PER_CHOP);
            setPlayerGlory(prev => prev + GLORY_PER_CHOP); 

            const updatedResources = [...mapResources];
            const updatedResource = { ...updatedResources[resourceIndex] };
            updatedResource.hp -= 1;
            
            if (updatedResource.type === 'tree') {
                setInventory(prev => ({
                    ...prev,
                    [WOOD_ITEM_ID]: (prev[WOOD_ITEM_ID] || 0) + 1
                }));
                setPlayerGold(prev => Math.min(goldCapacity, prev + GOLD_PER_CHOP));
            } 
            
            if (updatedResource.type === 'chest') {
                setInventory(prev => ({
                    ...prev,
                    [TREASURE_CHEST_ID]: (prev[TREASURE_CHEST_ID] || 0) + 1
                }));
                updatedResource.hp = 0;
                addHistoryLog(`Найден клад в точке [${gridX}, ${gridY}]!`, 'economy');
                alert("Вы нашли клад! +1 Сундук с сокровищем");
            }

            if (updatedResource.hp <= 0) {
                updatedResources.splice(resourceIndex, 1);
                if (updatedResource.type === 'tree') {
                    setTimeout(() => {
                        setMapResources(prevResources => {
                            if (prevResources.filter(r => r.type === 'tree').length < NUM_TREES) {
                                let newX, newY, key;
                                const maxTries = 100;
                                let tries = 0;
                                const occupied = new Set([
                                  ...prevResources.map(r => `${r.x},${r.y}`),
                                  ...placedBuildings.map(b => `${b.x},${b.y}`)
                                ]);

                                do {
                                    newX = Math.floor(Math.random() * WORLD_WIDTH_TILES);
                                    newY = Math.floor(Math.random() * WORLD_HEIGHT_TILES);
                                    key = `${newX},${newY}`;
                                    tries++;
                                } while (occupied.has(key) && tries < maxTries);
                                
                                if (!occupied.has(key)) {
                                    return [...prevResources, { x: newX, y: newY, hp: TREE_HP, type: 'tree' }];
                                }
                            }
                            return prevResources;
                        });
                    }, TREE_RESPAWN_TIME);
                }
            } else {
                updatedResources[resourceIndex] = updatedResource;
            }
            setMapResources(updatedResources);
        } else if (buildingAtTile) {
            if (buildingAtTile.isDestroying) return; 

            // Only allow interaction if we own it (ownerId 0)
            if (buildingAtTile.ownerId === 0 && !buildingAtTile.isConstructing) {
                const buildingInfo = buildingData.find(b => b.id === buildingAtTile.buildingId);
                if (buildingInfo) {
                    setSelectedBuilding({ building: buildingAtTile, info: buildingInfo });
                }
            } else if (buildingAtTile.ownerId !== 0) {
                 // Could add "Inspect enemy building" logic here
                 const buildingInfo = buildingData.find(b => b.id === buildingAtTile.buildingId);
                 if (buildingInfo) {
                    setSelectedBuilding({ building: buildingAtTile, info: buildingInfo });
                 }
            }
        } else { 
            if (!hasTownHall) {
              const townHallBuilding = buildingData.find(b => b.id === TOWN_HALL_ID);
              if (townHallBuilding) {
                  setPlacedBuildings(prev => [...prev, {
                      x: gridX,
                      y: gridY,
                      buildingId: TOWN_HALL_ID,
                      ownerId: 0,
                      isConstructing: true,
                      constructionEndTime: Date.now() + (townHallBuilding.stats.constructionTimeSeconds || 0) * 1000,
                      type: townHallBuilding.type,
                      hp: townHallBuilding.stats.durability,
                      maxHp: townHallBuilding.stats.durability
                  }]);
                  addHistoryLog("Основан новый город!", 'build');
              }
            } else {
                 setBuildMenu({ visible: true, x: gridX, y: gridY });
            }
        }
    }
  }, [cameraOffset, placedBuildings, mapResources, playerGold, goldCapacity, playerEnergy, hasTownHall, maxBuildings, buildMenu, selectedBuilding, buildConfirmation, zoomIndex, screenToWorld, currentPopulation, maxPopulation, inventory, moveMode, sellItemSelection, authMode]);

  
  const handleShareOil = () => {
      if (isBanned()) {
          alert("Вы забанены и не можете делиться ресурсами!");
          return;
      }
      if (!selectedOilDeposit) return;
      
      const messageText = `Я нашел нефть! Делюсь со всеми ресурсом.`;
      const newMessage: ChatMessage = {
          id: Date.now(),
          sender: playerName,
          text: messageText,
          type: 'normal',
          timestamp: Date.now(),
          tab: 'general', 
          teleportCoordinates: { x: selectedOilDeposit.x, y: selectedOilDeposit.y }
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      setSelectedOilDeposit(null);
  };
  
  const handleShareQuarry = () => {
      if (isBanned()) {
          alert("Вы забанены и не можете делиться ресурсами!");
          return;
      }
      if (!selectedQuarry) return;

      const messageText = `Я нашел каменоломню! Делюсь со всеми ресурсом.`;
      const newMessage: ChatMessage = {
          id: Date.now(),
          sender: playerName,
          text: messageText,
          type: 'normal',
          timestamp: Date.now(),
          tab: 'general',
          teleportCoordinates: { x: selectedQuarry.x, y: selectedQuarry.y }
      };

      setChatHistory(prev => [...prev, newMessage]);
      setSelectedQuarry(null);
  };

  const handleBuildOilRig = () => {
      if (!selectedOilDeposit || !oilRigInfo) return;
      
      if (playerGold < (oilRigInfo.price || 0)) {
          alert("Недостаточно золота для строительства!");
          return;
      }

      if (oilRigInfo.constructionRequirements.population) {
          const requiredPop = oilRigInfo.constructionRequirements.population;
          const availablePop = maxPopulation - currentPopulation;
          if (availablePop < requiredPop) {
              alert(`Недостаточно населения! Требуется: ${requiredPop}`);
              return;
          }
      }

      setPlayerGold(prev => prev - (oilRigInfo.price || 0));
      setMapResources(prev => prev.filter(r => r.x !== selectedOilDeposit.x || r.y !== selectedOilDeposit.y));

      const newBuilding: PlacedBuilding = {
          x: selectedOilDeposit.x,
          y: selectedOilDeposit.y,
          buildingId: OIL_RIG_ID,
          ownerId: 0,
          isConstructing: true,
          constructionEndTime: Date.now() + (oilRigInfo.stats.constructionTimeSeconds || 0) * 1000,
          type: oilRigInfo.type,
          workState: 'idle',
          hp: oilRigInfo.stats.durability,
          maxHp: oilRigInfo.stats.durability
      };

      setPlacedBuildings(prev => [...prev, newBuilding]);
      addHistoryLog(`Построена Нефтяная вышка в [${selectedOilDeposit.x}, ${selectedOilDeposit.y}].`, 'build');
      setSelectedOilDeposit(null);
  };
  
  const handleBuildWildQuarry = () => {
      if (!selectedQuarry || !wildQuarryInfo) return;

      if (playerGold < (wildQuarryInfo.price || 0)) {
          alert("Недостаточно золота для строительства!");
          return;
      }

      if (wildQuarryInfo.constructionRequirements.population) {
          const requiredPop = wildQuarryInfo.constructionRequirements.population;
          const availablePop = maxPopulation - currentPopulation;
          if (availablePop < requiredPop) {
              alert(`Недостаточно населения! Требуется: ${requiredPop}`);
              return;
          }
      }

      setPlayerGold(prev => prev - (wildQuarryInfo.price || 0));
      setMapResources(prev => prev.filter(r => r.x !== selectedQuarry.x || r.y !== selectedQuarry.y));

      const newBuilding: PlacedBuilding = {
          x: selectedQuarry.x,
          y: selectedQuarry.y,
          buildingId: WILD_QUARRY_ID,
          ownerId: 0,
          isConstructing: true,
          constructionEndTime: Date.now() + (wildQuarryInfo.stats.constructionTimeSeconds || 0) * 1000,
          type: wildQuarryInfo.type,
          workState: 'idle',
          hp: wildQuarryInfo.stats.durability,
          maxHp: wildQuarryInfo.stats.durability
      };

      setPlacedBuildings(prev => [...prev, newBuilding]);
      addHistoryLog(`Построена Дикая каменоломня в [${selectedQuarry.x}, ${selectedQuarry.y}].`, 'build');
      setSelectedQuarry(null);
  };

  const handleNameChange = () => {
    const cost = 500;
    if (playerGold >= cost) {
        if(tempPlayerName.trim().length > 0) {
            setPlayerGold(prev => prev - cost);
            setPlayerName(tempPlayerName);
            addHistoryLog(`Смена имени на "${tempPlayerName}". Стоимость: ${cost} монет.`, 'social');
            alert("Имя успешно изменено!");
        } else {
            alert("Имя не может быть пустым.");
        }
    } else {
        alert("Недостаточно золота для смены имени!");
    }
  };

  const handleBuyRuby = () => {
    if (playerGold >= 10000) {
        setPlayerGold(prev => prev - 10000);
        setPlayerRubies(prev => prev + 1);
        addHistoryLog("Куплен 1 рубин за 10 000 монет.", 'economy');
    } else {
        alert("Недостаточно золота!");
    }
  };
  
  const handleBuyShopItem = (item: Item) => {
      if (!item.rubyPackQuantity) return;
      if (playerRubies >= 1) {
          setPlayerRubies(prev => prev - 1);
          setInventory(prev => ({
              ...prev,
              [item.id]: (prev[item.id] || 0) + item.rubyPackQuantity!
          }));
          addHistoryLog(`Куплено ${item.rubyPackQuantity} ${item.name} за 1 рубин.`, 'economy');
      } else {
          alert("Недостаточно рубинов!");
      }
  };

  const handleRubyExchange = () => {
      if (exchangeAmount <= 0) return;
      if (playerRubies >= exchangeAmount) {
          const coins = exchangeAmount * 7777;
          setPlayerRubies(prev => prev - exchangeAmount);
          setPlayerGold(prev => Math.min(goldCapacity, prev + coins));
          setShowExchangeModal(false);
          setExchangeAmount(1);
          addHistoryLog(`Обменяно ${exchangeAmount} рубинов на ${coins} монет.`, 'economy');
          alert(`Обмен успешен! Вы получили ${coins.toLocaleString()} монет.`);
      } else {
          alert("Недостаточно рубинов!");
      }
  };

  const handleUpgrade = () => {
    if (!selectedBuilding) return;

    const upgradeTargetId = selectedBuilding.info.upgradesTo;
    const cost = selectedBuilding.info.upgradeCost;
    const newBuildingInfo = buildingData.find(b => b.id === upgradeTargetId);

    if (!newBuildingInfo || cost === undefined) return;
    
    if (playerGold < cost) {
      alert("Недостаточно золота для улучшения!");
      return;
    }

    if (newBuildingInfo.constructionRequirements.population) {
         const requiredPop = newBuildingInfo.constructionRequirements.population;
         const availablePop = maxPopulation - currentPopulation;
         if (availablePop < requiredPop) {
             alert(`Недостаточно свободного населения для улучшения! Требуется: ${requiredPop}`);
             return;
         }
    }

    if (newBuildingInfo.constructionRequirements.resources) {
        const missingResources = newBuildingInfo.constructionRequirements.resources.filter(req => (inventory[req.id] || 0) < (req.amount || 0));
        if (missingResources.length > 0) {
            const missingNames = missingResources.map(r => r.name).join(', ');
            alert(`Недостаточно ресурсов для улучшения: ${missingNames}`);
            return;
        }
    }

    setPlayerGold(prev => prev - cost);

    if (newBuildingInfo.constructionRequirements.resources) {
        setInventory(prev => {
            const newInventory = { ...prev };
            newBuildingInfo.constructionRequirements.resources!.forEach(req => {
                newInventory[req.id] = (newInventory[req.id] || 0) - (req.amount || 0);
            });
            return newInventory;
        });
    }
    
    setVisualEffects(prev => [...prev, {
        id: Date.now(),
        x: selectedBuilding.building.x,
        y: selectedBuilding.building.y,
        type: 'upgrade',
        startTime: Date.now(),
        duration: UPGRADE_EFFECT_DURATION
    }]);

    addHistoryLog(`Улучшение здания "${selectedBuilding.info.name}" до "${newBuildingInfo.name}". Стоимость: ${cost} монет.`, 'build');

    setPlacedBuildings(prev => {
      const index = prev.findIndex(b => b.x === selectedBuilding.building.x && b.y === selectedBuilding.building.y);
      if (index === -1) return prev;

      const newBuildings = [...prev];
      newBuildings[index] = {
        ...newBuildings[index],
        buildingId: newBuildingInfo.id,
        isConstructing: true,
        constructionEndTime: Date.now() + (newBuildingInfo.stats.constructionTimeSeconds || 0) * 1000,
        type: newBuildingInfo.type,
        hp: newBuildingInfo.stats.durability,
        maxHp: newBuildingInfo.stats.durability
      };
      return newBuildings;
    });

    setSelectedBuilding(null);
  };

  const handleStartProduction = () => {
    if (!selectedBuilding) return;
    const { building, info } = selectedBuilding;
    
    const popCost = info.stats.takesPopulation || 0;
    const isContinuation = (building.workState === 'finished' && [400, 401, 402, 403, 404, 406, 407, 408].includes(building.buildingId));
    
    let extraPopNeeded = 0;
    if (building.buildingId === 408 && building.workState === 'finished') {
        extraPopNeeded = 5; 
    }

    if (!isContinuation && currentPopulation + popCost > maxPopulation) {
        alert(`Недостаточно рабочих! Требуется: ${popCost}, Свободно: ${maxPopulation - currentPopulation}`);
        return;
    }
    
    if (isContinuation && currentPopulation + extraPopNeeded > maxPopulation) {
         alert(`Недостаточно населения! Требуется еще: ${extraPopNeeded}`);
         return;
    }

    if (info.stats.consumes) {
        for (const req of info.stats.consumes) {
            if ((inventory[req.id] || 0) < (req.amount || 0)) {
                alert(`Недостаточно ресурса: ${req.name}`);
                return;
            }
        }
    }

    if (info.stats.consumes) {
        setInventory(prev => {
            const next = { ...prev };
            info.stats.consumes!.forEach(req => {
                next[req.id] = (next[req.id] || 0) - (req.amount || 0);
            });
            return next;
        });
    }

    if (isContinuation) {
        if (info.stats.workYieldGold) {
             setPlayerGold(prev => Math.min(goldCapacity, prev + (info.stats.workYieldGold || 0)));
        }
    }

    setPlacedBuildings(prev => prev.map(b => {
        if (b.x === building.x && b.y === building.y) {
            if (b.workState === 'finished' || b.workState === 'idle') {
                if (b.buildingId === 400) { 
                    const isSuper = Math.random() < 0.3;
                    const targetId = isSuper ? 401 : 402; 
                    const targetInfo = buildingData.find(bd => bd.id === targetId);
                    
                    if (targetInfo) {
                        return { 
                            ...b, 
                            buildingId: targetId,
                            type: targetInfo.type,
                            hp: targetInfo.stats.durability,
                            maxHp: targetInfo.stats.durability,
                            workState: 'working', 
                            workEndTime: Date.now() + (targetInfo.stats.workTimeSeconds || 0) * 1000 
                        };
                    }
                } else if (b.buildingId === 401) { 
                     const targetId = 406;
                     const targetInfo = buildingData.find(bd => bd.id === targetId);
                     if (targetInfo) {
                        return { 
                            ...b, 
                            buildingId: targetId,
                            type: targetInfo.type,
                            hp: targetInfo.stats.durability,
                            maxHp: targetInfo.stats.durability,
                            workState: 'working', 
                            workEndTime: Date.now() + (targetInfo.stats.workTimeSeconds || 0) * 1000 
                        };
                     }
                } else if (b.buildingId === 406) { 
                     const targetId = 407;
                     const targetInfo = buildingData.find(bd => bd.id === targetId);
                     if (targetInfo) {
                        return { 
                            ...b, 
                            buildingId: targetId,
                            type: targetInfo.type,
                            hp: targetInfo.stats.durability,
                            maxHp: targetInfo.stats.durability,
                            workState: 'working', 
                            workEndTime: Date.now() + (targetInfo.stats.workTimeSeconds || 0) * 1000 
                        };
                     }
                } else if (b.buildingId === 407) {
                     const targetId = 408;
                     const targetInfo = buildingData.find(bd => bd.id === targetId);
                     if (targetInfo) {
                        return { 
                            ...b, 
                            buildingId: targetId,
                            type: targetInfo.type,
                            hp: targetInfo.stats.durability,
                            maxHp: targetInfo.stats.durability,
                            workState: 'working', 
                            workEndTime: Date.now() + (targetInfo.stats.workTimeSeconds || 0) * 1000 
                        };
                     }
                } else if (b.buildingId === 408) {
                     const targetId = 409;
                     const targetInfo = buildingData.find(bd => bd.id === targetId);
                     if (targetInfo) {
                        return { 
                            ...b, 
                            buildingId: targetId,
                            type: targetInfo.type,
                            hp: targetInfo.stats.durability,
                            maxHp: targetInfo.stats.durability,
                            workState: 'working', 
                            workEndTime: Date.now() + (targetInfo.stats.workTimeSeconds || 0) * 1000 
                        };
                     }
                } else if (b.buildingId === 402) { 
                     const targetId = 403;
                     const targetInfo = buildingData.find(bd => bd.id === targetId);
                     if (targetInfo) {
                        return { 
                            ...b, 
                            buildingId: targetId,
                            type: targetInfo.type,
                            hp: targetInfo.stats.durability,
                            maxHp: targetInfo.stats.durability,
                            workState: 'working', 
                            workEndTime: Date.now() + (targetInfo.stats.workTimeSeconds || 0) * 1000 
                        };
                     }
                } else if (b.buildingId === 403) { 
                     const targetId = 404;
                     const targetInfo = buildingData.find(bd => bd.id === targetId);
                     if (targetInfo) {
                        return { 
                            ...b, 
                            buildingId: targetId,
                            type: targetInfo.type,
                            hp: targetInfo.stats.durability,
                            maxHp: targetInfo.stats.durability,
                            workState: 'working', 
                            workEndTime: Date.now() + (targetInfo.stats.workTimeSeconds || 0) * 1000 
                        };
                     }
                } else if (b.buildingId === 404) { 
                     const targetId = 405;
                     const targetInfo = buildingData.find(bd => bd.id === targetId);
                     if (targetInfo) {
                        return { 
                            ...b, 
                            buildingId: targetId,
                            type: targetInfo.type,
                            hp: targetInfo.stats.durability,
                            maxHp: targetInfo.stats.durability,
                            workState: 'working', 
                            workEndTime: Date.now() + (targetInfo.stats.workTimeSeconds || 0) * 1000 
                        };
                     }
                }
            }

            return { ...b, workState: 'working', workEndTime: Date.now() + (info.stats.workTimeSeconds || 0) * 1000 };
        }
        return b;
    }));
    
    setSelectedBuilding(null); 
  };

  const handleCollectProduction = () => {
    if (isBanned()) {
        alert("Вы забанены и не можете собирать ресурсы!"); 
        return;
    }
    if (!selectedBuilding) return;
    const { building, info } = selectedBuilding;

    if (info.stats.workYieldGold) {
        const zoneX = Math.floor(building.x / ZONE_SIZE);
        const zoneY = Math.floor(building.y / ZONE_SIZE);
        
        const watchtower = placedBuildings.find(b => 
            b.buildingId === WATCHTOWER_ID && 
            !b.isConstructing && 
            Math.floor(b.x / ZONE_SIZE) === zoneX && 
            Math.floor(b.y / ZONE_SIZE) === zoneY
        );

        let playerShare = info.stats.workYieldGold;
        
        if (watchtower && watchtower.taxRate && watchtower.taxRate > 0) {
            const taxRate = Math.min(50, Math.max(0, watchtower.taxRate));
            playerShare = Math.floor(info.stats.workYieldGold * (1 - taxRate / 100));
            const taxShare = info.stats.workYieldGold - playerShare;
            
            setClanBankBalance(prev => prev + taxShare);
        }

        setPlayerGold(prev => Math.min(goldCapacity, prev + playerShare));
    }

    const earnedItems: string[] = [];
    setInventory(prev => {
        const next = { ...prev };
        
        if (info.stats.produces) {
            info.stats.produces.forEach(prod => {
                next[prod.id] = (next[prod.id] || 0) + (prod.amount || 0);
                earnedItems.push(`${prod.amount} ${prod.name}`);
            });
        }

        if (info.stats.sometimesProduces) {
            info.stats.sometimesProduces.forEach(prod => {
                if (Math.random() * 100 < (prod.chance || 0)) {
                    const qty = prod.amount || 1;
                    next[prod.id] = (next[prod.id] || 0) + qty;
                    earnedItems.push(`${qty} ${prod.name}`);
                }
            });
        }
        
        return next;
    });

    setPlacedBuildings(prev => prev.map(b => {
        if (b.x === building.x && b.y === building.y) {
            if (b.buildingId === 405 || b.buildingId === 409) { 
                const lvl1 = buildingData.find(i => i.id === 400);
                if (lvl1) {
                     return { 
                        ...b, 
                        buildingId: 400,
                        type: lvl1.type,
                        hp: lvl1.stats.durability,
                        maxHp: lvl1.stats.durability,
                        workState: 'idle', 
                        workEndTime: undefined 
                     };
                }
            }

            return { ...b, workState: 'idle', workEndTime: undefined };
        }
        return b;
    }));

    setSelectedBuilding(null); 
  };
  
  const handleSetTax = (rate: number) => {
      if (!selectedBuilding) return;
      const newRate = Math.min(50, Math.max(0, rate));
      
      setPlacedBuildings(prev => prev.map(b => 
          b.x === selectedBuilding.building.x && b.y === selectedBuilding.building.y
          ? { ...b, taxRate: newRate }
          : b
      ));
      
      setSelectedBuilding(prev => prev ? { ...prev, building: { ...prev.building, taxRate: newRate } } : null);
  };

  const handleWithdrawBank = () => {
      if (clanBankBalance > 0) {
          setPlayerGold(prev => Math.min(goldCapacity, prev + clanBankBalance));
          setClanBankBalance(0);
          addHistoryLog(`Снято ${clanBankBalance} монет из банка клана.`, 'social');
          alert(`Вы сняли ${clanBankBalance} монет со счета клана.`);
      } else {
          alert("Банк клана пуст.");
      }
  };
  
  const handleSectorTeleport = (x: number, y: number) => {
      const zoom = ZOOM_LEVELS[zoomIndex];
      const isoX = (x - y) * (TILE_WIDTH * zoom / 2);
      const isoY = (x + y) * (TILE_HEIGHT * zoom / 2);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      setCameraOffset({
          x: centerX - isoX,
          y: centerY - isoY
      });
  };

  const handleMoveClick = () => {
    if (!selectedBuilding) return;
    
    const moveCost = (selectedBuilding.info.id === MOUNTAIN_ID || selectedBuilding.info.id === RIVER_ID) ? MOUNTAIN_MOVE_COST : MOVE_ENERGY_COST;
    
    if (playerEnergy < moveCost) {
        alert(`Недостаточно энергии! Требуется ${moveCost} ⚡.`);
        return;
    }
    setMoveMode({ active: true, building: selectedBuilding.building });
    setSelectedBuilding(null);
    setShowExplosionMenu(false);
  };

  const calculateRepairCost = (building: PlacedBuilding, info: Building) => {
      const currentHp = building.hp ?? info.stats.durability;
      const maxHp = building.maxHp ?? info.stats.durability;
      const missingHp = maxHp - currentHp;
      if (missingHp <= 0) return 0;
      
      const basePrice = info.price || (info.rubyPrice ? info.rubyPrice * 10000 : 100); 
      let cost = Math.ceil((missingHp / maxHp) * basePrice * 0.5);
      
      return Math.max(cost, missingHp);
  };

  const handleRepair = () => {
      if (!selectedBuilding) return;
      const { building, info } = selectedBuilding;
      const cost = calculateRepairCost(building, info);
      
      if (cost <= 0) return;
      if (playerGold < cost) {
          alert(`Недостаточно золота для починки! Требуется ${cost}`);
          return;
      }

      setPlayerGold(prev => prev - cost);
      addHistoryLog(`Починка здания "${info.name}". Стоимость: ${cost} монет.`, 'build');
      
      const maxHp = building.maxHp ?? info.stats.durability;

      setPlacedBuildings(prev => prev.map(b => 
          b.x === building.x && b.y === building.y 
          ? { ...b, hp: maxHp, isDestroying: false, destructionEndTime: undefined, pendingDamage: 0 } 
          : b
      ));

      setSelectedBuilding(prev => prev ? ({
          ...prev,
          building: { ...prev.building, hp: maxHp, isDestroying: false }
      }) : null);
  };

  const handleSell = () => {
      if (!selectedBuilding) return;
      
      const { building, info } = selectedBuilding;
      
      const refundGold = Math.floor((info.price || 0) / 2);
      const refundResources: {id: number, amount: number}[] = [];

      if (info.constructionRequirements.resources) {
          info.constructionRequirements.resources.forEach(req => {
              refundResources.push({ id: req.id, amount: Math.floor((req.amount || 0) / 2) });
          });
      }

      if (refundGold > 0) {
          setPlayerGold(prev => prev + refundGold);
      }
      
      if (refundResources.length > 0) {
          setInventory(prev => {
              const next = { ...prev };
              refundResources.forEach(r => {
                  next[r.id] = (next[r.id] || 0) + r.amount;
              });
              return next;
          });
      }

      addHistoryLog(`Продано здание "${info.name}". Получено: ${refundGold} монет.`, 'economy');

      setPlacedBuildings(prev => prev.filter(b => b.x !== building.x || b.y !== building.y));
      
      setSelectedBuilding(null);
      setShowExplosionMenu(false);
      setShowProtectionMenu(false);
  };

  const handleApplyProtection = (cost: number, duration: number) => {
      if (!selectedBuilding) return;

      if (playerRubies < cost) {
          alert("Недостаточно рубинов!");
          return;
      }

      setPlayerRubies(prev => prev - cost);
      const protectionEndTime = Date.now() + duration;

      addHistoryLog(`Активирована защита для "${selectedBuilding.info.name}". Стоимость: ${cost} рубинов.`, 'social');

      setPlacedBuildings(prev => prev.map(b => 
          b.x === selectedBuilding.building.x && b.y === selectedBuilding.building.y
          ? { ...b, protectionEndTime }
          : b
      ));

       setVisualEffects(prev => [...prev, {
          id: Date.now(),
          x: selectedBuilding.building.x,
          y: selectedBuilding.building.y,
          type: 'upgrade',
          startTime: Date.now(),
          duration: UPGRADE_EFFECT_DURATION
      }]);

      setSelectedBuilding(null);
      setShowProtectionMenu(false);
  };

  const handleExplode = (destructionOption: DestructionInfo) => {
    if (!selectedBuilding) return;
    
    if (isBanned()) {
        alert("Вы забанены и не можете ничего взрывать!");
        return;
    }

    if (selectedBuilding.building.protectionEndTime && selectedBuilding.building.protectionEndTime > Date.now()) {
        alert("Здание находится под защитой! Взрыв невозможен.");
        return;
    }
    
    if (playerGold < destructionOption.goldCost) {
        alert(`Недостаточно золота! Нужно ${destructionOption.goldCost}.`);
        return;
    }
    if (playerEnergy < destructionOption.energyCost) {
        alert(`Недостаточно энергии! Нужно ${destructionOption.energyCost}.`);
        return;
    }
    const currentAmount = inventory[destructionOption.resourceId] || 0;
    if (currentAmount < destructionOption.amount) {
        alert(`Недостаточно предмета "${destructionOption.weaponName}"! Нужно ${destructionOption.amount}, у вас ${currentAmount}.`);
        return;
    }

    setPlayerGold(prev => prev - destructionOption.goldCost);
    setPlayerEnergy(prev => prev - destructionOption.energyCost);
    setInventory(prev => ({
        ...prev,
        [destructionOption.resourceId]: (prev[destructionOption.resourceId] || 0) - destructionOption.amount
    }));

    addHistoryLog(`Взорвано здание "${selectedBuilding.info.name}" в [${selectedBuilding.building.x}, ${selectedBuilding.building.y}] оружием "${destructionOption.weaponName}". Расход: ${destructionOption.goldCost} золота, ${destructionOption.energyCost} энергии.`, 'destroy');

    setPlacedBuildings(prev => {
        return prev.map(b => {
            if (b.x === selectedBuilding.building.x && b.y === selectedBuilding.building.y) {
                const currentHp = b.hp ?? selectedBuilding.info.stats.durability;
                const maxHp = b.maxHp ?? selectedBuilding.info.stats.durability;
                
                return {
                    ...b,
                    hp: currentHp,
                    maxHp: maxHp,
                    isDestroying: true,
                    destructionEndTime: Date.now() + destructionOption.timeSeconds * 1000,
                    pendingDamage: destructionOption.damage || 0
                };
            }
            return b;
        });
    });

    setSelectedBuilding(null);
    setShowExplosionMenu(false);
  };

  const handleSpeedUp = () => {
        if (!selectedBuilding || !selectedBuilding.building.isConstructing) return;
        const { building, info } = selectedBuilding;
        const cost = info.stats.accelerationCost || 0;

        if (playerRubies < cost) {
            alert("Недостаточно рубинов!");
            return;
        }

        setPlayerRubies(prev => prev - cost);
        addHistoryLog(`Ускорено строительство "${info.name}". Стоимость: ${cost} рубинов.`, 'economy');

        setPlacedBuildings(prev => prev.map(b => {
            if (b.x === building.x && b.y === building.y) {
                return {
                    ...b,
                    isConstructing: false,
                    constructionEndTime: 0,
                    workState: 'idle'
                };
            }
            return b;
        }));

        setSelectedBuilding(prev => prev ? {
            ...prev,
            building: {
                ...prev.building,
                isConstructing: false,
                constructionEndTime: 0,
                workState: 'idle'
            }
        } : null);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
              setPlayerAvatar(e.target?.result as string);
              addHistoryLog("Изменен аватар профиля.", 'social');
          };
          reader.readAsDataURL(event.target.files[0]);
      }
  };
  
  const handleSelectBuildingFromMenu = (building: Building) => {
    setBuildMenu({ visible: false, x: 0, y: 0 });
    setBuildConfirmation({ visible: true, building, x: buildMenu.x, y: buildMenu.y });
  };
  
  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const oldZoom = ZOOM_LEVELS[zoomIndex];
    
    let newZoomIndex = zoomIndex;
    if (event.deltaY < 0) { 
        newZoomIndex = Math.min(ZOOM_LEVELS.length - 1, zoomIndex + 1);
    } else { 
        newZoomIndex = Math.max(0, zoomIndex - 1);
    }

    if (newZoomIndex === zoomIndex) return;

    const newZoom = ZOOM_LEVELS[newZoomIndex];
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const newCameraX = mouseX - ((mouseX - cameraOffset.x) / oldZoom) * newZoom;
    const newCameraY = mouseY - ((mouseY - cameraOffset.y) / oldZoom) * newZoom;

    setZoomIndex(newZoomIndex);
    setCameraOffset({ x: newCameraX, y: newCameraY });
  }, [zoomIndex, cameraOffset]);
  
  const handleTeleportToTownHall = () => {
      const townHall = placedBuildings.find(b => b.type === BuildingType.TownHall && b.ownerId === 0);
      if (townHall) {
          handleSectorTeleport(townHall.x, townHall.y);
      } else {
          alert("У вас нет главного здания!");
      }
  };
  
  const handleSendMessage = (type: 'normal' | 'shout') => {
      if (isBanned()) {
          alert("Вы забанены и не можете писать в чат!");
          return;
      }
      if (!chatInput.trim()) return;
      
      if (type === 'shout') {
          setShowShoutModal(true);
          return;
      }
      
      let messageText = chatInput;
      const activeCurse = activeCurses[playerName];
      if (activeCurse && Date.now() < activeCurse.endTime) {
          messageText = `${activeCurse.prefix} ${messageText}`;
      }

      const newMessage: ChatMessage = {
          id: Date.now(),
          sender: playerName,
          text: messageText,
          type: type,
          timestamp: Date.now(),
          tab: activeChatTab
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      setChatInput('');
  };

  const handleConfirmShout = () => {
      if (isBanned()) {
          alert("Вы забанены и не можете кричать!");
          setShowShoutModal(false);
          return;
      }
      if (playerGold < SHOUT_COST_GOLD) {
          alert(`Недостаточно золота! Требуется ${SHOUT_COST_GOLD}.`);
          return;
      }
      if (playerEnergy < SHOUT_COST_ENERGY) {
          alert(`Недостаточно энергии! Требуется ${SHOUT_COST_ENERGY}.`);
          return;
      }

      setPlayerGold(prev => prev - SHOUT_COST_GOLD);
      setPlayerEnergy(prev => prev - SHOUT_COST_ENERGY);
      addHistoryLog(`Использован крик. Расход: ${SHOUT_COST_GOLD} монет, ${SHOUT_COST_ENERGY} энергии.`, 'social');

      let messageText = chatInput;
      const activeCurse = activeCurses[playerName];
      if (activeCurse && Date.now() < activeCurse.endTime) {
          messageText = `${activeCurse.prefix} ${messageText}`;
      }

      const newMessage: ChatMessage = {
          id: Date.now(),
          sender: playerName,
          text: messageText,
          type: 'shout',
          timestamp: Date.now(),
          tab: 'all' 
      };

      setChatHistory(prev => [...prev, newMessage]);
      setChatInput('');
      setShowShoutModal(false);
  };

  const handleSwitchChatTab = (newTab: ChatTab) => {
      if (newTab === activeChatTab) return;

      setOnlineUsers(prev => {
          const cleanedUsers: Record<ChatTab, string[]> = {
              general: prev.general.filter(n => n !== playerName),
              banya: prev.banya.filter(n => n !== playerName),
              loot: prev.loot.filter(n => n !== playerName),
              clan: prev.clan.filter(n => n !== playerName)
          };
          
          cleanedUsers[activeChatTab].push(playerName);
          return cleanedUsers;
      });

      setChatHistory(prev => {
          const filteredHistory = prev.filter(msg => 
              !(msg.type === 'system' && msg.text === `Игрок ${playerName} присоединился к чату.` && msg.tab === newTab)
          );
          
          const sysMsg: ChatMessage = {
              id: Date.now(),
              sender: 'Система',
              text: `Игрок ${playerName} присоединился к чату.`,
              type: 'system',
              timestamp: Date.now(),
              tab: newTab
          };
          
          return [...filteredHistory, sysMsg];
      });

      setActiveChatTab(newTab);
  };

  const handleSendLocation = () => {
        if (isBanned()) {
            alert("Вы забанены и не можете делиться местоположением!");
            return;
        }
        const now = Date.now();
        if (now - lastLocationShareTime < LOCATION_SHARE_COOLDOWN) {
            const remaining = Math.ceil((LOCATION_SHARE_COOLDOWN - (now - lastLocationShareTime)) / 1000);
            alert(`Пожалуйста, подождите еще ${remaining} секунд перед следующей отправкой координат.`);
            return;
        }
        setLastLocationShareTime(now);

        const zoom = ZOOM_LEVELS[zoomIndex];
        const { x, y } = screenToWorld(window.innerWidth / 2, window.innerHeight / 2, zoom);
        
        const newMessage: ChatMessage = {
            id: Date.now(),
            sender: playerName,
            text: "Посмотрите сюда",
            type: 'normal',
            timestamp: Date.now(),
            tab: activeChatTab,
            teleportCoordinates: { x: Math.floor(x), y: Math.floor(y) }
        };
        
        setChatHistory(prev => [...prev, newMessage]);
    };

  const handleEmojiClick = (emojiCode: string) => {
      setChatInput(prev => prev + emojiCode + ' ');
      setShowEmojiPicker(false);
  };

  const renderMessageText = (text: string) => {
      const regex = new RegExp(`(${KOLOBOK_EMOJIS.map(e => e.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
      
      const parts = text.split(regex);
      
      return parts.map((part, index) => {
          const emoji = KOLOBOK_EMOJIS.find(e => e.code === part);
          if (emoji) {
              return <img key={index} src={emoji.url} alt={emoji.code} className="inline-block w-6 h-6 align-middle mx-0.5" title={emoji.code} />;
          }
          return <span key={index}>{part}</span>;
      });
  };

  // Clan Handlers
  const handleClanAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
              setNewClanAvatar(e.target?.result as string);
          };
          reader.readAsDataURL(event.target.files[0]);
      }
  };

  const handleCreateClan = () => {
      if (!newClanName.trim()) {
          alert("Введите название клана!");
          return;
      }
      if (newClanDesc.length > 500) {
          alert("Описание слишком длинное! Максимум 500 символов.");
          return;
      }
      
      const newClan: Clan = {
          id: Date.now(),
          name: newClanName,
          description: newClanDesc,
          avatarUrl: newClanAvatar,
          leaderName: playerName,
          membersCount: 1
      };
      
      setClans(prev => [...prev, newClan]);
      setPlayerClanId(newClan.id);
      setShowCreateClanMode(false);
      setNewClanName('');
      setNewClanDesc('');
      setNewClanAvatar(null);
      addHistoryLog(`Создан клан "${newClanName}".`, 'social');
      alert("Клан успешно создан!");
  };

  const handleJoinClan = (clanId: number) => {
      setPlayerClanId(clanId);
      const clanName = clans.find(c => c.id === clanId)?.name;
      addHistoryLog(`Вступление в клан "${clanName}".`, 'social');
      alert("Вы вступили в клан!");
  };

  const handleLeaveClan = () => {
      setShowLeaveClanConfirmation(true);
  };
  
  const handleConfirmLeaveClan = () => {
      setPlayerClanId(null);
      setShowLeaveClanConfirmation(false);
      addHistoryLog("Выход из клана.", 'social');
      alert("Вы покинули клан.");
  };


  const gloryToNextLevel = getGloryForLevel(playerLevel);
  const xpPercentage = playerLevel >= MAX_LEVEL ? 100 : (playerGlory / gloryToNextLevel) * 100;
  
  const playerBuildingsCount = placedBuildings.filter(b => b.ownerId === 0).length;

  const buildTabs: { name: BuildMenuTab, icon: React.ReactNode }[] = [
    { name: 'Жилые', icon: <ResidentialIcon className="w-6 h-6"/> },
    { name: 'Бизнес', icon: <BusinessIcon className="w-6 h-6"/> },
    { name: 'Защита', icon: <DefenseIcon className="w-6 h-6"/> },
    { name: 'Буквы', icon: <LettersIcon className="w-6 h-6"/> },
    { name: 'Зелень', icon: <GreeneryIcon className="w-6 h-6"/> },
    { name: 'Дороги и стены', icon: <RoadsIcon className="w-6 h-6"/> },
    { name: 'Заводы', icon: <FactoriesIcon className="w-6 h-6"/> },
    { name: 'Монстры', icon: <MonstersIcon className="w-6 h-6"/> },
    { name: 'Клан', icon: <ClanIcon className="w-6 h-6"/> },
    { name: 'Подарки', icon: <GiftsIcon className="w-6 h-6"/> },
  ];

  const buildingsInCurrentTab = buildingData.filter(b => b.category === activeBuildTab && b.id !== TOWN_HALL_ID && b.buildable !== false);

  const repairCost = selectedBuilding ? calculateRepairCost(selectedBuilding.building, selectedBuilding.info) : 0;
  
  const filteredMessages = chatHistory.filter(msg => {
      if (msg.tab === 'all') return true;
      return msg.tab === activeChatTab;
  });

  const protectedTowerInfo = useMemo(() => buildingData.find(b => b.id === PROTECTED_TOWER_ID), []);
  const isLocationCooldown = Date.now() - lastLocationShareTime < LOCATION_SHARE_COOLDOWN;

  return (
    <div className="relative w-screen h-screen">
      {authMode === 'welcome' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center max-w-lg border border-gray-600">
            <h1 className="text-3xl font-bold text-yellow-400 mb-6">Game Wiki RTS</h1>
            <div className="space-y-4">
               <button onClick={() => setAuthMode('login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
                  Войти
               </button>
               <button onClick={() => setAuthMode('register')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
                  Регистрация
               </button>
               <div className="border-t border-gray-600 my-4 pt-4">
                  <button 
                      onClick={handleGuestStart}
                      className="text-gray-400 hover:text-white underline text-sm"
                  >
                      Играть как гость
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {authMode === 'login' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Вход</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Имя пользователя</label>
                <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"/>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Пароль</label>
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"/>
              </div>
              <button onClick={handleLogin} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4">Войти</button>
              <button onClick={() => setAuthMode('welcome')} className="w-full text-gray-400 hover:text-white mt-2 text-sm">Назад</button>
            </div>
          </div>
        </div>
      )}

      {authMode === 'register' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full border border-gray-600">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Регистрация</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Имя пользователя</label>
                <input type="text" value={registerForm.username} onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"/>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Пароль (опционально)</label>
                <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"/>
              </div>
              <button onClick={handleRegister} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-4">Создать аккаунт</button>
              <button onClick={() => setAuthMode('welcome')} className="w-full text-gray-400 hover:text-white mt-2 text-sm">Назад</button>
            </div>
          </div>
        </div>
      )}
      
      {moveMode.active && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-md text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-4 border border-blue-400">
              <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">Выберите новое место</span>
                  <span className="text-xs text-blue-200">Стоимость: {(moveMode.building?.buildingId === MOUNTAIN_ID || moveMode.building?.buildingId === RIVER_ID) ? MOUNTAIN_MOVE_COST : MOVE_ENERGY_COST} ⚡</span>
              </div>
              <button onClick={() => setMoveMode({active: false, building: null})} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-bold transition-colors">Отмена</button>
          </div>
      )}
      
      {selectedOilDeposit && !authMode && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedOilDeposit(null)}>
              <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md border border-gray-600 relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold text-white mb-4">Месторождение нефти</h2>
                  <button onClick={() => setSelectedOilDeposit(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                      <CloseIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="w-32 h-32 bg-gray-900 rounded-lg mb-6 flex items-center justify-center border border-gray-700">
                      <img src={oilImageUrl} alt="Oil" className="max-w-full max-h-full object-contain"/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                      <button 
                          onClick={handleShareOil}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors"
                      >
                          <CompassIcon className="w-8 h-8 mb-2" />
                          <span>Поделиться</span>
                      </button>
                      
                      <button 
                          onClick={handleBuildOilRig}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors"
                      >
                          {oilRigInfo && (
                              <>
                                <img src={oilRigInfo.imageUrl} alt="Rig" className="w-8 h-8 mb-1 object-contain"/>
                                <span className="text-sm mb-1">Построить</span>
                                <div className="flex items-center text-yellow-300 text-sm">
                                    <img src={coinImageUrl} className="w-3 h-3 mr-1"/>
                                    {oilRigInfo.price?.toLocaleString()}
                                </div>
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      {selectedQuarry && !authMode && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedQuarry(null)}>
              <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md border border-gray-600 relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold text-white mb-4">Заброшенная каменоломня</h2>
                  <button onClick={() => setSelectedQuarry(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                      <CloseIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="w-32 h-32 bg-gray-900 rounded-lg mb-6 flex items-center justify-center border border-gray-700">
                      <img src={quarryImageUrl} alt="Quarry" className="max-w-full max-h-full object-contain"/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                      <button 
                          onClick={handleShareQuarry}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors"
                      >
                          <CompassIcon className="w-8 h-8 mb-2" />
                          <span>Поделиться</span>
                      </button>
                      
                      <button 
                          onClick={handleBuildWildQuarry}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-colors"
                      >
                          {wildQuarryInfo && (
                              <>
                                <img src={wildQuarryInfo.imageUrl} alt="Wild Quarry" className="w-8 h-8 mb-1 object-contain"/>
                                <span className="text-sm mb-1">Построить</span>
                                <div className="flex items-center text-yellow-300 text-sm">
                                    <img src={coinImageUrl} className="w-3 h-3 mr-1"/>
                                    {wildQuarryInfo.price?.toLocaleString()}
                                </div>
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      {selectedChatUser && !authMode && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[60] backdrop-blur-sm" onClick={() => {setSelectedChatUser(null); setShowBanMenu(false); setShowPunishMenu(false); setShowCurseMenu(false);}}>
              <div className="bg-gray-800 p-5 rounded-lg shadow-2xl w-80 border border-gray-600 relative flex flex-col max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => {setSelectedChatUser(null); setShowBanMenu(false); setShowPunishMenu(false); setShowCurseMenu(false);}} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    
                    <h2 className="text-2xl font-bold text-white mb-1 text-center truncate px-6">{selectedChatUser}</h2>
                    
                    <div className="mb-4 space-y-3">
                        <div>
                             <div className="flex justify-between text-xs text-gray-300 mb-1">
                                 <span>Уровень {getUserLevel(selectedChatUser)}</span>
                                 <span className="text-gray-500">? / ?</span>
                             </div>
                             <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: selectedChatUser === playerName ? `${xpPercentage}%` : '50%' }}></div>
                            </div>
                        </div>
                        
                         <div>
                             <div className="flex justify-between text-xs text-gray-300 mb-1">
                                 <span>Репутация</span>
                                 <span className="text-gray-500">{userReputations[selectedChatUser] || 0}/{MAX_REPUTATION}</span>
                             </div>
                             <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, ((userReputations[selectedChatUser] || 0) / MAX_REPUTATION) * 100))}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {!showBanMenu && !showPunishMenu && !showCurseMenu ? (
                        <div className="grid grid-cols-1 gap-2">
                             <button onClick={() => setShowBanMenu(true)} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 rounded text-sm transition-colors">Забанить</button>
                             <button onClick={() => handleReputationAction('praise')} className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded text-sm transition-colors">Похвалить</button>
                             <button onClick={() => handleReputationAction('complain')} className="w-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 rounded text-sm transition-colors">Пожаловаться</button>
                             <button className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 rounded text-sm transition-colors">Это мой король!</button>
                             <button className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 rounded text-sm transition-colors">Персонаж</button>
                             <button className="w-full bg-pink-700 hover:bg-pink-600 text-white font-bold py-2 rounded text-sm transition-colors flex justify-center items-center">Купить ему Рубины <img src={rubyImageUrl} className="w-3 h-3 ml-1"/></button>
                             <button className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded text-sm transition-colors">Постройки</button>
                             <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm transition-colors">Подарить</button>
                             <button onClick={handleAddFriend} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded text-sm transition-colors">Добавить в друзья</button>
                             <button className="w-full bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition-colors">Приватное сообщение</button>
                             <button onClick={() => setShowPunishMenu(true)} className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-2 rounded text-sm transition-colors border border-red-500">Наказать</button>
                             <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded text-sm transition-colors">Написать письмо</button>
                             <button onClick={() => setShowCurseMenu(true)} className="w-full bg-violet-800 hover:bg-violet-700 text-white font-bold py-2 rounded text-sm transition-colors border border-violet-500">Заколдовать</button>
                        </div>
                    ) : showBanMenu ? (
                        <div className="flex flex-col space-y-2">
                             <button onClick={() => setShowBanMenu(false)} className="text-blue-400 text-sm mb-2 text-left">← Назад</button>
                             <h3 className="text-white font-bold text-center mb-2">Выберите срок бана</h3>
                             {BAN_OPTIONS.map((option, idx) => {
                                 const targetRep = userReputations[selectedChatUser!] || 0;
                                 const multiplier = 1 + Math.floor(Math.max(0, targetRep) / 5);
                                 const dynamicCost = option.cost * multiplier;
                                 
                                 return (
                                     <button
                                         key={idx}
                                         onClick={() => handleBanPlayer(dynamicCost, option.durationMinutes)}
                                         disabled={playerGold < dynamicCost}
                                         className="w-full bg-red-900/80 hover:bg-red-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm border border-red-700 flex justify-between items-center transition-colors"
                                     >
                                         <span>{option.label}</span>
                                         <span className="flex items-center text-yellow-400 font-bold">
                                             {dynamicCost.toLocaleString()} <img src={coinImageUrl} className="w-3 h-3 ml-1"/>
                                         </span>
                                     </button>
                                 );
                             })}
                        </div>
                    ) : showPunishMenu ? (
                        <div className="flex flex-col space-y-2">
                             <button onClick={() => setShowPunishMenu(false)} className="text-blue-400 text-sm mb-2 text-left">← Назад</button>
                             <h3 className="text-white font-bold text-center mb-2">Выберите наказание для {selectedChatUser}</h3>
                             {PUNISHMENT_OPTIONS.map((option, idx) => (
                                 <button
                                     key={idx}
                                     onClick={() => handlePunishPlayer(option.cost, option.gloryPenalty, option.label)}
                                     disabled={playerRubies < option.cost}
                                     className="w-full bg-red-900/80 hover:bg-red-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm border border-red-700 flex justify-between items-center transition-colors"
                                 >
                                     <div className="flex items-center">
                                         <img src={rubyImageUrl} className="w-4 h-4 mr-2 object-contain" alt="ruby"/>
                                         <span className="font-bold mr-1">{option.cost}</span>
                                         <span>{option.label}</span>
                                     </div>
                                     <span className="text-gray-300 text-xs">(-{option.gloryPenalty} славы)</span>
                                 </button>
                             ))}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2">
                             <button onClick={() => setShowCurseMenu(false)} className="text-blue-400 text-sm mb-2 text-left">← Назад</button>
                             <h3 className="text-white font-bold text-center mb-2">Заколдовать {selectedChatUser}</h3>
                             {CURSE_OPTIONS.map((option, idx) => (
                                 <button
                                     key={idx}
                                     onClick={() => handleCursePlayer(option.cost, option.durationMinutes, option.prefix, option.label)}
                                     disabled={playerGold < option.cost}
                                     className="w-full bg-violet-900/80 hover:bg-violet-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm border border-violet-700 flex justify-between items-center transition-colors"
                                 >
                                     <div className="flex flex-col items-start">
                                         <span className="font-bold">{option.label}</span>
                                         <span className="text-gray-400 text-xs italic">{option.prefix}</span>
                                     </div>
                                     <div className="flex flex-col items-end">
                                         <span className="flex items-center text-yellow-400 font-bold">
                                             {option.cost.toLocaleString()} <img src={coinImageUrl} className="w-3 h-3 ml-1"/>
                                         </span>
                                         <span className="text-xs text-gray-300">{option.durationMinutes} мин.</span>
                                     </div>
                                 </button>
                             ))}
                        </div>
                    )}
              </div>
          </div>
      )}

      {selectedBuilding && !authMode && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40" onClick={() => {setSelectedBuilding(null); setShowExplosionMenu(false); setShowProtectionMenu(false);}}>
              <div className="bg-gray-800/90 w-96 rounded-xl border border-gray-600 flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-4 border-b border-gray-700">
                      <h2 className="text-xl font-bold text-white">{selectedBuilding.info.name}</h2>
                      <button onClick={() => {setSelectedBuilding(null); setShowExplosionMenu(false); setShowProtectionMenu(false);}} className="text-gray-400 hover:text-white">
                          <CloseIcon className="w-6 h-6" />
                      </button>
                  </div>
                  {!showExplosionMenu && !showProtectionMenu ? (
                  <div className="p-4">
                      {selectedBuilding.info.stats.workTimeSeconds && (
                          <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/30 mb-4">
                             <h3 className="text-lg font-bold text-blue-300 mb-2">Производство</h3>
                             
                             {(!selectedBuilding.building.workState || selectedBuilding.building.workState === 'idle') && (
                                <div>
                                   <div className="flex flex-wrap gap-2 mb-3">
                                      {selectedBuilding.info.stats.takesPopulation && (
                                         <div className={`px-2 py-1 rounded text-sm flex items-center ${maxPopulation - currentPopulation >= selectedBuilding.info.stats.takesPopulation ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'}`}>
                                            <img src={populationImageUrl} className="w-4 h-4 mr-1" alt="pop"/>
                                            {selectedBuilding.info.stats.takesPopulation} чел.
                                         </div>
                                      )}
                                      {selectedBuilding.info.stats.consumes?.map(req => {
                                         const has = (inventory[req.id] || 0) >= (req.amount || 0);
                                         return (
                                            <div key={req.id} className={`px-2 py-1 rounded text-sm flex items-center ${has ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'}`}>
                                                <span>{req.name}: {req.amount}</span>
                                            </div>
                                         );
                                      })}
                                   </div>
                                   <button onClick={handleStartProduction} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded">
                                      Начать работу ({selectedBuilding.info.stats.workTimeSeconds} сек)
                                   </button>
                                </div>
                             )}

                             {selectedBuilding.building.workState === 'working' && (
                                <div className="text-center py-2">
                                   <p className="text-yellow-400 font-bold animate-pulse">Идет производство...</p>
                                   <p className="text-xs text-gray-400 mt-1">Взаимодействие ограничено</p>
                                </div>
                             )}

                             {selectedBuilding.building.workState === 'finished' && (
                                <div className="text-center py-2">
                                    {[400, 401, 402, 403, 404, 406, 407, 408].includes(selectedBuilding.info.id) ? (
                                         <button onClick={handleStartProduction} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded flex items-center justify-center">
                                            <img src={builderIconUrl} className="w-6 h-6 mr-2" alt="worker"/>
                                            Отправить рабочего
                                         </button>
                                    ) : (
                                         <button onClick={handleCollectProduction} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded animate-bounce">
                                            Забрать продукцию
                                         </button>
                                    )}
                                </div>
                             )}
                          </div>
                      )}

                      {/* Watchtower Tax Settings */}
                      {selectedBuilding.info.id === WATCHTOWER_ID && (
                          <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/30 mb-4">
                               <h3 className="text-lg font-bold text-purple-300 mb-2">Налог сектора</h3>
                               <p className="text-sm text-gray-400 mb-2">Установите налог (0-50%) для этого сектора.</p>
                               <div className="flex items-center space-x-2">
                                   <input 
                                       type="range" 
                                       min="0" 
                                       max="50" 
                                       value={selectedBuilding.building.taxRate || 0} 
                                       onChange={(e) => handleSetTax(parseInt(e.target.value))}
                                       className="w-full"
                                   />
                                   <span className="font-bold text-white w-12 text-right">{selectedBuilding.building.taxRate || 0}%</span>
                               </div>
                          </div>
                      )}

                      {/* Clan Castle Bank */}
                      {selectedBuilding.info.id === CLAN_CASTLE_ID && (
                          <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-500/30 mb-4 text-center">
                               <h3 className="text-lg font-bold text-yellow-400 mb-2">Банк Клана</h3>
                               <p className="text-sm text-gray-400 mb-3">Накопленная прибыль с налогов.</p>
                               <div className="text-2xl font-bold text-white mb-3 flex items-center justify-center">
                                   <img src={coinImageUrl} className="w-6 h-6 mr-2 object-contain" alt="coin"/>
                                   {clanBankBalance}
                               </div>
                               <button 
                                   onClick={handleWithdrawBank}
                                   disabled={clanBankBalance <= 0}
                                   className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
                               >
                                   Забрать прибыль
                               </button>
                          </div>
                      )}
                      
                      <p className="text-gray-300 mb-4">{selectedBuilding.info.description}</p>
                      
                      <div className="text-sm space-y-1 text-gray-400">
                        {selectedBuilding.info.id !== MOUNTAIN_ID && selectedBuilding.info.id !== RIVER_ID && (
                           <p>Прочность: <span className="font-bold text-white">{selectedBuilding.info.stats.durability}</span></p>
                        )}
                        {selectedBuilding.building.hp !== undefined && selectedBuilding.info.id !== MOUNTAIN_ID && selectedBuilding.info.id !== RIVER_ID && (
                           <p>Здоровье: <span className={`${selectedBuilding.building.hp < selectedBuilding.info.stats.durability ? 'text-red-400' : 'text-green-400'} font-bold`}>{selectedBuilding.building.hp} / {selectedBuilding.info.stats.durability}</span></p>
                        )}
                        {selectedBuilding.info.stats.populationBonus && <p>Даёт населения: <span className="font-bold text-white">{selectedBuilding.info.stats.populationBonus}</span></p>}
                        
                        {selectedBuilding.building.isConstructing && (
                             <ConstructionTimer 
                                 endTime={selectedBuilding.building.constructionEndTime} 
                                 cost={selectedBuilding.info.stats.accelerationCost || 0}
                                 onSpeedUp={handleSpeedUp}
                             />
                        )}
                      </div>
                      
                      {selectedBuilding.info.id === AUCTION_ID && (
                          <div className="mt-4 p-3 bg-gray-900/50 rounded border border-yellow-500/30">
                              <h4 className="text-yellow-400 font-bold mb-2 text-center">Обмен валюты</h4>
                              <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center text-sm text-gray-300">
                                      <span>10 000</span>
                                      <img src={coinImageUrl} className="w-4 h-4 mx-1 object-contain" alt="coin" />
                                      <span>➔ 1</span>
                                      <img src={rubyImageUrl} className="w-4 h-4 ml-1 object-contain" alt="ruby" />
                                  </div>
                                  <button 
                                      onClick={handleBuyRuby}
                                      disabled={playerGold < 10000}
                                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                                  >
                                      Купить
                                  </button>
                              </div>
                          </div>
                      )}
                      
                      {/* Building Upgrades Block... */}
                      {selectedBuilding.info.upgradesTo && selectedBuilding.building.buildingId !== MOUNTAIN_ID && selectedBuilding.building.buildingId !== RIVER_ID && (
                           <button 
                                onClick={handleUpgrade} 
                                disabled={playerGold < (selectedBuilding.info.upgradeCost || 0) || selectedBuilding.building.isConstructing}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                <span>Улучшить ({selectedBuilding.info.upgradeCost})</span>
                            </button>
                      )}

                      <div className="mt-6 grid grid-cols-3 gap-2">
                           {selectedBuilding.info.id === MARKET_ID && (
                               <button 
                                   onClick={() => { setMarketType('general'); setShowMarketModal(true); }}
                                   className="col-span-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 mb-2"
                               >
                                   <TradeIcon className="w-5 h-5 mb-1" />
                                   <span>Торговля</span>
                               </button>
                           )}

                           {selectedBuilding.info.id === MILITARY_MARKET_ID && (
                               <button 
                                   onClick={() => { setMarketType('military'); setShowMarketModal(true); }}
                                   className="col-span-3 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 mb-2 border border-red-500"
                               >
                                   <TradeIcon className="w-5 h-5 mb-1" />
                                   <span>Купить/Продать</span>
                               </button>
                           )}

                           {(selectedBuilding.building.ownerId === 0 || selectedBuilding.building.buildingId === MOUNTAIN_ID || selectedBuilding.building.buildingId === RIVER_ID) && (
                              <>
                                  {repairCost > 0 && selectedBuilding.building.buildingId !== MOUNTAIN_ID && selectedBuilding.building.buildingId !== RIVER_ID ? (
                                      <button
                                          onClick={handleRepair}
                                          disabled={playerGold < repairCost}
                                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                          title={`Починить за ${repairCost} золота`}
                                      >
                                          <RepairIcon className="w-4 h-4 mb-1" />
                                          <span>{repairCost}</span>
                                      </button>
                                  ) : selectedBuilding.building.buildingId !== MOUNTAIN_ID && selectedBuilding.building.buildingId !== RIVER_ID && (
                                      <button disabled className="bg-gray-700 text-gray-500 font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 cursor-not-allowed">
                                              <RepairIcon className="w-4 h-4 mb-1" />
                                              <span>Починить</span>
                                      </button>
                                  )}
                                  
                                  {selectedBuilding.building.buildingId !== MOUNTAIN_ID && selectedBuilding.building.buildingId !== RIVER_ID && (
                                    <button 
                                        onClick={() => setShowProtectionMenu(true)}
                                        className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                    >
                                        <ShieldIcon className="w-4 h-4 mb-1"/>
                                        <span>Защитить</span>
                                    </button>
                                  )}

                                  <button 
                                      onClick={handleMoveClick}
                                      className={`${(selectedBuilding.building.buildingId === MOUNTAIN_ID || selectedBuilding.building.buildingId === RIVER_ID) ? 'col-span-2' : ''} bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed`}
                                      title={`Переместить за ${(selectedBuilding.building.buildingId === MOUNTAIN_ID || selectedBuilding.building.buildingId === RIVER_ID) ? MOUNTAIN_MOVE_COST : MOVE_ENERGY_COST} энергии`}
                                  >
                                      <MoveIcon className="w-4 h-4 mb-1" />
                                      <span>Переместить</span>
                                  </button>

                                  {selectedBuilding.building.buildingId !== MOUNTAIN_ID && selectedBuilding.building.buildingId !== RIVER_ID && (
                                    <button 
                                        onClick={handleSell}
                                        className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        title="Продать за 50% стоимости"
                                    >
                                        <SellIcon className="w-4 h-4 mb-1" />
                                        <span>Продать</span>
                                    </button>
                                  )}
                              </>
                           )}

                          {selectedBuilding.building.buildingId !== MOUNTAIN_ID && selectedBuilding.building.buildingId !== RIVER_ID && (
                             <button 
                                onClick={() => setShowExplosionMenu(true)}
                                className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed ${selectedBuilding.building.ownerId !== 0 ? 'col-span-3' : ''}`}
                             >
                                 <span>Взорвать</span>
                             </button>
                          )}
                      </div>
                  </div>
                  ) : showExplosionMenu ? (
                    <div className="p-4">
                        <button onClick={() => setShowExplosionMenu(false)} className="mb-4 text-blue-400 hover:text-blue-300 text-sm flex items-center">
                             ← Назад
                        </button>
                        <h3 className="text-lg font-bold text-white mb-3">Чем взрываем?</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {selectedBuilding.info.destructionInfo && selectedBuilding.info.destructionInfo.length > 0 ? (
                                selectedBuilding.info.destructionInfo.map((option, idx) => {
                                    const item = itemData.find(i => i.id === option.resourceId);
                                    const hasEnough = (inventory[option.resourceId] || 0) >= option.amount;
                                    const hasGold = playerGold >= option.goldCost;
                                    const hasEnergy = playerEnergy >= option.energyCost;
                                    const canExplode = hasEnough && hasGold && hasEnergy;

                                    return (
                                        <div key={idx} className="bg-gray-700/50 p-3 rounded border border-gray-600">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 mr-2">
                                                       {item && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain"/>}
                                                    </div>
                                                    <span className="font-bold">{option.weaponName}</span>
                                                </div>
                                                <span className={`${hasEnough ? 'text-green-400' : 'text-red-400'} text-sm`}>
                                                    {inventory[option.resourceId] || 0} / {option.amount}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-300 space-y-1 mb-3">
                                                <div className="flex justify-between">
                                                    <span>Стоимость:</span> 
                                                    <div className="flex items-center">
                                                        <span className={hasGold ? 'text-yellow-400' : 'text-red-400'}>{option.goldCost}</span>
                                                        <img src={coinImageUrl} className="w-3 h-3 ml-1 object-contain" alt="gold"/>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between"><span>Энергия:</span> <span className="text-blue-400">{option.energyCost} ⚡</span></div>
                                                <div className="flex justify-between"><span>Время:</span> <span>{option.timeSeconds} сек</span></div>
                                                <div className="flex justify-between"><span>Урон:</span> <span className="text-red-400">{option.damage}</span></div>
                                            </div>
                                            <button 
                                                onClick={() => handleExplode(option)}
                                                disabled={!canExplode}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
                                            >
                                                Установить ({option.amount} шт.)
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-400 text-center">Это здание нельзя взорвать известными способами.</p>
                            )}
                        </div>
                    </div>
                  ) : (
                    <div className="p-4">
                        <button onClick={() => setShowProtectionMenu(false)} className="mb-4 text-blue-400 hover:text-blue-300 text-sm flex items-center">
                             ← Назад
                        </button>
                        <h3 className="text-lg font-bold text-white mb-4 text-center">Защитить здание</h3>
                        
                        <div className="flex flex-col space-y-3">
                            {PROTECTION_OPTIONS.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleApplyProtection(option.cost, option.duration)}
                                    disabled={playerRubies < option.cost}
                                    className="bg-gray-700 hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-3 rounded-lg border border-gray-600 flex items-center justify-between transition-colors"
                                >
                                    <div className="flex items-center font-bold">
                                        <img src={rubyImageUrl} alt="Ruby" className="w-6 h-6 mr-2 object-contain" />
                                        <span className="text-xl text-pink-400">{option.cost}</span>
                                    </div>
                                    <span className="text-lg font-semibold">{option.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-center text-gray-500">Защищенные здания нельзя взорвать.</p>
                    </div>
                  )}
              </div>
          </div>
      )}

      {/* MARKET MODAL ... */}
      {showMarketModal && !authMode && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowMarketModal(false)}>
               <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl border border-gray-600 h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
                   <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <TradeIcon className={`w-8 h-8 mr-3 ${marketType === 'military' ? 'text-red-500' : 'text-green-400'}`}/>
                            {marketType === 'military' ? 'Военный рынок' : 'Рынок'}
                        </h2>
                        <button onClick={() => setShowMarketModal(false)} className="text-gray-400 hover:text-white transition-colors">
                            <CloseIcon className="w-8 h-8" />
                        </button>
                   </div>
                   
                   <div className="flex space-x-1 mb-4 border-b border-gray-700">
                        <button 
                             onClick={() => setActiveMarketTab('buy')}
                             className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeMarketTab === 'buy' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                        >
                            Покупка
                        </button>
                        <button 
                             onClick={() => setActiveMarketTab('sell')}
                             className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeMarketTab === 'sell' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                        >
                            Продажа
                        </button>
                   </div>

                   <div className="flex-grow overflow-hidden flex flex-col">
                        {activeMarketTab === 'buy' ? (
                            <div className="overflow-y-auto h-full p-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {marketListings.filter(l => marketType === 'military' ? MILITARY_ITEM_IDS.includes(l.resourceId) : true).length === 0 ? (
                                        <p className="col-span-3 text-center text-gray-500 mt-10">Предложений на рынке пока нет.</p>
                                    ) : (
                                        marketListings
                                          .filter(l => marketType === 'military' ? MILITARY_ITEM_IDS.includes(l.resourceId) : true)
                                          .map(listing => {
                                            const item = itemData.find(i => i.id === listing.resourceId);
                                            if (!item) return null;
                                            const isOwn = listing.isPlayer;

                                            return (
                                                <div key={listing.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex flex-col relative">
                                                    <div className="flex items-center mb-3">
                                                        <div className="w-12 h-12 bg-gray-800 rounded p-1 mr-3 shrink-0">
                                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain"/>
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="font-bold text-white truncate">{item.name}</p>
                                                            <p className="text-sm text-gray-400">Продавец: <span className="text-blue-300">{listing.sellerName}</span></p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded mb-3">
                                                        <span className="text-sm text-gray-300">Кол-во: <span className="text-white font-bold">{listing.amount}</span></span>
                                                        <div className="flex items-center font-bold">
                                                            <span className={listing.currency === 'coins' ? 'text-yellow-400' : 'text-pink-400'}>{listing.price.toLocaleString()}</span>
                                                            {listing.currency === 'coins' ? (
                                                                <img src={coinImageUrl} className="w-4 h-4 ml-1" alt="C"/>
                                                            ) : (
                                                                <img src={rubyImageUrl} className="w-4 h-4 ml-1" alt="R"/>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isOwn ? (
                                                        <button 
                                                            onClick={() => handleCancelListing(listing)}
                                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-sm"
                                                        >
                                                            Снять с продажи
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleBuyMarketItem(listing)}
                                                            className={`w-full font-bold py-2 rounded text-sm ${
                                                                (listing.currency === 'coins' && playerGold < listing.price) || (listing.currency === 'rubies' && playerRubies < listing.price)
                                                                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                            }`}
                                                            disabled={(listing.currency === 'coins' && playerGold < listing.price) || (listing.currency === 'rubies' && playerRubies < listing.price)}
                                                        >
                                                            Купить
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col md:flex-row gap-4 overflow-hidden">
                                <div className="w-full md:w-1/2 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                                    <h3 className="text-sm text-gray-400 mb-2 uppercase font-bold">Ваш инвентарь</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(inventory).map(([idStr, val]) => {
                                            const amount = val as number;
                                            const id = parseInt(idStr);
                                            if (amount <= 0) return null;
                                            
                                            if (marketType === 'military' && !MILITARY_ITEM_IDS.includes(id)) return null;

                                            const item = itemData.find(i => i.id === id);
                                            const isSelected = sellItemSelection.itemId === id;
                                            
                                            return (
                                                <div 
                                                    key={id} 
                                                    onClick={() => setSellItemSelection(prev => ({ ...prev, itemId: id, amount: 1 }))}
                                                    className={`bg-gray-800 p-2 rounded cursor-pointer border ${isSelected ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-600 hover:border-gray-400'} flex flex-col items-center relative`}
                                                >
                                                    <div className="w-10 h-10 mb-1">
                                                        {item && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain"/>
                                                    </div>
                                                    <span className="text-xs text-white absolute top-0 right-0 bg-gray-900 px-1 rounded-bl">{amount}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {marketType === 'military' && Object.keys(inventory).filter(id => MILITARY_ITEM_IDS.includes(parseInt(id)) && (inventory[parseInt(id)] || 0) > 0).length === 0 && (
                                        <p className="text-center text-gray-500 mt-10 text-sm">Нет военных товаров для продажи.</p>
                                    )}
                                </div>
                                <div className="w-full md:w-1/2 bg-gray-700/30 p-4 rounded border border-gray-600 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2">Параметры продажи</h3>
                                    
                                    {sellItemSelection.itemId ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                                                     <img src={itemData.find(i => i.id === sellItemSelection.itemId)?.imageUrl} className="w-12 h-12 object-contain"/>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-lg">{itemData.find(i => i.id === sellItemSelection.itemId)?.name}</p>
                                                    <p className="text-sm text-gray-400">В наличии: <span className="text-white">{inventory[sellItemSelection.itemId] || 0}</span></p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">Количество</label>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    max={inventory[sellItemSelection.itemId]}
                                                    value={sellItemSelection.amount}
                                                    onChange={(e) => setSellItemSelection(prev => ({...prev, amount: Math.max(1, Math.min(inventory[sellItemSelection.itemId!] || 1, parseInt(e.target.value) || 1))}))}
                                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-300 mb-1">Цена</label>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value={sellItemSelection.price}
                                                        onChange={(e) => setSellItemSelection(prev => ({...prev, price: Math.max(1, parseInt(e.target.value) || 1)}))}
                                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                                    />
                                                </div>
                                                <div>
                                                     <label className="block text-sm text-gray-300 mb-1">Валюта</label>
                                                     <div className="flex space-x-2">
                                                         <button 
                                                             onClick={() => setSellItemSelection(prev => ({...prev, currency: 'coins'}))}
                                                             className={`flex-1 p-2 rounded flex justify-center items-center border ${sellItemSelection.currency === 'coins' ? 'bg-yellow-900/50 border-yellow-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
                                                         >
                                                             <img src={coinImageUrl} className="w-5 h-5"/>
                                                         </button>
                                                         <button 
                                                             onClick={() => setSellItemSelection(prev => ({...prev, currency: 'rubies'}))}
                                                             className={`flex-1 p-2 rounded flex justify-center items-center border ${sellItemSelection.currency === 'rubies' ? 'bg-pink-900/50 border-pink-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
                                                         >
                                                             <img src={rubyImageUrl} className="w-5 h-5"/>
                                                         </button>
                                                     </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button 
                                                    onClick={handleCreateMarketListing}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-lg shadow-lg"
                                                >
                                                    Выставить за {sellItemSelection.price} {sellItemSelection.currency === 'coins' ? 'монет' : 'рубинов'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <InventoryIcon className="w-16 h-16 mb-4 opacity-30" />
                                            <p className="text-center">Выберите предмет из инвентаря слева, чтобы продать его.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                   </div>
               </div>
          </div>
      )}

      {/* Build Menu */}
      {buildMenu.visible && !authMode && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-40" onClick={() => setBuildMenu({ visible: false, x: 0, y: 0 })}>
              <div className="bg-gray-900/90 w-[700px] h-[500px] rounded-xl border border-gray-500/50 shadow-2xl backdrop-blur-xl flex flex-col transform transition-all" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-4 border-b border-gray-700/50 bg-gray-800/40 rounded-t-xl">
                      <h2 className="text-xl font-bold text-white flex items-center">
                          <span className="mr-2">🛠️</span>
                          Меню строительства
                      </h2>
                      <button onClick={() => setBuildMenu({ visible: false, x: 0, y: 0 })} className="text-gray-400 hover:text-white transition-colors">
                          <CloseIcon className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="flex flex-grow overflow-hidden">
                      <div className="w-1/4 bg-gray-900/30 p-2 border-r border-gray-700/50 overflow-y-auto">
                          {buildTabs.map(tab => (
                              <button
                                  key={tab.name}
                                  onClick={() => setActiveBuildTab(tab.name)}
                                  className={`w-full flex items-center space-x-3 p-3 my-1 rounded-lg text-sm font-medium transition-all ${activeBuildTab === tab.name ? 'bg-blue-600/80 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
                              >
                                {tab.icon}
                                <span>{tab.name}</span>
                              </button>
                          ))}
                      </div>
                      <div className="w-3/4 p-4 overflow-y-auto bg-gray-800/20">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {buildingsInCurrentTab.map(building => (
                              <div key={building.id} onClick={() => handleSelectBuildingFromMenu(building)} className="bg-gray-700/30 border border-gray-600/30 p-3 rounded-xl text-center flex flex-col justify-between cursor-pointer hover:bg-gray-600/50 hover:border-gray-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
                                  <div>
                                    <div className="w-full h-24 bg-gray-800/50 rounded-lg mb-3 flex items-center justify-center border border-gray-700/30">
                                      <img src={building.imageUrl} alt={building.name} className="max-w-full max-h-full object-contain p-2"/>
                                    </div>
                                    <p className="text-sm font-bold text-gray-100 line-clamp-1">{building.name}</p>
                                    <div className="flex items-center justify-center text-xs text-yellow-400 mt-2 bg-black/30 rounded py-1 px-2 mx-auto w-max">
                                      <img src={coinImageUrl} alt="Gold" className="w-3 h-3 mr-1 object-contain" />
                                      <span>{building.price?.toLocaleString() || 0}</span>
                                    </div>
                                  </div>
                              </div>
                            ))}
                            {buildingsInCurrentTab.length === 0 && (
                                <div className="col-span-3 flex flex-col items-center justify-center h-full text-gray-500 mt-10">
                                    <p className="text-lg">Пусто...</p>
                                    <p className="text-sm">Здания для этой категории еще не добавлены.</p>
                                </div>
                            )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Build Confirmation */}
      {buildConfirmation.visible && buildConfirmation.building && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setBuildConfirmation({ ...buildConfirmation, visible: false })}>
              <div className="bg-gray-800/90 w-96 rounded-xl border border-gray-600 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-4 border-b border-gray-700">
                      <h2 className="text-xl font-bold text-white">{buildConfirmation.building.name}</h2>
                      <button onClick={() => setBuildConfirmation({ ...buildConfirmation, visible: false })} className="text-gray-400 hover:text-white">
                          <CloseIcon className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="p-4">
                      <div className="w-full h-40 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center border border-gray-600/30">
                          <img src={buildConfirmation.building.imageUrl} alt={buildConfirmation.building.name} className="max-w-full max-h-full object-contain"/>
                      </div>
                      <div className="space-y-2 text-sm bg-gray-900/30 p-3 rounded-lg border border-gray-700/30">
                          <div className="flex justify-between"><span className="text-gray-400">Прочность:</span> <span className="text-white font-semibold">{buildConfirmation.building.stats.durability}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Время строительства:</span> <span className="text-white font-semibold">{buildConfirmation.building.stats.constructionTimeSeconds} секунд</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Даёт населения:</span> <span className="text-green-400 font-semibold">+{buildConfirmation.building.stats.populationBonus}</span></div>
                          {buildConfirmation.building.constructionRequirements.population && (
                            <div className="flex justify-between"><span className="text-gray-400">Требует населения:</span> <span className="text-red-400 font-semibold">{buildConfirmation.building.constructionRequirements.population}</span></div>
                          )}
                          {buildConfirmation.building.constructionRequirements.resources && buildConfirmation.building.constructionRequirements.resources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-700/50">
                                  <div className="text-gray-400 mb-1 font-semibold">Требуемые ресурсы:</div>
                                  <div className="flex flex-wrap gap-2">
                                      {buildConfirmation.building.constructionRequirements.resources.map(req => (
                                          <span key={req.id} className={`px-2 py-1 rounded text-xs border ${ (inventory[req.id] || 0) >= (req.amount || 0) ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'}`}>
                                              {req.name}: {req.amount}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                      <button onClick={handleConfirmBuild} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                          <img src={coinImageUrl} alt="Gold" className="w-5 h-5 mr-2 object-contain" />
                          {buildConfirmation.building.price?.toLocaleString() || 0} Построить
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showInventory && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowInventory(false)}>
               <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-3xl border border-gray-600 h-[500px] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <InventoryIcon className="w-8 h-8 mr-3 text-yellow-400"/>
                            Инвентарь
                        </h2>
                        <button onClick={() => setShowInventory(false)} className="text-gray-400 hover:text-white transition-colors">
                            <CloseIcon className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-grow">
                        {Object.keys(inventory).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <InventoryIcon className="w-16 h-16 mb-4 opacity-50"/>
                                <p>Ваш инвентарь пуст.</p>
                                <p className="text-sm mt-2">Попробуйте срубить дерево!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                                {Object.entries(inventory).map(([idStr, val]) => {
                                    const amount = val as number;
                                    const id = parseInt(idStr);
                                    if (amount <= 0) return null;
                                    const item = itemData.find(i => i.id === id);
                                    return (
                                        <div key={id} className="bg-gray-700/50 p-3 rounded-lg flex flex-col items-center relative border border-gray-600 hover:border-blue-400 transition-colors">
                                            <div className="w-16 h-16 mb-2">
                                                {item ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain"/>
                                                ) : (
                                                    <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center text-xs">?</div>
                                                )}
                                            </div>
                                            <p className="text-sm text-center font-medium text-gray-200 line-clamp-1">{item ? item.name : `Item #${id}`}</p>
                                            <span className="absolute top-1 right-1 bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded border border-gray-600">
                                                {amount}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
               </div>
          </div>
      )}

      {showShop && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowShop(false)}>
               <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl border border-gray-600 h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <ShoppingCartIcon className="w-8 h-8 mr-3 text-pink-400"/>
                            Магазин ресурсов
                        </h2>
                        <div className="flex items-center">
                            <button 
                                onClick={() => { setExchangeAmount(1); setShowExchangeModal(true); }}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg border border-green-500 mr-4 text-sm flex items-center transition-colors"
                            >
                                <span className="mr-1">↻</span> Обменять
                            </button>
                            <div className="flex items-center bg-gray-900 px-4 py-2 rounded-lg border border-pink-500/50">
                                <span className="text-gray-400 mr-2">Ваши рубины:</span>
                                <img src={rubyImageUrl} alt="Ruby" className="w-5 h-5 object-contain mr-1"/>
                                <span className="text-white font-bold">{playerRubies}</span>
                            </div>
                            <button onClick={() => setShowShop(false)} className="text-gray-400 hover:text-white transition-colors ml-4">
                                <CloseIcon className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-grow p-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {itemData.filter(item => item.rubyPackQuantity).map(item => (
                                <div key={item.id} className="bg-gray-700/50 p-3 rounded-lg flex flex-col items-center relative border border-gray-600 hover:border-pink-400 transition-colors">
                                    <div className="w-16 h-16 mb-2">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain"/>
                                    </div>
                                    <p className="text-sm text-center font-medium text-gray-200 line-clamp-1 mb-1">{item.name}</p>
                                    <div className="mt-auto w-full">
                                        <div className="bg-gray-800 rounded p-1 mb-2 text-center text-xs text-gray-400">
                                            x{item.rubyPackQuantity} за 1 <span className="text-pink-400">♦</span>
                                        </div>
                                        <button 
                                            onClick={() => handleBuyShopItem(item)}
                                            disabled={playerRubies < 1}
                                            className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-1.5 px-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            Купить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
               </div>
          </div>
      )}
      
      {showExchangeModal && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-md" onClick={() => setShowExchangeModal(false)}>
                 <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-96 border border-gray-600" onClick={e => e.stopPropagation()}>
                     <h3 className="text-xl font-bold text-white mb-4 text-center">Обмен рубинов</h3>
                     <div className="flex items-center justify-center mb-6 space-x-4">
                        <div className="flex flex-col items-center">
                            <img src={rubyImageUrl} className="w-12 h-12 mb-2 object-contain" alt="Ruby"/>
                            <input 
                                type="number" 
                                min="1" 
                                max={playerRubies} 
                                value={exchangeAmount} 
                                onChange={e => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-20 bg-gray-700 text-white text-center rounded border border-gray-600 p-1"
                            />
                        </div>
                        <div className="text-2xl text-gray-400">➔</div>
                        <div className="flex flex-col items-center">
                            <img src={coinImageUrl} className="w-12 h-12 mb-2 object-contain" alt="Coin"/>
                            <span className="text-yellow-400 font-bold text-xl">{(exchangeAmount * 7777).toLocaleString()}</span>
                        </div>
                     </div>
                     <p className="text-gray-400 text-sm text-center mb-6">Курс: 1 Рубин = 7 777 Монет</p>
                     <div className="flex space-x-2">
                         <button onClick={() => setShowExchangeModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded">Отмена</button>
                         <button onClick={handleRubyExchange} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold">Обменять</button>
                     </div>
                 </div>
            </div>
      )}

      {showMap && !authMode && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowMap(false)}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-3xl border border-gray-600 relative flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <MapIcon className="w-8 h-8 mr-3 text-blue-400"/>
                        Карта Мира
                    </h2>
                    <button onClick={() => setShowMap(false)} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                </div>
                <div className="flex-grow flex justify-center p-4">
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${ZONES_X}, 1fr)` }}>
                        {Array.from({ length: ZONES_X * ZONES_Y }).map((_, index) => {
                            const row = Math.floor(index / ZONES_X);
                            const col = index % ZONES_X;
                            
                            const hasTownHall = townHallLocation && 
                                                Math.floor(townHallLocation.x / ZONE_SIZE) === col && 
                                                Math.floor(townHallLocation.y / ZONE_SIZE) === row;

                            const clanCastle = placedBuildings.find(b => {
                                const info = buildingData.find(i => i.id === b.buildingId);
                                return info && info.category === 'Клан' && 
                                       Math.floor(b.x / ZONE_SIZE) === col && 
                                       Math.floor(b.y / ZONE_SIZE) === row;
                            });

                            return (
                                <div 
                                    key={index} 
                                    className={`w-24 h-24 border border-gray-600 flex flex-col items-center justify-center relative group hover:border-white transition-colors ${clanCastle ? 'bg-red-900/40' : 'bg-gray-900'}`}
                                    title={`Зона ${col+1}-${row+1}`}
                                >
                                    <span className="absolute top-1 left-1 text-[10px] text-gray-500">{col+1}-{row+1}</span>
                                    
                                    {hasTownHall && (
                                        <span className="text-3xl drop-shadow-md animate-pulse" title="Ваш город">⭐</span>
                                    )}
                                    
                                    {clanCastle && (
                                        <div className="mt-1 text-xs flex flex-col items-center text-red-400">
                                            <ClanIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                    Звездочкой отмечено ваше главное здание. Замки обозначают владения кланов.
                </div>
            </div>
        </div>
      )}
      
      {showShoutModal && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowShoutModal(false)}>
              <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md border border-gray-600 relative" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                      <h2 className="text-xl font-bold text-white">Отправь во все чаты</h2>
                      <button onClick={() => setShowShoutModal(false)} className="text-gray-400 hover:text-white transition-colors">
                          <CloseIcon className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="bg-gray-900/80 p-4 rounded-lg mb-4 border border-blue-500/30">
                      <p className="text-blue-400 font-medium break-words">{chatInput}</p>
                  </div>

                  <div className="text-sm text-gray-400 mb-4 flex flex-col items-center space-y-1">
                      <div className={`flex items-center space-x-1 ${playerEnergy < SHOUT_COST_ENERGY ? 'text-red-400' : 'text-blue-300'}`}>
                          <span className="text-yellow-500 font-bold">⚡</span>
                          <span>Стоимость энергии: {SHOUT_COST_ENERGY}</span>
                      </div>
                       <div className={`flex items-center space-x-1 ${playerGold < SHOUT_COST_GOLD ? 'text-red-400' : 'text-yellow-300'}`}>
                          <img src={coinImageUrl} className="w-4 h-4 object-contain" alt="coin"/>
                          <span>Стоимость монет: {SHOUT_COST_GOLD}</span>
                      </div>
                  </div>

                  <button 
                      onClick={handleConfirmShout}
                      disabled={playerGold < SHOUT_COST_GOLD || playerEnergy < SHOUT_COST_ENERGY}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                      {SHOUT_COST_ENERGY} энергии монеты {SHOUT_COST_GOLD} Отправить
                  </button>
              </div>
          </div>
      )}

      {showProfileModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl border border-gray-600 relative h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Личный кабинет</h2>
                    <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-4 overflow-x-auto border-b border-gray-700 pb-2">
                    {[
                        { id: 'info', label: 'Информация' },
                        { id: 'clan', label: 'Клан' },
                        { id: 'history', label: 'История' },
                        { id: 'friends', label: 'Друзья' },
                        { id: 'mail', label: 'Письма' },
                        { id: 'private', label: 'Приваты' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveProfileTab(tab.id as ProfileTab)}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeProfileTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* Tab Content */}
                <div className="flex-grow overflow-y-auto p-2">
                     {activeProfileTab === 'info' && (
                         <div className="flex flex-col items-center max-w-md mx-auto">
                             <div className="flex flex-col items-center mb-6">
                                 <div className="relative">
                                     <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                     <label htmlFor="avatarUpload" className="cursor-pointer group">
                                         <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden group-hover:border-blue-500 transition-all">
                                             {playerAvatar ? (
                                                 <img src={playerAvatar} alt="Player Avatar" className="w-full h-full object-cover" />
                                             ) : (
                                                 <UserIcon className="w-16 h-16 text-gray-500" />
                                             )}
                                         </div>
                                          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                             <span className="text-white text-xs font-bold">Сменить</span>
                                         </div>
                                     </label>
                                 </div>
                                 {currentUser !== 'guest' && <p className="text-gray-500 text-sm mt-2">Логин: {currentUser}</p>}
                             </div>
                             
                             <div className="mb-6 w-full">
                                 <label className="block text-sm font-medium text-gray-300 mb-2">Сменить имя (стоимость: 500 золота)</label>
                                 <div className="flex space-x-2">
                                     <input 
                                         type="text"
                                         value={tempPlayerName}
                                         onChange={(e) => setTempPlayerName(e.target.value)}
                                         className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                     />
                                     <button onClick={handleNameChange} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                                         Сменить
                                     </button>
                                 </div>
                             </div>
             
                             <div className="mb-6 w-full">
                                  <label className="block text-sm font-medium text-gray-300 mb-2">Пол</label>
                                  <div className="flex space-x-4">
                                     <button 
                                         onClick={() => setPlayerGender('male')} 
                                         className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all flex items-center justify-center space-x-2 ${playerGender === 'male' ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                     >
                                         <span>Парень</span>
                                     </button>
                                     <button 
                                         onClick={() => setPlayerGender('female')} 
                                         className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all flex items-center justify-center space-x-2 ${playerGender === 'female' ? 'bg-pink-600 text-white ring-2 ring-pink-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                     >
                                        <span>Девушка</span>
                                     </button>
                                  </div>
                             </div>
                             
                             <div className="text-center text-gray-400 bg-gray-900/50 p-3 rounded-lg w-full mb-4">
                                 <p className="font-bold text-lg">Лимит зданий</p>
                                 <p className="text-2xl">{playerBuildingsCount} / {maxBuildings}</p>
                             </div>

                             <button 
                                onClick={saveCurrentData}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors mb-2"
                            >
                                Сохранить игру
                            </button>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                            >
                                Выйти из игры
                            </button>
                         </div>
                     )}
                     
                     {activeProfileTab === 'clan' && (
                         <div className="h-full">
                             {isInClan ? (
                                 <div className="flex flex-col items-center h-full">
                                     {clans.find(c => c.id === playerClanId)?.avatarUrl ? (
                                         <img src={clans.find(c => c.id === playerClanId)!.avatarUrl!} className="w-32 h-32 rounded-lg border-2 border-yellow-500 mb-4 object-cover" />
                                     ) : (
                                         <ClanIcon className="w-32 h-32 mb-4 text-yellow-500 opacity-80" />
                                     )}
                                     <h2 className="text-3xl font-bold text-yellow-400 mb-2">{clans.find(c => c.id === playerClanId)?.name}</h2>
                                     <p className="text-gray-300 mb-2 italic">"{clans.find(c => c.id === playerClanId)?.description}"</p>
                                     <p className="text-sm text-gray-400 mb-6">Лидер: {clans.find(c => c.id === playerClanId)?.leaderName} • Участников: {clans.find(c => c.id === playerClanId)?.membersCount}</p>
                                     
                                     {showLeaveClanConfirmation ? (
                                        <div className="flex flex-col items-center bg-gray-900/50 p-4 rounded-lg border border-red-500/50">
                                            <p className="text-red-400 mb-3 font-bold text-lg">Вы уверены?</p>
                                            <div className="flex space-x-4">
                                                <button onClick={handleConfirmLeaveClan} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded transition-colors">Да</button>
                                                <button onClick={() => setShowLeaveClanConfirmation(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded transition-colors">Нет</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={handleLeaveClan} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded">Покинуть клан</button>
                                    )}
                                 </div>
                             ) : showCreateClanMode ? (
                                 <div className="max-w-md mx-auto h-full flex flex-col">
                                     <button onClick={() => setShowCreateClanMode(false)} className="text-sm text-blue-400 hover:text-blue-300 mb-4 text-left">← Назад к поиску</button>
                                     <h3 className="text-xl font-bold text-white mb-4 text-center">Создание Клана</h3>
                                     
                                     <div className="flex flex-col items-center mb-4">
                                         <div className="relative">
                                             <input type="file" id="clanAvatar" className="hidden" accept="image/*" onChange={handleClanAvatarChange} />
                                             <label htmlFor="clanAvatar" className="cursor-pointer group">
                                                 <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden group-hover:border-blue-500 transition-all">
                                                     {newClanAvatar ? (
                                                         <img src={newClanAvatar} alt="Clan Logo" className="w-full h-full object-cover" />
                                                     ) : (
                                                         <span className="text-xs text-gray-400 text-center px-2">Загрузить лого</span>
                                                     )}
                                                 </div>
                                             </label>
                                         </div>
                                     </div>

                                     <div className="space-y-4">
                                         <div>
                                             <label className="block text-sm text-gray-300 mb-1">Название клана</label>
                                             <input 
                                                 type="text" 
                                                 value={newClanName}
                                                 onChange={(e) => setNewClanName(e.target.value)}
                                                 className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                                 placeholder="Например: Неудержимые"
                                             />
                                         </div>
                                         <div>
                                             <label className="block text-sm text-gray-300 mb-1">Описание (макс 500 символов)</label>
                                             <textarea 
                                                 value={newClanDesc}
                                                 onChange={(e) => setNewClanDesc(e.target.value.slice(0, 500))}
                                                 className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24 resize-none"
                                                 placeholder="Расскажите о своем клане..."
                                             />
                                             <div className="text-right text-xs text-gray-500">{newClanDesc.length}/500</div>
                                         </div>
                                         <button onClick={handleCreateClan} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">
                                             Создать клан
                                         </button>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex flex-col h-full">
                                     <div className="flex mb-6 space-x-4 items-end">
                                        <div className="flex-grow">
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Поиск клана</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={clanSearchTerm}
                                                    onChange={(e) => setClanSearchTerm(e.target.value)}
                                                    placeholder="Название клана..."
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <SearchIcon className="h-5 w-5 text-gray-500" />
                                                </div>
                                            </div>
                                        </div>
                                     </div>

                                     {hasClanCastle && (
                                         <button 
                                             onClick={() => setShowCreateClanMode(true)}
                                             className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded mb-6 flex items-center justify-center"
                                         >
                                             <span className="mr-2">+</span> Создать свой клан
                                         </button>
                                     )}
                                     
                                     <h3 className="text-lg font-bold text-gray-300 mb-2">Результаты поиска</h3>
                                     <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                                         {clans.filter(c => c.name.toLowerCase().includes(clanSearchTerm.toLowerCase())).length > 0 ? (
                                             clans.filter(c => c.name.toLowerCase().includes(clanSearchTerm.toLowerCase()))
                                         .map(clan => (
                                             <div key={clan.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                                                 <div className="flex items-center space-x-3">
                                                     {clan.avatarUrl ? (
                                                         <img src={clan.avatarUrl} className="w-10 h-10 rounded bg-gray-800 object-cover" />
                                                     ) : (
                                                         <ClanIcon className="w-10 h-10 text-gray-500" />
                                                     )}
                                                     <div>
                                                         <p className="font-bold text-white">{clan.name}</p>
                                                         <p className="text-xs text-gray-400">{clan.membersCount} уч.</p>
                                                     </div>
                                                 </div>
                                                 <button 
                                                     onClick={() => handleJoinClan(clan.id)}
                                                     className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded"
                                                 >
                                                     Вступить
                                                 </button>
                                             </div>
                                         ))
                                         ) : (
                                             <p className="text-gray-500 text-center mt-4">Кланы не найдены.</p>
                                         )}
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}

                     {activeProfileTab === 'history' && (
                         <div className="space-y-2">
                             {playerHistory.length === 0 ? (
                                 <p className="text-gray-500 text-center mt-10">История пуста.</p>
                             ) : (
                                 playerHistory.map(entry => (
                                     <div key={entry.id} className="bg-gray-900/30 p-2 rounded text-sm border-l-2 border-blue-500">
                                         <p className="text-gray-300">{entry.message}</p>
                                         <p className="text-[10px] text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                                     </div>
                                 ))
                             )}
                         </div>
                     )}

                     {activeProfileTab === 'friends' && (
                         <div className="space-y-2">
                             {friends.length === 0 ? (
                                 <p className="text-gray-500 text-center mt-10">Список друзей пуст.</p>
                             ) : (
                                 friends.map((friend, idx) => (
                                     <div key={idx} className="bg-gray-900/30 p-3 rounded flex justify-between items-center">
                                         <span className="font-bold text-white">{friend.name}</span>
                                         <button 
                                             onClick={() => handleRemoveFriend(friend.name)}
                                             className="text-red-400 hover:text-red-300 text-xs underline"
                                         >
                                             Удалить
                                         </button>
                                     </div>
                                 ))
                             )}
                         </div>
                     )}

                     {(activeProfileTab === 'mail' || activeProfileTab === 'private') && (
                         <div className="flex items-center justify-center h-full text-gray-500">
                             <p>Раздел в разработке...</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { 
            isDraggingRef.current = false;
            setTooltip({ visible: false, x: 0, y: 0, content: null });
            setHoveredTile(null);
        }}
        onWheel={handleWheel}
        className={`w-full h-full cursor-grab active:cursor-grabbing`}
      />
      
      {!authMode && (
      <>
        {/* Top Left User Info */}
        <div className="absolute top-5 left-5 bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl shadow-lg w-64 border border-gray-700 pointer-events-auto">
            <button onClick={() => { setTempPlayerName(playerName); setShowProfileModal(true); }} className="text-xl font-bold text-yellow-300 mb-1 hover:text-yellow-200 transition-colors w-full text-left truncate flex items-center">
                {playerAvatar && <img src={playerAvatar} className="w-6 h-6 rounded-full mr-2 object-cover" />}
                {playerName}
            </button>
             <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center space-x-2">
                        <img src={level1IconUrl} alt="Lvl" className="w-5 h-5"/>
                        <span className="text-white font-bold">{playerLevel}</span>
                    </div>
                     <div className="flex items-center space-x-1" title="Слава">
                        <img src={gloryImageUrl} alt="Glory" className="w-5 h-5"/>
                        <span className="text-blue-300 font-bold text-sm">{playerGlory} / {gloryToNextLevel}</span>
                    </div>
                </div>
                 <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                </div>
                 <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Репутация:</span>
                    <span className={playerReputation >= 0 ? 'text-green-400' : 'text-red-400'}>{playerReputation}</span>
                </div>
            </div>

            {/* Resources Top Bar */}
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-700 pointer-events-auto">
                <div className="flex items-center space-x-2" title="Золото">
                    <img src={coinImageUrl} alt="Gold" className="w-6 h-6 object-contain"/>
                    <div className="flex flex-col leading-tight">
                        <span className="text-yellow-400 font-bold">{Math.floor(playerGold).toLocaleString()}</span>
                         <span className="text-[10px] text-gray-500">/{goldCapacity.toLocaleString()}</span>
                    </div>
                </div>
                 <div className="flex items-center space-x-2 border-l border-gray-600 pl-4" title="Рубины">
                    <img src={rubyImageUrl} alt="Ruby" className="w-6 h-6 object-contain"/>
                    <span className="text-pink-400 font-bold">{playerRubies}</span>
                    <button onClick={() => setShowShop(true)} className="ml-1 bg-green-600 text-white text-[10px] px-1.5 rounded hover:bg-green-500">+</button>
                </div>
                 <div className="flex items-center space-x-2 border-l border-gray-600 pl-4" title="Энергия">
                    <EnergyIcon className="w-6 h-6 text-yellow-500"/>
                    <div className="flex flex-col leading-tight">
                        <span className="text-white font-bold">{playerEnergy}</span>
                        <span className="text-[10px] text-gray-500">/{maxEnergy}</span>
                    </div>
                </div>
                 <div className="flex items-center space-x-2 border-l border-gray-600 pl-4" title="Население">
                    <img src={populationImageUrl} alt="Pop" className="w-6 h-6 object-contain"/>
                    <div className="flex flex-col leading-tight">
                        <span className="text-white font-bold">{currentPopulation}</span>
                        <span className="text-[10px] text-gray-500">/{maxPopulation}</span>
                    </div>
                </div>
            </div>

            {/* Right Action Buttons */}
            <div className="absolute top-5 right-5 flex flex-col space-y-3 pointer-events-auto">
                <button onClick={() => setShowShop(true)} className="w-12 h-12 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center shadow-lg border-2 border-pink-400 transition-transform hover:scale-105" title="Магазин">
                    <ShoppingCartIcon className="w-6 h-6 text-white"/>
                </button>
                <button onClick={() => setShowInventory(true)} className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-400 transition-transform hover:scale-105" title="Инвентарь">
                    <InventoryIcon className="w-6 h-6 text-white"/>
                </button>
                <button onClick={() => setShowMap(true)} className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-400 transition-transform hover